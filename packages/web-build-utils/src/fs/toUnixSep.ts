/**
 * Normalizes path separators to `/`.
 *
 * @remarks
 * Win32 extended-length paths are returned unchanged. When `addLast` is
 * provided, the result is forced to either include or omit a trailing slash.
 *
 * @param path - Path to normalize
 * @param addLast - Whether to force a trailing slash
 */
export function toUnixSep(path: string, addLast?: boolean) {
  if (!path) {
    return path;
  }

  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
  if (isExtendedLengthPath) {
    return path;
  }

  path = path.replace(/\\/g, '/');

  if (addLast != null) {
    const last = path[path.length - 1];
    if (addLast) {
      if (last !== '/') path += '/';
    } else {
      if (last === '/') path = path.slice(0, path.length - 1);
    }
  }

  return path;
}
