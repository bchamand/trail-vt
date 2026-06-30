#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// Soumet les URLs du sitemap au protocole IndexNow (Bing, DuckDuckGo, Qwant,
// Ecosia, Yandex, Seznam…) à la fin du déploiement.
//
// Aucun compte, aucune authentification : la clé IndexNow est PUBLIQUE, hébergée
// à la racine du site dans public/<clé>.txt pour prouver la propriété du domaine.
// Soumettre à un seul endpoint suffit — il est partagé avec tous les moteurs
// participants.
//
// La clé est son unique source de vérité : le fichier public/<clé>.txt, dont le
// NOM = le CONTENU. Pour la régénérer :  openssl rand -hex 16  →  remplacer le
// fichier. Rien d'autre à modifier (ce script la redécouvre tout seul).
//
// Usage :  node scripts/indexnow.mjs [--dry-run] [url1 url2 …]
//          (sans URL : lit les <loc> de public/sitemap.xml)
// ─────────────────────────────────────────────────────────────────────────
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ENDPOINT = 'https://api.indexnow.org/indexnow';
const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

// Trouve le fichier public/<clé>.txt dont le nom (hex) == le contenu.
async function findKey() {
  for (const f of await readdir(publicDir)) {
    const m = f.match(/^([a-f0-9]{8,128})\.txt$/i);
    if (m && (await readFile(join(publicDir, f), 'utf8')).trim() === m[1]) return m[1];
  }
  return null;
}

async function readSitemapUrls() {
  const xml = await readFile(join(publicDir, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const cliUrls = args.filter((a) => a.startsWith('http'));
const urlList = cliUrls.length ? cliUrls : await readSitemapUrls();

const key = await findKey();
if (!key) {
  console.log('ℹ️  Aucune clé IndexNow (public/<clé>.txt) trouvée — étape ignorée.');
  process.exit(0);
}
if (!urlList.length) {
  console.log('ℹ️  Aucune URL à soumettre — étape ignorée.');
  process.exit(0);
}

const host = new URL(urlList[0]).host;
const payload = { host, key, keyLocation: `https://${host}/${key}.txt`, urlList };

if (dryRun) {
  console.log('IndexNow (dry-run) — requête qui serait envoyée :');
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});
// Codes IndexNow (cf. FAQ) : 200 OK · 202 accepté (vérif. en attente) ·
// 400 mal formé · 403 clé invalide/introuvable · 422 non traitable · 429 quota.
if (res.status === 200 || res.status === 202) {
  const note = res.status === 202 ? ' (acceptée, vérification en attente)' : '';
  console.log(`✓ IndexNow : ${urlList.length} URL(s) soumise(s) — HTTP ${res.status}${note}`);
} else if (res.status === 429) {
  console.warn(`⚠️  IndexNow : quota atteint (429) — Retry-After : ${res.headers.get('retry-after') ?? 'n/a'}`);
} else {
  // Best-effort : on n'échoue pas le déploiement pour une notification.
  console.warn(`⚠️  IndexNow → HTTP ${res.status} : ${await res.text()}`);
}
