import { BinaryLike, createHash } from 'node:crypto';

/**
 * Returns the hex-encoded MD5 digest for a string or binary payload.
 *
 * @param data - Input to hash
 */
export function md5(data: string | BinaryLike) {
  const md5 = createHash('md5');
  return md5.update(data).digest('hex');
}
