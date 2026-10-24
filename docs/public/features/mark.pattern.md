# Pattern / hatch fills

ChartKit: **none**

Texture fills for accessibility or print

Matrix status: `none`. Verification: `source-review` (strong).

probe hit reviewed: match is JSON-Schema "pattern" keyword on id

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | plugin | — | npm (weak) | — |
| Recharts | unknown | ~defs | unverified (unknown) | — manual SVG patterns |
| Apache ECharts | native | aria.decal | dts-path (strong) | echarts/types/dist/shared.d.ts:8472 decal patterns |
| Highcharts | plugin | ~patternFill | dts-grep (weak) | highcharts/modules/pictorial.src.d.ts:26 pattern-fill module |
| Plotly.js | native | trace.marker.pattern | dts-path (strong) | plot-schema.json#traces.{bar,barpolar,funnelarea,histogram,icicle,pie,…}.attributes.marker.pattern |
| Nivo | native | Bar.defs, Bar.fill | dts-path (strong) | @nivo/core/index.d.ts:71, @nivo/core/index.d.ts:75 patternDotsDef / patternLinesDef helpers |
| Victory | manual | VictoryBarProps.dataComponent | dts-mechanism (weak) | victory-core/lib/victory-util/common-props.d.ts:9 |
| visx | native | PatternLines, PatternCircles | dts-path (strong) | @visx/pattern/lib/patterns/Lines.d.ts:30, @visx/pattern/lib/patterns/Circles.d.ts:25 |
| ApexCharts | native | fill.pattern | dts-path (strong) | apexcharts/types/apexcharts.d.ts:4579 |
| Tremor (npm) | unknown | — | conflict (unknown) | — |
| Observable Plot | manual | ~render | dts-mechanism (weak) | @observablehq/plot/src/scales.d.ts:166 |
| Vega-Lite | none | — | dts-absence (absence) | — |
| AG Charts | native | ~pattern | dts-grep (weak) | ag-charts-community/dist/types/src/module-support.d.ts:61 fill pattern options (v11+) |
| amCharts 5 | native | ~LinePattern\|Pattern | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/json/Classes.d.ts:51 |
| Google Charts | unknown | — | conflict (unknown) | — |
| uPlot | none | — | dts-absence (absence) | — |
| TradingView Lightweight Charts | none | — | dts-absence (absence) | — |
| MUI X Charts | manual | ChartsContainer | dts-mechanism (weak) | @mui/x-charts/ChartsContainer/ChartsContainer.d.mts:34 |
| Mermaid (chart-ish diagrams only) | unknown | — | conflict (unknown) | — |
| AntV G2 | unknown | ~pattern | unverified (unknown) | — |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 92347dd72bcd.

https://chartkit.dev/features.json
