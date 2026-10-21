/**
 * Lets the interaction extra paint the overview without a static import from
 * `interact.ts` back into that chunk. The painter sits on the host element.
 * A module-level map would split in two when the interact bundle and the extra
 * bundle each inline this file.
 */
const PAINTER = "__ckNavigator";

type Host = Element & { [PAINTER]?: () => void };

export function bindNavigator(host: Element, paint: () => void): void {
  (host as Host)[PAINTER] = paint;
}

export function refreshNavigator(host: Element): void {
  (host as Host)[PAINTER]?.();
}

export function unbindNavigator(host: Element): void {
  delete (host as Host)[PAINTER];
}
