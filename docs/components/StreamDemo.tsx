"use client";

import { useEffect, useRef, useState } from "react";
import type { ChartSpec } from "@chartkitdev/core";
import type { MountedChart } from "@chartkitdev/vanilla";

const POINTS = 10_000;

function series(phase: number): ChartSpec {
  const x = Array.from({ length: POINTS }, (_, i) => i);
  const y = Array.from({ length: POINTS }, (_, i) => Math.sin((i + phase) / 48) * 40 + (i % 17) * 0.2);
  return {
    version: "1",
    type: "line",
    title: "10,000 points",
    data: { columns: { x, y } },
    encoding: { x: "x", y: "y" },
    mark: { curve: "linear", points: "none", sampling: "auto" },
    legend: false,
    size: { width: 640, height: 280 },
    a11y: { alt: "A streaming line of ten thousand points, downsampled to the plot width." },
  };
}

function median(values: number[]): number {
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

/**
 * Times `mount().update()` the way the benchmark does: start at the top of a frame,
 * call update, then read a MessageChannel timestamp after paint. Raster time is not included.
 */
export function StreamDemo() {
  const host = useRef<HTMLDivElement>(null);
  const [readout, setReadout] = useState("No update measured yet.");

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let alive = true;
    let chart: MountedChart | null = null;
    let timer = 0;
    const samples: number[] = [];
    let phase = 0;

    const stop = () => {
      window.clearTimeout(timer);
      chart?.destroy();
      chart = null;
    };

    void import("@chartkitdev/vanilla").then(({ mount }) => {
      if (!alive || !host.current) return;
      chart = mount(host.current, series(0));
      const tick = async () => {
        if (!alive || !chart) return;
        phase += 80;
        const next = series(phase);
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        if (!alive || !chart) return;
        const started = performance.now();
        chart.update(next);
        const sync = performance.now() - started;
        const painted = await new Promise<number>((resolve) => {
          const channel = new MessageChannel();
          channel.port1.onmessage = () => resolve(performance.now() - started);
          channel.port2.postMessage(0);
        });
        if (!alive) return;
        samples.push(painted);
        const recent = samples.slice(-12);
        setReadout(
          `${POINTS.toLocaleString("en-US")} points, sampling auto. Last update ${painted.toFixed(1)} ms to the post-paint message (${sync.toFixed(1)} ms before it). Median of the last ${recent.length}: ${median(recent).toFixed(1)} ms. Measured in this browser, not the benchmark table.`,
        );
        timer = window.setTimeout(() => void tick(), 700);
      };
      timer = window.setTimeout(() => void tick(), 700);
    });

    return () => {
      alive = false;
      stop();
    };
  }, []);

  return (
    <section className="section">
      <h2>In-place update</h2>
      <p className="lede">
        Ten thousand points, replaced through <code>mount().update()</code>. The number is the time from the top of an
        animation frame until a message task after paint. It does not include GPU time, and it is not a bench result.
      </p>
      <div ref={host} className="chart-host" data-stream-host="" />
      <p className="meta" data-stream-readout="">
        {readout}
      </p>
    </section>
  );
}
