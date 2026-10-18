import type { Frame } from "../../frame";
import { cssVar } from "../../theme";
import { n } from "../../svg";
import { cells, channel, rowAt, splitList, tableOf, textAt } from "./fields";
import { fill, fit, openMark, text, viewOf } from "./plot";

export interface JourneyStep {
  index: number;
  section: string;
  step: string;
  score: number | null;
  actors: string[];
  fields: { section: string; score: string };
}

export function readJourney(spec: Record<string, unknown>): JourneyStep[] | null {
  const read = tableOf(spec);
  if (!read) return null;
  const { table, encoding } = read;
  const fields = table.fields;
  const stepField = channel(encoding, "x", "step", fields);
  const scoreField = channel(encoding, "y", "score", fields) ?? "score";
  const sectionField = channel(encoding, "series", "section", fields) ?? "section";
  const actorField = channel(encoding, "color", "actors", fields);
  if (!stepField && !fields.includes("step")) return null;
  const steps = cells(table, stepField ?? "step");
  const scores = cells(table, scoreField);
  const sections = cells(table, sectionField);
  const actors = cells(table, actorField ?? (fields.includes("actors") ? "actors" : undefined));
  const rows: JourneyStep[] = [];
  for (let index = 0; index < table.length; index++) {
    rows.push({
      index,
      section: textAt(sections[index]),
      step: textAt(steps[index]) || `Step ${index + 1}`,
      score: typeof scores[index] === "number" && Number.isFinite(scores[index]) ? (scores[index] as number) : null,
      actors: splitList(actors[index]),
      fields: { section: sectionField, score: scoreField },
    });
  }
  return rows.length ? rows : null;
}

/** A user journey: sections, a 1–5 face on a score scale, and actor chips. */
export function renderJourney(spec: Record<string, unknown>): string | null {
  const steps = readJourney(spec);
  if (!steps) return null;
  const actors = actorOrder(steps);
  let body = 36;
  let last = "";
  for (const step of steps) {
    if (step.section !== last) {
      body += 22;
      last = step.section;
    }
    body += 48;
  }
  const natural = (spec.title ? 48 : 20) + 28 + body;
  const view = viewOf(spec, "journey", 760, natural);
  if (!view) return null;
  const { frame, parts } = view;
  const colors = new Map(actors.map((actor, index) => [actor, fill(frame, index)]));
  let x = frame.width - 20;
  const chipY = frame.title ? 40 : 16;
  for (const actor of [...actors].reverse()) {
    const width = chipWidth(actor);
    x -= width + 8;
    parts.push(chip(x, chipY, width, actor, colors.get(actor) ?? fill(frame, 0), frame));
  }
  const scaleLeft = 236;
  const scaleRight = Math.max(scaleLeft + 120, Math.min(500, x - 16));
  const bands: string[] = [];
  const marks: string[] = [];
  let y = chipY + 36;
  last = "";
  let bandTop = y;
  const flushBand = (bottom: number) => {
    if (bottom > bandTop) {
      bands.push(`<rect x="16" y="${n(bandTop)}" width="${n(frame.width - 32)}" height="${n(bottom - bandTop)}" rx="10" fill="${cssVar("track", frame.preset.track)}" fill-opacity="0.28" />`);
    }
  };
  for (const step of steps) {
    if (step.section !== last) {
      if (last) flushBand(y);
      y += 8;
      bandTop = y;
      if (step.section) marks.push(text(28, y + 16, fit(step.section, 190, 12), cssVar("muted", frame.preset.muted), 12, "650"));
      y += 22;
      last = step.section;
    }
    const score = step.score == null ? null : Math.round(step.score);
    const label = `${step.step}: ${score ?? "no score"} of 5${step.actors.length ? `. ${step.actors.join(", ")}` : ""}`;
    marks.push(text(28, y + 28, fit(step.step, 190, 13), cssVar("text", frame.preset.text), 13, "600"));
    drawScale(marks, frame, scaleLeft, scaleRight, y + 22, score, label);
    let chipX = scaleRight + 16;
    for (const actor of step.actors) {
      const width = chipWidth(actor);
      if (chipX + width > frame.width - 12) break;
      marks.push(chip(chipX, y + 12, width, actor, colors.get(actor) ?? fill(frame, 0), frame));
      chipX += width + 6;
    }
    y += 48;
  }
  flushBand(y);
  parts.push(...bands, ...marks);
  return view.done();
}

function drawScale(parts: string[], frame: Frame, left: number, right: number, cy: number, score: number | null, label: string): void {
  const span = right - left;
  parts.push(`<line x1="${n(left)}" y1="${n(cy)}" x2="${n(right)}" y2="${n(cy)}" stroke="${cssVar("axis", frame.preset.axis)}" />`);
  for (let mark = 1; mark <= 5; mark++) {
    const x = left + ((mark - 1) / 4) * span;
    if (score === mark) {
      parts.push(face(x, cy, 12, mark, scorePaint(frame, mark), label));
    } else {
      parts.push(`<circle cx="${n(x)}" cy="${n(cy)}" r="3.5" fill="${cssVar("track", frame.preset.track)}" />`);
    }
    parts.push(text(x, cy + 22, String(mark), cssVar("muted", frame.preset.muted), 10, "500", "middle"));
  }
}

function face(cx: number, cy: number, radius: number, score: number, color: string, label: string): string {
  const eye = radius * 0.09;
  const eyeY = cy - radius * 0.16;
  const eyeX = radius * 0.32;
  const smile = (score - 3) / 2;
  const mouthY = cy + radius * 0.22;
  const bend = smile * radius * 0.72;
  const mouth = `M ${n(cx - radius * 0.38)} ${n(mouthY)} Q ${n(cx)} ${n(mouthY + bend)} ${n(cx + radius * 0.38)} ${n(mouthY)}`;
  return (
    openMark("g", "face", label, "") +
    `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(radius)}" fill="${color}" />` +
    `<circle cx="${n(cx - eyeX)}" cy="${n(eyeY)}" r="${n(eye)}" fill="#fff" />` +
    `<circle cx="${n(cx + eyeX)}" cy="${n(eyeY)}" r="${n(eye)}" fill="#fff" />` +
    `<path d="${mouth}" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" />` +
    "</g>"
  );
}

function chipWidth(actor: string): number {
  return Math.ceil(actor.length * 6.8 + 28);
}

function chip(x: number, y: number, width: number, actor: string, color: string, frame: Frame): string {
  return (
    openMark("g", "actor", actor, "") +
    `<rect x="${n(x)}" y="${n(y)}" width="${n(width)}" height="18" rx="9" fill="${color}" fill-opacity="0.16" stroke="${color}" />` +
    `<circle cx="${n(x + 10)}" cy="${n(y + 9)}" r="3" fill="${color}" />` +
    text(x + 18, y + 13, actor, cssVar("text", frame.preset.text), 11, "500") +
    "</g>"
  );
}

function scorePaint(frame: Frame, score: number): string {
  if (score <= 2) return cssVar("negative", frame.preset.negative);
  if (score === 3) return cssVar("muted", frame.preset.muted);
  return cssVar("positive", frame.preset.positive);
}

function actorOrder(steps: JourneyStep[]): string[] {
  const names: string[] = [];
  for (const step of steps) {
    for (const actor of step.actors) if (!names.includes(actor)) names.push(actor);
  }
  return names;
}

export function journeyRow(spec: Record<string, unknown>, index: number): Record<string, unknown> | undefined {
  return rowAt(spec, index);
}
