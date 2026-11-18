import { readFileSync } from "node:fs";
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
    build.onResolve({ filter: /export-menu(\.ts)?$/ }, (args) => {
      if (args.kind === "entry-point") return null;
      return { path: "@chartkitdev/core/export-menu", external: true };
    });
  },
};

const charts = [
  "line",
  "bar",
  "donut",
  "pie",
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
  "area-range",
  "bar-range",
  "errorbar",
  "sunburst",
  "bar-list",
  "radial-bar",
  "rose",
  "strip",
  "streamgraph",
  "density",
  "tree",
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
  "midnight",
  "soft",
  "refined",
  "editorial",
  "tape",
  "kite",
  "mustard",
  "violet",
];

const entry: Record<string, string> = {
  index: "src/index.ts",
  all: "src/all.ts",
  features: "src/features.ts",
  hooks: "src/feature-hooks.ts",
  extra: "src/extra.ts",
  load: "src/load.ts",
  "extra-tip": "src/extra-tip.ts",
  validate: "src/validate.ts",
  options: "src/option-catalog.ts",
  "validate-phase4": "src/validate-phase4.ts",
  "validate-convert": "src/foreign-convert.ts",
  mermaid: "src/mermaid.ts",
  "mermaid-phase4": "src/mermaid-phase4.ts",
  interact: "src/interact.ts",
  "canvas/hydrate": "src/canvas/hydrate.ts",
  layout: "src/layout.ts",
  sampling: "src/sampling-run.ts",
  "interact-extra": "src/interact-extra.ts",
  export: "src/export.ts",
  "export-menu": "src/export-menu.ts",
  race: "src/race-index.ts",
  "themes/all": "src/themes/all.ts",
};

for (const name of charts) entry[`charts/${name}`] = `src/charts/${name}.ts`;
for (const name of themes) entry[`themes/${name}`] = `src/themes/${name}.ts`;

/**
 * The ESM build runs in three groups. Entries in a group share code through dist/chunk-*.js, so the
 * renderer ships once per group and not once per chart. Groups do not share with each other.
 * The rule behind the grouping: Rollup and Vite put a module that a first chunk and a lazy chunk both
 * use into the first chunk, whole. So an entry must not share chunks with an entry it loads through import().
 *
 * 1. Shared: `index`, the fifteen v1 charts, `bar-list`, themes, and the helper entries.
 *    One exception to the rule, kept on purpose: `mermaid` loads `mermaid/phase4` through import(), and
 *    phase4 registers its diagrams into the parser `mermaid` owns, so the two must be one copy.
 *    Cost under Vite: `mermaid` +0.9 kB gzip (1.6%); its lazy chunk went from 58 kB to 3 kB.
 * 2. On demand: the charts `load()` imports. Sharing them with group 1 grew the first chunk of a
 *    `charts/line` + `load()` app from 35.6 kB to 44.2 kB gzip under Vite.
 * 3. Standalone: one self-contained file each, as every entry was before. Sharing grew what a bundler
 *    ships for them (gzip, measured from dist):
 *    - `all`, `validate`, `extra`: a shared chunk loses the per-entry dead-code pass, +0.6% to +2.8%.
 *    - `interact`, and `canvas/hydrate`, `interact-extra`, `export-menu`, which it loads through import()
 *      only: the tooltip entry grew by 1.3 kB under Vite.
 *    - `sampling`: +6%.
 *    Each one costs its full size in the tarball, so add to this list only with a measurement.
 */
const standalone = ["all", "validate", "extra", "interact", "canvas/hydrate", "interact-extra", "export-menu", "sampling"];
const onDemand = [...readFileSync("src/load.ts", "utf8").matchAll(/import\("\.\/charts\/([a-z0-9-]+)"\)/g)].map((match) => `charts/${match[1]}`);
const standaloneEntry: Record<string, string> = {};
const onDemandEntry: Record<string, string> = {};
const sharedEntry: Record<string, string> = {};
for (const [name, file] of Object.entries(entry)) {
  (standalone.includes(name) ? standaloneEntry : onDemand.includes(name) ? onDemandEntry : sharedEntry)[name] = file;
}
if (Object.keys(onDemandEntry).length !== onDemand.length || onDemand.length === 0) {
  throw new Error("tsup.config.ts: every chart load.ts imports must be a charts/* entry");
}

const shared = {
  format: ["cjs", "esm"],
  sourcemap: true,
  // No `clean`: the builds below write into dist at the same time. `npm run build` empties dist first.
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
        build.onResolve({ filter: /^\.\/canvas\/hydrate$/ }, (args) => {
          if (args.kind !== "dynamic-import") return null;
          return { path: "@chartkitdev/core/canvas/hydrate", external: true };
        });
        build.onResolve({ filter: /^\.\/layout$/ }, (args) => {
          if (args.kind !== "dynamic-import") return null;
          return { path: "@chartkitdev/core/layout", external: true };
        });
        build.onResolve({ filter: /feature-hooks(\.ts)?$/ }, (args) => {
          if (args.kind === "entry-point") return null;
          return { path: "@chartkitdev/core/hooks", external: true };
        });
        build.onResolve({ filter: /^\.\/sampling-run$/ }, (args) => {
          if (args.kind !== "dynamic-import") return null;
          return { path: "@chartkitdev/core/sampling", external: true };
        });
        // The converter entry uses the published validator instead of a second copy of it.
        build.onResolve({ filter: /^\.\/validate$/ }, (args) => {
          if (!/foreign-convert\.ts$/.test(args.importer)) return null;
          return { path: "@chartkitdev/core/validate", external: true };
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
} satisfies Options;

export default defineConfig([
  {
    ...shared,
    entry: sharedEntry,
    // Types for every entry come from this one build, so the .d.ts files do not depend on the grouping.
    dts: { entry },
    // No `splitting` key, on purpose: tsup then splits ESM and leaves CJS unsplit.
    // CJS stays one self-contained file per entry. A bundler cannot tree-shake a shared CJS chunk,
    // so a one-chart require() would ship about 60% more (measured with tsup's CJS splitting).
    // Shared chunks hold the registration side effects of features and themes/*.
    // package.json lists ./dist/chunk-*.js under sideEffects so a bundler keeps a bare import of those entries.
  },
  { ...shared, entry: onDemandEntry },
  { ...shared, entry: standaloneEntry, splitting: false },
]);
