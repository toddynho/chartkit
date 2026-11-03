import {
  createLineRace,
  exportLineRace,
  lineRaceFromCsv,
  lineRaceFromJson,
  mountLineRace,
  podcastMentionsCsv,
  podcastMentionsRace,
  type LineRace,
  type LineRaceOptions,
  type LineRaceSeries,
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
  const start = Number(root.dataset.start ?? "0");

  if (stage && play && scrub && time && loop && exportButton && status && title && subtitle && unit && duration && data && file && reset && error && swatches) {
    const colors = new Map<string, string>();
    let swatchKey = "";
    let chart: LineRace | null = null;
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

    const paintSwatches = (series: LineRaceSeries[]) => {
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

    const mount = (options: LineRaceOptions) => {
      const wasPlaying = player?.playing ?? false;
      const at = player?.t ?? start;
      player?.destroy();
      chart = createLineRace({ ...options, width: 1280, height: 720 });
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
        const options = readOptions();
        error.hidden = true;
        error.textContent = "";
        paintSwatches(options.series ?? []);
        mount({
          ...options,
          series: (options.series ?? []).map((series) => ({
            ...series,
            color: colors.get(series.name) ?? series.color,
          })),
        });
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
    reset.addEventListener("click", () => {
      const sample = podcastMentionsRace();
      title.value = sample.title;
      subtitle.value = sample.subtitle ?? "";
      unit.value = sample.unit ?? "";
      duration.value = "9";
      data.value = podcastMentionsCsv();
      swatchKey = "";
      colors.clear();
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
        link.download = `line-chart-race.${result.extension}`;
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

    apply();
  }
}
