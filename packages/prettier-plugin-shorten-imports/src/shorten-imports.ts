import fs from 'fs-extra';
import path from 'path';
import ts from 'typescript';
import resolve from 'resolve';
import {
  RESOLVE_EXTENSIONS,
  countPathDepth,
  ensureRelativePrefix,
  isNodeModulesPath,
  isPathInsideRoot,
  stripKnownExtension,
  toPosixPath,
} from './utils';
import {
  buildAliasSpecifier,
  getConfigContext,
  getModulePathForMatch,
} from './tsconfig';

interface Replacement {
  start: number;
  end: number;
  text: string;
}

// Cache resolution per file + specifier + config to avoid repeated disk I/O.
// The cache lifetime matches the process lifetime, which is OK for Prettier
// since it usually formats files in a single run.
const resolveCache = new Map<string, string | null>();

export function shortenImports(
  input: string,
  filePath: string | undefined
): string {
  // Skip if Prettier does not provide a filepath (cannot resolve config).
  if (!filePath) {
    return input;
  }

  const ext = path.extname(filePath).toLowerCase();
  // Only handle file types explicitly listed in PLAN.md.
  if (!['.js', '.jsx', '.ts', '.tsx', '.vue'].includes(ext)) {
    return input;
  }

  // Quick string check to avoid parsing when there are no imports/exports.
  if (!input.includes('import') && !input.includes('export')) {
    return input;
  }

  // Build a config context once per file. If no paths config, do nothing.
  const context = getConfigContext(filePath);
  if (!context) {
    return input;
  }

  if (ext === '.vue') {
    return processVueFile(input, filePath, context);
  }

  // Use TS parser for JS/TS to find static import/export declarations.
  const scriptKind = getScriptKind(ext);
  return rewriteImportsInScript(input, filePath, context, scriptKind);
}

// Only rewrite import specifiers inside Vue script blocks so templates/styles
// stay untouched.
function processVueFile(
  input: string,
  filePath: string,
  context: ReturnType<typeof getConfigContext>
): string {
  if (!context) {
    return input;
  }

  if (!input.includes('<script')) {
    return input;
  }

  // Extract inline script blocks, ignoring <script src="..."> blocks.
  const blocks = findVueScriptBlocks(input);
  if (blocks.length === 0) {
    return input;
  }

  // Collect replacements and apply them back-to-front to preserve offsets.
  const replacements: Replacement[] = [];
  blocks.forEach((block) => {
    const scriptKind = getScriptKind(block.lang ?? 'js');
    const updated = rewriteImportsInScript(
      block.content,
      filePath,
      context,
      scriptKind
    );
    if (updated !== block.content) {
      replacements.push({ start: block.start, end: block.end, text: updated });
    }
  });

  if (replacements.length === 0) {
    return input;
  }

  const sorted = replacements.sort((a, b) => b.start - a.start);
  let output = input;
  sorted.forEach((replacement) => {
    output =
      output.slice(0, replacement.start) +
      replacement.text +
      output.slice(replacement.end);
  });
  return output;
}

function findVueScriptBlocks(
  input: string
): Array<{ start: number; end: number; content: string; lang?: string }> {
  // Skip <script src="..."> blocks and keep inline script content only.
  const blocks: Array<{
    start: number;
    end: number;
    content: string;
    lang?: string;
  }> = [];
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(input)) !== null) {
    const attributes = match[1] ?? '';
    if (/\bsrc\s*=/.test(attributes)) {
      continue;
    }
    const langMatch = attributes.match(/\blang\s*=\s*["']([^"']+)["']/i);
    const lang = langMatch?.[1];
    const content = match[2] ?? '';
    // Compute the absolute offsets of the script content within the file.
    const contentStart = match.index + match[0].indexOf(content);
    blocks.push({
      start: contentStart,
      end: contentStart + content.length,
      content,
      lang,
    });
  }

  return blocks;
}

function getScriptKind(value: string): ts.ScriptKind {
  // Map file or <script lang> to the closest TS ScriptKind.
  switch (value.toLowerCase()) {
    case '.ts':
    case 'ts':
      return ts.ScriptKind.TS;
    case '.tsx':
    case 'tsx':
      return ts.ScriptKind.TSX;
    case '.jsx':
    case 'jsx':
      return ts.ScriptKind.JSX;
    default:
      return ts.ScriptKind.JS;
  }
}

function rewriteImportsInScript(
  input: string,
  filePath: string,
  context: NonNullable<ReturnType<typeof getConfigContext>>,
  scriptKind: ts.ScriptKind
): string {
  // Use the TS AST to locate static import/export declarations only.
  let sourceFile: ts.SourceFile;
  try {
    sourceFile = ts.createSourceFile(
      filePath,
      input,
      ts.ScriptTarget.Latest,
      true,
      scriptKind
    );
  } catch {
    return input;
  }

  // Collect replacements so we can apply them in one pass.
  const replacements: Replacement[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;
      if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) {
        const original = moduleSpecifier.text;
        const replacement = getReplacementSpecifier(
          original,
          filePath,
          context
        );
        if (replacement && replacement !== original) {
          const start = moduleSpecifier.getStart(sourceFile);
          const end = moduleSpecifier.getEnd();
          const quote = input[start];
          replacements.push({
            start,
            end,
            text: `${quote}${escapeString(replacement, quote)}${quote}`,
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  if (replacements.length === 0) {
    return input;
  }

  const sorted = replacements.sort((a, b) => b.start - a.start);
  let output = input;
  sorted.forEach((replacement) => {
    output =
      output.slice(0, replacement.start) +
      replacement.text +
      output.slice(replacement.end);
  });
  return output;
}

function getReplacementSpecifier(
  specifier: string,
  filePath: string,
  context: NonNullable<ReturnType<typeof getConfigContext>>
): string | null {
  // Build candidate specifiers (relative + aliases) and choose the shortest
  // using depth, then string length, then keep the original.
  const posixSpecifier = toPosixPath(specifier);
  const { path: originalBase, ext: originalExt } =
    stripKnownExtension(posixSpecifier);

  // Resolve the specifier to a real file path. If it does not resolve,
  // leave it unchanged.
  const targetPath = resolveTargetPath(posixSpecifier, filePath, context);
  if (!targetPath) {
    return null;
  }

  // Skip anything outside the project root or inside node_modules.
  if (!isPathInsideRoot(targetPath, context.projectRoot)) {
    return null;
  }
  if (isNodeModulesPath(targetPath)) {
    return null;
  }

  // Generate candidate module paths (file path and index shortcut when allowed).
  const modulePathCandidates = getModulePathCandidates(targetPath, originalExt);
  const candidateBases = new Set<string>();

  // Always include the relative path from the current file to the target.
  const fileDirPosix = toPosixPath(path.dirname(filePath));
  modulePathCandidates.forEach((modulePath) => {
    const relative = path.posix.relative(fileDirPosix, modulePath);
    if (relative) {
      candidateBases.add(ensureRelativePrefix(relative));
    }
  });

  // Add any alias paths that map back to the same target file.
  modulePathCandidates.forEach((modulePath) => {
    context.aliasMappings.forEach((mapping) => {
      const matchPath = getModulePathForMatch(modulePath, mapping);
      const match = mapping.matcher.exec(matchPath);
      if (!match) {
        return;
      }
      const captures = match.slice(1);
      const alias = buildAliasSpecifier(mapping.aliasPattern, captures);
      const { path: aliasBase } = stripKnownExtension(alias);
      candidateBases.add(aliasBase);
    });
  });

  // Keep the original specifier as a candidate so ties preserve it.
  candidateBases.add(originalBase);

  const candidates = Array.from(candidateBases).map((base) =>
    applyExtension(base, originalExt)
  );
  const best = chooseBestSpecifier(candidates, posixSpecifier);
  if (!best || best === posixSpecifier) {
    return null;
  }
  return best;
}

function resolveTargetPath(
  specifier: string,
  filePath: string,
  context: NonNullable<ReturnType<typeof getConfigContext>>
): string | null {
  // Resolve aliases via tsconfig-paths, then confirm file existence via resolve.
  const cacheKey = `${filePath}\0${specifier}\0${context.configPath}`;
  if (resolveCache.has(cacheKey)) {
    return resolveCache.get(cacheKey) ?? null;
  }

  let resolved: string | null = null;
  try {
    if (specifier.startsWith('.')) {
      // Relative imports are resolved from the current file directory.
      resolved = resolve.sync(specifier, {
        basedir: path.dirname(filePath),
        extensions: RESOLVE_EXTENSIONS,
      });
    } else {
      // Alias imports are expanded via tsconfig-paths.
      const match = context.matchPath(
        specifier,
        undefined,
        undefined,
        RESOLVE_EXTENSIONS
      );
      if (match) {
        resolved = resolve.sync(match, {
          basedir: path.dirname(filePath),
          extensions: RESOLVE_EXTENSIONS,
        });
      }
    }
  } catch {
    resolved = null;
  }

  if (resolved && !fs.existsSync(resolved)) {
    resolved = null;
  }

  resolveCache.set(cacheKey, resolved);
  return resolved;
}

function getModulePathCandidates(
  targetPath: string,
  originalExt: string
): string[] {
  // Build candidate module paths for a resolved file. If the file is an index
  // file and the original specifier had no extension, allow the directory path.
  const targetPosix = toPosixPath(targetPath);
  const { path: targetBase } = stripKnownExtension(targetPosix);
  const candidates = new Set<string>([targetBase]);

  if (!originalExt) {
    const baseName = path.posix.basename(targetBase);
    if (baseName === 'index') {
      candidates.add(path.posix.dirname(targetBase));
    }
  }

  return Array.from(candidates);
}

function applyExtension(base: string, ext: string): string {
  // Preserve the original extension if one was provided.
  if (!ext) {
    return base;
  }
  const { path: stripped } = stripKnownExtension(base);
  return `${stripped}${ext}`;
}

function chooseBestSpecifier(
  candidates: string[],
  original: string
): string | null {
  // Pick by depth, then string length, then keep the original.
  if (candidates.length === 0) {
    return null;
  }

  const unique = Array.from(new Set(candidates.map(toPosixPath)));
  let bestDepth = Infinity;
  let bestLength = Infinity;
  const finalists: string[] = [];

  unique.forEach((candidate) => {
    const depth = countPathDepth(candidate);
    const length = candidate.length;
    if (depth < bestDepth || (depth === bestDepth && length < bestLength)) {
      bestDepth = depth;
      bestLength = length;
      finalists.length = 0;
      finalists.push(candidate);
    } else if (depth === bestDepth && length === bestLength) {
      finalists.push(candidate);
    }
  });

  const normalizedOriginal = toPosixPath(original);
  if (finalists.includes(normalizedOriginal)) {
    return normalizedOriginal;
  }

  finalists.sort();
  return finalists[0] ?? null;
}

function escapeString(value: string, quote: string): string {
  // Keep original quote type and escape the matching quote.
  const escaped = value.replace(/\\/g, '\\\\');
  if (quote === '"') {
    return escaped.replace(/"/g, '\\"');
  }
  if (quote === "'") {
    return escaped.replace(/'/g, "\\'");
  }
  return escaped;
}
