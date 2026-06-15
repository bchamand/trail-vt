// ╔══════════════════════════════════════════════════════════════════════╗
// ║  Éditeur visuel des masques photo de l'affiche                        ║
// ╠══════════════════════════════════════════════════════════════════════╣
// ║  Lance un petit serveur local + une interface navigateur pour cadrer  ║
// ║  les photos de l'affiche SANS éditer le SVG à la main :               ║
// ║    • choisir un masque (src/affiche-masks/*.svg)                      ║
// ║    • choisir / téléverser une photo (public/images/)                 ║
// ║    • déplacer (glisser) et zoomer (molette) la photo                  ║
// ║    • déplacer les sommets de la zone (polygone)                       ║
// ║    • « Enregistrer » réécrit data-photo / data-scale / data-origin    ║
// ║      et les points du <polygon> dans le fichier .svg                  ║
// ║                                                                        ║
// ║  Usage :  npm run affiche:editor      (ou  node scripts/affiche-editor.mjs)
// ║           --no-open  pour ne pas ouvrir le navigateur automatiquement ║
// ║                                                                        ║
// ║  Le rendu reproduit le CSS de l'affiche (object-fit:cover +           ║
// ║  object-position + transform:scale) → WYSIWYG pour le cadrage. Seul   ║
// ║  le LISSAGE organique des bords (fait côté affiche) n'est pas répli-  ║
// ║  qué : la zone est montrée en polygone droit. Pour un bord au pixel   ║
// ║  près, vérifier sur /affiche après enregistrement.                    ║
// ╚══════════════════════════════════════════════════════════════════════╝

import http from 'node:http';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

// Racine du projet (indépendante du dossier d'exécution)
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MASK_DIR = join(ROOT, 'src/affiche-masks');
const IMG_DIR = join(ROOT, 'public/images');
const PORT = 4330;

const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml',
};

// ── Lecture / écriture des masques ─────────────────────────────────────
function parseMask(file, svg) {
  const get = (re) => (svg.match(re) || [])[1];
  const ptsRaw = get(/points="([^"]*)"/) || '';
  const points = ptsRaw.trim().split(/\s+/).filter(Boolean)
    .map((pair) => pair.split(',').map(Number));
  return {
    file,
    photo: get(/data-photo="([^"]*)"/) || '',
    scale: parseFloat(get(/data-scale="([^"]*)"/)) || 1,
    origin: get(/data-origin="([^"]*)"/) || '50% 50%',
    points,
    viewBox: get(/viewBox="([^"]*)"/) || '0 0 1024 1448',
  };
}

async function listMasks() {
  const files = (await readdir(MASK_DIR)).filter((f) => f.endsWith('.svg')).sort();
  return Promise.all(files.map(async (f) => parseMask(f, await readFile(join(MASK_DIR, f), 'utf8'))));
}

async function listPhotos() {
  if (!existsSync(IMG_DIR)) return [];
  return (await readdir(IMG_DIR)).filter((f) => IMG_EXT.has(extname(f).toLowerCase())).sort();
}

// Réécrit UNIQUEMENT les attributs concernés : commentaires et structure conservés.
async function saveMask({ file, photo, scale, origin, points }) {
  const safe = basename(file);
  const path = join(MASK_DIR, safe);
  if (!safe.endsWith('.svg') || !existsSync(path)) throw new Error('masque introuvable : ' + safe);
  let svg = await readFile(path, 'utf8');
  if (photo != null) svg = svg.replace(/data-photo="[^"]*"/, 'data-photo="' + photo + '"');
  if (scale != null) svg = svg.replace(/data-scale="[^"]*"/, 'data-scale="' + scale + '"');
  if (origin != null) svg = svg.replace(/data-origin="[^"]*"/, 'data-origin="' + origin + '"');
  if (Array.isArray(points)) {
    const pts = points.map((p) => Math.round(p[0]) + ',' + Math.round(p[1])).join(' ');
    svg = svg.replace(/points="[^"]*"/, 'points="' + pts + '"');
  }
  await writeFile(path, svg);
}

// ── Serveur ────────────────────────────────────────────────────────────
function readBody(req) {
  return new Promise((res, rej) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => res(Buffer.concat(chunks)));
    req.on('error', rej);
  });
}

function sendJSON(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;

    if (req.method === 'GET' && path === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(PAGE);
    }

    if (req.method === 'GET' && path === '/api/state') {
      return sendJSON(res, 200, { masks: await listMasks(), photos: await listPhotos() });
    }

    if (req.method === 'GET' && path.startsWith('/photo/')) {
      const name = basename(decodeURIComponent(path.slice('/photo/'.length)));
      const file = join(IMG_DIR, name);
      if (!existsSync(file)) { res.writeHead(404); return res.end('photo introuvable'); }
      res.writeHead(200, { 'Content-Type': MIME[extname(name).toLowerCase()] || 'application/octet-stream' });
      return res.end(await readFile(file));
    }

    if (req.method === 'POST' && path === '/api/save') {
      const data = JSON.parse((await readBody(req)).toString('utf8'));
      await saveMask(data);
      console.log('  ✓ enregistré : ' + data.file + '  (scale=' + data.scale + ', origin="' + data.origin + '")');
      return sendJSON(res, 200, { ok: true });
    }

    if (req.method === 'POST' && path === '/api/upload') {
      const name = basename(url.searchParams.get('name') || '');
      if (!name || !IMG_EXT.has(extname(name).toLowerCase())) return sendJSON(res, 400, { error: 'nom/extension invalide' });
      await writeFile(join(IMG_DIR, name), await readBody(req));
      console.log('  ✓ photo importée : public/images/' + name);
      return sendJSON(res, 200, { ok: true, name });
    }

    res.writeHead(404); res.end('not found');
  } catch (err) {
    console.error('  ✗ ' + (err && err.message));
    sendJSON(res, 500, { error: String(err && err.message || err) });
  }
});

if (!existsSync(MASK_DIR)) {
  console.error('Dossier des masques introuvable : ' + MASK_DIR);
  process.exit(1);
}

server.listen(PORT, () => {
  const link = 'http://localhost:' + PORT;
  console.log('\n  Éditeur d\'affiche  →  ' + link + '\n');
  if (!process.argv.includes('--no-open')) {
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start ""' : 'xdg-open';
    exec(cmd + ' ' + link, () => {});
  }
});

// ── Interface (HTML + CSS + JS inline, sans dépendance) ─────────────────
// NB : le JS client évite les backticks pour ne pas casser ce gabarit Node.
const PAGE = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Éditeur d'affiche — masques photo</title>
<style>
  :root { --bg:#0f1412; --panel:#171d1a; --line:#2a322e; --ink:#e8e3d3; --gold:#d4a574; --muted:#8b9189; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:ui-sans-serif,system-ui,sans-serif; background:#0a0d0c; color:var(--ink); height:100vh; display:flex; flex-direction:column; }
  #bar { display:flex; gap:10px; align-items:center; flex-wrap:wrap; padding:10px 14px; background:var(--panel); border-bottom:1px solid var(--line); }
  #bar label { font-size:11px; color:var(--muted); letter-spacing:.06em; text-transform:uppercase; margin-right:4px; }
  select, button, input[type=file]::file-selector-button { background:#0f1412; color:var(--ink); border:1px solid var(--line); border-radius:6px; padding:7px 10px; font-size:13px; cursor:pointer; }
  button:hover, select:hover { border-color:var(--gold); }
  button.primary { background:var(--gold); color:#0f1412; border-color:var(--gold); font-weight:600; }
  .spacer { flex:1; }
  #status { font-size:12px; color:var(--muted); min-width:120px; }
  #main { flex:1; display:flex; min-height:0; }
  #stageWrap { flex:1; display:flex; align-items:center; justify-content:center; overflow:hidden; padding:18px; background:#0a0d0c; }
  #posterBox { position:relative; }
  #poster { position:relative; transform-origin:top left; background:var(--bg); box-shadow:0 0 0 1px var(--line), 0 18px 60px rgba(0,0,0,.6); }
  #ph { position:absolute; overflow:hidden; }
  #ph img { display:block; width:100%; height:100%; object-fit:cover; }
  #ph.filtered img { filter:brightness(.84) contrast(1.07) saturate(.7); }
  #overlay { position:absolute; inset:0; pointer-events:none; }
  #overlay polygon { fill:none; stroke:var(--gold); stroke-width:3; stroke-dasharray:10 7; opacity:.85; }
  #overlay .other { stroke:rgba(232,227,211,.25); stroke-width:2; stroke-dasharray:4 6; }
  #overlay circle { fill:var(--gold); stroke:#0f1412; stroke-width:2; }
  #overlay.zone circle { pointer-events:all; cursor:grab; r:9; }
  #poster.pan { cursor:grab; }
  #poster.panning { cursor:grabbing; }
  #side { width:300px; background:var(--panel); border-left:1px solid var(--line); padding:16px; overflow:auto; display:flex; flex-direction:column; gap:18px; }
  .grp { display:flex; flex-direction:column; gap:8px; }
  .grp h3 { margin:0; font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--gold); }
  .row { display:flex; align-items:center; gap:10px; font-size:13px; }
  .row span.k { width:62px; color:var(--muted); }
  .row input[type=range] { flex:1; accent-color:var(--gold); }
  .row span.v { width:50px; text-align:right; font-variant-numeric:tabular-nums; }
  .toggle { display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer; }
  .readout { font-family:ui-monospace,monospace; font-size:11px; line-height:1.7; color:var(--muted); background:#0f1412; border:1px solid var(--line); border-radius:6px; padding:10px; word-break:break-all; }
  .readout b { color:var(--ink); font-weight:600; }
  .hint { font-size:11px; color:var(--muted); line-height:1.5; }
  kbd { background:#0f1412; border:1px solid var(--line); border-radius:4px; padding:1px 5px; font-size:11px; }
</style>
</head>
<body>
  <div id="bar">
    <label>Masque</label>
    <select id="maskSel"></select>
    <label>Photo</label>
    <select id="photoSel"></select>
    <button id="uploadBtn">Importer…</button>
    <input id="fileInput" type="file" accept="image/*" style="display:none"/>
    <div class="spacer"></div>
    <span id="status"></span>
    <button id="reloadBtn">Recharger</button>
    <button id="saveBtn" class="primary">Enregistrer</button>
  </div>
  <div id="main">
    <div id="stageWrap">
      <div id="posterBox"><div id="poster">
        <div id="ph" class="filtered"><img id="img" alt=""/></div>
        <svg id="overlay"></svg>
      </div></div>
    </div>
    <div id="side">
      <div class="grp">
        <h3>Cadrage de la photo</h3>
        <div class="row"><span class="k">Zoom</span><input id="scale" type="range" min="1" max="3" step="0.01"/><span class="v" id="scaleV"></span></div>
        <div class="row"><span class="k">Horiz.</span><input id="ox" type="range" min="0" max="100" step="1"/><span class="v" id="oxV"></span></div>
        <div class="row"><span class="k">Vert.</span><input id="oy" type="range" min="0" max="100" step="1"/><span class="v" id="oyV"></span></div>
        <div class="hint">Glisse la photo pour la déplacer, molette pour zoomer. Les curseurs donnent le réglage exact.</div>
      </div>
      <div class="grp">
        <h3>Affichage</h3>
        <label class="toggle"><input type="checkbox" id="filterChk" checked/> Filtre affiche (sombre)</label>
        <label class="toggle"><input type="checkbox" id="zoneChk"/> Éditer la zone (polygone)</label>
        <div class="hint">Zone activée : glisse les <b style="color:var(--gold)">poignées</b> dorées pour redéfinir le contour.</div>
      </div>
      <div class="grp">
        <h3>Valeurs écrites dans le SVG</h3>
        <div class="readout" id="readout"></div>
      </div>
    </div>
  </div>
<script>
(function () {
  var state = { masks: [], photos: [] };
  var cur = null;              // masque courant { file, photo, scale, ox, oy, points, viewBox }
  var iw = 0, ih = 0;          // dimensions naturelles de la photo
  var ds = 1;                  // échelle d'affichage du poster
  var pw = 1024, ph_ = 1448;   // dimensions du poster (viewBox)

  var $ = function (id) { return document.getElementById(id); };
  var poster = $('poster'), phDiv = $('ph'), img = $('img'), overlay = $('overlay');
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  function bbox(pts) {
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var minX = Math.min.apply(null, xs), minY = Math.min.apply(null, ys);
    return { x: minX, y: minY, w: Math.max.apply(null, xs) - minX, h: Math.max.apply(null, ys) - minY };
  }

  function fit() {
    var wrap = $('stageWrap'), pad = 36;
    ds = Math.min((wrap.clientWidth - pad) / pw, (wrap.clientHeight - pad) / ph_);
    poster.style.width = pw + 'px';
    poster.style.height = ph_ + 'px';
    poster.style.transform = 'scale(' + ds + ')';
    var box = $('posterBox');
    box.style.width = (pw * ds) + 'px';
    box.style.height = (ph_ * ds) + 'px';
  }

  function render() {
    if (!cur) return;
    var b = bbox(cur.points);
    // zone photo (bbox du polygone) + détourage par le polygone
    phDiv.style.left = b.x + 'px'; phDiv.style.top = b.y + 'px';
    phDiv.style.width = b.w + 'px'; phDiv.style.height = b.h + 'px';
    phDiv.style.clipPath = 'polygon(' + cur.points.map(function (p) {
      return ((p[0] - b.x) / b.w * 100).toFixed(2) + '% ' + ((p[1] - b.y) / b.h * 100).toFixed(2) + '%';
    }).join(',') + ')';
    // cadrage identique à l'affiche
    var o = cur.ox + '% ' + cur.oy + '%';
    img.style.objectPosition = o;
    img.style.transform = 'scale(' + cur.scale + ')';
    img.style.transformOrigin = o;
    phDiv.classList.toggle('filtered', $('filterChk').checked);

    // overlay : contours des autres zones (contexte) + zone courante + poignées
    overlay.setAttribute('viewBox', '0 0 ' + pw + ' ' + ph_);
    overlay.setAttribute('width', pw); overlay.setAttribute('height', ph_);
    var svg = '';
    state.masks.forEach(function (m) {
      if (m.file === cur.file || !m.points.length) return;
      svg += '<polygon class="other" points="' + m.points.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '"/>';
    });
    svg += '<polygon points="' + cur.points.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '"/>';
    if ($('zoneChk').checked) {
      cur.points.forEach(function (p, i) { svg += '<circle data-i="' + i + '" cx="' + p[0] + '" cy="' + p[1] + '" r="9"/>'; });
    }
    overlay.innerHTML = svg;
    overlay.classList.toggle('zone', $('zoneChk').checked);
    poster.classList.toggle('pan', !$('zoneChk').checked);

    // curseurs + lecture
    $('scale').value = cur.scale; $('scaleV').textContent = cur.scale.toFixed(2);
    $('ox').value = cur.ox; $('oxV').textContent = Math.round(cur.ox) + '%';
    $('oy').value = cur.oy; $('oyV').textContent = Math.round(cur.oy) + '%';
    $('readout').innerHTML =
      'data-photo="<b>' + cur.photo + '</b>"<br>' +
      'data-scale="<b>' + cur.scale.toFixed(2) + '</b>"<br>' +
      'data-origin="<b>' + Math.round(cur.ox) + '% ' + Math.round(cur.oy) + '%</b>"<br>' +
      'points (<b>' + cur.points.length + '</b> sommets)';
  }

  // overflow de l'image (px poster) pour un glisser proportionnel au curseur
  function overflow() {
    var b = bbox(cur.points);
    if (!iw || !ih) return { x: b.w, y: b.h };
    var cs = Math.max(b.w / iw, b.h / ih);
    return {
      x: Math.max(1, iw * cs * cur.scale - b.w),
      y: Math.max(1, ih * cs * cur.scale - b.h),
    };
  }

  function loadImage(name) {
    img.onload = function () { iw = img.naturalWidth; ih = img.naturalHeight; render(); };
    img.src = '/photo/' + encodeURIComponent(name);
  }

  function selectMask(file) {
    var m = state.masks.find(function (x) { return x.file === file; });
    if (!m) return;
    var o = m.origin.replace(/%/g, '').trim().split(/\\s+/).map(Number);
    var vb = m.viewBox.split(/\\s+/).map(Number);
    pw = vb[2] || 1024; ph_ = vb[3] || 1448;
    cur = { file: m.file, photo: m.photo, scale: m.scale, ox: o[0] || 0, oy: (o.length > 1 ? o[1] : o[0]) || 0,
            points: m.points.map(function (p) { return [p[0], p[1]]; }), viewBox: m.viewBox };
    $('maskSel').value = file; $('photoSel').value = m.photo;
    fit(); loadImage(m.photo);
  }

  // ── interactions souris ──
  var drag = null;
  poster.addEventListener('mousedown', function (e) {
    if (!cur) return;
    var rect = poster.getBoundingClientRect();
    var px = (e.clientX - rect.left) / ds, py = (e.clientY - rect.top) / ds;
    var handle = e.target.closest && e.target.closest('circle[data-i]');
    if ($('zoneChk').checked && handle) {
      drag = { type: 'vertex', i: +handle.getAttribute('data-i') };
    } else if (!$('zoneChk').checked) {
      drag = { type: 'pan', px: px, py: py, ox: cur.ox, oy: cur.oy };
      poster.classList.add('panning');
    }
    e.preventDefault();
  });
  window.addEventListener('mousemove', function (e) {
    if (!drag) return;
    var rect = poster.getBoundingClientRect();
    var px = (e.clientX - rect.left) / ds, py = (e.clientY - rect.top) / ds;
    if (drag.type === 'pan') {
      var ov = overflow();
      cur.ox = clamp(drag.ox - (px - drag.px) / ov.x * 100, 0, 100);
      cur.oy = clamp(drag.oy - (py - drag.py) / ov.y * 100, 0, 100);
    } else {
      cur.points[drag.i] = [clamp(Math.round(px), 0, pw), clamp(Math.round(py), 0, ph_)];
    }
    render();
  });
  window.addEventListener('mouseup', function () { drag = null; poster.classList.remove('panning'); });
  poster.addEventListener('wheel', function (e) {
    if (!cur || $('zoneChk').checked) return;
    e.preventDefault();
    cur.scale = clamp(cur.scale - e.deltaY * 0.0015, 1, 3);
    render();
  }, { passive: false });

  // ── curseurs / cases ──
  $('scale').addEventListener('input', function (e) { cur.scale = +e.target.value; render(); });
  $('ox').addEventListener('input', function (e) { cur.ox = +e.target.value; render(); });
  $('oy').addEventListener('input', function (e) { cur.oy = +e.target.value; render(); });
  $('filterChk').addEventListener('change', render);
  $('zoneChk').addEventListener('change', render);

  // ── barre ──
  $('maskSel').addEventListener('change', function (e) { selectMask(e.target.value); });
  $('photoSel').addEventListener('change', function (e) { cur.photo = e.target.value; loadImage(e.target.value); });
  $('reloadBtn').addEventListener('click', function () { boot(cur && cur.file); });
  $('uploadBtn').addEventListener('click', function () { $('fileInput').click(); });
  $('fileInput').addEventListener('change', function (e) {
    var f = e.target.files[0]; if (!f) return;
    setStatus('import…');
    fetch('/api/upload?name=' + encodeURIComponent(f.name), { method: 'POST', body: f })
      .then(function (r) { return r.json(); })
      .then(function () {
        if (state.photos.indexOf(f.name) < 0) { state.photos.push(f.name); state.photos.sort(); fillPhotos(); }
        $('photoSel').value = f.name; cur.photo = f.name; loadImage(f.name); setStatus('photo importée');
      });
  });
  $('saveBtn').addEventListener('click', function () {
    if (!cur) return;
    setStatus('enregistrement…');
    fetch('/api/save', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: cur.file, photo: cur.photo, scale: cur.scale.toFixed(2),
        origin: Math.round(cur.ox) + '% ' + Math.round(cur.oy) + '%', points: cur.points,
      }),
    }).then(function (r) { return r.json(); })
      .then(function () { setStatus('✓ enregistré — recharge /affiche'); })
      .catch(function () { setStatus('✗ erreur'); });
  });

  var statusT;
  function setStatus(s) { $('status').textContent = s; clearTimeout(statusT); statusT = setTimeout(function () { $('status').textContent = ''; }, 4000); }
  function fillPhotos() {
    $('photoSel').innerHTML = state.photos.map(function (p) { return '<option>' + p + '</option>'; }).join('');
  }
  function boot(keep) {
    fetch('/api/state').then(function (r) { return r.json(); }).then(function (s) {
      state = s;
      $('maskSel').innerHTML = s.masks.map(function (m) { return '<option>' + m.file + '</option>'; }).join('');
      fillPhotos();
      selectMask(keep && s.masks.some(function (m) { return m.file === keep; }) ? keep : (s.masks[0] && s.masks[0].file));
    });
  }
  window.addEventListener('resize', function () { if (cur) { fit(); render(); } });
  boot();
})();
</script>
</body>
</html>`;
