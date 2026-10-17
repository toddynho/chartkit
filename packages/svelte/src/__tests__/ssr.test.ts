// @vitest-environment node
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build, stop } from "esbuild";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";
import { afterAll, describe, expect, it } from "vitest";
import { coreSvg, specs } from "./specs";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "../Chart.svelte"), "utf8");

function svgOf(html: string): string {
  const start = html.indexOf("<svg");
  const end = html.lastIndexOf("</svg>");
  if (start < 0 || end < 0) return html;
  return html.slice(start, end + "</svg>".length);
}

describe("Svelte SSR", () => {
  it("matches core for line, combo, and heatmap", async () => {
    const compiled = compile(source, { filename: "Chart.svelte", generate: "server", css: "external" });
    const entry = join(tmpdir(), "chartkit-svelte-ssr-entry.mjs");
    const outfile = join(tmpdir(), "chartkit-svelte-ssr-bundle.mjs");
    writeFileSync(entry, compiled.js.code);
    await build({
      entryPoints: [entry],
      bundle: true,
      format: "esm",
      platform: "node",
      outfile,
      absWorkingDir: join(here, "../../../.."),
      nodePaths: [join(here, "../../../../node_modules")],
      alias: {
        "@chartkitdev/core/extra-tip": join(here, "../../../core/src/extra-tip.ts"),
        "@chartkitdev/core/extra": join(here, "../../../core/src/extra.ts"),
        "@chartkitdev/core/load": join(here, "../../../core/src/load.ts"),
        "@chartkitdev/core/all": join(here, "../../../core/src/all.ts"),
      },
      logLevel: "silent",
    });
    const mod = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
    for (const spec of specs) {
      if (spec.type === "histogram") continue;
      const html = render(mod.default, { props: { spec } }).body;
      expect(html).toContain("<svg");
      expect(svgOf(html)).toBe(coreSvg(spec));
    }
    const histogram = specs.find((spec) => spec.type === "histogram");
    const server = render(mod.default, { props: { spec: histogram, render: coreSvg } }).body;
    expect(svgOf(server)).toBe(coreSvg(histogram));
  });
});

afterAll(async () => {
  await stop();
});
