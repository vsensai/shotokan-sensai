/* Prüft Datenkonsistenz aller Fragen und Kata-Daten. Ergebnis wird als Text ausgegeben. */
(function () {
  'use strict';
  const errors = [];
  const out = [];
  const kataUnits = SK.buildKataContent();
  const units = SK.generalUnits.concat(kataUnits, [SK.buildGlossaryContent()]);
  const lessons = new Map();
  units.forEach((u) => u.lessons.forEach((l) => lessons.set(l.id, u)));

  for (const id of SK.kataOrder) {
    const k = SK.kata[id];
    if (k.seq.length !== k.moves) errors.push(`${id}: seq ${k.seq.length} != moves ${k.moves}`);
    k.seq.forEach((r, i) => { if (r[0] !== i + 1) errors.push(`${id}: Nummer ${r[0]} an Position ${i + 1}`); });
    k.kiai.forEach((n) => { if (n < 1 || n > k.moves) errors.push(`${id}: Kiai ${n} ausserhalb`); });
    [...k.continuous.flat(), ...k.slow].forEach((n) => { if (n < 1 || n > k.moves) errors.push(`${id}: Bewegung ${n} ausserhalb`); });
    // Aufteilung für die Bewegungskarten: jede Technik muss Teile ergeben, Höhen nur noch im Label
    k.seq.forEach((r) => {
      const mp = SK.moveParts(r[2]);
      if (!mp) {
        if (!/^(Kao |Jotai|Rechte|Linker|Rechter|Migi Ashi-jiku)/.test(r[2])) errors.push(`${id} ${r[0]}: Technik nicht aufgeteilt: ${r[2]}`);
        return;
      }
      const all = mp.l.concat(mp.r, mp.b, mp.f);
      if (!all.length) errors.push(`${id} ${r[0]}: keine Hand/kein Bein erkannt: ${r[2]}`);
      all.forEach((p) => {
        if (!p.t || /undefined/.test(p.t)) errors.push(`${id} ${r[0]}: leerer Teil: ${r[2]}`);
        if (/(^| )(Jodan|Chudan|Gedan)( |$)/.test(p.t) && p.t !== { J: 'Jodan', C: 'Chudan', G: 'Gedan' }[p.h]) errors.push(`${id} ${r[0]}: Höhe doppelt im Text „${p.t}“`);
        if (/\b(Hidari|Migi)$/.test(p.t)) errors.push(`${id} ${r[0]}: Seitenangabe ohne Technik „${p.t}“`);
      });
    });
  }

  // Kata-Ansage: Zeitplan mit allen Bewegungen, Zeiten steigend, Zählwörter vorhanden
  SK.ansageKata().forEach((id) => {
    const k = SK.kata[id];
    if (!k.ansage.kana) errors.push(`${id}: Ansage ohne Namen (Kana)`);
    // Bodenkarte: je Bewegung zwei Füße mit Zahlen, Richtungen in Grad, Drehungen in Achteln (Diagonalen), höchstens eine ganze Drehung
    const a = k.ansage;
    if (!a.page || !Array.isArray(a.lines)) errors.push(`${id}: Bodenkarte ohne Buchseite oder Linien`);
    if (!a.moves || a.moves.length !== k.moves) errors.push(`${id}: Bodenkarte hat ${a.moves ? a.moves.length : 0} statt ${k.moves} Stellungen`);
    [a.rei, a.yoi, a.naore, a.end].concat(a.moves || []).forEach((p, i) => {
      const ok = p && p.f && p.f.length === 2 && p.f.every((f) => f.length === 4 && f.every(Number.isFinite)) && Number.isFinite(p.body) && p.h;
      if (!ok) errors.push(`${id}: Stellung ${i} unvollständig`);
      else if (p.turn && (p.turn % 45 || Math.abs(p.turn) > 360)) errors.push(`${id}: Stellung ${i} Drehung ${p.turn}`);
      else if (p.via && !(p.via.length === 4 && [0, 1].includes(p.via[0]) && p.via.every(Number.isFinite))) errors.push(`${id}: Stellung ${i} Zwischenstellung unvollständig`);
    });
    // Saubere Stände: Kiba- und Heisoku-dachi mit parallelen Füßen, Musubi-dachi mit Spitzen ±30°
    const sp = SK.ansagePoses(k);
    [['Musubi-dachi', sp.rei], ['Musubi-dachi', sp.end]].concat(sp.moves.map((p, n) => [k.seq[n][1], p])).forEach(([st, p], n) => {
      const [l, r] = p.f.map((f) => f[2]);
      if (/kiba|heisoku/i.test(st) && l !== r) errors.push(`${id}: Stellung ${n} ${st} – Füße nicht parallel`);
      if (/musubi/i.test(st) && (r - l + 360) % 360 !== 60) errors.push(`${id}: Stellung ${n} ${st} – Spitzen nicht ±30°`);
    });
    [true, false].flatMap((frame) => SK.ansageBeats.map((beat) => [frame, beat])).forEach(([frame, beat]) => {
      const tl = SK.ansageTimeline(k, beat, frame);
      const moves = tl.filter((s) => s.kind === 'move');
      if (moves.length !== k.moves) errors.push(`${id}: Ansage hat ${moves.length} statt ${k.moves} Bewegungen`);
      tl.forEach((s, i) => {
        if (i && !(s.t > tl[i - 1].t)) errors.push(`${id}: Ansage-Zeit ${i} nicht steigend`);
        if (!s.kana || !s.say || !s.ro) errors.push(`${id}: Ansage ${i} ohne Zählwort`);
        if (s.kind === 'move' && s.ro !== SK.ansageCount(((s.n - 1) % 10) + 1).ro) errors.push(`${id}: Bewegung ${s.n} nicht bis 10 gezählt`);
        // „Stand bleibt“: kein Fuß darf auf der Karte wandern
        if (s.kind === 'move' && /^(Langsam: )?Stand bleibt/.test(s.pose.h) && s.pose.f.some((f, j) => f.slice(0, 3).some((v, m) => v !== s.prev.f[j][m]))) errors.push(`${id}: Bewegung ${s.n} – Stand bleibt, Füße wandern`);
      });
    });
  });

  // Begriffe-Trainer: Die Quiz-Bedeutung darf den Namen nicht verraten (kein eigener Namensteil außer Gattungswörtern).
  {
    const GATTUNG = new Set(['dachi', 'zuki', 'geri', 'uchi', 'uke', 'kamae', 'barai', 'ashi']);
    const words = (x) => x.toLowerCase().split(/[^a-zäöüß]+/).filter((w) => w.length >= 3);
    SK.glossary.forEach((e) => {
      const dw = words(e.qde);
      const leak = words(e.t).filter((w) => !GATTUNG.has(w) && dw.some((d) => d.startsWith(w)));
      if (leak.length) errors.push(`Begriffe-Trainer „${e.t}“: Bedeutung verrät den Namen (${leak.join(', ')}) – Quiz-Text in QUIZ (data/glossary.js) ergänzen`);
    });
  }

  // Lexikon: erstes Vorkommen in den Kata (SK.glossaryErst) – Bewegung nennt die Technik, keine frühere Bewegung tut es
  {
    const norm = (x) => x.toLowerCase().replace(/-/g, '');
    const has = (txt, name) => norm(name).split(/\s+/).every((w) => norm(txt).split(/[^a-z]+/).some((t) => t.includes(w)));
    const text = (e, r) => (e.cat === 'stand' ? r[1] : `${r[2]} ${r[4] || ''}`);
    const names = new Set(SK.glossary.map((e) => e.t));
    Object.keys(SK.glossaryErst).forEach((t) => { if (!names.has(t)) errors.push(`Lexikon-Erstvorkommen: „${t}“ gibt es im Lexikon nicht`); });
    SK.glossary.filter((e) => e.erst).forEach((e) => {
      const z = e.erst, k = SK.kata[z.kata];
      const r = k && k.seq[z.n - 1];
      if (!r) return errors.push(`Lexikon „${e.t}“: ${z.kata} ${z.n} gibt es nicht`);
      if (!lessons.has(SK.kataMoveLesson(z.kata, z.n))) errors.push(`Lexikon „${e.t}“: Lektion ${SK.kataMoveLesson(z.kata, z.n)} fehlt`);
      const name = z.wort || z.buch || e.t;
      if (!has(text(e, r), name)) errors.push(`Lexikon „${e.t}“: ${k.name} ${z.n} enthält „${name}“ nicht`);
      if (z.wort) return;
      for (const id of SK.kataOrder) {
        if (id === z.kata) {
          const fr = SK.kata[id].seq.find((x) => x[0] < z.n && has(text(e, x), name));
          if (fr) errors.push(`Lexikon „${e.t}“: kommt schon in ${SK.kata[id].name} ${fr[0]} vor`);
          break;
        }
        const fr = SK.kata[id].seq.find((x) => has(text(e, x), name));
        if (fr) { errors.push(`Lexikon „${e.t}“: kommt schon in ${SK.kata[id].name} ${fr[0]} vor`); break; }
      }
    });
  }
  for (let n = 1; n <= 65; n++) {
    const c = SK.ansageCount(n);
    if (!c.kana || !c.kan || /undefined/.test(Object.values(c).join())) errors.push(`Zählwort ${n} fehlerhaft`);
  }

  const ids = new Set();
  const perUnit = {};
  for (const q of SK.questions) {
    if (ids.has(q.id)) errors.push(`doppelte ID ${q.id}`);
    ids.add(q.id);
    const u = lessons.get(q.lesson);
    if (!u) { errors.push(`${q.id}: Lektion ${q.lesson} fehlt`); continue; }
    perUnit[u.title] = (perUnit[u.title] || 0) + 1;
    if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`${q.id}: zu wenige Optionen`);
    if (new Set(q.options).size !== q.options.length) errors.push(`${q.id}: doppelte Optionen: ${q.options.join(' | ')}`);
    if (q.type === 'mc' && !(q.answer >= 0 && q.answer < q.options.length)) errors.push(`${q.id}: answer ungültig`);
    if (q.type === 'mc' && q.options.length < 3) errors.push(`${q.id}: nur ${q.options.length} Optionen`);
    if (q.type === 'multi' && (!q.answer.length || q.answer.some((i) => i >= q.options.length))) errors.push(`${q.id}: multi answer ungültig`);
    if (q.type === 'order' && q.options.length < 3) errors.push(`${q.id}: order zu kurz`);
    if (u.kind === 'kata' && !/, (S\. [\divx]|Vorwort)/.test(q.src)) errors.push(`${q.id}: Kata-Frage ohne Buchseitenangabe (${q.src})`);
    if (q.g && SK.gradeIndex(q.g) < 0) errors.push(`${q.id}: unbekannter Grad ${q.g}`);
  }

  // Prüfungsprogramm: jede Seite braucht Kihon, Kata und Kumite; Kata-Verweise müssen im Buch existieren
  SK.grades.concat([SK.higherDan]).forEach((g) => {
    if (!g.kihon || !g.kihon.items.length || g.kihon.items.some((l) => !Array.isArray(l) || !l.length || l.some((t) => typeof t !== 'string' || !t))) errors.push(`${g.id}: Kihon unvollständig`);
    if (!g.kataProg || !g.kataProg.items.length) errors.push(`${g.id}: Kata fehlt`);
    if (!g.kumite || !g.kumite.form || !(g.kumite.angriff || g.kumite.text)) errors.push(`${g.id}: Kumite unvollständig`);
    (g.kata || []).forEach((k) => { if (!lessons.has(`${k}-ueberblick`)) errors.push(`${g.id}: Kata ${k} nicht im Kata-Wissen`); });
    ((g.kihon && g.kihon.ref) || []).forEach((id) => { if (SK.gradeIndex(id) < 0) errors.push(`${g.id}: Verweis auf unbekannten Grad ${id}`); });
  });

  SK.idCollisions.forEach((id) => errors.push(`${id}: gleiche Frage mit gleicher Lösung mehrfach in der Lektion`));

  // Jede Grafik im Lexikon und in den Lektionen hat ein Bild: 3D-Figur oder SVG-Grafik
  const hasPic = (key) => SK.fig3d.known(key) || !!SK.gfx.byKey(key);
  SK.glossary.forEach((e) => e.img && !hasPic(e.img.key) && errors.push(`Lexikon ${e.t}: weder 3D-Figur noch Grafik (${e.img.key})`));
  units.forEach((u) => u.lessons.forEach((l) => {
    const html = String(l.learn || '');
    (html.match(/data-gfx="[^"]+"/g) || []).map((m) => m.slice(10, -1)).forEach((key) => !hasPic(key) && errors.push(`${l.id}: weder 3D-Figur noch Grafik (${key})`));
  }));

  // Keine SVG-Grafik als Rückfall: wo es eine 3D-Figur gibt, gibt es kein SVG (ohne WebGL 2 bleibt das Bild leer).
  // Ausnahmen, weil das SVG etwas anderes zeigt: Fußbilder der Stände (st:) und Körperwaffen, die das Quiz als SVG zeigt.
  const SVG_NEBEN_3D = /^(st:|wp:(hiji|hiza|zenwan)$)/;
  Object.keys(SK.fig3dDefs || {}).forEach((key) => {
    if (!SVG_NEBEN_3D.test(key) && SK.gfx.byKey(key)) errors.push(`${key}: SVG-Grafik neben der 3D-Figur – Rückfall-SVGs gibt es nicht mehr (CLAUDE.md, 3D-Figuren)`);
  });

  // 3D-Figuren: jede Pose rechenbar, Standfüße erreichen ihren Platz
  const F3 = window.Figur3D;
  Object.entries(SK.fig3dDefs || {}).forEach(([key, d]) => {
    const tl = F3.timeline(d.keys);
    for (let i = 0; i <= 10; i++) {
      const P = tl(i / 10);
      const J = F3.solve(P);
      if (/null|NaN/.test(JSON.stringify(J))) { errors.push(`3D ${key}: ungültige Werte bei t=${i / 10}`); break; }
      ['L', 'R'].forEach((s) => {
        const a = J['ankle' + s];
        if (P[s].y < 0.1 && Math.hypot(a[0] - P[s].x, a[1] - P[s].y, a[2] - P[s].z) > 0.02) errors.push(`3D ${key}: Standfuß ${s} unerreichbar bei t=${i / 10}`);
      });
    }
    if (d.eff && !(d.eff in F3.solve(tl(0)))) errors.push(`3D ${key}: unbekannter Bahnpunkt ${d.eff}`);
    if (d.hit && !(d.hit.at in F3.solve(tl(0)))) errors.push(`3D ${key}: unbekannter Trefferpunkt ${d.hit.at}`);
    // Trefferfläche: bekannt und in jedem Bild als Punkt auf der richtigen Seite rechenbar
    if (d.hit && d.hit.fl) {
      const e = SK.fig3d.entry(key);
      for (let i = 0; i <= 10; i++) {
        const sp = SK.fig3d.spots(e, F3.solve(tl(i / 10)));
        if (!sp || sp.length !== d.hit.sides.length || /null|NaN/.test(JSON.stringify(sp))) { errors.push(`3D ${key}: Trefferfläche ${d.hit.fl} nicht rechenbar`); break; }
      }
    }
  });
  out.push(`3D-Figuren: ${Object.keys(SK.fig3dDefs || {}).length}`);

  out.push(`Fragen gesamt: ${SK.questions.length}`);
  out.push(`Kata-Fragen: ${SK.questions.filter((q) => lessons.get(q.lesson) && lessons.get(q.lesson).kind === 'kata').length}`);
  out.push(`Typen: ${['mc', 'multi', 'order'].map((t) => `${t}=${SK.questions.filter((q) => q.type === t).length}`).join(', ')}`);
  Object.entries(perUnit).forEach(([k, v]) => out.push(`  ${k}: ${v}`));
  out.push(`Kata-Ansage: ${SK.ansageKata().join(', ')}`);
  out.push(`Prüfungsprogramm: ${SK.grades.map((g) => `${g.id} ${g.kihon.items.length} Kihon`).join(', ')}`);
  out.push('');
  out.push(errors.length ? `FEHLER (${errors.length}):\n${errors.join('\n')}` : 'OK – keine Fehler');
  document.getElementById('out').textContent = out.join('\n');
  // Fertig-Markierung für tools/test/run.js
  document.documentElement.dataset.ergebnis = errors.length ? 'fehler' : 'ok';
})();
