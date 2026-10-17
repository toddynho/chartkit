# @chartkitdev/core

Framework-free ChartKit core. Zero runtime dependencies. The agent interface is a JSON spec. React props are a separate API; see the last section.

- `schema/chartkit.schema.json` — ChartKit spec v1 (`$id`: `https://chartkit.dev/schema/v1.json`), exported as `@chartkitdev/core/schema.json`
- `validate(spec)` — `@chartkitdev/core/validate`. Structural and data-aware diagnostics (`CK1001`…`CK4004`). The runtime checker uses a stripped schema; codes, pointers, hints, and fixes match the published schema.
- `render(spec, target?)` — SVG. The package root is a registry. Chart modules are opt-in. An unregistered type returns an error SVG (`CK1010`) and does not throw. An omitted theme renders as Soft.

```ts
import { render } from "@chartkitdev/core/all";
import { validate } from "@chartkitdev/core/validate";
```

A line-only bundle registers just that chart:

```ts
import { createRenderer } from "@chartkitdev/core";
import { line } from "@chartkitdev/core/charts/line";

const render = createRenderer([line]);
```

`mark.sampling` defaults to `"auto"`: line, area, sparkline, mini-area, stacked-area, combo lines, and spike charts downsample above twice the plot width. See [SPEC.md](./SPEC.md).

Theme colors are CSS variables (`var(--ck-series-1, …)`, `--ck-text`, `--ck-background`, and the rest) so a host stylesheet wins. An omitted theme, `"auto"`, or `"soft"` is Soft: `light-dark()` colours that follow the page scheme, and a transparent plot so the page shows through. Set `--ck-background: light-dark(#f5f5f7, #1c1c1e)` for the optional Soft card. `"refined"` and `"editorial"` are built in. `theme: "midnight"` is the opt-in dark card. Other presets are `@chartkitdev/core/themes/<name>` (a name that has not been imported renders as midnight). `@chartkitdev/core/all` registers those extra presets. A brand palette stays a separate import: `paletteFromBrand` from `@chartkitdev/core/themes/brand`, passed as `theme.tokens.series`.

TypeScript types in `src/generated/schema.ts` are generated from the schema (`npm run generate:types`). Do not edit that file by hand.

Not published yet. See [docs/migrate.md](../../docs/migrate.md).

## Rules

- `version` is `"1"`. `a11y.alt` is one sentence and is required.
- `data` is a plain array of row objects. It is not `{ "values": [...] }`. Sparkline, mini-area, and spike may use a plain number array. Large data may use `{ "columns": { "field": [] } }`.
- The chart type goes in `type`. `mark` is an options object (`curve`, `sampling`, `layout`), not a string.
- Gauge, kpi, and progress-ring put the number in `metric`: `{ "value", "min", "max", "delta", "label" }`. Those keys are not top-level. A `data` object of the same fields moves into `metric`.
- Donut uses `encoding.x` (slice label) and `encoding.y` (slice value). Not `theta`, `angle`, or `label`.
- `encoding.*.axis` is the string `"y"` or `"y2"`. Titles go in `axes.y.title` or `axes.y2.title`.
- Field types are `quantitative`, `temporal`, `ordinal`, or `nominal`. Not `categorical`.
- A list of fields goes on `encoding.y`, not on `field`. On a combo, `bar`, `line`, and `area` go in `mark`, not in `type`. A series with `"axis": "y2"` needs `axes.y2`; `repair` adds it when it is missing.
- A bar splits series with `encoding.series`, or with `encoding.color` when that field is not `x`. `encoding.color` equal to `x` colours each bar and does not split series. `mark.stack` is `"stack"` or `"percent"`. `scale.type` `"log"` is a log axis. A temporal `x` is a time axis. `format` on an axis or channel is applied to the ticks. Rule, band, and text `annotations` are drawn. Tooltip, zoom, pan, brush, animation, `legend.interactive`, and `a11y.keyboard` / `a11y.dataTable` are valid; when one is turned on, `validate` warns CK3011 because the SVG does not draw it yet. The default theme is `auto` (Soft: `light-dark`, transparent plot, page scheme; optional card via `--ck-background`). `soft`, `refined`, and `editorial` are built in. `midnight` is opt-in. Other names stay midnight until imported. `--ck-*` or `--chart-N` still wins.
- A heatmap with `encoding.x`, `encoding.y`, and `encoding.color` is a grid. A calendar heatmap is a date `x` plus `color`, or `mark.layout: "calendar"`.
- Histogram bins `encoding.x` (`mark.bins`, default 8). `encoding.y` is a pre-binned count. Boxplot uses `encoding.x` and observation `encoding.y`. Radar uses `encoding.x` and one or more `encoding.y` fields. Funnel uses `encoding.x` (stage) and `encoding.y`. Treemap uses `encoding.x`, `encoding.y`, and optional `encoding.color`. Sankey uses `encoding.source`, `encoding.target`, and `encoding.y`. Waterfall uses `encoding.x` and `encoding.y`; color `"total"` anchors that bar at zero. Bullet uses `metric`, including optional `target` and `bands`.

## line

```json
{
  "version": "1",
  "type": "line",
  "data": [
    { "quarter": "Q1", "units": 40 },
    { "quarter": "Q2", "units": 55 },
    { "quarter": "Q3", "units": 48 }
  ],
  "encoding": { "x": "quarter", "y": "units" },
  "a11y": { "alt": "Units peaked in Q2." }
}
```

## bar

```json
{
  "version": "1",
  "type": "bar",
  "data": [
    { "lane": "A", "stops": 12 },
    { "lane": "B", "stops": 7 },
    { "lane": "C", "stops": 15 }
  ],
  "encoding": { "x": "lane", "y": "stops" },
  "a11y": { "alt": "Lane C has the most stops." }
}
```

## donut

```json
{
  "version": "1",
  "type": "donut",
  "data": [
    { "wood": "Oak", "boards": 8 },
    { "wood": "Pine", "boards": 5 },
    { "wood": "Maple", "boards": 3 }
  ],
  "encoding": { "x": "wood", "y": "boards" },
  "a11y": { "alt": "Oak is the largest share of boards." }
}
```

## stacked-area

```json
{
  "version": "1",
  "type": "stacked-area",
  "data": [
    { "year": "2022", "rail": 20, "road": 30 },
    { "year": "2023", "rail": 24, "road": 28 }
  ],
  "encoding": { "x": "year", "y": ["rail", "road"] },
  "a11y": { "alt": "Road stayed larger than rail." }
}
```

## scatter

```json
{
  "version": "1",
  "type": "scatter",
  "data": [
    { "temp": 16, "yieldKg": 3 },
    { "temp": 22, "yieldKg": 5 },
    { "temp": 27, "yieldKg": 4 }
  ],
  "encoding": { "x": "temp", "y": "yieldKg" },
  "a11y": { "alt": "Yield is highest at 22 degrees." }
}
```

## combo

```json
{
  "version": "1",
  "type": "combo",
  "data": [
    { "week": "W1", "orders": 30, "rate": 0.4 },
    { "week": "W2", "orders": 36, "rate": 0.55 }
  ],
  "encoding": {
    "x": "week",
    "y": [
      { "field": "orders", "mark": "bar" },
      { "field": "rate", "mark": "line", "axis": "y2" }
    ]
  },
  "axes": { "y2": { "title": "Fill rate" } },
  "a11y": { "alt": "Orders and the fill rate both rose." }
}
```

## heatmap

```json
{
  "version": "1",
  "type": "heatmap",
  "data": [
    { "bin": "A", "band": "Low", "level": 1 },
    { "bin": "B", "band": "Low", "level": 4 },
    { "bin": "A", "band": "High", "level": 2 }
  ],
  "encoding": { "x": "bin", "y": "band", "color": "level" },
  "a11y": { "alt": "Bin B in the low band is the darkest cell." }
}
```

## gauge

```json
{
  "version": "1",
  "type": "gauge",
  "metric": { "label": "Capacity", "value": 64, "min": 0, "max": 100 },
  "a11y": { "alt": "Capacity is 64 out of 100." }
}
```

## kpi

```json
{
  "version": "1",
  "type": "kpi",
  "metric": { "label": "Tickets", "value": 18, "delta": -0.05 },
  "a11y": { "alt": "Open tickets are 18, slightly down." }
}
```

## sparkline

```json
{
  "version": "1",
  "type": "sparkline",
  "data": [4, 6, 5, 9, 8],
  "a11y": { "alt": "The sparkline ends higher than it starts." }
}
```

## mini-area

```json
{
  "version": "1",
  "type": "mini-area",
  "data": [2, 3, 3, 6, 5],
  "a11y": { "alt": "The mini area rises, then eases." }
}
```

## progress-ring

```json
{
  "version": "1",
  "type": "progress-ring",
  "metric": { "label": "Done", "value": 3, "min": 0, "max": 8 },
  "a11y": { "alt": "3 of 8 items are done." }
}
```

## spike

```json
{
  "version": "1",
  "type": "spike",
  "data": [
    { "slot": "t1", "hits": 0 },
    { "slot": "t2", "hits": 6 },
    { "slot": "t3", "hits": 1 }
  ],
  "encoding": { "x": "slot", "y": "hits" },
  "a11y": { "alt": "Hits spike at t2." }
}
```

## candlestick

```json
{
  "version": "1",
  "type": "candlestick",
  "data": [
    { "day": "D1", "open": 5, "high": 7, "low": 4, "close": 6 },
    { "day": "D2", "open": 6, "high": 6, "low": 3, "close": 4 }
  ],
  "encoding": { "x": "day", "open": "open", "high": "high", "low": "low", "close": "close" },
  "a11y": { "alt": "The second session closed below its open." }
}
```

## histogram

```json
{
  "version": "1",
  "type": "histogram",
  "data": [
    { "score": 1 },
    { "score": 2 },
    { "score": 2 },
    { "score": 8 }
  ],
  "encoding": { "x": "score" },
  "mark": { "bins": 2 },
  "a11y": { "alt": "Scores cluster at the low end." }
}
```

## boxplot

```json
{
  "version": "1",
  "type": "boxplot",
  "data": [
    { "group": "A", "value": 1 },
    { "group": "A", "value": 3 },
    { "group": "A", "value": 9 },
    { "group": "B", "value": 2 },
    { "group": "B", "value": 4 },
    { "group": "B", "value": 5 }
  ],
  "encoding": { "x": "group", "y": "value" },
  "a11y": { "alt": "Group A stretches higher than group B." }
}
```

## radar

```json
{
  "version": "1",
  "type": "radar",
  "data": [
    { "spoke": "Speed", "car": 4, "bike": 2 },
    { "spoke": "Cost", "car": 2, "bike": 5 },
    { "spoke": "Ease", "car": 3, "bike": 4 }
  ],
  "encoding": { "x": "spoke", "y": ["car", "bike"] },
  "a11y": { "alt": "The bike scores higher on cost and ease." }
}
```

## funnel

```json
{
  "version": "1",
  "type": "funnel",
  "data": [
    { "stage": "Visit", "count": 80 },
    { "stage": "Start", "count": 40 },
    { "stage": "Pay", "count": 12 }
  ],
  "encoding": { "x": "stage", "y": "count" },
  "a11y": { "alt": "12 of 80 visits pay." }
}
```

## treemap

```json
{
  "version": "1",
  "type": "treemap",
  "data": [
    { "name": "Oak", "size": 8, "group": "Wood" },
    { "name": "Pine", "size": 5, "group": "Wood" },
    { "name": "Steel", "size": 6, "group": "Metal" }
  ],
  "encoding": { "x": "name", "y": "size", "color": "group" },
  "a11y": { "alt": "Oak is the largest tile." }
}
```

## sankey

```json
{
  "version": "1",
  "type": "sankey",
  "data": [
    { "from": "Source", "to": "Mill", "flow": 10 },
    { "from": "Mill", "to": "Shop", "flow": 6 }
  ],
  "encoding": { "source": "from", "target": "to", "y": "flow" },
  "a11y": { "alt": "The mill sends flow on to the shop." }
}
```

## React components (not the JSON spec)

`@chartkitdev/react` exports dashboard components. Props such as `dataKey`, `leftAxis`, and `value` on `GaugeChart` are not spec keys. To render a spec, use `<Chart spec={...} />`.

`@chartkitdev/vue`, `@chartkitdev/svelte`, and `@chartkitdev/vanilla` render this same spec. Vue SSR and SvelteKit include the SVG. `mount(element, spec)` returns `{ update(spec), destroy() }`. None of them add spec keys.
