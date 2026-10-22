import Link from "next/link";
import { ChartHost } from "@/components/ChartHost";
import { dashboards } from "@/lib/dashboards";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Dashboards",
  "Four ChartKit dashboards. Each one is JSON specs plus a token override, in Soft and Midnight.",
  "/dashboards",
);

export default function DashboardsPage() {
  const boards = dashboards();
  return (
    <div className="wrap section">
      <h1>Dashboards</h1>
      <p className="lede">
        Four original boards. Each chart is a ChartKit JSON spec. Colour and type come from a token override on the page,
        not a new bundle preset. Inspired by common SaaS dashboard styles. ChartKit is not affiliated with any product.
      </p>
      <div className="gallery-index">
        {boards.map((board) => {
          const cover = board.charts.find((chart) => chart.spec.type !== "kpi") ?? board.charts[0];
          return (
            <article key={board.slug} className={`board-card dash-${board.slug}`}>
              <p className="kicker">{board.defaultTheme === "midnight" ? "Dark first" : "Soft first"}</p>
              <h2>
                <Link href={`/dashboards/${board.slug}`}>{board.title}</Link>
              </h2>
              <p>{board.lede}</p>
              {cover ? <ChartHost spec={cover.spec} svg={cover.svg} className="chart-host chart-preset" /> : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
