import { paletteFromBrand } from "@chartkitdev/core/themes/brand";
import { render } from "@chartkitdev/core/all";

const root = document.querySelector<HTMLElement>("[data-brand]");
const input = root?.querySelector<HTMLInputElement>("input[type='color']");
const caption = root?.querySelector<HTMLElement>("[data-brand-caption]");
const swatches = root?.querySelector<HTMLElement>("[data-brand-swatches]");
const chart = root?.querySelector<HTMLElement>("[data-brand-chart]");
const status = root?.querySelector<HTMLElement>("[data-brand-status]");

function scheme(): "light" | "dark" {
  if (document.documentElement.classList.contains("dark")) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function draw(): void {
  if (!input || !caption || !swatches || !chart || !status) return;
  const hex = input.value;
  const mode = scheme();
  caption.textContent = "";
  const call = document.createElement("code");
  call.textContent = `paletteFromBrand("${hex}", "${mode}")`;
  caption.append(call, " from ");
  const from = document.createElement("code");
  from.textContent = "@chartkitdev/core/themes/brand";
  caption.append(
    from,
    ". The page scheme picks light or dark. Every colour clears 3:1 on white or on ",
  );
  const ink = document.createElement("code");
  ink.textContent = "#09090b";
  caption.append(ink, ", not on this card.");
  try {
    const series = paletteFromBrand(hex, mode);
    status.hidden = true;
    swatches.replaceChildren();
    for (const color of series) {
      const chip = document.createElement("i");
      chip.style.background = color;
      chip.title = color;
      swatches.append(chip);
    }
    const spec = {
      version: "1",
      type: "bar",
      data: series.slice(0, 4).map((color, index) => ({ lane: `S${index + 1}`, value: 8 + index * 3, swatch: color })),
      encoding: { x: "lane", y: "value", color: "lane" },
      theme: { tokens: { series } },
      legend: false,
      size: { width: 480, height: 180 },
      a11y: { alt: `Four bars painted from a palette derived from ${hex} for ${mode} mode.` },
    };
    chart.innerHTML = render(spec);
  } catch (caught) {
    status.hidden = false;
    status.textContent = caught instanceof Error ? caught.message : "That colour is not a hex value.";
    swatches.replaceChildren();
    chart.replaceChildren();
  }
}

if (input) {
  input.addEventListener("input", draw);
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", draw);
  draw();
}
