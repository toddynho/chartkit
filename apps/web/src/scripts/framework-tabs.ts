import { isStackId } from "../data/stacks";
import { rememberStack } from "./stack-pref";

export function mountFrameworks(root: HTMLElement): void {
  if (root.dataset.mounted === "1") return;
  root.dataset.mounted = "1";
  const buttons = root.querySelectorAll<HTMLButtonElement>("[data-fw]");
  const panels = root.querySelectorAll<HTMLElement>("[data-fw-panel]");
  const label = root.querySelector<HTMLElement>("[data-fw-label]");

  function show(id: string, broadcast = true): void {
    buttons.forEach((button) => {
      const on = button.dataset.fw === id;
      button.setAttribute("aria-selected", on ? "true" : "false");
      button.classList.toggle("is-on", on);
    });
    panels.forEach((panel) => {
      panel.classList.toggle("is-on", panel.dataset.fwPanel === id);
      panel.hidden = false;
    });
    const current = root.querySelector<HTMLButtonElement>(`[data-fw="${id}"]`);
    if (label && current) label.textContent = current.textContent ?? id;
    root.classList.add("is-ready");
    if (isStackId(id)) rememberStack(id, broadcast);
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => show(button.dataset.fw ?? "react"));
  });
  root.querySelector("[data-fw-copy]")?.addEventListener("click", () => {
    const visible = root.querySelector<HTMLElement>("[data-fw-panel].is-on code");
    if (visible) void navigator.clipboard.writeText(visible.textContent ?? "");
  });

  let saved = document.documentElement.dataset.stack || "react";
  try {
    const stored = localStorage.getItem("chartkit.framework") || localStorage.getItem("ck-fw");
    const id = stored === "js" ? "vanilla" : stored;
    if (id && root.querySelector(`[data-fw="${id}"]`)) saved = id;
  } catch {
    /* ignore */
  }
  if (!root.querySelector(`[data-fw="${saved}"]`)) saved = "react";
  show(saved, false);
  window.addEventListener("ck-stack", ((event: CustomEvent<string>) => {
    const id = event.detail;
    if (id && root.querySelector(`[data-fw="${id}"]`)) show(id, false);
  }) as EventListener);
}
