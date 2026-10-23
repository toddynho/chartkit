import { createHmac, timingSafeEqual } from "node:crypto";

export interface StripeConfig {
  secretKey: string;
  priceId: string;
  webhookSecret: string;
  mode: "payment" | "subscription";
}

export function stripeFromEnv(env: NodeJS.ProcessEnv = process.env): StripeConfig {
  return {
    secretKey: env.STRIPE_SECRET_KEY ?? "",
    priceId: env.STRIPE_PRICE_ID ?? "",
    webhookSecret: env.STRIPE_WEBHOOK_SECRET ?? "",
    mode: env.STRIPE_CHECKOUT_MODE === "subscription" ? "subscription" : "payment",
  };
}

export function stripeReady(config: StripeConfig): boolean {
  return Boolean(config.secretKey && config.priceId);
}

/** Creates a Checkout Session for the price Todd configures. Does not create a product or a price. */
export async function createCheckout(
  config: StripeConfig,
  origin: string,
  fetcher: typeof fetch,
): Promise<{ url: string } | { error: string; status: number }> {
  if (!config.secretKey || !config.priceId) {
    return {
      status: 503,
      error:
        "Stripe is not configured. Set STRIPE_SECRET_KEY, STRIPE_PRICE_ID, and STRIPE_WEBHOOK_SECRET. The price is a placeholder for Todd to decide. This service does not create a Stripe product or price.",
    };
  }
  const body = new URLSearchParams();
  body.set("mode", config.mode);
  body.set("line_items[0][price]", config.priceId);
  body.set("line_items[0][quantity]", "1");
  body.set("success_url", `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
  body.set("cancel_url", `${origin}/checkout/cancelled`);
  const response = await fetcher("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.secretKey}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const json = (await response.json()) as { url?: string; error?: { message?: string } };
  if (!response.ok || !json.url) {
    return { status: 502, error: json.error?.message || `Stripe returned HTTP ${response.status}.` };
  }
  return { url: json.url };
}

/** Stripe-Signature: t=unix,v1=hex. Rejects signatures older than five minutes. */
export function verifyStripe(secret: string, header: string, payload: string, now = Date.now()): boolean {
  if (!secret || !header) return false;
  const parts = new Map<string, string[]>();
  for (const piece of header.split(",")) {
    const eq = piece.indexOf("=");
    if (eq < 0) continue;
    const key = piece.slice(0, eq).trim();
    const value = piece.slice(eq + 1).trim();
    const list = parts.get(key) ?? [];
    list.push(value);
    parts.set(key, list);
  }
  const timestamp = parts.get("t")?.[0];
  const signatures = parts.get("v1") ?? [];
  if (!timestamp || signatures.length === 0) return false;
  const age = Math.abs(now / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const left = Buffer.from(expected);
  return signatures.some((signature) => {
    const right = Buffer.from(signature);
    return left.length === right.length && timingSafeEqual(left, right);
  });
}
