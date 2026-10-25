import { chartType, drawChart } from "../lib/paint-chart";
import { applyTheme } from "../lib/spec-text";
import { paintField } from "./color-code";

interface IssueNode {
  code?: string;
  path?: string;
  message?: string;
}

function issuesOf(result: { errors?: IssueNode[] }): string[] {
  return (result.errors ?? []).map((error) => `${error.code ?? ""} ${error.path ?? ""} ${error.message ?? ""}`.trim());
}

const GEO = new Set(["choropleth", "map-points"]);

async function paintSvg(spec: unknown): Promise<string> {
  if (GEO.has(chartType(spec))) {
    const { render } = await import("@chartkitdev/geo");
    return render(spec);
  }
  return drawChart(spec);
}

function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function mountLiveSpec(root: HTMLElement): void {
  if (root.dataset.mounted === "1") return;
  root.dataset.mounted = "1";
  const mode = root.dataset.mode ?? "compact";
  const input = root.querySelector<HTMLTextAreaElement>("[data-spec-input]");
  const frame = root.querySelector<HTMLElement>("[data-preview]");
  const status = root.querySelector<HTMLElement>("[data-status]");
  const list = root.querySelector<HTMLElement>("[data-issues]");
  const themeSelect = root.querySelector<HTMLSelectElement>("[data-theme]");
  const exampleSelect = root.querySelector<HTMLSelectElement>("[data-example]");
  const play = root.querySelector<HTMLAnchorElement>("[data-play]");
  const docs = root.querySelector<HTMLAnchorElement>("[data-docs]");
  if (!input || !frame || !status) return;
  const preview = frame;
  const statusEl = status;
  const specInput = input;

  function syncDocs(source: string): void {
    if (!docs) return;
    let type = "";
    try {
      type = chartType(JSON.parse(source));
    } catch {
      type = "";
    }
    if (!type || GEO.has(type)) {
      docs.hidden = true;
      return;
    }
    docs.hidden = false;
    docs.href = `/docs/charts/${type}`;
    docs.textContent = `Docs → ${type}`;
  }

  function syncPaint(): void {
    paintField(specInput);
  }

  let theme = themeSelect?.value ?? "site";
  let timer = 0;
  let keepStatus = false;
  let paintGen = 0;

  function showIssues(items: string[]): void {
    if (!list) return;
    list.replaceChildren();
    for (const item of items) {
      const li = document.createElement("li");
      li.textContent = item;
      list.append(li);
    }
  }

  function draw(source: string, themeName: string): void {
    let parsed: unknown;
    try {
      parsed = JSON.parse(source);
    } catch (error) {
      statusEl.textContent = error instanceof Error ? error.message : "Invalid JSON";
      showIssues([]);
      return;
    }
    const themed = applyTheme(parsed, themeName);
    const generation = ++paintGen;
    void paintSvg(themed)
      .then((svg) => {
        if (generation !== paintGen) return;
        preview.innerHTML = svg;
        preview.classList.toggle("chart-preset", themeName !== "site" && themeName !== "");
        if (play) play.href = `/examples#${encodeURIComponent(source)}`;
        syncDocs(source);
        if (keepStatus) {
          keepStatus = false;
          return;
        }
        statusEl.textContent = themeName === "site" ? "Rendered." : `Rendered with the ${themeName} theme.`;
        showIssues([]);
      })
      .catch((error: unknown) => {
        if (generation !== paintGen) return;
        statusEl.textContent = error instanceof Error ? error.message : "Render failed";
      });
  }

  input.addEventListener("input", () => {
    syncPaint();
    window.clearTimeout(timer);
    timer = window.setTimeout(() => draw(input.value, theme), 160);
  });
  input.addEventListener("scroll", syncPaint);

  themeSelect?.addEventListener("change", () => {
    theme = themeSelect.value;
    draw(input.value, theme);
  });

  exampleSelect?.addEventListener("change", () => {
    const slug = exampleSelect.value;
    if (!slug) return;
    const sameExample = slug === root.dataset.activeSlug;
    if (sameExample && window.location.hash.length <= 1) return;
    window.location.assign(`/examples/${slug}`);
  });

  if (mode === "full" && window.location.hash.length > 1) {
    try {
      const parsed = JSON.parse(decodeURIComponent(window.location.hash.slice(1))) as unknown;
      input.value = JSON.stringify(parsed, null, 2);
      if (exampleSelect) {
        const custom = document.createElement("option");
        custom.value = "";
        custom.textContent = "Shared spec";
        exampleSelect.prepend(custom);
        exampleSelect.value = "";
      }
      syncPaint();
      draw(input.value, theme);
    } catch {
      statusEl.textContent = "The link hash is not JSON.";
    }
  }

  root.querySelector("[data-validate]")?.addEventListener("click", () => {
    void (async () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(input.value);
      } catch (error) {
        statusEl.textContent = error instanceof Error ? error.message : "Invalid JSON";
        return;
      }
      const result = GEO.has(chartType(parsed))
        ? (await import("@chartkitdev/geo")).validate(parsed)
        : (await import("@chartkitdev/core/validate")).validate(parsed);
      showIssues(issuesOf(result));
      statusEl.textContent = result.ok ? "Valid." : `${result.errors.length} diagnostic${result.errors.length === 1 ? "" : "s"}.`;
    })();
  });

  root.querySelector("[data-repair]")?.addEventListener("click", () => {
    void (async () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(input.value);
      } catch (error) {
        statusEl.textContent = error instanceof Error ? error.message : "Invalid JSON";
        return;
      }
      const { repair } = await import("@chartkitdev/core/validate");
      const result = repair(parsed);
      keepStatus = true;
      input.value = JSON.stringify(result.spec, null, 2);
      syncPaint();
      draw(input.value, theme);
      showIssues(issuesOf(result));
      const count = result.applied.length;
      statusEl.textContent = count
        ? `Applied ${count} patch${count === 1 ? "" : "es"}. ${result.ok ? "Valid." : "Diagnostics remain."}`
        : result.ok
          ? "Already valid. Nothing to repair."
          : "No safe patch applied.";
    })();
  });

  root.querySelector("[data-share]")?.addEventListener("click", () => {
    void (async () => {
      const hash = `#${encodeURIComponent(input.value)}`;
      const url = `${window.location.origin}${window.location.pathname}${hash}`;
      window.history.replaceState(null, "", hash);
      try {
        await navigator.clipboard.writeText(url);
        statusEl.textContent = "Link copied.";
      } catch {
        statusEl.textContent = "Link updated in the address bar.";
      }
    })();
  });

  root.querySelector("[data-svg]")?.addEventListener("click", () => {
    const svg = preview.querySelector("svg")?.outerHTML ?? "";
    download(new Blob([svg], { type: "image/svg+xml" }), "chartkit.svg");
  });

  root.querySelector("[data-png]")?.addEventListener("click", () => {
    const sized = (preview.querySelector("svg")?.outerHTML ?? "").replace('width="100%"', 'width="640"');
    const blob = new Blob([sized], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth * scale;
      canvas.height = image.naturalHeight * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#ffffff";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((png) => {
        if (png) download(png, "chartkit.png");
      });
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });

  syncPaint();
  syncDocs(input.value);
}
