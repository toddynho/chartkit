import { mount, type MountedChart } from "@chartkitdev/vanilla";
import type { ChartSpec } from "@chartkitdev/core";

const MILLION = 1_000_000;
const WINDOW = 100_000;
type Mode = "svg" | "canvas" | "none";

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
  for (const at of [0.18, 0.62]) {
    const start = Math.floor(n * at);
    const end = Math.min(n, start + Math.max(24, Math.floor(n * 0.045)));
    for (let i = start; i < end; i++) y[i] = Number.NaN;
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
  } as unknown as ChartSpec;
}

const millionHost = document.querySelector<HTMLElement>("[data-large-host]");
const streamHost = document.querySelector<HTMLElement>("[data-stream-canvas]");
const millionNote = document.querySelector<HTMLElement>("[data-large-readout]");
const streamNote = document.querySelector<HTMLElement>("[data-stream-canvas-readout]");
const buttons = document.querySelectorAll<HTMLButtonElement>("[data-large-mode]");

let mode: Mode = "canvas";
let alive = true;
let million: MountedChart | null = null;
let stream: MountedChart | null = null;
let timer = 0;

function draw(): void {
  if (!millionHost || !streamHost || !millionNote || !streamNote) return;
  window.clearTimeout(timer);
  million?.destroy();
  stream?.destroy();
  million = null;
  stream = null;
  const big = sensor(MILLION, 0);
  const started = performance.now();
  million = mount(
    millionHost,
    lineSpec(big.x, big.y, mode, "Sensor reading, 1,000,000 samples", "A million-point sensor line. Spikes and short gaps stay visible after downsampling."),
  );
  const painter = mode === "canvas" ? "Canvas marks, SVG axes" : mode === "svg" ? "SVG with LTTB" : "SVG, every point";
  const reportMount = () => {
    if (!alive) return;
    if (!millionHost.querySelector("svg")) {
      requestAnimationFrame(reportMount);
      return;
    }
    millionNote.textContent = `${painter}. Mounted in ${(performance.now() - started).toFixed(0)} ms.`;
  };
  reportMount();

  const open = sensor(WINDOW, 0);
  const streamStarted = performance.now();
  stream = mount(
    streamHost,
    lineSpec(open.x, open.y, mode, "Live window", "A 100,000-point sensor window that appends and keeps the latest samples."),
  );
  let streamMounted = 0;
  const reportStream = () => {
    if (!alive) return;
    if (!streamHost.querySelector("svg")) {
      requestAnimationFrame(reportStream);
      return;
    }
    streamMounted = performance.now() - streamStarted;
  };
  reportStream();
  let phase = WINDOW;
  const period = WINDOW / 6;
  const samples: number[] = [];
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
    streamNote.textContent = `Window mounted in ${streamMounted.toFixed(0)} ms. Appended ${batch.length} points. Last append ${ms.toFixed(1)} ms. Median of the last ${recent.length}: ${median.toFixed(1)} ms.`;
    timer = window.setTimeout(tick, 400);
  };
  timer = window.setTimeout(tick, 400);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const next = button.dataset.largeMode;
    if (next !== "svg" && next !== "canvas" && next !== "none") return;
    mode = next;
    buttons.forEach((item) => {
      const on = item === button;
      item.classList.toggle("btn-primary", on);
      item.classList.toggle("btn-secondary", !on);
      item.setAttribute("aria-pressed", on ? "true" : "false");
    });
    draw();
  });
});

if (millionHost && streamHost) draw();
