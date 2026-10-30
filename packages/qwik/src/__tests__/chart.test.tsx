/**
 * @vitest-environment jsdom
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToString as qwikRender } from "@builder.io/qwik/server";
import { describe, expect, it } from "vitest";
import { Chart } from "../Chart";
import { hydrate } from "../client";
import { renderToString } from "../ssr.js";

const line = {
  version: "1" as const,
  type: "line" as const,
  data: [
    { quarter: "Q1", units: 40 },
    { quarter: "Q2", units: 55 },
  ],
  encoding: { x: "quarter", y: "units" },
  a11y: { alt: "Units rose from Q1 to Q2." },
};

describe("Qwik Chart", () => {
  it("prints static SVG from the server render", async () => {
    const result = await qwikRender(<Chart spec={line} />, { containerTagName: "div" });
    expect(result.html).toContain('data-ck-type="line"');
    expect(result.html).toContain("Units rose from Q1 to Q2.");
  });

  it("returns the SVG string, including an extra chart", () => {
    const svg = renderToString(line);
    expect(svg).toContain('data-ck-type="line"');
    const histogram = renderToString({
      version: "1",
      type: "histogram",
      data: [{ score: 1 }, { score: 2 }, { score: 2 }, { score: 8 }],
      encoding: { x: "score" },
      mark: { bins: 2 },
      a11y: { alt: "Scores cluster at the low end." },
    });
    expect(histogram).toContain('data-ck-type="histogram"');
  });

  it("mounts the server SVG from the visible-task helper", async () => {
    const host = document.createElement("div");
    host.innerHTML = renderToString(line);
    document.body.append(host);
    const chart = hydrate(host, line);
    expect(host.querySelectorAll("svg")).toHaveLength(1);
    expect(host.querySelector("svg")?.getAttribute("aria-label")).toBe(line.a11y.alt);
    chart.destroy();
    expect(host.querySelector("svg")).toBeNull();
    host.remove();
  });

  it("calls hydrate from a visible task", () => {
    const source = readFileSync(join(process.cwd(), "src/Chart.tsx"), "utf8");
    expect(source).toContain("useVisibleTask$");
    expect(source).toContain("hydrate(");
    expect(source).toContain("renderToSvg");
  });

  it("throws when the spec is invalid", () => {
    expect(() => renderToString({ ...line, a11y: { alt: "" } })).toThrow(/CK\d{4}/);
  });
});
