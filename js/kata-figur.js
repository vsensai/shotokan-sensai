/* Kata als 3D-Figur: die ganze Kata als durchgehende Bewegung (Ansicht „Figur“ im Kata-Trainer, Versuchsseite labor/kata.html).
   Baut aus zwei vorhandenen Quellen einen durchgehenden Ablauf der ganzen Kata:
   – Bodenkarte der Kata-Ansage (SK.ansagePoses): Platz, Richtung und Gewicht beider Füße je Bewegung, Körperrichtung, Drehung
   – Technik-Abläufe des Lexikons (SK.fig3dDefs): Ausholen und Endstellung von Armen, Hüfte und Oberkörper
   Dazwischen wird gerechnet: Der Fuß, der den Platz wechselt, gleitet am Standfuß vorbei; die Hüfte wandert auf gleicher
   Höhe mit; Fußrichtungen und Knie drehen mit dem Körper (immer in der Drehrichtung der Kata); der Kopf dreht voraus.
   Ergebnis: pose(t) für jeden Zeitpunkt (Sekunden), im Takt der Kata-Ansage (SK.ansageTimeline).
   Welt wie in figur3d.js: x = links (bei Blick nach vorne), y = oben, z = vorne; Karte: x rechts, y vorne, Winkel im Uhrzeigersinn. */
(function () {
  'use strict';
  const E = window.Figur3D;
  if (!E || !SK.fig3dPose || !SK.ansageTimeline) return;
  const { M, mirror, S, H } = SK.fig3dPose;
  const D = SK.fig3dDefs;
  const RAD = Math.PI / 180;

  const SCALE = 2; // Meter je Karteneinheit: damit sind die Stände der Karte etwa so lang wie die der Figur
  const FOOT_MID = 0.055; // die Fußmitte (Karte) liegt so weit vor dem Knöchel (Figur)
  const LEG = 0.88 * 0.99; // so weit reicht ein Bein von der Hüfte zum Knöchel
  const HIP = 0.09; // Hüftgelenk seitlich neben der Beckenmitte
  const PASS = 0.15; // Abstand der Fußmitten, wenn ein Fuß am Standfuß vorbeigleitet
  const LIFT = 0.025; // so hoch hebt der gleitende Fuß ab (Suri-ashi: fast gar nicht)
  const STRIKE = 0.22; // Sekunden für den Schlag bzw. Block am Ende einer Bewegung
  const LEAD = 75; // so weit dreht der Kopf dem Körper voraus (Grad)
  const BOW = 30; // Verbeugung (Grad)
  const BODY = [0.2, 0.19]; // Rumpf vor der Brustmitte: halbe Breite und Tiefe, in die keine Hand eintaucht (Meter)
  const LEVEL = 0.035; // so weit darf die Hüfte dabei von der Höhe des Standes abweichen (Meter)
  const STRAIGHT = 0.9; // ab dieser Streckung gilt ein Bein im Stand der Figur als gestrecktes Bein (Zenkutsu-dachi hinten)

  /* ---------- Rechnen ---------- */
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const smooth = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };
  const ramp = (a, b, v) => smooth((v - a) / (b - a));
  const wrap = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
  const fwd = (deg) => [Math.sin(deg * RAD), Math.cos(deg * RAD)];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const mul = (a, s) => [a[0] * s, a[1] * s];
  const mix = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
  const len = (a) => Math.hypot(a[0], a[1]);
  // (x, z) als komplexe Zahl: Drehstreckung, die den Stand der Figur auf die Füße der Karte legt
  const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const cdiv = (a, b) => { const n = dot(b, b); return [(a[0] * b[0] + a[1] * b[1]) / n, (a[1] * b[0] - a[0] * b[1]) / n]; };
  const rotY = (v, deg) => { const c = Math.cos(deg * RAD), s = Math.sin(deg * RAD); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; };
  const mix3 = (a, b, u) => a.map((x, i) => lerp(x, b[i], u));
  // Kurve durch a (u = 0), m (u = 0,5) und b (u = 1)
  const via = (a, m, b, u) => { const c = sub(mul(m, 2), mul(add(a, b), 0.5)); const v = 1 - u; return add(add(mul(a, v * v), mul(c, 2 * u * v)), mul(b, u * u)); };
  // Schritt: weich anlaufen, zügig durch, am Ende zum Stehen (etwas später als ein gleichmäßiges Hin und Her)
  const stepEase = (u) => smooth(Math.pow(clamp(u), 1.2));

  /* ---------- Stände und Techniken ---------- */
  const STAND = [[/zenkutsu/i, 'zk'], [/kokutsu/i, 'kk'], [/kiba/i, 'kb'], [/hachiji/i, 'hachiji'], [/musubi/i, 'musubi'], [/heisoku/i, 'heisoku']];
  // Technik → Ablauf im Lexikon. side: Seite, die dort arbeitet (andere Seite = gespiegelt); from: Zeitpunkt im Ablauf, an dem
  // ausgeholt ist; direkt: ohne Ausholen aus der vorigen Haltung (Stoß); dur: eigene Dauer der ganzen Bewegung (Sekunden),
  // lang: der Ablauf selbst füllt fast die ganze Bewegung (großer Kreis)
  const TECH = [
    [/gedan-barai/i, { def: 'mv:gedan-barai', side: 'L', from: 0.25 }],
    [/oi-zuki/i, { def: 'mv:oi-zuki', side: 'R', from: 0.38, direkt: true }],
    [/age-uke/i, { def: 'mv:age-uke', side: 'R', from: 0.25 }],
    [/kentsui tate-mawashi-uchi/i, { def: 'tc:tettsui-uchi', side: 'R', from: 0.15, lang: true, dur: 1.0 }],
    [/shuto .*uke/i, { def: 'tc:shuto-uke', side: 'L', from: 0.25 }],
  ];
  // Arme, Hüftdrehung (yaw, bezogen auf die Körperrichtung), Oberkörper und Kopf (look, bezogen auf die Körperrichtung)
  const UP = ['hL', 'hR', 'eL', 'eR', 'oL', 'oR', 'pL', 'pR', 'fL', 'fR', 'qL', 'qR', 'sL', 'sR', 'chest', 'lean', 'roll', 'nod', 'tilt', 'look', 'yaw'];
  const upper = (p) => { const f = E.full(p); const o = {}; UP.forEach((k) => (o[k] = f[k])); return o; };
  // Seiten tauschen samt Faustdrehung beim Stoß (die kennt mirror nicht)
  const flip = (p) => { const f = E.full(p); return M(mirror(p), { sL: f.sR, sR: f.sL }); };
  const sideOf = (tech) => { const m = tech.match(/(Hidari|Migi)(?!.*(Hidari|Migi))/); return m && m[1] === 'Migi' ? 'R' : 'L'; };

  // Ablauf einer Technik als Funktion w = 0 (ausgeholt) … 1 (Endstellung)
  function track(tech, side) {
    const d = D[tech.def];
    const keys = d.keys.map((k) => ({ t: k.t, e: k.e, p: side === tech.side ? k.p : flip(k.p) }));
    const tl = E.timeline(keys);
    const t1 = keys[keys.length - 1].t;
    return (w) => upper(tl(lerp(tech.from, t1, clamp(w))));
  }

  // Stand der Figur auf die Füße der Karte legen. m: Stellung der Ansage, stance: Name des Standes
  function lower(m, stance, warn) {
    const key = (STAND.find(([rx]) => rx.test(stance)) || [])[1];
    if (!key) warn.push(`Kein Stand der Figur für „${stance}“ – Hachiji-dachi genommen`);
    let c = E.full(S[key || 'hachiji']);
    const byaw = -m.body;
    const feet = m.f.map((x) => ({ c: [-x[0] * SCALE, x[1] * SCALE], yaw: -x[2], w: x[3] }));
    // welcher Fuß steht vorne? Die Stände der Figur haben den linken vorne – sonst spiegeln
    const ahead = dot(sub(feet[1].c, feet[0].c), fwd(byaw));
    if (c.L.z - c.R.z > 0.1 && ahead > 0.05) c = E.full(mirror(c));
    const ank = feet.map((ft) => sub(ft.c, mul(fwd(ft.yaw), FOOT_MID)));
    const cr = [c.R.x, c.R.z];
    const a = cdiv(sub(ank[0], ank[1]), sub([c.L.x, c.L.z], cr));
    const foot = (F, ft) => {
      const rel = wrap(ft.yaw - byaw);
      // Knie: wie im Stand der Figur vorgegeben, sonst in Fußrichtung (beides bezogen auf die Körperrichtung)
      const kp = Math.hypot(...F.kp) > 0.01 ? F.kp.map((v) => v / Math.hypot(...F.kp)) : [Math.sin(rel * RAD), 0.15, Math.cos(rel * RAD)];
      return { c: ft.c, rel, y: F.y, pitch: F.pitch, tu: F.tu, kp };
    };
    // wie weit die Beine im Stand der Figur gestreckt sind (Anteil der Beinlänge)
    const J = E.solve(c);
    const ext = {};
    ['L', 'R'].forEach((s) => (ext[s] = Math.hypot(...J['hip' + s].map((v, i) => v - J['ankle' + s][i])) / 0.88));
    return { pel: add(ank[1], cmul(a, sub([c.pelvis[0], c.pelvis[2]], cr))), h: c.pelvis[1], ext, ank: { L: ank[0], R: ank[1] }, L: foot(c.L, feet[0]), R: foot(c.R, feet[1]), w: [feet[0].w, feet[1].w] };
  }
  // Hüfthöhe einer Stellung: Ein Bein, das im Stand der Figur (fast) gestreckt ist, bleibt es auch – ist der Stand der Karte
  // kürzer oder länger als der der Figur, steht die Hüfte entsprechend höher oder tiefer (sonst knickt das hintere Bein ein)
  function height(low, yaw) {
    const lp = [Math.cos(yaw * RAD), -Math.sin(yaw * RAD)];
    const r = {};
    ['L', 'R'].forEach((s) => (r[s] = len(sub(low.ank[s], add(low.pel, mul(lp, s === 'L' ? HIP : -HIP))))));
    const top = (s, e) => low[s].y + Math.sqrt(Math.max(0.01, e * e * 0.88 * 0.88 - r[s] * r[s]));
    const s = low.ext.L > low.ext.R ? 'L' : 'R';
    const o = s === 'L' ? 'R' : 'L';
    if (low.ext[s] <= STRAIGHT) return low.h;
    // … aber nur in Grenzen: die Skizzen sind mal gestaucht, mal gestreckt, die Hüfte soll trotzdem auf einer Höhe bleiben
    const want = Math.min(top(s, Math.max(low.ext[s], 0.97)), top(o, 0.99));
    return low.h > 0.85 ? want : clamp(want, low.h - LEVEL, low.h + LEVEL);
  }

  // Hand nicht durch den Rumpf: Wechselt eine Hand zwischen zwei Haltungen die Seite (Hüfte → Ohr der anderen Seite), führt
  // der gerade Weg durch die Brust. Vor dem Rumpf (Brustkoordinaten, halbe Ellipse) bleibt sie deshalb mindestens so weit vorn
  function clear(h) {
    const fy = ramp(-0.5, -0.4, h[1]) * (1 - ramp(0, 0.15, h[1]));
    const zMin = Math.abs(h[0]) < BODY[0] ? BODY[1] * Math.sqrt(1 - (h[0] / BODY[0]) ** 2) * fy : 0;
    return h[2] < zMin && h[2] > -0.1 ? [h[0], h[1], zMin] : h;
  }

  /* ---------- Ein Abschnitt: von Stellung A nach Stellung B ---------- */
  // Wie gleitet der Fuß s von A nach B? Liegt der Standfuß auf dem Weg, führt die Bahn dicht an ihm vorbei (Füße kommen
  // zusammen); gleitet der Fuß nur von ihm weg (Ausfallschritt zur Seite), geht er gerade.
  function footPlan(A, B, s, o, u0, u1) {
    const a = A.low[s].c;
    const b = B.low[s].c;
    const moved = len(sub(b, a)) > 1e-6;
    const plan = { moved, u0, u1, mid: mix(a, b, 0.5), k: 0 };
    if (!moved || len(sub(B.low[o].c, A.low[o].c)) > 1e-6) return plan;
    const sp = A.low[o].c;
    const ab = sub(b, a);
    const tau = dot(sub(sp, a), ab) / dot(ab, ab);
    const off = sub(add(a, mul(ab, tau)), sp); // vom Standfuß zur Bahn
    const k = ramp(0.05, 0.25, tau) * (1 - ramp(0.75, 0.95, tau)) * (1 - ramp(0.35, 0.7, len(off)));
    if (k <= 0) return plan;
    // Seite, auf der der Fuß vorbeigeht: wie die gerade Bahn; läuft sie genau über den Standfuß, die eigene Körperseite
    const yawMid = lerp(A.byaw, B.byaw, 0.5);
    const own = mul([Math.cos(yawMid * RAD), -Math.sin(yawMid * RAD)], s === 'L' ? 1 : -1);
    const n = len(off) > 0.03 ? mul(off, 1 / len(off)) : own;
    plan.near = add(sp, mul(n, PASS));
    plan.mid = mix(plan.mid, plan.near, k);
    plan.k = k;
    plan.sp = sp;
    return plan;
  }

  function segment(A, B, o) {
    const seg = Object.assign({ A, B, ease: stepEase }, o);
    const both = ['L', 'R'].every((s) => len(sub(B.low[s].c, A.low[s].c)) > 1e-6);
    // beide Füße wechseln den Platz (Yoi, Schluss): nacheinander, erst der linke
    const first = o.first || 'L';
    seg.feet = {};
    ['L', 'R'].forEach((s) => {
      const [u0, u1] = both ? (s === first ? [0, 0.5] : [0.5, 1]) : [0, 1];
      seg.feet[s] = footPlan(A, B, s, s === 'L' ? 'R' : 'L', u0, u1);
    });
    // Hüfte: beim Vorbeigleiten über dem Standbein (zwischen den Füßen), sonst gerade hinüber
    const pl = seg.feet.L.k > seg.feet.R.k ? seg.feet.L : seg.feet.R;
    seg.pelMid = mix(A.low.pel, B.low.pel, 0.5);
    if (pl.k > 0) seg.pelMid = mix(seg.pelMid, mix(pl.sp, pl.near, 0.5), pl.k);
    return seg;
  }

  // Bewegung auf der Stelle mit Zwischenschritt (via der Ansage): hin bis u = 0,45, dann zurück an den Platz
  const hump = (u) => (u < 0.45 ? smooth(u / 0.45) : 1 - stepEase((u - 0.45) / 0.55));

  function poseAt(seg, u) {
    const { A, B } = seg;
    const eb = seg.ease(u);
    const byaw = lerp(A.byaw, B.byaw, eb);
    const up = seg.arms(u);
    const P = { w: [lerp(A.low.w[0], B.low.w[0], eb), lerp(A.low.w[1], B.low.w[1], eb)] };
    UP.forEach((k) => (P[k] = up[k]));
    P.hL = clear(P.hL);
    P.hR = clear(P.hR);
    P.yaw = byaw + up.yaw;
    // Kopf: dreht in die neue Richtung voraus, der Körper folgt
    P.look = byaw + up.look + clamp(B.byaw - byaw, -LEAD, LEAD) * ramp(0, 0.22, u);
    let pel = via(A.low.pel, seg.pelMid, B.low.pel, eb);
    ['L', 'R'].forEach((s) => {
      const fa = A.low[s];
      const fb = B.low[s];
      const pl = seg.feet[s];
      const uf = clamp((u - pl.u0) / (pl.u1 - pl.u0));
      const ef = pl.moved ? seg.ease(uf) : eb;
      let c = pl.moved ? via(fa.c, pl.mid, fb.c, ef) : fa.c;
      let rel = lerp(fa.rel, fb.rel, ef);
      let y = lerp(fa.y, fb.y, ef) + (pl.moved ? LIFT * Math.pow(Math.sin(Math.PI * uf), 2) : 0);
      const v = seg.via && seg.via.s === s ? seg.via : null;
      if (v) {
        const hu = hump(u);
        c = mix(fa.c, v.c, hu);
        rel = lerp(fa.rel, v.rel, hu);
        y += LIFT * Math.pow(Math.sin(Math.PI * u), 2);
        // das Gewicht geht mit zurück und kommt mit dem Schlag wieder nach vorne
        pel = add(pel, mul(sub(v.c, fa.c), 0.45 * hu));
      }
      const yaw = byaw + rel;
      const ank = sub(c, mul(fwd(yaw), FOOT_MID));
      P[s] = { x: ank[0], z: ank[1], y, yaw, pitch: lerp(fa.pitch, fb.pitch, ef), tu: lerp(fa.tu, fb.tu, ef), kp: rotY(mix3(fa.kp, fb.kp, ef), byaw), sole: [0, 0, 0] };
    });
    // Hüfthöhe: wie im Stand, aber nie höher, als beide Beine reichen (die Stände der Karte sind verschieden lang)
    let h = lerp(A.low.h, B.low.h, eb);
    const lp = [Math.cos(P.yaw * RAD), -Math.sin(P.yaw * RAD)];
    ['L', 'R'].forEach((s) => {
      const hip = add(pel, mul(lp, s === 'L' ? HIP : -HIP));
      const r = len(sub([P[s].x, P[s].z], hip));
      h = Math.min(h, P[s].y + Math.sqrt(Math.max(0.01, LEG * LEG - r * r)));
    });
    P.pelvis = [pel[0], h, pel[1]];
    return E.full(P);
  }

  /* ---------- Die ganze Kata ---------- */
  // opt.beat: Abstand zweier Zählzeiten in Sekunden (2 = Training, wie in der Kata-Ansage)
  function build(k, opt) {
    const beat = (opt && opt.beat) || 2;
    const steps = SK.ansageTimeline(k, beat, true);
    const warn = [];
    const segs = [];
    const marks = [];
    const ends = steps.map((st) => st.t); // je Ansage: Zeitpunkt, zu dem ihre Bewegung fertig ist
    const key = (m, stance, prev, up) => {
      const turn = m.turn != null && prev ? -m.turn : prev ? wrap(-m.body - prev.byaw) : -m.body;
      const byaw = prev ? prev.byaw + turn : turn;
      if (Math.abs(wrap(byaw + m.body)) > 1) warn.push(`Drehung passt nicht zur Körperrichtung (${stance})`);
      const low = lower(m, stance, warn);
      low.h = height(low, byaw + up.yaw);
      return { low, byaw, up };
    };
    // Übergang der Haltung in d Sekunden (ruhig)
    const calm = (a, b, u0 = 0, u1 = 1) => { const tl = E.timeline([{ t: u0, p: a }, { t: u1, p: b }]); return (u) => upper(tl(u)); };
    const bow = (up) => (u) => M(up, { lean: BOW * (ramp(0.08, 0.38, u) - ramp(0.62, 0.92, u)), nod: 8 * (ramp(0.08, 0.38, u) - ramp(0.62, 0.92, u)) });

    // Rei, Yoi, Naore, Schluss: Die Skizze zeichnet die Füße größer als die Schritte, enge Stände geraten dadurch doppelt so
    // breit. Sie bekommen die Breite der Figur: Yoi und Naore um den Fuß herum, der in die Kata hinein bzw. aus ihr heraus
    // stehen bleibt, die Verbeugung davor und danach mittig darüber
    const n = steps.length;
    const fix = [[2, 3, 'hachiji'], [1, 2, 'musubi'], [0, 2, 'musubi'], [n - 2, n - 3, 'hachiji'], [n - 1, n - 2, 'musubi']];
    const fixed = {};
    fix.forEach(([j, ref, st]) => {
      const m = steps[j].pose;
      const r = fixed[ref] || steps[ref].pose;
      const c = E.full(S[st]);
      const wide = Math.hypot(c.L.x - c.R.x + FOOT_MID * (Math.sin(c.L.yaw * RAD) - Math.sin(c.R.yaw * RAD)), c.L.z - c.R.z) / SCALE;
      const d = sub(m.f[1], m.f[0]);
      const u = mul(d, wide / len(d));
      const pin = [0, 1].find((i) => m.f[i][0] === r.f[i][0] && m.f[i][1] === r.f[i][1]);
      let l;
      if (pin === 0) l = m.f[0].slice(0, 2);
      else if (pin === 1) l = sub(m.f[1], u);
      else l = sub(mix(r.f[0], r.f[1], 0.5), mul(u, 0.5));
      fixed[j] = Object.assign({}, m, { f: [l.concat(m.f[0].slice(2)), add(l, u).concat(m.f[1].slice(2))] });
    });
    Object.keys(fixed).forEach((j) => (steps[j] = Object.assign({}, steps[j], { pose: fixed[j] })));

    const musubi = upper(S.musubi);
    const yoiUp = upper(S.hachiji);
    let cur = key(steps[0].pose, 'Musubi-dachi', null, musubi);
    steps.forEach((st, i) => {
      const next = steps[i + 1];
      const gap = next ? next.t - st.t : 3;
      if (st.kind === 'name') return;
      if (st.kind === 'cmd' && st.ro === 'Rei' && i < 3) {
        segs.push(segment(cur, cur, { t0: st.t, t1: st.t + Math.min(2.2, gap), arms: bow(musubi) }));
        marks.push({ t: st.t, t1: st.t + 2.2, kan: st.kan, ro: st.ro, text: 'Musubi-dachi' });
        return;
      }
      if (st.kind === 'cmd' && st.ro === 'Yoi') {
        const nk = key(st.pose, st.stance, cur, yoiUp);
        segs.push(segment(cur, nk, { t0: st.t, t1: st.t + 1.5, arms: calm(musubi, yoiUp, 0.25, 1), ease: smooth }));
        marks.push({ t: st.t, t1: st.t + 1.5, kan: st.kan, ro: st.ro, text: st.stance });
        cur = nk;
        return;
      }
      if (st.kind === 'cmd' && st.ro === 'Naore') {
        const nk = key(st.pose, st.stance, cur, yoiUp);
        segs.push(segment(cur, nk, { t0: st.t, t1: st.t + 1.8, arms: calm(cur.up, yoiUp), ease: smooth }));
        marks.push({ t: st.t, t1: st.t + 1.8, kan: st.kan, ro: st.ro, text: st.stance });
        cur = nk;
        return;
      }
      if (st.kind === 'cmd') {
        // Schluss: Füße schließen zum Musubi-dachi, dann Verbeugung
        const nk = key(st.pose, 'Musubi-dachi', cur, musubi);
        segs.push(segment(cur, nk, { t0: st.t, t1: st.t + 1.2, arms: calm(cur.up, musubi), ease: smooth }));
        segs.push(segment(nk, nk, { t0: st.t + 1.4, t1: st.t + 3.6, arms: bow(musubi) }));
        marks.push({ t: st.t, t1: st.t + 3.6, kan: st.kan, ro: st.ro, text: 'Musubi-dachi' });
        cur = nk;
        return;
      }
      // eine Bewegung der Kata
      const m = st.pose;
      const tech = (TECH.find(([rx]) => rx.test(st.tech)) || [])[1];
      const side = sideOf(st.tech);
      const d = Math.min((tech && tech.dur) || (m.via ? 0.9 : 0.62 + 0.0016 * Math.abs(m.turn || 0)), 0.85 * gap);
      const uS = tech && tech.lang ? 0.1 : clamp(1 - STRIKE / d, 0.3, 0.8);
      let arms;
      let end;
      if (!tech) {
        warn.push(`${st.n}: keine Figur-Technik für „${st.tech}“ – Fäuste an der Hüfte`);
        end = M(cur.up, { hL: [-H.hip[0], H.hip[1], H.hip[2]], hR: H.hip, yaw: 0, chest: 0, lean: 0 });
        arms = calm(cur.up, end);
      } else {
        const tr = track(tech, side);
        end = tr(1);
        if (tech.direkt) {
          // Stoß: Haltung bleibt, bis der Schritt fast steht – dann Hüfte, Stoß und Hikite zusammen
          const tl = E.timeline([{ t: 0, p: cur.up }, { t: uS, p: cur.up }, { t: 1, p: end, e: 'kime' }]);
          arms = (u) => upper(tl(u));
        } else {
          const pre = E.timeline([{ t: 0, p: cur.up }, { t: uS, p: tr(0) }]);
          arms = (u) => (u < uS ? upper(pre(u)) : tr((u - uS) / (1 - uS)));
        }
      }
      const nk = key(m, st.stance, cur, end);
      const seg = segment(cur, nk, { t0: st.t, t1: st.t + d, arms });
      if (m.via) {
        const s = m.via[0] ? 'R' : 'L';
        seg.via = { s, c: [-m.via[1] * SCALE, m.via[2] * SCALE], rel: wrap(-m.via[3] + m.body) };
      }
      segs.push(seg);
      marks.push({ t: st.t, t1: st.t + d, n: st.n, kan: st.kan, ro: st.ro, text: `${st.stance} · ${st.tech}`, kiai: st.kiai });
      cur = nk;
    });
    steps.forEach((st, i) => segs.forEach((sg) => { if (sg.t0 >= st.t - 1e-9 && (i + 1 >= steps.length || sg.t0 < steps[i + 1].t - 1e-9)) ends[i] = Math.max(ends[i], sg.t1); }));
    const dur = segs[segs.length - 1].t1 + 1;
    function pose(t) {
      let i = 0;
      while (i + 1 < segs.length && segs[i + 1].t0 <= t) i++;
      const sg = segs[i];
      return poseAt(sg, clamp((t - sg.t0) / (sg.t1 - sg.t0)));
    }
    // Zählzeit zum Zeitpunkt t (für Anzeige und Sprünge)
    const markAt = (t) => { let i = -1; while (i + 1 < marks.length && marks[i + 1].t <= t) i++; return i; };
    return { kata: k, beat, dur, pose, marks, markAt, ends, warn, lines: k.ansage.lines.map((l) => [-l[0] * SCALE, l[1] * SCALE, -l[2] * SCALE, l[3] * SCALE]) };
  }

  // Prüfung des fertigen Ablaufs: jedes Bild rechenbar, Füße am Boden erreichen ihren Platz, keine Sprünge
  function check(anim, fps = 60) {
    const out = [];
    let prev = null;
    let low = 0;
    for (let i = 0; i <= anim.dur * fps; i++) {
      const t = i / fps;
      const P = anim.pose(t);
      const J = E.solve(P);
      const flat = JSON.stringify(J);
      if (/null|NaN/.test(flat)) { out.push(`${t.toFixed(2)} s: Bild nicht rechenbar`); break; }
      ['L', 'R'].forEach((s) => {
        const miss = Math.hypot(J['ankle' + s][0] - P[s].x, J['ankle' + s][1] - P[s].y, J['ankle' + s][2] - P[s].z);
        if (miss > 0.004) out.push(`${t.toFixed(2)} s: Fuß ${s} erreicht seinen Platz nicht (${Math.round(miss * 1000)} mm)`);
      });
      if (prev) {
        ['fistL', 'fistR', 'ankleL', 'ankleR', 'pel', 'head'].forEach((q) => {
          const v = Math.hypot(J[q][0] - prev[q][0], J[q][1] - prev[q][1], J[q][2] - prev[q][2]) * fps;
          if (v > (q.startsWith('fist') ? 28 : 12)) out.push(`${t.toFixed(2)} s: ${q} springt (${v.toFixed(1)} m/s)`);
        });
      }
      low = Math.max(low, 0.6 - P.pelvis[1]);
      prev = J;
    }
    if (low > 0) out.push(`Hüfte sinkt bis ${(0.6 - low).toFixed(2)} m (Stand der Karte zu lang für die Beine)`);
    return out;
  }

  /* ---------- Bühne für den Kata-Trainer ---------- */
  // Freigegebene Kata: Ablauf von Hand durchgesehen, alle Stände und Techniken haben eine Figur (validate.js prüft das)
  const KATA = ['heian-shodan'];
  const can = (k) => KATA.includes(k.id) && !!k.ansage && E.ok();
  // Kamera: yaw 0 = von vorne (die Figur schaut am Anfang zur Kamera), 180 = von hinten (links bleibt links)
  const CAMS = [
    ['Von hinten', { yaw: 158, pitch: 20, dist: 6.2 }],
    ['Von vorne', { yaw: -22, pitch: 16, dist: 6.2 }],
    ['Von der Seite', { yaw: -90, pitch: 12, dist: 6.4 }],
    ['Von oben', { yaw: 180, pitch: 78, dist: 7.2 }],
  ];
  // Bildpunkte je Bild: in Bewegung wenige (flüssig), im Stand scharf
  const PX_MOVE = 260000;
  const PX_STILL = 1000000;

  // Liefert die Bühne: node (Leinwand, kleine Karte, Kamera-Knopf) und die Steuerung. Die Zeit t läuft in Sekunden wie in
  // SK.ansageTimeline(k, beat, true); gerechnet wird erst mit dem ersten beat().
  function stage(k) {
    const { el } = SK.util;
    const cv = el('canvas', { class: 'ans-fig-cv', role: 'img', 'aria-label': `${k.name} als 3D-Figur` });
    const mapCv = el('canvas', { class: 'ans-fig-map', width: '192', height: '192', 'aria-hidden': 'true' });
    const camBtn = el('button', { class: 'ans-fig-cam', type: 'button', title: 'Blickwinkel wechseln' });
    const node = el('div', { class: 'ans-fig', hidden: true }, cv, mapCv, camBtn);
    const ctx = cv.getContext('2d');
    const mg = mapCv.getContext('2d');
    const anims = new Map();
    let anim = null;
    let camIdx = 0;
    const cam = Object.assign({ fov: 30 }, CAMS[0][1]);
    let t = 0;
    let t0 = 0;
    let tEnd = 0;
    let clock = 0;
    let moving = false;
    let drag = null;
    let rough = false;
    let raf = 0;
    let on = false;

    // Blickpunkt: Hüfte der Figur, über gut eine Sekunde geglättet (rein aus dem Zeitpunkt – auch beim Springen ruhig)
    function center(at) {
      let x = 0;
      let z = 0;
      for (let i = -3; i <= 3; i++) {
        const P = anim.pose(clamp(at + i * 0.22, 0, anim.dur));
        x += P.pelvis[0] / 7;
        z += P.pelvis[2] / 7;
      }
      return [x, z];
    }
    const grounded = (J, s) => J['ankle' + s][1] < 0.09;
    function draw() {
      const cw = cv.clientWidth;
      const ch = cv.clientHeight;
      if (!on || !anim || !cw || !ch) return;
      const fast = moving || !!drag;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5, Math.sqrt((fast ? PX_MOVE : PX_STILL) / (cw * ch)));
      const w = Math.max(120, Math.round(cw * dpr));
      const h = Math.max(120, Math.round(ch * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      const P = anim.pose(t);
      const J = E.solve(P);
      const c = center(t);
      // im Hochformat weiter weg, damit auch ein breiter Stand ganz ins Bild passt
      const view = Object.assign({}, cam, { target: [c[0], 0.78, c[1]], dist: Math.max(cam.dist, (4.9 * h) / w) });
      const decals = ['L', 'R'].filter((s) => grounded(J, s)).map((s) => ({ heel: J['heel' + s], toe: J['toe' + s], w: P.w[s === 'L' ? 0 : 1], a: 1, side: s }));
      ctx.clearRect(0, 0, w, h);
      E.draw(ctx, w, h, P, view, { mode: 0, style: 0, decals });
      rough = fast;
      mini(J);
    }
    // Kleine Karte: Embusen von oben (vorne ist oben, links ist links), Füße und Blickrichtung
    function mini(J) {
      const S = mapCv.width;
      const ext = anim.lines.reduce((a, l) => [Math.min(a[0], l[0], l[2]), Math.max(a[1], l[0], l[2]), Math.min(a[2], l[1], l[3]), Math.max(a[3], l[1], l[3])], [1e9, -1e9, 1e9, -1e9]);
      const sc = S / (Math.max(ext[1] - ext[0], ext[3] - ext[2]) + 1.4);
      const X = (x) => S / 2 - (x - (ext[0] + ext[1]) / 2) * sc;
      const Y = (z) => S / 2 - (z - (ext[2] + ext[3]) / 2) * sc;
      mg.clearRect(0, 0, S, S);
      mg.lineCap = 'round';
      mg.strokeStyle = '#b9b2a6';
      mg.lineWidth = 2.5;
      anim.lines.forEach((l) => { mg.beginPath(); mg.moveTo(X(l[0]), Y(l[1])); mg.lineTo(X(l[2]), Y(l[3])); mg.stroke(); });
      ['L', 'R'].forEach((s) => {
        const a = J['heel' + s];
        const b = J['toe' + s];
        mg.strokeStyle = grounded(J, s) ? '#1f2328' : '#9a948a';
        mg.lineWidth = 7;
        mg.beginPath();
        mg.moveTo(X(a[0]), Y(a[2]));
        mg.lineTo(X(b[0]), Y(b[2]));
        mg.stroke();
      });
      const hx = X(J.head[0]);
      const hy = Y(J.head[2]);
      mg.fillStyle = '#c62828';
      mg.beginPath();
      mg.moveTo(hx - J.hf[0] * 20, hy - J.hf[2] * 20);
      mg.lineTo(hx + J.hl[0] * 7, hy + J.hl[2] * 7);
      mg.lineTo(hx - J.hl[0] * 7, hy - J.hl[2] * 7);
      mg.fill();
    }
    // Ein Bild je Bildwechsel des Browsers; die Zeit läuft nach der Uhr (Echtzeit, auch wenn ein Bild länger dauert)
    function frame(now) {
      raf = 0;
      if (!on || !node.isConnected) return;
      if (moving) {
        t = Math.min(tEnd, t0 + (now - clock) / 1000);
        if (t >= tEnd) moving = false;
      }
      draw();
      if (moving || rough) request();
    }
    function request() {
      if (!raf && on) raf = requestAnimationFrame(frame);
    }
    function setCam(i) {
      camIdx = i % CAMS.length;
      Object.assign(cam, CAMS[camIdx][1]);
      camBtn.textContent = `Blick: ${CAMS[camIdx][0].replace(/^Von (der )?/, '')}`;
      camBtn.setAttribute('aria-label', `Blickwinkel: ${CAMS[camIdx][0]} – wechseln`);
      request();
    }
    camBtn.addEventListener('click', () => setCam(camIdx + 1));
    // Drehen mit Finger oder Maus: waagerecht dreht, senkrecht neigt (am Handy scrollt senkrecht die Seite)
    cv.addEventListener('pointerdown', (ev) => { drag = [ev.clientX, ev.clientY]; cv.setPointerCapture(ev.pointerId); });
    cv.addEventListener('pointermove', (ev) => {
      if (!drag) return;
      cam.yaw -= (ev.clientX - drag[0]) * 0.45;
      cam.pitch = clamp(cam.pitch + (ev.clientY - drag[1]) * 0.35, -2, 86);
      drag = [ev.clientX, ev.clientY];
      request();
    });
    const drop = () => { drag = null; request(); };
    cv.addEventListener('pointerup', drop);
    cv.addEventListener('pointercancel', drop);
    if (window.ResizeObserver) new ResizeObserver(() => request()).observe(node);
    setCam(0);

    return {
      node,
      // Ansicht ein- oder ausschalten (aus: es wird nichts gerechnet)
      on(v) { on = !!v; node.hidden = !on; if (on) request(); },
      // Takt der Ansage (Sekunden je Bewegung): Ablauf dafür rechnen bzw. aus dem Vorrat nehmen
      beat(b) {
        if (!anims.has(b)) anims.set(b, build(k, { beat: b }));
        anim = anims.get(b);
      },
      // Zeitpunkt, zu dem die Bewegung der Ansage i fertig ist
      end: (i) => anim.ends[i],
      // ab Zeitpunkt a in Echtzeit laufen, bis b (ohne b: bis zum Schluss)
      run(a, b) { t0 = t = a; tEnd = b == null ? anim.dur : b; clock = performance.now(); moving = tEnd > a; request(); },
      // Standbild zum Zeitpunkt a
      show(a) { t = a; moving = false; request(); },
      freeze() { moving = false; request(); },
      time: () => t,
    };
  }

  SK.kataFigur = { build, check, SCALE, KATA, can, stage };
})();
