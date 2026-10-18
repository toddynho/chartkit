/**
 * Zoom, pan, brush, pinch, keyboard focus, and the data table.
 * `attach` loads this only when the spec asks for one of them, so a tooltip-only
 * import of `@chartkitdev/core/interact` stays smaller.
 */

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
  (x: number) => void,
  (index: number, pointerY: number | null) => TipRow[],
  (clientX: number, clientY: number, title: string, rows: TipRow[], marks: { x: number; y: number }[]) => void,
  (index: number) => string,
  () => number,
  (value: number) => void,
  (index: number) => void,
  () => void,
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
  if (!alive()) return;
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
      moveCross(crossX(next - lo));
      if (showTip) {
        const bounds = svg.getBoundingClientRect();
        placeTip(bounds.left + 24, bounds.top + 24, xText(next), entriesAt(next, null), []);
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
