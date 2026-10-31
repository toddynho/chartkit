import "@chartkitdev/core/themes/brand";
import { colorsFromBitmap, colorsFromSvg, createTheme } from "@chartkitdev/core/themes/brand";
import { render } from "@chartkitdev/core/all";
import { repair } from "@chartkitdev/core/validate";
import "./mount-charts";

const root = document.querySelector<HTMLElement>("[data-brand-live]");
const hexInput = root?.querySelector<HTMLInputElement>("[data-brand-hex]");
const fileInput = root?.querySelector<HTMLInputElement>("[data-brand-file]");
const drop = root?.querySelector<HTMLElement>("[data-brand-drop]");
const status = root?.querySelector<HTMLElement>("[data-brand-status]");
const swatches = root?.querySelector<HTMLElement>("[data-brand-swatches]");
const checks = root?.querySelector<HTMLElement>("[data-brand-checks]");
const charts = root?.querySelector<HTMLElement>("[data-brand-charts]");
const specNode = document.querySelector<HTMLScriptElement>("#brand-specs");

type Spec = { a11y?: { alt?: string }; theme?: unknown };

function readSpecs(): Spec[] {
  if (!specNode?.textContent) return [];
  const parsed = JSON.parse(specNode.textContent) as unknown;
  return Array.isArray(parsed) ? (parsed as Spec[]) : [];
}

const specs = readSpecs();

function round1(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1);
}

function round3(n: number): string {
  return (Math.round(n * 1000) / 1000).toFixed(3);
}

function paint(brand: string | string[]): void {
  if (!charts || !status || !swatches || !checks) return;
  const probe = {
    version: "1",
    type: "bar",
    data: [{ library: "ChartKit", bytes: 1 }],
    encoding: { x: "library", y: "bytes" },
    theme: { brand },
    a11y: { alt: "Brand probe." },
  };
  const fixed = repair(probe);
  const theme = fixed.spec && typeof fixed.spec === "object" ? (fixed.spec as { theme?: { brand?: string | string[] } }).theme : undefined;
  const nextBrand = theme?.brand ?? brand;
  if (!fixed.ok) {
    status.hidden = false;
    status.textContent = fixed.errors[0]?.message ?? "That colour is not a hex value.";
    return;
  }
  let derived;
  try {
    derived = createTheme({ brand: nextBrand as string | string[] });
  } catch (caught) {
    status.hidden = false;
    status.textContent = caught instanceof Error ? caught.message : "That colour is not a hex value.";
    return;
  }
  status.hidden = false;
  const moved = derived.adjustments.map((item) => `${item.role}: ${item.from} → ${item.to}`);
  status.textContent = moved.length ? moved.join(" ") : "No colour moved.";
  swatches.replaceChildren();
  for (const color of derived.light.series) {
    const chip = document.createElement("i");
    chip.style.background = color;
    chip.title = color;
    swatches.append(chip);
  }
  const c = derived.checks;
  checks.textContent = `Light text ${round1(c.lightText)}:1, ticks ${round1(c.lightMuted)}:1, series min ${round1(c.lightSeriesMin)}:1. Dark text ${round1(c.darkText)}:1, ticks ${round1(c.darkMuted)}:1, series min ${round1(c.darkSeriesMin)}:1. Series deuteranopia Δ ${round3(c.deutan)}, protanopia Δ ${round3(c.protan)}. Up/down deuteranopia Δ ${round3(c.semanticDeutan)}, protanopia Δ ${round3(c.semanticProtan)}. Suggested texture: ${derived.textures.id}. Tiles are not painted.`;
  const hosts = charts.querySelectorAll<HTMLElement>("[data-ck-mount]");
  hosts.forEach((host, index) => {
    const source = specs[index];
    if (!source) return;
    const spec = { ...source, theme: { brand: nextBrand } };
    host.innerHTML = render(spec);
    host.dataset.ckMounted = "1";
  });
}

function fromText(text: string): void {
  const colors = colorsFromSvg(text);
  if (colors.length === 0 || !hexInput) {
    if (status) {
      status.hidden = false;
      status.textContent = "That drawing has no hex fills.";
    }
    return;
  }
  hexInput.value = colors[0] ?? hexInput.value;
  paint(colors);
}

async function fromFile(file: File): Promise<void> {
  if (file.type === "image/svg+xml" || file.name.endsWith(".svg")) {
    fromText(await file.text());
    return;
  }
  try {
    const colors = await colorsFromBitmap(file);
    if (colors.length === 0 || !hexInput) {
      if (status) {
        status.hidden = false;
        status.textContent = "No ink in that image after the white pixels were skipped.";
      }
      return;
    }
    hexInput.value = colors[0] ?? hexInput.value;
    paint(colors.length === 1 ? colors[0] : colors);
  } catch (caught) {
    if (status) {
      status.hidden = false;
      status.textContent = caught instanceof Error ? caught.message : "That image could not be sampled.";
    }
  }
}

if (hexInput) {
  hexInput.addEventListener("input", () => paint(hexInput.value));
  paint(hexInput.value);
}

fileInput?.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (file) void fromFile(file);
});

drop?.addEventListener("dragover", (event) => {
  event.preventDefault();
});

drop?.addEventListener("drop", (event) => {
  event.preventDefault();
  const file = event.dataTransfer?.files?.[0];
  if (file) void fromFile(file);
});
