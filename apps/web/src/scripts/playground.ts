import {
  OPTION_GROUPS,
  getPath,
  optionBlocked,
  optionCatalog,
  readOption,
  resetOption,
  writeOption,
  type OptionField,
} from "@chartkitdev/core/options";
import { chartTypes } from "../data/chart-types";
import { chartType, drawChart } from "../lib/paint-chart";
import { isRecord, pretty } from "../lib/spec-text";

interface ExampleSeed {
  slug: string;
  title: string;
  type: string;
  svg: string;
  spec: Record<string, unknown>;
}

interface PlayData {
  examples: ExampleSeed[];
}

type SizeName = "card" | "dashboard" | "full";
type ModeName = "auto" | "light" | "dark";
type TabName = "options" | "spec" | "data";

interface IssueRow {
  severity: "error" | "warning" | "ok";
  text: string;
  action: string;
  path: string;
}

const QUICK = [
  ["line", "Line"],
  ["stacked-area", "Area"],
  ["bar", "Bar"],
  ["donut", "Donut"],
  ["scatter", "Scatter"],
  ["strip", "Strip"],
] as const;

const SIZES: Record<SizeName, { w: number; h: number }> = {
  card: { w: 380, h: 180 },
  dashboard: { w: 640, h: 240 },
  full: { w: 980, h: 320 },
};

const SWATCHES = ["#335c84", "#0a63e6", "#2e9a5c", "#c24b3a", "#8a5cf6", "#17181a"];
const SERIES_COLORS = ["#335c84", "#2e9a5c", "#c24b3a", "#8a5cf6", "#0a63e6", "#17181a"];

const RAIL_KEY = "ck-playground-rail";
const TAB_KEY = "ck-playground-tab";

export function mountPlayground(root: HTMLElement, data: PlayData): void {
  const examples = data.examples.filter((item) => item.spec && typeof item.spec === "object");
  const types = uniqueTypes(examples);
  const storedRail = localStorage.getItem(RAIL_KEY);
  const narrow = window.matchMedia("(max-width: 1100px)").matches;
  const railOpen = storedRail === null ? !narrow : storedRail === "1";
  const tab = (localStorage.getItem(TAB_KEY) as TabName) || "options";

  const state = {
    examples,
    types,
    slug: examples[0]?.slug ?? "",
    spec: clone(examples[0]?.spec ?? {}),
    baseline: clone(examples[0]?.spec ?? {}),
    text: pretty(examples[0]?.spec ?? {}),
    good: clone(examples[0]?.spec ?? {}),
    tab: (["options", "spec", "data"] as TabName[]).includes(tab) ? tab : "options",
    size: "card" as SizeName,
    mode: "auto" as ModeName,
    railOpen,
    search: "",
    setOnly: false,
    exportOpen: false,
    pasteOpen: false,
    copied: false,
    open: new Set<string>(["Essentials"]),
    dirty: new Set<string>(),
    flash: new Set<string>(),
    hiddenY: [] as unknown[],
    issues: [] as IssueRow[],
    renderMs: 0,
    svg: "",
    valid: "ok" as "ok" | "warn" | "bad",
    warnCount: 0,
  };

  root.classList.toggle("is-rail-closed", !state.railOpen);
  root.classList.toggle("is-rail-auto", storedRail === null);
  root.style.setProperty("--rail", state.railOpen ? "220px" : "52px");
  root.innerHTML = shell();
  bind(root);
  readHash();
  paintText();
  renderRail();
  renderTypeSwitch();
  renderTabs();
  renderPanel();
  renderPreviewChrome();
  void refresh();

  function shell(): string {
    return `
      <div class="play-toolbar">
        <div class="play-example"><span>Example</span><strong data-example-name></strong></div>
        <div class="play-divider"></div>
        <div class="play-seg" data-types></div>
        <div class="play-toolbar__end">
          <button type="button" class="play-status is-ok" data-status><i></i><span>Valid</span></button>
          <button type="button" class="play-share" data-share>Share</button>
          <div class="play-export">
            <button type="button" data-export>Export <span>▾</span></button>
            <div class="play-menu" data-menu hidden>
              <button type="button" data-exp="svg">SVG <em data-svg-size></em></button>
              <button type="button" data-exp="png">PNG · 2× <em data-png-size></em></button>
              <button type="button" data-exp="json">Spec JSON <em data-json-lines></em></button>
              <hr />
              <button type="button" data-exp="embed">Copy embed snippet</button>
            </div>
          </div>
        </div>
      </div>
      <div class="play-work">
        <nav class="play-rail" aria-label="Examples">
          <button type="button" class="play-rail__head" data-rail><b>‹</b><span>Examples</span><em data-ex-count></em></button>
          <div class="play-rail__list" data-examples></div>
          <div class="play-rail__foot">More in the <a href="/gallery">gallery →</a></div>
        </nav>
        <aside class="play-panel">
          <div class="play-tabs" role="tablist" data-tabs></div>
          <div data-panel style="display:flex;flex-direction:column;flex:1;min-height:0"></div>
          <div class="play-foot"><span data-foot-note></span><button type="button" data-foot-action></button></div>
        </aside>
        <section class="play-preview">
          <div class="play-preview__bar">
            <span>Preview</span>
            <div class="play-seg" data-sizes></div>
            <div class="play-seg" data-modes></div>
          </div>
          <div class="play-canvas" data-canvas></div>
          <div class="play-foot">
            <button type="button" class="play-issue is-ok" data-issue><i></i><span></span><b></b></button>
            <em data-stats></em>
          </div>
        </section>
      </div>`;
  }

  function bind(host: HTMLElement) {
    host.querySelector<HTMLButtonElement>("[data-rail]")?.addEventListener("click", () => {
      state.railOpen = !state.railOpen;
      localStorage.setItem(RAIL_KEY, state.railOpen ? "1" : "0");
      root.classList.toggle("is-rail-closed", !state.railOpen);
      root.classList.remove("is-rail-auto");
      root.style.setProperty("--rail", state.railOpen ? "220px" : "52px");
      const icon = host.querySelector("[data-rail] b");
      if (icon) icon.textContent = state.railOpen ? "‹" : "›";
    });
    host.querySelector("[data-share]")?.addEventListener("click", () => void share());
    host.querySelector("[data-export]")?.addEventListener("click", () => {
      state.exportOpen = !state.exportOpen;
      const menu = host.querySelector<HTMLElement>("[data-menu]");
      if (menu) menu.hidden = !state.exportOpen;
    });
    host.querySelector("[data-menu]")?.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-exp]");
      if (!button) return;
      void exportAs(button.dataset.exp ?? "");
      state.exportOpen = false;
      const menu = host.querySelector<HTMLElement>("[data-menu]");
      if (menu) menu.hidden = true;
    });
    host.querySelector("[data-status]")?.addEventListener("click", () => {
      host.querySelector<HTMLElement>("[data-issue]")?.focus();
    });
    host.querySelector("[data-tabs]")?.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-tab]");
      if (!button?.dataset.tab) return;
      setTab(button.dataset.tab as TabName);
    });
    host.querySelector("[data-sizes]")?.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-size]");
      if (!button?.dataset.size) return;
      state.size = button.dataset.size as SizeName;
      renderPreviewChrome();
      void refresh();
    });
    host.querySelector("[data-modes]")?.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-mode]");
      if (!button?.dataset.mode) return;
      setMode(button.dataset.mode as ModeName);
    });
    host.querySelector("[data-foot-action]")?.addEventListener("click", () => footAction());
    host.querySelector("[data-issue]")?.addEventListener("click", () => {
      const issue = state.issues[0];
      if (!issue || issue.severity === "ok") return;
      if (issue.severity === "error" && issue.action === "Repair") {
        void repair();
        return;
      }
      jump(issue.path);
    });
    document.addEventListener("keydown", (event) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT");
      if (event.key === "Escape") {
        state.exportOpen = false;
        const menu = host.querySelector<HTMLElement>("[data-menu]");
        if (menu) menu.hidden = true;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setTab("options");
        host.querySelector<HTMLInputElement>("[data-search]")?.focus();
      }
      if (typing) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        const order: TabName[] = ["options", "spec", "data"];
        const index = order.indexOf(state.tab);
        const next = order[(index + (event.key === "ArrowRight" ? 1 : order.length - 1)) % order.length] ?? "options";
        event.preventDefault();
        setTab(next);
      }
    });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (state.mode === "auto") void refresh(false);
    });
    window.matchMedia("(max-width: 900px)").addEventListener("change", () => {
      void refresh(false);
    });
    document.addEventListener("click", (event) => {
      if ((event.target as HTMLElement).closest(".play-export")) return;
      state.exportOpen = false;
      const menu = host.querySelector<HTMLElement>("[data-menu]");
      if (menu) menu.hidden = true;
    });
    return host;
  }

  function readHash(): void {
    if (location.hash.length < 2) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(decodeURIComponent(location.hash.slice(1)));
    } catch {
      return;
    }
    if (!isRecord(parsed)) return;
    if (isRecord(parsed.spec)) {
      state.spec = clone(parsed.spec);
      state.good = clone(parsed.spec);
      state.baseline = clone(parsed.spec);
      state.text = pretty(parsed.spec);
      if (typeof parsed.example === "string") state.slug = parsed.example;
      if (parsed.size === "card" || parsed.size === "dashboard" || parsed.size === "full") state.size = parsed.size;
      state.mode = parsed.mode === "light" || parsed.mode === "dark" || parsed.mode === "auto" ? parsed.mode : modeOf(state.spec);
      const known = examples.find((item) => item.slug === state.slug);
      if (known) state.baseline = clone(known.spec);
      return;
    }
    if (typeof parsed.type === "string" || parsed.version != null) {
      state.spec = clone(parsed);
      state.good = clone(parsed);
      state.baseline = clone(parsed);
      state.text = pretty(parsed);
      state.slug = "";
      state.mode = modeOf(state.spec);
    }
  }

  function exampleName(): string {
    return examples.find((item) => item.slug === state.slug)?.title ?? "Shared spec";
  }

  function rowsOf(spec: Record<string, unknown>): Record<string, unknown>[] {
    const data = spec.data;
    if (Array.isArray(data)) {
      if (data.every((row) => isRecord(row))) return data.map((row) => ({ ...row }));
      if (data.every((row) => typeof row === "number" || row == null)) return data.map((value, index) => ({ index, value }));
    }
    if (isRecord(data) && isRecord(data.columns)) {
      const columns = data.columns;
      const keys = Object.keys(columns);
      const length = Math.max(...keys.map((key) => (Array.isArray(columns[key]) ? columns[key].length : 0)));
      const rows: Record<string, unknown>[] = [];
      for (let i = 0; i < length; i++) {
        const row: Record<string, unknown> = {};
        for (const key of keys) row[key] = Array.isArray(columns[key]) ? columns[key][i] : "";
        rows.push(row);
      }
      return rows;
    }
    return [];
  }

  function fieldsFor(type: string): OptionField[] {
    return optionCatalog.filter((field) => (!field.appliesTo || field.appliesTo.includes(type)) && !optionBlocked(state.spec, field.path));
  }

  function setCount(fields: OptionField[]): number {
    return fields.filter((field) => readOption(state.spec, field).set).length;
  }

  function renderRail(): void {
    const list = root.querySelector("[data-examples]");
    const count = root.querySelector("[data-ex-count]");
    const icon = root.querySelector("[data-rail] b");
    if (count) count.textContent = String(examples.length);
    if (icon) icon.textContent = state.railOpen ? "‹" : "›";
    if (!list) return;
    list.replaceChildren();
    for (const example of examples) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "play-ex";
      button.title = example.title;
      if (example.slug === state.slug) button.classList.add("is-on");
      const thumb = document.createElement("span");
      thumb.className = "play-ex__thumb";
      thumb.innerHTML = example.svg;
      const copy = document.createElement("span");
      copy.className = "play-ex__copy";
      const name = document.createElement("strong");
      name.textContent = example.title;
      const meta = document.createElement("span");
      const rows = rowsOf(example.spec).length;
      meta.textContent = `${example.type} · ${rows} row${rows === 1 ? "" : "s"}`;
      copy.append(name, meta);
      button.append(thumb, copy);
      button.addEventListener("click", () => applyExample(example.slug));
      list.append(button);
    }
  }

  function renderTypeSwitch(): void {
    const host = root.querySelector("[data-types]");
    if (!host) return;
    host.replaceChildren();
    const current = chartType(state.spec);
    for (const [type, label] of QUICK) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      if (current === type) button.classList.add("is-on");
      button.addEventListener("click", () => setType(type));
      host.append(button);
    }
    const select = document.createElement("select");
    select.className = "play-more";
    const rest = types.filter((type) => !QUICK.some(([id]) => id === type));
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "More";
    select.append(placeholder);
    for (const type of rest) {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = chartTypes.find((item) => item.type === type)?.title ?? type;
      select.append(option);
    }
    select.value = rest.includes(current) ? current : "";
    if (rest.includes(current)) select.classList.add("is-on");
    select.addEventListener("change", () => {
      if (select.value) setType(select.value);
    });
    host.append(select);
  }

  function renderTabs(): void {
    const host = root.querySelector("[data-tabs]");
    if (!host) return;
    const fields = fieldsFor(chartType(state.spec));
    const lines = state.text.split("\n").length;
    const rows = rowsOf(state.good).length;
    const badges = [`${setCount(fields)} set`, `${lines} lines`, `${rows} rows`];
    host.replaceChildren();
    (["options", "spec", "data"] as TabName[]).forEach((name, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "play-tab";
      button.dataset.tab = name;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", state.tab === name ? "true" : "false");
      if (state.tab === name) button.classList.add("is-on");
      button.append(document.createTextNode(name === "options" ? "Options" : name === "spec" ? "Spec" : "Data"));
      const badge = document.createElement("b");
      badge.textContent = badges[index] ?? "";
      button.append(badge);
      host.append(button);
    });
    const name = root.querySelector("[data-example-name]");
    if (name) name.textContent = exampleName();
  }

  function renderPanel(): void {
    const panel = root.querySelector("[data-panel]");
    if (!panel) return;
    const groups = root.querySelector(".play-groups");
    const table = root.querySelector(".play-table");
    const savedGroups = groups?.scrollTop ?? 0;
    const savedTable = table?.scrollTop ?? 0;
    const search = root.querySelector<HTMLInputElement>("[data-search]");
    const caret = search && document.activeElement === search ? search.selectionStart : null;
    panel.replaceChildren();
    if (state.tab === "options") panel.append(optionsView());
    else if (state.tab === "spec") panel.append(specView());
    else panel.append(dataView());
    const fields = fieldsFor(chartType(state.spec));
    const note = root.querySelector("[data-foot-note]");
    const action = root.querySelector("[data-foot-action]");
    if (state.tab === "options") {
      if (note) note.textContent = `${setCount(fields)} of ${fields.length} set`;
      if (action) action.textContent = "Reset all";
    } else if (state.tab === "spec") {
      const bytes = new Blob([state.text]).size;
      if (note) note.textContent = `${state.text.split("\n").length} lines · ${(bytes / 1024).toFixed(1)} KB`;
      if (action) action.textContent = state.copied ? "Copied" : "Copy spec";
    } else {
      const rows = rowsOf(state.good);
      const cols = rows[0] ? Object.keys(rows[0]).length : 0;
      if (note) note.textContent = `${rows.length} rows · ${cols} fields`;
      if (action) action.textContent = "Download CSV";
    }
    const nextGroups = root.querySelector(".play-groups");
    const nextTable = root.querySelector(".play-table");
    if (nextGroups) nextGroups.scrollTop = savedGroups;
    if (nextTable) nextTable.scrollTop = savedTable;
    const nextSearch = root.querySelector<HTMLInputElement>("[data-search]");
    if (nextSearch && caret != null) {
      nextSearch.focus();
      nextSearch.setSelectionRange(caret, caret);
    }
    root.dataset.jsonFallbacks = String(fields.filter((field) => usesJson(field, state.spec, state.hiddenY)).length);
  }

  function optionsView(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "play-options";
    const search = document.createElement("div");
    search.className = "play-search";
    const input = document.createElement("input");
    input.type = "search";
    input.dataset.search = "";
    input.placeholder = "Search options…  e.g. legend, brand, axis";
    input.value = state.search;
    input.addEventListener("input", () => {
      state.search = input.value;
      renderPanel();
    });
    const filter = document.createElement("button");
    filter.type = "button";
    filter.className = "play-setonly";
    if (state.setOnly) filter.classList.add("is-on");
    const fields = fieldsFor(chartType(state.spec));
    filter.textContent = `Set · ${setCount(fields)}`;
    filter.addEventListener("click", () => {
      state.setOnly = !state.setOnly;
      renderPanel();
    });
    search.append(input, filter);
    const groups = document.createElement("div");
    groups.className = "play-groups";
    const q = state.search.trim().toLowerCase();
    const essentials = fields.filter((field) => field.essential);
    const sections: { id: string; label: string; items: OptionField[] }[] = [
      { id: "Essentials", label: "Essentials", items: essentials },
      ...OPTION_GROUPS.map((group) => ({
        id: group,
        label: group,
        items: fields.filter((field) => field.group === group && !field.essential),
      })),
    ];
    let shown = 0;
    for (const section of sections) {
      let items = section.items;
      if (q) items = items.filter((field) => `${field.label} ${field.path} ${field.description}`.toLowerCase().includes(q));
      if (state.setOnly) items = items.filter((field) => readOption(state.spec, field).set);
      if (!items.length) continue;
      shown += items.length;
      const open = Boolean(q || state.setOnly || state.open.has(section.id));
      const box = document.createElement("div");
      box.className = "play-group";
      if (open) box.classList.add("is-open");
      const head = document.createElement("button");
      head.type = "button";
      const caret = document.createElement("i");
      caret.textContent = "▶";
      const title = document.createElement("span");
      title.textContent = section.label;
      const setHere = items.filter((field) => readOption(state.spec, field).set).length;
      const badge = document.createElement("em");
      badge.textContent = setHere ? `${setHere} set · ${items.length}` : String(items.length);
      if (setHere) badge.classList.add("is-set");
      head.append(caret, title, badge);
      head.addEventListener("click", () => {
        if (state.open.has(section.id)) state.open.delete(section.id);
        else state.open.add(section.id);
        renderPanel();
      });
      box.append(head);
      if (open) {
        const body = document.createElement("div");
        body.className = "play-group__body";
        for (const field of items) body.append(optionRow(field));
        box.append(body);
      }
      groups.append(box);
    }
    wrap.append(search, groups);
    if (!shown) {
      const empty = document.createElement("div");
      empty.className = "play-empty";
      empty.append(`No options match “${state.search.trim()}”. `);
      const link = document.createElement("a");
      link.href = "/docs/options";
      link.textContent = "Search the docs →";
      empty.append(link);
      groups.append(empty);
    }
    return wrap;
  }

  function optionRow(field: OptionField): HTMLElement {
    const view = readOption(state.spec, field);
    const row = document.createElement("div");
    row.className = "play-opt";
    row.dataset.path = field.path;
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
    if (view.set) {
      const reset = document.createElement("button");
      reset.type = "button";
      reset.textContent = "Reset";
      reset.addEventListener("click", () => commit(field, undefined));
      head.append(reset);
    }
    row.append(dot, head, controlFor(field, view));
    if (field.description) {
      const help = document.createElement("div");
      help.className = "play-opt__help";
      help.textContent = firstSentence(field.description);
      help.title = field.description;
      row.append(help);
    }
    return row;
  }

  function controlFor(field: OptionField, view: { value: unknown; set: boolean; complex: boolean }): HTMLElement {
    if (field.path === "encoding.y" && (Array.isArray(getPath(state.spec, "encoding.y")) || state.hiddenY.length)) return seriesEditor();
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
      const current = view.value == null || view.value === "" ? "" : String(view.value);
      for (const value of enums) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = value;
        if (current === value) button.classList.add("is-on");
        button.addEventListener("click", () => commit(field, value));
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
      const current = view.value == null ? "" : String(view.value);
      const values = [...enums];
      if (current && !values.includes(current)) values.unshift(current);
      for (const value of values) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.append(option);
      }
      select.value = view.set ? current : "";
      select.addEventListener("change", () => commit(field, select.value));
      return select;
    }
    if (field.control === "color") {
      const wrap = document.createElement("div");
      wrap.className = "play-swatches";
      const current = typeof view.value === "string" ? view.value : "";
      for (const hex of SWATCHES) {
        const button = document.createElement("button");
        button.type = "button";
        button.title = hex;
        button.style.background = hex;
        if (current.toLowerCase() === hex.toLowerCase()) button.classList.add("is-on");
        button.addEventListener("click", () => commit(field, hex));
        wrap.append(button);
      }
      const hex = document.createElement("input");
      hex.type = "text";
      hex.value = current;
      hex.spellcheck = false;
      hex.addEventListener("change", () => commit(field, hex.value.trim()));
      wrap.append(hex);
      return wrap;
    }
    if (field.control === "number") {
      const wrap = document.createElement("div");
      wrap.className = "play-step";
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
      wrap.append(minus, input, plus);
      return wrap;
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
    const current = getPath(state.spec, "encoding.y");
    const items = Array.isArray(current) ? current : [];
    items.forEach((item, index) => wrap.append(seriesRow(item, index, true)));
    state.hiddenY.forEach((item, index) => wrap.append(seriesRow(item, index, false)));
    return wrap;
  }

  function seriesRow(item: unknown, index: number, shown: boolean): HTMLElement {
    const row = document.createElement("div");
    row.className = "play-series__row";
    const field = typeof item === "string" ? item : isRecord(item) && typeof item.field === "string" ? item.field : `series ${index + 1}`;
    const name = isRecord(item) && typeof item.title === "string" ? item.title : field;
    const color = isRecord(item) && typeof item.color === "string" ? item.color : SERIES_COLORS[index % SERIES_COLORS.length] ?? "#335c84";
    const swatch = document.createElement("i");
    swatch.style.background = shown ? color : "#dcdcd8";
    const label = document.createElement("span");
    label.textContent = name;
    label.style.color = shown ? "#17181a" : "#a0a2a7";
    const code = document.createElement("code");
    code.textContent = field;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = shown ? "Hide" : "Show";
    button.addEventListener("click", () => {
      const spec = clone(state.spec);
      const encoding = isRecord(spec.encoding) ? spec.encoding : {};
      const list = Array.isArray(encoding.y) ? [...encoding.y] : [];
      if (shown) {
        const [removed] = list.splice(index, 1);
        if (removed !== undefined) state.hiddenY.push(removed);
      } else {
        const [restored] = state.hiddenY.splice(index, 1);
        if (restored !== undefined) list.push(restored);
      }
      encoding.y = list;
      spec.encoding = encoding;
      state.dirty.add("encoding.y");
      setSpec(spec, true);
    });
    row.append(swatch, label, code, button);
    return row;
  }

  function rulesEditor(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "play-rules";
    const rules = getPath(state.spec, "mark.colorRules");
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
      const spec = clone(state.spec);
      const mark = isRecord(spec.mark) ? spec.mark : {};
      const next = Array.isArray(mark.colorRules) ? [...mark.colorRules] : [];
      next.push({ color: "#2e9a5c", gt: 0 });
      mark.colorRules = next;
      spec.mark = mark;
      state.dirty.add("mark.colorRules");
      setSpec(spec, true);
    });
    wrap.append(add);
    return wrap;
  }

  function updateRule(index: number, rule: Record<string, unknown>): void {
    const spec = clone(state.spec);
    const mark = isRecord(spec.mark) ? spec.mark : {};
    const next = Array.isArray(mark.colorRules) ? [...mark.colorRules] : [];
    next[index] = rule;
    mark.colorRules = next;
    spec.mark = mark;
    state.dirty.add("mark.colorRules");
    setSpec(spec, true);
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
    const spec = clone(state.spec);
    const mark = isRecord(spec.mark) ? spec.mark : {};
    mark.palette = colors;
    spec.mark = mark;
    state.dirty.add("mark.palette");
    setSpec(spec, true);
  }

  function specView(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "play-spec";
    const sub = document.createElement("div");
    sub.className = "play-sub";
    sub.textContent = "Edits here update the options. Highlighted lines are set by you.";
    const box = document.createElement("div");
    box.className = "play-specbox";
    const paint = document.createElement("pre");
    const area = document.createElement("textarea");
    area.spellcheck = false;
    area.value = state.text;
    area.addEventListener("input", () => {
      state.text = area.value;
      paintText(paint, area.value);
      window.clearTimeout(parseTimer);
      parseTimer = window.setTimeout(() => commitText(area.value), 300);
    });
    area.addEventListener("blur", () => commitText(area.value));
    area.addEventListener("scroll", () => {
      paint.scrollTop = area.scrollTop;
      paint.scrollLeft = area.scrollLeft;
    });
    paintText(paint, state.text);
    box.append(paint, area);
    wrap.append(sub, box);
    if (state.flash.size) {
      const line = paint.querySelector<HTMLElement>(".hot");
      if (line) area.scrollTop = Math.max(0, line.offsetTop - 48);
      state.flash.clear();
    }
    return wrap;
  }

  let parseTimer = 0;

  function paintText(paint?: HTMLElement, text = state.text): void {
    const host = paint ?? root.querySelector(".play-specbox pre");
    if (!host) return;
    const changed = new Set([...diffPaths(state.baseline, state.good), ...state.flash]);
    host.replaceChildren();
    for (const { line, path } of specLines(text)) {
      const row = document.createElement("div");
      if (path && changed.has(path)) row.classList.add("hot");
      const num = document.createElement("span");
      num.className = "ln";
      num.textContent = String(host.childElementCount + 1);
      row.append(num, document.createTextNode(line || " "));
      host.append(row);
    }
  }

  function commitText(text: string): void {
    try {
      const parsed = JSON.parse(text) as unknown;
      if (!isRecord(parsed)) throw new Error("Spec must be an object");
      state.spec = parsed;
      state.good = clone(parsed);
      state.text = text;
      void refresh(false);
      if (state.tab === "options") renderPanel();
      renderTabs();
    } catch {
      state.valid = "bad";
      state.issues = [{ severity: "error", text: "Spec JSON could not be parsed. The last valid spec is still shown.", action: "", path: "" }];
      paintStatus();
    }
  }

  function dataView(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "play-data";
    const sub = document.createElement("div");
    sub.className = "play-sub";
    sub.append("Edit cells to see the chart update. Paste CSV or JSON to replace.");
    const paste = document.createElement("button");
    paste.type = "button";
    paste.textContent = "Paste…";
    paste.addEventListener("click", () => {
      state.pasteOpen = !state.pasteOpen;
      renderPanel();
    });
    sub.append(paste);
    wrap.append(sub);
    if (state.pasteOpen) {
      const box = document.createElement("div");
      box.className = "play-paste";
      const area = document.createElement("textarea");
      area.placeholder = "CSV with a header row, or a JSON array";
      const apply = document.createElement("button");
      apply.type = "button";
      apply.className = "play-add";
      apply.textContent = "Replace data";
      apply.addEventListener("click", () => {
        const next = parseData(area.value);
        if (!next) return;
        const spec = clone(state.spec);
        spec.data = next;
        state.pasteOpen = false;
        state.dirty.add("data");
        setSpec(spec, true);
      });
      box.append(area, apply);
      wrap.append(box);
    }
    const scroller = document.createElement("div");
    scroller.className = "play-table";
    const rows = rowsOf(state.good);
    const keys = rows[0] ? Object.keys(rows[0]) : [];
    if (!keys.length) {
      scroller.textContent = "This spec has no row table. Paste CSV or JSON.";
      wrap.append(scroller);
      return wrap;
    }
    const table = document.createElement("table");
    const head = document.createElement("tr");
    for (const key of keys) {
      const cell = document.createElement("th");
      cell.textContent = key;
      head.append(cell);
    }
    table.append(head);
    rows.forEach((row, index) => {
      const tr = document.createElement("tr");
      for (const key of keys) {
        const td = document.createElement("td");
        const input = document.createElement("input");
        const value = row[key];
        const numeric = typeof value === "number";
        input.type = numeric ? "number" : "text";
        input.value = value == null ? "" : String(value);
        input.addEventListener("change", () => {
          const spec = clone(state.spec);
          const data = rowsOf(spec);
          const edited = input.value;
          data[index] = { ...data[index], [key]: numeric && edited.trim() !== "" && Number.isFinite(Number(edited)) ? Number(edited) : edited };
          spec.data = writeData(spec.data, data);
          state.dirty.add("data");
          setSpec(spec, false);
        });
        td.append(input);
        tr.append(td);
      }
      table.append(tr);
    });
    scroller.append(table);
    wrap.append(scroller);
    return wrap;
  }

  function renderPreviewChrome(): void {
    const sizes = root.querySelector("[data-sizes]");
    const modes = root.querySelector("[data-modes]");
    sizes?.replaceChildren();
    modes?.replaceChildren();
    for (const [id, label] of [["card", "Card"], ["dashboard", "Dashboard"], ["full", "Full"]] as const) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.size = id;
      button.textContent = label;
      if (state.size === id) button.classList.add("is-on");
      sizes?.append(button);
    }
    for (const [id, label] of [["auto", "Auto"], ["light", "Light"], ["dark", "Dark"]] as const) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.mode = id;
      button.textContent = label;
      if (state.mode === id) button.classList.add("is-on");
      modes?.append(button);
    }
  }

  function resolvedDark(): boolean {
    if (state.mode === "dark") return true;
    if (state.mode === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function viewSize(): SizeName {
    return window.matchMedia("(max-width: 900px)").matches ? "card" : state.size;
  }

  async function refresh(rebuild = true): Promise<void> {
    const started = performance.now();
    const size = SIZES[viewSize()];
    const view = clone(state.good);
    delete view.title;
    delete view.subtitle;
    if (state.mode === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      if (typeof view.theme === "string") view.theme = { preset: view.theme, mode: "dark" };
      else if (isRecord(view.theme)) {
        if (view.theme.mode == null) view.theme = { ...view.theme, mode: "dark" };
      } else view.theme = { mode: "dark" };
    }
    const prev = isRecord(view.size) ? view.size : {};
    view.size = { ...prev, width: size.w, height: size.h };
    try {
      state.svg = await paintSvg(view);
    } catch (error) {
      state.svg = "";
      state.issues = [{ severity: "error", text: error instanceof Error ? error.message : "Render failed", action: "Review", path: "" }];
    }
    state.renderMs = Math.max(1, Math.round(performance.now() - started));
    const canvas = root.querySelector("[data-canvas]");
    if (canvas) {
      canvas.replaceChildren();
      const card = document.createElement("div");
      card.className = "play-card";
      if (resolvedDark()) card.classList.add("is-dark");
      const title = document.createElement("h2");
      title.className = "play-card__title";
      title.textContent = typeof state.good.title === "string" && state.good.title.trim() ? state.good.title : "Untitled";
      const chart = document.createElement("div");
      chart.className = "play-card__chart";
      chart.style.width = `${size.w}px`;
      chart.style.height = `${size.h}px`;
      chart.innerHTML = state.svg;
      const alt = document.createElement("p");
      alt.className = "play-card__alt";
      const code = document.createElement("code");
      code.textContent = "alt";
      const sentence = document.createElement("span");
      sentence.textContent = altText(state.good);
      alt.append(code, sentence);
      card.append(title, chart, alt);
      canvas.append(card);
    }
    const stats = root.querySelector("[data-stats]");
    if (stats) {
      const modeLabel = state.mode === "auto" ? "follows system" : state.mode;
      stats.textContent = `${size.w} × ${size.h + 70} px · ${modeLabel} · svg · ${state.renderMs} ms`;
    }
    const svgSize = root.querySelector("[data-svg-size]");
    const pngSize = root.querySelector("[data-png-size]");
    const jsonLines = root.querySelector("[data-json-lines]");
    if (svgSize) svgSize.textContent = `${(new Blob([state.svg]).size / 1024).toFixed(1)} KB`;
    if (pngSize) pngSize.textContent = `${size.w * 2} px`;
    if (jsonLines) jsonLines.textContent = `${state.text.split("\n").length} lines`;
    if (rebuild && state.tab === "options") renderPanel();
    renderTabs();
    await validateSoon();
  }

  let validateTimer = 0;
  function validateSoon(): Promise<void> {
    window.clearTimeout(validateTimer);
    return new Promise((resolve) => {
      validateTimer = window.setTimeout(() => {
        void runValidate().then(resolve);
      }, 150);
    });
  }

  async function runValidate(): Promise<void> {
    const type = chartType(state.good);
    let result: { ok?: boolean; errors?: { message?: string; path?: string; severity?: string }[]; warnings?: { message?: string; path?: string }[] };
    try {
      if (type === "choropleth" || type === "map-points") result = (await import("@chartkitdev/geo")).validate(state.good);
      else result = (await import("@chartkitdev/core/validate")).validate(state.good);
    } catch (error) {
      result = { ok: false, errors: [{ message: error instanceof Error ? error.message : "Validate failed", path: "" }] };
    }
    const errors = result.errors ?? [];
    const warnings = result.warnings ?? [];
    state.warnCount = warnings.length;
    state.valid = errors.length ? "bad" : warnings.length ? "warn" : "ok";
    state.issues = [
      ...errors.slice(0, 1).map((issue) => ({
        severity: "error" as const,
        text: issue.message ?? "Invalid spec",
        action: "Repair",
        path: jsonPath(issue.path),
      })),
      ...(!errors.length ? warnings.slice(0, 1).map((issue) => ({
        severity: "warning" as const,
        text: issue.message ?? "Warning",
        action: "Review",
        path: jsonPath(issue.path),
      })) : []),
    ];
    if (!state.issues.length) {
      state.issues = [{ severity: "ok", text: `Spec is valid. Renders in ${state.renderMs} ms.`, action: "", path: "" }];
    }
    paintStatus();
  }

  function paintStatus(): void {
    const button = root.querySelector<HTMLButtonElement>("[data-status]");
    if (button) {
      button.classList.remove("is-ok", "is-warn", "is-bad");
      const label = button.querySelector("span");
      if (state.valid === "bad") {
        button.classList.add("is-bad");
        if (label) label.textContent = "Invalid";
      } else if (state.valid === "warn") {
        button.classList.add("is-warn");
        if (label) label.textContent = `${state.warnCount} warning${state.warnCount === 1 ? "" : "s"}`;
      } else {
        button.classList.add("is-ok");
        if (label) label.textContent = "Valid";
      }
    }
    const issue = root.querySelector<HTMLButtonElement>("[data-issue]");
    const row = state.issues[0];
    if (issue && row) {
      issue.classList.remove("is-ok", "is-warn", "is-bad");
      issue.classList.add(row.severity === "error" ? "is-bad" : row.severity === "warning" ? "is-warn" : "is-ok");
      const text = issue.querySelector("span");
      const action = issue.querySelector("b");
      const dot = issue.querySelector("i");
      if (text) text.textContent = row.text;
      if (action) action.textContent = row.action;
      if (dot) dot.style.background = row.severity === "error" ? "#c24b3a" : row.severity === "warning" ? "#f59e0b" : "#2e9a5c";
    }
  }

  function jump(path: string): void {
    setTab("options");
    const field = optionCatalog.find((item) => item.path === path || path.startsWith(`${item.path}.`) || item.path.startsWith(`${path}.`));
    const group = field?.essential ? "Essentials" : field?.group;
    if (group) state.open.add(group);
    renderPanel();
    const wanted = field?.path || path;
    const row = [...root.querySelectorAll<HTMLElement>("[data-path]")].find((item) => item.dataset.path === wanted || item.dataset.path === path);
    row?.scrollIntoView({ block: "center" });
  }

  async function repair(): Promise<void> {
    const { repair: repairSpec } = await import("@chartkitdev/core/validate");
    const result = repairSpec(state.good);
    if (isRecord(result.spec)) {
      state.dirty.add("repair");
      setSpec(result.spec, true);
    }
  }

  function setType(type: string): void {
    const spec = clone(state.spec);
    spec.type = type;
    state.dirty.add("type");
    state.hiddenY = [];
    setSpec(spec, true);
  }

  function setMode(mode: ModeName): void {
    state.mode = mode;
    const spec = clone(state.spec);
    if (mode === "auto") {
      if (isRecord(spec.theme)) {
        delete spec.theme.mode;
        if (!Object.keys(spec.theme).length) delete spec.theme;
      }
    } else if (typeof spec.theme === "string") spec.theme = { preset: spec.theme, mode };
    else if (isRecord(spec.theme)) spec.theme.mode = mode;
    else spec.theme = { mode };
    state.dirty.add("theme.mode");
    setSpec(spec, true);
    renderPreviewChrome();
  }

  function commit(field: OptionField, value: unknown): void {
    const next = value === undefined ? resetOption(state.spec, field) : writeOption(state.spec, field, value);
    state.dirty.add(field.path);
    state.flash.add(field.path);
    state.hiddenY = field.path === "encoding.y" ? state.hiddenY : state.hiddenY;
    setSpec(next, true);
  }

  function setSpec(spec: Record<string, unknown>, rebuild: boolean): void {
    state.spec = spec;
    state.good = clone(spec);
    state.text = pretty(spec);
    void refresh(rebuild);
    if (state.tab !== "options") renderPanel();
    else if (rebuild) renderPanel();
  }

  function applyExample(slug: string): void {
    const example = examples.find((item) => item.slug === slug);
    if (!example) return;
    state.slug = slug;
    state.baseline = clone(example.spec);
    state.hiddenY = [];
    state.dirty.clear();
    state.search = "";
    state.setOnly = false;
    state.pasteOpen = false;
    state.open = new Set(["Essentials"]);
    state.tab = "options";
    state.mode = modeOf(example.spec);
    localStorage.setItem(TAB_KEY, "options");
    setSpec(clone(example.spec), true);
    renderPreviewChrome();
    renderRail();
    renderTypeSwitch();
  }

  function setTab(tab: TabName): void {
    state.tab = tab;
    localStorage.setItem(TAB_KEY, tab);
    renderTabs();
    renderPanel();
  }

  function footAction(): void {
    if (state.tab === "options") {
      const example = examples.find((item) => item.slug === state.slug);
      if (example) applyExample(example.slug);
      else setSpec(clone(state.baseline), true);
      return;
    }
    if (state.tab === "spec") {
      void navigator.clipboard?.writeText(state.text);
      state.copied = true;
      renderPanel();
      window.setTimeout(() => {
        state.copied = false;
        if (state.tab === "spec") renderPanel();
      }, 1200);
      return;
    }
    download(`${filename()}.csv`, toCsv(rowsOf(state.good)), "text/csv");
  }

  async function share(): Promise<void> {
    const payload = { example: state.slug, spec: state.good, size: state.size, mode: state.mode };
    const hash = `#${encodeURIComponent(JSON.stringify(payload))}`;
    history.replaceState(null, "", hash);
    const url = `${location.origin}${location.pathname}${hash}`;
    try {
      await navigator.clipboard.writeText(url);
      const button = root.querySelector("[data-share]");
      if (button) {
        button.textContent = "Copied";
        window.setTimeout(() => {
          button.textContent = "Share";
        }, 1200);
      }
    } catch {
      /* The hash is still updated. */
    }
  }

  async function exportAs(kind: string): Promise<void> {
    if (kind === "svg") download(`${filename()}.svg`, state.svg, "image/svg+xml");
    else if (kind === "json") download(`${filename()}.json`, state.text, "application/json");
    else if (kind === "embed") {
      const snippet = `import { render } from "@chartkitdev/core/all";\n\nconst spec = ${state.text};\n\nrender(spec);\n`;
      await navigator.clipboard?.writeText(snippet);
    } else if (kind === "png") {
      const blob = await pngBlob(state.svg, SIZES[state.size].w * 2, SIZES[state.size].h * 2);
      if (blob) downloadBlob(blob, `${filename()}.png`);
    }
  }

  function filename(): string {
    return state.slug || chartType(state.good) || "chart";
  }
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function modeOf(spec: Record<string, unknown>): ModeName {
  if (isRecord(spec.theme) && (spec.theme.mode === "light" || spec.theme.mode === "dark")) return spec.theme.mode;
  return "auto";
}

function usesJson(field: OptionField, spec: Record<string, unknown>, hiddenY: unknown[]): boolean {
  const view = readOption(spec, field);
  if (field.path === "encoding.y" && (Array.isArray(getPath(spec, "encoding.y")) || hiddenY.length)) return false;
  if (field.path === "mark.colorRules") return false;
  if (field.path === "mark.palette" && (view.value == null || Array.isArray(view.value))) return false;
  return view.complex || field.control === "json";
}

function specLines(text: string): { line: string; path: string }[] {
  const stack: { indent: number; key: string }[] = [];
  return text.split("\n").map((line) => {
    const match = /^(\s*)"((?:\\.|[^"\\])*)"\s*:/.exec(line);
    if (!match) return { line, path: "" };
    const indent = match[1]?.length ?? 0;
    while (stack.length && (stack[stack.length - 1]?.indent ?? 0) >= indent) stack.pop();
    const key = match[2] ?? "";
    const parent = stack.map((item) => item.key).join(".");
    stack.push({ indent, key });
    return { line, path: parent ? `${parent}.${key}` : key };
  });
}

function uniqueTypes(examples: ExampleSeed[]): string[] {
  const seen = new Set<string>(chartTypes.map((item) => item.type));
  for (const example of examples) if (example.type) seen.add(example.type);
  return [...seen];
}

function jsonPath(path: string | undefined): string {
  if (!path) return "";
  return path.replace(/^\//, "").replace(/\//g, ".").replace(/\.\d+(?=\.|$)/g, "");
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

function altText(spec: Record<string, unknown>): string {
  const alt = isRecord(spec.a11y) && typeof spec.a11y.alt === "string" ? spec.a11y.alt.trim() : "";
  if (alt) return alt;
  const title = typeof spec.title === "string" && spec.title.trim() ? spec.title.trim() : "This chart";
  return `${title}. No alt text is set, so this sentence is generated from the title.`;
}

function diffPaths(base: unknown, next: unknown, prefix = ""): string[] {
  if (Object.is(base, next) || sameValue(base, next)) return [];
  if (Array.isArray(base) || Array.isArray(next)) return prefix ? [prefix] : [];
  if (!isRecord(base) || !isRecord(next)) return prefix ? [prefix] : [];
  const keys = new Set([...Object.keys(base), ...Object.keys(next)]);
  const out: string[] = [];
  for (const key of keys) {
    const path = prefix ? `${prefix}.${key}` : key;
    out.push(...diffPaths(base[key], next[key], path));
  }
  return out;
}

function sameValue(base: unknown, next: unknown): boolean {
  if (Object.is(base, next)) return true;
  if (Array.isArray(base) && Array.isArray(next)) return base.length === next.length && base.every((item, index) => sameValue(item, next[index]));
  if (!isRecord(base) || !isRecord(next) || Array.isArray(base) || Array.isArray(next)) return false;
  const keys = new Set([...Object.keys(base), ...Object.keys(next)]);
  for (const key of keys) if (!sameValue(base[key], next[key])) return false;
  return true;
}

function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = /^[\s\S]*?[.!?](?=\s|$)/.exec(trimmed);
  const sentence = match?.[0] ?? trimmed;
  return sentence.length > 220 ? `${sentence.slice(0, 217)}…` : sentence;
}

function writeData(current: unknown, rows: Record<string, unknown>[]): unknown {
  if (isRecord(current) && isRecord(current.columns)) {
    const columns: Record<string, unknown[]> = {};
    for (const row of rows) {
      for (const [key, value] of Object.entries(row)) {
        columns[key] ??= [];
        columns[key]?.push(value);
      }
    }
    return { ...current, columns };
  }
  if (Array.isArray(current) && current.every((item) => typeof item === "number" || item == null)) {
    return rows.map((row) => (typeof row.value === "number" ? row.value : Number(row.value) || 0));
  }
  return rows;
}

function parseData(text: string): unknown[] | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return null;
    }
  }
  const lines = trimmed.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return null;
  const cells = lines.map((line) => line.split(",").map((cell) => cell.trim()));
  const header = cells[0] ?? [];
  const body = cells.slice(1);
  return body.map((row) => {
    const record: Record<string, unknown> = {};
    header.forEach((key, index) => {
      const value = row[index] ?? "";
      record[key || `col${index + 1}`] = value !== "" && Number.isFinite(Number(value)) ? Number(value) : value;
    });
    return record;
  });
}

function toCsv(rows: Record<string, unknown>[]): string {
  const keys = rows[0] ? Object.keys(rows[0]) : [];
  const lines = [keys.join(",")];
  for (const row of rows) lines.push(keys.map((key) => String(row[key] ?? "")).join(","));
  return lines.join("\n");
}

async function paintSvg(spec: Record<string, unknown>): Promise<string> {
  const type = chartType(spec);
  if (type === "choropleth" || type === "map-points") {
    const geo = await import("@chartkitdev/geo");
    return geo.render(spec);
  }
  return drawChart(spec);
}

function pngBlob(svg: string, width: number, height: number): Promise<Blob | null> {
  const sized = svg.replace("<svg", `<svg width="${width}" height="${height}"`);
  const blob = new Blob([sized], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);
      canvas.toBlob((png) => resolve(png));
      URL.revokeObjectURL(url);
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

function download(name: string, text: string, type: string): void {
  downloadBlob(new Blob([text], { type }), name);
}

function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
