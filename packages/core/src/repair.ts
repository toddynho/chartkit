import type { JsonPatchOperation } from "./diagnostics";

/** Apply one JSON Patch operation. Returns false when the path is already gone or the op does not fit. */
export function applyPatch(root: unknown, op: JsonPatchOperation): boolean {
  try {
    if (op.op === "test") {
      const loc = locate(root, op.path);
      return loc?.exists === true && JSON.stringify(read(loc)) === JSON.stringify(op.value);
    }
    if (op.op === "remove") return removeAt(root, op.path);
    if (op.op === "replace") {
      const loc = locate(root, op.path);
      if (!loc?.exists) return false;
      write(loc, op.value);
      return true;
    }
    if (op.op === "add") return addAt(root, op.path, op.value);
    if (op.op === "move" || op.op === "copy") {
      if (!op.from) return false;
      const from = locate(root, op.from);
      if (!from?.exists) return false;
      const value = structuredClone(read(from));
      if (op.op === "move" && !removeAt(root, op.from)) return false;
      return addAt(root, op.path, value);
    }
    return false;
  } catch {
    return false;
  }
}

interface Location {
  parent: Record<string, unknown> | unknown[];
  key: string;
  exists: boolean;
}

function locate(root: unknown, path: string): Location | null {
  if (!path.startsWith("/")) return null;
  const parts = path.slice(1).split("/").map(unescape);
  if (parts.length === 0 || parts[0] === "") return null;
  let parent: unknown = root;
  for (let i = 0; i < parts.length - 1; i++) {
    if (parent === null || typeof parent !== "object") return null;
    parent = (parent as Record<string, unknown>)[parts[i]];
  }
  if (parent === null || typeof parent !== "object") return null;
  const key = parts[parts.length - 1];
  const exists = Array.isArray(parent)
    ? key !== "-" && Object.prototype.hasOwnProperty.call(parent, key)
    : Object.prototype.hasOwnProperty.call(parent, key);
  return { parent: parent as Location["parent"], key, exists };
}

function read(loc: Location): unknown {
  return (loc.parent as Record<string, unknown>)[loc.key];
}

function write(loc: Location, value: unknown): void {
  if (Array.isArray(loc.parent)) loc.parent[Number(loc.key)] = value;
  else loc.parent[loc.key] = value;
}

function removeAt(root: unknown, path: string): boolean {
  const loc = locate(root, path);
  if (!loc?.exists) return false;
  if (Array.isArray(loc.parent)) loc.parent.splice(Number(loc.key), 1);
  else delete loc.parent[loc.key];
  return true;
}

function addAt(root: unknown, path: string, value: unknown): boolean {
  const loc = locate(root, path);
  if (!loc) return false;
  if (Array.isArray(loc.parent)) {
    const index = loc.key === "-" ? loc.parent.length : Number(loc.key);
    if (!Number.isInteger(index) || index < 0 || index > loc.parent.length) return false;
    loc.parent.splice(index, 0, value);
    return true;
  }
  loc.parent[loc.key] = value;
  return true;
}

function unescape(segment: string): string {
  return segment.replace(/~1/g, "/").replace(/~0/g, "~");
}
