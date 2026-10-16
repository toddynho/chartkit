export function selectProvider(env = process.env) {
  const requested = env.BENCH_LLM_PROVIDER;
  if (requested === "openai") {
    if (!env.OPENAI_API_KEY) return { ok: false, reason: "BENCH_LLM_PROVIDER=openai but OPENAI_API_KEY is not set" };
    return { ok: true, provider: "openai", model: env.BENCH_LLM_MODEL || "gpt-4o-mini" };
  }
  if (requested === "anthropic") {
    if (!env.ANTHROPIC_API_KEY) return { ok: false, reason: "BENCH_LLM_PROVIDER=anthropic but ANTHROPIC_API_KEY is not set" };
    return { ok: true, provider: "anthropic", model: env.BENCH_LLM_MODEL || "claude-sonnet-4-5" };
  }
  if (requested) return { ok: false, reason: `Unknown BENCH_LLM_PROVIDER "${requested}". Use openai or anthropic.` };
  if (env.OPENAI_API_KEY) return { ok: true, provider: "openai", model: env.BENCH_LLM_MODEL || "gpt-4o-mini" };
  if (env.ANTHROPIC_API_KEY) return { ok: true, provider: "anthropic", model: env.BENCH_LLM_MODEL || "claude-sonnet-4-5" };
  return {
    ok: false,
    reason: "not yet run: set OPENAI_API_KEY or ANTHROPIC_API_KEY. Optional: BENCH_LLM_PROVIDER=openai|anthropic and BENCH_LLM_MODEL.",
  };
}

export async function askModel(selected, prompt) {
  if (selected.provider === "openai") return askOpenAI(selected.model, prompt, process.env.OPENAI_API_KEY);
  if (selected.provider === "anthropic") return askAnthropic(selected.model, prompt, process.env.ANTHROPIC_API_KEY);
  throw new Error(`No client for ${selected.provider}`);
}

async function askOpenAI(model, prompt, key) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        { role: "system", content: "You produce only the requested chart artifact. No prose." },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${(await response.text()).slice(0, 300)}`);
  const body = await response.json();
  return body.choices?.[0]?.message?.content ?? "";
}

async function askAnthropic(model, prompt, key) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      temperature: 0,
      system: "You produce only the requested chart artifact. No prose.",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok) throw new Error(`Anthropic ${response.status}: ${(await response.text()).slice(0, 300)}`);
  const body = await response.json();
  return body.content?.map((part) => part.text ?? "").join("\n") ?? "";
}
