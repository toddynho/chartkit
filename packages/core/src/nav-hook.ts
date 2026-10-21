/**
 * Lets the interaction extra paint the overview without a static import from
 * `interact.ts` back into that chunk. The hook itself is a few lines.
 */
const painters = new WeakMap<Element, () => void>();

export function bindNavigator(host: Element, paint: () => void): void {
  painters.set(host, paint);
}

export function refreshNavigator(host: Element): void {
  painters.get(host)?.();
}

export function unbindNavigator(host: Element): void {
  painters.delete(host);
}
