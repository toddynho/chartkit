import { build } from "esbuild";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const core = join(root, "../core/src");

await build({
  entryPoints: [join(root, "src/global.ts")],
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  target: "es2020",
  legalComments: "none",
  outfile: join(root, "dist/chartkit.global.js"),
  alias: {
    "@chartkitdev/core/mermaid": join(core, "mermaid.ts"),
    "@chartkitdev/core/extra": join(core, "extra.ts"),
    "@chartkitdev/core/all": join(core, "all.ts"),
    "@chartkitdev/core/interact": join(core, "interact.ts"),
    "@chartkitdev/core": join(core, "index.ts"),
  },
  logLevel: "silent",
});
