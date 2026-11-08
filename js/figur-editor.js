/* Pose-Editor: eine 3D-Figur als Standbild von Hand einstellen (fürs Handy gebaut) und die Werte als Text
   kopieren oder teilen – zum Übernehmen in js/figur-posen.js. Einschalten unter Fortschritt → Einstellungen;
   dann steht in der Großansicht jeder Figur der Knopf „✎ Pose“.
   Bedienung: Punkt antippen und ziehen (bewegt ihn in der Bildebene), daneben ziehen dreht die Ansicht,
   zwei Finger zoomen. Feinarbeit mit den Reglern des gewählten Körperteils. */
(function () {
  'use strict';
  const E = window.Figur3D;
  if (!E || !window.SK) return;
  const { add, sub, mul, norm } = E.v;
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const esc = (s) => SK.util.esc(s);

  /* ---------- Einschalten, Entwürfe ---------- */
  const FLAG = 'sk-pose-editor';
  const DRAFT = 'sk-pose-draft:';
  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* ohne Speicher */ } },
  };
  const enabled = () => ls.get(FLAG) === '1';
  const setEnabled = (on) => ls.set(FLAG, on ? '1' : null);

  /* ---------- Umrechnen ---------- */
  // Weltpunkt → Brustkoordinaten (x links, y oben, z vorne; Ursprung Brustmitte), wie die Hände in den Posen
  const loc = (J, w) => { const d = sub(w, J.chest); return [dot(d, J.lc), dot(d, J.up), dot(d, J.fc)]; };
  const ANG = { yaw: 1, chest: 1, lean: 1, roll: 1, look: 1, pitch: 1 };
  const rnd = (k, v) => (ANG[k] ? Math.round(v * 10) / 10 : Math.round(v * 1000) / 1000);
  function rounded(o, k) {
    if (typeof o === 'number') return rnd(k, o) || 0;
    if (Array.isArray(o)) return o.map((v) => rounded(v, k));
    const r = {};
    for (const key in o) r[key] = rounded(o[key], key);
    return r;
  }
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  // Nur Werte, die vom Grundwert der Figur abweichen (wie in js/figur-posen.js üblich)
  function diff(P) {
    const D = rounded(E.full({}));
    const R = rounded(P);
    const out = {};
    for (const k in R) {
      if (k === 'L' || k === 'R') {
        const f = {};
        for (const j in R[k]) if (!same(R[k][j], D[k][j])) f[j] = R[k][j];
        if (Object.keys(f).length) out[k] = f;
      } else if (!same(R[k], D[k])) out[k] = R[k];
    }
    return out;
  }
  const lit = (o) => JSON.stringify(o).replace(/"(\w+)":/g, '$1: ').replace(/,(?=[a-zA-Z"{[])/g, ', ');

  /* ---------- Körperteile ---------- */
  const PARTS = [
    { id: 'body', label: 'Körper', pt: (J) => J.pel },
    { id: 'hL', label: 'Hand li.', s: 'L', pt: (J) => J.wristL },
    { id: 'hR', label: 'Hand re.', s: 'R', pt: (J) => J.wristR },
    { id: 'eL', label: 'Ellbogen li.', s: 'L', pt: (J) => J.elbowL },
    { id: 'eR', label: 'Ellbogen re.', s: 'R', pt: (J) => J.elbowR },
    { id: 'fL', label: 'Fuß li.', s: 'L', pt: (J) => J.ankleL },
    { id: 'fR', label: 'Fuß re.', s: 'R', pt: (J) => J.ankleR },
    { id: 'kL', label: 'Knie li.', s: 'L', pt: (J) => J.kneeL },
    { id: 'kR', label: 'Knie re.', s: 'R', pt: (J) => J.kneeR },
  ];
  const partOf = (id) => PARTS.find((p) => p.id === id);
  // Was zu einem Körperteil gehört (für „Geändert:“ in der Ausgabe)
  const FIELDS = {
    body: ['pelvis', 'yaw', 'chest', 'lean', 'roll', 'look'],
    hL: ['hL', 'oL', 'pL', 'fL', 'qL'], hR: ['hR', 'oR', 'pR', 'fR', 'qR'], eL: ['eL'], eR: ['eR'],
    fL: ['L.x', 'L.y', 'L.z', 'L.yaw', 'L.pitch', 'L.tu', 'L.sole'], fR: ['R.x', 'R.y', 'R.z', 'R.yaw', 'R.pitch', 'R.tu', 'R.sole'],
    kL: ['L.kp'], kR: ['R.kp'],
  };
  const get = (P, f) => f.split('.').reduce((o, k) => o[k], P);

  // Gezogenen Punkt W (Welt) in die Pose übernehmen
  function setPoint(P, id, W) {
    const J = E.solve(P);
    const s = partOf(id).s;
    if (id === 'body') P.pelvis = [W[0], clamp(W[1], 0.3, 1.05), W[2]];
    else if (id[0] === 'h') P['h' + s] = loc(J, W);
    else if (id[0] === 'e') {
      // Ellbogenrichtung: von der Schulter zum gewünschten Ellbogen, als Punkt um die Brust (Länge 0,6 = ganz vorgegeben)
      const d = norm(sub(W, J['sh' + s]));
      P['e' + s] = [dot(d, J.lc) * 0.6, dot(d, J.up) * 0.6, dot(d, J.fc) * 0.6];
    } else if (id[0] === 'f') Object.assign(P[s], { x: W[0], y: Math.max(0.075, W[1]), z: W[2] });
    else if (id[0] === 'k') P[s].kp = norm(sub(W, J['hip' + s]));
  }

  /* ---------- Regler je Körperteil ---------- */
  const DIRS = (s) => {
    const i = s === 'L' ? -1 : 1;
    return [['auto', 'automatisch', [0, 0, 0]], ['vorne', 'nach vorn', [0, 0, 1]], ['hinten', 'nach hinten', [0, 0, -1]], ['oben', 'nach oben', [0, 1, 0]],
      ['unten', 'nach unten', [0, -1, 0]], ['innen', 'zur Körpermitte', [i, 0, 0]], ['aussen', 'nach außen', [-i, 0, 0]]];
  };
  function controls(id, P) {
    const s = partOf(id).s;
    const R = (label, min, max, step, g, st, unit) => ({ t: 'range', label, min, max, step, get: g, set: st, unit });
    if (id === 'body') {
      return [
        R('Höhe Becken', 0.3, 1.05, 0.005, () => P.pelvis[1], (v) => (P.pelvis[1] = v), 'm'),
        R('Becken vor/zurück', P.pelvis[2] - 1, P.pelvis[2] + 1, 0.005, () => P.pelvis[2], (v) => (P.pelvis[2] = v), 'm'),
        R('Becken seitlich', P.pelvis[0] - 1, P.pelvis[0] + 1, 0.005, () => P.pelvis[0], (v) => (P.pelvis[0] = v), 'm'),
        R('Hüfte drehen', -180, 180, 1, () => P.yaw, (v) => (P.yaw = v), '°'),
        R('Oberkörper drehen', -90, 90, 1, () => P.chest, (v) => (P.chest = v), '°'),
        R('Vorlage', -30, 60, 1, () => P.lean, (v) => (P.lean = v), '°'),
        R('Seitneigung', -30, 30, 1, () => P.roll, (v) => (P.roll = v), '°'),
        R('Blick', -180, 180, 1, () => P.look, (v) => (P.look = v), '°'),
      ];
    }
    if (id[0] === 'h') {
      const h = P['h' + s];
      const open = () => P['o' + s] > 0.5;
      const dirSel = (label, key) => ({
        t: 'select', label, opts: DIRS(s),
        get: () => { const v = P[key + s]; const m = DIRS(s).find((d) => same(d[2], v.map((x) => Math.round(x * 1000) / 1000))); return m ? m[0] : 'eigen'; },
        set: (v) => { const m = DIRS(s).find((d) => d[0] === v); if (m) P[key + s] = m[2].slice(); },
      });
      return [
        { t: 'select', label: 'Hand', opts: [['faust', 'Faust'], ['offen', 'offen']], get: () => (open() ? 'offen' : 'faust'), set: (v) => (P['o' + s] = v === 'offen' ? 1 : 0) },
        dirSel('Handfläche zeigt', 'p'),
        open() ? dirSel('Finger zeigen', 'f') : dirSel('Faust abgeknickt', 'q'),
        R('seitlich (+ links)', -0.75, 0.75, 0.005, () => h[0], (v) => (P['h' + s][0] = v), 'm'),
        R('hoch/runter', -0.85, 0.75, 0.005, () => h[1], (v) => (P['h' + s][1] = v), 'm'),
        R('vor/zurück', -0.5, 0.8, 0.005, () => h[2], (v) => (P['h' + s][2] = v), 'm'),
      ];
    }
    if (id[0] === 'f') {
      const F = P[s];
      return [
        R('Fuß drehen', -180, 180, 1, () => F.yaw, (v) => (F.yaw = v), '°'),
        R('Fuß neigen', -60, 90, 1, () => F.pitch, (v) => (F.pitch = v), '°'),
        R('Zehen hochziehen', 0, 1, 0.05, () => F.tu, (v) => (F.tu = v), ''),
        R('Höhe', 0.075, 1.2, 0.005, () => F.y, (v) => (F.y = v), 'm'),
        R('vor/zurück', F.z - 1, F.z + 1, 0.005, () => F.z, (v) => (F.z = v), 'm'),
        R('seitlich (+ links)', F.x - 1, F.x + 1, 0.005, () => F.x, (v) => (F.x = v), 'm'),
      ];
    }
    // Ellbogen, Knie: nur die Richtung; zurück auf automatisch
    const auto = id[0] === 'e' ? () => (P['e' + s] = [0, 0, 0]) : () => (P[s].kp = [0, 0, 0]);
    return [{ t: 'button', label: 'Richtung wieder automatisch', run: auto }];
  }

  /* ---------- Dialog ---------- */
  let S = null; // Zustand des offenen Editors
  function dialog() {
    let d = document.querySelector('.pe-dlg');
    if (d) return d;
    d = document.createElement('dialog');
    d.className = 'f3d-dlg pe-dlg';
    d.setAttribute('aria-label', 'Pose-Editor');
    d.innerHTML = `<div class="f3d-dlg-head"><b class="f3d-dlg-title"></b><button type="button" class="f3d-dlg-x" aria-label="Schließen">✕</button></div>
<div class="pe-stage"><canvas class="pe-cv"></canvas></div>
<div class="pe-bar"><button type="button" class="gfx-btn" data-pe="v-front">Vorne</button><button type="button" class="gfx-btn" data-pe="v-side">Seite</button><button type="button" class="gfx-btn" data-pe="v-top">Oben</button><button type="button" class="gfx-btn" data-pe="undo" aria-label="Rückgängig">↶</button><button type="button" class="gfx-btn" data-pe="orig">Original</button></div>
<div class="pe-scroll">
<div class="pe-parts" role="radiogroup" aria-label="Körperteil"></div>
<div class="pe-panel"></div>
<div class="pe-out">
<label class="pe-lab">Anmerkung (was soll die Pose zeigen, was ist anders?)<textarea class="pe-note" rows="2"></textarea></label>
<div class="pe-acts"><button type="button" class="btn" data-pe="copy">Pose kopieren</button><button type="button" class="btn" data-pe="share" hidden>Teilen</button></div>
<p class="pe-msg muted small" aria-live="polite"></p>
<textarea class="pe-text" rows="5" readonly aria-label="Pose als Text"></textarea>
</div></div>`;
    document.body.appendChild(d);
    d.querySelector('.f3d-dlg-x').addEventListener('click', () => d.close());
    d.addEventListener('close', () => { S = null; });
    d.addEventListener('click', onClick);
    d.querySelector('.pe-note').addEventListener('input', () => { if (S) { S.note = d.querySelector('.pe-note').value; save(); text(); } });
    if (navigator.share) d.querySelector('[data-pe="share"]').hidden = false;
    bindStage(d.querySelector('.pe-stage'));
    window.addEventListener('resize', () => S && draw());
    return d;
  }

  function open(key, title) {
    const id = String(key).split(':').slice(0, 2).join(':');
    const e = SK.fig3d.entry(id);
    const t = e.d.best == null ? 1 : e.d.best;
    const orig = clone(e.pose(t));
    let P = clone(orig);
    let note = '';
    let draft = null;
    try { draft = JSON.parse(ls.get(DRAFT + id) || 'null'); } catch (err) { draft = null; }
    if (draft && draft.P) { P = E.full(draft.P); note = draft.note || ''; }
    const d = dialog();
    S = { id, title: title || id, t, orig, P, note, sel: 'body', undo: [], cam: Object.assign({}, e.cam, { target: e.cam.target.slice() }), dlg: d, mirrored: String(key).endsWith(':m') };
    d.querySelector('.f3d-dlg-title').textContent = `✎ ${S.title}`;
    d.querySelector('.pe-note').value = note;
    d.querySelector('.pe-msg').textContent = draft && draft.P ? 'Gespeicherter Entwurf geladen – „Original“ setzt ihn zurück.' : '';
    if (!d.open) d.showModal();
    parts();
    panel();
    text();
    requestAnimationFrame(() => draw());
  }

  function parts() {
    const box = S.dlg.querySelector('.pe-parts');
    box.innerHTML = PARTS.map((p) => `<button type="button" class="gfx-btn pe-chip pe-${p.s || 'C'}" role="radio" data-part="${p.id}" aria-checked="${p.id === S.sel}">${esc(p.label)}</button>`).join('');
  }
  function select(id) {
    S.sel = id;
    S.dlg.querySelectorAll('.pe-chip').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.part === id)));
    panel();
  }
  function panel() {
    const box = S.dlg.querySelector('.pe-panel');
    const list = controls(S.sel, S.P);
    S.ctl = list;
    box.innerHTML = list.map((c, i) => {
      if (c.t === 'range') return `<label class="pe-row"><span>${esc(c.label)} <output data-o="${i}"></output></span><input type="range" data-i="${i}" min="${c.min}" max="${c.max}" step="${c.step}"></label>`;
      if (c.t === 'select') return `<label class="pe-row"><span>${esc(c.label)}</span><select data-i="${i}">${c.opts.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('')}<option value="eigen" hidden>eigene Richtung</option></select></label>`;
      return `<button type="button" class="gfx-btn" data-i="${i}">${esc(c.label)}</button>`;
    }).join('');
    sync();
    box.querySelectorAll('input[type=range]').forEach((inp) => {
      inp.addEventListener('input', () => {
        if (!inp._busy) { inp._busy = true; push(); }
        S.ctl[+inp.dataset.i].set(+inp.value);
        changed(true);
      });
      inp.addEventListener('change', () => { inp._busy = false; changed(false); });
    });
    box.querySelectorAll('select').forEach((sel) => sel.addEventListener('change', () => {
      push();
      S.ctl[+sel.dataset.i].set(sel.value);
      changed(false);
      // Faust ↔ offen: andere Richtungswahl
      if (S.ctl[+sel.dataset.i].label === 'Hand') panel();
    }));
    box.querySelectorAll('button[data-i]').forEach((b) => b.addEventListener('click', () => { push(); S.ctl[+b.dataset.i].run(); changed(false); }));
  }
  // Regler auf die aktuellen Werte stellen (nach Ziehen, Rückgängig)
  function sync() {
    const box = S.dlg.querySelector('.pe-panel');
    S.ctl.forEach((c, i) => {
      const n = box.querySelector(`[data-i="${i}"]`);
      if (!n || c.t === 'button') return;
      const v = c.get();
      if (n.value !== String(v)) n.value = v;
      const o = box.querySelector(`[data-o="${i}"]`);
      if (o) o.textContent = c.unit === '°' ? `${Math.round(v)}°` : c.unit === 'm' ? `${Math.round(v * 100)} cm` : String(Math.round(v * 100) / 100);
    });
  }
  function push() {
    S.undo.push(clone(S.P));
    if (S.undo.length > 60) S.undo.shift();
  }
  // fast: während des Ziehens (kleineres Bild, Ausgabe erst danach)
  function changed(fast) {
    S.fast = fast;
    sync();
    draw();
    if (!fast) { save(); text(); }
  }
  function save() {
    const dirty = !same(rounded(S.P), rounded(S.orig)) || S.note;
    ls.set(DRAFT + S.id, dirty ? JSON.stringify({ P: diff(S.P), note: S.note }) : null);
  }
  function text() {
    const D = diff(S.P);
    const ch = PARTS.filter((p) => FIELDS[p.id].some((f) => !same(rounded(get(S.P, f), f.split('.').pop()), rounded(get(S.orig, f), f.split('.').pop())))).map((p) => p.label);
    const lines = [
      `Pose-Editor · ${S.id} · ${S.title}${S.mirrored ? ' (Figur ungespiegelt)' : ''} · Kernbild t = ${Math.round(S.t * 100) / 100}`,
      `Geändert: ${ch.length ? ch.join(', ') : 'nichts'}`,
    ];
    if (S.note.trim()) lines.push(`Anmerkung: ${S.note.trim()}`);
    lines.push(lit(D));
    S.text = lines.join('\n');
    S.dlg.querySelector('.pe-text').value = S.text;
  }

  function onClick(ev) {
    if (!S) return;
    const chip = ev.target.closest('[data-part]');
    if (chip) return select(chip.dataset.part);
    const b = ev.target.closest('[data-pe]');
    if (!b) return;
    const a = b.dataset.pe;
    const J = E.solve(S.P);
    const msg = S.dlg.querySelector('.pe-msg');
    if (a === 'v-front' || a === 'v-side' || a === 'v-top') {
      S.cam.target = [J.pel[0], S.cam.target[1], J.pel[2]];
      if (a === 'v-front') Object.assign(S.cam, { yaw: S.P.yaw, pitch: 6 });
      if (a === 'v-side') Object.assign(S.cam, { yaw: S.P.yaw - 90, pitch: 6 });
      if (a === 'v-top') Object.assign(S.cam, { yaw: S.P.yaw, pitch: 86 });
      draw();
    }
    if (a === 'undo' && S.undo.length) { S.P = S.undo.pop(); panel(); changed(false); }
    if (a === 'orig') {
      if (same(rounded(S.P), rounded(S.orig))) return;
      push();
      S.P = clone(S.orig);
      panel();
      changed(false);
      msg.textContent = 'Zurück auf die gespeicherte Pose der App (↶ holt deine Änderungen zurück).';
    }
    if (a === 'copy') {
      const ta = S.dlg.querySelector('.pe-text');
      const done = () => (msg.textContent = 'Kopiert – jetzt im Chat einfügen.');
      const fallback = () => {
        ta.focus();
        ta.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        msg.textContent = ok ? 'Kopiert – jetzt im Chat einfügen.' : 'Kopieren ging nicht – Text unten markieren und kopieren.';
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(S.text).then(done, fallback);
      else fallback();
    }
    if (a === 'share') navigator.share({ title: `Pose ${S.id}`, text: S.text }).catch(() => {});
  }

  /* ---------- Bild und Anfasser ---------- */
  // Hochkant: Blickwinkel weiten, damit die Figur in die Breite passt (wie die Großansicht)
  function fovFor(w, h) {
    const scale = Math.min(h, w * 1.12);
    if (scale >= h) return 30;
    const f = (1 / Math.tan((30 * Math.PI) / 360)) * (scale / h);
    return (Math.atan(1 / f) * 360) / Math.PI;
  }
  let raf = 0;
  function draw() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (!S) return;
      const cv = S.dlg.querySelector('.pe-cv');
      const stage = cv.parentElement;
      const cw = stage.clientWidth || 1;
      const ch = stage.clientHeight || 1;
      let r = Math.min(window.devicePixelRatio || 1, 2);
      if (S.fast) r = Math.min(r, Math.sqrt(180000 / (cw * ch)));
      const w = Math.max(80, Math.round(cw * r));
      const h = Math.max(80, Math.round(ch * r));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      S.cam.fov = fovFor(w, h);
      const ctx = cv.getContext('2d');
      ctx.clearRect(0, 0, w, h);
      const C = E.draw(ctx, w, h, S.P, S.cam, { mode: 0 });
      if (!C) {
        S.dlg.querySelector('.pe-msg').textContent = 'Die Figur lässt sich auf diesem Gerät nicht zeichnen (kein WebGL 2).';
        return;
      }
      S.C = C;
      S.scale = w / cw;
      handles(ctx, C, r);
    });
  }
  const COL = { L: '#1565c0', R: '#c62828', C: '#2e7d32' };
  function spots() {
    const J = E.solve(S.P);
    return PARTS.map((p) => ({ p, w: p.pt(J), q: S.C.project(p.pt(J)) }));
  }
  function handles(ctx, C, r) {
    const J = E.solve(S.P);
    ctx.save();
    // Knochenlinien dünn, damit die Punkte zuzuordnen sind
    ctx.lineWidth = 1.5 * r;
    ctx.strokeStyle = 'rgba(0,0,0,.35)';
    [['shL', 'elbowL', 'wristL'], ['shR', 'elbowR', 'wristR'], ['hipL', 'kneeL', 'ankleL'], ['hipR', 'kneeR', 'ankleR']].forEach((ch) => {
      ctx.beginPath();
      ch.forEach((k, i) => { const q = C.project(J[k]); if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); });
      ctx.stroke();
    });
    spots().forEach(({ p, q }) => {
      const sel = p.id === S.sel;
      ctx.beginPath();
      ctx.arc(q[0], q[1], (sel ? 9 : 6) * r, 0, Math.PI * 2);
      ctx.fillStyle = COL[p.s || 'C'];
      ctx.globalAlpha = sel ? 1 : 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = (sel ? 3 : 1.5) * r;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    });
    ctx.restore();
  }

  function bindStage(stage) {
    const pts = new Map();
    let grab = null; // gezogener Punkt
    let pinch = 0;
    const xy = (ev) => { const b = stage.getBoundingClientRect(); return [(ev.clientX - b.left) * (S.scale || 1), (ev.clientY - b.top) * (S.scale || 1)]; };
    stage.addEventListener('contextmenu', (ev) => ev.preventDefault());
    stage.addEventListener('pointerdown', (ev) => {
      if (!S || !S.C) return;
      stage.setPointerCapture && stage.setPointerCapture(ev.pointerId);
      pts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      if (pts.size === 2) {
        grab = null;
        const [a, b] = [...pts.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
        return;
      }
      // nächster Punkt in Fingerreichweite; der gewählte zuerst
      const [px, py] = xy(ev);
      const reach = 26 * (S.scale || 1);
      let best = null;
      spots().forEach((s) => {
        const d = Math.hypot(s.q[0] - px, s.q[1] - py) - (s.p.id === S.sel ? 8 * (S.scale || 1) : 0);
        if (d < reach && (!best || d < best.d)) best = Object.assign({ d }, s);
      });
      if (best) {
        if (best.p.id !== S.sel) select(best.p.id);
        push();
        const z = dot(sub(best.w, S.C.ro), S.C.cw);
        grab = { id: best.p.id, w0: best.w, x0: ev.clientX, y0: ev.clientY, k: (2 * z) / (S.C.f * (stage.clientHeight || 1)), moved: false };
      } else grab = null;
    });
    stage.addEventListener('pointermove', (ev) => {
      const p = pts.get(ev.pointerId);
      if (!p || !S) return;
      const dx = ev.clientX - p.x;
      const dy = ev.clientY - p.y;
      p.x = ev.clientX;
      p.y = ev.clientY;
      if (pts.size >= 2) {
        const [a, b] = [...pts.values()];
        const dd = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch > 10) S.cam.dist = clamp(S.cam.dist * (pinch / dd), 1.2, 9);
        pinch = dd;
        S.fast = true;
        draw();
        return;
      }
      if (grab) {
        const C = S.C;
        const mx = (ev.clientX - grab.x0) * grab.k;
        const my = (ev.clientY - grab.y0) * grab.k;
        setPoint(S.P, grab.id, add(add(grab.w0, mul(C.cu, mx)), mul(C.cv, -my)));
        grab.moved = true;
        changed(true);
      } else {
        S.cam.yaw -= dx * 0.45;
        S.cam.pitch = clamp(S.cam.pitch + dy * 0.35, -4, 86);
        S.fast = true;
        draw();
      }
    });
    const up = (ev) => {
      if (!pts.has(ev.pointerId)) return;
      pts.delete(ev.pointerId);
      if (pts.size) return;
      // nur angetippt: kein Schritt zum Rückgängigmachen
      if (grab && !grab.moved) S.undo.pop();
      grab = null;
      if (S) changed(false);
    };
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);
  }

  // state: offener Editor (für Tests)
  SK.poseEditor = { enabled, setEnabled, open, diff, setPoint, loc, state: () => S };
})();
