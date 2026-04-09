import maplibregl from 'maplibre-gl';
import type { TrackData } from './gpx-parser';

const GOLD = '#D4A843';
const GOLD_GLOW = 'rgba(212, 168, 67, 0.3)';
const TERRACOTTA = '#C4533A';
const PADDING = 50;

export function initMap(
  container: HTMLElement,
  trackData: TrackData,
  onHoverPoint?: (index: number) => void,
): { map: maplibregl.Map; setMarkerAt: (index: number) => void } {
  // Compute track bounds
  const trackBounds = new maplibregl.LngLatBounds(trackData.coords[0], trackData.coords[0]);
  trackData.coords.forEach(c => trackBounds.extend(new maplibregl.LngLat(c[0], c[1])));

  // Create map without maxBounds first — we'll set them after fitBounds
  const map = new maplibregl.Map({
    container,
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    bounds: trackBounds,
    fitBoundsOptions: { padding: PADDING },
    maxZoom: 15,
    attributionControl: false,
    dragRotate: false,
    pitchWithRotate: false,
    touchZoomRotate: true,
  });

  // Disable rotation via touch
  map.touchZoomRotate.disableRotation();

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  // After fitBounds resolves, read the actual visible bounds and lock them
  function lockBounds() {
    const visibleBounds = map.getBounds();
    map.setMaxBounds(visibleBounds);
    map.setMinZoom(map.getZoom());
  }

  map.on('load', () => {
    lockBounds();
  });

  // On resize, recalculate
  map.on('resize', () => {
    map.setMaxBounds(undefined as any); // temporarily remove constraint
    map.setMinZoom(0);
    map.fitBounds(trackBounds, { padding: PADDING, duration: 0 });
    requestAnimationFrame(lockBounds);
  });

  // Hover marker
  const markerEl = document.createElement('div');
  markerEl.className = 'track-marker';
  markerEl.style.cssText = `
    width: 14px; height: 14px;
    background: ${GOLD};
    border: 2px solid ${GOLD};
    border-radius: 50%;
    box-shadow: 0 0 12px ${GOLD_GLOW};
    display: none;
  `;
  const marker = new maplibregl.Marker({ element: markerEl })
    .setLngLat(trackData.coords[0])
    .addTo(map);

  function setMarkerAt(index: number) {
    if (index >= 0 && index < trackData.coords.length) {
      markerEl.style.display = 'block';
      marker.setLngLat(trackData.coords[index]);
    }
  }

  map.on('load', () => {
    // Full track (subtle background)
    map.addSource('track-bg', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: trackData.coords },
      },
    });
    map.addLayer({
      id: 'track-bg-glow',
      type: 'line',
      source: 'track-bg',
      paint: {
        'line-color': GOLD_GLOW,
        'line-width': 8,
        'line-blur': 4,
      },
    });
    map.addLayer({
      id: 'track-bg-line',
      type: 'line',
      source: 'track-bg',
      paint: {
        'line-color': GOLD,
        'line-width': 3,
        'line-opacity': 0.2,
      },
    });

    // Animated track
    map.addSource('track-animated', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: [trackData.coords[0]] },
      },
    });
    map.addLayer({
      id: 'track-animated-glow',
      type: 'line',
      source: 'track-animated',
      paint: {
        'line-color': GOLD_GLOW,
        'line-width': 10,
        'line-blur': 6,
      },
    });
    map.addLayer({
      id: 'track-animated-line',
      type: 'line',
      source: 'track-animated',
      paint: {
        'line-color': GOLD,
        'line-width': 3.5,
      },
    });

    // Start/End markers
    const startEnd = [
      { coord: trackData.coords[0], color: '#22c55e', label: 'D' },
      { coord: trackData.coords[trackData.coords.length - 1], color: TERRACOTTA, label: 'A' },
    ];
    startEnd.forEach(({ coord, color, label }) => {
      const el = document.createElement('div');
      el.style.cssText = `
        width: 28px; height: 28px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 11px; font-weight: 700; color: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      `;
      el.textContent = label;
      new maplibregl.Marker({ element: el }).setLngLat(coord).addTo(map);
    });

    // Km markers along the track
    let nextKm = 1;
    for (let i = 0; i < trackData.points.length; i++) {
      const pt = trackData.points[i];
      if (pt.dist >= nextKm) {
        const el = document.createElement('div');
        el.style.cssText = `
          width: 22px; height: 22px;
          background: rgba(26, 24, 20, 0.85);
          border: 2px solid ${GOLD};
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 700; color: ${GOLD};
          font-family: 'DM Sans', sans-serif;
        `;
        el.textContent = `${nextKm}`;
        new maplibregl.Marker({ element: el })
          .setLngLat(trackData.coords[i])
          .addTo(map);
        nextKm++;
      }
    }

    // Animate trace drawing
    let step = 0;
    const totalSteps = trackData.coords.length;
    const speed = Math.max(1, Math.floor(totalSteps / 120));

    function animate() {
      step = Math.min(step + speed, totalSteps);
      const source = map.getSource('track-animated') as maplibregl.GeoJSONSource;
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: trackData.coords.slice(0, step),
        },
      });
      if (step < totalSteps) {
        requestAnimationFrame(animate);
      }
    }
    requestAnimationFrame(animate);
  });

  return { map, setMarkerAt };
}
