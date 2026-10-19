import { dirname, join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** Directory of the files copied at build time. No network. */
export function dataDir(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(here, "../data"), join(here, "../../data")];
  for (const dir of candidates) {
    if (existsSync(join(dir, "features.json"))) return dir;
  }
  throw new Error(
    "ChartKit MCP data is missing. From the repo run: npm run build --workspace=@chartkitdev/mcp",
  );
}

export function readData(name: string): string {
  return readFileSync(join(dataDir(), name), "utf8");
}

export function packageVersion(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  for (const file of [join(here, "../package.json"), join(here, "../../package.json")]) {
    if (!existsSync(file)) continue;
    const parsed = JSON.parse(readFileSync(file, "utf8")) as { version?: string; name?: string };
    if (parsed.name === "@chartkitdev/mcp" && parsed.version) return parsed.version;
  }
  return "0.0.0";
}
