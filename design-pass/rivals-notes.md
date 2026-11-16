# Rival chart libraries: default look, same data

Rendered 2026-11-16 in Playwright Chromium, `deviceScaleFactor: 2`, element screenshot of the 640x320 chart box plus 16 px padding (every PNG is 1344x704). Page font `-apple-system, system-ui, sans-serif`; no font overrides passed to any library. Animation off everywhere.

All numbers below were read from the rendered DOM / computed styles in the same run that took the screenshot; the raw dump is `measurements.json` next to this file. Colours were converted to hex by painting the computed value on a canvas. "n/a" means the thing does not exist in that library's default output.

Files: `<lib>-<chart>.light.png` for all five libraries, `.dark.png` for shadcn and Tremor.
Not rendered: `plot-donut` (see Plot section).

## Things that are not what the brief assumed

1. **shadcn installs recharts 3.8.0, not 3.10.1.** `npx shadcn add chart` pins `recharts@3.8.0` (registry JSON below). The `shadcn-*` PNGs therefore use 3.8.0. The same five charts on recharts 3.10.1 are in `alt/shadcn-recharts3.10.1-<chart>.light.png`; line, bar, stacked and donut are byte-identical to the 3.8.0 PNGs, area differs by some pixels (not investigated) and every measured value is the same.
2. **shadcn tick labels are `#666666`, not `muted-foreground`.** `chart.tsx` targets `.recharts-cartesian-axis-tick text`, but recharts 3.8.0 and 3.10.1 put the tick `<text>` in a separate `.recharts-cartesian-axis-tick-label` group, so the rule never matches and recharts' own `fill="#666"` wins, in light and dark. Checked against the live site (`https://ui.shadcn.com/charts/bar`, iframes `/view/new-york-v4/chart-bar-*`): computed tick fill there is `rgb(102, 102, 102)` too. The grid rule (`line[stroke='#ccc']` -> border at 50 %) does match.
3. **shadcn has three different `--chart-N` sets.** Used: the documented one (chart docs, manual install, theming pages). Not used: the greyscale set the CLI registry now ships for neutral (`oklch(0.87 0 0)`, `0.556`, `0.439`, `0.371`, `0.269`; `https://ui.shadcn.com/r/colors/neutral.json`) and the blue set the docs site itself runs on (`--color-blue-300/500/600/700/800`; `apps/v4/app/globals.css`). `--muted-foreground` and `--border` are the same in all three.
4. **shadcn's docs examples differ from the prop list in the brief** (source followed): multi-series line uses `type="monotone"` (only the single-series example uses `natural`); bar examples use `tickMargin={10}`; stacked bars use `radius={[0,0,4,4]}` on the bottom series and `[4,4,0,0]` on the top, so the middle series is square; no example has a `YAxis`, so there are no y ticks at all; the multi-line example has no legend (added `ChartLegend` below, as the brief asked).
5. **Tremor cannot run on recharts 3 / React 19.** `@tremor/react` 3.18.7 peers on `react ^18` and depends on `recharts ^2.13.3`. It was installed in its own directory with React 18.3.1 and resolved recharts 2.15.4.
6. **Plot 0.6.17 has no arc/pie mark**, so there is no Plot donut.

## shadcn/ui charts

- **Rendered with:** recharts 3.8.0 (primary) and 3.10.1 (`alt/`), react 19.3.1, react-dom 19.3.1.
- **Real or recreation:** real Recharts; shadcn's `ChartContainer` / `ChartLegendContent` are a **recreation in plain CSS + a small React component** (shadcn is copy-in source that needs Tailwind v4). Every selector in `chart.tsx`'s class string is reproduced one-to-one; `stroke-border/50` is written as `color-mix(in oklab, var(--border) 50%, transparent)` as Tailwind v4 emits it.
- **Harness deviations:** `aspect-video` overridden so the chart fills 640x320 (it would be 640x360). The donut keeps the docs example's `mx-auto aspect-square max-h-[250px]`, so it is a 250x250 chart centred in the box. Legend text colour comes from `--foreground` (shadcn puts `text-foreground` on body).
- **Sources:**
  - `https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/ui/chart.tsx`
  - `https://ui.shadcn.com/r/styles/new-york-v4/chart.json` (dependency `recharts@3.8.0`)
  - examples in `https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/`: `chart-line-multiple.tsx`, `chart-bar-default.tsx`, `chart-bar-stacked.tsx`, `chart-area-stacked.tsx`, `chart-area-legend.tsx`, `chart-pie-donut.tsx`
  - tokens: `https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/content/docs/installation/manual.mdx`, `.../content/docs/(root)/theming.mdx`, `.../content/docs/components/radix/chart.mdx`
- **Tokens used:** light `--chart-1..5` = `oklch(0.646 0.222 41.116)`, `oklch(0.6 0.118 184.704)`, `oklch(0.398 0.07 227.392)`, `oklch(0.828 0.189 84.429)`, `oklch(0.769 0.188 70.08)`; dark = `oklch(0.488 0.243 264.376)`, `oklch(0.696 0.17 162.48)`, `oklch(0.769 0.188 70.08)`, `oklch(0.627 0.265 303.9)`, `oklch(0.645 0.246 16.439)`; `--muted-foreground` `oklch(0.556 0 0)` / `oklch(0.708 0 0)`; `--border` `oklch(0.922 0 0)` / `oklch(1 0 0 / 10%)`; `--foreground` `oklch(0.145 0 0)` / `oklch(0.985 0 0)`.

| Fact | Measured |
|---|---|
| Tick font | 12px, weight 400, page font (inherited) |
| Tick colour | `#666666` light and dark (see point 2) |
| Legend | 12px, `#0a0a0a` light / `#fafafa` dark, centred below; 8x8 swatch, 2px radius; items sorted alphabetically by recharts (Enterprise, Pro, Starter / High, Low, Medium) |
| Horizontal grid | 5 lines, `#e5e5e5` at alpha 0.50 (light), `#ffffff` at alpha 0.05 (dark), 1px, solid |
| Vertical grid | none |
| Axis line | none (x: `axisLine={false}`; no y axis) |
| Tick marks | none |
| Line stroke | 2px, monotone curve, butt caps, no dots |
| Area | fill opacity 0.4, 1px stroke in series colour, natural curve |
| Bar corner radius | single: 8 on all four corners; stacked: 4 on the outer corners of bottom and top series, 0 on the middle |
| Bar width / gap | 84 / 21 px, gap:width 0.25, bar = 0.80 of band |
| Series colours light | `#f54a00`, `#009689`, `#104e64`, `#ffb900`, `#fe9a00` |
| Series colours dark | `#1447e6`, `#00bc7d`, `#fe9a00`, `#ad46ff`, `#ff2056` |
| Donut | inner 60 / outer 96 px, ratio 0.62; centre empty; no labels, no legend, no slice stroke |
| Y tick format | n/a (no y axis in the docs examples) |

## Tremor

- **Rendered with:** `@tremor/react` 3.18.7, recharts 2.15.4, react 18.3.1, react-dom 18.3.1, tailwindcss 3.4.19 (+ `@tailwindcss/forms`).
- **Real or recreation:** the **real library**, not the fallback. CSS was built with the Tailwind v3 CLI (not the Play CDN) using Tremor's documented config: theme and safelist verbatim, `content` including `node_modules/@tremor`. The docs config has no `darkMode` key, so dark is `prefers-color-scheme`; the dark PNGs were taken with `colorScheme: 'dark'`.
- **Props:** only the required ones (`data`, `index`, `categories` / `category`) plus `stack` for stacked bar and area. Colours, legend, grid, height are defaults.
- **Harness note:** `DonutChart`'s default class is `h-40`, so the donut is 160 px tall inside the 320 px box; the cartesian charts default to `h-80` = 320.
- **Sources:** `https://npm.tremor.so/docs/getting-started/installation`, `https://raw.githubusercontent.com/tremorlabs/tremor-npm/main/tailwind.config.js`, `https://npm.tremor.so/docs/visualizations/line-chart`

| Fact | Measured |
|---|---|
| Tick font | 12px, weight 400, page font (inherited) |
| Tick colour | `#6b7280` light and dark |
| Legend | 14px, `#6b7280`, top-right; 8x8 circle swatch |
| Horizontal grid | 5 lines, `#e5e7eb` light / `#1f2937` dark, 1px, solid |
| Vertical grid | none |
| Axis line | none |
| Tick marks | none |
| Line stroke | 2px, straight segments, round caps and joins, no dots |
| Area | vertical gradient of the series colour, stop opacity 0.4 at 5 % to 0 at 95 %, element fill-opacity 0.6; 2px line on top |
| Bar corner radius | 0 |
| Bar width / gap | 72 / 18.66 px, gap:width 0.26, bar = 0.79 of band |
| Series colours | `#3b82f6`, `#06b6d4`, `#0ea5e9`, `#6366f1`, `#8b5cf6` (same in dark) |
| Donut | inner 60 / outer 80 px, ratio 0.75; centre shows the total `106400`, 16px, `#374151` light / `#e5e7eb` dark; slice stroke 1px in the background colour (`#ffffff` / `#111827`); no labels, no legend |
| Y tick format | plain integers, no separator: `0, 1500, 3000, 4500, 6000` |

## Nivo

- **Rendered with:** `@nivo/line`, `@nivo/bar`, `@nivo/pie` 0.99.0 on react 19.3.1. Real library.
- **Props:** the non-default props of the nivo.rocks docs examples (margins, point settings, `innerRadius 0.5`, `padAngle 0.6`, `cornerRadius 2`, arc label settings, the docs `legends` blocks), minus the axis `legend` strings because those are axis titles. `animate: false`.
- **Data-driven deviation:** the docs line example has `yScale.stacked: true`; set to `false` for `line` so the three series are not summed, kept `true` for `area` (with `enableArea`). `min: 'auto'` is kept, so y does not start at 0.
- **Sources:** `https://raw.githubusercontent.com/plouc/nivo/v0.99.0/website/src/data/components/line/defaults.ts`, `.../website/src/pages/line/index.tsx`, `.../website/src/pages/bar/index.tsx`, `.../website/src/pages/pie/index.tsx`

| Fact | Measured |
|---|---|
| Tick font | 11px, weight 400, `sans-serif` (Nivo sets it inline, does not inherit the page font) |
| Tick colour | `#333333` |
| Legend | 11px, `#333333`; line/bar: column at bottom-right outside the plot; pie: row below. Line and stacked legends list series in reverse (Enterprise, Pro, Starter / High, Medium, Low) |
| Horizontal grid | `#dddddd`, 1px, solid; 10 to 16 lines (one per tick) |
| Vertical grid | line and area: yes, 12 lines, same style; bar: none |
| Axis line | in the DOM but stroke `transparent`, so not visible |
| Tick marks | yes, 5px, `#777777`, 1px, on both axes |
| Line stroke | 2px, straight segments; point markers on every datum (10px circle, 2px border, background fill) |
| Area | fill opacity 0.2, 2px line on top |
| Bar corner radius | 0 |
| Bar width / gap | 66.39 / 7.38 px, gap:width 0.11, bar = 0.90 of band; value label printed inside every bar |
| Series colours | `#e8c1a0`, `#f47560`, `#f1e15b`, `#e8a838`, `#61cdbb` (scheme `nivo`) |
| Donut | inner 50 / outer 100 px, ratio 0.50; centre empty; value labels inside slices, link labels with category names outside, legend row below; no slice stroke |
| Y tick format | plain integers, no separator: `0, 500, 1000 ... 4500` |

## Observable Plot

- **Rendered with:** `@observablehq/plot` 0.6.17. Real library.
- **Marks:** `lineY` + `ruleY([0])`, `barY` + `ruleY([0])`, stacked `barY` with `fill`, `areaY` with `fill`; `color: {legend: true}` on the three multi-series charts.
- **Harness deviations:** `x.domain` and `color.domain` passed in data order (Plot sorts ordinal domains alphabetically). `width: 640`; `height` 320 for bar and 282 for the charts with a legend, because the swatch legend is HTML outside the SVG (38 px). The browser's default `figure` margin was zeroed.
- **Not rendered:** `plot-donut`. The package exports no arc, pie or donut mark.
- **Sources (standard docs pages, not fetched in this run; defaults were read from the rendered output and the installed package):** `https://observablehq.com/plot/marks/line`, `https://observablehq.com/plot/marks/bar`, `https://observablehq.com/plot/marks/area`, `https://observablehq.com/plot/features/legends`

| Fact | Measured |
|---|---|
| Tick font | 10px, weight 400, `system-ui, sans-serif` (set on the SVG) |
| Tick colour | `#000000` (currentColor) |
| Legend | 10px, `#000000`, top-left above the chart; 15x15 square swatch |
| Grid | none, horizontal or vertical |
| Axis line | none; only the explicit `ruleY([0])` baseline, `#000000` 1px |
| Tick marks | yes, 6px, currentColor, on both axes |
| Axis labels | `↑ mrr` / `↑ signups` / `↑ count` top-left and `month` / `channel` bottom centre, by default |
| Line stroke | 1.5px, straight segments, no dots |
| Area | fill opacity 1, no stroke |
| Bar corner radius | 0 |
| Bar width / gap | single: 86 / 9 px; stacked: 75.25 / 7.88 px; gap:width 0.10, bar = 0.91 of band |
| Series colours | `#4269d0`, `#efb118`, `#ff725c` (scheme `observable10`); the single-series bar has no colour channel and is `#000000` |
| Donut | n/a |
| Y tick format | integers with thousands comma: `0, 500, 1,000 ... 4,000` |

## Highcharts

- **Rendered with:** `highcharts` 13.1.1 (the exact version asked for; `Highcharts.version` read at runtime). Real library.
- **Options:** `chart.type`, `title.text: undefined`, `xAxis.categories`, `series`, `plotOptions.series.animation: false`; `stacking: 'normal'` for stacked and area; `plotOptions.pie.innerSize: '50%'` for the donut. Credits, legend, y-axis title left at defaults.
- **Sources (the `innerSize` sample name was read from the installed package's `PieSeriesDefaults.js`; the docs pages were not fetched in this run):** `https://api.highcharts.com/highcharts/plotOptions.pie.innerSize` (sample `highcharts/plotoptions/pie-innersize-50percent`), `https://api.highcharts.com/highcharts/plotOptions.series.stacking`, `https://www.highcharts.com/docs/getting-started/your-first-chart`

| Fact | Measured |
|---|---|
| Tick font | 12.8px (0.8em), weight 400, Highcharts' own stack `-apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial, ...` |
| Tick colour | `#333333` |
| Legend | 12.8px, `#333333`, centred below; shown even for a single series; none for the pie |
| Horizontal grid | 4 to 6 lines, `#e6e6e6`, 1px, solid |
| Vertical grid | none visible (paths exist with stroke-width 0) |
| Axis line | x: yes, `#333333` 1px; y: none (stroke-width 0) |
| Tick marks | none |
| Y-axis title | `Values`, 12.8px, `#666666`, by default |
| Credits | `Highcharts.com` bottom-right, by default |
| Line stroke | 2px, straight segments; point markers on every datum (8px; circle, diamond, square per series) |
| Area | fill opacity 0.75, 2px line and markers on top |
| Bar corner radius | 3 on the top corners of the top segment, 0 elsewhere; 1px `#ffffff` border on every bar |
| Bar width / gap | 46 / 49 px, gap:width 1.07, bar = 0.48 of band |
| Series colours | `#2caffe`, `#544fc5`, `#00e272`, `#fe6a35`, `#6b8abc` |
| Donut | inner 62.7 / outer 125.6 px, ratio 0.50; centre empty; connector data labels with category names (11.2px, bold, `#000000`); 1px `#ffffff` slice stroke |
| Y tick format | SI-style suffix above 999: `0, 1k, 2k, 3k, 4k, 5k`; plain below (`0, 100, 200, 300`) |

## Reproduce

From the `rivals` directory: `node build.mjs && node shoot.mjs`. Chart definitions are in `src/shadcn.jsx`, `src/nivo.jsx`, `src/main.jsx` (Plot, Highcharts) and `tremor/src/main.jsx`; the DOM probes are in `measure.mjs`.
