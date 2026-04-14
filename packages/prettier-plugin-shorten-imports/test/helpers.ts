import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { shortenImports } from '../src/shorten-imports';

// Track temp dirs so we can always clean up after each test.
const tempDirs: string[] = [];

export async function makeTempDir() {
  // Use the OS temp directory for isolated test fixtures.
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'shorten-imports-'));
  tempDirs.push(dir);
  return dir;
}

export async function writeFile(filePath: string, content = '') {
  // Ensure the directory exists before writing the file.
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content);
}

export async function formatWithPlugin(code: string, filePath: string) {
  // Ensure the file directory exists so resolver basedir is valid.
  await fs.ensureDir(path.dirname(filePath));
  // Create an empty file on disk so any file-based checks succeed.
  await fs.ensureFile(filePath);
  // Apply the plugin's preprocessing logic without invoking Prettier.
  return shortenImports(code, filePath);
}

export async function cleanupTempDirs() {
  // Remove all temp fixtures created during the test.
  await Promise.all(tempDirs.splice(0).map((dir) => fs.remove(dir)));
}
