import { describe, expect, it } from "vitest";
import { fromMermaid, toSpec } from "../mermaid-phase4";

describe("mermaid phase4 entry", () => {
  it("parses gantt synchronously after the entry loads", () => {
    const result = fromMermaid("gantt\n    title Launch plan\n    Task :done, spec, 2026-03-02, 2026-03-13");
    expect(result.spec?.type).toBe("gantt");
    expect(result.spec?.title).toBe("Launch plan");
    const json = toSpec('{"version":"1","type":"gantt","data":[{"task":"A","start":"2026-03-02","end":"2026-03-03"}],"a11y":{"alt":"Task A runs one day."}}');
    expect(json.spec?.type).toBe("gantt");
  });
});