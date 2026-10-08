import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const root = resolve(__dirname);
const partialsDir = resolve(root, 'src/partials');
const dataDir = resolve(root, 'src/data');

const readJson = (file) => JSON.parse(readFileSync(resolve(dataDir, file), 'utf8'));

// Works Card parameters from one entry of src/data/works.json
function worksCardParams(work, categories) {
  const spec = work.spec ?? [work.family, work.floorArea && `延床 ${work.floorArea}坪`, work.structure].filter(Boolean);
  return {
    img: work.image.name,
    img_l: work.image.large,
    alt: work.image.alt,
    tag: categories[work.category],
    area: work.area,
    href: work.url ?? '/works/',
    title: work.title,
    spec: spec.join('｜'),
  };
}

// Minimal HTML include: <!-- @include header.html {"key":"value"} -->
// {{key}} placeholders in the partial are replaced; includes may nest.
// Works Cards from src/data/works.json:
// <!-- @works {"slugs":["a","b"],"wrap":"li","override":{"a":{"tag":"…"}}} -->
function htmlInclude() {
  const pattern = /<!--\s*@include\s+([\w./-]+)(?:\s+(\{[\s\S]*?\}))?\s*-->/g;
  const worksPattern = /<!--\s*@works\s+(\{[\s\S]*?\})\s*-->/g;
  const include = (file, params) =>
    readFileSync(resolve(partialsDir, file), 'utf8').replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key) => params[key] ?? '');
  const render = (html, depth = 0) => {
    if (depth > 10) throw new Error('@include nested too deeply');
    return html
      .replace(worksPattern, (_, json) => {
        const { slugs, wrap = 'li', override = {} } = JSON.parse(json);
        const works = readJson('works.json');
        const categories = readJson('categories.json');
        return slugs
          .map((slug) => {
            const work = works.find((w) => w.slug === slug);
            if (!work) throw new Error(`@works: unknown slug "${slug}"`);
            const card = render(include('works-card.html', { ...worksCardParams(work, categories), ...override[slug] }), depth + 1);
            return `<${wrap}>${card.trim()}</${wrap}>`;
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
        worksHikari: resolve(root, 'works/hikari-to-ki/index.html'),
      },
    },
  },
});
