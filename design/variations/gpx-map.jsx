// GpxMap — tracé GPX + profil d'élévation, gère les segments (boucles).
// Props:
//   data      : { segments: [{index, pts, stats}], bounds, stats }
//   theme     : { bg, ink, accent, gridColor, segmentColors?, font, monoFont, paperStyle, profileBg?, border? }
//   height    : map height in px
//   showStats : bool
//   gpxHref   : download link href
//   id        : dom-unique id
//   segmentLabels : array of labels for segments (optional)

const GpxMap = ({ data, theme, showStats = true, gpxHref, id = 'gpx', segmentLabels }) => {
  const [hover, setHover] = React.useState(null); // {segIdx, ptIdx}
  const [activeSeg, setActiveSeg] = React.useState(null); // null = all, or index
  const mapRef = React.useRef(null);
  const elevRef = React.useRef(null);

  if (!data) return <div style={{ background: theme.bg, color: theme.ink, padding: 40 }}>Chargement…</div>;
  const { segments, bounds, stats } = data;
  const hasMulti = segments.length > 1;

  const W = 600, H = 440;
  const pad = 40;
  const latMid = (bounds.minLat + bounds.maxLat) / 2;
  const lonScale = Math.cos((latMid * Math.PI) / 180);
  const rawW = (bounds.maxLon - bounds.minLon) * lonScale;
  const rawH = bounds.maxLat - bounds.minLat;
  const scale = Math.min((W - pad * 2) / rawW, (H - pad * 2) / rawH);
  const offX = (W - rawW * scale) / 2;
  const offY = (H - rawH * scale) / 2;
  const project = (lat, lon) => [
    offX + (lon - bounds.minLon) * lonScale * scale,
    offY + (bounds.maxLat - lat) * scale,
  ];

  // segment color — default derived from accent with alpha variation
  const segColors = theme.segmentColors || segments.map(() => theme.accent);

  // projected paths per segment
  const projectedSegs = segments.map(s => s.pts.map(p => project(p.lat, p.lon)));
  const pathDs = projectedSegs.map(pts => pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' '));

  // Elevation profile — concatenate segments end-to-end along cumulative km
  const EW = 600, EH = 130, ePad = 18;
  const minE = bounds.minEle, maxE = bounds.maxEle;
  const maxKm = stats.distKm;
  const eleAll = []; // {x, y, segIdx, ptIdx, ele, km}
  segments.forEach((seg, si) => {
    seg.pts.forEach((p, pi) => {
      eleAll.push({
        x: ePad + (p.km / maxKm) * (EW - ePad * 2),
        y: EH - ePad - ((p.ele - minE) / Math.max(1, maxE - minE)) * (EH - ePad * 2),
        segIdx: si, ptIdx: pi, ele: p.ele, km: p.km, lat: p.lat, lon: p.lon,
      });
    });
  });

  // segment boundaries on profile
  const segBoundsKm = [];
  let acc = 0;
  segments.forEach(s => { segBoundsKm.push(acc); acc += s.stats.distKm; });
  segBoundsKm.push(acc);

  const onMapMove = (e) => {
    const svg = mapRef.current;
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const y = ((e.clientY - r.top) / r.height) * H;
    let best = null, d2 = Infinity;
    projectedSegs.forEach((pts, si) => {
      if (activeSeg != null && si !== activeSeg) return;
      pts.forEach(([px, py], pi) => {
        const d = (px-x)**2 + (py-y)**2;
        if (d < d2) { d2 = d; best = { segIdx: si, ptIdx: pi }; }
      });
    });
    if (best && d2 < 900) setHover(best); else setHover(null);
  };
  const onEleMove = (e) => {
    const svg = elevRef.current;
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * EW;
    let best = null, bd = Infinity;
    eleAll.forEach(p => {
      if (activeSeg != null && p.segIdx !== activeSeg) return;
      const d = Math.abs(p.x - x);
      if (d < bd) { bd = d; best = { segIdx: p.segIdx, ptIdx: p.ptIdx }; }
    });
    setHover(best);
  };

  const hPt = hover ? segments[hover.segIdx].pts[hover.ptIdx] : null;
  const hMapXY = hover ? projectedSegs[hover.segIdx][hover.ptIdx] : null;
  const hEleXY = hover ? (() => {
    const f = eleAll.find(p => p.segIdx === hover.segIdx && p.ptIdx === hover.ptIdx);
    return f ? [f.x, f.y] : null;
  })() : null;

  const paper = theme.paperStyle || 'dotted';
  const startPt = projectedSegs[0][0];

  return (
    <div style={{ background: theme.bg, color: theme.ink, fontFamily: theme.font, width: '100%', border: theme.border || 'none' }}>
      {/* Segment selector for multi-loop routes */}
      {hasMulti && (
        <div style={{
          display: 'flex', gap: 1, background: theme.gridColor, borderBottom: `1px solid ${theme.gridColor}`,
        }}>
          <button onClick={() => setActiveSeg(null)}
            style={{
              flex: 1, padding: '12px 14px',
              background: activeSeg == null ? theme.ink : theme.bg,
              color: activeSeg == null ? theme.bg : theme.ink,
              border: 'none', cursor: 'pointer', fontFamily: theme.monoFont,
              fontSize: 10, letterSpacing: '0.22em', fontWeight: 600,
            }}>VUE COMPLÈTE</button>
          {segments.map((s, i) => (
            <button key={i} onClick={() => setActiveSeg(i)}
              style={{
                flex: 1, padding: '12px 14px',
                background: activeSeg === i ? segColors[i] : theme.bg,
                color: activeSeg === i ? theme.bg : theme.ink,
                border: 'none', cursor: 'pointer', fontFamily: theme.monoFont,
                fontSize: 10, letterSpacing: '0.18em', fontWeight: 600, lineHeight: 1.3,
              }}>
              <div>{segmentLabels ? segmentLabels[i] : `BOUCLE ${['I','II','III','IV','V'][i]}`}</div>
              <div style={{ opacity: 0.7, fontSize: 9, marginTop: 3, letterSpacing: '0.12em' }}>{s.stats.distKm} KM · +{s.stats.dplus}M</div>
            </button>
          ))}
        </div>
      )}

      {/* Map */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: `${W} / ${H}` }}>
        <svg
          ref={mapRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={onMapMove}
          onMouseLeave={() => setHover(null)}
          style={{ display: 'block', width: '100%', height: 'auto', cursor: 'crosshair' }}
        >
          <defs>
            {paper === 'topo' && (
              <pattern id={`topo-${id}`} width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="14" fill="none" stroke={theme.gridColor} strokeWidth="0.4"/>
                <circle cx="20" cy="20" r="8" fill="none" stroke={theme.gridColor} strokeWidth="0.4"/>
              </pattern>
            )}
            {paper === 'dotted' && (
              <pattern id={`dot-${id}`} width="18" height="18" patternUnits="userSpaceOnUse">
                <circle cx="9" cy="9" r="0.7" fill={theme.gridColor}/>
              </pattern>
            )}
            {paper === 'hatch' && (
              <pattern id={`hatch-${id}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke={theme.gridColor} strokeWidth="0.4"/>
              </pattern>
            )}
          </defs>
          <rect width={W} height={H} fill={
            paper === 'smooth' ? theme.bg :
            paper === 'topo' ? `url(#topo-${id})` :
            paper === 'hatch' ? `url(#hatch-${id})` :
            `url(#dot-${id})`
          }/>

          {/* Dimmed other segments */}
          {pathDs.map((d, i) => (activeSeg != null && activeSeg !== i) && (
            <path key={`dim-${i}`} d={d} fill="none" stroke={theme.ink} strokeOpacity="0.1" strokeWidth="2" strokeLinecap="round"/>
          ))}

          {/* Active segment(s) with shadow */}
          {pathDs.map((d, i) => {
            const active = activeSeg == null || activeSeg === i;
            if (!active) return null;
            return (
              <g key={`seg-${i}`}>
                <path d={d} fill="none" stroke={theme.ink} strokeOpacity="0.15" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
                <path d={d} fill="none" stroke={segColors[i]} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
            );
          })}

          {/* Start marker */}
          <g>
            <circle cx={startPt[0]} cy={startPt[1]} r="14" fill="none" stroke={theme.accent} strokeWidth="1.5" strokeDasharray="2 2"/>
            <circle cx={startPt[0]} cy={startPt[1]} r="6" fill={theme.accent}/>
            <text x={startPt[0] + 18} y={startPt[1] + 4} fontSize="10" fontFamily={theme.monoFont} fontWeight="700" fill={theme.ink} letterSpacing="1.5">DÉPART</text>
          </g>

          {/* Segment end labels for multi-loop */}
          {hasMulti && segments.map((s, i) => {
            const lastPt = projectedSegs[i][projectedSegs[i].length - 1];
            const label = ['I','II','III','IV','V'][i];
            return (
              <g key={`end-${i}`} opacity={activeSeg == null || activeSeg === i ? 1 : 0.3}>
                <circle cx={lastPt[0]} cy={lastPt[1]} r="11" fill={theme.bg} stroke={segColors[i]} strokeWidth="1.5"/>
                <text x={lastPt[0]} y={lastPt[1]+3.5} textAnchor="middle" fontSize="10" fontFamily={theme.font} fontStyle="italic" fontWeight="600" fill={theme.ink}>{label}</text>
              </g>
            );
          })}

          {/* Hover marker */}
          {hMapXY && (
            <g>
              <circle cx={hMapXY[0]} cy={hMapXY[1]} r="12" fill="none" stroke={theme.accent} strokeWidth="1.5" opacity="0.5"/>
              <circle cx={hMapXY[0]} cy={hMapXY[1]} r="5" fill={theme.ink} stroke={theme.bg} strokeWidth="1.5"/>
            </g>
          )}

          {/* Compass */}
          <g transform={`translate(${W - 40}, 30)`}>
            <text x="0" y="0" fontSize="11" fontFamily={theme.monoFont} fill={theme.ink} opacity="0.6" textAnchor="middle" fontWeight="600">N</text>
            <line x1="0" y1="4" x2="0" y2="22" stroke={theme.ink} strokeWidth="1" opacity="0.6"/>
            <polygon points="0,4 -3,10 3,10" fill={theme.ink} opacity="0.6"/>
          </g>
        </svg>

        {showStats && (
          <div style={{
            position: 'absolute', top: 16, left: 16,
            fontFamily: theme.monoFont, fontSize: 10, letterSpacing: '0.18em',
            color: theme.ink, opacity: 0.75, lineHeight: 1.8, pointerEvents: 'none',
          }}>
            <div>{activeSeg == null ? 'TRACÉ COMPLET' : `BOUCLE ${['I','II','III','IV','V'][activeSeg]}`}</div>
            <div>{activeSeg == null ? stats.distKm.toFixed(2) : segments[activeSeg].stats.distKm.toFixed(2)} KM · +{activeSeg == null ? stats.dplus : segments[activeSeg].stats.dplus}M</div>
            <div>ALT. {bounds.minEle}–{bounds.maxEle} M</div>
          </div>
        )}

        {hPt && (
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            background: theme.ink, color: theme.bg, padding: '8px 12px',
            fontFamily: theme.monoFont, fontSize: 10, letterSpacing: '0.14em', lineHeight: 1.6,
            pointerEvents: 'none',
          }}>
            KM {hPt.km.toFixed(2)} · ALT {hPt.ele} M
          </div>
        )}
      </div>

      {/* Elevation profile */}
      <div style={{ background: theme.profileBg || theme.bg, borderTop: `1px solid ${theme.gridColor}` }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 16px 4px', fontFamily: theme.monoFont, fontSize: 10, letterSpacing: '0.22em', opacity: 0.75,
        }}>
          <span>PROFIL ALTIMÉTRIQUE · +{activeSeg == null ? stats.dplus : segments[activeSeg].stats.dplus}M</span>
          {gpxHref && (
            <a href={gpxHref} download style={{ color: theme.accent, textDecoration: 'none', borderBottom: `1px solid ${theme.accent}`, paddingBottom: 1, letterSpacing: '0.18em' }}>
              ↓ TÉLÉCHARGER .GPX
            </a>
          )}
        </div>
        <svg
          ref={elevRef}
          viewBox={`0 0 ${EW} ${EH}`}
          preserveAspectRatio="none"
          onMouseMove={onEleMove}
          onMouseLeave={() => setHover(null)}
          style={{ display: 'block', width: '100%', height: 130, cursor: 'crosshair' }}
        >
          {/* Grid */}
          {[0.25, 0.5, 0.75].map(f => (
            <line key={f} x1={ePad} x2={EW - ePad} y1={ePad + f * (EH - ePad * 2)} y2={ePad + f * (EH - ePad * 2)} stroke={theme.gridColor} strokeWidth="0.4" strokeDasharray="2 3"/>
          ))}

          {/* Segment bands */}
          {hasMulti && segments.map((s, i) => {
            const x1 = ePad + (segBoundsKm[i] / maxKm) * (EW - ePad * 2);
            const x2 = ePad + (segBoundsKm[i+1] / maxKm) * (EW - ePad * 2);
            const active = activeSeg == null || activeSeg === i;
            const segEle = eleAll.filter(p => p.segIdx === i);
            const areaD = `M${segEle[0].x},${EH-ePad} ` + segEle.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ` L${segEle[segEle.length-1].x},${EH-ePad} Z`;
            const lineD = `M${segEle[0].x.toFixed(1)},${segEle[0].y.toFixed(1)} ` + segEle.slice(1).map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
            return (
              <g key={`eleseg-${i}`} opacity={active ? 1 : 0.25}>
                <line x1={x2} x2={x2} y1={ePad} y2={EH - ePad} stroke={theme.gridColor} strokeWidth="0.6" strokeDasharray="3 3"/>
                <text x={(x1+x2)/2} y={ePad + 10} textAnchor="middle" fontSize="9" fontFamily={theme.monoFont} fill={theme.ink} opacity="0.55" letterSpacing="1.5">B.{['I','II','III','IV','V'][i]}</text>
                <path d={areaD} fill={segColors[i]} fillOpacity="0.18"/>
                <path d={lineD} fill="none" stroke={segColors[i]} strokeWidth="1.8" strokeLinejoin="round"/>
              </g>
            );
          })}
          {!hasMulti && (() => {
            const pts = eleAll;
            const areaD = `M${pts[0].x},${EH-ePad} ` + pts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ` L${pts[pts.length-1].x},${EH-ePad} Z`;
            const lineD = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)} ` + pts.slice(1).map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
            return (
              <g>
                <path d={areaD} fill={theme.accent} fillOpacity="0.18"/>
                <path d={lineD} fill="none" stroke={theme.accent} strokeWidth="1.8" strokeLinejoin="round"/>
              </g>
            );
          })()}

          {/* Axis labels */}
          <text x={ePad} y={ePad - 4} fontSize="9" fontFamily={theme.monoFont} fill={theme.ink} opacity="0.55">{maxE}m</text>
          <text x={ePad} y={EH - ePad + 10} fontSize="9" fontFamily={theme.monoFont} fill={theme.ink} opacity="0.55">{minE}m</text>
          <text x={EW - ePad} y={EH - ePad + 10} textAnchor="end" fontSize="9" fontFamily={theme.monoFont} fill={theme.ink} opacity="0.55">{maxKm.toFixed(1)} km</text>

          {hEleXY && (
            <g>
              <line x1={hEleXY[0]} x2={hEleXY[0]} y1={ePad} y2={EH - ePad} stroke={theme.ink} strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
              <circle cx={hEleXY[0]} cy={hEleXY[1]} r="4" fill={theme.accent} stroke={theme.bg} strokeWidth="1.5"/>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

window.GpxMap = GpxMap;
