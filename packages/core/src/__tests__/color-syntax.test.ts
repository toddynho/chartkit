import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { render } from "../all";
import { auto } from "../theme";
import { candidates } from "../themes/candidates";
import { editorial } from "../themes/editorial";
import { midnight } from "../themes/midnight";
import { refined } from "../themes/refined";

/** CSS Color 4 slash-alpha and space-separated rgb()/hsl(). resvg drops or blacks these. */
const MODERN_COLOR = /(?:rgb|hsl|hwb|lab|lch|oklab|oklch)\(\s*[0-9.]+(?:\s+[0-9.]+){2}/;

const here = dirname(fileURLToPath(import.meta.url));

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === "__tests__") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(ts|css)$/.test(name) && !name.endsWith(".test.ts")) out.push(path);
  }
  return out;
}

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const item of value) strings(item, out);
  else if (value && typeof value === "object") for (const item of Object.values(value)) strings(item, out);
  return out;
}

describe("legacy rgba colour syntax", () => {
  it("keeps shipped theme tokens off slash-alpha", () => {
    const css = readFileSync(join(here, "../../themes/candidates.css"), "utf8");
    const shipped = [auto, refined, editorial, midnight, ...candidates, css];
    for (const item of shipped) {
      for (const color of strings(item)) expect(color).not.toMatch(MODERN_COLOR);
    }
    expect(auto.grid).toBe("light-dark(rgba(0, 0, 0, 0.16), rgba(245, 245, 247, 0.22))");
    expect(auto.axis).toBe("light-dark(rgba(0, 0, 0, 0.14), rgba(245, 245, 247, 0.16))");
    expect(auto.track).toBe("light-dark(rgba(0, 0, 0, 0.10), rgba(245, 245, 247, 0.16))");
    expect(css).toContain("rgba(0, 0, 0, 0.16)");
    expect(css).toContain("rgba(245, 245, 247, 0.16)");
  });

  it("does not emit slash-alpha from theme sources or rendered SVG", () => {
    const roots = [join(here, ".."), join(here, "../../themes"), join(here, "../../../geo/src")];
    const hits: string[] = [];
    for (const file of roots.flatMap((dir) => walk(dir))) {
      const text = readFileSync(file, "utf8");
      if (MODERN_COLOR.test(text)) hits.push(file);
    }
    expect(hits).toEqual([]);

    const line = render({
      version: "1",
      type: "line",
      data: [
        { month: "Jan", revenue: 1 },
        { month: "Feb", revenue: 3 },
      ],
      encoding: { x: "month", y: "revenue" },
      theme: { preset: "soft" },
      a11y: { alt: "Revenue rose from January to February." },
    });
    const gauge = render({
      version: "1",
      type: "gauge",
      metric: { label: "Capacity", value: 72, min: 0, max: 100 },
      theme: { preset: "soft" },
      a11y: { alt: "Capacity is 72 out of 100." },
    });
    for (const svg of [line, gauge]) {
      expect(svg).not.toMatch(MODERN_COLOR);
      expect(svg).not.toContain(" / ");
    }
    expect(line).toContain("rgba(0, 0, 0, 0.16)");
    expect(line).toContain("rgba(245, 245, 247, 0.22)");
    expect(gauge).toContain("rgba(0, 0, 0, 0.10)");
    expect(gauge).toContain("rgba(245, 245, 247, 0.16)");
  });
});
