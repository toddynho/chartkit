import type { Diagnostic, JsonPatchOperation } from "./diagnostics";
import { parseSpecifier } from "./format";
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
  /** JSON pointers whose own schema error is replaced by a repair patch. */
  explained: Set<string>;
  /** `if` / `then` re-enters the root. The metric hoist must run once. */
  metricNoted: boolean;
}

const CHART_TYPES = [
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
] as const;

/** Types whose field rules live outside this schema. They stay out of the enum and in the CK1005 list. */
const DEFERRED_TYPES = ["gantt", "timeline", "quadrant", "venn", "journey", "choropleth", "map-points"] as const;

function validTypeList(): string {
  return `${CHART_TYPES.join(", ")}, ${DEFERRED_TYPES.join(", ")}`;
}

export function walkSchema(value: unknown, schema: JsonSchema, diagnostics: Diagnostic[]): void {
  const ctx: Ctx = {
    rootSchema: schema,
    rootValue: value,
    out: diagnostics,
    depth: 0,
    skipMissing: new Set(),
    skipUnknown: new Set(),
    dropPaths: new Set(),
    explained: new Set(),
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
  if (isDropped(path, ctx) || ctx.explained.has(path)) {
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

  if (/^\/encoding\/y(?:\/\d+)?\/stack$/.test(path) && !(typeof value === "string" && value.length > 0)) {
    const named = typeof value === "number" && Number.isFinite(value) ? String(value) : value === true ? "stack" : "";
    emit(ctx, {
      code: "CK3072",
      severity: "error",
      message: `encoding.y[].stack is a group name, got ${describe(value)}`,
      path,
      hint: "series that share encoding.y[].stack stack together. A name used by one series draws unstacked. Example: seats.",
      fix: named ? [{ op: "replace", path, value: named }] : [{ op: "remove", path }],
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
    } else if (path.endsWith("/titlePosition") && typeof value === "string" && TITLE_AT[value]) {
      emit(ctx, {
        code: "CK1007",
        severity: "error",
        message: `${quote(value)} is not one of ${node.enum.map((item) => quote(item)).join(", ")}`,
        path,
        hint: `titlePosition is start, center, or end. ${quote(value)} means ${quote(TITLE_AT[value])}.`,
        fix: [{ op: "replace", path, value: TITLE_AT[value] }],
      });
    } else if (path.endsWith("/tickMarks") && typeof value === "string" && TICK_AT[value]) {
      emit(ctx, {
        code: "CK1007",
        severity: "error",
        message: `${quote(value)} is not one of ${node.enum.map((item) => quote(item)).join(", ")}`,
        path,
        hint: `tickMarks is inside, outside, or none. ${quote(value)} means ${quote(TICK_AT[value])}.`,
        fix: [{ op: "replace", path, value: TICK_AT[value] }],
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
    } else if (path.endsWith("/curve") && typeof value === "string" && CURVE_ALIAS[value] && node.enum.includes(CURVE_ALIAS[value])) {
      const mapped = CURVE_ALIAS[value];
      emit(ctx, {
        code: "CK1007",
        severity: "error",
        message: `${quote(value)} is not one of ${node.enum.map((item) => quote(item)).join(", ")}`,
        path,
        hint: `${quote(value)} means ${quote(mapped)}. The smooth curve is monotone-x, so a spike does not overshoot the data.`,
        fix: [{ op: "replace", path, value: mapped }],
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
    } else if (path.endsWith("/scale/type") && typeof value === "string" && (value === "quantize" || value === "threshold") && !path.includes("/color/")) {
      emit(ctx, {
        code: "CK3063",
        severity: "error",
        message: "quantize and threshold are colour scales",
        path,
        hint: "set encoding.color.scale.type to quantize or threshold. bins sets the quantize width. thresholds sets the cuts.",
        fix: [{ op: "replace", path, value: "linear" }],
      });
    } else if (path.endsWith("/scale/type") && typeof value === "string" && (value === "symLog" || value === "asinh" || value === "bi-symmetric-log" || value === "signed-log")) {
      emit(ctx, {
        code: "CK3070",
        severity: "error",
        message: "symlog is the signed log scale",
        path,
        hint: 'encoding.y.scale.type is "symlog". constant is the linear half-width around zero. Default 1.',
        fix: [{ op: "replace", path, value: "symlog" }],
      });
    } else if (/^\/axes\/(x|y|y2)\/position$/.test(path) && (value === "zero" || value === "origin")) {
      const side = path.split("/")[2] || "x";
      emit(ctx, {
        code: "CK3068",
        severity: "error",
        message: "axis zero is crosses",
        path,
        hint: "axes.x.crosses: 0 draws the x axis through y = 0. axes.y.crosses needs a numeric x.",
        fix: [
          { op: "remove", path },
          { op: "add", path: `/axes/${side}/crosses`, value: 0 },
        ],
      });
    } else if (path.endsWith("/easing") && typeof value === "string") {
      const mapped = value === "ease" || value === "easeOut" || value === "ease-out" ? "ease-out" : value === "easeInOut" || value === "ease-in-out" ? "ease-in-out" : value === "easeIn" ? "ease-in-out" : value === "bounce" || value === "spring" ? "spring" : value === "linear" ? "linear" : "";
      emit(ctx, {
        code: "CK3066",
        severity: "error",
        message: "easing name is not a chartkit curve",
        path,
        hint: "easing is linear, ease-out, ease-in-out, or spring.",
        fix: mapped ? [{ op: "replace", path, value: mapped }] : undefined,
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
      } else if (value.length < 16 && /[.$%,]/.test(value) && /[a-z%]$/.test(value)) {
        emit(ctx, {
          code: "CK3058",
          severity: "error",
          message: "format specifier is not a d3-style pattern",
          path,
          hint: "use .2f, ,.0f, $,.0f, .1%, .2e, +.1f, or s",
          fix: [{ op: "replace", path: path || "/", value: ".2f" }],
        });
      } else {
        const matches = nearMatches(value, node.enum.map(String), 3);
        emit(ctx, {
          code: "CK1007",
          severity: "error",
          message: `${quote(value)} is not one of ${node.enum.map((item) => quote(item)).join(", ")}`,
          path,
          hint: suggestHint(matches),
          fix: matches[0] ? [{ op: "replace", path: path || "/", value: matches[0] }] : undefined,
        });
      }
    } else if (isFacetScales(path, node) && scaleWord(value)) {
      const word = scaleWord(value);
      emit(ctx, {
        code: "CK1007",
        severity: "error",
        message: `${quote(value)} is not one of ${node.enum.map((item) => quote(item)).join(", ")}`,
        path,
        hint: 'layout.facet.scales is "shared" or "independent". sharedScale true means "shared" (one y domain).',
        fix: word ? [{ op: "replace", path: path || "/", value: word }] : undefined,
      });
    } else {
      const named = typeof value === "string" ? PLACE_ALIAS[path.endsWith("/position") ? value : ""] ?? FIELD_TYPE_ALIAS[value] : undefined;
      const alias = named && node.enum.includes(named) ? named : undefined;
      const matches = alias ? [alias] : typeof value === "string" ? nearMatches(value, node.enum.map(String), 3) : [];
      emit(ctx, {
        code: "CK1007",
        severity: "error",
        message: `${quote(value)} is not one of ${node.enum.map((item) => quote(item)).join(", ")}`,
        path,
        hint: suggestHint(matches),
        fix: matches[0] ? [{ op: "replace", path: path || "/", value: matches[0] }] : undefined,
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
      noteMisplaced(value, ctx);
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
  if (ctx.skipUnknown.has("/type")) return;
  const raw = typeof value === "string" ? value : String(value);
  const kebab = raw.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`).replace(/^-/, "");
  const alias = aliasFor(raw, ctx.rootValue);
  const named = alias?.type ?? (CHART_TYPES as readonly string[]).find((t) => t === kebab);
  const matches = named ? [named] : nearMatches(raw, [...CHART_TYPES], 3);
  const closest = matches[0];
  const hintParts = [
    suggestHint(matches),
    `valid: ${validTypeList()}`,
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
  kind: "rename";
  layout?: "grid" | "calendar";
}

function aliasFor(value: string, root: unknown): Alias | undefined {
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
  if (value === "arearange" || value === "area_range" || value === "range-area" || value === "rangearea") return { type: "area-range", kind: "rename" };
  if (value === "columnrange" || value === "column-range" || value === "rangebar" || value === "range-bar" || value === "floating-bar") return { type: "bar-range", kind: "rename" };
  if (value === "error-bar" || value === "error-bars" || value === "errorbars") return { type: "errorbar", kind: "rename" };
  if (value === "sun-burst" || value === "sunburstchart" || value === "sunburst-chart" || value === "partition") return { type: "sunburst", kind: "rename" };
  const folded = value.trim().replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase().replace(/[_]+/g, " ").replace(/-/g, " ").replace(/\s+/g, " ");
  const compact = folded.replace(/ /g, "");
  if (compact === "bubblemap" || folded === "map") return { type: "map-points", kind: "rename" };
  if (compact === "choroplethmap" || folded === "heat map of countries") return { type: "choropleth", kind: "rename" };
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

const FEATURE_CLICKS = ["click", "onClick", "onPointClick", "onSeriesClick", "onLegendClick", "interactions"];

/**
 * Plausible keys agents invent for features that already have a home.
 * One CK1009 and a JSON Patch per feature, so a retry moves the value instead of deleting it.
 */
function noteMisplaced(spec: Record<string, unknown>, ctx: Ctx): void {
  const moves: FeatureMove[] = [];
  const layoutBag: Record<string, unknown> | null = isPlainObject(spec.layout) ? null : {};
  const interactionBag: Record<string, unknown> | null = isPlainObject(spec.interaction) ? null : {};

  const layoutOps = new Map<string, JsonPatchOperation>();
  const placedInteraction = new Set<string>();
  const putLayout = (key: string, value: unknown, fix: JsonPatchOperation[]) => {
    if (value === undefined) return;
    if (layoutBag) {
      layoutBag[key] = mergeLayoutValue(layoutBag[key], value);
      return;
    }
    const layout = spec.layout as Record<string, unknown>;
    const existing = layoutOps.get(key);
    const base = existing ? existing.value : layout[key];
    const merged = mergeLayoutValue(base, value);
    if (existing) {
      existing.value = merged;
      return;
    }
    if (JSON.stringify(layout[key]) === JSON.stringify(merged)) return;
    const op: JsonPatchOperation = {
      op: layout[key] === undefined ? "add" : "replace",
      path: `/layout/${key}`,
      value: merged,
    };
    layoutOps.set(key, op);
    fix.push(op);
  };
  const putInteraction = (key: string, value: unknown, fix: JsonPatchOperation[]) => {
    if (placedInteraction.has(key)) return;
    placedInteraction.add(key);
    if (interactionBag) {
      interactionBag[key] = value;
      return;
    }
    const interaction = spec.interaction as Record<string, unknown>;
    if (interaction[key] === undefined) fix.push({ op: "add", path: `/interaction/${key}`, value });
  };

  const facetMove = facetFeature(spec, ctx, putLayout);
  if (facetMove) moves.push(facetMove);
  const concatMove = concatFeature(spec, ctx, putLayout);
  if (concatMove) moves.push(concatMove);
  const breakMove = breakpointFeature(spec, ctx, putLayout);
  if (breakMove) moves.push(breakMove);
  const syncMove = syncFeature(spec, ctx, putInteraction);
  if (syncMove) moves.push(syncMove);
  const navMove = navigatorFeature(spec, ctx, putInteraction);
  if (navMove) moves.push(navMove);
  const drillMove = drillFeature(spec, ctx, putInteraction);
  if (drillMove) moves.push(drillMove);
  const samplingMove = samplingFeature(spec, ctx);
  if (samplingMove) moves.push(samplingMove);
  for (const move of looseFeatures(spec, ctx, putLayout, putInteraction)) moves.push(move);
  const facetType = facetTypeFeature(spec, ctx);
  if (facetType) moves.push(facetType);
  const optionsMove = optionsFeature(spec, ctx, putLayout, putInteraction);
  if (optionsMove) moves.push(optionsMove);

  if (layoutBag && Object.keys(layoutBag).length > 0) {
    moves.find((move) => move.layout)?.fix.unshift({ op: "add", path: "/layout", value: layoutBag });
  }
  if (interactionBag && Object.keys(interactionBag).length > 0) {
    moves.find((move) => move.interaction)?.fix.unshift({ op: "add", path: "/interaction", value: interactionBag });
  }
  for (const move of moves) {
    emit(ctx, {
      code: "CK1009",
      severity: "error",
      message: move.message,
      path: move.path,
      hint: move.hint,
      fix: move.fix.length > 0 ? move.fix : undefined,
    });
  }
}

interface FeatureMove {
  path: string;
  message: string;
  hint: string;
  fix: JsonPatchOperation[];
  layout?: boolean;
  interaction?: boolean;
}

function facetFeature(
  spec: Record<string, unknown>,
  ctx: Ctx,
  putLayout: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
): FeatureMove | undefined {
  const encoding = isPlainObject(spec.encoding) ? spec.encoding : undefined;
  const small = spec.type === "small-multiples";
  if (spec.facet === undefined && encoding?.facet === undefined && !small) return undefined;
  const payload = spec.facet !== undefined ? facetPayload(spec.facet) : encoding?.facet !== undefined ? facetPayload(encoding.facet) : undefined;
  const fix: JsonPatchOperation[] = [];
  if (payload !== undefined) putLayout("facet", payload, fix);
  if (spec.facet !== undefined) {
    ctx.skipUnknown.add("/facet");
    fix.push({ op: "remove", path: "/facet" });
  }
  if (encoding?.facet !== undefined) {
    ctx.skipUnknown.add("/encoding/facet");
    fix.push({ op: "remove", path: "/encoding/facet" });
  }
  return {
    path: spec.facet !== undefined ? "/facet" : encoding?.facet !== undefined ? "/encoding/facet" : "/type",
    message: "small multiples are layout.facet",
    hint: 'A faceted chart keeps its chart type and sets layout.facet: { field }. A top-level facet, encoding.facet, and type "small-multiples" are not the facet.',
    fix,
    layout: true,
  };
}

function facetPayload(value: unknown): unknown {
  if (typeof value === "string" && value) return { field: value };
  if (!isPlainObject(value) || value.scales !== undefined) return value;
  const scales = facetScaleWord(value);
  if (!scales) return value;
  const next: Record<string, unknown> = { ...value, scales };
  for (const key of Object.keys(next)) {
    if (FACET_SCALE_KEYS.has(key.toLowerCase())) delete next[key];
  }
  return next;
}

function concatFeature(
  spec: Record<string, unknown>,
  ctx: Ctx,
  putLayout: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
): FeatureMove | undefined {
  const layout = isPlainObject(spec.layout) ? spec.layout : undefined;
  const options = isPlainObject(spec.options) ? spec.options : undefined;
  const optionLayout = options && isPlainObject(options.layout) ? options.layout : undefined;
  const pairs: [string, unknown][] = [
    ["/charts", spec.charts],
    ["/views", spec.views],
    ["/concat", spec.concat],
    ["/layout/charts", layout?.charts],
    ["/options/charts", options?.charts],
    ["/options/views", options?.views],
    ["/options/concat", options?.concat],
    ["/options/layout/charts", optionLayout?.charts],
    ["/options/layout/concat", optionLayout?.concat],
  ];
  const sources: string[] = [];
  const views: unknown[] = [];
  let foundViews = false;
  for (const [source, raw] of pairs) {
    if (raw === undefined) continue;
    sources.push(source);
    const list = concatViewsOf(raw);
    if (!list) continue;
    foundViews = true;
    for (const view of list) views.push(withViewType(view));
  }
  const dashboard = spec.type === "concat" || spec.type === "dashboard";
  const topFlow = flowOf(spec);
  const direction = topFlow ?? flowOf(spec.concat) ?? flowOf(options?.concat) ?? flowOf(optionLayout?.concat) ?? flowOf(layout);
  if (sources.length === 0 && !direction && !dashboard) return undefined;
  const fix: JsonPatchOperation[] = [];
  const concat: Record<string, unknown> = {};
  if (views.length > 0) concat.views = views;
  if (direction) concat.direction = direction;
  const gap = gapOf(spec.concat) ?? gapOf(options?.concat) ?? gapOf(optionLayout?.concat);
  if (gap !== undefined) concat.gap = gap;
  if (Object.keys(concat).length > 0) putLayout("concat", concat, fix);
  for (const source of sources) {
    ctx.skipUnknown.add(source);
    if (foundViews || source === "/concat" || source.endsWith("/concat")) fix.push({ op: "remove", path: source });
  }
  if (topFlow) {
    ctx.skipUnknown.add("/direction");
    fix.push({ op: "remove", path: "/direction" });
  }
  if (direction && !topFlow && (layout?.direction === "vertical" || layout?.direction === "horizontal")) {
    ctx.explained.add("/layout/direction");
    fix.push({ op: "remove", path: "/layout/direction" });
  }
  if (dashboard) {
    const existing = isPlainObject(layout?.concat) && Array.isArray(layout.concat.views) ? layout.concat.views : [];
    const host = [...existing, ...views]
      .map((view) => (isPlainObject(view) && typeof view.type === "string" ? view.type : ""))
      .find((type) => type && type !== "concat" && type !== "dashboard") ?? "line";
    fix.push({ op: "replace", path: "/type", value: host });
    ctx.skipMissing.add("|type");
    ctx.skipUnknown.add("/type");
  }
  return {
    path: dashboard ? "/type" : sources[0] ?? (topFlow ? "/direction" : "/layout/direction"),
    message: dashboard ? "a dashboard is layout.concat" : "several charts are layout.concat.views",
    hint: 'layout.concat.views is a list of chart specs, each with a type. layout.concat is { views, direction }. direction "vertical" or "horizontal" is layout.concat.direction. type "concat" and type "dashboard" are not chart types. When views is set, the outer spec may omit type. layout.direction is "ltr" or "rtl".',
    fix,
    layout: true,
  };
}

function withViewType(view: unknown): unknown {
  if (!isPlainObject(view)) return view;
  if (typeof view.type === "string" && view.type && view.type !== "concat" && view.type !== "dashboard") return view;
  const mark = typeof view.mark === "string" ? view.mark : undefined;
  const named = mark ? aliasFor(mark, view)?.type ?? ((CHART_TYPES as readonly string[]).includes(mark) ? mark : undefined) : undefined;
  return { ...view, type: named ?? "line" };
}

function viewsPayload(value: unknown): unknown[] | undefined {
  if (Array.isArray(value)) return value;
  if (!isPlainObject(value)) return undefined;
  const views = Object.values(value).filter((item) => isPlainObject(item));
  return views.length > 0 ? views : undefined;
}

function concatViewsOf(value: unknown): unknown[] | undefined {
  if (Array.isArray(value)) return value;
  if (!isPlainObject(value)) return undefined;
  if (Array.isArray(value.views)) return value.views;
  return viewsPayload(value);
}

function flowOf(value: unknown): "vertical" | "horizontal" | undefined {
  if (!isPlainObject(value)) return undefined;
  return value.direction === "vertical" || value.direction === "horizontal" ? value.direction : undefined;
}

function gapOf(value: unknown): number | undefined {
  return isPlainObject(value) && typeof value.gap === "number" ? value.gap : undefined;
}

function concatRest(value: unknown): unknown {
  if (Array.isArray(value)) return undefined;
  if (!isPlainObject(value) || !Object.prototype.hasOwnProperty.call(value, "views")) return value;
  const rest = { ...value };
  delete rest.views;
  return Object.keys(rest).length > 0 ? rest : undefined;
}

function mergeLayoutValue(current: unknown, extra: unknown): unknown {
  if (current === undefined) return extra;
  if (isPlainObject(current) && isPlainObject(extra)) {
    const out: Record<string, unknown> = { ...current };
    for (const [key, item] of Object.entries(extra)) {
      out[key] = key === "views" ? mergeViewLists(out.views, item) : item;
    }
    return out;
  }
  return extra;
}

function mergeViewLists(current: unknown, extra: unknown): unknown[] {
  const first = Array.isArray(current) ? current : [];
  const second = Array.isArray(extra) ? extra : [];
  const seen = new Set(first.map((item) => JSON.stringify(item)));
  const out = [...first];
  for (const item of second) {
    const key = JSON.stringify(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

const FACET_SCALE_KEYS = new Set(["sharedscale", "sharedscales", "samescale", "sharescale", "yscale", "scale"]);

function scaleWord(value: unknown): "shared" | "independent" | undefined {
  if (value === true) return "shared";
  if (value === false) return "independent";
  if (typeof value === "string") {
    const word = value.trim().toLowerCase();
    if (word === "true" || word === "shared" || word === "same" || word === "sync" || word === "locked" || word === "common" || word === "together") return "shared";
    if (word === "false" || word === "independent" || word === "separate") return "independent";
    return undefined;
  }
  if (isPlainObject(value)) {
    if (value.shared === true || value.y === "shared") return "shared";
    if (value.shared === false || value.y === "independent") return "independent";
  }
  return undefined;
}

function facetScaleWord(value: Record<string, unknown>): "shared" | "independent" | undefined {
  for (const [key, item] of Object.entries(value)) {
    if (!FACET_SCALE_KEYS.has(key.toLowerCase())) continue;
    const word = scaleWord(item);
    if (word) return word;
  }
  return undefined;
}

function isFacetScales(path: string, node: { enum?: unknown[] }): boolean {
  return path.endsWith("/scales") && node.enum?.includes("shared") === true && node.enum.includes("independent") === true;
}

function breakpointFeature(
  spec: Record<string, unknown>,
  ctx: Ctx,
  putLayout: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
): FeatureMove | undefined {
  const legend = spec.legend;
  const rule: Record<string, unknown> = { legend: false };
  const removes: string[] = [];
  if (typeof legend === "string" && isMediaQuery(legend)) {
    const width = mediaWidth(legend);
    if (width !== undefined) rule.maxWidth = width;
    removes.push("/legend");
    ctx.explained.add("/legend");
  } else if (isPlainObject(legend)) {
    for (const [key, value] of Object.entries(legend)) {
      if (key !== "responsive" && !isMediaQuery(value)) continue;
      if (rule.maxWidth === undefined) {
        if (typeof value === "string") {
          const width = mediaWidth(value);
          if (width !== undefined) rule.maxWidth = width;
        } else if (isPlainObject(value) && typeof value.maxWidth === "number" && value.maxWidth > 0) {
          rule.maxWidth = value.maxWidth;
        }
      }
      removes.push(`/legend/${key}`);
      if (key === "responsive") ctx.skipUnknown.add(`/legend/${key}`);
      else ctx.explained.add(`/legend/${key}`);
    }
  }
  if (removes.length === 0) return undefined;
  const fix: JsonPatchOperation[] = [];
  const layout = isPlainObject(spec.layout) ? spec.layout : undefined;
  if (Array.isArray(layout?.breakpoints)) fix.push({ op: "add", path: "/layout/breakpoints/-", value: rule });
  else putLayout("breakpoints", [rule], fix);
  for (const path of removes) fix.push({ op: "remove", path });
  return {
    path: removes[0] ?? "/legend",
    message: "a responsive legend is layout.breakpoints",
    hint: "Hide the legend on a narrow chart with layout.breakpoints: [{ maxWidth, legend: false }]. legend.responsive and media queries are not legend fields.",
    fix,
    layout: true,
  };
}

function isMediaQuery(value: unknown): value is string {
  return typeof value === "string" && /@media|max-width|min-width|maxWidth/i.test(value);
}

function mediaWidth(value: string): number | undefined {
  const match = /max-?width\s*[:=]\s*(\d+(?:\.\d+)?)\s*px/i.exec(value);
  if (!match) return undefined;
  const width = Number(match[1]);
  return Number.isFinite(width) && width > 0 ? width : undefined;
}

function syncFeature(
  spec: Record<string, unknown>,
  ctx: Ctx,
  putInteraction: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
): FeatureMove | undefined {
  if (spec.sync === undefined) return undefined;
  const fix: JsonPatchOperation[] = [];
  const id = syncId(spec.sync);
  if (id) putInteraction("sync", id, fix);
  ctx.skipUnknown.add("/sync");
  fix.push({ op: "remove", path: "/sync" });
  return {
    path: "/sync",
    message: "sync belongs in interaction.sync",
    hint: "interaction.sync is a string group id. Charts with the same id share the crosshair and the x window.",
    fix,
    interaction: true,
  };
}

function syncId(value: unknown): string | undefined {
  if (typeof value === "string" && value) return value;
  if (!isPlainObject(value)) return undefined;
  for (const key of ["group", "id", "key", "name"]) {
    const id = value[key];
    if (typeof id === "string" && id) return id;
  }
  return undefined;
}

function navigatorFeature(
  spec: Record<string, unknown>,
  ctx: Ctx,
  putInteraction: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
): FeatureMove | undefined {
  const removes: string[] = [];
  let value: unknown;
  if (asksForOverview(spec.brush)) {
    value = navigatorValue(spec.brush);
    removes.push("/brush");
    ctx.skipUnknown.add("/brush");
  }
  const interaction = isPlainObject(spec.interaction) ? spec.interaction : undefined;
  if (interaction && asksForOverview(interaction.brush)) {
    value ??= navigatorValue(interaction.brush);
    removes.push("/interaction/brush");
    ctx.explained.add("/interaction/brush");
  }
  if (removes.length === 0 || value === undefined) return undefined;
  const fix: JsonPatchOperation[] = [];
  putInteraction("navigator", value, fix);
  for (const path of removes) fix.push({ op: "remove", path });
  return {
    path: removes[0] ?? "/brush",
    message: "an overview brush is interaction.navigator",
    hint: 'interaction.navigator is true or { height }. interaction.brush is "none" or "x" for a range select, not the overview.',
    fix,
    interaction: true,
  };
}

function asksForOverview(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === "string") return /overview|navigator|minimap/i.test(value);
  if (!isPlainObject(value)) return false;
  if (value.x === true && value.height === undefined && value.overview === undefined && value.navigator === undefined && value.type === undefined) return false;
  return true;
}

function navigatorValue(value: unknown): unknown {
  if (isPlainObject(value) && typeof value.height === "number") return { height: value.height };
  return true;
}

function drillFeature(
  spec: Record<string, unknown>,
  ctx: Ctx,
  putInteraction: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
): FeatureMove | undefined {
  const found: { path: string; value: unknown; children: Record<string, unknown> }[] = [];
  const consider = (path: string, value: unknown) => {
    const children = childMap(value);
    if (!children) return;
    found.push({ path, value, children });
  };
  for (const key of FEATURE_CLICKS) {
    if (spec[key] !== undefined) consider(`/${key}`, spec[key]);
  }
  const interaction = isPlainObject(spec.interaction) ? spec.interaction : undefined;
  if (interaction) {
    for (const key of FEATURE_CLICKS) {
      if (interaction[key] !== undefined) consider(`/interaction/${key}`, interaction[key]);
    }
  }
  if (found.length === 0) return undefined;
  const children: Record<string, unknown> = {};
  let key: string | undefined;
  for (const item of found) {
    Object.assign(children, item.children);
    if (!key && isPlainObject(item.value) && typeof item.value.key === "string" && item.value.key) key = item.value.key;
  }
  const keyed = keyedDrillChildren(spec, children);
  const drill: Record<string, unknown> = { children: keyed ?? children };
  if (key) drill.key = key;
  const fix: JsonPatchOperation[] = [];
  putInteraction("drilldown", drill, fix);
  for (const item of found) {
    ctx.skipUnknown.add(item.path);
    fix.push({ op: "remove", path: item.path });
  }
  return {
    path: found[0]?.path ?? "/click",
    message: "a child chart is interaction.drilldown",
    hint: "Clicking a category swaps in interaction.drilldown.children, keyed by the clicked x value. click, onClick, and interactions are not spec keys.",
    fix,
    interaction: true,
  };
}

function childMap(value: unknown): Record<string, unknown> | undefined {
  if (!isPlainObject(value)) return undefined;
  if (isPlainObject(value.children)) {
    const children: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value.children)) {
      if (isPlainObject(child)) children[key] = child;
    }
    if (Object.keys(children).length > 0) return children;
  }
  if (typeof value.type === "string" && value.type) {
    const id = typeof value.id === "string" && value.id ? value.id : "detail";
    return { [id]: value };
  }
  const children: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === "key") continue;
    if (isPlainObject(child) && typeof child.type === "string") children[key] = child;
  }
  if (Object.keys(children).length > 0) return children;
  if (value.click !== undefined) return childMap(value.click);
  if (value.onClick !== undefined) return childMap(value.onClick);
  return undefined;
}

const DRILL_PLACEHOLDER = new Set(["chart", "child", "spec", "default", "detail", "view", "series", "plot", "item", "graph", "drill", "drilldown"]);

/** Children keyed by the clicked x value, when those values can be read from the data. */
export function keyedDrillChildren(spec: unknown, children: unknown): Record<string, unknown> | undefined {
  if (!isPlainObject(spec)) return undefined;
  const encoding = isPlainObject(spec.encoding) ? spec.encoding : undefined;
  const field = fieldName(encoding?.x);
  if (!field) return undefined;
  const rows = rowsForField(spec.data, field);
  if (!rows) return undefined;
  const seen: string[] = [];
  for (const row of rows) {
    const cell = row[field];
    if (cell == null || cell === "") continue;
    const label = String(cell);
    if (!seen.includes(label)) seen.push(label);
  }
  if (seen.length === 0) return undefined;
  if (!shouldRekeyChildren(children, seen)) return undefined;
  const specs = drillSpecs(children);
  if (!specs) return undefined;
  if (specs.length !== 1 && specs.length !== seen.length) return undefined;
  const keyed: Record<string, unknown> = {};
  for (let i = 0; i < seen.length; i++) keyed[seen[i]] = specs.length === 1 ? specs[0] : specs[i];
  return keyed;
}

function shouldRekeyChildren(children: unknown, categories: string[]): boolean {
  if (Array.isArray(children)) return children.some((item) => isPlainObject(item));
  if (!isPlainObject(children)) return false;
  const keys = Object.keys(children);
  if (keys.length === 0 || keys.every((key) => categories.includes(key))) return false;
  return keys.every((key) => DRILL_PLACEHOLDER.has(key.trim().toLowerCase()));
}

function drillSpecs(children: unknown): Record<string, unknown>[] | undefined {
  const list = Array.isArray(children) ? children : isPlainObject(children) ? Object.values(children) : [];
  const specs = list.filter((item): item is Record<string, unknown> => isPlainObject(item));
  return specs.length > 0 ? specs : undefined;
}

function rowsForField(data: unknown, field: string): Record<string, unknown>[] | undefined {
  if (Array.isArray(data)) {
    const rows = data.filter((item): item is Record<string, unknown> => isPlainObject(item) && field in item);
    return rows.length > 0 ? rows : undefined;
  }
  if (!isPlainObject(data)) return undefined;
  if (isPlainObject(data.columns) && Array.isArray((data.columns as Record<string, unknown>)[field])) {
    const columns = data.columns as Record<string, unknown[]>;
    const list = columns[field];
    return list.map((_, index) => {
      const row: Record<string, unknown> = {};
      for (const [key, column] of Object.entries(columns)) row[key] = Array.isArray(column) ? column[index] : undefined;
      return row;
    });
  }
  for (const value of Object.values(data)) {
    if (!Array.isArray(value)) continue;
    const rows = value.filter((item): item is Record<string, unknown> => isPlainObject(item) && field in item);
    if (rows.length > 0) return rows;
  }
  return undefined;
}

function samplingFeature(spec: Record<string, unknown>, ctx: Ctx): FeatureMove | undefined {
  const top = spec.sampling;
  const data = isPlainObject(spec.data) ? spec.data : undefined;
  const nested = data && data.columns === undefined ? data.sampling : undefined;
  if (top === undefined && nested === undefined) return undefined;
  const value = top !== undefined ? top : nested;
  const fix: JsonPatchOperation[] = [];
  const mark = isPlainObject(spec.mark) ? spec.mark : undefined;
  if (!mark) fix.push({ op: "add", path: "/mark", value: { sampling: value } });
  else if (mark.sampling === undefined) fix.push({ op: "add", path: "/mark/sampling", value });
  if (top !== undefined) {
    ctx.skipUnknown.add("/sampling");
    fix.push({ op: "remove", path: "/sampling" });
  }
  if (nested !== undefined && data) {
    fix.push({ op: "remove", path: "/data/sampling" });
  }
  return {
    path: top !== undefined ? "/sampling" : "/data/sampling",
    message: "sampling belongs in mark.sampling",
    hint: 'mark.sampling is "lttb", "minmax", "auto", or "none". A top-level sampling and data.sampling on a row object move there. A columnar table may still set data.sampling.',
    fix,
  };
}

function looseFeatures(
  spec: Record<string, unknown>,
  ctx: Ctx,
  putLayout: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
  putInteraction: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
): FeatureMove[] {
  const moves: FeatureMove[] = [];
  if (spec.navigator !== undefined) {
    const fix: JsonPatchOperation[] = [];
    const value = typeof spec.navigator === "boolean" ? spec.navigator : navigatorValue(spec.navigator);
    putInteraction("navigator", value, fix);
    ctx.skipUnknown.add("/navigator");
    fix.push({ op: "remove", path: "/navigator" });
    moves.push({
      path: "/navigator",
      message: "navigator belongs in interaction.navigator",
      hint: 'interaction.navigator is true or { height }. It is not a top-level key.',
      fix,
      interaction: true,
    });
  }
  if (spec.drilldown !== undefined) {
    const fix: JsonPatchOperation[] = [];
    putInteraction("drilldown", drillPayload(spec, spec.drilldown), fix);
    ctx.skipUnknown.add("/drilldown");
    fix.push({ op: "remove", path: "/drilldown" });
    moves.push({
      path: "/drilldown",
      message: "drilldown belongs in interaction.drilldown",
      hint: "interaction.drilldown.children is keyed by the clicked x value. drilldown is not a top-level key.",
      fix,
      interaction: true,
    });
  }
  if (spec.breakpoints !== undefined) {
    const fix: JsonPatchOperation[] = [];
    putLayout("breakpoints", spec.breakpoints, fix);
    ctx.skipUnknown.add("/breakpoints");
    fix.push({ op: "remove", path: "/breakpoints" });
    moves.push({
      path: "/breakpoints",
      message: "breakpoints belong in layout.breakpoints",
      hint: "Hide the legend on a narrow chart with layout.breakpoints: [{ maxWidth, legend: false }].",
      fix,
      layout: true,
    });
  }
  if (spec.rtl !== undefined) {
    const fix: JsonPatchOperation[] = [];
    putLayout("direction", spec.rtl === false || spec.rtl === "ltr" ? "ltr" : "rtl", fix);
    ctx.skipUnknown.add("/rtl");
    fix.push({ op: "remove", path: "/rtl" });
    moves.push({
      path: "/rtl",
      message: "rtl belongs in layout.direction",
      hint: 'Right to left is layout.direction: "rtl". rtl: true is not a spec key.',
      fix,
      layout: true,
    });
  }
  if (typeof spec.direction === "string" && (spec.direction === "rtl" || spec.direction === "ltr")) {
    const fix: JsonPatchOperation[] = [];
    putLayout("direction", spec.direction, fix);
    ctx.skipUnknown.add("/direction");
    fix.push({ op: "remove", path: "/direction" });
    moves.push({
      path: "/direction",
      message: "direction belongs in layout.direction",
      hint: 'layout.direction is "ltr" or "rtl". "vertical" and "horizontal" are layout.concat.direction.',
      fix,
      layout: true,
    });
  }
  return moves;
}

function drillPayload(spec: Record<string, unknown>, value: unknown): unknown {
  if (Array.isArray(value)) {
    const keyed = keyedDrillChildren(spec, value);
    return { children: keyed ?? {} };
  }
  if (!isPlainObject(value)) return { children: {} };
  if (value.children !== undefined || typeof value.key === "string") {
    const keyed = keyedDrillChildren(spec, value.children);
    return keyed ? { ...value, children: keyed } : value;
  }
  if (typeof value.type === "string") {
    const keyed = keyedDrillChildren(spec, [value]);
    return { children: keyed ?? { detail: value } };
  }
  const keyed = keyedDrillChildren(spec, value);
  return { children: keyed ?? value };
}

function facetTypeFeature(spec: Record<string, unknown>, ctx: Ctx): FeatureMove | undefined {
  const layout = isPlainObject(spec.layout) ? spec.layout : undefined;
  const facet = layout && isPlainObject(layout.facet) ? layout.facet : undefined;
  if (!facet || typeof facet.type !== "string" || facet.type === "") return undefined;
  const named = aliasFor(facet.type, spec)?.type ?? facet.type;
  const fix: JsonPatchOperation[] = [];
  if (spec.type !== named) fix.push({ op: typeof spec.type === "string" ? "replace" : "add", path: "/type", value: named });
  ctx.skipUnknown.add("/layout/facet/type");
  fix.push({ op: "remove", path: "/layout/facet/type" });
  ctx.skipMissing.add("|type");
  return {
    path: "/layout/facet/type",
    message: "the chart type belongs on the spec",
    hint: "layout.facet sets field and columns. Move layout.facet.type to the spec's top-level type.",
    fix,
  };
}

function optionsFeature(
  spec: Record<string, unknown>,
  ctx: Ctx,
  putLayout: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
  putInteraction: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
): FeatureMove | undefined {
  if (!isPlainObject(spec.options)) return undefined;
  const options = spec.options;
  const fix: JsonPatchOperation[] = [];
  const take = (key: string): unknown => {
    if (options[key] === undefined) return undefined;
    ctx.skipUnknown.add(`/options/${key}`);
    return options[key];
  };
  const interaction = isPlainObject(options.interaction) ? options.interaction : undefined;
  if (interaction) {
    ctx.skipUnknown.add("/options/interaction");
    if (interaction.navigator !== undefined) putInteraction("navigator", typeof interaction.navigator === "boolean" ? interaction.navigator : navigatorValue(interaction.navigator), fix);
    if (interaction.drilldown !== undefined) putInteraction("drilldown", drillPayload(spec, interaction.drilldown), fix);
    const id = interaction.sync !== undefined ? syncId(interaction.sync) : undefined;
    if (id) putInteraction("sync", id, fix);
  }
  const layout = isPlainObject(options.layout) ? options.layout : undefined;
  if (layout) {
    ctx.skipUnknown.add("/options/layout");
    if (layout.facet !== undefined) putLayout("facet", facetPayload(layout.facet), fix);
    if (layout.concat !== undefined) putLayout("concat", concatRest(layout.concat), fix);
    if (layout.breakpoints !== undefined) putLayout("breakpoints", layout.breakpoints, fix);
    if (layout.direction === "ltr" || layout.direction === "rtl") putLayout("direction", layout.direction, fix);
  }
  const navigator = take("navigator");
  if (navigator !== undefined) putInteraction("navigator", typeof navigator === "boolean" ? navigator : navigatorValue(navigator), fix);
  const drilldown = take("drilldown");
  if (drilldown !== undefined) putInteraction("drilldown", drillPayload(spec, drilldown), fix);
  const sync = take("sync");
  if (sync !== undefined) {
    const id = syncId(sync);
    if (id) putInteraction("sync", id, fix);
  }
  const breakpoints = take("breakpoints");
  if (breakpoints !== undefined) putLayout("breakpoints", breakpoints, fix);
  const facet = take("facet");
  if (facet !== undefined) putLayout("facet", facetPayload(facet), fix);
  let concat = take("concat");
  const direction = take("direction");
  if (direction === "ltr" || direction === "rtl") putLayout("direction", direction, fix);
  else if (direction === "horizontal" || direction === "vertical") {
    concat = isPlainObject(concat) ? { ...concat, direction } : concat !== undefined ? { views: concat, direction } : { direction };
  }
  if (concat !== undefined) putLayout("concat", concatRest(concat), fix);
  const rtl = take("rtl");
  if (rtl !== undefined) putLayout("direction", rtl === false || rtl === "ltr" ? "ltr" : "rtl", fix);
  const sampling = take("sampling");
  const dataSampling = isPlainObject(spec.data) && spec.data.columns === undefined && spec.data.sampling !== undefined;
  if (sampling !== undefined && spec.sampling === undefined && !dataSampling) {
    const mark = isPlainObject(spec.mark) ? spec.mark : undefined;
    if (!mark) fix.push({ op: "add", path: "/mark", value: { sampling } });
    else if (mark.sampling === undefined) fix.push({ op: "add", path: "/mark/sampling", value: sampling });
  }
  const renderMode = take("render");
  if ((renderMode === "svg" || renderMode === "canvas" || renderMode === "auto") && spec.render === undefined) {
    fix.push({ op: "add", path: "/render", value: renderMode });
  }
  ctx.skipUnknown.add("/options");
  fix.push({ op: "remove", path: "/options" });
  return {
    path: "/options",
    message: "options unwraps onto interaction, layout, and mark",
    hint: "There is no options object. interaction holds navigator, sync, and drilldown. layout holds facet, concat, breakpoints, and direction. mark.sampling and render sit on the spec.",
    fix,
    layout: true,
    interaction: true,
  };
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
    if (encoding.id === undefined) move("parent", "color");
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
  if (decimals) {
    const n = Number(decimals[1]);
    return {
      hint: `did you mean "number"? ${n} decimal places is { "style": "number", "decimals": ${n} }.`,
      value: { style: "number", decimals: n },
    };
  }
  if (!parseSpecifier(value)) return undefined;
  return {
    hint: `${quote(value)} is a d3-style specifier. Use { "specifier": ${quote(value)} }.`,
    value: { specifier: value },
  };
}

function aliasFix(root: unknown, alias: Alias): JsonPatchOperation[] {
  const spec = isPlainObject(root) ? root : {};
  const fix: JsonPatchOperation[] = [{ op: "replace", path: "/type", value: alias.type }];
  if (!alias.layout) return fix;
  const rawMark = spec.mark;
  if (rawMark === undefined) fix.push({ op: "add", path: "/mark", value: { layout: alias.layout } });
  else if (isPlainObject(rawMark) && rawMark.layout === undefined) fix.push({ op: "add", path: "/mark/layout", value: alias.layout });
  else if (isPlainObject(rawMark)) fix.push({ op: "replace", path: "/mark/layout", value: alias.layout });
  return fix;
}

const CLICK_KEYS = ["onClick", "click", "onPointClick", "onSeriesClick", "onLegendClick"];

const CURVE_ALIAS: Record<string, string> = {
  smooth: "monotone",
  spline: "monotone",
  basis: "monotone",
  natural: "monotone",
  cardinal: "monotone",
  "monotone-x": "monotone",
  "monotonex": "monotone",
};

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

const TITLE_AT: Record<string, string> = { middle: "center", left: "start", right: "end", top: "end", bottom: "start" };
const TICK_AT: Record<string, string> = { in: "inside", out: "outside", hidden: "none" };
const AXIS_RENAME: Record<string, string> = {
  titleAnchor: "titlePosition",
  titleAlign: "titlePosition",
  nameLocation: "titlePosition",
  nameRotate: "titleRotate",
  tickSize: "tickLength",
  labelWrap: "labelWidth",
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

/** axes.y.min is not an axis key. The limit lives on encoding.y.scale.domain, and the same for x. */
function axisLimit(name: string, path: string, pointer: string, value: unknown, ctx: Ctx): boolean {
  const match = /^\/axes\/(x|y|y2)$/.exec(path);
  if (!match || (name !== "min" && name !== "max")) return false;
  const axis = match[1] ?? "y";
  const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
  const axes = isPlainObject(root.axes) ? root.axes : {};
  const box = isPlainObject(axes[axis]) ? axes[axis] : {};
  const other = name === "min" ? "max" : "min";
  ctx.skipUnknown.add(join(path, other));
  const min = typeof box.min === "number" ? box.min : name === "min" && typeof value === "number" ? value : null;
  const max = typeof box.max === "number" ? box.max : name === "max" && typeof value === "number" ? value : null;
  const channel = axis === "x" ? "x" : "y";
  const where = axis === "y2" ? "encoding.y.scale.domain on the series with axis y2" : `encoding.${channel}.scale.domain`;
  const fix: JsonPatchOperation[] = [{ op: "remove", path: pointer }];
  if (typeof box[other] === "number") fix.push({ op: "remove", path: join(path, other) });
  if (axis !== "y2") {
    const moved = domainPatch(root, channel, [min, max]);
    if (moved) fix.push(...moved);
  }
  emit(ctx, {
    code: "CK1002",
    severity: "error",
    message: `unknown property ${quote(name)}`,
    path: pointer,
    hint: `Axis ${name} is not a limit. Move it to ${where}.`,
    fix,
  });
  return true;
}

function domainPatch(root: Record<string, unknown>, channel: "x" | "y", domain: [number | null, number | null]): JsonPatchOperation[] | null {
  if (domain[0] === null && domain[1] === null) return null;
  const encoding = isPlainObject(root.encoding) ? root.encoding : undefined;
  if (!encoding) return [{ op: "add", path: "/encoding", value: { [channel]: { scale: { domain } } } }];
  const current = encoding[channel];
  if (typeof current === "string") {
    return [{ op: "replace", path: `/encoding/${channel}`, value: { field: current, scale: { domain } } }];
  }
  if (Array.isArray(current) || !isPlainObject(current)) return null;
  if (!isPlainObject(current.scale)) return [{ op: "add", path: `/encoding/${channel}/scale`, value: { domain } }];
  const existing = Array.isArray(current.scale.domain) ? current.scale.domain : [null, null];
  const next = [domain[0] ?? existing[0] ?? null, domain[1] ?? existing[1] ?? null];
  return [{ op: Array.isArray(current.scale.domain) ? "replace" : "add", path: `/encoding/${channel}/scale/domain`, value: next }];
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
  if (path === "/layout/facet" && FACET_SCALE_KEYS.has(name.toLowerCase())) {
    const word = scaleWord(value);
    if (word) {
      const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
      const layout = isPlainObject(root.layout) ? root.layout : undefined;
      const facet = layout && isPlainObject(layout.facet) ? layout.facet : undefined;
      const fix: JsonPatchOperation[] = [{ op: "remove", path: pointer }];
      const scales = facet?.scales;
      if (scales === undefined) fix.push({ op: "add", path: "/layout/facet/scales", value: word });
      else if (scales !== "shared" && scales !== "independent") fix.push({ op: "replace", path: "/layout/facet/scales", value: word });
      emit(ctx, {
        code: "CK1009",
        severity: "error",
        message: "shared scales are layout.facet.scales",
        path: pointer,
        hint: 'layout.facet.scales is "shared" or "independent". sharedScale true means "shared" (one y domain).',
        fix,
      });
      return;
    }
  }
  if (axisLimit(name, path, pointer, value, ctx)) return;
  if (markMistake(name, path, pointer, value, ctx)) return;
  if (/^\/mark\/colorRules\/\d+$/.test(path) && (name === "name" || name === "title")) {
    let rule: unknown = ctx.rootValue;
    for (const part of path.slice(1).split("/")) {
      if (rule === null || typeof rule !== "object") {
        rule = undefined;
        break;
      }
      rule = (rule as Record<string, unknown>)[part];
    }
    const hasLabel = isPlainObject(rule) && typeof rule.label === "string" && rule.label.trim() !== "";
    const text = typeof value === "string" && value.trim() ? value : undefined;
    const fix: JsonPatchOperation[] = [{ op: "remove", path: pointer }];
    if (text !== undefined && !hasLabel) fix.push({ op: "add", path: join(path, "label"), value: text });
    emit(ctx, {
      code: "CK1002",
      severity: "error",
      message: `unknown property ${quote(name)}`,
      path: pointer,
      hint: "the legend and tooltip name on a colour rule is label",
      fix,
    });
    return;
  }
  if ((path === "/encoding/y" || /^\/encoding\/y\/\d+$/.test(path)) && (name === "low" || name === "high") && typeof value === "string") {
    const dest = name === "low" ? "lo" : "hi";
    emit(ctx, {
      code: "CK3022",
      severity: "error",
      message: `${quote(name)} on a y series is ${quote(dest)}`,
      path: pointer,
      hint: `Use ${quote(dest)} for the ${name === "low" ? "lower" : "upper"} field of a band.`,
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: join(path, dest), value },
      ],
    });
    return;
  }
  if (/^\/axes\/(x|y|y2)$/.test(path) && AXIS_RENAME[name]) {
    const dest = AXIS_RENAME[name];
    let next = value;
    if (dest === "titlePosition" && typeof value === "string" && TITLE_AT[value]) next = TITLE_AT[value];
    if (dest === "titlePosition" && (next === "start" || next === "middle" || next === "left" || next === "right" || next === "top" || next === "bottom")) {
      next = TITLE_AT[String(next)] ?? next;
    }
    if ((dest === "tickLength" || dest === "labelWidth" || dest === "titleRotate") && typeof next !== "number") next = dest === "labelWidth" ? 72 : dest === "titleRotate" ? 0 : 4;
    emit(ctx, {
      code: "CK1009",
      severity: "error",
      message: `${quote(name)} is ${quote(dest)} on an axis`,
      path: pointer,
      hint: `Use ${quote(dest)} instead of ${quote(name)}.`,
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: join(path, dest), value: next },
      ],
    });
    return;
  }
  if ((name === "zIndex" || name === "zindex") && (path === "/encoding/y" || /^\/encoding\/y\/\d+$/.test(path) || /^\/annotations\/\d+$/.test(path))) {
    const next = typeof value === "number" && Number.isFinite(value) ? value : 1;
    emit(ctx, {
      code: "CK3064",
      severity: "error",
      message: "zIndex is z on a series or annotation",
      path: pointer,
      hint: "higher z paints later. Negative z paints an annotation under the marks. Stacked series keep data order.",
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: join(path, "z"), value: next },
      ],
    });
    return;
  }
  if (/^\/axes\/(x|y|y2)$/.test(path) && (name === "minor" || name === "minorTick" || name === "minorGrid")) {
    const next = value === false || value === 0 ? 0 : typeof value === "number" ? Math.max(0, Math.min(8, Math.round(value))) : 1;
    emit(ctx, {
      code: "CK3065",
      severity: "error",
      message: "minor is minorTicks on an axis",
      path: pointer,
      hint: "minorTicks is how many marks sit between major ticks, from 0 to 8.",
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: join(path, "minorTicks"), value: next },
      ],
    });
    return;
  }
  if (/^\/axes\/(x|y|y2)$/.test(path) && (name === "zero" || name === "origin" || name === "axisAtZero")) {
    const next = typeof value === "number" && Number.isFinite(value) ? value : 0;
    emit(ctx, {
      code: "CK3068",
      severity: "error",
      message: "axis zero is crosses",
      path: pointer,
      hint: "axes.x.crosses: 0 draws the x axis through y = 0. axes.y.crosses needs a numeric x.",
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: join(path, "crosses"), value: next },
      ],
    });
    return;
  }
  if (/^\/axes\/(x|y|y2)$/.test(path) && (name === "axisOffset" || name === "offsetPx")) {
    const next = typeof value === "number" && Number.isFinite(value) ? Math.max(-80, Math.min(80, value)) : 8;
    emit(ctx, {
      code: "CK3071",
      severity: "error",
      message: "axisOffset is offset",
      path: pointer,
      hint: "offset shifts the baseline outward in pixels, from -80 to 80.",
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: join(path, "offset"), value: next },
      ],
    });
    return;
  }
  if (path === "/tooltip" && (name === "pinTooltip" || name === "hitSize" || name === "hitRadius")) {
    const dest = name === "pinTooltip" ? "pin" : "hit";
    const next = dest === "pin" ? value !== false : typeof value === "number" ? Math.max(8, Math.min(48, value)) : 18;
    emit(ctx, {
      code: "CK3067",
      severity: "error",
      message: "touch tooltip keys are pin and hit",
      path: pointer,
      hint: "tooltip.pin is tap-to-pin. tooltip.hit is the pixel radius, from 8 to 48.",
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: join(path, dest), value: next },
      ],
    });
    return;
  }
  if (path === "/animation" && name === "ease") {
    const mapped = value === "linear" ? "linear" : value === "easeInOut" || value === "ease-in-out" ? "ease-in-out" : value === "bounce" || value === "spring" ? "spring" : "ease-out";
    emit(ctx, {
      code: "CK3066",
      severity: "error",
      message: "easing name is not a chartkit curve",
      path: pointer,
      hint: "easing is linear, ease-out, ease-in-out, or spring.",
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: "/animation/easing", value: mapped },
      ],
    });
    return;
  }
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
    const matches = nearMatches(name, Object.keys(props), name.length <= 4 ? 1 : 3);
    const hinted = suggestHint(matches);
    if (hinted) hint = hinted;
  }
  emit(ctx, {
    code: "CK1002",
    severity: "error",
    message: `unknown property ${quote(name)}`,
    path: pointer,
    hint,
  });
}

/** A composed dashboard carries its data on each view, so the outer spec may omit type, data, encoding, and metric. */
function concatViews(value: unknown): boolean {
  if (!isPlainObject(value) || !isPlainObject(value.layout) || !isPlainObject(value.layout.concat)) return false;
  const views = value.layout.concat.views;
  return Array.isArray(views) && views.length > 0;
}

function emitMissing(name: string, path: string, parent: Record<string, unknown>, ctx: Ctx): void {
  if (ctx.skipMissing.has(`${path}|${name}`)) return;
  const pointer = name === "a11y" && path === "" ? "/a11y" : path;
  if ((path === "" && name === "a11y") || (path === "/a11y" && name === "alt")) {
    emitAltRequired(ctx);
    return;
  }
  if (path === "" && concatViews(ctx.rootValue) && (name === "type" || name === "data" || name === "encoding" || name === "metric")) return;
  if (path === "" && name === "type") {
    emit(ctx, {
      code: "CK1003",
      severity: "error",
      message: `missing required property ${quote(name)}`,
      path: "",
      hint: `set type to one of: ${validTypeList()}. The chart type goes in type, not mark.`,
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

/** Up to three close spellings. A match has to be a small edit, not merely within a fixed distance. */
export function nearMatches(input: string, choices: readonly string[], maxDistance: number): string[] {
  const lower = input.toLowerCase();
  const found: { choice: string; distance: number; index: number }[] = [];
  for (let index = 0; index < choices.length; index++) {
    const choice = choices[index] ?? "";
    if (!choice || choice === input) continue;
    const distance = levenshtein(lower, choice.toLowerCase());
    const limit = Math.min(maxDistance, Math.max(1, Math.floor(Math.min(input.length, choice.length) * 0.34)));
    if (distance > 0 && distance <= limit && distance < choice.length) found.push({ choice, distance, index });
  }
  found.sort((a, b) => a.distance - b.distance || a.index - b.index);
  const out: string[] = [];
  for (const item of found) {
    if (out.length === 3) break;
    if (!out.includes(item.choice)) out.push(item.choice);
  }
  return out;
}

export function nearest(input: string, choices: readonly string[], maxDistance: number): string | undefined {
  return nearMatches(input, choices, maxDistance)[0];
}

export function suggestHint(choices: readonly string[]): string | undefined {
  if (choices.length === 0) return undefined;
  if (choices.length === 1) return `did you mean ${quote(choices[0])}?`;
  if (choices.length === 2) return `did you mean ${quote(choices[0])} or ${quote(choices[1])}?`;
  return `did you mean ${quote(choices[0])}, ${quote(choices[1])}, or ${quote(choices[2])}?`;
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
