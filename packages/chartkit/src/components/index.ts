// Chart Components
export { Sparkline, type SparklineProps } from './Sparkline';
export { MiniArea, type MiniAreaProps } from './MiniArea';
export { KpiCard, type KpiCardProps } from './KpiCard';
export { LineChart, MonitorLine, type LineChartProps, type SeriesConfig, type YAxisConfig } from './LineChart';
/** @deprecated Use LineChartProps instead */
export type MonitorLineProps<T extends Record<string, unknown>> = import('./LineChart').LineChartProps<T>;
export { SpikeChart, type SpikeChartProps } from './SpikeChart';
export { BarChart, type BarChartProps } from './BarChart';
export { DonutChart, type DonutChartProps } from './DonutChart';
export { StackedArea, type StackedAreaProps } from './StackedArea';
export { Heatmap, type HeatmapProps, type HeatmapDataPoint } from './Heatmap';
export { ResponsiveChart, type ResponsiveChartProps } from './ResponsiveChart';

// New Chart Components (Phase 2)
export { ScatterChart, type ScatterChartProps } from './ScatterChart';
export { ComboChart, type ComboChartProps, type ComboSeriesConfig } from './ComboChart';
export { ProgressRing, ProgressCircle, type ProgressRingProps } from './ProgressRing';
export { GaugeChart, type GaugeChartProps } from './GaugeChart';
export { CandlestickChart, type CandlestickChartProps, type CandlestickDataPoint, type CandlestickTooltipProps } from './CandlestickChart';

// Utility Components
export { Legend, type LegendProps } from './Legend';
export { Annotations, type AnnotationsProps } from './Annotations';

// Shared Types
export type {
  DataPointClickEvent,
  BarClickEvent,
  SegmentClickEvent,
  TooltipRenderProps,
  TooltipRenderer,
  LegendItem,
  LegendClickEvent,
  ReferenceLine,
  ReferenceArea,
  Annotation,
  GridOptions,
  AreaGradientOptions,
} from './types';
