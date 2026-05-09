# web-build-utils

web-build-utils provides small, focused helpers used by the web build tools
packages in this repository. You can use it directly if you need filename
validation or simple percentage formatting.

## Installation

Install the package with your preferred package manager.

```sh
pnpm add web-build-utils
# or
npm install web-build-utils
# or
yarn add web-build-utils
```

## Usage

Import the helpers you need and call them in your build tooling code.

```ts
import { isSafeFilename, toPercent } from 'web-build-utils';

const fileName = 'sprite@2x.png';
const isSafe = isSafeFilename(fileName, true);

const ratio = 0.1234;
const percent = toPercent(ratio, 2);
```

## Notes

`isSafeFilename` validates only the basename of a path. It rejects empty values
and names starting with a dot. Allowed characters are letters, numbers,
underscores, dots, hyphens, at signs, and dollar signs.

## Changelog

See [`CHANGELOG.md`](CHANGELOG.md) for release history.
