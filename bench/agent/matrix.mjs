import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { COST_FORMULA, scoreAgent } from "./score.mjs";

export const PROVIDERS = ["openai", "anthropic", "xai"];

export const PROVIDER_KEY = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  xai: "XAI_API_KEY",
};

export function loadRegistry(file) {
  const registry = JSON.parse(readFileSync(file, "utf8"));
  if (!Array.isArray(registry.models) || registry.models.length === 0) {
    throw new Error(`registry models[] is empty (${file})`);
  }
  for (const entry of registry.models) {
    if (!PROVIDERS.includes(entry.provider)) throw new Error(`Unknown provider "${entry.provider}" in ${file}`);
    if (!entry.model || typeof entry.model !== "string") throw new Error(`Registry entry missing model in ${file}`);
  }
  return registry;
}

/** BENCH_LLM_PROVIDER and BENCH_LLM_MODEL narrow a re-run to one registry row. */
export function listModels(registry, env = process.env) {
  let models = registry.models;
  if (env.BENCH_LLM_PROVIDER) models = models.filter((entry) => entry.provider === env.BENCH_LLM_PROVIDER);
  if (env.BENCH_LLM_MODEL) models = models.filter((entry) => entry.model === env.BENCH_LLM_MODEL);
  return models;
}

export function modelDir(outDir, entry) {
  return join(outDir, entry.provider, entry.model);
}

export function modelResultFile(outDir, entry, docs) {
  return join(modelDir(outDir, entry), `${docs}.json`);
}

/**
 * Run each registry row. Missing keys are recorded and skipped.
 * `runOne({ env, tasks })` is the existing agent runner. The key stays on `env`
 * and is not written to the result files.
 */
export async function runMatrix({ registry, env = process.env, outDir, docs, runOne, tasks } = {}) {
  if (typeof runOne !== "function") throw new Error("runMatrix requires runOne");
  if (!outDir) throw new Error("runMatrix requires outDir");
  const condition = docs || env.BENCH_DOCS || registry.publishedDocs || "official";
  const models = listModels(registry, env);
  const runs = [];
  for (const entry of models) {
    const keyName = PROVIDER_KEY[entry.provider];
    const selectedEnv = {
      ...env,
      BENCH_LLM_PROVIDER: entry.provider,
      BENCH_LLM_MODEL: entry.model,
      BENCH_DOCS: condition,
    };
    const file = modelResultFile(outDir, entry, condition);
    if (!selectedEnv[keyName]) {
      const agent = {
        status: "not yet run",
        reason: `BENCH_LLM_PROVIDER=${entry.provider} but ${keyName} is not set`,
        provider: entry.provider,
        model: entry.model,
        docs: condition,
      };
      writeResult(file, { entry, docs: condition, agent, scoreboard: null });
      runs.push({ entry, docs: condition, file, agent, scoreboard: null });
      continue;
    }
    try {
      const agent = await runOne({ env: selectedEnv, tasks });
      const scoreboard = agent?.status === "ok" ? scoreAgent(agent.results, { price: entry }) : null;
      writeResult(file, { entry: publicEntry(entry), docs: condition, agent, scoreboard });
      runs.push({ entry, docs: condition, file, agent, scoreboard });
    } catch (error) {
      const agent = {
        status: "error",
        reason: redact(String(error?.message ?? error), selectedEnv[keyName]),
        provider: entry.provider,
        model: entry.model,
        docs: condition,
      };
      writeResult(file, { entry: publicEntry(entry), docs: condition, agent, scoreboard: null });
      runs.push({ entry, docs: condition, file, agent, scoreboard: null });
    }
  }
  const summary = {
    docs: condition,
    priceSource: registry.priceSource ?? null,
    costFormula: COST_FORMULA,
    rules: {
      workingChart: "Supported task whose drawn output passed the checker, or ChartKit repair() of that output.",
      repair: "ChartKit repair() does not increment model calls and does not add tokens. A repair pass on the first answer skips the model retry.",
      dnf: "Tasks that did not pass are listed and omitted from medians. The median is not infinity.",
      unsupported: "meta.unsupported counts as a pass only when the library cannot draw that type. Those rows are declined, not working charts.",
      docs: "The published condition is official (with docs), capped at ChartKit llms.txt. none is optional.",
    },
    models: runs.map((run) => ({
      provider: run.entry.provider,
      model: run.entry.model,
      status: run.agent?.status ?? "error",
      file: run.file,
      scoreboard: run.scoreboard,
    })),
  };
  const summaryFile = join(outDir, `summary-${condition}.json`);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(summaryFile, `${JSON.stringify(summary, null, 2)}\n`);
  return { docs: condition, summaryFile, runs, summary };
}

function publicEntry(entry) {
  return {
    provider: entry.provider,
    model: entry.model,
    inputPerMillion: entry.inputPerMillion ?? null,
    outputPerMillion: entry.outputPerMillion ?? null,
  };
}

function writeResult(file, payload) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);
}

function redact(text, secret) {
  if (!secret) return text;
  return text.split(secret).join("[redacted]");
}
