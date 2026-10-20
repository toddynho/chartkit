"use client";

import { forwardRef, useEffect, useRef } from "react";
import type { ChartSpec } from "@chartkitdev/core";
import type { TooltipRender } from "@chartkitdev/core/interact";
import type { MountedChart } from "@chartkitdev/vanilla";

interface Props {
  spec: unknown;
  svg: string;
  className?: string;
  pixelWidth?: number | null;
  /** Adapter tooltip. Omitted charts keep the built-in card. */
  tooltip?: TooltipRender;
}

/**
 * Server SVG stays in the first paint. After hydration this calls `mount` from
 * `@chartkitdev/vanilla`, which attaches `@chartkitdev/core/interact` and loads
 * phase-3 charts through `open()`. Later spec changes go through `update()`.
 */
export const ChartHost = forwardRef<HTMLDivElement, Props>(function ChartHost({ spec, svg, className, pixelWidth, tooltip }, ref) {
  const local = useRef<{ node: HTMLDivElement | null }>({ node: null });
  const frozen = useRef(svg);
  const handle = useRef<MountedChart | null>(null);
  const latest = useRef(spec);
  const tip = useRef(tooltip);
  latest.current = spec;
  tip.current = tooltip;

  useEffect(() => {
    const el = local.current.node;
    if (!el) return;
    let alive = true;
    let chart: MountedChart | null = null;
    void import("@chartkitdev/vanilla").then(({ mount }) => {
      if (!alive || !local.current.node) return;
      const custom = tip.current;
      chart = mount(local.current.node, latest.current as ChartSpec, custom ? { tooltip: (detail) => tip.current?.(detail) ?? null } : {});
      handle.current = chart;
      local.current.node.setAttribute("data-ck-mounted", "1");
    });
    return () => {
      alive = false;
      chart?.destroy();
      if (handle.current === chart) handle.current = null;
    };
  }, []);

  useEffect(() => {
    handle.current?.update(spec as ChartSpec);
  }, [spec]);

  return (
    <div
      ref={(node) => {
        local.current.node = node;
        if (typeof ref === "function") ref(node);
        else if (ref) Object.assign(ref, { current: node });
      }}
      className={className}
      data-pixel-width={pixelWidth ?? undefined}
      dangerouslySetInnerHTML={{ __html: frozen.current }}
    />
  );
});
