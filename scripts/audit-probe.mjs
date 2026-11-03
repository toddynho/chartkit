import { mount } from "@chartkitdev/vanilla";

let current = null;

window.auditMount = (spec) => {
  current?.destroy();
  current = null;
  document.querySelectorAll(".ck-tip, [data-ck-extra-tip]").forEach((node) => node.remove());
  const host = document.getElementById("host");
  host.replaceChildren();
  const chart = document.createElement("div");
  const width = spec.size && typeof spec.size.width === "number" ? spec.size.width : 640;
  const height = spec.size && typeof spec.size.height === "number" ? spec.size.height : 360;
  chart.style.width = `${width}px`;
  chart.style.height = `${height}px`;
  chart.style.position = "relative";
  host.append(chart);
  current = mount(chart, spec);
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      if (chart.querySelector("svg") || Date.now() - start > 4000) resolve(true);
      else setTimeout(tick, 40);
    };
    tick();
  });
};

function readTip(svg) {
  const tip = document.querySelector(".ck-tip, [data-ck-extra-tip], [data-ck-tip]");
  const cross = !!svg.querySelector("[data-ck-crosshair]");
  if (!tip) return { present: false, text: "", cross };
  const hidden = tip.hasAttribute("hidden") || getComputedStyle(tip).display === "none" || getComputedStyle(tip).visibility === "hidden";
  const text = (tip.textContent || "").trim();
  return { present: !hidden && text.length > 0, text, cross };
}

window.auditHover = () => {
  const svg = document.querySelector("#host svg");
  if (!svg) return { present: false, text: "", cross: false, reason: "no-svg" };
  const rect = svg.getBoundingClientRect();
  const points = [{ target: svg, clientX: rect.left + rect.width * 0.5, clientY: rect.top + rect.height * 0.45 }];
  for (const mark of svg.querySelectorAll("[data-ck-mark]")) {
    const box = mark.getBoundingClientRect();
    points.push({ target: mark, clientX: box.left + box.width / 2, clientY: box.top + Math.max(box.height / 2, 1) });
    if (points.length > 12) break;
  }
  let best = { present: false, text: "", cross: false };
  for (const point of points) {
    point.target.dispatchEvent(new PointerEvent("pointermove", { clientX: point.clientX, clientY: point.clientY, bubbles: true, pointerId: 1, pointerType: "mouse" }));
    const result = readTip(svg);
    if (result.present || result.cross) return result;
    best = result;
  }
  return best;
};
