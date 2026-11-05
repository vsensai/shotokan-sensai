/* Vergleicht die Stellungen der Kata-Ansage mit den Einzelskizzen des Buches (Tabellen in docs/fussskizzen.md) –
   ohne PDF. Gemeldet wird jede Stellung, bei der eine Zehenrichtung oder die Richtung vom linken zum rechten Fuß um
   mehr als die Schwelle abweicht, und jede Bewegung ohne Skizze („Stand bleibt“), in der die App einen Fuß versetzt.
   Die Messwerte der Skizzen sind auf etwa ±10° genau; im Zenkutsu-dachi zeigt der vordere Fuß im Buch rund 14° nach innen.
   Aufruf: node tools/skizzen-vergleich.js [--roh] [--schwelle 25] [KATA-ID …]
   --roh: Rohdaten aus data/kata-*.js (vor dem Ausgleich in js/kata-ansage.js) statt der angezeigten Stellungen */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const FILES = ['js/core.js', 'js/graphics.js', 'js/graphics-tech.js', 'data/kata-intro.js', 'data/kata-heian.js', 'data/kata-tekki.js', 'data/kata-sentei.js', 'data/kata-hangetsu.js', 'js/kata-ansage.js'];
const args = process.argv.slice(2);
const raw = args.includes('--roh');
const si = args.indexOf('--schwelle');
const limit = si >= 0 ? Number(args[si + 1]) : 25;
const only = args.filter((a, i) => !a.startsWith('--') && (si < 0 || i !== si + 1));

const store = {};
const ctx = { console, localStorage: { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } } };
ctx.window = ctx;
vm.createContext(ctx);
FILES.forEach((f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }));
const SK = ctx.SK;

const angDiff = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
const dirOf = (a, b) => (Math.round((Math.atan2(b[0] - a[0], b[1] - a[1]) * 180) / Math.PI) + 360) % 360;

// Tabellen der Einzelskizzen: je Kata { Nr: { sketches, toes: [l, r] | null, place } }
function sketches() {
  const md = fs.readFileSync(path.join(root, 'docs/fussskizzen.md'), 'utf8');
  const out = {};
  for (const m of md.matchAll(/<!-- einzel:([\w-]+) -->\n([\s\S]*?)<!-- \/einzel -->/g)) {
    out[m[1]] = {};
    m[2].split('\n').slice(2).filter((l) => l.startsWith('|')).forEach((l) => {
      const c = l.split('|').slice(1, -1).map((s) => s.trim());
      const toes = /^(\d+)° \/ (\d+)°$/.exec(c[2]);
      const place = /^(\d+)°$/.exec(c[3]);
      out[m[1]][c[0]] = { sketches: c[1] === 'keine' ? 0 : Number(c[1]), toes: toes ? [Number(toes[1]), Number(toes[2])] : null, place: place ? Number(place[1]) : null };
    });
  }
  return out;
}

// Bewusst so belassene Abweichungen (siehe „Bewusst offen gelassen“ in docs/fussskizzen.md): werden nicht gemeldet,
// nur am Ende gezählt. Schlüssel: Kata-ID und Stellung (Nr, Rei, Yoi …).
const ACCEPTED = {
  jion: { 2: 'vorderer Fuß im Buch etwa 41° eingedreht, die App setzt wie überall 15°' },
};

const book = sketches();
let accepted = 0;
let total = 0;
SK.ansageKata().filter((id) => !only.length || only.includes(id)).forEach((id) => {
  const k = SK.kata[id];
  if (!book[id]) return console.log(`${id}: keine Tabelle in docs/fussskizzen.md`);
  const a = raw ? k.ansage : SK.ansagePoses(k);
  const poses = [a.rei, a.yoi].concat(a.moves, [a.naore, a.end]);
  const names = ['Rei', 'Yoi'].concat(k.seq.map((r) => String(r[0])), ['Naore', 'Rei (Ende)']);
  const stances = ['', ''].concat(k.seq.map((r) => r[1]), ['', '']);
  const rows = [];
  poses.forEach((p, j) => {
    const b = book[id][names[j]];
    if (!b) return;
    const f = p.f;
    const what = [];
    if (b.toes && f[0][3] > 0 && f[1][3] > 0) {
      ['links', 'rechts'].forEach((s, i) => {
        const d = angDiff(b.toes[i], f[i][2]);
        // fast 180°: in der Skizze Ferse und Zehen verwechselt (verdeckter Abdruck), kein Befund
        if (d > limit && d < 140) what.push(`Zehen ${s} Buch ${b.toes[i]}° / App ${f[i][2]}° (${d}°)`);
      });
      const pa = dirOf(f[0], f[1]);
      const d = angDiff(b.place, pa);
      if (d > limit) what.push(`rechter Fuß vom linken aus Buch ${b.place}° / App ${pa}° (${d}°)`);
    }
    if (!raw && !b.sketches && j > 1 && j < poses.length - 2) {
      const q = poses[j - 1].f;
      const moved = [0, 1].map((i) => Math.hypot(f[i][0] - q[i][0], f[i][1] - q[i][1]));
      ['linker', 'rechter'].forEach((s, i) => { if (moved[i] > 0.03) what.push(`keine Skizze (Stand bleibt), App versetzt ${s} Fuß um ${moved[i].toFixed(2)}`); });
    }
    if (what.length && (ACCEPTED[id] || {})[names[j]]) {
      accepted++;
      return;
    }
    if (what.length) rows.push(`  ${names[j]}${stances[j] ? ` (${stances[j]})` : ''}: ${what.join('; ')}`);
  });
  total += rows.length;
  console.log(`${k.name}: ${rows.length ? `${rows.length} Stellung(en) mit Abweichung` : 'passt'}`);
  rows.forEach((r) => console.log(r));
});
console.log(`\n${total} Stellungen mit Abweichung über ${limit}° (${raw ? 'Rohdaten' : 'angezeigte Stellungen'}).`);
if (accepted) console.log(`${accepted} bewusst so belassen (ACCEPTED in tools/skizzen-vergleich.js), nicht gemeldet.`);
