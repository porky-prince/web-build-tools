# prettier-plugin-shorten-imports

This plugin rewrites local import and export specifiers to the shortest path
depth based on your `tsconfig.json` or `jsconfig.json` `paths` mappings. You
can use it to keep imports consistent and avoid long relative paths.

## Features
This section summarizes what the plugin does when Prettier formats a file.

- Supports `.js`, `.jsx`, `.ts`, `.tsx`, and `.vue` files.
- Rewrites only static `import` and `export ... from` specifiers.
- Compares relative paths and `paths` aliases and keeps the shortest depth.
- Preserves existing file extensions and normalizes to POSIX separators.
- Skips specifiers that resolve to `node_modules` or outside the project root.

## Installation
Use your package manager to add the plugin as a development dependency.

```
pnpm add -D prettier-plugin-shorten-imports
```

## Usage
You must register the plugin with Prettier before formatting your files.

```
prettier --plugin=prettier-plugin-shorten-imports --write "src/**/*.{ts,tsx}"
```

If you use a Prettier config file, add the plugin to the `plugins` list:

```
{
  "plugins": ["prettier-plugin-shorten-imports"]
}
```

## Configuration
The plugin reads the nearest `tsconfig.json` or `jsconfig.json` from the
current file location. It uses `compilerOptions.paths` and `baseUrl` from the
nearest config to resolve aliases.

If `paths` exist but `baseUrl` is missing, the plugin treats the config file
directory as the `baseUrl` root. If no `paths` are defined, the plugin does
not change specifiers.

## Behavior
This section lists key rules that influence how specifiers are rewritten.

- The plugin keeps the original specifier when depth and string length tie.
- For `.vue` files, it only updates `<script>` and `<script setup>` blocks.
- It does not change `<script src="...">` external scripts.
- It does not touch dynamic `import()` or `require()` calls.

## Example
This example shows an alias winning over a deeper relative path.

`tsconfig.json`:

```
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/*"]
    }
  }
}
```

Input:

```
import { formatName } from "../../utils/format";
```

Output:

```
import { formatName } from "@app/utils/format";
```
