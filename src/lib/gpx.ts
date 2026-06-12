import { readFile } from 'node:fs/promises';

export interface TrackPoint {
  lat: number;
  lon: number;
  ele: number;
  dist: number;
}

export interface Track {
  points?: TrackPoint[];
  coords: [number, number][];
  elevations: number[];
  distances: number[];
  totalDistance: number;
  totalAscent: number;
  totalDescent: number;
  minEle: number;
  maxEle: number;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const TRK_RE = /<trk\b[^>]*>([\s\S]*?)<\/trk>/gi;
const TRKPT_RE = /<trkpt\b([^>]*)>([\s\S]*?)<\/trkpt>/gi;
const ATTR_RE = /(\w+)\s*=\s*"([^"]*)"/g;
const ELE_RE = /<ele>([^<]+)<\/ele>/i;

function buildTrack(points: TrackPoint[]): Track {
  const coords: [number, number][] = [];
  const elevations: number[] = [];
  const distances: number[] = [];
  let totalAscent = 0;
  let totalDescent = 0;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (i > 0) {
      const prev = points[i - 1];
      p.dist = prev.dist + haversine(prev.lat, prev.lon, p.lat, p.lon);
      const d = p.ele - prev.ele;
      if (d > 0) totalAscent += d; else totalDescent += -d;
    } else {
      p.dist = 0;
    }
    coords.push([p.lon, p.lat]);
    elevations.push(p.ele);
    distances.push(p.dist);
  }

  return {
    points,
    coords,
    elevations,
    distances,
    totalDistance: points.length ? points[points.length - 1].dist : 0,
    totalAscent,
    totalDescent,
    minEle: elevations.length ? Math.min(...elevations) : 0,
    maxEle: elevations.length ? Math.max(...elevations) : 0,
  };
}

function extractPoints(trkXml: string): TrackPoint[] {
  const points: TrackPoint[] = [];
  let m: RegExpExecArray | null;
  TRKPT_RE.lastIndex = 0;
  while ((m = TRKPT_RE.exec(trkXml)) !== null) {
    const attrs = m[1];
    const inner = m[2];
    const attrMap: Record<string, string> = {};
    ATTR_RE.lastIndex = 0;
    let a: RegExpExecArray | null;
    while ((a = ATTR_RE.exec(attrs)) !== null) attrMap[a[1]] = a[2];
    const lat = parseFloat(attrMap.lat);
    const lon = parseFloat(attrMap.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const eleMatch = inner.match(ELE_RE);
    const ele = eleMatch ? parseFloat(eleMatch[1]) : 0;
    points.push({ lat, lon, ele, dist: 0 });
  }
  return points;
}

export async function parseGpxFile(path: string): Promise<Track[]> {
  const xml = await readFile(path, 'utf8');
  const tracks: Track[] = [];
  let m: RegExpExecArray | null;
  TRK_RE.lastIndex = 0;
  while ((m = TRK_RE.exec(xml)) !== null) {
    const points = extractPoints(m[1]);
    if (points.length) tracks.push(buildTrack(points));
  }
  if (tracks.length === 0) {
    const points = extractPoints(xml);
    if (points.length) tracks.push(buildTrack(points));
  }
  return tracks;
}

export interface TrackSummary {
  totalDistance: number;
  totalAscent: number;
  totalDescent: number;
  minEle: number;
  maxEle: number;
}

export function summarize(tracks: Track[]): TrackSummary {
  const totalDistance = tracks.reduce((s, t) => s + t.totalDistance, 0);
  const totalAscent = tracks.reduce((s, t) => s + t.totalAscent, 0);
  const totalDescent = tracks.reduce((s, t) => s + t.totalDescent, 0);
  const minEle = tracks.length ? Math.min(...tracks.map(t => t.minEle)) : 0;
  const maxEle = tracks.length ? Math.max(...tracks.map(t => t.maxEle)) : 0;
  return { totalDistance, totalAscent, totalDescent, minEle, maxEle };
}
