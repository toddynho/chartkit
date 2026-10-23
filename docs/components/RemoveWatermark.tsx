"use client";

import { useState } from "react";

export function RemoveWatermark({ action }: { action: string }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function checkout() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(action, { method: "POST" });
      const body = (await response.json()) as { url?: string; error?: string };
      if (body.url) {
        window.location.href = body.url;
        return;
      }
      setMessage(body.error || "Checkout did not return a URL.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="actions">
      <button className="btn btn-primary" type="button" onClick={checkout} disabled={pending}>
        {pending ? "Contacting Stripe..." : "Remove the watermark"}
      </button>
      <p className="cloud-status" role="status">
        {message}
      </p>
    </div>
  );
}
