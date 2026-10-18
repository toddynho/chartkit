import type { ChartSpec } from "@chartkitdev/core";
import { mount } from "./index";

export interface FenceResult {
  spec: Record<string, unknown> | null;
}

export interface FenceOptions {
  mermaid?: boolean;
  maxSource?: number;
  maxPoints?: number;
  render: (spec: ChartSpec) => string;
  toSpec: (text: string, options?: { maxSource?: number; maxPoints?: number }) => FenceResult;
  fromMermaid?: (text: string, options?: { maxSource?: number; maxPoints?: number }) => FenceResult;
}

/** Mount chart fences. Mermaid blocks are skipped unless `fromMermaid` is provided. */
export function mountFences(root: ParentNode, options: FenceOptions): number {
  const selectors = ["pre.chartkit", "code.language-chartkit"];
  const mermaidOn = options.mermaid === true && typeof options.fromMermaid === "function";
  if (mermaidOn) selectors.push("pre.mermaid", "code.language-mermaid");
  const nodes = Array.from(root.querySelectorAll(selectors.join(",")));
  const blocks = nodes.filter((node) => !nodes.some((other) => other !== node && other.contains(node)));
  let mounted = 0;
  for (const node of blocks) {
    if (!(node instanceof HTMLElement)) continue;
    const mermaid = mermaidOn && (node.matches("pre.mermaid, code.language-mermaid") || node.closest("pre.mermaid, code.language-mermaid") !== null);
    const source = node.textContent ?? "";
    const limits = { maxSource: options.maxSource, maxPoints: options.maxPoints };
    const result = mermaid ? options.fromMermaid!(source, limits) : options.toSpec(source, limits);
    if (!result.spec) continue;
    const block = node.tagName === "CODE" && node.parentElement?.tagName === "PRE" ? node.parentElement : node;
    const host = block.ownerDocument.createElement("div");
    host.className = "chartkit";
    block.replaceWith(host);
    try {
      const markup = options.render(result.spec as ChartSpec);
      if (!markup.includes("<svg") || /<script/i.test(markup)) {
        host.replaceWith(block);
        continue;
      }
      mount(host, result.spec as ChartSpec, { render: options.render });
      mounted += 1;
    } catch {
      host.replaceWith(block);
    }
  }
  return mounted;
}

/** Sibling URL for the on-demand Mermaid parser next to chartkit.auto.global.js. */
export function mermaidScriptUrl(scriptSrc: string): string {
  return new URL("chartkit.mermaid.global.js", scriptSrc).href;
}
