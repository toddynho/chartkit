import type { Diagnostic, JsonPatchOperation } from "./diagnostics";
import { LEGACY_PROPS, TYPE_REQUIREMENTS } from "./marks";
import { suggestAlt } from "./suggest";

interface JsonSchema {
  $ref?: string;
  $defs?: Record<string, JsonSchema>;
  type?: string | string[];
  const?: unknown;
  enum?: unknown[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  items?: JsonSchema;
  oneOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  allOf?: JsonSchema[];
  if?: JsonSchema;
  then?: JsonSchema;
  else?: JsonSchema;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  minItems?: number;
  maxItems?: number;
  minProperties?: number;
  pattern?: string;
  description?: string;
}

interface Ctx {
  rootSchema: JsonSchema;
  rootValue: unknown;
  out: Diagnostic[];
  depth: number;
  /** "parentPath|property" required keys already explained by a repair patch. */
  skipMissing: Set<string>;
  /** JSON pointers whose unknown-property error is replaced by a repair patch. */
  skipUnknown: Set<string>;
}

const CHART_TYPES = [
  "line",
  "bar",
  "donut",
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
] as const;

export function walkSchema(value: unknown, schema: JsonSchema, diagnostics: Diagnostic[]): void {
  const ctx: Ctx = {
    rootSchema: schema,
    rootValue: value,
    out: diagnostics,
    depth: 0,
    skipMissing: new Set(),
    skipUnknown: new Set(),
  };
  check(value, schema, "", ctx);
}

function check(value: unknown, schema: JsonSchema, path: string, ctx: Ctx): void {
  if (ctx.depth > 48) {
    emit(ctx, {
      code: "CK1006",
      severity: "error",
      message: `${showPath(path)} must be a JSON value, got a structure nested too deeply`,
      path,
    });
    return;
  }
  ctx.depth += 1;
  const node = resolve(schema, ctx.rootSchema);
  if (repairShape(value, path, ctx)) {
    ctx.depth -= 1;
    return;
  }

  if (node.anyOf) {
    checkUnion(value, node.anyOf, path, ctx, "any");
    ctx.depth -= 1;
    return;
  }
  if (node.oneOf) {
    checkUnion(value, node.oneOf, path, ctx, "one");
    ctx.depth -= 1;
    return;
  }

  if (path === "/version" && value !== "1") {
    emit(ctx, {
      code: "CK1008",
      severity: "error",
      message: `unsupported version ${quote(value)}`,
      path,
      hint: `this renderer supports "1"; set "version": "1"`,
      fix: [{ op: "replace", path: "/version", value: "1" }],
    });
    ctx.depth -= 1;
    return;
  }

  if (node.type) {
    const types = Array.isArray(node.type) ? node.type : [node.type];
    if (!types.some((t) => typeMatches(value, t))) {
      if (path === "/a11y") emitAltRequired(ctx);
      const px = typeof value === "string" ? /^(-?\d+(?:\.\d+)?)px$/.exec(value) : null;
      const wantsNumber = types.includes("number") || types.includes("integer");
      const hint = px && wantsNumber ? `use a number of px: ${Number(px[1])}` : undefined;
      const fix: JsonPatchOperation[] | undefined =
        px && wantsNumber ? [{ op: "replace", path: path || "/", value: Number(px[1]) }] : undefined;
      emit(ctx, {
        code: "CK1006",
        severity: "error",
        message: `${showPath(path)} must be ${types.join(" or ")}, got ${describe(value)}`,
        path,
        hint,
        fix,
      });
      ctx.depth -= 1;
      return;
    }
  }

  if (node.const !== undefined && value !== node.const) {
    emit(ctx, {
      code: "CK1006",
      severity: "error",
      message: `${showPath(path)} must be ${quote(node.const)}, got ${quote(value)}`,
      path,
      fix: [{ op: "replace", path: path || "/", value: node.const }],
    });
    ctx.depth -= 1;
    return;
  }

  if (node.enum && !node.enum.some((item) => item === value)) {
    if (path === "/type") {
      emitUnknownType(value, ctx);
    } else if (path.endsWith("/axis") && isPlainObject(value) && node.enum.includes("y") && node.enum.includes("y2")) {
      emitAxisObject(value, path, ctx);
    } else {
      const alias = typeof value === "string" && node.enum.includes(FIELD_TYPE_ALIAS[value]) ? FIELD_TYPE_ALIAS[value] : undefined;
      const closest = alias ?? (typeof value === "string" ? nearest(value, node.enum.map(String), 3) : undefined);
      emit(ctx, {
        code: "CK1007",
        severity: "error",
        message: `${quote(value)} is not one of ${node.enum.map((item) => quote(item)).join(", ")}`,
        path,
        hint: closest ? `did you mean ${quote(closest)}?` : undefined,
        fix: closest ? [{ op: "replace", path: path || "/", value: closest }] : undefined,
      });
    }
    ctx.depth -= 1;
    return;
  }

  if (typeof value === "string") {
    if (node.minLength !== undefined && value.length < node.minLength) {
      emit(ctx, lengthIssue(path, `a string of at least ${node.minLength} characters`, value, ctx));
    }
    if (node.maxLength !== undefined && value.length > node.maxLength) {
      emit(ctx, {
        code: "CK1006",
        severity: "error",
        message: `${showPath(path)} must be a string of at most ${node.maxLength} characters, got length ${value.length}`,
        path,
      });
    }
    if (node.pattern && !pattern(node.pattern).test(value)) {
      emit(ctx, {
        code: "CK1006",
        severity: "error",
        message: `${showPath(path)} must match ${node.pattern}, got ${quote(value)}`,
        path,
      });
    }
  }

  if (typeof value === "number") {
    if (node.minimum !== undefined && value < node.minimum) {
      emit(ctx, {
        code: "CK1006",
        severity: "error",
        message: `${showPath(path)} must be >= ${node.minimum}, got ${value}`,
        path,
      });
    }
    if (node.maximum !== undefined && value > node.maximum) {
      emit(ctx, {
        code: "CK1006",
        severity: "error",
        message: `${showPath(path)} must be <= ${node.maximum}, got ${value}`,
        path,
      });
    }
    if (node.exclusiveMinimum !== undefined && value <= node.exclusiveMinimum) {
      emit(ctx, {
        code: "CK1006",
        severity: "error",
        message: `${showPath(path)} must be > ${node.exclusiveMinimum}, got ${value}`,
        path,
      });
    }
    if (node.exclusiveMaximum !== undefined && value >= node.exclusiveMaximum) {
      emit(ctx, {
        code: "CK1006",
        severity: "error",
        message: `${showPath(path)} must be < ${node.exclusiveMaximum}, got ${value}`,
        path,
      });
    }
  }

  if (isArrayLike(value)) {
    const list = asList(value);
    if (node.minItems !== undefined && list.length < node.minItems) {
      emit(ctx, {
        code: "CK1006",
        severity: "error",
        message: `${showPath(path)} must have at least ${node.minItems} items, got ${list.length}`,
        path,
      });
    }
    if (node.maxItems !== undefined && list.length > node.maxItems) {
      emit(ctx, {
        code: "CK1006",
        severity: "error",
        message: `${showPath(path)} must have at most ${node.maxItems} items, got ${list.length}`,
        path,
      });
    }
    if (node.items) {
      const scalars = scalarTypes(resolve(node.items, ctx.rootSchema), ctx.rootSchema);
      if (scalars) {
        for (let i = 0; i < list.length; i++) {
          if (!scalars.some((t) => typeMatches(list[i], t))) {
            emit(ctx, {
              code: "CK1006",
              severity: "error",
              message: `${showPath(join(path, String(i)))} must be ${scalars.join(" or ")}, got ${describe(list[i])}`,
              path: join(path, String(i)),
            });
          }
        }
      } else {
        for (let i = 0; i < list.length; i++) {
          check(list[i], node.items, join(path, String(i)), ctx);
        }
      }
    }
  }

  if (isPlainObject(value)) {
    if (path === "") noteMetricHoist(value, ctx);
    if (path === "/encoding") noteDonutChannels(value, ctx);
    if (node.minProperties !== undefined && Object.keys(value).length < node.minProperties) {
      emit(ctx, {
        code: "CK1006",
        severity: "error",
        message: `${showPath(path)} must have at least ${node.minProperties} properties, got ${Object.keys(value).length}`,
        path,
      });
    }
    const props = node.properties ?? {};
    for (const [key, propSchema] of Object.entries(props)) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        check(value[key], propSchema, join(path, key), ctx);
      }
    }
    if (node.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.prototype.hasOwnProperty.call(props, key)) {
          emitUnknownProp(key, path, props, ctx);
        }
      }
    } else if (isSchema(node.additionalProperties)) {
      const extra = resolve(node.additionalProperties, ctx.rootSchema);
      const scalars = scalarTypes(extra, ctx.rootSchema);
      for (const key of Object.keys(value)) {
        if (Object.prototype.hasOwnProperty.call(props, key)) continue;
        if (scalars) {
          const child = value[key];
          if (!scalars.some((t) => typeMatches(child, t))) {
            emit(ctx, {
              code: "CK1006",
              severity: "error",
              message: `${showPath(join(path, key))} must be ${scalars.join(" or ")}, got ${describe(child)}`,
              path: join(path, key),
            });
          }
        } else {
          check(value[key], node.additionalProperties, join(path, key), ctx);
        }
      }
    }
    if (node.required) {
      for (const name of node.required) {
        if (value[name] === undefined) emitMissing(name, path, value, ctx);
      }
    }
  }

  if (node.allOf) {
    for (const sub of node.allOf) check(value, sub, path, ctx);
  }
  if (node.if) {
    const before = ctx.out.length;
    check(value, node.if, path, ctx);
    const ifFailed = ctx.out.length > before;
    ctx.out.splice(before);
    if (!ifFailed && node.then) check(value, node.then, path, ctx);
    else if (ifFailed && node.else) check(value, node.else, path, ctx);
  }

  ctx.depth -= 1;
}

function checkUnion(
  value: unknown,
  schemas: JsonSchema[],
  path: string,
  ctx: Ctx,
  mode: "one" | "any",
): void {
  const branches: Diagnostic[][] = [];
  for (const schema of schemas) {
    const before = ctx.out.length;
    check(value, schema, path, ctx);
    branches.push(ctx.out.splice(before));
  }
  const perfect = branches.filter((errors) => errors.length === 0);
  if (mode === "any" && perfect.length >= 1) return;
  if (mode === "one" && perfect.length === 1) return;
  if (mode === "one" && perfect.length > 1) {
    emit(ctx, {
      code: "CK1006",
      severity: "error",
      message: `${showPath(path)} matches more than one allowed shape, got ${describe(value)}`,
      path,
    });
    return;
  }
  let best = branches[0] ?? [];
  let bestScore = scoreBranch(schemas[0], value, best, ctx);
  for (let i = 1; i < branches.length; i++) {
    const score = scoreBranch(schemas[i], value, branches[i], ctx);
    if (score < bestScore) {
      best = branches[i];
      bestScore = score;
    }
  }
  ctx.out.push(...best);
}

function scoreBranch(schema: JsonSchema | undefined, value: unknown, errors: Diagnostic[], ctx: Ctx): number {
  if (!schema) return errors.length + 10;
  const expects = schemaExpects(resolve(schema, ctx.rootSchema), value, ctx);
  return errors.length + (expects ? 0 : 100);
}

function schemaExpects(schema: JsonSchema, value: unknown, ctx: Ctx): boolean {
  if (schema.anyOf) return schema.anyOf.some((sub) => schemaExpects(resolve(sub, ctx.rootSchema), value, ctx));
  if (schema.oneOf) return schema.oneOf.some((sub) => schemaExpects(resolve(sub, ctx.rootSchema), value, ctx));
  if (schema.enum) return true;
  if (schema.const !== undefined) return schema.const === value;
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    return types.some((t) => typeMatches(value, t));
  }
  return true;
}

const FIELD_TYPE_ALIAS: Record<string, string> = {
  categorical: "nominal",
  category: "nominal",
  qualitative: "nominal",
};

const METRIC_FIELDS = ["label", "value", "min", "max", "delta", "target"] as const;
const DONUT_CHANNELS = ["label", "theta", "angle", "value"] as const;

/** Shapes agents copy from Vega-Lite. One CK1009, with a patch, instead of a pile of missing-property errors. */
function repairShape(value: unknown, path: string, ctx: Ctx): boolean {
  if (path === "/data" && isPlainObject(value) && Array.isArray(value.values) && value.columns === undefined) {
    emit(ctx, {
      code: "CK1009",
      severity: "error",
      message: "data must be a plain array of rows, not { values }",
      path: "/data",
      hint: "ChartKit takes the rows directly: data: [...]. Move data.values up to data.",
      fix: [{ op: "move", from: "/data/values", path: "/data" }],
    });
    return true;
  }
  if (path === "/mark" && typeof value === "string") {
    const mapped = chartTypeName(value);
    const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
    const fix: JsonPatchOperation[] = [];
    if (typeof root.type !== "string" && mapped) fix.push({ op: "add", path: "/type", value: mapped });
    fix.push({ op: "remove", path: "/mark" });
    emit(ctx, {
      code: "CK1009",
      severity: "error",
      message: "mark is an options object; the chart type goes in type",
      path: "/mark",
      hint: mapped
        ? `use type: ${JSON.stringify(mapped)}. mark is options such as curve and sampling, not a type name.`
        : 'mark is an options object. Put the chart type in type, for example "line".',
      fix,
    });
    if (mapped && typeof root.type !== "string") ctx.skipMissing.add("|type");
    return true;
  }
  return false;
}

function noteMetricHoist(value: Record<string, unknown>, ctx: Ctx): void {
  const type = value.type;
  if (type !== "gauge" && type !== "kpi" && type !== "progress-ring") return;
  if (isPlainObject(value.metric)) return;
  const keys = METRIC_FIELDS.filter((key) => value[key] !== undefined);
  if (keys.length === 0 || keys.every((key) => ctx.skipUnknown.has(`/${key}`))) return;
  const metric: Record<string, unknown> = {};
  for (const key of keys) metric[key] = value[key];
  const fix: JsonPatchOperation[] = [{ op: "add", path: "/metric", value: metric }];
  for (const key of keys) {
    fix.push({ op: "remove", path: `/${key}` });
    ctx.skipUnknown.add(`/${key}`);
  }
  ctx.skipMissing.add("|metric");
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: "gauge, kpi, and progress-ring keep the number in metric",
    path: "/metric",
    hint: 'Move value, min, max, delta, and label into metric: { value, min, max }. They are not top-level keys.',
    fix,
  });
}

function noteDonutChannels(encoding: Record<string, unknown>, ctx: Ctx): void {
  const present = DONUT_CHANNELS.filter((key) => encoding[key] !== undefined);
  if (present.length === 0 || present.every((key) => ctx.skipUnknown.has(`/encoding/${key}`))) return;
  const fix: JsonPatchOperation[] = [];
  if (encoding.x === undefined && encoding.label !== undefined) {
    fix.push({ op: "move", from: "/encoding/label", path: "/encoding/x" });
  }
  if (encoding.y === undefined) {
    const source = encoding.value !== undefined ? "value" : encoding.theta !== undefined ? "theta" : encoding.angle !== undefined ? "angle" : undefined;
    if (source) fix.push({ op: "move", from: `/encoding/${source}`, path: "/encoding/y" });
  }
  for (const key of present) {
    if (!fix.some((op) => op.from === `/encoding/${key}`)) fix.push({ op: "remove", path: `/encoding/${key}` });
    ctx.skipUnknown.add(`/encoding/${key}`);
  }
  if (fix.some((op) => op.path === "/encoding/x")) ctx.skipMissing.add("/encoding|x");
  if (fix.some((op) => op.path === "/encoding/y")) ctx.skipMissing.add("/encoding|y");
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: "donut uses encoding.x for the slice label and encoding.y for the value",
    path: "/encoding",
    hint: 'Donut does not use theta, angle, label, or value channels. encoding.x is the slice name and encoding.y is the number.',
    fix,
  });
}

function emitAxisObject(value: Record<string, unknown>, path: string, ctx: Ctx): void {
  const side = value.orient === "right" || value.position === "right" ? "y2" : "y";
  const fix: JsonPatchOperation[] = [{ op: "replace", path, value: side }];
  if (typeof value.title === "string") {
    const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
    const axes = isPlainObject(root.axes) ? root.axes : undefined;
    if (!axes) fix.push({ op: "add", path: "/axes", value: { [side]: { title: value.title } } });
    else if (!isPlainObject(axes[side])) fix.push({ op: "add", path: `/axes/${side}`, value: { title: value.title } });
    else if ((axes[side] as Record<string, unknown>).title === undefined) {
      fix.push({ op: "add", path: `/axes/${side}/title`, value: value.title });
    }
  }
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: 'axis is "y" or "y2", not an object',
    path,
    hint: 'axis is the string "y" or "y2". Put a title in axes.y.title or axes.y2.title.',
    fix,
  });
}

function chartTypeName(raw: string): string | undefined {
  if (raw === "pie") return "donut";
  if (raw === "area") return "mini-area";
  if (raw === "grid-heat" || raw === "gridheat" || raw === "grid_heat") return "heatmap";
  return (CHART_TYPES as readonly string[]).includes(raw) ? raw : undefined;
}

function emitUnknownType(value: unknown, ctx: Ctx): void {
  const raw = typeof value === "string" ? value : String(value);
  const kebab = raw.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`).replace(/^-/, "");
  const alias = aliasFor(raw);
  const closest = alias?.type ?? (CHART_TYPES as readonly string[]).find((t) => t === kebab) ?? nearest(raw, [...CHART_TYPES], 3);
  const hintParts = [
    closest ? `did you mean ${quote(closest)}?` : undefined,
    `valid: ${CHART_TYPES.join(", ")}`,
    alias?.note,
  ].filter(Boolean);
  emit(ctx, {
    code: "CK1005",
    severity: "error",
    message: `unknown chart type ${quote(raw)}`,
    path: "/type",
    hint: hintParts.join(" "),
    fix: alias ? aliasFix(ctx.rootValue, alias) : closest && (CHART_TYPES as readonly string[]).includes(closest)
      ? [{ op: "replace", path: "/type", value: closest }]
      : undefined,
  });
}

interface Alias {
  type: string;
  note: string;
  kind: "pie" | "rename";
}

function aliasFor(value: string): Alias | undefined {
  if (value === "pie") return { type: "donut", note: '"pie" maps to type "donut" with mark.innerRadius 0.', kind: "pie" };
  if (value === "area") {
    return {
      type: "mini-area",
      note: 'A full-size filled line is type "line" with mark.area true. Stacked layers are "stacked-area".',
      kind: "rename",
    };
  }
  if (value === "grid-heat" || value === "gridheat" || value === "grid_heat") {
    return { type: "heatmap", note: "A grid uses encoding.x, encoding.y, and encoding.color.", kind: "rename" };
  }
  return undefined;
}

function aliasFix(root: unknown, alias: Alias): JsonPatchOperation[] {
  const spec = isPlainObject(root) ? root : {};
  const mark = isPlainObject(spec.mark) ? spec.mark : undefined;
  if (alias.kind === "pie") {
    if (mark) {
      return [
        { op: "replace", path: "/type", value: "donut" },
        { op: mark.innerRadius === undefined ? "add" : "replace", path: "/mark/innerRadius", value: 0 },
      ];
    }
    return [
      { op: "replace", path: "/type", value: "donut" },
      { op: "add", path: "/mark", value: { innerRadius: 0 } },
    ];
  }
  return [{ op: "replace", path: "/type", value: alias.type }];
}

function emitUnknownProp(name: string, path: string, props: Record<string, JsonSchema>, ctx: Ctx): void {
  const pointer = join(path, name);
  if (ctx.skipUnknown.has(pointer)) return;
  let hint: string | undefined;
  if (name === "colour") {
    hint = 'did you mean "theme.tokens" or "encoding.color"?';
  } else if (LEGACY_PROPS[name]) {
    hint = `did you mean ${quote(LEGACY_PROPS[name])}?`;
  } else {
    const closest = nearest(name, Object.keys(props), name.length <= 4 ? 1 : 3);
    if (closest) hint = `did you mean ${quote(closest)}?`;
  }
  emit(ctx, {
    code: "CK1002",
    severity: "error",
    message: `unknown property ${quote(name)}`,
    path: pointer,
    hint,
  });
}

function emitMissing(name: string, path: string, parent: Record<string, unknown>, ctx: Ctx): void {
  if (ctx.skipMissing.has(`${path}|${name}`)) return;
  const pointer = name === "a11y" && path === "" ? "/a11y" : path;
  if ((path === "" && name === "a11y") || (path === "/a11y" && name === "alt")) {
    emitAltRequired(ctx);
    return;
  }
  const type = isPlainObject(ctx.rootValue) && typeof ctx.rootValue.type === "string" ? ctx.rootValue.type : undefined;
  const typeHint = type && (path === "" || path === "/encoding") ? TYPE_REQUIREMENTS[type] : undefined;
  emit(ctx, {
    code: "CK1003",
    severity: "error",
    message: `missing required property ${quote(name)}`,
    path: pointer,
    hint: typeHint ?? (name === "alt" ? "describe the key takeaway in one sentence" : undefined),
  });
  void parent;
}

function emitAltRequired(ctx: Ctx): void {
  const summary = suggestAlt(ctx.rootValue);
  const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
  const a11y = root.a11y;
  const fix: JsonPatchOperation[] = isPlainObject(a11y)
    ? [{ op: "add", path: "/a11y/alt", value: summary }]
    : [{ op: "add", path: "/a11y", value: { alt: summary } }];
  emit(ctx, {
    code: "CK1004",
    severity: "error",
    message: "a11y.alt is required",
    path: "/a11y",
    hint: `describe the key takeaway in one sentence; suggested: "${summary}"`,
    fix,
  });
}

function lengthIssue(path: string, expected: string, value: string, ctx: Ctx): Diagnostic {
  const hint =
    path === "/a11y/alt"
      ? `describe the key takeaway in one sentence; suggested: "${suggestAlt(ctx.rootValue)}"`
      : undefined;
  const summary = path === "/a11y/alt" ? suggestAlt(ctx.rootValue) : undefined;
  return {
    code: "CK1006",
    severity: "error",
    message: `${showPath(path)} must be ${expected}, got ${quote(value)}`,
    path,
    hint,
    fix: summary ? [{ op: "replace", path, value: summary }] : undefined,
  };
}

function emit(ctx: Ctx, diagnostic: Diagnostic): void {
  ctx.out.push(diagnostic);
}

function resolve(schema: JsonSchema, root: JsonSchema): JsonSchema {
  if (!schema.$ref) return schema;
  if (schema.$ref === "#") return root;
  const match = /^#\/\$defs\/([^/]+)$/.exec(schema.$ref);
  if (!match) return schema;
  return root.$defs?.[match[1]] ?? schema;
}

function isSchema(value: unknown): value is JsonSchema {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !isTypedArray(value);
}

function isTypedArray(value: unknown): boolean {
  return ArrayBuffer.isView(value) && !(value instanceof DataView);
}

function isArrayLike(value: unknown): boolean {
  return Array.isArray(value) || isTypedArray(value);
}

function asList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (isTypedArray(value)) return Array.from(value as ArrayLike<unknown>);
  return [];
}

function typeMatches(value: unknown, type: string): boolean {
  switch (type) {
    case "object":
      return isPlainObject(value);
    case "array":
      return isArrayLike(value);
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "integer":
      return typeof value === "number" && Number.isInteger(value);
    case "boolean":
      return typeof value === "boolean";
    case "null":
      return value === null;
    default:
      return false;
  }
}

function scalarTypes(schema: JsonSchema, root: JsonSchema): string[] | null {
  const node = resolve(schema, root);
  if (
    node.enum ||
    node.const !== undefined ||
    node.oneOf ||
    node.anyOf ||
    node.allOf ||
    node.properties ||
    node.$ref ||
    node.pattern ||
    node.minLength !== undefined ||
    node.minimum !== undefined ||
    node.maximum !== undefined
  ) {
    return null;
  }
  if (!node.type) return null;
  return Array.isArray(node.type) ? node.type : [node.type];
}

const patterns = new Map<string, RegExp>();
function pattern(source: string): RegExp {
  let compiled = patterns.get(source);
  if (!compiled) {
    compiled = new RegExp(source);
    patterns.set(source, compiled);
  }
  return compiled;
}

function join(base: string, segment: string): string {
  return `${base}/${segment.replace(/~/g, "~0").replace(/\//g, "~1")}`;
}

function showPath(path: string): string {
  return path || "/";
}

function describe(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (isTypedArray(value)) return "array";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return Number.isFinite(value) ? "number" : "number";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "object") return "object";
  return typeof value;
}

function quote(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (value === undefined) return "undefined";
  if (typeof value === "number" || typeof value === "boolean" || value === null) return String(value);
  return describe(value);
}

export function nearest(input: string, choices: readonly string[], maxDistance: number): string | undefined {
  let best: string | undefined;
  let bestDistance = maxDistance + 1;
  const lower = input.toLowerCase();
  for (const choice of choices) {
    if (choice === input) return choice;
    const distance = levenshtein(lower, choice.toLowerCase());
    if (distance < bestDistance && distance <= maxDistance && distance < choice.length) {
      best = choice;
      bestDistance = distance;
    }
  }
  return best;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const row = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) row[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const saved = row[j];
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = saved;
    }
  }
  return row[b.length];
}
