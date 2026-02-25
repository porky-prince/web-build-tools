import type webpack from 'webpack';
import { images2atlas, Images2atlasOptions } from 'images2atlas';

type Plugin = webpack.WebpackPluginInstance;
type Compiler = webpack.Compiler;
// type Compilation = webpack.Compilation;

/**
 * Images2atlasWebpackPlugin
 *
 * Webpack plugin to generate a spritesheet atlas and style/template files from a directory of PNG images.
 * Automatically watches for changes and repacks as needed.
 */
export default class Images2atlasWebpackPlugin implements Plugin {
  constructor(private _options: Images2atlasOptions) {}

  // Returns the plugin name for logging
  private get pluginName() {
    return this.constructor.name;
  }

  /**
   * Webpack plugin entry point.
   * Sets up hooks for build and watch modes, triggers packing and file watching.
   */
  apply(compiler: Compiler) {
    const options = this._options;
    options.watch = false;
    const pack = () => images2atlas(options);

    // Pack images when build starts
    compiler.hooks.run.tapPromise(this.pluginName, pack);

    // Watch for changes and repack in watch mode
    let once = false;
    compiler.hooks.watchRun.tapPromise(this.pluginName, async () => {
      if (once) {
        return;
      }
      once = true;
      options.watch = true;
      await pack();
    });
  }
}
