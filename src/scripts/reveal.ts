// The reveal (Motion in the design system).
// - [data-reveal="intro"]: shown on load, top to bottom, 60ms apart.
// - [data-reveal]: shown once its top comes within the bottom 8% of the window;
//   blocks that arrive together step in 80ms apart. Each reveals once and stays.
const root = document.documentElement;

if (root.classList.contains('js-reveal')) {
  const show = (el: HTMLElement, delay: number) => {
    el.style.transitionDelay = `${delay}ms`;
    el.classList.add('is-revealed');
    // Clear the delay afterwards so it never affects anything else.
    el.addEventListener('transitionend', () => (el.style.transitionDelay = ''), { once: true });
  };

  const intro = [...document.querySelectorAll<HTMLElement>('[data-reveal="intro"]')];
  // Two frames, so the hidden state is painted first and the entrance actually animates.
  requestAnimationFrame(() => requestAnimationFrame(() => intro.forEach((el, i) => show(el, i * 60))));

  const observer = new IntersectionObserver(
    (entries) => {
      let step = 0;
      for (const entry of entries) {
        // Reveal anything in view, or already scrolled past (e.g. after a reload halfway down).
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          const el = entry.target as HTMLElement;
          observer.unobserve(el);
          show(el, step++ * 80);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal="intro"])').forEach((el) => observer.observe(el));
}
