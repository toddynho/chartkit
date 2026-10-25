import { mount } from "@chartkitdev/vanilla";
import type { ChartSpec } from "@chartkitdev/core";

/** Server SVG first, then the same vanilla mount ChartHost uses. */
export function hydrateCharts(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("[data-ck-mount]").forEach((host) => {
    if (host.dataset.ckMounted === "1") return;
    const node = host.querySelector("script[type='application/json']");
    if (!node?.textContent) return;
    const spec = JSON.parse(node.textContent) as ChartSpec;
    node.remove();
    mount(host, spec);
    host.dataset.ckMounted = "1";
  });
}

hydrateCharts();
