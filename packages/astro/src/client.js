import { mount } from "@chartkitdev/vanilla";

/**
 * Attach `mount()` from `@chartkitdev/vanilla` to every server-rendered `[data-chartkit]` host.
 * The SVG is already in the host. `mount` patches that node instead of drawing a second chart runtime.
 *
 * @param {ParentNode} [root]
 */
export function hydrate(root = document) {
  root.querySelectorAll("[data-chartkit]").forEach((host) => {
    if (!(host instanceof HTMLElement) || host.dataset.chartkitOn === "1") return;
    const node = host.querySelector("script[type='application/json']");
    const text = node?.textContent;
    if (!text) return;
    const spec = JSON.parse(text);
    node.remove();
    mount(host, spec);
    host.dataset.chartkitOn = "1";
  });
}
