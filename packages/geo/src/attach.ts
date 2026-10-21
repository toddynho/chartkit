import type { GeoSelection } from "./types";

function read(el: Element): GeoSelection {
  const raw = el.getAttribute("data-ck-value");
  const tag = el.tagName.toLowerCase();
  return {
    index: Number(el.getAttribute("data-ck-i") ?? "-1"),
    id: el.getAttribute("data-ck-id") ?? "",
    name: el.getAttribute("data-ck-name") ?? "",
    value: raw == null || raw === "" ? null : Number(raw),
    kind: tag === "path" ? "region" : "point",
  };
}

function hit(event: Event): Element | null {
  const node = event.target instanceof Element ? event.target : null;
  return node?.closest("[data-ck-name]") ?? null;
}

/** Hover, focus, and Enter/Space on regions and points. Returns a detach function. */
export function attach(svg: SVGSVGElement, options: { onSelect?: (item: GeoSelection) => void } = {}): () => void {
  const doc = svg.ownerDocument;
  const tip = doc.createElement("div");
  tip.setAttribute("data-ck-geo-tip", "");
  tip.style.cssText =
    "position:fixed;z-index:40;pointer-events:none;padding:6px 8px;border-radius:8px;background:#111;color:#fff;font:12px/1.35 ui-sans-serif,system-ui,sans-serif;transform:translate(-50%,calc(-100% - 8px));display:none;max-width:240px";
  doc.body.appendChild(tip);

  const show = (el: Element, x: number, y: number) => {
    tip.textContent = el.querySelector("title")?.textContent || el.getAttribute("aria-label") || "";
    tip.style.display = "block";
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
  };
  const hide = () => {
    tip.style.display = "none";
  };
  const onMove = (event: Event) => {
    const el = hit(event);
    if (!el || !(event instanceof MouseEvent)) {
      hide();
      return;
    }
    show(el, event.clientX, event.clientY);
  };
  const onFocus = (event: FocusEvent) => {
    const el = hit(event);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    show(el, rect.left + rect.width / 2, rect.top);
  };
  const select = (event: Event) => {
    const el = hit(event);
    if (!el) return;
    options.onSelect?.(read(el));
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const el = hit(event);
    if (!el) return;
    event.preventDefault();
    options.onSelect?.(read(el));
  };

  svg.addEventListener("mousemove", onMove);
  svg.addEventListener("mouseleave", hide);
  svg.addEventListener("focusin", onFocus);
  svg.addEventListener("focusout", hide);
  svg.addEventListener("click", select);
  svg.addEventListener("keydown", onKey);
  return () => {
    svg.removeEventListener("mousemove", onMove);
    svg.removeEventListener("mouseleave", hide);
    svg.removeEventListener("focusin", onFocus);
    svg.removeEventListener("focusout", hide);
    svg.removeEventListener("click", select);
    svg.removeEventListener("keydown", onKey);
    tip.remove();
  };
}
