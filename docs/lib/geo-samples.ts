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
  encoding: { region: "country", color: "share" },
  mark: { atlas: "world", projection: "equalEarth", scale: "sequential" as const },
  size: { width: 880, height: 520 },
  a11y: { alt: "Approximate renewable share of electricity. Norway, Iceland, and Paraguay are near 100 percent. Saudi Arabia and Algeria are near zero. Countries with no row are no data, including Malta, which this 110m atlas omits." },
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
  encoding: { region: "id", color: "change" },
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
  encoding: { latitude: "lat", longitude: "lon", size: "pop", color: "pop", label: "name" },
  mark: { atlas: "world", projection: "equalEarth", labelCount: 6 },
  size: { width: 880, height: 520 },
  a11y: { alt: "Approximate urban-area population in millions. Tokyo, Delhi, and Shanghai are the largest bubbles and are labelled." },
};

/** Approximate metro population, millions. Missing states fall back to a statewide bar. */
export const metros: Record<string, [string, number][]> = {
  CA: [["Los Angeles", 12.8], ["San Francisco", 4.6], ["San Diego", 3.3], ["Sacramento", 2.4], ["San Jose", 2.0]],
  TX: [["Dallas", 8.1], ["Houston", 7.5], ["San Antonio", 2.7], ["Austin", 2.5]],
  NY: [["New York", 19.5], ["Buffalo", 1.1], ["Rochester", 1.1], ["Albany", 0.9]],
  FL: [["Miami", 6.2], ["Tampa", 3.3], ["Orlando", 2.8], ["Jacksonville", 1.7]],
  IL: [["Chicago", 9.4], ["Rockford", 0.3]],
  PA: [["Philadelphia", 6.2], ["Pittsburgh", 2.4]],
  OH: [["Columbus", 2.2], ["Cleveland", 2.1], ["Cincinnati", 2.3]],
  GA: [["Atlanta", 6.3], ["Savannah", 0.4]],
  NC: [["Charlotte", 2.8], ["Raleigh", 1.5]],
  MI: [["Detroit", 4.3], ["Grand Rapids", 1.2]],
  WA: [["Seattle", 4.0], ["Spokane", 0.6]],
  AZ: [["Phoenix", 5.0], ["Tucson", 1.1]],
  MA: [["Boston", 4.9], ["Springfield", 0.7]],
  CO: [["Denver", 3.0], ["Colorado Springs", 0.8]],
  TN: [["Nashville", 2.1], ["Memphis", 1.3]],
  MD: [["Baltimore", 2.8], ["Frederick", 0.3]],
  MN: [["Minneapolis", 3.7], ["Duluth", 0.3]],
  MO: [["St. Louis", 2.8], ["Kansas City", 2.2]],
  WI: [["Milwaukee", 1.6], ["Madison", 0.7]],
  OR: [["Portland", 2.5], ["Eugene", 0.4]],
  NV: [["Las Vegas", 2.3], ["Reno", 0.5]],
  UT: [["Salt Lake City", 1.3], ["Provo", 0.7]],
  VA: [["Virginia Beach", 1.8], ["Richmond", 1.3]],
  AK: [["Anchorage", 0.4], ["Fairbanks", 0.1]],
  HI: [["Honolulu", 1.0], ["Hilo", 0.2]],
};

export const statePop: Record<string, number> = {
  AL: 5.1, AK: 0.7, AZ: 7.4, AR: 3.1, CA: 39.0, CO: 5.9, CT: 3.6, DE: 1.0, DC: 0.7, FL: 22.6,
  GA: 11.0, HI: 1.4, ID: 2.0, IL: 12.5, IN: 6.8, IA: 3.2, KS: 2.9, KY: 4.5, LA: 4.6, ME: 1.4,
  MD: 6.2, MA: 7.0, MI: 10.0, MN: 5.7, MS: 2.9, MO: 6.2, MT: 1.1, NE: 2.0, NV: 3.2, NH: 1.4,
  NJ: 9.3, NM: 2.1, NY: 19.5, NC: 10.8, ND: 0.8, OH: 11.8, OK: 4.0, OR: 4.2, PA: 13.0, RI: 1.1,
  SC: 5.4, SD: 0.9, TN: 7.1, TX: 30.5, UT: 3.4, VT: 0.6, VA: 8.7, WA: 7.8, WV: 1.8, WI: 5.9, WY: 0.6,
};

export function metroRows(id: string): { name: string; people: number }[] {
  const listed = metros[id];
  if (listed) return listed.map(([name, people]) => ({ name, people }));
  return [{ name: "Statewide", people: statePop[id] ?? 1 }];
}

export function withTheme<T extends { theme?: string }>(spec: T, theme: string): T {
  return { ...spec, theme };
}
