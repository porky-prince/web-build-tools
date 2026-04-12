---
name: images2style-webpack-plugin
description: Guidance for projects that use the images2style-webpack-plugin npm
  package to run images2style from webpack. Use this skill when tasks involve
  webpack configuration, plugin instantiation, or repository setup where
  package.json, pnpm-lock.yaml, imports, or webpack config show that
  images2style-webpack-plugin is installed.
license: MIT
metadata:
  author: porky-prince
  version: '1.0.0'
---

# Images2style webpack plugin

Use this skill for webpack tasks that configure or modify
`images2style-webpack-plugin`.

## Activation

Apply this skill only after you confirm at least one of these signals:

- `package.json` lists `images2style-webpack-plugin`
- another lockfile such as `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`
  contains `images2style-webpack-plugin`
- `node_modules/images2style-webpack-plugin` exists
- source files import or require `images2style-webpack-plugin`
- webpack config files instantiate `new Images2styleWebpackPlugin(...)`

If the project configures `images2style(...)` directly in scripts instead of
webpack, prefer the `images2style` skill.

## Primary references

When this skill applies, you must read the upstream package README before
changing webpack configuration or plugin usage code:

- plugin README:
  https://github.com/porky-prince/web-build-tools/blob/main/packages/images2style-webpack-plugin/README.md
- core package README:
  https://github.com/porky-prince/web-build-tools/blob/main/packages/images2style/README.md

Use the plugin README for webpack-specific setup and the core package README
for option semantics, class generation, and atlas behavior.

If the READMEs cannot be fetched, fall back to this skill's local rules and, if
available, the `$images2style` skill.

## Workflow

1. Read both upstream READMEs first, then inspect the current webpack
   integration. Keep the existing import style and plugin array placement
   unless the task says otherwise.
2. Treat the constructor options as the same options accepted by
   `images2style`. The core path contract still applies: `src` must be a
   directory path, and `dest` must be a file path with an extension.
3. Preserve the plugin's runtime behavior. The implementation forces
   `watch: false` during normal builds and flips `watch` to `true` on the first
   `watchRun`.
4. Keep expectations realistic. This plugin writes a CSS file to disk through
   `images2style`; it does not emit webpack virtual assets or replace the core
   package's class-generation model.
5. Validate both build and watch assumptions after changes, especially if the
   task touches output paths, watch behavior, or plugin ordering.

## Shared core semantics

This plugin is a thin wrapper around `images2style`. If the `$images2style`
skill is also available, reuse it for detailed option reasoning. If it is not
available, follow the shared core rules summarized here:

- `src` must be a directory path
- `dest` must be a file path with an extension
- one CSS file is generated for the whole source tree
- atlas JSON files with matching base names generate frame-specific CSS rules
- `exclude`, `include`, and `transform` retain the same meaning as the core
  package
