import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/CodeBlock";
import { ChartView } from "@/components/ChartView";
import { headline } from "@/lib/benchmarks";
import { chartkitCode, rivalBySlug, rivals, sameSpec } from "@/lib/rivals";
import { pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return rivals.map((rival) => ({ slug: rival.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const rival = rivalBySlug(params.slug);
  if (!rival) return {};
  return pageMeta(
    `ChartKit vs ${rival.name}`,
    `Honest comparison of ChartKit and ${rival.name}: bundle, server render, the agent eval, and when ${rival.name} is the better pick.`,
    `/compare/${rival.slug}`,
  );
}

export default function RivalPage({ params }: { params: { slug: string } }) {
  const rival = rivalBySlug(params.slug);
  if (!rival) notFound();

  const rows = [
    ["Line chart, gzip", `${headline.lineGzipBytes} bytes, size script`, rival.bundleBytes ? `${rival.bundleBytes.toLocaleString("en-US")} bytes` : "—"],
    ["Server render, 1k line", `${headline.ssrLabel} mean, SVG, no DOM`, rival.ssr],
    ["Agent eval, 2026-10-16", "20/42 no docs, then 42/42 with repair(). 42/42 with docs. 139.4 / 131.1 tokens. Not re-run for round 13.", rival.agent],
    ["Tooltips and zoom", "Client runtime, not the static SVG", rival.interaction],
  ];

  return (
    <div className="wrap section prose wide">
      <p className="kicker">
        <Link href="/compare">Compare</Link>
      </p>
      <h1>ChartKit vs {rival.name}</h1>
      <p className="lede">{rival.description}</p>
      <p>{rival.bundleNote}</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th> </th>
              <th>ChartKit</th>
              <th>{rival.name}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                <th scope="row">{row[0]}</th>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>When {rival.name} is the better pick</h2>
      <ul>
        {rival.betterWhen.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2>When ChartKit is the better pick</h2>
      <ul>
        {rival.chartkitWhen.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2>The same chart</h2>
      <p>
        Four quarters, units 40, 55, 48, 62. The ChartKit block is the JSON spec. The {rival.name} block is that
        library’s usual API, not the source the bench harness ran. Numbers and method are on{" "}
        <Link href="/benchmarks">Benchmarks</Link>. Machine-readable copy: <a href="/benchmarks.json">benchmarks.json</a>.
      </p>
      <ChartView spec={sameSpec} />
      <h3>ChartKit</h3>
      <CodeBlock code={chartkitCode} label="tsx" />
      <h3>{rival.name}</h3>
      <CodeBlock code={rival.theirCode} label={rival.theirLabel} />
      <p>
        Package: <code>{rival.npm}</code>. <Link href="/when-to-use">When to use ChartKit</Link>.
      </p>
    </div>
  );
}
