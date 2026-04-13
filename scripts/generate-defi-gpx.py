#!/usr/bin/env python3
"""
Génère le fichier GPX multi-segments pour le Défi de Copilos.

Structure :
  - Boucle 1 (12km) = Boucle_complète.gpx (Auzil + Pechbusque)
  - Boucle 2 (6km)  = Boucle2.gpx (Pechbusque)
  - Boucle 3 (6km)  = Boucle2.gpx (même parcours)
  - Boucle 4 (6km)  = Boucle2.gpx (même parcours)

Usage:
  python3 scripts/generate-defi-gpx.py

Produit: public/traces/defi-copilos.gpx
"""

import xml.etree.ElementTree as ET
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

BOUCLE_COMPLETE = os.path.join(PROJECT_ROOT, 'Boucle_complète.gpx')
BOUCLE_2 = os.path.join(PROJECT_ROOT, 'Boucle2.gpx')
OUTPUT = os.path.join(PROJECT_ROOT, 'public', 'traces', 'defi-copilos.gpx')

NS = {'gpx': 'http://www.topografix.com/GPX/1/1'}

BOUCLES = [
    {'source': BOUCLE_COMPLETE, 'name': 'Boucle 1 — L\'esprit de conquête'},
    {'source': BOUCLE_2,        'name': 'Boucle 2 — Le courage'},
    {'source': BOUCLE_2,        'name': 'Boucle 3 — La bravoure'},
    {'source': BOUCLE_2,        'name': 'Boucle 4 — L\'honneur'},
]


def extract_trkpts(gpx_path):
    """Extrait les trkpt d'un fichier GPX."""
    tree = ET.parse(gpx_path)
    root = tree.getroot()
    trkpts = root.findall('.//gpx:trkpt', NS)
    print(f"  → {len(trkpts)} points trouvés dans {os.path.basename(gpx_path)}")
    return trkpts


def build_multi_track_gpx():
    """Construit le fichier GPX multi-segments."""
    gpx = ET.Element('gpx')
    gpx.set('xmlns', 'http://www.topografix.com/GPX/1/1')
    gpx.set('version', '1.1')
    gpx.set('creator', 'Trail des Tectosages')

    meta = ET.SubElement(gpx, 'metadata')
    name = ET.SubElement(meta, 'name')
    name.text = 'Le Défi de Copilos — 4 boucles'

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
    print(f"   {len(BOUCLES)} segments (tracks)")


if __name__ == '__main__':
    build_multi_track_gpx()
