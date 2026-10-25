import { drawChart } from "../lib/paint-chart";
import { forceTheme, pretty } from "../lib/spec-text";

const THEMES = ["soft", "refined", "editorial", "midnight"];

export function mountShowcase(root: HTMLElement): void {
  if (root.dataset.mounted === "1") return;
  root.dataset.mounted = "1";

  function paint(theme: string): void {
    root.querySelectorAll<HTMLElement>("[data-board-card]").forEach((card) => {
      for (const name of THEMES) card.classList.remove(`board-theme-${name}`);
      card.classList.add(`board-theme-${theme}`);
    });
    root.querySelectorAll<HTMLElement>("[data-chart-frame]").forEach((frame) => {
      const spec = forceTheme(JSON.parse(frame.dataset.spec || "{}"), theme);
      frame.innerHTML = drawChart(spec);
      const tools = frame.parentElement?.querySelector("[data-spec-text]");
      if (tools) tools.textContent = pretty(spec);
      const play = frame.parentElement?.querySelector<HTMLAnchorElement>("[data-play]");
      if (play) play.href = `/examples#${encodeURIComponent(JSON.stringify(spec))}`;
    });
  }

  root.querySelectorAll<HTMLButtonElement>("[data-theme-pick]").forEach((button) => {
    button.addEventListener("click", () => {
      const theme = button.dataset.themePick ?? "soft";
      root.querySelectorAll<HTMLButtonElement>("[data-theme-pick]").forEach((item) => {
        item.setAttribute("aria-checked", item === button ? "true" : "false");
      });
      paint(theme);
    });
  });

  root.querySelectorAll<HTMLElement>("[data-stack]").forEach((group) => {
    const buttons = group.querySelectorAll<HTMLButtonElement>("[data-stack-pick]");
    const panels = group.querySelectorAll<HTMLElement>("[data-stack-panel]");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.stackPick;
        buttons.forEach((item) => item.setAttribute("aria-selected", item === button ? "true" : "false"));
        panels.forEach((panel) => {
          panel.hidden = panel.dataset.stackPanel !== id;
        });
        const link = group.querySelector<HTMLAnchorElement>("[data-stack-link]");
        if (link && button.dataset.stackFeature) {
          link.href = `/features/${button.dataset.stackFeature}`;
          link.textContent = `${button.dataset.stackLabel ?? "This"} in the matrix`;
        }
        const copy = group.querySelector<HTMLButtonElement>("[data-stack-copy]");
        if (copy && button.dataset.stackLabel) copy.textContent = `Copy ${button.dataset.stackLabel}`;
      });
    });
    group.querySelector("[data-stack-copy]")?.addEventListener("click", () => {
      const selected = group.querySelector<HTMLButtonElement>('[aria-selected="true"]');
      const id = selected?.dataset.stackPick;
      const code = group.querySelector<HTMLElement>(`[data-stack-panel="${id}"] code`);
      if (code) void navigator.clipboard.writeText(code.textContent ?? "");
    });
  });

  root.querySelectorAll<HTMLButtonElement>("[data-copy-spec]").forEach((button) => {
    button.addEventListener("click", () => {
      const code = button.closest(".spec-tools")?.querySelector("[data-spec-text]");
      if (code) void navigator.clipboard.writeText(code.textContent ?? "");
    });
  });
}
