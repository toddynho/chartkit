/**
 * Fail the build when the Svelte 5 compiler cannot compile Chart.svelte
 * for the client or the server. Deprecation warnings for the Svelte 4 API stay allowed.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "svelte/compiler";

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../src/Chart.svelte"), "utf8");

for (const generate of ["client", "server"]) {
  compile(source, { filename: "Chart.svelte", generate, css: "external" });
}
