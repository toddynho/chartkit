/** RFC 6902 JSON Patch operation. Agents can apply `fix` directly. */
export interface JsonPatchOperation {
  op: "add" | "remove" | "replace" | "move" | "copy" | "test";
  path: string;
  value?: unknown;
  from?: string;
}

export type Severity = "error" | "warning";

/**
 * One diagnostic. Codes are stable (CK1xxx structure, CK2xxx data,
 * CK3xxx semantics, CK4xxx design advice). CK1010 means no renderer is registered
 * for the spec type. Messages may improve; codes do not.
 * CK3020–CK3022 belong to range and error bars. Time and data use CK3023–CK3026.
 * Hierarchy uses CK3027–CK3030. Canvas and large data use CK3031–CK3033.
 * Interaction+ uses CK3034–CK3039. Layout uses CK3040–CK3049.
 * Geo uses CK3050–CK3056 in @chartkitdev/geo.
 */
export interface Diagnostic {
  code: string;
  severity: Severity;
  message: string;
  /** JSON pointer. Empty string is the document root. */
  path: string;
  hint?: string;
  fix?: JsonPatchOperation[];
}

export interface ValidationResult {
  /** True when there are no errors. Warnings do not fail validation. */
  ok: boolean;
  diagnostics: Diagnostic[];
  errors: Diagnostic[];
  warnings: Diagnostic[];
}

export function toResult(diagnostics: Diagnostic[]): ValidationResult {
  const errors = diagnostics.filter((d) => d.severity === "error");
  const warnings = diagnostics.filter((d) => d.severity === "warning");
  return {
    ok: errors.length === 0,
    diagnostics,
    errors,
    warnings,
  };
}
