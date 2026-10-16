// Agent eval only. Writes BENCH_AGENT_OUT (default results/agent.json). Does not call a model unless a key is set.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const benchRoot = dirname(fileURLToPath(import.meta.url));
process.env.BENCH_ROOT ??= benchRoot;
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
const started = new Date().toISOString();
const agent = await suite.runAgent({ tasks: suite.tasks });
const out = process.env.BENCH_AGENT_OUT || join(benchRoot, "results/agent.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({
  started,
  finished: new Date().toISOString(),
  env: {
    BENCH_LIBRARIES: process.env.BENCH_LIBRARIES ?? null,
    BENCH_CHARTKIT_CONTEXT: process.env.BENCH_CHARTKIT_CONTEXT ?? null,
  },
  agent,
}, null, 2));
console.log(`wrote ${out}: ${agent.passed}/${agent.attempts}`);
