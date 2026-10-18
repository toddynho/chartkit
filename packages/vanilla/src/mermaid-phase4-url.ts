/** Sibling URL for the phase-4 Mermaid parsers, next to chartkit.mermaid.global.js. */
export function mermaidPhase4ScriptUrl(scriptSrc: string): string {
  return new URL("chartkit.mermaid-phase4.global.js", scriptSrc).href;
}

/** True when a Mermaid fence needs gantt, timeline, journey, venn, or quadrantChart. */
export function pageNeedsMermaidPhase4(root: ParentNode): boolean {
  const nodes = root.querySelectorAll("pre.mermaid, code.language-mermaid");
  for (const node of Array.from(nodes)) {
    if (/\b(gantt|timeline|journey|venn|quadrantChart)\b/i.test(node.textContent ?? "")) return true;
  }
  return false;
}
