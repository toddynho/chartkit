import Link from "next/link";
import { ChartHost } from "@/components/ChartHost";
import { dashboards } from "@/lib/dashboards";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Dashboards",
  "Four ChartKit dashboards styled after Stripe, Plausible, Google Analytics, and Sentry. Chart colour comes from the spec.",
  "/dashboards",
);

export default function DashboardsPage() {
  const boards = dashboards();
  return (
    <div className="wrap section">
      <h1>Dashboards</h1>
      <p className="lede">
        Four boards styled after familiar dashboards, so the range of ChartKit&apos;s styling is visible. Each chart is a
        JSON spec. Colour, grid, and series come from theme.tokens. The page CSS styles the shell. ChartKit is not
        affiliated with or endorsed by those products.
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
