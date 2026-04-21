// Variation 3 — TERROIR CONTEMPORAIN · Trail des Tectosages
// Magazine editorial, crème chaud + rouille, index numéroté romain.

const HybridLanding = ({ assets, gpx }) => {
  const [epreuve, setEpreuve] = React.useState('copilos');
  const [scrollY, setScrollY] = React.useState(0);
  const rootRef = React.useRef(null);
  React.useEffect(() => {
    const el = rootRef.current; if (!el) return;
    const on = () => setScrollY(el.scrollTop);
    el.addEventListener('scroll', on); return () => el.removeEventListener('scroll', on);
  }, []);

  const epreuves = [
    { id: 'copilos', rom: 'I', name: 'DÉFI DE COPILOS', sig: 'L\'épreuve reine · 4 boucles', dist: '30', unit: 'km', dplus: '+1050', depart: '15h45', desc: 'Quatre boucles à enchaîner dans un temps imparti. Chaque passage qualifie ou élimine. Aux finissants, le titre d\'Héritier de Copilos — dernier chef gaulois des Tectosages.' },
    { id: 'oppidum', rom: 'II', name: 'LA BOUCLE DE L\'OPPIDUM', sig: 'Chronométrée · classée', dist: '6.3', unit: 'km', dplus: '+228', depart: '16h15', desc: 'Boucle unique sur les traces de l\'oppidum tectosage. Sous-bois, coteaux, crêtes au-dessus de la Garonne.' },
    { id: 'oppidog', rom: 'III', name: 'L\'OPPI-DOG', sig: 'Canicross chronométré', dist: '6.3', unit: 'km', dplus: '+228', depart: '16h30', desc: 'La boucle en canicross. Points d\'eau pour les chiens, équipement réglementaire exigé.' },
    { id: 'sages', rom: 'IV', name: 'LA RANDO DES SAGES', sig: 'Marche libre', dist: '6.3', unit: 'km', dplus: '+228', depart: '16h30', desc: 'Non chronométrée. Marche contemplative sur les sentiers historiques du village.' },
    { id: 'tectokids', rom: 'V', name: 'LA TECTOKIDS', sig: 'Course enfants', dist: '1–3', unit: 'km', dplus: '—', depart: '18h00', desc: 'Boucles courtes, dossard, médaille en terre cuite. La relève des Tectosages.' },
  ];
  const c = epreuves.find(x => x.id === epreuve);
  const keyMap = { copilos:'defi-copilos', oppidum:'oppidum', oppidog:'oppidog', sages:'sages', tectokids:'tectokids' };
  const hrefMap = { copilos:'uploads/defi-copilos.gpx', oppidum:'uploads/oppidum.gpx', oppidog:'uploads/oppi-dog.gpx', sages:'uploads/randonnee-sages.gpx', tectokids:'uploads/tectokids.gpx' };

  const Mark = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke={color} strokeWidth="0.8"/>
      <path d="M10 2 L10 18 M2 10 L18 10 M4 4 L16 16 M4 16 L16 4" stroke={color} strokeWidth="0.5" opacity="0.5"/>
      <circle cx="10" cy="10" r="2" fill={color}/>
    </svg>
  );

  return (
    <div ref={rootRef} style={{ width: '100%', height: '100%', overflow: 'auto', background: '#ece4d1', color: '#2a1f15', fontFamily: '"Geist", sans-serif', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, opacity: 0.08,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
        mixBlendMode: 'multiply' }}/>

      <header style={{ position: 'sticky', top: 0, zIndex: 20, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '16px 32px', background: scrollY > 50 ? 'rgba(236,228,209,0.94)' : 'transparent', backdropFilter: scrollY > 50 ? 'blur(12px)' : 'none', borderBottom: scrollY > 50 ? '1px solid rgba(42,31,21,0.15)' : '1px solid transparent', transition: 'all .3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Mark size={28} color="#6b3410"/>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 18, fontStyle: 'italic' }}>Trail des Tectosages</div>
            <div style={{ fontSize: 10, letterSpacing: '0.22em', opacity: 0.5, fontFamily: '"JetBrains Mono", monospace', marginTop: 3 }}>VIEILLE-TOULOUSE · MMXXVI</div>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 24, fontSize: 12, letterSpacing: '0.12em', fontWeight: 500 }}>
          {['ÉPREUVES','HISTOIRE','BANQUET','ENGAGEMENT'].map(x => <a key={x} style={{ color: 'inherit', textDecoration: 'none' }}>{x}</a>)}
        </nav>
        <div style={{ textAlign: 'right' }}>
          <button style={{ background: '#6b3410', color: '#ece4d1', border: 'none', padding: '10px 22px', fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', cursor: 'pointer', fontFamily: 'inherit' }}>S'INSCRIRE</button>
        </div>
      </header>

      <section style={{ padding: '40px 32px 80px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 40, right: 40, opacity: 0.08, pointerEvents: 'none' }}><Mark size={320} color="#6b3410"/></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'stretch' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 620 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
                <div style={{ width: 40, height: 1, background: '#6b3410' }}/>
                <span style={{ fontSize: 10, letterSpacing: '0.3em', fontFamily: '"JetBrains Mono", monospace', color: '#6b3410' }}>SAMEDI III · X · MMXXVI</span>
              </div>
              <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 120, lineHeight: 0.88, fontWeight: 400, letterSpacing: '-0.03em', margin: 0 }}>
                Sur la trace<br/><span style={{ fontStyle: 'italic', color: '#6b3410' }}>des Volques</span><br/>Tectosages.
              </h1>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 40 }}>
              <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0, textWrap: 'pretty' }}>
                Il y a 2300 ans, Vieille-Toulouse était la capitale du peuple des <em>Volques Tectosages</em>. Esprit de conquête, courage, bravoure, honneur.
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0, opacity: 0.85, textWrap: 'pretty' }}>
                Cinq épreuves, un seul territoire. Pour certains, le redoutable <strong>Défi de Copilos</strong> — dernier chef gaulois des Tectosages.
              </p>
            </div>
          </div>
          <div style={{ position: 'relative', overflow: 'hidden', minHeight: 620 }}>
            <img src={assets.photo} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.05)', transform: `scale(${1 + scrollY * 0.0003})` }}/>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(42,31,21,0.5), transparent 40%)' }}/>
            <div style={{ position: 'absolute', top: 24, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: '0.22em', fontFamily: '"JetBrains Mono", monospace', color: 'rgba(236,228,209,0.85)' }}>
              <span>43°31′N · 1°28′E</span><span>ALT. 186M</span>
            </div>
            <div style={{ position: 'absolute', bottom: 24, left: 24, fontSize: 10, letterSpacing: '0.22em', fontFamily: '"JetBrains Mono", monospace', color: 'rgba(236,228,209,0.85)' }}>COTEAUX · GARONNE</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', marginTop: 60, padding: '24px 0', gap: 24, borderTop: '1px solid #2a1f15', borderBottom: '1px solid #2a1f15' }}>
          {[['V', 'Épreuves'], ['IV', 'Boucles du Défi'], ['XXX', 'km reine'], ['MC', 'D+ total'], ['MMCCC', 'Ans d\'histoire']].map(([r, l], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: 32, fontStyle: 'italic', color: '#6b3410' }}>{r}</span>
              <span style={{ fontSize: 11, letterSpacing: '0.18em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.65 }}>{l.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '60px 32px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 56 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.3em', fontFamily: '"JetBrains Mono", monospace', color: '#6b3410', marginBottom: 16 }}>— CHAPITRE I · LES ÉPREUVES</div>
            <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 88, lineHeight: 0.88, fontWeight: 400, margin: 0, letterSpacing: '-0.03em' }}>Cinq<br/><em>épreuves</em>.</h2>
          </div>
          <p style={{ fontSize: 16, maxWidth: 420, lineHeight: 1.55, margin: 0, textWrap: 'pretty' }}>Du Défi de Copilos à la Tectokids, chacune et chacun trouve sa boucle — sur le même territoire, ancien pays des Tectosages.</p>
        </div>

        <div style={{ borderTop: '1px solid #2a1f15' }}>
          {epreuves.map((x) => (
            <div key={x.id} onClick={() => setEpreuve(x.id)}
              onMouseEnter={(e) => { if (x.id !== epreuve) e.currentTarget.style.background = 'rgba(107,52,16,0.05)'; }}
              onMouseLeave={(e) => { if (x.id !== epreuve) e.currentTarget.style.background = 'transparent'; }}
              style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', alignItems: 'center', gap: 40, padding: '28px 24px', borderBottom: '1px solid #2a1f15', cursor: 'pointer', background: x.id === epreuve ? 'rgba(107,52,16,0.08)' : 'transparent', transition: 'background .2s' }}>
              <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 32, fontStyle: 'italic', color: '#6b3410', width: 50, lineHeight: 1 }}>{x.rom}</div>
              <div>
                <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 44, fontWeight: 400, lineHeight: 1, letterSpacing: '-0.02em' }}>{x.name}</div>
                <div style={{ fontSize: 12, letterSpacing: '0.12em', opacity: 0.6, fontFamily: '"JetBrains Mono", monospace', marginTop: 8 }}>{x.sig.toUpperCase()}</div>
              </div>
              <div style={{ display: 'flex', gap: 24, fontFamily: '"JetBrains Mono", monospace', fontSize: 13 }}>
                <div><div style={{ fontSize: 10, letterSpacing: '0.22em', opacity: 0.5, marginBottom: 4 }}>DIST.</div><div style={{ fontWeight: 600 }}>{x.dist} {x.unit}</div></div>
                <div><div style={{ fontSize: 10, letterSpacing: '0.22em', opacity: 0.5, marginBottom: 4 }}>D+</div><div style={{ fontWeight: 600 }}>{x.dplus}m</div></div>
                <div><div style={{ fontSize: 10, letterSpacing: '0.22em', opacity: 0.5, marginBottom: 4 }}>DÉPART</div><div style={{ fontWeight: 600 }}>{x.depart}</div></div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid #2a1f15', display: 'flex', alignItems: 'center', justifyContent: 'center', background: x.id === epreuve ? '#6b3410' : 'transparent', color: x.id === epreuve ? '#ece4d1' : '#2a1f15' }}>→</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 60, marginTop: 80, alignItems: 'flex-start' }}>
          <GpxMap
            id={'hy-' + epreuve}
            data={gpx[keyMap[epreuve]]}
            gpxHref={hrefMap[epreuve]}
            segmentLabels={epreuve === 'copilos' ? ['CONQUÊTE','COURAGE','BRAVOURE','HONNEUR'] : undefined}
            theme={{
              bg: '#d9cfb5', ink: '#2a1f15', accent: '#c94a1b',
              gridColor: 'rgba(42,31,21,0.22)',
              segmentColors: epreuve === 'copilos' ? ['#c94a1b','#8b5a2b','#4a6b3a','#2a1f15'] : undefined,
              font: '"Instrument Serif", serif',
              monoFont: '"JetBrains Mono", monospace',
              paperStyle: 'hatch',
              profileBg: '#ece4d1',
              border: '1px solid #2a1f15',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 24 }}>
              <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: 64, fontStyle: 'italic', color: '#6b3410' }}>{c.rom}</span>
              <span style={{ fontSize: 11, letterSpacing: '0.3em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.6 }}>{c.name}</span>
            </div>
            <h3 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 56, fontWeight: 400, lineHeight: 0.95, margin: '0 0 32px', letterSpacing: '-0.025em' }}><em>{c.sig}</em></h3>
            <p style={{ fontSize: 17, lineHeight: 1.55, opacity: 0.85, margin: 0, textWrap: 'pretty' }}>{c.desc}</p>
            {c.id === 'copilos' && (
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.3em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.6, marginBottom: 16 }}>QUATRE BOUCLES · QUATRE VALEURS</div>
                {[['I','Conquête','12 km','+400m'],['II','Courage','6 km','+220m'],['III','Bravoure','6 km','+220m'],['IV','Honneur','6 km','+220m']].map((b, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '30px 1fr auto auto', gap: 16, padding: '10px 0', borderTop: '1px solid rgba(42,31,21,0.12)', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: 22, fontStyle: 'italic', color: '#6b3410' }}>{b[0]}</span>
                    <span style={{ fontSize: 15, fontStyle: 'italic' }}>« {b[1]} »</span>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, opacity: 0.7 }}>{b[2]}</span>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, opacity: 0.7 }}>{b[3]}</span>
                  </div>
                ))}
              </div>
            )}
            <button style={{ background: 'transparent', color: '#6b3410', border: '1px solid #6b3410', padding: '14px 28px', fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', cursor: 'pointer', fontFamily: 'inherit', marginTop: 40 }}>S'INSCRIRE →</button>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 32px', background: '#2a1f15', color: '#ece4d1' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 60, alignItems: 'flex-start', marginBottom: 60 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.3em', fontFamily: '"JetBrains Mono", monospace', color: '#d4a574', marginBottom: 16 }}>— CHAPITRE II</div>
            <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 72, lineHeight: 0.9, fontWeight: 400, margin: 0, letterSpacing: '-0.025em' }}>Le <em>Banquet</em><br/>des Chefs.</h2>
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.6, opacity: 0.8, margin: '20px 0 0', maxWidth: 520, textWrap: 'pretty' }}>La course tombée avec le soleil, coureurs, familles et village se retrouvent — banquet organisé par le Comité des Fêtes. Tables longues, produits du Lauragais, veillée. Inscription séparée.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(236,228,209,0.15)' }}>
          {[
            { t: 'DOSSARDS', r: 'I', l: ['Vendredi 2/10 · 17h–20h', 'Samedi 3/10 · dès 13h', 'Salle polyvalente'] },
            { t: 'PARKING', r: 'II', l: ['Gratuit · aire du village', '400 m du départ', 'Covoit. conseillé'] },
            { t: 'RAVITOS', r: 'III', l: ['4 points · Copilos', '2 points · autres', 'Final au village'] },
          ].map((x, i) => (
            <div key={i} style={{ background: '#2a1f15', padding: 36 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 32 }}>
                <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: 40, fontStyle: 'italic', color: '#d4a574' }}>{x.r}</span>
                <span style={{ fontSize: 11, letterSpacing: '0.22em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.6 }}>{x.t}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {x.l.map((l, j) => <li key={j} style={{ fontSize: 14, opacity: 0.85, borderBottom: j < x.l.length - 1 ? '1px solid rgba(236,228,209,0.12)' : 'none', paddingBottom: 10 }}>{l}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 32px', background: '#ece4d1' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 60, alignItems: 'center' }}>
          <div style={{ width: 200, height: 200, background: '#fff', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(42,31,21,0.15)' }}>
            <img src={assets.marieLouise} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}/>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.3em', fontFamily: '"JetBrains Mono", monospace', color: '#6b3410', marginBottom: 16 }}>— CHAPITRE III · NOTRE ENGAGEMENT</div>
            <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 52, lineHeight: 1, fontWeight: 400, margin: '0 0 20px' }}>Une part des inscriptions<br/>reversée à la <em style={{ color: '#6b3410' }}>Fondation Marie-Louise</em>.</h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.85, margin: 0, maxWidth: 620, textWrap: 'pretty' }}>Le Trail des Tectosages s'engage au côté de la Fondation Marie-Louise, dont l'action caritative est portée par le Lions Club Toulouse Arènes Romaines.</p>
          </div>
        </div>
      </section>

      <section style={{ padding: '120px 32px', textAlign: 'center', position: 'relative', background: '#ece4d1', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', opacity: 0.06, pointerEvents: 'none' }}><Mark size={560} color="#6b3410"/></div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.3em', fontFamily: '"JetBrains Mono", monospace', color: '#6b3410', marginBottom: 32 }}>— III · X · MMXXVI · INSCRIPTIONS OUVERTES</div>
          <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 160, lineHeight: 0.85, fontWeight: 400, letterSpacing: '-0.04em', margin: '0 0 48px' }}>Héritier de<br/><em style={{ color: '#6b3410' }}>Copilos</em> ?</h2>
          <button style={{ background: '#6b3410', color: '#ece4d1', border: 'none', padding: '22px 48px', fontSize: 13, fontWeight: 600, letterSpacing: '0.2em', cursor: 'pointer', fontFamily: 'inherit' }}>PRENDRE SON DOSSARD →</button>
        </div>
      </section>

      <footer style={{ padding: '32px', borderTop: '1px solid rgba(42,31,21,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.22em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.6 }}>TRAIL DES TECTOSAGES · VIEILLE-TOULOUSE · MMXXVI</div>
          <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
            <img src={assets.lions} style={{ height: 70, objectFit: 'contain' }}/>
            <img src={assets.marieLouise} style={{ height: 60, objectFit: 'contain' }}/>
          </div>
        </div>
      </footer>
    </div>
  );
};

window.HybridLanding = HybridLanding;
