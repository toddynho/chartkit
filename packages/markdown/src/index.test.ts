import { describe, expect, it } from "vitest";
import { rehypeChartkit, remarkChartkit, renderFence } from "./index";

const pie = `pie
    title Share of workshop hours
    "Design": 42
    "Build": 35`;

describe("markdown fences", () => {
  it("renders chartkit JSON and supported mermaid, and leaves a flowchart", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "code",
          lang: "chartkit",
          value: '{"version":"1","type":"bar","data":[{"lane":"A","stops":2}],"encoding":{"x":"lane","y":"stops"},"a11y":{"alt":"Lane A has two stops."}}',
        },
        { type: "code", lang: "mermaid", value: pie },
        { type: "code", lang: "mermaid", value: "flowchart TD\n  A-->B" },
      ],
    };
    remarkChartkit()(tree);
    expect(tree.children[0]).toMatchObject({ type: "html" });
    expect(tree.children[0].value).toContain("<svg");
    expect(tree.children[0].value).toContain('data-ck-type="bar"');
    expect(tree.children[0].value).not.toContain("<script");
    expect(tree.children[1].value).toContain('data-ck-type="donut"');
    expect(tree.children[2]).toMatchObject({ type: "code", lang: "mermaid" });
  });

  it("replaces a rehype code fence with a raw SVG node", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "pre",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "code",
              properties: { className: ["language-mermaid"] },
              children: [{ type: "text", value: pie }],
            },
          ],
        },
      ],
    };
    rehypeChartkit()(tree);
    const raw = tree.children[0] as { type: string; value?: string };
    expect(raw.type).toBe("raw");
    expect(raw.value).toContain('data-ck-type="donut"');
    expect(renderFence("flowchart TD\nA-->B", "mermaid")).toBeNull();
  });
});
