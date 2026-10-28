/**
 * Tokens and model calls until a working chart.
 *
 * A working chart is a supported task the checker accepted, including ChartKit
 * repair() of that answer. repair() does not add a model call and has no token
 * usage of its own. Honest meta.unsupported answers are passes for the rates
 * and are declined, not working charts. DNF rows stay out of the medians.
 */

export const SCORE_LIBRARIES = ["chartkit", "plot", "chartjs", "recharts", "echarts"];

export const COST_FORMULA = "costPer100 = 100 * (medianInputTokens * inputPerMillion + medianOutputTokens * outputPerMillion) / 1e6";

export function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function mean(values) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function finite(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function drawn(result) {
  return result?.ok === true && result?.status !== "unsupported";
}

function declined(result) {
  return result?.ok === true && result?.status === "unsupported";
}

/**
 * @param row one library attempt (`second` is the model retry, or null)
 * @param repairCheck optional (attempt) => boolean when the row has no `repaired` flag
 */
export function outcomeForRow(row, repairCheck) {
  const firstOut = finite(row?.usage?.output_tokens);
  const firstIn = finite(row?.usage?.input_tokens);
  const hasSecond = row?.second != null && typeof row.second === "object";
  const secondOut = hasSecond ? finite(row.second.usage?.output_tokens) : 0;
  const secondIn = hasSecond ? finite(row.second.usage?.input_tokens) : 0;
  const repairOk = (attempt) => attempt?.repaired === true || (typeof repairCheck === "function" && repairCheck(attempt) === true);

  if (drawn(row)) return pack("pass", "first", 1, firstOut, firstIn, false);
  if (declined(row)) return pack("pass", "unsupported", 1, firstOut, firstIn, true);
  if (!hasSecond && repairOk(row)) return pack("pass", "repair", 1, firstOut, firstIn, false);
  if (drawn(row?.second)) return pack("pass", "second", 2, firstOut + secondOut, firstIn + secondIn, false);
  if (declined(row?.second)) return pack("pass", "unsupported", 2, firstOut + secondOut, firstIn + secondIn, true);
  if (hasSecond && repairOk(row.second)) return pack("pass", "repair", 2, firstOut + secondOut, firstIn + secondIn, false);
  if (repairOk(row)) return pack("pass", "repair", 1, firstOut, firstIn, false);
  return pack("dnf", "dnf", hasSecond ? 2 : 1, firstOut + (hasSecond ? secondOut : 0), firstIn + (hasSecond ? secondIn : 0), false);
}

function pack(outcome, via, calls, outputTokens, inputTokens, isDeclined) {
  return { outcome, via, calls, outputTokens, inputTokens, declined: isDeclined };
}

export function costPer100(medianInput, medianOutput, price) {
  if (!price || medianInput == null || medianOutput == null) return null;
  const input = Number(price.inputPerMillion);
  const output = Number(price.outputPerMillion);
  if (!Number.isFinite(input) || !Number.isFinite(output)) return null;
  return (100 * (medianInput * input + medianOutput * output)) / 1e6;
}

export function scoreLibrary(rows, { repairCheck, price } = {}) {
  const outcomes = (rows ?? []).map((row) => ({ row, ...outcomeForRow(row, repairCheck) }));
  const n = outcomes.length;
  const firstTry = outcomes.filter((item) => item.row?.ok === true).length;
  const withinTwo = outcomes.filter((item) => item.row?.ok === true || item.row?.second?.ok === true).length;
  const working = outcomes.filter((item) => item.outcome === "pass" && !item.declined);
  const declinedCount = outcomes.filter((item) => item.declined).length;
  const dnf = outcomes.filter((item) => item.outcome === "dnf");
  const outputTokens = working.map((item) => item.outputTokens);
  const calls = working.map((item) => item.calls);
  const inputTokens = working.map((item) => item.inputTokens);
  const medianOutput = median(outputTokens);
  const medianInput = median(inputTokens);
  return {
    tasks: n,
    firstTry: { passed: firstTry, rate: n ? firstTry / n : null },
    withinTwo: { passed: withinTwo, rate: n ? withinTwo / n : null },
    workingCharts: working.length,
    declined: declinedCount,
    dnf: { count: dnf.length, ids: dnf.map((item) => item.row?.id).filter(Boolean) },
    outputTokens: { median: medianOutput, mean: mean(outputTokens), n: outputTokens.length },
    calls: { median: median(calls), mean: mean(calls), n: calls.length },
    inputTokens: { median: medianInput, mean: mean(inputTokens), n: inputTokens.length },
    costPer100: costPer100(medianInput, medianOutput, price),
    rule: "Medians use supported passes only. Honest unsupported answers count in first-try and within-two and are declined, not working charts and not DNF. DNF tasks are excluded. Infinity is not used. ChartKit repair() does not add a model call.",
  };
}

export function scoreAgent(results, options = {}) {
  const byLib = new Map();
  for (const row of results ?? []) {
    if (!row || typeof row.library !== "string") continue;
    const list = byLib.get(row.library) ?? [];
    list.push(row);
    byLib.set(row.library, list);
  }
  const order = [...SCORE_LIBRARIES.filter((library) => byLib.has(library)), ...[...byLib.keys()].filter((library) => !SCORE_LIBRARIES.includes(library))];
  return order.map((library) => ({ library, ...scoreLibrary(byLib.get(library), options) }));
}
