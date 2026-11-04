import { describe, expect, it } from "vitest";
import { render } from "../extra";
import { repair, validate } from "../validate";

const alt = "Most waits sit near 15 minutes, with a tail out to 40.";

function spec(extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    version: "1",
    type: "density",
    data: [{ wait: 12 }, { wait: 15 }, { wait: 18 }, { wait: 14 }, { wait: 40 }],
    encoding: { x: "wait" },
    a11y: { alt },
    ...extra,
  };
}

describe("density", () => {
  it("draws one curve from the raw sample", () => {
    const result = validate(spec());
    expect(result.ok, JSON.stringify(result.errors)).toBe(true);
    const svg = render(spec());
    expect(svg).toContain('data-ck-type="density"');
    expect(svg).toContain('data-ck-mark="area"');
    expect(svg).not.toContain("ck-chart-error");
    expect(JSON.stringify(spec().data)).toContain("wait");
  });

  it("changes with bandwidth, steps, normalize, rug, and groups", () => {
    const base = render(spec());
    expect(render(spec({ mark: { bandwidth: 2 } }))).not.toBe(base);
    expect(render(spec({ mark: { steps: 24 } }))).not.toBe(base);
    expect(render(spec({ mark: { normalize: "count" } }))).not.toBe(base);
    expect(render(spec({ mark: { rug: true } }))).toContain('data-ck-mark="rug"');
    const grouped = render({
      version: "1",
      type: "density",
      data: [
        { wait: 12, desk: "A" },
        { wait: 14, desk: "A" },
        { wait: 30, desk: "B" },
        { wait: 36, desk: "B" },
      ],
      encoding: { x: "wait", color: "desk" },
      mark: { bandwidth: 4, normalize: "count" },
      a11y: { alt: "Desk A clusters near 13 minutes. Desk B clusters near 33." },
    });
    expect(grouped).toContain("A");
    expect(grouped).toContain("B");
  });

  it("errors on a short sample, a zero bandwidth, and two dimensions", () => {
    expect(validate(spec({ data: [{ wait: 4 }] })).errors.some((error) => error.code === "CK3105")).toBe(true);
    expect(validate(spec({ mark: { bandwidth: 0 } })).errors.some((error) => error.code === "CK3106")).toBe(true);
    expect(validate(spec({ mark: { dims: 2 } })).errors.some((error) => error.code === "CK3109")).toBe(true);
    const bins = validate(spec({ mark: { bins: 8 } }));
    expect(bins.warnings.some((warning) => warning.code === "CK3107")).toBe(true);
    expect(repair(spec({ mark: { bins: 8 } })).spec).not.toMatchObject({ mark: { bins: 8 } });
    const foreign = validate({ version: "1", type: "line", data: [{ x: "A", y: 1 }, { x: "B", y: 2 }], encoding: { x: "x", y: "y" }, mark: { bandwidth: 2, steps: 32 }, a11y: { alt: "A line rises." } });
    expect(foreign.warnings.some((warning) => warning.code === "CK3111")).toBe(true);
    expect(foreign.warnings.some((warning) => warning.code === "CK3112")).toBe(true);
  });
});
