import { mountStackChips } from "./stack-pref";

function flash(button: HTMLButtonElement, next: string): void {
  const previous = button.textContent ?? "Copy";
  button.textContent = next;
  window.setTimeout(() => {
    button.textContent = previous;
  }, 1600);
}

async function writeClipboard(button: HTMLButtonElement, text: string): Promise<void> {
  if (!text) {
    flash(button, "Copy failed");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    flash(button, "Copied");
  } catch {
    flash(button, "Copy failed");
  }
}

function visibleInstall(root: ParentNode): string {
  const panels = root.querySelectorAll<HTMLElement>("[data-stack-panel]");
  const visible = [...panels].find((panel) => getComputedStyle(panel).display !== "none");
  return visible?.querySelector("code")?.textContent?.trim() ?? "";
}

export function mountHomeStart(root: ParentNode = document): void {
  mountStackChips(root);
  root.querySelectorAll<HTMLButtonElement>("[data-copy-install]").forEach((button) => {
    button.addEventListener("click", () => {
      void writeClipboard(button, visibleInstall(root));
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
