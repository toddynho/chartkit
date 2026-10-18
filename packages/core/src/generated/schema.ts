/* eslint-disable */
/**
 * Generated from schema/chartkit.schema.json by json-schema-to-typescript.
 * Do not edit by hand. Run `npm run generate:types` from packages/core.
 */

/**
 * A complete, framework-agnostic description of one chart. The same JSON renders in React, Vue, Svelte, vanilla JS, web components, on the server (SVG/PNG), and through the ChartKit MCP server. Minimal line chart: {version, type, data, encoding:{x,y}, a11y:{alt}}. Everything else has sensible defaults.
 */
export type ChartKitChartSpecV1 = {
  [k: string]: unknown;
} & {
  /**
   * Schema URL. Lets editors and agents autocomplete and validate.
   */
  $schema?: "https://chartkit.dev/schema/v1.json";
  /**
   * Spec major version. Always '1' for this schema.
   */
  version: "1";
  /**
   * Chart type. Put it in type, never in mark (mark is an options object). 'line': Lines over a continuous x (usually time). One or more y fields. Replaces LineChart. 'bar': Bars per category (x). Grouped or stacked; vertical or horizontal. Replaces BarChart. 'donut': Parts of a whole. x = slice category, y = slice value; not theta or angle. mark.innerRadius 0 gives a pie. Replaces DonutChart. 'stacked-area': Stacked areas over time; each y field (or each series value) is a layer. Replaces StackedArea. 'scatter': Points by two quantitative fields; optional size (bubble) and color (category). Replaces ScatterChart. 'combo': Mixed bar/line/area series sharing x, with optional second y axis. Each y item sets its own mark. Replaces ComboChart. 'heatmap': Color-encoded cells. encoding.y present and mark.layout omitted means grid (x by y). mark.layout 'calendar' = date x by weekday; 'grid' = x by y matrix. Replaces Heatmap. 'gauge': Single value on a semicircular scale with optional bands and target. Uses metric, not top-level value/min/max. Replaces GaugeChart. 'kpi': Metric card: metric.label, metric.value, metric.delta, optional sparkline from data. Replaces KpiCard. 'sparkline': Tiny axis-less trend line. data may be a plain number array. Replaces Sparkline. 'mini-area': Tiny axis-less filled area. data may be a plain number array. Replaces MiniArea. 'progress-ring': Circular progress for a single value between metric.min and metric.max. Replaces ProgressRing. 'spike': Event/spike chart: thin vertical spikes from a baseline over time. Replaces SpikeChart. 'candlestick': Financial OHLC candles; requires x, open, high, low, close; optional volume. Replaces CandlestickChart.
   */
  type:
    | "line"
    | "bar"
    | "donut"
    | "stacked-area"
    | "scatter"
    | "combo"
    | "heatmap"
    | "gauge"
    | "kpi"
    | "sparkline"
    | "mini-area"
    | "progress-ring"
    | "spike"
    | "candlestick";
  /**
   * Optional stable id (used for keys, events, test hooks).
   */
  id?: string;
  /**
   * Visible chart title; also the accessible name.
   */
  title?: string;
  /**
   * Visible secondary line under the title.
   */
  subtitle?: string;
  data?: Data;
  encoding?: Encoding;
  metric?: Metric;
  mark?: Mark;
  axes?: Axes;
  legend?: Legend;
  tooltip?: Tooltip;
  /**
   * Reference rules, bands and text notes.
   */
  annotations?: Annotation[];
  theme?: Theme;
  size?: Size;
  interaction?: Interaction;
  animation?: Animation;
  /**
   * BCP 47 locale for number/date formatting. Default: the host's locale.
   */
  locale?: string;
  a11y: A11Y;
};
/**
 * The data to plot. A plain array of row objects, not { values: [...] }. Sparkline, mini-area, and spike also accept a plain number array (x becomes the index). A columnar object { columns: { field: [...] } } is accepted for large data and maps directly to typed arrays.
 */
export type Data =
  | {
      [k: string]: number | string | boolean | null;
    }[]
  | (number | null)[]
  | {
      /**
       * Map of field name to values.
       */
      columns: {
        [k: string]: (number | string | boolean | null)[];
      };
    };
/**
 * Name of a column in data (row key or columns key). Case-sensitive.
 */
export type FieldName = string;
/**
 * How values are displayed in axes, tooltips and labels. A preset string, or an object for fine control. Formatting uses Intl with the spec 'locale'.
 */
export type Format =
  | (
      | "number"
      | "integer"
      | "compact"
      | "percent"
      | "percent-raw"
      | "currency"
      | "bytes"
      | "duration-ms"
      | "date"
      | "time"
      | "datetime"
      | "month"
      | "year"
      | "weekday"
    )
  | FormatObject;
/**
 * A y series. Shorthand: a plain string is the field name.
 */
export type YChannel =
  | FieldName
  | {
      field: FieldName;
      /**
       * Measurement type of the field. Inferred from data if omitted: numbers→quantitative, ISO date strings/epoch ms on x→temporal, other strings→nominal.
       */
      type?: "quantitative" | "temporal" | "ordinal" | "nominal";
      /**
       * Human-readable name used in axes, legend and tooltip. Defaults to the field name.
       */
      title?: string;
      format?: Format;
      scale?: Scale;
      /**
       * Mark for this series. Only used by type 'combo' (default 'line').
       */
      mark?: "line" | "bar" | "area";
      /**
       * Which y axis this series uses. The string "y" or "y2", not an axis object. 'y2' draws a second axis on the right. Put titles in axes.y.title or axes.y2.title.
       */
      axis?: "y" | "y2";
      color?: Color;
      /**
       * Line style.
       */
      dash?: "solid" | "dashed" | "dotted";
      /**
       * Fill under this line (line/combo).
       */
      area?: boolean;
    };
/**
 * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
 */
export type Color = string;
/**
 * Legend. true/false or settings. Default: shown when there is more than one series (or for donut).
 */
export type Legend =
  | boolean
  | {
      /**
       * Show the legend.
       */
      show?: boolean;
      /**
       * Placement.
       */
      position?: "top" | "right" | "bottom" | "left";
      /**
       * Click a legend item to hide/show its series.
       */
      interactive?: boolean;
      /**
       * Show each series' value (last, or slice value for donut) next to its name.
       */
      values?: boolean;
    };
/**
 * Hover tooltip. true/false or settings. Default on for interactive charts.
 */
export type Tooltip =
  | boolean
  | {
      /**
       * Show the tooltip.
       */
      show?: boolean;
      /**
       * 'index' shows all series at the hovered x; 'nearest' shows the closest point only.
       */
      mode?: "index" | "nearest";
      /**
       * Draw a vertical guide line at the hovered x.
       */
      crosshair?: boolean;
      /**
       * Extra or reordered fields to show. Strings are field names.
       */
      fields?: (
        | FieldName
        | {
            field: FieldName;
            /**
             * Label shown.
             */
            title?: string;
            format?: Format;
          }
      )[];
    };
/**
 * A reference mark drawn on the chart.
 */
export type Annotation =
  | {
      type: "rule";
      /**
       * Axis the value is on.
       */
      axis: "x" | "y" | "y2";
      /**
       * Position in data units (number, or date/category string on x).
       */
      value: number | string;
      /**
       * Line style.
       */
      dash?: "solid" | "dashed" | "dotted";
      /**
       * Where along the line the label sits.
       */
      labelPosition?: "start" | "center" | "end";
      /**
       * Text shown with the annotation.
       */
      label?: string;
      color?: Color;
    }
  | {
      type: "band";
      /**
       * Axis the range is on.
       */
      axis: "x" | "y" | "y2";
      /**
       * Start of range.
       */
      from: number | string;
      /**
       * End of range.
       */
      to: number | string;
      /**
       * Fill opacity 0–1.
       */
      opacity?: number;
      /**
       * Text shown with the annotation.
       */
      label?: string;
      color?: Color;
    }
  | {
      type: "text";
      /**
       * x position in data units.
       */
      x: number | string;
      /**
       * y position in data units. Omit to pin to the top of the plot.
       */
      y?: number;
      /**
       * Text shown with the annotation.
       */
      label: string;
      color?: Color;
    };
/**
 * Look and feel. A preset name, or an object combining a preset, a light/dark mode and token overrides. Every token is also read from CSS variables --ck-<token> (and --ck-series-N) on the container, so host design systems (e.g. shadcn --chart-1..5) can theme charts with no JS. Default 'auto' is Soft: light-dark colours, transparent plot. Set --ck-background for the optional #f5f5f7 card.
 */
export type Theme =
  | (
      | "auto"
      | "soft"
      | "refined"
      | "editorial"
      | "midnight"
      | "emerald"
      | "mono"
      | "slate"
      | "arctic"
      | "orchid"
      | "obsidian"
      | "neon"
      | "mocha"
      | "owl"
      | "retro"
      | "copper"
      | "rose"
      | "sunset"
      | "silver"
      | "pearl"
      | "latte"
    )
  | {
      /**
       * Base preset.
       */
      preset?:
        | "auto"
        | "soft"
        | "refined"
        | "editorial"
        | "midnight"
        | "emerald"
        | "mono"
        | "slate"
        | "arctic"
        | "orchid"
        | "obsidian"
        | "neon"
        | "mocha"
        | "owl"
        | "retro"
        | "copper"
        | "rose"
        | "sunset"
        | "silver"
        | "pearl"
        | "latte";
      /**
       * Force light or dark, or follow prefers-color-scheme.
       */
      mode?: "auto" | "light" | "dark";
      /**
       * Override individual tokens.
       */
      tokens?: {
        /**
         * Chart background. CSS value or var(--x).
         */
        background?: string;
        /**
         * Card/tooltip background. CSS value or var(--x).
         */
        surface?: string;
        /**
         * Primary text. CSS value or var(--x).
         */
        text?: string;
        /**
         * Secondary text, tick labels. CSS value or var(--x).
         */
        muted?: string;
        /**
         * Grid lines. CSS value or var(--x).
         */
        grid?: string;
        /**
         * Axis lines. CSS value or var(--x).
         */
        axis?: string;
        /**
         * Highlight color (single-series default). CSS value or var(--x).
         */
        accent?: string;
        /**
         * Good/up color (deltas, up candles). CSS value or var(--x).
         */
        positive?: string;
        /**
         * Bad/down color. CSS value or var(--x).
         */
        negative?: string;
        /**
         * CSS font-family.
         */
        fontFamily?: string;
        /**
         * Base font size in px.
         */
        fontSize?: number;
        /**
         * Categorical series palette in order. CSS colors or var(--x). Default: var(--ck-series-1..12) falling back to the preset.
         *
         * @minItems 1
         * @maxItems 24
         */
        series?: [Color, ...Color[]];
      };
    };
/**
 * Entry/update animation. Always disabled when the user prefers reduced motion.
 */
export type Animation =
  | boolean
  | {
      /**
       * Milliseconds.
       */
      duration?: number;
      /**
       * Easing curve.
       */
      easing?: "linear" | "ease-out" | "ease-in-out" | "spring";
    };

/**
 * Which data fields drive which visual channels. Same names for every chart type: x is the category or time axis, y is the measured value(s). Donut uses x (slice label) and y (slice value), not theta, angle, or label. A y series axis is the string "y" or "y2". Switching 'type' between line/bar/donut/stacked-area/combo needs no re-encoding.
 */
export interface Encoding {
  /**
   * Horizontal position: time or category. For donut, the slice category. For heatmap calendar, the date. For bar with mark.orientation 'horizontal', it is still the category (drawn vertically).
   */
  x?:
    | FieldName
    | {
        field: FieldName;
        /**
         * Measurement type of the field. Inferred from data if omitted: numbers→quantitative, ISO date strings/epoch ms on x→temporal, other strings→nominal.
         */
        type?: "quantitative" | "temporal" | "ordinal" | "nominal";
        /**
         * Human-readable name used in axes, legend and tooltip. Defaults to the field name.
         */
        title?: string;
        format?: Format;
        scale?: Scale;
      };
  /**
   * Measured value(s). One field, or a list of fields for multi-series 'wide' data (one column per series). For heatmap 'grid' layout, the row category.
   */
  y?: YChannel | [YChannel, ...YChannel[]];
  /**
   * Split 'long' data into series by the values of this field (e.g. region). Alternative to listing several y fields. Do not combine with a y array.
   */
  series?:
    | FieldName
    | {
        field: FieldName;
        /**
         * Measurement type of the field. Inferred from data if omitted: numbers→quantitative, ISO date strings/epoch ms on x→temporal, other strings→nominal.
         */
        type?: "quantitative" | "temporal" | "ordinal" | "nominal";
        /**
         * Human-readable name used in axes, legend and tooltip. Defaults to the field name.
         */
        title?: string;
        format?: Format;
        scale?: Scale;
      };
  /**
   * Color by field or a constant. Heatmap: the value field. Scatter: category field. Defaults to series/theme palette.
   */
  color?:
    | FieldName
    | {
        field: FieldName;
        /**
         * Measurement type of the field. Inferred from data if omitted: numbers→quantitative, ISO date strings/epoch ms on x→temporal, other strings→nominal.
         */
        type?: "quantitative" | "temporal" | "ordinal" | "nominal";
        /**
         * Human-readable name used in axes, legend and tooltip. Defaults to the field name.
         */
        title?: string;
        format?: Format;
        scale?: Scale;
        /**
         * Colors to use, in order (categorical) or low→high (sequential).
         *
         * @minItems 2
         */
        range?: [Color, Color, ...Color[]];
      }
    | {
        value: Color;
      };
  /**
   * Scatter only: bubble size field.
   */
  size?:
    | FieldName
    | {
        field: FieldName;
        /**
         * Measurement type of the field. Inferred from data if omitted: numbers→quantitative, ISO date strings/epoch ms on x→temporal, other strings→nominal.
         */
        type?: "quantitative" | "temporal" | "ordinal" | "nominal";
        /**
         * Human-readable name used in axes, legend and tooltip. Defaults to the field name.
         */
        title?: string;
        format?: Format;
        scale?: Scale;
        /**
         * [min, max] point radius in px.
         *
         * @minItems 2
         * @maxItems 2
         */
        range?: [number, number];
      };
  /**
   * Candlestick only: opening price field.
   */
  open?:
    | FieldName
    | {
        field: FieldName;
        /**
         * Measurement type of the field. Inferred from data if omitted: numbers→quantitative, ISO date strings/epoch ms on x→temporal, other strings→nominal.
         */
        type?: "quantitative" | "temporal" | "ordinal" | "nominal";
        /**
         * Human-readable name used in axes, legend and tooltip. Defaults to the field name.
         */
        title?: string;
        format?: Format;
        scale?: Scale;
      };
  /**
   * Candlestick only: high price field.
   */
  high?:
    | FieldName
    | {
        field: FieldName;
        /**
         * Measurement type of the field. Inferred from data if omitted: numbers→quantitative, ISO date strings/epoch ms on x→temporal, other strings→nominal.
         */
        type?: "quantitative" | "temporal" | "ordinal" | "nominal";
        /**
         * Human-readable name used in axes, legend and tooltip. Defaults to the field name.
         */
        title?: string;
        format?: Format;
        scale?: Scale;
      };
  /**
   * Candlestick only: low price field.
   */
  low?:
    | FieldName
    | {
        field: FieldName;
        /**
         * Measurement type of the field. Inferred from data if omitted: numbers→quantitative, ISO date strings/epoch ms on x→temporal, other strings→nominal.
         */
        type?: "quantitative" | "temporal" | "ordinal" | "nominal";
        /**
         * Human-readable name used in axes, legend and tooltip. Defaults to the field name.
         */
        title?: string;
        format?: Format;
        scale?: Scale;
      };
  /**
   * Candlestick only: closing price field.
   */
  close?:
    | FieldName
    | {
        field: FieldName;
        /**
         * Measurement type of the field. Inferred from data if omitted: numbers→quantitative, ISO date strings/epoch ms on x→temporal, other strings→nominal.
         */
        type?: "quantitative" | "temporal" | "ordinal" | "nominal";
        /**
         * Human-readable name used in axes, legend and tooltip. Defaults to the field name.
         */
        title?: string;
        format?: Format;
        scale?: Scale;
      };
  /**
   * Candlestick only: volume field; when present, a volume pane is drawn.
   */
  volume?:
    | FieldName
    | {
        field: FieldName;
        /**
         * Measurement type of the field. Inferred from data if omitted: numbers→quantitative, ISO date strings/epoch ms on x→temporal, other strings→nominal.
         */
        type?: "quantitative" | "temporal" | "ordinal" | "nominal";
        /**
         * Human-readable name used in axes, legend and tooltip. Defaults to the field name.
         */
        title?: string;
        format?: Format;
        scale?: Scale;
      };
}
/**
 * Detailed format.
 */
export interface FormatObject {
  /**
   * Base format style.
   */
  style:
    | "number"
    | "compact"
    | "percent"
    | "percent-raw"
    | "currency"
    | "bytes"
    | "duration-ms"
    | "date"
    | "time"
    | "datetime";
  /**
   * Fixed number of fraction digits.
   */
  decimals?: number;
  /**
   * ISO 4217 code when style is 'currency'.
   */
  currency?: string;
  /**
   * Text placed before the value.
   */
  prefix?: string;
  /**
   * Text placed after the value, e.g. ' req/s'.
   */
  suffix?: string;
  /**
   * Always show + for positive numbers (useful for deltas).
   */
  signed?: boolean;
}
/**
 * How data values map to positions or sizes. Usually inferred; set only to override.
 */
export interface Scale {
  /**
   * Scale type. Inferred from field type: quantitative→linear, temporal→time, nominal/ordinal→band.
   */
  type?: "linear" | "log" | "sqrt" | "time" | "band" | "point";
  /**
   * Explicit [min, max] for continuous scales, or the ordered list of categories for band/point scales. Use null for one side to keep it automatic.
   *
   * @minItems 1
   */
  domain?: [number | string | null, ...(number | string | null)[]];
  /**
   * Force the scale to include zero. Default true for bar/area, false for line/scatter.
   */
  zero?: boolean;
  /**
   * Round the domain to tidy tick values. Default true.
   */
  nice?: boolean;
  /**
   * Flip the direction of the scale.
   */
  reverse?: boolean;
}
/**
 * Single-value content for gauge, progress-ring and kpi. Put value, min, max, delta, and label here, not at the top level of the spec. Kpi may also set data for a sparkline.
 */
export interface Metric {
  /**
   * The current value.
   */
  value: number;
  /**
   * Short visible label, e.g. 'Revenue'.
   */
  label?: string;
  /**
   * Lower bound of the scale (gauge, progress-ring).
   */
  min?: number;
  /**
   * Upper bound of the scale (gauge, progress-ring).
   */
  max?: number;
  /**
   * Target marker value (gauge) or comparison value.
   */
  target?: number;
  /**
   * Change vs previous period, as a fraction (0.125 = +12.5%) unless deltaFormat says otherwise (kpi).
   */
  delta?: number;
  /**
   * How values are displayed in axes, tooltips and labels. A preset string, or an object for fine control. Formatting uses Intl with the spec 'locale'.
   */
  deltaFormat?:
    | (
        | "number"
        | "integer"
        | "compact"
        | "percent"
        | "percent-raw"
        | "currency"
        | "bytes"
        | "duration-ms"
        | "date"
        | "time"
        | "datetime"
        | "month"
        | "year"
        | "weekday"
      )
    | FormatObject;
  /**
   * Which direction of delta is good (sets positive/negative color).
   */
  goodDirection?: "up" | "down";
  /**
   * How values are displayed in axes, tooltips and labels. A preset string, or an object for fine control. Formatting uses Intl with the spec 'locale'.
   */
  format?:
    | (
        | "number"
        | "integer"
        | "compact"
        | "percent"
        | "percent-raw"
        | "currency"
        | "bytes"
        | "duration-ms"
        | "date"
        | "time"
        | "datetime"
        | "month"
        | "year"
        | "weekday"
      )
    | FormatObject;
  /**
   * Colored ranges on the gauge, e.g. good/warn/bad.
   */
  bands?: {
    /**
     * Start value.
     */
    from: number;
    /**
     * End value.
     */
    to: number;
    color?: Color;
    /**
     * Band label.
     */
    label?: string;
  }[];
}
/**
 * Visual options for the marks. An object, not the chart type (the type goes in type). Each option lists the types it applies to; options that do not apply to the chosen type are ignored with warning CK3010.
 */
export interface Mark {
  /**
   * Line interpolation. Applies to: line, stacked-area, combo, sparkline, mini-area.
   */
  curve?: "linear" | "monotone" | "step" | "step-before" | "step-after";
  /**
   * Downsample the path when a series is longer than twice the plot width in pixels. 'auto' and 'minmax' keep the minimum and maximum original point in each pixel bucket (spikes stay). 'lttb' is largest-triangle-three-buckets and also keeps original points. 'none' draws every point. Applies to: line, stacked-area, combo (line and area series only), sparkline, mini-area, spike. Scatter, candlestick, bar, donut, heatmap, gauge, kpi, and progress-ring ignore it (CK3010). Axis extents and a11y.alt always use the full series. Hover vertices map back to those original indexes.
   */
  sampling?: "auto" | "none" | "lttb" | "minmax";
  /**
   * Show point markers on lines. Applies to: line, combo.
   */
  points?: "none" | "hover" | "always";
  /**
   * Point radius in px. Applies to: line, combo, scatter.
   */
  pointSize?: number;
  /**
   * Fill under every line. Applies to: line, sparkline.
   */
  area?: boolean;
  /**
   * Area/bar fill opacity, 0–1. Applies to: line, stacked-area, combo, mini-area, bar.
   */
  fillOpacity?: number;
  /**
   * Fade area fills toward the baseline. Applies to: line, stacked-area, mini-area, sparkline.
   */
  gradient?: boolean;
  /**
   * Line width in px. Applies to: line, stacked-area, combo, sparkline, mini-area, spike, progress-ring, gauge (arc width).
   */
  strokeWidth?: number;
  /**
   * Soft glow behind lines (dark themes). Applies to: line, sparkline.
   */
  glow?: boolean;
  /**
   * Draw through missing values instead of leaving gaps. Applies to: line, stacked-area, combo, sparkline, mini-area.
   */
  connectNulls?: boolean;
  /**
   * Stacking for multiple series. 'percent' normalises each x to 100%. Applies to: bar, stacked-area (default 'stack'), combo bars.
   */
  stack?: "none" | "stack" | "percent";
  /**
   * Bar direction. Applies to: bar.
   */
  orientation?: "vertical" | "horizontal";
  /**
   * Rounded corners in px. Applies to: bar, donut, heatmap.
   */
  cornerRadius?: number;
  /**
   * Spacing between bars/cells as a 0–1 fraction of the band. Applies to: bar, combo, heatmap, candlestick.
   */
  gap?: number;
  /**
   * Draw value labels on bars/slices. Applies to: bar, donut.
   */
  labels?: boolean;
  /**
   * Hole size as a 0–0.95 fraction of the radius; 0 = pie. Applies to: donut.
   */
  innerRadius?: number;
  /**
   * Gap between slices in degrees. Applies to: donut.
   */
  padAngle?: number;
  /**
   * Mark opacity 0–1. Applies to: scatter, spike.
   */
  opacity?: number;
  /**
   * Heatmap layout. Omit it when encoding.y is set: the renderer uses grid. 'calendar' = weeks by weekdays from a date x (also the fallback when y is absent). 'grid' = x by y categories. Applies to: heatmap.
   */
  layout?: "calendar" | "grid";
  /**
   * Number of weeks shown in calendar layout. Applies to: heatmap.
   */
  weeks?: number;
  /**
   * Arc start in degrees (0 = top, clockwise). Applies to: gauge, progress-ring.
   */
  startAngle?: number;
  /**
   * Arc end in degrees. Applies to: gauge, progress-ring.
   */
  endAngle?: number;
  /**
   * Arc end style. Applies to: gauge, progress-ring.
   */
  linecap?: "butt" | "round" | "square";
  /**
   * Value spikes rise from. Applies to: spike.
   */
  baseline?: number;
}
/**
 * Axis display. Scale domains live on encoding.<channel>.scale; this block is display-only.
 */
export interface Axes {
  /**
   * Axis options. Set to false to hide the axis.
   */
  x?:
    | boolean
    | {
        /**
         * Axis title. Defaults to the channel title (none for time axes).
         */
        title?: string;
        /**
         * How values are displayed in axes, tooltips and labels. A preset string, or an object for fine control. Formatting uses Intl with the spec 'locale'.
         */
        format?:
          | (
              | "number"
              | "integer"
              | "compact"
              | "percent"
              | "percent-raw"
              | "currency"
              | "bytes"
              | "duration-ms"
              | "date"
              | "time"
              | "datetime"
              | "month"
              | "year"
              | "weekday"
            )
          | FormatObject;
        /**
         * Approximate number of ticks.
         */
        ticks?: number;
        /**
         * Grid lines from this axis.
         */
        grid?: boolean | ("solid" | "dashed" | "dotted");
        /**
         * Show tick labels.
         */
        labels?: boolean;
        /**
         * Axis side. Defaults: x bottom, y left, y2 right.
         */
        position?: "top" | "bottom" | "left" | "right";
      };
  /**
   * Axis options. Set to false to hide the axis.
   */
  y?:
    | boolean
    | {
        /**
         * Axis title. Defaults to the channel title (none for time axes).
         */
        title?: string;
        /**
         * How values are displayed in axes, tooltips and labels. A preset string, or an object for fine control. Formatting uses Intl with the spec 'locale'.
         */
        format?:
          | (
              | "number"
              | "integer"
              | "compact"
              | "percent"
              | "percent-raw"
              | "currency"
              | "bytes"
              | "duration-ms"
              | "date"
              | "time"
              | "datetime"
              | "month"
              | "year"
              | "weekday"
            )
          | FormatObject;
        /**
         * Approximate number of ticks.
         */
        ticks?: number;
        /**
         * Grid lines from this axis.
         */
        grid?: boolean | ("solid" | "dashed" | "dotted");
        /**
         * Show tick labels.
         */
        labels?: boolean;
        /**
         * Axis side. Defaults: x bottom, y left, y2 right.
         */
        position?: "top" | "bottom" | "left" | "right";
      };
  /**
   * Second (right) y axis, used by y series with axis 'y2'.
   */
  y2?:
    | boolean
    | {
        /**
         * Axis title. Defaults to the channel title (none for time axes).
         */
        title?: string;
        /**
         * How values are displayed in axes, tooltips and labels. A preset string, or an object for fine control. Formatting uses Intl with the spec 'locale'.
         */
        format?:
          | (
              | "number"
              | "integer"
              | "compact"
              | "percent"
              | "percent-raw"
              | "currency"
              | "bytes"
              | "duration-ms"
              | "date"
              | "time"
              | "datetime"
              | "month"
              | "year"
              | "weekday"
            )
          | FormatObject;
        /**
         * Approximate number of ticks.
         */
        ticks?: number;
        /**
         * Grid lines from this axis.
         */
        grid?: boolean | ("solid" | "dashed" | "dotted");
        /**
         * Show tick labels.
         */
        labels?: boolean;
        /**
         * Axis side. Defaults: x bottom, y left, y2 right.
         */
        position?: "top" | "bottom" | "left" | "right";
      };
}
/**
 * Dimensions. Default: fill container width, height by type (line/bar 240px, sparkline 32px, gauge 160px).
 */
export interface Size {
  /**
   * Width in px, or 'auto' to fill the container and follow resizes.
   */
  width?: number | "auto";
  /**
   * Height in px, or 'auto' to derive from width × aspectRatio or the container height.
   */
  height?: number | "auto";
  /**
   * width / height, used when height is 'auto' (e.g. 1.777 for 16:9).
   */
  aspectRatio?: number;
  /**
   * Minimum height in px when responsive.
   */
  minHeight?: number;
  /**
   * Inner padding in px around the plot, a number or per-side object. Default: automatic from axis label sizes.
   */
  padding?:
    | number
    | {
        /**
         * Top padding in px.
         */
        top?: number;
        /**
         * Right padding in px.
         */
        right?: number;
        /**
         * Bottom padding in px.
         */
        bottom?: number;
        /**
         * Left padding in px.
         */
        left?: number;
      };
}
/**
 * What the user can do. Adapters emit events (pointclick, legendtoggle, rangechange) for app code; JSON never contains functions.
 */
export interface Interaction {
  /**
   * Highlight hovered marks and drive the tooltip.
   */
  hover?: boolean;
  /**
   * Click selection emitted as 'pointclick' / 'seriesclick' events.
   */
  select?: "none" | "point" | "series";
  /**
   * Wheel/pinch zoom. Default 'x' for candlestick, otherwise 'none'.
   */
  zoom?: "none" | "x" | "xy";
  /**
   * Drag to pan when zoomed.
   */
  pan?: boolean;
  /**
   * Drag to select a range, emitted as 'rangechange'.
   */
  brush?: "none" | "x";
  /**
   * Initially visible x range [from, to] in data units (zoomable charts).
   *
   * @minItems 2
   * @maxItems 2
   */
  initialRange?: [number | string, number | string];
}
/**
 * Accessibility. 'alt' is required: a one or two sentence description of what the chart shows and its key takeaway, used as the accessible name/description and for text-only renders (agents should always write it).
 */
export interface A11Y {
  /**
   * Short text alternative with the key insight, e.g. 'Revenue rose 18% from Jan to Jun 2026, peaking in May.'
   */
  alt: string;
  /**
   * Longer description (methodology, caveats). Exposed via aria-describedby.
   */
  description?: string;
  /**
   * Arrow-key navigation between points with announcements.
   */
  keyboard?: boolean;
  /**
   * Render a visually hidden data table for screen readers.
   */
  dataTable?: boolean;
}
