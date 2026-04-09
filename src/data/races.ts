export interface Race {
  id: string;
  title: string;
  type: string;
  desc: string;
  gpx: string;
  icon: string;
}

export const races: Race[] = [
  {
    id: 'quete-or',
    title: 'La Quête de l\'Or',
    type: 'Course trail',
    desc: 'Le parcours phare du Trail des Tectosages à travers les coteaux boisés et les chemins ancestraux de Vieille-Toulouse.',
    gpx: '/traces/quete-or.gpx',
    icon: '🏃',
  },
  {
    id: 'chemin-anciens',
    title: 'Le Chemin des Anciens',
    type: 'Marche / Randonnée',
    desc: 'Un parcours accessible à tous pour découvrir les paysages et le patrimoine du Lauragais à son propre rythme.',
    gpx: '/traces/chemin-anciens.gpx',
    icon: '🚶',
  },
  {
    id: 'petits-gaulois',
    title: 'Les Petits Gaulois',
    type: 'Course enfants',
    desc: 'Les futurs guerriers tectosages se lancent sur un parcours adapté à leur âge. Médaille pour tous les finishers !',
    gpx: '/traces/petits-gaulois.gpx',
    icon: '⚡',
  },
  {
    id: 'quatre-torques',
    title: 'L\'Épreuve des Quatre Torques',
    type: 'Course par élimination',
    desc: '4 boucles chronométrées. Chaque boucle doit être bouclée dans le temps imparti. Arriverez-vous au bout des 4 torques ?',
    gpx: '/traces/quatre-torques.gpx',
    icon: '🔥',
  },
];
