---
name: images2atlas-webpack-plugin
description: Guidance for projects that use the images2atlas-webpack-plugin npm
  package to run images2atlas from webpack. Use this skill when tasks involve
  webpack configuration, plugin instantiation, or repository setup where
  package.json, pnpm-lock.yaml, imports, or webpack config show that
  images2atlas-webpack-plugin is installed.
license: MIT
metadata:
  author: porky-prince
  version: '1.0.0'
---

# Images2atlas webpack plugin

Use this skill for webpack tasks that configure or modify
`images2atlas-webpack-plugin`.

## Activation

Apply this skill only after you confirm at least one of these signals:

- `package.json` lists `images2atlas-webpack-plugin`
- another lockfile such as `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`
  contains `images2atlas-webpack-plugin`
- `node_modules/images2atlas-webpack-plugin` exists
- source files import or require `images2atlas-webpack-plugin`
- webpack config files instantiate `new Images2atlasWebpackPlugin(...)`

If the project configures `images2atlas(...)` directly in scripts instead of
webpack, prefer the `images2atlas` skill.

## Primary references

When this skill applies, you must read the upstream package README before
changing webpack configuration or plugin usage code:

- plugin README:
  https://github.com/porky-prince/web-build-tools/blob/main/packages/images2atlas-webpack-plugin/README.md
- core package README:
  https://github.com/porky-prince/web-build-tools/blob/main/packages/images2atlas/README.md

Use the plugin README for webpack-specific setup and the core package README
for option semantics and output behavior.

If the READMEs cannot be fetched, fall back to this skill's local rules and, if
available, the `$images2atlas` skill.

## Workflow

1. Read both upstream READMEs first, then inspect the current webpack
   integration. Keep the existing plugin import style and plugin array
   placement unless the task says otherwise.
2. Treat the constructor options as the same options accepted by
   `images2atlas`. The core path contract still applies: `src` must be a
   directory, and `dest` must be a directory path with no file extension.
3. Preserve the plugin's runtime behavior. The implementation forces
   `watch: false` during normal builds and flips `watch` to `true` on the first
   `watchRun`.
4. Keep expectations realistic. This plugin writes files to disk through
   `images2atlas`; it does not emit webpack virtual assets or replace the core
   package's output model.
5. Validate both build and watch assumptions after changes, especially if the
   task touches output paths, watch behavior, or plugin ordering.

## Shared core semantics

This plugin is a thin wrapper around `images2atlas`. If the `$images2atlas`
skill is also available, reuse it for detailed option reasoning. If it is not
available, follow the shared core rules summarized here:

- `src` must point to an existing directory
- `dest` must be extensionless
- PNG files are packed into atlases per directory
- non-PNG files are copied through to the destination tree
- `exclude` removes a path entirely, while `include` only controls atlas
  participation for PNG files
