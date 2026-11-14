/**
 * Quick-start snippets match the adapter entrypoints, the shared spec
 * validates with zero errors, and the vanilla snippet's mount() draws an SVG.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { pathToFileURL, fileURLToPath } from "node:url";
import { agentPrompt, mcpConfig, quickSpec, quickStacks } from "./quick-start.ts";

const root = fileURLToPath(new URL("../../../../", import.meta.url));

const ENTRY: Record<string, string> = {
  "@chartkitdev/react": "packages/react/src/index.ts",
  "@chartkitdev/vue": "packages/vue/src/index.ts",
  "@chartkitdev/svelte": "packages/svelte/src/index.js",
  "@chartkitdev/astro": "packages/astro/src/index.d.ts",
  "@chartkitdev/solid": "packages/solid/src/index.tsx",
  "@chartkitdev/qwik": "packages/qwik/src/index.ts",
  "@chartkitdev/angular": "packages/angular/src/index.ts",
  "@chartkitdev/vanilla": "packages/vanilla/src/index.ts",
  "@chartkitdev/element": "packages/element/src/index.ts",
};

type Runtime = {
  validate: (spec: unknown) => { ok: boolean; errors: { code: string; message: string }[] };
  mount: (el: { innerHTML: string }, spec: unknown) => unknown;
};

const runtime: Runtime = await loadRuntime();

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

function exportedNames(source: string): Set<string> {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const names = new Set<string>();
  for (const match of text.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g)) names.add(match[1]);
  for (const match of text.matchAll(/export\s+(?:abstract\s+)?class\s+([A-Za-z0-9_]+)/g)) names.add(match[1]);
  for (const match of text.matchAll(/export\s+(?:const|let|var|type|interface|enum)\s+([A-Za-z0-9_]+)/g)) names.add(match[1]);
  for (const match of text.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const part of match[1].split(",")) {
      const bits = part.trim().split(/\s+/).filter((bit) => bit && bit !== "type");
      const asAt = bits.indexOf("as");
      const name = asAt >= 0 ? bits[asAt + 1] : bits[bits.length - 1];
      if (name) names.add(name);
    }
  }
  return names;
}

function importsIn(code: string): { names: string[]; source: string }[] {
  const found: { names: string[]; source: string }[] = [];
  for (const line of code.split("\n")) {
    const trimmed = line.trim();
    const side = trimmed.match(/^import\s+["']([^"']+)["'];?$/);
    if (side) {
      found.push({ names: [], source: side[1] });
      continue;
    }
    const named = trimmed.match(/^import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["'];?$/);
    if (named) {
      const names = named[1]
        .split(",")
        .map((part) => part.trim().split(/\s+/).filter((bit) => bit && bit !== "type").pop() ?? "")
        .filter(Boolean);
      found.push({ names, source: named[2] });
    }
  }
  return found;
}

function specFrom(snippet: string): unknown {
  const marker = "const spec = ";
  const start = snippet.indexOf(marker);
  assert.ok(start >= 0, "snippet declares const spec");
  const rest = snippet.slice(start + marker.length);
  let depth = 0;
  let end = -1;
  for (let i = 0; i < rest.length; i += 1) {
    if (rest[i] === "{") depth += 1;
    else if (rest[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  assert.ok(end > 0, "spec object closes");
  return Function(`"use strict"; return (${rest.slice(0, end + 1)});`)() as unknown;
}

function namesImportedFrom(dir: string, moduleName: string): Set<string> {
  const names = new Set<string>();
  const files = readdirSync(join(root, dir), { recursive: true }) as string[];
  for (const file of files) {
    if (!/\.(ts|tsx|js|d\.ts)$/.test(file)) continue;
    const text = read(join(dir, file));
    for (const row of importsIn(text)) {
      if (row.source !== moduleName) continue;
      for (const name of row.names) names.add(name);
    }
  }
  return names;
}

async function loadRuntime(): Promise<Runtime> {
  const { build } = await import("esbuild");
  const dir = mkdtempSync(join(tmpdir(), "ck-qs-"));
  const entry = join(dir, "entry.ts");
  const outfile = join(dir, "runtime.mjs");
  const validate = join(root, "packages/core/src/validate.ts");
  const vanilla = join(root, "packages/vanilla/src/index.ts");
  writeFileSync(
    entry,
    [`export { validate } from ${JSON.stringify(validate)};`, `export { mount } from ${JSON.stringify(vanilla)};`].join("\n"),
  );
  await build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "silent",
    plugins: [
      {
        name: "chartkit-source",
        setup(build) {
          build.onResolve({ filter: /^@chartkitdev\/core(?:\/.*)?$/ }, (args) => {
            const sub = args.path.slice("@chartkitdev/core".length);
            return { path: join(root, "packages/core/src", sub === "" ? "index.ts" : `${sub.slice(1)}.ts`) };
          });
        },
      },
    ],
  });
  return import(pathToFileURL(outfile).href) as Promise<Runtime>;
}

test("quick start covers every framework and each snippet differs", () => {
  const ids = quickStacks.map((stack) => stack.id);
  assert.deepEqual(ids, ["react", "vue", "svelte", "astro", "solid", "qwik", "angular", "vanilla", "element"]);
  const snippets = new Set(quickStacks.map((stack) => stack.snippet));
  assert.equal(snippets.size, quickStacks.length);
  for (const stack of quickStacks) {
    assert.equal(stack.install, `npm install @chartkitdev/core @chartkitdev/${stack.id}`);
    assert.ok(stack.label.length > 1);
    assert.equal(stack.label.includes("…"), false);
    assert.equal(stack.label.endsWith("."), false);
  }
  assert.equal(quickStacks.find((stack) => stack.id === "vanilla")?.label, "Vanilla");
  assert.equal(quickStacks.find((stack) => stack.id === "element")?.label, "Web component");
});

test("agent prompt names llms.txt, validate, repair, and a framework render", async () => {
  assert.match(agentPrompt, /https:\/\/chartkit\.dev\/llms\.txt/);
  assert.match(agentPrompt, /validate\(\)/);
  assert.match(agentPrompt, /repair\(\)/);
  assert.match(agentPrompt, /ChartKit package for my framework/);
  assert.match(agentPrompt, /rendered SVG/);
  assert.equal(agentPrompt.includes("Do not write chart code."), false);
  const { highlightSource } = await import("../scripts/color-code.ts");
  const painted = highlightSource(agentPrompt, "text");
  assert.equal(painted.includes("tok-cm"), false);
  assert.match(painted, /https:\/\/chartkit\.dev\/llms\.txt/);
  const page = read("apps/web/src/components/QuickStart.astro");
  assert.match(page, /<figcaption>text<\/figcaption>/);
  assert.equal(page.includes('href="/docs/agents"'), false);
  assert.match(page, /href="\/docs\/validate"/);
  const nav = read("apps/web/src/components/DocsNav.astro");
  assert.match(nav, /path === "\/docs" \? null : <FrameworkMenu \/>/);
});

test("MCP block matches the docs MCP page config", () => {
  const page = read("apps/web/src/pages/docs/mcp.astro");
  assert.match(page, /mcp-config/);
  assert.match(mcpConfig, /"@chartkitdev\/mcp"/);
  assert.match(mcpConfig, /"npx"/);
  assert.match(mcpConfig, /"-y"/);
  const quick = read("apps/web/src/components/QuickStart.astro");
  assert.match(quick, /mcpConfig/);
  assert.match(quick, /data-stack-chip/);
  assert.match(quick, /data-stack-panel/);
});

for (const stack of quickStacks) {
  test(`${stack.label} snippet imports exist and the spec validates`, async () => {
    const imported = importsIn(stack.snippet);
    assert.ok(imported.length > 0, `${stack.id} has an import`);
    for (const row of imported) {
      if (row.source.startsWith("@chartkitdev/")) {
        const pkg = row.source.slice("@chartkitdev/".length);
        const meta = JSON.parse(read(`packages/${pkg}/package.json`)) as { name: string; exports: Record<string, unknown> };
        assert.equal(meta.name, row.source);
        assert.ok(meta.exports["."], `${row.source} exports .`);
        const entry = ENTRY[row.source];
        assert.ok(entry, row.source);
        if (row.names.length === 0) {
          assert.equal(row.source, "@chartkitdev/element");
          const source = read(entry);
          assert.match(source, /const TAG = "chart-kit"/);
          assert.match(source, /defineChartKit\(\)/);
          assert.match(source, /set spec\(/);
          assert.match(stack.snippet, /querySelector\("chart-kit"\)/);
          continue;
        }
        const names = exportedNames(read(entry));
        for (const name of row.names) {
          assert.ok(names.has(name), `${row.source} exports ${name}`);
        }
        continue;
      }
      const home = row.source === "@angular/core" ? "packages/angular/src" : row.source === "@builder.io/qwik" ? "packages/qwik/src" : "";
      assert.ok(home, `unexpected import ${row.source}`);
      const known = namesImportedFrom(home, row.source);
      const mod = (await import(row.source)) as Record<string, unknown>;
      for (const name of row.names) {
        assert.ok(known.has(name), `${home} imports ${name} from ${row.source}`);
        assert.equal(typeof mod[name], "function", `${row.source} exports ${name}`);
      }
    }
    if (stack.id === "angular") {
      assert.match(read("packages/angular/src/chart.ts"), /selector:\s*"ck-chart"/);
      assert.match(stack.snippet, /<ck-chart \[spec\]="spec" \/>/);
    }
    const spec = specFrom(stack.snippet);
    assert.deepEqual(spec, quickSpec);
    const result = runtime.validate(spec);
    assert.deepEqual(
      result.errors.map((error) => `${error.code} ${error.message}`),
      [],
    );
    assert.equal(result.ok, true);
  });
}

test("vanilla snippet mount() renders a non-empty SVG", () => {
  const stack = quickStacks.find((item) => item.id === "vanilla");
  assert.ok(stack);
  const el = { innerHTML: "" };
  const document = { querySelector: () => el };
  const body = stack.snippet
    .split("\n")
    .filter((line) => !line.trim().startsWith("import "))
    .join("\n");
  Function("mount", "document", body)(runtime.mount, document);
  assert.match(el.innerHTML, /<svg[\s>]/);
  assert.ok(el.innerHTML.length > 100);
  assert.equal(el.innerHTML.includes("ck-chart-error"), false);
  assert.match(el.innerHTML, /data-ck-type="line"/);
});
