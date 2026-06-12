import type { CollectionEntry } from 'astro:content';

type EventData = CollectionEntry<'event'>['data'];

/**
 * Données de l'évènement enrichies des champs dérivés automatiquement
 * depuis `date` et `edition` (définis dans src/content/event.yaml).
 */
export type EventView = Omit<EventData, 'edition'> & {
  edition: string;         // « I », « II », …
  initial: string;         // première lettre du nom (médaillon du logo)
  year: number;            // 2026
  dateFull: string;        // « Samedi 17 octobre 2026 »
  dateShort: string;       // « SAM. 17 OCTOBRE »
  dateShortMobile: string; // « 17 OCT »
  dateBadge: string;       // « SAM. 17 OCT. 2026 »
  dateWeekday: string;     // « SAMEDI »
};

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export function toRoman(n: number): string {
  return ROMAN[n - 1] ?? String(n);
}

/** Formatte un nombre de km à la française : 40.1 → « 40,1 », 12 → « 12 ». */
export function fmtKm(v: number): string {
  return (Math.round(v * 10) / 10).toLocaleString('fr-FR');
}

// La date YAML est minuit UTC : on formate en UTC pour ne pas glisser de jour.
function fr(date: Date, opts: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', ...opts }).format(date);
}

export function deriveEvent(data: EventData): EventView {
  const d = data.date;
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const weekdayLong = fr(d, { weekday: 'long' });   // samedi
  const weekdayShort = fr(d, { weekday: 'short' }); // sam.
  const day = fr(d, { day: 'numeric' });
  const monthLong = fr(d, { month: 'long' });       // octobre
  const monthShort = fr(d, { month: 'short' });     // oct.
  const year = d.getUTCFullYear();

  return {
    ...data,
    edition: toRoman(data.edition),
    initial: data.name.trim().charAt(0).toUpperCase(),
    year,
    dateFull: `${cap(weekdayLong)} ${day} ${monthLong} ${year}`,
    dateShort: `${weekdayShort} ${day} ${monthLong}`.toUpperCase(),
    dateShortMobile: `${day} ${monthShort.replace(/\.$/, '')}`.toUpperCase(),
    dateBadge: `${weekdayShort} ${day} ${monthShort} ${year}`.toUpperCase(),
    dateWeekday: weekdayLong.toUpperCase(),
  };
}

/**
 * Remplace les {tokens} dans toutes les chaînes d'un objet, récursivement.
 * Permet d'écrire par ex. « — {dateBadge} / INSCRIPTIONS OUVERTES »
 * n'importe où dans event.yaml.
 */
export function expandTokens<T>(value: T, tokens: Record<string, string>): T {
  if (typeof value === 'string') {
    return value.replace(/\{(\w+)\}/g, (m, k) => tokens[k] ?? m) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map(v => expandTokens(v, tokens)) as unknown as T;
  }
  if (value instanceof Date) return value;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, expandTokens(v, tokens)]),
    ) as unknown as T;
  }
  return value;
}
