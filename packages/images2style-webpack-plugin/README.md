# images2style-webpack-plugin

Webpack plugin that runs `images2style` to generate a CSS file with background
image classes. It hooks into webpack build and watch modes and writes outputs
to disk via `images2style`.

## Core module
Core capabilities are provided by `images2style`. See the module documentation
for features, options, and output details:
https://github.com/porky-prince/web-build-tools/packages/images2style

## Installation
```
npm install images2style-webpack-plugin --save-dev
```

## Usage
```ts
import Images2styleWebpackPlugin from 'images2style-webpack-plugin';

export default {
  // ...webpack config
  plugins: [
    new Images2styleWebpackPlugin({
      src: '/path/to/images',
      dest: '/path/to/output/images.css',
    }),
  ],
};
```

## Options
This plugin accepts the same options as `images2style`. Refer to the core
module docs for the full option list:
https://github.com/porky-prince/web-build-tools/packages/images2style

> Note: The plugin forces `watch: false` for normal builds and flips it to
> `true` on the first watch run.

## Output behavior
Outputs are written to disk by `images2style`. See its documentation for class
name generation, path handling, and atlas JSON behavior:
https://github.com/porky-prince/web-build-tools/packages/images2style

## Testing
This package uses Jest with ts-jest.

Run the tests from the repo root:
```
pnpm --filter images2style-webpack-plugin test
```

## Changelog

See [`CHANGELOG.md`](CHANGELOG.md) for release history.
