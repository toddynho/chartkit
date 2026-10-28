import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { listModels, loadRegistry, runMatrix } from "./matrix.mjs";

const registryFile = new URL("./models.json", import.meta.url);

test("the checked-in registry lists the publishable model matrix", () => {
  const registry = loadRegistry(registryFile);
  assert.equal(registry.publishedDocs, "official");
  assert.match(registry.priceSource, /not vendor quotes/i);
  const ids = registry.models.map((entry) => `${entry.provider}/${entry.model}`);
  assert.deepEqual(ids, [
    "anthropic/claude-haiku-5-5",
    "anthropic/claude-sonnet-5-5",
    "anthropic/claude-opus-5-5",
    "anthropic/claude-fable-5-1",
    "openai/gpt-6-luna",
    "openai/gpt-6.1-terra",
    "openai/gpt-6.1-sol",
    "openai/gpt-6-astra",
    "xai/grok-4.7",
  ]);
  assert.deepEqual(listModels(registry, { BENCH_LLM_PROVIDER: "xai", BENCH_LLM_MODEL: "grok-4.7" }).map((entry) => entry.model), ["grok-4.7"]);
});

test("a matrix run writes one folder per model and skips missing keys", async () => {
  const registry = loadRegistry(registryFile);
  const outDir = mkdtempSync(join(tmpdir(), "chartkit-matrix-"));
  const key = "super-secret-xai-key";
  let calls = 0;
  const matrix = await runMatrix({
    registry,
    env: { XAI_API_KEY: key, BENCH_LLM_MODEL: "grok-4.7" },
    outDir,
    docs: "official",
    runOne: async ({ env }) => {
      calls += 1;
      assert.equal(env.BENCH_LLM_PROVIDER, "xai");
      assert.equal(env.BENCH_LLM_MODEL, "grok-4.7");
      assert.equal(env.BENCH_DOCS, "official");
      return {
        status: "ok",
        provider: "xai",
        model: "grok-4.7",
        docs: "official",
        passed: 1,
        attempts: 1,
        results: [
          {
            id: "line-revenue",
            library: "plot",
            ok: true,
            status: "checked",
            usage: { input_tokens: 20, output_tokens: 8 },
            second: null,
          },
        ],
      };
    },
  });
  assert.equal(calls, 1);
  assert.equal(matrix.runs.length, 1);
  const written = readFileSync(matrix.runs[0].file, "utf8");
  assert.equal(written.includes(key), false);
  const parsed = JSON.parse(written);
  assert.equal(parsed.scoreboard[0].library, "plot");
  assert.equal(parsed.scoreboard[0].outputTokens.median, 8);
  assert.equal(parsed.scoreboard[0].costPer100, (100 * (20 * 2 + 8 * 10)) / 1e6);
  const summary = readFileSync(matrix.summaryFile, "utf8");
  assert.equal(summary.includes(key), false);
  assert.match(summary, /grok-4.7/);

  const skipped = await runMatrix({
    registry,
    env: {},
    outDir,
    docs: "official",
    runOne: async () => {
      throw new Error("should not call a model");
    },
  });
  assert.equal(skipped.runs.length, registry.models.length);
  assert.equal(skipped.runs.every((run) => run.agent.status === "not yet run"), true);
  const skippedFile = readFileSync(skipped.runs.find((run) => run.entry.provider === "openai").file, "utf8");
  assert.match(skippedFile, /OPENAI_API_KEY/);
});
