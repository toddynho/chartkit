import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const fontsDir = join(here, "../fonts");

let ready: Promise<void> | undefined;
let fonts: Uint8Array[] | undefined;

export async function rasterize(svg: string, scale: number): Promise<Uint8Array> {
  await loadWasm();
  const { Resvg } = await import("@resvg/resvg-wasm");
  const renderer = new Resvg(forRaster(svg, darkSvg(svg)), {
    fitTo: scale === 1 ? { mode: "original" } : { mode: "zoom", value: scale },
    font: {
      fontBuffers: fontBuffers(),
      defaultFontFamily: "Inter",
      sansSerifFamily: "Inter",
    },
  });
  try {
    return renderer.render().asPng();
  } finally {
    renderer.free();
  }
}

export function forRaster(svg: string, dark: boolean): string {
  let text = resolveVars(svg);
  text = text.replace(/light-dark\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/g, (_match, light: string, night: string) => (dark ? night : light).trim());
  return text.replace(/font-family="[^"]*"/g, 'font-family="Inter, Roboto, sans-serif"');
}

function darkSvg(svg: string): boolean {
  return svg.includes("#0c0c0c") || svg.includes('fill="#9a9a9a"');
}

function fontBuffers(): Uint8Array[] {
  if (!fonts) {
    fonts = [readFileSync(join(fontsDir, "Inter-Regular.ttf")), readFileSync(join(fontsDir, "Roboto-Regular.ttf"))];
  }
  return fonts;
}

function loadWasm(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const { initWasm } = await import("@resvg/resvg-wasm");
      const wasmPath = require.resolve("@resvg/resvg-wasm/index_bg.wasm");
      await initWasm(readFileSync(wasmPath));
    })();
  }
  return ready;
}

function resolveVars(input: string): string {
  let out = "";
  for (let i = 0; i < input.length; i++) {
    if (input.startsWith("var(", i)) {
      const open = i + 3;
      const end = matchingParen(input, open);
      if (end < 0) {
        out += input[i];
        continue;
      }
      const inside = input.slice(open + 1, end);
      const comma = splitTop(inside);
      const fallback = comma < 0 ? inside : inside.slice(comma + 1);
      out += resolveVars(fallback.trim());
      i = end;
      continue;
    }
    out += input[i];
  }
  return out;
}

function matchingParen(value: string, open: number): number {
  let depth = 0;
  for (let i = open; i < value.length; i++) {
    if (value[i] === "(") depth += 1;
    else if (value[i] === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function splitTop(inside: string): number {
  let depth = 0;
  for (let i = 0; i < inside.length; i++) {
    const ch = inside[i];
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    else if (ch === "," && depth === 0) return i;
  }
  return -1;
}
