// Components
export {
  // Original Chart Components
  Sparkline,
  MiniArea,
  KpiCard,
  MonitorLine,
  SpikeChart,
  BarChart,
  DonutChart,
  StackedArea,
  Heatmap,
  ResponsiveChart,
  // New Chart Components (Phase 2)
  ScatterChart,
  ComboChart,
  ProgressRing,
  ProgressCircle,
  GaugeChart,
  // Utility Components
  Legend,
  Annotations,
  // Types
  type SparklineProps,
  type MiniAreaProps,
  type KpiCardProps,
  type MonitorLineProps,
  type SeriesConfig,
  type SpikeChartProps,
  type BarChartProps,
  type DonutChartProps,
  type StackedAreaProps,
  type HeatmapProps,
  type HeatmapDataPoint,
  type ResponsiveChartProps,
  type ScatterChartProps,
  type ComboChartProps,
  type ComboSeriesConfig,
  type ProgressRingProps,
  type GaugeChartProps,
  type LegendProps,
  type AnnotationsProps,
  // Shared Types
  type DataPointClickEvent,
  type BarClickEvent,
  type SegmentClickEvent,
  type TooltipRenderProps,
  type TooltipRenderer,
  type LegendItem,
  type LegendClickEvent,
  type ReferenceLine,
  type ReferenceArea,
  type Annotation,
} from './components';

// Themes
export { themes, getTheme, type ChartTheme, type ThemeName, type ThemeRegistry } from './themes';

// Utilities
export {
  linearScale,
  inverseLinearScale,
  clamp,
  extent,
  padExtent,
  interpolateY,
  linePath,
  areaPath,
  generateTicks,
  type ScaleFunction,
  type Extent,
  type InterpolatedPoint,
} from './utils';

// Hooks
export {
  useUniqueId,
  useMouseTracking,
  useResizeObserver,
  useContainerWidth,
  useAnimatedMount,
  estimatePathLength,
  type MouseTrackingState,
  type UseMouseTrackingOptions,
  type UseMouseTrackingResult,
  type Size,
  type UseResizeObserverResult,
  type AnimationConfig,
  type UseAnimatedMountResult,
} from './hooks';
