/* 3D-Figuren in der App: ruhende Kernbilder (einmal gerechnet, dann zwischengespeichert),
   per Finger drehbar, ▶ Bewegung, Phasenbild. Ohne WebGL 2 bleiben die bisherigen SVG-Grafiken. */
(function () {
  'use strict';
  const E = window.Figur3D;
  const D = SK.fig3dDefs || {};
  const esc = (s) => SK.util.esc(s);
  const RED = '#a3151a';

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
  const has = (key) => !!key && !!D[split(key).id] && ok();

  /* ---------- Einträge vorbereiten: Ablauf, Kamera ---------- */
  const VIEWS = {
    side: { yaw: -88, pitch: 8 }, side3: { yaw: -64, pitch: 14 }, front3: { yaw: -34, pitch: 13 },
    front: { yaw: -6, pitch: 9 }, stand: { yaw: -60, pitch: 20 },
  };
  const entries = new Map();
  function entry(key) {
    if (entries.has(key)) return entries.get(key);
    const { id, mirrored } = split(key);
    const d = D[id];
    const pose = E.timeline(d.keys);
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
      yaw: v.yaw, pitch: v.pitch, fov: 30,
    };
    const t0 = d.keys[0].t;
    const t1 = d.keys[d.keys.length - 1].t;
    const e = { key, d, pose, partner, cam, mirrored, t0, t1, start: E.solve(pose(t0)) };
    entries.set(key, e);
    return e;
  }

  /* ---------- Zeichnen ---------- */
  const footDecal = (J, s, a, w) => ({ heel: J['heel' + s], toe: J['toe' + s], w, a, side: s });
  function decals(e, P, J) {
    const out = ['L', 'R'].filter((s) => J['ankle' + s][1] < 0.12).map((s) => footDecal(J, s, 1, P.w[s === 'L' ? 0 : 1]));
    (e.d.startPrint || '').split('').forEach((s) => out.push(footDecal(e.start, s, 0.32, 0.3)));
    return out;
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
    let ghosts = [];
    if (st.phase) ghosts = [0.12, 0.3, 0.48, 0.66, 0.84].map((x) => e.t0 + x * (e.t1 - e.t0)).filter((x) => Math.abs(x - t) > 0.05);
    else if (!st.playing && st.ghost !== false) ghosts = (e.d.ghost || []).filter((x) => Math.abs(x - t) > 0.05);
    const PP = e.partner ? e.partner(t) : null;
    let C;
    if (!ghosts.length && !PP) C = E.draw(ctx, w, h, P, cam, { mode: 0, decals: decals(e, P, J) });
    else {
      C = E.draw(ctx, w, h, P, cam, { mode: 1, decals: decals(e, P, J) });
      ghosts.forEach((x) => {
        ctx.globalAlpha = st.phase ? 0.24 : 0.3;
        E.draw(ctx, w, h, e.pose(x), cam, { mode: 2 });
      });
      ctx.globalAlpha = 1;
      const figs = [{ P, tint: false, z: P.pelvis }];
      if (PP) figs.push({ P: PP, tint: true, z: PP.pelvis });
      const camPos = C.ro;
      figs.sort((a, b) => Math.hypot(b.z[0] - camPos[0], b.z[2] - camPos[2]) - Math.hypot(a.z[0] - camPos[0], a.z[2] - camPos[2]));
      figs.forEach((f) => E.draw(ctx, w, h, f.P, cam, { mode: 2, tint: f.tint }));
    }
    ctx.restore();
    if (!C) return false;
    overlay(ctx, w, h, e, st, C, P, J, PP);
    return true;
  }

  // Bahn, Trefferpunkt, Gewicht, Zusatzzeichen
  function overlay(g, w, h, e, st, C, P, J, PP) {
    const pr = (p) => {
      const q = C.project(p);
      return e.mirrored ? [w - q[0], q[1]] : q;
    };
    const s = h / 400;
    const font = (px, wt) => `${wt || 700} ${px * s}px system-ui, "Segoe UI", Roboto, sans-serif`;
    const { add, mul, mix, sub, norm } = E.v;
    const text = (x, y, t, col, align) => {
      g.font = font(12);
      g.textAlign = align || 'center';
      g.lineWidth = 4 * s;
      g.strokeStyle = 'rgba(255,255,255,.92)';
      g.strokeText(t, x, y);
      g.fillStyle = col || RED;
      g.fillText(t, x, y);
    };
    const dashLine = (pts, col, wd) => {
      g.lineWidth = (wd || 2.2) * s;
      g.lineCap = 'round';
      g.setLineDash([7 * s, 6 * s]);
      g.strokeStyle = col || RED;
      g.beginPath();
      pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
      g.stroke();
      g.setLineDash([]);
    };
    const arrowHead = (a, b, col) => {
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 1) return;
      g.fillStyle = col || RED;
      g.beginPath();
      g.moveTo(b[0], b[1]);
      g.lineTo(b[0] - Math.cos(ang - 0.45) * 12 * s, b[1] - Math.sin(ang - 0.45) * 12 * s);
      g.lineTo(b[0] - Math.cos(ang + 0.45) * 12 * s, b[1] - Math.sin(ang + 0.45) * 12 * s);
      g.fill();
    };
    g.save();
    const resting = !st.playing;
    // Gewicht und Maße bei Ständen
    if (e.d.labels && resting && st.t > 0.8) {
      ['L', 'R'].forEach((k, i) => {
        if (J['ankle' + k][1] > 0.12 || !P.w[i]) return;
        const p = pr(mix(J['heel' + k], J['toe' + k], 0.5));
        g.font = font(15, 800);
        g.textAlign = 'center';
        g.lineWidth = 4 * s;
        g.strokeStyle = 'rgba(255,255,255,.92)';
        const t = `${Math.round(P.w[i] * 100)} %`;
        g.strokeText(t, p[0], p[1] + 26 * s);
        g.fillStyle = P.w[i] >= 0.6 ? '#9b1010' : '#d0453f';
        g.fillText(t, p[0], p[1] + 26 * s);
      });
      const hl = J.heelL;
      const hr = J.heelR;
      const dim = (a, b, label) => {
        const A = pr(a);
        const B = pr(b);
        if (Math.hypot(A[0] - B[0], A[1] - B[1]) < 18 * s) return;
        dashLine([A, B], '#5f6b74', 1.4);
        g.font = font(11, 600);
        g.fillStyle = '#5f6b74';
        g.textAlign = 'center';
        g.fillText(label, (A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - 6 * s);
      };
      if (Math.abs(hl[2] - hr[2]) > 0.15) dim([Math.min(hl[0], hr[0]) - 0.2, 0.002, hr[2]], [Math.min(hl[0], hr[0]) - 0.2, 0.002, hl[2]], 'Länge');
      if (Math.abs(hl[0] - hr[0]) > 0.15) dim([hl[0], 0.002, Math.min(hl[2], hr[2]) - 0.16], [hr[0], 0.002, Math.min(hl[2], hr[2]) - 0.16], 'Breite');
    }
    // Trefferpunkt mit Beschriftung
    const hitInfo = e.d.hit;
    if (hitInfo && resting && J[hitInfo.at]) {
      const p = pr(J[hitInfo.at]);
      g.fillStyle = '#d32f2f';
      g.strokeStyle = '#fff';
      g.lineWidth = 2 * s;
      g.beginPath();
      g.arc(p[0], p[1], 6 * s, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      if (!st.plain && hitInfo.text) {
        const right = p[0] < w * 0.62;
        const tx = right ? Math.min(w - 8 * s, p[0] + 46 * s) : Math.max(8 * s, p[0] - 46 * s);
        const ty = Math.max(18 * s, p[1] - 34 * s);
        g.strokeStyle = '#d32f2f';
        g.lineWidth = 1.3 * s;
        g.beginPath();
        g.moveTo(p[0], p[1]);
        g.lineTo(tx, ty + 3 * s);
        g.stroke();
        text(tx, ty, hitInfo.text, '#b71c1c', right ? 'start' : 'end');
      }
    }
    (e.d.marks || []).forEach((m) => {
      if (m === 'kiai' && resting) {
        const c = add(add(J.head, mul(J.hf, 0.2)), mul(J.up, -0.03));
        [-0.06, 0, 0.06].forEach((dy) => {
          const a = pr(add(c, [0, dy * 0.6, 0]));
          const b = pr(add(add(c, mul(J.hf, 0.12)), [0, dy * 1.6, 0]));
          g.strokeStyle = '#d32f2f';
          g.lineWidth = 3 * s;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(a[0], a[1]);
          g.lineTo(b[0], b[1]);
          g.stroke();
        });
        if (!st.plain) { const q = pr(add(c, add(mul(J.hf, 0.16), [0, 0.12, 0]))); text(q[0], q[1], 'Kiai!'); }
      }
      if (m === 'kime' && resting) {
        const f = pr(J.fistR);
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          g.strokeStyle = '#d32f2f';
          g.lineWidth = 2.5 * s;
          g.beginPath();
          g.moveTo(f[0] + Math.cos(a) * 13 * s, f[1] + Math.sin(a) * 13 * s);
          g.lineTo(f[0] + Math.cos(a) * 23 * s, f[1] + Math.sin(a) * 23 * s);
          g.stroke();
        }
      }
      if (m === 'sundome' && resting) {
        const c = pr(add(J.fistR, mul(norm(sub(J.fistR, J.elbowR)), 0.16)));
        g.setLineDash([4 * s, 3 * s]);
        g.strokeStyle = '#90a4ae';
        g.lineWidth = 2.5 * s;
        g.beginPath();
        g.arc(c[0], c[1], 14 * s, 0, Math.PI * 2);
        g.stroke();
        g.setLineDash([]);
        if (!st.plain) text(c[0], c[1] - 22 * s, 'Stopp vor dem Ziel', '#546e7a');
      }
      if (m === 'turn') {
        const c = pr(add(J.head, [0, 0.28, 0]));
        g.strokeStyle = RED;
        g.lineWidth = 2.6 * s;
        g.beginPath();
        g.ellipse(c[0], c[1], 34 * s, 9 * s, 0, Math.PI * 0.1, Math.PI * 1.75);
        g.stroke();
        arrowHead([c[0] + 30 * s, c[1] - 6 * s], [c[0] + 34 * s, c[1] + 2 * s]);
      }
      if (m === 'line') {
        const a = pr([0, 0.003, -1.2]);
        const b = pr([0, 0.003, 1.4]);
        dashLine([a, b], '#78909c', 1.8);
        if (!st.plain) text(b[0], b[1] - 8 * s, 'Angriffslinie', '#c62828');
      }
      if (m === 'maai' && PP) {
        const a = pr([0, 0.01, P.L.z + 0.25]);
        const b = pr([0, 0.01, PP.R.z - 0.25]);
        g.strokeStyle = RED;
        g.lineWidth = 2.5 * s;
        g.beginPath();
        g.moveTo(a[0], a[1]);
        g.lineTo(b[0], b[1]);
        g.stroke();
        arrowHead(b, a);
        arrowHead(a, b);
        if (!st.plain) text((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 10 * s, 'Maai');
      }
      if (m === 'gaze' && PP) {
        const JP = E.solve(PP);
        dashLine([pr(J.head), pr(JP.head)], RED, 1.8);
      }
      if (m.startsWith('ring:') && J[m.slice(5)]) {
        const p = pr(J[m.slice(5)]);
        g.strokeStyle = '#d32f2f';
        g.lineWidth = 3 * s;
        g.beginPath();
        g.arc(p[0], p[1], 16 * s, 0, Math.PI * 2);
        g.stroke();
      }
      if (m.startsWith('arm:')) {
        const k = m.slice(4);
        const a = pr(mix(J['elbow' + k], J['wrist' + k], 0.1));
        const b = pr(mix(J['elbow' + k], J['wrist' + k], 0.9));
        g.strokeStyle = 'rgba(211,47,47,.55)';
        g.lineWidth = 16 * s;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(a[0], a[1]);
        g.lineTo(b[0], b[1]);
        g.stroke();
      }
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
  function pump() {
    if (busy || !queue.length) return;
    busy = true;
    requestAnimationFrame(() => {
      const job = queue.shift();
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
  function still(key, w, h, plain) {
    const id = `${key}|${w}x${h}|${plain ? 1 : 0}`;
    if (!stills.has(id)) {
      const p = new Promise((resolve, reject) => { queue.push({ key, w, h, plain, resolve, reject }); pump(); });
      // Fehlschlag nicht merken: beim nächsten Mal neu versuchen
      p.catch(() => stills.delete(id));
      stills.set(id, p);
    }
    return stills.get(id);
  }

  /* ---------- HTML und Einbinden ---------- */
  function html(key, o) {
    start();
    const opt = o || {};
    const e = D[split(key).id];
    const anim = e && !e.still;
    const tools = opt.tools === false ? '' : `<div class="f3d-tools">${anim ? '<button type="button" class="gfx-btn" data-act="f3d-play" aria-pressed="false">▶ Bewegung</button><button type="button" class="gfx-btn" data-act="f3d-phase" aria-pressed="false">Phasenbild</button>' : ''}<button type="button" class="gfx-btn" data-act="f3d-home" hidden>↺ Kernbild</button></div>`;
    return `<div class="f3d${opt.cls ? ` ${opt.cls}` : ''}" data-f3d="${esc(key)}"${opt.plain ? ' data-plain="1"' : ''}><div class="f3d-stage"><img class="f3d-img" alt="" draggable="false"><span class="f3d-badge" aria-hidden="true">3D ↻</span></div>${tools}</div>`;
  }
  const dpr = (cap) => Math.min(window.devicePixelRatio || 1, cap);
  function sizeOf(stage, cap) {
    const cw = Math.max(120, Math.round((stage.clientWidth || 260) / 40) * 40);
    const w = Math.round(cw * dpr(cap));
    return [w, Math.round(w * 0.8)];
  }
  function fallback(box) {
    const stage = box.querySelector('.f3d-stage');
    const key = box.dataset.f3d;
    // Quiz (data-plain): ohne Beschriftungen, die die Antwort verraten würden
    stage.innerHTML = box.dataset.plain === '1' ? SK.gfx.plainSvg(() => SK.gfx.byKey(key)) : SK.gfx.byKey(key);
    stage.classList.add('f3d-fallback');
    box.querySelectorAll('.f3d-tools [data-act]').forEach((b) => (b.hidden = true));
  }
  function load(box) {
    const stage = box.querySelector('.f3d-stage');
    const img = stage && stage.querySelector('.f3d-img');
    if (!img) return;
    const [w, h] = sizeOf(stage, 2);
    still(box.dataset.f3d, w, h, box.dataset.plain === '1').then((url) => { img.src = url; box.classList.add('f3d-ready'); }).catch(() => fallback(box));
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
    box.classList.remove('f3d-live');
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
    live = { box, cv, ctx: cv.getContext('2d'), e, st: { t: e.d.best == null ? 1 : e.d.best, cam: Object.assign({}, e.cam), plain: box.dataset.plain === '1' }, dirty: true };
    loop();
    return live;
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
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const L = live;
      if (L.st.playing) {
        L.st.t += dt / (L.e.d.dur || 1.6);
        if (L.st.t > L.e.t1 + 0.35) L.st.t = L.e.t0;
        L.dirty = true;
      }
      if (L.dirty) {
        L.dirty = false;
        const stage = L.cv.parentElement;
        const [w, h] = sizeOf(stage, L.st.playing || L.drag ? 1.75 : 2.5);
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
      if (!stage) return;
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
    const end = () => {
      if (drag && live && live.box === drag.box) { live.drag = false; kick(); }
      drag = null;
    };
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', end);
    document.addEventListener('click', (ev) => {
      const btn = ev.target.closest && ev.target.closest('[data-act^="f3d-"]');
      if (!btn) return;
      const box = btn.closest('.f3d');
      if (!box || !box.classList.contains('f3d-ready')) return;
      const act = btn.dataset.act;
      if (act === 'f3d-home') { stopLive(); return; }
      const L = startLive(box);
      if (act === 'f3d-play') {
        L.st.playing = !L.st.playing;
        if (L.st.playing) L.st.t = L.e.t0;
        btn.setAttribute('aria-pressed', String(L.st.playing));
        btn.textContent = L.st.playing ? '■ Standbild' : '▶ Bewegung';
        if (!L.st.playing) L.st.t = L.e.d.best == null ? 1 : L.e.d.best;
      }
      if (act === 'f3d-phase') {
        L.st.phase = !L.st.phase;
        btn.setAttribute('aria-pressed', String(L.st.phase));
      }
      kick();
    });
    window.addEventListener('resize', () => kick());
  }
  // Erst einrichten, wenn die erste Figur gebraucht wird – die WebGL-Prüfung kostet beim Start Zeit.
  let started = false;
  function start() {
    if (started) return;
    started = true;
    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init);
  }

  SK.fig3d = { ok, has, html, entry, paint, still };
})();
