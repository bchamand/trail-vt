import maplibregl from 'maplibre-gl';
import type { Track } from '../lib/gpx';
import { resolveMapStyle } from '../lib/map-style';

const INK = '#e8e3d3';
const ACCENT = '#d4a574';
const BG = '#0f1412';
const PADDING = 40;
const SAME_POINT_DEG = 0.0005; // ~50m

function mkStartMarker(): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = 'width: 32px; height: 32px; pointer-events: none;';
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

function mkEndMarker(label: string, color: string): HTMLElement {
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
  el.textContent = label;
  return el;
}

function mkHoverMarker(): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = 'width: 24px; height: 24px; pointer-events: none; display: none;';
  el.innerHTML = `
    <div class="hover-ring" style="
      position: absolute; inset: 0; border-radius: 50%;
      border: 1.5px solid ${ACCENT}; opacity: 0.55;
    "></div>
    <div class="hover-dot" style="
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      width: 10px; height: 10px; border-radius: 50%;
      background: ${INK};
      border: 1.5px solid ${BG};
    "></div>
  `;
  return el;
}

function setHoverRingColor(el: HTMLElement, color: string) {
  const ring = el.querySelector('.hover-ring') as HTMLElement | null;
  if (ring) ring.style.borderColor = color;
}

function boundsOf(tracks: Track[]): maplibregl.LngLatBounds {
  const b = new maplibregl.LngLatBounds(tracks[0].coords[0], tracks[0].coords[0]);
  tracks.forEach(t => t.coords.forEach(c => b.extend(new maplibregl.LngLat(c[0], c[1]))));
  return b;
}

export interface SetRaceOptions {
  colors: string[];          // one color per track (single-track passes one color)
  endLabels?: string[];      // end marker labels per track (multi-track uses Roman numerals)
}

export interface RaceMapHandle {
  setRace(tracks: Track[], options: SetRaceOptions): void;
  setActiveSeg(i: number | null): void;
  setMarkerAt(segIdx: number, ptIdx: number): void;
  clearMarker(): void;
  destroy(): void;
}

export function createRaceMap(container: HTMLElement, mapStyle: string): RaceMapHandle {
  const map = new maplibregl.Map({
    container,
    style: resolveMapStyle(mapStyle),
    center: [0, 0],
    zoom: 2,
    maxZoom: 16,
    attributionControl: false,
    dragRotate: false,
    pitchWithRotate: false,
    touchZoomRotate: true,
  });
  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

  const hoverEl = mkHoverMarker();
  const hoverMarker = new maplibregl.Marker({ element: hoverEl }).setLngLat([0, 0]).addTo(map);

  let tracks: Track[] = [];
  let colors: string[] = [];
  let activeSeg: number | null = null;
  let currentBounds: maplibregl.LngLatBounds | null = null;
  let startMarker: maplibregl.Marker | null = null;
  const endMarkers: (maplibregl.Marker | null)[] = [];

  function unlockView() {
    map.setMaxBounds(undefined as any);
    map.setMinZoom(0);
  }
  function lockView() {
    map.setMaxBounds(map.getBounds());
    map.setMinZoom(map.getZoom());
  }
  function refitAndLock(animate: boolean) {
    if (!currentBounds) return;
    unlockView();
    map.fitBounds(currentBounds, { padding: PADDING, duration: animate ? 600 : 0 });
    map.once('moveend', lockView);
  }
  map.on('resize', () => refitAndLock(false));

  function trackId(i: number) { return `track-${i}`; }

  function removeTrackLayers() {
    for (let i = 0; i < tracks.length; i++) {
      const id = trackId(i);
      if (map.getLayer(`${id}-line`)) map.removeLayer(`${id}-line`);
      if (map.getLayer(`${id}-glow`)) map.removeLayer(`${id}-glow`);
      if (map.getSource(id)) map.removeSource(id);
    }
  }

  function removeMarkers() {
    startMarker?.remove();
    startMarker = null;
    endMarkers.forEach(m => m?.remove());
    endMarkers.length = 0;
  }

  function paintTrack(i: number, active: boolean) {
    const id = trackId(i);
    map.setPaintProperty(`${id}-glow`, 'line-width', active ? 10 : 4);
    map.setPaintProperty(`${id}-glow`, 'line-blur', active ? 6 : 2);
    map.setPaintProperty(`${id}-glow`, 'line-opacity', active ? 1 : 0.3);
    map.setPaintProperty(`${id}-line`, 'line-width', active ? 3.2 : 2);
    map.setPaintProperty(`${id}-line`, 'line-opacity', active ? 1 : 0.3);
    const em = endMarkers[i]?.getElement();
    if (em) em.style.opacity = active ? '1' : '0.3';
  }

  function applyActive() {
    tracks.forEach((_, i) => paintTrack(i, activeSeg == null || activeSeg === i));
  }

  function drawCurrent(endLabels?: string[]) {
    tracks.forEach((t, i) => {
      const id = trackId(i);
      const color = colors[i];
      const active = activeSeg == null || activeSeg === i;
      map.addSource(id, {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: t.coords } },
      });
      map.addLayer({
        id: `${id}-glow`, type: 'line', source: id,
        paint: {
          'line-color': color + '4D',
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
    });

    const start = tracks[0].coords[0];
    startMarker = new maplibregl.Marker({ element: mkStartMarker(), anchor: 'center' })
      .setLngLat(start).addTo(map);

    tracks.forEach((t, i) => {
      const last = t.coords[t.coords.length - 1];
      const coincides =
        Math.abs(last[0] - start[0]) < SAME_POINT_DEG &&
        Math.abs(last[1] - start[1]) < SAME_POINT_DEG;
      if (coincides) {
        endMarkers[i] = null;
        return;
      }
      const label = endLabels?.[i] ?? 'A';
      endMarkers[i] = new maplibregl.Marker({ element: mkEndMarker(label, colors[i]) })
        .setLngLat(last).addTo(map);
    });
  }

  function applyRace(next: Track[], opts: SetRaceOptions) {
    removeTrackLayers();
    removeMarkers();
    tracks = next;
    colors = opts.colors;
    activeSeg = null;
    drawCurrent(opts.endLabels);
    currentBounds = boundsOf(tracks);
    refitAndLock(true);
  }

  let pending: { tracks: Track[]; opts: SetRaceOptions } | null = null;
  function whenReady(fn: () => void) {
    if (map.isStyleLoaded()) fn();
    else map.once('load', fn);
  }

  return {
    setRace(next, opts) {
      pending = { tracks: next, opts };
      whenReady(() => {
        if (!pending) return;
        const p = pending; pending = null;
        applyRace(p.tracks, p.opts);
      });
    },
    setActiveSeg(i) {
      activeSeg = i;
      if (tracks.length) applyActive();
    },
    setMarkerAt(segIdx, ptIdx) {
      const t = tracks[segIdx];
      if (!t || ptIdx < 0 || ptIdx >= t.coords.length) return;
      setHoverRingColor(hoverEl, colors[segIdx] ?? ACCENT);
      hoverEl.style.display = 'block';
      hoverMarker.setLngLat(t.coords[ptIdx]);
    },
    clearMarker() {
      hoverEl.style.display = 'none';
    },
    destroy() {
      map.remove();
    },
  };
}
