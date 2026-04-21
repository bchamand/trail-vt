import maplibregl from 'maplibre-gl';
import type { TrackData } from './gpx-parser';

const INK = '#e8e3d3';
const ACCENT = '#d4a574';
const BG = '#0f1412';
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const PADDING = 40;

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

function setBoundsLock(map: maplibregl.Map, bounds: maplibregl.LngLatBounds) {
  function lock() {
    const visibleBounds = map.getBounds();
    map.setMaxBounds(visibleBounds);
    map.setMinZoom(map.getZoom());
  }
  map.on('load', lock);
  map.on('resize', () => {
    map.setMaxBounds(undefined as any);
    map.setMinZoom(0);
    map.fitBounds(bounds, { padding: PADDING, duration: 0 });
    requestAnimationFrame(lock);
  });
}

/** Build the styled Départ marker (dashed outer ring + filled dot + "DÉPART" label). */
function mkStartMarker(): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = `
    position: relative;
    width: 32px; height: 32px;
    pointer-events: none;
  `;
  el.innerHTML = `
    <div style="
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      width: 28px; height: 28px; border-radius: 50%;
      border: 1.5px dashed ${ACCENT};
    "></div>
    <div style="
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      width: 12px; height: 12px; border-radius: 50%;
      background: ${ACCENT};
      box-shadow: 0 0 10px rgba(212, 165, 116, 0.4);
    "></div>
    <div style="
      position: absolute; left: 36px; top: 50%; transform: translateY(-50%);
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px; font-weight: 700; letter-spacing: 0.15em;
      color: ${INK};
      text-shadow: 0 1px 3px rgba(0,0,0,0.8);
      white-space: nowrap;
    ">DÉPART</div>
  `;
  return el;
}

/** Segment end marker: circle with Roman numeral. */
function mkEndMarker(roman: string, color: string): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = `
    width: 22px; height: 22px; border-radius: 50%;
    background: ${BG};
    border: 1.5px solid ${color};
    display: flex; align-items: center; justify-content: center;
    font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 600;
    font-size: 11px; color: ${INK};
    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    transition: opacity 0.25s ease;
  `;
  el.textContent = roman;
  return el;
}

/** Hover marker: dashed outer ring + filled dot. */
function mkHoverMarker(color: string): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = `
    position: relative; width: 24px; height: 24px; pointer-events: none; display: none;
  `;
  el.innerHTML = `
    <div style="
      position: absolute; inset: 0; border-radius: 50%;
      border: 1.5px dashed ${ACCENT}; opacity: 0.6;
    "></div>
    <div class="hover-dot" style="
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      width: 10px; height: 10px; border-radius: 50%;
      background: ${color};
      border: 1.5px solid ${BG};
    "></div>
  `;
  return el;
}

function updateHoverDotColor(el: HTMLElement, color: string) {
  const dot = el.querySelector('.hover-dot') as HTMLElement | null;
  if (dot) dot.style.background = color;
}

/** Path styling helpers. */
function drawTrack(
  map: maplibregl.Map,
  id: string,
  coords: [number, number][],
  color: string,
  active: boolean,
) {
  const glowColor = color + '4D'; // 30% opacity
  map.addSource(id, {
    type: 'geojson',
    data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } },
  });
  map.addLayer({
    id: `${id}-glow`, type: 'line', source: id,
    paint: {
      'line-color': glowColor,
      'line-width': active ? 10 : 4,
      'line-blur': active ? 6 : 2,
      'line-opacity': active ? 1 : 0.3,
    },
  });
  map.addLayer({
    id: `${id}-line`, type: 'line', source: id,
    paint: {
      'line-color': color,
      'line-width': active ? 3.2 : 2,
      'line-opacity': active ? 1 : 0.3,
    },
  });
}

function setTrackActive(map: maplibregl.Map, id: string, active: boolean) {
  map.setPaintProperty(`${id}-glow`, 'line-width', active ? 10 : 4);
  map.setPaintProperty(`${id}-glow`, 'line-blur', active ? 6 : 2);
  map.setPaintProperty(`${id}-glow`, 'line-opacity', active ? 1 : 0.3);
  map.setPaintProperty(`${id}-line`, 'line-width', active ? 3.2 : 2);
  map.setPaintProperty(`${id}-line`, 'line-opacity', active ? 1 : 0.3);
}

// ─── Single-track map ──────────────────────────────────────────────────────

export interface SingleMapResult {
  map: maplibregl.Map;
  setMarkerAt: (index: number) => void;
  clearMarker: () => void;
}

export function initMap(container: HTMLElement, trackData: TrackData): SingleMapResult {
  const bounds = new maplibregl.LngLatBounds(trackData.coords[0], trackData.coords[0]);
  trackData.coords.forEach(c => bounds.extend(new maplibregl.LngLat(c[0], c[1])));

  const map = new maplibregl.Map({
    container, style: MAP_STYLE, bounds,
    fitBoundsOptions: { padding: PADDING },
    maxZoom: 15, attributionControl: false,
    dragRotate: false, pitchWithRotate: false, touchZoomRotate: true,
  });
  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
  setBoundsLock(map, bounds);

  // Hover marker
  const hoverEl = mkHoverMarker(ACCENT);
  const hoverMarker = new maplibregl.Marker({ element: hoverEl })
    .setLngLat(trackData.coords[0]).addTo(map);

  function setMarkerAt(index: number) {
    if (index < 0 || index >= trackData.coords.length) return;
    hoverEl.style.display = 'block';
    hoverMarker.setLngLat(trackData.coords[index]);
  }
  function clearMarker() {
    hoverEl.style.display = 'none';
  }

  map.on('load', () => {
    drawTrack(map, 'track', trackData.coords, ACCENT, true);

    // Départ marker (offset left-top)
    const startEl = mkStartMarker();
    new maplibregl.Marker({ element: startEl, anchor: 'center' })
      .setLngLat(trackData.coords[0]).addTo(map);

    // End marker (skip if it coincides with the start — loop returning home)
    const [sLon, sLat] = trackData.coords[0];
    const last = trackData.coords[trackData.coords.length - 1];
    const SAME = 0.0005;
    if (Math.abs(last[0] - sLon) >= SAME || Math.abs(last[1] - sLat) >= SAME) {
      const endEl = mkEndMarker('A', ACCENT);
      new maplibregl.Marker({ element: endEl }).setLngLat(last).addTo(map);
    }
  });

  return { map, setMarkerAt, clearMarker };
}

// ─── Multi-loop map ────────────────────────────────────────────────────────

export interface MultiLoopMapResult {
  map: maplibregl.Map;
  setActiveSeg: (i: number | null) => void;
  setMarkerAt: (segIdx: number, ptIdx: number) => void;
  clearMarker: () => void;
}

export function initMultiLoopMap(
  container: HTMLElement,
  loopData: TrackData[],
  colors: string[],
  initialActive: number | null = null,
): MultiLoopMapResult {
  const allBounds = new maplibregl.LngLatBounds(loopData[0].coords[0], loopData[0].coords[0]);
  loopData.forEach(track => {
    track.coords.forEach(c => allBounds.extend(new maplibregl.LngLat(c[0], c[1])));
  });

  const map = new maplibregl.Map({
    container, style: MAP_STYLE, bounds: allBounds,
    fitBoundsOptions: { padding: PADDING },
    maxZoom: 15, attributionControl: false,
    dragRotate: false, pitchWithRotate: false, touchZoomRotate: true,
  });
  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
  setBoundsLock(map, allBounds);

  let activeSeg: number | null = initialActive;

  // Hover marker
  const hoverEl = mkHoverMarker(colors[0]);
  const hoverMarker = new maplibregl.Marker({ element: hoverEl })
    .setLngLat(loopData[0].coords[0]).addTo(map);

  // End markers (one per loop)
  const endMarkers: { el: HTMLElement; marker: maplibregl.Marker }[] = [];

  function updateDimming() {
    loopData.forEach((_, i) => {
      const isActive = activeSeg == null || activeSeg === i;
      setTrackActive(map, `loop-${i}`, isActive);
      if (endMarkers[i]) endMarkers[i].el.style.opacity = isActive ? '1' : '0.3';
    });
  }

  function setActiveSeg(i: number | null) {
    activeSeg = i;
    updateDimming();
  }

  function setMarkerAt(segIdx: number, ptIdx: number) {
    const track = loopData[segIdx];
    if (!track || ptIdx < 0 || ptIdx >= track.coords.length) return;
    updateHoverDotColor(hoverEl, colors[segIdx]);
    hoverEl.style.display = 'block';
    hoverMarker.setLngLat(track.coords[ptIdx]);
  }
  function clearMarker() { hoverEl.style.display = 'none'; }

  map.on('load', () => {
    loopData.forEach((track, i) => {
      const isActive = activeSeg == null || activeSeg === i;
      drawTrack(map, `loop-${i}`, track.coords, colors[i], isActive);
    });

    // Départ on the first loop's start
    const startEl = mkStartMarker();
    new maplibregl.Marker({ element: startEl, anchor: 'center' })
      .setLngLat(loopData[0].coords[0]).addTo(map);

    // End marker per segment (Roman numeral). If a segment ends (near) the
    // départ (shared start/end), skip it so we don't stack on the Départ pin.
    const [startLon, startLat] = loopData[0].coords[0];
    const SAME_POINT_DEG = 0.0005; // ~50m at this latitude
    loopData.forEach((track, i) => {
      const last = track.coords[track.coords.length - 1];
      const coincides =
        Math.abs(last[0] - startLon) < SAME_POINT_DEG &&
        Math.abs(last[1] - startLat) < SAME_POINT_DEG;
      if (coincides) return; // départ pin represents all loop ends here
      const el = mkEndMarker(ROMAN[i], colors[i]);
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(last).addTo(map);
      endMarkers[i] = { el, marker };
    });

    updateDimming();
  });

  return { map, setActiveSeg, setMarkerAt, clearMarker };
}
