# Unresolved "none" claims where the absence probe matched something

358 cells. Each is status=unknown, assessed=none in matrix.json. Most hits are incidental words (e.g. Mermaid internals, CSS "position"), but some may be real support. To resolve, open the loc, then either fix the row's claim in rows/*.txt or tighten the probe, and re-run.

| Row | Library | Probe hit |
|---|---|---|
| type.line.step | googlecharts | @types/google.visualization/index.d.ts:998 |
| type.line.step | mermaid | mermaid/dist/config.type.d.ts:310 |
| type.line.smooth | mermaid | mermaid/dist/config.type.d.ts:1891 |
| type.area | mermaid | mermaid/dist/diagrams/gantt/ganttDb.d.ts:93 |
| type.area.stacked | mermaid | mermaid/dist/profiler.d.ts:60 |
| type.area.percent | mermaid | mermaid/dist/config.type.d.ts:1089 |
| type.bar.horizontal | lightweight | 1817:	setCrosshairPosition(price |
| type.bar.stacked | mermaid | mermaid/dist/diagrams/c4/c4Db.d.ts:16 |
| type.bar.percent | lightweight | 3384:	percentageFormatter? |
| type.bar.percent | mermaid | mermaid/dist/config.type.d.ts:1089 |
| type.lollipop | mermaid | mermaid/dist/utils/lineWithOffset.d.ts:7 |
| type.bump | mermaid | mermaid/dist/diagrams/user-journey/journeyRenderer.d.ts:16 |
| type.slope | mermaid | mermaid/dist/rendering-util/rendering-elements/shapes/slopedRect.d.ts:3 |
| type.donut | mermaid | mermaid/dist/config.type.d.ts:940 |
| type.pie.semi | uplot | 199:	type ArcH           = (p |
| type.pie.semi | mermaid | mermaid/dist/rendering-util/rendering-elements/shapes/util.d.ts:59 |
| type.gauge.linear | googlecharts | @types/google.visualization/index.d.ts:1751 |
| type.kpi | highcharts | highcharts/highcharts.src.d.ts:7474 |
| type.kpi | amcharts | @amcharts/amcharts5/.internal/charts/map/PixelMapSeries.d.ts:253 |
| type.heatmap | victory | victory-core/lib/victory-theme/types.d.ts:72 |
| type.chord | mermaid | mermaid/dist/config.type.d.ts:1273 |
| type.pyramid | muix | @mui/x-charts-pro/FunnelChart/funnel.types.d.ts:52 |
| type.tree | recharts | recharts/types/chart/Treemap.d.ts:8 |
| type.tree | muix | @mui/x-charts/ChartsYAxis/useAxisTicksProps.d.ts:3839 |
| type.tree | mermaid | mermaid/dist/config.type.d.ts:237 |
| type.histogram | lightweight | 9:declare const histogramSeries |
| type.histogram | mermaid | mermaid/dist/rendering-util/layout-algorithms/layout-utils/validateLayout.d.ts:39 |
| type.density | apexcharts | apexcharts/types/apexcharts.d.ts:2582 |
| type.density | amcharts | @amcharts/amcharts5/.internal/core/render/patterns/GrainPattern.d.ts:21 |
| type.density | lightweight | 3814:	tickMarkDensity |
| type.ohlc | muix | @mui/x-charts/locales/svSE.d.ts:187 |
| type.quadrant | victory | victory-core/lib/victory-util/common-props.d.ts:50 |
| type.map.points | recharts | recharts/types/util/types.d.ts:576 |
| type.map.points | apexcharts | apexcharts/types/apexcharts.d.ts:646 |
| type.map.points | lightweight | 1399:	lockVisibleTimeRangeOnResize |
| type.map.points | mermaid | mermaid/dist/rendering-util/rendering-elements/lineJump.d.ts:17 |
| type.map.tiles | nivo | @nivo/tree/node_modules/@types/d3-hierarchy/index.d.ts:464 |
| type.map.tiles | visx | @visx/stats/lib/types.d.ts:3 |
| type.map.tiles | apexcharts | apexcharts/types/apexcharts.d.ts:3417 |
| type.map.tiles | plot | @observablehq/plot/src/scales.d.ts:495 |
| type.map.tiles | agcharts | ag-charts-enterprise/dist/types/src/series/treemap/treemapSeriesProperties.d.ts:23 |
| type.map.tiles | muix | @mui/x-charts/ChartsYAxis/useAxisTicksProps.d.ts:4058 |
| type.map.tiles | g2 | @antv/g2/lib/scale/quantile.d.ts:3 |
| type.parallel | victory | victory-pie/lib/slice.d.ts:4 |
| type.parallel | agcharts | ag-charts-community/dist/types/src/module/axisContext.d.ts:38 |
| type.parallel | amcharts | @amcharts/amcharts5/.internal/charts/stock/drawing/ParallelChannelSeries.d.ts:6 |
| type.parallel | muix | @mui/x-charts-premium/internals/plugins/useGeoProjection/useGeoProjection.types.d.ts:43 |
| type.parallel | mermaid | mermaid/dist/config.type.d.ts:1277 |
| type.vector | visx | @visx/vendor/node_modules/@types/d3-delaunay/index.d.ts:247 |
| type.vector | agcharts | ag-charts-enterprise/dist/types/src/features/annotations/parallel-channel/parallelChannelScene.d.ts:22 |
| type.vector | muix | @mui/x-charts/ChartsYAxis/useAxisTicksProps.d.ts:4093 |
| type.3d | recharts | recharts/types/component/TooltipBoundingBox.d.ts:17 |
| type.3d | apexcharts | apexcharts/types/apexcharts.d.ts:3124 |
| type.table | highcharts | highcharts/highcharts.src.d.ts:10061 |
| type.table | nivo | @nivo/tooltip/dist/types/TableTooltip.d.ts:2 |
| type.table | vegalite | 21968:          "description" |
| type.table | amcharts | @amcharts/amcharts5/.internal/plugins/exporting/Exporting.d.ts:484 |
| type.table | muix | @mui/x-charts-pro/Heatmap/HeatmapTooltip/HeatmapTooltip.classes.d.ts:2 |
| data.rows | uplot | 5:		data? |
| data.rows | mermaid | mermaid/dist/rendering-util/types.d.ts:174 |
| data.columns | nivo | @nivo/waffle/dist/types/types.d.ts:69 |
| data.columns | visx | @visx/react-spring/lib/grid/AnimatedGridColumns.d.ts:3 |
| data.columns | vegalite | 5231:        "columns" |
| data.columns | agcharts | ag-charts-types/dist/types/src/main-scene.d.ts:12 |
| data.columns | amcharts | @amcharts/amcharts5/.internal/charts/xy/series/OHLCSeries.d.ts:15 |
| data.columns | g2 | @antv/g2/lib/runtime/transform.d.ts:8 |
| data.typedarrays | muix | @mui/x-charts/ScatterChart/async/scatterRenderData.selectors.d.ts:2 |
| data.url | recharts | recharts/types/cartesian/BarStack.d.ts:51 |
| data.url | echarts | echarts/types/src/core/echarts.d.ts:248 |
| data.url | nivo | @nivo/tree/package.json:7 |
| data.url | victory | victory-zoom-container/package.json:13 |
| data.url | visx | @visx/stats/package.json:22 |
| data.url | apexcharts | apexcharts/types/apexcharts.d.ts:579 |
| data.url | tremor | @tremor/react/dist/index.d.ts:325 |
| data.url | plot | @observablehq/plot/src/marks/image.d.ts:49 |
| data.url | agcharts | ag-charts-types/dist/types/src/chartBuilderOptions.d.ts:118 |
| data.url | lightweight | 250:export declare function createImageWatermark<T>(pane |
| data.url | muix | @mui/x-charts/package.json:8 |
| data.url | mermaid | mermaid/dist/utils.d.ts:92 |
| data.csv | apexcharts | apexcharts/types/apexcharts.d.ts:2204 |
| data.transform | recharts | recharts/types/cartesian/cartesianPositionToCSSTranslate.d.ts:5 |
| data.transform | nivo | @nivo/bar/dist/types/types.d.ts:107 |
| data.transform | victory | victory-tooltip/lib/victory-tooltip.d.ts:105 |
| data.transform | visx | @visx/gradient/lib/gradients/RadialGradient.d.ts:3 |
| data.transform | agcharts | ag-charts-community/dist/types/src/module/optionsGraphOperations.d.ts:58 |
| data.transform | muix | @mui/x-charts/hooks/animation/useAnimateMark.d.ts:10 |
| data.transform | mermaid | mermaid/dist/rendering-util/labelTransform.d.ts:26 |
| data.timezone | googlecharts | @types/google.visualization/index.d.ts:1591 |
| data.streaming | mermaid | mermaid/dist/mermaidAPI.d.ts:64 |
| data.large | apexcharts | apexcharts/types/apexcharts.d.ts:2392 |
| data.sort | chartjs | chart.js/dist/types/index.d.ts:471 |
| data.sort | recharts | recharts/types/state/legendSlice.d.ts:9 |
| data.sort | nivo | @nivo/sunburst/node_modules/@types/d3-hierarchy/index.d.ts:139 |
| data.sort | visx | @visx/sankey/lib/Sankey.d.ts:37 |
| data.sort | apexcharts | apexcharts/types/apexcharts.d.ts:4017 |
| data.sort | tremor | @tremor/react/dist/index.d.ts:634 |
| data.sort | agcharts | ag-charts-types/dist/types/src/series/standalone/sankeyOptions.d.ts:108 |
| data.sort | uplot | 856:			sorted? |
| data.sort | muix | @mui/x-charts/ChartsTooltip/ChartsTooltip.d.ts:10 |
| data.sort | mermaid | mermaid/dist/diagrams/eventmodeling/types.d.ts:94 |
| data.hierarchy | victory | victory-zoom-container/lib/victory-zoom-container.d.ts:56 |
| data.hierarchy | apexcharts | apexcharts/types/apexcharts.d.ts:2469 |
| data.hierarchy | tremor | @tremor/react/dist/index.d.ts:265 |
| data.hierarchy | muix | @mui/x-charts-pro/Heatmap/useHeatmapProps.d.ts:14 |
| data.graph | chartjs | chart.js/dist/types/index.d.ts:609 |
| mark.gradient | googlecharts | @types/google.visualization/index.d.ts:431 |
| mark.gradient | mermaid | mermaid/dist/themes/theme-redux.d.ts:21 |
| mark.pattern | tremor | @tremor/react/dist/index.d.ts:335 |
| mark.pattern | googlecharts | @types/google.visualization/index.d.ts:154 |
| mark.pattern | mermaid | mermaid/dist/types.d.ts:56 |
| mark.stroke.width | tremor | @tremor/react/dist/index.d.ts:690 |
| mark.stroke.dash | mermaid | mermaid/dist/diagrams/wardley/wardleyDb.d.ts:4 |
| mark.opacity | tremor | @tremor/react/dist/index.d.ts:146 |
| mark.opacity | mermaid | mermaid/dist/themes/theme-redux.d.ts:136 |
| mark.line.cap | agcharts | ag-charts-community/dist/types/src/scene/shape/shape.d.ts:11 |
| mark.glow | plotly | @types/plotly.js/index.d.ts:2130 |
| mark.glow | tremor | @tremor/react/dist/index.d.ts:16 |
| mark.glow | googlecharts | @types/google.visualization/index.d.ts:1730 |
| mark.glow | mermaid | mermaid/dist/styles.d.ts:12 |
| mark.zindex | apexcharts | apexcharts/types/apexcharts.d.ts:2548 |
| scale.linear | tremor | @tremor/react/dist/lib/inputTypes.d.ts:4 |
| scale.log | mermaid | mermaid/dist/diagram-api/diagramAPI.d.ts:3 |
| scale.sqrt | nivo | @nivo/circle-packing/node_modules/@types/d3-hierarchy/index.d.ts:684 |
| scale.sqrt | apexcharts | apexcharts/types/apexcharts.d.ts:3386 |
| scale.point | victory | victory-tooltip/lib/victory-tooltip.d.ts:6 |
| scale.point | apexcharts | apexcharts/types/unit-shapes.d.ts:33 |
| scale.point | googlecharts | @types/google.visualization/index.d.ts:409 |
| scale.point | uplot | 456:		export interface Points { |
| scale.point | lightweight | 489:	pointMarkersVisible |
| scale.point | mermaid | mermaid/dist/themes/theme-redux.d.ts:147 |
| scale.quantize | recharts | recharts/types/util/types.d.ts:143 |
| scale.zero | victory | victory-core/lib/victory-util/domain.d.ts:62 |
| scale.zero | mermaid | mermaid/dist/utils.d.ts:4 |
| scale.reverse | visx | @visx/scale/lib/types/ScaleConfig.d.ts:10 |
| scale.reverse | mermaid | mermaid/dist/diagrams/sequence/sequenceDb.d.ts:40 |
| scale.padding | plotly | @types/plotly.js/index.d.ts:1163 |
| scale.padding | apexcharts | apexcharts/types/unit-shapes.d.ts:68 |
| scale.padding | tremor | @tremor/react/dist/index.d.ts:76 |
| scale.padding | googlecharts | @types/google.visualization/index.d.ts:1804 |
| scale.padding | uplot | 272:	export type PaddingSide = number | null | ((self |
| scale.padding | muix | @mui/x-charts/PieChart/PieArcLabel.d.ts:17 |
| scale.padding | mermaid | mermaid/dist/setupGraphViewbox.d.ts:3 |
| scale.multi | tremor | @tremor/react/dist/index.d.ts:20 |
| scale.multi | plot | @observablehq/plot/src/marks/bar.d.ts:59 |
| scale.multi | mermaid | mermaid/dist/themes/theme-redux.d.ts:39 |
| scale.color.sequential | chartjs | chart.js/dist/types/index.d.ts:1939 |
| scale.color.sequential | recharts | recharts/types/polar/RadialBar.d.ts:56 |
| scale.color.sequential | victory | victory-line/lib/victory-line.d.ts:83 |
| scale.color.sequential | mermaid | mermaid/dist/utils.d.ts:84 |
| axis.title | lightweight | 2242:	 *     title |
| axis.position | tremor | @tremor/react/dist/index.d.ts:18 |
| axis.position | googlecharts | @types/google.visualization/index.d.ts:504 |
| axis.position | mermaid | mermaid/dist/rendering-util/types.d.ts:20 |
| axis.ticks.values | mermaid | mermaid/dist/diagrams/xychart/chartBuilder/components/axis/linearAxis.d.ts:8 |
| axis.ticks.format | mermaid | mermaid/dist/utils.d.ts:92 |
| axis.ticks.rotate | mermaid | mermaid/dist/config.type.d.ts:1145 |
| axis.ticks.wrap | tremor | @tremor/react/dist/components/icon-elements/Icon/styles.d.ts:2 |
| axis.ticks.wrap | lightweight | 2195:export interface IPanePrimitiveWrapper<T, Options> { |
| axis.ticks.wrap | mermaid | mermaid/dist/config.type.d.ts:244 |
| axis.ticks.minor | victory | victory-core/lib/victory-primitives/whisker.d.ts:13 |
| axis.ticks.minor | visx | @visx/geo/lib/graticule/Graticule.d.ts:29 |
| axis.ticks.minor | apexcharts | apexcharts/types/apexcharts.d.ts:4416 |
| axis.grid | mermaid | mermaid/dist/themes/theme-redux.d.ts:75 |
| axis.breaks | plot | @observablehq/plot/src/marks/text.d.ts:125 |
| axis.breaks | mermaid | mermaid/dist/internals.d.ts:12 |
| axis.offset | googlecharts | @types/google.visualization/index.d.ts:1732 |
| axis.offset | uplot | 189:	type ValToPos = (val |
| axis.offset | lightweight | 1354:	rightOffset |
| axis.offset | mermaid | mermaid/dist/utils/lineWithOffset.d.ts:2 |
| legend.show | mermaid | mermaid/dist/themes/theme-redux.d.ts:130 |
| legend.position | lightweight | 281: *				position |
| legend.position | mermaid | mermaid/dist/rendering-util/types.d.ts:20 |
| legend.interactive | googlecharts | @types/google.visualization/index.d.ts:393 |
| legend.values | chartjs | chart.js/dist/types/index.d.ts:806 |
| tooltip.show | mermaid | mermaid/dist/diagrams/state/stateDb.d.ts:52 |
| tooltip.shared | mermaid | mermaid/dist/rendering-util/layout-algorithms/swimlanes/direction/sharedTrackNudging.d.ts:2 |
| tooltip.fields | mermaid | mermaid/dist/diagrams/pie/pieTypes.d.ts:3 |
| tooltip.custom | vegalite | 1021:            "content", |
| tooltip.custom | mermaid | mermaid/dist/mermaid.d.ts:95 |
| tooltip.position | plotly | @types/plotly.js/lib/pie.d.ts:17 |
| tooltip.position | nivo | @nivo/stream/dist/types/types.d.ts:92 |
| tooltip.position | tremor | @tremor/react/dist/index.d.ts:18 |
| tooltip.position | vegalite | 1558:        "position" |
| tooltip.position | uplot | 79:	/** sets the cursor position (relative to plotting area) */ |
| tooltip.position | lightweight | 281: *				position |
| tooltip.position | mermaid | mermaid/dist/rendering-util/types.d.ts:20 |
| annotation.text | mermaid | mermaid/dist/diagrams/wardley/wardleyDb.d.ts:6 |
| annotation.label.position | nivo | @nivo/sankey/dist/types/types.d.ts:118 |
| annotation.label.position | mermaid | mermaid/dist/utils.d.ts:103 |
| annotation.style | googlecharts | @types/google.visualization/index.d.ts:761 |
| annotation.style | uplot | 301:		export type Dash   = CSSStyleDeclaration['borderStyle'] | ((self |
| annotation.style | mermaid | mermaid/dist/diagrams/wardley/wardleyDb.d.ts:4 |
| annotation.editable | echarts | echarts/types/src/util/types.d.ts:1162 |
| annotation.editable | apexcharts | apexcharts/types/apexcharts.d.ts:1967 |
| annotation.editable | muix | @mui/x-charts/ChartsTooltip/ChartsTooltipTable.d.ts:16 |
| annotation.trendline | nivo | @nivo/bullet/dist/types/compute.d.ts:4 |
| annotation.trendline | victory | victory-pie/lib/helper-methods.d.ts:5 |
| annotation.trendline | agcharts | ag-charts-community/dist/types/src/chart/data/dataDomain.d.ts:147 |
| label.position | tremor | @tremor/react/dist/index.d.ts:18 |
| label.position | googlecharts | @types/google.visualization/index.d.ts:504 |
| label.position | uplot | 79:	/** sets the cursor position (relative to plotting area) */ |
| label.position | lightweight | 281: *				position |
| label.format | tremor | @tremor/react/dist/index.d.ts:10 |
| label.format | uplot | 324:	export type DateFormatterFactory = (tpl |
| label.format | lightweight | 1969:	updateFormatter(options |
| label.collision | victory | victory-axis/lib/victory-axis.d.ts:7 |
| label.collision | apexcharts | apexcharts/types/apexcharts.d.ts:3112 |
| label.collision | googlecharts | @types/google.visualization/index.d.ts:1225 |
| label.collision | mermaid | mermaid/dist/diagrams/sequence/sequenceRenderer.d.ts:57 |
| interaction.select | recharts | recharts/types/zIndex/zIndexSelectors.d.ts:8 |
| interaction.select | nivo | @nivo/chord/dist/types/hooks.d.ts:52 |
| interaction.select | mermaid | mermaid/dist/mermaid.d.ts:26 |
| interaction.zoom | nivo | @nivo/circle-packing/dist/types/types.d.ts:60 |
| interaction.pan | recharts | recharts/types/zIndex/zIndexSelectors.d.ts:8 |
| interaction.pan | nivo | @nivo/tree/dist/types/types.d.ts:81 |
| interaction.pan | tremor | @tremor/react/dist/index.d.ts:429 |
| interaction.pan | mermaid | mermaid/dist/types.d.ts:22 |
| interaction.keyboard | apexcharts | apexcharts/types/apexcharts.d.ts:2129 |
| interaction.sync | mermaid | mermaid/dist/rendering-util/icons.d.ts:3 |
| animation.enabled | lightweight | 56:export declare enum LastPriceAnimationMode { |
| animation.enabled | mermaid | mermaid/dist/types.d.ts:27 |
| animation.duration | vegalite | 22022:          "description" |
| animation.duration | lightweight | 351: *     updateVisibilityDuration |
| animation.duration | muix | @mui/x-charts/ChartsYAxis/useAxisTicksProps.d.ts:3693 |
| animation.duration | mermaid | mermaid/dist/profiler.d.ts:30 |
| animation.update | uplot | 1146:			/** fires when cursor changes idx and legend updates (or should update) */ |
| animation.update | lightweight | 351: *     updateVisibilityDuration |
| animation.update | mermaid | mermaid/dist/internals.d.ts:24 |
| animation.reducedmotion | recharts | recharts/types/util/usePrefersReducedMotion.d.ts:6 |
| animation.reducedmotion | apexcharts | apexcharts/types/apexcharts.d.ts:2383 |
| animation.frames | agcharts | ag-charts-community/dist/types/src/chart/interaction/animationManager.d.ts:53 |
| layout.aspect | echarts | echarts/types/src/util/types.d.ts:735 |
| layout.aspect | plotly | @types/plotly.js/index.d.ts:2895 |
| layout.aspect | apexcharts | apexcharts/types/apexcharts.d.ts:1612 |
| layout.aspect | agcharts | ag-charts-types/dist/types/src/series/standalone/pyramidOptions.d.ts:50 |
| layout.aspect | googlecharts | @types/google.visualization/index.d.ts:379 |
| layout.aspect | muix | @mui/x-charts/ChartsYAxis/useAxisTicksProps.d.ts:4029 |
| layout.aspect | mermaid | mermaid/dist/diagrams/flowchart/types.d.ts:28 |
| layout.breakpoints | nivo | @nivo/chord/node_modules/d3-chord/.eslintrc.json:12 |
| layout.breakpoints | plot | @observablehq/plot/src/marks/crosshair.d.ts:36 |
| layout.breakpoints | agcharts | ag-charts-community/dist/types/src/chart/interaction/contextMenuTypes.d.ts:82 |
| layout.breakpoints | muix | @mui/x-charts/internals/getInlineTypographyStyle.d.ts:3 |
| layout.breakpoints | mermaid | mermaid/dist/diagrams/railroad/railroadTypes.d.ts:109 |
| layout.margin | tremor | @tremor/react/dist/components/input-elements/Button/Button.d.ts:9 |
| layout.margin | lightweight | 536:export interface AutoScaleMargins { |
| layout.title | recharts | recharts/types/util/types.d.ts:1397 |
| layout.title | nivo | @nivo/legends/dist/types/types.d.ts:105 |
| layout.title | visx | @visx/annotation/lib/components/Label.d.ts:31 |
| layout.title | tremor | @tremor/react/dist/components/text-elements/Title/Title.d.ts:3 |
| layout.title | lightweight | 2242:	 *     title |
| layout.title | muix | @mui/x-charts/ChartsLayerContainer/ChartsLayerContainer.d.ts:8 |
| layout.concat | victory | victory-core/src/victory-util/immutable-types.d.ts:2146 |
| layout.concat | agcharts | ag-charts-community/dist/types/src/chart/data/dataDomain.d.ts:129 |
| layout.polar.coords | nivo | @nivo/generators/dist/types/parallelCoordinates.d.ts:12 |
| layout.polar.coords | apexcharts | apexcharts/types/apexcharts.d.ts:1870 |
| layout.polar.coords | lightweight | 1815:	 * @param horizontalPosition - The horizontal coordinate (time by default) of the new crosshair position. |
| layout.polar.coords | mermaid | mermaid/dist/utils.d.ts:269 |
| theme.presets | recharts | recharts/types/theme/graphicalItemIdentity.d.ts:31 |
| theme.presets | tremor | @tremor/react/dist/lib/theme.d.ts:24 |
| theme.dark | googlecharts | @types/google.visualization/index.d.ts:1725 |
| theme.background | recharts | recharts/types/polar/RadialBar.d.ts:20 |
| theme.background | tremor | @tremor/react/dist/lib/theme.d.ts:6 |
| a11y.description.long | agcharts | ag-charts-community/dist/types/src/widget/widget.d.ts:46 |
| a11y.auto.description | recharts | recharts/types/util/svgPropertiesNoEvents.d.ts:1 |
| a11y.auto.description | nivo | @nivo/stream/dist/types/types.d.ts:104 |
| a11y.auto.description | victory | victory-core/lib/victory-clip-container/victory-clip-container.d.ts:5 |
| a11y.auto.description | amcharts | @amcharts/amcharts5/.internal/core/render/Label.d.ts:236 |
| a11y.auto.description | muix | @mui/x-charts/ChartsTooltip/ChartsTooltipTable.d.ts:16 |
| a11y.datatable | apexcharts | apexcharts/types/apexcharts.d.ts:5511 |
| a11y.keyboard | apexcharts | apexcharts/types/apexcharts.d.ts:2129 |
| a11y.contrast | apexcharts | apexcharts/types/apexcharts.d.ts:5328 |
| a11y.contrast | googlecharts | @types/google.visualization/index.d.ts:407 |
| a11y.role | tremor | @tremor/react/dist/index.d.ts:517 |
| a11y.role | googlecharts | @types/google.visualization/index.d.ts:158 |
| render.svg | agcharts | ag-charts-community/dist/types/src/util/svg.d.ts:1 |
| render.svg | amcharts | @amcharts/amcharts5/.internal/plugins/exporting/Exporting.d.ts:18 |
| render.canvas | recharts | recharts/types/util/IfOverflow.d.ts:4 |
| render.canvas | victory | victory-canvas/lib/canvas-point.d.ts:2 |
| render.canvas | visx | @visx/annotation/lib/components/EditableAnnotation.d.ts:4 |
| render.canvas | apexcharts | apexcharts/types/apexcharts.d.ts:291 |
| render.canvas | tremor | @tremor/react/dist/lib/theme.d.ts:6 |
| render.canvas | muix | @mui/x-charts-premium/ScatterChartPremium/ScatterChartPremium.d.ts:19 |
| render.webgl | amcharts | @amcharts/amcharts5/.internal/charts/map/MapRasterSeries.d.ts:131 |
| render.ssr | amcharts | @amcharts/amcharts5/.internal/core/util/DataProcessor.d.ts:70 |
| render.ssr | googlecharts | @types/google.visualization/index.d.ts:374 |
| render.hydrate | apexcharts | apexcharts/types/apexcharts.d.ts:612 |
| framework.angular | nivo | @nivo/tree/node_modules/@types/d3-hierarchy/index.d.ts:411 |
| framework.angular | visx | @visx/hierarchy/node_modules/@types/d3-hierarchy/index.d.ts:351 |
| framework.angular | muix | @mui/x-charts-premium/Map/reprojectEquirectangularImage.d.ts:2 |
| format.number | mermaid | mermaid/dist/utils.d.ts:92 |
| format.compact | mermaid | mermaid/dist/config.type.d.ts:611 |
| format.rtl | echarts | echarts/types/src/coord/matrix/MatrixDim.d.ts:73 |
| format.rtl | nivo | @nivo/bump/dist/types/bump/types.d.ts:106 |
| format.rtl | victory | victory-core/lib/victory-util/textsize.d.ts:7 |
| format.rtl | tremor | @tremor/react/dist/components/chart-elements/common/ChartLegend.d.ts:3 |
| format.rtl | vegalite | 28322:        "rtl" |
| format.rtl | agcharts | ag-charts-community/dist/types/src/module-support.d.ts:115 |
| format.rtl | googlecharts | @types/google.visualization/index.d.ts:508 |
| format.rtl | lightweight | 1090:	vertLine |
| format.rtl | mermaid | mermaid/dist/themes/theme-redux.d.ts:82 |
| export.svg | agcharts | ag-charts-community/dist/types/src/util/svg.d.ts:1 |
| export.svg | muix | @mui/x-charts-pro/plugins/selectors/useChartHeatmapPosition.selectors.d.ts:4 |
| export.csv | vegalite | 7863:            "csv", |
| export.csv | googlecharts | @types/google.visualization/index.d.ts:35 |
| export.csv | g2 | @antv/g2/lib/spec/data.d.ts:7 |
| extend.plugins | apexcharts | apexcharts/types/apexcharts.d.ts:441 |
| extend.custom.mark | plotly | @types/plotly.js/lib/sankey.d.ts:41 |
| extend.custom.mark | apexcharts | apexcharts/types/apexcharts.d.ts:98 |
| extend.custom.mark | tremor | @tremor/react/dist/lib/inputTypes.d.ts:18 |
| extend.custom.mark | agcharts | ag-charts-community/dist/types/src/chart/legend/legendMarkerLabel.d.ts:27 |
| extend.custom.mark | mermaid | mermaid/dist/diagrams/git/gitGraphTypes.d.ts:40 |
| extend.escape | victory | victory-zoom-container/lib/zoom-helpers.d.ts:53 |
| extend.escape | apexcharts | apexcharts/types/apexcharts.d.ts:68 |
| extend.escape | agcharts | ag-charts-enterprise/dist/types/src/gradient-legend/gradientLegend.d.ts:4 |
| spec.declarative.json | recharts | recharts/types/state/reduxDevtoolsJsonStringifyReplacer.d.ts:1 |
| spec.declarative.json | victory | victory-core/src/victory-util/immutable-types.d.ts:83 |
| spec.jsonschema | echarts | echarts/types/dist/shared.d.ts:5103 |
| spec.jsonschema | nivo | @nivo/static/dist/types/mappings/treemap.d.ts:9 |
| spec.imperative | recharts | recharts/types/util/types.d.ts:947 |
| spec.imperative | nivo | @nivo/tree/node_modules/@types/d3-hierarchy/index.d.ts:20 |
| spec.imperative | victory | victory-scatter/lib/victory-scatter.d.ts:39 |
| spec.imperative | visx | @visx/responsive/lib/types/index.d.ts:18 |
| spec.imperative | muix | @mui/x-charts/hooks/animation/useAnimate.d.ts:13 |
| spec.imperative | mermaid | mermaid/dist/config.type.d.ts:1141 |
| spec.textdsl | echarts | echarts/types/src/coord/parallel/ParallelModel.d.ts:20 |
| spec.textdsl | highcharts | highcharts/highcharts.src.d.ts:200 |
| spec.textdsl | nivo | @nivo/line/dist/types/SliceTooltip.d.ts:2 |
| spec.textdsl | tremor | @tremor/react/dist/index.d.ts:75 |
| spec.textdsl | agcharts | ag-charts-community/dist/types/src/chart/data/dataSet.d.ts:37 |
| spec.textdsl | amcharts | @amcharts/amcharts5/.internal/core/render/ProgressPie.d.ts:50 |
| spec.textdsl | muix | @mui/x-charts/ChartsLegend/chartsLegend.types.d.mts:7 |
| spec.textdsl | g2 | @antv/g2/lib/data/utils/venn/layout.d.ts:13 |
| spec.update | mermaid | mermaid/dist/internals.d.ts:24 |
| validate.runtime | recharts | recharts/types/chart/PolarChart.d.ts:48 |
| validate.runtime | echarts | echarts/types/src/util/model.d.ts:408 |
| validate.runtime | amcharts | @amcharts/amcharts5/.internal/core/render/scene/SceneNode.d.ts:102 |
| validate.repair | mermaid | mermaid/dist/diagrams/venn/vennRenderer.d.ts:21 |
| validate.codes | echarts | echarts/types/src/model/Series.d.ts:119 |
| validate.codes | plotly | @types/plotly.js/index.d.ts:552 |
| validate.codes | nivo | @nivo/generators/dist/types/index.d.ts:10 |
| validate.codes | victory | victory-core/src/victory-util/immutable-types.d.ts:1713 |
| validate.codes | apexcharts | apexcharts/types/apexcharts.d.ts:578 |
| validate.codes | agcharts | ag-charts-community/dist/types/src/chart/interaction/keyBindings.d.ts:9 |
| validate.codes | amcharts | @amcharts/amcharts5/examples/examples.json:852 |
| validate.codes | googlecharts | @types/google.visualization/index.d.ts:563 |
| validate.codes | muix | @mui/x-charts/ChartsYAxis/useAxisTicksProps.d.ts:4087 |
| validate.codes | mermaid | mermaid/dist/utils.d.ts:211 |
| validate.codes | g2 | @antv/g2/lib/api/props.d.ts:2 |
| validate.unknown.keys | recharts | recharts/types/zIndex/getZIndexFromUnknown.d.ts:1 |
| validate.unknown.keys | echarts | echarts/types/src/data/Source.d.ts:37 |
| validate.unknown.keys | highcharts | highcharts/highcharts.src.d.ts:1238 |
| validate.unknown.keys | nivo | @nivo/geo/index.d.ts:111 |
| validate.unknown.keys | visx | @visx/scale/lib/types/ScaleConfig.d.ts:16 |
| validate.unknown.keys | plot | @observablehq/plot/src/scales.d.ts:401 |
| validate.unknown.keys | amcharts | @amcharts/amcharts5/.internal/charts/flow/FlowNodes.d.ts:43 |
| validate.unknown.keys | muix | @mui/x-charts/models/sizeMapping.d.ts:62 |
| validate.unknown.keys | mermaid | mermaid/dist/errors.d.ts:1 |
| validate.unknown.keys | g2 | @antv/g2/lib/spec/dataTransform.d.ts:76 |
