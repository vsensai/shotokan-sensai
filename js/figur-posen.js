/* Posen der 3D-Figuren: Schlüsselstellungen je Stand, Technik und Begriff.
   Koordinaten in Metern. Welt: x = linke Körperseite, y = oben, z = vorne.
   Hände in Brustkoordinaten (x links, y oben, z vorne, Ursprung Brustmitte; Schulter bei x ±0,185).
   Jeder Eintrag: keys (Schlüsselbilder mit Zeit 0…1), best (Zeit des Kernbilds),
   view (Blickwinkel des Kernbilds), eff (Körperpunkt für die Bahn),
   hit (Trefferpunkt; fl = Trefferfläche, rot markiert, siehe FLAECHE unten), marks (Zusatzzeichen), partner (zweite Figur). */
(function () {
  'use strict';
  const E = window.Figur3D;
  if (!E) return;
  const V = E.v;

  /* ---------- Werkzeuge ---------- */
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
  function M(...xs) {
    const o = {};
    xs.forEach((x) => {
      if (!x) return;
      for (const k in x) o[k] = isObj(x[k]) && isObj(o[k]) ? M(o[k], x[k]) : isObj(x[k]) ? M(x[k]) : x[k];
    });
    return o;
  }
  const mx = (v) => [-v[0], v[1], v[2]];
  // Seiten tauschen (Hidari ↔ Migi)
  function mirror(p) {
    const f = E.full(p);
    const ft = (F) => M(F, { x: -F.x, yaw: -F.yaw, kp: mx(F.kp), sole: mx(F.sole) });
    return {
      pelvis: mx(f.pelvis), yaw: -f.yaw, chest: -f.chest, lean: f.lean, roll: -f.roll, look: -f.look, nod: f.nod, tilt: -f.tilt,
      L: ft(f.R), R: ft(f.L), hL: mx(f.hR), hR: mx(f.hL), eL: mx(f.eR), eR: mx(f.eL),
      oL: f.oR, oR: f.oL, pL: mx(f.pR), pR: mx(f.pL), fL: mx(f.fR), fR: mx(f.fL), qL: mx(f.qR), qR: mx(f.qL), w: [f.w[1], f.w[0]],
    };
  }
  // Ganze Stellung um die senkrechte Achse durch c drehen (Grad, wie yaw)
  function rotate(p, deg, c) {
    const f = E.full(p);
    const a = (deg * Math.PI) / 180;
    const r = (x, z) => [c[0] + (x - c[0]) * Math.cos(a) + (z - c[1]) * Math.sin(a), c[1] - (x - c[0]) * Math.sin(a) + (z - c[1]) * Math.cos(a)];
    const rv = (v) => { const [x, z] = [v[0] * Math.cos(a) + v[2] * Math.sin(a), -v[0] * Math.sin(a) + v[2] * Math.cos(a)]; return [x, v[1], z]; };
    const ft = (F) => { const [x, z] = r(F.x, F.z); return M(F, { x, z, yaw: F.yaw + deg, kp: rv(F.kp), sole: rv(F.sole) }); };
    const [px, pz] = r(f.pelvis[0], f.pelvis[2]);
    return M(f, { pelvis: [px, f.pelvis[1], pz], yaw: f.yaw + deg, look: f.look + deg, L: ft(f.L), R: ft(f.R) });
  }
  // Verschieben (z. B. Partner gegenüber)
  function move(p, dx, dz) {
    const f = E.full(p);
    return M(f, { pelvis: [f.pelvis[0] + dx, f.pelvis[1], f.pelvis[2] + dz], L: { x: f.L.x + dx, z: f.L.z + dz }, R: { x: f.R.x + dx, z: f.R.z + dz } });
  }

  /* ---------- Hände (rechte Hand; links = mx) ---------- */
  const H = {
    // Hikite: Faust seitlich auf der Hüfte, Unterarm waagerecht, Ellbogen nach hinten (siehe figur3d.js)
    hip: [-0.215, -0.34, -0.01],
    chudan: [0.0, -0.13, 0.53],
    jodan: [0.0, 0.03, 0.52],
    gedan: [-0.37, -0.55, 0.14],
    gedanPrep: [0.12, 0.02, 0.1],
    guardF: [-0.06, -0.1, 0.42],
    guardR: [-0.02, -0.2, 0.18],
    // Yoi: Arme gestreckt, Fäuste knapp vor den Oberschenkeln
    yoi: [-0.17, -0.56, 0.17],
    side: [-0.21, -0.43, 0.02],
  };
  const L = mx;
  // Stoß geradeaus auf die Mittellinie: Hand h in Weltrichtung (x 0 = Körpermitte, z vorne) → Brustkoordinaten der Stellung p
  function aim(p, h) {
    const f = E.full(p);
    const a = ((f.yaw + f.chest) * Math.PI) / 180;
    return [h[0] * Math.cos(a) - h[2] * Math.sin(a), h[1], h[0] * Math.sin(a) + h[2] * Math.cos(a)];
  }
  // Gestreckter Stoß auf die Mittellinie in Höhe y (Brust): Abstand nach vorn so, dass der Arm (0,56 m) ganz durchgestreckt ist
  function punch(p, side, y, x = 0) {
    const f = E.full(p);
    const a = ((f.yaw + f.chest) * Math.PI) / 180;
    const sx = (side === 'L' ? 0.185 : -0.185);
    const dx = x - sx * Math.cos(a), wz = -sx * Math.sin(a), dy = y + 0.035;
    return aim(p, [x, y, wz + Math.sqrt(Math.max(0, 0.556 * 0.556 - dx * dx - dy * dy))]);
  }
  // Stoßhand(e) markieren: Faust dreht sich erst am Ende des Stoßes (Wert 1 = 180°, 0,5 = senkrechte Faust)
  const TWIST = (def, sides, amt = 1) => M(def, { keys: def.keys.map((k) => M(k, { p: M(k.p, ...sides.split('').map((c) => ({ ['s' + c]: amt }))) })) });
  // Ellbogen-Richtungen (Brustkoordinaten)
  const UP_OUT = [-0.45, 0.3, 0.15];
  const DOWN_FWD = [-0.1, -0.6, 0.3];

  /* ---------- Stände (linker Fuß vorne, wo es einen vorderen gibt) ---------- */
  const W = (k) => {
    const st = SK.gfx && SK.gfx.STANCES[k];
    if (!st) return [0.5, 0.5];
    const l = st.feet.find((f) => f[4] === 'L');
    const r = st.feet.find((f) => f[4] === 'R');
    return [l ? l[3] : 0, r ? r[3] : 0];
  };
  const HANDS_HIP = { hL: L(H.hip), hR: H.hip };
  const S = {
    hachiji: { pelvis: [0, 0.946, 0], yaw: 0, L: { x: 0.17, z: 0, yaw: 15 }, R: { x: -0.17, z: 0, yaw: -15 }, hL: L(H.yoi), hR: H.yoi, w: [0.5, 0.5] },
    musubi: { pelvis: [0, 0.95, 0], yaw: 0, L: { x: 0.05, z: 0.01, yaw: 30 }, R: { x: -0.05, z: 0.01, yaw: -30 }, hL: L(H.side), hR: H.side, oL: 1, oR: 1, fL: [0, -1, 0], fR: [0, -1, 0], pL: [-1, 0, 0], pR: [1, 0, 0], w: [0.5, 0.5] },
    heisoku: { pelvis: [0, 0.95, 0], yaw: 0, L: { x: 0.055, z: 0, yaw: 0 }, R: { x: -0.055, z: 0, yaw: 0 }, hL: L(H.side), hR: H.side, oL: 1, oR: 1, fL: [0, -1, 0], fR: [0, -1, 0], pL: [-1, 0, 0], pR: [1, 0, 0], w: [0.5, 0.5] },
    zk: { pelvis: [0, 0.7, 0.1], yaw: -40, L: { x: 0.12, z: 0.62, yaw: 4 }, R: { x: -0.13, z: -0.5, yaw: -32 }, w: [0.7, 0.3] },
    zks: { pelvis: [0, 0.7, 0.13], yaw: 0, L: { x: 0.12, z: 0.62, yaw: 4 }, R: { x: -0.13, z: -0.5, yaw: -32 }, w: [0.7, 0.3] },
    ashizk: { pelvis: [0, 0.78, 0.08], yaw: -25, L: { x: 0.1, z: 0.42, yaw: 4 }, R: { x: -0.11, z: -0.38, yaw: -25 }, w: [0.7, 0.3] },
    kk: { pelvis: [0, 0.74, -0.04], yaw: -65, L: { x: 0.0, z: 0.42, yaw: 0, kp: [0.2, 0.1, 1] }, R: { x: -0.02, z: -0.4, yaw: -90, kp: [-1, 0.1, 0.3] }, w: [0.3, 0.7] },
    kb: { pelvis: [0, 0.68, 0], yaw: 0, L: { x: 0.42, z: 0, yaw: 5, kp: [1, 0, 0.5] }, R: { x: -0.42, z: 0, yaw: -5, kp: [-1, 0, 0.5] }, w: [0.5, 0.5] },
    neko: { pelvis: [0, 0.72, -0.02], yaw: -35, L: { x: 0.04, z: 0.3, y: 0.11, yaw: 0, pitch: -28 }, R: { x: -0.07, z: -0.08, yaw: -30, kp: [-0.4, 0, 1] }, w: [0.1, 0.9] },
    fudo: { pelvis: [0, 0.66, 0.08], yaw: -45, L: { x: 0.12, z: 0.6, yaw: 0 }, R: { x: -0.16, z: -0.45, yaw: -45, kp: [-0.6, 0, 0.6] }, w: [0.5, 0.5] },
    // Hangetsu schulterbreit, Sanchin hüftbreit (Füße nicht auf einer Linie)
    hangetsu: { pelvis: [0, 0.78, 0.03], yaw: 0, L: { x: 0.22, z: 0.36, yaw: -22, kp: [-0.5, 0, 1] }, R: { x: -0.22, z: -0.32, yaw: 22, kp: [0.5, 0, 1] }, w: [0.5, 0.5] },
    sanchin: { pelvis: [0, 0.85, 0.03], yaw: 0, L: { x: 0.17, z: 0.18, yaw: -22, kp: [-0.5, 0, 1] }, R: { x: -0.17, z: -0.12, yaw: 18, kp: [0.5, 0, 1] }, w: [0.5, 0.5] },
    // Renoji- und Teiji-dachi: Beine durchgestreckt, Hüfte hoch zwischen den Füßen
    renoji: { pelvis: [0, 0.935, 0.13], yaw: -30, L: { x: 0.03, z: 0.3, yaw: 0 }, R: { x: -0.04, z: -0.04, yaw: -90 }, w: [0.4, 0.6] },
    teiji: { pelvis: [0, 0.93, 0.124], yaw: -30, L: { x: 0.0, z: 0.32, yaw: 0 }, R: { x: 0.06, z: -0.02, yaw: -90 }, w: [0.5, 0.5] },
    // Kosa-dachi: rechts Standbein; Knie nebeneinander, erst unterhalb des Knies kreuzt das linke Bein hinter der rechten Wade,
    // linker Fuß (Ballen) steht rechts neben dem rechten, schräg dahinter
    kosa: { pelvis: [0.0, 0.64, 0.2], yaw: 10, R: { x: -0.07, z: 0.32, yaw: 0, kp: [0, 0.2, 1] }, L: { x: -0.17, z: 0.14, y: 0.1, yaw: 10, pitch: -35, kp: [0.6, 0.2, 1] }, w: [0.1, 0.9] },
    ashidachi: { pelvis: [0, 0.9, 0], yaw: -20, L: { x: 0.08, z: 0, yaw: 0 }, R: { x: -0.06, z: 0.08, y: 0.44, yaw: -10, pitch: -40, kp: [0, 0.5, 1] }, w: [1, 0] },
    hizakutsu: { pelvis: [0, 0.72, 0.08], yaw: -60, L: { x: 0.14, z: 0.56, yaw: -35 }, R: { x: -0.13, z: -0.46, yaw: -15 }, w: [0.7, 0.3] },
    orishiki: { pelvis: [0, 0.5, -0.02], yaw: 0, L: { x: 0.13, z: 0.36, yaw: 0, kp: [0, 0.3, 1] }, R: { x: -0.12, z: -0.42, y: 0.065, yaw: 180, kp: [0, -1, 0.3] }, w: [0.5, 0.5] },
  };
  // Gedan-barai-Endstellung im Zenkutsu-dachi: Arm gestreckt, die Faust kurz über dem vorderen Knie (etwas außen);
  // dafür dreht die Brust etwas weiter ein und der Oberkörper neigt sich leicht vor, damit der Arm hinreicht
  // Gestreckter Arm mit minimalem Knick: Hand (Brustkoordinaten) auf der Linie von der Schulter so weit hinaus, dass der
  // Arm zu 99 % gestreckt ist; keepY: Höhe der Hand bleibt, nur der waagerechte Abstand ändert sich
  const ARM = 0.56;
  const STRECK = 0.99;
  function stretch(h, side, keepY) {
    const sh = [side === 'L' ? 0.185 : -0.185, -0.035, 0];
    const d = [h[0] - sh[0], h[1] - sh[1], h[2] - sh[2]];
    const want = STRECK * ARM;
    if (keepY) {
      const hz = Math.hypot(d[0], d[2]);
      const rest = want * want - d[1] * d[1];
      if (rest > 0 && hz > 0.01) { const f = Math.sqrt(rest) / hz; return [sh[0] + d[0] * f, h[1], sh[2] + d[2] * f]; }
    }
    const f = want / Math.hypot(...d);
    return [sh[0] + d[0] * f, sh[1] + d[1] * f, sh[2] + d[2] * f];
  }
  function GEDAN_L(p) {
    const q = M(p, { chest: -12, lean: 5 });
    const J = E.solve(E.full(q));
    return M(q, { hL: stretch(chestAt(q, V.add(J.kneeL, [0.09, 0.25, -0.03])), 'L', true) });
  }
  const ZK_G = M(GEDAN_L(S.zk), { hR: H.hip });
  const ZKS_G = M(S.zks, { hL: L(H.gedan), hR: H.hip });
  const ZK_KAMAE = M(S.zk, { hL: aim(S.zk, [0.04, -0.1, 0.42]), hR: H.guardR });
  const MZK_G = mirror(ZK_G);
  const MZK = mirror(S.zk);
  const KB = M(S.kb, HANDS_HIP);
  // Shuto-uke: vordere Hand vor der vorderen Schulter Richtung Gegner, Fingerspitzen etwa auf Schulterhöhe,
  // Handfläche schräg nach vorn-außen, Ellbogen nach unten; hintere Hand offen, Handfläche oben, vor dem Solarplexus
  const SHUTO_END = { oL: 1, oR: 1, hL: [0.43, -0.14, 0.16], pL: [0.98, 0, -0.09], fL: [0.54, 0.8, 0.25], eL: [0.15, -1, 0.35], hR: [0.02, -0.2, 0.2], eR: [-0.7, -0.6, 0.2], pR: [0, 1, 0], fR: [0.6, 0, 0.6] };
  const KK_SHUTO = M(S.kk, SHUTO_END);
  const YOI = S.hachiji;

  /* ---------- Bausteine für Abläufe ---------- */
  // Technik: Ausgangsstellung kurz halten (0,4 s), dann in knapp 0,2 s hart in die Endstellung (Kime)
  const T = (from, to, o) => M({ keys: [{ t: 0, p: from }, { t: 0.25, p: from }, { t: 0.37, p: to, e: 'kime' }], best: 1, dur: 1.6 }, o);
  // Ruhig ausgeführte Technik (weiche Abwehr, Yoi, Abläufe mit Partner): gleichmäßig in gut einer halben Sekunde
  const T_RUHIG = (from, to, o) => M({ keys: [{ t: 0, p: from }, { t: 0.22, p: from }, { t: 0.62, p: to, e: 'kime' }], best: 1, dur: 1.4 }, o);
  // Mehrere Techniken nacheinander: jede schlägt in 0,2 s zu, dazwischen 0,3 s Pause
  const SEQ = (poses, o) => {
    const n = poses.length;
    const dur = 0.4 + 0.5 * (n - 1);
    const keys = [{ t: 0, p: poses[0] }, { t: 0.4 / dur, p: poses[0] }];
    for (let i = 1; i < n; i++) {
      const t0 = (0.4 + 0.5 * (i - 1)) / dur;
      if (i > 1) keys.push({ t: t0, p: poses[i - 1] });
      keys.push({ t: t0 + 0.2 / dur, p: poses[i], e: 'kime' });
    }
    return M({ keys, best: 1, dur }, o);
  };
  // Eine fließende Bewegung über Zwischenstellungen: dort nicht abbremsen, erst am Ende Kime
  // Die Bahn wird nach ihrer echten Länge (Weg des Körperpunkts o.eff) neu getaktet: schnell anlaufen,
  // ohne Stocken durch die Zwischenstellungen, erst am Ende hart abbremsen (Kime)
  const FLOW = (poses, o) => {
    const d = SEQ(poses, o);
    const eff = d.eff || 'fistR';
    const n = poses.length;
    // Mit fester Dauer (o.dur, ruhige Bewegung) wie bisher; sonst 0,4 s halten, dann schnell durch (0,24 s + 0,07 s je Zwischenstellung)
    const ruhig = !!(o && o.dur);
    const dur = ruhig ? o.dur : 0.4 + 0.24 + 0.07 * (n - 2);
    const T0 = ruhig ? 0.15 : 0.4 / dur;
    const T1 = ruhig ? 0.8 : 1;
    const tl = E.timeline([{ t: 0, p: poses[0] }].concat(poses.map((p, i) => ({ t: T0 + ((T1 - T0) * i) / (n - 1), p, e: 'lin' }))));
    const N = 240;
    const ts = [];
    const sl = [0];
    let prev = null;
    for (let i = 0; i <= N; i++) {
      const t = T0 + ((T1 - T0) * i) / N;
      const q = E.solve(tl(t))[eff];
      if (prev) sl.push(sl[sl.length - 1] + Math.hypot(q[0] - prev[0], q[1] - prev[1], q[2] - prev[2]));
      ts.push(t);
      prev = q;
    }
    // Geschwindigkeitsverlauf ∝ u·(1−u)^2,2: weich an, Spitze bei knapp einem Drittel, hartes Abbremsen
    const G = [0];
    for (let i = 1; i <= N; i++) { const u = (i - 0.5) / N; G.push(G[i - 1] + u * Math.pow(1 - u, 2.2)); }
    const S = sl[N];
    const M_ = 32;
    const keys = [{ t: 0, p: poses[0] }, { t: T0, p: poses[0] }];
    let k = 0;
    for (let j = 1; j <= M_; j++) {
      const goal = (G[Math.round((N * j) / M_)] / G[N]) * S;
      while (k < N && sl[k + 1] < goal) k++;
      const f = k < N ? (goal - sl[k]) / ((sl[k + 1] - sl[k]) || 1) : 0;
      const t = k < N ? ts[k] + f * (ts[k + 1] - ts[k]) : T1;
      keys.push({ t: T0 + ((T1 - T0) * j) / M_, p: j === M_ ? poses[n - 1] : tl(t), e: 'lin' });
    }
    d.keys = keys;
    d.dur = dur;
    return d;
  };
  // Fußtritt: ausholen, treffen, zurück
  const K = (base, chamber, ext, o) => M({ keys: [{ t: 0, p: base }, { t: 0.12, p: base }, { t: 0.27, p: chamber }, { t: 0.35, p: ext, e: 'kime' }, { t: 0.47, p: chamber }, { t: 0.65, p: base }], best: 0.35, dur: 2 }, o);
  const STILL = (pose, o) => M({ keys: [{ t: 0, p: pose }], best: 0, still: true }, o);
  const hit = (at, text) => ({ hit: { at, text } });

  /* ---------- Werkzeuge für Tritte ---------- */
  // Grober Körperschwerpunkt (Rumpf, Kopf, Beine, Arme mit üblichen Massenanteilen)
  function cog(J) {
    const m = [[V.mix(J.pel, J.chest, 0.45), 0.43], [J.head, 0.08]];
    ['L', 'R'].forEach((s) => {
      m.push([V.mix(J['hip' + s], J['knee' + s], 0.45), 0.1], [V.mix(J['knee' + s], J['ankle' + s], 0.45), 0.06], [J['ankle' + s], 0.015],
        [V.mix(J['sh' + s], J['elbow' + s], 0.5), 0.028], [V.mix(J['elbow' + s], J['wrist' + s], 0.5), 0.022]);
    });
    let c = [0, 0, 0];
    let w = 0;
    m.forEach(([q, k]) => { c = V.add(c, V.mul(q, k)); w += k; });
    return V.mul(c, 1 / w);
  }
  // Gleichgewicht auf einem Bein: Körper samt Trittbein so verschieben, dass der Schwerpunkt über der Mitte des Standfußes liegt
  // (dz: kleine Abweichung nach vorn/hinten in Weltrichtung, z. B. Hüfte etwas vor)
  function BAL(p, side, dz = 0) {
    let f = E.full(p);
    const o = side === 'L' ? 'R' : 'L';
    for (let i = 0; i < 4; i++) {
      const J = E.solve(f);
      const c = cog(J);
      const ft = V.mix(J['heel' + side], J['toe' + side], 0.45);
      const dx = ft[0] - c[0];
      const dd = ft[2] + dz - c[2];
      f = M(f, { pelvis: [f.pelvis[0] + dx, f.pelvis[1], f.pelvis[2] + dd], [o]: { x: f[o].x + dx, z: f[o].z + dd } });
    }
    return f;
  }
  // Punkt bzw. Richtung in der Welt → Brustkoordinaten der Stellung p (für Hände an einer festen Stelle im Raum)
  function chestAt(p, w, dir) {
    const J = E.solve(E.full(p));
    const q = dir ? w : V.sub(w, J.chest);
    return [J.lc, J.up, J.fc].map((a) => a[0] * q[0] + a[1] * q[1] + a[2] * q[2]);
  }
  // Bein von der Hüfte aus in Weltrichtung dir fast ganz gestreckt (Anteil k der Beinlänge)
  function REACH(p, side, dir, k = 0.96) {
    const f = E.full(p);
    const hp = E.solve(f)['hip' + side];
    const a = V.add(hp, V.mul(V.norm(dir), 0.88 * k));
    return M(f, { [side]: { x: a[0], y: a[1], z: a[2] } });
  }
  // Fuß gestreckt in Richtung des Unterschenkels (Spann durchgedrückt); bend hebt die Fußspitze um so viele Grad an
  function POINT(p, side, bend = 0) {
    const f = E.full(p);
    const J = E.solve(f);
    const sd = V.norm(V.sub(J['ankle' + side], J['knee' + side]));
    const yaw = (Math.atan2(sd[0], sd[2]) * 180) / Math.PI;
    const pitch = (Math.asin(Math.max(-1, Math.min(1, sd[1]))) * 180) / Math.PI + bend;
    return M(f, { [side]: { yaw, pitch } });
  }

  const D = {};

  /* ---------- Stände: Standbild der Endstellung ---------- */
  const STAND_HANDS = {
    musubi: { hL: L(H.yoi), hR: H.yoi, oL: 0, oR: 0 }, heisoku: { hL: L(H.yoi), hR: H.yoi, oL: 0, oR: 0 }, hachiji: {},
    zenkutsu: { hL: GEDAN_L(S.zk).hL, chest: -12, lean: 5, hR: H.hip }, ashizenkutsu: { hL: L(H.guardF), hR: H.guardR }, hizakutsu: { hL: L(H.gedan), hR: H.hip },
    kokutsu: SHUTO_END, kiba: HANDS_HIP, kosa: HANDS_HIP, ashidachi: HANDS_HIP, fudo: { hL: L(H.gedan), hR: H.hip },
    neko: SHUTO_END, sanchin: HANDS_HIP, hangetsu: HANDS_HIP, renoji: { hL: L(H.yoi), hR: H.yoi },
    teiji: { hL: L(H.yoi), hR: H.yoi }, orishiki: { hL: L(H.gedan), hR: H.hip },
  };
  const STAND_BASE = { musubi: 'musubi', heisoku: 'heisoku', hachiji: 'hachiji', zenkutsu: 'zk', ashizenkutsu: 'ashizk', kokutsu: 'kk', kiba: 'kb', kosa: 'kosa', ashidachi: 'ashidachi', hizakutsu: 'hizakutsu', renoji: 'renoji', teiji: 'teiji', fudo: 'fudo', neko: 'neko', sanchin: 'sanchin', hangetsu: 'hangetsu', orishiki: 'orishiki' };
  const FRONT_STANDS = ['musubi', 'heisoku', 'hachiji', 'kiba', 'sanchin', 'hangetsu', 'kosa'];
  Object.keys(STAND_BASE).forEach((k) => {
    const pose = M(S[STAND_BASE[k]], STAND_HANDS[k], { w: W(k) });
    // Stände ohne Bewegung: nur die Endstellung (v1.x: früher aus Yoi heraus animiert – bei Ständen unnötig)
    D[`st:${k}`] = { keys: [{ t: 0, p: pose }], best: 0, still: true, view: FRONT_STANDS.includes(k) ? 'front3' : 'stand', labels: true };
  });
  // Hizakutsu wie in Heian Yondan 11: aus Migi Zenkutsu-dachi nach rechts (Bewegung 10) dreht man sich nach vorn (Shomen)
  // ein – die Füße bleiben am Platz und drehen nur ein (Fußskizze: Zehen links etwa geradeaus, rechts gut 30° nach innen),
  // der Abstand bleibt so lang wie im Zenkutsu-dachi. Linkes Knie gebeugt, rechtes Bein durchgestreckt, Hüfte und Blick
  // nach vorn. Hände: linke Handkante Jodan-uke über der Stirn, rechter Shuto Jodan Soto-mawashi-uchi zum Hals, Handfläche oben
  const HZ = { pelvis: [0.13, 0.72, 0.0], yaw: 0, look: 0, L: { x: 0.53, z: 0.12, yaw: -3, kp: [0.3, 0, 1] }, R: { x: -0.55, z: -0.12, yaw: 35 }, w: [0.6, 0.4],
    oL: 1, oR: 1, hL: [0.12, 0.3, 0.2], eL: [1, 0.2, 0.2], pL: [0, 0.4, 1], fL: [-1, 0.15, 0],
    hR: [-0.02, 0.0, 0.53], eR: [-1, -0.3, 0.1], pR: [0, 1, 0], fR: [0.8, 0, 0.6] };
  D['st:hizakutsu'] = { keys: [{ t: 0, p: HZ }], best: 0, still: true, view: 'front3', labels: true };

  /* ---------- Fauststöße ---------- */
  const ZKS_PUNCH = M(S.zks, { hL: L(H.hip), hR: H.chudan });
  // Kizami-, Sanbon-, Ren-zuki: jede Stoßfaust startet an der Hüfte und trifft mit gestrecktem Arm geradeaus die Mittellinie
  const JO = H.jodan[1], CH = H.chudan[1];
  const ZK_HIP = M(S.zk, HANDS_HIP);
  D['mv:gyaku-zuki'] = T(ZK_G, ZKS_PUNCH, M(hit('fistR', 'Faust'), { eff: 'fistR', view: 'front3' }));
  const OI_MID = { pelvis: [0, 0.71, 0.6], yaw: -18, L: { x: 0.12, z: 0.62, yaw: 10 }, R: { x: -0.01, z: 0.58, y: 0.11, yaw: 0 }, hL: L(H.gedan), hR: H.hip, w: [1, 0] };
  const OI_END = { pelvis: [0, 0.7, 1.22], yaw: 0, L: { x: 0.12, z: 0.62, yaw: 32 }, R: { x: -0.13, z: 1.74, yaw: 4 }, hL: L(H.hip), hR: H.chudan, w: [0.3, 0.7] };
  D['mv:oi-zuki'] = M({ keys: [{ t: 0, p: ZK_G }, { t: 0.15, p: ZK_G }, { t: 0.38, p: OI_MID, e: 'in' }, { t: 0.5, p: OI_END, e: 'kime' }], best: 1, dur: 2, eff: 'ankleR', view: 'side3' }, hit('fistR', 'Faust'));
  D['tc:choku-zuki'] = T(M(YOI, { hL: L(H.chudan), hR: H.hip }), M(YOI, { hL: L(H.hip), hR: H.chudan }), M(hit('fistR', 'Faust'), { eff: 'fistR', view: 'front3' }));
  // Kizami-zuki aus dem Chudan-kamae (linker Arm gebeugt vorn): der vordere Fuß gleitet etwas vor, die Hüfte dreht weiter
  // seitlich ein (vordere Schulter zum Gegner) und der linke Arm stößt weit gestreckt Jodan; die rechte Hand bleibt in der Deckung
  const KZ0 = M(S.zk, { pelvis: [0, 0.76, 0.06], L: { z: 0.5 }, R: { z: -0.42 }, hL: [0.1, -0.12, 0.42], hR: [-0.02, -0.22, 0.2] });
  const KZ1B = M(S.zk, { pelvis: [0, 0.71, 0.24], yaw: -62, lean: 4, L: { z: 0.72, yaw: 0 }, R: { z: -0.38, yaw: -60 }, w: [0.6, 0.4] });
  const KZ1 = M(KZ1B, { hL: punch(KZ1B, 'L', JO), hR: [-0.02, -0.22, 0.2] });
  D['tc:kizami-zuki'] = T(KZ0, KZ1, M(hit('fistL', 'Faust'), { eff: 'fistL', view: 'side3' }));
  D['tc:tate-zuki'] = T(ZK_G, M(ZKS_PUNCH), M(hit('fistR', 'Faust senkrecht'), { eff: 'fistR', view: 'side3' }));
  D['tc:sanbon-zuki'] = SEQ([mirror(ZK_HIP), M(MZK, { hL: L(H.hip), hR: punch(MZK, 'R', JO) }), M(mirror(S.zks), { hL: punch(mirror(S.zks), 'L', CH), hR: H.hip }), M(MZK, { hL: L(H.hip), hR: punch(MZK, 'R', CH) })], M(hit('fistR', 'Faust'), { eff: 'fistR', view: 'side3' }));
  D['tc:ren-zuki'] = SEQ([ZK_HIP, M(S.zk, { hL: punch(S.zk, 'L', JO), hR: H.hip }), M(S.zks, { hL: L(H.hip), hR: punch(S.zks, 'R', CH) })], M(hit('fistR', 'Faust'), { eff: 'fistR', view: 'side3' }));
  D['tc:morote-zuki'] = T(M(S.zks, HANDS_HIP), M(S.zks, { hL: punch(S.zks, 'L', -0.13, 0.07), hR: punch(S.zks, 'R', -0.13, -0.07) }), M(hit('fistR', 'Fäuste'), { eff: 'fistR', view: 'side3' }));
  D['tc:kagi-zuki'] = T(KB, M(KB, { hR: [0.07, -0.2, 0.3], eR: [-0.7, -0.25, 0.3], look: 90 }), M(hit('fistR', 'Faust'), { eff: 'fistR', view: 'front', yaw: 25 }));
  // Ura-zuki: Faust steigt aus der Hüfte schräg (etwa 45°) nach oben vorn, Faustrücken bleibt unten (keine Drehung)
  D['tc:ura-zuki'] = T(ZK_G, M(S.zks, { hL: L(H.hip), hR: [-0.03, -0.14, 0.42], eR: [-0.1, -1, 0.3], pR: [0, 1, 0] }), M(hit('fistR', 'Handrücken unten'), { eff: 'fistR', view: 'side3' }));
  D['tc:age-zuki'] = FLOW([ZK_G, M(S.zks, { hL: L(H.hip), hR: [-0.06, -0.3, 0.35] }), M(S.zks, { hL: L(H.hip), hR: [0.0, 0.22, 0.62] })], M(hit('fistR', 'Faust'), { eff: 'fistR', view: 'side3' }));
  // Yama-zuki: Oberkörper gerade zum Gegner (chest gleicht die Hüftdrehung des Standes aus), Fäuste senkrecht übereinander, obere auf Kopfhöhe, untere vor dem Bauch (Faustrücken unten), beide Arme leicht gebeugt, Oberkörper vorgeneigt
  D['tc:yama-zuki'] = T(M(S.zk, HANDS_HIP, { hL: [0.28, -0.42, 0.05], hR: [-0.18, -0.4, -0.05] }), M(S.zk, { chest: 40, lean: 38, hR: [0.0, 0.39, 0.17], eR: [-0.3, 0.6, -0.6], hL: [0.02, -0.01, 0.46], eL: [0.3, -0.6, -0.7], pL: [0, 1, 0] }), M(hit('fistR', 'Jodan'), { eff: 'fistR', view: 'side3' }));
  // Awase-zuki: beide Fäuste übereinander auf der Mittellinie – rechts Jodan, Arm ganz gestreckt, Handrücken oben;
  // links darunter knapp über dem Gürtel als Ura-zuki, genau umgekehrt mit Handrücken unten
  D['tc:awase-zuki'] = T(M(S.zks, HANDS_HIP), M(S.zks, { hR: punch(S.zks, 'R', 0.06), pR: [0, -1, 0], hL: [0.0, -0.24, 0.47], pL: [0, 1, 0] }), M(hit('fistR', 'Jodan'), { eff: 'fistR', view: 'side3' }));
  D['tc:otoshi-zuki'] = T(M(S.zks, { hL: L(H.hip), hR: [-0.25, 0.35, 0.15] }), M(S.zks, { lean: 8, hL: L(H.hip), hR: [-0.05, -0.42, 0.45] }), M(hit('fistR', 'Faust'), { eff: 'fistR', view: 'side3' }));
  D['tc:mawashi-zuki'] = FLOW([ZK_G, M(S.zks, { hL: L(H.hip), hR: [-0.45, -0.1, 0.22], eR: [-1, 0, 0] }), M(S.zks, { chest: 15, hL: L(H.hip), hR: [0.06, 0.0, 0.4], eR: [-0.8, 0.1, 0.2] })], M(hit('fistR', 'Faust'), { eff: 'fistR', view: 'front3' }));
  // Drehung der Faust beim geraden Stoß (Faustrücken unten an der Hüfte → oben im Ziel)
  [['mv:gyaku-zuki', 'R'], ['mv:oi-zuki', 'R'], ['tc:choku-zuki', 'LR'], ['tc:kizami-zuki', 'L'], ['tc:sanbon-zuki', 'LR'], ['tc:ren-zuki', 'LR'], ['tc:morote-zuki', 'LR'], ['tc:awase-zuki', 'R']].forEach(([id, s]) => (D[id] = TWIST(D[id], s)));
  D['tc:tate-zuki'] = TWIST(D['tc:tate-zuki'], 'R', 0.5);
  // Nukite wie in Heian Nidan (Kiai): Arm ganz gestreckt, die andere offene Hand liegt flach unter dem Ellbogen (Osae-uke)
  D['tc:nukite'] = T(ZK_G, M(S.zks, { hR: [0.0, -0.13, 0.62], oR: 1, pR: [1, 0, 0], hL: [-0.07, -0.19, 0.27], oL: 1, pL: [0, -1, 0], fL: [-1, 0, 0.1] }), M(hit('tipR', 'Fingerspitzen'), { eff: 'tipR', view: 'side3' }));

  /* ---------- Schläge ---------- */
  // Uraken (Yoko-mawashi-uchi): Faust vor der linken Brust, der Ellbogen führt zur Seite, dann schnappt der Unterarm
  // aus – Treffer genau zur Seite auf Schulterhöhe mit gestrecktem Arm. Die Faust bleibt gerade in Unterarmrichtung und
  // steht senkrecht (Daumen oben), die Handfläche zeigt am Ende nach vorn, der Handrücken nach hinten; schneller Schnapper
  D['tc:uraken-uchi'] = FLOW([
    M(KB, { look: -90, hR: [0.16, -0.06, 0.2], eR: [-0.6, -0.2, 0.8], pR: [0.3, 0, -1] }),
    M(KB, { look: -90, hR: [-0.14, 0.0, 0.22], eR: [-1, 0.2, 0.1], pR: [0.5, 0, -0.87] }),
    M(KB, { look: -90, hR: [-0.5, 0.0, 0.18], eR: [-1, 0.25, -0.2], pR: [0.8, 0, 0.5] }),
    M(KB, { look: -90, hR: [-0.74, -0.01, 0.06], eR: [-0.2, 0.5, -0.6], pR: [0, 0, 1] }),
  ], M(hit('fistR', 'Faustrücken'), { eff: 'fistR', view: 'front' }));
  // Tettsui (Kentsui Tate-mawashi-uchi) direkt aus dem Migi Chudan-kamae (rechter Arm gebeugt vorn): die Faust steigt
  // vor dem Körper im senkrechten Kreis hoch über den Kopf und schlägt von oben nach vorn, Arm leicht gebeugt; etwas ruhiger.
  // Die linke Faust bleibt die ganze Zeit an der Hüfte
  D['tc:tettsui-uchi'] = FLOW([
    M(MZK, { hR: [-0.1, -0.12, 0.42], hL: L(H.hip) }),
    M(MZK, { hL: L(H.hip), hR: [-0.1, 0.2, 0.32], pR: [1, 0, 0] }),
    M(MZK, { chest: -12, hL: L(H.hip), hR: [-0.2, 0.42, 0.02], eR: [-0.6, 0.3, -0.3], pR: [1, 0, 0] }),
    M(MZK, { chest: -25, hL: L(H.hip), hR: [-0.03, 0.0, 0.5], pR: [1, 0, 0] }),
  ], M(hit('fistR', 'Hammerfaust'), { eff: 'fistR', view: 'side3', dur: 1.3 }));
  D['tc:shuto-uchi'] = T(M(S.zk, { hL: L(H.guardF), hR: [-0.28, 0.2, -0.05], oR: 1, pR: [0, -1, 0] }), M(S.zks, { hL: L(H.hip), hR: [0.02, 0.04, 0.48], oR: 1, pR: [0, 1, 0] }), M(hit('tipR', 'Handkante'), { eff: 'wristR', view: 'front3' }));
  // Haito-uchi: beim Ausholen ist der linke Arm nach vorn gestreckt und zieht beim Schlag an die Hüfte
  D['tc:haito-uchi'] = T(M(S.zk, { hL: punch(S.zk, 'L', -0.1), hR: [-0.45, -0.35, 0.05], oR: 1, pR: [0, -1, 0] }), M(S.zks, { hL: L(H.hip), hR: [0.05, 0.03, 0.46], oR: 1, pR: [0, -1, 0] }), M(hit('wristR', 'Daumenseite'), { eff: 'wristR', view: 'front3' }));
  // Teisho-uchi wie ein Mawashi-zuki mit kleinerem Bogen: aus Hidari Zenkutsu-dachi kommt die offene rechte Hand seitlich
  // von außen und schlägt im flachen Bogen nach vorn zur Mitte; Finger oben, der Handballen zeigt in Schlagrichtung
  const TS_HAND = { oR: 1, fR: [0, 1, 0] };
  D['tc:teisho-uchi'] = FLOW([
    ZK_G,
    M(S.zks, { hL: L(H.hip), hR: [-0.32, -0.08, 0.3], eR: [-1, 0, 0.1], pR: [1, 0, 0.3], ...TS_HAND }),
    M(S.zks, { chest: 12, hL: L(H.hip), hR: [0.04, -0.02, 0.44], eR: [-0.8, 0.1, 0.2], pR: [1, 0, 0.6], ...TS_HAND }),
  ], M(hit('wristR', 'Handballen'), { eff: 'wristR', view: 'front3' }));
  // Mae-enpi: gerade Linie nach vorn, der Ellbogen streift dicht an den Rippen entlang nach vorn und etwas hoch; die Faust
  // gleitet dabei über den Bauch zur anderen Seite und endet dicht vor der linken Brust. Kaum Drehung im Oberkörper,
  // der Ellbogen bleibt unter Schulterhöhe (Unterschied zu Mawashi-enpi: kein Ausholen zur Seite, kein Bogen)
  const MAE_ENPI = M(S.zks, { chest: 5, hL: L(H.hip), hR: [0.1, -0.17, 0.1], eR: [-0.15, -0.1, 1] });
  D['tc:enpi-uchi'] = FLOW([
    ZK_G,
    M(S.zks, { hL: L(H.hip), hR: [-0.1, -0.24, 0.16], eR: [-0.1, -1, 0.15] }),
    MAE_ENPI,
  ], M(hit('elbowR', 'Ellbogen'), { eff: 'elbowR', view: 'front3' }));
  // Furi-enpi wie in der Kata (Heian Sandan): aus Hidari Zenkutsu-dachi trägt das linke Bein, das rechte Knie kommt hoch,
  // der Körper dreht sich nach links und der rechte Fuß stampft nach vorn in Kiba-dachi (rechte Seite vorn, Blick nach vorn).
  // Die rechte Faust bleibt an der Hüfte; mit dem Aufsetzen schwingt der Ellbogen im Bogen von hinten seitlich nach außen
  const FE = (p) => move(rotate(p, 90, [0, 0]), 0.12, 1.04);
  const FE_KB = M(KB, { look: -90 });
  const FE_UP = BAL(M({ pelvis: [0.06, 0.86, 0.62], yaw: 45, look: 0, L: { x: 0.12, z: 0.62, yaw: 35, kp: [0.4, 0, 1] },
    R: { x: 0.0, z: 0.78, y: 0.42, yaw: 70, pitch: -25, kp: [-0.2, 0.6, 1] }, hL: L(H.hip), hR: H.hip, w: [1, 0] }), 'L');
  // Durchgehend fließend (kein Abbremsen beim Aufsetzen); der Ellbogen dreht im Schwung etwas zu weit ein und schnappt
  // dann kurz in die Endstellung zurück
  D['tc:furi-enpi'] = M({ keys: [
    { t: 0, p: ZK_G }, { t: 0.12, p: ZK_G },
    { t: 0.42, p: FE_UP, e: 'in' },
    { t: 0.54, p: FE(M(FE_KB, { R: { y: 0.06 }, hR: [-0.21, -0.33, 0.03], eR: [-0.6, -0.8, -0.3], w: [0.6, 0.4] })), e: 'lin' },
    { t: 0.61, p: FE(M(FE_KB, { hR: [-0.14, -0.25, 0.17], eR: [-0.7, 0.1, 0.75], w: [0.5, 0.5] })), e: 'out' },
    { t: 0.68, p: FE(M(FE_KB, { hR: [-0.2, -0.3, 0.08], eR: [-1, -0.15, 0.2], w: [0.5, 0.5] })), e: 'kime' },
  ], best: 1, dur: 2 }, M(hit('elbowR', 'Ellbogen'), { eff: 'elbowR', view: 'side3', yaw: 130 }));
  // Yoko-enpi: Unterarm waagerecht vor der Brust (Faust vor der linken Seite, Ellbogen vorn), der linke Arm holt gestreckt
  // unter dem rechten zur rechten Seite aus; dann stößt der Ellbogen zur Seite, die linke Faust zieht als Gegenbewegung an die Hüfte
  // Ausholen ruhig halten, dann kurzer, harter Schlag (Hüfte senkt sich mit ins Kime)
  const YE0 = M(KB, { pelvis: [0, 0.7, 0], look: -90, hR: [0.24, -0.08, 0.34], eR: [-0.4, 0, 1], hL: [-0.4, -0.24, 0.22], eL: [-0.1, -1, 0.3] });
  const YE1 = M(KB, { pelvis: [0, 0.69, 0], look: -90, hR: [0.08, -0.07, 0.26], eR: [-1, 0, 0.6], hL: [0.02, -0.26, 0.24] });
  const YE2 = M(KB, { look: -90, hR: [-0.06, -0.06, 0.13], eR: [-1, 0, 0], hL: L(H.hip) });
  D['tc:yoko-enpi'] = M({ keys: [
    { t: 0, p: YE0 }, { t: 0.32, p: YE0 }, { t: 0.37, p: YE1, e: 'in' }, { t: 0.43, p: YE2, e: 'kime' },
  ], best: 1, dur: 1.6 }, M(hit('elbowR', 'Ellbogen'), { eff: 'elbowR', view: 'front' }));
  // Mawashi-enpi: großer waagerechter Bogen ohne Kontakt zum Körper. Aus der Hüfte hebt sich der gebeugte Arm weit zur
  // Seite, Ellbogen auf Schulterhöhe, der Oberkörper dreht dabei nach rechts auf; dann schwingt der Ellbogen mit kräftiger
  // Hüftdrehung im Bogen nach vorn zur Mitte, der Unterarm liegt am Ende waagerecht auf Schulterhöhe vor der Brust
  D['tc:mawashi-enpi'] = FLOW([
    ZK_G,
    M(S.zks, { chest: -25, hL: L(H.hip), hR: [-0.44, -0.04, 0.2], eR: [-1, 0, -0.3] }),
    M(S.zks, { chest: 30, hL: L(H.hip), hR: [0.14, -0.03, 0.17], eR: [-0.3, 0, 1] }),
  ], M(hit('elbowR', 'Ellbogen'), { eff: 'elbowR', view: 'front3' }));
  // Age-enpi: aus der Hüfte kommt der Ellbogen nach vorn (zeigt geradeaus, Faust vor der rechten Brust), dann steigt er
  // aus dieser Stellung gerade nach oben – kein Ausschwenken zur Seite, der Arm bleibt weit innen vor dem Körper – und
  // schlägt hoch über Kopfhöhe, Faust vor dem Kopf
  D['tc:age-enpi'] = FLOW([
    M(S.zks, { hL: L(H.hip), hR: H.hip, eR: [-0.3, -0.5, -1] }),
    M(S.zks, { hL: L(H.hip), hR: [-0.07, -0.14, 0.28], eR: [0.15, -1, 0.4], pR: [1, 0, 0] }),
    M(S.zks, { hL: L(H.hip), hR: [-0.05, 0.04, 0.24], eR: [0.25, -0.3, 1], pR: [1, 0, 0] }),
    M(S.zks, { hL: L(H.hip), hR: [0.0, 0.3, -0.03], eR: [0.4, 1, 0.6], pR: [1, 0, 0] }),
  ], M(hit('elbowR', 'Ellbogen'), { eff: 'fistR', view: 'front3' }));
  D['tc:otoshi-enpi'] = T(M(KB, { hR: [-0.15, 0.5, 0.1] }), M(KB, { hR: [-0.12, 0.02, 0.14], eR: [0, -1, 0.35] }), M(hit('elbowR', 'Ellbogen'), { eff: 'elbowR', view: 'front' }));
  // Ushiro-enpi: rechts nach vorn ausholen, die linke offene Hand legt sich auf die rechte Faust; dann schwingt der
  // rechte Ellbogen kraftvoll nach hinten, die linke Hand bleibt an der Faust und drückt den Arm mit nach hinten.
  // Der Kopf dreht über die rechte Schulter nach hinten zum Ziel
  const UE_OPEN = { oL: 1, pL: [0, 0, -1], fL: [-1, 0.2, 0] };
  const UE0 = M(S.zks, { hL: L(H.hip), hR: H.hip });
  const UE1 = M(S.zks, { hL: [0.01, -0.09, 0.56], hR: [0.0, -0.13, 0.52], ...UE_OPEN, eR: [-0.2, -0.8, 0.2] });
  const UE2 = M(S.zks, { look: -90, hL: [-0.05, -0.17, 0.36], hR: [-0.08, -0.2, 0.28], ...UE_OPEN, eR: [-0.7, -0.6, -0.3] });
  const UE3 = M(S.zks, { look: -140, hL: [-0.1, -0.2, 0.15], hR: [-0.16, -0.22, 0.06], ...UE_OPEN, eR: [-0.3, -0.2, -1] });
  D['tc:ushiro-enpi'] = M({ keys: [
    { t: 0, p: UE0 }, { t: 0.1, p: UE0 }, { t: 0.36, p: UE1 }, { t: 0.46, p: UE1 },
    { t: 0.55, p: UE2, e: 'in' }, { t: 0.64, p: UE3, e: 'kime' },
  ], best: 1, dur: 1.9 }, M(hit('elbowR', 'Ellbogen'), { eff: 'elbowR', view: 'side' }));
  // Hasami-uchi wie in Bassai Dai 23: beide Fäuste holen hoch über dem Kopf aus, schwingen seitlich in großen Bögen herab
  // und treffen von beiden Seiten – im Ziel sind die Arme gestreckt, die Fäuste um 45° nach außen gekippt
  // (Daumenseite schräg nach außen oben, Handflächen schräg nach innen oben)
  D['tc:hasami-uchi'] = FLOW([
    M(S.zks, { hL: [0.3, 0.5, 0.0], hR: [-0.3, 0.5, 0.0] }),
    M(S.zks, { hL: [0.62, 0.05, 0.12], hR: [-0.62, 0.05, 0.12] }),
    M(S.zks, { hL: [0.17, -0.2, 0.6], hR: [-0.17, -0.2, 0.6], pL: [-1, 1, 0], pR: [1, 1, 0] }),
  ], M(hit('fistR', 'Hammerfäuste'), { eff: 'fistR', view: 'front3' }));

  /* ---------- Abwehr ---------- */
  // Age-uke: die abwehrende Faust steigt vor der Brust auf (innen), die andere zieht außen vorbei zur Hüfte
  const AU_PREP = M(MZK, { hR: H.hip, hL: [0.06, 0.28, 0.22], eL: L(UP_OUT) });
  const AU_MID = M(MZK, { hR: [-0.06, -0.04, 0.3], eR: [-0.4, -0.6, 0.4], hL: [0.12, 0.04, 0.4], eL: [0.5, -0.6, 0.3] });
  D['mv:age-uke'] = M({ keys: [{ t: 0, p: AU_PREP }, { t: 0.25, p: AU_PREP }, { t: 0.31, p: AU_MID, e: 'in' }, { t: 0.37, p: M(MZK, { hL: L(H.hip), hR: [0.06, 0.28, 0.22], eR: UP_OUT }), e: 'kime' }], best: 1, dur: 1.6, eff: 'fistR', view: 'front3' }, hit('elbowR', 'Unterarm'));
  // Gedan-barai: Faust holt an der Gegenschulter (Ohrhöhe) aus, Ellbogen vor dem Körper; die Bahn führt deutlich vor dem
  // Bauch schräg nach unten, damit Arm und Faust nicht in den Oberkörper tauchen
  const GB_PREP = M(S.zk, { hL: [-0.13, 0.1, 0.24], eL: [0.1, -0.5, 0.8], hR: H.chudan });
  const GB_MID = M(S.zk, { hL: [0.08, -0.26, 0.38], hR: [-0.12, -0.28, 0.22] });
  D['mv:gedan-barai'] = M({ keys: [{ t: 0, p: GB_PREP }, { t: 0.25, p: GB_PREP }, { t: 0.31, p: GB_MID, e: 'in' }, { t: 0.37, p: ZK_G, e: 'kime' }], best: 1, dur: 1.6, eff: 'fistL', view: 'front3' }, hit('fistL', 'Unterarm'));
  D['mv:soto-uke'] = T(M(MZK, { hL: L(H.chudan), hR: [-0.45, 0.06, -0.06] }), M(MZK, { hL: L(H.hip), hR: [-0.03, 0.0, 0.32], eR: DOWN_FWD }), M(hit('elbowR', 'Unterarm innen'), { eff: 'fistR', view: 'front3' }));
  D['mv:uchi-uke'] = T(M(MZK, { hL: L(H.chudan), hR: [0.12, -0.2, 0.25], eR: [-0.5, -0.6, 0.5] }), M(MZK, { hL: L(H.hip), hR: [-0.3, 0.0, 0.3], eR: DOWN_FWD }), M(hit('elbowR', 'Unterarm außen'), { eff: 'fistR', view: 'front3' }));
  // Shuto-uke: Blockhand holt am gegenüberliegenden Ohr aus, die andere Hand ist nach vorn gestreckt –
  // die Oberarme liegen dabei vor der Brust fast übereinander
  D['tc:shuto-uke'] = T(M(S.kk, { oL: 1, oR: 1, hL: [-0.13, 0.2, 0.1], eL: [-0.1, -0.2, 1], pL: [-1, 0, 0], hR: [0.12, -0.12, 0.48], eR: [-0.2, -0.6, 0.4], pR: [0, -1, 0] }), KK_SHUTO, M(hit('tipL', 'Handkante'), { eff: 'wristL', view: 'front3' }));
  // Morote-uke: der vordere (linke) Arm blockt wie Uchi-uke zur linken Seite, die rechte Faust stützt am Ellbogen
  D['tc:morote-uke'] = T(M(S.kk, { hR: H.hip, hL: [-0.12, -0.2, 0.25], eL: [0.5, -0.6, 0.5] }), M(S.kk, { hL: [0.4, 0.0, 0.26], eL: L(DOWN_FWD), hR: [0.19, -0.21, 0.26], eR: [-0.4, -1, 0.2] }), M(hit('fistR', 'Stütze am Ellbogen'), { eff: 'fistL', view: 'front3' }));
  D['tc:juji-uke'] = T(M(S.zks, HANDS_HIP), M(S.zks, { oL: 1, oR: 1, hL: [-0.025, 0.3, 0.29], hR: [0.025, 0.3, 0.33], eL: [1, -0.6, 0.3], eR: [-1, -0.6, 0.3], pL: [0, 0, 1], pR: [0, 0, 1], fL: [-0.45, 1, 0.2], fR: [0.45, 1, 0.2] }), M(hit('wristR', 'Handgelenke gekreuzt'), { eff: 'wristR', view: 'front3' }));
  // Kakiwake-uke im Zenkutsu-dachi, Hüfte frontal nach vorn, langsam ausgeführt: Handgelenke dicht vor der Brust gekreuzt, dann auseinander und dabei etwas vom Körper weg nach vorn
  D['tc:kakiwake-uke'] = T_RUHIG(M(S.zks, { hL: [-0.07, -0.14, 0.17], hR: [0.07, -0.12, 0.2], eL: [0.6, -1, 0.2], eR: [-0.6, -1, 0.2] }), M(S.zks, { hL: [0.25, 0.02, 0.4], hR: [-0.25, 0.02, 0.4], eL: L(DOWN_FWD), eR: DOWN_FWD }), M(hit('fistR', 'auseinander'), { eff: 'fistR', view: 'front3', dur: 2.6 }));
  // langsame, gleichmäßige Bewegung statt schnellem Kime
  D['tc:kakiwake-uke'].keys[2].e = 'io';
  // Hangetsu 9–10 und 41 (Karate-Do Kata Vol. 2), alle langsam und kraftvoll im Hidari Ashi-mae Hangetsu-dachi bzw. Neko-ashi-dachi.
  // Kaisho Yama-gamae: offene Hände kreuzen vor dem Gesicht (Handrücken zueinander) und ziehen auseinander –
  // die Unterarme stehen senkrecht neben dem Gesicht, Ellbogen auf Schulterhöhe, Handrücken nach außen
  const HG = M(S.hangetsu, HANDS_HIP);
  const OPEN2 = { oL: 1, oR: 1 };
  const YG0 = M(S.hangetsu, OPEN2, { hL: [-0.04, 0.16, 0.3], hR: [0.04, 0.16, 0.32], pL: [-1, 0, 0], pR: [1, 0, 0], fL: [0, 1, 0.1], fR: [0, 1, 0.1], eL: [0.5, -1, 0], eR: [-0.5, -1, 0] });
  const YG1 = M(S.hangetsu, OPEN2, { hL: [0.4, 0.24, 0.16], hR: [-0.4, 0.24, 0.16], pL: [-1, 0, 0], pR: [1, 0, 0], fL: [0, 1, 0], fR: [0, 1, 0], eL: [1, -0.15, 0.2], eR: [-1, -0.15, 0.2] });
  D['tc:yama-gamae'] = M({ keys: [{ t: 0, p: HG }, { t: 0.12, p: HG }, { t: 0.4, p: YG0, e: 'io' }, { t: 0.8, p: YG1, e: 'io' }], best: 1, dur: 3.2, eff: 'wristR', view: 'front3' }, hit('elbowR', 'Ellbogen auf Schulterhöhe'));
  // Gedan-kakiwake (Ryote Ryogawa Gedan-kakiwake): Handgelenke kreuzen vor dem Körper, dann gehen beide offenen Hände
  // seitlich nach unten neben den Unterbauch, Handrücken nach außen
  const GK0 = M(S.hangetsu, OPEN2, { hL: [-0.05, -0.12, 0.3], hR: [0.05, -0.1, 0.32], pL: [-0.3, 0, 1], pR: [0.3, 0, 1], fL: [0, 1, 0.2], fR: [0, 1, 0.2], eL: [0.6, -1, 0.2], eR: [-0.6, -1, 0.2] });
  const GK1 = M(S.hangetsu, OPEN2, { hL: [0.4, -0.48, 0.24], hR: [-0.4, -0.48, 0.24], pL: [-1, 0, 0.2], pR: [1, 0, 0.2], fL: [0.1, -1, 0.4], fR: [-0.1, -1, 0.4] });
  D['tc:gedan-kakiwake'] = M({ keys: [{ t: 0, p: YG1 }, { t: 0.12, p: YG1 }, { t: 0.4, p: GK0, e: 'io' }, { t: 0.8, p: GK1, e: 'io' }], best: 1, dur: 3.2, eff: 'wristR', view: 'front3' }, hit('wristR', 'beide Hände nach unten außen'));
  // Teisho Awase-uke (Ryo-teisho Gedan Awase-uke) im Hidari Neko-ashi-dachi: die offenen Hände kommen von den Hüften
  // (Handflächen vorn) nach vorn über das linke Knie, Arme gestreckt, Handballen aneinander, Handgelenke kräftig nach
  // außen gebeugt – wie um das Schienbein eines Tritts aufzufangen
  const TA0 = M(S.neko, OPEN2, { hL: [0.24, -0.34, 0.06], hR: [-0.24, -0.34, 0.06], pL: [0, 0, 1], pR: [0, 0, 1], fL: [0, -1, 0], fR: [0, -1, 0] });
  const TA1 = M(S.neko, OPEN2, { lean: 10, hL: aim(S.neko, [0.08, -0.36, 0.44]), hR: aim(S.neko, [0.0, -0.36, 0.44]), pL: aim(S.neko, [-0.6, 0.3, 0.7]), pR: aim(S.neko, [0.6, 0.3, 0.7]), fL: aim(S.neko, [0.6, 0.5, 0.3]), fR: aim(S.neko, [-0.6, 0.5, 0.3]) });
  D['tc:teisho-awase-uke'] = M({ keys: [{ t: 0, p: TA0 }, { t: 0.15, p: TA0 }, { t: 0.75, p: TA1, e: 'io' }], best: 1, dur: 2.6, eff: 'wristL', view: 'side3' }, hit('wristL', 'beide Handballen'));
  // Te-nagashi-uke aus dem Chudan-kamae (links vorn): die rechte Hand bleibt locker in der Kamae vor dem Körper,
  // die linke offene Hand steht auf Jodan-Höhe links seitlich vor dem Kopf und schiebt die Faust, die auf den Kopf zielt,
  // mit der Innenhandfläche nach rechts zur Seite weg (Handfläche zeigt nach rechts, Finger nach oben)
  const TNU = M(S.zk, { pelvis: [0, 0.76, 0.06], L: { z: 0.5 }, R: { z: -0.42 }, hR: [-0.02, -0.22, 0.2] });
  const TNU_HAND = (x, z) => ({ oL: 1, hL: aim(TNU, [x, 0.1, z]), pL: aim(TNU, [-1, 0, 0]), fL: aim(TNU, [0, 1, 0.25]), eL: aim(TNU, [0.3, -1, 0.2]) });
  D['tc:te-nagashi-uke'] = T_RUHIG(M(TNU, TNU_HAND(0.2, 0.36)), M(TNU, TNU_HAND(-0.2, 0.38)), M(hit('wristL', 'Innenhandfläche schiebt ab'), { eff: 'tipL', view: 'front3' }));
  // Gedan-nagashi-uke aus dem Chudan-kamae wie Te-nagashi-uke, nur unten: der linke Arm, nur ganz leicht gebeugt,
  // wischt mit geschlossener Faust vor dem linken Knie einen Angriff von links nach rechts weg
  const GNU_HAND = (x, z) => ({ lean: 6, hL: aim(TNU, [x, -0.58, z]), pL: aim(TNU, [-1, 0, 0.2]), eL: aim(TNU, [0.4, -0.3, -0.2]) });
  D['tc:gedan-nagashi-uke'] = T_RUHIG(M(TNU, GNU_HAND(0.3, 0.4)), M(TNU, GNU_HAND(-0.06, 0.44)), M(hit('wristL', 'Faust und Unterarm wischen ab'), { eff: 'tipL', view: 'front3' }));
  D['tc:osae-uke'] = T(M(S.zks, { hL: L(H.hip), hR: [0.0, -0.1, 0.36], oR: 1, pR: [0, -1, 0] }), M(S.zks, { hL: L(H.hip), hR: [0.02, -0.36, 0.32], oR: 1, pR: [0, -1, 0] }), M(hit('wristR', 'Handfläche'), { eff: 'wristR', view: 'front3' }));
  // Kake-uke wie in Heian Godan 14, direkt aus der Ausgangsstellung (Kiba-dachi, Fäuste an den Hüften, Blick nach links):
  // beide Arme holen zusammen aus und liegen vor der Brust übereinander (linke offene Hand oben, rechte Faust darunter),
  // dann langsam und kraftvoll wie beim Spannen eines Bogens: die rechte Faust zieht zur Hüfte, der linke Arm hakt
  // ausgestreckt zur linken Seite (Chudan, Handgelenk außen, Handfläche nach vorn)
  const KU0 = M(KB, { look: 90 });
  const KU2 = M(KB, { look: 90, hL: [-0.13, -0.06, 0.3], oL: 1, pL: [0, 0, -1], fL: [-0.3, 1, 0], eL: [0.3, -1, 0.3], hR: [0.13, -0.17, 0.27], eR: [-0.4, -1, 0.3] });
  const KU3 = M(KB, { look: 90, hL: [0.705, -0.1, 0.18], oL: 1, pL: [0.1, 0, 1], fL: [0.15, 1, 0], hR: H.hip });
  D['tc:kake-uke'] = M({ keys: [{ t: 0, p: KU0 }, { t: 0.12, p: KU0 }, { t: 0.38, p: KU2 }, { t: 0.45, p: KU2 }, { t: 0.88, p: KU3 }], best: 1, dur: 3.6, eff: 'wristL', view: 'front' }, hit('wristL', 'Handgelenk'));
  // Sukui-uke wie in Bassai Dai 6: aus Migi Zenkutsu-dachi gleitet der rechte Fuß im Halbkreis am linken vorbei nach rechts,
  // Hüfte bleibt auf gleicher Höhe; Fuß und Faust gehen zusammen: die rechte Faust sinkt vor dem Körper nach links unten
  // und schöpft in einem Bogen tief nach rechts und etwas hoch – die Faust nie höher als der Ellbogen
  const SU_C = [0.13, -0.5];
  const SU0 = M(MZK, { hL: L(H.hip), hR: [0.14, -0.1, 0.3], eR: [-0.3, -0.7, 0.4] });
  const SU1 = M(rotate(MZK, -35, SU_C), { pelvis: [0.06, 0.7, -0.22], R: { x: 0.0, z: -0.3, y: 0.12, pitch: 0 }, hL: L(H.hip), hR: [0.14, -0.5, 0.3], eR: [-0.4, -0.3, 0.2], w: [1, 0] });
  const SU2 = M(rotate(MZK, -70, SU_C), { hL: L(H.hip), hR: [-0.1, -0.52, 0.4], eR: [-0.6, -0.3, 0.1] });
  const SU3 = M(rotate(MZK, -90, SU_C), { hL: L(H.hip), hR: [-0.22, -0.3, 0.42], pR: [0.3, 1, 0], eR: [-0.5, -0.6, 0.1] });
  D['tc:sukui-uke'] = FLOW([SU0, SU1, SU2, SU3], M(hit('elbowR', 'Unterarm'), { eff: 'fistR', view: 'front3', dur: 1.9 }));
  // wie Heian Nidan 1: der vordere (linke) Arm schwingt seitlich hoch, Unterarm senkrecht, Faust auf Kopfhöhe,
  // die Rückseite des Unterarms zeigt zum Angriff; der rechte Oberarm geht fast senkrecht hoch, der Unterarm
  // im rechten Winkel leicht abwärts über dem Kopf – beide Arme bilden ein Rechteck, beide Faustrücken zeigen nach hinten
  const HAIWAN_END = M(S.kk, { hL: [0.46, 0.24, 0.04], eL: [1, -0.5, 0], hR: [0.06, 0.26, 0.16], eR: [-0.4, 1, -0.1], pL: [0, 0, 1], pR: [0, 0, 1] });
  D['tc:haiwan-uke'] = T(M(S.kk, { hL: [-0.1, -0.3, 0.22], eL: [0.2, -1, 0.2], hR: H.hip }), HAIWAN_END, M(hit('elbowL', 'Unterarm-Rückseite'), { eff: 'fistL', view: 'front', yaw: -60 }));
  // Soto-nagashi-uke wie Heian Nidan 2, fließend aus dem Haiwan-uke (1) im Migi Kokutsu-dachi: der linke Unterarm schiebt
  // senkrecht auf Kopfhöhe den Angriff erst zur Seite (nach rechts) weg und zieht dann mit der Faust ans rechte Ohr (wie beim
  // Telefonieren), der Ellbogen zeigt zum Angreifer; zugleich kommt die rechte Faust von oben herunter und schlägt unter
  // dem linken Arm durch Chudan zum Gegner, Arm leicht gebeugt, Faustrücken unten wie beim Ura-zuki – wie eine Schere.
  // Rot markiert ist die Stelle des linken Unterarms, die beim Wegschieben den angreifenden Arm berührt (hit.t);
  // das Standbild zeigt die Ausgangsstellung (best: 0)
  const W_KK = (v) => aim(S.kk, v);
  D['tc:soto-nagashi-uke'] = FLOW([
    HAIWAN_END,
    M(S.kk, { hL: [0.32, 0.22, 0.3], eL: [0.5, -1, 0.2], pL: [-0.4, 0, 0.9], hR: [-0.12, 0.24, 0.2], eR: [-1, -0.3, 0.1] }),
    M(S.kk, { hL: [0.02, 0.2, 0.36], eL: [0.3, -1, 0.4], pL: [-1, 0, 0.3], hR: [-0.05, -0.02, 0.26], eR: [-1, -0.4, 0.2] }),
    M(S.kk, { hL: [-0.15, 0.1, 0.03], eL: [0.8, -0.8, 0.5], pL: [-0.5, 0, -0.9], hR: [0.24, -0.18, 0.26], eR: [-0.1, -1, 0.2], pR: [0, 1, 0] }),
  ], M(hit('elbowL', 'Unterarm'), { hit: { t: 0.62 }, best: 0, eff: 'fistL', view: 'front', yaw: -100 }));
  // Uchi-nagashi-uke wie Tekki Shodan 9 (Teil 1) im Kiba-dachi, Blick nach vorn – nur der Block, der Uraken danach gehört nicht dazu:
  // aus dem Ende von 8 (linke Faust an der Hüfte, rechts Chudan Uchi-uke) streckt sich der rechte Arm weit schräg nach unten,
  // genau mittig geradeaus vor dem Körper
  // (Faustrücken oben); der linke Arm stößt erst von der Hüfte nach vorn (Faustrücken unten), sodass sich beide Arme kreuzen,
  // und geht dann hoch – Oberarm zur Seite, Unterarm senkrecht, Faust neben dem Kopf, Faustrücken nach hinten. Beim Hochgehen
  // zeigt die Rückseite (Haiwan) nach außen und lenkt den Jodan-Angriff ab; das Standbild zeigt diesen Moment (best)
  const UN1 = M(KB, { hL: L(H.hip), hR: [-0.22, 0.02, 0.32], eR: [-0.1, -1, 0.3] });
  const UN_X = M(KB, { hL: [-0.06, -0.16, 0.42], eL: [0.3, -1, 0.2], pL: [0, 1, 0], hR: [-0.1, -0.32, 0.52], eR: [-1, -0.3, 0], pR: [0, -1, 0] });
  const UN_Y = M(KB, { hL: [0.2, 0.08, 0.34], eL: [0.8, -1, 0.2], pL: [-1, 0, 0.2], hR: [-0.02, -0.4, 0.6], eR: [-1, -0.3, 0], pR: [0, -1, 0] });
  const UN2 = M(KB, { hL: [0.3, 0.2, 0.1], eL: [1, -0.5, 0.3], pL: [0, 0, 1], hR: [0, -0.42, 0.62], eR: [-1, -0.3, 0], pR: [0, -1, 0] });
  D['tc:uchi-nagashi-uke'] = M({ keys: [
    { t: 0, p: UN1 }, { t: 0.16, p: UN1 },
    { t: 0.3, p: UN_X, e: 'in' },
    { t: 0.41, p: UN_Y, e: 'lin' },
    { t: 0.52, p: UN2, e: 'out' },
  ], best: 0.424, dur: 1.6 }, M(hit('elbowL', 'Unterarm-Rückseite'), { eff: 'fistL', view: 'front', yaw: 25 }));
  D['tc:tsukami-uke'] = M({ keys: [{ t: 0, p: M(S.zks, HANDS_HIP) }, { t: 0.15, p: M(S.zks, HANDS_HIP) }, { t: 0.45, p: M(S.zks, { hL: L(H.hip), hR: [-0.04, 0.03, 0.5], oR: 1, pR: [0, 0, 1], fR: [0, 1, 0.3] }), e: 'kime' }, { t: 0.75, p: M(S.zks, { hL: L(H.hip), hR: [-0.12, -0.25, 0.16] }) }], best: 0.45, dur: 1.8, eff: 'wristR', view: 'side3' }, hit('wristR', 'greifen'));
  // Tate-shuto-uke wie in Bassai Dai 8–9: im etwas breiteren Hachiji-dachi aus Ryoken Migi Koshi-kamae (beide Fäuste an
  // der rechten Hüfte, linke über der rechten) geht die linke Hand geöffnet langsam und kraftvoll im Bogen nach vorn Chudan,
  // Handkante senkrecht, Arm gestreckt; die rechte Faust bleibt an der Hüfte
  const TSU_ST = M(S.hachiji, { L: { x: 0.22 }, R: { x: -0.22 }, pelvis: [0, 0.93, 0] });
  // (die linke Faust liegt vor der rechten, der Ellbogen bleibt vor dem Körper). Die Hand zieht in einem einzigen
  // gleichmäßigen Bogen nach vorn unten und hoch in die Endstellung; erst dort ist der Arm gestreckt
  // Die linke Hand öffnet sich noch an der Hüfte, Finger in Richtung des Unterarms – so bleibt die rote Handkante
  // beim Öffnen und auf dem ganzen Weg an derselben Stelle der Hand
  const TSU0 = M(TSU_ST, { hR: H.hip, hL: [-0.12, -0.3, 0.14], fL: [-0.98, -0.13, -0.13], pL: [0, -1, 0], eL: [0.5, -0.6, 0.6] });
  const TSU0_OFFEN = M(TSU0, { oL: 1 });
  const TSU_M = M(TSU_ST, { hR: H.hip, hL: [0.01, -0.24, 0.38], oL: 1, fL: [-0.1, 1, 0.4], pL: [-0.4, -0.3, 1], eL: [0.5, -0.8, 0.3] });
  const TSU1 = M(TSU_ST, { hR: H.hip, hL: [0.22, -0.02, 0.52], oL: 1, fL: [0, 1, 0.25], pL: [-0.3, 0, 1] });
  D['tc:tate-shuto-uke'] = M({ keys: [{ t: 0, p: TSU0 }, { t: 0.12, p: TSU0 }, { t: 0.17, p: TSU0_OFFEN }, { t: 0.5, p: TSU_M, e: 'in' }, { t: 0.85, p: TSU1, e: 'out' }], best: 1, dur: 3 }, M(hit('tipL', 'Handkante senkrecht'), { eff: 'wristL', view: 'front3' }));
  // Teisho-uke wie in Jion 23: aus Hidari Zenkutsu-dachi (Gedan-barai) tritt der rechte Fuß vor in Kiba-dachi, die Hüfte dreht
  // ¼ nach links (rechte Seite vorn, Blick nach vorn). Die offene rechte Hand kommt wie beim Teisho-uchi von außen in einem
  // Bogen, nur mit ganz kleinem Radius: von der Hüfte etwas nach außen, dann im kleinen Bogen in die Abwehr zur rechten Seite –
  // Arm fast ganz gestreckt, Handgelenk stark abgeknickt, Finger oben, die Hand 45° nach innen gedreht (Handballen
  // schräg nach außen vorn). Arme und Füße kommen gleichzeitig an;
  // die linke Faust zieht an die Hüfte
  const TU_HAND = { oR: 1, fR: [0, 1, 0], pR: [-1, 0, 0] };
  const TU_MID = BAL(M({ pelvis: [0.05, 0.8, 0.62], yaw: 30, look: 0, L: { x: 0.12, z: 0.62, yaw: 30, kp: [0.4, 0, 1] },
    R: { x: 0.0, z: 0.66, y: 0.14, yaw: 50, pitch: -10, kp: [-0.2, 0.3, 1] }, hL: [0.15, -0.3, 0.2], hR: [-0.25, -0.3, 0.02], eR: [-0.3, -0.5, -1], ...TU_HAND, w: [1, 0] }), 'L');
  D['tc:teisho-uke'] = M({ keys: [
    { t: 0, p: ZK_G }, { t: 0.15, p: ZK_G },
    { t: 0.36, p: TU_MID },
    { t: 0.42, p: FE(M(FE_KB, { R: { y: 0.05 }, hR: [-0.4, -0.2, -0.02], eR: [-1, -0.4, -0.3], ...TU_HAND, w: [0.6, 0.4] })), e: 'in' },
    { t: 0.48, p: FE(M(FE_KB, { hR: [-0.69, -0.1, 0.16], eR: [-0.3, -1, 0.1], ...TU_HAND, pR: [-1, 0, 1] })), e: 'kime' },
  ], best: 1, dur: 1.8 }, M(hit('wristR', 'Handballen'), { eff: 'wristR', view: 'side3', yaw: 130 }));
  // Uchiotoshi wie in Jion 43: aus Hidari Zenkutsu-dachi (Gedan-barai, 42) kommt das rechte Knie hoch, die rechte Faust
  // reißt mit gestrecktem Arm hoch hinter den Kopf; mit dem Stampfen (Fumikomi) in Kiba-dachi (rechte Seite vorn, Blick nach rechts) schlägt der
  // rechte Unterarm senkrecht abwärts gegen einen Chudan-Angriff, Faust auf Höhe des Solarplexus; die linke Faust bleibt an der Hüfte
  D['tc:uchiotoshi'] = M({ keys: [
    { t: 0, p: ZK_G }, { t: 0.12, p: ZK_G },
    { t: 0.42, p: M(FE_UP, { hR: [-0.27, 0.52, -0.14], eR: [-1, 0, -0.2] }) },
    { t: 0.52, p: FE(M(FE_KB, { R: { y: 0.06 }, hR: [-0.64, 0.2, 0.04], eR: [-1, -0.2, 0], w: [0.6, 0.4] })), e: 'in' },
    { t: 0.6, p: FE(M(FE_KB, { hR: [-0.5, -0.2, 0.2], eR: [-0.5, -1, -0.3] })), e: 'kime' },
  ], best: 1, dur: 2 }, M(hit('elbowR', 'Unterarm'), { eff: 'fistR', view: 'side3', yaw: 130 }));
  // Manji-uke: Ausholen wie beim Shuto-uke – die untere (linke) Faust holt am rechten Ohr aus, der rechte Arm ist nach vorn
  // unten gestreckt, die Arme kreuzen vor der Brust; dann schlägt links Gedan-barai, rechts schwingt der Arm nach oben hinten
  D['tc:manji-uke'] = T(M(S.kk, { hL: [-0.13, 0.18, 0.12], eL: [-0.1, -0.2, 1], hR: [0.1, -0.22, 0.46], eR: [-0.2, -0.6, 0.4] }), M(S.kk, { hL: [0.42, -0.52, 0.18], hR: [-0.34, 0.24, 0.02], eR: [-0.7, 0.2, -0.2] }), M(hit('fistL', 'unten und oben'), { eff: 'fistL', view: 'front3' }));

  /* ---------- Fußtritte (rechtes Bein, aus Hidari Zenkutsu-dachi) ---------- */
  const KAMAE_K = M(ZK_G, {});
  // Mae-geri: das Standbein trägt, die Hüfte kommt mit nach vorn über den Standfuß (Schwerpunkt über dem Fuß, BAL);
  // Knie hoch vor den Körper, Unterschenkel locker darunter, dann stößt der Fuß mit der Hüfte nach vorn, Oberkörper aufrecht
  const CHAMBER = BAL({ pelvis: [0, 0.8, 0.55], yaw: -14, L: { x: 0.12, z: 0.62, yaw: 4, kp: [0, 0.2, 1] }, R: { x: -0.09, z: 0.86, y: 0.46, yaw: 0, pitch: -45, kp: [0, 0.7, 1] }, hL: L(H.gedan), hR: H.hip, w: [1, 0] }, 'L', 0.02);
  const MG_EXT = (y, z, bend, o) => POINT(BAL(M(CHAMBER, { yaw: -20, lean: -3, R: { x: -0.09, z, y, kp: [0, 1, 0.3] } }, o), 'L', 0.03), 'R', bend);
  // Treffer (Chudan) im Bewegungs-Editor modelliert: Fußspitze deutlich hochgezogen (Fußballen zum Ziel), Kniescheibe nach
  // vorn – Vorlage für Fuß und Knie der Tritte unten
  const MG_KIME = { pelvis: [0.135, 0.8, 0.615], yaw: -20, lean: -3, L: { x: 0.12, z: 0.62, yaw: 4, kp: [0, 0.2, 1] }, R: { x: -0.081, z: 1.43, y: 0.949, yaw: -8.9, pitch: 43, kp: [-0.147, 0.213, 0.966], tu: 1 }, hL: [0.37, -0.55, 0.14], hR: [-0.215, -0.34, -0.01], w: [1, 0] };
  // Treffer Jodan im Bewegungs-Editor eingestellt: Fußspitze hochgezogen, Fußballen zum Ziel, Oberkörper etwas zurück
  const MG_JODAN = { pelvis: [0.13, 0.8, 0.646], yaw: -20, lean: -8, L: { x: 0.12, z: 0.62, yaw: 4, kp: [0, 0.2, 1] }, R: { x: -0.088, z: 1.278, y: 1.35, yaw: -12.5, pitch: 48, kp: [0.163, 0.775, -0.61], tu: 1 }, hL: [0.37, -0.55, 0.14], hR: [-0.215, -0.34, -0.01], w: [1, 0] };
  D['mv:mae-geri'] = K(KAMAE_K, CHAMBER, MG_JODAN, M(hit('toeR', 'Fußballen'), { eff: 'toeR', view: 'side' }));
  // Kniescheibe nach vorn wie beim Mae-geri (Bewegungs-Editor), für Ren-geri
  const MG_KNIE = { R: { kp: MG_KIME.R.kp } };
  // Kekomi: der Fuß stößt gerade nach vorn, die Hüfte schiebt kräftig nach
  // Im Bewegungs-Editor eingestellt: Treffer mit dem Fußballen, Fuß etwas weniger hochgezogen als zuvor, im Kime kurz
  // gestreckt halten (0,21 → 0,49), dann fließend zurück; Dauer 2,6 je t = 1 (ganze Bewegung 1,77 s)
  const KK_EXT = { pelvis: [0.133, 0.8, 0.617], yaw: -26, lean: -3, L: { x: 0.12, z: 0.62, yaw: 4, kp: [0, 0.2, 1] }, R: { x: -0.085, z: 1.419, y: 0.95, yaw: -11.6, pitch: 36, kp: [-0.147, 0.213, 0.966], tu: 1 }, hL: [0.37, -0.55, 0.14], hR: [-0.215, -0.34, -0.01], w: [1, 0] };
  D['tc:mae-geri-kekomi'] = M({ keys: [{ t: 0, p: KAMAE_K }, { t: 0.07, p: KAMAE_K }, { t: 0.16, p: CHAMBER }, { t: 0.21, p: KK_EXT, e: 'kime' }, { t: 0.49, p: KK_EXT }, { t: 0.57, p: CHAMBER, e: 'fl' }, { t: 0.68, p: KAMAE_K, e: 'fl' }], best: 0.21, dur: 2.6 }, M(hit('toeR', 'Fußballen'), { eff: 'toeR', view: 'side' }));
  D['tc:sonoba-geri'] = K(YOI, M(YOI, { pelvis: [0, 0.86, 0.02], L: { x: 0.16, z: 0 }, R: { x: -0.1, z: 0.3, y: 0.5, yaw: 0, pitch: -55, kp: [0, 0.5, 1] }, w: [1, 0] }), M(YOI, { lean: -8, pelvis: [0, 0.86, 0.02], R: { x: -0.1, z: 0.92, y: 0.88, yaw: 0, pitch: 8, kp: [0, 1, 0.3] }, w: [1, 0] }), M(hit('toeR', 'Fußballen'), { eff: 'toeR', view: 'side' }));
  D['tc:kizami-geri'] = K(ZK_KAMAE, M(ZK_KAMAE, { pelvis: [0, 0.82, 0.0], L: { x: 0.1, z: 0.36, y: 0.5, pitch: -55, kp: [0, 0.5, 1] }, R: { z: -0.4 }, w: [0, 1] }), M(ZK_KAMAE, { pelvis: [0, 0.82, -0.02], lean: -10, L: { x: 0.1, z: 0.88, y: 0.95, pitch: 8, kp: [0, 1, 0.3] }, R: { z: -0.4 }, w: [0, 1] }), M(hit('toeL', 'Fußballen'), { eff: 'toeL', view: 'side' }));
  // Ren-geri: zweimal Mae-geri hintereinander (Gedan, dann Jodan); Kniescheibe nach vorn und Fußspitze hochgezogen
  // (Fußballen zum Ziel) wie beim Mae-geri. Ablauf im Bewegungs-Editor eingestellt (7 Bilder, 2,25 s): kurze Pause, Knie
  // hoch, erster Tritt (Kime, 0,1 s halten), Bein zurück (Bild 4: Füße im Editor gesetzt), zweiter Tritt höher (Kernbild,
  // Kime, 0,3 s halten), Bein zurück und in den Stand.
  const RG_1 = MG_EXT(0.55, 1.4, 42, MG_KNIE);
  const RG_ZURUECK = { pelvis: [0.127, 0.8, 0.618], yaw: -14, L: { x: 0.238, z: 0.623, y: 0.087, yaw: 4, kp: [0, 0.2, 1] }, R: { x: -0.068, z: 0.737, y: 0.492, yaw: 0, pitch: -45, kp: [0, 0.7, 1], tu: 1 }, hL: [0.37, -0.55, 0.14], hR: [-0.215, -0.34, -0.01], w: [1, 0] };
  const RG_2 = { pelvis: [0.135, 0.8, 0.621], yaw: -20, lean: -3, L: { x: 0.12, z: 0.62, yaw: 4, kp: [0, 0.2, 1] }, R: { x: -0.082, z: 1.434, y: 0.965, yaw: -13, pitch: 45, kp: [0.098, 0.977, -0.192], sole: [0.03, -0.694, 0.719], tu: 1 }, hL: [0.37, -0.55, 0.14], hR: [-0.215, -0.34, -0.01], w: [1, 0] };
  D['tc:ren-geri'] = M(D['mv:mae-geri'], { keys: [{ t: 0, p: KAMAE_K }, { t: 0.072, p: KAMAE_K }, { t: 0.214, p: CHAMBER }, { t: 0.302, p: RG_1, e: 'kime' }, { t: 0.346, p: RG_1 }, { t: 0.457, p: RG_ZURUECK },
    { t: 0.59, p: RG_2, e: 'kime' }, { t: 0.724, p: RG_2 }, { t: 0.848, p: CHAMBER }, { t: 1, p: KAMAE_K }], best: 0.59, dur: 2.2487 });
  // Seitwärts aus Kiba-dachi: Fußkante nach rechts, Blick zur Seite
  const KB_K = M(KB, { look: -90 });
  const Y_CH = M(KB_K, { pelvis: [0.12, 0.8, 0], R: { x: -0.22, z: 0.12, y: 0.55, yaw: 0, pitch: -30, kp: [-0.5, 0.6, 0.6] }, L: { x: 0.36 }, w: [1, 0] });
  // Beide Yoko-geri mit den Händen in Kamae in Trittrichtung (nach rechts, auch wenn der Oberkörper beim Tritt eindreht):
  // Kamae wie im Zenkutsu-dachi (Chudan-kamae), nur in Trittrichtung (das Ziel liegt rechts, auch wenn der Oberkörper
  // beim Tritt eindreht): der vordere (rechte) Arm etwa rechtwinklig gebeugt, Faust auf Schulterhöhe, Ellbogen unten;
  // die hintere (linke) Faust vor dem Solarplexus, Ellbogen unten mit etwas Abstand zum Körper. Ellbogen ausdrücklich
  // vorgegeben – ohne Vorgabe hielte die Figur eine Faust nah am Körper für Hikite. Neigt sich der Oberkörper zur Seite
  // (roll), wird die Höhe ausgeglichen. Faust in Weltrichtung zur Brust (x links, y oben, z vorn), Ellbogen in Brustkoordinaten.
  // Beide Tritte mit derselben Haltung; der rechte Ellbogen zeigt etwas nach außen Richtung Rücken (nicht zum Bauch),
  // der Unterarm steht aufrecht. Arme und Trittbein bleiben im ganzen Ablauf auseinander (Mittellinien ≥ 17 cm).
  const YG = (p, a) => {
    const r = (E.full(p).roll * Math.PI) / 180;
    const h = (w) => { const c = aim(p, w); return [c[0], (w[1] + c[0] * Math.sin(r)) / Math.cos(r), c[2]]; };
    return M(p, { hR: h(a.hR), eR: a.eR, hL: h(a.hL), eL: a.eL });
  };
  const ARME = { hR: [-0.44, 0.14, 0.32], eR: [-0.45, -1, -0.35], hL: [-0.02, -0.18, 0.2], eL: [0.8, -1, 0] };
  const YGK = (p) => YG(p, ARME);
  const KB_G = YGK(KB_K);
    // Yoko-geri kekomi: Knie hoch vor den Körper, Fuß dicht am Standbein; dann stößt das Bein gerade zur Seite und die Hüfte
  // dreht kräftig ein (das Gesäß wendet sich zum Ziel, als wollte man es ansehen), Oberkörper neigt sich zur Gegenseite,
  // Standfuß dreht mit, Ferse und Fußkante führen; etwas langsamer als die anderen Tritte (2,7 s statt 2 s)
  const YK_CH = YGK(BAL(M(KB_K, { pelvis: [0.3, 0.78, 0], yaw: 25, L: { yaw: 25, kp: [0.8, 0.2, 1] }, R: { x: 0.2, z: 0.18, y: 0.62, yaw: -10, pitch: -5, sole: [-1, -0.2, 0], kp: [-0.5, 0.6, 1] }, w: [1, 0] }), 'L'));
  const YK_EXT = YGK(BAL(M(KB_K, { pelvis: [0.36, 0.8, 0], yaw: 62, chest: -32, roll: 24, L: { yaw: 70, kp: [0.5, 0.2, 1] }, R: { x: -0.55, z: 0.02, y: 0.98, yaw: 0, pitch: -18, sole: [-1, 0, 0], kp: [0, -0.2, 1] }, w: [1, 0] }), 'L'));
  // Im Treffpunkt bleibt das Bein kurz gestreckt stehen (Kime), dann zurück
  D['mv:yoko-geri'] = M({ keys: [{ t: 0, p: KB_G }, { t: 0.12, p: KB_G }, { t: 0.27, p: YK_CH }, { t: 0.35, p: YK_EXT, e: 'kime' }, { t: 0.41, p: YK_EXT }, { t: 0.53, p: YK_CH }, { t: 0.71, p: KB_G }], best: 0.35, dur: 2.7 }, M(hit('heelR', 'Fußkante'), { eff: 'heelR', view: 'front' }));
  // Yoko-geri keage: Knie hoch, Knie zeigt zum Ziel; der Unterschenkel schnappt im Bogen seitlich nach oben (Jodan),
  // die Hüfte schnappt dabei mit hoch (rechte Hüfte steigt, Oberkörper kippt etwas zur Gegenseite) und sofort zurück;
  // im Treffpunkt ist das Bein durchgestreckt
  const YA_CH = YGK(BAL(M(KB_K, { pelvis: [0.3, 0.78, 0], yaw: 12, L: { yaw: 15, kp: [0.8, 0.2, 1] }, R: { x: 0.12, z: 0.18, y: 0.5, yaw: -40, pitch: -20, sole: [-0.6, -0.8, 0], kp: [-1, 0.6, 0.5] }, w: [1, 0] }), 'L'));
  const YA_MID = YGK(BAL(M(YA_CH, { pelvis: [0.3, 0.8, 0], roll: 8, R: { x: -0.05, z: 0.2, y: 0.58, yaw: -10, pitch: 0, kp: [-1, 0.1, 0.3] } }), 'L'));
  const YA_EXT = YGK(BAL(M(YA_CH, { pelvis: [0.3, 0.84, 0], yaw: 18, roll: 22, R: { x: -0.52, z: 0.12, y: 1.36, yaw: 0, pitch: 18, sole: [-0.7, -0.7, 0], kp: [-0.8, 0.4, 0.2] } }), 'L'));
  D['tc:yoko-geri-keage'] = M({ keys: [{ t: 0, p: KB_G }, { t: 0.1, p: KB_G }, { t: 0.32, p: YA_CH }, { t: 0.42, p: YA_MID, e: 'in' }, { t: 0.5, p: YA_EXT, e: 'kime' }, { t: 0.6, p: YA_MID }, { t: 0.68, p: YA_CH }, { t: 0.9, p: KB_G }], best: 0.5, dur: 2 }, M(hit('heelR', 'Fußkante'), { eff: 'heelR', view: 'front' }));
  // Mawashi-geri, alle Bilder im Pose-Editor modelliert. Aus Zenkutsu-dachi (Chudan-kamae) zieht das rechte Knie gleich
  // seitlich hoch (Ober- und Unterschenkel waagerecht, Ferse zum Gesäß), der Fuß ist angezogen (Zehen hoch, Sohle zum Ziel)
  // und bleibt so bis zum Treffer. Das Bein schwenkt waagerecht um die Hüfte nach vorn, die Hüfte dreht weit ein, das Knie
  // zeigt zum Ziel, dann schnappt der Unterschenkel im Halbkreis ins Ziel; Treffer mit dem Fußballen. Standfuß dreht auf dem
  // Ballen mit, der Oberkörper kippt vom Ziel weg, der Blick geht über die linke Schulter zum Ziel. Derselbe Weg zurück.
  const MW_A = { pelvis: [0, 0.7, 0.1], yaw: -40, chest: -12, lean: 5, L: { x: 0.12, z: 0.62, yaw: 4 }, R: { x: -0.13, z: -0.5, yaw: -32 }, hL: [0.428, 0.055, 0.28], hR: [0.09, -0.16, 0.265], eL: [0.252, -0.534, 0.109], eR: [-0.34, -0.388, 0.307], w: [0.7, 0.3] };
  // Bild 3: Knie seitlich angezogen
  const MW_UP = { pelvis: [0.166, 0.77, 0.594], yaw: 25, chest: -25, lean: 5, roll: 4, look: 6, L: { x: 0.12, z: 0.62, yaw: 40, kp: [0.5, 0.2, 1] }, R: { x: -0.294, z: 0.307, y: 0.788, yaw: -100, pitch: -10, kp: [-0.999, -0.007, 0.054], sole: [0.127, 0.238, -0.963], tu: 1 }, hL: [0.261, -0.021, 0.275], hR: [-0.069, -0.112, 0.24], eL: [0.145, -0.502, 0.187], eR: [-0.381, -0.373, 0.137], w: [1, 0] };
  // Bild 4: Bein schwenkt waagerecht um die Hüfte nach vorn
  const MW_CH = { pelvis: [0.173, 0.77, 0.577], yaw: 60, chest: -22, lean: 5, roll: 9, look: 13, L: { x: 0.12, z: 0.62, yaw: 70, kp: [0.5, 0.2, 1] }, R: { x: -0.419, z: 0.584, y: 0.838, yaw: -51, pitch: 2.6, kp: [-0.041, 0.019, 0.339], sole: [-0.622, -0.224, -0.751], tu: 1 }, hL: [0.107, -0.091, 0.271], hR: [-0.216, -0.068, 0.217], eL: [0.045, -0.472, 0.26], eR: [-0.419, -0.359, -0.02], w: [1, 0] };
  // Bild 5: Hüfte halb eingedreht, Knie seitlich vorn, Unterschenkel waagerecht angelegt
  const MW_MID = { pelvis: [0.103, 0.8, 0.585], yaw: 95, chest: -20, lean: 5, roll: 14, look: 20, L: { x: 0.12, z: 0.62, yaw: 90, kp: [0.928, -0.368, 0.062] }, R: { x: -0.452, z: 0.987, y: 0.919, yaw: -5.1, pitch: 10, kp: [0.148, 0.224, 0.963], sole: [-0.971, -0.234, -0.045], tu: 1 }, hL: [-0.048, -0.161, 0.267], hR: [-0.364, -0.024, 0.194], eL: [-0.055, -0.442, 0.333], eR: [-0.458, -0.345, -0.178], w: [1, 0] };
  // Bild 6 (und 8): Unterschenkel halb geöffnet im Bogen
  const MW_SN = { pelvis: [0.108, 0.8, 0.65], yaw: 115, chest: -16, lean: 5, roll: 15, look: 22, L: { x: 0.12, z: 0.62, yaw: 100, kp: [0.928, -0.368, 0.062] }, R: { x: -0.047, z: 1.49, y: 0.923, yaw: 64, pitch: 10, kp: [0.186, 0.019, 0.044], sole: [-0.429, -0.055, 0.902], tu: 1 }, hL: [-0.143, -0.204, 0.264], hR: [-0.432, -0.065, 0.144], eL: [-0.116, -0.423, 0.378], eR: [-0.22, -0.496, -0.053], w: [1, 0] };
  // Bild 7 (Kernbild): Treffer
  const MW_E = { pelvis: [0.113, 0.8, 0.715], yaw: 125, chest: -13, lean: 5, roll: 16, look: 23, L: { x: 0.12, z: 0.62, yaw: 105, kp: [0.738, -0.527, -0.421] }, R: { x: 0.711, z: 1.511, y: 0.916, yaw: 132, pitch: -4, kp: [0.811, -0.168, 0.561], sole: [0.653, -0.156, 0.741], tu: 1 }, hL: [-0.206, -0.233, 0.262], hR: [-0.477, -0.092, 0.11], eL: [-0.157, -0.411, 0.408], eR: [-0.061, -0.596, 0.031], w: [1, 0] };
  // Fuß in jedem Bild angezogen: sobald er vom Boden ist, hält er seinen Winkel zum Schienbein; zwischen den Schlüsselbildern
  // geht dieser Winkel gleichmäßig über (z. B. Bild 3: 87°, Bild 5 und Treffer: 97°). Die Drehung um den Unterschenkel folgt der Hüfte.
  const FUSS_FEST = (keys, s) => {
    const ca = (P) => {
      const J = E.solve(P);
      const a = V.norm(V.sub(J['ankle' + s], J['knee' + s]));
      return { J, a, c: a[0] * J['dir' + s][0] + a[1] * J['dir' + s][1] + a[2] * J['dir' + s][2] };
    };
    const ref = keys.map((k) => ({ t: k.t, P: E.full(k.p) })).filter((k) => k.P[s].y > 0.3).map((k) => ({ t: k.t, c: ca(k.P).c }));
    const target = (t) => {
      if (t <= ref[0].t) return ref[0].c;
      for (let i = 1; i < ref.length; i++) if (t <= ref[i].t) return ref[i - 1].c + ((ref[i].c - ref[i - 1].c) * (t - ref[i - 1].t)) / (ref[i].t - ref[i - 1].t);
      return ref[ref.length - 1].c;
    };
    return (P, t) => {
      const { J, a, c: c0 } = ca(P);
      const k = Math.max(0, Math.min(1, (J['ankle' + s][1] - 0.12) / 0.18));
      const q = V.sub(J['dir' + s], V.mul(a, c0));
      if (!k || V.len(q) < 0.05) return P;
      const c = c0 + (target(t) - c0) * k;
      const d = V.add(V.mul(a, c), V.mul(V.norm(q), Math.sqrt(1 - c * c)));
      return M(P, { [s]: { yaw: (Math.atan2(d[0], d[2]) * 180) / Math.PI, pitch: (Math.asin(Math.max(-1, Math.min(1, d[1]))) * 180) / Math.PI, sole: J['sole' + s] } });
    };
  };
  // Übergänge fließend: die Figur zieht durch die Zwischenbilder durch, hält nur im Stand, im Treffer (Kime) und am Ende
  const MW_KEYS = [{ t: 0, p: MW_A }, { t: 0.1, p: MW_A }, { t: 0.175, p: MW_UP, e: 'fl' }, { t: 0.25, p: MW_CH, e: 'fl' }, { t: 0.3, p: MW_MID, e: 'fl' }, { t: 0.34, p: MW_SN, e: 'fl' }, { t: 0.38, p: MW_E, e: 'kime' }, { t: 0.46, p: MW_SN, e: 'fl' }, { t: 0.5, p: MW_MID, e: 'fl' }, { t: 0.58, p: MW_CH, e: 'fl' }, { t: 0.68, p: MW_UP, e: 'fl' }, { t: 0.8, p: MW_A, e: 'fl' }];
  D['mv:mawashi-geri'] = M({ keys: MW_KEYS, fix: FUSS_FEST(MW_KEYS, 'R'), best: 0.38, dur: 2 }, M(hit('toeR', 'Fußballen'), { eff: 'toeR', cam: { yaw: -16, pitch: 14 } }));
  const US_CH = M(KAMAE_K, { pelvis: [0, 0.82, 0.2], lean: 22, look: 160, R: { x: -0.08, z: 0.32, y: 0.45, yaw: 0, pitch: -70, kp: [0, 0.4, 1] }, w: [1, 0] });
  // Treffer: Zehen zeigen nach unten, Sohle und Ferse nach hinten zum Ziel (Fuß im Bewegungs-Editor eingestellt)
  D['mv:ushiro-geri'] = K(KAMAE_K, US_CH, M(US_CH, { lean: 35, R: { x: -0.08, z: -0.72, y: 0.82, yaw: 0, pitch: -90, kp: [0, -1, 0.2], tu: 1 } }), M(hit('heelR', 'Ferse'), { eff: 'heelR', view: 'side' }));
  // Mikazuki-geri wie in Heian Godan 15: aus Kiba-dachi, die linke offene Hand zur linken Seite gestreckt (Ziel), das linke
  // Bein trägt, die Hüfte dreht links herum; der rechte Fuß schwingt im Bogen von außen herein und tritt mit der Sohle
  // in die linke Handfläche
  // Ablauf im Bewegungs-Editor eingestellt: bis zum Kime, danach derselbe Weg rückwärts zurück in Kiba-dachi
  const MK_HL = { oL: 1, pL: [0, 0, 1], hR: [-0.215, -0.34, -0.01] };
  const MK0 = M({ pelvis: [0, 0.68, 0], look: 90, L: { x: 0.42, yaw: 5, kp: [1, 0, 0.5] }, R: { x: -0.42, yaw: -5, kp: [-1, 0, 0.5] }, hL: [0.696, -0.204, 0.059], fL: [0, 1, 0.15] }, MK_HL);
  const MK1 = M({ pelvis: [0.131, 0.73, 0.105], yaw: 25, look: 80, L: { x: 0.42, yaw: 30, kp: [0.866, -0.432, 0.252] }, R: { x: -0.108, z: 0.257, y: 0.269, yaw: 0, pitch: -10, kp: [-0.62, 0.013, 0.784] }, hL: [0.574, -0.224, 0.3], fL: [-0.063, 1, 0.136], w: [1, 0] }, MK_HL);
  // Zwischenstellung vorn: der Fuß schwingt im Bogen (nicht auf geradem Weg) zur Hand
  const MK15 = M({ pelvis: [0.181, 0.688, 0.074], yaw: 25, roll: 4, look: 80, L: { x: 0.42, yaw: 55, kp: [0.965, -0.137, 0.222] }, R: { x: 0.094, z: 0.636, y: 0.628, yaw: 0, pitch: 30, kp: [-0.2, 0.4, 1], sole: [1, 0, -0.3] }, hL: [0.611, -0.164, 0.298], fL: [-0.133, 0.993, 0.136], w: [1, 0] }, MK_HL);
  const MK2 = M({ pelvis: [0.33, 0.82, -0.02], yaw: 40, roll: 8, look: 80, L: { x: 0.42, yaw: 55, kp: [0.871, -0.49, 0.039] }, R: { x: 0.883, z: 0.086, y: 1.04, yaw: 2, pitch: 71, kp: [0.471, 0.871, 0.139], sole: [0.408, 0.293, -0.865] }, hL: [0.411, -0.175, 0.418], fL: [-0.235, 0.977, 0.115], w: [1, 0] }, MK_HL);
  // Timing und Kamera im Bewegungs-Editor eingestellt: schnell hinein (fließend), Kime, auslaufend zurück; 1,5 s
  D['mv:mikazuki-geri'] = M({ keys: [{ t: 0, p: MK0 }, { t: 0.06, p: MK0 }, { t: 0.11, p: MK1, e: 'fl' }, { t: 0.17, p: MK15, e: 'in' }, { t: 0.25, p: MK2, e: 'kime' }, { t: 0.35, p: MK15, e: 'out' }, { t: 0.43, p: MK1, e: 'fl' }, { t: 0.59, p: MK0, e: 'fl' }], best: 0.25, dur: 2.5253, eff: 'toeR', cam: { yaw: 14, pitch: 17 } }, hit('heelR', 'Fußsohle'));
  // Sohle so gewählt, dass sie beim Einschwingen zum Treffer (Sohle innen) nicht über das Knie dreht (validate: Sprunggelenk)
  // Ura-mawashi-geri (Hakentritt), gegenläufig zum Mawashi-geri: aus Hidari Zenkutsu-dachi mit derselben Deckung. Das rechte
  // Knie zieht hoch vor den Körper, der Standfuß dreht auf dem Ballen und die Hüfte dreht seitlich ein (rechte Seite zum
  // Ziel). Das Bein streckt sich links neben das Ziel, dann hakt der Unterschenkel zurück: die Sohle schlägt von links nach
  // rechts ins Ziel (Jodan) – dort steht das Bild kurz. Danach geht das Bein auf demselben Weg zurück in den Stand.
  // Bilder und Timing im Bewegungs-Editor eingestellt (9 Bilder, Kernbild = Treffer, 1,93 s).
  const UM_UP = { pelvis: [0.1, 0.78, 0.52], yaw: -5, chest: -15, lean: 4, L: { x: 0.12, z: 0.62, yaw: 30 }, R: { z: 0.42, y: 0.42, yaw: -156.4, pitch: -60.2, kp: [-0.1, 0.5, 1], sole: [0.384, 0.358, -0.851] }, hL: [0.248, 0.027, 0.388], hR: [0.046, -0.119, 0.311], eL: [0.5, -1, 0.2], eR: [-0.3, -1, 0.1], w: [1, 0] };
  // seitlich eingedreht: Knie hoch, Ferse hinter dem Oberschenkel
  const UM_CH = { pelvis: [0.13, 0.82, 0.64], yaw: 80, chest: -15, lean: 5, roll: 12, L: { x: 0.12, z: 0.62, yaw: 85 }, R: { x: 0.119, z: 0.933, y: 0.568, yaw: 33, pitch: -24, kp: [0.882, 0.124, 0.455], sole: [-0.862, -0.327, 0.386] }, hL: [0.014, -0.152, 0.332], hR: [-0.297, -0.142, 0.267], eL: [0.5, -1, 0.2], eR: [-0.3, -1, 0.1], w: [1, 0] };
  // gestreckt links neben dem Ziel
  const UM_EXT = { pelvis: [0.12, 0.84, 0.68], yaw: 100, chest: -18, lean: 6, roll: 28, L: { x: 0.12, z: 0.62, yaw: 110 }, R: { x: 0.807, z: 0.732, y: 1.339, yaw: 83.3, pitch: 19.4, kp: [-0.01, -0.043, -0.999], sole: [-0.251, 0.419, 0.873] }, hL: [0.028, -0.174, 0.33], hR: [-0.297, -0.25, 0.184], eL: [0.5, -1, 0.2], eR: [-0.3, -1, 0.1], w: [1, 0] };
  // Treffer: der Unterschenkel hat zurückgehakt, die Sohle trifft
  const UM_HIT = { pelvis: [0.12, 0.84, 0.68], yaw: 100, chest: -18, lean: 6, roll: 28, L: { x: 0.12, z: 0.62, yaw: 110 }, R: { x: 0.277, z: 1.074, y: 1.229, yaw: 3, pitch: 33, kp: [0.715, 0.683, -0.15], sole: [-0.997, -0.029, 0.071] }, hL: [0.115, -0.151, 0.298], hR: [-0.405, 0.015, 0.215], eL: [0.5, -1, 0.2], eR: [-0.369, -0.373, -0.291], w: [1, 0] };
  // Ablauf: kurz stehen, fließend bis ins Ziel (Kime), dort 0,2 s halten, fließend auf demselben Weg zurück
  const UM_KEYS = [{ t: 0, p: MW_A }, { t: 0.1, p: MW_A }, { t: 0.18, p: UM_UP, e: 'fl' }, { t: 0.263, p: UM_CH, e: 'fl' }, { t: 0.323, p: UM_EXT, e: 'fl' },
    { t: 0.406, p: UM_HIT, e: 'kime' }, { t: 0.489, p: UM_HIT }, { t: 0.533, p: UM_EXT, e: 'fl' }, { t: 0.603, p: UM_CH, e: 'fl' }, { t: 0.694, p: UM_UP, e: 'fl' }, { t: 0.804, p: MW_A, e: 'fl' }];
  // Zwischen den Bildern: sobald der Fuß vom Boden ist, folgt er dem Unterschenkel – seine Stellung wird relativ zum Bein
  // (Unterschenkel, Kniescheibe) zwischen den Bildern übergeblendet. In den Bildern selbst bleibt sie genau wie eingestellt;
  // beim bloßen Überblenden der Fußwinkel würde er zwischendurch zur Seite ausscheren.
  const UM_DOT = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const UM_BEIN = (J, kp) => {
    const a = V.norm(V.sub(J.ankleR, J.kneeR));
    let kd = V.sub(J.kneeR, V.mix(J.hipR, J.ankleR, 0.5));
    if (V.len(kd) < 0.03) kd = kp;
    const n = V.norm(V.sub(kd, V.mul(a, UM_DOT(kd, a))));
    return [a, n, [a[1] * n[2] - a[2] * n[1], a[2] * n[0] - a[0] * n[2], a[0] * n[1] - a[1] * n[0]]];
  };
  const UM_IN = (v, B) => B.map((e) => UM_DOT(v, e));
  const UM_AUS = (l, B) => V.norm(V.add(V.add(V.mul(B[0], l[0]), V.mul(B[1], l[1])), V.mul(B[2], l[2])));
  // (als Baustein für eine Bilderfolge: auch Ushiro-mawashi-geri unten)
  const UM_FOLGT = (keys) => {
    const lokal = keys.map((k) => {
      const p = E.full(k.p);
      const J = E.solve(p);
      const B = UM_BEIN(J, p.R.kp);
      return { dir: UM_IN(J.dirR, B), sole: UM_IN(J.soleR, B) };
    });
    return (P, t) => UM_FUSS_NACH(keys, lokal, P, t);
  };
  const UM_FUSS_NACH = (keys, lokal, P, t) => {
    const k = Math.max(0, Math.min(1, (P.R.y - 0.12) / 0.2));
    if (!k) return P;
    let i = 1;
    while (i < keys.length - 1 && keys[i].t < t) i++;
    const u = Math.max(0, Math.min(1, (t - keys[i - 1].t) / (keys[i].t - keys[i - 1].t || 1)));
    const [A, Z] = [lokal[i - 1], lokal[i]];
    const J = E.solve(P);
    const B = UM_BEIN(J, P.R.kp);
    const dir = UM_AUS(V.mix(A.dir, Z.dir, u), B);
    let sole = UM_AUS(V.mix(A.sole, Z.sole, u), B);
    sole = V.norm(V.sub(sole, V.mul(dir, UM_DOT(sole, dir))));
    const d = V.norm(V.mix(J.dirR, dir, k));
    return M(P, { R: { yaw: (Math.atan2(d[0], d[2]) * 180) / Math.PI, pitch: (Math.asin(Math.max(-1, Math.min(1, d[1]))) * 180) / Math.PI, sole: V.norm(V.mix(J.soleR, sole, k)) } });
  };
  D['tc:ura-mawashi-geri'] = M({ keys: UM_KEYS, fix: UM_FOLGT(UM_KEYS), best: 0.406, dur: 2.4, eff: 'heelR', cam: { yaw: 40, pitch: 5 } }, hit('heelR', 'Sohle / Ferse'));
  // Ushiro-mawashi-geri: derselbe Hakentritt aus einer Körperdrehung wie beim Ushiro-geri. Aus Hidari Zenkutsu-dachi dreht
  // der Körper rechts herum (im Uhrzeigersinn) auf dem Ballen des vorderen linken Fußes, bis der Rücken zum Ziel zeigt; der
  // Kopf schnellt voraus und sucht das Ziel über die rechte Schulter. Das rechte Knie zieht dabei vor dem Körper hoch
  // (weg vom Ziel), dann stößt das Bein aus der Drehung seitlich hinaus – links neben das Ziel – und der Unterschenkel hakt
  // mit der weiterlaufenden Drehung zurück ins Ziel. Treffer und alles danach sind die Bilder des Ura-mawashi-geri: die
  // Drehung läuft in derselben Richtung weiter, das Bein geht über das angezogene Knie zurück – nach einer ganzen Drehung
  // steht die Figur wieder im Ausgangsstand. Winkel laufen dabei stetig weiter (−40° … −400°), damit nichts zurückdreht.
  const UW_RUM = (p) => { const f = E.full(p); return M(p, { yaw: f.yaw - 360, look: -360, L: { yaw: f.L.yaw - 360 } }); };
  const UW_ARME = { hL: [0.14, -0.12, 0.26], hR: [-0.14, -0.14, 0.24], eL: [0.5, -1, 0.2], eR: [-0.3, -1, 0.1] };
  // Vierteldrehung: beide Füße drehen am Boden mit, das Gewicht geht aufs linke Bein, der Blick hält noch das Ziel
  const UW_1 = M(MW_A, UW_ARME, { pelvis: [0.05, 0.72, 0.24], yaw: -110, chest: -10, lean: 6, look: -70, L: { yaw: -70 }, R: { x: -0.1, z: -0.34, yaw: -120 }, w: [0.8, 0.2] });
  // Rücken zum Ziel: rechtes Knie hoch vor dem Körper (weg vom Ziel), Oberkörper leicht vorgeneigt, Blick über die rechte Schulter
  const UW_2 = (() => {
    const p = E.full(M(MW_A, UW_ARME, { pelvis: [0.11, 0.8, 0.58], yaw: -185, chest: -18, lean: 14, look: -280, L: { yaw: -150 }, R: { x: 0.24, y: 0.42, z: 0.5, kp: [0.2, 0.2, -1] }, w: [1, 0] }));
    // Fuß locker gestreckt: Zehen 40° von der Richtung der Kniescheibe zum Unterschenkel hin
    const [a, n] = UM_BEIN(E.solve(p), p.R.kp);
    const f = (40 * Math.PI) / 180;
    const d = V.add(V.mul(n, Math.cos(f)), V.mul(a, Math.sin(f)));
    return M(p, { R: { yaw: (Math.atan2(d[0], d[2]) * 180) / Math.PI - 360, pitch: (Math.asin(d[1]) * 180) / Math.PI, sole: V.sub(V.mul(a, Math.cos(f)), V.mul(n, Math.sin(f))) } });
  })();
  // Bein stößt seitlich hinaus (Stellung des Fußes wie im gestreckten Bild des Ura-mawashi-geri), der Körper ist noch nicht
  // ganz herum
  const UW_3 = M(UM_EXT, { yaw: -215, chest: -15, lean: 12, roll: 20, look: -340, L: { yaw: -205 } });
  const UW_KEYS = [{ t: 0, p: MW_A }, { t: 0.1, p: MW_A }, { t: 0.165, p: UW_1, e: 'fl' }, { t: 0.235, p: UW_2, e: 'fl' }, { t: 0.31, p: UW_3, e: 'fl' },
    { t: 0.393, p: UW_RUM(UM_HIT), e: 'kime' }, { t: 0.476, p: UW_RUM(UM_HIT) }, { t: 0.52, p: UW_RUM(UM_EXT), e: 'fl' }, { t: 0.59, p: UW_RUM(UM_CH), e: 'fl' }, { t: 0.681, p: UW_RUM(UM_UP), e: 'fl' }, { t: 0.791, p: UW_RUM(MW_A), e: 'fl' }];
  // Bis zur Vierteldrehung bleibt der rechte Fuß flach am Boden (das fließende Überblenden zöge ihn sonst kurz unter den Boden)
  const UW_FUSS = UM_FOLGT(UW_KEYS);
  const UW_FIX = (P, t) => UW_FUSS(t < UW_KEYS[2].t ? M(P, { R: { y: 0.075, pitch: 0 } }) : P, t);
  D['tc:ushiro-mawashi-geri'] = M({ keys: UW_KEYS, fix: UW_FIX, best: 0.393, dur: 2.4, eff: 'heelR', cam: { yaw: 40, pitch: 5 }, marks: ['turn'] }, hit('heelR', 'Sohle / Ferse'));
  // Hiza-geri: beide offenen Hände greifen vorn auf Kopfhöhe und ziehen herab, das Knie stößt zwischen den Händen nach oben.
  // Ablauf im Bewegungs-Editor eingestellt (5 Bilder, 1,83 s): Pause, Knie anheben und greifen (0,1 s halten), Kniestoß
  // (Kernbild, Kime, 0,15 s halten), Knie zurück, Stand.
  const HZ_A = { pelvis: [0, 0.7, 0.1], yaw: -16, L: { x: 0.12, z: 0.62, yaw: 4 }, R: { x: -0.13, z: -0.5, yaw: -32 }, hL: [0.209, 0.066, 0.449], hR: [-0.014, -0.153, 0.442], eR: [-0.07, -0.489, 0.34], w: [0.7, 0.3] };
  const HZ_CH = { pelvis: [0.146, 0.84, 0.612], yaw: -1, L: { x: 0.208, z: 0.622, y: 0.077, yaw: 4 }, R: { x: 0.066, z: 0.462, y: 0.42, yaw: -32, pitch: -70, kp: [0, 0.6, 1] }, hL: [0.153, 0.042, 0.521], hR: [-0.073, 0.074, 0.522], oL: 1, oR: 1, pL: [-1, 0, 0], pR: [1, 0, 0], w: [1, 0] };
  const HZ_HIT = { pelvis: [0.141, 0.86, 0.596], yaw: -38, lean: 8, L: { x: 0.182, z: 0.616, y: 0.082, yaw: 4 }, R: { x: 0.021, z: 0.794, y: 0.599, yaw: -32, pitch: -65, kp: [-0.048, 0.331, 0.942] }, hL: [0.311, -0.352, 0.268], hR: [0.045, -0.29, 0.435], eL: [0.004, -0.593, -0.092], eR: [-0.5, -0.5, 0.3], oL: 1, oR: 1, pL: [-1, 0, 0], pR: [1, 0, 0], w: [1, 0] };
  // Knie zurück: wie das Anheben, die Hände tiefer
  const HZ_AB = M(HZ_CH, { hL: [0.168, -0.09, 0.52], hR: [-0.1, -0.084, 0.531] });
  D['tc:hiza-geri'] = M({ keys: [{ t: 0, p: HZ_A }, { t: 0.121, p: HZ_A }, { t: 0.296, p: HZ_CH }, { t: 0.346, p: HZ_CH }, { t: 0.543, p: HZ_HIT, e: 'kime' }, { t: 0.618, p: HZ_HIT }, { t: 0.738, p: HZ_AB }, { t: 0.917, p: HZ_A }], best: 0.543, dur: 2 }, M(hit('kneeR', 'Knie'), { eff: 'kneeR', view: 'side3' }));
  // Mawashi-hiza-geri: Kniestoß im Bogen. Anfang wie der Mawashi-geri (dessen Bilder): aus Hidari Zenkutsu-dachi zieht das
  // rechte Knie seitlich hoch, das Bein schwenkt um die Hüfte nach vorn, der Standfuß dreht auf dem Ballen mit. Statt den
  // Unterschenkel auszuschnappen, bleibt das Bein fest gebeugt (Ferse am Gesäß, Fuß und Zehen zum Schienbein angezogen)
  // und die Hüfte dreht weit ein: das Knie stößt im schräg ansteigenden Bogen von der Seite ins Ziel vor dem Körper –
  // dort steht das Bild kurz. Der Oberkörper kippt leicht vom Ziel weg, die Deckung bleibt. Derselbe Weg zurück.
  const MH_HIT = (() => {
    const p = E.full(M(MW_MID, { pelvis: [0.1, 0.8, 0.62], yaw: 105, look: 5, L: { yaw: 100 }, R: { x: -0.28, y: 0.9, z: 0.91, kp: [0.3, 0.2, 1], tu: 1 } }));
    // Fuß rechtwinklig angezogen: Zehen in Richtung der Kniescheibe, Sohle in Richtung des Unterschenkels
    const [a, n] = UM_BEIN(E.solve(p), p.R.kp);
    return M(p, { R: { yaw: (Math.atan2(n[0], n[2]) * 180) / Math.PI, pitch: (Math.asin(n[1]) * 180) / Math.PI, sole: a } });
  })();
  const MH_KEYS = [{ t: 0, p: MW_A }, { t: 0.1, p: MW_A }, { t: 0.175, p: MW_UP, e: 'fl' }, { t: 0.25, p: MW_CH, e: 'fl' }, { t: 0.31, p: MH_HIT, e: 'kime' }, { t: 0.41, p: MH_HIT },
    { t: 0.48, p: MW_CH, e: 'fl' }, { t: 0.57, p: MW_UP, e: 'fl' }, { t: 0.69, p: MW_A, e: 'fl' }];
  D['tc:mawashi-hiza-geri'] = M({ keys: MH_KEYS, fix: UM_FOLGT(MH_KEYS), best: 0.31, dur: 2, eff: 'kneeR', cam: { yaw: -16, pitch: 14 } }, hit('kneeR', 'Knie'));
  // Fumikomi wie in Heian Sandan 12: Füße geschlossen, das linke Bein trägt, rechtes Knie hoch vor den Körper,
  // dann stampft der Fuß mit der Fußkante zur rechten Seite, der Körper senkt sich mit in Kiba-dachi (Blick zur Seite)
  const FU0 = M(KB, { look: -90, pelvis: [0.35, 0.88, 0], L: { x: 0.42, kp: [0.3, 0, 1] }, R: { x: 0.26, z: 0, yaw: -5, kp: [-0.3, 0, 1] } });
  // Knie hoch angezogen, kurz oben halten, dann fällt der Fuß schnell und hart; beim Aufsetzen sackt der Körper
  // kurz tiefer als im Kiba-dachi und federt in den Stand zurück. Stoßringe am Boden: Zeichen 'stampf' (figur-app.js).
  // Kamera von rechts vorn, damit die rote Fußkante (Außenkante des rechten Fußes) zu sehen ist
  const FU1 = BAL(M(KB, { look: -90, pelvis: [0.38, 0.85, 0], L: { x: 0.42, kp: [0.4, 0.1, 1] }, R: { x: 0.25, z: 0.22, y: 0.62, yaw: -20, pitch: -30, kp: [-0.3, 0.6, 1] }, w: [1, 0] }), 'L');
  const FU2 = M(KB, { look: -90, pelvis: [0, 0.645, 0], R: { y: 0.09, yaw: -5 }, w: [0.4, 0.6] });
  D['tc:fumikomi'] = M({ keys: [{ t: 0, p: FU0 }, { t: 0.15, p: FU0 }, { t: 0.34, p: FU1 }, { t: 0.38, p: FU1 }, { t: 0.44, p: FU2, e: 'kime' }, { t: 0.56, p: KB_K, e: 'out' }, { t: 0.74, p: KB_K }], best: 0.44, dur: 1.8, marks: ['stampf'] }, M(hit('heelR', 'Fußkante'), { eff: 'heelR', cam: { yaw: -55, pitch: 16 } }));
  // Namigaeshi: der Fuß federt in einem weichen Bogen nach innen hoch Richtung Unterbauch (Sohle nach oben innen)
  // und setzt gleich wieder ab – fließend, ohne Halt
  const NG1 = M(KB, { pelvis: [0.08, 0.72, 0], R: { x: -0.18, z: 0.12, y: 0.3, yaw: 30, pitch: -15, sole: [1, 0.3, 0], kp: [-1, 0.4, 0.5] }, w: [1, 0] });
  const NG2 = M(KB, { pelvis: [0.1, 0.74, 0], R: { x: -0.04, z: 0.18, y: 0.42, yaw: 40, pitch: -10, sole: [1, 0.5, 0], kp: [-1, 0.5, 0.6] }, w: [1, 0] });
  // Zackig: das Bein wird in 0,18 s hochgerissen (fließend über NG1, harter Stopp oben), hält 0,25 s und schnellt
  // genauso schnell in den Kiba-dachi zurück (Dauer 1,8 → t 0,1 = 0,18 s). Blick beim Hochreißen zur Seite (im Bewegungs-Editor eingestellt)
  D['tc:namigaeshi'] = M({ keys: [{ t: 0, p: KB }, { t: 0.1, p: KB }, { t: 0.16, p: M(NG1, { look: -80 }), e: 'fl' }, { t: 0.2, p: M(NG2, { look: -80 }), e: 'kime' }, { t: 0.34, p: M(NG2, { look: -80 }) }, { t: 0.38, p: NG1, e: 'fl' }, { t: 0.44, p: KB, e: 'kime' }, { t: 0.56, p: KB }], best: 0.2, dur: 1.8 }, M(hit('heelR', 'Fußsohle'), { eff: 'heelR', view: 'front' }));
  // Nidan-geri wie in Kanku Dai 65: aus Migi Zenkutsu-dachi, beide Fäuste vor der Brust (Ende von 64). Das hintere (linke)
  // Bein schwingt vor und tritt zuerst (Mae-geri Chudan), das rechte Bein stößt dabei ab. In der Luft wechseln die Beine:
  // der linke Fuß schnappt zurück, der rechte tritt am höchsten Punkt weit nach vorn. Der linke Fuß landet zuerst, der rechte setzt
  // vorn ab in Migi Zenkutsu-dachi – im selben Augenblick trifft der Migi Uraken Tate-mawashi-uchi (Hände und Füße enden
  // zugleich); die linke Hand greift nach vorn und zieht zur Hüfte.
  // Damit der Sprung nicht schwebt, folgt die Hüfte einer gerechneten Bahn (ND_BAHN, Zeiten in Sekunden): tief anlaufen,
  // mit dem Standbein beschleunigen, ab dem Absprung eine Wurfparabel (Erdbeschleunigung), nach der Landung abfedern.
  // Die Schlüsselbilder liegen auf dieser Bahn; dazwischen setzt ND_FIX die Hüfte genau darauf und nimmt die Füße mit,
  // die in der Luft sind. Der Absprungfuß rollt bis zuletzt über den Ballen ab, der Landefuß setzt mit dem Ballen auf.
  // Abgespielt wird 1,3-mal langsamer (Zeitlupe zum Mitsehen), und beim zweiten Tritt steht das Bild kurz (ND_HALT);
  // beides im Bewegungs-Editor eingestellt. Die Bahn rechnet weiter in echten Sekunden (ND_DUR).
  const ND_DUR = 2.3;
  const ND_LUPE = 1.3;
  const ND_HALT = 0.05; // Halten beim zweiten Tritt (Sekunden der Bahn, abgespielt 0,065 s)
  const ND_WEG = 2.0; // so weit wandert der Stand nach vorn (in Kanku Dai 64 → 65 rund zwei Standlängen)
  const ND_G = 9.81;
  const ND_T = { los: 0.35, tief: 0.58, ab: 0.78 }; // Halten bis „los“, Gewicht vor bis „tief“, Absprung bei „ab“
  const ND_AB = { p: [-0.06, 1.0, 0.76], hoch: 0.32 }; // Hüfte beim Absprung, Steighöhe bis zum Scheitel
  const ND_LAND_Y = 0.9; // Hüfthöhe, wenn der linke Fuß aufsetzt
  const ND_VY = Math.sqrt(2 * ND_G * ND_AB.hoch);
  ND_T.oben = ND_T.ab + ND_VY / ND_G;
  ND_T.auf = ND_T.oben + Math.sqrt((2 * (ND_AB.p[1] + ND_AB.hoch - ND_LAND_Y)) / ND_G);
  ND_T.ende = ND_T.auf + 0.16; // der rechte Fuß setzt kurz nach dem linken auf
  const ND_FLUG = ND_T.auf - ND_T.ab;
  const ND_START = M(mirror(S.zks), { hR: [0.03, -0.13, 0.29], hL: [-0.05, -0.15, 0.25], eR: [-0.5, -0.8, 0.2], eL: [0.5, -0.8, 0.2] });
  const ND_HANMI = M(MZK, { chest: -14 });
  const ND_ENDE = move(M(ND_HANMI, { hL: L(H.hip), hR: aim(ND_HANMI, [-0.03, 0.07, 0.48]), eR: [-0.25, -0.7, 0.25], pR: [0, 0.25, -1] }), 0, ND_WEG);
  const ND_LP = [0.04, ND_LAND_Y, ND_ENDE.L.z + 0.38]; // Hüfte beim Aufsetzen: schon weit vor dem linken Fuß, der rechte fängt gleich vorn ab
  const ND_V = [(ND_LP[0] - ND_AB.p[0]) / ND_FLUG, 0, (ND_LP[2] - ND_AB.p[2]) / ND_FLUG]; // waagerechtes Tempo im Flug
  // Bahnstücke am Boden: Ort und Tempo an den Enden gegeben (kubisch dazwischen)
  const ND_KNOTEN = [
    { s: ND_T.los, p: ND_START.pelvis, v: [0, 0, 0] },
    { s: ND_T.tief, p: [-0.05, 0.79, 0.47], v: [-0.05, 0.6, 1.5] },
    { s: ND_T.ab, p: ND_AB.p, v: [ND_V[0], ND_VY, ND_V[2]] },
    { s: ND_T.auf, p: ND_LP, v: [ND_V[0], ND_VY - ND_G * ND_FLUG, ND_V[2]] },
    { s: ND_T.ende, p: ND_ENDE.pelvis, v: [0, 0, 0] },
  ];
  function ND_BAHN(s) {
    if (s <= ND_T.los) return ND_START.pelvis.slice();
    if (s >= ND_T.ende) return ND_ENDE.pelvis.slice();
    if (s > ND_T.ab && s < ND_T.auf) {
      const d = s - ND_T.ab;
      return [ND_AB.p[0] + ND_V[0] * d, ND_AB.p[1] + ND_VY * d - 0.5 * ND_G * d * d, ND_AB.p[2] + ND_V[2] * d];
    }
    const i = ND_KNOTEN.findIndex((k) => k.s >= s);
    const [a, b] = [ND_KNOTEN[i - 1], ND_KNOTEN[i]];
    const T_ = b.s - a.s;
    const u = (s - a.s) / T_;
    const [u2, u3] = [u * u, u * u * u];
    return a.p.map((_, j) => (2 * u3 - 3 * u2 + 1) * a.p[j] + (u3 - 2 * u2 + u) * T_ * a.v[j] + (-2 * u3 + 3 * u2) * b.p[j] + (u3 - u2) * T_ * b.v[j]);
  }
  // Fuß auf dem Ballen: Ferse angehoben (Neigung in Grad, negativ = Zehen unten), der Ballen bleibt am Platz des flachen Fußes F
  function ND_BALLEN(F, pitch) {
    const a = (pitch * Math.PI) / 180;
    const y = ((F.yaw || 0) * Math.PI) / 180;
    const [vor, tief] = [0.12, 0.048];
    const f = vor * (1 - Math.cos(a)) - tief * Math.sin(a);
    return { x: F.x + Math.sin(y) * f, z: F.z + Math.cos(y) * f, y: 0.075 - tief * (1 - Math.cos(a)) - vor * Math.sin(a), yaw: F.yaw, pitch, tu: Math.min(1, -pitch / 35) };
  }
  const ND_RAMPE = (v) => { const u = Math.max(0, Math.min(1, v)); return u * u * (3 - 2 * u); };
  // Absprungfuß (rechts): bis kurz vor dem Abdrücken flach, dann hebt die Ferse bis zum Absprung
  const ND_R_STAND = (s) => ND_BALLEN(ND_START.R, -48 * Math.pow(ND_RAMPE((s - (ND_T.tief - 0.1)) / (ND_T.ab - ND_T.tief + 0.1)), 1.4));
  // Landefuß (links): setzt mit dem Ballen auf, die Ferse senkt sich gleich danach
  const ND_L_STAND = (s) => ND_BALLEN(ND_ENDE.L, -28 * (1 - ND_RAMPE((s - ND_T.auf) / 0.12)));
  // Fuß in der Luft: Lage bezogen auf die Hüfte zur Zeit s (dz nach vorn, dy nach oben)
  const ND_FUSS = (s, side, dz, dy, o) => { const b = ND_BAHN(s); return M({ x: b[0] + (side === 'L' ? 0.1 : -0.09), y: b[1] + dy, z: b[2] + dz, yaw: 0 }, o); };
  const ND_ARME = { hR: [-0.1, -0.15, 0.28], hL: [0.1, -0.15, 0.28], eR: [-0.5, -0.8, 0.1], eL: [0.5, -0.8, 0.1] };
  const ND_BILD = (s, o) => M(ND_START, ND_ARME, { pelvis: ND_BAHN(s), w: [0, 0] }, o);
  const ND_S = { vorbei: ND_T.tief, knie: ND_T.ab - 0.1, wechsel: ND_T.ab + 0.13, knie2: ND_T.ab + 0.2, tritt: ND_T.oben + 0.03, zurueck: ND_T.oben + 0.14, schritt: ND_T.auf + 0.08 };
  const ND_TRITT = ND_BILD(ND_S.tritt, { lean: -10, yaw: 12, hR: [-0.14, -0.2, 0.24], hL: [0.14, -0.2, 0.24], L: ND_FUSS(ND_S.tritt, 'L', 0.04, -0.52, { pitch: -60, kp: [0, 0.3, 1], tu: 0 }), R: ND_FUSS(ND_S.tritt, 'R', 0.905, -0.116, { yaw: -8, pitch: 48, kp: [0.1, 0.8, -0.5], tu: 1 }) });
  // Zeit im Ablauf (mit Halten) ↔ Zeit der Bahn: nach dem Tritt liegt alles um ND_HALT später
  const ND_NACH = (s) => (s > ND_S.tritt ? s + ND_HALT : s);
  const ND_VOR = (a) => (a <= ND_S.tritt ? a : Math.max(ND_S.tritt, a - ND_HALT));
  const ND_KEYS = [
    { s: 0, p: ND_START },
    { s: ND_T.los, p: ND_START },
    // linker Fuß löst sich und zieht am Standbein vorbei, Gewicht ganz auf dem rechten Bein
    { s: ND_S.vorbei, p: ND_BILD(ND_S.vorbei, { lean: 6, yaw: -6, R: ND_R_STAND(ND_S.vorbei), L: ND_FUSS(ND_S.vorbei, 'L', -0.3, -0.5, { pitch: -60, kp: [0, 0.1, 1], tu: 0 }), w: [0, 1] }) },
    // linkes Knie hoch, das rechte Bein streckt sich
    { s: ND_S.knie, p: ND_BILD(ND_S.knie, { lean: 3, yaw: -12, R: ND_R_STAND(ND_S.knie), L: ND_FUSS(ND_S.knie, 'L', 0.26, -0.4, { pitch: -50, kp: [0, 0.7, 1], tu: 1 }), w: [0, 1] }) },
    // erster Tritt (links, Chudan) im Absprung: rechter Fuß drückt über den Ballen ab
    { s: ND_T.ab, p: ND_BILD(ND_T.ab, { lean: -4, yaw: -14, R: ND_R_STAND(ND_T.ab), L: ND_FUSS(ND_T.ab, 'L', 0.885, 0.03, { pitch: 36, kp: [0, 1, 0.3], tu: 1 }), w: [0, 1] }) },
    // Beinwechsel in der Luft: links schnappt zurück, rechtes Knie schwingt hoch
    { s: ND_S.wechsel, p: ND_BILD(ND_S.wechsel, { lean: -2, yaw: -4, L: ND_FUSS(ND_S.wechsel, 'L', 0.36, -0.36, { pitch: -35, kp: [0, 0.7, 1], tu: 1 }), R: ND_FUSS(ND_S.wechsel, 'R', 0.02, -0.6, { pitch: -65, kp: [0, 0.4, 1], tu: 1 }) }) },
    { s: ND_S.knie2, p: ND_BILD(ND_S.knie2, { lean: -4, yaw: 4, L: ND_FUSS(ND_S.knie2, 'L', 0.2, -0.5, { pitch: -50, kp: [0, 0.5, 1], tu: 0.5 }), R: ND_FUSS(ND_S.knie2, 'R', 0.27, -0.36, { pitch: -50, kp: [0, 0.7, 1], tu: 1 }) }) },
    // zweiter Tritt (rechts) am höchsten Punkt, weit nach vorn gestreckt, das linke Bein ist angezogen; das Bild steht kurz
    { s: ND_S.tritt, p: ND_TRITT },
    { a: ND_S.tritt + ND_HALT, p: ND_TRITT }, // a: Zeit im Ablauf (schon mit Halten)
    // rechtes Bein schnappt zurück (Knie bleibt hoch), das linke streckt sich zum Boden; die rechte Faust steigt vor dem
    // Gesicht hoch, die linke Hand greift nach vorn
    { s: ND_S.zurueck, p: ND_BILD(ND_S.zurueck, { lean: -3, yaw: 18, hR: [0.04, 0.08, 0.2], eR: [-0.6, -0.5, 0.5], pR: [0.6, 0, -0.8], hL: [0.06, -0.12, 0.42], oL: 1, pL: [-1, 0, 0], L: ND_FUSS(ND_S.zurueck, 'L', -0.12, -0.72, { yaw: 16, pitch: -45, kp: [0.2, 0.2, 1], tu: 0 }), R: ND_FUSS(ND_S.zurueck, 'R', 0.38, -0.24, { pitch: -35, kp: [0, 0.7, 1], tu: 1 }) }) },
    // linker Fuß setzt hinten mit dem Ballen auf, der rechte ist schon vorn unterwegs; rechte Faust über der Stirn, linke Hand vorn
    { s: ND_T.auf, p: ND_BILD(ND_T.auf, { lean: 2, yaw: 30, chest: -8, hR: [-0.05, 0.34, 0.1], eR: [-0.7, 0.1, 0.7], pR: [0.8, 0, -0.6], hL: [-0.08, -0.1, 0.5], oL: 1, pL: [-1, 0, 0], L: ND_L_STAND(ND_T.auf), R: ND_FUSS(ND_T.auf, 'R', 0.58, -0.56, { yaw: -4, pitch: -8, kp: [0, 0.6, 1], tu: 0.6 }), w: [1, 0] }) },
    // rechter Fuß greift flach nach vorn, die Faust schlägt im senkrechten Kreis herab, die linke Hand zieht zurück
    { s: ND_S.schritt, p: ND_BILD(ND_S.schritt, { lean: 2, yaw: 36, chest: -12, hR: [-0.12, 0.3, 0.3], eR: [-0.3, -0.3, 0.7], pR: [0.4, 0.2, -0.9], hL: [0.14, -0.2, 0.3], L: ND_L_STAND(ND_S.schritt), R: { x: ND_ENDE.R.x, y: 0.17, z: ND_ENDE.R.z - 0.1, yaw: -4, pitch: 4, kp: [0, 0.4, 1], tu: 0.4 }, w: [1, 0] }) },
    { s: ND_T.ende, p: ND_ENDE, e: 'kime' },
  ].map((k, i) => Object.assign({ t: (k.a != null ? k.a : ND_NACH(k.s)) / ND_DUR, p: k.p }, i > 1 ? { e: k.e || 'fl' } : {})); // nach dem Halten fließend durch alle Bilder
  const ND_FIX = (P, t) => {
    const s = ND_VOR(t * ND_DUR);
    if (s <= ND_T.los || s >= ND_T.ende) return P;
    const b = ND_BAHN(s);
    const mit = (F) => ({ x: F.x + b[0] - P.pelvis[0], y: F.y + b[1] - P.pelvis[1], z: F.z + b[2] - P.pelvis[2] });
    return M(P, { pelvis: b, R: s <= ND_T.ab ? ND_R_STAND(s) : mit(P.R), L: s >= ND_T.auf ? ND_L_STAND(s) : mit(P.L) });
  };
  D['tc:nidan-geri'] = M({ keys: ND_KEYS, fix: ND_FIX, best: ND_S.tritt / ND_DUR, dur: ND_DUR * ND_LUPE, eff: 'toeR', cam: { yaw: -70, pitch: 10 } }, hit('toeR', 'zweiter Tritt'));

  /* ---------- Fußfeger ---------- */
  // Fußfeger (Ashi-barai): weiter unten bei „Mit Partner“

  /* ---------- Haltungen ---------- */
  D['tc:chudan-kamae'] = STILL(M(S.zk, { pelvis: [0, 0.76, 0.06], L: { z: 0.5 }, R: { z: -0.42 }, hL: [0.1, -0.12, 0.42], hR: [-0.02, -0.22, 0.2] }), { view: 'side3' });
  D['tc:gedan-kamae'] = STILL(M(S.zk, { pelvis: [0, 0.76, 0.06], L: { z: 0.5 }, R: { z: -0.42 }, hL: L(H.gedan), hR: [-0.02, -0.22, 0.2] }), { view: 'side3' });
  D['tc:shuto-kamae'] = STILL(KK_SHUTO, { view: 'front3' });
  D['tc:koshi-kamae'] = STILL(M(S.hachiji, { hR: H.hip, hL: [-0.11, -0.33, 0.04], pL: [0, -1, 0] }), M(hit('fistR', 'Fäuste an der Hüfte'), { view: 'front3' }));
  D['tc:mizunagare-no-kamae'] = STILL(M(KB, { hL: L(H.hip), hR: [0.1, -0.22, 0.27], eR: [-0.7, -0.3, 0.4] }), { view: 'front3' });
  D['tc:hanmi'] = STILL(M(ZK_KAMAE), M(hit('shL', 'vordere Schulter'), { view: 'front3' }));
  D['tc:gyaku-hanmi'] = STILL(M(S.zk, { yaw: 35, R: { z: -0.45 }, hL: L(H.guardR), hR: H.guardF }), M(hit('shR', 'vordere Schulter'), { view: 'front3' }));
  D['tc:shizentai'] = STILL(M(S.hachiji), { view: 'front3' });
  D['tc:hikite'] = T(M(S.zks, { hL: L(H.chudan), hR: H.hip }), M(S.zks, { hL: L(H.hip), hR: H.chudan }), M(hit('fistL', 'Hikite'), { eff: 'fistL', view: 'front3' }));

  /* ---------- Begriffe ---------- */
  D['tc:yoi'] = T_RUHIG(S.musubi, S.hachiji, { view: 'front3' });
  const REI = M(S.musubi, { lean: 30, look: 0 });
  D['tc:rei'] = M({ keys: [{ t: 0, p: S.musubi }, { t: 0.15, p: S.musubi }, { t: 0.45, p: REI }, { t: 0.65, p: REI }, { t: 0.9, p: S.musubi }], best: 0.5, dur: 2.4, view: 'side' });
  // Füße im Seiza: Zehen nach hinten, Sohle oben – als ganz gestreckter Fuß (Neigung −180°) statt um 180° gedreht, damit er
  // beim Aufstehen über „Zehen nach unten“ in den Stand dreht (wie das Sprunggelenk) und nicht über die Seite umschlägt.
  // Sohle mit Anteil nach hinten: so läuft sie beim Überblenden über hinten (wird im Bild auf die Fußebene gelegt).
  const SEIZA = { pelvis: [0, 0.32, 0], yaw: 0, L: { x: 0.1, z: -0.08, y: 0.06, yaw: 0, pitch: -180, sole: [0, 1, -1], kp: [0, -1, 0.6] }, R: { x: -0.1, z: -0.08, y: 0.06, yaw: 0, pitch: -180, sole: [0, 1, -1], kp: [0, -1, 0.6] }, hL: [0.1, -0.58, 0.24], hR: [-0.1, -0.58, 0.24], oL: 1, oR: 1, pL: [0, 1, 0], pR: [0, 1, 0], w: [0, 0] };
  D['tc:seiza'] = STILL(SEIZA, { view: 'side3' });
  D['tc:mokuso'] = STILL(M(SEIZA, { look: 0, hL: [0.03, -0.46, 0.2], hR: [-0.03, -0.47, 0.18], pL: [0, -1, 0], pR: [0, -1, 0] }), { view: 'front3' });
  // Stehender Fuß: Sohle nach unten, mit Anteil nach hinten (Gegenstück zum Seiza-Fuß, im Bild genau nach unten)
  const SOHLE_STAND = (p, s) => V.sub([0, -1, 0], E.solve(E.full(p))['dir' + s]);
  const KNEEL_UP0 = M(SEIZA, { pelvis: [0, 0.5, 0.02], L: { x: 0.12, z: 0.38, y: 0.075, yaw: 0, pitch: 0, kp: [0, 0.3, 1] }, R: { z: -0.22 } });
  const KNEEL_UP = M(KNEEL_UP0, { L: { sole: SOHLE_STAND(KNEEL_UP0, 'L') } });
  const KI_END = M(S.heisoku, { L: { sole: SOHLE_STAND(S.heisoku, 'L') }, R: { sole: SOHLE_STAND(S.heisoku, 'R') } });
  D['tc:kiritsu'] = M({ keys: [{ t: 0, p: SEIZA }, { t: 0.15, p: SEIZA }, { t: 0.45, p: KNEEL_UP }, { t: 0.8, p: KI_END }], best: 0.45, dur: 2.2, view: 'side3' });
  const TURN0 = ZK_G;
  D['tc:mawatte'] = M({ keys: [{ t: 0, p: TURN0 }, { t: 0.15, p: TURN0 }, { t: 0.45, p: rotate(M(TURN0, { pelvis: [0, 0.76, 0.06] }), 90, [0, 0.06]) }, { t: 0.75, p: rotate(TURN0, 180, [0, 0.06]), e: 'kime' }], best: 1, dur: 2, view: 'front3', marks: ['turn'] });
  D['tc:kiai'] = M(D['mv:gyaku-zuki'], { marks: ['kiai'], hit: null });
  D['tc:kime'] = M(D['mv:gyaku-zuki'], { marks: ['kime'], hit: null });
  D['tc:sun-dome'] = M(T(ZK_G, M(S.zks, { hL: L(H.hip), hR: H.jodan })), { eff: 'fistR', view: 'side', marks: ['sundome'] });
  const SLIDE = (dz) => move(ZK_KAMAE, 0, dz);
  D['tc:yori-ashi'] = M({ keys: [{ t: 0, p: SLIDE(0) }, { t: 0.2, p: SLIDE(0) }, { t: 0.7, p: SLIDE(0.4), e: 'kime' }], best: 1, dur: 1.6, eff: 'ankleL', view: 'side3' });
  D['tc:suri-ashi'] = M(D['mv:oi-zuki'], { keys: [{ t: 0, p: ZK_KAMAE }, { t: 0.12, p: ZK_KAMAE }, { t: 0.5, p: M(OI_MID, { hL: L(H.guardF), hR: H.guardR }) }, { t: 0.82, p: M(OI_END, { hL: L(H.guardR), hR: H.guardF }), e: 'kime' }], hit: null });
  D['tc:tai-sabaki'] = M({ keys: [{ t: 0, p: M(S.hachiji, { hL: L(H.guardF), hR: H.guardR }) }, { t: 0.2, p: M(S.hachiji, { hL: L(H.guardF), hR: H.guardR }) }, { t: 0.7, p: M(S.hachiji, { pelvis: [-0.32, 0.86, -0.12], yaw: 25, L: { x: -0.12, z: -0.02, yaw: 30 }, R: { x: -0.52, z: -0.24, yaw: 0 }, hL: L(H.guardF), hR: H.guardR }), e: 'kime' }], best: 1, dur: 1.6, eff: 'ankleR', view: 'front', marks: ['line'] });

  /* ---------- Mit Partner (grau) ---------- */
  const OPP = (p, dz) => move(rotate(p, 180, [0, 0]), 0, dz);
  const FIGHT = M(S.zk, { pelvis: [0, 0.76, 0.06], L: { z: 0.5 }, R: { z: -0.42 }, hL: [0.1, -0.12, 0.42], hR: [-0.02, -0.22, 0.2] });

  /* ---------- Fußfeger mit Partner ---------- */
  // Partner gegenüber, danach Füße in Weltkoordinaten verschieben (der gefegte Fuß hebt ab, Gewicht aufs andere Bein)
  const UKE = (p, dx, dz) => move(rotate(p, 180, [0, 0]), dx, dz);
  const FKEYS = (tori, uke, best) => ({ keys: tori, partner: uke, best, dur: 2 });
  // Teisoku-ashi-barai: der hintere (rechte) Fuß kommt flach über den Boden nach vorn und fegt den vorderen Fuß des Partners
  // mit der Fußsohle von außen nach innen weg (beide Hidari-Kamae). Hüfte dreht ein, Standbein links.
  const TB_U0 = UKE(FIGHT, 0, 1.25);
  const TB_U1 = M(TB_U0, { pelvis: [0.06, 0.78, TB_U0.pelvis[2] + 0.03], lean: -6, roll: 8, L: { x: 0.06, z: 0.82, y: 0.17, yaw: 160, pitch: 10 }, w: [0, 1] });
  const TB_0 = FIGHT;
  const TB_1 = M(FIGHT, { pelvis: [0.03, 0.76, 0.18], yaw: -20, R: { x: -0.3, z: 0.2, y: 0.12, yaw: -15, pitch: 0, kp: [-0.4, 0.2, 1] }, w: [1, 0] });
  const TB_2 = M(FIGHT, { pelvis: [0.06, 0.77, 0.24], yaw: 0, lean: -6, R: { x: -0.25, z: 0.76, y: 0.1, yaw: 0, pitch: 5, sole: [1, -0.25, 0], kp: [-0.3, 0.3, 1] }, w: [1, 0] });
  const TB_3 = M(FIGHT, { pelvis: [0.07, 0.78, 0.28], yaw: 15, lean: -6, R: { x: -0.07, z: 0.8, y: 0.16, yaw: 10, pitch: 8, sole: [1, 0.25, 0], kp: [0, 0.3, 1] }, w: [1, 0] });
  const TB = M(FKEYS(
    [{ t: 0, p: TB_0 }, { t: 0.12, p: TB_0 }, { t: 0.4, p: TB_1, e: 'in' }, { t: 0.56, p: TB_2, e: 'lin' }, { t: 0.68, p: TB_3, e: 'kime' }],
    [{ t: 0, p: TB_U0 }, { t: 0.56, p: TB_U0 }, { t: 0.68, p: TB_U1, e: 'kime' }], 0.68), M(hit('heelR', 'Fußsohle'), { eff: 'heelR', view: 'side', yaw: -22, pitch: 12 }));
  D['tc:ashi-barai'] = TB;
  D['tc:teisoku-barai'] = TB;
  // Haisoku-ashi-barai: aus der Kampfstellung gleitet der hintere Fuß nach, dann schwingt der vordere (linke) Fuß im Bogen
  // von außen gegen den vorderen Fuß des Partners (Migi-Kamae) und fegt ihn mit dem Spann nach innen; Fußspitze gestreckt.
  const HB_U0 = UKE(mirror(FIGHT), -0.1, 1.4);
  const HB_U1 = M(HB_U0, { pelvis: [HB_U0.pelvis[0] - 0.06, 0.78, HB_U0.pelvis[2] + 0.03], lean: -6, roll: -8, R: { x: -0.02, z: 0.86, y: 0.2, yaw: 200, pitch: 10 }, w: [1, 0] });
  const HB_0 = FIGHT;
  const HB_1 = M(FIGHT, { pelvis: [-0.02, 0.75, 0.32], yaw: -30, R: { x: -0.13, z: -0.02 }, w: [0.4, 0.6] });
  const HB_2 = M(HB_1, { pelvis: [-0.06, 0.74, 0.4], yaw: -10, L: { x: 0.5, z: 0.76, y: 0.2, yaw: -20, pitch: -30, sole: [1, 0.2, 0.2], kp: [1, 0.4, 0.6] }, w: [0, 1] });
  const HB_3 = M(HB_2, { pelvis: [-0.06, 0.74, 0.42], yaw: -18, L: { x: 0.31, z: 0.9, y: 0.1, yaw: -15, pitch: -30, sole: [1, 0, 0.1] } });
  const HB_4 = M(HB_2, { pelvis: [-0.1, 0.74, 0.42], yaw: -40, L: { x: -0.08, z: 0.84, y: 0.18, yaw: -40, pitch: -25, sole: [1, 0.1, 0.4], kp: [0.6, 0.4, 1] } });
  D['tc:haisoku-barai'] = M(FKEYS(
    [{ t: 0, p: HB_0 }, { t: 0.1, p: HB_0 }, { t: 0.3, p: HB_1 }, { t: 0.46, p: HB_2, e: 'in' }, { t: 0.56, p: HB_3, e: 'lin' }, { t: 0.68, p: HB_4, e: 'kime' }],
    [{ t: 0, p: HB_U0 }, { t: 0.56, p: HB_U0 }, { t: 0.68, p: HB_U1, e: 'kime' }], 0.68), M(hit('toeL', 'Spann'), { eff: 'toeL', view: 'front3', yaw: -26, pitch: 7 }));
  // Komura-ashi-barai: einen Schritt hinein (links neben den vorderen Fuß des Partners), das rechte Bein schwingt außen an
  // dessen vorderem Bein vorbei und hakt es mit der Wade von hinten weg; die rechte Hand schiebt den Partner nach hinten.
  const KO_U0 = UKE(FIGHT, 0, 1.3);
  const KO_U1 = M(KO_U0, { pelvis: [0.02, 0.8, KO_U0.pelvis[2] + 0.12], lean: -16, L: { x: -0.2, z: 0.54, y: 0.3, yaw: 180, pitch: 20, kp: [0, 1, 0.3] }, w: [0, 1] });
  const KO_0 = FIGHT;
  const KO_1 = M(FIGHT, { pelvis: [0.02, 0.77, 0.28], yaw: -25, L: { x: 0.1, z: 0.66, y: 0.12 }, R: { z: -0.12 }, w: [0, 1] });
  const KO_2 = M(FIGHT, { pelvis: [0.03, 0.78, 0.6], yaw: -10, L: { x: 0.1, z: 0.86, yaw: 0 }, R: { x: -0.14, z: 0.14, y: 0.16, yaw: -10, pitch: 10 }, hR: [-0.04, -0.02, 0.44], w: [1, 0] });
  const KO_3 = M(KO_2, { pelvis: [0.03, 0.82, 0.66], yaw: 0, lean: -4, R: { x: -0.36, z: 1.1, y: 0.18, yaw: -10, pitch: 0, kp: [-0.3, 0.3, 1] }, hR: [-0.02, 0.02, 0.5] });
  const KO_4 = M(KO_2, { pelvis: [0.04, 0.85, 0.7], yaw: 8, lean: 10, R: { x: -0.24, z: 0.62, y: 0.22, yaw: 0, pitch: 10, kp: [0, 0, 1] }, hR: [0.0, 0.08, 0.55] });
  D['tc:komura-barai'] = M(FKEYS(
    [{ t: 0, p: KO_0 }, { t: 0.08, p: KO_0 }, { t: 0.22, p: KO_1 }, { t: 0.34, p: KO_2 }, { t: 0.52, p: KO_3, e: 'in' }, { t: 0.68, p: KO_4, e: 'kime' }],
    [{ t: 0, p: KO_U0 }, { t: 0.56, p: KO_U0 }, { t: 0.68, p: KO_U1, e: 'kime' }], 0.68), M(hit('kneeR', 'Wade'), { eff: 'ankleR', view: 'side', yaw: -32, pitch: 12 }));
  D['tc:maai'] = STILL(FIGHT, { partner: [{ t: 0, p: OPP(FIGHT, 2.3) }], view: 'side', marks: ['maai'] });
  D['tc:kogeki'] = M(D['mv:oi-zuki'], { keys: [{ t: 0, p: ZK_G }, { t: 0.15, p: ZK_G }, { t: 0.38, p: OI_MID, e: 'in' }, { t: 0.5, p: M(OI_END, { hR: H.jodan }), e: 'kime' }], partner: [{ t: 0, p: OPP(M(S.hachiji), 2.25) }], view: 'side' });
  D['tc:kogeki'] = TWIST(D['tc:kogeki'], 'R');
  D['tc:deai'] = M(T_RUHIG(FIGHT, M(S.zks, { pelvis: [0, 0.71, 0.12], hL: L(H.hip), hR: H.chudan })), { partner: [{ t: 0, p: OPP(ZK_G, 2.15) }, { t: 0.22, p: OPP(ZK_G, 2.15) }, { t: 0.62, p: OPP(M(OI_MID, { hR: [-0.05, 0.0, 0.4] }), 2.15) }], eff: 'fistR', view: 'side', hit: { at: 'fistR', text: 'Konter' } });
  D['tc:zanshin'] = STILL(M(S.zks, { hL: L(H.guardF), hR: H.guardR, look: 0 }), { partner: [{ t: 0, p: OPP(M(S.hachiji, { lean: -4 }), 1.7) }], view: 'side', marks: ['gaze'] });
  D['tc:bunkai'] = T_RUHIG(MZK, M(MZK, { hL: L(H.hip), hR: [0.06, 0.28, 0.22], eR: UP_OUT }), { partner: [{ t: 0, p: OPP(M(ZK_G, {}), 1.75) }, { t: 0.22, p: OPP(ZK_G, 1.75) }, { t: 0.62, p: OPP(M(OI_MID, { pelvis: [0, 0.71, 0.45], hR: [0.0, 0.05, 0.5], hL: L(H.hip) }), 1.75) }], eff: 'fistR', view: 'side', hit: { at: 'elbowR', text: 'Age-uke' } });

  /* ---------- Körperwaffen mit ganzer Figur ---------- */
  D['wp:hiji'] = STILL(MAE_ENPI, M(hit('elbowR', 'Ellbogen'), { view: 'side3', marks: ['ring:elbowR'] }));
  D['wp:hiza'] = STILL(HZ_HIT, M(hit('kneeR', 'Knie'), { view: 'side3', marks: ['ring:kneeR'] }));
  D['wp:zenwan'] = STILL(M(MZK, { hL: L(H.hip), hR: [-0.2, 0.0, 0.32], eR: DOWN_FWD }), M(hit('elbowR', 'Unterarm'), { view: 'front3', marks: ['arm:R'] }));

  /* ---------- Übersichten ---------- */
  D['fig:levels'] = STILL(M(S.hachiji, { hL: L(H.side), hR: H.side, oL: 1, oR: 1, fL: [0, -1, 0], fR: [0, -1, 0], pL: [-1, 0, 0], pR: [1, 0, 0] }), { view: 'front', marks: ['levels'] });
  D['fig:targets'] = STILL(M(S.hachiji, { hL: [0.3, -0.5, 0.06], hR: [-0.3, -0.5, 0.06], oL: 1, oR: 1, fL: [0, -1, 0], fR: [0, -1, 0], pL: [-1, 0, 0], pR: [1, 0, 0] }), { view: 'front', marks: ['targets'] });

  /* ---------- Hochgezogene Zehen bei Tritten mit dem Fußballen ---------- */
  // Sobald der Tretfuß in der Luft ist, sind die Zehen hochgezogen; beim Abstellen senken sie sich wieder.
  const KOSHI = { 'mv:mae-geri': 'R', 'tc:mae-geri-kekomi': 'R', 'tc:ren-geri': 'R', 'tc:sonoba-geri': 'R', 'tc:kizami-geri': 'L', 'mv:mawashi-geri': 'R' };
  Object.keys(KOSHI).forEach((id) => {
    D[id].keys = D[id].keys.map((k) => {
      const f = E.full(k.p);
      const up = {};
      KOSHI[id].split('').forEach((s) => { if (f[s].y > 0.15) up[s] = { tu: 1 }; });
      return Object.keys(up).length ? M(k, { p: M(k.p, up) }) : k;
    });
  });

  /* ---------- Trefferflächen (rot markiert) ---------- */
  // Fläche je Figur, „:LR“ = beide Seiten, sonst die Seite des Trefferpunkts. Lage der Flächen: figur-app.js (FL).
  const FLAECHE = {
    'mv:gyaku-zuki': 'seiken', 'mv:oi-zuki': 'seiken', 'tc:choku-zuki': 'seiken', 'tc:kizami-zuki': 'seiken', 'tc:tate-zuki': 'seiken',
    'tc:sanbon-zuki': 'seiken:LR', 'tc:ren-zuki': 'seiken:LR', 'tc:morote-zuki': 'seiken:LR', 'tc:kagi-zuki': 'seiken', 'tc:ura-zuki': 'seiken',
    'tc:age-zuki': 'seiken', 'tc:yama-zuki': 'seiken:LR', 'tc:awase-zuki': 'seiken:LR', 'tc:otoshi-zuki': 'seiken', 'tc:mawashi-zuki': 'seiken',
    'tc:nukite': 'fingerspitzen', 'tc:kogeki': 'seiken', 'tc:deai': 'seiken',
    'tc:uraken-uchi': 'uraken', 'tc:tettsui-uchi': 'tettsui', 'tc:shuto-uchi': 'shuto', 'tc:haito-uchi': 'haito', 'tc:teisho-uchi': 'teisho',
    'tc:enpi-uchi': 'ellbogen', 'tc:furi-enpi': 'ellbogen', 'tc:yoko-enpi': 'ellbogen', 'tc:mawashi-enpi': 'ellbogen', 'tc:age-enpi': 'ellbogen',
    'tc:otoshi-enpi': 'ellbogen', 'tc:ushiro-enpi': 'ellbogen', 'tc:hasami-uchi': 'innen:LR',
    'mv:age-uke': 'unterarm', 'mv:gedan-barai': 'unterarm', 'mv:soto-uke': 'unterarm', 'mv:uchi-uke': 'unterarm', 'tc:bunkai': 'unterarm',
    'tc:shuto-uke': 'shuto', 'tc:morote-uke': 'unterarm:L', 'tc:juji-uke': 'handgelenk:LR', 'tc:kakiwake-uke': 'unterarm:LR',
    'tc:te-nagashi-uke': 'handflaeche', 'tc:gedan-nagashi-uke': 'unterarm', 'tc:osae-uke': 'handflaeche',
    'tc:kake-uke': 'handgelenk', 'tc:sukui-uke': 'unterarm', 'tc:haiwan-uke': 'unterarm', 'tc:tsukami-uke': 'handflaeche',
    'tc:soto-nagashi-uke': 'unterarm', 'tc:uchi-nagashi-uke': 'unterarm',
    'tc:tate-shuto-uke': 'shuto', 'tc:teisho-uke': 'teisho', 'tc:teisho-awase-uke': 'teisho:LR', 'tc:uchiotoshi': 'unterarm', 'tc:manji-uke': 'unterarm:LR',
    'mv:mae-geri': 'koshi', 'tc:mae-geri-kekomi': 'koshi', 'tc:sonoba-geri': 'koshi', 'tc:kizami-geri': 'koshi', 'tc:ren-geri': 'koshi',
    'mv:yoko-geri': 'sokuto', 'tc:yoko-geri-keage': 'sokuto', 'mv:mawashi-geri': 'koshi', 'mv:ushiro-geri': 'kakato',
    'mv:mikazuki-geri': 'teisoku', 'tc:ura-mawashi-geri': 'teisoku', 'tc:ushiro-mawashi-geri': 'teisoku', 'tc:hiza-geri': 'hiza',
    'tc:mawashi-hiza-geri': 'hiza', 'tc:fumikomi': 'sokuto', 'tc:namigaeshi': 'teisoku', 'tc:nidan-geri': 'koshi:LR',
    'tc:teisoku-barai': 'teisoku', 'tc:haisoku-barai': 'haisoku', 'tc:komura-barai': 'wade',
    'wp:hiji': 'ellbogen', 'wp:hiza': 'hiza', 'wp:zenwan': 'unterarm',
  };
  /* ---------- Gestreckte Arme am Ende: überall nur ein minimaler Knick im Ellbogen ---------- */
  // Arme, die am Ende fast gestreckt sind (ab 97 %), und die hier genannten Schlag-/Abwehrarme werden auf 99 % gebracht
  const GESTRECKT = { 'tc:tettsui-uchi': 'R', 'tc:shuto-uchi': 'R', 'tc:haito-uchi': 'R', 'tc:tate-shuto-uke': 'L', 'tc:teisho-uke': 'R', 'tc:awase-zuki': 'L' };
  Object.keys(D).forEach((id) => {
    const d = D[id];
    if (!d.keys || d.still) return;
    const last = d.keys[d.keys.length - 1];
    const f = E.full(last.p);
    const upd = {};
    ['L', 'R'].forEach((sd) => {
      const h = f['h' + sd];
      const sh = [sd === 'L' ? 0.185 : -0.185, -0.035, 0];
      const r = Math.hypot(h[0] - sh[0], h[1] - sh[1], h[2] - sh[2]) / ARM;
      if (r >= 0.97 || (GESTRECKT[id] || '').includes(sd)) upd['h' + sd] = stretch(h, sd);
    });
    if (Object.keys(upd).length) last.p = M(last.p, upd);
  });

  // Feineinstellung der Fläche nur für diese Technik (aus dem Bewegungs-Editor, Reiter „Treffer“):
  // x, y, z Versatz im Körperteil-Rahmen (m), rot Drehung um Unterarm/Unterschenkel (°), r Größe (m) – siehe figur-app.js (FL)
  const FLAECHE_FEIN = {};
  Object.keys(FLAECHE).forEach((id) => {
    const h = D[id] && D[id].hit;
    if (!h) throw new Error(`Trefferfläche ohne Trefferpunkt: ${id}`);
    const [fl, sides] = FLAECHE[id].split(':');
    D[id].hit = M(h, Object.assign({ fl, sides: sides || h.at.slice(-1) }, FLAECHE_FEIN[id] ? { adj: FLAECHE_FEIN[id] } : {}));
  });

  /* ---------- Abläufe nur für die Kata als Figur (js/kata-figur.js) – stehen nicht im Lexikon ---------- */
  const KATA = {};
  // Mae-geri-keage Chudan (Heian Nidan 17, 20): wie der Mae-geri des Lexikons, Treffer aber in Bauchhöhe (Bild aus dem
  // Bewegungs-Editor, MG_KIME)
  KATA['mae-geri-chudan'] = M(D['mv:mae-geri'], { keys: D['mv:mae-geri'].keys.map((k) => (k.e === 'kime' ? { t: k.t, e: k.e, p: MG_KIME } : k)) });
  // Chudan-zuki zur Seite im Kokutsu-dachi (Heian Nidan 3, 6): die vordere Faust stößt in Standrichtung auf die Mittellinie,
  // die andere geht an die Hüfte; die Hüfte bleibt seitlich wie im Stand
  KATA['kokutsu-zuki'] = TWIST(T(M(S.kk, { hL: L(H.hip), hR: H.hip }), M(S.kk, { hL: stretch(punch(S.kk, 'L', CH), 'L'), hR: H.hip })), 'L');
  // Gyaku-zuki nach dem Mae-geri (Heian Nidan 18, 21): wie im Lexikon, Faust auf Chudan
  KATA['gyaku-zuki'] = D['mv:gyaku-zuki'];
  // Morote-uke im Zenkutsu-dachi (Heian Nidan 22): Arme wie im Lexikon, die Hüfte aber nur so weit seitlich wie im Zenkutsu-dachi
  KATA['morote-uke-zk'] = M(D['tc:morote-uke'], { keys: D['tc:morote-uke'].keys.map((k) => ({ t: k.t, e: k.e, p: M(k.p, { yaw: S.zk.yaw }) })) });

  // Yoko-geri-keage zusammen mit Uraken (Heian Nidan 7): Ablauf wie im Lexikon, der Tritt aber nur bis Brusthöhe – auf
  // Kopfhöhe (Lexikon) träfe das Bein den Arm, der gleichzeitig darüber zur selben Seite schlägt
  const YA_KATA = YGK(BAL(M(YA_CH, { pelvis: [0.3, 0.83, 0], yaw: 18, roll: 15, R: { x: -0.62, z: 0.12, y: 1.1, yaw: 0, pitch: 10, sole: [-0.8, -0.6, 0], kp: [-0.8, 0.4, 0.2] } }), 'L'));
  KATA['yoko-geri-keage'] = M(D['tc:yoko-geri-keage'], { keys: D['tc:yoko-geri-keage'].keys.map((k) => (k.e === 'kime' ? { t: k.t, e: k.e, p: YA_KATA } : k)) });

  // Heian Sandan 2, 3, 5, 6 im Heisoku-dachi: ein Arm Chudan Uchi-uke, der andere zugleich Gedan-uke. Ausholen über Kreuz –
  // die Uchi-uke-Faust unten an der anderen Hüfte, die Gedan-Faust oben an der anderen Schulter – dann fahren beide auseinander
  const UG = M(S.heisoku, { oL: 0, oR: 0 });
  KATA['uchi-gedan-uke'] = T(M(UG, { hR: [0.13, -0.3, 0.2], eR: [-0.5, -0.6, 0.5], hL: [-0.13, 0.08, 0.2], eL: [0.4, -0.8, 0.5] }),
    M(UG, { hR: [-0.22, 0.0, 0.3], eR: DOWN_FWD, hL: stretch([0.22, -0.52, 0.2], 'L') }));
  // Heian Sandan 9 im Kiba-dachi: Kentsui Chudan Uchi-mawashi-uchi zur linken Seite – die Faust holt vor der rechten
  // Schulter aus und schlägt im waagerechten Bogen nach außen, Arm fast gestreckt, Handrücken oben (die Kleinfingerseite trifft)
  KATA['kentsui-uchi-mawashi'] = T(M(KB, { look: 90, hL: [-0.14, -0.06, 0.2], eL: [0.6, -0.5, 0.6], pL: [0, -1, 0] }),
    M(KB, { look: 90, hL: stretch([0.6, -0.13, 0.06], 'L'), pL: [0, -1, 0] }));
  // Heian Sandan 11: Ryoken Ryokoshi-kamae – beide Fäuste auf den Hüften, Ellbogen zur Seite
  KATA['ryokoshi-kamae'] = STILL(M(UG, { hL: [0.2, -0.36, 0.05], eL: [1, -0.15, -0.1], hR: [-0.2, -0.36, 0.05], eR: [-1, -0.15, -0.1] }));
  // Heian Sandan 12, 14, 16: Furi-enpi aus dem Ryokoshi-kamae – die Fäuste bleiben an den Hüften, mit dem Aufsetzen des
  // Fußes (Fumikomi) schwingt der rechte Ellbogen von hinten seitlich nach vorn außen (Werte wie tc:furi-enpi)
  const FK = M(KB, { look: -90, hL: [0.2, -0.36, 0.05], eL: [1, -0.15, -0.1] });
  KATA['furi-enpi'] = { keys: [
    { t: 0, p: M(FK, { hR: [-0.21, -0.33, 0.03], eR: [-0.6, -0.8, -0.3] }) }, { t: 0.25, p: M(FK, { hR: [-0.21, -0.33, 0.03], eR: [-0.6, -0.8, -0.3] }) },
    { t: 0.32, p: M(FK, { hR: [-0.14, -0.25, 0.17], eR: [-0.7, 0.1, 0.75] }), e: 'in' },
    { t: 0.37, p: M(FK, { hR: [-0.2, -0.3, 0.08], eR: [-1, -0.15, 0.2] }), e: 'kime' },
  ] };
  // Heian Sandan 13, 15, 17: Uraken Tate-mawashi-uchi zur rechten Seite – die Faust steigt von der Hüfte vor der Brust
  // hoch und schlägt im senkrechten Bogen über Kopfhöhe nach außen herab; Treffer in Schulterhöhe, Ellbogen leicht gebeugt
  // und unten, Handrücken zum Ziel
  KATA['uraken-tate'] = FLOW([
    M(FK, { hR: [-0.2, -0.3, 0.08], eR: [-1, -0.15, 0.2] }),
    M(FK, { hR: [-0.1, -0.06, 0.2], eR: [-1, -0.3, 0.2], pR: [0.3, 0, -1] }),
    M(FK, { hR: [-0.3, 0.24, 0.1], eR: [-1, 0, 0], pR: [0.7, 0.5, -0.5] }),
    M(FK, { hR: [-0.63, -0.03, 0.05], eR: [-0.4, -1, 0], pR: [1, 0, 0] }),
  ], { eff: 'fistR' });
  // Heian Sandan 19, 20 im Kiba-dachi: die rechte Faust stößt über die linke Schulter nach hinten oben (Koho-tsukiage),
  // zugleich schlägt der linke Ellbogen nach hinten (Ushiro-enpi) – die linke Faust zieht dabei weit zurück an die Hüfte
  KATA['tsukiage-enpi'] = T(M(KB, { hL: [0.22, -0.3, 0.2], eL: [0.4, -1, 0.2], hR: H.hip }),
    M(KB, { hR: [0.2, 0.1, -0.03], eR: [-0.4, -0.5, 1], pR: [0, 0, 1], hL: [0.22, -0.33, -0.08], eL: [0.25, -0.2, -1] }));

  /* Heian Yondan */
  // Hizakutsu nach vorn gedreht (Bewegung 11) als Stand für die Kata – die Beine aus dem Lexikon-Bild
  S.hizaShomen = { pelvis: HZ.pelvis, yaw: 0, L: HZ.L, R: HZ.R, w: HZ.w };
  // 1, 2: Haiwan-uke mit offenen Händen
  KATA['haiwan-uke-offen'] = M(D['tc:haiwan-uke'], { keys: D['tc:haiwan-uke'].keys.map((k) => ({ t: k.t, e: k.e, p: M(k.p, { oL: 1, oR: 1 }) })) });
  // 3: Gedan Kosa-uke – beide Fäuste stoßen von der rechten Hüfte gekreuzt nach unten vor, rechtes Handgelenk über dem linken
  KATA['gedan-kosa-uke'] = T(M(S.zks, { hR: H.hip, hL: [-0.11, -0.33, 0.04], pL: [0, -1, 0] }),
    M(S.zks, { lean: 6, hL: [-0.04, -0.47, 0.36], hR: [0.04, -0.44, 0.38], eL: [1, -0.3, 0.2], eR: [-1, -0.3, 0.2] }));
  // 7, 10: Mae-enpi in die offene Hand (Sasho-ni Migi Mae-enpi) – die linke Hand steht offen vorn (sie hat gegriffen und
  // zieht heran), der rechte Ellbogen schlägt in ihre Handfläche
  KATA['mae-enpi-hand'] = T(M(S.zks, { oL: 1, hL: [0.1, -0.02, 0.6], pL: [-1, 0, 0], hR: H.hip }),
    M(MAE_ENPI, { oL: 1, hL: [-0.03, -0.1, 0.32], eL: [1, -0.6, 0.2], pL: [0, 0, -1], fL: [-1, 0.2, 0] }));
  // 11: Die linke Handkante fegt erst nach unten (Gedan-barai) und steigt dann zum Jodan-uke über die Stirn; dabei schlägt
  // der rechte Shuto vom Ohr im Bogen außen herum zum Hals (Endhaltung wie das Lexikon-Bild des Hizakutsu)
  const HZS = M(S.hizaShomen, { oL: 1, oR: 1 });
  const HZ_0 = M(HZS, { hL: [-0.12, 0.08, 0.2], hR: [-0.25, -0.2, 0.1] });
  KATA['jodan-uke-shuto-uchi'] = { keys: [{ t: 0, p: HZ_0 }, { t: 0.25, p: HZ_0 },
    { t: 0.6, p: M(HZS, { hL: stretch([0.2, -0.5, 0.25], 'L'), hR: [-0.28, 0.2, -0.05], pR: [0, -1, 0] }) },
    { t: 1, p: M(HZS, { hL: HZ.hL, eL: HZ.eL, pL: HZ.pL, fL: HZ.fL, hR: HZ.hR, eR: HZ.eR, pR: HZ.pR, fR: HZ.fR }), e: 'kime' }] };
  // 13: Uraken Tate-mawashi-uchi nach vorn im Kosa-dachi – die rechte Faust kommt über den Kopf und schlägt im senkrechten
  // Bogen nach vorn herab (Handrücken zum Ziel, Ellbogen unten), die linke Hand hat gegriffen und zieht an die Hüfte
  KATA['uraken-tate-mae'] = FLOW([
    M(S.kosa, { hL: [0.1, -0.05, 0.45], hR: [-0.02, 0.1, 0.16], eR: [-1, -0.2, 0.3] }),
    M(S.kosa, { hL: [0.16, -0.2, 0.25], hR: [-0.12, 0.32, 0.18], eR: [-0.7, 0, 0.8], pR: [0, -0.6, -0.8] }),
    M(S.kosa, { hL: L(H.hip), hR: [-0.1, 0.04, 0.5], eR: [-0.2, -1, 0.2], pR: [0, 0, -1] }),
  ], { eff: 'fistR' });

  /* Heian Godan */
  // 9 → 10: Ryosho Juji Chudan Osae-uke – die offenen Hände drücken rechts vor der Hüfte nach unten und liegen am Ende
  // aufeinander, Handballen auf Handballen: die rechte unten, Handrücken nach unten, Fingerspitzen nach vorn; die linke
  // darauf, Handrücken nach oben, Fingerspitzen nach rechts
  KATA['juji-osae-uke'] = T(M(S.zks, HANDS_HIP), M(S.zks, { oL: 1, oR: 1,
    hR: [-0.15, -0.23, 0.24], eR: [-1, -0.5, -0.3], pR: [0, 1, 0], fR: [0, 0, 1],
    hL: [-0.115, -0.195, 0.27], eL: [1, -0.4, 0.3], pL: [0, -1, 0], fL: [-1, 0, 0] }));
  // 13: Gedan-barai zur rechten Seite im Kiba-dachi – die Faust holt an der linken Schulter aus und fegt über das rechte Knie
  KATA['gedan-barai-kiba'] = T(M(KB, { look: -90, hR: [0.13, 0.08, 0.2], eR: [-0.4, -0.8, 0.5], hL: [0.3, -0.25, 0.25] }),
    M(KB, { look: -90, hR: stretch([-0.5, -0.5, 0.06], 'R') }));
  // 17: Morote-uke zur rechten Seite im Kosa-dachi (der Körper steht quer, Blick über die rechte Schulter): der rechte Arm
  // wehrt seitlich ab, die linke Faust stützt am rechten Ellbogen
  KATA['morote-uke-seite'] = T(M(S.kosa, { look: -90, hR: [0.15, -0.3, 0.15], eR: [-0.5, -0.6, 0.5], hL: L(H.hip) }),
    M(S.kosa, { look: -90, hR: [-0.5, -0.02, 0.1], eR: [-0.3, -1, 0], hL: [-0.24, -0.16, 0.16], eL: [0.6, -0.7, 0.4] }));
  // 18: Uken Uho-tsukiage im Renoji-dachi – die rechte Faust stößt nach rechts oben, der Oberkörper bleibt aufrecht. Die
  // linke Faust geht mit hoch und liegt am rechten Ellbogen: die Armhaltung des Morote-uke davor, nur beide nach oben
  KATA['uho-tsukiage'] = T(M(S.renoji, { yaw: 0, hR: H.hip, hL: L(H.hip) }),
    M(S.renoji, { yaw: 0, hR: stretch([-0.3, 0.62, 0.04], 'R'), hL: [-0.16, 0.22, 0.09], eL: [0.5, -0.7, 0.5] }));

  // 21, 23, erster Teil vor dem Manji-uke: Angriff im Zenkutsu-dachi, Hüfte gerade nach vorn – die rechte Handkante
  // schlägt nach vorn unten (Shuto Gedan-uchikomi), die linke offene Hand wehrt am rechten Ohr ab (Jodan Nagashi-uke).
  // Von hier geht nur noch das Gewicht nach hinten in den Kokutsu-dachi, die Arme fahren zum Manji-uke auseinander.
  KATA['nagashi-shuto-gedan'] = T(M(S.zks, { oL: 1, oR: 1, hL: [0.12, -0.1, 0.42], pL: [0, -1, 0], hR: [-0.22, 0.28, 0.02], eR: [-0.8, -0.5, 0.3], pR: [0, 0, 1] }),
    M(S.zks, { oL: 1, oR: 1, hL: [-0.13, 0.18, 0.12], eL: [-0.1, -0.2, 1], pL: [-1, 0, 0], hR: stretch([0.04, -0.46, 0.42], 'R'), pR: [1, 0, 0] }));

  /* Tekki Shodan */
  // Kreuzschritt (Hidari Ashi-mae Kosa: 1, 21; gespiegelt 7): das linke Bein steht ganz vor dem rechten – der linke Fuß
  // gut eine Fußlänge weiter vorn und rechts vom rechten. Das rechte Bein trägt und steht gerade darunter: sein Knie zeigt
  // nach vorn (nur wenig nach außen) und knickt nicht zur Seite weg; das linke kreuzt mit dem Knie nach vorn ganz vor dem
  // rechten Bein. Damit die Beine dabei nicht ineinander geraten, steht der linke Fuß so weit vorn und die Hüfte etwas
  // höher als im Kiba-dachi, aber nicht aufgerichtet (Tekki). Der Abstand nach vorn (L.z) gilt auch für die Füße der Kata
  // (KVOR).
  S.kosamae = { pelvis: [-0.08, 0.78, 0.1], L: { x: -0.18, z: 0.3, yaw: 0, kp: [0.6, 0.1, 1] }, R: { x: 0, z: 0, yaw: 0, kp: [-0.7, 0, 1] }, w: [0.1, 0.9] };
  // Yoi: Heisoku-dachi, beide Arme gestreckt, die offenen Hände mittig vor dem Körper genau übereinander – die rechte am
  // Körper, die linke Handfläche auf ihrem Rücken. Das Handgelenk bleibt gerade: die Finger zeigen in der Linie des Arms
  // (Schulter → Hand) schräg nach unten zur Mitte, die Handfläche zum Körper
  const yoiHand = (h, side) => {
    const hs = stretch(h, side);
    const f = V.norm(V.sub(hs, [side === 'L' ? 0.185 : -0.185, -0.035, 0]));
    const p = V.norm(V.sub([0, 0, -1], V.mul(f, -f[2])));
    return { ['h' + side]: hs, ['f' + side]: f, ['p' + side]: p };
  };
  KATA['yoi-kafukubu'] = STILL(M(S.heisoku, { oL: 1, oR: 1, ...yoiHand([0, -0.54, 0.27], 'R'), ...yoiHand([0, -0.54, 0.295], 'L') }));
  // Ausholen zum Kake-uke: die offene Hand oben vor der Brust, die Faust des anderen Arms darunter – mit so viel Abstand,
  // dass die Arme übereinander liegen, ohne ineinander zu geraten (im Lexikon, KU2, liegen sie dichter)
  const TK_KAKE = M(KU2, { hL: [-0.13, -0.02, 0.3], hR: [0.13, -0.2, 0.27] });
  // 2: Kake-uke zur Seite, schnell und groß zusammen mit dem Fumikomi – Ende wie im Lexikon
  KATA['kake-uke-seite'] = T(TK_KAKE, KU3);
  // 16: derselbe Kake-uke langsam und kraftvoll. Zum Ausholen bewegen sich beide Arme zugleich: Der rechte Unterarm (vom
  // Kagi-zuki) geht vor der Brust noch ein Stück weiter nach links, und der linke Arm wird vom Stoß nach links (Ende von
  // 15) unter ihm eng am Körper nach rechts geschoben, bis er gestreckt ganz nach rechts zeigt – die Hand öffnet sich
  // dabei. Von dort zieht er langsam zur linken Seite in den Kake-uke, die rechte Faust an die Hüfte. Der Blick bleibt
  // links (das Lexikon beginnt mit den Fäusten an den Hüften, wie in Heian Godan 14)
  const TK_LINKS = M(KB, { look: 90, sL: 1, hL: stretch([0.74, -0.1, 0.04], 'L'), hR: [0.07, -0.2, 0.3], eR: [-0.7, -0.25, 0.3] });
  const TK_AN = M(KB, { look: 90, hL: [0.17, -0.3, 0.2], eL: [0.5, -0.8, -0.2], pL: [0, -1, 0], hR: [0.12, -0.17, 0.3], eR: [-0.75, -0.2, 0.25] });
  const TK_MITTE = M(KB, { look: 90, oL: 1, hL: [-0.04, -0.31, 0.22], eL: [0.4, -0.9, 0.2], pL: [0, -1, 0], hR: [0.16, -0.15, 0.29], eR: [-0.8, -0.15, 0.2] });
  const TK_RECHTS = M(KB, { look: 90, sL: 1, oL: 1, hL: stretch([-0.36, -0.3, 0.22], 'L'), pL: [0, -1, 0], fL: [-1, 0, 0.2], hR: [0.18, -0.14, 0.28], eR: [-0.8, -0.15, 0.2] });
  const TK_ZURUECK = M(KB, { look: 90, oL: 1, hL: [0.25, -0.1, 0.38], eL: [0.3, -1, 0.1], pL: [-0.3, 0, 0.9], fL: [0.1, 1, 0], hR: [-0.1, -0.28, 0.16], eR: [-0.6, -0.8, 0] });
  KATA['kake-uke-langsam'] = { keys: [{ t: 0, p: TK_LINKS }, { t: 0.06, p: TK_AN }, { t: 0.11, p: TK_MITTE }, { t: 0.17, p: TK_RECHTS },
    { t: 0.21, p: TK_RECHTS }, { t: 0.36, p: TK_ZURUECK }, { t: 0.5, p: KU3 }] };
  // 3, 17: Mae-enpi zur Seite in die offene Hand – die Hand steht vom Kake-uke noch seitlich draußen, Hüfte und Oberkörper
  // drehen zu ihr ein und der Ellbogen schlägt in ihre Handfläche (Arme zur Brust wie beim Mae-enpi in Heian Yondan); die
  // Füße bleiben im Kiba-dachi
  KATA['mae-enpi-seite'] = T(KU3, M(KB, { look: 90, yaw: 32, chest: 30, hR: MAE_ENPI.hR, eR: MAE_ENPI.eR, oL: 1, hL: [-0.03, -0.1, 0.32], eL: [1, -0.6, 0.2], pL: [0, 0, -1], fL: [-1, 0.2, 0] }));
  // 4, 14, 18, 28: Ryoken Koshi-kamae – die rechte Faust an der Hüfte (Handrücken unten), die linke genau darauf
  // (Handrücken oben); der linke Unterarm liegt vor dem Bauch am Körper an. Damit er anliegt und nicht im Körper steckt,
  // stehen die Fäuste etwas vor der Hüfte (im Lexikon direkt an der Hüfte)
  KATA['koshi-kamae-tekki'] = STILL(M(KB, { hR: [-0.205, -0.34, 0.11], pR: [0, 1, 0], hL: [-0.165, -0.26, 0.17], eL: [0.3, -0.3, 1], pL: [0, -1, 0] }));
  // 8, 22: Chudan Uchi-uke im Kiba-dachi, Körper gerade nach vorn (Ende wie der Beginn des Uchi-nagashi-uke im Lexikon)
  KATA['uchi-uke-kiba'] = T(M(KB, { hL: [0.1, -0.15, 0.4], hR: [0.12, -0.2, 0.25], eR: [-0.5, -0.6, 0.5] }), UN1);
  // 9, 23: erst Uchi-nagashi-uke Jodan links mit Gedan-uke rechts (Ablauf des Lexikons), dann schlägt die linke Faust als
  // Uraken nach vorn auf Gesichtshöhe (Faust gerade, Handrücken zum Ziel); der rechte Unterarm kommt waagerecht vor die
  // Brust, die rechte Faust liegt unter dem linken Ellbogen (Suihei-kamae)
  const TK_URAKEN = M(KB, { hL: [0.08, 0.07, 0.42], eL: [0.2, -1, 0.1], pL: [0, 0.3, -1], hR: [0.075, -0.2, 0.2], eR: [-1, -0.1, 0.3], pR: [0, -1, 0] });
  KATA['nagashi-uraken'] = { keys: D['tc:uchi-nagashi-uke'].keys.concat([{ t: 0.58, p: UN2 }, { t: 0.78, p: TK_URAKEN, e: 'kime' }]) };
  // 11, 25: Unterarm-Abwehr zur eigenen Seite – die Arme bleiben, wie sie nach dem Uraken stehen (Faust unter dem Ellbogen),
  // Hüfte und Oberkörper drehen zur Seite der Abwehr und der Unterarm steht dabei aufrecht
  KATA['zenwan-uke-gleich'] = T(TK_URAKEN, M(TK_URAKEN, { look: 90, yaw: 30, chest: 25, hL: [0.12, 0.06, 0.36] }));
  // 13, 27: derselbe Unterarm wehrt zur anderen Seite ab – Hüfte und Oberkörper drehen dorthin
  KATA['zenwan-uke-gegen'] = T(TK_URAKEN, M(TK_URAKEN, { look: -90, yaw: -30, chest: -25, hL: [0.03, 0.06, 0.38] }));
  // 15, 29: aus dem Koshi-kamae an der rechten Hüfte stößt die linke Faust zur linken Seite (Chudan), zugleich die rechte
  // als Kagi-zuki vor der Brust in dieselbe Richtung
  KATA['zuki-kagi-zuki'] = TWIST(T(M(KB, { look: 90, hR: H.hip, hL: [-0.11, -0.33, 0.04], pL: [0, -1, 0] }),
    M(KB, { look: 90, hL: stretch([0.74, -0.1, 0.04], 'L'), hR: [0.07, -0.2, 0.3], eR: [-0.7, -0.25, 0.3] })), 'L');

  SK.fig3dDefs = D;
  SK.fig3dKata = KATA;
  SK.fig3dPose = { M, mirror, rotate, move, S, H };
})();
