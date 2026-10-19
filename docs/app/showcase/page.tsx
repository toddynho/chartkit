import Link from "next/link";
import { ChartHost } from "@/components/ChartHost";
import { showcaseBoards } from "@/lib/showcase";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Showcase",
  "Twelve ChartKit boards: the first six, plus a volcano watch, a launch manifest, a discovery map, a nursery theme studio, a Mermaid sheet, and a field report.",
  "/showcase",
);

export default function ShowcasePage() {
  const boards = showcaseBoards();
  return (
    <div className="wrap section showcase">
      <h1>Showcase</h1>
      <p className="lede">
        Twelve boards. The newer six use export, legends (including a paged one), sequential, diverging, and threshold
        colour, and pound and euro formats. Specs are checked before the page builds. The sample data is fictional.
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
