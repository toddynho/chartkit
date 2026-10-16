import { CODE_LIBRARIES } from "./capabilities.mjs";
import { chartkitPrompt, checkChartKit, codePrompt, extractJson, extractModule, importModule, scoreModule } from "./check.mjs";
import { askModel, selectProvider } from "./provider.mjs";
import { tasks as defaultTasks } from "./tasks.mjs";

export async function runAgent({ env = process.env, tasks = defaultTasks, ask = askModel } = {}) {
  const selected = selectProvider(env);
  if (!selected.ok) {
    return {
      status: "not yet run",
      reason: selected.reason,
      taskCount: tasks.length,
      libraries: ["chartkit", ...CODE_LIBRARIES],
    };
  }
  const results = [];
  for (const task of tasks) {
    results.push(await scoreOne(selected, task, "chartkit", chartkitPrompt(task), ask));
    for (const library of CODE_LIBRARIES) {
      results.push(await scoreOne(selected, task, library, codePrompt(task, library), ask));
    }
  }
  const ok = results.filter((row) => row.ok).length;
  return {
    status: "ok",
    provider: selected.provider,
    model: selected.model,
    taskCount: tasks.length,
    attempts: results.length,
    passed: ok,
    results,
  };
}

async function scoreOne(selected, task, library, prompt, ask) {
  try {
    const text = await ask(selected, prompt);
    if (library === "chartkit") {
      const spec = extractJson(text);
      return { id: task.id, library, ...checkChartKit(spec, task) };
    }
    const source = extractModule(text);
    const mod = await importModule(source);
    return { id: task.id, library, ...scoreModule(mod, task, library) };
  } catch (error) {
    return {
      id: task.id,
      library,
      ok: false,
      status: "error",
      stages: { runner: { ok: false, error: error instanceof Error ? error.message : String(error) } },
    };
  }
}
