/**
 * Drag the docs response column. Width is a percentage until the reader
 * chooses one, then a pixel value in localStorage. Below 1100px the rail
 * stacks and this stays idle.
 */

const KEY = "ck-docs-rail-width";
const MIN = 260;
const MAX_CAP = 760;
const WIDE = "(min-width: 1101px)";

function readStored(): number | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw || !/^\d{2,4}$/.test(raw)) return null;
    const value = Number(raw);
    return value >= 220 && value <= 960 ? value : null;
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
  const splitter = document.getElementById("docs-rail-split");
  if (!rail || !splitter || splitter.dataset.ready === "1" || !rail.querySelector(".rail-stack")) return;
  splitter.dataset.ready = "1";

  const wide = window.matchMedia(WIDE);
  let preferred = readStored();

  const limits = () => {
    const frame = rail.parentElement?.getBoundingClientRect().width ?? window.innerWidth;
    const max = Math.max(MIN, Math.min(MAX_CAP, Math.round(frame - 248 - 56 - 320)));
    return { min: MIN, max };
  };

  const paintAria = (width: number) => {
    const { min, max } = limits();
    const shown = Math.round(width);
    splitter.setAttribute("aria-valuemin", String(min));
    splitter.setAttribute("aria-valuemax", String(max));
    splitter.setAttribute("aria-valuenow", String(shown));
    splitter.setAttribute("aria-valuetext", `${shown} pixels`);
  };

  const apply = (width: number) => {
    const { min, max } = limits();
    const next = Math.round(clamp(width, min, max));
    document.documentElement.style.setProperty("--docs-rail-width", `${next}px`);
    paintAria(next);
    return next;
  };

  const layout = () => {
    if (!wide.matches) return;
    if (preferred == null) {
      document.documentElement.style.removeProperty("--docs-rail-width");
      paintAria(rail.getBoundingClientRect().width);
      return;
    }
    apply(preferred);
  };

  layout();
  wide.addEventListener("change", layout);
  window.addEventListener("resize", layout);

  splitter.addEventListener("pointerdown", (event) => {
    if (!wide.matches || event.button !== 0) return;
    event.preventDefault();
    splitter.focus();
    const startX = event.clientX;
    const startW = rail.getBoundingClientRect().width;
    splitter.classList.add("is-dragging");
    document.documentElement.classList.add("is-rail-drag");
    splitter.setPointerCapture(event.pointerId);

    const move = (ev: PointerEvent) => {
      preferred = apply(startW - (ev.clientX - startX));
    };
    const end = (ev: PointerEvent) => {
      splitter.classList.remove("is-dragging");
      document.documentElement.classList.remove("is-rail-drag");
      splitter.removeEventListener("pointermove", move);
      splitter.removeEventListener("pointerup", end);
      splitter.removeEventListener("pointercancel", end);
      if (preferred != null) writeStored(preferred);
      if (splitter.hasPointerCapture(ev.pointerId)) splitter.releasePointerCapture(ev.pointerId);
    };
    splitter.addEventListener("pointermove", move);
    splitter.addEventListener("pointerup", end);
    splitter.addEventListener("pointercancel", end);
  });

  splitter.addEventListener("keydown", (event) => {
    if (!wide.matches) return;
    const { min, max } = limits();
    const current = rail.getBoundingClientRect().width;
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
