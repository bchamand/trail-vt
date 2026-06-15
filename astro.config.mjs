// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Domaine custom : www en version canonique (l'apex traildestectosages.fr
  // redirige vers www via GitHub Pages). Servi à la racine, donc pas de `base`.
  site: 'https://www.traildestectosages.fr',
  // L'affiche imprimable est une page du site : /affiche (et /affiche/pdf pour l'export PDF).
  vite: {
    plugins: [tailwindcss()],
  },
});
