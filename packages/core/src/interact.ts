/**
 * Client interaction for a chart that is already in the DOM.
 * `@chartkitdev/core/all` does not import this module, so a static render stays the same string.
 * Adapters call `attach` after the SVG is mounted and `patchSvg` when the spec changes.
 */
import { dataHit, paintScene } from "./canvas/hit-state";
import { formatValue } from "./format";
import { refreshNavigator, unbindNavigator } from "./nav-hook";
import { joinSync, syncHide, syncHover, syncRange, type SyncMember } from "./sync-group";
import { formatInstant, instantOf, namedZone } from "./timezone";
import { motionMs, playMotion, type MotionFlight } from "./motion";
import { readTooltip, type TooltipDetail, type TooltipRender } from "./tooltip-slot";
import { arcChart, axisFormat, barChart, breakKey, copySelection, crosshairOn, drawnData, drillOf, durationMs, easeOf, exportFormats, fieldOf, hitPx, isRecord, KEY_TYPES, materialize, navigatorOn, numericValues, openTable, reducedMotion, seriesOf, syncIdOf, tipFields, tipSide, tipTemplate, titleOf, tooltipOn, zoomMode, type AttachOptions, type ClickDetail, type Controller, type InteractSpec, type PatchHost, type Selection } from "./interact/spec";
import { applyTipChrome, ensureCss, esc, parkTip, plotBox, scanMarks, sitTip, tipObstacles, tipOverlap, viewBox, viewPoint, type Box, type Marks } from "./interact/tip";
import { buildHoverIndex, fade, fmt, legendItems, lookupIndex, NO_PIXELS, paint, patchRoot, turnLegendPage, useTheme } from "./interact/patch";

export type { InteractSpec, ClickDetail, PointRef, Selection, AttachOptions, Controller, PatchHost, HoverIndex } from "./interact/spec";
export { buildHoverIndex, lookupIndex } from "./interact/patch";

export { canvasWanted } from "./render-mode";

export type { TooltipDetail, TooltipRender };
export { readTooltip, writeTooltip } from "./tooltip-slot";
const lastMarkup = new WeakMap<object, string>();

/**
 * Write `markup` into the existing `<svg>`. When the tags and attribute names
 * still match, path `d`, tick text, positions, and aria/alt update in place.
 * A structure change, or a host without an svg, replaces the markup.
 * The svg node keeps its listeners. Crosshair and brush stay mounted.
 */
const canvasToken = new WeakMap<object, number>();

/** Load the canvas painter after the SVG is in the document. The chunk stays out of the line bundle. */
function queueCanvas(host: Element, spec?: InteractSpec): void {
  const svg = host.querySelector?.("svg");
  if (!(svg instanceof SVGSVGElement) || svg.getAttribute("data-ck-render") !== "canvas") return;
  if (svg.getAttribute("data-ck-scene") === "1") return;
  if (typeof document === "undefined") return;
  const token = (canvasToken.get(host) ?? 0) + 1;
  canvasToken.set(host, token);
  const run = () => {
    if (canvasToken.get(host) !== token) return;
    void import("./canvas/hydrate").then((mod) => {
      if (canvasToken.get(host) !== token) return;
      if (spec && mod.paintSpec(host, spec)) return;
      mod.hydrate(host);
    });
  };
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
  else run();
}

export function patchSvg(host: PatchHost, markup: string, duration = 0, easing = "ease-out"): void {
  if (lastMarkup.get(host) === markup) return;
  const current = host.querySelector?.("svg");
  const open = markup.startsWith("<svg") ? markup.indexOf(">") : -1;
  const close = open > 0 ? markup.lastIndexOf("</svg>") : -1;
  if (!current || open < 0 || close < open) {
    if (host.innerHTML !== markup) host.innerHTML = markup;
    lastMarkup.set(host, markup);
    return;
  }
  const held: Element[] = [];
  const keep = current.querySelectorAll("[data-ck-crosshair],[data-ck-brush]");
  for (let i = 0; i < keep.length; i++) held.push(keep[i]);
  for (let i = 0; i < held.length; i++) held[i].remove();
  if (!paint(current, markup)) {
    patchRoot(current, markup.slice(4, open));
    current.innerHTML = markup.slice(open + 1, close);
  }
  for (let i = 0; i < held.length; i++) current.append(held[i]);
  fade(current, duration, "0.45", easing);
  lastMarkup.set(host, markup);
}

/**
 * Listen on `host` for tooltip, crosshair, legend toggle, clicks, selection,
 * x zoom/pan/brush, enter/update motion, keyboard focus, and an optional data table.
 * A navigator, sync group, and drilldown stay in the JSON spec.
 * Tears down with `destroy`. Does nothing when the spec leaves interaction off.
 */
export function attach(host: Element, spec: InteractSpec, options: AttachOptions): Controller {
  const found = host.querySelector?.("svg");
  if (!(found instanceof SVGSVGElement) || typeof document === "undefined") {
    return { update() {}, setSelection() {}, destroy() {}, ready: Promise.resolve() };
  }
  let svg: SVGSVGElement = found;
  ensureCss();
  useTheme(host, spec);
  host.setAttribute("data-ck-interact", "1");
  applyTipChrome(host, found);
  if (getComputedStyle(host).position === "static") (host as HTMLElement).style.position = "relative";

  let base = spec;
  /** `base.data` in drawn order. Every row index below counts in this order, like `data-ck-i`. */
  let data = drawnData(spec);
  let table = openTable(data);
  let series = seriesOf(spec, table);
  let n = table.n;
  const read = (next: InteractSpec) => {
    base = next;
    data = drawnData(next);
    table = openTable(data);
    series = seriesOf(next, table);
    n = table.n;
    owners.clear();
  };
  let lo = 0;
  let hi = Math.max(0, n - 1);
  const hidden = new Set<string>();
  let alive = true;
  let flight: MotionFlight | null = null;
  let breakWatch: ResizeObserver | undefined;
  let focus = 0;
  let hover = buildHoverIndex(0, 0, 1, null);
  /** Long rows repeat a category once per series. `slotRow` is the first row of each slot, `rowSlot` the slot of each row, both from `lo`. */
  let slotRow: number[] | null = null;
  let rowSlot: number[] = [];
  /** The hover index counts slots, not rows. False for long rows on a numeric x, which keep one pixel per row. */
  let bySlot = false;
  const horizontal = () => base.type === "bar" && isRecord(base.mark) && base.mark.orientation === "horizontal";
  let box: Box = { l: 0, t: 0, w: 1, h: 1 };
  /** What the hover reads from the drawn SVG, kept from one redraw to the next: tooltip obstacles, and the marks that carry a row index. */
  let seen: Marks | undefined;
  let inked = new Map<string, Element[]>();
  let stale = false;
  let fresh = false;
  /** A path's `d` split into tokens, kept while the string is the same. */
  const cuts = new WeakMap<Element, { d: string; t: string[] }>();
  /** Series name for a paint, until the legend colours or the series change. */
  const owners = new Map<string, string>();
  let colors = new Map<string, string>();
  const locale = () => (typeof base.locale === "string" ? base.locale : "en-US");
  const xField = () => fieldOf(isRecord(base.encoding) ? base.encoding.x : undefined);

  const tip = document.createElement("div");
  tip.className = "ck-tip";
  tip.setAttribute("data-ck-tip", "");
  tip.setAttribute("role", "tooltip");
  tip.hidden = true;
  let tipIndex = -1;
  const live = document.createElement("div");
  live.className = "ck-clip";
  live.setAttribute("aria-live", "polite");
  live.setAttribute("data-ck-live", "");
  const showTip = tooltipOn(spec);
  const showCross = crosshairOn(spec);
  const legend = isRecord(spec.legend) && spec.legend.interactive === true;
  const a11y = isRecord(spec.a11y) ? spec.a11y : {};
  // `keys` and `dataTable` are the explicit `true` forms: pointer tracking and the visible table button.
  const keys = a11y.keyboard === true;
  const dataTable = a11y.dataTable === true;
  // Both are on for a client mount unless the spec says `false`. Types with no index model stay out of the tab order.
  const keysOn = keys || (a11y.keyboard !== false && KEY_TYPES.has(spec.type ?? ""));
  const tableOn = a11y.dataTable !== false && (dataTable || KEY_TYPES.has(spec.type ?? ""));
  const zoom = zoomMode(spec);
  const zooming = zoom !== "none";
  const pan = zooming && !(isRecord(spec.interaction) && spec.interaction.pan === false);
  const brush = isRecord(spec.interaction) && spec.interaction.brush === "x";
  const mode = isRecord(spec.tooltip) && spec.tooltip.mode === "nearest" ? "nearest" : "index";
  const selMode = () => {
    const value = isRecord(base.interaction) ? base.interaction.select : 0;
    return value === "point" || value === "series" ? value : 0;
  };
  let picked = copySelection(options.selection);
  let locked = options.selection !== undefined;
  let lit = "";
  let quiet = false;
  let leaveSync = () => {};
  const stack: { spec: InteractSpec; label: string }[] = [];
  let levelLabel = titleOf(spec);
  const focusable = () => keysOn || Boolean(selMode()) || Boolean(drillOf(base));

  if (showTip) host.append(tip);
  if (drillOf(spec)) svg.style.cursor = "pointer";
  if (focusable()) svg.setAttribute("tabindex", "0");
  if (keysOn) host.append(live);
  const offs: (() => void)[] = [];
  const on = (target: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions) => {
    target.addEventListener(type, fn, opts);
    offs.push(() => target.removeEventListener(type, fn, opts));
  };

  function xText(index: number): string {
    const field = xField();
    const raw = field ? table.cell(field, index) : index;
    const format = isRecord(base.encoding) && isRecord(base.encoding.x) ? base.encoding.x.format : undefined;
    const zone = namedZone(base.timezone);
    if (zone) {
      const ms = instantOf(raw);
      if (ms !== null) return format !== undefined ? formatValue(ms, format, locale(), zone) : formatInstant(ms, locale(), zone);
    }
    if (typeof raw === "number") return formatValue(raw, format ?? "number", locale());
    return raw == null ? String(index) : String(raw);
  }

  /** Marks drawn for one row of one series, in document order. */
  function marksAt(name: string, index: number): Element[] {
    peek();
    return (inked.get(String(index)) || []).filter((node) => node.getAttribute("data-ck-name") === name || owner(node) === name);
  }

  function inkAt(name: string, index: number): string | null {
    for (const node of marksAt(name, index)) {
      const fill = node.getAttribute("fill");
      const stroke = node.getAttribute("stroke");
      const ink = fill && fill !== "none" ? fill : stroke && stroke !== "none" ? stroke : "";
      if (ink) return legendPaint(ink, 0);
    }
    return null;
  }

  function entriesAt(index: number, pointerY: number | null): { name: string; text: string; color: string }[] {
    const chosen = tipFields(base);
    const grouped = !chosen && series.some((item) => item.match) && !arcChart(base.type);
    const rows: { name: string; text: string; color: string; raw: number; unit: string }[] = [];
    const yFormat = axisFormat(base, "y");
    const push = (name: string, raw: unknown, color: string, format?: unknown, unit = "") => {
      if (raw == null || raw === "") return;
      const num = typeof raw === "number" ? raw : Number(raw);
      rows.push({
        name,
        text: fmt(raw, format ?? series.find((s) => s.name === name)?.format ?? yFormat, locale()),
        color,
        raw: Number.isFinite(num) ? num : 0,
        unit,
      });
    };
    if (chosen) {
      for (let i = 0; i < chosen.length; i++) {
        const item = chosen[i];
        const known = series.find((s) => s.field === item.field || s.name === item.field);
        if (known && hidden.has(known.name)) continue;
        push(
          item.title || known?.name || item.field,
          table.cell(item.field, index),
          known ? colorFor(known.name, series.indexOf(known)) : "transparent",
          item.format ?? known?.format,
          item.unit ?? "",
        );
      }
      return tint(rows, index);
    }
    if (!grouped) {
      for (let i = 0; i < series.length; i++) {
        const item = series[i];
        if (!hidden.has(item.name)) push(item.name, table.cell(item.field, index), colorFor(item.name, i));
      }
    } else {
      const key = String(table.cell(xField(), index) ?? index);
      for (let i = 0; i < n; i++) {
        if (String(table.cell(xField(), i) ?? i) !== key) continue;
        const name = String(table.cell(series[0]?.match ?? "", i) ?? "");
        if (!name || hidden.has(name)) continue;
        const item = series.find((s) => s.name === name);
        push(name, table.cell(item?.field || series[0]?.field || "", i), colorFor(name, rows.length));
      }
    }
    let best = 0;
    if (mode === "nearest" && rows.length > 1 && pointerY != null) {
      const fraction = box.h ? (pointerY - box.t) / box.h : 0;
      let min = Infinity;
      let max = -Infinity;
      for (const row of rows) {
        if (row.raw < min) min = row.raw;
        if (row.raw > max) max = row.raw;
      }
      const span = max - min || 1;
      let bestDist = Infinity;
      for (let i = 0; i < rows.length; i++) {
        const dist = Math.abs(1 - (rows[i].raw - min) / span - fraction);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      const picked = rows[best];
      return picked ? tint([picked], index) : [];
    }
    return tint(rows, index);
  }

  function tint(
    list: { name: string; text: string; color: string; raw: number }[],
    index: number,
  ): { name: string; text: string; color: string; raw: number }[] {
    for (let i = 0; i < list.length; i++) {
      const row = list[i];
      if (!row) continue;
      const ink = inkAt(row.name, index);
      if (ink) row.color = ink;
      const caption = captionAt(row.name, index);
      if (caption) row.name = `${row.name} · ${caption}`;
    }
    return list;
  }

  function captionAt(name: string, index: number): string {
    for (const node of marksAt(name, index)) if (node.hasAttribute("data-ck-rule")) return node.getAttribute("data-ck-rule") || "";
    return "";
  }

  /** Legend fill for a series name, or the paint that names the same `--ck-series-N`. */
  function colorFor(name: string, index: number): string {
    const known = colors.get(name);
    if (known) return known;
    return paintAt(index);
  }

  /** Mark stroke or bar fill. Used when the chart has no legend swatch to copy. */
  function markPaint(index: number): string {
    const strokes: string[] = [];
    const paths = svg.querySelectorAll("path");
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (path.getAttribute("filter")) continue;
      const stroke = path.getAttribute("stroke");
      if (stroke && stroke !== "none" && path.getAttribute("fill") === "none") strokes.push(stroke);
    }
    if (strokes.length) return strokes[Math.min(index, strokes.length - 1)] || strokes[0];
    const fills: string[] = [];
    const rects = svg.querySelectorAll("rect");
    for (let i = 0; i < rects.length; i++) {
      if (!(Number(rects[i].getAttribute("width")) > 8)) continue;
      const fill = rects[i].getAttribute("fill");
      if (!fill || fill === "none" || fill.startsWith("url(") || fills[fills.length - 1] === fill) continue;
      fills.push(fill);
    }
    if (fills.length) return fills[Math.min(index, fills.length - 1)] || fills[0];
    return "light-dark(#2f6fe4,#4a8ff0)";
  }

  function paintAt(index: number): string {
    const fills = [...colors.values()];
    return fills[index] || markPaint(index);
  }

  /** Legend fill that uses the same line or series token as the mark. */
  function legendPaint(paint: string | null, index: number): string {
    if (!paint) return paintAt(index);
    for (const fill of colors.values()) if (fill === paint) return fill;
    const id = /--ck-(line|series)-(\d+)/.exec(paint);
    if (id) {
      const want = `--ck-${id[1]}-${id[2]}`;
      for (const fill of colors.values()) if (fill.includes(want)) return fill;
      if (id[1] === "line") return paint;
    } else return paint;
    if (colors.size === 0) return paint;
    return paintAt(index);
  }

  function refreshColors(): void {
    owners.clear();
    colors = new Map();
    for (const item of legendItems(svg)) {
      const fill = item.swatch?.getAttribute("fill");
      const ink = fill && fill !== "none" ? fill : item.swatch?.getAttribute("stroke");
      if (ink) colors.set(item.name, ink);
    }
  }

  /** Host and svg boxes, and the scale from viewBox units to host pixels. */
  function frame(): { bounds: DOMRect; rect: DOMRect; sx: number; sy: number } {
    const bounds = host.getBoundingClientRect();
    const rect = svg.getBoundingClientRect();
    const vb = viewBox(svg);
    return { bounds, rect, sx: (rect.width || vb[2] || 1) / (vb[2] || rect.width || 1), sy: (rect.height || vb[3] || 1) / (vb[3] || rect.height || 1) };
  }

  /** Snap on show and while the tip follows the pointer. Ease when the hovered datum changes. */
  function pinTip(left: number, top: number, snap: boolean, index: number): void {
    if (!snap && index >= 0 && index === tipIndex) {
      const dl = Math.abs(left - Number.parseFloat(tip.style.left));
      const dt = Math.abs(top - Number.parseFloat(tip.style.top));
      if (dl < 0.5 && dt < 0.5) return;
    }
    const hop = !snap && !reducedMotion() && index >= 0 && tipIndex >= 0 && index !== tipIndex;
    tipIndex = index;
    if (hop) {
      // Retarget from the in-flight box. A later move on this datum must not cancel it.
      tip.style.removeProperty("transition");
      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
      tip.setAttribute("data-ck-tip-motion", "ease");
      return;
    }
    tip.style.transition = "none";
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
    tip.setAttribute("data-ck-tip-motion", "snap");
    // Pointer-follow charts have no datum index. Leave the snap in place so the tip sticks to the cursor.
    if (reducedMotion() || index < 0) return;
    // Commit the snap so the next datum eases from here, not from 0,0.
    void tip.offsetWidth;
    tip.style.removeProperty("transition");
  }

  function dropTip(): void {
    tip.hidden = true;
    tip.style.transition = "none";
    tipIndex = -1;
  }

  function placeTip(
    clientX: number,
    clientY: number,
    title: string,
    rows: { name: string; text: string; color: string }[],
    marks: { x: number; y: number }[],
    index = -1,
    commit = true,
  ): void {
    if (!showTip) return;
    const snap = tip.hidden || reducedMotion();
    const custom = options.tooltip ?? readTooltip(host);
    if (custom) {
      const body = custom({ title, index, x: title, rows });
      tip.replaceChildren();
      if (body == null || body === "") {
        dropTip();
        return;
      }
      if (typeof body === "string") tip.innerHTML = body;
      else tip.append(body);
    } else {
      const template = tipTemplate(base);
      const rowHtml = (row: { name: string; text: string; color: string; unit?: string }) => {
        if (!template) {
          const shown = row.unit ? `${row.text} ${row.unit}` : row.text;
          return `<div class="ck-row"><i style="background:${row.color}"></i>${esc(row.name)}<b>${esc(shown)}</b></div>`;
        }
        const filled = template.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_all, key: string) => {
          if (key === "x") return title;
          if (key === "name") return row.name;
          if (key === "value") return row.text;
          if (key === "unit") return row.unit ?? "";
          if (index >= 0) {
            const cell = table.cell(key, index);
            if (cell != null && cell !== "") return fmt(cell, undefined, locale());
          }
          return "";
        });
        return `<div class="ck-row"><i style="background:${row.color}"></i>${esc(filled)}</div>`;
      };
      tip.innerHTML = (title && !template ? `<div>${esc(title)}</div>` : "") + rows.map((row) => rowHtml(row)).join("");
    }
    tip.hidden = false;
    if (!commit) return;
    const { bounds, rect, sx, sy } = frame();
    const cluster = marks.length > 0 ? marks : [viewPoint(svg, clientX, clientY)];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < cluster.length; i++) {
      const lx = rect.left + cluster[i].x * sx - bounds.left;
      const ly = rect.top + cluster[i].y * sy - bounds.top;
      if (lx < minX) minX = lx;
      if (lx > maxX) maxX = lx;
      if (ly < minY) minY = ly;
      if (ly > maxY) maxY = ly;
    }
    const width = tip.offsetWidth || 160;
    const height = tip.offsetHeight || 48;
    const gap = 14;
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const place = tipSide(base);
    const plot = plotBox(svg);
    const plotLeft = rect.left + plot.l * sx - bounds.left;
    const plotRight = rect.left + (plot.l + plot.w) * sx - bounds.left;
    const obstacles = obstaclesAt(bounds, rect, sx, sy, plot);
    const anchor = { l: minX - 10, t: minY - 10, r: maxX + 10, b: maxY + 10 };
    const parked = parkTip(place, bounds.width, bounds.height, width, height, midX, midY, minX, minY, maxX, maxY, anchor, obstacles);
    let top = parked ? parked.top : minY - height - gap;
    let left = parked ? parked.left : midX - width / 2;
    if (!parked && !place) {
      const onRight = midX > (plotLeft + plotRight) / 2;
      const clear = sitTip(obstacles, bounds.width, bounds.height, width, height, midX, minY, onRight, plotLeft, plotRight);
      if (clear) {
        left = clear.left;
        top = clear.top;
      } else {
        if (top < 4) top = maxY + gap;
        if (top + height > bounds.height - 4) top = Math.max(4, bounds.height - height - 4);
        const flipped = midX - width - gap;
        left = onRight && flipped >= 4 ? flipped : midX + gap;
        if (left + width > bounds.width - 4) left = Math.max(4, flipped);
        if (left < 4) left = Math.max(4, Math.min(midX + gap, bounds.width - width - 4));
      }
    } else if (!parked) {
      if (place === 2) top = maxY + gap;
      else if (place > 2) {
        left = place === 3 ? minX - width - gap : maxX + gap;
        top = midY - height / 2;
      }
      if (bounds.width > width + 8 && bounds.height > height + 8) {
        left = Math.max(4, Math.min(left, bounds.width - width - 4));
        top = Math.max(4, Math.min(top, bounds.height - height - 4));
      }
      const card = { l: left, t: top, r: left + width, b: top + height };
      if (tipOverlap(card, anchor)) {
        const side = maxX + gap + width < bounds.width - 4 ? maxX + gap : minX - width - gap;
        left = Math.max(4, Math.min(side, bounds.width - width - 4));
        top = Math.max(4, Math.min(minY, bounds.height - height - 4));
      }
    }
    pinTip(left, top, snap, index);
  }

  function moveCross(x: number, title: string): void {
    if (!showCross) {
      publishHover();
      return;
    }
    let line = svg.querySelector("[data-ck-crosshair]");
    if (!line) {
      svg.insertAdjacentHTML("beforeend", `<line data-ck-crosshair class="ck-xhair"/>`);
      line = svg.lastElementChild as Element;
    }
    line.setAttribute("x1", String(x));
    line.setAttribute("x2", String(x));
    line.setAttribute("y1", String(box.t));
    line.setAttribute("y2", String(box.t + box.h));
    const showLabel = isRecord(base.tooltip) && base.tooltip.crosshairLabel === true;
    let label = svg.querySelector("[data-ck-xlabel]");
    if (!showLabel) {
      label?.remove();
      publishHover();
      return;
    }
    if (!label) {
      svg.insertAdjacentHTML("beforeend", `<text data-ck-xlabel class="ck-xlabel"/>`);
      label = svg.lastElementChild as Element;
    }
    const y = tipSide(base) === 2 ? box.t + 14 : box.t + box.h - 6;
    const pad = 36;
    const anchor = x < box.l + pad ? "start" : x > box.l + box.w - pad ? "end" : "middle";
    const lx = anchor === "start" ? x + 4 : anchor === "end" ? x - 4 : x;
    label.setAttribute("x", String(Math.round(lx)));
    label.setAttribute("y", String(Math.round(y)));
    label.setAttribute("text-anchor", anchor);
    label.textContent = title;
    publishHover();
  }

  function hideHover(): void {
    dropTip();
    drop("[data-ck-crosshair],[data-ck-xlabel],[data-ck-dot]");
    clearBars();
    publishHide();
  }

  function clearBars(): void {
    svg.querySelectorAll(".ck-bar-on").forEach((node) => node.classList.remove("ck-bar-on"));
    svg.querySelectorAll("[data-ck-bar-dim]").forEach((node) => node.removeAttribute("data-ck-bar-dim"));
  }

  function isBar(node: Element): boolean {
    // Legend swatches are rects too, and sit within reach of the first category. So is the keyboard's category band.
    if (node.localName !== "rect" || node.closest("defs,clipPath") || node.matches('[data-ck-dot],[data-ck-key^="leg:"]')) return false;
    const fill = node.getAttribute("fill") || "";
    if (!fill || fill === "none" || fill.startsWith("url(")) return false;
    const w = +(node.getAttribute("width") || 0);
    const h = +(node.getAttribute("height") || 0);
    return w > 8 && h > 4 && w < box.w * 0.9;
  }

  /** Light the bars at a category and dim the rest. Returns the lit ones. */
  function barsNear(snapped: number, horizontal: boolean): Element[] {
    const tol = Math.max(hitPx(base), (hover.width / Math.max(1, hover.count)) * 0.49);
    const hits: Element[] = [];
    const rects = svg.querySelectorAll("rect");
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      if (!isBar(rect)) continue;
      const x = +(rect.getAttribute("x") || 0);
      const y = +(rect.getAttribute("y") || 0);
      const w = +(rect.getAttribute("width") || 0);
      const h = +(rect.getAttribute("height") || 0);
      const hot = Math.abs((horizontal ? y + h / 2 : x + w / 2) - snapped) <= tol;
      if (hot) hits.push(rect);
      rect.classList.toggle("ck-bar-on", hot);
      rect.toggleAttribute("data-ck-bar-dim", !hot);
    }
    return hits;
  }

  function placeBarTip(
    clientX: number,
    clientY: number,
    title: string,
    rows: { name: string; text: string; color: string }[],
    hits: Element[],
    index: number,
  ): void {
    const snap = tip.hidden || reducedMotion();
    if (!hits.length) {
      placeTip(clientX, clientY, title, rows, [], index);
      return;
    }
    placeTip(clientX, clientY, title, rows, [], index, false);
    if (tip.hidden) return;
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const node of hits) {
      const x = +(node.getAttribute("x") || 0);
      const y = +(node.getAttribute("y") || 0);
      const w = +(node.getAttribute("width") || 0);
      const h = +(node.getAttribute("height") || 0);
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x + w > x1) x1 = x + w;
      if (y + h > y1) y1 = y + h;
    }
    const { bounds, rect, sx, sy } = frame();
    const width = tip.offsetWidth || 160;
    const height = tip.offsetHeight || 48;
    const cx = rect.left + ((x0 + x1) / 2) * sx - bounds.left;
    const topEdge = rect.top + y0 * sy - bounds.top;
    const bottomEdge = rect.top + y1 * sy - bounds.top;
    let left = cx - width / 2;
    let top = topEdge - height - 8;
    if (horizontal()) {
      const end = rect.left + x1 * sx - bounds.left;
      left = end + 8;
      top = (rect.top + ((y0 + y1) / 2) * sy - bounds.top) - height / 2;
      if (left + width > bounds.width - 4) left = rect.left + x0 * sx - bounds.left - width - 8;
    } else if (top < 4) {
      top = topEdge + 6;
    }
    left = Math.max(4, Math.min(left, Math.max(4, bounds.width - width - 4)));
    top = Math.max(4, Math.min(top, Math.max(4, bounds.height - height - 4)));
    pinTip(left, top, snap, index);
  }

  function xNum(index: number): number | null {
    const field = xField();
    const raw = field ? table.cell(field, index) : index;
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string" && raw.trim() !== "" && Number.isFinite(Number(raw))) return Number(raw);
    return null;
  }

  function xKey(index: number): string {
    const field = xField();
    const raw = field ? table.cell(field, index) : index;
    return raw == null ? String(index) : String(raw);
  }

  function indexForKey(key: string): number {
    if (n < 1) return 0;
    const target = Number(key);
    const first = xNum(0);
    const last = xNum(n - 1);
    if (first != null && last != null && Number.isFinite(target) && n > 32) {
      let loI = 0;
      let hiI = n - 1;
      let best = 0;
      let bestDist = Infinity;
      while (loI <= hiI) {
        const mid = (loI + hiI) >> 1;
        const value = xNum(mid);
        if (value == null) break;
        const dist = Math.abs(value - target);
        if (dist < bestDist) {
          bestDist = dist;
          best = mid;
        }
        if (value === target) return mid;
        if (value < target) loI = mid + 1;
        else hiI = mid - 1;
      }
      return best;
    }
    const field = xField();
    for (let i = 0; i < n; i++) {
      const raw = field ? table.cell(field, i) : i;
      if (String(raw) === key) return i;
    }
    if (!Number.isFinite(target)) return 0;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < n; i++) {
      const value = xNum(i);
      if (value == null) continue;
      const dist = Math.abs(value - target);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  }

  /** Paint the hover state for a row with no pointer: a synced chart, or the keyboard (`keyed` adds the point markers). */
  function showAt(index: number, keyed?: 1): void {
    focus = index;
    const px = crossX(Math.max(0, index - lo));
    const flat = horizontal();
    const bars = barChart(base) && !showCross;
    const hits = bars ? barsNear(px, flat) : [];
    let marks: { x: number; y: number }[] = [];
    if (bars) {
      drop("[data-ck-dot],[data-ck-crosshair]");
      // No rect to light (canvas bars, a bar of zero length): the keyboard shades the category band instead.
      if (keyed && !hits.length) {
        const slot = hover.width / Math.max(1, hover.count);
        const at = px - slot / 2;
        svg.insertAdjacentHTML(
          "beforeend",
          `<rect data-ck-dot x="${flat ? box.l : at}" y="${flat ? at : box.t}" width="${flat ? box.w : slot}" height="${flat ? slot : box.h}" fill="currentColor" fill-opacity=".1" pointer-events="none"/>`,
        );
      }
    } else {
      moveCross(px, xText(index));
      if (keyed) marks = placeDots(px, flat, index);
    }
    if (!showTip) return;
    const rect = svg.getBoundingClientRect();
    const vw = viewBox(svg)[2] || rect.width || 1;
    const clientX = rect.left + (px / vw) * (rect.width || vw);
    const clientY = rect.top + (rect.height || 1) / 2;
    if (bars) placeBarTip(clientX, clientY, xText(index), entriesAt(index, null), hits, index);
    else placeTip(clientX, clientY, xText(index), entriesAt(index, null), marks, index);
  }

  const member: SyncMember = {
    hover(key) {
      quiet = true;
      showAt(indexForKey(key));
      quiet = false;
    },
    hide() {
      quiet = true;
      hideHover();
      quiet = false;
    },
    range(from, to) {
      let start = indexForKey(from);
      let end = indexForKey(to);
      if (end < start) {
        const swap = start;
        start = end;
        end = swap;
      }
      if (end <= start) end = Math.min(n - 1, start + 1);
      if (start === lo && end === hi) return;
      quiet = true;
      lo = start;
      hi = Math.min(n - 1, end);
      redraw();
      quiet = false;
    },
  };

  function bindSync(): void {
    leaveSync();
    const id = syncIdOf(base);
    if (!id) {
      leaveSync = () => {};
      return;
    }
    leaveSync = joinSync(id, member);
  }

  function publishHover(): void {
    const id = syncIdOf(base);
    if (!id || quiet) return;
    syncHover(id, member, xKey(focus));
  }

  function publishHide(): void {
    const id = syncIdOf(base);
    if (!id || quiet) return;
    syncHide(id, member);
  }

  function publishRange(): void {
    const id = syncIdOf(base);
    if (!id || quiet || n < 1) return;
    syncRange(id, member, xKey(lo), xKey(hi));
  }

  /** Remove the hover's own nodes that match. */
  function drop(selector: string): void {
    svg.querySelectorAll(selector).forEach((node) => node.remove());
  }


  function addDot(x: number, y: number, fill: string): { x: number; y: number } {
    const cx = String(Math.round(x * 100) / 100);
    const cy = String(Math.round(y * 100) / 100);
    svg.insertAdjacentHTML("beforeend", `<circle data-ck-dot cx="${cx}" cy="${cy}" r="3.5" fill="${esc(fill)}" stroke="light-dark(#fff,#1c1c1e)" stroke-width="1.5" pointer-events="none"/>`);
    return { x, y };
  }

  function yOnPath(path: Element, x: number): number | null {
    const d = path.getAttribute("d") || "";
    let kept = cuts.get(path);
    if (!kept || kept.d !== d) cuts.set(path, (kept = { d, t: d.split(/[\s,]+/) }));
    const t = kept.t;
    let c = "", x0 = 0, y0 = 0;
    for (let i = 0; i < t.length; i++) {
      const p = t[i];
      if (p === "Z") c = "";
      else if (p === "M" || p === "L" || p === "C") c = p;
      else if (c === "M") {
        x0 = +p;
        y0 = +t[++i];
      } else if (c === "L" || c === "C") {
        const curve = c === "C";
        const x1 = curve ? +t[i + 4] : +p;
        const y1 = curve ? +t[i + 5] : +t[++i];
        if (curve) i += 5;
        if (x1 === x1 && y1 === y1 && (x - x0) * (x - x1) <= 0) {
          return x1 === x0 ? y0 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
        }
        x0 = x1;
        y0 = y1;
      }
    }
    return null;
  }

  function dataDotY(path: Element, index: number): number | null {
    const c = (path as SVGElement).dataset.ckYs?.split(",");
    if (!c) return null;
    const s = +(table.cell(series[+c[4]]?.field || "", index) as number);
    const y = +c[0] + ((s - +c[2]) * (+c[1] - +c[0])) / (+c[3] - +c[2]);
    return Number.isFinite(y) ? y : null;
  }

  function placeDots(snapped: number, horizontal: boolean, index: number): { x: number; y: number }[] {
    drop("[data-ck-dot]");
    const hit = dataHit(svg);
    if (hit && hit.kind !== "scatter") {
      const dots = hit.dots?.(index) ?? [];
      const marks: { x: number; y: number }[] = [];
      for (let i = 0; i < dots.length; i++) marks.push(addDot(dots[i].x, dots[i].y, legendPaint(dots[i].color, i)));
      return marks;
    }
    if (arcChart(base.type) || base.type === "heatmap") return [];
    const marks: { x: number; y: number }[] = [];
    if (!horizontal) {
      const paths = svg.querySelectorAll("path");
      let seen = 0;
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        if (path.closest("defs,clipPath")) continue;
        const stroke = path.getAttribute("stroke");
        if (!stroke || stroke === "none") continue;
        const d = path.getAttribute("d");
        if (!d) continue;
        const y = dataDotY(path, index) ?? yOnPath(path, snapped);
        if (y == null) continue;
        marks.push(addDot(snapped, y, legendPaint(stroke, seen)));
        seen += 1;
      }
    }
    const slot = hover.uniform ? hover.width / Math.max(1, hover.count) : Math.max(24, box.w / 8);
    const tol = Math.max(slot / 2, hitPx(base));
    let best = Infinity;
    const hits: { x: number; y: number; fill: string | null }[] = [];
    const rects = svg.querySelectorAll("rect");
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      if (rect.closest("defs,clipPath")) continue;
      const x = +(rect.getAttribute("x") || 0);
      const y = +(rect.getAttribute("y") || 0);
      const w = +(rect.getAttribute("width") || 0);
      const h = +(rect.getAttribute("height") || 0);
      if (!(w > 12) || !(h > 0) || w > box.w * 0.85) continue;
      const dist = Math.abs((horizontal ? y + h / 2 : x + w / 2) - snapped);
      if (dist > tol) continue;
      const dot = { x: horizontal ? x + w : x + w / 2, y: horizontal ? y + h / 2 : y, fill: rect.getAttribute("fill") };
      if (dist < best - 0.5) {
        best = dist;
        hits.length = 0;
      }
      if (dist <= best + 0.5) hits.push(dot);
    }
    for (let i = 0; i < hits.length; i++) marks.push(addDot(hits[i].x, hits[i].y, legendPaint(hits[i].fill, marks.length)));
    if (marks.length === 0) {
      const circles = svg.querySelectorAll("circle");
      const nearest = new Map<string, { x: number; y: number; dist: number; fill: string }>();
      for (let i = 0; i < circles.length; i++) {
        const circle = circles[i];
        if (circle.getAttribute("data-ck-dot")) continue;
        const cx = Number(circle.getAttribute("cx"));
        const cy = Number(circle.getAttribute("cy"));
        const dist = Math.abs((horizontal ? cy : cx) - snapped);
        if (dist > tol) continue;
        const fill = circle.getAttribute("fill") || "";
        const prev = nearest.get(fill);
        if (!prev || dist < prev.dist) nearest.set(fill, { x: cx, y: cy, dist, fill });
      }
      let seen = 0;
      for (const point of nearest.values()) {
        marks.push(addDot(point.x, point.y, legendPaint(point.fill, seen)));
        seen += 1;
      }
    }
    return marks;
  }

  let dirty = false;
  let ticket = 0;
  function rebuild(): void {
    dirty = false;
    const hit = dataHit(svg);
    const viewN = Math.max(0, hi - lo + 1);
    slotRow = null;
    if (series[0]?.match && !arcChart(base.type)) {
      const slots = new Map<string, number>();
      slotRow = [];
      rowSlot = [];
      for (let i = 0; i < viewN; i++) {
        const key = xKey(lo + i);
        if (!slots.has(key)) slots.set(key, slotRow.push(i) - 1);
        rowSlot[i] = slots.get(key)!;
      }
    }
    box = plotBox(svg);
    stale = true;
    if (hit && hit.kind !== "scatter") {
      bySlot = slotRow?.length === hit.count;
      hover = {
        xs: NO_PIXELS,
        order: null,
        pixels: NO_PIXELS,
        uniform: false,
        count: hit.count,
        left: hit.plotLeft,
        width: hit.plotWidth,
        at: (px) => hit.indexAt(px),
        pixel: (index) => hit.pixelAt(index),
      };
      refreshColors();
      return;
    }
    const values = numericValues(base, table, data);
    const slice = values && viewN ? (lo === 0 && values.length === viewN ? values : values.subarray(lo, hi + 1)) : null;
    bySlot = !slice && !!slotRow;
    // Categories run down the plot on horizontal bars, and take one slot each however many rows they span.
    const flat = horizontal();
    hover = buildHoverIndex(bySlot ? slotRow!.length : viewN, flat ? box.t : box.l, flat ? box.h : box.w, slice);
    refreshColors();
  }

  /** Read the drawn marks. A motion flight rewrites the SVG every frame, so nothing is kept while one runs. */
  function look(): void {
    stale = !!flight;
    seen = scanMarks(svg, plotBox(svg), stale);
    inked = new Map();
    svg.querySelectorAll("[data-ck-i]").forEach((mark) => {
      const key = mark.getAttribute("data-ck-i")!;
      (inked.get(key) || inked.set(key, []).get(key)!).push(mark);
    });
  }

  /** Make the read current. Mid-flight it is read again for each event, and again for the obstacles (`force`), which must see the dots just placed. */
  function peek(force?: 1): void {
    arm(1);
    if ((flight || stale) && (force || !fresh)) {
      look();
      if ((fresh = stale)) queueMicrotask(() => (fresh = false));
    }
  }

  function obstaclesAt(bounds: DOMRect, rect: DOMRect, sx: number, sy: number, plot: Box) {
    peek(1);
    return tipObstacles(svg, rect, bounds, sx, sy, plot, seen!);
  }

  /** Idle work after a draw, so the first hover does not pay for it: read the marks, place the obstacles, split the line paths. */
  function prime(): void {
    if (!showTip) return;
    const { bounds, rect, sx, sy } = frame();
    obstaclesAt(bounds, rect, sx, sy, plotBox(svg));
    if (!showCross) return;
    svg.querySelectorAll("path[stroke]").forEach((path) => yOnPath(path, NaN));
  }

  /** Row offset from `lo` under a pixel along the category axis. */
  function rowOf(px: number): number {
    const slot = lookupIndex(hover, px);
    return bySlot ? slotRow![slot] ?? 0 : slot;
  }

  function rowAtPoint(point: { x: number; y: number }): number {
    arm(1);
    return Math.min(n - 1, Math.max(0, lo + rowOf(horizontal() ? point.y : point.x)));
  }
  function arm(now?: 1): void {
    if (now) {
      if (dirty) rebuild();
      return;
    }
    const mine = ++ticket;
    dirty = true;
    const go = () => {
      if (mine !== ticket) return;
      if (dirty) rebuild();
      // The first read is now. A later draw is read once it has stood for a moment, so a chart that keeps updating is not read on every frame.
      setTimeout(() => mine === ticket && prime(), seen ? 200 : 0);
    };
    const ric = globalThis.requestIdleCallback;
    ric ? ric(go, { timeout: 400 }) : setTimeout(go);
  }

  /** Pixel centre of a row offset along the category axis: x, or y on horizontal bars. */
  function crossX(local: number): number {
    arm(1);
    if (bySlot) local = rowSlot[local] ?? 0;
    if (hover.pixel) return hover.pixel(local);
    return hover.pixels[local] ?? box.l;
  }

  function dim(): void {
    if (!legend) return;
    drop("[data-ck-hidden-key]");
    const items = legendItems(svg);
    for (const item of items) {
      const off = hidden.has(item.name);
      item.text.setAttribute("opacity", off ? "0.35" : "1");
      item.swatch?.setAttribute("opacity", off ? "0.35" : "1");
      item.text.style.cursor = "pointer";
    }
    if (!arcChart(base.type)) return;
    const visible = new Set(items.map((item) => item.name));
    const last = items[items.length - 1];
    let y = last ? Number(last.text.getAttribute("y")) + 20 : 28;
    const x = last?.swatch ? Number(last.swatch.getAttribute("x")) : 8;
    for (const item of series) {
      if (!hidden.has(item.name) || visible.has(item.name)) continue;
      const name = esc(item.name);
      svg.insertAdjacentHTML("beforeend", `<rect data-ck-hidden-key="${name}" x="${x}" y="${y - 9}" width="10" height="10" rx="2" fill="var(--ck-series-1, #2f6fe4)" opacity="0.35"/><text data-ck-hidden-key="${name}" x="${x + 16}" y="${y}" font-size="12" opacity="0.35">${name}</text>`);
      (svg.lastElementChild as SVGTextElement).style.cursor = "pointer";
      y += 20;
    }
  }

  /** The table is built in `interact-extra`. This reads one data row as cells: x, the series name for long data, then the values. */
  let fillTable: typeof import("./interact-extra").fillTable | undefined;
  function paintTable(): void {
    const first = series[0];
    if (!fillTable || !first) return;
    const x = xField() || "x";
    const long = first.match;
    const split = long && long !== x;
    fillTable(svg, base.title, long ? (split ? [x, long, first.field] : [x, first.field]) : [x].concat(series.map((item) => item.name)), n, (i) => {
      const cells = [xText(i)];
      if (split) cells.push(String(table.cell(long, i) ?? ""));
      for (const item of long ? [first] : series) cells.push(fmt(table.cell(item.field, i), item.format, locale()));
      return cells;
    });
  }

  function project(): InteractSpec {
    const rows = materialize(data);
    if (!rows) return base;
    const ranged = lo > 0 || hi < n - 1;
    let kept = ranged ? rows.slice(lo, hi + 1) : rows;
    if (hidden.size > 0 && kept.length && isRecord(kept[0])) {
      const drop = arcChart(base.type);
      kept = kept.flatMap((row) => {
        const record = row as Record<string, unknown>;
        if (drop && series.some((item) => hidden.has(item.name) && item.match && String(record[item.match]) === item.name)) return [];
        if (!series.some((item) => hidden.has(item.name) && !item.match)) return [record];
        const copy = { ...record };
        for (const item of series) if (hidden.has(item.name) && !item.match) copy[item.field] = null;
        return [copy];
      });
    } else if (!ranged && hidden.size === 0) return base;
    return { ...base, data: kept };
  }

  function stopFlight(snap: boolean): void {
    const current = flight;
    flight = null;
    current?.cancel(snap);
  }

  function paintHost(markup: string): void {
    stopFlight(true);
    const after = () => {
      if (focusable()) svg.setAttribute("tabindex", "0");
      dim();
      paintPick();
      arm();
      queueCanvas(host, base);
      refreshNavigator(host);
    };
    const motion = svg.getAttribute("data-ck-render") === "canvas" ? 0 : motionMs(base, n);
    if (motion > 0 && host instanceof HTMLElement) {
      flight = playMotion(host, markup, motion, () => {
        flight = null;
        patchSvg(host as PatchHost, markup, 0);
        const nextSvg = host.querySelector("svg");
        if (nextSvg instanceof SVGSVGElement) svg = nextSvg;
        after();
      });
      return;
    }
    patchSvg(host as PatchHost, markup, durationMs(base, n), easeOf(base));
    after();
  }

  function redraw(markup?: string): void {
    stopFlight(true);
    const partial = lo > 0 || hi < n - 1 || hidden.size > 0;
    const nextSpec = partial ? project() : base;
    if (svg.getAttribute("data-ck-scene") === "1" && paintScene(host, nextSpec)) {
      const nextSvg = host.querySelector("svg");
      if (nextSvg instanceof SVGSVGElement) svg = nextSvg;
      if (focusable()) svg.setAttribute("tabindex", "0");
      dim();
      paintPick();
      arm();
      refreshNavigator(host);
      return;
    }
    const next = partial ? options.render(nextSpec) : markup ?? options.render(base);
    patchSvg(host as PatchHost, next, durationMs(base, n), easeOf(base));
    if (focusable()) svg.setAttribute("tabindex", "0");
    dim();
    paintPick();
    arm();
    queueCanvas(host, base);
    refreshNavigator(host);
  }

  function choose(next: Selection): void {
    if (!locked) picked = next;
    paintPick();
    emit("selectionchange", next);
  }

  function addKey(event: MouseEvent | KeyboardEvent): boolean {
    return event.shiftKey || event.metaKey || event.ctrlKey;
  }

  function togglePoint(name: string, index: number, add: boolean): void {
    const has = picked.points.some((point) => point.series === name && point.index === index);
    const points = add
      ? has
        ? picked.points.filter((point) => point.series !== name || point.index !== index)
        : picked.points.concat({ series: name, index })
      : has && picked.points.length === 1
        ? []
        : [{ series: name, index }];
    choose({ points, series: [] });
  }

  function toggleSeries(name: string, add: boolean): void {
    const has = picked.series.includes(name);
    const names = add ? (has ? picked.series.filter((item) => item !== name) : picked.series.concat(name)) : has && picked.series.length === 1 ? [] : [name];
    choose({ points: [], series: names });
  }

  function rowAt(index: number): unknown {
    if (Array.isArray(data) || ArrayBuffer.isView(data)) return (data as ArrayLike<unknown>)[index];
    if (!isRecord(data) || !isRecord(data.columns) || index < 0) return null;
    const columns = data.columns as Record<string, ArrayLike<unknown>>;
    const row: Record<string, unknown> = {};
    for (const key of Object.keys(columns)) row[key] = columns[key][index];
    return row;
  }

  function payload(name: string, index: number, color?: string): ClickDetail {
    const item = series.find((entry) => entry.name === name);
    const field = item?.field ?? "";
    const x = index < 0 ? null : xField() ? table.cell(xField(), index) : index;
    let y: unknown = null;
    if (item && index >= 0) {
      if (!item.match) y = table.cell(field, index);
      else {
        for (let i = 0; i < n; i++) {
          if (String(table.cell(item.match, i)) !== name) continue;
          y = table.cell(field, i);
          if (!xField() || table.cell(xField(), i) === x) break;
        }
      }
    }
    return { series: name, datum: y, index, x, y, value: y, row: index < 0 ? null : rowAt(index), ...(color ? { color } : {}) };
  }

  function legendTarget(target: Element | null): { name: string; index: number } | null {
    const text =
      target?.closest?.("text") ||
      (target?.localName === "rect" && target.getAttribute("width") === "10" ? target.nextElementSibling : null);
    if (!text) return null;
    const item = legendItems(svg).find((entry) => entry.text === text);
    if (!item) return null;
    const index = series.findIndex((entry) => entry.name === item.name);
    return index < 0 ? null : { name: item.name, index };
  }

  function owner(node: Element): string {
    const named = node.getAttribute("data-ck-name");
    if (named) return named;
    const ys = node.getAttribute("data-ck-ys");
    if (ys) {
      const index = +ys.slice(ys.lastIndexOf(",") + 1);
      if (series[index]) return series[index].name;
    }
    const stroke = node.getAttribute("stroke");
    const paint = stroke && stroke !== "none" ? stroke : node.getAttribute("fill");
    if (!paint || paint === "none") return "";
    let name = owners.get(paint);
    if (name === undefined) owners.set(paint, (name = paintOwner(paint)));
    return name;
  }

  function paintOwner(paint: string): string {
    for (const [name, fill] of colors) if (fill === paint) return name;
    const id = /--ck-(line|series)-(\d+)/.exec(paint);
    if (!id) return "";
    const want = `--ck-${id[1]}-${id[2]}`;
    for (const [name, fill] of colors) if (fill.includes(want)) return name;
    if (id[1] === "line") {
      const seriesToken = `--ck-series-${id[2]}`;
      for (const [name, fill] of colors) if (fill.includes(seriesToken)) return name;
    }
    return series[+id[2] - 1]?.name ?? "";
  }

  function indexAt(clientX: number, clientY: number): number {
    arm(1);
    return rowAtPoint(viewPoint(svg, clientX, clientY));
  }

  function nodeInk(node: Element): string | undefined {
    const fill = node.getAttribute("fill");
    if (fill && fill !== "none") return fill;
    const stroke = node.getAttribute("stroke");
    if (stroke && stroke !== "none") return stroke;
    return undefined;
  }

  function hitOf(event: MouseEvent): { kind: "point" | "series"; name: string; index: number; color?: string } | null {
    const node = (event.target as Element | null)?.closest?.("path,circle,rect");
    if (!node || node.closest("defs,clipPath")) return null;
    if (node.hasAttribute("data-ck-dot") || node.hasAttribute("data-ck-pick")) return null;
    if (node.localName === "rect" && (node.getAttribute("width") === "10" || node.getAttribute("width") === "100%")) return null;
    let kind: "point" | "series" = node.localName === "path" ? "series" : "point";
    let name = "";
    let index = 0;
    if (node.localName === "path" && node.hasAttribute("aria-label") && arcChart(base.type)) {
      const named = node.getAttribute("data-ck-name");
      const label = node.getAttribute("aria-label") || "";
      const cut = label.indexOf(": ");
      name = named || (cut >= 0 ? label.slice(0, cut) : label).trim();
      index = Math.max(0, series.findIndex((entry) => entry.name === name));
    } else {
      name = owner(node);
      const raw = node.getAttribute("data-ck-i");
      index = raw && !raw.includes(" ") ? +raw : indexAt(event.clientX, event.clientY);
    }
    if (!name) name = series.find((item) => !hidden.has(item.name))?.name || series[0]?.name || "";
    if (!name) return null;
    const picking = selMode();
    if (picking === "point") kind = "point";
    else if (picking === "series") kind = "series";
    return { kind, name, index, color: nodeInk(node) };
  }

  function paintPick(): void {
    arm(1);
    refreshColors();
    const picking = selMode();
    const hot = lit ? [lit] : picking === "series" ? picked.series : picking === "point" ? picked.points.map((point) => point.series) : [];
    const on = hot.length > 0;
    const nodes = svg.querySelectorAll("path,circle,rect");
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.closest("defs,clipPath") || node.hasAttribute("data-ck-dot") || node.hasAttribute("data-ck-pick") || node.hasAttribute("data-ck-crosshair")) continue;
      if (node.localName === "rect" && (node.getAttribute("width") === "10" || node.getAttribute("width") === "100%")) continue;
      const name = owner(node);
      const raw = node.getAttribute("data-ck-i");
      const one = raw && !raw.includes(" ") ? +raw : -1;
      const dimmed =
        !name || !on
          ? false
          : lit
            ? name !== lit
            : picking === "series"
              ? !picked.series.includes(name)
              : picking === "point"
                ? one >= 0
                  ? !picked.points.some((point) => point.series === name && point.index === one)
                  : !hot.includes(name)
                : false;
      if (dimmed) node.setAttribute("data-ck-dim", "");
      else node.removeAttribute("data-ck-dim");
    }
    const items = legendItems(svg);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (hidden.has(item.name)) continue;
      const dimmed = on && !hot.includes(item.name);
      if (dimmed) {
        item.text.setAttribute("data-ck-dim", "");
        item.swatch?.setAttribute("data-ck-dim", "");
      } else {
        item.text.removeAttribute("data-ck-dim");
        item.swatch?.removeAttribute("data-ck-dim");
      }
    }
    drop("[data-ck-pick]");
    svg.querySelectorAll(".ck-pick").forEach((node) => node.classList.remove("ck-pick"));
    if (picking !== "point") {
      queueCanvas(host);
      return;
    }
    // This runs right after a redraw, before the redraw is read, so the ring's ink is read from the new marks.
    stale = true;
    for (let i = 0; i < picked.points.length; i++) {
      const point = picked.points[i];
      const x = hover.pixels[point.index - lo] ?? box.l;
      let bar: Element | null = null;
      let best = 48;
      const rects = svg.querySelectorAll("rect");
      for (let r = 0; r < rects.length; r++) {
        const rect = rects[r];
        if (owner(rect) !== point.series) continue;
        const dist = Math.abs(+(rect.getAttribute("x") || 0) + +(rect.getAttribute("width") || 0) / 2 - x);
        if (dist < best) {
          best = dist;
          bar = rect;
        }
      }
      if (arcChart(base.type)) {
        const paths = svg.querySelectorAll("path[data-ck-name]");
        for (let p = 0; p < paths.length; p++) {
          const path = paths[p];
          if (!path || path.getAttribute("data-ck-name") !== point.series) continue;
          path.classList.add("ck-pick");
          const fill = path.getAttribute("fill");
          if (fill && fill !== "none") (path as SVGElement).style.stroke = fill;
        }
        continue;
      }
      if (bar) {
        bar.classList.add("ck-pick");
        const fill = bar.getAttribute("fill");
        if (fill && fill !== "none") (bar as SVGElement).style.stroke = fill;
        continue;
      }
      let y = box.t + box.h / 2;
      const paths = svg.querySelectorAll("path");
      for (let p = 0; p < paths.length; p++) {
        if (owner(paths[p]) !== point.series) continue;
        const found = yOnPath(paths[p], x);
        if (found != null) {
          y = found;
          break;
        }
      }
      const ink = marksAt(point.series, point.index)[0]?.getAttribute("fill");
      const ring = ink && ink !== "none" ? ` style="stroke:${ink}"` : "";
      svg.insertAdjacentHTML("beforeend", `<circle data-ck-pick class="ck-pick"${ring} cx="${Math.round(x)}" cy="${Math.round(y)}" r="5" fill="none" pointer-events="none"/>`);
    }
    queueCanvas(host);
  }

  function emit(name: string, detail: unknown): void {
    host.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  }

  function rangeDetail() {
    return { from: xText(lo), to: xText(hi), start: lo, end: hi };
  }

  function zoomAt(local: number, factor: number): void {
    const len = hi - lo + 1;
    let next = Math.round(len * factor);
    next = Math.max(2, Math.min(n, next));
    const anchor = lo + Math.min(len - 1, Math.max(0, local));
    const rel = len <= 1 ? 0 : (anchor - lo) / len;
    let start = Math.round(anchor - rel * next);
    let end = start + next - 1;
    if (start < 0) {
      end -= start;
      start = 0;
    }
    if (end > n - 1) {
      start -= end - (n - 1);
      end = n - 1;
    }
    start = Math.max(0, start);
    if (end <= start) return;
    if (start === lo && end === hi) return;
    lo = start;
    hi = end;
    publishRange();
    redraw();
    emit("rangechange", rangeDetail());
  }

  function resetRange(): void {
    if (lo === 0 && hi === n - 1) return;
    lo = 0;
    hi = Math.max(0, n - 1);
    publishRange();
    redraw();
    emit("rangechange", rangeDetail());
  }

  function hoverMove(event: PointerEvent | MouseEvent): void {
    if (pinned) return;
    arm(1);
    if (base.type === "waterfall") {
      const mark = (event.target as Element | null)?.closest?.("[data-ck-mark]");
      if (!mark || mark.getAttribute("data-ck-mark") === "connector") {
        hideHover();
        return;
      }
      const label = mark.getAttribute("aria-label") || "";
      const cut = label.indexOf(": ");
      const name = mark.getAttribute("data-ck-name") || (cut >= 0 ? label.slice(0, cut) : label).trim();
      const text = cut >= 0 ? label.slice(cut + 2) : label;
      placeTip(event.clientX, event.clientY, name, [{ name, text, color: legendPaint(mark.getAttribute("fill"), 0) }], [viewPoint(svg, event.clientX, event.clientY)]);
      return;
    }
    if (arcChart(base.type)) {
      const path = (event.target as Element | null)?.closest?.("path[aria-label]");
      if (!path) {
        hideHover();
        return;
      }
      const label = path.getAttribute("aria-label") || "";
      const cut = label.indexOf(": ");
      const name = (cut >= 0 ? label.slice(0, cut) : label).trim();
      const text = cut >= 0 ? label.slice(cut + 2) : label;
      let rows = [{ name, text, color: legendPaint(path.getAttribute("fill"), 0) }];
      if (tipFields(base)) {
        const slices = svg.querySelectorAll("path[aria-label]");
        let index = 0;
        for (let i = 0; i < slices.length; i++) if (slices[i] === path) index = i;
        rows = entriesAt(index, null);
      }
      placeTip(event.clientX, event.clientY, name, rows, [viewPoint(svg, event.clientX, event.clientY)]);
      return;
    }
    if (barChart(base) && !showCross) {
      if (!showTip && !keys) return;
      const point = viewPoint(svg, event.clientX, event.clientY);
      const flat = horizontal();
      const index = rowAtPoint(point);
      focus = index;
      const hits = barsNear(crossX(index - lo), flat);
      drop("[data-ck-dot],[data-ck-crosshair],[data-ck-xlabel]");
      if (showTip) placeBarTip(event.clientX, event.clientY, xText(index), entriesAt(index, point.y), hits, index);
      publishHover();
      return;
    }
    if (!showTip && !showCross && !keys) return;
    const point = viewPoint(svg, event.clientX, event.clientY);
    const sceneHit = dataHit(svg);
    if (sceneHit?.kind === "scatter" && sceneHit.nearest) {
      const nearest = sceneHit.nearest(point.x, point.y);
      if (!nearest) {
        hideHover();
        return;
      }
      focus = nearest.index;
      moveCross(nearest.x, xText(nearest.index));
      drop("[data-ck-dot]");
      const marks = [addDot(nearest.x, nearest.y, legendPaint(nearest.color, 0))];
      if (showTip) placeTip(event.clientX, event.clientY, nearest.name || xText(nearest.index), entriesAt(nearest.index, nearest.y), marks, nearest.index);
      return;
    }
    const index = rowAtPoint(point);
    focus = index;
    const title = xText(index);
    const rows = entriesAt(index, point.y);
    const px = crossX(index - lo);
    moveCross(px, title);
    const marks = placeDots(px, horizontal(), index);
    if (showTip) placeTip(event.clientX, event.clientY, title, rows, marks, index);
  }

  arm();
  paintTable();
  fade(svg, durationMs(spec, n), "0", easeOf(spec));
  on(host, "pointerdown", () => {
    if (flight) stopFlight(true);
  }, { capture: true });
  if (picked.points.length || picked.series.length) paintPick();

  let pinned = false;
  if (showTip || showCross) {
    on(svg, "pointermove", hoverMove as EventListener);
    on(svg, "pointerleave", () => {
      if (!pinned) hideHover();
    });
  }
  if (showTip && isRecord(base.tooltip) && base.tooltip.pin === true) {
    on(svg, "pointerdown", ((event: PointerEvent) => {
      if (pinned) {
        pinned = false;
        tip.removeAttribute("data-ck-pin");
        hideHover();
        return;
      }
      hoverMove(event);
      pinned = true;
      tip.setAttribute("data-ck-pin", "1");
    }) as EventListener);
    on(window, "keydown", ((event: KeyboardEvent) => {
      if (event.key !== "Escape" || !pinned) return;
      pinned = false;
      tip.removeAttribute("data-ck-pin");
      hideHover();
    }) as EventListener);
  }
  if (legend) dim();
  on(svg, "click", ((event: MouseEvent) => {
    if (turnLegendPage(svg, event.target as Element | null)) return;
    const legendItem = legendTarget(event.target as Element | null);
    if (legendItem) {
      emit("legendclick", { series: legendItem.name, datum: null, index: legendItem.index, x: null, y: null, value: null, row: null });
      if (!legend) return;
      if (hidden.has(legendItem.name)) hidden.delete(legendItem.name);
      else hidden.add(legendItem.name);
      emit("legendtoggle", { index: legendItem.index, hidden: hidden.has(legendItem.name), name: legendItem.name });
      redraw();
      return;
    }
    const hit = hitOf(event);
    if (!hit) {
      if (selMode() && (picked.points.length || picked.series.length)) choose(copySelection(null));
      return;
    }
    emit(hit.kind === "point" ? "pointclick" : "seriesclick", payload(hit.name, hit.index, hit.color));
    if (tryDrill(hit.name, hit.index)) return;
    if (selMode() === "point" && hit.kind === "point") togglePoint(hit.name, hit.index, addKey(event));
    else if (selMode() === "series") toggleSeries(hit.name, addKey(event));
  }) as EventListener);
  on(svg, "pointerover", ((event: PointerEvent) => {
    const name = legendTarget(event.target as Element | null)?.name ?? "";
    if (name === lit) return;
    lit = name;
    paintPick();
  }) as EventListener);
  on(svg, "keydown", ((event: KeyboardEvent) => {
    if ((event.key === "Enter" || event.key === " ") && turnLegendPage(svg, event.target as Element | null)) {
      event.preventDefault();
      return;
    }
    if (event.key === "Escape") {
      if (stack.length) {
        event.preventDefault();
        popTo(stack.length - 1);
        return;
      }
      if (selMode() && (picked.points.length || picked.series.length)) {
        event.preventDefault();
        choose(copySelection(null));
      }
      return;
    }
    if (event.key !== "Enter" && event.key !== " ") return;
    const slice = svg.querySelector("[data-ck-kf]");
    if (slice) {
      // A slice under keyboard focus is clicked as itself, so the event names that slice.
      event.preventDefault();
      slice.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      return;
    }
    // Up and Down narrow the reading to one series (`lit`). Enter then acts on that series, else on the first visible one.
    const name = series.find((item) => item.name === lit && !hidden.has(lit))?.name || series.find((item) => !hidden.has(item.name))?.name || series[0]?.name || "";
    if (!name) return;
    event.preventDefault();
    emit("pointclick", payload(name, focus, inkAt(name, focus) ?? undefined));
    if (tryDrill(name, focus)) return;
    if (selMode() === "point") togglePoint(name, focus, addKey(event));
    else if (selMode() === "series") toggleSeries(name, addKey(event));
  }) as EventListener);

  const formats = exportFormats(spec);
  let exportStop = () => {};
  let specNow: { data?: unknown } = spec;
  if (formats.length) {
    void import("./export-menu").then((mod) => {
      if (!alive) return;
      exportStop = mod.armExport(svg, () => specNow, formats);
    });
  }

  const wantsExtra = zooming || brush || keysOn || tableOn || navigatorOn(spec) || Boolean(drillOf(spec));
  const ready: Promise<void> = wantsExtra
    ? import("./interact-extra").then((mod) => {
        if (!alive) return;
        if (tableOn) fillTable = mod.fillTable;
        mod.armExtras([
          svg,
          on,
          zooming,
          pan,
          brush,
          keysOn || (a11y.keyboard !== false && Boolean(drillOf(spec))),
          tableOn ? (dataTable ? 2 : 1) : 0,
          showTip,
          () => alive,
          (clientX, clientY) => viewPoint(svg, clientX, clientY),
          (x) => (arm(1), rowOf(x)),
          zoomAt,
          resetRange,
          () => redraw(),
          emit,
          rangeDetail,
          () => box,
          () => ({ lo, hi, n }),
          (start, end) => {
            lo = start;
            hi = end;
            // A window that ends inside a category keeps that category's other series rows.
            if (series[0]?.match) while (hi < n - 1 && xKey(hi + 1) === xKey(hi)) hi++;
            publishRange();
          },
          showAt,
          hideHover,
          entriesAt,
          placeTip,
          xText,
          () => focus,
          (value) => {
            focus = value;
          },
          (text) => {
            live.textContent = text;
          },
          paintTable,
          navigatorOn(spec),
          () => overview(),
          (name) => {
            lit = name;
            paintPick();
          },
          (row, by) => {
            arm(1);
            const next = slotRow ? slotRow[rowSlot[row - lo] + by] : row - lo + by;
            return next === undefined ? -1 : lo + next;
          },
        ]);
      })
    : Promise.resolve();

  const initial = isRecord(spec.interaction) ? spec.interaction.initialRange : 0;
  if (Array.isArray(initial) && n > 1) {
    const cmp = (a: unknown, b: unknown) =>
      typeof a === "number" && typeof b === "number" ? a - b : +(String(a) > String(b)) - +(String(a) < String(b));
    let start = 0;
    let end = n - 1;
    for (let i = 0; i < n; i++) {
      const raw = xField() ? table.cell(xField(), i) : i;
      if (cmp(raw, initial[0]) >= 0 && !start && i) start = i;
      if (cmp(raw, initial[1]) <= 0) end = i;
    }
    if (end > start) {
      lo = start;
      hi = end;
      publishRange();
      redraw();
    }
  }

  function overview(): { samples: number[]; start: number; end: number } {
    const enc = isRecord(base.encoding) ? base.encoding : {};
    const y = enc.y;
    const field = Array.isArray(y) ? fieldOf(y[0]) : fieldOf(y);
    const samples: number[] = [];
    const empty = { samples, start: 0, end: 1 };
    if (!field || n < 1) return empty;
    const buckets = Math.min(80, n);
    const step = n / buckets;
    for (let b = 0; b < buckets; b++) {
      const from = Math.floor(b * step);
      const to = Math.min(n, Math.max(from + 1, Math.floor((b + 1) * step)));
      let loV = Infinity;
      let hiV = -Infinity;
      for (let i = from; i < to; i++) {
        const raw = table.cell(field, i);
        const num = typeof raw === "number" ? raw : Number(raw);
        if (num !== num) continue;
        if (num < loV) loV = num;
        if (num > hiV) hiV = num;
      }
      samples.push(loV === Infinity ? Number.NaN : loV, hiV === -Infinity ? Number.NaN : hiV);
    }
    const x0 = xNum(0);
    const x1 = xNum(n - 1);
    const span = x0 !== null && x1 !== null ? x1 - x0 : 0;
    if (span > 0 && x0 !== null) {
      const a = xNum(lo);
      const b = xNum(hi);
      if (a !== null && b !== null) {
        const start = Math.min(1, Math.max(0, (Math.min(a, b) - x0) / span));
        const end = Math.min(1, Math.max(start, (Math.max(a, b) - x0) / span));
        return { samples, start, end };
      }
    }
    const count = Math.max(1, n);
    return { samples, start: lo / count, end: Math.min(1, (hi + 1) / count) };
  }

  function mountCrumb(): void {
    const existing = host.querySelector("[data-ck-crumb]");
    if (!stack.length) {
      existing?.remove();
      return;
    }
    const nav = existing instanceof HTMLElement ? existing : document.createElement("nav");
    nav.className = "ck-crumb";
    nav.setAttribute("data-ck-crumb", "");
    nav.setAttribute("aria-label", "Drilldown");
    const parts = [`<button type="button" data-ck-back>Back</button>`];
    for (let i = 0; i < stack.length; i++) parts.push(`<button type="button" data-ck-level="${i}">${esc(stack[i].label)}</button>`);
    parts.push(`<span aria-current="page">${esc(levelLabel)}</span>`);
    nav.innerHTML = parts.join("");
    if (!nav.parentElement) host.insertBefore(nav, host.firstChild);
  }

  function applyBase(next: InteractSpec): void {
    specNow = next;
    read(next);
    lo = 0;
    hi = Math.max(0, n - 1);
    hidden.clear();
    focus = 0;
    picked = copySelection(null);
    svg.style.cursor = drillOf(next) ? "pointer" : "";
    bindSync();
    redraw();
    mountCrumb();
  }

  function popTo(index: number): void {
    const next = stack[index];
    if (!next) return;
    levelLabel = next.label;
    stack.length = index;
    applyBase(next.spec);
  }

  function childFor(name: string, index: number): { key: string; spec: InteractSpec } | null {
    const dd = drillOf(base);
    if (!dd || !isRecord(dd.children)) return null;
    const keyField = typeof dd.key === "string" && dd.key ? dd.key : xField();
    const guesses = [name];
    if (keyField && index >= 0 && index < n) {
      const raw = table.cell(keyField, index);
      if (raw != null && String(raw) !== "") guesses.unshift(String(raw));
    }
    for (const key of guesses) {
      const child = dd.children[key];
      if (isRecord(child) && typeof child.type === "string" && child.type) return { key, spec: child as InteractSpec };
    }
    return null;
  }

  function tryDrill(name: string, index: number): boolean {
    const found = childFor(name, index);
    if (!found) return false;
    stack.push({ spec: base, label: levelLabel });
    levelLabel = found.key;
    applyBase(found.spec);
    return true;
  }

  bindSync();
  on(host, "click", ((event: MouseEvent) => {
    const target = event.target as Element | null;
    if (target?.closest?.("[data-ck-back]")) {
      popTo(stack.length - 1);
      return;
    }
    const crumb = target?.closest?.("[data-ck-level]");
    if (!crumb) return;
    popTo(Number(crumb.getAttribute("data-ck-level")));
  }) as EventListener);
  on(host, "keydown", ((event: KeyboardEvent) => {
    if (event.key !== "Escape" || !stack.length || event.target === svg) return;
    event.preventDefault();
    popTo(stack.length - 1);
  }) as EventListener);

  queueCanvas(host, base);

  const widthFixed = isRecord(spec.size) && typeof spec.size.width === "number";
  const rules = isRecord(spec.layout) && Array.isArray(spec.layout.breakpoints) ? spec.layout.breakpoints : null;
  if (!widthFixed && rules && rules.length && typeof ResizeObserver !== "undefined") {
    let seenRule: string | null = null;
    breakWatch = new ResizeObserver(() => {
      if (!alive) return;
      const width = Math.round((host as HTMLElement).clientWidth);
      if (!(width > 0)) return;
      const id = breakKey(rules, width);
      if (id === seenRule) return;
      seenRule = id;
      const size = isRecord(base.size) ? { ...base.size, width } : { width };
      patchSvg(host as PatchHost, options.render({ ...base, size }));
      const nextSvg = host.querySelector("svg");
      if (nextSvg instanceof SVGSVGElement) svg = nextSvg;
      arm();
    });
    breakWatch.observe(host);
  }

  return {
    update(next, markup) {
      if (!alive) return;
      specNow = next;
      const follow = lo === 0 && (n === 0 || hi === n - 1);
      read(next);
      if (follow) {
        lo = 0;
        hi = Math.max(0, n - 1);
      } else if (hi >= n) hi = Math.max(0, n - 1);
      if (lo > hi) lo = 0;
      if (markup === null) {
        arm();
        paintTable();
        return;
      }
      if (lo === 0 && hi === n - 1 && hidden.size === 0) {
        paintHost(markup || options.render(base));
        paintTable();
        return;
      }
      redraw(markup);
      paintTable();
    },
    setSelection(selection) {
      if (!alive) return;
      locked = true;
      picked = copySelection(selection);
      paintPick();
    },
    destroy() {
      if (!alive) return;
      alive = false;
      stopFlight(false);
      ticket++;
      breakWatch?.disconnect();
      for (const off of offs) off();
      tip.remove();
      live.remove();
      exportStop();
      leaveSync();
      unbindNavigator(host);
      host.querySelector("[data-ck-table-wrap]")?.remove();
      host.querySelector("[data-ck-navigator]")?.remove();
      host.querySelector("[data-ck-crumb]")?.remove();
      svg.querySelectorAll("[data-ck-crosshair],[data-ck-brush],[data-ck-dot],[data-ck-pick]").forEach((node) => node.remove());
      if (svg.getAttribute("data-ck-render") === "canvas" || svg.querySelector("[data-ck-canvas]")) {
        void import("./canvas/hydrate").then((mod) => {
          if (host.isConnected) mod.release(host);
        });
      }
      svg.removeAttribute("tabindex");
      host.removeAttribute("data-ck-interact");
    },
    ready,
  };
}

/** Forward host events to adapter callbacks. Returns the unlisten function. */
export function listen(
  host: EventTarget,
  handlers: {
    pointclick?: (detail: ClickDetail) => void;
    seriesclick?: (detail: ClickDetail) => void;
    legendclick?: (detail: ClickDetail) => void;
    selectionchange?: (detail: Selection) => void;
  },
): () => void {
  const names = ["pointclick", "seriesclick", "legendclick", "selectionchange"] as const;
  const offs: (() => void)[] = [];
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const fn = handlers[name];
    if (!fn) continue;
    const listener = (event: Event) => fn((event as CustomEvent).detail);
    host.addEventListener(name, listener);
    offs.push(() => host.removeEventListener(name, listener));
  }
  return () => {
    for (let i = 0; i < offs.length; i++) offs[i]();
  };
}
