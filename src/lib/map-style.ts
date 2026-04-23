import type { StyleSpecification } from 'maplibre-gl';

type StyleValue = string | StyleSpecification;

const IGN_ATTRIB = '© <a href="https://www.ign.fr/">IGN</a>';

function rasterStyle(tiles: string[], attribution: string): StyleSpecification {
  return {
    version: 8,
    sources: {
      raster: { type: 'raster', tiles, tileSize: 256, attribution },
    },
    layers: [{ id: 'raster', type: 'raster', source: 'raster' }],
  };
}

const IGN_BASE = 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&STYLE=normal';

const PRESETS: Record<string, StyleValue> = {
  // Vector styles (hosted)
  'dark-matter': 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  'positron': 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  'voyager': 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  'openfreemap-liberty': 'https://tiles.openfreemap.org/styles/liberty',
  'openfreemap-positron': 'https://tiles.openfreemap.org/styles/positron',
  'openfreemap-dark': 'https://tiles.openfreemap.org/styles/dark',

  // IGN (France) — raster
  'ign-plan-v2': rasterStyle(
    [`${IGN_BASE}&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&FORMAT=image/png`],
    IGN_ATTRIB,
  ),
  'ign-scan-25': rasterStyle(
    [`${IGN_BASE}&LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS&FORMAT=image/jpeg`],
    IGN_ATTRIB,
  ),
  'ign-photo': rasterStyle(
    [`${IGN_BASE}&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&FORMAT=image/jpeg`],
    IGN_ATTRIB,
  ),
};

export function resolveMapStyle(name: string): StyleValue {
  if (name in PRESETS) return PRESETS[name];
  return name; // treat unknown string as a raw style URL
}

const TILE_HOSTS: Record<string, string[]> = {
  'dark-matter': ['https://basemaps.cartocdn.com'],
  'positron': ['https://basemaps.cartocdn.com'],
  'voyager': ['https://basemaps.cartocdn.com'],
  'openfreemap-liberty': ['https://tiles.openfreemap.org'],
  'openfreemap-positron': ['https://tiles.openfreemap.org'],
  'openfreemap-dark': ['https://tiles.openfreemap.org'],
  'ign-plan-v2': ['https://data.geopf.fr'],
  'ign-scan-25': ['https://data.geopf.fr'],
  'ign-photo': ['https://data.geopf.fr'],
};

/** Hosts to <link rel="preconnect"> for the given style (speeds up first tile fetch). */
export function tileHosts(name: string): string[] {
  return TILE_HOSTS[name] ?? [];
}
