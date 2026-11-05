/**
 * Rasterize an SSR SVG with the same resvg-wasm build Cloud uses.
 * The committed baseline is a 64-bit dHash, not the PNG.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { fontDir, RASTER_WIDTH } from "./paths.mjs";
import { loadRuntime } from "./load.mjs";
import { DARK_PAGE, LIGHT_PAGE, rasterDark } from "./themes.mjs";

const require = createRequire(import.meta.url);
let wasmReady;

function loadWasm() {
  if (!wasmReady) {
    wasmReady = (async () => {
      const { initWasm, Resvg } = await import("@resvg/resvg-wasm");
      const wasm = readFileSync(require.resolve("@resvg/resvg-wasm/index_bg.wasm"));
      await initWasm(wasm);
      const fonts = ["Inter-Regular.ttf", "Roboto-Regular.ttf"].map((name) => new Uint8Array(readFileSync(join(fontDir, name))));
      return { Resvg, fonts };
    })();
  }
  return wasmReady;
}

export function svgDigest(svg) {
  return createHash("sha1").update(svg).digest("hex");
}

export async function rasterCase(spec, svg, { png = false, width = RASTER_WIDTH } = {}) {
  const dark = rasterDark(spec);
  const runtime = await loadRuntime();
  const prepared = runtime.forRaster(svg, dark);
  const { Resvg, fonts } = await loadWasm();
  const renderer = new Resvg(prepared, {
    fitTo: fitOf(prepared, width),
    background: dark ? DARK_PAGE : LIGHT_PAGE,
    font: {
      fontBuffers: fonts,
      defaultFontFamily: "Inter",
      sansSerifFamily: "Inter",
    },
  });
  try {
    const image = renderer.render();
    try {
      const hash = dHash(image.pixels, image.width, image.height);
      return { hash, png: png ? Buffer.from(image.asPng()) : null, dark };
    } finally {
      image.free();
    }
  } finally {
    renderer.free();
  }
}

/** Hash rasters stay near 96px. Display rasters ask for a wider frame and still cap the height. */
function fitOf(svg, targetWidth) {
  const match = /viewBox="\s*[0-9.+-]+\s+[0-9.+-]+\s+([0-9.]+)\s+([0-9.]+)\s*"/.exec(svg);
  const width = Number(match?.[1] ?? 0);
  const height = Number(match?.[2] ?? 0);
  const cap = targetWidth <= RASTER_WIDTH ? 256 : 720;
  if (!(width > 0) || !(height > 0)) return { mode: "width", value: targetWidth };
  const tall = targetWidth * (height / width);
  if (tall <= cap) return { mode: "width", value: targetWidth };
  return { mode: "width", value: Math.max(16, Math.round((cap * width) / height)) };
}

/** 8×9 grayscale, each row compared left to right. 64 bits, hex. */
export function dHash(pixels, width, height) {
  const cols = 9;
  const rows = 8;
  const gray = new Float64Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    const y0 = Math.floor((y * height) / rows);
    const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * height) / rows));
    for (let x = 0; x < cols; x++) {
      const x0 = Math.floor((x * width) / cols);
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * width) / cols));
      let sum = 0;
      let n = 0;
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = (yy * width + xx) * 4;
          sum += pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
          n += 1;
        }
      }
      gray[y * cols + x] = n ? sum / n : 0;
    }
  }
  let bits = 0n;
  let pos = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols - 1; x++) {
      if (gray[y * cols + x] < gray[y * cols + x + 1]) bits |= 1n << BigInt(pos);
      pos += 1;
    }
  }
  return bits.toString(16).padStart(16, "0");
}

export function hamming(a, b) {
  if (!a || !b || a.length !== b.length) return 64;
  let n = 0;
  let v = BigInt(`0x${a}`) ^ BigInt(`0x${b}`);
  while (v) {
    n += Number(v & 1n);
    v >>= 1n;
  }
  return n;
}
