import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { configs, includeIgnoreFiles } from '../src';

describe('configs.recommended', () => {
  it('exports the package-named recommended config', () => {
    expect(configs.recommended).toMatchObject({
      name: 'eslint-config-porky',
      rules: {
        'no-undef': 'off',
      },
    });
  });

  it('relaxes TypeScript defaults that conflict with project conventions', () => {
    expect(configs.recommended.rules).toMatchObject({
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    });
  });

  it('allows object literal property names without enforcing a format', () => {
    expect(
      configs.recommended.rules['@typescript-eslint/naming-convention']
    ).toContainEqual({
      selector: 'objectLiteralProperty',
      format: null,
    });
  });

  it('rejects prefixed interface and enum names', () => {
    expect(
      configs.recommended.rules['@typescript-eslint/naming-convention']
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          selector: 'interface',
          format: ['StrictPascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: false,
          },
        }),
        expect.objectContaining({
          selector: 'enum',
          format: ['StrictPascalCase'],
          custom: {
            regex: '^E[A-Z]',
            match: false,
          },
        }),
      ])
    );
  });

  it('requires enum members to use upper case names', () => {
    expect(
      configs.recommended.rules['@typescript-eslint/naming-convention']
    ).toContainEqual({
      selector: 'enumMember',
      format: ['UPPER_CASE'],
    });
  });
});

describe('includeIgnoreFiles', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'eslint-config-porky-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('returns a named eslint ignore config from gitignore patterns', () => {
    const ignoreFilePath = join(tempDir, '.gitignore');
    writeFileSync(ignoreFilePath, 'dist/\n# build artifacts\ncoverage/\n');

    expect(includeIgnoreFiles([ignoreFilePath])).toEqual({
      name: 'eslint-config-porky-ignores',
      ignores: ['dist/', 'coverage/'],
    });
  });

  it('deduplicates patterns across files while preserving first occurrence order', () => {
    const gitignorePath = join(tempDir, '.gitignore');
    const npmignorePath = join(tempDir, '.npmignore');
    writeFileSync(gitignorePath, 'dist/\ncoverage/\n');
    writeFileSync(npmignorePath, 'coverage/\n.tmp/\n');

    expect(includeIgnoreFiles([gitignorePath, npmignorePath]).ignores).toEqual([
      'dist/',
      'coverage/',
      '.tmp/',
    ]);
  });

  it('keeps negated patterns from ignore files', () => {
    const ignoreFilePath = join(tempDir, '.gitignore');
    writeFileSync(ignoreFilePath, 'dist/\n!dist/keep.js\n');

    expect(includeIgnoreFiles([ignoreFilePath]).ignores).toEqual([
      'dist/',
      '!dist/keep.js',
    ]);
  });
});
