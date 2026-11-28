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
    expect(tree.children[0].value).toContain("font-family:var(--ck-font-family, inherit)");
    expect(tree.children[0].value).toContain('data-ck-type="bar"');
    expect(tree.children[0].value).not.toContain("<script");
    expect(tree.children[1].value).toContain('data-ck-type="pie"');
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
    expect(raw.value).toContain('data-ck-type="pie"');
    expect(renderFence("flowchart TD\nA-->B", "mermaid")).toBeNull();
  });
});

function painted(source: string): { label: string | undefined; svg: string } {
  const svg = renderFence(source, "mermaid") ?? "";
  return { label: svg.match(/ aria-label="([^"]*)"/)?.[1], svg };
}

function legend(svg: string): string[] {
  return [...svg.matchAll(/data-ck-key="legt:[^"]*">([^<]*)</g)].map((match) => match[1]);
}

const weeks = "x-axis [W1, W2, W3, W4]";

describe("generated alt text on converted Mermaid charts", () => {
  it("describes both unnamed series of a bar and line chart and says the title once", () => {
    const { label, svg } = painted(`xychart-beta\n title "Signups"\n ${weeks}\n bar [20, 30, 45, 50]\n line [22, 35, 40, 55]`);
    expect(label).toBe("Signups: bars rise from 20 to 50; line rises from 22 to 55.");
    expect(svg).toContain(`<desc>${label}</desc>`);
    expect(legend(svg)).toEqual(["Bars", "Line"]);
    expect(svg).not.toContain("rotate(-90");
  });

  it("does not number the y-axis title into series names", () => {
    const { label, svg } = painted(`xychart-beta\n title "Signups"\n ${weeks}\n y-axis "Signups"\n bar [20, 30, 45, 50]\n line [22, 35, 40, 55]`);
    expect(label).toBe("Signups: bars rise from 20 to 50; line rises from 22 to 55.");
    expect(legend(svg)).toEqual(["Bars", "Line"]);
  });

  it("adds the facts to a title of any length", () => {
    expect(painted(`xychart-beta\n title "Weekly signups"\n ${weeks}\n bar [20, 30, 45, 50]\n line [22, 35, 40, 55]`).label).toBe(
      "Weekly signups: bars rise from 20 to 50; line rises from 22 to 55.",
    );
  });

  it("describes a single series with a title", () => {
    expect(painted(`xychart-beta\n title "Signups"\n ${weeks}\n bar [20, 30, 45, 50]`).label).toBe("Signups: bars rise from 20 to 50.");
    expect(painted('xychart-beta\n title "Revenue"\n x-axis "Month" [Jan, Feb, Mar]\n y-axis "USD" 0 --> 100\n line [40, 90, 60]').label).toBe(
      "Revenue: USD peaks at Feb (90).",
    );
    expect(painted('xychart-beta\n title "Load"\n x-axis "Hour" 0 --> 3\n line [5, 9, 7, 2]').label).toBe("Load: line peaks at Hour 1 (9).");
  });

  it("describes two series with no title", () => {
    expect(painted(`xychart-beta\n ${weeks}\n bar [20, 30, 45, 50]\n line [22, 35, 40, 55]`).label).toBe(
      "Bars rise from 20 to 50; line rises from 22 to 55.",
    );
  });

  it("numbers unnamed series that share a mark", () => {
    const { label, svg } = painted(`xychart-beta\n title "Signups"\n ${weeks}\n line [20, 30, 45, 50]\n line [55, 40, 35, 22]`);
    expect(label).toBe("Signups: Series 1 rises from 20 to 50; Series 2 falls from 55 to 22.");
    expect(legend(svg)).toEqual(["Series 1", "Series 2"]);
  });

  it("titles each y-axis with its generated series name when the line needs a second axis", () => {
    const { label, svg } = painted('xychart-beta\n title "Sales"\n x-axis [a, b, c]\n bar [1000, 3000, 2000]\n line [0.2, 0.4, 0.3]');
    expect(label).toBe("Sales: bars peak at b (3000); line peaks at b (0.4).");
    expect(svg).toMatch(/rotate\(-90 [^>]*>Bars</);
    expect(svg).toMatch(/rotate\(90 [^>]*>Line</);
  });

  it("keeps author series names and sums up more than three series by the highest point", () => {
    expect(painted(`xychart-beta\n title "Signups"\n ${weeks}\n bar "Free" [20, 20, 20, 20]\n line "Paid" [22, 35, 40, 55]`).label).toBe(
      "Signups: Free stays at 20; Paid rises from 22 to 55.",
    );
    expect(painted('xychart-beta\n x-axis [a, b, c]\n line [1, 2, 3]\n line [3, 2, 9]\n line [1, 1, 1]\n line "Goal" [4, 2, 1]').label).toBe(
      "4 series; Series 2 is highest at c (9).",
    );
  });

  it("describes a pie with and without a title", () => {
    const slices = '"Dogs": 386\n "Cats": 85\n "Rats": 15';
    expect(painted(`pie title Pets\n ${slices}`).label).toBe("Pets: Dogs is the largest slice at 386.");
    expect(painted(`pie title Pets adopted by volunteers\n ${slices}`).label).toBe("Pets adopted by volunteers: Dogs is the largest slice at 386.");
    expect(painted(`pie\n ${slices}`).label).toBe("Dogs is the largest slice at 386.");
    expect(painted('pie\n "iPhone": 3\n "android": 2').label).toBe("iPhone is the largest slice at 3.");
  });

  it("lets accDescr win, and reads accTitle as the subject of the generated sentence", () => {
    const chart = `title "Signups"\n ${weeks}\n bar [20, 30, 45, 50]\n line [22, 35, 40, 55]`;
    expect(painted(`xychart-beta\n accTitle: Signup chart\n accDescr: Signups doubled over four weeks.\n ${chart}`).label).toBe("Signups doubled over four weeks.");
    expect(painted(`xychart-beta\n accDescr {\n Signups doubled\n over four weeks.\n }\n ${chart}`).label).toBe("Signups doubled over four weeks.");
    expect(painted('---\ntitle: Pets\naccDescr: Dogs are most of the adoptions.\n---\npie\n "Dogs": 386\n "Cats": 85').label).toBe("Dogs are most of the adoptions.");
    expect(painted(`xychart-beta\n accTitle: Signup counts by week\n ${chart}`).label).toBe(
      "Signup counts by week: bars rise from 20 to 50; line rises from 22 to 55.",
    );
  });

  it("leads sankey, radar and treemap facts with the title once", () => {
    expect(painted("sankey-beta\nSolar,Grid,40\nWind,Grid,25\nGrid,Homes,50").label).toBe("The largest flow is Grid to Homes at 50.");
    expect(painted('radar-beta\n title Skills\n axis a["Speed"], b["Power"], c["Range"]\n curve x["Alpha"]{3, 4, 5}\n curve y["Beta"]{5, 2, 1}').label).toBe(
      "Skills: Alpha is highest on Range.",
    );
    expect(painted('treemap-beta\n title Stock\n"Fruit"\n    "Apples": 30\n    "Pears": 12\n"Veg"\n    "Kale": 8').label).toBe(
      "Stock: Apples is the largest block at 30.",
    );
  });
});
