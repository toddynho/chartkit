/**
 * Plays the homepage repair replay.
 *
 * The markup is the finished state: repaired spec, three steps, drawn chart. This script only adds
 * the playback on top of it, by setting `data-phase` on the panel and typing the recorded answer.
 * With no JavaScript, or with reduced motion, the finished state is what shows.
 */
type Phase = "typing" | "validate" | "repair" | "done";

const TYPE_MS = 1100;
const HOLD_VALIDATE_MS = 1500;
const HOLD_REPAIR_MS = 1500;

export function mountRepairReplay(root: ParentNode = document): void {
  const host = root.querySelector<HTMLElement>("[data-repair]");
  if (!host || host.dataset.mounted === "1") return;
  host.dataset.mounted = "1";

  const tabs = [...host.querySelectorAll<HTMLButtonElement>("[data-rp-tab]")];
  const panels = [...host.querySelectorAll<HTMLElement>("[data-rp-panel]")];
  const replay = host.querySelector<HTMLButtonElement>("[data-rp-replay]");
  const still = window.matchMedia("(prefers-reduced-motion: reduce)");

  let timers: number[] = [];
  let frame = 0;

  const stop = () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers = [];
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
  };

  const later = (ms: number, run: () => void) => {
    timers.push(window.setTimeout(run, ms));
  };

  const active = () => panels.find((panel) => !panel.hidden) ?? panels[0];

  const setPhase = (panel: HTMLElement, phase: Phase) => {
    if (phase === "done") delete panel.dataset.phase;
    else panel.dataset.phase = phase;
  };

  const finish = () => {
    stop();
    panels.forEach((panel) => setPhase(panel, "done"));
  };

  const play = () => {
    stop();
    const panel = active();
    if (!panel) return;
    panels.forEach((other) => setPhase(other, "done"));
    if (still.matches) return;
    const typed = panel.querySelector<HTMLElement>("[data-rp-typed]");
    const text = typed?.dataset.text ?? "";
    if (!typed || !text) return;

    typed.textContent = "";
    setPhase(panel, "typing");
    const started = performance.now();
    const step = (now: number) => {
      const share = Math.min(1, (now - started) / TYPE_MS);
      typed.textContent = text.slice(0, Math.round(text.length * share));
      if (share < 1) {
        frame = window.requestAnimationFrame(step);
        return;
      }
      frame = 0;
      later(250, () => {
        setPhase(panel, "validate");
        later(HOLD_VALIDATE_MS, () => {
          setPhase(panel, "repair");
          later(HOLD_REPAIR_MS, () => setPhase(panel, "done"));
        });
      });
    };
    frame = window.requestAnimationFrame(step);
  };

  const select = (id: string, focus: boolean) => {
    stop();
    tabs.forEach((tab) => {
      const on = tab.dataset.rpTab === id;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.rpPanel !== id;
      setPhase(panel, "done");
    });
    play();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab.dataset.rpTab ?? "", false));
    tab.addEventListener("keydown", (event) => {
      const move = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!move) return;
      event.preventDefault();
      const next = tabs[(index + move + tabs.length) % tabs.length];
      select(next.dataset.rpTab ?? "", true);
    });
  });

  if (replay) {
    replay.hidden = false;
    replay.addEventListener("click", play);
  }

  still.addEventListener("change", () => {
    if (still.matches) finish();
  });

  // Play once, the first time most of the panel is on screen.
  if (!("IntersectionObserver" in window)) return;
  const seen = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      seen.disconnect();
      play();
    },
    { threshold: 0.5 },
  );
  seen.observe(host);
}
