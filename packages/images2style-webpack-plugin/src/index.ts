import type webpack from 'webpack';
import { images2style, Images2styleOptions } from 'images2style';

type Plugin = webpack.WebpackPluginInstance;
type Compiler = webpack.Compiler;
// type Compilation = webpack.Compilation;

/**
 * Main Webpack plugin class for generating CSS styles from images.
 * Watches the source directory, processes images and atlas files, and writes CSS to the destination file.
 */
export default class Images2styleWebpackPlugin implements Plugin {
  constructor(private _options: Images2styleOptions) {}

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
    const pack = () => images2style(options);

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
