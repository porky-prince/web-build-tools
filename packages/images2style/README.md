# images2style

Generate a single CSS file with background-image rules for images in a folder.
If an atlas JSON (same name, `.json`) exists next to an image, rules are
created for each frame in that atlas instead of a single image rule.

I built this tool after seeing how painful image handling can be in front-end
work. Inspired by Tailwind CSS, it gives you one class-based workflow for
single images, atlases, and multiple image formats. Whether you apply classes
directly or generate them dynamically, IDE autocomplete helps you find and
use the right image class fast.

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
  src: 'assets/img',
  dest: 'public/img.css',
});
```

### Use in client

Use the generated CSS in your app and apply the classes to elements.

Include the CSS file in your HTML.
```html
<link rel="stylesheet" href="./img.css">
```

The plugin includes a utility class that Tailwind CSS doesn't include.
```css
.bg-full {
  background-size: 100% 100%;
}
```

Examples:
- Use a single image class directly. You can pair it with `bg-full`,
  `bg-cover`, or `bg-contain`.
  ```html
  <div class="size-full img-bg-jpg bg-full"></div>
  ```
- Use a single image class dynamically.
  ```jsx
  <div className={`size-full img-bg-${level}-png bg-cover`}></div>
  ```
- Use an atlas class directly. It defaults to `bg-full` and doesn't support
  `bg-cover` or `bg-contain`.
  ```html
  <div class="size-full img-home-atlas-title"></div>
  ```
- Use an atlas class dynamically.
  ```jsx
  <div className={`size-full img-home-atlas-avatar-${index}`}></div>
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
Use these notes to understand how filters and paths are interpreted.
- `exclude` runs on both files and directories. Return `true` to skip a path
  and its children.
- `include` only runs on image files that pass the extension check. Return
  `true` to include the image in output.
- `src` must be a directory path with no file extension.
- `dest` must be a file path with an extension.

## Output

The generated CSS includes class names and image URLs derived from your
`src` and `dest` paths.
It also adds a header comment and the `.bg-full` utility class at the top of
the output file.

### Class names

Class names are generated from the relative path to the image directory plus
the file name. The base directory is the parent of `src`, so files directly
under `src` include the `src` directory name:

```
assets/logo.png            -> .assets-logo-png
assets/icons/ui/play.svg   -> .assets-icons-ui-play-svg
```

Single-image classes include the file extension, with the dot replaced by a
dash. Atlas frame classes omit the image extension and append the frame name:

```
assets/sprites/sheet.png + sheet.json (frame: icon)
  -> .assets-sprites-sheet-icon
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
