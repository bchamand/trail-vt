---
# ── Le Défi de Copillos ── course reine, 4 boucles à élimination ──
# Distance et D+ de chaque boucle = valeurs officielles arrondies (ci-dessous) ;
# le total de l'épreuve est la somme des boucles. Sans « distance: » / « ascent: »
# sur une boucle, la valeur serait calculée depuis le GPX
# (public/traces/defi-copillos.gpx, un <trk> par boucle).
order: 1
poster: true                          # afficher cette course sur l'affiche
posterType: 4 boucles par élimination # « type de course » montré sur l'affiche
title: Défi de Copillos
type: La course reine
description: >-
  Quatre boucles successives avec départ groupé — qualification ou élimination à chaque passage
  selon un temps limite. Seule la dernière boucle est classante : elle
  sacre les Héritiers de Copillos.
bibs: 100                 # nombre de dossards (limite)
eligibility: À partir des Espoirs
startTime: 15h00
timed: true
color: '#d4a574'
segments:
  - label: La Conquête
    value: Boucle Auzil + Pechbusque
    status: Éliminatoire
    timeLimit: { men: '1h20', women: '1h30' }
    distance: 11.5  # km — boucle Auzil + Pechbusque (valeur officielle, sinon GPX)
    ascent: 400     # D+ en m
    color: '#d4a574'
  - label: L'Endurance
    value: Boucle Auzil + Pechbusque
    status: Éliminatoire
    timeLimit: { men: '1h20', women: '1h30' }
    distance: 11.5
    ascent: 400
    color: '#a67a4a'
  - label: La Bravoure
    value: Boucle du Golf
    status: Éliminatoire
    timeLimit: { men: '40 min', women: '45 min' }
    distance: 5     # km — boucle du Golf
    ascent: 100     # D+ en m
    color: '#7a5a6b'
  - label: L'Honneur
    value: Boucle du Golf
    status: Éliminatoire
    timeLimit: { men: '40 min', women: '45 min' }
    distance: 5
    ascent: 100
    color: '#5a7a5a'
---
