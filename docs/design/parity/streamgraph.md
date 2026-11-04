# Streamgraph parity

Checked 4 November 2026 against the design spec and the public docs named there. A cell is **yes** when the library has a first-class control, **partial** when the picture is possible on a neighbouring type, **no** when it is manual or absent. ChartKit’s baseline key is `mark.streamOffset`. `mark.baseline` is already the spike origin (a number) and `mark.offset` already pulls a pie slice out.

| Feature | ChartKit | Highcharts | ECharts | Vega-Lite | Plotly | Chart.js | Observable Plot | Recharts | Nivo | amCharts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Native stream type | yes | yes | yes | partial | no | no | yes | yes | yes | no |
| Wiggle baseline | yes | yes | no | no | no | no | yes | yes | yes | no |
| Center / silhouette | yes | no | yes | yes | no | no | yes | yes | yes | no |
| Zero baseline | yes | partial | no | yes | no | no | yes | yes | yes | no |
| Expand / normalize | yes | no | no | yes | no | no | yes | yes | yes | no |
| Inside-out order | yes | no | no | no | no | no | yes | no | yes | no |
| Order by sum | yes | no | no | no | no | no | partial | no | yes | no |
| Curve | yes | yes | yes | yes | no | no | yes | yes | yes | no |
| Labels on layers | yes | yes | yes | partial | no | no | yes | yes | yes | no |
| Tooltip with value and share | yes | partial | yes | partial | no | no | partial | partial | yes | no |
| Hover highlight | yes | yes | yes | no | no | no | no | yes | yes | no |
| Legend toggle | yes | yes | yes | yes | no | no | no | yes | yes | no |
| Time x | yes | yes | yes | yes | no | no | yes | yes | yes | no |
| Signed / diverging offset | no | no | no | no | no | no | no | yes | yes | no |

A partial counts as offered. Match means ChartKit also ships it. Exceed means we ship it and they do not. Lack means they ship it and we do not.

## Scorecard

Fourteen features in the table.

| Library | They offer | We match | We exceed | We lack |
| --- | --- | --- | --- | --- |
| Highcharts | 9 | 9 | 4 | 0 |
| ECharts | 8 | 8 | 5 | 0 |
| Vega-Lite | 9 | 9 | 4 | 0 |
| Plotly | 0 | 0 | 13 | 0 |
| Chart.js | 0 | 0 | 13 | 0 |
| Observable Plot | 11 | 11 | 2 | 0 |
| Recharts | 12 | 11 | 2 | 1 |
| Nivo | 14 | 13 | 0 | 1 |
| amCharts | 0 | 0 | 13 | 0 |

The lack against Recharts and Nivo is the signed offset. Plotly, Chart.js, and amCharts have no native stream, so every shipped feature is an exceed.

## Not shipped

| Feature | Why |
| --- | --- |
| Signed / diverging offset | Recharts `sign` and Nivo’s diverging offset. Two libraries, and the spec refuses negatives. |
| Zoom and brush | A wiggle baseline changes when the window changes. The spec leaves it out. |
| Canvas painter | CK3033. Canvas stays on line, stacked area, scatter, bar, heatmap, and candlestick. |
| `mark.offset` as the baseline name | That key pulls a pie slice out, in pixels. `mark.baseline` is the spike origin. The streamgraph control is `mark.streamOffset`. `silhouette` is accepted and drawn as `center`. |
| Gradient fill | The spec keeps the layer at one opacity so the stroke stays readable. |
