import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const root = resolve(__dirname);
const partialsDir = resolve(root, 'src/partials');
const dataDir = resolve(root, 'src/data');

const readJson = (file) => JSON.parse(readFileSync(resolve(dataDir, file), 'utf8'));
const escapeAttr = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

// Works Card parameters from one entry of src/data/works.json
function worksCardParams(work, taxonomy) {
  const spec = work.spec ?? [work.family, work.floorArea && `延床 ${work.floorArea}坪`, work.structure].filter(Boolean);
  return {
    img: work.image.name,
    img_l: work.image.large,
    alt: work.image.alt,
    tag: taxonomy.category.options[work.category],
    area: taxonomy.area.options[work.area],
    href: work.url ?? '/works/',
    title: work.title,
    spec: spec.join('｜'),
  };
}

// Filter groups (Category chips as radios) from src/data/taxonomy.json
function worksFilterGroups(taxonomy) {
  return Object.entries(taxonomy)
    .map(([name, { label, options }]) => {
      const chip = (value, text, checked = '') =>
        `<label class="chip chip--choice"><input class="visually-hidden" type="radio" name="${name}" value="${value}"${checked}>${text}</label>`;
      const chips = [chip('', 'すべて', ' checked'), ...Object.entries(options).map(([value, text]) => chip(value, text))];
      return `<fieldset class="works-filter__group"><legend class="works-filter__legend">${label}</legend><div class="works-filter__chips">${chips.join('')}</div></fieldset>`;
    })
    .join('\n');
}

// Minimal HTML include: <!-- @include header.html {"key":"value"} -->
// {{key}} placeholders in the partial are replaced; includes may nest.
// Works Cards from src/data/works.json (all works when "slugs" is omitted; "filterable" adds data-* for the filter):
// <!-- @works {"slugs":["a","b"],"override":{"a":{"tag":"…"}},"filterable":true} -->
// Filter groups from src/data/taxonomy.json: <!-- @works-filter -->
function htmlInclude() {
  const pattern = /<!--\s*@include\s+([\w./-]+)(?:\s+(\{[\s\S]*?\}))?\s*-->/g;
  const worksPattern = /<!--\s*@works(?:\s+(\{[\s\S]*?\}))?\s*-->/g;
  const filterPattern = /<!--\s*@works-filter\s*-->/g;
  const include = (file, params) =>
    readFileSync(resolve(partialsDir, file), 'utf8').replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key) => params[key] ?? '');
  const render = (html, depth = 0) => {
    if (depth > 10) throw new Error('@include nested too deeply');
    return html
      .replace(filterPattern, () => worksFilterGroups(readJson('taxonomy.json')))
      .replace(worksPattern, (_, json) => {
        const { slugs, override = {}, filterable = false } = json ? JSON.parse(json) : {};
        const works = readJson('works.json');
        const taxonomy = readJson('taxonomy.json');
        return (slugs ?? works.map((w) => w.slug))
          .map((slug) => {
            const work = works.find((w) => w.slug === slug);
            if (!work) throw new Error(`@works: unknown slug "${slug}"`);
            const card = render(include('works-card.html', { ...worksCardParams(work, taxonomy), ...override[slug] }), depth + 1);
            const attrs = filterable
              ? ['category', 'area', 'type'].map((key) => ` data-${key}="${escapeAttr(work[key] ?? '')}"`).join('')
              : '';
            return `<li${attrs}>${card.trim()}</li>`;
          })
          .join('\n');
      })
      .replace(pattern, (_, file, json) => render(include(file, json ? JSON.parse(json) : {}), depth + 1));
  };
  return {
    name: 'kinoka-html-include',
    transformIndexHtml: { order: 'pre', handler: (html) => render(html) },
    handleHotUpdate({ file, server }) {
      if (file.startsWith(partialsDir) || file.startsWith(dataDir)) server.ws.send({ type: 'full-reload' });
    },
  };
}

export default defineConfig({
  plugins: [htmlInclude()],
  css: {
    preprocessorOptions: { scss: { api: 'modern-compiler' } },
  },
  build: {
    rollupOptions: {
      input: {
        top: resolve(root, 'index.html'),
        works: resolve(root, 'works/index.html'),
        worksHikari: resolve(root, 'works/hikari-to-ki/index.html'),
      },
    },
  },
});
