function paintFrame(frame: HTMLElement, theme: string, width: string): void {
  const key = `${theme}:${width}`;
  if (frame.getAttribute("data-shown") === key && frame.childElementCount > 0) return;
  const host = frame.closest("[data-chart-host]");
  if (!host) return;
  const exact = host.querySelector(`template[data-svg="${theme}"][data-width="${width}"]`);
  const fallback = width === "narrow" ? host.querySelector(`template[data-svg="${theme}"][data-width="wide"]`) : null;
  const tpl = exact ?? fallback;
  if (!(tpl instanceof HTMLTemplateElement)) return;
  frame.replaceChildren(tpl.content.cloneNode(true));
  frame.setAttribute("data-shown", key);
}

function paintVisible(root: HTMLElement): void {
  const theme = root.getAttribute("data-theme") === "midnight" ? "midnight" : "soft";
  const width = window.matchMedia("(max-width: 900px)").matches ? "narrow" : "wide";
  root.querySelectorAll<HTMLElement>("[data-chart-host]").forEach((host) => {
    const frame = host.querySelector<HTMLElement>("[data-chart-frame]");
    if (!frame) return;
    if (host.closest("[hidden]")) {
      if (frame.childElementCount) frame.replaceChildren();
      frame.removeAttribute("data-shown");
      return;
    }
    paintFrame(frame, theme, width);
  });
}

function boot(root: HTMLElement): void {
  paintVisible(root);
  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const themeBtn = target.closest("[data-set-theme]");
    if (themeBtn instanceof HTMLElement && root.contains(themeBtn)) {
      const next = themeBtn.getAttribute("data-set-theme");
      if (next !== "soft" && next !== "midnight") return;
      root.setAttribute("data-theme", next);
      root.querySelectorAll("[data-set-theme]").forEach((button) => {
        button.setAttribute("aria-pressed", button === themeBtn ? "true" : "false");
      });
      paintVisible(root);
      return;
    }
    const pick = target.closest("[data-pick]");
    if (!(pick instanceof HTMLElement)) return;
    const group = pick.closest("[data-switch]");
    if (!(group instanceof HTMLElement) || !root.contains(group)) return;
    const id = pick.getAttribute("data-pick");
    group.querySelectorAll("[data-pick]").forEach((button) => {
      if (button.closest("[data-switch]") !== group) return;
      const on = button === pick;
      button.setAttribute("aria-pressed", on ? "true" : "false");
      if (button.getAttribute("role") === "tab") button.setAttribute("aria-selected", on ? "true" : "false");
    });
    group.querySelectorAll<HTMLElement>("[data-panel]").forEach((panel) => {
      if (panel.parentElement !== group) return;
      panel.toggleAttribute("hidden", panel.getAttribute("data-panel") !== id);
    });
    paintVisible(root);
  });
  window.matchMedia("(max-width: 900px)").addEventListener("change", () => paintVisible(root));
}

document.querySelectorAll("[data-board]").forEach((root) => {
  if (root instanceof HTMLElement) boot(root);
});
