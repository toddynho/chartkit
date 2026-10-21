import { ChartView } from "@/components/ChartView";
import { CodeBlock } from "@/components/CodeBlock";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Layout",
  "Small multiples, a composed dashboard, breakpoint rules, and a right-to-left chart. All four are JSON keys on the spec.",
  "/layouts",
);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
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

const rule = `{
  "layout": {
    "facet": { "field": "city", "columns": 4, "scales": "shared", "legend": "shared" },
    "breakpoints": [{ "maxWidth": 560, "columns": 2 }]
  }
}`;

const dashboard = {
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

const rtl = {
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
};

const hebrew = {
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
};

export default function LayoutsPage() {
  return (
    <div className="wrap section">
      <h1>Layout</h1>
      <p className="lede">
        Facets, concatenated views, breakpoint rules, and right-to-left text are keys on the spec. One JSON document draws the whole figure.
      </p>

      <h2>Small multiples</h2>
      <p>
        <code>layout.facet.field</code> splits the rows. These eight cities share one y domain and one legend. With shared scales, the y title and ticks sit on the outer column and the x ticks sit on the bottom row.
      </p>
      <ChartView spec={facet} />

      <h2>Dashboard</h2>
      <p>
        <code>layout.concat.columns</code> wraps the views. The arrivals line sets <code>span: 2</code>, so it sits above the dock bars and the cargo donut. The title belongs to the outer spec.
      </p>
      <ChartView spec={dashboard} />

      <h2>Breakpoints</h2>
      <p>The same facet uses four columns until the width is 560 or below, then two. Each panel stays tall enough for the ticks.</p>
      <CodeBlock code={rule} label="json" />
      <ChartView spec={breakpoint(880)} />
      <ChartView spec={breakpoint(420)} />

      <h2>Right to left</h2>
      <p>
        <code>layout.direction</code> is <code>rtl</code>. The first city sits on the right, every bar is drawn, and the y axis follows it. The line below uses Hebrew month labels.
      </p>
      <ChartView spec={rtl} />
      <ChartView spec={hebrew} />
    </div>
  );
}
