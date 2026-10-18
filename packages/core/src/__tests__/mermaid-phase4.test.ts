import { describe, expect, it } from "vitest";
import { fromMermaid } from "../mermaid";

describe("base mermaid entry", () => {
  it("asks for the phase-4 chunk instead of parsing gantt", () => {
    const result = fromMermaid("gantt\n    title Launch plan\n    Task : 2026-03-02, 1d");
    expect(result.spec).toBeNull();
    expect(result.warnings.some((item) => item.code === "CK8004" && item.message.includes("mermaid/phase4"))).toBe(true);
    expect(result.warnings.some((item) => item.message.includes("fromMermaidAsync"))).toBe(true);
  });
});
