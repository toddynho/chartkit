/**
 * A tiny flag the line bundle can see. The scene buffers and the capture
 * implementation stay in the canvas chunk.
 */
import type { PlotModel, XScale } from "../renderers/cartesian";

export interface CaptureArgs {
  model: PlotModel;
  xScale: XScale;
  yScale: (value: number) => number;
  y2Scale: (value: number) => number;
  plot: { left: number; top: number; right: number; bottom: number };
  count: number;
  scalesMs: number;
  yDomain: [number, number];
  y2Domain: [number, number];
}

/** `reuse` keeps the previous chrome. `scene` draws chrome and skips mark nodes. */
export type ScenePass = "off" | "scene" | "reuse";

let depth = 0;
let capture: ((args: CaptureArgs) => ScenePass) | null = null;
let onSvg: ((ms: number) => void) | null = null;
let ingestMs = 0;

export function pushScene(): void {
  depth += 1;
}

export function popScene(): void {
  depth = Math.max(0, depth - 1);
}

export function capturing(): boolean {
  return depth > 0;
}

export function setCapture(fn: ((args: CaptureArgs) => ScenePass) | null, svg?: ((ms: number) => void) | null): void {
  capture = fn;
  onSvg = svg ?? null;
}

export function runCapture(args: CaptureArgs): ScenePass {
  return capture ? capture(args) : "scene";
}

export function noteIngest(ms: number): void {
  ingestMs = ms;
}

export function readIngest(): number {
  return ingestMs;
}

export function noteSvg(ms: number): void {
  onSvg?.(ms);
}
