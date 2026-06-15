// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Domaine custom (apex) : le site est servi à la racine du domaine,
  // donc plus de `base: '/trail-vt'` (qui ne servait que pour bchamand.github.io/trail-vt).
  site: 'https://traildestectosages.fr',
  // L'affiche imprimable est une page du site : /affiche (et /affiche/pdf pour l'export PDF).
  vite: {
    plugins: [tailwindcss()],
  },
});
