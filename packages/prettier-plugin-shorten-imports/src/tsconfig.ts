import fs from 'fs-extra';
import path from 'path';
import { parse, ParseError } from 'jsonc-parser';
import { createMatchPath } from 'tsconfig-paths';
import {
  escapeRegex,
  hasKnownExtension,
  stripKnownExtension,
  toPosixPath,
} from './utils';

type PathsConfig = Record<string, string[]>;

export type MatchPath = ReturnType<typeof createMatchPath>;

export interface AliasMapping {
  aliasPattern: string;
  aliasWildcardCount: number;
  targetPattern: string;
  targetWildcardCount: number;
  targetHasExtension: boolean;
  matcher: RegExp;
}

export interface ConfigContext {
  configPath: string;
  configDir: string;
  baseUrl: string;
  paths: PathsConfig;
  matchPath: MatchPath;
  aliasMappings: AliasMapping[];
  projectRoot: string;
}

// Cache nearest config paths and parsed contexts for repeated lookups.
// The cache avoids re-reading tsconfig files for each formatted file.
const configPathCache = new Map<string, string | null>();
const configCache = new Map<string, ConfigContext | null>();
// Cache merged compilerOptions so every file in the same project reuses the
// resolved extends chain instead of reparsing it.
const compilerOptionsCache = new Map<string, ResolvedCompilerOptions | null>();

interface RawCompilerOptions {
  baseUrl?: string;
  paths?: Record<string, string[] | string>;
}

interface RawConfigFile {
  extends?: string | string[];
  compilerOptions?: RawCompilerOptions;
}

interface ResolvedCompilerOptions {
  baseUrl?: string;
  paths: PathsConfig | null;
}

export function getConfigContext(filePath: string): ConfigContext | null {
  // Build alias matching context from the nearest config file. The context
  // holds baseUrl, paths mappings, and reverse alias matchers.
  const fileDir = path.dirname(filePath);
  const configPath = findNearestConfigPath(fileDir);
  if (!configPath) {
    return null;
  }
  const cached = configCache.get(configPath);
  if (cached !== undefined) {
    return cached;
  }

  const configDir = path.dirname(configPath);
  const compilerOptions = resolveCompilerOptions(configPath);
  if (!compilerOptions) {
    configCache.set(configPath, null);
    return null;
  }
  const paths = compilerOptions.paths;

  if (!paths || Object.keys(paths).length === 0) {
    configCache.set(configPath, null);
    return null;
  }

  // If baseUrl is not set, treat the config directory as the base.
  const baseUrl = compilerOptions.baseUrl ?? configDir;
  const matchPath = createMatchPath(baseUrl, paths);
  const aliasMappings = buildAliasMappings(paths);

  const context: ConfigContext = {
    configPath,
    configDir,
    baseUrl,
    paths,
    matchPath,
    aliasMappings,
    projectRoot: configDir,
  };

  configCache.set(configPath, context);
  return context;
}

function findNearestConfigPath(startDir: string): string | null {
  // Prefer tsconfig.json over jsconfig.json at the same level.
  const cached = configPathCache.get(startDir);
  if (cached !== undefined) {
    return cached;
  }

  let currentDir = startDir;
  while (true) {
    const tsconfigPath = path.join(currentDir, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      configPathCache.set(startDir, tsconfigPath);
      return tsconfigPath;
    }

    const jsconfigPath = path.join(currentDir, 'jsconfig.json');
    if (fs.existsSync(jsconfigPath)) {
      configPathCache.set(startDir, jsconfigPath);
      return jsconfigPath;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  configPathCache.set(startDir, null);
  return null;
}

function readConfigFile(configPath: string): RawConfigFile | null {
  // Parse JSONC so tsconfig comments and trailing commas are supported.
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const errors: ParseError[] = [];
    const config = parse(raw, errors, { allowTrailingComma: true });
    if (errors.length > 0) {
      return null;
    }
    return config;
  } catch {
    return null;
  }
}

function normalizePaths(
  paths: Record<string, string[] | string> | undefined,
  baseUrl: string
): PathsConfig | null {
  // Normalize paths entries to { pattern: string[] }.
  if (!paths) {
    return null;
  }

  const entries = Object.entries(paths);
  if (entries.length === 0) {
    return null;
  }

  const normalized: PathsConfig = {};
  entries.forEach(([key, value]) => {
    const items = Array.isArray(value)
      ? value.filter((item) => typeof item === 'string')
      : typeof value === 'string'
        ? [value]
        : [];

    if (items.length > 0) {
      // Store absolute targets up front so inherited and local path entries can
      // be merged without losing the baseUrl each entry was defined against.
      normalized[key] = items.map((item) => path.resolve(baseUrl, item));
    }
  });

  return Object.keys(normalized).length > 0 ? normalized : null;
}

function buildAliasMappings(paths: PathsConfig): AliasMapping[] {
  // Precompute reverse mappings for alias generation from resolved files.
  // Each mapping provides a regex that can extract wildcard segments.
  const mappings: AliasMapping[] = [];

  Object.entries(paths).forEach(([aliasPattern, targetPatterns]) => {
    const aliasWildcardCount = countWildcards(aliasPattern);
    targetPatterns.forEach((targetPattern) => {
      const targetWildcardCount = countWildcards(targetPattern);
      if (aliasWildcardCount !== targetWildcardCount) {
        return;
      }

      // Convert the target pattern to an absolute, POSIX-normalized pattern.
      const absoluteTargetPattern = toPosixPath(targetPattern);
      const matcher = buildWildcardRegex(absoluteTargetPattern);
      mappings.push({
        aliasPattern,
        aliasWildcardCount,
        targetPattern: absoluteTargetPattern,
        targetWildcardCount,
        targetHasExtension: hasKnownExtension(absoluteTargetPattern),
        matcher,
      });
    });
  });

  return mappings;
}

function resolveCompilerOptions(
  configPath: string,
  seen = new Set<string>()
): ResolvedCompilerOptions | null {
  const cached = compilerOptionsCache.get(configPath);
  if (cached !== undefined) {
    return cached;
  }

  if (seen.has(configPath)) {
    return null;
  }

  const rawConfig = readConfigFile(configPath);
  if (!rawConfig) {
    compilerOptionsCache.set(configPath, null);
    return null;
  }

  const nextSeen = new Set(seen);
  nextSeen.add(configPath);

  let baseUrl: string | undefined;
  let paths: PathsConfig = {};

  // Resolve parents first so the nearest config can override them afterward.
  const extendedConfigPaths = resolveExtendedConfigPaths(
    rawConfig.extends,
    configPath
  );
  if (!extendedConfigPaths) {
    compilerOptionsCache.set(configPath, null);
    return null;
  }

  for (const extendedConfigPath of extendedConfigPaths) {
    const extendedOptions = resolveCompilerOptions(
      extendedConfigPath,
      nextSeen
    );
    if (!extendedOptions) {
      compilerOptionsCache.set(configPath, null);
      return null;
    }

    if (extendedOptions.baseUrl) {
      baseUrl = extendedOptions.baseUrl;
    }
    if (extendedOptions.paths) {
      // Later spreads let the closer parent override the more distant parent
      // when multiple extended configs define the same alias key.
      paths = {
        ...paths,
        ...extendedOptions.paths,
      };
    }
  }

  const configDir = path.dirname(configPath);
  const compilerOptions = rawConfig.compilerOptions ?? {};
  const localBaseUrl = resolveLocalBaseUrl(compilerOptions, configDir);
  if (localBaseUrl) {
    // The current config has the highest priority for baseUrl.
    baseUrl = localBaseUrl;
  }

  const localPaths = normalizePaths(
    compilerOptions.paths,
    localBaseUrl ?? configDir
  );
  if (localPaths) {
    // The current config has the highest priority for path aliases too.
    paths = {
      ...paths,
      ...localPaths,
    };
  }

  const resolved: ResolvedCompilerOptions = {
    baseUrl,
    paths: Object.keys(paths).length > 0 ? paths : null,
  };
  compilerOptionsCache.set(configPath, resolved);
  return resolved;
}

function resolveLocalBaseUrl(
  compilerOptions: RawCompilerOptions,
  configDir: string
): string | undefined {
  if (compilerOptions.baseUrl) {
    return path.resolve(configDir, compilerOptions.baseUrl);
  }

  if (compilerOptions.paths && Object.keys(compilerOptions.paths).length > 0) {
    return configDir;
  }

  return undefined;
}

function resolveExtendedConfigPaths(
  extendsValue: string | string[] | undefined,
  configPath: string
): string[] | null {
  if (!extendsValue) {
    return [];
  }

  const extendsEntries = Array.isArray(extendsValue)
    ? extendsValue
    : [extendsValue];
  const resolvedPaths: string[] = [];

  extendsEntries.forEach((entry) => {
    const resolvedPath = resolveExtendedConfigPath(entry, configPath);
    if (resolvedPath) {
      resolvedPaths.push(resolvedPath);
    }
  });

  // Abort the merge when any link in the extends chain cannot be resolved.
  if (resolvedPaths.length !== extendsEntries.length) {
    return null;
  }

  return resolvedPaths;
}

function resolveExtendedConfigPath(
  extendsPath: string,
  configPath: string
): string | null {
  const configDir = path.dirname(configPath);
  const absolutePath = path.resolve(configDir, extendsPath);
  const candidates = new Set<string>();

  // Support extensionless targets and directory targets such as "./configs/base".
  if (path.extname(absolutePath)) {
    candidates.add(absolutePath);
  } else {
    candidates.add(absolutePath);
    candidates.add(`${absolutePath}.json`);
  }
  candidates.add(path.join(absolutePath, 'tsconfig.json'));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

function countWildcards(pattern: string): number {
  // Count wildcard segments to ensure alias and target patterns align.
  return (pattern.match(/\*/g) ?? []).length;
}

function buildWildcardRegex(pattern: string): RegExp {
  // Capture wildcard segments so they can be reinserted into alias patterns.
  const parts = pattern.split('*').map(escapeRegex);
  if (parts.length === 1) {
    return new RegExp(`^${parts[0]}$`);
  }

  const lastIndex = parts.length - 1;
  let source = '^';
  parts.forEach((part, index) => {
    source += part;
    if (index !== lastIndex) {
      const greedy = index === lastIndex - 1 ? '.+' : '.+?';
      source += `(${greedy})`;
    }
  });
  source += '$';
  return new RegExp(source);
}

export function buildAliasSpecifier(
  aliasPattern: string,
  captures: string[]
): string {
  // Replace each wildcard with its captured value.
  let captureIndex = 0;
  return aliasPattern.replace(/\*/g, () => captures[captureIndex++] ?? '');
}

export function getModulePathForMatch(
  modulePath: string,
  mapping: AliasMapping
): string {
  // When the target pattern has no extension, compare without extension.
  if (mapping.targetHasExtension) {
    return modulePath;
  }
  return stripKnownExtension(modulePath).path;
}
