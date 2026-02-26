import type { Parser, Plugin } from 'prettier';
import * as babelParsers from 'prettier/plugins/babel';
import * as htmlParsers from 'prettier/plugins/html';
import * as tsParsers from 'prettier/plugins/typescript';
import { shortenImports } from './shorten-imports';

// Prettier preprocess hook to rewrite imports before formatting.
const preprocess = (text: string, options: { filepath?: string }) =>
  shortenImports(text, options.filepath);

// Wrap built-in parsers so the plugin works across JS/TS/Vue.
const parsers: Plugin['parsers'] = {
  babel: {
    ...(babelParsers.parsers.babel as Parser),
    preprocess,
  },
  'babel-flow': {
    ...(babelParsers.parsers['babel-flow'] as Parser),
    preprocess,
  },
  'babel-ts': {
    ...(babelParsers.parsers['babel-ts'] as Parser),
    preprocess,
  },
  typescript: {
    ...(tsParsers.parsers.typescript as Parser),
    preprocess,
  },
  vue: {
    ...(htmlParsers.parsers.vue as Parser),
    preprocess,
  },
};

const plugin: Plugin = {
  parsers,
};

export default plugin;
export { plugin };
