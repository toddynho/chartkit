import { describe, expect, it } from "vitest";
import { createOddsReplay, oddsFromCsv } from "../odds";
import { electionOddsCsv, electionOddsReplay, matchOddsCsv, matchOddsReplay } from "../odds-sample";

describe("odds replay", () => {
  it("draws steps on a fitted scale and keeps that scale still", () => {
    const chart = createOddsReplay(matchOddsReplay());
    const early = chart.state(0.2);
    const end = chart.state(1);
    expect(early.xDomain).toEqual(end.xDomain);
    expect(early.yMax).toBe(end.yMax);
    expect(early.yMin).toBe(end.yMin);
    expect(end.yMin).toBeGreaterThan(5);
    expect(end.yMax).toBeLessThan(95);
    const svg = chart.frame(0.7);
    expect(svg).toContain('fill="#ffffff"');
    expect(svg).toContain("Alder vs Marin");
    expect(svg).not.toMatch(/Kalshi|Polymarket|Nakashima|Berrettini/);
    const path = svg.match(/data-ck-series="Alder" d="([^"]+)"/)?.[1] ?? "";
    expect(path).toMatch(/L([\d.]+) ([\d.]+)L\1 /);
    expect(path).toMatch(/L([\d.]+) ([\d.]+)L[\d.]+ \2(?:[ "<]|$)/);
    expect(chart.frame(0.4)).toBe(chart.frame(0.4));
  });

  it("holds the last trade until the next one", () => {
    const chart = createOddsReplay(matchOddsReplay());
    const start = chart.state(0).tips.find((tip) => tip.name === "Alder");
    const done = chart.state(1).tips.find((tip) => tip.name === "Alder");
    expect(start?.value).toBe(36);
    expect(done?.value).toBe(54);
    const complement = chart.state(1).tips.find((tip) => tip.name === "Marin");
    expect(complement?.value).toBe(46);
    expect((start?.value ?? 0) + (chart.state(0).tips.find((tip) => tip.name === "Marin")?.value ?? 0)).toBe(100);
  });

  it("separates tip labels when the prices meet", () => {
    const chart = createOddsReplay(matchOddsReplay());
    let crowded: ReturnType<typeof chart.state> | null = null;
    for (let step = 1; step <= 200; step++) {
      const view = chart.state(step / 200);
      const [a, b] = view.tips;
      if (a && b && Math.abs(a.value - b.value) < 3) {
        crowded = view;
        break;
      }
    }
    expect(crowded).not.toBeNull();
    const gap = Math.abs((crowded?.tips[0]?.labelY ?? 0) - (crowded?.tips[1]?.labelY ?? 0));
    expect(gap).toBeGreaterThanOrEqual(28);
    expect(chart.frame(crowded!.t)).toContain("data-ck-leader");
    expect(chart.frame(1)).toContain(">54%<");
  });

  it("fits a dark week to a narrow band and can lock the axis at 0–100", () => {
    const election = createOddsReplay(electionOddsReplay());
    const end = election.state(1);
    expect(end.theme).toBe("dark");
    expect(end.yMax - end.yMin).toBeLessThan(40);
    expect(election.frame(1)).toContain('fill="#17202b"');
    expect(election.frame(1)).toContain("data-ck-legend");
    expect(election.frame(1)).toContain("Crimson");
    const unit = createOddsReplay({ ...matchOddsReplay(), scale: "unit" });
    expect(unit.state(0.5).yMin).toBe(0);
    expect(unit.state(0.5).yMax).toBe(100);
    const growing = createOddsReplay({ ...matchOddsReplay(), scale: "expand" });
    expect(growing.state(0.05).yMax - growing.state(0.05).yMin).toBeLessThan(growing.state(1).yMax - growing.state(1).yMin);
  });

  it("reads a percent table", () => {
    const fromCsv = createOddsReplay(oddsFromCsv(matchOddsCsv(), { title: "Alder vs Marin", theme: "light" }));
    expect(fromCsv.state(1).tips.find((tip) => tip.name === "Alder")?.value).toBe(54);
    const fromElection = oddsFromCsv(electionOddsCsv(), { title: "State election winner", theme: "dark" });
    expect(fromElection.series?.map((series) => series.name)).toEqual(["Crimson", "Cobalt"]);
    expect(() => createOddsReplay({ title: "Empty", data: [] })).toThrow(/two rows/);
  });
});
