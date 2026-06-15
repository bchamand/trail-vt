// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { readFile, writeFile, readdir } from 'node:fs/promises';

// ── Éditeur de masques d'affiche — DEV UNIQUEMENT ───────────────────────
// Sert le petit back-end de l'éditeur intégré (/affiche?edit-mask) : lister
// les photos, en importer, et réécrire les .svg de src/affiche-masks/.
// `apply: 'serve'` + `configureServer` ⇒ ça ne tourne QU'AU `astro dev`,
// jamais au build/prod (le code de l'overlay côté page est lui aussi élagué
// par `import.meta.env.DEV`).
const MASK_DIR = new URL('./src/affiche-masks/', import.meta.url);
const IMG_DIR = new URL('./public/images/', import.meta.url);
const IMG_EXT = /\.(jpe?g|png|webp|avif)$/i;
const safe = (s) => String(s || '').replace(/[^a-z0-9._-]/gi, '');
const body = (req) =>
  new Promise((res) => { const c = []; req.on('data', (x) => c.push(x)); req.on('end', () => res(Buffer.concat(c))); });
const json = (res, code, data) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };

const afficheMaskEditor = {
  name: 'affiche-mask-editor',
  apply: 'serve',
  configureServer(server) {
    // liste des photos disponibles (public/images)
    server.middlewares.use('/__mask/photos', async (_req, res) => {
      const files = (await readdir(IMG_DIR)).filter((f) => IMG_EXT.test(f)).sort();
      json(res, 200, files);
    });
    // import d'une nouvelle photo dans public/images
    server.middlewares.use('/__mask/upload', async (req, res) => {
      if (req.method !== 'POST') return json(res, 405, { error: 'POST attendu' });
      const name = safe(new URL(req.url, 'http://x').searchParams.get('name'));
      if (!IMG_EXT.test(name)) return json(res, 400, { error: 'nom/extension invalide' });
      await writeFile(new URL(name, IMG_DIR), await body(req));
      json(res, 200, { ok: true, name });
    });
    // réécriture d'un masque .svg (cadrage + zone), attributs ciblés conservés
    server.middlewares.use('/__mask/save', async (req, res) => {
      if (req.method !== 'POST') return json(res, 405, { error: 'POST attendu' });
      try {
        const { file, photo, scale, origin, points } = JSON.parse((await body(req)).toString('utf8'));
        const name = safe(file);
        if (!name.endsWith('.svg')) throw new Error('masque invalide : ' + name);
        const url = new URL(name, MASK_DIR);
        let svg = await readFile(url, 'utf8');
        if (photo != null) svg = svg.replace(/data-photo="[^"]*"/, `data-photo="${photo}"`);
        if (scale != null) svg = svg.replace(/data-scale="[^"]*"/, `data-scale="${scale}"`);
        if (origin != null) svg = svg.replace(/data-origin="[^"]*"/, `data-origin="${origin}"`);
        if (points != null) svg = svg.replace(/points="[^"]*"/, `points="${points}"`);
        await writeFile(url, svg);
        // eslint-disable-next-line no-console
        console.log(`  ✎ masque enregistré : ${name}`);
        json(res, 200, { ok: true });
      } catch (e) {
        json(res, 400, { error: String((e && e.message) || e) });
      }
    });
  },
};

export default defineConfig({
  // Domaine custom : www en version canonique (l'apex traildestectosages.fr
  // redirige vers www via GitHub Pages). Servi à la racine, donc pas de `base`.
  site: 'https://www.traildestectosages.fr',
  // L'affiche imprimable est une page du site : /affiche (et /affiche/pdf pour l'export PDF).
  // En dev, /affiche?edit-mask ouvre l'éditeur visuel des masques (voir le plugin ci-dessus).
  vite: {
    plugins: [tailwindcss(), afficheMaskEditor],
  },
});
