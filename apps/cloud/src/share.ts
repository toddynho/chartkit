/**
 * HTML share pages for X, Slack, LinkedIn, and iMessage.
 * The image tags point at the 1200×628 card PNG. The page body shows the chart itself.
 */

const PLAYGROUND = "https://chartkit.dev/playground";
const PRODUCT = "https://chartkit.dev";
/** A playground hash past this is more than a browser will reliably open. */
const PLAYGROUND_URL_LIMIT = 12_000;

export interface SharePage {
  title: string;
  description: string;
  pageUrl: string;
  imageUrl: string;
  svg: string;
  playgroundHref: string | null;
}

export function shareDocument(page: SharePage): string {
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const pageUrl = escapeHtml(page.pageUrl);
  const imageUrl = escapeHtml(page.imageUrl);
  const play = page.playgroundHref
    ? `<a href="${escapeHtml(page.playgroundHref)}">Open in playground</a>`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@toddo">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${imageUrl}">
<meta name="twitter:image:alt" content="${description}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${pageUrl}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="628">
<meta property="og:image:alt" content="${description}">
<style>
  body { margin: 0; background: #f4f4f5; color: #1d1d1f; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  main { max-width: 980px; margin: 0 auto; padding: 28px 20px 48px; }
  h1 { font-size: 22px; line-height: 1.35; font-weight: 650; letter-spacing: -0.02em; margin: 0 0 16px; }
  .chart { background: #fff; border-radius: 16px; overflow: auto; }
  .chart svg { display: block; max-width: 100%; height: auto; }
  footer { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-top: 14px; font-size: 13px; }
  footer a { color: #0a63e6; text-decoration: none; }
  footer a:hover { text-decoration: underline; }
</style>
</head>
<body>
<main>
  <h1>${title}</h1>
  <div class="chart">${page.svg}</div>
  <footer>
    <a href="${PRODUCT}">Made with ChartKit</a>
    ${play}
  </footer>
</main>
</body>
</html>
`;
}

export function shareMessage(title: string, detail: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  body { margin: 0; background: #f4f4f5; color: #1d1d1f; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  main { max-width: 640px; margin: 0 auto; padding: 48px 20px; }
  h1 { font-size: 22px; font-weight: 650; letter-spacing: -0.02em; margin: 0 0 8px; }
  p { margin: 0; color: #6e6e73; }
</style>
</head>
<body>
<main>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(detail)}</p>
</main>
</body>
</html>
`;
}

export function specTitle(spec: unknown): string {
  if (isRecord(spec) && typeof spec.title === "string" && spec.title.trim()) return spec.title;
  return "ChartKit chart";
}

export function specDescription(spec: unknown): string {
  if (isRecord(spec) && isRecord(spec.a11y) && typeof spec.a11y.alt === "string") return spec.a11y.alt;
  return "";
}

/** Playground loads a chart spec, or a `{ spec }` payload, from the location hash. */
export function playgroundHref(spec: unknown): string | null {
  if (!isRecord(spec)) return null;
  if (typeof spec.type !== "string" && spec.version == null) return null;
  const href = `${PLAYGROUND}#${encodeURIComponent(JSON.stringify(spec))}`;
  if (href.length > PLAYGROUND_URL_LIMIT) return null;
  return href;
}

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
