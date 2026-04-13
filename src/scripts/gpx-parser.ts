export interface TrackPoint {
  lat: number;
  lon: number;
  ele: number;
  dist: number; // cumulative distance in km
}

export interface TrackData {
  points: TrackPoint[];
  coords: [number, number][]; // [lon, lat] for GeoJSON
  elevations: number[];
  distances: number[]; // km
  totalDistance: number;
  minEle: number;
  maxEle: number;
  totalAscent: number;
  totalDescent: number;
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

function parseTrackPoints(trkpts: NodeListOf<Element>): TrackData {
  const points: TrackPoint[] = [];
  const coords: [number, number][] = [];
  const elevations: number[] = [];
  const distances: number[] = [];
  let cumDist = 0;
  let totalAscent = 0;
  let totalDescent = 0;

  trkpts.forEach((pt, i) => {
    const lat = parseFloat(pt.getAttribute('lat')!);
    const lon = parseFloat(pt.getAttribute('lon')!);
    const ele = parseFloat(pt.querySelector('ele')?.textContent || '0');

    if (i > 0) {
      const prev = points[i - 1];
      cumDist += haversine(prev.lat, prev.lon, lat, lon);
      const diff = ele - prev.ele;
      if (diff > 0) totalAscent += diff;
      else totalDescent += Math.abs(diff);
    }

    points.push({ lat, lon, ele, dist: cumDist });
    coords.push([lon, lat]);
    elevations.push(ele);
    distances.push(cumDist);
  });

  return {
    points,
    coords,
    elevations,
    distances,
    totalDistance: cumDist,
    minEle: Math.min(...elevations),
    maxEle: Math.max(...elevations),
    totalAscent,
    totalDescent,
  };
}

/** Parse a single-track GPX file → one TrackData */
export async function parseGPX(url: string): Promise<TrackData> {
  const resp = await fetch(url);
  const text = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  const trkpts = doc.querySelectorAll('trkpt');
  return parseTrackPoints(trkpts);
}

/** Parse a multi-track GPX file → one TrackData per <trk> element */
export async function parseMultiTrackGPX(url: string): Promise<TrackData[]> {
  const resp = await fetch(url);
  const text = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  const tracks = doc.querySelectorAll('trk');

  const results: TrackData[] = [];
  tracks.forEach((trk) => {
    const trkpts = trk.querySelectorAll('trkpt');
    if (trkpts.length > 0) {
      results.push(parseTrackPoints(trkpts));
    }
  });

  return results;
}
