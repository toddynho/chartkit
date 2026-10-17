import type { ChartSpec } from "@chartkitdev/core";
import { render as renderAll } from "@chartkitdev/core/all";

/** Anything with an `innerHTML` string. `HTMLElement` qualifies. */
export interface MountElement {
  innerHTML: string;
}

export interface MountOptions {
  /** Defaults to every v1 chart. Pass `createRenderer([...])` to ship a subset. */
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
 * The element is the caller's. This does not wrap it in another node.
 * `renderToString(spec)` is the same SVG, for a server that writes HTML.
 */
export function mount(el: MountElement, spec: ChartSpec, options: MountOptions = {}): MountedChart {
  const render = options.render ?? renderAll;
  let alive = true;

  const draw = (next: ChartSpec) => {
    const svg = render(next);
    if (el.innerHTML !== svg) el.innerHTML = svg;
  };

  draw(spec);

  return {
    update(next) {
      if (!alive) return;
      draw(next);
    },
    destroy() {
      if (!alive) return;
      alive = false;
      if (el.innerHTML !== "") el.innerHTML = "";
    },
  };
}

/** The SVG string `@chartkitdev/core` returns. No DOM and no extra wrapper. */
export function renderToString(spec: ChartSpec, render: (spec: ChartSpec) => string = renderAll): string {
  return render(spec);
}
