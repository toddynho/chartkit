/** LLM clients for the agent eval. Never log or persist API keys. */

const MAX_OUTPUT_TOKENS = 4096;
const SYSTEM = "You produce only the requested chart artifact. No prose.";

export function selectProvider(env = process.env) {
  const requested = env.BENCH_LLM_PROVIDER;
  if (requested === "openai") return requireKey(env, "openai", "OPENAI_API_KEY", env.BENCH_LLM_MODEL || "gpt-4o-mini");
  if (requested === "anthropic") return requireKey(env, "anthropic", "ANTHROPIC_API_KEY", env.BENCH_LLM_MODEL || "claude-sonnet-4-5");
  if (requested === "xai") return requireKey(env, "xai", "XAI_API_KEY", env.BENCH_LLM_MODEL || "grok-4.7");
  if (requested) return { ok: false, reason: `Unknown BENCH_LLM_PROVIDER "${requested}". Use openai, anthropic, or xai.` };
  if (env.OPENAI_API_KEY) return { ok: true, provider: "openai", model: env.BENCH_LLM_MODEL || "gpt-4o-mini", apiKey: env.OPENAI_API_KEY };
  if (env.ANTHROPIC_API_KEY) return { ok: true, provider: "anthropic", model: env.BENCH_LLM_MODEL || "claude-sonnet-4-5", apiKey: env.ANTHROPIC_API_KEY };
  if (env.XAI_API_KEY) return { ok: true, provider: "xai", model: env.BENCH_LLM_MODEL || "grok-4.7", apiKey: env.XAI_API_KEY };
  return {
    ok: false,
    reason: "not yet run: set OPENAI_API_KEY, ANTHROPIC_API_KEY, or XAI_API_KEY. Optional: BENCH_LLM_PROVIDER=openai|anthropic|xai and BENCH_LLM_MODEL.",
  };
}

function requireKey(env, provider, envName, model) {
  if (!env[envName]) return { ok: false, reason: `BENCH_LLM_PROVIDER=${provider} but ${envName} is not set` };
  return { ok: true, provider, model, apiKey: env[envName] };
}

export async function askModel(selected, prompt) {
  const key = selected?.apiKey;
  if (selected.provider === "openai") return askOpenAI(selected.model, prompt, key ?? process.env.OPENAI_API_KEY);
  if (selected.provider === "anthropic") return askAnthropic(selected.model, prompt, key ?? process.env.ANTHROPIC_API_KEY);
  if (selected.provider === "xai") return askXAI(selected.model, prompt, key ?? process.env.XAI_API_KEY);
  throw new Error(`No client for ${selected.provider}`);
}

export function usageFrom(body) {
  const usage = body?.usage ?? {};
  return {
    input_tokens: finite(usage.input_tokens ?? usage.prompt_tokens),
    output_tokens: finite(usage.output_tokens ?? usage.completion_tokens),
  };
}

function finite(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function isTransient(label, error) {
  const status = Number(String(error?.message ?? "").match(new RegExp(`^${label} (\\d+)`))?.[1]);
  if (status === 429 || status >= 500) return true;
  const message = String(error?.message ?? error);
  return /fetch failed|ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket hang up|overloaded/i.test(message);
}

async function withRetry(label, fn) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (!isTransient(label, error) || attempt >= 5) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000 * 2 ** attempt));
    }
  }
}

function clipError(label, status, text, secret) {
  let body = String(text ?? "").slice(0, 300);
  if (secret) body = body.split(secret).join("[redacted]");
  return new Error(`${label} ${status}: ${body}`);
}

async function postJson(url, key, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, text };
}

function chatBody(model, prompt) {
  return {
    model,
    temperature: 0,
    max_tokens: MAX_OUTPUT_TOKENS,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: prompt },
    ],
  };
}

function textFromChat(body) {
  return body.choices?.[0]?.message?.content ?? "";
}

/** GPT-6 ids that Chat Completions refuses are sent to the Responses API. */
export function chatRejectedForResponses(model, status) {
  return /^gpt-6/i.test(String(model ?? "")) && (status === 400 || status === 404 || status === 422);
}

function textFromResponses(body) {
  if (typeof body?.output_text === "string" && body.output_text) return body.output_text;
  const parts = [];
  for (const item of body?.output ?? []) {
    if (typeof item === "string") parts.push(item);
    if (typeof item?.text === "string") parts.push(item.text);
    const content = item?.content;
    if (typeof content === "string") parts.push(content);
    if (Array.isArray(content)) {
      for (const part of content) {
        if (typeof part?.text === "string") parts.push(part.text);
      }
    }
  }
  return parts.join("\n");
}

async function askOpenAI(model, prompt, key) {
  return withRetry("OpenAI", async () => {
    const chat = await postJson("https://api.openai.com/v1/chat/completions", key, chatBody(model, prompt));
    if (chat.ok) {
      const body = JSON.parse(chat.text);
      return { text: textFromChat(body), usage: usageFrom(body) };
    }
    if (chatRejectedForResponses(model, chat.status)) return askOpenAIResponses(model, prompt, key);
    throw clipError("OpenAI", chat.status, chat.text, key);
  });
}

async function askOpenAIResponses(model, prompt, key) {
  const response = await postJson("https://api.openai.com/v1/responses", key, {
    model,
    temperature: 0,
    max_output_tokens: MAX_OUTPUT_TOKENS,
    instructions: SYSTEM,
    input: prompt,
  });
  if (!response.ok) throw clipError("OpenAI", response.status, response.text, key);
  const body = JSON.parse(response.text);
  return { text: textFromResponses(body), usage: usageFrom(body) };
}

async function askXAI(model, prompt, key) {
  return withRetry("xAI", async () => {
    const chat = await postJson("https://api.x.ai/v1/chat/completions", key, chatBody(model, prompt));
    if (!chat.ok) throw clipError("xAI", chat.status, chat.text, key);
    const body = JSON.parse(chat.text);
    return { text: textFromChat(body), usage: usageFrom(body) };
  });
}

async function askAnthropic(model, prompt, key) {
  return withRetry("Anthropic", async () => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0,
        system: SYSTEM,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const text = await response.text();
    if (!response.ok) throw clipError("Anthropic", response.status, text, key);
    const body = JSON.parse(text);
    return {
      text: body.content?.map((part) => part.text ?? "").join("\n") ?? "",
      usage: usageFrom(body),
    };
  });
}
