import Link from "next/link";
import { ChartHost } from "@/components/ChartHost";
import { showcaseBoards } from "@/lib/showcase";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Showcase",
  "Eighteen ChartKit boards, from one spec on every stack through export, paged legends, colour scales, and pound and euro formats.",
  "/showcase",
);

export default function ShowcasePage() {
  const boards = showcaseBoards();
  return (
    <div className="wrap section showcase">
      <h1>Showcase</h1>
      <p className="lede">
        Eighteen boards. Markers, leader lines, conditional colour, a returning sankey, and waterfall clicks sit with
        export, paged legends, colour scales, and pound and euro formats. Specs are checked before the page builds. The
        sample data is fictional.
      </p>
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
