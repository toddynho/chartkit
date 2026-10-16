"use client";

import { useMemo } from "react";
import { render, type ChartSpec } from "@chartkitdev/core";

export interface ChartProps {
  /** A v1 chart spec. The same object renders in every ChartKit adapter. */
  spec: ChartSpec;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Thin React wrapper over `@chartkitdev/core` `render()`.
 * The existing chart components keep their props API; this is the spec-driven entry.
 */
export function Chart({ spec, className, style }: ChartProps) {
  const svg = useMemo(() => render(spec), [spec]);
  return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: svg }} />;
}
