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

export function buildChatRequest({ model, maxTokens, shot, images }) {
  const findingText = shot.checks?.length
    ? shot.checks.map((finding) => `- ${finding.type} (${finding.severity}): ${finding.detail}`).join("\n")
    : "- none";
  const rail = shot.rail
    ? `Rail width: ${shot.rail.px}px${shot.rail.store ? "" : " (default)"}`
    : "Rail width: n/a";
  const text = [
    `Page: ${shot.page}`,
    shot.demo ? `Demo: ${shot.demo}` : null,
    `Viewport: ${shot.viewport} ${shot.viewportSize.width}×${shot.viewportSize.height}`,
    rail,
    "Deterministic findings:",
    findingText,
    "The first image is the viewport. A second image, when present, is the chart pane cropped on its own.",
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

export function estimateRequestTokens(shot, maxTokens = DEFAULT_MAX_TOKENS) {
  const body = buildChatRequest({
    model: "estimate",
    maxTokens,
    shot,
    images: (shot.images || []).map((image) => ({ dataUri: "data:image/png;base64,AA==" })),
  });
  const text = JSON.stringify({ ...body, messages: body.messages.map((message) => ({ ...message, content: message.content })) });
  let tokens = estimateTextTokens(text);
  for (const image of shot.images || []) tokens += estimateImageTokens(image.width, image.height);
  return tokens;
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

export async function postChat({ baseUrl, apiKey, body, fetchImpl, attempts = 4, sleepImpl = sleep }) {
  const fetchFn = fetchImpl ?? globalThis.fetch;
  const url = `${String(baseUrl).replace(/\/$/, "")}/chat/completions`;
  const headers = { "content-type": "application/json" };
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;
  let lastErr = new Error("chat completion failed");
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const res = await fetchFn(url, { method: "POST", headers, body: JSON.stringify(body) });
      const text = await res.text();
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`HTTP ${res.status}: ${redact(text.slice(0, 300), apiKey)}`);
        lastErr.retryable = true;
        if (attempt < attempts - 1) await sleepImpl(500 * 2 ** attempt);
        continue;
      }
      if (!res.ok) {
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
      };
    } catch (err) {
      if (err.retryable === false) throw err;
      lastErr = err instanceof Error ? err : new Error(String(err));
      lastErr.retryable = true;
      if (attempt < attempts - 1) await sleepImpl(500 * 2 ** attempt);
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
