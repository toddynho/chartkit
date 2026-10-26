/**
 * Lightweight tokenizer for editable JSON and for static blocks Shiki did not paint.
 * Token colors are `--ck-code-*` on `html.code-theme` in global.css.
 */

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

type Kind = "key" | "str" | "num" | "kw" | "cm";

function span(kind: Kind | "plain", text: string): string {
  const body = escapeHtml(text);
  if (kind === "plain" || text.length === 0) return body;
  return `<span class="tok-${kind}">${body}</span>`;
}

function highlightJson(source: string): string {
  let out = "";
  let i = 0;
  while (i < source.length) {
    const char = source[i];
    if (char === '"') {
      let j = i + 1;
      while (j < source.length) {
        if (source[j] === "\\") {
          j += 2;
          continue;
        }
        if (source[j] === '"') {
          j += 1;
          break;
        }
        j += 1;
      }
      let k = j;
      while (k < source.length && /\s/.test(source[k])) k += 1;
      const kind: Kind = source[k] === ":" ? "key" : "str";
      out += span(kind, source.slice(i, j));
      i = j;
      continue;
    }
    if (char === "-" || (char >= "0" && char <= "9")) {
      const match = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(source.slice(i));
      if (match) {
        out += span("num", match[0]);
        i += match[0].length;
        continue;
      }
    }
    if (/[a-z]/.test(char)) {
      const match = /^(?:true|false|null)\b/.exec(source.slice(i));
      if (match) {
        out += span("kw", match[0]);
        i += match[0].length;
        continue;
      }
    }
    out += span("plain", char);
    i += 1;
  }
  return out;
}

const scriptKeywords = new Set([
  "as",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "default",
  "else",
  "export",
  "extends",
  "false",
  "for",
  "from",
  "function",
  "if",
  "import",
  "in",
  "interface",
  "let",
  "new",
  "null",
  "of",
  "return",
  "static",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "type",
  "typeof",
  "undefined",
  "var",
  "while",
]);

function highlightScript(source: string): string {
  let out = "";
  let i = 0;
  while (i < source.length) {
    const rest = source.slice(i);
    if (rest.startsWith("//")) {
      const end = rest.indexOf("\n");
      const length = end === -1 ? rest.length : end;
      out += span("cm", rest.slice(0, length));
      i += length;
      continue;
    }
    if (rest.startsWith("/*")) {
      const end = rest.indexOf("*/");
      const length = end === -1 ? rest.length : end + 2;
      out += span("cm", rest.slice(0, length));
      i += length;
      continue;
    }
    const quote = rest[0];
    if (quote === '"' || quote === "'" || quote === "`") {
      let j = 1;
      while (j < rest.length) {
        if (rest[j] === "\\") {
          j += 2;
          continue;
        }
        if (rest[j] === quote) {
          j += 1;
          break;
        }
        if (quote === "`" && rest[j] === "\n") break;
        j += 1;
      }
      out += span("str", rest.slice(0, j));
      i += j;
      continue;
    }
    const number = /^-?\d+(?:\.\d+)?/.exec(rest);
    if (number && (i === 0 || /[\s([{\],:=+\-*/%]/.test(source[i - 1] ?? " "))) {
      out += span("num", number[0]);
      i += number[0].length;
      continue;
    }
    const word = /^[A-Za-z_$][\w$]*/.exec(rest);
    if (word) {
      out += scriptKeywords.has(word[0]) ? span("kw", word[0]) : span("plain", word[0]);
      i += word[0].length;
      continue;
    }
    out += span("plain", rest[0]);
    i += 1;
  }
  return out;
}

function highlightShell(source: string): string {
  let out = "";
  let i = 0;
  while (i < source.length) {
    const rest = source.slice(i);
    if (rest[0] === "#") {
      const end = rest.indexOf("\n");
      const length = end === -1 ? rest.length : end;
      out += span("cm", rest.slice(0, length));
      i += length;
      continue;
    }
    if (rest[0] === '"' || rest[0] === "'") {
      const quote = rest[0];
      let j = 1;
      while (j < rest.length) {
        if (rest[j] === "\\") {
          j += 2;
          continue;
        }
        if (rest[j] === quote) {
          j += 1;
          break;
        }
        j += 1;
      }
      out += span("str", rest.slice(0, j));
      i += j;
      continue;
    }
    const flag = /^--?[\w-]+/.exec(rest);
    if (flag) {
      out += span("key", flag[0]);
      i += flag[0].length;
      continue;
    }
    out += span("plain", rest[0]);
    i += 1;
  }
  return out;
}

function highlightCss(source: string): string {
  let out = "";
  let i = 0;
  while (i < source.length) {
    const rest = source.slice(i);
    if (rest.startsWith("/*")) {
      const end = rest.indexOf("*/");
      const length = end === -1 ? rest.length : end + 2;
      out += span("cm", rest.slice(0, length));
      i += length;
      continue;
    }
    if (rest[0] === '"' || rest[0] === "'") {
      const quote = rest[0];
      let j = 1;
      while (j < rest.length && rest[j] !== quote) j += rest[j] === "\\" ? 2 : 1;
      if (j < rest.length) j += 1;
      out += span("str", rest.slice(0, j));
      i += j;
      continue;
    }
    const hex = /^#[0-9a-fA-F]{3,8}\b/.exec(rest);
    if (hex) {
      out += span("num", hex[0]);
      i += hex[0].length;
      continue;
    }
    const number = /^-?\d+(?:\.\d+)?(?:px|rem|em|%)?/.exec(rest);
    if (number && /\d/.test(number[0][0] === "-" ? number[0][1] ?? "" : number[0][0])) {
      out += span("num", number[0]);
      i += number[0].length;
      continue;
    }
    const prop = /^[a-z-]+(?=\s*:)/.exec(rest);
    if (prop) {
      out += span("key", prop[0]);
      i += prop[0].length;
      continue;
    }
    out += span("plain", rest[0]);
    i += 1;
  }
  return out;
}

function highlightHtml(source: string): string {
  let out = "";
  let i = 0;
  while (i < source.length) {
    const rest = source.slice(i);
    if (rest.startsWith("<!--")) {
      const end = rest.indexOf("-->");
      const length = end === -1 ? rest.length : end + 3;
      out += span("cm", rest.slice(0, length));
      i += length;
      continue;
    }
    if (rest[0] === "<") {
      const end = rest.indexOf(">");
      const length = end === -1 ? rest.length : end + 1;
      const chunk = rest.slice(0, length);
      const parts = chunk.split(/("[^"]*"|'[^']*')/);
      out += parts
        .map((part, index) => (index % 2 === 1 ? span("str", part) : span("kw", part)))
        .join("");
      i += length;
      continue;
    }
    out += span("plain", rest[0]);
    i += 1;
  }
  return out;
}

function normalize(lang: string): string {
  const name = lang.trim().toLowerCase();
  if (name === "json") return "json";
  if (name === "shell" || name === "bash" || name === "sh") return "shell";
  if (name === "css") return "css";
  if (name === "html" || name === "svg") return "html";
  if (name === "js" || name === "javascript" || name === "ts" || name === "typescript" || name === "tsx") return "ts";
  return name;
}

export function highlightSource(source: string, lang: string): string {
  const kind = normalize(lang);
  if (kind === "json") return highlightJson(source);
  if (kind === "shell") return highlightShell(source);
  if (kind === "css") return highlightCss(source);
  if (kind === "html") return highlightHtml(source);
  if (kind === "ts" || kind === "vue" || kind === "svelte") return highlightScript(source);
  const trimmed = source.trimStart();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return highlightJson(source);
  if (source.includes("curl ")) return highlightShell(source);
  return highlightScript(source);
}

function inferLang(code: HTMLElement): string {
  const caption = code.closest("figure")?.querySelector("figcaption")?.textContent ?? "";
  if (caption.trim()) return caption;
  const text = code.textContent ?? "";
  const trimmed = text.trimStart();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json";
  if (text.includes("curl ")) return "shell";
  if (text.includes("<template") || text.includes("</")) return "html";
  return "ts";
}

export function colorizePage(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("pre code").forEach((code) => {
    if (code.closest(".shiki, .code-field, .mermaid, pre.mermaid, .spec-editor")) return;
    if (code.dataset.colored === "1" || code.querySelector("span")) return;
    code.innerHTML = highlightSource(code.textContent ?? "", inferLang(code));
    code.dataset.colored = "1";
  });
}

export function paintField(textarea: HTMLTextAreaElement): void {
  const paint = textarea.parentElement?.querySelector<HTMLElement>("[data-spec-paint]");
  if (!paint) return;
  paint.innerHTML = highlightSource(textarea.value, "json");
  paint.scrollTop = textarea.scrollTop;
  paint.scrollLeft = textarea.scrollLeft;
}
