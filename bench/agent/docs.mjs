import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function findRepoRoot(start) {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, "docs/public/llms.txt")) && existsSync(join(dir, "bench/agent/docs/sources.json"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = findRepoRoot(here) ?? findRepoRoot(process.cwd());
if (!repoRoot) throw new Error("ChartKit repo root not found from the agent docs loader");
const sources = JSON.parse(readFileSync(join(repoRoot, "bench/agent/docs/sources.json"), "utf8"));

const NO_DOCS_HINT = {
  chartkit:
    'How to render: return one JSON object. "version" is "1". "type" is the chart name. "data" is the row array. "a11y.alt" is one sentence. encoding.x and encoding.y are field names. Gauge, kpi, and progress-ring use metric: { value, min, max, label?, delta? }.',
  recharts: "Use renderToStaticMarkup from react-dom/server and return that string. JSX is allowed.",
  echarts:
    'In Node, use echarts.init(null, null, { renderer: "svg", ssr: true, width, height }) and return chart.renderToSVGString(). Code that touches document runs in a browser instead.',
  chartjs:
    "render() runs in a browser document. document and canvas exist. Create a canvas, construct the chart, and return the canvas markup or a data URL.",
};

function readCapped(file, cap) {
  const text = readFileSync(file, "utf8");
  const bytes = Buffer.byteLength(text);
  if (bytes <= cap) return text;
  const buf = Buffer.from(text, "utf8");
  let end = cap;
  while (end > 0 && (buf[end] & 0xc0) === 0x80) end -= 1;
  let sliced = buf.subarray(0, end).toString("utf8");
  const nl = sliced.lastIndexOf("\n");
  if (nl > cap * 0.75) sliced = sliced.slice(0, nl);
  return `${sliced.replace(/\s+$/, "")}\n`;
}

/** What the with-docs prompt prepends. ChartKit is its llms.txt. The others are cut to that file's byte length. */
export function officialReference(library) {
  const meta = sources.libraries[library];
  if (!meta) return null;
  const capFile = join(repoRoot, sources.capFile);
  const cap = readFileSync(capFile).length;
  const file = library === "chartkit" ? capFile : join(repoRoot, meta.file);
  const text = readCapped(file, library === "chartkit" ? Number.MAX_SAFE_INTEGER : cap);
  return {
    library,
    title: meta.title,
    url: meta.url,
    also: meta.also ?? [],
    llmsTxt: meta.llmsTxt ?? null,
    note: meta.note,
    bytes: Buffer.byteLength(text),
    capBytes: cap,
    text,
  };
}

export function docsManifest() {
  const order = ["chartkit", "recharts", "echarts", "chartjs"];
  return order.map((library) => {
    const doc = officialReference(library);
    return {
      library,
      title: doc.title,
      url: doc.url,
      also: doc.also,
      llmsTxt: doc.llmsTxt,
      note: doc.note,
      bytes: doc.bytes,
      capBytes: doc.capBytes,
      noDocsHint: NO_DOCS_HINT[library],
    };
  });
}

export function noDocsHint(library) {
  return NO_DOCS_HINT[library] ?? "";
}
