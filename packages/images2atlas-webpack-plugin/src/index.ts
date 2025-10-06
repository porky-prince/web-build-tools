import { FSWatcher, watch } from 'chokidar';
import path from 'path';
import type webpack from 'webpack';
import fs from 'fs-extra';
import templater from 'spritesheet-templates';
import Spritesmith from 'spritesmith';
import debounce from 'debounce';
import { isSafeFilename } from 'web-build-utils';

type Plugin = webpack.WebpackPluginInstance;
type Compiler = webpack.Compiler;
// type Compilation = webpack.Compilation;
type Logger = ReturnType<Compiler['getInfrastructureLogger']>;

export interface Images2atlasOptions {
  cwd?: string;
  src: string;
  dest: string;
  exclude?: (srcInfo: path.ParsedPath, src: string) => boolean;
  include?: (srcInfo: path.ParsedPath, src: string) => boolean;
  suffix?: string;
  delay?: number;
  silent?: boolean;
  spritesmithOptions?: Spritesmith.SpritesmithParams &
    Spritesmith.SpritesmithProcessImagesOptions;
  templatesOptions?: Parameters<typeof templater>[1];
}

const formatTypes = ['css', 'json', 'less', 'sass', 'scss', 'styl'];

export default class Images2atlasWebpackPlugin implements Plugin {
  private _options: Required<Images2atlasOptions>;
  private _watcher: FSWatcher | null = null;
  private _logger: Logger | null = null;

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
      cwd: process.cwd(),
      exclude: () => false,
      include: () => true,
      suffix: '-atlas',
      delay: 500,
      silent: true,
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

  private get pluginName() {
    return this.constructor.name;
  }

  private log(...args: string[]): void {
    if (!this._logger || this._options.silent) {
      return;
    }
    this._logger.log(...args);
  }

  private getWatcher(
    cb: (event: string, path: string, stats?: fs.Stats) => void
  ) {
    if (!this._watcher) {
      this._watcher = watch('.', {
        cwd: this._options.src,
        ignoreInitial: true,
      });
      this._watcher.on('all', cb);
    }
    return this._watcher;
  }

  apply(compiler: Compiler) {
    this._logger = compiler.getInfrastructureLogger(this.pluginName);
    const { src, dest, delay } = this._options;
    const pack = () => this.pack(src, dest);
    const delayPack = debounce(pack, delay);

    compiler.hooks.run.tapPromise(this.pluginName, pack);

    let once = false;
    compiler.hooks.watchRun.tapPromise(this.pluginName, async () => {
      if (once) {
        return;
      }
      once = true;
      this.getWatcher((e, p) => {
        if (!isSafeFilename(p, true)) {
          return;
        }
        this.log(e, p);
        delayPack();
      });
      await pack();
    });
  }

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
            // Add png
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
    await this.packSpriteSheet(pngPaths, dest);
    this.log('packed', dest);
  }

  private async packSpriteSheet(pngPaths: string[], dest: string) {
    if (pngPaths.length === 0) {
      return;
    }
    const { cwd, suffix, spritesmithOptions, templatesOptions } = this._options;
    const format = templatesOptions.format || '';
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

          const sprites = Object.keys(result.coordinates).map((imgPath) => {
            const info = path.parse(imgPath);
            return {
              ...result.coordinates[imgPath],
              name: info.name,
            };
          });
          const spritesheet = {
            ...result.properties,
            image: `~/${path.relative(cwd, dest) + suffix}.png`,
          };
          const temp = templater(
            {
              sprites,
              spritesheet,
            },
            templatesOptions
          );
          const ext =
            formatTypes.find((type) => format.startsWith(type)) || 'txt';
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
