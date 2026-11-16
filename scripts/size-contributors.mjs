/**
 * Biggest contributors to the line and all bundles, from the esbuild metafile.
 * Sizes are minified bytes in the output (esbuild cannot split gzip per file).
 * Usage: node scripts/size-contributors.mjs [--top N] [--json]
 */
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { lineEntrySource } from "./line-bundle.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "packages/core/src");
const top = Number(process.argv[process.argv.indexOf("--top") + 1]) || 10;

// Same dynamic-import externals as size.mjs so the split-out chunks are not counted.
const external = {
  name: "external-dynamic-entries",
  setup(b) {
    b.onResolve({ filter: /^\.\/(load|extra-tip|canvas\/hydrate|layout|sampling-run|validate-phase4|mermaid-phase4)$/ }, (a) =>
      a.kind === "dynamic-import" ? { path: `@chartkitdev/core/${a.path.slice(2)}`, external: true } : null,
    );
  },
};

async function contributors(entry) {
  const r = await build({
    entryPoints: [entry], bundle: true, minify: true, format: "esm", platform: "node",
    write: false, metafile: true, outfile: join(tmpdir(), "ck-contrib.mjs"), plugins: [external], logLevel: "silent",
  });
  const out = Object.values(r.metafile.outputs)[0];
  const total = Object.values(out.inputs).reduce((s, i) => s + i.bytesInOutput, 0);
  const rows = Object.entries(out.inputs)
    .map(([file, i]) => ({ file: file.startsWith("/") ? relative(root, file) : file, bytes: i.bytesInOutput }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, top)
    .map((r) => ({ ...r, pct: Math.round((r.bytes / total) * 1000) / 10 }));
  return { total, rows };
}

const lineEntry = join(tmpdir(), "chartkit-contrib-line.mjs");
writeFileSync(lineEntry, lineEntrySource(src));
const result = { line: await contributors(lineEntry), all: await contributors(join(src, "all.ts")) };

if (process.argv.includes("--json")) console.log(JSON.stringify(result, null, 2));
else
  for (const [name, { total, rows }] of Object.entries(result)) {
    console.log(`\n### ${name} (${total} B minified in output; top ${top} source files)\n\nfile | min bytes | share\n--- | ---: | ---:`);
    for (const r of rows) console.log(`${r.file} | ${r.bytes} | ${r.pct}%`);
  }
