import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "svelte4/compiler";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../Chart.svelte"), "utf8");

describe("Svelte 4 compiler", () => {
  it("compiles the client and the server output", () => {
    for (const generate of ["dom", "ssr"] as const) {
      const result = compile(source, { filename: "Chart.svelte", generate, css: "external" });
      const warnings = (result.warnings ?? []).filter((warning) => warning.code !== "css-unused-selector");
      expect(warnings, JSON.stringify(warnings)).toEqual([]);
      expect(result.js.code).toContain("@chartkitdev/core/extra");
    }
  });
});
