import { describe, expect, it } from "vitest";
import { render } from "../extra";
import { repair, validate } from "../validate";

const alt = "History grew. The baseline is not zero.";

function spec(extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    version: "1",
    type: "streamgraph",
    data: [
      { year: "2020", fiction: 20, history: 12 },
      { year: "2021", fiction: 28, history: 18 },
      { year: "2022", fiction: 22, history: 30 },
    ],
    encoding: { x: "year", y: ["fiction", "history"] },
    a11y: { alt },
    ...extra,
  };
}

describe("streamgraph", () => {
  it("draws a wiggle stream from a short spec", () => {
    const result = validate(spec());
    expect(result.ok, JSON.stringify(result.errors)).toBe(true);
    const svg = render(spec());
    expect(svg).toContain('data-ck-type="streamgraph"');
    expect(svg).toContain('data-ck-mark="area"');
    expect(svg).toContain("fiction");
    expect(svg).toContain("history");
    expect(svg).not.toContain("ck-chart-error");
  });

  it("changes the picture when the baseline, order, curve, or labels change", () => {
    const base = render(spec());
    expect(render(spec({ mark: { streamOffset: "zero" } }))).not.toBe(base);
    expect(render(spec({ mark: { streamOffset: "center" } }))).not.toBe(base);
    expect(render(spec({ mark: { streamOffset: "silhouette" } }))).toBe(render(spec({ mark: { streamOffset: "center" } })));
    expect(render(spec({ mark: { streamOffset: "expand" } }))).toContain("%");
    expect(render(spec({ mark: { order: "descending" } }))).not.toBe(base);
    expect(render(spec({ mark: { curve: "step" } }))).not.toBe(base);
    expect(render(spec({ mark: { labels: true } }))).toContain(">fiction<");
  });

  it("draws long data and a time axis", () => {
    const long = {
      version: "1",
      type: "streamgraph",
      data: [
        { year: "2020", genre: "Fiction", copies: 20 },
        { year: "2020", genre: "History", copies: 12 },
        { year: "2021", genre: "Fiction", copies: 28 },
        { year: "2021", genre: "History", copies: 18 },
      ],
      encoding: { x: "year", y: "copies", color: "genre" },
      mark: { streamOffset: "center", order: "none" },
      legend: { position: "right" },
      a11y: { alt: "Fiction stays larger. Layers are centered." },
    };
    const svg = render(long);
    expect(svg).toContain("Fiction");
    expect(svg).toContain('data-ck-legend="right"');
    const dated = render({
      version: "1",
      type: "streamgraph",
      data: [
        { day: "2024-01-01", a: 4, b: 2 },
        { day: "2024-06-01", a: 6, b: 5 },
        { day: "2024-12-01", a: 3, b: 8 },
      ],
      encoding: { x: "day", y: ["a", "b"] },
      timezone: "UTC",
      a11y: { alt: "B grows through the year. The baseline is not zero." },
    });
    expect(dated).toContain("2024");
    expect(dated).toContain('data-ck-mark="column"');
  });

  it("rejects negatives and repairs one series, a stack, and a foreign baseline", () => {
    const negative = validate(spec({ data: [{ year: "2020", fiction: -2, history: 4 }, { year: "2021", fiction: 3, history: 4 }] }));
    expect(negative.errors.some((error) => error.code === "CK3095")).toBe(true);
    expect(render(spec({ data: [{ year: "2020", fiction: -2, history: 4 }, { year: "2021", fiction: 3, history: 4 }] }))).toContain("ck-chart-error");

    const one = validate({
      version: "1",
      type: "streamgraph",
      data: [{ year: "2020", fiction: 4 }, { year: "2021", fiction: 6 }],
      encoding: { x: "year", y: ["fiction"] },
      a11y: { alt: "Fiction rose. The baseline is zero." },
    });
    expect(one.warnings.some((warning) => warning.code === "CK3096")).toBe(true);
    expect(repair(one.ok ? {
      version: "1",
      type: "streamgraph",
      data: [{ year: "2020", fiction: 4 }, { year: "2021", fiction: 6 }],
      encoding: { x: "year", y: ["fiction"] },
      a11y: { alt: "Fiction rose. The baseline is zero." },
    } : spec()).spec).toMatchObject({ mark: { streamOffset: "zero" } });

    const stacked = validate(spec({ mark: { stack: "percent" } }));
    expect(stacked.warnings.some((warning) => warning.code === "CK3098")).toBe(true);
    expect(repair(spec({ mark: { stack: "percent", streamOffset: "center" } })).spec).toMatchObject({ mark: { streamOffset: "center" } });
    expect(repair(spec({ mark: { stack: "percent", streamOffset: "center" } })).spec).not.toMatchObject({ mark: { stack: "percent" } });

    const foreign = validate({ version: "1", type: "line", data: [{ x: "A", y: 1 }], encoding: { x: "x", y: "y" }, mark: { streamOffset: "wiggle", order: "none" }, a11y: { alt: "A line." } });
    expect(foreign.warnings.some((warning) => warning.code === "CK3099")).toBe(true);
    expect(foreign.warnings.some((warning) => warning.code === "CK3100")).toBe(true);
    const fixed = repair({ version: "1", type: "line", data: [{ x: "A", y: 1 }, { x: "B", y: 2 }], encoding: { x: "x", y: "y" }, mark: { streamOffset: "wiggle", order: "none" }, a11y: { alt: "A line rises." } });
    expect(fixed.spec).not.toMatchObject({ mark: { streamOffset: "wiggle" } });
  });

  it("warns above 12 series and when pie offset is set", () => {
    const row = { year: "2020" } as Record<string, number | string>;
    const next = { year: "2021" } as Record<string, number | string>;
    const fields: string[] = [];
    for (let i = 0; i < 13; i++) {
      fields.push(`s${i}`);
      row[`s${i}`] = i + 1;
      next[`s${i}`] = i + 2;
    }
    const wide = validate({ version: "1", type: "streamgraph", data: [row, next], encoding: { x: "year", y: fields }, a11y: { alt: "Many layers. The baseline is not zero." } });
    expect(wide.warnings.some((warning) => warning.code === "CK3097")).toBe(true);
    const offset = validate(spec({ mark: { offset: 12 } }));
    expect(offset.warnings.some((warning) => warning.code === "CK3101")).toBe(true);
  });

  it("records keyboard intent", () => {
    const svg = render(spec({ a11y: { alt, keyboard: true } }));
    expect(svg).toContain('data-ck-intent="keys"');
    expect(svg).toContain('tabindex="0"');
  });
});
