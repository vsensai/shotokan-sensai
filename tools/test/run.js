#!/usr/bin/env node
/*
 * Führt die Browser-Tests mit Playwright aus und wartet zuverlässig auf ihr Ende.
 *
 *   node tools/test/run.js            → validate.html, dann smoke.html
 *   node tools/test/run.js validate   → nur validate.html
 *   node tools/test/run.js smoke      → nur smoke.html
 *
 * Vorab prüft es index.html (tools/version.js): ?v= überall gleich, jedes Skript im Vorlade-Block.
 *
 * Fertig ist ein Test, sobald er <html data-ergebnis="ok|fehler"> setzt. Ein JavaScript-Fehler
 * auf der Seite bricht sofort ab (sonst bliebe sie bei „läuft …“ stehen). Hartes Zeitlimit je
 * Test: 180 s. Exit-Code 0 nur, wenn alle Tests „ok“ melden.
 */
'use strict';
const path = require('path');
const { chromium } = require('playwright');

const LIMIT_MS = 180000;
const dir = __dirname;
const names = process.argv.slice(2).length ? process.argv.slice(2) : ['validate', 'smoke'];

async function runOne(browser, name) {
  const file = path.join(dir, `${name.replace(/\.html$/, '')}.html`);
  const page = await browser.newPage();
  const t0 = Date.now();
  let pageError = null;
  page.on('pageerror', (e) => (pageError = pageError || e));
  page.on('dialog', (d) => d.accept());
  try {
    await page.goto(`file://${file}`);
    // Wartet auf die Fertig-Markierung oder einen Seitenfehler, höchstens LIMIT_MS
    while (Date.now() - t0 < LIMIT_MS) {
      if (pageError) break;
      const res = await page.evaluate(() => document.documentElement.dataset.ergebnis || null);
      if (res) break;
      await page.waitForTimeout(250);
    }
    const res = await page.evaluate(() => document.documentElement.dataset.ergebnis || null);
    const text = await page.evaluate(() => (document.getElementById('out') || document.getElementById('log') || document.body).textContent);
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    const lines = text.trim().split('\n');
    let status;
    if (pageError) status = `FEHLER – JavaScript-Fehler auf der Seite: ${pageError.message}`;
    else if (!res) status = `FEHLER – kein Ergebnis nach ${LIMIT_MS / 1000} s (zuletzt: ${lines[lines.length - 1]})`;
    else status = res === 'ok' ? 'OK' : 'FEHLER';
    console.log(`== ${name}: ${status} (${secs} s)`);
    // Bei Erfolg nur die letzte Zeile, sonst die ganze Ausgabe
    console.log(res === 'ok' && !pageError ? `   ${lines[lines.length - 1]}` : text);
    return res === 'ok' && !pageError;
  } finally {
    await page.close();
  }
}

// index.html: alle Dateien mit ?v=<Version> und jedes Skript im Vorlade-Block (tools/version.js ohne Argument).
// Die Browser-Tests laufen über file:// und können index.html nicht selbst abrufen.
function checkIndex() {
  const r = require('child_process').spawnSync(process.execPath, [path.join(dir, '..', 'version.js')], { encoding: 'utf8' });
  const ok = r.status === 0;
  console.log(`== index.html: ${ok ? 'OK' : 'FEHLER'}`);
  if (!ok) console.log(r.stderr.trim());
  return ok;
}

(async () => {
  let ok = checkIndex();
  // WebGL per Software, damit die 3D-Figuren auch ohne Grafikkarte rechnen
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader'] });
  try {
    for (const n of names) ok = (await runOne(browser, n)) && ok;
  } finally {
    await browser.close();
  }
  process.exit(ok ? 0 : 1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
