Build a Prettier npm plugin that shortens local import paths.

1. Support .js, .jsx, .ts, .tsx, and .vue files.
2. Only rewrite static import/export ... from specifiers. Do not change
   require() calls or dynamic import().
3. Find the nearest tsconfig.json or jsconfig.json for the current file.
   If both exist at the same directory level, prefer tsconfig.json.
   Use the same tsconfig lookup behavior as
   https://github.com/simonhaenisch/prettier-plugin-organize-imports.
   Use compilerOptions.paths and baseUrl from the nearest config file.
   Resolve extends paths relative to the current tsconfig file, but do not
   use baseUrl or paths from extended configs. Ignore project references.
   If no config or paths are found, do not modify specifiers. If paths
   exist and baseUrl is missing, treat baseUrl as the directory of the
   config file.
4. For each import specifier that resolves to a local file, compute candidate
   specifiers:
   - The normalized relative path from the current file to the target.
   - Any alias path that resolves to the same target via paths mappings.
   Resolve the target file by applying TS/Node extension and index rules
   with extensions ordered as:
   .ts, .tsx, .d.ts, .js, .jsx, .mjs, .cjs, .json, .vue.
   If the target file does not exist, do not change the specifier. When
   paths contains wildcards with multiple candidates, include every
   resolved alias in the comparison. Skip specifiers that resolve to
   node_modules or outside the project root (the directory containing the
   nearest config file).
5. Choose the shortest path by depth, then by string length:
   - Depth is the count of path segments split by "/" after normalization,
     and ".." counts as one segment.
   - If depth is equal, choose the shorter string length.
   - If string length is also equal, keep the original specifier.
   If the current specifier already wins under these rules, do not change it.
6. Preserve an existing file extension if present and do not add new
   extensions. Normalize to POSIX "/" separators.
7. For .vue files, only update import/export specifiers inside <script> and
   <script setup> blocks. Do not touch template or style sections. Do not
   handle <script src="..."> external scripts.
8. Implementation can reference
   https://github.com/simonhaenisch/prettier-plugin-organize-imports.
   Follow a similar approach for alias reverse mapping when generating
   candidate specifiers.
9. Follow the patterns in other packages for package structure, tests, and
   README content.
10. Write code comments, tests, and documentation in English.

Dependencies

Use third-party packages to avoid reimplementing config parsing and module
resolution:

- jsonc-parser for parsing tsconfig or jsconfig files with comments.
- tsconfig-paths for expanding paths mappings and matching aliases.
- resolve for Node-style file resolution with a configurable extensions list.

Examples

Use the examples below to validate behavior and tests.

Example 1: alias path wins by depth

Input config:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/*"]
    }
  }
}
```

Input file: src/features/user/profile.ts

```ts
import { formatName } from "../../utils/format";
```

Resolved target: src/utils/format.ts

Candidate specifiers:
- ../../utils/format (depth 3)
- @app/utils/format (depth 2)

Output:

```ts
import { formatName } from "@app/utils/format";
```

Example 2: tie keeps existing specifier

Input config:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/*"]
    }
  }
}
```

Input file: src/features/user/profile.ts

```ts
import { formatName } from "@app/utils/format";
```

Resolved target: src/utils/format.ts

Candidate specifiers:
- ../../utils/format (depth 3)
- @app/utils/format (depth 3)

Output:

```ts
import { formatName } from "@app/utils/format";
```

Example 3: bare package specifier is unchanged

Input file: src/features/user/profile.ts

```ts
import { useState } from "react";
```

Output:

```ts
import { useState } from "react";
```

Example 4: baseUrl affects paths resolution

Input config:

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@app/*": ["shared/*"]
    }
  }
}
```

Input file: src/features/user/profile.ts

```ts
import { formatName } from "../../shared/format";
```

Resolved target: src/shared/format.ts

Candidate specifiers:
- ../../shared/format (depth 3)
- @app/format (depth 2)

Output:

```ts
import { formatName } from "@app/format";
```
