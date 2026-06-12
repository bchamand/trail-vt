// SVG-based elevation profile — adapted from design/variations/gpx-map.jsx
// Displays one or more track segments along a cumulative distance axis.

import type { Track } from '../lib/gpx';

const SVG_NS = 'http://www.w3.org/2000/svg';
const EW = 600;
const EH = 130;
const PAD = 18;
const INK = '#e8e3d3';
const GRID = 'rgba(232, 227, 211, 0.18)';
const ACCENT = '#d4a574';
const BG = '#0f1412';

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

export interface ElevationOptions {
  container: HTMLElement;
  segments: Track[];
  segmentColors: string[];
  gpxHref?: string;
  /** null = show all (or for single-track). Otherwise index of active segment. */
  activeSeg?: number | null;
  onHover?: (segIdx: number, ptIdx: number) => void;
  onLeave?: () => void;
}

export interface ElevationHandle {
  setActiveSeg(i: number | null): void;
  setHover(segIdx: number, ptIdx: number): void;
  clearHover(): void;
  destroy(): void;
}

interface ProjectedPoint {
  x: number;
  y: number;
  segIdx: number;
  ptIdx: number;
  ele: number;
  km: number;
}

export function renderElevation(opts: ElevationOptions): ElevationHandle {
  const { container, segments, segmentColors, gpxHref, onHover, onLeave } = opts;
  let activeSeg: number | null = opts.activeSeg ?? null;

  // Reset container
  container.innerHTML = '';
  container.style.background = BG;
  container.style.borderTop = `1px solid ${GRID}`;

  const hasMulti = segments.length > 1;

  // ─── Compute global bounds across all segments ───
  const totalKm = segments.reduce((s, d) => s + d.totalDistance, 0);
  const allEle = segments.flatMap(d => d.elevations);
  const minEle = Math.min(...allEle);
  const maxEle = Math.max(...allEle);

  // Project each point, threading cumulative km across segments
  const projectedPoints: ProjectedPoint[] = [];
  const segStartKm: number[] = []; // index at which each segment begins (cumulative)
  let kmAcc = 0;
  segments.forEach((seg, si) => {
    segStartKm.push(kmAcc);
    for (let pi = 0; pi < seg.distances.length; pi++) {
      const dist = seg.distances[pi];
      const ele = seg.elevations[pi];
      const kmGlobal = kmAcc + dist;
      const x = PAD + (kmGlobal / Math.max(totalKm, 0.001)) * (EW - PAD * 2);
      const y = EH - PAD - ((ele - minEle) / Math.max(1, maxEle - minEle)) * (EH - PAD * 2);
      projectedPoints.push({ x, y, segIdx: si, ptIdx: pi, ele, km: kmGlobal });
    }
    kmAcc += seg.totalDistance;
  });
  segStartKm.push(kmAcc); // push end-of-last

  // ─── Header bar ───
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 16px 4px;
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.22em;
    color: var(--color-ink); opacity: 0.85;
  `;

  const headerLabel = document.createElement('span');
  const headerLink = document.createElement('a');
  if (gpxHref) {
    headerLink.href = gpxHref;
    headerLink.setAttribute('download', '');
    headerLink.style.cssText = `color: ${ACCENT}; text-decoration: none; border-bottom: 1px solid ${ACCENT}; padding-bottom: 1px; letter-spacing: 0.18em; font-size: 10px;`;
    headerLink.textContent = '↓ TÉLÉCHARGER .GPX';
  }

  header.appendChild(headerLabel);
  if (gpxHref) header.appendChild(headerLink);
  container.appendChild(header);

  // ─── SVG ───
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${EW} ${EH}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.cssText = 'display: block; width: 100%; height: 130px; cursor: crosshair;';
  container.appendChild(svg);

  // Grid (25%, 50%, 75%)
  [0.25, 0.5, 0.75].forEach(f => {
    const line = document.createElementNS(SVG_NS, 'line');
    const y = PAD + f * (EH - PAD * 2);
    line.setAttribute('x1', String(PAD));
    line.setAttribute('x2', String(EW - PAD));
    line.setAttribute('y1', String(y));
    line.setAttribute('y2', String(y));
    line.setAttribute('stroke', GRID);
    line.setAttribute('stroke-width', '0.4');
    line.setAttribute('stroke-dasharray', '2 3');
    svg.appendChild(line);
  });

  // Segment groups (band + area + line + label). We keep refs so we can retint on activeSeg change.
  const segGroups: SVGGElement[] = [];

  segments.forEach((_, si) => {
    const g = document.createElementNS(SVG_NS, 'g');
    const startKm = segStartKm[si];
    const endKm = segStartKm[si + 1];
    const x1 = PAD + (startKm / totalKm) * (EW - PAD * 2);
    const x2 = PAD + (endKm / totalKm) * (EW - PAD * 2);

    // Segment divider (only for multi-loop, only between segments — not after the last)
    if (hasMulti && si < segments.length - 1) {
      const divider = document.createElementNS(SVG_NS, 'line');
      divider.setAttribute('x1', String(x2));
      divider.setAttribute('x2', String(x2));
      divider.setAttribute('y1', String(PAD));
      divider.setAttribute('y2', String(EH - PAD));
      divider.setAttribute('stroke', GRID);
      divider.setAttribute('stroke-width', '0.6');
      divider.setAttribute('stroke-dasharray', '3 3');
      g.appendChild(divider);
    }

    // "B.I" label
    if (hasMulti) {
      const t = document.createElementNS(SVG_NS, 'text');
      t.setAttribute('x', String((x1 + x2) / 2));
      t.setAttribute('y', String(PAD + 10));
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '9');
      t.setAttribute('font-family', 'var(--font-mono)');
      t.setAttribute('fill', INK);
      t.setAttribute('opacity', '0.55');
      t.setAttribute('letter-spacing', '1.5');
      t.textContent = `B.${ROMAN[si]}`;
      g.appendChild(t);
    }

    // Area + line
    const pts = projectedPoints.filter(p => p.segIdx === si);
    if (pts.length > 1) {
      const first = pts[0], last = pts[pts.length - 1];
      const areaD = `M${first.x.toFixed(1)},${EH - PAD} ` +
        pts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
        ` L${last.x.toFixed(1)},${EH - PAD} Z`;
      const lineD = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)} ` +
        pts.slice(1).map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

      const area = document.createElementNS(SVG_NS, 'path');
      area.setAttribute('d', areaD);
      area.setAttribute('fill', hasMulti ? segmentColors[si] : ACCENT);
      area.setAttribute('fill-opacity', '0.18');
      g.appendChild(area);

      const line = document.createElementNS(SVG_NS, 'path');
      line.setAttribute('d', lineD);
      line.setAttribute('fill', 'none');
      line.setAttribute('stroke', hasMulti ? segmentColors[si] : ACCENT);
      line.setAttribute('stroke-width', '1.8');
      line.setAttribute('stroke-linejoin', 'round');
      g.appendChild(line);
    }

    svg.appendChild(g);
    segGroups.push(g);
  });

  // Axis labels
  function mkText(x: number, y: number, content: string, anchor?: string) {
    const t = document.createElementNS(SVG_NS, 'text');
    t.setAttribute('x', String(x));
    t.setAttribute('y', String(y));
    t.setAttribute('font-size', '9');
    t.setAttribute('font-family', 'var(--font-mono)');
    t.setAttribute('fill', INK);
    t.setAttribute('opacity', '0.55');
    if (anchor) t.setAttribute('text-anchor', anchor);
    t.textContent = content;
    return t;
  }

  svg.appendChild(mkText(PAD, PAD - 4, `${Math.round(maxEle)}m`));
  svg.appendChild(mkText(PAD, EH - PAD + 10, `${Math.round(minEle)}m`));
  svg.appendChild(mkText(EW - PAD, EH - PAD + 10, `${totalKm.toFixed(1)} km`, 'end'));

  // Hover layer (line + dot)
  const hoverLine = document.createElementNS(SVG_NS, 'line');
  hoverLine.setAttribute('y1', String(PAD));
  hoverLine.setAttribute('y2', String(EH - PAD));
  hoverLine.setAttribute('stroke', INK);
  hoverLine.setAttribute('stroke-width', '1');
  hoverLine.setAttribute('stroke-dasharray', '2 2');
  hoverLine.setAttribute('opacity', '0');
  svg.appendChild(hoverLine);

  const hoverDot = document.createElementNS(SVG_NS, 'circle');
  hoverDot.setAttribute('r', '4');
  hoverDot.setAttribute('fill', ACCENT);
  hoverDot.setAttribute('stroke', BG);
  hoverDot.setAttribute('stroke-width', '1.5');
  hoverDot.setAttribute('opacity', '0');
  svg.appendChild(hoverDot);

  // ─── Apply active segment styling + update header label ───
  function applyActive() {
    segGroups.forEach((g, i) => {
      const active = activeSeg == null || activeSeg === i;
      g.setAttribute('opacity', active ? '1' : '0.25');
    });
    const dplus = activeSeg == null
      ? segments.reduce((s, d) => s + d.totalAscent, 0)
      : segments[activeSeg].totalAscent;
    headerLabel.textContent = `PROFIL ALTIMÉTRIQUE · +${Math.round(dplus)}M`;
  }
  applyActive();

  // ─── Pointer interaction ───
  function findNearestByX(xPct: number) {
    const targetX = PAD + xPct * (EW - PAD * 2);
    let best: ProjectedPoint | null = null;
    let bd = Infinity;
    for (const p of projectedPoints) {
      if (activeSeg != null && p.segIdx !== activeSeg) continue;
      const d = Math.abs(p.x - targetX);
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  }

  function onPointerMove(e: PointerEvent) {
    const r = svg.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    // Map pct (0..1 in pixel space) to (0..1 in padded range)
    const padFrac = PAD / EW;
    const effPct = Math.max(0, Math.min(1, (pct - padFrac) / Math.max(0.001, 1 - 2 * padFrac)));
    const best = findNearestByX(effPct);
    if (best) {
      setHoverInternal(best);
      onHover?.(best.segIdx, best.ptIdx);
    }
  }

  function onPointerLeave() {
    clearHoverInternal();
    onLeave?.();
  }

  function setHoverInternal(p: ProjectedPoint) {
    hoverLine.setAttribute('x1', String(p.x));
    hoverLine.setAttribute('x2', String(p.x));
    hoverLine.setAttribute('opacity', '0.5');
    hoverDot.setAttribute('cx', String(p.x));
    hoverDot.setAttribute('cy', String(p.y));
    hoverDot.setAttribute('opacity', '1');
  }

  function clearHoverInternal() {
    hoverLine.setAttribute('opacity', '0');
    hoverDot.setAttribute('opacity', '0');
  }

  svg.addEventListener('pointermove', onPointerMove);
  svg.addEventListener('pointerleave', onPointerLeave);

  return {
    setActiveSeg(i) {
      activeSeg = i;
      applyActive();
    },
    setHover(segIdx, ptIdx) {
      const p = projectedPoints.find(q => q.segIdx === segIdx && q.ptIdx === ptIdx);
      if (p) setHoverInternal(p);
    },
    clearHover() {
      clearHoverInternal();
    },
    destroy() {
      svg.removeEventListener('pointermove', onPointerMove);
      svg.removeEventListener('pointerleave', onPointerLeave);
      container.innerHTML = '';
    },
  };
}
