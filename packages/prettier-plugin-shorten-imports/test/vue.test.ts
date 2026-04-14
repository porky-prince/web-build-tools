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

describe('prettier-plugin-shorten-imports (vue)', () => {
  test('updates Vue script blocks only', async () => {
    const root = await makeTempDir();
    // Alias config is present for Vue SFC handling.
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

    const filePath = path.join(root, 'src', 'components', 'forms', 'Card.vue');
    const targetPath = path.join(root, 'src', 'utils', 'format.ts');
    await writeFile(targetPath, 'export const formatName = () => "x";');

    // Only <script setup> imports should be rewritten; template stays intact.
    const input = `
<template>
  <div>{{ message }}</div>
</template>
<script src="./entry.ts"></script>
<script setup lang="ts">
import { formatName } from "../../utils/format";
</script>
`;

    const output = await formatWithPlugin(input, filePath);

    expect(output).toContain('from "@app/utils/format"');
    expect(output).toContain('<script src="./entry.ts"></script>');
    expect(output).toContain('<template>');
  });
});
