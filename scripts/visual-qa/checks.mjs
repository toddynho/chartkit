/**
 * Layout measurements run inside the page.
 * Pass measureCharts to page.evaluate. It has no Node dependencies.
 * These checks record problems. They do not gate CI.
 */

/**
 * @returns {Array<{ type: string, severity: string, detail: string }>}
 */
export function measureCharts() {
  const SCROLL_SLACK = 1;
  const BOX_SLACK = 2;
  const findings = [];

  const doc = document.documentElement;
  if (doc.scrollWidth > window.innerWidth + BOX_SLACK) {
    findings.push({
      type: "page-overflow",
      severity: "medium",
      detail: `Page is ${doc.scrollWidth}px wide in a ${window.innerWidth}px viewport`,
    });
  }

  const panes = chartPanes().filter(isShown);
  for (const pane of panes) {
    const name = paneName(pane);
    const style = getComputedStyle(pane);
    const canScroll = style.overflowY === "auto" || style.overflowY === "scroll" || style.overflowY === "overlay";
    if (canScroll && pane.scrollHeight > pane.clientHeight + SCROLL_SLACK) {
      findings.push({
        type: "pane-scrollbar",
        severity: "high",
        detail: `${name} scrolls (scrollHeight ${pane.scrollHeight} > clientHeight ${pane.clientHeight})`,
      });
    }
    if (pane.clientWidth < 8 || pane.clientHeight < 8) {
      findings.push({
        type: "empty-chart",
        severity: "high",
        detail: `${name} is ${Math.round(pane.clientWidth)}×${Math.round(pane.clientHeight)}`,
      });
    }

    const svgs = [...pane.querySelectorAll("svg")].filter((svg) => svg instanceof SVGSVGElement && !isThumb(svg));
    if ((pane.id === "response-chart" || pane.classList.contains("play-card__chart")) && svgs.length === 0 && !pane.querySelector("canvas")) {
      findings.push({
        type: "empty-chart",
        severity: "high",
        detail: `${name} has no chart`,
      });
    }

    for (const svg of svgs) {
      const box = svg.getBoundingClientRect();
      const host = pane.getBoundingClientRect();
      if (box.width < 8 || box.height < 8) {
        findings.push({
          type: "empty-chart",
          severity: "high",
          detail: `${name} SVG is ${Math.round(box.width)}×${Math.round(box.height)}`,
        });
      }
      if (
        box.right > host.right + BOX_SLACK ||
        box.bottom > host.bottom + BOX_SLACK ||
        box.left < host.left - BOX_SLACK ||
        box.top < host.top - BOX_SLACK
      ) {
        findings.push({
          type: "svg-overflow",
          severity: "high",
          detail: `${name} SVG ${Math.round(box.width)}×${Math.round(box.height)} extends outside ${Math.round(host.width)}×${Math.round(host.height)}`,
        });
      }
      if (svg.classList.contains("ck-chart-error") || chartIsEmpty(svg)) {
        findings.push({
          type: "empty-chart",
          severity: "high",
          detail: `${name} chart has no marks`,
        });
      }
      for (const overlap of textOverlaps(svg)) {
        findings.push({
          type: "text-overlap",
          severity: "medium",
          detail: `${name}: ${overlap}`,
        });
      }
    }
  }

  return findings;

  function chartPanes() {
    const set = new Set();
    for (const node of document.querySelectorAll("#response-chart, .play-card__chart")) {
      if (node instanceof HTMLElement && !isThumb(node)) set.add(node);
    }
    for (const svg of document.querySelectorAll("svg.ck-chart, svg[data-ck-type]")) {
      if (!(svg instanceof SVGSVGElement) || isThumb(svg)) continue;
      const parent = svg.parentElement;
      if (parent instanceof HTMLElement) set.add(parent);
    }
    return [...set];
  }

  function isThumb(node) {
    return Boolean(node.closest(".play-ex__thumb, .docs-sidebar, header, nav, .ex-switch__menu"));
  }

  function isShown(node) {
    if (!(node instanceof Element) || node.closest("[hidden]")) return false;
    const style = getComputedStyle(node);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  function paneName(pane) {
    if (pane.id) return `#${pane.id}`;
    const type = pane.querySelector("svg")?.getAttribute("data-ck-type");
    if (type) return type;
    return pane.className?.toString?.().split(" ")[0] || "chart";
  }

  function chartIsEmpty(svg) {
    const shapes = [...svg.querySelectorAll("path, circle, ellipse, polygon, polyline, line, rect")];
    return shapes.every((node) => {
      if (node.tagName.toLowerCase() !== "rect") return false;
      return node.getAttribute("width") === "100%" && node.getAttribute("height") === "100%";
    });
  }

  function textOverlaps(svg) {
    const texts = [...svg.querySelectorAll("text")]
      .map((node) => {
        const box = node.getBoundingClientRect();
        const label = (node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40);
        return { label, x: box.x, y: box.y, w: box.width, h: box.height };
      })
      .filter((item) => item.label && item.w > 1 && item.h > 1);
    const notes = [];
    for (let i = 0; i < texts.length; i++) {
      for (let j = i + 1; j < texts.length; j++) {
        const a = texts[i];
        const b = texts[j];
        const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        if (ix <= 2 || iy <= 2) continue;
        const area = ix * iy;
        const smaller = Math.min(a.w * a.h, b.w * b.h);
        if (smaller <= 0 || area < smaller * 0.2) continue;
        notes.push(`"${a.label}" overlaps "${b.label}"`);
        if (notes.length >= 6) return notes;
      }
    }
    return notes;
  }
}
