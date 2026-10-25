import { mount } from "@chartkitdev/vanilla";
import type { ChartSpec } from "@chartkitdev/core";

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
  } as ChartSpec;
}

function median(values: number[]): number {
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

const host = document.querySelector<HTMLElement>("[data-stream-host]");
const readout = document.querySelector<HTMLElement>("[data-stream-readout]");
if (host && readout) {
  const chart = mount(host, series(0));
  const samples: number[] = [];
  let phase = 0;
  const tick = async () => {
    phase += 80;
    const next = series(phase);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    const started = performance.now();
    chart.update(next);
    const sync = performance.now() - started;
    const painted = await new Promise<number>((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => resolve(performance.now() - started);
      channel.port2.postMessage(0);
    });
    samples.push(painted);
    const recent = samples.slice(-12);
    readout.textContent = `${POINTS.toLocaleString("en-US")} points, sampling auto. Last update ${painted.toFixed(1)} ms to the post-paint message (${sync.toFixed(1)} ms before it). Median of the last ${recent.length}: ${median(recent).toFixed(1)} ms. Measured in this browser, not the benchmark table.`;
    window.setTimeout(() => void tick(), 700);
  };
  window.setTimeout(() => void tick(), 700);
}
