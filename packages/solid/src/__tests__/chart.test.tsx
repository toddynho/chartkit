import { spawnSync } from "node:child_process";
import { createSignal } from "solid-js";
import { hydrate, render } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { Chart } from "../Chart";

const line = {
  version: "1" as const,
  type: "line" as const,
  data: [
    { quarter: "Q1", units: 40 },
    { quarter: "Q2", units: 55 },
  ],
  encoding: { x: "quarter", y: "units" },
  a11y: { alt: "Units rose from Q1 to Q2." },
};

const next = {
  ...line,
  a11y: { alt: "Units fell after Q1." },
  data: [
    { quarter: "Q1", units: 55 },
    { quarter: "Q2", units: 40 },
  ],
};

describe("Solid Chart", () => {
  it("renders one line SVG and hydrates it with mount", () => {
    const root = document.createElement("div");
    document.body.append(root);
    const dispose = render(() => <Chart spec={line} />, root);
    expect(root.querySelectorAll("svg")).toHaveLength(1);
    expect(root.querySelector("svg")?.getAttribute("data-ck-type")).toBe("line");
    expect(root.querySelector("svg")?.getAttribute("aria-label")).toBe(line.a11y.alt);
    dispose();
    root.remove();
  });

  it("updates the same node when the spec changes", () => {
    const root = document.createElement("div");
    document.body.append(root);
    const [spec, setSpec] = createSignal(line);
    const dispose = render(() => <Chart spec={spec()} />, root);
    expect(root.querySelector("svg")?.getAttribute("aria-label")).toBe(line.a11y.alt);
    setSpec(next);
    expect(root.querySelectorAll("svg")).toHaveLength(1);
    expect(root.querySelector("svg")?.getAttribute("aria-label")).toBe(next.a11y.alt);
    dispose();
    root.remove();
  });

  it("hydrates the server SVG in place", () => {
    const rendered = spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `import { renderToString } from "./dist/ssr.js";
         const spec = ${JSON.stringify(line)};
         process.stdout.write(renderToString(spec));`,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    expect(rendered.status).toBe(0);
    const root = document.createElement("div");
    root.innerHTML = rendered.stdout;
    document.body.append(root);
    (globalThis as unknown as { _$HY: unknown })._$HY = { events: [], completed: new WeakSet(), r: {}, fe() {} };
    hydrate(() => <Chart spec={line} />, root);
    expect(root.querySelectorAll("svg")).toHaveLength(1);
    expect(root.querySelector("svg")?.getAttribute("data-ck-type")).toBe("line");
    expect(root.querySelector("svg")?.getAttribute("aria-label")).toBe(line.a11y.alt);
    root.remove();
  });
});
