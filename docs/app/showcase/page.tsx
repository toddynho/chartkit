import Link from "next/link";
import { ChartHost } from "@/components/ChartHost";
import { dashboards } from "@/lib/dashboards";
import { showcaseBoards } from "@/lib/showcase";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Showcase",
  "Thirty ChartKit boards, from one spec on every stack through a cellar treemap, a sunburst, a kiln firing, and a radio desk.",
  "/showcase",
);

export default function ShowcasePage() {
  const boards = showcaseBoards();
  return (
    <div className="wrap section showcase">
      <h1>Showcase</h1>
      <p className="lede">
        Thirty boards. A cellar treemap beside its sunburst, a yard of hours, a market fortnight, and a community-radio
        desk sit with range bands, floating bars, whiskers, a zoned hour axis, and a custom element. Specs are checked
        before the page builds. The sample data is fictional.
      </p>
      <h2>Dashboards</h2>
      <p className="lede">
        Ten boards, styled after familiar dashboards. Colour comes from theme.tokens. Fonts are Inter or Roboto.
        ChartKit is not affiliated with or endorsed by those products.
      </p>
      <div className="gallery-index">
        {dashboards().map((board) => {
          const cover = board.charts.find((chart) => chart.spec.type !== "kpi") ?? board.charts[0];
          return (
            <article key={board.slug} className={`board-card dash-${board.slug}`}>
              <p className="kicker">{board.defaultTheme === "midnight" ? "Dark first" : "Soft first"}</p>
              <h3>
                <Link href={`/dashboards/${board.slug}`}>{board.title}</Link>
              </h3>
              <p>{board.lede}</p>
              {cover ? <ChartHost spec={cover.spec} svg={cover.svg} className="chart-host chart-preset" /> : null}
            </article>
          );
        })}
      </div>
      <h2>Boards</h2>
      <div className="gallery-index">
        {boards.map((board) => {
          const cover = board.charts[0] ?? board.mermaid?.[0]?.chart;
          const repair = board.repairs?.[0];
          return (
            <article key={board.slug} className="board-card">
              <p className="kicker">{String(board.number).padStart(2, "0")}</p>
              <h2>
                <Link href={`/showcase/${board.slug}`}>{board.title}</Link>
              </h2>
              <p>{board.lede}</p>
              {cover ? <ChartHost spec={cover.spec} svg={cover.svg} className="chart-host chart-preset" /> : null}
              {repair?.svg ? <ChartHost spec={repair.repaired ?? {}} svg={repair.svg} className="chart-host chart-preset" /> : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
