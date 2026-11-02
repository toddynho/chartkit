/** Shared drawer state for the bar island and the panel buttons. */

export type DrawerState = { kind: "panel"; index: number } | { kind: "page" } | { kind: "theme" } | null;

let drawer: DrawerState = null;
const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDrawer(): DrawerState {
  return drawer;
}

export function openDrawer(next: DrawerState): void {
  drawer = next;
  for (const listener of listeners) listener();
}
