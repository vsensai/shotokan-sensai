/* Schemabilder ohne 3D-Figur: Enbusen, Kumite-Abläufe, Kraftrichtung (baut auf SK.gfx.kit auf).
   Techniken mit Figur zeigt die App als 3D-Figur (js/figur-posen.js). */
(function () {
  'use strict';
  const { frame, arrow, FONT, HL, INK } = SK.gfx.kit;

  // Kumite-Ablauf schematisch: Angreifer (rot) vorwärts, Verteidiger (blau) rückwärts, am Ende Konter
  function kumite(label, n, lines) {
    const W = 320;
    const step = n > 1 ? 44 : 70;
    const x0 = (W - (n + 1) * step) / 2;
    const ax = (i) => x0 + i * step;
    const vx = (i) => x0 + (i + 1) * step;
    const RED = '#e53935';
    const BLUE = '#1e88e5';
    const ar = (x1, x2, y, c) => `<path d="M${x1} ${y} H${x2 - 6}" stroke="${c}" stroke-width="2.5"/><path d="M${x2} ${y} l-8 -5 v10 z" fill="${c}"/>`;
    const txt = (x, y, t, o) => `<text x="${x}" y="${y}" font-size="${(o && o.s) || 10}" text-anchor="${(o && o.a) || 'middle'}"${o && o.b ? ' font-weight="700"' : ''} fill="${(o && o.c) || '#455a64'}" ${FONT}>${t}</text>`;
    let s = txt(14, 44, 'Angreifer', { a: 'start', b: true, c: RED }) + txt(14, 176, 'Verteidiger', { a: 'start', b: true, c: BLUE });
    for (let i = 0; i <= n; i++) {
      const last = i === n;
      s += `<circle cx="${ax(i)}" cy="76" r="${last ? 11 : 7}" fill="${RED}" opacity="${last ? 1 : 0.35}"/><circle cx="${vx(i)}" cy="136" r="${last ? 11 : 7}" fill="${BLUE}" opacity="${last ? 1 : 0.35}"/>`;
      if (i < n) s += ar(ax(i) + 9, ax(i + 1) - 9, 76, RED) + ar(vx(i) + 9, vx(i + 1) - 9, 136, BLUE) + txt((ax(i) + ax(i + 1)) / 2, 64, i + 1, { s: 9 }) + txt((vx(i) + vx(i + 1)) / 2, 156, i + 1, { s: 9 });
    }
    s += txt(ax(n), 80, 'A', { b: true, c: '#fff' }) + txt(vx(n), 140, 'V', { b: true, c: '#fff' });
    s += arrow(`M${vx(n)} 123 C${vx(n)} 104 ${ax(n) + 26} 100 ${ax(n) + 12} 88`) + txt(ax(n) - 4, 110, n > 1 ? 'Gegenangriff mit Kiai' : 'Konter', { a: 'end', b: true, c: '#c62828' });
    return frame(W, 230, label, s, lines);
  }

  // Kraftrichtung: gerade (Tsuki/Kekomi) gegenüber rechtwinklig (Uchi/Keage), rechts mit Drehpunkt am Gelenk
  function force(label, t1, t2, legMode, lines) {
    const limbAt = (dx) => {
      const gi = legMode ? 18 : 16;
      const sk = legMode ? 13 : 11;
      const tube = (x1, x2, w, c) => `<path d="M${x1 + dx} 100 H${x2 + dx}" stroke="${INK}" stroke-width="${w + 3}" stroke-linecap="round"/><path d="M${x1 + dx} 100 H${x2 + dx}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
      const end = legMode
        ? `<path d="M${88 + dx} 102 V80" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M${88 + dx} 102 V80" stroke="#f2c9a6" stroke-width="10" stroke-linecap="round"/>`
        : `<circle cx="${86 + dx}" cy="100" r="9" fill="#f2c9a6" stroke="${INK}" stroke-width="1.5"/>`;
      return tube(44, 82, sk, '#f2c9a6') + tube(14, 44, gi, '#ffffff') + end + `<circle cx="${44 + dx}" cy="100" r="3" fill="${INK}"/>`;
    };
    const title = (x, t) => `<text x="${x}" y="36" font-size="11" font-weight="700" text-anchor="middle" fill="#37474f" ${FONT}>${t}</text>`;
    const s =
      title(70, t1) + title(210, t2) + `<path d="M140 24 V160" stroke="#e0e0e0"/>` +
      limbAt(0) + `<path d="M44 100 H136" stroke="#90a4ae" stroke-dasharray="3 4"/>` + arrow('M100 100 L132 100') +
      limbAt(140) + `<path d="M${legMode ? 228 : 226} 100 A42 42 0 0 0 211 68" stroke="#90a4ae" stroke-dasharray="3 4" fill="none"/>` + arrow(`M${legMode ? 240 : 236} 92 L${legMode ? 240 : 236} 54`);
    return frame(280, 200, label, s, lines);
  }

  const T = {
    enbusen: () =>
      frame(
        220,
        260,
        'Enbusen',
        `<path d="M40 46 H180 M110 46 V176 M40 176 H180" stroke="#90a4ae" stroke-width="8" stroke-linecap="round" fill="none"/><circle cx="110" cy="176" r="9" fill="${HL}"/><text x="110" y="202" font-size="11" text-anchor="middle" fill="#455a64" ${FONT}>Start</text>`,
        ['Linie, auf der sich eine Kata bewegt', '(z. B. Heian Shodan: „工“-Form)']
      ),

    /* ---------- Kumite-Formen und Kraftrichtung (schematisch) ---------- */
    'gohon-kumite': () => kumite('Gohon-Kumite', 5, ['Gohon-Kumite: 5 Angriffe vorwärts, 5 Abwehren', 'rückwärts, dann Gegenangriff mit Kiai']),
    'kihon-ippon-kumite': () => kumite('Kihon-Ippon-Kumite', 1, ['Kihon-Ippon-Kumite: ein angesagter Angriff,', 'Abwehr und Konter']),
    'tsuki-uchi': () => force('Tsuki und Uchi', 'Tsuki', 'Uchi', false, ['Tsuki: Kraft in Richtung des Unterarms', 'Uchi: Kraft im rechten Winkel dazu']),
    'keage-kekomi': () => force('Kekomi und Keage', 'Kekomi (Stoßtritt)', 'Keage (Schnapptritt)', true, ['Kekomi: Kraft in Richtung des Unterschenkels', 'Keage: Kraft im rechten Winkel dazu']),
  };

  SK.gfx.TECH = T;
})();
