#!/usr/bin/env node
/* Versionsnummer an einer Stelle pflegen: setzt SK.VERSION samt Datum und Uhrzeit in js/core.js
   sowie die Versionszeile der Startseite in index.html und hängt ?v=<Version> an alle lokalen Dateien in index.html, damit Browser nach einem Update
   keine alten Dateien aus dem Zwischenspeicher mischen.

   node tools/version.js                 aktuelle Version zeigen und index.html prüfen
   node tools/version.js patch|minor|major|1.2.3   neue Version setzen */
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const coreFile = path.join(root, 'js', 'core.js');
const indexFile = path.join(root, 'index.html');
const ASSET = /((?:href|src)=")((?:css|js|data|assets)\/[^"?]+)(?:\?v=[^"]*)?"/g;

// Vorlade-Links für alle Skripte, direkt hinter der CSP-Zeile: Mit <meta http-equiv="Content-Security-Policy">
// lädt Chrome die Skripte am Ende von <body> sonst nacheinander (jedes erst nach dem vorigen) – die App war beim
// ersten Laden nach einem Update erst nach Sekunden bedienbar. Der Block wird bei jedem Versionswechsel neu erzeugt.
const PRE_A = '  <!-- Vorladen (erzeugt von tools/version.js) -->\n';
const PRE_E = '  <!-- /Vorladen -->\n';
const CSP = /  <meta http-equiv="Content-Security-Policy"\n[^>]*>\n/;
function preload(html) {
  const links = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => `  <link rel="preload" href="${x[1]}" as="script">\n`).join('');
  const block = PRE_A + links + PRE_E;
  const i = html.indexOf(PRE_A);
  if (i >= 0) return html.slice(0, i) + block + html.slice(html.indexOf(PRE_E, i) + PRE_E.length);
  if (!CSP.test(html)) throw new Error('index.html: CSP-Zeile für den Vorlade-Block nicht gefunden');
  return html.replace(CSP, (c) => c + block);
}

let core = fs.readFileSync(coreFile, 'utf8');
let index = fs.readFileSync(indexFile, 'utf8');
const m = /SK\.VERSION = '(\d+)\.(\d+)\.(\d+)';/.exec(core);
if (!m) {
  console.error('SK.VERSION in js/core.js nicht gefunden');
  process.exit(1);
}
const current = m.slice(1, 4).join('.');
const arg = process.argv[2];

if (!arg) {
  const stale = [...index.matchAll(ASSET)].filter((x) => !x[0].endsWith(`?v=${current}"`)).map((x) => x[2]);
  console.log(`Version ${current}`);
  if (stale.length) {
    console.error(`index.html: ohne ?v=${current}: ${stale.join(', ')}\n→ node tools/version.js ${current}`);
    process.exit(1);
  }
  if (preload(index) !== index) {
    console.error(`index.html: Vorlade-Block passt nicht zu den Skripten\n→ node tools/version.js ${current}`);
    process.exit(1);
  }
  process.exit(0);
}

let [major, minor, patch] = m.slice(1, 4).map(Number);
let next;
if (arg === 'major') next = `${major + 1}.0.0`;
else if (arg === 'minor') next = `${major}.${minor + 1}.0`;
else if (arg === 'patch') next = `${major}.${minor}.${patch + 1}`;
else if (/^\d+\.\d+\.\d+$/.test(arg)) next = arg;
else {
  console.error(`Unbekanntes Argument „${arg}“ – erwartet patch, minor, major oder z. B. 1.2.3`);
  process.exit(1);
}

const parts = Object.fromEntries(
  new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date())
    .map((p) => [p.type, p.value])
);
core = core
  .replace(/SK\.VERSION = '[^']*';/, `SK.VERSION = '${next}';`)
  .replace(/SK\.VERSION_DATE = '[^']*';/, `SK.VERSION_DATE = '${parts.day}.${parts.month}.${parts.year}';`)
  .replace(/SK\.VERSION_TIME = '[^']*';/, `SK.VERSION_TIME = '${parts.hour}:${parts.minute}';`);
index = index
  .replace(ASSET, `$1$2?v=${next}"`)
  // Versionszeile der fest eingetragenen Startseite
  .replace(/(<p class="version">)Version [^<]*· /, `$1Version ${next} · Stand ${parts.day}.${parts.month}.${parts.year}, ${parts.hour}:${parts.minute} Uhr · `);
index = preload(index);
fs.writeFileSync(coreFile, core);
fs.writeFileSync(indexFile, index);
console.log(`Version ${current} → ${next} (Stand ${parts.day}.${parts.month}.${parts.year}, ${parts.hour}:${parts.minute} Uhr)`);
