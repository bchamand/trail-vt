#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// Notifie l'API Google Indexing des URLs (re)publiées, à la fin du déploiement.
//
// ⚠️  LIMITE OFFICIELLE — à lire avant de l'activer :
// L'API Indexing de Google ne couvre OFFICIELLEMENT que les pages de type
// JobPosting et BroadcastEvent (diffusion en direct). Pour un site classique,
// Google peut tout simplement ignorer ces requêtes. Le canal fiable et
// recommandé reste : sitemap.xml + Search Console (sitemap soumis + « Demander
// une indexation »). Ce script est un COMPLÉMENT « best effort ».
//
// Il ne s'exécute QUE si une clé est fournie ; sinon il ne fait rien (no-op),
// ce qui permet de le laisser dans la CI sans risque.
//
// Pré-requis pour l'activer :
//   1. Projet Google Cloud → activer « Indexing API ».
//   2. Créer un compte de service + une clé JSON.
//   3. Dans Search Console, ajouter l'e-mail du compte de service comme
//      PROPRIÉTAIRE (Owner) de la propriété.
//   4. Fournir la clé JSON via la variable d'environnement :
//        GOOGLE_INDEXING_KEY       → contenu JSON de la clé (secret CI), ou
//        GOOGLE_INDEXING_KEY_FILE  → chemin vers le fichier JSON (usage local).
//
// Usage :  node scripts/google-index.mjs [url1 url2 …]
//          (sans argument : lit les <loc> de public/sitemap.xml)
// ─────────────────────────────────────────────────────────────────────────
import { createSign } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SCOPE = 'https://www.googleapis.com/auth/indexing';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const PUBLISH_URL = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

const b64url = (s) => Buffer.from(s).toString('base64url');

async function loadKey() {
  const inline = process.env.GOOGLE_INDEXING_KEY;
  if (inline && inline.trim()) return JSON.parse(inline);
  const file = process.env.GOOGLE_INDEXING_KEY_FILE;
  if (file) return JSON.parse(await readFile(file, 'utf8'));
  return null;
}

// JWT signé RS256 par le compte de service → jeton d'accès OAuth2 (zéro dépendance).
async function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(
    JSON.stringify({ iss: key.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  const signature = signer.sign(key.private_key).toString('base64url');
  const jwt = `${header}.${claim}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`OAuth token ${res.status} : ${await res.text()}`);
  return (await res.json()).access_token;
}

async function readSitemapUrls() {
  const here = dirname(fileURLToPath(import.meta.url));
  const xml = await readFile(join(here, '..', 'public', 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function publish(token, url) {
  const res = await fetch(PUBLISH_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  });
  return { url, ok: res.ok, status: res.status, body: await res.text() };
}

const key = await loadKey();
if (!key) {
  console.log('ℹ️  GOOGLE_INDEXING_KEY absent — notification Google Indexing ignorée (no-op).');
  process.exit(0);
}

const args = process.argv.slice(2);
const urls = args.length ? args : await readSitemapUrls();
const token = await getAccessToken(key);

let ok = 0;
for (const url of urls) {
  const r = await publish(token, url);
  if (r.ok) {
    ok++;
    console.log(`✓ ${url}`);
  } else {
    console.error(`✗ ${url} → ${r.status} ${r.body}`);
  }
}
console.log(`Google Indexing API : ${ok}/${urls.length} URL(s) notifiée(s).`);
