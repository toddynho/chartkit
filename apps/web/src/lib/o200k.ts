import { encode } from "gpt-tokenizer/encoding/o200k_base";

/** o200k_base length, gpt-tokenizer 3.4.0. Same tokenizer as the homepage spec count. */
export function countO200k(text: string): number {
  return encode(text).length;
}
