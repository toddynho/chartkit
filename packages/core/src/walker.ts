import type { Diagnostic, JsonPatchOperation } from "./diagnostics";
import { asList, describe, emit, isArrayLike, isDropped, isPlainObject, isSchema, join, lengthIssue, nearMatches, pattern, quote, resolve, scalarTypes, showPath, suggestHint, typeMatches, type Ctx, type JsonSchema } from "./walker/util";
import { emitUnknownType, hasKnownType, noteChartType } from "./walker/chart-type";
import { CURVE_ALIAS, emitAltRequired, emitMissing, emitUnknownProp, ENDS_ALIAS, formatPresetFix, labelWord, POS_ALIAS, SHAPE_ALIAS, TICK_AT, TITLE_AT } from "./walker/props";
import { isFacetScales, noteMisplaced, scaleWord } from "./walker/features";
import { comboSeriesMark, emitAxisNull, emitAxisObject, emitXAxis, FIELD_TYPE_ALIAS, isXChannel, noteCombo, noteDonutChannels, noteFlowChannels, noteHeatmapChannels, noteMetricHoist, PLACE_ALIAS, repairShape } from "./walker/shape";

export { nearMatches, nearest, suggestHint } from "./walker/util";
export { keyedDrillChildren } from "./walker/features";

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

function ifDemandsChartType(schema: JsonSchema, ctx: Ctx): boolean {
  const node = resolve(schema, ctx.rootSchema);
  return node.required?.includes("type") === true && node.properties?.type?.enum !== undefined;
}

function isTypeBranchNoise(diagnostic: Diagnostic): boolean {
  return diagnostic.code === "CK1003" && /"(metric|color|open|high|low|close)"/.test(diagnostic.message);
}
