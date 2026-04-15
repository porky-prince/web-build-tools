---
'prettier-plugin-shorten-imports': patch
---

refactor(prettier-plugin-shorten-imports): rename shortenImports to shorten and update implementation

- Renamed shorten-imports.ts to shorten.ts
- Changed export function name from shortenImports to shorten
- Updated import references from shortenImports to shorten
- Removed unused typescript dependency from package.json
- Updated typescript version constraint in pnpm-lock.yaml
- Enhanced preprocess logic with range check and ignore patterns
- Added error handling with DEBUG environment variable support
- Modified parser preprocess hook implementation approach
