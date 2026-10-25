const board = document.querySelector<HTMLElement>("[data-looks]");
if (board) {
  const detail = board.querySelector<HTMLElement>("[data-look-detail]");
  const stages = board.querySelectorAll<HTMLElement>("[data-look]");
  const buttons = board.querySelectorAll<HTMLButtonElement>("[data-look-id]");
  const show = (id: string) => {
    stages.forEach((stage) => {
      stage.hidden = stage.dataset.look !== id;
    });
    buttons.forEach((button) => {
      const on = button.dataset.lookId === id;
      button.setAttribute("aria-pressed", on ? "true" : "false");
      button.classList.toggle("btn-primary", on);
      button.classList.toggle("btn-secondary", !on);
    });
    const stage = board.querySelector<HTMLElement>(`[data-look="${id}"]`);
    if (detail && stage?.dataset.detail) detail.textContent = stage.dataset.detail;
  };
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.lookId) show(button.dataset.lookId);
    });
  });
}
