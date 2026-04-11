# Images2atlas configuration reference

Use this reference for the non-obvious contract that must stay correct in code
changes.

Upstream package docs:

- README:
  https://github.com/porky-prince/web-build-tools/blob/main/packages/images2atlas/README.md

Read the upstream README for the full option list, detailed examples, and
template-format usage.

## Local invariants

Keep all of these true unless the package implementation itself changes:

- `src` must exist and must be a directory at runtime
- `dest` must be a directory path with no file extension
- one atlas image and one template file are produced per directory that has
  included PNG files
- non-PNG files are copied into the destination tree as-is
- a PNG that fails `include` is copied instead of packed
- a path that matches `exclude` is skipped entirely and is not copied
- the implementation filters paths through `isSafeFilename(...)`

## Safe editing patterns

Prefer patterns like these:

- Keep `dest` extensionless, such as `dist/icons`
- Use `exclude` for paths that must disappear from the destination tree
- Use `include` when a PNG should stay as a copied file instead of joining the
  atlas
- Keep `watch` disabled in one-off scripts and enable it only for long-running
  development flows

Avoid patterns like these:

- `dest: 'dist/icons.css'`
- changing `suffix` without updating any downstream consumers that load the
  generated files
- using `include` when the real goal is to exclude copying and packing

## Change checklist

Before you finish a change, confirm all of these are still true:

- `src` is a directory that exists at runtime
- `dest` does not include a file extension
- downstream code reads the expected atlas image and template names
- file filters still preserve the intended copied assets
- watch-mode changes still use the intended debounce delay
