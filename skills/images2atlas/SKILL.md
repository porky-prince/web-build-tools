---
name: images2atlas
description: Guidance for projects that use the images2atlas npm package to
  generate spritesheet atlases and template outputs from PNG directories. Use
  this skill when tasks involve images2atlas configuration, code that calls
  images2atlas(), or repository setup where package.json, pnpm-lock.yaml,
  imports, or build scripts show that images2atlas is installed.
license: MIT
metadata:
  author: porky-prince
  version: '1.0.0'
---

# Images2atlas

Use this skill for tasks that configure or modify `images2atlas` in codebases
that already install the `images2atlas` npm package.

## Activation

Apply this skill only after you confirm at least one of these signals:

- `package.json` lists `images2atlas` in `dependencies` or `devDependencies`
- another lockfile such as `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`
  contains `images2atlas`
- `node_modules/images2atlas` exists
- source files import or require `images2atlas`
- build scripts call `images2atlas(...)`
- project docs or config files explicitly mention `images2atlas`

If the project only installs `images2atlas-webpack-plugin`, prefer the
`images2atlas-webpack-plugin` skill first and use this skill for the shared
core option semantics.

## Primary reference

When this skill applies, you must read the upstream package README before
changing configuration or usage code:

- https://github.com/porky-prince/web-build-tools/blob/main/packages/images2atlas/README.md

Use the upstream README as the primary source for option descriptions, output
formats, and example usage.

If the README cannot be fetched, fall back to `references/configuration.md` and
inspect how the current project already uses `images2atlas`.

## Workflow

1. Read the upstream README first, then inspect the current integration before
   changing anything. Keep the existing path conventions, suffixes, and
   template formats unless the task requires a change.
2. Verify the path contract before you edit configuration: `src` must be a
   directory, and `dest` must be a directory path with no file extension.
3. Preserve the directory-driven output model. This package creates one atlas
   per directory and copies non-PNG files into the destination tree.
4. Keep filter and watch behavior aligned with the package contract. `exclude`
   removes a path entirely, while `include` only controls whether a PNG joins
   the atlas.
5. Validate the generated outputs after editing. Confirm the atlas image path,
   template extension, and passthrough file locations still match the expected
   build layout.

## Detailed reference

Read `references/configuration.md` for the minimum local contract that must stay
correct even if the upstream README is unavailable:

- path validation rules
- output model and naming invariants
- safe code patterns for `include`, `exclude`, and `watch`
- a final checklist before finishing a change
