/**
 * Browser export for a line race. Frames come from `race.frame(t)`, so the file
 * matches the preview. MP4 when WebCodecs can encode H.264; otherwise WebM via
 * MediaRecorder, paced in real time. No server.
 */
import type { LineRace } from "./race";

export interface RaceExportOptions {
  fps?: number;
  bitrate?: number;
  /** CSS inserted into each SVG before it is painted, for example embedded @font-face rules. */
  fontCss?: string;
  signal?: AbortSignal;
  onProgress?: (ratio: number) => void;
}

export interface RaceExportResult {
  blob: Blob;
  mime: string;
  extension: "mp4" | "webm";
  codec: string;
}

interface AvcSample {
  data: Uint8Array;
  key: boolean;
}

function concat(parts: Uint8Array[]): Uint8Array {
  let size = 0;
  for (const part of parts) size += part.length;
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function u8(bytes: number[]): Uint8Array {
  return Uint8Array.from(bytes);
}

function u16(value: number): Uint8Array {
  const bytes = new Uint8Array(2);
  new DataView(bytes.buffer).setUint16(0, value);
  return bytes;
}

function i16(value: number): Uint8Array {
  const bytes = new Uint8Array(2);
  new DataView(bytes.buffer).setInt16(0, value);
  return bytes;
}

function u32(value: number): Uint8Array {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value >>> 0);
  return bytes;
}

function fourcc(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function box(type: string, ...body: Uint8Array[]): Uint8Array {
  const content = concat(body);
  return concat([u32(8 + content.length), fourcc(type), content]);
}

function fullBox(type: string, version: number, flags: number, ...body: Uint8Array[]): Uint8Array {
  return box(type, u32((version << 24) | flags), ...body);
}

function zeros(size: number): Uint8Array {
  return new Uint8Array(size);
}

const MATRIX = concat([
  u32(0x00010000), u32(0), u32(0),
  u32(0), u32(0x00010000), u32(0),
  u32(0), u32(0), u32(0x40000000),
]);

/** Minimal ISO BMFF file: one H.264 video track, moov before mdat. */
export function muxAvcMp4(options: {
  width: number;
  height: number;
  fps: number;
  avcC: Uint8Array;
  samples: AvcSample[];
}): Uint8Array {
  const { width, height, samples } = options;
  const fps = options.fps;
  if (samples.length === 0) throw new Error("No frames to mux.");
  const timescale = fps * 1000;
  const sampleDelta = 1000;
  const duration = samples.length * sampleDelta;
  const ftyp = box("ftyp", fourcc("isom"), u32(0x200), fourcc("isom"), fourcc("iso2"), fourcc("avc1"), fourcc("mp41"));
  const mvhd = fullBox(
    "mvhd",
    0,
    0,
    u32(0),
    u32(0),
    u32(timescale),
    u32(duration),
    u32(0x00010000),
    u16(0x0100),
    u16(0),
    zeros(8),
    MATRIX,
    zeros(24),
    u32(2),
  );
  const tkhd = fullBox(
    "tkhd",
    0,
    0x7,
    u32(0),
    u32(0),
    u32(1),
    u32(0),
    u32(duration),
    zeros(8),
    u16(0),
    u16(0),
    u16(0),
    u16(0),
    MATRIX,
    u32(width << 16),
    u32(height << 16),
  );
  const mdhd = fullBox("mdhd", 0, 0, u32(0), u32(0), u32(timescale), u32(duration), u16(0x55c4), u16(0));
  const hdlr = fullBox("hdlr", 0, 0, u32(0), fourcc("vide"), zeros(12), new TextEncoder().encode("VideoHandler\0"));
  const vmhd = fullBox("vmhd", 0, 1, u16(0), u16(0), u16(0), u16(0));
  const dref = fullBox("dref", 0, 0, u32(1), fullBox("url ", 0, 1));
  const compressor = zeros(32);
  const avc1 = box(
    "avc1",
    zeros(6),
    u16(1),
    u16(0),
    u16(0),
    zeros(12),
    u16(width),
    u16(height),
    u32(0x00480000),
    u32(0x00480000),
    u32(0),
    u16(1),
    compressor,
    u16(0x0018),
    i16(-1),
    box("avcC", options.avcC),
  );
  const stsd = fullBox("stsd", 0, 0, u32(1), avc1);
  const stts = fullBox("stts", 0, 0, u32(1), u32(samples.length), u32(sampleDelta));
  const stsc = fullBox("stsc", 0, 0, u32(1), u32(1), u32(samples.length), u32(1));
  const sizes: Uint8Array[] = [u32(0), u32(samples.length)];
  for (const sample of samples) sizes.push(u32(sample.data.length));
  const stsz = fullBox("stsz", 0, 0, ...sizes);
  const keys = samples.map((sample, index) => (sample.key ? index + 1 : 0)).filter((index) => index > 0);
  const sync = keys.length > 0 ? keys : [1];
  const stss = fullBox("stss", 0, 0, u32(sync.length), ...sync.map((index) => u32(index)));
  const stblWithoutCo = concat([stsd, stts, stsc, stsz, stss]);
  // stco is 20 bytes. Build moov with a placeholder offset, then patch it.
  const stco = fullBox("stco", 0, 0, u32(1), u32(0));
  const stbl = box("stbl", stblWithoutCo, stco);
  const minf = box("minf", vmhd, box("dinf", dref), stbl);
  const mdia = box("mdia", mdhd, hdlr, minf);
  const trak = box("trak", tkhd, mdia);
  const moov = box("moov", mvhd, trak);
  const mdatBody = concat(samples.map((sample) => sample.data));
  const chunkOffset = ftyp.length + moov.length + 8;
  const view = new DataView(moov.buffer, moov.byteOffset, moov.byteLength);
  const stcoAt = findFourcc(moov, "stco");
  if (stcoAt < 0) throw new Error("MP4 muxer lost the sample table.");
  view.setUint32(stcoAt + 12, chunkOffset);
  return concat([ftyp, moov, box("mdat", mdatBody)]);
}

function findFourcc(bytes: Uint8Array, type: string): number {
  const code = fourcc(type);
  for (let i = 0; i <= bytes.length - 4; i++) {
    if (bytes[i] === code[0] && bytes[i + 1] === code[1] && bytes[i + 2] === code[2] && bytes[i + 3] === code[3]) return i;
  }
  return -1;
}

function injectStyle(svg: string, css: string | undefined): string {
  if (!css) return svg;
  const safe = css.replace(/<\/style/gi, "<\\/style");
  const open = svg.indexOf(">");
  if (open < 0) return svg;
  return `${svg.slice(0, open + 1)}<style>${safe}</style>${svg.slice(open + 1)}`;
}

function frameCount(race: LineRace, fps: number): number {
  return Math.max(2, Math.round((race.duration / 1000) * fps));
}

async function paintSvg(ctx: CanvasRenderingContext2D, svg: string, width: number, height: number, background: string): Promise<void> {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.decoding = "sync";
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("The browser could not paint an SVG frame."));
    });
    image.src = url;
    await loaded;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function even(value: number): number {
  const rounded = Math.max(2, Math.round(value));
  return rounded - (rounded % 2);
}

interface EncoderGlobals {
  VideoEncoder?: {
    isConfigSupported(config: unknown): Promise<{ supported?: boolean }>;
    new (init: {
      output: (chunk: EncodedVideoChunk, meta?: EncodedVideoChunkMetadata) => void;
      error: (error: Error) => void;
    }): VideoEncoder;
  };
  VideoFrame?: typeof VideoFrame;
}

async function supportedCodec(width: number, height: number, fps: number, bitrate: number): Promise<string | null> {
  const globals = globalThis as unknown as EncoderGlobals;
  if (!globals.VideoEncoder || !globals.VideoFrame) return null;
  const candidates = ["avc1.640028", "avc1.4d401f", "avc1.42001f"];
  for (const codec of candidates) {
    try {
      const result = await globals.VideoEncoder.isConfigSupported({
        codec,
        width,
        height,
        bitrate,
        framerate: fps,
        avc: { format: "avc" },
        latencyMode: "quality",
      });
      if (result.supported) return codec;
    } catch {
      // try the next profile
    }
  }
  return null;
}

function descriptionBytes(description: AllowSharedBufferSource | undefined): Uint8Array | null {
  if (!description) return null;
  if (description instanceof ArrayBuffer) return new Uint8Array(description);
  if (ArrayBuffer.isView(description)) return new Uint8Array(description.buffer, description.byteOffset, description.byteLength);
  return null;
}

async function exportMp4(
  canvas: OffscreenCanvas | HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  race: LineRace,
  fps: number,
  bitrate: number,
  codec: string,
  fontCss: string | undefined,
  signal: AbortSignal | undefined,
  onProgress: ((ratio: number) => void) | undefined,
): Promise<RaceExportResult> {
  const globals = globalThis as EncoderGlobals;
  const Encoder = globals.VideoEncoder;
  const Frame = globals.VideoFrame;
  if (!Encoder || !Frame) throw new Error("WebCodecs is not available.");
  const width = canvas.width;
  const height = canvas.height;
  const count = frameCount(race, fps);
  const samples: AvcSample[] = [];
  let avcC: Uint8Array | null = null;
  let failed: Error | null = null;
  const encoder = new Encoder({
    output(chunk, meta) {
      const bytes = descriptionBytes(meta?.decoderConfig?.description);
      if (bytes && !avcC) avcC = bytes;
      const data = new Uint8Array(chunk.byteLength);
      chunk.copyTo(data);
      samples.push({ data, key: chunk.type === "key" });
    },
    error(error) {
      failed = error;
    },
  });
  encoder.configure({
    codec,
    width,
    height,
    bitrate,
    framerate: fps,
    latencyMode: "quality",
    avc: { format: "avc" },
  });
  const step = 1_000_000 / fps;
  try {
    for (let i = 0; i < count; i++) {
      if (signal?.aborted) throw new DOMException("Export cancelled.", "AbortError");
      if (failed) throw failed;
      const t = i / (count - 1);
      await paintSvg(ctx, injectStyle(race.frame(t), fontCss), width, height, "#ffffff");
      const frame = new Frame(canvas, { timestamp: Math.round(i * step) });
      encoder.encode(frame, { keyFrame: i % fps === 0 });
      frame.close();
      onProgress?.((i + 1) / count);
    }
    await encoder.flush();
    if (failed) throw failed;
    if (!avcC) throw new Error("The encoder did not describe the H.264 stream.");
    const mp4 = muxAvcMp4({ width, height, fps, avcC, samples });
    const copy = new Uint8Array(mp4.byteLength);
    copy.set(mp4);
    return { blob: new Blob([copy], { type: "video/mp4" }), mime: "video/mp4", extension: "mp4", codec };
  } finally {
    try {
      encoder.close();
    } catch {
      // already closed after a failure
    }
  }
}

async function exportWebm(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  race: LineRace,
  fps: number,
  bitrate: number,
  fontCss: string | undefined,
  signal: AbortSignal | undefined,
  onProgress: ((ratio: number) => void) | undefined,
): Promise<RaceExportResult> {
  if (typeof MediaRecorder === "undefined" || typeof canvas.captureStream !== "function") {
    throw new Error("This browser cannot record a canvas.");
  }
  const stream = canvas.captureStream(0);
  const track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack | undefined;
  const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
      ? "video/webm;codecs=vp8"
      : "video/webm";
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: bitrate });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };
  const stopped = new Promise<void>((resolve, reject) => {
    recorder.onstop = () => resolve();
    recorder.onerror = () => reject(new Error("WebM recording failed."));
  });
  recorder.start();
  const count = frameCount(race, fps);
  const width = canvas.width;
  const height = canvas.height;
  try {
    for (let i = 0; i < count; i++) {
      if (signal?.aborted) {
        recorder.stop();
        throw new DOMException("Export cancelled.", "AbortError");
      }
      await paintSvg(ctx, injectStyle(race.frame(i / (count - 1)), fontCss), width, height, "#ffffff");
      track?.requestFrame();
      onProgress?.((i + 1) / count);
      await new Promise((resolve) => setTimeout(resolve, Math.round(1000 / fps)));
    }
  } finally {
    if (recorder.state !== "inactive") recorder.stop();
  }
  await stopped;
  return { blob: new Blob(chunks, { type: mime }), mime, extension: "webm", codec: mime };
}

export async function exportLineRace(race: LineRace, options?: RaceExportOptions): Promise<RaceExportResult> {
  if (typeof document === "undefined") throw new Error("exportLineRace runs in the browser.");
  const fps = Math.max(1, Math.min(60, Math.round(options?.fps ?? race.fps ?? 30)));
  const bitrate = options?.bitrate ?? 5_000_000;
  const width = even(race.width);
  const height = even(race.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Could not get a canvas.");
  const codec = await supportedCodec(width, height, fps, bitrate);
  if (codec) {
    try {
      return await exportMp4(canvas, ctx, race, fps, bitrate, codec, options?.fontCss, options?.signal, options?.onProgress);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
    }
  }
  return exportWebm(canvas, ctx, race, fps, bitrate, options?.fontCss, options?.signal, options?.onProgress);
}
