/**
 * With-docs agent token eval.
 *
 * One module feeds the homepage "For the agent" bars and the /agents scoreboard.
 * Harness tip: PR #79, commit 12232d7e (agent token matrix).
 *
 * 42 tasks. Each library's docs are capped to the length of ChartKit llms.txt.
 * Output tokens are summed until a chart is drawn. Did-not-finish runs are
 * excluded from the median. ChartKit median model calls are 1; repair() does
 * not add a model call.
 *
 * Homepage freeze: each bar is the median of that library across the finished
 * models (Claude, GPT-6, and Grok). The ~N× headline rounds the next library's
 * median divided by ChartKit's. Bar widths are value / max, not a chart-type mock.
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
      group: "Claude",
      tokens: { ChartKit: 133, Plot: 711, "Chart.js": 1193, Recharts: 1285, ECharts: 882 },
    },
    {
      name: "Sonnet 5.5",
      group: "Claude",
      tokens: { ChartKit: 124, Plot: 333, "Chart.js": 887, Recharts: 1499, ECharts: 544 },
    },
    {
      name: "Opus 5.5",
      group: "Claude",
      tokens: { ChartKit: 127, Plot: 356, "Chart.js": 901, Recharts: 1713, ECharts: 469 },
    },
    {
      name: "Fable 5.1",
      group: "Claude",
      tokens: { ChartKit: 115, Plot: 300, "Chart.js": 656, Recharts: 1468, ECharts: 379 },
    },
    {
      name: "GPT-6 Luna",
      group: "GPT-6",
      tokens: { ChartKit: 94, Plot: 464, "Chart.js": 820, Recharts: 874, ECharts: 675 },
    },
    {
      name: "GPT-6.1 Terra",
      group: "GPT-6",
      tokens: { ChartKit: 82.5, Plot: 332, "Chart.js": 808, Recharts: 1594, ECharts: 488 },
    },
    {
      name: "GPT-6.1 Sol",
      group: "GPT-6",
      tokens: { ChartKit: 86.5, Plot: 244, "Chart.js": 491, Recharts: 1273, ECharts: 492 },
    },
    {
      name: "GPT-6 Astra",
      group: "GPT-6",
      tokens: { ChartKit: 88, Plot: 266, "Chart.js": 492, Recharts: 1358, ECharts: 536 },
    },
    {
      name: "Grok 4.7",
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

export const TOKEN_EVAL = {
  tasks: 42,
  harnessPr: 79,
  harnessSha: "12232d7e",
  /** ChartKit median model calls on a working chart. */
  chartkitCalls: 1,
  models,
};

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
    noteLead: `Median of ${models.length} finished models (${listNames(models.map(modelLabel))}). ${pendingSentence}~${Math.round(times)}× rounds ${next.name}'s median divided by ChartKit's (${formatTokens(next.tokens)} / ${formatTokens(chartkit.tokens)}, ${times.toFixed(1)}×). By model, ChartKit uses ${formatRatio(Math.min(...ratios))}–${formatRatio(Math.max(...ratios))}× fewer output tokens than the next library. ${TOKEN_EVAL.tasks} tasks; docs capped to the length of ChartKit llms.txt; tokens summed until a chart is drawn; did-not-finish runs excluded from the median. ChartKit median model calls are ${TOKEN_EVAL.chartkitCalls.toFixed(1)}.`,
    stats: [
      {
        value: `${formatTokens(Math.min(...chartkitValues))}–${formatTokens(Math.max(...chartkitValues))}`,
        suffix: "",
        body: "ChartKit median output tokens per working chart, by model",
        ink: true,
        range: true,
      },
      {
        value: `~${Math.round(times)}`,
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
