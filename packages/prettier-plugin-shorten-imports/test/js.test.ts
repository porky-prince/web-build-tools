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

describe('prettier-plugin-shorten-imports (js)', () => {
  test('rewrites JS imports using alias mappings', async () => {
    const root = await makeTempDir();
    await writeFile(
      path.join(root, 'jsconfig.json'),
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

    const filePath = path.join(root, 'src', 'pages', 'home', 'index.js');
    const targetPath = path.join(root, 'src', 'utils', 'format.js');
    await writeFile(targetPath, 'export const formatName = () => "x";');

    const input = 'import { formatName } from "../../utils/format";\n';
    const output = await formatWithPlugin(input, filePath);

    expect(output.trim()).toBe(
      'import { formatName } from "@app/utils/format";'
    );
  });

  test('keeps relative path when it is shorter than alias', async () => {
    const root = await makeTempDir();
    await writeFile(
      path.join(root, 'jsconfig.json'),
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

    const filePath = path.join(root, 'src', 'utils', 'index.js');
    const targetPath = path.join(root, 'src', 'utils', 'format.js');
    await writeFile(targetPath, 'export const formatName = () => "x";');

    const input = 'import { formatName } from "./format";\n';
    const output = await formatWithPlugin(input, filePath);

    expect(output.trim()).toBe('import { formatName } from "./format";');
  });

  test('handles JSX files with the Babel parser', async () => {
    const root = await makeTempDir();
    await writeFile(
      path.join(root, 'jsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            baseUrl: '.',
            paths: {
              '@ui/*': ['src/ui/*'],
            },
          },
        },
        null,
        2
      )
    );

    const filePath = path.join(root, 'src', 'components', 'Card.jsx');
    const targetPath = path.join(root, 'src', 'ui', 'colors.js');
    await writeFile(targetPath, 'export const colors = {};');

    const input = 'import { colors } from "../ui/colors";\n';
    const output = await formatWithPlugin(input, filePath);

    expect(output.trim()).toBe('import { colors } from "@ui/colors";');
  });
});
