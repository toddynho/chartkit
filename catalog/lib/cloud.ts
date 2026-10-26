/** Public render origin. Live examples use NEXT_PUBLIC_CHARTKIT_CLOUD_URL when the docs server points at a local process. */
export const PUBLIC_CLOUD = "https://cloud.chartkit.dev";

export const cloudBase = process.env.NEXT_PUBLIC_CHARTKIT_CLOUD_URL || PUBLIC_CLOUD;

/** Showcase line from the looks page. The cloud examples use this instead of the two-row llms.txt bar. */
export const cloudSpec = {
  version: "1",
  type: "line",
  title: "Revenue",
  data: [
    { month: "Jan", revenue: 42, target: 40 },
    { month: "Feb", revenue: 46, target: 43 },
    { month: "Mar", revenue: 44, target: 46 },
    { month: "Apr", revenue: 51, target: 49 },
    { month: "May", revenue: 58, target: 52 },
    { month: "Jun", revenue: 55, target: 55 },
  ],
  encoding: {
    x: "month",
    y: [
      { field: "revenue", title: "Revenue", area: true },
      { field: "target", title: "Target" },
    ],
  },
  mark: { curve: "monotone" },
  a11y: { alt: "Revenue stays near the target and finishes above it." },
} as const;

const specJson = JSON.stringify(cloudSpec);
const alt = cloudSpec.a11y.alt;

export function renderPath(theme?: "midnight"): string {
  const params = new URLSearchParams({ spec: specJson, format: "svg", w: "960", h: "480" });
  if (theme) params.set("theme", theme);
  return `/render?${params}`;
}

export const liveLight = `${cloudBase}${renderPath()}`;
export const liveMidnight = `${cloudBase}${renderPath("midnight")}`;

const publicLight = `${PUBLIC_CLOUD}${renderPath()}`;
const publicPng = `${PUBLIC_CLOUD}${renderPath().replace("format=svg", "format=png")}`;

export const snippets = {
  img: `<img\n  alt="${alt}"\n  src="${publicLight}"\n/>`,
  curl: `curl -sG "${PUBLIC_CLOUD}/render" \\\n  --data-urlencode 'spec=${specJson}' \\\n  --data-urlencode format=svg \\\n  --data-urlencode w=960 \\\n  --data-urlencode h=480 \\\n  -o chart.svg`,
  fetch: `const spec = ${specJson};\n\nconst res = await fetch("${PUBLIC_CLOUD}/render", {\n  method: "POST",\n  headers: { "content-type": "application/json" },\n  body: JSON.stringify({ spec, format: "svg", w: 960, h: 480 }),\n});\nconst { url, applied, warnings, svg } = await res.json();`,
  clean: `const spec = ${specJson};\n\nconst res = await fetch("${PUBLIC_CLOUD}/charts", {\n  method: "POST",\n  headers: {\n    "content-type": "application/json",\n    authorization: \`Bearer \${process.env.CHARTKIT_CLOUD_KEY}\`,\n  },\n  body: JSON.stringify({ spec }),\n});\nconst { url } = await res.json();\n// url is /c/<id>.svg. It does not contain the key.\nconst img = \`<img alt="${alt}" src="\${url}">\`;`,
  markdown: `![${alt}](${publicPng})`,
};
