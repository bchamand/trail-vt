export interface RaceLoop {
  label: string;
  distance: string;
  ascent: string;
  timeLimit: string;
  value: string;
  status: string;
  color: string;
}

export interface Race {
  id: string;
  title: string;
  type: string;
  desc: string;
  gpx: string;
  icon: string;
  distance: string;
  ascent: string;
  startTime: string;
  duration?: string;
  timed?: boolean;
  loops?: RaceLoop[];
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
    loops: [
      {
        label: 'Boucle 1',
        distance: '12 km',
        ascent: 'D+ 400 m',
        timeLimit: '1h45',
        value: 'L\'esprit de conquête',
        status: 'Qualificative',
        color: '#B85A3E',
      },
      {
        label: 'Boucle 2',
        distance: '6 km',
        ascent: 'D+ 220 m',
        timeLimit: '1h00',
        value: 'Le courage',
        status: 'Qualificative',
        color: '#8B9D7A',
      },
      {
        label: 'Boucle 3',
        distance: '6 km',
        ascent: 'D+ 220 m',
        timeLimit: '1h00',
        value: 'La bravoure',
        status: 'Qualificative',
        color: '#5D6B4F',
      },
      {
        label: 'Boucle 4',
        distance: '6 km',
        ascent: 'D+ 220 m',
        timeLimit: '1h00',
        value: 'L\'honneur',
        status: 'Classement final',
        color: '#C8A555',
      },
    ],
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
