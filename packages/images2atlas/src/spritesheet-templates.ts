interface Options {
  // spritesheetName?: string;
  format?: string;
  formatOpts?: Record<string, any>;
}

const templater = require('spritesheet-templates') as (
  data: any,
  options: Options
) => string;

export = templater;
