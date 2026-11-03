# Strip spec proposal

Status: awaiting Todd's OK. The implementation on this branch follows this document and can change.

ChartKit already has 37 rendered types (`HERO_TYPE_COUNT` in `apps/web/src/data/hero-catalog.ts`: the schema enum plus gantt, timeline, quadrant, venn, journey, choropleth, and map-points). `strip` makes 38. The spec major stays `"1"`. The package version stays `0.5.0`. The published schema is `packages/core/schema/chartkit.schema.json` (`$id` `https://chartkit.dev/schema/v1.json`), not a separate `schema/v1.json` file.

Options that belong to one type live on `mark`. Root `sort` is already `{ field, by, order }` for row order, and `mark.orientation` / `mark.sort` already exist for bar and for pie. Strip uses those objects instead of new root keys.

## Encoding

`data` is flat rows. `a11y.alt` stays required.

Horizontal is the default, and it is what you get when `mark.orientation` is omitted. Bar still defaults to vertical. The schema `default` on `mark.orientation` stays `"vertical"` because that word describes bar. The description says strip treats an omission as horizontal.

| | Group (nominal) | Value (quantitative) |
| --- | --- | --- |
| Horizontal (default) | `encoding.y` | `encoding.x` |
| `mark.orientation: "vertical"` | `encoding.x` | `encoding.y` |

Optional:

- `encoding.color` colors the dots. A field uses the series palette. A constant color is the existing color channel.
- `encoding.label` is a new channel. It is the point's name in the tooltip (the model name on the benchmark). It is not drawn as a text label on the plot.

With no color and no highlight, each group takes the next series color. With `mark.highlight` set to a group value, that group's dots use `accent` and every other group uses `muted`. The summary tick uses the `text` token (ink) either way. The band uses `accent` at opacity `0.12`, the same default as an annotation band. No new tokens.

## Mark options

All of these have a default. A spec with only `version`, `type`, `data`, `encoding.x`, `encoding.y`, and `a11y.alt` draws a horizontal strip: one row per group, a median tick, no band, data order, series colors, and jitter only where two dots would sit on top of each other.

| Property | Values | Default when omitted | Drawn as |
| --- | --- | --- | --- |
| `mark.summary` | `"none"` \| `"median"` \| `"mean"` | `"median"` | A tick through the group, in ink. |
| `mark.band` | `"none"` \| `"range"` \| `"iqr"` | `"none"` | A rounded bar from min to max, or from Q1 to Q3. |
| `mark.jitter` | `"none"` \| `"auto"` \| number (0–40, px) | `"auto"` | Perpendicular to the value axis. `"auto"` moves a point only when another point in the group is within one diameter. A number is the max offset and is applied to every point. The offset is a function of group, label, value, and index, so SSR matches the client. |
| `mark.highlight` | string, a group value | omitted | That group is accent. The others are muted. |
| `mark.sort` | `"none"` \| `"asc"` \| `"desc"` | `"none"` | `"none"` keeps first-seen group order. `"asc"` and `"desc"` order groups by the summary that is drawn. When the summary is `"none"`, the sort key is the median. |
| `mark.orientation` | `"horizontal"` \| `"vertical"` | horizontal for strip | See the table above. |
| `mark.pointSize` | number, existing | the theme point size | Dot radius in px. |

`mark.pointShape` stays off strip in v1. Dots are circles.

## Annotations

The existing annotation types (`rule`, `band`, `text`, `trendline`, `regression`, `marker`) cannot say "from this group's median to that group's median". Text notes take a numeric `y`. The benchmark note is that kind of comparison, so v1 adds one annotation variant:

```json
{
  "type": "compare",
  "from": { "group": "ChartKit", "at": "summary" },
  "to": { "group": "Plot", "at": "summary" },
  "label": "3.5× fewer than Plot, next best"
}
```

`at` is `"summary"`, `"min"`, `"max"`, or `"mean"`. `"summary"` uses the tick that is drawn, or the median when the tick is hidden. The mark is a bracket between the two positions, in `accent`, with the label. On any type other than `strip` the annotation warns and `repair()` removes it.

## Decisions

**Numeric group channel.** A strip's group axis is categorical even when the values are numbers (`1`, `2`, `3` are three rows, not a scale). The renderer stringifies each distinct value. `validate()` warns **CK3086** and does not patch. Setting `encoding.y.type` to `"nominal"` is not a useful patch: the walker already warns that an explicit nominal type is ignored because ChartKit infers scale type. Rewriting the rows would invent data.

**Value channel that is not numeric.** **CK3087**, an error, no patch.

**One point in every group.** The chart is a Cleveland dot plot. The renderer hides the summary tick and the band, including the median default. **CK3090** warns. `repair()` sets `mark.summary` and `mark.band` to `"none"` so the spec matches the picture.

**Band when a group has fewer than 3 points.** The renderer draws no band on that group. A median tick still draws. **CK3089** warns when `mark.band` is `"range"` or `"iqr"` and any group is short. `repair()` sets `mark.band` to `"none"` only when no group has 3 or more points. Mixed groups keep the option and skip the short bands.

**More than 12 groups.** **CK3088** warns. Nothing is dropped. The hint points at `boxplot`.

**Unsorted x.** **CK2008** (x values are not sorted) does not apply to strip. The value column is not a series. Same exception scatter and histogram already have.

**Unknown fields.** `encoding.label` joins the existing channel list, so a typo is **CK2001** with the current fuzzy suggestion and repair patch.

**Unknown highlight.** **CK3091** warns. `repair()` removes `mark.highlight`.

## Error codes

Next free code after CK3085 (`theme.brand`) is CK3086.

| Code | Severity | When | Repair |
| --- | --- | --- | --- |
| CK3086 | warning | The group channel is quantitative. Each distinct number is a category. | None. |
| CK3087 | error | The value channel has no numeric values. | None. |
| CK3088 | warning | More than 12 groups. | None. |
| CK3089 | warning | `mark.band` is `"range"` or `"iqr"` and a group has fewer than 3 points. | Set `mark.band` to `"none"` only when every group is short. |
| CK3090 | warning | Every group has one point. Summary and band are hidden. | Set `mark.summary` and `mark.band` to `"none"`. |
| CK3091 | warning | `mark.highlight` matches no group. | Remove `mark.highlight`. |
| CK3092 | warning | A `compare` annotation is on a chart that is not a strip. | Remove that annotation. |
| CK3093 | warning | `encoding.label` is set on a type other than strip. | Remove `encoding.label`. |

Missing `encoding.x` or `encoding.y` stays **CK1003**. A bad enum stays **CK1007**. An unknown field stays **CK2001**.

## Schema diff

Add `"strip"` to the root `type` enum, to the `allOf` branch that requires `data`, and to the branch that requires `encoding.x` and `encoding.y`. Extend the `type` description with one sentence: a strip is one row (or column) of observations, a shared numeric axis, an optional summary tick, and an optional band.

`mark` gains `summary`, `band`, `jitter` (`"none"` | `"auto"` | number 0–40), and `highlight` (string). Descriptions name the default and say they apply to strip. `mark.orientation` and `mark.sort` descriptions gain strip. `mark.pointSize` gains strip.

`encoding` gains `label`, a normal channel. Description: point name for a strip tooltip. Other types warn CK3093.

`annotation.oneOf` gains the `compare` object above. `from` and `to` are `{ group, at }` with `additionalProperties: false`.

## Examples

### 1. Benchmark

Published cells from `apps/web/src/data/token-eval.ts`. Nine finished models, five libraries. Medians: ChartKit 94, Plot 332, ECharts 492, Chart.js 808, Recharts 1358. `332 / 94` is 3.53, which the page already rounds to 3.5. The alt sentence is the one llms.txt should teach.

`mark.sort` is `"asc"` so the rows follow the median. `mark.band` is `"range"`. `mark.highlight` is `"ChartKit"`. The x domain is `[0, 2000]`, matching the hand-drawn axis. Jitter stays `"auto"` and does not move these points: no two models in one library share a token count within a dot's width at that domain.

Compact JSON is 3,069 characters and **925 tokens** in `gpt-tokenizer` (cl100k, the GPT-4 encoding). Pretty-printed it is 1,603 tokens. The 220-token target cannot hold 45 labelled rows. Shortening the keys does not help, because the model names are the bulk. The zero-option spec below is the "twelve lines" case, at **67 tokens**. The benchmark keeps every published cell. The rows in implementation order are the nine models in `token-eval.ts`, and inside each model the libraries ChartKit, Plot, Chart.js, Recharts, ECharts. Values, in that model order:

- ChartKit: 133, 124, 127, 115, 94, 82.5, 86.5, 88, 78.5
- Plot: 711, 333, 356, 300, 464, 332, 244, 266, 166
- Chart.js: 1193, 887, 901, 656, 820, 808, 491, 492, 444.5
- Recharts: 1285, 1499, 1713, 1468, 874, 1594, 1273, 1358, 365
- ECharts: 882, 544, 469, 379, 675, 488, 492, 536, 284

Model labels are `modelLabel()` from that file: `Claude Haiku 4.5`, `Claude Sonnet 4.5`, `Claude Opus 4.5`, `Claude Fable 5`, `GPT-5 Luna`, `GPT-5.1 Terra`, `GPT-5.1 Sol`, `GPT-5 Astra`, `Grok 4`.

```json
{
  "version": "1",
  "type": "strip",
  "data": [{ "library": "ChartKit", "model": "Claude Haiku 4.5", "tokens": 133 }],
  "encoding": {
    "x": { "field": "tokens", "scale": { "domain": [0, 2000] } },
    "y": "library",
    "label": "model"
  },
  "mark": { "band": "range", "highlight": "ChartKit", "sort": "asc" },
  "annotations": [
    {
      "type": "compare",
      "from": { "group": "ChartKit", "at": "summary" },
      "to": { "group": "Plot", "at": "summary" },
      "label": "3.5× fewer than Plot, next best"
    }
  ],
  "a11y": { "alt": "ChartKit's median is 94 tokens, 3.5× below Plot at 332." }
}
```

The `data` array in the real spec is all 45 rows. The snippet shows the shape of one.

### 2. One point per group

A dot plot. Summary and band are hidden by the renderer. `repair()` writes `"none"`.

```json
{
  "version": "1",
  "type": "strip",
  "data": [
    { "region": "North", "ms": 42 },
    { "region": "South", "ms": 55 },
    { "region": "East", "ms": 31 }
  ],
  "encoding": { "x": "ms", "y": "region" },
  "a11y": { "alt": "South is slowest at 55 ms." }
}
```

### 3. Vertical, colored

```json
{
  "version": "1",
  "type": "strip",
  "data": [
    { "desk": "A", "minutes": 12, "shift": "Weeknight" },
    { "desk": "A", "minutes": 28, "shift": "Saturday" },
    { "desk": "B", "minutes": 18, "shift": "Weeknight" },
    { "desk": "B", "minutes": 40, "shift": "Saturday" }
  ],
  "encoding": { "x": "desk", "y": "minutes", "color": "shift" },
  "mark": { "orientation": "vertical", "summary": "mean", "band": "iqr" },
  "a11y": { "alt": "Saturday runs longer on both desks." }
}
```

## Where it ships

- Renderer in `@chartkitdev/core/extra`, loaded like boxplot. Not in the line or `/all` bundle.
- Adapters already branch on `isExtra()`. React, Vue, Svelte, Solid, Qwik, Angular, Astro, vanilla, the element, and Cloud SVG/PNG call that same renderer.
- Docs page is `/docs/charts/strip` through the existing chart page, not a new `docs/chart-types` tree.
- `llms.txt` gets one short spec, not the 925-token benchmark. The file is capped at 6,400 bytes (it is 6,376 today), so the rules line that introduces strip has to be paid for by a trim.
- Gallery tile uses the benchmark spec.
- Eval tasks `tokens-by-model-strip` and `latency-by-region-strip` join `bench/agent/tasks.mjs` for the next round. They are not a paid run. The published 42-task scoreboard is a finished round and stays described as 42.

## Left for later

Jitter on `scatter`. A jitter seed. Beeswarm. Point shapes. Drawing the `encoding.label` string on the dot. Per-library brand colors on the homepage (the highlight uses accent and muted, which is a calmer chart than today's rival swatches).
