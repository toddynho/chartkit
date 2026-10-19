/** Specs for the first six showcase boards. Data themes avoid the eval suite. */

export const CHART_THEMES = ["soft", "refined", "editorial", "midnight"] as const;

export interface ShowcaseSpec {
  version: "1";
  [key: string]: unknown;
}

export interface ChartSlot {
  id: string;
  title: string;
  caption: string;
  span: "board-4" | "board-6" | "board-8" | "board-12";
  spec: ShowcaseSpec;
}

export const tide: ShowcaseSpec = {
  version: "1",
  id: "greywick-tide",
  type: "line",
  title: "Greywick tide",
  theme: "soft",
  locale: "en-GB",
  data: [
    { bell: "03:10", sounded: 74, posted: 81 },
    { bell: "06:40", sounded: 142, posted: 136 },
    { bell: "10:20", sounded: 188, posted: 176 },
    { bell: "13:50", sounded: 121, posted: 133 },
    { bell: "17:30", sounded: 58, posted: 64 },
    { bell: "21:10", sounded: 96, posted: 88 },
  ],
  encoding: {
    x: { field: "bell", title: "Bell" },
    y: [
      { field: "sounded", title: "Sounded" },
      { field: "posted", title: "Posted" },
    ],
  },
  axes: {
    x: { title: "Harbour bell" },
    y: { title: "Centimetres", format: { style: "number", suffix: " cm" } },
  },
  legend: { values: true, position: "bottom" },
  tooltip: {
    mode: "index",
    position: "top",
    crosshair: true,
    crosshairLabel: true,
    fields: [
      { field: "sounded", title: "Sounded", format: { style: "number", suffix: " cm" } },
      { field: "posted", title: "Posted", format: { style: "number", suffix: " cm" } },
    ],
  },
  annotations: [
    { type: "rule", axis: "y", value: 160, dash: "dashed", label: "Dock lip", labelPosition: "end" },
    { type: "band", axis: "y", from: 40, to: 90, label: "Keel window", opacity: 0.18 },
  ],
  size: { width: 720, height: 360 },
  a11y: { alt: "Sounded tide at Greywick peaks at the 10:20 bell, above the dock lip, and the posted tide stays close to it." },
};

const roaster = [
  { roast: "Frost", bags: 420, beans: 3100, cafe: 260 },
  { roast: "Thaw", bags: 510, beans: 3600, cafe: 300 },
  { roast: "Bloom", bags: 640, beans: 4200, cafe: 350 },
  { roast: "Heat", bags: 880, beans: 5100, cafe: 420 },
  { roast: "Harvest", bags: 760, beans: 4700, cafe: 390 },
  { roast: "Cellar", bags: 540, beans: 3900, cafe: 330 },
];

export const roasteryCharts: ChartSlot[] = [
  {
    id: "bags",
    title: "Bags out",
    caption: "Compact count and a rising delta.",
    span: "board-4",
    spec: {
      version: "1",
      id: "roastery-bags",
      type: "kpi",
      theme: "soft",
      locale: "en-GB",
      metric: { label: "Bags out", value: 3750, delta: 0.08, format: { style: "compact", decimals: 1 } },
      data: [18, 22, 19, 27, 24, 31, 29],
      size: { width: 320, height: 156 },
      a11y: { alt: "Bags out are 3.8 thousand, up 8 percent, and the sparkline finishes higher than it starts." },
    },
  },
  {
    id: "beans",
    title: "Green beans",
    caption: "Currency, and a lower bill is the good direction.",
    span: "board-4",
    spec: {
      version: "1",
      id: "roastery-beans",
      type: "kpi",
      theme: "soft",
      locale: "en-GB",
      metric: {
        label: "Green beans",
        value: 24600,
        delta: -0.06,
        format: { style: "currency", currency: "GBP", decimals: 0 },
        goodDirection: "down",
      },
      data: [9, 8, 8, 7, 7, 6, 6],
      size: { width: 320, height: 156 },
      a11y: { alt: "The green-bean bill is 24,600 pounds, down 6 percent, which is the good direction." },
    },
  },
  {
    id: "cafe-share",
    title: "Café share",
    caption: "Percent of bags that stayed in the café.",
    span: "board-4",
    spec: {
      version: "1",
      id: "roastery-cafe",
      type: "kpi",
      theme: "soft",
      locale: "en-GB",
      metric: { label: "Café share", value: 0.54, delta: -0.02, format: { style: "percent", decimals: 0 } },
      data: [0.62, 0.58, 0.55, 0.48, 0.51, 0.6, 0.54],
      size: { width: 320, height: 156 },
      a11y: { alt: "Café share is 54 percent, down 2 points." },
    },
  },
  {
    id: "combo",
    title: "Bags and bean cost",
    caption: "Bars on the left, a currency line on y2, and a target rule.",
    span: "board-12",
    spec: {
      version: "1",
      id: "roastery-combo",
      type: "combo",
      title: "Bags and bean cost",
      theme: "soft",
      locale: "en-GB",
      data: roaster,
      encoding: {
        x: "roast",
        y: [
          { field: "bags", title: "Bags", mark: "bar" },
          { field: "beans", title: "Bean cost", mark: "line", axis: "y2", format: { style: "currency", currency: "GBP", decimals: 0 } },
        ],
      },
      axes: {
        x: { title: "Roast" },
        y: { title: "Bags" },
        y2: { title: "Bean cost" },
      },
      legend: { values: true, position: "bottom" },
      tooltip: {
        mode: "index",
        position: "top",
        crosshair: true,
        crosshairLabel: true,
        fields: [
          { field: "bags", title: "Bags" },
          { field: "beans", title: "Bean cost", format: { style: "currency", currency: "GBP", decimals: 0 } },
        ],
      },
      annotations: [{ type: "rule", axis: "y", value: 700, dash: "dashed", label: "Bag target", labelPosition: "end" }],
      size: { width: 760, height: 320 },
      a11y: { alt: "Bags peak in Heat above the target line, and the bean bill peaks in the same roast." },
    },
  },
  {
    id: "bullet",
    title: "Café bags against the aim",
    caption: "The bar is the value, the marker is the aim, and the range is the wide mark.",
    span: "board-6",
    spec: {
      version: "1",
      id: "roastery-bullet",
      type: "bullet",
      title: "Café bags",
      theme: "soft",
      data: [{ desk: "Café", bags: 1880, aim: 1700, wide: 2400 }],
      encoding: { x: "desk", y: "bags", target: "aim" },
      mark: { ranges: ["wide"] },
      size: { width: 520, height: 160 },
      a11y: { alt: "Café bags are 1,880, past the aim of 1,700 and inside the wide mark of 2,400." },
    },
  },
  {
    id: "bridge",
    title: "Receipts bridge",
    caption: "Signed steps between two totals.",
    span: "board-6",
    spec: {
      version: "1",
      id: "roastery-bridge",
      type: "waterfall",
      title: "Receipts bridge",
      theme: "soft",
      locale: "en-GB",
      data: [
        { step: "Open", amount: 12000, total: true },
        { step: "Café", amount: 6400 },
        { step: "Wholesale", amount: 4100 },
        { step: "Beans", amount: -9800 },
        { step: "Close", amount: 12700, total: true },
      ],
      encoding: {
        x: "step",
        y: { field: "amount", format: { style: "currency", currency: "GBP", decimals: 0 } },
      },
      axes: { x: { title: "Step", rotate: -24 }, y: { title: "Pounds" } },
      tooltip: { position: "top", fields: [{ field: "amount", title: "Amount", format: { style: "currency", currency: "GBP", decimals: 0 } }] },
      size: { width: 520, height: 280 },
      a11y: { alt: "Receipts open at 12,000 pounds, café and wholesale add, beans subtract, and the close is 12,700." },
    },
  },
  {
    id: "spark",
    title: "This week's bags",
    caption: "A sparkline with no axes.",
    span: "board-12",
    spec: {
      version: "1",
      id: "roastery-spark",
      type: "sparkline",
      theme: "soft",
      data: [42, 48, 45, 61, 58, 73, 69],
      size: { width: 760, height: 88 },
      a11y: { alt: "Daily bags rise from 42 to 69 across the week, with a dip after the fourth day." },
    },
  },
];

function bikeCalendar(): { day: string; trips: number }[] {
  const start = Date.UTC(2026, 3, 6);
  const rows = [];
  for (let i = 0; i < 16 * 7; i += 1) {
    const day = new Date(start + i * 86400000).toISOString().slice(0, 10);
    rows.push({ day, trips: 6 + ((i * 13 + (i % 5) * 7) % 29) });
  }
  return rows;
}

export const bikeCharts: ChartSlot[] = [
  {
    id: "flows",
    title: "Neighbourhood flows",
    caption: "Trips from one dock to another.",
    span: "board-12",
    spec: {
      version: "1",
      id: "bike-flows",
      type: "sankey",
      title: "Where trips go",
      theme: "soft",
      data: [
        { from: "Lantern", to: "Quay", trips: 240 },
        { from: "Lantern", to: "Kiln", trips: 90 },
        { from: "Quay", to: "Moth", trips: 160 },
        { from: "Kiln", to: "Moth", trips: 70 },
        { from: "Moth", to: "Lantern", trips: 110 },
        { from: "Quay", to: "Lantern", trips: 130 },
      ],
      encoding: { source: "from", target: "to", y: "trips" },
      tooltip: { position: "right", fields: [{ field: "trips", title: "Trips" }] },
      size: { width: 760, height: 380 },
      a11y: { alt: "The largest flow is Lantern to Quay, 240 trips. Moth sends 110 back to Lantern." },
    },
  },
  {
    id: "calendar",
    title: "Trip calendar",
    caption: "One cell per day. Colour is the trip count.",
    span: "board-12",
    spec: {
      version: "1",
      id: "bike-calendar",
      type: "heatmap",
      title: "Daily trips",
      theme: "soft",
      data: bikeCalendar(),
      encoding: {
        x: { field: "day", type: "temporal", title: "Day" },
        color: { field: "trips", title: "Trips" },
      },
      mark: { layout: "calendar", weeks: 16 },
      size: { width: 760, height: 200 },
      a11y: { alt: "Daily trips over sixteen weeks vary between a quiet day and a busy day, with no empty week." },
    },
  },
  {
    id: "mix",
    title: "Classic and e-bike share",
    caption: "Each span sums to 100 percent. Tick labels are tilted.",
    span: "board-8",
    spec: {
      version: "1",
      id: "bike-mix",
      type: "stacked-area",
      title: "Fleet mix",
      theme: "soft",
      data: [
        { span: "Belt", classic: 80, ebike: 20 },
        { span: "Cinder", classic: 74, ebike: 32 },
        { span: "Glass", classic: 70, ebike: 41 },
        { span: "Hearth", classic: 66, ebike: 48 },
        { span: "Iron", classic: 62, ebike: 55 },
        { span: "Jade", classic: 58, ebike: 64 },
      ],
      encoding: {
        x: "span",
        y: [
          { field: "classic", title: "Classic" },
          { field: "ebike", title: "E-bike" },
        ],
      },
      mark: { stack: "percent" },
      axes: { x: { title: "Span", rotate: -28 }, y: { title: "Share", format: "percent" } },
      legend: { values: true, position: "bottom" },
      tooltip: { mode: "index", position: "top", crosshair: true, crosshairLabel: true },
      size: { width: 640, height: 320 },
      a11y: { alt: "E-bike's share of trips grows from Belt to Jade, and classic shrinks to just under half." },
    },
  },
  {
    id: "donut",
    title: "Fleet",
    caption: "Slice labels and legend values.",
    span: "board-4",
    spec: {
      version: "1",
      id: "bike-fleet",
      type: "donut",
      title: "Fleet",
      theme: "soft",
      data: [
        { kind: "Classic", trips: 1840 },
        { kind: "E-bike", trips: 1260 },
      ],
      encoding: { x: "kind", y: "trips" },
      mark: { labels: true },
      legend: { values: true, position: "bottom" },
      tooltip: { position: "top", fields: [{ field: "trips", title: "Trips" }] },
      size: { width: 360, height: 320 },
      a11y: { alt: "Classic bikes take 1,840 trips and e-bikes take 1,260." },
    },
  },
];

export const mermaidBoards: { id: string; title: string; caption: string; span: "board-12"; source: string }[] = [
  {
    id: "gantt",
    title: "Launch lanes",
    caption: "A gantt with sections, a done lane, and a milestone.",
    span: "board-12",
    source: `gantt
    title Paper Kite
    dateFormat YYYY-MM-DD
    section Sketch
    Write the beats :done, beats, 2026-06-01, 2026-06-12
    Paint the kite :active, kite, 2026-06-08, 2026-06-26
    section Build
    Tune the glide :active, glide, after kite, 2026-06-22, 2026-07-10
    section Ship
    First flight :milestone, flight, after glide, 2026-07-17, 0d`,
  },
  {
    id: "timeline",
    title: "Studio years",
    caption: "Events and one era span.",
    span: "board-12",
    source: `timeline
    title Lumen and Co
    2022-05-02 : Two desks
    2023-09-14 : First prototype
    2024-02-01/2025-11-01 : Night builds
    2026-04-03 : Paper Kite named`,
  },
  {
    id: "journey",
    title: "Playtest journey",
    caption: "Scores from 1 to 5, with who was in the room.",
    span: "board-12",
    source: `journey
    title Paper Kite playtest
    section Arrive
    Find the tent: 5: Player
    Read the card: 4: Player, Writer
    section Fly
    First throw: 5: Player
    Lose the wind: 2: Player, Writer
    section Land
    Mark the map: 4: Player, Writer`,
  },
  {
    id: "quadrant",
    title: "What to build next",
    caption: "Effort across, delight up. Names stay on the points.",
    span: "board-12",
    source: `quadrantChart
    title Paper Kite bets
    x-axis Light effort --> Heavy effort
    y-axis Quiet delight --> Loud delight
    quadrant-1 Worth it
    quadrant-2 Do it now
    quadrant-3 Leave it
    quadrant-4 Later
    Kite skin: [0.24, 0.78]
    Wind hint: [0.7, 0.82]
    Night mode: [0.3, 0.28]
    Split screen: [0.74, 0.26]`,
  },
];

export interface BrokenCase {
  id: string;
  title: string;
  caption: string;
  spec: Record<string, unknown>;
}

const bakeryRows = [
  { sitting: "Dawn", loaves: 46 },
  { sitting: "Mid", loaves: 72 },
  { sitting: "Dusk", loaves: 38 },
];

export const repairCases: BrokenCase[] = [
  {
    id: "pie",
    title: "pie is not a type",
    caption: "The type pie is rewritten to donut.",
    spec: {
      version: "1",
      type: "pie",
      title: "Crumb mix",
      theme: "soft",
      data: [
        { part: "Crumb", grams: 180 },
        { part: "Crust", grams: 90 },
        { part: "Filling", grams: 140 },
      ],
      encoding: { x: "part", y: "grams" },
      size: { width: 420, height: 280 },
      a11y: { alt: "Crumb is the largest part of the mix, then filling, then crust." },
    },
  },
  {
    id: "values",
    title: "data.values is unwrapped",
    caption: "A Vega-style wrapper becomes a plain array.",
    spec: {
      version: "1",
      type: "bar",
      title: "Sittings",
      theme: "soft",
      data: { values: bakeryRows },
      encoding: { x: "sitting", y: "loaves" },
      size: { width: 520, height: 260 },
      a11y: { alt: "Mid sitting bakes the most loaves." },
    },
  },
  {
    id: "typo",
    title: "A mistyped field",
    caption: "The unknown field is pointed at the column that exists.",
    spec: {
      version: "1",
      type: "bar",
      title: "Sittings",
      theme: "soft",
      data: bakeryRows,
      encoding: { x: "sitting", y: "loafes" },
      size: { width: 520, height: 260 },
      a11y: { alt: "Mid sitting bakes the most loaves." },
    },
  },
  {
    id: "alt",
    title: "Missing alt text",
    caption: "validate() asks for one sentence, and repair() writes it.",
    spec: {
      version: "1",
      type: "bar",
      title: "Sittings",
      theme: "soft",
      data: bakeryRows,
      encoding: { x: "sitting", y: "loaves" },
      size: { width: 520, height: 260 },
    },
  },
  {
    id: "labels",
    title: "Labels on a line are accepted and not drawn",
    caption: "CK3012 warns. The line still renders. The labels are not painted.",
    spec: {
      version: "1",
      type: "line",
      title: "Loaves by sitting",
      theme: "soft",
      data: bakeryRows,
      encoding: { x: "sitting", y: "loaves" },
      mark: { labels: true },
      axes: { y: { title: "Loaves" } },
      size: { width: 560, height: 240 },
      a11y: { alt: "Loaves peak at the mid sitting. Mark labels are requested and not drawn on a line." },
    },
  },
];

export const stacks = [
  { id: "react", label: "React", feature: "framework.react" },
  { id: "vue", label: "Vue", feature: "framework.vue" },
  { id: "svelte", label: "Svelte", feature: "framework.svelte" },
  { id: "vanilla", label: "Vanilla ESM", feature: "framework.vanilla" },
  { id: "cdn", label: "CDN", feature: "framework.vanilla" },
  { id: "markdown", label: "Markdown", feature: "type.xychart.text" },
  { id: "node", label: "Node SVG", feature: "framework.vanilla" },
] as const;
