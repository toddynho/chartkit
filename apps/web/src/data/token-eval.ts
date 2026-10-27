/**
 * PLACEHOLDER token-eval figures.
 *
 * These numbers are invented. Replace this module with the scoreboard from
 * `bench/results/agent/matrix/summary-official.json` (median output tokens and
 * median calls on working charts), set `illustrative` to false, and the homepage
 * drops the "Illustrative numbers…" caption. Bar widths are value / max, not measurements.
 * The comparison rows are a labeled track (name, width, tokens · calls), not a
 * chart-type mock — carousel and showcase charts stay real ChartKit renders.
 */
export type TokenRow = {
  name: string;
  tokens: number;
  calls: number;
};

export const TOKEN_EVAL = {
  illustrative: true,
  prompts: 42,
  /** List-price placeholders, USD per 100 charts. Not derived from token counts. */
  costPerHundred: 0.04,
  codeCostPerHundred: 0.31,
  rows: [
    { name: "ChartKit", tokens: 186, calls: 1 },
    { name: "Observable Plot", tokens: 1190, calls: 1.4 },
    { name: "Chart.js", tokens: 1420, calls: 1.6 },
    { name: "Recharts", tokens: 1860, calls: 1.7 },
    { name: "ECharts", tokens: 2310, calls: 2.1 },
  ] satisfies TokenRow[],
};

export type TokenStat = {
  value: string;
  suffix: string;
  body: string;
  /** Third card names repair() in the sentence. */
  repair?: boolean;
  ink?: boolean;
};

export type TokenBar = {
  name: string;
  tokens: string;
  calls: string;
  width: string;
  first: boolean;
};

function usd(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function tokenSection(): {
  illustrative: boolean;
  prompts: number;
  stats: TokenStat[];
  bars: TokenBar[];
} {
  const rows = TOKEN_EVAL.rows;
  const chartkit = rows[0];
  const next = rows[1];
  if (!chartkit || !next || chartkit.tokens <= 0) {
    throw new Error("token-eval placeholder is missing ChartKit and the next library");
  }
  const max = Math.max(...rows.map((row) => row.tokens));
  const fewer = (next.tokens / chartkit.tokens).toFixed(1);
  return {
    illustrative: TOKEN_EVAL.illustrative,
    prompts: TOKEN_EVAL.prompts,
    stats: [
      {
        value: chartkit.tokens.toLocaleString("en-US"),
        suffix: " tok",
        body: "output tokens to produce a working bar chart",
        ink: true,
      },
      {
        value: fewer,
        suffix: "×",
        body: `fewer output tokens than the next library, median of ${TOKEN_EVAL.prompts} prompts`,
      },
      {
        value: chartkit.calls.toFixed(1),
        suffix: " calls",
        body: "model calls per working chart",
        repair: true,
      },
      {
        value: usd(TOKEN_EVAL.costPerHundred),
        suffix: " /100",
        body: `cost per 100 charts at list price, vs ${usd(TOKEN_EVAL.codeCostPerHundred)} writing chart code`,
      },
    ],
    bars: rows.map((row, index) => ({
      name: row.name,
      tokens: row.tokens.toLocaleString("en-US"),
      calls: row.calls.toFixed(1),
      width: `${((row.tokens / max) * 100).toFixed(2)}%`,
      first: index === 0,
    })),
  };
}
