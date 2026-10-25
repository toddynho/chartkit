/** Let Node load the JSON modules imported by docs/lib/specs.ts. */
export async function load(url, context, nextLoad) {
  if (url.endsWith(".json")) {
    const { readFile } = await import("node:fs/promises");
    const source = await readFile(new URL(url), "utf8");
    return { format: "module", source: `export default ${source}`, shortCircuit: true };
  }
  return nextLoad(url, context);
}
