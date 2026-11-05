/* Vergleicht die Stellungen der Kata-Ansage (Bodenkarte, nach dem Ausgleich) mit einem früheren Stand, damit eine Änderung
   an einer Stelle nicht unbemerkt andere Bewegungen oder andere Kata verschiebt. Vor jedem Commit laufen lassen, der
   data/kata-*.js oder js/kata-ansage.js ändert, und die gemeldeten Unterschiede prüfen.
   Aufruf: node tools/ansage-vergleich.js [Git-Stand, Standard HEAD] */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const FILES = ['js/core.js', 'js/graphics.js', 'js/graphics-tech.js', 'data/kata-intro.js', 'data/kata-heian.js', 'data/kata-tekki.js', 'data/kata-sentei.js', 'data/kata-hangetsu.js', 'js/kata-ansage.js'];
const ref = process.argv[2] || 'HEAD';

// Lädt die App-Dateien (aus dem Arbeitsverzeichnis oder einem Git-Stand) und liefert je Kata die Stellungen
function poses(read) {
  const store = {};
  const ctx = { console, localStorage: { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } } };
  ctx.window = ctx;
  vm.createContext(ctx);
  FILES.forEach((f) => vm.runInContext(read(f), ctx, { filename: f }));
  const SK = ctx.SK;
  const out = {};
  SK.ansageKata().forEach((id) => {
    const a = SK.ansagePoses(SK.kata[id]);
    const names = ['Rei', 'Yoi'].concat(a.moves.map((m, i) => String(i + 1)), ['Naore', 'Ende']);
    out[id] = [a.rei, a.yoi].concat(a.moves, [a.naore, a.end]).map((p, i) => ({ name: names[i], p }));
  });
  return out;
}

// Eine Datei, die es im früheren Stand noch nicht gab (z. B. eine neue Kata), fehlt dort einfach
const fromRef = (f) => {
  try { return execFileSync('git', ['show', `${ref}:${f}`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { return ''; }
};
const before = poses(fromRef);
const after = poses((f) => fs.readFileSync(path.join(root, f), 'utf8'));

// Was sich an einer Stellung geändert hat, in Worten
function diff(a, b) {
  const what = [];
  ['linker', 'rechter'].forEach((s, i) => {
    const [x, y] = [a.f[i], b.f[i]];
    if (x[0] !== y[0] || x[1] !== y[1]) what.push(`${s} Fuß Platz (${x[0]}, ${x[1]}) → (${y[0]}, ${y[1]})`);
    if (x[2] !== y[2]) what.push(`${s} Fuß Richtung ${x[2]}° → ${y[2]}°`);
    if (x[3] !== y[3]) what.push(`${s} Fuß Gewicht ${x[3]} → ${y[3]}`);
  });
  [['body', 'Körper'], ['look', 'Blick'], ['turn', 'Drehung']].forEach(([k, t]) => {
    if (a[k] !== b[k]) what.push(`${t} ${a[k] == null ? '–' : a[k]} → ${b[k] == null ? '–' : b[k]}`);
  });
  if (JSON.stringify(a.via) !== JSON.stringify(b.via)) what.push('Zwischenstellung (via)');
  if (a.h !== b.h) what.push('Fußarbeit (Text)');
  return what;
}

let changed = 0;
Object.keys({ ...before, ...after }).forEach((id) => {
  if (!before[id] || !after[id]) {
    console.log(`${id}: ${before[id] ? 'entfernt' : 'neu'}`);
    changed++;
    return;
  }
  if (before[id].length !== after[id].length) {
    console.log(`${id}: ${before[id].length} → ${after[id].length} Stellungen`);
    changed++;
    return;
  }
  const rows = after[id].map((s, i) => [s.name, diff(before[id][i].p, s.p)]).filter(([, w]) => w.length);
  if (!rows.length) return console.log(`${id}: unverändert`);
  changed++;
  console.log(`${id}: ${rows.length} Stellung(en) geändert`);
  rows.forEach(([n, w]) => console.log(`  ${n}: ${w.join('; ')}`));
});
console.log(changed ? `\n${changed} Kata mit Änderungen gegenüber ${ref}.` : `\nAlle Kata unverändert gegenüber ${ref}.`);
