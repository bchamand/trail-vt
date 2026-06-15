// ╔══════════════════════════════════════════════════════════════════════╗
// ║  Éditeur de masques d'affiche — DEV UNIQUEMENT                        ║
// ╠══════════════════════════════════════════════════════════════════════╣
// ║  Activé par /affiche?edit-mask. Inclus dans affiche.astro derrière    ║
// ║  {import.meta.env.DEV && <script src=...>} ⇒ jamais présent en prod.  ║
// ║                                                                        ║
// ║  Édite les photos directement sur le VRAI poster (WYSIWYG, avec le     ║
// ║  lissage organique des bords) : sélection du masque, de la photo,      ║
// ║  déplacement (glisser) + zoom (molette) du cadrage, et déplacement     ║
// ║  des sommets de la zone. « Enregistrer » réécrit le .svg via le        ║
// ║  middleware Vite dev /__mask/save (voir astro.config.mjs).            ║
// ║                                                                        ║
// ║  NB : les contours dorés (#seams) ne se rafraîchissent qu'au rechar-   ║
// ║  gement après modification de la zone — le détourage de la photo, lui, ║
// ║  est mis à jour en direct.                                             ║
// ╚══════════════════════════════════════════════════════════════════════╝

const PW = 1024, PH = 1448; // repère du poster (A4)
const SVGNS = 'http://www.w3.org/2000/svg';

if (import.meta.env.DEV && new URLSearchParams(location.search).has('edit-mask')) {
  whenReady(init);
}

// attend le DOM + l'API de placement posée par le script inline de l'affiche
function whenReady(fn: () => void) {
  const go = () => ((window as any).__affMask ? fn() : setTimeout(go, 30));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
}

type Pt = [number, number];
interface Mask {
  file: string;
  ph: HTMLElement;
  img: HTMLImageElement;
  poly: SVGPolygonElement | null;
  scale: number;
  ox: number;
  oy: number;
  pts: Pt[];
}

function init() {
  const api = (window as any).__affMask as {
    place: (el: HTMLElement, pts: Pt[]) => void;
    smoothLine: (l: Pt[]) => Pt[];
    readShape: (el: SVGGraphicsElement) => Pt[];
  };
  const poster = document.getElementById('poster');
  if (!poster) return;
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const numv = (v: string | undefined, d: number) => { const n = parseFloat(v || ''); return Number.isFinite(n) ? n : d; };
  const photoName = (m: Mask) => (m.img.getAttribute('src') || '').split('/').pop() || '';

  // ── rassembler les masques depuis le DOM ──
  const masks: Mask[] = [];
  poster.querySelectorAll<HTMLElement>('.ph[data-i]').forEach((ph) => {
    const i = ph.dataset.i as string;
    const img = ph.querySelector('img') as HTMLImageElement;
    const src = document.querySelector('.mask-src[data-i="' + i + '"]');
    const poly = src ? (src.querySelector('polygon') as SVGPolygonElement | null) : null;
    const o = (ph.dataset.origin || '50% 50%').replace(/%/g, '').trim().split(/\s+/).map(Number);
    const pts: Pt[] = poly
      ? (poly.getAttribute('points') || '').trim().split(/\s+/).filter(Boolean).map((s) => s.split(',').map(Number) as Pt)
      : [];
    masks.push({ file: ph.dataset.file || '', ph, img, poly, scale: numv(ph.dataset.scale, 1), ox: o[0] || 0, oy: (o.length > 1 ? o[1] : o[0]) || 0, pts });
  });
  if (!masks.length) return;

  let active = masks[0];
  let zone = false;

  // ── overlay des poignées (sommets) ──
  const overlay = document.createElementNS(SVGNS, 'svg');
  overlay.setAttribute('viewBox', '0 0 ' + PW + ' ' + PH);
  overlay.setAttribute('preserveAspectRatio', 'none');
  overlay.style.cssText = 'position:absolute;inset:0;z-index:50;pointer-events:none;';
  poster.appendChild(overlay);

  // ── panneau ──
  injectStyle();
  const panel = document.createElement('div');
  panel.className = 'amk-panel';
  panel.innerHTML =
    '<div class="amk-h">ÉDITION MASQUES <span>dev</span></div>' +
    '<label class="amk-row"><span>Masque</span><select id="amk-mask"></select></label>' +
    '<label class="amk-row"><span>Photo</span><select id="amk-photo"></select></label>' +
    '<div class="amk-row"><span></span><button id="amk-import" class="amk-btn">Importer une photo…</button><input id="amk-file" type="file" accept="image/*" hidden></div>' +
    '<label class="amk-row"><span>Zoom</span><input id="amk-scale" type="range" min="1" max="3" step="0.01"><b id="amk-scaleV"></b></label>' +
    '<label class="amk-row"><span>Horiz.</span><input id="amk-ox" type="range" min="0" max="100" step="1"><b id="amk-oxV"></b></label>' +
    '<label class="amk-row"><span>Vert.</span><input id="amk-oy" type="range" min="0" max="100" step="1"><b id="amk-oyV"></b></label>' +
    '<label class="amk-chk"><input type="checkbox" id="amk-zone"> Éditer la zone (sommets)</label>' +
    '<div class="amk-hint">Glisser sur le poster = déplacer la photo active · molette = zoom</div>' +
    '<div class="amk-foot"><button id="amk-save" class="amk-btn amk-primary">Enregistrer</button><span class="amk-status" id="amk-status"></span></div>';
  document.body.appendChild(panel);

  const pick = <T extends HTMLElement = HTMLInputElement>(id: string) => panel.querySelector('#' + id) as T;
  const maskSel = pick<HTMLSelectElement>('amk-mask');
  const photoSel = pick<HTMLSelectElement>('amk-photo');
  masks.forEach((m, k) => maskSel.add(new Option(m.file, String(k))));

  // ── rendu ──
  function applyFraming(m: Mask) {
    const o = Math.round(m.ox) + '% ' + Math.round(m.oy) + '%';
    m.img.style.objectPosition = o;
    m.img.style.transform = 'scale(' + m.scale + ')';
    m.img.style.transformOrigin = o;
  }
  function reclip(m: Mask) {
    if (!m.poly) return;
    m.poly.setAttribute('points', m.pts.map((p) => Math.round(p[0]) + ',' + Math.round(p[1])).join(' '));
    api.place(m.ph, api.smoothLine(api.readShape(m.poly as unknown as SVGGraphicsElement)));
  }
  function drawHandles() {
    overlay.innerHTML = '';
    if (!zone || !active.pts.length) return;
    const poly = document.createElementNS(SVGNS, 'polygon');
    poly.setAttribute('points', active.pts.map((p) => p[0] + ',' + p[1]).join(' '));
    poly.setAttribute('fill', 'none');
    poly.setAttribute('stroke', '#d4a574');
    poly.setAttribute('stroke-width', '2');
    poly.setAttribute('stroke-dasharray', '8 6');
    overlay.appendChild(poly);
    active.pts.forEach((p, idx) => {
      const c = document.createElementNS(SVGNS, 'circle');
      c.setAttribute('cx', String(p[0]));
      c.setAttribute('cy', String(p[1]));
      c.setAttribute('r', '11');
      c.setAttribute('fill', '#d4a574');
      c.setAttribute('stroke', '#0f1412');
      c.setAttribute('stroke-width', '2');
      c.style.cursor = 'grab';
      c.style.pointerEvents = 'all';
      (c as unknown as HTMLElement).dataset.idx = String(idx);
      overlay.appendChild(c);
    });
  }
  function syncPanel() {
    pick('amk-scale').value = String(active.scale); pick('amk-scaleV').textContent = active.scale.toFixed(2);
    pick('amk-ox').value = String(active.ox); pick('amk-oxV').textContent = Math.round(active.ox) + '%';
    pick('amk-oy').value = String(active.oy); pick('amk-oyV').textContent = Math.round(active.oy) + '%';
  }

  // ── cadrage : glisser (pan) + molette (zoom) ──
  function overflow(m: Mask) {
    const Wb = m.ph.offsetWidth, Hb = m.ph.offsetHeight;
    const iw = m.img.naturalWidth, ih = m.img.naturalHeight;
    if (!iw || !ih) return { x: Wb, y: Hb };
    const cs = Math.max(Wb / iw, Hb / ih);
    return { x: Math.max(1, iw * cs * m.scale - Wb), y: Math.max(1, ih * cs * m.scale - Hb) };
  }
  function toPoster(e: { clientX: number; clientY: number }) {
    const r = poster!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * PW, y: (e.clientY - r.top) / r.height * PH };
  }

  let drag: { type: 'pan'; p: { x: number; y: number }; ox: number; oy: number } | { type: 'vertex'; idx: number } | null = null;
  poster.addEventListener('pointerdown', (e) => {
    const t = e.target as Element;
    if (zone && t.tagName === 'circle') {
      drag = { type: 'vertex', idx: +((t as unknown as HTMLElement).dataset.idx as string) };
    } else if (!zone) {
      drag = { type: 'pan', p: toPoster(e), ox: active.ox, oy: active.oy };
    }
    if (drag) e.preventDefault();
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = toPoster(e);
    if (drag.type === 'pan') {
      const ov = overflow(active);
      active.ox = clamp(drag.ox - (p.x - drag.p.x) / ov.x * 100, 0, 100);
      active.oy = clamp(drag.oy - (p.y - drag.p.y) / ov.y * 100, 0, 100);
      applyFraming(active); syncPanel();
    } else {
      active.pts[drag.idx] = [clamp(Math.round(p.x), 0, PW), clamp(Math.round(p.y), 0, PH)];
      reclip(active); drawHandles();
    }
  });
  window.addEventListener('pointerup', () => { drag = null; });
  poster.addEventListener('wheel', (e) => {
    if (zone) return;
    e.preventDefault();
    active.scale = clamp(active.scale - e.deltaY * 0.0015, 1, 3);
    applyFraming(active); syncPanel();
  }, { passive: false });

  // ── contrôles du panneau ──
  maskSel.addEventListener('change', () => { active = masks[+maskSel.value]; photoSel.value = photoName(active); syncPanel(); drawHandles(); });
  pick('amk-scale').addEventListener('input', (e) => { active.scale = +(e.target as HTMLInputElement).value; applyFraming(active); syncPanel(); });
  pick('amk-ox').addEventListener('input', (e) => { active.ox = +(e.target as HTMLInputElement).value; applyFraming(active); syncPanel(); });
  pick('amk-oy').addEventListener('input', (e) => { active.oy = +(e.target as HTMLInputElement).value; applyFraming(active); syncPanel(); });
  pick('amk-zone').addEventListener('change', (e) => { zone = (e.target as HTMLInputElement).checked; drawHandles(); });
  pick('amk-import').addEventListener('click', () => pick('amk-file').click());
  pick('amk-file').addEventListener('change', async (e) => {
    const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return;
    status('import…');
    await fetch('/__mask/upload?name=' + encodeURIComponent(f.name), { method: 'POST', body: f });
    await loadPhotos(); setPhoto(f.name); status('photo importée');
  });
  photoSel.addEventListener('change', () => setPhoto(photoSel.value));
  pick('amk-save').addEventListener('click', save);

  // ── photos ──
  async function loadPhotos() {
    const list: string[] = await (await fetch('/__mask/photos')).json();
    photoSel.innerHTML = '';
    list.forEach((p) => photoSel.add(new Option(p, p)));
    photoSel.value = photoName(active);
  }
  function setPhoto(name: string) {
    active.img.addEventListener('load', () => applyFraming(active), { once: true });
    active.img.src = '/images/' + name; // base = / en dev
    photoSel.value = name;
  }

  // ── enregistrement ──
  async function save() {
    status('enregistrement…');
    const r = await fetch('/__mask/save', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: active.file,
        photo: photoName(active),
        scale: active.scale.toFixed(2),
        origin: Math.round(active.ox) + '% ' + Math.round(active.oy) + '%',
        points: active.pts.map((p) => Math.round(p[0]) + ',' + Math.round(p[1])).join(' '),
      }),
    });
    status(r.ok ? '✓ enregistré' : '✗ erreur');
  }

  let statusT: ReturnType<typeof setTimeout>;
  function status(s: string) {
    pick('amk-status').textContent = s;
    clearTimeout(statusT);
    statusT = setTimeout(() => (pick('amk-status').textContent = ''), 4000);
  }

  loadPhotos(); syncPanel(); drawHandles();
}

function injectStyle() {
  if (document.getElementById('amk-style')) return;
  const s = document.createElement('style');
  s.id = 'amk-style';
  s.textContent = [
    '.amk-panel{position:fixed;top:14px;left:14px;z-index:9999;width:250px;background:rgba(23,29,26,.97);color:#e8e3d3;',
    'font:13px/1.4 ui-sans-serif,system-ui,sans-serif;border:1px solid #2a322e;border-radius:10px;padding:12px;',
    'box-shadow:0 12px 40px rgba(0,0,0,.5);}',
    '.amk-h{font:600 11px/1 ui-monospace,monospace;letter-spacing:.12em;color:#d4a574;margin-bottom:10px;}',
    '.amk-h span{background:#d4a574;color:#0f1412;border-radius:4px;padding:1px 5px;margin-left:6px;}',
    '.amk-row{display:flex;align-items:center;gap:8px;margin:6px 0;}',
    '.amk-row>span{width:46px;color:#8b9189;font-size:11px;flex:0 0 auto;}',
    '.amk-row select,.amk-row input[type=range]{flex:1;min-width:0;}',
    '.amk-row b{width:42px;text-align:right;font:11px ui-monospace,monospace;}',
    '.amk-panel select,.amk-btn{background:#0f1412;color:#e8e3d3;border:1px solid #2a322e;border-radius:6px;padding:5px 8px;font-size:12px;cursor:pointer;}',
    '.amk-panel input[type=range]{accent-color:#d4a574;}',
    '.amk-chk{display:flex;align-items:center;gap:7px;margin:9px 0 4px;font-size:12px;cursor:pointer;}',
    '.amk-hint{font-size:11px;color:#8b9189;margin:4px 0 10px;line-height:1.45;}',
    '.amk-foot{display:flex;align-items:center;gap:10px;border-top:1px solid #2a322e;padding-top:10px;}',
    '.amk-primary{background:#d4a574;color:#0f1412;border-color:#d4a574;font-weight:600;}',
    '.amk-status{font-size:11px;color:#8b9189;}',
  ].join('');
  document.head.appendChild(s);
}
