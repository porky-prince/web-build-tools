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
  const rawConfig = readConfigFile(configPath);
  const compilerOptions = rawConfig?.compilerOptions ?? {};
  const rawPaths = compilerOptions.paths ?? {};
  const paths = normalizePaths(rawPaths);

  if (!paths || Object.keys(paths).length === 0) {
    configCache.set(configPath, null);
    return null;
  }

  // If baseUrl is not set, treat the config directory as the base.
  const baseUrl = compilerOptions.baseUrl
    ? path.resolve(configDir, compilerOptions.baseUrl)
    : configDir;
  const matchPath = createMatchPath(baseUrl, paths);
  const aliasMappings = buildAliasMappings(paths, baseUrl);

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

function readConfigFile(configPath: string): {
  compilerOptions?: {
    baseUrl?: string;
    paths?: Record<string, string[] | string>;
  };
} | null {
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
  paths: Record<string, string[] | string>
): PathsConfig | null {
  // Normalize paths entries to { pattern: string[] }.
  const entries = Object.entries(paths);
  if (entries.length === 0) {
    return null;
  }

  const normalized: PathsConfig = {};
  entries.forEach(([key, value]) => {
    if (Array.isArray(value)) {
      normalized[key] = value.filter((item) => typeof item === 'string');
    } else if (typeof value === 'string') {
      normalized[key] = [value];
    }
  });

  return Object.keys(normalized).length > 0 ? normalized : null;
}

function buildAliasMappings(
  paths: PathsConfig,
  baseUrl: string
): AliasMapping[] {
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
      const absoluteTargetPattern = toPosixPath(
        path.resolve(baseUrl, targetPattern)
      );
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
