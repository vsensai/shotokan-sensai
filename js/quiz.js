/* Quiz-Engine: Multiple Choice (mc), Mehrfachauswahl (multi), Reihenfolge (order). */
(function () {
  'use strict';
  const { util, store } = SK;
  const { el } = util;

  function isCorrect(q, given) {
    if (q.type === 'mc') return given === q.answer;
    if (q.type === 'multi') {
      const a = [...q.answer].sort().join(',');
      const g = [...given].sort().join(',');
      return a === g;
    }
    if (q.type === 'order') return given.every((v, i) => v === i) && given.length === q.options.length;
    return false;
  }

  function correctText(q) {
    if (q.type === 'mc') return q.options[q.answer];
    if (q.type === 'multi') return q.answer.map((i) => q.options[i]).join(' · ');
    return q.options.map((o, i) => `${i + 1}. ${o}`).join('  →  ');
  }

  // Wechselt das Quizbild zwischen Standbild und Animation
  function animButton(q) {
    const btn = el('button', { type: 'button', class: 'gfx-btn quiz-anim', 'aria-pressed': 'false', text: '▶ Bewegung' });
    btn.addEventListener('click', () => {
      const img = btn.previousElementSibling;
      const on = btn.getAttribute('aria-pressed') !== 'true';
      img.src = on ? SK.gfx.dataUri(SK.gfx.animSvg(q.gfx)) : q.img;
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? '■ Standbild' : '▶ Bewegung';
    });
    return btn;
  }

  /**
   * Startet eine Quiz-Runde im Container.
   * opts: { mode: 'lesson'|'review'|'exam', title, onFinish(results), onExit() }
   */
  SK.runQuiz = function (container, questions, opts) {
    let idx = 0;
    const results = [];
    let given = null;
    let checked = false;
    let keyHandler = null;

    function cleanup() {
      if (keyHandler) document.removeEventListener('keydown', keyHandler);
      keyHandler = null;
      if (SK.quizCleanup === cleanup) SK.quizCleanup = null;
    }
    if (SK.quizCleanup) SK.quizCleanup();
    SK.quizCleanup = cleanup;

    function render() {
      const q = questions[idx];
      given = q.type === 'mc' ? null : [];
      checked = false;
      container.innerHTML = '';

      const progress = el('div', { class: 'progress' }, el('div', { class: 'progress-bar' }));
      progress.firstChild.style.width = `${(idx / questions.length) * 100}%`;
      const head = el(
        'div',
        { class: 'quiz-head' },
        el('button', {
          class: 'icon-btn',
          'aria-label': 'Abbrechen',
          text: '✕',
          onclick: () => {
            if (opts.mode === 'exam' || idx > 0) {
              if (!confirm('Runde wirklich abbrechen? Der Fortschritt dieser Runde geht verloren.')) return;
            }
            cleanup();
            opts.onExit();
          },
        }),
        progress,
        el('span', { class: 'quiz-count', text: `${idx + 1}/${questions.length}` })
      );

      const typeHint =
        q.type === 'multi' ? 'Mehrere Antworten sind richtig' : q.type === 'order' ? 'Tippe die Elemente in der richtigen Reihenfolge an' : '';
      // Frage mit 3D-Figur (ohne SVG-Bild; ohne WebGL bleibt die Fläche leer), sonst SVG-Bild
      const f3 = !q.img && !!(q.gfx && SK.fig3d && SK.fig3d.known(q.gfx));
      const card = el(
        'section',
        { class: 'quiz-card' },
        opts.title ? el('div', { class: 'quiz-title', text: opts.title }) : null,
        q.ctx && SK.kataContext ? SK.kataContext(q) : null,
        el('h2', { class: 'quiz-q', text: q.q }),
        f3 ? el('div', { class: 'quiz-f3d', html: SK.fig3d.html(q.gfx, { plain: true }) }) : null,
        q.img && !f3 ? el('img', { class: 'quiz-img', src: q.img, alt: '' }) : null,
        q.img && !f3 && q.gfx && SK.gfx.hasAnim(q.gfx) ? animButton(q) : null,
        typeHint ? el('p', { class: 'type-hint', text: typeHint }) : null
      );

      const body = el('div', { class: 'quiz-body' });
      card.append(body);

      // Leiste mit Prüfen/Weiter bleibt am unteren Rand, direkt über der Navigationsleiste
      const footer = el('div', { class: 'quiz-footer' });
      const bottombar = document.querySelector('.bottombar');
      footer.style.setProperty('--bottombar-h', `${bottombar ? bottombar.offsetHeight : 0}px`);
      const checkBtn = el('button', {
        class: 'btn primary',
        text: opts.mode === 'exam' ? 'Antwort abgeben' : 'Prüfen',
        disabled: true,
        onclick: check,
      });
      footer.append(checkBtn);

      function setReady(ok) {
        checkBtn.disabled = !ok;
      }

      if (q.type === 'mc' || q.type === 'multi') {
        const order = util.shuffle(q.options.map((_, i) => i));
        const list = el('div', { class: 'options', role: q.type === 'mc' ? 'radiogroup' : 'group' });
        order.forEach((oi, pos) => {
          const btn = el(
            'button',
            { class: 'option', 'data-i': oi, role: q.type === 'mc' ? 'radio' : 'checkbox', 'aria-checked': 'false' },
            el('span', { class: 'key', text: String(pos + 1) }),
            el('span', { class: 'label', text: q.options[oi] })
          );
          btn.addEventListener('click', () => {
            if (checked) return;
            if (q.type === 'mc') {
              given = oi;
              list.querySelectorAll('.option').forEach((b) => {
                b.classList.toggle('selected', b === btn);
                b.setAttribute('aria-checked', String(b === btn));
              });
              setReady(true);
            } else {
              const i = given.indexOf(oi);
              if (i >= 0) given.splice(i, 1);
              else given.push(oi);
              btn.classList.toggle('selected');
              btn.setAttribute('aria-checked', String(btn.classList.contains('selected')));
              setReady(given.length > 0);
            }
          });
          list.append(btn);
        });
        body.append(list);
      } else if (q.type === 'order') {
        const answerZone = el('ol', { class: 'order-answer', 'aria-label': 'Deine Reihenfolge' });
        const pool = el('div', { class: 'order-pool' });
        const shuffled = util.shuffle(q.options.map((_, i) => i));
        if (shuffled.every((v, i) => v === i) && shuffled.length > 1) shuffled.reverse();
        const redraw = () => {
          answerZone.innerHTML = '';
          given.forEach((oi) => {
            answerZone.append(
              el('li', {}, el('button', { class: 'chip placed', text: q.options[oi], onclick: () => { if (checked) return; given.splice(given.indexOf(oi), 1); redraw(); } }))
            );
          });
          pool.innerHTML = '';
          shuffled
            .filter((oi) => !given.includes(oi))
            .forEach((oi) => {
              pool.append(el('button', { class: 'chip', text: q.options[oi], onclick: () => { if (checked) return; given.push(oi); redraw(); } }));
            });
          setReady(given.length === q.options.length);
        };
        body.append(answerZone, pool);
        redraw();
      }

      function check() {
        if (checked) return;
        checked = true;
        const ok = isCorrect(q, given);
        results.push({ q, ok, given: Array.isArray(given) ? given.slice() : given });
        SK.srs.record(q.id, ok);
        store.data.asked[q.id] = 1;
        store.data.answered++;
        if (ok) store.data.correct++;
        store.save();

        if (opts.mode === 'exam') {
          next();
          return;
        }

        body.querySelectorAll('.option').forEach((b) => {
          const oi = Number(b.dataset.i);
          const right = q.type === 'mc' ? oi === q.answer : q.answer.includes(oi);
          if (right) b.classList.add('right');
          else if (b.classList.contains('selected')) b.classList.add('wrong');
          b.disabled = true;
        });
        body.querySelectorAll('.chip').forEach((b) => (b.disabled = true));

        // Kurzes Ergebnis in der Leiste; Erklärung und Quelle aufklappbar
        const more =
          q.explain || q.src
            ? el(
                'details',
                { class: 'fb-more' },
                el('summary', { text: q.explain ? 'Erklärung' : 'Quelle' }),
                q.explain ? el('p', { text: q.explain }) : null,
                q.src ? el('p', { class: 'src', text: `Quelle: ${q.src}` }) : null
              )
            : null;
        const fb = el(
          'div',
          { class: `feedback ${ok ? 'ok' : 'bad'}`, role: 'status' },
          el('strong', { text: ok ? 'Richtig!' : 'Leider falsch.' }),
          !ok ? el('p', {}, el('span', { class: 'muted', text: 'Richtig ist: ' }), correctText(q)) : null,
          more
        );
        footer.innerHTML = '';
        footer.append(fb, el('button', { class: 'btn primary', text: idx + 1 < questions.length ? 'Weiter' : 'Auswertung', onclick: next }));
        footer.querySelector('.btn').focus({ preventScroll: true });
      }

      function next() {
        idx++;
        if (idx < questions.length) render();
        else {
          cleanup();
          opts.onFinish(results);
        }
      }

      container.append(head, card, footer);

      if (keyHandler) document.removeEventListener('keydown', keyHandler);
      keyHandler = (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        if (e.key === 'Enter') {
          const btn = footer.querySelector('.btn.primary');
          if (btn && !btn.disabled && document.activeElement !== btn) {
            e.preventDefault();
            btn.click();
          }
          return;
        }
        const n = Number(e.key);
        if (!checked && n >= 1 && n <= 9) {
          const opt = body.querySelectorAll('.option, .order-pool .chip')[n - 1];
          if (opt) opt.click();
        }
      };
      document.addEventListener('keydown', keyHandler);
    }

    render();
  };

  SK.quizUtil = { isCorrect, correctText };
})();
