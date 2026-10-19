import { cssVar } from "../../theme";
import { n } from "../../svg";
import { channel, cells, rowAt, splitList, tableOf, textAt } from "./fields";
import { fit, fill, openMark, text, viewOf } from "./plot";
import { DAY, formatDay, formatISO, formatMonth, monthTicks, parseDay, parseDuration } from "./time";
import type { Frame } from "../../frame";

export interface GanttTask {
  index: number;
  id: string;
  task: string;
  section: string;
  startMs: number | null;
  endMs: number | null;
  progress: number | null;
  status: string;
  depends: string[];
  milestone: boolean;
  explicitId: boolean;
  durationDays: number | null;
  fields: { id: string; start: string; end: string; depends: string };
}

export function readGantt(spec: Record<string, unknown>): GanttTask[] | null {
  const read = tableOf(spec);
  if (!read) return null;
  const { table, encoding } = read;
  const fields = table.fields;
  const taskField = channel(encoding, "x", "task", fields);
  const sectionField = channel(encoding, "y", "section", fields);
  const startField = channel(encoding, "open", "start", fields) ?? "start";
  const endField = channel(encoding, "close", "end", fields) ?? "end";
  const statusField = channel(encoding, "color", "status", fields);
  const idField = channel(encoding, "source", "id", fields);
  const dependsField = channel(encoding, "target", "depends", fields);
  const progressField = fields.includes("progress") ? "progress" : undefined;
  const durationField = fields.includes("duration") ? "duration" : undefined;
  const milestoneField = fields.includes("milestone") ? "milestone" : undefined;
  if (!taskField && !startField) return null;
  const tasks = cells(table, taskField);
  const sections = cells(table, sectionField);
  const starts = cells(table, startField);
  const ends = cells(table, endField);
  const statuses = cells(table, statusField);
  const ids = cells(table, idField);
  const depends = cells(table, dependsField);
  const progress = cells(table, progressField);
  const durations = cells(table, durationField);
  const milestones = cells(table, milestoneField);
  const rows: GanttTask[] = [];
  for (let index = 0; index < table.length; index++) {
    const startMs = parseDay(starts[index]);
    const duration = parseDuration(durations[index]);
    let endMs = parseDay(ends[index]);
    if (endMs == null && startMs != null && duration != null) endMs = startMs + duration * DAY;
    const sameDay = startMs != null && endMs != null && startMs === endMs;
    const milestone = milestones[index] === true || duration === 0 || sameDay;
    const name = textAt(tasks[index]) || `Task ${index + 1}`;
    const explicitId = textAt(ids[index]);
    rows.push({
      index,
      id: explicitId || name,
      task: name,
      section: textAt(sections[index]),
      startMs,
      endMs: milestone && endMs == null ? startMs : endMs,
      progress: progressOf(progress[index]),
      status: normalizeStatus(textAt(statuses[index])),
      depends: splitList(depends[index]),
      milestone,
      explicitId: explicitId.length > 0,
      durationDays: duration,
      fields: { id: idField ?? "id", start: startField, end: endField, depends: dependsField ?? "depends" },
    });
  }
  return rows.length ? rows : null;
}

export function readToday(spec: Record<string, unknown>): number | null {
  const read = tableOf(spec);
  if (!read || !read.table.fields.includes("today")) return null;
  for (const value of cells(read.table, "today")) {
    const day = parseDay(value);
    if (day != null) return day;
  }
  return null;
}

/** Tasks as range bars on a time axis, with sections, milestones, dependencies, and a today line. */
export function renderGantt(spec: Record<string, unknown>): string | null {
  const tasks = readGantt(spec);
  if (!tasks) return null;
  const groups = groupTasks(tasks);
  const header = groups.some((group) => group.section) ? 20 : 0;
  const natural = 72 + groups.length * header + tasks.length * 32 + 24;
  const view = viewOf(spec, "gantt", 760, natural);
  if (!view) return null;
  const { frame, parts } = view;
  const range = domainOf(tasks, readToday(spec));
  if (!range) return null;
  const [min, max] = range;
  const hasSection = groups.some((group) => group.section);
  const nameX = hasSection ? 96 : 16;
  const longest = tasks.reduce((best, task) => Math.max(best, task.task.length), 0);
  const plotLeft = Math.min(340, nameX + 16 + Math.min(longest, 28) * 7.2);
  const plotRight = frame.width - 20;
  const top = frame.title ? 52 : 28;
  const xAt = (time: number) => plotLeft + ((time - min) / (max - min || 1)) * (plotRight - plotLeft);
  const withYear = max - min > 340 * DAY;

  parts.push(legend(frame));
  let y = top;
  const placed = new Map<number, number>();
  for (const group of groups) {
    const bandTop = y;
    if (group.section) {
      parts.push(text(16, y + 14, fit(group.section, 76, 11), cssVar("muted", frame.preset.muted), 11, "650"));
      y += header;
    }
    for (const task of group.tasks) {
      placed.set(task.index, y + 16);
      y += 32;
    }
    if (group.section) {
      parts.push(
        `<rect x="${n(plotLeft)}" y="${n(bandTop + 4)}" width="${n(plotRight - plotLeft)}" height="${n(y - bandTop - 6)}" rx="8" fill="${cssVar("track", frame.preset.track)}" fill-opacity="0.45" />`,
      );
    }
  }

  const byId = new Map<string, GanttTask>();
  for (const task of tasks) {
    byId.set(task.id, task);
    if (!byId.has(task.task)) byId.set(task.task, task);
  }
  for (const task of tasks) {
    const y1 = placed.get(task.index);
    if (y1 == null || task.startMs == null) continue;
    const x1 = xAt(task.milestone ? task.startMs : task.startMs);
    for (const dep of task.depends) {
      const pred = byId.get(dep);
      const y0 = pred ? placed.get(pred.index) : undefined;
      if (!pred || y0 == null || pred.startMs == null || pred.index === task.index) continue;
      const from = xAt(pred.milestone ? pred.startMs : (pred.endMs ?? pred.startMs));
      const path = elbow(from, y0, x1, y1);
      const label = `${pred.task} → ${task.task}`;
      parts.push(openMark("path", "dependency", label, `d="${path}" fill="none" stroke="${cssVar("muted", frame.preset.muted)}" stroke-width="1.25" stroke-linejoin="round" stroke-linecap="round"`));
      parts.push("</path>");
    }
  }

  for (const task of tasks) {
    const cy = placed.get(task.index);
    if (cy == null) continue;
    parts.push(text(nameX, cy + 4, fit(task.task, plotLeft - nameX - 10, 12), cssVar("text", frame.preset.text), 12, "500"));
    if (task.startMs == null) continue;
    const color = statusPaint(frame, task.status);
    const label = taskLabel(task);
    if (task.milestone) {
      const cx = xAt(task.startMs);
      const diamond = `${n(cx)},${n(cy - 7)} ${n(cx + 7)},${n(cy)} ${n(cx)},${n(cy + 7)} ${n(cx - 7)},${n(cy)}`;
      parts.push(openMark("polygon", "milestone", label, `points="${diamond}" fill="${color}"`));
      parts.push("</polygon>");
      continue;
    }
    const x1 = xAt(task.startMs);
    const x2 = xAt(task.endMs ?? task.startMs);
    const width = Math.max(2, x2 - x1);
    const barY = cy - 7;
    if (task.progress == null) {
      parts.push(openMark("rect", "bar", label, `x="${n(x1)}" y="${n(barY)}" width="${n(width)}" height="14" rx="5" fill="${color}"`));
      parts.push("</rect>");
    } else {
      parts.push(`<rect x="${n(x1)}" y="${n(barY)}" width="${n(width)}" height="14" rx="5" fill="${color}" fill-opacity="0.22" />`);
      const done = Math.max(0, Math.min(width, width * task.progress));
      parts.push(openMark("rect", "bar", label, `x="${n(x1)}" y="${n(barY)}" width="${n(done)}" height="14" rx="5" fill="${color}"`));
      parts.push("</rect>");
    }
  }

  const today = readToday(spec);
  if (today != null && today >= min && today <= max) {
    const x = xAt(today);
    parts.push(openMark("line", "today", `Today, ${formatDay(today)}`, `x1="${n(x)}" y1="${n(top - 6)}" x2="${n(x)}" y2="${n(y - 8)}" stroke="${cssVar("accent", frame.preset.accent)}" stroke-width="1.25" stroke-dasharray="3 3"`));
    parts.push("</line>");
    parts.push(`<rect x="${n(x - 22)}" y="${n(top - 22)}" width="44" height="16" rx="8" fill="${cssVar("accent", frame.preset.accent)}" />`);
    parts.push(text(x, top - 11, "Today", "#fff", 10, "650", "middle"));
  }

  parts.push(`<line x1="${n(plotLeft)}" y1="${n(top)}" x2="${n(plotRight)}" y2="${n(top)}" stroke="${cssVar("axis", frame.preset.axis)}" />`);
  const todayX = today != null && today >= min && today <= max ? xAt(today) : null;
  for (const tick of axisTicks(min, max)) {
    if (tick < min || tick > max) continue;
    const x = xAt(tick);
    if (todayX != null && Math.abs(x - todayX) < 36) continue;
    parts.push(`<line x1="${n(x)}" y1="${n(top)}" x2="${n(x)}" y2="${n(top + 5)}" stroke="${cssVar("axis", frame.preset.axis)}" />`);
    parts.push(text(x, top - 6, tickLabel(tick, max - min, withYear), cssVar("muted", frame.preset.muted), 11, "500", "middle"));
  }
  return view.done();
}

function legend(frame: Frame): string {
  const items = [
    ["Done", cssVar("positive", frame.preset.positive)],
    ["Active", cssVar("accent", frame.preset.accent)],
    ["Critical", cssVar("negative", frame.preset.negative)],
  ] as const;
  const right = frame.width - 16;
  return items
    .map((item, index) => {
      const x = right - (items.length - index) * 78;
      return `<rect x="${n(x)}" y="16" width="8" height="8" rx="2" fill="${item[1]}" />${text(x + 12, 24, item[0], cssVar("muted", frame.preset.muted), 11, "500")}`;
    })
    .join("");
}

function groupTasks(tasks: GanttTask[]): { section: string; tasks: GanttTask[] }[] {
  const order: string[] = [];
  const map = new Map<string, GanttTask[]>();
  for (const task of tasks) {
    if (!map.has(task.section)) {
      map.set(task.section, []);
      order.push(task.section);
    }
    map.get(task.section)?.push(task);
  }
  return order.map((section) => ({ section, tasks: map.get(section) ?? [] }));
}

function domainOf(tasks: GanttTask[], today: number | null): [number, number] | null {
  let min = Infinity;
  let max = -Infinity;
  for (const task of tasks) {
    if (task.startMs != null) {
      min = Math.min(min, task.startMs);
      max = Math.max(max, task.startMs);
    }
    if (task.endMs != null) {
      min = Math.min(min, task.endMs);
      max = Math.max(max, task.endMs);
    }
  }
  if (today != null) {
    min = Math.min(min, today);
    max = Math.max(max, today);
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  if (max <= min) max = min + DAY;
  const pad = Math.max(DAY, (max - min) * 0.04);
  return [min - pad, max + pad];
}

function axisTicks(min: number, max: number): number[] {
  const span = max - min;
  if (span >= 80 * DAY) return monthTicks(min, max);
  const step = span > 40 * DAY ? 7 : span > 16 * DAY ? 3 : 1;
  const out: number[] = [];
  const start = Math.ceil(min / DAY) * DAY;
  for (let time = start; time <= max && out.length < 8; time += step * DAY) out.push(time);
  return out.length ? out : [min, max];
}

function tickLabel(ms: number, span: number, withYear: boolean): string {
  if (span >= 80 * DAY) return formatMonth(ms, withYear || span > 370 * DAY);
  return formatDay(ms);
}

function elbow(x1: number, y1: number, x2: number, y2: number): string {
  if (Math.abs(y1 - y2) < 1) return `M ${n(x1)} ${n(y1)} H ${n(x2)}`;
  if (x2 >= x1 + 16) {
    const mid = x1 + Math.min(16, (x2 - x1) / 2);
    return `M ${n(x1)} ${n(y1)} H ${n(mid)} V ${n(y2)} H ${n(x2)}`;
  }
  const midY = (y1 + y2) / 2;
  return `M ${n(x1)} ${n(y1)} H ${n(x1 + 12)} V ${n(midY)} H ${n(x2 - 12)} V ${n(y2)} H ${n(x2)}`;
}

function taskLabel(task: GanttTask): string {
  const when = task.milestone
    ? formatDay(task.startMs ?? 0)
    : `${task.startMs != null ? formatDay(task.startMs) : "?"}–${task.endMs != null ? formatDay(task.endMs) : "?"}`;
  const status = task.status ? `, ${task.status}` : "";
  const progress = task.progress == null ? "" : `, ${Math.round(task.progress * 100)}%`;
  return `${task.task}: ${when}${status}${progress}`;
}

function statusPaint(frame: Frame, status: string): string {
  if (status === "done") return cssVar("positive", frame.preset.positive);
  if (status === "crit") return cssVar("negative", frame.preset.negative);
  if (status === "active") return cssVar("accent", frame.preset.accent);
  return fill(frame, 0);
}

function normalizeStatus(value: string): string {
  const token = value.toLowerCase();
  if (token === "done" || token === "complete" || token === "completed") return "done";
  if (token === "active" || token === "wip") return "active";
  if (token === "crit" || token === "critical" || token === "delayed") return "crit";
  return token;
}

function progressOf(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const scaled = value > 1 && value <= 100 ? value / 100 : value;
  return Math.min(1, Math.max(0, scaled));
}

export function ganttRow(spec: Record<string, unknown>, index: number): Record<string, unknown> | undefined {
  return rowAt(spec, index);
}

export function formatGanttDay(ms: number): string {
  return formatISO(ms);
}

export function ganttIds(tasks: GanttTask[]): Set<string> {
  const ids = new Set<string>();
  for (const task of tasks) {
    if (task.id) ids.add(task.id);
    if (task.task) ids.add(task.task);
  }
  return ids;
}
