"use client";

export { Chart, type ChartProps } from './Chart';
export { toPNG, toSVG, toCSV } from '@chartkitdev/core/export';
export { validate, suggestAlt } from '@chartkitdev/core/validate';
export { render, register, createRenderer } from '@chartkitdev/core/all';
export { attach } from '@chartkitdev/core/extra-tip';
export type { ChartSpec, Diagnostic, ValidationResult, JsonPatchOperation, ChartRenderer, RenderTarget } from '@chartkitdev/core';

// The v0 prop components, hooks, themes and helpers. Deprecated here; they live at `@chartkitdev/react/legacy`.
export * from './deprecated';
