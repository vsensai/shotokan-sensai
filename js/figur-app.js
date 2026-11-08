/* 3D-Figuren in der App: ruhende Kernbilder (einmal gerechnet, dann zwischengespeichert),
   per Finger drehbar, ▶ Bewegung (einmal abspielen, Endstellung halten). Ohne WebGL 2 (oder mit ?svg) bleibt die Bildfläche leer,
   die Startseite zeigt dann einen Hinweis. */
(function () {
  'use strict';
  const E = window.Figur3D;
  const D = SK.fig3dDefs || {};
  const esc = (s) => SK.util.esc(s);

  let avail = null;
  function ok() {
    if (avail == null) {
      try {
        avail = !!(E && !/[?&]svg\b/.test(location.search) && E.ok());
      } catch (e) {
        avail = false;
      }
    }
    return avail;
  }
  const split = (key) => {
    const [kind, k, m] = String(key).split(':');
    return { id: `${kind}:${k}`, mirrored: m === 'm' };
  };
  // known: es gibt eine 3D-Figur zum Schlüssel (dann keine SVG-Grafik); has: sie lässt sich auch zeigen
  const known = (key) => !!key && !!D[split(key).id];
  const has = (key) => known(key) && ok();

  /* ---------- Einträge vorbereiten: Ablauf, Kamera ---------- */
  const VIEWS = {
    side: { yaw: -88, pitch: 8 }, side3: { yaw: -64, pitch: 14 }, front3: { yaw: -34, pitch: 13 },
    front: { yaw: -6, pitch: 9 }, stand: { yaw: -60, pitch: 20 },
  };
  const entries = new Map();
  // Bildausschnitt: Blickpunkt in die Mitte der ganzen Figur (Kopf, Hände, Füße) über die ganze Bewegung; der Abstand bleibt
  // wie gewohnt und wächst nur, wenn sonst etwas aus dem Bild (5 : 4) ragen würde
  const FRAME_ASPECT = 1.25;
  const FRAME_FILL = 0.95;
  function fitCam(cam, pose, partner, t0, t1) {
    const { add, mul } = E.v;
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const C = E.camera(Object.assign({}, cam, { target: [0, 0, 0], dist: 1 }), 1, 1);
    const pts = [];
    const take = (P) => {
      const J = E.solve(P);
      [add(J.head, [0, 0.13, 0]), J.toeL, J.toeR, J.heelL, J.heelR, J.tipL, J.tipR, J.fistL, J.fistR, J.elbowL, J.elbowR, J.kneeL, J.kneeR, J.shL, J.shR, J.pel].forEach((p) => p && pts.push(p));
    };
    for (let i = 0; i <= 24; i++) {
      const t = t0 + ((t1 - t0) * i) / 24;
      take(pose(t));
      if (partner) take(partner(t));
    }
    // Körperbreite (Gi, Gürtel) quer zur Blickrichtung; oben und unten liegen Kopf- und Fußpunkte schon außen
    const RU = 0.12;
    const RV = 0.04;
    const us = pts.map((p) => dot(p, C.cu));
    const vs = pts.map((p) => dot(p, C.cv));
    const ws = pts.map((p) => dot(p, C.cw));
    const uc = (Math.min(...us) + Math.max(...us)) / 2;
    const vc = (Math.min(...vs) + Math.max(...vs)) / 2;
    const wc = (Math.min(...ws) + Math.max(...ws)) / 2;
    cam.target = add(add(mul(C.cu, uc), mul(C.cv, vc)), mul(C.cw, wc));
    // nötiger Abstand: jeder Punkt (näher an der Kamera erscheint er größer) passt mit Rand ins Bild
    let need = 0;
    pts.forEach((p, i) => {
      const toward = wc - ws[i];
      need = Math.max(need, C.f * (Math.abs(us[i] - uc) + RU) / (FRAME_ASPECT * FRAME_FILL) + toward, C.f * (Math.abs(vs[i] - vc) + RV) / FRAME_FILL + toward);
    });
    cam.dist = Math.max(cam.dist, need);
  }
  function entry(key) {
    if (entries.has(key)) return entries.get(key);
    const { id, mirrored } = split(key);
    const d = D[id];
    const pose = E.timeline(d.keys, d.fix);
    const partner = d.partner ? E.timeline(d.partner) : null;
    const poses = d.keys.map((k) => E.full(k.p)).concat(d.partner ? d.partner.map((k) => E.full(k.p)) : []);
    const xs = poses.map((p) => p.pelvis[0]);
    const zs = poses.map((p) => p.pelvis[2]);
    const ys = d.keys.map((k) => E.full(k.p).pelvis[1]);
    const ay = ys.reduce((a, b) => a + b, 0) / ys.length;
    const spanZ = Math.max(...zs) - Math.min(...zs);
    const spanX = Math.max(...xs) - Math.min(...xs);
    const v = VIEWS[d.view || 'side3'];
    const cam = {
      target: [(Math.max(...xs) + Math.min(...xs)) / 2, Math.max(0.42, 0.1 + 0.82 * ay), (Math.max(...zs) + Math.min(...zs)) / 2 + (partner ? 0 : 0.12)],
      dist: (ay < 0.6 ? 3.1 : 3.95) + 0.8 * Math.max(spanZ, spanX * 0.8) + (d.view === 'side' || d.view === 'front' ? 0.15 : 0),
      // d.cam: Drehung und Neigung fest (wie im Bewegungs-Editor abgelesen); sonst Grundansicht view, d.yaw/d.pitch drehen weiter
      // (yaw positiv = von rechts vorn, pitch = steiler von oben)
      yaw: d.cam ? d.cam.yaw : v.yaw + (d.yaw || 0), pitch: d.cam ? d.cam.pitch : v.pitch + (d.pitch || 0), fov: 30,
    };
    const t0 = d.keys[0].t;
    const t1 = d.keys[d.keys.length - 1].t;
    fitCam(cam, pose, partner, t0, t1);
    const e = { key, d, pose, partner, cam, mirrored, t0, t1 };
    entries.set(key, e);
    return e;
  }

  /* ---------- Zeichnen ---------- */
  // Trefferfläche (hit.fl) als kleine Kugeln: wo sie die Figur schneiden, färbt der Shader rot.
  // Jede Fläche liegt in einem Körperteil-Rahmen [x, y, z]:
  //   hand: x Finger/Faust nach vorn, y zur Handfläche, z zur Daumenseite (wie in figur3d.js)
  //   arm:  x Unterarm (Ellbogen → Handgelenk), fuss: x Zehen, y zur Sohle, z zur Innenseite, bein: x Unterschenkel (Knie → Knöchel)
  // c: feste Lage; mv: Abstand vom Ursprung in Richtung der Bewegung (die Seite, die vorangeht – Abwehr, Ellbogen, Knie).
  const FL = {
    seiken: { part: 'hand', o: 'wrist', c: [0.088, -0.012, 0.012], r: 0.063 },
    // Uraken: Handrücken über den vorderen Knöcheln
    uraken: { part: 'hand', o: 'wrist', c: [0.06, -0.04, 0.006], r: 0.048 },
    tettsui: { part: 'hand', o: 'wrist', c: [0.048, 0.012, -0.04], r: 0.06 },
    // beidseitiger Schlag (Hasami-uchi): die Seite der Faust, die zur anderen Faust zeigt
    innen: { part: 'hand', o: 'wrist', c0: [0.045, 0.01, 0], mv: 0.042, c: 'inside', r: 0.048 },
    shuto: { part: 'hand', o: 'wrist', c: [0.065, 0, -0.03], r: 0.06 },
    haito: { part: 'hand', o: 'wrist', c: [0.06, 0, 0.03], r: 0.06 },
    teisho: { part: 'hand', o: 'wrist', c: [0.022, 0.016, 0], r: 0.054 },
    fingerspitzen: { part: 'hand', o: 'wrist', c: [0.124, 0, 0], r: 0.054 },
    handflaeche: { part: 'hand', o: 'wrist', c: [0.06, 0.016, 0], r: 0.063 },
    handgelenk: { part: 'arm', o: 'wrist', mv: 0.03, c: [0, -1, 0], r: 0.054 },
    unterarm: { part: 'arm', o: 'forearm', mv: 0.095, c: [0, 1, 0], r: 0.11 },
    ellbogen: { part: 'arm', o: 'elbow', mv: 0.075, c: 'tip', r: 0.08 },
    // Koshi (Fußballen): nur die Sohle unter den Zehengrundgelenken, nicht der Fußrücken
    koshi: { part: 'fuss', o: 'ankle', c: [0.115, 0.08, 0], r: 0.06 },
    kakato: { part: 'fuss', o: 'ankle', c: [-0.05, 0.06, 0], r: 0.066 },
    sokuto: { part: 'fuss', o: 'ankle', c: [0.03, 0.055, -0.032], r: 0.069 },
    teisoku: { part: 'fuss', o: 'ankle', c: [0.04, 0.07, 0], r: 0.072 },
    haisoku: { part: 'fuss', o: 'ankle', c: [0.07, 0.015, 0], r: 0.066 },
    hiza: { part: 'bein', o: 'knee', mv: 0.115, c: 'knee', r: 0.11 },
    wade: { part: 'bein', o: 'calf', mv: 0.115, c: [0, -1, 0], r: 0.12 },
  };
  const ortho = (v, x) => E.v.norm(E.v.sub(v, E.v.mul(x, v[0] * x[0] + v[1] * x[1] + v[2] * x[2])));
  const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  // Ursprung und Achsen eines Körperteils
  function frame(J, part, o, s) {
    const { sub, mix, norm } = E.v;
    const O = { wrist: J['wrist' + s], elbow: J['elbow' + s], forearm: mix(J['elbow' + s], J['wrist' + s], 0.8), ankle: J['ankle' + s], knee: J['knee' + s], calf: mix(J['knee' + s], J['ankle' + s], 0.38) }[o];
    let x, z;
    if (part === 'hand') {
      x = J['open' + s] ? J['fd' + s] : norm(sub(J['fist' + s], J['wrist' + s]));
      const wd = J['wd' + s];
      return { o: O, x, y: norm(crs(wd, x)), z: E.v.mul(wd, s === 'R' ? 1 : -1) };
    }
    if (part === 'arm') { x = norm(sub(J['wrist' + s], J['elbow' + s])); z = ortho(J['wd' + s], x); }
    if (part === 'fuss') { x = J['dir' + s]; const y = J['sole' + s]; return { o: O, x, y, z: E.v.mul(norm(crs(y, x)), s === 'L' ? 1 : -1) }; }
    if (part === 'bein') { x = norm(sub(J['ankle' + s], J['knee' + s])); z = ortho(J['dir' + s], x); }
    return { o: O, x, y: crs(z, x), z };
  }
  const toW = (F, c) => E.v.add(E.v.add(E.v.mul(F.x, c[0]), E.v.mul(F.y, c[1])), E.v.mul(F.z, c[2]));
  const toL = (F, v) => [F.x, F.y, F.z].map((a) => a[0] * v[0] + a[1] * v[1] + a[2] * v[2]);
  // Richtung der Bewegungsflächen: einmal im Kernbild bestimmt (Weg in das Kernbild hinein), dann im Körperteil-Rahmen
  // festgehalten – so bleibt der Fleck beim Abspielen an derselben Stelle des Arms oder Beins.
  function spotDirs(e) {
    if (e.spotDirs) return e.spotDirs;
    const h = e.d.hit;
    const d = h && FL[h.fl];
    const out = [];
    if (d) {
      // hit.t: Zeitpunkt der Berührung, wenn er nicht im Kernbild liegt (z. B. Abwehr, die danach weiterzieht)
      const tb = h.t != null ? h.t : e.d.best == null ? 1 : e.d.best;
      const J1 = E.solve(e.pose(tb));
      h.sides.split('').forEach((s) => {
        const F = frame(J1, d.part, d.o, s);
        let c = d.c;
        if (c === 'motion') {
          // Seite der Faust, die in Schlagrichtung vorangeht (Weg der Faust kurz vor dem Treffer)
          let m = null;
          for (let t = tb - 0.005; t >= 0; t -= 0.005) {
            const v = E.v.sub(J1['fist' + s], E.solve(e.pose(t))['fist' + s]);
            if (E.v.len(v) > 0.04) { m = v; break; }
          }
          c = E.v.add(d.c0, E.v.mul(m ? toL(F, E.v.norm(m)) : [1, 0, 0], d.mv));
        } else if (c === 'inside') {
          const o = s === 'L' ? 'R' : 'L';
          c = E.v.add(d.c0, E.v.mul(toL(F, E.v.norm(E.v.sub(J1['fist' + o], J1['fist' + s]))), d.mv));
        } else if (d.mv) {
          let m = null;
          // Ellbogen und Knie: immer die Spitze (Knochen am Gelenk), nicht Ober-/Unterarm bzw. -schenkel in Bewegungsrichtung
          for (let t = tb - 0.01; t >= 0 && c !== 'tip' && c !== 'knee'; t -= 0.01) {
            const v = E.v.sub(F.o, frame(E.solve(e.pose(t)), d.part, d.o, s).o);
            if (E.v.len(v) > 0.05) { m = v; break; }
          }
          // Unterarm, Wade, Handgelenk: nur quer zur Achse; Ellbogen und Knie: auch an der Spitze
          if (m && d.o !== 'elbow' && d.o !== 'knee') m = E.v.sub(m, E.v.mul(F.x, toL(F, m)[0]));
          if (m && E.v.len(m) > 0.01) c = toL(F, E.v.norm(m));
          else if (c === 'tip') c = toL(F, E.v.norm(E.v.add(E.v.norm(E.v.sub(J1['elbow' + s], J1['sh' + s])), E.v.mul(F.x, -1))));
          else if (c === 'knee') c = toL(F, E.v.norm(E.v.sub(J1['knee' + s], E.v.mix(J1['hip' + s], J1['ankle' + s], 0.5))));
          c = E.v.mul(c, d.mv);
        }
        out.push({ s, c });
      });
    }
    e.spotDirs = out;
    return out;
  }
  function spots(e, J) {
    const d = e.d.hit && FL[e.d.hit.fl];
    if (!d) return null;
    return spotDirs(e).map(({ s, c }) => {
      const F = frame(J, d.part, d.o, s);
      return { p: E.v.add(F.o, toW(F, c)), r: d.r, part: (d.part === 'hand' || d.part === 'arm' ? 'arm' : 'leg') + s };
    });
  }
  function paint(ctx, w, h, e, st) {
    const t = st.t;
    const P = e.pose(t);
    const J = E.solve(P);
    const cam = st.cam;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    if (e.mirrored) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    const PP = e.partner ? e.partner(t) : null;
    let C;
    const hs = spots(e, J);
    if (!PP) C = E.draw(ctx, w, h, P, cam, { mode: 0, hit: hs });
    else {
      C = E.draw(ctx, w, h, P, cam, { mode: 1 });
      const figs = [{ P, tint: false, z: P.pelvis }, { P: PP, tint: true, z: PP.pelvis }];
      const camPos = C.ro;
      figs.sort((a, b) => Math.hypot(b.z[0] - camPos[0], b.z[2] - camPos[2]) - Math.hypot(a.z[0] - camPos[0], a.z[2] - camPos[2]));
      figs.forEach((f) => E.draw(ctx, w, h, f.P, cam, { mode: 2, tint: f.tint, hit: f.tint ? null : hs }));
    }
    ctx.restore();
    if (!C) return false;
    overlay(ctx, w, h, e, C, J);
    return true;
  }

  // Einteilung der Übersichtsbilder (Höhen, Trefferzonen)
  function overlay(g, w, h, e, C, J) {
    const pr = (p) => {
      const q = C.project(p);
      return e.mirrored ? [w - q[0], q[1]] : q;
    };
    const s = h / 400;
    const font = (px, wt) => `${wt || 700} ${px * s}px system-ui, "Segoe UI", Roboto, sans-serif`;
    const { add, mul, mix } = E.v;
    g.save();
    // Keine Beschriftungen an den Figuren; nur die beiden Übersichtsbilder (Höhen, Trefferzonen) zeigen ihre Einteilung
    (e.d.marks || []).forEach((m) => {
      if (m === 'levels') {
        // Jodan (Gesicht), Chudan (Brust), Gedan (Unterbauch) nach der Definition im JKA-Kata-Buch
        const yTop = pr(add(J.head, [0, 0.12, 0]))[1];
        const yChin = pr(add(J.head, [0, -0.11, 0]))[1];
        const yBelt = pr(add(J.pel, [0, 0.07, 0]))[1];
        const yLow = pr(add(J.pel, [0, -0.13, 0]))[1];
        const x0 = pr(add(J.pel, [0.36, 0, 0]))[0];
        const x1 = pr(add(J.pel, [-0.36, 0, 0]))[0];
        const [l, r] = [Math.min(x0, x1), Math.max(x0, x1)];
        [[yTop, yChin, 'rgba(239,154,154,.45)', 'Jodan', 'Gesicht'], [yChin, yBelt, 'rgba(255,204,128,.42)', 'Chudan', 'Brust'], [yBelt, yLow, 'rgba(165,214,167,.45)', 'Gedan', 'Unterbauch']].forEach(([a, b, col, t1, t2]) => {
          g.fillStyle = col;
          g.fillRect(l, a, r - l, b - a);
          g.font = font(14, 800);
          g.textAlign = 'start';
          g.fillStyle = '#333';
          g.fillText(t1, r + 8 * s, (a + b) / 2);
          g.font = font(10.5, 500);
          g.fillStyle = '#555';
          g.fillText(t2, r + 8 * s, (a + b) / 2 + 14 * s);
        });
      }
      if (m === 'targets') {
        // Trefferzonen nach dem Anhang des JKA-Kata-Buchs
        const { head, hf, hl, chest, up, fc, lc, pel, fp, lp } = J;
        const pts = [
          [add(add(head, mul(hl, 0.095)), mul(up, 0.02)), 'Kasumi (Schläfe)', 'l'],
          [add(add(head, mul(hf, 0.105)), mul(up, -0.045)), 'Jinchu', 'r'],
          [add(add(head, mul(hf, 0.09)), mul(up, -0.105)), 'Mikazuki (Kinn)', 'l'],
          [add(add(chest, mul(up, -0.16)), mul(fc, 0.13)), 'Suigetsu', 'r'],
          [add(add(add(chest, mul(up, -0.22)), mul(lc, -0.11)), mul(fc, 0.1)), 'Denko', 'r'],
          [add(add(add(pel, mul(up, 0.2)), mul(lp, 0.13)), mul(fp, 0.07)), 'Inazuma', 'l'],
          [add(add(pel, mul(up, 0.0)), mul(fp, 0.13)), 'Myojo', 'r'],
          [add(mix(J.hipL, J.kneeL, 0.5), mul(fp, 0.07)), 'Daitai', 'l'],
          [add(J.kneeR, mul(fp, 0.07)), 'Hiza', 'r'],
        ];
        pts.forEach(([p3, t, side]) => {
          const p = pr(p3);
          const right = side === 'r';
          const tx = right ? w * 0.74 : w * 0.26;
          g.strokeStyle = '#90a4ae';
          g.lineWidth = 1 * s;
          g.beginPath();
          g.moveTo(p[0], p[1]);
          g.lineTo(right ? tx - 4 * s : tx + 4 * s, p[1]);
          g.stroke();
          g.fillStyle = '#d32f2f';
          g.beginPath();
          g.arc(p[0], p[1], 4.5 * s, 0, Math.PI * 2);
          g.fill();
          g.font = font(11, 600);
          g.textAlign = right ? 'start' : 'end';
          g.fillStyle = '#333';
          g.fillText(t, tx, p[1] + 4 * s);
        });
      }
    });
    g.restore();
  }

  /* ---------- Ruhende Kernbilder: Warteschlange, Zwischenspeicher ---------- */
  const stills = new Map();
  const queue = [];
  let busy = false;
  // Während des Scrollens nichts rechnen: jedes Bild belegt den Grafikchip, den der Browser fürs Scrollen braucht.
  // Erst nach kurzer Ruhe weiterarbeiten.
  const CALM = 180;
  let lastScroll = 0;
  let waitTimer = 0;
  window.addEventListener('scroll', () => (lastScroll = performance.now()), { passive: true, capture: true });
  // Reihenfolge: sichtbare Figuren (nach schnellem Scrollen warten sonst längst vorbeigescrollte davor),
  // dann alle anderen angeforderten, zuletzt die im Hintergrund vorgerechneten (prefetch).
  function pick() {
    const vis = queue.findIndex((j) => j.box && onScreen(j.box));
    if (vis >= 0) return vis;
    const asked = queue.findIndex((j) => !j.low);
    return asked < 0 ? 0 : asked;
  }
  const idle = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 200));
  function pump() {
    if (busy || !queue.length || waitTimer) return;
    const wait = lastScroll + CALM - performance.now();
    if (wait > 0) {
      waitTimer = setTimeout(() => { waitTimer = 0; pump(); }, wait);
      return;
    }
    // Nur noch Vorrat: nicht rechnen, solange eine Figur gedreht oder abgespielt wird, sonst in Leerlaufzeit
    const lowOnly = queue.every((j) => j.low);
    if (lowOnly && live) {
      waitTimer = setTimeout(() => { waitTimer = 0; pump(); }, 500);
      return;
    }
    busy = true;
    (lowOnly ? idle : requestAnimationFrame)(() => {
      const job = queue.splice(pick(), 1)[0];
      try {
        const cv = document.createElement('canvas');
        cv.width = job.w;
        cv.height = job.h;
        const e = entry(job.key);
        const okDraw = paint(cv.getContext('2d'), job.w, job.h, e, { t: e.d.best == null ? 1 : e.d.best, cam: e.cam, plain: job.plain });
        if (!okDraw) throw new Error('kein WebGL');
        cv.toBlob((b) => {
          busy = false;
          if (b) job.resolve(URL.createObjectURL(b));
          else job.reject(new Error('toBlob'));
          pump();
        }, 'image/png');
      } catch (err) {
        busy = false;
        job.reject(err);
        pump();
      }
    });
  }
  const onScreen = (n) => {
    const r = n.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
  };
  function still(key, w, h, plain, box, low) {
    const id = `${key}|${w}x${h}|${plain ? 1 : 0}`;
    if (!stills.has(id)) {
      const p = new Promise((resolve, reject) => { queue.push({ key, w, h, plain, box, low, resolve, reject }); pump(); });
      // Fehlschlag nicht merken: beim nächsten Mal neu versuchen
      p.catch(() => stills.delete(id));
      stills.set(id, p);
    } else if (!low) {
      // Schon als Vorrat eingereiht, jetzt aber gebraucht: nach vorn
      const j = queue.find((x) => x.key === key && x.w === w && x.h === h && !!x.plain === !!plain);
      if (j) Object.assign(j, { low: false, box: box || j.box });
    }
    return stills.get(id);
  }
  // Im Hintergrund vorrechnen (z. B. Lexikon nach dem Start): width = Breite der Bühne, in der die Figur erscheinen wird
  function prefetch(key, width) {
    if (!has(key)) return;
    const [w, h] = sizeW(width, 2);
    still(key, w, h, false, null, true).catch(() => {});
  }

  /* ---------- HTML und Einbinden ---------- */
  function html(key, o) {
    start();
    const opt = o || {};
    const e = D[split(key).id];
    const anim = e && !e.still;
    if (!ok()) return `<div class="f3d f3d-off${opt.cls ? ` ${opt.cls}` : ''}" data-f3d="${esc(key)}"><div class="f3d-stage f3d-fallback"></div></div>`;
    const tools = opt.tools === false ? '' : `<div class="f3d-tools">${anim ? '<button type="button" class="gfx-btn" data-act="f3d-play" aria-pressed="false">▶ Bewegung</button>' : ''}<button type="button" class="gfx-btn" data-act="f3d-home" hidden>↺ Kernbild</button></div>`;
    return `<div class="f3d${opt.cls ? ` ${opt.cls}` : ''}" data-f3d="${esc(key)}"${opt.plain ? ' data-plain="1"' : ''}><div class="f3d-stage"><img class="f3d-img" alt="" draggable="false"><span class="f3d-badge" aria-hidden="true">3D ↻ ⤢</span></div>${tools}</div>`;
  }
  const dpr = (cap) => Math.min(window.devicePixelRatio || 1, cap);
  const sizeOf = (stage, cap) => sizeW(stage.clientWidth || 260, cap);
  function sizeW(width, cap) {
    const cw = Math.max(120, Math.round(width / 40) * 40);
    const w = Math.round(cw * dpr(cap));
    return [w, Math.round(w * 0.8)];
  }
  // Großansicht: die Bühne füllt das Fenster, das Bild folgt ihrem Seitenverhältnis
  // budget: höchstens so viele Bildpunkte (beim Abspielen und Drehen, damit jedes Bild schnell fertig ist)
  function sizeBig(stage, cap, budget) {
    let r = dpr(cap);
    const cw = stage.clientWidth || 1;
    const ch = stage.clientHeight || 1;
    if (budget) r = Math.min(r, Math.sqrt(budget / (cw * ch)));
    return [Math.max(120, Math.round(cw * r)), Math.max(120, Math.round(ch * r))];
  }
  // Die Kamera skaliert mit der Bildhöhe (fester senkrechter Blickwinkel). Ist die Bühne höher als 5:4 (Handy hochkant),
  // den Blickwinkel weiten, damit die Figur in die Breite passt. Eine einzelne Figur ist schmaler als das Bild: sie darf
  // größer werden als in der 5:4-Ansicht (Maßstab k × Bildbreite statt 0,8 × Breite); weite Tritte und Partner brauchen Rand.
  // Breite Fenster bleiben bei 30°.
  const FOV = 30;
  function fovFor(w, h, k) {
    const scale = Math.min(h, w * k);
    if (scale >= h) return FOV;
    const f = (1 / Math.tan((FOV * Math.PI) / 360)) * (scale / h);
    return (Math.atan(1 / f) * 360) / Math.PI;
  }
  // Bild ließ sich nicht rechnen: Bildfläche bleibt leer
  function fallback(box) {
    const stage = box.querySelector('.f3d-stage');
    stage.innerHTML = '';
    stage.classList.add('f3d-fallback');
    box.querySelectorAll('.f3d-tools [data-act]').forEach((b) => (b.hidden = true));
  }
  function load(box) {
    const stage = box.querySelector('.f3d-stage');
    const img = stage && stage.querySelector('.f3d-img');
    if (!img) return;
    const [w, h] = sizeOf(stage, 2);
    still(box.dataset.f3d, w, h, box.dataset.plain === '1', box).then((url) => { img.src = url; box.classList.add('f3d-ready'); }).catch(() => fallback(box));
  }
  let io = null;
  function watch(root) {
    if (!ok()) return;
    if (!io) {
      io = new IntersectionObserver((list) => list.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        load(en.target);
      }), { rootMargin: '300px 0px' });
    }
    (root.querySelectorAll ? root.querySelectorAll('.f3d:not([data-h])') : []).forEach((b) => {
      b.setAttribute('data-h', '1');
      io.observe(b);
    });
  }
  function unwatch(n) {
    if (!io || n.nodeType !== 1) return;
    if (n.matches('.f3d[data-h]')) io.unobserve(n);
    n.querySelectorAll('.f3d[data-h]').forEach((b) => io.unobserve(b));
  }

  /* ---------- Lebendige Ansicht: drehen, abspielen ---------- */
  let live = null;
  function stopLive() {
    if (!live) return;
    const { box, cv } = live;
    cv.remove();
    box.classList.remove('f3d-live', 'f3d-paused');
    box.querySelectorAll('[data-act^="f3d-"]').forEach((b) => {
      if (b.dataset.act === 'f3d-home') b.hidden = true;
      else {
        b.setAttribute('aria-pressed', 'false');
        if (b.dataset.act === 'f3d-play') b.textContent = '▶ Bewegung';
      }
    });
    live = null;
  }
  function startLive(box) {
    if (live && live.box === box) return live;
    stopLive();
    const e = entry(box.dataset.f3d);
    const stage = box.querySelector('.f3d-stage');
    const cv = document.createElement('canvas');
    cv.className = 'f3d-canvas';
    stage.appendChild(cv);
    box.classList.add('f3d-live');
    box.querySelector('[data-act="f3d-home"]') && (box.querySelector('[data-act="f3d-home"]').hidden = false);
    live = { box, cv, ctx: cv.getContext('2d'), e, st: { t: e.d.best == null ? 1 : e.d.best, cam: camCopy(e.cam), plain: box.dataset.plain === '1' }, dirty: true };
    loop();
    return live;
  }
  const camCopy = (c) => Object.assign({}, c, { target: c.target.slice() });
  // Knopf und Pausenzeichen dem Abspielzustand anpassen
  function playUi(L) {
    const btn = L.box.querySelector('[data-act="f3d-play"]');
    if (btn) {
      btn.setAttribute('aria-pressed', String(!!L.st.playing));
      btn.textContent = L.st.paused ? '▶ Weiter' : '▶ Bewegung';
    }
    L.box.classList.toggle('f3d-paused', !!L.st.paused);
  }
  // Antippen während der Bewegung: anhalten bzw. weiterlaufen lassen. false: es läuft keine Bewegung
  function togglePause(box) {
    const L = live;
    if (!L || L.box !== box || !(L.st.playing || L.st.paused)) return false;
    L.st.playing = !L.st.playing;
    L.st.paused = !L.st.playing;
    playUi(L);
    kick();
    return true;
  }
  let raf = 0;
  let last = 0;
  function loop() {
    if (raf) return;
    last = performance.now();
    const step = (now) => {
      raf = 0;
      if (!live) return;
      if (!document.contains(live.cv)) { live = null; return; }
      // Echtzeit: auch wenn ein Bild länger dauert (Großansicht), läuft die Bewegung in ihrer Dauer ab – nur mit weniger Bildern
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      const L = live;
      if (L.st.playing) {
        L.st.t += dt / (L.e.d.dur || 1.6);
        // einmal abspielen, dann in der Endstellung stehen bleiben
        if (L.st.t >= L.e.t1) { L.st.t = L.e.t1; L.st.playing = false; playUi(L); }
        L.dirty = true;
      }
      if (L.dirty) {
        L.dirty = false;
        const stage = L.cv.parentElement;
        const big = L.box.classList.contains('f3d-big');
        const [w, h] = big ? (L.st.playing || L.drag ? sizeBig(stage, 1.25, 260000) : sizeBig(stage, 2)) : sizeOf(stage, L.st.playing || L.drag ? 1.75 : 2.5);
        if (big) L.st.cam.fov = fovFor(w, h, L.e.partner ? 0.9 : 1.12);
        if (L.cv.width !== w || L.cv.height !== h) { L.cv.width = w; L.cv.height = h; }
        const st = Object.assign({}, L.st, { t: Math.min(L.st.t, L.e.t1) });
        if (!paint(L.ctx, w, h, L.e, st)) { stopLive(); return; }
      }
      if (L.st.playing || L.dirty) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  function kick() {
    if (!live) return;
    live.dirty = true;
    loop();
  }

  function init() {
    if (!ok()) return;
    watch(document);
    // Neue Figuren einmal je Änderungsschub suchen, entfernte nicht weiter beobachten
    new MutationObserver((ms) => {
      ms.forEach((m) => m.removedNodes.forEach(unwatch));
      if (ms.some((m) => m.addedNodes.length)) watch(document);
    }).observe(document.body, { childList: true, subtree: true });
    // Drehen: waagerecht ziehen dreht, senkrecht scrollt die Seite weiter (Maus: auch neigen)
    let drag = null;
    document.addEventListener('pointerdown', (ev) => {
      const stage = ev.target.closest && ev.target.closest('.f3d-ready .f3d-stage, .f3d-live .f3d-stage');
      if (!stage || stage.closest('.f3d-big')) return;
      const box = stage.closest('.f3d');
      drag = { box, x: ev.clientX, y: ev.clientY, moved: false, mouse: ev.pointerType === 'mouse' };
    });
    document.addEventListener('pointermove', (ev) => {
      if (!drag) return;
      const dx = ev.clientX - drag.x;
      const dy = ev.clientY - drag.y;
      if (!drag.moved && Math.abs(dx) < 6 && !(drag.mouse && Math.abs(dy) > 6)) return;
      if (!drag.moved) {
        drag.moved = true;
        startLive(drag.box);
        live.drag = true;
      }
      if (!live || live.box !== drag.box) return;
      live.st.cam.yaw -= dx * 0.45 * (live.e.mirrored ? -1 : 1);
      if (drag.mouse) live.st.cam.pitch = Math.max(-4, Math.min(86, live.st.cam.pitch + dy * 0.35));
      drag.x = ev.clientX;
      drag.y = ev.clientY;
      kick();
    });
    let tapped = null;
    const end = (ev) => {
      if (drag && live && live.box === drag.box) { live.drag = false; kick(); }
      // Antippen ohne Ziehen öffnet die Großansicht
      tapped = drag && !drag.moved && ev.type === 'pointerup' ? drag.box : null;
      drag = null;
    };
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', end);
    document.addEventListener('click', (ev) => {
      if (tapped && ev.target.closest && ev.target.closest('.f3d-stage') && tapped.contains(ev.target)) {
        const box = tapped;
        tapped = null;
        // während der Bewegung: anhalten/weiter statt Großansicht
        if (!togglePause(box)) openBig(box);
        return;
      }
      tapped = null;
      const btn = ev.target.closest && ev.target.closest('[data-act^="f3d-"]');
      if (!btn) return;
      const box = btn.closest('.f3d');
      if (!box || !box.classList.contains('f3d-ready')) return;
      const act = btn.dataset.act;
      if (act === 'f3d-home') { stopLive(); return; }
      // Bewegungs-Editor (in den Einstellungen eingeschaltet): Großansicht schließen, Editor mit dieser Figur öffnen
      if (act === 'f3d-edit') {
        const title = dlg ? dlg.querySelector('.f3d-dlg-title').textContent : '';
        if (dlg && dlg.open) dlg.close();
        SK.poseEditor.open(box.dataset.f3d, title);
        return;
      }
      const L = startLive(box);
      if (act === 'f3d-reset') L.st.cam = camCopy(L.e.cam);
      if (act === 'f3d-play') {
        // angehalten: weiterlaufen lassen; sonst spielt jedes Antippen die Bewegung einmal von vorn
        if (!L.st.paused) L.st.t = L.e.t0;
        L.st.playing = true;
        L.st.paused = false;
        playUi(L);
      }
      kick();
    });
    window.addEventListener('resize', () => kick());
  }
  /* ---------- Großansicht: Fenster mit großer Figur, Zoomen und Verschieben ---------- */
  let dlg = null;
  const ZMIN = 0.5;
  const ZMAX = 3.5;
  function bigDialog() {
    if (dlg) return dlg;
    dlg = document.createElement('dialog');
    dlg.className = 'f3d-dlg';
    dlg.setAttribute('aria-label', 'Großansicht');
    const coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
    const hint = coarse ? 'Ein Finger: drehen · Zwei Finger: zoomen und verschieben · Doppeltippen: vergrößern'
      : 'Ziehen: drehen · Mausrad: zoomen · Rechte Maustaste oder Umschalt + Ziehen: verschieben · Doppelklick: vergrößern';
    dlg.innerHTML = `<div class="f3d-dlg-head"><b class="f3d-dlg-title"></b><button type="button" class="f3d-dlg-x" aria-label="Schließen">✕</button></div><div class="f3d-dlg-body"></div><p class="f3d-dlg-hint muted small">${esc(hint)}</p>`;
    document.body.appendChild(dlg);
    dlg.querySelector('.f3d-dlg-x').addEventListener('click', () => dlg.close());
    // Tippen neben das Fenster schließt es
    dlg.addEventListener('click', (ev) => {
      const r = dlg.getBoundingClientRect();
      if (ev.target === dlg && (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom)) dlg.close();
    });
    dlg.addEventListener('close', () => {
      if (live && live.box.classList.contains('f3d-big')) stopLive();
      dlg.querySelector('.f3d-dlg-body').innerHTML = '';
      // Zurück-Taste: eigenen Verlaufseintrag wieder entfernen
      if (history.state && history.state.f3dBig) history.back();
    });
    window.addEventListener('popstate', () => { if (dlg.open) dlg.close(); });
    return dlg;
  }
  function titleOf(box) {
    if (box.dataset.plain === '1') return '';
    const fig = box.closest('figure');
    const cap = fig && fig.querySelector('figcaption b');
    if (cap) return cap.textContent;
    const card = box.closest('.k-card, .lex-item, article');
    const h = card && card.querySelector('h3, h4, dt, b');
    return h ? h.textContent : '';
  }
  function openBig(small) {
    const d = bigDialog();
    const key = small.dataset.f3d;
    const plain = small.dataset.plain === '1';
    d.querySelector('.f3d-dlg-title').textContent = titleOf(small) || (plain ? '' : 'Figur');
    const body = d.querySelector('.f3d-dlg-body');
    const e = entry(key);
    const anim = !e.d.still;
    // data-h: die kleine Bildwarteschlange soll diese Figur nicht übernehmen
    body.innerHTML = `<div class="f3d f3d-big f3d-ready" data-f3d="${esc(key)}" data-h="1"${plain ? ' data-plain="1"' : ''}><div class="f3d-stage"></div><div class="f3d-tools">${anim ? '<button type="button" class="gfx-btn" data-act="f3d-play" aria-pressed="false">▶ Bewegung</button>' : ''}<button type="button" class="gfx-btn" data-act="f3d-reset">↺ Zurücksetzen</button>${SK.poseEditor && SK.poseEditor.enabled() ? '<button type="button" class="gfx-btn" data-act="f3d-edit">✎ Bearbeiten</button>' : ''}</div></div>`;
    if (!d.open) {
      d.showModal();
      history.pushState({ f3dBig: 1 }, '', location.href);
    }
    const box = body.firstChild;
    startLive(box);
    bindBig(box.querySelector('.f3d-stage'));
  }
  // Bildschirmpunkt (CSS-Pixel, vom Mittelpunkt aus) → Verschiebung des Blickpunkts in der Bildebene
  function shift(L, stage, dx, dy) {
    const C = E.camera(L.st.cam, 1, 1);
    const k = (2 * L.st.cam.dist) / (C.f * (stage.clientHeight || 1));
    const sx = L.e.mirrored ? -dx : dx;
    const t = L.st.cam.target;
    const b = L.e.cam.target;
    for (let i = 0; i < 3; i++) t[i] += -C.cu[i] * sx * k + C.cv[i] * dy * k;
    // nicht aus dem Bild verlieren
    const off = [t[0] - b[0], t[1] - b[1], t[2] - b[2]];
    const n = Math.hypot(...off);
    if (n > 1.4) for (let i = 0; i < 3; i++) t[i] = b[i] + (off[i] * 1.4) / n;
  }
  // Zoomen um den Punkt (px, py) relativ zur Bildmitte: der Punkt bleibt unter Finger bzw. Maus
  function zoomAt(L, stage, f, px, py) {
    const base = L.e.cam.dist;
    const cur = L.st.cam.dist;
    const next = Math.max(base / ZMAX, Math.min(base / ZMIN, cur / f));
    if (next === cur) return;
    shift(L, stage, -px, -py);
    L.st.cam.dist = next;
    shift(L, stage, px, py);
  }
  function bindBig(stage) {
    const pts = new Map();
    let pinch = null;
    let lastTap = 0;
    let lastType = '';
    const rel = (x, y) => {
      const r = stage.getBoundingClientRect();
      return [x - r.left - r.width / 2, y - r.top - r.height / 2];
    };
    const two = () => {
      const [a, b] = [...pts.values()];
      return { d: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    };
    stage.addEventListener('contextmenu', (ev) => ev.preventDefault());
    stage.addEventListener('pointerdown', (ev) => {
      if (!live || live.box !== stage.parentElement) return;
      stage.setPointerCapture && stage.setPointerCapture(ev.pointerId);
      lastType = ev.pointerType;
      pts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY, x0: ev.clientX, y0: ev.clientY, n: pts.size, pan: ev.button === 2 || ev.button === 1 || ev.shiftKey });
      if (pts.size === 2) pinch = two();
      live.drag = true;
    });
    stage.addEventListener('pointermove', (ev) => {
      const p = pts.get(ev.pointerId);
      if (!p || !live) return;
      const L = live;
      if (pts.size >= 2 && pinch) {
        p.x = ev.clientX;
        p.y = ev.clientY;
        const now = two();
        const [cx, cy] = rel(now.x, now.y);
        if (pinch.d > 10) zoomAt(L, stage, now.d / pinch.d, cx, cy);
        shift(L, stage, now.x - pinch.x, now.y - pinch.y);
        pinch = now;
      } else {
        const dx = ev.clientX - p.x;
        const dy = ev.clientY - p.y;
        p.x = ev.clientX;
        p.y = ev.clientY;
        if (p.pan) shift(L, stage, dx, dy);
        else {
          L.st.cam.yaw -= dx * 0.45 * (L.e.mirrored ? -1 : 1);
          L.st.cam.pitch = Math.max(-4, Math.min(86, L.st.cam.pitch + dy * 0.35));
        }
      }
      kick();
    });
    const up = (ev) => {
      const p = pts.get(ev.pointerId);
      if (!p) return;
      pts.delete(ev.pointerId);
      // Antippen ohne Ziehen (auch mit der Maus) hält die Bewegung an bzw. lässt sie weiterlaufen
      if (ev.type === 'pointerup' && !p.n && !pts.size && Math.hypot(ev.clientX - p.x0, ev.clientY - p.y0) < 10) togglePause(stage.parentElement);
      // Doppeltippen mit dem Finger (die Maus nutzt dblclick)
      if (ev.type === 'pointerup' && ev.pointerType !== 'mouse' && !p.n && !pts.size && Math.hypot(ev.clientX - p.x0, ev.clientY - p.y0) < 10) {
        const now = performance.now();
        if (now - lastTap < 320) {
          lastTap = 0;
          dbl(ev.clientX, ev.clientY);
        } else lastTap = now;
      }
      pinch = pts.size === 2 ? two() : null;
      if (!pts.size && live) {
        live.drag = false;
        kick();
      }
    };
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);
    stage.addEventListener('wheel', (ev) => {
      if (!live) return;
      ev.preventDefault();
      const [cx, cy] = rel(ev.clientX, ev.clientY);
      zoomAt(live, stage, Math.exp(-ev.deltaY * (ev.deltaMode === 1 ? 0.05 : 0.0018)), cx, cy);
      kick();
    }, { passive: false });
    // Doppeltippen: auf die Stelle vergrößern, nochmal: zurück
    const dbl = (x, y) => {
      if (!live) return;
      const L = live;
      if (L.st.cam.dist < L.e.cam.dist * 0.9) L.st.cam = Object.assign(camCopy(L.e.cam), { yaw: L.st.cam.yaw, pitch: L.st.cam.pitch });
      else {
        const [cx, cy] = rel(x, y);
        zoomAt(L, stage, 2.2, cx, cy);
      }
      kick();
    };
    stage.addEventListener('dblclick', (ev) => { if (lastType === 'mouse') dbl(ev.clientX, ev.clientY); });
  }

  // Erst einrichten, wenn die erste Figur gebraucht wird – die WebGL-Prüfung kostet beim Start Zeit.
  let started = false;
  function start() {
    if (started) return;
    started = true;
    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init);
  }

  SK.fig3d = { ok, known, has, html, entry, paint, still, prefetch, openBig, spots }; // spots: Trefferflächen (auch für validate.js)
})();
