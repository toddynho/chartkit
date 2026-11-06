import {
  getPath,
  optionBlocked,
  optionCatalog,
  readOption,
  resetOption,
  writeOption,
  type OptionField,
} from "@chartkitdev/core/options";
import type { ChartSpec } from "@chartkitdev/core";
import { mount } from "@chartkitdev/vanilla";
import { previewSize, readExplicitSize, stripPreviewSize, type PreviewPreset } from "../data/preview-size";
import { menuPosition } from "./menu-place";
import { bindExamplePicker, selectExample } from "./example-picker";
import { mountOptionControls, type OptionControls } from "./option-controls";
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

const TAB_KEY = "ck-playground-tab";
const ZOOM_KEY = "ck-playground-zoom";
const ZOOM_STEPS = [50, 75, 100, 125, 150, 175, 200];

export function mountPlayground(root: HTMLElement, data: PlayData): void {
  const examples = data.examples.filter((item) => item.spec && typeof item.spec === "object");
  const tab = (localStorage.getItem(TAB_KEY) as TabName) || "options";
  const picker = root.querySelector<HTMLElement>("[data-example-picker]");

  const state = {
    examples,
    slug: examples[0]?.slug ?? "",
    spec: clone(examples[0]?.spec ?? {}),
    baseline: clone(examples[0]?.spec ?? {}),
    text: pretty(examples[0]?.spec ?? {}),
    good: clone(examples[0]?.spec ?? {}),
    tab: (["options", "spec", "data"] as TabName[]).includes(tab) ? tab : "options",
    size: "card" as SizeName,
    mode: "auto" as ModeName,
    zoom: readZoom(),
    pasteOpen: false,
    copied: false,
    dirty: new Set<string>(),
    flash: new Set<string>(),
    hiddenY: [] as unknown[],
    issues: [] as IssueRow[],
    renderMs: 0,
    svg: "",
    valid: "ok" as "ok" | "warn" | "bad",
    warnCount: 0,
  };

  let controls: OptionControls | null = null;
  let optionsHost: HTMLElement | null = null;
  let resetOptions = false;

  let paintGen = 0;
  let liveDestroy: (() => void) | null = null;

  picker?.remove();
  root.innerHTML = shell();
  const pickerSlot = root.querySelector("[data-picker-slot]");
  if (picker && pickerSlot) pickerSlot.append(picker);
  bind(root);
  if (picker) bindExamplePicker(picker, (slug) => applyExample(slug));
  readHash();
  selectExample(picker, state.slug);
  paintText();
  renderTabs();
  renderPanel();
  renderPreviewChrome();
  paintZoom();
  void refresh();

  function shell(): string {
    return `
      <div class="play-work">
        <aside class="play-panel">
          <div class="play-tabs" role="tablist" data-tabs></div>
          <div data-panel style="display:flex;flex-direction:column;flex:1;min-height:0"></div>
          <div class="play-foot"><span data-foot-note></span><button type="button" data-foot-action></button></div>
        </aside>
        <section class="play-preview" tabindex="0">
          <div class="play-preview__bar">
            <span>Preview</span>
            <div class="play-seg" data-sizes></div>
            <div class="play-seg" data-modes></div>
            <div class="play-preview__end">
            <div class="play-preview__actions">
              <button type="button" class="play-status is-ok" data-status><i></i><span>Valid</span></button>
              <button type="button" class="play-share" data-share>Share</button>
              <div class="play-export">
                <button type="button" data-export popovertarget="play-export-menu" aria-haspopup="menu" aria-expanded="false" aria-controls="play-export-menu">Export <span>▾</span></button>
                <div class="play-menu" id="play-export-menu" data-menu popover="auto" role="menu" aria-label="Export">
                  <button type="button" role="menuitem" data-exp="svg">SVG <em data-svg-size></em></button>
                  <button type="button" role="menuitem" data-exp="png">PNG · 2× <em data-png-size></em></button>
                  <button type="button" role="menuitem" data-exp="json">Spec JSON <em data-json-lines></em></button>
                  <hr role="separator" />
                  <button type="button" role="menuitem" data-exp="embed">Copy embed snippet</button>
                </div>
              </div>
            </div>
            <div class="play-zoom" data-zoom>
              <button type="button" data-zoom-out aria-label="Zoom out">−</button>
              <button type="button" data-zoom-fit title="Fit">100%</button>
              <button type="button" data-zoom-in aria-label="Zoom in">+</button>
            </div>
            </div>
          </div>
          <div class="play-picker-slot" data-picker-slot></div>
          <div class="play-canvas" data-canvas></div>
          <div class="play-foot">
            <button type="button" class="play-issue is-ok" data-issue><i></i><span></span><b></b></button>
            <em data-stats></em>
          </div>
        </section>
      </div>`;
  }

  function bind(host: HTMLElement) {
    host.querySelector("[data-zoom-out]")?.addEventListener("click", () => stepZoom(-1));
    host.querySelector("[data-zoom-in]")?.addEventListener("click", () => stepZoom(1));
    host.querySelector("[data-zoom-fit]")?.addEventListener("click", () => setZoom(100));
    const preview = host.querySelector<HTMLElement>(".play-preview");
    preview?.addEventListener("mousedown", (event) => {
      const target = event.target as HTMLElement;
      if (target.closest("button, a, input, textarea, select")) return;
      preview.focus();
    });
    preview?.addEventListener("keydown", (event) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        stepZoom(1);
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        stepZoom(-1);
      } else if (event.key === "0") {
        event.preventDefault();
        setZoom(100);
      }
    });
    host.querySelector("[data-share]")?.addEventListener("click", () => void share());
    bindExportMenu(host);
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
    return host;
  }

  function bindExportMenu(host: HTMLElement): void {
    const button = host.querySelector<HTMLButtonElement>("[data-export]");
    const menu = host.querySelector<HTMLElement>("[data-menu]");
    if (!button || !menu) return;
    const items = () => [...menu.querySelectorAll<HTMLButtonElement>("[role='menuitem']")];
    const place = () => {
      const anchor = button.getBoundingClientRect();
      const box = menu.getBoundingClientRect();
      const next = menuPosition(anchor, box, { width: window.innerWidth, height: window.innerHeight });
      menu.style.top = `${next.top}px`;
      menu.style.left = `${next.left}px`;
    };
    menu.addEventListener("toggle", (event) => {
      const open = (event as Event & { newState?: string }).newState === "open";
      button.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) return;
      place();
      items()[0]?.focus();
    });
    menu.addEventListener("click", (event) => {
      const item = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-exp]");
      if (!item) return;
      menu.hidePopover();
      void exportAs(item.dataset.exp ?? "");
    });
    menu.addEventListener("keydown", (event) => {
      const list = items();
      const index = list.indexOf(document.activeElement as HTMLButtonElement);
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        list[(index + step + list.length) % list.length]?.focus();
      } else if (event.key === "Home") {
        event.preventDefault();
        list[0]?.focus();
      } else if (event.key === "End") {
        event.preventDefault();
        list[list.length - 1]?.focus();
      } else if (event.key === "Escape") {
        button.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (menu.matches(":popover-open")) place();
    });
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
  }

  function ensureControls(): OptionControls {
    if (!optionsHost) {
      optionsHost = document.createElement("div");
      optionsHost.dataset.optionControls = "";
      controls = mountOptionControls(optionsHost, {
        readSpec: () => state.spec,
        readHiddenY: () => state.hiddenY,
        setHiddenY: (items) => {
          state.hiddenY = items;
        },
        commit: (field, value) => commit(field, value),
        replace: (next, path) => {
          state.dirty.add(path);
          state.flash.add(path);
          setSpec(next, true);
        },
      });
    }
    return controls as OptionControls;
  }

  function renderPanel(): void {
    const panel = root.querySelector("[data-panel]");
    if (!panel) return;
    const table = root.querySelector(".play-table");
    const savedTable = table?.scrollTop ?? 0;
    if (state.tab === "options") {
      const host = ensureControls();
      if (optionsHost && optionsHost.parentElement !== panel) panel.replaceChildren(optionsHost);
      host.refresh(resetOptions);
      resetOptions = false;
    } else {
      panel.replaceChildren();
      if (state.tab === "spec") panel.append(specView());
      else panel.append(dataView());
    }
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
    const nextTable = root.querySelector(".play-table");
    if (nextTable) nextTable.scrollTop = savedTable;
    root.dataset.jsonFallbacks = String(fields.filter((field) => usesJson(field, state.spec, state.hiddenY)).length);
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
      const typeChanged = chartType(parsed) !== chartType(state.spec);
      if (typeChanged && !sizeEdited(parsed)) {
        stripPreviewSize(parsed);
        text = pretty(parsed);
        const area = root.querySelector<HTMLTextAreaElement>(".play-specbox textarea");
        if (area) area.value = text;
      }
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

  function viewPreset(): PreviewPreset {
    return window.matchMedia("(max-width: 900px)").matches ? "card" : state.size;
  }

  const SIZE_FIELDS = ["size.width", "size.height", "size.aspectRatio"];

  function sizeEdited(spec: Record<string, unknown> = state.spec): boolean {
    if (SIZE_FIELDS.some((path) => state.dirty.has(path))) return true;
    const current = readExplicitSize(spec);
    const base = readExplicitSize(state.baseline);
    return current.width !== base.width || current.height !== base.height || current.aspectRatio !== base.aspectRatio;
  }

  async function refresh(rebuild = true): Promise<void> {
    const gen = ++paintGen;
    liveDestroy?.();
    liveDestroy = null;
    const started = performance.now();
    const size = previewSize(chartType(state.good), viewPreset(), state.good);
    const view = clone(state.good);
    delete view.title;
    delete view.subtitle;
    if (state.mode === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      if (typeof view.theme === "string") view.theme = { preset: view.theme, mode: "dark" };
      else if (isRecord(view.theme)) {
        if (view.theme.mode == null) view.theme = { ...view.theme, mode: "dark" };
      } else view.theme = { mode: "dark" };
    }
    const prev = isRecord(view.size) ? { ...view.size } : {};
    prev.width = size.width;
    if (size.height != null) prev.height = size.height;
    else delete prev.height;
    if (size.minHeight != null) prev.minHeight = size.minHeight;
    view.size = prev;
    try {
      state.svg = await paintSvg(view);
    } catch (error) {
      state.svg = "";
      state.issues = [{ severity: "error", text: error instanceof Error ? error.message : "Render failed", action: "Review", path: "" }];
    }
    state.renderMs = Math.max(1, Math.round(performance.now() - started));
    if (gen !== paintGen) return;
    const canvas = root.querySelector("[data-canvas]");
    if (canvas) {
      canvas.replaceChildren();
      const card = document.createElement("div");
      card.className = "play-card";
      if (resolvedDark()) card.classList.add("is-dark");
      const gutter = canvas ? Number.parseFloat(getComputedStyle(canvas).paddingLeft) + Number.parseFloat(getComputedStyle(canvas).paddingRight) : 0;
      const fitted = canvas ? Math.max(200, canvas.clientWidth - gutter) : size.width + 42;
      const cardWidth = Math.min(size.width + 42, fitted);
      const chartWidth = Math.max(120, cardWidth - 42);
      card.style.width = `${cardWidth}px`;
      const title = document.createElement("h2");
      title.className = "play-card__title";
      title.textContent = typeof state.good.title === "string" && state.good.title.trim() ? state.good.title : "Untitled";
      const chart = document.createElement("div");
      chart.className = "play-card__chart";
      chart.dataset.ckLive = "1";
      chart.style.width = `${chartWidth}px`;
      chart.innerHTML = state.svg;
      const paintedHeight = Number(chart.querySelector("svg")?.getAttribute("height"));
      const natural = Number.isFinite(paintedHeight) && paintedHeight > 0 ? paintedHeight : (size.height ?? 240);
      const drawn = size.width > 0 ? Math.max(1, Math.round(natural * (chartWidth / size.width))) : natural;
      chart.style.height = `${drawn}px`;
      const kind = chartType(view);
      try {
        if (kind === "choropleth" || kind === "map-points") {
          const svg = chart.querySelector("svg");
          if (svg) {
            const { attach } = await import("@chartkitdev/geo");
            if (gen !== paintGen) return;
            const stop = attach(svg);
            liveDestroy = stop;
          }
        } else if (state.svg.includes("<svg")) {
          const handle = mount(chart, view as ChartSpec);
          if (gen !== paintGen) {
            handle.destroy();
            return;
          }
          liveDestroy = () => {
            handle.destroy();
            document.querySelectorAll("[data-ck-extra-tip]").forEach((node) => node.remove());
          };
        }
      } catch {
        chart.innerHTML = state.svg;
      }
      const alt = document.createElement("p");
      alt.className = "play-card__alt";
      const code = document.createElement("code");
      code.textContent = "alt";
      const sentence = document.createElement("span");
      sentence.textContent = altText(state.good);
      alt.append(code, sentence);
      card.append(title, chart, alt);
      const stage = document.createElement("div");
      stage.className = "play-stage";
      stage.append(card);
      canvas.append(stage);
      paintZoom();
    }
    const stats = root.querySelector("[data-stats]");
    const drawnHeight = Number(canvas?.querySelector(".play-card__chart svg")?.getAttribute("height"));
    const shownHeight = Number.isFinite(drawnHeight) && drawnHeight > 0 ? drawnHeight : (size.height ?? 0);
    if (stats) {
      const modeLabel = state.mode === "auto" ? "follows system" : state.mode;
      stats.textContent = `${size.width} × ${shownHeight + 70} px · ${modeLabel} · svg · ${state.renderMs} ms`;
    }
    const svgSize = root.querySelector("[data-svg-size]");
    const pngSize = root.querySelector("[data-png-size]");
    const jsonLines = root.querySelector("[data-json-lines]");
    if (svgSize) svgSize.textContent = `${(new Blob([state.svg]).size / 1024).toFixed(1)} KB`;
    if (pngSize) pngSize.textContent = `${size.width * 2} px`;
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
    ensureControls().reveal(path);
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
    if (!sizeEdited()) stripPreviewSize(spec);
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
    if (field.path === "type" && typeof value === "string" && value) {
      setType(value);
      return;
    }
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
    state.pasteOpen = false;
    state.tab = "options";
    state.mode = modeOf(example.spec);
    localStorage.setItem(TAB_KEY, "options");
    resetOptions = true;
    setSpec(clone(example.spec), true);
    renderPreviewChrome();
    selectExample(picker, slug);
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

  function setZoom(next: number): void {
    const snapped = ZOOM_STEPS.reduce((best, step) => (Math.abs(step - next) < Math.abs(best - next) ? step : best), 100);
    state.zoom = snapped;
    localStorage.setItem(ZOOM_KEY, String(snapped));
    paintZoom();
  }

  function stepZoom(dir: number): void {
    const index = ZOOM_STEPS.indexOf(state.zoom);
    const next = ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, (index < 0 ? ZOOM_STEPS.indexOf(100) : index) + dir))];
    if (next != null) setZoom(next);
  }

  function paintZoom(): void {
    const label = root.querySelector("[data-zoom-fit]");
    if (label) label.textContent = `${state.zoom}%`;
    const out = root.querySelector<HTMLButtonElement>("[data-zoom-out]");
    const inn = root.querySelector<HTMLButtonElement>("[data-zoom-in]");
    if (out) out.disabled = state.zoom <= ZOOM_STEPS[0];
    if (inn) inn.disabled = state.zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1];
    const card = root.querySelector<HTMLElement>(".play-card");
    const stage = root.querySelector<HTMLElement>(".play-stage");
    if (!card || !stage) return;
    const zoom = state.zoom / 100;
    card.style.transform = "none";
    const width = card.offsetWidth;
    const height = card.offsetHeight;
    card.style.transform = `scale(${zoom})`;
    stage.style.width = `${Math.round(width * zoom)}px`;
    stage.style.height = `${Math.round(height * zoom)}px`;
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
      const box = previewSize(chartType(state.good), viewPreset(), state.good);
      const painted = Number(/height="([\d.]+)"/.exec(state.svg)?.[1]);
      const height = Number.isFinite(painted) && painted > 0 ? painted : (box.height ?? 240);
      const blob = await pngBlob(state.svg, box.width * 2, height * 2);
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

function readZoom(): number {
  const raw = Number(localStorage.getItem(ZOOM_KEY));
  return ZOOM_STEPS.includes(raw) ? raw : 100;
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

function jsonPath(path: string | undefined): string {
  if (!path) return "";
  return path.replace(/^\//, "").replace(/\//g, ".").replace(/\.\d+(?=\.|$)/g, "");
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
