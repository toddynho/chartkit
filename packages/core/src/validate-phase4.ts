import { toResult, type Diagnostic, type JsonPatchOperation, type ValidationResult } from "./diagnostics";
import { writeOp } from "./renderers/extra/fields";
import { formatGanttDay, ganttIds, ganttRow, readGantt } from "./renderers/extra/gantt";
import { readJourney, journeyRow } from "./renderers/extra/journey";
import { readQuadrant, quadrantRow } from "./renderers/extra/quadrant";
import { readTimeline, timelineRow } from "./renderers/extra/timeline";
import { readVenn, vennRow } from "./renderers/extra/venn";
import { DAY } from "./renderers/extra/time";
import { applyPatch } from "./repair";
import { isRecord } from "./svg";
import { validate } from "./validate";

const PHASE4 = new Set(["gantt", "timeline", "quadrant", "venn", "journey"]);

const ALIASES: Record<string, string> = {
  "gantt-chart": "gantt",
  ganttchart: "gantt",
  "timeline-chart": "timeline",
  "quadrant-chart": "quadrant",
  quadrantchart: "quadrant",
  "venn-diagram": "venn",
  venndiagram: "venn",
  "user-journey": "journey",
  userjourney: "journey",
};

/**
 * `validate()` plus the gantt, timeline, quadrant, venn, and journey rules.
 * The main `@chartkitdev/core/validate` entry does not include this module.
 */
export function validatePhase4(spec: unknown, data?: unknown): ValidationResult {
  const base = validate(spec, data);
  const type = phase4Type(spec);
  if (!type) return base;
  const diagnostics = base.diagnostics.filter((item) => !(item.code === "CK1005" && item.path === "/type"));
  if (isRecord(spec) && spec.type !== type) {
    diagnostics.push({
      code: "CK1400",
      severity: "error",
      message: `unknown chart type ${quote(String(spec.type))}`,
      path: "/type",
      hint: `did you mean ${quote(type)}?`,
      fix: [{ op: "replace", path: "/type", value: type }],
    });
  }
  if (isRecord(spec) && spec.type === type) diagnostics.push(...checks(spec, type));
  return toResult(unique(diagnostics));
}

export interface RepairResult extends ValidationResult {
  spec: unknown;
  applied: JsonPatchOperation[];
}

const MAX_REPAIR_ROUNDS = 8;

/** Apply phase-4 JSON Patch fixes, then the same fixes `repair()` would apply to what remains. */
export function repairPhase4(spec: unknown, data?: unknown): RepairResult {
  if (typeof spec === "string") {
    try {
      spec = JSON.parse(spec) as unknown;
    } catch {
      return { spec, ...validatePhase4(spec, data), applied: [] };
    }
  }
  let current = structuredClone(spec);
  const applied: JsonPatchOperation[] = [];
  let result = validatePhase4(current, data);
  for (let round = 0; round < MAX_REPAIR_ROUNDS && !result.ok; round++) {
    const ops = result.errors.flatMap((error) => error.fix ?? []);
    if (ops.length === 0) break;
    const before = applied.length;
    for (const op of ops) {
      if (applyPatch(current, op)) applied.push(op);
    }
    if (applied.length === before) break;
    const next = validatePhase4(current, data);
    if (!next.ok && sameErrors(result, next)) break;
    result = next;
  }
  return { spec: current, ...result, applied };
}

function checks(spec: Record<string, unknown>, type: string): Diagnostic[] {
  if (type === "gantt") return ganttChecks(spec);
  if (type === "timeline") return timelineChecks(spec);
  if (type === "quadrant") return quadrantChecks(spec);
  if (type === "venn") return vennChecks(spec);
  return journeyChecks(spec);
}

function ganttChecks(spec: Record<string, unknown>): Diagnostic[] {
  const tasks = readGantt(spec);
  if (!tasks) return [];
  const ids = ganttIds(tasks);
  const seen = new Set<string>();
  const out: Diagnostic[] = [];
  for (const task of tasks) {
    const row = ganttRow(spec, task.index);
    if (task.explicitId) {
      if (seen.has(task.id)) {
        const path = `/data/${task.index}/${task.fields.id}`;
        out.push(error("CK1411", path, `gantt id ${quote(task.id)} is used more than once`, "Ids have to be unique so a dependency can name one task.", [
          writeOp(row, task.fields.id, path, `${task.id}-${task.index + 1}`),
        ]));
      }
      seen.add(task.id);
    }
    if (task.startMs == null) {
      const path = `/data/${task.index}/${task.fields.start}`;
      const fix = task.endMs != null && task.durationDays != null ? [writeOp(row, task.fields.start, path, formatGanttDay(task.endMs - task.durationDays * DAY))] : undefined;
      out.push(error("CK1401", path, `gantt row ${task.index} (${task.task}) is missing a start date`, "Use YYYY-MM-DD.", fix));
    }
    if (task.endMs == null && !task.milestone) {
      const path = `/data/${task.index}/${task.fields.end}`;
      const fix = task.startMs != null && task.durationDays != null ? [writeOp(row, task.fields.end, path, formatGanttDay(task.startMs + task.durationDays * DAY))] : undefined;
      out.push(error("CK1402", path, `gantt row ${task.index} (${task.task}) needs an end, a duration, or milestone: true`, "end is YYYY-MM-DD. duration is a number of days, or a string like 5d or 2w.", fix));
    }
    if (!task.milestone && task.startMs != null && task.endMs != null && task.endMs < task.startMs) {
      const startPath = `/data/${task.index}/${task.fields.start}`;
      const endPath = `/data/${task.index}/${task.fields.end}`;
      out.push(error("CK1403", endPath, `gantt row ${task.index} (${task.task}) ends before it starts`, "Swap start and end.", [
        { op: "replace", path: startPath, value: row?.[task.fields.end] },
        { op: "replace", path: endPath, value: row?.[task.fields.start] },
      ]));
    }
    const bad = task.depends.filter((id) => id === task.id || !ids.has(id));
    if (bad.length) {
      const path = `/data/${task.index}/${task.fields.depends}`;
      const kept = task.depends.filter((id) => id !== task.id && ids.has(id));
      out.push(error("CK1404", path, `gantt row ${task.index} depends on ${bad.map(quote).join(", ")}, which is not a task id`, "depends is a comma-separated list of task ids.", [
        writeOp(row, task.fields.depends, path, kept.join(", ")),
      ]));
    }
  }
  return out;
}

function timelineChecks(spec: Record<string, unknown>): Diagnostic[] {
  const items = readTimeline(spec);
  if (!items) return [];
  const out: Diagnostic[] = [];
  for (const item of items) {
    const row = timelineRow(spec, item.index);
    if (item.kind === "period") {
      if (item.startMs == null) {
        const path = `/data/${item.index}/${item.fields.start}`;
        out.push(error("CK1405", path, `timeline period ${quote(item.label)} is missing a start`, "Use start as YYYY-MM-DD."));
      }
      if (item.endMs == null) {
        const path = `/data/${item.index}/${item.fields.end}`;
        out.push(error("CK1405", path, `timeline period ${quote(item.label)} is missing an end`, "Use end as YYYY-MM-DD."));
      } else if (item.startMs != null && item.endMs < item.startMs) {
        const startPath = `/data/${item.index}/${item.fields.start}`;
        const endPath = `/data/${item.index}/${item.fields.end}`;
        out.push(error("CK1405", endPath, `timeline period ${quote(item.label)} ends before it starts`, "Swap start and end.", [
          { op: "replace", path: startPath, value: row?.[item.fields.end] },
          { op: "replace", path: endPath, value: row?.[item.fields.start] },
        ]));
      }
    } else if (item.startMs == null) {
      const path = `/data/${item.index}/${item.fields.date}`;
      out.push(error("CK1405", path, `timeline event ${quote(item.label)} is missing a date`, "Use date or start as YYYY-MM-DD."));
    }
  }
  return out;
}

function quadrantChecks(spec: Record<string, unknown>): Diagnostic[] {
  const model = readQuadrant(spec);
  if (!model) return [];
  const out: Diagnostic[] = [];
  for (const point of model.points) {
    const row = quadrantRow(spec, point.index);
    out.push(...rangeCheck(row, point.index, point.fields.x, point.x, model.xDomain, "x"));
    out.push(...rangeCheck(row, point.index, point.fields.y, point.y, model.yDomain, "y"));
  }
  return out;
}

function rangeCheck(row: Record<string, unknown> | undefined, index: number, field: string, value: number | null, domain: [number, number], axis: string): Diagnostic[] {
  const path = `/data/${index}/${field}`;
  if (value == null) {
    return [error("CK1406", path, `quadrant point ${index} is missing ${axis}`, `Add a number in the ${axis} domain (${domain[0]} to ${domain[1]}).`)];
  }
  if (value < domain[0] || value > domain[1]) {
    const clamped = Math.min(domain[1], Math.max(domain[0], value));
    return [error("CK1406", path, `quadrant ${axis} ${value} is outside ${domain[0]}..${domain[1]}`, "The default domain is 0..1. Set encoding scale.domain to widen it, or move the point inside.", [writeOp(row, field, path, clamped)])];
  }
  return [];
}

function vennChecks(spec: Record<string, unknown>): Diagnostic[] {
  const model = readVenn(spec);
  if (!model) return [];
  if (model.names.length > 3) {
    const keep = new Set(model.names.slice(0, 3));
    const extra = model.names.slice(3).join(", ");
    const indexes = model.regions.filter((region) => region.sets.some((name) => !keep.has(name))).map((region) => region.index);
    const fix = [...indexes].sort((a, b) => b - a).map((index) => ({ op: "remove" as const, path: `/data/${index}` }));
    return [error("CK1407", "/data", `venn draws 2 or 3 sets. ${quote(extra)} is past that`, "Remove the extra set, or split it into its own chart. 3-set areas are approximate.", fix)];
  }
  if (model.names.length < 2) {
    return [error("CK1407", "/data", "venn needs 2 or 3 sets", "Add another set row, with set and size. Intersections use set names joined by +.")];
  }
  const sizes = new Map<string, number>();
  for (const region of model.regions) {
    if (region.sets.length === 1 && region.size != null) sizes.set(region.sets[0], region.size);
  }
  const out: Diagnostic[] = [];
  for (const region of model.regions) {
    if (region.sets.length < 2 || region.size == null) continue;
    const cap = Math.min(...region.sets.map((name) => sizes.get(name) ?? region.size ?? 0));
    if (region.size > cap) {
      const row = vennRow(spec, region.index);
      const path = `/data/${region.index}/${region.field}`;
      out.push(error("CK1408", path, `intersection ${region.sets.join(" + ")} is larger than its smallest set`, "An overlap cannot be larger than either set. 3-set areas stay approximate after this.", [writeOp(row, region.field, path, cap)]));
    }
  }
  return out;
}

function journeyChecks(spec: Record<string, unknown>): Diagnostic[] {
  const steps = readJourney(spec);
  if (!steps) return [];
  const out: Diagnostic[] = [];
  for (const step of steps) {
    const row = journeyRow(spec, step.index);
    if (!step.section) {
      const previous = steps.slice(0, step.index).reverse().find((item) => item.section)?.section ?? "Journey";
      const path = `/data/${step.index}/${step.fields.section}`;
      out.push(error("CK1410", path, `journey step ${quote(step.step)} is missing a section`, "Sections group the steps, the way a Mermaid journey does.", [writeOp(row, step.fields.section, path, previous)]));
    }
    const path = `/data/${step.index}/${step.fields.score}`;
    if (step.score == null) {
      out.push(error("CK1409", path, `journey step ${quote(step.step)} is missing a score`, "3 is the neutral score. Replace it with the real rating from 1 to 5.", [writeOp(row, step.fields.score, path, 3)]));
    } else if (step.score < 1 || step.score > 5) {
      const clamped = Math.min(5, Math.max(1, Math.round(step.score)));
      out.push(error("CK1409", path, `journey score ${step.score} is outside 1..5`, "Scores run from 1 (painful) to 5 (delighted).", [writeOp(row, step.fields.score, path, clamped)]));
    }
  }
  return out;
}

function phase4Type(spec: unknown): string | undefined {
  if (!isRecord(spec) || typeof spec.type !== "string") return undefined;
  if (PHASE4.has(spec.type)) return spec.type;
  return ALIASES[spec.type.toLowerCase()];
}

function error(code: string, path: string, message: string, hint: string, fix?: JsonPatchOperation[]): Diagnostic {
  return { code, severity: "error", message, path, hint, fix };
}

function quote(value: string): string {
  return JSON.stringify(value);
}

function unique(diagnostics: Diagnostic[]): Diagnostic[] {
  diagnostics.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "error" ? -1 : 1;
    if (a.path !== b.path) return a.path < b.path ? -1 : 1;
    return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
  });
  const seen = new Set<string>();
  return diagnostics.filter((item) => {
    const key = `${item.severity}|${item.code}|${item.path}|${item.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sameErrors(a: ValidationResult, b: ValidationResult): boolean {
  if (a.errors.length !== b.errors.length) return false;
  return a.errors.every((item, index) => `${item.code}|${item.path}|${item.message}` === `${b.errors[index]?.code}|${b.errors[index]?.path}|${b.errors[index]?.message}`);
}
