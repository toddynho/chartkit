/** Approximate figures for the maps pages. Not a statistical release. */

export const renewable: [string, number][] = [
  ["ISL", 100], ["NOR", 98], ["PRY", 100], ["CRI", 98], ["ETH", 98], ["COD", 99], ["NPL", 100],
  ["URY", 90], ["KEN", 90], ["UGA", 90], ["BRA", 89], ["NZL", 84], ["DNK", 81], ["AUT", 78],
  ["ECU", 75], ["COL", 70], ["CHE", 70], ["LAO", 70], ["PAN", 70], ["NAM", 70], ["CAN", 66],
  ["VEN", 65], ["PRT", 63], ["HRV", 60], ["GTM", 60], ["SWE", 69], ["CHL", 55], ["PER", 55],
  ["LVA", 55], ["DEU", 52], ["ESP", 51], ["FIN", 48], ["GBR", 46], ["GRC", 45], ["ROU", 45],
  ["KHM", 45], ["TUR", 42], ["ITA", 42], ["IRL", 40], ["NLD", 40], ["VNM", 40], ["EST", 40],
  ["GHA", 40], ["LKA", 40], ["MMR", 40], ["AUS", 35], ["TZA", 35], ["SVN", 35], ["CHN", 31],
  ["ARG", 30], ["BOL", 30], ["PAK", 28], ["BEL", 28], ["FRA", 26], ["POL", 26], ["JPN", 24],
  ["USA", 23], ["PHL", 22], ["NGA", 22], ["SVK", 22], ["IND", 21], ["MEX", 20], ["IDN", 20],
  ["MAR", 20], ["BGR", 20], ["RUS", 18], ["MYS", 18], ["HUN", 18], ["THA", 15], ["CZE", 15],
  ["MNG", 15], ["LUX", 15], ["ZAF", 12], ["EGY", 12], ["KAZ", 12], ["UKR", 10], ["ISR", 10],
  ["KOR", 8], ["IRN", 6], ["ARE", 5], ["IRQ", 4], ["BGD", 2], ["SGP", 2], ["SAU", 1], ["DZA", 1],
];

export const worldSpec = {
  version: "1" as const,
  type: "choropleth" as const,
  title: "Renewable share of electricity",
  theme: "soft",
  data: renewable.map(([country, share]) => ({ country, share })),
  encoding: { region: "country", color: { field: "share", format: "%", title: "Share" } },
  mark: { atlas: "world", projection: "equalEarth", scale: "sequential" as const },
  size: { width: 880, height: 520 },
  a11y: { alt: "Approximate renewable share of electricity. Norway, Iceland, and Paraguay are near 100 percent. Saudi Arabia and Algeria are near zero. Countries with no row are hatched as no data. Malta and other small states missing from the 110m atlas are points." },
};

/** Approximate percent change in state population, 2020 to 2023. */
export const stateChange: [string, number][] = [
  ["AL", 1.9], ["AK", 0.3], ["AZ", 3.8], ["AR", 2.0], ["CA", -0.5], ["CO", 2.2], ["CT", 0.6],
  ["DE", 3.7], ["DC", -0.1], ["FL", 4.7], ["GA", 2.9], ["HI", -0.3], ["ID", 6.2], ["IL", -1.2],
  ["IN", 1.2], ["IA", 0.7], ["KS", 0.4], ["KY", 1.0], ["LA", -0.7], ["ME", 2.4], ["MD", 0.7],
  ["MA", 0.3], ["MI", 0.0], ["MN", 1.0], ["MS", -0.2], ["MO", 0.8], ["MT", 3.5], ["NE", 1.3],
  ["NV", 3.1], ["NH", 2.0], ["NJ", 0.8], ["NM", 0.5], ["NY", -2.1], ["NC", 3.8], ["ND", 1.6],
  ["OH", 0.2], ["OK", 2.0], ["OR", 0.5], ["PA", 0.2], ["RI", 0.5], ["SC", 5.0], ["SD", 3.6],
  ["TN", 3.1], ["TX", 4.3], ["UT", 4.5], ["VT", 0.6], ["VA", 1.3], ["WA", 1.5], ["WV", -1.3],
  ["WI", 0.9], ["WY", 1.0],
];

export const stateNames: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado",
  CT: "Connecticut", DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky",
  LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

export const usSpec = {
  version: "1" as const,
  type: "choropleth" as const,
  title: "Population change, 2020–2023",
  theme: "midnight",
  data: stateChange.map(([id, change]) => ({ id, change })),
  encoding: { region: "id", color: { field: "change", format: "%", title: "Change" } },
  mark: { atlas: "us", projection: "albersUsa", scale: "diverging" as const },
  size: { width: 880, height: 560 },
  a11y: { alt: "Approximate percent change in population from 2020 to 2023. Idaho, Florida, and Texas grew. New York, West Virginia, and Illinois shrank. Alaska and Hawaii sit in insets." },
};

export const cities = [
  { name: "Tokyo", lat: 35.7, lon: 139.7, pop: 37.4 },
  { name: "Delhi", lat: 28.6, lon: 77.2, pop: 32.9 },
  { name: "Shanghai", lat: 31.2, lon: 121.5, pop: 29.2 },
  { name: "Dhaka", lat: 23.8, lon: 90.4, pop: 23.2 },
  { name: "São Paulo", lat: -23.6, lon: -46.6, pop: 22.6 },
  { name: "Cairo", lat: 30.0, lon: 31.2, pop: 22.2 },
  { name: "Mexico City", lat: 19.4, lon: -99.1, pop: 22.3 },
  { name: "Beijing", lat: 39.9, lon: 116.4, pop: 21.3 },
  { name: "Mumbai", lat: 19.1, lon: 72.9, pop: 21.3 },
  { name: "Osaka", lat: 34.7, lon: 135.5, pop: 19.0 },
  { name: "New York", lat: 40.7, lon: -74.0, pop: 18.9 },
  { name: "Karachi", lat: 24.9, lon: 67.0, pop: 17.6 },
  { name: "Lagos", lat: 6.5, lon: 3.4, pop: 16.5 },
  { name: "Istanbul", lat: 41.0, lon: 29.0, pop: 16.0 },
  { name: "Buenos Aires", lat: -34.6, lon: -58.4, pop: 15.5 },
  { name: "Kolkata", lat: 22.6, lon: 88.4, pop: 15.3 },
  { name: "Los Angeles", lat: 34.1, lon: -118.2, pop: 12.5 },
  { name: "Moscow", lat: 55.8, lon: 37.6, pop: 12.6 },
  { name: "London", lat: 51.5, lon: -0.1, pop: 9.6 },
  { name: "Paris", lat: 48.9, lon: 2.3, pop: 11.1 },
  { name: "Johannesburg", lat: -26.2, lon: 28.0, pop: 6.1 },
  { name: "Sydney", lat: -33.9, lon: 151.2, pop: 5.3 },
];

export const citySpec = {
  version: "1" as const,
  type: "map-points" as const,
  title: "Largest urban areas",
  theme: "soft",
  data: cities,
  encoding: {
    latitude: "lat",
    longitude: "lon",
    size: { field: "pop", format: { suffix: " million" }, title: "Population" },
    color: "pop",
    label: "name",
  },
  mark: { atlas: "world", projection: "equalEarth", labelCount: 6 },
  size: { width: 880, height: 520 },
  a11y: { alt: "Approximate urban-area population in millions. Tokyo, Delhi, and Shanghai are the largest bubbles and are labelled. One accent colour, sized by population." },
};

/** Approximate metro population change, percent, 2020 to 2023. Same metric as the state map. */
export const metroChange: Record<string, [string, number][]> = {
  CA: [["Los Angeles", -1.2], ["San Francisco", -2.4], ["San Diego", 0.4], ["Sacramento", 1.1], ["San Jose", -0.8]],
  TX: [["Dallas", 5.4], ["Houston", 4.1], ["San Antonio", 3.6], ["Austin", 7.2]],
  NY: [["New York", -2.8], ["Buffalo", -0.6], ["Rochester", -0.4], ["Albany", 0.5]],
  FL: [["Miami", 3.2], ["Tampa", 5.1], ["Orlando", 4.4], ["Jacksonville", 3.8]],
  IL: [["Chicago", -1.6], ["Rockford", -0.9]],
  PA: [["Philadelphia", 0.4], ["Pittsburgh", -0.6]],
  OH: [["Columbus", 1.6], ["Cleveland", -0.8], ["Cincinnati", 0.6]],
  GA: [["Atlanta", 3.4], ["Savannah", 2.1]],
  NC: [["Charlotte", 4.6], ["Raleigh", 5.2]],
  MI: [["Detroit", -0.4], ["Grand Rapids", 1.2]],
  WA: [["Seattle", 1.8], ["Spokane", 1.4]],
  AZ: [["Phoenix", 4.2], ["Tucson", 2.1]],
  MA: [["Boston", 0.2], ["Springfield", 0.4]],
  CO: [["Denver", 2.4], ["Colorado Springs", 2.8]],
  TN: [["Nashville", 4.1], ["Memphis", 0.6]],
  MD: [["Baltimore", -0.3], ["Frederick", 2.2]],
  MN: [["Minneapolis", 0.8], ["Duluth", -0.2]],
  MO: [["St. Louis", -0.2], ["Kansas City", 1.4]],
  WI: [["Milwaukee", -0.4], ["Madison", 1.6]],
  OR: [["Portland", 0.3], ["Eugene", 0.8]],
  NV: [["Las Vegas", 3.4], ["Reno", 2.6]],
  UT: [["Salt Lake City", 3.8], ["Provo", 6.1]],
  VA: [["Virginia Beach", 0.6], ["Richmond", 2.1]],
  AK: [["Anchorage", -0.2], ["Fairbanks", 0.8]],
  HI: [["Honolulu", -0.6], ["Hilo", 0.4]],
};

export function metroChanges(id: string): { name: string; change: number }[] {
  const listed = metroChange[id];
  if (listed) return listed.map(([name, change]) => ({ name, change }));
  const statewide = stateChange.find(([code]) => code === id);
  return [{ name: "Statewide", change: statewide?.[1] ?? 0 }];
}

function escXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Horizontal bars from a shared zero, coloured with the map scale. No card fill of its own. */
export function metroBarSvg(title: string, rows: { name: string; change: number }[], fill: (value: number) => string, ink = "#1d1d1f"): string {
  const width = 420;
  const rowH = 34;
  const height = 44 + rows.length * rowH + 12;
  const maxAbs = Math.max(1.5, ...rows.map((row) => Math.abs(row.change)));
  const mid = 176;
  const scale = 130 / maxAbs;
  const bars = rows
    .map((row, index) => {
      const y = 44 + index * rowH;
      const w = Math.max(2, Math.abs(row.change) * scale);
      const x = row.change >= 0 ? mid : mid - w;
      const label = `${row.change > 0 ? "+" : ""}${row.change.toFixed(1)}%`;
      const labelX = row.change >= 0 ? x + w + 6 : x - 6;
      return `<text x="8" y="${y + 14}" fill="${ink}" font-size="13" font-family="ui-sans-serif,system-ui,sans-serif">${escXml(row.name)}</text><rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="16" rx="3" fill="${fill(row.change)}"/><text x="${labelX.toFixed(1)}" y="${y + 13}" text-anchor="${row.change >= 0 ? "start" : "end"}" fill="${ink}" font-size="12" font-family="ui-sans-serif,system-ui,sans-serif">${label}</text>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escXml(title)}, population change percent"><title>${escXml(title)}</title><text x="8" y="22" fill="${ink}" font-size="16" font-weight="600" font-family="ui-sans-serif,system-ui,sans-serif">${escXml(title)}</text><line x1="${mid}" y1="36" x2="${mid}" y2="${height - 10}" stroke="${ink}" stroke-opacity="0.2"/>${bars}</svg>`;
}

export function withTheme<T extends { theme?: string }>(spec: T, theme: string): T {
  return { ...spec, theme };
}
