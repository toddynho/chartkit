/**
 * Fail the build when the Astro compiler cannot compile the component.
 * The published files stay source: the app's compiler builds Chart.astro.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "@astrojs/compiler-rs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

for (const name of ["Chart.astro", "Client.astro"]) {
  const source = readFileSync(join(root, "src", name), "utf8");
  const result = await transform(source, { filename: name });
  const diagnostics = result.diagnostics ?? [];
  const errors = diagnostics.filter((item) => item.severity === 1 || item.severity === "Error");
  if (errors.length) {
    console.error(name, errors);
    process.exit(1);
  }
  if (!result.code) {
    console.error(`${name} compiled to empty output`);
    process.exit(1);
  }
}
