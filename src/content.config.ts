import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const segment = z.object({
  label: z.string(),
  value: z.string(),
  status: z.string(),
  timeLimit: z.string(),
  color: z.string(),
  // Valeurs officielles affichées ; à défaut, calculées depuis la trace GPX.
  distance: z.number().positive().optional(), // km
  ascent: z.number().int().nonnegative().optional(), // D+ en m
});

const races = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/races' }),
  schema: z.object({
    order: z.number().int(),
    hidden: z.boolean().default(false), // true → l'épreuve n'apparaît pas sur le site
    title: z.string(),
    type: z.string(),
    description: z.string(),
    startTime: z.string(),
    difficulty: z.number().int().min(1).max(5),
    timed: z.boolean().default(true),
    unit: z.string().default('KM'),
    color: z.string().default('#d4a574'),
    // Valeurs officielles affichées ; à défaut, calculées depuis la trace GPX.
    distance: z.number().positive().optional(), // km
    ascent: z.number().int().nonnegative().optional(), // D+ en m
    segments: z.array(segment).optional(),
  }),
});

const link = z.object({ label: z.string(), href: z.string() });

const event = defineCollection({
  loader: file('src/content/event.yaml'),
  schema: z.object({
    name: z.string(),
    nameShort: z.string(),
    nameEmphasis: z.string(),
    edition: z.number().int().min(1), // 1 → « ÉDITION I »
    date: z.coerce.date(), // AAAA-MM-JJ ; toutes les variantes affichées en dérivent
    location: z.string(),
    locationShort: z.string(),
    locationCity: z.string(),
    tagline: z.string(),
    description: z.string(),
    heroMedia: z.string(),
    mapStyle: z.string().default('dark-matter'),
    urls: z.object({
      registration: z.string().url(),
      contactEmail: z.string(),
      instagram: z.string().optional(),
    }),
    nav: z.array(link),
    ctaLabel: z.string(),
    heroCtaLabel: z.string(),
    stats: z.array(z.object({ big: z.string(), small: z.string() })),
    racesSection: z.object({
      label: z.string(),
      titleLine1: z.string(),
      titleLine2: z.string(),
      tagline: z.string().optional(), // accroche facultative
    }),
    storytelling: z.object({
      label: z.string(),
      title: z.string(),
      titleEmphasis: z.string(),
      pillars: z.array(z.object({ n: z.string(), title: z.string(), body: z.string() })),
    }),
    banquet: z.object({
      label: z.string(),
      titleLine1: z.string(),
      titleEmphasis: z.string(),
      titleLine2: z.string(),
      body: z.string(),
      cta: z.string(),
      ctaUrl: z.string().url(),
      imagePlaceholder: z.string(),
      // Lignes de soirée ajoutées au déroulé de la journée (généré auto).
      schedule: z.array(z.object({ time: z.string(), title: z.string() })),
    }),
    engagement: z.object({
      label: z.string(),
      titleLine1: z.string(),
      titleLine2: z.string(),
      titleEmphasis: z.string(),
      body: z.array(z.string()),
      logo: z.string(),
      logoAlt: z.string(),
      stats: z.array(z.object({ big: z.string(), small: z.string() })).optional(),
    }),
    practicalInfo: z.object({
      label: z.string(),
      titleLine1: z.string(),
      titleEmphasis: z.string(),
      tagline: z.string(),
      // « Fiche » du point de rencontre : remplit la carte Lieu de rencontre
      // ET ajoute son ouverture au déroulé de la journée (via time/scheduleLabel).
      meetingPlace: z.object({
        label: z.string(),
        title: z.string(),
        address: z.string(),
        accessNote: z.string(),
        infoTiles: z.array(z.object({ key: z.string(), value: z.string() })),
        time: z.string(),          // ex. « 13h00 » — ouverture / retrait des dossards
        scheduleLabel: z.string(), // ex. « Retrait des dossards · ouverture du village »
      }),
      // Le déroulé est généré automatiquement (point de rencontre + chaque
      // épreuve visible + banquet, triés par heure) : seul le titre est ici.
      schedule: z.object({
        label: z.string(),
      }),
    }),
    supporters: z.object({
      label: z.string(),
      titleLine1: z.string(),
      titleEmphasis: z.string(),
      body: z.string(),
      partners: z.array(z.object({
        name: z.string(),
        sub: z.string(),
        logo: z.string(),
      })),
    }),
    cta: z.object({
      label: z.string(),
      titleLine1: z.string(),
      titleEmphasis: z.string(),
      titleSuffix: z.string(),
      button: z.string(),
    }),
    footer: z.object({
      legal: z.string(),
      eventLinks: z.array(link),
      contactLinks: z.array(link),
      legalLinks: z.array(link),
      featuredPartner: z.object({
        label: z.string(),
        name: z.string(),
        sub: z.string(),
        logo: z.string(),
        logoAlt: z.string(),
      }).optional(),
    }),
  }),
});

export const collections = { races, event };
