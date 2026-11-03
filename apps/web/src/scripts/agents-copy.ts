const COPY_MS = 1400;

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.append(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function mountAgentsPage(): void {
  const source = document.querySelector("[data-agent-prompt]");
  const prompt = source?.textContent?.trim() ?? "";
  document.querySelectorAll<HTMLButtonElement>("[data-copy-prompt], [data-copy-kit]").forEach((button) => {
    const idle = button.dataset.idle || button.textContent || "Copy";
    const done = button.dataset.done || "Copied ✓";
    let timer = 0;
    button.addEventListener("click", () => {
      const text = button.hasAttribute("data-copy-kit") ? (button.dataset.copyKit ?? "") : prompt;
      if (!text) return;
      void writeClipboard(text).then((ok) => {
        if (!ok) return;
        button.textContent = done;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          button.textContent = idle;
        }, COPY_MS);
      });
    });
  });

  const toggle = document.querySelector<HTMLButtonElement>("[data-table-toggle]");
  const table = document.querySelector<HTMLElement>("[data-token-table]");
  if (!toggle || !table) return;
  toggle.addEventListener("click", () => {
    const open = table.hasAttribute("hidden");
    table.toggleAttribute("hidden", !open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.textContent = open ? "Hide the numbers" : "Show all numbers";
  });
}
