import { template } from 'es-toolkit/compat';
import { join } from 'node:path';
import { copyFiles, question } from 'web-build-utils';
import { PACKAGES_PATH, TEMPLATES_PATH } from './consts';

async function main() {
  const packageName = await question('Package Name: ');
  const src = join(TEMPLATES_PATH, 'package');
  const dest = join(PACKAGES_PATH, packageName);
  console.log('Creating...');
  await copyFiles(src, dest, {
    transform: (_, __, content) => {
      return template(String(content))({ packageName });
    },
  });
  console.log('Created!');
}
main();
