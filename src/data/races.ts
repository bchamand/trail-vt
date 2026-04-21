export interface RaceLoop {
  roman: string;      // I, II, III, IV
  label: string;      // « Conquête »
  distance: string;   // "12 km"
  ascent: string;     // "+400 m"
  timeLimit: string;  // "1h45"
  value: string;      // "L'esprit de conquête"
  status: string;     // "Qualificative"
  color: string;
}

export interface Race {
  id: string;
  roman: string;          // I, II, III, IV, V
  title: string;          // e.g. "DÉFI DE COPILOS"
  type: string;           // short pill label ("L'épreuve reine")
  desc: string;           // paragraph description
  gpx: string;
  dist: string;           // "30"
  unit: string;           // "KM"
  dplus: string;          // "1100" or "—"
  startTime: string;      // "15h45"
  diff: number;           // 1..5
  timed?: boolean;
  loops?: RaceLoop[];
}

export const races: Race[] = [
  {
    id: 'defi-copilos',
    roman: 'I',
    title: 'DÉFI DE COPILOS',
    type: "L'épreuve reine",
    desc: "4 boucles (12+6+6+6 km), qualification ou élimination à chaque passage. Seuls les Héritiers franchiront la ligne.",
    gpx: '/traces/defi-copilos.gpx',
    dist: '30',
    unit: 'KM',
    dplus: '1100',
    startTime: '15h45',
    diff: 5,
    timed: true,
    loops: [
      { roman: 'I',   label: 'Conquête', distance: '12 km', ascent: '+400 m', timeLimit: '1h45', value: "L'esprit de conquête", status: 'Qualificative',     color: '#d4a574' },
      { roman: 'II',  label: 'Courage',  distance: '6 km',  ascent: '+220 m', timeLimit: '1h00', value: 'Le courage',            status: 'Qualificative',     color: '#a67a4a' },
      { roman: 'III', label: 'Bravoure', distance: '6 km',  ascent: '+220 m', timeLimit: '1h00', value: 'La bravoure',           status: 'Qualificative',     color: '#7a5a6b' },
      { roman: 'IV',  label: 'Honneur',  distance: '6 km',  ascent: '+220 m', timeLimit: '1h00', value: "L'honneur",             status: 'Classement final', color: '#5a7a5a' },
    ],
  },
  {
    id: 'oppidum',
    roman: 'II',
    title: "L'OPPIDUM",
    type: 'Chronométrée · classée',
    desc: "Boucle unique sur les traces de l'oppidum tectosage. Sous-bois, coteaux, crêtes au-dessus de la Garonne.",
    gpx: '/traces/oppidum.gpx',
    dist: '12',
    unit: 'KM',
    dplus: '400',
    startTime: '16h15',
    diff: 4,
    timed: true,
  },
  {
    id: 'oppi-dog',
    roman: 'III',
    title: 'OPPI-DOG',
    type: 'Canicross chronométré',
    desc: "Sol forestier, points d'eau pour les chiens, équipement canicross réglementaire.",
    gpx: '/traces/oppi-dog.gpx',
    dist: '6',
    unit: 'KM',
    dplus: '180',
    startTime: '16h30',
    diff: 3,
    timed: true,
  },
  {
    id: 'randonnee-sages',
    roman: 'IV',
    title: 'RANDO DES SAGES',
    type: 'Marche libre',
    desc: 'Non chronométrée. Une marche contemplative sur les sentiers historiques du village.',
    gpx: '/traces/randonnee-sages.gpx',
    dist: '6',
    unit: 'KM',
    dplus: '180',
    startTime: '16h30',
    diff: 2,
    timed: false,
  },
  {
    id: 'tectokids',
    roman: 'V',
    title: 'TECTOKIDS',
    type: 'La relève',
    desc: 'Boucles courtes, dossard, médaille en terre cuite. La relève des Tectosages.',
    gpx: '/traces/tectokids.gpx',
    dist: '1–3',
    unit: 'KM',
    dplus: '—',
    startTime: '18h00',
    diff: 1,
    timed: true,
  },
];
