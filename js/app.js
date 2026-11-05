/* Router und Ansichten: Wissen, Lexikon, Kompakt-Übersicht, Quiz-Lernpfad, Zufallsmix, Begriffe-Trainer, Wiederholung, Prüfungen, Kata-Ansage, Fortschritt, Datenschutz. */
(function () {
  'use strict';
  const { util, store } = SK;
  const { el } = util;
  const app = document.getElementById('app');
  const PASS_LESSON = 0.8;
  const ROUND = 10;

  // ---------- Aufbau ----------
  const kataUnits = SK.buildKataContent();
  const drillUnit = SK.buildGlossaryContent();
  const units = SK.generalUnits.concat(kataUnits, [drillUnit]);
  const lessonIndex = {};
  units.forEach((u) => u.lessons.forEach((l, i) => (lessonIndex[l.id] = { unit: u, lesson: l, idx: i })));
  const allLessons = units.flatMap((u) => u.lessons);
  // Unter „Lernen“ nur Lerninhalte; der Begriffe-Trainer ist ein Quiz.
  const learnLessons = SK.generalUnits.concat(kataUnits).flatMap((u) => u.lessons);
  const qByLesson = {};
  SK.questions.forEach((q) => (qByLesson[q.lesson] = qByLesson[q.lesson] || []).push(q));
  const qById = Object.fromEntries(SK.questions.map((q) => [q.id, q]));
  const unitOf = (q) => lessonIndex[q.lesson] && lessonIndex[q.lesson].unit;

  store.load();

  // ---------- Hilfen ----------
  const lessonState = (id) => store.data.lessons[id] || null;
  const passed = (id) => !!(lessonState(id) && lessonState(id).passed);
  function unitProgress(u) {
    return { done: u.lessons.filter((l) => passed(l.id)).length, total: u.lessons.length };
  }
  // Höchstens eine Frage je Gruppe (z. B. derselbe Begriff); weitere nur, wenn sonst zu wenige da sind.
  function distinct(list, n) {
    const seen = new Set();
    const first = [];
    const rest = [];
    list.forEach((q) => {
      const g = q.grp || q.id;
      (seen.has(g) ? rest : first).push(q);
      seen.add(g);
    });
    return first.concat(rest).slice(0, n);
  }
  // Neue und fällige Fragen zuerst, bereits sicher beantwortete zuletzt.
  function pickRound(list, n) {
    const t = util.today();
    const scored = list.map((q) => {
      const s = store.data.srs[q.id];
      const w = !s ? 6 : s.due <= t ? 7 - s.b : 5 - s.b;
      return { q, w: w + Math.random() * 2 };
    });
    scored.sort((a, b) => b.w - a.w);
    return util.shuffle(distinct(scored.map((s) => s.q), n));
  }
  function setTitle(t) {
    document.title = t ? `${t} – Shotokan SensAI` : 'Shotokan SensAI';
  }
  function setNav(name) {
    document.querySelectorAll('.bottombar a').forEach((a) => a.classList.toggle('active', a.dataset.nav === name));
  }
  function finishView() {
    app.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    app.scrollTop = 0;
  }
  // Gleiche Adresse löst kein hashchange aus – dann direkt neu rendern.
  function go(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }

  // ---------- Start ----------
  // Tuschefilter für den Leitspruch und rote Spritzer oben rechts.
  const HERO_DEKO = `<svg class="hero-filter" width="0" height="0">
      <filter id="hero-tusche"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="7" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="5" result="d"/><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.35" result="m"/><feComposite in="d" in2="m" operator="in"/></filter>
      <filter id="hero-pinsel"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="2"/><feDisplacementMap in="SourceGraphic" scale="2.5"/></filter>
    </svg>
    <svg class="hero-spritzer" viewBox="0 0 120 80"><circle cx="86" cy="30" r="20"/><circle cx="64" cy="20" r="4"/><circle cx="58" cy="44" r="2.5"/><circle cx="108" cy="54" r="3.2"/><circle cx="100" cy="10" r="2"/></svg>`;

  function viewStart() {
    setNav('');
    setTitle('');
    app.innerHTML = '';
    // Kurzer Text fürs Handy (alles ohne Scrollen), ausführlicher ab 1100 px
    const tile = (href, title, kurz, lang) =>
      el('a', { class: 'tile', href }, el('h3', { text: title }), el('p', null, el('span', { class: 'kurz', text: kurz }), el('span', { class: 'lang', text: lang })));
    app.append(
      el(
        'section',
        { class: 'hero' },
        el('div', { class: 'hero-deko', 'aria-hidden': 'true', html: HERO_DEKO }),
        el('h1', null, el('span', { class: 'hero-kanji', lang: 'ja', text: '一期一会' }), el('span', { class: 'hero-romaji', text: 'Ichi-go ichi-e' })),
      ),
      el(
        'div',
        { class: 'tiles' },
        tile('#/lexikon', 'Lexikon', 'Alle Stände, Techniken & Begriffe zum Nachschlagen', 'Alle Stände, Techniken & Begriffe mit Grafik und 3D-Figur – zum Nachschlagen und Suchen'),
        tile('#/wissen', 'Lernen', 'Alle Inhalte zum Durcharbeiten', 'Alle Themen zum Durcharbeiten – von den Grundlagen bis zu den Kata'),
        tile('#/quiz', 'Quiz', 'Alle Lektionen als Quiz, Zufallsmix aus allen Fragen', 'Jede Lektion als eigenes Quiz oder ein Zufallsmix aus allen Fragen'),
        tile('#/ansage', 'Kata-Trainer', 'Alle Kata – Embusen und Schrittfolgen', 'Alle Kata mit Embusen und Schrittfolge – Bewegung für Bewegung auf der Bodenkarte'),
        tile('#/exam', 'Prüfungen', 'DJKB-Prüfungsprogramm: Kihon, Kata, Kumite', 'DJKB-Prüfungsprogramm je Gürtel: Kihon, Kata und Kumite')
      ),
      versionLine()
    );
    finishView();
    hint3d();
  }

  // Ohne WebGL 2 keine 3D-Figuren: die Bilder bleiben leer, die Startseite sagt warum.
  // Erst nach dem Zeichnen prüfen, damit der Start schnell bleibt (nicht in index.html, weil abhängig vom Gerät).
  function hint3d() {
    setTimeout(() => {
      const tiles = app.querySelector(':scope > .tiles');
      if (!tiles || !SK.fig3d || SK.fig3d.ok() || app.querySelector(':scope > .hint-3d')) return;
      tiles.after(el('p', { class: 'hint-3d', role: 'note', text: 'Dein Browser kann keine 3D-Grafik (WebGL 2) anzeigen – die Bilder der Techniken bleiben leer. Ein aktueller Browser oder eingeschaltete Hardwarebeschleunigung hilft.' }));
    }, 0);
  }

  function versionLine() {
    return el(
      'p',
      { class: 'version' },
      `Version ${SK.VERSION} · Stand ${SK.VERSION_DATE}, ${SK.VERSION_TIME} Uhr · `,
      el('a', { href: '#/datenschutz', text: 'Datenschutz' })
    );
  }

  // ---------- Lernen ----------
  function viewWissenList() {
    setNav('wissen');
    setTitle('Lernen');
    app.innerHTML = '';
    app.append(
      el('h1', { text: 'Lernen' }),
      el('p', { class: 'muted', text: 'Alle Themen zum Nachlesen – von den Grundlagen bis zu den Kata.' })
    );
    const section = (title, list, note) => {
      const wrap = el('section', { class: 'unit-section' }, el('h2', { text: title }), note ? el('p', { class: 'muted small', text: note }) : '');
      list.forEach((u) => {
        const read = u.lessons.filter((l) => store.data.read[l.id]).length;
        wrap.append(
          el(
            'details',
            { class: `unit ${u.kind}` },
            el('summary', { class: 'unit-head' }, el('div', {}, el('h3', { text: u.title }), el('p', { class: 'muted small', text: u.desc })), el('div', { class: 'ring', text: `${read}/${u.lessons.length}` })),
            el(
              'ol',
              { class: 'path' },
              u.lessons.map((l, i) =>
                el(
                  'li',
                  {},
                  el(
                    'a',
                    { class: `node ${store.data.read[l.id] ? 'done' : 'open'}`, href: `#/wissen/${l.id}` },
                    el('span', { class: 'dot', text: store.data.read[l.id] ? '✓' : String(i + 1) }),
                    el('span', { class: 'node-title', text: l.title }),
                    el('span', { class: 'node-meta', text: store.data.read[l.id] ? 'gelesen' : '' })
                  )
                )
              )
            )
          )
        );
      });
      return wrap;
    };
    app.append(
      section('Allgemeines Wissen', SK.generalUnits),
      section('Kata-Wissen', kataUnits, 'Ausschließlich aus „Karate-Do Kata Vol. 1“ (JKA), Hangetsu aus „Karate-Do Kata Vol. 2“.')
    );
    finishView();
  }

  function viewWissen(id) {
    const entry = lessonIndex[id];
    if (!entry) return viewNotFound();
    setNav('wissen');
    const { unit, lesson } = entry;
    setTitle(lesson.title);
    store.data.read[id] = 1;
    store.save();
    const pos = learnLessons.indexOf(lesson);
    const prev = pos > 0 ? learnLessons[pos - 1] : null;
    const next = pos >= 0 ? learnLessons[pos + 1] : null;
    const learn = el('div', { class: 'learn' });
    learn.innerHTML = lesson.learn;
    const n = (qByLesson[id] || []).length;
    app.innerHTML = '';
    app.append(
      el('nav', { class: 'crumbs' }, el('a', { href: '#/wissen', text: 'Lernen' }), ' › ', el('span', { text: unit.title })),
      el('h1', { text: lesson.title }),
      learn,
      el(
        'div',
        { class: 'actions' },
        n ? el('a', { class: 'btn primary', href: `#/quiz/${id}`, text: `Quiz zu diesem Thema (${n} Fragen)` }) : ''
      ),
      el(
        'nav',
        { class: 'pager' },
        prev ? el('a', { class: 'btn', href: `#/wissen/${prev.id}`, text: `‹ ${prev.title}` }) : el('span'),
        next ? el('a', { class: 'btn', href: `#/wissen/${next.id}`, text: `${next.title} ›` }) : el('span')
      )
    );
    finishView();
  }

  // arg: Begriff, mit dem das Lexikon öffnet (z. B. aus der Kata-Ansage). Bekannter Begriff: seine Kategorie
  // aufklappen und hinscrollen, sonst danach suchen.
  // Kategorien zum Aufklappen, immer nur eine offen; zugeklappte bauen keinen Inhalt (weniger Grafiken beim Scrollen).
  // Bei der Suche eine flache Trefferliste über alle Kategorien.
  function viewLexikon(arg) {
    setNav('lexikon');
    setTitle('Lexikon');
    app.innerHTML = '';
    const search = el('input', { type: 'search', class: 'search', enterkeyhint: 'search', placeholder: 'Suchen, z. B. „Kokutsu“ oder „Ferse“', 'aria-label': 'Lexikon durchsuchen' });
    // Bindestriche, Leerzeichen, Groß-/Kleinschreibung und Umlaute ignorieren: „mae geri“ findet „Mae-geri“.
    const norm = (s) => s.toLowerCase().replace(/ß/g, 'ss').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    const index = SK.glossary.map((e) => {
      const words = norm(`${e.t} ${SK.glossaryAlt(e)} ${e.erst ? e.erst.buch : ''} ${e.de}`);
      return { e, words };
    });
    // Eingabe ohne Leerzeichen („maegeri“) auch über Wortgrenzen finden – aber nur, wenn der Treffer an einem
    // Wortanfang beginnt oder an einem Wortende aufhört: „kosa“ soll nicht in „yo(ko sa)shi“ landen.
    const spans = (words, q) => {
      const re = new RegExp(q.split('').join(' ?'), 'y');
      for (let i = 0; i < words.length; i++) {
        re.lastIndex = i;
        const m = re.exec(words);
        if (m && (i === 0 || words[i - 1] === ' ' || re.lastIndex === words.length || words[re.lastIndex] === ' ')) return true;
      }
      return false;
    };
    const cats = SK.glossaryCats.map((c) => {
      const items = SK.glossary.filter((e) => e.cat === c.id);
      const body = el('div', { class: 'lex-cat-body' });
      // „Stände (Dachi)“ → deutscher Name groß, japanischer klein darunter
      const [, de, jp] = c.title.match(/^(.*?)\s*(?:\((.*)\))?$/);
      const det = el(
        'details',
        { class: 'lex-cat', name: 'lexikon', 'data-cat': c.id },
        el(
          'summary',
          {},
          el('span', { class: 'lex-cat-t' }, el('span', { class: 'lex-cat-de', text: de }), jp ? el('span', { class: 'lex-cat-jp', lang: 'ja-Latn', text: jp }) : ''),
          el('span', { class: 'lex-cat-n', text: String(items.length) })
        ),
        body
      );
      det.addEventListener('toggle', () => {
        if (!det.open) {
          body.innerHTML = '';
          return;
        }
        // Ältere Browser kennen details[name] nicht: die anderen selbst zuklappen
        cats.forEach((o) => o.det !== det && o.det.open && (o.det.open = false));
        if (!body.firstChild) body.innerHTML = SK.glossaryHtml(items);
        // Schließt sich eine Kategorie weiter oben, rutscht der Inhalt – die geöffnete an den Anfang holen
        requestAnimationFrame(() => {
          if (det.getBoundingClientRect().top < 0 || det.dataset.jump) det.scrollIntoView({ block: 'start' });
        });
      });
      return { c, det, items };
    });
    const catList = el('div', { class: 'lex-cats' }, cats.map((x) => x.det));
    const results = el('div', { hidden: true });
    const count = el('p', { class: 'muted small', hidden: true });
    let lastQuery = null;
    function filter() {
      const tokens = norm(search.value).split(' ').filter(Boolean);
      const q = tokens.join(' ');
      if (q === lastQuery) return;
      lastQuery = q;
      catList.hidden = !!tokens.length;
      results.hidden = count.hidden = !tokens.length;
      if (!tokens.length) {
        results.innerHTML = '';
        return;
      }
      const hits = index.filter((x) => spans(x.words, tokens.join('')) || tokens.every((t) => x.words.includes(t))).map((x) => x.e);
      count.textContent = hits.length === 1 ? '1 Eintrag' : `${hits.length} Einträge`;
      results.innerHTML = hits.length ? SK.glossaryHtml(hits) : '';
    }
    search.addEventListener('input', filter);
    // Handy-Tastaturen melden die Lupe zuverlässig nur als Formular-Submit, nicht als keydown.
    const form = el('form', { role: 'search', action: '#' }, search);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      filter();
      search.blur();
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      if (!count.hidden) count.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    // Link aus einer Karte (z. B. „Zuerst in: …“): vorher die Karte in die Adresse schreiben,
    // damit „Zurück“ wieder bei ihr landet statt bei zugeklappten Kategorien.
    const remember = (ev) => {
      const a = ev.target.closest('.lex-card a[href^="#/"]');
      const h4 = a && a.closest('.lex-card').querySelector('h4');
      if (h4) history.replaceState(history.state, '', `#/lexikon/${encodeURIComponent(h4.textContent.split(' / ')[0])}`);
    };
    catList.addEventListener('click', remember);
    results.addEventListener('click', remember);
    app.append(
      el('h1', { text: 'Lexikon' }),
      el('p', { class: 'small' }, el('a', { href: '#/kompakt', text: 'Kompakt-Übersicht (Spickzettel je Gürtel, druckbar) ›' })),
      form,
      count,
      results,
      catList
    );
    finishView();
    if (!arg) return;
    const key = norm(arg);
    const target = cats.find((x) => x.items.some((e) => e.t.split(' / ').some((n) => norm(n) === key)));
    if (!target) {
      search.value = arg;
      filter();
      return;
    }
    target.det.dataset.jump = '1';
    target.det.open = true;
    // toggle feuert asynchron: danach zur Karte scrollen und sie kurz hervorheben
    target.det.addEventListener('toggle', () => requestAnimationFrame(() => {
      delete target.det.dataset.jump;
      const card = [...target.det.querySelectorAll('.lex-card')].find((c) => c.querySelector('h4').textContent.split(' / ').some((n) => norm(n) === key));
      if (!card) return;
      card.scrollIntoView({ block: 'center' });
      card.classList.add('lex-hit');
    }), { once: true });
  }

  // ---------- Kompakt-Übersicht (Spickzettel) ----------
  // Ab welchem Grad ein Begriff im Prüfungsprogramm (Kihon, Kumite, Kata, Theorie) vorkommt
  let termGradeCache = null;
  function termGrades() {
    if (termGradeCache) return termGradeCache;
    const words = (t) => ` ${t.toLowerCase().replace(/empi/g, 'enpi').replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()} `;
    const abbr = (t) => t.replace(/\bZk\b/g, 'Zenkutsu-dachi').replace(/\bKk\b/g, 'Kokutsu-dachi').replace(/\bKb\b/g, 'Kiba-dachi');
    const map = {};
    SK.grades.forEach((g) => {
      const txt = words(abbr(JSON.stringify([g.kihon, g.kumite, g.kataProg, g.theory])));
      SK.glossary.forEach((e) => {
        if (map[e.t]) return;
        const names = e.t.split(/\s*\/\s*|\s*\(|\)/).map((n) => n.trim()).filter((n) => n.length > 2);
        if (names.some((n) => txt.includes(words(n)))) map[e.t] = g.id;
      });
    });
    termGradeCache = map;
    return map;
  }
  function viewKompakt(arg) {
    setNav('lexikon');
    setTitle('Kompakt-Übersicht');
    app.innerHTML = '';
    const tg = termGrades();
    const gradeName = (id) => (SK.grades.find((g) => g.id === id) || {}).name;
    const sel = el('select', { class: 'kompakt-sel', 'aria-label': 'Gürtel wählen' },
      el('option', { value: '', text: 'Alle Einträge' }),
      SK.grades.map((g) => el('option', { value: g.id, text: `bis ${g.name} (${g.belt})` })));
    if (arg && SK.gradeIndex(arg) >= 0) sel.value = arg;
    const body = el('div');
    function render() {
      const lim = sel.value ? SK.gradeIndex(sel.value) : Infinity;
      const ok = (e) => !sel.value || (tg[e.t] && SK.gradeIndex(tg[e.t]) <= lim);
      const parts = SK.glossaryCats.map((c) => {
        const items = SK.glossary.filter((e) => e.cat === c.id && ok(e));
        if (!items.length) return '';
        const cards = items.map((e) => {
          const g = tg[e.t];
          // 3D-Figur, wo es eine gibt (ohne WebGL leer); Stände als Fußbild
          const pic = !e.img ? '' : SK.fig3d && SK.fig3d.known(e.img.key) && !/^st:/.test(e.img.key) ? SK.fig3d.html(e.img.key, { tools: false }) : SK.gfx.plainSvg(e.img);
          return `<article class="k-card">${pic ? `<div class="k-img">${pic}</div>` : ''}<h4>${util.esc(e.t)}</h4><p>${util.esc(e.de)}</p>${g ? `<span class="badge">ab ${util.esc(gradeName(g))}</span>` : ''}</article>`;
        });
        return `<section class="k-sec"><h2>${util.esc(c.title)} <span class="muted small">(${items.length})</span></h2><div class="k-grid">${cards.join('')}</div></section>`;
      });
      const n = parts.filter(Boolean).length;
      body.innerHTML = n ? parts.join('') : '<p class="muted">Für diesen Gürtel gibt es noch keine Einträge.</p>';
      if (location.hash !== `#/kompakt${sel.value ? `/${sel.value}` : ''}`) history.replaceState(null, '', `#/kompakt${sel.value ? `/${sel.value}` : ''}`);
    }
    sel.addEventListener('change', render);
    app.append(
      el('nav', { class: 'crumbs no-print' }, el('a', { href: '#/lexikon', text: 'Lexikon' }), ' › ', el('span', { text: 'Kompakt-Übersicht' })),
      el('h1', { text: 'Kompakt-Übersicht' }),
      el('p', { class: 'muted small no-print', text: 'Alle Stände, Techniken und Begriffe auf einen Blick – eine Karte je Eintrag. Mit Gürtel-Auswahl siehst du nur, was im DJKB-Prüfungsprogramm bis zu diesem Gürtel vorkommt („ab …“ = erstes Auftreten).' }),
      el('div', { class: 'kompakt-tools no-print' }, sel, el('button', { type: 'button', class: 'btn', text: 'Drucken', onclick: () => window.print() })),
      body
    );
    render();
    finishView();
  }

  // ---------- Quiz ----------
  function viewQuizList() {
    setNav('quiz');
    setTitle('Quiz');
    app.innerHTML = '';
    const due = SK.srs.due().length;
    const asked = Object.keys(store.data.asked).filter((id) => qById[id]).length;
    app.append(
      el('h1', { text: 'Quiz' }),
      el(
        'div',
        { class: 'tiles' },
        el('a', { class: 'tile', href: '#/zufall' }, el('h3', { text: 'Zufallsmix' }), el('p', { text: `Zufällig aus dem gesamten Pool – ${SK.questions.length - asked} noch nie gestellt` })),
        el('a', { class: 'tile', href: '#/review' }, el('h3', { text: 'Wiederholen' }), el('p', { text: due ? `${due} Fragen fällig` : 'Heute nichts fällig' })),
        el('a', { class: 'tile', href: '#/begriffe' }, el('h3', { text: 'Begriffe-Trainer' }), el('p', { text: 'Stände, Techniken & Begriffe – kurz abgefragt' }))
      ),
      el('p', { class: 'muted small', text: 'Alle Lektionen sind frei wählbar. Ab 80 % richtigen Antworten gilt eine Lektion als bestanden (✓).' })
    );
    const section = (title, list) => {
      const wrap = el('section', { class: 'unit-section' }, el('h2', { text: title }));
      list.forEach((u) => wrap.append(unitCard(u)));
      return wrap;
    };
    app.append(section('Allgemeines Wissen', SK.generalUnits), section('Kata-Wissen', kataUnits));
    finishView();
  }

  function unitCard(u) {
    const p = unitProgress(u);
    const card = el('details', { class: `unit ${u.kind}` });
    const head = el('summary', { class: 'unit-head' }, el('div', {}, el('h3', { text: u.title }), el('p', { class: 'muted small', text: u.desc })), el('div', { class: 'ring', text: `${p.done}/${p.total}` }));
    const bar = el('div', { class: 'progress thin' }, el('div', { class: 'progress-bar' }));
    bar.firstChild.style.width = `${(p.done / p.total) * 100}%`;
    const path = el('ol', { class: 'path' });
    u.lessons.forEach((l, i) => {
      const st = lessonState(l.id);
      const n = (qByLesson[l.id] || []).length;
      path.append(
        el(
          'li',
          {},
          el(
            'a',
            { class: `node ${passed(l.id) ? 'done' : 'open'}`, href: `#/quiz/${l.id}` },
            el('span', { class: 'dot', text: passed(l.id) ? '✓' : String(i + 1) }),
            el('span', { class: 'node-title', text: l.title }),
            el('span', { class: 'node-meta', text: st ? `${Math.round(st.best * 100)} %` : `${n} Fragen` })
          ),
          el('a', { class: 'node-learn', href: `#/wissen/${l.id}`, text: 'Lernen', title: 'Lerninhalt öffnen' })
        )
      );
    });
    card.append(head, bar, path);
    return card;
  }

  function viewQuiz(id) {
    const entry = lessonIndex[id];
    if (!entry) return viewNotFound();
    setNav('quiz');
    setTitle(`Quiz: ${entry.lesson.title}`);
    const back = entry.unit.kind === 'drill' ? '#/begriffe' : '#/quiz';
    const pool = qByLesson[id] || [];
    // Begriffe-Trainer: höchstens so viele Fragen wie Begriffe, damit kein Begriff doppelt kommt.
    const n = entry.unit.kind === 'drill' ? Math.min(15, new Set(pool.map((q) => q.grp || q.id)).size) : ROUND;
    const qs = pickRound(pool, n);
    SK.runQuiz(app, qs, {
      mode: 'lesson',
      title: `${entry.unit.title} · ${entry.lesson.title}`,
      onExit: () => go(back),
      onFinish: (results) => {
        const ratio = results.filter((r) => r.ok).length / results.length;
        const prev = lessonState(id) || { best: 0, passed: false, runs: 0 };
        store.data.lessons[id] = { best: Math.max(prev.best, ratio), passed: prev.passed || ratio >= PASS_LESSON, runs: prev.runs + 1 };
        store.save();
        const next = ratio >= PASS_LESSON && entry.unit.kind !== 'drill' ? entry.unit.lessons[entry.idx + 1] : null;
        showResult({ results, pass: ratio >= PASS_LESSON, again: `#/quiz/${id}`, back, next: next ? { href: `#/quiz/${next.id}`, title: next.title } : null });
      },
    });
  }

  // ---------- Zufallsmix ----------
  function scopes() {
    return [
      { id: 'alle', title: 'Alle Fragen', test: () => true },
      { id: 'allgemein', title: 'Allgemeines Wissen', test: (q) => unitOf(q).kind === 'general' },
      { id: 'kata', title: 'Kata-Wissen (alle Kata)', test: (q) => unitOf(q).kind === 'kata' },
      { id: 'begriffe', title: 'Begriffe-Trainer', test: (q) => unitOf(q).kind === 'drill' },
    ].concat(units.map((u) => ({ id: u.id, title: `Thema: ${u.title}`, test: (q) => unitOf(q) === u })));
  }

  function viewZufall(scopeId) {
    setNav('quiz');
    setTitle('Zufallsmix');
    const all = scopes();
    const scope = all.find((s) => s.id === scopeId) || all[0];
    const pool = SK.questions.filter((q) => unitOf(q) && scope.test(q));
    const fresh = pool.filter((q) => !store.data.asked[q.id]);
    app.innerHTML = '';
    const select = el('select', { class: 'search', 'aria-label': 'Bereich wählen' }, all.map((s) => el('option', { value: s.id, text: s.title })));
    select.value = scope.id;
    select.addEventListener('change', () => (location.hash = `#/zufall/${select.value}`));
    const start = (n) => {
      const qs = distinct(util.shuffle(fresh), n);
      SK.runQuiz(app, qs, {
        mode: 'review',
        title: `Zufallsmix · ${scope.title}`,
        onExit: () => go(`#/zufall/${scope.id}`),
        onFinish: (results) => {
          showResult({ results, again: `#/zufall/${scope.id}`, back: '#/quiz' });
        },
      });
    };
    const bar = el('div', { class: 'progress' }, el('div', { class: 'progress-bar' }));
    bar.firstChild.style.width = `${pool.length ? ((pool.length - fresh.length) / pool.length) * 100 : 0}%`;
    app.append(
      el('nav', { class: 'crumbs' }, el('a', { href: '#/quiz', text: 'Quiz' }), ' › ', el('span', { text: 'Zufallsmix' })),
      el('h1', { text: 'Zufallsmix' }),
      el('p', { class: 'muted', text: 'Zufällige Fragen aus dem gewählten Bereich – es kommen nur Fragen, die dir noch nie gestellt wurden. Ist alles durch, setzt du den Pool zurück und beginnst von vorne.' }),
      select,
      el('section', { class: 'card' }, el('p', {}, el('b', { text: `${fresh.length}` }), ` von ${pool.length} Fragen noch nicht gestellt`), bar),
      fresh.length
        ? el('div', { class: 'actions' }, [10, 20, 50].filter((n, i) => i === 0 || fresh.length > [10, 20, 50][i - 1]).map((n) => el('button', { class: `btn ${n === 10 ? 'primary' : ''}`, text: `${Math.min(n, fresh.length)} Fragen`, onclick: () => start(n) })))
        : el('p', { text: 'Alle Fragen dieses Bereichs wurden bereits gestellt.' }),
      el(
        'div',
        { class: 'actions' },
        el('button', {
          class: 'btn danger',
          text: 'Pool zurücksetzen',
          disabled: fresh.length === pool.length,
          onclick: () => {
            if (!confirm(`Für „${scope.title}“ wieder alle ${pool.length} Fragen als ungestellt markieren? (Lernfortschritt und Wiederholung bleiben erhalten.)`)) return;
            pool.forEach((q) => delete store.data.asked[q.id]);
            store.save();
            viewZufall(scope.id);
          },
        })
      )
    );
    finishView();
  }

  // ---------- Begriffe-Trainer ----------
  function viewBegriffe() {
    setNav('quiz');
    setTitle('Begriffe-Trainer');
    app.innerHTML = '';
    const total = drillUnit.lessons.reduce((s, l) => s + (qByLesson[l.id] || []).length, 0);
    app.append(
      el('h1', { text: 'Begriffe-Trainer' }),
      el('p', { class: 'muted', text: `Stände, Techniken & Begriffe – kurz abgefragt. Jeder Begriff kommt in beide Richtungen und, wo es eine Grafik gibt, auch als Bildfrage (${total} Fragen).` }),
      el('div', { class: 'actions' }, el('a', { class: 'btn primary', href: '#/zufall/begriffe', text: 'Alle Begriffe gemischt' }), el('a', { class: 'btn', href: '#/lexikon', text: 'Lexikon ansehen' })),
      el(
        'div',
        { class: 'tiles' },
        drillUnit.lessons.map((l) => {
          const st = lessonState(l.id);
          const n = (qByLesson[l.id] || []).length;
          return el('a', { class: 'tile', href: `#/quiz/${l.id}` }, el('h3', { text: l.title }), el('p', { text: `${n} Fragen${st ? ` · bestes Ergebnis ${Math.round(st.best * 100)} %` : ''}` }));
        })
      )
    );
    finishView();
  }

  function showResult({ results, pass, again, back, next, extra }) {
    app.innerHTML = '';
    const wrong = results.filter((r) => !r.ok);
    const ratio = (results.length - wrong.length) / results.length;
    if (pass === undefined) pass = ratio >= PASS_LESSON;
    const link = (cls, href, text) =>
      el('a', {
        class: cls,
        href,
        text,
        onclick: (e) => {
          e.preventDefault();
          go(href);
        },
      });
    app.append(
      el(
        'section',
        { class: `result ${pass ? 'pass' : 'fail'}` },
        el('div', { class: 'score', text: `${Math.round(ratio * 100)} %` }),
        el('h2', { text: pass ? 'Bestanden – stark!' : 'Noch nicht bestanden – weiter üben!' }),
        el('p', { text: `${results.length - wrong.length} von ${results.length} richtig` }),
        extra || '',
        el(
          'div',
          { class: 'actions' },
          next ? link('btn primary', next.href, `Nächste Lektion: ${next.title}`) : '',
          link(`btn ${next ? '' : 'primary'}`, again, 'Nochmal'),
          link('btn', back, 'Zurück')
        )
      )
    );
    if (wrong.length) {
      const list = el('ol', { class: 'review-list' });
      wrong.forEach((r) =>
        list.append(
          el(
            'li',
            {},
            el('p', { class: 'q', text: r.q.q }),
            r.q.img ? el('img', { class: 'quiz-img small-img', src: r.q.img, alt: '' }) : r.q.gfx && SK.fig3d.known(r.q.gfx) ? el('div', { class: 'quiz-f3d small-img', html: SK.fig3d.html(r.q.gfx, { plain: true, tools: false }) }) : '',
            el('p', {}, el('span', { class: 'muted', text: 'Richtig: ' }), SK.quizUtil.correctText(r.q)),
            r.q.explain ? el('p', { class: 'small', text: r.q.explain }) : '',
            el('p', { class: 'src', text: `Quelle: ${r.q.src}` })
          )
        )
      );
      app.append(el('section', { class: 'card' }, el('h3', { text: 'Diese Fragen landen in deiner Wiederholung:' }), list));
    }
    finishView();
  }

  // ---------- Wiederholung ----------
  function viewReview() {
    setNav('quiz');
    setTitle('Wiederholen');
    const due = SK.srs.due();
    app.innerHTML = '';
    const seen = Object.keys(store.data.srs).filter((id) => qById[id]);
    const boxes = [1, 2, 3, 4, 5].map((b) => seen.filter((id) => store.data.srs[id].b === b).length);
    app.append(
      el('nav', { class: 'crumbs' }, el('a', { href: '#/quiz', text: 'Quiz' }), ' › ', el('span', { text: 'Wiederholen' })),
      el('h1', { text: 'Wiederholen' }),
      el('p', { class: 'muted', text: 'Karteikasten-Prinzip: Falsch beantwortete Fragen kommen in Fach 1 und sind sofort wieder fällig. Richtige Antworten wandern ein Fach weiter (1, 2, 4, 8, 16 Tage).' }),
      el('div', { class: 'boxes' }, boxes.map((n, i) => el('div', { class: 'box' }, el('b', { text: String(n) }), el('span', { text: `Fach ${i + 1}` }))))
    );
    const start = (ids, title) =>
      SK.runQuiz(app, ids.map((id) => qById[id]), {
        mode: 'review',
        title,
        onExit: () => go('#/review'),
        onFinish: (results) => {
          showResult({ results, again: '#/review', back: '#/quiz' });
        },
      });
    const actions = el('div', { class: 'actions' });
    if (due.length) actions.append(el('button', { class: 'btn primary', text: `${Math.min(15, due.length)} fällige Fragen üben`, onclick: () => start(due.slice(0, 15), 'Wiederholung') }));
    else actions.append(el('p', { text: 'Heute ist nichts fällig – gut gemacht!' }));
    if (seen.length >= 5) actions.append(el('button', { class: 'btn', text: 'Gemischtes Training (10 gesehene Fragen)', onclick: () => start(util.shuffle(distinct(util.shuffle(seen), 10)), 'Gemischtes Training') }));
    app.append(actions);
    finishView();
  }

  // ---------- Prüfungen ----------
  const examPages = () => SK.grades.concat([SK.higherDan]);
  const EXAM_TABS = [
    { id: 'kihon', title: 'Kihon' },
    { id: 'kata', title: 'Kata' },
    { id: 'kumite', title: 'Kumite' },
    { id: 'theorie', title: 'Theorie' },
  ];
  let examTab = 'kihon';

  function viewExamList() {
    setNav('exam');
    setTitle('Prüfungen');
    app.innerHTML = '';
    const list = el('div', { class: 'grade-list' });
    examPages().forEach((g) => {
      const kata = g.kataProg.short || g.kataProg.items[0];
      list.append(
        el(
          'a',
          { class: 'grade', href: `#/exam/${g.id}` },
          el('span', { class: `belt ${g.cls}` }),
          el('span', {}, el('span', { class: 'grade-name', text: g.name }), el('span', { class: 'grade-sub muted small', text: `${g.belt} · ${kata} · ${g.kumite.form}` }))
        )
      );
    });
    app.append(
      el('h1', { text: 'Prüfungen' }),
      el('p', { class: 'muted', text: 'DJKB-Prüfungsprogramm je Gürtel – genau das, was in der Prüfung verlangt wird: Kihon, Kata und Kumite nach der DJKB-Prüfungsordnung (Stand Juli 2013) und den DJKB-Übersichten.' }),
      list,
      el('p', { class: 'muted small', text: 'Angaben ohne Gewähr – maßgeblich ist die jeweils gültige DJKB-Prüfungsordnung.' })
    );
    finishView();
  }

  // Liste aus Zeilen: erste Zeile = Übung, weitere Zeilen = Fortsetzung
  function progList(items) {
    return el(
      'ol',
      { class: 'prog' },
      items.map((lines) => el('li', {}, el('div', { class: 'prog-main', text: lines[0] }), lines.slice(1).map((t) => el('div', { class: 'prog-sub', text: t }))))
    );
  }
  function plainList(items, cls) {
    return el(
      'ul',
      { class: cls || 'prog-plain' },
      items.map((it) => (typeof it === 'string' ? el('li', { text: it }) : el('li', {}, el('div', { class: 'prog-main', text: it.t }), el('ul', { class: 'prog-var' }, it.v.map((t) => el('li', { text: t }))))))
    );
  }
  function focusBox(title, lines) {
    return lines && lines.length ? el('details', { class: 'prog-focus' }, el('summary', { text: title }), el('ul', {}, lines.map((t) => el('li', { text: t })))) : '';
  }

  function examPanel(g, tab) {
    const stufe = SK.examStufe(g);
    if (tab === 'kihon') {
      const k = g.kihon;
      return [
        k.reps ? el('p', { class: 'prog-reps', text: k.reps }) : '',
        progList(k.items),
        k.ref ? el('p', {}, 'Reihen siehe: ', k.ref.flatMap((id, i) => [i ? ' · ' : '', el('a', { href: `#/exam/${id}`, text: SK.grades[SK.gradeIndex(id)].name })])) : '',
        k.note ? el('p', { class: 'muted small', text: k.note }) : '',
        focusBox('Hinweise zur Ausführung', SK.examHints),
        stufe ? focusBox(`Schwerpunkte ${stufe.name}`, stufe.kihon) : '',
      ];
    }
    if (tab === 'kata') {
      const k = g.kataProg;
      const links = (g.kata || []).map((id) => lessonIndex[`${id}-ueberblick`]).filter(Boolean);
      return [
        plainList(k.items),
        k.focus ? el('p', {}, el('b', { text: 'Besondere Schwerpunkte: ' }), k.focus) : '',
        k.note ? el('p', { class: 'muted', text: k.note }) : '',
        links.length
          ? el('div', { class: 'prog-links' }, el('span', { class: 'muted small', text: 'Kata-Wissen aus „Karate-Do Kata“ (JKA):' }), el('div', { class: 'actions' }, links.map((e) => el('a', { class: 'btn', href: `#/wissen/${e.lesson.id}`, text: e.unit.title }))))
          : '',
      ];
    }
    if (tab === 'kumite') {
      const k = g.kumite;
      const jiyu = k.form === 'Jiyu-Ippon-Kumite';
      return [
        el('h3', { text: k.form }),
        k.ziel ? el('p', { class: 'prog-ziel' }, el('b', { text: 'Ziel: ' }), k.ziel) : '',
        k.text ? k.text.map((t) => el('p', { text: t })) : '',
        k.angriff ? [el('h4', { text: `Angriff (Kogeki)${k.angriffVon ? ` – ${k.angriffVon}` : ''}` }), plainList(k.angriff)] : '',
        k.abwehr ? [el('h4', { text: 'Abwehr (Uke)' }), k.abwehrNote ? el('p', { class: 'prog-reps', text: k.abwehrNote }) : '', plainList(k.abwehr)] : '',
        k.ablauf ? [el('h4', { text: 'Ablauf' }), plainList(k.ablauf)] : '',
        stufe ? focusBox(`Schwerpunkte ${stufe.name}`, stufe.kumite) : '',
        jiyu ? focusBox('Jiyu-Ippon-Kumite – worauf es ankommt', SK.examJiyuIppon) : '',
      ];
    }
    return [plainList(g.theory)];
  }

  function viewExamGrade(id) {
    const pages = examPages();
    const pos = pages.findIndex((x) => x.id === id);
    const g = pages[pos];
    if (!g) return viewNotFound();
    setNav('exam');
    setTitle(`Prüfung ${g.name}`);
    app.innerHTML = '';
    const tabs = EXAM_TABS.filter((t) => t.id !== 'theorie' || g.theory);
    if (!tabs.some((t) => t.id === examTab)) examTab = 'kihon';
    const panel = el('section', { class: 'card program', role: 'tabpanel' });
    const bar = el(
      'div',
      { class: 'tabs', role: 'tablist' },
      tabs.map((t) =>
        el('button', {
          class: 'tab',
          role: 'tab',
          text: t.title,
          'data-tab': t.id,
          onclick: () => {
            examTab = t.id;
            show();
          },
        })
      )
    );
    function show() {
      bar.querySelectorAll('.tab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === examTab)));
      panel.innerHTML = '';
      panel.append(...[examPanel(g, examTab)].flat(3).filter(Boolean));
    }
    show();
    const prev = pages[pos - 1];
    const next = pages[pos + 1];
    app.append(
      el('nav', { class: 'crumbs' }, el('a', { href: '#/exam', text: 'Prüfungen' }), ' › ', el('span', { text: g.name })),
      el('h1', {}, el('span', { class: `belt big ${g.cls}` }), ` ${g.name}`),
      el('p', { class: 'muted' }, g.belt, g.wait ? [el('br'), `Wartezeit/Voraussetzung: ${g.wait}`] : ''),
      bar,
      panel,
      el('p', { class: 'src', text: `Quelle: ${SK.sources.po}; ${SK.sources.ueb}` }),
      el(
        'nav',
        { class: 'pager' },
        prev ? el('a', { class: 'btn', href: `#/exam/${prev.id}`, text: `‹ ${prev.name}` }) : el('span'),
        next ? el('a', { class: 'btn', href: `#/exam/${next.id}`, text: `${next.name} ›` }) : el('span')
      )
    );
    finishView();
  }

  // ---------- Fortschritt ----------
  function viewStats() {
    setNav('stats');
    setTitle('Fortschritt');
    const d = store.data;
    app.innerHTML = '';
    const done = allLessons.filter((l) => passed(l.id)).length;
    const read = learnLessons.filter((l) => d.read[l.id]).length;
    const asked = Object.keys(d.asked).filter((id) => qById[id]).length;
    const statGrid = el(
      'div',
      { class: 'stat-grid' },
      [
        ['Lektionen gelesen', `${read}/${learnLessons.length}`],
        ['Quiz-Lektionen bestanden', `${done}/${allLessons.length}`],
        ['Fragen gestellt', `${asked}/${SK.questions.length}`],
        ['Trefferquote', d.answered ? `${Math.round((d.correct / d.answered) * 100)} %` : '–'],
      ].map(([k, v]) => el('div', { class: 'stat-card' }, el('b', { text: String(v) }), el('span', { text: k })))
    );
    const unitList = el('ul', { class: 'unit-progress' });
    units.forEach((u) => {
      const p = unitProgress(u);
      const bar = el('div', { class: 'progress thin' }, el('div', { class: 'progress-bar' }));
      bar.firstChild.style.width = `${(p.done / p.total) * 100}%`;
      unitList.append(el('li', {}, el('span', { text: `${u.title} (${p.done}/${p.total})` }), bar));
    });

    const fileInput = el('input', { type: 'file', accept: 'application/json,.json', class: 'visually-hidden', id: 'importFile' });
    fileInput.addEventListener('change', () => {
      const f = fileInput.files[0];
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) return alert('Datei ist zu groß.');
      f.text().then((t) => {
        try {
          store.importJson(t);
          alert('Fortschritt importiert.');
          viewStats();
        } catch (e) {
          alert(`Import fehlgeschlagen: ${e.message}`);
        }
      });
    });

    app.append(
      el('h1', { text: 'Dein Fortschritt' }),
      statGrid,
      el('section', { class: 'card' }, el('h3', { text: 'Quiz-Themen' }), unitList),
      el(
        'section',
        { class: 'card' },
        el('h3', { text: 'Einstellungen & Sicherung' }),
        el('p', { class: 'muted small', text: 'Der Fortschritt wird nur lokal in diesem Browser gespeichert. Mit Export/Import kannst du ihn auf ein anderes Gerät übertragen.' }),
        el(
          'div',
          { class: 'actions' },
          el('button', {
            class: 'btn',
            text: 'Exportieren',
            onclick: () => {
              const blob = new Blob([store.exportJson()], { type: 'application/json' });
              const a = el('a', { href: URL.createObjectURL(blob), download: `shotokan-sensai-${util.today()}.json` });
              document.body.append(a);
              a.click();
              setTimeout(() => {
                URL.revokeObjectURL(a.href);
                a.remove();
              }, 0);
            },
          }),
          el('label', { class: 'btn', for: 'importFile', text: 'Importieren' }),
          fileInput,
          el('button', {
            class: 'btn danger',
            text: 'Alles zurücksetzen',
            onclick: () => {
              if (confirm('Gesamten Fortschritt unwiderruflich löschen?')) {
                store.reset();
                viewStats();
              }
            },
          })
        )
      ),
      el(
        'section',
        { class: 'card' },
        el('h3', { text: 'Quellen' }),
        el('ul', {}, Object.values(SK.sources).map((s) => el('li', { text: s }))),
        el('p', { class: 'muted small', text: 'Kata-Fragen sind sinngemäße deutsche Zusammenfassungen aus „Karate-Do Kata Vol. 1“ (JKA Shihan-kai, 2003) und – nur für Hangetsu – „Karate-Do Kata Vol. 2“ (2008) mit Angabe der gedruckten Buchseiten. Prüfungsangaben ohne Gewähr – maßgeblich ist die jeweils gültige DJKB-Prüfungsordnung.' })
      ),
      versionLine()
    );
    finishView();
  }

  // ---------- Datenschutz ----------
  function viewDatenschutz() {
    setNav('');
    setTitle('Datenschutz');
    app.innerHTML = '';
    const link = (href, text) => el('a', { href, text, target: '_blank', rel: 'noopener noreferrer' });
    app.append(
      el('h1', { text: 'Datenschutz' }),
      el(
        'section',
        { class: 'card' },
        el('h3', { text: 'Privates Projekt' }),
        el('p', { text: 'Diese Seite ist ein privates, nicht kommerzielles Lernprojekt. Es werden keine Cookies, keine Besucherstatistik und keine Inhalte von fremden Servern verwendet.' })
      ),
      el(
        'section',
        { class: 'card' },
        el('h3', { text: 'Hosting' }),
        el('p', {}, 'Die Seite wird über GitHub Pages (GitHub Inc., USA) bereitgestellt. Beim Aufruf verarbeitet GitHub technisch notwendige Daten wie die IP-Adresse, um die Seite auszuliefern und abzusichern. Details: ', link('https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement', 'Datenschutzerklärung von GitHub'), '.')
      ),
      el(
        'section',
        { class: 'card' },
        el('h3', { text: 'Lernfortschritt' }),
        el('p', { text: 'Dein Fortschritt wird ausschließlich lokal in deinem Browser (localStorage) gespeichert und nicht übertragen. Du kannst ihn jederzeit unter „Profil“ → „Alles zurücksetzen“ löschen.' })
      ),
      versionLine()
    );
    finishView();
  }

  // Auswahl für die Kata-Ansage (eigener Eintrag in der unteren Leiste)
  function viewAnsageList() {
    setNav('ansage');
    setTitle('Kata-Trainer');
    app.innerHTML = '';
    const list = el('div', { class: 'grade-list' });
    SK.ansageKata().forEach((id) => {
      const k = SK.kata[id];
      const g = SK.grades.find((x) => x.kata.includes(id));
      list.append(
        el(
          'a',
          { class: 'grade', href: `#/ansage/${id}` },
          el('span', { class: g ? `belt ${g.cls}` : '' }),
          el('span', {}, el('span', { class: 'grade-name', text: k.name }), el('span', { class: 'grade-sub muted small', text: `${k.moves} Bewegungen · Kiai bei ${k.kiai.join(' und ')}${g ? ` · Prüfung ${g.name}` : ''}` }))
        )
      );
    });
    app.append(
      el('h1', { text: 'Kata-Trainer' }),
      el('p', { class: 'muted', text: 'Kata auswählen – die App zählt sie auf Japanisch im Rhythmus des Buches und zeigt dazu die Fußstellungen.' }),
      list
    );
    finishView();
  }

  function viewAnsage(id) {
    const k = SK.kata[id];
    if (!k || !k.ansage) return viewNotFound();
    setNav('ansage');
    setTitle(k.name);
    SK.viewAnsage(app, k);
    finishView();
  }

  function viewNotFound() {
    app.innerHTML = '';
    app.append(el('h1', { text: 'Seite nicht gefunden' }), el('a', { class: 'btn', href: '#/', text: 'Zur Startseite' }));
    finishView();
  }

  // ---------- Router ----------
  function route() {
    if (SK.quizCleanup) SK.quizCleanup();
    if (SK.ansageCleanup) SK.ansageCleanup();
    const [view, arg] = (location.hash.replace(/^#\/?/, '') || '').split('/').map(decodeURIComponent);
    // Vollbild gibt es nur beim Kata-Zählen; beim Wechsel zur nächsten Kata bleibt es
    if (document.fullscreenElement && !(view === 'ansage' && arg)) document.exitFullscreen().catch(() => {});
    if (!view) return viewStart();
    if (view === 'wissen') return arg ? viewWissen(arg) : viewWissenList();
    if (view === 'lesson') return viewWissen(arg);
    if (view === 'lexikon') return viewLexikon(arg);
    if (view === 'kompakt') return viewKompakt(arg);
    if (view === 'quiz') return arg ? viewQuiz(arg) : viewQuizList();
    if (view === 'zufall') return viewZufall(arg);
    if (view === 'begriffe') return viewBegriffe();
    if (view === 'review') return viewReview();
    if (view === 'exam') return arg ? viewExamGrade(arg) : viewExamList();
    if (view === 'stats') return viewStats();
    if (view === 'datenschutz') return viewDatenschutz();
    if (view === 'ansage') return arg ? viewAnsage(arg) : viewAnsageList();
    return viewNotFound();
  }
  window.addEventListener('hashchange', route);
  // Grafik-Knöpfe in Lektionen und Lexikon: 3D-Figur ↔ Fußbild, Standbild ↔ Animation
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.gfx-box .gfx-btn');
    // 3D-Knöpfe (data-act="f3d-…") bedient js/figur-app.js
    if (!btn || !['side', 'anim'].includes(btn.dataset.act)) return;
    const box = btn.closest('.gfx-box');
    const views = box.querySelectorAll(':scope > .gfx-view');
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(on));
    if (btn.dataset.act === 'side') {
      views[0].hidden = on;
      views[1].hidden = !on;
      btn.textContent = on ? '3D-Figur' : btn.dataset.label;
    } else if (btn.dataset.act === 'anim') {
      const anim = box.querySelector(':scope > .gfx-anim');
      anim.innerHTML = on ? SK.gfx.animSvg(box.dataset.gfx) : '';
      anim.hidden = !on;
      views[0].hidden = on;
      btn.textContent = on ? '■ Standbild' : '▶ Bewegung';
    }
  });
  route();

  // Lexikon-Figuren im Hintergrund vorrechnen, sobald die erste Seite steht und der Browser Ruhe hat –
  // dann sind sie beim Aufklappen einer Kategorie schon fertig. Nur bei 3D-Figuren (WebGL); die Figuren rechnet
  // js/figur-app.js nachrangig: was gerade auf dem Bildschirm gebraucht wird, kommt immer zuerst.
  function prefetchLexikon() {
    if (!SK.fig3d || !SK.fig3d.ok()) return;
    // Breite der Bühne messen, wie sie im Lexikon sein wird (gleiche Größe = gleiches Bild im Zwischenspeicher)
    const stage = el('div', { class: 'f3d-stage' });
    const probe = el('div', { class: 'lex-probe', 'aria-hidden': 'true' }, el('div', { class: 'lex-grid' }, el('article', { class: 'lex-card' }, el('div', { class: 'lex-img' }, el('div', { class: 'gfx-box' }, el('div', { class: 'f3d' }, stage))))));
    app.append(probe);
    const width = stage.clientWidth;
    probe.remove();
    if (!width) return;
    SK.glossaryCats.forEach((c) => SK.glossary.forEach((e) => e.cat === c.id && e.img && SK.fig3d.prefetch(e.img.key, width)));
  }
  window.addEventListener('load', () => setTimeout(() => (window.requestIdleCallback ? requestIdleCallback(prefetchLexikon, { timeout: 3000 }) : prefetchLexikon()), 600), { once: true });

  // Offline-Speicher (sw.js, v1.41.0) ist abgeschaltet: früher installierten wieder entfernen.
  if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistrations) {
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister())).catch(() => {});
    if (window.caches) caches.delete('sk-app').catch(() => {});
  }

  SK.debug = { units, lessonIndex, qByLesson };
})();
