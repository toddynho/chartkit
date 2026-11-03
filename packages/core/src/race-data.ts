/**
 * Tabular input for a line chart race.
 * Wide rows: one date column, one numeric column per series.
 * The v1 chart spec does not grow a `race` key (`additionalProperties` is false,
 * and `render()` would still be a single settled frame). This options object is the API.
 */

export interface LineRaceSeries {
  /** Column name. Defaults to `name`. */
  field?: string;
  name: string;
  color?: string;
  /** One or two letters, or a base64 `data:image/...` URL drawn at the tip label. */
  icon?: string;
}

export interface LineRaceOptions {
  title: string;
  subtitle?: string;
  /** Printed after each tip value, for example "episodes/mo". */
  unit?: string;
  /** Date column. Defaults to the first column. */
  x?: string;
  /**
   * `expand` keeps the y domain at the highest value revealed so far, so earlier
   * data stays squashed. `follow` sizes the domain to the values at the playhead.
   * Default `expand`.
   */
  scale?: "expand" | "follow";
  series?: LineRaceSeries[];
  data: Array<Record<string, string | number | null>>;
  width?: number;
  height?: number;
  /** Milliseconds from the first date to the last. Default 9000. */
  duration?: number;
  /** Hint for export. Default 30. */
  fps?: number;
  /** Whole digits shown on the tip. Default 0. */
  digits?: number;
  /** Draw across missing values. Default true. */
  connectNulls?: boolean;
  background?: string;
  fontFamily?: string;
}

const NAMED_COLORS: Record<string, string> = {
  openai: "#2D3A8C",
  google: "#C77A29",
  anthropic: "#3B824B",
  "hugging face": "#8A3E98",
  huggingface: "#8A3E98",
  xai: "#333333",
  mistral: "#C4A035",
  meta: "#4A90E2",
};

const PALETTE = [
  "#2D3A8C",
  "#C77A29",
  "#3B824B",
  "#8A3E98",
  "#333333",
  "#C4A035",
  "#4A90E2",
  "#0F766E",
  "#B4534A",
  "#5B6470",
  "#1D4E89",
  "#7C3AED",
];

export function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < source.length; i++) {
    const ch = source[i] ?? "";
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += ch;
      continue;
    }
    if (ch === '"') {
      quoted = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n") {
      row.push(cell);
      cell = "";
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    cell += ch;
  }
  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
}

function paintColor(name: string, index: number, used: Set<string>, explicit?: string): string {
  if (explicit && /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(explicit)) {
    used.add(explicit.toLowerCase());
    return explicit;
  }
  const named = NAMED_COLORS[name.trim().toLowerCase()];
  if (named && !used.has(named.toLowerCase())) {
    used.add(named.toLowerCase());
    return named;
  }
  for (let step = 0; step < PALETTE.length; step++) {
    const color = PALETTE[(index + step) % PALETTE.length] ?? PALETTE[0];
    if (!used.has(color.toLowerCase())) {
      used.add(color.toLowerCase());
      return color;
    }
  }
  return PALETTE[index % PALETTE.length] ?? "#2D3A8C";
}

function seriesFromHeaders(headers: string[], xField: string, override?: LineRaceSeries[]): LineRaceSeries[] {
  const used = new Set<string>();
  return headers
    .filter((header) => header !== xField && header.trim() !== "")
    .map((header, index) => {
      const match = override?.find((series) => (series.field ?? series.name) === header || series.name === header);
      const name = match?.name || header;
      return {
        name,
        field: header,
        color: paintColor(name, index, used, match?.color),
        icon: match?.icon,
      };
    });
}

function rowsFromMatrix(matrix: string[][]): { x: string; series: string[]; data: Array<Record<string, string | number | null>> } {
  const header = matrix[0]?.map((cell) => cell.trim()) ?? [];
  if (header.length < 2) throw new Error("The table needs a date column and at least one series.");
  const x = header[0] ?? "x";
  const fields = header.slice(1).filter((field) => field !== "");
  const data: Array<Record<string, string | number | null>> = [];
  for (let r = 1; r < matrix.length; r++) {
    const cells = matrix[r] ?? [];
    const row: Record<string, string | number | null> = {};
    const rawX = (cells[0] ?? "").trim();
    if (rawX === "") continue;
    row[x] = rawX;
    header.forEach((field, index) => {
      if (index === 0 || field === "") return;
      const raw = (cells[index] ?? "").trim();
      if (raw === "" || raw.toLowerCase() === "null" || raw.toLowerCase() === "na") {
        row[field] = null;
        return;
      }
      const value = Number(raw.replace(/,/g, ""));
      if (!Number.isFinite(value)) throw new Error(`"${raw}" in ${field} is not a number.`);
      row[field] = value;
    });
    data.push(row);
  }
  if (data.length < 2) throw new Error("A line race needs at least two rows.");
  return { x, series: fields, data };
}

function withOverride(base: LineRaceOptions, override?: Partial<LineRaceOptions>): LineRaceOptions {
  if (!override) return base;
  const series = seriesFromHeaders(
    [base.x ?? "x", ...(base.series ?? []).map((item) => item.field ?? item.name)],
    base.x ?? "x",
    override.series ?? base.series,
  );
  return {
    ...base,
    ...override,
    x: base.x,
    data: base.data,
    series,
    title: override.title ?? base.title,
  };
}

/** First column is the date. Remaining columns are series. */
export function lineRaceFromCsv(csv: string, override?: Partial<LineRaceOptions>): LineRaceOptions {
  const matrix = parseCsv(csv);
  const table = rowsFromMatrix(matrix);
  const base: LineRaceOptions = {
    title: override?.title || "Line chart race",
    x: table.x,
    data: table.data,
    series: seriesFromHeaders([table.x, ...table.series], table.x, override?.series),
  };
  return withOverride(base, override);
}

/** A JSON options object, or a bare array of wide rows. */
export function lineRaceFromJson(text: string, override?: Partial<LineRaceOptions>): LineRaceOptions {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That JSON did not parse.");
  }
  if (Array.isArray(parsed)) {
    if (parsed.length < 2 || !parsed.every((row) => row && typeof row === "object" && !Array.isArray(row))) {
      throw new Error("A row array needs at least two objects.");
    }
    const rows = parsed as Array<Record<string, string | number | null>>;
    const x = override?.x || Object.keys(rows[0] ?? {})[0];
    if (!x) throw new Error("The rows need a date field.");
    const fields = Object.keys(rows[0] ?? {}).filter((field) => field !== x);
    return withOverride(
      {
        title: override?.title || "Line chart race",
        x,
        data: rows,
        series: seriesFromHeaders([x, ...fields], x, override?.series),
      },
      override,
    );
  }
  if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as LineRaceOptions).data)) {
    throw new Error("JSON should be a race options object or an array of rows.");
  }
  const options = parsed as LineRaceOptions;
  const x = options.x || override?.x || Object.keys(options.data[0] ?? {})[0];
  if (!x) throw new Error("The rows need a date field.");
  const fields =
    options.series?.map((series) => series.field ?? series.name) ??
    Object.keys(options.data[0] ?? {}).filter((field) => field !== x);
  return withOverride(
    {
      ...options,
      title: options.title || override?.title || "Line chart race",
      x,
      series: seriesFromHeaders([x, ...fields], x, options.series ?? override?.series),
    },
    override,
  );
}
