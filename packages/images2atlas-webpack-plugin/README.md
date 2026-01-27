# images2atlas-webpack-plugin

Webpack plugin that runs `images2atlas` to build spritesheet atlases and template
outputs from a directory of PNG images. It hooks into webpack build/watch and
writes outputs to disk via `images2atlas`.

## Core Module
Core capabilities are provided by `images2atlas`. See the module documentation
for features, options, and output details:
https://github.com/porky-prince/web-build-tools/packages/images2atlas

## Installation
```
npm install images2atlas-webpack-plugin --save-dev
```

## Usage
```ts
import Images2atlasWebpackPlugin from 'images2atlas-webpack-plugin';

export default {
  // ...webpack config
  plugins: [
    new Images2atlasWebpackPlugin({
      src: '/path/to/icons',
      dest: '/path/to/output/icons',
      templatesOptions: { format: 'css' },
    }),
  ],
};
```

## Options
This plugin accepts the same options as `images2atlas`. Refer to the core module
docs for the full option list:
https://github.com/porky-prince/web-build-tools/packages/images2atlas

> Note: The plugin forces `watch: false` for normal builds and flips it to `true`
> on the first watch run.

## Output Behavior
Outputs are written to disk by `images2atlas`. See its documentation for output
formats and naming:
https://github.com/porky-prince/web-build-tools/packages/images2atlas

## Why choose this over webpack-spritesmith?
If your workflow is directory-driven and you want multiple atlases out of a
single tree, this plugin is a better fit:

- **Dynamic atlas discovery**: watches the `src` tree and picks up new folders or
  files without changing plugin configuration.
- **Folder-based output**: one atlas per directory, recursively.
- **File passthrough**: non-PNG assets are copied alongside atlases.
- **Shared core**: same options as `images2atlas`, so you can run it with or
  without webpack.
- **Watch via chokidar**: uses `images2atlas`’s watcher for quick re-pack during
  development.

If you need deep webpack asset integration or prefer a compilation-driven
pipeline, `webpack-spritesmith` may be a better match.
