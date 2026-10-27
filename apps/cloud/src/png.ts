import type { InitInput } from "@resvg/resvg-wasm";

let ready: Promise<void> | undefined;
let wasmSource: InitInput | undefined;
let fontBytes: Uint8Array[] | undefined;

/**
 * Worker entry calls this with the wasm module and the bundled faces.
 * Node tests leave it unset and read the same files from disk.
 */
export function installRasterAssets(assets: { wasm: InitInput; fonts: ArrayBuffer[] }): void {
  if (ready) return;
  wasmSource = assets.wasm;
  fontBytes = assets.fonts.map((font) => (font instanceof Uint8Array ? font : new Uint8Array(font)));
}

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
  if (!fontBytes) throw new Error("ChartKit fonts are not loaded.");
  return fontBytes;
}

function loadWasm(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const { initWasm } = await import("@resvg/resvg-wasm");
      if (!wasmSource) wasmSource = await nodeWasmBytes();
      if (!fontBytes) fontBytes = await nodeFontBytes();
      await initWasm(wasmSource);
    })();
  }
  return ready;
}

async function nodeWasmBytes(): Promise<Uint8Array> {
  const { readFileSync } = await import("node:fs");
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  return readFileSync(require.resolve("@resvg/resvg-wasm/index_bg.wasm"));
}

async function nodeFontBytes(): Promise<Uint8Array[]> {
  const { readFileSync } = await import("node:fs");
  const { dirname, join } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const dir = join(dirname(fileURLToPath(import.meta.url)), "../fonts");
  return [readFileSync(join(dir, "Inter-Regular.ttf")), readFileSync(join(dir, "Roboto-Regular.ttf"))];
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
