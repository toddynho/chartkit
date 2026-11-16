import type { Diagnostic } from "../diagnostics";
import { suggestAlt } from "../suggest";

export interface JsonSchema {
  $ref?: string;
  $defs?: Record<string, JsonSchema>;
  type?: string | string[];
  const?: unknown;
  enum?: unknown[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  items?: JsonSchema;
  oneOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  allOf?: JsonSchema[];
  if?: JsonSchema;
  then?: JsonSchema;
  else?: JsonSchema;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  minItems?: number;
  maxItems?: number;
  minProperties?: number;
  pattern?: string;
  description?: string;
}

export interface Ctx {
  rootSchema: JsonSchema;
  rootValue: unknown;
  out: Diagnostic[];
  depth: number;
  /** "parentPath|property" required keys already explained by a repair patch. */
  skipMissing: Set<string>;
  /** JSON pointers whose unknown-property error is replaced by a repair patch. */
  skipUnknown: Set<string>;
  /** JSON pointers the walker must not descend into. A repair already explains them. */
  dropPaths: Set<string>;
  /** JSON pointers whose own schema error is replaced by a repair patch. */
  explained: Set<string>;
  /** `if` / `then` re-enters the root. The metric hoist must run once. */
  metricNoted: boolean;
}

export function stringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || item.length === 0) return undefined;
    out.push(item);
  }
  return out;
}

export function pointer(root: unknown, path: string): unknown {
  let current: unknown = root;
  if (path === "") return current;
  for (const part of path.slice(1).split("/")) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function isDropped(path: string, ctx: Ctx): boolean {
  for (const prefix of ctx.dropPaths) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return true;
  }
  return false;
}

export function firstRow(data: unknown): Record<string, unknown> | undefined {
  if (Array.isArray(data) && data.length === 1 && isPlainObject(data[0])) return data[0];
  if (isPlainObject(data) && !isPlainObject(data.columns) && typeof data.value === "number") return data;
  return undefined;
}

export function fieldName(channel: unknown): string | undefined {
  if (typeof channel === "string") return channel;
  if (isPlainObject(channel) && typeof channel.field === "string") return channel.field;
  return undefined;
}

export function lengthIssue(path: string, expected: string, value: string, ctx: Ctx): Diagnostic {
  const hint =
    path === "/a11y/alt"
      ? `describe the key takeaway in one sentence; suggested: "${suggestAlt(ctx.rootValue)}"`
      : undefined;
  const summary = path === "/a11y/alt" ? suggestAlt(ctx.rootValue) : undefined;
  return {
    code: "CK1006",
    severity: "error",
    message: `${showPath(path)} must be ${expected}, got ${quote(value)}`,
    path,
    hint,
    fix: summary ? [{ op: "replace", path, value: summary }] : undefined,
  };
}

export function emit(ctx: Ctx, diagnostic: Diagnostic): void {
  ctx.out.push(diagnostic);
}

export function resolve(schema: JsonSchema, root: JsonSchema): JsonSchema {
  if (!schema.$ref) return schema;
  if (schema.$ref === "#") return root;
  const match = /^#\/\$defs\/([^/]+)$/.exec(schema.$ref);
  if (!match) return schema;
  return root.$defs?.[match[1]] ?? schema;
}

export function isSchema(value: unknown): value is JsonSchema {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !isTypedArray(value);
}

export function isTypedArray(value: unknown): boolean {
  return ArrayBuffer.isView(value) && !(value instanceof DataView);
}

export function isArrayLike(value: unknown): boolean {
  return Array.isArray(value) || isTypedArray(value);
}

export function asList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (isTypedArray(value)) return Array.from(value as ArrayLike<unknown>);
  return [];
}

export function typeMatches(value: unknown, type: string): boolean {
  switch (type) {
    case "object":
      return isPlainObject(value);
    case "array":
      return isArrayLike(value);
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "integer":
      return typeof value === "number" && Number.isInteger(value);
    case "boolean":
      return typeof value === "boolean";
    case "null":
      return value === null;
    default:
      return false;
  }
}

export function scalarTypes(schema: JsonSchema, root: JsonSchema): string[] | null {
  const node = resolve(schema, root);
  if (
    node.enum ||
    node.const !== undefined ||
    node.oneOf ||
    node.anyOf ||
    node.allOf ||
    node.properties ||
    node.$ref ||
    node.pattern ||
    node.minLength !== undefined ||
    node.minimum !== undefined ||
    node.maximum !== undefined
  ) {
    return null;
  }
  if (!node.type) return null;
  return Array.isArray(node.type) ? node.type : [node.type];
}

const patterns = new Map<string, RegExp>();
export function pattern(source: string): RegExp {
  let compiled = patterns.get(source);
  if (!compiled) {
    compiled = new RegExp(source);
    patterns.set(source, compiled);
  }
  return compiled;
}

export function join(base: string, segment: string): string {
  return `${base}/${segment.replace(/~/g, "~0").replace(/\//g, "~1")}`;
}

export function showPath(path: string): string {
  return path || "/";
}

export function describe(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (isTypedArray(value)) return "array";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return Number.isFinite(value) ? "number" : "number";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "object") return "object";
  return typeof value;
}

export function quote(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (value === undefined) return "undefined";
  if (typeof value === "number" || typeof value === "boolean" || value === null) return String(value);
  return describe(value);
}

/** Up to three close spellings. A match has to be a small edit, not merely within a fixed distance. */
export function nearMatches(input: string, choices: readonly string[], maxDistance: number): string[] {
  const lower = input.toLowerCase();
  const found: { choice: string; distance: number; index: number }[] = [];
  for (let index = 0; index < choices.length; index++) {
    const choice = choices[index] ?? "";
    if (!choice || choice === input) continue;
    const distance = levenshtein(lower, choice.toLowerCase());
    const limit = Math.min(maxDistance, Math.max(1, Math.floor(Math.min(input.length, choice.length) * 0.34)));
    if (distance > 0 && distance <= limit && distance < choice.length) found.push({ choice, distance, index });
  }
  found.sort((a, b) => a.distance - b.distance || a.index - b.index);
  const out: string[] = [];
  for (const item of found) {
    if (out.length === 3) break;
    if (!out.includes(item.choice)) out.push(item.choice);
  }
  return out;
}

export function nearest(input: string, choices: readonly string[], maxDistance: number): string | undefined {
  return nearMatches(input, choices, maxDistance)[0];
}

export function suggestHint(choices: readonly string[]): string | undefined {
  if (choices.length === 0) return undefined;
  if (choices.length === 1) return `did you mean ${quote(choices[0])}?`;
  if (choices.length === 2) return `did you mean ${quote(choices[0])} or ${quote(choices[1])}?`;
  return `did you mean ${quote(choices[0])}, ${quote(choices[1])}, or ${quote(choices[2])}?`;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const row = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) row[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const saved = row[j];
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = saved;
    }
  }
  return row[b.length];
}
