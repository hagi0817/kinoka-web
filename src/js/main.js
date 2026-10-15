// Minimal UI control: SP menu, header state, SP fixed CTA, Works carousel indicator.

const lg = window.matchMedia('(min-width: 1024px)');

// ---- SP menu (<dialog>): open/close, scroll lock, Esc, focus return ----
function initMenu() {
  const menu = document.querySelector('[data-menu]');
  const openButton = document.querySelector('[data-menu-open]');
  if (!menu || !openButton || typeof menu.showModal !== 'function') return;

  const close = () => {
    if (menu.open) menu.close();
  };

  openButton.addEventListener('click', () => {
    menu.showModal();
    openButton.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-scroll-locked');
  });

  menu.addEventListener('close', () => {
    openButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-scroll-locked');
    openButton.focus();
  });

  menu.querySelector('[data-menu-close]')?.addEventListener('click', close);
  // in-page links should not leave the menu open
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
  lg.addEventListener('change', (event) => {
    if (event.matches) close();
  });
}

// ---- Header: transparent over the MV, Solid once the MV is scrolled past ----
// ---- SP fixed CTA: visible after the MV, hidden when the footer is reached ----
function initScrollStates() {
  const header = document.querySelector('[data-header]');
  const mv = document.querySelector('[data-mv]');
  // the fixed CTA appears once the first view (MV, or the hero on lower pages) is scrolled past
  const firstView = mv ?? document.querySelector('[data-first-view]');
  const footer = document.querySelector('[data-footer]');
  const fixedCta = document.querySelector('[data-fixed-cta]');
  if (!('IntersectionObserver' in window)) {
    header?.classList.add('is-solid');
    return;
  }

  let pastFirstView = !firstView;
  let atFooter = false;
  const update = () => {
    fixedCta?.classList.toggle('is-visible', pastFirstView && !atFooter);
  };

  if (firstView) {
    const headerHeight = header?.offsetHeight ?? 0;
    new IntersectionObserver(
      ([entry]) => {
        pastFirstView = !entry.isIntersecting;
        if (mv) header?.classList.toggle('is-solid', pastFirstView);
        update();
      },
      { rootMargin: `-${headerHeight}px 0px 0px 0px` },
    ).observe(firstView);
  }

  if (footer) {
    new IntersectionObserver(([entry]) => {
      atFooter = entry.isIntersecting;
      update();
    }).observe(footer);
  }

  update();
}

// ---- Carousel: "01 / 03" indicator + arrow keys ----
function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach((track) => {
    const indicator = track.closest('section')?.querySelector('[data-carousel-indicator]');
    const current = indicator?.querySelector('[data-carousel-current]');
    const bar = indicator?.querySelector('[data-carousel-bar]');
    const items = Array.from(track.children);

    const step = () => (items[1] ? items[1].offsetLeft - items[0].offsetLeft : track.clientWidth);

    const onScroll = () => {
      const max = track.scrollWidth - track.clientWidth;
      if (max <= 0) return;
      const ratio = track.scrollLeft / max;
      const index = Math.min(items.length - 1, Math.round(ratio * (items.length - 1)));
      if (current) current.textContent = String(index + 1).padStart(2, '0');
      if (bar) {
        const trackWidth = bar.parentElement.clientWidth - bar.offsetWidth;
        bar.style.transform = `translateX(${ratio * trackWidth}px)`;
      }
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    track.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      if (track.scrollWidth <= track.clientWidth) return;
      event.preventDefault();
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      track.scrollBy({ left: event.key === 'ArrowRight' ? step() : -step(), behavior });
    });
    window.addEventListener('resize', onScroll);
  });
}

initMenu();
initScrollStates();
initCarousels();
