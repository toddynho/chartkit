/**
 * Mark tooltips for the extra chart types.
 * The card uses the same `.ck-tip` treatment as `@chartkitdev/core/interact`.
 * A static render stays a string: adapters call `attach` after the SVG is in the DOM.
 */

import { readTooltip } from "./tooltip-slot";

const EXTRA = new Set(["histogram", "boxplot", "radar", "funnel", "treemap", "sankey", "bullet", "waterfall", "gantt", "timeline", "quadrant", "venn", "journey", "radial-bar", "rose"]);

export interface TipController {
  destroy(): void;
}

export function attach(host: EventTarget & { querySelector?(selector: string): Element | null }): TipController {
  if (typeof document === "undefined" || typeof host.addEventListener !== "function" || typeof host.querySelector !== "function") {
    return { destroy() {} };
  }
  const root = host as unknown as Element;
  // Keep position off the shared `.ck-tip` class. Interact places that card with host-relative coordinates.
  if (!document.getElementById("ck-extra-tip-style")) {
    const style = document.createElement("style");
    style.id = "ck-extra-tip-style";
    style.textContent =
      "[data-ck-extra-tip].ck-tip{position:fixed}.ck-tip{z-index:5;pointer-events:none;padding:8px 10px;border-radius:10px;font:12px/1.35 ui-sans-serif,system-ui,sans-serif;background:light-dark(#fff,#2c2c2e);color:light-dark(#1d1d1f,#f5f5f7);box-shadow:0 8px 24px #0003;font-variant-numeric:tabular-nums;max-width:280px}";
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
  };
  root.addEventListener("pointermove", move);
  root.addEventListener("pointerleave", hide);
  return {
    destroy() {
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", hide);
      tip.remove();
    },
  };
}
