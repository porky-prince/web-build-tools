import path from 'path';

// Keep resolution order aligned with PLAN.md rules.
export const RESOLVE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.d.ts',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.vue',
];

// Convert Windows paths to POSIX for consistent comparisons.
export function toPosixPath(value: string): string {
  return value.replace(/\\/g, '/');
}

// Ensure relative paths are explicitly relative (./) for imports.
export function ensureRelativePrefix(value: string): string {
  if (value === '') {
    return './';
  }
  return value.startsWith('.') ? value : `./${value}`;
}

// Normalize and remove a leading "./" so depth calculations are stable.
export function normalizeSpecifier(value: string): string {
  let normalized = path.posix.normalize(toPosixPath(value));
  if (normalized.startsWith('./')) {
    normalized = normalized.slice(2);
  }
  return normalized;
}

export function countPathDepth(value: string): number {
  const normalized = normalizeSpecifier(value);
  return normalized.split('/').filter(Boolean).length;
}

// Return both the extension and the base path if it is a known extension.
export function stripKnownExtension(value: string): {
  path: string;
  ext: string;
} {
  for (const ext of RESOLVE_EXTENSIONS) {
    if (value.endsWith(ext)) {
      return { path: value.slice(0, -ext.length), ext };
    }
  }
  return { path: value, ext: '' };
}

// Check for known extensions so index/file resolution behaves consistently.
export function hasKnownExtension(value: string): boolean {
  return RESOLVE_EXTENSIONS.some((ext) => value.endsWith(ext));
}

// Escape regex special characters for wildcard expansion.
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Determine if a path lives inside the project root.
export function isPathInsideRoot(filePath: string, rootDir: string): boolean {
  const relative = path.relative(rootDir, filePath);
  return (
    relative === '' ||
    (!relative.startsWith('..') && !path.isAbsolute(relative))
  );
}

// Quick check to avoid touching dependencies.
export function isNodeModulesPath(filePath: string): boolean {
  const normalized = toPosixPath(filePath);
  return normalized.includes('/node_modules/');
}
