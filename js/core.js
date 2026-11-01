/* Gemeinsamer Namensraum, Hilfsfunktionen und Speicher (localStorage). */
(function () {
  'use strict';

  const SK = (window.SK = {
    units: [],
    questions: [],
    kata: {},
    grades: [],
    sources: {},
  });

  SK.BOOK_SOURCE = 'Karate-Do Kata Vol. 1 (JKA)';
  // Interne Seitenzahlen = Seiten der Scan-Datei; ab Seite 6 enthält jede eine gedruckte Doppelseite.
  SK.bookPages = (n) => {
    if (n >= 6) return `S. ${2 * (n - 5)}–${2 * (n - 5) + 1}`;
    if (n === 5) return 'S. 1 (Inhaltsverzeichnis)';
    if (n === 4) return 'S. ii–iii (Content and Guidance)';
    return 'Vorwort';
  };
  SK.bookSrc = (n) => `${SK.BOOK_SOURCE}, ${SK.bookPages(n)}`;
  // Bei jeder veröffentlichten Änderung hochzählen: node tools/version.js patch|minor|major (setzt auch ?v= in index.html)
  SK.VERSION = '1.43.0';
  SK.VERSION_DATE = '01.11.2026';
  SK.VERSION_TIME = '10:53';

  // Lektionstexte als Funktion (learn: () => `…`) werden erst beim ersten Öffnen erzeugt.
  SK.lazyLearn = (unit) => unit.lessons.forEach((l) => typeof l.learn === 'function' && SK.util.lazy(l, 'learn', l.learn));

  SK.util = {
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    sample(arr, n) {
      return SK.util.shuffle(arr).slice(0, n);
    },
    esc(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
    today() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },
    addDays(isoDate, days) {
      const d = new Date(isoDate + 'T12:00:00');
      d.setDate(d.getDate() + days);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },
    // Eigenschaft erst beim ersten Lesen berechnen (z. B. Grafiken), danach als fester Wert – spart Zeit beim Start.
    lazy(obj, prop, fn) {
      Object.defineProperty(obj, prop, {
        configurable: true,
        enumerable: true,
        get() {
          const v = fn();
          Object.defineProperty(obj, prop, { value: v, writable: true, configurable: true, enumerable: true });
          return v;
        },
        set(v) {
          Object.defineProperty(obj, prop, { value: v, writable: true, configurable: true, enumerable: true });
        },
      });
      return obj;
    },
    el(tag, attrs, ...children) {
      const node = document.createElement(tag);
      if (attrs) {
        for (const [k, v] of Object.entries(attrs)) {
          if (v == null || v === false) continue;
          if (k === 'class') node.className = v;
          else if (k === 'text') node.textContent = v;
          else if (k === 'html') node.innerHTML = v;
          else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
          else node.setAttribute(k, v === true ? '' : v);
        }
      }
      for (const c of children.flat()) {
        if (c == null || c === false) continue;
        node.append(c instanceof Node ? c : document.createTextNode(String(c)));
      }
      return node;
    },
  };

  // Schlüssel bleibt trotz neuer Datenversion gleich, damit bestehende Speicherstände gefunden werden.
  const KEY = 'shotokan-sensai-v1';
  const DATA_VERSION = 2;
  const blank = () => ({
    version: DATA_VERSION,
    lessons: {},
    srs: {},
    exams: {},
    answered: 0,
    correct: 0,
    settings: {},
    asked: {},
    read: {},
  });

  // Version 1 → 2: Fragen-IDs von laufender Nummer auf Hash umstellen (Tabelle in data/legacy-ids.js).
  function migrateIds(map) {
    const out = {};
    for (const [id, v] of Object.entries(map || {})) {
      const m = /^(.+)-(\d+)$/.exec(id);
      const list = m && SK.legacyIds && SK.legacyIds[m[1]];
      const h = list && list.split(' ')[Number(m[2]) - 1];
      out[h ? `${m[1]}-${h}` : id] = v;
    }
    return out;
  }
  function migrate(d) {
    if (d.version === 1) {
      d.srs = migrateIds(d.srs);
      d.asked = migrateIds(d.asked);
      d.version = 2;
    }
    return d;
  }

  SK.store = {
    data: blank(),
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return;
        const d = Object.assign(blank(), JSON.parse(raw));
        // XP, Tages-Serie und Freischalten gibt es nicht mehr.
        ['xp', 'streak', 'bestStreak', 'lastActive'].forEach((k) => delete d[k]);
        if (d.settings) delete d.settings.unlockAll;
        const old = d.version;
        SK.store.data = migrate(d);
        if (old !== d.version) SK.store.save();
      } catch (e) {
        SK.store.data = blank();
      }
    },
    migrate,
    save() {
      try {
        localStorage.setItem(KEY, JSON.stringify(SK.store.data));
      } catch (e) {
        /* Speicher voll oder deaktiviert – App funktioniert weiter ohne Persistenz */
      }
    },
    reset() {
      SK.store.data = blank();
      SK.store.save();
    },
    exportJson() {
      return JSON.stringify(SK.store.data, null, 1);
    },
    importJson(text) {
      const obj = JSON.parse(text);
      if (!obj || typeof obj !== 'object' || ![1, DATA_VERSION].includes(obj.version) || typeof obj.lessons !== 'object' || typeof obj.srs !== 'object') {
        throw new Error('Ungültige Sicherungsdatei');
      }
      SK.store.data = Object.assign(blank(), {
        version: obj.version,
        lessons: obj.lessons,
        srs: obj.srs,
        exams: typeof obj.exams === 'object' && obj.exams ? obj.exams : {},
        answered: Number(obj.answered) || 0,
        correct: Number(obj.correct) || 0,
        asked: typeof obj.asked === 'object' && obj.asked ? obj.asked : {},
        read: typeof obj.read === 'object' && obj.read ? obj.read : {},
      });
      migrate(SK.store.data);
      SK.store.save();
    },
  };

  SK.addQuestions = function (list) {
    for (const q of list) SK.questions.push(q);
  };

  // FNV-1a (32 Bit) als kurze Base36-Zeichenkette
  SK.hash = function (s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(36);
  };

  /* Fragen-Baukasten: richtige Antwort steht im Quelltext immer zuerst, die Anzeige mischt.
     Die ID ergibt sich aus Lektion, Fragetext und richtiger Antwort – Einfügen, Löschen oder
     Umsortieren anderer Fragen verschiebt sie nicht. Ändert sich Frage oder Lösung, gilt sie als neu. */
  const qIds = new Set();
  SK.idCollisions = [];
  SK.qb = function (lesson, defaultSrc, extra) {
    const base = (type, q, options, answer, explain, src) => {
      const right = type === 'mc' ? [options[answer]] : type === 'multi' ? answer.map((i) => options[i]) : options;
      const stem = `${lesson}-${SK.hash(`${type}|${q}|${right.join('|')}`)}`;
      let id = stem;
      // Gleiche Frage mit gleicher Lösung in derselben Lektion – meldet tools/test/validate.html
      for (let n = 2; qIds.has(id); n++) id = `${stem}-${n}`;
      if (id !== stem) SK.idCollisions.push(id);
      qIds.add(id);
      const item = Object.assign({ id, lesson, type, q, options, answer, explain: explain || '', src: src || defaultSrc }, extra || {});
      SK.questions.push(item);
      return item;
    };
    return {
      mc: (q, options, explain, src) => base('mc', q, options, 0, explain, src),
      multi: (q, right, wrong, explain, src) =>
        base('multi', q, right.concat(wrong), right.map((_, i) => i), explain, src),
      order: (q, items, explain, src) => base('order', q, items, null, explain, src),
    };
  };
})();
