const mockCreateInterface = jest.fn();

jest.mock('node:readline/promises', () => ({
  createInterface: mockCreateInterface,
}));

import { question } from '../../src';

describe('question', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('prompts through readline and closes the interface', async () => {
    const close = jest.fn();
    const ask = jest.fn().mockResolvedValue('answer');

    mockCreateInterface.mockReturnValue({
      close,
      question: ask,
    });

    await expect(question('Your answer? ')).resolves.toBe('answer');

    expect(mockCreateInterface).toHaveBeenCalledWith({
      input: process.stdin,
      output: process.stdout,
    });
    expect(ask).toHaveBeenCalledWith('Your answer? ');
    expect(close).toHaveBeenCalledTimes(1);
  });
});
