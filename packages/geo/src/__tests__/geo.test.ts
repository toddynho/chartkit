import { describe, expect, it } from "vitest";
import { equalEarth, equirectangular, fitProject, mercator } from "../project";
import { render } from "../render";
import { chromeFor } from "../theme";
import { validate } from "../validate";

function codes(spec: unknown): string[] {
  return validate(spec).diagnostics.map((item) => item.code);
}

function pathOf(svg: string, name: string): string {
  return new RegExp(`<path\\b[^>]*\\bd="([^"]+)"[^>]*data-ck-name="${name}"`).exec(svg)?.[1] ?? "";
}

function meanY(svg: string, name: string): number {
  const ys = [...pathOf(svg, name).matchAll(/-?\d+(?:\.\d+)?/g)].map((item) => Number(item[0])).filter((_, index) => index % 2 === 1);
  return ys.reduce((sum, value) => sum + value, 0) / Math.max(1, ys.length);
}

function spanX(svg: string, name: string): number {
  const xs = [...pathOf(svg, name).matchAll(/-?\d+(?:\.\d+)?/g)].map((item) => Number(item[0])).filter((_, index) => index % 2 === 0);
  return Math.max(...xs) - Math.min(...xs);
}

/** Rule body for an exact selector. A fill here beats every fill attribute on that class. */
function styleRule(svg: string, selector: string): string {
  const style = /<style>([^<]*)<\/style>/.exec(svg)?.[1] ?? "";
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`${escaped}\\{([^}]*)\\}`).exec(style)?.[1] ?? "";
}

/** Scale colours on regions that have a value. Skips the no-data hatch. */
function paintedRegionFills(svg: string): string[] {
  const fills: string[] = [];
  for (const match of svg.matchAll(/<(?:path|circle)\b([^>]*)>/g)) {
    const attrs = match[1] ?? "";
    if (!/\bclass="[^"]*\bck-geo-region\b/.test(attrs) || /\bck-geo-nodata\b/.test(attrs)) continue;
    const fill = /\bfill="(#[0-9a-fA-F]{6})"/.exec(attrs)?.[1];
    if (fill) fills.push(fill.toLowerCase());
  }
  return fills;
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
    const atlasHint = atlas.warnings.find((item) => item.code === "CK3050")?.hint ?? "";
    for (const name of ["world", "us", "canada", "eu"]) expect(atlasHint).toContain(name);

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
    expect(missing.warnings.find((item) => item.code === "CK3055")?.hint).toBe(
      "Set encoding.latitude to lat and encoding.longitude to lon.",
    );
  });

  it("treats a top-level atlas as mark.atlas and accepts location, lat, and lon", () => {
    const atlas = validate({
      type: "choropleth",
      atlas: "us",
      encoding: { location: "id", color: "n" },
      data: [{ id: "California", n: 1 }],
    });
    expect(atlas.warnings.map((item) => item.code)).not.toContain("CK3050");
    expect(atlas.warnings.map((item) => item.code)).not.toContain("CK3056");
    expect(atlas.warnings.map((item) => item.code)).not.toContain("CK3051");

    const typo = validate({ type: "choropleth", atlas: "usa", encoding: { region: "id", color: "n" }, data: [] });
    expect(typo.warnings.find((item) => item.code === "CK3050")?.message).toContain("usa");

    const cities = validate({
      type: "bubble-map",
      encoding: { latitude: "lat", longitude: "lon" },
      data: [
        { city: "Chicago", lat: 41.88, lon: -87.63 },
        { city: "Houston", lat: 29.76, lon: -95.37 },
      ],
    });
    expect(cities.warnings.find((item) => item.code === "CK3050")?.fix?.[0]?.value).toEqual({ atlas: "us" });

    const aliased = validate({
      type: "bubble map",
      mark: { atlas: "us" },
      encoding: { lat: "lat", lon: "lon" },
      data: [{ lat: 41.88, lon: -87.63 }],
    });
    expect(aliased.warnings.map((item) => item.code)).not.toContain("CK3050");
    expect(aliased.warnings.map((item) => item.code)).not.toContain("CK3055");

    const states = validate({
      type: "choropleth",
      encoding: { region: "state", color: "n" },
      data: [
        { state: "California", n: 1 },
        { state: "Texas", n: 2 },
      ],
    });
    const stateFix = states.warnings.find((item) => item.code === "CK3050")?.fix?.[0]?.value;
    expect(stateFix === "us" || (stateFix && typeof stateFix === "object" && stateFix.atlas === "us")).toBe(true);

    const points = validate({
      type: "map-points",
      atlas: "world",
      encoding: { lat: "lat", lon: "lon" },
      data: [
        { lat: 139.7, lon: 35.7 },
        { lat: -74.0, lon: 40.7 },
        { lat: 151.2, lon: -33.9 },
      ],
    });
    expect(points.warnings.map((item) => item.code)).toEqual(["CK3053"]);
    expect(points.warnings[0]?.fix).toEqual([
      { op: "replace", path: "/encoding/lat", value: "lon" },
      { op: "replace", path: "/encoding/lon", value: "lat" },
    ]);
  });
});

describe("render", () => {
  it("draws a horizontal legend when legend.position is bottom", async () => {
    const svg = await render({ ...world, legend: { position: "bottom" } });
    expect(svg).toContain('x2="1" y2="0"');
    expect(svg).not.toContain('x2="0" y2="0"');
    expect(svg).toContain('data-ck-legend="bottom"');
  });

  it("draws the bubble legend inside the frame when a point map legend sits at the bottom", async () => {
    const svg = await render({
      type: "map-points",
      title: "Cities",
      data: [
        { name: "Tokyo", lat: 35.7, lon: 139.7, pop: 37 },
        { name: "London", lat: 51.5, lon: -0.1, pop: 9 },
        { name: "Sydney", lat: -33.9, lon: 151.2, pop: 5 },
      ],
      encoding: {
        latitude: "lat",
        longitude: "lon",
        label: "name",
        size: { field: "pop", format: { suffix: " million" }, title: "Population" },
        color: "pop",
      },
      legend: { position: "bottom" },
      size: { width: 880, height: 520 },
      a11y: { alt: "Cities sized by population." },
    });
    const legend = svg.slice(svg.indexOf('data-ck-legend="bottom"'));
    expect(legend.startsWith('data-ck-legend="bottom"')).toBe(true);
    expect(legend).toContain(">Population<");
    expect(legend).toMatch(/>\d+ million</);
    expect(legend).toContain("<circle");
    const height = 520;
    const width = 880;
    for (const match of legend.matchAll(/\b(cx|cy|x|y)="(-?\d+(?:\.\d+)?)"/g)) {
      const axis = match[1];
      const value = Number(match[2]);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(axis === "cy" || axis === "y" ? height : width);
    }
  });

  it("omits hover titles when tooltip is off", async () => {
    const svg = await render({ ...world, tooltip: false });
    expect(svg).toContain('data-ck-tooltip="off"');
    expect(svg).not.toContain("<title>Norway");
    expect(svg).toContain('aria-label="Norway, 98"');
  });

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
    expect(svg).toContain(">No data<");
    expect(svg).toContain("patternUnits");
  });

  it("keeps a long title inside the viewBox and labels a percent legend with nice ticks", async () => {
    const svg = await render({
      ...world,
      title: "Renewable share of electricity",
      data: [
        { country: "Norway", share: 100 },
        { country: "Algeria", share: 1 },
      ],
      encoding: { region: "country", color: { field: "share", format: "%", title: "Share" } },
      size: { width: 880, height: 520 },
    });
    expect(svg).toContain(">Renewable share of electricity<");
    expect(svg).toContain('font-size="16"');
    expect(svg).toContain(">Share<");
    for (const tick of ["0%", "25%", "50%", "75%", "100%"]) expect(svg).toContain(`>${tick}<`);
    const narrow = await render({
      ...world,
      title: "Renewable share of electricity",
      size: { width: 180, height: 140 },
    });
    expect(narrow).toContain(">Renewable share of electricity<");
    expect(narrow).not.toContain('font-size="16"');
  });

  it("keeps a legend title clear of the top tick", async () => {
    const svg = await render({
      type: "choropleth",
      title: "Population change, 2020–2023",
      theme: "midnight",
      data: [
        { id: "NY", change: -2.1 },
        { id: "TX", change: 4.3 },
        { id: "ID", change: 6.2 },
        { id: "FL", change: 4.7 },
        { id: "CA", change: -0.5 },
      ],
      encoding: { region: "id", color: { field: "change", format: "%", title: "Change" } },
      mark: { atlas: "us", projection: "albersUsa", scale: "diverging" },
      size: { width: 880, height: 560 },
      a11y: { alt: "Idaho grew and New York shrank." },
    });
    const texts = [...svg.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)].map((match) => ({
      y: Number(/\by="([^"]+)"/.exec(match[1] ?? "")?.[1]),
      value: match[2] ?? "",
    }));
    const title = texts.find((item) => item.value === "Change");
    const ticks = texts.filter((item) => item.value.endsWith("%"));
    expect(title).toBeTruthy();
    expect(ticks.length).toBeGreaterThan(1);
    const top = Math.min(...ticks.map((item) => item.y));
    expect(top).toBeGreaterThan((title?.y ?? 0) + 16);
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
    expect(spanX(svg, "Hawaii")).toBeGreaterThan(spanX(svg, "California") * 0.35);
    expect(svg).toContain("ck-geo-inset");
    const texas = /fill="(#[0-9a-f]{6})"[^>]*data-ck-name="Texas"/.exec(svg)?.[1] ?? "";
    const york = /fill="(#[0-9a-f]{6})"[^>]*data-ck-name="New York"/.exec(svg)?.[1] ?? "";
    expect(texas.startsWith("#")).toBe(true);
    expect(york.startsWith("#")).toBe(true);
    expect(texas).not.toBe(york);
  });

  it("uses a top-level atlas and location, lat, and lon aliases", async () => {
    const states = await render({
      type: "choropleth",
      atlas: "us",
      data: [{ id: "California", value: 4 }, { id: "Texas", value: 8 }],
      encoding: { location: "id", color: "value" },
      a11y: { alt: "Texas is higher than California." },
    });
    expect(states).toContain('data-ck-name="California"');
    expect(states).toContain('data-ck-name="Texas"');
    expect(states).toContain('data-ck-value="8"');
    expect(states).not.toContain('data-ck-name="France"');

    const cities = await render({
      type: "map-points",
      atlas: "world",
      data: [{ name: "Paris", lat: 48.9, lon: 2.3 }],
      encoding: { lat: "lat", lon: "lon", label: "name" },
      a11y: { alt: "Paris is marked." },
    });
    expect(cities).toContain("<circle");
    expect(cities).toContain(">Paris<");
    expect(cities).not.toContain("Unknown atlas");

    const tipped = await render({
      type: "map-points",
      atlas: "us",
      data: [{ name: "Chicago", lat: 41.88, lon: -87.63, pop: 2700000 }],
      encoding: { latitude: "lat", longitude: "lon", label: "name", tooltip: "pop" },
      a11y: { alt: "Chicago is marked." },
    });
    expect(tipped).toContain("<title>Chicago, pop 2700000</title>");
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
      encoding: {
        latitude: "lat",
        longitude: "lon",
        size: { field: "pop", format: { suffix: " million" }, title: "Population" },
        color: "pop",
        label: "name",
      },
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
    expect(svg).toContain("ck-geo-tag");
    expect(svg).toContain("million");
    expect(svg).not.toContain("linearGradient");
    expect(svg).not.toContain("ck-geo-nodata");
    expect(svg).toContain("fill:light-dark(#f5f5f7, #2c2c2e)");
    const mapEnd = svg.indexOf("</g>");
    expect(svg.lastIndexOf("<circle", mapEnd)).toBeLessThan(svg.indexOf(">Tokyo<"));

    const crowded = await render({
      type: "map-points",
      title: "Cities",
      data: [
        { name: "Tokyo", lat: 35.7, lon: 139.7, pop: 37 },
        { name: "Delhi", lat: 28.6, lon: 77.2, pop: 33 },
        { name: "Shanghai", lat: 31.2, lon: 121.5, pop: 29 },
        { name: "Cairo", lat: 30.0, lon: 31.2, pop: 22 },
        { name: "Mexico City", lat: 19.4, lon: -99.1, pop: 22 },
        { name: "New York", lat: 40.7, lon: -74.0, pop: 19 },
        { name: "Lagos", lat: 6.5, lon: 3.4, pop: 16 },
        { name: "Buenos Aires", lat: -34.6, lon: -58.4, pop: 15 },
      ],
      encoding: { latitude: "lat", longitude: "lon", size: "pop", color: "pop", label: "name" },
      mark: { atlas: "world", labelCount: 8 },
      a11y: { alt: "The largest cities are labelled." },
      size: { width: 880, height: 520 },
    });
    for (const name of ["Tokyo", "Delhi", "Cairo", "New York", "Lagos", "Buenos Aires"]) expect(crowded).toContain(`>${name}<`);
    const groupEnd = crowded.indexOf("</g>");
    expect(crowded.lastIndexOf("<circle", groupEnd)).toBeLessThan(crowded.indexOf(">Tokyo<"));
    expect(crowded).not.toContain("ck-geo-nodata");

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
      a11y: { alt: "France is in the EU atlas. Malta is a point." },
    });
    expect(eu).toContain('data-ck-name="France"');
    expect(eu).toContain('data-ck-name="Malta"');
    expect(eu).toContain("<circle");
    expect(codes({ type: "choropleth", mark: { atlas: "eu" }, encoding: { region: "id", color: "value" }, data: [{ id: "Malta", value: 1 }] })).not.toContain("CK3051");
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

  it("keeps scale fills on choropleth regions and land fill on points maps", async () => {
    const softLand = chromeFor("soft").land;
    const midnightLand = chromeFor("midnight").land;
    expect(softLand).toBe("light-dark(#f5f5f7, #2c2c2e)");
    expect(midnightLand).toBe("#3e5264");
    expect(chromeFor("midnight").water).toBe("#0c0c0c");

    const countries = ["NOR", "FRA", "USA", "GBR", "DEU", "BRA", "IND", "CHN", "EGY", "AUS", "ZAF", "JPN"];
    const worldSvg = await render({
      type: "choropleth",
      theme: "soft",
      data: countries.map((id, index) => ({ id, value: index * 8 })),
      encoding: { region: "id", color: "value" },
      mark: { atlas: "world" },
      a11y: { alt: "Twelve countries take distinct colours from the scale." },
    });
    const worldFills = new Set(paintedRegionFills(worldSvg));
    expect(worldFills.size).toBeGreaterThanOrEqual(8);
    expect(styleRule(worldSvg, ".ck-geo-region")).not.toMatch(/(?:^|;)fill:/);
    expect(worldSvg).toContain("ck-geo-nodata");
    for (const fill of worldFills) expect(softLand).not.toContain(fill);

    const states = ["CA", "TX", "NY", "FL", "IL", "WA", "AK", "HI", "OH", "GA", "AZ", "CO"];
    const usSvg = await render({
      type: "choropleth",
      theme: "midnight",
      data: states.map((id, index) => ({ id, value: index - 5 })),
      encoding: { region: "id", color: "value" },
      mark: { atlas: "us", scale: "diverging" },
      a11y: { alt: "Twelve states take distinct colours from the scale." },
    });
    const usFills = new Set(paintedRegionFills(usSvg));
    expect(usFills.size).toBeGreaterThanOrEqual(8);
    expect(styleRule(usSvg, ".ck-geo-region")).not.toMatch(/(?:^|;)fill:/);
    expect(usSvg).toContain("ck-geo-nodata");
    for (const fill of usFills) expect(fill).not.toBe(midnightLand);

    const points = await render({
      type: "map-points",
      theme: "midnight",
      data: [{ name: "Tokyo", lat: 35.7, lon: 139.7, pop: 37 }],
      encoding: { latitude: "lat", longitude: "lon", size: "pop", label: "name" },
      mark: { atlas: "world" },
      a11y: { alt: "Tokyo sits on cool slate land." },
    });
    expect(styleRule(points, ".ck-geo-region")).toContain(`fill:${midnightLand}`);
    expect(points).not.toContain("ck-geo-nodata");

    const layered = await render({
      type: "choropleth",
      data: [
        { id: "France", value: 8 },
        { id: "Germany", value: 3 },
        { id: "Spain", value: 1 },
        { name: "Paris", lat: 48.9, lon: 2.3, pop: 11 },
      ],
      encoding: { region: "id", color: "value", latitude: "lat", longitude: "lon", size: "pop", label: "name" },
      mark: { atlas: "eu", labelCount: 1 },
      a11y: { alt: "France is coloured and Paris is a bubble." },
    });
    expect(styleRule(layered, ".ck-geo-region")).not.toMatch(/(?:^|;)fill:/);
    expect(new Set(paintedRegionFills(layered)).size).toBeGreaterThanOrEqual(3);
    expect(layered).toContain('class="ck-geo-point"');
    expect(layered).toContain(">Paris<");
    expect(layered).toContain("ck-geo-nodata");
  });

  it("fills named countries, formats a compact legend, and skips islands without data", async () => {
    const svg = await render({
      type: "choropleth",
      theme: "soft",
      data: [
        { country: "JPN", sessions: 6200 },
        { country: "PRT", sessions: 4100 },
        { country: "CHL", sessions: 2800 },
        { country: "KEN", sessions: 1900 },
        { country: "CAN", sessions: 1600 },
      ],
      encoding: { region: "country", color: { field: "sessions", title: "Sessions", format: "compact" } },
      mark: { atlas: "world", projection: "equalEarth", scale: "sequential" },
      a11y: { alt: "Japan, Portugal, Chile, Kenya, and Canada are filled." },
    });
    expect(svg).not.toContain("compact");
    expect(svg).toContain("6.2K");
    expect(svg).toContain("1.6K");
    expect(styleRule(svg, ".ck-geo-region")).not.toMatch(/(?:^|;)fill:/);
    for (const name of ["Japan", "Portugal", "Chile", "Kenya", "Canada"]) {
      const tag = new RegExp(`<(?:path|circle)\\b[^>]*data-ck-name="${name}"[^>]*>`).exec(svg)?.[0] ?? "";
      expect(tag).toMatch(/fill="#[0-9a-fA-F]{6}"/);
      expect(tag).not.toContain("ck-geo-nodata");
    }
    expect(svg).not.toMatch(/<circle\b[^>]*ck-geo-nodata|ck-geo-nodata[^>]*<circle/);
    expect(svg).not.toMatch(/<circle\b[^>]*class="ck-geo-region ck-geo-nodata"/);
    expect(svg).toContain("#006d2c");
  });

  it("paints a sequential ramp from encoding.color.range and keeps the green default otherwise", async () => {
    const blue = await render({
      type: "choropleth",
      theme: "soft",
      data: [
        { country: "JPN", sessions: 6200 },
        { country: "CAN", sessions: 1600 },
      ],
      encoding: { region: "country", color: { field: "sessions", title: "Sessions", format: "compact", range: ["#e8f0fe", "#1a73e8"] } },
      mark: { atlas: "world", projection: "equalEarth", scale: "sequential" },
      a11y: { alt: "Japan is the darker blue." },
    });
    expect(blue).toContain("#1a73e8");
    expect(blue).not.toContain("#006d2c");
    expect(blue).not.toContain("#edf8e9");
    const ignored = await render({
      type: "choropleth",
      data: [{ country: "JPN", sessions: 6200 }, { country: "CAN", sessions: 1600 }],
      encoding: { region: "country", color: { field: "sessions", range: ["navy"] } },
      mark: { atlas: "world", scale: "sequential" },
      a11y: { alt: "A one-stop range stays on the green ramp." },
    });
    expect(ignored).toContain("#006d2c");
  });

  it("fills missing countries with mark.land when nodata is fill", async () => {
    const svg = await render({
      type: "choropleth",
      theme: "soft",
      data: [
        { country: "JPN", sessions: 6200 },
        { country: "USA", sessions: 4100 },
      ],
      encoding: { region: "country", color: { field: "sessions", range: ["#aecbfa", "#1a73e8"] } },
      mark: { atlas: "world", projection: "equalEarth", scale: "sequential", nodata: "fill", land: "#e8eaed", water: "#ffffff" },
      a11y: { alt: "Japan and the United States are filled. Other countries are plain grey." },
    });
    expect(svg).toContain(".ck-geo-nodata{fill:#e8eaed}");
    expect(svg).toContain(".ck-geo-water{fill:#ffffff}");
    expect(svg).not.toContain("pattern");
    expect(svg).not.toContain("#006d2c");
    expect(styleRule(svg, ".ck-geo-region")).not.toMatch(/(?:^|;)fill:/);
    expect(svg).toContain("#1a73e8");
  });

  it("honors preset families, inherit, and theme.tokens.fontSize", async () => {
    const mustard = await render({ ...world, theme: { preset: "mustard" } });
    expect(mustard).toContain("--ck-font-family:Geist, ui-sans-serif, system-ui, sans-serif");
    expect(mustard).toContain('data-ck-theme="mustard"');
    expect(mustard).toContain(".ck-geo-label{font-size:11px}");
    const named = await render({ ...world, theme: "mustard" });
    expect(named).toContain("--ck-font-family:Geist, ui-sans-serif, system-ui, sans-serif");
    const tape = await render({ ...world, theme: "tape" });
    expect(tape).toContain("--ck-font-family:'Geist Mono', ui-monospace, monospace");
    const kite = await render({ ...world, theme: { preset: "kite", tokens: { fontFamily: "Georgia, serif" } } });
    expect(kite).toContain("--ck-font-family:Georgia, serif");
    expect(kite).not.toContain("Nunito");
    const kept = await render({ ...world, theme: { preset: "mustard", tokens: { fontFamily: "x".repeat(81) } } });
    expect(kept).toContain("Geist, ui-sans-serif");
    const cleared = await render({ ...world, theme: { preset: "mustard", tokens: { fontFamily: "inherit" } } });
    expect(cleared).not.toContain("Geist");
    expect(cleared).not.toContain("--ck-font-family:");
    expect(cleared).toContain("font-family:var(--ck-font-family, inherit)");
    const night = await render({ ...world, theme: { preset: "mustard", mode: "dark" } });
    expect(night).not.toContain("Geist");
    const big = await render({ ...world, theme: { tokens: { fontSize: 22 } } });
    expect(big).toContain(".ck-geo-label{font-size:22px}");
    expect(big).toMatch(/\.ck-geo-tag\{[^}]*font-size:22px/);
    expect(big).toMatch(/\.ck-geo-muted\{[^}]*font-size:22px/);
    expect(big).toContain('font-size="32"');
    const base = await render(world);
    expect(base).toContain(".ck-geo-label{font-size:11px}");
    expect(base).toContain('font-size="16"');
    expect(base).not.toContain("--ck-font-family:");
  });

  it("keeps a near-zero country visible on white and stroked in both themes", async () => {
    const spec = {
      type: "choropleth",
      title: "Renewable share",
      data: [
        { country: "NOR", share: 98 },
        { country: "DZA", share: 1 },
        { country: "SAU", share: 1 },
        { country: "BGD", share: 2 },
      ],
      encoding: { region: "country", color: { field: "share", format: "%" } },
      mark: { atlas: "world", projection: "equalEarth", scale: "sequential" },
      a11y: { alt: "Algeria and Saudi Arabia are near zero." },
    };
    const light = await render({ ...spec, theme: "soft" });
    const dark = await render({ ...spec, theme: "midnight" });
    const tag = (svg: string) => new RegExp(`<path\\b[^>]*data-ck-id="DZA"[^>]*>`).exec(svg)?.[0] ?? "";
    const fillOf = (attrs: string) => /fill="(#[0-9a-fA-F]{6})"/.exec(attrs)?.[1] ?? "";
    const rgb = (hex: string): [number, number, number] => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16)) as [number, number, number];
    const lum = (color: [number, number, number]) => {
      const f = (channel: number) => {
        const s = channel / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(color[0]) + 0.7152 * f(color[1]) + 0.0722 * f(color[2]);
    };
    const contrast = (a: [number, number, number], b: [number, number, number]) => {
      const left = lum(a);
      const right = lum(b);
      return (Math.max(left, right) + 0.05) / (Math.min(left, right) + 0.05);
    };
    const lightTag = tag(light);
    const darkTag = tag(dark);
    expect(lightTag).toMatch(/stroke="light-dark\(#8e8e93, #636366\)"/);
    expect(darkTag).toMatch(/stroke="#[0-9a-fA-F]{6}"/);
    expect(lightTag).not.toContain("ck-geo-nodata");
    const low = fillOf(lightTag);
    expect(contrast(rgb(low), [255, 255, 255])).toBeGreaterThan(3);
    expect(contrast(rgb(fillOf(darkTag)), [0x0c, 0x0c, 0x0c])).toBeGreaterThan(3);
  });
});
