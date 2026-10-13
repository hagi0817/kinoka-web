// OGP image (public/ogp.jpg, 1200x630) from scripts/ogp/ogp.html.
// Needs ImageMagick (same photo grade as build-images.sh), Playwright with Chromium, and network access for Google Fonts.
// Usage: npm run ogp [-- /path/to/original/photos]   (global Playwright: NODE_PATH=$(npm root -g) npm run ogp)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2] ?? '/mnt/project-files/kinoka/photos/original';
const work = mkdtempSync(join(tmpdir(), 'kinoka-ogp-'));

try {
  copyFileSync(join(root, 'scripts/ogp/ogp.html'), join(work, 'ogp.html'));
  // Figma photo filter, as in build-images.sh grade()
  execFileSync('convert', [join(src, 'P01.png'), '-modulate', '100,85,100', '-channel', 'R', '-evaluate', 'multiply', '1.025',
    '-channel', 'B', '-evaluate', 'multiply', '0.965', '+channel', '-fx', 'u - 0.1*pow(u,4)', '-strip', join(work, 'photo.png')]);

  // Playwright is not a project dependency: a local or global install (NODE_PATH=$(npm root -g)) is used
  const { chromium } = createRequire(import.meta.url)('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(pathToFileURL(join(work, 'ogp.html')).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(work, 'ogp.png') });
  await browser.close();

  execFileSync('convert', [join(work, 'ogp.png'), '-quality', '85', '-strip', join(root, 'public/ogp.jpg')]);
  console.log('public/ogp.jpg written');
} finally {
  rmSync(work, { recursive: true, force: true });
}
