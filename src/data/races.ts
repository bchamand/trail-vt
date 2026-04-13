export interface Race {
  id: string;
  title: string;
  type: string;
  desc: string;
  gpx: string;
  icon: string;
  /** Distance officielle en km (remplacée par la valeur GPX si disponible) */
  distance: string;
  /** Dénivelé positif officiel */
  ascent: string;
  /** Heure de départ */
  startTime: string;
  /** Durée/temps limite */
  duration?: string;
  /** Chronométré / non chronométré */
  timed?: boolean;
}

export const races: Race[] = [
  {
    id: 'defi-copilos',
    title: 'Le Défi de Copilos',
    type: 'Course par élimination',
    desc: 'Sur les pas du dernier chef gaulois des Tectosages. 1 boucle de 12 km puis 3 boucles de 6 km, chaque boucle dans un temps imparti. Seuls les dignes héritiers iront au bout et décrocheront le statut d\'« Héritier de Copilos ».',
    gpx: '/traces/defi-copilos.gpx',
    icon: '🔥',
    distance: '32 km',
    ascent: 'D+ 1100 m',
    startTime: '15h45',
    duration: 'Fin 20h45',
    timed: true,
  },
  {
    id: 'oppidum',
    title: 'La Boucle de l\'Oppidum',
    type: 'Trail chronométré',
    desc: 'Une boucle de 12 km à travers les coteaux de l\'ancienne capitale des Volques Tectosages. Chronométrée, avec classement final.',
    gpx: '/traces/oppidum.gpx',
    icon: '🏃',
    distance: '12 km',
    ascent: 'D+ 400 m',
    startTime: '16h15',
    duration: 'Fin 18h30',
    timed: true,
  },
  {
    id: 'oppi-dog',
    title: 'La Boucle de l\'Oppi-dog',
    type: 'Canicross',
    desc: 'Le format court du Trail des Tectosages en duo avec votre compagnon à quatre pattes. 6 km chronométrés sur les sentiers de Vieille-Toulouse.',
    gpx: '/traces/oppi-dog.gpx',
    icon: '🐕',
    distance: '6 km',
    ascent: 'D+ 180 m',
    startTime: '16h30',
    duration: 'Fin 17h30',
    timed: true,
  },
  {
    id: 'randonnee-sages',
    title: 'La Randonnée des Sages',
    type: 'Marche / Randonnée',
    desc: 'Un parcours non chronométré pour découvrir les paysages et le patrimoine des coteaux à son propre rythme.',
    gpx: '/traces/randonnee-sages.gpx',
    icon: '🚶',
    distance: '6 km',
    ascent: 'D+ 180 m',
    startTime: '16h30',
    duration: 'Fin 18h00',
    timed: false,
  },
  {
    id: 'tectokids',
    title: 'La Tectokids',
    type: 'Course enfants',
    desc: 'Les futurs guerriers tectosages se lancent sur un parcours adapté. Des boucles de 1 à 3 km avec classement pour vivre l\'aventure en famille.',
    gpx: '/traces/tectokids.gpx',
    icon: '🌟',
    distance: '1 à 3 km',
    ascent: '',
    startTime: '18h00',
    duration: 'Fin 19h00',
    timed: true,
  },
];
