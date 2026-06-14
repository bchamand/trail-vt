// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  site: 'https://bchamand.github.io',
  base: isProd ? '/trail-vt' : '/',
  // L'affiche imprimable est une page du site : /affiche (et /affiche/pdf pour l'export PDF).
  vite: {
    plugins: [tailwindcss()],
  },
});
