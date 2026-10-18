import { build } from "esbuild";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stubDynamicCharts } from "../../../scripts/stub-dynamic-charts.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const core = join(root, "../core/src");
const alias = {
  "@chartkitdev/core/mermaid": join(core, "mermaid.ts"),
  "@chartkitdev/core/extra-tip": join(core, "extra-tip.ts"),
  "@chartkitdev/core/extra": join(core, "extra.ts"),
  "@chartkitdev/core/all": join(core, "all.ts"),
  "@chartkitdev/core/interact": join(core, "interact.ts"),
  "@chartkitdev/core": join(core, "index.ts"),
};
const chartAlias = {
  name: "chart-alias",
  setup(build) {
    build.onResolve({ filter: /^@chartkitdev\/core\/charts\/[a-z0-9-]+$/ }, (args) => ({
      path: join(core, "charts", `${args.path.slice("@chartkitdev/core/charts/".length)}.ts`),
    }));
  },
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
  plugins: [stubDynamicCharts],
});
await build({
  ...shared,
  entryPoints: [join(root, "src/global-auto.ts")],
  outfile: join(root, "dist/chartkit.auto.global.js"),
  alias,
  plugins: [stubDynamicCharts],
});
await build({
  ...shared,
  entryPoints: [join(root, "src/global-mermaid.ts")],
  outfile: join(root, "dist/chartkit.mermaid.global.js"),
  alias,
});

const extraTypes = ["histogram", "boxplot", "radar", "funnel", "treemap", "sankey", "bullet", "waterfall", "gantt", "timeline", "quadrant", "venn", "journey"];
for (const type of extraTypes) {
  const entry = join(tmpdir(), `chartkit-${type}-global.ts`);
  writeFileSync(
    entry,
    `import { ${type} } from "@chartkitdev/core/charts/${type}";\nconst root = globalThis as { ChartKitCharts?: Record<string, { render: (spec: Record<string, unknown>) => string | null }> };\nroot.ChartKitCharts = root.ChartKitCharts ?? {};\nroot.ChartKitCharts[${JSON.stringify(type)}] = ${type};\n`,
  );
  await build({
    ...shared,
    entryPoints: [entry],
    outfile: join(root, `dist/chartkit.${type}.global.js`),
    alias,
    plugins: [chartAlias],
  });
}
