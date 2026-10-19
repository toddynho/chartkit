import Link from "next/link";
import { notFound } from "next/navigation";
import { OptionList, ShowcaseStage } from "@/components/ShowcaseStage";
import { boardBySlug, showcaseBoards } from "@/lib/showcase";
import { pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return showcaseBoards().map((board) => ({ slug: board.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const board = boardBySlug(params.slug);
  if (!board) return {};
  const meta = pageMeta(board.title, board.lede, `/showcase/${board.slug}`);
  return {
    ...meta,
    alternates: {
      ...meta.alternates,
      types: { "text/markdown": `https://chartkit.dev/showcase/${board.slug}.md` },
    },
  };
}

export default function ShowcaseBoardPage({ params }: { params: { slug: string } }) {
  const board = boardBySlug(params.slug);
  if (!board) notFound();
  const sources = board.sources;
  return (
    <div className="wrap section showcase">
      <p className="kicker">
        <Link href="/showcase">Showcase</Link>
        {" · "}
        {String(board.number).padStart(2, "0")}
      </p>
      <h1>{board.title}</h1>
      <p className="lede">{board.lede}</p>
      {sources ? (
        <p>
          Bundle bytes are from <code>docs/data/measured-sizes.json</code>, measured {sources.sizeMeasured} on{" "}
          <code>{sources.sizeCommit}</code> for the size script and {sources.benchMeasured} for the bench bundles.
          Timings are older round {sources.round}, measured {sources.roundMeasured} on <code>{sources.roundCommit}</code>
          , from <code>benchmarks.json</code>. They were not re-run with these bundles.
        </p>
      ) : null}
      <ShowcaseStage charts={board.charts} mermaid={board.mermaid} repairs={board.repairs} stacks={board.stacks} />
      {board.losses?.length ? (
        <>
          <h2>Losses</h2>
          <ul className="loss-list">
            {board.losses.map((loss) => (
              <li key={loss.label}>
                <strong className="loss">{loss.label}</strong> {loss.detail}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <h2>Options used</h2>
      <p>
        Each link is a row in the feature matrix. The list is the options these specs set.{" "}
        <a href={`/showcase/${board.slug}.md`}>{board.slug}.md</a> is the same board for an agent.
      </p>
      <OptionList options={board.options} />
    </div>
  );
}
