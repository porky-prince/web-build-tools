import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import templater from 'spritesheet-templates';
import Spritesmith from 'spritesmith';
import { isSafeFilename } from 'web-build-utils';
import { images2atlas } from '../src';

jest.mock('spritesheet-templates', () => ({
  __esModule: true,
  default: jest.fn(() => 'TEMPLATE_OUTPUT'),
}));

jest.mock('spritesmith', () => ({
  __esModule: true,
  default: {
    run: jest.fn(),
  },
}));

jest.mock('web-build-utils', () => ({
  isSafeFilename: jest.fn(() => true),
}));

// Cast mocked modules to Jest mocks for easier stubbing.
const mockedSpritesmith = Spritesmith as unknown as {
  run: jest.Mock;
};
const mockedTemplater = templater as unknown as jest.Mock;
const mockedIsSafeFilename = isSafeFilename as unknown as jest.Mock;

const tempDirs: string[] = [];

// Create and track a temp directory so we can clean it up after tests.
async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'images2atlas-'));
  tempDirs.push(dir);
  return dir;
}

// Use a stable layout so tree output is easy to read.
async function makeFixtureDirs() {
  const tempDir = await makeTempDir();
  const srcDir = path.join(tempDir, 'src', 'icons');
  const destDir = path.join(tempDir, 'out', 'icons');
  const outputRoot = path.join(tempDir, 'out');
  return { tempDir, srcDir, destDir, outputRoot };
}

// Write a small fixture file (PNG is just a placeholder buffer).
async function writeFile(filePath: string, contents: Buffer | string = 'data') {
  await fs.outputFile(filePath, contents);
}

// Build a stable directory tree for console output.
function formatTree(label: string, rootPath: string): string {
  const rootName = path.basename(rootPath);
  if (!fs.existsSync(rootPath)) {
    return `${label}:\n${rootName}/ (missing)`;
  }

  const lines: string[] = [`${label}:`, `${rootName}/`];

  const walk = (dirPath: string, prefix: string) => {
    const entries = fs
      .readdirSync(dirPath, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));

    entries.forEach((entry, index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? '`-- ' : '|-- ';
      const entryName = entry.isDirectory() ? `${entry.name}/` : entry.name;
      lines.push(`${prefix}${connector}${entryName}`);

      if (entry.isDirectory()) {
        const nextPrefix = prefix + (isLast ? '    ' : '|   ');
        walk(path.join(dirPath, entry.name), nextPrefix);
      }
    });
  };

  walk(rootPath, '');
  return lines.join('\n');
}

// Emit input/output trees for visual inspection in test output.
function logTrees(caseName: string, inputRoot: string, outputRoot: string) {
  console.log(`\n[${caseName}]`);
  console.log(formatTree('INPUT', inputRoot));
  console.log(formatTree('OUTPUT', outputRoot));
}

beforeEach(() => {
  // Stub spritesmith so tests do not rely on real image processing.
  mockedSpritesmith.run.mockImplementation(
    (
      options: { src: string[] },
      cb: (err: Error | null, result?: any) => void
    ) => {
      const coordinates: Record<
        string,
        { x: number; y: number; width: number; height: number }
      > = {};
      options.src.forEach((imgPath) => {
        coordinates[imgPath] = { x: 0, y: 0, width: 10, height: 10 };
      });
      cb(null, {
        coordinates,
        properties: { width: 10, height: 10 },
        image: Buffer.from('image'),
      });
    }
  );

  mockedTemplater.mockReturnValue('TEMPLATE_OUTPUT');
  mockedIsSafeFilename.mockReturnValue(true);
});

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.remove(dir)));
  jest.clearAllMocks();
});

describe('images2atlas', () => {
  test('throws when src does not exist or is not a directory', async () => {
    const tempDir = await makeTempDir();
    const filePath = path.join(tempDir, 'file.txt');
    await writeFile(filePath, 'content');

    expect(() =>
      images2atlas({
        src: path.join(tempDir, 'missing-dir'),
        dest: path.join(tempDir, 'dest'),
      })
    ).toThrow('The options.src must be a directory.');

    expect(() =>
      images2atlas({
        src: filePath,
        dest: path.join(tempDir, 'dest'),
      })
    ).toThrow('The options.src must be a directory.');
  });

  test('throws when dest has a file extension', async () => {
    const tempDir = await makeTempDir();
    const srcDir = path.join(tempDir, 'src');
    await fs.ensureDir(srcDir);

    expect(() =>
      images2atlas({
        src: srcDir,
        dest: path.join(tempDir, 'dest.png'),
      })
    ).toThrow('The options.dest must be a directory.');
  });

  test('copies non-png files and does not generate atlas when no png', async () => {
    const { srcDir, destDir, outputRoot } = await makeFixtureDirs();

    await writeFile(path.join(srcDir, 'readme.txt'), 'hello');

    await images2atlas({
      src: srcDir,
      dest: destDir,
      silent: true,
    });

    logTrees('no-png', srcDir, outputRoot);

    expect(await fs.pathExists(path.join(destDir, 'readme.txt'))).toBe(true);
    expect(mockedSpritesmith.run).not.toHaveBeenCalled();
    expect(await fs.pathExists(destDir + '-atlas.png')).toBe(false);
  });

  test('include=false copies png but skips atlas generation', async () => {
    const { srcDir, destDir, outputRoot } = await makeFixtureDirs();

    await writeFile(path.join(srcDir, 'a.png'), Buffer.from('png'));

    await images2atlas({
      src: srcDir,
      dest: destDir,
      include: () => false,
      silent: true,
    });

    logTrees('include-false', srcDir, outputRoot);

    expect(await fs.pathExists(path.join(destDir, 'a.png'))).toBe(true);
    expect(await fs.pathExists(destDir + '-atlas.css')).toBe(false);
    expect(await fs.pathExists(destDir + '-atlas.png')).toBe(false);
    expect(mockedSpritesmith.run).not.toHaveBeenCalled();
  });

  test('exclude=true skips files and output', async () => {
    const { srcDir, destDir, outputRoot } = await makeFixtureDirs();

    await writeFile(path.join(srcDir, 'a.png'), Buffer.from('png'));
    await writeFile(path.join(srcDir, 'readme.txt'), 'hello');

    await images2atlas({
      src: srcDir,
      dest: destDir,
      exclude: () => true,
      silent: true,
    });

    logTrees('exclude-true', srcDir, outputRoot);

    expect(await fs.pathExists(destDir)).toBe(false);
    expect(mockedSpritesmith.run).not.toHaveBeenCalled();
  });

  test('generates atlas files with suffix and format', async () => {
    const { srcDir, destDir, outputRoot } = await makeFixtureDirs();

    await writeFile(path.join(srcDir, 'a.png'), Buffer.from('png'));
    await writeFile(path.join(srcDir, 'b.png'), Buffer.from('png'));

    await images2atlas({
      src: srcDir,
      dest: destDir,
      suffix: '-atlas',
      templatesOptions: { format: 'stylus' },
      silent: true,
    });

    logTrees('atlas-styl', srcDir, outputRoot);

    expect(await fs.pathExists(destDir + '-atlas.png')).toBe(true);
    expect(await fs.pathExists(destDir + '-atlas.styl')).toBe(true);
    expect(await fs.readFile(destDir + '-atlas.styl', 'utf8')).toBe(
      'TEMPLATE_OUTPUT'
    );
  });

  test('generates atlas files with custom format', async () => {
    const { srcDir, destDir, outputRoot } = await makeFixtureDirs();

    await writeFile(path.join(srcDir, 'a.png'), Buffer.from('png'));

    await images2atlas({
      src: srcDir,
      dest: destDir,
      templatesOptions: { format: 'custom' },
      silent: true,
    });

    logTrees('atlas-custom', srcDir, outputRoot);

    expect(await fs.pathExists(destDir + '-atlas.custom')).toBe(true);
    expect(await fs.pathExists(destDir + '-atlas.png')).toBe(true);
  });

  test('recursively generates atlas files for subdirectories', async () => {
    const { srcDir, destDir, outputRoot } = await makeFixtureDirs();

    await writeFile(path.join(srcDir, 'root.png'), Buffer.from('png'));
    await writeFile(path.join(srcDir, 'sub', 'sub.png'), Buffer.from('png'));

    await images2atlas({
      src: srcDir,
      dest: destDir,
      silent: true,
    });

    logTrees('recursive', srcDir, outputRoot);

    expect(await fs.pathExists(destDir + '-atlas.png')).toBe(true);
    expect(await fs.pathExists(destDir + '-atlas.css')).toBe(true);
    expect(await fs.pathExists(path.join(destDir, 'sub-atlas.png'))).toBe(true);
    expect(await fs.pathExists(path.join(destDir, 'sub-atlas.css'))).toBe(true);
  });

  test('skips paths when isSafeFilename returns false', async () => {
    const { srcDir, destDir, outputRoot } = await makeFixtureDirs();

    await writeFile(path.join(srcDir, 'a.png'), Buffer.from('png'));

    mockedIsSafeFilename.mockReturnValue(false);

    await images2atlas({
      src: srcDir,
      dest: destDir,
      silent: true,
    });

    logTrees('unsafe-path', srcDir, outputRoot);

    expect(await fs.pathExists(destDir)).toBe(false);
    expect(mockedSpritesmith.run).not.toHaveBeenCalled();
  });
});
