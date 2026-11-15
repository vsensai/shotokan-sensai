/* Körperwaffen: plastisch gezeichnete Hände, Füße, Arm und Bein – die Trefferfläche leuchtet rot.
   Die Waffe selbst ist immer Haut: Ärmel und Hosenbein enden vor ihr (bei Ellbogen, Unterarm und Knie hochgeschoben).
   Alle Bilder im selben Format (240 × 240) und ohne SVG-Filter (Filter machen das Scrollen langsam):
   Rundung = Verlauf von oben nach unten und ein gestufter Schattenrand unten rechts. */
(function () {
  'use strict';
  const { FONT, HL, SOLE, TOES } = SK.gfx.kit;
  const esc = (s) => SK.util.esc(s);
  const r1 = (v) => Math.round(v * 10) / 10;

  // Töne: [hell, mittel, dunkel, Schattenrand, Kontur]
  const TON = {
    haut: ['#fde8d9', '#f4cdb1', '#e3b08e', '#c68e6b', '#9a6a52'],
    tief: ['#efc7ab', '#e2b08e', '#cf9875', '#b47d5c', '#8f6049'],
    gi: ['#ffffff', '#f6f8f9', '#e4e9ec', '#bcc6cc', '#87939b'],
    gitief: ['#f6f8f9', '#eaeef0', '#d9dfe3', '#b0bbc2', '#828e96'],
  };
  const NAGEL = '#fff1e6';

  /* ---------- Formen ---------- */
  // Abbildung: verschieben, drehen (Grad), vergrößern, spiegeln – Formen werden fertig umgerechnet,
  // damit Licht und Schatten in jedem Bild aus derselben Richtung kommen
  function lage(o) {
    const { x = 0, y = 0, rot = 0, s = 1, flipX = false, flipY = false } = o || {};
    const c = Math.cos((rot * Math.PI) / 180);
    const sn = Math.sin((rot * Math.PI) / 180);
    const f = ([px, py]) => {
      const qx = (flipX ? -px : px) * s;
      const qy = (flipY ? -py : py) * s;
      return [x + qx * c - qy * sn, y + qx * sn + qy * c];
    };
    f.s = s;
    return f;
  }
  // Fingerglied als Kapsel, die sich verjüngt: Kreis a (Radius ra) bis Kreis b (Radius rb)
  function cap(T, a, b, ra, rb) {
    const [ax, ay] = T(a);
    const [bx, by] = T(b);
    const [qa, qb] = [ra * T.s, rb * T.s];
    const d = Math.hypot(bx - ax, by - ay);
    const th = Math.atan2(by - ay, bx - ax);
    const ph = Math.acos(Math.max(-1, Math.min(1, (qa - qb) / d)));
    const pt = (cx, cy, r, w) => `${r1(cx + r * Math.cos(w))} ${r1(cy + r * Math.sin(w))}`;
    const lb = 2 * ph > Math.PI ? 1 : 0;
    return `M${pt(ax, ay, qa, th + ph)}L${pt(bx, by, qb, th + ph)}A${r1(qb)} ${r1(qb)} 0 ${lb} 0 ${pt(bx, by, qb, th - ph)}L${pt(ax, ay, qa, th - ph)}A${r1(qa)} ${r1(qa)} 0 ${1 - lb} 0 ${pt(ax, ay, qa, th + ph)}Z`;
  }
  // Kette von Gliedern: Punkte und Radien
  const kette = (T, pts, rs) => pts.slice(1).map((p, i) => cap(T, pts[i], p, rs[i], rs[i + 1]));
  // Pfad aus Buchstaben und Zahlenpaaren: 'M', 30, 78, 'C', … – die Punkte werden abgebildet
  function pfad(T, ...teile) {
    let out = '';
    for (let i = 0; i < teile.length;) {
      if (typeof teile[i] === 'string') out += teile[i++];
      else {
        const [x, y] = T([teile[i], teile[i + 1]]);
        out += `${r1(x)} ${r1(y)} `;
        i += 2;
      }
    }
    return out;
  }

  /* ---------- Bild: Rahmen, Ebenen, Markierungen ---------- */
  let bildNr = 0;
  function bild(label, bauen) {
    const id = `kw${++bildNr}`;
    const defs = [];
    let n = 0;
    const alle = []; // Formen aller bisherigen Ebenen (für Schlagschatten auf das Darunterliegende)
    const neu = (ds) => ds.map((d) => {
      const pid = `${id}p${++n}`;
      defs.push(`<path id="${pid}" d="${d}"/>`);
      return pid;
    });
    const use = (ids, attr) => ids.map((p) => `<use href="#${p}"${attr ? ` ${attr}` : ''}/>`).join('');
    const z = {
      // Ebene: mehrere Formen verschmelzen zu einer Fläche. y = [oben, unten] des Verlaufs,
      // schatten = wirft einen Schatten auf die Ebenen darunter
      teil(ds, o) {
        const opt = o || {};
        const t = TON[opt.ton || 'haut'];
        const ids = neu(ds);
        const k = `${id}e${++n}`;
        const [y1, y2] = opt.y;
        defs.push(`<clipPath id="${k}c">${use(ids)}</clipPath>`,
          `<linearGradient id="${k}g" gradientUnits="userSpaceOnUse" x1="${opt.x1 || 0}" y1="${y1}" x2="${opt.x2 || 0}" y2="${y2}"><stop offset="0" stop-color="${t[0]}"/><stop offset=".55" stop-color="${t[1]}"/><stop offset="1" stop-color="${t[2]}"/></linearGradient>`);
        let out = '';
        if (opt.schatten && alle.length) {
          defs.push(`<clipPath id="${k}u">${use(alle)}</clipPath>`);
          out += `<g clip-path="url(#${k}u)" fill="#5d3323" opacity=".13">${[[0.8, 2], [1.6, 4], [2.4, 6]].map(([dx, dy]) => `<g transform="translate(${dx} ${dy})">${use(ids)}</g>`).join('')}</g>`;
        }
        out += `<g fill="${t[4]}" stroke="${t[4]}" stroke-width="1.7" stroke-linejoin="round">${use(ids)}</g><g fill="${t[3]}">${use(ids)}</g>` +
          `<g clip-path="url(#${k}c)" fill="url(#${k}g)">${[[-0.7, -1.3, 0.45], [-1.4, -2.6, 0.6], [-2.1, -3.9, 1]].map(([dx, dy, op]) => `<g transform="translate(${dx} ${dy})" opacity="${op}">${use(ids)}</g>`).join('')}</g>`;
        alle.push(...ids);
        z.letzte = `${k}c`;
        return out;
      },
      // feine Linie (Hautfalte, Stofffalte)
      falte: (d, w, op, ton) => `<path d="${d}" stroke="${TON[ton || 'haut'][4]}" stroke-width="${w || 1}" fill="none" stroke-linecap="round" opacity="${op || 0.55}"/>`,
      // Trefferfläche als leuchtender Punkt …
      glut(x, y, r) {
        if (!z.hatGlut) {
          defs.push(`<radialGradient id="${id}h"><stop offset="0" stop-color="#ff5a4d"/><stop offset=".5" stop-color="#e53935" stop-opacity=".92"/><stop offset="1" stop-color="#e53935" stop-opacity="0"/></radialGradient>`);
          z.hatGlut = true;
        }
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}h)"/>`;
      },
      // … oder als leuchtendes Band entlang einer Linie; clip = nur auf dieser Ebene (clipLetzte)
      band(d, w, clip) {
        const st = (ww, op) => `<path d="${d}" stroke="#e53935" stroke-width="${ww}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/>`;
        return `<g${clip ? ` clip-path="url(#${clip})"` : ''}>${st(w + 9, 0.12)}${st(w + 5, 0.2)}${st(w, 0.8)}</g>`;
      },
      // gefüllte Fläche mit weichem Rand
      fleck(d, clip, op) {
        return `<g${clip ? ` clip-path="url(#${clip})"` : ''} opacity="${op || 1}"><path d="${d}" fill="#e53935" stroke="#e53935" stroke-width="8" stroke-linejoin="round" opacity=".14"/><path d="${d}" fill="#e53935" stroke="#e53935" stroke-width="4" stroke-linejoin="round" opacity=".2"/><path d="${d}" fill="#e53935" opacity=".78"/></g>`;
      },
      // weicher Schein entlang einer Linie, nur auf einer Ebene: Licht, Schatten oder flächige Markierung
      schein(d, w, farbe, op, clip) {
        const st = (k) => `<path d="${d}" stroke-width="${r1(w * k)}"/>`;
        return `<g clip-path="url(#${clip})" fill="none" stroke="${farbe}" stroke-opacity="${op}" stroke-linecap="round" stroke-linejoin="round">${[1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3].map(st).join('')}</g>`;
      },
      clipLetzte: () => z.letzte,
    };
    const inner = bauen(z);
    // Der Rahmen ist das erste Rechteck (CSS blendet seinen Rand in Karten aus); der Inhalt wird auf ihn beschnitten
    return `<svg viewBox="0 0 240 240" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="238" height="238" rx="12" fill="#fafafa" stroke="#ddd"/><defs><clipPath id="${id}r"><rect x="1.5" y="1.5" width="237" height="237" rx="11.5"/></clipPath><radialGradient id="${id}b"><stop offset="0" stop-color="#e6eef3"/><stop offset="1" stop-color="#e6eef3" stop-opacity="0"/></radialGradient>${defs.join('')}</defs><g clip-path="url(#${id}r)"><circle cx="120" cy="112" r="104" fill="url(#${id}b)"/>${inner}</g></svg>`;
  }
  const titel = (t, x) => `<text x="${x || 120}" y="19" font-size="11" text-anchor="${x ? 'start' : 'middle'}" fill="#455a64" ${FONT}>${esc(t)}</text>`;
  const klein = (x, y, t, a) => `<text x="${x}" y="${y}" font-size="10" text-anchor="${a || 'middle'}" fill="#607d8b" ${FONT}>${esc(t)}</text>`;
  const pille = (x, y, nr) => `<circle cx="${x}" cy="${y}" r="8.5" fill="${HL}" stroke="#fff" stroke-width="1.8"/><text x="${x}" y="${y + 3.8}" font-size="11" font-weight="700" text-anchor="middle" fill="#fff" ${FONT}>${nr}</text>`;
  // Zeiger mit Nummer zur Legende – wie sie als Beschriftung markiert
  const zeiger = (x1, y1, x2, y2, nr) => `<g data-tag="1"><path d="M${x1} ${y1} L${x2} ${y2}" stroke="${HL}" stroke-width="1.4"/>${pille(x2, y2, nr)}</g>`;
  // Legende unter dem Bild: Zeilen [Text, Nummer?]; die erste Zeile nennt die Trefferfläche (rot, fett, mit Punkt
  // oder Nummer), weitere Zeilen sind Hinweise. Lange Zeilen bekommen eine kleinere Schrift.
  // Als Beschriftung markiert – das Quizbild lässt sie weg (stripTags), keine Gruppen darin.
  function legende(zeilen) {
    const y0 = 229 - (zeilen.length - 1) * 17;
    const fs = Math.min(11.5, ...zeilen.map(([t], i) => r1(197 / (t.length * (i ? 0.53 : 0.6)))));
    return `<g data-tag="1">${zeilen.map(([t, nr], i) => {
      const y = y0 + i * 17;
      const punkt = nr ? pille(21, y - 4, nr) : i ? '' : `<circle cx="21" cy="${y - 4}" r="5.5" fill="${HL}"/>`;
      return `${punkt}<text x="35" y="${y}" font-size="${fs}" ${i ? 'fill="#37474f"' : 'font-weight="700" fill="#b71c1c"'} ${FONT}>${esc(t)}</text>`;
    }).join('')}</g>`;
  }
  // senkrechte Spanne (oben, unten) einer Fläche im Bild – für den Verlauf einer gedrehten Form
  function spanne(T, x0, y0, x1, y1) {
    const ys = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map((p) => T(p)[1]);
    return [r1(Math.min(...ys)), r1(Math.max(...ys))];
  }
  // Ärmel- oder Hosenende: Stoffstück mit Saumlinie
  function saum(z, T, x0, x1, y0, y1, o) {
    const opt = o || {};
    const d = pfad(T, 'M', x0, y0, 'L', x1 - 5, y0, 'Q', x1, y0, x1, y0 + 5, 'L', x1, y1 - 5, 'Q', x1, y1, x1 - 5, y1, 'L', x0, y1, 'Z');
    const [a, b] = [T([x1 - 8, y0 + 7]), T([x1 - 8, y1 - 7])];
    return z.teil([d], { ton: opt.ton || 'gi', y: spanne(T, x0, y0, x1, y1), schatten: opt.schatten !== false }) +
      `<path d="M${r1(a[0])} ${r1(a[1])} L${r1(b[0])} ${r1(b[1])}" stroke="#aab4ba" stroke-width="1" fill="none"/>`;
  }

  /* ---------- Faust von der Daumenseite (rechte Faust, Handrücken oben, Stoßrichtung nach rechts) ---------- */
  // ippon: Zeigefinger halb gebeugt nach vorne gestellt (Jishi-ippon-ken), sonst eingerollt.
  // arm = { ds, y }: Formen des Arms, die mit der Hand zu einer Fläche verschmelzen
  function faustSeite(z, T, ippon, arm) {
    const G = ippon
      ? { mcp: [147, 68], pip: [188, 93], dip: [167, 113], tip: [149, 107], t: [[68, 108], [104, 124], [136, 131], [159, 128]] }
      : { mcp: [147, 68], pip: [153, 108], dip: [130, 116], tip: [118, 104], t: [[68, 108], [102, 122], [132, 127], [154, 121]] };
    const yy = (a, b) => spanne(T, 30, a, 205, b);
    const body = pfad(T, 'M', 30, 78, 'C', 56, 76, 86, 66, 118, 57, 'C', 132, 53, 142, 52, 150, 55, 'C', 158, 58, 161, 64, 161, 72, 'L', 161, 118, 'C', 161, 128, 152, 133, 142, 133, 'L', 96, 133, 'C', 70, 132, 48, 124, 30, 112, 'Z');
    let out = z.teil([body].concat(arm ? arm.ds : []), { y: arm ? arm.y : yy(50, 140) });
    const flaeche = z.clipLetzte();
    // übrige Finger: Vorderseite der Faust hinter dem Zeigefinger
    out += z.teil([cap(T, [153, 82], [155, 124], 10.5, 10)], { ton: 'tief', y: yy(70, 136) });
    out += z.teil(kette(T, [G.mcp, G.pip, G.dip, G.tip], [13, 11.5, 9.5, 8.5]), { y: yy(54, 124), schatten: true });
    const zeige = z.clipLetzte();
    if (ippon) {
      out += z.falte(pfad(T, 'M', 157, 60, 'Q', 163, 62, 166, 67)) + z.falte(pfad(T, 'M', 172, 104, 'L', 183, 98), 1.5, 0.9) + z.falte(pfad(T, 'M', 171, 121, 'Q', 175, 118, 175, 113));
    } else {
      out += z.falte(pfad(T, 'M', 157, 60, 'Q', 163, 63, 164, 70)) + z.falte(pfad(T, 'M', 140, 104, 'L', 150, 100), 1.4, 0.8);
    }
    out += z.teil(kette(T, G.t, [20, 13.5, 11, 9.5]), { y: yy(90, 142), schatten: true });
    // Daumen: wir sehen auf seinen Rücken – Nagel zum Betrachter, Gelenkfalten quer
    const [a, b] = [G.t[2], G.t[3]];
    const dir = [(b[0] - a[0]) / Math.hypot(b[0] - a[0], b[1] - a[1]), (b[1] - a[1]) / Math.hypot(b[0] - a[0], b[1] - a[1])];
    const P = (u, v) => [b[0] + dir[0] * u - dir[1] * v, b[1] + dir[1] * u + dir[0] * v];
    const nagel = pfad(T, 'M', ...P(-9, -5.5), 'Q', ...P(-1, -8), ...P(6, -5), 'Q', ...P(9, 0.5), ...P(6, 5.5), 'Q', ...P(-1, 8), ...P(-9, 6), 'Q', ...P(-12, 0), ...P(-9, -5.5), 'Z');
    out += `<path d="${nagel}" fill="${NAGEL}" stroke="${TON.haut[4]}" stroke-width=".8"/><path d="${pfad(T, 'M', ...P(-6, -3.5), 'Q', ...P(0, -5), ...P(4, -3))}" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".9"/>`;
    out += z.falte(pfad(T, 'M', ...[a[0] - 5, a[1] - 6], 'Q', ...[a[0] - 2, a[1]], ...[a[0] - 5, a[1] + 6])) + z.falte(pfad(T, 'M', ...[a[0], a[1] - 6], 'Q', ...[a[0] + 3, a[1]], ...[a[0], a[1] + 6]));
    out += z.falte(pfad(T, 'M', 54, 98, 'Q', 76, 92, 94, 110), 1, 0.35) + z.falte(pfad(T, 'M', 56, 80, 'Q', 53, 86, 54, 92), 1, 0.4);
    return { out, zeige, flaeche };
  }

  // Jishi-ippon-ken (Hangetsu): das Mittelgelenk des Zeigefingers steht vor, der Daumen stützt den Finger von unten
  function ipponKen() {
    return bild('Faust mit vorstehendem Mittelgelenk des Zeigefingers', (z) => {
      const T = lage({ x: 8, y: 20 });
      const f = faustSeite(z, T, true);
      return `${titel('rechte Faust von der Daumenseite')}
        <ellipse cx="118" cy="170" rx="88" ry="5" fill="#607d8b" opacity=".12"/>
        ${f.out}${saum(z, T, -12, 48, 56, 130)}
        ${z.glut(204, 113, 18)}
        ${zeiger(214, 106, 223, 92, 1)}${zeiger(160, 160, 160, 178, 2)}
        ${legende([['Mittelgelenk des Zeigefingers trifft', 1], ['Daumen stützt von unten', 2]])}`;
    });
  }

  // Koko (Hangetsu, Tsukami-uke): rechte Hand von der Daumenseite – Daumen und Finger bilden ein C und umfassen
  // das Handgelenk des Gegners (grau, im Querschnitt)
  function koko() {
    return bild('Hand in C-Form', (z) => {
      const T = lage({ x: 6, y: 6 });
      const yy = (a, b) => spanne(T, 30, a, 210, b);
      const hand = pfad(T, 'M', 30, 92, 'C', 60, 90, 90, 80, 116, 70, 'C', 128, 66, 138, 72, 136, 84, 'C', 122, 96, 114, 112, 116, 128, 'C', 118, 140, 122, 150, 112, 158, 'C', 84, 160, 52, 146, 30, 130, 'Z');
      const mittel = kette(T, [[122, 88], [166, 74], [197, 88], [209, 112]], [13, 11, 9.5, 8.5]);
      const zeige = kette(T, [[118, 84], [160, 72], [190, 86], [201, 108]], [13.5, 11.5, 10, 9]);
      const daumen = kette(T, [[70, 124], [104, 146], [140, 160], [166, 150]], [20, 14, 11.5, 9.5]);
      const [gx, gy] = T([158, 118]);
      return `${titel('rechte Hand von der Daumenseite')}
        <ellipse cx="120" cy="188" rx="88" ry="5" fill="#607d8b" opacity=".12"/>
        <circle cx="${gx}" cy="${gy}" r="24" fill="#e9eef1" stroke="#90a4ae" stroke-width="1.5" stroke-dasharray="5 4"/>
        ${z.teil([hand], { y: yy(64, 162) })}
        ${z.teil(mittel, { ton: 'tief', y: yy(60, 124) })}
        ${z.teil(zeige, { y: yy(58, 120), schatten: true })}
        ${z.falte(pfad(T, 'M', 158, 61, 'Q', 162, 66, 160, 72))}${z.falte(pfad(T, 'M', 193, 77, 'Q', 191, 83, 186, 86))}
        ${z.teil(daumen, { y: yy(104, 174), schatten: true })}
        ${z.falte(pfad(T, 'M', 137, 150, 'Q', 141, 156, 139, 163))}
        ${z.band(pfad(T, 'M', 182, 97, 'Q', 160, 85, 138, 93, 'Q', 119, 108, 121, 132, 'Q', 138, 148, 160, 141), 4)}
        ${saum(z, T, -12, 46, 78, 144)}
        ${klein(gx, gy + 3.5, 'Gegner')}
        ${legende([['Bogen zwischen Daumen und Zeigefinger'], ['umfasst z. B. das Handgelenk des Gegners']])}`;
    });
  }

  /* ---------- Faust von oben (Handrücken) und von vorne (Blick auf die Knöchel) ---------- */
  // rechte Faust, Finger nach rechts, Daumenseite oben
  function faustOben(z, T) {
    const yy = (a, b) => spanne(T, 30, a, 160, b);
    const YS = [[50.5, 10.3], [71, 10.3], [91.5, 9.8], [110.5, 9]];
    let out = z.teil(kette(T, [[92, 47], [126, 36], [153, 40]], [12, 9.5, 8]), { ton: 'tief', y: yy(24, 58) });
    out += z.teil(YS.map(([y, r]) => cap(T, [134, y], [148, y], r, r - 0.6)), { ton: 'tief', y: yy(38, 124) });
    out += z.teil([pfad(T, 'M', 28, 60, 'C', 52, 57, 72, 44, 94, 40, 'L', 128, 39, 'C', 138, 39, 141, 45, 141, 52, 'L', 141, 112, 'C', 141, 120, 135, 123, 127, 123, 'L', 94, 121, 'C', 72, 119, 52, 109, 28, 104, 'Z')], { y: yy(36, 128), schatten: true });
    YS.forEach(([y], i) => {
      out += z.falte(pfad(T, 'M', 125, y - 7, 'Q', 134, y, 125, y + 7), 1.1, 0.5) + z.falte(pfad(T, 'M', 112, y, 'L', 86, 62 + i * 13), 1, 0.13);
    });
    [61, 81.5, 101].forEach((y) => { out += z.falte(pfad(T, 'M', 142, y, 'L', 156, y), 1.2, 0.7, 'tief'); });
    return out;
  }
  // rechte Faust von vorne: Zeigefinger im Bild rechts, der Daumen liegt unter Zeige- und Mittelfinger
  function faustVorn(z, T) {
    const yy = (a, b) => spanne(T, -45, a, 50, b);
    let out = [[28.5, -15, 15, 9.7], [9.4, -16, 15, 9.7], [-9.6, -15, 15, 9.5], [-27.8, -12, 13, 8.7]]
      .map(([x, y0, y1, r]) => z.teil([cap(T, [x, y0], [x, y1], r, r)], { y: yy(-27, 26) })).join('');
    out += z.teil(kette(T, [[41, 3], [35, 20], [8, 22]], [10, 10, 8.5]), { y: yy(-8, 32), schatten: true });
    out += `<path d="${pfad(T, 'M', 16, 16, 'Q', 6, 15, 3, 21, 'Q', 6, 28, 16, 28, 'Q', 19, 22, 16, 16, 'Z')}" fill="${NAGEL}" stroke="${TON.haut[4]}" stroke-width=".8"/>`;
    return out;
  }
  function faust(hl) {
    const text = { seiken: 'Knöchel von Zeige- und Mittelfinger', uraken: 'Faustrücken (Knöchel)', tettsui: 'Kleinfingerseite der Faust' }[hl];
    return bild('Faust', (z) => {
      const T = lage({ x: 22, y: 4, s: 0.98 });
      const V = lage({ x: 120, y: 172, s: 1.22 });
      const oben = {
        seiken: () => z.band(pfad(T, 'M', 157, 46, 'L', 157, 76), 5),
        uraken: () => z.band(pfad(T, 'M', 131, 47, 'L', 131, 75), 11),
        tettsui: () => z.band(pfad(T, 'M', 88, 122, 'L', 128, 124, 'Q', 146, 124, 153, 118), 5),
      }[hl]();
      const vorn = {
        seiken: () => z.band(pfad(V, 'M', 9.4, -13, 'L', 28.5, -12), 13),
        uraken: () => z.band(pfad(V, 'M', 2, -26.5, 'L', 36, -25.5), 4),
        tettsui: () => z.band(pfad(V, 'M', -38, -10, 'L', -38, 12), 5),
      }[hl]();
      return `${titel('rechte Faust von oben (Handrücken)')}
        ${faustOben(z, T)}${saum(z, T, -30, 40, 44, 120)}${oben}
        <path d="M24 136 H216" stroke="#dfe5e8"/>${klein(22, 150, 'von vorne', 'start')}
        ${faustVorn(z, V)}${vorn}
        ${legende([[text]])}`;
    });
  }

  /* ---------- Offene Hand: rechte Hand, Finger oben ---------- */
  // von innen (Daumen rechts) oder ruecken = von außen (gespiegelt, Daumen links).
  // Karate-Hand: Finger geschlossen, Daumen angewinkelt – bei innen = true in die Handfläche gelegt (Haito)
  function handOffen(z, T0, o) {
    const T = o.ruecken ? Object.assign((p) => T0([240 - p[0], p[1]]), { s: T0.s }) : T0;
    const yy = (a, b) => spanne(T, 60, a, 185, b);
    // Finger: x, Mitte der Kuppe, Radius unten und oben (klein, Ring, Mittel, Zeige)
    const F = [[86, 69, 9.7, 7.9], [107, 49, 10.4, 8.5], [128.4, 41, 10.6, 8.7], [149.8, 54, 10.4, 8.5]];
    const flaeche = pfad(T, 'M', 75, 116, 'L', 161, 116, 'C', 165, 134, 166, 150, 160, 168, 'C', 156, 184, 150, 196, 148, 212, 'L', 92, 212, 'C', 90, 190, 76, 170, 73, 150, 'C', 72, 138, 73, 126, 75, 116, 'Z');
    // von außen schaut der angewinkelte Daumen nur hinter der Hand hervor
    let out = o.ruecken ? z.teil(kette(T, [[152, 178], [168, 158], [172, 136], [164, 122]], [14, 11.5, 10, 8.5]), { ton: 'tief', y: spanne(T, 60, 110, 185, 198) }) : '';
    out += z.teil([flaeche].concat(F.map(([x, y, ra, rb]) => cap(T, [x, 124], [x, y], ra, rb))), { y: yy(30, 215), schatten: o.ruecken });
    const hand = z.clipLetzte();
    const L = TON.haut[4];
    const strich = (d, w, op) => `<path d="${d}" stroke="${L}" stroke-width="${w}" fill="none" stroke-linecap="round" opacity="${op}"/>`;
    // Linien zwischen den Fingern (die Finger liegen aneinander)
    [[96.5, 72], [117.7, 52], [139.1, 56]].forEach(([x, y]) => { out += strich(pfad(T, 'M', x, 122, 'L', x, y), 1.5, 0.95); });
    F.forEach(([x, y, ra]) => {
      const [a, b] = [124 - (124 - y) * 0.36, 124 - (124 - y) * 0.7];
      if (o.ruecken) {
        out += [a, b].map((yy0) => strich(pfad(T, 'M', x - 5, yy0 - 1.5, 'Q', x, yy0 + 1, x + 5, yy0 - 1.5) + pfad(T, 'M', x - 4, yy0 + 2, 'Q', x, yy0 + 4, x + 4, yy0 + 2), 0.9, 0.5)).join('');
        const w = ra * 0.62;
        out += `<path d="${pfad(T, 'M', x - w, y + 7, 'L', x - w, y - 2, 'Q', x - w, y - 7, x, y - 7, 'Q', x + w, y - 7, x + w, y - 2, 'L', x + w, y + 7, 'Q', x, y + 10, x - w, y + 7, 'Z')}" fill="${NAGEL}" stroke="${L}" stroke-width=".8"/>`;
        out += strich(pfad(T, 'M', x - 6, 121, 'Q', x, 113, x + 6, 121), 1, 0.45) + strich(pfad(T, 'M', x, 130, 'L', 120 + (x - 120) * 0.5, 184), 1, 0.12);
      } else {
        out += [a, b].map((yy0) => strich(pfad(T, 'M', x - 6, yy0, 'Q', x, yy0 + 2, x + 6, yy0), 1, 0.5)).join('');
      }
    });
    if (!o.ruecken) {
      out += strich(pfad(T, 'M', 79, 121, 'Q', 118, 126, 159, 120), 1, 0.4) + strich(pfad(T, 'M', 80, 142, 'Q', 106, 128, 146, 132), 1.1, 0.45) +
        strich(pfad(T, 'M', 152, 124, 'Q', 124, 142, 122, 196), 1.1, 0.45) + strich(pfad(T, 'M', 84, 158, 'Q', 104, 146, 128, 146), 1, 0.35);
    }
    if (!o.ruecken) {
      const daumen = o.innen ? [[150, 180], [157, 159], [145, 144], [126, 141]] : [[152, 178], [165, 157], [168, 135], [159, 120]];
      out += z.teil(kette(T, daumen, [14, 11.5, 10, 8.5]), { y: spanne(T, 60, daumen[3][1] - 10, 185, 198), schatten: true });
      const [m, e] = [daumen[2], daumen[3]];
      out += strich(pfad(T, 'M', m[0] - 6, m[1] - 3, 'Q', m[0], m[1] + 1, m[0] + 6, m[1] - 3), 1, 0.45) + strich(pfad(T, 'M', e[0] - 3, e[1] - 4, 'Q', e[0] + 2, e[1], e[0] - 2, e[1] + 4), 1, 0.3);
    }
    const aermel = z.teil([pfad(T, 'M', 82, 270, 'L', 82, 211, 'Q', 82, 206, 87, 206, 'L', 153, 206, 'Q', 158, 206, 158, 211, 'L', 158, 270, 'Z')], { ton: 'gi', y: yy(206, 240), schatten: true }) +
      `<path d="${pfad(T, 'M', 89, 214, 'L', 151, 214)}" stroke="#aab4ba" stroke-width="1" fill="none"/>`;
    return { out, aermel, hand, T, F };
  }
  function hand(hl) {
    const ruecken = hl === 'haishu';
    const text = { shuto: 'Handkante', haito: 'Innenkante (Daumenseite)', nukite: 'Fingerspitzen', teisho: 'Handballen', haishu: 'Handrücken' }[hl];
    return bild('Offene Hand', (z) => {
      const h = handOffen(z, lage({ x: 260, y: -14, rot: 90, s: 1.08 }), { ruecken, innen: hl === 'haito' });
      const T = h.T;
      const marke = {
        shuto: () => z.band(pfad(T, 'M', 73.5, 122, 'C', 71.5, 140, 73, 158, 80, 176, 'L', 88, 200), 5),
        haito: () => z.band(pfad(T, 'M', 160, 92, 'L', 161.5, 118, 'Q', 165, 132, 164, 146), 5),
        nukite: () => h.F.map(([x, y, , rb]) => z.glut(...T([x, y - rb * 0.55]), 10)).join(''),
        teisho: () => `<g clip-path="url(#${h.hand})">${z.glut(...T([119, 190]), 34)}</g>`,
        haishu: () => `<g clip-path="url(#${h.hand})" opacity=".8">${z.glut(...T([119, 160]), 50)}</g>`,
      }[hl]();
      // Markierung auf der Hand, aber unter Daumen und Ärmel nur beim Handballen
      return `${titel(ruecken ? 'rechte Hand, Handrücken' : 'rechte Hand, Innenfläche')}
        ${h.out}${hl === 'teisho' ? '' : marke}${hl === 'teisho' ? marke : ''}${h.aermel}
        ${legende([[text]])}`;
    });
  }

  /* ---------- Fuß: rechter Fuß von außen (Zehen rechts), dazu Sohle oder Fußrücken ---------- */
  // gestreckt = Grad, um die das Fußgelenk gestreckt ist: ohne Beinstumpf – das Bein kommt als Form dazu (dazu, y)
  // und schließt vorne bei (80, 58) an, 42 breit
  function fussSeite(z, T, o) {
    const opt = o || {};
    const yy = (a, b) => spanne(T, 30, a, 215, b);
    // Zehen: hochgezogen drehen sie um das Grundgelenk
    const w = ((opt.zehenHoch ? -40 : 0) * Math.PI) / 180;
    const Z = ([x, y]) => [178 + (x - 178) * Math.cos(w) - (y - 119) * Math.sin(w), 119 + (x - 178) * Math.sin(w) + (y - 119) * Math.cos(w)];
    let out = z.teil([cap(T, Z([176, 116]), Z([206, 117]), 8.5, 7)], { ton: 'tief', y: yy(opt.zehenHoch ? 90 : 106, 128) });
    out += z.teil([cap(T, Z([176, 117.5]), Z([198, 119.5]), 8, 6.3)], { ton: 'tief', y: yy(opt.zehenHoch ? 94 : 108, 128) });
    const ws = ((90 - (opt.gestreckt || 0)) * Math.PI) / 180;
    const oben = opt.gestreckt ? ['M', 48, 72, 'L', 80, 58, 'C', 80 + 16 * Math.cos(ws), 58 + 16 * Math.sin(ws), 118, 91, 142, 97] : ['M', 48, 8, 'L', 84, 8, 'L', 86, 66, 'C', 94, 82, 116, 90, 142, 97];
    out += z.teil([pfad(T, ...oben, 'C', 158, 101, 170, 105, 180, 109, 'C', 187, 114, 187, 122, 180, 127, 'L', 66, 127, 'C', 44, 128, 35, 118, 35, 104, 'C', 35, 90, 44, 80, 48, 72, 'Z')].concat(opt.dazu || []), { y: opt.y || yy(20, 130), schatten: true });
    const fuss = z.clipLetzte();
    out += z.teil([cap(T, Z([173, 120]), Z([189, 121.5]), 7, 5.6)], { y: yy(opt.zehenHoch ? 100 : 112, 128), schatten: true });
    out += z.falte(pfad(T, 'M', 60, 80, 'Q', 68, 68, 78, 78), 1.1, 0.5) + z.falte(pfad(T, 'M', 46, 96, 'Q', 42, 106, 46, 116), 1, 0.35) + z.falte(pfad(T, 'M', 166, 110, 'Q', 171, 118, 168, 126), 1, 0.4);
    const hose = z.teil([pfad(T, 'M', 38, -20, 'L', 94, -20, 'L', 94, 31, 'Q', 94, 36, 89, 36, 'L', 43, 36, 'Q', 38, 36, 38, 31, 'Z')], { ton: 'gi', y: yy(-10, 38), schatten: true }) +
      `<path d="${pfad(T, 'M', 45, 28, 'L', 87, 28)}" stroke="#aab4ba" stroke-width="1" fill="none"/>`;
    return { out, hose, fuss };
  }
  // Ellipsen (Zehen der Fußsohle) und Pfade mit absoluten Punkten in eine Lage bringen
  const ellipse = (T, cx, cy, rx, ry) => {
    const k = 0.5523;
    return pfad(T, 'M', cx - rx, cy, 'C', cx - rx, cy - ry * k, cx - rx * k, cy - ry, cx, cy - ry, 'C', cx + rx * k, cy - ry, cx + rx, cy - ry * k, cx + rx, cy,
      'C', cx + rx, cy + ry * k, cx + rx * k, cy + ry, cx, cy + ry, 'C', cx - rx * k, cy + ry, cx - rx, cy + ry * k, cx - rx, cy, 'Z');
  };
  const umsetzen = (T, d) => d.replace(/(-?[\d.]+),(-?[\d.]+)/g, (m, x, y) => { const [a, b] = T([Number(x), Number(y)]); return `${r1(a)} ${r1(b)}`; });
  const ZEHEN = (TOES.match(/<ellipse[^>]+>/g) || []).map((e) => ['cx', 'cy', 'rx', 'ry'].map((k) => Number(new RegExp(`${k}="([^"]+)"`).exec(e)[1])));
  // Fußabdruck des rechten Fußes von unten (große Zehe unten) bzw. von oben gesehen (oben = true, große Zehe oben)
  function fussSohle(z, T) {
    const out = z.teil([umsetzen(T, SOLE)].concat(ZEHEN.map((e) => ellipse(T, ...e))), { y: spanne(T, -32, -14, 28, 14) });
    return { out, sohle: z.clipLetzte() };
  }
  function fuss(hl) {
    const text = { koshi: 'Fußballen', kakato: 'Ferse', haisoku: 'Fußrücken (Spann)', sokuto: 'Fußkante (außen)' }[hl];
    const oben = hl === 'haisoku';
    return bild('Fuß', (z) => {
      const T = lage({ x: 14, y: 26, s: 0.86 });
      const U = lage({ x: 150, y: 180, rot: 90, s: 2.1, flipX: oben });
      const f = fussSeite(z, T, { zehenHoch: hl === 'koshi' });
      const s = fussSohle(z, U);
      const seite = {
        koshi: () => z.band(pfad(T, 'M', 152, 128, 'L', 176, 128, 'Q', 186, 124, 186, 116), 5),
        kakato: () => z.glut(...T([43, 117]), 17),
        haisoku: () => z.band(pfad(T, 'M', 96, 82, 'C', 108, 90, 124, 94, 142, 99, 'L', 172, 107), 6, f.fuss),
        sokuto: () => z.band(pfad(T, 'M', 54, 128, 'L', 174, 128), 5),
      }[hl]();
      const unten = {
        koshi: () => z.fleck(umsetzen(U, 'M-11,-5 C-12,-8 -12,-10 -12,-12 C-12,-19.5 -6,-23 1,-23 C8,-23 13,-19.5 13,-12.5 C13,-9.5 12,-7 10.5,-5Z'), s.sohle),
        kakato: () => z.glut(...U([0, 17]), 19),
        haisoku: () => z.fleck(ellipse(U, 0, -2, 7, 11), s.sohle),
        sokuto: () => z.band(umsetzen(U, 'M-2,24.5 C-7,24.5 -9,20 -9,12 C-9,4 -11.5,-5 -11.5,-13'), 4),
      }[hl]();
      return `${titel('rechter Fuß von außen', 104)}
        ${f.out}${seite}${f.hose}
        <path d="M24 147 H216" stroke="#dfe5e8"/>${klein(22, 178, oben ? 'von oben' : 'von unten', 'start')}${oben ? '' : klein(22, 190, '(Sohle)', 'start')}
        ${s.out}${unten}
        ${legende(hl === 'koshi' ? [[text], ['Zehen hochgezogen']] : [[text]])}`;
    });
  }

  /* ---------- Arm und Bein: gebeugt, Ärmel und Hosenbein über das Gelenk hochgeschoben ---------- */
  const zwischen = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  // Lage, die den Punkt lokal auf ziel legt und die lokale x-Achse in Richtung nach dreht
  function lageAn(lokal, ziel, nach, s, flipY) {
    const rot = (Math.atan2(nach[1] - ziel[1], nach[0] - ziel[0]) * 180) / Math.PI;
    const T = lage({ rot, s, flipY });
    const [dx, dy] = T(lokal);
    return lage({ x: ziel[0] - dx, y: ziel[1] - dy, rot, s, flipY });
  }
  // glatter Kurvenzug durch die Punkte, als Teile für pfad() (setzt am ersten Punkt an)
  function zug(pts) {
    const n = pts.length;
    const ri = (i) => {
      const [a, b] = [pts[Math.max(0, i - 1)], pts[Math.min(n - 1, i + 1)]];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
    };
    const out = [];
    for (let i = 0; i < n - 1; i++) {
      const [p, q, u, v] = [pts[i], pts[i + 1], ri(i), ri(i + 1)];
      const k = Math.hypot(q[0] - p[0], q[1] - p[1]) / 3;
      out.push('C', p[0] + u[0] * k, p[1] + u[1] * k, q[0] - v[0] * k, q[1] - v[1] * k, q[0], q[1]);
    }
    return out;
  }
  const linie = (T, pts) => pfad(T, 'M', ...pts[0], ...zug(pts));
  // Glied als Fläche: Außenkante vom Gelenk weg, Innenkante zurück zum Gelenk
  const glied = (T, aussen, innen) => pfad(T, 'M', ...aussen[0], ...zug(aussen), 'L', ...innen[0], ...zug(innen), 'Z');
  // Zwei Glieder an einem gebeugten Gelenk. S = Scheitel (dort träfen sich die Außenkanten), w1/w2 = Richtung
  // der Glieder vom Gelenk weg (Grad), r = Rundung der Gelenkspitze. In beiden Lagen läuft x an der Außenkante
  // entlang, y zeigt in die Beuge.
  function beuge(S, w1, w2, r, s) {
    const d = ((w2 - w1) * Math.PI) / 180;
    const cw = Math.sin(d) > 0;
    const T1 = lage({ x: S[0], y: S[1], rot: w1, s, flipY: !cw });
    const T2 = lage({ x: S[0], y: S[1], rot: w2, s, flipY: cw });
    const c = r / Math.tan(Math.acos(Math.cos(d)) / 2);
    return { T1, T2, cw, c, r, mitte: T1([c, r]), kreis: ellipse(T1, c, r, r, r) };
  }
  // Stoff, der über dem Gelenk endet (Ärmel, Hosenbein): von x0 bis über den Bildrand, Saum mit zwei Wülsten
  function stoff(z, T, x0, y0, y1, weit) {
    const d = pfad(T, 'M', 260, y0 - weit, 'L', x0 + 7, y0, 'Q', x0, y0, x0 - 0.5, y0 + 7, 'Q', x0 - 3.5, (y0 + y1) / 2, x0 - 0.5, y1 - 7, 'Q', x0, y1, x0 + 7, y1, 'L', 260, y1 + weit, 'Z');
    const ys = [[x0, y0], [x0, y1], [200, y0 - weit], [200, y1 + weit]].map((p) => T(p)[1]);
    const quer = (x, a, b, w, op) => z.falte(pfad(T, 'M', x, y0 + a, 'Q', x - 4, (y0 + y1) / 2, x, y1 - b), w, op, 'gi');
    return z.teil([d], { ton: 'gi', y: [r1(Math.min(...ys)), r1(Math.max(...ys))], schatten: true }) +
      quer(x0 + 9, 5, 5, 1.1, 0.75) + quer(x0 + 19, 9, 14, 1, 0.45) +
      z.falte(pfad(T, 'M', x0 + 30, y0 + 16, 'Q', x0 + 52, y0 + 24, x0 + 80, y0 + 20), 1, 0.4, 'gi') +
      z.falte(pfad(T, 'M', x0 + 34, y1 - 12, 'Q', x0 + 60, y1 - 20, x0 + 92, y1 - 12), 1, 0.35, 'gi');
  }

  // Rechter Arm, gebeugt. S = Ellbogenspitze, w1 = Richtung zur Schulter, w2 = zur Hand.
  // o: y = Verlauf (oben, unten), fingerInnen = die Finger zeigen in die Beuge, falte = Beugefalte (Lage des Unterarms)
  function arm(z, S, w1, w2, o) {
    const g = beuge(S, w1, w2, 9, o.s || 1);
    const L = 104;
    const ober = glied(g.T1, [[g.c, 0], [45, -2], [90, -4.5], [140, -3], [260, 0]], [[260, 46], [150, 44], [122, 46], [98, 50], [78, 51], [60, 46], [44, 38], [30, 30]]);
    const unter = glied(g.T2, [[g.c, 0], [36, -2.5], [70, -1], [L, 1]], [[L, 20], [86, 24], [64, 30.5], [42, 35], [26, 33], [15, 26]]);
    const F = lageAn([46, 99], g.T2([L, 10.5]), g.T2([L + 40, 10.5]), 0.43 * (o.s || 1), o.fingerInnen ? g.cw : !g.cw);
    const f = faustSeite(z, F, false, { ds: [ober, unter, g.kreis], y: o.y });
    const haut = f.flaeche;
    let out = f.out;
    // Schatten und Falte in der Beuge, Muskellinien, Falte an der Ellbogenspitze
    out += z.schein(linie(g.T2, o.falte), 10, '#7a4a35', 0.03, haut) + z.falte(linie(g.T2, o.falte), 1.3, 0.7);
    out += z.falte(linie(g.T2, [[28, 8], [50, 10.5], [80, 10]]), 1, 0.22);
    out += z.falte(linie(g.T1, [[50, 15], [80, 19], [118, 19]]), 1, 0.2) + z.schein(linie(g.T1, [[58, 36], [80, 40], [110, 38]]), 18, '#fff', 0.035, haut) + z.schein(linie(g.T2, [[30, 22], [60, 20], [92, 13]]), 15, '#fff', 0.035, haut);
    out += z.falte(pfad(g.T1, 'M', g.c + 9, 5, 'Q', g.c + 4, g.r + 4, g.c + 6, g.r + 12), 1, 0.4);
    return { out, haut, g, aermel: stoff(z, g.T1, o.aermel || 98, -8, 55, 5) };
  }
  function hiji() {
    return bild('Arm', (z) => {
      const S = [204, 180];
      const a = arm(z, S, 180, 240, { y: [26, 214], fingerInnen: true, s: 1.14, falte: [[73, 28], [62, 31.5], [50, 34], [42, 35]] });
      const [gx, gy] = zwischen(a.g.mitte, S, 0.4);
      return `${titel('rechter Arm von der Seite', 12)}
        ${a.out}${z.glut(r1(gx), r1(gy), 21)}${a.aermel}
        ${legende([['Ellbogen']])}`;
    });
  }
  function zenwan() {
    return bild('Arm', (z) => {
      const a = arm(z, [44, 194], -104, -23, { y: [70, 200], falte: [[40, 35], [32, 34.5], [24, 32]], s: 1.22, aermel: 84 });
      return `${titel('rechter Arm von der Seite', 100)}
        ${a.out}${z.schein(linie(a.g.T2, [[32, 16], [62, 15], [94, 11]]), 42, '#e53935', 0.14, a.haut)}${a.aermel}
        ${legende([['Unterarm']])}`;
    });
  }

  // Rechtes Bein von außen, Knie gehoben: S = Kniespitze, w1 = Richtung zur Hüfte, w2 = zum Fuß
  function hiza() {
    return bild('Bein', (z) => {
      const [S, W1, W2, s] = [[164, 46], 168, 95, 1.1];
      const g = beuge(S, W1, W2, 15, s);
      const L = 106;
      const ober = glied(g.T1, [[g.c, 0], [40, -1.5], [80, -5], [130, -7], [260, -4]], [[260, 60], [150, 53], [100, 46], [68, 40], [46, 36], [28, 33]]);
      const unter = glied(g.T2, [[g.c, 0], [50, 0], [84, 1.5], [L, 3]], [[L + 2, 24.5], [L - 5, 19.5], [92, 21], [80, 28], [64, 35.5], [46, 38], [30, 35], [16, 28]]);
      // Fuß gestreckt, die Zehen zeigen nach unten
      const [vorn, streck] = [g.T2([L, 3]), 35];
      const w = ((W2 - 90 + streck) * Math.PI) / 180;
      const F = lageAn([80, 58], vorn, [vorn[0] + Math.cos(w), vorn[1] + Math.sin(w)], 0.37 * s, false);
      const f = fussSeite(z, F, { gestreckt: streck, dazu: [ober, unter, g.kreis], y: [36, 262] });
      const [gx, gy] = zwischen(g.mitte, S, 0.35);
      const falte = [[76, 30.5], [64, 35.5], [52, 37.5], [42, 37.5]];
      return `${titel('rechtes Bein von der Seite', 12)}
        ${f.out}
        ${z.schein(linie(g.T2, falte), 10, '#7a4a35', 0.03, f.fuss)}${z.falte(linie(g.T2, falte), 1.3, 0.7)}
        ${z.falte(pfad(g.T1, 'M', g.c + 14, 6, 'Q', g.c + 7, g.r + 5, g.c + 9, g.r + 17), 1, 0.4)}
        ${z.falte(linie(g.T2, [[34, 14], [56, 19], [80, 17]]), 1, 0.2)}${z.schein(linie(g.T1, [[34, 10], [70, 8], [100, 7]]), 20, '#fff', 0.035, f.fuss)}${z.schein(linie(g.T2, [[34, 24], [56, 26], [84, 17]]), 15, '#fff', 0.035, f.fuss)}
        ${z.glut(r1(gx), r1(gy), 23)}${stoff(z, g.T1, 86, -11, 58, 6)}
        ${legende([['Knie']])}`;
    });
  }

  SK.gfx.WEAPONS = {
    'jishi-ippon-ken': ipponKen, koko,
    seiken: () => faust('seiken'), uraken: () => faust('uraken'), tettsui: () => faust('tettsui'),
    shuto: () => hand('shuto'), haito: () => hand('haito'), nukite: () => hand('nukite'), teisho: () => hand('teisho'), haishu: () => hand('haishu'),
    koshi: () => fuss('koshi'), kakato: () => fuss('kakato'), haisoku: () => fuss('haisoku'), sokuto: () => fuss('sokuto'),
    hiji, hiza, zenwan,
  };
})();
