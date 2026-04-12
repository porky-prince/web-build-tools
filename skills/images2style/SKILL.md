---
name: images2style
description: Guidance for projects that use the images2style npm package to
  generate CSS background classes from image folders. Use this skill when tasks
  involve images2style configuration, code that calls images2style(), or
  repository setup where package.json, pnpm-lock.yaml, imports, or build
  scripts show that images2style is installed.
license: MIT
metadata:
  author: porky-prince
  version: '1.0.0'
---

# Images2style

Use this skill for tasks that configure or modify `images2style` in codebases
that already install the `images2style` npm package.

## Activation

Apply this skill only after you confirm at least one of these signals:

- `package.json` lists `images2style` in `dependencies` or `devDependencies`
- another lockfile such as `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`
  contains `images2style`
- `node_modules/images2style` exists
- source files import or require `images2style`
- build scripts call `images2style(...)`
- project docs or config files explicitly mention `images2style`

If the project only installs `images2style-webpack-plugin`, prefer the
`images2style-webpack-plugin` skill first and use this skill for the shared
core option semantics.

## Primary reference

When this skill applies, you must read the upstream package README before
changing configuration or usage code:

- https://github.com/porky-prince/web-build-tools/blob/main/packages/images2style/README.md

Use the upstream README as the primary source for option descriptions, class
generation details, atlas behavior, and example usage.

If the README cannot be fetched, fall back to `references/configuration.md` and
inspect how the current project already uses `images2style`.

## Workflow

1. Read the upstream README first, then inspect the current integration before
   editing. Preserve the existing CSS destination path, class naming
   expectations, and atlas JSON workflow unless the task requires a change.
2. Verify the path contract before you edit configuration: `src` must be a
   directory path, and `dest` must be a file path with an extension.
3. Preserve the single-output model. The package generates one CSS file for the
   whole source tree and prepends a header comment plus the `.bg-full` utility
   class.
4. Keep file filters and transforms aligned with the package contract.
   `exclude` skips a path entirely, `include` decides which supported images
   become CSS, and `transform` rewrites generated CSS per image or atlas group.
5. Validate the emitted class names, relative image URLs, and atlas frame rules
   after editing any configuration.

## Detailed reference

Read `references/configuration.md` for the minimum local contract that must stay
correct even if the upstream README is unavailable:

- path validation rules
- class naming and URL invariants
- atlas JSON invariants and supported extensions
- a final checklist before finishing a change
