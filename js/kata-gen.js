/* Erzeugt aus den Kata-Daten Lerneinheiten und Detailfragen (Stand, Technik, Abfolge, Kiai …). */
(function () {
  'use strict';
  const { util } = SK;
  const P = (n) => SK.bookSrc(n);
  const CHUNK = 8;
  // Lektion mit dem Bewegungsblock, in dem Bewegung n steht (für Verweise, z. B. aus dem Lexikon)
  SK.kataMoveLesson = (id, n) => `${id}-b${Math.floor((n - 1) / CHUNK) * CHUNK + 1}`;

  const GLOBAL_STANCES = [
    'Hidari Zenkutsu-dachi', 'Migi Zenkutsu-dachi', 'Hidari Kokutsu-dachi', 'Migi Kokutsu-dachi', 'Kiba-dachi',
    'Heisoku-dachi', 'Hachiji-dachi', 'Hidari Ashi-dachi', 'Migi Ashi-dachi', 'Migi Ashi-mae Kosa-dachi',
  ];

  const mirror = (s) =>
    s.replace(/\b(Hidari|Migi|Sasho|Usho|Saken|Uken)\b/g, (m) => ({ Hidari: 'Migi', Migi: 'Hidari', Sasho: 'Usho', Usho: 'Sasho', Saken: 'Uken', Uken: 'Saken' })[m]);

  function distractors(correct, pool, n) {
    const out = [];
    const m = mirror(correct);
    if (m !== correct) out.push(m);
    for (const p of util.shuffle(pool)) {
      if (out.length >= n) break;
      if (p !== correct && !out.includes(p)) out.push(p);
    }
    return out.slice(0, n);
  }

  function numberOptions(correct, max, n) {
    const set = new Set([correct]);
    const near = util.shuffle([-2, -1, 1, 2, 3, -3].map((d) => correct + d).filter((v) => v >= 1 && v <= max));
    for (const v of near) {
      if (set.size > n) break;
      set.add(v);
    }
    while (set.size <= n) set.add(1 + Math.floor(Math.random() * max));
    return [...set].map(String);
  }

  const label = (row) => `${row[1]} – ${row[2]}`;

  // Zerlegt einen Technik-Text in linke Hand, rechte Hand, beide Hände und Bein samt Höhe (J/C/G).
  // Die Höhe steht danach nur im Label; bleibt ohne sie nur „-uke“, „-barai“ … übrig, bleibt der Name ganz.
  const HAND = { Saken: 'l', Sasho: 'l', Uken: 'r', Usho: 'r', Ryoken: 'b', Ryosho: 'b', Morote: 'b', Kaisho: 'b', Ryote: 'b', 'Ryo-kentsui': 'b' };
  const OPEN = new Set(['Sasho', 'Usho', 'Ryosho', 'Kaisho']);
  const SIDE = { Hidari: 'l', Migi: 'r' };
  const LEVEL = { Jodan: 'J', Chudan: 'C', Gedan: 'G' };
  const LEVEL_NAME = { J: 'Jodan', C: 'Chudan', G: 'Gedan' };
  const MERGE = /^(Shuto|Tate-shuto|Uraken)$/;
  const LEG = /geri|kekomi|Hiza-(ts|z)uchi/;
  const NO_TECH = /^(Jotai|Rechte|Rechter|Linker|(Migi|Hidari) Ashi-jiku)\b/;

  function parseSegment(seg) {
    const tok = seg.split(/\s+/);
    const parts = [];
    let cur = null;
    let dir = null;
    const start = (slot, open) => parts.push((cur = { slot, open: !!open, toks: [], h: null }));
    for (let i = 0; i < tok.length; i++) {
      const t = tok[i];
      const ni = /^(Sasho|Usho)-ni$/.exec(t);
      if (ni) {
        parts.push({ slot: HAND[ni[1]], open: false, toks: ['offene Hand als Ziel'], h: null });
        cur = null;
        continue;
      }
      if (!cur || cur.done) {
        if (SIDE[t] && tok[i + 1] === 'Sokumen') { dir = t; i++; continue; }
        if (HAND[t]) start(HAND[t], OPEN.has(t));
        else if (SIDE[t]) start(SIDE[t]);
        else { start(dir ? SIDE[dir] : 'b'); i--; }
        if (t === 'Ryo-kentsui') cur.toks.push('Kentsui');
        if (dir) cur.toks.push(...(SIDE[dir] === cur.slot ? ['Sokumen'] : [dir, 'Sokumen']));
        dir = null;
        continue;
      }
      if (HAND[t]) { start(HAND[t], OPEN.has(t)); continue; }
      if (LEVEL[t]) { cur.h = LEVEL[t]; continue; }
      if (t === 'Sokumen' && SIDE[cur.toks[cur.toks.length - 1]] === cur.slot) cur.toks.pop();
      const lv = /^(Jodan|Chudan|Gedan)-(.+)$/.exec(t);
      if (lv) {
        cur.h = LEVEL[lv[1]];
        const prev = cur.toks[cur.toks.length - 1];
        if (prev && MERGE.test(prev)) { cur.toks[cur.toks.length - 1] = `${prev}-${lv[2]}`; continue; }
      }
      cur.toks.push(t);
      if (t === 'Soede') cur.done = true;
    }
    // „Saken Jodan Uken Gedan Yama-zuki“: beide Hände teilen sich die Technik am Ende
    const shared = [...parts].reverse().find((p) => p.toks.length);
    return parts.map((p) => {
      const text = p.toks.length ? p.toks.join(' ') : shared ? shared.toks.join(' ') : LEVEL_NAME[p.h];
      return { slot: LEG.test(text) ? `f${p.slot}` : p.slot, t: text, h: p.h, open: p.open };
    });
  }

  SK.moveParts = function (tech) {
    const res = { l: [], r: [], b: [], f: [], notes: [] };
    let s = tech;
    const kao = /^(Kao \S+-muki)\s*/.exec(s);
    if (kao) { res.notes.push(kao[1]); s = s.slice(kao[0].length); }
    const segs = [];
    s = s.replace(/\s*\(([^)]*)\)/g, (m, inner) => {
      if (HAND[inner.split(' ')[0]] || SIDE[inner.split(' ')[0]]) segs.push(inner);
      else res.notes.push(inner);
      return '';
    }).trim();
    if (!s || NO_TECH.test(s)) return null;
    s.split(' + ').concat(segs).forEach((seg) => parseSegment(seg).forEach((p) => {
      if (p.slot[0] === 'f') res.f.push(Object.assign(p, { side: p.slot[1] }));
      else res[p.slot].push(p);
    }));
    return res;
  };

  const SIDE_NAME = { l: 'links', r: 'rechts' };
  function partHtml(p) {
    return `<span class="mp-t">${util.esc(p.t)}</span>${p.open ? ' <span class="mp-open">offen</span>' : ''}${p.h ? ` <span class="lvl lvl-${p.h}">${LEVEL_NAME[p.h]}</span>` : ''}`;
  }
  function cell(label, list, cls) {
    const body = list.length ? list.map((p) => `<div class="mp-part">${partHtml(p)}</div>`).join('') : '<span class="mp-none">–</span>';
    return `<div class="mp-cell${cls ? ` ${cls}` : ''}"><span class="mp-lbl">${label}</span>${body}</div>`;
  }

  function moveCard(k, r) {
    const kiai = k.kiai.includes(r[0]);
    const mp = SK.moveParts(r[2]);
    let body;
    if (!mp) body = `<div class="mp-row"><div class="mp-cell mp-wide"><span class="mp-t">${util.esc(r[2])}</span></div></div>`;
    else {
      const legLabel = mp.f.length && mp.f.every((p) => p.side === mp.f[0].side) && mp.f[0].side !== 'b' ? `Bein ${SIDE_NAME[mp.f[0].side]}` : 'Bein';
      const hands = mp.b.length && !mp.l.length && !mp.r.length
        ? cell('Beide Hände', mp.b, 'mp-both')
        : cell('Links', mp.l.concat(mp.b)) + cell('Rechts', mp.r.concat(mp.b));
      body = `<div class="mp-row">${hands}${cell(legLabel, mp.f)}</div>`;
    }
    const notes = (mp ? mp.notes : []).concat(r[4] ? [r[4]] : []);
    return `<div class="mcard${kiai ? ' kiai' : ''}"><div class="mcard-top"><span class="mcard-n">${r[0]}</span>${SK.gfx.stanceFor(r[1], { mini: true })}<span class="mcard-st">${util.esc(r[1])}</span>${kiai ? '<span class="badge">Kiai</span>' : ''}</div>${body}${notes.length ? `<div class="mcard-note">${util.esc(notes.join(' · '))}</div>` : ''}</div>`;
  }

  function moveTable(k, from, to) {
    const cards = k.seq.filter((r) => r[0] >= from && r[0] <= to).map((r) => moveCard(k, r)).join('');
    return `<div class="mcards">${cards}</div>
      <p class="muted small">Die Höhe steht im farbigen Label (<span class="lvl lvl-J">Jodan</span> <span class="lvl lvl-C">Chudan</span> <span class="lvl lvl-G">Gedan</span>); ohne Label nennt das Buch keine Höhe. Bei mehrteiligen Bewegungen ist die Endstellung angegeben (im Buch jeweils zuletzt aufgeführt); Zwischenschritte stehen grau darunter.</p>
      <p class="src">Quelle: ${util.esc(SK.BOOK_SOURCE)}, ab ${SK.bookPages(k.seq.find((r) => r[0] === from)[3])}</p>`;
  }

  function buildKata(k) {
    const unit = { id: `kata-${k.id}`, title: k.name, kind: 'kata', desc: `${k.moves} Bewegungen · Kiai bei ${k.kiai.join(' und ')}`, lessons: [] };
    const stances = [...new Set(k.seq.map((r) => r[1]))];
    const stancePool = [...new Set(stances.concat(GLOBAL_STANCES))];
    const techs = [...new Set(k.seq.map((r) => r[2]))];
    const techCount = {};
    k.seq.forEach((r) => (techCount[r[2]] = (techCount[r[2]] || 0) + 1));

    // Überblick
    const ovId = `${k.id}-ueberblick`;
    unit.lessons.push({
      id: ovId,
      title: 'Überblick',
      learn: `${k.learn}<p><b>Yoi:</b> ${util.esc(k.yoi)}</p><p><b>Naore:</b> ${util.esc(k.naore)}</p>`,
    });
    let L = SK.qb(ovId, P(k.firstPage));
    L.mc(`Wie viele Bewegungen hat ${k.name} laut Buch?`, numberOptions(k.moves, k.moves + 10, 3), '', P(k.firstPage));
    const nonKiai = util.shuffle(k.seq.filter((r) => !k.kiai.includes(r[0])).map((r) => r[0])).slice(0, 3);
    L.multi(
      `Bei welchen Bewegungen wird in ${k.name} ein Kiai ausgeführt?`,
      k.kiai.map((n) => `Bewegung ${n}`),
      nonKiai.map((n) => `Bewegung ${n}`),
      k.kiai.map((n) => `${n}: ${k.seq[n - 1][2]}`).join(' · '),
      P(k.seq[k.kiai[0] - 1][3])
    );
    // Zusätze in Klammern ignorieren, sonst taucht eine gleichwertige Yoi-Beschreibung als falsche Antwort auf.
    const yoiBase = (s) => s.replace(/\s*\(.*\)$/, '');
    L.mc(`${k.name}: Wie ist die Yoi-Position (Bereitschaftsstellung)?`, [k.yoi].concat(
      util.shuffle(Object.values(SK.kata).filter((o) => yoiBase(o.yoi) !== yoiBase(k.yoi)).map((o) => o.yoi)).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3)
    ), '', P(k.firstPage));
    L.mc(`${k.name}: Wie beginnt die Kata (Bewegung 1)?`, [label(k.seq[0])].concat(distractors(label(k.seq[0]), k.seq.slice(1).map(label), 3)), '', P(k.seq[0][3]));
    const last = k.seq[k.seq.length - 1];
    L.mc(`${k.name}: Mit welcher Bewegung endet die Kata (Bewegung ${last[0]})?`, [label(last)].concat(distractors(label(last), k.seq.slice(0, -1).map(label), 3)), '', P(last[3]));
    if (k.continuous.length) {
      const inGroup = new Set(k.continuous.flat());
      const fmt = (g) => g.join(' + ');
      const wrong = util.shuffle(k.seq.map((r) => r[0]).filter((n) => n < k.moves && !inGroup.has(n) && !inGroup.has(n + 1))).slice(0, 3);
      L.multi(
        `${k.name}: Welche dieser Bewegungsfolgen werden laut Buch schnell/fließend zusammenhängend ausgeführt?`,
        util.shuffle(k.continuous).slice(0, 3).map(fmt),
        wrong.map((n) => fmt([n, n + 1])),
        k.continuous.map(fmt).join(' · '),
        P(k.seq[k.continuous[0][0] - 1][3])
      );
    }
    if (k.slow.length) {
      const fast = util.shuffle(k.seq.map((r) => r[0]).filter((n) => !k.slow.includes(n))).slice(0, 3);
      L.multi(`${k.name}: Welche dieser Bewegungen werden laut Buch langsam ausgeführt?`, k.slow.slice(0, 3).map((n) => `Bewegung ${n}`), fast.map((n) => `Bewegung ${n}`), k.slow.map((n) => `${n}: ${k.seq[n - 1][2]}`).join(' · '), P(k.seq[k.slow[0] - 1][3]));
    }
    k.facts(L);

    // Bewegungsblöcke
    for (let from = 1; from <= k.moves; from += CHUNK) {
      const to = Math.min(k.moves, from + CHUNK - 1);
      const lid = `${k.id}-b${from}`;
      unit.lessons.push({ id: lid, title: `Bewegungen ${from}–${to}`, learn: () => moveTable(k, from, to) });
      L = SK.qb(lid, P(k.firstPage));
      for (let n = from; n <= to; n++) {
        const row = k.seq[n - 1];
        const note = row[4] ? ` (${row[4]})` : '';
        L.mc(`${k.name}, Bewegung ${n}: In welchem Stand endet die Bewegung?`, [row[1]].concat(distractors(row[1], stancePool, 3)), `Technik: ${row[2]}${note}`, P(row[3]));
        L.mc(`${k.name}, Bewegung ${n}: Welche Technik?`, [row[2]].concat(distractors(row[2], techs, 3)), `Stand: ${row[1]}${note}`, P(row[3]));
        if (n < k.moves) {
          const nxt = k.seq[n];
          L.mc(
            `${k.name}: Was folgt direkt auf Bewegung ${n} (${row[2]})?`,
            [label(nxt)].concat(distractors(label(nxt), k.seq.map(label).filter((x) => x !== label(row)), 3)),
            `Bewegung ${n + 1}`,
            P(nxt[3])
          );
        }
      }
    }

    // Reihenfolge & Nummern
    const ordId = `${k.id}-ablauf`;
    unit.lessons.push({
      id: ordId,
      title: 'Reihenfolge & Nummern',
      learn: () => `<p>Hier wird der gesamte Ablauf geprüft: Bewegungsfolgen sortieren und Techniken der richtigen Bewegungsnummer zuordnen.</p>${moveTable(k, 1, k.moves)}`,
    });
    L = SK.qb(ordId, P(k.firstPage));
    for (let s = 1; s + 3 <= k.moves; s += 2) {
      const rows = k.seq.slice(s - 1, s + 3);
      const items = rows.map(label);
      if (new Set(items).size !== items.length) continue;
      L.order(`${k.name}: Bringe die Bewegungen ${s}–${s + 3} in die richtige Reihenfolge.`, items, '', P(rows[0][3]));
    }
    k.seq.forEach((row) => {
      if (techCount[row[2]] !== 1) return;
      L.mc(`${k.name}: In welcher Bewegung wird „${row[2]}“ ausgeführt?`, numberOptions(row[0], k.moves, 3), `Stand: ${row[1]}`, P(row[3]));
    });
    addContext(k, new Set(unit.lessons.map((l) => l.id)));
    SK.lazyLearn(unit);
    return unit;
  }

  // Fragen mit Bewegungsnummer bekommen Orientierung: Position in der Kata, vorherige Bewegung, ggf. die andere Hälfte der Bewegung.
  function addContext(k, lessonIds) {
    SK.questions.forEach((q) => {
      if (!lessonIds.has(q.lesson) || q.ctx) return;
      const range = /Bewegungen (\d+)–(\d+)/.exec(q.q);
      const one = /Bewegung (\d+)/.exec(q.q);
      if (!range && !one) return;
      const from = Number(range ? range[1] : one[1]);
      const to = Number(range ? range[2] : one[1]);
      if (from < 1 || to > k.moves) return;
      let show = null;
      if (/In welchem Stand endet die Bewegung\?$/.test(q.q)) show = 'tech';
      else if (/, Bewegung \d+: Welche Technik\?$/.test(q.q)) show = 'stand';
      q.ctx = { kata: k.id, from, to, show };
    });
  }

  SK.kataContext = function (q) {
    const c = q.ctx;
    const k = c && SK.kata[c.kata];
    if (!k) return null;
    const { el } = util;
    const bar = el('div', { class: 'kbar', 'aria-hidden': 'true' });
    for (let i = 1; i <= k.moves; i++) {
      const seg = el('span', { class: `kbar-seg${i >= c.from && i <= c.to ? ' on' : ''}${k.kiai.includes(i) ? ' kiai' : ''}` });
      bar.append(seg);
    }
    const pos = c.from === c.to ? `Bewegung ${c.from}` : `Bewegungen ${c.from}–${c.to}`;
    const prev = k.seq[c.from - 2];
    const row = k.seq[c.from - 1];
    const line = (label, r) => el('div', { class: 'kctx-line', html: `${SK.gfx.stanceFor(r[1], { mini: true })}<span><b>${util.esc(label)}</b> ${util.esc(r[1])} – ${util.esc(r[2])}</span>` });
    const hints = [
      prev ? line(`Davor (${prev[0]}):`, prev) : el('div', { class: 'kctx-line', text: 'Erste Bewegung nach Yoi' }),
      c.show === 'tech' ? el('div', { class: 'kctx-line', html: `<span><b>Technik dieser Bewegung:</b> ${util.esc(row[2])}</span>` }) : null,
      c.show === 'stand' ? el('div', { class: 'kctx-line', html: `${SK.gfx.stanceFor(row[1], { mini: true })}<span><b>Stand dieser Bewegung:</b> ${util.esc(row[1])}</span>` }) : null,
    ].filter(Boolean);
    const shown = el('div', { class: 'kctx-hints' });
    const btn = el('button', { type: 'button', class: 'hint-btn', text: 'Hinweis anzeigen' });
    btn.addEventListener('click', () => {
      shown.append(hints.shift());
      btn.textContent = 'Weiteren Hinweis anzeigen';
      btn.blur();
      if (!hints.length) btn.remove();
    });
    return el(
      'div',
      { class: 'kata-ctx' },
      el('div', { class: 'kbar-wrap' }, el('span', { class: 'kbar-num', text: '1' }), bar, el('span', { class: 'kbar-num', text: String(k.moves) })),
      el('div', { class: 'kbar-cap', text: `${pos} von ${k.moves} · orange = Kiai` }),
      shown,
      btn
    );
  };

  function buildCross() {
    const L = SK.qb('kb-vergleich', P(5));
    const list = SK.kataOrder.map((id) => SK.kata[id]);
    list.forEach((k) => {
      const others = util.shuffle(list.filter((o) => o.moves !== k.moves)).slice(0, 3);
      L.mc(`Welche Kata hat laut Buch ${k.moves} Bewegungen?`, [k.name].concat(others.map((o) => o.name)), '', P(k.firstPage));
    });
    L.order('Ordne die Kata nach Anzahl der Bewegungen (wenigste zuerst): Heian Sandan, Heian Shodan, Tekki Shodan, Bassai Dai, Kanku Dai', ['Heian Sandan (20)', 'Heian Shodan (21)', 'Tekki Shodan (29)', 'Bassai Dai (42)', 'Kanku Dai (65)'], '', P(5));
    L.order('Ordne nach Anzahl der Bewegungen (wenigste zuerst): Heian Godan, Heian Nidan, Heian Yondan, Enpi', ['Heian Godan (23)', 'Heian Nidan (26)', 'Heian Yondan (27)', 'Enpi (37)'], '', P(5));
    L.order('Reihenfolge der Kata im Buch (Inhaltsverzeichnis):', ['Heian Shodan', 'Heian Godan', 'Tekki Shodan', 'Bassai Dai', 'Kanku Dai', 'Jion', 'Enpi'], '', P(5));
    L.mc('Welche Kata beginnt mit einem Sprungschritt in Kosa-dachi?', ['Bassai Dai', 'Heian Shodan', 'Kanku Dai', 'Jion'], '', P(79));
    L.mc('Welche Kata beginnt kniend (Orishiki)?', ['Enpi', 'Jion', 'Tekki Shodan', 'Bassai Dai'], '', P(156));
    L.mc('In welcher Kata stehen die Hände zu Beginn vor dem Kinn (Sasho Uken Shita-ago-mae)?', ['Jion', 'Bassai Dai', 'Enpi', 'Kanku Dai'], '', P(132));
    L.mc('In welcher Kata legt man in Bewegung 43 die Hände auf den Boden (Ude-tate)?', ['Kanku Dai', 'Enpi', 'Bassai Dai', 'Heian Godan'], '', P(120));
    L.mc('Welche Kata enthält einen Drehsprung (Kaiten-tobi) mit Kiai?', ['Enpi', 'Jion', 'Tekki Shodan', 'Heian Sandan'], '', P(171));
    L.mc('Welche Kata enthält Yama-zuki?', ['Bassai Dai', 'Heian Yondan', 'Jion', 'Kanku Dai'], '', P(94));
    L.mc('Welche Kata enthält Namigaeshi?', ['Tekki Shodan', 'Heian Nidan', 'Enpi', 'Kanku Dai'], '', P(70));
    L.mc('Welche Kata enthält Nidan-geri?', ['Kanku Dai', 'Heian Godan', 'Bassai Dai', 'Jion'], '', P(128));
    L.mc('Welche Kata enthält die Teisho-Abwehren Oshiage-uke und Oshisage-uke?', ['Enpi', 'Jion', 'Heian Yondan', 'Tekki Shodan'], '', P(168));
    L.mc('Welche Kata enthält drei Teisho Yoko-uke in Kiba-dachi?', ['Jion', 'Enpi', 'Bassai Dai', 'Heian Godan'], '', P(142));
    L.mc('In welcher Heian-Kata wird gesprungen (Tobikomi mit Kiai)?', ['Heian Godan', 'Heian Yondan', 'Heian Sandan', 'Heian Nidan'], '', P(62));
    L.mc('In welcher Heian-Kata kommt Mikazuki-geri vor?', ['Heian Godan', 'Heian Yondan', 'Heian Nidan', 'Heian Shodan'], '', P(60));
    L.mc('In welcher Heian-Kata kommen Furi-enpi mit Fumikomi vor?', ['Heian Sandan', 'Heian Nidan', 'Heian Godan', 'Heian Shodan'], '', P(35));
    L.mc('In welcher Heian-Kata kommt Kentsui Tate-mawashi-uchi vor (Bewegung 4)?', ['Heian Shodan', 'Heian Nidan', 'Heian Yondan', 'Heian Godan'], '', P(7));
    L.mc('Welche Kata wird fast vollständig in Kiba-dachi ausgeführt?', ['Tekki Shodan', 'Jion', 'Heian Sandan', 'Enpi'], '', P(67));
    L.multi('Welche Kata beginnen laut Buch aus Heisoku-dachi (Yoi)?', ['Tekki Shodan', 'Bassai Dai', 'Jion', 'Enpi'], ['Heian Shodan', 'Kanku Dai'], '', P(66));
    L.multi('Welche früheren Namen nennt das Buch?', ['Heian – Pin An', 'Tekki – Naihanchi', 'Kanku – Kushanku', 'Enpi – Wanshu'], ['Jion – Wankan', 'Bassai – Chinto'], '', P(65));
  }

  SK.buildKataContent = function () {
    const units = [];
    SK.kataIntroQuestions();
    buildCross();
    const intro = SK.kataIntroUnit;
    intro.lessons.push({
      id: 'kb-vergleich',
      title: 'Kata im Vergleich',
      learn: `<table class="moves"><thead><tr><th>Kata</th><th>Bewegungen</th><th>Kiai</th></tr></thead><tbody>${SK.kataOrder
        .map((id) => SK.kata[id])
        .map((k) => `<tr><td>${util.esc(k.name)}</td><td>${k.moves}</td><td>${k.kiai.join(', ')}</td></tr>`)
        .join('')}</tbody></table>`,
    });
    units.push(intro);
    SK.kataOrder.forEach((id) => units.push(buildKata(SK.kata[id])));
    return units;
  };
})();
