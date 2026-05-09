import { createInterface } from 'node:readline/promises';

/**
 * Prompts for a single line of input.
 *
 * @param tips - Prompt text written to stdout
 * @returns The entered answer
 */
export function question(tips: string) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return rl.question(tips).then((answer) => {
    rl.close();
    return answer;
  });
}
