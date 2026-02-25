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

## API reference

The package exports the following helpers.

### isSafeFilename

Validates a filename by checking the basename against a safe character set.

```ts
isSafeFilename(path: string, log?: boolean): boolean
```

Use these arguments:

- `path`: The filename or file path to validate.
- `log`: When `true`, logs a warning for unsafe filenames.

Returns `true` when the basename is safe. Returns `false` when the input is
empty, starts with a dot, or contains invalid characters.

### toPercent

Converts a decimal number into a percentage with a fixed number of decimal
places.

```ts
toPercent(num: number, fractionDigits?: number): number
```

Use these arguments:

- `num`: The number to convert. For example, `0.125` becomes `12.5`.
- `fractionDigits`: The number of decimal places to keep. Defaults to `0`.

Returns the percentage value as a number.

## Notes

`isSafeFilename` validates only the basename of a path. It rejects empty values
and names starting with a dot. Allowed characters are letters, numbers,
underscores, dots, hyphens, at signs, and dollar signs.
