import { isStackId, type StackId } from "../data/stacks";

const KEY = "ck-fw";

export function currentStack(): StackId {
  const fromDom = document.documentElement.dataset.stack;
  if (isStackId(fromDom)) return fromDom;
  try {
    const saved = localStorage.getItem(KEY);
    if (isStackId(saved)) return saved;
  } catch {
    /* ignore */
  }
  return "react";
}

export function rememberStack(stack: StackId, broadcast = true): void {
  document.documentElement.dataset.stack = stack;
  try {
    localStorage.setItem(KEY, stack);
  } catch {
    /* ignore */
  }
  document.querySelectorAll<HTMLButtonElement>("[data-stack-chip]").forEach((button) => {
    const on = button.dataset.stackChip === stack;
    button.setAttribute("aria-pressed", on ? "true" : "false");
    button.classList.toggle("is-on", on);
  });
  if (broadcast) window.dispatchEvent(new CustomEvent("ck-stack", { detail: stack }));
}

/** Swap a lone adapter install when the block names exactly one framework package. */
export function applyInstallBlocks(stack: StackId): void {
  if (location.pathname.startsWith("/docs/migrate")) return;
  document.querySelectorAll<HTMLElement>("figure.code pre code").forEach((code) => {
    if (code.closest("[data-stack-panel], .stack-sample")) return;
    const original = code.dataset.original ?? code.textContent ?? "";
    if (!code.dataset.original) code.dataset.original = original;
    if (!original.startsWith("npm ")) return;
    const hits = ["react", "vue", "svelte", "vanilla"].filter((id) => original.includes(`@chartkitdev/${id}`));
    if (hits.length !== 1) return;
    code.textContent = original.replaceAll(`@chartkitdev/${hits[0]}`, `@chartkitdev/${stack}`);
  });
}

export function mountStackChips(root: ParentNode = document): void {
  const chips = root.querySelectorAll<HTMLButtonElement>("[data-stack-chip]");
  chips.forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.stackChip;
      if (isStackId(id)) rememberStack(id);
    });
  });
  const stack = currentStack();
  rememberStack(stack, false);
  applyInstallBlocks(stack);
  window.addEventListener("ck-stack", ((event: CustomEvent<string>) => {
    if (!isStackId(event.detail)) return;
    rememberStack(event.detail, false);
    applyInstallBlocks(event.detail);
  }) as EventListener);
}
