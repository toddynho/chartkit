import { describe, expect, it } from "vitest";
import { createLineRace, lineRaceFromCsv, lineRaceFromJson } from "../race";
import { muxAvcMp4 } from "../race-export";
import { podcastMentionsCsv, podcastMentionsRace } from "../race-sample";

function race() {
  return createLineRace(podcastMentionsRace());
}

describe("line chart race", () => {
  it("draws straight segments on a white field", () => {
    const svg = race().frame(0.45);
    expect(svg).toContain('fill="#ffffff"');
    expect(svg).toContain("AI Lab Mentions in Podcasts");
    expect(svg).not.toContain("<filter");
    expect(svg).not.toContain("blur");
    const paths = [...svg.matchAll(/data-ck-series="[^"]+" d="([^"]+)"/g)].map((match) => match[1] ?? "");
    expect(paths).toHaveLength(7);
    for (const d of paths) {
      expect(d.startsWith("M")).toBe(true);
      expect(d).not.toMatch(/[CQ]/);
      expect(d).toContain("L");
    }
  });

  it("keeps the left edge fixed and grows y with the leader", () => {
    const chart = race();
    const early = chart.state(0.05);
    const mid = chart.state(0.55);
    const end = chart.state(1);
    expect(early.xDomain[0]).toBe(end.xDomain[0]);
    expect(early.xDomain[1]).toBeLessThan(mid.xDomain[1]);
    expect(mid.xDomain[1]).toBeLessThan(end.xDomain[1]);
    expect(early.yMax).toBeLessThan(400);
    expect(end.yMax).toBeGreaterThan(15950);
    expect(end.yMax).toBeLessThan(15950 * 1.25);
    let previous = 0;
    for (let step = 0; step <= 20; step++) {
      const yMax = chart.state(step / 20).yMax;
      expect(yMax).toBeGreaterThanOrEqual(previous - 1e-6);
      previous = yMax;
    }
  });

  it("thins month ticks and stacks tip labels", () => {
    const chart = race();
    expect(chart.state(0.08).xTickStep).toBe(1);
    expect(chart.state(1).xTickStep).toBeGreaterThan(1);
    const end = chart.state(1);
    const byValue = end.tips.slice().sort((a, b) => b.value - a.value);
    expect(byValue[0]?.name).toBe("Anthropic");
    expect(byValue[0]?.value).toBe(15950);
    expect(end.tips.every((tip) => Math.abs(tip.x - end.plot.right) < 0.6)).toBe(true);
    for (let i = 1; i < byValue.length; i++) {
      expect(byValue[i]!.labelY).toBeGreaterThan(byValue[i - 1]!.labelY);
      expect(byValue[i]!.labelY - byValue[i - 1]!.labelY).toBeGreaterThanOrEqual(20);
    }
    for (const tip of end.tips) {
      expect(tip.labelY).toBeGreaterThanOrEqual(end.plot.top);
      expect(tip.labelY).toBeLessThanOrEqual(end.plot.bottom);
    }
    expect(chart.frame(1)).toContain("15,950");
    expect(chart.frame(1)).toContain("episodes/mo");
    expect(chart.frame(1)).toContain("data-ck-leader");
    const earlyLeader = chart.state(0.02).tips.reduce((best, tip) => (tip.value > best.value ? tip : best));
    expect(earlyLeader.name).toBe("OpenAI");
  });

  it("slides the month during a boundary and stays deterministic", () => {
    const chart = race();
    let sliding: ReturnType<typeof chart.state> | null = null;
    for (let step = 1; step < 240; step++) {
      const view = chart.state(step / 240);
      if (view.odometer > 0.2 && view.odometer < 0.8 && view.odometerMonths.length === 2) {
        sliding = view;
        break;
      }
    }
    expect(sliding).not.toBeNull();
    const svg = chart.frame(sliding!.t);
    const block = svg.slice(svg.indexOf("data-ck-odometer"));
    expect(block).toContain(`>${sliding!.odometerMonths[0]}<`);
    expect(block).toContain(`>${sliding!.odometerMonths[1]}<`);
    expect(chart.frame(0.4)).toBe(chart.frame(0.4));
    expect(chart.frame(0)).not.toBe(chart.frame(1));
  });

  it("lets a following scale shrink after a peak", () => {
    const rows = [
      { m: "2024-01-01", a: 10 },
      { m: "2024-02-01", a: 100 },
      { m: "2024-03-01", a: 20 },
    ];
    const follow = createLineRace({ title: "Dip", x: "m", scale: "follow", data: rows });
    const expand = createLineRace({ title: "Dip", x: "m", scale: "expand", data: rows });
    expect(follow.state(1).yMax).toBeLessThan(follow.state(0.5).yMax);
    expect(expand.state(1).yMax).toBeGreaterThan(100);
  });

  it("reads csv and json into the same final values", () => {
    const csv = podcastMentionsCsv();
    const fromCsv = createLineRace(
      lineRaceFromCsv(csv, {
        title: "AI Lab Mentions in Podcasts",
        unit: "episodes/mo",
      }),
    );
    expect(fromCsv.state(1).tips.find((tip) => tip.name === "Anthropic")?.value).toBe(15950);
    const fromJson = createLineRace(lineRaceFromJson(JSON.stringify(podcastMentionsRace())));
    expect(fromJson.frame(1)).toContain("15,540");
    const quoted = lineRaceFromCsv('month,"Hugging Face",Other\n2024-01-01,"1,000",2\n2024-02-01,1100,3\n', {
      title: "Quoted",
    });
    expect(quoted.series?.map((series) => series.name)).toEqual(["Hugging Face", "Other"]);
    expect(quoted.data[0]?.["Hugging Face"]).toBe(1000);
  });

  it("rejects a table that cannot be a race", () => {
    expect(() => createLineRace({ title: "Empty", data: [] })).toThrow(/two rows/);
    expect(() => lineRaceFromCsv("only\n", { title: "No" })).toThrow(/date column/);
  });
});

describe("mp4 muxer", () => {
  it("writes ftyp, moov, and mdat with the first sample at the chunk offset", () => {
    const first = Uint8Array.from([1, 2, 3, 4, 5]);
    const second = Uint8Array.from([6, 7, 8]);
    const mp4 = muxAvcMp4({
      width: 64,
      height: 48,
      fps: 30,
      avcC: Uint8Array.from([1, 0x64, 0, 0x28, 0xff, 0xe1, 0, 0]),
      samples: [
        { data: first, key: true },
        { data: second, key: false },
      ],
    });
    const boxes: string[] = [];
    const view = new DataView(mp4.buffer, mp4.byteOffset, mp4.byteLength);
    let offset = 0;
    while (offset + 8 <= mp4.length) {
      const size = view.getUint32(offset);
      const type = String.fromCharCode(mp4[offset + 4]!, mp4[offset + 5]!, mp4[offset + 6]!, mp4[offset + 7]!);
      boxes.push(type);
      if (size < 8) break;
      offset += size;
    }
    expect(boxes).toEqual(["ftyp", "moov", "mdat"]);
    const stco = find(mp4, "stco");
    const chunk = view.getUint32(stco + 12);
    expect([...mp4.subarray(chunk, chunk + first.length)]).toEqual([...first]);
    expect(find(mp4, "avcC")).toBeGreaterThan(0);
    expect(find(mp4, "avc1")).toBeGreaterThan(0);
  });
});

function find(bytes: Uint8Array, type: string): number {
  const code = [...type].map((char) => char.charCodeAt(0));
  for (let i = 0; i <= bytes.length - 4; i++) {
    if (code.every((byte, index) => bytes[i + index] === byte)) return i;
  }
  throw new Error(`missing ${type}`);
}
