import type { Parser, Plugin, ParserOptions } from 'prettier';
const { parsers: babelParsers } = require('prettier/parser-babel');
const { parsers: htmlParsers } = require('prettier/parser-html');
const { parsers: tsParsers } = require('prettier/parser-typescript');
import { shorten } from './shorten';

// Shorten the code's imports using the `shortenImports`.
const shortenImports = (code: string, options: ParserOptions) => {
  if (
    code.includes('// shorten-imports-ignore') ||
    code.includes('// tslint:disable:shorten-imports')
  ) {
    return code;
  }

  const isRange =
    Boolean(options.originalText) ||
    options.rangeStart !== 0 ||
    (options.rangeEnd !== Infinity && options.rangeEnd !== code.length);

  if (isRange) {
    return code; // processing a range doesn't make sense
  }

  try {
    code = shorten(code, options.filepath);
    options.rangeEnd = code.length;
    return code;
  } catch (error) {
    if (process.env.DEBUG) {
      console.error(error);
    }

    return code;
  }
};

// Set `shortenImports` as the given parser's `preprocess` hook, or merge it with the existing one.
const withShortenImportsPreprocess = (parser: Parser): Parser => {
  // Prettier invokes preprocess before parsing; we keep the original hook,
  // then run our import rewriting on the resulting text.
  const preprocess = parser.preprocess;
  parser.preprocess = (code, options) =>
    shortenImports(
      preprocess ? preprocess.call(parser, code, options) : code,
      options
    );

  return parser;
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

module.exports = plugin;
