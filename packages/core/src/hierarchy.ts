import type { Diagnostic, JsonPatchOperation } from "./diagnostics";
import { fieldOf } from "./frame";
import { isRecord } from "./svg";

/** One node of a treemap or sunburst. `value` is the leaf size, or the sum of the children. */
export interface HNode {
  name: string;
  value: number;
  path: string[];
  children: HNode[];
}

export interface HierarchyRead {
  root: HNode;
  issues: Diagnostic[];
}

const APPLIES = new Set(["treemap", "sunburst"]);

function quote(value: string): string {
  return JSON.stringify(value);
}

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function mismatch(stated: number, sum: number): boolean {
  return Math.abs(stated - sum) > Math.max(0.01, Math.abs(sum) * 0.001);
}

function negative(name: string, path: string): Diagnostic {
  return {
    code: "CK3029",
    severity: "error",
    message: `hierarchy value is negative on ${quote(name)}`,
    path,
    hint: "Sizes are drawn from zero up. Drop the row or use a positive value.",
  };
}

function missing(name: string, path: string): Diagnostic {
  return {
    code: "CK3028",
    severity: "error",
    message: `missing parent ${quote(name)}`,
    path,
    hint: "Every node needs a parent that exists in the data, or no parent at all.",
  };
}

function cycle(name: string, path: string, fix?: JsonPatchOperation[]): Diagnostic {
  return {
    code: "CK3027",
    severity: "error",
    message: `hierarchy cycle through ${quote(name)}`,
    path,
    hint: "A node cannot be its own ancestor.",
    ...(fix ? { fix } : {}),
  };
}

function summed(name: string, path: string, sum: number): Diagnostic {
  const rounded = Math.round(sum * 1000) / 1000;
  return {
    code: "CK3030",
    severity: "error",
    message: `parent value does not match its children on ${quote(name)}`,
    path,
    hint: "Leave the parent value out and it is the sum of the leaves, or set it to that sum.",
    fix: [{ op: "replace", path, value: rounded }],
  };
}

function labelOf(node: Record<string, unknown>, fallback: string): string {
  if (typeof node.name === "string" && node.name) return node.name;
  if (typeof node.label === "string" && node.label) return node.label;
  if (typeof node.id === "string" && node.id) return node.id;
  return fallback;
}

function statedOf(node: Record<string, unknown>, valueField: string | undefined): number | undefined {
  const named = valueField ? num(node[valueField]) : undefined;
  if (named !== undefined) return named;
  const value = num(node.value);
  if (value !== undefined) return value;
  return num(node.size);
}

/** Nested `{name, value, children}`, `encoding.path`, or `encoding.id` plus `encoding.parent`. Null keeps the flat chart. */
export function readHierarchy(spec: Record<string, unknown>): HierarchyRead | null {
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const data = spec.data;
  const nested = Array.isArray(data) && data.some((row) => isRecord(row) && Array.isArray(row.children));
  const path = Array.isArray(encoding.path) && encoding.path.length > 0 && encoding.path.every((item) => typeof item === "string") ? (encoding.path as string[]) : null;
  const id = typeof encoding.id === "string" ? encoding.id : "";
  const parent = typeof encoding.parent === "string" ? encoding.parent : "";
  if (!nested && !path && !(id && parent)) return null;
  const valueField = fieldOf(encoding.y);
  const issues: Diagnostic[] = [];
  if (nested) return { root: fromNested(data as unknown[], valueField, issues), issues };
  if (path) return { root: fromPath(data, path, valueField, issues), issues };
  return { root: fromParents(data, id, parent, fieldOf(encoding.x) || id, valueField, issues), issues };
}

function fromNested(data: unknown[], valueField: string | undefined, issues: Diagnostic[]): HNode {
  const children: HNode[] = [];
  data.forEach((row, index) => {
    if (!isRecord(row)) return;
    const node = walkNested(row, `/data/${index}`, [], valueField, issues);
    if (node) children.push(node);
  });
  return wrap(children);
}

function walkNested(
  row: Record<string, unknown>,
  pointer: string,
  ancestors: string[],
  valueField: string | undefined,
  issues: Diagnostic[],
): HNode | null {
  const name = labelOf(row, "Node");
  const stated = statedOf(row, valueField);
  const valuePath = `${pointer}/${valueField && row[valueField] !== undefined ? valueField : row.value !== undefined ? "value" : "size"}`;
  if (stated !== undefined && stated < 0) issues.push(negative(name, valuePath));
  const raw = Array.isArray(row.children) ? row.children : [];
  const children: HNode[] = [];
  raw.forEach((child, index) => {
    if (!isRecord(child)) return;
    const node = walkNested(child, `${pointer}/children/${index}`, [...ancestors, name], valueField, issues);
    if (node) children.push(node);
  });
  return finish(name, [...ancestors, name], stated, children, valuePath, issues);
}

function fromPath(data: unknown, fields: string[], valueField: string | undefined, issues: Diagnostic[]): HNode {
  const rows = Array.isArray(data) ? data : [];
  const root = blank("");
  rows.forEach((row, index) => {
    if (!isRecord(row)) return;
    const stated = statedOf(row, valueField) ?? 0;
    const valuePath = `/data/${index}/${valueField || "value"}`;
    if (stated < 0) {
      issues.push(negative(String(row[fields[fields.length - 1]] ?? index), valuePath));
      return;
    }
    let cursor = root;
    const names: string[] = [];
    for (let depth = 0; depth < fields.length; depth++) {
      const field = fields[depth];
      const part = row[field];
      if (part === null || part === undefined || part === "") {
        issues.push(missing(field, `/data/${index}/${field}`));
        return;
      }
      const name = String(part);
      names.push(name);
      let child = cursor.children.find((item) => item.name === name);
      if (!child) {
        child = blank(name);
        child.path = [...names];
        cursor.children.push(child);
      }
      cursor = child;
    }
    cursor.value += stated;
  });
  return roll(root);
}

function fromParents(
  data: unknown,
  idField: string,
  parentField: string,
  nameField: string,
  valueField: string | undefined,
  issues: Diagnostic[],
): HNode {
  const rows = Array.isArray(data) ? data : [];
  interface Draft {
    name: string;
    id: string;
    parent: string;
    stated?: number;
    pathIndex: number;
    valuePath: string;
  }
  const drafts: Draft[] = [];
  const byId = new Map<string, Draft>();
  rows.forEach((row, index) => {
    if (!isRecord(row)) return;
    const id = row[idField];
    if (id === null || id === undefined || id === "") {
      issues.push(missing(idField, `/data/${index}/${idField}`));
      return;
    }
    const key = String(id);
    const parent = row[parentField];
    const stated = statedOf(row, valueField);
    const valuePath = `/data/${index}/${valueField && row[valueField] !== undefined ? valueField : "value"}`;
    if (stated !== undefined && stated < 0) issues.push(negative(key, valuePath));
    const draft: Draft = {
      name: row[nameField] === undefined || row[nameField] === null ? key : String(row[nameField]),
      id: key,
      parent: parent === null || parent === undefined || parent === "" ? "" : String(parent),
      stated,
      pathIndex: index,
      valuePath,
    };
    if (byId.has(key)) issues.push(missing(key, `/data/${index}/${idField}`));
    byId.set(key, draft);
    drafts.push(draft);
  });
  for (const draft of drafts) {
    if (draft.parent && !byId.has(draft.parent)) issues.push(missing(draft.parent, `/data/${draft.pathIndex}/${parentField}`));
  }
  const seen = new Set<string>();
  const stack = new Set<string>();
  const visit = (id: string) => {
    if (stack.has(id)) {
      const draft = byId.get(id);
      if (draft) {
        issues.push(
          cycle(draft.name, `/data/${draft.pathIndex}/${parentField}`, [
            { op: "replace", path: `/data/${draft.pathIndex}/${parentField}`, value: null },
          ]),
        );
        draft.parent = "";
      }
      return;
    }
    if (seen.has(id)) return;
    stack.add(id);
    const draft = byId.get(id);
    if (draft?.parent && byId.has(draft.parent)) visit(draft.parent);
    stack.delete(id);
    seen.add(id);
  };
  for (const draft of drafts) visit(draft.id);
  const nodes = new Map<string, HNode>();
  for (const draft of drafts) nodes.set(draft.id, { name: draft.name, value: 0, path: [], children: [] });
  const roots: HNode[] = [];
  const linked = new Set<string>();
  for (const draft of drafts) {
    if (linked.has(draft.id)) continue;
    linked.add(draft.id);
    const node = nodes.get(draft.id);
    if (!node) continue;
    const parent = draft.parent ? nodes.get(draft.parent) : undefined;
    if (parent && parent !== node) parent.children.push(node);
    else roots.push(node);
  }
  const holder = blank("");
  holder.children = roots;
  const stated = new Map<HNode, { value: number; path: string; name: string }>();
  for (const draft of drafts) {
    const node = nodes.get(draft.id);
    if (node && draft.stated !== undefined && draft.stated >= 0) stated.set(node, { value: draft.stated, path: draft.valuePath, name: draft.name });
  }
  const fill = (node: HNode, ancestors: string[]) => {
    node.path = [...ancestors, node.name];
    for (const child of node.children) fill(child, node.path);
    if (!node.children.length) {
      node.value = stated.get(node)?.value ?? 0;
      return;
    }
    const sum = node.children.reduce((total, child) => total + child.value, 0);
    const claim = stated.get(node);
    if (claim && mismatch(claim.value, sum)) issues.push(summed(claim.name, claim.path, sum));
    node.value = sum;
  };
  for (const child of holder.children) fill(child, []);
  holder.value = holder.children.reduce((total, child) => total + child.value, 0);
  if (holder.children.length === 1 && holder.children[0].children.length) return holder.children[0];
  return holder;
}

function blank(name: string): HNode {
  return { name, value: 0, path: [], children: [] };
}

function finish(
  name: string,
  path: string[],
  stated: number | undefined,
  children: HNode[],
  valuePath: string,
  issues: Diagnostic[],
): HNode | null {
  if (!children.length) {
    const value = stated !== undefined && stated > 0 ? stated : 0;
    if (value <= 0) return null;
    return { name, value, path, children };
  }
  const sum = children.reduce((total, child) => total + child.value, 0);
  if (stated !== undefined && stated >= 0 && mismatch(stated, sum)) issues.push(summed(name, valuePath, sum));
  if (sum <= 0) return null;
  return { name, value: sum, path, children };
}

function wrap(children: HNode[]): HNode {
  const value = children.reduce((total, child) => total + child.value, 0);
  if (children.length === 1 && children[0].children.length) return children[0];
  return { name: "", value, path: [], children };
}

function roll(node: HNode): HNode {
  if (!node.children.length) return node;
  for (const child of node.children) roll(child);
  node.value = node.children.reduce((total, child) => total + child.value, 0);
  if (node.children.length === 1 && !node.name) return node.children[0];
  return node;
}

/** Fold nodes past `max` into the last drawn ancestor. `max` counts rings under the root. */
export function limitDepth(node: HNode, max: number): HNode {
  const depth = Math.max(1, Math.round(max));
  const cut = (current: HNode, level: number): HNode => {
    if (level >= depth || !current.children.length) return { ...current, children: [] };
    return { ...current, children: current.children.map((child) => cut(child, level + 1)) };
  };
  return cut(node, 0);
}

/** Warn when a hierarchy channel is set on a chart that cannot paint it. */
export function foreignHierarchy(spec: Record<string, unknown>): Diagnostic[] {
  const type = typeof spec.type === "string" ? spec.type : "";
  if (APPLIES.has(type)) return [];
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const out: Diagnostic[] = [];
  if (Array.isArray(encoding.path)) {
    out.push({
      code: "CK3012",
      severity: "warning",
      message: "a path applies to treemap and sunburst",
      path: "/encoding/path",
      hint: 'Use type "treemap" or "sunburst".',
    });
  }
  if (typeof encoding.id === "string" || typeof encoding.parent === "string") {
    out.push({
      code: "CK3012",
      severity: "warning",
      message: "a parent id applies to treemap and sunburst",
      path: typeof encoding.parent === "string" ? "/encoding/parent" : "/encoding/id",
      hint: 'Set encoding.id and encoding.parent on a treemap or sunburst.',
    });
  }
  return out;
}
