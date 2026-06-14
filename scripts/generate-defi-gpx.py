#!/usr/bin/env python3
"""
Génère le fichier GPX multi-boucles du Défi de Copillos.

Structure — 4 boucles à élimination :
  Boucle 1 — La Conquête  : Auzil + Pechbusque  (temps : H 1h20 · F 1h30)
  Boucle 2 — L'Endurance  : Auzil + Pechbusque  (temps : H 1h20 · F 1h30)
  Boucle 3 — La Bravoure  : Golf                (temps : H 45' · F 50')
  Boucle 4 — L'Honneur    : Golf                (temps : H 45' · F 50')

À chaque passage il faut tenir le temps limite (hommes / femmes) pour être
sélectionné pour la boucle suivante.

Sources (une trace par type de boucle) : scripts/gpx-sources/
  - boucle-auzil-pechbusque.gpx  (faite 2 fois)
  - boucle-golf.gpx              (faite 2 fois)

Distance et D+ ne sont PAS écrits ici : ils sont calculés depuis la trace par
le site (lib/gpx.ts), un <trk> = un segment.

Usage :
  python3 scripts/generate-defi-gpx.py

Produit : public/traces/defi-copillos.gpx (un <trk> par boucle, dans l'ordre).
"""

import xml.etree.ElementTree as ET
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
SOURCES = os.path.join(SCRIPT_DIR, 'gpx-sources')

SOURCE_AUZIL_PECHBUSQUE = os.path.join(SOURCES, 'boucle-auzil-pechbusque.gpx')
SOURCE_GOLF = os.path.join(SOURCES, 'boucle-golf.gpx')
OUTPUT = os.path.join(PROJECT_ROOT, 'public', 'traces', 'defi-copillos.gpx')

NS = {'gpx': 'http://www.topografix.com/GPX/1/1'}

# Ordre des boucles = ordre des segments dans src/content/races/defi-copillos.md
BOUCLES = [
    {'source': SOURCE_AUZIL_PECHBUSQUE, 'name': "Boucle 1 — La Conquête"},
    {'source': SOURCE_AUZIL_PECHBUSQUE, 'name': "Boucle 2 — L'Endurance"},
    {'source': SOURCE_GOLF,             'name': "Boucle 3 — La Bravoure"},
    {'source': SOURCE_GOLF,             'name': "Boucle 4 — L'Honneur"},
]


def extract_trkpts(gpx_path):
    """Extrait les trkpt d'un fichier GPX."""
    tree = ET.parse(gpx_path)
    root = tree.getroot()
    trkpts = root.findall('.//gpx:trkpt', NS)
    print(f"  → {len(trkpts)} points trouvés dans {os.path.basename(gpx_path)}")
    return trkpts


def build_multi_track_gpx():
    """Construit le fichier GPX multi-boucles (un <trk> par boucle)."""
    gpx = ET.Element('gpx')
    gpx.set('xmlns', 'http://www.topografix.com/GPX/1/1')
    gpx.set('version', '1.1')
    gpx.set('creator', 'Trail des Tectosages')

    meta = ET.SubElement(gpx, 'metadata')
    name = ET.SubElement(meta, 'name')
    name.text = 'Le Défi de Copillos — 4 boucles'

    for boucle in BOUCLES:
        print(f"Traitement : {boucle['name']}")
        trkpts = extract_trkpts(boucle['source'])

        trk = ET.SubElement(gpx, 'trk')
        trk_name = ET.SubElement(trk, 'name')
        trk_name.text = boucle['name']
        seg = ET.SubElement(trk, 'trkseg')

        for pt in trkpts:
            new_pt = ET.SubElement(seg, 'trkpt')
            new_pt.set('lat', pt.get('lat'))
            new_pt.set('lon', pt.get('lon'))
            ele = pt.find('{http://www.topografix.com/GPX/1/1}ele')
            if ele is not None:
                new_ele = ET.SubElement(new_pt, 'ele')
                new_ele.text = ele.text

    tree = ET.ElementTree(gpx)
    ET.indent(tree, space='  ')

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    tree.write(OUTPUT, xml_declaration=True, encoding='UTF-8')
    print(f"\n✅ Fichier généré : {OUTPUT}")
    print(f"   {len(BOUCLES)} boucles (tracks)")


if __name__ == '__main__':
    build_multi_track_gpx()
