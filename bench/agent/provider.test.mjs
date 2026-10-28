import assert from "node:assert/strict";
import { test } from "node:test";
import { askModel, chatRejectedForResponses, selectProvider } from "./provider.mjs";

test("selectProvider accepts xai and rejects an unknown provider", () => {
  const missing = selectProvider({ BENCH_LLM_PROVIDER: "xai" });
  assert.equal(missing.ok, false);
  assert.match(missing.reason, /XAI_API_KEY/);
  const selected = selectProvider({ BENCH_LLM_PROVIDER: "xai", XAI_API_KEY: "local-test", BENCH_LLM_MODEL: "grok-4.7" });
  assert.equal(selected.ok, true);
  assert.equal(selected.provider, "xai");
  assert.equal(selected.model, "grok-4.7");
  const unknown = selectProvider({ BENCH_LLM_PROVIDER: "google", OPENAI_API_KEY: "x" });
  assert.equal(unknown.ok, false);
  assert.match(unknown.reason, /openai, anthropic, or xai/);
  const fallback = selectProvider({ XAI_API_KEY: "local-test" });
  assert.equal(fallback.provider, "xai");
  assert.equal(fallback.model, "grok-4.7");
});

test("xAI chat completions records prompt and completion tokens", async () => {
  const key = "xai-test-secret";
  const original = globalThis.fetch;
  let seen;
  globalThis.fetch = async (url, init) => {
    seen = { url, authorization: init.headers.authorization, body: JSON.parse(init.body) };
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({
        choices: [{ message: { content: "{\"version\":\"1\"}" } }],
        usage: { prompt_tokens: 11, completion_tokens: 7 },
      }),
    };
  };
  try {
    const reply = await askModel({ provider: "xai", model: "grok-4.7", apiKey: key }, "draw");
    assert.equal(seen.url, "https://api.x.ai/v1/chat/completions");
    assert.equal(seen.authorization, `Bearer ${key}`);
    assert.equal(seen.body.temperature, 0);
    assert.equal(seen.body.max_tokens, 4096);
    assert.equal(seen.body.model, "grok-4.7");
    assert.equal(reply.text, "{\"version\":\"1\"}");
    assert.deepEqual(reply.usage, { input_tokens: 11, output_tokens: 7 });
  } finally {
    globalThis.fetch = original;
  }
});

test("xAI input_tokens shape is accepted and the key is redacted from errors", async () => {
  const key = "xai-test-secret";
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify({
      choices: [{ message: { content: "ok" } }],
      usage: { input_tokens: 3, output_tokens: 4 },
    }),
  });
  try {
    const reply = await askModel({ provider: "xai", model: "grok-4.7", apiKey: key }, "draw");
    assert.deepEqual(reply.usage, { input_tokens: 3, output_tokens: 4 });
  } finally {
    globalThis.fetch = original;
  }
  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    text: async () => `unauthorized ${key}`,
  });
  try {
    await assert.rejects(
      () => askModel({ provider: "xai", model: "grok-4.7", apiKey: key }, "draw"),
      (error) => {
        assert.match(error.message, /xAI 401/);
        assert.equal(error.message.includes(key), false);
        return true;
      },
    );
  } finally {
    globalThis.fetch = original;
  }
});

test("a rejected gpt-6 chat completion falls back to the Responses API", async () => {
  const key = "openai-test-secret";
  const original = globalThis.fetch;
  const urls = [];
  globalThis.fetch = async (url, init) => {
    urls.push(url);
    const body = JSON.parse(init.body);
    if (String(url).endsWith("/chat/completions")) {
      return { ok: false, status: 404, text: async () => "use the responses API" };
    }
    assert.equal(body.temperature, 0);
    assert.equal(body.max_output_tokens, 4096);
    assert.equal(body.model, "gpt-6-luna");
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({
        output_text: "{\"type\":\"line\"}",
        usage: { input_tokens: 9, output_tokens: 6 },
      }),
    };
  };
  try {
    assert.equal(chatRejectedForResponses("gpt-6-luna", 404), true);
    assert.equal(chatRejectedForResponses("gpt-4o-mini", 400), false);
    const reply = await askModel({ provider: "openai", model: "gpt-6-luna", apiKey: key }, "draw");
    assert.deepEqual(urls, [
      "https://api.openai.com/v1/chat/completions",
      "https://api.openai.com/v1/responses",
    ]);
    assert.equal(reply.text, "{\"type\":\"line\"}");
    assert.deepEqual(reply.usage, { input_tokens: 9, output_tokens: 6 });
  } finally {
    globalThis.fetch = original;
  }
});

test("a non-gpt-6 chat rejection does not call the Responses API", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (url) => {
    calls += 1;
    assert.match(String(url), /chat\/completions/);
    return { ok: false, status: 400, text: async () => "bad request" };
  };
  try {
    await assert.rejects(() => askModel({ provider: "openai", model: "gpt-4o-mini", apiKey: "k" }, "draw"), /OpenAI 400/);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = original;
  }
});
