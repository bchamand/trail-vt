// ════════════════════════════════════════════════════════════════════════
// Génère le PDF de l'affiche en mode « headless » — utilisé par la CI.
//
// Principe : on sert le site déjà construit (dist) avec `astro preview`, on
// ouvre /affiche/pdf dans un Chromium sans interface, on laisse la page faire
// EXACTEMENT la même capture que pour un visiteur (relief WebGL → snapdom →
// jsPDF), puis on récupère le PDF que la page expose sur `window.__affichePdf`
// et on l'écrit dans dist/affiche.pdf (déployé tel quel avec le site).
//
// Lancer après `npm run build` :  node scripts/render-affiche-pdf.mjs
// ════════════════════════════════════════════════════════════════════════
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist', 'affiche.pdf');
const PORT = 4399;
const NAV_TIMEOUT = 60_000; // chargement initial de la page
const GEN_TIMEOUT = 120_000; // capture complète (relief + polices + snapdom + jsPDF)

const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');

// Démarre `astro preview` et résout l'URL servie (base path inclus) dès qu'elle apparaît.
function startPreview() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['run', 'preview', '--', '--port', String(PORT)], {
      cwd: ROOT,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    const onData = (buf) => {
      out += stripAnsi(buf.toString());
      const m = out.match(/http:\/\/(?:localhost|127\.0\.0\.1):\d+\/[^\s]*/);
      if (m) resolve({ proc, baseUrl: m[0].replace(/\/?$/, '/') });
    };
    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);
    proc.on('exit', (code) => reject(new Error(`astro preview a quitté (code ${code}) :\n${out}`)));
    setTimeout(() => reject(new Error(`astro preview : démarrage trop long :\n${out}`)), 30_000);
  });
}

let preview;
let browser;
try {
  preview = await startPreview();
  const pageUrl = preview.baseUrl + 'affiche/pdf';
  console.log('[affiche] preview prêt →', pageUrl);

  browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      // WebGL en headless/CI sans GPU : rendu logiciel via SwiftShader
      '--enable-unsafe-swiftshader',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--ignore-gpu-blocklist',
    ],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1600 }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error') console.log('  [page]', m.text()); });
  page.on('pageerror', (e) => console.log('  [pageerror]', e.message));

  await page.goto(pageUrl, { waitUntil: 'load', timeout: NAV_TIMEOUT });

  // La page pose le PDF (data URI) sur window.__affichePdf une fois la capture finie.
  try {
    await page.waitForFunction(
      "typeof window.__affichePdf === 'string' && window.__affichePdf.length > 1000",
      { timeout: GEN_TIMEOUT },
    );
  } catch (e) {
    const veil = await page.evaluate(() => {
      const o = document.getElementById('xover');
      return o ? o.textContent : '(pas de voile)';
    }).catch(() => '(illisible)');
    throw new Error(`PDF non généré (${e.message}). Message du voile : « ${veil} »`);
  }

  const dataUri = await page.evaluate(() => window.__affichePdf);
  const base64 = dataUri.slice(dataUri.indexOf('base64,') + 'base64,'.length);
  const bytes = Buffer.from(base64, 'base64');
  await writeFile(OUT, bytes);
  console.log(`[affiche] PDF écrit → ${OUT} (${Math.round(bytes.length / 1024)} Ko)`);
} finally {
  if (browser) await browser.close().catch(() => {});
  if (preview?.proc) preview.proc.kill('SIGTERM');
}
