const INTERVAL_MS = 4200;

function initHomeHero() {
  const root = document.querySelector("[data-home-hero]");
  if (!root) return;

  const slides = [...root.querySelectorAll("[data-hero-slide]")];
  if (slides.length < 2) return;

  let index = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (index < 0) index = 0;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer = 0;

  /** @param {number} next */
  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });
  }

  function play() {
    stop();
    if (reduced || document.hidden) return;
    timer = window.setInterval(() => show(index + 1), INTERVAL_MS);
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = 0;
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else play();
  });

  show(index);
  play();
}

initHomeHero();
