import { exec, ExecOptionsWithStringEncoding } from 'node:child_process';

export interface ExecCmdOptions extends ExecOptionsWithStringEncoding {
  showLog?: boolean;
}

/**
 * Executes a shell command and resolves with stdout when it exits
 * successfully.
 *
 * @param cmd - Command string passed to `exec`
 * @param options - Child process options
 */
export function execCmd(cmd: string, options: ExecCmdOptions = {}) {
  const showLog = options.showLog ?? true;

  return new Promise<string | Buffer>((resolve, reject) => {
    const p = exec(cmd, options, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });

    if (showLog) {
      p.stdout?.on('data', console.log);
      p.stderr?.on('data', console.error);
    }
  });
}
