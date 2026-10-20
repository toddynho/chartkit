import type { ChartSpec } from "@chartkitdev/core";
import { render } from "@chartkitdev/core/extra";

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/** Keep a `<` in the JSON from closing the script element. */
function escapeScript(json: string): string {
  return json.replace(/</g, "\\u003c");
}

/**
 * Server HTML for `<chart-kit>`. The SVG is in the first response, including
 * histogram through journey. The client entry patches that SVG instead of replacing it.
 */
export function renderToString(spec: ChartSpec): string {
  const theme = typeof spec.theme === "string" && spec.theme ? ` theme="${escapeAttr(spec.theme)}"` : "";
  const svg = render(spec);
  return `<chart-kit${theme}><script type="application/json">${escapeScript(JSON.stringify(spec))}</script>${svg}</chart-kit>`;
}
