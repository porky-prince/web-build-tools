import type { Parser, Plugin } from 'prettier';
import { parsers as babelParsers } from 'prettier/plugins/babel';
import { parsers as htmlParsers } from 'prettier/plugins/html';
import { parsers as tsParsers } from 'prettier/plugins/typescript';
import { shortenImports } from './shorten-imports';

// Set `shortenImports` as the given parser's `preprocess` hook, or merge it with the existing one.
const withShortenImportsPreprocess = (parser: Parser): Parser => {
  return {
    ...parser,
    // Prettier invokes preprocess before parsing; we keep the original hook,
    // then run our import rewriting on the resulting text.
    preprocess: (code, options) =>
      shortenImports(
        parser.preprocess ? parser.preprocess(code, options) : code,
        options?.filepath
      ),
  };
};

const plugin: Plugin = {
  // Wrap built-in parsers so the plugin works across JS/TS/Vue.
  parsers: {
    babel: withShortenImportsPreprocess(babelParsers.babel),
    'babel-ts': withShortenImportsPreprocess(babelParsers['babel-ts']),
    typescript: withShortenImportsPreprocess(tsParsers.typescript),
    vue: withShortenImportsPreprocess(htmlParsers.vue),
  },
};

export default plugin;
export { plugin };
