"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChartRenderer, ChartSpec } from "@chartkitdev/core";
import { adopt, isExtra, render as renderAll } from "@chartkitdev/core/all";
import { attach, type Controller } from "@chartkitdev/core/interact";

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
 * Core charts hydrate the first SVG and patch later specs in place.
 * Histogram through waterfall load `@chartkitdev/core/charts/<type>` after that.
 * `renderToString` from `./ssr` imports them statically.
 */
export function Chart({ spec, className, style, render }: ChartProps) {
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
    const el = host.current;
    if (!el || extra) return;
    if (!ctl.current) ctl.current = attach(el, spec, { render: (next) => renderRef.current(next as ChartSpec) });
    ctl.current.update(spec, markup);
  }, [spec, markup, extra]);

  useEffect(() => {
    if (!extra) {
      return;
    }
    ctl.current?.destroy();
    ctl.current = null;
    const el = host.current;
    if (!el) return;
    let tip: { destroy(): void } | undefined;
    let alive = true;
    void import("@chartkitdev/core/extra-tip").then(({ attach: attachTip }) => {
      if (alive) tip = attachTip(el);
    });
    return () => {
      alive = false;
      tip?.destroy();
    };
  }, [spec.type, extra, extraSvg]);

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
