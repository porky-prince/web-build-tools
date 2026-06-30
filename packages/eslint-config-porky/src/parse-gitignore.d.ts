declare module 'parse-gitignore' {
  interface Result {
    patterns: string[];
  }

  function parse(input: string | Buffer, options?: unknown): Result;
  export = parse;
}
