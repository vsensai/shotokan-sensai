/* Klickt automatisch durch Prüfungsseiten und Lektionen und protokolliert Fehler. Nur für lokale Tests. */
(function () {
  'use strict';
  const log = [];
  const app = document.getElementById('app');
  const wait = () => new Promise((r) => setTimeout(r, 20));

  async function answerAll(correctly) {
    for (let guard = 0; guard < 100; guard++) {
      const card = app.querySelector('.quiz-card');
      if (!card) return;
      const opts = [...app.querySelectorAll('.option')];
      if (opts.length) {
        opts[0].click();
        if (correctly) {
          opts.forEach((o) => o.classList.contains('selected') && o.click());
          const q = SK.questions.find((x) => x.q === card.querySelector('.quiz-q').textContent);
          const right = q.type === 'mc' ? [q.answer] : q.answer;
          opts.forEach((o) => right.includes(Number(o.dataset.i)) && o.click());
        }
      } else {
        const q = SK.questions.find((x) => x.q === card.querySelector('.quiz-q').textContent);
        for (let i = 0; i < q.options.length; i++) {
          const chip = [...app.querySelectorAll('.order-pool .chip')].find((c) => (correctly ? c.textContent === q.options[i] : true));
          chip.click();
        }
      }
      app.querySelector('.quiz-footer .btn.primary').click();
      const next = app.querySelector('.quiz-footer .btn.primary');
      if (next && app.querySelector('.feedback')) next.click();
    }
  }

  async function run() {
    try {
      // Startseite in index.html (sofort sichtbar) muss zu viewStart() passen.
      if (location.protocol === 'file:') log.push('Startseite in index.html: übersprungen (file://)');
      else {
        const doc = new DOMParser().parseFromString(await (await fetch('../../index.html')).text(), 'text/html');
        const norm = (n) => (n ? n.outerHTML.replace(/>\s+</g, '><').replace(/\s+/g, ' ') : 'FEHLT');
        const same = ['.hero', '.tiles', '.version'].every((s) => norm(doc.querySelector(`#app > ${s}`)) === norm(app.querySelector(`:scope > ${s}`)));
        log.push(`Startseite in index.html: ${same ? 'gleich wie viewStart()' : 'FEHLER'}`);
        if (!same) throw new Error('Startseite in index.html weicht von viewStart() in js/app.js ab');
      }
      for (const g of SK.grades.concat([SK.higherDan])) {
        location.hash = `#/exam/${g.id}`;
        await wait();
        const tabs = [...app.querySelectorAll('.tabs .tab')];
        const filled = tabs.map((t) => (t.click(), app.querySelector('.program').textContent.length > 20));
        log.push(`Prüfungsseite ${g.id}: ${tabs.map((t) => t.textContent).join('/')}${filled.every(Boolean) ? '' : ' – FEHLER: leerer Reiter'}`);
        if (!filled.every(Boolean)) throw new Error(`leerer Reiter bei ${g.id}`);
        if (app.querySelector('.quiz-card, .actions .btn.primary')) throw new Error(`Quiz-Knopf auf Prüfungsseite ${g.id}`);
      }
      for (const id of ['et-dojo', 'heian-shodan-ueberblick', 'gl-stand', 'gl-waffe', 'gl-ashi', 'da-ashi']) {
        location.hash = `#/quiz/${id}`;
        await wait();
        await answerAll(true);
        const score = app.querySelector('.result .score');
        log.push(`Lektion ${id}: ${score ? score.textContent : 'FEHLT'}`);
      }
      // Ohne Freischalten: auch die letzte Kata-Lektion ist sofort spielbar.
      location.hash = '#/quiz/kanku-dai-ablauf';
      await wait();
      if (!app.querySelector('.quiz-card')) throw new Error('kanku-dai-ablauf nicht direkt spielbar');
      await answerAll(true);
      const lastScore = app.querySelector('.result .score');
      log.push(`Lektion kanku-dai-ablauf: ${lastScore ? lastScore.textContent : 'FEHLT'}`);
      for (const scope of ['alle', 'kata', 'begriffe']) {
        location.hash = `#/zufall/${scope}`;
        await wait();
        const before = app.querySelector('.card b').textContent;
        app.querySelector('.actions .btn.primary').click();
        await answerAll(true);
        location.hash = `#/zufall/${scope}/x`;
        await wait();
        location.hash = `#/zufall/${scope}`;
        await wait();
        log.push(`Zufall ${scope}: vorher ${before}, nachher ${app.querySelector('.card b').textContent} ungestellt`);
      }
      for (const h of ['#/', '#/exam', '#/wissen', '#/wissen/da-kampf', '#/wissen/da-ashi', '#/kompakt', '#/kompakt/5kyu', '#/wissen/heian-godan-b17', '#/ansage', '#/ansage/heian-sandan', '#/lexikon', '#/begriffe', '#/stats']) {
        location.hash = h;
        await wait();
        log.push(`Seite ${h}: ${app.querySelector('h1') ? app.querySelector('h1').textContent : 'FEHLT'}`);
      }
      // Kata-Trainer, Ansicht „Figur“: nur bei freigegebenen Kata; umschalten, weiterschalten, zählen lassen, zurück zur Karte
      {
        location.hash = '#/ansage/heian-nidan';
        await wait();
        if (app.querySelector('.ans-view')) throw new Error('Kata-Trainer: Ansicht „Figur“ bei einer nicht freigegebenen Kata');
        location.hash = '#/ansage/heian-shodan';
        await wait();
        const sw = app.querySelector('.ans-view');
        if (!window.Figur3D.ok()) log.push('Kata-Figur: übersprungen (kein WebGL 2)');
        else {
          if (!sw) throw new Error('Kata-Trainer: Umschalter Karte/Figur fehlt bei Heian Shodan');
          const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          sw.querySelector('[data-view=figur]').click();
          await frame();
          const cv = app.querySelector('.ans-fig-cv');
          if (app.querySelector('.ans-fig').hidden || !app.querySelector('.ans-map-svg').hidden || !(cv.width > 100)) throw new Error('Kata-Trainer: Figur erscheint nicht');
          const lit = () => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 3; i < d.length; i += 400) if (d[i]) n++; return n; };
          if (!lit()) throw new Error('Kata-Trainer: Bild der Figur ist leer');
          if (!app.querySelector('.ans-wrap').classList.contains('ans-wide')) throw new Error('Kata-Trainer: Figur bekommt nicht die breite Ansicht');
          if (document.fullscreenEnabled && !app.querySelector('.ans-map .ans-fs')) throw new Error('Kata-Trainer: Vollbild-Knopf auf dem Bild fehlt');
          app.querySelector('.ans-controls .btn:last-child').click();
          app.querySelector('.ans-fig-cam').click();
          app.querySelector('.ans-play').click();
          await frame();
          app.querySelector('.ans-play').click();
          if (!lit()) throw new Error('Kata-Trainer: Bild der Figur ist beim Zählen leer');
          sw.querySelector('[data-view=karte]').click();
          if (!app.querySelector('.ans-fig').hidden || !app.querySelector('.ans-map-svg svg')) throw new Error('Kata-Trainer: zurück zur Karte klappt nicht');
          if (app.querySelector('.ans-wrap').classList.contains('ans-wide')) throw new Error('Kata-Trainer: Karte bleibt in der breiten Ansicht');
          sw.querySelector('[data-view=beide]').click();
          await frame();
          if (app.querySelector('.ans-fig').hidden || app.querySelector('.ans-map-svg').hidden || !app.querySelector('.ans-map-svg svg') || !app.querySelector('.ans-both')) throw new Error('Kata-Trainer: Karte und Figur nebeneinander klappt nicht');
          if (!lit()) throw new Error('Kata-Trainer: Bild der Figur ist neben der Karte leer');
          // Zoom: Start mit dem ganzen Bereich (− gesperrt), + geht näher heran
          const zm = app.querySelector('.ans-fig-zoom [data-zoom="-1"]');
          const zp = app.querySelector('.ans-fig-zoom [data-zoom="1"]');
          if (!zm.disabled || zp.disabled) throw new Error('Kata-Trainer: Zoom beginnt nicht mit dem ganzen Bereich');
          zp.click();
          if (zm.disabled) throw new Error('Kata-Trainer: Zoom + wirkt nicht');
          sw.querySelector('[data-view=karte]').click();
          log.push(`Kata-Figur: ${app.querySelector('.ans-fig-cam').textContent}, ${cv.width}×${cv.height}`);
        }
      }
      // Lexikon-Karte: Aussprache-Knopf und „Kommt vor in …“; die Stelle öffnet den Kata-Trainer bei dieser Bewegung
      {
        const e = SK.glossary.find((x) => x.t === 'Shuto-uke');
        const card = new DOMParser().parseFromString(SK.glossaryHtml([e]), 'text/html');
        const link = card.querySelector('.lex-vor a');
        if (!card.querySelector('.lex-sag[data-kana]') || !link) throw new Error('Lexikon-Karte ohne Aussprache oder „Kommt vor in“');
        location.hash = link.getAttribute('href');
        await wait();
        const pos = app.querySelector('.ans-pos');
        const n = link.getAttribute('href').split('/').pop();
        if (!pos || !pos.textContent.startsWith(`${n}/`)) throw new Error(`Kata-Trainer öffnet nicht bei Bewegung ${n}`);
        if (!/Shuto/.test(app.querySelector('.ans-tech').textContent)) throw new Error('Kata-Trainer: Stelle nennt die Technik nicht');
        log.push(`Kommt vor in: ${link.getAttribute('href')} → ${pos.textContent}`);
      }
      // Karteikarten (Bild → Name): vorn das Bild mit Kurzbeschreibung (kein Name), auf der Rückseite Name und Bedeutung.
      // Eine Karte „nicht gewusst“ (kommt in der Runde wieder), alle anderen „gewusst“; zählt im Karteikasten der Bildfrage (gl-…-c)
      {
        // Vergleich mit dem Stand davor: Zufallsmix und Begriffe-Quiz weiter oben können dieselben Fragen schon gestellt haben
        const before = JSON.parse(JSON.stringify(SK.store.data.srs));
        const answered0 = SK.store.data.answered;
        location.hash = '#/karten/geri';
        await wait();
        const geri = SK.glossary.filter((e) => e.cat === 'geri');
        const names = geri.map((e) => e.t);
        let cards = 0;
        for (let guard = 0; guard < 100 && app.querySelector('.kk'); guard++) {
          const karte = app.querySelector('.kk-karte');
          const vorn = karte.querySelector('.kk-vorn');
          const hinten = karte.querySelector('.kk-hinten');
          if (karte.dataset.seite !== 'vorn' || vorn.classList.contains('kk-weg') || !hinten.classList.contains('kk-weg')) throw new Error('Karteikarte beginnt nicht mit der Vorderseite');
          if (!vorn.querySelector('.kk-bild .f3d, .kk-bild svg')) throw new Error('Karteikarte ohne Bild');
          if (names.some((t) => vorn.textContent.includes(t)) || app.querySelector('.kk-ja')) throw new Error(`Karteikarte verrät vorn die Lösung: ${vorn.textContent}`);
          const hinweis = vorn.querySelector('.kk-hinweis');
          const begriff = geri.find((e) => e.t === hinten.querySelector('.kk-loesung h4').textContent.split(' (')[0].trim());
          if (!hinweis || !begriff || hinweis.textContent !== SK.glossaryKurz(begriff)) throw new Error('Karteikarte ohne Kurzbeschreibung unter dem Bild');
          app.querySelector('.kk-um').click();
          const h4 = hinten.querySelector('.kk-loesung h4');
          if (karte.dataset.seite !== 'hinten' || !h4 || !names.includes(h4.textContent.split(' (')[0].trim()) || !hinten.querySelector('.kk-loesung p')) throw new Error('Karteikarte ohne Rückseite');
          app.querySelector(cards++ ? '.kk-ja' : '.kk-nein').click();
        }
        const head = app.querySelector('.result h2');
        const changed = Object.entries(SK.store.data.srs).filter(([id, v]) => JSON.stringify(v) !== JSON.stringify(before[id]));
        const bad = changed.filter(([, v]) => v.due === SK.util.today()).length;
        if (!head || !/auf Anhieb gewusst/.test(head.textContent)) throw new Error('Karteikarten ohne Auswertung');
        if (cards !== 16 || changed.length !== 15 || bad !== 1 || !changed.every(([id]) => /^gl-.*-c$/.test(id)) || SK.store.data.answered !== answered0) throw new Error(`Karteikarten: ${cards} Karten, ${changed.length} im Karteikasten gezählt, ${bad} nicht gewusst`);
        log.push(`Karteikarten: ${head.textContent}`);
        // Andere Richtung (Name → Bild): vorn nur der Name, hinten Bild und Bedeutung; zählt bei „Was ist …?“ (gl-…-a).
        // Die Drehung selbst läuft als Animation – hier warten, bis die Rückseite wirklich sichtbar ist, und zurückdrehen.
        location.hash = '#/karten/stand';
        await wait();
        app.querySelector('.kk-richtung').click();
        const karte = app.querySelector('.kk-karte');
        const vorn = karte.querySelector('.kk-vorn');
        const hinten = karte.querySelector('.kk-hinten');
        const wort = vorn.querySelector('.kk-wort');
        const e = wort && SK.glossary.find((x) => x.t === wort.textContent);
        if (!e || vorn.querySelector('.kk-bild') || vorn.textContent.includes(e.de)) throw new Error('Karteikarte Name → Bild: Vorderseite zeigt nicht nur den Namen');
        if (!hinten.querySelector('.kk-bild') || !hinten.textContent.includes(e.de)) throw new Error('Karteikarte Name → Bild: Rückseite ohne Bild oder Bedeutung');
        const sichtbar = (n) => !n.classList.contains('kk-weg');
        const bis = async (test) => { for (let i = 0; i < 500 && !test(); i++) await wait(); return test(); };
        app.querySelector('.kk-um').click();
        if (!(await bis(() => sichtbar(hinten) && !sichtbar(vorn)))) throw new Error('Karteikarte dreht nicht um');
        app.querySelector('.kk-footer .gfx-btn.kk-um').click();
        if (!(await bis(() => sichtbar(vorn) && !sichtbar(hinten)))) throw new Error('Karteikarte dreht nicht zurück');
        const srsA = `${SK.glossaryId(e)}-a`;
        const vorher = JSON.stringify(SK.store.data.srs[srsA]);
        app.querySelector('.kk-ja').click();
        if (JSON.stringify(SK.store.data.srs[srsA]) === vorher) throw new Error('Karteikarte Name → Bild zählt nicht bei „Was ist …?“');
        log.push(`Karteikarten Name → Bild: ${e.t} umgedreht und gezählt`);
      }
      location.hash = '#/review';
      await wait();
      log.push(`Wiederholung fällig: ${SK.srs.due().length}`);
      const d = SK.store.data;
      log.push(`Beantwortet ${d.answered}, richtig ${d.correct}`);
      // Umzug Datenversion 1 → 2: alte laufende Nummern zeigen danach auf dieselbe Frage.
      const old = { version: 1, srs: { 'et-dojo-1': { b: 3, due: '2026-01-01', w: 0 }, 'gl-zenkutsu-dachi-a': { b: 2, due: '2026-01-01', w: 0 } }, asked: { 'et-dojo-2': 1, 'heian-shodan-ueberblick-1': 1 } };
      const m = SK.store.migrate(old);
      const byId = (id) => (SK.questions.find((q) => q.id === id) || {}).q;
      const ok = m.version === 2
        && byId(Object.keys(m.srs)[0]) === 'Was bedeutet „Dojo“?'
        && m.srs['gl-zenkutsu-dachi-a'].b === 2
        && byId(Object.keys(m.asked)[0]) === 'Was bedeutet „Rei“?'
        && Object.keys(m.asked).every((id) => byId(id));
      log.push(`Umzug v1 → v2: ${ok ? 'OK' : `FEHLER ${JSON.stringify(m)}`}`);
      log.push('OK');
    } catch (e) {
      log.push(`FEHLER: ${e.message}\n${e.stack}`);
    }
    document.getElementById('log').textContent = log.join('\n');
    // Fertig-Markierung für tools/test/run.js
    document.documentElement.dataset.ergebnis = log[log.length - 1] === 'OK' ? 'ok' : 'fehler';
    localStorage.removeItem('shotokan-sensai-v1');
  }
  if (!window.SMOKE_LOCAL) {
    document.getElementById('log').textContent = 'Abgebrochen: Der Smoke-Test läuft nur lokal (file:// oder localhost), weil er den gespeicherten Fortschritt löscht.';
    return;
  }
  window.confirm = () => true;
  run();
})();
