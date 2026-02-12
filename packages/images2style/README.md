# images2style

Generate a single CSS file with background-image rules for images in a folder.
If an atlas JSON (same name, `.json`) exists next to an image, rules are
created for each frame in that atlas instead of a single image rule.

## Core features

images2style scans your source directory recursively and writes one output CSS
file for all supported images.

- Single output CSS file for the entire source tree.
- Recursive traversal with include/exclude filters.
- Atlas JSON support for spritesheet-style positioning.
- Optional watch mode with debounced re-pack on changes.

## Install

```
npm i images2style --save-dev
```

## Usage

```ts
import { images2style } from 'images2style';

await images2style({
  src: 'assets',
  dest: 'dist/styles/images.css',
});
```

## Options

Use these options to control which files are included and where CSS is written.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | `string` | required | Source directory containing images. Must be a directory. |
| `dest` | `string` | required | Destination file path (must include an extension). |
| `exclude` | `(info, src) => boolean` | `() => false` | Return `true` to skip a file or folder. |
| `include` | `(info, src) => boolean` | `() => true` | Return `true` to include an image in the output. |
| `transform` | `(content, info, src) => string` | `(content) => content` | Transform generated CSS per image or atlas frame. |
| `delay` | `number` | `200` | Debounce delay (ms) for watch mode. |
| `silent` | `boolean` | `true` | Suppress logging when `true`. |
| `watch` | `boolean` | `false` | Watch `src` and re-pack on changes. |

Notes:
- `include` and `exclude` are evaluated for every entry; return `true` to
  include or exclude, respectively.

## Output

The generated CSS includes class names and image URLs derived from your
`src` and `dest` paths.

### Class names

Class names are generated from the relative path to the image directory plus
the file name. The base directory is the parent of `src`, so files directly
under `src` include the `src` directory name:

```
assets/logo.png            -> .assets-logo-png
assets/icons/ui/play.svg   -> .assets-icons-ui-play-svg
```

### Image paths

The CSS uses relative paths from the output CSS file location (`dest`) to each
image file:

```
background-image: url('../../assets/icons/play.svg')
```

For example, if `dest` is `dist/styles/images.css` and an image is at
`assets/icons/play.svg`, the generated URL is
`../../assets/icons/play.svg`.

### Supported extensions

`jpg`, `jpeg`, `png`, `gif`, `svg`, `webp`, `avif`

## Atlas JSON format

When an atlas JSON with the same base name is present, rules are generated for
each frame:

```json
{
  "meta": { "size": { "w": 256, "h": 256 } },
  "frames": {
    "icon": { "frame": { "x": 0, "y": 0, "w": 64, "h": 64 } }
  }
}
```

This produces:

```
.assets-sprites-sheet-icon {
  background: url('../../assets/sprites/sheet.png') 0% 0% / 400% 400% no-repeat;
}
```

## Example: transform hook

```ts
await images2style({
  src: 'assets',
  dest: 'dist/images.css',
  transform: (content) => `${content}\n/* customized */`,
});
```
