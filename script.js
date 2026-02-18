document.addEventListener("DOMContentLoaded", () => {
  const buttons = Array.from(document.querySelectorAll(".tab-btn"));
  const panels = Array.from(document.querySelectorAll(".tab-content"));

  function activate(targetId) {
    buttons.forEach((b) => {
      const on = b.dataset.target === targetId;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });

    panels.forEach((p) => {
      p.classList.toggle("active", p.id === targetId);
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => activate(btn.dataset.target));
  });

  const defaultBtn = document.querySelector(".tab-btn.active") || buttons[0];
  if (defaultBtn) activate(defaultBtn.dataset.target);
});
