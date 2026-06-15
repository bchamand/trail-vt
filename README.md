# Trail des Tectosages — site officiel

Site vitrine de l'évènement, construit avec [Astro](https://astro.build) et
déployé automatiquement sur GitHub Pages à chaque `git push` sur `main` :
**<https://www.traildestectosages.fr>**

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

Tout le contenu vit dans **quelques endroits** clairement séparés.

### 1. Les paramètres globaux et les textes — [`src/content/event.yaml`](src/content/event.yaml)

C'est **LE** fichier de configuration. On y change :

- **la date de l'évènement** (`date: 2026-10-17`) — toutes les dates affichées
  sur le site (« Samedi 17 octobre 2026 », « SAM. 17 OCT. 2026 », l'année du
  copyright…) sont calculées automatiquement à partir de cette seule ligne ;
- **le numéro d'édition** (`edition: 1` → « ÉDITION I ») ;
- les **liens** (`urls:`) : le site (`website`, aussi la cible du QR de
  l'affiche), l'inscription (`registration`), l'email de contact
  (`contactEmail`), et le fond de carte (`mapStyle`) ;
- tous les **textes** : menu, accueil, histoire, banquet, engagement,
  infos pratiques (horaires de la journée), partenaires, pied de page.

Dans n'importe quel texte du fichier, on peut écrire `{dateFull}`, `{year}`,
`{edition}`, `{email}`… : le site les remplace par la vraie valeur
(la liste complète des jetons est en haut du fichier).

### 2. Les épreuves — [`src/content/races/`](src/content/races)

Un fichier Markdown par épreuve. Seules les épreuves **non masquées** sont
affichées sur le site :

| Fichier               | Épreuve                                | Affichée ?            |
| :-------------------- | :------------------------------------- | :-------------------- |
| `defi-copillos.md`    | Le Défi de Copillos (4 boucles)        | ✅ oui                |
| `oppidum.md`          | La Boucle de l'Oppidum                 | ✅ oui                |
| `oppi-dog.md`         | L'Oppi-Dog (canicross)                 | masquée (`hidden: true`) |
| `marche-des-sages.md` | La Marche des Sages                    | masquée (`hidden: true`) |
| `tectokids.md`        | La Tectokids                           | masquée (`hidden: true`) |

> Pour afficher une épreuve masquée, passer son `hidden: true` à `false`
> (ou supprimer la ligne).

Chaque fichier contient : l'ordre d'affichage, le titre, la description,
l'heure de départ, la difficulté (1 à 5), et **distance** (km) / **ascent**
(D+ en mètres). Le Défi a en plus une liste `segments:` décrivant ses
**4 boucles** (nom, temps limite, distance, D+, couleur).

**Priorité des chiffres** — la valeur écrite dans le fichier l'emporte
toujours ; si elle est absente, le site la **calcule depuis la trace GPX**.
Pour une épreuve à boucles, le total = **somme des boucles** (chaque boucle
prend sa propre valeur, ou son GPX à défaut).

### 3. Les traces GPX — [`public/traces/`](public/traces)

Chaque épreuve affiche la trace GPX qui porte **le même nom que son fichier
Markdown** : `oppidum.md` ↔ `public/traces/oppidum.gpx`, etc.

**Pour remplacer une trace** (quand les tracés définitifs seront prêts) :
écraser simplement le fichier `.gpx` correspondant, en gardant le même nom.

Cas particulier, le **Défi de Copillos** : sa trace contient 4 boucles
(4 `<trk>` dans un seul fichier GPX) — 2× Auzil + Pechbusque puis 2× Golf.
Le script [`scripts/generate-defi-gpx.py`](scripts/generate-defi-gpx.py) la
fabrique en assemblant les boucles sources de
[`scripts/gpx-sources/`](scripts/gpx-sources) :

```sh
python3 scripts/generate-defi-gpx.py
```

### 4. Les images et la vidéo — [`public/images/`](public/images) et [`public/video/`](public/video)

- `public/video/hero.mp4` : la vidéo plein écran de l'accueil
  (et `public/images/hero-poster.jpg` son image d'attente) ;
- `public/images/logo-*.png` : les logos des partenaires (référencés dans
  `event.yaml`, section `supporters`) ;
- `public/images/*.jpg` : les photos utilisées par l'affiche.

### 5. L'affiche imprimable — [`src/pages/affiche.astro`](src/pages/affiche.astro)

L'affiche **n'est plus écrite à la main** : c'est une page du site, générée à
partir de `event.yaml` (date, lieu, les épreuves marquées `poster: true`,
le **QR code** construit depuis `urls.website`, les logos partenaires…).
Modifier `event.yaml` met donc l'affiche à jour automatiquement.

Les **photos** sont détourées par des masques (voir la section suivante).

**Le PDF à imprimer est généré tout seul** : à chaque déploiement, la CI rend
l'affiche en `/affiche.pdf` (lien « Affiche de l'événement » du pied de page).
En local :

- prévisualiser l'affiche : `npm run dev` puis <http://localhost:4321/affiche> ;
- régénérer le PDF : `npm run build` puis `npm run render:affiche`
  (Playwright, écrit `dist/affiche.pdf`).

> Les routes `/affiche` (HTML) et `/affiche/pdf` (générateur) ne servent qu'à
> fabriquer le PDF : elles ne sont **pas** publiées en prod, seul
> `/affiche.pdf` l'est.

### 6. Cadrer les photos de l'affiche (éditeur visuel)

Les photos de l'affiche sont détourées par des **masques** :
[`src/affiche-masks/`](src/affiche-masks) contient un `.svg` par photo, qui
décrit sa zone (un polygone) et son cadrage — `data-photo` (l'image utilisée),
`data-scale` (le zoom) et `data-origin` (le recadrage). Pour régler tout ça à
la souris plutôt qu'à la main, un petit éditeur visuel local est fourni :

```sh
npm run affiche:editor   # ouvre http://localhost:4330
```

Dans l'interface : on choisit un masque et une photo (ou on **importe** une
nouvelle image dans `public/images/`), on **déplace** la photo en la glissant,
on **zoome** à la molette, et — en cochant « Éditer la zone » — on déplace les
sommets du contour. Le bouton **Enregistrer** réécrit le fichier `.svg`.

> Le cadrage est fidèle à l'affiche (WYSIWYG), mais l'éditeur montre la zone en
> polygone droit alors que l'affiche en lisse les bords. Après enregistrement,
> rafraîchir `/affiche` (`npm run dev`) pour voir le rendu final.

## 🌍 Mise en ligne

Rien à faire : un `git push` sur la branche `main` déclenche le workflow
GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml))
qui construit le site, **génère le PDF de l'affiche** (le build échoue s'il
échoue, pour ne jamais publier sans affiche), puis déploie sur GitHub Pages.

Le site est servi sur le domaine **<https://www.traildestectosages.fr>**
(l'adresse nue `traildestectosages.fr` redirige vers le `www`).

## 🗂 Structure du projet

```text
/
├── public/
│   ├── images/            → photos + logos des partenaires
│   ├── traces/            → les GPX affichés (1 par épreuve, même nom que le .md)
│   └── video/             → vidéo d'accueil
├── scripts/               → outils (lancés à la main ou en CI, hors site)
│   ├── gpx-sources/          → boucles GPX sources (Auzil+Pechbusque, Golf…)
│   ├── generate-defi-gpx.py  → assemble la trace du Défi (4 boucles)
│   ├── render-affiche-pdf.mjs → génère dist/affiche.pdf (Playwright, en CI)
│   └── affiche-editor.mjs     → éditeur visuel des photos de l'affiche
├── src/
│   ├── content/
│   │   ├── event.yaml     → ⭐ CONFIGURATION + tous les textes
│   │   └── races/*.md     → ⭐ une épreuve par fichier
│   ├── content.config.ts  → schéma de validation du contenu
│   ├── affiche-masks/     → masques de cadrage des photos de l'affiche (.svg)
│   ├── components/        → sections de la page (code)
│   ├── layouts/           → gabarit HTML commun
│   ├── lib/               → utilitaires (dates dérivées, GPX, carte)
│   ├── pages/
│   │   ├── index.astro            → la page d'accueil
│   │   ├── affiche.astro          → l'affiche (source du PDF, dev/CI)
│   │   ├── affiche/pdf.astro      → générateur PDF côté navigateur (dev/CI)
│   │   └── mentions-legales.astro → mentions légales + confidentialité
│   ├── scripts/           → scripts client (carte, profil altimétrique)
│   └── styles/global.css  → styles globaux
├── astro.config.mjs       → config Astro (site = www.traildestectosages.fr)
└── .github/workflows/     → déploiement GitHub Pages (deploy.yml)
```
