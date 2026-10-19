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

Interaction is a separate entry. Static `render()` output does not include it.

```ts
import { attach, patchSvg } from "@chartkitdev/core/interact";

patchSvg(host, render(spec));
const chart = attach(host, spec, { render });
chart.update(nextSpec, render(nextSpec));
chart.destroy();
```

`mark.sampling` defaults to `"auto"`: line, area, sparkline, mini-area, stacked-area, combo lines, and spike charts downsample above twice the plot width. See [SPEC.md](./SPEC.md).

Theme colors are CSS variables (`var(--ck-series-1, …)`, `--ck-text`, `--ck-background`, and the rest) so a host stylesheet wins. An omitted theme, `"auto"`, or `"soft"` is Soft: `light-dark()` colours that follow the page scheme, and a transparent plot so the page shows through. Set `--ck-background: light-dark(#f5f5f7, #1c1c1e)` for the optional Soft card. `"refined"` and `"editorial"` are built in. `theme: "midnight"` is the opt-in dark card. Other presets are `@chartkitdev/core/themes/<name>` (a name that has not been imported renders as midnight). `@chartkitdev/core/all` registers those extra presets. A brand palette stays a separate import: `paletteFromBrand` from `@chartkitdev/core/themes/brand`, passed as `theme.tokens.series`. `mark.palette` overrides the series list for one spec. `mark.colorRules` recolours a bar, line point, scatter point, or slice when the value matches (`negative`, `positive`, or `lt` / `gt` / `eq`). `encoding.color.domain` maps category values onto `range`.

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
- A bar splits series with `encoding.series`, or with `encoding.color` when that field is not `x`. `encoding.color` equal to `x` colours each bar and does not split series. `mark.stack` is `"stack"` or `"percent"`. `scale.type` `"log"` is a log axis. `axes.x`, `axes.y`, and `axes.y2` take `titlePosition` (`start`, `center`, `end`), `titleRotate`, `autoSkip`, `labelWidth`, `labelLines`, `line` (`true` or `{ show, color, width, dash }`), `tickMarks` (`inside`, `outside`, `none`), and `tickLength`. The baseline and tick marks stay off until set, including on `createRenderer([line])`. A temporal `x` is a time axis. `format` on an axis or channel is applied to the ticks. Rule, band, and text `annotations` are drawn. Tooltip, crosshair, x zoom, pan, brush, animation, `legend.interactive`, and `a11y.keyboard` / `a11y.dataTable` are client behavior and stay off unless set in `@chartkitdev/core/interact` (a separate entry, so a static bundle does not include it). Tooltip defaults on for a client-rendered line, bar, stacked area, scatter, combo, donut, or waterfall. Sankey nodes and links and waterfall bars are named on click and selection; `tooltip: false` turns it off. `tooltip.fields` lists the rows in order (`"cost"` or `{ "field", "title", "format" }`). `tooltip.position` is `auto`, `top`, `bottom`, `left`, or `right`. `tooltip.crosshairLabel: true` prints the x value on the guide. `interaction.select` is `"point"` or `"series"`. Clicks emit `pointclick`, `seriesclick`, and `legendclick` (`series`, `datum`, `index`, `x`, `y`, `value`, `row`). Enter or Space on a focused point emits `pointclick`. Shift, Ctrl, or Meta adds. Escape or a background click clears. `--ck-dim` and `--ck-selected` style the marks. Legend hover highlights that series. `mark.pointShape` is `circle`, `square`, `diamond`, `triangle`, `cross`, or `none`, and `mark.pointFill` is `filled` or `hollow`. A y series can override `pointShape`, `pointSize`, and `pointFill`, and the legend swatch uses that marker. `mark.labels` draws values on line, stacked area, scatter, bar, and donut. `mark.labelPosition` places them (`top`, `bottom`, `left`, `right`, `center`, `inside`, `outside`). `mark.labelFormat` reuses a format preset. Overlapping labels are skipped. `mark.labelEnds` is `all`, `ends`, or `last` on a line. `mark.stackTotal` labels a stacked bar or stacked area. `select: true` repairs to `"point"`. `onClick` and `click` are not spec keys. The static SVG is unchanged apart from hook attributes the client sets after mount (`data-ck-interact` on the host, `tabindex` when keyboard is on). Zoom, pan, and brush stay off unless the spec asks; a candlestick with `zoom` omitted pans and zooms on x. Animation is off unless requested, and stays off for `prefers-reduced-motion` and for more than 2000 rows. The default theme is `auto` (Soft: `light-dark`, transparent plot, page scheme; optional card via `--ck-background`). `soft`, `refined`, and `editorial` are built in. `midnight` is opt-in. Other names stay midnight until imported. `--ck-*` or `--chart-N` still wins.
- `toPNG(svg, { scale, background })`, `toSVG`, and `toCSV` live on `@chartkitdev/core/export` and are re-exported by the React, Vue, Svelte, and vanilla adapters. `interaction.export` (`png`, `svg`, `csv`) adds a keyboard menu that loads only when that list is set, so `createRenderer([line])` and tooltip-only interact stay free of canvas code. `toPNG` copies computed font properties and same-origin or `data:`/`blob:` `@font-face` rules. A cross-origin stylesheet throws and is skipped. Remote font files and external images are not embedded; a remote image taints the canvas. System fonts are named, not stored.
- `legend.position` is `top`, `right`, `bottom`, `left`, or `inside` (`anchor` places an inside legend). `align`, `orient`, `maxRows` (later rows page), `title`, `symbol`, `symbols`, and `hide` (omit from the legend, still draw the series) apply when set. The default top legend is unchanged. A funnel draws that legend when `legend` is set; with it omitted, the stage captions stay and no legend is added.
- `encoding.color.scale.type` may be `sequential`, `diverging` (`midpoint`), `quantize` (`bins`), or `threshold` (`thresholds`). `scheme` is `blue`, `teal`, `orange`, or `violet` (colour-blind-safe; midnight uses a brighter ramp of the same name). A `range` of two or more colours replaces the scheme. These types are not valid on x or y. Heatmap and calendar use the sequential ramp for a numeric colour with no constant; a constant keeps the opacity ramp. Bar, combo, scatter, and treemap paint a ramp when `encoding.color.scale` is set. A threshold legend labels the cuts (`<6`, `6–12`, `≥12`), not the data ends. Line, area, and sparkline keep their series colours, so `createRenderer([line])` carries legend layout and not the ramp. A missing heatmap cell is a hatched card, not the low stop. Each named scheme's low stop stays at least 3:1 against the Soft card (`#f5f5f7`) and the midnight card (`#0c0c0c`).
- A heatmap with `encoding.x`, `encoding.y`, and `encoding.color` is a grid. A calendar heatmap is a date `x` plus `color`, or `mark.layout: "calendar"`. `mark.weeks` on a grid warns CK3012. With no `size`, calendar cells stay 12px. `size.width` lays the weeks across that width; `size.height` sets the row pitch. The colour legend sits under the first week. `mark.curve` defaults to `monotone`, which is monotone-x and does not overshoot a spike. `smooth`, `spline`, and `basis` repair to `monotone`. `mark.glow: true` paints a blurred understroke on line and sparkline; the filter is omitted unless it is set.
- Histogram bins `encoding.x` (`mark.bins` default 8, `mark.binWidth`, or `mark.bin` of count, width, sturges, sqrt, or fd). `encoding.y` is a pre-binned count. Boxplot uses `encoding.x` and observation `encoding.y`. Radar uses `encoding.x` and one or more `encoding.y` fields. Funnel uses `encoding.x` (stage) and `encoding.y`. `mark.shape` is `"bar"` (centered rounded bars, the default) or `"trapezoid"`. Treemap uses `encoding.x`, `encoding.y`, and optional `encoding.color`. Leaves in a group use tints of that group's series color. Sankey uses `encoding.source`, `encoding.target`, and `encoding.y`. Bullet uses `encoding.x`, `encoding.y`, optional `encoding.target`, and `mark.ranges`. Waterfall uses `encoding.x` and delta `encoding.y`; `mark.total` names a field that marks an absolute total. These eight types render from `@chartkitdev/core/extra`, or from `@chartkitdev/core/charts/<type>` one at a time. Adapters load that chart module when `spec.type` needs it. Their SSR entry imports `@chartkitdev/core/extra` statically.
- Gantt, timeline, quadrant, venn, and journey use the same on-demand path. Mermaid for those five is `@chartkitdev/core/mermaid/phase4`, or `fromMermaidAsync` on the base entry. `validate()` accepts those five names and warns CK1011; `validateAsync()` loads the field rules. `validatePhase4()` and `repairPhase4()` from `@chartkitdev/core/validate/phase4` check them (CK1400–CK1412). Gantt takes start plus end or duration, status done/active/crit, dependencies, milestones, progress, and a today marker. Timeline takes events and period spans. Quadrant takes x/y in a domain (default 0..1) and `quadrants`: top-left, top-right, bottom-left, bottom-right. `subtitle` stays a subtitle. Venn takes 2 or 3 sets; two are area-proportional and three are approximate. Journey takes sections, steps, a 1–5 score, and actors.

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

## pie

```json
{
  "version": "1",
  "type": "pie",
  "data": [
    { "wood": "Oak", "boards": 8 },
    { "wood": "Pine", "boards": 5 },
    { "wood": "Maple", "boards": 3 }
  ],
  "encoding": { "x": "wood", "y": "boards" },
  "mark": { "labels": true, "padAngle": 1.5 },
  "a11y": { "alt": "Oak is the largest share of boards." }
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

## bullet

```json
{
  "version": "1",
  "type": "bullet",
  "data": [{ "name": "Revenue", "value": 275, "target": 250, "good": 300 }],
  "encoding": { "x": "name", "y": "value", "target": "target" },
  "mark": { "ranges": ["good"] },
  "a11y": { "alt": "Revenue is past its target." }
}
```

## waterfall

```json
{
  "version": "1",
  "type": "waterfall",
  "data": [
    { "step": "Open", "amount": 120, "total": true },
    { "step": "Won", "amount": 40 },
    { "step": "Close", "amount": 160, "total": true }
  ],
  "encoding": { "x": "step", "y": "amount" },
  "a11y": { "alt": "The close is 160." }
}
```

## gantt

```json
{"version":"1","type":"gantt","data":[{"id":"a","task":"Spec","section":"Plan","start":"2026-03-02","end":"2026-03-13","status":"done"},{"id":"b","task":"Ship","start":"2026-04-06","milestone":true,"depends":"a"}],"a11y":{"alt":"Ship follows the spec."}}
```

## timeline

```json
{"version":"1","type":"timeline","data":[{"label":"Founded","date":"2014-06-01"},{"label":"Platform","start":"2024-01-01","end":"2026-01-01","kind":"period"}],"a11y":{"alt":"The company started in 2014."}}
```

## quadrant

```json
{"version":"1","type":"quadrant","quadrants":["Quick wins","Big bets","Fill-ins","Reconsider"],"data":[{"name":"SSO","x":0.2,"y":0.8},{"name":"Reports","x":0.8,"y":0.3}],"encoding":{"x":"x","y":"y"},"a11y":{"alt":"SSO is a quick win."}}
```

## venn

```json
{"version":"1","type":"venn","data":[{"set":"Search","size":12},{"set":"Filters","size":8},{"set":"Search+Filters","size":3}],"a11y":{"alt":"Search and filters overlap."}}
```

## journey

```json
{"version":"1","type":"journey","data":[{"section":"Pay","step":"Enter card","score":2,"actors":"Shopper"}],"a11y":{"alt":"Entering a card scores 2."}}
```

## React components (not the JSON spec)

`@chartkitdev/react` exports dashboard components. Props such as `dataKey`, `leftAxis`, and `value` on `GaugeChart` are not spec keys. To render a spec, use `<Chart spec={...} />`.

`@chartkitdev/vue`, `@chartkitdev/svelte`, and `@chartkitdev/vanilla` render this same spec. Vue SSR and SvelteKit include the SVG. `mount(element, spec)` returns `{ update(spec), destroy() }`. None of them add spec keys.
