"use client";

import { useEffect, useRef, useState } from "react";
import type { ChartRenderer, ChartSpec } from "@chartkitdev/core";
import { adopt, isExtra, render as renderAll } from "@chartkitdev/core/all";

export interface ChartProps {
  /** A v1 chart spec. The same object renders in every ChartKit adapter. */
  spec: ChartSpec;
  className?: string;
  style?: React.CSSProperties;
  /** Defaults to the core charts. Pass `createRenderer([...])` to ship a subset. */
  render?: (spec: ChartSpec) => string;
}

async function ensure(type: string): Promise<void> {
  if (!isExtra(type)) return;
  const mod = (await import("@chartkitdev/core/load")) as { load(type: string): Promise<ChartRenderer | undefined> };
  const chart = await mod.load(type);
  if (chart) adopt(chart);
}

/**
 * Thin React wrapper over `@chartkitdev/core/all`.
 * Core charts paint on the first render. Histogram through waterfall load
 * `@chartkitdev/core/charts/<type>` after that. `renderToString` from `./ssr` imports them statically.
 */
export function Chart({ spec, className, style, render }: ChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState(() => (render || !isExtra(spec.type) ? (render ?? renderAll)(spec) : ""));
  useEffect(() => {
    let alive = true;
    if (render || !isExtra(spec.type)) {
      setSvg((render ?? renderAll)(spec));
      return;
    }
    void (async () => {
      await ensure(spec.type);
      if (!alive) return;
      setSvg(renderAll(spec));
    })();
    return () => {
      alive = false;
    };
  }, [spec, render]);
  useEffect(() => {
    const el = ref.current;
    if (!el || render || !isExtra(spec.type)) return;
    let tip: { destroy(): void } | undefined;
    let alive = true;
    void import("@chartkitdev/core/extra-tip").then(({ attach }) => {
      if (alive) tip = attach(el);
    });
    return () => {
      alive = false;
      tip?.destroy();
    };
  }, [spec.type, render]);
  return <div ref={ref} className={className} style={style} dangerouslySetInnerHTML={{ __html: svg }} />;
}
