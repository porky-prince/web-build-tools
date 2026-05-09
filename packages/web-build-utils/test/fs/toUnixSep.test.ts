import { toUnixSep } from '../../src';

describe('toUnixSep', () => {
  test('returns empty paths as-is', () => {
    expect(toUnixSep('')).toBe('');
  });

  test('normalizes backslashes into forward slashes', () => {
    expect(toUnixSep(String.raw`foo\bar\baz.txt`)).toBe('foo/bar/baz.txt');
  });

  test('can force a trailing slash on the normalized path', () => {
    expect(toUnixSep(String.raw`foo\bar`, true)).toBe('foo/bar/');
    expect(toUnixSep('foo/bar/', true)).toBe('foo/bar/');
  });

  test('can remove a trailing slash from the normalized path', () => {
    expect(toUnixSep('foo\\bar\\', false)).toBe('foo/bar');
    expect(toUnixSep('foo/bar/', false)).toBe('foo/bar');
  });

  test('keeps win32 extended-length paths unchanged', () => {
    const extendedPath = ['', '', '?', 'C:', 'foo', 'bar'].join('\\');

    expect(toUnixSep(extendedPath)).toBe(extendedPath);
  });
});
