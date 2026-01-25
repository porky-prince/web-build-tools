# images2atlas

Generate a spritesheet atlas and matching style/template output from a directory
of PNG images. This module scans folders recursively, copies non-PNG files as-is,
and produces atlas files per directory with configurable formats and suffixes.

## Core Features
- Directory-based spritesheet generation (one atlas per folder).
- Recursive traversal with include/exclude filters.
- Copies non-PNG files into the destination tree.
- Multiple template formats via [`spritesheet-templates`](https://github.com/twolfson/spritesheet-templates).
- Optional watch mode with debounced re-pack on changes.

## Installation
```
npm install images2atlas --save-dev
```

## Usage
```ts
import { images2atlas } from 'images2atlas';

await images2atlas({
  src: '/path/to/icons',
  dest: '/path/to/output/icons',
  templatesOptions: { format: 'css' },
  suffix: '-atlas',
});
```

## Options
| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | `string` | required | Source directory containing images. Must be a directory. |
| `dest` | `string` | required | Destination directory (no file extension). |
| `cwd` | `string` | `process.cwd()` | Base path for generating the spritesheet image reference. |
| `exclude` | `(info, src) => boolean` | `() => false` | Return `true` to skip a file or folder. |
| `include` | `(info, src) => boolean` | `() => true` | Return `true` to include a PNG in the atlas. |
| `suffix` | `string` | `-atlas` | Output suffix for atlas files. |
| `delay` | `number` | `500` | Debounce delay (ms) for watch mode. |
| `silent` | `boolean` | `true` | Suppress logging when `true`. |
| `watch` | `boolean` | `false` | Watch `src` and re-pack on changes. |
| `spritesmithOptions` | `object` | `{ padding: 2, exportOpts: { format: 'png', quality: 100 } }` | Options passed to [`spritesmith`](https://github.com/twolfson/spritesmith). |
| `templatesOptions` | `object` | `{}` | Options passed to [`spritesheet-templates`](https://github.com/twolfson/spritesheet-templates). |

## Output Behavior
Each directory with PNG files generates a pair of outputs in its corresponding
`dest` folder:

- `${dest}${suffix}.png` (the atlas image)
- `${dest}${suffix}.<ext>` (template output)

The template file extension is derived from `templatesOptions.format`, supporting:
`css`, `json`, `less`, `sass`, `scss`, `styl`. Unknown formats fall back to `txt`.

The spritesheet image reference in templates uses the pattern:
```
~/<relative-path-from-cwd><suffix>.png
```

## Example Structure
Input:
```
src/
└── icons/
    ├── a.png
    ├── b.png
    └── readme.txt
```

Output (with `suffix: '-atlas'` and `format: 'css'`):
```
dest/
└── icons/
    ├── readme.txt
    ├── icons-atlas.png
    └── icons-atlas.css
```

## Notes
- Only `.png` files are packed into the atlas. Non-PNG files are copied through.
- `include` only affects whether a PNG participates in the atlas. If `include`
  returns `false`, the PNG is copied instead.
- `exclude` skips both atlas participation and file copying for the matched path.
- Filenames are filtered via `isSafeFilename` from [`web-build-utils`](https://github.com/porky-prince/web-build-tools/packages/web-build-utils).
