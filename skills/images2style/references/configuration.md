# Images2style configuration reference

Use this reference for the non-obvious contract that must stay correct in code
changes.

Upstream package docs:

- README:
  https://github.com/porky-prince/web-build-tools/blob/main/packages/images2style/README.md

Read the upstream README for the full option list, detailed examples, and
generated CSS behavior.

## Local invariants

Keep all of these true unless the package implementation itself changes:

- `src` must be a directory path with no file extension
- `dest` must be a file path that includes an extension
- one CSS file is generated for the entire source tree
- supported image extensions are `jpg`, `jpeg`, `png`, `gif`, `svg`, `webp`,
  and `avif`
- `exclude` skips files or directories entirely
- `include` decides which supported image files become CSS rules
- `transform` rewrites generated CSS per image or atlas-backed image
- the final output always starts with a generated-file comment and a `.bg-full`
  utility class
- the implementation filters paths through `isSafeFilename(...)`

## Naming and atlas invariants

Keep these behaviors stable when changing config or downstream usage:

- class names are derived from `path.dirname(src)` plus the image path
- files directly under `src` still include the `src` directory name in the
  class
- single-image classes append the file extension with the dot replaced by `-`
- atlas frame classes omit the image extension and append the frame name
- image URLs are relative from `path.dirname(dest)` to the source image
- atlas frame rules require a sibling JSON file with the expected `meta.size`
  and `frames` shape

## Safe editing patterns

Prefer patterns like these:

- keep `dest` as a real file path such as `dist/images.css`
- treat atlas JSON files as part of the source-of-truth image pipeline
- use `transform` for last-mile CSS customization without rewriting class
  generation logic
- enable `watch` only for long-running development workflows

Avoid patterns like these:

- `dest: 'dist/images'`
- changing the CSS output location without checking the resulting relative image
  URLs
- forcing atlas-like class names when the source images do not have matching
  JSON metadata

## Change checklist

Before you finish a change, confirm all of these are still true:

- `src` is a directory path and `dest` is a file path with an extension
- generated class names still match downstream usage
- relative image URLs still resolve from the CSS output location
- atlas JSON files still match the expected shape
- watch-mode changes still use the intended debounce delay
