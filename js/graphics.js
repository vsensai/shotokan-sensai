/* SVG-Grafiken: Stände (Draufsicht) und der gemeinsame Bausatz; Körperwaffen stehen in js/graphics-waffen.js. */
(function () {
  'use strict';
  const esc = (s) => SK.util.esc(s);
  const RED = '#b71c1c';
  const MID = '#e53935';
  const LIGHT = '#ef9a9a';
  const HL = '#d32f2f';
  const INK = '#37474f';
  const GHOST = '#90a4ae';
  const ARR = '#8e1b1b';
  const FONT = 'font-family="system-ui, Segoe UI, Roboto, sans-serif"';
  const CAP = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';

  // anim: Animation statt Standbild (nur noch für die Fußbewegungen, js/graphics-ashi.js)
  const mode = { anim: false };
  const r1 = (v) => Math.round(v * 10) / 10;
  function withMode(m, fn) {
    const prev = mode.anim;
    mode.anim = m.anim;
    try {
      return fn();
    } finally {
      mode.anim = prev;
    }
  }

  /* ---------- Fußabdruck: linker Fuß, Zehen oben (rechter Fuß = gespiegelt) ---------- */
  const SOLE = 'M0,26 C-7,26 -9.5,20 -9.5,12 C-9.5,4 -12,-5 -12,-12 C-12,-19.5 -6,-23 1,-23 C8,-23 13,-19.5 13,-12.5 C13,-6 7.5,-1 6.5,7 C5.5,15 7,26 0,26Z';
  const BALL = 'M-11.6,-5 C-12,-8 -12,-10 -12,-12 C-12,-19.5 -6,-23 1,-23 C8,-23 13,-19.5 13,-12.5 C13,-9.5 12,-7 10.5,-5Z';
  const TOES = '<ellipse cx="8.2" cy="-28.5" rx="4.4" ry="5.4"/><ellipse cx="1.8" cy="-30" rx="2.8" ry="3.4"/><ellipse cx="-3.2" cy="-29" rx="2.6" ry="3.2"/><ellipse cx="-7.6" cy="-27" rx="2.4" ry="2.9"/><ellipse cx="-11" cy="-23.8" rx="2.1" ry="2.5"/>';
  const FS = 0.8;

  function foot(x, y, r, w, o) {
    const opt = o || {};
    const sc = opt.scale || FS;
    const t = `translate(${x} ${y}) rotate(${r}) scale(${opt.side === 'R' ? -sc : sc} ${sc})`;
    // was = Fuß vorher (blasser Abdruck); w = 0 = angehoben (gestrichelt, Farbe lift oder grau)
    if (opt.was) return `<g transform="${t}" fill="${GHOST}" opacity="0.4"><path d="${SOLE}"/>${TOES}</g>`;
    if (!w) return `<g transform="${t}" fill="none" stroke="${opt.lift || GHOST}" stroke-width="1.8" stroke-dasharray="3 2.5"><path d="${SOLE}"/>${TOES}</g>`;
    const fill = w >= 0.6 ? RED : w >= 0.4 ? MID : LIGHT;
    if (opt.ball) return `<g transform="${t}"><path d="${SOLE}" fill="none" stroke="${fill}" stroke-width="1.8" stroke-dasharray="3 2.5"/><g fill="${fill}"><path d="${BALL}"/>${TOES}</g></g>`;
    return `<g transform="${t}" fill="${fill}"><path d="${SOLE}"/>${TOES}</g>`;
  }

  // Grundform: linker Fuß ist der namensgebende/vordere; Migi wird gespiegelt (Ausnahme Kosa-dachi: rechts Standbein). Fuß = [x, y, Drehung, Gewicht, Seite, nur Ballen]
  const STANCES = {
    musubi: { name: 'Musubi-dachi', feet: [[92, 116, -25, 0.5, 'L'], [108, 116, 25, 0.5, 'R']], note: 'Fersen zusammen, Fußspitzen V-förmig geöffnet', mass: ['Fersen zusammen,', 'Spitzen etwa eine Faust weit offen'] },
    heisoku: { name: 'Heisoku-dachi', feet: [[89.5, 116, 0, 0.5, 'L'], [110.5, 116, 0, 0.5, 'R']], note: 'Füße geschlossen und parallel', mass: ['Füße ganz geschlossen,', 'Innenkanten berühren sich'] },
    hachiji: { name: 'Hachiji-dachi', feet: [[68, 116, -15, 0.5, 'L'], [132, 116, 15, 0.5, 'R']], note: 'Füße etwa schulterbreit, Spitzen leicht nach außen (Shizentai)', mass: ['Fersen etwa schulterbreit,', 'Spitzen leicht nach außen'] },
    zenkutsu: { name: 'Zenkutsu-dachi', feet: [[72, 62, 0, 0.7, 'L'], [128, 160, 25, 0.3, 'R']], note: 'Vorderes Knie gebeugt, hinteres Bein gestreckt – Gewicht überwiegend vorne', mass: ['Länge etwa 1½–2 Schulterbreiten,', 'Breite etwa hüftbreit'] },
    ashizenkutsu: { name: 'Ashi-zenkutsu', feet: [[80, 80, 0, 0.7, 'L'], [120, 146, 20, 0.3, 'R']], note: 'Kürzer und schmaler als Zenkutsu-dachi (z. B. in Gyaku-hanmi)', mass: ['kürzer und schmaler', 'als Zenkutsu-dachi'] },
    kokutsu: { name: 'Kokutsu-dachi', feet: [[100, 64, 0, 0.3, 'L'], [118, 158, 90, 0.7, 'R']], note: 'Gewicht überwiegend hinten, hinterer Fuß quer, vorderer Fuß berührt leicht den Boden', mass: ['Länge etwa 1½ Schulterbreiten,', 'Fersen etwa auf einer Linie'] },
    kiba: { name: 'Kiba-dachi', feet: [[46, 116, 8, 0.5, 'L'], [154, 116, -8, 0.5, 'R']], note: 'Reiterstand: breit, Zehen leicht nach innen, Knie über den Zehen, Gewicht gleich verteilt', mass: ['Breite etwa 2 Schulterbreiten,', 'Zehen leicht nach innen'] },
    kosa: { name: 'Kosa-dachi', feet: [[94, 84, 0, 0.9, 'R'], [112, 136, -10, 0.1, 'L', true]], note: 'Kreuzstand: rechts Standbein, der linke Fuß kreuzt hinter die Ferse des rechten und steht nur auf dem Ballen', mass: ['Füße dicht gekreuzt,', 'hinterer Fuß nur auf dem Ballen'] },
    ashidachi: { name: 'Ashi-dachi (Einbeinstand)', feet: [[92, 112, 0, 1, 'L'], [114, 96, 10, 0, 'R']], note: 'Stand auf einem Bein, das andere Bein ist angehoben (gestrichelt)', mass: ['ganzes Gewicht auf einem Bein'] },
    hizakutsu: { name: 'Hizakutsu', feet: [[72, 70, -35, 0.7, 'L'], [128, 152, -15, 0.3, 'R']], note: 'Knie gebeugt, beide Fußspitzen schräg zur Seite – Technik in andere Richtung als der Zenkutsu-dachi', mass: ['Knie gebeugt, Fußspitzen', 'schräg zur Seite'] },
    renoji: { name: 'Renoji-dachi', feet: [[100, 82, 0, 0.4, 'L'], [118, 148, 90, 0.6, 'R']], note: 'L-förmiger Stand', mass: ['etwa eine Fußlänge,', 'Füße bilden ein L'] },
    teiji: { name: 'Teiji-dachi', feet: [[100, 72, 0, 0.5, 'L'], [100, 150, 90, 0.5, 'R']], note: 'T-förmiger Stand', mass: ['etwa eine Fußlänge,', 'Füße bilden ein T'] },
    fudo: { name: 'Fudo-dachi', feet: [[76, 62, 0, 0.5, 'L'], [126, 158, 45, 0.5, 'R']], note: '„Unbeweglicher“ Stand: beide Knie gebeugt, Gewicht ausgeglichen', mass: ['Länge etwa wie Zenkutsu-dachi,', 'beide Knie gebeugt'] },
    neko: { name: 'Neko-ashi-dachi', feet: [[100, 80, 0, 0.1, 'L', true], [110, 148, 30, 0.9, 'R']], note: 'Katzenfußstand: vorderer Fuß nur auf dem Ballen, fast das gesamte Gewicht hinten', mass: ['etwa eine Fußlänge,', 'vorne nur der Ballen'] },
    sanchin: { name: 'Sanchin-dachi', feet: [[86, 86, 25, 0.5, 'L'], [120, 140, -15, 0.5, 'R']], note: 'Sanduhrstand: Fußspitzen und Knie nach innen', mass: ['vordere Ferse etwa auf Höhe der', 'hinteren Zehen, hüftbreit'] },
    hangetsu: { name: 'Hangetsu-dachi', feet: [[72, 72, 25, 0.5, 'L'], [130, 156, -25, 0.5, 'R']], note: 'Halbmondstand: länger und breiter als Sanchin-dachi', mass: ['etwa eine Fußlänge kürzer als', 'Zenkutsu-dachi, schulterbreit'] },
    orishiki: { name: 'Orishiki (Knien)', feet: [[82, 78, 0, 0.5, 'L']], knee: [118, 128], note: 'Knien auf einem Bein, das andere Knie ist aufgestellt' },
  };

  function stanceSvg(key, mirrored, opts) {
    const s = STANCES[key];
    if (!s) return '';
    const o = opts || {};
    let body = s.feet.map(([x, y, r, w, side, ball]) => foot(x, y, r, w, { side, ball })).join('');
    if (s.knee) {
      const [kx, ky] = s.knee;
      body += `<rect x="${kx - 10}" y="${ky}" width="20" height="50" rx="10" fill="${LIGHT}"/><circle cx="${kx}" cy="${ky}" r="12" fill="${RED}"/>`;
    }
    if (mirrored) body = `<g transform="translate(200 0) scale(-1 1)">${body}</g>`;
    const title = o.title || s.name;
    if (o.mini) {
      return `<svg class="mini-stance" viewBox="28 30 144 156" role="img" aria-label="${esc(title)}">${body}</svg>`;
    }
    const mx = (x) => (mirrored ? 200 - x : x);
    const txt = (x, y, t, a, extra) => `<text x="${x}" y="${y}" font-size="9.5" text-anchor="${a || 'middle'}" fill="#546e7a" ${FONT}${extra || ''}>${t}</text>`;
    let dims = '';
    if (s.feet.length === 2) {
      const [a, b] = s.feet;
      const [y1, y2] = [a[1], b[1]].sort((p, q) => p - q);
      const [x1, x2] = [mx(a[0]), mx(b[0])].sort((p, q) => p - q);
      if (y2 - y1 >= 12) dims += `<path d="M184 ${y1} V${y2} M179 ${y1} H189 M179 ${y2} H189" stroke="#546e7a" stroke-width="1.2"/>${txt(194, (y1 + y2) / 2, 'Länge', 'middle', ` transform="rotate(-90 194 ${(y1 + y2) / 2})"`)}`;
      if (x2 - x1 >= 30) dims += `<path d="M${x1} 200 H${x2} M${x1} 195 V205 M${x2} 195 V205" stroke="#546e7a" stroke-width="1.2"/>${txt((x1 + x2) / 2, 214, 'Breite')}`;
    }
    // Gewicht als Prozentzahl neben dem Fuß (bei quer gedrehtem Fuß weiter außen)
    const pct = s.knee
      ? ''
      : s.feet
        .map(([x, y, r, w]) => {
          const X = mx(x);
          const off = 13 + Math.abs(Math.sin((r * Math.PI) / 180)) * 20;
          const right = X >= 100;
          const col = !w ? GHOST : w >= 0.6 ? RED : w >= 0.4 ? MID : '#e57373';
          return `<text x="${r1(right ? X + off : X - off)}" y="${y + 4}" font-size="${w ? 12 : 9.5}" font-weight="700" text-anchor="${right ? 'start' : 'end'}" fill="${col}" ${FONT}>${w ? `${Math.round(w * 100)} %` : 'angehoben'}</text>`;
        })
        .join('');
    const ball = s.feet.some((f) => f[5]);
    const legend = ball ? `${txt(8, 14, 'gestrichelt =', 'start')}${txt(8, 25, 'nur Ballen', 'start')}` : '';
    return `<svg viewBox="0 0 200 224" role="img" aria-label="${esc(title)}" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="198" height="222" rx="12" fill="#fafafa" stroke="#ddd"/>
      <path d="M100 40 V196" stroke="#cfd8dc" stroke-dasharray="4 4"/>
      <path d="M100 8 l-7 11 h14 z" fill="#78909c"/><text x="100" y="31" font-size="10" text-anchor="middle" fill="#78909c" ${FONT}>vorne</text>
      ${legend}${body}${dims}${pct}</svg>`;
  }

  /* Ordnet einen Standnamen (wie im Kata-Buch) einer Grafik zu. */
  function stanceKey(name) {
    const side = /^Migi\b/.test(name) ? 'R' : /^Hidari\b/.test(name) ? 'L' : null;
    const rules = [
      [/Musubi/, 'musubi', null],
      [/Heisoku/, 'heisoku', null],
      [/Hachiji/, 'hachiji', null],
      [/Kiba-dachi/, 'kiba', null],
      [/Orishiki/, 'orishiki', 'name'],
      [/Ashi-zenkutsu/, 'ashizenkutsu', 'front'],
      [/Zenkutsu-dachi/, 'zenkutsu', 'front'],
      [/Kokutsu-dachi/, 'kokutsu', 'back'],
      // Grundform Kosa-dachi: rechts Standbein (Migi Ashi-mae) – gespiegelt nur bei Hidari
      [/Kosa/, 'kosa', 'back'],
      [/Renoji/, 'renoji', 'front'],
      [/Fudo-dachi/, 'fudo', 'front'],
      [/Hizakutsu/, 'hizakutsu', 'front'],
      [/Ashi-dachi/, 'ashidachi', 'front'],
      [/Neko-ashi/, 'neko', 'front'],
      [/Sanchin/, 'sanchin', 'front'],
      [/Hangetsu/, 'hangetsu', 'front'],
      [/Teiji/, 'teiji', 'front'],
    ];
    for (const [re, key, how] of rules) {
      if (!re.test(name)) continue;
      // Grundform: linker Fuß vorne. Kokutsu ist nach dem hinteren Bein benannt, Orishiki nach dem knienden (rechten) Bein; Kosa-dachi hat rechts als Standbein.
      let mirrored = false;
      if (how === 'front') mirrored = side === 'R';
      if (how === 'back') mirrored = side === 'L';
      if (how === 'name') mirrored = side === 'L';
      return { key, mirrored };
    }
    return null;
  }

  function stanceFor(name, opts) {
    const k = stanceKey(name);
    return k ? stanceSvg(k.key, k.mirrored, Object.assign({ title: name }, opts)) : '';
  }

  // key: 'st:<stand>[:m]', 'tc:<technik>', 'wp:<waffe>', 'as:<fußbewegung>'.
  // Mit 3D-Figur (alle 'mv:' und 'fig:', die meisten 'tc:') gibt es keine SVG-Grafik mehr – dann ''.
  function byKey(key) {
    const [kind, k, m] = key.split(':');
    if (kind === 'st') return stanceSvg(k, m === 'm');
    if (kind === 'tc') return SK.gfx.TECH[k] ? SK.gfx.TECH[k]() : '';
    if (kind === 'wp') return SK.gfx.WEAPONS[k]();
    if (kind === 'as') return SK.gfx.ASHI[k]();
    return '';
  }
  const animCache = new Map();
  function animSvg(key) {
    if (!animCache.has(key)) {
      const svg = /^(tc|as):/.test(key) ? withMode({ anim: true }, () => byKey(key)) : '';
      animCache.set(key, svg.includes('<animate') ? stripTags(svg) : null);
    }
    return animCache.get(key);
  }
  const hasAnim = (key) => !!key && !!animSvg(key);
  // Quizbild: ohne Beschriftungen, die die Antwort verraten könnten
  const plainSvg = (fn) => stripTags(fn());
  // Grafik mit Knöpfen. Gibt es eine 3D-Figur, wird nur sie gezeigt (ohne WebGL bleibt die Fläche leer);
  // bei Ständen ist das Fußbild die zweite Ansicht. svg darf eine Funktion sein (wird nur bei Bedarf erzeugt).
  // plain: ohne Beschriftungen und ohne Titel in der Großansicht, die den Namen verraten (Karteikarten).
  function box(key, svg, plain) {
    const make = () => {
      const s = typeof svg === 'function' ? svg() : svg || '';
      return plain ? stripTags(s) : s;
    };
    if (!key) return make();
    const [kind] = key.split(':');
    const btn = (act, t) => `<button type="button" class="gfx-btn" data-act="${act}" data-label="${t}" aria-pressed="false">${t}</button>`;
    if (SK.fig3d && SK.fig3d.known(key)) {
      const f3 = SK.fig3d.html(key, plain ? { plain: true } : null);
      if (kind !== 'st') return `<div class="gfx-box" data-gfx="${esc(key)}">${f3}</div>`;
      if (!SK.fig3d.ok()) return make();
      return `<div class="gfx-box" data-gfx="${esc(key)}"><div class="gfx-view">${f3}</div><div class="gfx-view" hidden>${make()}</div><div class="gfx-tools">${btn('side', 'Fußbild')}</div></div>`;
    }
    const pic = make();
    if (!hasAnim(key)) return pic;
    return `<div class="gfx-box" data-gfx="${esc(key)}"><div class="gfx-view">${pic}</div><div class="gfx-view gfx-anim" hidden></div><div class="gfx-tools">${btn('anim', '▶ Bewegung')}</div></div>`;
  }

  function figure(svg, caption, note, key) {
    // Name und Hinweis über der Grafik – beim Scrollen ist klar, welches Bild dazugehört
    return `<figure class="gfx"><figcaption><b>${esc(caption)}</b>${note ? `<br>${esc(note)}` : ''}</figcaption>${box(key, svg)}</figure>`;
  }

  function stanceFigure(key, mirrored, caption) {
    const s = STANCES[key];
    return figure(stanceSvg(key, mirrored), caption || s.name, s.note, `st:${key}${mirrored ? ':m' : ''}`);
  }

  const DEFS = `<defs><marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${ARR}"/></marker></defs>`;
  // Pfeile und Beschriftungen sind markiert, damit Animation/Quizbild sie nachträglich anpassen können
  function arrow(d, dashed, both) {
    return `<g data-arrow="1"><path d="${d}" stroke="#fff" stroke-width="7" ${CAP} opacity=".9"/><path d="${d}" stroke="${ARR}" stroke-width="3.2" ${CAP}${dashed ? ' stroke-dasharray="7 5"' : ''}${both ? ' marker-start="url(#ah)"' : ''} marker-end="url(#ah)"/></g>`;
  }
  // Beschriftungen (<g data-tag="1">, ohne Gruppen darin) – z. B. die Legende der Körperwaffen (js/graphics-waffen.js)
  const stripTags = (svg) => svg.replace(/<g data-tag="1">[\s\S]*?<\/g>/g, '');
  function frame(w, h, label, inner, lines) {
    // Unter dem Bild nur die Blickrichtung – die Erklärung steht im Text zur Grafik
    const view = /^(seitlich|von vorne|von oben)[^:]*(?=:)/.exec((lines && lines[0]) || '');
    const shown = view ? [view[0]] : lines || [];
    const hh = view ? 290 : h;
    const cap = shown.map((t, i, a) => `<text x="${w / 2}" y="${hh - 10 - (a.length - 1 - i) * 13}" font-size="10.5" text-anchor="middle" fill="#455a64" ${FONT}>${esc(t)}</text>`).join('');
    return `<svg viewBox="0 0 ${w} ${hh}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">${DEFS}<rect x="1" y="1" width="${w - 2}" height="${hh - 2}" rx="12" fill="#fafafa" stroke="#ddd"/>${inner}${cap}</svg>`;
  }
  function dataUri(svg) {
    const s = svg.includes('xmlns=') ? svg : svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`;
  }

  SK.gfx = { STANCES, foot, stanceSvg, stanceFor, stanceKey, stanceFigure, figure, box, byKey, animSvg, hasAnim, plainSvg, dataUri };
  // Bausatz für die Schemabilder (js/graphics-tech.js), Fußbewegungen (js/graphics-ashi.js) und
  // Körperwaffen (js/graphics-waffen.js, setzt SK.gfx.WEAPONS)
  SK.gfx.kit = { frame, arrow, foot, mode, FONT, HL, INK, ARR, SOLE, TOES, BALL };
})();
