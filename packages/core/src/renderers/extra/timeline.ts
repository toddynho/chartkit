import { cssVar } from "../../theme";
import { n } from "../../svg";
import { channel, cells, rowAt, tableOf, textAt } from "./fields";
import { fit, fill, openMark, text, viewOf } from "./plot";
import { DAY, formatDay, formatYear, parseDay, yearTicks } from "./time";

export interface TimelineItem {
  index: number;
  label: string;
  kind: "event" | "period";
  startMs: number | null;
  endMs: number | null;
  fields: { start: string; end: string; date: string };
}

export function readTimeline(spec: Record<string, unknown>): TimelineItem[] | null {
  const read = tableOf(spec);
  if (!read) return null;
  const { table, encoding } = read;
  const fields = table.fields;
  const labelField = channel(encoding, "x", "label", fields) ?? "label";
  const dateField = fields.includes("date") ? "date" : undefined;
  const startField = channel(encoding, "open", "start", fields) ?? "start";
  const endField = channel(encoding, "close", "end", fields) ?? "end";
  const kindField = channel(encoding, "color", "kind", fields);
  const labels = cells(table, labelField);
  const dates = cells(table, dateField);
  const starts = cells(table, startField);
  const ends = cells(table, endField);
  const kinds = cells(table, kindField);
  const items: TimelineItem[] = [];
  for (let index = 0; index < table.length; index++) {
    const date = parseDay(dates[index]);
    const start = parseDay(starts[index]) ?? date;
    const end = parseDay(ends[index]);
    const kindToken = textAt(kinds[index]).toLowerCase();
    const kind = kindToken === "period" || kindToken === "era" || (end != null && start != null && end > start && kindToken !== "event") ? "period" : "event";
    items.push({
      index,
      label: textAt(labels[index]) || `Event ${index + 1}`,
      kind,
      startMs: start,
      endMs: kind === "period" ? end : (end ?? start),
      fields: { start: startField, end: endField, date: dateField ?? "date" },
    });
  }
  return items.length ? items : null;
}

/** Events on a date axis, with eras as spans and labels that move to a free side. */
export function renderTimeline(spec: Record<string, unknown>): string | null {
  const items = readTimeline(spec);
  if (!items) return null;
  const dated = items.filter((item) => item.startMs != null);
  if (!dated.length) return null;
  const periods = dated.filter((item) => item.kind === "period" && item.endMs != null);
  const events = dated.filter((item) => item.kind === "event");
  const lanes = laneOf(periods);
  const laneCount = Math.max(1, ...lanes.values(), 0);
  const natural = (spec.title ? 56 : 32) + laneCount * 40 + 168;
  const view = viewOf(spec, "timeline", 760, natural);
  if (!view) return null;
  const { frame, parts } = view;
  let min = Infinity;
  let max = -Infinity;
  for (const item of dated) {
    min = Math.min(min, item.startMs as number);
    max = Math.max(max, item.endMs ?? (item.startMs as number));
  }
  if (max <= min) max = min + DAY;
  const pad = Math.max(DAY * 30, (max - min) * 0.04);
  min -= pad;
  max += pad;
  const plotLeft = 28;
  const plotRight = frame.width - 28;
  const xAt = (time: number) => plotLeft + ((time - min) / (max - min)) * (plotRight - plotLeft);
  const periodTop = frame.title ? 48 : 24;
  const axisY = periodTop + laneCount * 40 + 36;

  for (const period of periods) {
    const lane = lanes.get(period.index) ?? 0;
    const x1 = xAt(period.startMs as number);
    const x2 = xAt(period.endMs as number);
    const y = periodTop + lane * 40;
    const width = Math.max(8, x2 - x1);
    const color = fill(frame, lane);
    const label = `${period.label}: ${formatDay(period.startMs as number)}–${formatDay(period.endMs as number)}`;
    parts.push(openMark("rect", "period", label, `x="${n(x1)}" y="${n(y)}" width="${n(width)}" height="26" rx="8" fill="${color}" fill-opacity="0.16" stroke="${color}"`));
    parts.push("</rect>");
    const inside = fit(period.label, width - 12, 12);
    if (inside && inside.length > 2) parts.push(text(x1 + width / 2, y + 17, inside, cssVar("text", frame.preset.text), 12, "600", "middle"));
    else parts.push(text(x1 + 8, y - 4, fit(period.label, width, 11), cssVar("text", frame.preset.text), 11, "600"));
  }

  parts.push(`<line x1="${n(plotLeft)}" y1="${n(axisY)}" x2="${n(plotRight)}" y2="${n(axisY)}" stroke="${cssVar("axis", frame.preset.axis)}" stroke-width="1.5" />`);
  const taken: { x: number; half: number; side: "above" | "below"; row: number }[] = [];
  for (const event of events) {
    const x = xAt(event.startMs as number);
    const half = Math.max(28, Math.min(96, event.label.length * 3.35));
    const place = sideFor(taken, x, half);
    taken.push({ x, half, side: place.side, row: place.row });
    const color = cssVar("accent", frame.preset.accent);
    const label = `${event.label}: ${formatDay(event.startMs as number)}`;
    parts.push(openMark("circle", "event", label, `cx="${n(x)}" cy="${n(axisY)}" r="6" fill="${color}" stroke="${cssVar("surface", frame.preset.surface)}" stroke-width="2"`));
    parts.push("</circle>");
    const y = place.side === "above" ? axisY - 18 - place.row * 16 : axisY + 28 + place.row * 16;
    const anchor = x < plotLeft + 70 ? "start" : x > plotRight - 70 ? "end" : "middle";
    const lx = anchor === "start" ? x - 8 : anchor === "end" ? x + 8 : x;
    parts.push(text(lx, y, fit(event.label, 150, 12), cssVar("text", frame.preset.text), 12, "600", anchor));
  }

  const belowRows = taken.reduce((max, item) => (item.side === "below" ? Math.max(max, item.row) : max), -1);
  const yearY = axisY + 64 + Math.max(0, belowRows) * 16;
  for (const tick of yearTicks(min, max)) {
    if (tick < min || tick > max) continue;
    const x = xAt(tick);
    parts.push(`<line x1="${n(x)}" y1="${n(axisY - 4)}" x2="${n(x)}" y2="${n(axisY + 4)}" stroke="${cssVar("muted", frame.preset.muted)}" />`);
    parts.push(text(x, yearY, formatYear(tick), cssVar("muted", frame.preset.muted), 11, "500", "middle"));
  }
  return view.done();
}

function laneOf(periods: TimelineItem[]): Map<number, number> {
  const lanes = new Map<number, number>();
  const used: { lane: number; end: number }[] = [];
  const sorted = [...periods].sort((a, b) => (a.startMs ?? 0) - (b.startMs ?? 0));
  for (const period of sorted) {
    let lane = 0;
    const start = period.startMs ?? 0;
    while (used.some((item) => item.lane === lane && item.end > start)) lane += 1;
    used.push({ lane, end: period.endMs ?? start });
    lanes.set(period.index, lane);
  }
  return lanes;
}

function sideFor(taken: { x: number; half: number; side: "above" | "below"; row: number }[], x: number, half: number): { side: "above" | "below"; row: number } {
  const rowOn = (side: "above" | "below") => {
    for (let row = 0; row < 3; row++) {
      const hit = taken.some((item) => item.side === side && item.row === row && Math.abs(item.x - x) < item.half + half + 10);
      if (!hit) return row;
    }
    return 3;
  };
  const above = rowOn("above");
  const below = rowOn("below");
  return above <= below ? { side: "above", row: above } : { side: "below", row: below };
}

export function timelineRow(spec: Record<string, unknown>, index: number): Record<string, unknown> | undefined {
  return rowAt(spec, index);
}
