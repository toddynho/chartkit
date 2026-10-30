import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import Chart from "../Chart.astro";

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

describe("Chart component", () => {
  it("prints the SVG and no script by default", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Chart, { props: { spec: line } });
    expect(html).toContain('data-ck-type="line"');
    expect(html).toContain("Units rose from Q1 to Q2.");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("data-chartkit");
  });

  it("keeps the SVG and opts into the vanilla mount script", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Chart, { props: { spec: line, client: true } });
    expect(html).toContain('data-ck-type="line"');
    expect(html).toContain("data-chartkit");
    expect(html).toContain('type="application/json"');
    expect(html).toContain('<script type="module"');
    expect(html).toContain("Client.astro");
  });
});
