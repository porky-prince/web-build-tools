# prettier-plugin-shorten-imports

## 0.0.3

### Patch Changes

- [#28](https://github.com/porky-prince/web-build-tools/pull/28) [`b9291ff`](https://github.com/porky-prince/web-build-tools/commit/b9291ffdf9f86373bbd2559cc56e5cae0ad657ec) Thanks [@porky-prince](https://github.com/porky-prince)! - refactor(prettier-plugin-shorten-imports): update parser imports to use require syntax

## 0.0.2

### Patch Changes

- [#26](https://github.com/porky-prince/web-build-tools/pull/26) [`2b19c67`](https://github.com/porky-prince/web-build-tools/commit/2b19c67e7db2ad97a2e11fb7e7c1ffceb4220157) Thanks [@porky-prince](https://github.com/porky-prince)! - refactor(prettier-plugin-shorten-imports): rename shortenImports to shorten and update implementation
  - Renamed shorten-imports.ts to shorten.ts
  - Changed export function name from shortenImports to shorten
  - Updated import references from shortenImports to shorten
  - Removed unused typescript dependency from package.json
  - Updated typescript version constraint in pnpm-lock.yaml
  - Enhanced preprocess logic with range check and ignore patterns
  - Added error handling with DEBUG environment variable support
  - Modified parser preprocess hook implementation approach

## 0.0.1

### Patch Changes

- [#24](https://github.com/porky-prince/web-build-tools/pull/24) [`5b988cf`](https://github.com/porky-prince/web-build-tools/commit/5b988cf8dc1e916a06d4c73fe516204d94ba0774) Thanks [@porky-prince](https://github.com/porky-prince)! - chore(prettier-plugin-shorten-imports): release
