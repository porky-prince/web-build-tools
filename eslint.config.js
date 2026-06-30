const { join } = require('path');
const tsx = require('tsx/cjs/api');
const { defineConfig } = require('eslint/config');
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const { configs, includeIgnoreFiles } = tsx.require(
  './packages/eslint-config-porky/src/index.ts',
  __filename
);

module.exports = defineConfig([
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  configs.recommended,
  includeIgnoreFiles([join(__dirname, '.prettierignore')]),
]);
