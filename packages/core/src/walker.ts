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
  /** JSON pointers the walker must not descend into. A repair already explains them. */
  dropPaths: Set<string>;
  /** `if` / `then` re-enters the root. The metric hoist must run once. */
  metricNoted: boolean;
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
  "histogram",
  "boxplot",
  "radar",
  "funnel",
  "treemap",
  "sankey",
  "bullet",
  "waterfall",
] as const;

export function walkSchema(value: unknown, schema: JsonSchema, diagnostics: Diagnostic[]): void {
  const ctx: Ctx = {
    rootSchema: schema,
    rootValue: value,
    out: diagnostics,
    depth: 0,
    skipMissing: new Set(),
    skipUnknown: new Set(),
    dropPaths: new Set(),
    metricNoted: false,
  };
  check(value, schema, "", ctx);
  if (!hasKnownType(value)) {
    for (let i = diagnostics.length - 1; i >= 0; i--) {
      if (isTypeBranchNoise(diagnostics[i])) diagnostics.splice(i, 1);
    }
  }
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
  if (isDropped(path, ctx)) {
    ctx.depth -= 1;
    return;
  }
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
      if (path === "/mark/labels" && typeof value === "string" && labelWord(value, ctx)) {
        ctx.depth -= 1;
        return;
      }
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
    } else if (comboSeriesMark(path, value, ctx)) {
      // emitted
    } else if (path.endsWith("/axis") && node.enum.includes("y") && node.enum.includes("y2") && (value === null || isPlainObject(value))) {
      if (value === null) emitAxisNull(path, ctx);
      else emitAxisObject(value, path, ctx);
    } else if (path === "/interaction/select" && (value === true || value === "single" || value === "multi")) {
      emit(ctx, {
        code: "CK1007",
        severity: "error",
        message: `${quote(value)} is not one of ${node.enum.map((item) => quote(item)).join(", ")}`,
        path,
        hint: 'select is "point" or "series". true means "point". Hold Shift, Ctrl, or Meta to add another.',
        fix: [{ op: "replace", path, value: "point" }],
      });
    } else if (path === "/mark/shape" && typeof value === "string" && SHAPE_ALIAS[value]) {
      emit(ctx, {
        code: "CK1007",
        severity: "error",
        message: `${quote(value)} is not one of ${node.enum.map((item) => quote(item)).join(", ")}`,
        path,
        hint: `mark.shape is the funnel geometry. A marker is mark.pointShape. ${quote(value)} means ${quote(SHAPE_ALIAS[value])}.`,
        fix: [
          { op: "remove", path },
          { op: "add", path: "/mark/pointShape", value: SHAPE_ALIAS[value] },
        ],
      });
    } else if (path.endsWith("/pointShape") && typeof value === "string" && SHAPE_ALIAS[value]) {
      emit(ctx, {
        code: "CK1007",
        severity: "error",
        message: `${quote(value)} is not one of ${node.enum.map((item) => quote(item)).join(", ")}`,
        path,
        hint: `pointShape is circle, square, diamond, triangle, cross, or none. ${quote(value)} means ${quote(SHAPE_ALIAS[value])}.`,
        fix: [{ op: "replace", path, value: SHAPE_ALIAS[value] }],
      });
    } else if (path.endsWith("/labelPosition") && typeof value === "string" && POS_ALIAS[value]) {
      emit(ctx, {
        code: "CK1007",
        severity: "error",
        message: `${quote(value)} is not one of ${node.enum.map((item) => quote(item)).join(", ")}`,
        path,
        hint: `labelPosition is top, bottom, left, right, center, inside, or outside. ${quote(value)} means ${quote(POS_ALIAS[value])}.`,
        fix: [{ op: "replace", path, value: POS_ALIAS[value] }],
      });
    } else if (path.endsWith("/labelEnds") && typeof value === "string" && ENDS_ALIAS[value]) {
      emit(ctx, {
        code: "CK1007",
        severity: "error",
        message: `${quote(value)} is not one of ${node.enum.map((item) => quote(item)).join(", ")}`,
        path,
        hint: `labelEnds is "all", "ends", or "last". ${quote(value)} means ${quote(ENDS_ALIAS[value])}.`,
        fix: [{ op: "replace", path, value: ENDS_ALIAS[value] }],
      });
    } else if (path.endsWith("/points") && (value === true || value === false) && node.enum.includes("always")) {
      const mapped = value === true ? "always" : "none";
      emit(ctx, {
        code: "CK1007",
        severity: "error",
        message: `${quote(value)} is not one of ${node.enum.map((item) => quote(item)).join(", ")}`,
        path,
        hint: `mark.points is "none", "hover", or "always". ${value === true ? "true" : "false"} means ${quote(mapped)}.`,
        fix: [{ op: "replace", path: path || "/", value: mapped }],
      });
    } else if (typeof value === "string" && node.enum.includes("number") && node.enum.includes("percent")) {
      const preset = formatPresetFix(value);
      if (preset) {
        emit(ctx, {
          code: "CK1007",
          severity: "error",
          message: `${quote(value)} is not one of ${node.enum.map((item) => quote(item)).join(", ")}`,
          path,
          hint: preset.hint,
          fix: [{ op: "replace", path: path || "/", value: preset.value }],
        });
      } else {
        const closest = nearest(value, node.enum.map(String), 3);
        emit(ctx, {
          code: "CK1007",
          severity: "error",
          message: `${quote(value)} is not one of ${node.enum.map((item) => quote(item)).join(", ")}`,
          path,
          hint: closest ? `did you mean ${quote(closest)}?` : undefined,
          fix: closest ? [{ op: "replace", path: path || "/", value: closest }] : undefined,
        });
      }
    } else {
      const named = typeof value === "string" ? PLACE_ALIAS[path.endsWith("/position") ? value : ""] ?? FIELD_TYPE_ALIAS[value] : undefined;
      const alias = named && node.enum.includes(named) ? named : undefined;
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
    if (path === "") {
      noteChartType(value, ctx);
      noteCombo(value, ctx);
      noteMetricHoist(value, ctx);
    }
    if (path === "/encoding") {
      noteDonutChannels(value, ctx);
      noteHeatmapChannels(value, ctx);
      noteFlowChannels(value, ctx);
    }
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
          if (key === "axis" && isXChannel(path) && (value[key] === null || isPlainObject(value[key]))) {
            emitXAxis(value[key], join(path, key), ctx);
            continue;
          }
          emitUnknownProp(key, path, props, ctx, value[key]);
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
    let ifFailed = ctx.out.length > before;
    ctx.out.splice(before);
    // A repair for a missing `type` skips the CK1003, which would otherwise make every
    // type-conditional `if` look true and demand metric, OHLC, and color at once.
    if (!ifFailed && path === "" && ifDemandsChartType(node.if, ctx) && !hasKnownType(value)) ifFailed = true;
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

const PLACE_ALIAS: Record<string, string> = { above: "top", below: "bottom", over: "top", under: "bottom" };

const METRIC_FIELDS = ["label", "value", "min", "max", "delta", "target"] as const;
const DONUT_CHANNELS = ["label", "theta", "angle", "value"] as const;

/** Shapes agents copy from Vega-Lite. One CK1009, with a patch, instead of a pile of missing-property errors. */
function repairShape(value: unknown, path: string, ctx: Ctx): boolean {
  if (path === "/tooltip/fields" && typeof value === "string") {
    emit(ctx, {
      code: "CK1009",
      severity: "error",
      message: "tooltip.fields is a list",
      path,
      hint: "did you mean a list?",
      fix: [{ op: "replace", path, value: value.split(",").map((part) => part.trim()).filter(Boolean) }],
    });
    return true;
  }
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
  if (path === "/mark" && Array.isArray(value) && ctx.skipUnknown.has("/mark")) return true;
  if (path === "/mark" && typeof value === "string") {
    const mapped = chartTypeName(value, ctx.rootValue);
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
  if (repairYFieldList(value, path, ctx)) return true;
  return false;
}

/** `encoding.y: { field: ["a", "b"] }` is the list form `encoding.y: ["a", "b"]`. */
function repairYFieldList(value: unknown, path: string, ctx: Ctx): boolean {
  if (path !== "/encoding/y") return false;
  const replacement = yFieldReplacement(value);
  if (replacement === undefined) return false;
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: "a list of fields belongs on encoding.y, not on field",
    path: "/encoding/y",
    hint: "encoding.y is a field name or a list of field names. The array belongs on y, not on field.",
    fix: [{ op: "replace", path: "/encoding/y", value: replacement }],
  });
  return true;
}

function yFieldReplacement(value: unknown): unknown {
  if (isPlainObject(value)) return expandFieldList(value);
  if (!Array.isArray(value)) return undefined;
  let changed = false;
  const out: unknown[] = [];
  for (const item of value) {
    if (!isPlainObject(item)) {
      out.push(item);
      continue;
    }
    const expanded = expandFieldList(item);
    if (expanded === undefined) {
      out.push(item);
      continue;
    }
    changed = true;
    if (Array.isArray(expanded)) out.push(...expanded);
    else out.push(expanded);
  }
  return changed ? out : undefined;
}

function expandFieldList(channel: Record<string, unknown>): unknown {
  const fields = stringList(channel.field);
  if (!fields) return undefined;
  const siblings: Record<string, unknown> = {};
  for (const key of Object.keys(channel)) {
    if (key !== "field") siblings[key] = channel[key];
  }
  if (Object.keys(siblings).length === 0) return fields;
  return fields.map((field) => ({ field, ...siblings }));
}

function stringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || item.length === 0) return undefined;
    out.push(item);
  }
  return out;
}

/** On a combo, `type: "bar"|"line"|"area"` inside a y item is the series mark. */
function comboSeriesMark(path: string, value: unknown, ctx: Ctx): boolean {
  if (value !== "bar" && value !== "line" && value !== "area") return false;
  const match = /^\/encoding\/y(?:\/(\d+))?\/type$/.exec(path);
  if (!match) return false;
  const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : undefined;
  if (!root || root.type !== "combo") return false;
  const parent = match[1] === undefined ? "/encoding/y" : `/encoding/y/${match[1]}`;
  const node = pointer(root, parent);
  const hasMark = isPlainObject(node) && Object.prototype.hasOwnProperty.call(node, "mark");
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: `${quote(value)} is a combo series mark, not a field type`,
    path,
    hint: 'On a combo, "bar", "line", and "area" go in mark. type on a y channel is quantitative, temporal, ordinal, or nominal.',
    fix: [
      { op: hasMark ? "replace" : "add", path: `${parent}/mark`, value },
      { op: "remove", path },
    ],
  });
  return true;
}

function pointer(root: unknown, path: string): unknown {
  let current: unknown = root;
  if (path === "") return current;
  for (const part of path.slice(1).split("/")) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

const METRIC_SHAPE = "metric: { value, min, max, label?, delta? }";

function noteMetricHoist(value: Record<string, unknown>, ctx: Ctx): void {
  const type = value.type;
  if (type !== "gauge" && type !== "kpi" && type !== "progress-ring") return;
  if (ctx.metricNoted) return;
  ctx.metricNoted = true;
  const dataKind = classifyMetricData(value.data);
  const dropData = dataKind === "metric" || dataKind === "drop";
  if (dropData) ctx.dropPaths.add("/data");

  const metricReady = isPlainObject(value.metric) && typeof value.metric.value === "number";
  if ((metricReady || ctx.skipMissing.has("|metric")) && !dropData) return;

  const fix: JsonPatchOperation[] = [];
  if (!metricReady && !ctx.skipMissing.has("|metric")) {
    const gathered = gatherMetric(value);
    if (typeof gathered.metric.value === "number") {
      fix.push({ op: isPlainObject(value.metric) ? "replace" : "add", path: "/metric", value: gathered.metric });
      ctx.skipMissing.add("|metric");
      for (const key of gathered.topLevel) {
        fix.push({ op: "remove", path: `/${key}` });
        ctx.skipUnknown.add(`/${key}`);
      }
      for (const key of gathered.encoding) {
        fix.push({ op: "remove", path: `/encoding/${key}` });
        ctx.skipUnknown.add(`/encoding/${key}`);
      }
    }
  }
  if (dropData) fix.push({ op: "remove", path: "/data" });
  if (fix.length === 0) return;

  const moved = fix.some((op) => op.path === "/metric");
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: "gauge, kpi, and progress-ring keep the number in metric",
    path: moved ? "/metric" : "/data",
    hint: dropData
      ? `${METRIC_SHAPE}. Move a data object of those fields into metric and remove data. They are not data keys.`
      : `${METRIC_SHAPE}. Move value, min, max, delta, and label into that object. They are not top-level keys or encoding channels.`,
    fix,
  });
}

/** A kpi may keep a real table for its sparkline. Anything else in data is the metric, misplaced. */
function classifyMetricData(data: unknown): "absent" | "table" | "metric" | "drop" {
  if (data === undefined) return "absent";
  if (isMetricChartTable(data)) return "table";
  if (metricFromData(data)) return "metric";
  return "drop";
}

function isMetricChartTable(data: unknown): boolean {
  if (Array.isArray(data) || isTypedArray(data)) {
    const list = asList(data);
    if (list.length === 0) return false;
    if (list.every((item) => item === null || typeof item === "number")) return true;
    if (!list.every((item) => isPlainObject(item))) return false;
    if (list.length === 1 && isOnlyMetricFields(list[0] as Record<string, unknown>)) return false;
    return true;
  }
  if (!isPlainObject(data)) return false;
  // { values: [...] } is unwrapped by the Vega-Lite repair; don't treat it as the metric object.
  if (Array.isArray(data.values) && data.columns === undefined) return true;
  if (!isPlainObject(data.columns)) return false;
  const columns = data.columns;
  const keys = Object.keys(columns);
  if (keys.length === 0) return false;
  return keys.every((key) => Array.isArray(columns[key]) || isTypedArray(columns[key]));
}

function isOnlyMetricFields(row: Record<string, unknown>): boolean {
  const keys = Object.keys(row);
  return keys.length > 0 && keys.every((key) => (METRIC_FIELDS as readonly string[]).includes(key));
}

function isDropped(path: string, ctx: Ctx): boolean {
  for (const prefix of ctx.dropPaths) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return true;
  }
  return false;
}

function gatherMetric(spec: Record<string, unknown>): { metric: Record<string, unknown>; topLevel: string[]; encoding: string[] } {
  const metric: Record<string, unknown> = {};
  const topLevel: string[] = [];
  const encoding: string[] = [];
  if (isPlainObject(spec.metric)) {
    for (const key of METRIC_FIELDS) {
      const raw = spec.metric[key];
      if (key === "label" ? typeof raw === "string" : typeof raw === "number") metric[key] = raw;
    }
  }
  for (const key of METRIC_FIELDS) {
    if (metric[key] !== undefined || spec[key] === undefined) continue;
    const lifted = liftMetric(spec, spec[key], key);
    if (lifted === undefined) continue;
    metric[key] = lifted;
    topLevel.push(key);
  }
  const enc = isPlainObject(spec.encoding) ? spec.encoding : undefined;
  if (enc) {
    for (const key of METRIC_FIELDS) {
      if (metric[key] !== undefined || enc[key] === undefined) continue;
      const lifted = liftMetric(spec, enc[key], key);
      if (lifted === undefined) continue;
      metric[key] = lifted;
      encoding.push(key);
    }
  }
  if (typeof metric.value !== "number") {
    const fromData = metricFromData(spec.data);
    if (fromData) {
      for (const key of METRIC_FIELDS) {
        if (metric[key] === undefined && fromData[key] !== undefined) metric[key] = fromData[key];
      }
    }
  }
  return { metric, topLevel, encoding };
}

function liftMetric(spec: Record<string, unknown>, raw: unknown, key: string): unknown {
  if (typeof raw === "number") return raw;
  if (key === "label" && typeof raw === "string" && !fieldOnFirstRow(spec, raw)) return raw;
  const field = typeof raw === "string" ? raw : isPlainObject(raw) && typeof raw.field === "string" ? raw.field : undefined;
  if (!field) return undefined;
  const row = firstRow(spec.data);
  if (!row || row[field] === undefined) return undefined;
  const cell = row[field];
  if (typeof cell === "number") return cell;
  if (key === "label" && typeof cell === "string") return cell;
  return undefined;
}

function fieldOnFirstRow(spec: Record<string, unknown>, name: string): boolean {
  const row = firstRow(spec.data);
  return row !== undefined && row[name] !== undefined;
}

function firstRow(data: unknown): Record<string, unknown> | undefined {
  if (Array.isArray(data) && data.length === 1 && isPlainObject(data[0])) return data[0];
  if (isPlainObject(data) && !isPlainObject(data.columns) && typeof data.value === "number") return data;
  return undefined;
}

function metricFromData(data: unknown): Record<string, unknown> | undefined {
  if (typeof data === "number") return { value: data };
  const row = firstRow(data);
  if (!row) return undefined;
  const metric: Record<string, unknown> = {};
  for (const key of METRIC_FIELDS) {
    if (typeof row[key] === "number" || (key === "label" && typeof row[key] === "string")) metric[key] = row[key];
  }
  return typeof metric.value === "number" ? metric : undefined;
}

function noteDonutChannels(encoding: Record<string, unknown>, ctx: Ctx): void {
  const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
  const mark = root.mark;
  const arc = mark === "arc" || (isPlainObject(mark) && mark.type === "arc");
  if (root.type !== "donut" && !arc) return;
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
  pushAxisTitle(fix, ctx, side, value.title);
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: 'axis is "y" or "y2", not an object',
    path,
    hint: 'axis is the string "y" or "y2". Put a title in axes.y.title or axes.y2.title.',
    fix,
  });
}

function emitAxisNull(path: string, ctx: Ctx): void {
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: 'axis is "y" or "y2", not null',
    path,
    hint: 'Omit axis, or set "y" or "y2". Titles go in axes.y.title or axes.y2.title.',
    fix: [{ op: "remove", path }],
  });
}

function emitXAxis(raw: unknown, path: string, ctx: Ctx): void {
  const fix: JsonPatchOperation[] = [{ op: "remove", path }];
  if (isPlainObject(raw)) pushAxisTitle(fix, ctx, "x", raw.title);
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: "encoding.x has no axis field",
    path,
    hint: 'Remove encoding.x.axis. A title goes in axes.x.title. On a y series, axis is the string "y" or "y2".',
    fix,
  });
}

function pushAxisTitle(fix: JsonPatchOperation[], ctx: Ctx, side: string, title: unknown): void {
  if (typeof title !== "string") return;
  const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
  const axes = isPlainObject(root.axes) ? root.axes : undefined;
  if (!axes) fix.push({ op: "add", path: "/axes", value: { [side]: { title } } });
  else if (!isPlainObject(axes[side])) fix.push({ op: "add", path: `/axes/${side}`, value: { title } });
  else if ((axes[side] as Record<string, unknown>).title === undefined) {
    fix.push({ op: "add", path: `/axes/${side}/title`, value: title });
  }
}

function isXChannel(path: string): boolean {
  return path === "/encoding/x" || path.endsWith("/x");
}

function chartTypeName(raw: string, root: unknown): string | undefined {
  return aliasFor(raw, root)?.type ?? ((CHART_TYPES as readonly string[]).includes(raw) ? raw : undefined);
}

function emitUnknownType(value: unknown, ctx: Ctx): void {
  const raw = typeof value === "string" ? value : String(value);
  const kebab = raw.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`).replace(/^-/, "");
  const alias = aliasFor(raw, ctx.rootValue);
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
  note?: string;
  kind: "pie" | "rename";
  layout?: "grid" | "calendar";
}

function aliasFor(value: string, root: unknown): Alias | undefined {
  if (value === "pie") return { type: "donut", note: "mark.innerRadius 0.", kind: "pie" };
  if (value === "arc") return { type: "donut", kind: "rename" };
  if (value === "point" || value === "circle" || value === "square") return { type: "scatter", kind: "rename" };
  if (value === "rect") return { type: "heatmap", kind: "rename" };
  if (value === "rule" || value === "tick") return { type: "spike", kind: "rename" };
  if (value === "metric") {
    const gauge = looksLikeGauge(root);
    return {
      type: gauge ? "gauge" : "kpi",
      note: 'A single number is "gauge" or "kpi", with metric: { value, min, max, label?, delta? }.',
      kind: "rename",
    };
  }
  if (value.startsWith("xychart")) return { type: xyKind(root), kind: "rename" };
  if (value.endsWith("-beta")) {
    const head = value.slice(0, -5);
    if (head === "sankey" || head === "radar" || head === "treemap") return { type: head, kind: "rename" };
  }
  if (value === "area") {
    const stacked = yCount(root) >= 2 || stackFlag(root);
    return stacked
      ? { type: "stacked-area", kind: "rename" }
      : { type: "mini-area", note: 'A full-size filled line is type "line" with mark.area true. Stacked layers are "stacked-area".', kind: "rename" };
  }
  if (value === "grid-heat" || value === "gridheat" || value === "grid_heat") return { type: "heatmap", kind: "rename" };
  if (value === "grid-heatmap") return { type: "heatmap", kind: "rename", layout: "grid" };
  if (value === "calendar-heatmap") return { type: "heatmap", kind: "rename", layout: "calendar" };
  if (value === "hist") return { type: "histogram", kind: "rename" };
  if (value === "box" || value === "box-plot") return { type: "boxplot", kind: "rename" };
  if (value === "radar-chart") return { type: "radar", kind: "rename" };
  if (value === "funnel-chart") return { type: "funnel", kind: "rename" };
  if (value === "tree-map") return { type: "treemap", kind: "rename" };
  if (value === "sankey-diagram") return { type: "sankey", kind: "rename" };
  if (value === "bullet-chart") return { type: "bullet", kind: "rename" };
  if (value === "waterfall-chart") return { type: "waterfall", kind: "rename" };
  return undefined;
}

function xyKind(root: unknown): "line" | "bar" | "combo" {
  const spec = isPlainObject(root) ? root : {};
  const rows = isPlainObject(spec.data) ? spec.data.datasets : 0;
  const blob = JSON.stringify([
    spec.encoding,
    spec.mark,
    spec.series,
    spec.marks,
    spec.layer,
    spec.layers,
    Array.isArray(rows) && rows.map((item) => (item as { type?: unknown })?.type),
  ]);
  const bar = blob.includes('"bar"');
  const line = blob.includes('"line"') || blob.includes('"area"');
  return bar && line ? "combo" : bar ? "bar" : "line";
}

function stackFlag(root: unknown): boolean {
  const spec = isPlainObject(root) ? root : undefined;
  const mark = spec && isPlainObject(spec.mark) ? spec.mark : undefined;
  const flag = spec?.stack ?? spec?.stacked ?? mark?.stack ?? mark?.stacked;
  return flag === true || flag === "stack" || flag === "stacked" || flag === "percent";
}

function looksLikeGauge(root: unknown): boolean {
  if (!isPlainObject(root)) return false;
  if (root.min !== undefined || root.max !== undefined || root.bands !== undefined || root.target !== undefined) return true;
  if (isPlainObject(root.metric) && (root.metric.min !== undefined || root.metric.max !== undefined || root.metric.target !== undefined)) return true;
  const enc = isPlainObject(root.encoding) ? root.encoding : undefined;
  return enc !== undefined && (enc.min !== undefined || enc.max !== undefined);
}

function yCount(root: unknown): number {
  if (!isPlainObject(root)) return 0;
  const enc = isPlainObject(root.encoding) ? root.encoding : undefined;
  if (!enc) return 0;
  const listed = yFieldReplacement(enc.y);
  let count = 0;
  if (Array.isArray(listed)) count = listed.length;
  else if (Array.isArray(enc.y)) count = enc.y.length;
  else if (enc.y !== undefined) count = 1;
  if (enc.y2 !== undefined) count += 1;
  return count;
}

function noteChartType(spec: Record<string, unknown>, ctx: Ctx): void {
  if (ctx.skipUnknown.has("/chartType")) return;
  if (typeof spec.chartType !== "string" || hasKnownType(spec)) return;
  const mapped = chartTypeName(spec.chartType, spec);
  if (!mapped) return;
  const fix: JsonPatchOperation[] = [
    { op: typeof spec.type === "string" ? "replace" : "add", path: "/type", value: mapped },
    { op: "remove", path: "/chartType" },
  ];
  ctx.skipUnknown.add("/chartType");
  ctx.skipMissing.add("|type");
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: "chartType belongs in type",
    path: "/chartType",
    hint: `The chart type is type: ${JSON.stringify(mapped)}. chartType is not a spec key.`,
    fix,
  });
}

function noteFlowChannels(encoding: Record<string, unknown>, ctx: Ctx): void {
  const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
  const type = typeof root.type === "string" ? root.type : "";
  const fix: JsonPatchOperation[] = [];
  const move = (from: string, to: string) => {
    if (encoding[from] === undefined) return;
    ctx.skipUnknown.add(`/encoding/${from}`);
    if (encoding[to] === undefined) {
      fix.push({ op: "move", from: `/encoding/${from}`, path: `/encoding/${to}` });
      ctx.skipMissing.add(`/encoding|${to}`);
    } else fix.push({ op: "remove", path: `/encoding/${from}` });
  };
  if (type === "sankey" || type === "sankey-diagram") {
    move("from", "source");
    move("to", "target");
    move("value", "y");
  } else if (type === "treemap" || type === "tree-map") {
    move("name", "x");
    move("size", "y");
    move("value", "y");
    move("parent", "color");
  } else if (type === "histogram" || type === "hist") {
    if (encoding.x === undefined) move("value", "x");
  }
  if (fix.length === 0) return;
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: "chart channels were moved onto the v1 encoding",
    path: "/encoding",
    hint: "Sankey: source, target, y. Treemap: x, y, color. Histogram bins x.",
    fix,
  });
}

function noteHeatmapChannels(encoding: Record<string, unknown>, ctx: Ctx): void {
  const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
  const intent = heatmapIntent(root);
  if (!intent) return;
  const fix: JsonPatchOperation[] = [];
  if (encoding.value !== undefined) {
    ctx.skipUnknown.add("/encoding/value");
    if (encoding.color === undefined) {
      fix.push({ op: "move", from: "/encoding/value", path: "/encoding/color" });
      ctx.skipMissing.add("/encoding|color");
    } else {
      fix.push({ op: "remove", path: "/encoding/value" });
    }
  }
  if (encoding.date !== undefined && encoding.x === undefined) {
    ctx.skipUnknown.add("/encoding/date");
    fix.push({ op: "move", from: "/encoding/date", path: "/encoding/x" });
    ctx.skipMissing.add("/encoding|x");
  } else if (encoding.date !== undefined) {
    ctx.skipUnknown.add("/encoding/date");
    fix.push({ op: "remove", path: "/encoding/date" });
  }
  if (
    intent === "calendar" &&
    encoding.color === undefined &&
    encoding.value === undefined &&
    encoding.y !== undefined &&
    channelValuesAreNumbers(root, encoding.y)
  ) {
    fix.push({ op: "move", from: "/encoding/y", path: "/encoding/color" });
    ctx.skipMissing.add("/encoding|color");
  }
  if (fix.length === 0) return;
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: "heatmap encodes the number with encoding.color",
    path: "/encoding",
    hint: 'encoding.color is the measure. encoding.value is not a channel. A calendar uses encoding.x for the date. A grid uses encoding.y for the row category.',
    fix,
  });
}

function heatmapIntent(root: Record<string, unknown>): "grid" | "calendar" | "heatmap" | undefined {
  if (root.type === "calendar-heatmap") return "calendar";
  if (root.type === "grid-heatmap") return "grid";
  if (root.type !== "heatmap") return undefined;
  const mark = isPlainObject(root.mark) ? root.mark : undefined;
  if (mark?.layout === "calendar") return "calendar";
  if (mark?.layout === "grid") return "grid";
  return "heatmap";
}

function channelValuesAreNumbers(root: Record<string, unknown>, channel: unknown): boolean {
  const field = fieldName(channel);
  if (!field || !Array.isArray(root.data)) return false;
  let saw = false;
  for (const row of root.data) {
    if (!isPlainObject(row)) continue;
    const cell = row[field];
    if (cell === undefined || cell === null) continue;
    if (typeof cell !== "number") return false;
    saw = true;
  }
  return saw;
}

function noteCombo(spec: Record<string, unknown>, ctx: Ctx): void {
  if (ctx.skipUnknown.has("/$combo")) return;
  const enc = isPlainObject(spec.encoding) ? spec.encoding : undefined;
  const marksArray = Array.isArray(spec.marks) ? spec.marks : undefined;
  const marksObject = marksArray ? undefined : isPlainObject(spec.marks) ? spec.marks : undefined;
  const layer = Array.isArray(spec.layer)
    ? spec.layer
    : marksArray ?? (Array.isArray(spec.layers) ? spec.layers : undefined);
  const markList = Array.isArray(spec.mark) ? spec.mark : undefined;
  const hasY2 = enc?.y2 !== undefined;
  const channelSeries = seriesFromMarkChannels(enc);
  if (!layer && !markList && !hasY2 && channelSeries.length === 0 && !marksObject) return;
  ctx.skipUnknown.add("/$combo");
  const built = channelSeries.length > 0
    ? { series: channelSeries, x: fieldName(enc?.x) }
    : marksObject
      ? { series: seriesFromMarksObject(marksObject), x: fieldName(enc?.x) }
      : comboSeries(spec, layer, markList, enc);
  const fix: JsonPatchOperation[] = [];
  if (spec.type !== "combo") {
    fix.push({ op: typeof spec.type === "string" ? "replace" : "add", path: "/type", value: "combo" });
    ctx.skipMissing.add("|type");
  }
  if (built.series.length > 0) {
    if (!enc) {
      const encoding: Record<string, unknown> = { y: built.series };
      if (built.x) encoding.x = built.x;
      fix.push({ op: "add", path: "/encoding", value: encoding });
      ctx.skipMissing.add("|encoding");
    } else {
      if (built.x && enc.x === undefined) fix.push({ op: "add", path: "/encoding/x", value: built.x });
      fix.push({ op: enc.y === undefined ? "add" : "replace", path: "/encoding/y", value: built.series });
    }
  }
  if (hasY2) {
    fix.push({ op: "remove", path: "/encoding/y2" });
    ctx.skipUnknown.add("/encoding/y2");
  }
  if (Array.isArray(spec.layer)) {
    fix.push({ op: "remove", path: "/layer" });
    ctx.skipUnknown.add("/layer");
  }
  if (spec.marks !== undefined && (marksArray || marksObject)) {
    fix.push({ op: "remove", path: "/marks" });
    ctx.skipUnknown.add("/marks");
  }
  if (Array.isArray(spec.layers)) {
    fix.push({ op: "remove", path: "/layers" });
    ctx.skipUnknown.add("/layers");
  }
  if (markList) {
    fix.push({ op: "remove", path: "/mark" });
    ctx.skipUnknown.add("/mark");
  }
  if (enc) {
    for (const name of ["bar", "line", "area"] as const) {
      if (enc[name] === undefined) continue;
      fix.push({ op: "remove", path: `/encoding/${name}` });
      ctx.skipUnknown.add(`/encoding/${name}`);
    }
  }
  if (built.series.some((series) => series.axis === "y2")) {
    const axes = isPlainObject(spec.axes) ? spec.axes : undefined;
    if (!axes) fix.push({ op: "add", path: "/axes", value: { y2: true } });
    else if (axes.y2 === undefined) fix.push({ op: "add", path: "/axes/y2", value: true });
  }
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: "combo is one spec; each series is an item of encoding.y",
    path: "/type",
    hint: 'A second measure is encoding.y: [{ field, mark: "bar" }, { field, mark: "line", axis: "y2" }]. layer, layers, marks, encoding.bar, encoding.line, and encoding.y2 are not spec keys.',
    fix,
  });
}

function comboSeries(
  spec: Record<string, unknown>,
  layer: unknown[] | undefined,
  markList: unknown[] | undefined,
  enc: Record<string, unknown> | undefined,
): { series: Record<string, unknown>[]; x?: string } {
  if (layer) {
    const series: Record<string, unknown>[] = [];
    let x: string | undefined;
    for (let i = 0; i < layer.length; i++) {
      const item = layer[i];
      if (!isPlainObject(item)) continue;
      const itemEnc = isPlainObject(item.encoding) ? item.encoding : {};
      const field = fieldName(itemEnc.y);
      if (!field) continue;
      x ??= fieldName(itemEnc.x);
      const entry: Record<string, unknown> = { field, mark: comboMark(item.mark) };
      if (series.length > 0) entry.axis = "y2";
      series.push(entry);
    }
    return { series, x };
  }
  const yField = fieldName(enc?.y);
  const y2Field = fieldName(enc?.y2);
  if (yField && y2Field) {
    const first = comboMark(markList?.[0] ?? "bar");
    const second = comboMark(markList?.[1] ?? "line");
    return {
      series: [
        { field: yField, mark: first },
        { field: y2Field, mark: second, axis: "y2" },
      ],
      x: fieldName(enc?.x),
    };
  }
  if (Array.isArray(enc?.y) && markList && markList.length === enc.y.length) {
    const series = enc.y.map((item, index) => {
      const field = fieldName(item);
      return field ? { field, mark: comboMark(markList[index]) } : undefined;
    }).filter((item): item is { field: string; mark: "line" | "bar" | "area" } => item !== undefined);
    return { series, x: fieldName(enc?.x) };
  }
  return { series: [], x: fieldName(enc?.x) ?? fieldName(isPlainObject(spec.encoding) ? spec.encoding.x : undefined) };
}

function seriesFromMarkChannels(enc: Record<string, unknown> | undefined): Record<string, unknown>[] {
  if (!enc) return [];
  const series: Record<string, unknown>[] = [];
  for (const mark of ["bar", "line", "area"] as const) {
    if (enc[mark] === undefined) continue;
    pushSeries(series, mark, enc[mark]);
  }
  return series;
}

function seriesFromMarksObject(marks: Record<string, unknown>): Record<string, unknown>[] {
  const series: Record<string, unknown>[] = [];
  const keys = Object.keys(marks);
  if (keys.some((key) => key === "bar" || key === "line" || key === "area")) {
    for (const mark of ["bar", "line", "area"] as const) {
      if (marks[mark] !== undefined) pushSeries(series, mark, marks[mark]);
    }
    return series;
  }
  for (const [field, raw] of Object.entries(marks)) {
    const name = typeof raw === "string" ? raw : isPlainObject(raw) && typeof raw.type === "string" ? raw.type : undefined;
    if (name !== "bar" && name !== "line" && name !== "area") continue;
    pushSeries(series, name, field);
  }
  return series;
}

function pushSeries(series: Record<string, unknown>[], mark: "line" | "bar" | "area", raw: unknown): void {
  const items = Array.isArray(raw) ? raw : [raw];
  for (const item of items) {
    const field = fieldName(item);
    if (!field) continue;
    const entry: Record<string, unknown> = { field, mark };
    if (series.length > 0) entry.axis = "y2";
    series.push(entry);
  }
}

function fieldName(channel: unknown): string | undefined {
  if (typeof channel === "string") return channel;
  if (isPlainObject(channel) && typeof channel.field === "string") return channel.field;
  return undefined;
}

function comboMark(raw: unknown): "line" | "bar" | "area" {
  const name = typeof raw === "string" ? raw : isPlainObject(raw) && typeof raw.type === "string" ? raw.type : "line";
  if (name === "bar" || name === "area") return name;
  return "line";
}

function hasKnownType(value: unknown): boolean {
  return isPlainObject(value) && typeof value.type === "string" && (CHART_TYPES as readonly string[]).includes(value.type);
}

function ifDemandsChartType(schema: JsonSchema, ctx: Ctx): boolean {
  const node = resolve(schema, ctx.rootSchema);
  return node.required?.includes("type") === true && node.properties?.type?.enum !== undefined;
}

function isTypeBranchNoise(diagnostic: Diagnostic): boolean {
  return diagnostic.code === "CK1003" && /"(metric|color|open|high|low|close)"/.test(diagnostic.message);
}

function formatPresetFix(value: string): { hint: string; value: unknown } | undefined {
  const decimals = /^\.(\d+)f$/.exec(value);
  if (!decimals) return undefined;
  const n = Number(decimals[1]);
  return {
    hint: `did you mean "number"? ${n} decimal places is { "style": "number", "decimals": ${n} }.`,
    value: { style: "number", decimals: n },
  };
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
  const fix: JsonPatchOperation[] = [{ op: "replace", path: "/type", value: alias.type }];
  if (!alias.layout) return fix;
  const rawMark = spec.mark;
  if (rawMark === undefined) fix.push({ op: "add", path: "/mark", value: { layout: alias.layout } });
  else if (isPlainObject(rawMark) && rawMark.layout === undefined) fix.push({ op: "add", path: "/mark/layout", value: alias.layout });
  else if (isPlainObject(rawMark)) fix.push({ op: "replace", path: "/mark/layout", value: alias.layout });
  return fix;
}

const CLICK_KEYS = ["onClick", "click", "onPointClick", "onSeriesClick", "onLegendClick"];

const SHAPE_ALIAS: Record<string, string> = {
  rect: "square",
  rectangle: "square",
  box: "square",
  dot: "circle",
  circle: "circle",
  diamond: "diamond",
  rhombus: "diamond",
  triangle: "triangle",
  "triangle-up": "triangle",
  cross: "cross",
  plus: "cross",
  x: "cross",
  none: "none",
  hidden: "none",
};

const POS_ALIAS: Record<string, string> = {
  above: "top",
  below: "bottom",
  middle: "center",
  in: "inside",
  out: "outside",
  start: "left",
  end: "right",
};

const ENDS_ALIAS: Record<string, string> = {
  end: "last",
  both: "ends",
  firstLast: "ends",
  "first-last": "ends",
};

const MARK_SHAPE_KEYS = ["symbol", "marker", "pointStyle", "markerShape", "markerSymbol"];
const MARK_LABEL_KEYS = ["dataLabels", "showLabels", "showValues", "dataLabel"];
const MARK_TOTAL_KEYS = ["stackLabels", "showTotal", "totals", "totalLabel", "stackLabel"];

function labelWord(value: string, ctx: Ctx): boolean {
  const position = POS_ALIAS[value] ?? (["top", "bottom", "left", "right", "center", "inside", "outside"].includes(value) ? value : "");
  const ends = ENDS_ALIAS[value] ?? (value === "all" || value === "ends" || value === "last" ? value : "");
  if (!position && !ends) return false;
  const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
  const mark = isPlainObject(root.mark) ? root.mark : {};
  const fix: JsonPatchOperation[] = [{ op: "replace", path: "/mark/labels", value: true }];
  if (position && mark.labelPosition === undefined) fix.push({ op: "add", path: "/mark/labelPosition", value: position });
  if (ends && mark.labelEnds === undefined) fix.push({ op: "add", path: "/mark/labelEnds", value: ends });
  emit(ctx, {
    code: "CK1006",
    severity: "error",
    message: `${showPath("/mark/labels")} must be boolean, got ${quote(value)}`,
    path: "/mark/labels",
    hint: position
      ? `labels is true or false. ${quote(value)} means labels on, at ${quote(position)}.`
      : `labels is true or false. ${quote(value)} means labels on, labelEnds ${quote(ends)}.`,
    fix,
  });
  return true;
}

function markHome(path: string): string | null {
  if (path === "/mark" || path === "/encoding/y" || /^\/encoding\/y\/\d+$/.test(path)) return path;
  return null;
}

function markMistake(name: string, path: string, pointer: string, value: unknown, ctx: Ctx): boolean {
  const home = markHome(path);
  if (!home) return false;
  const shape = MARK_SHAPE_KEYS.includes(name) ? (typeof value === "string" ? SHAPE_ALIAS[value] ?? (NAMES_SHAPE.has(value) ? value : "") : "") : "";
  if (MARK_SHAPE_KEYS.includes(name) && shape) {
    emit(ctx, {
      code: "CK1002",
      severity: "error",
      message: `unknown property ${quote(name)}`,
      path: pointer,
      hint: `markers are ${home === "/mark" ? "mark.pointShape" : "pointShape"}: circle, square, diamond, triangle, cross, or none. ${quote(value)} means ${quote(shape)}.`,
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: `${home}/pointShape`, value: shape },
      ],
    });
    return true;
  }
  if (MARK_LABEL_KEYS.includes(name)) {
    const position = typeof value === "string" ? POS_ALIAS[value] ?? (POS_NAMES.has(value) ? value : "") : "";
    const fix: JsonPatchOperation[] = [
      { op: "remove", path: pointer },
      { op: "add", path: home === "/mark" ? "/mark/labels" : `${home}/pointShape`, value: home === "/mark" ? true : "circle" },
    ];
    if (home === "/mark") {
      fix[1] = { op: "add", path: "/mark/labels", value: true };
      if (position) fix.push({ op: "add", path: "/mark/labelPosition", value: position });
    }
    emit(ctx, {
      code: "CK1002",
      severity: "error",
      message: `unknown property ${quote(name)}`,
      path: pointer,
      hint: position ? `labels are mark.labels. ${quote(value)} means on, at ${quote(position)}.` : "labels are mark.labels: true, not a separate key",
      fix: home === "/mark" ? fix : [{ op: "remove", path: pointer }],
    });
    return true;
  }
  if (home === "/mark" && MARK_TOTAL_KEYS.includes(name)) {
    emit(ctx, {
      code: "CK1002",
      severity: "error",
      message: `unknown property ${quote(name)}`,
      path: pointer,
      hint: 'stack totals are mark.stackTotal: true on a stacked bar or stacked area',
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: "/mark/stackTotal", value: true },
      ],
    });
    return true;
  }
  if (home === "/mark" && name === "hollow") {
    emit(ctx, {
      code: "CK1002",
      severity: "error",
      message: `unknown property ${quote(name)}`,
      path: pointer,
      hint: 'hollow markers are mark.pointFill: "hollow"',
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: "/mark/pointFill", value: value === false ? "filled" : "hollow" },
      ],
    });
    return true;
  }
  return false;
}

const NAMES_SHAPE = new Set(["circle", "square", "diamond", "triangle", "cross", "none"]);
const POS_NAMES = new Set(["top", "bottom", "left", "right", "center", "inside", "outside"]);

function emitUnknownProp(name: string, path: string, props: Record<string, JsonSchema>, ctx: Ctx, value?: unknown): void {
  const pointer = join(path, name);
  if (ctx.skipUnknown.has(pointer)) return;
  if (markMistake(name, path, pointer, value, ctx)) return;
  if (CLICK_KEYS.includes(name)) {
    emit(ctx, {
      code: "CK1002",
      severity: "error",
      message: `unknown property ${quote(name)}`,
      path: pointer,
      hint: "clicks are pointclick, seriesclick, and legendclick events, not spec keys",
      fix: [{ op: "remove", path: pointer }],
    });
    return;
  }
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
  if (path === "" && name === "type") {
    emit(ctx, {
      code: "CK1003",
      severity: "error",
      message: `missing required property ${quote(name)}`,
      path: "",
      hint: `set type to one of: ${CHART_TYPES.join(", ")}. The chart type goes in type, not mark.`,
    });
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
