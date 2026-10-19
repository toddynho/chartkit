import { defineConfig, type Options } from "tsup";
import type { Plugin } from "esbuild";

/** Keep zoom/brush/keyboard/table out of the tooltip entry. */
const externalInteractExtra: Plugin = {
  name: "external-interact-extra",
  setup(build) {
    build.onResolve({ filter: /interact-extra(\.ts)?$/ }, (args) => {
      if (args.kind === "entry-point") return null;
      return { path: "@chartkitdev/core/interact/extra", external: true };
    });
  },
};

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
  "gantt",
  "timeline",
  "quadrant",
  "venn",
  "journey",
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
  "validate-phase4": "src/validate-phase4.ts",
  mermaid: "src/mermaid.ts",
  "mermaid-phase4": "src/mermaid-phase4.ts",
  interact: "src/interact.ts",
  "interact-extra": "src/interact-extra.ts",
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
    externalInteractExtra,
    {
      name: "external-chart-chunks",
      setup(build) {
        build.onResolve({ filter: /^\.\/charts\/[a-z0-9-]+$/ }, (args) => {
          if (args.kind !== "dynamic-import") return null;
          const name = args.path.slice("./charts/".length);
          return { path: `@chartkitdev/core/charts/${name}`, external: true };
        });
        build.onResolve({ filter: /^\.\/(load|extra-tip)$/ }, (args) => {
          if (args.kind !== "dynamic-import") return null;
          return { path: `@chartkitdev/core/${args.path.slice(2)}`, external: true };
        });
        build.onResolve({ filter: /^\.\/validate-phase4$/ }, (args) => {
          if (args.kind !== "dynamic-import") return null;
          return { path: "@chartkitdev/core/validate/phase4", external: true };
        });
        build.onResolve({ filter: /^\.\/mermaid-phase4$/ }, (args) => {
          if (args.kind !== "dynamic-import") return null;
          return { path: "@chartkitdev/core/mermaid/phase4", external: true };
        });
      },
    },
  ],
} satisfies Options);
