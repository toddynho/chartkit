/** Public render origin. Live examples use NEXT_PUBLIC_CHARTKIT_CLOUD_URL when the docs server points at a local process. */
export const PUBLIC_CLOUD = "https://cloud.chartkit.dev";

export const cloudBase = process.env.NEXT_PUBLIC_CHARTKIT_CLOUD_URL || PUBLIC_CLOUD;

/** The bar spec from llms.txt, so the page does not invent a second dataset. */
export const cloudSpec = {
  version: "1",
  type: "bar",
  data: [
    { lane: "A", stops: 12 },
    { lane: "C", stops: 15 },
  ],
  encoding: { x: "lane", y: "stops" },
  a11y: { alt: "Lane C has more." },
} as const;

const specJson = JSON.stringify(cloudSpec);

export function renderPath(theme?: "midnight"): string {
  const params = new URLSearchParams({ spec: specJson, format: "svg", w: "640", h: "320" });
  if (theme) params.set("theme", theme);
  return `/render?${params}`;
}

export const liveLight = `${cloudBase}${renderPath()}`;
export const liveMidnight = `${cloudBase}${renderPath("midnight")}`;

const publicLight = `${PUBLIC_CLOUD}${renderPath()}`;
const publicPng = `${PUBLIC_CLOUD}${renderPath().replace("format=svg", "format=png")}`;

export const snippets = {
  img: `<img\n  alt="Lane C has more."\n  src="${publicLight}"\n/>`,
  curl: `curl -sG "${PUBLIC_CLOUD}/render" \\\n  --data-urlencode 'spec=${specJson}' \\\n  --data-urlencode format=svg \\\n  --data-urlencode w=640 \\\n  --data-urlencode h=320 \\\n  -o chart.svg`,
  fetch: `const spec = ${specJson};\n\nconst res = await fetch("${PUBLIC_CLOUD}/render", {\n  method: "POST",\n  headers: { "content-type": "application/json" },\n  body: JSON.stringify({ spec, format: "svg", w: 640, h: 320 }),\n});\nconst { url, applied, warnings, svg } = await res.json();`,
  markdown: `![Lane C has more.](${publicPng})`,
};
