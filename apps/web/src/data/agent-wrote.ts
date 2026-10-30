import { readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "../lib/repo-root";

type Usage = { output_tokens?: number };
type Attempt = { usage?: Usage; output?: string };
type Row = {
  id: string;
  library: string;
  ok?: boolean;
  usage?: Usage;
  output?: string;
  second?: Attempt | null;
};

export type WrotePanel = {
  tokens: number;
  lines: number;
  calls: number;
  retries: number;
  code: string;
  firstTry: boolean;
};

export type AgentWrote = {
  task: string;
  model: string;
  measured: string;
  chartkit: WrotePanel;
  recharts: WrotePanel;
  lineDelta: number;
};

function stripFence(output: string): string {
  const match = output.match(/^```[a-zA-Z]*\n([\s\S]*?)\n```\s*$/);
  if (!match?.[1]) throw new Error("agent transcript is missing a fenced answer");
  return match[1];
}

function panel(row: Row): WrotePanel {
  if (!row.output) throw new Error(`agent transcript ${row.id}/${row.library} has no output`);
  const retry = row.second ?? null;
  const calls = retry ? 2 : 1;
  const retries = retry ? 1 : 0;
  const tokens = (row.usage?.output_tokens ?? 0) + (retry?.usage?.output_tokens ?? 0);
  if (!Number.isFinite(tokens) || tokens <= 0) throw new Error(`agent transcript ${row.id}/${row.library} has no output tokens`);
  const shown = row.ok ? row.output : retry?.output;
  if (!shown) throw new Error(`agent transcript ${row.id}/${row.library} did not draw`);
  const code = stripFence(shown);
  return {
    tokens,
    lines: code.split("\n").length,
    calls,
    retries,
    code,
    firstTry: row.ok === true && retry == null,
  };
}

/**
 * Closest published transcript pair. The nine-model matrix (PR #79) does not
 * store raw answers. Round 6 official-docs does, one model, second always null.
 */
export function agentWrote(): AgentWrote {
  const root = repoRoot();
  const summary = JSON.parse(readFileSync(join(root, "bench/results/agent/round-6/official.json"), "utf8")) as {
    started?: string;
    agent?: { model?: string };
  };
  const lines = readFileSync(join(root, "bench/results/agent/round-6/official.jsonl"), "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as Row);
  const task = "bar-region";
  const chartkit = lines.find((row) => row.id === task && row.library === "chartkit");
  const recharts = lines.find((row) => row.id === task && row.library === "recharts");
  if (!chartkit || !recharts) throw new Error(`round 6 is missing ${task}`);
  const left = panel(chartkit);
  const right = panel(recharts);
  const measured = typeof summary.started === "string" ? summary.started.slice(0, 10) : "";
  const model = summary.agent?.model;
  if (!model || !measured) throw new Error("round 6 summary is missing the model or date");
  return {
    task,
    model,
    measured,
    chartkit: left,
    recharts: right,
    lineDelta: right.lines - left.lines,
  };
}
