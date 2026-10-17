import { brotliCompressSync, constants, gzipSync } from "node:zlib";

export function compress(buffer) {
  const gzip = gzipSync(buffer, { level: 9 });
  const brotli = brotliCompressSync(buffer, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
  });
  return {
    minBytes: buffer.length,
    gzipBytes: gzip.length,
    brotliBytes: brotli.length,
  };
}
