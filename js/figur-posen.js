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
      pelvis: mx(f.pelvis), yaw: -f.yaw, chest: -f.chest, lean: f.lean, look: -f.look,
      L: ft(f.R), R: ft(f.L), hL: mx(f.hR), hR: mx(f.hL), eL: mx(f.eR), eR: mx(f.eL),
      oL: f.oR, oR: f.oL, pL: mx(f.pR), pR: mx(f.pL), fL: mx(f.fR), fR: mx(f.fL), w: [f.w[1], f.w[0]],
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
    hangetsu: { pelvis: [0, 0.78, 0.03], yaw: 0, L: { x: 0.16, z: 0.36, yaw: -22, kp: [-0.5, 0, 1] }, R: { x: -0.16, z: -0.32, yaw: 22, kp: [0.5, 0, 1] }, w: [0.5, 0.5] },
    sanchin: { pelvis: [0, 0.85, 0.03], yaw: 0, L: { x: 0.12, z: 0.18, yaw: -22, kp: [-0.5, 0, 1] }, R: { x: -0.12, z: -0.12, yaw: 18, kp: [0.5, 0, 1] }, w: [0.5, 0.5] },
    renoji: { pelvis: [0, 0.905, -0.02], yaw: -30, L: { x: 0.03, z: 0.3, yaw: 0 }, R: { x: -0.04, z: -0.04, yaw: -90 }, w: [0.4, 0.6] },
    teiji: { pelvis: [0, 0.902, 0], yaw: -30, L: { x: 0.0, z: 0.32, yaw: 0 }, R: { x: 0.06, z: -0.02, yaw: -90 }, w: [0.5, 0.5] },
    // Kosa-dachi: rechts Standbein; Knie nebeneinander, erst unterhalb des Knies kreuzt das linke Bein hinter der rechten Wade,
    // linker Fuß (Ballen) steht rechts neben dem rechten, schräg dahinter
    kosa: { pelvis: [0.0, 0.64, 0.2], yaw: 10, R: { x: -0.07, z: 0.32, yaw: 0, kp: [0, 0.2, 1] }, L: { x: -0.17, z: 0.14, y: 0.1, yaw: 10, pitch: -35, kp: [0.6, 0.2, 1] }, w: [0.1, 0.9] },
    ashidachi: { pelvis: [0, 0.9, 0], yaw: -20, L: { x: 0.08, z: 0, yaw: 0 }, R: { x: -0.06, z: 0.08, y: 0.44, yaw: -10, pitch: -40, kp: [0, 0.5, 1] }, w: [1, 0] },
    hizakutsu: { pelvis: [0, 0.72, 0.08], yaw: -60, L: { x: 0.14, z: 0.56, yaw: -35 }, R: { x: -0.13, z: -0.46, yaw: -15 }, w: [0.7, 0.3] },
    orishiki: { pelvis: [0, 0.5, -0.02], yaw: 0, L: { x: 0.13, z: 0.36, yaw: 0, kp: [0, 0.3, 1] }, R: { x: -0.12, z: -0.42, y: 0.065, yaw: 180, kp: [0, -1, 0.3] }, w: [0.5, 0.5] },
  };
  const ZK_G = M(S.zk, { hL: L(H.gedan), hR: H.hip });
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
  // Technik: Ausgangsstellung kurz halten, dann schnell in die Endstellung (Kime)
  const T = (from, to, o) => M({ keys: [{ t: 0, p: from }, { t: 0.22, p: from }, { t: 0.62, p: to, e: 'kime' }], best: 1, dur: 1.4 }, o);
  // Mehrere Stellungen nacheinander
  const SEQ = (poses, o) => {
    const n = poses.length;
    const keys = [{ t: 0, p: poses[0] }, { t: 0.15, p: poses[0] }];
    for (let i = 1; i < n; i++) keys.push({ t: 0.15 + (0.65 * i) / (n - 1), p: poses[i], e: 'kime' });
    return M({ keys, best: 1, dur: 1.2 + 0.5 * n }, o);
  };
  // Eine fließende Bewegung über Zwischenstellungen: dort nicht abbremsen, erst am Ende Kime
  // Die Bahn wird nach ihrer echten Länge (Weg des Körperpunkts o.eff) neu getaktet: schnell anlaufen,
  // ohne Stocken durch die Zwischenstellungen, erst am Ende hart abbremsen (Kime)
  const FLOW = (poses, o) => {
    const d = SEQ(poses, o);
    const eff = d.eff || 'fistR';
    const T0 = 0.15;
    const T1 = 0.8;
    const n = poses.length;
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
    // Dauer wie bei einfachen Techniken (T: 1,4 s), je weiterer Zwischenstellung etwas länger
    if (!(o && o.dur)) d.dur = 1.3 + 0.15 * (n - 2);
    return d;
  };
  // Fußtritt: ausholen, treffen, zurück
  const K = (base, chamber, ext, o) => M({ keys: [{ t: 0, p: base }, { t: 0.1, p: base }, { t: 0.34, p: chamber }, { t: 0.5, p: ext, e: 'kime' }, { t: 0.66, p: chamber }, { t: 0.9, p: base }], best: 0.5, dur: 2 }, o);
  const STILL = (pose, o) => M({ keys: [{ t: 0, p: pose }], best: 0, still: true }, o);
  const hit = (at, text) => ({ hit: { at, text } });

  const D = {};

  /* ---------- Stände: Standbild der Endstellung ---------- */
  const STAND_HANDS = {
    musubi: { hL: L(H.yoi), hR: H.yoi, oL: 0, oR: 0 }, heisoku: { hL: L(H.yoi), hR: H.yoi, oL: 0, oR: 0 }, hachiji: {},
    zenkutsu: { hL: L(H.gedan), hR: H.hip }, ashizenkutsu: { hL: L(H.guardF), hR: H.guardR }, hizakutsu: { hL: L(H.gedan), hR: H.hip },
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

  /* ---------- Fauststöße ---------- */
  const ZKS_PUNCH = M(S.zks, { hL: L(H.hip), hR: H.chudan });
  // Kizami-, Sanbon-, Ren-zuki: jede Stoßfaust startet an der Hüfte und trifft mit gestrecktem Arm geradeaus die Mittellinie
  const JO = H.jodan[1], CH = H.chudan[1];
  const ZK_HIP = M(S.zk, HANDS_HIP);
  D['mv:gyaku-zuki'] = T(ZK_G, ZKS_PUNCH, M(hit('fistR', 'Faust'), { eff: 'fistR', view: 'front3' }));
  const OI_MID = { pelvis: [0, 0.71, 0.6], yaw: -18, L: { x: 0.12, z: 0.62, yaw: 10 }, R: { x: -0.01, z: 0.58, y: 0.11, yaw: 0 }, hL: L(H.gedan), hR: H.hip, w: [1, 0] };
  const OI_END = { pelvis: [0, 0.7, 1.22], yaw: 0, L: { x: 0.12, z: 0.62, yaw: 32 }, R: { x: -0.13, z: 1.74, yaw: 4 }, hL: L(H.hip), hR: H.chudan, w: [0.3, 0.7] };
  D['mv:oi-zuki'] = M({ keys: [{ t: 0, p: ZK_G }, { t: 0.12, p: ZK_G }, { t: 0.5, p: OI_MID }, { t: 0.82, p: OI_END, e: 'kime' }], best: 1, dur: 2, eff: 'ankleR', view: 'side3' }, hit('fistR', 'Faust'));
  D['tc:choku-zuki'] = T(M(YOI, { hL: L(H.chudan), hR: H.hip }), M(YOI, { hL: L(H.hip), hR: H.chudan }), M(hit('fistR', 'Faust'), { eff: 'fistR', view: 'front3' }));
  D['tc:kizami-zuki'] = T(M(S.zk, { hL: L(H.hip), hR: H.guardR }), M(S.zk, { pelvis: [0, 0.71, 0.16], hL: punch(S.zk, 'L', JO), hR: H.guardR }), M(hit('fistL', 'Faust'), { eff: 'fistL', view: 'side3' }));
  D['tc:tate-zuki'] = T(ZK_G, M(ZKS_PUNCH), M(hit('fistR', 'Faust senkrecht'), { eff: 'fistR', view: 'side3' }));
  D['tc:sanbon-zuki'] = SEQ([mirror(ZK_HIP), M(MZK, { hL: L(H.hip), hR: punch(MZK, 'R', JO) }), M(mirror(S.zks), { hL: punch(mirror(S.zks), 'L', CH), hR: H.hip }), M(MZK, { hL: L(H.hip), hR: punch(MZK, 'R', CH) })], M(hit('fistR', 'Faust'), { eff: 'fistR', view: 'side3' }));
  D['tc:ren-zuki'] = SEQ([ZK_HIP, M(S.zk, { hL: punch(S.zk, 'L', JO), hR: H.hip }), M(S.zks, { hL: L(H.hip), hR: punch(S.zks, 'R', CH) })], M(hit('fistR', 'Faust'), { eff: 'fistR', view: 'side3' }));
  D['tc:morote-zuki'] = T(M(S.zks, HANDS_HIP), M(S.zks, { hL: punch(S.zks, 'L', -0.13, 0.07), hR: punch(S.zks, 'R', -0.13, -0.07) }), M(hit('fistR', 'Fäuste'), { eff: 'fistR', view: 'side3' }));
  D['tc:kagi-zuki'] = T(KB, M(KB, { hR: [0.07, -0.2, 0.3], eR: [-0.7, -0.25, 0.3], look: 90 }), M(hit('fistR', 'Faust'), { eff: 'fistR', view: 'front' }));
  // Ura-zuki: Faust steigt aus der Hüfte schräg (etwa 45°) nach oben vorn, Faustrücken bleibt unten (keine Drehung)
  D['tc:ura-zuki'] = T(ZK_G, M(S.zks, { hL: L(H.hip), hR: [-0.03, -0.14, 0.42], eR: [-0.1, -1, 0.3], pR: [0, 1, 0] }), M(hit('fistR', 'Handrücken unten'), { eff: 'fistR', view: 'side3' }));
  D['tc:age-zuki'] = FLOW([ZK_G, M(S.zks, { hL: L(H.hip), hR: [-0.06, -0.3, 0.35] }), M(S.zks, { hL: L(H.hip), hR: [0.0, 0.22, 0.62] })], M(hit('fistR', 'Faust'), { eff: 'fistR', view: 'side3' }));
  // Yama-zuki: Oberkörper gerade zum Gegner (chest gleicht die Hüftdrehung des Standes aus), Fäuste senkrecht übereinander, obere auf Kopfhöhe, untere vor dem Bauch (Faustrücken unten), beide Arme leicht gebeugt, Oberkörper vorgeneigt
  D['tc:yama-zuki'] = T(M(S.zk, HANDS_HIP, { hL: [0.28, -0.42, 0.05], hR: [-0.18, -0.4, -0.05] }), M(S.zk, { chest: 40, lean: 38, hR: [0.0, 0.39, 0.17], eR: [-0.3, 0.6, -0.6], hL: [0.02, -0.01, 0.46], eL: [0.3, -0.6, -0.7], pL: [0, 1, 0] }), M(hit('fistR', 'Jodan'), { eff: 'fistR', view: 'side3' }));
  D['tc:awase-zuki'] = T(M(S.zks, HANDS_HIP), M(S.zks, { hR: punch(S.zks, 'R', 0.04), hL: [0.04, -0.26, 0.38], eL: [0.25, -0.7, 0.05] }), M(hit('fistR', 'Jodan'), { eff: 'fistR', view: 'side3' }));
  D['tc:otoshi-zuki'] = T(M(S.zks, { hL: L(H.hip), hR: [-0.25, 0.35, 0.15] }), M(S.zks, { lean: 8, hL: L(H.hip), hR: [-0.05, -0.42, 0.45] }), M(hit('fistR', 'Faust'), { eff: 'fistR', view: 'side3' }));
  D['tc:mawashi-zuki'] = FLOW([ZK_G, M(S.zks, { hL: L(H.hip), hR: [-0.45, -0.1, 0.22], eR: [-1, 0, 0] }), M(S.zks, { chest: 15, hL: L(H.hip), hR: [0.06, 0.0, 0.4], eR: [-0.8, 0.1, 0.2] })], M(hit('fistR', 'Faust'), { eff: 'fistR', view: 'front3' }));
  // Drehung der Faust beim geraden Stoß (Faustrücken unten an der Hüfte → oben im Ziel)
  [['mv:gyaku-zuki', 'R'], ['mv:oi-zuki', 'R'], ['tc:choku-zuki', 'LR'], ['tc:kizami-zuki', 'L'], ['tc:sanbon-zuki', 'LR'], ['tc:ren-zuki', 'LR'], ['tc:morote-zuki', 'LR'], ['tc:awase-zuki', 'R']].forEach(([id, s]) => (D[id] = TWIST(D[id], s)));
  D['tc:tate-zuki'] = TWIST(D['tc:tate-zuki'], 'R', 0.5);
  // Nukite wie in Heian Nidan (Kiai): Arm ganz gestreckt, die andere offene Hand liegt flach unter dem Ellbogen (Osae-uke)
  D['tc:nukite'] = T(ZK_G, M(S.zks, { hR: [0.0, -0.13, 0.62], oR: 1, pR: [1, 0, 0], hL: [-0.07, -0.19, 0.27], oL: 1, pL: [0, -1, 0], fL: [-1, 0, 0.1] }), M(hit('tipR', 'Fingerspitzen'), { eff: 'tipR', view: 'side3' }));

  /* ---------- Schläge ---------- */
  // Uraken (Yoko-mawashi-uchi): Faust vor der linken Brust, der Ellbogen führt zur Seite, dann schnappt der Unterarm aus –
  // Treffer auf Schulterhöhe mit durchgestrecktem Arm; schneller Schnapper (kürzere Dauer)
  D['tc:uraken-uchi'] = FLOW([
    M(KB, { look: -90, hR: [0.16, -0.06, 0.2], eR: [-0.6, -0.2, 0.8] }),
    M(KB, { look: -90, hR: [-0.14, 0.0, 0.22], eR: [-1, 0.2, 0.1] }),
    M(KB, { look: -90, hR: [-0.74, -0.01, 0.06], eR: [-0.2, 0.5, -0.6] }),
  ], M(hit('fistR', 'Faustrücken'), { eff: 'fistR', view: 'front', dur: 0.95 }));
  // Tettsui (Kentsui Tate-mawashi-uchi) wie in Heian Shodan 4: aus Gedan-barai im Migi Zenkutsu-dachi
  // senkrechter Kreis vor dem Körper hoch über den Kopf und von oben nach vorn, Arm leicht gebeugt
  D['tc:tettsui-uchi'] = FLOW([
    MZK_G,
    M(MZK, { hL: L(H.hip), hR: [-0.06, 0.08, 0.26], pR: [1, 0, 0] }),
    M(MZK, { chest: -12, hL: L(H.hip), hR: [-0.2, 0.42, 0.02], eR: [-0.6, 0.3, -0.3], pR: [1, 0, 0] }),
    M(MZK, { chest: -25, hL: L(H.hip), hR: [-0.03, 0.0, 0.5], pR: [1, 0, 0] }),
  ], M(hit('fistR', 'Hammerfaust'), { eff: 'fistR', view: 'side3' }));
  D['tc:shuto-uchi'] = T(M(S.zk, { hL: L(H.guardF), hR: [-0.28, 0.2, -0.05], oR: 1, pR: [0, -1, 0] }), M(S.zks, { hL: L(H.hip), hR: [0.02, 0.04, 0.48], oR: 1, pR: [0, 1, 0] }), M(hit('tipR', 'Handkante'), { eff: 'wristR', view: 'front3' }));
  D['tc:haito-uchi'] = T(M(S.zk, { hL: L(H.guardF), hR: [-0.45, -0.35, 0.05], oR: 1, pR: [0, -1, 0] }), M(S.zks, { hL: L(H.hip), hR: [0.05, 0.03, 0.46], oR: 1, pR: [0, -1, 0] }), M(hit('wristR', 'Daumenseite'), { eff: 'wristR', view: 'front3' }));
  // Teisho in Kiba-dachi zur Seite (wie Jion 23–25): offene Hand vor der linken Brust, Handballen schlägt zur rechten Seite,
  // Finger oben, Arm fast gestreckt
  D['tc:teisho-uchi'] = FLOW([
    M(KB, { look: -90, hR: [0.16, -0.1, 0.24], oR: 1, pR: [-1, 0, 0.3], fR: [0, 1, 0], eR: [-0.5, -0.4, 0.8] }),
    M(KB, { look: -90, hR: [-0.25, -0.08, 0.3], oR: 1, pR: [-1, 0, 0.2], fR: [0, 1, 0] }),
    M(KB, { look: -90, hR: [-0.66, -0.08, 0.12], oR: 1, pR: [-1, 0, 0], fR: [0, 1, 0] }),
  ], M(hit('wristR', 'Handballen'), { eff: 'wristR', view: 'front' }));
  const MAE_ENPI = M(S.zks, { hL: L(H.hip), hR: [0.08, -0.13, 0.17], eR: [-0.1, 0.1, 1] });
  D['tc:enpi-uchi'] = T(ZK_G, MAE_ENPI, M(hit('elbowR', 'Ellbogen'), { eff: 'elbowR', view: 'side3' }));
  // Furi-enpi: Arm holt vor dem Körper nach links aus (Ellbogen vorn, Unterarm bleibt vor der Brust), dann schwingt der Ellbogen zur Seite
  D['tc:furi-enpi'] = FLOW([
    M(KB, { look: -90, hR: [0.3, -0.12, 0.38], eR: [-0.2, -0.3, 1] }),
    M(KB, { look: -90, hR: [0.12, -0.1, 0.34], eR: [-0.7, -0.1, 1] }),
    M(KB, { look: -90, hR: [-0.06, -0.08, 0.2], eR: [-1, 0.1, 0.4] }),
  ], M(hit('elbowR', 'Ellbogen'), { eff: 'elbowR', view: 'front' }));
  // Yoko-enpi: Unterarm waagerecht vor der Brust (Faust vor der linken Seite, Ellbogen vorn), dann stößt der Ellbogen zur Seite
  D['tc:yoko-enpi'] = FLOW([
    M(KB, { look: -90, hR: [0.24, -0.08, 0.34], eR: [-0.4, 0, 1] }),
    M(KB, { look: -90, hR: [0.08, -0.07, 0.26], eR: [-1, 0, 0.6] }),
    M(KB, { look: -90, hR: [-0.06, -0.06, 0.13], eR: [-1, 0, 0] }),
  ], M(hit('elbowR', 'Ellbogen'), { eff: 'elbowR', view: 'front' }));
  // Mawashi-enpi: aus der Hüfte kommt der Ellbogen seitlich hoch und schwingt waagerecht nach vorn, Faust endet vor der Brust
  D['tc:mawashi-enpi'] = FLOW([
    ZK_G,
    M(S.zks, { chest: -15, hL: L(H.hip), hR: [-0.34, -0.12, 0.02], eR: [-1, 0, -0.4] }),
    M(S.zks, { chest: 15, hL: L(H.hip), hR: [0.12, -0.04, 0.12], eR: [-0.25, 0, 1] }),
  ], M(hit('elbowR', 'Ellbogen'), { eff: 'elbowR', view: 'front3' }));
  // Age-enpi: aus der Hüfte gerade nach oben – Faust steigt dicht vor der rechten Brust hoch, der Ellbogen bleibt vorn
  // und steigt senkrecht (kein Ausschwenken zur Seite), die Faust endet neben dem Ohr
  D['tc:age-enpi'] = FLOW([
    M(S.zks, { hL: L(H.hip), hR: H.hip, eR: [-0.3, -0.5, -1] }),
    M(S.zks, { hL: L(H.hip), hR: [-0.12, -0.12, 0.3], eR: [0, -1, 0.3], pR: [1, 0, 0] }),
    M(S.zks, { hL: L(H.hip), hR: [-0.12, 0.04, 0.24], eR: [0, -0.4, 1], pR: [1, 0, 0] }),
    M(S.zks, { hL: L(H.hip), hR: [-0.14, 0.16, 0.05], eR: [-0.1, 1, 0.6], pR: [1, 0, 0] }),
  ], M(hit('elbowR', 'Ellbogen'), { eff: 'fistR', view: 'front3' }));
  D['tc:otoshi-enpi'] = T(M(KB, { hR: [-0.15, 0.5, 0.1] }), M(KB, { hR: [-0.12, 0.02, 0.14], eR: [0, -1, 0.35] }), M(hit('elbowR', 'Ellbogen'), { eff: 'elbowR', view: 'front' }));
  D['tc:ushiro-enpi'] = T(M(S.zks, { hL: L(H.hip), hR: H.chudan }), M(S.zks, { hL: L(H.guardF), hR: [-0.16, -0.22, 0.06], eR: [-0.3, -0.2, -1] }), M(hit('elbowR', 'Ellbogen'), { eff: 'elbowR', view: 'side' }));
  // Hasami-uchi wie in Bassai Dai 23: beide Fäuste holen hoch über dem Kopf aus, schwingen seitlich in großen Bögen herab
  // und treffen von beiden Seiten – im Ziel sind die Arme gestreckt
  D['tc:hasami-uchi'] = FLOW([
    M(S.zks, { hL: [0.3, 0.5, 0.0], hR: [-0.3, 0.5, 0.0] }),
    M(S.zks, { hL: [0.62, 0.05, 0.12], hR: [-0.62, 0.05, 0.12] }),
    M(S.zks, { hL: [0.17, -0.2, 0.6], hR: [-0.17, -0.2, 0.6], pL: [-1, 0, 0], pR: [1, 0, 0] }),
  ], M(hit('fistR', 'Hammerfäuste'), { eff: 'fistR', view: 'front3' }));

  /* ---------- Abwehr ---------- */
  // Age-uke: die abwehrende Faust steigt vor der Brust auf (innen), die andere zieht außen vorbei zur Hüfte
  const AU_PREP = M(MZK, { hR: H.hip, hL: [0.06, 0.28, 0.22], eL: L(UP_OUT) });
  const AU_MID = M(MZK, { hR: [-0.06, -0.04, 0.3], eR: [-0.4, -0.6, 0.4], hL: [0.12, 0.04, 0.4], eL: [0.5, -0.6, 0.3] });
  D['mv:age-uke'] = M({ keys: [{ t: 0, p: AU_PREP }, { t: 0.22, p: AU_PREP }, { t: 0.42, p: AU_MID, e: 'lin' }, { t: 0.62, p: M(MZK, { hL: L(H.hip), hR: [0.06, 0.28, 0.22], eR: UP_OUT }), e: 'kime' }], best: 1, dur: 1.4, eff: 'fistR', view: 'front3' }, hit('elbowR', 'Unterarm'));
  // Gedan-barai: Faust holt an der Gegenschulter (Ohrhöhe) aus, Ellbogen vor dem Körper; die Bahn führt deutlich vor dem
  // Bauch schräg nach unten, damit Arm und Faust nicht in den Oberkörper tauchen
  const GB_PREP = M(S.zk, { hL: [-0.13, 0.1, 0.24], eL: [0.1, -0.5, 0.8], hR: H.chudan });
  const GB_MID = M(S.zk, { hL: [0.08, -0.26, 0.38], hR: [-0.12, -0.28, 0.22] });
  D['mv:gedan-barai'] = M({ keys: [{ t: 0, p: GB_PREP }, { t: 0.22, p: GB_PREP }, { t: 0.44, p: GB_MID, e: 'lin' }, { t: 0.62, p: ZK_G, e: 'kime' }], best: 1, dur: 1.4, eff: 'fistL', view: 'front3' }, hit('fistL', 'Unterarm'));
  D['mv:soto-uke'] = T(M(MZK, { hL: L(H.chudan), hR: [-0.45, 0.06, -0.06] }), M(MZK, { hL: L(H.hip), hR: [-0.03, 0.0, 0.32], eR: DOWN_FWD }), M(hit('elbowR', 'Unterarm innen'), { eff: 'fistR', view: 'front3' }));
  D['mv:uchi-uke'] = T(M(MZK, { hL: L(H.chudan), hR: [0.12, -0.2, 0.25], eR: [-0.5, -0.6, 0.5] }), M(MZK, { hL: L(H.hip), hR: [-0.3, 0.0, 0.3], eR: DOWN_FWD }), M(hit('elbowR', 'Unterarm außen'), { eff: 'fistR', view: 'front3' }));
  // Shuto-uke: Blockhand holt am gegenüberliegenden Ohr aus, die andere Hand ist nach vorn gestreckt –
  // die Oberarme liegen dabei vor der Brust fast übereinander
  D['tc:shuto-uke'] = T(M(S.kk, { oL: 1, oR: 1, hL: [-0.13, 0.2, 0.1], eL: [-0.1, -0.2, 1], pL: [-1, 0, 0], hR: [0.12, -0.12, 0.48], eR: [-0.2, -0.6, 0.4], pR: [0, -1, 0] }), KK_SHUTO, M(hit('tipL', 'Handkante'), { eff: 'wristL', view: 'front3' }));
  // Morote-uke: der vordere (linke) Arm blockt wie Uchi-uke zur linken Seite, die rechte Faust stützt am Ellbogen
  D['tc:morote-uke'] = T(M(S.kk, { hR: H.hip, hL: [-0.12, -0.2, 0.25], eL: [0.5, -0.6, 0.5] }), M(S.kk, { hL: [0.4, 0.0, 0.26], eL: L(DOWN_FWD), hR: [0.19, -0.21, 0.26], eR: [-0.4, -1, 0.2] }), M(hit('fistR', 'Stütze am Ellbogen'), { eff: 'fistL', view: 'front3' }));
  D['tc:juji-uke'] = T(M(S.zks, HANDS_HIP), M(S.zks, { oL: 1, oR: 1, hL: [-0.025, 0.3, 0.29], hR: [0.025, 0.3, 0.33], eL: [1, -0.6, 0.3], eR: [-1, -0.6, 0.3], pL: [0, 0, 1], pR: [0, 0, 1], fL: [-0.45, 1, 0.2], fR: [0.45, 1, 0.2] }), M(hit('wristR', 'Handgelenke gekreuzt'), { eff: 'wristR', view: 'front3' }));
  // Kakiwake-uke im Zenkutsu-dachi, Hüfte frontal nach vorn, langsam ausgeführt: Handgelenke dicht vor der Brust gekreuzt, dann auseinander und dabei etwas vom Körper weg nach vorn
  D['tc:kakiwake-uke'] = T(M(S.zks, { hL: [-0.07, -0.14, 0.17], hR: [0.07, -0.12, 0.2], eL: [0.6, -1, 0.2], eR: [-0.6, -1, 0.2] }), M(S.zks, { hL: [0.25, 0.02, 0.4], hR: [-0.25, 0.02, 0.4], eL: L(DOWN_FWD), eR: DOWN_FWD }), M(hit('fistR', 'auseinander'), { eff: 'fistR', view: 'front3', dur: 2.6 }));
  // langsame, gleichmäßige Bewegung statt schnellem Kime
  D['tc:kakiwake-uke'].keys[2].e = 'io';
  D['tc:nagashi-uke'] = T(M(S.zks, { hL: L(H.hip), hR: [-0.28, 0.05, 0.32], oR: 1, pR: [1, 0, 0], fR: [0, 1, 0.3] }), M(S.zks, { hL: L(H.hip), hR: [0.08, 0.06, 0.26], oR: 1, pR: [1, 0, 0.3], fR: [0, 1, 0.3] }), M(hit('wristR', 'Handfläche'), { eff: 'tipR', view: 'front3' }));
  D['tc:te-nagashi-uke'] = T(M(S.zk, { hL: L(H.guardF), hR: [-0.02, -0.12, 0.5], oR: 1, pR: [1, 0, 0], fR: [0, 0.4, 1] }), M(S.zk, { chest: 18, hL: L(H.guardF), hR: [0.16, -0.16, 0.36], oR: 1, pR: [1, 0, -0.2], fR: [0.2, 0.3, 1] }), M(hit('wristR', 'Handfläche lenkt ab'), { eff: 'tipR', view: 'side3' }));
  D['tc:gedan-nagashi-uke'] = T(M(S.zk, { hL: L(H.guardF), hR: [-0.42, -0.5, 0.18], oR: 1, pR: [1, 0, 0] }), M(S.zk, { hL: L(H.guardF), hR: [0.1, -0.48, 0.33], oR: 1, pR: [1, 0, 0] }), M(hit('wristR', 'Unterarm'), { eff: 'wristR', view: 'front3' }));
  D['tc:osae-uke'] = T(M(S.zks, { hL: L(H.hip), hR: [0.0, -0.1, 0.36], oR: 1, pR: [0, -1, 0] }), M(S.zks, { hL: L(H.hip), hR: [0.02, -0.36, 0.32], oR: 1, pR: [0, -1, 0] }), M(hit('wristR', 'Handfläche'), { eff: 'wristR', view: 'front3' }));
  // Kake-uke wie in Heian Godan 14: aus Kiba-dachi mit rechtem Gedan-barai (Blick nach rechts) wendet sich der Blick nach links;
  // beide Arme holen zusammen aus und liegen vor der Brust übereinander (linke offene Hand oben, rechte Faust darunter),
  // dann langsam und kraftvoll wie beim Spannen eines Bogens: die rechte Faust zieht zur Hüfte, der linke Arm hakt
  // ausgestreckt zur linken Seite (Chudan, Handgelenk außen, Handfläche nach vorn)
  const KU0 = M(KB, { look: -90, hL: L(H.hip), hR: H.gedan });
  const KU1 = M(KB, { look: 90, hL: L(H.hip), hR: H.gedan });
  const KU2 = M(KB, { look: 90, hL: [-0.13, -0.06, 0.3], oL: 1, pL: [0, 0, -1], fL: [-0.3, 1, 0], eL: [0.3, -1, 0.3], hR: [0.13, -0.17, 0.27], eR: [-0.4, -1, 0.3] });
  const KU3 = M(KB, { look: 90, hL: [0.705, -0.1, 0.18], oL: 1, pL: [0.1, 0, 1], fL: [0.15, 1, 0], hR: H.hip });
  D['tc:kake-uke'] = M({ keys: [{ t: 0, p: KU0 }, { t: 0.1, p: KU0 }, { t: 0.2, p: KU1 }, { t: 0.38, p: KU2 }, { t: 0.45, p: KU2 }, { t: 0.88, p: KU3 }], best: 1, dur: 3.6, eff: 'wristL', view: 'front' }, hit('wristL', 'Handgelenk'));
  D['tc:sukui-uke'] = T(M(S.kk, { hL: L(H.hip), hR: [-0.32, -0.55, 0.2], oR: 1, pR: [0, 1, 0] }), M(S.kk, { hL: L(H.hip), hR: [-0.04, -0.3, 0.42], oR: 1, pR: [0, 1, 0] }), M(hit('wristR', 'Handfläche'), { eff: 'wristR', view: 'side3' }));
  // wie Heian Nidan 1: der vordere (linke) Arm schwingt seitlich hoch, Unterarm senkrecht, Faust auf Kopfhöhe,
  // die Rückseite des Unterarms zeigt zum Angriff; die rechte Faust bleibt knapp vor der Hüfte
  D['tc:haiwan-uke'] = T(M(S.kk, { hL: [-0.1, -0.3, 0.22], eL: [0.2, -1, 0.2], hR: H.hip }), M(S.kk, { hL: [0.44, 0.22, 0.16], eL: [0.6, -0.3, 0.2], hR: [-0.2, -0.3, 0.06] }), M(hit('elbowL', 'Unterarm-Rückseite'), { eff: 'fistL', view: 'front3' }));
  D['tc:tsukami-uke'] = M({ keys: [{ t: 0, p: M(S.zks, HANDS_HIP) }, { t: 0.15, p: M(S.zks, HANDS_HIP) }, { t: 0.45, p: M(S.zks, { hL: L(H.hip), hR: [-0.04, 0.03, 0.5], oR: 1, pR: [0, 0, 1], fR: [0, 1, 0.3] }), e: 'kime' }, { t: 0.75, p: M(S.zks, { hL: L(H.hip), hR: [-0.12, -0.25, 0.16] }) }], best: 0.45, dur: 1.8, eff: 'wristR', view: 'side3' }, hit('wristR', 'greifen'));
  D['tc:tate-shuto-uke'] = T(M(S.kk, { hL: [-0.15, 0.02, 0.23], eL: [0.1, -0.5, 0.8], hR: H.hip }), M(S.kk, { hR: H.hip, hL: [0.07, -0.02, 0.5], oL: 1, fL: [0, 1, 0.25], pL: [-0.3, 0, 1] }), M(hit('tipL', 'Handkante senkrecht'), { eff: 'wristL', view: 'side3' }));
  D['tc:teisho-uke'] = T(M(S.zks, { hL: L(H.hip), hR: [-0.38, -0.15, 0.32], oR: 1, fR: [0, 1, 0], pR: [1, 0, 0.5] }), M(S.zks, { hL: L(H.hip), hR: [0.05, -0.15, 0.36], oR: 1, fR: [0, 1, 0], pR: [1, 0, 0.6] }), M(hit('wristR', 'Handballen'), { eff: 'wristR', view: 'front3' }));
  D['tc:uchiotoshi'] = T(M(S.zks, { hL: L(H.hip), hR: [-0.15, 0.35, 0.15] }), M(S.zks, { hL: L(H.hip), hR: [-0.02, -0.25, 0.36], eR: [-0.8, -0.2, 0.3] }), M(hit('elbowR', 'Unterarm'), { eff: 'fistR', view: 'front3' }));
  D['tc:manji-uke'] = T(M(S.kk, HANDS_HIP), M(S.kk, { hL: [0.42, -0.52, 0.18], hR: [-0.34, 0.24, 0.02], eR: [-0.7, 0.2, -0.2] }), M(hit('fistL', 'unten und oben'), { eff: 'fistL', view: 'front3' }));

  /* ---------- Fußtritte (rechtes Bein, aus Hidari Zenkutsu-dachi) ---------- */
  const KAMAE_K = M(ZK_G, {});
  const CHAMBER = { pelvis: [0, 0.8, 0.3], yaw: -12, lean: -4, L: { x: 0.12, z: 0.62, yaw: 4 }, R: { x: -0.08, z: 0.26, y: 0.5, yaw: 0, pitch: -55, kp: [0, 0.5, 1] }, hL: L(H.gedan), hR: H.hip, w: [1, 0] };
  D['mv:mae-geri'] = K(KAMAE_K, CHAMBER, M(CHAMBER, { lean: -9, R: { x: -0.08, z: 1.12, y: 0.93, pitch: 8, kp: [0, 1, 0.3] } }), M(hit('toeR', 'Fußballen'), { eff: 'toeR', view: 'side' }));
  D['tc:mae-geri-kekomi'] = K(KAMAE_K, CHAMBER, M(CHAMBER, { lean: -12, R: { x: -0.08, z: 1.13, y: 0.95, pitch: 62, kp: [0, 1, 0.2] } }), M(hit('heelR', 'Ferse'), { eff: 'heelR', view: 'side' }));
  D['tc:sonoba-geri'] = K(YOI, M(YOI, { pelvis: [0, 0.86, 0.02], L: { x: 0.16, z: 0 }, R: { x: -0.1, z: 0.3, y: 0.5, yaw: 0, pitch: -55, kp: [0, 0.5, 1] }, w: [1, 0] }), M(YOI, { lean: -8, pelvis: [0, 0.86, 0.02], R: { x: -0.1, z: 0.92, y: 0.88, yaw: 0, pitch: 8, kp: [0, 1, 0.3] }, w: [1, 0] }), M(hit('toeR', 'Fußballen'), { eff: 'toeR', view: 'side' }));
  D['tc:kizami-geri'] = K(ZK_KAMAE, M(ZK_KAMAE, { pelvis: [0, 0.82, 0.0], L: { x: 0.1, z: 0.36, y: 0.5, pitch: -55, kp: [0, 0.5, 1] }, R: { z: -0.4 }, w: [0, 1] }), M(ZK_KAMAE, { pelvis: [0, 0.82, -0.02], lean: -10, L: { x: 0.1, z: 0.88, y: 0.95, pitch: 8, kp: [0, 1, 0.3] }, R: { z: -0.4 }, w: [0, 1] }), M(hit('toeL', 'Fußballen'), { eff: 'toeL', view: 'side' }));
  D['tc:ren-geri'] = M(D['mv:mae-geri'], { keys: [{ t: 0, p: KAMAE_K }, { t: 0.08, p: KAMAE_K }, { t: 0.24, p: CHAMBER }, { t: 0.36, p: M(CHAMBER, { R: { z: 1.0, y: 0.6, pitch: 0, kp: [0, 1, 0.3] } }), e: 'kime' }, { t: 0.5, p: CHAMBER }, { t: 0.64, p: M(CHAMBER, { lean: -10, R: { z: 1.0, y: 1.08, pitch: 15, kp: [0, 1, 0.3] } }), e: 'kime' }, { t: 0.78, p: CHAMBER }, { t: 0.95, p: KAMAE_K }], best: 0.64 });
  // Seitwärts aus Kiba-dachi: Fußkante nach rechts, Blick zur Seite
  const KB_K = M(KB, { look: -90 });
  const Y_CH = M(KB_K, { pelvis: [0.12, 0.8, 0], R: { x: -0.22, z: 0.12, y: 0.55, yaw: 0, pitch: -30, kp: [-0.5, 0.6, 0.6] }, L: { x: 0.36 }, w: [1, 0] });
  D['mv:yoko-geri'] = K(KB_K, Y_CH, M(Y_CH, { pelvis: [0.18, 0.84, 0], R: { x: -0.82, z: 0.04, y: 0.86, yaw: 0, pitch: -15, sole: [-1, 0, 0], kp: [-0.2, 1, 0.3] } }), M(hit('heelR', 'Fußkante'), { eff: 'heelR', view: 'front' }));
  D['tc:yoko-geri-keage'] = K(KB_K, Y_CH, M(Y_CH, { pelvis: [0.16, 0.84, 0], R: { x: -0.66, z: 0.1, y: 1.12, yaw: 0, pitch: 20, sole: [-1, 0.3, 0], kp: [-0.4, 1, 0.4] } }), M(hit('heelR', 'Fußkante'), { eff: 'heelR', view: 'front' }));
  const MW_CH = M(KAMAE_K, { pelvis: [0, 0.82, 0.24], yaw: 30, chest: -20, L: { yaw: 40 }, R: { x: -0.42, z: 0.12, y: 0.66, yaw: 70, pitch: 0, kp: [-0.4, 1, 0.7] }, hL: L(H.guardF), hR: H.guardR, w: [1, 0] });
  D['mv:mawashi-geri'] = K(KAMAE_K, MW_CH, M(MW_CH, { yaw: 55, R: { x: 0.12, z: 1.0, y: 1.05, yaw: 75, pitch: 5, kp: [-0.2, 1, 0.5] } }), M(hit('toeR', 'Fußballen'), { eff: 'toeR', view: 'front3' }));
  const US_CH = M(KAMAE_K, { pelvis: [0, 0.82, 0.2], lean: 22, look: 160, R: { x: -0.08, z: 0.32, y: 0.45, yaw: 0, pitch: -70, kp: [0, 0.4, 1] }, w: [1, 0] });
  D['mv:ushiro-geri'] = K(KAMAE_K, US_CH, M(US_CH, { lean: 35, R: { x: -0.08, z: -0.72, y: 0.82, yaw: 180, pitch: -70, kp: [0, -1, 0.2] } }), M(hit('heelR', 'Ferse'), { eff: 'heelR', view: 'side' }));
  D['mv:mikazuki-geri'] = M({ keys: [{ t: 0, p: M(S.zk, { hL: [0.05, -0.05, 0.45], oL: 1, pL: [0, 0, -1], hR: H.hip }) }, { t: 0.15, p: M(S.zk, { hL: [0.05, -0.05, 0.45], oL: 1, pL: [0, 0, -1], hR: H.hip }) }, { t: 0.42, p: M(S.zk, { pelvis: [0, 0.82, 0.25], hL: [0.05, -0.05, 0.45], oL: 1, pL: [-1, 0, 0], hR: H.hip, R: { x: -0.5, z: 0.5, y: 0.72, yaw: 10, pitch: 10, kp: [-0.5, 1, 0.5] }, w: [1, 0] }) }, { t: 0.62, p: M(S.zk, { pelvis: [0, 0.82, 0.25], hL: [0.05, -0.05, 0.45], oL: 1, pL: [-1, 0, 0], hR: H.hip, R: { x: 0.08, z: 0.72, y: 0.95, yaw: 30, pitch: 15, sole: [1, 0, 0], kp: [0, 1, 0.3] }, w: [1, 0] }), e: 'kime' }], best: 1, dur: 1.8, eff: 'toeR', view: 'front3' }, hit('heelR', 'Fußsohle'));
  D['tc:ura-mawashi-geri'] = M({ keys: [{ t: 0, p: KAMAE_K }, { t: 0.12, p: KAMAE_K }, { t: 0.36, p: M(Y_CH, { look: 0 }) }, { t: 0.56, p: M(Y_CH, { look: 0, pelvis: [0.14, 0.84, 0], R: { x: -0.7, z: 0.42, y: 1.12, yaw: 30, pitch: 10, sole: [-0.6, 0, 0.8], kp: [-0.4, 1, 0.3] } }) }, { t: 0.72, p: M(Y_CH, { look: 0, pelvis: [0.14, 0.84, 0], R: { x: -0.1, z: 0.86, y: 1.08, yaw: 30, pitch: 10, sole: [1, 0, 0.2], kp: [-0.4, 1, 0.3] } }), e: 'kime' }], best: 0.72, dur: 1.8, eff: 'heelR', view: 'front3' }, hit('heelR', 'Sohle / Ferse'));
  D['tc:ushiro-mawashi-geri'] = M(D['tc:ura-mawashi-geri'], { keys: [{ t: 0, p: KAMAE_K }, { t: 0.1, p: KAMAE_K }, { t: 0.32, p: M(KAMAE_K, { yaw: -150, look: -170, L: { yaw: -140 }, R: { x: -0.4, z: -0.2, y: 0.4, yaw: -150, pitch: -40, kp: [0, 0.3, -1] }, w: [1, 0] }) }, { t: 0.56, p: M(Y_CH, { look: 0, pelvis: [0.14, 0.84, 0], R: { x: -0.7, z: 0.42, y: 1.12, yaw: 30, pitch: 10, sole: [-0.6, 0, 0.8], kp: [-0.4, 1, 0.3] } }) }, { t: 0.72, p: M(Y_CH, { look: 0, pelvis: [0.14, 0.84, 0], R: { x: -0.1, z: 0.86, y: 1.08, yaw: 30, pitch: 10, sole: [1, 0, 0.2], kp: [-0.4, 1, 0.3] } }), e: 'kime' }], marks: ['turn'] });
  D['tc:hiza-geri'] = K(M(S.zk, { hL: [0.06, 0.02, 0.45], hR: [-0.06, 0.02, 0.45] }), M(S.zk, { pelvis: [0, 0.84, 0.25], hL: [0.06, -0.15, 0.4], hR: [-0.06, -0.15, 0.4], R: { x: -0.08, z: 0.2, y: 0.45, pitch: -70, kp: [0, 0.6, 1] }, w: [1, 0] }), M(S.zk, { pelvis: [0, 0.86, 0.28], lean: 6, hL: [0.08, -0.38, 0.38], hR: [-0.08, -0.38, 0.38], R: { x: -0.08, z: 0.36, y: 0.5, pitch: -70, kp: [0, 1, 0.8] }, w: [1, 0] }), M(hit('kneeR', 'Knie'), { eff: 'kneeR', view: 'side3' }));
  D['tc:mawashi-hiza-geri'] = K(ZK_KAMAE, M(ZK_KAMAE, { pelvis: [0, 0.84, 0.22], yaw: 10, R: { x: -0.5, z: 0.0, y: 0.5, yaw: -40, pitch: -40, kp: [-1, 0.6, 0] }, w: [1, 0] }), M(ZK_KAMAE, { pelvis: [0, 0.86, 0.26], yaw: 45, R: { x: -0.08, z: 0.22, y: 0.55, yaw: 20, pitch: -50, kp: [0.3, 0.6, 1] }, w: [1, 0] }), M(hit('kneeR', 'Knie'), { eff: 'kneeR', view: 'front3' }));
  D['tc:fumikomi'] = K(KAMAE_K, M(CHAMBER, { R: { y: 0.55, z: 0.3 } }), M(CHAMBER, { pelvis: [0, 0.74, 0.32], R: { x: -0.1, z: 0.66, y: 0.1, yaw: -60, pitch: 0, kp: [0, 0.3, 1] } }), M(hit('heelR', 'Fußkante'), { eff: 'heelR', view: 'side3' }));
  D['tc:namigaeshi'] = K(KB, M(KB, { pelvis: [0.08, 0.72, 0], R: { x: -0.2, z: 0.12, y: 0.32, yaw: 30, pitch: -20, sole: [1, 0.3, 0], kp: [-1, 0.4, 0.5] }, w: [1, 0] }), M(KB, { pelvis: [0.1, 0.74, 0], R: { x: -0.04, z: 0.18, y: 0.42, yaw: 40, pitch: -10, sole: [1, 0.5, 0], kp: [-1, 0.5, 0.6] }, w: [1, 0] }), M(hit('heelR', 'Fußsohle'), { eff: 'heelR', view: 'front' }));
  D['tc:nidan-geri'] = M({ keys: [{ t: 0, p: KAMAE_K }, { t: 0.12, p: KAMAE_K }, { t: 0.36, p: M(KAMAE_K, { pelvis: [0, 1.15, 0.3], L: { x: 0.1, z: 0.62, y: 0.68, pitch: 10, kp: [0, 1, 0.5] }, R: { x: -0.08, z: 0.1, y: 0.62, pitch: -50, kp: [0, 0.6, 1] }, w: [0, 0] }) }, { t: 0.58, p: M(KAMAE_K, { pelvis: [0, 1.2, 0.32], lean: -8, L: { x: 0.1, z: 0.3, y: 0.62, pitch: -50, kp: [0, 0.6, 1] }, R: { x: -0.08, z: 1.05, y: 1.45, pitch: 15, kp: [0, 1, 0.3] }, w: [0, 0] }), e: 'kime' }], best: 1, dur: 1.8, eff: 'toeR', view: 'side' }, hit('toeR', 'zweiter Tritt'));

  /* ---------- Fußfeger ---------- */
  const SWEEP_END = M(KAMAE_K, { pelvis: [0, 0.76, 0.24], yaw: 10, R: { x: 0.2, z: 0.56, y: 0.12, yaw: 70, pitch: 5, sole: [1, 0.2, 0.3], kp: [0.3, 0.3, 1] }, w: [1, 0] });
  D['tc:ashi-barai'] = T(KAMAE_K, SWEEP_END, { eff: 'heelR', view: 'front3' });
  D['tc:teisoku-barai'] = T(KAMAE_K, SWEEP_END, M(hit('heelR', 'Fußsohle'), { eff: 'heelR', view: 'front3' }));
  D['tc:haisoku-barai'] = SEQ([ZK_KAMAE, M(ZK_KAMAE, { pelvis: [0, 0.76, 0.02], R: { z: -0.46 }, L: { x: 0.32, z: 0.72, y: 0.14, yaw: -30, pitch: -10, kp: [0.5, 0.3, 1] }, w: [0, 1] }), M(ZK_KAMAE, { pelvis: [0, 0.76, 0.0], R: { z: -0.46 }, L: { x: -0.02, z: 0.86, y: 0.16, yaw: -60, pitch: -20, kp: [0, 0.3, 1] }, w: [0, 1] })], M(hit('toeL', 'Spann'), { eff: 'toeL', view: 'front3' }));
  D['tc:komura-barai'] = SEQ([M(MZK_G), M(MZK_G, { pelvis: [0, 0.76, 0.06], R: { x: 0.1, z: 0.8, y: 0.2, yaw: 30, kp: [0.3, 0.5, 1] }, w: [1, 0] }), M(MZK_G, { pelvis: [0, 0.74, 0.05], R: { x: 0.2, z: 0.36, y: 0.3, yaw: 40, pitch: -30, kp: [0.4, 0.4, 1] }, w: [1, 0] })], M(hit('kneeR', 'Wade'), { eff: 'ankleR', view: 'side3' }));

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
  D['tc:yoi'] = T(S.musubi, S.hachiji, { view: 'front3' });
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
  D['tc:maai'] = STILL(FIGHT, { partner: [{ t: 0, p: OPP(FIGHT, 2.3) }], view: 'side', marks: ['maai'] });
  D['tc:kogeki'] = M(D['mv:oi-zuki'], { keys: [{ t: 0, p: ZK_G }, { t: 0.12, p: ZK_G }, { t: 0.5, p: OI_MID }, { t: 0.82, p: M(OI_END, { hR: H.jodan }), e: 'kime' }], partner: [{ t: 0, p: OPP(M(S.hachiji), 2.25) }], view: 'side' });
  D['tc:kogeki'] = TWIST(D['tc:kogeki'], 'R');
  D['tc:deai'] = M(T(FIGHT, M(S.zks, { pelvis: [0, 0.71, 0.12], hL: L(H.hip), hR: H.chudan })), { partner: [{ t: 0, p: OPP(ZK_G, 2.15) }, { t: 0.22, p: OPP(ZK_G, 2.15) }, { t: 0.62, p: OPP(M(OI_MID, { hR: [-0.05, 0.0, 0.4] }), 2.15) }], eff: 'fistR', view: 'side', hit: { at: 'fistR', text: 'Konter' } });
  D['tc:zanshin'] = STILL(M(S.zks, { hL: L(H.guardF), hR: H.guardR, look: 0 }), { partner: [{ t: 0, p: OPP(M(S.hachiji, { lean: -4 }), 1.7) }], view: 'side', marks: ['gaze'] });
  D['tc:bunkai'] = T(MZK, M(MZK, { hL: L(H.hip), hR: [0.06, 0.28, 0.22], eR: UP_OUT }), { partner: [{ t: 0, p: OPP(M(ZK_G, {}), 1.75) }, { t: 0.22, p: OPP(ZK_G, 1.75) }, { t: 0.62, p: OPP(M(OI_MID, { pelvis: [0, 0.71, 0.45], hR: [0.0, 0.05, 0.5], hL: L(H.hip) }), 1.75) }], eff: 'fistR', view: 'side', hit: { at: 'elbowR', text: 'Age-uke' } });

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
    'tc:sanbon-zuki': 'seiken', 'tc:ren-zuki': 'seiken', 'tc:morote-zuki': 'seiken:LR', 'tc:kagi-zuki': 'seiken', 'tc:ura-zuki': 'seiken',
    'tc:age-zuki': 'seiken', 'tc:yama-zuki': 'seiken:LR', 'tc:awase-zuki': 'seiken:LR', 'tc:otoshi-zuki': 'seiken', 'tc:mawashi-zuki': 'seiken',
    'tc:nukite': 'fingerspitzen', 'tc:kogeki': 'seiken', 'tc:deai': 'seiken',
    'tc:uraken-uchi': 'uraken', 'tc:tettsui-uchi': 'tettsui', 'tc:shuto-uchi': 'shuto', 'tc:haito-uchi': 'haito', 'tc:teisho-uchi': 'teisho',
    'tc:enpi-uchi': 'ellbogen', 'tc:furi-enpi': 'ellbogen', 'tc:yoko-enpi': 'ellbogen', 'tc:mawashi-enpi': 'ellbogen', 'tc:age-enpi': 'ellbogen',
    'tc:otoshi-enpi': 'ellbogen', 'tc:ushiro-enpi': 'ellbogen', 'tc:hasami-uchi': 'tettsui:LR',
    'mv:age-uke': 'unterarm', 'mv:gedan-barai': 'unterarm', 'mv:soto-uke': 'unterarm', 'mv:uchi-uke': 'unterarm', 'tc:bunkai': 'unterarm',
    'tc:shuto-uke': 'shuto', 'tc:morote-uke': 'unterarm:L', 'tc:juji-uke': 'handgelenk:LR', 'tc:kakiwake-uke': 'unterarm:LR',
    'tc:nagashi-uke': 'handflaeche', 'tc:te-nagashi-uke': 'handflaeche', 'tc:gedan-nagashi-uke': 'unterarm', 'tc:osae-uke': 'handflaeche',
    'tc:kake-uke': 'handgelenk', 'tc:sukui-uke': 'handflaeche', 'tc:haiwan-uke': 'unterarm', 'tc:tsukami-uke': 'handflaeche',
    'tc:tate-shuto-uke': 'shuto', 'tc:teisho-uke': 'teisho', 'tc:uchiotoshi': 'unterarm', 'tc:manji-uke': 'unterarm:LR',
    'mv:mae-geri': 'koshi', 'tc:mae-geri-kekomi': 'kakato', 'tc:sonoba-geri': 'koshi', 'tc:kizami-geri': 'koshi', 'tc:ren-geri': 'koshi',
    'mv:yoko-geri': 'sokuto', 'tc:yoko-geri-keage': 'sokuto', 'mv:mawashi-geri': 'koshi', 'mv:ushiro-geri': 'kakato',
    'mv:mikazuki-geri': 'teisoku', 'tc:ura-mawashi-geri': 'teisoku', 'tc:ushiro-mawashi-geri': 'teisoku', 'tc:hiza-geri': 'hiza',
    'tc:mawashi-hiza-geri': 'hiza', 'tc:fumikomi': 'sokuto', 'tc:namigaeshi': 'teisoku', 'tc:nidan-geri': 'koshi',
    'tc:teisoku-barai': 'teisoku', 'tc:haisoku-barai': 'haisoku', 'tc:komura-barai': 'wade',
    'wp:hiji': 'ellbogen', 'wp:hiza': 'hiza', 'wp:zenwan': 'unterarm',
  };
  Object.keys(FLAECHE).forEach((id) => {
    const h = D[id] && D[id].hit;
    if (!h) throw new Error(`Trefferfläche ohne Trefferpunkt: ${id}`);
    const [fl, sides] = FLAECHE[id].split(':');
    D[id].hit = M(h, { fl, sides: sides || h.at.slice(-1) });
  });

  SK.fig3dDefs = D;
  SK.fig3dPose = { M, mirror, rotate, move, S, H };
})();
