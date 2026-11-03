/**
 * Status map derived from the option-effect audit.
 * `not-yet` is class b (and a/c). `needs-data` is class d. Everything probed
 * without a failure row is `works`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const auditPath = join(root, "apps/web/audit/option-effect.json");
export const statusPath = join(root, "apps/web/src/data/option-effect-status.json");

const HINTS = [
  [/no series on y2|right axis/, "Needs a series on the right axis"],
  [/spare series column|more than one series|second series/, "Needs a second series"],
  [/no color field/, "Needs a color field"],
  [/no size field/, "Needs a size field"],
  [/OHLC|open, high, low/, "Needs open, high, low, and close"],
  [/categories, so format and scale/, "Needs a time or number axis"],
  [/no legend/, "Needs a legend"],
  [/not faceted/, "Needs a facet field"],
  [/not a concatenation/, "Needs a concat layout"],
  [/no drilldown/, "Needs drilldown data"],
  [/motion runs/, "Shows when the chart animates"],
  [/client behavior/, "Used when the chart is interactive"],
  [/id is a hook/, "Not drawn on the chart"],
];

export function hintFor(reason) {
  if (!reason) return "";
  for (const [pattern, hint] of HINTS) if (pattern.test(reason)) return hint;
  return "";
}

export function statusForKlass(klass) {
  if (klass === "d") return "needs-data";
  if (klass === "b" || klass === "a" || klass === "c") return "not-yet";
  return "works";
}

/** Rebuild the committed map from an audit file that includes `coverage`. */
export function statusFromAudit(audit) {
  const rows = new Map();
  for (const row of audit.rows ?? []) rows.set(`${row.type}\0${row.path}`, row);
  const map = {};
  const coverage = audit.coverage ?? {};
  for (const type of Object.keys(coverage).sort()) {
    const fields = {};
    for (const path of coverage[type]) {
      const row = rows.get(`${type}\0${path}`);
      const status = statusForKlass(row?.klass);
      const entry = { status };
      if (status === "needs-data") {
        const hint = hintFor(row?.reason ?? "");
        if (hint) entry.hint = hint;
      }
      fields[path] = entry;
    }
    map[type] = fields;
  }
  return map;
}

export function writeStatus(audit) {
  const map = statusFromAudit(audit);
  writeFileSync(statusPath, `${JSON.stringify(map)}\n`);
  return map;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const audit = JSON.parse(readFileSync(auditPath, "utf8"));
  if (!audit.coverage) {
    console.error("option-effect.json has no coverage. Re-run npm run audit:options.");
    process.exit(1);
  }
  const map = writeStatus(audit);
  const counts = { works: 0, "needs-data": 0, "not-yet": 0 };
  for (const fields of Object.values(map)) {
    for (const entry of Object.values(fields)) counts[entry.status] += 1;
  }
  console.log(counts);
}
