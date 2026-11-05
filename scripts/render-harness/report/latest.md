# Chart render sweep

Seed `20261105`. Mode `full`. 29372 cases, 22046 rendered, 77.5s.

ChartKit does not rewrite or shorten labels. An overlap is a layout bug. Spec-set sizes are left as the example wrote them, except when the sweep itself sets `size`.

## Snapshots

Wrote the dHash baseline for this mode. Baselines are 64-bit hashes at raster width 96, not PNGs. A full sweep is about twenty thousand renders. Committing every PNG would add tens of megabytes. The hash catches a changed picture and stays small. Flagged renders are written under scripts/render-harness/out/png, and a few display-sized frames are copied into report/examples.

Compared 22044. Changed 0. Missing baseline 0. Tolerance 8 bits on a 64-bit dHash.

## Timing

Render p50 0.2 ms, p95 2.0 ms, max 1809.2 ms.

## Findings by check

| Check | Count |
| --- | ---: |
| contrast | 2006 |
| text-outside | 763 |
| text-overlap | 562 |
| mark-outside | 35 |
| text-clipped | 12 |

## Findings by chart type

| Type | Count |
| --- | ---: |
| bar | 372 |
| combo | 345 |
| treemap | 214 |
| heatmap | 205 |
| line | 168 |
| pie | 157 |
| radar | 151 |
| rose | 140 |
| strip | 134 |
| donut | 120 |
| gauge | 118 |
| candlestick | 112 |
| funnel | 109 |
| spike | 82 |
| sunburst | 82 |
| timeline | 77 |
| waterfall | 68 |
| journey | 67 |
| stacked-area | 62 |
| area-range | 61 |
| radial-bar | 58 |
| kpi | 52 |
| map-points | 51 |
| boxplot | 49 |
| bar-range | 44 |
| histogram | 44 |
| streamgraph | 39 |
| gantt | 32 |
| errorbar | 31 |
| sankey | 20 |
| choropleth | 19 |
| tree | 16 |
| bar-list | 15 |
| scatter | 15 |
| quadrant | 12 |
| mini-area | 8 |
| sparkline | 8 |
| venn | 8 |
| density | 7 |
| bullet | 4 |
| progress-ring | 2 |

## Root-cause groups

A group is one check failing the same way. Counts are findings, not chart types.

### 1. contrast · mark (950)

Types: area-range, bar, bar-range, boxplot, bullet, candlestick, choropleth, combo, density, donut, errorbar, funnel, gantt, gauge, heatmap, histogram, journey, kpi, line, map-points, mini-area, pie, progress-ring, quadrant, radar, sankey, scatter, sparkline, spike, stacked-area, streamgraph, strip, sunburst, timeline, tree, treemap, waterfall

Options: encoding.color, encoding.color.scale.bins, encoding.color.scale.reverse, encoding.color.scale.scheme, encoding.color.scale.type, encoding.color.value, encoding.size, encoding.y.color

- `area-range` / `30-area-range` / `theme` = "latte"
  Line #40a02b is 2.96:1 on #eff1f5 in light mode. Minimum for a graphic is 3:1.
- `area-range` / `revenue-forecast` / `theme` = "latte"
  Line #40a02b is 2.96:1 on #eff1f5 in light mode. Minimum for a graphic is 3:1.
- `bar` / `03-bar` / `encoding.color.value` = "#111111"
  Mark #111111 is 1.04:1 on #0c0c0c in dark mode. Minimum for a graphic is 3:1.

![contrast · mark](examples/01-contrast-mark.png)

### 2. contrast · label (937)

Types: area-range, bar, bar-list, bar-range, candlestick, combo, donut, gantt, histogram, kpi, line, pie, radial-bar, rose, strip, sunburst, timeline, waterfall

Options: axes.x.offset, axes.y.offset, encoding.y.format, encoding.y.format.decimals, encoding.y.format.signed, headline.tone, legend.anchor, legend.position

- `area-range` / `30-area-range` / ``
  Label “today” is 4.02:1 on #ffffff in light mode. Minimum is 4.5:1.
- `area-range` / `30-area-range` / `theme` = "violet"
  Label “today” is 3.05:1 on #1b1827 in dark mode. Minimum is 4.5:1.
- `area-range` / `revenue-forecast` / ``
  Label “today” is 4.02:1 on #ffffff in light mode. Minimum is 4.5:1.

![contrast · label](examples/02-contrast-label.png)

### 3. text-outside · label (454)

Types: area-range, bar, bar-range, boxplot, candlestick, choropleth, combo, errorbar, gantt, heatmap, histogram, journey, line, map-points, radar, scatter, spike, stacked-area, streamgraph, strip, sunburst, tree, venn, waterfall

Options: axes.x.offset, axes.y, axes.y.offset, axes.y.position, axes.y.titleRotate, axes.y2.titleRotate, encoding.color.scale.type, encoding.x.scale.reverse

- `area-range` / `30-area-range` / `axes.x.offset` = 80
  Label “Jan” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `area-range` / `30-area-range` / `axes.x.offset` = 80
  Label “Feb” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `area-range` / `30-area-range` / `axes.x.offset` = 80
  Label “Mar” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

![text-outside · label](examples/03-text-outside-label.png)

### 4. text-overlap · legend × title (218)

Types: donut, pie, radar, radial-bar, treemap

Options: legend.align, legend.anchor, legend.maxRows, legend.orient, legend.position, legend.position×title, legend.symbol

- `donut` / `04-donut` / `legend.anchor` = "center"
  Title “100” overlaps Legend item “Social”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `donut` / `04-donut` / `legend.anchor` = "center"
  Title “100” overlaps Legend item “Direct”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `pie` / `29-pie` / `legend.align` = "center"
  Title “Share of revenue” overlaps Legend item “Search”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 5. text-overlap · label × label (217)

Types: area-range, candlestick, choropleth, combo, gauge, line, map-points, pie, quadrant, rose, sankey, spike, streamgraph, strip, sunburst, timeline, venn

Options: axes.x.offset, axes.x.position, axes.y.position, axes.y2.position, encoding.color, encoding.size, encoding.x.type, layout.direction

- `area-range` / `30-area-range` / `axes.x.position` = "left"
  Label “Apr” overlaps Label “today”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `area-range` / `30-area-range` / `axes.x.position` = "top"
  Label “Apr” overlaps Label “today”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `area-range` / `30-area-range` / `axes.y.position` = "right"
  Label “500” overlaps Label “Forecast”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

![text-overlap · label × label](examples/04-text-overlap-label-label.png)

### 6. text-outside · tick (187)

Types: bar, candlestick, combo, heatmap, line, spike, stacked-area, tree

Options: axes.x.offset, axes.x.position, axes.y.offset, axes.y2.offset, mark.layout, mark.orient, mark.orientation

- `bar` / `03-bar` / `axes.x.offset` = 80
  Tick label “Jan” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `bar` / `03-bar` / `axes.x.offset` = 80
  Tick label “Feb” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `bar` / `03-bar` / `axes.x.offset` = 80
  Tick label “Mar” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 7. text-outside · legend (116)

Types: donut, pie, radar, radial-bar, strip, treemap

Options: legend.anchor, legend.position, legend.position×title, size.width×legend.position

- `donut` / `04-donut` / `legend.anchor` = "right"
  Legend item “Search” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `donut` / `04-donut` / `legend.anchor` = "right"
  Legend item “Direct” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `donut` / `04-donut` / `legend.anchor` = "right"
  Legend item “Social” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 8. contrast · legend (90)

Types: bar, combo, donut, pie, treemap

Options: legend.anchor, legend.position, legend.position×title, mark.stack

- `bar` / `channels-bar` / `legend.position` = "inside"
  Legend item “Direct” is 1.89:1 on #ff9f0a in dark mode. Minimum is 4.5:1.
- `bar` / `channels-bar` / `legend.position` = "inside"
  Legend item “Social” is 1.89:1 on #ff9f0a in dark mode. Minimum is 4.5:1.
- `bar` / `signups-plan-region` / `legend.anchor` = "center"
  Legend item “Free” is 1.86:1 on #30d158 in dark mode. Minimum is 4.5:1.

![contrast · legend](examples/05-contrast-legend.png)

### 9. text-overlap · tick × tick (43)

Types: combo, gauge, heatmap, line

Options: axes.y.position, axes.y2.position, layout.direction, mark.layout, mark.startAngle, size.width×legend.position

- `combo` / `07-combo` / `axes.y.position` = "right"
  Tick label “100” overlaps Tick label “23%”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `combo` / `07-combo` / `axes.y.position` = "right"
  Tick label “0” overlaps Tick label “20%”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `combo` / `07-combo` / `axes.y.position` = "top"
  Tick label “100” overlaps Tick label “23%”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 10. mark-outside (35)

Types: donut, gantt, journey, strip

Options: mark.offset, mark.pointSize, size.height, size.width, sort.by, sort.order

- `donut` / `budget-pie` / `mark.offset` = 48
  Mark s:Travel is outside the viewBox.
- `gantt` / `launch-gantt` / `size.height` = "240"
  Mark dependency is outside the viewBox.
- `gantt` / `launch-gantt` / `size.height` = "240"
  Mark dependency is outside the viewBox.

### 11. text-overlap · label × tick (34)

Types: combo, line, strip

Options: axes.x.offset, axes.x.position, axes.y.titleRotate, mark.labelEnds, mark.labelPosition, mark.labels

- `combo` / `07-combo` / `mark.labelPosition` = "bottom"
  Label “20%” overlaps Tick label “Jan”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `line` / `01-minimal-line` / `mark.labelPosition` = "bottom"
  Label “120” overlaps Tick label “Jan”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `line` / `quarterly-units` / `mark.labelPosition` = "bottom"
  Label “40” overlaps Tick label “Q1”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 12. contrast · title (28)

Types: gauge, kpi, rose, treemap

Options: metric.delta, theme, theme.tokens.fontSize, theme.tokens.positive

- `gauge` / `09-gauge` / `theme` = "latte"
  Title “72” is 2.96:1 on #eff1f5 in light mode. Minimum is 3:1.
- `gauge` / `09-gauge` / `theme` = "sunset"
  Title “72” is 2.54:1 on #ffffff in light mode. Minimum is 3:1.
- `gauge` / `capacity-gauge` / `theme` = "latte"
  Title “72” is 2.96:1 on #eff1f5 in light mode. Minimum is 3:1.

### 13. text-overlap · legend × legend (25)

Types: donut, pie, streamgraph, treemap

Options: legend.anchor, legend.maxRows, legend.position, legend.position×title

- `donut` / `04-donut` / `legend.maxRows` = 1
  Legend item “Search” overlaps Legend item “Email”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `pie` / `29-pie` / `legend.maxRows` = 1
  Legend item “Search” overlaps Legend item “Social”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `pie` / `29-pie` / `legend.maxRows` = 1
  Legend item “Search” overlaps Legend item “Other ads”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 14. text-overlap · label × legend (16)

Types: area-range, pie, radar, radial-bar, strip, treemap

Options: axes.x.position, legend.anchor, legend.position, legend.position×title, size.width, size.width×legend.position

- `area-range` / `30-area-range` / `axes.x.position` = "left"
  Label “Jan” overlaps Legend item “lo–hi”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `area-range` / `30-area-range` / `axes.x.position` = "top"
  Label “Jan” overlaps Legend item “lo–hi”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `area-range` / `30-area-range` / `size.width` = "240"
  Legend item “Forecast” overlaps Label “today”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

![text-overlap · label × legend](examples/06-text-overlap-label-legend.png)

### 15. text-clipped · label (6)

Types: map-points

Options: size.width, size.width×legend.position

- `map-points` / `city-points` / `size.width` = ""
  Label “Shanghai” is clipped by the plot. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `map-points` / `city-points` / `size.width` = "240"
  Label “Cairo” is clipped by the plot. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `map-points` / `city-points` / `size.width` = "240"
  Label “Lagos” is clipped by the plot. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 16. text-clipped · tick (6)

Types: waterfall

Options: encoding.y.scale.padding.min, size.width×legend.position

- `waterfall` / `23-waterfall` / `size.width×legend.position` = {"size.width":"240","legend.position":"right","size.height":"160"}
  Tick label “22” is clipped by the plot. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `waterfall` / `23-waterfall` / `size.width×legend.position` = {"size.width":"240","legend.position":"right","size.height":"160"}
  Tick label “-30” is clipped by the plot. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `waterfall` / `23-waterfall` / `size.width×legend.position` = {"size.width":"240","legend.position":"top","size.height":"160"}
  Tick label “22” is clipped by the plot. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 17. text-outside · title (6)

Types: bar, line, strip, venn

Options: size.width, size.width×legend.position

- `bar` / `signups-plan-region` / `size.width` = "240"
  Title “Signups by plan and region” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `line` / `throughput-latency` / `size.width` = "240"
  Title “API throughput vs latency” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `strip` / `36-strip` / `size.width` = "240"
  Title “Output tokens per working chart” extends outside the viewBox. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 18. text-overlap · label × title (5)

Types: pie, radial-bar

Options: size.width×legend.position

- `pie` / `29-pie` / `size.width×legend.position` = {"size.width":"240","legend.position":"top","size.height":"160"}
  Title “Share of revenue” overlaps Label “28%”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `radial-bar` / `lumen-radial-bar` / `size.width×legend.position` = {"size.width":"240","legend.position":"right","size.height":"160"}
  Title “Lumen, minutes by desk” overlaps Label “Ident”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `radial-bar` / `lumen-radial-bar` / `size.width×legend.position` = {"size.width":"240","legend.position":"right","size.height":"160"}
  Title “Lumen, minutes by desk” overlaps Label “Music”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 19. text-overlap · tick × title (4)

Types: radar, tree

Options: mark.orient, size.width×legend.position

- `radar` / `18-radar` / `size.width×legend.position` = {"size.width":"240","legend.position":"right","size.height":"160"}
  Title “Model comparison” overlaps Tick label “Speed”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `radar` / `18-radar` / `size.width×legend.position` = {"size.width":"240","legend.position":"top","size.height":"160"}
  Title “Model comparison” overlaps Tick label “Speed”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.
- `tree` / `45-tree` / `mark.orient` = "BT"
  Title “One hierarchy” overlaps Tick label “A1”. ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.

### 20. contrast · tick (1)

Types: gantt


- `gantt` / `launch-gantt` / ``
  Tick label “Today” is 1.00:1 on #ffffff in light mode. Minimum is 4.5:1.

## Recorded, not failed

Not yet supported: 599 options. Needs data: 2478. Unsampled (JSON, or the type field): 95.

An option the playground marks “Not yet supported” is listed and not rendered. A needs-data option is the same: the example cannot exercise it, so a failure there would be the fixture, not the chart.

## Vision

Vision review is a stub. Call reviewFlagged(findings, reviewer) with a reviewer that implements review({ findings, images }). This sweep does not call a model.

Flagged images: 12.
