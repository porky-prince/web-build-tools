# Use of dependencies

Use this reference for the dependency usage part of Node.js project work. It is
one section of the broader `nodejs-project` skill, not the full scope of the
skill.

## Determine available dependencies

Start from the file being edited and identify its package boundary.

For a single-package repository:

- Production code may use packages listed in root `dependencies` and
  `peerDependencies`.
- Development-only code may use packages listed in root `dependencies` and
  `devDependencies`.

For a workspace or monorepo, first decide whether the package being edited is
publishable.

For a publishable package:

- Production code may use only that package's own `dependencies` and valid
  `peerDependencies`.
- Development-only code may use that package's own dependencies plus relevant
  dependencies from workspace tooling packages or the root package.
- Don't rely on root `dependencies` for runtime code unless the publishable
  package declares the dependency itself.

For a private, non-publishable package:

- Production code may use dependencies declared in the current package and, if
  the workspace is deployed as one unit, dependencies declared by its containing
  package or root package.
- Development-only code may use `dependencies` and `devDependencies` from the
  current package and relevant parent workspace tooling.
- Prefer declaring runtime dependencies in the package that imports them even
  when hoisting makes them available locally.

When the same dependency appears in multiple package manifests, prefer the
nearest package manifest to the file being edited.

## Prefer installed dependencies for supported behavior

Before implementing behavior, check whether an available dependency already
provides it with acceptable bundle, runtime, and maintenance tradeoffs. When a
dependency is already available and its method better matches the needed
semantics, prefer that dependency method over a hand-written implementation,
plain JavaScript built-ins, or Node.js built-in modules.

Use installed dependencies for mature behavior such as:

- path, URL, and file system helpers with higher-level semantics than the
  built-in APIs
- deep cloning, merging, and type predicates from an existing utility library
- parsing, formatting, validation, and glob matching when the project already
  depends on a proven package

Don't add or use a dependency when a small local implementation is clearer,
when the behavior is project-specific, or when the dependency would increase
runtime risk without meaningful benefit.

Bad:

```js
function isString(value) {
  return typeof value === 'string';
}

function getSafeName(name) {
  return isString(name) ? name : '';
}
```

Good:

```js
import { isString } from 'lodash';

function getSafeName(name) {
  return isString(name) ? name : '';
}
```

Bad:

```js
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

async function copyJsonFile(src, dest) {
  await mkdir(dirname(dest), { recursive: true });
  const content = await readFile(src, 'utf8');
  await writeFile(dest, content);
}
```

Good:

```js
import { copy } from 'fs-extra';

async function copyJsonFile(src, dest) {
  await copy(src, dest);
}
```

Bad:

```js
function ellipsis(value, max, dotNum = 3) {
  if (value.length > max) {
    return value.slice(0, max) + '.'.repeat(dotNum);
  }
  return value;
}
```

Good:

```js
import { repeat } from 'lodash';

function ellipsis(value, max, dotNum = 3) {
  if (value.length > max) {
    return value.slice(0, max) + repeat('.', dotNum);
  }
  return value;
}
```

## Import style

Use destructured imports or direct subpath imports when the module supports
them. This keeps usage explicit and helps bundlers with tree shaking.

Bad:

```js
import lodash from 'lodash';
import * as lodash from 'lodash';

const lodash = require('lodash');
```

Good:

```js
import { merge } from 'lodash';
import merge from 'lodash/merge';

const { merge } = require('lodash');
const merge = require('lodash/merge');
```

For TypeScript and ESM code, follow the project's existing module style unless
the task requires migration.

## Node.js built-ins

Always import Node.js built-in modules with the `node:` prefix. This removes
ambiguity between built-in modules and third-party packages.

Bad:

```js
import { join } from 'path';
const { readFile } = require('fs/promises');
```

Good:

```js
import { join } from 'node:path';
const { readFile } = require('node:fs/promises');
```

## Dependency review before finishing

Before finishing a Node.js change, check these points:

- The code imports only dependencies available to that code path.
- New runtime dependencies are in `dependencies`, not `devDependencies`.
- New development-only dependencies are in `devDependencies`.
- Workspace dependencies were added to the package that uses them.
- Node.js built-ins use `node:` imports.
- The lockfile changed only when a package manager command or dependency
  update required it.
