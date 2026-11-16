import { formatValue } from "../format";
import { easeCss, isRecord, type HoverIndex, type InteractSpec } from "./spec";

/** Pixel centers for a category axis, or a numeric x scaled across the plot. Unsorted x is indexed. */
export function buildHoverIndex(
  count: number,
  left: number,
  width: number,
  values: ArrayLike<number> | null,
): HoverIndex {
  const xs = new Float64Array(count);
  if (!values) {
    const slot = count > 0 ? width / count : width;
    for (let i = 0; i < count; i++) xs[i] = left + slot * i + slot / 2;
    return { xs, order: null, pixels: xs, uniform: true, count, left, width };
  }
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < count; i++) {
    const value = Number(values[i]);
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const span = max - min || 1;
  for (let i = 0; i < count; i++) xs[i] = left + ((Number(values[i]) - min) / span) * width;
  let sorted = true;
  for (let i = 1; i < count; i++) {
    if (xs[i] < xs[i - 1]) {
      sorted = false;
      break;
    }
  }
  if (sorted) return { xs, order: null, pixels: xs, uniform: false, count, left, width };
  const order = new Int32Array(count);
  for (let i = 0; i < count; i++) order[i] = i;
  order.sort((a, b) => xs[a] - xs[b] || a - b);
  const sortedXs = new Float64Array(count);
  for (let i = 0; i < count; i++) sortedXs[i] = xs[order[i]];
  return { xs: sortedXs, order, pixels: xs, uniform: false, count, left, width };
}

/** Nearest precomputed x. Category axes are O(1). Numeric axes are a binary search. */
export const NO_PIXELS = new Float64Array(0);

export function lookupIndex(index: HoverIndex, x: number): number {
  if (index.at) return index.at(x);
  const n = index.count;
  if (n <= 1) return 0;
  if (index.uniform) {
    const slot = index.width / n;
    const i = Math.round((x - index.left) / slot - 0.5);
    return i < 0 ? 0 : i >= n ? n - 1 : i;
  }
  const xs = index.xs;
  if (x <= xs[0]) return index.order ? index.order[0] : 0;
  const last = n - 1;
  if (x >= xs[last]) return index.order ? index.order[last] : last;
  let lo = 0;
  let hi = last;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid;
    else hi = mid;
  }
  const pick = x - xs[lo] <= xs[hi] - x ? lo : hi;
  return index.order ? index.order[pick] : pick;
}

/** Page a legend that drew more rows than legend.maxRows. */
export function turnLegendPage(svg: SVGElement, target: Element | null): boolean {
  const hit = target?.closest?.("[data-ck-legend-page]");
  if (!hit || !svg.contains(hit)) return false;
  const group = hit.closest("[data-ck-legend]");
  if (!group) return false;
  const rows = Array.from(group.querySelectorAll("[data-ck-legend-row]"));
  const per = Number(group.getAttribute("data-ck-legend-max") || rows.length) || rows.length;
  const pages = Math.max(1, Math.ceil(rows.length / per));
  let page = Number(group.getAttribute("data-ck-legend-at") || 0);
  page = hit.getAttribute("data-ck-legend-page") === "next" ? Math.min(pages - 1, page + 1) : Math.max(0, page - 1);
  group.setAttribute("data-ck-legend-at", String(page));
  rows.forEach((row, index) => {
    (row as SVGElement).style.display = Math.floor(index / per) === page ? "" : "none";
  });
  const label = group.querySelector("[data-ck-legend-count]");
  if (label) label.textContent = `${page + 1}/${pages}`;
  return true;
}

export function fmt(value: unknown, format: unknown, locale: string): string {
  if (typeof value === "number" && Number.isFinite(value)) return formatValue(value, format ?? "number", locale);
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return formatValue(Number(value), format ?? "number", locale);
  }
  return value == null ? "" : String(value);
}

function dec(value: string): string {
  return value.replace(/&amp;|&lt;|&gt;|&quot;/g, (ch) => (ch[1] === "a" ? "&" : ch[1] === "l" ? "<" : ch[1] === "g" ? ">" : "\""));
}

export function patchRoot(el: Element, attrs: string): void {
  const keep = new Set<string>(["tabindex", "xmlns"]);
  const re = /([\w:-]+)="([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(attrs))) {
    if (match[1] === "xmlns") continue;
    keep.add(match[1]);
    const value = dec(match[2]);
    if (value.length > 80 || el.getAttribute(match[1]) !== value) el.setAttribute(match[1], value);
  }
  for (let i = el.attributes.length - 1; i >= 0; i--) if (!keep.has(el.attributes[i].name)) el.removeAttribute(el.attributes[i].name);
}

function putText(el: Element, text: string): void {
  if (!el.firstElementChild && el.textContent !== text) el.textContent = text;
}

/** Same tags, in order: copy attributes and text. False when the shape changed, before any write. */
export function paint(svg: Element, markup: string): boolean {
  const nodes = svg.querySelectorAll("*");
  let opens = 0;
  const need = nodes.length + 1;
  for (let p = 0; p < markup.length; p++) {
    if (markup.charCodeAt(p) === 60 && markup.charCodeAt(p + 1) !== 47 && ++opens > need) return false;
  }
  if (opens !== need) return false;
  let n = 0;
  let el: Element = svg;
  let i = 0;
  while (i < markup.length) {
    if (markup.charCodeAt(i) !== 60) {
      const j = markup.indexOf("<", i);
      putText(el, dec(markup.slice(i, j < 0 ? markup.length : j)));
      if (j < 0) break;
      i = j;
      continue;
    }
    if (markup.charCodeAt(i + 1) === 47) {
      i = markup.indexOf(">", i) + 1;
      continue;
    }
    const gt = markup.indexOf(">", i);
    if (gt < 0) return false;
    const head = markup.slice(i + 1, gt);
    const cut = head.search(/[\s/]/);
    const target = n ? nodes[n - 1] : svg;
    if (!target || target.localName !== (cut < 0 ? head : head.slice(0, cut))) return false;
    el = target;
    patchRoot(el, head);
    if (markup.charCodeAt(gt + 1) === 60 || gt + 1 >= markup.length) putText(el, "");
    n++;
    i = gt + 1;
  }
  return n === need;
}

/** A custom property that actually paints. `initial` and `transparent` leave the Soft tooltip fallback in place. */
function painted(value: string): boolean {
  const token = value.trim().toLowerCase();
  return token !== "" && token !== "initial" && token !== "inherit" && token !== "unset" && token !== "transparent" && token !== "rgba(0, 0, 0, 0)" && token !== "rgba(0,0,0,0)";
}

/** Midnight tooltips use the theme surface, not the Soft dark card. A host variable still wins. */
export function useTheme(host: Element, spec: InteractSpec): void {
  const theme = spec.theme;
  const name = typeof theme === "string" ? theme : isRecord(theme) && typeof theme.name === "string" ? theme.name : "";
  if (name !== "midnight") return;
  // Same tokens as `midnight` in theme.ts. Inlined so this entry does not pull every preset.
  const preset = { background: "#0c0c0c", surface: "#1a1a1a", text: "#ffffff" };
  const el = host as HTMLElement;
  if (!el.style) return;
  const set = (token: string, value: string) => {
    const key = `--ck-${token}`;
    if (painted(el.style.getPropertyValue(key))) return;
    if (typeof getComputedStyle === "function" && painted(getComputedStyle(el).getPropertyValue(key))) return;
    el.style.setProperty(key, value);
  };
  set("background", preset.background);
  set("surface", preset.surface);
  set("text", preset.text);
}

export function fade(el: Element, ms: number, from = "0.45", easing = "ease-out"): void {
  if (ms <= 0) return;
  const node = el as SVGSVGElement;
  node.style.transition = "none";
  node.style.opacity = from;
  const curve = easeCss(easing);
  const drawn = revealPaths(node);
  requestAnimationFrame(() => {
    node.style.transition = `opacity ${ms}ms ${curve}`;
    node.style.opacity = "1";
    for (let i = 0; i < drawn.length; i++) {
      const path = drawn[i];
      if (!path) continue;
      path.style.transition = `stroke-dashoffset ${ms}ms ${curve}`;
      path.style.strokeDashoffset = "0";
    }
  });
}

/** Line strokes draw in with the same curve. A whole-chart opacity fade is invisible in a still. */
function revealPaths(node: SVGSVGElement): SVGPathElement[] {
  const out: SVGPathElement[] = [];
  const paths = node.querySelectorAll("path");
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    if (!path || path.localName !== "path") continue;
    const stroke = path.getAttribute("stroke");
    const fill = path.getAttribute("fill");
    if (!stroke || stroke === "none" || (fill && fill !== "none") || path.getAttribute("stroke-dasharray")) continue;
    const measurable = path as SVGPathElement;
    if (typeof measurable.getTotalLength !== "function") continue;
    let len = 0;
    try {
      len = measurable.getTotalLength();
    } catch {
      continue;
    }
    if (!(len > 1)) continue;
    measurable.style.strokeDasharray = String(len);
    measurable.style.strokeDashoffset = String(len);
    out.push(measurable);
  }
  return out;
}

function legendSwatch(node: Element | null): boolean {
  if (!node) return false;
  if (node.localName === "rect") {
    const w = Number(node.getAttribute("width"));
    const h = Number(node.getAttribute("height"));
    return w > 0 && w <= 12 && h > 0 && h <= 12;
  }
  if (node.localName === "circle") {
    const r = Number(node.getAttribute("r"));
    return r > 0 && r <= 6;
  }
  const d = node.localName === "path" ? node.getAttribute("d") || "" : "";
  return d.length > 0 && d.length < 80 && !node.hasAttribute("stroke-dasharray");
}

export function legendItems(svg: SVGSVGElement): { name: string; text: SVGTextElement; swatch: Element | null }[] {
  const out: { name: string; text: SVGTextElement; swatch: Element | null }[] = [];
  const texts = svg.querySelectorAll("text");
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i] as SVGTextElement;
    const prev = text.previousElementSibling;
    if (!legendSwatch(prev)) continue;
    out.push({ name: text.textContent ?? "", text, swatch: prev });
  }
  return out;
}
