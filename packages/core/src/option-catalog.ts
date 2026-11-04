/**
 * Playground option catalog.
 *
 * Controls are generated from schema/chartkit.schema.json (the same document
 * the docs options reference and the validator describe). Mark applicability
 * comes from MARK_APPLIES. Channel, axis, legend, and metric scope is a small
 * typed overlay so a chart only lists options that apply to it. The browser
 * bundle reads the generated catalog, not the chart renderers.
 */
import { MARK_APPLIES } from "./marks";
import { CANVAS_TYPES } from "./render-mode";
import catalogJson from "./generated/option-catalog.json";

export const OPTION_GROUPS = [
  "Data / Encoding",
  "Marks & style",
  "Axes",
  "Labels",
  "Legend",
  "Tooltip & interaction",
  "Colors & theme",
  "Layout & size",
  "Annotations",
  "Accessibility",
  "Advanced",
] as const;

export type OptionGroup = (typeof OPTION_GROUPS)[number];

export type OptionControl = "boolean" | "enum" | "number" | "text" | "color" | "json";

export type OptionStorage = "scalar" | "union-boolean" | "union-enum" | "union-text" | "union-number";

export interface OptionField {
  path: string;
  label: string;
  description: string;
  group: OptionGroup;
  control: OptionControl;
  storage: OptionStorage;
  /** Object key that stores the scalar form when the spec value is an object. */
  promote?: string;
  /** The schema also allows an array at this path. The editor falls back to JSON. */
  arrayAlt?: boolean;
  coerce?: "number" | "integer" | "number-or-string" | "boolean-or-string";
  enumValues?: string[];
  minimum?: number;
  maximum?: number;
  slider?: boolean;
  /** Schema default, or a typed implication for a boolean union. Omitted from the spec until edited. */
  defaultValue?: string | number | boolean;
  /** Missing means the option applies to every chart type. */
  appliesTo?: string[];
  /** Shown before the More expander. Curated from paths the docs examples set. */
  essential?: boolean;
  docs: string;
}

export interface OptionState {
  value: unknown;
  /** The spec stores a value here, distinct from merely showing the default. */
  set: boolean;
  /** Object or array the scalar control cannot edit. */
  complex: boolean;
}

interface SchemaNode {
  $ref?: string;
  type?: string | string[];
  const?: unknown;
  enum?: unknown[];
  description?: string;
  default?: unknown;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  properties?: Record<string, SchemaNode>;
  items?: SchemaNode;
  oneOf?: SchemaNode[];
  anyOf?: SchemaNode[];
  allOf?: SchemaNode[];
  $defs?: Record<string, SchemaNode>;
}

const LABEL_MARKS = new Set(["labels", "labelPosition", "labelFormat", "labelEnds", "stackTotal", "baseLabel", "binLabel"]);
const COLOR_MARKS = new Set(["palette", "colorRules"]);

/** Types that paint `axes`. Sparkline and mini-area hide them. */
const AXIS_TYPES = [
  "line",
  "bar",
  "stacked-area",
  "combo",
  "scatter",
  "spike",
  "candlestick",
  "histogram",
  "boxplot",
  "waterfall",
  "area-range",
  "bar-range",
  "errorbar",
  "strip",
];

/** Types that do not paint `legend`. */
const NO_LEGEND = new Set(["sparkline", "mini-area", "gauge", "kpi", "bar-list"]);

const METRIC_TYPES = ["gauge", "kpi", "progress-ring"];

/**
 * Encoding channels each chart type reads. Nested fields under a channel
 * inherit this list, then the path overlay below can narrow it further.
 */
const CHANNEL_APPLIES: Record<string, readonly string[]> = {
  x: ["line", "bar", "donut", "pie", "stacked-area", "scatter", "combo", "heatmap", "histogram", "boxplot", "radar", "funnel", "treemap", "bullet", "waterfall", "area-range", "bar-range", "errorbar", "sunburst", "radial-bar", "rose", "spike", "candlestick", "bar-list", "strip", "gantt", "timeline", "quadrant", "journey"],
  y: ["line", "bar", "donut", "pie", "stacked-area", "scatter", "combo", "boxplot", "radar", "funnel", "treemap", "bullet", "waterfall", "area-range", "bar-range", "errorbar", "radial-bar", "rose", "sankey", "histogram", "spike", "sunburst", "bar-list", "strip", "gantt", "quadrant", "journey"],
  series: ["line", "bar", "stacked-area", "scatter", "combo", "heatmap", "radar", "pie", "donut"],
  color: ["line", "bar", "donut", "pie", "stacked-area", "scatter", "combo", "heatmap", "treemap", "sunburst", "funnel", "sankey", "radar", "strip", "gantt", "timeline", "quadrant", "choropleth", "map-points"],
  label: ["strip"],
  size: ["scatter", "quadrant", "map-points"],
  open: ["candlestick", "gantt", "timeline"],
  high: ["candlestick", "area-range", "bar-range", "errorbar"],
  low: ["candlestick", "area-range", "bar-range", "errorbar"],
  close: ["candlestick", "gantt", "timeline"],
  volume: ["candlestick"],
  source: ["sankey", "gantt"],
  target: ["sankey", "bullet", "gantt"],
  error: ["errorbar"],
  path: ["treemap", "sunburst"],
  id: ["treemap", "sunburst"],
  parent: ["treemap", "sunburst"],
};

/**
 * Continuous x. Category bands (bar, pie, waterfall) keep the field and drop
 * type, format, and scale. Strip's x is the numeric axis.
 */
const X_POSITION = ["line", "stacked-area", "scatter", "combo", "sparkline", "mini-area", "histogram", "strip"];

/**
 * Numeric y position: an axis or a radius. Slice size, flow, and group
 * fields are not a position scale.
 */
const Y_POSITION = ["line", "bar", "stacked-area", "combo", "scatter", "spike", "candlestick", "histogram", "boxplot", "waterfall", "area-range", "bar-range", "errorbar", "bullet", "radar", "radial-bar", "rose"];

/** Sequential color. Categorical color stays on the channel field. */
const COLOR_SCALE = ["heatmap", "choropleth"];

/** Charts whose SVG references a theme token. Geo bakes colours and is omitted. */
const PAINTED = [
  "line",
  "bar",
  "donut",
  "pie",
  "stacked-area",
  "scatter",
  "combo",
  "heatmap",
  "gauge",
  "kpi",
  "sparkline",
  "mini-area",
  "progress-ring",
  "spike",
  "candlestick",
  "histogram",
  "boxplot",
  "radar",
  "funnel",
  "treemap",
  "sankey",
  "bullet",
  "waterfall",
  "area-range",
  "bar-range",
  "errorbar",
  "sunburst",
  "bar-list",
  "radial-bar",
  "rose",
  "strip",
  "gantt",
  "timeline",
  "quadrant",
  "venn",
  "journey",
];

function except(drop: readonly string[]): string[] {
  const skip = new Set(drop);
  return PAINTED.filter((type) => !skip.has(type));
}

/** Paths narrower than the section they live in. Descendants inherit the longest matching prefix. */
const PATH_APPLIES: Record<string, readonly string[]> = {
  "encoding.y.lo": ["area-range", "bar-range", "combo", "errorbar"],
  "encoding.y.hi": ["area-range", "bar-range", "combo", "errorbar"],
  "encoding.y.error": ["errorbar"],
  "encoding.y.mark": ["combo"],
  "encoding.y.axis": ["line", "bar", "combo", "stacked-area", "scatter"],
  "encoding.y.stack": ["bar", "stacked-area", "combo", "line"],
  "encoding.y.area": ["line", "combo"],
  "encoding.y.dash": ["line", "combo", "stacked-area"],
  "encoding.y.pointShape": ["line", "scatter", "combo", "stacked-area"],
  "encoding.y.pointSize": ["line", "scatter", "combo", "stacked-area", "errorbar"],
  "encoding.y.pointFill": ["line", "scatter", "combo", "stacked-area"],
  "encoding.y.fillOpacity": ["line", "combo", "stacked-area", "bar"],
  "encoding.y.color": ["line", "bar", "combo", "stacked-area", "scatter"],
  "encoding.y.z": ["line", "bar", "scatter", "combo", "stacked-area"],
  "encoding.x.type": X_POSITION,
  "encoding.x.format": X_POSITION,
  "encoding.x.scale": X_POSITION,
  "encoding.x.title": AXIS_TYPES,
  "encoding.y.type": Y_POSITION,
  "encoding.y.format": Y_POSITION,
  "encoding.y.scale": Y_POSITION,
  "encoding.y.title": AXIS_TYPES,
  "encoding.color.type": COLOR_SCALE,
  "encoding.color.title": COLOR_SCALE,
  "encoding.color.format": COLOR_SCALE,
  "encoding.color.scale": COLOR_SCALE,
  "encoding.color.range": COLOR_SCALE,
  // Series is a category split. Nothing paints a series type, format, or scale.
  "encoding.series.type": [],
  "encoding.series.format": [],
  "encoding.series.scale": [],
  render: [...CANVAS_TYPES],
  "theme.tokens.background": except(["kpi", "bar-list"]),
  "theme.tokens.surface": ["gauge", "kpi", "quadrant", "sankey", "timeline", "venn"],
  "theme.tokens.text": PAINTED,
  "theme.tokens.muted": PAINTED,
  "theme.tokens.grid": ["line", "bar", "stacked-area", "combo", "scatter", "boxplot", "histogram", "area-range", "bar-range", "errorbar", "waterfall", "strip", "radial-bar", "rose", "radar", "candlestick", "kpi"],
  "theme.tokens.axis": ["line", "bar", "stacked-area", "combo", "boxplot", "histogram", "strip", "area-range", "bar-range", "errorbar", "waterfall", "spike", "gantt", "journey", "quadrant", "radar", "heatmap", "timeline"],
  "theme.tokens.accent": ["gantt", "quadrant", "strip", "timeline", "waterfall", "gauge", "choropleth", "map-points"],
  "theme.tokens.positive": ["candlestick", "gantt", "journey", "quadrant", "waterfall", "kpi", "line", "bar", "stacked-area", "combo", "sparkline", "mini-area"],
  "theme.tokens.negative": ["candlestick", "gantt", "journey", "quadrant", "waterfall", "kpi", "line", "bar", "stacked-area", "combo", "sparkline", "mini-area"],
  "theme.tokens.series": except(["candlestick", "waterfall", "gauge"]),
  "interaction.navigator": ["line", "bar", "stacked-area", "scatter", "combo", "candlestick", "area-range", "sparkline", "mini-area", "spike"],
  /**
   * Instants on a position axis. Calendar-day charts (heatmap, gantt, timeline)
   * keep the civil date and do not shift it into the previous evening.
   * Metric, part-to-whole, and flow charts have no time axis.
   */
  timezone: ["line", "bar", "stacked-area", "scatter", "combo", "sparkline", "mini-area", "spike", "candlestick", "area-range"],
  /**
   * Repair-only. polar on bar becomes radial-bar; on pie or donut it becomes rose.
   * radial-bar and rose are already polar, and cartesian is repaired back to polar.
   * Every other type drops the value (CK3077). It is not a second paint mode.
   */
  "layout.coordinate": ["bar", "pie", "donut", "radial-bar", "rose"],
};

/** Boolean unions whose omitted value is on or off. Schema defaults win when present. */
const IMPLIED_DEFAULTS: Record<string, string | number | boolean> = {
  legend: true,
  tooltip: true,
  "axes.x": true,
  "axes.y": true,
  "axes.y2": false,
  animation: false,
};

/** Chart types accepted beside the schema enum. Same list as walker.ts DEFERRED_TYPES. */
const EXTRA_TYPES = ["gantt", "timeline", "quadrant", "venn", "journey", "choropleth", "map-points"];

const SKIP = new Set(["version", "$schema", "data"]);

/**
 * Options the docs examples actually set, plus the one or two knobs those
 * examples are built around (curve, legend, strip summary). Roughly 3–8 per
 * section. Everything else stays behind More options.
 */
const ESSENTIAL = new Set<string>([
  "encoding.x",
  "encoding.y",
  "encoding.series",
  "encoding.color",
  "encoding.size",
  "encoding.label",
  "metric.value",
  "metric.label",
  "mark.curve",
  "mark.points",
  "mark.area",
  "mark.stack",
  "mark.orientation",
  "mark.summary",
  "mark.band",
  "mark.jitter",
  "axes.x",
  "axes.y",
  "axes.x.title",
  "axes.y.title",
  "axes.y.grid",
  "axes.y.format",
  "mark.labels",
  "mark.labelPosition",
  "mark.labelFormat",
  "mark.labelEnds",
  "axes.x.labels",
  "axes.y.labels",
  "legend",
  "legend.position",
  "legend.title",
  "legend.orient",
  "tooltip",
  "tooltip.mode",
  "interaction.hover",
  "interaction.zoom",
  "interaction.pan",
  "interaction.select",
  "theme",
  "theme.mode",
  "theme.brand",
  "mark.palette",
  "mark.colorRules",
  "size.width",
  "size.height",
  "size.padding",
  "layout.direction",
  "layout.coordinate",
  "annotations",
  "a11y.alt",
  "a11y.description",
  "a11y.keyboard",
  "a11y.dataTable",
  "type",
  "title",
  "subtitle",
  "locale",
  "render",
  "transform",
]);

const CHANNEL_LABEL: Record<string, string> = {
  x: "X field",
  y: "Y field",
  series: "Series field",
  color: "Color field",
  size: "Size field",
  open: "Open field",
  high: "High field",
  low: "Low field",
  close: "Close field",
  volume: "Volume field",
  source: "Source field",
  target: "Target field",
  error: "Error field",
  label: "Label field",
  path: "Path fields",
  id: "Id field",
  parent: "Parent field",
};

interface Flat {
  types: Set<string>;
  enums: string[];
  consts: string[];
  boolean: boolean;
  number: boolean;
  integer: boolean;
  string: boolean;
  array: boolean;
  props?: Record<string, SchemaNode>;
  minimum?: number;
  maximum?: number;
  color: boolean;
  description?: string;
  defaultValue?: string | number | boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function scalarDefault(value: unknown): string | number | boolean | undefined {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  return undefined;
}

function brief(text: string | undefined): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= 240) return clean;
  const cut = clean.slice(0, 240);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
  if (stop > 80) return cut.slice(0, stop + 1);
  const word = cut.lastIndexOf(" ");
  return `${cut.slice(0, word > 40 ? word : 240)}…`;
}

function humanize(path: string, key: string, storage: OptionStorage): string {
  if (storage === "union-boolean" && ["legend", "tooltip", "x", "y", "y2", "navigator"].includes(key)) return "Show";
  if (storage === "union-boolean" && ["animation", "hover", "pan"].includes(key)) return "On";
  if (path.startsWith("encoding.") && path.split(".").length === 2 && CHANNEL_LABEL[key]) return CHANNEL_LABEL[key];
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ");
  if (spaced.length === 0) return path;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function groupFor(path: string): OptionGroup {
  const [head, second] = path.split(".");
  if (head === "annotations") return "Annotations";
  if (head === "a11y") return "Accessibility";
  if (head === "size" || head === "layout") return "Layout & size";
  if (head === "tooltip" || head === "interaction" || head === "animation" || head === "motion") return "Tooltip & interaction";
  if (head === "theme") return "Colors & theme";
  if (head === "legend") return "Legend";
  if (head === "axes" && (second === "x" || second === "y" || second === "y2") && path.endsWith(".labels")) return "Labels";
  if (head === "axes") return "Axes";
  if (head === "mark" && second && COLOR_MARKS.has(second)) return "Colors & theme";
  if (head === "mark" && second && LABEL_MARKS.has(second)) return "Labels";
  if (head === "mark") return "Marks & style";
  if (head === "encoding" || head === "metric") return "Data / Encoding";
  return "Advanced";
}

function intersect(current: readonly string[] | undefined, next: readonly string[]): string[] | undefined {
  if (!current) return [...next];
  const allow = new Set(next);
  return current.filter((type) => allow.has(type));
}

function appliesTo(path: string, everyType: readonly string[]): string[] | undefined {
  const parts = path.split(".");
  let list: string[] | undefined;
  if (parts[0] === "mark" && parts[1] && MARK_APPLIES[parts[1]]) list = intersect(list, MARK_APPLIES[parts[1]]);
  if (parts[0] === "encoding" && parts[1] && CHANNEL_APPLIES[parts[1]]) list = intersect(list, CHANNEL_APPLIES[parts[1]]);
  if (parts[0] === "axes") list = intersect(list, AXIS_TYPES);
  if (parts[0] === "legend") list = intersect(list, everyType.filter((type) => !NO_LEGEND.has(type)));
  if (parts[0] === "metric") list = intersect(list, METRIC_TYPES);
  const narrow = Object.keys(PATH_APPLIES)
    .filter((prefix) => path === prefix || path.startsWith(`${prefix}.`))
    .sort((a, b) => b.length - a.length)[0];
  if (narrow) list = intersect(list, PATH_APPLIES[narrow] ?? []);
  return list;
}

function colorPath(path: string, key: string, ref: string | undefined): boolean {
  if (ref?.endsWith("/color")) return true;
  if (key === "color") return true;
  if (path === "theme.brand") return true;
  if (path.startsWith("theme.tokens.") && !["fontFamily", "fontSize", "series"].includes(key)) return true;
  return false;
}

export function buildOptionCatalog(schema: SchemaNode): OptionField[] {
  const defs = schema.$defs ?? {};
  const fields = new Map<string, OptionField>();
  const visited = new Set<string>();

  function deref(node: SchemaNode | undefined, guard = 0): SchemaNode {
    if (!node || guard > 8) return node ?? {};
    if (node.allOf?.length) {
      const merged: SchemaNode = { ...node };
      delete merged.allOf;
      for (const part of node.allOf) {
        const child = deref(part, guard + 1);
        merged.properties = { ...child.properties, ...merged.properties };
        merged.oneOf = [...(merged.oneOf ?? []), ...(child.oneOf ?? [])];
        merged.anyOf = [...(merged.anyOf ?? []), ...(child.anyOf ?? [])];
        if (!merged.type && child.type) merged.type = child.type;
        if (!merged.enum && child.enum) merged.enum = child.enum;
        if (merged.default === undefined && child.default !== undefined) merged.default = child.default;
        if (!merged.description && child.description) merged.description = child.description;
      }
      return deref(merged, guard + 1);
    }
    if (!node.$ref) return node;
    const name = node.$ref.replace("#/$defs/", "");
    const base = deref(defs[name], guard + 1);
    const local: SchemaNode = { ...node };
    delete local.$ref;
    return { ...base, ...local, description: local.description || base.description, default: local.default !== undefined ? local.default : base.default };
  }

  function absorb(flat: Flat, node: SchemaNode | undefined): void {
    const resolved = deref(node);
    if (resolved.const !== undefined && (typeof resolved.const === "string" || typeof resolved.const === "number")) {
      flat.consts.push(String(resolved.const));
    }
    if (Array.isArray(resolved.enum)) {
      for (const item of resolved.enum) {
        if (typeof item === "string" || typeof item === "number") flat.enums.push(String(item));
      }
    }
    const types = Array.isArray(resolved.type) ? resolved.type : resolved.type ? [resolved.type] : [];
    for (const type of types) {
      flat.types.add(type);
      if (type === "boolean") flat.boolean = true;
      if (type === "number") flat.number = true;
      if (type === "integer") {
        flat.integer = true;
        flat.number = true;
      }
      if (type === "string") flat.string = true;
      if (type === "array") flat.array = true;
    }
    if (typeof resolved.minimum === "number") flat.minimum = resolved.minimum;
    else if (typeof resolved.exclusiveMinimum === "number" && flat.minimum === undefined) flat.minimum = resolved.exclusiveMinimum;
    if (typeof resolved.maximum === "number") flat.maximum = resolved.maximum;
    else if (typeof resolved.exclusiveMaximum === "number" && flat.maximum === undefined) flat.maximum = resolved.exclusiveMaximum;
    if (resolved.properties) flat.props = { ...flat.props, ...resolved.properties };
    const own = scalarDefault(resolved.default);
    if (own !== undefined && flat.defaultValue === undefined) flat.defaultValue = own;
    if (!flat.description && resolved.description) flat.description = resolved.description;
  }

  function flatten(node: SchemaNode | undefined, key: string, path: string): Flat {
    const flat: Flat = { types: new Set(), enums: [], consts: [], boolean: false, number: false, integer: false, string: false, array: false, color: colorPath(path, key, node?.$ref), description: node?.description, defaultValue: scalarDefault(node?.default) };
    const branches = [deref(node)];
    const queue = [...branches];
    const seen = new Set<SchemaNode>();
    while (queue.length) {
      const current = queue.shift();
      if (!current || seen.has(current)) continue;
      seen.add(current);
      const resolved = deref(current);
      absorb(flat, resolved);
      for (const list of [resolved.oneOf, resolved.anyOf]) {
        if (!list) continue;
        for (const branch of list) queue.push(deref(branch));
      }
    }
    flat.enums = [...new Set(flat.enums)];
    flat.consts = [...new Set(flat.consts)];
    if (flat.color) flat.string = true;
    return flat;
  }

  function push(field: OptionField): void {
    if (field.appliesTo && field.appliesTo.length === 0) return;
    if (ESSENTIAL.has(field.path)) field.essential = true;
    if (!fields.has(field.path)) fields.set(field.path, field);
  }

  function walk(node: SchemaNode | undefined, path: string, key: string, everyType: readonly string[]): void {
    if (!path || visited.has(path) || SKIP.has(path)) return;
    visited.add(path);
    const flat = flatten(node, key, path);
    const scope = appliesTo(path, everyType);
    const description = brief(flat.description) || `Option ${path}.`;
    const docs = `/docs/options#${path}`;
    const base = { path, description, group: groupFor(path), docs, appliesTo: scope };

    const enumValues = [...new Set([...flat.enums, ...flat.consts])];
    const hasObject = Boolean(flat.props && Object.keys(flat.props).length > 0);
    const scalar = flat.boolean || flat.number || flat.string || enumValues.length > 0;

    if (hasObject && scalar) {
      let storage: OptionStorage = "union-text";
      let control: OptionControl = "text";
      let promote: string | undefined;
      let coerce: OptionField["coerce"];
      if (flat.boolean && !enumValues.length) {
        storage = "union-boolean";
        control = "boolean";
        if (flat.props?.show) promote = "show";
      } else if (enumValues.length > 0 && !flat.boolean) {
        storage = "union-enum";
        control = "enum";
        if (flat.props?.preset) promote = "preset";
        else if (flat.props?.style) promote = "style";
      } else if (flat.number && !flat.string && enumValues.length === 0) {
        storage = "union-number";
        control = "number";
        coerce = flat.integer ? "integer" : "number";
        if (flat.props?.threshold) promote = "threshold";
      } else if (flat.props?.field) {
        storage = "union-text";
        control = flat.color ? "color" : "text";
        promote = "field";
      }
      const implied = IMPLIED_DEFAULTS[path];
      const showDefault = promote === "show" ? scalarDefault(deref(flat.props?.show).default) : undefined;
      const defaultValue = flat.defaultValue !== undefined ? flat.defaultValue : showDefault !== undefined ? showDefault : implied;
      push({
        ...base,
        label: humanize(path, key, storage),
        control,
        storage,
        promote,
        arrayAlt: flat.array || undefined,
        coerce,
        enumValues: control === "enum" ? enumValues : undefined,
        minimum: flat.minimum,
        maximum: flat.maximum,
        slider: typeof flat.minimum === "number" && typeof flat.maximum === "number",
        defaultValue,
      });
      const props = flat.props ?? {};
      for (const [childKey, child] of Object.entries(props)) {
        if (childKey === promote) continue;
        walk(child, `${path}.${childKey}`, childKey, everyType);
      }
      return;
    }

    if (flat.array && !scalar) {
      push({ ...base, label: humanize(path, key, "scalar"), control: "json", storage: "scalar" });
      return;
    }

    if (flat.array && scalar) {
      // Number-or-token-or-array (tick lists) and token-or-array (weekend bands) are not one control.
      if (flat.consts.length > 0 || (flat.number && enumValues.length > 0)) {
        push({ ...base, label: humanize(path, key, "scalar"), control: "json", storage: "scalar" });
        return;
      }
      const control: OptionControl = flat.color ? "color" : enumValues.length ? "enum" : flat.boolean ? "boolean" : flat.number ? "number" : "text";
      push({
        ...base,
        label: humanize(path, key, "scalar"),
        control,
        storage: "scalar",
        arrayAlt: true,
        enumValues: control === "enum" ? enumValues : undefined,
        coerce: flat.number ? (flat.integer ? "integer" : "number-or-string") : undefined,
        minimum: flat.minimum,
        maximum: flat.maximum,
        slider: control === "number" && typeof flat.minimum === "number" && typeof flat.maximum === "number",
        defaultValue: flat.defaultValue,
      });
      return;
    }

    if (hasObject) {
      const props = flat.props ?? {};
      for (const [childKey, child] of Object.entries(props)) walk(child, `${path}.${childKey}`, childKey, everyType);
      return;
    }

    if (flat.boolean && enumValues.length > 0) {
      push({
        ...base,
        label: humanize(path, key, "scalar"),
        control: "enum",
        storage: "scalar",
        coerce: "boolean-or-string",
        enumValues: [...new Set(["true", "false", ...enumValues])],
        defaultValue: flat.defaultValue === undefined ? undefined : flat.defaultValue === true ? "true" : flat.defaultValue === false ? "false" : flat.defaultValue,
      });
      return;
    }

    if (enumValues.length > 0 && flat.number && flat.consts.length > 0 && !flat.enums.length) {
      push({
        ...base,
        label: humanize(path, key, "scalar"),
        control: "text",
        storage: "scalar",
        coerce: "number-or-string",
        defaultValue: flat.defaultValue,
        description: description || `Number, or ${flat.consts.join(" or ")}.`,
      });
      return;
    }

    let control: OptionControl = "text";
    let coerce: OptionField["coerce"];
    if (flat.boolean) control = "boolean";
    else if (enumValues.length > 0) control = "enum";
    else if (flat.color) control = "color";
    else if (flat.number) {
      control = "number";
      coerce = flat.integer ? "integer" : "number";
    } else if (!flat.string && flat.types.size === 0) {
      push({ ...base, label: humanize(path, key, "scalar"), control: "json", storage: "scalar" });
      return;
    }

    const implied = control === "boolean" ? IMPLIED_DEFAULTS[path] : undefined;
    push({
      ...base,
      label: humanize(path, key, "scalar"),
      control,
      storage: "scalar",
      coerce,
      enumValues: control === "enum" ? enumValues : undefined,
      minimum: flat.minimum,
      maximum: flat.maximum,
      slider: control === "number" && typeof flat.minimum === "number" && typeof flat.maximum === "number",
      defaultValue: flat.defaultValue !== undefined ? flat.defaultValue : typeof implied === "boolean" ? implied : undefined,
    });
  }

  const typeEnum = schema.properties?.type?.enum?.filter((item): item is string => typeof item === "string") ?? [];
  const everyType = [...new Set([...typeEnum, ...EXTRA_TYPES])];
  for (const [key, child] of Object.entries(schema.properties ?? {})) {
    if (SKIP.has(key)) continue;
    walk(child, key, key, everyType);
  }
  const typeField = fields.get("type");
  if (typeField) {
    const values = new Set(typeField.enumValues ?? []);
    for (const extra of EXTRA_TYPES) values.add(extra);
    typeField.enumValues = [...values];
  }
  return [...fields.values()];
}

export const optionCatalog: readonly OptionField[] = catalogJson as OptionField[];

const byPath = new Map(optionCatalog.map((field) => [field.path, field]));

export function optionsForType(type: string, fields: readonly OptionField[] = optionCatalog): OptionField[] {
  return fields.filter((field) => !field.appliesTo || field.appliesTo.includes(type));
}

export function optionCoverage(
  types: readonly string[],
  source: readonly OptionField[] = optionCatalog,
): { type: string; total: number; json: number; controls: number }[] {
  return types.map((type) => {
    const fields = optionsForType(type, source);
    const json = fields.filter((field) => field.control === "json").length;
    return { type, total: fields.length, json, controls: fields.length - json };
  });
}

export function getPath(spec: unknown, path: string): unknown {
  let current: unknown = spec;
  for (const part of path.split(".")) {
    if (!isRecord(current)) return undefined;
    current = current[part];
  }
  return current;
}

/** True when an ancestor is an array, so nested controls do not apply. */
export function optionBlocked(spec: unknown, path: string): boolean {
  const parts = path.split(".");
  let current: unknown = spec;
  for (let i = 0; i < parts.length - 1; i++) {
    if (Array.isArray(current)) return true;
    if (!isRecord(current)) return false;
    current = current[parts[i]];
    if (Array.isArray(current)) return true;
  }
  return false;
}

function blank(field: OptionField): unknown {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.control === "boolean") return false;
  if (field.control === "number") return "";
  return "";
}

export function readOption(spec: unknown, field: OptionField): OptionState {
  const current = getPath(spec, field.path);
  if (field.control === "json") {
    return { value: current, set: current !== undefined, complex: false };
  }
  if (Array.isArray(current)) return { value: current, set: true, complex: true };
  if (field.storage === "union-boolean") {
    if (current === undefined) return { value: field.defaultValue ?? false, set: false, complex: false };
    if (typeof current === "boolean") return { value: current, set: true, complex: false };
    if (isRecord(current)) {
      if (typeof current.show === "boolean") return { value: current.show, set: true, complex: false };
      return { value: field.defaultValue !== false, set: false, complex: false };
    }
    return { value: current, set: true, complex: true };
  }
  if (field.storage === "union-text" || field.storage === "union-enum" || field.storage === "union-number") {
    if (typeof current === "string" || typeof current === "number" || typeof current === "boolean") {
      return { value: current, set: true, complex: false };
    }
    if (isRecord(current)) {
      const inner = field.promote ? current[field.promote] : undefined;
      if (typeof inner === "string" || typeof inner === "number" || typeof inner === "boolean") {
        return { value: inner, set: true, complex: false };
      }
      return { value: field.defaultValue ?? "", set: false, complex: false };
    }
    if (current === undefined) return { value: field.defaultValue ?? "", set: false, complex: false };
    return { value: current, set: true, complex: true };
  }
  if (current === undefined) return { value: blank(field), set: false, complex: false };
  if (isRecord(current)) return { value: current, set: true, complex: true };
  if (field.coerce === "boolean-or-string" && typeof current === "boolean") {
    return { value: current ? "true" : "false", set: true, complex: false };
  }
  return { value: current, set: true, complex: false };
}

function cloneSpec(spec: unknown): Record<string, unknown> {
  if (!isRecord(spec)) return {};
  return structuredClone(spec);
}

function emptyObject(value: unknown): boolean {
  return isRecord(value) && Object.keys(value).length === 0;
}

function removePath(root: Record<string, unknown>, path: string): void {
  const parts = path.split(".");
  const stack: { parent: Record<string, unknown>; key: string }[] = [];
  let current: unknown = root;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!isRecord(current)) return;
    stack.push({ parent: current, key: parts[i] ?? "" });
    current = current[parts[i] ?? ""];
  }
  if (!isRecord(current)) return;
  delete current[parts[parts.length - 1] ?? ""];
  for (let i = stack.length - 1; i >= 0; i--) {
    const frame = stack[i];
    if (!frame) break;
    const child = frame.parent[frame.key];
    if (emptyObject(child)) delete frame.parent[frame.key];
    else break;
  }
}

function promote(current: unknown, field: OptionField | undefined): Record<string, unknown> {
  if (field?.storage === "union-text" && typeof current === "string") return { [field.promote ?? "field"]: current };
  if (field?.storage === "union-enum" && typeof current === "string" && field.promote) return { [field.promote]: current };
  if (field?.storage === "union-number" && typeof current === "number") {
    if (field.promote) return { [field.promote]: current };
    if (field.path === "size.padding" || field.path.endsWith(".padding")) {
      return { top: current, right: current, bottom: current, left: current };
    }
  }
  return {};
}

function setPath(root: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  let node: Record<string, unknown> = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i] ?? "";
    const prefix = parts.slice(0, i + 1).join(".");
    const current = node[key];
    if (isRecord(current)) {
      node = current;
      continue;
    }
    const created = promote(current, byPath.get(prefix));
    node[key] = created;
    node = created;
  }
  node[parts[parts.length - 1] ?? ""] = value;
}

function coerce(field: OptionField, value: unknown): unknown {
  if (field.coerce === "integer" && typeof value === "number") return Math.round(value);
  if (field.coerce === "number" && typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  if (field.coerce === "number-or-string" && typeof value === "string") {
    const text = value.trim();
    if (text !== "" && Number.isFinite(Number(text))) return Number(text);
  }
  if (field.coerce === "boolean-or-string") {
    if (value === "true" || value === true) return true;
    if (value === "false" || value === false) return false;
  }
  if (field.coerce === "integer" && typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Math.round(Number(value));
  return value;
}

function sameDefault(field: OptionField, value: unknown): boolean {
  return field.defaultValue !== undefined && value === field.defaultValue;
}

function resetIn(root: Record<string, unknown>, field: OptionField): void {
  const current = getPath(root, field.path);
  if ((field.storage === "union-text" || field.storage === "union-enum" || field.storage === "union-number") && isRecord(current) && field.promote) {
    delete current[field.promote];
    if (emptyObject(current)) removePath(root, field.path);
    return;
  }
  if (field.storage === "union-boolean" && isRecord(current) && field.promote === "show") {
    delete current.show;
    if (emptyObject(current)) removePath(root, field.path);
    return;
  }
  removePath(root, field.path);
}

function writeBooleanUnion(root: Record<string, unknown>, field: OptionField, on: boolean): void {
  const current = getPath(root, field.path);
  const def = field.defaultValue;
  if (on) {
    if (isRecord(current)) {
      if (field.promote === "show") {
        if (def === true) delete current.show;
        else current.show = true;
        if (emptyObject(current)) removePath(root, field.path);
      }
      return;
    }
    if (def === true) removePath(root, field.path);
    else setPath(root, field.path, true);
    return;
  }
  if (isRecord(current) && field.promote === "show") {
    current.show = false;
    return;
  }
  if (def === false) removePath(root, field.path);
  else setPath(root, field.path, false);
}

function put(root: Record<string, unknown>, field: OptionField, value: unknown): void {
  if ((field.storage === "union-enum" || field.storage === "union-text" || field.storage === "union-number") && field.promote) {
    const current = getPath(root, field.path);
    if (isRecord(current)) {
      current[field.promote] = value;
      return;
    }
  }
  setPath(root, field.path, value);
}

/** Write one option. Values equal to the known default are removed, not stored. */
export function writeOption(spec: unknown, field: OptionField, value: unknown): Record<string, unknown> {
  const next = cloneSpec(spec);
  if (field.storage === "union-boolean" && typeof value === "boolean") {
    writeBooleanUnion(next, field, value);
    return next;
  }
  const stored = coerce(field, value);
  if (stored === undefined || stored === "" || sameDefault(field, stored)) {
    resetIn(next, field);
    return next;
  }
  put(next, field, stored);
  return next;
}

export function resetOption(spec: unknown, field: OptionField): Record<string, unknown> {
  const next = cloneSpec(spec);
  resetIn(next, field);
  return next;
}
