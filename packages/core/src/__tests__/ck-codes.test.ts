import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";

const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "../../../..");

/**
 * Codes that already describe one situation in more than one wording.
 * A new code is one diagnostic: two different messages fail this test.
 * CK3020 and CK3021 each cover the range series and the error-bar wording.
 * CK3020–CK3022 are uncertainty. Time and data is CK3023–CK3026.
 * Hierarchy is CK3027–CK3030. Canvas and large data are CK3031–CK3033.
 * Interaction+ is CK3034–CK3039. Layout is CK3040–CK3049.
 * Geo is CK3050–CK3056, in @chartkitdev/geo.
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
  "CK3020",
  "CK3021",
]);

const UNCERTAINTY = ["CK3020", "CK3021", "CK3022"];
const TIME_DATA = ["CK3023", "CK3024", "CK3025", "CK3026"];
const HIERARCHY = ["CK3027", "CK3028", "CK3029", "CK3030"];
const CANVAS = ["CK3031", "CK3032", "CK3033"];
const INTERACTION = ["CK3034", "CK3035", "CK3036", "CK3037", "CK3038", "CK3039"];
const LAYOUT = ["CK3040", "CK3041", "CK3042", "CK3043", "CK3044", "CK3045", "CK3046", "CK3047", "CK3048", "CK3049"];
const GEO = ["CK3050", "CK3051", "CK3052", "CK3053", "CK3054", "CK3055", "CK3056"];

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

  it("keeps uncertainty on CK3020–CK3022, time and data on CK3023–CK3026, hierarchy on CK3027–CK3030, canvas on CK3031–CK3033, interaction on CK3034–CK3039, layout on CK3040–CK3049, and geo on CK3050–CK3056", () => {
    for (const code of [...UNCERTAINTY, ...TIME_DATA, ...HIERARCHY, ...CANVAS, ...INTERACTION, ...LAYOUT, ...GEO]) expect(byCode.has(code), code).toBe(true);
  });
});
