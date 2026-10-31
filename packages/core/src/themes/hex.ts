/** #rgb / #rrggbb, with or without a leading hash, to lowercase #rrggbb. No colour math. */

export function canonicalHex(input: string): string | null {
  const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(input.trim());
  if (!match) return null;
  const body = match[1].length === 3 ? [...match[1]].map((char) => char + char).join("") : match[1];
  return `#${body.toLowerCase()}`;
}
