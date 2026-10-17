import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { render } from "../extra";

const examples = join(dirname(fileURLToPath(import.meta.url)), "../../examples");

describe("reference examples, light and dark", () => {
  const names = readdirSync(examples).filter((name) => name.endsWith(".json")).sort();
  for (const name of names) {
    for (const theme of ["auto", "midnight"] as const) {
      it(`${name} ${theme}`, () => {
        const spec = JSON.parse(readFileSync(join(examples, name), "utf8")) as Record<string, unknown>;
        const svg = render({ ...spec, theme });
        expect(svg).toContain(`data-ck-type="${String(spec.type)}"`);
        expect(svg).not.toContain("ck-chart-error");
        expect(svg).toMatchSnapshot();
      });
    }
  }
});
