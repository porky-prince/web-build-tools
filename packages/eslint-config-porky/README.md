# eslint-config-porky

`eslint-config-porky` provides shared ESLint flat config additions.
Use it with ESLint 9 and compose it after the base JavaScript,
TypeScript, and Prettier configs you already use.

## Installation

Install the package with ESLint 9 or newer.

```sh
pnpm add -D eslint eslint-config-porky
```

If you want the TypeScript-specific rule additions, also install
`typescript-eslint`.

```sh
pnpm add -D typescript-eslint
```

## Quick start

Add `configs.recommended` to your ESLint flat config array. The config is an
append-only preset, so keep your base ESLint presets before it.

```js
const { defineConfig } = require('eslint/config');
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const { configs } = require('eslint-config-porky');

module.exports = defineConfig([
  eslint.configs.recommended,
  tseslint.configs.recommended,
  configs.recommended,
]);
```

You can also reuse ignore patterns from `.gitignore`, `.prettierignore`, or
other ignore files.

```js
const { join } = require('node:path');
const { defineConfig } = require('eslint/config');
const { includeIgnoreFiles } = require('eslint-config-porky');

module.exports = defineConfig([
  includeIgnoreFiles([
    join(__dirname, '.gitignore'),
    join(__dirname, '.prettierignore'),
  ]),
]);
```

## API

This package exports the following members.

### `configs.recommended`

`configs.recommended` is a named ESLint flat config object.

```js
{
  name: 'eslint-config-porky',
  rules: {
    'no-undef': 'off'
  }
}
```

When `typescript-eslint` is available, the config also adds these TypeScript
rule customizations:

- Disables `@typescript-eslint/no-require-imports`.
- Disables `@typescript-eslint/no-explicit-any`.
- Allows any object literal property naming format.
- Rejects interface names that start with `I` followed by an uppercase letter.
- Rejects enum names that start with `E` followed by an uppercase letter.
- Requires enum members to use `UPPER_CASE` names.

### `includeIgnoreFiles(ignoreFilePaths)`

`includeIgnoreFiles()` reads one or more ignore files and returns an ESLint flat
config object with a de-duplicated `ignores` array.

```js
const { join } = require('node:path');
const { includeIgnoreFiles } = require('eslint-config-porky');

const ignores = includeIgnoreFiles([join(__dirname, '.gitignore')]);
```

The returned config has this shape:

```js
{
  name: 'eslint-config-porky-ignores',
  ignores: ['dist/', 'coverage/']
}
```

Patterns keep the first occurrence order across files, and negated patterns are
preserved.

## Notes

- This package targets ESLint flat config and requires ESLint `>=9`.
- `configs.recommended` does not include `@eslint/js`,
  `typescript-eslint.configs.recommended`, or Prettier presets. Add those
  separately in your `eslint.config.js`.
- If `typescript-eslint` is not installed, the TypeScript-specific rule
  additions are skipped.

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) for release history.
