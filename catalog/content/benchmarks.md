# ChartKit benchmarks, round 13

Measured 2026-10-18 on phase 2 `d8dcc5a`. The agent eval was not re-run; it stays 2026-10-16.

Median of 5, Playwright Chromium, a 640×360 line, three x spacings. This file does not re-time the libraries.

Machine-readable copy: https://chartkit.dev/benchmarks.json (schema https://chartkit.dev/benchmarks.schema.json). HTML page: https://chartkit.dev/benchmarks.

## Methodology

- Browser: Playwright Chromium, a 640×360 line, median of 5. Shapes are even x, jittered x, and gapped timestamps. ChartKit initial is mount(); the aligned update is mount().update().
- Updates: The aligned update starts at the top of a requestAnimationFrame. The harness awaits the library's own completion, then reads the clock from a MessageChannel task after that frame's style, layout, and paint. GPU and raster time is not in the number. ChartKit is measured through mount(element, spec).update(spec), the same shape as uPlot's setData. The figure is the median of five samples.
- Sampling: mark.sampling defaults to auto and minmax-downsamples a line longer than twice the plot width. 1,000 points stay complete. The samplingNone rows draw every point and use the same aligned update timer.
- Bundle: Phase 4 per-type gzip from bench/results/bundle.json. esbuild minify, gzip level 9. ChartKit is createRenderer of that chart. /all is one bundle. unsupported and not tree-shakeable are labeled. uPlot’s JS and stylesheet are separate responses. createRenderer line is 32,110 bytes gzip. Bar is 33,686. Mini-area is 32,114. `/all` is 78,081.
- Server render: Phase 4 per-type Node render from bench/results/ssr.json. Median of 5 at the paint-matrix N. unsupported, error, and timeout are labeled. A blank cell is not used.
- Agents: Round 6 is the scoreboard. claude-sonnet-4-5, temperature 0, 42 tasks, one run on 2026-10-16. Not re-run for round 13. Official means the library docs were in the prompt. ChartKit docs are llms.txt. repair() is a no-model step on ChartKit's no-docs first try and is not a second model call. Nivo and uPlot were not in the agent eval.

## Headline

- Line chart: **32,110 bytes** gzip, createRenderer of the line, measured 2026-10-29 on `55fc89d`. Bar is 33,686. Mini-area is 32,114. `/all` is 78,081. That is a loss to uPlot at 23,292 bytes of JS. The stylesheet is 762 bytes more, a separate response, and the two sum to 24,054, still smaller than ChartKit. It is smaller than Chart.js (49,361), Recharts (96,168, React external), Nivo (96,550, React external), Observable Plot (97,695), and ECharts (162,948). The donut is 15,292 bytes and is smaller than Chart.js (46,913), ECharts (122,134), Recharts (90,046, React external), Nivo (75,494, React external), Highcharts (104,204), Plotly.js (1,477,742), Victory (61,082, React external), ApexCharts (169,473), Tremor (246,834), Vega-Lite (377,693), AG Charts (420,736), amCharts 5 (81,711), MUI X Charts (137,377, React external), and AntV G2 (407,348). uPlot, Observable Plot, visx, Google Charts, TradingView Lightweight Charts, and Mermaid have no donut.
- Initial render: ChartKit is faster than uPlot in all 12 cells. Even 1,000,000 points is 23.6 ms vs 26.5 ms.
- Aligned update: ChartKit wins 6 of 12 cells against uPlot and loses 6. Those six are marked in the browser table. It is not a sweep.
- Server render, 100,000 point line: **2.63 ms** median (mean 2.7 ms).
- `repair()`, no model call, no docs: **21/42 → 42/42**. That agent run is 2026-10-16, not round 13.

## Paint, two-rAF

Two-rAF completion, animation and tooltips off, sampling auto. Median of 5 at 640×360. Run date 2026-10-29. Phase 3 rival cells in the same file stay from 2026-10-28. A cell is initial ms / update ms. DNF means the run errored or timed out. N/A means that library has no native chart of that type. An em dash means this run did not include that cell. Spike is ChartKit only; every rival is N/A. The line row is sampling auto at 100,000 points. The sampling-none rows are the dense line, ChartKit only. This is not a hover-steady time.

Candlestick in the table is 100,000 candles, the size the other libraries were timed at. ChartKit also finished 2,000 candles at 23.8 ms initial and 18.9 ms update. Other line sizes (1,000, 10,000, and the 1,000,000-point sampling-auto cell) and the canvas line stay in paint.json. They are not extra rows here. Bundle size and server render are not in this matrix.

| Chart | Points | ChartKit | uPlot | Chart.js | ECharts | Recharts | Nivo | Observable Plot | Highcharts | Plotly.js | Victory | visx | ApexCharts | Tremor | Vega-Lite | AG Charts | amCharts 5 | Google Charts | TradingView Lightweight Charts | MUI X Charts | Mermaid | AntV G2 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Line | 100,000 | 14.2 / 30.8 | 14.7 / 30.5 | 58.7 / 33.4 | 2491.8 / 2739.9 | 1884.3 / 1002.0 | 383.2 / 980.2 | 109.5 / 1481.0 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Line, sampling none | 100,000 | 54.0 / 1157.2 | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Line, sampling none | 1,000,000 | 466.7 / 21550.2 | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Bar | 48 | 12.1 / 29.8 | 12.0 / 32.3 | 26.4 / 21.4 | 34.7 / 15.8 | 49.8 / 19.1 | 55.2 / 20.4 | 17.4 / 29.6 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Pie | 8 | 7.6 / 33.2 | N/A | 14.5 / 33.1 | 25.6 / 18.5 | 28.5 / 22.5 | 23.5 / 21.2 | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Donut | 8 | 8.8 / 33.5 | N/A | 11.7 / 33.5 | 25.3 / 23.9 | 27.7 / 17.1 | 23.6 / 19.4 | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Stacked area | 100,000 | 45.6 / 51.6 | N/A | 737.4 / 670.0 | 18700.4 / 18445.8 | DNF | DNF | 563.3 / 5252.7 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Scatter | 100,000 | 62.4 / 40.0 | 132.0 / 121.1 | 269.3 / 247.1 | 8827.4 / 9060.5 | 5815.9 / 11446.6 | 410.6 / 339.8 | 519.0 / 624.9 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Combo | 48 | 14.2 / 28.1 | N/A | 28.5 / 17.0 | 36.9 / 23.9 | 56.9 / 23.5 | N/A | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Heatmap | 1,200 | 15.9 / 24.1 | N/A | N/A | 49.1 / 25.5 | N/A | 426.4 / 446.8 | 22.9 / 22.7 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Gauge | 1 | 15.3 / 28.4 | N/A | N/A | 24.9 / 24.9 | N/A | N/A | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| KPI | 1 | 17.7 / 25.9 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | 67.9 / 13.2 | N/A | N/A | N/A | 47.3 / 66.7 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| Sparkline | 100,000 | 18.7 / 15.2 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | 182.1 / 1875.6 | N/A | 180.8 / 75.0 | N/A | N/A | N/A | 167.7 / 1828.3 | N/A | N/A |
| Mini area | 100,000 | 9.5 / 21.4 | 10.5 / 21.0 | 47.4 / 28.6 | 122.4 / 78.8 | 233.0 / 132.2 | 310.1 / 270.9 | 57.8 / 56.2 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Progress ring | 1 | 15.1 / 29.6 | N/A | N/A | N/A | N/A | N/A | N/A | 28.8 / 28.5 | N/A | N/A | N/A | 33.6 / 17.6 | 45.3 / 66.6 | N/A | 117.9 / 6.7 | N/A | N/A | N/A | 22.6 / 22.3 | N/A | N/A |
| Spike | 100,000 | 56.6 / 43.3 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| Candlestick | 100,000 | 181.5 / 153.8 | N/A | N/A | 2840.8 / 2626.4 | N/A | N/A | N/A | 2954.5 / 2913.3 | 101610.6 / 60983.6 | N/A | N/A | DNF | N/A | N/A | 212.0 / 69.9 | 7145.0 / 131435.4 | 5314.0 / 10612.3 | 281.3 / 155.0 | N/A | N/A | N/A |
| Histogram | 100,000 | 30.8 / 17.3 | N/A | N/A | N/A | N/A | N/A | 45.7 / 40.1 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Box plot | 100,000 | 56.7 / 40.1 | N/A | N/A | 70.8 / 53.2 | N/A | 86.5 / 69.7 | 222.2 / 184.3 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Radar | 8 | 10.0 / 33.1 | N/A | 21.8 / 27.5 | 29.0 / 19.3 | 36.1 / 16.2 | 27.1 / 17.4 | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Funnel | 8 | 15.5 / 27.6 | N/A | N/A | 23.5 / 25.9 | 24.3 / 14.2 | 29.9 / 20.0 | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Treemap | 48 | 19.3 / 23.2 | N/A | N/A | 34.3 / 950.3 | 32.7 / 17.3 | 41.6 / 19.5 | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Sankey | 48 | 17.3 / 24.2 | N/A | N/A | 31.4 / 20.6 | 26.9 / 18.5 | 41.7 / 24.6 | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Bullet | 6 | 15.9 / 28.6 | N/A | N/A | N/A | N/A | 43.2 / 20.4 | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Waterfall | 12 | 16.8 / 25.8 | N/A | N/A | N/A | N/A | N/A | N/A | 33.5 / 24.1 | 80.3 / 19.2 | N/A | N/A | 43.6 / 11.9 | N/A | N/A | 144.2 / 19.5 | N/A | N/A | N/A | N/A | N/A | N/A |
| Range area | 100,000 | 28.0 / 22.4 | 45.8 / 34.8 | 377.5 / 341.4 | N/A | N/A | N/A | 230.9 / 4285.1 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Range bar | 24 | 18.1 / 24.8 | 15.3 / 33.4 | 24.9 / 23.4 | N/A | 47.0 / 21.1 | N/A | 15.4 / 25.7 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Error bar | 24 | 17.2 / 22.6 | N/A | N/A | N/A | 59.1 / 23.7 | N/A | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Gantt | 24 | 10.6 / 30.3 | N/A | N/A | N/A | N/A | N/A | N/A | 68.9 / 26.6 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | 237.9 / 105.8 | 188.7 / 31.5 | N/A | N/A | 75.3 / 14.7 | N/A |
| Timeline | 16 | 10.3 / 29.8 | N/A | N/A | N/A | N/A | N/A | N/A | 47.4 / 23.0 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | 233.1 / 27.7 | N/A | N/A | 82.4 / 20.5 | N/A |
| Quadrant | 24 | 9.6 / 33.6 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | 152.2 / 16.3 | N/A | N/A | N/A | N/A | 78.5 / 19.5 | N/A |
| Venn | 3 | 13.2 / 26.9 | N/A | N/A | N/A | N/A | N/A | N/A | 34.1 / 29.1 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | 38.2 / 44.0 | N/A | N/A | N/A | 77.2 / 12.3 | N/A |
| Journey | 12 | 10.6 / 30.9 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | 76.2 / 14.4 | N/A |
| Radial bar | 12 | 15.2 / 27.3 | N/A | N/A | 31.1 / 19.2 | 29.4 / 12.4 | 33.4 / 25.4 | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Rose | 12 | 15.0 / 26.7 | N/A | 20.2 / 28.4 | 26.4 / 19.3 | N/A | N/A | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Sunburst | 48 | 18.2 / 23.2 | N/A | N/A | 29.5 / 18.4 | 29.5 / 21.3 | 35.9 / 13.0 | N/A | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Bar list | 20 | 26.8 / 33.3 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | 46.0 / 66.5 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

## Bundle, gzip

Gzip bytes. esbuild minify, gzip level 9. Measured 2026-10-29, commit 55fc89d. ChartKit is createRenderer of that one chart. /all is 78,081 gzip, one bundle for every core chart and every theme, without the validator. It is not a column. A number is an ok cell. unsupported means that library has no native chart of that type, or is not an npm package. not tree-shakeable means the per-type cell does not repeat the full-package size. error and timeout are labeled when a cell failed. Commercial libraries were run without license keys. Google Charts isn't an npm package. uPlot is a single package that isn't tree-shakeable (23,292 gzip + 762 CSS). visx heatmap shows the figure that includes React and ReactDOM, 69,985 gzip (chart-only is 1,360).

This table renders 293 ok, 442 unsupported, 0 error, and 0 timeout cells. The result file counts 294 ok and 442 unsupported, including the /all bundle as one ok cell. Other full packages, not repeated on each cell: Plotly.js (plotly) 1,477,742 gzip. Tremor (tremor) 246,834 gzip. AG Charts (ag-enterprise) 692,892 gzip. AG Charts (ag-community) 420,736 gzip. TradingView Lightweight Charts (lightweight) 53,352 gzip. Mermaid (mermaid) 962,019 gzip. Vega-Lite (vegalite) 377,693 gzip. AntV G2 (g2) 407,348 gzip. A package with one native type keeps its gzip on that cell. TradingView Lightweight Charts is that case.

| Chart | ChartKit | uPlot | Chart.js | ECharts | Recharts | Nivo | Observable Plot | Highcharts | Plotly.js | Victory | visx | ApexCharts | Tremor | Vega-Lite | AG Charts | amCharts 5 | Google Charts | TradingView Lightweight Charts | MUI X Charts | Mermaid | AntV G2 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Line | 32,110 | not tree-shakeable | 49,361 | 162,948 | 99,674 | 100,561 | 97,695 | 104,197 | not tree-shakeable | 71,699 | 53,343 | 172,332 | not tree-shakeable | not tree-shakeable | not tree-shakeable | 93,499 | unsupported | unsupported | 151,830 | unsupported | not tree-shakeable |
| Bar | 33,686 | not tree-shakeable | 47,523 | 160,990 | 98,768 | 94,378 | 92,903 | 104,197 | not tree-shakeable | 67,995 | 52,219 | 180,235 | not tree-shakeable | not tree-shakeable | not tree-shakeable | 92,369 | unsupported | unsupported | 151,853 | unsupported | not tree-shakeable |
| Pie | 15,293 | unsupported | 46,948 | 122,134 | 93,446 | 79,888 | unsupported | 104,196 | not tree-shakeable | 64,086 | unsupported | 169,473 | unsupported | not tree-shakeable | not tree-shakeable | 81,711 | unsupported | unsupported | 141,038 | unsupported | not tree-shakeable |
| Donut | 15,292 | unsupported | 46,913 | 122,134 | 93,446 | 79,888 | unsupported | 104,204 | not tree-shakeable | 64,086 | unsupported | 169,473 | not tree-shakeable | not tree-shakeable | not tree-shakeable | 81,711 | unsupported | unsupported | 141,038 | unsupported | not tree-shakeable |
| Stacked area | 33,423 | unsupported | 51,300 | 162,948 | 100,337 | 81,726 | 99,768 | 104,219 | not tree-shakeable | 78,483 | 55,307 | 172,333 | not tree-shakeable | not tree-shakeable | not tree-shakeable | 93,499 | unsupported | unsupported | unsupported | unsupported | not tree-shakeable |
| Scatter | 25,987 | not tree-shakeable | 45,500 | 156,710 | 100,376 | 99,058 | 91,023 | 104,204 | not tree-shakeable | 62,628 | 51,507 | 172,333 | not tree-shakeable | not tree-shakeable | not tree-shakeable | unsupported | unsupported | unsupported | 147,198 | unsupported | not tree-shakeable |
| Combo | 38,220 | unsupported | 52,810 | 171,002 | 106,632 | unsupported | unsupported | 104,203 | not tree-shakeable | unsupported | unsupported | unsupported | unsupported | not tree-shakeable | not tree-shakeable | 96,504 | unsupported | unsupported | unsupported | unsupported | unsupported |
| Heatmap | 13,924 | unsupported | unsupported | 166,204 | unsupported | 87,890 | 90,839 | 111,289 | not tree-shakeable | unsupported | 69,985 | 164,503 | unsupported | not tree-shakeable | not tree-shakeable | unsupported | unsupported | unsupported | unsupported | unsupported | not tree-shakeable |
| Gauge | 7,199 | unsupported | unsupported | 116,881 | unsupported | unsupported | unsupported | 137,052 | not tree-shakeable | unsupported | unsupported | unsupported | unsupported | unsupported | not tree-shakeable | unsupported | unsupported | unsupported | 85,491 | unsupported | not tree-shakeable |
| KPI | 9,098 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | not tree-shakeable | unsupported | unsupported | unsupported | not tree-shakeable | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Sparkline | 32,112 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | not tree-shakeable | unsupported | not tree-shakeable | unsupported | unsupported | unsupported | 147,452 | unsupported | unsupported |
| Mini area | 32,114 | not tree-shakeable | 51,300 | 162,948 | 93,183 | 81,726 | 99,755 | 104,209 | not tree-shakeable | 72,296 | 54,216 | 172,333 | not tree-shakeable | not tree-shakeable | not tree-shakeable | 93,499 | unsupported | unsupported | unsupported | unsupported | not tree-shakeable |
| Progress ring | 6,673 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 138,543 | unsupported | unsupported | unsupported | 173,660 | not tree-shakeable | unsupported | not tree-shakeable | unsupported | unsupported | unsupported | 85,491 | unsupported | unsupported |
| Spike | 18,763 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Candlestick | 18,104 | unsupported | unsupported | 164,336 | unsupported | unsupported | unsupported | 142,216 | not tree-shakeable | unsupported | unsupported | 180,131 | unsupported | unsupported | not tree-shakeable | 93,112 | unsupported | 53,352 | unsupported | unsupported | unsupported |
| Histogram | 17,808 | unsupported | unsupported | unsupported | unsupported | unsupported | 95,945 | 105,694 | not tree-shakeable | 68,328 | unsupported | 184,074 | unsupported | not tree-shakeable | not tree-shakeable | unsupported | unsupported | unsupported | unsupported | unsupported | not tree-shakeable |
| Box plot | 17,786 | unsupported | unsupported | 161,684 | unsupported | 89,257 | 95,965 | 137,063 | not tree-shakeable | 64,024 | unsupported | 180,131 | unsupported | not tree-shakeable | not tree-shakeable | unsupported | unsupported | unsupported | unsupported | unsupported | not tree-shakeable |
| Radar | 7,945 | unsupported | 48,357 | 135,797 | 90,048 | 76,493 | unsupported | 137,064 | not tree-shakeable | unsupported | unsupported | 164,603 | unsupported | unsupported | not tree-shakeable | 96,400 | unsupported | unsupported | 141,203 | unsupported | unsupported |
| Funnel | 9,489 | unsupported | unsupported | 117,582 | 89,961 | 76,890 | unsupported | 106,230 | not tree-shakeable | unsupported | unsupported | unsupported | not tree-shakeable | unsupported | unsupported | 79,334 | unsupported | unsupported | unsupported | unsupported | unsupported |
| Treemap | 15,197 | unsupported | unsupported | 127,362 | 82,812 | 78,642 | unsupported | 113,781 | not tree-shakeable | unsupported | unsupported | 174,438 | unsupported | unsupported | not tree-shakeable | 81,545 | unsupported | unsupported | unsupported | unsupported | not tree-shakeable |
| Sankey | 9,646 | unsupported | unsupported | 127,386 | 81,511 | 76,064 | unsupported | 110,060 | not tree-shakeable | unsupported | unsupported | unsupported | unsupported | unsupported | not tree-shakeable | 84,406 | unsupported | unsupported | unsupported | unsupported | not tree-shakeable |
| Bullet | 8,814 | unsupported | unsupported | unsupported | unsupported | 76,533 | unsupported | 105,006 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Waterfall | 17,446 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 137,056 | not tree-shakeable | unsupported | unsupported | 181,690 | unsupported | unsupported | not tree-shakeable | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Range area | 19,410 | not tree-shakeable | 51,300 | unsupported | unsupported | unsupported | 100,090 | 137,061 | unsupported | unsupported | unsupported | 172,332 | unsupported | not tree-shakeable | not tree-shakeable | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Range bar | 17,292 | not tree-shakeable | 47,523 | unsupported | 98,768 | unsupported | 92,920 | 137,060 | unsupported | unsupported | unsupported | 180,238 | unsupported | not tree-shakeable | not tree-shakeable | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Error bar | 17,558 | unsupported | unsupported | unsupported | 101,541 | unsupported | unsupported | 137,065 | not tree-shakeable | 63,367 | unsupported | unsupported | unsupported | not tree-shakeable | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Gantt | 9,621 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 146,351 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 139,554 | unsupported | unsupported | unsupported | not tree-shakeable | unsupported |
| Timeline | 8,505 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 108,757 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | not tree-shakeable | unsupported |
| Quadrant | 8,257 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | not tree-shakeable | unsupported | unsupported | unsupported | unsupported | not tree-shakeable | unsupported |
| Venn | 10,246 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 109,093 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 93,971 | unsupported | unsupported | unsupported | not tree-shakeable | unsupported |
| Journey | 8,124 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | not tree-shakeable | unsupported |
| Radial bar | 10,177 | unsupported | unsupported | 159,368 | 90,945 | 82,851 | unsupported | 137,064 | not tree-shakeable | unsupported | unsupported | unsupported | unsupported | unsupported | not tree-shakeable | 96,560 | unsupported | unsupported | unsupported | unsupported | unsupported |
| Rose | 10,177 | unsupported | 46,150 | 122,134 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 169,473 | unsupported | unsupported | not tree-shakeable | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Sunburst | 12,397 | unsupported | unsupported | 117,772 | 76,902 | 76,520 | unsupported | 118,291 | not tree-shakeable | unsupported | unsupported | 167,284 | unsupported | unsupported | not tree-shakeable | 85,450 | unsupported | unsupported | unsupported | unsupported | unsupported |
| Bar list | 7,941 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | not tree-shakeable | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |

## Browser, milliseconds, ChartKit mount().update() vs uPlot setData

ChartKit wins every initial cell. The update column is the fair timer. Six of those twelve cells are losses, and they are marked in the result column.

| X spacing | Points | ChartKit initial | uPlot initial | ChartKit update | uPlot update | Result |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| even | 1,000 | 11.3 | 12.0 | 1.5 | 1.2 | win-initial-loss-update |
| even | 10,000 | 13.2 | 14.8 | 1.9 | 1.7 | win-initial-loss-update |
| even | 100,000 | 14.1 | 16.3 | 2.3 | 2.9 | win-initial-win-update |
| even | 1,000,000 | 23.6 | 26.5 | 10.7 | 11.2 | win-initial-win-update |
| jitter | 1,000 | 10.1 | 14.2 | 1.6 | 1.4 | win-initial-loss-update |
| jitter | 10,000 | 12.6 | 15.2 | 1.9 | 2.2 | win-initial-win-update |
| jitter | 100,000 | 15.0 | 19.4 | 2.7 | 3.4 | win-initial-win-update |
| jitter | 1,000,000 | 24.4 | 32.1 | 11.7 | 13.0 | win-initial-win-update |
| tsgaps | 1,000 | 11.8 | 12.3 | 1.6 | 1.4 | win-initial-loss-update |
| tsgaps | 10,000 | 12.5 | 14.5 | 1.9 | 1.6 | win-initial-loss-update |
| tsgaps | 100,000 | 15.0 | 17.8 | 3.5 | 3.4 | win-initial-loss-update |
| tsgaps | 1,000,000 | 27.3 | 29.1 | 11.5 | 11.8 | win-initial-win-update |

In these same 12 cells ChartKit’s initial and aligned update are both faster than Chart.js and Observable Plot. Even 1,000,000 points: Chart.js updates in 189.8 ms and Plot in 1,295.8 ms. ECharts, Recharts, and Nivo are not in the round 13 browser rows, so this file does not give them a browser millisecond.

## Hover

Steady hover at 100,000 points. Painted median is the number to cite. ChartKit 16.5 ms, uPlot 16.2 ms.

| Library | Tip ms | Painted median ms | Painted p95 ms |
| --- | ---: | ---: | ---: |
| ChartKit | 16 | 16.5 | 17.1 |
| uPlot | 15.4 | 16.2 | 17 |
| Chart.js | 17 | 20.3 | 22.2 |
| Observable Plot | 22.7 | 28.3 | 34.6 |
| Recharts | 28.2 | 28.9 | 35.1 |
| ECharts | 20.4 | 2881.4 | 3113.2 |

First hover on a fresh 100,000 point chart, painted median. uPlot is about 4–5 ms. ChartKit is 15.9–20.8 ms. That gap is a loss.

| After mount | ChartKit painted | ChartKit max | uPlot painted | uPlot max |
| ---: | ---: | ---: | ---: | ---: |
| 50 | 20.8 | 27 | 4 | 16.6 |
| 200 | 15.9 | 35.9 | 4.6 | 8.4 |
| 500 | 16.5 | 29.2 | 4.9 | 5 |

## Sampling none, ChartKit only, fair timer

| Points | Initial ms | Update ms |
| ---: | ---: | ---: |
| 100,000 | 54.8 | 39.2 |
| 1,000,000 | 471.8 | 462.4 |

## Server render

Median milliseconds. Node string or SVG, median of 5. Measured 2026-10-29, commit 71f3fe4. Line is 100,000 points. Candlestick is listed at both measured sizes. A number is an ok cell. unsupported is always labeled and is not a win. error means the run threw. timeout means the sample exceeded 90s. Recharts 3 SSR returns no SVG (except sunburst), and Tremor is affected for the same reason. G2 has no Node SVG path. visx XYChart SSR renders an empty frame. Google Charts isn't an npm package. Commercial libraries were run without license keys.

This table renders 136 ok, 616 unsupported, 1 error, and 3 timeout cells. The result file counts 136 ok, 616 unsupported, and 4 error. Timeouts are stored as error in that file and labeled timeout here. Victory stacked-area at 100,000 points timed out at 90s. ApexCharts stacked-area at 100,000 points timed out at 90s. MUI X Charts sparkline at 100,000 points threw. ApexCharts area-range at 100,000 points timed out at 90s.

| Chart | Points | ChartKit | uPlot | Chart.js | ECharts | Recharts | Nivo | Observable Plot | Highcharts | Plotly.js | Victory | visx | ApexCharts | Tremor | Vega-Lite | AG Charts | amCharts 5 | Google Charts | TradingView Lightweight Charts | MUI X Charts | Mermaid | AntV G2 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Line | 100,000 | 2.63 | unsupported | unsupported | 125.4 | unsupported | 9,971.51 | 89.17 | unsupported | unsupported | 479.96 | unsupported | 2,421.3 | unsupported | 372.65 | unsupported | unsupported | unsupported | unsupported | 1,153.95 | unsupported | unsupported |
| Bar | 48 | 0.26 | unsupported | unsupported | 5.45 | unsupported | 25.73 | 2.26 | unsupported | unsupported | 5.28 | unsupported | 10.58 | unsupported | 8.47 | unsupported | unsupported | unsupported | unsupported | 10.09 | unsupported | unsupported |
| Pie | 8 | 0.03 | unsupported | unsupported | 2.94 | unsupported | 5.49 | unsupported | unsupported | unsupported | 2.67 | unsupported | 2.41 | unsupported | 6.47 | unsupported | unsupported | unsupported | unsupported | 6.19 | unsupported | unsupported |
| Donut | 8 | 0.03 | unsupported | unsupported | 2.5 | unsupported | 4.5 | unsupported | unsupported | unsupported | 1.83 | unsupported | 1.73 | unsupported | 6.34 | unsupported | unsupported | unsupported | unsupported | 5.85 | unsupported | unsupported |
| Stacked area | 100,000 | 17.35 | unsupported | unsupported | 1,068.79 | unsupported | 14,671.36 | 782.92 | unsupported | unsupported | timeout | unsupported | timeout | unsupported | 2,742.24 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Scatter | 100,000 | 83.58 | unsupported | unsupported | 1,193.52 | unsupported | unsupported | 622.45 | unsupported | unsupported | 2,758.82 | unsupported | 3,771.29 | unsupported | 1,069.55 | unsupported | unsupported | unsupported | unsupported | 1,281.97 | unsupported | unsupported |
| Combo | 48 | 0.3 | unsupported | unsupported | 13.85 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 10.52 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Heatmap | 1,200 | 4.34 | unsupported | unsupported | 22.38 | unsupported | 111.66 | 14.51 | unsupported | unsupported | unsupported | 16.06 | 55.18 | unsupported | 13.44 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Gauge | 1 | 0.07 | unsupported | unsupported | 2.16 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 1.75 | unsupported | unsupported |
| KPI | 1 | 0.04 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 0.3 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Sparkline | 100,000 | 6.83 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | error | unsupported | unsupported |
| Mini area | 100,000 | 3.28 | unsupported | unsupported | 70.73 | unsupported | 6,931.82 | 58.37 | unsupported | unsupported | 802.6 | unsupported | 2,662.91 | unsupported | 254.4 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Progress ring | 1 | 0.01 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 1.89 | 0.28 | unsupported | unsupported | unsupported | unsupported | unsupported | 2.03 | unsupported | unsupported |
| Spike | 100,000 | 24.19 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Candlestick | 100,000 | 435.69 | unsupported | unsupported | 1,354.57 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 7,577.87 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Candlestick | 2,000 | 5.58 | unsupported | unsupported | 35.2 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 87.52 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Histogram | 100,000 | 10.54 | unsupported | unsupported | unsupported | unsupported | unsupported | 29.78 | unsupported | unsupported | 72.55 | unsupported | 48.33 | unsupported | 99.12 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Box plot | 100,000 | 28.08 | unsupported | unsupported | 52.86 | unsupported | 53.21 | 196.68 | unsupported | unsupported | 613.08 | unsupported | 134.79 | unsupported | 230.81 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Radar | 8 | 0.08 | unsupported | unsupported | 4.16 | unsupported | 6.72 | unsupported | unsupported | unsupported | unsupported | unsupported | 3 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 2.81 | unsupported | unsupported |
| Funnel | 8 | 0.05 | unsupported | unsupported | 1.88 | unsupported | 5.49 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 1.05 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Treemap | 48 | 0.78 | unsupported | unsupported | 7.8 | unsupported | 11.69 | unsupported | unsupported | unsupported | unsupported | unsupported | 3.78 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Sankey | 48 | 0.37 | unsupported | unsupported | 4.99 | unsupported | 11.87 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Bullet | 6 | 0.07 | unsupported | unsupported | unsupported | unsupported | 9.07 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Waterfall | 12 | 0.11 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 4.93 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Range area | 100,000 | 5.21 | unsupported | unsupported | unsupported | unsupported | unsupported | 239.71 | unsupported | unsupported | unsupported | unsupported | timeout | unsupported | 462.31 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Range bar | 24 | 0.16 | unsupported | unsupported | unsupported | unsupported | unsupported | 1.31 | unsupported | unsupported | unsupported | unsupported | 5.57 | unsupported | 6.33 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Error bar | 24 | 0.17 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 4.97 | unsupported | unsupported | unsupported | 6.75 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Gantt | 24 | 0.27 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Timeline | 16 | 0.09 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Quadrant | 24 | 0.1 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Venn | 3 | 3.06 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Journey | 12 | 0.13 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Radial bar | 12 | 0.12 | unsupported | unsupported | 3.53 | unsupported | 2.84 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Rose | 12 | 0.06 | unsupported | unsupported | 3.19 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 2.63 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Sunburst | 48 | 0.58 | unsupported | unsupported | 5.25 | 0.97 | 3.66 | unsupported | unsupported | unsupported | unsupported | unsupported | 5.89 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |
| Bar list | 20 | 0.07 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | 2.54 | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported | unsupported |

## Agent eval

Tasks: 42. Model: claude-sonnet-4-5. Temperature: 0.

| Library | No docs, first | No docs, within two | Official, first | Official, within two | Mean first-try tokens, no docs / official |
| --- | --- | --- | --- | --- | --- |
| ChartKit | 21 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 139.3 / 132.4 |
| Recharts | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 221.9 / 236.5 |
| ECharts | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 331.7 / 362.6 |
| Chart.js | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 295 / 258.4 |
| Nivo | not in this eval |  |  |  |  |
| uPlot | not in this eval |  |  |  |  |

ChartKit's no-docs first try plus `repair()` is 42/42. Official first try is already 42/42. The other libraries have no repair step. Nivo and uPlot were not in this eval, so this file does not invent scores for them.

A ChartKit-only rerun with llms.txt cut to 6,329 bytes scored 41/42 on the first try. The miss was combo axis CK3002, which repair() does not patch. The headline uses the full docs file.

## Canvas line, 2026-10-21

Median of 5, Playwright Chromium, a 640×360 line, sampling auto (minmax above twice the plot width). This is not a re-time of round 13. Canvas paints sampled points and builds SVG for the axes only. `render` includes that paint. First paint waits for the same two frames. uPlot has no separate render number. Sampling none was not re-timed in this run.

| Points | SVG render | Canvas render | SVG first paint | Canvas first paint | uPlot first paint | SVG update | Canvas update | uPlot update |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10,000 | 7.3 | 7.8 | 13.1 | 21.8 | 14.5 | 25.6 | 19.1 | 33.2 |
| 100,000 | 8.2 | 9.1 | 13.1 | 20.1 | 17.6 | 29.0 | 18.1 | 23.0 |
| 1,000,000 | 16.5 | 17.1 | 20.8 | 27.7 | 25.1 | 20.6 | 21.8 | 20.9 |

Canvas loses first paint at every size: 10,000 is 21.8 ms against SVG 13.1 and uPlot 14.5; 100,000 is 20.1 ms against SVG 13.1 and uPlot 17.6; 1,000,000 is 27.7 ms against SVG 20.8 and uPlot 25.1. Render is slower at every size: 10,000 7.8 vs 7.3; 100,000 9.1 vs 8.2; 1,000,000 17.1 vs 16.5. Updates: wins 10,000 (19.1 vs SVG 25.6 and uPlot 33.2); wins 100,000 (18.1 vs SVG 29.0 and uPlot 23.0); loses 1,000,000 (21.8 vs SVG 20.6 and uPlot 20.9).
