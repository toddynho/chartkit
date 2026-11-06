import { paintSpec } from "../lib/chartkit";
import { withPreviewSize } from "../data/preview-size";
import {
  applyDonutAction,
  donutControlState,
  donutExamples,
  formatDonutNumber,
  playgroundHref,
  roundDonut,
  specText,
  type DonutAction,
} from "../data/donut-teach";

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

/** Wire the donut docs demo. The markup already shows the first example without this script. */
export function mountChartDemo(): void {
  const root = document.querySelector<HTMLElement>("[data-chart-demo]");
  if (!root || root.dataset.ready === "1") return;
  root.dataset.ready = "1";

  const chart = root.querySelector<HTMLElement>("[data-demo-chart]");
  const snippet = root.querySelector<HTMLElement>("[data-demo-snippet]");
  const play = root.querySelector<HTMLAnchorElement>("[data-demo-play]");
  const blurb = root.querySelector<HTMLElement>("[data-demo-blurb]");
  const error = root.querySelector<HTMLElement>("[data-demo-error]");
  const hole = root.querySelector<HTMLInputElement>('[data-range="innerRadius"]');
  const gap = root.querySelector<HTMLInputElement>('[data-range="padAngle"]');
  const holeOut = root.querySelector<HTMLElement>('[data-range-out="innerRadius"]');
  const gapOut = root.querySelector<HTMLElement>('[data-range-out="padAngle"]');
  const switcher = root.querySelector<HTMLElement>("[data-ex-switch]");
  const titleButton = root.querySelector<HTMLButtonElement>("[data-ex-title]");
  const nameEl = root.querySelector<HTMLElement>("[data-ex-name]");
  const countEl = root.querySelector<HTMLElement>("[data-ex-count]");
  const menu = root.querySelector<HTMLElement>("#ex-switch-list");
  const prev = root.querySelector<HTMLButtonElement>("[data-ex-prev]");
  const next = root.querySelector<HTMLButtonElement>("[data-ex-next]");
  const options = buttons(root, "[data-example-id]");
  const labelButtons = buttons(root, '[data-choice="labels"]');
  const legendButtons = buttons(root, '[data-choice="legend"]');
  const paletteButtons = buttons(root, '[data-choice="palette"]');
  const sortButtons = buttons(root, '[data-choice="sort"]');
  const startButtons = buttons(root, '[data-choice="startAngle"]');
  if (!chart || !snippet || !play || !hole || !gap) return;

  const byId = new Map(donutExamples.map((example) => [example.id, example]));
  let index = Math.max(0, donutExamples.findIndex((example) => example.id === root.dataset.example));
  let cursor = index;
  let menuOpen = false;
  let current = structuredClone(donutExamples[index]!.spec);

  function exampleFromUrl(): number {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("example");
    if (query && byId.has(query)) return donutExamples.findIndex((example) => example.id === query);
    const hash = window.location.hash.replace(/^#/, "");
    const hashed = hash.startsWith("example=") ? hash.slice("example=".length) : hash;
    if (hashed && byId.has(hashed)) return donutExamples.findIndex((example) => example.id === hashed);
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
    const currentId = donutExamples[index]?.id;
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
    const atEnd = index >= donutExamples.length - 1;
    if (prev) prev.setAttribute("aria-disabled", atStart ? "true" : "false");
    if (next) next.setAttribute("aria-disabled", atEnd ? "true" : "false");
    if (countEl) countEl.textContent = `${index + 1} / ${donutExamples.length}`;
    const example = donutExamples[index];
    if (nameEl && example) nameEl.textContent = example.title;
    if (blurb && example) blurb.textContent = example.blurb;
    if (example) root.dataset.example = example.id;
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
    if (nextIndex < 0 || nextIndex >= donutExamples.length) return;
    if (nextIndex === index) {
      closeMenu(focusTitle);
      return;
    }
    const example = donutExamples[nextIndex];
    if (!example) return;
    index = nextIndex;
    cursor = nextIndex;
    current = structuredClone(example.spec);
    setSteps();
    sync();
    draw(true);
    if (updateUrl) remember(example.id);
    closeMenu(focusTitle);
  }

  function draw(fade = false): void {
    const painted = paintSpec(withPreviewSize(current));
    const commit = () => {
      chart!.innerHTML = painted.svg;
      if (error) {
        error.hidden = painted.ok;
        error.textContent = painted.ok ? "" : painted.issues.map((issue) => `${issue.code}: ${issue.message}`).join(" ");
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
    const state = donutControlState(current);
    hole!.value = String(state.innerRadius);
    gap!.value = String(state.padAngle);
    if (holeOut) holeOut.textContent = formatDonutNumber(state.innerRadius);
    if (gapOut) gapOut.textContent = formatDonutNumber(state.padAngle);
    setPressed(labelButtons, state.labels);
    setPressed(legendButtons, state.legend);
    setPressed(paletteButtons, state.palette);
    setPressed(sortButtons, state.sort);
    setPressed(startButtons, String(state.startAngle));
  }

  function apply(action: DonutAction): void {
    applyDonutAction(current, action);
    sync();
    draw();
  }

  hole.addEventListener("input", () => {
    const value = roundDonut(Number(hole.value), 0.01);
    if (holeOut) holeOut.textContent = formatDonutNumber(value);
    applyDonutAction(current, { type: "innerRadius", value });
    draw();
  });
  gap.addEventListener("input", () => {
    const value = roundDonut(Number(gap.value), 0.5);
    if (gapOut) gapOut.textContent = formatDonutNumber(value);
    applyDonutAction(current, { type: "padAngle", value });
    draw();
  });

  for (const button of [...labelButtons, ...legendButtons, ...paletteButtons, ...sortButtons, ...startButtons]) {
    button.addEventListener("click", () => {
      const choice = button.dataset.choice;
      const value = button.dataset.value;
      if (!choice || value == null) return;
      if (choice === "labels" && (value === "off" || value === "inside" || value === "outside")) apply({ type: "labels", value });
      else if (choice === "legend" && (value === "off" || value === "bottom" || value === "right")) apply({ type: "legend", value });
      else if (choice === "palette" && (value === "theme" || value === "set")) apply({ type: "palette", value });
      else if (choice === "sort" && (value === "none" || value === "asc" || value === "desc")) apply({ type: "sort", value });
      else if (choice === "startAngle") apply({ type: "startAngle", value: Number(value) });
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
      const nextIndex = donutExamples.findIndex((example) => example.id === option.dataset.exampleId);
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
        cursor = event.key === "ArrowDown" ? Math.min(donutExamples.length - 1, cursor + 1) : Math.max(0, cursor - 1);
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
  else setSteps();

  const copy = root.querySelector<HTMLButtonElement>("[data-demo-copy]");
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
