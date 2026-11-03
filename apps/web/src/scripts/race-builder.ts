import {
  createLineRace,
  createOddsReplay,
  electionOddsCsv,
  electionOddsReplay,
  exportLineRace,
  lineRaceFromCsv,
  lineRaceFromJson,
  matchOddsCsv,
  matchOddsReplay,
  mountLineRace,
  oddsFromCsv,
  podcastMentionsCsv,
  podcastMentionsRace,
  type FrameSequence,
  type LineRaceOptions,
  type LineRaceSeries,
  type OddsReplayOptions,
  type OddsSeries,
  type RacePlayer,
} from "@chartkitdev/core/race";

const root = document.querySelector<HTMLElement>("[data-race-root]");
if (root) {
  const stage = root.querySelector<HTMLElement>("[data-race-stage]");
  const play = root.querySelector<HTMLButtonElement>("[data-race-play]");
  const scrub = root.querySelector<HTMLInputElement>("[data-race-scrub]");
  const time = root.querySelector<HTMLElement>("[data-race-time]");
  const loop = root.querySelector<HTMLInputElement>("[data-race-loop]");
  const exportButton = root.querySelector<HTMLButtonElement>("[data-race-export]");
  const status = root.querySelector<HTMLElement>("[data-race-status]");
  const title = root.querySelector<HTMLInputElement>("[data-race-title]");
  const subtitle = root.querySelector<HTMLTextAreaElement>("[data-race-subtitle]");
  const unit = root.querySelector<HTMLInputElement>("[data-race-unit]");
  const duration = root.querySelector<HTMLInputElement>("[data-race-duration]");
  const data = root.querySelector<HTMLTextAreaElement>("[data-race-data]");
  const file = root.querySelector<HTMLInputElement>("[data-race-file]");
  const reset = root.querySelector<HTMLButtonElement>("[data-race-reset]");
  const error = root.querySelector<HTMLElement>("[data-race-error]");
  const swatches = root.querySelector<HTMLElement>("[data-race-colors]");
  const pageTitle = root.querySelector<HTMLElement>("[data-page-title]");
  const pageLede = root.querySelector<HTMLElement>("[data-page-lede]");
  const hint = root.querySelector<HTMLElement>("[data-race-hint]");
  const unitWrap = root.querySelector<HTMLElement>("[data-race-unit-wrap]");
  const oddsTools = root.querySelector<HTMLElement>("[data-odds-tools]");
  const themeSelect = root.querySelector<HTMLSelectElement>("[data-odds-theme]");
  const legendBox = root.querySelector<HTMLInputElement>("[data-odds-legend]");
  let start = Number(root.dataset.start ?? "0");
  let kind = root.dataset.kind === "odds" ? "odds" : "race";
  let oddsSample = root.dataset.oddsSample === "election" ? "election" : "match";

  if (stage && play && scrub && time && loop && exportButton && status && title && subtitle && unit && duration && data && file && reset && error && swatches && pageTitle && pageLede && hint && unitWrap && oddsTools && themeSelect && legendBox) {
    const colors = new Map<string, string>();
    let swatchKey = "";
    let chart: FrameSequence | null = null;
    let player: RacePlayer | null = null;
    let scrubbing = false;
    let timer = 0;
    let abort: AbortController | null = null;
    let fontCss: Promise<string> | null = null;
    const live: { loop: boolean; from?: number; onFrame?: (t: number, playing: boolean) => void } = { loop: loop.checked };

    const clock = (ms: number) => {
      const seconds = Math.max(0, Math.round(ms / 1000));
      return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
    };

    const hex = (value: string) => {
      const text = value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(text)) return text;
      if (/^#[0-9a-fA-F]{3}$/.test(text)) {
        return `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`;
      }
      return "#333333";
    };

    const paintSwatches = (series: Array<LineRaceSeries | OddsSeries>) => {
      const key = series.map((item) => item.name).join("|");
      if (key === swatchKey) return;
      swatchKey = key;
      swatches.replaceChildren();
      for (const seriesItem of series) {
        const color = hex(colors.get(seriesItem.name) ?? seriesItem.color ?? "#333333");
        colors.set(seriesItem.name, color);
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "color";
        input.value = color;
        input.setAttribute("aria-label", `${seriesItem.name} color`);
        input.addEventListener("input", () => {
          colors.set(seriesItem.name, input.value);
          schedule();
        });
        label.append(input, document.createTextNode(seriesItem.name));
        swatches.append(label);
      }
    };

    const copyFor = (next: "race" | "odds") => {
      pageTitle.textContent = next === "odds" ? "Odds replay" : "Line chart race";
      pageLede.textContent =
        next === "odds"
          ? "Step lines hold each price until the next trade. Replay runs the history from the first print to the last, on a percent axis fitted to the series. The sample numbers are illustrative."
          : "Paste monthly numbers, play the lines forward, and export a video from this tab. The preview and the file are the same frames: each one is frame(t) for a t between 0 and 1.";
      hint.textContent =
        next === "odds"
          ? "The first column is the time (YYYY-MM-DD or an ISO time). Other columns are outcome prices, as percent points or as fractions of 1. Samples are illustrative, not a market. Light and dark are themes, not a venue’s brand."
          : "The first column is the date (YYYY-MM or YYYY-MM-DD). Each other column is a line. The sample is shaped like a lab-mentions promo. The numbers are illustrative, not a measurement. Tip icons are monograms. A series icon can be a base64 data:image URL.";
      unitWrap.hidden = next === "odds";
      oddsTools.hidden = next !== "odds";
      for (const block of root.querySelectorAll<HTMLElement>("[data-code]")) block.hidden = block.dataset.code !== next;
      for (const button of root.querySelectorAll<HTMLButtonElement>("[data-kind]")) {
        const on = button.dataset.kind === next;
        button.setAttribute("aria-pressed", on ? "true" : "false");
        button.className = on ? "btn btn-primary" : "btn btn-secondary";
      }
    };

    const readOptions = (): LineRaceOptions => {
      const text = data.value.trim();
      const seconds = Number(duration.value);
      const override: Partial<LineRaceOptions> = {
        title: title.value.trim() || "Line chart race",
        subtitle: subtitle.value.trim(),
        unit: unit.value.trim(),
        duration: Number.isFinite(seconds) ? Math.round(seconds * 1000) : 9000,
        series: [...colors.entries()].map(([name, color]) => ({ name, color })),
      };
      const options = text.startsWith("{") || text.startsWith("[") ? lineRaceFromJson(text, override) : lineRaceFromCsv(text, override);
      return {
        ...options,
        series: (options.series ?? []).map((series) => ({
          ...series,
          color: colors.get(series.name) ?? series.color,
        })),
      };
    };

    const readOdds = (): OddsReplayOptions => {
      const text = data.value.trim();
      const seconds = Number(duration.value);
      const theme = themeSelect.value === "dark" ? "dark" : "light";
      const durationMs = Number.isFinite(seconds) ? Math.round(seconds * 1000) : 8000;
      const painted = (series: OddsSeries[] | undefined) =>
        (series ?? []).map((item) => ({ ...item, color: colors.get(item.name) ?? item.color }));
      if (text.startsWith("{") || text.startsWith("[")) {
        const parsed = JSON.parse(text) as OddsReplayOptions | Array<Record<string, string | number | null>>;
        const rows = Array.isArray(parsed) ? parsed : parsed.data;
        if (!Array.isArray(rows) || rows.length < 2) throw new Error("JSON needs at least two rows.");
        const x = (!Array.isArray(parsed) && parsed.x) || Object.keys(rows[0] ?? {})[0];
        if (!x) throw new Error("The rows need a time field.");
        const named = Array.isArray(parsed) ? undefined : parsed.series;
        const fields = named?.map((item) => item.field ?? item.name) ?? Object.keys(rows[0] ?? {}).filter((field) => field !== x);
        return {
          title: title.value.trim() || (!Array.isArray(parsed) && parsed.title) || "Odds replay",
          subtitle: subtitle.value.trim(),
          theme,
          legend: legendBox.checked,
          duration: durationMs,
          x,
          data: rows,
          series: painted(
            fields.map((field) => {
              const match = named?.find((item) => (item.field ?? item.name) === field);
              return { name: match?.name || field, field, color: match?.color };
            }),
          ),
        };
      }
      const options = oddsFromCsv(text, {
        title: title.value.trim() || "Odds replay",
        subtitle: subtitle.value.trim(),
        theme,
        legend: legendBox.checked,
        duration: durationMs,
        series: [...colors.entries()].map(([name, color]) => ({ name, color })),
      });
      return { ...options, series: painted(options.series) };
    };

    const mount = (next: FrameSequence) => {
      const wasPlaying = player?.playing ?? false;
      const at = player?.t ?? start;
      player?.destroy();
      chart = next;
      live.loop = loop.checked;
      live.from = at;
      live.onFrame = (t, playing) => {
        if (!scrubbing) scrub.value = String(Math.round(t * 1000));
        play.textContent = playing ? "Pause" : t >= 0.999 ? "Replay" : "Play";
        time.textContent = `${clock(t * (chart?.duration ?? 0))} / ${clock(chart?.duration ?? 0)}`;
      };
      player = mountLineRace(stage, chart, live);
      if (wasPlaying) player.play();
    };

    const apply = () => {
      try {
        if (kind === "odds") {
          const options = readOdds();
          error.hidden = true;
          error.textContent = "";
          paintSwatches(options.series ?? []);
          mount(createOddsReplay({ ...options, width: 1280, height: 720 }));
          return;
        }
        const options = readOptions();
        error.hidden = true;
        error.textContent = "";
        paintSwatches(options.series ?? []);
        mount(createLineRace({ ...options, width: 1280, height: 720 }));
      } catch (err) {
        error.hidden = false;
        error.textContent = err instanceof Error ? err.message : "Could not read that table.";
      }
    };

    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(apply, 160);
    };

    const bytesToBase64 = (bytes: Uint8Array) => {
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
      }
      return btoa(binary);
    };

    const loadFonts = () => {
      if (!fontCss) {
        fontCss = (async () => {
          const faces = [
            ["400", root.dataset.font400],
            ["700", root.dataset.font700],
          ] as const;
          const css: string[] = [];
          for (const [weight, url] of faces) {
            if (!url) continue;
            const response = await fetch(url);
            if (!response.ok) continue;
            const encoded = bytesToBase64(new Uint8Array(await response.arrayBuffer()));
            css.push(
              `@font-face{font-family:Geist;font-style:normal;font-weight:${weight};src:url(data:font/woff2;base64,${encoded}) format("woff2");}`,
            );
          }
          return css.join("");
        })();
      }
      return fontCss;
    };

    play.addEventListener("click", () => {
      if (!player) return;
      if (player.playing) player.pause();
      else player.play();
    });
    scrub.addEventListener("pointerdown", () => {
      scrubbing = true;
      player?.pause();
    });
    scrub.addEventListener("input", () => {
      player?.seek(Number(scrub.value) / 1000);
    });
    const endScrub = () => {
      scrubbing = false;
    };
    scrub.addEventListener("pointerup", endScrub);
    scrub.addEventListener("pointercancel", endScrub);
    loop.addEventListener("change", () => {
      live.loop = loop.checked;
    });
    for (const input of [title, subtitle, unit, duration, data]) {
      input.addEventListener("input", schedule);
    }
    file.addEventListener("change", async () => {
      const picked = file.files?.[0];
      if (!picked) return;
      data.value = await picked.text();
      swatchKey = "";
      colors.clear();
      apply();
      file.value = "";
    });
    const loadOddsSample = (id: "match" | "election") => {
      const sample = id === "election" ? electionOddsReplay() : matchOddsReplay();
      oddsSample = id;
      title.value = sample.title;
      subtitle.value = sample.subtitle ?? "";
      duration.value = "8";
      data.value = id === "election" ? electionOddsCsv() : matchOddsCsv();
      themeSelect.value = sample.theme === "dark" ? "dark" : "light";
      legendBox.checked = sample.legend === true;
      swatchKey = "";
      colors.clear();
    };

    const setKind = (next: "race" | "odds") => {
      kind = next;
      player?.destroy();
      player = null;
      start = next === "odds" ? 1 : 0.62;
      scrub.value = String(Math.round(start * 1000));
      copyFor(next);
      if (next === "odds") loadOddsSample(oddsSample);
      else {
        const sample = podcastMentionsRace();
        title.value = sample.title;
        subtitle.value = sample.subtitle ?? "";
        unit.value = sample.unit ?? "";
        duration.value = "9";
        data.value = podcastMentionsCsv();
        swatchKey = "";
        colors.clear();
      }
      const url = new URL(location.href);
      if (next === "odds") url.searchParams.set("type", "odds");
      else url.searchParams.delete("type");
      history.replaceState(null, "", url);
      apply();
    };

    for (const button of root.querySelectorAll<HTMLButtonElement>("button[data-kind]")) {
      button.addEventListener("click", () => {
        const next = button.dataset.kind === "odds" ? "odds" : "race";
        if (next !== kind) setKind(next);
      });
    }
    for (const button of root.querySelectorAll<HTMLButtonElement>("[data-odds-sample]")) {
      button.addEventListener("click", () => {
        const id = button.dataset.oddsSample === "election" ? "election" : "match";
        loadOddsSample(id);
        const url = new URL(location.href);
        url.searchParams.set("type", "odds");
        url.searchParams.set("sample", id);
        history.replaceState(null, "", url);
        apply();
      });
    }
    themeSelect.addEventListener("change", () => {
      colors.clear();
      swatchKey = "";
      schedule();
    });
    legendBox.addEventListener("change", schedule);

    reset.addEventListener("click", () => {
      if (kind === "odds") loadOddsSample(oddsSample);
      else {
        const sample = podcastMentionsRace();
        title.value = sample.title;
        subtitle.value = sample.subtitle ?? "";
        unit.value = sample.unit ?? "";
        duration.value = "9";
        data.value = podcastMentionsCsv();
        swatchKey = "";
        colors.clear();
      }
      apply();
    });
    exportButton.addEventListener("click", async () => {
      if (!chart) return;
      if (abort) {
        abort.abort();
        return;
      }
      const current = chart;
      player?.pause();
      abort = new AbortController();
      exportButton.textContent = "Cancel";
      status.textContent = "Encoding…";
      try {
        const result = await exportLineRace(current, {
          fps: 30,
          fontCss: await loadFonts(),
          signal: abort.signal,
          onProgress(ratio) {
            status.textContent = `Encoding ${Math.round(ratio * 100)}%`;
          },
        });
        const url = URL.createObjectURL(result.blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${kind === "odds" ? "odds-replay" : "line-chart-race"}.${result.extension}`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 4000);
        status.textContent =
          result.extension === "mp4"
            ? "Downloaded an MP4."
            : "This browser recorded a WebM instead of an MP4.";
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") status.textContent = "Export cancelled.";
        else status.textContent = err instanceof Error ? err.message : "Export failed.";
      } finally {
        abort = null;
        exportButton.textContent = "Export MP4";
      }
    });

    const params = new URLSearchParams(location.search);
    if (params.get("type") === "odds") {
      oddsSample = params.get("sample") === "election" ? "election" : "match";
      setKind("odds");
    } else {
      copyFor(kind);
      apply();
    }
  }
}
