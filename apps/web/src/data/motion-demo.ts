import type { ChartSpec } from "@chartkitdev/core";

const alt = "Output by region.";

const regions = [
  { region: "North", output: 42 },
  { region: "South", output: 35 },
  { region: "East", output: 48 },
  { region: "West", output: 51 },
  { region: "Central", output: 28 },
  { region: "Harbor", output: 50 },
];

function bars(rows: { region: string; output: number }[]): ChartSpec {
  return {
    version: "1",
    type: "bar",
    title: "Output",
    data: rows,
    encoding: { x: "region", y: "output" },
    motion: "auto",
    legend: false,
    size: { width: 640, height: 280 },
    a11y: { alt },
  };
}

export function valueSpecs(): ChartSpec[] {
  return [bars(regions), bars(regions.map((row) => (row.region === "Harbor" ? { region: "Harbor", output: 56 } : row)))];
}

export function sortSpecs(): ChartSpec[] {
  const sorted = regions.slice().sort((a, b) => b.output - a.output);
  return [bars(regions), bars(sorted)];
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const orders = [20, 32, 28, 24, 30, 22];
const returns = [8, 9, 8, 11, 9, 12];
const rush = [16, 28, 24, 56, 26, 18];

function series(fields: Array<"orders" | "returns" | "rush">): ChartSpec {
  const data = months.map((month, index) => {
    const row: Record<string, string | number> = { month };
    if (fields.includes("orders")) row.orders = orders[index] ?? 0;
    if (fields.includes("returns")) row.returns = returns[index] ?? 0;
    if (fields.includes("rush")) row.rush = rush[index] ?? 0;
    return row;
  });
  return {
    version: "1",
    type: "line",
    title: "Orders",
    data,
    encoding: { x: "month", y: [fields[0], ...fields.slice(1)] },
    motion: "auto",
    mark: { curve: "linear", points: "none" },
    size: { width: 640, height: 280 },
    a11y: { alt: "Orders, returns, and a rush series by month." },
  };
}

export function seriesSpecs(): ChartSpec[] {
  return [series(["orders", "returns"]), series(["orders", "returns", "rush"])];
}

export const STREAM_POINTS = 12_000;
export const STREAM_STEP = 18;

/** Eight cycles across the window. `shift` moves the wave by that many samples. */
export function streamLevel(index: number, shift: number): number {
  return Math.sin(((index + shift) / STREAM_POINTS) * Math.PI * 16) * 0.8;
}

export function streamSpec(shift: number, typed: boolean): ChartSpec {
  const n = STREAM_POINTS;
  const sample = typed ? new Float64Array(n) : new Array<number>(n);
  const level = typed ? new Float64Array(n) : new Array<number>(n);
  for (let i = 0; i < n; i++) {
    sample[i] = i;
    level[i] = streamLevel(i, shift);
  }
  return {
    version: "1",
    type: "line",
    title: "Live intake",
    data: { columns: { sample, level } },
    encoding: {
      x: { field: "sample", scale: { domain: [0, n - 1] } },
      y: { field: "level", scale: { domain: [-1.2, 1.2] } },
    },
    mark: { curve: "linear", points: "none" },
    legend: false,
    render: "canvas",
    size: { width: 640, height: 280 },
    a11y: { alt: "A sliding window of 12,000 samples." },
  } as ChartSpec;
}
