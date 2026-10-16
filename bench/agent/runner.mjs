import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { CODE_LIBRARIES } from "./capabilities.mjs";
import { chartkitPrompt, checkChartKit, codePrompt, executeAnswer, extractJson, extractModule, libraryUse, scoreModule } from "./check.mjs";
import { askModel, selectProvider } from "./provider.mjs";
import { tasks as defaultTasks } from "./tasks.mjs";

export function formatFeedback(result) {
  const stages = result.stages ?? {};
  const lines = [];
  if (stages.validate && stages.validate.ok === false) {
    lines.push("Validator errors:");
    for (const error of stages.validate.errors ?? []) lines.push(`- ${error}`);
  }
  if (stages.render && stages.render.ok === false) lines.push(`Render error: ${stages.render.error ?? "render failed"}`);
  if (stages.parse && stages.parse.ok === false) lines.push(`Compile error: ${stages.parse.error}`);
  if (stages.library && stages.library.ok === false) lines.push(stages.library.reason ?? "The answer must import the chart library and return its markup.");
  if (stages.runner && stages.runner.ok === false) lines.push(`Runner error: ${stages.runner.error}`);
  return lines.join("\n");
}

/** One repair turn for validator, render, compile, or library-use failures. Wrong type or values are not retried. */
export function shouldRepair(result) {
  if (result.ok) return false;
  const stages = result.stages ?? {};
  if (stages.validate?.ok === false) return true;
  if (stages.render?.ok === false) return true;
  if (stages.parse?.ok === false) return true;
  if (stages.library?.ok === false) return true;
  if (stages.runner?.ok === false) return true;
  return false;
}

function repairPrompt(prompt, result) {
  const previous = (result.output ?? "").slice(0, 6000);
  return `${prompt}\n\nYour previous answer failed checks. Fix it. Output only the corrected artifact.\n${formatFeedback(result)}\n\nPrevious answer:\n${previous}`;
}

export async function runAgent({ env = process.env, tasks = defaultTasks, ask = askModel } = {}) {
  const selected = selectProvider(env);
  const libs = (env.BENCH_LIBRARIES ? env.BENCH_LIBRARIES.split(",").map((name) => name.trim()).filter(Boolean) : ["chartkit", ...CODE_LIBRARIES]);
  if (!selected.ok) {
    return {
      status: "not yet run",
      reason: selected.reason,
      taskCount: tasks.length,
      libraries: libs,
    };
  }
  const log = env.BENCH_AGENT_LOG;
  const done = new Map();
  if (log && existsSync(log)) {
    for (const line of readFileSync(log, "utf8").split("\n").filter(Boolean)) {
      const row = JSON.parse(line);
      done.set(`${row.id}|${row.library}`, row);
    }
  }
  const context = env.BENCH_CHARTKIT_CONTEXT ? readFileSync(env.BENCH_CHARTKIT_CONTEXT, "utf8") : "";
  const promptFor = (task, library) =>
    library === "chartkit"
      ? (context ? `ChartKit reference:\n${context}\n\n${chartkitPrompt(task)}` : chartkitPrompt(task))
      : codePrompt(task, library);

  let browserPromise;
  const getBrowser = () => {
    browserPromise ??= import("playwright").then(({ chromium }) => chromium.launch({ headless: true }));
    return browserPromise;
  };
  const results = [];
  try {
    for (const task of tasks) {
      if (libs.every((library) => done.has(`${task.id}|${library}`))) {
        results.push(...libs.map((library) => done.get(`${task.id}|${library}`)));
        continue;
      }
      const row = await Promise.all(libs.map((library) => scoreOne(selected, task, library, promptFor(task, library), ask, getBrowser)));
      results.push(...row);
      if (log) for (const item of row) appendFileSync(log, `${JSON.stringify(item)}\n`);
      if (env.BENCH_VERBOSE) console.log(task.id, row.map((item) => `${item.library}:${item.ok ? "ok" : "FAIL"}`).join(" "));
    }
  } finally {
    if (browserPromise) {
      const browser = await browserPromise.catch(() => null);
      await browser?.close();
    }
  }
  const passed = results.filter((row) => row.ok).length;
  const recovered = results.filter((row) => !row.ok && row.second?.ok).length;
  return {
    status: "ok",
    provider: selected.provider,
    model: selected.model,
    taskCount: tasks.length,
    attempts: results.length,
    passed,
    repair: {
      retried: results.filter((row) => row.second).length,
      recovered,
      passedWithinTwo: passed + recovered,
    },
    usage: results.reduce((sum, row) => addUsage(addUsage(sum, row.usage), row.second?.usage), { input_tokens: 0, output_tokens: 0 }),
    results,
  };
}

function addUsage(sum, usage) {
  return {
    input_tokens: sum.input_tokens + (usage?.input_tokens ?? 0),
    output_tokens: sum.output_tokens + (usage?.output_tokens ?? 0),
  };
}

async function scoreOne(selected, task, library, prompt, ask, getBrowser) {
  const first = await attempt(selected, task, library, prompt, ask, getBrowser);
  if (!shouldRepair(first)) return { id: task.id, library, ...first, second: null };
  const second = await attempt(selected, task, library, repairPrompt(prompt, first), ask, getBrowser);
  return { id: task.id, library, ...first, second };
}

async function attempt(selected, task, library, prompt, ask, getBrowser) {
  let text = "";
  let usage;
  try {
    const reply = await ask(selected, prompt);
    text = typeof reply === "string" ? reply : reply?.text ?? "";
    usage = typeof reply === "string" || !reply ? undefined : reply.usage;
  } catch (error) {
    return { ok: false, status: "error", stages: { runner: { ok: false, error: String(error?.message ?? error) } }, usage, output: text };
  }
  try {
    if (library === "chartkit") {
      const spec = extractJson(text);
      return { ...checkChartKit(spec, task), usage, output: text };
    }
    const source = extractModule(text);
    const use = libraryUse(source, library);
    const diagnostics = { importsLibrary: use.imports && use.uses, imports: use.imports, uses: use.uses };
    if (!/unsupported\s*:\s*true/.test(source) && (!use.imports || !use.uses)) {
      return {
        ok: false,
        status: "fail",
        stages: {
          library: {
            ok: false,
            imports: use.imports,
            uses: use.uses,
            reason: `Import ${library} and call it. A hand-written SVG does not pass.`,
          },
        },
        diagnostics,
        usage,
        output: text,
      };
    }
    const executed = await executeAnswer(source, library, getBrowser);
    return {
      ...scoreModule(executed.mod, task, library, {
        source,
        rendered: executed.rendered,
        facts: executed.facts,
        renderError: executed.renderError,
      }),
      diagnostics,
      usage,
      output: text,
    };
  } catch (error) {
    return {
      ok: false,
      status: "error",
      stages: { parse: { ok: false, error: error instanceof Error ? error.message : String(error) } },
      usage,
      output: text,
    };
  }
}
