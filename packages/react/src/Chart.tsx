"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChartRenderer, ChartSpec } from "@chartkitdev/core";
import { adopt, isExtra, render as renderAll } from "@chartkitdev/core/all";
import { attach, listen, writeTooltip, type ClickDetail, type Controller, type Selection, type TooltipRender } from "@chartkitdev/core/interact";

export interface ChartProps {
  /** A v1 chart spec. The same object renders in every ChartKit adapter. */
  spec: ChartSpec;
  className?: string;
  style?: React.CSSProperties;
  /** Defaults to the core charts. Pass `createRenderer([...])` to ship a subset. */
  render?: (spec: ChartSpec) => string;
  /**
   * Next.js app router uses this client component. The same props apply.
   * `pointclick` is a mark or Enter/Space on the focused point. `seriesclick` is the series.
   * `legendclick` is a legend item. `selection` is controlled; omit it to let the chart own the state.
   */
  onPointClick?: (detail: ClickDetail) => void;
  onSeriesClick?: (detail: ClickDetail) => void;
  onLegendClick?: (detail: ClickDetail) => void;
  selection?: Selection | null;
  onSelectionChange?: (selection: Selection) => void;
  /** Replaces the tooltip card. Return HTML, a node, or null to hide it. The spec stays JSON. */
  tooltip?: TooltipRender;
}

async function ensure(type: string): Promise<void> {
  if (!isExtra(type)) return;
  const mod = (await import("@chartkitdev/core/load")) as { load(type: string): Promise<ChartRenderer | undefined> };
  const chart = await mod.load(type);
  if (chart) adopt(chart);
}

/**
 * Thin React wrapper over `@chartkitdev/core/all`.
 * Core charts hydrate the first SVG and patch later specs in place.
 * Histogram through waterfall load `@chartkitdev/core/charts/<type>` after that.
 * `renderToString` from `./ssr` imports them statically.
 */
export function Chart({ spec, className, style, render, onPointClick, onSeriesClick, onLegendClick, selection, onSelectionChange, tooltip }: ChartProps) {
  const extra = render == null && isExtra(spec.type);
  const coreMarkup = useMemo(() => (extra ? "" : (render ?? renderAll)(spec)), [spec, render, extra]);
  const [extraSvg, setExtraSvg] = useState("");
  const markup = extra ? extraSvg : coreMarkup;
  const frozen = useRef<string | null>(null);
  if (!extra && frozen.current === null) frozen.current = markup;
  const host = useRef<HTMLDivElement>(null);
  const ctl = useRef<Controller | null>(null);
  const renderRef = useRef(render ?? renderAll);
  renderRef.current = render ?? renderAll;
  const handlers = useRef({ onPointClick, onSeriesClick, onLegendClick, onSelectionChange });
  handlers.current = { onPointClick, onSeriesClick, onLegendClick, onSelectionChange };
  const selectionRef = useRef(selection);
  selectionRef.current = selection;

  useEffect(() => {
    if (!extra) return;
    let alive = true;
    void (async () => {
      await ensure(spec.type);
      if (!alive) return;
      setExtraSvg(renderAll(spec));
    })();
    return () => {
      alive = false;
    };
  }, [spec, extra]);

  useEffect(() => {
    if (host.current) writeTooltip(host.current, tooltip);
  }, [tooltip]);

  useEffect(() => {
    const el = host.current;
    if (!el || extra) return;
    if (!ctl.current) {
      ctl.current = attach(el, spec, {
        render: (next) => renderRef.current(next as ChartSpec),
        selection: selectionRef.current,
      });
    }
    ctl.current.update(spec, markup);
    if (selectionRef.current !== undefined) ctl.current.setSelection(selectionRef.current);
  }, [spec, markup, extra]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    return listen(el, {
      pointclick: (detail) => handlers.current.onPointClick?.(detail),
      seriesclick: (detail) => handlers.current.onSeriesClick?.(detail),
      legendclick: (detail) => handlers.current.onLegendClick?.(detail),
      selectionchange: (next) => handlers.current.onSelectionChange?.(next),
    });
  }, []);

  useEffect(() => {
    if (selection !== undefined) ctl.current?.setSelection(selection);
  }, [selection]);

  useEffect(() => {
    if (!extra) return;
    ctl.current?.destroy();
    ctl.current = null;
    const el = host.current;
    if (!el || !extraSvg) return;
    ctl.current = attach(el, spec, {
      render: (next) => renderRef.current(next as ChartSpec),
      selection: selectionRef.current,
    });
    let tip: { destroy(): void } | undefined;
    let alive = true;
    void import("@chartkitdev/core/extra-tip").then(({ attach: attachTip }) => {
      if (alive) tip = attachTip(el);
    });
    return () => {
      alive = false;
      tip?.destroy();
      ctl.current?.destroy();
      ctl.current = null;
    };
  }, [spec, extra, extraSvg]);

  useEffect(() => () => {
    ctl.current?.destroy();
    ctl.current = null;
  }, []);

  return (
    <div
      ref={host}
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: extra ? markup : frozen.current ?? markup }}
    />
  );
}
