/**
 * Teaching copy and curated specs for /docs/charts/donut.
 * Examples are existing donut specs. A spec with the hole closed is a pie
 * and is not listed here.
 */

export const donutPageTitle = "Donut";

export const donutPageDescription =
  "How to build a ChartKit donut: parts of a whole, when to use it, the data shape, a spec that renders, and the options that define the ring.";

/** Colours from the nursery showcase donut. The palette control writes this list to mark.palette. */
export const DONUT_PALETTE = ["#0f6e56", "#c45c26", "#1d4e89", "#5b4b8a"] as const;

export type DonutExample = {
  id: string;
  title: string;
  blurb: string;
  spec: Record<string, unknown>;
};

/** Smallest spec that validates and draws. Defaults supply the hole and the gap. */
export const smallestDonutSpec: Record<string, unknown> = {
  version: "1",
  type: "donut",
  data: [
    { label: "Search", value: 42 },
    { label: "Direct", value: 28 },
    { label: "Social", value: 18 },
    { label: "Email", value: 12 },
  ],
  encoding: { x: "label", y: "value" },
  a11y: { alt: "Search is the largest traffic source at 42 percent of sessions." },
};

/**
 * Gallery example `traffic-donut`, the docs eight-source series, and two showcase donuts.
 * `budget-pie` is omitted: it sets mark.innerRadius to 0.
 * Eight session sources uses the donut preview size so the pasted spec matches the picture.
 */
export const donutExamples: DonutExample[] = [
  {
    id: "sessions",
    title: "Sessions by source",
    blurb: "Four slices and a center total.",
    spec: {
      version: "1",
      id: "traffic-donut",
      type: "donut",
      data: [
        { source: "Search", sessions: 42 },
        { source: "Direct", sessions: 28 },
        { source: "Social", sessions: 18 },
        { source: "Email", sessions: 12 },
      ],
      encoding: { x: "source", y: "sessions" },
      mark: { innerRadius: 0.62 },
      legend: { position: "bottom" },
      size: { width: 420, height: 340 },
      a11y: { alt: "Search is the largest source at 42 of 100 sessions. Email is the smallest at 12." },
    },
  },
  {
    id: "sources",
    title: "Eight session sources",
    blurb: "Search is the largest of eight session sources. Other is the smallest slice.",
    spec: {
      version: "1",
      type: "donut",
      data: [
        { label: "Search", value: 1840 },
        { label: "Direct", value: 1260 },
        { label: "Social", value: 980 },
        { label: "Email", value: 740 },
        { label: "Referral", value: 610 },
        { label: "Affiliates", value: 420 },
        { label: "Partners", value: 280 },
        { label: "Other", value: 160 },
      ],
      encoding: { x: "label", y: "value" },
      mark: { innerRadius: 0.6 },
      legend: true,
      size: { width: 480, height: 420 },
      a11y: { alt: "Search is the largest of eight session sources. Other is the smallest slice." },
    },
  },
  {
    id: "yard",
    title: "What left the yard",
    blurb: "Fern is the largest share of trays that left the yard, then ivy, sage, and rue.",
    spec: {
      version: "1",
      id: "low-fern-mix",
      type: "donut",
      theme: "soft",
      data: [
        { kind: "Fern", trays: 86 },
        { kind: "Ivy", trays: 54 },
        { kind: "Sage", trays: 41 },
        { kind: "Rue", trays: 28 },
      ],
      encoding: { x: "kind", y: "trays" },
      mark: { palette: [...DONUT_PALETTE] },
      legend: { position: "bottom", values: true, interactive: true },
      interaction: { select: "point" },
      size: { width: 560, height: 360 },
      a11y: { alt: "Fern is the largest share of trays that left the yard, then ivy, sage, and rue." },
    },
  },
  {
    id: "fleet",
    title: "Fleet",
    blurb: "Slice labels and legend values.",
    spec: {
      version: "1",
      id: "bike-fleet",
      type: "donut",
      theme: "soft",
      data: [
        { kind: "Classic", trips: 1840 },
        { kind: "E-bike", trips: 1260 },
      ],
      encoding: { x: "kind", y: "trips" },
      mark: { labels: true },
      legend: { values: true, position: "bottom", interactive: true },
      tooltip: { position: "top", fields: [{ field: "trips", title: "Trips" }] },
      interaction: { select: "point" },
      size: { width: 420, height: 380 },
      a11y: { alt: "Classic bikes take 1,840 trips and e-bikes take 1,260." },
    },
  },
];

export type DonutAction =
  | { type: "innerRadius"; value: number }
  | { type: "padAngle"; value: number }
  | { type: "labels"; value: "off" | "inside" | "outside" }
  | { type: "legend"; value: "off" | "bottom" | "right" }
  | { type: "palette"; value: "theme" | "set" }
  | { type: "sort"; value: "none" | "asc" | "desc" }
  | { type: "startAngle"; value: number };

export type DonutControlState = {
  innerRadius: number;
  padAngle: number;
  labels: "off" | "inside" | "outside";
  legend: "off" | "bottom" | "right" | "other";
  palette: "theme" | "set" | "other";
  sort: "none" | "asc" | "desc";
  startAngle: number | "other";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function editMark(spec: Record<string, unknown>, edit: (mark: Record<string, unknown>) => void): void {
  const current = spec.mark;
  const mark: Record<string, unknown> = isRecord(current) ? { ...current } : {};
  edit(mark);
  if (Object.keys(mark).length) spec.mark = mark;
  else delete spec.mark;
}

export function applyDonutAction(spec: Record<string, unknown>, action: DonutAction): void {
  if (action.type === "innerRadius") {
    editMark(spec, (mark) => {
      mark.innerRadius = action.value;
    });
    return;
  }
  if (action.type === "padAngle") {
    editMark(spec, (mark) => {
      mark.padAngle = action.value;
    });
    return;
  }
  if (action.type === "labels") {
    editMark(spec, (mark) => {
      if (action.value === "off") {
        delete mark.labels;
        delete mark.labelPosition;
        return;
      }
      mark.labels = true;
      mark.labelPosition = action.value;
    });
    return;
  }
  if (action.type === "palette") {
    editMark(spec, (mark) => {
      if (action.value === "theme") delete mark.palette;
      else mark.palette = [...DONUT_PALETTE];
    });
    return;
  }
  if (action.type === "sort") {
    editMark(spec, (mark) => {
      mark.sort = action.value;
    });
    return;
  }
  if (action.type === "startAngle") {
    editMark(spec, (mark) => {
      mark.startAngle = action.value;
    });
    return;
  }
  if (action.value === "off") {
    spec.legend = false;
    return;
  }
  const current = spec.legend;
  const next: Record<string, unknown> = isRecord(current) ? { ...current } : {};
  delete next.show;
  next.position = action.value;
  spec.legend = next;
}

export function donutControlState(spec: Record<string, unknown>): DonutControlState {
  const mark = isRecord(spec.mark) ? spec.mark : {};
  const position = typeof mark.labelPosition === "string" ? mark.labelPosition : "";
  let labels: DonutControlState["labels"] = "off";
  if (position === "inside" || position === "center") labels = "inside";
  else if (position !== "" || mark.labels === true || mark.labelFormat !== undefined) labels = "outside";

  const legend = spec.legend;
  let legendMode: DonutControlState["legend"] = "bottom";
  if (legend === false) legendMode = "off";
  else if (isRecord(legend)) {
    if (legend.show === false) legendMode = "off";
    else if (legend.position === "right") legendMode = "right";
    else if (legend.position === "bottom" || legend.position === undefined) legendMode = "bottom";
    else legendMode = "other";
  }

  const palette = mark.palette;
  let paletteMode: DonutControlState["palette"] = "theme";
  if (Array.isArray(palette)) {
    const same = palette.length === DONUT_PALETTE.length && palette.every((color, index) => color === DONUT_PALETTE[index]);
    paletteMode = same ? "set" : "other";
  }

  const sort = mark.sort === "asc" || mark.sort === "desc" ? mark.sort : "none";
  const start = typeof mark.startAngle === "number" ? mark.startAngle : 0;
  const startAngle: DonutControlState["startAngle"] = start === 0 || start === 90 || start === 180 || start === -90 ? start : "other";

  return {
    innerRadius: typeof mark.innerRadius === "number" ? mark.innerRadius : 0.6,
    padAngle: typeof mark.padAngle === "number" ? mark.padAngle : 2,
    labels,
    legend: legendMode,
    palette: paletteMode,
    sort,
    startAngle,
  };
}

export function formatDonutNumber(value: number): string {
  return String(Math.round(value * 100) / 100);
}

export function roundDonut(value: number, step: number): number {
  if (!Number.isFinite(value) || !(step > 0)) return value;
  const decimals = (step.toString().split(".")[1] ?? "").length;
  return Number((Math.round(value / step) * step).toFixed(decimals));
}

export function specText(spec: Record<string, unknown>): string {
  return JSON.stringify(spec, null, 2);
}

export function playgroundHref(spec: unknown): string {
  return `/playground#${encodeURIComponent(JSON.stringify(spec))}`;
}

function holeOf(spec: Record<string, unknown>): number | undefined {
  const mark = spec.mark;
  if (!isRecord(mark)) return undefined;
  return typeof mark.innerRadius === "number" ? mark.innerRadius : undefined;
}

for (const example of donutExamples) {
  if (example.spec.type !== "donut") throw new Error(`${example.id} is not a donut`);
  const hole = holeOf(example.spec);
  if (hole !== undefined && hole <= 0) throw new Error(`${example.id} closes the hole. A closed hole is a pie.`);
  if (example.blurb.toLowerCase().includes("hole closed")) throw new Error(`${example.id} describes a closed hole`);
}
