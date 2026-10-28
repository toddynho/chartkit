// Agent token matrix. One results folder per provider/model. Does not call a model unless that provider's key is set.
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { loadRegistry, listModels, runMatrix } from "./agent/matrix.mjs";

const benchRoot = dirname(fileURLToPath(import.meta.url));
process.env.BENCH_ROOT ??= benchRoot;
const registryFile = process.env.BENCH_LLM_MATRIX || join(benchRoot, "agent/models.json");
const registry = loadRegistry(registryFile);
const docs = process.env.BENCH_DOCS || registry.publishedDocs || "official";
process.env.BENCH_DOCS = docs;
const models = listModels(registry, process.env);
if (models.length === 0) {
  console.error(`No registry models matched BENCH_LLM_PROVIDER=${process.env.BENCH_LLM_PROVIDER ?? ""} BENCH_LLM_MODEL=${process.env.BENCH_LLM_MODEL ?? ""} (${registryFile}).`);
  process.exit(1);
}

const outfile = join(benchRoot, `.out/agent-suite-${process.pid}.mjs`);
mkdirSync(dirname(outfile), { recursive: true });
await build({
  entryPoints: [join(benchRoot, "agent/suite.mjs")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile,
  external: ["esbuild", "playwright"],
  logLevel: "silent",
});
const suite = await import(pathToFileURL(outfile).href);
const tasks = process.env.BENCH_SUITE === "supp" ? suite.suppTasks : suite.tasks;
const outDir = process.env.BENCH_MATRIX_OUT || join(benchRoot, "results/agent/matrix");
const matrix = await runMatrix({
  registry,
  env: process.env,
  outDir,
  docs,
  tasks,
  runOne: (options) => suite.runAgent(options),
});
for (const run of matrix.runs) {
  const agent = run.agent ?? {};
  const tail = agent.status === "ok" ? `${agent.passed}/${agent.attempts}` : agent.reason ?? agent.status;
  console.log(`${run.entry.provider}/${run.entry.model}: ${tail}`);
}
console.log(`wrote ${matrix.summaryFile}`);
const failed = matrix.runs.some((run) => run.agent?.status === "error");
process.exit(failed ? 1 : 0);
