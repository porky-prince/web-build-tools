# Images2atlas Unit Test Plan

## Goals
- Cover the main behaviors of `images2atlas`: option validation, directory traversal,
  PNG handling, and output generation.
- Reduce reliance on external libraries and real image processing with controllable
  mocks.

## Scope
- Exported function `images2atlas` (exercise constructor + packing flow internally).
- Recursive directory processing and output file generation.
- Validate only this module's logic; do not verify third-party parameter details or
  watch mode.

## Dependencies and Mocking Strategy
- `spritesmith`: mock `Spritesmith.run` to return fixed `coordinates/properties/image`
  and avoid real sprite generation.
- `spritesheet-templates`: mock to return a fixed string for content assertions.
- `web-build-utils/isSafeFilename`: mock to `true/false` as needed for filtering.

## Tech Stack
- Test framework: Jest (ts-jest)
- Language: TypeScript
- Mocks/assertions: Jest built-in mocks and assertion APIs
- Filesystem: fs-extra (fixtures and file I/O)

## Fixtures and Helpers
- Use `fs-extra` to create a temporary directory structure (recommended under
  `packages/images2atlas/test/fixtures` or `os.tmpdir()`), and write:
  - PNG placeholders (empty Buffer is sufficient).
  - Non-PNG files (e.g., `.txt`) for copy tests.
- Clean up temp directories after each test.

## Input Directory Examples (paired with output)
> Sample input fixtures to mirror in output assertions.

**Example 1: PNG only**
```
src/
└── icons/
    ├── a.png
    └── b.png
```

**Example 2: With non-PNG files**
```
src/
└── icons/
    ├── a.png
    ├── b.png
    └── readme.txt
```

**Example 3: Recursive**
```
src/
└── icons/
    ├── root.png
    └── sub/
        └── sub.png
```

## Output Structure Examples (visual verification)
> Expected directory structures asserted in tests, using placeholder PNGs + mocked
> sprite output for visibility via tree output.

**Example 1: PNG only + suffix = -atlas + format = css**
```
dest/
├── icons-atlas.png
└── icons-atlas.css
```

**Example 2: With non-PNG files**
```
dest/
├── readme.txt
├── icons-atlas.png
└── icons-atlas.css
```

**Example 3: Recursive**
```
dest/
├── root-atlas.png
├── root-atlas.css
└── sub/
    ├── sub-atlas.png
    └── sub-atlas.css
```

## Test Output Visualization
- In addition to assertions, tests will print directory trees for input and output
  to make results easy to inspect.
- Suggested approach: recursively build a tree string and print it (or snapshot it).
  Example format:
```
INPUT:
src/
└── icons/
    ├── a.png
    └── b.png

OUTPUT:
dest/
├── icons-atlas.png
└── icons-atlas.css
```

## Planned Test Cases
1. **Option validation**
   - Throw when `src` does not exist or is not a directory.
   - Throw when `dest` has a file extension (e.g., `out.png`).

2. **No PNG → no atlas**
   - Only non-PNG files:
     - Files are copied to destination.
     - `Spritesmith.run` is not called.
     - No `*-atlas.*` output is generated.

3. **PNG handling with include/exclude**
   - `include` returns `false`: PNG is not included in atlas but is copied.
   - `exclude` returns `true`: file/dir is ignored, not copied, not atlased.

4. **Output naming and template format**
   - With `suffix` and `templatesOptions.format = 'css'`:
     - Generate `${dest}${suffix}.png` and `${dest}${suffix}.css`.
     - Template content matches mock output.
   - Unsupported `format` falls back to `.txt`.

5. **Recursive packing**
   - Subdirectories with PNGs:
     - Subdirectory `dest` gets atlas output.
     - Root directory still produces its own output.

6. **Third-party trust boundary**
   - Do not verify parameter correctness for `Spritesmith`/`spritesheet-templates`/
     `chokidar`.
   - Assert only this module's outputs and branching behavior.

## Test File Recommendation
- Add `packages/images2atlas/test/images2atlas.test.ts` (or replace the placeholder
  test file).

## Delivery Checklist
- Jest passes (at minimum `pnpm --filter images2atlas test`).
- Coverage hits key branches in `src/index.ts`: validation, empty PNG set, format
  selection, recursion.
