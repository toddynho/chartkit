"use client";

import { useMemo } from "react";
import type { ChartSpec } from "@chartkitdev/core";
import { render as renderAll } from "@chartkitdev/core/all";

export interface ChartProps {
  /** A v1 chart spec. The same object renders in every ChartKit adapter. */
  spec: ChartSpec;
  className?: string;
  style?: React.CSSProperties;
  /** Defaults to every v1 chart. Pass `createRenderer([...])` to ship a subset. */
  render?: (spec: ChartSpec) => string;
}

/**
 * Thin React wrapper over `@chartkitdev/core/all`.
 * The existing chart components keep their props API; this is the spec-driven entry.
 */
export function Chart({ spec, className, style, render = renderAll }: ChartProps) {
  const svg = useMemo(() => render(spec), [spec, render]);
  return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: svg }} />;
}
