import { ChartView } from "@/lib/chart";
import { pageMeta } from "@/lib/site";
import type { Spec } from "@/lib/specs";

export const metadata = pageMeta(
  "Demo",
  "An observability dashboard rendered with ChartKit specs. The cards stack on a phone instead of clipping.",
  "/demo",
);

const kpis: Spec[] = [
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

const throughput: Spec = {
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

const services: Spec = {
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

export default function DemoPage() {
  return (
    <div className="wrap section">
      <h1>Observability</h1>
      <p className="lede">
        Same specs as the gallery, laid out as a dashboard. On a narrow screen the cards stack instead of clipping.
      </p>
      <div className="dash">
        {kpis.map((spec) => (
          <article className="card" key={spec.id}>
            <ChartView spec={spec} />
          </article>
        ))}
        <article className="card span-2">
          <ChartView spec={throughput} />
        </article>
        <article className="card span-2">
          <ChartView spec={services} />
        </article>
      </div>
    </div>
  );
}
