import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { buildSync } from "esbuild";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { render } from "../extra";
import { instantOf, parseTime, utcTime } from "../timezone";

/**
 * A date string with no offset is clock time in the spec `timezone` (UTC when
 * omitted), never in the host zone. The host zone cannot be changed inside one
 * Node process in a way every platform honours, so the renderer is bundled from
 * source once and run in a child process per `TZ` value.
 */

const alt = "Three points over one day.";
const point = (t: string, v: number) => ({ t, v });
const lineOf = (data: unknown[], more: Record<string, unknown> = {}) => ({
  version: "1",
  type: "line",
  data,
  encoding: { x: { field: "t", type: "temporal" }, y: "v" },
  a11y: { alt },
  ...more,
});

const day = ["2026-11-27T07:40", "2026-11-27T13:00", "2026-11-27T22:30"];
const specs: Record<string, Record<string, unknown>> = {
  bare: lineOf(day.map(point)),
  spaced: lineOf(day.map((t, i) => point(t.replace("T", " "), i))),
  seconds: lineOf(day.map((t, i) => point(`${t}:00.000`, i))),
  newYork: lineOf(day.map(point), { timezone: "America/New_York" }),
  dates: lineOf(["2026-11-25", "2026-11-26", "2026-11-27", "2026-11-28"].map(point)),
  datesNewYork: lineOf(["2026-11-25", "2026-11-26", "2026-11-27", "2026-11-28"].map(point), { timezone: "America/New_York" }),
  zulu: lineOf(day.map((t, i) => point(`${t}Z`, i))),
  offset: lineOf(day.map((t, i) => point(`${t}+09:00`, i))),
  area: lineOf(day.map(point), { type: "stacked-area" }),
  scatter: lineOf(day.map(point), { type: "scatter" }),
  noted: lineOf(day.map(point), { annotations: [{ type: "rule", axis: "x", value: "2026-11-27T13:00", label: "Deploy" }] }),
  notedNewYork: lineOf(day.map(point), { timezone: "America/New_York", annotations: [{ type: "rule", axis: "x", value: "2026-11-27T13:00", label: "Deploy" }] }),
  combo: {
    version: "1",
    type: "combo",
    data: day.map((t, i) => ({ t, orders: i + 2, rate: 0.2 + i / 10 })),
    encoding: { x: { field: "t", type: "temporal" }, y: [{ field: "orders", mark: "bar" }, { field: "rate", mark: "line", axis: "y2" }] },
    a11y: { alt },
  },
  spike: {
    version: "1",
    type: "spike",
    data: day.map((t, i) => ({ hour: t, errors: i + 1 })),
    encoding: { x: "hour", y: "errors" },
    a11y: { alt },
  },
  spikeNewYork: {
    version: "1",
    type: "spike",
    data: day.map((t, i) => ({ hour: t, errors: i + 1 })),
    encoding: { x: "hour", y: "errors" },
    timezone: "America/New_York",
    a11y: { alt },
  },
  stream: {
    version: "1",
    type: "streamgraph",
    data: day.map((t, i) => ({ t, a: i + 1, b: 3 - i })),
    encoding: { x: "t", y: ["a", "b"] },
    a11y: { alt },
  },
};

/** Text of the labels on the bottom axis, left to right. */
function bottomLabels(svg: string): string[] {
  const texts = [...svg.matchAll(/<text ([^>]*)>([^<]*)<\/text>/g)].map((match) => ({
    x: Number(/\bx="([^"]+)"/.exec(match[1])?.[1]),
    y: Number(/\by="([^"]+)"/.exec(match[1])?.[1]),
    text: match[2],
  }));
  const floor = Math.max(...texts.map((item) => item.y));
  return texts
    .filter((item) => item.y === floor)
    .sort((a, b) => a.x - b.x)
    .map((item) => item.text);
}

const hosts = ["UTC", "America/New_York", "Asia/Tokyo", "Australia/Lord_Howe"];
const painted: Record<string, { offset: number; svgs: Record<string, string> }> = {};
let dir = "";

beforeAll(() => {
  dir = mkdtempSync(path.join(tmpdir(), "chartkit-tz-"));
  const bundle = path.join(dir, "extra.mjs");
  buildSync({ entryPoints: [path.resolve(__dirname, "../extra.ts")], bundle: true, format: "esm", platform: "node", outfile: bundle, logLevel: "silent" });
  const runner = path.join(dir, "run.mjs");
  writeFileSync(
    runner,
    `import { render } from ${JSON.stringify(bundle)};
import { readFileSync } from "node:fs";
const specs = JSON.parse(readFileSync(process.argv[2], "utf8"));
const svgs = {};
for (const name of Object.keys(specs)) svgs[name] = render(specs[name]);
// The offset proves the child really runs in the zone the test asked for.
process.stdout.write(JSON.stringify({ offset: new Date(2026, 10, 27, 12).getTimezoneOffset(), svgs }));
`,
  );
  const input = path.join(dir, "specs.json");
  writeFileSync(input, JSON.stringify(specs));
  for (const zone of hosts) {
    const out = execFileSync(process.execPath, [runner, input], { env: { ...process.env, TZ: zone }, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    painted[zone] = JSON.parse(out);
  }
}, 120_000);

afterAll(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
});

describe("host timezone", () => {
  it("runs each child in its own zone", () => {
    expect(hosts.map((zone) => painted[zone].offset)).toEqual([0, 300, -540, -660]);
  });

  it.each(Object.keys(specs))("paints %s the same on every host", (name) => {
    const first = painted.UTC.svgs[name];
    expect(first).toContain("<svg");
    for (const zone of hosts) expect(painted[zone].svgs[name], `${name} on a ${zone} host`).toBe(first);
  });

  it("labels the repro in UTC when the spec has no timezone", () => {
    const want = ["09:00 AM", "12:00 PM", "03:00 PM", "06:00 PM", "09:00 PM"];
    for (const zone of hosts) expect(bottomLabels(painted[zone].svgs.bare), zone).toEqual(want);
    // A space for the T, and seconds, are the same instants.
    for (const zone of hosts) expect(bottomLabels(painted[zone].svgs.spaced), zone).toEqual(want);
    for (const zone of hosts) expect(bottomLabels(painted[zone].svgs.seconds), zone).toEqual(want);
  });

  it("reads the same strings as New York clock time when the spec says so", () => {
    // 07:40 to 22:30 on the New York clock, so the ticks read the same hours as the UTC chart.
    for (const zone of hosts) expect(bottomLabels(painted[zone].svgs.newYork), zone).toEqual(["09:00 AM", "12:00 PM", "03:00 PM", "06:00 PM", "09:00 PM"]);
    const explicit = render(lineOf(day.map((t, i) => point(`${t}-05:00`, i)), { timezone: "America/New_York" })) ?? "";
    expect(bottomLabels(explicit)).toEqual(bottomLabels(painted.UTC.svgs.newYork));
  });

  it("puts an annotation written with no offset where the same instant with an offset goes", () => {
    const rules = (svg: string) => [...svg.matchAll(/<line [^>]*x1="([\d.]+)"[^>]*x2="([\d.]+)"[^>]*>/g)].filter((match) => match[1] === match[2]).map((match) => match[1]);
    const cases: [string, string, Record<string, unknown>][] = [
      ["noted", "Z", {}],
      ["notedNewYork", "-05:00", { timezone: "America/New_York" }],
    ];
    for (const [name, suffix, more] of cases) {
      const exact = render(lineOf(day.map((t, i) => point(`${t}${suffix}`, i)), { ...more, annotations: [{ type: "rule", axis: "x", value: `2026-11-27T13:00${suffix}`, label: "Deploy" }] })) ?? "";
      const bare = painted["Asia/Tokyo"].svgs[name];
      expect(bare, name).toContain(">Deploy<");
      expect(rules(exact).length, name).toBeGreaterThan(0);
      expect(rules(bare), name).toEqual(rules(exact));
      // Moving the rule an hour moves it on the chart, so the equality above is about this rule.
      const moved = render(lineOf(day.map((t, i) => point(`${t}${suffix}`, i)), { ...more, annotations: [{ type: "rule", axis: "x", value: `2026-11-27T14:00${suffix}`, label: "Deploy" }] })) ?? "";
      expect(rules(moved), name).not.toEqual(rules(exact));
    }
  });

  it("leaves Z and explicit offsets as the instant they name", () => {
    expect(bottomLabels(painted["Asia/Tokyo"].svgs.zulu)).toEqual(["09:00 AM", "12:00 PM", "03:00 PM", "06:00 PM", "09:00 PM"]);
    // 07:40+09:00 is 22:40 UTC the day before, so the UTC axis crosses midnight.
    expect(bottomLabels(painted["Asia/Tokyo"].svgs.offset)).toEqual(["12:00 AM", "03:00 AM", "06:00 AM", "09:00 AM", "12:00 PM"]);
  });

  it("reads a date with no time as midnight in the spec timezone", () => {
    const want = ["Nov 25", "Nov 26", "Nov 27", "Nov 28"];
    for (const zone of hosts) {
      expect(bottomLabels(painted[zone].svgs.dates), zone).toEqual(want);
      expect(bottomLabels(painted[zone].svgs.datesNewYork), zone).toEqual(want);
    }
  });
});

describe("parseTime", () => {
  const ny = "America/New_York";
  const iso = (ms: number) => new Date(ms).toISOString();

  it("reads a string with no offset in the given zone", () => {
    expect(iso(parseTime("2026-11-27T07:40", "UTC"))).toBe("2026-11-27T07:40:00.000Z");
    expect(iso(parseTime("2026-11-27 07:40:15.5", "UTC"))).toBe("2026-11-27T07:40:15.500Z");
    expect(iso(parseTime("2026-11-27T07:40", ny))).toBe("2026-11-27T12:40:00.000Z");
    expect(iso(parseTime("2026-11-27 07:40:15.5", ny))).toBe("2026-11-27T12:40:15.500Z");
    expect(iso(parseTime("1969-07-20T20:17:40.250", ny))).toBe("1969-07-21T00:17:40.250Z");
    expect(iso(parseTime("2026-07-04T07:40", ny))).toBe("2026-07-04T11:40:00.000Z");
    expect(iso(parseTime("2026-11-27T07:40", "Asia/Kolkata"))).toBe("2026-11-27T02:10:00.000Z");
    expect(iso(utcTime("2026-11-27T07:40"))).toBe("2026-11-27T07:40:00.000Z");
  });

  it("reads a date as midnight in the zone", () => {
    expect(iso(parseTime("2026-11-27", "UTC"))).toBe("2026-11-27T00:00:00.000Z");
    expect(iso(parseTime("2026-11-27", ny))).toBe("2026-11-27T05:00:00.000Z");
    expect(iso(parseTime("2026-11-27", "Asia/Tokyo"))).toBe("2026-11-26T15:00:00.000Z");
  });

  it("leaves Z and offsets alone in every zone", () => {
    for (const zone of ["UTC", ny, "Asia/Tokyo"]) {
      expect(iso(parseTime("2026-11-27T07:40Z", zone))).toBe("2026-11-27T07:40:00.000Z");
      expect(iso(parseTime("2026-11-27T07:40:00.000Z", zone))).toBe("2026-11-27T07:40:00.000Z");
      expect(iso(parseTime("2026-11-27T07:40+09:00", zone))).toBe("2026-11-26T22:40:00.000Z");
      expect(iso(parseTime("2026-11-27T07:40:00-05:00", zone))).toBe("2026-11-27T12:40:00.000Z");
    }
  });

  it("crosses the spring DST change in New York", () => {
    // 2026-03-08: 02:00 EST jumps to 03:00 EDT.
    expect(iso(parseTime("2026-03-08T01:30", ny))).toBe("2026-03-08T06:30:00.000Z");
    expect(iso(parseTime("2026-03-08T03:30", ny))).toBe("2026-03-08T07:30:00.000Z");
    expect(iso(parseTime("2026-03-08T12:00", ny))).toBe("2026-03-08T16:00:00.000Z");
    // 02:30 never happens. It moves forward by the hour that was skipped.
    expect(iso(parseTime("2026-03-08T02:30", ny))).toBe("2026-03-08T07:30:00.000Z");
  });

  it("crosses the autumn DST change in New York and Berlin", () => {
    // 2026-11-01: 02:00 EDT falls back to 01:00 EST.
    expect(iso(parseTime("2026-11-01T00:30", ny))).toBe("2026-11-01T04:30:00.000Z");
    expect(iso(parseTime("2026-11-01T03:00", ny))).toBe("2026-11-01T08:00:00.000Z");
    expect(iso(parseTime("2026-11-01T12:00", ny))).toBe("2026-11-01T17:00:00.000Z");
    // 01:30 happens twice. The first one wins, east and west of Greenwich.
    expect(iso(parseTime("2026-11-01T01:30", ny))).toBe("2026-11-01T05:30:00.000Z");
    expect(iso(parseTime("2026-10-25T02:30", "Europe/Berlin"))).toBe("2026-10-25T00:30:00.000Z");
    expect(iso(parseTime("2026-03-29T02:30", "Europe/Berlin"))).toBe("2026-03-29T01:30:00.000Z");
  });

  it("returns NaN for a date that does not exist", () => {
    expect(parseTime("2026-13-40T07:40", ny)).toBeNaN();
    expect(parseTime("not a date", ny)).toBeNaN();
    expect(instantOf("2026-13-40T07:40", (text) => parseTime(text, ny))).toBeNull();
  });
});

describe("offset-less data across a DST change", () => {
  it("paints New York clock strings like the same instants written with offsets", () => {
    const zone = { timezone: "America/New_York", size: { width: 640, height: 320 } };
    // Noon each day across 2026-11-01. The offset moves from -04:00 to -05:00.
    const bare = ["2026-10-30T12:00", "2026-10-31T12:00", "2026-11-01T12:00", "2026-11-02T12:00", "2026-11-03T12:00"];
    const exact = ["2026-10-30T12:00-04:00", "2026-10-31T12:00-04:00", "2026-11-01T12:00-05:00", "2026-11-02T12:00-05:00", "2026-11-03T12:00-05:00"];
    const a = render(lineOf(bare.map(point), zone)) ?? "";
    const b = render(lineOf(exact.map(point), zone)) ?? "";
    expect(bottomLabels(a)).toEqual(bottomLabels(b));
    expect(bottomLabels(a)).toEqual(["Oct 31", "Nov 1", "Nov 2", "Nov 3"]);
    const strokes = (svg: string) => [...svg.matchAll(/<path [^>]*\bd="([^"]+)"/g)].map((match) => match[1]);
    expect(strokes(a).length).toBeGreaterThan(0);
    expect(strokes(a)).toEqual(strokes(b));
  });
});
