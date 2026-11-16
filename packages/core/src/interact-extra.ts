/**
 * Zoom, pan, brush, pinch, keyboard focus, the data table, and the overview navigator.
 * `attach` loads this after the chart is interactive, so the tooltip entry of
 * `@chartkitdev/core/interact` stays smaller. Keyboard and the table are on by default,
 * so most client mounts fetch it.
 */
import { bindNavigator } from "./nav-hook";

type On = (target: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions) => void;
type TipRow = { name: string; text: string; color: string };

/** Positional so the tooltip entry does not repeat these property names. */
export type ExtraHook = [
  SVGSVGElement,
  On,
  boolean,
  boolean,
  boolean,
  boolean,
  /** Data table: 0 off, 1 screen-reader only, 2 with the visible toggle button. */
  number,
  boolean,
  () => boolean,
  (clientX: number, clientY: number) => { x: number; y: number },
  (x: number) => number,
  (local: number, factor: number) => void,
  () => void,
  () => void,
  (name: string, detail: unknown) => void,
  () => unknown,
  () => { t: number; w: number; h: number },
  () => { lo: number; hi: number; n: number },
  (lo: number, hi: number) => void,
  /** Paint the hover state for a row. `keyed` adds the point markers. */
  (index: number, keyed?: 1) => void,
  () => void,
  (index: number, pointerY: number | null) => TipRow[],
  (clientX: number, clientY: number, title: string, rows: TipRow[], marks: { x: number; y: number }[], index?: number) => void,
  (index: number) => string,
  () => number,
  (value: number) => void,
  /** Write the polite live region. */
  (text: string) => void,
  () => void,
  boolean,
  () => { samples: number[]; start: number; end: number },
  /** Dim every series but this one. An empty name clears it. */
  (name: string) => void,
  /** The row one step (`by` is 1 or -1) along the category axis, or an index outside the window at either end. */
  (row: number, by: number) => number,
];

function ensureTableCss(): void {
  if (typeof document === "undefined" || document.getElementById("ck-interact-table-style")) return;
  const style = document.createElement("style");
  style.id = "ck-interact-table-style";
  style.textContent =
    ".ck-chart:focus-visible{outline:2px solid var(--ck-focus,light-dark(#0b57d0,#8ab4f8));outline-offset:2px}[data-ck-kf]{stroke:light-dark(#1d1d1f,#f5f5f7);stroke-width:2.5}.ck-table{border-collapse:collapse;font:12px/1.4 sans-serif;font-family:var(--ck-font-family, inherit)}.ck-table td,.ck-table th{border:1px solid #0002;padding:2px 6px;text-align:right}.ck-table td:first-child,.ck-table th:first-child{text-align:left}";
  document.head.append(style);
}

const TABLE_ROWS = 1000;
/** The newest pending write per table. A stream of updates repaints the table a few times a second, not once per update. */
const tableQueue = new WeakMap<Element, () => void>();

/**
 * Write the data table: one row per data row, capped at 1000. A longer series is read at even
 * steps, first and last row included, so the table spans the whole range.
 * A sunburst lists its arcs, since its rows are a tree and not a grid.
 * The table behind the visible button is written at once. The hidden one is written in its own
 * task, so a page of charts does not build every table in one long task.
 */
export function fillTable(svg: SVGSVGElement, title: unknown, head: string[], total: number, row: (index: number) => string[]): void {
  const table = svg.parentElement?.querySelector("[data-ck-table]");
  if (!table) return;
  const esc = (text: string) => text.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`);
  const write = () => {
    if (svg.getAttribute("data-ck-type") === "sunburst") {
      const arcs = svg.querySelectorAll("path[aria-label]");
      head = ["name", head[head.length - 1]];
      total = arcs.length;
      row = (index) => {
        const label = arcs[index].getAttribute("aria-label") || "";
        const cut = label.indexOf(": ");
        return cut < 0 ? [label, ""] : [label.slice(0, cut), label.slice(cut + 2)];
      };
    }
    const cap = Math.min(total, TABLE_ROWS);
    let body = "";
    for (let r = 0; r < cap; r++) {
      const cells = row(cap < total ? Math.round((r * (total - 1)) / (cap - 1)) : r);
      body += `<tr>${cells.map((cell, c) => (c ? `<td>${esc(cell)}</td>` : `<th scope="row">${esc(cell)}</th>`)).join("")}</tr>`;
    }
    const note = cap < total ? `. Showing ${cap} of ${total} rows, evenly spaced.` : "";
    table.innerHTML = `<caption>${esc(typeof title === "string" && title ? title : "Chart")} data${note}</caption><thead><tr>${head.map((name) => `<th scope="col">${esc(name)}</th>`).join("")}</tr></thead><tbody>${body}</tbody>`;
  };
  const first = !table.firstChild;
  if (first && table.previousElementSibling) {
    write();
    return;
  }
  const waiting = tableQueue.has(table);
  tableQueue.set(table, write);
  if (waiting) return;
  setTimeout(
    () => {
      const run = tableQueue.get(table);
      tableQueue.delete(table);
      if (table.isConnected) run?.();
    },
    first ? 0 : 300,
  );
}

function pairDistance(points: Map<number, { x: number; y: number }>): number {
  const all = [...points.values()];
  if (all.length < 2) return 0;
  const dx = all[0].x - all[1].x;
  const dy = all[0].y - all[1].y;
  return Math.hypot(dx, dy);
}

/** Wire the handlers. No-op if `attach` was already destroyed. */
export function armExtras(a: ExtraHook): void {
  const svg = a[0];
  const on = a[1];
  const zooming = a[2];
  const pan = a[3];
  const brush = a[4];
  const keys = a[5];
  const dataTable = a[6];
  const alive = a[8];
  const viewPoint = a[9];
  const lookup = a[10];
  const zoomAt = a[11];
  const resetRange = a[12];
  const redraw = a[13];
  const emit = a[14];
  const rangeDetail = a[15];
  const box = a[16];
  const range = a[17];
  const setRange = a[18];
  const showAt = a[19];
  const hideHover = a[20];
  const entriesAt = a[21];
  const placeTip = a[22];
  const xText = a[23];
  const readFocus = a[24];
  const writeFocus = a[25];
  const announce = a[26];
  const paintTable = a[27];
  const navigator = a[28];
  const overview = a[29];
  const light = a[30];
  const stepRow = a[31];
  // The chunk can land after a test or server environment has torn the document down.
  if (!alive() || typeof document === "undefined") return;
  if (navigator) mountNavigator(svg, on, alive, range, setRange, redraw, emit, rangeDetail, overview);
  if (keys || dataTable) ensureTableCss();
  if (dataTable) {
    const host = svg.parentElement;
    const table = document.createElement("table");
    table.className = "ck-table";
    table.setAttribute("data-ck-table", "");
    const wrap = document.createElement("div");
    wrap.setAttribute("data-ck-table-wrap", "");
    if (dataTable > 1) {
      // `a11y.dataTable: true` adds a button that shows the table to everyone.
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-ck-table-btn", "");
      btn.textContent = "Show data table";
      table.className += " ck-clip";
      wrap.append(btn);
      on(btn, "click", () => {
        const open = table.classList.toggle("ck-clip");
        btn.textContent = open ? "Show data table" : "Hide data table";
      });
    } else wrap.className = "ck-clip";
    wrap.append(table);
    host?.append(wrap);
    paintTable();
  }
  if (keys) {
    const arc = /^(donut|pie|sunburst)$/.test(svg.getAttribute("data-ck-type") || "");
    const slices = () => svg.querySelectorAll("path[aria-label]");
    // `row` is the series under Up/Down. -1 reads every series at the point.
    let row = -1;
    let lit = "";
    let shown = false;
    const mark = (node?: Element) => {
      svg.querySelector("[data-ck-kf]")?.removeAttribute("data-ck-kf");
      node?.setAttribute("data-ck-kf", "");
    };
    const dimTo = (name: string) => {
      if (name !== lit) light((lit = name));
    };
    const clear = () => {
      if (!shown) return false;
      shown = false;
      row = -1;
      mark();
      dimTo("");
      hideHover();
      announce("");
      return true;
    };
    on(svg, "blur", clear as EventListener);
    on(svg, "keydown", ((event: KeyboardEvent) => {
      const key = event.key;
      if (event.target !== svg || event.altKey || event.ctrlKey || event.metaKey) return;
      if (key === "Escape") {
        if (clear()) event.preventDefault();
        return;
      }
      const span = range();
      const nodes = arc ? slices() : null;
      const lo = nodes ? 0 : span.lo;
      const hi = nodes ? nodes.length - 1 : span.hi;
      if (hi < lo) return;
      const step = key === "ArrowRight" ? 1 : key === "ArrowLeft" ? -1 : 0;
      const turn = key === "ArrowDown" ? 1 : key === "ArrowUp" ? -1 : 0;
      let next = Math.max(lo, Math.min(hi, readFocus()));
      // The first arrow lands on the current point. Later ones move.
      if (step && shown) {
        // Long data repeats an x once per series, so rows step to the next category, not the next row.
        next = nodes ? next + step : stepRow(next, step);
        // At either end the key is left to the page.
        if (next < lo || next > hi) return;
      } else if (key === "Home") next = lo;
      else if (key === "End") next = hi;
      else if (!step && !turn) return;
      if (nodes) {
        if (turn) return;
        const node = nodes[next];
        const label = node.getAttribute("aria-label") || "";
        const cut = label.indexOf(": ");
        const name = cut < 0 ? label : label.slice(0, cut);
        const bounds = node.getBoundingClientRect();
        const x = bounds.left + bounds.width / 2;
        const y = bounds.top + bounds.height / 2;
        writeFocus(next);
        mark(node);
        placeTip(x, y, name, [{ name, text: cut < 0 ? "" : label.slice(cut + 2), color: node.getAttribute("fill") || "" }], [viewPoint(x, y)]);
        announce(label);
      } else {
        let rows = entriesAt(next, null);
        if (turn) {
          if (rows.length < 2) return;
          row = (Math.max(row, turn > 0 ? -1 : 0) + turn + rows.length) % rows.length;
        }
        if (row >= rows.length) row = -1;
        showAt(next, 1);
        dimTo(row < 0 ? "" : rows[row].name);
        if (row >= 0) rows = [rows[row]];
        announce(`${xText(next)}: ${rows.map((item) => `${item.name} ${item.text}`.trim()).join(", ")}`);
      }
      shown = true;
      event.preventDefault();
    }) as EventListener);
  }

  let drag: { kind: "pan" | "brush"; x: number; lo: number; hi: number } | null = null;
  if (zooming || brush) {
on(svg, "wheel", ((event: WheelEvent) => {
      if (!zooming) return;
      try {
        event.preventDefault();
      } catch {
        /* A passive listener must not block the zoom. */
      }
      const point = viewPoint(event.clientX, event.clientY);
zoomAt(lookup(point.x), event.deltaY > 0 ? 1.25 : 0.8);
    }) as EventListener, { passive: false });
on(svg, "dblclick", ((event: MouseEvent) => {
      if ((event.target as Element | null)?.closest?.("text")) return;
resetRange();
    }) as EventListener);
on(svg, "pointerdown", ((event: PointerEvent) => {
      if (event.button !== 0) return;
      const { lo, hi, n } = range();
      const brushing = brush && (!pan || event.shiftKey || !zooming);
      const panning = pan && !brushing && (lo > 0 || hi < n - 1);
      if (!brushing && !panning) return;
      drag = { kind: brushing ? "brush" : "pan", x: viewPoint(event.clientX, event.clientY).x, lo, hi };
      svg.setPointerCapture?.(event.pointerId);
    }) as EventListener);
on(svg, "pointermove", ((event: PointerEvent) => {
      if (!drag) return;
      const x = viewPoint(event.clientX, event.clientY).x;
      if (drag.kind === "brush") {
        const plot = box();
        let mark = svg.querySelector("[data-ck-brush]");
        if (!mark) {
          mark = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          mark.setAttribute("data-ck-brush", "");
          mark.setAttribute("fill", "rgba(0, 122, 255, 0.16)");
          mark.setAttribute("stroke", "#007aff");
          svg.append(mark);
        }
        const left = Math.min(drag.x, x);
        mark.setAttribute("x", String(left));
        mark.setAttribute("y", String(plot.t));
        mark.setAttribute("width", String(Math.abs(x - drag.x)));
        mark.setAttribute("height", String(plot.h));
        return;
      }
      const { n } = range();
      const len = drag.hi - drag.lo + 1;
      const delta = Math.round(((drag.x - x) / Math.max(1, box().w)) * len);
      let start = drag.lo + delta;
      let end = drag.hi + delta;
      if (start < 0) {
        end -= start;
        start = 0;
      }
      if (end > n - 1) {
        start -= end - (n - 1);
        end = n - 1;
      }
      start = Math.max(0, start);
      const current = range();
      if (start === current.lo && end === current.hi) return;
setRange(start, end);
redraw();
    }) as EventListener);
on(svg, "pointerup", ((event: PointerEvent) => {
      if (!drag) return;
      const state = drag;
      drag = null;
      svg.querySelector("[data-ck-brush]")?.remove();
      if (state.kind === "brush") {
        const x = viewPoint(event.clientX, event.clientY).x;
        const a = lookup(Math.min(state.x, x));
        const b = lookup(Math.max(state.x, x));
        const { lo, n } = range();
        const start = lo + Math.min(a, b);
        const end = lo + Math.max(a, b);
        if (end > start) setRange(Math.max(0, start), Math.min(n - 1, end));
redraw();
      }
emit("rangechange", rangeDetail());
    }) as EventListener);
  }

  const pointers = new Map<number, { x: number; y: number }>();
  let pinch = 0;
  if (zooming) {
on(svg, "pointerdown", ((event: PointerEvent) => {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2) pinch = pairDistance(pointers);
    }) as EventListener);
on(svg, "pointermove", ((event: PointerEvent) => {
      if (!pointers.has(event.pointerId) || pointers.size < 2) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const next = pairDistance(pointers);
      if (pinch > 0 && next > 0) {
        const point = viewPoint(event.clientX, event.clientY);
zoomAt(lookup(point.x), pinch / next);
        pinch = next;
      }
    }) as EventListener);
on(svg, "pointerup", ((event: PointerEvent) => {
      pointers.delete(event.pointerId);
      pinch = 0;
    }) as EventListener);
on(svg, "pointercancel", ((event: PointerEvent) => {
      pointers.delete(event.pointerId);
      pinch = 0;
    }) as EventListener);
  }
}

function ensureNavCss(): void {
  if (typeof document === "undefined" || document.getElementById("ck-interact-nav-style")) return;
  const style = document.createElement("style");
  style.id = "ck-interact-nav-style";
  style.textContent =
    ".ck-navigator{position:relative;margin-top:8px;touch-action:none}.ck-navigator svg{display:block;width:100%;background:light-dark(rgba(0, 0, 0, 0.04),rgba(255, 255, 255, 0.06));border-radius:8px}.ck-nav-shade{position:absolute;top:0;bottom:0;background:light-dark(rgba(255, 255, 255, 0.62),rgba(0, 0, 0, 0.45));pointer-events:none}.ck-navigator [role=slider]{position:absolute;top:0;bottom:0;box-sizing:border-box;border:0;background:color-mix(in srgb,var(--ck-nav,#007aff) 22%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--ck-nav,#007aff) 50%,transparent);border-radius:6px;cursor:ew-resize;touch-action:none}.ck-navigator [role=slider]:focus-visible{outline:2px solid var(--ck-nav,#007aff);outline-offset:2px}.ck-nav-handle{position:absolute;top:18%;bottom:18%;width:4px;border-radius:2px;background:var(--ck-nav,#007aff)}.ck-nav-handle[data-ck-edge=lo]{left:0}.ck-nav-handle[data-ck-edge=hi]{right:0}";
  document.head.append(style);
}

/** Series stroke, or the first bar fill, so the overview uses the mark colour. */
function seriesColor(svg: SVGSVGElement): string {
  const paths = svg.querySelectorAll("path");
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    if (path.getAttribute("filter")) continue;
    const stroke = path.getAttribute("stroke");
    if (stroke && stroke !== "none" && path.getAttribute("fill") === "none") return stroke;
  }
  const rects = svg.querySelectorAll("rect");
  for (let i = 0; i < rects.length; i++) {
    if (!(Number(rects[i].getAttribute("width")) > 8)) continue;
    const fill = rects[i].getAttribute("fill");
    if (fill && fill !== "none" && !fill.startsWith("url(")) return fill;
  }
  return "var(--ck-series-1, var(--chart-1, #007aff))";
}

function spark(samples: number[], width: number, height: number): string {
  let min = Infinity;
  let max = -Infinity;
  for (const value of samples) {
    if (value !== value) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (min === Infinity) return "";
  const span = max - min || 1;
  const buckets = samples.length / 2;
  const yAt = (value: number) => (4 + (1 - (value - min) / span) * (height - 8)).toFixed(1);
  let markup = "";
  let top: string[] = [];
  let line: string[] = [];
  let bottom: string[] = [];
  const flush = () => {
    if (top.length < 2) {
      top = [];
      line = [];
      bottom = [];
      return;
    }
    const points = `${top.join(" ")} ${bottom.reverse().join(" ")}`;
    markup += `<polygon points="${points}" fill="var(--ck-nav, currentColor)" fill-opacity="0.2" stroke="none"/>`;
    markup += `<polyline points="${line.join(" ")}" fill="none" stroke="var(--ck-nav, currentColor)" stroke-width="1.25" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/>`;
    top = [];
    line = [];
    bottom = [];
  };
  for (let i = 0; i < buckets; i++) {
    const lo = samples[i * 2];
    const hi = samples[i * 2 + 1];
    if (lo !== lo || hi !== hi) {
      flush();
      continue;
    }
    const x = (((i + 0.5) / buckets) * width).toFixed(1);
    top.push(`${x},${yAt(hi)}`);
    line.push(`${x},${yAt((lo + hi) / 2)}`);
    bottom.push(`${x},${yAt(lo)}`);
  }
  flush();
  return markup;
}

function mountNavigator(
  svg: SVGSVGElement,
  on: On,
  alive: () => boolean,
  range: () => { lo: number; hi: number; n: number },
  setRange: (lo: number, hi: number) => void,
  redraw: () => void,
  emit: (name: string, detail: unknown) => void,
  rangeDetail: () => unknown,
  overview: () => { samples: number[]; start: number; end: number },
): void {
  const host = svg.parentElement;
  if (!host || !alive()) return;
  ensureNavCss();
  let root = host.querySelector("[data-ck-navigator]");
  if (!(root instanceof HTMLElement)) {
    root = document.createElement("div");
    root.className = "ck-navigator";
    root.setAttribute("data-ck-navigator", "");
    host.append(root);
  }
  if (!(root instanceof HTMLElement)) return;
  const track = root;
  const picture = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  picture.setAttribute("aria-hidden", "true");
  picture.setAttribute("data-ck-overview", "");
  picture.setAttribute("preserveAspectRatio", "none");
  const shadeL = document.createElement("div");
  shadeL.className = "ck-nav-shade";
  const shadeR = document.createElement("div");
  shadeR.className = "ck-nav-shade";
  const slider = document.createElement("div");
  slider.setAttribute("role", "slider");
  slider.tabIndex = 0;
  slider.setAttribute("aria-orientation", "horizontal");
  slider.setAttribute("aria-label", "Visible window");
  slider.innerHTML = `<span class="ck-nav-handle" data-ck-edge="lo"></span><span class="ck-nav-handle" data-ck-edge="hi"></span>`;
  track.replaceChildren(picture, shadeL, shadeR, slider);

  const commit = (start: number, end: number) => {
    const current = range();
    const lo = Math.max(0, Math.min(start, current.n - 2));
    const hi = Math.max(lo + 1, Math.min(current.n - 1, end));
    if (lo === current.lo && hi === current.hi) return;
    setRange(lo, hi);
    redraw();
    emit("rangechange", rangeDetail());
  };

  const nudge = (delta: number) => {
    const { lo, hi, n } = range();
    const len = hi - lo + 1;
    let start = lo + delta;
    let end = hi + delta;
    if (start < 0) {
      end -= start;
      start = 0;
    }
    if (end > n - 1) {
      start -= end - (n - 1);
      end = n - 1;
    }
    commit(Math.max(0, start), end);
  };

  const paint = () => {
    if (!alive() || !track.isConnected) return;
    const { lo, hi, n } = range();
    const raw = Number(svg.getAttribute("data-ck-nav-h"));
    const height = Number.isFinite(raw) ? Math.max(28, Math.min(96, Math.round(raw))) : 48;
    const width = 1000;
    picture.setAttribute("viewBox", `0 0 ${width} ${height}`);
    picture.setAttribute("preserveAspectRatio", "none");
    picture.setAttribute("height", String(height));
    const frame = overview();
    track.style.setProperty("--ck-nav", seriesColor(svg));
    picture.innerHTML = spark(frame.samples, width, height);
    const start = Math.min(1, Math.max(0, frame.start));
    const end = Math.min(1, Math.max(start, frame.end));
    shadeL.style.left = "0";
    shadeL.style.width = `${start * 100}%`;
    shadeR.style.left = `${end * 100}%`;
    shadeR.style.right = "0";
    slider.style.left = `${start * 100}%`;
    slider.style.width = `${(end - start) * 100}%`;
    slider.setAttribute("aria-valuemin", "0");
    slider.setAttribute("aria-valuemax", String(Math.max(0, n - 1)));
    slider.setAttribute("aria-valuenow", String(lo));
    const detail = rangeDetail() as { from?: unknown; to?: unknown };
    slider.setAttribute("aria-valuetext", `${detail.from ?? lo} to ${detail.to ?? hi}`);
  };

  bindNavigator(host, paint);
  paint();

  let drag: { pointer: number; origin: number; lo: number; hi: number; edge: "move" | "lo" | "hi" } | null = null;
  on(track, "pointerdown", ((event: PointerEvent) => {
    if (event.button !== 0) return;
    const box = track.getBoundingClientRect();
    const width = box.width || 1;
    const { lo, hi, n } = range();
    const len = Math.max(2, hi - lo + 1);
    const onWindow = (event.target as Element | null)?.closest?.("[role=slider]");
    if (!onWindow) {
      const center = Math.round(((event.clientX - box.left) / width) * Math.max(0, n - 1));
      let start = Math.round(center - len / 2);
      let end = start + len - 1;
      if (start < 0) {
        end -= start;
        start = 0;
      }
      if (end > n - 1) {
        start -= end - (n - 1);
        end = n - 1;
      }
      commit(start, end);
      slider.focus();
      return;
    }
    const edgeName = (event.target as Element | null)?.closest?.("[data-ck-edge]")?.getAttribute("data-ck-edge");
    const edge = edgeName === "lo" || edgeName === "hi" ? edgeName : "move";
    drag = { pointer: event.pointerId, origin: event.clientX, lo, hi, edge };
    slider.setPointerCapture?.(event.pointerId);
  }) as EventListener);
  on(track, "pointermove", ((event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointer) return;
    const box = track.getBoundingClientRect();
    const width = box.width || 1;
    const { n } = range();
    if (drag.edge !== "move") {
      const at = Math.round(((event.clientX - box.left) / width) * Math.max(0, n - 1));
      if (drag.edge === "lo") commit(Math.min(at, drag.hi - 1), drag.hi);
      else commit(drag.lo, Math.max(at, drag.lo + 1));
      return;
    }
    const delta = Math.round(((event.clientX - drag.origin) / width) * Math.max(1, n));
    let start = drag.lo + delta;
    let end = drag.hi + delta;
    if (start < 0) {
      end -= start;
      start = 0;
    }
    if (end > n - 1) {
      start -= end - (n - 1);
      end = n - 1;
    }
    commit(Math.max(0, start), end);
  }) as EventListener);
  on(track, "pointerup", ((event: PointerEvent) => {
    if (drag?.pointer === event.pointerId) drag = null;
  }) as EventListener);
  on(slider, "keydown", ((event: KeyboardEvent) => {
    const { lo, hi, n } = range();
    const len = hi - lo + 1;
    const step = event.shiftKey ? Math.max(1, Math.round(len / 2)) : Math.max(1, Math.round(n / 20));
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      nudge(-step);
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      nudge(step);
    } else if (event.key === "Home") {
      event.preventDefault();
      commit(0, len - 1);
    } else if (event.key === "End") {
      event.preventDefault();
      commit(Math.max(0, n - len), n - 1);
    }
  }) as EventListener);
}
