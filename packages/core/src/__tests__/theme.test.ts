import { describe, expect, it } from "vitest";
import { auto, midnight, paint, resolveGeometry, resolvePreset } from "../theme";
import { candidates } from "../themes/candidates";
import { emerald } from "../themes/emerald";
import { latte } from "../themes/latte";
import { retro } from "../themes/retro";
import { sunset } from "../themes/sunset";

describe("theme presets", () => {
  it("keeps midnight as an opt-in preset and Soft as the default", () => {
    expect(midnight.series[0]).toBe("#22c55e");
    expect(resolvePreset("midnight").background).toBe("#0c0c0c");
    expect(resolvePreset(undefined)).toBe(auto);
    expect(resolvePreset("auto")).toBe(auto);
    expect(resolvePreset("soft")).toBe(auto);
    expect(auto.background).toBe("transparent");
    expect(auto.series[0]).toContain("light-dark(#007aff,");
    expect(resolveGeometry(undefined).cornerRadius).toBe(8);
    expect(resolveGeometry(undefined).gap).toBe(0.34);
    expect(resolveGeometry(undefined).points).toBe("none");
    expect(resolveGeometry("midnight").cornerRadius).toBe(3);
    expect(resolveGeometry("editorial").points).toBe("always");
  });

  it("registers soft, refined, and editorial instead of falling through to midnight", () => {
    const pair = (light: string, dark: string) => (light === dark ? light : `light-dark(${light}, ${dark})`);
    for (const look of candidates) {
      const preset = resolvePreset(look.id);
      expect(preset.background).toBe("transparent");
      expect(preset.series).toEqual(look.light.series.map((color, index) => pair(color, look.dark.series[index] ?? color)));
      expect(preset.lines).toEqual(look.light.lines.map((color, index) => pair(color, look.dark.lines[index] ?? color)));
      for (const key of ["surface", "text", "muted", "grid", "axis", "track", "accent", "positive", "negative"] as const) {
        expect(preset[key]).toBe(pair(look.light[key], look.dark[key]));
      }
      const geometry = resolveGeometry(look.id);
      expect(geometry.strokeWidth).toBe(look.geometry.strokeWidth);
      expect(geometry.cornerRadius).toBe(look.geometry.cornerRadius);
      expect(geometry.gap).toBe(look.geometry.gap);
      expect(geometry.fillOpacity).toBe(look.geometry.fillOpacity);
      expect(geometry.points).toBe(look.geometry.points);
    }
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
