import { md5 } from '../src';

describe('md5', () => {
  test('hashes string input to a hex digest', () => {
    expect(md5('hello')).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  test('hashes binary input to a hex digest', () => {
    expect(md5(Buffer.from([0, 1, 2, 3]))).toBe(
      '37b59afd592725f9305e484a5d7f5168'
    );
  });
});
