import type { ChartSpec } from "@chartkitdev/core";
import { render } from "@chartkitdev/core/extra";
import { fromMermaid, toSpec, type ImportOptions } from "@chartkitdev/core/mermaid/phase4";
import { mount } from "./index";

export interface AutoRenderOptions extends ImportOptions {
  /** Also mount supported `pre.mermaid` and `code.language-mermaid` blocks. */
  mermaid?: boolean;
}

/**
 * Replace ChartKit fences under `root` with mounted charts.
 * `pre.chartkit` and `code.language-chartkit` are always eligible.
 * Mermaid fences are eligible only when `options.mermaid` is true, and unsupported diagrams are left in place.
 * Defaults: 100000 source characters, 2000 points (see `@chartkitdev/core/mermaid`).
 */
export function autoRender(root: ParentNode = document, options: AutoRenderOptions = {}): number {
  const selectors = ["pre.chartkit", "code.language-chartkit"];
  if (options.mermaid) selectors.push("pre.mermaid", "code.language-mermaid");
  const nodes = Array.from(root.querySelectorAll(selectors.join(",")));
  const blocks = nodes.filter((node) => !nodes.some((other) => other !== node && other.contains(node)));
  let mounted = 0;
  for (const node of blocks) {
    if (!(node instanceof HTMLElement)) continue;
    const mermaid = options.mermaid === true && (node.matches("pre.mermaid, code.language-mermaid") || node.closest("pre.mermaid, code.language-mermaid") !== null);
    const source = node.textContent ?? "";
    const result = mermaid ? fromMermaid(source, options) : toSpec(source, options);
    if (!result.spec) continue;
    const block = node.tagName === "CODE" && node.parentElement?.tagName === "PRE" ? node.parentElement : node;
    const host = block.ownerDocument.createElement("div");
    host.className = "chartkit";
    block.replaceWith(host);
    try {
      const markup = render(result.spec as ChartSpec);
      if (!markup.includes("<svg") || /<script/i.test(markup)) {
        host.replaceWith(block);
        continue;
      }
      mount(host, result.spec as ChartSpec, { render });
      mounted += 1;
    } catch {
      host.replaceWith(block);
    }
  }
  return mounted;
}
