/* Fußbewegungen (Ashi-sabaki) von oben: Fußabdrücke, gestrichelte Bahn, nummerierte Schritte.
   Jede Bewegung ist eine Folge von Schlüsselbildern (Lage beider Füße); daraus entstehen
   das Standbild (blasse Ausgangslage, Bahn, Endlage) und die Animation (▶ Bewegung). */
(function () {
  'use strict';
  const { frame, foot, mode, FONT, HL, ARR } = SK.gfx.kit;
  const r1 = (v) => Math.round(v * 10) / 10;
  const SC = 0.7;

  // Catmull-Rom: Punkt auf dem Abschnitt p1→p2 (p0, p3 = Nachbarn)
  function cr(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return [0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3));
  }
  const same = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

  // Bahn eines Fußes durch alle seine Lagen; endet kurz vor der Endlage (Pfeilspitze sichtbar)
  function trail(all) {
    // nur Ortswechsel; reines Drehen am Platz hat keine Bahn
    const pts = [];
    all.forEach((p) => { if (!pts.length || Math.hypot(p[0] - pts[pts.length - 1][0], p[1] - pts[pts.length - 1][1]) > 4) pts.push(p); });
    if (pts.length < 2) return '';
    const P = [pts[0]].concat(pts, [pts[pts.length - 1]]);
    const out = [];
    for (let i = 1; i < P.length - 2; i++) {
      for (let s = 0; s <= 10; s++) if (s || i === 1) out.push(cr(P[i - 1], P[i], P[i + 1], P[i + 2], s / 10));
    }
    // letzte 15 Einheiten weglassen
    let cut = 15;
    while (out.length > 2 && cut > 0) {
      const [a, b] = [out[out.length - 1], out[out.length - 2]];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (d > cut) {
        out[out.length - 1] = [a[0] + ((b[0] - a[0]) * cut) / d, a[1] + ((b[1] - a[1]) * cut) / d];
        cut = 0;
      } else {
        out.pop();
        cut -= d;
      }
    }
    const d = 'M' + out.map((p) => `${r1(p[0])} ${r1(p[1])}`).join(' L');
    const dim = mode.anim ? ' opacity=".3"' : '';
    return `<g data-arrow="1"${dim}><path d="${d}" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/><path d="${d}" stroke="${ARR}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-dasharray="6 4" marker-end="url(#ah)"/></g>`;
  }

  const num = (x, y, n) => `<circle cx="${x}" cy="${y}" r="8" fill="#fff" stroke="${HL}" stroke-width="1.6"/><text x="${x}" y="${y + 3.5}" font-size="10" font-weight="700" text-anchor="middle" fill="${HL}" ${FONT}>${n}</text>`;

  /* def: { w, keys: [{ L: [x, y, r, ball?], R: [...] }, …], nums, axis, extra, lines }
     Gleiche Lage in aufeinanderfolgenden Schlüsselbildern = Fuß steht. */
  function sabaki(label, def) {
    const w = def.w || 220;
    const keys = def.keys;
    const K = keys.length;
    let ghosts = '';
    let trails = '';
    let finals = '';
    // Zeitleiste: kurz halten, je Übergang gleich lang bewegen, Endlage halten
    const SUBS = 8;
    const t0 = 0.12;
    const t1 = 0.82;
    const times = [0];
    for (let i = 0; i < K - 1; i++) for (let s = 0; s <= SUBS; s++) if (s || i === 0) times.push(r1(((t0 + ((t1 - t0) * (i + s / SUBS)) / (K - 1)) * 1000)) / 1000);
    times.push(1);
    const dur = r1(1.4 + (K - 1) * 1.1);
    ['L', 'R'].forEach((side) => {
      const seq = keys.map((k) => k[side]);
      const end = seq[K - 1];
      // Lagen, die der Fuß nacheinander einnimmt (ohne Stehen)
      const pts = [];
      seq.forEach((p) => { if (!pts.length || !same(pts[pts.length - 1], p)) pts.push(p); });
      pts.slice(0, -1).forEach((p, i) => { ghosts += `<g opacity="${i ? 0.6 : 1}">${foot(p[0], p[1], p[2], 0.5, { side, was: true, scale: SC })}</g>`; });
      trails += trail(pts);
      if (!mode.anim) {
        finals += foot(end[0], end[1], end[2], end[3] ? 0.1 : 0.7, { side, ball: !!end[3], scale: SC });
        return;
      }
      // Werte je Zeitpunkt: auf der Bahn entlang (Catmull-Rom), Drehung linear
      const P = [pts[0]].concat(pts, [pts[pts.length - 1]]);
      const vals = [seq[0]];
      let seg = 0;
      for (let i = 0; i < K - 1; i++) {
        const moved = !same(seq[i], seq[i + 1]);
        for (let s = 0; s <= SUBS; s++) {
          if (!s && i) continue;
          const u = s / SUBS;
          if (!moved) vals.push(seq[i]);
          else {
            const [x, y] = cr(P[seg], P[seg + 1], P[seg + 2], P[seg + 3], u);
            vals.push([x, y, seq[i][2] + (seq[i + 1][2] - seq[i][2]) * u]);
          }
        }
        if (moved) seg++;
      }
      vals.push(end);
      const kt = `keyTimes="${times.join(';')}" dur="${dur}s" fill="freeze" calcMode="linear"`;
      const tr = vals.map((v) => `${r1(v[0])} ${r1(v[1])}`).join(';');
      const rot = vals.map((v) => r1(v[2])).join(';');
      finals += `<g><animateTransform attributeName="transform" type="translate" values="${tr}" ${kt}/><g><animateTransform attributeName="transform" type="rotate" values="${rot}" ${kt}/>${foot(0, 0, 0, 0.7, { side, scale: SC })}</g></g>`;
    });
    const axis = def.axis ? `<path d="${def.axis}" stroke="#b0bec5" stroke-width="1.2" stroke-dasharray="2 4"/>` : '';
    const vorne = `<path d="M18 42 V24" stroke="#78909c" stroke-width="1.6"/><path d="M18 14 l-5 9 h10 z" fill="#78909c"/><text x="27" y="30" font-size="10" fill="#78909c" ${FONT}>vorne</text>`;
    const nums = (def.nums || []).map(([x, y, n]) => num(x, y, n)).join('');
    return frame(w, 290, label, `${vorne}${axis}${def.extra || ''}${ghosts}${trails}${finals}${nums}`, def.lines);
  }

  SK.gfx.ASHI = {
    'ayumi-ashi': () => sabaki('Ayumi-ashi', {
      axis: 'M110 24 V270',
      keys: [
        { L: [86, 140, 0], R: [134, 232, 25] },
        { L: [86, 140, 0], R: [106, 150, 5] },
        { L: [86, 140, -25], R: [134, 56, 0] },
      ],
      lines: ['von oben: Schritt nach vorne – der hintere Fuß', 'kommt in der Mitte des Schritts zum Standbein'],
    }),

    'suri-ashi': () => sabaki('Suri-ashi', {
      axis: 'M110 24 V270',
      keys: [
        { L: [86, 140, 0], R: [134, 232, 25] },
        { L: [86, 140, 0], R: [108, 150, 5] },
        { L: [86, 140, -25], R: [134, 56, 0] },
      ],
      lines: ['von oben: Gleitschritt – der Fuß bleibt flach', 'am Boden und gleitet nach vorne'],
    }),


    'yori-ashi': () => sabaki('Yori-ashi', {
      keys: [
        { L: [86, 156, 0], R: [134, 240, 25] },
        { L: [86, 92, 0], R: [134, 176, 25] },
      ],
      lines: ['von oben: beide Füße gleiten gleichzeitig,', 'der Stand bleibt dabei unverändert'],
    }),

    'tai-sabaki': () => sabaki('Tai-sabaki', {
      axis: 'M110 24 V270',
      keys: [
        { L: [88, 150, -10], R: [132, 150, 10] },
        { L: [88, 150, 20], R: [132, 150, 10] },
        { L: [88, 150, 20], R: [168, 212, 30] },
      ],
      extra: `<text x="116" y="40" font-size="10" fill="#78909c" ${FONT}>Angriffslinie</text>`,
      lines: ['von oben: Ausweichen – ein Fuß setzt schräg', 'zurück, der Körper dreht aus der Angriffslinie'],
    }),




  };
})();
