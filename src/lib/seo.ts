import type { EventView } from './event';

/** Retire le HTML et normalise les espaces — pour les balises meta / JSON-LD. */
export function stripHtml(input: string): string {
  return String(input)
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Décalage horaire de Paris (« +02:00 ») à la date donnée — gère l'heure d'été. */
function parisOffset(date: Date): string {
  const s = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris',
    timeZoneName: 'longOffset',
  }).format(date);
  const m = s.match(/GMT([+-]\d{2}:\d{2})/);
  return m ? m[1] : '+01:00';
}

/** « 15h00 » → « 15:00 », « 9 h » → « 09:00 ». */
function toHHMM(time: string): string {
  const m = String(time).match(/(\d{1,2})\s*h\s*(\d{0,2})/i);
  if (!m) return '00:00';
  return `${m[1].padStart(2, '0')}:${(m[2] || '0').padStart(2, '0')}`;
}

type RaceLike = { title: string; description: string; startTime: string };

interface BuildArgs {
  event: EventView;
  races: RaceLike[];
  site: string; // ex. « https://www.traildestectosages.fr/ »
  registrationUrl: string;
}

/**
 * Données structurées Schema.org de la page d'accueil : un @graph reliant
 * l'organisation, le site et l'évènement sportif (une sous-épreuve par course
 * visible). Émis en JSON-LD statique dans le <head> → lisible dès le 1er crawl.
 */
export function buildHomeStructuredData({ event, races, site, registrationUrl }: BuildArgs) {
  const base = site.replace(/\/+$/, '');
  const orgId = `${base}/#organization`;
  const websiteId = `${base}/#website`;
  const placeId = `${base}/#place`;
  const image = `${base}/images/hero-poster.jpg`;
  const day = event.date.toISOString().slice(0, 10); // AAAA-MM-JJ
  const offset = parisOffset(event.date);

  const points = event.practicalInfo.meetingPlace.points;
  const venue = points.find((p) => p.kind === 'venue') ?? points[0];

  const organization = {
    '@type': ['Organization', 'SportsOrganization'],
    '@id': orgId,
    name: `Association ${event.name}`,
    url: `${base}/`,
    logo: `${base}/favicon.svg`,
    email: event.urls.contactEmail,
    ...(event.urls.instagram ? { sameAs: [event.urls.instagram] } : {}),
  };

  const website = {
    '@type': 'WebSite',
    '@id': websiteId,
    name: event.name,
    url: `${base}/`,
    inLanguage: 'fr-FR',
    publisher: { '@id': orgId },
  };

  const place = {
    '@type': 'Place',
    '@id': placeId,
    name: venue.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: venue.name,
      addressLocality: 'Vieille-Toulouse',
      postalCode: '31320',
      addressRegion: 'Haute-Garonne',
      addressCountry: 'FR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: venue.lat, longitude: venue.lng },
  };

  // Une sous-épreuve par course visible, avec son heure de départ précise.
  const subEvent = races.map((r) => ({
    '@type': 'SportsEvent',
    name: r.title,
    description: stripHtml(r.description),
    sport: 'Trail',
    startDate: `${day}T${toHHMM(r.startTime)}:00${offset}`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@id': placeId },
    organizer: { '@id': orgId },
  }));

  const sportsEvent = {
    '@type': 'SportsEvent',
    '@id': `${base}/#event`,
    name: `${event.name} ${event.year}`,
    description: stripHtml(event.seoDescription ?? event.description),
    sport: 'Trail',
    startDate: day,
    endDate: day,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: [image],
    url: `${base}/`,
    organizer: { '@id': orgId },
    location: place,
    offers: {
      '@type': 'Offer',
      url: registrationUrl,
      availability: 'https://schema.org/InStock',
      category: 'Inscription',
    },
    subEvent,
  };

  return { '@context': 'https://schema.org', '@graph': [organization, website, sportsEvent] };
}
