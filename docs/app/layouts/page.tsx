import { ChartView } from "@/components/ChartView";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Layout",
  "Small multiples, a composed dashboard, breakpoint rules, and a right-to-left chart. All four are JSON keys on the spec.",
  "/layouts",
);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const cities = ["Lisbon", "Porto", "Madrid", "Lyon", "Milan", "Oslo", "Dublin", "Prague"];

const facet = {
  version: "1" as const,
  type: "line" as const,
  title: "Rides by city",
  data: cities.flatMap((city, index) =>
    months.map((month, monthIndex) => ({
      city,
      month,
      rides: 40 + index * 18 + monthIndex * 6,
      bikes: 12 + index * 3 + monthIndex,
    })),
  ),
  encoding: {
    x: "month",
    y: [
      { field: "rides", title: "Rides", color: "series-1" },
      { field: "bikes", title: "Bikes", color: "series-3" },
    ],
  },
  axes: { x: { title: "Month" }, y: { title: "Count" } },
  layout: { facet: { field: "city", columns: 4, scales: "shared" as const, legend: "shared" as const } },
  size: { width: 880, height: 560 },
  a11y: { alt: "Eight cities share one rides and bikes scale. Lisbon is the lowest and Prague is the highest." },
};

const dashboard = {
  version: "1" as const,
  type: "line" as const,
  title: "Half year",
  layout: {
    concat: {
      direction: "vertical" as const,
      gap: 8,
      views: [
        {
          version: "1",
          type: "line",
          title: "Revenue",
          data: months.map((month, index) => ({ month, value: [120000, 132000, 128000, 151000, 149000, 170000][index] })),
          encoding: {
            x: "month",
            y: { field: "value", title: "Revenue", format: { style: "compact", prefix: "$", decimals: 0 }, color: "series-1" },
          },
          legend: false,
          a11y: { alt: "Revenue rises from January to June." },
        },
        {
          version: "1",
          type: "bar",
          title: "Orders",
          data: months.map((month, index) => ({ month, value: [80, 92, 88, 110, 104, 121][index] })),
          encoding: { x: "month", y: { field: "value", title: "Orders", format: { style: "integer" }, color: "series-3" } },
          legend: false,
          a11y: { alt: "Orders follow revenue." },
        },
        {
          version: "1",
          type: "line",
          title: "Margin",
          data: months.map((month, index) => ({ month, value: [18, 17, 19, 21, 20, 23][index] })),
          encoding: {
            x: "month",
            y: { field: "value", title: "Margin", format: { style: "percent-raw", decimals: 0 }, color: "series-5" },
          },
          legend: false,
          a11y: { alt: "Margin stays near 20 percent." },
        },
      ],
    },
  },
  size: { width: 720, height: 680 },
  a11y: { alt: "Revenue, orders, and margin in one spec." },
};

function breakpoint(width: number) {
  return {
    ...facet,
    title: width < 560 ? "Rides by city, narrow" : "Rides by city, wide",
    size: { width, height: width < 560 ? 980 : 560 },
    layout: {
      facet: { field: "city", columns: 4, scales: "shared" as const, legend: "shared" as const },
      breakpoints: [{ maxWidth: 560, columns: 1 }],
    },
    a11y: { alt: width < 560 ? "The eight cities stack in one column." : "The eight cities sit in four columns." },
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
  ],
  encoding: { x: "city", y: { field: "value", title: "المبيعات", color: "series-2" } },
  axes: { x: { title: "المدينة" }, y: { title: "المبيعات" } },
  layout: { direction: "rtl" as const },
  legend: false,
  size: { width: 640, height: 320 },
  a11y: { alt: "الرياض هي الأعلى، ثم جدة والدمام ومكة." },
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
        <code>layout.facet.field</code> splits the rows. These eight cities share one y domain and one legend.
      </p>
      <ChartView spec={facet} />

      <h2>Dashboard</h2>
      <p>
        <code>layout.concat.views</code> stacks three charts. Each view is a spec of its own.
      </p>
      <ChartView spec={dashboard} />

      <h2>Breakpoints</h2>
      <p>Below 560px the same facet uses one column. Above that it keeps four.</p>
      <ChartView spec={breakpoint(880)} />
      <ChartView spec={breakpoint(360)} />

      <h2>Right to left</h2>
      <p>
        <code>layout.direction</code> is <code>rtl</code>. The first city sits on the right and the y axis follows it.
      </p>
      <ChartView spec={rtl} />
    </div>
  );
}
