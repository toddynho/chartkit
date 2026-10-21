import { ChartView } from "@/components/ChartView";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Interaction",
  "A range navigator, synchronised charts, and drilldown. All three are JSON keys on the spec.",
  "/interaction",
);

const trace = Array.from({ length: 72 }, (_, t) => ({
  t,
  reading: Math.round((Math.sin(t / 6) * 18 + Math.sin(t / 2.2) * 4 + 40) * 10) / 10,
}));

const navigator = {
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

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
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

const sales = {
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

export default function InteractionPage() {
  return (
    <div className="wrap section">
      <h1>Interaction</h1>
      <p className="lede">
        The overview, the shared cursor, and the drilldown are keys on the spec. The server SVG records them and does not include the controls.
      </p>

      <h2>Overview</h2>
      <p>Drag the window, or focus it and use the arrow keys. The chart shows that range. The overview keeps the whole series.</p>
      <ChartView spec={navigator} />

      <h2>Synchronised charts</h2>
      <p>These three share <code>interaction.sync</code>. The crosshair, tooltip, and x zoom follow the month, not the row index.</p>
      <ChartView spec={synced("Revenue", revenue, "line", "series-1", { style: "compact", prefix: "$", decimals: 0 }, "Revenue rises from January to June.")} />
      <ChartView spec={synced("Orders", orders, "bar", "series-3", { style: "integer" }, "Orders follow the same months as revenue.")} />
      <ChartView spec={synced("Margin", margin, "line", "series-5", { style: "percent-raw", decimals: 0 }, "Margin stays near 20% across the same months.")} />

      <h2>Drilldown</h2>
      <p>The bars take a pointer. Choose North. Enter or Space does the same when the chart is focused. Back, or Escape, returns to the regions.</p>
      <ChartView spec={sales} />
    </div>
  );
}
