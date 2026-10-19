import { saveBlob, toCSV, toPNG, toSVG } from "./export";

/**
 * Keyboard menu beside the SVG. Loaded only when `interaction.export` is set,
 * so tooltip-only interact does not pay for canvas code.
 */
export function armExport(svg: SVGElement, readSpec: () => { data?: unknown }, formats: string[]): () => void {
  const host = svg.parentElement;
  if (!host || formats.length === 0) return () => {};
  const wrap = document.createElement("div");
  wrap.className = "ck-export-menu";
  wrap.style.cssText = "position:relative;display:flex;justify-content:flex-end;font:12px/1.2 ui-sans-serif,system-ui,sans-serif";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "ck-export";
  button.textContent = "Export";
  button.setAttribute("aria-haspopup", "menu");
  button.setAttribute("aria-expanded", "false");
  button.style.cssText = "border:1px solid #c7c7cc;background:#fff;border-radius:6px;padding:4px 8px;cursor:pointer";
  const menu = document.createElement("div");
  menu.setAttribute("role", "menu");
  menu.hidden = true;
  menu.style.cssText = "position:absolute;top:100%;right:0;z-index:3;min-width:96px;margin-top:4px;padding:4px;background:#fff;border:1px solid #d2d2d7;border-radius:8px";
  const items: HTMLButtonElement[] = [];
  for (const format of formats) {
    const item = document.createElement("button");
    item.type = "button";
    item.setAttribute("role", "menuitem");
    item.dataset.format = format;
    item.textContent = format.toUpperCase();
    item.style.cssText = "display:block;width:100%;text-align:left;border:0;background:transparent;padding:6px 8px;cursor:pointer";
    items.push(item);
    menu.append(item);
  }
  wrap.append(button, menu);
  svg.insertAdjacentElement("beforebegin", wrap);

  let open = false;
  let index = 0;
  const setOpen = (next: boolean) => {
    open = next;
    menu.hidden = !next;
    button.setAttribute("aria-expanded", next ? "true" : "false");
  };
  const focusItem = (next: number) => {
    if (items.length === 0) return;
    index = (next + items.length) % items.length;
    items[index]?.focus();
  };
  const run = (format: string) => {
    const done = () => {
      setOpen(false);
      button.focus();
    };
    if (format === "csv") {
      saveBlob("chart.csv", new Blob([toCSV(readSpec())], { type: "text/csv;charset=utf-8" }));
      done();
      return;
    }
    if (format === "svg") {
      saveBlob("chart.svg", new Blob([toSVG(svg)], { type: "image/svg+xml;charset=utf-8" }));
      done();
      return;
    }
    void toPNG(svg, { scale: 2, background: "#ffffff" }).then((url) => {
      const link = document.createElement("a");
      link.href = url;
      link.download = "chart.png";
      link.click();
      done();
    });
  };

  const onButtonKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
      focusItem(0);
    }
  };
  const onMenuKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      button.focus();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(index + 1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem(index - 1);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const format = items[index]?.dataset.format;
      if (format) run(format);
    }
  };
  const onClick = (event: Event) => {
    const target = event.target as Element | null;
    if (target === button) {
      if (open) setOpen(false);
      else {
        setOpen(true);
        focusItem(0);
      }
      return;
    }
    const item = target?.closest?.("[role='menuitem']") as HTMLButtonElement | null;
    if (item && menu.contains(item) && item.dataset.format) run(item.dataset.format);
  };
  button.addEventListener("keydown", onButtonKey);
  menu.addEventListener("keydown", onMenuKey);
  wrap.addEventListener("click", onClick);
  return () => {
    button.removeEventListener("keydown", onButtonKey);
    menu.removeEventListener("keydown", onMenuKey);
    wrap.removeEventListener("click", onClick);
    wrap.remove();
  };
}
