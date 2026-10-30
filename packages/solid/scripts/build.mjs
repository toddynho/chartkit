/**
 * Compile the Solid component twice: DOM for the client, SSR for renderToString.
 * Core, vanilla, and solid-js stay external. The published files are the compiled output.
 */
import { readFileSync, rmSync } from "node:fs";
import { transformAsync } from "@babel/core";
import typescript from "@babel/preset-typescript";
import solid from "babel-preset-solid";
import { build } from "esbuild";

function solidPlugin(generate) {
  return {
    name: "solid-preset",
    setup(build) {
      build.onLoad({ filter: /\.[cm]?tsx$/ }, async (args) => {
        const source = readFileSync(args.path, "utf8");
        const result = await transformAsync(source, {
          filename: args.path,
          babelrc: false,
          configFile: false,
          presets: [
            [solid, { generate, hydratable: true }],
            [typescript, { isTSX: true, allExtensions: true, onlyRemoveTypeImports: true }],
          ],
        });
        return { contents: result?.code ?? "", loader: "js" };
      });
      build.onResolve({ filter: /^(solid-js|@chartkitdev\/core|@chartkitdev\/vanilla)(\/|$)/ }, (args) => ({
        path: args.path,
        external: true,
      }));
    },
  };
}

async function bundle(entry, outfile, generate) {
  await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: "esm",
    platform: "neutral",
    target: "es2022",
    plugins: [solidPlugin(generate)],
    logLevel: "silent",
  });
}

rmSync("dist", { recursive: true, force: true });

await bundle("src/index.tsx", "dist/index.js", "dom");
await bundle("src/ssr.tsx", "dist/ssr.js", "ssr");
