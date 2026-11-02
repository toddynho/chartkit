/**
 * Playground links stay behind this flag.
 * Todd: there is no playground that can load a dashboard spec yet.
 * Set this to true to show "Playground ↗" in the bar and "Open in playground" in the drawer.
 */
export const SHOW_PLAYGROUND = false;

/** base64url JSON for /playground?spec= once SHOW_PLAYGROUND is on. */
export function playgroundHref(payload: string): string {
  const bytes = new TextEncoder().encode(payload);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const encoded = btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
  return `/playground?spec=${encoded}`;
}
