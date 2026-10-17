/**
 * esbuild drops "use client" while bundling split chunks.
 * Next.js only honors the directive as the first line of the entry, so put it back.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "../dist");
const directive = '"use client";\n';

for (const name of ["index.js", "index.cjs"]) {
  const path = join(dist, name);
  const source = readFileSync(path, "utf8");
  const stripped = source.replace(/^(?:"use client";\s*)+/, "");
  writeFileSync(path, directive + stripped);
}
