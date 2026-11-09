import assert from "node:assert/strict";
import test from "node:test";
import {
  CRUSOE_PREFER,
  DEFAULT_MAX_TOKENS,
  RUBRIC,
  buildChatRequest,
  estimateImageTokens,
  isMultimodal,
  multimodalModels,
  parseReview,
  pickModel,
  postChat,
  redact,
} from "./model.mjs";

const CRUSOE = "https://api.inference.crusoecloud.com/v1";

const catalog = [
  { id: "google/gemma-4-31b-it", architecture: { modality: "multimodal" }, tags: ["image text to text"] },
  { id: "nvidia/NVIDIA-Nemotron-3.5-Super-VL", architecture: { modality: "multimodal" }, tags: ["image-text-to-text"] },
  { id: "Qwen/Qwen3.8-27B", architecture: { modality: "text" }, tags: ["image text to text"] },
  { id: "meta-llama/Llama-3.3-70B-Instruct", architecture: { modality: "text" }, tags: ["text to text"] },
];

test("multimodal means modality or an image-text-to-text tag", () => {
  assert.equal(isMultimodal(catalog[0]), true);
  assert.equal(isMultimodal(catalog[2]), true);
  assert.equal(isMultimodal(catalog[3]), false);
  assert.deepEqual(multimodalModels(catalog).map((model) => model.id), [
    "google/gemma-4-31b-it",
    "nvidia/NVIDIA-Nemotron-3.5-Super-VL",
    "Qwen/Qwen3.8-27B",
  ]);
});

test("Crusoe prefers Nemotron Super VL, then Qwen3.8, then the first multimodal model", () => {
  assert.deepEqual(pickModel(catalog, { baseUrl: CRUSOE }), {
    id: "nvidia/NVIDIA-Nemotron-3.5-Super-VL",
    reason: "crusoe-prefer",
  });
  const withoutNemotron = catalog.filter((model) => model.id !== CRUSOE_PREFER[0]);
  assert.equal(pickModel(withoutNemotron, { baseUrl: CRUSOE }).id, "Qwen/Qwen3.8-27B");
  const gemmaOnly = catalog.filter((model) => model.id.startsWith("google/"));
  assert.deepEqual(pickModel(gemmaOnly, { baseUrl: CRUSOE }), { id: "google/gemma-4-31b-it", reason: "first-multimodal" });
});

test("a non-Crusoe host uses the first multimodal model, and --model wins", () => {
  assert.equal(pickModel(catalog, { baseUrl: "http://localhost:11434/v1" }).id, "google/gemma-4-31b-it");
  assert.deepEqual(pickModel(catalog, { baseUrl: CRUSOE, explicit: "Qwen/Qwen3.8-27B" }), {
    id: "Qwen/Qwen3.8-27B",
    reason: "explicit",
  });
  assert.equal(pickModel([], { baseUrl: CRUSOE, explicit: "qwen2.5vl" }).id, "qwen2.5vl");
});

test("chat request sends base64 image_url parts, the rubric, findings, and room for reasoning", () => {
  const shot = {
    page: "/docs/charts/progress-ring",
    demo: "uptime",
    viewport: "desktop",
    viewportSize: { width: 1440, height: 900 },
    rail: { px: 380, store: false },
    checks: [{ type: "pane-scrollbar", severity: "high", detail: "scrollHeight 350 > clientHeight 228" }],
  };
  const dataUri = "data:image/png;base64,iVBORw0KGgo=";
  const body = buildChatRequest({
    model: "nvidia/NVIDIA-Nemotron-3.5-Super-VL",
    maxTokens: DEFAULT_MAX_TOKENS,
    shot,
    images: [{ dataUri }, { dataUri: "data:image/png;base64,QQ==" }],
  });
  assert.equal(body.model, "nvidia/NVIDIA-Nemotron-3.5-Super-VL");
  assert.equal(body.max_tokens, 4096);
  assert.deepEqual(body.response_format, { type: "json_object" });
  assert.equal(body.messages[0].content, RUBRIC);
  assert.match(body.messages[0].content, /clipped/);
  assert.match(body.messages[0].content, /misaligned/);
  const user = body.messages[1].content;
  assert.equal(user[0].type, "text");
  assert.match(user[0].text, /pane-scrollbar/);
  assert.match(user[0].text, /progress-ring/);
  assert.equal(user[1].type, "image_url");
  assert.equal(user[1].image_url.url, dataUri);
  assert.equal(user[2].image_url.url.startsWith("data:image/png;base64,"), true);
  assert.ok(estimateImageTokens(1440, 900) > 85);
});

test("parseReview accepts fenced JSON and a single issue object", () => {
  const fenced = parseReview('```json\n{"page":"/docs/charts/line","viewport":"desktop","issues":[{"type":"clipped","severity":"high","reason":"The ring is cut off.","confidence":0.8}]}\n```');
  assert.equal(fenced.ok, true);
  assert.equal(fenced.page, "/docs/charts/line");
  assert.equal(fenced.issues[0].type, "clipped");
  assert.equal(fenced.issues[0].confidence, 0.8);
  const single = parseReview('{"type":"empty","severity":"low","reason":"Blank.","confidence":2}');
  assert.equal(single.issues[0].severity, "low");
  assert.equal(single.issues[0].confidence, 1);
  const empty = parseReview('{"page":"p","viewport":"mobile","issues":[]}');
  assert.deepEqual(empty.issues, []);
  assert.equal(parseReview("not json").ok, false);
  assert.equal(parseReview("").ok, false);
});

test("postChat retries 503s and does not echo the key", async () => {
  let calls = 0;
  const seen = [];
  const fetchImpl = async (url, init) => {
    calls += 1;
    seen.push({ url, init });
    if (calls < 3) return new Response("busy secret-key", { status: 503 });
    return new Response(
      JSON.stringify({
        choices: [{ finish_reason: "stop", message: { content: '{"page":"p","viewport":"desktop","issues":[]}' } }],
        usage: { prompt_tokens: 11, completion_tokens: 4 },
      }),
      { status: 200 },
    );
  };
  const result = await postChat({
    baseUrl: CRUSOE,
    apiKey: "secret-key",
    body: { model: "google/gemma-4-31b-it", messages: [] },
    fetchImpl,
    sleepImpl: async () => {},
  });
  assert.equal(calls, 3);
  assert.equal(seen[0].url, `${CRUSOE}/chat/completions`);
  assert.equal(seen[0].init.headers.authorization, "Bearer secret-key");
  assert.equal(seen[0].init.method, "POST");
  assert.equal(result.finishReason, "stop");
  assert.match(result.content, /"issues":\[\]/);
  assert.equal(redact("secret-key leaked", "secret-key").includes("secret-key"), false);
});
