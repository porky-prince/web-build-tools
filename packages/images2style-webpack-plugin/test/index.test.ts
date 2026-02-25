import type { Images2styleOptions } from 'images2style';
import { images2style } from 'images2style';
import Images2styleWebpackPlugin from '../src';

jest.mock('images2style', () => ({
  images2style: jest.fn(() => Promise.resolve()),
}));

type TapHandler = () => Promise<void> | void;

const mockedImages2style = images2style as jest.MockedFunction<
  typeof images2style
>;

function makeCompiler() {
  let runHandler: TapHandler | undefined;
  let watchRunHandler: TapHandler | undefined;

  const compiler = {
    hooks: {
      run: {
        tapPromise: jest.fn((_name: string, handler: TapHandler) => {
          runHandler = handler;
        }),
      },
      watchRun: {
        tapPromise: jest.fn((_name: string, handler: TapHandler) => {
          watchRunHandler = handler;
        }),
      },
    },
  };

  return {
    compiler,
    getRunHandler: () => runHandler,
    getWatchRunHandler: () => watchRunHandler,
  };
}

describe('Images2styleWebpackPlugin', () => {
  beforeEach(() => {
    mockedImages2style.mockClear();
  });

  test('registers run and watchRun hooks', () => {
    const { compiler, getRunHandler, getWatchRunHandler } = makeCompiler();
    const plugin = new Images2styleWebpackPlugin({
      src: '/tmp/src',
      dest: '/tmp/dest.css',
    });

    plugin.apply(compiler as any);

    expect(compiler.hooks.run.tapPromise).toHaveBeenCalledTimes(1);
    expect(compiler.hooks.watchRun.tapPromise).toHaveBeenCalledTimes(1);
    expect(getRunHandler()).toBeDefined();
    expect(getWatchRunHandler()).toBeDefined();
  });

  test('run hook triggers images2style with watch disabled', async () => {
    const { compiler, getRunHandler } = makeCompiler();
    const options: Images2styleOptions = {
      src: '/tmp/src',
      dest: '/tmp/dest.css',
      watch: true,
    };
    const plugin = new Images2styleWebpackPlugin(options);

    plugin.apply(compiler as any);

    await getRunHandler()?.();

    expect(mockedImages2style).toHaveBeenCalledTimes(1);
    expect(mockedImages2style.mock.calls[0][0].watch).toBe(false);
  });

  test('watchRun triggers images2style once and sets watch to true', async () => {
    const { compiler, getWatchRunHandler } = makeCompiler();
    const options: Images2styleOptions = {
      src: '/tmp/src',
      dest: '/tmp/dest.css',
    };
    const plugin = new Images2styleWebpackPlugin(options);

    plugin.apply(compiler as any);

    await getWatchRunHandler()?.();
    await getWatchRunHandler()?.();

    expect(mockedImages2style).toHaveBeenCalledTimes(1);
    expect(mockedImages2style.mock.calls[0][0].watch).toBe(true);
  });
});
