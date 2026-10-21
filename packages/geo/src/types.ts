/** RFC 6902 JSON Patch operation. Agents can apply `fix` directly. */
export interface JsonPatchOperation {
  op: "add" | "remove" | "replace" | "move" | "copy" | "test";
  path: string;
  value?: unknown;
  from?: string;
}

export type Severity = "error" | "warning";

export interface Diagnostic {
  code: string;
  severity: Severity;
  message: string;
  path: string;
  hint?: string;
  fix?: JsonPatchOperation[];
}

export interface ValidationResult {
  ok: boolean;
  diagnostics: Diagnostic[];
  errors: Diagnostic[];
  warnings: Diagnostic[];
}

export interface GeoSelection {
  index: number;
  id: string;
  name: string;
  value: number | null;
  kind: "region" | "point";
}

export const ATLAS_NAMES = ["world", "us", "canada", "eu"] as const;
export type AtlasName = (typeof ATLAS_NAMES)[number];

export const PROJECTIONS = ["equirectangular", "mercator", "equalEarth", "albersUsa", "fit"] as const;
export type ProjectionName = (typeof PROJECTIONS)[number];

export const COLOR_SCALES = ["sequential", "diverging", "threshold"] as const;
export type ColorScaleName = (typeof COLOR_SCALES)[number];
