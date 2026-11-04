# Density parity

Checked 4 November 2026. This is the 1D kernel curve. 2D contours stay with contour. A partial counts as offered.

| Feature | ChartKit | Highcharts | ECharts | Vega-Lite | Plotly | Chart.js | Observable Plot | Recharts | Nivo | amCharts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1D kernel curve | yes | partial | no | yes | partial | no | partial | no | no | no |
| Bandwidth control | yes | no | no | yes | partial | no | partial | no | no | no |
| Scott / Silverman default | yes | no | no | yes | partial | no | no | no | no | no |
| Overlay groups | yes | no | no | yes | partial | no | partial | no | no | no |
| Filled area | yes | partial | no | yes | partial | no | partial | no | no | no |
| Normalize to density or count | yes | no | no | yes | no | no | no | no | no | no |
| Extent | yes | no | no | yes | no | no | no | no | no | no |
| Rug of raw points | yes | no | no | partial | partial | no | partial | no | no | no |
| Orientation | yes | no | no | partial | partial | no | partial | no | no | no |
| Ridgeline | no | no | no | partial | no | no | partial | no | no | no |
| Cumulative curve | no | no | no | yes | no | no | no | no | no | no |
| 2D contours | no | no | no | no | partial | no | yes | no | no | no |

## Scorecard

Twelve features.

| Library | They offer | We match | We exceed | We lack |
| --- | --- | --- | --- | --- |
| Highcharts | 2 | 2 | 7 | 0 |
| ECharts | 0 | 0 | 9 | 0 |
| Vega-Lite | 11 | 9 | 0 | 2 |
| Plotly | 8 | 7 | 2 | 1 |
| Chart.js | 0 | 0 | 9 | 0 |
| Observable Plot | 8 | 6 | 3 | 2 |
| Recharts | 0 | 0 | 9 | 0 |
| Nivo | 0 | 0 | 9 | 0 |
| amCharts | 0 | 0 | 9 | 0 |

## Not shipped

| Feature | Why |
| --- | --- |
| Ridgeline | Vega-Lite and Plot can facet a density. That is two libraries, not a native mark in three of the nine. Groups overlay. |
| Cumulative | Vega-Lite's density transform has `cumulative`. The other eight do not expose it on a density curve. |
| 2D contours | Plot's density mark is 2D. Plotly's form is `histogram2dcontour`. The spec waits until contour shares the grid. `mark.dims: 2` is CK3109. |
| Kernels other than Gaussian | Not a first-class switch in three of the nine. The curve is Gaussian. Bandwidth is Scott's rule or a number. |
| Violin outlines | The spec keeps those out. A density with a group is overlaid curves, not a violin. |
