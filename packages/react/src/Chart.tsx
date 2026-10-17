"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ChartSpec } from "@chartkitdev/core";
import { render as renderAll } from "@chartkitdev/core/all";
import { attach, type Controller } from "@chartkitdev/core/interact";

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
 * The first SVG string is what React hydrates. Later specs patch that SVG in place.
 * The existing chart components keep their props API; this is the spec-driven entry.
 */
export function Chart({ spec, className, style, render = renderAll }: ChartProps) {
  const markup = useMemo(() => render(spec), [spec, render]);
  const frozen = useRef<string | null>(null);
  if (frozen.current === null) frozen.current = markup;
  const host = useRef<HTMLDivElement>(null);
  const ctl = useRef<Controller | null>(null);
  const renderRef = useRef(render);
  renderRef.current = render;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    if (!ctl.current) ctl.current = attach(el, spec, { render: (next) => renderRef.current(next as ChartSpec) });
    ctl.current.update(spec, markup);
  }, [spec, markup]);

  useEffect(() => () => {
    ctl.current?.destroy();
    ctl.current = null;
  }, []);

  return (
    <div
      ref={host}
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: frozen.current }}
    />
  );
}
