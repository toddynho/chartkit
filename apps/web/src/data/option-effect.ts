import statusMap from "./option-effect-status.json";

export type EffectStatus = "works" | "needs-data" | "not-yet";

export type EffectEntry = { status: EffectStatus; hint?: string };

const status = statusMap as Record<string, Record<string, EffectEntry>>;

/** Area docs are a filled line. The audit keys that spec as `line`. */
export function effectType(type: string): string {
  return type === "area" ? "line" : type;
}

export function optionEffect(type: string, path: string): EffectEntry {
  return status[effectType(type)]?.[path] ?? { status: "works" };
}

export function notYetTypes(path: string): string[] {
  const types: string[] = [];
  for (const [type, fields] of Object.entries(status)) {
    if (fields[path]?.status === "not-yet") types.push(type);
  }
  return types.sort();
}

export function notYetLabel(path: string): string {
  const types = notYetTypes(path);
  if (!types.length) return "";
  const shown = types.slice(0, 8).join(", ");
  const more = types.length > 8 ? ` +${types.length - 8}` : "";
  return `Not yet on ${shown}${more}`;
}
