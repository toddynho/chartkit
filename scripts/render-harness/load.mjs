/**
 * Bundle the SSR renderer, option catalog, and gallery specs once per process.
 * ChartKit core is TypeScript. Node runs the esbuild output, not a published dist,
 * so `npm test` does not need `build:lib` first.
 */
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { harnessDir, repoRoot } from "./paths.mjs";

/** Point package imports at source so the harness does not need dist/. */
const coreSource = {
  name: "core-source",
  setup(build) {
    const src = join(repoRoot, "packages/core/src");
    build.onResolve({ filter: /^@chartkitdev\/core$/ }, () => ({ path: join(src, "index.ts") }));
    build.onResolve({ filter: /^@chartkitdev\/core\// }, (args) => {
      const sub = args.path.slice("@chartkitdev/core/".length);
      const file = sub.endsWith(".ts") ? sub : `${sub}.ts`;
      return { path: join(src, file) };
    });
  },
};

let pending;

export function loadRuntime() {
  if (!pending) pending = bundle();
  return pending;
}

async function bundle() {
  const outdir = join(tmpdir(), "ck-render-harness");
  mkdirSync(outdir, { recursive: true });
  await build({
    entryPoints: [join(harnessDir, "entry.ts")],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile: join(outdir, "runtime.js"),
    logLevel: "warning",
    legalComments: "none",
    external: ["@resvg/resvg-wasm"],
    plugins: [coreSource],
  });
  return import(pathToFileURL(join(outdir, "runtime.js")).href);
}

export { repoRoot };
