/**
 * Dashboard options. CK3081–CK3084.
 * CK3081 mark.rings shape. CK3082 metric.thresholds shape.
 * CK3083 thresholds on a chart that is not a kpi.
 * CK3084 encoding.volume on a chart that is not a candlestick.
 */
import type { Diagnostic } from "./diagnostics";

const RING = "mark.rings values are zero or more, and max is above zero";
const STEP = "metric.thresholds steps need distinct values";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function gapChecks(spec: unknown, diagnostics: Diagnostic[]): void {
  if (!isRecord(spec)) return;
  const type = typeof spec.type === "string" ? spec.type : "";
  if (isRecord(spec.mark) && spec.mark.rings !== undefined) checkRings(type, spec.mark.rings, diagnostics);
  if (isRecord(spec.metric) && spec.metric.thresholds !== undefined) checkThresholds(type, spec.metric.thresholds, diagnostics);
  if (isRecord(spec.encoding) && spec.encoding.volume !== undefined && type !== "candlestick") {
    diagnostics.push({
      code: "CK3084",
      severity: "warning",
      message: `"encoding.volume" has no effect on type ${JSON.stringify(type)}`,
      path: "/encoding/volume",
      hint: "volume is a candlestick pane under the candles. Remove it or set type to candlestick",
    });
  }
}

function checkRings(type: string, rings: unknown, diagnostics: Diagnostic[]): void {
  if (type !== "progress-ring") return;
  if (!ringListOk(rings)) {
    diagnostics.push({
      code: "CK3081",
      severity: "warning",
      message: RING,
      path: "/mark/rings",
      hint: "outer ring first. value is the progress and is not negative. max is the goal",
    });
  }
}

function ringListOk(rings: unknown): boolean {
  if (!Array.isArray(rings)) return false;
  return rings.every((item) => {
    if (!isRecord(item) || !finite(item.value) || item.value < 0) return false;
    if (item.max !== undefined && (!finite(item.max) || item.max <= 0)) return false;
    return true;
  });
}

function checkThresholds(type: string, steps: unknown, diagnostics: Diagnostic[]): void {
  if (type !== "kpi") {
    diagnostics.push({
      code: "CK3083",
      severity: "warning",
      message: `"metric.thresholds" has no effect on type ${JSON.stringify(type)}`,
      path: "/metric/thresholds",
      hint: "thresholds colour a kpi surface. Remove them or set type to kpi",
    });
    return;
  }
  if (!stepListOk(steps)) {
    diagnostics.push({
      code: "CK3082",
      severity: "warning",
      message: STEP,
      path: "/metric/thresholds",
      hint: "each step value is used once. the last step at or below metric.value sets the surface colour",
    });
  }
}

function stepListOk(steps: unknown): boolean {
  if (!Array.isArray(steps)) return false;
  const seen = new Set<number>();
  for (const item of steps) {
    if (!isRecord(item) || !finite(item.value)) return false;
    if (seen.has(item.value)) return false;
    seen.add(item.value);
  }
  return true;
}
