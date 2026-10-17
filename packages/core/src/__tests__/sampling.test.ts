import { describe, expect, it } from "vitest";
import { line } from "../charts/line";
import { spike } from "../charts/spike";
import { createRenderer } from "../render";
import { readSamplingMode, resolveSampling, sampleSeries, samplingThreshold } from "../sampling";
import { validate } from "../validate";

const renderLine = createRenderer([line]);
const renderSpike = createRenderer([spike]);

function series(n: number, spikeAt: number, spikeValue: number): Float64Array {
  const ys = new Float64Array(n);
  for (let i = 0; i < n; i++) ys[i] = Math.sin(i / 7);
  ys[spikeAt] = spikeValue;
  return ys;
}

function indexes(mode: "lttb" | "minmax", n: number, target: number): number[] {
  const ys = series(n, 40, 100);
  ys[70] = -80;
  const xs = new Float64Array(n);
  for (let i = 0; i < n; i++) xs[i] = i;
  const sampled = sampleSeries(mode, xs, ys, n, Math.ceil(target / 2), false);
  expect(sampled.reduced).toBe(true);
  expect(sampled.runs).toHaveLength(1);
  return [...sampled.runs[0]];
}

describe("sampling algorithms", () => {
  it("leaves series at or under twice the plot width untouched", () => {
    expect(samplingThreshold(572)).toBe(1144);
    expect(resolveSampling("auto", 1144, 572)).toBe("none");
    expect(resolveSampling("lttb", 10, 100)).toBe("none");
    expect(resolveSampling("minmax", 200, 100)).toBe("none");
    expect(resolveSampling("none", 100000, 100)).toBe("none");
    expect(resolveSampling("auto", 1145, 572)).toBe("minmax");
    expect(resolveSampling("lttb", 1145, 572)).toBe("lttb");
    const small = sampleSeries("auto", null, series(20, 3, 9), 20, 640, false);
    expect(small.reduced).toBe(false);
    expect(small.runs).toEqual([]);
  });

  it("minmax and lttb keep the first point, the last point, and both extremes", () => {
    for (const mode of ["minmax", "lttb"] as const) {
      const picked = indexes(mode, 120, 16);
      expect(picked[0]).toBe(0);
      expect(picked[picked.length - 1]).toBe(119);
      expect(picked).toContain(40);
      expect(picked).toContain(70);
      expect(new Set(picked).size).toBe(picked.length);
      for (let i = 1; i < picked.length; i++) expect(picked[i]).toBeGreaterThan(picked[i - 1]);
    }
  });

  it("is deterministic and only returns original indexes", () => {
    const ys = series(200, 80, 50);
    const once = sampleSeries("minmax", null, ys, ys.length, 20, false);
    const twice = sampleSeries("minmax", null, ys, ys.length, 20, false);
    expect([...once.runs[0]]).toEqual([...twice.runs[0]]);
    for (const index of once.runs[0]) expect(index).toBeGreaterThanOrEqual(0);
    expect(once.runs[0]).toContain(80);
    expect(ys[80]).toBe(50);
  });

  it("splits gaps unless nulls are connected", () => {
    const ys: Array<number | null> = [0, 1, 2, 3, 4, null, 5, 6, 7, 8, 9];
    const gapped = sampleSeries("minmax", null, ys, ys.length, 1, false);
    expect(gapped.reduced).toBe(true);
    expect(gapped.runs).toHaveLength(2);
    expect([...gapped.runs[0]][0]).toBe(0);
    expect([...gapped.runs[0]].at(-1)).toBe(4);
    expect([...gapped.runs[1]][0]).toBe(6);
    expect([...gapped.runs[1]].at(-1)).toBe(10);
    for (const run of gapped.runs) expect([...run]).not.toContain(5);
    const joined = sampleSeries("minmax", null, ys, ys.length, 1, true);
    expect(joined.runs).toHaveLength(1);
    expect([...joined.runs[0]]).not.toContain(5);
    expect([...joined.runs[0]][0]).toBe(0);
    expect([...joined.runs[0]].at(-1)).toBe(10);
  });
});

describe("sampling render", () => {
  const alt = "The series stays near zero, then peaks at 10000.";

  function spec(n: number, sampling?: string) {
    const xs = new Float64Array(n);
    const ys = series(n, Math.floor(n * 0.4), 10000);
    for (let i = 0; i < n; i++) xs[i] = i;
    return {
      version: "1",
      type: "line",
      data: { columns: { x: xs, y: ys } },
      encoding: { x: "x", y: "y" },
      mark: { curve: "linear", points: "none", ...(sampling ? { sampling } : {}) },
      size: { width: 640, height: 360 },
      locale: "en-US",
      a11y: { alt },
    };
  }

  it("keeps a small chart pixel-identical to sampling none", () => {
    const small = spec(24);
    expect(renderLine(small)).toBe(renderLine({ ...small, mark: { ...small.mark, sampling: "none" } }));
    expect(renderLine(small)).toBe(renderLine({ ...small, mark: { ...small.mark, sampling: "auto" } }));
  });

  it("keeps the same minmax indexes for an even x step", () => {
    const n = 5000;
    const ys = series(n, 2000, 10000);
    const xs = new Float64Array(n);
    for (let i = 0; i < n; i++) xs[i] = i * 2;
    const body = {
      version: "1",
      type: "line",
      data: { columns: { x: xs, y: ys } },
      encoding: { x: "x", y: "y" },
      mark: { curve: "linear", points: "none", sampling: "auto" },
      size: { width: 640, height: 360 },
      locale: "en-US",
      a11y: { alt },
    };
    const svg = renderLine(body);
    const clip = svg.match(/<clipPath[^>]*>\s*<rect[^>]*width="([\d.]+)"/);
    const plotWidth = Number(clip?.[1] ?? 0);
    const drawn = svg.match(/data-ck-i="([^"]+)"/)?.[1].split(" ").map(Number) ?? [];
    const direct = sampleSeries("minmax", xs, ys, n, plotWidth, false);
    expect(plotWidth).toBeGreaterThan(100);
    expect(drawn).toEqual([...direct.runs[0]]);
    expect(drawn).toContain(2000);
  });

  it("uses value buckets for sorted jitter and gaps, and the floor fallback for unsorted x", () => {
    const floorPick = (xs: Float64Array, ys: Float64Array, target: number) => {
      const last = xs.length - 1;
      const buckets = Math.max(1, Math.floor((target - 2) / 2));
      const minI = new Int32Array(buckets);
      const maxI = new Int32Array(buckets);
      minI.fill(-1);
      const x0 = xs[0];
      const span = xs[last] - x0;
      const scale = span !== 0 ? buckets / span : 0;
      for (let i = 1; i < last; i++) {
        const y = ys[i];
        let bucket = 0;
        if (scale !== 0) {
          bucket = Math.floor((xs[i] - x0) * scale);
          if (bucket < 0) bucket = 0;
          else if (bucket >= buckets) bucket = buckets - 1;
        }
        const lo = minI[bucket];
        if (lo < 0 || y < ys[lo]) minI[bucket] = i;
        const hi = maxI[bucket];
        if (hi < 0 || y > ys[hi]) maxI[bucket] = i;
      }
      const raw = [0];
      for (let bucket = 0; bucket < buckets; bucket++) {
        const a = minI[bucket];
        const b = maxI[bucket];
        if (a >= 0) raw.push(a);
        if (b >= 0 && b !== a) raw.push(b);
      }
      raw.push(last);
      return [...new Set(raw)].sort((a, b) => a - b);
    };
    const check = (xs: Float64Array) => {
      const n = xs.length;
      const ys = series(n, Math.floor(n * 0.4), 10000);
      const target = 80;
      const picked = sampleSeries("minmax", xs, ys, n, Math.ceil(target / 2), false);
      expect([...picked.runs[0]]).toEqual(floorPick(xs, ys, target));
      expect(picked.runs[0]).toContain(Math.floor(n * 0.4));
    };
    const n = 5000;
    const jitter = new Float64Array(n);
    const gaps = new Float64Array(n);
    let t = 1.7e12;
    let u = 1;
    for (let i = 0; i < n; i++) {
      u = (u * 1664525 + 1013904223) % 4294967296;
      jitter[i] = i + u / 4294967296 * 0.9;
      t += i % 50 === 0 ? 8000 : 1000;
      gaps[i] = t;
    }
    check(jitter);
    check(gaps);
    const step = new Float64Array(n);
    for (let i = 0; i < n; i++) step[i] = i * 2;
    check(step);

    const reversed = new Float64Array(n);
    for (let i = 0; i < n; i++) reversed[i] = n - i;
    const ys = series(n, 2000, 10000);
    const unsorted = sampleSeries("minmax", reversed, ys, n, 40, false);
    expect(unsorted.runs[0]).toContain(2000);
    expect(unsorted.runs[0][0]).toBe(0);
    expect(unsorted.runs[0][unsorted.runs[0].length - 1]).toBe(n - 1);
  });

  it("rounds a 100k numeric x axis to nice steps", () => {
    const svg = renderLine(spec(100_000));
    expect(svg).not.toContain("ck-chart-error");
    expect(svg).toContain(">0<");
    expect(svg).toContain(">20,000<");
    expect(svg).toContain(">40,000<");
    expect(svg).toContain(">60,000<");
    expect(svg).toContain(">80,000<");
    expect(svg).not.toContain(">16667<");
    expect(svg).not.toContain(">33334<");
    expect(svg).not.toContain(">100,000<");
  });

  it("downsamples a million points without dropping the full extent or the alt text", () => {
    const svg = renderLine(spec(1_000_000, "auto"));
    expect(svg).not.toContain("ck-chart-error");
    expect(svg).toContain(`aria-label="${alt}"`);
    expect(svg).toContain("<desc>");
    expect(svg).toContain('data-ck-sample="minmax"');
    const indexes = svg.match(/data-ck-i="([^"]+)"/)?.[1].split(" ").map(Number) ?? [];
    expect(indexes[0]).toBe(0);
    expect(indexes[indexes.length - 1]).toBe(999_999);
    expect(indexes).toContain(400_000);
    expect(indexes.length).toBeLessThanOrEqual(1144);
    expect(svg).toContain("10,000");
    const commands = (svg.match(/\b[ML]\b/g) ?? []).length;
    expect(commands).toBeLessThanOrEqual(1144);
  });

  it("uses the same axis labels when every point is drawn", () => {
    const full = renderLine(spec(4000, "none"));
    const sampled = renderLine(spec(4000, "auto"));
    expect(full).not.toContain("ck-chart-error");
    expect(sampled).toContain("10,000");
    expect(full).toContain("10,000");
    expect((sampled.match(/\b[ML]\b/g) ?? []).length).toBeLessThan((full.match(/\b[ML]\b/g) ?? []).length);
  });

  it("maps an always-on marker to the original spike index", () => {
    const body = spec(3000, "lttb");
    const svg = renderLine({ ...body, mark: { ...body.mark, points: "always" } });
    expect(svg).toContain('data-ck-sample="lttb"');
    expect(svg).toContain('data-ck-i="1200"');
  });

  it("minmax-samples a long spike chart and keeps the extreme", () => {
    const n = 5000;
    const ys = series(n, 2222, 80);
    const svg = renderSpike({
      version: "1",
      type: "spike",
      data: Array.from(ys),
      mark: { sampling: "auto" },
      size: { width: 640, height: 200 },
      locale: "en-US",
      a11y: { alt: "One spike reaches 80 and the rest stay small." },
    });
    expect(svg).not.toContain("ck-chart-error");
    expect(svg).toContain('data-ck-sample="minmax"');
    expect(svg).toContain('data-ck-i="2222"');
    expect(svg).toContain("One spike reaches 80");
    expect((svg.match(/<line /g) ?? []).length).toBeLessThan(n);
  });
});

describe("sampling validation", () => {
  const base = {
    version: "1",
    type: "line",
    data: [
      { month: "Jan", revenue: 1 },
      { month: "Feb", revenue: 2 },
    ],
    encoding: { x: "month", y: "revenue" },
    a11y: { alt: "Revenue rose from January to February." },
  };

  it("accepts the four sampling modes", () => {
    for (const sampling of ["auto", "none", "lttb", "minmax"]) {
      expect(validate({ ...base, mark: { sampling } }).ok).toBe(true);
    }
    expect(readSamplingMode(undefined)).toBe("auto");
  });

  it("CK1007 rejects an unknown sampling value", () => {
    const result = validate({ ...base, mark: { sampling: "ltt" } });
    const error = result.errors.find((item) => item.code === "CK1007");
    expect(error?.path).toBe("/mark/sampling");
    expect(error?.hint).toContain("lttb");
    expect(error?.fix?.[0]).toMatchObject({ path: "/mark/sampling", value: "lttb" });
  });

  it("CK3010 warns when sampling is set on a chart that ignores it", () => {
    const result = validate({ ...base, type: "scatter", encoding: { x: "month", y: "revenue" }, mark: { sampling: "lttb" } });
    expect(result.ok).toBe(true);
    expect(result.warnings.some((warning) => warning.code === "CK3010" && warning.path === "/mark/sampling")).toBe(true);
  });
});
