import { build } from "esbuild";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const core = join(root, "../core/src");
const alias = {
  "@chartkitdev/core/mermaid": join(core, "mermaid.ts"),
  "@chartkitdev/core/extra": join(core, "extra.ts"),
  "@chartkitdev/core/all": join(core, "all.ts"),
  "@chartkitdev/core/interact": join(core, "interact.ts"),
  "@chartkitdev/core": join(core, "index.ts"),
};
const shared = {
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  target: "es2020",
  legalComments: "none",
  logLevel: "silent",
};

await build({
  ...shared,
  entryPoints: [join(root, "src/global.ts")],
  outfile: join(root, "dist/chartkit.global.js"),
  alias,
});
await build({
  ...shared,
  entryPoints: [join(root, "src/global-auto.ts")],
  outfile: join(root, "dist/chartkit.auto.global.js"),
  alias,
});
await build({
  ...shared,
  entryPoints: [join(root, "src/global-mermaid.ts")],
  outfile: join(root, "dist/chartkit.mermaid.global.js"),
  alias,
});
