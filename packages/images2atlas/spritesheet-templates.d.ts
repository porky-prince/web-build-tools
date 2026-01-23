declare module 'spritesheet-templates' {
  interface Options {
    // spritesheetName?: string;
    format?: string;
    formatOpts?: Record<string, any>;
  }

  function templater(data: any, options: Options): string;
  export = templater;
}
