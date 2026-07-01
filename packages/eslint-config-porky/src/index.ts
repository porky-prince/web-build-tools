import { readFileSync } from 'node:fs';
import parse from 'parse-gitignore';

const pkgName = 'eslint-config-porky';
let tsRules = null;
try {
  const { plugin } = require('typescript-eslint');
  tsRules = {
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      ...plugin.rules['naming-convention'].defaultOptions,
      {
        selector: 'objectLiteralProperty',
        format: null,
      },
      {
        // Interface name should not be prefixed with `I`.
        selector: 'interface',
        format: ['StrictPascalCase'],
        custom: {
          regex: /^I[A-Z]/.source,
          match: false,
        },
      },
      {
        // Enum name should not be prefixed with `E`.
        selector: 'enum',
        format: ['StrictPascalCase'],
        custom: {
          regex: /^E[A-Z]/.source,
          match: false,
        },
      },
      {
        selector: 'enumMember',
        format: ['UPPER_CASE'],
      },
    ],
  };
} catch {
  // Ignore
}

export const configs = {
  recommended: {
    name: pkgName,
    rules: {
      'no-undef': 'off',
      ...tsRules,
    },
  },
};

export function includeIgnoreFiles(ignoreFilePaths: string[]) {
  const set = new Set<string>();
  ignoreFilePaths.forEach((ignoreFilePath) => {
    parse(readFileSync(ignoreFilePath)).patterns.forEach((pattern) =>
      set.add(pattern)
    );
  });

  return {
    name: pkgName + '-ignores',
    ignores: Array.from(set),
  };
}
