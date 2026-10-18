import { fromMermaid as parseMermaid, installPhase4, toSpec as convertSpec, type ImportOptions, type ImportResult } from "./mermaid";

export type { ImportOptions, ImportResult } from "./mermaid";
import { capList, chooseAlt, clipText, dropDirective, parseTitle, unquote, warn, type ImportWarning, type Meta } from "./mermaid-shared";

function buildPhase4(
  kind: string,
  headerRest: string,
  body: string[],
  meta: Meta,
  maxPoints: number,
  warnings: ImportWarning[],
): Record<string, unknown> | null {
  if (kind === "gantt") return buildGantt(headerRest, body, meta, maxPoints, warnings);
  if (kind === "timeline") return buildTimeline(headerRest, body, meta, maxPoints, warnings);
  if (kind === "journey") return buildJourney(headerRest, body, meta, maxPoints, warnings);
  if (kind === "venn") return buildVenn(headerRest, body, meta, maxPoints, warnings);
  if (kind === "quadrant") return buildQuadrant(headerRest, body, meta, maxPoints, warnings);
  return null;
}

installPhase4(buildPhase4);

/** Sync parser for Node. Importing this module registers gantt, timeline, journey, venn, and quadrantChart. */
export function fromMermaid(text: string, options?: ImportOptions): ImportResult {
  installPhase4(buildPhase4);
  return parseMermaid(text, options);
}

/** Sync JSON-or-Mermaid parser with the phase-4 diagrams registered. */
export function toSpec(text: string, options?: ImportOptions): ImportResult {
  installPhase4(buildPhase4);
  return convertSpec(text, options);
}

function buildQuadrant(headerRest: string, body: string[], meta: Meta, maxPoints: number, warnings: ImportWarning[]): Record<string, unknown> | null {
  if (headerRest) warnings.push(warn("CK8004", `Unsupported quadrant header "${clipText(headerRest)}".`, ""));
  let diagramTitle = meta.title;
  let xTitle: string | undefined;
  let yTitle: string | undefined;
  const quadrant = ["", "", "", ""];
  const points: { name: string; x: number; y: number }[] = [];
  for (const line of body) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const title = parseTitle(trimmed);
    if (title) {
      diagramTitle = title;
      continue;
    }
    const axis = trimmed.match(/^(x-axis|y-axis)\b\s*(.*)$/i);
    if (axis) {
      const label = axisLabel(axis[2] ?? "");
      if (/^x-axis/i.test(axis[1])) xTitle = label;
      else yTitle = label;
      continue;
    }
    const quad = trimmed.match(/^quadrant-([1-4])\b\s*:?\s*(.*)$/i);
    if (quad) {
      quadrant[Number(quad[1]) - 1] = unquote(quad[2].trim());
      continue;
    }
    const point = trimmed.match(/^(.+?)\s*:\s*\[\s*([+-]?(?:\d+\.?\d*|\.\d+))\s*,\s*([+-]?(?:\d+\.?\d*|\.\d+))\s*\]\s*(.*)$/);
    if (point) {
      if (point[4] && /radius/i.test(point[4])) warnings.push(warn("CK8004", "Quadrant point radius is not drawn.", "/mark"));
      else if (point[4].trim()) warnings.push(warn("CK8004", `Unsupported quadrant point suffix "${clipText(point[4])}".`, "/data"));
      points.push({ name: unquote(point[1].trim()), x: Number(point[2]), y: Number(point[3]) });
      continue;
    }
    if (dropDirective(trimmed, warnings)) continue;
    warnings.push(warn("CK8004", `Unsupported quadrant line "${clipText(trimmed)}".`, ""));
  }
  const kept = capList(points, maxPoints, warnings, "quadrant");
  if (!kept.length) {
    warnings.push(warn("CK8005", "Quadrant chart has no points.", "/data"));
    return null;
  }
  const xDomain: [number, number] = [Math.min(0, ...kept.map((point) => point.x)), Math.max(1, ...kept.map((point) => point.x))];
  const yDomain: [number, number] = [Math.min(0, ...kept.map((point) => point.y)), Math.max(1, ...kept.map((point) => point.y))];
  const names = [quadrant[1], quadrant[0], quadrant[2], quadrant[3]];
  const lead = kept[0];
  const spec: Record<string, unknown> = {
    version: "1",
    type: "quadrant",
    data: kept.map((point) => ({ name: point.name, x: point.x, y: point.y })),
    encoding: {
      x: axisChannel("x", xTitle, xDomain),
      y: axisChannel("y", yTitle, yDomain),
    },
    a11y: { alt: chooseAlt(meta, diagramTitle, `${lead.name} is plotted at ${lead.x}, ${lead.y}.`) },
  };
  if (names.some(Boolean)) spec.quadrants = names;
  if (diagramTitle) spec.title = diagramTitle;
  return spec;
}

function axisChannel(field: string, title: string | undefined, domain: [number, number]): string | Record<string, unknown> {
  const wide = domain[0] !== 0 || domain[1] !== 1;
  if (!title && !wide) return field;
  const channel: Record<string, unknown> = { field };
  if (title) channel.title = title;
  if (wide) channel.scale = { domain };
  return channel;
}

function axisLabel(rest: string): string {
  const parts = rest.split(/\s*-->\s*/);
  if (parts.length === 2) return `${unquote(parts[0].trim())}|${unquote(parts[1].trim())}`;
  return unquote(rest.trim());
}

function buildGantt(headerRest: string, body: string[], meta: Meta, maxPoints: number, warnings: ImportWarning[]): Record<string, unknown> | null {
  if (headerRest) warnings.push(warn("CK8004", `Unsupported gantt header "${clipText(headerRest)}".`, ""));
  let diagramTitle = meta.title;
  let section = "";
  let cursor = "";
  const ends = new Map<string, string>();
  const rows: Record<string, unknown>[] = [];
  for (const line of body) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const title = parseTitle(trimmed);
    if (title) {
      diagramTitle = title;
      continue;
    }
    if (dropDirective(trimmed, warnings)) continue;
    const named = trimmed.match(/^(section|dateFormat|axisFormat|excludes|inclusiveEndDates|weekday|tickInterval|todayMarker)\b\s*(.*)$/i);
    if (named) {
      const key = named[1].toLowerCase();
      if (key === "section") section = unquote(named[2].trim());
      else if (key === "dateformat" && named[2].trim() !== "YYYY-MM-DD") warnings.push(warn("CK8004", "dateFormat other than YYYY-MM-DD is not applied.", ""));
      else if (key !== "dateformat") warnings.push(warn("CK8004", `Unsupported gantt line "${clipText(trimmed)}".`, ""));
      continue;
    }
    const colon = trimmed.indexOf(":");
    if (colon < 0) {
      warnings.push(warn("CK8004", `Unsupported gantt line "${clipText(trimmed)}".`, ""));
      continue;
    }
    const read = ganttRow(unquote(trimmed.slice(0, colon).trim()), trimmed.slice(colon + 1), section, cursor, ends, warnings);
    if (!read) continue;
    rows.push(read.row);
    cursor = read.cursor || cursor;
  }
  return scheduleSpec("gantt", rows, meta, diagramTitle, maxPoints, warnings, "Gantt has no tasks.");
}

function ganttRow(
  task: string,
  rest: string,
  section: string,
  cursor: string,
  ends: Map<string, string>,
  warnings: ImportWarning[],
): { row: Record<string, unknown>; cursor: string } | null {
  if (!task || /^vert\b/i.test(task)) {
    if (task) warnings.push(warn("CK8004", "Gantt vert markers are not drawn.", ""));
    return null;
  }
  let rank = 0;
  let status = "";
  let milestone = false;
  let id = "";
  const depends: string[] = [];
  const dates: string[] = [];
  let duration = "";
  for (const token of rest.split(",").map((part) => part.trim()).filter(Boolean)) {
    const tag = token.toLowerCase();
    const weight = tag === "crit" ? 3 : tag === "active" ? 2 : tag === "done" ? 1 : 0;
    if (weight) {
      if (weight > rank) {
        rank = weight;
        status = tag;
      }
      continue;
    }
    if (tag === "milestone") {
      milestone = true;
      continue;
    }
    const after = token.match(/^after\s+(\S+)$/i);
    if (after) {
      depends.push(after[1]);
      continue;
    }
    const date = token.match(/^(\d{4}-\d{2}-\d{2})/);
    if (date) {
      dates.push(date[1]);
      if (token.length !== date[1].length) warnings.push(warn("CK8004", "A gantt time of day is not drawn.", ""));
      continue;
    }
    const span = token.match(/^(\d+(?:\.\d+)?)([dw])$/i);
    if (span) {
      duration = `${span[1]}${span[2].toLowerCase()}`;
      if (span[2].toLowerCase() === "d" && Number(span[1]) === 0) milestone = true;
      continue;
    }
    if (!id && /^[A-Za-z_][\w-]*$/.test(token)) {
      id = token;
      continue;
    }
    warnings.push(warn("CK8004", `Unsupported gantt value "${clipText(token)}".`, "/data"));
  }
  let start = dates[0] ?? "";
  if (!start) start = depends.map((item) => ends.get(item)).find(Boolean) || cursor;
  if (!start) warnings.push(warn("CK8004", `Gantt task "${clipText(task)}" has no start.`, "/data"));
  const end = dates[1] || (start && duration && !milestone ? shiftISO(start, durationDays(duration)) : milestone && start ? start : "");
  const row: Record<string, unknown> = { task };
  if (section) row.section = section;
  if (id) row.id = id;
  if (start) row.start = start;
  if (dates[1]) row.end = dates[1];
  else if (duration && !milestone) row.duration = duration;
  if (milestone) row.milestone = true;
  if (status) row.status = status;
  if (depends.length) row.depends = depends.join(", ");
  if (id && end) ends.set(id, end);
  return { row, cursor: end || cursor };
}

function buildTimeline(headerRest: string, body: string[], meta: Meta, maxPoints: number, warnings: ImportWarning[]): Record<string, unknown> | null {
  if (headerRest) warnings.push(warn("CK8004", `Unsupported timeline header "${clipText(headerRest)}".`, ""));
  let diagramTitle = meta.title;
  let current = "";
  const rows: Record<string, unknown>[] = [];
  for (const line of body) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const title = parseTitle(trimmed);
    if (title) {
      diagramTitle = title;
      continue;
    }
    if (dropDirective(trimmed, warnings)) continue;
    if (/^section\b/i.test(trimmed)) {
      warnings.push(warn("CK8004", "Timeline sections are not date spans.", ""));
      continue;
    }
    const continued = trimmed.startsWith(":");
    const colon = continued ? 0 : trimmed.indexOf(":");
    const time = colon <= 0 ? current : trimmed.slice(0, colon).trim();
    if (colon > 0) current = time;
    const when = timeSpan(time);
    if (!when) {
      if (time) warnings.push(warn("CK8004", `Timeline period "${clipText(time)}" is not a date.`, ""));
      continue;
    }
    const labels = trimmed.slice(colon + 1).split(":").map((part) => unquote(part.trim())).filter(Boolean);
    for (const label of labels) rows.push(when.end ? { label, start: when.start, end: when.end } : { label, date: when.start });
  }
  return scheduleSpec("timeline", rows, meta, diagramTitle, maxPoints, warnings, "Timeline has no events.");
}

function buildJourney(headerRest: string, body: string[], meta: Meta, maxPoints: number, warnings: ImportWarning[]): Record<string, unknown> | null {
  if (headerRest) warnings.push(warn("CK8004", `Unsupported journey header "${clipText(headerRest)}".`, ""));
  let diagramTitle = meta.title;
  let section = "";
  const rows: Record<string, unknown>[] = [];
  for (const line of body) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const title = parseTitle(trimmed);
    if (title) {
      diagramTitle = title;
      continue;
    }
    if (dropDirective(trimmed, warnings)) continue;
    const named = trimmed.match(/^section\b\s*(.*)$/i);
    if (named) {
      section = unquote(named[1].trim());
      continue;
    }
    const task = trimmed.match(/^(.*?):\s*([1-5])\s*(?::\s*(.*))?$/);
    if (!task) {
      warnings.push(warn("CK8004", `Unsupported journey line "${clipText(trimmed)}".`, ""));
      continue;
    }
    if (!section) warnings.push(warn("CK8004", "Journey task has no section.", "/data"));
    const actors = (task[3] ?? "").split(",").map((part) => unquote(part.trim())).filter(Boolean).join(", ");
    const row: Record<string, unknown> = { step: unquote(task[1].trim()), score: Number(task[2]) };
    if (section) row.section = section;
    if (actors) row.actors = actors;
    rows.push(row);
  }
  return scheduleSpec("journey", rows, meta, diagramTitle, maxPoints, warnings, "Journey has no tasks.");
}

function buildVenn(headerRest: string, body: string[], meta: Meta, maxPoints: number, warnings: ImportWarning[]): Record<string, unknown> | null {
  if (headerRest) warnings.push(warn("CK8004", `Unsupported venn header "${clipText(headerRest)}".`, ""));
  let diagramTitle = meta.title;
  const labels = new Map<string, string>();
  const rows: Record<string, unknown>[] = [];
  let sets = 0;
  for (const line of body) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const title = parseTitle(trimmed);
    if (title) {
      diagramTitle = title;
      continue;
    }
    if (dropDirective(trimmed, warnings)) continue;
    if (/^text\b/i.test(trimmed)) {
      warnings.push(warn("CK8004", "Venn text is not drawn.", ""));
      continue;
    }
    const set = trimmed.match(/^set\b\s*(.*)$/i);
    const union = trimmed.match(/^union\b\s*(.*)$/i);
    if (!set && !union) {
      warnings.push(warn("CK8004", `Unsupported venn line "${clipText(trimmed)}".`, ""));
      continue;
    }
    const item = vennItem((set ?? union)?.[1] ?? "");
    if (!item) {
      warnings.push(warn("CK8004", `Unsupported venn line "${clipText(trimmed)}".`, ""));
      continue;
    }
    if (set) {
      labels.set(item.id, item.label);
      sets += 1;
      rows.push({ set: item.label, size: item.size ?? 1 });
      continue;
    }
    if (item.size == null) {
      warnings.push(warn("CK8004", "Venn overlap has no size.", "/data"));
      continue;
    }
    const names = item.ids.map((id) => labels.get(id) ?? id);
    rows.push({ set: names.join("+"), size: item.size });
  }
  if (sets > 3) warnings.push(warn("CK8004", "Venn draws 2 or 3 sets.", "/data"));
  const lead = rows[0];
  const factual = typeof lead?.set === "string" ? `${lead.set} is a set in the diagram.` : "Sets overlap.";
  return scheduleSpec("venn", rows, meta, diagramTitle, maxPoints, warnings, "Venn has no sets.", factual);
}

function scheduleSpec(
  type: string,
  rows: Record<string, unknown>[],
  meta: Meta,
  diagramTitle: string | undefined,
  maxPoints: number,
  warnings: ImportWarning[],
  empty: string,
  factual?: string,
): Record<string, unknown> | null {
  const kept = capList(rows, maxPoints, warnings, type);
  if (!kept.length) {
    warnings.push(warn("CK8005", empty, "/data"));
    return null;
  }
  const spec: Record<string, unknown> = {
    version: "1",
    type,
    data: kept,
    a11y: { alt: chooseAlt(meta, diagramTitle, factual ?? `${type} has ${kept.length} rows.`) },
  };
  if (diagramTitle) spec.title = diagramTitle;
  return spec;
}

function timeSpan(text: string): { start: string; end?: string } | null {
  const range = text.trim().match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?\s*[-/]\s*(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
  if (range) return { start: ymd(range[1], range[2], range[3]), end: ymd(range[4], range[5], range[6]) };
  const one = text.trim().match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
  return one ? { start: ymd(one[1], one[2], one[3]) } : null;
}

function ymd(year: string, month?: string, day?: string): string {
  return `${year}-${(month ?? "01").padStart(2, "0")}-${(day ?? "01").padStart(2, "0")}`;
}

function durationDays(token: string): number {
  const match = /^(\d+(?:\.\d+)?)([dw])$/i.exec(token);
  const count = Number(match?.[1] ?? 0);
  return match?.[2]?.toLowerCase() === "w" ? count * 7 : count;
}

function shiftISO(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day) + days * 86400000).toISOString().slice(0, 10);
}

function vennItem(rest: string): { id: string; ids: string[]; label: string; size: number | null } | null {
  let body = rest.trim();
  let size: number | null = null;
  const sized = body.match(/:\s*([+-]?(?:\d+\.?\d*|\.\d+))\s*$/);
  if (sized?.[1] && sized.index != null) {
    size = Number(sized[1]);
    body = body.slice(0, sized.index).trim();
  }
  const bracket = body.match(/^(.*?)\s*\[\s*(?:"([^"]*)"|'([^']*)'|([^\]]+?))\s*\]\s*$/);
  const label = bracket ? (bracket[2] ?? bracket[3] ?? bracket[4] ?? "").trim() : "";
  if (bracket) body = bracket[1].trim().replace(/,\s*$/, "");
  const ids = body.split(",").map((part) => unquote(part.trim())).filter(Boolean);
  if (!ids.length) return null;
  return { id: ids[0], ids, label: label || ids[0], size };
}
