/** Shared example-chip behavior for chart docs and /playground. */

export function bindExamplePicker(root: HTMLElement, onSelect: (slug: string) => void): void {
  root.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-example]");
    if (!button?.dataset.example || !root.contains(button)) return;
    selectExample(root, button.dataset.example);
    onSelect(button.dataset.example);
  });
}

export function selectExample(root: HTMLElement | null, slug: string): void {
  if (!root) return;
  for (const button of root.querySelectorAll<HTMLButtonElement>("button[data-example]")) {
    const on = button.dataset.example === slug;
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-selected", on ? "true" : "false");
  }
  for (const caption of root.querySelectorAll<HTMLElement>("[data-caption]")) {
    const on = caption.dataset.caption === slug;
    caption.hidden = !on;
  }
}
