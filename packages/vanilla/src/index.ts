import type { ChartSpec } from "@chartkitdev/core";
import { open, render as renderAll } from "@chartkitdev/core/all";
import { attach, patchSvg, type Controller } from "@chartkitdev/core/interact";

/** Anything with an `innerHTML` string. `HTMLElement` qualifies. */
export interface MountElement {
  innerHTML: string;
}

export interface MountOptions {
  /** Defaults to the core charts. Pass `createRenderer([...])` to ship a subset. */
  render?: (spec: ChartSpec) => string;
}

export interface MountedChart {
  /** Draw a new spec into the same element. A matching SVG does not rewrite the DOM. */
  update(spec: ChartSpec): void;
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
  const render = options.render ?? renderAll;
  let alive = true;
  let ctl: Controller | null = null;

  const draw = (next: ChartSpec) => {
    const markup = render(next);
    if (ctl) ctl.update(next, markup);
    else patchSvg(el, markup);
  };

  const kick = (next: ChartSpec) => {
    if (!options.render && open(el, next)) return;
    draw(next);
    if (!ctl && isElement(el)) ctl = attach(el, next, { render: (value) => render(value as ChartSpec) });
  };

  kick(spec);

  return {
    update(next) {
      if (alive) kick(next);
    },
    destroy() {
      if (!alive) return;
      alive = false;
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
