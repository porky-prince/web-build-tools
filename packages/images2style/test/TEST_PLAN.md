# Images2style Unit Test Plan

## Goals
- Cover core behaviors of `images2style`: option validation, recursive scanning,
  atlas JSON handling, and CSS output generation.
- Keep tests stable by using filesystem fixtures and minimal mocking.

## Scope
- Exported function `images2style` (constructor + runPack + pack + genStyle).
- Output CSS content and naming for image and atlas inputs.
- Validate only this module's logic; do not verify third-party libraries.

## Dependencies and Mocking Strategy
- `web-build-utils/isSafeFilename`: mock to `true/false` for skip behavior.
- `fs-extra`: real filesystem for fixtures and output assertions.

## Tech Stack
- Test framework: Jest (ts-jest)
- Language: TypeScript
- Mocks/assertions: Jest built-in mocks and assertions
- Filesystem: fs-extra + os.tmpdir (or test fixtures directory)

## Fixtures and Helpers
- Create temporary directories and empty image files (contents are not read).
- Use a minimal atlas JSON file with `meta.size` and `frames`.
- Set `cwd` to the temp root to make `imagePath` predictable.

## Example Fixture Layouts
**Example A: Flat images**
```
assets/
└── icons/
    ├── logo.png
    └── banner.jpg
```

**Example B: Nested images**
```
assets/
└── icons/
    └── ui/
        └── play.svg
```

**Example C: Atlas**
```
assets/
└── sprites/
    ├── sheet.png
    └── sheet.json
```

## Planned Test Cases
1. **Option validation**
   - `src` with an extension throws.
   - `dest` without an extension throws.

2. **Basic pack (non-atlas)**
   - Generates CSS for supported image extensions only.
   - Output file includes the global template header and `.bg-full` block.
   - Class naming uses `path.relative(dirname(src), dirname(file))` and
     `info.ext` suffix (e.g. `icons-logo-png`).
   - File directly under `src` includes the `src` directory name in the class
     (e.g. `assets-logo-png`).
   - Order of CSS blocks is not asserted (Promise.all concurrency).

3. **Include/exclude/isSafeFilename**
   - `include` returning `false` skips an image.
   - `exclude` returning `true` skips an image or directory (no recursion).
   - `isSafeFilename` returning `false` skips the entry.

4. **Transform hook**
   - `transform` receives the generated CSS content and returns the final output.
   - Output file reflects the transformed content for both non-atlas and atlas
     cases.

5. **Atlas JSON handling**
   - Valid atlas JSON generates one rule per frame with atlas-style properties.
   - Percent values match `toPercent` math (use simple sizes for deterministic
     values like 0 and 200).
   - Invalid atlas JSON falls back to a single image-style rule.

6. **Recursive traversal**
   - Nested directories produce class names with hyphenated path segments
     (e.g. `icons-ui-play-svg`).
   - Combined output aggregates rules from all subdirectories.

## Non-goals
- Do not test image decoding or actual spritesheet layout.
- Do not validate third-party library behavior.
- Do not test watch mode behavior or file system watching.
- Do not test `silent` logging behavior.

## Delivery Checklist
- Jest passes (at minimum `pnpm --filter images2style test`).
- Coverage hits validation, atlas branch, recursion, include/exclude, and
  transform hooks.
