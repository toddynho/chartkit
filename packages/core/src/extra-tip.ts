/**
 * Mark tooltips for the extra chart types.
 * The card uses the same `.ck-tip` treatment as `@chartkitdev/core/interact`.
 * A static render stays a string: adapters call `attach` after the SVG is in the DOM.
 */

import { readTooltip } from "./tooltip-slot";

const EXTRA = new Set(["histogram", "boxplot", "radar", "funnel", "treemap", "sankey", "bullet", "waterfall", "gantt", "timeline", "quadrant", "venn", "journey", "radial-bar", "rose", "strip", "streamgraph", "density", "tree", "gauge", "kpi", "progress-ring"]);

let treeRender: ((spec: Record<string, unknown>) => string | null) | null = null;

/** The extra bundle registers the tree painter so a click can collapse without pulling the layout into every adapter. */
export function setTreeRenderer(render: (spec: Record<string, unknown>) => string | null): void {
  treeRender = render;
}

export interface TipController {
  destroy(): void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Mark tooltips follow `tooltip: false` and `interaction.hover: false`. Callers that only have a painted SVG keep the previous behaviour. */
export function attach(host: EventTarget & { querySelector?(selector: string): Element | null }, spec?: unknown): TipController {
  if (typeof document === "undefined" || typeof host.addEventListener !== "function" || typeof host.querySelector !== "function") {
    return { destroy() {} };
  }
  if (isRecord(spec)) {
    const tooltip = spec.tooltip;
    const interaction = spec.interaction;
    if (tooltip === false || (isRecord(tooltip) && tooltip.show === false)) return { destroy() {} };
    if (isRecord(interaction) && interaction.hover === false) return { destroy() {} };
  }
  const root = host as unknown as Element;
  // Keep position off the shared `.ck-tip` class. Interact places that card with host-relative coordinates.
  if (!document.getElementById("ck-extra-tip-style")) {
    const style = document.createElement("style");
    style.id = "ck-extra-tip-style";
    style.textContent =
      "[data-ck-extra-tip].ck-tip{position:fixed}.ck-tip{z-index:5;pointer-events:none;padding:8px 10px;border-radius:10px;font:12px/1.35 sans-serif;font-family:var(--ck-font-family, inherit);background:light-dark(#fff,#2c2c2e);color:light-dark(#1d1d1f,#f5f5f7);box-shadow:0 8px 24px #0003;font-variant-numeric:tabular-nums;max-width:280px}";
    document.head.append(style);
  }
  const tip = document.createElement("div");
  tip.className = "ck-tip";
  tip.setAttribute("data-ck-extra-tip", "");
  tip.style.display = "none";
  document.body.append(tip);
  const move = (event: Event) => {
    const pointer = event as PointerEvent;
    const target = pointer.target instanceof Element ? pointer.target : null;
    const type = root.querySelector("svg")?.getAttribute("data-ck-type") ?? "";
    const mark = EXTRA.has(type) ? target?.closest?.("[data-ck-mark]") : null;
    if (type === "streamgraph") {
      const series = mark?.getAttribute("data-ck-series") ?? "";
      root.querySelectorAll("[data-ck-series]").forEach((node) => {
        if (!node.getAttribute("data-ck-fill")) node.setAttribute("data-ck-fill", node.getAttribute("fill-opacity") || "0.22");
        const on = !series || node.getAttribute("data-ck-series") === series;
        node.setAttribute("fill-opacity", on ? node.getAttribute("data-ck-fill") || "0.22" : "0.08");
      });
    }
    const label = mark?.getAttribute("aria-label");
    if (!mark || !label) {
      tip.style.display = "none";
      return;
    }
    const custom = readTooltip(root);
    if (custom) {
      const body = custom({ title: label, index: -1, x: null, rows: [{ name: label, text: label, color: "" }] });
      tip.replaceChildren();
      if (body == null || body === "") {
        tip.style.display = "none";
        return;
      }
      if (typeof body === "string") tip.innerHTML = body;
      else tip.append(body);
    } else tip.textContent = label;
    tip.style.display = "block";
    tip.style.left = `${pointer.clientX + 12}px`;
    tip.style.top = `${pointer.clientY + 12}px`;
  };
  const hide = () => {
    tip.style.display = "none";
    root.querySelectorAll("[data-ck-fill]").forEach((node) => {
      const fill = node.getAttribute("data-ck-fill");
      if (fill) node.setAttribute("fill-opacity", fill);
    });
  };
  const chartType = root.querySelector("svg")?.getAttribute("data-ck-type") ?? (isRecord(spec) && typeof spec.type === "string" ? spec.type : "");
  const keys = isRecord(spec) && isRecord(spec.a11y) && spec.a11y.keyboard === true && (chartType === "streamgraph" || chartType === "tree");
  const tree = chartType === "tree";
  let liveSpec = isRecord(spec) ? spec : null;
  const live = document.createElement("div");
  live.className = "ck-clip";
  live.setAttribute("aria-live", "polite");
  if (keys) document.body.append(live);
  const focusMark = (selector: string, delta: number) => {
    const nodes = Array.from(root.querySelectorAll<SVGElement>(selector));
    if (!nodes.length) return;
    const current = document.activeElement;
    const index = Math.max(0, nodes.findIndex((node) => node === current));
    const next = nodes[(index + delta + nodes.length) % nodes.length];
    next?.focus();
    const label = next?.getAttribute("aria-label");
    if (label) live.textContent = label;
  };
  const onKey = (event: Event) => {
    if (!keys) return;
    const key = (event as KeyboardEvent).key;
    if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "ArrowUp" && key !== "ArrowDown" && key !== "Enter") return;
    event.preventDefault();
    event.stopPropagation();
    if (chartType === "tree") {
      const current = document.activeElement instanceof SVGElement ? document.activeElement : null;
      const id = current?.getAttribute("data-ck-id") ?? "";
      const nodes = Array.from(root.querySelectorAll<SVGElement>("[data-ck-mark='point']"));
      const go = (next: SVGElement | undefined) => {
        next?.focus();
        const label = next?.getAttribute("aria-label");
        if (label) live.textContent = label;
      };
      if (key === "Enter") {
        const label = current?.getAttribute("aria-label");
        if (label) live.textContent = label;
        return;
      }
      if (key === "ArrowDown") go(nodes.find((node) => node.getAttribute("data-ck-parent") === id));
      else if (key === "ArrowUp") go(nodes.find((node) => node.getAttribute("data-ck-id") === current?.getAttribute("data-ck-parent")));
      else {
        const siblings = nodes.filter((node) => node.getAttribute("data-ck-parent") === current?.getAttribute("data-ck-parent"));
        const index = Math.max(0, siblings.findIndex((node) => node === current));
        go(siblings[index + (key === "ArrowRight" ? 1 : -1)]);
      }
      return;
    }
    if (key === "ArrowLeft") focusMark("[data-ck-mark='column']", -1);
    else if (key === "ArrowRight") focusMark("[data-ck-mark='column']", 1);
    else if (key === "ArrowUp") focusMark("[data-ck-mark='area']", -1);
    else if (key === "ArrowDown") focusMark("[data-ck-mark='area']", 1);
  };
  const onClick = (event: Event) => {
    if (!tree || !liveSpec) return;
    const target = event.target;
    const node = target instanceof Element ? target.closest("[data-ck-id]") : null;
    const id = node?.getAttribute("data-ck-id");
    if (!id) return;
    const charts = (globalThis as { ChartKitCharts?: { tree?: { render?: (spec: Record<string, unknown>) => string | null } } }).ChartKitCharts;
    const draw = treeRender ?? charts?.tree?.render;
    if (!draw) return;
    const mark = isRecord(liveSpec.mark) ? { ...liveSpec.mark } : {};
    const collapsed = Array.isArray(mark.collapsed) ? mark.collapsed.map((item) => String(item)) : [];
    mark.collapsed = collapsed.includes(id) ? collapsed.filter((item) => item !== id) : [...collapsed, id];
    liveSpec = { ...liveSpec, mark };
    const svg = draw(liveSpec);
    const current = root.querySelector("svg");
    if (!svg || !current) return;
    current.outerHTML = svg;
  };
  root.addEventListener("pointermove", move);
  root.addEventListener("pointerleave", hide);
  if (keys) root.addEventListener("keydown", onKey, true);
  if (tree) root.addEventListener("click", onClick);
  return {
    destroy() {
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", hide);
      if (keys) root.removeEventListener("keydown", onKey, true);
      if (tree) root.removeEventListener("click", onClick);
      tip.remove();
      live.remove();
    },
  };
}
