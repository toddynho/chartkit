/* eslint-disable */
/**
 * Generated from schema/chartkit.schema.json by json-schema-to-typescript.
 * Do not edit by hand. Run `npm run generate:types` from packages/core.
 */

/**
 * A complete, framework-agnostic description of one chart. The same JSON renders in React, Vue, Svelte, and vanilla JS. Minimal line chart: {version, type, data, encoding:{x,y}, a11y:{alt}}. Everything else has sensible defaults.
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
   * Chart type. Put it in type, never in mark (mark is an options object). 'line': Lines over a continuous x (usually time). One or more y fields. Replaces LineChart. 'bar': Bars per category (x). Grouped or stacked; vertical or horizontal. Replaces BarChart. 'donut': Parts of a whole. x = slice category, y = slice value; not theta or angle. Replaces DonutChart. 'pie': The same slices with no hole. mark.startAngle, mark.padAngle, mark.cornerRadius, mark.sort, mark.other, and mark.explode. Outside labels draw leader lines. 'stacked-area': Stacked areas over time; each y field (or each series value) is a layer. Replaces StackedArea. 'scatter': Points by two quantitative fields; optional size (bubble) and color (category). Replaces ScatterChart. 'combo': Mixed bar/line/area series sharing x, with optional second y axis. Each y item sets its own mark. Replaces ComboChart. 'heatmap': Color-encoded cells. encoding.y present and mark.layout omitted means grid (x by y). mark.layout 'calendar' = date x by weekday; 'grid' = x by y matrix. Replaces Heatmap. 'gauge': Single value on a semicircular scale with optional bands and target. Uses metric, not top-level value/min/max. Replaces GaugeChart. 'kpi': Metric card: metric.label, metric.value, metric.delta, optional sparkline from data. Replaces KpiCard. 'sparkline': Tiny axis-less trend line. data may be a plain number array. Replaces Sparkline. 'mini-area': Tiny axis-less filled area. data may be a plain number array. Replaces MiniArea. 'progress-ring': Circular progress for a single value between metric.min and metric.max. Replaces ProgressRing. 'spike': Event/spike chart: thin vertical spikes from a baseline over time. Replaces SpikeChart. 'candlestick': Financial OHLC candles; requires x, open, high, low, close; optional volume. Replaces CandlestickChart. 'histogram': Bins quantitative encoding.x. mark.bins (default 8), mark.binWidth, or mark.bin (count, width, sturges, sqrt, fd). encoding.y, when present, is a pre-binned count. 'boxplot': encoding.x is the category and encoding.y holds the observations. 'radar': encoding.x is the spoke and encoding.y is one field or a list of series. 'funnel': encoding.x is the stage and encoding.y is the value, in data order. 'treemap': encoding.x is the tile, encoding.y is the size, and encoding.color is an optional group. Nested children, encoding.path, or encoding.id with encoding.parent draw nested levels; a flat treemap stays one level. 'sunburst': concentric rings for that same hierarchy. Colour follows the top-level branch. mark.innerRadius is the hole (0.28 when omitted) and mark.depth caps the rings. 'sankey': encoding.source, encoding.target, and encoding.y (the flow). 'bullet': encoding.x is the label, encoding.y the measure, encoding.target the goal. mark.ranges names band fields, worst to best. 'waterfall': encoding.x is the step and encoding.y is the delta. mark.total names a field that marks an absolute total bar. 'area-range': a band between low and high, with an optional centre line from y. Several bands are a y list of {lo, hi}. 'bar-range': a floating bar from low to high per category. 'errorbar': whiskers on a point or a bar, from low and high or from encoding.error as ± around y. A combo y item with mark range and lo/hi draws that band under the other series.
   */
  type:
    | "line"
    | "bar"
    | "donut"
    | "pie"
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
    | "candlestick"
    | "histogram"
    | "boxplot"
    | "radar"
    | "funnel"
    | "treemap"
    | "sankey"
    | "bullet"
    | "waterfall"
    | "area-range"
    | "bar-range"
    | "errorbar"
    | "sunburst";
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
   * Reference rules, bands, text, trendlines, regression fits, and point callouts.
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
  /**
   * IANA time zone for temporal axes, ticks, and tooltips. Omitted means UTC, so a server render and the client label the same instant the same way.
   */
  timezone?: string;
  /**
   * Sort rows before drawing. field sorts by that column. by value sorts categories by the first y field. order is ascending (default) or descending.
   */
  sort?: {
    /**
     * Field to sort by.
     */
    field?: string;
    /**
     * Sort by the first y value. Used for bars.
     */
    by?: "value";
    /**
     * Sort direction. Default ascending.
     */
    order?: "ascending" | "descending";
  };
  /**
   * Row steps applied before sort: filter, a rolling window, or an aggregate.
   */
  transform?: {
    /**
     * filter keeps matching rows. window adds a rolling column. aggregate groups rows.
     */
    type?: "filter" | "window" | "aggregate";
    /**
     * Source field. Required for filter and window, and for sum or mean.
     */
    field?: string;
    /**
     * filter: keep rows whose field equals this.
     */
    eq?: string | number | boolean | null;
    /**
     * filter: keep rows greater than this.
     */
    gt?: number;
    /**
     * filter: keep rows greater than or equal to this.
     */
    gte?: number;
    /**
     * filter: keep rows less than this.
     */
    lt?: number;
    /**
     * filter: keep rows less than or equal to this.
     */
    lte?: number;
    /**
     * window: number of rows in the rolling window, including the current row.
     */
    size?: number;
    /**
     * window defaults to mean. aggregate is sum, mean, or count.
     */
    op?: "mean" | "sum" | "count";
    /**
     * Output field name. window requires it. aggregate defaults to the source field, or count.
     */
    as?: string;
    /**
     * aggregate: field to group by.
     */
    group?: string;
  }[];
  a11y: A11Y;
};
/**
 * The data to plot. A plain array of row objects, not { values: [...] }. Sparkline, mini-area, and spike also accept a plain number array (x becomes the index). A columnar object { columns: { field: [...] } } is accepted for large data and maps directly to typed arrays.
 */
export type Data =
  | {
      [k: string]: number | string | boolean | null | {} | unknown[];
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
      field?: FieldName;
      /**
       * Lower field of a range band. With hi, the series is a band. On a combo, set mark to range so the band sits under the other series.
       */
      lo?: string;
      /**
       * Upper field of a range band.
       */
      hi?: string;
      /**
       * ± field around this series. Half-width. Used by error bars when low and high are omitted.
       */
      error?: string;
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
       * Mark for this series. line, bar, and area are for combo. range draws a lo/hi band under the other combo series. A range series sets lo and hi instead of, or as well as, field.
       */
      mark?: "line" | "bar" | "area" | "range";
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
      /**
       * Marker for this series. Overrides mark.pointShape. Applies to: line, stacked-area, scatter, combo.
       */
      pointShape?: "circle" | "square" | "diamond" | "triangle" | "cross" | "none";
      /**
       * Marker radius in px for this series. Overrides mark.pointSize.
       */
      pointSize?: number;
      /**
       * Filled or hollow marker for this series. Overrides mark.pointFill.
       */
      pointFill?: "filled" | "hollow";
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
       * Placement. inside draws over the plot; pair it with anchor.
       */
      position?: "top" | "right" | "bottom" | "left" | "inside";
      /**
       * Anchor for an inside legend. Setting anchor without position uses inside.
       */
      anchor?:
        "top-left" | "top" | "top-right" | "left" | "center" | "right" | "bottom-left" | "bottom" | "bottom-right";
      /**
       * Alignment of items within the legend block.
       */
      align?: "start" | "center" | "end";
      /**
       * Item flow. Default horizontal on the top and bottom, vertical on the sides.
       */
      orient?: "horizontal" | "vertical";
      /**
       * Maximum visible rows. Further rows page behind the first, with previous and next controls.
       */
      maxRows?: number;
      /**
       * Legend title.
       */
      title?: string;
      /**
       * Series names omitted from the legend. The series still draws.
       */
      hide?: string[];
      /**
       * Marker used for every series unless symbols overrides it.
       */
      symbol?: "circle" | "square" | "diamond" | "triangle" | "line" | "cross";
      /**
       * Per-series legend markers.
       */
      symbols?: {
        /**
         * Series name.
         */
        series?: string;
        /**
         * Marker for that series.
         */
        symbol?: "circle" | "square" | "diamond" | "triangle" | "line" | "cross";
      }[];
      /**
       * Click a legend item to hide/show its series. Off unless set; the SVG records it as data-ck-intent.
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
       * Print the hovered x value on the guide.
       */
      crosshairLabel?: boolean;
      /**
       * Where the card sits. auto tries above, then below, then beside the point.
       */
      position?: "auto" | "top" | "bottom" | "left" | "right";
      /**
       * Fields to show, in this order. Omit to keep the encoded series. Strings are field names.
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
    }
  | {
      type: "trendline";
      /**
       * mean and median are horizontal lines. linear is a least-squares fit.
       */
      method: "mean" | "median" | "linear";
      /**
       * Series axis the statistic is taken from.
       */
      axis?: "y" | "y2";
      /**
       * Series name. Defaults to the first series on the axis.
       */
      series?: string;
      /**
       * Line style. Mean and median default to dashed; linear defaults to solid.
       */
      dash?: "solid" | "dashed" | "dotted";
      /**
       * Text at the end of the line. Defaults to Mean, Median, or Linear.
       */
      label?: string;
      color?: Color;
    }
  | {
      type: "regression";
      /**
       * linear is least squares. loess is a local weighted fit.
       */
      method: "linear" | "loess";
      /**
       * Shade a 95% confidence band around the fit.
       */
      band?: boolean;
      /**
       * Loess window as a fraction of the points. Ignored for linear.
       */
      bandwidth?: number;
      /**
       * Series axis the fit is taken from.
       */
      axis?: "y" | "y2";
      /**
       * Series name. Defaults to the first series on the axis.
       */
      series?: string;
      /**
       * Text at the end of the fit. Defaults to Linear fit or Loess.
       */
      label?: string;
      color?: Color;
    }
  | {
      type: "marker";
      /**
       * x position in data units, or a category.
       */
      x: number | string;
      /**
       * y position in data units. Omit to use the series value at x.
       */
      y?: number;
      /**
       * Text in the callout box.
       */
      label: string;
      /**
       * Horizontal offset of the text box, in pixels.
       */
      dx?: number;
      /**
       * Vertical offset of the text box, in pixels. Negative is up.
       */
      dy?: number;
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
        scale?: ColorScale;
        /**
         * Colors to use, in order (categorical) or low→high (sequential). Two or more colours replace a named scheme.
         *
         * @minItems 2
         */
        range?: [Color, Color, ...Color[]];
        /**
         * Category values in the same order as range. A value that is not listed takes the next palette colour.
         *
         * @minItems 1
         */
        domain?: [string, ...string[]];
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
   * Upper value. Candlestick: the high price. Area range, floating bar, and error bar: the top of the band or whisker.
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
   * Lower value. Candlestick: the low price. Area range, floating bar, and error bar: the bottom of the band or whisker.
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
  /**
   * Sankey only: the node the flow leaves.
   */
  source?:
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
   * Sankey: the node the flow enters. Bullet: the target value field.
   */
  target?:
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
   * Error bar only: symmetric ± around y. The field is the half-width. encoding.low and encoding.high override it.
   */
  error?:
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
   * Treemap and sunburst: field names from the root down to the leaf, for flat rows. A parent with no value is the sum of its leaves.
   *
   * @minItems 1
   * @maxItems 8
   */
  path?:
    | [string]
    | [string, string]
    | [string, string, string]
    | [string, string, string, string]
    | [string, string, string, string, string]
    | [string, string, string, string, string, string]
    | [string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string];
  /**
   * Treemap and sunburst: the node id field. Pair it with encoding.parent.
   */
  id?: string;
  /**
   * Treemap and sunburst: the parent id field. An empty parent is a root. On a treemap with no encoding.id, a legacy parent field still repairs to encoding.color.
   */
  parent?: string;
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
 * Colour scale. Sequential and diverging are continuous; quantize and threshold are binned.
 */
export interface ColorScale {
  /**
   * Position types match the shared scale. sequential, diverging, quantize, and threshold are colour-only and are not valid on x or y.
   */
  type?: "linear" | "log" | "sqrt" | "time" | "band" | "point" | "sequential" | "diverging" | "quantize" | "threshold";
  /**
   * Explicit [min, max] for a continuous colour scale.
   *
   * @minItems 1
   */
  domain?: [number | string | null, ...(number | string | null)[]];
  /**
   * Force the scale to include zero.
   */
  zero?: boolean;
  /**
   * Round the domain to tidy values.
   */
  nice?: boolean;
  /**
   * Flip the direction of the scale.
   */
  reverse?: boolean;
  /**
   * Diverging midpoint. Default is the middle of the domain.
   */
  midpoint?: number;
  /**
   * Named colour-blind-safe ramp. blue is the default. A range of two or more colours replaces it. Midnight uses a brighter ramp of the same name.
   */
  scheme?: "blue" | "teal" | "orange" | "violet";
  /**
   * Equal-width bins for quantize. Default 5.
   */
  bins?: number;
  /**
   * Cut points for threshold. Colours are one more than the number of cuts. The legend labels the cuts, for example <6, 6–12, ≥12, not the data ends.
   */
  thresholds?: number[];
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
   * Line interpolation. monotone is monotone-x and stays inside the data, so a spike does not cross the low point or pass the peak. smooth, spline, and basis repair to monotone. Applies to: line, stacked-area, combo, sparkline, mini-area.
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
   * Point radius in px. Applies to: line, stacked-area, combo, scatter, errorbar.
   */
  pointSize?: number;
  /**
   * Point marker. circle, square, diamond, triangle, cross, or none. A y series may override it. Applies to: line, stacked-area, scatter, combo. Drawn on createRenderer([line]).
   */
  pointShape?: "circle" | "square" | "diamond" | "triangle" | "cross" | "none";
  /**
   * Filled or hollow markers. Applies to: line, stacked-area, scatter, combo.
   */
  pointFill?: "filled" | "hollow";
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
   * Soft glow behind the line. A blurred understroke and one filter, emitted only when true, on Soft and on midnight. Applies to: line, sparkline.
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
   * Rounded corners in px. Applies to: bar, donut, pie, heatmap.
   */
  cornerRadius?: number;
  /**
   * Spacing between bars/cells as a 0–1 fraction of the band. Applies to: bar, combo, heatmap, candlestick.
   */
  gap?: number;
  /**
   * Draw value labels on the marks. Applies to: bar, donut, pie, line, stacked-area, scatter. Outside pie and donut labels use leader lines. Overlapping labels are skipped.
   */
  labels?: boolean;
  /**
   * Where the value label sits. top, bottom, left, right, and center suit line, area, and scatter. inside and outside suit bar, donut, and pie. Outside pie and donut labels draw leader lines. Setting it turns labels on. Applies to: bar, donut, pie, line, stacked-area, scatter, combo.
   */
  labelPosition?: "top" | "bottom" | "left" | "right" | "center" | "inside" | "outside";
  /**
   * How values are displayed in axes, tooltips and labels. A preset string, or an object for fine control. Formatting uses Intl with the spec 'locale'.
   */
  labelFormat?:
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
   * Which line points are labelled. all, ends (first and last), or last. Setting it turns labels on. Applies to: line, stacked-area, combo.
   */
  labelEnds?: "all" | "ends" | "last";
  /**
   * Label the total of a stacked bar or stacked area. On a bar this also stacks the series. Applies to: bar, stacked-area.
   */
  stackTotal?: boolean;
  /**
   * Hole size as a 0–0.95 fraction of the radius. Donut defaults to 0.6. Pie defaults to 0. Sunburst uses 0.28 when this is omitted. Applies to: donut, pie, sunburst.
   */
  innerRadius?: number;
  /**
   * How many levels to draw under the root. Deeper nodes fold into that level. Default 8. Applies to: treemap, sunburst.
   */
  depth?: number;
  /**
   * Gap between slices in degrees. Donut defaults to 2. Pie defaults to 0. Applies to: donut, pie.
   */
  padAngle?: number;
  /**
   * Slice order. none keeps data order and pins an Other bucket last. asc and desc sort by value, including Other. Applies to: donut, pie.
   */
  sort?: "none" | "asc" | "desc";
  /**
   * Group small slices into one Other slice. A number is the fraction. Applies to: donut, pie.
   */
  other?:
    | number
    | {
        /**
         * Fold slices smaller than this fraction of the total.
         */
        threshold: number;
        /**
         * Name of the folded slice. Default Other.
         */
        label?: string;
      };
  /**
   * Pull slices out from the centre, in px. With mark.explode, only those slices move. Otherwise every slice moves. Applies to: donut, pie.
   */
  offset?: number;
  /**
   * Slice names to offset. Uses mark.offset, or 12px when offset is omitted. Applies to: donut, pie.
   */
  explode?: string[];
  /**
   * Series colours for this chart, in order. Overrides the theme palette. Omit it to keep the theme tokens. Applies to: line, bar, scatter, combo, stacked-area, donut, pie.
   *
   * @minItems 1
   * @maxItems 24
   */
  palette?: [Color, ...Color[]];
  /**
   * Conditional colours. First match wins and overrides the series or category colour. Applies to: line, bar, scatter, combo, donut, pie.
   *
   * @maxItems 8
   */
  colorRules?:
    | []
    | [
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        }
      ]
    | [
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        }
      ]
    | [
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        }
      ]
    | [
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        }
      ]
    | [
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        }
      ]
    | [
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        }
      ]
    | [
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        }
      ]
    | [
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        },
        {
          /**
           * A CSS color ('#22c55e', 'rgb(...)', 'oklch(...)'), a CSS variable ('var(--chart-1)'), or a theme token reference: 'series-1'..'series-12', 'accent', 'positive', 'negative', 'text', 'muted', 'grid'.
           */
          color: string;
          /**
           * Match negative or positive values.
           */
          test?: "negative" | "positive";
          /**
           * Match values less than this.
           */
          lt?: number;
          /**
           * Match values less than or equal to this.
           */
          lte?: number;
          /**
           * Match values greater than this.
           */
          gt?: number;
          /**
           * Match values greater than or equal to this.
           */
          gte?: number;
          /**
           * Match this value.
           */
          eq?: number;
        }
      ];
  /**
   * Mark opacity 0–1. Applies to: scatter, spike.
   */
  opacity?: number;
  /**
   * Heatmap layout. Omit it when encoding.y is set: the renderer uses grid. 'calendar' = weeks by weekdays from a date x (also the fallback when y is absent). 'grid' = x by y categories. Applies to: heatmap.
   */
  layout?: "calendar" | "grid";
  /**
   * Number of weeks shown in calendar layout, ending on the week of the latest day. Ignored on a grid heatmap. Cells stay square, or at most 1.5:1, and cap at 32px. Extra width centres the grid. Unsized calendars stay at 12px. Applies to: heatmap.
   */
  weeks?: number;
  /**
   * Arc start in degrees (0 = top, clockwise). Applies to: gauge, progress-ring, donut, pie.
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
  /**
   * Funnel geometry. bar draws centered rounded bars and is the default. trapezoid connects each stage to the next. Applies to: funnel.
   */
  shape?: "bar" | "trapezoid";
  /**
   * Histogram bin count when mark.bin is count or omitted. Default 8. Applies to: histogram.
   */
  bins?: number;
  /**
   * Histogram bin rule. count uses mark.bins. width uses mark.binWidth. sturges, sqrt, and fd choose a count from the data. Applies to: histogram.
   */
  bin?: "count" | "width" | "sturges" | "sqrt" | "fd";
  /**
   * Histogram bin width. Used when mark.bin is width. Applies to: histogram.
   */
  binWidth?: number;
  /**
   * Bullet band fields, worst to best. Each value is the upper edge of that band. Applies to: bullet.
   *
   * @minItems 1
   * @maxItems 5
   */
  ranges?:
    | [string]
    | [string, string]
    | [string, string, string]
    | [string, string, string, string]
    | [string, string, string, string, string];
  /**
   * Waterfall field that marks an absolute total when the row is true. Default field name total. Applies to: waterfall.
   */
  total?: string;
  /**
   * Centre line through encoding.y on a range area. Defaults on when y is set. false draws the band only. Applies to: area-range.
   */
  line?: boolean;
  /**
   * Outline a range band. Off by default so a nested interval stays a fill in the line colour. Applies to: area-range.
   */
  stroke?: boolean;
  /**
   * Dash the centre line where a band is present, and keep the earlier actuals solid. Both parts use the line colour. Applies to: area-range.
   */
  strokeDash?: boolean;
  /**
   * Whisker anchor. point draws a marker at y. bar draws a bar from zero to y. Applies to: errorbar.
   */
  error?: "point" | "bar";
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
         * Approximate tick count, or the exact tick values.
         */
        ticks?: number | [number, ...number[]];
        /**
         * Grid lines from this axis.
         */
        grid?: boolean | ("solid" | "dashed" | "dotted");
        /**
         * Show tick labels.
         */
        labels?: boolean;
        /**
         * Axis side. Defaults: x bottom, y left, y2 right. A side perpendicular to the axis maps onto the nearer end.
         */
        position?: "top" | "bottom" | "left" | "right";
        /**
         * Where the title sits along the axis. start is the minimum end (left or bottom). end is the maximum end. Default center.
         */
        titlePosition?: "start" | "center" | "end";
        /**
         * Axis title rotation in degrees. Default 0 on x, -90 on a left y axis, and 90 on a right y or y2 axis.
         */
        titleRotate?: number;
        /**
         * Skip tick labels that would overlap. false draws every label. When omitted, crowded category labels still tilt about -40 degrees if that fits, and numeric ticks skip only when they collide.
         */
        autoSkip?: boolean;
        /**
         * Maximum tick-label width in pixels. Longer labels wrap, then ellipsize.
         */
        labelWidth?: number;
        /**
         * Maximum lines for a wrapped tick label. Enables wrapping at 72 pixels when labelWidth is omitted.
         */
        labelLines?: number;
        /**
         * Axis baseline. Off unless set. Color defaults to the axis token.
         */
        line?:
          | boolean
          | {
              /**
               * Draw the baseline.
               */
              show?: boolean;
              /**
               * Stroke color. Defaults to the axis token.
               */
              color?: string;
              /**
               * Stroke width in pixels.
               */
              width?: number;
              /**
               * Stroke pattern.
               */
              dash?: "solid" | "dashed" | "dotted";
            };
        /**
         * Tick marks at labeled ticks. none is the default. inside points into the plot.
         */
        tickMarks?: "inside" | "outside" | "none";
        /**
         * Tick mark length in pixels. Setting it draws outside marks unless tickMarks says otherwise.
         */
        tickLength?: number;
        /**
         * Tick label rotation in degrees. When omitted, crowded category labels rotate about -40 degrees unless autoSkip is true.
         */
        rotate?: number;
        /**
         * Shaded x ranges, or "weekends" to shade Saturday and Sunday when x is dates.
         */
        bands?: "weekends" | AxisBand[];
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
         * Approximate tick count, or the exact tick values.
         */
        ticks?: number | [number, ...number[]];
        /**
         * Grid lines from this axis.
         */
        grid?: boolean | ("solid" | "dashed" | "dotted");
        /**
         * Show tick labels.
         */
        labels?: boolean;
        /**
         * Axis side. Defaults: x bottom, y left, y2 right. A side perpendicular to the axis maps onto the nearer end.
         */
        position?: "top" | "bottom" | "left" | "right";
        /**
         * Where the title sits along the axis. start is the minimum end (left or bottom). end is the maximum end. Default center.
         */
        titlePosition?: "start" | "center" | "end";
        /**
         * Axis title rotation in degrees. Default 0 on x, -90 on a left y axis, and 90 on a right y or y2 axis.
         */
        titleRotate?: number;
        /**
         * Skip tick labels that would overlap. false draws every label. When omitted, crowded category labels still tilt about -40 degrees if that fits, and numeric ticks skip only when they collide.
         */
        autoSkip?: boolean;
        /**
         * Maximum tick-label width in pixels. Longer labels wrap, then ellipsize.
         */
        labelWidth?: number;
        /**
         * Maximum lines for a wrapped tick label. Enables wrapping at 72 pixels when labelWidth is omitted.
         */
        labelLines?: number;
        /**
         * Axis baseline. Off unless set. Color defaults to the axis token.
         */
        line?:
          | boolean
          | {
              /**
               * Draw the baseline.
               */
              show?: boolean;
              /**
               * Stroke color. Defaults to the axis token.
               */
              color?: string;
              /**
               * Stroke width in pixels.
               */
              width?: number;
              /**
               * Stroke pattern.
               */
              dash?: "solid" | "dashed" | "dotted";
            };
        /**
         * Tick marks at labeled ticks. none is the default. inside points into the plot.
         */
        tickMarks?: "inside" | "outside" | "none";
        /**
         * Tick mark length in pixels. Setting it draws outside marks unless tickMarks says otherwise.
         */
        tickLength?: number;
        /**
         * Tick label rotation in degrees. When omitted, crowded category labels rotate about -40 degrees unless autoSkip is true.
         */
        rotate?: number;
        /**
         * Shaded y ranges, such as a target zone.
         */
        bands?: AxisBand[];
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
         * Approximate tick count, or the exact tick values.
         */
        ticks?: number | [number, ...number[]];
        /**
         * Grid lines from this axis.
         */
        grid?: boolean | ("solid" | "dashed" | "dotted");
        /**
         * Show tick labels.
         */
        labels?: boolean;
        /**
         * Axis side. Defaults: x bottom, y left, y2 right. A side perpendicular to the axis maps onto the nearer end.
         */
        position?: "top" | "bottom" | "left" | "right";
        /**
         * Where the title sits along the axis. start is the minimum end (left or bottom). end is the maximum end. Default center.
         */
        titlePosition?: "start" | "center" | "end";
        /**
         * Axis title rotation in degrees. Default 0 on x, -90 on a left y axis, and 90 on a right y or y2 axis.
         */
        titleRotate?: number;
        /**
         * Skip tick labels that would overlap. false draws every label. When omitted, crowded category labels still tilt about -40 degrees if that fits, and numeric ticks skip only when they collide.
         */
        autoSkip?: boolean;
        /**
         * Maximum tick-label width in pixels. Longer labels wrap, then ellipsize.
         */
        labelWidth?: number;
        /**
         * Maximum lines for a wrapped tick label. Enables wrapping at 72 pixels when labelWidth is omitted.
         */
        labelLines?: number;
        /**
         * Axis baseline. Off unless set. Color defaults to the axis token.
         */
        line?:
          | boolean
          | {
              /**
               * Draw the baseline.
               */
              show?: boolean;
              /**
               * Stroke color. Defaults to the axis token.
               */
              color?: string;
              /**
               * Stroke width in pixels.
               */
              width?: number;
              /**
               * Stroke pattern.
               */
              dash?: "solid" | "dashed" | "dotted";
            };
        /**
         * Tick marks at labeled ticks. none is the default. inside points into the plot.
         */
        tickMarks?: "inside" | "outside" | "none";
        /**
         * Tick mark length in pixels. Setting it draws outside marks unless tickMarks says otherwise.
         */
        tickLength?: number;
        /**
         * Tick label rotation in degrees. When omitted, crowded category labels rotate about -40 degrees unless autoSkip is true.
         */
        rotate?: number;
        /**
         * Shaded ranges on the second y axis.
         */
        bands?: AxisBand[];
      };
}
/**
 * A shaded range on an axis.
 */
export interface AxisBand {
  /**
   * Start of the range, in data units or a category.
   */
  from: number | string;
  /**
   * End of the range, in data units or a category.
   */
  to: number | string;
  /**
   * Text shown on the band.
   */
  label?: string;
  color?: Color;
  /**
   * Fill opacity, 0–1.
   */
  opacity?: number;
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
   * Click selection. 'point' or 'series'. Shift, Ctrl, or Meta adds another. Escape or a background click clears. Selected marks use --ck-selected; others use --ck-dim. Emits pointclick or seriesclick, and selectionchange.
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
  /**
   * Formats offered by the export menu. The SVG records them as data-ck-export. The menu loads only when this list is set. toPNG, toSVG, and toCSV are @chartkitdev/core/export.
   */
  export?: ("png" | "svg" | "csv")[];
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
   * Arrow-key navigation between points with announcements. Off unless set, because turning it on loads the interaction runtime.
   */
  keyboard?: boolean;
  /**
   * Render a visually hidden data table for screen readers. Off unless set, because turning it on loads the interaction runtime.
   */
  dataTable?: boolean;
}
