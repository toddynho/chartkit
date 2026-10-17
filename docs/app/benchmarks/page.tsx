import Link from "next/link";
import { ChartView } from "@/lib/chart";
import {
  BENCH_COMMIT,
  MEASURED,
  agentRows,
  browserRows,
  bundleRace,
  bundleRows,
  initial100k,
  initial1m,
  raceSpec,
  samplingRows,
  ssrRace,
} from "@/lib/benchmarks";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Benchmarks",
  "Published ChartKit benchmark numbers: bundle size, browser render, server render, sampling, and the agent eval. Losses included.",
  "/benchmarks",
);

export default function BenchmarksPage() {
  return (
    <div className="wrap section prose wide">
      <h1>Benchmarks</h1>
      <p className="lede">
        These are the published medians from <code>BENCHMARKS.md</code> on pull request #4, commit{" "}
        <code>{BENCH_COMMIT}</code>, measured {MEASURED}. Five browser samples, Playwright Chromium, a 640×360 line.
        Reproduce with <code>npm run bench</code> on that commit. This page does not re-time the libraries.
      </p>

      <h2>Bundle size</h2>
      <p>ChartKit’s minimal line chart is 8,712 bytes gzip. That is the number behind the 8.7 KB on the homepage.</p>
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
        ChartKit wins the initial render at 10k and 100k, and the 100k update. It loses the 1k initial (rank 3 of 7),
        the 1k update to Recharts, Nivo, ECharts, and Chart.js, the 10k update by a millisecond, and both 1M timings to
        uPlot.
      </p>
      <div className="grid-2">
        <article className="card">
          <ChartView spec={raceSpec(initial100k)} />
          <p className="meta">{initial100k.caption}</p>
        </article>
        <article className="card">
          <ChartView spec={raceSpec(initial1m)} />
          <p className="meta">{initial1m.caption}</p>
        </article>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Points</th>
              <th className="num">ChartKit initial</th>
              <th className="num">ChartKit update</th>
              <th>Fastest initial</th>
              <th>Fastest update</th>
              <th>Call</th>
            </tr>
          </thead>
          <tbody>
            {browserRows.map((row) => (
              <tr key={row.points}>
                <td>{row.points}</td>
                <td className="num">{row.ckI}</td>
                <td className="num">{row.ckU}</td>
                <td>{row.bestI}</td>
                <td>{row.bestU}</td>
                <td className={row.call.startsWith("Win") ? "win" : row.call.startsWith("Loss") ? "loss" : undefined}>
                  {row.call}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        The 10k update samples sit on the shared two-frame wait (ChartKit 33.20 ms, uPlot 33.10, Chart.js 32.10). The
        file treats that cell as a frame-quantized tie, not a separate hotspot in the SVG replacement.
      </p>

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
      <p>The 1M loss to uPlot is with sampling on. Sampling off at 1M is 505 ms to draw and 21.5 seconds to update.</p>

      <h2>Server render</h2>
      <ChartView spec={raceSpec(ssrRace)} />
      <p className="meta">{ssrRace.caption}</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Library</th>
              <th className="num">Mean ms</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ChartKit minimal</td>
              <td className="num">0.62</td>
              <td>SVG, no DOM</td>
            </tr>
            <tr>
              <td>ECharts</td>
              <td className="num">5.32</td>
              <td>SVG SSR</td>
            </tr>
            <tr>
              <td>Nivo</td>
              <td className="num">52.91</td>
              <td>SVG</td>
            </tr>
            <tr>
              <td>uPlot, Chart.js, Recharts, Observable Plot</td>
              <td className="num">—</td>
              <td>No chart without a DOM. Recharts returned an empty wrapper.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="agents">Agent eval</h2>
      <p>
        Round 6 is the current scoreboard. One model, claude-sonnet-4-5, temperature 0, one run on 2026-10-16, 42
        tasks. “Official” means the library’s docs were in the prompt. ChartKit’s docs are <Link href="/llms.txt">llms.txt</Link>.
        The previous llms.txt, the React-only v0 file, scored 18/42 in an earlier run.
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
        ChartKit’s first try with no docs is 21/42. <code>repair()</code>, with no model call, takes that same output
        to 42/42. With the official docs, the first try is already 42/42, at about 132 output tokens against about 237
        for Recharts. The other libraries have no repair step.{" "}
        <Link href="/agents">How to use the loop</Link>.
      </p>
    </div>
  );
}
