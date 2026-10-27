import { colorLegendHeight, readColorScale, scaleLabel } from "../color-scale";
import { CHROME_TOP, heading } from "../chrome";
import { cssVar, paint } from "../theme";
import { formatValue } from "../format";
import { asNumber, column, fieldOf, readColor, readFrame, readTable, type Frame } from "../frame";
import { activeScene, pushRect, takeMark, type SceneFrame, type SceneMark } from "../canvas/sink";
import { canvasWanted } from "../render-mode";
import { closeChart, esc, font, hash, n, openChart } from "../svg";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LABEL_W = 28;
const MONTH_LABEL_H = 16;

/**
 * Calendar (date × weekday) or grid (x × y) heatmap. Color encodes the value.
 * `mark.layout` wins when set. Otherwise encoding.y selects grid, and a missing y stays calendar.
 */
export function renderHeatmap(spec: Record<string, unknown>): string | null {
  return heatmapLayout(spec) === "grid" ? renderGrid(spec) : renderCalendar(spec);
}

function heatmapLayout(spec: Record<string, unknown>): "grid" | "calendar" {
  const mark = isRecord(spec.mark) ? spec.mark : undefined;
  if (mark?.layout === "grid" || mark?.layout === "calendar") return mark.layout;
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (encoding && encoding.y != null) return "grid";
  return "calendar";
}

function renderCalendar(spec: Record<string, unknown>): string | null {
  const table = readTable(spec);
  if (!table) return null;
  const frame = readFrame(spec, { width: 720, height: 160 });
  const colorEnc = readColor(frame.encoding.color);
  const xField = fieldOf(frame.encoding.x);
  const dates = column(table, xField);
  const values = column(table, colorEnc?.field);
  const byDay = new Map<number, number>();
  for (let i = 0; i < table.length; i++) {
    const day = utcDay(dates[i]);
    const value = asNumber(values[i]);
    if (day === null || value === null) continue;
    byDay.set(day, (byDay.get(day) ?? 0) + value);
  }
  if (byDay.size === 0) return null;

  const weeks = typeof frame.mark.weeks === "number" ? frame.mark.weeks : 52;
  const end = Math.max(...byDay.keys());
  // Last column is the week of the latest day. Counting back from that Sunday
  // keeps `weeks` columns and still draws the latest day. Snapping an
  // end-anchored start to Sunday used to finish the grid a few days early.
  const start = alignSunday(end) - Math.max(0, weeks - 1) * 7 * 86400000;
  const counts = [...byDay.values()];
  const max = Math.max(...counts, 1);
  const color = colorEnc?.constant ? paint(colorEnc.constant, frame.preset, 0) : paint(colorEnc?.range?.[colorEnc.range.length - 1], frame.preset, 0);
  const ramp = colorEnc?.constant ? null : readColorScale(frame.encoding.color, frame.preset, counts, true);
  const quiet = emptyMark(frame.id, frame.preset);
  const legendH = ramp ? colorLegendHeight : 22;
  // Untitled month labels share the title baseline. Sized charts keep that inset inside the requested height.
  const topReserve = frame.title || frame.subtitle ? 0 : Math.max(0, CHROME_TOP - 11);
  const box = calendarLayout(frame, weeks, legendH, topReserve);
  const head = (frame.title ? 28 : 0) + (frame.subtitle ? 16 : 0);
  if (head) {
    box.oy += head;
    box.height += head;
    box.legendY += head;
  }
  // Subtitle baseline is 40. Keep the month band under that, and the cells under the band.
  // With no title, month labels share the cartesian title baseline instead of sitting at y=11.
  const monthFloor = frame.subtitle ? (frame.title ? 54 : 32) : frame.title ? 36 : CHROME_TOP;
  const monthDrop = Math.max(0, monthFloor - (box.oy + 11));
  if (monthDrop) {
    box.oy += monthDrop;
    box.height += monthDrop;
    box.legendY += monthDrop;
  }
  const monthY = box.oy + 11;
  const radius = typeof frame.mark.cornerRadius === "number" ? frame.mark.cornerRadius : Math.min(frame.geometry.cornerRadius, 4);

  const months: { label: string; x: number }[] = [];
  let lastMonth = -1;
  const usedColumn = new Set<number>();
  const cells: string[] = [];
  const scene = activeScene();
  const cellsMark = scene ? sceneCells(scene, box.width, box.height, weeks * 7) : null;
  for (let week = 0; week < weeks; week++) {
    for (let dow = 0; dow < 7; dow++) {
      const time = start + (week * 7 + dow) * 86400000;
      if (time > end) continue;
      const date = new Date(time);
      if (date.getUTCMonth() !== lastMonth) {
        lastMonth = date.getUTCMonth();
        // A month that starts mid-week shares that column with the month
        // already labelled at the Sunday. Put it on the next free column.
        let column = usedColumn.has(week) ? week + 1 : week;
        const label = new Intl.DateTimeFormat(frame.locale, { month: "short", timeZone: "UTC" }).format(date);
        const x = box.ox + DAY_LABEL_W + column * box.pitchX;
        const prev = months[months.length - 1];
        const crowded = prev ? x < prev.x + prev.label.length * 5.8 + 6 : false;
        if (column < weeks && !usedColumn.has(column) && !crowded) {
          usedColumn.add(column);
          months.push({ label, x });
        }
      }
      const value = byDay.get(time) ?? 0;
      const x = box.ox + DAY_LABEL_W + week * box.pitchX;
      const y = box.oy + MONTH_LABEL_H + dow * box.pitchY;
      const iso = date.toISOString().slice(0, 10);
      const label = `${iso}: ${formatValue(value, channelFormatOf(frame.encoding.color), frame.locale)}`;
      const missing = value <= 0;
      const fill = missing ? quiet.fill : ramp ? ramp.paint(value) : color;
      const opacity = missing || ramp ? 1 : opacityStep(value / max);
      const edge = missing ? ` stroke="${quiet.stroke}" stroke-width="1" data-ck-empty="1"` : "";
      if (cellsMark) pushRect(cellsMark, x, y, box.cellW, box.cellH, missing ? quiet.stroke : fill);
      else cells.push(
        `<rect x="${n(x)}" y="${n(y)}" width="${n(box.cellW)}" height="${n(box.cellH)}" rx="${n(radius)}" fill="${fill}" fill-opacity="${n(opacity)}"${edge} aria-label="${esc(label)}"><title>${esc(label)}</title></rect>`,
      );
    }
  }

  const parts: string[] = [];
  const canvas = canvasWanted(spec);
  parts.push(openChart({ ...frame, width: box.width, height: box.height, renderer: "heatmap", canvas }));
  parts.push(`<rect width="100%" height="100%" fill="${cssVar("background", frame.preset.background)}" />`);
  parts.push(`<defs>${quiet.def}</defs>`);
  const titled = heading(frame, box.ox + DAY_LABEL_W);
  if (titled) parts.push(titled);
  for (const month of months) {
    parts.push(text(month.x, monthY, month.label, cssVar("muted", frame.preset.muted), 10));
  }
  for (const dow of [1, 3, 5]) {
    parts.push(text(box.ox, box.oy + MONTH_LABEL_H + dow * box.pitchY + box.cellH / 2 + 3, WEEKDAYS[dow], cssVar("muted", frame.preset.muted), 10));
  }
  if (!cellsMark) parts.push(canvas ? `<g data-ck-layer="marks">${cells.join("")}</g>` : cells.join(""));
  parts.push(ramp ? ramp.legend(box.legendX, box.legendY, scaleLabel(frame.preset)) : scaleLegend(color, quiet.fill, cssVar("muted", frame.preset.muted), box.legendX, box.legendY + 8));
  parts.push(closeChart());
  return parts.join("");
}

type CalendarBox = {
  cellW: number;
  cellH: number;
  pitchX: number;
  pitchY: number;
  ox: number;
  oy: number;
  width: number;
  height: number;
  legendX: number;
  legendY: number;
};

/** A day cell does not grow past this, so a wide card cannot turn weeks into bars. */
const MAX_CELL = 32;
/** Width and height stay within this of each other. Square is the aim. */
const MAX_CELL_RATIO = 1.5;

/**
 * Unsized calendars keep a 12px cell. A fixed size grows the cells, but they
 * stay square or at most 1.5:1 and never pass 32px. Leftover width or height
 * centres the grid. The legend sits under the first week.
 */
function calendarLayout(frame: Frame, weeks: number, legendH: number, topReserve = 0): CalendarBox {
  if (!frame.widthFixed && !frame.heightFixed) {
    const cell = 12;
    const gap = typeof frame.mark.gap === "number" ? Math.round(12 * frame.mark.gap) : 3;
    const pitch = cell + gap;
    const gridH = MONTH_LABEL_H + 7 * pitch;
    return {
      cellW: cell,
      cellH: cell,
      pitchX: pitch,
      pitchY: pitch,
      ox: 0,
      oy: topReserve,
      width: DAY_LABEL_W + weeks * pitch + 4,
      height: topReserve + gridH + 8 + legendH,
      legendX: DAY_LABEL_W,
      legendY: topReserve + gridH + 6,
    };
  }
  const frac = typeof frame.mark.gap === "number" ? Math.min(0.55, Math.max(0, frame.mark.gap)) : 0.2;
  const padX = DAY_LABEL_W + 8;
  const padY = MONTH_LABEL_H + legendH + 12 + topReserve;
  const maxPitch = MAX_CELL / (1 - frac);
  const widthPitch = frame.widthFixed ? Math.max(4, (frame.width - padX) / weeks) : null;
  const heightPitch = frame.heightFixed ? Math.max(4, (frame.height - padY) / 7) : null;
  let pitchX = Math.min(widthPitch ?? heightPitch ?? 15, maxPitch);
  let pitchY = Math.min(heightPitch ?? widthPitch ?? 15, maxPitch);
  if (pitchX > pitchY * MAX_CELL_RATIO) pitchX = pitchY * MAX_CELL_RATIO;
  if (pitchY > pitchX * MAX_CELL_RATIO) pitchY = pitchX * MAX_CELL_RATIO;
  const gridW = DAY_LABEL_W + weeks * pitchX;
  const gridH = MONTH_LABEL_H + 7 * pitchY;
  const width = frame.widthFixed ? frame.width : gridW + 4;
  const height = frame.heightFixed ? frame.height : topReserve + gridH + 8 + legendH;
  const blockH = gridH + 8 + legendH;
  const ox = frame.widthFixed ? Math.max(0, (width - 4 - gridW) / 2) : 0;
  const oy = frame.heightFixed ? Math.max(topReserve, (height - blockH) / 2) : topReserve;
  return {
    cellW: Math.max(2, pitchX * (1 - frac)),
    cellH: Math.max(2, pitchY * (1 - frac)),
    pitchX,
    pitchY,
    ox,
    oy,
    width,
    height,
    legendX: ox + DAY_LABEL_W,
    legendY: oy + gridH + 6,
  };
}

function renderGrid(spec: Record<string, unknown>): string | null {
  const table = readTable(spec);
  if (!table) return null;
  const frame = readFrame(spec, { width: 640, height: 280 });
  const colorEnc = readColor(frame.encoding.color);
  const xField = fieldOf(frame.encoding.x);
  const yField = fieldOf(frame.encoding.y);
  const xs: string[] = [];
  const ys: string[] = [];
  const values = new Map<string, number>();
  const xCol = column(table, xField);
  const yCol = column(table, yField);
  const cCol = column(table, colorEnc?.field);
  for (let i = 0; i < table.length; i++) {
    const x = xCol[i] === null || xCol[i] === undefined ? "" : String(xCol[i]);
    const y = yField ? (yCol[i] === null || yCol[i] === undefined ? "" : String(yCol[i])) : colorEnc?.title || "Value";
    const value = asNumber(cCol[i]);
    if (!xs.includes(x)) xs.push(x);
    if (!ys.includes(y)) ys.push(y);
    if (value !== null) values.set(`${x}\0${y}`, value);
  }
  if (xs.length === 0) return null;
  const nums = [...values.values()];
  const max = Math.max(...nums, 1);
  const min = Math.min(...nums, 0);
  const color = colorEnc?.constant ? paint(colorEnc.constant, frame.preset, 0) : paint(undefined, frame.preset, 0);
  const range = colorEnc?.range?.map((item, index) => paint(item, frame.preset, index));
  // A custom range is still a continuous ramp. Falling back to floor(t * stops) paints every cell but the maximum in the first stop.
  const ramp = colorEnc?.constant ? null : readColorScale(frame.encoding.color, frame.preset, nums, true);
  const radius = typeof frame.mark.cornerRadius === "number" ? frame.mark.cornerRadius : Math.min(frame.geometry.cornerRadius, 6);
  const quiet = emptyMark(frame.id, frame.preset);
  const yInk = ys.reduce((max, label) => Math.max(max, label.length * 6.8), 0);
  const left = Math.max(48, Math.ceil(yInk + 16));
  const xLabelBand = 16;
  const top = (frame.title ? 42 : 28) + (frame.subtitle ? 16 : 0) + xLabelBand;
  const legendH = ramp ? colorLegendHeight : 0;
  const plotW = frame.width - left - 16;
  const plotH = frame.height - top - 8 - legendH;
  const gapFrac = typeof frame.mark.gap === "number" ? frame.mark.gap : 0.15;
  const bandW = plotW / xs.length;
  const bandH = plotH / Math.max(1, ys.length);
  const insetX = bandW * gapFrac / 2;
  const insetY = bandH * gapFrac / 2;

  const canvas = canvasWanted(spec);
  const scene = activeScene();
  const cellsMark = scene ? sceneCells(scene, frame.width, frame.height, xs.length * ys.length) : null;
  const parts: string[] = [];
  parts.push(openChart({ ...frame, renderer: "heatmap", canvas }));
  parts.push(`<rect width="100%" height="100%" fill="${cssVar("background", frame.preset.background)}" />`);
  parts.push(`<defs>${quiet.def}</defs>`);
  const titled = heading(frame, left);
  if (titled) parts.push(titled);
  for (const y of ys) {
    const row = ys.indexOf(y);
    parts.push(text(left - 8, top + row * bandH + bandH / 2 + 4, y, cssVar("muted", frame.preset.muted), 11, "400", "end"));
  }
  const longestX = xs.reduce((max, label) => Math.max(max, label.length), 1);
  const xSize = Math.max(8, Math.min(11, Math.floor((bandW * 0.9) / (longestX * 0.56))));
  for (const x of xs) {
    const col = xs.indexOf(x);
    parts.push(text(left + col * bandW + bandW / 2, top - 6, x, cssVar("muted", frame.preset.muted), xSize, "400", "middle"));
  }
  if (canvas && !cellsMark) parts.push(`<g data-ck-layer="marks">`);
  for (const x of xs) {
    for (const y of ys) {
      const value = values.get(`${x}\0${y}`);
      const col = xs.indexOf(x);
      const row = ys.indexOf(y);
      const missing = value === undefined;
      const label = `${x}, ${y}: ${missing ? "no value" : formatValue(value, channelFormatOf(frame.encoding.color), frame.locale)}`;
      const t = missing ? 0 : max === min ? 1 : (value - min) / (max - min);
      const fill = missing ? quiet.fill : ramp ? ramp.paint(value) : range ? range[Math.min(range.length - 1, Math.floor(t * (range.length - 1)))] : color;
      const opacity = missing || range || ramp ? 1 : opacityStep(t);
      const edge = missing ? ` stroke="${quiet.stroke}" stroke-width="1" data-ck-empty="1"` : "";
      const rx = left + col * bandW + insetX;
      const ry = top + row * bandH + insetY;
      const rw = Math.max(1, bandW - insetX * 2);
      const rh = Math.max(1, bandH - insetY * 2);
      if (cellsMark) pushRect(cellsMark, rx, ry, rw, rh, missing ? quiet.stroke : fill);
      else parts.push(
        `<rect x="${n(rx)}" y="${n(ry)}" width="${n(rw)}" height="${n(rh)}" rx="${n(radius)}" fill="${fill}" fill-opacity="${n(opacity)}"${edge} aria-label="${esc(label)}"><title>${esc(label)}</title></rect>`,
      );
    }
  }
  if (canvas && !cellsMark) parts.push(`</g>`);
  if (ramp) parts.push(ramp.legend(left, frame.height - legendH, scaleLabel(frame.preset)));
  parts.push(closeChart());
  return parts.join("");
}

/**
 * Card fill plus a hairline hatch, so a gap is not the low ramp and not a blank cell.
 * The id includes the card paint. Two charts that share an alt (Soft beside midnight)
 * otherwise reuse the first pattern in the page, and the later theme paints the wrong card.
 */
function emptyMark(id: string, preset: { background: string; axis: string; text: string }): { def: string; fill: string; stroke: string } {
  const night = preset.background === "#0c0c0c" || preset.text === "#ffffff";
  const card = cssVar("background", night ? preset.background : "#f5f5f7");
  const ink = cssVar("axis", preset.axis);
  const pattern = `${id}e${hash(card + ink)}`;
  const def =
    `<pattern id="${pattern}" width="6" height="6" patternUnits="userSpaceOnUse">` +
    `<rect width="6" height="6" fill="${card}" />` +
    `<path d="M0 6 L6 0" stroke="${ink}" stroke-width="0.8" />` +
    `</pattern>`;
  return { def, fill: `url(#${pattern})`, stroke: ink };
}

function sceneCells(scene: SceneFrame, width: number, height: number, count: number): SceneMark {
  scene.plot = { left: 0, top: 0, right: width, bottom: height };
  scene.width = width;
  scene.height = height;
  scene.count = count;
  scene.key = `heat|${width}|${height}|${count}`;
  const mark = takeMark();
  mark.kind = "bar";
  mark.fillOpacity = 1;
  scene.marks.push(mark);
  return mark;
}

function opacityStep(t: number): number {
  if (t <= 0) return 0.18;
  if (t < 0.25) return 0.35;
  if (t < 0.5) return 0.55;
  if (t < 0.75) return 0.78;
  return 1;
}

function scaleLegend(color: string, empty: string, muted: string, x: number, y: number): string {
  const steps = [0, 0.35, 0.55, 0.78, 1];
  const cells = steps
    .map((opacity, index) => {
      const fill = index === 0 ? empty : color;
      const shown = index === 0 ? 1 : opacity;
      return `<rect x="${n(x + 28 + index * 14)}" y="${n(y)}" width="10" height="10" rx="2" fill="${fill}" fill-opacity="${n(shown)}" />`;
    })
    .join("");
  return `${text(x, y + 9, "Less", muted, 10)}${cells}${text(x + 28 + steps.length * 14 + 4, y + 9, "More", muted, 10)}`;
}

function utcDay(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(value);
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  }
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function alignSunday(time: number): number {
  const date = new Date(time);
  const day = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return day - new Date(day).getUTCDay() * 86400000;
}

function channelFormatOf(color: unknown): unknown {
  return color && typeof color === "object" && !Array.isArray(color) && "format" in color ? (color as { format?: unknown }).format : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(x: number, y: number, value: string, fill: string, size: number, weight = "400", anchor = "start"): string {
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="${font()}">${esc(value)}</text>`;
}
