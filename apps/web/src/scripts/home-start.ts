import { mountStackChips } from "./stack-pref";

function restore(button: HTMLButtonElement, previous: string): void {
  window.setTimeout(() => {
    button.textContent = previous;
  }, 2000);
}

/** Clipboard API, then the older command, so Copy still works when the async API is blocked. */
function copyWithCommand(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "0";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.focus();
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

function statusFor(button: HTMLButtonElement): HTMLElement | null {
  return button.parentElement?.querySelector<HTMLElement>("[data-copy-status]") ?? null;
}

async function writeClipboard(button: HTMLButtonElement, text: string): Promise<void> {
  const previous = button.dataset.label ?? button.textContent ?? "Copy";
  button.dataset.label = previous;
  const status = statusFor(button);
  if (!text) {
    button.textContent = "Copy failed";
    if (status) status.textContent = "Nothing to copy.";
    restore(button, previous);
    return;
  }
  button.textContent = "Copying";
  if (status) status.textContent = "";
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch {
    ok = copyWithCommand(text);
  }
  button.textContent = ok ? "Copied" : "Copy failed";
  if (status) status.textContent = ok ? "Copied." : "Copy failed.";
  restore(button, previous);
}

function visibleInstall(root: ParentNode): string {
  const panels = root.querySelectorAll<HTMLElement>("[data-stack-panel]");
  const visible = [...panels].find((panel) => getComputedStyle(panel).display !== "none");
  return visible?.querySelector("code")?.textContent?.trim() ?? "";
}

export function mountHomeStart(root: ParentNode = document): void {
  const marker = document.documentElement;
  if (marker.dataset.homeStart === "1") return;
  marker.dataset.homeStart = "1";
  mountStackChips(root);
  root.querySelectorAll<HTMLButtonElement>("[data-copy-install]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".home-start__card") ?? root;
      void writeClipboard(button, visibleInstall(card));
    });
  });
  root.querySelectorAll<HTMLButtonElement>("[data-copy-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      const prompt = root.querySelector<HTMLElement>("[data-agent-prompt]")?.textContent?.trim() ?? "";
      void writeClipboard(button, prompt);
    });
  });
}

mountHomeStart();
