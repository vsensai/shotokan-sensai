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
      pelvis: mx(f.pelvis), yaw: -f.yaw, chest: -f.chest, lean: f.lean, roll: -f.roll, look: -f.look,
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
  const MAE_ENPI = M(S.zks, { hL: L(H.hip), hR: [0.08, -0.13, 0.17], eR: [-0.1, 0.1, 1] });
  D['tc:enpi-uchi'] = T(ZK_G, MAE_ENPI, M(hit('elbowR', 'Ellbogen'), { eff: 'elbowR', view: 'side3', yaw: 15 }));
  // Furi-enpi wie in der Kata (Heian Sandan): aus Hidari Zenkutsu-dachi trägt das linke Bein, das rechte Knie kommt hoch,
  // der Körper dreht sich nach links und der rechte Fuß stampft nach vorn in Kiba-dachi (rechte Seite vorn, Blick nach vorn).
  // Die rechte Faust bleibt an der Hüfte; mit dem Aufsetzen schwingt der Ellbogen im Bogen von hinten seitlich nach außen
  const FE = (p) => move(rotate(p, 90, [0, 0]), 0.12, 1.04);
  const FE_KB = M(KB, { look: -90 });
  const FE_UP = BAL(M({ pelvis: [0.06, 0.86, 0.62], yaw: 45, look: 0, L: { x: 0.12, z: 0.62, yaw: 35, kp: [0.4, 0, 1] },
    R: { x: 0.0, z: 0.78, y: 0.42, yaw: 70, pitch: -25, kp: [-0.2, 0.6, 1] }, hL: L(H.hip), hR: H.hip, w: [1, 0] }), 'L');
  D['tc:furi-enpi'] = M({ keys: [
    { t: 0, p: ZK_G }, { t: 0.12, p: ZK_G },
    { t: 0.42, p: FE_UP },
    { t: 0.56, p: FE(M(FE_KB, { R: { y: 0.06 }, hR: [-0.21, -0.33, 0.03], eR: [-0.6, -0.8, -0.3], w: [0.6, 0.4] })) },
    { t: 0.66, p: FE(M(FE_KB, { hR: [-0.2, -0.3, 0.08], eR: [-1, -0.15, 0.2], w: [0.5, 0.5] })), e: 'kime' },
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
  // Mawashi-enpi: aus der Hüfte kommt der Ellbogen seitlich hoch und schwingt waagerecht nach vorn, Faust endet vor der Brust
  D['tc:mawashi-enpi'] = FLOW([
    ZK_G,
    M(S.zks, { chest: -15, hL: L(H.hip), hR: [-0.34, -0.12, 0.02], eR: [-1, 0, -0.4] }),
    M(S.zks, { chest: 15, hL: L(H.hip), hR: [0.12, -0.04, 0.12], eR: [-0.25, 0, 1] }),
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
    M(S.kk, { hL: [0.32, 0.22, 0.3], eL: [0.5, -1, 0.2], hR: [-0.12, 0.24, 0.2], eR: [-1, -0.3, 0.1] }),
    M(S.kk, { hL: [0.02, 0.2, 0.36], eL: [0.3, -1, 0.4], hR: [-0.05, -0.02, 0.26], eR: [-1, -0.4, 0.2] }),
    M(S.kk, { hL: [-0.15, 0.1, 0.03], eL: [0.8, -0.8, 0.5], pL: [0, 0, -1], hR: [0.24, -0.18, 0.26], eR: [-0.1, -1, 0.2], pR: [0, 1, 0] }),
  ], M(hit('elbowL', 'Unterarm'), { hit: { t: 0.62 }, best: 0, eff: 'fistL', view: 'front', yaw: -100 }));
  // Uchi-nagashi-uke wie Tekki Shodan 9 (Teil 1) im Kiba-dachi, Blick nach vorn, aus dem rechten Uchi-uke (8): dort steht
  // der rechte Unterarm senkrecht vor der Körpermitte, die linke Faust liegt unter dem rechten Ellbogen. Der linke Unterarm
  // geht senkrecht von innen nach außen zur linken Seite hoch, Faust auf Kopfhöhe – die Rückseite (Haiwan) lenkt den
  // Jodan-Angriff nach außen ab; zugleich geht der rechte Arm nach unten zur rechten Seite (Gedan-uke)
  const UN0 = M(KB, { hR: [-0.03, 0.12, 0.3], eR: [-0.2, -1, 0.3], hL: [-0.04, -0.17, 0.27], eL: [1, -0.3, 0] });
  D['tc:uchi-nagashi-uke'] = FLOW([
    UN0,
    M(KB, { hL: [0.1, 0.12, 0.3], eL: [0.4, -1, 0.3], hR: [-0.16, -0.2, 0.26], eR: [-1, -0.4, 0.2] }),
    M(KB, { hL: [0.42, 0.22, 0.12], eL: [1, -0.6, 0], hR: [-0.42, -0.5, 0.12], eR: [-1, 0, 0.1] }),
  ], M(hit('elbowL', 'Unterarm-Rückseite'), { eff: 'fistL', view: 'front' }));
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
  D['mv:mae-geri'] = K(KAMAE_K, CHAMBER, MG_EXT(0.95, 1.45, 10), M(hit('toeR', 'Fußballen'), { eff: 'toeR', view: 'side' }));
  // Kekomi: Ferse stößt, Fußspitze weit hochgezogen, die Hüfte schiebt kräftig nach
  D['tc:mae-geri-kekomi'] = K(KAMAE_K, CHAMBER, MG_EXT(0.95, 1.42, 70, { yaw: -26 }), M(hit('heelR', 'Ferse'), { eff: 'heelR', view: 'side' }));
  D['tc:sonoba-geri'] = K(YOI, M(YOI, { pelvis: [0, 0.86, 0.02], L: { x: 0.16, z: 0 }, R: { x: -0.1, z: 0.3, y: 0.5, yaw: 0, pitch: -55, kp: [0, 0.5, 1] }, w: [1, 0] }), M(YOI, { lean: -8, pelvis: [0, 0.86, 0.02], R: { x: -0.1, z: 0.92, y: 0.88, yaw: 0, pitch: 8, kp: [0, 1, 0.3] }, w: [1, 0] }), M(hit('toeR', 'Fußballen'), { eff: 'toeR', view: 'side' }));
  D['tc:kizami-geri'] = K(ZK_KAMAE, M(ZK_KAMAE, { pelvis: [0, 0.82, 0.0], L: { x: 0.1, z: 0.36, y: 0.5, pitch: -55, kp: [0, 0.5, 1] }, R: { z: -0.4 }, w: [0, 1] }), M(ZK_KAMAE, { pelvis: [0, 0.82, -0.02], lean: -10, L: { x: 0.1, z: 0.88, y: 0.95, pitch: 8, kp: [0, 1, 0.3] }, R: { z: -0.4 }, w: [0, 1] }), M(hit('toeL', 'Fußballen'), { eff: 'toeL', view: 'side' }));
  // Ren-geri: zweimal Mae-geri hintereinander (Gedan, dann Jodan), Fuß jeweils durchgestreckt
  D['tc:ren-geri'] = M(D['mv:mae-geri'], { keys: [{ t: 0, p: KAMAE_K }, { t: 0.08, p: KAMAE_K }, { t: 0.24, p: CHAMBER }, { t: 0.36, p: MG_EXT(0.55, 1.4, 8), e: 'kime' }, { t: 0.5, p: CHAMBER }, { t: 0.64, p: MG_EXT(1.2, 1.36, 8), e: 'kime' }, { t: 0.78, p: CHAMBER }, { t: 0.95, p: KAMAE_K }], best: 0.64 });
  // Seitwärts aus Kiba-dachi: Fußkante nach rechts, Blick zur Seite
  const KB_K = M(KB, { look: -90 });
  const Y_CH = M(KB_K, { pelvis: [0.12, 0.8, 0], R: { x: -0.22, z: 0.12, y: 0.55, yaw: 0, pitch: -30, kp: [-0.5, 0.6, 0.6] }, L: { x: 0.36 }, w: [1, 0] });
  // Yoko-geri kekomi: Knie hoch vor den Körper, Fuß dicht am Standbein; dann stößt das Bein gerade zur Seite und die Hüfte
  // dreht kräftig ein (das Gesäß wendet sich zum Ziel, als wollte man es ansehen), Oberkörper neigt sich zur Gegenseite,
  // Standfuß dreht mit, Ferse und Fußkante führen; etwas langsamer als die anderen Tritte (2,7 s statt 2 s)
  const YK_CH = BAL(M(KB_K, { pelvis: [0.3, 0.78, 0], yaw: 25, L: { yaw: 25, kp: [0.8, 0.2, 1] }, R: { x: 0.2, z: 0.18, y: 0.62, yaw: -10, pitch: -5, sole: [-1, -0.2, 0], kp: [-0.5, 0.6, 1] }, w: [1, 0] }), 'L');
  const YK_EXT = BAL(M(KB_K, { pelvis: [0.36, 0.8, 0], yaw: 62, chest: -32, roll: 24, L: { yaw: 70, kp: [0.5, 0.2, 1] }, R: { x: -0.55, z: 0.02, y: 0.98, yaw: 0, pitch: -18, sole: [-1, 0, 0], kp: [0, -0.2, 1] }, w: [1, 0] }), 'L');
  D['mv:yoko-geri'] = K(KB_K, YK_CH, YK_EXT, M(hit('heelR', 'Fußkante'), { eff: 'heelR', view: 'front', dur: 2.7 }));
  // Yoko-geri keage: Knie hoch, Knie zeigt zum Ziel; der Unterschenkel schnappt im Bogen seitlich nach oben (Jodan),
  // die Hüfte schnappt dabei mit hoch (rechte Hüfte steigt, Oberkörper kippt etwas zur Gegenseite) und sofort zurück
  const YA_CH = BAL(M(KB_K, { pelvis: [0.3, 0.78, 0], yaw: 12, L: { yaw: 15, kp: [0.8, 0.2, 1] }, R: { x: 0.12, z: 0.18, y: 0.5, yaw: -40, pitch: -20, sole: [-0.6, -0.8, 0], kp: [-1, 0.6, 0.5] }, w: [1, 0] }), 'L');
  const YA_MID = BAL(M(YA_CH, { pelvis: [0.3, 0.8, 0], roll: 8, R: { x: -0.2, z: 0.18, y: 0.82, yaw: -10, pitch: 10, kp: [-1, 0.8, 0.3] } }), 'L');
  const YA_EXT = BAL(M(YA_CH, { pelvis: [0.3, 0.84, 0], yaw: 18, roll: 22, R: { x: -0.48, z: 0.12, y: 1.32, yaw: 0, pitch: 18, sole: [-0.7, -0.7, 0], kp: [-0.3, 1, 0.5] } }), 'L');
  D['tc:yoko-geri-keage'] = M({ keys: [{ t: 0, p: KB_K }, { t: 0.1, p: KB_K }, { t: 0.32, p: YA_CH }, { t: 0.42, p: YA_MID, e: 'in' }, { t: 0.5, p: YA_EXT, e: 'kime' }, { t: 0.6, p: YA_MID }, { t: 0.68, p: YA_CH }, { t: 0.9, p: KB_K }], best: 0.5, dur: 2 }, M(hit('heelR', 'Fußkante'), { eff: 'heelR', view: 'front' }));
  // Mawashi-geri: Knie seitlich hoch (Oberschenkel waagerecht, Unterschenkel dicht angelegt, Spann gestreckt), Standfuß dreht
  // auf dem Ballen weit auf, die Hüfte dreht ein und kippt (Oberkörper neigt sich vom Ziel weg); dann schnappt der Unterschenkel
  // waagerecht im Bogen nach vorn, Treffer mit dem Fußballen (Zehen hochgezogen)
  const MW_CH = BAL(M(KAMAE_K, { pelvis: [0.1, 0.8, 0.5], yaw: 50, chest: -40, roll: 12, look: 0, L: { yaw: 70, kp: [0.5, 0.2, 1] }, R: { x: -0.3, z: 0.42, y: 0.82, yaw: 205, pitch: 0, sole: [-0.3, 1, -0.2], kp: [-0.6, 0.1, 1] }, hL: L(H.guardF), hR: H.guardR, w: [1, 0] }), 'L');
  const MW_MID = BAL(M(MW_CH, { yaw: 68, chest: -55, roll: 18, R: { x: -0.36, z: 0.98, y: 0.95, yaw: 140, pitch: 0, sole: [-0.6, 0.2, -0.8], kp: [-0.3, 0.8, 1] } }), 'L');
  const MW_EXT = BAL(REACH(M(MW_CH, { yaw: 82, chest: -62, roll: 22, L: { yaw: 105 }, R: { yaw: 0, pitch: 4, sole: [-0.55, -0.83, 0], kp: [-0.2, 1, 0.1] } }), 'R', [0, 0.2, 1]), 'L');
  D['mv:mawashi-geri'] = M({ keys: [{ t: 0, p: KAMAE_K }, { t: 0.1, p: KAMAE_K }, { t: 0.34, p: MW_CH }, { t: 0.44, p: MW_MID, e: 'in' }, { t: 0.5, p: MW_EXT, e: 'kime' }, { t: 0.6, p: MW_MID }, { t: 0.68, p: MW_CH }, { t: 0.9, p: KAMAE_K }], best: 0.5, dur: 2 }, M(hit('toeR', 'Fußballen'), { eff: 'toeR', view: 'side3' }));
  const US_CH = M(KAMAE_K, { pelvis: [0, 0.82, 0.2], lean: 22, look: 160, R: { x: -0.08, z: 0.32, y: 0.45, yaw: 0, pitch: -70, kp: [0, 0.4, 1] }, w: [1, 0] });
  D['mv:ushiro-geri'] = K(KAMAE_K, US_CH, M(US_CH, { lean: 35, R: { x: -0.08, z: -0.72, y: 0.82, yaw: 180, pitch: -70, kp: [0, -1, 0.2] } }), M(hit('heelR', 'Ferse'), { eff: 'heelR', view: 'side' }));
  // Mikazuki-geri wie in Heian Godan 15: aus Kiba-dachi, die linke offene Hand zur linken Seite gestreckt (Ziel), das linke
  // Bein trägt, die Hüfte dreht links herum; der rechte Fuß schwingt im Bogen von außen herein und tritt mit der Sohle
  // in die linke Handfläche
  const MK_T = [0.92, 1.15, 0.02];
  const MK_HAND = (p) => M(p, { hL: chestAt(p, V.add(MK_T, [0.025, -0.065, -0.01])), oL: 1, pL: chestAt(p, [-1, 0, -0.15], true), fL: chestAt(p, [0, 1, 0.15], true), hR: H.hip });
  const MK0 = MK_HAND(M(KB, { look: 90 }));
  const MK1 = MK_HAND(BAL(M(KB, { pelvis: [0.3, 0.78, 0.02], yaw: 25, look: 80, L: { yaw: 30, kp: [0.8, 0.2, 1] }, R: { x: -0.32, z: 0.12, y: 0.42, yaw: 0, pitch: -10, kp: [-0.6, 0.3, 1] }, w: [1, 0] }), 'L'));
  const MK2 = MK_HAND(M(KB, { pelvis: [0.33, 0.82, -0.02], yaw: 40, look: 80, roll: 8, L: { yaw: 55, kp: [0.6, 0.2, 1] }, R: { x: MK_T[0] - 0.048, y: MK_T[1] - 0.04, z: MK_T[2] - 0.03, yaw: 0, pitch: 53, sole: [1, 0, 0], kp: [0, 0.3, 1] }, w: [1, 0] }));
  // Zwischenstellung vorn: der Fuß schwingt im Bogen (nicht auf geradem Weg) zur Hand
  const MK15 = MK_HAND(M(MK2, { yaw: 25, roll: 4, R: { x: 0.2, y: 0.85, z: 0.5, yaw: 0, pitch: 30, sole: [1, 0, -0.3], kp: [-0.2, 0.4, 1] } }));
  D['mv:mikazuki-geri'] = M({ keys: [{ t: 0, p: MK0 }, { t: 0.15, p: MK0 }, { t: 0.36, p: MK1 }, { t: 0.5, p: MK15, e: 'in' }, { t: 0.62, p: MK2, e: 'kime' }], best: 1, dur: 1.8, eff: 'toeR', view: 'front', yaw: 6 }, hit('heelR', 'Fußsohle'));
  D['tc:ura-mawashi-geri'] = M({ keys: [{ t: 0, p: KAMAE_K }, { t: 0.12, p: KAMAE_K }, { t: 0.36, p: M(Y_CH, { look: 0 }) }, { t: 0.56, p: M(Y_CH, { look: 0, pelvis: [0.14, 0.84, 0], R: { x: -0.7, z: 0.42, y: 1.12, yaw: 30, pitch: 10, sole: [-0.6, 0, 0.8], kp: [-0.4, 1, 0.3] } }) }, { t: 0.72, p: M(Y_CH, { look: 0, pelvis: [0.14, 0.84, 0], R: { x: -0.1, z: 0.86, y: 1.08, yaw: 30, pitch: 10, sole: [1, 0, 0.2], kp: [-0.4, 1, 0.3] } }), e: 'kime' }], best: 0.72, dur: 1.8, eff: 'heelR', view: 'front3' }, hit('heelR', 'Sohle / Ferse'));
  D['tc:ushiro-mawashi-geri'] = M(D['tc:ura-mawashi-geri'], { keys: [{ t: 0, p: KAMAE_K }, { t: 0.1, p: KAMAE_K }, { t: 0.32, p: M(KAMAE_K, { yaw: -150, look: -170, L: { yaw: -140 }, R: { x: -0.4, z: -0.2, y: 0.4, yaw: -150, pitch: -40, kp: [0, 0.3, -1] }, w: [1, 0] }) }, { t: 0.56, p: M(Y_CH, { look: 0, pelvis: [0.14, 0.84, 0], R: { x: -0.7, z: 0.42, y: 1.12, yaw: 30, pitch: 10, sole: [-0.6, 0, 0.8], kp: [-0.4, 1, 0.3] } }) }, { t: 0.72, p: M(Y_CH, { look: 0, pelvis: [0.14, 0.84, 0], R: { x: -0.1, z: 0.86, y: 1.08, yaw: 30, pitch: 10, sole: [1, 0, 0.2], kp: [-0.4, 1, 0.3] } }), e: 'kime' }], marks: ['turn'] });
  // Hiza-geri: beide Hände greifen vorn auf Kopfhöhe und ziehen herab, das Knie stößt zwischen den Händen nach oben
  const HZ_CH = BAL(M(S.zk, { pelvis: [0, 0.84, 0.5], hL: [0.12, -0.05, 0.42], hR: [-0.12, -0.05, 0.42], R: { x: -0.08, z: 0.35, y: 0.42, pitch: -70, kp: [0, 0.6, 1] }, w: [1, 0] }), 'L');
  const HZ_E0 = BAL(M(S.zk, { pelvis: [0, 0.86, 0.5], lean: 8, R: { x: -0.07, z: 0.62, y: 0.6, pitch: -65, kp: [0, 1, 0.6] }, w: [1, 0] }), 'L');
  const HZ_K = E.solve(HZ_E0).kneeR;
  const HZ_EXT = M(HZ_E0, { hL: chestAt(HZ_E0, V.add(HZ_K, [0.13, 0.1, 0.02])), hR: chestAt(HZ_E0, V.add(HZ_K, [-0.13, 0.1, 0.02])), eL: [0.5, -0.5, 0.3], eR: [-0.5, -0.5, 0.3] });
  D['tc:hiza-geri'] = K(M(S.zk, { hL: [0.08, 0.06, 0.48], hR: [-0.08, 0.06, 0.48] }), HZ_CH, HZ_EXT, M(hit('kneeR', 'Knie'), { eff: 'kneeR', view: 'side3' }));
  D['tc:mawashi-hiza-geri'] = K(ZK_KAMAE, M(ZK_KAMAE, { pelvis: [0, 0.84, 0.22], yaw: 10, R: { x: -0.5, z: 0.0, y: 0.5, yaw: -40, pitch: -40, kp: [-1, 0.6, 0] }, w: [1, 0] }), M(ZK_KAMAE, { pelvis: [0, 0.86, 0.26], yaw: 45, R: { x: -0.08, z: 0.22, y: 0.55, yaw: 20, pitch: -50, kp: [0.3, 0.6, 1] }, w: [1, 0] }), M(hit('kneeR', 'Knie'), { eff: 'kneeR', view: 'front3' }));
  // Fumikomi wie in Heian Sandan 12: Füße geschlossen, das linke Bein trägt, rechtes Knie hoch vor den Körper,
  // dann stampft der Fuß mit der Fußkante zur rechten Seite, der Körper senkt sich mit in Kiba-dachi (Blick zur Seite)
  const FU0 = M(KB, { look: -90, pelvis: [0.35, 0.88, 0], L: { x: 0.42, kp: [0.3, 0, 1] }, R: { x: 0.26, z: 0, yaw: -5, kp: [-0.3, 0, 1] } });
  const FU1 = BAL(M(KB, { look: -90, pelvis: [0.38, 0.84, 0], L: { x: 0.42, kp: [0.4, 0.1, 1] }, R: { x: 0.25, z: 0.2, y: 0.5, yaw: -20, pitch: -30, kp: [-0.3, 0.6, 1] }, w: [1, 0] }), 'L');
  const FU2 = M(KB, { look: -90, R: { y: 0.09, yaw: -5 }, w: [0.4, 0.6] });
  D['tc:fumikomi'] = M({ keys: [{ t: 0, p: FU0 }, { t: 0.15, p: FU0 }, { t: 0.36, p: FU1 }, { t: 0.46, p: FU2, e: 'kime' }, { t: 0.62, p: KB_K }], best: 0.46, dur: 1.8 }, M(hit('heelR', 'Fußkante'), { eff: 'heelR', view: 'front' }));
  // Namigaeshi: der Fuß federt in einem weichen Bogen nach innen hoch Richtung Unterbauch (Sohle nach oben innen)
  // und setzt gleich wieder ab – fließend, ohne Halt
  const NG1 = M(KB, { pelvis: [0.08, 0.72, 0], R: { x: -0.18, z: 0.12, y: 0.3, yaw: 30, pitch: -15, sole: [1, 0.3, 0], kp: [-1, 0.4, 0.5] }, w: [1, 0] });
  const NG2 = M(KB, { pelvis: [0.1, 0.74, 0], R: { x: -0.04, z: 0.18, y: 0.42, yaw: 40, pitch: -10, sole: [1, 0.5, 0], kp: [-1, 0.5, 0.6] }, w: [1, 0] });
  D['tc:namigaeshi'] = M({ keys: [{ t: 0, p: KB }, { t: 0.1, p: KB }, { t: 0.3, p: NG1, e: 'in' }, { t: 0.45, p: NG2, e: 'io' }, { t: 0.62, p: NG1, e: 'lin' }, { t: 0.85, p: KB, e: 'io' }], best: 0.45, dur: 1.8 }, M(hit('heelR', 'Fußsohle'), { eff: 'heelR', view: 'front' }));
  D['tc:nidan-geri'] = M({ keys: [{ t: 0, p: KAMAE_K }, { t: 0.12, p: KAMAE_K }, { t: 0.36, p: M(KAMAE_K, { pelvis: [0, 1.15, 0.3], L: { x: 0.1, z: 0.62, y: 0.68, pitch: 10, kp: [0, 1, 0.5] }, R: { x: -0.08, z: 0.1, y: 0.62, pitch: -50, kp: [0, 0.6, 1] }, w: [0, 0] }) }, { t: 0.58, p: M(KAMAE_K, { pelvis: [0, 1.2, 0.32], lean: -8, L: { x: 0.1, z: 0.3, y: 0.62, pitch: -50, kp: [0, 0.6, 1] }, R: { x: -0.08, z: 1.05, y: 1.45, pitch: 15, kp: [0, 1, 0.3] }, w: [0, 0] }), e: 'kime' }], best: 1, dur: 1.8, eff: 'toeR', view: 'side' }, hit('toeR', 'zweiter Tritt'));

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
  const SEIZA = { pelvis: [0, 0.32, 0], yaw: 0, L: { x: 0.1, z: -0.08, y: 0.06, yaw: 180, sole: [0, 1, 0], kp: [0, -1, 0.6] }, R: { x: -0.1, z: -0.08, y: 0.06, yaw: 180, sole: [0, 1, 0], kp: [0, -1, 0.6] }, hL: [0.1, -0.58, 0.24], hR: [-0.1, -0.58, 0.24], oL: 1, oR: 1, pL: [0, 1, 0], pR: [0, 1, 0], w: [0, 0] };
  D['tc:seiza'] = STILL(SEIZA, { view: 'side3' });
  D['tc:mokuso'] = STILL(M(SEIZA, { look: 0, hL: [0.03, -0.46, 0.2], hR: [-0.03, -0.47, 0.18], pL: [0, -1, 0], pR: [0, -1, 0] }), { view: 'front3' });
  const KNEEL_UP = M(SEIZA, { pelvis: [0, 0.5, 0.02], L: { x: 0.12, z: 0.38, y: 0.075, yaw: 0, sole: [0, 0, 0], kp: [0, 0.3, 1] } });
  D['tc:kiritsu'] = M({ keys: [{ t: 0, p: SEIZA }, { t: 0.15, p: SEIZA }, { t: 0.45, p: KNEEL_UP }, { t: 0.8, p: M(S.heisoku) }], best: 0.45, dur: 2.2, view: 'side3' });
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
  const TB_2 = M(FIGHT, { pelvis: [0.06, 0.77, 0.24], yaw: 0, lean: -6, R: { x: -0.25, z: 0.76, y: 0.1, yaw: 0, pitch: 5, sole: [1, 0.15, 0], kp: [-0.3, 0.3, 1] }, w: [1, 0] });
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
  D['wp:hiza'] = STILL(D['tc:hiza-geri'].keys[3].p, M(hit('kneeR', 'Knie'), { view: 'side3', marks: ['ring:kneeR'] }));
  D['wp:zenwan'] = STILL(M(MZK, { hL: L(H.hip), hR: [-0.2, 0.0, 0.32], eR: DOWN_FWD }), M(hit('elbowR', 'Unterarm'), { view: 'front3', marks: ['arm:R'] }));

  /* ---------- Übersichten ---------- */
  D['fig:levels'] = STILL(M(S.hachiji, { hL: L(H.side), hR: H.side, oL: 1, oR: 1, fL: [0, -1, 0], fR: [0, -1, 0], pL: [-1, 0, 0], pR: [1, 0, 0] }), { view: 'front', marks: ['levels'] });
  D['fig:targets'] = STILL(M(S.hachiji, { hL: [0.3, -0.5, 0.06], hR: [-0.3, -0.5, 0.06], oL: 1, oR: 1, fL: [0, -1, 0], fR: [0, -1, 0], pL: [-1, 0, 0], pR: [1, 0, 0] }), { view: 'front', marks: ['targets'] });

  /* ---------- Hochgezogene Zehen bei Tritten mit dem Fußballen ---------- */
  // Sobald der Tretfuß in der Luft ist, sind die Zehen hochgezogen; beim Abstellen senken sie sich wieder.
  const KOSHI = { 'mv:mae-geri': 'R', 'tc:mae-geri-kekomi': 'R', 'tc:ren-geri': 'R', 'tc:sonoba-geri': 'R', 'tc:kizami-geri': 'L', 'mv:mawashi-geri': 'R', 'tc:nidan-geri': 'LR' };
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
    'mv:mae-geri': 'koshi', 'tc:mae-geri-kekomi': 'kakato', 'tc:sonoba-geri': 'koshi', 'tc:kizami-geri': 'koshi', 'tc:ren-geri': 'koshi',
    'mv:yoko-geri': 'sokuto', 'tc:yoko-geri-keage': 'sokuto', 'mv:mawashi-geri': 'koshi', 'mv:ushiro-geri': 'kakato',
    'mv:mikazuki-geri': 'teisoku', 'tc:ura-mawashi-geri': 'teisoku', 'tc:ushiro-mawashi-geri': 'teisoku', 'tc:hiza-geri': 'hiza',
    'tc:mawashi-hiza-geri': 'hiza', 'tc:fumikomi': 'sokuto', 'tc:namigaeshi': 'teisoku', 'tc:nidan-geri': 'koshi',
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

  Object.keys(FLAECHE).forEach((id) => {
    const h = D[id] && D[id].hit;
    if (!h) throw new Error(`Trefferfläche ohne Trefferpunkt: ${id}`);
    const [fl, sides] = FLAECHE[id].split(':');
    D[id].hit = M(h, { fl, sides: sides || h.at.slice(-1) });
  });

  SK.fig3dDefs = D;
  SK.fig3dPose = { M, mirror, rotate, move, S, H };
})();
