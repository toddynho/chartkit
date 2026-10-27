/**
 * Drag the try-it card from the pill on its left edge.
 * panelW is the card width, stored in --try (default 380, clamp 280 … viewport−560).
 * Chart height is --chart-h = round(panelW * 0.6). Below 1100px the rail stacks and this stays idle.
 */

const KEY = "ck-docs-rail-width";
const MIN = 280;
/** Leave the sidebar and the article room. panelW max is the viewport minus this. */
const VIEWPORT_GUTTER = 560;
const WIDE = "(min-width: 1101px)";

function readStored(): number | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw || !/^\d{2,4}$/.test(raw)) return null;
    const value = Number(raw);
    return value >= 220 && value <= 9999 ? value : null;
  } catch {
    return null;
  }
}

function writeStored(value: number): void {
  try {
    localStorage.setItem(KEY, String(Math.round(value)));
  } catch {
    /* private mode */
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function mountDocsSplit(): void {
  const rail = document.getElementById("docs-rail");
  const card = rail?.querySelector<HTMLElement>(".docs-try") ?? null;
  const handle = document.getElementById("docs-handle");
  if (!rail || !card || !handle || handle.dataset.ready === "1" || !rail.querySelector(".rail-stack")) return;
  handle.dataset.ready = "1";

  const wide = window.matchMedia(WIDE);
  let preferred = readStored();

  const limits = () => {
    const max = Math.max(MIN, Math.round(window.innerWidth - VIEWPORT_GUTTER));
    return { min: MIN, max };
  };

  const paintAria = (panelW: number) => {
    const { min, max } = limits();
    const shown = Math.round(panelW);
    handle.setAttribute("aria-valuemin", String(min));
    handle.setAttribute("aria-valuemax", String(max));
    handle.setAttribute("aria-valuenow", String(shown));
    handle.setAttribute("aria-valuetext", `${shown} pixels`);
  };

  const apply = (panelW: number) => {
    const { min, max } = limits();
    const next = Math.round(clamp(panelW, min, max));
    const root = document.documentElement;
    root.style.setProperty("--try", `${next}px`);
    root.style.setProperty("--chart-h", `${Math.round(next * 0.6)}px`);
    paintAria(next);
    return next;
  };

  const layout = () => {
    if (!wide.matches) return;
    if (preferred == null) {
      const root = document.documentElement;
      root.style.removeProperty("--try");
      root.style.removeProperty("--chart-h");
      paintAria(card.getBoundingClientRect().width);
      return;
    }
    apply(preferred);
  };

  layout();
  wide.addEventListener("change", layout);
  window.addEventListener("resize", layout);

  handle.addEventListener("pointerdown", (event) => {
    if (!wide.matches || event.button !== 0) return;
    event.preventDefault();
    handle.focus();
    const startX = event.clientX;
    const startW = card.getBoundingClientRect().width;
    handle.classList.add("is-dragging");
    document.documentElement.classList.add("is-rail-drag");
    handle.setPointerCapture(event.pointerId);

    const move = (ev: PointerEvent) => {
      preferred = apply(startW - (ev.clientX - startX));
    };
    const end = (ev: PointerEvent) => {
      handle.classList.remove("is-dragging");
      document.documentElement.classList.remove("is-rail-drag");
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", end);
      handle.removeEventListener("pointercancel", end);
      if (preferred != null) writeStored(preferred);
      if (handle.hasPointerCapture(ev.pointerId)) handle.releasePointerCapture(ev.pointerId);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  });

  handle.addEventListener("keydown", (event) => {
    if (!wide.matches) return;
    const { min, max } = limits();
    const current = card.getBoundingClientRect().width;
    const step = event.shiftKey ? 48 : 16;
    let next: number | null = null;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = current + step;
    else if (event.key === "ArrowRight" || event.key === "ArrowDown") next = current - step;
    else if (event.key === "Home") next = min;
    else if (event.key === "End") next = max;
    else return;
    event.preventDefault();
    preferred = apply(next);
    writeStored(preferred);
  });
}
