import type { ChartRenderer, ChartSpec } from "@chartkitdev/core";
import { adopt, isExtra, render as renderAll } from "@chartkitdev/core/all";

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

async function ensure(type: string): Promise<void> {
  if (!isExtra(type)) return;
  const mod = (await import("@chartkitdev/core/load")) as { load(type: string): Promise<ChartRenderer | undefined> };
  const chart = await mod.load(type);
  if (chart) adopt(chart);
}

/**
 * Draw `spec` into `el` and return handles for later specs.
 * The element is the caller's. This does not wrap it in another node.
 * Core charts paint immediately. Histogram through waterfall load on demand.
 * `renderToString` from `@chartkitdev/vanilla/ssr` imports those charts statically.
 */
export function mount(el: MountElement, spec: ChartSpec, options: MountOptions = {}): MountedChart {
  const render = options.render ?? renderAll;
  const custom = Boolean(options.render);
  let alive = true;
  let current = spec;
  let tip: { destroy(): void } | undefined;

  const draw = (next: ChartSpec) => {
    const svg = render(next);
    if (el.innerHTML !== svg) el.innerHTML = svg;
  };

  const kick = (next: ChartSpec) => {
    current = next;
    if (!custom && isExtra(next.type)) {
      void ensure(next.type).then(async () => {
        if (!alive || current !== next) return;
        draw(next);
        if (!tip && canListen(el)) {
          const { attach } = await import("@chartkitdev/core/extra-tip");
          if (alive && current === next) tip = attach(el);
        }
      });
      return;
    }
    draw(next);
  };

  kick(spec);

  return {
    update(next) {
      if (!alive) return;
      kick(next);
    },
    destroy() {
      if (!alive) return;
      alive = false;
      tip?.destroy();
      if (el.innerHTML !== "") el.innerHTML = "";
    },
  };
}

function canListen(el: MountElement): el is MountElement & EventTarget & { querySelector(selector: string): Element | null } {
  return typeof (el as unknown as EventTarget).addEventListener === "function";
}

/** The SVG string for a core chart. Phase 3 charts need `@chartkitdev/vanilla/ssr`. */
export function renderToString(spec: ChartSpec, render: (spec: ChartSpec) => string = renderAll): string {
  return render(spec);
}
