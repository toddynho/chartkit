import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { chartTypeDefs } from "./chart-types.mjs";

const benchRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const outfile = join(benchRoot, ".out/browser/probe.mjs");

const imports = chartTypeDefs
  .map((def) => `import { ${def.exportName} as chart_${def.exportName} } from "../../packages/core/src/charts/${def.file}.ts";`)
  .join("\n");
const map = chartTypeDefs.map((def) => `${JSON.stringify(def.id)}: chart_${def.exportName}`).join(", ");
const sizes = Object.fromEntries(chartTypeDefs.map((def) => [def.id, def.sizes]));

const source = `
${imports}
import { createRenderer } from "../../packages/core/src/render.ts";
import { makeChartData } from "../lib/shapes.mjs";
import { chartSpec } from "./chart-specs.mjs";
const charts = { ${map} };
const sizes = ${JSON.stringify(sizes)};
export function probe() {
  const out = [];
  for (const [id, chart] of Object.entries(charts)) {
    const render = createRenderer([chart]);
    for (const n of sizes[id]) {
      const started = Date.now();
      try {
        const data = makeChartData(id, n, 1);
        const svg = render(chartSpec(id, data));
        const error = !svg || !svg.includes("<svg") || svg.includes("ck-chart-error");
        const message = error ? svg.replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ").trim().slice(0, 240) : "";
        out.push({ id, n, ok: !error, bytes: svg ? svg.length : 0, ms: Date.now() - started, message });
      } catch (error) {
        out.push({ id, n, ok: false, bytes: 0, ms: Date.now() - started, message: error instanceof Error ? error.message : String(error) });
      }
    }
  }
  return out;
}
`;

mkdirSync(dirname(outfile), { recursive: true });
await build({
  stdin: {
    contents: source,
    resolveDir: join(benchRoot, "browser"),
    sourcefile: "probe-entry.mjs",
    loader: "js",
  },
  bundle: true,
  format: "esm",
  platform: "node",
  outfile,
  logLevel: "silent",
});

const mod = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
const rows = mod.probe();
let failed = 0;
for (const row of rows) {
  const diagnostic = row.id === "candlestick" && row.n === 100_000;
  const mark = row.ok ? "ok" : diagnostic ? "expected-fail" : "FAIL";
  if (!row.ok && !diagnostic) failed += 1;
  console.log(`${mark}\t${row.id}\t${row.n}\t${row.bytes}\t${row.ms}ms\t${row.message}`);
}
if (failed) {
  console.error(`${failed} chart type probe(s) failed`);
  process.exit(1);
}
console.log(`probe ${rows.length} cells`);
