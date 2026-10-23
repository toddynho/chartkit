import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { ChartView } from "@/components/ChartView";
import {
  AGENT_MEASURED,
  CORE_COMMIT,
  MEASURED,
  ROUND,
  agentRows,
  browserRows,
  bundleRace,
  bundleRows,
  firstHoverRows,
  headline,
  hoverRows,
  initial100k,
  initial1k,
  initial1m,
  raceSpec,
  samplingRows,
  published,
  ssrRace,
  ssrRows,
  updateMethod,
} from "@/lib/benchmarks";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMeta(
    "Benchmarks",
    "Published ChartKit benchmark numbers: bundle size, browser render, server render, sampling, and the agent eval. Losses included.",
    "/benchmarks",
  ),
  alternates: {
    canonical: "https://chartkit.dev/benchmarks",
    types: { "text/markdown": "https://chartkit.dev/benchmarks.md" },
  },
};

export default function BenchmarksPage() {
  return (
    <div className="wrap section prose wide">
      <h1>Benchmarks</h1>
      <p className="lede">
        Round {ROUND}, measured {MEASURED} on phase 2 <code>{CORE_COMMIT}</code>. Five browser samples, Playwright
        Chromium, a 640×360 line, three x spacings. This page does not re-time the libraries. The same numbers are in{" "}
        <a href="/benchmarks.json">benchmarks.json</a> (schema <a href="/benchmarks.schema.json">benchmarks.schema.json</a>)
        and <a href="/benchmarks.md">benchmarks.md</a>. The agent eval was not re-run; it stays {AGENT_MEASURED}.
      </p>
      <p>{updateMethod}</p>

      <h2>Bundle size</h2>
      <p>
        ChartKit’s line entry is {headline.lineGzipBytes} bytes gzip ({headline.lineGzipLabel}), from{" "}
        <code>scripts/size.mjs</code> on <code>{headline.sizeCommit}</code>, measured {headline.sizeMeasured}.{" "}
        {headline.bundleLoss} {headline.lineWins} The harness minimal line on that run is {headline.harnessLineBytes}{" "}
        bytes. {headline.donutWin}
      </p>
      <ChartView spec={raceSpec(bundleRace)} />
      <p className="meta">{bundleRace.caption}</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Library</th>
              <th className="num">gzip bytes</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {bundleRows.map((row) => (
              <tr key={row.lib}>
                <td>{row.lib}</td>
                <td className="num">{row.gzip}</td>
                <td>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Browser render</h2>
      <p>
        ChartKit wins the initial render in all 12 cells against uPlot. Even 1,000,000 points is 23.6 ms vs 26.5 ms.
        The aligned update wins 6 of 12 and loses 6. The losses are in the table, not a footnote: even 1k (1.5 vs 1.2),
        even 10k (1.9 vs 1.7), jittered 1k (1.6 vs 1.4), and gapped timestamps at 1k (1.6 vs 1.4), 10k (1.9 vs 1.6),
        and 100k (3.5 vs 3.4).
      </p>
      <div className="grid-2">
        <article className="card">
          <ChartView spec={raceSpec(initial1k)} />
          <p className="meta">{initial1k.caption}</p>
        </article>
        <article className="card">
          <ChartView spec={raceSpec(initial100k)} />
          <p className="meta">{initial100k.caption}</p>
        </article>
      </div>
      <article className="card">
        <ChartView spec={raceSpec(initial1m)} />
        <p className="meta">{initial1m.caption}</p>
      </article>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>X spacing</th>
              <th>Points</th>
              <th className="num">ChartKit initial</th>
              <th className="num">uPlot initial</th>
              <th className="num">ChartKit update</th>
              <th className="num">uPlot update</th>
              <th>Call</th>
            </tr>
          </thead>
          <tbody>
            {browserRows.map((row) => (
              <tr key={`${row.shape}-${row.points}`}>
                <td>{row.shape}</td>
                <td>{row.points}</td>
                <td className="num">{row.ckI}</td>
                <td className="num">{row.upI}</td>
                <td className="num">{row.ckU}</td>
                <td className="num">{row.upU}</td>
                <td className={row.tone === "loss" ? "loss" : undefined}>{row.call}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        In these 12 cells ChartKit is also faster than Chart.js and Observable Plot on both the initial and the aligned
        update. Even 1,000,000 points: Chart.js updates in 189.8 ms and Plot in 1,295.8 ms. ECharts, Recharts, and Nivo
        are not in the round 13 browser rows, so this page does not give them a browser millisecond.
      </p>

      <CanvasLine />

      <h2>Hover</h2>
      <p>
        Steady hover at 100,000 points is close. ChartKit’s painted median is 16.5 ms and uPlot’s is 16.2 ms. First
        hover on a fresh chart is not close: uPlot paints in 4 to 4.9 ms, and ChartKit paints in 15.9 to 20.8 ms.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Library</th>
              <th className="num">Tip ms</th>
              <th className="num">Painted median ms</th>
              <th className="num">Painted p95 ms</th>
            </tr>
          </thead>
          <tbody>
            {hoverRows.map((row) => (
              <tr key={row.lib}>
                <td>{row.lib}</td>
                <td className="num">{row.tip}</td>
                <td className="num">{row.painted}</td>
                <td className="num">{row.p95}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>First hover</th>
              <th className="num">ChartKit painted</th>
              <th className="num">ChartKit max</th>
              <th className="num">uPlot painted</th>
              <th className="num">uPlot max</th>
            </tr>
          </thead>
          <tbody>
            {firstHoverRows.map((row) => (
              <tr key={row.delay}>
                <td>{row.delay}</td>
                <td className="num">{row.ck}</td>
                <td className="num">{row.ckMax}</td>
                <td className="num">{row.uplot}</td>
                <td className="num">{row.uplotMax}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Downsampling</h2>
      <div className="note">
        <strong>The fast large-series times use sampling.</strong>
        <code>mark.sampling</code> defaults to <code>auto</code>, which minmax-downsamples a line once it is longer than
        twice the plot width. 1,000 points stay complete. 10k, 100k, and 1M do not. With sampling off, ChartKit draws
        every point:
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Points, sampling none</th>
              <th className="num">Initial ms</th>
              <th className="num">Update ms</th>
            </tr>
          </thead>
          <tbody>
            {samplingRows.map((row) => (
              <tr key={row.points}>
                <td>{row.points}</td>
                <td className="num">{row.initial}</td>
                <td className="num">{row.update}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        These sampling-none times use the same fair update timer. At 1,000,000 points that is 471.8 ms to draw and
        462.4 ms to update, not the old two-frame figure.
      </p>

      <h2>Server render</h2>
      <ChartView spec={raceSpec(ssrRace)} />
      <p className="meta">{ssrRace.caption}</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Library</th>
              <th className="num">Mean ms</th>
              <th className="num">Median ms</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ssrRows.map((row) => (
              <tr key={row.lib}>
                <td>{row.lib}</td>
                <td className="num">{row.mean}</td>
                <td className="num">{row.median}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="agents">Agent eval</h2>
      <p>
        Not re-run for round {ROUND}. One model, claude-sonnet-4-5, temperature 0, one run on {AGENT_MEASURED}, 42 tasks. “Official” means
        the library’s docs were in the prompt. ChartKit’s docs are <Link href="/llms.txt">llms.txt</Link>, taken from
        the Phase 1 branch and not edited on this site. The previous llms.txt, the React-only v0 file, scored 18/42 in
        an earlier run.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Library</th>
              <th>No docs, first</th>
              <th>No docs, within two</th>
              <th>Official, first</th>
              <th>Official, within two</th>
              <th>Mean first-try tokens, no docs / official</th>
            </tr>
          </thead>
          <tbody>
            {agentRows.map((row) => (
              <tr key={row.lib}>
                <td>{row.lib}</td>
                <td>{row.noFirst}</td>
                <td>{row.noTwo}</td>
                <td>{row.offFirst}</td>
                <td>{row.offTwo}</td>
                <td>{row.tokens}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        ChartKit’s first try with no docs is {headline.repairFrom}. Recharts, ECharts, and Chart.js were 42/42 with no
        docs. <code>repair()</code>, with no model call, takes that ChartKit output to {headline.repairTo}. With the
        official docs, ChartKit’s first try is already 42/42, at a mean of {published.agents[0].tokensOfficial} output
        tokens. Recharts with its docs used a mean of {published.agents[1].tokensOfficial}, ECharts{" "}
        {published.agents[2].tokensOfficial}, and Chart.js {published.agents[3].tokensOfficial}. The other libraries
        have no repair step. Phase 1 grew llms.txt
        to 8,274 bytes, about 1.9 KB more than the competitor excerpts. A ChartKit-only rerun with the file cut to
        6,329 bytes scored 41/42 on the first try. The miss was a combo axis, CK3002, which <code>repair()</code> does
        not patch. The headline numbers use the full file. <Link href="/agents">How to use the loop</Link>.
      </p>
    </div>
  );
}

interface CanvasRow {
  id: string;
  points: number;
  renderMs?: number | null;
  initialMs?: number | null;
  updateMs?: number | null;
}

function CanvasLine() {
  const bench = JSON.parse(readFileSync(join(process.cwd(), "data/canvas-bench.json"), "utf8")) as { measured?: string; rows: CanvasRow[] };
  const at = (id: string, points: number) => bench.rows.find((row) => row.id === id && row.points === points);
  const text = (value: number | null | undefined) => (typeof value === "number" ? value.toFixed(1) : "—");
  const body: { points: string; cells: string[] }[] = [];
  const losses: string[] = [];
  for (const points of [10_000, 100_000, 1_000_000]) {
    const label = points >= 1_000_000 ? "1,000,000" : points.toLocaleString("en-US");
    const svg = at("chartkit", points);
    const canvas = at("chartkit-canvas", points);
    const uplot = at("uplot", points);
    body.push({
      points: label,
      cells: [text(svg?.renderMs), text(canvas?.renderMs), text(svg?.initialMs), text(canvas?.initialMs), text(uplot?.initialMs), text(svg?.updateMs), text(canvas?.updateMs), text(uplot?.updateMs)],
    });
    if (typeof canvas?.initialMs === "number") {
      losses.push(`${label} is ${text(canvas.initialMs)} ms against SVG ${text(svg?.initialMs)} and uPlot ${text(uplot?.initialMs)}`);
    }
  }
  const heads = ["SVG render", "Canvas render", "SVG first", "Canvas first", "uPlot first", "SVG update", "Canvas update", "uPlot update"];
  return (
    <>
      <h2>Canvas line</h2>
      <p>
        Measured {bench.measured ?? "separately"}, median of 5, Playwright Chromium, 640×360, sampling auto. This is not
        a re-time of round {ROUND}. Canvas loses first paint at every size in this table. Sampling none was not re-timed.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Points</th>
              {heads.map((head) => (
                <th key={head} className="num">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row) => (
              <tr key={row.points}>
                <td>{row.points}</td>
                {row.cells.map((cell, index) => (
                  <td key={heads[index]} className="num">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="meta">Canvas loses first paint at every size: {losses.join("; ")}.</p>
    </>
  );
}
