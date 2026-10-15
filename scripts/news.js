// News: posts from src/data/news.json, rendered into the News list, the TOP latest items and one page per post.
// Data stays separate from markup: the partials (news-item.html / news-entry.html) and the article template
// (src/templates/news-article.html) only receive the values built here.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\\/g, '&#92;'); // also safe inside the JSON of an @include comment

export const newsUrl = (post) => `/news/${post.slug}/`;
const displayDate = (date) => date.replace(/-/g, '.');

// Published posts, newest first. Throws on data mistakes so a broken post fails the build instead of the page.
export function loadNews(dataDir) {
  const posts = JSON.parse(readFileSync(resolve(dataDir, 'news.json'), 'utf8'));
  const categories = JSON.parse(readFileSync(resolve(dataDir, 'news-categories.json'), 'utf8'));
  const slugs = new Set();
  posts.forEach((post) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug ?? '')) throw new Error(`news: invalid slug "${post.slug}"`);
    if (slugs.has(post.slug)) throw new Error(`news: duplicate slug "${post.slug}"`);
    slugs.add(post.slug);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date ?? '')) throw new Error(`news: invalid date in "${post.slug}"`);
    if (!categories[post.category]) throw new Error(`news: unknown category "${post.category}" in "${post.slug}"`);
  });
  const published = posts
    .filter((post) => post.published === true)
    .sort((a, b) => b.date.localeCompare(a.date));
  return { posts: published, categories };
}

const thumbnailImg = (thumbnail, sizes, extra = '') =>
  `<img src="/images/${thumbnail.name}-480.webp" srcset="/images/${thumbnail.name}-480.webp 480w, /images/${thumbnail.name}-${thumbnail.large}.webp ${thumbnail.large}w" sizes="${sizes}" width="480" height="320" alt="${escapeHtml(thumbnail.alt)}"${extra} decoding="async">`;

// Partial parameters shared by the TOP item and the list entry
function cardParams(post, categories) {
  return {
    href: newsUrl(post),
    datetime: post.date,
    date: displayDate(post.date),
    category: escapeHtml(categories[post.category]),
    title: escapeHtml(post.title),
    excerpt: escapeHtml(post.excerpt),
    thumb: post.thumbnail
      ? `<div class="news-entry__thumb">${thumbnailImg(post.thumbnail, '(min-width: 1024px) 280px, (min-width: 768px) 200px, 96px', ' loading="lazy"')}</div>`
      : '<div class="news-entry__thumb news-entry__thumb--empty" aria-hidden="true"><span lang="en">KINOKA</span></div>',
  };
}

// <li> items for the TOP News section (latest `limit` posts)
export function newsTopItems({ posts, categories }, include, limit = 3) {
  return posts
    .slice(0, limit)
    .map((post) => `<li>${include('news-item.html', cardParams(post, categories)).trim()}</li>`)
    .join('\n');
}

// <li> items for the News list (all published posts, data-category for the filter)
export function newsListItems({ posts, categories }, include) {
  return posts
    .map((post) => `<li data-category="${post.category}">${include('news-entry.html', cardParams(post, categories)).trim()}</li>`)
    .join('\n');
}

// Category chips (radios) for the News list; only categories that have published posts
export function newsFilterChips({ posts, categories }) {
  const chip = (value, text, checked = '') =>
    `<label class="chip chip--choice"><input class="visually-hidden" type="radio" name="category" value="${value}"${checked}>${escapeHtml(text)}</label>`;
  const used = Object.keys(categories).filter((key) => posts.some((post) => post.category === key));
  return [chip('', 'すべて', ' checked'), ...used.map((key) => chip(key, categories[key]))].join('');
}

// {{post_*}} values for src/templates/news-article.html
export function newsArticleParams(post, { posts, categories }) {
  const index = posts.indexOf(post);
  const newer = posts[index - 1];
  const older = posts[index + 1];
  const pagerLink = (target, rel, label) =>
    target
      ? `<a class="news-pager__link news-pager__link--${rel}" href="${newsUrl(target)}" rel="${rel}"><span class="news-pager__label">${label}</span><span class="news-pager__title">${escapeHtml(target.title)}</span></a>`
      : '<span class="news-pager__link news-pager__link--empty"></span>';

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'TOP', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'お知らせ', item: '/news/' },
        { '@type': 'ListItem', position: 3, name: post.title },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      datePublished: post.date,
      articleSection: categories[post.category],
      ...(post.thumbnail && { image: `/images/${post.thumbnail.name}-${post.thumbnail.large}.webp` }),
      publisher: { '@type': 'Organization', name: '株式会社 木乃家' },
    },
  ];

  return {
    post_title: escapeHtml(post.title),
    post_excerpt: escapeHtml(post.excerpt),
    post_date: displayDate(post.date),
    post_datetime: post.date,
    post_category: escapeHtml(categories[post.category]),
    post_category_slug: post.category,
    post_eyecatch: post.thumbnail
      ? `<figure class="news-article__eyecatch">${thumbnailImg(post.thumbnail, '(min-width: 1024px) 960px, 100vw', ' fetchpriority="high"')}</figure>`
      : '',
    // body is trusted HTML, like post_content in a CMS
    post_body: post.body.join('\n'),
    post_pager: `${pagerLink(older, 'prev', '前の記事')}${pagerLink(newer, 'next', '次の記事')}`,
    post_jsonld: JSON.stringify(jsonLd, null, 2).replace(/</g, '\\u003c'),
  };
}
