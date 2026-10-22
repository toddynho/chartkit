import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardStage } from "@/components/DashboardStage";
import { dashboardBySlug, dashboards } from "@/lib/dashboards";
import { pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return dashboards().map((board) => ({ slug: board.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const board = dashboardBySlug(params.slug);
  if (!board) return {};
  const meta = pageMeta(board.title, board.lede, `/dashboards/${board.slug}`);
  return {
    ...meta,
    alternates: {
      ...meta.alternates,
      types: { "text/markdown": `https://chartkit.dev/dashboards/${board.slug}.md` },
    },
  };
}

export default function DashboardPage({ params }: { params: { slug: string } }) {
  const board = dashboardBySlug(params.slug);
  if (!board) notFound();
  return (
    <div className="wrap section">
      <p className="kicker">
        <Link href="/dashboards">Dashboards</Link>
        {" · "}
        {board.product}
      </p>
      <h1>{board.title}</h1>
      <p className="lede">{board.lede}</p>
      <p>
        <a href={`/dashboards/${board.slug}.md`}>{board.slug}.md</a> is the same board for an agent.
      </p>
      <DashboardStage board={board} />
    </div>
  );
}
