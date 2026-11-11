import { chartPreview, paintSpec } from "../lib/chartkit";
import {
  CLOUD_TAB_KEY,
  type CloudFormat,
  type CloudTabId,
  altOf,
  cloudPresets,
  cloudSnippets,
  placeLines,
  renderUrl,
  tabId,
} from "../lib/cloud-page";

const COPY_MS = 1200;
const DEBOUNCE_MS = 150;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function specType(value: unknown): string {
  if (!isRecord(value) || typeof value.type !== "string") return "";
  return value.type;
}

function specTitle(value: unknown): string {
  if (!isRecord(value) || typeof value.title !== "string") return "";
  return value.title;
}

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

export function mountCloudPage(root: HTMLElement): void {
  if (root.dataset.mounted === "1") return;
  root.dataset.mounted = "1";

  const origin = root.dataset.origin || "https://cloud.chartkit.dev";
  const specInput = root.querySelector<HTMLTextAreaElement>("[data-spec]");
  const urlNode = root.querySelector<HTMLElement>("[data-url]");
  const codeNode = root.querySelector<HTMLElement>("[data-code]");
  const langNode = root.querySelector<HTMLElement>("[data-lang]");
  const noteNode = root.querySelector<HTMLElement>("[data-note]");
  const snippetButton = root.querySelector<HTMLButtonElement>("[data-copy='snippet']");
  const charts = [...root.querySelectorAll<HTMLElement>("[data-chart]")];
  const titles = [...root.querySelectorAll<HTMLElement>("[data-title]")];
  const statuses = [...root.querySelectorAll<HTMLElement>("[data-status]")];
  if (!specInput || !urlNode || !codeNode || !langNode || !noteNode || !snippetButton || charts.length === 0 || statuses.length === 0) return;
  const input = specInput;
  const urlEl = urlNode;
  const codeEl = codeNode;
  const langEl = langNode;
  const noteEl = noteNode;
  const snippetBtn = snippetButton;

  const presetButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-preset]")];
  const formatButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-format]")];
  const tabButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-tab]")];
  const urlButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-copy='url']")];
  const longLabel = urlButtons.find((button) => button.dataset.copyLabel === "long");
  const shortLabel = urlButtons.find((button) => button.dataset.copyLabel === "short");

  let format: CloudFormat = "svg";
  let tab: CloudTabId = "curl";
  let lastSpecJson = "";
  let lastAlt = "Chart";
  let liveUrl = urlEl.textContent?.trim() || "";
  let snippet = "";
  let timer = 0;
  let copied: "url" | "snippet" | "" = "";
  let copyTimer = 0;

  try {
    tab = tabId(localStorage.getItem(CLOUD_TAB_KEY));
  } catch {
    tab = "curl";
  }

  function paintStatus(ok: boolean): void {
    const kind = format === "png" ? "png" : "svg+xml";
    const text = ok ? `200 OK · image/${kind}` : "400 Bad Request";
    for (const status of statuses) {
      status.dataset.state = ok ? "ok" : "bad";
      status.textContent = text;
    }
  }

  function showCopied(which: "url" | "snippet"): void {
    copied = which;
    if (longLabel) longLabel.textContent = copied === "url" ? "Copied the URL ✓" : "Copy the image URL";
    if (shortLabel) shortLabel.textContent = copied === "url" ? "Copied ✓" : "Copy";
    snippetBtn.textContent = copied === "snippet" ? "copied ✓" : "copy";
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => {
      copied = "";
      if (longLabel) longLabel.textContent = "Copy the image URL";
      if (shortLabel) shortLabel.textContent = "Copy";
      snippetBtn.textContent = "copy";
    }, COPY_MS);
  }

  function applyFormat(): void {
    for (const button of formatButtons) {
      const on = button.dataset.format === format;
      button.classList.toggle("is-on", on);
      button.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  function applyPresets(type: string): void {
    for (const button of presetButtons) {
      const on = button.dataset.preset === type;
      button.classList.toggle("is-on", on);
      button.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  function applySnippets(): void {
    const snippets = cloudSnippets(origin, lastSpecJson, format, lastAlt);
    const current = snippets.find((item) => item.id === tab) ?? snippets[0];
    if (!current) return;
    snippet = current.code;
    codeEl.textContent = current.code;
    langEl.textContent = `request · ${current.lang}`;
    noteEl.textContent = current.note;
    const lines = placeLines(origin, lastSpecJson);
    for (const el of root.querySelectorAll<HTMLElement>("[data-place]")) {
      const id = el.dataset.place;
      if (id === "email" || id === "docs" || id === "agents" || id === "reports") el.textContent = lines[id];
    }
    for (const button of tabButtons) {
      const on = button.dataset.tab === current.id;
      button.classList.toggle("is-on", on);
      button.setAttribute("aria-selected", on ? "true" : "false");
    }
  }

  function publish(specJson: string, alt: string): void {
    lastSpecJson = specJson;
    lastAlt = alt;
    liveUrl = renderUrl(origin, specJson, format);
    urlEl.textContent = liveUrl;
    applySnippets();
  }

  function fail(message: string): void {
    for (const chart of charts) {
      chart.classList.add("is-error");
      chart.textContent = message;
    }
    for (const title of titles) title.hidden = true;
    paintStatus(false);
    applyPresets("");
  }

  function renderNow(): void {
    const text = input.value;
    let parsed: unknown;
    try {
      parsed = JSON.parse(text) as unknown;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON";
      fail(`400 · ${message}`);
      return;
    }
    const result = paintSpec(parsed);
    if (!result.ok || !result.svg.includes("<svg")) {
      const issue = result.issues[0];
      const detail = issue ? `${issue.code} · ${issue.message}` : "Spec is not drawable";
      fail(`400 · ${detail}`);
      return;
    }
    const preview = paintSpec(chartPreview(parsed));
    const svg = preview.ok && preview.svg.includes("<svg") ? preview.svg : result.svg;
    const heading = specTitle(parsed);
    for (const chart of charts) {
      chart.classList.remove("is-error");
      chart.innerHTML = svg;
    }
    for (const title of titles) {
      title.hidden = heading.length === 0;
      title.textContent = heading;
    }
    publish(JSON.stringify(parsed), altOf(parsed));
    applyPresets(specType(parsed));
    paintStatus(true);
  }

  function schedule(): void {
    window.clearTimeout(timer);
    timer = window.setTimeout(renderNow, DEBOUNCE_MS);
  }

  input.addEventListener("input", schedule);

  for (const button of presetButtons) {
    button.addEventListener("click", () => {
      const name = button.dataset.preset;
      if (name !== "bar" && name !== "line" && name !== "donut") return;
      input.value = JSON.stringify(cloudPresets[name], null, 2);
      window.clearTimeout(timer);
      renderNow();
    });
  }

  for (const button of formatButtons) {
    button.addEventListener("click", () => {
      const next = button.dataset.format;
      if (next !== "svg" && next !== "png") return;
      format = next;
      applyFormat();
      if (lastSpecJson) publish(lastSpecJson, lastAlt);
      paintStatus(charts.some((chart) => chart.classList.contains("is-error")) ? false : true);
    });
  }

  for (const button of tabButtons) {
    button.addEventListener("click", () => {
      tab = tabId(button.dataset.tab ?? null);
      try {
        localStorage.setItem(CLOUD_TAB_KEY, tab);
      } catch {
        /* private mode */
      }
      if (lastSpecJson) applySnippets();
    });
  }

  for (const button of urlButtons) {
    button.addEventListener("click", () => {
      if (!liveUrl) return;
      void writeClipboard(liveUrl).then((ok) => {
        if (ok) showCopied("url");
      });
    });
  }

  snippetBtn.addEventListener("click", () => {
    if (!snippet) return;
    void writeClipboard(snippet).then((ok) => {
      if (ok) showCopied("snippet");
    });
  });

  const waitlist = root.querySelector<HTMLFormElement>("[data-waitlist]");
  waitlist?.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = new FormData(waitlist).get("email");
    const address = typeof email === "string" ? email.trim() : "";
    const subject = "ChartKit Cloud Pro waitlist";
    const body = address
      ? `Please add ${address} to the ChartKit Cloud Pro waitlist.`
      : "Please add me to the ChartKit Cloud Pro waitlist.";
    // TODO: no waitlist endpoint or inbox exists in the repo. This only opens the visitor's mail client.
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  applyFormat();
  renderNow();
}
