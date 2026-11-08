/* Bewegungs-Editor (früher Pose-Editor): jedes Bild einer 3D-Figur von Hand einstellen (fürs Handy gebaut), dazu
   Zeitpunkte, Übergänge, Dauer, Kernbild und Kamera; die Werte als Text kopieren – zum Übernehmen in js/figur-posen.js
   oder zum Sichern (Import holt sie zurück). Der Editor merkt sich nichts: beim Schließen ist alles Ungesicherte weg.
   Einschalten unter Fortschritt → Einstellungen; dann steht in der Großansicht jeder Figur der Knopf „✎ Bearbeiten“.
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
  // Frühere Fassungen merkten sich Entwürfe; der Editor vergisst jetzt alles beim Schließen (Arbeit über Export/Import sichern)
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
  const ANG = { yaw: 1, chest: 1, lean: 1, roll: 1, look: 1, nod: 1, tilt: 1, pitch: 1 };
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
    { id: 'head', label: 'Kopf', pt: (J) => add(J.head, mul(J.hf, 0.09)) },
    { id: 'hL', label: 'Hand links', s: 'L', pt: (J) => J.wristL },
    { id: 'hR', label: 'Hand rechts', s: 'R', pt: (J) => J.wristR },
    { id: 'eL', label: 'Ellbogen links', s: 'L', pt: (J) => J.elbowL },
    { id: 'eR', label: 'Ellbogen rechts', s: 'R', pt: (J) => J.elbowR },
    { id: 'fL', label: 'Fuß links', s: 'L', pt: (J) => J.ankleL },
    { id: 'fR', label: 'Fuß rechts', s: 'R', pt: (J) => J.ankleR },
    { id: 'kL', label: 'Knie links', s: 'L', pt: (J) => J.kneeL },
    { id: 'kR', label: 'Knie rechts', s: 'R', pt: (J) => J.kneeR },
  ];
  const partOf = (id) => PARTS.find((p) => p.id === id);
  // Was zu einem Körperteil gehört (für „Geändert:“ in der Ausgabe)
  const FIELDS = {
    body: ['pelvis', 'yaw', 'chest', 'lean', 'roll'],
    head: ['look', 'nod', 'tilt'],
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
    else if (id === 'head') {
      // Kopf: der Punkt vor dem Gesicht zeigt, wohin er schaut (Blick waagerecht, Neigen aus der Höhe)
      const d = sub(W, J.neck);
      P.look = Math.round((Math.atan2(d[0], d[2]) * 180) / Math.PI);
      const el = (Math.atan2(d[1], Math.hypot(d[0], d[2])) * 180) / Math.PI;
      P.nod = clamp(Math.round((Math.atan2(0.07, 0.09) * 180) / Math.PI - el), -60, 60);
    }
    else if (id[0] === 'h') P['h' + s] = loc(J, W);
    else if (id[0] === 'e') {
      // Ellbogenrichtung: von der Schulter zum gewünschten Ellbogen, als Punkt um die Brust (Länge 0,6 = ganz vorgegeben)
      const d = norm(sub(W, J['sh' + s]));
      P['e' + s] = [dot(d, J.lc) * 0.6, dot(d, J.up) * 0.6, dot(d, J.fc) * 0.6];
    } else if (id[0] === 'f') Object.assign(P[s], { x: W[0], y: Math.max(0.075, W[1]), z: W[2] });
    else if (id[0] === 'k') P[s].kp = norm(sub(W, J['hip' + s]));
  }

  /* ---------- Drehungen um Längsachsen (Fuß, Bein) ---------- */
  const DEG = Math.PI / 180;
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const perp = (v, a) => sub(v, mul(a, dot(v, a)));
  const fwd = (deg) => [Math.sin(deg * DEG), 0, Math.cos(deg * DEG)];
  // Fußrichtung (Ferse → Zehen) und Sohle ohne Vorgabe, wie in figur3d.js
  function footAxes(F) {
    const fh = fwd(F.yaw);
    const dir = norm(add(mul(fh, Math.cos(F.pitch * DEG)), [0, Math.sin(F.pitch * DEG), 0]));
    let s0 = sub(mul(dir, dir[1]), [0, 1, 0]);
    s0 = Math.hypot(...s0) < 0.05 ? mul(fh, -1) : norm(s0);
    return { dir, s0, s90: cross(dir, s0) };
  }
  // Fuß kippen: Winkel der Sohle um die Fußachse; positiv = Sohle zeigt zur Körpermitte (wie beim Mawashi-geri: Sohle zum Ziel)
  const sgnIn = (s) => (s === 'L' ? -1 : 1);
  function footRoll(F, s) {
    if (Math.hypot(...F.sole) < 0.01) return 0;
    const { dir, s0, s90 } = footAxes(F);
    const v = perp(F.sole, dir);
    return (Math.atan2(dot(v, s90), dot(v, s0)) / DEG) * sgnIn(s);
  }
  function setFootRoll(F, s, deg) {
    const { s0, s90 } = footAxes(F);
    const a = deg * sgnIn(s) * DEG;
    F.sole = Math.abs(deg) < 0.5 ? [0, 0, 0] : add(mul(s0, Math.cos(a)), mul(s90, Math.sin(a)));
  }
  // Fuß drehen/neigen: das Kippen bleibt dabei erhalten (die Sohle dreht mit)
  const keepRoll = (F, s, fn) => { const r = footRoll(F, s); fn(); if (Math.hypot(...F.sole) > 0.01) setFootRoll(F, s, r); };
  // Bein eindrehen: Richtung des Knies um die Linie Hüfte → Knöchel; 0 = automatisch (über den Zehen), positiv = Knie nach innen
  function legAxes(P, s) {
    const J = E.solve(P);
    const a = norm(sub(J['ankle' + s], J['hip' + s]));
    let ref = perp(add(fwd(P[s].yaw), [0, 0.15, 0]), a);
    if (Math.hypot(...ref) < 1e-3) ref = perp([0, 0, 1], a);
    ref = norm(ref);
    return { J, a, ref, b: cross(a, ref) };
  }
  function legTwist(P, s) {
    const { J, a, ref, b } = legAxes(P, s);
    let v = perp(sub(J['knee' + s], J['hip' + s]), a);
    if (Math.hypot(...v) < 1e-3) { if (Math.hypot(...P[s].kp) < 0.01) return 0; v = perp(P[s].kp, a); }
    return (Math.atan2(dot(v, b), dot(v, ref)) / DEG) * (s === 'L' ? 1 : -1);
  }
  function setLegTwist(P, s, deg) {
    const { ref, b } = legAxes(P, s);
    const t = deg * (s === 'L' ? 1 : -1) * DEG;
    P[s].kp = add(mul(ref, Math.cos(t)), mul(b, Math.sin(t)));
  }

  // Ellbogen abspreizen: Lage des Ellbogens um die Linie Schulter → Hand; 0 = hängt nach unten, positiv = weg vom Körper (nach außen)
  function armAxes(P, s) {
    const J = E.solve(P);
    const sg = s === 'L' ? 1 : -1;
    const a = norm(sub(J['wrist' + s], J['sh' + s]));
    let ref = perp(mul(J.up, -1), a);
    if (Math.hypot(...ref) < 1e-3) ref = perp(mul(J.fc, -1), a);
    ref = norm(ref);
    let out = perp(perp(mul(J.lc, sg), a), ref);
    out = Math.hypot(...out) < 1e-3 ? cross(a, ref) : norm(out);
    return { J, a, ref, out };
  }
  function elbowSpread(P, s) {
    const { J, a, ref, out } = armAxes(P, s);
    let v = perp(sub(J['elbow' + s], J['sh' + s]), a);
    if (Math.hypot(...v) < 1e-3) {
      // Arm gestreckt: Richtung aus der Vorgabe
      const e = P['e' + s];
      if (Math.hypot(...e) < 0.01) return 0;
      v = perp(add(add(mul(J.lc, e[0]), mul(J.up, e[1])), mul(J.fc, e[2])), a);
    }
    return Math.atan2(dot(v, out), dot(v, ref)) / DEG;
  }
  function setElbowSpread(P, s, deg) {
    const { J, ref, out } = armAxes(P, s);
    const t = deg * DEG;
    const d = add(mul(ref, Math.cos(t)), mul(out, Math.sin(t)));
    P['e' + s] = [dot(d, J.lc) * 0.6, dot(d, J.up) * 0.6, dot(d, J.fc) * 0.6];
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
      ];
    }
    if (id === 'head') {
      return [
        R('Blick (Kopf drehen)', -180, 180, 1, () => P.look, (v) => (P.look = v), '°'),
        R('Kopf neigen (+ Kinn zur Brust)', -60, 60, 1, () => P.nod, (v) => (P.nod = v), '°'),
        R('Kopf kippen (+ zur linken Schulter)', -45, 45, 1, () => P.tilt, (v) => (P.tilt = v), '°'),
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
        R('Ellbogen abspreizen (+ weg vom Körper)', -90, 180, 1, () => elbowSpread(P, s), (v) => setElbowSpread(P, s, v), '°'),
      ];
    }
    if (id[0] === 'f') {
      const F = P[s];
      return [
        R('Fuß drehen (Zehen links/rechts)', -180, 180, 1, () => F.yaw, (v) => keepRoll(F, s, () => (F.yaw = v)), '°'),
        R('Fuß neigen (Zehen hoch/runter)', -90, 90, 1, () => F.pitch, (v) => keepRoll(F, s, () => (F.pitch = v)), '°'),
        R('Fuß kippen (+ Sohle nach innen)', -180, 180, 1, () => footRoll(F, s), (v) => setFootRoll(F, s, v), '°'),
        R('Knie eindrehen (+ nach innen)', -180, 180, 1, () => legTwist(P, s), (v) => setLegTwist(P, s, v), '°'),
        R('Zehen hochziehen', 0, 1, 0.05, () => F.tu, (v) => (F.tu = v), ''),
        R('Höhe', 0.075, 1.2, 0.005, () => F.y, (v) => (F.y = v), 'm'),
        R('vor/zurück', F.z - 1, F.z + 1, 0.005, () => F.z, (v) => (F.z = v), 'm'),
        R('seitlich (+ links)', F.x - 1, F.x + 1, 0.005, () => F.x, (v) => (F.x = v), 'm'),
      ];
    }
    if (id[0] === 'k') {
      return [
        R('Knie eindrehen (+ nach innen)', -180, 180, 1, () => legTwist(P, s), (v) => setLegTwist(P, s, v), '°'),
        { t: 'button', label: 'Richtung wieder automatisch', help: 'Die Knierichtung wieder automatisch wählen lassen', run: () => (P[s].kp = [0, 0, 0]) },
      ];
    }
    // Ellbogen: Richtung abspreizen oder zurück auf automatisch (wie weit er vom Körper weg kann, hängt an der Lage der Hand)
    return [
      R('Ellbogen abspreizen (+ weg vom Körper)', -90, 180, 1, () => elbowSpread(P, s), (v) => setElbowSpread(P, s, v), '°'),
      { t: 'button', label: 'Richtung wieder automatisch', help: 'Die Ellbogenrichtung wieder automatisch wählen lassen', run: () => (P['e' + s] = [0, 0, 0]) },
    ];
  }

  /* ---------- Dialog ---------- */
  let S = null; // Zustand des offenen Editors
  function dialog() {
    let d = document.querySelector('.pe-dlg');
    if (d) return d;
    d = document.createElement('dialog');
    d.className = 'f3d-dlg pe-dlg';
    d.setAttribute('aria-label', 'Bewegungs-Editor');
    d.innerHTML = `<div class="f3d-dlg-head"><b class="f3d-dlg-title"></b><button type="button" class="f3d-dlg-x pe-fullbtn" data-pe="full" aria-pressed="false" aria-label="Vollbild" title="Vollbild an/aus">⛶</button><button type="button" class="f3d-dlg-x" aria-label="Schließen" title="Editor schließen – alles nicht Kopierte geht verloren">✕</button></div>
<div class="pe-main"><div class="pe-stage"><canvas class="pe-cv"></canvas><span class="pe-cam" aria-hidden="true"></span></div>
<div class="pe-side"><div class="pe-frames" role="radiogroup" aria-label="Bild der Bewegung"></div><div class="pe-bar"><button type="button" class="gfx-btn" data-pe="v-front" title="Figur von vorn ansehen (eingepasst)">Vorne</button><button type="button" class="gfx-btn" data-pe="v-side" title="Figur von der Seite ansehen (eingepasst)">Seite</button><button type="button" class="gfx-btn" data-pe="v-top" title="Figur von oben ansehen (eingepasst)">Oben</button><button type="button" class="gfx-btn" data-pe="undo" aria-label="Rückgängig" title="Letzte Änderung an diesem Bild rückgängig">↶</button><button type="button" class="gfx-btn" data-pe="orig" title="Dieses Bild zurück auf den Stand der App (Pose, Zeitpunkt und Übergang)">Original</button><button type="button" class="gfx-btn" data-pe="hide" aria-pressed="false" title="Anfasspunkte und Linien aus- bzw. einblenden">Punkte aus</button></div>
<p class="pe-hint muted small">${matchMedia('(pointer: coarse)').matches ? '1 Finger: Punkt ziehen oder drehen · 2 Finger: zoomen und verschieben' : 'Ziehen: Punkt bzw. drehen · Rechte Maustaste/Umschalt: verschieben · Mausrad: zoomen'}</p>
<div class="pe-scroll">
<div class="pe-parts" role="radiogroup" aria-label="Körperteil"></div>
<div class="pe-panel"></div>
<div class="pe-out">
<div class="pe-acts"><button type="button" class="btn" data-pe="copy" title="Den Text unten in die Zwischenablage kopieren – zum Einfügen im Chat oder zum Sichern (später mit „Importieren“ zurückholen)">Pose kopieren</button><button type="button" class="gfx-btn" data-pe="all" aria-pressed="false" hidden title="An: alle Bilder vollständig ausgeben (ganze Bewegung übernehmen). Aus: nur geänderte Bilder">Ganze Bewegung ausgeben</button><button type="button" class="gfx-btn" data-pe="imp" title="Einen früher kopierten Text einfügen und weiterbearbeiten">Importieren</button></div>
<div class="pe-imp" hidden><textarea class="pe-imptext" rows="5" aria-label="Text zum Importieren" placeholder="Kopierten Text des Bewegungs-Editors hier einfügen"></textarea><div class="pe-acts"><button type="button" class="btn" data-pe="impok" title="Posen, Zeitpunkte, Übergänge, Dauer, Kernbild und Kamera aus dem Text übernehmen">Übernehmen</button><button type="button" class="gfx-btn" data-pe="impx" title="Import abbrechen">Abbrechen</button></div></div>
<p class="pe-msg muted small" aria-live="polite"></p>
<textarea class="pe-text" rows="5" readonly aria-label="Pose als Text"></textarea>
</div></div></div></div>`;
    document.body.appendChild(d);
    d.querySelector('.f3d-dlg-x').addEventListener('click', () => d.close());
    // Beim Wechsel ins/aus dem Vollbild schließt der Browser den Dialog: dann Zustand behalten und gleich wieder öffnen
    d.addEventListener('close', () => {
      if (d._fs && S) { requestAnimationFrame(() => { if (S && !d.open) d.showModal(); }); return; }
      S = null;
      d.classList.remove('pe-full');
      document.documentElement.classList.remove('pe-fs');
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    });
    d.addEventListener('click', onClick);
    // Vollbild verlassen (z. B. mit Esc): Knopf und Größe nachziehen
    document.addEventListener('fullscreenchange', () => {
      setTimeout(() => { d._fs = false; }, 300);
      if (S && !d.open) d.showModal();
      if (!document.fullscreenElement && d.classList.contains('pe-full')) full(false);
    });
    bindStage(d.querySelector('.pe-stage'));
    // Handy gedreht (Hoch-/Querformat): Einstellungen wandern unter bzw. neben die Figur, die Figur neu einpassen.
    // Andere Größenänderungen (z. B. Adressleiste) lassen Drehung und Zoom in Ruhe.
    let portrait = innerHeight > innerWidth;
    window.addEventListener('resize', () => {
      if (!S) return;
      const p = innerHeight > innerWidth;
      if (p !== portrait) { portrait = p; S.fit = true; }
      draw();
    });
    return d;
  }

  // Bewegungen: jedes Schlüsselbild (keys in js/figur-posen.js) lässt sich bearbeiten, Start ist das Kernbild.
  // Geänderte Bilder bleiben beim Wechseln erhalten und landen alle zusammen in der Ausgabe.
  function open(key, title) {
    const id = String(key).split(':').slice(0, 2).join(':');
    const e = SK.fig3d.entry(id);
    const best = e.d.best == null ? 1 : e.d.best;
    const keys = e.d.keys;
    const frames = keys.map((k) => E.full(k.p));
    // Kernbild: Schlüsselbild an der Zeit „best“ (sonst das nächstgelegene)
    let k0 = 0;
    keys.forEach((k, i) => { if (Math.abs(k.t - best) <= Math.abs(keys[k0].t - best)) k0 = i; });
    const edits = {};
    // Alte Entwürfe früherer Fassungen aufräumen
    try { Object.keys(localStorage).filter((k) => k.startsWith(DRAFT)).forEach((k) => localStorage.removeItem(k)); } catch (err) { /* ohne Speicher */ }
    const k0app = k0;
    // Timing: Zeitpunkt und Übergang je Bild, Dauer der ganzen Bewegung (änderbar, landen in der Ausgabe)
    const tk = keys.map((k) => ({ t: k.t, e: k.e || 'io' }));
    const tm = tk.map((x) => Object.assign({}, x));
    const dur0 = e.d.dur || 1.6;
    const d = dialog();
    S = { id, title: title || id, e, keys, frames, k0, k0app, all: false, kcam: null, tk, tm, dur0, dur: dur0, speed: 1, best, edits, undos: {}, sel: 'body', cam: Object.assign({}, e.cam, { target: e.cam.target.slice() }), dlg: d, mirrored: String(key).endsWith(':m'), fit: true };
    d.querySelector('.f3d-dlg-title').textContent = `✎ ${S.title}`;
    const hb = d.querySelector('[data-pe="hide"]');
    hb.setAttribute('aria-pressed', 'false');
    hb.textContent = 'Punkte aus';
    d.querySelector('.pe-imp').hidden = true;
    const ab = d.querySelector('[data-pe="all"]');
    ab.hidden = keys.length < 2;
    ab.setAttribute('aria-pressed', String(S.all));
    d.querySelector('.pe-msg').textContent = '';
    if (!d.open) d.showModal();
    goFrame(k0);
    parts();
    requestAnimationFrame(() => draw());
  }
  // Gleiche Pose wie das Bild davor (Halten): beim Bearbeiten beide meinen
  const holdOf = (i) => { let j = i; while (j > 0 && same(rounded(S.frames[j - 1]), rounded(S.frames[i]))) j--; return j; };
  // Bildwahl: Schieber mit ‹ › (auch bei vielen Bildern kompakt), ★ springt zum Kernbild; darunter Nummer und geänderte Bilder
  function frames() {
    const box = S.dlg.querySelector('.pe-frames');
    const n = S.keys.length;
    if (n < 2) { box.innerHTML = ''; box.dataset.n = ''; return; }
    if (box.dataset.n !== String(n)) {
      box.dataset.n = String(n);
      box.innerHTML = `<div class="pe-fbar"><button type="button" class="gfx-btn" data-pe="play"></button><button type="button" class="gfx-btn" data-pe="fprev" aria-label="Bild davor" title="Bild davor">‹</button><input type="range" class="pe-fslider" min="0" max="${n - 1}" step="1" aria-label="Bild der Bewegung" title="Bild der Bewegung wählen"><button type="button" class="gfx-btn" data-pe="fnext" aria-label="nächstes Bild" title="Nächstes Bild">›</button><button type="button" class="gfx-btn pe-star" data-pe="fbest"></button></div><p class="pe-finfo small"></p>
<div class="pe-time"><label class="pe-row"><span>Zeitpunkt <output class="pe-tv"></output></span><input type="range" class="pe-tt" step="0.01" title="Wann dieses Bild erreicht wird (t von 0 bis 1, dahinter in Sekunden)"></label><label class="pe-row"><span>Übergang zu diesem Bild</span><select class="pe-te" title="Wie die Figur zu diesem Bild kommt">${Object.entries(EASE_UI).map(([v, l]) => `<option value="${v}" title="${esc(EASE_HELP[v])}">${esc(l)}</option>`).join('')}</select></label></div>
<div class="pe-time"><label class="pe-row"><span>Dauer der Bewegung <output class="pe-dv"></output></span><input type="range" class="pe-dur" min="0.6" max="5" step="0.1" title="Wie lange die ganze Bewegung dauert"></label><label class="pe-row"><span>Abspielen</span><select class="pe-speed" title="Tempo beim Abspielen mit ▶ (ändert die Bewegung nicht)"><option value="1">normal schnell</option><option value="0.5">halb so schnell</option><option value="0.25">Zeitlupe (¼)</option></select></label></div>`;
      const sl = box.querySelector('.pe-fslider');
      sl.addEventListener('input', () => { if (S.play) S.play = null; if (+sl.value !== S.k) goFrame(+sl.value); });
      box.querySelector('.pe-tt').addEventListener('input', (ev) => { S.tm[S.k].t = +ev.target.value; S.t = S.tm[S.k].t; timing(); });
      box.querySelector('.pe-te').addEventListener('change', (ev) => { S.tm[S.k].e = ev.target.value; timing(); });
      box.querySelector('.pe-dur').addEventListener('input', (ev) => { S.dur = +ev.target.value; timing(); });
      box.querySelector('.pe-speed').addEventListener('change', (ev) => { S.speed = +ev.target.value; });
    }
    const ed = [...new Set(Object.keys(S.edits).map(Number).filter((i) => !same(rounded(S.edits[i]), rounded(S.frames[i]))).concat(S.keys.map((_, i) => i).filter(timingChanged)))].sort((x, y) => x - y);
    const pb = box.querySelector('[data-pe="play"]');
    pb.textContent = S.play ? '■' : '▶';
    pb.setAttribute('aria-label', S.play ? 'Anhalten' : 'Bewegung abspielen');
    pb.title = S.play ? 'Anhalten' : 'Bewegung mit allen Änderungen abspielen (Tempo unten bei „Abspielen“)';
    pb.setAttribute('aria-pressed', String(!!S.play));
    const sl = box.querySelector('.pe-fslider');
    if (+sl.value !== S.k) sl.value = S.k;
    box.querySelector('[data-pe="fprev"]').disabled = S.k <= 0;
    box.querySelector('[data-pe="fnext"]').disabled = S.k >= n - 1;
    const star = box.querySelector('[data-pe="fbest"]');
    const isK = S.k === S.k0;
    star.textContent = isK ? '★' : '☆';
    star.setAttribute('aria-pressed', String(isK));
    star.setAttribute('aria-label', isK ? 'Kernbild' : 'Dieses Bild als Kernbild');
    star.title = isK ? 'Dieses Bild ist das Kernbild (das Standbild in der App)' : 'Dieses Bild zum Kernbild machen';
    const tt = box.querySelector('.pe-tt');
    const first = S.k === 0;
    tt.min = first ? S.tm[0].t : Math.round((S.tm[S.k - 1].t + 0.01) * 100) / 100;
    tt.max = first ? S.tm[0].t : S.k === n - 1 ? Math.max(1, S.tm[S.k].t) : Math.round((S.tm[S.k + 1].t - 0.01) * 100) / 100;
    tt.disabled = first;
    if (+tt.value !== S.tm[S.k].t) tt.value = S.tm[S.k].t;
    box.querySelector('.pe-tv').textContent = `t = ${S.tm[S.k].t.toFixed(2)} · ${((S.tm[S.k].t - S.tm[0].t) * S.dur).toFixed(2)} s`;
    const te = box.querySelector('.pe-te');
    te.disabled = first;
    te.value = S.tm[S.k].e in EASE_UI ? S.tm[S.k].e : 'io';
    te.title = first ? 'Das erste Bild hat keinen Übergang' : EASE_HELP[te.value];
    const du = box.querySelector('.pe-dur');
    if (+du.value !== S.dur) du.value = S.dur;
    box.querySelector('.pe-dv').textContent = `${(S.dur * (S.tm[n - 1].t - S.tm[0].t)).toFixed(1)} s`;
    const h = holdOf(S.k);
    box.querySelector('.pe-finfo').innerHTML = `<b>Bild ${S.k + 1} von ${n}</b>${S.k === S.k0 ? ` · Kernbild ★${S.k0 !== S.k0app ? ' (neu gewählt)' : ''}` : ''}${h !== S.k ? ` · wie Bild ${h + 1}` : ''}${ed.length ? ` · <span class="pe-ed">geändert: ${ed.map((i) => i + 1).join(', ')}</span>` : ''}`;
  }
  // Bild wechseln: Änderungen des bisherigen Bildes merken
  function goFrame(i) {
    if (S.k != null) keep();
    S.k = i;
    S.orig = clone(S.frames[i]);
    S.P = clone(S.edits[i] || S.frames[i]);
    S.undo = S.undos[i] || (S.undos[i] = []);
    S.t = S.tm[i].t;
    frames();
    panel();
    text();
    draw();
  }
  function keep() {
    if (!same(rounded(S.P), rounded(S.orig))) S.edits[S.k] = clone(S.P);
    else delete S.edits[S.k];
  }

  // Übergänge, wie sie im Editor heißen (e in den keys von js/figur-posen.js)
  const EASE_UI = { fl: 'fließend', io: 'weich', kime: 'Kime', in: 'anlaufen', out: 'auslaufen', lin: 'gleichmäßig' };
  const EASE_HELP = {
    fl: 'fließend: zieht ohne Anhalten durch dieses Bild weiter (für Zwischenbilder)',
    io: 'weich: fährt sanft an und hält an diesem Bild kurz an',
    kime: 'Kime: schnell ins Ziel und dort hart stoppen (Treffer)',
    in: 'anlaufen: startet langsam und wird schneller, ohne am Bild abzubremsen',
    out: 'auslaufen: startet schnell und bremst zum Bild hin sanft ab',
    lin: 'gleichmäßig: gleiches Tempo von Bild zu Bild',
  };
  // Schlüsselbilder mit allen Änderungen (Posen und Timing)
  const effKeys = () => S.keys.map((k, i) => Object.assign({}, k, { t: S.tm[i].t, e: S.tm[i].e, p: S.edits[i] || k.p }));
  const timingChanged = (i) => S.tm[i].t !== S.tk[i].t || S.tm[i].e !== S.tk[i].e;
  function timing() {
    save();
    text();
  }

  /* ---------- Abspielen: die Bewegung mit den geänderten Bildern ---------- */
  function play() {
    if (S.play) { S.play = null; frames(); draw(); return; }
    keep();
    const K = effKeys();
    const tl = E.timeline(K, S.e.d.fix);
    const t0 = K[0].t;
    const t1 = K[K.length - 1].t;
    const dur = (S.dur * (t1 - t0 || 1)) / (S.speed || 1);
    const start = performance.now();
    const run = S.play = { pose: tl(t0) };
    frames();
    const step = (now) => {
      if (!S || S.play !== run) return;
      const u = Math.min(1, (now - start) / 1000 / dur);
      run.pose = tl(t0 + (t1 - t0) * u);
      S.fast = true;
      draw();
      if (u < 1) requestAnimationFrame(step);
      else setTimeout(() => { if (S && S.play === run) { S.play = null; S.fast = false; frames(); draw(); } }, 600);
    };
    requestAnimationFrame(step);
  }

  function parts() {
    const box = S.dlg.querySelector('.pe-parts');
    box.innerHTML = PARTS.map((p) => `<button type="button" class="gfx-btn pe-chip pe-${p.s || 'C'}" role="radio" data-part="${p.id}" aria-checked="${p.id === S.sel}" title="${esc(p.label)} einstellen (Regler darunter, oder den Punkt im Bild ziehen)">${esc(p.label)}</button>`).join('');
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
      return `<button type="button" class="gfx-btn" data-i="${i}" title="${esc(c.help || c.label)}">${esc(c.label)}</button>`;
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
    if (!fast) { text(); save(); }
  }
  // Nichts wird gespeichert: nur die Bildanzeige nachziehen
  function save() {
    keep();
    frames();
  }
  // Kamera wie in der App (cam.yaw, cam.pitch in js/figur-app.js): Drehung um die Figur, 0° = von vorn (+z), Neigung von oben
  const camOf = (c) => ({ y: Math.round(((((c.yaw + 180) % 360) + 360) % 360) - 180), p: Math.round(c.pitch) });
  const camInfo = () => camOf(S.cam);
  const camInfo0 = () => camOf(S.e.cam);
  // Ausgabe: alle geänderten Bilder (dazu immer das gezeigte), je mit Zeit und geänderten Körperteilen;
  // „Ganze Bewegung“: jedes Bild vollständig, zum Übernehmen der kompletten Bewegung.
  // Die Kamera gilt fürs Kernbild: gemerkt wird, wie das Kernbild zuletzt angesehen wurde (sonst die Kamera der App).
  const EASE = { fl: 'fließend', io: 'weich', in: 'anlaufen', out: 'auslaufen', kime: 'Kime', lin: 'gleichmäßig' };
  function text() {
    keep();
    if (S.k === S.k0 && S.camMoved) S.kcam = camInfo();
    const changedParts = (P, O) => PARTS.filter((p) => FIELDS[p.id].some((f) => !same(rounded(get(P, f), f.split('.').pop()), rounded(get(O, f), f.split('.').pop())))).map((p) => p.label);
    const n = S.keys.length;
    const all = S.all && n > 1;
    const k0t = Math.round(S.tm[S.k0].t * 100) / 100;
    const lines = [`Bewegungs-Editor · ${S.id} · ${S.title}${S.mirrored ? ' (Figur ungespiegelt)' : ''}${n > 1 ? ` · ${all ? `ganze Bewegung, alle ${n} Bilder` : `Bewegung mit ${n} Bildern`}, Kernbild = Bild ${S.k0 + 1} (t = ${k0t})${S.k0 !== S.k0app ? `, neu gewählt (bisher Bild ${S.k0app + 1})` : ''}${n > 1 ? ` · Dauer ${(S.dur * (S.tm[n - 1].t - S.tm[0].t)).toFixed(2)} s (dur ${S.dur}${S.dur !== S.dur0 ? `, bisher ${S.dur0}` : ''})` : ''}` : ''}`];
    const kc = S.kcam || camInfo0();
    lines.push(`Kamera${n > 1 ? ' fürs Kernbild' : ''}: Drehung ${kc.y}°, Neigung ${kc.p}°${S.kcam ? '' : ' (wie in der App)'}`);
    const list = all ? S.keys.map((_, i) => i) : [...new Set(Object.keys(S.edits).map(Number).concat(S.k).concat(S.keys.map((_, i) => i).filter(timingChanged)))].sort((x, y) => x - y);
    list.forEach((i) => {
      const P = S.edits[i] || S.frames[i];
      const ch = changedParts(P, S.frames[i]);
      if (S.tm[i].t !== S.tk[i].t) ch.push('Zeitpunkt');
      if (S.tm[i].e !== S.tk[i].e) ch.push('Übergang');
      const h = holdOf(i);
      const tt = Math.round(S.tm[i].t * 100) / 100;
      if (all) {
        const eh = (S.edits[h] || S.frames[h]);
        const hold = h !== i && same(rounded(P), rounded(eh));
        const ease = i ? `, Übergang ${EASE[S.tm[i].e] || S.tm[i].e}` : '';
        lines.push('', `Bild ${i + 1} von ${n} (t = ${tt}${ease}${i === S.k0 ? ', Kernbild' : ''}) – ${hold ? `gleiche Pose wie Bild ${h + 1}` : `geändert: ${ch.length ? ch.join(', ') : 'nichts'}`}`);
        if (!hold) lines.push(lit(diff(P)));
        return;
      }
      const info = n > 1 ? `Bild ${i + 1} von ${n} (t = ${tt}${i ? `, Übergang ${EASE[S.tm[i].e] || S.tm[i].e}` : ''}${i === S.k0 ? ', Kernbild' : ''}${h !== i ? `, in der App gleiche Pose wie Bild ${h + 1}` : ''})` : 'Standbild';
      lines.push('', `${info} – geändert: ${ch.length ? ch.join(', ') : 'nichts'}`, lit(diff(P)));
    });
    S.dlg.querySelector('[data-pe="copy"]').textContent = all ? 'Bewegung kopieren' : 'Pose kopieren';
    S.dlg.querySelector('[data-pe="all"]').textContent = all ? '✓ Ganze Bewegung' : 'Ganze Bewegung ausgeben';
    S.text = lines.join('\n');
    S.dlg.querySelector('.pe-text').value = S.text;
  }

  // Vollbild: Dialog füllt den Bildschirm (wenn möglich echtes Vollbild des Browsers)
  function full(on) {
    const d = S ? S.dlg : document.querySelector('.pe-dlg');
    if (!d) return;
    d.classList.toggle('pe-full', on);
    document.documentElement.classList.toggle('pe-fs', on);
    const b = d.querySelector('[data-pe="full"]');
    b.setAttribute('aria-pressed', String(on));
    b.title = on ? 'Vollbild beenden' : 'Vollbild an/aus';
    try {
      const de = document.documentElement;
      if (on && de.requestFullscreen && !document.fullscreenElement) { d._fs = true; de.requestFullscreen().catch(() => { d._fs = false; }); }
      if (!on && document.fullscreenElement) { d._fs = true; document.exitFullscreen().catch(() => { d._fs = false; }); }
    } catch (err) { /* ohne Vollbild-Schnittstelle bleibt es beim großen Dialog */ }
    if (S) { S.fit = true; draw(); }
  }

  // Import: Text aus „Kopieren“ zurück in den Editor (Posen, Zeitpunkte, Übergänge, Dauer, Kernbild, Kamera)
  function importText(txt) {
    const L = String(txt || '').split(/\r?\n/).map((l) => l.trim());
    const head = L.find((l) => /Editor · /.test(l));
    if (!head) return 'Kein Text des Bewegungs-Editors gefunden.';
    if (!head.includes(`· ${S.id} ·`)) return `Der Text gehört zu einer anderen Figur (${(head.split(' · ')[1] || '?')}), nicht zu ${S.id}.`;
    const n = S.keys.length;
    const lit2obj = (l) => JSON.parse(l.replace(/([{,]\s*)([A-Za-z_]\w*)\s*:/g, '$1"$2":'));
    const easeOf = (name) => Object.keys(EASE).find((k) => name.startsWith(EASE[k])) || null;
    const got = {};
    try {
      for (let li = 0; li < L.length; li++) {
        let i = null;
        let m = L[li].match(/^Bild (\d+) von (\d+) \(t = ([\d.]+)(?:, Übergang ([^,)]+))?/);
        if (m) {
          if (+m[2] !== n) return `Der Text hat ${m[2]} Bilder, die Figur hier ${n}.`;
          i = +m[1] - 1;
          got[i] = { t: +m[3], e: m[4] ? easeOf(m[4]) : null };
        } else if (n === 1 && /^Standbild/.test(L[li])) {
          i = 0;
          got[0] = {};
        }
        if (i == null) continue;
        const same2 = L[li].match(/gleiche Pose wie Bild (\d+)/);
        if (same2) got[i].sameAs = +same2[1] - 1;
        else if (L[li + 1] && L[li + 1][0] === '{') got[i].p = E.full(lit2obj(L[li + 1]));
      }
    } catch (err) {
      return 'Der Text ließ sich nicht lesen (Posen-Zeile beschädigt?).';
    }
    const idx = Object.keys(got).map(Number).sort((a, b) => a - b);
    if (!idx.length) return 'Im Text stehen keine Bilder.';
    keep();
    idx.forEach((i) => {
      const g = got[i];
      const P = g.p || (g.sameAs != null ? (got[g.sameAs] && got[g.sameAs].p) || S.edits[g.sameAs] || S.frames[g.sameAs] : null);
      if (P) {
        if (same(rounded(P), rounded(S.frames[i]))) delete S.edits[i];
        else S.edits[i] = clone(P);
      }
      if (g.t != null) S.tm[i].t = g.t;
      if (g.e) S.tm[i].e = g.e;
    });
    const k = head.match(/Kernbild = Bild (\d+)/);
    if (k && S.keys[+k[1] - 1]) S.k0 = +k[1] - 1;
    const du = head.match(/\(dur ([\d.]+)/);
    if (du) S.dur = +du[1];
    const cam = L.find((l) => /^Kamera/.test(l));
    const cm = cam && cam.match(/Drehung (-?\d+)°, Neigung (-?\d+)°/);
    if (cm && !/wie in der App/.test(cam)) {
      S.kcam = { y: +cm[1], p: +cm[2] };
      Object.assign(S.cam, { yaw: S.kcam.y, pitch: S.kcam.p });
      S.fit = true;
    }
    S.all = /ganze Bewegung/.test(head);
    S.dlg.querySelector('[data-pe="all"]').setAttribute('aria-pressed', String(S.all));
    const at = S.k;
    S.k = null;
    goFrame(at);
    return `Importiert: ${idx.length} Bild${idx.length === 1 ? '' : 'er'}${k ? `, Kernbild Bild ${S.k0 + 1}` : ''}${du ? `, Dauer ${S.dur}` : ''}${S.kcam ? ', Kamera' : ''}.`;
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
      S.fit = true;
      if (a === 'v-front') Object.assign(S.cam, { yaw: S.P.yaw, pitch: 6 });
      if (a === 'v-side') Object.assign(S.cam, { yaw: S.P.yaw - 90, pitch: 6 });
      if (a === 'v-top') Object.assign(S.cam, { yaw: S.P.yaw, pitch: 86 });
      S.camMoved = true;
      draw();
      text();
    }
    // Markierungen (Punkte, Linien) aus- und einblenden, um die Figur ungestört anzusehen; ohne Punkte nur drehen und zoomen
    if (a === 'hide') {
      S.hide = !S.hide;
      b.setAttribute('aria-pressed', String(S.hide));
      b.textContent = S.hide ? 'Punkte an' : 'Punkte aus';
      draw();
    }
    if (a === 'play') return play();
    if (a === 'all') {
      S.all = !S.all;
      b.setAttribute('aria-pressed', String(S.all));
      save();
      text();
      return;
    }
    if (a === 'full') return full(!S.dlg.classList.contains('pe-full'));
    if (a === 'imp' || a === 'impx') {
      const box = S.dlg.querySelector('.pe-imp');
      box.hidden = a === 'impx' || !box.hidden;
      if (!box.hidden) {
        const ta = box.querySelector('.pe-imptext');
        ta.value = '';
        ta.focus();
        if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then((t) => { if (/Editor · /.test(t) && !ta.value) ta.value = t; }).catch(() => {});
      }
      return;
    }
    if (a === 'impok') {
      const r = importText(S.dlg.querySelector('.pe-imptext').value);
      msg.textContent = r;
      if (/^Importiert/.test(r)) S.dlg.querySelector('.pe-imp').hidden = true;
      return;
    }
    if (a === 'fbest') {
      if (S.k === S.k0) return;
      S.k0 = S.k;
      if (S.camMoved) S.kcam = camInfo();
      save();
      text();
      msg.textContent = `Bild ${S.k + 1} ist jetzt das Kernbild – wie du es gerade ansiehst, kommt als Kamera mit in die Ausgabe.`;
      return;
    }
    if (a === 'fprev' || a === 'fnext') {
      if (S.play) S.play = null;
      const i = clamp(S.k + (a === 'fnext' ? 1 : -1), 0, S.keys.length - 1);
      if (i !== S.k) goFrame(i);
      else { frames(); draw(); }
      return;
    }
    if (a === 'undo' && S.undo.length) { S.P = S.undo.pop(); panel(); changed(false); }
    if (a === 'orig') {
      if (same(rounded(S.P), rounded(S.orig)) && !timingChanged(S.k)) return;
      push();
      S.P = clone(S.orig);
      S.tm[S.k] = Object.assign({}, S.tk[S.k]);
      S.t = S.tm[S.k].t;
      panel();
      changed(false);
      msg.textContent = 'Bild zurück auf die gespeicherte Pose der App (↶ holt deine Änderungen zurück).';
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
  }

  /* ---------- Bild und Anfasser ---------- */
  // Figur einpassen: Blickpunkt in die Mitte der Figur, Abstand so, dass sie die Bildfläche füllt
  // (beim Öffnen und bei Vorne/Seite/Oben; Drehen und Zoomen lassen die Kamera dann in Ruhe)
  function fit(w, h) {
    const J = E.solve(S.P);
    const pts = [add(J.head, [0, 0.13, 0]), J.toeL, J.toeR, J.heelL, J.heelR, J.tipL, J.tipR, J.fistL, J.fistR, J.elbowL, J.elbowR, J.kneeL, J.kneeR, J.shL, J.shR, J.pel];
    const cam = S.cam;
    cam.fov = 30;
    cam.dist = 6;
    cam.target = [0, 1, 2].map((i) => (Math.min(...pts.map((p) => p[i])) + Math.max(...pts.map((p) => p[i]))) / 2);
    // Gelenke plus Körperbreite (Gi, Gürtel) quer zur Blickrichtung
    const box = () => {
      const C = E.camera(cam, w, h);
      const q = pts.flatMap((p) => [C.project(add(p, mul(C.cu, 0.28))), C.project(add(p, mul(C.cu, -0.28)))]);
      const xs = q.map((v) => v[0]);
      const ys = q.map((v) => v[1]);
      return { C, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
    };
    for (let it = 0; it < 8; it++) {
      // Abstand fest, Blickwinkel passend (schmale, hohe Bildfläche am Handy: weiterer Winkel statt sehr weiter Kamera)
      let B = box();
      const k = Math.max((B.x1 - B.x0) / (w * 0.9), (B.y1 - B.y0) / (h * 0.86), 0.05);
      cam.fov = clamp((2 * Math.atan(Math.tan((cam.fov * Math.PI) / 360) * k) * 180) / Math.PI, 8, 90);
      // dann mittig rücken
      B = box();
      const m = (2 * cam.dist) / (B.C.f * h);
      cam.target = add(add(cam.target, mul(B.C.cu, ((B.x0 + B.x1) / 2 - w / 2) * m)), mul(B.C.cv, -((B.y0 + B.y1) / 2 - h / 2) * m));
    }
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
      if (S.fit) { S.fit = false; fit(w, h); }
      const ctx = cv.getContext('2d');
      ctx.clearRect(0, 0, w, h);
      const C = E.draw(ctx, w, h, S.play ? S.play.pose : S.P, S.cam, { mode: 0 });
      if (!C) {
        S.dlg.querySelector('.pe-msg').textContent = 'Die Figur lässt sich auf diesem Gerät nicht zeichnen (kein WebGL 2).';
        return;
      }
      S.C = C;
      S.scale = w / cw;
      const c = camInfo();
      S.dlg.querySelector('.pe-cam').textContent = `Kamera ${c.y}° · ${c.p}°`;
      if (!S.hide && !S.play) handles(ctx, C, r);
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
    // Bild verschieben: Bildschirm-Pixel → Blickpunkt in der Bildebene (die Figur folgt dem Finger)
    const pan = (dx, dy) => {
      const C = S.C;
      const k = (2 * S.cam.dist) / (C.f * (stage.clientHeight || 1));
      S.cam.target = add(add(S.cam.target, mul(C.cu, -dx * k)), mul(C.cv, dy * k));
    };
    // Mausrad: zoomen (PC)
    stage.addEventListener('wheel', (ev) => {
      if (!S || !S.C) return;
      ev.preventDefault();
      S.cam.dist = clamp(S.cam.dist * Math.exp(ev.deltaY * (ev.deltaMode === 1 ? 0.05 : 0.0018)), 1.2, 14);
      S.fast = true;
      draw();
      clearTimeout(S.wheelT);
      S.wheelT = setTimeout(() => S && changed(false), 200);
    }, { passive: false });
    stage.addEventListener('pointerdown', (ev) => {
      if (!S || !S.C) return;
      if (S.play) { S.play = null; frames(); }
      stage.setPointerCapture && stage.setPointerCapture(ev.pointerId);
      // rechte/mittlere Maustaste oder Umschalt: verschieben statt drehen
      pts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY, pan: ev.button === 1 || ev.button === 2 || ev.shiftKey });
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
      (S.hide ? [] : spots()).forEach((s) => {
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
        // zwei Finger: Abstand zoomt, Mitte verschiebt (ein Finger bewegt die Mitte um die Hälfte)
        pan(dx / 2, dy / 2);
        const [a, b] = [...pts.values()];
        const dd = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch > 10) S.cam.dist = clamp(S.cam.dist * (pinch / dd), 1.2, 14);
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
      } else if (p.pan) {
        pan(dx, dy);
        S.fast = true;
        draw();
      } else {
        S.cam.yaw -= dx * 0.45;
        S.camMoved = true;
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
  SK.poseEditor = { enabled, setEnabled, open, diff, setPoint, loc, footRoll, setFootRoll, legTwist, setLegTwist, elbowSpread, setElbowSpread, state: () => S };
})();
