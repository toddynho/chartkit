import { createHighlighter, type Highlighter } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

const langs = ["json", "typescript", "tsx", "vue", "svelte", "bash", "css", "html", "javascript"] as const;

let pending: Promise<Highlighter> | null = null;

function highlighter(): Promise<Highlighter> {
  pending ??= createHighlighter({
    themes: ["github-light"],
    langs: [...langs],
    engine: createJavaScriptRegexEngine(),
  });
  return pending;
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/** Server highlight for static code. GitHub Light stays in the neutral range. */
export async function highlight(code: string, lang: string): Promise<string> {
  const source = code.endsWith("\n") ? code : `${code}\n`;
  try {
    const hl = await highlighter();
    return hl.codeToHtml(source, { lang, theme: "github-light" });
  } catch {
    return `<pre class="shiki"><code>${escapeHtml(source)}</code></pre>`;
  }
}

const frameworkLang: Record<string, string> = {
  react: "tsx",
  vue: "vue",
  svelte: "svelte",
  vanilla: "typescript",
  server: "typescript",
};

export function frameworkLanguage(id: string): string {
  return frameworkLang[id] ?? "typescript";
}
