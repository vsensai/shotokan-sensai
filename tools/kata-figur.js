#!/usr/bin/env node
/*
 * Werkzeug für die Kata als Figur (js/kata-figur.js): rechnet die Kata im Browser (labor/kata.html, Playwright mit
 * Software-WebGL) und hilft beim Bauen und Prüfen einer neuen Kata.
 *
 *   node tools/kata-figur.js ablauf <id>                  Bewegungen mit Zeit, Dauer, Hüfthöhe, Stand und Technik
 *   node tools/kata-figur.js pruefen [id …]               alle Tempi: fehlende Techniken/Stände (warn) und Rechenprüfung
 *                                                         (check); ohne id: alle freigegebenen Kata
 *   node tools/kata-figur.js stand <datei.json> [id …]    Gelenkpositionen alle 0,1 s festhalten – VOR einer Änderung
 *   node tools/kata-figur.js vergleich <datei.json>       danach: was hat sich an den festgehaltenen Kata verändert?
 *   node tools/kata-figur.js beine <id> [von bis]         je Zählzeit: kleinster Abstand der Hosenbeine (negativ = sie stecken
 *                                                         ineinander; bei geschlossenen Füßen normal, im Kreuzschritt nicht);
 *                                                         mit von/bis (Sekunden): alle 0,05 s
 *   node tools/kata-figur.js bogen <id> <bild.png> <kamera> <t1,t2,…> [spalten]
 *                                                         Kontaktbogen: die Figur zu den genannten Zeiten (Sekunden),
 *                                                         Kamera hinten|vorne|seite|oben – zum Ansehen mit dem Read-Werkzeug;
 *                                                         näher heran (größere Bilder) mit Abstand und Blickhöhe in Metern,
 *                                                         z. B. vorne:2.6 oder vorne:2:0.35 für die Beine
 *
 * Bilder und Stände gehören nach tools/out/ (wird nicht committet).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const [cmd, ...args] = process.argv.slice(2);

// Im Seitenkontext: Kata bauen (id, Takt in Sekunden)
const inPage = {
  ablauf: (id) => {
    const a = SK.kataFigur.build(SK.kata[id], { beat: 2 });
    return a.marks.map((m) => {
      let lo = 9;
      for (let t = m.t; t <= m.t1 + 0.3; t += 1 / 60) lo = Math.min(lo, a.pose(t).pelvis[1]);
      return `${String(m.n || m.ro).padEnd(5)} ${m.t.toFixed(1).padStart(5)} s  Dauer ${(m.t1 - m.t).toFixed(2)}  Hüfte min ${lo.toFixed(2)} / Ende ${a.pose(m.t1 + 0.3).pelvis[1].toFixed(2)}  ${m.text}`;
    }).concat(a.warn.map((w) => 'WARN ' + w)).join('\n');
  },
  pruefen: (ids) => {
    const out = [];
    (ids.length ? ids : SK.kataFigur.KATA).forEach((id) => SK.ansageBeats.forEach((beat) => {
      try {
        const a = SK.kataFigur.build(SK.kata[id], { beat });
        const c = SK.kataFigur.check(a, 60);
        const tl = SK.ansageTimeline(SK.kata[id], beat, true);
        const takt = a.ends.length !== tl.length || a.ends.some((e, i) => e < tl[i].t || (tl[i + 1] && e > tl[i + 1].t));
        const all = a.warn.concat(c, takt ? ['Bewegung endet nicht in ihrer Zählzeit'] : []);
        out.push(`${id} Takt ${beat.toFixed(2)} s: ${all.length ? all.length + ' Meldungen' : 'OK'}`);
        all.slice(0, 12).forEach((w) => out.push('   ' + w));
      } catch (e) { out.push(`${id} Takt ${beat}: FEHLER ${(e && e.stack) || e}`); }
    }));
    return out.join('\n');
  },
  stand: (ids) => {
    const out = {};
    (ids.length ? ids : SK.kataFigur.KATA).forEach((id) => [2, 2 / 3].forEach((beat) => {
      const a = SK.kataFigur.build(SK.kata[id], { beat });
      const rows = [];
      for (let t = 0; t <= a.dur; t += 0.1) {
        const J = Figur3D.solve(a.pose(t));
        rows.push(['pel', 'ankleL', 'ankleR', 'fistL', 'fistR', 'head'].map((q) => J[q].map((v) => v.toFixed(4)).join(',')).join(' '));
      }
      out[`${id}@${beat.toFixed(2)}`] = rows;
    }));
    return out;
  },
  // Abstand der Hosenbeine (Achsen der Ober- und Unterschenkel minus ihre Dicke, wie Figur3D sie zeichnet)
  beine: ([id, von, bis]) => {
    const a = SK.kataFigur.build(SK.kata[id], { beat: 2 });
    const mix = (p, q, u) => p.map((v, i) => v + (q[i] - v) * u);
    const leg = (J, s) => {
      const pts = [];
      for (let i = 0; i <= 10; i++) pts.push({ p: mix(J['hip' + s], J['knee' + s], i / 10), r: 0.112 + (0.094 - 0.112) * (i / 10), teil: 'Oberschenkel' });
      for (let i = 1; i <= 10; i++) pts.push({ p: mix(J['knee' + s], J['ankle' + s], 0.88 * (i / 10)), r: 0.094 + (0.108 - 0.094) * (i / 10), teil: i > 7 ? 'Hosensaum' : 'Unterschenkel' });
      return pts;
    };
    const rows = {};
    const fein = bis > von;
    for (let t = fein ? von : 0; t <= (fein ? bis : a.dur) + 1e-6; t += fein ? 0.05 : 1 / 30) {
      const J = Figur3D.solve(a.pose(t));
      let best = null;
      // die Oberschenkel am Schritt gehören zusammen: erst ab der Mitte des Oberschenkels zählen
      leg(J, 'L').slice(5).forEach((x) => leg(J, 'R').slice(5).forEach((y) => {
        const d = Math.hypot(x.p[0] - y.p[0], x.p[1] - y.p[1], x.p[2] - y.p[2]) - x.r - y.r;
        if (!best || d < best.d) best = { d, t, wo: `L ${x.teil} / R ${y.teil}`, h: (x.p[1] + y.p[1]) / 2 };
      }));
      const m = a.marks[a.markAt(t)];
      const key = fein ? t.toFixed(2) : m ? String(m.n || m.ro) : '-';
      if (!rows[key] || best.d < rows[key].d) rows[key] = best;
    }
    return Object.keys(rows).map((k) => `${k.padEnd(6)} ${(rows[k].d * 100).toFixed(1).padStart(6)} cm  bei ${rows[k].t.toFixed(2)} s  ${rows[k].wo} (Höhe ${rows[k].h.toFixed(2)} m)`).join('\n');
  },
  bogen: async (ts, kamera, cols) => {
    const cv = document.getElementById('fig');
    const [name, nah, hoehe] = kamera.split(':');
    const W = nah ? 450 : 300, H = nah ? 360 : 240;
    const out = document.createElement('canvas');
    out.width = cols * W; out.height = Math.ceil(ts.length / cols) * H;
    const g = out.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, out.width, out.height);
    const cams = { hinten: { yaw: 158, pitch: 20, dist: 5.4 }, vorne: { yaw: -22, pitch: 16, dist: 5.0 }, seite: { yaw: -90, pitch: 12, dist: 5.4 }, oben: { yaw: 180, pitch: 78, dist: 7.2 } };
    const cam = Object.assign({ h: 0 }, cams[name] || cams.hinten, nah ? { dist: Number(nah) } : {}, hoehe ? { h: Number(hoehe) } : {});
    for (let i = 0; i < ts.length; i++) {
      kataLab.set(ts[i], cam);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      kataLab.set(ts[i], cam);
      const x = (i % cols) * W, y = Math.floor(i / cols) * H;
      g.drawImage(cv, x, y, W, H);
      const m = kataLab.anim.marks[kataLab.anim.markAt(ts[i])];
      g.fillStyle = '#000'; g.font = '13px sans-serif';
      g.fillText(`${ts[i].toFixed(2)} s · ${m ? (m.n || m.ro) : ''}`, x + 6, y + 16);
    }
    return out.toDataURL('image/png');
  },
};

async function open(id) {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 400, height: 900 } });
  page.on('pageerror', (e) => { console.error('JavaScript-Fehler auf der Seite: ' + e.message); process.exitCode = 1; });
  await page.goto(`file://${path.join(root, 'labor', 'kata.html')}?kata=${id || 'heian-shodan'}`);
  await page.waitForFunction(() => window.kataLab && window.SK && SK.kataFigur, null, { timeout: 30000 });
  return { browser, page };
}

(async () => {
  if (cmd === 'ablauf' && args[0]) {
    const { browser, page } = await open(args[0]);
    console.log(await page.evaluate(inPage.ablauf, args[0]));
    await browser.close();
  } else if (cmd === 'pruefen') {
    const { browser, page } = await open();
    const text = await page.evaluate(inPage.pruefen, args);
    console.log(text);
    if (/Meldungen|FEHLER/.test(text)) process.exitCode = 1;
    await browser.close();
  } else if (cmd === 'stand' && args[0]) {
    const { browser, page } = await open();
    fs.writeFileSync(args[0], JSON.stringify(await page.evaluate(inPage.stand, args.slice(1))));
    console.log(`Stand festgehalten: ${args[0]}`);
    await browser.close();
  } else if (cmd === 'vergleich' && args[0]) {
    const alt = JSON.parse(fs.readFileSync(args[0], 'utf8'));
    const { browser, page } = await open();
    const neu = await page.evaluate(inPage.stand, [...new Set(Object.keys(alt).map((k) => k.split('@')[0]))]);
    await browser.close();
    let anders = false;
    Object.keys(alt).forEach((k) => {
      let max = 0, at = 0, n = 0;
      alt[k].forEach((row, i) => {
        const x = row.split(/[ ,]/).map(Number), y = ((neu[k] || [])[i] || '').split(/[ ,]/).map(Number);
        let d = 0;
        x.forEach((v, j) => (d = Math.max(d, Math.abs(v - y[j]))));
        if (!(d <= 1e-4)) n++;
        if (!(d <= max)) { max = d; at = i; }
      });
      if (n || alt[k].length !== (neu[k] || []).length) anders = true;
      console.log(n ? `${k}: ${n} von ${alt[k].length} Zeitpunkten anders, größte Abweichung ${max.toFixed(3)} m bei ${(at / 10).toFixed(1)} s` : `${k}: unverändert`);
    });
    if (anders) process.exitCode = 2;
  } else if (cmd === 'beine' && args[0]) {
    const { browser, page } = await open(args[0]);
    console.log(await page.evaluate(inPage.beine, [args[0], Number(args[1]), Number(args[2])]));
    await browser.close();
  } else if (cmd === 'bogen' && args.length >= 4) {
    const { browser, page } = await open(args[0]);
    const url = await page.evaluate(([f, ts, kamera, cols]) => eval(`(${f})`)(ts, kamera, cols), [inPage.bogen.toString(), args[3].split(',').map(Number), args[2], Number(args[4]) || 6]);
    fs.writeFileSync(args[1], Buffer.from(url.split(',')[1], 'base64'));
    console.log(`Kontaktbogen: ${args[1]}`);
    await browser.close();
  } else {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace(/^#!.*\n\/\*\n?/, ''));
    process.exitCode = 1;
  }
})();
