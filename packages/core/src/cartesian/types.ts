import type { Bag } from "../glyphs";
import type { SamplingMode } from "../sampling";
import type { ColorScale } from "../color-scale";
import type { LegendBox } from "../legend";
import type { PresetTokens } from "../theme";

export interface Headline {
  label: string;
  value: string;
  compare: string;
  delta: string;
  tone: "positive" | "negative" | "neutral";
}

export interface TipChrome {
  background: string;
  radius?: number;
  shadow: string;
  crosshair: string;
}

export interface AxisBox {
  title?: string;
  count?: number;
  /** First and last label only. */
  ends?: boolean;
  labels: boolean;
  /** Non-default side. Set when the axis extras are mounted. */
  end?: boolean;
  values?: number[];
  rotate?: number;
  titleAt?: string;
  titleSpin?: number;
  skip?: boolean;
  wrapW?: number;
  wrapN?: number;
  rule?: { on: boolean; color?: string; width?: number; dash?: string };
  tick?: string;
  tickLen?: number;
  offset?: number;
  crosses?: number;
  minor?: number;
  breaks?: { from: number; to: number }[];
}

export interface Pad {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PlotBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface AxisHooks {
  prepare(spec: Record<string, unknown>, shell: ChartShell): void;
  /** Vertical grid for `axes.x.grid`. Labels and padding use the shared axis routine. */
  grid(model: PlotModel, plot: PlotBox, horizontal: boolean, count: number, xScale: XScale): string | null;
  seriesName(model: PlotModel, series: Series): string | null;
}

export type TotalHook = (
  model: PlotModel,
  layers: Layers,
  xScale: XScale,
  yScale: (value: number) => number,
  horizontal: boolean,
  held: Bag,
) => string;

export type MarkDraw = (
  model: PlotModel,
  xScale: XScale,
  yScale: (value: number) => number,
  y2Scale: (value: number) => number,
  plot: { left: number; top: number; right: number; bottom: number },
  horizontal: boolean,
) => string;

export type ColorScaleReader = (channel: unknown, preset: PresetTokens, values: ArrayLike<number>, fallback: boolean) => ColorScale | null;

export interface Series {
  name: string;
  values: ArrayLike<number | null>;
  color: string;
  /** One fill per bar when encoding.color names the x field. */
  colors?: string[];
  /** Caption of the colour rule that painted each value. Empty when that point has no label. */
  ruleLabels?: string[];
  /** Legend text when mark.baseLabel folds the unmatched colour into this series. */
  legendName?: string;
  /** Point is an outline in the rule colour, so it can share that legend entry with the bars. */
  ruleHollow?: boolean[];
  axis: "y" | "y2";
  mark: "line" | "bar" | "area" | "range";
  /** Low and high of a combo range band. The line entry never fills this. */
  span?: { lo: ArrayLike<number | null>; hi: ArrayLike<number | null> };
  /** Fill opacity of a combo range band. The line entry never reads this. */
  bandOpacity?: number;
  dash: string;
  area: boolean;
  /** Area or bar fill opacity. Omit to use the chart mark. */
  fillOpacity?: number;
  shape?: string;
  radius?: number;
  hollow?: boolean;
  format?: unknown;
  /** encoding.y[].stack. Series that share it, on the same axis, stack. A name used once does not. */
  stackId?: string;
  /** Higher paints later. Stacked series ignore it. */
  z?: number;
}

export interface PlotModel {
  type: string;
  title?: string;
  subtitle?: string;
  alt: string;
  locale: string;
  /** IANA zone for temporal ticks. UTC when the spec omits timezone. */
  zone: string;
  width: number;
  height: number;
  responsive: boolean;
  labels: string[];
  x: ArrayLike<number | null> | null;
  series: Series[];
  curve: Curve;
  sampling: SamplingMode;
  /** Marks paint on a canvas overlay. Chrome stays in this SVG. */
  canvas?: boolean;
  stack: "none" | "stack" | "percent";
  /** Per-series stack groups. Null when every group has a single member. */
  layers: Layers | null;
  /** Bar slot for each series. Members of one stack group share a slot. */
  barSlot: number[];
  /** How many bar slots the category band is split into. */
  barSlots: number;
  orientation: "vertical" | "horizontal";
  fillOpacity: number;
  /** Emitted fill-opacity. A var() when the spec did not set mark.fillOpacity. */
  fillPaint: string;
  strokeWidth: number;
  /** Emitted stroke-width. A var() when the spec did not set mark.strokeWidth. */
  strokePaint: string;
  gradient: boolean;
  /** Blurred understroke. The filter is omitted unless this is set. */
  glow: boolean;
  /** Colour-rule swatches. A bar rule uses the bar fill. Shown when the legend is. */
  ruleLegend?: { name: string; color: string; symbol?: "circle" | "square" }[];
  points: "none" | "hover" | "always";
  /** off omits circles. hidden keeps them so --ck-line-dots can show them. shown uses inline. */
  dots: "off" | "hidden" | "shown";
  pointSize: number;
  connectNulls: boolean;
  cornerRadius: number;
  /** When true, bar radius is var(--ck-bar-radius), outer end only. */
  radiusVar: boolean;
  /** Pixel gap between stacked segments. */
  stackGap: number;
  /** outer rounds the end away from the baseline. all rounds every corner. */
  radiusEnds: "outer" | "all";
  /** Dash applied to the last segment only. */
  partial: "" | "dashed" | "dotted";
  /** Fill opacity of the last area segment. Omit to keep one fill. */
  partialOpacity?: number;
  headline?: Headline;
  tip?: TipChrome;
  gap: number;
  labelsOn: boolean;
  pointShape: string;
  pointHollow: boolean;
  labelAt: string;
  labelEnds: string;
  labelFormat: unknown;
  stackTotal: boolean;
  /** Data labels drawn after the plot clip so they are not cut off. */
  late: string;
  showX: boolean;
  showY: boolean;
  showY2: boolean;
  yGrid: false | "solid" | "dashed" | "dotted";
  legend: boolean;
  /** Spec asked for a legend. A one-series chart can still hide the series key. */
  legendOn: boolean;
  legendBox: LegendBox | null;
  exportMark: string;
  colorScale: ColorScale | null;
  swatches?: { name: string; color: string }[];
  zero: boolean;
  preset: PresetTokens;
  id: string;
  xTemporal: boolean;
  xFormat: unknown;
  yFormat: unknown;
  y2Format: unknown;
  yLog: boolean;
  y2Log: boolean;
  ySym: boolean;
  y2Sym: boolean;
  symC: number;
  symC2: number;
  /** Pixel spans of axis breaks, filled while the scales are built. */
  ySpans?: Array<[number, number]>;
  y2Spans?: Array<[number, number]>;
  xSpans?: Array<[number, number]>;
  notes: unknown;
  bands?: { x?: unknown; y?: unknown; y2?: unknown };
  xAxis: AxisBox;
  yAxis: AxisBox;
  y2Axis: AxisBox;
  inset: { t?: number; r?: number; b?: number; l?: number };
  description?: string;
  intent?: string;
  /** Scale bits set by the axis extra. 0 keeps the classic scale. */
  f: number;
  /** Right-to-left: title on the right. The axis extra mirrors x and parks y on the right. */
  rtl?: boolean;
  /** Extra room on a quantitative x, as fractions of the span. */
  xPad?: { min: number; max: number } | null;
  /** Categorical line points sit on the plot edges. `scale.padding: 0`. Bars stay in bands. */
  xEdge?: boolean;
  xClamp?: boolean;
  lv?: boolean;
  gx?: false | "solid" | "dashed" | "dotted";
}

export type Curve = "linear" | "monotone" | "step" | "step-before" | "step-after";

export interface ChartShell {
  /** Non-data spec contents. In-place edits change it; replacing `data` does not. */
  stamp: string;
  type: string;
  preset: PresetTokens;
  channels: YChannel[];
  xField?: string;
  xIsTemporal: boolean;
  continuousX: boolean;
  curve: Curve;
  sampling: SamplingMode;
  stack: PlotModel["stack"];
  width: number;
  height: number;
  responsive: boolean;
  alt: string;
  locale: string;
  zone: string;
  id: string;
  title?: string;
  subtitle?: string;
  orientation: PlotModel["orientation"];
  fillOpacity: number;
  fillPaint: string;
  strokeWidth: number;
  strokePaint: string;
  gradient: boolean;
  glow: boolean;
  points: PlotModel["points"];
  dots: PlotModel["dots"];
  pointSize: number;
  connectNulls: boolean;
  cornerRadius: number;
  radiusVar: boolean;
  stackGap: number;
  radiusEnds: "outer" | "all";
  partial: "" | "dashed" | "dotted";
  partialOpacity?: number;
  headline?: Headline;
  tip?: TipChrome;
  gap: number;
  labelsOn: boolean;
  pointShape: string;
  pointHollow: boolean;
  labelAt: string;
  labelEnds: string;
  labelFormat: unknown;
  stackTotal: boolean;
  late: string;
  showX: boolean;
  showY: boolean;
  showY2: boolean;
  legendOn: boolean;
  legendBox: LegendBox | null;
  exportMark: string;
  swatches?: { name: string; color: string }[];
  yGrid: PlotModel["yGrid"];
  xFormat: unknown;
  yFormat: unknown;
  y2Format: unknown;
  yLog: boolean;
  y2Log: boolean;
  ySym: boolean;
  y2Sym: boolean;
  symC: number;
  symC2: number;
  xAxis: AxisBox;
  yAxis: AxisBox;
  y2Axis: AxisBox;
  inset: { t?: number; r?: number; b?: number; l?: number };
  description?: string;
  intent?: string;
  /** Scale bits set by the axis extra. 0 keeps the classic scale. */
  f: number;
  rtl?: boolean;
  lv?: boolean;
  gx?: false | "solid" | "dashed" | "dotted";
}

export interface Lab {
  x: number;
  y: number;
  anchor: string;
  text: string;
  ink?: string;
}

export interface Pt {
  x: number;
  y: number;
}

export interface Layers {
  top: number[][];
  bottom: number[][];
  /** Series that share a stack group with at least one other series. */
  on: boolean[];
  /** Last member of its group. An unstacked series is its own crest. */
  crest: boolean[];
  /** Every non-range series is in one group, so sampling can share the top. */
  uniform: boolean;
}

export interface XScale {
  center(index: number): number;
  band(index: number): { start: number; size: number };
  at(value: number): number;
  min: number;
  max: number;
  /** False when x had no finite value and min/max are the 0..1 fallback. */
  live: boolean;
}

export type DomainLock = [number | null, number | null] | null;

export interface YChannel {
  field?: string;
  title?: string;
  color?: string;
  axis: "y" | "y2";
  mark?: string;
  dash: string;
  area: boolean;
  log: boolean;
  sym: boolean;
  symC: number;
  z?: number;
  format?: unknown;
  pointShape: string;
  pointSize?: number;
  pointHollow: boolean;
  stack?: string;
  fillOpacity?: number;
  lock?: [number | null, number | null];
  pad?: { min: number; max: number } | null;
  clamp?: boolean;
}
