/**
 * Let Node load docs/lib from the paint scripts.
 * JSON default-imports, extensionless `./specs`, and Next's `@/` alias.
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

function docsRoot(parentURL) {
  if (!parentURL?.startsWith("file:")) return null;
  const file = fileURLToPath(parentURL);
  const at = file.indexOf("/docs/");
  if (at < 0) return null;
  return file.slice(0, at + "/docs".length);
}

export async function resolve(specifier, context, nextResolve) {
  const root = docsRoot(context.parentURL);
  if (root && specifier.startsWith("@/")) {
    const base = join(root, specifier.slice(2));
    const file = [".ts", ".tsx", ".js"].map((ext) => base + ext).find((item) => existsSync(item));
    if (file) return nextResolve(pathToFileURL(file).href, context);
  }
  if (
    root &&
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    !/\.(?:mjs|cjs|js|json|ts|tsx|css|svg|png)$/.test(specifier)
  ) {
    const base = join(dirname(fileURLToPath(context.parentURL)), specifier);
    const file = [".ts", ".tsx", ".js", ".mjs"].map((ext) => base + ext).find((item) => existsSync(item));
    if (file) return nextResolve(pathToFileURL(file).href, context);
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".json")) {
    const { readFile } = await import("node:fs/promises");
    const source = await readFile(new URL(url), "utf8");
    return { format: "module", source: `export default ${source}`, shortCircuit: true };
  }
  return nextLoad(url, context);
}
