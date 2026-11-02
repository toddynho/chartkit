/** Click-and-keyboard menu for the sidebar framework picker. Hover does not open it. */
export function mountFrameworkMenu(root: ParentNode = document): void {
  const menuRoot = root.querySelector<HTMLElement>("[data-fw-menu]");
  if (!menuRoot || menuRoot.dataset.ready === "1") return;
  menuRoot.dataset.ready = "1";
  const button = menuRoot.querySelector<HTMLButtonElement>(".docs-fw__button");
  const menu = menuRoot.querySelector<HTMLElement>(".docs-fw__menu");
  if (!button || !menu) return;

  const items = () => [...menu.querySelectorAll<HTMLButtonElement>("[role='menuitemradio']")];

  const close = (returnFocus = false) => {
    if (menu.hidden) return;
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
    if (returnFocus) button.focus();
  };

  const open = (prefer: "selected" | "last" = "selected") => {
    menu.hidden = false;
    button.setAttribute("aria-expanded", "true");
    const list = items();
    const selected = list.findIndex((item) => item.getAttribute("aria-checked") === "true" || item.classList.contains("is-on"));
    const index = prefer === "last" ? list.length - 1 : selected >= 0 ? selected : 0;
    list[index]?.focus();
  };

  button.addEventListener("click", () => {
    if (menu.hidden) open("selected");
    else close();
  });

  button.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      open("selected");
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      open("last");
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (menu.hidden) open("selected");
      else close();
    } else if (event.key === "Escape") {
      close(true);
    }
  });

  menu.addEventListener("keydown", (event) => {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      list[(index + 1 + list.length) % list.length]?.focus();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      list[(index - 1 + list.length) % list.length]?.focus();
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      list[0]?.focus();
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      list[list.length - 1]?.focus();
      return;
    }
    if (event.key === "Tab") close(false);
  });

  menu.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[role='menuitemradio']")) close(true);
  });

  document.addEventListener("pointerdown", (event) => {
    const target = event.target;
    if (!(target instanceof Node) || !menuRoot.contains(target)) close(false);
  });
}
