"use client";

import { useEffect, useRef, useState } from "react";
import type { ChartSpec } from "@chartkitdev/core";
import type { MountedChart } from "@chartkitdev/vanilla";

const MILLION = 1_000_000;
const WINDOW = 100_000;

function wave(n: number, phase: number): { x: Float64Array; y: Float64Array } {
  const x = new Float64Array(n);
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    x[i] = i;
    y[i] = Math.sin((i + phase) / 90) * 24 + ((i % 40) - 20) * 0.15;
  }
  return { x, y };
}

function lineSpec(x: Float64Array, y: Float64Array, title: string, alt: string): ChartSpec {
  return {
    version: "1",
    type: "line",
    render: "canvas",
    title,
    data: { columns: { x, y }, sampling: "lttb" },
    encoding: { x: "x", y: "y" },
    mark: { curve: "linear", points: "none" },
    legend: false,
    axes: { x: { title: "Index" }, y: { title: "Reading" } },
    size: { width: 720, height: 320 },
    a11y: { alt },
  } as ChartSpec;
}

/**
 * A million-point canvas line, plus a sliding window that appends into Float64Array columns.
 * The page does not ship the samples in HTML. They are built in the browser.
 */
export function LargeDemo() {
  const millionHost = useRef<HTMLDivElement>(null);
  const streamHost = useRef<HTMLDivElement>(null);
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
      const big = wave(MILLION, 0);
      const started = performance.now();
      million = mount(millionEl, lineSpec(big.x, big.y, "One million points", "A million-point line on canvas, downsampled with LTTB."));
      setMillionNote(`One million points mounted in ${(performance.now() - started).toFixed(0)} ms. Marks are canvas. Axes stay SVG.`);

      const open = wave(WINDOW, 0);
      stream = mount(
        streamEl,
        lineSpec(open.x, open.y, "Live window", "A 100,000-point canvas line that appends and keeps the latest window."),
      );
      let phase = WINDOW;
      const tick = () => {
        if (!alive || !stream) return;
        const batch = Array.from({ length: 24 }, (_, i) => {
          const index = phase + i;
          return { x: index, y: Math.sin(index / 90) * 24 + ((index % 40) - 20) * 0.15 };
        });
        phase += batch.length;
        const t = performance.now();
        stream.append(batch, { window: WINDOW });
        const ms = performance.now() - t;
        samples.push(ms);
        const recent = samples.slice(-20);
        const median = recent.slice().sort((a, b) => a - b)[Math.floor(recent.length / 2)] ?? ms;
        setStreamNote(
          `Appended ${batch.length} points into a ${WINDOW.toLocaleString("en-US")}-point Float64Array window. Last append ${ms.toFixed(1)} ms. Median of the last ${recent.length}: ${median.toFixed(1)} ms.`,
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
  }, []);

  return (
    <>
      <section className="section">
        <h2>One million points</h2>
        <p className="lede">
          <code>render: &quot;canvas&quot;</code> with <code>data.sampling: &quot;lttb&quot;</code>. The server render is the SVG fallback.
          The browser hydrates the marks onto a canvas and leaves the title and axes as text.
        </p>
        <div ref={millionHost} className="chart-host" data-large-host="" />
        <p className="meta" data-large-readout="">
          {millionNote}
        </p>
      </section>
      <section className="section">
        <h2>Streaming append</h2>
        <p className="lede">
          Each tick appends 24 points and keeps the last 100,000. Columns stay <code>Float64Array</code>s, so the append does not
          copy the whole window into plain arrays.
        </p>
        <div ref={streamHost} className="chart-host" data-stream-canvas="" />
        <p className="meta" data-stream-canvas-readout="">
          {streamNote}
        </p>
      </section>
    </>
  );
}
