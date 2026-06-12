# Trail des Tectosages — site officiel

Site vitrine de l'évènement, construit avec [Astro](https://astro.build) et
déployé automatiquement sur GitHub Pages à chaque `git push` sur `main`.

## 🚀 Démarrer le site en local

Prérequis : [Node.js](https://nodejs.org) **22.12 ou plus récent**.

```sh
npm install     # une seule fois, pour installer les dépendances
npm run dev     # démarre le site sur http://localhost:4321
```

Le site se recharge tout seul à chaque fichier modifié. `Ctrl + C` pour arrêter.

| Commande          | Action                                              |
| :---------------- | :-------------------------------------------------- |
| `npm run dev`     | Serveur local de développement (`localhost:4321`)   |
| `npm run build`   | Construit le site de production dans `dist/`        |
| `npm run preview` | Prévisualise le contenu de `dist/` avant de publier |

## ✏️ Modifier le site (sans toucher au code)

Tout le contenu vit dans **deux endroits** :

### 1. Les paramètres globaux et les textes — [`src/content/event.yaml`](src/content/event.yaml)

C'est **LE** fichier de configuration. On y change :

- **la date de l'évènement** (`date: 2026-10-17`) — toutes les dates affichées
  sur le site (« Samedi 17 octobre 2026 », « SAM. 17 OCT. 2026 », l'année du
  copyright…) sont calculées automatiquement à partir de cette seule ligne ;
- **le numéro d'édition** (`edition: 1` → « ÉDITION I ») ;
- le lien d'inscription, l'email de contact, le fond de carte ;
- tous les textes : menu, accueil, histoire, banquet, engagement,
  infos pratiques (horaires de la journée), partenaires, pied de page.

Dans n'importe quel texte du fichier, on peut écrire `{dateFull}`, `{year}`,
`{edition}`, `{dateBadge}`… : le site les remplace par la vraie valeur
(la liste complète des jetons est en haut du fichier).

### 2. Les épreuves — [`src/content/races/`](src/content/races)

Un fichier Markdown par épreuve :

| Fichier               | Épreuve                              |
| :-------------------- | :----------------------------------- |
| `defi-copillos.md`    | Le Défi de Copillos (6 boucles)      |
| `oppidum.md`          | La Boucle de l'Oppidum               |
| `oppi-dog.md`         | L'Oppi-dog (canicross)               |
| `marche-des-sages.md` | La Marche des Sages                  |
| `tectokids.md`        | La Tectokids                         |

Chaque fichier contient : l'ordre d'affichage, le titre, la description,
l'heure de départ, la difficulté (1 à 5), et les **valeurs officielles**
`distance` (km) et `ascent` (D+ en mètres). Pour le Défi, la liste
`segments:` décrit les 6 boucles (nom, temps limite, distance, couleur).

> Si on enlève `distance`/`ascent` d'un fichier, le site recalcule ces
> chiffres à partir de la trace GPX.

### 3. Les traces GPX — [`public/traces/`](public/traces)

Chaque épreuve affiche la trace GPX qui porte **le même nom que son fichier
Markdown** : `oppidum.md` ↔ `public/traces/oppidum.gpx`, etc.

**Pour remplacer une trace** (quand les tracés définitifs seront prêts) :
écraser simplement le fichier `.gpx` correspondant, en gardant le même nom.

Cas particulier, le **Défi de Copillos** : sa trace contient 6 boucles
(6 `<trk>` dans un seul fichier GPX). Le script
[`scripts/generate-defi-gpx.py`](scripts/generate-defi-gpx.py) la fabrique
en assemblant les boucles sources de [`scripts/gpx-sources/`](scripts/gpx-sources) :

```sh
python3 scripts/generate-defi-gpx.py
```

⚠️ La trace de la **Boucle du Golf** n'existe pas encore : la boucle
Pechbusque sert de remplacement en attendant (voir le commentaire en haut
du script).

### 4. Les images et la vidéo — [`public/images/`](public/images) et [`public/video/`](public/video)

- `public/video/hero.mp4` : la vidéo plein écran de l'accueil
  (et `public/images/hero-poster.jpg` son image d'attente) ;
- `public/images/logo-*.png` : les logos des partenaires (référencés dans
  `event.yaml`, section `supporters`).

### 5. Les affiches imprimables — [`public/affiche/`](public/affiche)

Deux variantes de l'affiche officielle, tout-en-un dans ce dossier
(HTML + photos + logos + QR dans `assets/`) :

| URL                  | Fichier                             | Variante                       |
| :------------------- | :---------------------------------- | :----------------------------- |
| `/trail-vt/affiche1` | `public/affiche/affiche1/index.html` | Fond courbes de niveau (DEM)   |
| `/trail-vt/affiche2` | `public/affiche/affiche2/index.html` | Fond carte topo (OpenTopoMap)  |

**Pour générer le PDF à envoyer à l'imprimeur** : ouvrir l'URL dans Chrome,
`Cmd + P` → Destination « Enregistrer au format PDF », papier A4, marges
« Aucune », cocher « Imprimer les arrière-plans ». Le PDF A4 obtenu
s'agrandit en A3 ou se réduit en A5 sans aucune déformation (les formats A
gardent les mêmes proportions) — l'imprimeur s'en charge.

> ⚠️ Les textes des affiches (date, distances, QR) sont écrits **en dur**
> dans ces deux fichiers HTML : si `event.yaml` change (date, parcours…),
> penser à mettre à jour les affiches à la main.

## 🌍 Mise en ligne

Rien à faire : un `git push` sur la branche `main` déclenche le workflow
GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml))
qui construit et publie le site sur GitHub Pages :
**<https://bchamand.github.io/trail-vt>**

## 🗂 Structure du projet

```text
/
├── public/
│   ├── images/            → logos, photos
│   ├── traces/            → les GPX affichés (1 par épreuve)
│   └── video/             → vidéo d'accueil
├── scripts/
│   ├── gpx-sources/       → boucles GPX sources (Auzil, Pechbusque…)
│   └── generate-defi-gpx.py
├── src/
│   ├── content/
│   │   ├── event.yaml     → ⭐ CONFIGURATION + tous les textes
│   │   └── races/*.md     → ⭐ une épreuve par fichier
│   ├── components/        → sections de la page (code)
│   ├── lib/               → utilitaires (dates dérivées, GPX, carte)
│   ├── pages/index.astro  → assemblage de la page
│   └── styles/global.css  → styles globaux
└── astro.config.mjs       → config Astro (URL du site, base /trail-vt)
```
