const mockExec = jest.fn();

jest.mock('node:child_process', () => ({
  exec: mockExec,
}));

import type { ExecException } from 'node:child_process';
import { execCmd } from '../../src';

function createMockProcess() {
  return {
    stdout: { on: jest.fn() },
    stderr: { on: jest.fn() },
  };
}

describe('execCmd', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('resolves stdout and attaches log listeners by default', async () => {
    const child = createMockProcess();

    mockExec.mockImplementation(
      (
        cmd: string,
        options: object,
        callback: (error: ExecException | null, stdout: string) => void
      ) => {
        callback(null, 'done');
        return child;
      }
    );

    await expect(execCmd('echo test')).resolves.toBe('done');

    expect(mockExec).toHaveBeenCalledWith(
      'echo test',
      {},
      expect.any(Function)
    );
    expect(child.stdout.on).toHaveBeenCalledWith('data', console.log);
    expect(child.stderr.on).toHaveBeenCalledWith('data', console.error);
  });

  test('rejects when the command fails', async () => {
    const child = createMockProcess();
    const error = new Error('boom') as ExecException;

    mockExec.mockImplementation(
      (
        cmd: string,
        options: object,
        callback: (error: ExecException | null, stdout: string) => void
      ) => {
        callback(error, '');
        return child;
      }
    );

    await expect(execCmd('bad command')).rejects.toBe(error);
  });

  test('skips attaching log listeners when showLog is false', async () => {
    const child = createMockProcess();

    mockExec.mockImplementation(
      (
        cmd: string,
        options: object,
        callback: (error: ExecException | null, stdout: string) => void
      ) => {
        callback(null, 'quiet');
        return child;
      }
    );

    await expect(execCmd('echo quiet', { showLog: false })).resolves.toBe(
      'quiet'
    );

    expect(child.stdout.on).not.toHaveBeenCalled();
    expect(child.stderr.on).not.toHaveBeenCalled();
  });
});
