import type { ChartSpec } from "@chartkitdev/core";
import { render } from "@chartkitdev/core/extra";
import { fromMermaid, toSpec, type ImportOptions } from "@chartkitdev/core/mermaid/phase4";

export interface FenceOptions extends ImportOptions {
  /** Convert ```mermaid fences when the diagram is a supported chart. Default true. */
  mermaid?: boolean;
}

interface Node {
  type: string;
  value?: string;
  lang?: string | null;
  tagName?: string;
  children?: Node[];
  properties?: { className?: string | string[] };
}

/**
 * Server SVG for one fence, or null when the fence should stay as source.
 * Text is escaped by the chart renderer. Mermaid click and href lines are dropped, not written as links.
 */
export function renderFence(source: string, lang: string | null | undefined, options: FenceOptions = {}): string | null {
  const kind = (lang ?? "").toLowerCase();
  const mermaid = options.mermaid !== false;
  if (kind !== "chartkit" && !(mermaid && kind === "mermaid")) return null;
  const result = kind === "chartkit" ? toSpec(source, options) : fromMermaid(source, options);
  if (!result.spec) return null;
  try {
    const svg = render(result.spec as ChartSpec);
    if (!svg.includes("<svg") || /<script/i.test(svg)) return null;
    return svg;
  } catch {
    return null;
  }
}

/** Replace ```chartkit and supported ```mermaid code nodes with an HTML node of server SVG. remark-rehype needs allowDangerousHtml. */
export function remarkChartkit(options: FenceOptions = {}) {
  return (tree: Node) => {
    walk(tree, (node, parent, index) => {
      if (node.type !== "code" || parent === undefined || index === undefined || !parent.children) return;
      const svg = renderFence(node.value ?? "", node.lang, options);
      if (!svg) return;
      parent.children[index] = { type: "html", value: svg };
    });
  };
}

/** Replace chartkit and mermaid code elements with a raw SVG node. */
export function rehypeChartkit(options: FenceOptions = {}) {
  return (tree: Node) => {
    walk(tree, (node, parent, index) => {
      if (node.tagName !== "pre" || parent === undefined || index === undefined || !parent.children) return;
      const code = node.children?.find((child) => child.tagName === "code");
      const lang = languageOf(code?.properties?.className) ?? languageOf(node.properties?.className);
      if (!lang) return;
      const svg = renderFence(textOf(code ?? node), lang, options);
      if (!svg) return;
      parent.children[index] = { type: "raw", value: svg };
    });
  };
}

function languageOf(value: string | string[] | undefined): string | null {
  const names = Array.isArray(value) ? value : typeof value === "string" ? value.split(/\s+/) : [];
  for (const name of names) {
    if (name === "language-chartkit" || name === "chartkit") return "chartkit";
    if (name === "language-mermaid" || name === "mermaid") return "mermaid";
  }
  return null;
}

function textOf(node: Node): string {
  if (typeof node.value === "string" && (!node.children || node.children.length === 0)) return node.value;
  return (node.children ?? []).map(textOf).join("");
}

function walk(node: Node, visit: (node: Node, parent: Node | undefined, index: number | undefined) => void, parent?: Node, index?: number): void {
  visit(node, parent, index);
  const children = node.children;
  if (!children) return;
  for (let i = 0; i < children.length; i++) walk(children[i], visit, node, i);
}
