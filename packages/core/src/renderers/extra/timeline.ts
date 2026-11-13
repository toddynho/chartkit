import { labelInk } from "../../ink";
import { cssVar } from "../../theme";
import { n, ch } from "../../svg";
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
  const xAt = (time: number) => plotLeft + ((time - min) / (max - min)) * Math.max(1, plotRight - plotLeft);
  const periodTop0 = frame.title ? 48 : 24;
  const baseAxis = periodTop0 + laneCount * 40 + 36;
  const preview: { side: "above" | "below"; row: number }[] = [];
  const halves: number[] = [];
  for (const event of events) {
    const x = xAt(event.startMs as number);
    const half = Math.max(28, Math.min(96, ch(event.label.length, 3.35)));
    halves.push(half);
    preview.push(sideForRoomy(preview.map((item, index) => ({ x: xAt(events[index].startMs as number), half: halves[index], side: item.side, row: item.row })), x, half));
  }
  const previewBelow = preview.reduce((max, item) => (item.side === "below" ? Math.max(max, item.row) : max), -1);
  const baseYear = baseAxis + 64 + Math.max(0, previewBelow) * 16;
  const slack = Math.max(0, frame.height - 22 - baseYear);
  const classicAxis = baseAxis + slack * 0.45;
  const classicYear = baseYear + slack;
  const classicLabel = (item: { side: "above" | "below"; row: number }) =>
    item.side === "above" ? classicAxis - 18 - item.row * 16 : classicAxis + 22 + item.row * 16;
  const roomy =
    classicAxis <= frame.height - 10 &&
    classicYear <= frame.height - 2 &&
    preview.every((item) => {
      const y = classicLabel(item);
      return y >= 8 && y <= frame.height - 4;
    });
  const periodTop = roomy ? (frame.title ? 48 : 24) : frame.title ? 32 : 8;
  const lanePitch = roomy ? 40 : Math.min(40, Math.max(14, ((frame.height - periodTop - 28) * 0.36) / Math.max(1, laneCount)));
  const barH = roomy ? 26 : Math.max(8, Math.min(26, lanePitch - 4));
  const axisY = roomy
    ? periodTop + laneCount * 40 + 36
    : Math.min(frame.height - 22, periodTop + (periods.length ? lanePitch * laneCount : 0) + Math.max(12, (frame.height - periodTop - 24) * 0.38));
  const pitch = roomy ? 16 : frame.height < 140 ? 11 : 14;
  const aboveRoom = Math.max(0, axisY - periodTop - (periods.length ? lanePitch * laneCount : 0) - 8);
  const yearGap = roomy ? 64 : 14;
  const yearY = roomy ? axisY + yearGap : Math.min(frame.height - 8, axisY + yearGap);
  const maxAbove = roomy ? 4 : Math.max(0, Math.floor(aboveRoom / pitch));
  const maxBelow = roomy ? 4 : Math.max(0, Math.floor((yearY - axisY - 12) / pitch));
  const labelRoom = roomy ? 150 : Math.min(150, Math.max(36, plotRight - plotLeft));

  const placed: { event: (typeof events)[number]; x: number; half: number; side: "above" | "below"; row: number }[] = [];
  const unlabeled: { event: (typeof events)[number]; x: number }[] = [];
  for (const event of events) {
    const x = xAt(event.startMs as number);
    const half = Math.max(roomy ? 28 : 20, Math.min(96, ch(event.label.length, 3.35)));
    const place = roomy ? sideForRoomy(placed, x, half) : sideFor(placed, x, half, maxAbove, maxBelow);
    if (place) placed.push({ event, x, half, side: place.side, row: place.row });
    else unlabeled.push({ event, x });
  }
  const belowRows = placed.reduce((max, item) => (item.side === "below" ? Math.max(max, item.row) : max), -1);
  const fittedYear = roomy ? yearY + Math.max(0, belowRows) * 16 + Math.max(0, frame.height - 22 - (yearY + Math.max(0, belowRows) * 16)) : yearY;
  const drawnAxis = roomy ? axisY + Math.max(0, frame.height - 22 - (yearY + Math.max(0, belowRows) * 16)) * 0.45 : axisY;

  for (const period of periods) {
    const lane = lanes.get(period.index) ?? 0;
    const x1 = xAt(period.startMs as number);
    const x2 = xAt(period.endMs as number);
    const y = Math.min(frame.height - barH - 4, periodTop + lane * lanePitch);
    const width = Math.max(8, x2 - x1);
    const color = fill(frame, lane);
    const label = `${period.label}: ${formatDay(period.startMs as number)}–${formatDay(period.endMs as number)}`;
    parts.push(openMark("rect", "period", label, `x="${n(x1)}" y="${n(y)}" width="${n(width)}" height="${n(barH)}" rx="${n(Math.min(8, barH / 2))}" fill="${color}" stroke="${color}"`));
    parts.push("</rect>");
    const inside = barH >= 16 ? fit(period.label, width - 12, 12) : "";
    if (inside && inside.length > 2) parts.push(text(x1 + width / 2, roomy ? y + 17 : y + barH * 0.65, inside, labelInk(color), 12, "600", "middle"));
    else if (y > (frame.title ? 36 : 14)) parts.push(text(x1 + 8, y - 4, fit(period.label, width, 11), cssVar("text", frame.preset.text), 11, "600"));
  }

  parts.push(`<line x1="${n(plotLeft)}" y1="${n(drawnAxis)}" x2="${n(plotRight)}" y2="${n(drawnAxis)}" stroke="${cssVar("axis", frame.preset.axis)}" stroke-width="1.5" />`);
  const drawEvent = (event: (typeof events)[number], x: number, labelY: number | null, anchor = "middle") => {
    const color = cssVar("accent", frame.preset.accent);
    const label = `${event.label}: ${formatDay(event.startMs as number)}`;
    parts.push(openMark("circle", "event", label, `cx="${n(x)}" cy="${n(drawnAxis)}" r="6" fill="${color}" stroke="${cssVar("surface", frame.preset.surface)}" stroke-width="2"`));
    parts.push("</circle>");
    if (labelY === null || labelY < 8 || labelY > frame.height - 4) return;
    const edge = roomy ? 70 : 28;
    const side = x < plotLeft + edge ? "start" : x > plotRight - edge ? "end" : anchor;
    const lx = side === "start" ? x - 8 : side === "end" ? x + 8 : x;
    parts.push(text(lx, labelY, fit(event.label, labelRoom, 12), cssVar("text", frame.preset.text), 12, "600", side));
  };
  for (const item of placed) {
    const y = item.side === "above" ? drawnAxis - 18 - item.row * pitch : drawnAxis + 22 + item.row * pitch;
    drawEvent(item.event, item.x, y);
  }
  for (const item of unlabeled) drawEvent(item.event, item.x, null);

  let lastTick = -Infinity;
  for (const tick of yearTicks(min, max)) {
    if (tick < min || tick > max) continue;
    const x = xAt(tick);
    if (!roomy && (x < plotLeft - 2 || x > plotRight + 2 || x - lastTick < 34 || fittedYear > frame.height - 2)) continue;
    lastTick = x;
    parts.push(`<line x1="${n(x)}" y1="${n(drawnAxis - 4)}" x2="${n(x)}" y2="${n(drawnAxis + 4)}" stroke="${cssVar("muted", frame.preset.muted)}" />`);
    parts.push(text(x, fittedYear, formatYear(tick), cssVar("muted", frame.preset.muted), 11, "500", "middle"));
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

function sideForRoomy(taken: { x: number; half: number; side: "above" | "below"; row: number }[], x: number, half: number): { side: "above" | "below"; row: number } {
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

function sideFor(
  taken: { x: number; half: number; side: "above" | "below"; row: number }[],
  x: number,
  half: number,
  maxAbove: number,
  maxBelow: number,
): { side: "above" | "below"; row: number } | null {
  const rowOn = (side: "above" | "below", limit: number) => {
    for (let row = 0; row < limit; row++) {
      const hit = taken.some((item) => item.side === side && item.row === row && Math.abs(item.x - x) < item.half + half + 10);
      if (!hit) return row;
    }
    return -1;
  };
  const above = rowOn("above", maxAbove);
  const below = rowOn("below", maxBelow);
  if (above < 0 && below < 0) return null;
  if (above < 0) return { side: "below", row: below };
  if (below < 0) return { side: "above", row: above };
  return above <= below ? { side: "above", row: above } : { side: "below", row: below };
}

export function timelineRow(spec: Record<string, unknown>, index: number): Record<string, unknown> | undefined {
  return rowAt(spec, index);
}
