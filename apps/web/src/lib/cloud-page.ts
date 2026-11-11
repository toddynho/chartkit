/** Live Cloud page presets and the snippets generated from them. */

export type CloudFormat = "svg" | "png";

export type CloudTabId = "curl" | "img" | "markdown" | "fetch" | "python";

export const CLOUD_TAB_IDS: CloudTabId[] = ["curl", "img", "markdown", "fetch", "python"];

export const CLOUD_TAB_KEY = "ck-cloud-tab";

export interface CloudSnippet {
  id: CloudTabId;
  label: string;
  lang: string;
  code: string;
  note: string;
}

const bar = {
  version: "1",
  type: "bar",
  title: "Signups by month",
  data: [
    { m: "Jan", n: 72 },
    { m: "Feb", n: 98 },
    { m: "Mar", n: 87 },
    { m: "Apr", n: 128 },
    { m: "May", n: 115 },
    { m: "Jun", n: 158 },
    { m: "Jul", n: 149 },
    { m: "Aug", n: 188 },
  ],
  encoding: { x: "m", y: "n" },
  a11y: { alt: "Signups by month, January through August, ending at 188." },
};

const line = {
  version: "1",
  type: "line",
  title: "Weekly active users",
  data: [
    { w: "W1", n: 410 },
    { w: "W2", n: 462 },
    { w: "W3", n: 440 },
    { w: "W4", n: 530 },
    { w: "W5", n: 598 },
    { w: "W6", n: 575 },
    { w: "W7", n: 660 },
    { w: "W8", n: 742 },
  ],
  encoding: { x: "w", y: "n" },
  a11y: { alt: "Weekly active users from W1 to W8, ending at 742." },
};

const donut = {
  version: "1",
  type: "donut",
  title: "Traffic by source",
  data: [
    { s: "Search", n: 46 },
    { s: "Direct", n: 28 },
    { s: "Referral", n: 16 },
    { s: "Social", n: 10 },
  ],
  encoding: { x: "s", y: "n" },
  a11y: { alt: "Traffic by source: Search 46, Direct 28, Referral 16, Social 10." },
};

export const cloudPresets = { bar, line, donut };

export function renderUrl(origin: string, specJson: string, format: CloudFormat): string {
  return `${origin}/render?spec=${encodeURIComponent(specJson)}&format=${format}`;
}

/** Place-section footers. Email and docs ask for PNG. Reports use `w`, not `width`. */
export function placeLines(origin: string, specJson: string): Record<"email" | "docs" | "agents" | "reports", string> {
  const png = renderUrl(origin, specJson, "png");
  const svg = renderUrl(origin, specJson, "svg");
  return {
    email: `<img src="${png}&scale=2">`,
    docs: `![signups](${png})`,
    agents: svg,
    reports: `fetch("${svg}&w=1200")`,
  };
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

function attr(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

export function altOf(spec: unknown): string {
  if (typeof spec !== "object" || spec === null) return "Chart";
  const record = spec as { a11y?: { alt?: unknown }; title?: unknown };
  if (typeof record.a11y?.alt === "string" && record.a11y.alt.trim()) return record.a11y.alt.trim();
  if (typeof record.title === "string" && record.title.trim()) return record.title.trim();
  return "Chart";
}

export function tabId(value: string | null): CloudTabId {
  if (value === "img" || value === "markdown" || value === "fetch" || value === "python" || value === "curl") return value;
  return "curl";
}

/**
 * Snippets for the spec the hero just rendered.
 * GET /render returns the file. POST /render returns JSON (svg or base64 png, plus url).
 */
export function cloudSnippets(origin: string, specJson: string, format: CloudFormat, alt: string): CloudSnippet[] {
  const url = renderUrl(origin, specJson, format);
  const pngUrl = renderUrl(origin, specJson, "png");
  const file = format === "png" ? "body.png is base64" : "body.svg is the markup";
  const pyFile = format === "png" ? "base64 png" : "svg";
  return [
    {
      id: "curl",
      label: "curl",
      lang: "shell",
      code: `curl -sG ${origin}/render \\\n  --data-urlencode ${shellQuote(`spec=${specJson}`)} \\\n  --data-urlencode format=${format} \\\n  -o chart.${format}`,
      note: "GET with a URL-encoded spec returns the file. POST /render returns JSON with the SVG or base64 PNG, plus a url.",
    },
    {
      id: "img",
      label: "<img>",
      lang: "html",
      code: `<img\n  src="${url}"\n  alt="${attr(alt)}">`,
      note: "The alt text comes from spec.a11y.alt when you set it.",
    },
    {
      id: "markdown",
      label: "Markdown",
      lang: "markdown",
      code: `![${alt.replaceAll("]", "\\]").replaceAll("\n", " ")}](${pngUrl})`,
      note: "GitHub proxies images and strips SVG scripts, so use format=png in READMEs.",
    },
    {
      id: "fetch",
      label: "fetch",
      lang: "javascript",
      code: `const spec = ${specJson};\nconst res = await fetch('${origin}/render', {\n  method: 'POST',\n  headers: { 'content-type': 'application/json' },\n  body: JSON.stringify({ spec, format: '${format}' }),\n});\nconst body = await res.json(); // ${file}; body.url is the image URL`,
      note: "POST /render returns JSON, not the file. A GET spec and a POST body both cap at 1 MB. JSON longer than 1,800 characters is stored, and url points at /c/<id>.",
    },
    {
      id: "python",
      label: "Python",
      lang: "python",
      code: `import requests\nspec = ${specJson}\nr = requests.post('${origin}/render',\n                  json={'spec': spec, 'format': '${format}'})\nbody = r.json()  # ${pyFile}, plus url. GET returns the file.`,
      note: "Any HTTP client works; there is no SDK to install. POST returns JSON. GET returns the file.",
    },
  ];
}
