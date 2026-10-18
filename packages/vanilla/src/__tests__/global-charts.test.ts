import { describe, expect, it } from "vitest";
import { chartScriptUrl, extraTypesIn, renderKnown } from "../global-charts";

describe("browser extra charts", () => {
  it("builds a sibling URL and waits for that chart to register", () => {
    expect(chartScriptUrl("https://cdn.example/chartkit.auto.global.js", "gantt")).toBe("https://cdn.example/chartkit.gantt.global.js");
    document.body.innerHTML = `<pre class="chartkit"><code>{"type":"gantt"}</code></pre><pre class="chartkit">{"type":"line"}</pre>`;
    expect(extraTypesIn(document)).toEqual(["gantt"]);
    const spec = {
      version: "1" as const,
      type: "gantt",
      data: [{ task: "Spec", section: "Plan", start: "2026-03-02", end: "2026-03-13" }],
      a11y: { alt: "The spec runs in March." },
    };
    expect(renderKnown(spec)).toBe("");
    (globalThis as { ChartKitCharts?: Record<string, { render: (value: Record<string, unknown>) => string | null }> }).ChartKitCharts = {
      gantt: { render: () => "<svg data-ck-type=\"gantt\"></svg>" },
    };
    expect(renderKnown(spec)).toContain("gantt");
  });
});
