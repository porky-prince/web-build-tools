import { isSafeFilename } from '../../src';

describe('isSafeFilename', () => {
  test('should return false for empty or undefined paths', () => {
    expect(isSafeFilename('')).toBe(false);
    expect(isSafeFilename('', false)).toBe(false);
  });

  test('should return false for filenames starting with dot', () => {
    expect(isSafeFilename('.DS_Store')).toBe(false);
    expect(isSafeFilename('.env')).toBe(false);
    expect(isSafeFilename('.gitignore')).toBe(false);
    expect(isSafeFilename('/path/to/.hidden')).toBe(false);
  });

  test('should return true for safe filenames', () => {
    expect(isSafeFilename('foo.txt')).toBe(true);
    expect(isSafeFilename('my-file@2024.js')).toBe(true);
    expect(isSafeFilename('image_123.png')).toBe(true);
    expect(isSafeFilename('document-v2.1.pdf')).toBe(true);
    expect(isSafeFilename('file$test')).toBe(true);
    expect(isSafeFilename('test@domain.com')).toBe(true);
  });

  test('should return false for unsafe filenames', () => {
    expect(isSafeFilename('bad/file\\name')).toBe(false);
    expect(isSafeFilename('file:name')).toBe(false);
    expect(isSafeFilename('file;name')).toBe(false);
    expect(isSafeFilename('file name')).toBe(false);
    expect(isSafeFilename('file\tname')).toBe(false);
    expect(isSafeFilename('file\nname')).toBe(false);
    expect(isSafeFilename('file"name')).toBe(false);
    expect(isSafeFilename("file'name")).toBe(false);
  });

  test('should handle full paths correctly', () => {
    expect(isSafeFilename('/path/to/file.txt')).toBe(true);
    expect(isSafeFilename('/path/to/.hidden')).toBe(false);
    expect(isSafeFilename('../relative/path/image.png')).toBe(true);
    expect(isSafeFilename('../relative/path/.config')).toBe(false);
  });
});
