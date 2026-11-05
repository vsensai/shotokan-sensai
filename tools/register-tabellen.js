/* Schreibt die Ablauftabellen je Kata in docs/buch-register.md – aus den App-Daten (seq + ansage), damit Register und App
   nicht auseinanderlaufen. Ersetzt jeweils den Block zwischen <!-- ablauf:KATA-ID --> und <!-- /ablauf -->.
   Aufruf: node tools/register-tabellen.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const store = {};
const ctx = { console, localStorage: { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } } };
ctx.window = ctx;
vm.createContext(ctx);
['js/core.js', 'js/graphics.js', 'js/graphics-tech.js', 'data/kata-intro.js', 'data/kata-heian.js', 'data/kata-tekki.js', 'data/kata-sentei.js', 'data/kata-hangetsu.js'].forEach((f) => {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
});
const SK = ctx.SK;

const DIR = { 0: 'vorne', 45: 'rechts vorne', 90: 'rechts', 135: 'rechts hinten', 180: 'Start', 225: 'links hinten', 270: 'links', 315: 'links vorne' };
const dir = (d) => DIR[((d % 360) + 360) % 360] || `${d}°`;
const cell = (s) => String(s).replace(/\|/g, '/');

function table(k) {
  const a = k.ansage;
  const rows = ['| Nr | Stand | Technik | Fußarbeit | Richtung | Scan-S. |', '|---|---|---|---|---|---|'];
  k.seq.forEach((r) => {
    const n = r[0];
    const p = a.moves[n - 1];
    const marks = [k.kiai.includes(n) ? '**Kiai**' : '', k.slow.includes(n) ? 'langsam' : '', k.continuous.some((g) => g.includes(n) && g.includes(n + 1)) ? 'fließend weiter' : '']
      .filter(Boolean).join(', ');
    const tech = r[2] + (r[4] ? ` (${r[4]})` : '') + (marks ? ` – ${marks}` : '');
    const look = p.look != null ? `, Blick ${dir(p.look)}` : '';
    const turn = p.turn ? `, ${SK.turnText(p.turn)}` : '';
    rows.push(`| ${n} | ${cell(r[1])} | ${cell(tech)} | ${cell(p.h)} | ${dir(p.body)}${look}${turn} | ${r[3]} |`);
  });
  return rows.join('\n');
}

// SK.turnText steht in kata-ansage.js (braucht den Browser) – hier dieselbe Formel
SK.turnText = (deg) => (Math.abs(deg) === 360 ? `ganze Drehung ${deg < 0 ? 'links' : 'rechts'} herum` : `Wendung ${{ 45: '⅛', 90: '¼', 135: '⅜', 180: '½', 225: '⅝', 270: '¾' }[Math.abs(deg)] || `${Math.abs(deg)}°`} ${deg < 0 ? 'links' : 'rechts'} herum`);

const file = path.join(root, 'docs/buch-register.md');
let md = fs.readFileSync(file, 'utf8');
SK.kataOrder.forEach((id) => {
  const re = new RegExp(`(<!-- ablauf:${id} -->\\n)[\\s\\S]*?(<!-- /ablauf -->)`);
  if (!re.test(md)) throw new Error(`Block für ${id} fehlt in docs/buch-register.md`);
  md = md.replace(re, `$1${table(SK.kata[id])}\n$2`);
});
fs.writeFileSync(file, md);
console.log('Ablauftabellen geschrieben:', SK.kataOrder.join(', '));
