/**
 * Zoom, pan, brush, pinch, keyboard focus, the data table, and the overview navigator.
 * `attach` loads this only when the spec asks for one of them, so a tooltip-only
 * import of `@chartkitdev/core/interact` stays smaller.
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
  boolean,
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
  (local: number) => number,
  (x: number, title: string) => void,
  (index: number, pointerY: number | null) => TipRow[],
  (clientX: number, clientY: number, title: string, rows: TipRow[], marks: { x: number; y: number }[], index?: number) => void,
  (index: number) => string,
  () => number,
  (value: number) => void,
  (index: number) => void,
  () => void,
  boolean,
  () => { samples: number[]; start: number; end: number },
];

function ensureTableCss(): void {
  if (typeof document === "undefined" || document.getElementById("ck-interact-table-style")) return;
  const style = document.createElement("style");
  style.id = "ck-interact-table-style";
  style.textContent =
    ".ck-table{border-collapse:collapse;font:12px/1.4 ui-sans-serif,system-ui,sans-serif}.ck-table td,.ck-table th{border:1px solid #0002;padding:2px 6px;text-align:right}.ck-table td:first-child,.ck-table th:first-child{text-align:left}";
  document.head.append(style);
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
  const showTip = a[7];
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
  const crossX = a[19];
  const moveCross = a[20];
  const entriesAt = a[21];
  const placeTip = a[22];
  const xText = a[23];
  const readFocus = a[24];
  const writeFocus = a[25];
  const announce = a[26];
  const paintTable = a[27];
  const navigator = a[28];
  const overview = a[29];
  if (!alive()) return;
  if (navigator) mountNavigator(svg, on, alive, range, setRange, redraw, emit, rangeDetail, overview);
  if (dataTable) {
    ensureTableCss();
    const host = svg.parentElement;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("data-ck-table-btn", "");
    btn.textContent = "Show data table";
    const table = document.createElement("table");
    table.className = "ck-table ck-clip";
    table.setAttribute("data-ck-table", "");
    const wrap = document.createElement("div");
    wrap.setAttribute("data-ck-table-wrap", "");
    wrap.append(btn, table);
    host?.append(wrap);
    on(btn, "click", () => {
      const open = table.classList.toggle("ck-clip");
      btn.textContent = open ? "Show data table" : "Hide data table";
    });
    paintTable();
  }
  if (keys) {
    on(svg, "keydown", ((event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const { lo, hi } = range();
      const next = event.key === "ArrowRight" ? Math.min(hi, readFocus() + 1) : Math.max(lo, readFocus() - 1);
      writeFocus(next);
      announce(next);
      moveCross(crossX(next - lo), xText(next));
      if (showTip) {
        const bounds = svg.getBoundingClientRect();
        placeTip(bounds.left + 24, bounds.top + 24, xText(next), entriesAt(next, null), [], next);
      }
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
          mark.setAttribute("fill", "rgb(0 122 255 / .16)");
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
    ".ck-navigator{position:relative;margin-top:8px;touch-action:none}.ck-navigator svg{display:block;width:100%;background:light-dark(rgb(0 0 0 / 0.04),rgb(255 255 255 / 0.06));border-radius:8px}.ck-nav-shade{position:absolute;top:0;bottom:0;background:light-dark(rgb(255 255 255 / 0.62),rgb(0 0 0 / 0.45));pointer-events:none}.ck-navigator [role=slider]{position:absolute;top:0;bottom:0;box-sizing:border-box;border:0;background:color-mix(in srgb,var(--ck-nav,#007aff) 22%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--ck-nav,#007aff) 50%,transparent);border-radius:6px;cursor:ew-resize;touch-action:none}.ck-navigator [role=slider]:focus-visible{outline:2px solid var(--ck-nav,#007aff);outline-offset:2px}.ck-nav-handle{position:absolute;top:18%;bottom:18%;width:4px;border-radius:2px;background:var(--ck-nav,#007aff)}.ck-nav-handle[data-ck-edge=lo]{left:0}.ck-nav-handle[data-ck-edge=hi]{right:0}";
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
