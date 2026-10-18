import launchGantt from "../../packages/core/examples/24-gantt.json";
import companyTimeline from "../../packages/core/examples/25-timeline.json";
import priorityQuadrant from "../../packages/core/examples/26-quadrant.json";
import featureVenn from "../../packages/core/examples/27-venn.json";
import checkoutJourney from "../../packages/core/examples/28-journey.json";

export interface Spec {
  version: "1";
  type: string;
  id: string;
  a11y: { alt: string };
  title?: string;
  data?: unknown;
  metric?: Record<string, unknown>;
  encoding?: Record<string, unknown>;
  mark?: Record<string, unknown>;
  axes?: Record<string, unknown>;
  legend?: unknown;
  size?: { width?: number; height?: number | "auto" };
  theme?: string;
  locale?: string;
  subtitle?: string;
}

export interface Example {
  slug: string;
  title: string;
  group: string;
  type: string;
  blurb: string;
  spec: Spec;
}

export interface ChartTypeDoc {
  type: string;
  title: string;
  summary: string;
  notes: string[];
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function calendarRows() {
  const start = Date.UTC(2026, 0, 5);
  const pattern = [1, 3, 2, 6, 4, 0, 5, 8, 2, 7, 3, 1, 9, 4, 2];
  return Array.from({ length: 84 }, (_, i) => {
    const date = new Date(start + i * 86_400_000).toISOString().slice(0, 10);
    return { date, value: pattern[i % pattern.length] };
  });
}

export const minimalSpec: Spec = {
  version: "1",
  id: "minimal-line",
  type: "line",
  data: [
    { quarter: "Q1", units: 40 },
    { quarter: "Q2", units: 55 },
    { quarter: "Q3", units: 48 },
    { quarter: "Q4", units: 62 },
  ],
  encoding: { x: "quarter", y: "units" },
  mark: { points: "always" },
  size: { width: 640, height: 280 },
  a11y: { alt: "Units rose from 40 in Q1 to 62 in Q4, with a dip in Q3." },
};

export const heroSpec: Spec = {
  version: "1",
  id: "hero-revenue",
  type: "line",
  title: "Revenue",
  data: months.map((month, i) => ({
    month,
    revenue: [42, 46, 44, 51, 58, 55, 63, 61, 70, 74, 72, 81][i],
    target: [40, 43, 46, 49, 52, 55, 58, 61, 64, 67, 70, 73][i],
  })),
  encoding: {
    x: "month",
    y: [
      { field: "revenue", title: "Revenue", area: true },
      { field: "target", title: "Target", dash: "dashed" },
    ],
  },
  mark: { curve: "monotone", points: "none" },
  legend: { interactive: true },
  size: { width: 560, height: 320 },
  a11y: { alt: "Revenue stays near the target and finishes the year above it, at 81 against a target of 73." },
};

export const chartTypes: ChartTypeDoc[] = [
  {
    type: "line",
    title: "Line",
    summary: "A trend across ordered categories. Add area: true on a y channel for a filled line, or dash for a target.",
    notes: [
      "encoding.y is a field name or a list of channels.",
      "mark.curve is monotone by default. step, linear, step-before, and step-after are the other curves.",
      "mark.sampling defaults to auto and downsamples long lines. Set none to draw every point.",
    ],
  },
  {
    type: "bar",
    title: "Bar",
    summary: "A comparison across categories. Several y channels stack when mark.stack is stack or percent.",
    notes: [
      "mark.orientation horizontal turns the bars sideways.",
      "encoding.series, or encoding.color set to a data field, splits the bars into series. mark.stack stack or percent stacks them. A list of y channels stacks too.",
      "cornerRadius and gap are mark options.",
    ],
  },
  {
    type: "donut",
    title: "Donut",
    summary: "Parts of a whole. encoding.x is the slice label and encoding.y is the value. The center shows the total.",
    notes: [
      "mark.innerRadius 0 draws a pie. The default is a donut.",
      "legend.position bottom keeps the labels under the ring.",
    ],
  },
  {
    type: "stacked-area",
    title: "Stacked area",
    summary: "Several series stacked into one shape. mark.stack percent normalizes each x to 100%.",
    notes: ["encoding.y is a list of fields.", "The default stack is stack, not grouped."],
  },
  {
    type: "scatter",
    title: "Scatter",
    summary: "Two quantitative fields, with an optional size channel for bubbles.",
    notes: [
      "Keep the size range inside the plot. Very large bubbles are clipped.",
      "scale.type log draws a log axis for a positive domain.",
    ],
  },
  {
    type: "combo",
    title: "Combo",
    summary: "Bars and a line in one spec. Put the line on axis y2 when the units differ.",
    notes: [
      "Each y channel has its own mark: bar, line, or area.",
      "axes.y2.title labels the right axis. encoding.y is a list, not encoding.bar.",
    ],
  },
  {
    type: "heatmap",
    title: "Heatmap",
    summary: "A grid when x, y, and color are set. A calendar when x is a date and color is the measure.",
    notes: [
      "mark.layout calendar or grid selects the layout. A date x plus color infers calendar.",
      "The measure is encoding.color, not encoding.value.",
    ],
  },
  {
    type: "gauge",
    title: "Gauge",
    summary: "A semicircular meter. The number lives in metric, with min, max, and optional bands.",
    notes: ["metric.value is required.", "Bands use token names such as positive and negative."],
  },
  {
    type: "kpi",
    title: "KPI",
    summary: "A label, a formatted value, a delta, and an optional sparkline from data.",
    notes: [
      "metric.format accepts compact, percent, currency, and duration-ms.",
      "metric.goodDirection down paints a falling error rate as positive.",
    ],
  },
  {
    type: "sparkline",
    title: "Sparkline",
    summary: "A small line with no axes. data can be a plain number array.",
    notes: ["Use it inside a table or a KPI, not as a full chart.", "sampling auto still applies on long arrays."],
  },
  {
    type: "mini-area",
    title: "Mini area",
    summary: "A small filled trend, also happy with a number array.",
    notes: ["No axes. The area is the whole chart.", "Pair it with a sentence of alt text that states the direction."],
  },
  {
    type: "progress-ring",
    title: "Progress ring",
    summary: "A circular share of metric.max. The value is metric.value, not a data column.",
    notes: ["Set min and max so the ring is a fraction, not a guess.", "Alt text should include both numbers."],
  },
  {
    type: "spike",
    title: "Spike",
    summary: "Thin marks for bursts over time. A quiet baseline makes the spike readable.",
    notes: ["encoding.x and encoding.y name the columns.", "Prefer short category labels so they do not collide."],
  },
  {
    type: "candlestick",
    title: "Candlestick",
    summary: "Open, high, low, and close. Optional volume.",
    notes: [
      "encoding needs x, open, high, low, and close.",
      "A temporal x is a time axis, formatted from the span (Jan 5, Jan 2026) instead of a raw ISO string.",
    ],
  },
  {
    type: "histogram",
    title: "Histogram",
    summary: "Bins one quantitative field. mark.bins sets the count.",
    notes: ["encoding.x is the value to bin.", "The chart module loads on demand in the browser."],
  },
  {
    type: "boxplot",
    title: "Box plot",
    summary: "Quartiles, whiskers, a median, and outlier dots for each category.",
    notes: ["encoding.x is the category and encoding.y is the observation.", "The chart module loads on demand in the browser."],
  },
  {
    type: "radar",
    title: "Radar",
    summary: "One polygon per series around a shared set of spokes.",
    notes: ["encoding.x is the spoke. encoding.y is one field or a list.", "At least three spokes."],
  },
  {
    type: "funnel",
    title: "Funnel",
    summary: "Stages in data order, width proportional to the value.",
    notes: ["encoding.x is the stage and encoding.y is the value.", "Hover a stage for its label."],
  },
  {
    type: "treemap",
    title: "Treemap",
    summary: "Area tiles. encoding.color groups them.",
    notes: ["encoding.x is the tile name and encoding.y is the size.", "Hover a tile for its label."],
  },
  {
    type: "sankey",
    title: "Sankey",
    summary: "Flows from a source field to a target field.",
    notes: ["encoding.source, encoding.target, and encoding.y name the columns.", "Hover a node or link for its label."],
  },
  {
    type: "bullet",
    title: "Bullet",
    summary: "A value against a target and qualitative ranges.",
    notes: ["encoding.y is the value and encoding.target is the target.", "mark.ranges names the range fields."],
  },
  {
    type: "waterfall",
    title: "Waterfall",
    summary: "Signed steps between totals.",
    notes: ["encoding.x is the step and encoding.y is the amount.", "A row with total: true is a full bar, not a delta."],
  },
  {
    type: "gantt",
    title: "Gantt",
    summary: "Tasks as bars on a time axis, with sections, milestones, and dependencies.",
    notes: [
      "start plus end, or duration. status is done, active, or crit.",
      "A milestone is a diamond. depends names task ids. today draws the marker.",
    ],
  },
  {
    type: "timeline",
    title: "Timeline",
    summary: "Events on a date axis, with eras as spans.",
    notes: ["kind period uses start and end. Event labels alternate above and below."],
  },
  {
    type: "quadrant",
    title: "Quadrant",
    summary: "Points on a square split into four labeled regions.",
    notes: ["x and y default to 0..1. subtitle is the four names, top-left first, split by |."],
  },
  {
    type: "venn",
    title: "Venn",
    summary: "Two or three sets. Two are area-proportional. Three are approximate.",
    notes: ["An intersection joins set names with +. Four or more is an error with a fix."],
  },
  {
    type: "journey",
    title: "Journey",
    summary: "Sections and steps, with a 1–5 score and actor chips.",
    notes: ["The score is a face on a five-step scale. actors is a comma-separated list."],
  },
];

export const examples: Example[] = [
  {
    slug: "revenue-line",
    title: "Revenue against target",
    group: "Line",
    type: "line",
    blurb: "Filled revenue and a dashed target, one spec.",
    spec: heroSpec,
  },
  {
    slug: "quarterly-units",
    title: "Quarterly units",
    group: "Line",
    type: "line",
    blurb: "The smallest valid line: four rows and a sentence of alt text.",
    spec: minimalSpec,
  },
  {
    slug: "step-deploys",
    title: "Deploys, step curve",
    group: "Line",
    type: "line",
    blurb: "A step curve for values that jump and then hold.",
    spec: {
      version: "1",
      id: "step-deploys",
      type: "line",
      data: [
        { day: "Mon", deploys: 2 },
        { day: "Tue", deploys: 2 },
        { day: "Wed", deploys: 6 },
        { day: "Thu", deploys: 6 },
        { day: "Fri", deploys: 3 },
      ],
      encoding: { x: "day", y: { field: "deploys", title: "Deploys" } },
      mark: { curve: "step", points: "always" },
      legend: false,
      size: { width: 560, height: 260 },
      a11y: { alt: "Deploys jumped from 2 to 6 on Wednesday and settled at 3 on Friday." },
    },
  },
  {
    slug: "signups-bar",
    title: "Signups by month",
    group: "Bar",
    type: "bar",
    blurb: "One series, rounded bars, German grouping on the axis.",
    spec: {
      version: "1",
      id: "signups-bar",
      type: "bar",
      locale: "de-DE",
      data: [
        { month: "Jan", signups: 8420 },
        { month: "Feb", signups: 12150 },
        { month: "Mar", signups: 10980 },
        { month: "Apr", signups: 14320 },
        { month: "May", signups: 13840 },
      ],
      encoding: { x: "month", y: "signups" },
      legend: false,
      size: { width: 560, height: 280 },
      a11y: { alt: "Signups peaked in April at 14,320, after 8,420 in January." },
    },
  },
  {
    slug: "regions-bar",
    title: "Revenue by region",
    group: "Bar",
    type: "bar",
    blurb: "Horizontal bars for a short list of categories.",
    spec: {
      version: "1",
      id: "regions-bar",
      type: "bar",
      data: [
        { region: "North", revenue: 82 },
        { region: "South", revenue: 64 },
        { region: "East", revenue: 96 },
        { region: "West", revenue: 71 },
      ],
      encoding: { x: "region", y: "revenue" },
      mark: { orientation: "horizontal" },
      legend: false,
      size: { width: 520, height: 260 },
      a11y: { alt: "East has the highest revenue at 96. South is lowest at 64." },
    },
  },
  {
    slug: "channels-bar",
    title: "Traffic by channel",
    group: "Bar",
    type: "bar",
    blurb: "Three y channels, stacked.",
    spec: {
      version: "1",
      id: "channels-bar",
      type: "bar",
      data: [
        { month: "Jan", search: 40, direct: 22, social: 12 },
        { month: "Feb", search: 46, direct: 20, social: 16 },
        { month: "Mar", search: 44, direct: 26, social: 18 },
        { month: "Apr", search: 52, direct: 24, social: 15 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "search", title: "Search" },
          { field: "direct", title: "Direct" },
          { field: "social", title: "Social" },
        ],
      },
      mark: { stack: "stack" },
      size: { width: 560, height: 300 },
      a11y: { alt: "Search is the largest channel in every month. The stack is tallest in April." },
    },
  },
  {
    slug: "spend-area",
    title: "Spend by team",
    group: "Area",
    type: "stacked-area",
    blurb: "Stacked areas for parts that add up.",
    spec: {
      version: "1",
      id: "spend-area",
      type: "stacked-area",
      data: [
        { month: "Jan", product: 20, design: 12, support: 8 },
        { month: "Feb", product: 24, design: 11, support: 9 },
        { month: "Mar", product: 22, design: 14, support: 10 },
        { month: "Apr", product: 28, design: 13, support: 11 },
        { month: "May", product: 30, design: 15, support: 12 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "product", title: "Product" },
          { field: "design", title: "Design" },
          { field: "support", title: "Support" },
        ],
      },
      size: { width: 560, height: 300 },
      a11y: { alt: "Total spend rises from January to May, and product remains the largest share." },
    },
  },
  {
    slug: "mix-area",
    title: "Channel mix",
    group: "Area",
    type: "stacked-area",
    blurb: "The same stack, normalized to 100%.",
    spec: {
      version: "1",
      id: "mix-area",
      type: "stacked-area",
      data: [
        { month: "Jan", paid: 30, organic: 50, partner: 20 },
        { month: "Feb", paid: 28, organic: 48, partner: 24 },
        { month: "Mar", paid: 34, organic: 42, partner: 24 },
        { month: "Apr", paid: 26, organic: 46, partner: 28 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "organic", title: "Organic" },
          { field: "paid", title: "Paid" },
          { field: "partner", title: "Partner" },
        ],
      },
      mark: { stack: "percent" },
      size: { width: 560, height: 300 },
      a11y: { alt: "Organic stays the largest share of the mix. Partner grows slightly by April." },
    },
  },
  {
    slug: "traffic-donut",
    title: "Sessions by source",
    group: "Donut",
    type: "donut",
    blurb: "Four slices and a center total.",
    spec: {
      version: "1",
      id: "traffic-donut",
      type: "donut",
      data: [
        { source: "Search", sessions: 42 },
        { source: "Direct", sessions: 28 },
        { source: "Social", sessions: 18 },
        { source: "Email", sessions: 12 },
      ],
      encoding: { x: "source", y: "sessions" },
      mark: { innerRadius: 0.62 },
      legend: { position: "bottom" },
      size: { width: 420, height: 340 },
      a11y: { alt: "Search is the largest source at 42 of 100 sessions. Email is the smallest at 12." },
    },
  },
  {
    slug: "budget-pie",
    title: "Budget split",
    group: "Donut",
    type: "donut",
    blurb: "A pie is a donut with innerRadius 0.",
    spec: {
      version: "1",
      id: "budget-pie",
      type: "donut",
      data: [
        { item: "People", amount: 55 },
        { item: "Cloud", amount: 25 },
        { item: "Tools", amount: 12 },
        { item: "Travel", amount: 8 },
      ],
      encoding: { x: "item", y: "amount" },
      mark: { innerRadius: 0 },
      legend: { position: "bottom" },
      size: { width: 420, height: 340 },
      a11y: { alt: "People are 55 of the budget. Travel is 8." },
    },
  },
  {
    slug: "yield-scatter",
    title: "Yield by temperature",
    group: "Scatter",
    type: "scatter",
    blurb: "Bubble size is a third field, kept inside the plot.",
    spec: {
      version: "1",
      id: "yield-scatter",
      type: "scatter",
      data: [
        { temp: 14, yield: 3.1, plot: 8 },
        { temp: 16, yield: 3.8, plot: 10 },
        { temp: 18, yield: 4.1, plot: 11 },
        { temp: 21, yield: 5.2, plot: 16 },
        { temp: 23, yield: 5.0, plot: 14 },
        { temp: 26, yield: 4.2, plot: 12 },
        { temp: 29, yield: 3.4, plot: 9 },
      ],
      encoding: {
        x: { field: "temp", title: "Temperature" },
        y: { field: "yield", title: "Yield" },
        size: { field: "plot", range: [5, 16] },
      },
      size: { width: 560, height: 320 },
      a11y: { alt: "Yield peaks near 21 degrees and falls off at both cooler and hotter temperatures." },
    },
  },
  {
    slug: "orders-combo",
    title: "Orders and fill rate",
    group: "Combo",
    type: "combo",
    blurb: "Bars on the left axis, a rate line on the right.",
    spec: {
      version: "1",
      id: "orders-combo",
      type: "combo",
      data: [
        { week: "W1", orders: 120, rate: 0.62 },
        { week: "W2", orders: 140, rate: 0.66 },
        { week: "W3", orders: 132, rate: 0.7 },
        { week: "W4", orders: 158, rate: 0.74 },
        { week: "W5", orders: 150, rate: 0.71 },
      ],
      encoding: {
        x: "week",
        y: [
          { field: "orders", title: "Orders", mark: "bar" },
          { field: "rate", title: "Fill rate", mark: "line", axis: "y2" },
        ],
      },
      axes: { y2: { title: "Fill rate" } },
      size: { width: 560, height: 300 },
      a11y: { alt: "Orders and the fill rate both finish higher than they started. Orders dip in week 3 and week 5." },
    },
  },
  {
    slug: "activity-calendar",
    title: "Commit calendar",
    group: "Heatmap",
    type: "heatmap",
    blurb: "A date on x and a measure on color.",
    spec: {
      version: "1",
      id: "activity-calendar",
      type: "heatmap",
      data: calendarRows(),
      encoding: {
        x: { field: "date", type: "temporal" },
        color: { field: "value", type: "quantitative" },
      },
      mark: { layout: "calendar", weeks: 12 },
      size: { width: 720, height: 180 },
      a11y: { alt: "Commit activity over twelve weeks, with a repeating mix of quiet days and heavier days." },
    },
  },
  {
    slug: "load-grid",
    title: "Load by service",
    group: "Heatmap",
    type: "heatmap",
    blurb: "A grid: x, y, and color.",
    spec: {
      version: "1",
      id: "load-grid",
      type: "heatmap",
      data: ["API", "Web", "Jobs", "Auth"].flatMap((service, row) =>
        ["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, col) => ({
          day,
          service,
          load: [2, 5, 3, 8, 4, 1, 6, 7, 3, 9, 4, 2, 5, 8, 6, 3, 4, 7, 5, 8][row * 5 + col],
        })),
      ),
      encoding: { x: "day", y: "service", color: "load" },
      mark: { layout: "grid" },
      size: { width: 560, height: 280 },
      a11y: { alt: "Jobs on Thursday and Auth on Friday are the heaviest cells. API on Monday is light." },
    },
  },
  {
    slug: "capacity-gauge",
    title: "Capacity",
    group: "Meters",
    type: "gauge",
    blurb: "A meter with a target and two bands.",
    spec: {
      version: "1",
      id: "capacity-gauge",
      type: "gauge",
      metric: {
        label: "Capacity",
        value: 72,
        min: 0,
        max: 100,
        target: 80,
        format: "integer",
        bands: [
          { from: 0, to: 50, color: "negative", label: "Low" },
          { from: 50, to: 100, color: "positive", label: "OK" },
        ],
      },
      size: { width: 320, height: 200 },
      a11y: { alt: "Capacity is 72 out of 100, below the target of 80." },
    },
  },
  {
    slug: "revenue-kpi",
    title: "Revenue KPI",
    group: "Meters",
    type: "kpi",
    blurb: "Compact currency, a positive delta, and a sparkline.",
    spec: {
      version: "1",
      id: "revenue-kpi",
      type: "kpi",
      metric: { label: "Revenue", value: 2_850_000, delta: 0.124, format: { style: "compact", decimals: 2 } },
      data: [18, 20, 19, 22, 21, 24, 28, 27, 30],
      size: { width: 320, height: 156 },
      a11y: { alt: "Revenue is 2.85 million, up 12.4 percent, and the sparkline trends up." },
    },
  },
  {
    slug: "error-kpi",
    title: "Error rate",
    group: "Meters",
    type: "kpi",
    blurb: "A falling error rate is the good direction.",
    spec: {
      version: "1",
      id: "error-kpi",
      type: "kpi",
      metric: {
        label: "Error rate",
        value: 0.0023,
        delta: -0.18,
        format: { style: "percent", decimals: 2 },
        goodDirection: "down",
      },
      data: [8, 7, 7, 6, 5, 5, 4, 3],
      size: { width: 320, height: 156 },
      a11y: { alt: "Error rate is 0.23 percent, down 18 percent, which is the good direction." },
    },
  },
  {
    slug: "latency-spark",
    title: "Latency sparkline",
    group: "Compact",
    type: "sparkline",
    blurb: "A number array, no axes.",
    spec: {
      version: "1",
      id: "latency-spark",
      type: "sparkline",
      data: [40, 42, 38, 55, 48, 36, 34, 41, 33, 30],
      size: { width: 360, height: 72 },
      a11y: { alt: "Latency spikes in the middle of the series and ends lower than it starts." },
    },
  },
  {
    slug: "sessions-mini",
    title: "Sessions mini area",
    group: "Compact",
    type: "mini-area",
    blurb: "A filled trend for a card footer.",
    spec: {
      version: "1",
      id: "sessions-mini",
      type: "mini-area",
      data: [12, 14, 13, 18, 17, 21, 20, 24, 23, 28],
      size: { width: 360, height: 96 },
      a11y: { alt: "Sessions rise from 12 to 28 across the window." },
    },
  },
  {
    slug: "tasks-ring",
    title: "Tasks done",
    group: "Meters",
    type: "progress-ring",
    blurb: "Three of eight, read from metric.",
    spec: {
      version: "1",
      id: "tasks-ring",
      type: "progress-ring",
      metric: { label: "Done", value: 3, min: 0, max: 8 },
      size: { width: 180, height: 180 },
      a11y: { alt: "3 of 8 tasks are done." },
    },
  },
  {
    slug: "error-spikes",
    title: "Error spikes",
    group: "Compact",
    type: "spike",
    blurb: "Most hours are quiet. Two hours are not.",
    spec: {
      version: "1",
      id: "error-spikes",
      type: "spike",
      data: [
        { hour: "00", errors: 1 },
        { hour: "03", errors: 0 },
        { hour: "06", errors: 2 },
        { hour: "09", errors: 4 },
        { hour: "12", errors: 14 },
        { hour: "15", errors: 3 },
        { hour: "18", errors: 11 },
        { hour: "21", errors: 2 },
      ],
      encoding: { x: "hour", y: "errors" },
      size: { width: 560, height: 240 },
      a11y: { alt: "Errors spike at noon and again at 18:00. The other hours stay near the baseline." },
    },
  },
  {
    slug: "week-candles",
    title: "A week of prices",
    group: "Financial",
    type: "candlestick",
    blurb: "Open, high, low, and close with short day labels.",
    spec: {
      version: "1",
      id: "week-candles",
      type: "candlestick",
      data: [
        { day: "Mon", open: 101, high: 108, low: 99, close: 106 },
        { day: "Tue", open: 106, high: 112, low: 104, close: 110 },
        { day: "Wed", open: 110, high: 111, low: 102, close: 104 },
        { day: "Thu", open: 104, high: 115, low: 103, close: 113 },
        { day: "Fri", open: 113, high: 118, low: 111, close: 116 },
      ],
      encoding: { x: "day", open: "open", high: "high", low: "low", close: "close" },
      size: { width: 560, height: 300 },
      a11y: { alt: "The week closed at 116 after opening Monday at 101. Wednesday was the only down day." },
    },
  },
  {
    slug: "checkout-histogram",
    title: "Checkout scores",
    group: "Distribution",
    type: "histogram",
    blurb: "Two bins. Most scores sit in the low one.",
    spec: {
      version: "1",
      id: "checkout-histogram",
      type: "histogram",
      title: "Scores",
      data: [{ score: 1 }, { score: 2 }, { score: 2 }, { score: 8 }],
      encoding: { x: "score" },
      mark: { bins: 2 },
      size: { width: 560, height: 280 },
      a11y: { alt: "Scores cluster low." },
    },
  },
  {
    slug: "close-boxplot",
    title: "Days to close",
    group: "Distribution",
    type: "boxplot",
    blurb: "Group A stretches higher than group B.",
    spec: {
      version: "1",
      id: "close-boxplot",
      type: "boxplot",
      title: "Days to close",
      data: [
        { group: "A", value: 1 },
        { group: "A", value: 3 },
        { group: "A", value: 9 },
        { group: "B", value: 2 },
        { group: "B", value: 4 },
        { group: "B", value: 5 },
      ],
      encoding: { x: "group", y: "value" },
      size: { width: 560, height: 280 },
      a11y: { alt: "A stretches higher." },
    },
  },
  {
    slug: "model-radar",
    title: "Car and bike",
    group: "Part to whole",
    type: "radar",
    blurb: "The bike leads on cost.",
    spec: {
      version: "1",
      id: "model-radar",
      type: "radar",
      title: "Model comparison",
      data: [
        { spoke: "Speed", car: 4, bike: 2 },
        { spoke: "Cost", car: 2, bike: 5 },
        { spoke: "Ease", car: 3, bike: 4 },
      ],
      encoding: { x: "spoke", y: ["car", "bike"] },
      size: { width: 480, height: 420 },
      a11y: { alt: "Bike leads on cost." },
    },
  },
  {
    slug: "signup-funnel",
    title: "Signup funnel",
    group: "Part to whole",
    type: "funnel",
    blurb: "12 of 80 visits pay.",
    spec: {
      version: "1",
      id: "signup-funnel",
      type: "funnel",
      title: "Signup funnel",
      data: [
        { stage: "Visit", count: 80 },
        { stage: "Pay", count: 12 },
      ],
      encoding: { x: "stage", y: "count" },
      size: { width: 560, height: 280 },
      a11y: { alt: "12 of 80 pay." },
    },
  },
  {
    slug: "inventory-treemap",
    title: "Inventory",
    group: "Part to whole",
    type: "treemap",
    blurb: "Oak is the larger tile.",
    spec: {
      version: "1",
      id: "inventory-treemap",
      type: "treemap",
      title: "Inventory",
      data: [
        { name: "Oak", size: 8, group: "Wood" },
        { name: "Steel", size: 6, group: "Metal" },
      ],
      encoding: { x: "name", y: "size", color: "group" },
      size: { width: 560, height: 320 },
      a11y: { alt: "Oak is larger." },
    },
  },
  {
    slug: "mill-sankey",
    title: "Mill flow",
    group: "Flow",
    type: "sankey",
    blurb: "Flow leaves the mill for the shop.",
    spec: {
      version: "1",
      id: "mill-sankey",
      type: "sankey",
      title: "Acquisition flow",
      data: [
        { from: "Source", to: "Mill", flow: 10 },
        { from: "Mill", to: "Shop", flow: 6 },
      ],
      encoding: { source: "from", target: "to", y: "flow" },
      size: { width: 640, height: 320 },
      a11y: { alt: "Flow leaves the mill." },
    },
  },
  {
    slug: "revenue-bullet",
    title: "Revenue bullet",
    group: "Flow",
    type: "bullet",
    blurb: "Revenue is past its target.",
    spec: {
      version: "1",
      id: "revenue-bullet",
      type: "bullet",
      data: [{ name: "Revenue", value: 275, target: 250, good: 300 }],
      encoding: { x: "name", y: "value", target: "target" },
      mark: { ranges: ["good"] },
      size: { width: 560, height: 160 },
      a11y: { alt: "Revenue beats target." },
    },
  },
  {
    slug: "quarter-waterfall",
    title: "Quarter bridge",
    group: "Flow",
    type: "waterfall",
    blurb: "The close is 160.",
    spec: {
      version: "1",
      id: "quarter-waterfall",
      type: "waterfall",
      title: "Quarter bridge",
      data: [
        { step: "Open", amount: 120, total: true },
        { step: "Won", amount: 40 },
        { step: "Close", amount: 160, total: true },
      ],
      encoding: { x: "step", y: "amount" },
      size: { width: 560, height: 280 },
      a11y: { alt: "The close is 160." },
    },
  },
  {
    slug: "launch-gantt",
    title: "Product launch",
    group: "Planning",
    type: "gantt",
    blurb: "A launch plan with sections, a critical path, and a today line.",
    spec: launchGantt as Spec,
  },
  {
    slug: "company-timeline",
    title: "Company history",
    group: "Planning",
    type: "timeline",
    blurb: "Twelve years, three eras, and the events that mark them.",
    spec: companyTimeline as Spec,
  },
  {
    slug: "priority-quadrant",
    title: "Priority quadrant",
    group: "Planning",
    type: "quadrant",
    blurb: "Effort against impact, with the quick wins in the top left.",
    spec: priorityQuadrant as Spec,
  },
  {
    slug: "feature-venn",
    title: "Feature overlap",
    group: "Planning",
    type: "venn",
    blurb: "Search, filters, and saved views. Three-set areas are approximate.",
    spec: featureVenn as Spec,
  },
  {
    slug: "checkout-journey",
    title: "Checkout journey",
    group: "Planning",
    type: "journey",
    blurb: "Browse is easy. Payment is where the score drops.",
    spec: checkoutJourney as Spec,
  },
];

export const exampleGroups = Array.from(new Set(examples.map((example) => example.group)));

export function exampleBySlug(slug: string): Example | undefined {
  return examples.find((example) => example.slug === slug);
}

export function examplesForType(type: string): Example[] {
  return examples.filter((example) => example.type === type);
}

export function playgroundHref(spec: unknown): string {
  return `/playground#${encodeURIComponent(JSON.stringify(spec))}`;
}

export const AGENT_PROMPT = `Draw charts with ChartKit's JSON spec, not a React prop list.

Required: version "1", type, data (an array of row objects), encoding, and a11y.alt (one sentence).
Gauge, kpi, and progress-ring put the number in metric, not a top-level value.
Donut uses encoding.x for the slice label and encoding.y for the value.

import { validate, repair } from "@chartkitdev/core/validate"
import { render } from "@chartkitdev/core/all"

If validate(spec).ok is false, render repair(spec).spec when that result is ok.
Do not invent keys. Schema: https://chartkit.dev/schema/v1.json
Reference: https://chartkit.dev/llms.txt`;

export const THEMES = [
  "midnight",
  "emerald",
  "mono",
  "slate",
  "arctic",
  "orchid",
  "obsidian",
  "neon",
  "mocha",
  "owl",
  "retro",
  "copper",
  "rose",
  "sunset",
  "silver",
  "pearl",
  "latte",
] as const;

export const TOKENS = [
  ["--ck-background", "Chart background. The site sets this to transparent so the page shows through."],
  ["--ck-surface", "Card fill inside KPI and similar charts."],
  ["--ck-text", "Titles, values, and legend labels."],
  ["--ck-muted", "Axis ticks and secondary labels. Keep this at 4.5:1 against the page."],
  ["--ck-grid", "Grid lines."],
  ["--ck-axis", "Axis line, when a chart draws one."],
  ["--ck-accent", "Accent stroke, used by gauges and rings."],
  ["--ck-positive", "A good delta."],
  ["--ck-negative", "A bad delta."],
  ["--ck-series-1 … n", "Series colors, in order. Leave these unset to use the core palette."],
  ["--ck-font-family", "Font stack. ui-sans-serif alone falls back to a serif on some systems."],
] as const;
