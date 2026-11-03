/* SVG-Grafiken: Stände (Draufsicht), Körperwaffen, Stufen, Bewegungsrichtungen, Trefferzonen. */
(function () {
  'use strict';
  const esc = (s) => SK.util.esc(s);
  const RED = '#b71c1c';
  const MID = '#e53935';
  const LIGHT = '#ef9a9a';
  const HL = '#d32f2f';
  const INK = '#37474f';
  const SKIN_D = '#cdb6a4';
  const GHOST = '#90a4ae';
  const ARR = '#8e1b1b';
  // Figuren im Skizzen-Stil: weiße, schattierte Formen mit Bleistift-Kontur
  const PEN = '#2b2b2b';
  const F_GI = '#fcfcfb';
  const F_SKIN = '#f6eee7';
  const F_FAR = '#e7e7e6';
  const F_FAR_SKIN = '#e2dbd4';
  const F_ACT = '#d3e6f7';
  const FONT = 'font-family="system-ui, Segoe UI, Roboto, sans-serif"';
  const CAP = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';

  // anim: Animation statt Standbild (nur noch für die Fußbewegungen, js/graphics-ashi.js)
  const mode = { anim: false };
  const r1 = (v) => Math.round(v * 10) / 10;
  const lerp = (a, b, t) => [r1(a[0] + (b[0] - a[0]) * t), r1(a[1] + (b[1] - a[1]) * t)];
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
    kiba: { name: 'Kiba-dachi', feet: [[46, 116, 0, 0.5, 'L'], [154, 116, 0, 0.5, 'R']], note: 'Reiterstand: breit, Füße parallel, Gewicht gleich verteilt', mass: ['Breite etwa 2 Schulterbreiten,', 'Füße parallel'] },
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
    if (kind === 'wp') return WEAPONS[k]();
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
  function box(key, svg) {
    const make = () => (typeof svg === 'function' ? svg() : svg || '');
    if (!key) return make();
    const [kind] = key.split(':');
    const btn = (act, t) => `<button type="button" class="gfx-btn" data-act="${act}" data-label="${t}" aria-pressed="false">${t}</button>`;
    if (SK.fig3d && SK.fig3d.known(key)) {
      const f3 = SK.fig3d.html(key);
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

  /* ---------- Figuren: Karateka im Gi (Gliedmaßen = Punktlisten) ---------- */
  const path = (pts) => 'M' + pts.map((p) => p.join(' ')).join(' L');
  // Skizzen-Look ohne SVG-Filter (Filter machen das Scrollen langsam):
  // Schlagschatten und zarte Zweitlinie als versetzte Kopien der Kontur,
  // Schattenseite als dunklere Fläche unter einer schmaleren, nach links oben versetzten hellen Fläche
  const SHADE = { [F_GI]: '#dcdcda', [F_SKIN]: '#e3d3c5', [F_FAR]: '#cbcbca', [F_FAR_SKIN]: '#cfc4b9', [F_ACT]: '#a9c6e0' };
  const under = (ink) => `<g opacity=".1" transform="translate(1.4 1.8)">${ink}</g>` + `<g opacity=".3" transform="translate(.9 -.8)">${ink}</g>`;
  const lit = (draw, col) => draw(SHADE[col] || col, 0) + `<g transform="translate(-1 -1)">${draw(col, -3)}</g>`;
  function outlined(d, w, col) {
    const st = (c, ww) => `<path d="${d}" stroke="${c}" stroke-width="${ww}" ${CAP}/>`;
    return under(st(PEN, w + 2.4)) + st(PEN, w + 2.4) + lit((c, dw) => st(c, w + dw), col);
  }
  // Hilfslinien wie in Zeichenvorlagen: Gliedachsen über die Gelenke hinaus verlängert
  function guides(pts) {
    let s = '';
    for (let i = 0; i < pts.length - 1; i++) {
      const [a, b] = [pts[i], pts[i + 1]];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const ux = (b[0] - a[0]) / l;
      const uy = (b[1] - a[1]) / l;
      s += `M${r1(a[0] - ux * 6)} ${r1(a[1] - uy * 6)} L${r1(b[0] + ux * 8)} ${r1(b[1] + uy * 8)}`;
    }
    return `<path d="${s}" stroke="${PEN}" stroke-width=".6" fill="none" opacity=".3"/>`;
  }
  // Ärmel/Hosenbein endet vor Hand bzw. Knöchel; Oberarm/Oberschenkel breiter als Unterarm/Schienbein
  function geo(p, ft, leg) {
    const n = p.length;
    const end = p[n - 1];
    const cuff = lerp(p[n - 2], end, leg ? 0.86 : 0.7);
    const cloth = p.slice(0, n - 1).concat([cuff]);
    return { segs: cloth.slice(1).map((q, i) => [cloth[i], q]), skin: leg ? [cuff, end, ft] : [cuff, end], end, prev: p[n - 2] };
  }
  // Glied als geschlossene, sich verjüngende Form (ws = Breite je Punkt)
  function taper(pts, ws) {
    const n = pts.length;
    const dir = (a, b) => {
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      return l < 0.01 ? null : [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
    };
    const ds = [];
    for (let i = 0; i < n - 1; i++) ds.push(dir(pts[i], pts[i + 1]));
    for (let i = 0; i < ds.length; i++) ds[i] = ds[i] || ds[i - 1] || ds.find(Boolean) || [0, 1];
    const at = (p, v, k) => `${r1(p[0] + v[0] * k)} ${r1(p[1] + v[1] * k)}`;
    const L = [];
    const R = [];
    pts.forEach((p, i) => {
      const r = ws[i] / 2;
      const d0 = ds[Math.max(0, i - 1)];
      const d1 = ds[Math.min(ds.length - 1, i)];
      const n0 = [-d0[1], d0[0]];
      const n1 = [-d1[1], d1[0]];
      if (i === 0 || i === n - 1) {
        const nn = i === 0 ? n1 : n0;
        L.push([`L${at(p, nn, r)}`]);
        R.push([`L${at(p, nn, -r)}`]);
        return;
      }
      // Gelenk: außen abgerundet (Q über den Gehrungspunkt), innen ein Gehrungspunkt (begrenzt)
      const m = [n0[0] + n1[0], n0[1] + n1[1]];
      const ml = Math.hypot(m[0], m[1]) || 1;
      const cos = Math.max(0.55, ml / 2);
      const mv = [m[0] / ml, m[1] / ml];
      const left = d0[0] * d1[1] - d0[1] * d1[0] < 0;
      const outer = (s) => `L${at(p, s > 0 ? n0 : [-n0[0], -n0[1]], r)} Q${at(p, s > 0 ? mv : [-mv[0], -mv[1]], r / cos)} ${at(p, s > 0 ? n1 : [-n1[0], -n1[1]], r)}`;
      const inner = (s) => {
        const q = at(p, s > 0 ? mv : [-mv[0], -mv[1]], Math.min(r / cos, r * 1.4));
        return `L${q} Q${q} ${q}`;
      };
      L.push([left ? outer(1) : inner(1)]);
      R.push([left ? inner(-1) : outer(-1)]);
    });
    const cap = (p, d, rA, rB, nn, k) => `Q${at([p[0] + nn[0] * rA, p[1] + nn[1] * rA], d, k)} ${at(p, d, k)} Q${at([p[0] - nn[0] * rB, p[1] - nn[1] * rB], d, k)} ${at(p, nn, -rB)}`;
    const dl = ds[ds.length - 1];
    const df = ds[0];
    const rl = ws[n - 1] / 2;
    const rf = ws[0] / 2;
    const endCap = cap(pts[n - 1], dl, rl, rl, [-dl[1], dl[0]], rl);
    const back = R.slice().reverse().map((x, i) => (i === 0 ? '' : x[0].replace(/^L(\S+ \S+) Q(\S+ \S+) (\S+ \S+)$/, 'L$3 Q$2 $1')));
    // Rückweg: Gelenkpunkte rechts in umgekehrter Reihenfolge
    const nb = [-df[1], df[0]];
    const startCap = `Q${at([pts[0][0] - nb[0] * rf, pts[0][1] - nb[1] * rf], df, -rf)} ${at(pts[0], df, -rf)} Q${at([pts[0][0] + nb[0] * rf, pts[0][1] + nb[1] * rf], df, -rf)} ${at(pts[0], nb, rf)}`;
    return 'M' + L.map((x) => x[0]).join(' ').slice(1) + ' ' + endCap + ' ' + back.filter(Boolean).join(' ') + ' L' + at(pts[0], nb, -rf) + ' ' + startCap + 'Z';
  }
  const shape = (d, col) => `<path d="${d}" fill="${col}"/>`;
  const ink = (d, w, col) => `<path d="${d}" fill="${col}" stroke="${col}" stroke-width="${w}" stroke-linejoin="round"/>`;
  function handEnd(g, kind, skin) {
    const open = kind === 'open' || kind === 'vopen';
    const [x, y] = g.end;
    const st = ` stroke="${PEN}" stroke-width="1.3"`;
    if (open) {
      const a = Math.atan2(y - g.prev[1], x - g.prev[0]);
      const off = kind === 'vopen' ? 3 : 6;
      const [cx, cy, deg] = [r1(x + Math.cos(a) * off), r1(y + Math.sin(a) * off), r1((a * 180) / Math.PI + (kind === 'vopen' ? 90 : 0))];
      return `<ellipse cx="${cx}" cy="${cy}" rx="10" ry="5.5" transform="rotate(${deg} ${cx} ${cy})" fill="${skin}"${st}></ellipse>`;
    }
    let el = `<circle cx="${x}" cy="${y}" r="7" fill="${skin}"${st}></circle>`;
    // Fingerglieder der Faust
    el += `<path d="M${x - 3.5} ${y - 3.5} q1.5 3.5 0 7 M${x} ${y - 4.5} q1.5 4.5 0 9 M${x + 3.5} ${y - 3.5} q1.5 3.5 0 7" stroke="${PEN}" stroke-width=".7" fill="none" opacity=".55"/>`;
    return el;
  }
  // Breiten: Schulter/Hüfte breit, zum Handgelenk/Knöchel schmaler
  function widths(n, a, b) {
    return Array.from({ length: n }, (_, i) => r1(a + ((b - a) * i) / Math.max(1, n - 1)));
  }
  // act: hervorgehobenes Glied (zartblau)
  function limb(p) {
    const leg = !!p.foot;
    const g = geo(p.p, p.foot, leg);
    const nc = g.segs.length + 1;
    const wc = leg ? widths(nc, p.w + 5, p.w - 1) : widths(nc, p.w + 5.5, p.w + 1.5);
    const wsk = leg ? (p.toward ? [p.w * 0.66, p.w * 0.66, p.w * 1.1] : [p.w * 0.66, p.w * 0.58, p.w * 0.5]) : [p.w - 1.5, p.w - 3];
    const cl = [g.segs[0][0]].concat(g.segs.map((sg) => sg[1]));
    const shrink = (ws, k) => ws.map((w) => Math.max(1, w + k));
    const sk = (k) => taper(g.skin, shrink(wsk, k));
    const gc = (k) => taper(cl, shrink(wc, k));
    const gi = p.act ? F_ACT : p.far ? F_FAR : F_GI;
    const skin = p.far ? F_FAR_SKIN : F_SKIN;
    const hd = p.end ? handEnd(g, p.end, skin) : '';
    const lit2 = (v0, v1, col) => shape(v0, SHADE[col] || col) + `<g transform="translate(-1 -1)">${shape(v1, col)}</g>`;
    const line = ink(sk(0), 2.4, PEN) + ink(gc(0), 2.4, PEN);
    return `${under(line)}${ink(sk(0), 2.4, PEN)}${lit2(sk(0), sk(-3), skin)}${ink(gc(0), 2.4, PEN)}${lit2(gc(0), gc(-3), gi)}${hd}${p.far ? '' : guides(p.p)}`;
  }
  function head([x, y], view) {
    const tilt = view === 'side' ? 12 : 0;
    const axis = view === 'side' ? 'M-16 1 H14 M3 -18 Q8 0 3 18' : 'M0 -19 V19 M-16 1 H16';
    const egg = (rx, ry, extra) => `<ellipse rx="${rx}" ry="${ry}" transform="rotate(${tilt})" ${extra}/>`;
    const line = egg(12, 14.5, `fill="none" stroke="${PEN}" stroke-width="2.6"`);
    return `<g transform="translate(${x} ${y})">${under(line)}${line}${egg(12, 14.5, `fill="${SHADE[F_GI]}"`)}<g transform="translate(-1 -1)">${egg(10.5, 13, `fill="${F_GI}"`)}</g><path d="${axis}" stroke="${PEN}" stroke-width=".5" fill="none" opacity=".3"/></g>`;
  }
  // Hals, Jacke mit Revers, Kopf, Gürtel (seitlich quer zum Rumpf)
  function body(s) {
    const neck = (a) => (s.head ? outlined(path([s.head, a]), 10, F_SKIN) : '');
    let out = '';
    let belt = '';
    if (s.torso) {
      const m = lerp(s.torso[0], s.torso[1], 0.5);
      const d = path(s.torso) + 'Z';
      const poly = (c, w) => `<path d="${d}" fill="${c}" stroke="${c}" stroke-width="${w}" stroke-linejoin="round"/>`;
      out += neck(m) + under(poly(PEN, 10.4)) + poly(PEN, 10.4) + lit((c, dw) => poly(c, 8 + dw), F_GI);
      const [bl, br] = [s.torso[3], s.torso[2]];
      out += `<path d="M${m[0] - 7} ${m[1] - 3} L${m[0]} ${m[1] + 16} L${m[0] + 7} ${m[1] - 3}Z" fill="${F_SKIN}" stroke="${PEN}" stroke-width=".8"/><path d="M${m[0] - 7} ${m[1] - 3} L${m[0] + 5} ${m[1] + 34} M${m[0] + 7} ${m[1] - 3} L${m[0]} ${m[1] + 16}" stroke="${PEN}" stroke-width="1" fill="none" opacity=".75"/>`;
      out += `<path d="M${bl[0] + 5} ${bl[1] - 26} q5 6 3 18 M${br[0] - 5} ${br[1] - 24} q-4 7 -2 16" stroke="${PEN}" stroke-width=".7" fill="none" opacity=".4"/>`;
    }
    if (s.trunk) {
      const [a, b] = s.trunk;
      const w = s.trunkW || 26;
      out += neck(a) + outlined(path(s.trunk), w, F_GI);
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const dx = (b[0] - a[0]) / len;
      const dy = (b[1] - a[1]) / len;
      const pt = (o, u, v) => `${r1(o[0] + dy * u + dx * v)} ${r1(o[1] - dx * u + dy * v)}`;
      out += `<path d="M${pt(a, 3, -6)} L${pt(a, 11, -4)} L${pt(a, 7, 10)}Z" fill="${F_SKIN}"/><path d="M${pt(a, 11, -4)} L${pt(a, 4, 32)}" stroke="${PEN}" stroke-width="1" fill="none" opacity=".75"/>`;
      const m = lerp(a, b, 0.86);
      const h = w / 2 + 1;
      belt = `<path d="M${pt(m, -h, 0)} L${pt(m, h, 0)}" stroke="#1d1d1d" stroke-width="6"/><path d="M${pt(m, h - 4, 0)} L${pt(m, h - 1, 13)}" stroke="#1d1d1d" stroke-width="3" stroke-linecap="round"/>`;
    }
    if (s.belt) {
      const [[x1, y1], [x2, y2]] = s.belt;
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      belt = `<path d="${path(s.belt)}" stroke="#1d1d1d" stroke-width="6"/><rect x="${mx - 4}" y="${my - 4}" width="8" height="8" rx="2" fill="#111"/><path d="M${mx - 2} ${my} l-5 14 M${mx + 2} ${my} l5 14" stroke="#1d1d1d" stroke-width="3" stroke-linecap="round"/>`;
    }
    return out + (s.head ? head(s.head, s.view) : '') + belt;
  }
  // Zeichenfolge: hintere Glieder, verdeckte (under), Rumpf und Kopf, vordere Glieder
  function person(s) {
    const ps = s.parts || [];
    const pick = (f) => ps.filter(f).map(limb).join('');
    return pick((p) => p.far) + pick((p) => p.under && !p.far) + body(s) + pick((p) => !p.far && !p.under);
  }

  const DEFS = `<defs><marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${ARR}"/></marker></defs>`;
  // Pfeile, Treffpunkte und Beschriftungen sind markiert, damit Animation/Quizbild sie nachträglich anpassen können
  function arrow(d, dashed, both) {
    return `<g data-arrow="1"><path d="${d}" stroke="#fff" stroke-width="7" ${CAP} opacity=".9"/><path d="${d}" stroke="${ARR}" stroke-width="3.2" ${CAP}${dashed ? ' stroke-dasharray="7 5"' : ''}${both ? ' marker-start="url(#ah)"' : ''} marker-end="url(#ah)"/></g>`;
  }
  function tag(x, y, text, tx, ty, anchor) {
    return `<g data-tag="1"><path d="M${x} ${y} L${tx} ${ty - 4}" stroke="${HL}" stroke-width="1.3"/><text x="${tx}" y="${ty + (ty < y ? -2 : 8)}" font-size="10" font-weight="700" text-anchor="${anchor || 'middle'}" fill="#b71c1c" ${FONT}>${esc(text)}</text></g>`;
  }
  const stripTags = (svg) => svg.replace(/<g data-tag="1">[\s\S]*?<\/g>/g, '');
  const hitDot = (x, y) => `<circle data-hit="${x} ${y}" cx="${x}" cy="${y}" r="6" fill="${HL}" stroke="#fff" stroke-width="2"/>`;
  function hit(x, y, label, tx, ty, anchor) {
    return hitDot(x, y) + (label ? tag(x, y, label, tx, ty, anchor) : '');
  }
  const ground = (w, y) => `<path d="M14 ${y} H${w - 14}" stroke="#cfd8dc" stroke-width="2"/>`;
  function frame(w, h, label, inner, lines) {
    // Unter dem Bild nur die Blickrichtung – die Erklärung steht im Text zur Grafik
    const view = /^(seitlich|von vorne|von oben)[^:]*(?=:)/.exec((lines && lines[0]) || '');
    const shown = view ? [view[0]] : lines || [];
    const hh = view ? 290 : h;
    const cap = shown.map((t, i, a) => `<text x="${w / 2}" y="${hh - 10 - (a.length - 1 - i) * 13}" font-size="10.5" text-anchor="middle" fill="#455a64" ${FONT}>${esc(t)}</text>`).join('');
    return `<svg viewBox="0 0 ${w} ${hh}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">${DEFS}<rect x="1" y="1" width="${w - 2}" height="${hh - 2}" rx="12" fill="#fafafa" stroke="#ddd"/>${inner}${cap}</svg>`;
  }
  function scene(label, w, spec, extra, lines) {
    const inner = `<g transform="translate(0 24)">${ground(w, 238)}${person(spec)}${extra}</g>`;
    return frame(w, lines && lines.length > 1 ? 300 : 290, label, inner, lines);
  }

  // Grundfigur von vorne (rechte Körperseite = im Bild links)
  const FRONT = { head: [110, 32], view: 'front', torso: [[93, 56], [127, 56], [122, 118], [98, 118]], belt: [[96, 112], [124, 112]] };
  const LEG_R = { p: [[102, 118], [95, 176], [89, 228]], w: 15, foot: [83, 234], under: true };
  const LEG_L = { p: [[118, 118], [125, 176], [131, 228]], w: 15, foot: [137, 234], under: true };
  const arm = (p, end) => ({ p, w: 10, end: end || 'fist' });
  const HIKITE_L = arm([[127, 62], [136, 94], [128, 110]]);
  const front = (parts) => Object.assign({}, FRONT, { parts: [LEG_R, LEG_L].concat(parts) });

  /* ---------- Körperwaffen ---------- */
  const HLF = `fill="${HL}" opacity=".85"`;
  const HLS = `stroke="${HL}" stroke-linecap="round" fill="none" opacity=".85"`;
  const caption = (x, y, t) => `<text x="${x}" y="${y}" font-size="10.5" text-anchor="middle" fill="#455a64" ${FONT}>${t}</text>`;
  // Großansichten: jede Fläche einzeln im Skizzen-Stil – Schattenseite (helle Fläche nach links oben
  // versetzt, auf die Form beschnitten), Bleistift-Kontur, zarte Zweitlinie. k = Maßstab der Gruppe.
  let clipN = 0;
  function solid(el, fill, k) {
    const f = k || 1;
    const id = `skc${++clipN}`;
    const at = (a) => el.replace(/\/>$/, ` ${a}/>`);
    const w = r1(1.7 / f * 10) / 10;
    const o = (v) => r1((v / f) * 100) / 100;
    return `<clipPath id="${id}">${el}</clipPath>` +
      `<g opacity=".1" transform="translate(${o(1.6)} ${o(2)})">${at(`fill="${PEN}" stroke="${PEN}" stroke-width="${w}"`)}</g>` +
      `<g opacity=".3" transform="translate(${o(1)} ${o(-0.9)})">${at(`fill="none" stroke="${PEN}" stroke-width="${w}"`)}</g>` +
      at(`fill="${SHADE[fill] || fill}"`) +
      `<g clip-path="url(#${id})"><g transform="translate(${o(-5)} ${o(-4)})">${at(`fill="${fill}"`)}</g></g>` +
      at(`fill="none" stroke="${PEN}" stroke-width="${w}" stroke-linejoin="round"`);
  }
  const solids = (els, fill, k) => els.match(/<[^>]+\/>/g).map((e) => solid(e, fill, k)).join('');
  function fist(hl) {
    const h = (k, shape) => (hl === k ? shape : '');
    // Frontansicht: rechte Faust, Blick auf die Knöchel – Zeigefinger im Bild rechts, kleiner Finger links
    const knuckles = [0, 1, 2, 3].map((i) => `<rect x="${-34 + i * 17}" y="-22" width="17" height="24" rx="8"/>`).join('');
    const frontView = `<g transform="translate(110 246) scale(1.3)">${solids(`<rect x="-34" y="-22" width="68" height="44" rx="12"/>${knuckles}<rect x="-14" y="4" width="44" height="14" rx="7"/>`, F_SKIN, 1.3)}
      ${h('seiken', `<rect x="0" y="-22" width="34" height="24" rx="8" ${HLF}/>`)}${h('uraken', `<rect x="0" y="-27" width="34" height="8" rx="4" ${HLF}/>`)}${h('tettsui', `<rect x="-39" y="-20" width="9" height="40" rx="4.5" ${HLF}/>`)}</g>`;
    const labels = {
      seiken: tag(188, 104, 'Knöchel von Zeige- und Mittelfinger', 210, 162, 'end'),
      uraken: tag(152, 104, 'Faustrücken (Knöchel)', 152, 162),
      tettsui: tag(128, 154, 'Kleinfingerseite der Faust', 128, 162),
    };
    return `<svg viewBox="0 0 220 300" role="img" aria-label="Faust" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="218" height="298" rx="12" fill="#fafafa" stroke="#ddd"/>
      ${caption(110, 16, 'rechte Faust von oben (Handrücken)')}
      <g transform="translate(0 22)">
      ${solid('<path d="M42 62 Q60 60 78 56 L78 116 Q60 112 42 108 Z"/>', F_SKIN)}${solid('<path d="M6 50 H44 V118 H6"/>', F_GI)}
      ${solids('<rect x="140" y="38" width="44" height="22" rx="11"/><rect x="140" y="60" width="46" height="22" rx="11"/><rect x="140" y="82" width="44" height="21" rx="10.5"/><rect x="138" y="103" width="38" height="19" rx="9.5"/>', F_SKIN)}
      ${solid('<path d="M74 46 Q76 36 96 36 L152 36 Q160 36 160 46 L160 116 Q160 126 150 126 L96 126 Q76 126 74 114 Z"/>', F_SKIN)}
      ${solid('<path d="M96 38 Q112 22 152 26 Q172 28 176 38 Q166 44 146 42 Q120 42 100 46 Z"/>', F_SKIN)}
      <g fill="${SKIN_D}"><ellipse cx="158" cy="49" rx="5" ry="7"/><ellipse cx="160" cy="71" rx="5" ry="7"/><ellipse cx="159" cy="92" rx="4.5" ry="6.5"/><ellipse cx="155" cy="112" rx="4" ry="6"/></g>
      ${h('seiken', `<rect x="179" y="38" width="11" height="44" rx="5.5" ${HLF}/>`)}
      ${h('uraken', `<ellipse cx="152" cy="60" rx="13" ry="22" ${HLF}/>`)}
      ${h('tettsui', `<rect x="80" y="121" width="96" height="11" rx="5.5" ${HLF}/>`)}
      </g>
      ${labels[hl] || ''}
      <path d="M14 180 H206" stroke="#e0e0e0"/>
      ${caption(110, 198, 'von vorne (Blick auf die Knöchel)')}
      ${frontView}
    </svg>`;
  }
  const HAND = 'M70,104 L70,39 Q70,30 79,30 Q88,30 88,39 L88,31 Q88,22 97,22 Q106,22 106,31 L106,37 Q106,28 114.5,28 Q123,28 123,37 L123,53 Q123,44 130.5,44 Q138,44 138,53 L138,112 Q140,148 132,170 L132,198 L82,198 L82,172 Q70,150 70,128 Z';
  function hand(hl) {
    const back = hl === 'haishu';
    const h = (k, shape) => (hl === k ? shape : '');
    const detail = back
      ? `<g fill="#fbe3d2" stroke="${SKIN_D}" stroke-width="1"><rect x="73" y="32" width="12" height="10" rx="5"/><rect x="91" y="24" width="12" height="10" rx="5"/><rect x="109" y="30" width="11" height="10" rx="5"/><rect x="126" y="46" width="9" height="9" rx="4"/></g><path d="M74 104 q5 -4 10 0 M92 102 q5 -4 10 0 M110 103 q5 -4 10 0 M126 106 q4 -3 8 0" stroke="${SKIN_D}" stroke-width="2" fill="none"/>`
      : `<path d="M72 62 h14 M90 56 h14 M108 60 h13 M125 72 h11 M72 84 h14 M90 80 h14 M108 82 h13 M125 90 h11 M80 120 Q104 112 132 118 M78 136 Q96 130 110 150" stroke="${SKIN_D}" stroke-width="1.5" fill="none"/>`;
    let body = `${solid('<path d="M74,160 Q54,150 48,124 Q44,106 54,104 Q63,103 65,118 Q68,134 74,138 Z"/>', F_SKIN)}${solid(`<path d="${HAND}"/>`, F_SKIN)}
      <path d="M88 39 V100 M106 37 V100 M123 53 V102" fill="none" stroke="${PEN}" stroke-width="1.3"/>${detail}${back ? `<path d="${HAND}" fill="${HL}" opacity=".35"/>` : ''}
      ${solid('<path d="M76 192 H138 V224 H76 Z"/>', F_GI)}`;
    if (back) body = `<g transform="translate(208 0) scale(-1 1)">${body}</g>`;
    return `<svg viewBox="0 0 208 246" role="img" aria-label="Offene Hand" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="206" height="244" rx="12" fill="#fafafa" stroke="#ddd"/>
      ${body}
      ${h('shuto', `<path d="M139 106 Q141 146 133 170" stroke-width="10" ${HLS}/>`)}
      ${h('haito', `<path d="M70 96 L70 124" stroke-width="10" ${HLS}/>`)}
      ${h('nukite', `<g ${HLF}><ellipse cx="79" cy="35" rx="9" ry="7"/><ellipse cx="97" cy="27" rx="9" ry="7"/><ellipse cx="114.5" cy="33" rx="8.5" ry="7"/><ellipse cx="130.5" cy="49" rx="7.5" ry="7"/></g>`)}
      ${h('teisho', `<ellipse cx="104" cy="166" rx="27" ry="11" ${HLF}/>`)}
      ${{ shuto: tag(141, 140, 'Handkante', 204, 128, 'end'), haito: tag(68, 98, 'Innenkante', 8, 80, 'start'), nukite: tag(132, 46, 'Fingerspitzen', 204, 30, 'end'), teisho: tag(128, 170, 'Handballen', 204, 186, 'end'), haishu: tag(124, 80, 'Handrücken', 202, 64, 'end') }[hl] || ''}
      ${caption(104, 238, back ? 'linke Hand, Rückseite' : 'linke Hand, Innenfläche')}
    </svg>`;
  }
  const FOOTSIDE = 'M46,26 L82,26 L84,66 Q92,82 118,90 Q150,98 176,104 Q190,106 200,100 Q210,98 210,108 Q209,120 194,124 L64,126 Q38,126 36,106 Q35,88 46,74 Z';
  function footSide(hl) {
    const h = (k, shape) => (hl === k ? shape : '');
    const labels = {
      koshi: tag(184, 118, 'Fußballen', 222, 66, 'end'),
      kakato: tag(38, 110, 'Ferse', 6, 92, 'start'),
      haisoku: tag(130, 92, 'Fußrücken (Spann)', 166, 60),
      sokuto: tag(120, 130, 'Fußkante (außen)', 120, 140),
    };
    // zweite Ansicht: Sohle von unten (große Zehe unten) bzw. Fußrücken von oben (große Zehe oben)
    const top = hl === 'haisoku';
    const hl2 = {
      koshi: `<path d="${BALL}" ${HLF}/>`,
      kakato: `<ellipse cx="0" cy="17" rx="7.5" ry="7.5" ${HLF}/>`,
      sokuto: `<path d="M-1,25 C-7,25 -9.5,20 -9.5,12 C-9.5,4 -12,-5 -12,-12" stroke-width="3.4" ${HLS}/>`,
      haisoku: `<ellipse cx="0" cy="0" rx="8" ry="11" ${HLF}/>`,
    }[hl] || '';
    const second = `<g transform="translate(104 244) rotate(90) scale(${top ? '-2.4 2.4' : '2.4'})">${solid(`<path d="${SOLE}"/>`, F_SKIN, 2.4)}${solids(TOES, F_SKIN, 2.4)}${hl2}</g>`;
    return `<svg viewBox="0 0 230 300" role="img" aria-label="Fuß" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="228" height="298" rx="12" fill="#fafafa" stroke="#ddd"/>
      ${solid(`<path d="${FOOTSIDE}"/>`, F_SKIN)}
      <circle cx="70" cy="76" r="6" fill="${SKIN_D}"/>
      <path d="M188 105 q3 9 0 18 M198 102 q3 9 0 19" stroke="${SKIN_D}" stroke-width="1.5" fill="none"/>
      ${solid('<path d="M40 6 H90 V36 H40 Z"/>', F_GI)}
      ${h('koshi', `<ellipse cx="182" cy="123" rx="16" ry="6" ${HLF}/>`)}
      ${h('kakato', `<ellipse cx="45" cy="113" rx="12" ry="12" ${HLF}/>`)}
      ${h('haisoku', `<path d="M86 70 Q94 84 118 91 Q150 99 176 105" stroke-width="9" ${HLS}/>`)}
      ${h('sokuto', `<path d="M52 126 L176 125" stroke-width="8" ${HLS}/>`)}
      ${labels[hl] || ''}
      ${caption(115, 166, 'rechter Fuß von außen (Zehen rechts)')}
      <path d="M14 176 H216" stroke="#e0e0e0"/>
      ${second}
      ${caption(115, 290, top ? 'rechter Fuß von oben' : 'rechter Fuß von unten (Sohle)')}
    </svg>`;
  }
  function bentLimb(kind) {
    if (kind === 'zenwan') {
      return scene('Arm', 220, front([HIKITE_L, arm([[93, 62], [86, 102], [76, 60]])]), `<path d="M86 96 L78 66" stroke-width="13" ${HLS}/>` + tag(76, 80, 'Unterarm', 14, 40, 'start'), ['von vorne']);
    }
    if (kind === 'hiji') {
      return scene('Arm', 240, Object.assign({}, SIDE, {
        parts: [
          Object.assign(arm([[112, 62], [104, 94], [116, 106]]), { far: true }),
          { p: [[106, 116], [72, 172], [38, 226]], w: 15, foot: [56, 232], far: true },
          { p: [[110, 116], [142, 168], [138, 228]], w: 15, foot: [158, 232] },
          arm([[112, 62], [152, 72], [120, 80]]),
        ]
      }), `<circle cx="161" cy="72" r="10" ${HLF}/>` + tag(166, 64, 'Ellbogen', 226, 38, 'end'), ['seitlich: Schlag nach vorne']);
    }
    return scene('Bein', 240, Object.assign({}, SIDE, {
      parts: [
        Object.assign(arm([[112, 62], [132, 84], [146, 98]]), { far: true }),
        { p: [[106, 116], [104, 176], [100, 228]], w: 15, foot: [118, 232], far: true },
        arm([[112, 62], [138, 80], [150, 96]]),
        { p: [[108, 116], [152, 94], [126, 146]], w: 15, foot: [118, 160] },
      ]
    }), `<circle cx="161" cy="90" r="11" ${HLF}/>` + tag(168, 82, 'Knie', 222, 52, 'end'), ['seitlich: Sto\u00df nach oben']);
  }
  // Seitenansicht (Blick nach rechts): rechte Körperseite vorne (near), linke hinten (far)
  const SIDE = { head: [114, 30], view: 'side', trunk: [[112, 52], [108, 116]] };
  const WEAPONS = {
    seiken: () => fist('seiken'), uraken: () => fist('uraken'), tettsui: () => fist('tettsui'),
    shuto: () => hand('shuto'), haito: () => hand('haito'), nukite: () => hand('nukite'), teisho: () => hand('teisho'), haishu: () => hand('haishu'),
    koshi: () => footSide('koshi'), kakato: () => footSide('kakato'), haisoku: () => footSide('haisoku'), sokuto: () => footSide('sokuto'),
    hiji: () => bentLimb('hiji'), hiza: () => bentLimb('hiza'), zenwan: () => bentLimb('zenwan'),
  };

  function dataUri(svg) {
    const s = svg.includes('xmlns=') ? svg : svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`;
  }

  SK.gfx = { STANCES, foot, stanceSvg, stanceFor, stanceKey, stanceFigure, figure, box, byKey, animSvg, hasAnim, plainSvg, WEAPONS, dataUri };
  // Bausatz für die Schemabilder (js/graphics-tech.js) und Fußbewegungen (js/graphics-ashi.js)
  SK.gfx.kit = { frame, arrow, foot, mode, FONT, HL, INK, ARR };
})();
