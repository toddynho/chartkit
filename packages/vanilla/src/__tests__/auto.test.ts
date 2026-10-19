import { describe, expect, it } from "vitest";
import { autoRender } from "../auto";
import { mermaidPhase4ScriptUrl, pageNeedsMermaidPhase4 } from "../mermaid-phase4-url";
import { mermaidScriptUrl, mountFences } from "../mount-fences";

function mountHtml(html: string): void {
  document.body.innerHTML = html;
}

describe("autoRender", () => {
  it("mounts chartkit fences and leaves mermaid fences until opted in", () => {
    mountHtml(`
      <pre class="chartkit"><code>{"version":"1","type":"bar","data":[{"lane":"A","stops":2},{"lane":"B","stops":5}],"encoding":{"x":"lane","y":"stops"},"a11y":{"alt":"Lane B has more stops."}}</code></pre>
      <pre class="mermaid"><code class="language-mermaid">pie
    title Share of workshop hours
    "Design": 42
    "Build": 35</code></pre>
      <pre class="mermaid"><code class="language-mermaid">flowchart TD
    A-->B</code></pre>
    `);
    expect(autoRender(document)).toBe(1);
    expect(document.querySelectorAll("svg")).toHaveLength(1);
    expect(document.querySelector("svg")?.getAttribute("data-ck-type")).toBe("bar");
    expect(document.querySelectorAll("pre.mermaid")).toHaveLength(2);

    expect(autoRender(document, { mermaid: true })).toBe(1);
    expect(document.querySelectorAll('svg[data-ck-type="pie"]')).toHaveLength(1);
    expect(document.body.textContent).toContain("flowchart TD");
    expect(document.querySelectorAll("pre.mermaid")).toHaveLength(1);
  });

  it("mounts a code.language-chartkit block that is not wrapped in pre.chartkit", () => {
    mountHtml(`<pre><code class="language-chartkit">pie
    title Share of workshop hours
    "Design": 40
    "Build": 10</code></pre>`);
    expect(autoRender(document)).toBe(1);
    expect(document.querySelector("pre")).toBeNull();
    expect(document.querySelector("svg")?.getAttribute("data-ck-type")).toBe("pie");
  });

  it("leaves mermaid fences in place until a parser is passed", () => {
    mountHtml(`<pre class="mermaid">pie
    title Share of workshop hours
    "Design": 42
    "Build": 10</pre>`);
    const render = () => "<svg></svg>";
    expect(mountFences(document, { mermaid: true, render, toSpec: () => ({ spec: null }) })).toBe(0);
    expect(document.querySelector("pre.mermaid")).not.toBeNull();
    expect(mermaidScriptUrl("https://cdn.example/chartkit.auto.global.js")).toBe("https://cdn.example/chartkit.mermaid.global.js");
    expect(mermaidPhase4ScriptUrl("https://cdn.example/chartkit.mermaid.global.js")).toBe("https://cdn.example/chartkit.mermaid-phase4.global.js");
    document.body.innerHTML = `<pre class="mermaid">gantt
    title Plan
    Task : 2026-03-02, 1d</pre>`;
    expect(pageNeedsMermaidPhase4(document)).toBe(true);
    document.body.innerHTML = `<pre class="mermaid">pie
    title Share
    "A": 1</pre>`;
    expect(pageNeedsMermaidPhase4(document)).toBe(false);
  });

  it("does not mount the same fence twice", () => {
    mountHtml(`<pre class="chartkit"><code class="language-chartkit">{"version":"1","type":"line","data":[{"t":"A","v":1},{"t":"B","v":2}],"encoding":{"x":"t","y":"v"},"a11y":{"alt":"The line rises from A to B."}}</code></pre>`);
    expect(autoRender(document)).toBe(1);
    expect(autoRender(document)).toBe(0);
    expect(document.querySelectorAll("svg")).toHaveLength(1);
  });
});
