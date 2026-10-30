import type { ChartSpec, Diagnostic } from "@chartkitdev/core";

/** Thrown when `validate()` reports errors. Rendering should fail. */
export class ChartKitSpecError extends Error {
  readonly errors: readonly Diagnostic[];
}

export function typeOf(spec: unknown): string;

export function assertSpec(spec: ChartSpec): void;

export function assertSvg(svg: string, type: string): string;
