import type { OptionField } from "@chartkitdev/core/options";

interface EditorHooks {
  read: () => string;
  write: (text: string) => void;
  /** Preview override. A string preset, an object theme, or undefined when the spec theme was cleared. */
  onTheme: (value: unknown) => void;
}

interface Catalog {
  optionCatalog: readonly OptionField[];
  OPTION_GROUPS: readonly string[];
  readOption: (spec: unknown, field: OptionField) => { value: unknown; set: boolean; complex: boolean };
  writeOption: (spec: unknown, field: OptionField, value: unknown) => Record<string, unknown>;
  resetOption: (spec: unknown, field: OptionField) => Record<string, unknown>;
  optionBlocked: (spec: unknown, path: string) => boolean;
  getPath: (spec: unknown, path: string) => unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stepOf(field: OptionField): string {
  if (field.coerce === "integer") return "1";
  const span = (field.maximum ?? 1) - (field.minimum ?? 0);
  if (span <= 2) return "0.01";
  if (span <= 20) return "0.1";
  return "1";
}

function hexColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = /^#([0-9a-f]{6})$/i.exec(value.trim());
  return match ? `#${match[1].toLowerCase()}` : null;
}

export function mountOptionEditor(root: HTMLElement, hooks: EditorHooks): { refresh: (reopen?: boolean) => void } {
  const filter = document.createElement("input");
  filter.className = "opt-filter";
  filter.type = "search";
  filter.placeholder = "Filter options";
  filter.setAttribute("aria-label", "Filter options");
  const meta = document.createElement("p");
  meta.className = "opt-meta";
  const body = document.createElement("div");
  body.className = "opt-body";
  root.replaceChildren(filter, meta, body);

  let catalog: Catalog | null = null;
  let query = "";
  const openGroups = new Set<string>();
  let primed = false;
  let jsonTimer = 0;

  filter.addEventListener("input", () => {
    query = filter.value;
    renderBody();
  });

  function parse(): Record<string, unknown> | null {
    try {
      const value = JSON.parse(hooks.read()) as unknown;
      return isRecord(value) ? value : null;
    } catch {
      return null;
    }
  }

  function visibleFields(spec: Record<string, unknown>): OptionField[] {
    if (!catalog) return [];
    const type = typeof spec.type === "string" ? spec.type : "";
    const q = query.trim().toLowerCase();
    return catalog.optionCatalog.filter((field) => {
      if (field.appliesTo && !field.appliesTo.includes(type)) return false;
      if (catalog?.optionBlocked(spec, field.path)) return false;
      if (!q) return true;
      return field.path.toLowerCase().includes(q) || field.label.toLowerCase().includes(q) || field.description.toLowerCase().includes(q);
    });
  }

  function commit(field: OptionField, value: unknown): void {
    if (!catalog) return;
    const spec = parse();
    if (!spec) return;
    const next = value === undefined ? catalog.resetOption(spec, field) : catalog.writeOption(spec, field, value);
    if (field.path === "theme" || field.path.startsWith("theme.")) hooks.onTheme(catalog.getPath(next, "theme"));
    hooks.write(JSON.stringify(next, null, 2));
    if (field.path === "type") {
      primed = false;
      openGroups.clear();
      renderBody();
      return;
    }
    const row = [...body.querySelectorAll<HTMLElement>("[data-path]")].find((item) => item.dataset.path === field.path);
    if (row) paintFlags(row, catalog.readOption(next, field));
  }

  function paintFlags(row: HTMLElement, state: { set: boolean }): void {
    row.classList.toggle("is-set", state.set);
    const flag = row.querySelector<HTMLElement>("[data-flag]");
    if (flag) {
      flag.textContent = state.set ? "Set" : "Default";
      flag.classList.toggle("is-on", state.set);
    }
    const reset = row.querySelector<HTMLButtonElement>("[data-reset]");
    if (reset) reset.hidden = !state.set;
  }

  function addControl(row: HTMLElement, field: OptionField, spec: Record<string, unknown>): void {
    if (!catalog) return;
    const state = catalog.readOption(spec, field);
    const holder = document.createElement("div");
    holder.className = "opt-control";
    if (state.complex || field.control === "json") {
      const area = document.createElement("textarea");
      area.className = "opt-json";
      area.id = `opt-${field.path.replace(/[^A-Za-z0-9_-]/g, "-")}`;
      area.rows = 4;
      area.spellcheck = false;
      area.setAttribute("aria-label", `${field.label} JSON`);
      area.value = state.value === undefined ? "" : JSON.stringify(state.value, null, 2);
      const error = document.createElement("p");
      error.className = "opt-error";
      error.hidden = true;
      area.addEventListener("input", () => {
        window.clearTimeout(jsonTimer);
        jsonTimer = window.setTimeout(() => {
          const text = area.value.trim();
          if (!text) {
            error.hidden = true;
            commit(field, undefined);
            return;
          }
          try {
            commit(field, JSON.parse(text) as unknown);
            error.hidden = true;
          } catch (caught) {
            error.hidden = false;
            error.textContent = caught instanceof Error ? caught.message : "Invalid JSON";
          }
        }, 200);
      });
      holder.append(area, error);
      row.append(holder);
      return;
    }

    const id = `opt-${field.path.replace(/[^A-Za-z0-9_-]/g, "-")}`;
    if (field.control === "boolean") {
      const label = document.createElement("label");
      label.className = "opt-switch";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = id;
      input.checked = state.value === true;
      input.addEventListener("change", () => commit(field, input.checked));
      const knob = document.createElement("span");
      label.append(input, knob);
      holder.append(label);
    } else if (field.control === "enum") {
      const select = document.createElement("select");
      select.id = id;
      select.setAttribute("aria-label", field.label);
      const values = [...(field.enumValues ?? [])];
      const current = state.value === undefined || state.value === "" ? "" : String(state.value);
      if (field.defaultValue === undefined) {
        const blank = document.createElement("option");
        blank.value = "";
        blank.textContent = "—";
        select.append(blank);
      }
      if (current && !values.includes(current) && current !== String(field.defaultValue ?? "")) values.unshift(current);
      for (const value of values) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = field.defaultValue !== undefined && value === String(field.defaultValue) ? `${value} · default` : value;
        select.append(option);
      }
      select.value = current || (field.defaultValue !== undefined ? String(field.defaultValue) : "");
      select.addEventListener("change", () => commit(field, select.value));
      holder.append(select);
    } else if (field.control === "number") {
      const wrap = document.createElement("div");
      wrap.className = "opt-num";
      const step = stepOf(field);
      const number = document.createElement("input");
      number.type = "number";
      number.id = id;
      number.step = step;
      if (typeof field.minimum === "number") number.min = String(field.minimum);
      if (typeof field.maximum === "number") number.max = String(field.maximum);
      if (typeof state.value === "number") number.value = String(state.value);
      number.placeholder = field.defaultValue === undefined ? "" : String(field.defaultValue);
      const push = () => {
        const text = number.value.trim();
        if (text === "") {
          commit(field, undefined);
          return;
        }
        const parsed = Number(text);
        if (Number.isFinite(parsed)) commit(field, parsed);
      };
      number.addEventListener("input", () => {
        if (range) range.value = number.value;
        push();
      });
      let range: HTMLInputElement | null = null;
      if (field.slider && typeof field.minimum === "number" && typeof field.maximum === "number") {
        range = document.createElement("input");
        range.type = "range";
        range.min = String(field.minimum);
        range.max = String(field.maximum);
        range.step = step;
        range.value = number.value || String(field.defaultValue ?? field.minimum);
        range.setAttribute("aria-label", field.label);
        range.addEventListener("input", () => {
          number.value = range?.value ?? "";
          push();
        });
        wrap.append(range);
      }
      wrap.append(number);
      holder.append(wrap);
    } else if (field.control === "color") {
      const wrap = document.createElement("div");
      wrap.className = "opt-color";
      const picker = document.createElement("input");
      picker.type = "color";
      picker.value = hexColor(state.value) ?? "#336699";
      picker.setAttribute("aria-label", `${field.label} color`);
      const text = document.createElement("input");
      text.type = "text";
      text.id = id;
      text.spellcheck = false;
      text.placeholder = "series-1 or #336699";
      text.value = typeof state.value === "string" ? state.value : "";
      picker.addEventListener("input", () => {
        text.value = picker.value;
        commit(field, picker.value);
      });
      text.addEventListener("input", () => {
        const hex = hexColor(text.value);
        if (hex) picker.value = hex;
        commit(field, text.value);
      });
      wrap.append(picker, text);
      holder.append(wrap);
    } else {
      const text = document.createElement("input");
      text.type = "text";
      text.id = id;
      text.spellcheck = false;
      text.value = state.value === undefined || state.value === null ? "" : String(state.value);
      if (field.defaultValue !== undefined) text.placeholder = String(field.defaultValue);
      text.addEventListener("input", () => commit(field, text.value));
      holder.append(text);
    }
    row.append(holder);
  }

  function renderBody(): void {
    if (!catalog) return;
    const spec = parse();
      const scroll = body.scrollTop;
    body.replaceChildren();
    if (!spec) {
      meta.textContent = "Spec is not valid JSON.";
      const note = document.createElement("p");
      note.className = "opt-note";
      note.textContent = "Fix the spec below and the controls will catch up.";
      body.append(note);
      return;
    }
    const fields = visibleFields(spec);
    const groups = new Map<string, OptionField[]>();
    for (const name of catalog.OPTION_GROUPS) groups.set(name, []);
    for (const field of fields) {
      const list = groups.get(field.group) ?? [];
      list.push(field);
      groups.set(field.group, list);
    }
    if (!primed) {
      primed = true;
      for (const [name, items] of groups) {
        if (items.some((field) => catalog?.readOption(spec, field).set)) openGroups.add(name);
      }
      if (!openGroups.has("Marks") && groups.get("Marks")?.length) openGroups.add("Marks");
      if (!openGroups.has("Chart") && groups.get("Chart")?.length) openGroups.add("Chart");
    }
    const setCount = fields.filter((field) => catalog?.readOption(spec, field).set).length;
    const type = typeof spec.type === "string" ? spec.type : "chart";
    meta.textContent = query.trim()
      ? `${fields.length} matching · ${setCount} set`
      : `${fields.length} options for ${type} · ${setCount} set`;

    for (const [name, items] of groups) {
      if (!items.length) continue;
      const section = document.createElement("details");
      section.className = "opt-section";
      section.dataset.group = name;
      section.open = query.trim().length > 0 || openGroups.has(name);
      section.addEventListener("toggle", () => {
        if (query.trim()) return;
        if (section.open) openGroups.add(name);
        else openGroups.delete(name);
      });
      const summary = document.createElement("summary");
      const title = document.createElement("span");
      title.textContent = name;
      const count = document.createElement("span");
      count.className = "opt-count";
      const setHere = items.filter((field) => catalog?.readOption(spec, field).set).length;
      count.textContent = setHere ? `${items.length} · ${setHere} set` : String(items.length);
      summary.append(title, count);
      section.append(summary);
      for (const field of items) {
        const state = catalog.readOption(spec, field);
        const row = document.createElement("div");
        row.className = "opt-row";
        row.dataset.path = field.path;
        if (state.set) row.classList.add("is-set");
        const copy = document.createElement("div");
        copy.className = "opt-copy";
        const head = document.createElement("div");
        head.className = "opt-head";
        const label = document.createElement("label");
        label.className = "opt-label";
        label.htmlFor = `opt-${field.path.replace(/[^A-Za-z0-9_-]/g, "-")}`;
        label.textContent = field.label;
        const actions = document.createElement("span");
        actions.className = "opt-actions";
        const flag = document.createElement("span");
        flag.className = "opt-flag";
        flag.dataset.flag = "";
        flag.textContent = state.set ? "Set" : "Default";
        if (state.set) flag.classList.add("is-on");
        const reset = document.createElement("button");
        reset.type = "button";
        reset.className = "opt-reset";
        reset.dataset.reset = "";
        reset.textContent = "Reset";
        reset.hidden = !state.set;
        reset.addEventListener("click", () => {
          commit(field, undefined);
          renderBody();
        });
        const docs = document.createElement("a");
        docs.className = "opt-docs";
        docs.href = field.docs;
        docs.textContent = "Docs";
        actions.append(flag, reset, docs);
        head.append(label, actions);
        const path = document.createElement("code");
        path.className = "opt-path";
        path.textContent = field.path;
        const desc = document.createElement("p");
        desc.className = "opt-desc";
        desc.textContent = field.description;
        copy.append(head, path, desc);
        row.append(copy);
        addControl(row, field, spec);
        section.append(row);
      }
      body.append(section);
    }
    if (!fields.length) {
      const note = document.createElement("p");
      note.className = "opt-note";
      note.textContent = query.trim() ? "No options match that filter." : "No options for this chart type.";
      body.append(note);
    }
    body.scrollTop = scroll;
  }

  function refresh(reopen = false): void {
    if (!reopen && root.contains(document.activeElement) && document.activeElement !== filter) return;
    if (!catalog) return;
    if (reopen) {
      primed = false;
      openGroups.clear();
    }
    renderBody();
  }

  void import("@chartkitdev/core/options").then((mod) => {
    catalog = mod;
    meta.textContent = "Options";
    renderBody();
  }).catch(() => {
    meta.textContent = "Options could not be loaded.";
  });

  return { refresh };
}
