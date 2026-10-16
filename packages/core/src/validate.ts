import schemaJson from "./generated/schema.runtime.json";
import { toResult, type Diagnostic, type ValidationResult } from "./diagnostics";
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

  diagnostics.sort((a, b) => {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Runtime schema the walker checks against. Descriptions, titles, defaults, and
 * examples are stripped; the annotated document is `@chartkitdev/core/schema.json`.
 */
export { schemaJson as schema };
