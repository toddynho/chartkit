"use client";

import { forwardRef, useEffect, useRef } from "react";
import type { ChartSpec } from "@chartkitdev/core";
import type { Controller } from "@chartkitdev/core/interact";
import type { MountedChart } from "@chartkitdev/vanilla";

interface Props {
  spec: unknown;
  svg: string;
  className?: string;
  pixelWidth?: number | null;
}

function chartType(spec: unknown): string {
  if (typeof spec !== "object" || spec === null) return "";
  const type = (spec as { type?: unknown }).type;
  return typeof type === "string" ? type : "";
}

function selects(spec: unknown): boolean {
  if (typeof spec !== "object" || spec === null) return false;
  const interaction = (spec as { interaction?: { select?: unknown } }).interaction;
  return interaction?.select === "point" || interaction?.select === "series";
}

/**
 * Server SVG stays in the first paint. After hydration this calls `mount` from
 * `@chartkitdev/vanilla`, which attaches `@chartkitdev/core/interact` and loads
 * phase-3 charts through `open()`. Later spec changes go through `update()`.
 *
 * `open()` paints a phase-3 chart and returns before interact is attached, so
 * `interaction.select` never hears a click. A phase-3 chart that selects adopts
 * its own renderer and passes it to `mount`, which attaches interact immediately.
 *
 * A later spec change can replace the SVG node (the server markup is still the
 * React child). The original listeners stay on the detached node, so the host
 * attaches interact again when the visible SVG is a new element.
 */
export const ChartHost = forwardRef<HTMLDivElement, Props>(function ChartHost({ spec, svg, className, pixelWidth }, ref) {
  const local = useRef<{ node: HTMLDivElement | null }>({ node: null });
  const frozen = useRef(svg);
  const handle = useRef<MountedChart | null>(null);
  const seen = useRef<SVGSVGElement | null>(null);
  const rebound = useRef<Controller | null>(null);
  const latest = useRef(spec);
  latest.current = spec;

  async function followSvg(host: HTMLDivElement): Promise<void> {
    const svg = host.querySelector("svg");
    if (!(svg instanceof SVGSVGElement) || seen.current === null || svg === seen.current) return;
    const [{ attach }, { render, isExtra, adopt }] = await Promise.all([
      import("@chartkitdev/core/interact"),
      import("@chartkitdev/core/all"),
    ]);
    const current = latest.current as ChartSpec;
    const type = chartType(current);
    if (isExtra(type)) {
      const { load } = await import("@chartkitdev/core/load");
      const renderer = await load(type);
      if (renderer) adopt(renderer);
    }
    if (host.querySelector("svg") !== svg) return;
    rebound.current?.destroy();
    rebound.current = attach(host, current, { render: (next) => render(next) });
    seen.current = svg;
  }

  useEffect(() => {
    const el = local.current.node;
    if (!el) return;
    let alive = true;
    let chart: MountedChart | null = null;
    void (async () => {
      const { mount } = await import("@chartkitdev/vanilla");
      if (!alive || !local.current.node) return;
      const current = latest.current as ChartSpec;
      let render: ((spec: ChartSpec) => string) | undefined;
      if (selects(current)) {
        const { isExtra, adopt, render: draw } = await import("@chartkitdev/core/all");
        const type = chartType(current);
        if (isExtra(type)) {
          const { load } = await import("@chartkitdev/core/load");
          const renderer = await load(type);
          if (renderer) adopt(renderer);
          render = (next) => draw(next);
        }
      }
      if (!alive || !local.current.node) return;
      chart = mount(local.current.node, latest.current as ChartSpec, render ? { render } : {});
      handle.current = chart;
      seen.current = local.current.node.querySelector("svg");
      local.current.node.setAttribute("data-ck-mounted", "1");
      if (latest.current !== current) {
        chart.update(latest.current as ChartSpec);
        await followSvg(local.current.node);
      }
    })();
    return () => {
      alive = false;
      rebound.current?.destroy();
      rebound.current = null;
      chart?.destroy();
      if (handle.current === chart) handle.current = null;
    };
  }, []);

  useEffect(() => {
    const host = local.current.node;
    handle.current?.update(spec as ChartSpec);
    if (host) void followSvg(host);
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
