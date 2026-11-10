export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function editMark(spec: Record<string, unknown>, edit: (mark: Record<string, unknown>) => void): void {
  const current = spec.mark;
  const mark: Record<string, unknown> = isRecord(current) ? { ...current } : {};
  edit(mark);
  if (Object.keys(mark).length) spec.mark = mark;
  else delete spec.mark;
}

export function formatNumber(value: number): string {
  return String(Math.round(value * 100) / 100);
}

export function roundStep(value: number, step: number): number {
  if (!Number.isFinite(value) || !(step > 0)) return value;
  const decimals = (step.toString().split(".")[1] ?? "").length;
  return Number((Math.round(value / step) * step).toFixed(decimals));
}

export function specText(spec: Record<string, unknown>): string {
  return JSON.stringify(spec, null, 2);
}

export type PlayHeading = {
  /** Docs card title. It replaces `spec.title` on this link. */
  title: string;
  /** Docs card subtitle. Omitted when the card has none, so a spec subtitle stays. */
  subtitle?: string;
};

/**
 * Spec encoded by an Open in playground link.
 * The card title wins when the spec already has a different title.
 * A card subtitle wins the same way. The rest of the spec, including the
 * control state, is copied through.
 */
export function withPlayHeading(spec: unknown, heading?: PlayHeading): unknown {
  if (!heading || !isRecord(spec)) return spec;
  const next: Record<string, unknown> = { ...spec };
  next.title = heading.title;
  if (heading.subtitle !== undefined) next.subtitle = heading.subtitle;
  return next;
}

/** Card heading for a docs example. The subtitle is the line under the title. */
export function cardHeading(example: { title: string; blurb: string }): PlayHeading {
  const heading: PlayHeading = { title: example.title };
  if (example.blurb.trim()) heading.subtitle = example.blurb;
  return heading;
}

/** Open in playground for one docs example, using the spec the controls have now. */
export function examplePlayHref(example: { title: string; blurb: string }, spec: unknown): string {
  return playgroundHref(withPlayHeading(spec, cardHeading(example)));
}

export function playgroundHref(spec: unknown, heading?: PlayHeading): string {
  return `/playground#${encodeURIComponent(JSON.stringify(heading ? withPlayHeading(spec, heading) : spec))}`;
}

export type PlaygroundHash = {
  spec: Record<string, unknown>;
  /** True when the hash is a share payload `{ spec, example, size, mode }`. */
  wrapped: boolean;
  example?: string;
  size?: "card" | "dashboard" | "full";
  mode?: "light" | "dark" | "auto";
};

/**
 * Spec the playground loads from a location hash.
 * A share payload uses its `spec`. A chart spec uses the object itself.
 */
export function readPlaygroundHash(hash: string): PlaygroundHash | null {
  const body = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!body) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeURIComponent(body));
  } catch {
    return null;
  }
  if (!isRecord(parsed)) return null;
  if (isRecord(parsed.spec)) {
    const size = parsed.size === "card" || parsed.size === "dashboard" || parsed.size === "full" ? parsed.size : undefined;
    const mode = parsed.mode === "light" || parsed.mode === "dark" || parsed.mode === "auto" ? parsed.mode : undefined;
    return {
      spec: parsed.spec,
      wrapped: true,
      example: typeof parsed.example === "string" ? parsed.example : undefined,
      size,
      mode,
    };
  }
  if (typeof parsed.type === "string" || parsed.version != null) {
    return { spec: parsed, wrapped: false };
  }
  return null;
}

/**
 * Load an example into the demo.
 * This copies the spec and does not run a control, so a custom tooltip object stays as the example wrote it.
 */
export function openTeachExample(spec: Record<string, unknown>): Record<string, unknown> {
  return structuredClone(spec);
}
