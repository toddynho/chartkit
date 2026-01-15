// Chart Components
export { Sparkline, type SparklineProps } from './Sparkline';
export { MiniArea, type MiniAreaProps } from './MiniArea';
export { KpiCard, type KpiCardProps } from './KpiCard';
export { MonitorLine, type MonitorLineProps, type SeriesConfig } from './MonitorLine';
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
} from './types';
