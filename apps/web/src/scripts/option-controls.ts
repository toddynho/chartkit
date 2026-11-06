import {
  OPTION_GROUPS,
  getPath,
  optionBlocked,
  optionCatalog,
  readOption,
  type OptionField,
} from "@chartkitdev/core/options";
import { optionEffect } from "../data/option-effect";
import { chartType } from "../lib/paint-chart";
import { isRecord } from "../lib/spec-text";
import { groupOptions } from "./option-groups";

const SWATCHES = ["#335c84", "#0a63e6", "#2e9a5c", "#c24b3a", "#8a5cf6", "#17181a"];
const SERIES_COLORS = ["#335c84", "#2e9a5c", "#c24b3a", "#8a5cf6", "#0a63e6", "#17181a"];

export interface OptionControlHooks {
  readSpec: () => Record<string, unknown>;
  readHiddenY: () => unknown[];
  setHiddenY: (items: unknown[]) => void;
  commit: (field: OptionField, value: unknown) => void;
  replace: (spec: Record<string, unknown>, path: string) => void;
}

export interface OptionControls {
  refresh: (reset?: boolean) => void;
  reveal: (path: string) => void;
}

/** Playground option controls. Chart docs mount this same panel. */
export function mountOptionControls(root: HTMLElement, hooks: OptionControlHooks): OptionControls {
  let search = "";
  let setOnly = false;
  const open = new Set<string>(["Data / Encoding"]);
  const moreOpen = new Set<string>();

  root.classList.add("play-options");
  prime();
  render();

  function spec(): Record<string, unknown> {
    return hooks.readSpec();
  }

  function fieldsFor(current: Record<string, unknown>): OptionField[] {
    const type = chartType(current);
    return optionCatalog.filter((field) => (!field.appliesTo || field.appliesTo.includes(type)) && !optionBlocked(current, field.path));
  }

  function render(): void {
    const prev = root.querySelector<HTMLInputElement>("[data-search]");
    const caret = prev && document.activeElement === prev ? prev.selectionStart : null;
    const saved = root.querySelector(".play-groups")?.scrollTop ?? 0;
    root.replaceChildren(optionsView());
    const groups = root.querySelector(".play-groups");
    if (groups) groups.scrollTop = saved;
    const next = root.querySelector<HTMLInputElement>("[data-search]");
    if (next && caret != null) {
      next.focus();
      next.setSelectionRange(caret, caret);
    }
  }

  function optionsView(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "play-options";
    const bar = document.createElement("div");
    bar.className = "play-search";
    const input = document.createElement("input");
    input.type = "search";
    input.dataset.search = "";
    input.placeholder = "Search options…  e.g. legend, brand, axis";
    input.setAttribute("aria-label", "Search options");
    input.value = search;
    input.addEventListener("input", () => {
      search = input.value;
      render();
    });
    const current = spec();
    const applicable = fieldsFor(current);
    const filter = document.createElement("button");
    filter.type = "button";
    filter.className = "play-setonly";
    if (setOnly) filter.classList.add("is-on");
    const setTotal = applicable.filter((field) => readOption(current, field).set).length;
    filter.textContent = `Set · ${setTotal}`;
    filter.addEventListener("click", () => {
      setOnly = !setOnly;
      render();
    });
    bar.append(input, filter);

    const groups = document.createElement("div");
    groups.className = "play-groups";
    const typeName = chartType(current);
    const sections = groupOptions(applicable, OPTION_GROUPS, {
      query: search,
      setOnly,
      isSet: (field) => readOption(current, field as OptionField).set,
      isUnsupported: (field) => optionEffect(typeName, field.path).status === "not-yet",
    });
    const query = search.trim().toLowerCase();
    let shown = 0;
    for (const section of sections) {
      const lead = section.lead.flatMap((item) => {
        const field = applicable.find((entry) => entry.path === item.path);
        return field ? [field] : [];
      });
      const more = section.more.flatMap((item) => {
        const field = applicable.find((entry) => entry.path === item.path);
        return field ? [field] : [];
      });
      const visible = [...lead, ...more];
      if (!visible.length) continue;
      shown += visible.length;
      const setHere = visible.filter((field) => readOption(current, field).set).length;
      const expanded = Boolean(query || setOnly || open.has(section.id));
      const box = document.createElement("div");
      box.className = "play-group";
      if (expanded) box.classList.add("is-open");
      const head = document.createElement("button");
      head.type = "button";
      head.setAttribute("aria-expanded", expanded ? "true" : "false");
      const caret = document.createElement("i");
      caret.textContent = "▶";
      const title = document.createElement("span");
      title.textContent = section.label;
      const badge = document.createElement("em");
      badge.textContent = `${visible.length} options · ${setHere} set`;
      if (setHere) badge.classList.add("is-set");
      head.append(caret, title, badge);
      head.addEventListener("click", () => {
        if (open.has(section.id)) open.delete(section.id);
        else open.add(section.id);
        render();
      });
      box.append(head);
      if (expanded) {
        const body = document.createElement("div");
        body.className = "play-group__body";
        for (const field of lead) body.append(optionRow(field));
        if (more.length) {
          const moreBox = document.createElement("div");
          moreBox.className = "play-more";
          const moreExpanded = Boolean(query || setOnly || moreOpen.has(section.id));
          if (moreExpanded) moreBox.classList.add("is-open");
          const toggle = document.createElement("button");
          toggle.type = "button";
          toggle.setAttribute("aria-expanded", moreExpanded ? "true" : "false");
          const moreCaret = document.createElement("i");
          moreCaret.textContent = "▶";
          const moreLabel = document.createElement("span");
          moreLabel.textContent = `More options · ${more.length}`;
          toggle.append(moreCaret, moreLabel);
          toggle.addEventListener("click", () => {
            if (moreOpen.has(section.id)) moreOpen.delete(section.id);
            else moreOpen.add(section.id);
            render();
          });
          moreBox.append(toggle);
          if (moreExpanded) {
            const moreBody = document.createElement("div");
            moreBody.className = "play-more__body";
            for (const field of more) moreBody.append(optionRow(field));
            moreBox.append(moreBody);
          }
          body.append(moreBox);
        }
        box.append(body);
      }
      groups.append(box);
    }
    wrap.append(bar, groups);
    if (!shown) {
      const empty = document.createElement("div");
      empty.className = "play-empty";
      empty.append(`No options match “${search.trim()}”. `);
      const link = document.createElement("a");
      link.href = "/docs/options";
      link.textContent = "Search the docs →";
      empty.append(link);
      groups.append(empty);
    }
    return wrap;
  }

  function optionRow(field: OptionField): HTMLElement {
    const current = spec();
    const view = readOption(current, field);
    const effect = optionEffect(chartType(current), field.path);
    const row = document.createElement("div");
    row.className = "play-opt";
    row.dataset.path = field.path;
    if (effect.status === "not-yet") row.classList.add("is-unsupported");
    if (view.set) row.classList.add("is-set");
    const dot = document.createElement("span");
    dot.className = "play-opt__dot";
    const head = document.createElement("div");
    head.className = "play-opt__head";
    const label = document.createElement("strong");
    label.textContent = field.label;
    const path = document.createElement("a");
    path.href = field.docs;
    path.textContent = field.path;
    head.append(label, path);
    if (view.set && effect.status !== "not-yet") {
      const reset = document.createElement("button");
      reset.type = "button";
      reset.textContent = "Reset";
      reset.addEventListener("click", () => commit(field, undefined));
      head.append(reset);
    }
    const control = controlFor(field, view);
    if (effect.status === "not-yet") {
      control.inert = true;
      const nodes = [control, ...control.querySelectorAll("input, button, select, textarea")];
      for (const node of nodes) {
        if (node instanceof HTMLInputElement || node instanceof HTMLButtonElement || node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement) {
          node.disabled = true;
        }
      }
    }
    row.append(dot, head, control);
    if (effect.status === "not-yet") {
      const note = document.createElement("div");
      note.className = "play-opt__note";
      note.textContent = "Not yet supported";
      row.append(note);
    } else if (effect.hint) {
      const note = document.createElement("div");
      note.className = "play-opt__note";
      note.textContent = effect.hint;
      row.append(note);
    }
    if (field.description) {
      const help = document.createElement("div");
      help.className = "play-opt__help";
      help.textContent = firstSentence(field.description);
      help.title = field.description;
      row.append(help);
    }
    return row;
  }

  function commit(field: OptionField, value: unknown): void {
    hooks.commit(field, value);
    if (field.path === "type") {
      open.clear();
      open.add("Data / Encoding");
      moreOpen.clear();
    }
    render();
  }

  function replace(next: Record<string, unknown>, path: string): void {
    hooks.replace(next, path);
    render();
  }

  function controlFor(field: OptionField, view: { value: unknown; set: boolean; complex: boolean }): HTMLElement {
    const current = spec();
    if (field.path === "encoding.y" && (Array.isArray(getPath(current, "encoding.y")) || hooks.readHiddenY().length)) return seriesEditor();
    if (field.path === "mark.colorRules") return rulesEditor();
    if (field.path === "mark.palette" && (view.value == null || Array.isArray(view.value))) return paletteEditor(Array.isArray(view.value) ? view.value : []);
    if (view.complex || field.control === "json") {
      const area = document.createElement("textarea");
      area.className = "play-json";
      area.spellcheck = false;
      area.value = view.value === undefined ? "" : JSON.stringify(view.value, null, 2);
      area.addEventListener("change", () => {
        const text = area.value.trim();
        if (!text) {
          commit(field, undefined);
          return;
        }
        try {
          commit(field, JSON.parse(text) as unknown);
        } catch {
          area.setAttribute("aria-invalid", "true");
        }
      });
      return area;
    }
    if (field.control === "boolean" || field.storage === "union-boolean") {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "play-toggle";
      const on = view.value === true;
      if (on) button.classList.add("is-on");
      const track = document.createElement("i");
      button.append(track, document.createTextNode(on ? "On" : "Off"));
      button.addEventListener("click", () => commit(field, !on));
      return button;
    }
    const enums = field.enumValues ?? [];
    if (field.control === "enum" && enums.length > 0 && enums.length <= 4 && !view.complex) {
      const seg = document.createElement("div");
      seg.className = "play-mini";
      const value = view.value == null || view.value === "" ? "" : String(view.value);
      for (const item of enums) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = item;
        if (value === item) button.classList.add("is-on");
        button.addEventListener("click", () => commit(field, item));
        seg.append(button);
      }
      return seg;
    }
    if (field.control === "enum") {
      const select = document.createElement("select");
      const blank = document.createElement("option");
      blank.value = "";
      blank.textContent = field.defaultValue == null ? "—" : `${String(field.defaultValue)} · default`;
      select.append(blank);
      const value = view.value == null ? "" : String(view.value);
      const values = [...enums];
      if (value && !values.includes(value)) values.unshift(value);
      for (const item of values) {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        select.append(option);
      }
      select.value = view.set ? value : "";
      select.addEventListener("change", () => commit(field, select.value));
      return select;
    }
    if (field.control === "color") {
      const holder = document.createElement("div");
      holder.className = "play-swatches";
      const color = typeof view.value === "string" ? view.value : "";
      for (const hex of SWATCHES) {
        const button = document.createElement("button");
        button.type = "button";
        button.title = hex;
        button.style.background = hex;
        if (color.toLowerCase() === hex.toLowerCase()) button.classList.add("is-on");
        button.addEventListener("click", () => commit(field, hex));
        holder.append(button);
      }
      const hex = document.createElement("input");
      hex.type = "text";
      hex.value = color;
      hex.spellcheck = false;
      hex.addEventListener("change", () => commit(field, hex.value.trim()));
      holder.append(hex);
      return holder;
    }
    if (field.control === "number") {
      const holder = document.createElement("div");
      holder.className = "play-step";
      const input = document.createElement("input");
      input.type = "number";
      if (typeof field.minimum === "number") input.min = String(field.minimum);
      if (typeof field.maximum === "number") input.max = String(field.maximum);
      const span = (field.maximum ?? 1) - (field.minimum ?? 0);
      input.step = field.coerce === "integer" ? "1" : span <= 2 ? "0.01" : "0.1";
      if (typeof view.value === "number") input.value = String(view.value);
      const stepBy = (dir: number) => {
        const base = input.value.trim() === "" ? Number(field.defaultValue ?? field.minimum ?? 0) : Number(input.value);
        const next = Math.round((base + dir * Number(input.step)) * 1000) / 1000;
        commit(field, next);
      };
      const minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "−";
      minus.addEventListener("click", () => stepBy(-1));
      const plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      plus.addEventListener("click", () => stepBy(1));
      input.addEventListener("change", () => {
        if (input.value.trim() === "") commit(field, undefined);
        else if (Number.isFinite(Number(input.value))) commit(field, Number(input.value));
      });
      holder.append(minus, input, plus);
      return holder;
    }
    const text = document.createElement("input");
    text.type = "text";
    text.value = view.value == null ? "" : String(view.value);
    if (field.defaultValue != null) text.placeholder = String(field.defaultValue);
    text.addEventListener("change", () => commit(field, text.value));
    return text;
  }

  function seriesEditor(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "play-series";
    const current = getPath(spec(), "encoding.y");
    const items = Array.isArray(current) ? current : [];
    items.forEach((item, index) => wrap.append(seriesRow(item, index, true)));
    hooks.readHiddenY().forEach((item, index) => wrap.append(seriesRow(item, index, false)));
    return wrap;
  }

  function seriesRow(item: unknown, index: number, shown: boolean): HTMLElement {
    const row = document.createElement("div");
    row.className = "play-series__row";
    const name = typeof item === "string" ? item : isRecord(item) && typeof item.field === "string" ? item.field : `series ${index + 1}`;
    const title = isRecord(item) && typeof item.title === "string" ? item.title : name;
    const color = isRecord(item) && typeof item.color === "string" ? item.color : SERIES_COLORS[index % SERIES_COLORS.length] ?? "#335c84";
    const swatch = document.createElement("i");
    swatch.style.background = shown ? color : "#dcdcd8";
    const label = document.createElement("span");
    label.textContent = title;
    label.style.color = shown ? "#17181a" : "#a0a2a7";
    const code = document.createElement("code");
    code.textContent = name;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = shown ? "Hide" : "Show";
    button.addEventListener("click", () => {
      const next = structuredClone(spec());
      const encoding = isRecord(next.encoding) ? next.encoding : {};
      const list = Array.isArray(encoding.y) ? [...encoding.y] : [];
      const hidden = [...hooks.readHiddenY()];
      if (shown) {
        const [removed] = list.splice(index, 1);
        if (removed !== undefined) hidden.push(removed);
      } else {
        const [restored] = hidden.splice(index, 1);
        if (restored !== undefined) list.push(restored);
      }
      encoding.y = list;
      next.encoding = encoding;
      hooks.setHiddenY(hidden);
      replace(next, "encoding.y");
    });
    row.append(swatch, label, code, button);
    return row;
  }

  function rulesEditor(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "play-rules";
    const rules = getPath(spec(), "mark.colorRules");
    const list = Array.isArray(rules) ? rules.filter(isRecord) : [];
    list.forEach((rule, index) => {
      const row = document.createElement("div");
      row.className = "play-rules__row";
      const when = document.createElement("input");
      when.type = "text";
      when.value = ruleWhen(rule);
      when.addEventListener("change", () => updateRule(index, { ...rule, ...parseWhen(when.value) }));
      const swatch = document.createElement("i");
      const color = typeof rule.color === "string" ? rule.color : "#335c84";
      swatch.style.background = color;
      const hex = document.createElement("input");
      hex.type = "text";
      hex.value = color;
      hex.style.width = "86px";
      hex.addEventListener("change", () => updateRule(index, { ...rule, color: hex.value.trim() }));
      row.append(when, swatch, hex);
      wrap.append(row);
    });
    const add = document.createElement("button");
    add.type = "button";
    add.className = "play-add";
    add.textContent = "+ Add rule";
    add.addEventListener("click", () => {
      const next = structuredClone(spec());
      const mark = isRecord(next.mark) ? next.mark : {};
      const rulesNext = Array.isArray(mark.colorRules) ? [...mark.colorRules] : [];
      rulesNext.push({ color: "#2e9a5c", gt: 0 });
      mark.colorRules = rulesNext;
      next.mark = mark;
      replace(next, "mark.colorRules");
    });
    wrap.append(add);
    return wrap;
  }

  function updateRule(index: number, rule: Record<string, unknown>): void {
    const next = structuredClone(spec());
    const mark = isRecord(next.mark) ? next.mark : {};
    const rulesNext = Array.isArray(mark.colorRules) ? [...mark.colorRules] : [];
    rulesNext[index] = rule;
    mark.colorRules = rulesNext;
    next.mark = mark;
    replace(next, "mark.colorRules");
  }

  function paletteEditor(colors: unknown[]): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "play-swatches";
    colors.forEach((color, index) => {
      if (typeof color !== "string") return;
      const input = document.createElement("input");
      input.type = "text";
      input.value = color;
      input.addEventListener("change", () => {
        const next = [...colors];
        next[index] = input.value.trim();
        writePalette(next);
      });
      wrap.append(input);
    });
    const add = document.createElement("button");
    add.type = "button";
    add.className = "play-add";
    add.textContent = "+ Add";
    add.addEventListener("click", () => writePalette([...colors.filter((color) => typeof color === "string"), "#335c84"]));
    wrap.append(add);
    return wrap;
  }

  function writePalette(colors: unknown[]): void {
    const next = structuredClone(spec());
    const mark = isRecord(next.mark) ? next.mark : {};
    mark.palette = colors;
    next.mark = mark;
    replace(next, "mark.palette");
  }

  function reveal(path: string): void {
    const field = optionCatalog.find((item) => item.path === path || path.startsWith(`${item.path}.`) || item.path.startsWith(`${path}.`));
    if (field) {
      open.add(field.group);
      if (!field.essential) moreOpen.add(field.group);
    }
    render();
    const wanted = field?.path || path;
    const row = [...root.querySelectorAll<HTMLElement>("[data-path]")].find((item) => item.dataset.path === wanted || item.dataset.path === path);
    row?.scrollIntoView({ block: "center" });
  }

  function prime(): void {
    open.clear();
    open.add("Data / Encoding");
    moreOpen.clear();
    const current = spec();
    for (const field of fieldsFor(current)) {
      if (!readOption(current, field).set) continue;
      open.add(field.group);
      if (!field.essential) moreOpen.add(field.group);
    }
  }

  function refresh(reset = false): void {
    if (reset) {
      search = "";
      setOnly = false;
      prime();
    }
    render();
  }

  return { refresh, reveal };
}

function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = /^[\s\S]*?[.!?](?=\s|$)/.exec(trimmed);
  return match?.[0] ?? trimmed;
}

function ruleWhen(rule: Record<string, unknown>): string {
  if (typeof rule.test === "string") return rule.test;
  if (typeof rule.gt === "number") return `> ${rule.gt}`;
  if (typeof rule.gte === "number") return `>= ${rule.gte}`;
  if (typeof rule.lt === "number") return `< ${rule.lt}`;
  if (typeof rule.lte === "number") return `<= ${rule.lte}`;
  if (typeof rule.eq === "number") return `= ${rule.eq}`;
  return "";
}

function parseWhen(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  if (trimmed === "negative" || trimmed === "positive") return { test: trimmed };
  const match = /^(>=|<=|>|<|=)\s*(-?\d+(?:\.\d+)?)$/.exec(trimmed);
  if (!match) return {};
  const value = Number(match[2]);
  if (match[1] === ">") return { gt: value };
  if (match[1] === ">=") return { gte: value };
  if (match[1] === "<") return { lt: value };
  if (match[1] === "<=") return { lte: value };
  return { eq: value };
}
