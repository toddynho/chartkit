# Plugin system

ChartKit: **none**

Register plugins/modules that hook into the lifecycle

Matrix status: `none`. Verification: `dts-absence` (absence).

no plugin API; types load via open()/core/load

No spec snippet. ChartKit does not support this feature.

## Other libraries

| Library | Status | Option | Verification | Source |
|---|---|---|---|---|
| Chart.js | native | Plugin, ~register | dts-path (strong) | chart.js/dist/types/index.d.ts:826, chart.js/dist/types/index.d.ts:513 Chart.register(plugin) |
| Recharts | partial | Customized | dts-path (strong) | recharts/types/component/Customized.d.ts:26 component composition instead of plugins |
| Apache ECharts | native | ~use | dts-grep (weak) | echarts/types/src/label/labelStyle.d.ts:14 echarts.use([...]) modules + registerTransform/registerLayout |
| Highcharts | native | ~addEvent\|wrap | dts-grep (weak) | highcharts/highcharts.src.d.ts:1262 modules + Highcharts.wrap / addEvent |
| Plotly.js | native | ~register | dts-grep (weak) | @types/plotly.js/index.d.ts:544 Plotly.register (internal modules) |
| Nivo | partial | Line.layers | dts-path (strong) | @nivo/line/dist/types/types.d.ts:171 custom layers |
| Victory | partial | VictoryChart | dts-path (strong) | victory-chart/lib/victory-chart.d.ts:3 composition |
| visx | partial | Group | dts-path (strong) | @visx/group/lib/Group.d.ts:15 composition |
| ApexCharts | unknown | — | conflict (unknown) | — no plugin API |
| Tremor (npm) | none | — | dts-absence (absence) | — |
| Observable Plot | native | ~initializer\|transform | dts-grep (weak) | @observablehq/plot/src/scales.d.ts:165 custom transforms/initializers |
| Vega-Lite | none | — | dts-absence (absence) | — compile to Vega for extension |
| AG Charts | native | ~_ModuleSupport\|registerModules | dts-grep (weak) | ag-charts-community/dist/types/src/main.d.ts:7 ModuleRegistry |
| amCharts 5 | native | ~Plugin\|plugins | dts-grep (weak) | @amcharts/amcharts5/.internal/plugins/sliceGrouper/SliceGrouper.d.ts:55 plugins (exporting, json...) |
| Google Charts | none | — | dts-absence (absence) | — |
| uPlot | native | Options.plugins | dts-path (strong) | uplot/dist/uPlot.d.ts:396 |
| TradingView Lightweight Charts | native | ~attachPrimitive\|ISeriesPrimitive | dts-grep (weak) | 2055:	attachPrimitive(primitive primitives/plugins API |
| MUI X Charts | native | ~plugins\|PluginSignature | dts-grep (weak) | @mui/x-charts-pro/index.d.ts:34 |
| Mermaid (chart-ish diagrams only) | native | ~registerExternalDiagrams | dts-grep (weak) | mermaid/dist/mermaid.d.ts:87 external diagram registration |
| AntV G2 | native | ~register | dts-grep (weak) | @antv/g2/lib/exports.d.ts:2 |

Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against 3a59d27e1bde.

https://chartkit.dev/features.json
