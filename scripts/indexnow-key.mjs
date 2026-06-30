#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// Génère une clé IndexNow et son fichier de vérification public/<clé>.txt.
//
// Conforme à la spec (indexnow.org/faq) : clé de 8 à 128 caractères parmi
// [a-zA-Z0-9-]. On utilise 32 caractères hexadécimaux aléatoires. Le fichier
// porte le NOM de la clé et ne contient QUE la clé ; il doit être servi à la
// RACINE du site (https://<domaine>/<clé>.txt) pour prouver la propriété.
//
// Une seule clé doit exister à la fois :
//   npm run indexnow:key            → si une clé existe déjà, l'affiche et s'arrête
//   npm run indexnow:key -- --force → en génère une nouvelle et supprime l'ancienne
// ─────────────────────────────────────────────────────────────────────────
import { randomBytes } from 'node:crypto';
import { readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const force = process.argv.includes('--force');

// Fichiers public/<clé>.txt valides (nom [a-zA-Z0-9-]{8,128} == contenu).
async function existingKeys() {
  const found = [];
  for (const f of await readdir(publicDir)) {
    const m = f.match(/^([a-zA-Z0-9-]{8,128})\.txt$/);
    if (m && (await readFile(join(publicDir, f), 'utf8')).trim() === m[1]) found.push(m[1]);
  }
  return found;
}

const existing = await existingKeys();

if (existing.length && !force) {
  console.log(`Une clé IndexNow existe déjà : ${existing[0]}`);
  console.log(`Fichier : public/${existing[0]}.txt`);
  console.log('Pour en régénérer une : npm run indexnow:key -- --force');
  process.exit(0);
}

// --force : retirer les anciennes clés avant d'en créer une nouvelle.
for (const old of existing) {
  await rm(join(publicDir, `${old}.txt`));
  console.log(`✗ ancienne clé supprimée : public/${old}.txt`);
}

const key = randomBytes(16).toString('hex'); // 32 caractères hexadécimaux
await writeFile(join(publicDir, `${key}.txt`), key); // contenu = la clé, sans saut de ligne

console.log(`✓ Clé IndexNow générée : ${key}`);
console.log(`✓ Fichier créé         : public/${key}.txt`);
console.log('');
console.log('Prochaines étapes :');
console.log('  1. Commit + push → le fichier sera servi à la racine du site.');
console.log('  2. La CI soumet les URLs à chaque déploiement (job notify-search-engines).');
console.log('  3. Soumission manuelle quand tu veux : npm run indexnow');
