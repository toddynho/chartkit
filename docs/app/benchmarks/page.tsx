import type { Metadata } from "next";
import Link from "next/link";
import { ChartView } from "@/lib/chart";
import {
  CORE_COMMIT,
  HARNESS_COMMIT,
  MEASURED,
  ROUND,
  agentRows,
  browserRows,
  bundleRace,
  bundleRows,
  headline,
  initial100k,
  initial1k,
  initial1m,
  raceSpec,
  samplingRows,
  ssrRace,
  ssrRows,
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
        Round {ROUND}, measured {MEASURED}. Core is pull request #6 at <code>{CORE_COMMIT}</code>. The harness is pull
        request #4 at <code>{HARNESS_COMMIT}</code>. Five browser samples, Playwright Chromium, a 640×360 line. Reproduce
        with <code>npm run bench</code> on that pairing. This page does not re-time the libraries. The same numbers are
        in <a href="/benchmarks.json">benchmarks.json</a> (schema <a href="/benchmarks.schema.json">benchmarks.schema.json</a>)
        and <a href="/benchmarks.md">benchmarks.md</a>.
      </p>
      <p>
        The full run shared the machine with other work, about 11.6 GB of 16 GB in use, and competitors were slower
        than in round 6. Quiet-box reruns are in parentheses. Where those two disagree, both numbers are on the page.
      </p>

      <h2>Bundle size</h2>
      <p>
        ChartKit’s minimal line chart is {headline.lineGzipBytes} bytes gzip ({headline.lineGzipLabel}). It is still
        the smallest. Next is {headline.nextLib} at {headline.nextGzipBytes} bytes.
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
        ChartKit wins the initial render at 1k, 10k, and 100k. It loses the 1k update, and it is last of the seven
        there. It also loses the 10k update, the 100k update, and both 1M timings on the full run. The quiet-box 1M
        initial is a tie with uPlot (36.3 ms vs 36.9 ms).
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
                <td className={row.tone === "loss" ? "loss" : undefined}>{row.call}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Parentheses are the quiet-box rerun. Update tests sit on a shared two-frame wait, so a few milliseconds is
        frame-timing noise, not a separate hotspot in the SVG replacement. ChartKit updates land between 19 and 33 ms
        on both round 6 core and this core. uPlot swung 13–35 ms in the same session. The round 6 “win” at 100k update
        was that noise; in this environment uPlot is usually ahead by about a frame.
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
      <p>
        The 1M comparison with uPlot is with sampling on. Sampling off at 1M is 782.5 ms to draw and 53.3 seconds to
        update, on the loaded box.
      </p>

      <h2>Server render</h2>
      <ChartView spec={raceSpec(ssrRace)} />
      <p className="meta">{ssrRace.caption}</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Library</th>
              <th className="num">Full run, mean ms</th>
              <th className="num">Quiet box</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ssrRows.map((row) => (
              <tr key={row.lib}>
                <td>{row.lib}</td>
                <td className="num">{row.mean}</td>
                <td className="num">{row.quiet}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="agents">Agent eval</h2>
      <p>
        Round {ROUND}. One model, claude-sonnet-4-5, temperature 0, one run on {MEASURED}, 42 tasks. “Official” means
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
        ChartKit’s first try with no docs is {headline.repairFrom}. <code>repair()</code>, with no model call, takes
        that same output to {headline.repairTo}. With the official docs, the first try is already 42/42, at a mean of
        131.1 output tokens against 236.6 for Recharts. The other libraries have no repair step. Phase 1 grew llms.txt
        to 8,274 bytes, about 1.9 KB more than the competitor excerpts. A ChartKit-only rerun with the file cut to
        6,329 bytes scored 41/42 on the first try. The miss was a combo axis, CK3002, which <code>repair()</code> does
        not patch. The headline numbers use the full file. <Link href="/agents">How to use the loop</Link>.
      </p>
    </div>
  );
}
