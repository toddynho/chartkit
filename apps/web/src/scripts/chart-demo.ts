import { attach, type Controller } from "@chartkitdev/core/interact";
import { paintSpec } from "../lib/chartkit";
import { withPreviewSize } from "../data/preview-size";
import { teachModule } from "../data/teach/registry";
import { formatNumber, openTeachExample, playgroundHref, roundStep, specText } from "../data/teach/spec";

function buttons(root: ParentNode, selector: string): HTMLButtonElement[] {
  return [...root.querySelectorAll<HTMLButtonElement>(selector)];
}

function setPressed(group: HTMLButtonElement[], value: string): void {
  for (const button of group) {
    const on = button.dataset.value === value;
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-pressed", on ? "true" : "false");
  }
}

/** Wire a teaching-page demo. The markup already shows the first example without this script. */
export function mountChartDemo(): void {
  const found = document.querySelector<HTMLElement>("[data-chart-demo]");
  if (!found || found.dataset.ready === "1") return;
  const demo: HTMLElement = found;
  const module = teachModule(demo.dataset.teachType ?? "");
  if (!module) return;
  demo.dataset.ready = "1";

  const chart = demo.querySelector<HTMLElement>("[data-demo-chart]");
  const snippet = demo.querySelector<HTMLElement>("[data-demo-snippet]");
  const play = demo.querySelector<HTMLAnchorElement>("[data-demo-play]");
  const blurb = demo.querySelector<HTMLElement>("[data-demo-blurb]");
  const error = demo.querySelector<HTMLElement>("[data-demo-error]");
  const switcher = demo.querySelector<HTMLElement>("[data-ex-switch]");
  const titleButton = demo.querySelector<HTMLButtonElement>("[data-ex-title]");
  const nameEl = demo.querySelector<HTMLElement>("[data-ex-name]");
  const countEl = demo.querySelector<HTMLElement>("[data-ex-count]");
  const menu = demo.querySelector<HTMLElement>("#ex-switch-list");
  const prev = demo.querySelector<HTMLButtonElement>("[data-ex-prev]");
  const next = demo.querySelector<HTMLButtonElement>("[data-ex-next]");
  const options = buttons(demo, "[data-example-id]");
  const ranges = [...demo.querySelectorAll<HTMLInputElement>("[data-range]")];
  const choiceButtons = buttons(demo, "[data-choice]");
  if (!chart || !snippet || !play) return;

  const examples = module.examples;
  const byId = new Map(examples.map((example) => [example.id, example]));
  let index = Math.max(0, examples.findIndex((example) => example.id === demo.dataset.example));
  let cursor = index;
  let menuOpen = false;
  let tip: Controller | null = null;
  let current = openTeachExample(examples[index]!.spec);

  function exampleFromUrl(): number {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("example");
    if (query && byId.has(query)) return examples.findIndex((example) => example.id === query);
    const hash = window.location.hash.replace(/^#/, "");
    const hashed = hash.startsWith("example=") ? hash.slice("example=".length) : hash;
    if (hashed && byId.has(hashed)) return examples.findIndex((example) => example.id === hashed);
    return -1;
  }

  function remember(id: string): void {
    const url = new URL(window.location.href);
    if (url.searchParams.get("example") === id) return;
    url.searchParams.set("example", id);
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    history.replaceState(null, "", nextUrl);
  }

  function paintMenu(): void {
    const currentId = examples[index]?.id;
    for (const option of options) {
      const on = option.dataset.exampleId === currentId;
      const hot = options[cursor] === option;
      option.setAttribute("aria-selected", on ? "true" : "false");
      option.classList.toggle("is-active", hot);
    }
    const hotId = options[cursor]?.id;
    if (menu && hotId) menu.setAttribute("aria-activedescendant", hotId);
  }

  function setSteps(): void {
    const atStart = index <= 0;
    const atEnd = index >= examples.length - 1;
    if (prev) prev.setAttribute("aria-disabled", atStart ? "true" : "false");
    if (next) next.setAttribute("aria-disabled", atEnd ? "true" : "false");
    if (countEl) countEl.textContent = `${index + 1} / ${examples.length}`;
    const example = examples[index];
    if (nameEl && example) nameEl.textContent = example.title;
    if (blurb && example) blurb.textContent = example.blurb;
    if (example) demo.dataset.example = example.id;
    paintMenu();
  }

  function openMenu(): void {
    if (!menu || !titleButton) return;
    cursor = index;
    menuOpen = true;
    menu.hidden = false;
    titleButton.setAttribute("aria-expanded", "true");
    paintMenu();
  }

  function closeMenu(focusTitle = false): void {
    if (!menu || !titleButton) return;
    menuOpen = false;
    menu.hidden = true;
    titleButton.setAttribute("aria-expanded", "false");
    if (focusTitle) titleButton.focus();
  }

  function showExample(nextIndex: number, updateUrl: boolean, focusTitle = false): void {
    if (nextIndex < 0 || nextIndex >= examples.length) return;
    if (nextIndex === index) {
      closeMenu(focusTitle);
      return;
    }
    const example = examples[nextIndex];
    if (!example) return;
    index = nextIndex;
    cursor = nextIndex;
    current = openTeachExample(example.spec);
    setSteps();
    sync();
    draw(true);
    if (updateUrl) remember(example.id);
    closeMenu(focusTitle);
  }

  function draw(fade = false): void {
    const painted = paintSpec(withPreviewSize(current));
    const commit = () => {
      tip?.destroy();
      tip = null;
      chart!.innerHTML = painted.svg;
      if (error) {
        error.hidden = painted.ok;
        error.textContent = painted.ok ? "" : painted.issues.map((issue) => `${issue.code}: ${issue.message}`).join(" ");
      }
      if (chart!.querySelector("svg")) {
        tip = attach(chart!, withPreviewSize(current) as never, {
          render: (value) => paintSpec(withPreviewSize(value as Record<string, unknown>)).svg,
        });
      }
    };
    if (fade) {
      chart!.classList.add("is-swap");
      commit();
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => chart!.classList.remove("is-swap"));
      });
    } else {
      commit();
    }
    snippet!.textContent = specText(current);
    play!.href = playgroundHref(current);
  }

  function sync(): void {
    const state = module!.controlState(current);
    for (const input of ranges) {
      const id = input.dataset.range ?? "";
      const value = state[id];
      if (typeof value !== "number") continue;
      input.value = String(value);
      const out = demo.querySelector<HTMLElement>(`[data-range-out="${id}"]`);
      if (out) out.textContent = formatNumber(value);
    }
    const groups = new Map<string, HTMLButtonElement[]>();
    for (const button of choiceButtons) {
      const id = button.dataset.choice ?? "";
      const group = groups.get(id) ?? [];
      group.push(button);
      groups.set(id, group);
    }
    for (const [id, group] of groups) {
      const value = state[id];
      setPressed(group, value == null ? "" : String(value));
    }
  }

  function applyChoice(id: string, value: string): void {
    const restore = id === "tooltip" ? examples[index]?.spec.tooltip : undefined;
    module!.apply(current, { id, value, restore });
    sync();
    draw();
  }

  for (const input of ranges) {
    input.addEventListener("input", () => {
      const id = input.dataset.range ?? "";
      const step = Number(input.step) || 1;
      const value = roundStep(Number(input.value), step);
      const out = demo.querySelector<HTMLElement>(`[data-range-out="${id}"]`);
      if (out) out.textContent = formatNumber(value);
      module.apply(current, { id, value });
      draw();
    });
  }

  for (const button of choiceButtons) {
    button.addEventListener("click", () => {
      const id = button.dataset.choice;
      const value = button.dataset.value;
      if (!id || value == null) return;
      applyChoice(id, value);
    });
  }

  function step(delta: number): void {
    showExample(index + delta, true);
  }

  function blocked(button: HTMLButtonElement | null): boolean {
    return button?.getAttribute("aria-disabled") === "true";
  }

  prev?.addEventListener("click", () => {
    if (blocked(prev)) return;
    step(-1);
  });
  next?.addEventListener("click", () => {
    if (blocked(next)) return;
    step(1);
  });
  titleButton?.addEventListener("click", () => {
    if (menuOpen) closeMenu(false);
    else openMenu();
  });
  for (const option of options) {
    option.addEventListener("mousedown", (event) => event.preventDefault());
    option.addEventListener("click", () => {
      const nextIndex = examples.findIndex((example) => example.id === option.dataset.exampleId);
      showExample(nextIndex, true, true);
    });
  }
  switcher?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      step(event.key === "ArrowLeft" ? -1 : 1);
      return;
    }
    const inMenu = menu?.contains(event.target as Node) ?? false;
    if (event.target !== titleButton && !inMenu) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!menuOpen) openMenu();
      else {
        cursor = event.key === "ArrowDown" ? Math.min(examples.length - 1, cursor + 1) : Math.max(0, cursor - 1);
        paintMenu();
      }
    } else if ((event.key === "Enter" || event.key === " ") && event.target === titleButton) {
      event.preventDefault();
      if (!menuOpen) openMenu();
      else showExample(cursor, true, true);
    } else if (event.key === "Escape" && menuOpen) {
      event.preventDefault();
      closeMenu(true);
    }
  });
  titleButton?.addEventListener("blur", () => {
    window.setTimeout(() => {
      if (!switcher?.contains(document.activeElement)) closeMenu(false);
    }, 0);
  });
  document.addEventListener("click", (event) => {
    if (!menuOpen || switcher?.contains(event.target as Node)) return;
    closeMenu(false);
  });

  const linked = exampleFromUrl();
  if (linked >= 0 && linked !== index) showExample(linked, false);
  else {
    setSteps();
    draw();
  }

  const copy = demo.querySelector<HTMLButtonElement>("[data-demo-copy]");
  copy?.addEventListener("click", async () => {
    const text = snippet.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text.replace(/^\n/, "").replace(/\s+$/, ""));
      copy.textContent = "Copied";
    } catch {
      copy.textContent = "Copy";
      return;
    }
    window.setTimeout(() => {
      copy.textContent = "Copy";
    }, 1200);
  });
}
