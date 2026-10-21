import { describe, expect, it } from "vitest";
import { render } from "../extra";
import { validate } from "../validate";

const alt = "Layout sample.";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const cities = ["Lisbon", "Porto", "Madrid", "Lyon", "Milan", "Oslo", "Dublin", "Prague"];

function rides(city: string, index: number): { city: string; month: string; rides: number; bikes: number }[] {
  return months.map((month, monthIndex) => ({
    city,
    month,
    rides: 40 + index * 18 + monthIndex * 6,
    bikes: 12 + index * 3 + monthIndex,
  }));
}

function facetSpec(extra: Record<string, unknown> = {}) {
  return {
    version: "1",
    type: "line",
    title: "Rides by city",
    data: cities.flatMap(rides),
    encoding: {
      x: "month",
      y: [
        { field: "rides", title: "Rides", color: "series-1" },
        { field: "bikes", title: "Bikes", color: "series-3" },
      ],
    },
    layout: { facet: { field: "city", columns: 4, scales: "shared", legend: "shared" } },
    size: { width: 880, height: 520 },
    a11y: { alt },
    ...extra,
  };
}

function panel(svg: string, name: string): string {
  const start = svg.indexOf(`data-ck-panel="${name}"`);
  if (start < 0) return "";
  const next = svg.indexOf("data-ck-panel=", start + 10);
  return svg.slice(start, next < 0 ? undefined : next);
}

describe("layout", () => {
  it("facets eight cities into a shared grid with one legend", () => {
    const spec = facetSpec();
    const result = validate(spec);
    expect(result.ok, result.errors.map((item) => item.message).join("; ")).toBe(true);
    const svg = render(spec);
    expect(svg).toContain('data-ck-facet="8"');
    expect(svg).toContain('data-ck-cols="4"');
    expect(svg).toContain('data-ck-scales="shared"');
    expect(svg).toContain('data-ck-legend="shared"');
    expect(svg.match(/data-ck-legend="shared"/g)?.length).toBe(1);
    expect(svg).toContain("Lisbon");
    expect(svg).toContain("Prague");
    expect(svg).toContain("Rides");
    expect(svg).toContain("Bikes");
    const lisbon = panel(svg, "Lisbon");
    const milan = panel(svg, "Milan");
    const porto = panel(svg, "Porto");
    const prague = panel(svg, "Prague");
    const nums = (svg: string) => svg.match(/>(\d+)</g)?.map((item) => Number(item.slice(1, -1))).filter((n) => n > 20) ?? [];
    const lisbonMax = nums(lisbon);
    const milanMax = nums(milan);
    expect(lisbonMax.length).toBeGreaterThan(0);
    expect(Math.max(...lisbonMax)).toBe(Math.max(...milanMax));
    expect(Math.max(...lisbonMax)).toBeGreaterThanOrEqual(196);
    expect(lisbon).toContain(">Rides<");
    expect(milan).toContain(">Rides<");
    expect(porto).not.toContain(">Rides<");
    expect(porto).not.toContain(">Jan<");
    expect(lisbon).not.toContain(">Jun<");
    expect(prague).toContain(">Jun<");
    expect(prague).toContain(">Jan<");
  });

  it("lets each panel scale itself", () => {
    const svg = render({
      version: "1",
      type: "bar",
      data: [
        { city: "A", month: "Jan", rides: 10 },
        { city: "A", month: "Feb", rides: 12 },
        { city: "B", month: "Jan", rides: 200 },
        { city: "B", month: "Feb", rides: 400 },
      ],
      encoding: { x: "month", y: "rides" },
      layout: { facet: { field: "city", columns: 2, scales: "independent", legend: "shared" } },
      legend: false,
      size: { width: 640, height: 280 },
      a11y: { alt },
    });
    expect(svg).toContain('data-ck-scales="independent"');
    expect(panel(svg, "A")).not.toContain(">400<");
    expect(panel(svg, "B")).toContain(">400<");
  });

  it("wraps when asked and warns when the grid is smaller than the categories", () => {
    const tight = facetSpec({
      layout: { facet: { field: "city", columns: 3, rows: 1, wrap: false, scales: "shared", legend: "shared" } },
    });
    const warned = validate(tight);
    expect(warned.warnings.find((item) => item.code === "CK3049")?.fix).toEqual([{ op: "replace", path: "/layout/facet/wrap", value: true }]);
    expect(render(tight)).toContain('data-ck-facet="3"');
    expect(render(facetSpec({ layout: { facet: { field: "city", columns: 3, wrap: true } } }))).toContain('data-ck-facet="8"');
  });

  it("stacks views in one dashboard", () => {
    const spec = {
      version: "1",
      type: "line",
      title: "Quarter",
      theme: "midnight",
      layout: {
        concat: {
          direction: "vertical",
          gap: 12,
          views: [
            {
              version: "1",
              type: "line",
              title: "Revenue",
              data: months.map((month, index) => ({ month, value: 120000 + index * 8000 })),
              encoding: { x: "month", y: { field: "value", title: "Revenue", format: { style: "compact", prefix: "$", decimals: 0 }, color: "series-1" } },
              a11y: { alt: "Revenue rises." },
            },
            {
              version: "1",
              type: "bar",
              title: "Orders",
              data: months.map((month, index) => ({ month, value: 80 + index * 6 })),
              encoding: { x: "month", y: { field: "value", title: "Orders", format: { style: "integer" }, color: "series-3" } },
              a11y: { alt: "Orders rise." },
            },
            {
              version: "1",
              type: "line",
              title: "Margin",
              data: months.map((month, index) => ({ month, value: 18 + (index % 3) })),
              encoding: { x: "month", y: { field: "value", title: "Margin", format: { style: "percent-raw", decimals: 0 }, color: "series-5" } },
              a11y: { alt: "Margin stays near 20 percent." },
            },
          ],
        },
      },
      size: { width: 720, height: 640 },
      a11y: { alt: "Revenue, orders, and margin for the half year." },
    };
    const result = validate(spec);
    expect(result.ok).toBe(true);
    const svg = render(spec);
    expect(svg).toContain('data-ck-views="3"');
    expect(svg).toContain('data-ck-flow="vertical"');
    expect(svg).toContain("Revenue");
    expect(svg).toContain("Orders");
    expect(svg).toContain("Margin");
  });

  it("keeps a panel when the view type is outside this bundle", async () => {
    const { createRenderer } = await import("../render");
    const { line } = await import("../charts/line");
    const draw = createRenderer([line]);
    const host = {
      version: "1",
      type: "line",
      data: months.map((month, index) => ({ month, revenue: 5 + index })),
      encoding: { x: "month", y: "revenue" },
      a11y: { alt },
      size: { width: 420, height: 220 },
    };
    const base = draw(host);
    const svg = draw({
      ...host,
      layout: {
        concat: {
          views: [
            {
              version: "1",
              type: "bar",
              title: "Orders",
              data: months.map((month, index) => ({ month, revenue: 8 + index })),
              encoding: { x: "month", y: "revenue" },
              a11y: { alt: "Orders by month." },
            },
          ],
        },
      },
    });
    expect(svg).not.toBe(base);
    expect(svg).toContain('data-ck-views="1"');
    expect(svg).toContain("Orders");
  });

  it("applies the narrow breakpoint and leaves the wide chart on four columns", () => {
    const base = facetSpec({
      layout: {
        facet: { field: "city", columns: 4, scales: "shared", legend: "shared" },
        breakpoints: [{ maxWidth: 560, columns: 1 }],
      },
    });
    expect(render({ ...base, size: { width: 880, height: 520 } })).toContain('data-ck-cols="4"');
    const narrow = render({ ...base, size: { width: 360, height: 520 } });
    expect(narrow).toContain('data-ck-cols="1"');
    expect(narrow).toContain('data-ck-facet="8"');
    expect(narrow).toContain("data-ck-bp=");
  });

  it("draws one bar per row under rtl, mirrored, with every category label", () => {
    const cities = ["الرياض", "جدة", "الدمام", "مكة", "المدينة", "الدوحة"];
    const data = cities.map((city, index) => ({ city, value: [186, 164, 142, 128, 151, 119][index] }));
    const svg = render({
      version: "1",
      type: "bar",
      title: "المبيعات حسب المدينة",
      data,
      encoding: { x: "city", y: { field: "value", title: "المبيعات" } },
      axes: { x: { title: "المدينة" }, y: { title: "المبيعات" } },
      layout: { direction: "rtl" },
      legend: false,
      size: { width: 640, height: 320 },
      a11y: { alt: "الرياض هي الأعلى." },
    });
    expect(svg).toContain('dir="rtl"');
    expect(svg).toContain('direction="ltr"');
    for (const city of cities) expect(svg).toContain(`>${city}<`);
    const bars = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" fill="var\(--ck-series/g)].filter(
      (item) => Number(item[3]) > 1 && Number(item[4]) > 1,
    );
    expect(bars).toHaveLength(data.length);
    expect(Number(bars[0]?.[1])).toBeGreaterThan(Number(bars[bars.length - 1]?.[1]));
    expect(svg).toMatch(/rotate\(-?90 /);
    const axisTitle = [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"[^>]*font-weight="500"[^>]*>([^<]*)<\/text>/g)].find((item) => item[3] === "المدينة");
    const x = Number(axisTitle?.[1]);
    const yTitle = [...svg.matchAll(/<text x="([\d.]+)"[^>]*>(المبيعات)<\/text>/g)].map((item) => Number(item[1]));
    expect(x).toBeGreaterThan(240);
    expect(x).toBeLessThan(360);
    expect(Math.max(...yTitle)).toBeGreaterThan(580);
  });

  it("draws a Hebrew line from the right", () => {
    const months = ["ינו", "פבר", "מרץ", "אפר", "מאי", "יוני"];
    const svg = render({
      version: "1",
      type: "line",
      title: "נוסעים בתל אביב",
      data: months.map((month, index) => ({ month, value: [42, 38, 55, 49, 63, 71][index] })),
      encoding: { x: "month", y: { field: "value", title: "אלפים" } },
      axes: { x: { title: "חודש" }, y: { title: "אלפים" } },
      layout: { direction: "rtl" },
      legend: false,
      size: { width: 640, height: 280 },
      a11y: { alt: "יוני הוא הגבוה." },
    });
    expect(svg).toContain('dir="rtl"');
    expect(svg).toContain("<path");
    for (const month of months) expect(svg).toContain(`>${month}<`);
  });

  it("places a wide view over two columns", () => {
    const svg = render({
      version: "1",
      type: "line",
      title: "Harbor week",
      layout: {
        concat: {
          columns: 2,
          gap: 12,
          views: [
            {
              version: "1",
              type: "line",
              span: 2,
              title: "Arrivals",
              data: months.map((month, index) => ({ month, value: [40, 36, 52, 48, 61, 58][index] })),
              encoding: { x: "month", y: "value" },
              a11y: { alt: "Arrivals peak in May." },
            },
            {
              version: "1",
              type: "bar",
              title: "Docks",
              data: [
                { dock: "A", ships: 12 },
                { dock: "B", ships: 9 },
              ],
              encoding: { x: "dock", y: "ships" },
              a11y: { alt: "Dock A is busier." },
            },
            {
              version: "1",
              type: "donut",
              title: "Cargo",
              data: [
                { kind: "Grain", tons: 40 },
                { kind: "Oil", tons: 25 },
              ],
              encoding: { x: "kind", y: "tons" },
              a11y: { alt: "Grain is the largest share." },
            },
          ],
        },
      },
      size: { width: 720, height: 560 },
      a11y: { alt: "Arrivals, docks, and cargo." },
    });
    expect(svg).toContain('data-ck-flow="grid"');
    expect(svg).toContain('data-ck-cols="2"');
    expect(svg).toContain('data-ck-views="3"');
    expect(svg).toContain("Arrivals");
    expect(svg).toContain("Cargo");
  });

  it("warns CK3040 through CK3048 and patches the spec", () => {
    const missing = validate({ version: "1", type: "line", data: [{ month: "Jan", value: 1 }], encoding: { x: "month", y: "value" }, layout: { facet: { columns: 2 } }, a11y: { alt } });
    expect(missing.warnings.find((item) => item.code === "CK3040")?.fix).toEqual([{ op: "remove", path: "/layout/facet" }]);
    const field = validate({
      version: "1",
      type: "line",
      data: [{ month: "Jan", value: 1 }],
      encoding: { x: "month", y: "value" },
      layout: { facet: { field: "nope" } },
      a11y: { alt },
    });
    expect(field.warnings.find((item) => item.code === "CK3041")?.fix?.[0]).toMatchObject({ op: "replace", value: "month" });
    const columns = validate(facetSpec({ layout: { facet: { field: "city", columns: 20 } } }));
    expect(columns.warnings.find((item) => item.code === "CK3042")?.fix?.[0]).toMatchObject({ op: "replace", value: 12 });
    const rows = validate(facetSpec({ layout: { facet: { field: "city", rows: 0 } } }));
    expect(rows.warnings.find((item) => item.code === "CK3043")?.fix?.[0]).toMatchObject({ op: "replace", value: 1 });
    const empty = validate({ version: "1", type: "line", data: [{ month: "Jan", value: 1 }], encoding: { x: "month", y: "value" }, layout: { concat: { direction: "horizontal" } }, a11y: { alt } });
    expect(empty.warnings.find((item) => item.code === "CK3044")?.fix).toEqual([{ op: "remove", path: "/layout/concat" }]);
    const view = validate({
      version: "1",
      type: "line",
      data: [{ month: "Jan", value: 1 }],
      encoding: { x: "month", y: "value" },
      layout: { concat: { views: [{ title: "Bare" }] } },
      a11y: { alt },
    });
    expect(view.warnings.find((item) => item.code === "CK3045")?.fix?.[0]?.op).toBe("remove");
    const width = validate({
      version: "1",
      type: "line",
      data: [{ month: "Jan", value: 1 }],
      encoding: { x: "month", y: "value" },
      layout: { breakpoints: [{ maxWidth: 0, legend: false }] },
      a11y: { alt },
    });
    expect(width.warnings.find((item) => item.code === "CK3046")?.fix?.[0]?.op).toBe("remove");
    const bare = validate({
      version: "1",
      type: "line",
      data: [{ month: "Jan", value: 1 }],
      encoding: { x: "month", y: "value" },
      layout: { breakpoints: [{ maxWidth: 400, columns: 1 }] },
      a11y: { alt },
    });
    expect(bare.warnings.find((item) => item.code === "CK3047")?.path).toBe("/layout/breakpoints/0/columns");
    const both = validate(facetSpec({ layout: { facet: { field: "city" }, concat: { views: [{ type: "line" }] } } }));
    expect(both.warnings.find((item) => item.code === "CK3048")?.fix).toEqual([{ op: "remove", path: "/layout/concat" }]);
  });
});
