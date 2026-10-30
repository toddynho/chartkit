import { createHighlighter, type Highlighter, type ThemeRegistrationRaw } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

const langs = ["json", "typescript", "tsx", "vue", "svelte", "astro", "bash", "css", "html", "javascript"] as const;

/**
 * Token colors are CSS variables on `html.code-theme` in global.css.
 * Retune that block; this theme only points Shiki at the same hooks.
 */
const chartkitCode: ThemeRegistrationRaw = {
  name: "chartkit-code",
  type: "dark",
  colors: {
    "editor.background": "var(--ck-code-bg)",
    "editor.foreground": "var(--ck-code-fg)",
  },
  settings: [
    { settings: { foreground: "var(--ck-code-fg)" } },
    {
      scope: ["comment", "punctuation.definition.comment", "comment.line", "comment.block"],
      settings: { foreground: "var(--ck-code-comment)" },
    },
    {
      scope: ["string", "string.quoted", "string.template"],
      settings: { foreground: "var(--ck-code-string)" },
    },
    {
      scope: ["punctuation.definition.string", "punctuation.support.type.property-name.begin", "punctuation.support.type.property-name.end"],
      settings: { foreground: "var(--ck-code-string)" },
    },
    {
      scope: ["constant.numeric"],
      settings: { foreground: "var(--ck-code-number)" },
    },
    {
      scope: ["constant.language", "keyword", "storage", "storage.type", "keyword.operator.expression", "keyword.control"],
      settings: { foreground: "var(--ck-code-keyword)" },
    },
    {
      scope: ["support.type.property-name", "entity.name.tag", "entity.other.attribute-name"],
      settings: { foreground: "var(--ck-code-key)" },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call"],
      settings: { foreground: "var(--ck-code-function)" },
    },
    {
      scope: ["punctuation", "meta.brace"],
      settings: { foreground: "var(--ck-code-punctuation)" },
    },
    {
      scope: ["variable", "support.variable", "variable.other"],
      settings: { foreground: "var(--ck-code-fg)" },
    },
  ],
};

let pending: Promise<Highlighter> | null = null;

function highlighter(): Promise<Highlighter> {
  pending ??= createHighlighter({
    themes: [chartkitCode],
    langs: [...langs],
    engine: createJavaScriptRegexEngine(),
  });
  return pending;
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/** Server highlight for static code. Colors come from `html.code-theme`. */
export async function highlight(code: string, lang: string): Promise<string> {
  const source = code.endsWith("\n") ? code : `${code}\n`;
  try {
    const hl = await highlighter();
    return hl.codeToHtml(source, { lang, theme: "chartkit-code" });
  } catch {
    return `<pre class="shiki code-theme"><code>${escapeHtml(source)}</code></pre>`;
  }
}

const frameworkLang: Record<string, string> = {
  react: "tsx",
  vue: "vue",
  svelte: "svelte",
  astro: "astro",
  vanilla: "typescript",
  server: "typescript",
};

export function frameworkLanguage(id: string): string {
  return frameworkLang[id] ?? "typescript";
}
