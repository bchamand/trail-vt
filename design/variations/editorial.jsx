// Variation 1 — ÉDITORIAL MINIMALISTE · Trail des Tectosages
// Moderne dominant. Narration héritage via typo et motifs discrets.

const EditorialLanding = ({ assets, gpx }) => {
  const [epreuve, setEpreuve] = React.useState('copilos');
  const [scrollY, setScrollY] = React.useState(0);
  const rootRef = React.useRef(null);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onScroll = () => setScrollY(el.scrollTop);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const epreuves = {
    copilos: {
      rom: 'I', nom: 'Le Défi de Copilos', sig: "L'épreuve reine",
      dist: '30 km', dplus: '+1100 m', depart: '15h45', limite: '20h45',
      desc: "Quatre boucles. Une qualification ou une élimination à l'issue de chacune. Seuls les dignes héritiers de Copilos, dernier chef gaulois des Tectosages, franchiront la ligne.",
      boucles: [
        { t: 'Boucle I · 12 km', d: '+400 m', v: 'L\'esprit de conquête', l: '1h45', k: 'Qualificative' },
        { t: 'Boucle II · 6 km', d: '+220 m', v: 'Le courage', l: '1h00', k: 'Qualificative' },
        { t: 'Boucle III · 6 km', d: '+220 m', v: 'La bravoure', l: '1h00', k: 'Qualificative' },
        { t: 'Boucle IV · 6 km', d: '+220 m', v: 'L\'honneur', l: '1h00', k: 'Classement final' },
      ],
    },
    oppidum: { rom: 'II', nom: 'La Boucle de l\'Oppidum', sig: 'Chronométrée · classée', dist: '12 km', dplus: '+400 m', depart: '16h15', limite: '18h30', desc: "Une boucle unique sur les traces de l'oppidum tectosage. Sous-bois, coteaux, crêtes au-dessus de la Garonne." },
    oppidog: { rom: 'III', nom: "L'Oppi-dog", sig: 'Canicross chronométré', dist: '6 km', dplus: '+180 m', depart: '16h30', limite: '17h30', desc: 'Sol forestier, points d\'eau pour les chiens, équipement canicross réglementaire.' },
    sages: { rom: 'IV', nom: 'La Randonnée des sages', sig: 'Marche libre', dist: '6 km', dplus: '+180 m', depart: '16h30', limite: '18h00', desc: 'Non chronométrée. Une marche contemplative sur les sentiers historiques du village.' },
    tectokids: { rom: 'V', nom: 'La Tectokids', sig: 'Course enfants', dist: '1 à 3 km', dplus: '—', depart: '18h00', limite: '19h00', desc: 'Boucles courtes, dossard, médaille en terre cuite. La relève des Tectosages.' },
  };
  const e = epreuves[epreuve];

  return (
    <div ref={rootRef} style={{
      width: '100%', height: '100%', overflow: 'auto',
      background: '#f4efe4', color: '#1a1a1a',
      fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, sans-serif',
      position: 'relative',
    }}>
      {/* Top bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px',
        background: scrollY > 50 ? 'rgba(244,239,228,0.92)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(10px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(26,26,26,0.08)' : '1px solid transparent',
        transition: 'all .3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="#1a1a1a" strokeWidth="1.2"/>
            <path d="M14 2 L14 26 M2 14 L26 14 M5 5 L23 23 M5 23 L23 5" stroke="#1a1a1a" strokeWidth="0.6" opacity="0.35"/>
            <circle cx="14" cy="14" r="3.5" fill="#1a1a1a"/>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.2em', opacity: 0.55, fontFamily: '"JetBrains Mono", monospace' }}>TRAIL · MMXXVI</span>
            <span style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>Des Tectosages</span>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 32, fontSize: 13, fontWeight: 500 }}>
          <a style={{ color: '#1a1a1a', textDecoration: 'none' }}>Épreuves</a>
          <a style={{ color: '#1a1a1a', textDecoration: 'none' }}>Histoire</a>
          <a style={{ color: '#1a1a1a', textDecoration: 'none' }}>Banquet</a>
          <a style={{ color: '#1a1a1a', textDecoration: 'none' }}>Engagement</a>
        </nav>
        <button style={{
          background: '#1a1a1a', color: '#f4efe4', border: 'none',
          padding: '10px 20px', fontSize: 13, fontWeight: 500,
          letterSpacing: '0.04em', cursor: 'pointer', borderRadius: 2,
          fontFamily: 'inherit',
        }}>S'inscrire →</button>
      </header>

      {/* HERO */}
      <section style={{ padding: '40px 40px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: 24, marginBottom: 32 }}>
          <div>
            <div style={{
              fontSize: 11, letterSpacing: '0.22em', fontFamily: '"JetBrains Mono", monospace',
              opacity: 0.55, marginBottom: 28,
            }}>
              — SAMEDI 3 OCTOBRE 2026 · COUCHER DU SOLEIL 19H32
            </div>
            <h1 style={{
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontSize: 132, lineHeight: 0.88, fontWeight: 400,
              letterSpacing: '-0.03em', margin: 0,
            }}>
              Sur la trace<br/>
              des <em style={{ fontStyle: 'italic' }}>Volques</em><br/>
              <em style={{ fontStyle: 'italic', opacity: 0.85 }}>Tectosages.</em>
            </h1>
          </div>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
            lineHeight: 1.7, opacity: 0.7, textAlign: 'right',
            maxWidth: 240,
          }}>
            TOLOSA · 43°31′N 1°28′E<br/>
            ALTITUDE 186 M<br/>
            CAPITALE VOLQUE — 2300 ANS<br/>
            VIEILLE-TOULOUSE, MMXXVI
          </div>
        </div>

        {/* Hero image */}
        <div style={{
          width: '100%', height: 520, position: 'relative', overflow: 'hidden',
          borderRadius: 2, marginTop: 24,
        }}>
          <img src={assets.photo} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover',
              transform: `translateY(${scrollY * 0.15}px) scale(1.1)`,
              transition: 'transform .1s linear',
            }}/>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4))',
          }}/>
          <div style={{
            position: 'absolute', bottom: 24, left: 24, right: 24,
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            color: '#f4efe4',
          }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.15em', opacity: 0.9 }}>
              VUE DEPUIS LES COTEAUX — GARONNE EN CONTREBAS
            </div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.15em', opacity: 0.9 }}>
              FIG.01 / TERRITOIRE DE TOLOSA
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          marginTop: 40, paddingTop: 32,
          borderTop: '1px solid rgba(26,26,26,0.15)',
          gap: 24,
        }}>
          {[
            ['V', 'Épreuves au programme'],
            ['IV', 'Boucles pour le Défi'],
            ['MC', 'Mètres de dénivelé'],
            ['MMCCC', 'Ans d\'histoire'],
          ].map(([big, small], i) => (
            <div key={i}>
              <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 48, lineHeight: 1, fontWeight: 400, fontStyle: 'italic' }}>{big}</div>
              <div style={{ fontSize: 12, opacity: 0.6, marginTop: 8, letterSpacing: '0.04em' }}>{small}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STORYTELLING */}
      <section style={{ padding: '120px 40px 80px', borderTop: '1px solid rgba(26,26,26,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.22em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.55, marginBottom: 16 }}>
              — §00 · L'HISTOIRE
            </div>
            <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 72, lineHeight: 0.95, fontWeight: 400, margin: 0, letterSpacing: '-0.02em' }}>
              Les traileurs<br/>sont-ils les<br/><em>descendants</em><br/>des Tectosages ?
            </h2>
          </div>
          <div style={{ fontSize: 18, lineHeight: 1.65, opacity: 0.85, paddingTop: 48, textWrap: 'pretty' }}>
            <p style={{ margin: '0 0 24px' }}>
              Il y a 2300 ans, Vieille-Toulouse était la capitale du peuple des Volques Tectosages. Leurs valeurs : <em>l'esprit de conquête</em>, le courage, la bravoure, l'honneur, l'endurance, l'esprit guerrier, la communauté.
            </p>
            <p style={{ margin: '0 0 24px' }}>
              En mobilisant toutes leurs ressources physiques et mentales, les coureurs partiront à la conquête du territoire de Tolosa.
            </p>
            <p style={{ margin: 0, fontFamily: '"Instrument Serif", serif', fontSize: 26, lineHeight: 1.4, fontStyle: 'italic' }}>
              Certains pourront se confronter au redoutable <strong style={{ fontWeight: 400 }}>Défi de Copilos</strong> — dernier chef gaulois des Tectosages — pour se voir reconnaître le statut <em>d'Héritier de Copilos</em>.
            </p>
          </div>
        </div>
      </section>

      {/* ÉPREUVES — sélecteur */}
      <section style={{ padding: '80px 40px 60px', borderTop: '1px solid rgba(26,26,26,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 60 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.22em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.55, marginBottom: 16 }}>
              — §01 · LES ÉPREUVES
            </div>
            <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 72, lineHeight: 0.95, fontWeight: 400, margin: 0, letterSpacing: '-0.02em' }}>
              Cinq façons<br/>d'<em>y aller</em>.
            </h2>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 0, borderTop: '1px solid rgba(26,26,26,0.15)',
          borderBottom: '1px solid rgba(26,26,26,0.15)',
        }}>
          {Object.entries(epreuves).map(([k, v], i, arr) => (
            <button key={k}
              onClick={() => setEpreuve(k)}
              style={{
                flex: 1, padding: '20px 16px', border: 'none',
                borderRight: i < arr.length - 1 ? '1px solid rgba(26,26,26,0.15)' : 'none',
                background: epreuve === k ? '#1a1a1a' : 'transparent',
                color: epreuve === k ? '#f4efe4' : '#1a1a1a',
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit', transition: 'all .2s ease',
              }}
              onMouseEnter={(ev) => { if (epreuve !== k) ev.currentTarget.style.background = 'rgba(26,26,26,0.04)'; }}
              onMouseLeave={(ev) => { if (epreuve !== k) ev.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ fontSize: 11, letterSpacing: '0.18em', opacity: 0.6, fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', marginBottom: 6 }}>
                {v.rom}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.2 }}>{v.nom.replace('Le ', '').replace('La ', '').replace("L'", '')}</div>
            </button>
          ))}
        </div>

        {/* Détail */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 60, marginTop: 60, alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.22em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.55, marginBottom: 20 }}>
              ÉPREUVE {e.rom} · {e.sig.toUpperCase()}
            </div>
            <h3 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 64, fontWeight: 400, lineHeight: 0.95, margin: '0 0 32px', letterSpacing: '-0.02em' }}>
              <em>{e.nom}</em>
            </h3>
            <p style={{ fontSize: 18, lineHeight: 1.55, opacity: 0.85, margin: 0, maxWidth: 560, textWrap: 'pretty' }}>
              {e.desc}
            </p>
            <div style={{ display: 'flex', gap: 48, marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(26,26,26,0.12)' }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.18em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.55, marginBottom: 6 }}>DISTANCE</div>
                <div style={{ fontSize: 22, fontWeight: 600 }}>{e.dist}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.18em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.55, marginBottom: 6 }}>D+</div>
                <div style={{ fontSize: 22, fontWeight: 600 }}>{e.dplus}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.18em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.55, marginBottom: 6 }}>DÉPART</div>
                <div style={{ fontSize: 22, fontWeight: 600 }}>{e.depart}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.18em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.55, marginBottom: 6 }}>FIN</div>
                <div style={{ fontSize: 22, fontWeight: 600 }}>{e.limite}</div>
              </div>
            </div>

            {/* Boucles breakdown pour Copilos */}
            {e.boucles && (
              <div style={{ marginTop: 40 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.22em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.6, marginBottom: 16 }}>
                  DÉTAIL DES QUATRE BOUCLES
                </div>
                {e.boucles.map((b, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto',
                    alignItems: 'baseline', gap: 24,
                    padding: '16px 0', borderTop: '1px solid rgba(26,26,26,0.08)',
                  }}>
                    <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: 24, fontStyle: 'italic', opacity: 0.45 }}>{['I','II','III','IV'][i]}</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{b.t}</div>
                      <div style={{ fontSize: 13, fontStyle: 'italic', opacity: 0.7, marginTop: 2 }}>« {b.v} »</div>
                    </div>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, opacity: 0.7 }}>{b.d}</span>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, opacity: 0.7 }}>{b.l}</span>
                    <span style={{ fontSize: 10, letterSpacing: '0.18em', padding: '4px 10px', background: i === 3 ? '#1a1a1a' : 'transparent', color: i === 3 ? '#f4efe4' : '#1a1a1a', border: i === 3 ? 'none' : '1px solid rgba(26,26,26,0.3)' }}>
                      {b.k.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <GpxMap
              id={'ed-' + epreuve}
              data={gpx[{copilos:'defi-copilos',oppidum:'oppidum',oppidog:'oppidog',sages:'sages',tectokids:'tectokids'}[epreuve]]}
              gpxHref={{copilos:'uploads/defi-copilos.gpx',oppidum:'uploads/oppidum.gpx',oppidog:'uploads/oppi-dog.gpx',sages:'uploads/randonnee-sages.gpx',tectokids:'uploads/tectokids.gpx'}[epreuve]}
              segmentLabels={epreuve==='copilos' ? ['CONQUÊTE','COURAGE','BRAVOURE','HONNEUR'] : undefined}
              theme={{
                bg: '#ece6d6', ink: '#1a1a1a', accent: '#c94a1b',
                gridColor: 'rgba(26,26,26,0.18)',
                segmentColors: epreuve==='copilos' ? ['#c94a1b','#8b5a2b','#6b7d3a','#2a1f15'] : undefined,
                font: '"Instrument Serif", serif',
                monoFont: '"JetBrains Mono", monospace',
                paperStyle: 'dotted',
                profileBg: '#e4dcc5',
                border: '1px solid rgba(26,26,26,0.15)',
              }}
            />
          </div>
        </div>
      </section>

      {/* BANQUET */}
      <section style={{ padding: '120px 40px', borderTop: '1px solid rgba(26,26,26,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.22em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.55, marginBottom: 16 }}>
            — §02 · LE SOIR
          </div>
          <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 96, lineHeight: 0.9, fontWeight: 400, margin: 0, letterSpacing: '-0.03em' }}>
            Le <em>Banquet</em><br/>des Chefs.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, opacity: 0.8, marginTop: 32, maxWidth: 440, textWrap: 'pretty' }}>
            La course tombée avec le soleil, les coureurs, leurs familles et le village se retrouvent pour le banquet — organisé par le Comité des Fêtes. Tables longues, produits du Lauragais, veillée.
          </p>
          <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
            <button style={{ background: '#1a1a1a', color: '#f4efe4', border: 'none', padding: '14px 28px', fontSize: 13, fontWeight: 500, letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'inherit' }}>
              Réserver sa place →
            </button>
            <span style={{ alignSelf: 'center', fontSize: 13, opacity: 0.6 }}>Inscription séparée · payante</span>
          </div>
        </div>
        <div style={{ height: 480, background: '#e8e2d1', position: 'relative', overflow: 'hidden' }}>
          <svg viewBox="0 0 400 480" style={{ width: '100%', height: '100%' }}>
            <defs><pattern id="ed-stripes" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="12" stroke="#c9c0a6" strokeWidth="6"/></pattern></defs>
            <rect width="400" height="480" fill="url(#ed-stripes)" opacity="0.5"/>
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, letterSpacing: '0.22em', opacity: 0.55, textAlign: 'center' }}>
            PHOTO BANQUET<br/>[À FOURNIR]
          </div>
        </div>
      </section>

      {/* ENGAGEMENT — Fondation Marie-Louise */}
      <section style={{ padding: '100px 40px', background: '#1a1a1a', color: '#f4efe4' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 60, alignItems: 'center' }}>
          <div style={{ width: 200, height: 200, background: '#f4efe4', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <img src={assets.marieLouise} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}/>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.22em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.6, marginBottom: 16, color: '#d4a574' }}>
              — §03 · NOTRE ENGAGEMENT
            </div>
            <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: 56, lineHeight: 1, fontWeight: 400, margin: '0 0 24px', letterSpacing: '-0.02em' }}>
              Une partie des inscriptions<br/>reversée à la <em>Fondation Marie-Louise</em>.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, opacity: 0.85, margin: 0, maxWidth: 620, textWrap: 'pretty' }}>
              Le Trail des Tectosages s'engage au côté de la Fondation Marie-Louise, dont l'action caritative est portée par le Lions Club Toulouse Arènes Romaines. Chaque dossard vendu contribue à cet engagement.
            </p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{
        padding: '140px 40px', borderTop: '1px solid rgba(26,26,26,0.08)',
        textAlign: 'center', position: 'relative',
      }}>
        <div style={{ fontSize: 11, letterSpacing: '0.22em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.55, marginBottom: 32 }}>
          — SAMEDI 3 OCTOBRE 2026 · INSCRIPTIONS OUVERTES
        </div>
        <h2 style={{
          fontFamily: '"Instrument Serif", serif',
          fontSize: 156, lineHeight: 0.88, fontWeight: 400,
          letterSpacing: '-0.035em', margin: '0 0 48px',
        }}>
          Héritier de<br/><em>Copilos</em> ?
        </h2>
        <button style={{
          background: '#1a1a1a', color: '#f4efe4', border: 'none',
          padding: '22px 48px', fontSize: 15, fontWeight: 500,
          letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 2,
          fontFamily: 'inherit',
        }}>PRENDRE SON DOSSARD →</button>
      </section>

      {/* Footer avec les logos */}
      <footer style={{
        padding: '48px 40px 32px', borderTop: '1px solid rgba(26,26,26,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.7 }}>
            TRAIL DES TECTOSAGES · MMXXVI<br/>
            VIEILLE-TOULOUSE
          </div>
          <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.15em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.5 }}>
              PARTENAIRES
            </div>
            <img src={assets.lions} style={{ height: 80, objectFit: 'contain' }}/>
            <img src={assets.marieLouise} style={{ height: 70, objectFit: 'contain' }}/>
          </div>
        </div>
        <div style={{ fontSize: 10, letterSpacing: '0.15em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.4, marginTop: 32, textAlign: 'center' }}>
          ORGANISATEURS · ASSOCIATION TRAIL DES TECTOSAGES · COMITÉ DES FÊTES · LIONS CLUB TOULOUSE ARÈNES ROMAINES · FONDATION MARIE-LOUISE
        </div>
      </footer>
    </div>
  );
};

// Carte éditoriale
const EditorialMap = ({ epreuve }) => {
  const paths = {
    copilos: 'M40,200 Q80,150 120,180 T200,140 Q240,100 280,150 T360,120 Q400,100 430,160 Q460,220 420,280 Q380,320 320,290 T200,300 Q140,310 100,260 T40,200 Z',
    oppidum: 'M60,200 Q120,160 200,180 T320,160 Q380,180 400,240 T320,310 Q220,330 140,300 T60,200 Z',
    oppidog: 'M100,220 Q140,190 220,200 T320,220 Q350,260 300,290 T180,280 Q120,270 100,240 Z',
    sages: 'M60,220 Q140,180 220,200 T380,180 Q420,200 400,240 T300,260',
    tectokids: 'M200,220 Q240,200 270,220 Q290,240 270,260 Q240,270 210,260 Z',
  };
  return (
    <div style={{ aspectRatio: '1 / 1', width: '100%', background: '#e8e2d1', border: '1px solid rgba(26,26,26,0.12)', position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
      <svg viewBox="0 0 480 480" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {[...Array(12)].map((_, i) => (
          <path key={i} d={`M0,${40 + i * 40} Q120,${20 + i * 42} 240,${30 + i * 40} T480,${40 + i * 40}`} fill="none" stroke="rgba(26,26,26,0.07)" strokeWidth="0.8"/>
        ))}
        <path d="M0,340 Q80,320 160,335 T320,330 T480,340 L480,400 Q320,395 160,400 T0,395 Z" fill="#a4b8c2" opacity="0.5"/>
        <path d="M0,340 Q80,320 160,335 T320,330 T480,340" stroke="#4a6570" strokeWidth="0.8" fill="none"/>
        {[[90, 120], [380, 90], [420, 180], [60, 260], [340, 260], [180, 90]].map(([cx, cy], i) => (
          <g key={i} opacity="0.3">
            {[...Array(5)].map((_, j) => (
              <circle key={j} cx={cx + (Math.sin(i * 7 + j) * 20)} cy={cy + (Math.cos(i * 11 + j) * 20)} r="8" fill="#3a5a2a"/>
            ))}
          </g>
        ))}
        <path d={paths[epreuve]} stroke="#c94a1b" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <circle cx="40" cy="200" r="6" fill="#1a1a1a"/>
        <text x="54" y="205" fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#1a1a1a" letterSpacing="1">DÉPART · OPPIDUM</text>
      </svg>
      <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 9, letterSpacing: '0.18em', fontFamily: '"JetBrains Mono", monospace', opacity: 0.6, textAlign: 'right' }}>
        <div>N ↑</div><div>1:25 000</div>
      </div>
    </div>
  );
};

window.EditorialLanding = EditorialLanding;
