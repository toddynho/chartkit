import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";

const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "../../../..");

/**
 * Codes that already describe one situation in more than one wording.
 * A new code is one diagnostic: two different messages fail this test.
 * CK3020–CK3022 are range and error bars on the uncertainty branch.
 */
const FAMILIES = new Set([
  "CK1006",
  "CK1009",
  "CK1010",
  "CK2004",
  "CK3002",
  "CK3003",
  "CK3012",
  "CK3014",
  "CK3016",
  "CK3017",
]);

const RESERVED = ["CK3020", "CK3021", "CK3022"];

function walk(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === "generated" || name === "__tests__") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (name.endsWith(".ts")) out.push(path);
  }
}

function signature(message: string): string {
  return message.replace(/\$\{[^}]*\}/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

describe("CK codes", () => {
  const files: string[] = [];
  walk(join(repoRoot, "packages"), files);

  const byCode = new Map<string, Set<string>>();
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const pattern = /code:\s*"(CK\d+)"/g;
    for (const match of text.matchAll(pattern)) {
      const code = match[1];
      const after = text.slice(match.index ?? 0, (match.index ?? 0) + 400);
      const literal = /message:\s*(?:"([^"]*)"|`([^`]*)`)/.exec(after);
      const raw = literal?.[1] ?? literal?.[2];
      const set = byCode.get(code) ?? new Set<string>();
      if (raw) set.add(signature(raw));
      byCode.set(code, set);
    }
  }

  it("does not reuse a code for a different diagnostic", () => {
    const dupes: string[] = [];
    for (const [code, messages] of byCode) {
      if (FAMILIES.has(code) || messages.size < 2) continue;
      dupes.push(`${code}: ${[...messages].join(" | ")}`);
    }
    expect(dupes).toEqual([]);
  });

  it("leaves CK3020–CK3022 for range and error bars", () => {
    for (const code of RESERVED) expect(byCode.has(code), code).toBe(false);
  });
});
