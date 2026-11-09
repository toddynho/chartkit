/**
 * OpenAI-compatible vision review.
 * Crusoe Managed Inference is the default host. Model ids are case-sensitive
 * and come from GET /v1/models. Nothing here embeds an API key.
 */

export const DEFAULT_BASE_URL = "https://api.inference.crusoecloud.com/v1";

/**
 * Used only when the base URL is Crusoe and GET /v1/models still lists the id.
 * Otherwise the first multimodal model in that response is used.
 */
export const CRUSOE_PREFER = ["nvidia/NVIDIA-Nemotron-3.5-Super-VL", "Qwen/Qwen3.8-27B"];

/** Reasoning models think before the JSON. 4096 leaves room for the answer. */
export const DEFAULT_MAX_TOKENS = 4096;

export const RUBRIC = `You review screenshots of the ChartKit docs site for layout bugs. Report only problems you can see.

Issue types: clipped, scrollbar, overlap, truncated, empty, too-small, too-large, unreadable, misaligned.
Use clipped for a chart cut off by its pane. scrollbar for a scrollbar inside a chart panel. overlap for overlapping labels. truncated for cut-off label text. empty for a blank chart. too-small or too-large for a chart that does not fit its space. unreadable for text that fails against its background. misaligned for controls that do not line up with the chart.

Severity is high, medium, or low. confidence is a number from 0 to 1. reason is one short sentence.

Ignore taste, palette, and missing features. A chart that fits its pane with readable labels is fine. Deterministic findings are measurements from the page. Confirm them from the pixels. Do not repeat a finding you cannot see.

Return JSON: {"page":"","viewport":"","issues":[{"type":"","severity":"","reason":"","confidence":0}]}
issues is an empty array when nothing is wrong.`;

const ISSUE_TYPES = new Set(["clipped", "scrollbar", "overlap", "truncated", "empty", "too-small", "too-large", "unreadable", "misaligned", "other"]);
const SEVERITIES = new Set(["high", "medium", "low"]);

export function isCrusoe(baseUrl) {
  try {
    return new URL(baseUrl).hostname === "api.inference.crusoecloud.com";
  } catch {
    return false;
  }
}

export function hostNeedsKey(baseUrl) {
  try {
    const host = new URL(baseUrl).hostname;
    return host !== "localhost" && host !== "127.0.0.1" && host !== "[::1]";
  } catch {
    return true;
  }
}

function tagText(tag) {
  return String(tag).toLowerCase().replace(/[\s_]+/g, "-");
}

export function isMultimodal(model) {
  const modality = model?.architecture?.modality;
  const modalityText = Array.isArray(modality) ? modality.join(" ") : typeof modality === "string" ? modality : "";
  if (modalityText.toLowerCase().split(/[\s,]+/).includes("multimodal")) return true;
  const tags = Array.isArray(model?.tags) ? model.tags : [];
  return tags.some((tag) => {
    const text = tagText(tag);
    return text === "image-text-to-text" || text === "multimodal";
  });
}

export function multimodalModels(models) {
  return (Array.isArray(models) ? models : []).filter(isMultimodal);
}

/**
 * @returns {{ id: string, reason: "explicit" | "crusoe-prefer" | "first-multimodal" } | null}
 */
export function pickModel(models, { baseUrl, explicit } = {}) {
  if (explicit) return { id: explicit, reason: "explicit" };
  const multi = multimodalModels(models);
  if (isCrusoe(baseUrl || "")) {
    for (const id of CRUSOE_PREFER) {
      if (multi.some((model) => model.id === id)) return { id, reason: "crusoe-prefer" };
    }
  }
  if (!multi.length) return null;
  return { id: multi[0].id, reason: "first-multimodal" };
}

export function redact(text, secret) {
  const raw = String(text ?? "");
  if (!secret) return raw;
  return raw.split(secret).join("[redacted]");
}

/**
 * Approximate OpenAI vision input tokens: scale into 2048, shortest side 768, 512px tiles.
 * This is an estimate for the summary, not a bill.
 */
export function estimateImageTokens(width, height) {
  let w = Number(width);
  let h = Number(height);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) return 0;
  const maxSide = Math.max(w, h);
  if (maxSide > 2048) {
    const scale = 2048 / maxSide;
    w *= scale;
    h *= scale;
  }
  const minSide = Math.min(w, h);
  if (minSide > 768) {
    const scale = 768 / minSide;
    w *= scale;
    h *= scale;
  }
  const tiles = Math.ceil(w / 512) * Math.ceil(h / 512);
  return 85 + 170 * tiles;
}

export function estimateTextTokens(text) {
  return Math.ceil(String(text ?? "").length / 4);
}

/** Crusoe's Nemotron-3.5-Super-VL rejects more than one image. Nano Omni does not. */
export function maxImagesForModel(id) {
  const text = String(id ?? "");
  if (/nemotron/i.test(text) && !/nano-omni/i.test(text)) return 1;
  return 2;
}

/**
 * One image prefers the page viewport. Two images are the page, then the chart crop.
 */
export function pickImagesForReview(images, max) {
  const list = Array.isArray(images) ? images.filter(Boolean) : [];
  const page = list.filter((image) => image.role === "page");
  const chart = list.filter((image) => image.role === "chart");
  const rest = list.filter((image) => image.role !== "page" && image.role !== "chart");
  const cap = Number.isInteger(max) && max > 0 ? max : 0;
  if (cap === 0) return [];
  if (cap === 1) {
    const preferred = page[0] || chart[0] || rest[0];
    return preferred ? [preferred] : [];
  }
  return [...page, ...chart, ...rest].slice(0, cap);
}

export const IMAGE_CAPTION = {
  both: "The first image is the page viewport. The second image is the chart pane cropped on its own.",
  chart: "The image is the chart pane cropped on its own.",
  page: "The image is the page viewport.",
};

export function imageCaption(images) {
  const list = images || [];
  const roles = list.map((image) => image?.role);
  const page = roles.includes("page");
  const chart = roles.includes("chart");
  if (page && chart) return IMAGE_CAPTION.both;
  if (chart) return IMAGE_CAPTION.chart;
  if (page) return IMAGE_CAPTION.page;
  if (list.length >= 2) return IMAGE_CAPTION.both;
  if (list.length === 1) return IMAGE_CAPTION.page;
  return "";
}

export function buildChatRequest({ model, maxTokens, shot, images }) {
  const findingText = shot.checks?.length
    ? shot.checks.map((finding) => `- ${finding.type} (${finding.severity}): ${finding.detail}`).join("\n")
    : "- none";
  const rail = shot.rail
    ? `Rail width: ${shot.rail.px}px${shot.rail.store ? "" : " (default)"}`
    : "Rail width: n/a";
  const caption = imageCaption(images);
  const text = [
    `Page: ${shot.page}`,
    shot.demo ? `Demo: ${shot.demo}` : null,
    `Viewport: ${shot.viewport} ${shot.viewportSize.width}×${shot.viewportSize.height}`,
    rail,
    "Deterministic findings:",
    findingText,
    caption || null,
    "Return JSON only.",
  ]
    .filter(Boolean)
    .join("\n");
  const content = [{ type: "text", text }];
  for (const image of images) {
    content.push({ type: "image_url", image_url: { url: image.dataUri } });
  }
  return {
    model,
    temperature: 0,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: RUBRIC },
      { role: "user", content },
    ],
  };
}

export function estimateRequestTokens(shot, maxTokens = DEFAULT_MAX_TOKENS, images = shot.images) {
  const sent = images || [];
  const body = buildChatRequest({
    model: "estimate",
    maxTokens,
    shot,
    images: sent.map((image) => ({ dataUri: "data:image/png;base64,AA==", role: image.role })),
  });
  const text = JSON.stringify(body);
  let tokens = estimateTextTokens(text);
  for (const image of sent) tokens += estimateImageTokens(image.width, image.height);
  return tokens;
}

export function imageLimitFromError(text) {
  const match = String(text ?? "").match(/At most\s+(\d+)\s+image/i);
  if (!match) return null;
  const limit = Number(match[1]);
  return Number.isInteger(limit) ? limit : null;
}

function replaceCaption(text, caption) {
  if (text.includes(IMAGE_CAPTION.both)) return text.replace(IMAGE_CAPTION.both, caption);
  if (text.includes(IMAGE_CAPTION.chart)) return text.replace(IMAGE_CAPTION.chart, caption);
  if (text.includes(IMAGE_CAPTION.page)) return text.replace(IMAGE_CAPTION.page, caption);
  return caption ? `${text}\n${caption}` : text;
}

function captionAfterTrim(previous, kept) {
  if (kept >= 2) return IMAGE_CAPTION.both;
  if (kept !== 1) return "";
  if (previous.includes(IMAGE_CAPTION.chart) && !previous.includes(IMAGE_CAPTION.both)) return IMAGE_CAPTION.chart;
  return IMAGE_CAPTION.page;
}

/** Drop extra image_url parts and rewrite the sentence that names them. */
export function trimChatImages(body, limit) {
  const next = structuredClone(body);
  const user = next.messages?.find((message) => message.role === "user");
  if (!Array.isArray(user?.content)) return next;
  const textPart = user.content.find((part) => part?.type === "text");
  const images = user.content.filter((part) => part?.type === "image_url");
  const kept = images.slice(0, Math.max(0, limit));
  if (textPart && typeof textPart.text === "string") {
    textPart.text = replaceCaption(textPart.text, captionAfterTrim(textPart.text, kept.length));
  }
  user.content = [textPart, ...kept].filter(Boolean);
  return next;
}

export function requestImageCount(body) {
  const user = body?.messages?.find((message) => message.role === "user");
  if (!Array.isArray(user?.content)) return 0;
  return user.content.filter((part) => part?.type === "image_url").length;
}

function normalizeIssue(raw) {
  if (!raw || typeof raw !== "object") return null;
  const type = ISSUE_TYPES.has(raw.type) ? raw.type : "other";
  const severity = SEVERITIES.has(raw.severity) ? raw.severity : "medium";
  const reason = String(raw.reason ?? raw.detail ?? "").replace(/\s+/g, " ").trim().slice(0, 400);
  let confidence = Number(raw.confidence);
  if (!Number.isFinite(confidence)) confidence = 0;
  confidence = Math.min(1, Math.max(0, confidence));
  return { type, severity, reason, confidence };
}

export function parseReview(content) {
  if (content == null || String(content).trim() === "") {
    return { ok: false, issues: [], page: "", viewport: "", error: "empty model content" };
  }
  let text = String(content).trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return { ok: false, issues: [], page: "", viewport: "", error: `JSON parse failed: ${err.message}` };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, issues: [], page: "", viewport: "", error: "JSON was not an object" };
  }
  const page = typeof parsed.page === "string" ? parsed.page : "";
  const viewport = typeof parsed.viewport === "string" ? parsed.viewport : "";
  const list = Array.isArray(parsed.issues) ? parsed.issues : parsed.type ? [parsed] : [];
  const issues = list.map(normalizeIssue).filter(Boolean);
  return { ok: true, issues, page, viewport, error: null };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function retryDelayMs(attempt) {
  return Math.min(8000, 750 * 2 ** attempt);
}

export async function postChat({ baseUrl, apiKey, body, fetchImpl, attempts = 6, sleepImpl = sleep }) {
  const fetchFn = fetchImpl ?? globalThis.fetch;
  const url = `${String(baseUrl).replace(/\/$/, "")}/chat/completions`;
  const headers = { "content-type": "application/json" };
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;
  let payload = body;
  let lastErr = new Error("chat completion failed");
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const res = await fetchFn(url, { method: "POST", headers, body: JSON.stringify(payload) });
      const text = await res.text();
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`HTTP ${res.status}: ${redact(text.slice(0, 300), apiKey)}`);
        lastErr.retryable = true;
        if (attempt < attempts - 1) await sleepImpl(retryDelayMs(attempt));
        continue;
      }
      if (!res.ok) {
        const limit = imageLimitFromError(text);
        if (limit != null) {
          const trimmed = trimChatImages(payload, limit);
          if (requestImageCount(trimmed) < requestImageCount(payload)) {
            payload = trimmed;
            lastErr = new Error(`HTTP ${res.status}: ${redact(text.slice(0, 300), apiKey)}`);
            lastErr.retryable = true;
            if (attempt < attempts - 1) continue;
          }
        }
        const err = new Error(`HTTP ${res.status}: ${redact(text.slice(0, 500), apiKey)}`);
        err.retryable = false;
        throw err;
      }
      let json;
      try {
        json = JSON.parse(text);
      } catch (err) {
        const parseErr = new Error(`Response was not JSON: ${err.message}`);
        parseErr.retryable = false;
        throw parseErr;
      }
      const choice = json.choices?.[0];
      const message = choice?.message ?? {};
      const content = typeof message.content === "string" ? message.content : "";
      return {
        content,
        finishReason: choice?.finish_reason ?? "",
        usage: json.usage ?? null,
        imagesSent: requestImageCount(payload),
      };
    } catch (err) {
      if (err.retryable === false) throw err;
      lastErr = err instanceof Error ? err : new Error(String(err));
      lastErr.retryable = true;
      if (attempt < attempts - 1) await sleepImpl(retryDelayMs(attempt));
    }
  }
  throw lastErr;
}

export async function listModels({ baseUrl, apiKey, fetchImpl }) {
  const fetchFn = fetchImpl ?? globalThis.fetch;
  const url = `${String(baseUrl).replace(/\/$/, "")}/models`;
  const headers = {};
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;
  const res = await fetchFn(url, { headers });
  const text = await res.text();
  if (!res.ok) throw new Error(`GET /v1/models HTTP ${res.status}: ${redact(text.slice(0, 400), apiKey)}`);
  const json = JSON.parse(text);
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json)) return json;
  return [];
}

export function dataUri(bytes) {
  return `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;
}
