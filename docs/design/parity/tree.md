# Tree parity

Fifteen features. A partial counts as offered. ChartKit draws dots and links. Org-chart boxes and node images are not in this version.

| Feature | ChartKit | Highcharts | ECharts | Vega-Lite | Plotly | Chart.js | Observable Plot | Recharts | Nivo | amCharts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tidy node-link | yes | yes | yes | no | no | plugin | yes | unknown | yes | yes |
| Dendrogram, leaves aligned | yes | partial | yes | no | no | plugin | yes | no | yes | yes |
| Orient LR, RL, TB, BT | yes | yes | yes | no | no | no | partial | no | yes | yes |
| Radial | yes | no | yes | no | no | no | no | no | yes | yes |
| Curve and step links | yes | yes | yes | no | no | no | partial | no | yes | partial |
| Node labels | yes | yes | yes | no | no | plugin | yes | no | yes | yes |
| Tooltip: name, parent, value | yes | yes | yes | no | no | plugin | yes | no | yes | yes |
| Color by branch or field | yes | yes | yes | no | no | no | yes | no | yes | yes |
| Color by depth | yes | yes | yes | no | no | no | no | no | yes | yes |
| Legend | yes | yes | yes | no | no | no | yes | no | yes | yes |
| Variable node size | yes | yes | yes | no | no | no | yes | no | yes | partial |
| Collapse | yes | yes | yes | no | no | no | no | no | no | yes |
| Depth cap | yes | yes | yes | no | no | no | no | no | partial | yes |
| Org-chart boxes | no | yes | no | no | no | no | no | no | no | no |
| Node images | no | yes | yes | no | no | no | no | no | no | yes |

`mark.collapsed` is the static list. A click in `mount()` toggles an id and redraws. Cloud and a static SVG use the list as written.

`encoding.y` is the label number. It scales the dot from 4 to 10 and does not move the tidy slots.

## Not in this version

Org-chart boxes. Highcharts draws them on the organization series, which is a different chart from treegraph. The other node-link trees draw a symbol or a dot. That is one library, so boxes stay out. The long-label warning (CK3118) says so.

Node images. Highcharts, ECharts, and amCharts can put a picture on a node. The renderer would have to fetch a URL. That stays out. See the note on custom marks.

Recharts has no tree mark in the matrix (`unknown`), so it is not an offer.
