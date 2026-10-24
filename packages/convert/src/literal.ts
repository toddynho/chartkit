import { dropped, warn, type ConvertWarning } from "./model";

export interface ParseResult {
  value: unknown;
  warnings: ConvertWarning[];
}

/** Parse one JS literal (object, array, or scalar), including a leading assignment. */
export function parseLiteral(source: string): ParseResult {
  const warnings: ConvertWarning[] = [];
  const p = new Parser(stripComments(source), warnings);
  p.skip();
  if (p.done()) return { value: undefined, warnings };
  // const name = ..., option = ..., module.exports = ...
  if (/[A-Za-z_$]/.test(p.peek())) {
    const start = p.i;
    const head = p.readIdent();
    if (head === "const" || head === "let" || head === "var") {
      p.skip();
      p.readIdent();
    }
    p.skip();
    if (p.peek() === ".") {
      while (p.peek() === ".") {
        p.i += 1;
        p.skip();
        p.readIdent();
        p.skip();
      }
    }
    if (p.peek() === "=" && p.src[p.i + 1] !== "=") {
      p.i += 1;
      p.skip();
    } else {
      p.i = start;
    }
  }
  if (p.startsWith("new ")) {
    p.i += 4;
    p.skip();
    p.readIdent();
    p.skip();
    if (p.peek() === "(") {
      p.i += 1;
      p.skip();
      p.value();
      p.skip();
      if (p.peek() === ",") {
        p.i += 1;
        p.skip();
        const value = p.value();
        return { value, warnings };
      }
    }
  }
  return { value: p.value(), warnings };
}

export interface JsxNode {
  name: string;
  props: Record<string, unknown>;
  children: JsxNode[];
}

export interface JsxParse {
  root: JsxNode | null;
  bindings: Record<string, unknown>;
  warnings: ConvertWarning[];
}

/** A constrained JSX reader: tags, literal attributes, and const bindings of literals. */
export function parseJsx(source: string): JsxParse {
  const warnings: ConvertWarning[] = [];
  const cleaned = stripComments(source);
  const bindings: Record<string, unknown> = {};
  const binding = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*/g;
  for (const match of cleaned.matchAll(binding)) {
    const name = match[1];
    if (!name || match.index === undefined) continue;
    const p = new Parser(cleaned, warnings);
    p.i = match.index + match[0].length;
    try {
      bindings[name] = p.value();
    } catch {
      warnings.push(warn("CK8103", `Could not read the binding ${name}.`, name));
    }
  }
  const tagAt = cleaned.search(/<[A-Z]/);
  if (tagAt < 0) return { root: null, bindings, warnings };
  const p = new Parser(cleaned, warnings);
  p.i = tagAt;
  const root = p.jsx(bindings);
  return { root, bindings, warnings };
}

class Parser {
  i = 0;
  constructor(
    readonly src: string,
    readonly warnings: ConvertWarning[],
  ) {}

  done(): boolean {
    return this.i >= this.src.length;
  }

  peek(): string {
    return this.src[this.i] ?? "";
  }

  startsWith(text: string): boolean {
    return this.src.startsWith(text, this.i);
  }

  skip(): void {
    while (this.i < this.src.length && /\s/.test(this.src[this.i] ?? "")) this.i += 1;
  }

  readIdent(): string {
    const start = this.i;
    if (/[A-Za-z_$]/.test(this.peek())) {
      this.i += 1;
      while (/[\w$]/.test(this.peek())) this.i += 1;
    }
    return this.src.slice(start, this.i);
  }

  value(): unknown {
    this.skip();
    const c = this.peek();
    if (c === "{") return this.object();
    if (c === "[") return this.array();
    if (c === '"' || c === "'") return this.string();
    if (c === "`") return this.template();
    if (c === "-" || c === "+" || /[0-9]/.test(c)) return this.number();
    if (this.startsWith("function") || this.startsWith("async ") || this.startsWith("() =>") || this.startsWith("async(")) {
      return this.skipFn("function");
    }
    if (/[A-Za-z_$]/.test(c)) {
      const ident = this.readIdent();
      this.skip();
      if (this.startsWith("=>")) return this.skipFn("function");
      if (ident === "true") return true;
      if (ident === "false") return false;
      if (ident === "null") return null;
      if (ident === "undefined") return dropped("undefined");
      if (ident === "new") return this.skipFn("constructor");
      return { __ident: ident };
    }
    if (c === "(") return this.groupOrArrow();
    this.warnings.push(warn("CK8103", `Stopped at “${this.src.slice(this.i, this.i + 12)}”.`, ""));
    return dropped("unparsed");
  }

  object(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    this.i += 1;
    this.skip();
    while (!this.done() && this.peek() !== "}") {
      let key = "";
      if (this.peek() === '"' || this.peek() === "'") key = String(this.string());
      else key = this.readIdent();
      this.skip();
      if (this.peek() === ":") this.i += 1;
      out[key] = this.value();
      this.skip();
      if (this.peek() === ",") this.i += 1;
      this.skip();
    }
    if (this.peek() === "}") this.i += 1;
    return out;
  }

  array(): unknown[] {
    const out: unknown[] = [];
    this.i += 1;
    this.skip();
    while (!this.done() && this.peek() !== "]") {
      out.push(this.value());
      this.skip();
      if (this.peek() === ",") this.i += 1;
      this.skip();
    }
    if (this.peek() === "]") this.i += 1;
    return out;
  }

  string(): string {
    const quote = this.peek();
    this.i += 1;
    let out = "";
    while (!this.done() && this.peek() !== quote) {
      if (this.peek() === "\\") {
        this.i += 1;
        const esc = this.peek();
        out += esc === "n" ? "\n" : esc === "t" ? "\t" : esc;
        this.i += 1;
        continue;
      }
      out += this.peek();
      this.i += 1;
    }
    if (this.peek() === quote) this.i += 1;
    return out;
  }

  template(): unknown {
    if (this.src.includes("${", this.i)) return this.skipFn("template");
    return this.string();
  }

  number(): number | { __dropped: true; reason: string } {
    const start = this.i;
    if (this.peek() === "+" || this.peek() === "-") this.i += 1;
    while (/[0-9._eE+-]/.test(this.peek())) this.i += 1;
    const raw = this.src.slice(start, this.i);
    const value = Number(raw);
    if (!Number.isFinite(value)) return dropped("number");
    return value;
  }

  groupOrArrow(): unknown {
    const start = this.i;
    this.skipBalanced();
    this.skip();
    if (this.startsWith("=>")) {
      this.i = start;
      return this.skipFn("function");
    }
    this.i = start;
    return this.skipFn("expression");
  }

  skipFn(reason: string): { __dropped: true; reason: string } {
    this.skip();
    if (this.startsWith("async")) this.i += 5;
    this.skip();
    if (this.startsWith("function")) {
      this.i += 8;
      this.skip();
      this.readIdent();
      this.skip();
    }
    if (this.peek() === "(") this.skipBalanced();
    else if (/[A-Za-z_$]/.test(this.peek())) this.readIdent();
    this.skip();
    if (this.startsWith("=>")) this.i += 2;
    this.skip();
    if (this.peek() === "{") this.skipBalanced();
    else {
      while (!this.done() && this.peek() !== "," && this.peek() !== "}" && this.peek() !== "]" && this.peek() !== "\n") this.i += 1;
    }
    this.warnings.push(warn("CK8102", `Dropped a ${reason}.`, ""));
    return dropped(reason);
  }

  skipBalanced(): void {
    const open = this.peek();
    const close = open === "(" ? ")" : open === "{" ? "}" : open === "[" ? "]" : "";
    if (!close) return;
    let depth = 0;
    let quote = "";
    while (!this.done()) {
      const c = this.peek();
      if (quote) {
        if (c === "\\") this.i += 2;
        else {
          if (c === quote) quote = "";
          this.i += 1;
        }
        continue;
      }
      if (c === '"' || c === "'" || c === "`") {
        quote = c;
        this.i += 1;
        continue;
      }
      if (c === open) depth += 1;
      if (c === close) {
        depth -= 1;
        this.i += 1;
        if (depth === 0) return;
        continue;
      }
      this.i += 1;
    }
  }

  jsx(bindings: Record<string, unknown>): JsxNode | null {
    this.skip();
    if (this.peek() !== "<") return null;
    this.i += 1;
    const name = this.readIdent();
    const props: Record<string, unknown> = {};
    this.skip();
    while (!this.done() && this.peek() !== ">" && !this.startsWith("/>")) {
      if (this.peek() === "{") {
        this.warnings.push(warn("CK8102", "Dropped a JSX spread.", ""));
        this.skipBalanced();
        this.skip();
        continue;
      }
      const key = this.readIdent();
      this.skip();
      if (!key) break;
      if (this.peek() !== "=") {
        props[key] = true;
        this.skip();
        continue;
      }
      this.i += 1;
      this.skip();
      if (this.peek() === '"' || this.peek() === "'") props[key] = this.string();
      else if (this.peek() === "{") {
        this.i += 1;
        const inner = this.value();
        this.skip();
        if (this.peek() === "}") this.i += 1;
        props[key] = resolve(inner, bindings, this.warnings, key);
      }
      this.skip();
    }
    const self = this.startsWith("/>");
    if (self) this.i += 2;
    else if (this.peek() === ">") this.i += 1;
    const children: JsxNode[] = [];
    if (!self) {
      while (!this.done() && !this.startsWith(`</${name}`)) {
        this.skip();
        if (this.startsWith(`</${name}`)) break;
        if (this.peek() === "<") {
          const child = this.jsx(bindings);
          if (child) children.push(child);
          else break;
        } else if (this.peek() === "{") {
          this.i += 1;
          this.value();
          this.skip();
          if (this.peek() === "}") this.i += 1;
          this.warnings.push(warn("CK8102", "Dropped a JSX child expression.", name));
        } else {
          this.i += 1;
        }
      }
      const close = this.src.indexOf(">", this.i);
      if (this.startsWith(`</${name}`) && close >= 0) this.i = close + 1;
    }
    return { name, props, children };
  }
}

function resolve(value: unknown, bindings: Record<string, unknown>, warnings: ConvertWarning[], path: string): unknown {
  if (value && typeof value === "object" && "__ident" in value) {
    const name = String((value as { __ident: string }).__ident);
    if (name in bindings) return bindings[name];
    warnings.push(warn("CK8102", `No literal binding for ${name}.`, path));
    return dropped("binding");
  }
  return value;
}

function stripComments(source: string): string {
  let out = "";
  let quote = "";
  for (let i = 0; i < source.length; i += 1) {
    const c = source[i] ?? "";
    const n = source[i + 1] ?? "";
    if (quote) {
      out += c;
      if (c === "\\") {
        out += n;
        i += 1;
        continue;
      }
      if (c === quote) quote = "";
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      out += c;
      continue;
    }
    if (c === "/" && n === "/") {
      while (i < source.length && source[i] !== "\n") i += 1;
      out += "\n";
      continue;
    }
    if (c === "/" && n === "*") {
      i += 2;
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) i += 1;
      i += 1;
      out += " ";
      continue;
    }
    out += c;
  }
  return out;
}
