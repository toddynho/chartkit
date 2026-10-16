/**
 * Keep "use client" as the first line. esbuild's CJS "use strict" would otherwise precede it.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "../dist");
const leading = /^(?:(?:"use client";|'use client';|"use strict";|'use strict';)\s*)+/;

for (const name of ["index.js", "index.cjs"]) {
  const path = join(dist, name);
  const body = readFileSync(path, "utf8").replace(leading, "");
  const strict = name.endsWith(".cjs") ? '"use strict";\n' : "";
  writeFileSync(path, `"use client";\n${strict}${body}`);
}
