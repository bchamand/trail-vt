// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const isProd = process.env.NODE_ENV === 'production';
const base = isProd ? '/trail-vt' : '';

export default defineConfig({
  site: 'https://bchamand.github.io',
  base: isProd ? '/trail-vt' : '/',
  // Raccourcis vers les affiches imprimables (public/affiche/).
  redirects: {
    '/affiche1': `${base}/affiche/affiche1/index.html`,
    '/affiche2': `${base}/affiche/affiche2/index.html`,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
