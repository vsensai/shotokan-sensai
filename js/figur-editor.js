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
    const touch = matchMedia('(pointer: coarse)').matches;
    const HELP = touch ? '1 Finger auf einem Punkt: ziehen · 1 Finger daneben: Ansicht drehen · 2 Finger: zoomen und verschieben' : 'Punkt ziehen: bewegen · daneben ziehen: Ansicht drehen · rechte Maustaste oder Umschalt: verschieben · Mausrad: zoomen';
    const pm = (cls, label, st) => `<div class="pe-ctl"><button type="button" class="pe-pm" data-pm="${cls}"${st ? ` data-st="${st}"` : ''} data-d="-1" aria-label="${label} weniger" title="${label}: einen Schritt weniger">−</button><input type="range" class="${cls}" aria-label="${label}"><button type="button" class="pe-pm" data-pm="${cls}"${st ? ` data-st="${st}"` : ''} data-d="1" aria-label="${label} mehr" title="${label}: einen Schritt mehr">+</button></div>`;
    d.innerHTML = `<div class="f3d-dlg-head"><b class="f3d-dlg-title"></b><button type="button" class="f3d-dlg-x pe-fullbtn" data-pe="full" aria-pressed="false" aria-label="Vollbild" title="Editor über das ganze Fenster">⛶</button><button type="button" class="f3d-dlg-x pe-close" aria-label="Schließen" title="Editor schließen – alles nicht Kopierte geht verloren">✕</button></div>
<div class="pe-main"><div class="pe-left">
<div class="pe-stage"><canvas class="pe-cv"></canvas>
<div class="pe-tools"><button type="button" class="pe-tb" data-pe="v-front" title="Figur von vorn ansehen (eingepasst)">Vorne</button><button type="button" class="pe-tb" data-pe="v-side" title="Figur von der Seite ansehen (eingepasst)">Seite</button><button type="button" class="pe-tb" data-pe="v-top" title="Figur von oben ansehen (eingepasst)">Oben</button><button type="button" class="pe-tb" data-pe="hide" aria-pressed="false" title="Anfasspunkte und Linien aus- bzw. einblenden">Punkte aus</button></div>
<button type="button" class="pe-tb pe-helpbtn" data-pe="help" aria-expanded="false" aria-label="Bedienung" title="Bedienung anzeigen">?</button>
<p class="pe-helptext" hidden>${HELP}</p>
<span class="pe-cam" aria-hidden="true"></span></div>
<div class="pe-grip" title="Ziehen: Bild höher oder niedriger" aria-hidden="true"></div>
<div class="pe-tl"><button type="button" class="pe-rb" data-pe="play"></button><button type="button" class="pe-rb pe-slow" data-pe="slow" aria-pressed="false" aria-label="Zeitlupe" title="Zeitlupe: beim Abspielen mit ▶ viermal langsamer (ändert die Bewegung nicht)">¼×</button><button type="button" class="pe-rb" data-pe="fprev" aria-label="Bild davor" title="Bild davor">‹</button><div class="pe-trackwrap"><div class="pe-track" role="radiogroup" aria-label="Bilder der Bewegung"></div><span class="pe-trackpad" aria-hidden="true"></span></div><button type="button" class="pe-rb" data-pe="fnext" aria-label="nächstes Bild" title="Nächstes Bild">›</button><button type="button" class="pe-rb pe-star" data-pe="fbest"></button></div>
</div>
<div class="pe-side">
<div class="pe-tabs" role="tablist"><button type="button" class="pe-tab" role="tab" data-tab="bild" title="Zeitpunkt, Übergang, Dauer und Kernbild des gezeigten Bildes">Bild</button><button type="button" class="pe-tab" role="tab" data-tab="koerper" title="Körperteile des gezeigten Bildes einstellen">Körper</button><button type="button" class="pe-tab" role="tab" data-tab="ausgabe" title="Text der ganzen Bewegung zum Kopieren, Import">Ausgabe</button></div>
<div class="pe-pane" data-pane="bild">
<div class="pe-ph"><h3 class="pe-bh"></h3><button type="button" class="pe-sm" data-pe="undo" aria-label="Rückgängig" title="Letzte Änderung an diesem Bild rückgängig">↶</button><button type="button" class="pe-sm" data-pe="orig" title="Dieses Bild zurück auf den Stand der App (Pose, Zeitpunkt und Übergang)">Original</button></div>
<p class="pe-finfo small"></p>
<div class="pe-movonly">
<label class="pe-row"><span>Übergang zu diesem Bild</span><select class="pe-te" title="Wie die Figur zu diesem Bild kommt">${Object.entries(EASE_UI).map(([v, l]) => `<option value="${v}" title="${esc(EASE_HELP[v])}">${esc(l)}</option>`).join('')}</select></label>
${easeGuide()}
<div class="pe-tbrow pe-pauserow" hidden><span>Pause am Anfang <b class="pe-pv"></b></span><button type="button" class="pe-pm" data-pe="pz-" aria-label="Pause am Anfang kürzer" title="Die Figur steht vor der Bewegung 0,05 s kürzer still">−</button><button type="button" class="pe-pm" data-pe="pz+" aria-label="Pause am Anfang länger" title="Die Figur steht vor der Bewegung 0,05 s länger still">+</button></div>
<p class="pe-total"></p>
<div class="pe-ttouch"><div class="pe-tbrow"><span>Zeit vom Bild davor <b class="pe-tsv"></b></span><button type="button" class="pe-pm" data-pe="seg-" aria-label="Zeit vom Bild davor kürzer" title="0,05 s kürzer">−</button><button type="button" class="pe-pm" data-pe="seg+" aria-label="Zeit vom Bild davor länger" title="0,05 s länger">+</button></div><div class="pe-tbrow"><span>Ganze Bewegung <b class="pe-ttv"></b></span><button type="button" class="pe-pm" data-pe="tot-" aria-label="Ganze Bewegung schneller" title="Ganze Bewegung 0,05 s kürzer (alle Abschnitte gleichmäßig)">−</button><button type="button" class="pe-pm" data-pe="tot+" aria-label="Ganze Bewegung langsamer" title="Ganze Bewegung 0,05 s länger (alle Abschnitte gleichmäßig)">+</button></div><p class="small muted">Die Bilder danach rücken mit. Auf der Zeitleiste: Punkt antippen wählt das Bild, wischen verschiebt die Leiste.</p></div>
<p class="pe-tthint small muted">Zeit ändern: den Punkt auf der Zeitleiste ziehen; die Bilder danach rücken mit. Ganze Bewegung schneller oder langsamer: den Griff am Ende der Zeitleiste ziehen. Mit der Tastatur: ← / → für das gewählte Bild.</p>
</div>
<div class="pe-camrow"><span class="pe-camv small"></span><button type="button" class="pe-wide" data-pe="camset" title="Die Ansicht, wie du die Figur gerade siehst (Drehung und Neigung), als Kamera fürs Kernbild in die Ausgabe übernehmen">Ansicht als Kamera fürs Kernbild</button><button type="button" class="pe-wide" data-pe="camreset" title="Wieder die Kamera der App verwenden; die Ansicht im Editor bleibt, wie sie ist">Zurück auf App-Kamera</button></div>
</div>
<div class="pe-pane" data-pane="koerper">
<div class="pe-ph"><h3 class="pe-kh"></h3><button type="button" class="pe-sm" data-pe="undo" aria-label="Rückgängig" title="Letzte Änderung an diesem Bild rückgängig">↶</button><button type="button" class="pe-sm" data-pe="orig" title="Dieses Bild zurück auf den Stand der App (Pose, Zeitpunkt und Übergang)">Original</button></div>
<p class="pe-parthint small muted">Anderes Körperteil: seinen Punkt im Bild antippen.</p>
<div class="pe-panel"></div></div>
<div class="pe-pane" data-pane="ausgabe">
<button type="button" class="pe-wide" data-pe="imp" title="Einen früher kopierten Text einfügen und weiterbearbeiten">Importieren</button>
<div class="pe-imp" hidden><textarea class="pe-imptext" rows="5" aria-label="Text zum Importieren" placeholder="Kopierten Text des Bewegungs-Editors hier einfügen"></textarea><div class="pe-acts"><button type="button" class="btn" data-pe="impok" title="Posen, Zeitpunkte, Übergänge, Dauer, Kernbild und Kamera aus dem Text übernehmen">Übernehmen</button><button type="button" class="pe-wide" data-pe="impx" title="Import abbrechen">Abbrechen</button></div></div>
<p class="pe-outhint small muted">Dieser Text kommt beim Kopieren in die Zwischenablage – alle Bilder der Bewegung, je mit dem, was geändert ist.</p><textarea class="pe-text" readonly aria-label="Bewegung als Text"></textarea></div>
<div class="pe-sticky"><p class="pe-msg muted small" aria-live="polite"></p><button type="button" class="btn" data-pe="copy" title="Den Text in die Zwischenablage kopieren – zum Einfügen im Chat oder zum Sichern (später mit „Importieren“ zurückholen)">Kopieren</button></div>
</div></div>`;
    document.body.appendChild(d);
    d.querySelector('.pe-close').addEventListener('click', () => d.close());
    d.addEventListener('close', () => {
      // Schon wieder geöffnet (Schließen und Öffnen im selben Augenblick): den neuen Stand behalten
      if (d.open) return;
      S = null;
      d.classList.remove('pe-full');
      document.documentElement.classList.remove('pe-fs');
    });
    d.addEventListener('click', onClick);
    // Touch: Zeitleiste mit Mindestabstand (seitlich wischbar), Regler nur bei seitlichem Wischen
    d.classList.toggle('pe-coarse', touch);
    bindStage(d.querySelector('.pe-stage'));
    bindTrack(d.querySelector('.pe-track'));
    bindGrip(d.querySelector('.pe-grip'), d);
    // Pfeiltasten (PC): Zeit vom Bild davor in 0,05-s-Schritten
    d.addEventListener('keydown', (ev) => {
      if (!S || S.k === 0 || S.keys.length < 2 || !/^Arrow(Left|Right)$/.test(ev.key)) return;
      if (ev.target.closest('input, textarea, select')) return;
      ev.preventDefault();
      const seg = (S.tm[S.k].t - S.tm[S.k - 1].t) * S.dur;
      setSeg(S.k, clamp(Math.round((seg + (ev.key === 'ArrowRight' ? 0.05 : -0.05)) * 20) / 20, 0.05, 3));
    });
    d.querySelector('.pe-te').addEventListener('change', (ev) => { S.tm[S.k].e = ev.target.value; timing(); });
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
    S = { id, title: title || id, e, keys, frames, k0, k0app, kcam: null, tk, tm, dur0, dur: dur0, speed: 1, best, edits, undos: {}, sel: 'body', cam: Object.assign({}, e.cam, { target: e.cam.target.slice() }), dlg: d, mirrored: String(key).endsWith(':m'), fit: true };
    S.pause = keys.length > 2 && same(rounded(frames[0]), rounded(frames[1]));
    d.querySelector('.f3d-dlg-title').textContent = `✎ ${S.title}`;
    const hb = d.querySelector('[data-pe="hide"]');
    hb.setAttribute('aria-pressed', 'false');
    hb.textContent = 'Punkte aus';
    d.querySelector('.pe-imp').hidden = true;
    // Standbild: keine Zeitleiste, kein Timing
    d.querySelector('.pe-tl').hidden = keys.length < 2;
    d.querySelector('.pe-movonly').hidden = keys.length < 2;
    tab(TAB);
    d.querySelector('.pe-msg').textContent = '';
    if (!d.open) d.showModal();
    goFrame(k0);
    requestAnimationFrame(() => draw());
  }
  // Gleiche Pose wie das Bild davor (Halten): beim Bearbeiten beide meinen
  const holdOf = (i) => { let j = i; while (j > 0 && same(rounded(S.frames[j - 1]), rounded(S.frames[i]))) j--; return j; };
  // Pause am Anfang: ist Bild 2 nur das stehende Bild 1 (Halten vor der Bewegung), zeigt der Editor es nicht als eigenes
  // Bild, sondern als Einstellung „Pause am Anfang“ (im Reiter Bild beim ersten Bild). Nummern zählen dann ohne dieses Bild.
  const PZ = () => !!(S && S.pause);
  const nr = (i) => (PZ() && i >= 1 ? i : i + 1);
  const nTot = () => S.keys.length - (PZ() ? 1 : 0);
  const shown = (i) => !(PZ() && i === 1);
  // Zeitleiste, Bildleiste und Reiter „Bild“ auf den Stand bringen: jedes Bild ist eine Marke an seinem Zeitpunkt
  // (★ Kernbild, gestrichelt = hält das Bild davor, rot = Übergang Kime); Klick wählt, Ziehen ändert den Zeitpunkt
  function frames() {
    const d = S.dlg;
    const n = S.keys.length;
    const ed = [...new Set(Object.keys(S.edits).map(Number).filter((i) => !same(rounded(S.edits[i]), rounded(S.frames[i]))).concat(S.keys.map((_, i) => i).filter(timingChanged)))].sort((x, y) => x - y);
    const h = holdOf(S.k);
    const isK = S.k === S.k0;
    const edS = ed.filter(shown);
    const head = n > 1 ? `Bild ${nr(S.k)} von ${nTot()}${isK ? ' · Kernbild ★' : ''}` : 'Standbild';
    d.querySelector('.pe-bh').textContent = head;
    d.querySelector('.pe-kh').textContent = `${partOf(S.sel).label}${n > 1 ? ` · Bild ${nr(S.k)}${isK ? ' ★' : ''}` : ''}`;
    d.querySelector('.pe-finfo').innerHTML = [isK && S.k0 !== S.k0app ? 'Kernbild neu gewählt' : '', h !== S.k ? `gleiche Pose wie Bild ${nr(h)}` : '', edS.length ? `<span class="pe-ed">geändert: Bild ${edS.map(nr).join(', ')}</span>` : ''].filter(Boolean).join(' · ');
    // Kamera fürs Kernbild: nur über den Knopf übernommen, Drehen zum Anschauen ändert nichts
    const kc = S.kcam || camInfo0();
    d.querySelector('.pe-camv').textContent = `Kamera ${n > 1 ? 'fürs Kernbild' : 'des Bildes'}: ${kc.y}° · ${kc.p}°${S.kcam ? ' (neu übernommen)' : ' (wie in der App)'}`;
    d.querySelector('[data-pe="camset"]').textContent = n > 1 ? 'Ansicht als Kamera fürs Kernbild' : 'Ansicht als Kamera übernehmen';
    d.querySelector('[data-pe="camreset"]').disabled = !S.kcam;
    if (n < 2) return;
    const pb = d.querySelector('[data-pe="play"]');
    pb.textContent = S.play ? '■' : '▶';
    pb.setAttribute('aria-label', S.play ? 'Anhalten' : 'Bewegung abspielen');
    pb.title = S.play ? 'Anhalten' : `Bewegung mit allen Änderungen abspielen${S.speed < 1 ? ' – in Zeitlupe' : ''}`;
    d.querySelector('[data-pe="slow"]').setAttribute('aria-pressed', String(S.speed < 1));
    pb.setAttribute('aria-pressed', String(!!S.play));
    d.querySelector('[data-pe="fprev"]').disabled = S.k <= 0;
    d.querySelector('[data-pe="fnext"]').disabled = S.k >= n - 1;
    d.querySelectorAll('[data-pe="fbest"]').forEach((b) => {
      b.textContent = isK ? '★' : '☆';
      b.setAttribute('aria-pressed', String(isK));
      b.setAttribute('aria-label', isK ? 'Kernbild' : 'Dieses Bild als Kernbild');
      b.title = isK ? 'Dieses Bild ist das Kernbild (das Standbild in der App)' : 'Dieses Bild zum Kernbild machen';
    });
    // Zeitleiste
    const tr = d.querySelector('.pe-track');
    // Maßstab: vom ersten bis zum letzten Bild (die Zeitleiste zeigt die tatsächliche Dauer)
    const sec = (t) => (t - S.tm[0].t) * S.dur;
    const total = sec(S.tm[n - 1].t);
    // Beim Ziehen bleibt der Maßstab vom Beginn des Ziehens, damit die Punkte nicht unter dem Finger wegspringen
    const scS = S.drag ? S.drag.scS : total || 1;
    const pos = (t) => `${clamp(sec(t) / scS, 0, 1) * 100}%`;
    tr.innerHTML = S.tm.map((x, i) => {
      if (!shown(i)) return `<span class="pe-pause" data-a="${S.tm[0].t}" data-b="${x.t}" title="Pause am Anfang: ${sec(x.t).toFixed(2)} s"></span>`;
      const seg = i && x.e === 'kime' ? `<span class="pe-seg" data-a="${S.tm[i - 1].t}" data-b="${x.t}"></span>` : '';
      const hold = i && holdOf(i) !== i;
      return `${seg}<button type="button" class="pe-mk${i === S.k ? ' sel' : ''}${i === S.k0 ? ' kern' : ''}${hold ? ' hold' : ''}${ed.includes(i) ? ' ed' : ''}" role="radio" aria-checked="${i === S.k}" data-mk="${i}" title="Bild ${nr(i)} · nach ${sec(x.t).toFixed(2)} s${i ? ` · ${((x.t - S.tm[i - 1].t) * S.dur).toFixed(2)} s vom Bild davor · ${EASE_UI[x.e] || x.e}` : ''}${i === S.k0 ? ' · Kernbild' : ''}${hold ? ` · hält Bild ${nr(holdOf(i))}` : ''}${i ? ' – ziehen ändert die Zeit vom Bild davor, die Bilder danach rücken mit' : ''}"><span>${nr(i)}</span></button>`;
    }).join('') + `<span class="pe-tick">0 s</span><button type="button" class="pe-endh" data-endh="1" title="Ziehen: ganze Bewegung gleichmäßig schneller (nach links) oder langsamer (nach rechts)"><b aria-hidden="true">⟷</b> ${total.toFixed(2)} s</button><span class="pe-head" hidden></span><span class="pe-dlab" hidden></span>`;
    // Touch: so breit, dass auch die zwei dichtesten Punkte mindestens 28 px auseinanderliegen (höchstens 2400 px)
    if (d.classList.contains('pe-coarse')) {
      let minF = 1;
      const vis = S.tm.map((_, i) => i).filter(shown);
      for (let k = 1; k < vis.length; k++) minF = Math.min(minF, (S.tm[vis[k]].t - S.tm[vis[k - 1]].t) / (S.tm[n - 1].t - S.tm[0].t || 1));
      tr.style.minWidth = `${Math.round(Math.min(2400, Math.max(n * 34, 28 / Math.max(minF, 0.005))))}px`;
    }
    // gewähltes Bild sichtbar halten, wenn die Zeitleiste seitlich wischbar ist
    const wrap = tr.parentElement;
    if (wrap.scrollWidth > wrap.clientWidth + 2 && !S.drag) {
      requestAnimationFrame(() => {
        const sel = tr.querySelector('.pe-mk.sel');
        if (!sel) return;
        const a = sel.offsetLeft - wrap.scrollLeft;
        if (a < 24 || a > wrap.clientWidth - 24) wrap.scrollLeft = sel.offsetLeft - wrap.clientWidth / 2;
      });
    }
    // Lage per Skript (die Seite erlaubt keine style-Angaben im HTML)
    tr.querySelectorAll('[data-mk]').forEach((m) => (m.style.left = pos(S.tm[+m.dataset.mk].t)));
    tr.querySelectorAll('.pe-seg, .pe-pause').forEach((g) => { g.style.left = pos(+g.dataset.a); g.style.width = `${(((+g.dataset.b - +g.dataset.a) * S.dur) / scS) * 100}%`; });
    // Beim Ziehen: Zeit über dem Punkt bzw. Gesamtdauer über dem Griff
    if (S.drag && S.drag.label) {
      const lab = tr.querySelector('.pe-dlab');
      lab.hidden = false;
      lab.textContent = S.drag.label;
      lab.style.left = S.drag.end ? '100%' : pos(S.tm[S.drag.i].t);
    }
    // Reiter „Bild“
    const first = S.k === 0;
    const seg = first ? 0 : (S.tm[S.k].t - S.tm[S.k - 1].t) * S.dur;
    const pr = d.querySelector('.pe-pauserow');
    pr.hidden = !(first && PZ());
    if (PZ()) d.querySelector('.pe-pv').textContent = `${((S.tm[1].t - S.tm[0].t) * S.dur).toFixed(2)} s`;
    d.querySelector('.pe-tsv').textContent = first ? '–' : `${seg.toFixed(2)} s`;
    d.querySelector('.pe-ttv').textContent = `${total.toFixed(2)} s`;
    d.querySelectorAll('[data-pe="seg-"], [data-pe="seg+"]').forEach((b) => (b.disabled = first));
    d.querySelector('.pe-total').textContent = `${first ? 'erstes Bild' : `${seg.toFixed(2)} s vom Bild davor`} · ganze Bewegung ${total.toFixed(2)} s`;
    const te = d.querySelector('.pe-te');
    te.disabled = first;
    te.value = S.tm[S.k].e in EASE_UI ? S.tm[S.k].e : 'io';
    te.title = first ? 'Das erste Bild hat keinen Übergang' : EASE_HELP[te.value];
    d.querySelectorAll('.pe-eh').forEach((x) => x.classList.toggle('on', !first && x.dataset.eh === te.value));
  }
  // Zeitleiste nur mit Punkten: antippen wählt das Bild; ziehen (ab 4 Pixel) ändert die Zeit vom Bild davor in
  // 0,05-s-Schritten, die Bilder danach rücken mit; der Griff am Ende streckt oder staucht die ganze Bewegung
  function bindTrack(tr) {
    const total = () => (S.tm[S.tm.length - 1].t - S.tm[0].t) * S.dur;
    const secOf = (i) => (S.tm[i].t - S.tm[0].t) * S.dur;
    let g = null;
    tr.addEventListener('pointerdown', (ev) => {
      if (!S) return;
      const touch = ev.pointerType === 'touch';
      // Touch neben den Punkten oder auf dem Griff: die Zeitleiste seitlich wischen
      if (touch && !ev.target.closest('[data-mk]')) return;
      if (S.play) S.play = null;
      if (ev.target.closest('[data-endh]')) {
        ev.preventDefault();
        g = { end: true, armed: true, x0: ev.clientX, id: ev.pointerId, moved: false, tot0: total(), dur0: S.dur };
        tr.setPointerCapture(ev.pointerId);
        return;
      }
      // Punkt unter dem Finger, sonst der nächstgelegene (Maus)
      let m = ev.target.closest('[data-mk]');
      if (!m) {
        const b = tr.getBoundingClientRect();
        const at = ((ev.clientX - b.left) / b.width) * total();
        let best = 0;
        S.tm.forEach((x, k) => { if (shown(k) && Math.abs(secOf(k) - at) < Math.abs(secOf(best) - at)) best = k; });
        m = tr.querySelector(`[data-mk="${best}"]`);
        if (!m) return;
      }
      const i = +m.dataset.mk;
      if (!touch) {
        // Maus: sofort wählen und ziehen
        ev.preventDefault();
        if (i !== S.k) goFrame(i);
        g = { i, armed: true, x0: ev.clientX, id: ev.pointerId, moved: false };
        tr.setPointerCapture(ev.pointerId);
        return;
      }
      // Touch: nur antippen wählt das Bild, Wischen scrollt die Zeitleiste (Zeit ändern mit − / + im Reiter Bild)
      g = { i, touch: true, armed: false, x0: ev.clientX, y0: ev.clientY, id: ev.pointerId, moved: false };
    });
    // Touch: solange ein Punkt gezogen wird, darf die Zeitleiste nicht scrollen
    tr.addEventListener('pointermove', (ev) => {
      if (!g || !S || ev.pointerId !== g.id) return;
      if (!g.armed) {
        // Touch vor dem Halten bewegt: das ist Wischen (Scrollen), kein Ziehen
        if (Math.abs(ev.clientX - g.x0) > 8 || Math.abs(ev.clientY - g.y0) > 8) { clearTimeout(g.timer); g = null; }
        return;
      }
      if (!g.moved && Math.abs(ev.clientX - g.x0) < 4) return;
      if (!g.end && g.i === 0) return;
      if (!g.moved) { g.moved = true; S.drag = { scS: total() || 1, end: g.end, i: g.i }; }
      const b = tr.getBoundingClientRect();
      if (g.end) {
        const tot = clamp(Math.round(((g.tot0 * (b.width + ev.clientX - g.x0)) / b.width) * 20) / 20, 0.3, 10);
        S.dur = Math.round(((g.dur0 * tot) / g.tot0) * 10000) / 10000;
        S.drag.label = `ganze Bewegung ${tot.toFixed(2)} s`;
        timing();
        return;
      }
      const at = ((ev.clientX - b.left) / b.width) * S.drag.scS;
      const seg = clamp(Math.round((at - secOf(g.i - 1)) * 20) / 20, 0.05, 3);
      S.drag.label = `${seg.toFixed(2)} s`;
      if (Math.abs(seg - (S.tm[g.i].t - S.tm[g.i - 1].t) * S.dur) > 0.001) setSeg(g.i, seg);
      else frames();
    });
    const up = (ev) => {
      if (!g || ev.pointerId !== g.id) return;
      const was = g;
      g = null;
      if (!S) return;
      // Touch nur angetippt: Bild wählen
      if (was.touch && !was.armed && ev.type === 'pointerup' && was.i !== S.k) { goFrame(was.i); return; }
      S.drag = null;
      if (was.moved) timing();
      else frames();
    };
    tr.addEventListener('pointerup', up);
    tr.addEventListener('pointercancel', up);
  }
  // Griff unter dem Bild (Hochformat): Bildhöhe ziehen
  function bindGrip(g, d) {
    let y0 = null;
    let h0 = 0;
    g.addEventListener('pointerdown', (ev) => {
      y0 = ev.clientY;
      h0 = d.querySelector('.pe-stage').offsetHeight;
      g.setPointerCapture(ev.pointerId);
    });
    g.addEventListener('pointermove', (ev) => {
      if (y0 == null) return;
      const h = clamp(h0 + ev.clientY - y0, 160, innerHeight * 0.75);
      d.style.setProperty('--pe-sh', `${Math.round(h)}px`);
      draw();
    });
    const up = () => { if (y0 != null) { y0 = null; if (S) { S.fit = true; draw(); } } };
    g.addEventListener('pointerup', up);
    g.addEventListener('pointercancel', up);
  }
  // Reiter: Bild, Körper, Ausgabe (bleibt beim nächsten Öffnen gewählt)
  let TAB = 'koerper';
  function tab(t) {
    TAB = t;
    const d = S.dlg;
    d.querySelectorAll('.pe-tab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
    d.querySelectorAll('.pe-pane').forEach((p) => (p.hidden = p.dataset.pane !== t));
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
    // Pause am Anfang: das stehende Bild bleibt genau wie Bild 1
    if (PZ() && S.k === 0) {
      if (S.edits[0]) S.edits[1] = clone(S.edits[0]);
      else delete S.edits[1];
    }
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
  // Übersicht der Übergänge: Tempo-Kurve (von Bild davor bis zu diesem Bild), Bedeutung, wofür man ihn nimmt
  const EASE_GUIDE = [
    ['fl', 'M2 12 C14 6 26 5 34 6 S54 9 58 8', 'zieht ohne Anhalten durch das Bild weiter', 'Zwischenbilder einer fließenden Bewegung'],
    ['io', 'M2 18 C14 18 20 4 30 4 S46 18 58 18', 'fährt sanft an und hält am Bild kurz an', 'Haltungen, Anfang und Ende'],
    ['kime', 'M2 10 C10 6 30 2 46 3 L52 4 L56 18 L58 18', 'schnell ins Ziel und dort hart stoppen', 'der Treffer'],
    ['in', 'M2 18 C24 18 44 10 58 3', 'startet langsam, wird schneller, bremst nicht', 'Ausholen vor einer schnellen Phase'],
    ['out', 'M2 3 C16 10 36 18 58 18', 'startet schnell, bremst zum Bild hin ab', 'Auslaufen nach einer schnellen Phase'],
    ['lin', 'M2 9 L58 9', 'gleiches Tempo vom Bild davor bis hier', 'gleichmäßige Wege, selten nötig'],
  ];
  const easeGuide = () => `<details class="pe-easehelp"><summary title="Kurze Übersicht: was die Übergänge bedeuten">Was bedeuten die Übergänge?</summary><p class="pe-eh-note">Die Kurve zeigt das Tempo auf dem Weg vom Bild davor bis zu diesem Bild (links Start, rechts Ankunft; oben schnell, unten Stillstand).</p><dl>${EASE_GUIDE.map(([k, d, what, use]) => `<div class="pe-eh" data-eh="${k}"><dt><svg viewBox="0 0 60 21" width="60" height="21" aria-hidden="true"><path d="M2 19 H58" stroke="currentColor" stroke-opacity="0.25" fill="none"/><path d="${d}" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg><b>${esc(EASE_UI[k])}</b></dt><dd>${esc(what)}<br><span class="muted">${esc(use)}</span></dd></div>`).join('')}</dl></details>`;
  // Schlüsselbilder mit allen Änderungen (Posen und Timing)
  const effKeys = () => S.keys.map((k, i) => Object.assign({}, k, { t: S.tm[i].t, e: S.tm[i].e, p: S.edits[i] || k.p }));
  // Geändert zählt in Sekunden (beim Strecken der Zeitachse ändern sich t und Dauer, die Sekunden aber nicht)
  const secChanged = (i) => Math.abs((S.tm[i].t - S.tm[0].t) * S.dur - (S.tk[i].t - S.tk[0].t) * S.dur0) > 0.005;
  const timingChanged = (i) => secChanged(i) || S.tm[i].e !== S.tk[i].e;
  // Zeit vom Bild davor (Sekunden) setzen: dieses und alle späteren Bilder rücken mit; reicht die Zeitachse (t bis 1)
  // nicht, wird sie gestreckt (Dauer und Zeitpunkte so umgerechnet, dass die Sekunden gleich bleiben)
  function setSeg(i, secs) {
    if (!i) return;
    const d = secs / S.dur - (S.tm[i].t - S.tm[i - 1].t);
    for (let j = i; j < S.tm.length; j++) S.tm[j].t = Math.round((S.tm[j].t + d) * 1000) / 1000;
    const last = S.tm[S.tm.length - 1].t;
    if (last > 1) {
      S.dur = Math.round(S.dur * last * 1000) / 1000;
      S.tm.forEach((x) => (x.t = Math.round((x.t / last) * 1000) / 1000));
    }
    S.t = S.tm[S.k].t;
    timing();
  }
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
      const ph = S.dlg.querySelector('.pe-head');
      if (ph) { ph.hidden = false; ph.style.left = `${clamp(t0 + (t1 - t0) * u, 0, 1) * 100}%`; }
      S.fast = true;
      draw();
      if (u < 1) requestAnimationFrame(step);
      else setTimeout(() => { if (S && S.play === run) { S.play = null; S.fast = false; frames(); draw(); } }, 600);
    };
    requestAnimationFrame(step);
  }

  function select(id) {
    S.sel = id;
    if (S.dlg.querySelector('.pe-pane[data-pane="koerper"]').hidden) tab('koerper');
    panel();
    frames();
  }
  function panel() {
    const box = S.dlg.querySelector('.pe-panel');
    const list = controls(S.sel, S.P);
    S.ctl = list;
    box.innerHTML = list.map((c, i) => {
      if (c.t === 'range') return `<div class="pe-row"><span>${esc(c.label)} <output data-o="${i}"></output></span><div class="pe-ctl"><button type="button" class="pe-pm" data-pi="${i}" data-d="-1" aria-label="${esc(c.label)} weniger" title="Einen Schritt weniger (${c.unit === '°' ? '1°' : c.unit === 'm' ? '1 cm' : c.step})">−</button><input type="range" data-i="${i}" min="${c.min}" max="${c.max}" step="${c.step}" aria-label="${esc(c.label)}"><button type="button" class="pe-pm" data-pi="${i}" data-d="1" aria-label="${esc(c.label)} mehr" title="Einen Schritt mehr (${c.unit === '°' ? '1°' : c.unit === 'm' ? '1 cm' : c.step})">+</button></div></div>`;
      if (c.t === 'select') return `<label class="pe-row"><span>${esc(c.label)}</span><select data-i="${i}">${c.opts.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('')}<option value="eigen" hidden>eigene Richtung</option></select></label>`;
      return `<button type="button" class="pe-wide" data-i="${i}" title="${esc(c.help || c.label)}">${esc(c.label)}</button>`;
    }).join('');
    sync();
    box.querySelectorAll('input[type=range]').forEach((inp) => {
      inp.addEventListener('input', () => {
        if (!inp._busy) { inp._busy = true; push(); }
        S.ctl[+inp.dataset.i].set(+inp.value);
        changed(true);
      });
      inp.addEventListener('change', () => { inp._busy = false; changed(false); });
      if (S.dlg.classList.contains('pe-coarse')) touchRange(inp);
    });
    box.querySelectorAll('select').forEach((sel) => sel.addEventListener('change', () => {
      push();
      S.ctl[+sel.dataset.i].set(sel.value);
      changed(false);
      // Faust ↔ offen: andere Richtungswahl
      if (S.ctl[+sel.dataset.i].label === 'Hand') panel();
    }));
    box.querySelectorAll('button[data-i]').forEach((b) => b.addEventListener('click', () => { push(); S.ctl[+b.dataset.i].run(); changed(false); }));
    // − / +: ein fester Schritt (1° bzw. 1 cm)
    box.querySelectorAll('[data-pi]').forEach((b) => b.addEventListener('click', () => {
      const c = S.ctl[+b.dataset.pi];
      const st = c.unit === '°' ? 1 : c.unit === 'm' ? 0.01 : c.step;
      push();
      c.set(clamp(Math.round((c.get() + st * +b.dataset.d) / c.step) * c.step, c.min, c.max));
      changed(false);
    }));
  }
  // Touch: der Regler selbst nimmt keine Berührung an; erst ein klar seitliches Wischen über seine Zeile verstellt ihn
  // (relativ, wie beim Schieben des Knopfes), senkrechtes Wischen scrollt die Liste
  function touchRange(inp) {
    const row = inp.parentElement;
    let t = null;
    row.addEventListener('pointerdown', (ev) => {
      if (ev.pointerType !== 'touch' || ev.target.closest('button')) return;
      t = { x: ev.clientX, y: ev.clientY, v: +inp.value, mode: null, id: ev.pointerId };
    });
    row.addEventListener('pointermove', (ev) => {
      if (!t || ev.pointerId !== t.id) return;
      const dx = ev.clientX - t.x;
      const dy = ev.clientY - t.y;
      if (!t.mode) {
        if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { t = null; return; }
        if (Math.abs(dx) < 8) return;
        t.mode = 'slide';
        row.setPointerCapture(ev.pointerId);
      }
      const w = inp.getBoundingClientRect().width || 1;
      const st = +inp.step || 0.01;
      const v = clamp(Math.round((t.v + (dx / w) * (+inp.max - +inp.min)) / st) * st, +inp.min, +inp.max);
      if (v !== +inp.value) { inp.value = v; inp.dispatchEvent(new Event('input')); }
    });
    const end = (ev) => {
      if (!t || ev.pointerId !== t.id) return;
      const was = t.mode;
      t = null;
      if (was) inp.dispatchEvent(new Event('change'));
    };
    row.addEventListener('pointerup', end);
    row.addEventListener('pointercancel', end);
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
  // Die Kamera gilt fürs Kernbild: nur was mit „Ansicht als Kamera fürs Kernbild“ übernommen wurde (sonst die Kamera der App).
  const EASE = { fl: 'fließend', io: 'weich', in: 'anlaufen', out: 'auslaufen', kime: 'Kime', lin: 'gleichmäßig' };
  function text() {
    keep();
    const changedParts = (P, O) => PARTS.filter((p) => FIELDS[p.id].some((f) => !same(rounded(get(P, f), f.split('.').pop()), rounded(get(O, f), f.split('.').pop())))).map((p) => p.label);
    const n = S.keys.length;
    // Immer die ganze Bewegung (jedes Bild vollständig, gehaltene Bilder als Verweis)
    const all = n > 1;
    const k0t = Math.round(S.tm[S.k0].t * 1000) / 1000;
    const lines = [`Bewegungs-Editor · ${S.id} · ${S.title}${S.mirrored ? ' (Figur ungespiegelt)' : ''}${n > 1 ? ` · ${all ? `ganze Bewegung, alle ${nTot()} Bilder` : `Bewegung mit ${nTot()} Bildern`}, Kernbild = Bild ${nr(S.k0)} (t = ${k0t})${S.k0 !== S.k0app ? `, neu gewählt (bisher Bild ${nr(S.k0app)})` : ''}${n > 1 ? ` · Dauer ${(S.dur * (S.tm[n - 1].t - S.tm[0].t)).toFixed(2)} s (dur ${S.dur}${S.dur !== S.dur0 ? `, bisher ${S.dur0}` : ''})` : ''}` : ''}`];
    const kc = S.kcam || camInfo0();
    lines.push(`Kamera${n > 1 ? ' fürs Kernbild' : ''}: Drehung ${kc.y}°, Neigung ${kc.p}°${S.kcam ? '' : ' (wie in der App)'}`);
    // Pause am Anfang statt eines eigenen Bildes (im Code: Bild 1 noch einmal zum Zeitpunkt t der Pause)
    if (PZ()) lines.push(`Pause am Anfang: ${((S.tm[1].t - S.tm[0].t) * S.dur).toFixed(2)} s (t = ${Math.round(S.tm[1].t * 1000) / 1000})${secChanged(1) ? ', geändert' : ''}`);
    const list = all ? S.keys.map((_, i) => i) : [...new Set(Object.keys(S.edits).map(Number).concat(S.k).concat(S.keys.map((_, i) => i).filter(timingChanged)))].sort((x, y) => x - y);
    list.forEach((i) => {
      if (!shown(i)) return;
      const P = S.edits[i] || S.frames[i];
      const ch = changedParts(P, S.frames[i]);
      if (secChanged(i)) ch.push('Zeitpunkt');
      if (S.tm[i].e !== S.tk[i].e) ch.push('Übergang');
      const h = holdOf(i);
      const tt = Math.round(S.tm[i].t * 1000) / 1000;
      if (all) {
        const eh = (S.edits[h] || S.frames[h]);
        const hold = h !== i && same(rounded(P), rounded(eh));
        const ease = i ? `, Übergang ${EASE[S.tm[i].e] || S.tm[i].e}` : '';
        lines.push('', `Bild ${nr(i)} von ${nTot()} (t = ${tt}${ease}${i === S.k0 ? ', Kernbild' : ''}) – ${hold ? `gleiche Pose wie Bild ${nr(h)}` : `geändert: ${ch.length ? ch.join(', ') : 'nichts'}`}`);
        if (!hold) lines.push(lit(diff(P)));
        return;
      }
      const info = n > 1 ? `Bild ${i + 1} von ${n} (t = ${tt}${i ? `, Übergang ${EASE[S.tm[i].e] || S.tm[i].e}` : ''}${i === S.k0 ? ', Kernbild' : ''}${h !== i ? `, in der App gleiche Pose wie Bild ${h + 1}` : ''})` : 'Standbild';
      lines.push('', `${info} – geändert: ${ch.length ? ch.join(', ') : 'nichts'}`, lit(diff(P)));
    });
    S.text = lines.join('\n');
    S.dlg.querySelector('.pe-text').value = S.text;
  }

  // Vollbild: Dialog füllt das ganze Browserfenster (kein Vollbild des Browsers)
  function full(on) {
    const d = S ? S.dlg : document.querySelector('.pe-dlg');
    if (!d) return;
    d.classList.toggle('pe-full', on);
    document.documentElement.classList.toggle('pe-fs', on);
    const b = d.querySelector('[data-pe="full"]');
    b.setAttribute('aria-pressed', String(on));
    b.title = on ? 'Wieder kleiner' : 'Editor über das ganze Fenster';
    if (S) { S.fit = true; draw(); }
  }

  // Import: Text aus „Kopieren“ zurück in den Editor (Posen, Zeitpunkte, Übergänge, Dauer, Kernbild, Kamera)
  function importText(txt) {
    const L = String(txt || '').split(/\r?\n/).map((l) => l.trim());
    const head = L.find((l) => /Editor · /.test(l));
    if (!head) return 'Kein Text des Bewegungs-Editors gefunden.';
    if (!head.includes(`· ${S.id} ·`)) return `Der Text gehört zu einer anderen Figur (${(head.split(' · ')[1] || '?')}), nicht zu ${S.id}.`;
    const n = S.keys.length;
    // Neues Format mit „Pause am Anfang“: Bildnummern zählen ohne das stehende Bild 2
    const pzl = L.find((l) => /^Pause am Anfang: /.test(l));
    const pzm = pzl && pzl.match(/^Pause am Anfang: ([\d.]+) s/);
    if (pzl && !PZ()) return 'Der Text hat eine Pause am Anfang, diese Figur nicht.';
    const nT = pzl ? n - 1 : n;
    const kix = (d) => (pzl && d >= 2 ? d : d - 1);
    const lit2obj = (l) => JSON.parse(l.replace(/([{,]\s*)([A-Za-z_]\w*)\s*:/g, '$1"$2":'));
    const easeOf = (name) => Object.keys(EASE).find((k) => name.startsWith(EASE[k])) || null;
    const got = {};
    try {
      for (let li = 0; li < L.length; li++) {
        let i = null;
        let m = L[li].match(/^Bild (\d+) von (\d+) \(t = ([\d.]+)(?:, Übergang ([^,)]+))?/);
        if (m) {
          if (+m[2] !== nT) return `Der Text hat ${m[2]} Bilder, die Figur hier ${nT}.`;
          i = kix(+m[1]);
          got[i] = { t: +m[3], e: m[4] ? easeOf(m[4]) : null };
        } else if (n === 1 && /^Standbild/.test(L[li])) {
          i = 0;
          got[0] = {};
        }
        if (i == null) continue;
        const same2 = L[li].match(/gleiche Pose wie Bild (\d+)/);
        if (same2) got[i].sameAs = kix(+same2[1]);
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
    if (k && S.keys[kix(+k[1])]) S.k0 = kix(+k[1]);
    const du = head.match(/\(dur ([\d.]+)/);
    if (du) S.dur = +du[1];
    // Pause: das stehende Bild bekommt Pose und Zeit aus „Pause am Anfang“
    if (pzm) {
      if (S.edits[0]) S.edits[1] = clone(S.edits[0]);
      else delete S.edits[1];
      const tp = pzl.match(/t = ([\d.]+)/);
      S.tm[1].t = tp ? +tp[1] : Math.round((S.tm[0].t + +pzm[1] / S.dur) * 1000) / 1000;
    }
    const cam = L.find((l) => /^Kamera/.test(l));
    const cm = cam && cam.match(/Drehung (-?\d+)°, Neigung (-?\d+)°/);
    if (cm && !/wie in der App/.test(cam)) {
      S.kcam = { y: +cm[1], p: +cm[2] };
      Object.assign(S.cam, { yaw: S.kcam.y, pitch: S.kcam.p });
      S.fit = true;
    }
    const at = S.k;
    S.k = null;
    goFrame(at);
    return `Importiert: ${idx.length} Bild${idx.length === 1 ? '' : 'er'}${k ? `, Kernbild Bild ${nr(S.k0)}` : ''}${du ? `, Dauer ${S.dur}` : ''}${S.kcam ? ', Kamera' : ''}.`;
  }

  function onClick(ev) {
    if (!S) return;
    const tb = ev.target.closest('[data-tab]');
    if (tb) return tab(tb.dataset.tab);
    const pmb = ev.target.closest('[data-pm]');
    if (pmb) {
      const inp = S.dlg.querySelector(`.${pmb.dataset.pm}`);
      const v = clamp(Math.round((+inp.value + +(pmb.dataset.st || inp.step) * +pmb.dataset.d) * 100) / 100, +inp.min, +inp.max);
      inp.value = v;
      inp.dispatchEvent(new Event('input'));
      return;
    }
    const b = ev.target.closest('[data-pe]');
    if (!b) return;
    const a = b.dataset.pe;
    if (a === 'help') {
      const h = S.dlg.querySelector('.pe-helptext');
      h.hidden = !h.hidden;
      b.setAttribute('aria-expanded', String(!h.hidden));
      return;
    }
    const J = E.solve(S.P);
    const msg = S.dlg.querySelector('.pe-msg');
    if (a === 'v-front' || a === 'v-side' || a === 'v-top') {
      S.fit = true;
      if (a === 'v-front') Object.assign(S.cam, { yaw: S.P.yaw, pitch: 6 });
      if (a === 'v-side') Object.assign(S.cam, { yaw: S.P.yaw - 90, pitch: 6 });
      if (a === 'v-top') Object.assign(S.cam, { yaw: S.P.yaw, pitch: 86 });
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
    if (a === 'slow') {
      S.speed = S.speed < 1 ? 1 : 0.25;
      frames();
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
    if (a === 'pz-' || a === 'pz+') {
      if (!PZ()) return;
      const pz = (S.tm[1].t - S.tm[0].t) * S.dur;
      setSeg(1, clamp(Math.round((pz + (a === 'pz+' ? 0.05 : -0.05)) * 20) / 20, 0.05, 3));
      return;
    }
    // Handy: Zeit mit − / + (0,05 s)
    if (a === 'seg-' || a === 'seg+') {
      if (!S.k) return;
      const seg = (S.tm[S.k].t - S.tm[S.k - 1].t) * S.dur;
      setSeg(S.k, clamp(Math.round((seg + (a === 'seg+' ? 0.05 : -0.05)) * 20) / 20, 0.05, 3));
      return;
    }
    if (a === 'tot-' || a === 'tot+') {
      const n = S.tm.length;
      const tot = (S.tm[n - 1].t - S.tm[0].t) * S.dur;
      const nt = clamp(Math.round((tot + (a === 'tot+' ? 0.05 : -0.05)) * 20) / 20, 0.3, 10);
      S.dur = Math.round(((S.dur * nt) / tot) * 10000) / 10000;
      timing();
      return;
    }
    if (a === 'camset' || a === 'camreset') {
      const c = camInfo();
      const c0 = camInfo0();
      S.kcam = a === 'camset' && (c.y !== c0.y || c.p !== c0.p) ? c : null;
      save();
      text();
      msg.textContent = S.kcam ? `Kamera übernommen: Drehung ${c.y}°, Neigung ${c.p}°.` : 'Es gilt wieder die Kamera der App.';
      return;
    }
    if (a === 'fbest') {
      if (S.k === S.k0) return;
      S.k0 = S.k;
      save();
      text();
      msg.textContent = `Bild ${nr(S.k)} ist jetzt das Kernbild.`;
      return;
    }
    if (a === 'fprev' || a === 'fnext') {
      if (S.play) S.play = null;
      let i = clamp(S.k + (a === 'fnext' ? 1 : -1), 0, S.keys.length - 1);
      if (!shown(i)) i = a === 'fnext' ? 2 : 0;
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
        tab('ausgabe');
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
      // Trefferfläche rot wie in der App; sie sitzt fest am Körperteil und wandert mit, wenn die Pose geändert wird
      const pose = S.play ? S.play.pose : S.P;
      const C = E.draw(ctx, w, h, pose, S.cam, { mode: 0, hit: SK.fig3d.spots(S.e, E.solve(pose)) });
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
      // Werkzeugleiste und Hilfe im Bild sind Knöpfe, kein Ziehen
      if (ev.target.closest('button, .pe-helptext')) return;
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
