import { explicitGrid, gridLines, majorTicks, spine, turned } from "../../axis-ink";
import { chooseTicks, labelStep, lockDomain, minorTickMarks, placedAxisTitles } from "../../chrome";
import { legendLabel, legendMarkup, legendShownValue } from "../../legend";
import { axisOn, column, fieldOf, knownField, numericField, scaleTypeOf, textField } from "../../frame";
import { cssVar, paint } from "../../theme";
import { ch, esc, hash, isRecord, logNice, logScale, logTicks, n, pointRadius, readAxis, scaleClamp } from "../../svg";
import {
  axisFormat,
  axisLine,
  domainTicks,
  fill,
  fmt,
  num,
  openMark,
  pct,
  scaleOf,
  str,
  text,
  valueFormat,
  viewOf,
} from "./plot";

interface Dot {
  value: number;
  label: string;
  colorKey: string;
  note: string;
  key: string;
}

interface Group {
  name: string;
  dots: Dot[];
}

interface Compare {
  from: string;
  to: string;
  at: "summary" | "min" | "max" | "mean";
  toAt: "summary" | "min" | "max" | "mean";
  label: string;
}

/** One categorical row of observations on a shared numeric axis. */
export function renderStrip(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "strip", 640, 360);
  if (!view) return null;
  const { frame, parts, table } = view;
  const vertical = frame.mark.orientation === "vertical";
  const groupChannel = vertical ? frame.encoding.x : frame.encoding.y;
  const valueChannel = vertical ? frame.encoding.y : frame.encoding.x;
  let valueField = knownField(valueChannel, table.fields, vertical ? ["y", "value"] : ["x", "value"]);
  if (!valueField) valueField = numericField(table, []);
  let groupField = knownField(groupChannel, table.fields, vertical ? ["x", "group"] : ["y", "group"]);
  if (!groupField || groupField === valueField) groupField = textField(table, [valueField ?? ""]);
  if (!groupField || !valueField) return null;
  const labelField = fieldOf(frame.encoding.label);
  const noteField = fieldOf(frame.encoding.note);
  const color = readColor(frame.encoding.color);
  const groups = new Map<string, Group>();
  const names = column(table, groupField);
  const values = num(table, valueField);
  const labels = column(table, labelField);
  const notes = column(table, noteField);
  const colors = column(table, color.field);
  for (let i = 0; i < table.length; i++) {
    const value = values[i];
    if (value === null) continue;
    const name = str(names[i]);
    if (!name) continue;
    const label = labelField ? str(labels[i]) : "";
    const note = noteField ? str(notes[i]) : "";
    const colorKey = color.field ? str(colors[i]) : "";
    const dot: Dot = { value, label, colorKey, note, key: `${name}|${label}|${value}|${i}` };
    const group = groups.get(name);
    if (group) group.dots.push(dot);
    else groups.set(name, { name, dots: [dot] });
  }
  let rows = [...groups.values()];
  if (!rows.length) return null;
  const summary = frame.mark.summary === "none" || frame.mark.summary === "mean" || frame.mark.summary === "median" ? frame.mark.summary : "median";
  const band = frame.mark.band === "range" || frame.mark.band === "iqr" ? frame.mark.band : "none";
  const highlight = typeof frame.mark.highlight === "string" ? frame.mark.highlight : "";
  const emphasis = frame.mark.emphasis === "ring" || frame.mark.emphasis === "color" || frame.mark.emphasis === "muted" ? frame.mark.emphasis : highlight ? "muted" : "none";
  const noteMode = frame.mark.note === "field" || frame.mark.note === "range" || frame.mark.note === "none" ? frame.mark.note : noteField ? "field" : "none";
  const notePrefix = typeof frame.mark.notePrefix === "string" ? frame.mark.notePrefix : "";
  const pin = frame.mark.pin === true;
  const pinFmt = frame.mark.pinFormat !== undefined ? frame.mark.pinFormat : undefined;
  const bandColor = frame.mark.bandColor === "series" ? "series" : "accent";
  const valueMode = frame.mark.value === "highlight" ? "highlight" : "summary";
  const labelColor = frame.mark.labelColor === "accent" || frame.mark.labelColor === "series" ? frame.mark.labelColor : "text";
  const labelSuffix = typeof frame.mark.labelSuffix === "string" ? frame.mark.labelSuffix : "";
  const zebra = frame.mark.zebra === true;
  const gutterSpec = typeof frame.mark.gutter === "number" && Number.isFinite(frame.mark.gutter) ? Math.max(0, Math.min(240, frame.mark.gutter)) : null;
  const degenerate = rows.every((row) => row.dots.length === 1);
  const drawSummary = !degenerate && summary !== "none";
  const drawBand = !degenerate && band !== "none";
  const sort = frame.mark.sort === "asc" || frame.mark.sort === "desc" ? frame.mark.sort : "none";
  if (sort !== "none") {
    rows = [...rows].sort((a, b) => {
      const delta = stat(a, summary === "none" ? "median" : summary) - stat(b, summary === "none" ? "median" : summary);
      return sort === "asc" ? delta : -delta;
    });
  }
  const flat = rows.flatMap((row) => row.dots.map((dot) => dot.value));
  const valueKey = vertical ? "y" : "x";
  const valueLog = scaleTypeOf(valueChannel) === "log";
  const logDomain = valueLog ? logDomainOf(valueChannel, flat) : null;
  let v0: number;
  let v1: number;
  let valueTicks: number[];
  if (logDomain) {
    v0 = logDomain[0];
    v1 = logDomain[1];
    valueTicks = chooseTicks(spec, valueKey, v0, v1, logTicks(v0, v1));
  } else {
    let min = Math.min(...flat);
    let max = Math.max(...flat);
    if (min === max) max = min + 1;
    const pad = (max - min) * 0.06;
    const locked = lockDomain(min - pad, max + pad, [valueChannel]);
    const domain = domainTicks(locked[0], locked[1]);
    v0 = Math.min(locked[0], domain[0] ?? locked[0]);
    v1 = Math.max(locked[1], domain[domain.length - 1] ?? locked[1]);
    valueTicks = chooseTicks(spec, valueKey, v0, v1, domainTicks(v0, v1));
  }
  const endFmt = frame.mark.labelFormat !== undefined ? frame.mark.labelFormat : valueFormat(frame, spec, valueChannel, valueKey);
  const axisFmt = axisFormat(spec, valueChannel, valueKey);
  const tickFmt = axisFmt !== undefined ? axisFmt : endFmt;
  const shown = endFmt;
  const pinFormat = pinFmt !== undefined ? pinFmt : endFmt;
  const radius = pointRadius(frame.mark.pointSize, Math.max(3.5, frame.geometry.pointSize));
  const compare = readCompare(spec);
  const rowNotes = rows.map((row) => rowNote(row, noteMode, notePrefix, frame.locale, shown));
  const nameWidth = Math.max(...rows.map((row) => row.name.length), 0) * 7.2;
  const noteWidth = Math.max(...rowNotes.map((note) => note.length), 0) * 6.2;
  const left = vertical ? 56 : Math.max(72, Math.ceil(Math.max(nameWidth, noteWidth)) + 18);
  const top = frame.title ? 46 : 20;
  const bottom = 40;
  const endLabels = rows.map((row) => endValue(row, valueMode, highlight, summary, drawSummary));
  const endTexts = endLabels.map((value) => (value === undefined ? "" : fmt(value, frame.locale, shown)));
  const rangeTexts = rows.map((row, index) => (noteMode !== "none" || row.dots.length < 2 || endLabels[index] === undefined ? "" : rangeText(row, frame.locale, shown)));
  const valueW = Math.max(...endTexts.map((label) => ch(label.length, 7.2)), 0);
  const suffixW = labelSuffix ? ch(labelSuffix.length, 6.2) + 3 : 0;
  const rangeW = Math.max(...rangeTexts.map((label) => ch(label.length, 6.4)), 0);
  const measuredGutter = 12 + valueW + suffixW + (rangeW > 0 ? 8 + rangeW : 0) + 10;
  let rightPad = gutterSpec === null ? measuredGutter : gutterSpec;
  const room = frame.width - left - (gutterSpec === null ? 80 : 40);
  if (room > 24) rightPad = Math.min(rightPad, room);
  const box = { left, top, right: frame.width - (vertical ? 20 : Math.max(16, rightPad)), bottom: frame.height - bottom };
  const rawAt = valueLog && logDomain
    ? vertical
      ? logScale(v0, v1, box.bottom, box.top)
      : logScale(v0, v1, box.left, box.right)
    : vertical
      ? scaleOf(v0, v1, box.bottom, box.top)
      : scaleOf(v0, v1, box.left, box.right);
  const clampEnds = scaleClamp(valueChannel) ? [Math.min(v0, v1), Math.max(v0, v1)] : null;
  const at = (value: number) => {
    if (!clampEnds) return rawAt(value);
    const clamped = value < clampEnds[0] ? clampEnds[0] : value > clampEnds[1] ? clampEnds[1] : value;
    return rawAt(clamped);
  };
  const extra = compare ? 26 : 0;
  const lane = vertical ? (box.right - box.left - extra) / rows.length : (box.bottom - box.top - extra) / rows.length;
  const centerOf = (index: number) => {
    let cursor = vertical ? box.left : box.top;
    for (let i = 0; i < index; i++) cursor += lane + (compare && rows[i]?.name === compare.from ? extra : 0);
    return cursor + lane / 2;
  };
  const colorNames: string[] = [];
  if (color.field) {
    for (const row of rows) {
      for (const dot of row.dots) if (dot.colorKey && !colorNames.includes(dot.colorKey)) colorNames.push(dot.colorKey);
    }
  }
  const seriesOf = (key: string) => fill(frame, Math.max(0, colorNames.indexOf(key)));
  const inkOf = (key: string) => seriesInk(frame, Math.max(0, colorNames.indexOf(key)));
  const pointed = (row: Group, dot: Dot) => (highlight && (row.name === highlight || dot.colorKey === highlight));
  const dotColor = (row: Group, dot: Dot, index: number) => {
    if (highlight && emphasis === "muted") return paint(row.name === highlight ? "accent" : "muted", frame.preset, 0);
    if (pointed(row, dot) && emphasis !== "none") return paint("accent", frame.preset, 0);
    if (color.constant) return paint(color.constant, frame.preset, index);
    if (color.field) return seriesOf(dot.colorKey);
    return fill(frame, index);
  };
  const jitterOf = (row: Group) => offsets(row, at, radius, frame.mark.jitter);
  const gridMode = valueGridMode(spec, valueKey);
  if (gridMode) parts.push(valueGrid(vertical, box, valueTicks, at, frame.preset.grid, gridMode));
  const domainLo = Math.min(v0, v1);
  const domainHi = Math.max(v0, v1);
  rows.forEach((row, index) => {
    const center = centerOf(index);
    if (zebra && index % 2 === 0) {
      const span = vertical ? box.right - box.left : lane;
      const thick = Math.max(22, (vertical ? span : lane) - 6);
      const x = vertical ? center - thick / 2 : 6;
      const y = vertical ? 6 : center - thick / 2;
      const width = vertical ? thick : frame.width - 12;
      const height = vertical ? frame.height - 12 : thick;
      parts.push(`<rect data-ck-zebra="1" x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(height)}" rx="8" fill="light-dark(#f8f8f6, #1c1d21)" />`);
    }
    const along = vertical
      ? `x1="${n(center)}" y1="${n(box.top)}" x2="${n(center)}" y2="${n(box.bottom)}"`
      : `x1="${n(box.left)}" y1="${n(center)}" x2="${n(box.right)}" y2="${n(center)}"`;
    const key = row.dots.find((dot) => dot.colorKey)?.colorKey ?? "";
    const rule = zebra ? `stroke-width="1" stroke-opacity="0.55"` : `stroke-width="2"`;
    parts.push(`<line data-ck-grid="1" ${along} stroke="${cssVar("grid", frame.preset.grid)}" ${rule} stroke-linecap="round" />`);
    if (drawBand && row.dots.length >= 3) {
      const ends = bandEnds(row, band);
      const wash = bandColor === "series" ? (key ? seriesOf(key) : fill(frame, index)) : cssVar("accent", frame.preset.accent);
      parts.push(bandMark(vertical, center, at(ends[0]), at(ends[1]), wash, row.name, bandColor === "series" ? 0.18 : 0.12));
    }
  });
  rows.forEach((row, index) => {
    if (!drawSummary) return;
    const center = centerOf(index);
    const value = stat(row, summary);
    const label = `${row.name} ${summary} ${fmt(value, frame.locale, shown)}`;
    const key = row.dots.find((dot) => dot.colorKey)?.colorKey ?? "";
    const ink = bandColor === "series"
      ? (key ? inkOf(key) : fill(frame, index))
      : summaryInk(row.name === highlight, emphasis, labelColor, key, inkOf, frame);
    if (vertical) {
      parts.push(openMark("line", "summary", label, `x1="${n(center - 11)}" y1="${n(at(value))}" x2="${n(center + 11)}" y2="${n(at(value))}" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"`));
    } else {
      parts.push(openMark("line", "summary", label, `x1="${n(at(value))}" y1="${n(center - 11)}" x2="${n(at(value))}" y2="${n(center + 11)}" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"`));
    }
    parts.push("</line>");
  });
  const ordered: { row: Group; dot: Dot; index: number }[] = [];
  rows.forEach((row, index) => {
    const ranked = [...row.dots].sort((a, b) => a.value - b.value || a.key.localeCompare(b.key));
    for (const dot of ranked) ordered.push({ row, dot, index });
  });
  const shifts = new Map<string, number>();
  for (const row of rows) {
    const found = jitterOf(row);
    row.dots.forEach((dot, index) => shifts.set(dot.key, found[index] ?? 0));
  }
  const pins: { row: Group; dot: Dot; index: number; side: "lo" | "hi" }[] = [];
  for (const item of ordered) {
    const outside = item.dot.value < domainLo - 1e-9 ? "lo" : item.dot.value > domainHi + 1e-9 ? "hi" : "";
    if (pin && outside) {
      pins.push({ row: item.row, dot: item.dot, index: item.index, side: outside });
      continue;
    }
    const limit = Math.max(0, lane / 2 - radius - 1);
    const rawShift = shifts.get(item.dot.key) ?? 0;
    const shift = Math.max(-limit, Math.min(limit, rawShift));
    const center = centerOf(item.index);
    const pos = at(item.dot.value);
    const cx = vertical ? center + shift : pos;
    const cy = vertical ? pos : center + shift;
    const color = dotColor(item.row, item.dot, item.index);
    const label = tip(item.row.name, item.dot, frame.locale, pinFmt !== undefined ? pinFormat : shown);
    const ringed = emphasis === "ring" && pointed(item.row, item.dot);
    const dotRadius = ringed ? Math.max(radius + 2, Math.round(radius * 1.55)) : radius;
    if (ringed) {
      const halo = paint("accent", frame.preset, 0);
      parts.push(`<circle data-ck-mark="ring" cx="${n(cx)}" cy="${n(cy)}" r="${n(dotRadius + 4)}" fill="${halo}" fill-opacity="0.28" />`);
    }
    parts.push(
      openMark(
        "circle",
        "point",
        label,
        `tabindex="0" cx="${n(cx)}" cy="${n(cy)}" r="${n(dotRadius)}" fill="${color}" stroke="${cssVar("background", frame.preset.background)}" stroke-width="1.5" data-ck-group="${escapeAttr(item.row.name)}"${Number.isFinite(item.dot.value) ? ` data-ck-value="${item.dot.value}"` : ""}`,
        item.dot.label || item.row.name,
        ordered.indexOf(item),
      ),
    );
    parts.push("</circle>");
  }
  drawPins(parts, pins, vertical, box, centerOf, dotColor, frame, pinFormat);
  if (compare) {
    const from = rows.find((row) => row.name === compare.from);
    const to = rows.find((row) => row.name === compare.to);
    if (from && to) {
      const fromIndex = rows.indexOf(from);
      const y = vertical ? centerOf(fromIndex) + lane / 2 + 4 : centerOf(fromIndex) + lane / 2 + 2;
      const a = at(endStat(from, compare.at, summary));
      const b = at(endStat(to, compare.toAt, summary));
      parts.push(bracket(vertical, a, b, y, compare.label, frame.preset.accent));
    }
  }
  const catKey = vertical ? "x" : "y";
  const catAxis = readAxis(spec, catKey);
  const catRich = Boolean(catAxis.rotate || catAxis.offset || catAxis.end);
  const centers: number[] = [];
  rows.forEach((row, index) => {
    const center = centerOf(index);
    centers.push(center);
    const key = row.dots.find((dot) => dot.colorKey)?.colorKey ?? "";
    const named = row.name === highlight && (emphasis === "color" || emphasis === "muted");
    const ink = named ? paint("accent", frame.preset, 0) : labelColor === "series" && emphasis === "color" ? inkOf(key) : cssVar("text", frame.preset.text);
    const weight = named ? "600" : "500";
    const note = rowNotes[index] ?? "";
    const nameY = note && !vertical ? center - 2 : center + 4;
    if (!catRich) {
      if (vertical) parts.push(text(center, box.bottom + 16, row.name, ink, 12, weight, "middle"));
      else parts.push(text(box.left - 10, nameY, row.name, ink, 13, weight, "end"));
    } else if (vertical) {
      const y = (catAxis.end ? box.top - 8 : box.bottom + 16) + (catAxis.end ? 0 : catAxis.offset || 0);
      parts.push(turned(center, y, row.name, ink, 12, "middle", catAxis.rotate, weight));
    } else {
      const x = (catAxis.end ? box.right + 8 : box.left - 10) + (catAxis.end ? catAxis.offset || 0 : -(catAxis.offset || 0));
      parts.push(turned(x, nameY, row.name, ink, 13, catAxis.end ? "start" : "end", catAxis.rotate, weight));
    }
    if (note && !vertical && !catRich) {
      parts.push(`<text data-ck-note="1" x="${n(box.left - 10)}" y="${n(center + 11)}" text-anchor="end" fill="${cssVar("muted", frame.preset.muted)}" font-size="11">${esc(note)}</text>`);
    }
    if (!vertical) {
      const value = endLabels[index];
      if (value !== undefined) {
        const endInk = labelColor === "accent" || named ? paint("accent", frame.preset, 0) : labelColor === "series" ? inkOf(key) : cssVar("text", frame.preset.text);
        const endWeight = labelColor === "accent" || named ? "600" : weight;
        const labelText = endTexts[index] ?? fmt(value, frame.locale, shown);
        const x = box.right + 12;
        const endMark = valueMode === "highlight" ? ` data-ck-end="highlight"` : "";
        parts.push(`<text${endMark} x="${n(x)}" y="${n(center + 4)}" text-anchor="start" fill="${endInk}" font-size="13" font-weight="${endWeight}">${esc(labelText)}</text>`);
        if (labelSuffix) parts.push(text(x + ch(labelText.length, 7.2) + 2, center + 4, labelSuffix, cssVar("muted", frame.preset.muted), 11, "400", "start"));
        const range = rangeTexts[index];
        if (range) parts.push(text(x + ch(labelText.length, 7.2) + suffixW + 8, center + 4, range, cssVar("muted", frame.preset.muted), 11, "400", "start"));
      }
    }
  });
  const catEdge = vertical ? (catAxis.end ? box.top : box.bottom) : catAxis.end ? box.right : box.left;
  const catInk = cssVar("axis", frame.preset.axis);
  parts.push(majorTicks(catAxis, vertical, catEdge, centers, vertical ? (catAxis.end ? -1 : 1) : catAxis.end ? 1 : -1, catInk));
  const catAxes = isRecord(spec.axes) ? spec.axes : undefined;
  const catGrid = explicitGrid(catAxes && isRecord(catAxes[catKey]) ? (catAxes[catKey] as { grid?: unknown }).grid : undefined);
  if (catGrid) {
    parts.push(vertical
      ? gridLines(false, box.top, box.bottom, centers, catGrid, cssVar("grid", frame.preset.grid))
      : gridLines(true, box.left, box.right, centers, catGrid, cssVar("grid", frame.preset.grid)));
  }
  if (catAxis.rule) {
    parts.push(vertical
      ? spine(box.left, catEdge, box.right, catEdge, catAxis.rule, catInk)
      : spine(catEdge, box.top, catEdge, box.bottom, catAxis.rule, catInk));
  }
  if (axisOn(spec, vertical ? "y" : "x")) {
    const key = vertical ? "y" : "x";
    const axis = readAxis(spec, key);
    const step = labelStep(valueTicks.length, axis.skip, 1);
    const tickInk = cssVar("muted", frame.preset.muted);
    const axisInk = cssVar("axis", frame.preset.axis);
    const rich = Boolean(axis.rotate || axis.offset || axis.end || axis.tick || axis.tickLen !== undefined);
    const shift = axis.offset || 0;
    const positions: number[] = [];
    for (let i = 0; i < valueTicks.length; i += step) {
      const value = valueTicks[i] ?? 0;
      const pos = at(value);
      const label = fmt(value, frame.locale, tickFmt);
      positions.push(pos);
      if (!rich) {
        if (vertical) parts.push(text(box.left - 8, pos + 4, label, tickInk, 11, "400", "end"));
        else parts.push(text(pos, box.bottom + 16, label, tickInk, 11, "400", "middle"));
        continue;
      }
      if (vertical) {
        const x = (axis.end ? box.right + 8 : box.left - 8) + (axis.end ? shift : -shift);
        parts.push(turned(x, pos + 4, label, tickInk, 11, axis.end ? "start" : "end", axis.rotate));
      } else {
        const y = (axis.end ? box.top - 8 : box.bottom + 16 + shift);
        parts.push(turned(pos, y, label, tickInk, 11, "middle", axis.rotate));
      }
    }
    const edge = vertical ? (axis.end ? box.right : box.left) : axis.end ? box.top : box.bottom;
    parts.push(minorTickMarks(axis.minor ?? 0, valueTicks, at, edge, !vertical, vertical ? (axis.end ? 3 : -3) : axis.end ? -3 : 3, axisInk));
    parts.push(majorTicks(axis, !vertical, edge, positions, vertical ? (axis.end ? 1 : -1) : axis.end ? -1 : 1, axisInk));
    const edgeText = edgeLabelOf(spec, key);
    if (edgeText && !rich) {
      if (vertical) parts.push(text(box.left - 8, box.top + 4, edgeText, tickInk, 11, "400", "end"));
      else parts.push(text(box.right, box.bottom + 16, edgeText, tickInk, 11, "400", "end"));
    }
    const axes = isRecord(spec.axes) ? spec.axes : undefined;
    const grid = explicitGrid(axes && isRecord(axes[key]) ? (axes[key] as { grid?: unknown }).grid : undefined);
    if (grid) {
      parts.push(vertical ? gridLines(true, box.left, box.right, valueTicks.map(at), grid, cssVar("grid", frame.preset.grid)) : gridLines(false, box.top, box.bottom, valueTicks.map(at), grid, cssVar("grid", frame.preset.grid)));
    }
    if (axis.rule) {
      parts.push(vertical
        ? spine(edge, box.top, edge, box.bottom, axis.rule, axisInk)
        : spine(box.left, edge, box.right, edge, axis.rule, axisInk));
    }
  }
  if (!vertical && axisOn(spec, "x")) parts.push(axisLine(frame, { left: box.left, top: box.top, right: box.right, bottom: box.bottom }, spec));
  const edgeInk = cssVar("muted", frame.preset.muted);
  const catEdgeText = edgeLabelOf(spec, vertical ? "x" : "y");
  if (catEdgeText) parts.push(text(vertical ? box.left : box.left - 10, box.bottom + 28, catEdgeText, edgeInk, 11, "400", vertical ? "start" : "end"));
  parts.push(placedAxisTitles(frame, spec, box));
  if (colorNames.length && frame.legend !== false) {
    const lastOf = new Map<string, number>();
    for (const row of rows) for (const dot of row.dots) if (dot.colorKey) lastOf.set(dot.colorKey, dot.value);
    const items = colorNames.map((name, index) => ({ name, color: fill(frame, index), value: legendShownValue(spec, lastOf.get(name)) }));
    let x = box.left;
    const y = 14;
    const fallback = colorNames
      .map((name, index) => {
        const labelText = legendLabel(name, legendShownValue(spec, lastOf.get(name)));
        const swatch = `<circle cx="${n(x + 4)}" cy="${n(y)}" r="4" fill="${fill(frame, index)}" />`;
        const label = text(x + 12, y + 4, labelText, cssVar("muted", frame.preset.muted), 11, "400", "start");
        x += 12 + ch(labelText.length, 7) + 16;
        return swatch + label;
      })
      .join("");
    parts.push(
      legendMarkup(spec, items, { plot: box, width: frame.width, height: frame.height, preset: frame.preset }, fallback),
    );
  }
  return view.done();
}

/** Explicit positive ends, or a nice log domain of the positive values. Null when log cannot be drawn. */
function logDomainOf(channel: unknown, values: number[]): [number, number] | null {
  if (isRecord(channel) && isRecord(channel.scale) && Array.isArray(channel.scale.domain)) {
    const domain = channel.scale.domain;
    const min = domain[0];
    const max = domain[1];
    if (typeof min === "number" && typeof max === "number" && min > 0 && max > min) return [min, max];
  }
  const positive = values.filter((value) => value > 0);
  if (!positive.length) return null;
  return logNice(Math.min(...positive), Math.max(...positive));
}

function rowNote(row: Group, mode: "none" | "field" | "range", prefix: string, locale: string, format: unknown): string {
  if (mode === "range" && row.dots.length > 1) return `${prefix}${rangeText(row, locale, format)}`;
  if (mode === "field") {
    const notes = row.dots.map((dot) => dot.note).filter((note) => note);
    const first = notes[0];
    if (first && notes.every((note) => note === first)) return `${prefix}${first}`;
  }
  return prefix;
}

function rangeText(row: Group, locale: string, format: unknown): string {
  const lo = Math.min(...row.dots.map((dot) => dot.value));
  const hi = Math.max(...row.dots.map((dot) => dot.value));
  return `${fmt(lo, locale, format)}–${fmt(hi, locale, format)}`;
}

function endValue(row: Group, mode: "summary" | "highlight", highlight: string, summary: "none" | "median" | "mean", drawSummary: boolean): number | undefined {
  if (mode === "highlight" && highlight && row.name !== highlight) {
    const dot = row.dots.find((item) => item.colorKey === highlight);
    if (dot) return dot.value;
  }
  if (drawSummary) return stat(row, summary);
  return row.dots[0]?.value;
}

function seriesInk(frame: { preset: PresetLines }, index: number): string {
  const lines = frame.preset.lines;
  if (lines && lines.length) {
    const color = lines[((index % lines.length) + lines.length) % lines.length];
    if (color) return color;
  }
  return fill(frame as Parameters<typeof fill>[0], index);
}

type PresetLines = { lines?: readonly string[]; accent: string; text: string; muted: string };

function summaryInk(
  highlighted: boolean,
  emphasis: string,
  labelColor: string,
  key: string,
  inkOf: (key: string) => string,
  frame: { preset: { text: string; accent: string } },
): string {
  if (highlighted && (emphasis === "color" || emphasis === "ring")) return paint("accent", frame.preset, 0);
  if (labelColor === "series" || emphasis === "color") return key ? inkOf(key) : cssVar("text", frame.preset.text);
  return cssVar("text", frame.preset.text);
}

function valueGridMode(spec: Record<string, unknown>, key: "x" | "y"): false | "solid" | "dashed" | "dotted" {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  const node = axes && isRecord(axes[key]) ? axes[key] : undefined;
  if (!node || !("grid" in node) || node.grid === undefined) return "dashed";
  if (node.grid === false) return false;
  if (node.grid === true || node.grid === "solid") return "solid";
  if (node.grid === "dotted" || node.grid === "dashed") return node.grid;
  return "dashed";
}

function edgeLabelOf(spec: Record<string, unknown>, key: "x" | "y"): string {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  const node = axes && isRecord(axes[key]) ? axes[key] : undefined;
  return node && typeof node.edgeLabel === "string" ? node.edgeLabel : "";
}

function pinLabel(value: number, locale: string, format: unknown): string {
  const text = fmt(value, locale, format);
  if (format === "duration-ms") return text.replace(/(ms|s|m|h)$/, " $1");
  return text;
}

function drawPins(
  parts: string[],
  pins: { row: Group; dot: Dot; index: number; side: "lo" | "hi" }[],
  vertical: boolean,
  box: { left: number; top: number; right: number; bottom: number },
  centerOf: (index: number) => number,
  dotColor: (row: Group, dot: Dot, index: number) => string,
  frame: { locale: string; preset: { text: string } },
  format: unknown,
): void {
  const buckets = new Map<string, typeof pins>();
  for (const pin of pins) {
    const key = `${pin.index}|${pin.side}`;
    const list = buckets.get(key);
    if (list) list.push(pin);
    else buckets.set(key, [pin]);
  }
  for (const list of buckets.values()) {
    list.forEach((pin, index) => {
      const center = centerOf(pin.index);
      const shift = (index - (list.length - 1) / 2) * 14;
      const color = dotColor(pin.row, pin.dot, pin.index);
      const label = pinLabel(pin.dot.value, frame.locale, format);
      const tipText = tip(pin.row.name, pin.dot, frame.locale, format);
      if (!vertical && pin.side === "hi") {
        const y = center + shift;
        const x = box.right;
        parts.push(`<polygon data-ck-mark="pin" points="${n(x - 9)},${n(y - 5)} ${n(x - 9)},${n(y + 5)} ${n(x)},${n(y)}" fill="${color}" />`);
        parts.push(`<text data-ck-mark="pin" x="${n(x - 12)}" y="${n(y + 3)}" text-anchor="end" fill="${color}" font-size="10">${esc(label)}<title>${esc(tipText)}</title></text>`);
      } else if (!vertical) {
        const y = center + shift;
        const x = box.left;
        parts.push(`<polygon data-ck-mark="pin" points="${n(x + 9)},${n(y - 5)} ${n(x + 9)},${n(y + 5)} ${n(x)},${n(y)}" fill="${color}" />`);
        parts.push(`<text data-ck-mark="pin" x="${n(x + 12)}" y="${n(y + 3)}" text-anchor="start" fill="${color}" font-size="10">${esc(label)}<title>${esc(tipText)}</title></text>`);
      } else {
        const x = center + shift;
        const y = pin.side === "hi" ? box.top : box.bottom;
        parts.push(`<text data-ck-mark="pin" x="${n(x)}" y="${n(pin.side === "hi" ? y + 12 : y - 4)}" text-anchor="middle" fill="${color}" font-size="10">${esc(label)}</text>`);
      }
    });
  }
}

function readColor(value: unknown): { field?: string; constant?: string } {
  if (typeof value === "string") return { field: value };
  if (!isRecord(value)) return {};
  if (typeof value.field === "string") return { field: value.field };
  if (typeof value.value === "string") return { constant: value.value };
  return {};
}

function readCompare(spec: Record<string, unknown>): Compare | null {
  if (!Array.isArray(spec.annotations)) return null;
  for (const item of spec.annotations) {
    if (!isRecord(item) || item.type !== "compare") continue;
    const from = endOf(item.from);
    const to = endOf(item.to);
    if (!from || !to || typeof item.label !== "string") continue;
    return { from: from.group, to: to.group, at: from.at, toAt: to.at, label: item.label };
  }
  return null;
}

function endOf(value: unknown): { group: string; at: Compare["at"] } | null {
  if (!isRecord(value) || typeof value.group !== "string") return null;
  const at = value.at === "min" || value.at === "max" || value.at === "mean" || value.at === "summary" ? value.at : null;
  if (!at) return null;
  return { group: value.group, at };
}

function valuesOf(row: Group): number[] {
  return row.dots.map((dot) => dot.value).sort((a, b) => a - b);
}

function stat(row: Group, kind: "median" | "mean"): number {
  const values = valuesOf(row);
  if (kind === "mean") return values.reduce((sum, value) => sum + value, 0) / values.length;
  return pct(values, 0.5);
}

function endStat(row: Group, at: Compare["at"], summary: "none" | "median" | "mean"): number {
  const values = valuesOf(row);
  if (at === "min") return values[0] ?? 0;
  if (at === "max") return values[values.length - 1] ?? 0;
  if (at === "mean") return stat(row, "mean");
  return stat(row, summary === "mean" ? "mean" : "median");
}

function bandEnds(row: Group, band: "range" | "iqr"): [number, number] {
  const values = valuesOf(row);
  if (band === "iqr") return [pct(values, 0.25), pct(values, 0.75)];
  return [values[0] ?? 0, values[values.length - 1] ?? 0];
}

function offsets(row: Group, at: (value: number) => number, radius: number, jitter: unknown): number[] {
  const out = row.dots.map(() => 0);
  if (jitter === "none") return out;
  if (typeof jitter === "number") {
    row.dots.forEach((dot, index) => {
      const unit = (parseInt(hash(dot.key), 36) % 1000) / 999;
      out[index] = (unit * 2 - 1) * jitter;
    });
    return out;
  }
  const diameter = Math.max(1, radius * 2);
  const order = row.dots.map((dot, index) => ({ index, x: at(dot.value) })).sort((a, b) => a.x - b.x || a.index - b.index);
  let cluster: { index: number; x: number }[] = [];
  const flush = () => {
    if (cluster.length > 1) {
      const mid = (cluster.length - 1) / 2;
      cluster.forEach((item, index) => {
        out[item.index] = (index - mid) * diameter;
      });
    }
    cluster = [];
  };
  for (const item of order) {
    const prev = cluster[cluster.length - 1];
    if (prev && item.x - prev.x > diameter) flush();
    cluster.push(item);
  }
  flush();
  return out;
}

function bandMark(vertical: boolean, center: number, a: number, b: number, fill: string, name: string, opacity: number): string {
  const start = Math.min(a, b);
  const size = Math.max(2, Math.abs(b - a));
  const thick = 14;
  const x = vertical ? center - thick / 2 : start;
  const y = vertical ? start : center - thick / 2;
  const width = vertical ? thick : size;
  const height = vertical ? size : thick;
  return `<rect data-ck-mark="band" data-ck-group="${escapeAttr(name)}" x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(height)}" rx="6" fill="${fill}" fill-opacity="${opacity}" />`;
}

function valueGrid(vertical: boolean, box: { left: number; top: number; right: number; bottom: number }, ticks: number[], at: (value: number) => number, grid: string, style: "solid" | "dashed" | "dotted"): string {
  const dash = style === "solid" ? "" : style === "dotted" ? ' stroke-dasharray="1 3"' : ' stroke-dasharray="2 4"';
  return ticks
    .map((value) => {
      const pos = at(value);
      if (vertical) return `<line data-ck-grid="1" x1="${n(box.left)}" y1="${n(pos)}" x2="${n(box.right)}" y2="${n(pos)}" stroke="${cssVar("grid", grid)}"${dash} />`;
      return `<line data-ck-grid="1" x1="${n(pos)}" y1="${n(box.top)}" x2="${n(pos)}" y2="${n(box.bottom)}" stroke="${cssVar("grid", grid)}"${dash} />`;
    })
    .join("");
}

function bracket(vertical: boolean, a: number, b: number, at: number, label: string, accent: string): string {
  const ink = cssVar("accent", accent);
  const caption = cssVar("text", "light-dark(#1d1d1f, #f5f5f7)");
  const start = Math.min(a, b);
  const end = Math.max(a, b);
  if (vertical) {
    return `<g data-ck-mark="compare" aria-label="${escapeAttr(label)}"><line x1="${n(at)}" y1="${n(start)}" x2="${n(at)}" y2="${n(end)}" stroke="${ink}" stroke-dasharray="3 3" /><line x1="${n(at)}" y1="${n(start)}" x2="${n(at + 8)}" y2="${n(start)}" stroke="${ink}" /><line x1="${n(at)}" y1="${n(end)}" x2="${n(at + 8)}" y2="${n(end)}" stroke="${ink}" />${text(at + 12, (start + end) / 2 + 4, label, caption, 11, "500", "start")}</g>`;
  }
  const y = at;
  return `<g data-ck-mark="compare" aria-label="${escapeAttr(label)}"><line x1="${n(start)}" y1="${n(y)}" x2="${n(start)}" y2="${n(y + 10)}" stroke="${ink}" /><line x1="${n(end)}" y1="${n(y)}" x2="${n(end)}" y2="${n(y + 10)}" stroke="${ink}" /><line x1="${n(start)}" y1="${n(y + 10)}" x2="${n(end)}" y2="${n(y + 10)}" stroke="${ink}" stroke-dasharray="3 3" />${text(end + 8, y + 14, label, caption, 11, "500", "start")}</g>`;
}

function tip(group: string, dot: Dot, locale: string, format: unknown): string {
  const value = fmt(dot.value, locale, format);
  return dot.label ? `${dot.label}, ${group}, ${value}` : `${group}, ${value}`;
}

function escapeAttr(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}
