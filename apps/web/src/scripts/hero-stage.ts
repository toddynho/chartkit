type Slide = {
  label: string;
  title: string;
  kpi: string;
  delta: string;
  chrome: string;
  json: string;
  svg: string;
};

function readSlides(): Slide[] {
  try {
    const parsed = JSON.parse(document.getElementById("hero-slides")?.textContent || "[]") as Slide[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const slides = readSlides();

const ROTATE_MS = 4000;
const PAUSE_MS = 8000;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

const stage = document.getElementById("hero-stage");
const surface = document.getElementById("stage-surface");
const ghost = document.getElementById("stage-ghost");
const ghostPre = document.getElementById("ghost-pre");
const wrap = document.getElementById("chart-slot");
const titleEl = document.getElementById("chart-title");
const kpiEl = document.getElementById("chart-kpi");
const deltaEl = document.getElementById("chart-delta");
const chromeEl = document.getElementById("chrome-label");
const rail = document.getElementById("type-rail");
const progress = document.getElementById("type-progress");
const tilt = document.getElementById("stage-tilt");
const live = document.getElementById("hero-live");
const watermark = document.getElementById("stage-wm");
const planLabel = document.getElementById("chart-plan");

if (stage && wrap && rail && titleEl && kpiEl && deltaEl && chromeEl && ghostPre && slides.length > 0) {
  const chartSlot = wrap;
  const chartTitle = titleEl;
  const chartKpi = kpiEl;
  const chartDelta = deltaEl;
  const chartChrome = chromeEl;
  const chartGhost = ghostPre;
  let index = 0;
  let timer: number | null = null;
  let resumeTimer: number | null = null;
  let paused = false;
  let swapTimer: number | null = null;

  const buttons = () => [...rail.querySelectorAll<HTMLButtonElement>(".type-btn")];

  function setMeta(chart: Slide) {
    chartTitle.textContent = chart.title;
    chartKpi.textContent = chart.kpi;
    chartDelta.textContent = chart.delta;
    chartChrome.textContent = chart.chrome;
    chartGhost.innerHTML = chart.json;
  }

  function renderChart(chart: Slide, animate: boolean) {
    if (!animate || reduce) {
      if (swapTimer) {
        window.clearTimeout(swapTimer);
        swapTimer = null;
      }
      chartSlot.classList.remove("is-leaving");
      chartSlot.innerHTML = chart.svg;
      setMeta(chart);
      return;
    }
    if (swapTimer) window.clearTimeout(swapTimer);
    chartSlot.classList.add("is-leaving");
    swapTimer = window.setTimeout(() => {
      chartSlot.innerHTML = chart.svg;
      setMeta(chart);
      chartSlot.classList.remove("is-leaving");
      const svg = chartSlot.querySelector<SVGElement>(".chart-svg");
      if (svg) {
        svg.style.opacity = "0";
        svg.style.transform = "translateY(10px)";
        requestAnimationFrame(() => {
          svg.style.transition =
            "opacity 380ms cubic-bezier(0,0,0.5,1), transform 380ms cubic-bezier(0,0,0.5,1)";
          svg.style.opacity = "1";
          svg.style.transform = "translateY(0)";
        });
      }
      swapTimer = null;
    }, 280);
  }

  function syncRail() {
    buttons().forEach((button, buttonIndex) => {
      const on = buttonIndex === index;
      button.classList.toggle("is-active", on);
      button.setAttribute("aria-selected", on ? "true" : "false");
      button.tabIndex = on ? 0 : -1;
    });
  }

  function restartProgress() {
    if (reduce || !progress) return;
    progress.classList.remove("is-running");
    void progress.offsetWidth;
    if (!paused) progress.classList.add("is-running");
  }

  function clearTimers() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    if (resumeTimer) {
      window.clearTimeout(resumeTimer);
      resumeTimer = null;
    }
  }

  function startAuto() {
    clearTimers();
    if (reduce) return;
    paused = false;
    restartProgress();
    timer = window.setInterval(() => {
      if (paused) return;
      goTo((index + 1) % slides.length, false);
    }, ROTATE_MS);
  }

  function pauseAuto(ms: number) {
    if (reduce) return;
    paused = true;
    progress?.classList.remove("is-running");
    if (resumeTimer) {
      window.clearTimeout(resumeTimer);
      resumeTimer = null;
    }
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    if (ms > 0) {
      resumeTimer = window.setTimeout(() => {
        resumeTimer = null;
        startAuto();
      }, ms);
    }
  }

  function goTo(next: number, fromUser: boolean) {
    if (next === index) {
      if (fromUser) pauseAuto(PAUSE_MS);
      return;
    }
    index = next;
    syncRail();
    renderChart(slides[index], true);
    if (fromUser) {
      if (live) live.textContent = `${slides[index].label} chart, ${slides[index].title}`;
      pauseAuto(PAUSE_MS);
      return;
    }
    restartProgress();
  }

  rail.addEventListener("click", (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>(".type-btn");
    if (!button || !rail.contains(button)) return;
    const next = Number(button.dataset.index);
    if (Number.isNaN(next)) return;
    goTo(next, true);
  });

  rail.addEventListener("keydown", (event) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const tabs = buttons();
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    event.preventDefault();
    goTo(next, true);
    tabs[next]?.focus();
  });

  function bindPause(element: HTMLElement | null) {
    if (!element) return;
    element.addEventListener("pointerenter", () => pauseAuto(0));
    element.addEventListener("pointerleave", () => {
      if (reduce || resumeTimer) return;
      startAuto();
    });
  }

  bindPause(stage);
  bindPause(rail);

  if (surface && ghost) {
    surface.addEventListener("pointerenter", () => {
      stage.classList.add("is-hover-chart");
      stage.classList.remove("is-hover-json");
    });
    surface.addEventListener("pointerleave", () => stage.classList.remove("is-hover-chart"));
    ghost.addEventListener("pointerenter", () => {
      stage.classList.add("is-hover-json");
      stage.classList.remove("is-hover-chart");
    });
    ghost.addEventListener("pointerleave", () => stage.classList.remove("is-hover-json"));
    stage.addEventListener("pointerleave", () => {
      stage.classList.remove("is-hover-chart", "is-hover-json");
    });
  }

  const planButtons = stage.querySelectorAll<HTMLButtonElement>(".stage-plan button");
  planButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const free = button.dataset.plan !== "pro";
      watermark?.classList.toggle("is-on", free);
      if (planLabel) {
        planLabel.textContent = free ? "Free · watermarked" : "Pro · clean";
        planLabel.classList.toggle("is-pro", !free);
      }
      planButtons.forEach((peer) => {
        const on = peer === button;
        peer.classList.toggle("is-on", on);
        peer.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (live) live.textContent = free ? "Free Cloud preview, watermark on" : "Pro preview, watermark off";
    });
  });

  if (!reduce && finePointer && tilt) {
    let frame = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const max = 4.5;
    const step = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      tilt.style.transform = `rotateX(${cx.toFixed(3)}deg) rotateY(${cy.toFixed(3)}deg)`;
      if (Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01) frame = requestAnimationFrame(step);
      else frame = 0;
    };
    stage.addEventListener("pointermove", (event) => {
      if (stage.classList.contains("is-hover-json")) return;
      const rect = stage.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      ty = nx * max * 2;
      tx = -ny * max * 1.4;
      if (!frame) frame = requestAnimationFrame(step);
    });
    stage.addEventListener("pointerleave", () => {
      tx = 0;
      ty = 0;
      if (!frame) frame = requestAnimationFrame(step);
    });
  }

  if (!reduce) startAuto();
}
