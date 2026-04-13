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

// Multi-loop map for the Défi de Copilos
export interface MultiLoopMapResult {
  map: maplibregl.Map;
  setActiveLoop: (index: number) => void;
  setMarkerAt: (index: number) => void;
  getActiveTrackData: () => TrackData;
}

export function initMultiLoopMap(
  container: HTMLElement,
  loopData: TrackData[],
  colors: string[],
  initialActive: number = 0,
): MultiLoopMapResult {
  // Compute combined bounds across all loops
  const allBounds = new maplibregl.LngLatBounds(loopData[0].coords[0], loopData[0].coords[0]);
  loopData.forEach(track => {
    track.coords.forEach(c => allBounds.extend(new maplibregl.LngLat(c[0], c[1])));
  });

  const map = new maplibregl.Map({
    container,
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    bounds: allBounds,
    fitBoundsOptions: { padding: PADDING },
    maxZoom: 15,
    attributionControl: false,
    dragRotate: false,
    pitchWithRotate: false,
    touchZoomRotate: true,
  });

  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  // Floor selector control (like building levels in Google Maps)
  const floorControl = document.createElement('div');
  floorControl.className = 'maplibregl-ctrl maplibregl-ctrl-group';
  floorControl.style.cssText = 'display: flex; flex-direction: column; overflow: hidden; border-radius: 8px;';

  const floorButtons: HTMLButtonElement[] = [];
  // Reverse order: highest floor on top
  for (let i = loopData.length - 1; i >= 0; i--) {
    const btn = document.createElement('button');
    const isActive = i === initialActive;
    btn.textContent = `${i + 1}`;
    btn.title = `Boucle ${i + 1}`;
    btn.style.cssText = `
      width: 32px; height: 32px;
      border: none; cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px; font-weight: 700;
      transition: all 0.2s;
      background: ${isActive ? colors[i] : 'rgba(26, 24, 20, 0.9)'};
      color: ${isActive ? '#fff' : 'rgba(245, 240, 232, 0.5)'};
      border-bottom: ${i > 0 ? '1px solid rgba(245, 240, 232, 0.1)' : 'none'};
    `;
    btn.addEventListener('click', () => {
      setActiveLoop(i);
      // Dispatch custom event so Races.astro can sync
      container.dispatchEvent(new CustomEvent('loopchange', { detail: { index: i } }));
    });
    floorControl.appendChild(btn);
    floorButtons.unshift(btn); // keep in order 0,1,2,3
  }

  // Add control to top-left
  const controlContainer = container.querySelector('.maplibregl-control-container .maplibregl-ctrl-top-left');
  if (controlContainer) {
    controlContainer.appendChild(floorControl);
  } else {
    map.on('load', () => {
      const ctrl = container.querySelector('.maplibregl-control-container .maplibregl-ctrl-top-left');
      if (ctrl) ctrl.appendChild(floorControl);
    });
  }

  function updateFloorButtons(activeIdx: number) {
    floorButtons.forEach((btn, i) => {
      const isActive = i === activeIdx;
      btn.style.background = isActive ? colors[i] : 'rgba(26, 24, 20, 0.9)';
      btn.style.color = isActive ? '#fff' : 'rgba(245, 240, 232, 0.5)';
    });
  }

  // Lock bounds
  function lockBounds() {
    const visibleBounds = map.getBounds();
    map.setMaxBounds(visibleBounds);
    map.setMinZoom(map.getZoom());
  }

  map.on('load', () => { lockBounds(); });
  map.on('resize', () => {
    map.setMaxBounds(undefined as any);
    map.setMinZoom(0);
    map.fitBounds(allBounds, { padding: PADDING, duration: 0 });
    requestAnimationFrame(lockBounds);
  });

  // Hover marker (changes color with active loop)
  let activeIndex = initialActive;
  const markerEl = document.createElement('div');
  markerEl.className = 'track-marker';
  markerEl.style.cssText = `
    width: 14px; height: 14px;
    background: ${colors[activeIndex]};
    border: 2px solid ${colors[activeIndex]};
    border-radius: 50%;
    box-shadow: 0 0 12px rgba(0,0,0,0.3);
    display: none;
  `;
  const marker = new maplibregl.Marker({ element: markerEl })
    .setLngLat(loopData[activeIndex].coords[0])
    .addTo(map);

  function setMarkerAt(index: number) {
    const track = loopData[activeIndex];
    if (index >= 0 && index < track.coords.length) {
      markerEl.style.display = 'block';
      marker.setLngLat(track.coords[index]);
    }
  }

  function getActiveTrackData() {
    return loopData[activeIndex];
  }

  // Add all loop layers on load
  map.on('load', () => {
    loopData.forEach((track, i) => {
      const isActive = i === initialActive;
      const color = colors[i];
      const glowColor = color + '4D'; // 30% opacity

      // Glow layer
      map.addSource(`loop-${i}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: track.coords },
        },
      });
      map.addLayer({
        id: `loop-${i}-glow`,
        type: 'line',
        source: `loop-${i}`,
        paint: {
          'line-color': glowColor,
          'line-width': isActive ? 10 : 4,
          'line-blur': isActive ? 6 : 2,
          'line-opacity': isActive ? 1 : 0.3,
        },
      });
      map.addLayer({
        id: `loop-${i}-line`,
        type: 'line',
        source: `loop-${i}`,
        paint: {
          'line-color': color,
          'line-width': isActive ? 3.5 : 2,
          'line-opacity': isActive ? 1 : 0.25,
        },
      });
    });

    // Start/End markers for each loop
    loopData.forEach((track, i) => {
      const isActive = i === initialActive;
      const color = colors[i];
      // Start marker
      const startEl = document.createElement('div');
      startEl.className = `loop-marker loop-marker-${i}`;
      startEl.style.cssText = `
        width: 24px; height: 24px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 10px; font-weight: 700; color: white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        opacity: ${isActive ? 1 : 0.3};
        transition: opacity 0.3s;
      `;
      startEl.textContent = `${i + 1}`;
      new maplibregl.Marker({ element: startEl }).setLngLat(track.coords[0]).addTo(map);
    });

    // Km markers for the active loop
    addKmMarkers(initialActive);
  });

  // Km markers management
  let kmMarkerElements: maplibregl.Marker[] = [];

  function addKmMarkers(loopIndex: number) {
    // Remove existing km markers
    kmMarkerElements.forEach(m => m.remove());
    kmMarkerElements = [];

    const track = loopData[loopIndex];
    const color = colors[loopIndex];
    let nextKm = 1;
    for (let i = 0; i < track.points.length; i++) {
      if (track.points[i].dist >= nextKm) {
        const el = document.createElement('div');
        el.style.cssText = `
          width: 22px; height: 22px;
          background: rgba(26, 24, 20, 0.85);
          border: 2px solid ${color};
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 700; color: ${color};
          font-family: 'DM Sans', sans-serif;
        `;
        el.textContent = `${nextKm}`;
        const m = new maplibregl.Marker({ element: el }).setLngLat(track.coords[i]).addTo(map);
        kmMarkerElements.push(m);
        nextKm++;
      }
    }
  }

  function setActiveLoop(index: number) {
    if (index === activeIndex) return;
    activeIndex = index;

    // Update layer styles
    loopData.forEach((_, i) => {
      const isActive = i === index;
      const color = colors[i];
      const glowColor = color + '4D';

      map.setPaintProperty(`loop-${i}-glow`, 'line-width', isActive ? 10 : 4);
      map.setPaintProperty(`loop-${i}-glow`, 'line-blur', isActive ? 6 : 2);
      map.setPaintProperty(`loop-${i}-glow`, 'line-opacity', isActive ? 1 : 0.3);
      map.setPaintProperty(`loop-${i}-line`, 'line-width', isActive ? 3.5 : 2);
      map.setPaintProperty(`loop-${i}-line`, 'line-opacity', isActive ? 1 : 0.25);
    });

    // Update start markers opacity
    document.querySelectorAll('.loop-marker').forEach((el, i) => {
      (el as HTMLElement).style.opacity = i === index ? '1' : '0.3';
    });

    // Update hover marker color
    markerEl.style.background = colors[index];
    markerEl.style.borderColor = colors[index];
    markerEl.style.display = 'none';

    // Update km markers
    addKmMarkers(index);

    // Update floor buttons
    updateFloorButtons(index);
  }

  return { map, setActiveLoop, setMarkerAt, getActiveTrackData };
}
