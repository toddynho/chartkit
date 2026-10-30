/**
 * Gzip size of the line entry: esbuild --bundle --minify, gzip level 9, platform node.
 * Same entry as scripts/size.mjs. The site reads this at build time.
 */
import { gzipSync } from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const externalDynamicEntries = {
  name: "external-dynamic-entries",
  setup(build) {
    build.onResolve({ filter: /^\.\/(load|extra-tip)$/ }, (args) => {
      if (args.kind !== "dynamic-import") return null;
      return { path: `@chartkitdev/core/${args.path.slice(2)}`, external: true };
    });
    build.onResolve({ filter: /^\.\/canvas\/hydrate$/ }, (args) => {
      if (args.kind !== "dynamic-import") return null;
      return { path: "@chartkitdev/core/canvas/hydrate", external: true };
    });
    build.onResolve({ filter: /^\.\/layout$/ }, (args) => {
      if (args.kind !== "dynamic-import") return null;
      return { path: "@chartkitdev/core/layout", external: true };
    });
    build.onResolve({ filter: /^\.\/sampling-run$/ }, (args) => {
      if (args.kind !== "dynamic-import") return null;
      return { path: "@chartkitdev/core/sampling", external: true };
    });
    build.onResolve({ filter: /^\.\/validate-phase4$/ }, (args) => {
      if (args.kind !== "dynamic-import") return null;
      return { path: "@chartkitdev/core/validate/phase4", external: true };
    });
    build.onResolve({ filter: /^\.\/mermaid-phase4$/ }, (args) => {
      if (args.kind !== "dynamic-import") return null;
      return { path: "@chartkitdev/core/mermaid/phase4", external: true };
    });
  },
};

/** Source of the createRenderer([line]) entry. srcDir is packages/core/src. */
export function lineEntrySource(srcDir) {
  return `import { createRenderer } from ${JSON.stringify(join(srcDir, "render.ts"))};\nimport { line } from ${JSON.stringify(join(srcDir, "charts/line.ts"))};\nexport const render = createRenderer([line]);\n`;
}

export async function measureLineGzip() {
  const src = join(root, "packages/core/src");
  const entry = join(tmpdir(), `chartkit-line-entry-${Math.random().toString(36).slice(2)}.mjs`);
  const outfile = join(tmpdir(), `chartkit-line-gzip-${Math.random().toString(36).slice(2)}.mjs`);
  writeFileSync(entry, lineEntrySource(src));
  await build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    format: "esm",
    platform: "node",
    outfile,
    plugins: [externalDynamicEntries],
    logLevel: "silent",
  });
  const code = readFileSync(outfile);
  return {
    gzipBytes: gzipSync(code, { level: 9 }).length,
    minBytes: code.length,
    code: code.toString("utf8"),
  };
}

/** Phase 4 line cell: platform browser, NODE_ENV=production, gzip level 9. */
export async function measurePhase4LineGzip() {
  const outfile = join(tmpdir(), `chartkit-line-phase4-${Math.random().toString(36).slice(2)}.mjs`);
  const source = `import { createRenderer } from ${JSON.stringify(join(root, "packages/core/src/render.ts"))};
import { line } from ${JSON.stringify(join(root, "packages/core/src/charts/line.ts"))};
const render = createRenderer([line]);
export function draw(spec) {
  return render(spec);
}
`;
  await build({
    stdin: {
      contents: source,
      resolveDir: root,
      sourcefile: "entry.mjs",
      loader: "js",
    },
    bundle: true,
    minify: true,
    format: "esm",
    platform: "browser",
    outfile,
    define: { "process.env.NODE_ENV": '"production"' },
    logLevel: "silent",
  });
  const code = readFileSync(outfile);
  return { gzipBytes: gzipSync(code, { level: 9 }).length, minBytes: code.length };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const measured = process.argv.includes("--phase4") ? await measurePhase4LineGzip() : await measureLineGzip();
  process.stdout.write(`${JSON.stringify({ gzipBytes: measured.gzipBytes, minBytes: measured.minBytes })}\n`);
}
