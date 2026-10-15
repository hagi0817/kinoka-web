// Minimal UI control: page top on arrival, SP menu, header state, SP fixed CTA, TOP MV slider, Works carousel indicator, Works list filter, News category filter, Contact form.

import { initContactForm } from './contact.js';

const lg = window.matchMedia('(min-width: 1024px)');

// ---- Page top on arrival: a link to another page opens at its top ----
// Browsers already do this, but some embedding viewers (e.g. the preview copy of this site) keep the previous
// scroll position across pages. Only plain link navigations are reset: back/forward and reload keep their
// restored position, a #fragment still jumps to its section, and the reset stops once the visitor scrolls.
function initPageTop() {
  const [entry] = performance.getEntriesByType('navigation');
  if ((entry && entry.type !== 'navigate') || window.location.hash) return;
  const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  let active = true;
  const stop = () => {
    active = false;
    events.forEach((type) => window.removeEventListener(type, stop, { capture: true }));
  };
  events.forEach((type) => window.addEventListener(type, stop, { capture: true, passive: true }));
  const toTop = () => {
    if (active && (window.scrollY !== 0 || document.documentElement.scrollTop !== 0)) window.scrollTo(0, 0);
  };
  toTop();
  window.addEventListener('load', () => {
    toTop();
    requestAnimationFrame(toTop);
    window.setTimeout(() => { toTop(); stop(); }, 500);
  }, { once: true });
}

// ---- Focus moved by script right after a tap / click (a dialog opening, focus returning on close) ----
// iOS Safari does not focus a tapped button, so it treats this script focus like keyboard focus and draws the
// :focus-visible ring (a square green outline). The mark hides that ring until the next key press or blur;
// keyboard use (Enter / Space / Esc, where click.detail is 0) is never marked and keeps the ring.
function markPointerFocus(element) {
  if (!element) return;
  element.setAttribute('data-pointer-focus', '');
  const clear = () => {
    element.removeAttribute('data-pointer-focus');
    element.removeEventListener('blur', clear);
    document.removeEventListener('keydown', clear, true);
  };
  element.addEventListener('blur', clear);
  document.addEventListener('keydown', clear, true);
}

// ---- SP menu (<dialog>): open/close, scroll lock, Esc, focus return ----
function initMenu() {
  const menu = document.querySelector('[data-menu]');
  const openButton = document.querySelector('[data-menu-open]');
  if (!menu || !openButton || typeof menu.showModal !== 'function') return;

  let closedByPointer = false;
  const close = (event) => {
    closedByPointer = event?.detail > 0;
    if (menu.open) menu.close();
  };

  openButton.addEventListener('click', (event) => {
    menu.showModal();
    if (event.detail > 0) markPointerFocus(document.activeElement);
    openButton.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-scroll-locked');
  });

  menu.addEventListener('close', () => {
    openButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-scroll-locked');
    if (closedByPointer) markPointerFocus(openButton);
    closedByPointer = false;
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

// ---- TOP MV slider: works photos + caption links; prev / next, pagination, arrow keys, swipe. No autoplay ----
function initMvSlider() {
  const mv = document.querySelector('[data-mv]');
  const slider = mv?.querySelector('[data-mv-slider]');
  const controls = slider?.querySelector('[data-mv-controls]');
  if (!controls) return; // a single work renders no controls

  const slides = Array.from(mv.querySelectorAll('[data-mv-slide]'));
  const captions = Array.from(slider.querySelectorAll('[data-mv-caption]'));
  const dots = Array.from(controls.querySelectorAll('[data-mv-dot]'));
  const current = controls.querySelector('[data-mv-current]');
  const status = slider.querySelector('[data-mv-status]');
  const total = slides.length;
  let index = 0;

  const show = (next, { announce = true } = {}) => {
    const previous = index;
    index = (next + total) % total;
    slides.forEach((slide, i) => {
      const active = i === index;
      // the slide being replaced stays under the new one while it fades in; any older one is hidden at once
      slide.classList.toggle('is-leaving', !active && i === previous);
      slide.classList.toggle('is-active', active);
      if (active) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
    });
    captions.forEach((caption, i) => { caption.hidden = i !== index; });
    dots.forEach((dot, i) => {
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    if (current) current.textContent = String(index + 1).padStart(2, '0');
    if (announce && status) {
      const title = captions[index].querySelector('.mv__caption-work')?.firstChild?.textContent ?? '';
      status.textContent = `${index + 1} / ${total}：${title}`;
    }
  };

  controls.querySelector('[data-mv-prev]')?.addEventListener('click', () => show(index - 1));
  controls.querySelector('[data-mv-next]')?.addEventListener('click', () => show(index + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));

  // ←/→ anywhere in the slider (caption link, pagination, buttons); a focused page dot follows the active slide
  slider.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const onDot = dots.includes(document.activeElement);
    const onCaption = captions.some((caption) => caption.contains(document.activeElement));
    show(index + (event.key === 'ArrowRight' ? 1 : -1));
    if (onDot) dots[index].focus();
    else if (onCaption) captions[index].querySelector('a')?.focus();
  });

  // swipe (touch / pen): a mostly horizontal move of 40px or more. Pointer events only (no touch events), one
  // pointer at a time, so one swipe moves one slide. touch-action: pan-y (CSS) leaves vertical scroll to the browser,
  // which then sends pointercancel. A tap moves less than 40px and stays a link tap.
  let start = null;
  let swiped = false;
  mv.addEventListener('pointerdown', (event) => {
    swiped = false;
    start = event.pointerType === 'mouse' || !event.isPrimary
      ? null
      : { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  mv.addEventListener('pointerup', (event) => {
    if (!start || event.pointerId !== start.id) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    start = null;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped = true;
      show(index + (dx < 0 ? 1 : -1));
    }
  });
  mv.addEventListener('pointercancel', () => { start = null; });
  // a swipe that ends on the caption link must not also open it (keyboard clicks have detail 0 and pass)
  mv.addEventListener('click', (event) => {
    if (!swiped || event.detail === 0) return;
    swiped = false;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  controls.hidden = false;
  show(0, { announce: false });
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

// ---- Works list: filter cards by category / area / type (radios), SP bottom sheet ----
function initWorksFilter() {
  const form = document.querySelector('[data-works-filter]');
  const list = document.querySelector('[data-works-list]');
  if (!form || !list) return;

  const items = Array.from(list.children);
  const keys = ['category', 'area', 'type'];
  const empty = document.querySelector('[data-works-empty]');
  const counts = document.querySelectorAll('[data-works-count]');
  const clearButtons = document.querySelectorAll('[data-filter-clear]');
  const inlineClear = document.querySelector('.works-status [data-filter-clear]');
  const activeLabel = document.querySelector('[data-filter-active]');

  // initial state from the URL (TOP category chips link here); "hiraya" is a type, not a category
  const params = new URLSearchParams(window.location.search);
  if (params.get('category') === 'hiraya' && !params.has('type')) {
    params.delete('category');
    params.set('type', 'hiraya');
  }
  keys.forEach((key) => {
    const input = form.querySelector(`input[name="${key}"][value="${CSS.escape(params.get(key) ?? '')}"]`);
    if (input) input.checked = true;
  });

  const apply = () => {
    const data = new FormData(form);
    const selected = keys.filter((key) => data.get(key));
    let visible = 0;
    items.forEach((item) => {
      const match = selected.every((key) => item.dataset[key] === data.get(key));
      item.hidden = !match;
      if (match) visible += 1;
    });
    counts.forEach((el) => { el.textContent = String(visible); });
    if (empty) empty.hidden = visible > 0;
    if (inlineClear) inlineClear.hidden = selected.length === 0;
    if (activeLabel) activeLabel.textContent = selected.length ? `（${selected.length}）` : '';

    const url = new URL(window.location.href);
    keys.forEach((key) => url.searchParams.delete(key));
    selected.forEach((key) => url.searchParams.set(key, data.get(key)));
    window.history.replaceState(null, '', url);
  };

  form.addEventListener('change', apply);
  clearButtons.forEach((button) => button.addEventListener('click', () => {
    form.reset();
    apply();
  }));
  apply();

  // SP / md: the same form is shown in a bottom sheet (<dialog>)
  const sheet = document.querySelector('[data-filter-sheet]');
  const sheetBody = sheet?.querySelector('[data-filter-sheet-body]');
  const slot = document.querySelector('[data-filter-slot]');
  const openButton = document.querySelector('[data-filter-open]');
  if (!sheet || !sheetBody || !slot || !openButton || typeof sheet.showModal !== 'function') return;

  openButton.addEventListener('click', (event) => {
    sheetBody.append(form);
    sheet.showModal();
    if (event.detail > 0) markPointerFocus(document.activeElement);
    openButton.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-scroll-locked');
  });

  let closedByPointer = false;
  sheet.addEventListener('close', () => {
    slot.append(form);
    openButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-scroll-locked');
    if (!lg.matches) {
      if (closedByPointer) markPointerFocus(openButton);
      openButton.focus();
    }
    closedByPointer = false;
  });

  const close = (event) => {
    closedByPointer = event?.detail > 0;
    if (sheet.open) sheet.close();
  };
  sheet.querySelectorAll('[data-filter-sheet-close]').forEach((button) => button.addEventListener('click', close));
  // a click on the backdrop (the dialog box itself, outside its content) closes the sheet
  sheet.addEventListener('click', (event) => {
    if (event.target === sheet) close(event);
  });
  lg.addEventListener('change', (event) => {
    if (event.matches) close();
  });
}

// ---- News list: show one category (radios); ?category= keeps the choice (article tags link here) ----
function initNewsFilter() {
  const form = document.querySelector('[data-news-filter]');
  const list = document.querySelector('[data-news-list]');
  if (!form || !list) return;

  const items = Array.from(list.children);
  const count = document.querySelector('[data-news-count]');
  const initial = new URLSearchParams(window.location.search).get('category') ?? '';
  const input = form.querySelector(`input[name="category"][value="${CSS.escape(initial)}"]`);
  if (input) input.checked = true;

  const apply = () => {
    const category = new FormData(form).get('category');
    let visible = 0;
    items.forEach((item) => {
      item.hidden = Boolean(category) && item.dataset.category !== category;
      if (!item.hidden) visible += 1;
    });
    if (count) count.textContent = String(visible);

    const url = new URL(window.location.href);
    if (category) url.searchParams.set('category', category);
    else url.searchParams.delete('category');
    window.history.replaceState(null, '', url);
  };

  form.addEventListener('change', apply);
  apply();
}

initPageTop();
initMenu();
initScrollStates();
initMvSlider();
initCarousels();
initWorksFilter();
initNewsFilter();
initContactForm();
