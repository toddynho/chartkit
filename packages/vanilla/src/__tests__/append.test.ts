import { describe, expect, it } from "vitest";
import { joinRows } from "../append";

describe("columnar append", () => {
  it("keeps Float64Array columns and reuses spare capacity", () => {
    const first = joinRows(
      { columns: { x: Float64Array.from([1, 2, 3]), y: Float64Array.from([4, 5, 6]) }, sampling: "lttb" },
      [{ x: 4, y: 7 }],
    ) as { columns: { x: Float64Array; y: Float64Array }; sampling: string };
    expect(first.sampling).toBe("lttb");
    expect(Array.from(first.columns.x)).toEqual([1, 2, 3, 4]);
    expect(first.columns.y).toBeInstanceOf(Float64Array);
    const second = joinRows(first, [{ x: 5, y: 8 }]) as { columns: { x: Float64Array } };
    expect(Array.from(second.columns.x)).toEqual([1, 2, 3, 4, 5]);
    const windowed = joinRows(second, [{ x: 6, y: 9 }], 3) as { columns: { x: Float64Array; y: Float64Array } };
    expect(Array.from(windowed.columns.x)).toEqual([4, 5, 6]);
    expect(Array.from(windowed.columns.y)).toEqual([7, 8, 9]);
  });
});
