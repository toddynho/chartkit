/**
 * Bundle the worker from ChartKit source so dynamic imports stay inside one file.
 * Wrangler then packages that file plus the wasm and font modules.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const cloud = join(here, "..");
const core = join(cloud, "../../packages/core/src");

const entries = {
  "@chartkitdev/core/extra": join(core, "extra.ts"),
  "@chartkitdev/core/validate": join(core, "validate.ts"),
  "@chartkitdev/core/validate/phase4": join(core, "validate-phase4.ts"),
};

await esbuild.build({
  absWorkingDir: cloud,
  entryPoints: ["src/worker.ts"],
  outfile: "dist/worker.js",
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2022",
  legalComments: "none",
  plugins: [
    {
      name: "chartkit-source",
      setup(build) {
        build.onResolve({ filter: /^@chartkitdev\/core\// }, (args) => {
          const mapped = entries[args.path];
          if (!mapped) {
            return { errors: [{ text: `No worker alias for ${args.path}` }] };
          }
          return { path: mapped };
        });
        build.onResolve({ filter: /\.(wasm|ttf)$/ }, (args) => ({
          path: args.path,
          external: true,
        }));
      },
    },
  ],
  external: ["node:*"],
});

const { statSync } = await import("node:fs");
const bytes = statSync(join(cloud, "dist/worker.js")).size;
process.stdout.write(`bundled apps/cloud/dist/worker.js (${bytes} bytes)\n`);
