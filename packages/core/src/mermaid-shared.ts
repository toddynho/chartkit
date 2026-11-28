/** Helpers shared by the base Mermaid parser and the phase-4 chunk. */

export interface ImportWarning {
  code: string;
  severity: "warning";
  message: string;
  path: string;
}

export interface Meta {
  title?: string;
  accTitle?: string;
  accDescr?: string;
}

export function warn(code: string, message: string, path: string): ImportWarning {
  return { code, severity: "warning", message, path };
}

export function parseTitle(line: string): string | null {
  const match = line.match(/^title\b\s*(.*)$/i);
  if (!match) return null;
  return unquote(match[1].trim());
}

export function unquote(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) return value.slice(1, -1);
  return value;
}

export function dropDirective(line: string, warnings: ImportWarning[]): boolean {
  if (/^(click|style|classDef|class)\b/i.test(line) || /\bhref\b/i.test(line)) {
    warnings.push(warn("CK8004", `Dropped "${clipText(line)}". Links and styles are not copied into the chart.`, ""));
    return true;
  }
  return false;
}

/** `accDescr` is the author's alt and wins. Otherwise the title (accTitle first) leads the factual sentence once. */
export function chooseAlt(meta: Meta, title: string | undefined, factual: string, cap?: boolean): string {
  const described = (meta.accDescr || "").trim();
  if (described.length >= 10) return described;
  const lead = described || (meta.accTitle || title || "").trim().replace(/[.:]+$/, "");
  const alt = lead ? `${lead}${described ? "." : ":"} ${factual}` : cap ? factual[0].toUpperCase() + factual.slice(1) : factual;
  return alt.length >= 10 ? alt : `${alt} Values are plotted.`;
}

export function capList<T>(items: T[], max: number, warnings: ImportWarning[], what: string): T[] {
  if (items.length <= max) return items;
  warnings.push(warn("CK8002", `${what} has ${items.length} points; kept the first ${max}.`, "/data"));
  return items.slice(0, max);
}

export function clipText(value: string): string {
  return value.length > 80 ? `${value.slice(0, 77)}...` : value;
}
