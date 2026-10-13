import { resolve } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { defineConfig } from 'vite';
import { loadNews, newsTopItems, newsListItems, newsFilterChips, newsArticleParams } from './scripts/news.js';
import { heroWorks, renderWorksHero } from './scripts/works-hero.js';

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
// TOP MV slides from src/data/works.json (first 4 works, or "slugs"): <!-- @works-hero media|captions|controls {"slugs":[…]} -->
// News from src/data/news.json: <!-- @news {"limit":3} --> (TOP items), <!-- @news-list -->, <!-- @news-filter -->, <!-- @news-count -->
const newsPattern = /<!--\s*@news(?:\s+(\{[\s\S]*?\}))?\s*-->/g;
const newsMarkers = /<!--\s*@news-(list|filter|count)\s*-->/g;
const include = (file, params) =>
  readFileSync(resolve(partialsDir, file), 'utf8').replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key) => params[key] ?? '');

function htmlInclude() {
  const pattern = /<!--\s*@include\s+([\w./-]+)(?:\s+(\{[\s\S]*?\}))?\s*-->/g;
  const worksPattern = /<!--\s*@works(?:\s+(\{[\s\S]*?\}))?\s*-->/g;
  const filterPattern = /<!--\s*@works-filter\s*-->/g;
  const heroPattern = /<!--\s*@works-hero\s+(media|captions|controls)(?:\s+(\{[\s\S]*?\}))?\s*-->/g;
  const render = (html, depth = 0) => {
    if (depth > 10) throw new Error('@include nested too deeply');
    const news = () => loadNews(dataDir);
    const newsInclude = (file, params) => render(include(file, params), depth + 1);
    return html
      .replace(newsMarkers, (_, kind) => {
        if (kind === 'list') return newsListItems(news(), newsInclude);
        if (kind === 'filter') return newsFilterChips(news());
        return String(news().posts.length);
      })
      .replace(newsPattern, (_, json) => newsTopItems(news(), newsInclude, (json ? JSON.parse(json) : {}).limit))
      .replace(filterPattern, () => worksFilterGroups(readJson('taxonomy.json')))
      .replace(heroPattern, (_, kind, json) => {
        const works = heroWorks(readJson('works.json'), (json ? JSON.parse(json) : {}).slugs);
        return renderWorksHero(kind, works, readJson('taxonomy.json'), include('icons/arrow.svg', {}).trim());
      })
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
      if (file.startsWith(partialsDir) || file.startsWith(dataDir) || file.startsWith(resolve(root, 'src/templates'))) server.ws.send({ type: 'full-reload' });
    },
  };
}

// News article pages: /news/<slug>/ for each published post, all from src/templates/news-article.html.
// They are virtual HTML entries (no file per post); {{post_*}} values come from scripts/news.js.
// Unknown /news/<slug>/ URLs get the 404 page (404.html) in dev and preview; static hosts serve 404.html themselves.
const newsDir = resolve(root, 'news');
const articleSlug = (id) => id.match(/^(.*)\/news\/([^/]+)\/index\.html$/)?.[1] === root ? id.split('/').at(-2) : null;
const newsPathSlug = (url) => url.split('?')[0].match(/^\/news\/([^/]+)\/?(?:index\.html)?$/)?.[1] ?? null;

function renderArticle(slug) {
  const news = loadNews(dataDir);
  const post = news.posts.find((p) => p.slug === slug);
  if (!post) return null;
  const params = newsArticleParams(post, news);
  return readFileSync(resolve(root, 'src/templates/news-article.html'), 'utf8').replace(/\{\{\s*(post_\w+)\s*\}\}/g, (_m, key) => params[key] ?? '');
}

function newsArticles() {
  return {
    name: 'kinoka-news-articles',
    resolveId(id) {
      return articleSlug(id) ? id : null;
    },
    load(id) {
      const slug = articleSlug(id);
      return slug ? renderArticle(slug) : null;
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const slug = newsPathSlug(req.url ?? '');
        if (!slug) return next();
        try {
          const article = renderArticle(slug);
          const html = await server.transformIndexHtml(req.url, article ?? readFileSync(resolve(root, '404.html'), 'utf8'));
          res.statusCode = article ? 200 : 404;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        } catch (error) {
          next(error);
        }
      });
    },
    configurePreviewServer(server) {
      const outDir = resolve(root, server.config.build.outDir);
      server.middlewares.use((req, res, next) => {
        const slug = newsPathSlug(req.url ?? '');
        if (!slug || existsSync(resolve(outDir, 'news', slug, 'index.html'))) return next();
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(readFileSync(resolve(outDir, '404.html')));
      });
    },
  };
}

const newsInputs = Object.fromEntries(
  loadNews(dataDir).posts.map((post) => [`news-${post.slug}`, resolve(newsDir, post.slug, 'index.html')]),
);

export default defineConfig({
  plugins: [htmlInclude(), newsArticles()],
  css: {
    preprocessorOptions: { scss: { api: 'modern-compiler' } },
  },
  build: {
    rollupOptions: {
      input: {
        top: resolve(root, 'index.html'),
        works: resolve(root, 'works/index.html'),
        worksHikari: resolve(root, 'works/hikari-to-ki/index.html'),
        contact: resolve(root, 'contact/index.html'),
        about: resolve(root, 'about/index.html'),
        service: resolve(root, 'service/index.html'),
        concept: resolve(root, 'concept/index.html'),
        news: resolve(root, 'news/index.html'),
        ...newsInputs,
        notFound: resolve(root, '404.html'),
      },
    },
  },
});
