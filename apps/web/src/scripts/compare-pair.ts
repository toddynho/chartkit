import { convert } from "@chartkitdev/convert";

const COPY_MS = 1300;

export function mountComparePair(): void {
  const root = document.querySelector<HTMLElement>("[data-pair]");
  if (!root) return;
  const rows = [...root.querySelectorAll<HTMLElement>("[data-row]")];
  const tabs = [...root.querySelectorAll<HTMLButtonElement>("[data-bucket]")];
  const jumps = [...root.querySelectorAll<HTMLButtonElement>("[data-jump]")];
  const filter = root.querySelector<HTMLInputElement>("[data-filter]");
  const empty = root.querySelector<HTMLElement>("[data-empty]");
  const showing = root.querySelector<HTMLElement>("[data-showing]");
  const notes: Record<string, string> = {};
  tabs.forEach((tab) => {
    notes[tab.dataset.bucket ?? ""] = tab.textContent?.replace(/\s+\d+\s*$/, "").trim() ?? "";
  });
  let bucket = "win";

  const paint = () => {
    const query = filter?.value.trim().toLowerCase() ?? "";
    let shown = 0;
    let inBucket = 0;
    rows.forEach((row) => {
      const mine = row.dataset.bucket === bucket;
      const match = !query || (row.dataset.label ?? "").includes(query);
      if (mine) inBucket += 1;
      const visible = mine && match;
      row.hidden = !visible;
      if (visible) shown += 1;
    });
    if (empty) empty.hidden = shown !== 0;
    if (showing) showing.textContent = `Showing ${shown} of ${inBucket} · ${notes[bucket] ?? ""}`;
    tabs.forEach((tab) => tab.classList.toggle("is-on", tab.dataset.bucket === bucket));
    jumps.forEach((button) => button.classList.toggle("is-on", button.dataset.jump === bucket));
  };

  const select = (id: string) => {
    bucket = id;
    paint();
    document.getElementById("rows")?.scrollIntoView({ block: "start" });
  };
  tabs.forEach((tab) => tab.addEventListener("click", () => select(tab.dataset.bucket ?? "win")));
  jumps.forEach((button) =>
    button.addEventListener("click", () => {
      select(button.dataset.jump ?? "win");
    }),
  );
  filter?.addEventListener("input", () => paint());
  paint();

  const mini = root.querySelector<HTMLElement>("[data-mini]");
  const paste = mini?.querySelector<HTMLTextAreaElement>("[data-paste]");
  const spec = mini?.querySelector<HTMLElement>("[data-spec]");
  const list = mini?.querySelector<HTMLElement>("[data-warn-list]");
  const state = mini?.querySelector<HTMLElement>("[data-state]");
  const warns = mini?.querySelector<HTMLElement>("[data-warns]");
  const lines = mini?.querySelector<HTMLElement>("[data-lines]");
  const open = mini?.querySelector<HTMLAnchorElement>("[data-open]");
  const copy = mini?.querySelector<HTMLButtonElement>("[data-copy]");
  const sample = root.dataset.sample ?? "";
  const source = root.dataset.source ?? "";
  if (!mini || !paste || !spec || !list) return;

  let timer = 0;
  let latest = "";
  const draw = () => {
    const text = paste.value;
    if (lines) lines.textContent = `${text.split("\n").length} lines`;
    const result = source === "chartjs" || source === "recharts" || source === "echarts" ? convert(text, source) : convert(text);
    latest = result.spec ? JSON.stringify(result.spec, null, 2) : "";
    spec.textContent = latest || "No spec.";
    if (state) {
      state.textContent = result.spec ? "● valid" : "● no spec";
      state.style.color = result.spec ? "#1a7f4b" : "#9a5b00";
    }
    if (warns) warns.textContent = `${result.warnings.length} warning${result.warnings.length === 1 ? "" : "s"}`;
    list.replaceChildren();
    for (const warning of result.warnings) {
      const item = document.createElement("li");
      const code = document.createElement("code");
      code.textContent = warning.code;
      item.append(code, " ", warning.path ? `${warning.path} ` : "", warning.message);
      list.append(item);
    }
    if (open) open.href = `/convert?source=${encodeURIComponent(source)}#code=${encodeURIComponent(text)}`;
  };
  paste.addEventListener("input", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(draw, 200);
  });
  mini.querySelector("[data-load]")?.addEventListener("click", () => {
    paste.value = sample;
    draw();
  });
  copy?.addEventListener("click", () => {
    if (!latest) return;
    void navigator.clipboard.writeText(latest).then(() => {
      const idle = copy.textContent;
      copy.textContent = "Copied ✓";
      window.setTimeout(() => {
        copy.textContent = idle;
      }, COPY_MS);
    });
  });
  draw();
}
