import { describe, expect, it } from "vitest";
import { equalEarth, equirectangular, fitProject, mercator } from "../project";
import { render } from "../render";
import { validate } from "../validate";

function codes(spec: unknown): string[] {
  return validate(spec).diagnostics.map((item) => item.code);
}

function meanY(svg: string, name: string): number {
  const match = new RegExp(`<path\\b[^>]*\\bd="([^"]+)"[^>]*data-ck-name="${name}"`).exec(svg);
  const d = match?.[1] ?? "";
  const ys = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((item) => Number(item[0])).filter((_, index) => index % 2 === 1);
  return ys.reduce((sum, value) => sum + value, 0) / Math.max(1, ys.length);
}

const world = {
  version: "1",
  type: "choropleth" as const,
  title: "Renewable share",
  theme: "soft",
  data: [
    { country: "Norway", share: 98 },
    { country: "France", share: 26 },
    { country: "USA", share: 23 },
    { country: "United States", share: 23 },
    { country: "UK", share: 46 },
  ],
  encoding: { region: "country", color: "share" },
  mark: { atlas: "world", scale: "sequential" as const },
  a11y: { alt: "Norway is darker than France." },
  size: { width: 640, height: 360 },
};

describe("projections", () => {
  it("keeps the origin and the east on equirectangular, Mercator, and Equal Earth", () => {
    expect(equirectangular(0, 0)).toEqual([0, 0]);
    expect(mercator(0, 0)[0]).toBeCloseTo(0);
    expect(mercator(0, 0)[1]).toBeCloseTo(0);
    expect(Math.abs(mercator(0, 89)[1])).toBeLessThan(10);
    const origin = equalEarth(0, 0);
    expect(origin[0]).toBeCloseTo(0);
    expect(origin[1]).toBeCloseTo(0);
    expect(equalEarth(40, 0)[0]).toBeGreaterThan(0);
    expect(equalEarth(0, 50)[1]).toBeGreaterThan(0);
  });

  it("fits a span inside the box with north up", () => {
    const project = fitProject(equirectangular, [[-10, -10], [10, 10]], { x: 0, y: 0, w: 100, h: 80 }, 0);
    const west = project(-10, 0);
    const east = project(10, 0);
    const north = project(0, 10);
    const south = project(0, -10);
    expect(west[0]).toBeLessThan(east[0]);
    expect(north[1]).toBeLessThan(south[1]);
    expect(west[0]).toBeGreaterThanOrEqual(-0.1);
    expect(east[0]).toBeLessThanOrEqual(100.1);
  });
});

describe("validate", () => {
  it("matches ISO codes, names, and aliases", () => {
    expect(codes(world)).not.toContain("CK3051");
    const states = validate({
      type: "choropleth",
      mark: { atlas: "us" },
      encoding: { region: "id", color: "n" },
      data: [
        { id: "Washington", n: 1 },
        { id: "Washington DC", n: 2 },
      ],
    });
    expect(states.warnings.filter((item) => item.code === "CK3051")).toEqual([]);
  });

  it("warns on an unknown atlas, an unknown region, a missing value, and a missing region field", () => {
    const atlas = validate({ type: "choropleth", mark: { atlas: "usa" }, encoding: { region: "country", color: "share" }, data: [] });
    expect(atlas.warnings.map((item) => item.code)).toContain("CK3050");
    expect(atlas.warnings[0]?.fix?.[0]).toMatchObject({ path: "/mark/atlas", value: "us" });

    const region = validate({
      type: "choropleth",
      mark: { atlas: "world" },
      encoding: { region: "country", color: "share" },
      data: [{ country: "Unted States", share: 23 }, { country: "Wakanda", share: 1 }],
    });
    const unknown = region.warnings.filter((item) => item.code === "CK3051");
    expect(unknown).toHaveLength(2);
    const near = unknown.find((item) => item.message.includes("Unted States"));
    expect(near?.fix?.[0]).toMatchObject({ value: "USA" });
    expect(near?.message).toContain("United States");
    const far = unknown.find((item) => item.message.includes("Wakanda"));
    expect(far?.fix).toBeUndefined();
    expect(far?.hint).toMatch(/Nearest/);

    const value = validate({
      type: "choropleth",
      mark: { atlas: "us" },
      encoding: { region: "state" },
      data: [{ state: "CA", share: 4 }],
    });
    expect(value.warnings.map((item) => item.code)).toContain("CK3054");
    expect(value.warnings.find((item) => item.code === "CK3054")?.fix?.[0]).toMatchObject({ path: "/encoding/color", value: "share" });

    const missingRegion = validate({
      type: "choropleth",
      mark: { atlas: "us" },
      encoding: { color: "share" },
      data: [{ state: "CA", share: 4 }],
    });
    expect(missingRegion.warnings.map((item) => item.code)).toContain("CK3056");
  });

  it("detects swapped coordinates and out-of-range coordinates separately", () => {
    const swapped = validate({
      type: "map-points",
      mark: { atlas: "world" },
      encoding: { latitude: "lat", longitude: "lon" },
      data: [
        { lat: 139.7, lon: 35.7 },
        { lat: -74.0, lon: 40.7 },
        { lat: 151.2, lon: -33.9 },
      ],
    });
    expect(swapped.warnings.map((item) => item.code)).toEqual(["CK3053"]);
    expect(swapped.warnings[0]?.fix).toEqual([
      { op: "replace", path: "/encoding/latitude", value: "lon" },
      { op: "replace", path: "/encoding/longitude", value: "lat" },
    ]);

    const range = validate({
      type: "map-points",
      mark: { atlas: "world" },
      encoding: { latitude: "lat", longitude: "lon" },
      data: [{ lat: 95, lon: 10 }],
    });
    expect(range.warnings.map((item) => item.code)).toEqual(["CK3052"]);
    expect(range.warnings[0]?.fix?.[0]).toMatchObject({ value: 90 });

    const missing = validate({ type: "map-points", mark: { atlas: "world" }, data: [{ lat: 1, lon: 2 }] });
    expect(missing.warnings.map((item) => item.code)).toContain("CK3055");
  });
});

describe("render", () => {
  it("draws a world choropleth with a legend, alias hits, and a no-data country", async () => {
    const svg = await render(world);
    expect(svg).toContain('data-ck-type="choropleth"');
    expect(svg).toContain('data-ck-name="Norway"');
    expect(svg).toContain('data-ck-name="France"');
    expect(svg).toContain('data-ck-name="United States of America"');
    expect(svg).toContain('data-ck-name="United Kingdom"');
    expect(svg).toContain("linearGradient");
    expect(svg).toContain('tabindex="0"');
    expect(svg).toContain("<title>Norway, 98</title>");
    expect(svg).not.toContain("window");
    expect(svg).not.toContain("document");
    const norway = svg.match(/data-ck-name="Norway"[^>]*fill="(#[0-9a-f]{6})"/)?.[1] ?? svg.match(/fill="(#[0-9a-f]{6})"[^>]*data-ck-name="Norway"/)?.[1];
    const france = svg.match(/fill="(#[0-9a-f]{6})"[^>]*data-ck-name="France"/)?.[1];
    expect(norway).toBeTruthy();
    expect(france).toBeTruthy();
    expect(norway).not.toBe(france);
    expect(svg).toMatch(/data-ck-name="Antarctica"[^>]*class="ck-geo-region ck-geo-nodata"|class="ck-geo-region ck-geo-nodata"[^>]*data-ck-name="Antarctica"/);
  });

  it("uses a diverging scale and puts Alaska and Hawaii in the lower insets", async () => {
    const svg = await render({
      type: "choropleth",
      title: "Population change",
      theme: "midnight",
      data: [
        { state: "California", change: -0.8 },
        { state: "Texas", change: 4.3 },
        { state: "Alaska", change: 0.1 },
        { state: "Hawaii", change: 0.2 },
        { state: "New York", change: -1.5 },
      ],
      encoding: { region: "state", color: "change" },
      mark: { atlas: "us", scale: "diverging" },
      a11y: { alt: "Texas grew and New York shrank." },
      size: { width: 720, height: 460 },
    });
    expect(svg).toContain("color-scheme:dark");
    expect(svg).not.toContain("light-dark");
    expect(svg).toContain("#ffffff");
    expect(meanY(svg, "Alaska")).toBeGreaterThan(meanY(svg, "California"));
    expect(meanY(svg, "Hawaii")).toBeGreaterThan(meanY(svg, "Texas"));
    const texas = /fill="(#[0-9a-f]{6})"[^>]*data-ck-name="Texas"/.exec(svg)?.[1] ?? "";
    const york = /fill="(#[0-9a-f]{6})"[^>]*data-ck-name="New York"/.exec(svg)?.[1] ?? "";
    expect(texas.startsWith("#")).toBe(true);
    expect(york.startsWith("#")).toBe(true);
    expect(texas).not.toBe(york);
  });

  it("draws bubbles, labels the largest, and accepts Canada and the EU", async () => {
    const svg = await render({
      type: "map-points",
      title: "Cities",
      theme: "soft",
      data: [
        { name: "Tokyo", lat: 35.7, lon: 139.7, pop: 37 },
        { name: "Delhi", lat: 28.6, lon: 77.2, pop: 33 },
        { name: "Shanghai", lat: 31.2, lon: 121.5, pop: 29 },
        { name: "Lagos", lat: 6.5, lon: 3.4, pop: 16 },
        { name: "London", lat: 51.5, lon: -0.1, pop: 9 },
        { name: "Sydney", lat: -33.9, lon: 151.2, pop: 5 },
      ],
      encoding: { latitude: "lat", longitude: "lon", size: "pop", color: "pop", label: "name" },
      mark: { atlas: "world", labelCount: 3 },
      a11y: { alt: "Tokyo is the largest bubble." },
      size: { width: 640, height: 360 },
    });
    expect(svg).toContain('data-ck-type="map-points"');
    expect(svg).toContain("<circle");
    expect(svg).toContain(">Tokyo<");
    expect(svg).toContain(">Delhi<");
    expect(svg).not.toContain(">Sydney<");
    expect(svg).toContain("light-dark");

    const canada = await render({
      type: "choropleth",
      data: [{ id: "Québec", value: 8 }, { id: "YT", value: 1 }],
      encoding: { region: "id", color: "value" },
      mark: { atlas: "canada", scale: "threshold", thresholds: [3] },
      a11y: { alt: "Quebec is higher." },
    });
    expect(canada).toContain('data-ck-name="Quebec"');
    expect(canada).toContain('data-ck-name="Yukon"');
    expect(canada).toContain('data-ck-value="8"');

    const eu = await render({
      type: "choropleth",
      data: [{ id: "France", value: 4 }, { id: "Malta", value: 1 }],
      encoding: { region: "id", color: "value" },
      mark: { atlas: "eu" },
      a11y: { alt: "France is in the EU atlas. Malta is not in the 110m extract." },
    });
    expect(eu).toContain('data-ck-name="France"');
    expect(eu).not.toContain('data-ck-name="Malta"');
    expect(codes({ type: "choropleth", mark: { atlas: "eu" }, encoding: { region: "id", color: "value" }, data: [{ id: "Malta", value: 1 }] })).toContain("CK3051");
  });

  it("draws caller GeoJSON without an atlas", async () => {
    const svg = await render({
      type: "choropleth",
      data: [{ id: "A", value: 2 }],
      encoding: { region: "id", color: "value" },
      mark: {
        geojson: {
          type: "FeatureCollection",
          features: [
            { type: "Feature", properties: { name: "Alpha" }, geometry: { type: "Polygon", coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]] } },
            { type: "Feature", id: "B", properties: { name: "Beta" }, geometry: { type: "Polygon", coordinates: [[[20, 0], [30, 0], [30, 10], [20, 10], [20, 0]]] } },
          ],
        },
      },
      a11y: { alt: "Alpha has a value and Beta does not." },
    });
    expect(svg).toContain('data-ck-name="Alpha"');
    expect(svg).toContain('data-ck-name="Beta"');
    expect(svg).toContain("ck-geo-nodata");
    expect(codes({ type: "choropleth", encoding: { region: "id", color: "value" }, data: [{ id: "Nope", value: 1 }], mark: { geojson: { type: "FeatureCollection", features: [{ type: "Feature", id: "A", properties: { name: "Alpha" }, geometry: { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] } }] } } })).toContain("CK3051");
  });
});
