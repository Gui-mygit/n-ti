(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.getElementById('siteHeader');
  const progress = document.getElementById('scrollProgress');
  const hero = document.getElementById('top');
  const heroMonogram = hero ? hero.querySelector('.hero-monogram') : null;
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const chapters = [...document.querySelectorAll('main > section[id]')];
  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  let ticking = false;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* Reveal */
  if (reduced || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -7% 0px', threshold: 0.08 },
    );
    revealItems.forEach((item) => observer.observe(item));
  }

  function update() {
    ticking = false;
    const y = window.scrollY || window.pageYOffset;
    const vh = window.innerHeight;
    const max = Math.max(1, root.scrollHeight - vh);

    if (progress) {
      progress.style.transform = `scaleX(${clamp(y / max, 0, 1).toFixed(5)})`;
    }
    if (header) {
      header.classList.toggle('is-scrolled', y > 24);
    }
    if (heroMonogram && !reduced && hero) {
      const shift = clamp(y, 0, hero.offsetHeight) * 0.1;
      heroMonogram.style.setProperty('--hero-shift', `${shift.toFixed(2)}px`);
    }

    const probe = vh * 0.36;
    let active = null;
    for (const chapter of chapters) {
      const rect = chapter.getBoundingClientRect();
      if (rect.top <= probe && rect.bottom > probe) {
        active = chapter.id;
        break;
      }
    }
    navLinks.forEach((link) => {
      const on = link.dataset.nav === active;
      link.classList.toggle('is-active', on);
      if (on) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  window.addEventListener('load', requestUpdate, { once: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(requestUpdate).catch(() => {});
  }

  requestUpdate();
})();
