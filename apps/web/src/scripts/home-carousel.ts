const root = document.querySelector<HTMLElement>("[data-carousel]");
if (root) {
  const slides = [...root.querySelectorAll<HTMLElement>("[data-slide]")];
  const pills = [...root.querySelectorAll<HTMLButtonElement>("[data-pill]")];
  let index = 0;
  let pinned = false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(next: number): void {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const on = i === index;
      slide.hidden = !on;
      const chart = slide.querySelector(".carousel-chart");
      if (on && chart) {
        chart.classList.remove("is-in");
        void chart.getBoundingClientRect();
        chart.classList.add("is-in");
      }
    });
    pills.forEach((pill, i) => {
      const on = i === index;
      pill.classList.toggle("is-on", on);
      pill.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  pills.forEach((pill, i) => {
    pill.addEventListener("click", () => {
      pinned = true;
      show(i);
    });
  });

  if (!reduce) {
    window.setInterval(() => {
      if (!pinned && document.visibilityState !== "hidden") show(index + 1);
    }, 3200);
  }
}
