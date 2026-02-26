import path from 'path';
import {
  cleanupTempDirs,
  formatWithPlugin,
  makeTempDir,
  writeFile,
} from './helpers';

afterEach(async () => {
  await cleanupTempDirs();
});

describe('prettier-plugin-shorten-imports (ts)', () => {
  test('rewrites to alias when it has fewer segments', async () => {
    const root = await makeTempDir();
    const tsconfigPath = path.join(root, 'tsconfig.json');
    // Provide a simple alias mapping so @app/* points at src/*.
    await writeFile(
      tsconfigPath,
      JSON.stringify(
        {
          compilerOptions: {
            baseUrl: '.',
            paths: {
              '@app/*': ['src/*'],
            },
          },
        },
        null,
        2
      )
    );

    // Create a target module that can be resolved from the import.
    const filePath = path.join(root, 'src', 'features', 'user', 'profile.ts');
    const targetPath = path.join(root, 'src', 'utils', 'format.ts');
    await writeFile(targetPath, 'export const formatName = () => "x";');

    // Relative path is deeper than the alias, so it should be rewritten.
    const input = 'import { formatName } from "../../utils/format";\n';
    const output = await formatWithPlugin(input, filePath);

    expect(output.trim()).toBe(
      'import { formatName } from "@app/utils/format";'
    );
  });

  test('keeps the original when depth and length tie', async () => {
    const root = await makeTempDir();
    // Same alias config as the previous test.
    await writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            baseUrl: '.',
            paths: {
              '@app/*': ['src/*'],
            },
          },
        },
        null,
        2
      )
    );

    const filePath = path.join(root, 'src', 'features', 'user', 'profile.ts');
    const targetPath = path.join(root, 'src', 'utils', 'format.ts');
    await writeFile(targetPath, 'export const formatName = () => "x";');

    // Alias and relative paths tie, so the original alias should remain.
    const input = 'import { formatName } from "@app/utils/format";\n';
    const output = await formatWithPlugin(input, filePath);

    expect(output.trim()).toBe(
      'import { formatName } from "@app/utils/format";'
    );
  });

  test('uses baseUrl when resolving alias paths', async () => {
    const root = await makeTempDir();
    // baseUrl shifts the paths resolution root to "src".
    await writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            baseUrl: 'src',
            paths: {
              '@app/*': ['shared/*'],
            },
          },
        },
        null,
        2
      )
    );

    const filePath = path.join(root, 'src', 'features', 'user', 'profile.ts');
    const targetPath = path.join(root, 'src', 'shared', 'format.ts');
    await writeFile(targetPath, 'export const formatName = () => "x";');

    // Relative path should collapse to the alias based on baseUrl.
    const input = 'import { formatName } from "../../shared/format";\n';
    const output = await formatWithPlugin(input, filePath);

    expect(output.trim()).toBe('import { formatName } from "@app/format";');
  });

  test('does not touch bare package imports', async () => {
    const root = await makeTempDir();
    // Alias config is present, but bare package specifiers are ignored.
    await writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            baseUrl: '.',
            paths: {
              '@app/*': ['src/*'],
            },
          },
        },
        null,
        2
      )
    );

    const filePath = path.join(root, 'src', 'index.ts');
    const input = 'import { useState } from "react";\n';
    const output = await formatWithPlugin(input, filePath);

    expect(output.trim()).toBe('import { useState } from "react";');
  });

  test('preserves file extensions', async () => {
    const root = await makeTempDir();
    // Alias config is present; input includes the .ts extension.
    await writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            baseUrl: '.',
            paths: {
              '@app/*': ['src/*'],
            },
          },
        },
        null,
        2
      )
    );

    const filePath = path.join(root, 'src', 'features', 'user', 'profile.ts');
    const targetPath = path.join(root, 'src', 'utils', 'format.ts');
    await writeFile(targetPath, 'export const formatName = () => "x";');

    // Output should keep the .ts extension intact.
    const input = 'import { formatName } from "../../utils/format.ts";\n';
    const output = await formatWithPlugin(input, filePath);

    expect(output.trim()).toBe(
      'import { formatName } from "@app/utils/format.ts";'
    );
  });

  test('keeps relative path when it is shorter than alias', async () => {
    const root = await makeTempDir();
    await writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            baseUrl: '.',
            paths: {
              '@app/*': ['src/*'],
            },
          },
        },
        null,
        2
      )
    );

    const filePath = path.join(root, 'src', 'utils', 'index.ts');
    const targetPath = path.join(root, 'src', 'utils', 'format.ts');
    await writeFile(targetPath, 'export const formatName = () => "x";');

    // "./format" is depth 1, alias would be depth 3, so keep relative.
    const input = 'import { formatName } from "./format";\n';
    const output = await formatWithPlugin(input, filePath);

    expect(output.trim()).toBe('import { formatName } from "./format";');
  });

  test('rewrites alias to relative when the relative path is shorter', async () => {
    const root = await makeTempDir();
    await writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            baseUrl: '.',
            paths: {
              '@app/*': ['src/*'],
            },
          },
        },
        null,
        2
      )
    );

    const filePath = path.join(root, 'src', 'utils', 'index.ts');
    const targetPath = path.join(root, 'src', 'utils', 'format.ts');
    await writeFile(targetPath, 'export const formatName = () => "x";');

    // Alias is deeper than "./format", so rewrite to the relative path.
    const input = 'import { formatName } from "@app/utils/format";\n';
    const output = await formatWithPlugin(input, filePath);

    expect(output.trim()).toBe('import { formatName } from "./format";');
  });

  test('uses shorter string length when depth ties', async () => {
    const root = await makeTempDir();
    // Use a short alias prefix to test the string-length tiebreaker.
    await writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            baseUrl: '.',
            paths: {
              '#/*': ['src/*'],
            },
          },
        },
        null,
        2
      )
    );

    const filePath = path.join(root, 'src', 'features', 'profile.ts');
    const targetPath = path.join(root, 'src', 'utils', 'format.ts');
    await writeFile(targetPath, 'export const formatName = () => "x";');

    // Depth ties (../utils/format vs #/utils/format), length picks alias.
    const input = 'import { formatName } from "../utils/format";\n';
    const output = await formatWithPlugin(input, filePath);

    expect(output.trim()).toBe('import { formatName } from "#/utils/format";');
  });

  test('rewrites export from specifiers', async () => {
    const root = await makeTempDir();
    // Alias config should affect export declarations as well.
    await writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            baseUrl: '.',
            paths: {
              '@app/*': ['src/*'],
            },
          },
        },
        null,
        2
      )
    );

    const filePath = path.join(root, 'src', 'features', 'user', 'index.ts');
    const targetPath = path.join(root, 'src', 'utils', 'format.ts');
    await writeFile(targetPath, 'export const formatName = () => "x";');

    // Export specifiers should be rewritten the same way as imports.
    const input = 'export { formatName } from "../../utils/format";\n';
    const output = await formatWithPlugin(input, filePath);

    expect(output.trim()).toBe(
      'export { formatName } from "@app/utils/format";'
    );
  });

  test('shortens index imports when allowed', async () => {
    const root = await makeTempDir();
    // Alias config is present, but index resolution should still shorten.
    await writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            baseUrl: '.',
            paths: {
              '@app/*': ['src/*'],
            },
          },
        },
        null,
        2
      )
    );

    const filePath = path.join(root, 'src', 'components', 'index.ts');
    const targetPath = path.join(root, 'src', 'utils', 'index.ts');
    await writeFile(targetPath, 'export const utils = true;');

    // "../utils" is shorter than "../utils/index" when index resolution is allowed.
    const input = 'import { utils } from "../utils/index";\n';
    const output = await formatWithPlugin(input, filePath);

    expect(output.trim()).toBe('import { utils } from "../utils";');
  });

  test('skips imports that resolve into node_modules', async () => {
    const root = await makeTempDir();
    // Point an alias into node_modules to verify it is ignored.
    await writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            baseUrl: '.',
            paths: {
              '@vendor/*': ['node_modules/vendor/*'],
            },
          },
        },
        null,
        2
      )
    );

    const vendorFile = path.join(root, 'node_modules', 'vendor', 'foo.js');
    await writeFile(vendorFile, 'module.exports = {};');

    const filePath = path.join(root, 'src', 'index.ts');
    const input = 'import foo from "@vendor/foo";\n';
    const output = await formatWithPlugin(input, filePath);

    expect(output.trim()).toBe('import foo from "@vendor/foo";');
  });

  test('skips imports that resolve outside the project root', async () => {
    const root = await makeTempDir();
    const projectRoot = path.join(root, 'project');
    // Config root is /project; anything above it should be skipped.
    await writeFile(
      path.join(projectRoot, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            baseUrl: '.',
            paths: {
              '@app/*': ['src/*'],
            },
          },
        },
        null,
        2
      )
    );

    const outsidePath = path.join(root, 'outside', 'tool.ts');
    await writeFile(outsidePath, 'export const tool = true;');

    const filePath = path.join(projectRoot, 'src', 'index.ts');
    const input = 'import { tool } from "../../outside/tool";\n';
    const output = await formatWithPlugin(input, filePath);

    expect(output.trim()).toBe('import { tool } from "../../outside/tool";');
  });

  test('does not rewrite dynamic import or require calls', async () => {
    const root = await makeTempDir();
    // Dynamic import and require should not be rewritten.
    await writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            baseUrl: '.',
            paths: {
              '@app/*': ['src/*'],
            },
          },
        },
        null,
        2
      )
    );

    const targetPath = path.join(root, 'src', 'utils', 'format.ts');
    await writeFile(targetPath, 'export const formatName = () => "x";');

    const filePath = path.join(root, 'src', 'index.ts');
    const input = `
const formatA = require("../../utils/format");
const formatB = import("../../utils/format");
`;

    const output = await formatWithPlugin(input, filePath);

    expect(output).toContain('require("../../utils/format")');
    expect(output).toContain('import("../../utils/format")');
  });
});
