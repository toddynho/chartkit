/**
 * Pure helpers for the size budget gate. No I/O except baseBudget() (git show).
 * A cap may only go up in a PR when scripts/size-exceptions.json has an entry
 * { key, cap, reason, pr } whose cap equals the new cap.
 */
import { execFileSync } from "node:child_process";

export const HEADROOM_PCT = 0.01;
export const HEADROOM_MIN = 256;

/** Cap for a fresh reset: measured + max(1%, 256 B). */
export function capFor(measured) {
  return measured + Math.max(HEADROOM_MIN, Math.ceil(measured * HEADROOM_PCT));
}

/** Budget on the base ref (default origin/main). Returns null when git has no such ref. */
export function baseBudget(ref = process.env.SIZE_BASE_REF || "origin/main", file = "scripts/size-budget.json") {
  try {
    const out = execFileSync("git", ["show", `${ref}:${file}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return { ref, budget: JSON.parse(out) };
  } catch {
    return null;
  }
}

/**
 * Compare budget against measurement, base budget and exceptions.
 * Returns { rows, failures }. rows: one per key with base/cap/measured/status.
 */
export function evaluate({ keys, measured, budget, base, exceptions = [] }) {
  const rows = [];
  const failures = [];
  for (const key of keys) {
    const cap = budget[key];
    const prev = base ? base.budget[key] : undefined;
    const row = { key, base: prev, cap, measured: measured[key], status: "ok" };
    if (typeof cap !== "number") {
      failures.push(`${key} budget missing`);
      row.status = "missing";
    } else {
      if (measured[key] > cap) {
        failures.push(`${key} gzip ${measured[key]} > budget ${cap}`);
        row.status = "over";
      }
      if (base && typeof prev === "number" && cap > prev) {
        const ex = exceptions.find((e) => e.key === key && e.cap === cap);
        if (!ex) {
          failures.push(`${key} cap raised ${prev} -> ${cap} without an entry in scripts/size-exceptions.json (key, cap, reason, pr)`);
          row.status = "raised-no-exception";
        } else if (!ex.reason || !ex.pr) {
          failures.push(`${key} exception needs a reason and a pr`);
          row.status = "bad-exception";
        } else if (row.status === "ok") row.status = "raised (exception)";
      } else if (base && typeof prev === "number" && cap < prev && row.status === "ok") row.status = "lowered";
      else if (base && prev === undefined && row.status === "ok") row.status = "new";
    }
    rows.push(row);
  }
  return { rows, failures };
}

/** Markdown table: only changed rows when `onlyChanged`, else all. */
export function formatTable(rows, { onlyChanged = false } = {}) {
  const shown = onlyChanged ? rows.filter((r) => r.base !== r.cap || r.status !== "ok") : rows;
  const head = "bundle | base cap | cap | measured | headroom | status\n--- | ---: | ---: | ---: | ---: | ---";
  const body = shown
    .map((r) => `${r.key} | ${r.base ?? "-"} | ${r.cap} | ${r.measured} | ${typeof r.cap === "number" ? r.cap - r.measured : "-"} | ${r.status}`)
    .join("\n");
  return `${head}\n${body}`;
}
