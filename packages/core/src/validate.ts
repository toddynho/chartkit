import schemaJson from "./generated/schema.runtime.json";
import { toResult, type Diagnostic, type JsonPatchOperation, type ValidationResult } from "./diagnostics";
import { applyPatch } from "./repair";
import { semanticChecks } from "./semantic";
import { walkSchema } from "./walker";

export { suggestAlt } from "./suggest";

const schema = schemaJson as unknown as Parameters<typeof walkSchema>[1];

/**
 * Validate a chart spec. Structural checks come from the v1 JSON Schema;
 * data-aware checks add field, scale, and design diagnostics.
 *
 * `data` overrides `spec.data` for the data-aware checks (the spec object is not mutated).
 * A string is parsed as JSON first (CK1001 on failure). All diagnostics are returned in one pass.
 */
export function validate(spec: unknown, data?: unknown): ValidationResult {
  if (typeof spec === "string") {
    try {
      spec = JSON.parse(spec) as unknown;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return toResult([
        {
          code: "CK1001",
          severity: "error",
          message: `invalid JSON: ${message}`,
          path: "",
          hint: "Shows the exact location. Common causes: trailing comma, single quotes.",
        },
      ]);
    }
  }

  const diagnostics: Diagnostic[] = [];
  walkSchema(spec, schema, diagnostics);

  if (data !== undefined && isRecord(spec)) {
    semanticChecks({ ...spec, data }, diagnostics);
  } else {
    semanticChecks(spec, diagnostics);
  }

  const phase4 = phase4Type(spec);
  if (phase4) {
    for (let index = diagnostics.length - 1; index >= 0; index -= 1) {
      const item = diagnostics[index];
      if (item.code === "CK1005" && item.path === "/type") diagnostics.splice(index, 1);
      else if (phase4 === "quadrant" && item.code === "CK1002" && item.path === "/quadrants") diagnostics.splice(index, 1);
    }
    diagnostics.push({
      code: "CK1011",
      severity: "warning",
      message: "field rules for this chart live in validate/phase4",
      path: "/type",
      hint: 'await validateAsync(spec), or import { validatePhase4 } from "@chartkitdev/core/validate/phase4".',
    });
  }

  diagnostics.sort((a, b) => {
    const rank = repairRank(a) - repairRank(b);
    if (rank !== 0) return rank;
    if (a.severity !== b.severity) return a.severity === "error" ? -1 : 1;
    if (a.path !== b.path) return a.path < b.path ? -1 : 1;
    return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
  });

  const seen = new Set<string>();
  const unique = diagnostics.filter((diagnostic) => {
    const key = `${diagnostic.severity}|${diagnostic.code}|${diagnostic.path}|${diagnostic.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return toResult(unique);
}

export interface RepairResult extends ValidationResult {
  /** Spec after every safe patch that still applied. The input is not mutated. */
  spec: unknown;
  /** Patches that were applied, in order. */
  applied: JsonPatchOperation[];
}

const MAX_REPAIR_ROUNDS = 8;

/**
 * Apply the validator's safe JSON Patch fixes and revalidate.
 * Stops when the spec is valid, when no patch still applies, or after a few rounds.
 * Patches whose path is already gone are skipped. Nothing is invented beyond `fix`.
 */
export function repair(spec: unknown, data?: unknown): RepairResult {
  if (typeof spec === "string") {
    try {
      spec = JSON.parse(spec) as unknown;
    } catch {
      return { spec, ...validate(spec, data), applied: [] };
    }
  }

  let current = structuredClone(spec);
  const applied: JsonPatchOperation[] = [];
  let result = validate(current, data);

  for (let round = 0; round < MAX_REPAIR_ROUNDS && !result.ok; round++) {
    const ops = result.errors.flatMap((error) => error.fix ?? []);
    if (ops.length === 0) break;
    const before = applied.length;
    for (const op of ops) {
      if (applyPatch(current, op)) applied.push(op);
    }
    if (applied.length === before) break;
    const next = validate(current, data);
    if (!next.ok && sameErrors(result, next)) break;
    result = next;
  }

  return { spec: current, ...result, applied };
}

function sameErrors(a: ValidationResult, b: ValidationResult): boolean {
  if (a.errors.length !== b.errors.length) return false;
  return a.errors.every((error, index) => `${error.code}|${error.path}|${error.message}` === `${b.errors[index]?.code}|${b.errors[index]?.path}|${b.errors[index]?.message}`);
}

/** CK1009 repair hints sort first. Agents and the harness keep only the first few errors. */
function repairRank(diagnostic: Diagnostic): number {
  if (diagnostic.code === "CK1009") return 0;
  if (diagnostic.code === "CK1005") return 1;
  return 2;
}

const PHASE4 = " gantt timeline quadrant venn journey ";

function phase4Type(spec: unknown): string {
  if (!isRecord(spec) || typeof spec.type !== "string") return "";
  return PHASE4.includes(` ${spec.type} `) ? spec.type : "";
}

/**
 * `validate()` plus the gantt, timeline, quadrant, venn, and journey field rules.
 * The rules load from `@chartkitdev/core/validate/phase4` on demand. Other types stay synchronous.
 */
export function validateAsync(spec: unknown, data?: unknown): Promise<ValidationResult> {
  if (!phase4Type(spec)) return Promise.resolve(validate(spec, data));
  return import("./validate-phase4").then((mod) => mod.validatePhase4(spec, data));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Runtime schema the walker checks against. Descriptions, titles, defaults, and
 * examples are stripped; the annotated document is `@chartkitdev/core/schema.json`.
 */
export { schemaJson as schema };
