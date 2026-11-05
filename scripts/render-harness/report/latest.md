# Chart render sweep

Seed `20261105`. Mode `full`. 29372 cases, 22046 rendered, 62.7s.

ChartKit does not rewrite or shorten labels. An overlap is a layout bug. Spec-set sizes are left as the example wrote them, except when the sweep itself sets `size`.

## Snapshots

Wrote the dHash baseline for this mode. Baselines are 64-bit hashes at raster width 96, not PNGs. A full sweep is about twenty thousand renders. Committing every PNG would add tens of megabytes. The hash catches a changed picture and stays small. Flagged renders are written under scripts/render-harness/out/png, and a few display-sized frames are copied into report/examples.

Compared 22044. Changed 0. Missing baseline 0. Tolerance 8 bits on a 64-bit dHash.

## Timing

Render p50 0.2 ms, p95 2.1 ms, max 1849.1 ms.

## Findings by check

| Check | Count |
| --- | ---: |
| contrast | 1691 |
| text-overlap | 236 |
| text-outside | 171 |
| mark-outside | 35 |
| text-clipped | 8 |

## Findings by chart type

| Type | Count |
| --- | ---: |
| combo | 283 |
| line | 220 |
| bar | 218 |
| heatmap | 205 |
| rose | 140 |
| gauge | 118 |
| treemap | 115 |
| strip | 109 |
| spike | 82 |
| timeline | 77 |
| radar | 68 |
| journey | 63 |
| donut | 57 |
| kpi | 52 |
| stacked-area | 48 |
| pie | 45 |
| sunburst | 43 |
| gantt | 32 |
| streamgraph | 25 |
| waterfall | 22 |
| radial-bar | 19 |
| bar-list | 15 |
| candlestick | 15 |
| boxplot | 13 |
| quadrant | 12 |
| map-points | 8 |
| mini-area | 8 |
| sparkline | 8 |
| tree | 6 |
| density | 4 |
| area-range | 3 |
| sankey | 3 |
| scatter | 3 |
| choropleth | 1 |
| venn | 1 |

## Root-cause groups

A group is one check failing the same way. Counts are findings, not chart types.

### 1. contrast · label (916)

Types: bar, bar-list, combo, donut, gantt, kpi, line, pie, radial-bar, rose, stacked-area, sunburst, timeline, treemap

Options: axes.x.offset, encoding.y.format, encoding.y.format.decimals, encoding.y.format.signed, headline.tone, legend.anchor, legend.position, legend.position×title

- `bar` / `channels-bar` / `mark.labelFormat` = "bytes"
  Label “40 B” is 1.86:1 on #30d158 in dark mode. Minimum is 4.5:1.
- `bar` / `channels-bar` / `mark.labelFormat` = "bytes"
  Label “46 B” is 1.86:1 on #30d158 in dark mode. Minimum is 4.5:1.
- `bar` / `channels-bar` / `mark.labelFormat` = "bytes"
  Label “44 B” is 1.86:1 on #30d158 in dark mode. Minimum is 4.5:1.

![contrast · label](examples/01-contrast-label.png)

### 2. contrast · mark (712)

Types: bar, boxplot, candlestick, choropleth, combo, density, donut, gantt, gauge, heatmap, journey, kpi, line, map-points, mini-area, pie, quadrant, radar, sankey, sparkline, spike, stacked-area, streamgraph, strip, sunburst, timeline, tree, treemap, waterfall

Options: encoding.color, encoding.color.scale.bins, encoding.color.scale.reverse, encoding.color.scale.scheme, encoding.color.scale.type, encoding.color.value, encoding.size, encoding.y.color

- `bar` / `03-bar` / `encoding.color.value` = "#111111"
  Mark #111111 is 1.04:1 on #0c0c0c in dark mode. Minimum for a graphic is 3:1.
- `bar` / `03-bar` / `encoding.color.value` = "#f5f5f7"
  Mark #f5f5f7 is 1.09:1 on #ffffff in light mode. Minimum for a graphic is 3:1.
- `bar` / `03-bar` / `encoding.y.color` = "#111111"
  Mark #111111 is 1.04:1 on #0c0c0c in dark mode. Minimum for a graphic is 3:1.

![contrast · mark](examples/02-contrast-mark.png)

### 3. text-outside · label (141)

Types: combo, gantt, heatmap, journey, line, radar, scatter, spike, streamgraph, strip, tree

Options: axes.x.offset, axes.y, axes.y.offset, axes.y.position, axes.y.titleRotate, axes.y2.titleRotate, encoding.color.scale.type, encoding.x.scale.reverse

- `combo` / `07-combo` / `axes.y2.titleRotate` = -360
  Label “Margin” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `combo` / `07-combo` / `axes.y2.titleRotate` = 0
  Label “Margin” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `combo` / `07-combo` / `axes.y2.titleRotate` = 360
  Label “Margin” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 4. text-overlap · label × label (113)

Types: combo, gauge, line, pie, quadrant, rose, sankey, spike, streamgraph, strip, timeline

Options: axes.x.offset, axes.y.position, axes.y2.position, encoding.x.type, layout.direction, mark.endAngle, mark.summary, size.width

- `combo` / `07-combo` / `axes.y.position` = "right"
  Label “Revenue” overlaps Label “Margin”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `combo` / `07-combo` / `axes.y.position` = "top"
  Label “Revenue” overlaps Label “Margin”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `combo` / `07-combo` / `axes.y2.position` = "bottom"
  Label “Revenue” overlaps Label “Margin”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 5. text-overlap · tick × tick (47)

Types: candlestick, combo, gauge, heatmap, line

Options: axes.y.position, axes.y2.position, encoding.x.type, layout.direction, mark.layout, mark.startAngle, size.width×legend.position

- `candlestick` / `week-candles` / `encoding.x.type` = "quantitative"
  Tick label “2024-06-03T00:00:00Z” overlaps Tick label “2024-06-04T00:00:00Z”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `candlestick` / `week-candles` / `encoding.x.type` = "quantitative"
  Tick label “2024-06-04T00:00:00Z” overlaps Tick label “2024-06-05T00:00:00Z”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `candlestick` / `week-candles` / `encoding.x.type` = "quantitative"
  Tick label “2024-06-05T00:00:00Z” overlaps Tick label “2024-06-06T00:00:00Z”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 6. mark-outside (35)

Types: donut, gantt, journey, strip

Options: mark.offset, mark.pointSize, size.height, size.width, sort.by, sort.order

- `donut` / `budget-pie` / `mark.offset` = 48
  Mark s:Travel is outside the viewBox.
- `gantt` / `launch-gantt` / `size.height` = "240"
  Mark dependency is outside the viewBox.
- `gantt` / `launch-gantt` / `size.height` = "240"
  Mark dependency is outside the viewBox.

### 7. text-overlap · label × tick (31)

Types: combo, line, strip

Options: axes.x.offset, axes.x.position, mark.labelEnds, mark.labelPosition, mark.labels

- `combo` / `07-combo` / `mark.labelPosition` = "bottom"
  Label “20%” overlaps Tick label “Jan”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `line` / `01-minimal-line` / `mark.labelPosition` = "bottom"
  Label “120” overlaps Tick label “Jan”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `line` / `quarterly-units` / `mark.labelPosition` = "bottom"
  Label “40” overlaps Tick label “Q1”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 8. contrast · title (28)

Types: gauge, kpi, rose, treemap

Options: metric.delta, theme, theme.tokens.fontSize, theme.tokens.positive

- `gauge` / `09-gauge` / `theme` = "latte"
  Title “72” is 2.96:1 on #eff1f5 in light mode. Minimum is 3:1.
- `gauge` / `09-gauge` / `theme` = "sunset"
  Title “72” is 2.54:1 on #ffffff in light mode. Minimum is 3:1.
- `gauge` / `capacity-gauge` / `theme` = "latte"
  Title “72” is 2.96:1 on #eff1f5 in light mode. Minimum is 3:1.

### 9. text-outside · tick (24)

Types: bar, candlestick, heatmap, spike, tree

Options: axes.x.position, encoding.x.type, mark.layout, mark.orient, mark.orientation

- `bar` / `signups-bar` / `mark.orientation` = "horizontal"
  Tick label “15.000” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `candlestick` / `week-candles` / `encoding.x.type` = "quantitative"
  Tick label “2024-06-07T00:00:00Z” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `heatmap` / `activity-calendar` / `mark.layout` = "grid"
  Tick label “2026-03-29” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 10. contrast · legend (20)

Types: combo, line, treemap

Options: legend.anchor, legend.position, legend.position×title, mark.pointSize, mark.stack

- `combo` / `orders-combo` / `mark.stack` = "percent"
  Legend item “Orders” is 3.35:1 on #0a84ff in dark mode. Minimum is 4.5:1.
- `combo` / `orders-combo` / `mark.stack` = "percent"
  Legend item “Fill rate” is 3.35:1 on #0a84ff in dark mode. Minimum is 4.5:1.
- `combo` / `orders-combo` / `mark.stack` = "percent"
  Legend item “Orders” is 4.19:1 on #007aff in light mode. Minimum is 4.5:1.

### 11. text-overlap · legend × legend (19)

Types: pie, treemap

Options: legend.anchor, legend.position, legend.position×title

- `pie` / `29-pie` / `legend.position` = "inside"
  Legend item “8%” overlaps Legend item “Direct”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `pie` / `29-pie` / `legend.position` = "inside"
  Legend item “8%” overlaps Legend item “Search”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `pie` / `29-pie` / `legend.position×title` = {"legend.position":"inside","title":""}
  Legend item “4%” overlaps Legend item “Search”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 12. contrast · tick (15)

Types: bar, gantt, line, sunburst

Options: legend.position×title, mark.labelPosition, title

- `bar` / `regions-bar` / `mark.labelPosition` = "center"
  Tick label “82” is 1.16:1 on #0c0c0c in dark mode. Minimum is 4.5:1.
- `bar` / `regions-bar` / `mark.labelPosition` = "inside"
  Tick label “82” is 1.16:1 on #0c0c0c in dark mode. Minimum is 4.5:1.
- `gantt` / `launch-gantt` / ``
  Tick label “Today” is 1.00:1 on #ffffff in light mode. Minimum is 4.5:1.

### 13. text-overlap · label × legend (15)

Types: area-range, pie, radar, radial-bar, strip, treemap

Options: legend.anchor, legend.position, legend.position×title, size.width, size.width×legend.position

- `area-range` / `30-area-range` / `size.width` = "240"
  Legend item “Forecast” overlaps Label “today”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `area-range` / `30-area-range` / `size.width×legend.position` = {"size.width":"240","legend.position":"right","size.height":"160"}
  Legend item “Forecast” overlaps Label “today”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `area-range` / `30-area-range` / `size.width×legend.position` = {"size.width":"240","legend.position":"top","size.height":"160"}
  Legend item “Forecast” overlaps Label “today”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

![text-overlap · label × legend](examples/03-text-overlap-label-legend.png)

### 14. text-clipped · tick (8)

Types: waterfall

Options: axes.x.offset, encoding.y.scale.padding.min, size.width×legend.position

- `waterfall` / `23-waterfall` / `size.width×legend.position` = {"size.width":"240","legend.position":"right","size.height":"160"}
  Tick label “22” is clipped by the plot. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `waterfall` / `23-waterfall` / `size.width×legend.position` = {"size.width":"240","legend.position":"right","size.height":"160"}
  Tick label “-30” is clipped by the plot. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `waterfall` / `23-waterfall` / `size.width×legend.position` = {"size.width":"240","legend.position":"top","size.height":"160"}
  Tick label “22” is clipped by the plot. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 15. text-outside · title (6)

Types: bar, line, strip, venn

Options: size.width, size.width×legend.position

- `bar` / `signups-plan-region` / `size.width` = "240"
  Title “Signups by plan and region” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `line` / `throughput-latency` / `size.width` = "240"
  Title “API throughput vs latency” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `strip` / `36-strip` / `size.width` = "240"
  Title “Output tokens per working chart” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 16. text-overlap · label × title (4)

Types: pie, radial-bar

Options: size.width×legend.position

- `pie` / `29-pie` / `size.width×legend.position` = {"size.width":"240","legend.position":"top","size.height":"160"}
  Title “Share of revenue” overlaps Label “28%”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `radial-bar` / `lumen-radial-bar` / `size.width×legend.position` = {"size.width":"240","legend.position":"right","size.height":"160"}
  Title “Lumen, minutes by desk” overlaps Label “Ident”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `radial-bar` / `lumen-radial-bar` / `size.width×legend.position` = {"size.width":"240","legend.position":"top","size.height":"160"}
  Title “Lumen, minutes by desk” overlaps Label “Ident”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 17. text-overlap · tick × title (4)

Types: radar, tree

Options: mark.orient, size.width×legend.position

- `radar` / `18-radar` / `size.width×legend.position` = {"size.width":"240","legend.position":"right","size.height":"160"}
  Title “Model comparison” overlaps Tick label “Speed”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `radar` / `18-radar` / `size.width×legend.position` = {"size.width":"240","legend.position":"top","size.height":"160"}
  Title “Model comparison” overlaps Tick label “Speed”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `tree` / `45-tree` / `mark.orient` = "BT"
  Title “One hierarchy” overlaps Tick label “A1”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 18. text-overlap · legend × title (3)

Types: donut, radial-bar

Options: legend.anchor, size.width×legend.position

- `donut` / `04-donut` / `legend.anchor` = "center"
  Title “100” overlaps Legend item “Social”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `donut` / `04-donut` / `legend.anchor` = "center"
  Title “100” overlaps Legend item “Direct”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `radial-bar` / `lumen-radial-bar` / `size.width×legend.position` = {"size.width":"240","legend.position":"right","size.height":"160"}
  Title “Lumen, minutes by desk” overlaps Legend item “Music”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

## Recorded, not failed

Not yet supported: 599 options. Needs data: 2478. Unsampled (JSON, or the type field): 95.

An option the playground marks “Not yet supported” is listed and not rendered. A needs-data option is the same: the example cannot exercise it, so a failure there would be the fixture, not the chart.

## Vision

Vision review is a stub. Call reviewFlagged(findings, reviewer) with a reviewer that implements review({ findings, images }). This sweep does not call a model.

Flagged images: 8.
