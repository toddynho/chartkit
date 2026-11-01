/**
 * With-docs agent token eval.
 *
 * One module feeds the homepage bars, the /agents scoreboard, and
 * /methodology/agent-eval. A fresh run should update the cells, `run`, and
 * the coverage notes here. The pages read those fields. Do not retype the
 * numbers into the templates.
 *
 * Harness tip: PR #79, commit 12232d7e (agent token matrix). A re-run writes
 * `bench/results/agent/matrix/summary-official.json` (median output tokens and
 * median calls on working charts). These published figures are that run.
 * The runner does not write a ChartKit version or a clock time into that file,
 * and the raw matrix is not in the repo. `run.chartkitVersion` is the
 * packages/core version on the commits that published these cells
 * (62dabd80 the same evening, e15a8764 for Grok). `run.versionRecorded` stays
 * false until a result file actually stamps a version.
 *
 * 42 tasks. Each library's docs are capped to the length of ChartKit llms.txt.
 * Output tokens are summed until a chart is drawn. Did-not-finish runs are
 * excluded from the median. ChartKit median model calls are 1; repair() does
 * not add a model call.
 *
 * Homepage freeze: each bar is the median of that library across the finished
 * models (Claude, GPT-6, and Grok). The ~N× headline is the next library's
 * median divided by ChartKit's, to one decimal. Bar widths are value / max.
 *
 * No cost/100 figure. The harness list prices are stubs, not vendor quotes.
 */
export const TOKEN_LIBRARIES = ["ChartKit", "Plot", "Chart.js", "Recharts", "ECharts"] as const;
export type TokenLibrary = (typeof TOKEN_LIBRARIES)[number];

export type TokenCoverage = {
  text: string;
  /** Library cell this sentence footnotes. The median stays on the row. */
  mark?: TokenLibrary;
};

export type TokenModel = {
  name: string;
  /** Registry id in bench/agent/models.json. */
  id: string;
  provider: "Anthropic" | "OpenAI" | "xAI";
  /** Family label used when the model name does not already include it. */
  group: "Claude" | "GPT-6" | "Grok";
  /** null until the model finishes the harness. */
  tokens: Record<TokenLibrary, number> | null;
  /** Coverage for this row. Medians are not rewritten to look cleaner. */
  coverage?: TokenCoverage[];
};

const models: TokenModel[] = [
    {
      name: "Haiku 5.5",
      id: "claude-haiku-5-5",
      provider: "Anthropic",
      group: "Claude",
      tokens: { ChartKit: 133, Plot: 711, "Chart.js": 1193, Recharts: 1285, ECharts: 882 },
    },
    {
      name: "Sonnet 5.5",
      id: "claude-sonnet-5-5",
      provider: "Anthropic",
      group: "Claude",
      tokens: { ChartKit: 124, Plot: 333, "Chart.js": 887, Recharts: 1499, ECharts: 544 },
    },
    {
      name: "Opus 5.5",
      id: "claude-opus-5-5",
      provider: "Anthropic",
      group: "Claude",
      tokens: { ChartKit: 127, Plot: 356, "Chart.js": 901, Recharts: 1713, ECharts: 469 },
    },
    {
      name: "Fable 5.1",
      id: "claude-fable-5-1",
      provider: "Anthropic",
      group: "Claude",
      tokens: { ChartKit: 115, Plot: 300, "Chart.js": 656, Recharts: 1468, ECharts: 379 },
    },
    {
      name: "GPT-6 Luna",
      id: "gpt-6-luna",
      provider: "OpenAI",
      group: "GPT-6",
      tokens: { ChartKit: 94, Plot: 464, "Chart.js": 820, Recharts: 874, ECharts: 675 },
    },
    {
      name: "GPT-6.1 Terra",
      id: "gpt-6.1-terra",
      provider: "OpenAI",
      group: "GPT-6",
      tokens: { ChartKit: 82.5, Plot: 332, "Chart.js": 808, Recharts: 1594, ECharts: 488 },
    },
    {
      name: "GPT-6.1 Sol",
      id: "gpt-6.1-sol",
      provider: "OpenAI",
      group: "GPT-6",
      tokens: { ChartKit: 86.5, Plot: 244, "Chart.js": 491, Recharts: 1273, ECharts: 492 },
    },
    {
      name: "GPT-6 Astra",
      id: "gpt-6-astra",
      provider: "OpenAI",
      group: "GPT-6",
      tokens: { ChartKit: 88, Plot: 266, "Chart.js": 492, Recharts: 1358, ECharts: 536 },
    },
    {
      name: "Grok 4.7",
      id: "grok-4.7",
      provider: "xAI",
      group: "Grok",
      tokens: { ChartKit: 78.5, Plot: 166, "Chart.js": 444.5, Recharts: 365, ECharts: 284 },
      coverage: [
        { text: "ChartKit 42/42 working, first try 100%." },
        { text: "Plot 26 working (15 declined, 1 DNF spike-alerts)." },
        { text: "ECharts 36 working (5 declined, 1 DNF ring-tasks)." },
        { text: "Chart.js 24 working (18 declined)." },
        {
          mark: "Recharts",
          text: "Recharts is 5 working and 19 DNF. That median is unreliable. Most failures were browser render.",
        },
      ],
    },
];

/**
 * Types the checker treats as impossible, so the honest answer is to decline.
 * Three tasks per type. Mirrors the null entries in bench/agent/capabilities.mjs.
 * ChartKit is asked for every type.
 */
export const TOKEN_CANNOT_DRAW: { library: TokenLibrary; types: readonly string[] }[] = [
  { library: "Plot", types: ["donut", "gauge", "kpi", "progress-ring", "candlestick"] },
  { library: "Chart.js", types: ["heatmap", "gauge", "kpi", "progress-ring", "spike", "candlestick"] },
  { library: "Recharts", types: ["heatmap", "gauge", "kpi", "progress-ring", "spike", "candlestick"] },
  { library: "ECharts", types: ["kpi", "progress-ring"] },
];

/** Capped docs that the with-docs prompt prepends. Bytes are the capped length, not the raw file. */
export const TOKEN_DOCS: { library: TokenLibrary; bytes: number; summary: string }[] = [
  {
    library: "ChartKit",
    bytes: 6376,
    summary: "The full llms.txt. That length is the cap. The other libraries are cut to it.",
  },
  {
    library: "Plot",
    bytes: 6374,
    summary:
      "Observable Plot getting started, from the Plot 0.6.17 docs, retrieved 27 October 2026. Plot does not publish an llms.txt.",
  },
  {
    library: "Chart.js",
    bytes: 6327,
    summary: "The Chart.js installation page plus the start of the usage guide. Chart.js does not publish an llms.txt.",
  },
  {
    library: "Recharts",
    bytes: 6329,
    summary:
      "Recharts getting started plus the start of quickstart. Recharts publishes an llms.txt that is an index of links, not a spec. The index blurb at the top of each page was removed.",
  },
  {
    library: "ECharts",
    bytes: 6077,
    summary:
      "The Apache ECharts Get Started page plus Import ECharts. ECharts publishes an llms.txt index, and the handbook link on it is Get Started.",
  },
];

/** The 14 types in bench/agent/tasks.mjs. Three tasks each. */
export const TOKEN_CHART_TYPES = [
  "line",
  "bar",
  "donut",
  "stacked-area",
  "scatter",
  "combo",
  "heatmap",
  "gauge",
  "kpi",
  "sparkline",
  "mini-area",
  "progress-ring",
  "spike",
  "candlestick",
] as const;

export const TOKEN_EVAL = {
  tasks: 42,
  chartTypes: TOKEN_CHART_TYPES.length,
  harnessPr: 79,
  harnessSha: "12232d7e",
  /** ChartKit median model calls on a working chart. */
  chartkitCalls: 1,
  /**
   * Facts about the published run. Update these when the cells are replaced.
   * versionRecorded stays false until the result file itself stamps a version.
   */
  run: {
    chartkitVersion: "0.5.0",
    versionRecorded: false,
    publishedOn: "2026-10-27",
    temperature: 0,
    maxOutputTokens: 4096,
    docCapBytes: 6376,
    repeats: 1,
    condition: "with-docs" as const,
    /** False until the raw per-model result files are published with the site. */
    resultsPublished: false,
    /** How the cells landed on the published day. Replace this on a re-run. */
    publishNote: "Eight of the models were published that day, and Grok 4.7 was added later the same day.",
    /** Pins in bench/package.json on the day the figures were published. The result file does not record them. */
    rivalVersions: [
      { name: "Observable Plot", version: "0.6.17" },
      { name: "Chart.js", version: "4.5.1" },
      { name: "Recharts", version: "3.10.1" },
      { name: "ECharts", version: "6.1.0" },
    ],
    /**
     * Clear this when a re-run uses the llms.txt that the site serves now.
     * The page prints docCapBytes beside it.
     */
    docDrift:
      "One line of llms.txt, the maps install note, has changed since these figures were published. The file is still the same length. None of these tasks is a map.",
  },
  models,
};

export function formatEvalDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`token eval date is not YYYY-MM-DD: ${iso}`);
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

export function tasksPerChartType(): number {
  if (TOKEN_CHART_TYPES.length !== TOKEN_EVAL.chartTypes) {
    throw new Error("token eval chart type list does not match chartTypes");
  }
  const n = TOKEN_EVAL.tasks / TOKEN_EVAL.chartTypes;
  if (!Number.isInteger(n)) throw new Error("token eval task count does not divide into chart types");
  const chartkitDoc = TOKEN_DOCS.find((row) => row.library === "ChartKit");
  if (!chartkitDoc || chartkitDoc.bytes !== TOKEN_EVAL.run.docCapBytes) {
    throw new Error("ChartKit doc length has to be the cap");
  }
  for (const row of TOKEN_DOCS) {
    if (row.bytes > TOKEN_EVAL.run.docCapBytes) throw new Error(`${row.library} docs are longer than the cap`);
  }
  return n;
}

type FinishedModel = TokenModel & { tokens: Record<TokenLibrary, number> };

function finishedModels(): FinishedModel[] {
  return TOKEN_EVAL.models.filter((model): model is FinishedModel => model.tokens != null);
}

export function median(values: number[]): number {
  if (values.length === 0) throw new Error("token eval median of an empty set");
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const lower = sorted[mid - 1];
  const upper = sorted[mid];
  if (upper == null || (sorted.length % 2 === 0 && lower == null)) {
    throw new Error("token eval median is missing a middle value");
  }
  return sorted.length % 2 === 1 ? upper : (lower + upper) / 2;
}

export function formatTokens(n: number): string {
  return Number.isInteger(n)
    ? n.toLocaleString("en-US")
    : n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function nextLibrary(tokens: Record<TokenLibrary, number>): { name: TokenLibrary; tokens: number } {
  let name: TokenLibrary = "Plot";
  let best = Number.POSITIVE_INFINITY;
  for (const library of TOKEN_LIBRARIES) {
    if (library === "ChartKit") continue;
    const value = tokens[library];
    if (value < best) {
      best = value;
      name = library;
    }
  }
  return { name, tokens: best };
}

function formatRatio(n: number): string {
  return n.toFixed(1);
}

function modelLabel(model: TokenModel): string {
  return model.group === "Claude" ? `Claude ${model.name}` : model.name;
}

function listNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export type TokenStat = {
  value: string;
  suffix: string;
  body: string;
  /** Third card names repair() in the sentence. */
  repair?: boolean;
  ink?: boolean;
  range?: boolean;
};

export type TokenBar = {
  name: string;
  tokens: string;
  width: string;
  first: boolean;
};

export function tokenSection(): {
  tasks: number;
  barLabel: string;
  noteLead: string;
  stats: TokenStat[];
  bars: TokenBar[];
} {
  const models = finishedModels();
  if (models.length === 0) throw new Error("token eval has no finished models");
  const byLibrary = TOKEN_LIBRARIES.map((name) => ({
    name,
    tokens: median(models.map((model) => model.tokens[name])),
  }));
  const chartkit = byLibrary[0];
  const next = byLibrary.slice(1).reduce((best, row) => (row.tokens < best.tokens ? row : best));
  if (!chartkit || chartkit.tokens <= 0) throw new Error("token eval is missing ChartKit");
  const chartkitValues = models.map((model) => model.tokens.ChartKit);
  const ratios = models.map((model) => nextLibrary(model.tokens).tokens / model.tokens.ChartKit);
  const times = next.tokens / chartkit.tokens;
  const max = Math.max(...byLibrary.map((row) => row.tokens));
  const pending = TOKEN_EVAL.models.filter((model) => model.tokens == null).map((model) => model.name);
  const pendingSentence =
    pending.length === 0
      ? ""
      : `${pending.join(", ")} ${pending.length === 1 ? "is" : "are"} pending and excluded. `;
  const groups = [...new Set(models.map((model) => model.group))];

  return {
    tasks: TOKEN_EVAL.tasks,
    barLabel: `median · ${groups.join(", ")} · ${models.length} models`,
    noteLead: `Median of ${models.length} finished models (${listNames(models.map(modelLabel))}). ${pendingSentence}~${times.toFixed(1)}× is ${next.name}'s median divided by ChartKit's (${formatTokens(next.tokens)} / ${formatTokens(chartkit.tokens)}). By model, ChartKit uses ${formatRatio(Math.min(...ratios))}–${formatRatio(Math.max(...ratios))}× fewer output tokens than the next library. ${TOKEN_EVAL.tasks} tasks; docs capped to the length of ChartKit llms.txt; tokens summed until a chart is drawn; did-not-finish runs excluded from the median. ChartKit median model calls are ${TOKEN_EVAL.chartkitCalls.toFixed(1)}.`,
    stats: [
      {
        value: `${formatTokens(Math.min(...chartkitValues))}–${formatTokens(Math.max(...chartkitValues))}`,
        suffix: "",
        body: "ChartKit median output tokens per working chart, by model",
        ink: true,
        range: true,
      },
      {
        value: `~${times.toFixed(1)}`,
        suffix: "×",
        body: `fewer output tokens than the next library across the ${models.length} finished models (${formatRatio(Math.min(...ratios))}–${formatRatio(Math.max(...ratios))}×)`,
      },
      {
        value: TOKEN_EVAL.chartkitCalls.toFixed(1),
        suffix: " calls",
        body: "",
        repair: true,
      },
    ],
    bars: byLibrary.map((row, index) => ({
      name: row.name,
      tokens: formatTokens(row.tokens),
      width: `${((row.tokens / max) * 100).toFixed(2)}%`,
      first: index === 0,
    })),
  };
}

export type ScoreCell = { text: string; us: boolean; mark?: string };
export type ScoreNote = { mark?: string; library?: TokenLibrary; text: string };

function footnoteNotes(coverage: TokenCoverage[] | undefined): ScoreNote[] {
  let n = 0;
  return (coverage ?? []).map((note) => {
    if (!note.mark) return { text: note.text };
    n += 1;
    return { text: note.text, library: note.mark, mark: String(n) };
  });
}
export type ScoreRow = {
  name: string;
  pending: boolean;
  cells: ScoreCell[];
  versus: string;
  notes: ScoreNote[];
};

export function tokenScoreboard(): {
  libraries: readonly TokenLibrary[];
  rows: ScoreRow[];
  tasks: number;
  pr: number;
  sha: string;
  calls: string;
} {
  return {
    libraries: TOKEN_LIBRARIES,
    tasks: TOKEN_EVAL.tasks,
    pr: TOKEN_EVAL.harnessPr,
    sha: TOKEN_EVAL.harnessSha,
    calls: TOKEN_EVAL.chartkitCalls.toFixed(1),
    rows: TOKEN_EVAL.models.map((model) => {
      const notes = footnoteNotes(model.coverage);
      const markFor = new Map(notes.filter((note) => note.library).map((note) => [note.library, note.mark]));
      if (!model.tokens) {
        return {
          name: model.name,
          pending: true,
          cells: TOKEN_LIBRARIES.map((library) => ({ text: "pending", us: library === "ChartKit" })),
          versus: "—",
          notes,
        };
      }
      const tokens = model.tokens;
      const next = nextLibrary(tokens);
      return {
        name: model.name,
        pending: false,
        cells: TOKEN_LIBRARIES.map((library) => ({
          text: formatTokens(tokens[library]),
          us: library === "ChartKit",
          mark: markFor.get(library),
        })),
        versus: `${formatRatio(next.tokens / tokens.ChartKit)}×`,
        notes,
      };
    }),
  };
}

/** Grouped bars for /methodology/agent-eval. Every bar is a published cell. */
export function tokenScoreboardSpec(): Record<string, unknown> {
  const rows = finishedModels();
  if (rows.length === 0) throw new Error("token eval has no finished models");
  for (const model of rows) {
    for (const library of TOKEN_LIBRARIES) {
      if (library !== "ChartKit" && model.tokens.ChartKit >= model.tokens[library]) {
        throw new Error(`token scoreboard alt assumes ChartKit is lowest, and it is not on ${model.name} / ${library}`);
      }
    }
  }
  const low = Math.min(...rows.map((model) => model.tokens.ChartKit));
  const high = Math.max(...rows.map((model) => model.tokens.ChartKit));
  return {
    version: "1",
    type: "bar",
    data: rows.flatMap((model) =>
      TOKEN_LIBRARIES.map((library) => ({
        model: modelLabel(model),
        library,
        tokens: model.tokens[library],
      })),
    ),
    encoding: {
      x: "model",
      y: { field: "tokens", type: "quantitative", title: "Median output tokens" },
      series: "library",
    },
    mark: { orientation: "horizontal", gap: 0.28 },
    axes: { x: { autoSkip: false } },
    legend: { position: "bottom" },
    locale: "en-US",
    a11y: {
      alt: `Median output tokens per working chart. Each group is one model. ChartKit is the lowest bar in every group, from ${formatTokens(low)} to ${formatTokens(high)}.`,
    },
  };
}

const TOKEN_SCALE = 2000;

export type TokenDot = { left: string; title: string };

export type TokenSpreadRow = {
  name: string;
  medianText: string;
  range: string;
  minPct: string;
  spanPct: string;
  medPct: string;
  dots: TokenDot[];
  us: boolean;
};

export type TokenSpread = {
  tasks: number;
  modelCount: number;
  libraryCount: number;
  modelWord: string;
  libraryWord: string;
  headline: string;
  ratioLead: string;
  rows: TokenSpreadRow[];
  annotation: { left: string; width: string; labelLeft: string; text: string } | null;
  rangeStat: string;
  rangeBody: string;
  calls: string;
  cheapest: string;
  cheapestTotal: string;
  note: string;
};

function countWord(n: number): string {
  const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
  return words[n] ?? String(n);
}

function pct(value: number): string {
  return `${((value / TOKEN_SCALE) * 100).toFixed(2)}%`;
}

/** Per-model medians for the homepage spread. Every dot is a published cell. */
export function tokenSpread(): TokenSpread {
  const models = finishedModels();
  if (models.length === 0) throw new Error("token eval has no finished models");
  const rows = TOKEN_LIBRARIES.map((name) => {
    const values = models.map((model) => model.tokens[name]);
    return {
      name,
      values,
      median: median(values),
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }).sort((a, b) => a.median - b.median);
  const chartkit = rows.find((row) => row.name === "ChartKit");
  const next = rows.find((row) => row.name !== "ChartKit");
  if (!chartkit || !next || chartkit.median <= 0) throw new Error("token spread is missing ChartKit");
  const ratios = models.map((model) => nextLibrary(model.tokens).tokens / model.tokens.ChartKit);
  const times = next.median / chartkit.median;
  const chartkitValues = chartkit.values;
  let floor = Number.POSITIVE_INFINITY;
  let floorWho = "";
  for (const model of models) {
    for (const library of TOKEN_LIBRARIES) {
      if (library === "ChartKit") continue;
      const value = model.tokens[library];
      if (value < floor) {
        floor = value;
        floorWho = `${library} on ${modelLabel(model)}`;
      }
    }
  }
  const cheapest = models.filter((model) =>
    TOKEN_LIBRARIES.every((library) => library === "ChartKit" || model.tokens.ChartKit < model.tokens[library]),
  ).length;
  const maxValue = Math.max(...rows.map((row) => row.max));
  if (maxValue > TOKEN_SCALE) throw new Error(`token spread exceeds the ${TOKEN_SCALE} axis`);
  const coverage = models.flatMap((model) =>
    (model.coverage ?? []).map((note) => `${modelLabel(model)}: ${note.text}`),
  );
  const headline = times.toFixed(1);
  const ratioLead = `${formatRatio(Math.min(...ratios))}–${formatRatio(Math.max(...ratios))}×`;
  const showBracket = rows[0]?.name === "ChartKit";
  return {
    tasks: TOKEN_EVAL.tasks,
    modelCount: models.length,
    libraryCount: TOKEN_LIBRARIES.length,
    modelWord: countWord(models.length),
    libraryWord: countWord(TOKEN_LIBRARIES.length),
    headline,
    ratioLead,
    rows: rows.map((row) => ({
      name: row.name,
      medianText: formatTokens(row.median),
      range: `${formatTokens(row.min)}–${formatTokens(row.max)}`,
      minPct: pct(row.min),
      spanPct: pct(row.max - row.min),
      medPct: pct(row.median),
      us: row.name === "ChartKit",
      dots: row.values.map((value, index) => ({
        left: pct(value),
        title: `${modelLabel(models[index]!)} · ${row.name} · ${formatTokens(value)}`,
      })),
    })),
    annotation: showBracket
      ? {
          left: pct(chartkit.median),
          width: pct(next.median - chartkit.median),
          labelLeft: pct(next.median + 30),
          text: `← ${headline}× fewer than ${next.name}, next best`,
        }
      : null,
    rangeStat: `${formatTokens(Math.min(...chartkitValues))}–${formatTokens(Math.max(...chartkitValues))}`,
    rangeBody: `ChartKit median tokens, best model to worst. The next lowest median is ${formatTokens(floor)} (${floorWho}).`,
    calls: TOKEN_EVAL.chartkitCalls.toFixed(1),
    cheapest: String(cheapest),
    cheapestTotal: String(models.length),
    note: `Medians over ${TOKEN_EVAL.tasks} tasks on ${models.length} finished models (${listNames(models.map(modelLabel))}). ${headline}× is ${next.name}'s median divided by ChartKit's (${formatTokens(next.median)} / ${formatTokens(chartkit.median)}). By model, ChartKit uses ${formatRatio(Math.min(...ratios))}–${formatRatio(Math.max(...ratios))}× fewer output tokens than the next library. Docs capped to the length of ChartKit llms.txt; output tokens summed until a chart is drawn; did-not-finish runs excluded from the median. ChartKit median model calls are ${TOKEN_EVAL.chartkitCalls.toFixed(1)}.${coverage.length ? ` ${coverage.join(" ")}` : ""}`,
  };
}
