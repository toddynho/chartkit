import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "esbuild";

const benchRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

export async function measureSsr() {
  const outfile = join(benchRoot, ".out/ssr-probes.mjs");
  mkdirSync(dirname(outfile), { recursive: true });
  await build({
    entryPoints: [join(benchRoot, "ssr/probes.mjs")],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile,
    define: { "process.env.NODE_ENV": '"production"' },
    banner: {
      js: `import { createRequire } from "node:module";
import { dirname as dirname$ } from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname$(__filename);`,
    },
    logLevel: "silent",
  });
  const mod = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
  return mod.measureSsr();
}
