import { defineConfig } from "tsup";

const charts = [
  "line",
  "bar",
  "donut",
  "stacked-area",
  "scatter",
  "combo",
  "heatmap",
  "gauge",
  "kpi",
  "sparkline",
  "mini-area",
  "progress-ring",
  "spike",
  "candlestick",
  "histogram",
  "boxplot",
  "radar",
  "funnel",
  "treemap",
  "sankey",
  "bullet",
  "waterfall",
];

const themes = [
  "emerald",
  "mono",
  "slate",
  "arctic",
  "orchid",
  "obsidian",
  "neon",
  "mocha",
  "owl",
  "retro",
  "copper",
  "rose",
  "sunset",
  "silver",
  "pearl",
  "latte",
  "brand",
];

const entry: Record<string, string> = {
  index: "src/index.ts",
  all: "src/all.ts",
  extra: "src/extra.ts",
  load: "src/load.ts",
  "extra-tip": "src/extra-tip.ts",
  validate: "src/validate.ts",
  "themes/all": "src/themes/all.ts",
};

for (const name of charts) entry[`charts/${name}`] = `src/charts/${name}.ts`;
for (const name of themes) entry[`themes/${name}`] = `src/themes/${name}.ts`;

export default defineConfig({
  entry,
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  esbuildPlugins: [
    {
      name: "external-chart-chunks",
      setup(build) {
        build.onResolve({ filter: /^\.\/charts\/[a-z0-9-]+$/ }, (args) => {
          if (args.kind !== "dynamic-import") return null;
          const name = args.path.slice("./charts/".length);
          return { path: `@chartkitdev/core/charts/${name}`, external: true };
        });
      },
    },
  ],
});
