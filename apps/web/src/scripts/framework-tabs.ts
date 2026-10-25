export function mountFrameworks(root: HTMLElement): void {
  if (root.dataset.mounted === "1") return;
  root.dataset.mounted = "1";
  const buttons = root.querySelectorAll<HTMLButtonElement>("[data-fw]");
  const panels = root.querySelectorAll<HTMLElement>("[data-fw-panel]");
  const label = root.querySelector<HTMLElement>("[data-fw-label]");

  function show(id: string): void {
    buttons.forEach((button) => {
      const on = button.dataset.fw === id;
      button.setAttribute("aria-selected", on ? "true" : "false");
      button.classList.toggle("is-on", on);
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.fwPanel !== id;
    });
    const current = root.querySelector<HTMLButtonElement>(`[data-fw="${id}"]`);
    if (label && current) label.textContent = current.textContent ?? id;
    try {
      localStorage.setItem("ck-fw", id);
    } catch {
      /* ignore */
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => show(button.dataset.fw ?? "react"));
  });
  root.querySelector("[data-fw-copy]")?.addEventListener("click", () => {
    const visible = root.querySelector<HTMLElement>("[data-fw-panel]:not([hidden]) code");
    if (visible) void navigator.clipboard.writeText(visible.textContent ?? "");
  });

  let saved = "react";
  try {
    const stored = localStorage.getItem("ck-fw");
    if (stored && root.querySelector(`[data-fw="${stored}"]`)) saved = stored;
  } catch {
    /* ignore */
  }
  show(saved);
}
