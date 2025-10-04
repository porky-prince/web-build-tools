import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    extends: ['xo', 'prettier'],
    env: {
      node: true,
      es6: true,
      jest: true,
    },
    plugins: ['prettier'],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      'no-multi-assign': 'off',
      'no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],
      'max-params': 'off',
      'no-await-in-loop': 'off',
      'prefer-const': [
        'error',
        {
          destructuring: 'all',
          ignoreReadBeforeAssign: true,
        },
      ],
      'capitalized-comments': 'off',
    },
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/build',
      '**/public',
      '**/docs',
      '**/coverage',
      '**/*.min.js',
      '**/*.bundle.js',
    ],
  },
]);
