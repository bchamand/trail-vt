// Variation 2 — OUTDOOR PREMIUM (dark) · Trail des Tectosages
// Responsive: desktop ≥1024, tablet 640–1023, mobile <640

const useViewport = () => {
  const [w, setW] = React.useState(() => typeof window !== 'undefined' ? window.innerWidth : 1280);
  React.useEffect(() => {
    const onR = () => setW(window.innerWidth);
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);
  return { w, isMobile: w < 720, isTablet: w >= 720 && w < 1024 };
};

const OutdoorLanding = ({ assets, gpx }) => {
  const [epreuve, setEpreuve] = React.useState('copilos');
  const [scrollY, setScrollY] = React.useState(0);
  const [navOpen, setNavOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  const { w, isMobile, isTablet } = useViewport();
  React.useEffect(() => {
    const el = rootRef.current; if (!el) return;
    const onScroll = () => setScrollY(el.scrollTop);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Fluid scales
  const pad = isMobile ? 20 : isTablet ? 40 : 80;
  const heroTitle = isMobile ? 56 : isTablet ? 96 : 148;
  const h2 = isMobile ? 44 : isTablet ? 64 : 88;
  const h2Big = isMobile ? 52 : isTablet ? 72 : 96;
  const ctaTitle = isMobile ? 72 : isTablet ? 110 : 180;

  const epreuves = [
    { id: 'copilos', num: 'I', nom: 'DÉFI DE COPILOS', dist: '30', unit: 'KM', dplus: '1100', depart: '15h45', diff: 5, sig: 'L\'épreuve reine', desc: '4 boucles (12+6+6+6 km), qualification ou élimination à chaque passage. Seuls les Héritiers franchiront la ligne.' },
    { id: 'oppidum', num: 'II', nom: 'L\'OPPIDUM', dist: '12', unit: 'KM', dplus: '400', depart: '16h15', diff: 4, sig: 'Chronométrée · classée', desc: 'Boucle unique sur les traces de l\'oppidum tectosage. Sous-bois, coteaux, crêtes au-dessus de la Garonne.' },
    { id: 'oppidog', num: 'III', nom: 'OPPI-DOG', dist: '6', unit: 'KM', dplus: '180', depart: '16h30', diff: 3, sig: 'Canicross chronométré', desc: 'Sol forestier, points d\'eau pour les chiens, équipement canicross réglementaire.' },
    { id: 'sages', num: 'IV', nom: 'RANDO DES SAGES', dist: '6', unit: 'KM', dplus: '180', depart: '16h30', diff: 2, sig: 'Marche libre', desc: 'Non chronométrée. Une marche contemplative sur les sentiers historiques du village.' },
    { id: 'tectokids', num: 'V', nom: 'TECTOKIDS', dist: '1–3', unit: 'KM', dplus: '—', depart: '18h00', diff: 1, sig: 'La relève', desc: 'Boucles courtes, dossard, médaille en terre cuite. La relève des Tectosages.' },
  ];
  const c = epreuves.find(x => x.id === epreuve);

  const navLinks = ['ÉPREUVES', 'HISTOIRE', 'BANQUET', 'ENGAGEMENT'];

  return (
    <div ref={rootRef} style={{ width: '100%', height: '100%', overflow: 'auto', background: '#0f1412', color: '#e8e3d3', fontFamily: '"Geist", sans-serif', position: 'relative' }}>
      {/* HEADER */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '12px 16px' : '16px 32px',
        background: scrollY > 50 ? 'rgba(15,20,18,0.92)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(16px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(232,227,211,0.08)' : '1px solid transparent',
        transition: 'all .3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14 }}>
          <div style={{ width: isMobile ? 28 : 34, height: isMobile ? 28 : 34, border: '1.5px solid #d4a574', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Instrument Serif", serif', fontSize: isMobile ? 12 : 14, fontStyle: 'italic', color: '#d4a574', flexShrink: 0 }}>T</div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: isMobile ? 16 : 20, fontWeight: 400, letterSpacing: '0.005em' }}>Trail des <em style={{ color: '#d4a574' }}>Tectosages</em></span>
            <span style={{ fontSize: isMobile ? 9 : 10, letterSpacing: '0.24em', opacity: 0.6, fontFamily: '"JetBrains Mono", monospace', marginTop: 5 }}>ÉDITION I · MMXXVI</span>
          </div>
        </div>
        {isMobile ? (
          <button onClick={() => setNavOpen(o => !o)} aria-label="Menu" style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8e3d3" strokeWidth="1.6">
              {navOpen ? <path d="M5 5l14 14M19 5L5 19"/> : <><path d="M3 7h18"/><path d="M3 17h18"/></>}
            </svg>
          </button>
        ) : (
          <>
            <nav style={{ display: 'flex', gap: isTablet ? 18 : 28, fontSize: 12, fontWeight: 500, letterSpacing: '0.08em' }}>
              {navLinks.map(x => (<a key={x} style={{ color: '#e8e3d3', textDecoration: 'none' }}>{x}</a>))}
            </nav>
            <button style={{ background: '#d4a574', color: '#0f1412', border: 'none', padding: '10px 20px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'inherit' }}>S'INSCRIRE</button>
          </>
        )}
      </header>

      {/* Mobile nav drawer */}
      {isMobile && navOpen && (
        <div style={{ position: 'fixed', top: 52, left: 0, right: 0, zIndex: 29, background: 'rgba(10,14,12,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(232,227,211,0.1)', padding: '16px 20px 24px' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navLinks.map(x => <a key={x} style={{ color: '#e8e3d3', textDecoration: 'none', padding: '14px 0', fontSize: 14, letterSpacing: '0.1em', fontWeight: 500, borderBottom: '1px solid rgba(232,227,211,0.08)' }}>{x}</a>)}
          </nav>
          <button style={{ width: '100%', background: '#d4a574', color: '#0f1412', border: 'none', padding: '16px', fontSize: 13, fontWeight: 600, letterSpacing: '0.16em', cursor: 'pointer', fontFamily: 'inherit', marginTop: 20 }}>S'INSCRIRE</button>
        </div>
      )}

      {/* HERO */}
      <section style={{ position: 'relative', height: isMobile ? '88vh' : 'calc(100vh - 66px)', minHeight: isMobile ? 560 : 640, overflow: 'hidden' }}>
        <img src={assets.photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '110%', objectFit: 'cover', objectPosition: 'center 40%', transform: `translateY(${scrollY * 0.3}px) scale(1.05)`, filter: 'brightness(0.7) contrast(1.1) saturate(0.85)' }}/>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,20,18,0.55) 0%, transparent 30%, transparent 55%, rgba(15,20,18,0.95) 100%)' }}/>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.08, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`, mixBlendMode: 'overlay' }}/>

        {!isMobile && (
          <>
            <div style={{ position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%)', writingMode: 'vertical-rl', fontSize: 10, letterSpacing: '0.3em', fontFamily: '"JetBrains Mono", monospace', color: 'rgba(232,227,211,0.55)' }}>CAPITALE VOLQUE — 2300 ANS</div>
            <div style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', writingMode: 'vertical-rl', fontSize: 10, letterSpacing: '0.3em', fontFamily: '"JetBrains Mono", monospace', color: 'rgba(232,227,211,0.55)' }}>III · X · MMXXVI</div>
          </>
        )}

        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: isMobile ? '0 20px 40px' : `0 ${pad}px 64px` }}>
          {/* Édition badge */}
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 10, padding: isMobile ? '7px 12px' : '9px 16px', border: '1px solid #d4a574', color: '#d4a574', marginBottom: isMobile ? 20 : 28, background: 'rgba(15,20,18,0.35)', backdropFilter: 'blur(6px)' }}>
            <span style={{ width: 6, height: 6, background: '#d4a574', borderRadius: '50%', display: 'inline-block' }}/>
            <span style={{ fontSize: isMobile ? 10 : 11, letterSpacing: '0.28em', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>ÉDITION I · 2026</span>
            <span style={{ width: 1, height: 12, background: 'rgba(212,165,116,0.5)' }}/>
            <span style={{ fontSize: isMobile ? 10 : 11, letterSpacing: '0.2em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.85 }}>{isMobile ? '3 OCT' : 'SAM. 3 OCTOBRE'}</span>
          </div>

          {/* Name block — primary */}
          <div style={{ marginBottom: isMobile ? 18 : 28 }}>
            <div style={{ fontSize: isMobile ? 10 : 11, letterSpacing: '0.3em', fontFamily: '"JetBrains Mono", monospace', color: 'rgba(232,227,211,0.6)', marginBottom: isMobile ? 10 : 14 }}>VIEILLE-TOULOUSE · HAUTE-GARONNE</div>
            <h1 style={{ fontFamily: '"Instrument Serif", serif', fontSize: isMobile ? 52 : isTablet ? 96 : 156, lineHeight: 0.86, fontWeight: 400, letterSpacing: '-0.038em', margin: 0 }}>
              Trail des<br/><span style={{ fontStyle: 'italic', color: '#d4a574' }}>Tectosages.</span>
            </h1>
          </div>

          {/* Tagline — secondary */}
          <div style={{ marginBottom: isMobile ? 8 : 12, paddingTop: isMobile ? 18 : 24, borderTop: '1px solid rgba(232,227,211,0.18)' }}>
            <p style={{ fontFamily: '"Instrument Serif", serif', fontSize: isMobile ? 22 : isTablet ? 28 : 36, fontStyle: 'italic', lineHeight: 1.2, margin: 0, opacity: 0.95, textWrap: 'balance', maxWidth: 820 }}>
              Sur la trace des Volques Tectosages.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-end', gap: 20, marginTop: isMobile ? 20 : 32 }}>
            <p style={{ fontSize: isMobile ? 13 : 15, maxWidth: 440, lineHeight: 1.5, opacity: 0.78, margin: 0, textWrap: 'pretty' }}>
              Vieille-Toulouse fut la capitale des Volques Tectosages il y a 2300 ans. Cinq épreuves, un territoire, une première édition.
            </p>
            {isMobile ? (
              <button style={{ background: '#d4a574', color: '#0f1412', border: 'none', padding: '16px 28px', fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>PRENDRE SON DOSSARD →</button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, letterSpacing: '0.2em', opacity: 0.7, fontFamily: '"JetBrains Mono", monospace' }}>SCROLL</span>
                <div style={{ width: 1, height: 32, background: 'rgba(232,227,211,0.4)' }}/>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DATA STRIP */}
      <section style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', borderTop: '1px solid rgba(232,227,211,0.12)', borderBottom: '1px solid rgba(232,227,211,0.12)' }}>
        {[['I', 'ÉDITION'], ['V', 'ÉPREUVES'], ['30KM', 'DÉFI MAX'], ['2026', 'MMXXVI']].map(([big, small], i) => (
          <div key={i} style={{
            padding: isMobile ? '24px 18px' : '40px 32px',
            borderRight: isMobile ? ((i % 2 === 0) ? '1px solid rgba(232,227,211,0.12)' : 'none') : (i < 3 ? '1px solid rgba(232,227,211,0.12)' : 'none'),
            borderBottom: isMobile && i < 2 ? '1px solid rgba(232,227,211,0.12)' : 'none',
          }}>
            <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: isMobile ? 36 : 56, fontWeight: 400, lineHeight: 0.95, color: '#d4a574' }}>{big}</div>
            <div style={{ fontSize: isMobile ? 9 : 10, letterSpacing: '0.22em', opacity: 0.6, fontFamily: '"JetBrains Mono", monospace', marginTop: isMobile ? 8 : 12 }}>{small}</div>
          </div>
        ))}
      </section>

      {/* STORYTELLING */}
      <section style={{ padding: isMobile ? '72px 20px' : `120px ${pad}px` }}>
        <div style={{ fontSize: isMobile ? 10 : 11, letterSpacing: '0.3em', fontFamily: '"JetBrains Mono", monospace', color: '#d4a574', marginBottom: 20 }}>— §00 / L'HISTOIRE</div>
        <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: h2Big, lineHeight: 0.92, fontWeight: 400, margin: isMobile ? '0 0 40px' : '0 0 60px', letterSpacing: '-0.03em', maxWidth: 1000 }}>
          Les traileurs sont-ils les <em style={{ color: '#d4a574' }}>descendants</em> des Tectosages ?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 40 : 40 }}>
          {[
            ['L\'ESPRIT DE CONQUÊTE', 'Partir à la conquête du territoire de Tolosa — comme nos ancêtres gaulois, il y a 2300 ans.'],
            ['COURAGE · BRAVOURE · HONNEUR', 'Trois valeurs, trois boucles. Chaque passage qualifie ou élimine. Seuls les dignes franchiront.'],
            ['LE DÉFI DE COPILOS', 'Dernier chef gaulois des Tectosages. Son nom reste à celles et ceux qui complètent les quatre boucles.'],
          ].map(([t, body], i) => (
            <div key={i}>
              <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: isMobile ? 40 : 48, fontStyle: 'italic', color: '#d4a574', marginBottom: 12 }}>{['I', 'II', 'III'][i]}</div>
              <div style={{ fontSize: 12, letterSpacing: '0.2em', fontWeight: 600, marginBottom: 12 }}>{t}</div>
              <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.8, margin: 0, textWrap: 'pretty' }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ÉPREUVES */}
      <section style={{ padding: isMobile ? '48px 20px 72px' : `80px ${pad}px 120px`, borderTop: '1px solid rgba(232,227,211,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 28 : 60, alignItems: 'baseline', marginBottom: isMobile ? 40 : 60 }}>
          <div>
            <div style={{ fontSize: isMobile ? 10 : 11, letterSpacing: '0.3em', fontFamily: '"JetBrains Mono", monospace', color: '#d4a574', marginBottom: 20 }}>— §01 / LES ÉPREUVES</div>
            <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: h2, lineHeight: 0.9, fontWeight: 400, margin: 0, letterSpacing: '-0.025em' }}>
              Cinq départs.<br/><span style={{ fontStyle: 'italic', opacity: 0.75 }}>Un seul territoire.</span>
            </h2>
          </div>
          <p style={{ fontSize: isMobile ? 15 : 17, lineHeight: 1.55, opacity: 0.75, margin: 0, maxWidth: 460, textWrap: 'pretty' }}>
            Du Défi de Copilos à la Tectokids, chacune et chacun trouve sa boucle. Tout se court en fin d'après-midi — arrivée avant la tombée de la nuit.
          </p>
        </div>

        {/* Épreuves selector: horizontal scroll on mobile, 5-col grid desktop */}
        {isMobile ? (
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '4px 0 16px', margin: '0 -20px', paddingLeft: 20, paddingRight: 20, scrollSnapType: 'x mandatory' }}>
            {epreuves.map((x) => (
              <button key={x.id} onClick={() => setEpreuve(x.id)}
                style={{ flex: '0 0 210px', scrollSnapAlign: 'start', background: x.id === epreuve ? '#d4a574' : '#151c18', color: x.id === epreuve ? '#0f1412' : '#e8e3d3', border: '1px solid rgba(232,227,211,0.1)', padding: '20px 18px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ fontSize: 10, letterSpacing: '0.22em', opacity: 0.65, fontFamily: '"JetBrains Mono", monospace', marginBottom: 14 }}>{x.num} / {x.nom}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
                  <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: 36, lineHeight: 0.9 }}>{x.dist}</span>
                  <span style={{ fontSize: 10, letterSpacing: '0.15em', opacity: 0.7, fontFamily: '"JetBrains Mono", monospace' }}>{x.unit}</span>
                </div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{ width: 12, height: 3, background: n <= x.diff ? (x.id === epreuve ? '#0f1412' : '#d4a574') : (x.id === epreuve ? 'rgba(15,20,18,0.2)' : 'rgba(232,227,211,0.15)') }}/>
                  ))}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, background: 'rgba(232,227,211,0.12)', border: '1px solid rgba(232,227,211,0.12)' }}>
            {epreuves.map((x) => (
              <button key={x.id}
                onClick={() => setEpreuve(x.id)}
                onMouseEnter={(ev) => { if (x.id !== epreuve) ev.currentTarget.style.background = 'rgba(212,165,116,0.05)'; }}
                onMouseLeave={(ev) => { if (x.id !== epreuve) ev.currentTarget.style.background = '#0f1412'; }}
                style={{ background: x.id === epreuve ? '#d4a574' : '#0f1412', color: x.id === epreuve ? '#0f1412' : '#e8e3d3', border: 'none', padding: '28px 22px', textAlign: 'left', cursor: 'pointer', transition: 'all .25s', fontFamily: 'inherit' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.22em', opacity: 0.6, fontFamily: '"JetBrains Mono", monospace', marginBottom: 20 }}>{x.num} / {x.nom}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
                  <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: 44, lineHeight: 0.9 }}>{x.dist}</span>
                  <span style={{ fontSize: 11, letterSpacing: '0.15em', opacity: 0.7, fontFamily: '"JetBrains Mono", monospace' }}>{x.unit}</span>
                </div>
                <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{ width: 16, height: 3, background: n <= x.diff ? (x.id === epreuve ? '#0f1412' : '#d4a574') : (x.id === epreuve ? 'rgba(15,20,18,0.2)' : 'rgba(232,227,211,0.15)') }}/>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr', gap: isMobile ? 32 : 80, marginTop: isMobile ? 32 : 64, alignItems: 'flex-start' }}>
          <GpxMap
            id={'out-' + epreuve}
            data={gpx[{copilos:'defi-copilos',oppidum:'oppidum',oppidog:'oppidog',sages:'sages',tectokids:'tectokids'}[epreuve]]}
            gpxHref={{copilos:'uploads/defi-copilos.gpx',oppidum:'uploads/oppidum.gpx',oppidog:'uploads/oppi-dog.gpx',sages:'uploads/randonnee-sages.gpx',tectokids:'uploads/tectokids.gpx'}[epreuve]}
            segmentLabels={epreuve==='copilos' ? ['CONQUÊTE','COURAGE','BRAVOURE','HONNEUR'] : undefined}
            theme={{
              bg: '#151c18', ink: '#e8e3d3', accent: '#d4a574',
              gridColor: 'rgba(232,227,211,0.18)',
              segmentColors: epreuve==='copilos' ? ['#d4a574','#a67a4a','#7a5a6b','#5a7a5a'] : undefined,
              font: '"Instrument Serif", serif',
              monoFont: '"JetBrains Mono", monospace',
              paperStyle: 'topo',
              profileBg: '#0f1412',
              border: '1px solid rgba(232,227,211,0.12)',
            }}
          />
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', fontFamily: '"JetBrains Mono", monospace', color: '#d4a574', marginBottom: 20 }}>{c.num} / {c.nom}</div>
            <h3 style={{ fontFamily: '"Instrument Serif", serif', fontSize: isMobile ? 44 : 68, fontWeight: 400, lineHeight: 0.95, margin: '0 0 20px', letterSpacing: '-0.025em' }}><em>{c.sig}</em></h3>
            <p style={{ fontSize: isMobile ? 15 : 17, lineHeight: 1.55, opacity: 0.85, margin: 0, textWrap: 'pretty' }}>{c.desc}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(232,227,211,0.12)', border: '1px solid rgba(232,227,211,0.12)', marginTop: 32 }}>
              {[['DISTANCE', `${c.dist} ${c.unit.toLowerCase()}`], ['D+', `${c.dplus} m`], ['DÉPART', c.depart]].map(([lab, val], i) => (
                <div key={i} style={{ background: '#0f1412', padding: isMobile ? '14px 10px' : '20px' }}>
                  <div style={{ fontSize: 9, letterSpacing: '0.22em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.5, marginBottom: 6 }}>{lab}</div>
                  <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: isMobile ? 20 : 28, color: '#d4a574' }}>{val}</div>
                </div>
              ))}
            </div>
            {c.id === 'copilos' && (
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.3em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.5, marginBottom: 12 }}>QUATRE BOUCLES · QUATRE VALEURS</div>
                {[['I', 'Conquête', '12 km · +400 m', '1h45'], ['II', 'Courage', '6 km · +220 m', '1h00'], ['III', 'Bravoure', '6 km · +220 m', '1h00'], ['IV', 'Honneur', '6 km · +220 m', '1h00']].map((b, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '28px 1fr auto' : '40px 1fr auto auto', alignItems: 'baseline', gap: isMobile ? 10 : 16, padding: '10px 0', borderTop: '1px solid rgba(232,227,211,0.08)' }}>
                    <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: isMobile ? 18 : 22, fontStyle: 'italic', color: '#d4a574' }}>{b[0]}</span>
                    <span style={{ fontSize: isMobile ? 13 : 15, fontStyle: 'italic' }}>« {b[1]} »</span>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: isMobile ? 10 : 11, opacity: 0.7 }}>{b[2]}</span>
                    {!isMobile && <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, opacity: 0.7 }}>lim. {b[3]}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* BANQUET */}
      <section style={{ padding: isMobile ? '72px 20px' : `120px ${pad}px`, borderTop: '1px solid rgba(232,227,211,0.1)', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 32 : 80, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: isMobile ? 10 : 11, letterSpacing: '0.3em', fontFamily: '"JetBrains Mono", monospace', color: '#d4a574', marginBottom: 20 }}>— §02 / LE SOIR</div>
          <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: h2Big, lineHeight: 0.88, fontWeight: 400, margin: 0, letterSpacing: '-0.03em' }}>Le <em style={{ color: '#d4a574' }}>Banquet</em><br/>des Chefs.</h2>
          <p style={{ fontSize: isMobile ? 15 : 16, lineHeight: 1.6, opacity: 0.85, marginTop: 24, maxWidth: 460, textWrap: 'pretty' }}>
            La nuit tombée, le village se rassemble. Banquet organisé par le <em style={{ color: '#d4a574', fontStyle: 'normal', fontWeight: 500 }}>Golf de Vieille-Toulouse</em> — tables longues, produits du Lauragais, breuvage des conquérants. Inscription séparée.
          </p>
          <button style={{ background: '#d4a574', color: '#0f1412', border: 'none', padding: isMobile ? '14px 24px' : '14px 28px', fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', cursor: 'pointer', fontFamily: 'inherit', marginTop: 24, width: isMobile ? '100%' : 'auto' }}>RÉSERVER SA PLACE →</button>
        </div>
        <div style={{ height: isMobile ? 260 : 480, background: '#151c18', border: '1px solid rgba(232,227,211,0.12)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.22em', opacity: 0.4, textAlign: 'center' }}>PHOTO BANQUET<br/>[À FOURNIR]</div>
          <div style={{ position: 'absolute', inset: 16, border: '1px solid rgba(212,165,116,0.2)', pointerEvents: 'none' }}/>
        </div>
      </section>

      {/* ENGAGEMENT */}
      <section style={{ padding: isMobile ? '64px 20px' : `100px ${pad}px`, borderTop: '1px solid rgba(232,227,211,0.1)', background: '#0a0e0c' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr', gap: isMobile ? 24 : 60, alignItems: 'center' }}>
          <div style={{ width: isMobile ? 140 : 220, height: isMobile ? 140 : 220, background: '#e8e3d3', padding: isMobile ? 14 : 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={assets.marieLouise} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}/>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? 10 : 11, letterSpacing: '0.3em', fontFamily: '"JetBrains Mono", monospace', color: '#d4a574', marginBottom: 12 }}>— §03 / NOTRE ENGAGEMENT</div>
            <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: isMobile ? 34 : 56, lineHeight: 1, fontWeight: 400, margin: '0 0 16px' }}>
              Une part des inscriptions<br/>pour la <em style={{ color: '#d4a574' }}>Fondation Marie-Louise</em>.
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 15, lineHeight: 1.6, opacity: 0.75, margin: 0, maxWidth: 620, textWrap: 'pretty' }}>
              Le Trail des Tectosages s'engage au côté de la Fondation Marie-Louise, dont l'action caritative est portée par le Lions Club Toulouse Arènes Romaines. Chaque dossard vendu contribue à cet engagement.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL — CTA + FOOTER fusionnés, une seule page écran */}
      <section style={{ background: '#0a0e0c', borderTop: '1px solid rgba(232,227,211,0.1)', position: 'relative' }}>
        {/* CTA */}
        <div style={{ padding: isMobile ? '64px 20px 48px' : `96px ${pad}px 72px`, textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: isMobile ? 9 : 10, letterSpacing: '0.32em', fontFamily: '"JetBrains Mono", monospace', color: '#d4a574', marginBottom: isMobile ? 20 : 28 }}>
            — III · X · MMXXVI &nbsp;/&nbsp; INSCRIPTIONS OUVERTES
          </div>
          <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: isMobile ? 56 : isTablet ? 84 : 108, lineHeight: 0.9, fontWeight: 400, letterSpacing: '-0.035em', margin: isMobile ? '0 0 28px' : '0 0 40px' }}>
            Héritier de <em style={{ color: '#d4a574' }}>Copilos</em> ?
          </h2>
          <button style={{ background: '#d4a574', color: '#0f1412', border: 'none', padding: isMobile ? '16px 28px' : '18px 40px', fontSize: 12, fontWeight: 600, letterSpacing: '0.22em', cursor: 'pointer', fontFamily: 'inherit', width: isMobile ? '100%' : 'auto' }}>
            PRENDRE SON DOSSARD →
          </button>
        </div>

        {/* FOOTER — colonnes structurées */}
        <footer style={{ padding: isMobile ? '36px 20px 24px' : `48px ${pad}px 28px`, borderTop: '1px solid rgba(232,227,211,0.1)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr 1fr 1fr',
            gap: isMobile ? 32 : 48,
            marginBottom: isMobile ? 32 : 40,
            alignItems: 'flex-start',
          }}>
            {/* Col 1 — identité */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 30, height: 30, border: '1.5px solid #d4a574', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Instrument Serif", serif', fontSize: 14, fontStyle: 'italic', color: '#d4a574' }}>T</div>
                <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 20, fontWeight: 400 }}>
                  Trail des <em style={{ color: '#d4a574' }}>Tectosages</em>
                </div>
              </div>
              <div style={{ fontSize: 10, letterSpacing: '0.24em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.55, marginBottom: 14 }}>ÉDITION I · MMXXVI</div>
              <p style={{ fontSize: 13, lineHeight: 1.55, opacity: 0.65, margin: 0, maxWidth: 340, textWrap: 'pretty' }}>
                Samedi 3 octobre 2026 · Vieille-Toulouse, Haute-Garonne.
              </p>
            </div>

            {/* Col 2 — navigation */}
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.26em', fontFamily: '"JetBrains Mono", monospace', color: '#d4a574', marginBottom: 16, opacity: 0.85 }}>ÉVÉNEMENT</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Les épreuves', 'L\'histoire', 'Le banquet', 'Règlement', 'FAQ'].map(l => (
                  <li key={l}><a href="#" style={{ color: '#e8e3d3', textDecoration: 'none', fontSize: 13, opacity: 0.8 }}>{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Col 3 — contact */}
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.26em', fontFamily: '"JetBrains Mono", monospace', color: '#d4a574', marginBottom: 16, opacity: 0.85 }}>CONTACT</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li><a href="mailto:contact@tectosages.fr" style={{ color: '#e8e3d3', textDecoration: 'none', fontSize: 13, opacity: 0.8 }}>contact@tectosages.fr</a></li>
                <li><a href="#" style={{ color: '#e8e3d3', textDecoration: 'none', fontSize: 13, opacity: 0.8 }}>Instagram</a></li>
                <li><a href="#" style={{ color: '#e8e3d3', textDecoration: 'none', fontSize: 13, opacity: 0.8 }}>Presse & médias</a></li>
              </ul>
            </div>

            {/* Col 4 — partenaires */}
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.26em', fontFamily: '"JetBrains Mono", monospace', color: '#d4a574', marginBottom: 16, opacity: 0.85 }}>AVEC</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ background: '#e8e3d3', padding: 6, borderRadius: 2 }}><img src={assets.lions} style={{ height: 42, objectFit: 'contain', display: 'block' }}/></div>
                <div style={{ background: '#e8e3d3', padding: 6, borderRadius: 2 }}><img src={assets.marieLouise} style={{ height: 42, objectFit: 'contain', display: 'block' }}/></div>
                <div style={{ background: '#e8e3d3', padding: 6, borderRadius: 2 }}><img src={assets.golf} style={{ height: 42, objectFit: 'contain', display: 'block' }}/></div>
              </div>
              <div style={{ fontSize: 10, letterSpacing: '0.16em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.5, marginTop: 12, lineHeight: 1.6 }}>
                Lions Club Toulouse Arènes Romaines<br/>Fondation Marie-Louise<br/>Golf de Vieille-Toulouse
              </div>
            </div>
          </div>

          {/* Bottom line */}
          <div style={{
            display: 'flex', flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? 10 : 20,
            paddingTop: isMobile ? 20 : 24,
            borderTop: '1px solid rgba(232,227,211,0.08)',
            fontSize: 10, letterSpacing: '0.2em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.45,
          }}>
            <div>© MMXXVI · ASSOCIATION TRAIL DES TECTOSAGES</div>
            <div style={{ display: 'flex', gap: 24 }}>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>MENTIONS LÉGALES</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>CGV</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>CONFIDENTIALITÉ</a>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
};

window.OutdoorLanding = OutdoorLanding;
