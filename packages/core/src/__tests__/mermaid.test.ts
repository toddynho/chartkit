import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { render } from "../extra";
import { fromMermaid, fromMermaidAsync, toSpec } from "../mermaid";
import { validate } from "../validate";

const fixtures = join(dirname(fileURLToPath(import.meta.url)), "fixtures/mermaid");
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

function read(name: string): string {
  return readFileSync(join(fixtures, name), "utf8");
}

function codes(warnings: { code: string }[]): string[] {
  return warnings.map((item) => item.code);
}

describe("fromMermaid", () => {
  it("converts xychart bar and line into a combo", () => {
    const result = fromMermaid(read("xychart.mmd"));
    expect(codes(result.warnings)).not.toContain("CK8006");
    expect(result.spec?.type).toBe("combo");
    expect(result.spec?.title).toBe("Weekly orders");
    expect(result.spec?.a11y).toMatchObject({ alt: "Weekly orders" });
    const data = result.spec?.data as { x: string; placed: number; shipped: number }[];
    expect(data.map((row) => row.x)).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    expect(data.map((row) => row.placed)).toEqual([12, 18, 15, 22, 30]);
    expect(data.map((row) => row.shipped)).toEqual([10, 14, 16, 20, 28]);
    const y = (result.spec?.encoding as { y: { field: string; axis?: string }[] }).y;
    expect(y.map((channel) => channel.field)).toEqual(["placed", "shipped"]);
    expect(y.every((channel) => channel.axis === undefined)).toBe(true);
    expect(validate(result.spec).ok).toBe(true);
    const svg = render(result.spec);
    expect(svg).toContain('data-ck-type="combo"');
    expect(svg).toContain("Placed");
    expect(svg).toContain("Shipped");
  });

  it("maps a horizontal xychart onto a horizontal bar", () => {
    const result = fromMermaid(read("xychart-horizontal.mmd"));
    expect(result.spec?.type).toBe("bar");
    expect(result.spec?.mark).toMatchObject({ orientation: "horizontal" });
    expect(result.spec?.encoding).toMatchObject({ x: "x", y: { field: "hours", title: "Hours" } });
    expect(JSON.stringify(result.spec)).not.toContain("Bar 1");
    expect(validate(result.spec).ok).toBe(true);
    expect(render(result.spec)).toContain('data-ck-type="bar"');
  });

  it("draws a numeric y range from encoding.y.scale.domain", () => {
    const result = fromMermaid(read("xychart-range.mmd"));
    expect(result.spec?.type).toBe("line");
    expect(result.warnings.some((item) => item.message.includes("y range"))).toBe(false);
    const data = result.spec?.data as { hour: number; degrees: number }[];
    expect(data[0].hour).toBe(0);
    expect(data[data.length - 1].hour).toBe(6);
    expect(data[0].degrees).toBe(3);
    expect(result.spec?.encoding).toMatchObject({
      x: { field: "hour", type: "quantitative" },
      y: { field: "degrees", title: "Degrees", scale: { domain: [0, 20] } },
    });
    expect(JSON.stringify(result.spec)).not.toContain("Line 1");
    expect(validate(result.spec).ok).toBe(true);
    const svg = render(result.spec);
    expect(svg).toContain('data-ck-type="line"');
    expect(svg).toContain(">0<");
    expect(svg).toContain(">20<");
  });

  it("maps pie showData onto a pie with legend values", () => {
    const result = fromMermaid(read("pie.mmd"));
    expect(result.spec?.type).toBe("pie");
    expect(result.spec?.mark).toBeUndefined();
    expect(result.spec?.legend).toMatchObject({ values: true });
    expect(result.spec?.a11y).toMatchObject({ alt: "Share of workshop hours" });
    expect(validate(result.spec).ok).toBe(true);
    const svg = render(result.spec);
    expect(svg).toContain("Design");
    expect(svg).toContain("42");
  });

  it("reads sankey CSV rows, including quoted commas", () => {
    const result = fromMermaid(read("sankey.mmd"));
    expect(result.spec?.type).toBe("sankey");
    const data = result.spec?.data as { from: string; flow: number }[];
    expect(data).toContainEqual({ from: "Oil, crude", to: "Refinery", flow: 9 });
    expect(validate(result.spec).ok).toBe(true);
    expect(render(result.spec)).toContain('data-ck-type="sankey"');
    expect(render(result.spec)).toContain("Farm");
  });

  it("converts radar-beta curves and draws a positive max", () => {
    const result = fromMermaid(read("radar.mmd"));
    expect(result.spec?.type).toBe("radar");
    expect(result.spec?.encoding).toMatchObject({ y: { field: "value", scale: { domain: [0, 100] } } });
    expect(result.warnings.some((item) => item.message.includes("declared max"))).toBe(false);
    expect(validate(result.spec).ok).toBe(true);
    const svg = render(result.spec);
    expect(svg).toContain('data-ck-type="radar"');
    expect(svg).toContain("Household");
    expect(svg).toContain("Food");
  });

  it("converts an indented treemap", () => {
    const result = fromMermaid(read("treemap.mmd"));
    expect(result.spec?.type).toBe("treemap");
    const data = result.spec?.data as { name: string; group: string; size: number }[];
    expect(data).toContainEqual({ name: "Oak", group: "Wood", size: 40 });
    expect(validate(result.spec).ok).toBe(true);
    expect(render(result.spec)).toContain('data-ck-type="treemap"');
  });

  it("maps quadrantChart onto a quadrant with quadrants labels", async () => {
    const result = await fromMermaidAsync(read("quadrant.mmd"));
    expect(codes(result.warnings)).not.toContain("CK8006");
    expect(result.spec?.type).toBe("quadrant");
    expect(result.spec?.quadrants).toEqual(["Promote", "Expand", "Revisit", "Improve"]);
    expect(result.spec?.encoding).toMatchObject({
      x: { field: "x", title: "Low reach|High reach" },
      y: { field: "y", title: "Low engagement|High engagement" },
    });
    const data = result.spec?.data as { name: string; x: number; y: number }[];
    expect(data).toContainEqual({ name: "North", x: 0.72, y: 0.81 });
    expect(validate(result.spec).ok).toBe(true);
    const svg = render(result.spec);
    expect(svg).toContain('data-ck-type="quadrant"');
    expect(svg).not.toContain('data-ck-annotation="rule"');
    expect(svg).toContain("Expand");
    expect(svg).toContain("North");
    const wide = await fromMermaidAsync("quadrantChart\n    Out: [1.5, -0.2]");
    expect(wide.spec?.encoding).toMatchObject({
      x: { scale: { domain: [0, 1.5] } },
      y: { scale: { domain: [-0.2, 1] } },
    });
  });

  it("converts a gantt with sections, status, duration, and after", async () => {
    const result = await fromMermaidAsync(read("gantt.mmd"));
    expect(codes(result.warnings)).not.toContain("CK8006");
    expect(result.spec?.type).toBe("gantt");
    const data = result.spec?.data as Record<string, unknown>[];
    expect(data[0]).toMatchObject({ id: "spec", task: "Write the spec", section: "Plan", start: "2026-03-02", end: "2026-03-13", status: "done" });
    expect(data.find((row) => row.id === "copy")).toMatchObject({ duration: "9d", depends: "spec", start: "2026-03-16" });
    expect(data.find((row) => row.id === "beta")).toMatchObject({ milestone: true, start: "2026-04-06", status: "crit", depends: "web" });
    expect(data.find((row) => row.id === "ga")).toMatchObject({ depends: "beta, billing" });
    expect(validate(result.spec).ok).toBe(true);
    expect(render(result.spec)).toContain('data-ck-type="gantt"');
    const odd = await fromMermaidAsync("gantt\n    dateFormat DD.MM.YYYY\n    axisFormat %m\n    excludes weekends\n    Task : 2026-03-02, 1d");
    expect(codes(odd.warnings)).toContain("CK8004");
  });

  it("converts timeline dates, ranges, and multiple events", async () => {
    const result = await fromMermaidAsync(read("timeline.mmd"));
    expect(codes(result.warnings)).not.toContain("CK8006");
    expect(result.spec?.type).toBe("timeline");
    const data = result.spec?.data as Record<string, unknown>[];
    expect(data).toContainEqual({ label: "Founded", date: "2014-04-02" });
    expect(data).toContainEqual({ label: "Series A", start: "2016-03-01", end: "2019-08-01" });
    expect(data).toContainEqual({ label: "Platform", start: "2024-01-15", end: "2026-06-01" });
    expect(validate(result.spec).ok).toBe(true);
    expect(render(result.spec)).toContain('data-ck-type="timeline"');
    const years = await fromMermaidAsync("timeline\n    section 2010s\n    2004 : Facebook : Google\n    : YouTube\n    2005-06 : Later");
    expect(codes(years.warnings)).toContain("CK8004");
    expect(years.spec?.data).toEqual([
      { label: "Facebook", date: "2004-01-01" },
      { label: "Google", date: "2004-01-01" },
      { label: "YouTube", date: "2004-01-01" },
      { label: "Later", date: "2005-06-01" },
    ]);
  });

  it("converts a journey score and actors", async () => {
    const result = await fromMermaidAsync(read("journey.mmd"));
    expect(codes(result.warnings)).not.toContain("CK8006");
    expect(result.spec?.type).toBe("journey");
    const data = result.spec?.data as Record<string, unknown>[];
    expect(data.find((row) => row.step === "Enter the card")).toMatchObject({ section: "Pay", score: 2, actors: "Shopper, Payments" });
    expect(data.find((row) => row.step === "Fix a declined card")).toMatchObject({ score: 1, actors: "Shopper, Payments, Support" });
    expect(validate(result.spec).ok).toBe(true);
    expect(render(result.spec)).toContain('data-ck-type="journey"');
  });

  it("converts venn-beta sets and unions", async () => {
    const result = await fromMermaidAsync(read("venn.mmd"));
    expect(codes(result.warnings)).not.toContain("CK8006");
    expect(result.spec?.type).toBe("venn");
    const data = result.spec?.data as { set: string; size: number }[];
    expect(data).toContainEqual({ set: "Search", size: 1280 });
    expect(data).toContainEqual({ set: "Saved views", size: 540 });
    expect(data).toContainEqual({ set: "Search+Filters", size: 410 });
    expect(data).toContainEqual({ set: "Search+Filters+Saved views", size: 90 });
    expect(validate(result.spec).ok).toBe(true);
    const svg = render(result.spec);
    expect(svg).toContain('data-ck-type="venn"');
    expect(svg).toContain("3-set areas are approximate");
    const labeled = await fromMermaidAsync('venn-beta\n    set A["Alpha"]:20\n    set B["Beta"]:12\n    union A,B["AB"]:3\n    text A1["React"]');
    expect(labeled.spec?.data).toEqual([
      { set: "Alpha", size: 20 },
      { set: "Beta", size: 12 },
      { set: "Alpha+Beta", size: 3 },
    ]);
    expect(codes(labeled.warnings)).toContain("CK8004");
  });

  it("uses accDescr as alt text and the frontmatter title as the heading", () => {
    const result = fromMermaid(read("frontmatter.mmd"));
    expect(result.spec?.title).toBe("Workshop mix");
    expect(result.spec?.a11y).toMatchObject({ alt: "Design takes the largest share of workshop hours." });
    expect(validate(result.spec).ok).toBe(true);
  });

  it("generates factual alt text when no title or description exists", () => {
    const result = fromMermaid(`pie
    "Oak": 8
    "Pine": 3`);
    expect(result.spec?.a11y).toMatchObject({ alt: "Oak is the largest slice at 8." });
    expect(validate(result.spec).ok).toBe(true);
  });

  it("warns on flowchart, click, style, and a short source cap", () => {
    const flow = fromMermaid("flowchart TD\n  A-->B");
    expect(flow.spec).toBeNull();
    expect(codes(flow.warnings)).toContain("CK8003");

    const click = fromMermaid(`xychart-beta
    title "Weekly orders"
    x-axis [Mon, Tue]
    bar [4, 9]
    click Mon href "https://example.com"
    style Mon fill:#fff`);
    expect(click.spec?.type).toBe("bar");
    expect(JSON.stringify(click.spec)).not.toContain("example.com");
    expect(JSON.stringify(click.spec)).not.toContain("href");
    expect(codes(click.warnings)).toContain("CK8004");

    const huge = fromMermaid("pie\n\"A\": 1\n", { maxSource: 4 });
    expect(huge.spec).toBeNull();
    expect(codes(huge.warnings)).toEqual(["CK8001"]);
  });

  it("truncates at the point cap and warns once", () => {
    const result = fromMermaid(read("pie.mmd"), { maxPoints: 2 });
    expect(codes(result.warnings)).toContain("CK8002");
    expect(result.spec?.data).toHaveLength(2);
  });

  it("warns when a treemap is nested more than one group deep", () => {
    const result = fromMermaid(`treemap-beta
"Wood"
    "Hardwood"
        "Oak": 40
        "Maple": 10
"Metal"
    "Steel": 30`);
    expect(codes(result.warnings)).toContain("CK8004");
    const data = result.spec?.data as { name: string; group: string }[];
    expect(data.find((row) => row.name === "Oak")?.group).toBe("Wood");
    expect(validate(result.spec).ok).toBe(true);
    expect(render(result.spec)).toContain("Oak");
  });

  it("escapes label text that looks like markup", () => {
    const result = fromMermaid(`pie
    title "Markup check"
    "<script>": 2
    "Safe": 1`);
    const svg = render(result.spec);
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
  });

  it("slugs axis and series titles, and falls back to x and value", () => {
    const named = fromMermaid(`xychart-beta
    x-axis "Week day" [Mon, Tue]
    y-axis "USD"
    bar "Net sales" [10, 12]
    line "Return rate" [0.2, 0.4]`);
    const row = (named.spec?.data as Record<string, unknown>[])[0];
    expect(Object.keys(row)).toEqual(["week_day", "net_sales", "return_rate"]);
    const y = (named.spec?.encoding as { y: { field: string; axis?: string }[] }).y;
    expect(y[1].axis).toBe("y2");
    expect(named.warnings.some((item) => item.message.includes("second y-axis"))).toBe(true);
    expect(named.spec?.axes).toMatchObject({ y2: { title: "Return rate" } });
    expect(validate(named.spec).ok).toBe(true);

    const single = fromMermaid(`xychart-beta
    x-axis "Month" [Jan, Feb]
    y-axis "USD"
    bar "Product" [10, 20]`);
    expect(single.spec?.encoding).toMatchObject({ x: "month", y: { field: "usd", title: "Product" } });

    const plain = fromMermaid(`xychart-beta
    bar [4, 9]
    line [5, 8]`);
    expect(Object.keys((plain.spec?.data as Record<string, unknown>[])[0]).sort()).toEqual(["value", "value2", "x"]);
    expect(JSON.stringify(plain.spec)).not.toContain("Bar 1");
    expect(JSON.stringify(plain.spec)).not.toContain("Line 1");
    expect((plain.spec?.encoding as { y: { axis?: string }[] }).y.every((channel) => !channel.axis)).toBe(true);
  });

  it("names every unnamed series from the y-axis title", () => {
    const result = fromMermaid(`xychart-beta
    x-axis [Mon, Tue]
    y-axis "Orders"
    bar [4, 9]
    line [5, 8]`);
    const y = (result.spec?.encoding as { y: { field: string; title: string }[] }).y;
    expect(y.map((channel) => channel.title)).toEqual(["Orders", "Orders 2"]);
    expect(y.map((channel) => channel.field)).toEqual(["orders", "orders_2"]);
    expect(JSON.stringify(result.spec)).not.toContain("Bar 1");
    expect(JSON.stringify(result.spec)).not.toContain("Line 1");
  });

  it("renders a pie as a filled disc", () => {
    const result = fromMermaid(read("pie.mmd"));
    const svg = render(result.spec) ?? "";
    const paths = [...svg.matchAll(/<path d="([^"]+)"/g)].map((match) => match[1]);
    expect(paths.length).toBe(3);
    for (const path of paths) expect(path.match(/A /g)?.length).toBe(1);
    expect(svg).not.toContain('font-size="20"');
    const holed = render({
      version: "1",
      type: "donut",
      data: [
        { label: "Oak", value: 8 },
        { label: "Pine", value: 3 },
      ],
      encoding: { x: "label", y: "value" },
      a11y: { alt: "Oak is the larger slice of the sample." },
    });
    const hole = [...(holed ?? "").matchAll(/<path d="([^"]+)"/g)].map((match) => match[1]);
    expect(hole.some((path) => (path.match(/A /g)?.length ?? 0) >= 2)).toBe(true);
  });

  it("rejects a radar with fewer than three spokes", () => {
    const result = fromMermaid(`radar-beta
  axis a["A"], b["B"]
  curve one["One"]{1, 2}`);
    expect(result.spec).toBeNull();
    expect(codes(result.warnings)).toContain("CK8005");
  });
});

describe("toSpec", () => {
  it("keeps ChartKit JSON and does not treat invalid JSON as Mermaid", () => {
    const json = toSpec('{"version":"1","type":"bar","data":[{"lane":"A","stops":2}],"encoding":{"x":"lane","y":"stops"},"a11y":{"alt":"Lane A has two stops."}}');
    expect(json.spec?.type).toBe("bar");
    expect(json.warnings).toEqual([]);
    const broken = toSpec("{not json");
    expect(broken.spec).toBeNull();
    expect(codes(broken.warnings)).toContain("CK8005");
    expect(broken.warnings[0].message).toMatch(/JSON/);
  });

  it("detects Mermaid when the text is not JSON", () => {
    const result = toSpec(read("pie.mmd"));
    expect(result.spec?.type).toBe("pie");
  });
});

describe("llms.txt", () => {
  it("mentions Mermaid import and stays within 6400 bytes", () => {
    const text = readFileSync(join(repoRoot, "docs/public/llms.txt"), "utf8");
    expect(text).toContain("ChartKit accepts Mermaid xychart, pie, sankey, radar and treemap syntax via fromMermaid/toSpec.");
    expect(Buffer.byteLength(text)).toBeLessThanOrEqual(7100);
  });
});
