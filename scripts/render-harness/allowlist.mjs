/**
 * Known findings. A run fails when it produces an error or warning whose key
 * is not in this file. Extra keys (a bug that has since been fixed) do not fail.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { allowlistPath, SEED } from "./paths.mjs";
import { stable } from "./generate.mjs";

export function findingKey(finding) {
  return [finding.severity, finding.check, finding.type, finding.example, finding.option, stable(finding.value), finding.signature ?? ""].join("|");
}

export function readAllowlist() {
  try {
    const parsed = JSON.parse(readFileSync(allowlistPath, "utf8"));
    return new Set(parsed.keys ?? []);
  } catch {
    return new Set();
  }
}

export function novelFindings(findings, allowed) {
  return findings.filter((finding) => finding.severity !== "info" && !allowed.has(findingKey(finding)));
}

export function writeAllowlist(findings) {
  const keys = [...new Set(findings.filter((finding) => finding.severity !== "info").map(findingKey))].sort();
  const doc = {
    version: 1,
    seed: SEED,
    note: "Known render findings. CI fails only when a run produces an error or warning whose key is absent. Refresh with npm run test:render:update.",
    keys,
  };
  writeFileSync(allowlistPath, `${JSON.stringify(doc, null, 2)}\n`);
  return keys.length;
}
