> ChartKit cells in `matrix.json` were rechecked on 2026-10-19 against main 116d0af (PR #17). This grid is the 2026-10-18 export; where they differ, `matrix.json` and `chartkit-recheck.md` win. The Min line gzip and Full entry gzip columns are that same extract, including ChartKit before PR #17. Current bundle figures are `libraries[].bundleGzip` in the published features.json, written from `docs/data/measured-sizes.json`. Do not copy the table below onto the site.

# Charting library feature matrix

Checked 2026-10-18. 263 features in 23 categories × 21 libraries = 5523 cells. Machine-readable: `matrix.json` / `matrix.csv` (with per-cell option paths and d.ts file:line sources).

Legend: ● native · ◐ partial · ⊕ plugin · ✎ manual (escape hatch only) · \· none · ? unknown/unverified. Suffix ᴱ = AG Enterprise, ᴾ = MUI Pro/Premium (paid).

Coverage: 34.1% strong (type-checked path / schema / runtime probe / licence file), 31.3% weak (identifier grep, plugin on npm, escape-hatch only), 26.6% absence-verified "none", 8.0% unknown. ChartKit `axis.title.position`, `axis.ticks.autoskip`, `axis.ticks.wrap`, `axis.ticks.marks`, and `axis.line` were rechecked native on 2026-10-19, along with the marks and labels cells.

## Libraries

| Code | Library | Version | Licence | npm weekly (2026-10-10..2026-10-16) | GitHub ★ | Min line gzip | Full entry gzip | Escape hatch |
|---|---|---|---|---|---|---|---|---|
| CK | ChartKit | 0.5.0 (main 1b9b869) | MIT | — (`@chartkitdev/core`) | 7 | 16.5 KB | 56.5 KB | none (no plugin/custom-mark API; only lifecycle hooks) |
| CJ | Chart.js | 4.5.1 | MIT | 7.17M (`chart.js`) | 67,746 | 49.2 KB | 70.2 KB | Plugin.afterDatasetsDraw (canvas plugin hooks) |
| RC | Recharts | 3.10.1 | MIT | 34.13M (`recharts`) | 27,638 | 95.2 KB | 161.1 KB | <Customized> / arbitrary SVG children |
| EC | Apache ECharts | 6.1.0 | Apache-2.0 | 3.73M (`echarts`) | 67,539 | 171.3 KB | 382.5 KB | series.type = "custom" (renderItem) |
| HC | Highcharts | 13.1.1 | Commercial (free for non-commercial) | 1.33M (`highcharts`) | 12,494 | 104.6 KB | — | SVGRenderer / chart.renderer |
| PL | Plotly.js | 4.1.2 | MIT | 430k (`plotly.js`) | 18,362 | 1467.1 KB | — | layout.shapes / layout.images (no custom trace API) |
| NV | Nivo | 0.99.0 | MIT | 875k (`@nivo/core`) | 14,118 | 106.1 KB | 127.4 KB | layers (custom SVG layer functions) |
| VI | Victory | 37.3.6 | MIT | 236k (`victory`) | 11,240 | 81.1 KB | 130.2 KB | dataComponent / custom React components |
| VX | visx | 4.0.0 | MIT | 4.03M (`@visx/shape`) | 21,080 | 23.0 KB | 171.4 KB | low-level primitives; any SVG in <Group> |
| AP | ApexCharts | 8.3.1 | Dual: Community (free under $2M revenue) / Commercial | 1.15M (`apexcharts`) | 15,179 | 278.9 KB | — | none found in types |
| TR | Tremor (npm) | 3.18.7 | Apache-2.0 | 291k (`@tremor/react`) | 16,473 | 240.4 KB | 241.1 KB | none (Recharts underneath, not exposed) |
| OP | Observable Plot | 0.6.17 | ISC | 577k (`@observablehq/plot`) | 5,406 | 87.5 KB | 133.1 KB | render transform / custom mark functions |
| VL | Vega-Lite | 6.4.3 | BSD-3-Clause | 806k (`vega-lite`) | 5,524 | 272.4 KB | 278.2 KB | layer composition; drop to Vega |
| AG | AG Charts | 14.2.0 (ent 14.2.0) | MIT (community) + Commercial (enterprise) | 1.06M (`ag-charts-community`) | 485 | 405.8 KB | 692.7 KB | none found in types (formatters/itemStyler only) |
| AM | amCharts 5 | 5.21.2 | Linkware (free with branding) / Commercial | 188k (`@amcharts/amcharts5`) | 448 | 157.8 KB | 164.6 KB | Graphics / Container sprites |
| GC | Google Charts | 0.0.75 | Proprietary hosted service (not verified from package) | 89k (`react-google-charts`) | — | — | — | none found in types |
| UP | uPlot | 1.6.32 | MIT | 401k (`uplot`) | 10,568 | 23.0 KB | — | Options.hooks (draw on canvas) |
| LW | TradingView Lightweight Charts | 5.2.1 | Apache-2.0 + attribution requirement | 774k (`lightweight-charts`) | 17,614 | 53.7 KB | 62.9 KB | custom series (ICustomSeriesPaneView), primitives |
| MU | MUI X Charts | 9.15.0 | MIT (community) + Commercial (Pro, Premium) | 600k (`@mui/x-charts`) | 5,862 | 96.9 KB | 132.9 KB | ChartsContainer composition with custom SVG children |
| MM | Mermaid (chart-ish diagrams only) | 11.17.2 | MIT | 11.23M (`mermaid`) | 90,738 | 947.9 KB | — | none for charts |
| G2 | AntV G2 | 5.4.8 | MIT | 187k (`@antv/g2`) | 12,637 | 405.3 KB | 406.4 KB | register() custom marks/shapes/transforms |

Bundle method: esbuild 0.x bundle, minify, format esm, platform browser, NODE_ENV=production, externals: react, react-dom, @emotion/*, @mui/material, @mui/system, react-is; gzip level 9 via node zlib. min = smallest documented line-chart entry; full = whole public entry (see entries.json). Google Charts is loaded from Google's CDN and cannot be measured this way. Mermaid's number includes diagram code that its CDN build loads lazily, so it is an upper bound.

Not scored: D3 (13.96M/wk), Unovis (152k/wk), react-google-charts (wrapper) (89k/wk), C3.js (83k/wk), Chartist (67k/wk), NVD3 (61k/wk), Frappe Charts (58k/wk), Carbon Charts (48k/wk), billboard.js (32k/wk), react-chartjs-2 (Chart.js wrapper) (2.52M/wk), echarts-for-react (wrapper) (887k/wk), react-apexcharts (wrapper) (573k/wk), highcharts-react-official (wrapper) (540k/wk), victory-native (React Native) (265k/wk), Vega (runtime under Vega-Lite) (832k/wk).

## Chart types (`type`)

Every chart type and major variant. Status native = a first-class type/series/mark/component exists.

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Line chart** <br><sub>`type.line` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| **Step line** <br><sub>`type.line.step`</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ? | ● | ● | ● | ? | ● |
| **Smoothed / spline line** <br><sub>`type.line.smooth`</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ? | ● |
| **Area chart** <br><sub>`type.area` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ? | ● |
| **Stacked area** <br><sub>`type.area.stacked` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ✎ | ✎ | ● | ? | ● |
| **100% stacked area** <br><sub>`type.area.percent`</sub> | ● | ✎ | ● | ✎ | ● | ● | ✎ | ✎ | ● | ● | ● | ● | ● | ● | ● | ● | ✎ | ✎ | ● | ? | ● |
| **Range / band area** <br><sub>`type.area.range` ★</sub> | · | ✎ | ◐ | ✎ | ● | ◐ | ✎ | ● | ● | ● | · | ● | ● | ● | ● | ◐ | ◐ | ✎ | ✎ | · | ● |
| **Streamgraph** <br><sub>`type.area.stream`</sub> | · | ✎ | ● | ● | ● | ✎ | ● | ✎ | ● | ● | · | ● | ● | ? | ✎ | · | · | · | ● | · | ● |
| **Column / vertical bar** <br><sub>`type.bar.vertical` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| **Horizontal bar** <br><sub>`type.bar.horizontal` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ◐ | ? | ● | ● | ● |
| **Grouped bar** <br><sub>`type.bar.grouped` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ◐ | · | ● | ◐ | ● |
| **Stacked bar** <br><sub>`type.bar.stacked` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ✎ | · | ● | ? | ● |
| **100% stacked bar** <br><sub>`type.bar.percent` ★</sub> | ● | ✎ | ● | ✎ | ● | ● | ✎ | ✎ | ● | ● | ● | ● | ● | ● | ● | ● | ✎ | ? | ● | ? | ● |
| **Range / floating bar** <br><sub>`type.bar.range`</sub> | · | ◐ | ◐ | ✎ | ● | ● | ✎ | ● | ● | ● | · | ● | ● | ● | ● | ◐ | ✎ | · | ✎ | · | ● |
| **Waterfall** <br><sub>`type.bar.waterfall`</sub> | ● | ✎ | ✎ | ✎ | ● | ● | ✎ | ✎ | ✎ | ● | · | ✎ | ✎ | ● | ✎ | ◐ | ✎ | · | ✎ | · | ✎ |
| **Combined bar + line** <br><sub>`type.combo` ★</sub> | ● | ● | ● | ● | ● | ● | ◐ | ● | ● | ● | · | ● | ● | ● | ● | ● | ◐ | ◐ | ● | ● | ● |
| **Scatter plot** <br><sub>`type.scatter` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ◐ | · | ● | ● | ● |
| **Bubble chart** <br><sub>`type.bubble` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ✎ | · | ● | · | ● |
| **Dumbbell** <br><sub>`type.dumbbell`</sub> | · | ✎ | ✎ | ✎ | ● | ✎ | ✎ | ✎ | ✎ | ● | · | ● | ✎ | ? | ✎ | · | · | · | ✎ | · | ✎ |
| **Lollipop** <br><sub>`type.lollipop`</sub> | · | ✎ | ✎ | ✎ | ● | ✎ | ✎ | ✎ | ✎ | ? | · | ● | ✎ | ? | ✎ | · | · | · | ✎ | ? | ✎ |
| **Pictorial bar** <br><sub>`type.pictorial`</sub> | · | · | ◐ | ● | ● | · | ✎ | ✎ | ✎ | · | · | ✎ | ✎ | · | ● | · | · | · | ✎ | · | ✎ |
| **Bump chart** <br><sub>`type.bump`</sub> | · | ✎ | ✎ | ✎ | ✎ | ✎ | ● | ✎ | ✎ | · | · | ✎ | ✎ | ? | ✎ | · | · | · | ● | ? | ✎ |
| **Slope chart** <br><sub>`type.slope`</sub> | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | · | ◐ | ? | ◐ |
| **Marimekko / variable-width bar** <br><sub>`type.marimekko`</sub> | · | · | · | ✎ | ● | ◐ | ● | ✎ | ✎ | · | · | ✎ | ✎ | ? | ✎ | · | · | · | · | · | ✎ |
| **Pie chart** <br><sub>`type.pie` ★</sub> | ◐ | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ✎ | ● | ● | ● | ● | · | · | ● | ● | ● |
| **Donut chart** <br><sub>`type.donut` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ✎ | ● | ● | ● | ● | · | · | ● | ? | ● |
| **Semi-circle / partial arc pie** <br><sub>`type.pie.semi`</sub> | ● | ● | ● | ● | ● | ◐ | ● | ● | ● | ● | · | · | ● | ● | ● | ● | ? | · | ● | ? | ● |
| **Radial bar** <br><sub>`type.polar.radialbar`</sub> | ◐ | · | ● | ● | ● | ● | ● | ◐ | ✎ | ● | ◐ | ✎ | ◐ | ● | ● | · | · | · | ●ᴾ | · | ● |
| **Polar area / rose / nightingale** <br><sub>`type.polar.area`</sub> | · | ● | ◐ | ● | ● | ● | ● | ◐ | ✎ | ● | · | ✎ | ● | ● | ● | · | · | · | ✎ | · | ● |
| **Radar / spider chart** <br><sub>`type.radar` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ✎ | ● | · | ✎ | ✎ | ● | ● | · | · | · | ● | ● | ● |
| **Gauge / dial** <br><sub>`type.gauge` ★</sub> | ● | ✎ | ✎ | ● | ● | ● | ✎ | ✎ | ✎ | ◐ | ◐ | · | ✎ | ● | ● | ● | · | · | ● | · | ● |
| **Linear gauge / progress bar** <br><sub>`type.gauge.linear`</sub> | ◐ | · | · | ✎ | ◐ | ◐ | ◐ | · | ✎ | ? | ● | ✎ | ✎ | ●ᴱ | ✎ | ? | · | · | ✎ | · | ✎ |
| **KPI / big number card** <br><sub>`type.kpi` ★</sub> | ● | · | · | ✎ | ? | ● | · | · | · | · | ● | · | ✎ | · | ? | · | · | · | · | · | ✎ |
| **Sparkline** <br><sub>`type.sparkline` ★</sub> | ● | ✎ | ✎ | ✎ | ✎ | ✎ | ✎ | ✎ | ✎ | ● | ● | ✎ | ✎ | ● | ✎ | · | ✎ | ✎ | ● | · | ✎ |
| **Bullet chart** <br><sub>`type.bullet`</sub> | ● | · | · | ✎ | ● | ● | ● | · | ✎ | ◐ | ◐ | ✎ | ✎ | ◐ | ✎ | · | · | · | ✎ | · | ✎ |
| **Progress ring** <br><sub>`type.progress.ring`</sub> | ● | ✎ | ◐ | ✎ | ◐ | ◐ | ◐ | ◐ | ✎ | ● | ● | · | ✎ | ●ᴱ | ✎ | · | · | · | ● | · | ● |
| **Waffle / unit chart** <br><sub>`type.waffle`</sub> | · | · | · | ✎ | ● | ✎ | ● | · | ✎ | ● | · | ● | ✎ | · | ✎ | · | · | · | · | · | ✎ |
| **Heatmap (matrix)** <br><sub>`type.heatmap` ★</sub> | ● | ⊕ | ✎ | ● | ● | ● | ● | ? | ● | ● | · | ● | ● | ●ᴱ | ◐ | · | ✎ | · | ●ᴾ | · | ● |
| **Calendar heatmap** <br><sub>`type.heatmap.calendar`</sub> | ● | ⊕ | · | ● | ◐ | ✎ | ● | · | ✎ | ? | ● | ● | ● | ? | ✎ | ● | · | · | ✎ | · | ✎ |
| **Treemap** <br><sub>`type.treemap` ★</sub> | ● | ⊕ | ● | ● | ● | ● | ● | · | ● | ● | · | ✎ | ✎ | ●ᴱ | ● | ● | · | · | · | ● | ● |
| **Sunburst** <br><sub>`type.sunburst` ★</sub> | · | · | ● | ● | ● | ● | ● | · | ● | ● | · | ✎ | ✎ | ●ᴱ | ● | · | · | · | · | · | ● |
| **Icicle / partition** <br><sub>`type.icicle`</sub> | · | · | · | ✎ | ✎ | ● | ● | · | ● | ● | · | ✎ | ✎ | · | ● | · | · | · | · | · | ● |
| **Circle packing** <br><sub>`type.pack`</sub> | · | · | · | ✎ | ● | · | ● | · | ● | · | · | ✎ | ✎ | · | ● | · | · | · | · | · | ● |
| **Sankey** <br><sub>`type.sankey` ★</sub> | ● | ⊕ | ● | ● | ● | ● | ● | · | ● | ⊕ | · | ✎ | ✎ | ●ᴱ | ● | ● | · | · | ●ᴾ | ● | ● |
| **Chord / dependency wheel** <br><sub>`type.chord`</sub> | · | · | · | ● | ● | · | ● | · | ✎ | · | · | ✎ | ✎ | ●ᴱ | ● | · | · | · | · | ? | ● |
| **Arc diagram** <br><sub>`type.arc-diagram`</sub> | · | · | · | ◐ | ● | · | · | · | ✎ | · | · | ✎ | · | · | ● | · | · | · | · | · | ✎ |
| **Funnel** <br><sub>`type.funnel` ★</sub> | ● | ⊕ | ● | ● | ● | ● | ● | · | ✎ | ● | ● | ✎ | ✎ | ●ᴱ | ● | · | · | · | ●ᴾ | · | ✎ |
| **Pyramid** <br><sub>`type.pyramid`</sub> | ◐ | · | · | ◐ | ● | ◐ | · | · | ✎ | ● | · | ✎ | ✎ | ●ᴱ | ● | · | · | · | ? | · | ✎ |
| **Network / force graph** <br><sub>`type.network`</sub> | · | ⊕ | · | ● | ● | · | ● | · | ● | · | · | ✎ | · | ● | ● | · | · | · | · | · | ● |
| **Tree / org chart / dendrogram** <br><sub>`type.tree`</sub> | · | ⊕ | ? | ● | ● | · | ● | · | ● | ⊕ | · | ● | · | ●ᴱ | ● | ● | · | · | ? | ? | ● |
| **Venn / Euler diagram** <br><sub>`type.venn`</sub> | ● | ⊕ | · | · | ● | ✎ | · | · | ✎ | · | · | ✎ | · | · | ● | · | · | · | · | ● | ✎ |
| **Word cloud** <br><sub>`type.wordcloud`</sub> | · | ⊕ | · | ⊕ | ● | · | · | · | ● | · | · | ✎ | · | · | ● | · | · | · | · | · | ● |
| **Histogram** <br><sub>`type.histogram` ★</sub> | ● | ✎ | ✎ | ⊕ | ● | ● | ✎ | ● | ✎ | ◐ | · | ● | ● | ● | ✎ | ● | ✎ | ? | ✎ | ? | ● |
| **Box plot** <br><sub>`type.boxplot` ★</sub> | ● | ⊕ | ✎ | ● | ● | ● | ● | ● | ● | ● | · | ● | ● | ●ᴱ | ◐ | ◐ | · | · | ✎ | · | ● |
| **Violin plot** <br><sub>`type.violin`</sub> | · | ⊕ | · | ✎ | ✎ | ● | · | · | ● | ● | · | ✎ | ✎ | · | · | · | · | · | · | · | ✎ |
| **Density (KDE)** <br><sub>`type.density`</sub> | · | · | · | · | ◐ | ◐ | · | · | · | ? | · | ● | ● | · | ? | · | · | ? | · | · | ● |
| **Error bars** <br><sub>`type.errorbar` ★</sub> | · | ⊕ | ● | ✎ | ● | ● | · | ● | ✎ | · | · | ● | ● | ●ᴱ | ✎ | ◐ | ◐ | · | · | · | ✎ |
| **Trend / regression line** <br><sub>`type.regression` ★</sub> | · | ⊕ | ◐ | ⊕ | ● | · | · | · | · | · | · | ● | ● | ● | ● | ● | · | · | · | · | ✎ |
| **Candlestick** <br><sub>`type.candlestick` ★</sub> | ● | ⊕ | ✎ | ● | ● | ● | · | ● | ✎ | ● | · | ● | ✎ | ●ᴱ | ● | ● | ✎ | ● | ●ᴾ | · | ✎ |
| **OHLC bars** <br><sub>`type.ohlc`</sub> | · | ⊕ | · | · | ● | ● | · | · | ✎ | · | · | ✎ | ✎ | ●ᴱ | ● | · | ✎ | ● | ? | · | ✎ |
| **Technical indicators** <br><sub>`type.finance.indicators`</sub> | · | · | · | · | ● | · | · | · | · | · | · | ● | ◐ | ● | ● | · | · | ⊕ | · | · | · |
| **Volume pane / multiple panes** <br><sub>`type.finance.volume`</sub> | ◐ | ✎ | ✎ | ● | ● | ● | · | ✎ | ✎ | ? | · | ● | ● | ●ᴱ | ● | · | ✎ | ● | ✎ | · | ✎ |
| **Gantt** <br><sub>`type.gantt`</sub> | ● | ✎ | ✎ | ✎ | ● | ✎ | · | · | ✎ | ⊕ | · | ✎ | ◐ | ? | ● | ● | · | · | · | ● | ✎ |
| **Timeline / event chart** <br><sub>`type.timeline`</sub> | ● | · | · | ✎ | ● | ✎ | · | · | ✎ | ◐ | · | ✎ | ✎ | · | ● | ● | · | · | · | ● | ✎ |
| **Quadrant chart** <br><sub>`type.quadrant`</sub> | ● | ✎ | ✎ | ✎ | ✎ | ✎ | · | ? | ✎ | ? | · | ✎ | ✎ | ● | ✎ | · | · | · | ✎ | ● | ✎ |
| **User journey** <br><sub>`type.journey`</sub> | ● | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | · |
| **Choropleth map** <br><sub>`type.map.choropleth` ★</sub> | · | ⊕ | · | ● | ● | ● | ● | · | ● | · | · | ● | ● | ●ᴱ | ● | ● | · | · | ●ᴾ | · | ● |
| **Point / bubble map** <br><sub>`type.map.points`</sub> | · | ⊕ | ? | ● | ● | ● | ✎ | · | ✎ | ? | · | ● | ● | ●ᴱ | ● | ● | · | ? | ✎ | ? | ● |
| **Tile / slippy map base layer** <br><sub>`type.map.tiles`</sub> | · | · | · | ⊕ | ● | ● | ? | · | ? | ? | · | ? | · | ? | ● | ● | · | · | ? | · | ? |
| **Parallel coordinates** <br><sub>`type.parallel`</sub> | · | ⊕ | · | ● | ● | ● | ✎ | ? | ✎ | · | · | ✎ | ✎ | ? | ? | · | · | · | ? | ? | ● |
| **Contour plot** <br><sub>`type.contour`</sub> | · | · | · | · | ● | ● | · | · | · | · | · | ● | · | · | · | · | · | · | · | · | ✎ |
| **Hexbin** <br><sub>`type.hexbin`</sub> | · | · | · | · | ◐ | · | · | · | ✎ | · | · | ● | · | · | · | · | · | · | · | · | ✎ |
| **Vector / wind barb** <br><sub>`type.vector`</sub> | · | · | · | ✎ | ● | ◐ | · | · | ? | · | · | ● | ✎ | ? | · | · | · | · | ? | · | ● |
| **Beeswarm / strip plot** <br><sub>`type.beeswarm`</sub> | · | · | · | ● | ● | ◐ | ● | · | ✎ | ● | · | ● | ◐ | · | · | · | · | · | · | · | ● |
| **3D charts** <br><sub>`type.3d`</sub> | · | · | ? | ⊕ | ● | ● | · | · | · | ? | · | · | · | · | · | ◐ | · | · | · | · | ⊕ |
| **Data table chart** <br><sub>`type.table`</sub> | ◐ | · | · | · | ? | ● | ? | · | · | · | ● | · | ? | · | ? | ● | · | · | ? | · | · |
| **Text-syntax charts (Mermaid-style)** <br><sub>`type.xychart.text`</sub> | ● | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | · |

## Data input (`data`)

How data is supplied, shaped, streamed and cleaned

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Row objects (array of records)** <br><sub>`data.rows` ★</sub> | ● | ● | ● | ● | ● | ✎ | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ? | ◐ | ● | ? | ● |
| **Columnar arrays** <br><sub>`data.columns` ★</sub> | ● | ● | · | ● | ● | ● | ? | · | ? | ● | · | ● | ? | ? | ? | ◐ | ● | · | ● | ● | ? |
| **Typed arrays (Float64Array etc.)** <br><sub>`data.typedarrays`</sub> | ● | ? | · | ● | ● | ● | · | · | · | · | · | ● | · | · | · | · | ● | · | ? | · | · |
| **Load data from URL** <br><sub>`data.url`</sub> | · | · | ? | ? | ● | ✎ | ? | ? | ? | ? | ? | ? | ● | ? | ⊕ | ● | · | ? | ? | ? | ● |
| **CSV / TSV parsing** <br><sub>`data.csv`</sub> | · | · | · | · | ● | · | · | · | · | ? | · | · | ● | · | ⊕ | · | · | · | · | ● | ● |
| **Built-in data transforms** <br><sub>`data.transform` ★</sub> | ◐ | ◐ | ? | ● | ◐ | ? | ? | ? | ? | · | · | ● | ● | ? | ● | ● | · | · | ? | ? | ● |
| **Missing values / gaps** <br><sub>`data.missing` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ◐ | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | · | ● |
| **Time values (Date/ISO/epoch)** <br><sub>`data.time` ★</sub> | ● | ⊕ | ◐ | ● | ● | ● | ● | ● | ● | ● | ? | ● | ● | ● | ● | ? | ● | ● | ● | ● | ● |
| **Time zone handling** <br><sub>`data.timezone` ★</sub> | · | ⊕ | · | ● | ● | · | ◐ | · | ● | ● | · | ● | ● | ● | ● | ? | ● | ● | · | · | ? |
| **Streaming / realtime append** <br><sub>`data.streaming` ★</sub> | ◐ | ⊕ | ◐ | ● | ● | ● | ◐ | ◐ | ◐ | ● | ◐ | · | ⊕ | ◐ | ● | ◐ | ● | ● | ◐ | ? | ◐ |
| **Downsampling / decimation** <br><sub>`data.decimation`</sub> | ● | ● | · | ● | ● | · | · | ? | · | · | · | · | · | · | ● | · | · | ● | · | · | · |
| **Large dataset mode (100k+ points)** <br><sub>`data.large` ★</sub> | ◐ | ◐ | · | ● | ⊕ | ◐ | ◐ | · | · | ? | · | · | · | ◐ | · | · | ● | ● | ● | · | · |
| **Sorting categories** <br><sub>`data.sort` ★</sub> | · | ? | ? | ● | ● | ● | ? | ● | ? | ? | ? | ● | ● | ? | ? | ● | ? | · | ? | ? | ● |
| **Hierarchical data input** <br><sub>`data.hierarchy`</sub> | ◐ | · | ● | ● | ● | ● | ● | ? | ● | ? | ? | ● | · | ● | ● | ● | · | · | ? | ● | ● |
| **Node/link (graph) data input** <br><sub>`data.graph`</sub> | ● | ? | ● | ● | ● | ● | ● | · | ● | · | · | · | · | ● | ● | ● | · | · | ● | ● | ● |

## Marks and series styling (`mark`)

Per-series visual properties

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Per-series colour** <br><sub>`mark.color.series` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| **Per-point / per-category colour** <br><sub>`mark.color.point` ★</sub> | ◐ | ● | ● | ● | ● | ● | ● | ◐ | ● | ● | ◐ | ● | ● | ● | ● | ● | ◐ | ● | ● | · | ● |
| **Conditional / threshold colouring** <br><sub>`mark.color.conditional` ★</sub> | ◐ | ◐ | ◐ | ● | ● | ◐ | ◐ | ◐ | ◐ | ● | · | ◐ | ● | ◐ | ● | ◐ | ◐ | ● | ● | · | ◐ |
| **Gradient fills** <br><sub>`mark.gradient`</sub> | ● | ◐ | ? | ● | ● | ● | ● | ◐ | ● | ● | ◐ | ◐ | ● | ● | ● | ? | ◐ | ● | ◐ | ? | ● |
| **Pattern / hatch fills** <br><sub>`mark.pattern` ★</sub> | · | ⊕ | ? | ● | ⊕ | ● | ● | ✎ | ● | ● | ? | ✎ | · | ● | ● | ? | · | · | ✎ | ? | ? |
| **Line width** <br><sub>`mark.stroke.width` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ? | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| **Dashed / dotted lines** <br><sub>`mark.stroke.dash` ★</sub> | ● | ● | ● | ● | ● | ● | ◐ | ● | ● | ● | · | ● | ● | ● | ● | ◐ | ● | ● | ◐ | ? | ● |
| **Opacity / fill opacity** <br><sub>`mark.opacity` ★</sub> | ● | ◐ | ● | ● | ● | ● | ● | ● | ● | ● | ? | ● | ● | ● | ● | ● | ◐ | ◐ | ◐ | ? | ● |
| **Point marker shapes** <br><sub>`mark.point.shape` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | · | ● | ● | ● | ● | ● | ◐ | ● | ● | · | ● |
| **Point marker size** <br><sub>`mark.point.size`</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | · | ● | ● | ● | ● | ● | ● | ● | ● | · | ● |
| **Show markers always / on hover / never** <br><sub>`mark.point.visibility`</sub> | ● | ● | ● | ● | ● | ● | ● | ◐ | ◐ | ● | ? | ● | ● | ● | ● | ● | ● | ● | ● | · | ● |
| **Rounded bar corners** <br><sub>`mark.bar.radius`</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | · | ● | ● | ● | ● | · | · | · | ● | · | ● |
| **Bar width / gap / padding** <br><sub>`mark.bar.width`</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ◐ | · | ● | · | ● |
| **Line caps / joins** <br><sub>`mark.line.cap`</sub> | ● | ● | ● | ● | ● | · | · | ● | ● | ● | · | ● | ● | ? | ● | · | ● | · | ◐ | · | ● |
| **Glow / shadow effects** <br><sub>`mark.glow`</sub> | ● | ✎ | ◐ | ● | ● | ? | · | ◐ | ✎ | ● | ? | ✎ | · | ● | ● | ? | · | · | · | ? | ● |
| **Draw order / z-index** <br><sub>`mark.zindex`</sub> | · | ● | ● | ● | ● | ◐ | ● | ◐ | ◐ | ? | · | ◐ | ◐ | ◐ | ● | · | ◐ | ● | ◐ | · | ● |

## Scales (`scale`)

Mapping data values to positions/colours

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Linear scale** <br><sub>`scale.linear` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ? | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| **Logarithmic scale** <br><sub>`scale.log` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | · | ● | ● | ● | ● | ● | ● | ● | ● | ? | ● |
| **Symlog / signed log scale** <br><sub>`scale.symlog`</sub> | · | · | ● | · | · | · | ● | · | ● | · | · | ● | ● | · | · | · | ● | · | ● | · | ? |
| **Square-root / power scale** <br><sub>`scale.sqrt`</sub> | ● | · | ● | · | · | · | ? | ● | ● | ? | · | ● | ● | · | · | · | · | · | ● | · | ● |
| **Time scale** <br><sub>`scale.time` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | · | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| **Band / category scale** <br><sub>`scale.band` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ◐ | · | ● | ● | ● |
| **Point / ordinal scale** <br><sub>`scale.point`</sub> | ● | ◐ | ● | ● | ◐ | ◐ | ● | ? | ● | ? | · | ● | ● | ◐ | ◐ | ? | ? | ? | ● | ? | ● |
| **Quantize / threshold / quantile scales** <br><sub>`scale.quantize`</sub> | · | · | ? | ● | ● | · | ● | · | ● | ● | · | ● | ● | · | ◐ | · | · | · | ● | · | ● |
| **Explicit domain (min/max)** <br><sub>`scale.domain` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| **One-sided domain (only min or only max)** <br><sub>`scale.domain.partial` ★</sub> | ● | ● | ● | ● | ● | ● | ● | · | · | ● | ● | ● | ● | ● | ● | ● | ● | · | ● | · | ● |
| **Include zero** <br><sub>`scale.zero` ★</sub> | ● | ● | ◐ | ● | ◐ | ● | ◐ | ? | ● | ● | ◐ | ● | ● | ◐ | ◐ | ◐ | ◐ | · | ◐ | ? | ● |
| **Nice rounding** <br><sub>`scale.nice` ★</sub> | ● | ● | ● | ◐ | ● | ◐ | ● | · | ● | ● | · | ● | ● | ● | ◐ | ◐ | · | · | ● | · | ● |
| **Reversed scale** <br><sub>`scale.reverse` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ◐ | ? | ● | · | ● | ● | ● | ● | ● | ● | ● | ● | ? | ● |
| **Scale padding / clamp / grace** <br><sub>`scale.padding`</sub> | · | ● | ● | ● | ● | ? | ● | ● | ● | ? | ? | ● | ● | ● | ● | ? | ? | ● | ? | ? | ● |
| **Multiple / dual y axes** <br><sub>`scale.multi` ★</sub> | ● | ● | ● | ● | ● | ● | · | ◐ | ◐ | ● | ? | ? | ● | ● | ● | ● | ● | ● | ● | ? | ● |
| **Sequential / diverging colour scale** <br><sub>`scale.color.sequential` ★</sub> | ◐ | ? | ? | ● | ● | ● | ● | ? | ● | ● | · | ● | ● | ●ᴱ | ● | ● | · | · | ● | ? | ● |
| **Categorical colour scale / palette** <br><sub>`scale.color.ordinal` ★</sub> | ● | ✎ | ◐ | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | · | · | ● | ● | ● |

## Axes (`axis`)

Axis lines, ticks, labels, titles and grids

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Show / hide axis** <br><sub>`axis.show` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ? | ● | ● | ● | ● | ● | ● | ● |
| **Axis title** <br><sub>`axis.title` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ? | ● | ● | ● |
| **Axis title position / alignment** <br><sub>`axis.title.position` ★</sub> | ● | ● | ◐ | ● | ● | ● | ● | ● | ● | ● | · | ● | ● | ● | ● | · | ● | · | ● | · | ● |
| **Axis position (top/bottom/left/right)** <br><sub>`axis.position` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ? | ● | ● | ● | ● | ? | ● | ● | ● | ? | ● |
| **Tick count / interval** <br><sub>`axis.ticks.count` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | · | ● |
| **Explicit tick values** <br><sub>`axis.ticks.values` ★</sub> | ● | ◐ | ● | ◐ | ● | ● | ● | ● | ● | ◐ | · | ● | ● | ● | ● | ● | ● | · | ● | ? | ● |
| **Tick label formatting** <br><sub>`axis.ticks.format` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ? | ● |
| **Tick label rotation** <br><sub>`axis.ticks.rotate` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | · | ● | ? | ● |
| **Tick label overlap avoidance** <br><sub>`axis.ticks.autoskip`</sub> | ● | ● | ● | ● | ● | ◐ | · | ● | · | ● | ? | ● | ● | ● | ● | ● | ◐ | ◐ | ● | · | ? |
| **Tick label wrapping / truncation** <br><sub>`axis.ticks.wrap`</sub> | ● | ◐ | ◐ | ● | ● | · | ◐ | ◐ | ◐ | ● | ? | ● | ● | ● | ● | ● | · | ? | ● | ? | ? |
| **Tick marks size / visibility** <br><sub>`axis.ticks.marks`</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | · | ● | ● | ● | ● | · | ● | · | ● | ● | ● |
| **Minor ticks / minor grid** <br><sub>`axis.ticks.minor`</sub> | · | ? | · | ● | ● | ● | · | ? | ? | ? | · | · | · | ● | ● | ● | · | · | · | · | · |
| **Axis line styling** <br><sub>`axis.line`</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | · | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| **Grid lines** <br><sub>`axis.grid` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ? | ● |
| **Grid line style (dash, colour, width)** <br><sub>`axis.grid.style` ★</sub> | ● | ● | ● | ● | ● | ● | ◐ | ● | ● | ● | · | ● | ● | ● | ● | ● | ● | ● | ● | · | ● |
| **Alternating bands / plot bands** <br><sub>`axis.bands`</sub> | ◐ | ⊕ | ● | ● | ● | ● | ✎ | ✎ | ✎ | ● | · | ● | ✎ | ● | ● | · | ● | · | ● | · | ● |
| **Axis breaks** <br><sub>`axis.breaks`</sub> | · | · | · | ● | ● | ● | · | · | · | · | · | ? | · | · | ? | · | · | ● | · | ? | ● |
| **Axis pointer label** <br><sub>`axis.crosshair.label`</sub> | ● | ⊕ | · | ● | ● | ● | · | ● | · | ● | · | ● | · | ● | ● | · | ● | ● | ● | · | ● |
| **Axis offset / origin crossing** <br><sub>`axis.offset`</sub> | · | ● | ● | ● | ● | ● | ● | ● | ● | ● | · | ● | ● | ● | ◐ | ? | ? | ? | ● | ? | ● |

## Legends (`legend`)

Series and scale keys

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Show / hide legend** <br><sub>`legend.show` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | · | ● | ? | ● |
| **Legend position** <br><sub>`legend.position` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ◐ | ● | ? | ◐ | ● | ● | ● | ● | ◐ | ? | ● | ? | ● |
| **Click to toggle series** <br><sub>`legend.interactive` ★</sub> | ● | ● | ◐ | ● | ● | ● | ● | ◐ | ✎ | ● | ? | · | ● | ● | ● | ? | ● | · | ● | · | ● |
| **Values in legend** <br><sub>`legend.values`</sub> | ● | ? | ◐ | ● | ● | · | · | · | ✎ | ● | · | · | · | ? | ● | · | ● | · | · | · | ● |
| **Legend item styling** <br><sub>`legend.style`</sub> | · | ● | ● | ● | ● | ● | ● | ● | ● | ● | · | ● | ● | ● | ● | ● | ◐ | · | ? | · | ● |
| **Paginated / scrolling legend** <br><sub>`legend.scroll`</sub> | · | · | · | ● | ● | ◐ | · | ● | · | · | ● | · | ● | ● | ● | ● | · | · | ● | · | ● |
| **Continuous colour legend / colour bar** <br><sub>`legend.continuous`</sub> | · | · | · | ● | ● | ● | ● | · | ● | · | · | ● | ● | ● | ● | ● | · | · | ● | · | ● |

## Tooltips (`tooltip`)

Hover information

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Tooltip on hover** <br><sub>`tooltip.show` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ◐ | ⊕ | ● | ? | ● |
| **Shared (index) vs single (nearest) tooltip** <br><sub>`tooltip.shared` ★</sub> | ● | ● | ● | ● | ● | ? | ● | ● | ● | ● | · | ● | ◐ | ● | ● | ● | ◐ | · | ● | ? | ● |
| **Tooltip value formatting** <br><sub>`tooltip.format` ★</sub> | ◐ | ● | ● | ● | ● | ● | ● | ● | ✎ | ● | ● | ● | ● | ● | ● | ● | ✎ | · | ● | · | ● |
| **Custom tooltip fields** <br><sub>`tooltip.fields` ★</sub> | ● | ● | ◐ | ● | ● | ● | ◐ | ◐ | ✎ | ● | ◐ | ● | ● | ● | ● | ● | ✎ | · | ● | ? | ● |
| **Custom HTML / component tooltip** <br><sub>`tooltip.custom` ★</sub> | · | ● | ● | ● | ● | · | ● | ● | ● | ● | ● | ● | ? | ● | ● | ● | ✎ | ✎ | ● | ? | ● |
| **Tooltip positioning / follow cursor** <br><sub>`tooltip.position`</sub> | ● | ● | ● | ● | ● | ? | ? | ● | ● | ● | ? | ● | ? | ● | ● | ● | ? | ? | ● | ? | ● |
| **Touch-friendly tooltip** <br><sub>`tooltip.touch`</sub> | ? | ● | ● | ● | ● | · | ● | ● | ● | · | · | ● | · | ● | ● | · | · | ● | ● | · | ? |
| **Crosshair / guide line** <br><sub>`tooltip.crosshair`</sub> | ● | ⊕ | ● | ● | ● | ● | ● | ● | ● | ● | · | ● | ◐ | ● | ● | ● | ● | ● | ● | · | ● |

## Annotations (`annotation`)

Reference lines, bands, labels and markers

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Horizontal reference line** <br><sub>`annotation.line.y` ★</sub> | ● | ⊕ | ● | ● | ● | ● | ● | ✎ | ✎ | ● | · | ● | ● | ● | ● | · | ✎ | ● | ● | · | ● |
| **Vertical reference line** <br><sub>`annotation.line.x` ★</sub> | ● | ⊕ | ● | ● | ● | ● | ● | ✎ | ✎ | ● | · | ● | ● | ● | ● | · | ✎ | ◐ | ● | ● | ● |
| **Shaded band / region** <br><sub>`annotation.band` ★</sub> | ● | ⊕ | ● | ● | ● | ● | ✎ | ✎ | ✎ | ● | · | ● | ● | ● | ● | · | ● | · | ✎ | · | ● |
| **Text annotation at a data point** <br><sub>`annotation.text` ★</sub> | ● | ⊕ | ● | ● | ● | ● | ● | ● | ● | ● | · | ● | ● | ● | ● | ● | ✎ | ● | ✎ | ? | ● |
| **Point marker / callout** <br><sub>`annotation.marker`</sub> | · | ⊕ | ● | ● | ● | ● | ● | ✎ | ● | ● | · | ● | ✎ | ● | ● | · | ✎ | ● | ✎ | · | ● |
| **Annotation label placement** <br><sub>`annotation.label.position`</sub> | ● | ⊕ | ● | ● | ● | ● | ? | ✎ | ● | ● | · | ● | ● | ● | ● | · | · | ● | ● | ? | ● |
| **Annotation styling (dash, colour, opacity)** <br><sub>`annotation.style`</sub> | ● | ⊕ | ● | ● | ● | ● | ● | ✎ | ✎ | ● | · | ● | ● | ● | ● | ? | ? | ● | ● | ? | ● |
| **Interactive / draggable annotations** <br><sub>`annotation.editable`</sub> | · | ⊕ | · | ? | ● | ● | · | · | ● | ? | · | · | · | ●ᴱ | ● | · | · | ⊕ | ? | · | · |
| **Trend / average / statistic lines** <br><sub>`annotation.trendline`</sub> | · | ⊕ | ◐ | ● | ● | · | ? | ? | · | · | · | ● | ● | ? | ● | ● | · | · | · | · | ● |

## Data labels (`label`)

Values printed on marks

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Data labels on marks** <br><sub>`label.show` ★</sub> | ● | ⊕ | ● | ● | ● | ● | ● | ● | ✎ | ● | · | ● | ● | ● | ● | ● | · | ◐ | ● | ● | ● |
| **Data label position** <br><sub>`label.position` ★</sub> | ● | ⊕ | ● | ● | ● | ● | ● | ● | ✎ | ● | ? | ● | ● | ● | ● | ? | ? | ? | ● | ● | ● |
| **Data label formatting** <br><sub>`label.format` ★</sub> | ● | ⊕ | ● | ● | ● | ● | ● | ● | ✎ | ● | ? | ● | ● | ● | ● | ● | ? | ? | ● | · | ● |
| **Label collision avoidance** <br><sub>`label.collision`</sub> | ● | ⊕ | · | ● | ● | ● | ● | ? | · | ? | · | ● | · | ● | ● | ? | · | · | · | ? | ● |
| **Pie slice labels / leader lines** <br><sub>`label.pie` ★</sub> | · | ⊕ | ● | ● | ● | ◐ | ● | ● | ✎ | · | · | · | · | ● | ● | ● | · | · | ● | · | ● |
| **Stack totals** <br><sub>`label.total` ★</sub> | ● | ⊕ | ✎ | ✎ | ● | ✎ | ● | ✎ | ✎ | ● | · | ✎ | ✎ | ? | ✎ | · | · | · | ✎ | · | ✎ |

## Interaction (`interaction`)

Hover, zoom, pan, brush, selection, events, drilldown

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Hover highlight** <br><sub>`interaction.hover.highlight` ★</sub> | ● | ● | ● | ● | ● | ◐ | ● | ● | ✎ | ● | ● | ● | ● | ● | ● | ● | ● | ◐ | ● | · | ● |
| **Click events on marks** <br><sub>`interaction.click` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ✎ | ● | ● | ✎ | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| **Selection (point / multi / series)** <br><sub>`interaction.select` ★</sub> | ● | · | ? | ● | ● | ● | ? | ● | ✎ | ● | ◐ | ✎ | ● | ● | ● | ● | ● | · | ● | ? | ● |
| **Zoom (wheel / pinch / drag)** <br><sub>`interaction.zoom` ★</sub> | ● | ⊕ | · | ● | ● | ● | ? | ● | ● | ● | · | · | ● | ●ᴱ | ● | ● | ● | ● | ●ᴾ | · | ● |
| **Pan** <br><sub>`interaction.pan`</sub> | ● | ⊕ | ? | ● | ● | ● | ? | ● | ● | ● | ? | · | ● | ●ᴱ | ● | ? | ✎ | ● | ●ᴾ | ? | ● |
| **Brush / range selection** <br><sub>`interaction.brush`</sub> | ● | · | ● | ● | ● | ● | · | ● | ● | ● | · | · | ● | ● | ● | ● | ● | · | ● | · | ● |
| **Overview navigator / range slider** <br><sub>`interaction.navigator`</sub> | · | · | ● | ● | ● | ● | · | ✎ | ✎ | ◐ | · | · | ✎ | ● | ● | ● | ✎ | · | ●ᴾ | · | ● |
| **Drilldown** <br><sub>`interaction.drilldown`</sub> | · | ✎ | ✎ | ● | ● | ◐ | ✎ | ✎ | ✎ | ? | · | · | ✎ | ● | ● | ● | · | · | · | · | ● |
| **Keyboard navigation** <br><sub>`interaction.keyboard`</sub> | ● | · | ● | ● | ● | · | ● | ● | · | ? | · | · | · | ● | ● | · | · | · | ? | · | · |
| **Range / zoom change events** <br><sub>`interaction.events.range`</sub> | ● | ⊕ | ● | ● | ● | ● | · | ● | ? | ● | · | · | ● | ● | ● | ? | ● | ● | ●ᴾ | · | ● |
| **Synchronised charts** <br><sub>`interaction.sync`</sub> | · | ✎ | ● | ● | ✎ | ✎ | · | ✎ | ✎ | ● | · | · | ● | ● | ✎ | ? | ● | ✎ | ✎ | ? | ✎ |
| **Legend hover highlights series** <br><sub>`interaction.legend.hover`</sub> | ● | ● | ● | ● | ● | · | ● | ✎ | ✎ | ● | · | · | ● | ● | ● | · | · | · | ● | · | ● |

## Animation and transitions (`animation`)

Entry/update motion

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Animation on/off** <br><sub>`animation.enabled`</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | · | · | ● | ● | ● | · | ? | ● | ? | ● |
| **Duration and easing** <br><sub>`animation.duration`</sub> | ◐ | ● | ● | ● | ● | ● | ● | ● | ✎ | ● | ● | · | ? | ● | ● | ● | · | ? | ? | ? | ● |
| **Animated data updates** <br><sub>`animation.update`</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ◐ | · | · | ● | ● | ● | ? | ? | ◐ | ? | ● |
| **Respects prefers-reduced-motion** <br><sub>`animation.reducedmotion`</sub> | ● | · | ? | · | ● | · | ? | · | · | ? | · | · | · | ? | · | · | · | · | ● | · | · |
| **Keyframe / timeline animation** <br><sub>`animation.frames`</sub> | · | · | · | ● | ? | ● | · | · | · | · | · | · | · | ? | ✎ | · | · | · | · | · | ● |

## Layout and responsiveness (`layout`)

Sizing, margins, titles, faceting

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Responsive width (fill container)** <br><sub>`layout.responsive` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ✎ | ● | ● | ● | ? | ✎ | ● | ● | ● | ● |
| **Aspect ratio sizing** <br><sub>`layout.aspect`</sub> | ● | ● | ● | ? | ◐ | ? | · | ◐ | ✎ | ? | · | ● | · | ? | · | ? | · | · | ? | ? | · |
| **Responsive rules / breakpoints** <br><sub>`layout.breakpoints`</sub> | · | ● | · | ● | ● | · | ? | · | · | ● | · | ? | · | ? | ● | · | · | · | ? | ? | · |
| **Margins / padding** <br><sub>`layout.margin` ★</sub> | ● | ● | ● | ● | ● | ● | ● | ● | ✎ | ● | ? | ● | ● | ● | ● | ● | ● | ? | ● | ● | ● |
| **Chart title and subtitle** <br><sub>`layout.title` ★</sub> | ● | ● | ? | ● | ● | ● | ? | ◐ | ? | ● | ? | ● | ● | ● | ● | ● | ● | ? | ? | ● | ● |
| **Caption / footnote / source** <br><sub>`layout.caption` ★</sub> | · | · | · | ✎ | ● | ✎ | · | ✎ | · | · | · | ● | · | ● | ✎ | · | · | · | · | · | · |
| **Small multiples / faceting** <br><sub>`layout.facet` ★</sub> | · | ✎ | ✎ | ● | ✎ | ● | ✎ | ✎ | ✎ | ? | · | ● | ● | · | ✎ | ? | ✎ | ✎ | ✎ | · | ● |
| **Composed dashboards / concatenation** <br><sub>`layout.concat`</sub> | · | · | · | ● | · | ● | · | ? | · | · | · | · | ● | ? | · | ● | · | ● | · | · | ● |
| **Coordinate systems (polar, transpose, geo)** <br><sub>`layout.polar.coords`</sub> | · | ● | ● | ● | ● | ● | ? | ● | ● | ? | · | ● | ● | ● | ● | · | · | ? | ● | ? | ● |
| **Auto layout around legend/labels** <br><sub>`layout.legend.space`</sub> | ? | ● | ◐ | ● | ● | ● | · | · | · | · | · | ● | ● | ● | ● | ● | ◐ | · | ● | · | ● |

## Theming (`theme`)

Tokens, presets, dark mode, CSS variables

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Built-in themes** <br><sub>`theme.presets` ★</sub> | ● | · | ? | ● | ● | ● | ● | ● | ● | ● | ? | · | ● | ● | ● | ● | · | ● | ? | ● | ● |
| **Dark mode** <br><sub>`theme.dark` ★</sub> | ● | ✎ | ✎ | ● | ● | ● | ◐ | ✎ | ● | ● | ◐ | ✎ | ⊕ | ● | ● | ? | ✎ | ● | ● | ● | ● |
| **Automatic light/dark from page** <br><sub>`theme.auto.scheme`</sub> | ● | · | ? | · | ● | · | · | · | · | · | ◐ | ● | · | · | · | · | · | · | ? | · | · |
| **Design tokens (colours, font, grid, axis)** <br><sub>`theme.tokens`</sub> | ● | ● | ◐ | ● | ● | ● | ● | ● | ● | ● | ◐ | ● | ● | ● | ● | ● | ✎ | ● | ● | ● | ● |
| **CSS variables / class-based styling** <br><sub>`theme.css.vars`</sub> | ● | · | ◐ | · | ● | · | · | ◐ | ● | ◐ | ● | ● | · | ● | · | ● | ● | · | ● | ● | · |
| **Custom colour palette** <br><sub>`theme.palette` ★</sub> | ● | ✎ | ✎ | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ✎ | ✎ | ● | ● | ● |
| **Chart and plot background** <br><sub>`theme.background`</sub> | ● | ✎ | ? | ● | ● | ● | ● | ◐ | ✎ | ● | ? | ● | ● | ● | ● | ● | ✎ | ● | ● | ● | ● |

## Accessibility (`a11y`)

ARIA, alt text, keyboard, patterns, tables

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Accessible name / alt text** <br><sub>`a11y.alt` ★</sub> | ● | ✎ | ● | ● | ● | · | ● | ● | ✎ | ● | · | ● | ● | ● | ● | · | · | · | ● | ● | · |
| **Long description** <br><sub>`a11y.description.long` ★</sub> | ● | · | ● | ● | ● | · | ● | ● | · | · | · | ● | ● | ? | ● | · | · | · | ● | ● | · |
| **Auto-generated chart description** <br><sub>`a11y.auto.description`</sub> | · | · | ? | ● | ● | · | ? | ? | · | · | · | · | · | ● | ? | · | · | · | ? | · | · |
| **Accessible data table** <br><sub>`a11y.datatable` ★</sub> | ● | · | · | ● | ● | · | · | · | · | ? | · | · | · | · | · | ● | · | · | · | · | · |
| **Keyboard navigation of data points** <br><sub>`a11y.keyboard` ★</sub> | ● | · | ● | · | ● | · | ● | · | · | ? | · | · | · | ● | ● | · | · | · | ● | · | · |
| **Pattern fills / non-colour encoding** <br><sub>`a11y.patterns`</sub> | ◐ | ⊕ | ✎ | ● | ⊕ | ● | ● | ✎ | ● | ● | · | ✎ | ● | ● | ● | · | · | · | ✎ | · | ? |
| **High-contrast / colour-blind safe palettes** <br><sub>`a11y.contrast`</sub> | ◐ | · | · | · | ● | · | ? | · | · | ? | · | ● | ● | · | · | ? | · | · | ● | · | · |
| **Sonification** <br><sub>`a11y.sonification`</sub> | · | · | · | · | ● | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| **SVG/canvas ARIA roles** <br><sub>`a11y.role`</sub> | ● | ✎ | ● | ● | ● | · | ● | ● | ✎ | ● | ? | ● | ● | ● | ● | ? | · | · | ● | ● | · |

## Rendering (`render`)

Output technology and server-side rendering

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **SVG output** <br><sub>`render.svg` ★</sub> | ● | · | ● | ● | ● | ● | ● | ● | ● | ● | ? | ● | ⊕ | ? | ? | ? | · | · | ● | ● | ⊕ |
| **Canvas output** <br><sub>`render.canvas` ★</sub> | · | ● | ? | ● | ◐ | · | ● | ? | ? | ? | ? | · | ⊕ | ● | ● | · | ● | ● | ? | · | ● |
| **WebGL / GPU rendering** <br><sub>`render.webgl`</sub> | · | · | · | ⊕ | ⊕ | ● | · | · | · | · | · | · | · | · | ? | · | · | · | ●ᴾ | · | ⊕ |
| **Server-side rendering (no DOM)** <br><sub>`render.ssr` ★</sub> | ● | ? | ◐ | ● | ⊕ | · | ⊕ | ◐ | ◐ | ● | ◐ | ◐ | ⊕ | ● | ? | ? | · | · | ◐ | ⊕ | ⊕ |
| **Hydration / progressive enhancement** <br><sub>`render.hydrate`</sub> | ● | · | ◐ | ? | · | · | ◐ | ◐ | ◐ | ? | ◐ | · | · | · | · | · | · | · | ◐ | · | · |
| **Text DSL / Markdown auto-render** <br><sub>`render.html.dsl`</sub> | ● | · | · | · | · | · | · | · | · | · | · | · | ⊕ | · | · | · | · | · | · | ● | · |
| **High-DPI rendering** <br><sub>`render.pixelratio`</sub> | ◐ | ● | ◐ | ● | ◐ | ● | ● | ◐ | ◐ | ◐ | ? | ◐ | ⊕ | ● | ● | ? | ● | ? | ◐ | ◐ | ? |

## Frameworks and adapters (`framework`)

Official integrations

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **React** <br><sub>`framework.react`</sub> | ● | ⊕ | ● | ⊕ | ⊕ | ⊕ | ● | ● | ● | ⊕ | ● | ✎ | ⊕ | ⊕ | ✎ | ⊕ | ⊕ | ✎ | ● | ? | ✎ |
| **Vue** <br><sub>`framework.vue`</sub> | ● | ⊕ | · | ⊕ | ⊕ | ✎ | · | · | · | ⊕ | · | ✎ | ✎ | ⊕ | ✎ | ⊕ | ⊕ | ✎ | · | ? | ✎ |
| **Svelte** <br><sub>`framework.svelte`</sub> | ● | ⊕ | · | ⊕ | ⊕ | ✎ | · | · | · | ⊕ | · | ✎ | ⊕ | ? | ✎ | ? | ✎ | ✎ | · | ? | ✎ |
| **Angular** <br><sub>`framework.angular`</sub> | · | ⊕ | · | ⊕ | ⊕ | ⊕ | ? | · | ? | ⊕ | · | ✎ | ✎ | ⊕ | ✎ | ⊕ | ✎ | ✎ | ? | ? | ✎ |
| **Vanilla JS / framework-agnostic core** <br><sub>`framework.vanilla`</sub> | ● | ● | · | ● | ● | ● | · | · | · | ● | · | ● | ⊕ | ● | ● | ● | ● | ● | · | ● | ● |
| **Web component** <br><sub>`framework.webcomponent`</sub> | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| **React Native** <br><sub>`framework.reactnative`</sub> | · | · | · | ⊕ | ? | · | · | ⊕ | · | · | · | · | · | · | · | · | · | · | · | · | · |
| **MCP server / agent tool** <br><sub>`framework.mcp`</sub> | · | · | · | ⊕ | · | · | · | · | · | · | · | · | ? | · | · | · | · | · | · | ? | ⊕ |

## Formatting and locale (`format`)

Number/date formatting and i18n

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Number formatting options** <br><sub>`format.number` ★</sub> | ● | ✎ | ✎ | ✎ | ● | ● | ● | ✎ | ✎ | ? | ● | ● | ● | ● | ● | ● | ✎ | ● | ● | ? | ● |
| **Date formatting** <br><sub>`format.date` ★</sub> | ● | ⊕ | ✎ | ● | ● | ● | ● | ✎ | ✎ | ● | · | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| **Compact / SI number abbreviations** <br><sub>`format.compact` ★</sub> | ● | ✎ | ✎ | ✎ | ● | ● | ● | ✎ | ✎ | ? | ? | ● | ● | ● | ● | ● | ✎ | ✎ | ✎ | ? | ● |
| **Locale-aware formatting (i18n)** <br><sub>`format.locale` ★</sub> | ● | ● | ✎ | ● | ● | ● | ✎ | ✎ | ✎ | ● | ? | ● | ⊕ | ● | ● | ● | ✎ | ● | ● | · | ? |
| **Right-to-left support** <br><sub>`format.rtl`</sub> | · | ● | ● | ? | ● | · | ? | ? | · | · | ? | · | ? | ? | ● | ? | · | ? | ● | ? | · |
| **Units / bytes / durations** <br><sub>`format.units`</sub> | ● | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | · | · | · | · | · | · |

## Export (`export`)

Images, data and print

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **PNG export** <br><sub>`export.png` ★</sub> | · | ● | · | ● | ⊕ | ● | ⊕ | · | · | ● | · | · | ⊕ | ● | ⊕ | ● | · | ● | ●ᴾ | ⊕ | ? |
| **SVG export** <br><sub>`export.svg` ★</sub> | ● | · | ◐ | ● | ? | ● | ◐ | ◐ | ◐ | ● | · | ◐ | ⊕ | ? | ? | · | · | · | ? | ● | · |
| **Data export (CSV/XLSX)** <br><sub>`export.csv` ★</sub> | · | · | · | ✎ | ⊕ | · | · | · | · | ● | · | · | ? | · | ⊕ | ? | · | · | · | · | ? |
| **PDF export / print** <br><sub>`export.pdf`</sub> | · | · | · | · | ⊕ | · | · | · | · | · | · | · | · | · | ⊕ | · | · | · | ●ᴾ | · | · |
| **Built-in export menu / toolbar** <br><sub>`export.menu`</sub> | · | · | · | ● | ⊕ | ● | · | · | · | ● | · | · | ⊕ | ● | ⊕ | · | · | · | ●ᴾ | · | · |

## Extensibility (`extend`)

Plugins, custom marks, custom renderers

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Plugin system** <br><sub>`extend.plugins`</sub> | · | ● | ◐ | ● | ● | ● | ◐ | ◐ | ◐ | ? | · | ● | · | ● | ● | · | ● | ● | ● | ● | ● |
| **Custom marks / series renderers** <br><sub>`extend.custom.mark`</sub> | · | ● | ● | ● | ● | ? | ● | ● | ● | ? | ? | ● | · | ? | ● | · | ● | ● | ● | ? | ● |
| **Lifecycle hooks / events** <br><sub>`extend.hooks`</sub> | ● | ● | · | ● | ● | ● | · | ● | · | ● | · | · | · | ● | ● | ? | ● | ● | · | ● | ● |
| **Raw drawing access** <br><sub>`extend.escape`</sub> | · | ● | ● | ● | ● | · | ● | ? | ● | ? | · | ● | · | ? | ● | ● | ● | ● | ● | · | ● |

## Spec style and API surface (`spec`)

How charts are described

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Pure JSON spec (serialisable, no functions)** <br><sub>`spec.declarative.json` ★</sub> | ● | ◐ | ? | ◐ | ◐ | ● | · | ? | · | ◐ | · | · | ● | ◐ | ⊕ | ◐ | · | · | · | · | ● |
| **Published JSON Schema** <br><sub>`spec.jsonschema` ★</sub> | ● | · | · | ? | · | ● | ? | · | · | · | · | · | ● | · | · | · | · | · | · | ● | · |
| **Imperative / builder API** <br><sub>`spec.imperative`</sub> | · | ● | ? | ● | ● | ● | ? | ? | ? | ● | · | ● | · | ● | ● | ● | ● | ● | ? | ? | ● |
| **JSX / component API** <br><sub>`spec.jsx`</sub> | ? | ⊕ | ● | ⊕ | ⊕ | ⊕ | ● | ● | ● | ⊕ | ● | · | ⊕ | ⊕ | · | ⊕ | ⊕ | · | ● | · | · |
| **Text DSL input** <br><sub>`spec.textdsl`</sub> | ● | · | · | ? | ? | · | ? | · | · | · | ? | · | · | ? | ? | · | · | · | ? | ● | ? |
| **Incremental update API** <br><sub>`spec.update`</sub> | ● | ● | ◐ | ● | ● | ● | ◐ | ◐ | ◐ | ● | ◐ | · | ⊕ | ● | ● | ● | ● | ● | ◐ | ? | ● |

## Validation and error messages (`validate`)

Feedback on bad configs

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Runtime spec validation API** <br><sub>`validate.runtime` ★</sub> | ● | · | ? | ? | ● | ● | · | · | · | · | · | · | ⊕ | ● | ? | · | · | · | · | ● | · |
| **Automatic repair / fix suggestions** <br><sub>`validate.repair` ★</sub> | ● | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ? | · |
| **Stable error codes** <br><sub>`validate.codes` ★</sub> | ● | · | · | ? | ● | ? | ? | ? | · | ? | · | · | · | ? | ? | ? | · | · | ? | ? | ? |
| **Unknown-option detection** <br><sub>`validate.unknown.keys` ★</sub> | ● | · | ? | ? | ? | ● | ? | · | ? | · | · | ? | ● | ● | ? | · | · | · | ? | ? | ? |
| **Agent-oriented docs (llms.txt)** <br><sub>`validate.agentdocs` ★</sub> | ● | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | · | · |

## TypeScript support (`ts`)

Type definitions

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Ships TypeScript types** <br><sub>`ts.types` ★</sub> | ● | ● | ● | ● | ● | ⊕ | ● | ● | ● | ● | ● | ● | ● | ● | ● | ⊕ | ● | ● | ● | ● | ● |
| **Type-level per-chart-type option narrowing** <br><sub>`ts.inference`</sub> | ◐ | ● | ◐ | ● | ● | ● | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ● | ● | ◐ | ◐ | ◐ | ◐ | ● | · | ● |

## Licensing & distribution (`meta`)

Licence terms read from package.json license fields and shipped LICENSE/README files.

| Feature | CK | CJ | RC | EC | HC | PL | NV | VI | VX | AP | TR | OP | VL | AG | AM | GC | UP | LW | MU | MM | G2 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Permissive OSS licence for the charting core** <br><sub>`meta.license.permissive` ★</sub> | ● | ● | ● | ● | · | ● | ● | ● | ● | · | ● | ● | ● | ◐ | · | ? | ● | ● | ◐ | ● | ● |
| **Paid tier / commercial licence required for some use** <br><sub>`meta.license.paid`</sub> | · | · | · | · | ● | · | · | · | · | ● | · | · | · | ● | ● | ? | · | · | ● | · | · |
| **Attribution / branding requirement** <br><sub>`meta.license.attrib`</sub> | · | · | · | · | · | · | · | · | · | ● | · | · | · | · | ● | ? | · | ● | · | · | · |

★ = agent relevance 3 (core). For the option path behind any symbol, look up the row in matrix.json → features[].cells[lib].apiPaths / evidence.
