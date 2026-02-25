import { FSWatcher, watch } from 'chokidar';
import path from 'path';
import fs from 'fs-extra';
import templater from 'spritesheet-templates';
import Spritesmith from 'spritesmith';
import debounce from 'debounce';
import { isSafeFilename } from 'web-build-utils';

/**
 * Options for Images2atlas
 *
 * @property {string} src - The source directory containing images to pack. Must be a directory.
 * @property {string} dest - The destination directory for output files. Must be a directory.
 * @property {function} [exclude] - Function to exclude files/directories from packing. Receives parsed path info and full path. Return true to exclude.
 * @property {function} [include] - Function to include files/directories for packing. Receives parsed path info and full path. Return true to include.
 * @property {string} [suffix] - Suffix for output files (e.g., '-atlas'). Default is '-atlas'.
 * @property {number} [delay] - Debounce delay (ms) for packing after changes. Default is 500ms.
 * @property {boolean} [silent] - If true, suppresses plugin logging. Default is true.
 * @property {boolean} [watch] - If true, watch src and re-pack on changes. Default is false.
 * @property {object} [spritesmithOptions] - Options for Spritesmith (e.g., padding, export format, quality).
 * @property {object} [templatesOptions] - Options for spritesheet-templates (e.g., output format, custom templates).
 */
export interface Images2atlasOptions {
  src: string;
  dest: string;
  exclude?: (srcInfo: path.ParsedPath, src: string) => boolean;
  include?: (srcInfo: path.ParsedPath, src: string) => boolean;
  suffix?: string;
  delay?: number;
  silent?: boolean;
  watch?: boolean;
  spritesmithOptions?: Spritesmith.SpritesmithParams &
    Spritesmith.SpritesmithProcessImagesOptions;
  templatesOptions?: Parameters<typeof templater>[1];
}

// Supported output template formats for spritesheet-templates.
const formatTypes = ['css', 'json', 'less', 'sass', 'scss', 'styl'];

/**
 * Images2atlas
 *
 * Plugin to generate a spritesheet atlas and style/template files from a directory of PNG images.
 * Automatically watches for changes and repacks as needed.
 */
class Images2atlas {
  // Plugin options (fully resolved with defaults)
  private _options: Required<Images2atlasOptions>;
  // File watcher instance
  private _watcher: FSWatcher | null = null;

  /**
   * Constructor
   * Validates and initializes plugin options.
   * Throws error if src or dest are not directories.
   */
  constructor(options: Images2atlasOptions) {
    if (
      !fs.existsSync(options.src) ||
      !fs.statSync(options.src).isDirectory()
    ) {
      throw new Error('The options.src must be a directory.');
    }
    if (path.extname(options.dest)) {
      throw new Error('The options.dest must be a directory.');
    }

    this._options = {
      exclude: () => false,
      include: () => true,
      suffix: '-atlas',
      delay: 500,
      silent: true,
      watch: false,
      spritesmithOptions: {
        padding: 2,
        exportOpts: {
          format: 'png',
          quality: 100,
        },
      },
      templatesOptions: {},
      ...options,
    };
  }

  /**
   * Logs messages using console if not silent.
   */
  private log(...args: string[]): void {
    if (this._options.silent) {
      return;
    }
    console.log(...args);
  }

  /**
   * Initializes and returns a file watcher for the source directory.
   * Calls the provided callback on file events.
   */
  private getWatcher(
    cb: (event: string, path: string, stats?: fs.Stats) => void
  ) {
    if (!this._watcher) {
      fs.ensureDirSync(this._options.src);
      this._watcher = watch('.', {
        cwd: this._options.src,
        ignoreInitial: true,
      });
      this._watcher.on('all', cb);
    }
    return this._watcher;
  }

  runPack() {
    const { src, dest, delay, watch } = this._options;
    const pack = () => this.pack(src, dest);

    if (watch) {
      // Debounce to avoid re-packing on bursty file events.
      const delayPack = debounce(pack, delay);
      this.getWatcher((e, p) => {
        if (!isSafeFilename(p, true)) {
          return;
        }
        this.log(e, p);
        delayPack();
      });
    }

    return pack();
  }

  /**
   * Packs images from the source directory into the destination directory.
   * Recursively processes files and directories, collects PNGs for spritesheet, copies other files.
   * @param src Source directory
   * @param dest Destination directory
   */
  private async pack(src: string, dest: string) {
    this.log('pack', src);
    const { exclude, include } = this._options;
    const fullNames = await fs.readdir(src);
    const pngPaths: string[] = [];
    await Promise.all(
      fullNames.map(async (fullName) => {
        const srcPath = path.join(src, fullName);
        const info = path.parse(srcPath);
        if (!isSafeFilename(srcPath, true) || exclude(info, srcPath)) {
          return;
        }
        const destPath = path.join(dest, info.base);
        if (info.ext) {
          // File
          if (info.ext === '.png' && include(info, srcPath)) {
            // Collect PNGs for atlas generation later.
            pngPaths.push(srcPath);
          } else {
            // Copy single file
            await fs.outputFile(destPath, await fs.readFile(srcPath));
          }
        } else {
          // Dir
          await this.pack(srcPath, destPath);
        }
      })
    );
    // Generate atlas and template outputs for collected PNGs.
    await this.packSpriteSheet(pngPaths, dest);
    this.log('packed', dest);
  }

  /**
   * Generates the spritesheet and style/template files from collected PNG paths.
   * Uses Spritesmith to create the atlas and spritesheet-templates for output files.
   * @param pngPaths Array of PNG image paths
   * @param dest Destination directory
   */
  private async packSpriteSheet(pngPaths: string[], dest: string) {
    if (pngPaths.length === 0) {
      return;
    }
    const { suffix, spritesmithOptions, templatesOptions } = this._options;
    const format = templatesOptions.format || 'css';
    await new Promise<void>((resolve, reject) => {
      Spritesmith.run(
        {
          ...spritesmithOptions,
          src: pngPaths,
        },
        async (err, result) => {
          if (err) {
            return reject(err);
          }

          // Map image coordinates to sprite objects
          const sprites = Object.keys(result.coordinates).map((imgPath) => {
            const info = path.parse(imgPath);
            return {
              ...result.coordinates[imgPath],
              name: info.name,
            };
          });
          // Spritesheet properties and output image path
          const spritesheet = {
            ...result.properties,
            image: `${path.basename(dest) + suffix}.png`,
          };
          // Generate template/style file
          const temp = templater(
            {
              sprites,
              spritesheet,
            },
            templatesOptions
          );
          // Determine output file extension
          const ext =
            formatTypes.find((type) => format.startsWith(type)) || format;
          await Promise.all([
            fs.outputFile(dest + suffix + '.' + ext, temp),
            fs.outputFile(dest + suffix + '.png', result.image),
          ]);
          resolve();
        }
      );
    });
  }
}

export function images2atlas(options: Images2atlasOptions) {
  return new Images2atlas(options).runPack();
}
