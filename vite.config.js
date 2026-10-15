import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const root = resolve(__dirname);
const partialsDir = resolve(root, 'src/partials');

// Minimal HTML include: <!-- @include header.html {"key":"value"} -->
// {{key}} placeholders in the partial are replaced; includes may nest.
function htmlInclude() {
  const pattern = /<!--\s*@include\s+([\w./-]+)(?:\s+(\{[\s\S]*?\}))?\s*-->/g;
  const render = (html, depth = 0) => {
    if (depth > 10) throw new Error('@include nested too deeply');
    return html.replace(pattern, (_, file, json) => {
      const params = json ? JSON.parse(json) : {};
      let partial = readFileSync(resolve(partialsDir, file), 'utf8');
      partial = partial.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key) => params[key] ?? '');
      return render(partial, depth + 1);
    });
  };
  return {
    name: 'kinoka-html-include',
    transformIndexHtml: { order: 'pre', handler: (html) => render(html) },
    handleHotUpdate({ file, server }) {
      if (file.startsWith(partialsDir)) server.ws.send({ type: 'full-reload' });
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
