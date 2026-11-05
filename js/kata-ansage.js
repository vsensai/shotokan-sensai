/* Kata-Ansage: zählt eine Kata auf Japanisch im Rhythmus des Buches (fließend, langsam, Kiai) und zeigt jede Stellung
   auf einer Bodenkarte von oben (Embusen) nach der Fußskizze im Buch.
   Zeitplan, Zählwörter und Karte sind reine Funktionen (auch in der Validierung geprüft), die Ansicht nutzt Sprachausgabe und Wake Lock. */
(function () {
  'use strict';
  const { util } = SK;

  // ---------- Zählwörter ----------
  // Kana für die japanische Stimme in normaler Schreibweise. Die kurze Dojo-Aussprache („Ich“, „Shich“, „Hach“) lässt
  // sich über die Schreibweise nicht erzwingen – Dehnungszeichen und kleines っ wurden ausprobiert und verworfen.
  const KANA = ['', 'いち', 'に', 'さん', 'し', 'ご', 'ろく', 'しち', 'はち', 'く'];
  const RO = ['', 'Ichi', 'Ni', 'San', 'Shi', 'Go', 'Roku', 'Shichi', 'Hachi', 'Ku'];
  const KAN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  function count(n) {
    if (n < 10) return { kana: KANA[n], ro: RO[n], kan: KAN[n] };
    const t = Math.floor(n / 10);
    const u = n % 10;
    const tens = {
      kana: t === 1 ? 'じゅう' : `${t === 4 ? 'よん' : KANA[t]}じゅう`,
      ro: t === 1 ? 'Ju' : `${t === 4 ? 'Yon' : RO[t]}-ju`,
    };
    return {
      kana: tens.kana + KANA[u],
      ro: tens.ro + (u ? `-${RO[u].toLowerCase()}` : ''),
      kan: `${t > 1 ? KAN[t] : ''}十${KAN[u]}`,
    };
  }
  const CMD = {
    rei: { kan: '礼', ro: 'Rei', kana: 'れい' },
    yoi: { kan: '用意', ro: 'Yoi', kana: 'ようい' },
    naore: { kan: '直れ', ro: 'Naore', kana: 'なおれ' },
  };
  // Gesprochener Text: Kommandos und Zahlen mit Ausrufezeichen (straffere Betonung), beim Kiai folgt „Kiai!“.
  const KIAI = 'きあい！';
  const sayText = (st) => (st.kind === 'name' || (st.kind === 'cmd' && st.ro === 'Rei') ? st.kana : `${st.kana}！`);

  // ---------- Rhythmus ----------
  // beat = Abstand zwischen zwei normalen Bewegungen (Sekunden). Laut Buch fließend verbundene Bewegungen folgen
  // nach einem halben Schlag, langsame Bewegungen dauern 2,5 Schläge, nach einem Kiai bleibt ein halber Schlag Zanshin.
  const R = { cont: 0.5, slow: 2.5, kiai: 1.5, name: 2.2, rei: 2.6, yoi: 2.4, end: 2, naore: 2.6 };
  SK.ansageRhythm = R;

  function moveGap(k, n, beat) {
    if (k.continuous.some((g) => g.includes(n) && g.includes(n + 1))) return R.cont * beat;
    if (k.slow.includes(n)) return R.slow * beat;
    if (k.kiai.includes(n)) return R.kiai * beat;
    return beat;
  }

  // ---------- Ruhige Füße und saubere Stände ----------
  // Die Stellungen sind aus den Fußskizzen vermessen. Jede Skizze ist für sich gezeichnet: Füße, die stehen bleiben, liegen
  // im nächsten Bild oft eine halbe Fußlänge daneben, und die Schritte sind mal gestaucht, mal gestreckt. Daraus wird eine
  // Karte, wie die Kata gemeint ist:
  // 1. Stehende Füße: Laut Fußarbeit (h) bleibt ein Fuß stehen bei „Stand bleibt“ (auch die Richtung), „Füße bleiben“,
  //    „linker Fuß bleibt“, „linkes Bein trägt“ o. Ä. oder wenn nur der andere Fuß als bewegt genannt ist; ohne Angabe gilt
  //    alles unter der Messstreuung (STILL) als nicht bewegt. Ein stehender Fuß hat über alle diese Stellungen genau einen
  //    Platz – auch wenn er sich auf der Stelle dreht.
  // 2. Ausgleich: Jedes Bild darf als Ganzes etwas verrutscht sein. Die Plätze aller Füße und der Versatz jedes Bildes werden
  //    so bestimmt, dass sie insgesamt am besten zu den Skizzen passen (kleinste Fehlerquadrate). Ein Fuß, der in der Skizze
  //    genau auf einer Embusen-Linie steht, bleibt auf ihr; Rei, Yoi, Naore und das Ende liegen fest am Start. Im Bild, in dem
  //    ein Fuß ankommt, zählt zusätzlich seine Lage zum stehenden Fuß (W_STANCE), damit der Stand Breite und Länge behält.
  // 3. Gleichmäßige Stände werden ausgerichtet: Musubi-, Heisoku-, Hachiji- und Kiba-dachi symmetrisch mit Fersen auf einer
  //    Linie (bei Musubi- und Hachiji-dachi liegt die Mitte der Fersen auf der nahen Embusen-Linie, bei Heisoku- und
  //    Kiba-dachi die Fußmitte). Bei Zenkutsu-dachi zeigt der vordere Fuß ZEN_IN nach innen, der hintere mindestens
  //    ZEN_OUT_MIN nach außen; bei Kokutsu-dachi zeigt der vordere Fuß genau in Körperrichtung und der hintere quer (wie in
  //    den Einzelskizzen des Buches, docs/fussskizzen.md).
  // Eine Stellung mit free: true rastet nicht auf Embusen-Linien ein (Punkt 2 und 3), z. B. wenn die Füße im Buch knapp
  // neben einer Linie stehen (Kanku Dai 53–64).
  const STILL = { d: 0.12, deg: 20 };
  const PIN_MAX = 0.6; // weiter versetzt die Skizze einen Fuß nur, wenn er sich wirklich bewegt
  const SNAP = 0.1; // so nah an einer Embusen-Linie wird der Stand auf sie gesetzt
  const ON_LINE = 0.03; // so nah an einer Linie steht ein Fuß in der Skizze „auf“ ihr
  const KOSA_BACK = 0.1; // so weit steht im Kosa-dachi der gekreuzte Fuß hinter dem tragenden
  const KOSA_TURN = 25; // so weit darf er gegen die Körperrichtung verdreht sein
  const KOSA_SIDE = 0.14; // so weit steht beim Kreuzschritt in Tekki („Ashi-mae Kosa“) der kreuzende Fuß neben dem anderen
  const ZEN_IN = 15; // so weit zeigt im Zenkutsu-dachi der vordere Fuß nach innen (Einzelskizzen: 4–27°, im Mittel 15°)
  const ZEN_OUT = 25; // … und der hintere nach außen (Einzelskizzen: 14–39°, im Mittel 24°), falls er weniger als ZEN_OUT_MIN zeigt
  const ZEN_OUT_MIN = 10;
  const NEAR = 0.2; // so nah an einer Linie steht ein gleichmäßiger Stand (Kiba-dachi …) in der Skizze auf ihr
  const HEEL = 0.068; // Fersenmitte hinter der Fußmitte (Karteneinheiten, Fußabdruck in Kartengröße)
  const angDiff = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
  const norm = (d) => ((Math.round(d) % 360) + 360) % 360;
  const toe = (d) => [Math.sin((d * Math.PI) / 180), Math.cos((d * Math.PI) / 180)];
  const r2 = (v) => Math.round(v * 100) / 100;
  const mid = (f) => [(f[0][0] + f[1][0]) / 2, (f[0][1] + f[1][1]) / 2];
  const SIDE = ['linke', 'rechte'];
  const re = (s) => new RegExp(s, 'i');
  const STAY = SIDE.map((s) => re(`${s}r Fuß bleibt|${s}s Bein trägt|${s}s Knie bleibt|Gewicht aufs ${s} Bein|Hüfte über den ${s}n Fuß|${s}r Fuß hebt.*wieder ab`));
  const MOVE = SIDE.map((s) => re(`${s}r Fuß (gleitet|schwingt|tritt|setzt|zieht|rückt|stampft|schließt|kreuzt|geht)|${s}r Fuß zum`));
  const BOTH = /beide Füße gleiten|Yori-ashi|Sprung|Tobikomi/i;
  // Linie, auf der ein Punkt liegt: [Achse (0 = x, 1 = y), Wert] oder nichts
  const lineAt = (x, l, tol) => {
    if (l[1] === l[3] && Math.abs(x[1] - l[1]) < tol && x[0] > Math.min(l[0], l[2]) - SNAP && x[0] < Math.max(l[0], l[2]) + SNAP) return [1, l[1]];
    if (l[0] === l[2] && Math.abs(x[0] - l[0]) < tol && x[1] > Math.min(l[1], l[3]) - SNAP && x[1] < Math.max(l[1], l[3]) + SNAP) return [0, l[0]];
    return null;
  };

  // Welche Füße behalten ihren Platz gegenüber der vorigen Stellung? 'stand' = alles bleibt wie vorher
  function pins(h, prev, f, move) {
    if (/^(Langsam: )?Stand bleibt/.test(h)) return 'stand';
    if (/^(Langsam: )?Füße bleiben/.test(h)) return [true, true];
    const d = f.map((x, i) => Math.hypot(x[0] - prev[i][0], x[1] - prev[i][1]));
    const said = [0, 1].map((i) => !BOTH.test(h) && (STAY[i].test(h) || (MOVE[1 - i].test(h) && !MOVE[i].test(h))));
    return [0, 1].map((i) => (said[i] && d[i] < PIN_MAX && prev[i][3] > 0 && f[i][3] > 0) || (move && d[i] < STILL.d));
  }

  // Punkt auf nahe Embusen-Linien setzen
  function snapToLines(m, lines) {
    lines.forEach((l) => {
      const on = lineAt(m, l, SNAP);
      if (on) m[on[0]] = on[1];
    });
    return m;
  }
  // Gleichmäßige Stände: splay = Öffnung je Fuß, gap = fester Abstand der Bezugspunkte, heel = Bezugspunkt Ferse statt Fußmitte
  const SYM = [
    [/musubi/i, { splay: 30, gap: 0.06, heel: true }],
    [/heisoku/i, { splay: 0, gap: 0.1, either: true }],
    [/hachiji/i, { heel: true }],
    [/kiba/i, { splay: 0, either: true }],
  ];
  // Bezugspunkt eines gleichmäßigen Standes: Ferse (heel) oder Fußmitte; bei parallelen Füßen (either) das, was in der
  // Skizze näher an einer Linie liegt – Tekki zeichnet die Füße mit der Mitte, Heian Sandan und Jion mit den Fersen auf der Linie
  const symFwd = (f) => {
    const [s0, s1] = [toe(f[0][2]), toe(f[1][2])];
    const fwd = (Math.atan2(s0[0] + s1[0], s0[1] + s1[1]) * 180) / Math.PI;
    const near = Math.round(fwd / 45) * 45;
    return angDiff(fwd, near) < 15 ? near : fwd;
  };
  function symHeel(o, f, lines) {
    if (!o.either) return o.heel ? HEEL : 0;
    const c = symFwd(f) % 180 ? 0 : 1; // nur Linien quer zur Zehenrichtung zählen
    const gap = (k) => {
      const m = mid(f.map((x) => [x[0] - k * toe(x[2])[0], x[1] - k * toe(x[2])[1]]));
      return Math.min(1, ...lines.map((l) => (l[c] === l[c + 2] ? Math.abs(m[c] - l[c]) : 1)));
    };
    return gap(HEEL) < gap(0) ? HEEL : 0;
  }
  // f: Füße nach dem Ausgleich, pin: Fuß steht wie in der Stellung davor (dreht höchstens auf der Stelle)
  function shape(f, stance, body, pin, lines, heel) {
    const sym = SYM.find(([rx]) => rx.test(stance));
    if (sym) {
      const o = sym[1];
      const fwd = symFwd(f);
      const splay = o.splay != null ? o.splay : Math.round(angDiff(f[0][2], f[1][2]) / 10) * 5;
      const dir = [norm(fwd - splay), norm(fwd + splay)];
      const k = heel != null ? heel : symHeel(o, f, lines);
      const at = (x, d) => [x[0] - k * toe(d)[0], x[1] - k * toe(d)[1]]; // Bezugspunkt eines Fußes
      const anchor = f.map((x, i) => at(x, pin[i] ? dir[i] : x[2]));
      const right = toe(fwd + 90);
      const gap = o.gap != null ? o.gap : Math.abs((anchor[1][0] - anchor[0][0]) * right[0] + (anchor[1][1] - anchor[0][1]) * right[1]);
      if (!pin[0] && !pin[1]) {
        const m = snapToLines([(anchor[0][0] + anchor[1][0]) / 2, (anchor[0][1] + anchor[1][1]) / 2], lines);
        anchor[0] = [m[0] - (right[0] * gap) / 2, m[1] - (right[1] * gap) / 2];
        anchor[1] = [m[0] + (right[0] * gap) / 2, m[1] + (right[1] * gap) / 2];
      } else if (pin[0] !== pin[1]) {
        // um den stehenden Fuß herum aufbauen; liegt der Stand dann knapp neben einer Linie, rückt er ganz darauf –
        // den stehenden Fuß korrigiert steadyRun dann auch in den Stellungen davor, damit er nicht springt.
        // Ein stehender Fuß, der schon genau auf einer Linie steht, bleibt dort (z. B. Heisoku-dachi neben der Mittellinie).
        const i = pin[0] ? 0 : 1;
        const s = i ? -1 : 1;
        anchor[1 - i] = [anchor[i][0] + s * right[0] * gap, anchor[i][1] + s * right[1] * gap];
        const m = [(anchor[0][0] + anchor[1][0]) / 2, (anchor[0][1] + anchor[1][1]) / 2];
        const [mx, my] = snapToLines(m.slice(), lines);
        // (ganz kleine Versätze, etwa weil die Ferse beim Ausdrehen wandert, bleiben – sonst rückten die Stände davor mit)
        const small = (v) => (Math.abs(v) < 0.015 ? 0 : v);
        if (!lines.some((l) => lineAt(f[i], l, 0.005))) anchor.forEach((p) => { p[0] += small(mx - m[0]); p[1] += small(my - m[1]); });
      }
      return f.map((x, i) => (pin[i] && pin[1 - i] ? [x[0], x[1], dir[i], x[3]] : [r2(anchor[i][0] + k * toe(dir[i])[0]), r2(anchor[i][1] + k * toe(dir[i])[1]), dir[i], x[3]]));
    }
    const zen = /zenkutsu/i.test(stance);
    if (!zen && !/kokutsu/i.test(stance)) return f;
    // vorne: bei Zenkutsu-dachi trägt der vordere Fuß mehr, bei Kokutsu-dachi der hintere
    const front = (f[0][3] > f[1][3]) === zen ? 0 : 1;
    return f.map((x, i) => {
      let d = x[2];
      // der vordere Fuß: bei Zenkutsu-dachi leicht nach innen (links im Uhrzeigersinn, rechts dagegen), sonst gerade
      if (i === front && angDiff(d, body) <= 30) d = zen ? body + (i ? -ZEN_IN : ZEN_IN) : body;
      // der hintere Fuß zeigt bei Zenkutsu-dachi nach außen – auch wenn er vorher als vorderer Fuß eingedreht stand
      const out = (((d - body + 540) % 360) - 180) * (i ? 1 : -1); // nach außen positiv
      if (i !== front && zen && out < ZEN_OUT_MIN && out > -90) d = body + (i ? ZEN_OUT : -ZEN_OUT);
      if (i !== front && !zen) {
        const across = angDiff(d, body + 90) < angDiff(d, body - 90) ? body + 90 : body - 90;
        if (angDiff(d, across) <= 30) d = across;
      }
      return [x[0], x[1], norm(d), x[3]];
    });
  }

  // Ausgleich (Punkt 2): Unbekannte sind der Platz jedes Fußes, solange er steht (seg), und der Versatz jedes Bildes (off).
  // Gleichungen: Platz + Versatz ≈ Messung; Versatz ≈ 0 (schwach, bei Rei/Yoi/Naore/Ende stark); Fuß auf einer Linie ≈ Linie.
  // Gelöst wird abwechselnd nach Plätzen und Versätzen (Gauß-Seidel), das konvergiert für diese kleinen Systeme schnell.
  const W_OFF = 0.3;
  const W_FRAME = 20;
  const W_LINE = 4;
  const W_SYM = 1; // gleichmäßiger Stand nahe einer Linie – schwächer als ein Fuß, der in der Skizze auf ihr steht
  // Ein Fuß, der stehen bleibt, hat in allen diesen Bildern einen Platz; die Übersichtsskizze zeichnet ihn aber von Bild zu
  // Bild leicht verschieden. Damit der Stand des Bildes, in dem der andere Fuß ankommt, dabei nicht Breite oder Länge
  // verliert, gilt dort zusätzlich: ankommender Fuß − stehender Fuß ≈ wie in der Skizze (Gewicht W_STANCE). Zu stark
  // gewichtet, würden sich die kleinen Zeichenfehler über die Kata aufsummieren und sie endete nicht am Startpunkt.
  const W_STANCE = 3;
  function balance(raw, seg, nSeg, frame, lines, extra) {
    // je Bild und Achse: [ankommender Fuß, stehender Fuß], wenn genau einer ankommt
    const stance = raw.map((p, j) => [0, 1].map((c) => {
      if (!j || frame[j]) return null;
      const arr = [0, 1].filter((i) => seg[j][i][c] !== seg[j - 1][i][c]);
      return arr.length === 1 ? [arr[0], 1 - arr[0]] : null;
    }));
    const pos = Array.from({ length: nSeg }, () => [0, 0]); // je Platz nur die Achse c genutzt, zu der er gehört
    const off = raw.map(() => [0, 0]);
    const onL = raw.map((p, j) => p.f.map((x, i) => (p.free ? [] : lines.map((l) => lineAt(x, l, ON_LINE)).filter(Boolean)).concat(extra[j][i])));
    for (let it = 0; it < 400; it++) {
      const sum = pos.map(() => [0, 0]);
      const cnt = pos.map(() => [0, 0]);
      raw.forEach((p, j) => p.f.forEach((x, i) => {
        for (let c = 0; c < 2; c++) { const s = seg[j][i][c]; sum[s][c] += x[c] - off[j][c]; cnt[s][c] += 1; }
        onL[j][i].forEach(([c, v, w = W_LINE]) => { const s = seg[j][i][c]; sum[s][c] += w * v; cnt[s][c] += w; });
      }));
      raw.forEach((p, j) => stance[j].forEach((st, c) => {
        if (!st) return;
        const [m, t] = st.map((i) => seg[j][i][c]);
        const rel = p.f[st[0]][c] - p.f[st[1]][c];
        sum[m][c] += W_STANCE * (pos[t][c] + rel); cnt[m][c] += W_STANCE;
        sum[t][c] += W_STANCE * (pos[m][c] - rel); cnt[t][c] += W_STANCE;
      }));
      pos.forEach((q, s) => { for (let c = 0; c < 2; c++) if (cnt[s][c]) q[c] = sum[s][c] / cnt[s][c]; });
      raw.forEach((p, j) => {
        const w = frame[j] ? W_FRAME : W_OFF;
        for (let c = 0; c < 2; c++) off[j][c] = p.f.reduce((t, x, i) => t + x[c] - pos[seg[j][i][c]][c], 0) / (2 + w);
      });
    }
    return { pos, off };
  }

  const steadyCache = new WeakMap();
  function steadyPoses(k) {
    if (steadyCache.has(k)) return steadyCache.get(k);
    const out = steadyRun(k);
    steadyCache.set(k, out);
    return out;
  }
  function steadyRun(k) {
    const a = k.ansage;
    const yoiStance = k.yoi.split(',')[0];
    const raw = [a.rei, a.yoi].concat(a.moves, [a.naore, a.end]);
    const stances = ['Musubi-dachi', yoiStance].concat(k.seq.map((r) => r[1]), [yoiStance, 'Musubi-dachi']);
    const frame = raw.map((p, j) => j < 2 || j >= raw.length - 2);
    // Punkt 1: wer steht? Daraus die Plätze (seg = Nummer des Platzes je Bild, Fuß und Achse x/y)
    const pin = raw.map((p, j) => (j ? pins(p.h, raw[j - 1].f, p.f, !frame[j]) : [false, false]));
    // Yori-ashi: der Stand gleitet nur in eine Richtung – quer dazu bleiben beide Füße, wo sie waren
    const slide = raw.map((p, j) => {
      if (!j || !/Yori-ashi/.test(p.h) || pin[j] === 'stand') return null;
      const d = [0, 1].map((c) => Math.abs(p.f[0][c] - raw[j - 1].f[0][c]) + Math.abs(p.f[1][c] - raw[j - 1].f[1][c]));
      if (Math.min(...d) > 0.3 * Math.max(...d)) return null; // mit Drehung (z. B. Jion 46): kein reines Gleiten
      return d[0] > d[1] ? 1 : 0; // Achse, die gleich bleibt
    });
    let nSeg = 0;
    const seg = [];
    raw.forEach((p, j) => {
      const keep = pin[j] === 'stand' ? [true, true] : pin[j];
      seg.push([0, 1].map((i) => [0, 1].map((c) => (j && (keep[i] || slide[j] === c) ? seg[j - 1][i][c] : nSeg++))));
    });
    const root = Array.from({ length: nSeg }, (v, i) => i);
    const find = (x) => (root[x] === x ? x : (root[x] = find(root[x])));
    // „Fuß rückt/zieht heran“: er gleitet auf der Linie zum anderen Fuß, quer dazu bleibt er (Heian Yondan 8)
    raw.forEach((p, j) => {
      const hm = j && /(linke|rechte)r Fuß (rückt|zieht) (einen halben Schritt )?heran/i.exec(p.h);
      if (!hm || pin[j] === 'stand') return;
      const i = /^l/i.test(hm[1]) ? 0 : 1;
      const q = raw[j - 1].f;
      const ang = Math.abs((Math.atan2(q[1][1] - q[0][1], q[1][0] - q[0][0]) * 180) / Math.PI) % 90;
      if (pin[j][i] || (ang > 20 && ang < 70)) return;
      const c = Math.abs(q[1][0] - q[0][0]) > Math.abs(q[1][1] - q[0][1]) ? 1 : 0; // Achse quer zur Verbindungslinie
      root[find(seg[j][i][c])] = find(seg[j - 1][i][c]);
    });
    // gleichmäßige Stände schon im Ausgleich: beide Füße gleich weit vorne (bei Kiba-dachi quer zur Linie also gleich hoch),
    // und liegt der Stand nahe an einer Linie (bis NEAR), soll sein Bezugspunkt auf ihr liegen
    const extra = raw.map(() => [[], []]);
    const heelAt = raw.map(() => null); // Bezugspunkt je Bild, aus der Skizze bestimmt
    raw.forEach((p, j) => {
      const sym = SYM.find(([rx]) => rx.test(stances[j]));
      if (!sym) return;
      const fwd = symFwd(p.f);
      if (fwd % 90) return;
      const c = fwd % 180 ? 0 : 1; // Achse, auf der beide Füße gleich weit vorne stehen
      root[find(seg[j][0][c])] = find(seg[j][1][c]);
      const k = symHeel(sym[1], p.f, a.lines);
      heelAt[j] = k;
      const back = p.f.map((x) => k * toe(x[2])[c]);
      const m = (p.f[0][c] - back[0] + p.f[1][c] - back[1]) / 2;
      const line = a.lines.find((l) => l[c] === l[c + 2] && Math.abs(m - l[c]) < NEAR);
      if (line && !p.free) p.f.forEach((x, i) => extra[j][i].push([c, line[c] + back[i], W_SYM]));
    });
    seg.forEach((sj) => sj.forEach((si) => { si[0] = find(si[0]); si[1] = find(si[1]); }));
    const { pos, off } = balance(raw, seg, nSeg, frame, a.lines, extra);
    // Punkt 3 der Reihe nach, Richtungen: ein stehender Fuß behält seine Richtung, wenn er kaum dreht
    const done = [];
    raw.forEach((m, j) => {
      const prev = done[j - 1];
      const held = pin[j] === 'stand' ? [true, true] : pin[j];
      let f = m.f.map((x, i) => {
        const d = held[i] && (pin[j] === 'stand' || angDiff(x[2], prev.f[i][2]) < STILL.deg) ? prev.f[i][2] : x[2];
        return held[i] ? [prev.f[i][0], prev.f[i][1], d, x[3]] : [r2(pos[seg[j][i][0]][0]), r2(pos[seg[j][i][1]][1]), d, x[3]];
      });
      if (pin[j] !== 'stand') {
        f = shape(f, stances[j], m.body, held, m.free ? [] : a.lines, heelAt[j]);
        // Kosa-dachi (gekreuzter Fuß dahinter; der Kreuzschritt in Tekki heißt nur „Kosa“): der Ballenfuß steht
        // mindestens KOSA_BACK hinter dem tragenden Fuß
        if (/kosa-dachi/i.test(stances[j])) {
          const r = f[0][3] < f[1][3] ? 0 : 1;
          const u = toe(m.body);
          const ahead = (f[r][0] - f[1 - r][0]) * u[0] + (f[r][1] - f[1 - r][1]) * u[1];
          if (!held[r] && ahead > -KOSA_BACK) f[r] = [r2(f[r][0] - u[0] * (ahead + KOSA_BACK)), r2(f[r][1] - u[1] * (ahead + KOSA_BACK))].concat(f[r].slice(2));
          // und zeigt ungefähr nach vorne: höchstens KOSA_TURN gegen die Körperrichtung verdreht
          const turn = ((f[r][2] - m.body + 540) % 360) - 180;
          if (Math.abs(turn) > KOSA_TURN) f[r] = f[r].slice(0, 2).concat(norm(m.body + Math.sign(turn) * KOSA_TURN), f[r][3]);
        }
        // Kreuzschritt in Tekki: der genannte Fuß kreuzt vor dem anderen auf dessen andere Seite und steht auf dem Ballen
        // direkt daneben, mindestens KOSA_SIDE weit
        // (nur beim seitlichen Kreuzschritt wie in Tekki; in Hangetsu 27 und 33 kreuzt der Fuß nach vorne in Blickrichtung)
        const cross = /^(hidari|migi) ashi-mae kosa$/i.exec(stances[j]);
        const ahead = (c) => { const v = toe(m.body); return Math.abs((f[c][0] - prev.f[c][0]) * v[0] + (f[c][1] - prev.f[c][1]) * v[1]); };
        const sideways = (c) => { const v = toe(m.body + 90); return Math.abs((f[c][0] - prev.f[c][0]) * v[0] + (f[c][1] - prev.f[c][1]) * v[1]); };
        if (cross && sideways(/^h/i.test(cross[1]) ? 0 : 1) >= ahead(/^h/i.test(cross[1]) ? 0 : 1)) {
          const c = /^h/i.test(cross[1]) ? 0 : 1;
          const s = c ? -1 : 1; // der linke Fuß kreuzt nach rechts, der rechte nach links
          const u = toe(m.body + 90);
          const side = s * ((f[c][0] - f[1 - c][0]) * u[0] + (f[c][1] - f[1 - c][1]) * u[1]);
          if (!held[c] && side < KOSA_SIDE) f[c] = [r2(f[c][0] + s * u[0] * (KOSA_SIDE - side)), r2(f[c][1] + s * u[1] * (KOSA_SIDE - side))].concat(f[c].slice(2));
        }
        // gleichmäßiger Stand hat einen stehenden Fuß versetzt: auch in den Stellungen davor, damit er nicht springt.
        // In einem gleichmäßigen Stand davor rückt der ganze Stand mit (sonst würde er schief), dann auch der andere Fuß
        // in den Stellungen vor diesem Stand.
        held.forEach((on, i) => {
          if (!on) return;
          const [ox, oy] = prev.f[i];
          const dx = f[i][0] - ox;
          const dy = f[i][1] - oy;
          if (!dx && !dy) return;
          const live = { [i]: [ox, oy] };
          for (let q = done.length - 1; q >= 0; q--) {
            const g = done[q].f;
            Object.keys(live).forEach((t) => { if (g[t][0] !== live[t][0] || g[t][1] !== live[t][1]) delete live[t]; });
            if (!Object.keys(live).length) break;
            if (SYM.some(([rx]) => rx.test(stances[q]))) [0, 1].forEach((t) => { if (!live[t]) live[t] = g[t].slice(0, 2); });
            done[q].f = g.map((x, t) => (live[t] ? [r2(x[0] + dx), r2(x[1] + dy)].concat(x.slice(2)) : x));
          }
        });
      }
      const via = m.via && [m.via[0], r2(m.via[1] - off[j][0]), r2(m.via[2] - off[j][1]), m.via[3]];
      done.push(Object.assign({}, m, { f }, via ? { via } : {}));
    });
    const n = done.length;
    return { rei: done[0], yoi: done[1], moves: done.slice(2, n - 2), naore: done[n - 2], end: done[n - 1] };
  }
  SK.ansagePoses = steadyPoses;

  // Liefert alle Ansagen mit Zeitpunkt t (Sekunden ab Start). frame = Name, Rei, Yoi vorab und Naore, Rei am Ende.
  SK.ansageTimeline = function (k, beat, frame) {
    const steps = [];
    let t = 0;
    const a = k.ansage;
    const poses = steadyPoses(k);
    const cmd = (key, extra) => Object.assign({ kind: 'cmd', t }, CMD[key], extra);
    if (frame) {
      steps.push({ kind: 'name', t, kan: '型', ro: k.name, kana: a.kana, stance: 'Musubi-dachi', pose: poses.rei });
      t += R.name;
      steps.push(cmd('rei', { stance: 'Musubi-dachi', pose: poses.rei }));
      t += R.rei;
      steps.push(cmd('yoi', { stance: k.yoi.split(',')[0], note: k.yoi, pose: poses.yoi }));
      t += Math.max(R.yoi, beat);
    }
    k.seq.forEach((r) => {
      const n = r[0];
      // gezählt wird wie im Dojo nur bis Ju (10), danach wieder ab Ichi
      steps.push(Object.assign({ kind: 'move', t, n, stance: r[1], tech: r[2], note: r[4] || '', page: r[3], pose: poses.moves[n - 1],
        kiai: k.kiai.includes(n), slow: k.slow.includes(n), cont: k.continuous.some((g) => g.includes(n)) }, count(((n - 1) % 10) + 1)));
      t += n < k.moves ? moveGap(k, n, beat) : R.end * beat;
    });
    if (frame) {
      steps.push(cmd('naore', { stance: k.yoi.split(',')[0], note: k.naore, pose: poses.naore }));
      t += R.naore;
      steps.push(cmd('rei', { stance: 'Musubi-dachi', pose: poses.end }));
    }
    // vorherige Stellung für Drehung und Fußspuren; vor Bewegung 1 ist das Yoi
    steps.forEach((st, i) => {
      st.prev = i ? steps[i - 1].pose : poses.yoi;
      st.say = sayText(st);
    });
    return steps;
  };
  SK.ansageCount = count;
  SK.ansageKata = () => SK.kataOrder.filter((id) => SK.kata[id].ansage);

  // ---------- Bodenkarte (Embusen von oben) ----------
  // Nur die Füße, die sich bewegt haben, bleiben blass an der alten Stelle – sonst wird die Karte unübersichtlich.
  // Gestrichelt (rot) ist ein angehobener Fuß der aktuellen Stellung.
  const U = 250; // Karteneinheiten je halbe Grundlinie
  const P = (x, y) => [Math.round(x * U), Math.round(-y * U)];
  const rad = (d) => ((d - 90) * Math.PI) / 180;
  const pt = (x, y, d, r) => [Math.round(x + Math.cos(rad(d)) * r), Math.round(y + Math.sin(rad(d)) * r)];
  // Spur nur, wenn der Fuß den Platz wechselt – ein Fuß, der auf der Stelle dreht, steht ja noch da
  const moved = (a, b) => a[0] !== b[0] || a[1] !== b[1];
  // Füße als je drei Kreise (Ferse, Mitte, Zehen) – daran weichen Pfeile und Drehbogen aus
  const CLEAR = 20;
  const footDots = (feet) => feet.flatMap(([x, y, r]) => [-26, -6, 14].map((ly) => [x - ly * Math.sin((r * Math.PI) / 180), y + ly * Math.cos((r * Math.PI) / 180), CLEAR]));
  // Pfeil beginnt hinter den Füßen, die in seiner Richtung liegen, damit er sie nicht übermalt
  function arrowStart(x, y, d, dots) {
    const ux = Math.cos(rad(d));
    const uy = Math.sin(rad(d));
    const hits = dots
      .map(([px, py, c]) => [(px - x) * ux + (py - y) * uy, Math.abs((px - x) * uy - (py - y) * ux), c])
      .filter(([, s, c]) => s < c + 8)
      .sort((a, b) => a[0] - b[0]);
    let r0 = 40;
    hits.forEach(([t, , c]) => { if (t + c > r0 && t - c < r0 + 52) r0 = Math.round(t + c); });
    return r0;
  }
  // Passt der Pfeil hinter den Füßen nicht mehr in die Karte, läuft er seitlich versetzt neben ihnen vorbei
  function placeArrow(x, y, d, dots, box) {
    const inside = ([qx, qy]) => qx > box[0] + 8 && qx < box[1] - 8 && qy > -box[3] + 8 && qy < -box[2] - 8;
    const tries = [0, 34, -34, 60, -60].map((o) => {
      const [ox, oy] = pt(x, y, d + 90, o);
      return [ox, oy, arrowStart(ox, oy, d, dots)];
    });
    return tries.find(([ox, oy, r0]) => inside(pt(ox, oy, d, r0 + 52))) || tries[0];
  }
  function arrow(x, y, d, cls, r0) {
    const [ax, ay] = pt(x, y, d, r0 + 52);
    const [bx, by] = pt(x, y, d, r0);
    const [l1x, l1y] = pt(ax, ay, d + 150, 15);
    const [l2x, l2y] = pt(ax, ay, d - 150, 15);
    return `<path class="${cls}" d="M${bx} ${by} L${ax} ${ay} M${l1x} ${l1y} L${ax} ${ay} L${l2x} ${l2y}"/>`;
  }
  // Blick als Sichtkegel: schmaler Fächer vom Kopf weg, mit Punkt am Ansatz – kein Pfeil, damit er nicht nach Bewegung aussieht
  function gaze(x, y, d, r0) {
    const [bx, by] = pt(x, y, d, r0);
    const [ax, ay] = pt(x, y, d, r0 + 84);
    const [l1x, l1y] = pt(bx, by, d - 26, 88);
    const [l2x, l2y] = pt(bx, by, d + 26, 88);
    return `<path class="emb-gaze" d="M${bx} ${by} L${l1x} ${l1y} Q${ax} ${ay} ${l2x} ${l2y} Z"/><circle class="emb-eye" cx="${bx}" cy="${by}" r="5"/>`;
  }
  const arrowDots = (x, y, d, r0) => Array.from({ length: 7 }, (_, j) => [...pt(x, y, d, r0 + j * 9), 12]);
  // Radius des Drehbogens so wählen, dass er an Füßen und Pfeilen vorbei und innerhalb der Karte bleibt (sonst der mit den wenigsten Treffern)
  function arcRadius(x, y, from, deg, dots, box) {
    let best = 108;
    let least = Infinity;
    [108, 92, 125, 78, 145, 64, 165].some((r) => {
      let n = 0;
      for (let a = 0; a <= Math.abs(deg); a += 5) {
        const [qx, qy] = pt(x, y, from + Math.sign(deg) * a, r);
        n += dots.filter(([px, py, c]) => Math.hypot(px - qx, py - qy) < c + 4).length;
        if (qx < box[0] + 10 || qx > box[1] - 10 || qy < -box[3] + 10 || qy > -box[2] - 10) n += 3;
      }
      if (n < least) [best, least] = [r, n];
      return !n;
    });
    return best;
  }
  function turnArc(x, y, from, deg, r) {
    const to = from + deg;
    const [sx, sy] = pt(x, y, from, r);
    const [ex, ey] = pt(x, y, to, r);
    const back = to + (deg > 0 ? -100 : 100);
    const [h1x, h1y] = pt(ex, ey, back - 35, 14);
    const [h2x, h2y] = pt(ex, ey, back + 35, 14);
    // in Stücken bis 120° – ein einzelner Bogen über eine ganze Drehung (Start = Ende) würde nicht gezeichnet
    const parts = Math.ceil(Math.abs(deg) / 120);
    let d = `M${sx} ${sy}`;
    for (let i = 1; i <= parts; i++) {
      const [qx, qy] = pt(x, y, from + (deg * i) / parts, r);
      d += ` A${r} ${r} 0 0 ${deg > 0 ? 1 : 0} ${qx} ${qy}`;
    }
    return `<path class="emb-turn" d="${d}"/><path class="emb-turn-head" d="M${h1x} ${h1y} L${ex} ${ey} L${h2x} ${h2y}"/>`;
  }
  // Zwischenstellung (via): Fuß zieht heran und kehrt zurück – Doppelpfeil zwischen beiden Stellen
  function viaArrow(a, b) {
    const d = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI + 90;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const [ox, oy] = pt(a[0], a[1], d - 90, 34); // seitlich versetzt, damit der Körperpfeil ihn nicht verdeckt
    const [sx, sy] = pt(ox, oy, d, 4);
    const [ex, ey] = pt(ox, oy, d, len - 4);
    const head = (x, y, dd) => { const [h1x, h1y] = pt(x, y, dd + 150, 14); const [h2x, h2y] = pt(x, y, dd - 150, 14); return `M${h1x} ${h1y} L${x} ${y} L${h2x} ${h2y}`; };
    return `<path class="emb-via" d="M${sx} ${sy} L${ex} ${ey}"/><path class="emb-via-head" d="${head(ex, ey, d)} ${head(sx, sy, d + 180)}"/>`;
  }
  // Ausschnitt fest je Kata, damit die Karte beim Zählen nicht springt. Das Embusen (Linien) steht in der Mitte;
  // jede Kata füllt die Karte so gut es geht, damit die Füße möglichst groß erscheinen.
  function reach(k) {
    const a = steadyPoses(k);
    const L = k.ansage.lines;
    const lx = L.flatMap((l) => [l[0], l[2]]);
    const ly = L.flatMap((l) => [l[1], l[3]]);
    const cx = (Math.min(...lx) + Math.max(...lx)) / 2;
    const cy = (Math.min(...ly) + Math.max(...ly)) / 2;
    const pts = [a.rei, a.yoi, a.naore, a.end].concat(a.moves).flatMap((p) => p.f).concat(L.flatMap((l) => [[l[0], l[1]], [l[2], l[3]]]));
    return [cx, cy, Math.max(...pts.map((f) => Math.abs(f[0] - cx))), Math.max(...pts.map((f) => Math.abs(f[1] - cy)))];
  }
  // aspect (Breite / Höhe der Karte): der Ausschnitt wird in der kürzeren Richtung erweitert, damit das Raster die Karte füllt
  function bounds(k, aspect) {
    const [cx, cy, rx, ry] = reach(k);
    let hx = rx + 0.45;
    let hy = ry + 0.45;
    if (aspect) {
      if (hx / hy < aspect) hx = hy * aspect;
      else hy = hx / aspect;
    }
    return [cx - hx, cx + hx, cy - hy, cy + hy].map((v) => v * U);
  }
  SK.embusenSvg = function (k, pose, prev, aspect) {
    const a = k.ansage;
    const [x0, x1, y0, y1] = bounds(k, aspect);
    let g = '';
    for (let x = Math.ceil(x0 / 50) * 50; x <= x1; x += 50) g += `M${x} ${-y1} V${-y0}`;
    for (let y = Math.ceil(y0 / 50) * 50; y <= y1; y += 50) g += `M${x0} ${-y} H${x1}`;
    let svg = `<path class="emb-grid" d="${g}"/>`;
    svg += `<path class="emb-line" d="${a.lines.map(([ax, ay, bx, by]) => `M${P(ax, ay).join(' ')} L${P(bx, by).join(' ')}`).join(' ')}"/>`;
    svg += `<text class="emb-txt" x="0" y="${Math.round(-y1 + 30)}" text-anchor="middle">Shomen</text>`;
    const side = (i) => (i ? 'R' : 'L');
    if (prev) prev.f.forEach((f, i) => { if (moved(f, pose.f[i])) svg += SK.gfx.foot(...P(f[0], f[1]), f[2], 0, { side: side(i), scale: 1, was: true }); });
    const [cx, cy] = P((pose.f[0][0] + pose.f[1][0]) / 2, (pose.f[0][1] + pose.f[1][1]) / 2);
    const dots = footDots(pose.f.map((f) => [...P(f[0], f[1]), f[2]]).concat(pose.via ? [[...P(pose.via[1], pose.via[2]), pose.via[3]]] : []));
    const box = [x0, x1, y0, y1];
    const body = placeArrow(cx, cy, pose.body, dots, box);
    const look = pose.look != null ? placeArrow(cx, cy, pose.look, dots, box) : null;
    if (pose.turn && prev) {
      const busy = dots.concat(arrowDots(body[0], body[1], pose.body, body[2]), look ? arrowDots(look[0], look[1], pose.look, look[2]) : []);
      svg += turnArc(cx, cy, prev.body, pose.turn, arcRadius(cx, cy, prev.body, pose.turn, busy, box));
    }
    if (pose.via) {
      const [i, vx, vy, vd] = pose.via;
      const v = P(vx, vy);
      svg += SK.gfx.foot(...v, vd, 0, { side: side(i), scale: 1, was: true }) + viaArrow(P(pose.f[i][0], pose.f[i][1]), v);
    }
    pose.f.forEach((f, i) => { svg += SK.gfx.foot(...P(f[0], f[1]), f[2], f[3], { side: side(i), scale: 1, lift: '#e53935' }); });
    svg += arrow(body[0], body[1], pose.body, 'emb-body', body[2]);
    if (look) svg += gaze(look[0], look[1], pose.look, look[2]);
    return `<svg class="emb-map" viewBox="${Math.round(x0)} ${Math.round(-y1)} ${Math.round(x1 - x0)} ${Math.round(y1 - y0)}" role="img" aria-label="Fußstellung von oben">${svg}</svg>`;
  };
  // Drehung in Worten: ⅛ bis ¾ links/rechts herum, eine ganze Drehung (Drehsprung in Enpi) eigens
  SK.turnText = (deg) => (Math.abs(deg) === 360 ? `ganze Drehung ${deg < 0 ? 'links' : 'rechts'} herum` : `Wendung ${{ 45: '⅛', 90: '¼', 135: '⅜', 180: '½', 225: '⅝', 270: '¾' }[Math.abs(deg)] || `${Math.abs(deg)}°`} ${deg < 0 ? 'links' : 'rechts'} herum`);

  // ---------- Takt ----------
  // Das Buch nennt kein Tempo. Mitte = Training (2 s je Bewegung); langsamer in ganzen Sekunden bis 6 s (3× langsamer),
  // schneller spiegelbildlich bis ⅔ s (3× schneller). Immer mit Name, Rei und Yoi vorab.
  const BEATS = [6, 5, 4, 3, 2, 4 / 3, 1, 0.8, 2 / 3];
  const TRAINING = 4;
  SK.ansageBeats = BEATS;
  const fmtNum = (x) => String(Math.round(x * 10) / 10).replace('.', ',');
  const tempoName = (beat) => (beat === 2 ? 'Training' : beat > 2 ? `${fmtNum(beat / 2)}× langsamer` : `${fmtNum(2 / beat)}× schneller`);
  const TEMPO_KEY = 'shotokan-sensai-ansage-tempo';
  function loadTempo() {
    try {
      const i = Number(localStorage.getItem(TEMPO_KEY));
      if (localStorage.getItem(TEMPO_KEY) !== null && BEATS[i]) return i;
    } catch (e) { /* ohne Speicher */ }
    return TRAINING;
  }
  function saveTempo(i) {
    try {
      localStorage.setItem(TEMPO_KEY, String(i));
    } catch (e) { /* privates Fenster */ }
  }
  // Der Bereich mit Tempo, Bewegungen und Legende ist anfangs eingeklappt; Auf- oder Zuklappen bleibt gespeichert,
  // auch beim Wechsel zur nächsten Kata
  const FOLD_KEY = 'shotokan-sensai-ansage-offen';
  function loadFold() {
    try {
      return JSON.parse(localStorage.getItem(FOLD_KEY)) || {};
    } catch (e) { return {}; }
  }
  function saveFold(name, open) {
    const f = loadFold();
    f[name] = open;
    try {
      localStorage.setItem(FOLD_KEY, JSON.stringify(f));
    } catch (e) { /* privates Fenster */ }
  }

  // ---------- Sprachausgabe ----------
  // Nur mit japanischer Stimme; fehlt sie, läuft die Ansage stumm (Anzeige und Karte im Takt).
  const tts = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  let voice = null;
  function pickVoice() {
    if (!tts) return;
    // lokale Stimmen zuerst: sie sprechen ohne Netz-Verzögerung und halten den Takt
    voice = tts.getVoices().filter((v) => /^ja/i.test(v.lang)).sort((a, b) => Number(b.localService) - Number(a.localService))[0] || null;
  }
  // Etwas schneller und höher als normal klingt wacher; der Kiai-Ruf noch höher. Mehr lässt die Sprachausgabe nicht zu.
  const TONE = { rate: 1.15, pitch: 1.15 };
  const TONE_KIAI = { rate: 1.1, pitch: 1.35 };
  // Verzögerung zwischen speak() und hörbarem Beginn – wird gemessen und bei den nächsten Ansagen vorgezogen.
  let latency = 0.15;
  const live = new Set(); // Chrome verliert sonst Äußerungen samt onstart durch die Speicherbereinigung
  function utter(text, tone, fast, measure) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.voice = voice;
    u.rate = tone.rate * fast;
    u.pitch = tone.pitch;
    const t0 = performance.now();
    if (measure) u.onstart = () => {
      const l = (performance.now() - t0) / 1000;
      if (l < 1.5) latency = Math.min(0.8, latency * 0.6 + l * 0.4);
    };
    u.onend = u.onerror = () => live.delete(u);
    live.add(u);
    tts.speak(u);
  }
  // Im schnellen Tempo spricht die Stimme schneller, damit die Zahl in den Takt passt.
  function speak(st, beat) {
    if (!tts || !voice) return;
    const fast = Math.min(1.7, Math.max(1, Math.sqrt(2 / beat)));
    utter(st.say, TONE, fast, true);
    // Kiai als eigene Äußerung direkt nach der Zahl, damit der Ruf eigene Betonung bekommt
    if (st.kiai) utter(KIAI, TONE_KIAI, fast, false);
  }

  // ---------- Lexikon-Begriffe in Stand und Technik ----------
  // Zerlegt einen Ansagetext in Textstücke und Lexikon-Treffer: [{ s, e? }]. Gesucht wird nach ganzen Wörtern
  // (Bindestrich und Leerzeichen trennen), längster Begriff zuerst; „Hiji / Enpi“ zählt für beide Namen.
  // Eine Körperwaffe (oder ein anderes Vorderwort) vor einer Abwehr oder einem Schlag steht für die zusammengesetzte
  // Technik, wenn das Lexikon sie kennt und die Technik dahinter nicht selbst ein Begriff ist: „Shuto Chudan-uke“ →
  // Shuto-uke, „Haiwan Hidari Sokumen Jodan Yoko-uke“ → Haiwan-uke (Seite, Höhe und Richtung dazwischen werden
  // übersprungen), „Morote Jodan Age-uke“ bleibt Age-uke.
  let lexIndex = null;
  function lexTerms() {
    if (lexIndex) return lexIndex;
    const norm = (s) => s.toLowerCase().split(/[\s-]+/).filter(Boolean);
    const list = [];
    const byName = new Map();
    SK.glossary.forEach((e) => {
      e.t.split(' / ').forEach((name) => {
        if (/[()]/.test(name)) return;
        const w = norm(name);
        list.push({ w, e });
        byName.set(w.join('-'), e);
      });
    });
    list.sort((a, b) => b.w.length - a.w.length);
    // Wörter, die eine zusammengesetzte Abwehr oder einen Schlag beginnen (Shuto-uke, Haiwan-uke, Uraken-uchi …)
    const lead = new Set(list.filter((t) => t.w.length === 2 && /^(uke|uchi)$/.test(t.w[1])).map((t) => t.w[0]));
    lexIndex = { list, byName, lead };
    return lexIndex;
  }
  const LEX_FILL = new Set(['migi', 'hidari', 'jodan', 'chudan', 'gedan', 'sokumen', 'ryote', 'ryoken', 'saken', 'uken', 'sasho', 'usho']);
  SK.lexParts = function (text) {
    const { list, byName, lead } = lexTerms();
    // Wörter mit Position im Text, damit die Treffer den Originaltext (Großschreibung, Klammern) behalten
    const words = [];
    text.replace(/[A-Za-zÄÖÜäöüß]+/g, (m, at) => { words.push({ w: m.toLowerCase(), at, end: at + m.length }); return m; });
    // nur Leerzeichen oder Bindestrich vor Wort m (keine Klammer, kein „+“ dazwischen)
    const plain = (m) => /^[\s-]+$/.test(text.slice(words[m - 1].end, words[m].at));
    const hits = [];
    for (let i = 0; i < words.length; ) {
      let hit = null;
      const w = words[i].w;
      if (lead.has(w) && i + 1 < words.length && plain(i + 1) && text.slice(words[i].end, words[i + 1].at) !== '-') {
        // Füllwörter überspringen, dann bis zum Ende des folgenden Bindestrich-Worts (Chudan-uke, Yoko-uke)
        let j = i + 1;
        while (j < words.length && LEX_FILL.has(words[j].w) && plain(j)) j++;
        let k = j;
        while (k + 1 < words.length && text.slice(words[k].end, words[k + 1].at) === '-') k++;
        const last = k < words.length && /^(uke|uchi)$/.test(words[k].w) ? words[k].w : '';
        // ist die folgende Technik selbst ein Begriff („Morote Jodan Age-uke“), gilt sie
        const own = last && j <= k && byName.has(words.slice(j, k + 1).map((x) => x.w).join('-'));
        // „Tate-shuto Chudan-uke“: Vorsilbe am Bindestrich gehört zur Technik (Tate-shuto-uke)
        const pre = i > 0 && text.slice(words[i - 1].end, words[i].at) === '-' ? words[i - 1].w : '';
        const e = last && !own && ((pre && byName.get(`${pre}-${w}-${last}`)) || (!pre && byName.get(`${w}-${last}`)));
        let ok = !!e;
        for (let m = i + 1; m <= k && ok; m++) ok = plain(m);
        if (ok) hit = { from: pre ? i - 1 : i, to: k, e };
      }
      if (!hit) {
        for (const t of list) {
          const n = t.w.length;
          if (i + n > words.length) continue;
          let ok = true;
          for (let m = 0; m < n && ok; m++) {
            ok = words[i + m].w === t.w[m] && (m === 0 || plain(i + m));
          }
          if (ok) { hit = { from: i, to: i + n - 1, e: t.e }; break; }
        }
      }
      if (hit) {
        // ganzes Bindestrich-Wort antippbar und unterstrichen, nicht nur den Teil mit dem Begriff („Mae-geri-keage“, „Soto-nagashi-uke“)
        const min = hits.length ? hits[hits.length - 1].to + 1 : 0;
        while (hit.from > min && text.slice(words[hit.from - 1].end, words[hit.from].at) === '-') hit.from--;
        while (hit.to + 1 < words.length && text.slice(words[hit.to].end, words[hit.to + 1].at) === '-') hit.to++;
        hits.push(hit);
        i = hit.to + 1;
      } else i++;
    }
    const parts = [];
    let pos = 0;
    hits.forEach((h) => {
      const a = words[h.from].at;
      const b = words[h.to].end;
      if (a > pos) parts.push({ s: text.slice(pos, a) });
      parts.push({ s: text.slice(a, b), e: h.e });
      pos = b;
    });
    if (pos < text.length) parts.push({ s: text.slice(pos) });
    return parts;
  };

  // ---------- Ansicht ----------
  SK.viewAnsage = function (app, k) {
    const { el } = util;
    let tempo = loadTempo();
    let steps = SK.ansageTimeline(k, BEATS[tempo], true);
    let idx = 0;
    let running = false;
    let base = 0; // performance.now() in ms, zu dem t = 0 gehört
    let timers = [];
    let lock = null;
    let lockState = 'aus';

    pickVoice();
    if (tts) tts.onvoiceschanged = () => { pickVoice(); info(); };

    // Anzeige
    const cKan = el('span', { class: 'ans-kan' });
    const cRo = el('span', { class: 'ans-ro' });
    const cPos = el('span', { class: 'ans-pos' });
    const chips = el('div', { class: 'ans-chips' });
    const map = el('div', { class: 'ans-map-svg' });
    const mapBox = el('div', { class: 'ans-map' }, map, chips);
    const cHint = el('div', { class: 'ans-hint' });
    const cTech = el('div', { class: 'ans-tech muted' });
    const head = el('div', { class: 'ans-head' }, cKan, el('div', { class: 'ans-head-txt' }, cRo, cPos));
    const stage = el('section', { class: 'ans-stage', 'aria-live': 'polite' }, head, mapBox, cHint, cTech);
    const track = el('div', { class: 'ans-track', role: 'group', 'aria-label': 'Bewegungen' });
    const playBtn = el('button', { class: 'btn primary ans-play', type: 'button' });
    const prevBtn = el('button', { class: 'btn', type: 'button', 'aria-label': 'Eine Ansage zurück', text: '◀' });
    const nextBtn = el('button', { class: 'btn', type: 'button', 'aria-label': 'Eine Ansage weiter', text: '▶' });
    const controls = el('div', { class: 'ans-controls' }, prevBtn, playBtn, nextBtn);
    const fsBtn = document.fullscreenEnabled ? el('button', { class: 'btn', type: 'button', text: 'Vollbild' }) : null;
    const order = SK.ansageKata();
    const pos = order.indexOf(k.id);
    const prevKata = order[(pos - 1 + order.length) % order.length];
    const nextKata = order[(pos + 1) % order.length];
    const kataPrev = el('a', { class: 'btn', href: `#/ansage/${prevKata}`, 'aria-label': `Vorherige Kata: ${SK.kata[prevKata].name}`, text: '◀ Vorherige' });
    const kataNext = el('a', { class: 'btn', href: `#/ansage/${nextKata}`, 'aria-label': `Nächste Kata: ${SK.kata[nextKata].name}`, text: 'Nächste ▶' });
    function fold(name, title, ...body) {
      const d = el('details', { class: 'ans-fold' }, el('summary', { text: title }), ...body);
      d.open = !!loadFold()[name];
      d.addEventListener('toggle', () => saveFold(name, d.open));
      return d;
    }

    // Tempo-Regler: Änderung gilt sofort, eine laufende Ansage zählt ab der aktuellen Bewegung im neuen Takt weiter
    const tempoIn = el('input', { type: 'range', id: 'ans-tempo', min: '0', max: String(BEATS.length - 1), step: '1', value: String(tempo), 'aria-label': 'Tempo' });
    const tempoOut = el('output', { class: 'ans-tempo-out', for: 'ans-tempo' });
    function tempoInfo() {
      const beat = BEATS[tempo];
      tempoOut.textContent = `${tempoName(beat)} · ${fmtNum(beat)} s je Bewegung · Kata etwa ${Math.round(steps[steps.length - 1].t)} s`;
      tempoIn.setAttribute('aria-valuetext', tempoName(beat));
    }
    tempoIn.addEventListener('input', () => {
      tempo = Number(tempoIn.value);
      saveTempo(tempo);
      steps = SK.ansageTimeline(k, BEATS[tempo], true);
      tempoInfo();
      if (running) start(idx);
    });

    // Hinweis nur, wenn etwas fehlt: japanische Stimme oder Bildschirm-an
    const infoOut = el('p', { class: 'muted small ans-info' });
    function info() {
      const msg = [];
      if (!tts || !voice) msg.push(`Keine japanische Stimme ${tts ? 'auf diesem Gerät' : 'in diesem Browser'} – die Ansage läuft stumm. Eine japanische Stimme lässt sich in den Geräteeinstellungen unter Sprachausgabe nachladen.`);
      if (lockState === 'nein') msg.push('Dieser Browser kann die Bildschirmsperre nicht verhindern – bitte die automatische Sperre in den Geräteeinstellungen verlängern.');
      infoOut.textContent = msg.join(' ');
      infoOut.hidden = !msg.length;
    }

    // Texte einer Ansage (ohne Karte und Fortschritt) – auch zum Ausmessen
    function fill(s) {
      cKan.textContent = s.kan;
      cKan.hidden = !s.kan;
      // beim Zählen und bei Rei, Yoi, Naore steht der Kata-Name davor: „Heian Shodan – Ichi“
      cRo.textContent = s.kind === 'name' ? s.ro : `${k.name} – ${s.ro}`;
      lexFill(cPos, s.kind === 'move' ? `${s.n}/${k.moves} · ${s.stance}` : s.stance);
      chips.innerHTML = '';
      if (s.kiai) chips.append(el('span', { class: 'ans-chip kiai', text: 'Kiai' }));
      if (s.slow) chips.append(el('span', { class: 'ans-chip slow', text: 'langsam' }));
      if (s.cont) chips.append(el('span', { class: 'ans-chip cont', text: 'fließend' }));
      cHint.textContent = s.pose.h;
      lexFill(cTech, s.kind === 'move' ? s.tech + (s.note ? ` · ${s.note}` : '') : s.note || '');
    }
    // Lexikon-Begriffe in Stand und Technik antippbar: hält die Ansage an und zeigt den Eintrag aus dem Lexikon
    function lexFill(node, text) {
      node.textContent = '';
      SK.lexParts(text).forEach((p) => {
        node.append(p.e ? el('button', { class: 'ans-lex', type: 'button', text: p.s, title: 'Im Lexikon nachsehen', onclick: () => lexShow(p.e) }) : p.s);
      });
    }
    const lexBody = el('div');
    const lexDlg = el(
      'dialog',
      { class: 'ans-lex-dlg', 'aria-label': 'Lexikon' },
      lexBody,
      el('div', { class: 'actions' },
        el('a', { class: 'btn', href: '#/lexikon', text: 'Im Lexikon öffnen', onclick: () => lexDlg.close() }),
        el('button', { class: 'btn primary', type: 'button', text: 'Schließen', onclick: () => lexDlg.close() }))
    );
    // Tippen neben das Fenster schließt es (der Innenrand gehört auch zum dialog-Element, daher über die Lage)
    lexDlg.addEventListener('click', (ev) => {
      const r = lexDlg.getBoundingClientRect();
      if (ev.target === lexDlg && (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom)) lexDlg.close();
    });
    function lexShow(e) {
      if (running) pause();
      lexBody.innerHTML = SK.glossaryHtml([e]);
      lexDlg.querySelector('a.btn').href = `#/lexikon/${encodeURIComponent(e.t.split(' / ')[0])}`;
      lexDlg.showModal();
    }
    // Der Kasten soll beim Zählen nicht wachsen und schrumpfen: Kopf, Fußarbeit und Technik bekommen die Höhe der
    // längsten Ansage dieser Kata (bei der aktuellen Breite, daher neu bei Größenänderung und Vollbild).
    const boxes = [head, cHint, cTech];
    function reserve() {
      if (!stage.isConnected) {
        window.removeEventListener('resize', onResize);
        document.removeEventListener('fullscreenchange', onResize);
        return;
      }
      boxes.forEach((b) => { b.style.minHeight = ''; });
      const max = boxes.map(() => 0);
      steps.forEach((s) => {
        fill(s);
        boxes.forEach((b, j) => { max[j] = Math.max(max[j], b.offsetHeight); });
      });
      boxes.forEach((b, j) => { b.style.minHeight = `${max[j]}px`; });
      fit();
      render(idx);
    }
    // Die Karte bekommt die Höhe, die neben Kopf, Text und Knöpfen auf dem Bildschirm bleibt: Karte und Knöpfe passen
    // gleich beim Öffnen ohne Scrollen hinein. Auf kleinen Bildschirmen kleben die Knöpfe am unteren Rand.
    // clientHeight ändert sich nicht, wenn Chrome die Adressleiste ein- oder ausblendet.
    function fit() {
      const fs = document.fullscreenElement;
      const top = fs ? stage.getBoundingClientRect().top - fs.getBoundingClientRect().top + fs.scrollTop : stage.getBoundingClientRect().top + window.scrollY;
      const bottom = fs ? 0 : (document.querySelector('.bottombar') || {}).offsetHeight || 0;
      const view = fs ? fs.clientHeight : document.documentElement.clientHeight;
      controls.style.bottom = `${bottom}px`;
      const rest = stage.offsetHeight - mapBox.offsetHeight + controls.offsetHeight + 16;
      mapBox.style.height = `${Math.round(Math.max(240, Math.min(view - top - bottom - rest, mapBox.clientWidth * 1.6)))}px`;
    }
    let resizeTimer = 0;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(reserve, 150);
    }
    window.addEventListener('resize', onResize);
    document.addEventListener('fullscreenchange', onResize);

    function render(i) {
      const s = steps[i];
      if (!s) return;
      fill(s);
      stage.classList.toggle('kiai', !!s.kiai);
      map.innerHTML = SK.embusenSvg(k, s.pose, i ? s.prev : null, mapBox.clientWidth / mapBox.clientHeight || null);
      const firstMove = steps.findIndex((x) => x.kind === 'move');
      const cur = s.kind === 'move' ? s.n : i < firstMove ? 0 : Infinity;
      track.querySelectorAll('.ans-dot').forEach((d) => {
        const n = Number(d.dataset.n);
        d.classList.toggle('cur', n === cur);
        d.classList.toggle('done', n < cur);
      });
    }

    function buildTrack() {
      track.innerHTML = '';
      k.seq.forEach((r) => {
        const n = r[0];
        const cls = ['ans-dot', k.kiai.includes(n) && 'kiai', k.slow.includes(n) && 'slow',
          k.continuous.some((g) => g.includes(n) && g.includes(n + 1)) && 'link'].filter(Boolean).join(' ');
        track.append(el('button', { class: cls, type: 'button', 'data-n': n, 'aria-label': `Bewegung ${n}`, text: String(n) }));
      });
    }

    // Ablauf: jede Ansage wird um die gemessene Verzögerung früher gesprochen, die Anzeige wechselt genau im Takt.
    function clearTimers() {
      timers.forEach(clearTimeout);
      timers = [];
    }
    function schedule(from) {
      clearTimers();
      const now = performance.now();
      for (let i = from; i < steps.length; i++) {
        const at = base + steps[i].t * 1000;
        timers.push(setTimeout(() => speak(steps[i], BEATS[tempo]), Math.max(0, at - latency * 1000 - now)));
        timers.push(setTimeout(() => { idx = i; render(i); }, Math.max(0, at - now)));
      }
      const end = base + (steps[steps.length - 1].t + 1.5) * 1000;
      timers.push(setTimeout(finish, Math.max(0, end - now)));
    }
    function start(from) {
      idx = from;
      if (tts) {
        tts.cancel();
        tts.resume(); // Chrome bleibt sonst nach einer Unterbrechung gelegentlich stumm
      }
      // erste Ansage sofort im Klick (iOS gibt die Sprachausgabe nur nach einer Berührung frei)
      base = performance.now() - steps[from].t * 1000;
      speak(steps[from], BEATS[tempo]);
      render(from);
      // nach einem Sprung folgt die nächste Ansage mit dem normalen Abstand
      if (from + 1 < steps.length) schedule(from + 1);
      else timers.push(setTimeout(finish, 1500));
      running = true;
      wake(true);
      ui();
    }
    function pause() {
      clearTimers();
      if (tts) tts.cancel();
      running = false;
      ui();
    }
    function finish() {
      clearTimers();
      running = false;
      idx = steps.length - 1;
      wake(false);
      ui();
    }
    function jump(i) {
      i = Math.max(0, Math.min(steps.length - 1, i));
      if (running) start(i);
      else { idx = i; render(i); }
    }
    function ui() {
      playBtn.textContent = running ? '❚❚ Pause' : idx > 0 && idx < steps.length - 1 ? '▶ Weiter zählen' : '▶ Start';
    }

    async function wake(on) {
      if (!on) {
        if (lock) lock.release().catch(() => {});
        lock = null;
        lockState = 'aus';
        return;
      }
      if (lock) return;
      try {
        lock = await navigator.wakeLock.request('screen');
        lock.addEventListener('release', () => { lock = null; });
        lockState = 'an';
      } catch (e) {
        lockState = 'nein';
      }
      info();
    }
    // Beim Wechsel in eine andere App erlischt der Wake Lock – Ansage anhalten, damit der Takt nicht davonläuft.
    function onVisibility() {
      if (document.hidden && running) pause();
    }
    document.addEventListener('visibilitychange', onVisibility);
    function onKey(ev) {
      if (ev.code !== 'Space' || lexDlg.open || /INPUT|SELECT|TEXTAREA|BUTTON/.test(ev.target.tagName)) return;
      ev.preventDefault();
      playBtn.click();
    }
    document.addEventListener('keydown', onKey);
    SK.ansageCleanup = () => {
      pause();
      wake(false);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('keydown', onKey);
      if (tts) tts.onvoiceschanged = null;
      SK.ansageCleanup = null;
    };

    playBtn.addEventListener('click', () => {
      if (running) pause();
      else start(idx >= steps.length - 1 ? 0 : idx);
    });
    prevBtn.addEventListener('click', () => jump(idx - 1));
    nextBtn.addEventListener('click', () => jump(idx + 1));
    track.addEventListener('click', (ev) => {
      const d = ev.target.closest('.ans-dot');
      if (d) jump(steps.findIndex((s) => s.n === Number(d.dataset.n)));
    });
    // Vollbild für die ganze Seite: Beim Wechsel zur nächsten Kata wird nur ihr Inhalt getauscht, das Vollbild bleibt.
    if (fsBtn) fsBtn.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else app.requestFullscreen().catch(() => {});
    });

    // Wischen über den Kasten wechselt die Kata: nach links zur nächsten, nach rechts zur vorherigen. Gesten vom
    // Bildschirmrand gehören dem System (Zurück-Geste unter Android) und zählen nicht.
    function toKata(id, dir) {
      SK.ansageSlide = dir;
      location.hash = `#/ansage/${id}`;
    }
    kataPrev.addEventListener('click', () => { SK.ansageSlide = 'prev'; });
    kataNext.addEventListener('click', () => { SK.ansageSlide = 'next'; });
    let touch = null;
    stage.addEventListener('touchstart', (ev) => {
      const t = ev.touches[0];
      const edge = 24;
      touch = ev.touches.length === 1 && t.clientX > edge && t.clientX < window.innerWidth - edge ? { x: t.clientX, y: t.clientY, at: Date.now() } : null;
    }, { passive: true });
    stage.addEventListener('touchend', (ev) => {
      if (!touch) return;
      const t = ev.changedTouches[0];
      const dx = t.clientX - touch.x;
      const dy = t.clientY - touch.y;
      const quick = Date.now() - touch.at < 800;
      touch = null;
      if (quick && Math.abs(dx) > 60 && Math.abs(dx) > 1.5 * Math.abs(dy)) toKata(dx < 0 ? nextKata : prevKata, dx < 0 ? 'next' : 'prev');
    });
    stage.addEventListener('touchcancel', () => { touch = null; });
    if (SK.ansageSlide) {
      stage.classList.add(`ans-in-${SK.ansageSlide}`);
      SK.ansageSlide = null;
    }
    app.innerHTML = '';
    app.append(
      el('h1', { class: 'visually-hidden', text: k.name }),
      el('div', { class: 'ans-wrap' }, stage, lexDlg,
        controls,
        infoOut,
        fold('optionen', 'Tempo, Bewegungen und Legende',
          el('div', { class: 'ans-tempo' },
            el('div', { class: 'ans-tempo-row' }, el('span', { class: 'muted small', text: '3× langsamer' }), tempoIn, el('span', { class: 'muted small', text: '3× schneller' })),
            tempoOut),
          track,
          el('div', { class: 'ans-legend muted small' }, el('span', { class: 'lg-kiai', text: 'Kiai' }), el('span', { class: 'lg-slow', text: 'langsam' }), el('span', { class: 'lg-link', text: 'fließend zur nächsten' })),
          el('div', { class: 'ans-legend muted small' }, el('span', { class: 'lg-heavy', text: 'viel Gewicht' }), el('span', { class: 'lg-light', text: 'wenig Gewicht' }), el('span', { class: 'lg-ghost', text: 'Fuß vorher' }), el('span', { class: 'lg-lift', text: 'Fuß angehoben' }), el('span', { class: 'lg-body', text: 'Körper zeigt' }), el('span', { class: 'lg-look', text: 'Blick' }), el('span', { class: 'lg-turn', text: 'Wendung' }), el('span', { class: 'lg-via', text: 'Fuß zieht heran und zurück' })))),
      el('div', { class: 'actions ans-katanav' }, kataPrev, ...(fsBtn ? [fsBtn] : []), kataNext),
      el('p', { class: 'muted small' }, 'Mehr zur Kata: ', el('a', { href: `#/wissen/${k.id}-ueberblick`, text: `${k.name} im Kata-Wissen` }))
    );
    buildTrack();
    info();
    tempoInfo();
    render(0);
    reserve();
    if (document.fonts) document.fonts.ready.then(reserve);
    ui();
  };
})();
