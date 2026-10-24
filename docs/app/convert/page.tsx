import { ConvertDemo } from "@/components/ConvertDemo";
import { coverage } from "@chartkitdev/convert";
import { pageMeta } from "@/lib/site";
import Link from "next/link";

export const metadata = pageMeta(
  "Convert a chart",
  "Paste a Chart.js, Recharts, or ECharts config and compare it with the ChartKit spec, warnings, and chart.",
  "/convert",
);

const guides = [
  { href: "/docs/migrate/chartjs", label: "Chart.js" },
  { href: "/docs/migrate/recharts", label: "Recharts" },
  { href: "/docs/migrate/echarts", label: "ECharts" },
] as const;

export default function ConvertPage({ searchParams }: { searchParams?: { source?: string } }) {
  return (
    <div className="wrap section">
      <h1>Convert a chart</h1>
      <p className="lede">
        Paste a Chart.js config, Recharts JSX, or an ECharts option. The converter returns a ChartKit spec after{" "}
        <code>validate()</code> and <code>repair()</code>, plus a warning for anything it does not map. Chart.js,
        Recharts, and ECharts load on this page only. They are not part of the ChartKit bundles.{" "}
        <code>@chartkitdev/convert</code> is unpublished.
      </p>
      <ConvertDemo initial={searchParams?.source} />
      <section className="section" aria-labelledby="coverage">
        <h2 id="coverage">Conversion coverage</h2>
        <p>
          These lists are the converter&apos;s own coverage table. A mapped item is produced in the spec. An unsupported
          item is returned as a warning.
        </p>
        <div className="convert-coverage">
          {(
            [
              ["chartjs", "Chart.js", coverage.chartjs],
              ["recharts", "Recharts", coverage.recharts],
              ["echarts", "ECharts", coverage.echarts],
            ] as const
          ).map(([id, label, table]) => (
            <article key={id} className="card">
              <h3>{label}</h3>
              <h4>Mapped</h4>
              <ul>
                {table.mapped.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h4>Unsupported</h4>
              <ul>
                {table.unsupported.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p>
          Guides:{" "}
          {guides.map((guide, index) => (
            <span key={guide.href}>
              {index > 0 ? ", " : null}
              <Link href={guide.href}>{guide.label}</Link>
            </span>
          ))}
          .
        </p>
      </section>
    </div>
  );
}
