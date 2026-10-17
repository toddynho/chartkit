import { describe, expect, it } from "vitest";
import { auto, midnight, paint, resolvePreset } from "../theme";
import { emerald } from "../themes/emerald";
import { latte } from "../themes/latte";
import { retro } from "../themes/retro";
import { sunset } from "../themes/sunset";

describe("theme presets", () => {
  it("keeps midnight as the built-in preset", () => {
    expect(midnight.series[0]).toBe("#22c55e");
    expect(resolvePreset("midnight").background).toBe("#0c0c0c");
    expect(resolvePreset(undefined).background).toBe("transparent");
    expect(resolvePreset("auto")).toEqual(auto);
    expect(resolvePreset("auto").series[0]).toContain("light-dark(");
  });

  it("gives a CSS variable a visible fallback", () => {
    const painted = paint("var(--chart-1)", auto, 0);
    expect(painted).toContain("var(--ck-series-1,");
    expect(painted).toContain("var(--chart-1,");
    expect(painted).toContain("light-dark(");
    expect(paint("var(--brand)", midnight, 0)).toBe("var(--brand, #22c55e)");
  });

  it("derives other presets from midnight plus a delta", () => {
    expect(emerald.series[0]).toBe("#10b981");
    expect(emerald.axis).toBe(midnight.axis);
    expect(emerald.background).not.toBe(midnight.background);
    expect(retro.accent).toBe("#ff7edb");
    expect(sunset.background).toBe("#ffffff");
    expect(latte.background).toBe("#eff1f5");
    expect(resolvePreset("emerald").series[0]).toBe("#10b981");
  });

  it("falls back to midnight for a preset that was not imported", () => {
    expect(resolvePreset("not-a-preset").background).toBe(midnight.background);
  });
});
