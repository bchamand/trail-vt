#!/usr/bin/env python3
"""
Génère le fichier GPX multi-boucles du Défi de Copillos.

Structure officielle (synopsis du 01.05.2026) — 40,1 km / D+ 1230 m :
  Boucle 1 — La Conquête   : Auzil + Pechbusque (11,1 km / D+ 370 m)
  Boucle 2 — L'Honneur     : Pechbusque         (6,2 km  / D+ 220 m)
  Boucle 3 — L'Endurance   : Pechbusque         (6,2 km  / D+ 220 m)
  Boucle 4 — Le Courage    : Pechbusque         (6,2 km  / D+ 220 m)
  Boucle 5 — La Bravoure   : Golf               (5,2 km  / D+ 100 m)
  Boucle 6 — Le Prestige   : Golf               (5,2 km  / D+ 100 m)

⚠ La trace de la Boucle du Golf n'existe pas encore : en attendant,
  la boucle Pechbusque sert de remplacement. Quand la vraie trace
  arrive, la déposer dans scripts/gpx-sources/boucle-golf.gpx et
  mettre à jour SOURCE_GOLF ci-dessous.

Usage :
  python3 scripts/generate-defi-gpx.py

Produit : public/traces/defi-copillos.gpx
"""

import xml.etree.ElementTree as ET
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
SOURCES = os.path.join(SCRIPT_DIR, 'gpx-sources')

SOURCE_AUZIL_PECHBUSQUE = os.path.join(SOURCES, 'boucle-auzil-pechbusque.gpx')
SOURCE_PECHBUSQUE = os.path.join(SOURCES, 'boucle-pechbusque.gpx')
SOURCE_GOLF = SOURCE_PECHBUSQUE  # ← remplacer par boucle-golf.gpx dès réception
OUTPUT = os.path.join(PROJECT_ROOT, 'public', 'traces', 'defi-copillos.gpx')

NS = {'gpx': 'http://www.topografix.com/GPX/1/1'}

BOUCLES = [
    {'source': SOURCE_AUZIL_PECHBUSQUE, 'name': "Boucle 1 — La Conquête"},
    {'source': SOURCE_PECHBUSQUE,       'name': "Boucle 2 — L'Honneur"},
    {'source': SOURCE_PECHBUSQUE,       'name': "Boucle 3 — L'Endurance"},
    {'source': SOURCE_PECHBUSQUE,       'name': "Boucle 4 — Le Courage"},
    {'source': SOURCE_GOLF,             'name': "Boucle 5 — La Bravoure"},
    {'source': SOURCE_GOLF,             'name': "Boucle 6 — Le Prestige"},
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
    name.text = 'Le Défi de Copillos — 6 boucles'

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
