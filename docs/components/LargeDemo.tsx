"use client";

import { useEffect, useRef, useState } from "react";
import type { ChartSpec } from "@chartkitdev/core";
import type { MountedChart } from "@chartkitdev/vanilla";

const MILLION = 1_000_000;
const WINDOW = 100_000;

type Mode = "svg" | "canvas" | "none";

const MODES: { id: Mode; label: string }[] = [
  { id: "svg", label: "SVG + sampling" },
  { id: "canvas", label: "Canvas" },
  { id: "none", label: "Sampling none" },
];

/**
 * A sensor trace: several slow cycles, a small drift, tiny noise, narrow spikes, and short outages.
 * The noise stays well under the cycle so downsampling does not paint a solid band.
 * Spikes and outages span a few samples so minmax and LTTB both keep them.
 */
function reading(index: number, period: number): number {
  const cycle = (index / period) * Math.PI * 2;
  const wave = Math.sin(cycle) * 18 + Math.sin(cycle * 3) * 4;
  const drift = (index / MILLION) * 6;
  const noise = ((((Math.imul(index, 1664525) + 1013904223) >>> 0) / 4294967296) - 0.5) * 0.8;
  return wave + drift + noise;
}

function sensor(n: number, origin: number): { x: Float64Array; y: Float64Array } {
  const x = new Float64Array(n);
  const y = new Float64Array(n);
  const period = Math.max(24, n / 6);
  for (let i = 0; i < n; i++) {
    const t = origin + i;
    x[i] = t;
    y[i] = reading(t, period);
  }
  const spikeEvery = Math.max(1, Math.floor(n / 6));
  for (let s = Math.floor(spikeEvery * 0.45); s < n; s += spikeEvery) {
    const width = Math.max(3, Math.floor(n / 200_000));
    for (let k = 0; k < width && s + k < n; k++) y[s + k] = k === 0 || k === width - 1 ? 36 : 52;
  }
  for (const at of [0.18, 0.57]) {
    const start = Math.floor(n * at);
    const end = Math.min(n, start + Math.max(8, Math.floor(n / 12000)));
    for (let i = start; i < end; i++) y[i] = -14;
  }
  return { x, y };
}

function lineSpec(x: Float64Array, y: Float64Array, mode: Mode, title: string, alt: string): ChartSpec {
  const sampling = mode === "none" ? "none" : "lttb";
  return {
    version: "1",
    type: "line",
    render: mode === "canvas" ? "canvas" : "svg",
    title,
    data: { columns: { x, y }, sampling },
    encoding: { x: "x", y: "y" },
    mark: { curve: "linear", points: "none" },
    legend: false,
    axes: { x: { title: "Sample" }, y: { title: "Reading" } },
    size: { width: 720, height: 320 },
    a11y: { alt },
  } as ChartSpec;
}

/**
 * A million-point line, plus a sliding window. The samples are built in the browser.
 * The toggle compares SVG with sampling, canvas marks, and sampling none.
 */
export function LargeDemo() {
  const millionHost = useRef<HTMLDivElement>(null);
  const streamHost = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("canvas");
  const [millionNote, setMillionNote] = useState("Building one million points…");
  const [streamNote, setStreamNote] = useState("Starting the stream…");

  useEffect(() => {
    const millionEl = millionHost.current;
    const streamEl = streamHost.current;
    if (!millionEl || !streamEl) return;
    let alive = true;
    let million: MountedChart | null = null;
    let stream: MountedChart | null = null;
    let timer = 0;
    const samples: number[] = [];

    void import("@chartkitdev/vanilla").then(({ mount }) => {
      if (!alive) return;
      const big = sensor(MILLION, 0);
      const started = performance.now();
      million = mount(
        millionEl,
        lineSpec(big.x, big.y, mode, "One million points", "A million-point sensor line. Spikes and outages stay visible after downsampling."),
      );
      const painter = mode === "canvas" ? "Canvas marks, SVG axes" : mode === "svg" ? "SVG with LTTB" : "SVG, every point";
      const reportMount = () => {
        if (!alive) return;
        if (!millionEl.querySelector("svg")) {
          requestAnimationFrame(reportMount);
          return;
        }
        setMillionNote(`${painter}. Mounted in ${(performance.now() - started).toFixed(0)} ms.`);
      };
      reportMount();

      const open = sensor(WINDOW, 0);
      const streamStarted = performance.now();
      stream = mount(
        streamEl,
        lineSpec(open.x, open.y, mode, "Live window", "A 100,000-point sensor window that appends and keeps the latest samples."),
      );
      let streamMounted = 0;
      const reportStream = () => {
        if (!alive) return;
        if (!streamEl.querySelector("svg")) {
          requestAnimationFrame(reportStream);
          return;
        }
        streamMounted = performance.now() - streamStarted;
      };
      reportStream();
      let phase = WINDOW;
      const period = WINDOW / 6;
      const tick = () => {
        if (!alive || !stream) return;
        const batch = Array.from({ length: 24 }, (_, i) => {
          const index = phase + i;
          return { x: index, y: reading(index, period) };
        });
        phase += batch.length;
        const t = performance.now();
        stream.append(batch, { window: WINDOW });
        const ms = performance.now() - t;
        samples.push(ms);
        const recent = samples.slice(-20);
        const median = recent.slice().sort((a, b) => a - b)[Math.floor(recent.length / 2)] ?? ms;
        setStreamNote(
          `Window mounted in ${streamMounted.toFixed(0)} ms. Appended ${batch.length} points. Last append ${ms.toFixed(1)} ms. Median of the last ${recent.length}: ${median.toFixed(1)} ms.`,
        );
        timer = window.setTimeout(tick, 400);
      };
      timer = window.setTimeout(tick, 400);
    });

    return () => {
      alive = false;
      window.clearTimeout(timer);
      million?.destroy();
      stream?.destroy();
    };
  }, [mode]);

  return (
    <>
      <div className="mode-toggle" role="group" aria-label="Renderer">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={mode === item.id ? "btn btn-primary" : "btn btn-ghost"}
            aria-pressed={mode === item.id}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <section className="section">
        <h2>One million points</h2>
        <p className="lede">
          A sensor trace with a slow cycle, a drift, noise, spikes, and short outages. LTTB and minmax keep the spikes.
          Sampling none draws every point.
        </p>
        <div ref={millionHost} className="chart-host" data-large-host="" />
        <p className="meta" data-large-readout="">
          {millionNote}
        </p>
      </section>
      <section className="section">
        <h2>Streaming append</h2>
        <p className="lede">
          Each tick appends 24 points and keeps the last 100,000. Columns stay <code>Float64Array</code>s.
        </p>
        <div ref={streamHost} className="chart-host" data-stream-canvas="" />
        <p className="meta" data-stream-canvas-readout="">
          {streamNote}
        </p>
      </section>
    </>
  );
}
