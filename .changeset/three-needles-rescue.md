---
'web-build-utils': patch
---

feat(web-build-utils): add command execution and file system utilities with enhanced documentation

- Add execCmd function for executing shell commands with logging support
- Add question utility for prompting user input via readline interface
- Export new command utilities from main index
- Enhance copyFiles function with detailed JSDoc documentation
- Refactor copyFiles to use destructured fs-extra and node:path imports
- Add type export for CopyFilesTransform interface
- Improve eachFile function with comprehensive documentation
- Refactor eachFile to use destructured fs-extra and node:path imports
- Add isDirPath, isFilePath functions with extension-based heuristics
- Enhance isDir and isFile functions with better parameter naming
- Add toUnixSep utility for normalizing path separators
- Export new file system utilities from main index
- Add md5 hashing utility using node:crypto
- Export math and md5 utilities from main index
- Update toPercent function documentation
- Add comprehensive test coverage for all new utilities
- Refactor import statements to use destructuring and node: prefix
- Remove outdated API reference from README
- Add prettier-plugin-shorten-imports to project documentation
