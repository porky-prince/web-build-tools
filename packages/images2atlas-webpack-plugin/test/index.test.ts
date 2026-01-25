import type { Images2atlasOptions } from 'images2atlas';
import { images2atlas } from 'images2atlas';
import Images2atlasWebpackPlugin from '../src';

jest.mock('images2atlas', () => ({
  images2atlas: jest.fn(() => Promise.resolve()),
}));

type TapHandler = () => Promise<void> | void;

// Narrow the mock for easier assertions.
const mockedImages2atlas = images2atlas as jest.MockedFunction<
  typeof images2atlas
>;

// Minimal compiler mock that captures tap handlers.
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

describe('Images2atlasWebpackPlugin', () => {
  beforeEach(() => {
    // Reset mock calls between tests.
    mockedImages2atlas.mockClear();
  });

  test('registers run and watchRun hooks', () => {
    const { compiler, getRunHandler, getWatchRunHandler } = makeCompiler();
    const plugin = new Images2atlasWebpackPlugin({
      src: '/tmp/src',
      dest: '/tmp/dest',
    });

    // Apply should register handlers on both hooks.
    plugin.apply(compiler as any);

    expect(compiler.hooks.run.tapPromise).toHaveBeenCalledTimes(1);
    expect(compiler.hooks.watchRun.tapPromise).toHaveBeenCalledTimes(1);
    expect(getRunHandler()).toBeDefined();
    expect(getWatchRunHandler()).toBeDefined();
  });

  test('run hook triggers images2atlas with watch disabled', async () => {
    const { compiler, getRunHandler } = makeCompiler();
    const options: Images2atlasOptions = {
      src: '/tmp/src',
      dest: '/tmp/dest',
      watch: true,
    };
    const plugin = new Images2atlasWebpackPlugin(options);

    plugin.apply(compiler as any);

    // Run hook should force watch=false on first pack.
    await getRunHandler()?.();

    expect(mockedImages2atlas).toHaveBeenCalledTimes(1);
    expect(mockedImages2atlas.mock.calls[0][0].watch).toBe(false);
  });

  test('watchRun triggers images2atlas once and sets watch to true', async () => {
    const { compiler, getWatchRunHandler } = makeCompiler();
    const options: Images2atlasOptions = {
      src: '/tmp/src',
      dest: '/tmp/dest',
    };
    const plugin = new Images2atlasWebpackPlugin(options);

    plugin.apply(compiler as any);

    // watchRun only triggers once and flips watch to true.
    await getWatchRunHandler()?.();
    await getWatchRunHandler()?.();

    expect(mockedImages2atlas).toHaveBeenCalledTimes(1);
    expect(mockedImages2atlas.mock.calls[0][0].watch).toBe(true);
  });
});
