/**
 * Specs copied from the Next pages that keep them inline.
 * docs/app/demo, interaction, and layouts. Paint renders these; the pages do not.
 */

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export const demoKpis = [
  {
    version: "1",
    id: "demo-requests",
    type: "kpi",
    metric: { label: "Requests", value: 2_850_000, delta: 0.124, format: { style: "compact", decimals: 2 } },
    data: [20, 22, 21, 28, 26, 30, 34, 33, 38],
    a11y: { alt: "Requests are 2.85 million, up 12.4 percent." },
  },
  {
    version: "1",
    id: "demo-errors",
    type: "kpi",
    metric: {
      label: "Error rate",
      value: 0.0023,
      delta: -0.18,
      format: { style: "percent", decimals: 2 },
      goodDirection: "down",
    },
    data: [9, 8, 8, 6, 5, 4, 4, 3],
    a11y: { alt: "Error rate is 0.23 percent, down 18 percent." },
  },
  {
    version: "1",
    id: "demo-p95",
    type: "kpi",
    metric: { label: "p95", value: 245, delta: 0.04, format: "duration-ms" },
    data: [30, 28, 32, 40, 36, 34, 33, 31],
    a11y: { alt: "p95 latency is 245 milliseconds, up 4 percent." },
  },
  {
    version: "1",
    id: "demo-apdex",
    type: "kpi",
    metric: { label: "Apdex", value: 0.94, delta: 0.02, format: { style: "number", decimals: 2 } },
    data: [88, 90, 89, 91, 93, 92, 94, 94],
    a11y: { alt: "Apdex is 0.94, up 2 percent." },
  },
];

export const demoThroughput = {
  version: "1",
  id: "demo-throughput",
  type: "line",
  title: "Requests",
  data: ["06", "08", "10", "12", "14", "16", "18", "20"].map((hour, i) => ({
    hour,
    requests: [40, 62, 88, 120, 110, 96, 70, 48][i],
  })),
  encoding: { x: "hour", y: { field: "requests", title: "Requests", area: true } },
  legend: false,
  size: { width: 640, height: 280 },
  a11y: { alt: "Requests climb through the morning, peak at noon, and fall through the evening." },
};

export const demoServices = {
  version: "1",
  id: "demo-services",
  type: "bar",
  title: "Errors by service",
  data: [
    { service: "API", errors: 18 },
    { service: "Web", errors: 7 },
    { service: "Jobs", errors: 11 },
    { service: "Auth", errors: 4 },
  ],
  encoding: { x: "service", y: "errors" },
  legend: false,
  size: { width: 480, height: 280 },
  a11y: { alt: "The API has the most errors at 18. Auth has 4." },
};

const trace = Array.from({ length: 72 }, (_, t) => ({
  t,
  reading: Math.round((Math.sin(t / 6) * 18 + Math.sin(t / 2.2) * 4 + 40) * 10) / 10,
}));

export const navigatorSpec = {
  version: "1" as const,
  type: "line" as const,
  title: "Sensor trace",
  data: trace,
  encoding: { x: "t", y: "reading" },
  legend: false,
  mark: { curve: "monotone" as const, points: "none" as const },
  axes: { x: { title: "Sample" }, y: { title: "Reading" } },
  interaction: { navigator: { height: 56 }, initialRange: [18, 48] },
  size: { width: 720, height: 280 },
  a11y: { alt: "A sensor trace with an overview of all 72 samples and a window from 18 to 48." },
};

const revenue = [120000, 132000, 128000, 151000, 149000, 170000];
const orders = [80, 92, 88, 110, 104, 121];
const margin = [18, 17, 19, 21, 20, 23];

function synced(
  title: string,
  values: number[],
  type: "line" | "bar",
  color: string,
  format: { style: string; prefix?: string; decimals?: number },
  alt: string,
) {
  return {
    version: "1" as const,
    type,
    title,
    data: months.map((month, index) => ({ month, value: values[index] })),
    encoding: { x: "month", y: { field: "value", title, format, color } },
    legend: false,
    axes: { x: { title: "Month" }, y: { title } },
    interaction: { sync: "quarter", zoom: "x" as const },
    size: { width: 720, height: 220 },
    a11y: { alt },
  };
}

export const syncedSpecs = [
  synced("Revenue", revenue, "line", "series-1", { style: "compact", prefix: "$", decimals: 0 }, "Revenue rises from January to June."),
  synced("Orders", orders, "bar", "series-3", { style: "integer" }, "Orders follow the same months as revenue."),
  synced("Margin", margin, "line", "series-5", { style: "percent-raw", decimals: 0 }, "Margin stays near 20% across the same months."),
];

const north = {
  version: "1" as const,
  type: "bar" as const,
  title: "North",
  data: [
    { month: "Jan", revenue: 42000 },
    { month: "Feb", revenue: 45500 },
    { month: "Mar", revenue: 39800 },
    { month: "Apr", revenue: 51200 },
    { month: "May", revenue: 47600 },
    { month: "Jun", revenue: 53400 },
  ],
  encoding: {
    x: "month",
    y: { field: "revenue", title: "Revenue", format: { style: "compact", prefix: "$", decimals: 0 }, color: "series-4" },
  },
  axes: { x: { title: "Month" }, y: { title: "Revenue" } },
  a11y: { alt: "North revenue climbs from $42k in January to $53k in June." },
};

export const salesSpec = {
  version: "1" as const,
  type: "bar" as const,
  title: "Sales by region",
  data: [
    { region: "North", revenue: 186000 },
    { region: "West", revenue: 164000 },
    { region: "South", revenue: 142000 },
    { region: "East", revenue: 128000 },
  ],
  encoding: {
    x: "region",
    y: { field: "revenue", title: "Revenue", format: { style: "compact", prefix: "$", decimals: 0 }, color: "series-2" },
  },
  axes: { x: { title: "Region" }, y: { title: "Revenue" } },
  interaction: { drilldown: { key: "region", children: { North: north } } },
  size: { width: 720, height: 280 },
  a11y: { alt: "North leads sales. Choose North to see the months." },
};

const cities = ["Lisbon", "Porto", "Madrid", "Lyon", "Milan", "Oslo", "Dublin", "Prague"];

const rides: Record<string, number[]> = {
  Lisbon: [48, 52, 61, 74, 86, 91],
  Porto: [44, 41, 55, 63, 58, 49],
  Madrid: [39, 46, 58, 71, 88, 96],
  Lyon: [31, 28, 36, 52, 64, 59],
  Milan: [36, 33, 42, 57, 66, 61],
  Oslo: [22, 24, 31, 48, 67, 74],
  Dublin: [40, 38, 43, 47, 51, 46],
  Prague: [27, 25, 34, 49, 62, 55],
};

const bikes: Record<string, number[]> = {
  Lisbon: [18, 20, 24, 29, 33, 35],
  Porto: [16, 15, 19, 22, 21, 17],
  Madrid: [14, 17, 21, 26, 31, 34],
  Lyon: [11, 10, 13, 18, 22, 20],
  Milan: [13, 12, 15, 19, 23, 21],
  Oslo: [8, 9, 12, 18, 24, 27],
  Dublin: [15, 14, 16, 17, 19, 16],
  Prague: [9, 8, 12, 17, 21, 18],
};

const facet = {
  version: "1" as const,
  type: "line" as const,
  title: "Rides by city",
  data: cities.flatMap((city) =>
    months.map((month, monthIndex) => ({
      city,
      month,
      rides: rides[city]?.[monthIndex] ?? 0,
      bikes: bikes[city]?.[monthIndex] ?? 0,
    })),
  ),
  encoding: {
    x: "month",
    y: [
      { field: "rides", title: "Rides", color: "series-1" },
      { field: "bikes", title: "Bikes", color: "series-3" },
    ],
  },
  axes: { x: { title: "Month" }, y: { title: "Rides" } },
  layout: { facet: { field: "city", columns: 4, scales: "shared" as const, legend: "shared" as const } },
  size: { width: 880, height: 560 },
  a11y: { alt: "Eight cities share one rides scale. Madrid peaks in June and Porto peaks in April." },
};

function breakpoint(width: number) {
  const narrow = width <= 560;
  return {
    ...facet,
    title: narrow ? "Rides by city, narrow" : "Rides by city, wide",
    size: { width, height: narrow ? 920 : 560 },
    layout: {
      facet: { field: "city", columns: 4, scales: "shared" as const, legend: "shared" as const },
      breakpoints: [{ maxWidth: 560, columns: 2 }],
    },
    a11y: { alt: narrow ? "The eight cities sit in two columns." : "The eight cities sit in four columns." },
  };
}

export const layoutRule = `{
  "layout": {
    "facet": { "field": "city", "columns": 4, "scales": "shared", "legend": "shared" },
    "breakpoints": [{ "maxWidth": 560, "columns": 2 }]
  }
}`;

export const layoutSpecs = {
  facet,
  wide: breakpoint(880),
  narrow: breakpoint(420),
  dashboard: {
    version: "1" as const,
    type: "line" as const,
    title: "Harbor week",
    layout: {
      concat: {
        columns: 2,
        gap: 16,
        views: [
          {
            version: "1",
            type: "line",
            span: 2,
            title: "Arrivals",
            data: months.map((month, index) => ({ month, value: [42, 38, 55, 49, 67, 61][index] })),
            encoding: { x: "month", y: { field: "value", title: "Ships", color: "series-1" } },
            legend: false,
            a11y: { alt: "Arrivals peak in May." },
          },
          {
            version: "1",
            type: "bar",
            title: "Docks",
            data: [
              { dock: "North", ships: 18 },
              { dock: "East", ships: 12 },
              { dock: "South", ships: 15 },
              { dock: "West", ships: 9 },
            ],
            encoding: { x: "dock", y: { field: "ships", title: "Ships", color: "series-3" } },
            legend: false,
            a11y: { alt: "North dock handles the most ships." },
          },
          {
            version: "1",
            type: "donut",
            title: "Cargo",
            data: [
              { kind: "Grain", tons: 42 },
              { kind: "Oil", tons: 28 },
              { kind: "Timber", tons: 18 },
              { kind: "Mail", tons: 12 },
            ],
            encoding: { x: "kind", y: "tons" },
            mark: { innerRadius: 0.62 },
            a11y: { alt: "Grain is the largest cargo share." },
          },
        ],
      },
    },
    size: { width: 760, height: 640 },
    a11y: { alt: "Arrivals across the week, ships by dock, and cargo share." },
  },
  rtl: {
    version: "1" as const,
    type: "bar" as const,
    title: "المبيعات حسب المدينة",
    data: [
      { city: "الرياض", value: 186 },
      { city: "جدة", value: 164 },
      { city: "الدمام", value: 142 },
      { city: "مكة", value: 128 },
      { city: "المدينة", value: 151 },
      { city: "الدوحة", value: 119 },
    ],
    encoding: { x: "city", y: { field: "value", title: "المبيعات", color: "series-2" } },
    axes: { x: { title: "المدينة" }, y: { title: "المبيعات" } },
    layout: { direction: "rtl" as const },
    legend: false,
    size: { width: 640, height: 340 },
    a11y: { alt: "الرياض هي الأعلى، ثم جدة والمدينة والدمام ومكة والدوحة." },
  },
  hebrew: {
    version: "1" as const,
    type: "line" as const,
    title: "נוסעים בתל אביב",
    data: [
      { month: "ינו", value: 42 },
      { month: "פבר", value: 38 },
      { month: "מרץ", value: 55 },
      { month: "אפר", value: 49 },
      { month: "מאי", value: 63 },
      { month: "יוני", value: 71 },
    ],
    encoding: { x: "month", y: { field: "value", title: "אלפים", color: "series-1" } },
    axes: { x: { title: "חודש" }, y: { title: "אלפים" } },
    layout: { direction: "rtl" as const },
    legend: false,
    size: { width: 640, height: 300 },
    a11y: { alt: "יוני הוא החודש העמוס ביותר." },
  },
};

export const lookLine = {
  version: "1" as const,
  type: "line",
  title: "Revenue",
  data: [
    { month: "Jan", revenue: 42, target: 40 },
    { month: "Feb", revenue: 46, target: 43 },
    { month: "Mar", revenue: 44, target: 46 },
    { month: "Apr", revenue: 51, target: 49 },
    { month: "May", revenue: 58, target: 52 },
    { month: "Jun", revenue: 55, target: 55 },
  ],
  encoding: {
    x: "month",
    y: [
      { field: "revenue", title: "Revenue", area: true },
      { field: "target", title: "Target" },
    ],
  },
  mark: { curve: "monotone" },
  size: { width: 640, height: 260 },
  a11y: { alt: "Revenue stays near the target and finishes above it." },
};

export const lookBars = {
  version: "1" as const,
  type: "bar",
  title: "Stops",
  data: [
    { lane: "A", stops: 12 },
    { lane: "B", stops: 7 },
    { lane: "C", stops: 15 },
    { lane: "D", stops: 9 },
  ],
  encoding: { x: "lane", y: "stops", color: "lane" },
  legend: false,
  size: { width: 420, height: 260 },
  a11y: { alt: "Lane C has the most stops, then A, D, and B." },
};

export const LOOKS = [
  { id: "soft", label: "Soft", detail: "Default. Omit theme, or set auto or soft. Transparent plot on a #f5f5f7 / #1c1c1e card." },
  { id: "refined", label: "Refined", detail: "Built in. Quieter chrome, blue then rose. Same light-dark switch as Soft." },
  { id: "editorial", label: "Editorial", detail: "Built in. Indigo lead, dots on, a slightly heavier stroke." },
  { id: "midnight", label: "Midnight", detail: "Opt-in dark card. It does not follow the page scheme." },
] as const;
