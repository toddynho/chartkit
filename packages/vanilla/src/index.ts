import type { ChartSpec } from "@chartkitdev/core";
export { toPNG, toSVG, toCSV } from "@chartkitdev/core/export";
import { open, render as renderAll } from "@chartkitdev/core/all";
import { attach, canvasWanted, listen, patchSvg, writeTooltip, type ClickDetail, type Controller, type Selection, type TooltipRender } from "@chartkitdev/core/interact";
import { joinRows } from "./append";

export interface AppendOptions {
  /** Keep this many trailing rows after the append. */
  window?: number;
}

/** Anything with an `innerHTML` string. `HTMLElement` qualifies. */
export interface MountElement {
  innerHTML: string;
}

export interface MountOptions {
  /** Defaults to the core charts. Pass `createRenderer([...])` to ship a subset. */
  render?: (spec: ChartSpec) => string;
  onPointClick?: (detail: ClickDetail) => void;
  onSeriesClick?: (detail: ClickDetail) => void;
  onLegendClick?: (detail: ClickDetail) => void;
  onSelectionChange?: (selection: Selection) => void;
  /** When set, selection is controlled. Pass the next value to `update`. */
  selection?: Selection | null;
  /** Replaces the tooltip card. Return HTML, a node, or null to hide it. */
  tooltip?: TooltipRender;
}

export interface MountedChart {
  /** Draw a new spec into the same element. A matching SVG does not rewrite the DOM. */
  update(spec: ChartSpec, selection?: Selection | null): void;
  /** Append rows and redraw in place. `window` keeps the last N rows. */
  append(rows: unknown[], options?: AppendOptions): void;
  /** Remove the chart markup. Further updates do nothing. */
  destroy(): void;
}

/**
 * Draw `spec` into `el` and return handles for later specs.
 * Core charts paint immediately. Histogram through waterfall load on demand.
 * `renderToString` from `@chartkitdev/vanilla/ssr` imports those charts statically.
 */
function isElement(el: MountElement): el is MountElement & Element {
  return typeof (el as Element).querySelector === "function" && (el as Element).nodeType === 1;
}

export function mount(el: MountElement, spec: ChartSpec, options: MountOptions = {}): MountedChart {
  if (isElement(el)) writeTooltip(el, options.tooltip);
  const render = options.render ?? renderAll;
  const idle = () => {};
  let alive = true;
  let ctl: Controller | null = null;
  let bound: Element | null = null;
  let stop = idle;
  let selection = options.selection;

  let painter: ((host: Element, spec: ChartSpec) => boolean) | null = null;

  const paintCanvas = (next: ChartSpec, done: () => void) => {
    const run = (fn: (host: Element, spec: ChartSpec) => boolean) => {
      if (!alive || !isElement(el)) return;
      if (!fn(el, next)) {
        const markup = render(next);
        if (ctl) ctl.update(next, markup);
        else patchSvg(el, markup);
      }
      done();
    };
    if (painter) {
      run(painter);
      return;
    }
    void import("@chartkitdev/core/canvas/hydrate").then((mod) => {
      painter = (host, spec) => mod.paintSpec(host, spec);
      if (!alive) return;
      run(painter);
    });
  };

  const draw = (next: ChartSpec) => {
    const markup = render(next);
    if (ctl) ctl.update(next, markup);
    else patchSvg(el, markup);
  };

  const arm = (next: ChartSpec) => {
    if (!alive || !isElement(el)) return;
    const svg = el.querySelector("svg");
    if (!(svg instanceof SVGSVGElement)) return;
    if (ctl && svg === bound) {
      ctl.update(next);
      if (selection !== undefined) ctl.setSelection(selection);
      return;
    }
    ctl?.destroy();
    ctl = attach(el, next, { render: (value) => render(value as ChartSpec), selection });
    bound = svg;
    if (stop === idle) {
      stop = listen(el, {
        pointclick: options.onPointClick,
        seriesclick: options.onSeriesClick,
        legendclick: options.onLegendClick,
        selectionchange: options.onSelectionChange,
      });
    }
  };

  const kick = (next: ChartSpec) => {
    if (!options.render && open(el, next, () => arm(next))) return;
    const finish = () => {
      if (!isElement(el)) return;
      const svg = el.querySelector("svg");
      if (!ctl || (svg && svg !== bound)) arm(next);
      else if (svg?.getAttribute("data-ck-scene") === "1") ctl.update(next, null);
    };
    if (isElement(el) && canvasWanted(next)) {
      paintCanvas(next, finish);
      return;
    }
    draw(next);
    finish();
  };

  let current = spec;
  kick(current);

  return {
    update(next, nextSelection) {
      if (!alive) return;
      current = next;
      if (nextSelection !== undefined) {
        selection = nextSelection;
        ctl?.setSelection(nextSelection);
      }
      kick(next);
    },
    append(rows, options) {
      if (!alive) return;
      current = { ...current, data: joinRows(current.data, rows, options?.window) as ChartSpec["data"] };
      kick(current);
    },
    destroy() {
      if (!alive) return;
      alive = false;
      stop();
      ctl?.destroy();
      ctl = null;
      if (el.innerHTML) el.innerHTML = "";
    },
  };
}

/** The SVG string for a core chart. Phase 3 charts need `@chartkitdev/vanilla/ssr`. */
export function renderToString(spec: ChartSpec, render: (spec: ChartSpec) => string = renderAll): string {
  return render(spec);
}
