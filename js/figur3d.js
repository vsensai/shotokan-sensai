/* 3D-Figuren: Karateka in 3D, ohne Bibliothek.
   Die Figur besteht aus weichen Körperformen (Signed Distance Fields), die der Grafikchip
   pro Bildpunkt abtastet: Licht, weiche Schatten, Umgebungsverdeckung, Fußabdrücke am Boden.
   Ein gemeinsamer WebGL2-Kontext zeichnet nacheinander in beliebig viele 2D-Leinwände. */
(function () {
  'use strict';
  const D = Math.PI / 180;

  /* ---------- Vektoren ---------- */
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const len = (a) => Math.hypot(a[0], a[1], a[2]);
  const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const mix = (a, b, t) => add(a, mul(sub(b, a), t));
  const UP = [0, 1, 0];
  // Blickrichtung zu einem Drehwinkel: 0° = +z (vorne), positiv = zur linken Körperseite (+x)
  const fwdOf = (deg) => [Math.sin(deg * D), 0, Math.cos(deg * D)];
  const leftOf = (deg) => [Math.cos(deg * D), 0, -Math.sin(deg * D)];

  /* ---------- Skelett ---------- */
  const THIGH = 0.44;
  const SHIN = 0.44;
  const UARM = 0.29;
  const FARM = 0.27;

  // Zwei Glieder mit fester Länge: Gelenk (Knie/Ellbogen) liegt in Richtung pole
  function ik(a, t, l1, l2, pole) {
    let d = sub(t, a);
    let dist = len(d);
    const max = (l1 + l2) * 0.999;
    if (dist > max) { t = add(a, mul(d, max / dist)); d = sub(t, a); dist = max; }
    const dn = norm(d);
    const x = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist);
    const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
    let pv = sub(pole, mul(dn, dot(pole, dn)));
    if (len(pv) < 1e-4) pv = cross(dn, [1, 0, 0]);
    return [add(add(a, mul(dn, x)), mul(norm(pv), h)), t];
  }

  const DEF = {
    pelvis: [0, 0.9, 0], yaw: 0, chest: 0, lean: 0, look: 0,
    // tu: Zehen hochgezogen (0 … 1), z. B. Fußballen beim Mae-geri
    L: { x: 0.1, z: 0, y: 0.075, yaw: 8, pitch: 0, kp: [0, 0, 0], sole: [0, 0, 0], tu: 0 },
    R: { x: -0.1, z: 0, y: 0.075, yaw: -8, pitch: 0, kp: [0, 0, 0], sole: [0, 0, 0], tu: 0 },
    hL: [0.16, -0.38, 0.02], hR: [-0.16, -0.38, 0.02], eL: [0, 0, 0], eR: [0, 0, 0],
    // offene Hand (0 = Faust, 1 = offen), Handflächen-Normale und Fingerrichtung (Brustkoordinaten, 0 = automatisch)
    oL: 0, oR: 0, pL: [0, 0, 0], pR: [0, 0, 0], fL: [0, 0, 0], fR: [0, 0, 0],
    w: [0.5, 0.5],
  };
  function full(p) {
    const o = JSON.parse(JSON.stringify(DEF));
    for (const k in p) o[k] = typeof p[k] === 'object' && !Array.isArray(p[k]) ? Object.assign(o[k], p[k]) : p[k];
    return o;
  }

  // Pose → Gelenke in Weltkoordinaten
  function solve(P) {
    const pel = P.pelvis;
    const lp = leftOf(P.yaw);
    const fp = fwdOf(P.yaw);
    const cy = P.yaw + P.chest;
    const lc = leftOf(cy);
    const fc0 = fwdOf(cy);
    const up = add(mul(UP, Math.cos(P.lean * D)), mul(fc0, Math.sin(P.lean * D)));
    const fc = norm(cross(lc, up));
    const chest = add(pel, mul(up, 0.5));
    const J = { pel, chest, up, lc, fc, lp, fp };
    J.head = add(add(chest, mul(up, 0.2)), mul(fc, 0.005));
    // Blickrichtung des Kopfes (Welt): meist zum Gegner, unabhängig von der Hüfte
    J.hf = fwdOf(P.look);
    J.hl = leftOf(P.look);
    const toW = (v) => add(add(add(chest, mul(lc, v[0])), mul(up, v[1])), mul(fc, v[2]));
    ['L', 'R'].forEach((s) => {
      const sg = s === 'L' ? 1 : -1;
      // Bein
      const F = P[s];
      const hip = add(pel, mul(lp, 0.09 * sg));
      const ankle = [F.x, F.y, F.z];
      const fh = fwdOf(F.yaw);
      const dir = norm(add(mul(fh, Math.cos(F.pitch * D)), mul(UP, Math.sin(F.pitch * D))));
      const kp = len(F.kp) > 0.01 ? F.kp : add(fh, [0, 0.15, 0]);
      const [knee, ank] = ik(hip, ankle, THIGH, SHIN, kp);
      let sole = sub(mul(dir, dot(UP, dir)), UP);
      sole = len(sole) < 0.05 ? mul(fh, -1) : norm(sole);
      if (len(F.sole) > 0.01) sole = norm(sub(F.sole, mul(dir, dot(F.sole, dir))));
      J['hip' + s] = hip;
      J['knee' + s] = knee;
      J['ankle' + s] = ank;
      J['heel' + s] = add(add(ank, mul(sole, 0.042)), mul(dir, -0.055));
      // Bei hochgezogenen Zehen ist der vorderste Punkt der Fußballen
      J['toe' + s] = add(add(ank, mul(sole, 0.048)), mul(dir, 0.165 - 0.04 * F.tu));
      J['tu' + s] = F.tu;
      J['dir' + s] = dir;
      J['sole' + s] = sole;
      // Arm (Hand in Brustkoordinaten: x links, y oben, z vorne)
      const sh = toW([0.185 * sg, -0.035, 0]);
      const target = toW(P['h' + s]);
      const ep = P['e' + s];
      // Hand an der Hüfte (Hikite): Ellbogen nach hinten statt zur Seite
      const hv = P['h' + s];
      // (weich übergeblendet, damit der Ellbogen in Bewegungen nicht springt)
      const cl = (v) => Math.max(0, Math.min(1, v));
      const kh = cl((0.25 - hv[2]) / 0.2) * cl((-0.15 - hv[1]) / 0.1) * cl((hv[1] + 0.5) / 0.06) * cl((Math.abs(hv[0]) - 0.08) / 0.06);
      const pole = len(ep) > 0.01 ? sub(toW(ep), chest) : add(add(mul(lc, (0.35 - 0.25 * kh) * sg), mul(up, -1)), mul(fc, -0.35 - 0.65 * kh));
      const [elbow, wrist] = ik(sh, target, UARM, FARM, pole);
      J['sh' + s] = sh;
      J['elbow' + s] = elbow;
      J['wrist' + s] = wrist;
      const fa = norm(sub(wrist, elbow));
      J['fist' + s] = add(wrist, mul(fa, 0.045));
      // offene Hand: Finger in Unterarmrichtung oder vorgegeben, Handfläche quer dazu
      J['open' + s] = P['o' + s] > 0.5;
      const fd0 = P['f' + s];
      const fd = len(fd0) > 0.01 ? norm(sub(toW(fd0), chest)) : fa;
      const pv0 = P['p' + s];
      // ohne Vorgabe: Handfläche unten, an der Hüfte (Hikite) nach oben – über „zur Mitte“ gedreht wie beim Stoß
      // tief vor dem Körper (Yoi, natürliche Stände): Handfläche zum Körper, Faustrücken nach vorn
      const ky = cl((-0.4 - hv[1]) / 0.08) * cl((hv[2] + 0.05) / 0.1);
      let palm = len(pv0) > 0.01 ? sub(toW(pv0), chest) : add(add(mul(up, (2 * kh - 1) * (1 - ky)), mul(lc, -sg * Math.sin(Math.PI * kh))), mul(fc, -ky));
      palm = sub(palm, mul(fd, dot(palm, fd)));
      if (len(palm) < 0.05) palm = cross(fd, lc);
      J['fd' + s] = fd;
      J['tip' + s] = add(wrist, mul(fd, 0.17));
      J['wd' + s] = norm(cross(fd, norm(palm)));
    });
    return J;
  }

  /* ---------- Körperformen: [a, b, ra, rb, Material] ---------- */
  // Material: 0 Gi, 0.1 Gi-Hosenbein mit offenem Saum, 1 Haut, 2 Gürtel, 4 Kopf, 5 Jacke (Gürtel, Revers);
  // 1.25 Haut mit fast harter Kante, 1.3 … 1.49 Haut mit eigenem Übergang, ab 100 abgeflachte Haut (siehe FL)
  function prims(J) {
    const P = [];
    const cone = (a, b, ra, rb, m) => P.push([a, b, ra, rb, m]);
    // Gruppe (Hand, Fuß): vorweg eine grobe Ersatzform (Material 10 + Anzahl der Teile).
    // Der Shader rechnet die Einzelteile nur nahe der Oberfläche; Schatten und Verdeckung nehmen nur die Ersatzform.
    const group = (proxy, fn) => {
      const i0 = P.length;
      P.push(null);
      fn();
      P[i0] = proxy.concat(10 + P.length - i0 - 1);
    };
    // Haut mit eigenem Verschmelzungsradius k (weicher Übergang, z. B. Daumen aus dem Ballen)
    const SK = (k) => 1.3 + Math.min(0.038, Math.max(0.001, k)) * 5;
    // Haut, entlang Achse n um Faktor fl abgeflacht (Handteller, Sohle, Handgelenk), Verschmelzungsradius k
    const FL = (n, fl, k) => {
      n = norm(n);
      if (n[1] < 0) n = mul(n, -1);
      const ti = Math.round((Math.acos(Math.min(1, n[1])) / Math.PI) * 127);
      let ph = Math.atan2(n[2], n[0]);
      if (ph < 0) ph += 2 * Math.PI;
      const pi = Math.round((ph / (2 * Math.PI)) * 256) % 256;
      const fi = Math.max(0, Math.min(15, Math.round((fl - 1) / 0.15)));
      const ki = Math.max(1, Math.min(15, Math.round(k / 0.0025)));
      return 100 + ((ti * 256 + pi) * 16 + fi) * 16 + ki;
    };
    const { pel, chest, up, lc, lp, fp } = J;
    // Oberkörper als V: breite Brust, schmale Taille
    [1, -1].forEach((s) => {
      cone(add(add(pel, mul(lp, 0.045 * s)), mul(up, 0.05)), add(add(chest, mul(lc, 0.07 * s)), mul(up, -0.045)), 0.108, 0.13, 5);
    });
    // Gesäß als durchgehende Form; darüber hängt die Jacke (Shader: jacket)
    const seat = mul(fp, -0.012);
    // Gesäß etwas weiter hinten, damit es im breiten Stand nicht als Querbalken zwischen den Beinen sichtbar ist
    cone(add(add(J.hipL, mul(fp, -0.03)), mul(up, 0.0)), add(add(J.hipR, mul(fp, -0.03)), mul(up, 0.0)), 0.088, 0.088, 0);
    // Schritt der Hose: füllt unter der Jacke den Raum zwischen den Oberschenkeln
    cone(add(add(pel, mul(lp, 0.035)), mul(up, -0.15)), add(add(pel, mul(lp, -0.035)), mul(up, -0.15)), 0.068, 0.068, 0);
    // Schultern: Nacken fällt zu runden Schultern ab
    [1, -1].forEach((s) => { const sh = s > 0 ? J.shL : J.shR; cone(add(chest, mul(up, 0.02)), sh, 0.05, 0.055, 5); cone(sh, sh, 0.062, 0.062, 0); });
    // Hals reicht bis in den Kopf und geht weich in ihn über (sonst Kerbe unter dem Kinn)
    cone(add(chest, mul(up, 0.02)), add(add(chest, mul(up, 0.2)), mul(J.hf, -0.012)), 0.05, 0.044, SK(0.03));
    // Kopf als Ei: runder Schädel, weich angesetztes schmaleres Kinn, seitlich etwas schmaler als tief
    const skull = add(add(J.head, mul(up, 0.012)), mul(J.hf, -0.008));
    const chin = add(add(J.head, mul(up, -0.05)), mul(J.hf, 0.03));
    cone(skull, skull, 0.088, 0.088, FL(J.hl, 1.12, 0.01));
    cone(chin, chin, 0.055, 0.055, FL(J.hl, 1.12, 0.0375));
    ['L', 'R'].forEach((s) => {
      const e = J['elbow' + s];
      const w = J['wrist' + s];
      cone(J['sh' + s], e, 0.054, 0.044, 0);
      cone(e, mix(e, w, 0.72), 0.044, 0.038, 0);
      const fd = J['fd' + s];
      const wd = J['wd' + s];
      const th = s === 'R' ? 1 : -1;
      const open = J['open' + s];
      // Handachsen: f nach vorn (Finger bzw. Faust), p zur Handfläche, q zur Daumenseite
      const hf = open ? fd : norm(sub(J['fist' + s], w));
      const pn = norm(cross(wd, hf));
      const at = (f, p, q) => add(add(add(w, mul(hf, f)), mul(pn, p)), mul(wd, q * th));
      // Gliederpuppe: Unterarm endet vor dem Handgelenk, dort eine Gelenkkugel
      cone(mix(e, w, 0.55), mix(e, w, 0.94), 0.03, 0.025, 1);
      cone(w, w, 0.02, 0.02, SK(0.003));
      if (open) {
        // offene Hand als flaches Paddel (Shuto, Nukite)
        group([add(w, mul(hf, 0.06)), add(w, mul(hf, 0.06)), 0.07, 0.07], () => {
          cone(at(0.035, 0, 0), at(0.1, 0.004, -0.003), 0.03, 0.024, FL(pn, 2.1, 0.008));
        });
      } else {
        // Faust als runder Block
        group([add(w, mul(hf, 0.05)), add(w, mul(hf, 0.05)), 0.05, 0.05], () => {
          cone(at(0.036, 0.01, 0), at(0.05, 0.012, 0), 0.037, 0.039, FL(pn, 1.5, 0.008));
        });
      }
      const k = J['knee' + s];
      const a = J['ankle' + s];
      // weite Gi-Hose: locker, unten ausgestellt, offener Saum knapp über dem Knöchel
      cone(J['hip' + s], k, 0.112, 0.094, 0);
      cone(k, mix(k, a, 0.88), 0.094, 0.108, 0.1);
      // Unterschenkel: zum Knöchel hin schlanker
      cone(mix(k, a, 0.68), a, 0.038, 0.031, 1);
      // Gliederpuppe: Gelenkkugel am Knöchel, keilförmiger Fuß (hinten hoch, vorn flach und rund)
      const dir = J['dir' + s];
      const sole = J['sole' + s];
      const inner = mul(norm(cross(sole, dir)), s === 'L' ? 1 : -1);
      const O = (f, d, q) => add(add(add(a, mul(dir, f)), mul(sole, d)), mul(inner, q));
      // Puppe ohne Zehen: der Vorderfuß knickt beim Fußballen-Tritt nur leicht ab
      const ta = J['tu' + s] * 28 * D;
      const td = add(mul(dir, Math.cos(ta)), mul(sole, -Math.sin(ta)));
      const tdn = add(mul(dir, Math.sin(ta)), mul(sole, Math.cos(ta)));
      // Vorderfuß um den Ballen gedreht (Zehen hochgezogen beim Mae-geri)
      const B = O(0.1, 0.058, 0.004);
      const V = (f, d, q) => add(add(add(B, mul(td, f)), mul(tdn, d)), mul(inner, q));
      group([J['heel' + s], J['toe' + s], 0.06, 0.05], () => {
        cone(a, a, 0.025, 0.025, SK(0.003));
        cone(O(-0.03, 0.041, 0.0), O(0.07, 0.046, 0.004), 0.033, 0.028, FL(sole, 1.2, 0.006));
        cone(V(-0.045, -0.008, 0.0), V(0.035, 0.0, 0.004), 0.04, 0.032, FL(tdn, 2.2, 0.012));
      });
    });
    // Gürtel als eigener Ring um die Taille (über der Jacke)
    for (let i = 0; i < 12; i++) {
      const a0 = (i / 12) * 2 * Math.PI, a1 = ((i + 1) / 12) * 2 * Math.PI;
      const P0 = add(add(add(pel, mul(up, 0.09)), mul(lp, Math.sin(a0) * 0.166)), mul(fp, Math.cos(a0) * 0.13 - 0.004));
      const P1 = add(add(add(pel, mul(up, 0.09)), mul(lp, Math.sin(a1) * 0.166)), mul(fp, Math.cos(a1) * 0.13 - 0.004));
      cone(P0, P1, 0.019, 0.019, 2);
    }
    // Gürtelknoten: flacher Querknoten, zwei gleich lange Enden hängen leicht auseinander
    const knot = add(add(pel, mul(up, 0.09)), mul(fp, 0.142));
    cone(add(knot, mul(lp, 0.02)), add(knot, mul(lp, -0.02)), 0.019, 0.019, 2);
    [1, -1].forEach((s) => { const k0 = add(knot, mul(lp, 0.012 * s)); cone(k0, add(add(add(k0, mul(up, -0.12)), mul(lp, 0.03 * s)), mul(fp, 0.012)), 0.012, 0.011, 2); });
    return P;
  }

  /* ---------- Shader ---------- */
  const N = 72;
  const VS = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
  const FS = `#version 300 es
precision highp float;
precision highp int;
out vec4 o;
uniform vec2 uRes;
uniform vec3 uRo, uCw, uCu, uCv;
uniform float uF;
uniform vec4 uA[${N}], uB[${N}];
uniform vec4 uM[${N / 4}];
float mat(int i){ return uM[i / 4][i % 4]; }
uniform int uN, uMode, uStyle, uTint;
uniform vec3 uPel, uUp, uFwd, uLeft, uHead, uHFwd, uPFwd, uPLeft;
uniform vec4 uBound;
uniform vec2 uBase;
uniform vec4 uDec[6], uDecP[6];
const vec3 LIG = normalize(vec3(-0.55, 0.95, 0.45));
const vec3 FIL = normalize(vec3(0.7, 0.45, -0.6));

float smin(float a, float b, float k){ float h = max(k - abs(a - b), 0.0) / k; return min(a, b) - h * h * k * 0.25; }
// Unterer Teil der Gi-Jacke: ovaler, leicht ausgestellter Stoff, hinten länger als vorne
vec3 jq(vec3 p){ vec3 q = p - uPel; return vec3(dot(q, uPLeft), dot(q, uUp), dot(q, uPFwd)); }
float jbot(float z){ return mix(-0.25, -0.21, smoothstep(-0.12, 0.13, z)); }
float jacket(vec3 p){
  vec3 q = jq(p);
  float top = 0.07, bot = jbot(q.z);
  float u = clamp((top - q.y) / (top + 0.2), 0.0, 1.0);
  float rx = mix(0.19, 0.25, u), rz = mix(0.142, 0.2, u * u);
  float e = length(vec2(q.x / rx, (q.z + 0.006) / rz));
  float ds = (e - 1.0) * min(rx, rz) * 0.9;
  float dc = max(q.y - top, bot - q.y);
  return max(ds, dc) - 0.004;
}
// fine = false: Hände und Füße nur als grobe Ersatzform (Verdeckung auf dem Boden – ohne sichtbare Umrisse)
vec2 mapX(vec3 p, bool fine){
  float d = 1e9, best = 1e9, m = 0.0;
  int i = 0;
  while (i < uN) {
    float mi = mat(i);
    vec3 a = uA[i].xyz, ba = uB[i].xyz - a, pa = p - a;
    float sc = 1.0, k = 0.024;
    if (mi > 99.5) {
      // abgeflachte Haut: Achse (Winkel), Faktor, Übergang
      // nur Gleitkomma: Ganzzahlen sind auf Handy-Grafikchips oft nur 16 Bit groß
      float v = floor(mi - 100.0 + 0.5);
      float tt = floor(v / 65536.0) * (3.14159265 / 127.0), pp = mod(floor(v / 256.0), 256.0) * (6.2831853 / 256.0);
      vec3 ax = vec3(sin(tt) * cos(pp), cos(tt), sin(tt) * sin(pp));
      sc = 1.0 + mod(floor(v / 16.0), 16.0) * 0.15;
      k = mod(v, 16.0) * 0.0025;
      pa += ax * dot(pa, ax) * (sc - 1.0);
      ba += ax * dot(ba, ax) * (sc - 1.0);
      mi = 1.0;
    } else if (mi > 1.29 && mi < 1.5) { k = (mi - 1.3) * 0.2; mi = 1.0; }
    else if (abs(mi - 1.25) < 0.01) k = 0.004;
    else if (abs(mi - 2.0) < 0.01) k = 0.006; // Gürtel: knappe Kante, kein weißer Saum
    float bb = dot(ba, ba);
    float h = bb > 0.0 ? clamp(dot(pa, ba) / bb, 0.0, 1.0) : 0.0;
    float di = (length(pa - ba * h) - mix(uA[i].w, uB[i].w, h)) / sc;
    if (mi > 0.05 && mi < 0.2) {
      // Hosenbein mit offenem Saum: dünner Stoffschlauch, am Ende b gerade abgeschnitten
      di = max(max(di, -di - 0.012), dot(pa - ba, ba) / sqrt(bb));
      mi = 0.0;
    }
    if (mi > 9.5) {
      // Ersatzform einer Gruppe: weit weg (oder grob) genügt sie, die Einzelteile werden übersprungen
      int n = int(mi - 10.0 + 0.5);
      if (!fine || di > 0.06) {
        if (di < best) { best = di; m = 1.0; }
        d = smin(d, di, 0.024);
        i += n + 1;
      } else i += 1;
      continue;
    }
    if (di < best) { best = di; m = mi; }
    d = smin(d, di, max(k, 0.001));
    i += 1;
  }
  float dj = jacket(p);
  if (dj < best) m = 6.0;
  d = smin(d, dj, 0.007);
  return vec2(d, m);
}
vec2 map(vec3 p){ return mapX(p, true); }
vec2 mapC(vec3 p){ return mapX(p, false); }
vec3 nrm(vec3 p){
  vec2 e = vec2(0.0007, -0.0007);
  return normalize(e.xyy * map(p + e.xyy).x + e.yyx * map(p + e.yyx).x + e.yxy * map(p + e.yxy).x + e.xxx * map(p + e.xxx).x);
}
bool sphere(vec3 ro, vec3 rd, vec4 s, out float t0, out float t1){
  vec3 oc = ro - s.xyz; float b = dot(oc, rd), c = dot(oc, oc) - s.w * s.w, h = b * b - c;
  if (h < 0.0) return false; h = sqrt(h); t0 = -b - h; t1 = -b + h; return t1 > 0.0;
}
float shadow(vec3 ro, vec3 rd){
  float t0, t1; if (!sphere(ro, rd, uBound, t0, t1)) return 1.0;
  float res = 1.0, t = max(0.015, t0);
  for (int i = 0; i < 48; i++) {
    float h = map(ro + rd * t).x;
    res = min(res, 9.0 * h / t);
    t += clamp(h, 0.008, 0.12);
    if (res < 0.003 || t > t1) break;
  }
  return clamp(res, 0.0, 1.0);
}
float occl(vec3 p, vec3 n){
  float o = 0.0, s = 1.0;
  for (int i = 1; i <= 5; i++) { float h = 0.015 * float(i) * float(i); o += (h - map(p + n * h).x) * s; s *= 0.75; }
  return clamp(1.0 - 2.2 * o, 0.0, 1.0);
}
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

// Fußabdruck am Boden: Ferse, Ballen, Verbindung, Zehenreihe
float foot2(vec2 q, vec2 heel, vec2 toe){
  vec2 ax = toe - heel; float L = length(ax); vec2 f = ax / L; vec2 s = vec2(-f.y, f.x);
  vec2 r = vec2(dot(q - heel, s), dot(q - heel, f));
  float d = length(r - vec2(0.0, 0.035)) - 0.036;
  d = min(d, length((r - vec2(-0.006, L * 0.72)) * vec2(1.0, 0.8)) - 0.046);
  vec2 c = r - vec2(0.012, clamp(r.y, 0.04, L * 0.7)); d = min(d, length(c) - 0.026);
  for (int i = 0; i < 5; i++) { float fi = float(i); d = min(d, length(r - vec2(-0.034 + fi * 0.017, L + 0.03 - abs(fi - 1.0) * 0.008)) - (i == 0 ? 0.013 : 0.009)); }
  return d;
}

vec3 baseCol(float m, vec3 p, out float kind){
  kind = 0.0;
  vec3 gi = uStyle == 2 ? vec3(0.72, 0.5, 0.3) : uTint == 1 ? vec3(0.66, 0.7, 0.76) : vec3(0.93, 0.925, 0.91);
  vec3 skin = uStyle == 1 ? vec3(0.97, 0.93, 0.9) : uStyle == 2 ? vec3(0.76, 0.55, 0.34) : vec3(0.82, 0.62, 0.5);
  vec3 ink = uStyle == 2 ? vec3(0.25, 0.14, 0.08) : vec3(0.045, 0.04, 0.04);
  if (m > 3.5 && m < 4.5) {
    vec3 q = p - uHead; float hy = dot(q, uUp), hz = dot(q, uHFwd);
    if (hy > 0.025 + hz * 0.5 && length(q) > 0.088 && uStyle != 2) { kind = 3.0; return vec3(0.07, 0.055, 0.05); }
    kind = 1.0; return skin;
  }
  if (m > 0.5 && m < 1.5) {
    // Augen: zwei dunkle Punkte vorn am Kopf (Gliederpuppe, sonst ohne Gesicht)
    vec3 q = p - uHead; float hy = dot(q, uUp), hz = dot(q, uHFwd), hx = dot(q, normalize(cross(uUp, uHFwd)));
    if (hz > 0.04 && length(q) < 0.12 && length(vec2(abs(hx) - 0.028, hy - 0.004)) < 0.0072 && uStyle != 2) { kind = 2.0; return vec3(0.1, 0.08, 0.07); }
    kind = 1.0; return skin;
  }
  if (m > 1.5 && m < 2.5) { kind = 2.0; return ink; }
  if (m > 4.5) {
    vec3 q = p - uPel; float hh = dot(q, uUp), uu = dot(q, uLeft), ff = dot(q, uFwd);
    float bt = 0.0; // Gürtel ist ein eigener Ring
    if (bt > 0.5) kind = 2.0;
    if (bt > 0.0) return mix(gi, ink, bt);
    // Ausschnitt: kleines V unter dem Hals, darunter kreuzen die Revers
    float vx = (hh - 0.47) * 0.6;
    if (ff > 0.0 && hh > 0.47 && abs(uu) < vx) { kind = 1.0; return skin; }
    // Kragen: dunklerer Stoffstreifen entlang des Ausschnitts
    if (ff > 0.0 && hh > 0.47 - 0.02 && abs(uu) < max(vx, 0.0) + 0.03) { kind = 4.0; return gi * 0.7; }
    float lu = mix(0.115, -0.004, clamp((hh - 0.12) / (0.47 - 0.12), 0.0, 1.0));
    if (ff > 0.0 && hh > 0.118 && hh < 0.47) {
      float ln = 1.0 - smoothstep(0.003, 0.0055, abs(uu - lu));
      if (ln > 0.0) { if (ln > 0.5) kind = 4.0; return mix(gi, gi * 0.62, ln); }
      if (uu - lu > 0.0 && uu - lu < 0.03) { return gi * 0.965; }
    }
  }
  if (m > 5.5) {
    // Jackensaum, Vorderkante der Jacke
    vec3 q = jq(p);
    float hem = 1.0 - smoothstep(0.01, 0.016, q.y - jbot(q.z));
    float edge = q.z > 0.0 ? 1.0 - smoothstep(0.003, 0.0055, abs(q.x - mix(0.07, 0.1, clamp(-q.y / 0.2, 0.0, 1.0)))) : 0.0;
    if (edge > 0.5) kind = 4.0;
    return gi * (1.0 - 0.07 * hem) * (1.0 - 0.36 * edge);
  }
  return gi;
}

vec3 shadeFig(vec3 p, vec3 rd, float m){
  vec3 n = nrm(p);
  float kind; vec3 c = baseCol(m, p, kind);
  float dif = clamp(dot(n, LIG), 0.0, 1.0);
  float sh = shadow(p + n * 0.004, LIG);
  float ao = occl(p, n);
  float fres = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 3.0);
  if (uStyle == 1) {
    float l = dif * sh;
    vec3 col = c * (l > 0.42 ? 1.0 : l > 0.12 ? 0.86 : 0.74);
    if (l <= 0.12 && kind < 2.0 && mod(gl_FragCoord.x + gl_FragCoord.y, 5.0) < 1.3) col *= 0.8;
    float edge = smoothstep(0.32, 0.18, dot(n, -rd));
    if (kind == 4.0) edge = 1.0;
    return mix(col * mix(0.85, 1.0, ao), vec3(0.04), edge);
  }
  vec3 sky = vec3(0.62, 0.7, 0.85), bounce = vec3(0.85, 0.72, 0.58);
  vec3 lin = dif * sh * vec3(1.25, 1.18, 1.05);
  lin += (0.55 + 0.45 * n.y) * sky * 0.42 * ao;
  lin += (0.5 - 0.5 * n.y) * bounce * 0.22 * ao;
  lin += clamp(dot(n, FIL), 0.0, 1.0) * vec3(0.32, 0.34, 0.4) * ao;
  if (kind == 1.0) lin += vec3(0.25, 0.08, 0.04) * clamp(dot(n, LIG) + 0.4, 0.0, 1.0) * ao; // Haut: warme Streuung
  vec3 col = c * lin;
  if (uStyle == 2) {
    float g = sin((p.y * 3.0 + p.x * 1.7 + sin(p.z * 9.0) * 0.4) * 70.0) * 0.5 + 0.5;
    col *= 0.9 + 0.12 * g;
    vec3 h = normalize(LIG - rd);
    col += vec3(0.5, 0.42, 0.3) * pow(clamp(dot(n, h), 0.0, 1.0), 40.0) * sh;
  } else if (kind == 0.0 || kind == 4.0) {
    col *= 0.985 + 0.03 * hash(floor(p.xy * 900.0) + floor(p.z * 900.0));
  }
  col += fres * 0.18 * vec3(0.9, 0.95, 1.0) * ao;
  return col;
}

vec4 floorCol(vec3 ro, vec3 rd){
  if (rd.y >= -0.001) return vec4(0.0);
  float t = -ro.y / rd.y; vec3 p = ro + rd * t;
  float r = length(p.xz - uBase);
  float fade = 1.0 - smoothstep(1.1, 2.3, r);
  if (fade <= 0.0) return vec4(0.0);
  vec3 c;
  if (uStyle == 1) c = vec3(0.985, 0.975, 0.955);
  else {
    // Tatami: Matten 0.9 × 1.8 m, feine Strohstruktur, dunkle Randbänder
    vec2 q = p.xz + vec2(0.45, 0.9);
    vec2 cell = floor(q / vec2(0.9, 1.8));
    bool turn = mod(cell.x + cell.y, 2.0) > 0.5;
    vec2 lq = mod(q, vec2(0.9, 1.8));
    float straw = sin((turn ? lq.x : lq.y) * 420.0) * 0.5 + 0.5;
    c = mix(vec3(0.86, 0.835, 0.7), vec3(0.89, 0.865, 0.74), straw);
    c *= 0.97 + 0.04 * hash(cell);
    float band = min(lq.x, 0.9 - lq.x);
    c = mix(c, vec3(0.36, 0.4, 0.34), 1.0 - smoothstep(0.012, 0.016, band));
    if (uStyle == 2) c = mix(c, vec3(0.9, 0.86, 0.78), 0.4);
  }
  float d = mapC(p).x;
  float ao = mix(0.45, 1.0, smoothstep(0.0, 0.16, d));
  float sh = shadow(p + vec3(0.0, 0.002, 0.0), LIG);
  if (uStyle == 1) {
    float l = sh * ao;
    if (l < 0.55 && mod(gl_FragCoord.x - gl_FragCoord.y, 4.0) < 1.4) c *= 0.55;
  } else c *= mix(0.5, 1.0, sh) * ao;
  // Fußabdrücke (Gewicht = Farbstärke), blasse = vorherige Lage
  for (int i = 0; i < 6; i++) {
    if (uDecP[i].w < 0.5) continue;
    float fd = foot2(vec2(uDecP[i].z > 0.5 ? -p.x : p.x, p.z) * vec2(1.0, 1.0), uDecP[i].z > 0.5 ? vec2(-uDec[i].x, uDec[i].y) : uDec[i].xy, uDecP[i].z > 0.5 ? vec2(-uDec[i].z, uDec[i].w) : uDec[i].zw);
    float a = (1.0 - smoothstep(-0.002, 0.004, fd)) * uDecP[i].y;
    vec3 red = mix(vec3(0.94, 0.55, 0.55), vec3(0.7, 0.07, 0.07), uDecP[i].x);
    c = mix(c, red, a * 0.85);
  }
  return vec4(c, fade);
}

void main(){
  vec2 uv = (2.0 * gl_FragCoord.xy - uRes) / uRes.y;
  vec3 ro = uRo, rd = normalize(uv.x * uCu + uv.y * uCv + uF * uCw);
  float pix = 2.0 / (uRes.y * uF);
  vec4 bg = uMode == 2 ? vec4(0.0) : floorCol(ro, rd);
  vec4 res = bg;
  if (uMode != 1) {
    float t0, t1, minA = 1e9, t = 0.0;
    bool hit = false; vec2 h = vec2(0.0);
    if (sphere(ro, rd, uBound, t0, t1)) {
      t = max(t0, 0.01);
      for (int i = 0; i < 128; i++) {
        h = map(ro + rd * t);
        minA = min(minA, h.x / t);
        if (h.x < 0.0004 * t) { hit = true; break; }
        t += h.x * 0.92;
        if (t > t1) break;
      }
    }
    if (hit) res = vec4(shadeFig(ro + rd * t, rd, h.y), 1.0);
    else if (minA < pix * 1.5) {
      // Kantenglättung bzw. Tuschekontur am Umriss
      float cov = uStyle == 1 ? 1.0 - smoothstep(pix * 0.6, pix * 1.5, minA) : (1.0 - smoothstep(0.0, pix, minA)) * 0.75;
      vec3 ec = uStyle == 1 ? vec3(0.04) : uStyle == 2 ? vec3(0.35, 0.22, 0.12) : vec3(0.55, 0.55, 0.57);
      float a = max(bg.a, cov);
      res = vec4(mix(bg.rgb * bg.a, ec, cov) / max(a, 1e-4), a);
    }
  }
  o = vec4(pow(clamp(res.rgb, 0.0, 1.0), vec3(0.4545)) * res.a, res.a);
}`;

  /* ---------- Gemeinsamer Zeichner ---------- */
  let GL = null;
  let probe = null;
  // Nur prüfen, ob WebGL 2 da ist; der große Shader wird erst beim ersten Bild übersetzt
  function supported() {
    if (probe == null) {
      try {
        probe = !!document.createElement('canvas').getContext('webgl2');
      } catch (e) {
        probe = false;
      }
    }
    return probe;
  }
  function renderer() {
    if (GL && GL.ok && GL.gl.isContextLost()) GL = null;
    if (GL) return GL;
    const cv = document.createElement('canvas');
    const gl = cv.getContext('webgl2', { premultipliedAlpha: true, preserveDrawingBuffer: true, antialias: false });
    if (!gl) return (GL = { ok: false });
    // Kontext verloren (z. B. App im Hintergrund): beim nächsten Bild neu aufbauen
    cv.addEventListener('webglcontextlost', (ev) => { ev.preventDefault(); GL = null; });
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    ['uRes', 'uRo', 'uCw', 'uCu', 'uCv', 'uF', 'uA', 'uB', 'uM', 'uN', 'uMode', 'uStyle', 'uTint', 'uPel', 'uUp', 'uFwd', 'uLeft', 'uHead', 'uHFwd', 'uPFwd', 'uPLeft', 'uBound', 'uBase', 'uDec', 'uDecP'].forEach((n) => (U[n] = gl.getUniformLocation(pr, n)));
    GL = { ok: true, gl, cv, U };
    return GL;
  }

  // Kamera: Umlaufbahn um target (yaw 0 = von vorne, −90 = von rechts)
  function camera(c, w, h) {
    const cp = Math.cos(c.pitch * D);
    const ro = add(c.target, mul([Math.sin(c.yaw * D) * cp, Math.sin(c.pitch * D), Math.cos(c.yaw * D) * cp], c.dist));
    const cw = norm(sub(c.target, ro));
    const cu = norm(cross(cw, UP));
    const cv = cross(cu, cw);
    const f = 1 / Math.tan((c.fov || 30) * D * 0.5);
    return {
      ro, cw, cu, cv, f, w, h,
      project(p) {
        const d = sub(p, ro);
        const z = dot(d, cw);
        return [(dot(d, cu) / z * f * h + w) / 2, h - (dot(d, cv) / z * f * h + h) / 2];
      },
    };
  }

  function bounds(P) {
    let mn = [1e9, 1e9, 1e9];
    let mx = [-1e9, -1e9, -1e9];
    P.forEach(([a, b, ra, rb]) => [[a, ra], [b, rb]].forEach(([q, r]) => { for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], q[i] - r); mx[i] = Math.max(mx[i], q[i] + r); } }));
    const c = mul(add(mn, mx), 0.5);
    return [c[0], c[1], c[2], len(sub(mx, c)) + 0.06];
  }

  // Zeichnet eine Pose in die 2D-Leinwand ctx. mode: 0 alles, 1 nur Boden, 2 nur Figur
  function draw(ctx, w, h, pose, cam, opt) {
    let R;
    try {
      R = renderer();
    } catch (e) {
      GL = { ok: false };
      return false;
    }
    if (!R.ok || R.gl.isContextLost()) return false;
    const { gl, cv, U } = R;
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    gl.viewport(0, 0, w, h);
    const J = solve(pose);
    const P = prims(J);
    const A = new Float32Array(N * 4);
    const B = new Float32Array(N * 4);
    const M = new Float32Array(N);
    P.forEach(([a, b, ra, rb, m], i) => { A.set([...a, ra], i * 4); B.set([...b, rb], i * 4); M[i] = m; });
    const C = camera(cam, w, h);
    gl.uniform2f(U.uRes, w, h);
    gl.uniform3fv(U.uRo, C.ro);
    gl.uniform3fv(U.uCw, C.cw);
    gl.uniform3fv(U.uCu, C.cu);
    gl.uniform3fv(U.uCv, C.cv);
    gl.uniform1f(U.uF, C.f);
    gl.uniform4fv(U.uA, A);
    gl.uniform4fv(U.uB, B);
    gl.uniform4fv(U.uM, M);
    gl.uniform1i(U.uN, P.length);
    gl.uniform1i(U.uMode, opt.mode || 0);
    gl.uniform1i(U.uStyle, opt.style || 0);
    gl.uniform1i(U.uTint, opt.tint ? 1 : 0);
    gl.uniform3fv(U.uPel, J.pel);
    gl.uniform3fv(U.uUp, J.up);
    gl.uniform3fv(U.uFwd, J.fc);
    gl.uniform3fv(U.uLeft, J.lc);
    gl.uniform3fv(U.uHead, J.head);
    gl.uniform3fv(U.uHFwd, J.hf);
    gl.uniform3fv(U.uPFwd, J.fp);
    gl.uniform3fv(U.uPLeft, J.lp);
    gl.uniform4fv(U.uBound, bounds(P));
    gl.uniform2f(U.uBase, cam.target[0], cam.target[2]);
    const dec = new Float32Array(24);
    const decp = new Float32Array(24);
    (opt.decals || []).slice(0, 6).forEach((d, i) => { dec.set([d.heel[0], d.heel[2], d.toe[0], d.toe[2]], i * 4); decp.set([d.w, d.a, d.side === 'R' ? 1 : 0, 1], i * 4); });
    gl.uniform4fv(U.uDec, dec);
    gl.uniform4fv(U.uDecP, decp);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (gl.isContextLost()) return false;
    ctx.drawImage(cv, 0, 0);
    return C;
  }

  /* ---------- Abläufe: Schlüsselbilder mit Zeit und Übergang ---------- */
  const ease = {
    io: (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
    kime: (u) => 1 - Math.pow(1 - u, 3.2), // schnell los, hart abbremsen
    lin: (u) => u,
  };
  function cr(p0, p1, p2, p3, u) {
    const u2 = u * u;
    const u3 = u2 * u;
    return 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3);
  }
  function blend(a, b, c, d, u) {
    if (typeof b === 'number') return cr(a, b, c, d, u);
    if (Array.isArray(b)) return b.map((_, i) => blend(a[i], b[i], c[i], d[i], u));
    const o = {};
    for (const k in b) o[k] = blend(a[k], b[k], c[k], d[k], u);
    return o;
  }
  function timeline(keys) {
    const K = keys.map((k) => Object.assign({ t: k.t, e: k.e || 'io' }, { p: full(k.p) }));
    return (t) => {
      if (t <= K[0].t) return K[0].p;
      if (t >= K[K.length - 1].t) return K[K.length - 1].p;
      let i = 0;
      while (K[i + 1].t < t) i++;
      const u = ease[K[i + 1].e]((t - K[i].t) / (K[i + 1].t - K[i].t));
      const g = (j) => K[Math.max(0, Math.min(K.length - 1, j))].p;
      return blend(g(i - 1), g(i), g(i + 1), g(i + 2), u);
    };
  }

  window.Figur3D = { solve, prims, draw, camera, timeline, full, ok: supported, ready: () => renderer().ok, v: { add, sub, mul, mix, len, norm } };
})();
