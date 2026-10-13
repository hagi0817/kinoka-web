// TOP MV slider: up to MV_SLIDES_MAX works from src/data/works.json, in data order.
// The same list feeds three places in index.html, so photos, captions and pagination always line up:
// <!-- @works-hero media -->, <!-- @works-hero captions -->, <!-- @works-hero controls -->
// A work's optional "hero" (wide PC photo + SP crop) is used when it has one; otherwise its card photo is shown.
import { escapeHtml } from './news.js';

export const MV_SLIDES_MAX = 4;

export function heroWorks(works, slugs) {
  const list = slugs
    ? slugs.map((slug) => {
        const work = works.find((w) => w.slug === slug);
        if (!work) throw new Error(`@works-hero: unknown slug "${slug}"`);
        return work;
      })
    : works;
  return list.slice(0, MV_SLIDES_MAX);
}

const number = (index) => String(index + 1).padStart(2, '0');

function slideMedia(work, index) {
  const first = index === 0;
  const loading = first ? ' fetchpriority="high"' : ' loading="lazy"';
  const state = first ? ' is-active' : '';
  const hidden = first ? '' : ' aria-hidden="true"';
  const { hero, image } = work;
  if (hero) {
    const srcset = hero.widths.map((w) => `/images/${hero.name}-${w}.webp ${w}w`).join(', ');
    return `<picture class="mv__slide${state}" data-mv-slide${hidden}>
          <source media="(min-width: 768px)" srcset="${srcset}" sizes="100vw" width="${hero.width}" height="${hero.height}">
          <img src="/images/${hero.sp}.webp" width="${hero.spWidth}" height="${hero.spHeight}" alt="${escapeHtml(hero.alt)}"${loading} decoding="async">
        </picture>`;
  }
  // card photo (4:5 or 3:2) cropped from the center
  return `<picture class="mv__slide mv__slide--card${state}" data-mv-slide${hidden}>
          <img src="/images/${image.name}-480.webp" srcset="/images/${image.name}-480.webp 480w, /images/${image.name}-${image.large}.webp ${image.large}w" sizes="100vw" width="480" height="600" alt="${escapeHtml(image.alt)}"${loading} decoding="async">
        </picture>`;
}

function slideCaption(work, index, total, taxonomy, arrow) {
  const area = taxonomy.area.options[work.area];
  const hidden = index === 0 ? '' : ' hidden';
  return `<div class="mv__slide-caption" role="group" aria-roledescription="スライド" aria-label="${index + 1} / ${total}" data-mv-caption${hidden}>
            <a class="mv__caption" href="${escapeHtml(work.url ?? '/works/')}">
              <span class="mv__caption-en" lang="en">WORKS ${number(index)}</span>
              <span class="mv__caption-work">${escapeHtml(work.title)}${area ? `<span class="u-pc">｜${escapeHtml(area)}</span>` : ''}</span>
              ${arrow}
            </a>
          </div>`;
}

// Prev / next, "01 / 04" and one button per slide. Hidden until main.js starts the slider; omitted for a single slide.
function controls(works, arrow) {
  if (works.length < 2) return '';
  const dots = works
    .map((work, index) => `<li><button class="mv-controls__dot" type="button" aria-label="${index + 1}枚目：${escapeHtml(work.title)}"${index === 0 ? ' aria-current="true"' : ''} data-mv-dot="${index}"></button></li>`)
    .join('');
  return `<div class="mv-controls" data-mv-controls hidden>
            <span class="mv-controls__count" lang="en" aria-hidden="true"><span data-mv-current>01</span> / ${number(works.length - 1)}</span>
            <ol class="mv-controls__dots" aria-label="表示する施工事例を選ぶ">${dots}</ol>
            <div class="mv-controls__arrows">
              <button class="mv-controls__arrow mv-controls__arrow--prev" type="button" aria-label="前の施工事例" data-mv-prev>${arrow}</button>
              <button class="mv-controls__arrow" type="button" aria-label="次の施工事例" data-mv-next>${arrow}</button>
            </div>
          </div>
          <p class="visually-hidden" aria-live="polite" data-mv-status></p>`;
}

export function renderWorksHero(kind, works, taxonomy, arrow) {
  if (kind === 'media') return works.map((work, index) => slideMedia(work, index)).join('\n        ');
  if (kind === 'captions') return works.map((work, index) => slideCaption(work, index, works.length, taxonomy, arrow)).join('\n            ');
  return controls(works, arrow);
}
