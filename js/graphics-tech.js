/* Technik-Grafiken für das Lexikon und den Begriffe-Trainer (baut auf SK.gfx.kit auf). */
(function () {
  'use strict';
  const { person, scene, frame, arm, ghost, FRONT, SIDE, SA, stepLegs, STEP_SHIFT, LEG_R, LEG_L, HIKITE_R, HIKITE_L, arrow, hit, tag, timeline, animTf, fadeLoop, mode, FONT, HL, HLS, INK, GHOST } = SK.gfx.kit;

  const far = (p) => Object.assign({}, p, { far: true });
  const leg = (p, ft, o) => Object.assign({ p, w: 15, foot: ft }, o);
  // Startstellung nur für die Animation (statisch nicht gezeichnet)
  const from = (p, pts, ft) => Object.assign({}, p, { from: pts, fromFoot: ft });
  const num = (x, y, n) => `<circle cx="${x}" cy="${y}" r="8" fill="${HL}" stroke="#fff" stroke-width="1.5"/><text x="${x}" y="${y + 3.5}" font-size="10" font-weight="700" text-anchor="middle" fill="#fff" ${FONT}>${n}</text>`;
  const ring = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r || 11}" fill="none" stroke="${HL}" stroke-width="3"/>`;

  // Seitenansicht, Blick nach rechts: die rechte Körperseite ist vorne (near), die linke hinten (far).
  const side = (parts, o) => Object.assign({}, SIDE, o, { parts });
  const S_STAND = [leg([[108, 116], [104, 176], [102, 228]], [120, 232], { far: true }), leg([[110, 116], [112, 176], [114, 228]], [132, 232])];
  const S_ZK = [leg([[106, 116], [72, 172], [38, 226]], [56, 232], { far: true }), leg([[110, 116], [142, 168], [138, 228]], [158, 232])];
  const S_KK = [leg([[104, 116], [121, 175], [88, 228]], [104, 233], { far: true }), leg([[108, 116], [144, 170], [162, 228]], [180, 232])];
  const HIP_FAR = far(arm([[112, 62], [100, 92], [110, 104]]));
  const HIP_NEAR = arm([[112, 62], [102, 92], [114, 104]]);
  const GUARD_FAR = far(arm([[112, 62], [118, 92], [134, 88]]));
  const PUNCH = arm([[112, 62], [146, 66], [182, 68]]);
  // Gegenhand: zieht in der Animation aus der Streckung zur Hüfte zurück (Hikite)
  const PULL_FAR = from(HIP_FAR, PUNCH.p);
  // Stoß-Ziele seitlich: Jodan (Gesicht) und Chudan (Solarplexus), Arm ganz gestreckt
  const JODAN = [[112, 62], [146, 54], [181, 46]];
  const CHUDAN = [[112, 62], [146, 68], [181, 74]];
  // Glied mit festen Schlüsselbildern (Punktlisten) für die Animation
  const keys = (p, frames, impact) => Object.assign({}, p, { seq: frames.map((q) => [q]) }, impact == null ? {} : { impact });

  // Vorderansicht: rechte Körperseite = im Bild links
  const fr = (parts, legs) => Object.assign({}, FRONT, { parts: (legs || [LEG_R, LEG_L]).concat(parts) });
  const KIBA = [leg([[100, 118], [72, 168], [70, 228]], [62, 234], { under: true }), leg([[120, 118], [148, 168], [150, 228]], [158, 234], { under: true })];
  const F_KK = [leg([[102, 118], [92, 174], [88, 228]], [82, 234], { under: true }), leg([[118, 118], [140, 170], [138, 228]], [148, 234], { under: true })];
  const SHIZEN = [leg([[102, 118], [92, 176], [84, 228]], [78, 234], { under: true }), leg([[118, 118], [128, 176], [136, 228]], [142, 234], { under: true })];

  // Hanmi von vorne: Rumpf schmaler (gedreht), die vordere Schulter liegt über dem Rumpf, der andere Arm dahinter
  const HANMI_LEGS = [leg([[103, 118], [96, 176], [90, 228]], [84, 236], { under: true }), leg([[119, 118], [130, 168], [128, 228]], [134, 238], { under: true })];
  const hanmiSpec = (gyaku) =>
    Object.assign({}, FRONT, gyaku
      ? { head: [108, 32], torso: [[95, 56], [121, 56], [119, 118], [99, 118]], belt: [[98, 112], [120, 112]], parts: HANMI_LEGS.concat([Object.assign(arm([[121, 62], [130, 94], [122, 110]]), { under: true }), arm([[98, 62], [102, 94], [118, 96]])]) }
      : { head: [112, 32], torso: [[99, 56], [125, 56], [121, 118], [101, 118]], belt: [[100, 112], [122, 112]], parts: HANMI_LEGS.concat([Object.assign(arm([[101, 62], [92, 94], [100, 110]]), { under: true }), arm([[124, 62], [136, 98], [142, 132]])]) });
  const S = (label, spec, extra, lines, o) => () => scene(label, 240, spec, extra || '', lines, o);
  const F = (label, spec, extra, lines, o) => () => scene(label, 220, spec, extra || '', lines, o);
  const still = { ghost: false };

  // Seitlicher Tritt (Vorderansicht, Bein zur Bildseite rechts)
  const YOKO = { head: [96, 40], view: 'front', torso: [[80, 62], [114, 56], [121, 118], [97, 122]], belt: [[97, 115], [121, 112]] };
  const yokoBase = [leg([[101, 120], [95, 178], [91, 228]], [85, 234], { under: true }), arm([[82, 66], [66, 96], [84, 100]]), arm([[112, 62], [134, 84], [118, 96]])];
  const MAE_BASE = [far(arm([[112, 62], [128, 90], [142, 80]])), leg([[108, 116], [104, 176], [100, 228]], [118, 232], { far: true }), arm([[112, 62], [104, 96], [118, 106]])];
  // Schlüsselbilder [Punkte, Fuß] für Tritte
  const MAE = { stand: [[[108, 116], [112, 176], [114, 228]], [132, 232]], knee: [[[108, 116], [146, 100], [136, 152]], [150, 158]], ext: [[[108, 116], [152, 116], [194, 112]], [199, 96]] };
  const YOKO_STAND = [[[117, 118], [124, 176], [129, 228]], [135, 234]];
  const YOKO_KNEE = [[[117, 118], [150, 102], [128, 150]], [122, 158]];
  const KZ_STAND = [[[110, 116], [142, 168], [138, 228]], [158, 232]];
  const KZ_KNEE = [[[110, 116], [150, 100], [140, 150]], [156, 156]];
  const numTag = (x, y, n) => `<g data-tag="1">${num(x, y, n)}</g>`;
  const SEIZA = (hands, extra) => ({
    head: [112, 128],
    view: 'side',
    trunk: [[112, 148], [106, 200]],
    parts: [
      leg([[104, 204], [146, 224], [100, 230]], [84, 232], { far: true }),
      far(arm([[112, 154], ...hands])),
      leg([[106, 204], [148, 226], [102, 232]], [86, 234]),
      arm([[112, 154], ...hands], 'open'),
    ].concat(extra || []),
  });
  SEIZA.hands = [[122, 184], [142, 206]];

  // Partner in Grau, gespiegelt (Blick nach links); offset = Spiegelachse ×2
  const GREY = { '#ffffff': '#eceff1', '#37474f': '#90a4ae', '#f2c9a6': '#e0e0e0', '#4e342e': '#90a4ae', '#b0bec5': '#cfd8dc', '#dcb593': '#d6d6d6', '#212121': '#90a4ae', '#90caf9': '#cfd8dc' };
  const grey = (s) => s.replace(/#(ffffff|37474f|f2c9a6|4e342e|b0bec5|dcb593|212121|90caf9)/g, (m) => GREY[m]);
  const duo = (label, me, other, offset, extra, lines) => () =>
    scene(label, 260, {}, `<g transform="translate(26 47.6) scale(.8)"><g transform="translate(-50 0)">${person(me)}</g><g transform="translate(${offset} 0) scale(-1 1)">${grey(person(other))}</g>${extra}</g>`, lines, still);

  // Kumite-Ablauf schematisch: Angreifer (rot) vorwärts, Verteidiger (blau) rückwärts, am Ende Konter
  function kumite(label, n, lines) {
    const W = 320;
    const step = n > 1 ? 44 : 70;
    const x0 = (W - (n + 1) * step) / 2;
    const ax = (i) => x0 + i * step;
    const vx = (i) => x0 + (i + 1) * step;
    const RED = '#e53935';
    const BLUE = '#1e88e5';
    const ar = (x1, x2, y, c) => `<path d="M${x1} ${y} H${x2 - 6}" stroke="${c}" stroke-width="2.5"/><path d="M${x2} ${y} l-8 -5 v10 z" fill="${c}"/>`;
    const txt = (x, y, t, o) => `<text x="${x}" y="${y}" font-size="${(o && o.s) || 10}" text-anchor="${(o && o.a) || 'middle'}"${o && o.b ? ' font-weight="700"' : ''} fill="${(o && o.c) || '#455a64'}" ${FONT}>${t}</text>`;
    let s = txt(14, 44, 'Angreifer', { a: 'start', b: true, c: RED }) + txt(14, 176, 'Verteidiger', { a: 'start', b: true, c: BLUE });
    for (let i = 0; i <= n; i++) {
      const last = i === n;
      s += `<circle cx="${ax(i)}" cy="76" r="${last ? 11 : 7}" fill="${RED}" opacity="${last ? 1 : 0.35}"/><circle cx="${vx(i)}" cy="136" r="${last ? 11 : 7}" fill="${BLUE}" opacity="${last ? 1 : 0.35}"/>`;
      if (i < n) s += ar(ax(i) + 9, ax(i + 1) - 9, 76, RED) + ar(vx(i) + 9, vx(i + 1) - 9, 136, BLUE) + txt((ax(i) + ax(i + 1)) / 2, 64, i + 1, { s: 9 }) + txt((vx(i) + vx(i + 1)) / 2, 156, i + 1, { s: 9 });
    }
    s += txt(ax(n), 80, 'A', { b: true, c: '#fff' }) + txt(vx(n), 140, 'V', { b: true, c: '#fff' });
    s += arrow(`M${vx(n)} 123 C${vx(n)} 104 ${ax(n) + 26} 100 ${ax(n) + 12} 88`) + txt(ax(n) - 4, 110, n > 1 ? 'Gegenangriff mit Kiai' : 'Konter', { a: 'end', b: true, c: '#c62828' });
    return frame(W, 230, label, s, lines);
  }

  // Kraftrichtung: gerade (Tsuki/Kekomi) gegenüber rechtwinklig (Uchi/Keage), rechts mit Drehpunkt am Gelenk
  function force(label, t1, t2, legMode, lines) {
    const limbAt = (dx) => {
      const gi = legMode ? 18 : 16;
      const sk = legMode ? 13 : 11;
      const tube = (x1, x2, w, c) => `<path d="M${x1 + dx} 100 H${x2 + dx}" stroke="${INK}" stroke-width="${w + 3}" stroke-linecap="round"/><path d="M${x1 + dx} 100 H${x2 + dx}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
      const end = legMode
        ? `<path d="M${88 + dx} 102 V80" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M${88 + dx} 102 V80" stroke="#f2c9a6" stroke-width="10" stroke-linecap="round"/>`
        : `<circle cx="${86 + dx}" cy="100" r="9" fill="#f2c9a6" stroke="${INK}" stroke-width="1.5"/>`;
      return tube(44, 82, sk, '#f2c9a6') + tube(14, 44, gi, '#ffffff') + end + `<circle cx="${44 + dx}" cy="100" r="3" fill="${INK}"/>`;
    };
    const title = (x, t) => `<text x="${x}" y="36" font-size="11" font-weight="700" text-anchor="middle" fill="#37474f" ${FONT}>${t}</text>`;
    const s =
      title(70, t1) + title(210, t2) + `<path d="M140 24 V160" stroke="#e0e0e0"/>` +
      limbAt(0) + `<path d="M44 100 H136" stroke="#90a4ae" stroke-dasharray="3 4"/>` + arrow('M100 100 L132 100') +
      limbAt(140) + `<path d="M${legMode ? 228 : 226} 100 A42 42 0 0 0 211 68" stroke="#90a4ae" stroke-dasharray="3 4" fill="none"/>` + arrow(`M${legMode ? 240 : 236} 92 L${legMode ? 240 : 236} 54`);
    return frame(280, 200, label, s, lines);
  }

  const T = {
    /* ---------- Tsuki ---------- */
    'choku-zuki': S('Choku-zuki', side([PULL_FAR, ...S_STAND, PUNCH, ghost(HIP_NEAR)]), arrow('M120 92 L174 84') + hit(190, 68), ['seitlich: gerader Fauststoß', 'aus dem Stand, ohne Schritt']),
    'kizami-zuki': S('Kizami-zuki', side([GUARD_FAR, ...S_ZK, arm([[112, 62], [148, 50], [184, 40]]), ghost(arm([[112, 62], [132, 84], [148, 70]]))]), arrow('M154 84 L186 56') + hit(192, 38), ['seitlich: Stoß mit der vorderen Hand,', 'ohne Schritt']),
    'sanbon-zuki': S('Sanbon-zuki', side([keys(HIP_FAR, [CHUDAN, HIP_FAR.p, HIP_FAR.p, CHUDAN, CHUDAN, HIP_FAR.p, HIP_FAR.p]), ...S_ZK, keys(arm(CHUDAN), [HIP_NEAR.p, JODAN, JODAN, HIP_NEAR.p, HIP_NEAR.p, CHUDAN, CHUDAN]), ghost(arm(JODAN))]), num(196, 36, 1) + num(196, 84, 2) + num(214, 84, 3), ['seitlich: drei Stöße schnell hintereinander –', '1 Jodan (vorne) · 2 Chudan (hinten) · 3 Chudan (vorne)']),
    'ren-zuki': S('Ren-zuki', side([keys(far(arm(CHUDAN)), [CHUDAN, HIP_FAR.p, HIP_FAR.p, CHUDAN, CHUDAN]), ...S_ZK, keys(HIP_NEAR, [HIP_NEAR.p, JODAN, JODAN, HIP_NEAR.p, HIP_NEAR.p]), ghost(arm(JODAN))]), num(196, 36, 1) + num(196, 84, 2), ['seitlich: zwei Stöße schnell hintereinander –', '1 Jodan (vordere Hand) · 2 Chudan (hintere Hand)']),
    'morote-zuki': S('Morote-zuki', side([from(far(arm([[112, 62], [148, 74], [182, 80]])), HIP_FAR.p), ...S_ZK, from(arm([[112, 62], [148, 62], [184, 62]]), HIP_NEAR.p)]), arrow('M128 98 L172 82') + arrow('M128 84 L174 64'), ['seitlich: beide Fäuste stoßen', 'gleichzeitig nach vorne'], still),
    'kagi-zuki': F('Kagi-zuki', fr([from(HIKITE_L, [[127, 62], [146, 92], [166, 116]]), arm([[93, 62], [98, 88], [134, 86]]), ghost(HIKITE_R)], KIBA), arrow('M84 118 C98 110 120 104 146 98'), ['von vorne (Kiba-dachi): Hakenstoß zur Seite,', 'Unterarm waagerecht vor dem Solarplexus']),
    'ura-zuki': S('Ura-zuki', side([PULL_FAR, ...S_ZK, Object.assign(arm([[112, 62], [124, 95], [160, 90]]), { via: [[[[112, 62], [110, 96], [144, 100]]]] }), ghost(HIP_NEAR)]), arrow('M118 116 L156 104') + hit(170, 90, 'Handrücken unten', 230, 140, 'end'), ['seitlich: kurzer Stoß aus nächster Nähe,', 'der Handrücken zeigt nach unten']),
    'age-zuki': S('Age-zuki', side([PULL_FAR, ...S_ZK, Object.assign(arm([[112, 62], [142, 46], [172, 30]]), { via: [[[[112, 62], [118, 96], [150, 92]]]] }), ghost(HIP_NEAR)]), arrow('M124 112 C158 106 180 78 184 46') + hit(178, 24), ['seitlich: Faust steigt im Bogen nach oben', 'zum Kinn, der Arm ist am Ende gestreckt']),
    'yama-zuki': S('Yama-zuki', side([from(far(arm([[112, 62], [144, 104], [182, 118]])), HIP_FAR.p), ...S_ZK, from(arm([[112, 62], [150, 44], [186, 38]]), HIP_NEAR.p)], { trunk: [[116, 54], [108, 116]] }), arrow('M124 96 C150 74 166 50 178 42') + arrow('M122 110 C144 118 160 120 174 118'), ['seitlich: beide Fäuste gleichzeitig –', 'eine oben (Jodan), eine unten (Gedan)'], still),
    'otoshi-zuki': S('Otoshi-zuki', side([PULL_FAR, ...S_ZK, arm([[112, 62], [140, 84], [168, 106]]), ghost(arm([[112, 62], [138, 40], [146, 8]]))]), arrow('M158 4 C186 22 194 62 184 96') + hit(174, 112), ['seitlich: Faust fällt von oben schräg nach', 'unten, der Arm streckt sich dabei']),
    nukite: S('Nukite', side([PULL_FAR, ...S_ZK, arm([[112, 62], [148, 70], [180, 74]], 'open'), ghost(HIP_NEAR)]), hit(196, 76, 'Fingerspitzen', 232, 46, 'end'), ['seitlich: Stoß mit den Fingerspitzen']),

    /* ---------- Uchi ---------- */
    'uraken-uchi': F('Uraken-uchi', fr([HIKITE_L, arm([[93, 62], [62, 54], [32, 46]]), ghost(arm([[93, 62], [108, 84], [124, 62]]))]), arrow('M122 48 C100 24 62 26 36 36') + hit(24, 44, 'Faustrücken', 14, 84, 'start'), ['von vorne: Faustrücken schnellt', 'im Bogen nach außen']),
    'tettsui-uchi': F('Tettsui-uchi', fr([HIKITE_L, arm([[93, 62], [62, 70], [30, 76]]), ghost(arm([[93, 62], [112, 80], [128, 54]]))]), arrow('M86 22 C64 20 42 32 30 58') + hit(22, 78, 'Hammerfaust', 14, 150, 'start'), ['von vorne: Hammerfaust schwingt von der', 'Gegenschulter im Bogen zur Seite']),
    'shuto-uchi': S('Shuto-uchi', side([from(far(arm([[112, 62], [100, 92], [110, 104]])), [[112, 62], [140, 74], [168, 70]]), ...S_ZK, keys(arm([[112, 62], [146, 56], [180, 50]], 'open'), [[[112, 62], [104, 60], [100, 36]], [[112, 62], [114, 60], [128, 42]], [[112, 62], [146, 56], [180, 50]]]), ghost(arm([[112, 62], [104, 60], [100, 36]], 'open'))]), arrow('M94 24 C124 24 160 32 188 40') + hit(188, 50, 'Handkante', 226, 96, 'end'), ['seitlich: Hand holt am Ohr aus, die Handkante', 'schwingt waagerecht von der Seite nach vorne']),
    'haito-uchi': S('Haito-uchi', side([from(far(arm([[112, 62], [100, 92], [110, 104]])), [[112, 62], [140, 74], [168, 70]]), ...S_ZK, Object.assign(arm([[112, 62], [146, 52], [176, 40]], 'open'), { via: [[[[112, 62], [126, 92], [146, 96]]]] }), ghost(arm([[112, 62], [94, 90], [74, 104]], 'open'))]), arrow('M66 116 C110 140 170 96 180 54') + hit(182, 40, 'Daumenseite', 226, 96, 'end'), ['seitlich: Hand schwingt weit von unten', 'außen nach vorne – die Daumenseite trifft']),
    'enpi-uchi': S('Enpi-uchi', side([PULL_FAR, ...S_ZK, Object.assign(arm([[112, 62], [146, 68], [118, 62]]), { via: [[[[112, 62], [126, 94], [130, 70]]]] }), ghost(HIP_NEAR)]), arrow('M118 110 C140 106 152 92 154 80') + hit(156, 68, 'Ellbogen', 226, 30, 'end'), ['seitlich: der Ellbogen stößt nach vorne,', 'die Faust bleibt dicht an der Brust']),
    'furi-enpi': F('Furi-enpi', fr([HIKITE_L, arm([[93, 62], [60, 66], [94, 76]]), ghost(HIKITE_R)], KIBA), arrow('M98 110 C80 106 62 92 52 76') + hit(52, 64), ['von vorne (Kiba-dachi): Ellbogen', 'schwingt zur Seite']),
    'ushiro-enpi': S('Ushiro-enpi', side([GUARD_FAR, ...S_ZK, arm([[112, 62], [80, 88], [108, 96]]), ghost(PUNCH)]), arrow('M176 86 C150 104 110 108 86 104') + hit(72, 88), ['seitlich: Ellbogen stößt nach hinten']),
    'hasami-uchi': F('Hasami-uchi', fr([keys(arm([[93, 62], [64, 82], [90, 90]]), [[[93, 62], [78, 36], [100, 14]], [[93, 62], [64, 74], [36, 86]], [[93, 62], [62, 78], [62, 96]], [[93, 62], [64, 82], [90, 90]]], 3), keys(arm([[127, 62], [156, 82], [130, 90]]), [[[127, 62], [142, 36], [120, 14]], [[127, 62], [156, 74], [184, 86]], [[127, 62], [158, 78], [158, 96]], [[127, 62], [156, 82], [130, 90]]], 3), ghost(arm([[93, 62], [64, 74], [36, 86]])), ghost(arm([[127, 62], [156, 74], [184, 86]]))]), arrow('M26 70 C30 90 48 100 72 98') + arrow('M194 70 C190 90 172 100 148 98'), ['von vorne: beide Hammerfäuste schlagen zangenartig', 'von außen zu beiden Seiten des Bauches']),
    'teisho-uchi': S('Teisho-uchi', side([PULL_FAR, ...S_ZK, arm([[112, 62], [148, 64], [180, 62]], 'vopen'), ghost(HIP_NEAR)]), arrow('M122 92 L176 80') + hit(190, 68, 'Handballen', 230, 40, 'end'), ['seitlich: Stoß mit dem Handballen']),

    /* ---------- Uke ---------- */
    'shuto-uke': F('Shuto-uke', fr([arm([[127, 62], [134, 92], [112, 92]], 'open'), arm([[93, 62], [70, 96], [70, 56]], 'open'), ghost(arm([[93, 62], [110, 84], [128, 56]], 'open'))], F_KK), arrow('M126 46 C104 36 82 40 72 46'), ['von vorne (Kokutsu-dachi): Handkante,', 'zweite Hand vor dem Solarplexus']),
    'morote-uke': F('Morote-uke', fr([from(arm([[93, 62], [86, 102], [76, 60]]), HIKITE_R.p), from(arm([[127, 62], [120, 98], [92, 100]]), HIKITE_L.p)]), arrow('M74 112 C64 96 64 80 70 70') + ring(90, 100, 12), ['von vorne: die zweite Faust stützt', 'den Arm am Ellbogen'], still),
    'juji-uke': F('Juji-uke', fr([from(arm([[93, 62], [80, 34], [120, 10]], 'open'), HIKITE_R.p), from(arm([[127, 62], [140, 34], [100, 10]], 'open'), HIKITE_L.p)]), arrow('M86 104 C82 76 92 46 104 26') + ring(110, 16, 12), ['von vorne: Handgelenke über', 'dem Kopf gekreuzt (Jodan)'], still),
    'kakiwake-uke': F('Kakiwake-uke', fr([arm([[93, 62], [72, 100], [66, 58]]), arm([[127, 62], [148, 100], [154, 58]]), ghost(arm([[93, 62], [100, 96], [124, 76]])), ghost(arm([[127, 62], [120, 96], [96, 76]]))]), arrow('M100 44 L74 40') + arrow('M120 44 L146 40'), ['von vorne: beide Arme drücken', 'nach außen auseinander']),
    'nagashi-uke': F('Nagashi-uke', fr([HIKITE_L, from(arm([[93, 62], [86, 88], [118, 42]], 'open'), [[93, 62], [72, 62], [74, 32]])]), arrow('M84 30 C98 20 120 22 134 34'), ['von vorne: offene Hand lenkt den', 'Angriff am Gesicht vorbei'], still),
    'osae-uke': F('Osae-uke', fr([HIKITE_L, arm([[93, 62], [78, 92], [112, 98]], 'open'), ghost(arm([[93, 62], [78, 76], [108, 74]], 'open'))]), arrow('M132 74 L132 104'), ['von vorne: offene Hand drückt', 'den Angriff nach unten']),
    // wie Heian Godan 14: Kiba-dachi, linke Hand hakt langsam zur linken Seite, rechte Faust zieht zur Hüfte
    'kake-uke': F('Kake-uke', fr([HIKITE_R, arm([[127, 62], [160, 74], [192, 70]], 'open'), ghost(arm([[127, 62], [110, 90], [92, 76]], 'open')), ghost(arm([[93, 62], [104, 96], [124, 88]]))], KIBA), arrow('M96 66 C122 44 160 40 186 60'), ['von vorne (Kiba-dachi, Heian Godan 14): Arme vor der', 'Brust übereinander, dann Arm gestreckt zur Seite']),
    'sukui-uke': S('Sukui-uke', side([HIP_FAR, ...S_KK, from(arm([[112, 62], [132, 104], [162, 98]], 'open'), [[112, 62], [120, 110], [146, 130]])]), arrow('M158 134 C172 122 174 106 170 92'), ['seitlich: Hand schöpft von unten', 'den tretenden Fuß'], still),
    'haiwan-uke': F('Haiwan-uke', fr([from(arm([[127, 62], [156, 58], [160, 20]]), HIKITE_L.p), HIKITE_R]), `<path d="M158 52 L160 28" stroke-width="10" ${HLS}/>` + arrow('M132 100 C150 88 166 62 164 30'), ['von vorne: Rückseite des Unterarms wehrt', 'seitlich ab, die andere Faust an der Hüfte'], still),
    'tsukami-uke': F('Tsukami-uke', fr([HIKITE_L, Object.assign(arm([[93, 62], [68, 70], [56, 50]], 'open'), { seq: [[HIKITE_R.p], [[[93, 62], [68, 70], [56, 50]]], [[[93, 62], [80, 96], [90, 104]]]], impact: 1 })]), arrow('M46 46 C48 72 66 92 86 104'), ['von vorne: Hand greift den Angriff', 'und zieht ihn heran'], still),
    'tate-shuto-uke': S('Tate-shuto-uke', side([HIP_FAR, ...S_KK, arm([[112, 62], [150, 66], [184, 64]], 'vopen')]), arrow('M126 100 C146 84 162 72 176 68'), ['seitlich: Arm fast gestreckt,', 'Handkante senkrecht'], still),
    'teisho-uke': F('Teisho-uke', fr([HIKITE_L, from(arm([[93, 62], [66, 90], [98, 96]], 'vopen'), [[93, 62], [62, 84], [50, 96]])]), arrow('M44 98 L86 98'), ['von vorne: der Handballen wehrt ab'], still),
    uchiotoshi: F('Uchiotoshi', fr([HIKITE_L, arm([[93, 62], [74, 96], [112, 104]]), ghost(arm([[93, 62], [74, 40], [80, 14]]))]), arrow('M70 10 C56 50 72 86 104 96'), ['von vorne: Unterarm schlägt', 'den Angriff nach unten']),

    /* ---------- Geri ---------- */
    'yoko-geri-keage': S('Yoko-geri-keage', Object.assign({}, YOKO, { parts: yokoBase.concat([Object.assign(leg([[117, 118], [156, 96], [190, 64]], [198, 74]), { seq: [YOKO_STAND, YOKO_KNEE, [[[117, 118], [156, 96], [190, 64]], [198, 74]], YOKO_KNEE, YOKO_STAND], impact: 2 }), ghost(leg(...YOKO_KNEE))]) }), arrow('M126 164 C168 156 192 118 196 86') + arrow('M212 96 C206 126 186 150 150 160', true) + hit(204, 66, 'Fußkante', 232, 34, 'end'), ['von vorne: Bein schnappt seitlich', 'nach oben und sofort zurück']),
    fumikomi: S('Fumikomi', side(MAE_BASE.concat([leg([[110, 116], [144, 170], [150, 226]], [168, 230]), ghost(leg([[110, 116], [148, 100], [140, 152]], [156, 158]))])), arrow('M162 160 L166 212') + hit(150, 232), ['seitlich: Knie hoch, der Fuß', 'stampft kräftig nach unten']),
    namigaeshi: F('Namigaeshi', fr([HIKITE_R, HIKITE_L, leg([[102, 118], [100, 152], [118, 172]], [126, 164]), ghost(LEG_R)], [KIBA[1]]), arrow('M84 222 C88 200 104 184 114 178'), ['von vorne: Fußsohle schnellt nach innen', 'hoch und wieder zurück (Tekki)']),
    'nidan-geri': S('Nidan-geri', { head: [114, 18], view: 'side', trunk: [[112, 40], [108, 104]], parts: [far(arm([[112, 50], [128, 78], [142, 68]])), leg([[106, 104], [138, 100], [120, 140]], [134, 148], { far: true }), arm([[112, 50], [104, 84], [118, 94]]), leg([[108, 104], [150, 92], [190, 72]], [196, 56])] }, arrow('M96 226 L98 166', true) + hit(198, 62), ['seitlich: zwei Tritte im Sprung'], still),
    'hiza-geri': S('Hiza-geri', side([far(arm([[112, 62], [140, 56], [154, 74]])), leg([[108, 116], [104, 176], [100, 228]], [118, 232], { far: true }), from(leg([[110, 116], [152, 90], [140, 146]], [156, 152]), MAE.stand[0], MAE.stand[1]), arm([[112, 62], [144, 60], [160, 78]])]), arrow('M150 176 C164 150 168 120 162 100') + hit(164, 84, 'Knie', 224, 54, 'end'), ['seitlich: das Knie stößt', 'nach oben'], still),
    'ren-geri': S('Ren-geri', side(MAE_BASE.concat([leg([[108, 116], [148, 96], [184, 70]], [192, 54]), ghost(leg([[108, 116], [152, 116], [194, 112]], [199, 96]))])), num(214, 102, 1) + num(208, 50, 2), ['seitlich: mehrere Tritte hintereinander']),
    'sonoba-geri': S('Sonoba-geri', side(MAE_BASE.concat([Object.assign(leg(...MAE.ext), { seq: [MAE.stand, MAE.knee, MAE.ext, MAE.knee, MAE.stand], impact: 2 }), ghost(leg([[108, 116], [112, 176], [114, 228]], [132, 232]))])), arrow('M138 214 C170 196 190 160 196 124') + arrow('M210 128 C206 170 180 206 150 222', true), ['seitlich: Tritt am Platz – der Fuß kehrt', 'in denselben Stand zurück']),
    'kizami-geri': S('Kizami-geri', side([HIP_FAR, leg([[106, 116], [72, 172], [38, 226]], [56, 232], { far: true }), arm([[112, 62], [132, 86], [150, 76]]), Object.assign(leg([[110, 116], [152, 112], [192, 108]], [197, 92]), { seq: [KZ_STAND, KZ_KNEE, [[[110, 116], [152, 112], [192, 108]], [197, 92]], KZ_KNEE, KZ_STAND], impact: 2 }), ghost(leg(...KZ_STAND))]), arrow('M152 218 C178 198 192 150 196 120') + hit(199, 96, 'Fußballen', 232, 66, 'end'), ['seitlich: Tritt mit dem vorderen Bein,', 'ohne Schritt']),

    /* ---------- Kamae ---------- */
    'chudan-kamae': S('Chudan-kamae', side([GUARD_FAR, ...S_ZK, arm([[112, 62], [134, 88], [162, 76]])]), '', ['seitlich: Kampfhaltung, Hände', 'auf mittlerer Höhe'], still),
    'gedan-kamae': S('Gedan-kamae', side([GUARD_FAR, ...S_ZK, arm([[112, 62], [134, 100], [158, 124]])]), '', ['seitlich: Kampfhaltung, vordere Faust', 'unten über dem Knie'], still),
    'shuto-kamae': S('Shuto-kamae', side([far(arm([[112, 62], [118, 92], [136, 88]], 'open')), ...S_KK, arm([[112, 62], [138, 80], [160, 62]], 'open')]), '', ['seitlich (Kokutsu-dachi): beide', 'Hände als Handkanten'], still),
    'koshi-kamae': F('Koshi-kamae', fr([arm([[93, 62], [104, 96], [126, 104]]), arm([[127, 62], [140, 94], [130, 114]])]), ring(128, 110, 15), ['von vorne: beide Fäuste übereinander', 'an einer Hüfte'], still),
    'mizunagare-no-kamae': F('Mizunagare-no-kamae', fr([HIKITE_L, arm([[93, 62], [74, 88], [118, 96]])]), '', ['von vorne: Unterarm schräg vor dem', 'Solarplexus, zwei Fäuste entfernt'], still),
    hanmi: F('Hanmi', hanmiSpec(false), tag(124, 60, 'vordere Schulter', 206, 20, 'end'), ['von vorne: Oberkörper halb gedreht –', 'Schulter des vorderen Beins vorne'], still),
    'gyaku-hanmi': F('Gyaku-hanmi', hanmiSpec(true), tag(98, 60, 'vordere Schulter', 14, 20, 'start'), ['von vorne: zur Gegenseite gedreht –', 'Schulter des hinteren Beins vorne'], still),
    shizentai: F('Shizentai', fr([arm([[93, 62], [86, 96], [94, 128]]), arm([[127, 62], [134, 96], [126, 128]])], SHIZEN), '', ['von vorne: natürliche Haltung,', 'Füße etwa schulterbreit'], still),
    hikite: S('Hikite', side([far(PUNCH), ...S_ZK, HIP_NEAR]), arrow('M176 86 C150 106 132 110 124 108') + ring(114, 104), ['seitlich: zurückgezogene Faust', 'an der Hüfte']),

    /* ---------- Begriffe ---------- */
    yoi: F('Yoi', fr([arm([[93, 62], [90, 96], [100, 118]]), arm([[127, 62], [130, 96], [120, 118]])], SHIZEN), '', ['von vorne: Bereitschaftsstellung'], still),
    rei: () => {
      const legs = [leg([[106, 116], [106, 176], [106, 228]], [124, 232], { far: true }), leg([[110, 116], [110, 176], [110, 228]], [128, 232])];
      if (!mode.anim) return scene('Rei', 240, { head: [136, 42], view: 'side', trunk: [[126, 60], [108, 116]], parts: [far(arm([[124, 64], [124, 96], [122, 122]], 'open')), ...legs, arm([[124, 64], [126, 96], [124, 124]], 'open')] }, '', ['seitlich: Verbeugung'], still);
      // Oberkörper neigt sich aus der Hüfte und richtet sich wieder auf
      const tl = timeline(4);
      const upper = person({ head: [114, 30], view: 'side', trunk: [[112, 52], [108, 116]], parts: [far(arm([[112, 62], [110, 94], [110, 122]], 'open')), arm([[112, 62], [114, 94], [114, 122]], 'open')] });
      return scene('Rei', 240, { parts: legs }, `<g>${animTf('rotate', tl.expand(['0 108 116', '28 108 116', '28 108 116', '0 108 116']), tl)}${upper}</g>`, ['seitlich: Verbeugung'], still);
    },
    seiza: S('Seiza', SEIZA(SEIZA.hands), '', ['seitlich: kniender Fersensitz'], still),
    mokuso: S('Mokuso', SEIZA([[116, 180], [128, 198]]), `<path d="M116 127 q3 2.5 6 0" stroke="${INK}" stroke-width="1.5" fill="none"/>`, ['seitlich: im Fersensitz,', 'Augen geschlossen'], still),
    kiritsu: S('Kiritsu', SEIZA(SEIZA.hands), arrow('M176 214 L176 110'), ['aus dem Fersensitz aufstehen'], still),
    mawatte: () => {
      const k = side([GUARD_FAR, ...S_ZK, arm([[112, 62], [134, 100], [158, 124]])]);
      let fig = person(k);
      // Drehung auf der Stelle: die Figur wird über die Senkrechte gespiegelt (wirkt wie eine Drehung)
      if (mode.anim) {
        const tl = timeline(2);
        fig = `<g transform="translate(110 0)"><g>${animTf('scale', tl.expand(['1 1', '-1 1']), tl)}<g transform="translate(-110 0)">${fig}</g></g></g>`;
        return scene('Mawatte', 240, {}, `<g>${fadeLoop(tl)}${fig}</g>`, ['seitlich: Drehung um 180°', 'in die Gegenrichtung'], still);
      }
      fig = `<g transform="translate(220 0) scale(-1 1)">${fig}</g>`;
      return scene('Mawatte', 240, {}, fig + arrow('M162 20 C140 -4 84 -4 62 20') + `<text x="112" y="-2" font-size="13" font-weight="700" text-anchor="middle" fill="${HL}" ${FONT}>180°</text>`, ['seitlich: Drehung um 180° – vorher', 'Blick nach rechts, jetzt nach links'], still);
    },
    kiai: S('Kiai', side([HIP_FAR, ...S_ZK, from(PUNCH, HIP_NEAR.p)]), `<path d="M132 24 l14 -8 M134 32 l17 0 M132 40 l14 8" stroke="${HL}" stroke-width="3" stroke-linecap="round"/>`, ['seitlich: lauter Schrei', 'im Moment des Treffers'], still),
    'sun-dome': S('Sun-dome', side([HIP_FAR, ...S_ZK, arm([[112, 62], [148, 52], [180, 44]])]), `<circle cx="210" cy="40" r="14" fill="none" stroke="${GHOST}" stroke-width="2.5" stroke-dasharray="4 3"/><path d="M190 30 V54 M195 30 V54" stroke="${HL}" stroke-width="2"/>`, ['seitlich: Technik stoppt kurz', 'vor dem Ziel'], still),
    'ashi-barai': S('Ashi-barai', side([GUARD_FAR, leg([[106, 116], [100, 176], [96, 228]], [114, 232], { far: true }), arm([[112, 62], [134, 88], [160, 78]]), from(leg([[110, 116], [146, 176], [186, 220]], [194, 208]), [[110, 116], [118, 174], [126, 226]], [144, 230])]), `<path d="M212 150 L214 228 L232 232" stroke="${GHOST}" stroke-width="14" fill="none" stroke-linecap="round" stroke-dasharray="6 4"/>` + arrow('M140 226 L192 226'), ['seitlich: der Fuß fegt das Bein', 'des Gegners weg'], still),
    'yori-ashi': () => scene('Yori-ashi', 240, side([GUARD_FAR, ...S_ZK, arm([[112, 62], [134, 88], [162, 76]])], { shift: [-30, 30] }), '', ['seitlich: beide Füße gleiten gemeinsam', 'nach vorne, der Stand bleibt gleich'], still),
    'suri-ashi': () => scene('Suri-ashi', 300, side([far(arm(SA.guardFar)), ...stepLegs([[[110, 116], [118, 172], [110, 226]], [128, 232]]), arm(SA.guardNear)], { shift: STEP_SHIFT }), '', ['seitlich: der hintere Fuß gleitet nah am', 'Standbein vorbei nach vorne'], still),
    'tai-sabaki': () => {
      const R0 = [[[102, 118], [94, 176], [86, 228]], [80, 236]];
      const L0 = [[[118, 118], [126, 176], [134, 228]], [140, 236]];
      const spec = fr([arm([[93, 62], [90, 94], [104, 90]]), arm([[127, 62], [130, 94], [116, 90]])], [
        leg(R0[0], R0[1], { under: true, seq: [R0, [[[102, 118], [80, 176], [60, 228]], [55, 236]], R0] }),
        leg(L0[0], L0[1], { under: true, act: true, seq: [L0, [[[118, 118], [140, 174], [158, 228]], [165, 236]], L0] }),
      ]);
      spec.shift = [0, 25, 50];
      const line = `<path d="M110 -4 V236" stroke="${GHOST}" stroke-width="2" stroke-dasharray="6 5"/><text x="104" y="4" font-size="10" text-anchor="end" fill="#c62828" ${FONT}>Angriffslinie</text>`;
      return scene('Tai-sabaki', 220, spec, numTag(204, 222, 1) + numTag(146, 222, 2), ['von vorne: zur Seite aus der Angriffslinie –', 'erst Fuß 1, dann Fuß 2'], { ghost: false, pre: line });
    },
    maai: () => {
      const k = side([GUARD_FAR, ...S_ZK, arm([[112, 62], [134, 88], [162, 76]])]);
      return scene('Maai', 260, {}, `<g transform="translate(26 47.6) scale(.8)"><g transform="translate(-50 0)">${person(k)}</g><g transform="translate(310 0) scale(-1 1)">${person(k)}</g>${arrow('M96 150 L164 150', false, true)}</g>`, ['Abstand zwischen den Partnern'], still);
    },
    enbusen: () =>
      frame(
        220,
        260,
        'Enbusen',
        `<path d="M40 46 H180 M110 46 V176 M40 176 H180" stroke="#90a4ae" stroke-width="8" stroke-linecap="round" fill="none"/><circle cx="110" cy="176" r="9" fill="${HL}"/><text x="110" y="202" font-size="11" text-anchor="middle" fill="#455a64" ${FONT}>Start</text>`,
        ['Linie, auf der sich eine Kata bewegt', '(z. B. Heian Shodan: „工“-Form)']
      ),

    /* ---------- Konzepte mit Partner ---------- */
    kime: S('Kime', side([HIP_FAR, ...S_ZK, from(PUNCH, HIP_NEAR.p)]), `<g data-arrow="1" stroke="${HL}" stroke-width="2.5" stroke-linecap="round">${[0, 60, 120, 180, 240, 300].map((a) => { const r = (a * Math.PI) / 180; return `<path d="M${(194 + Math.cos(r) * 11).toFixed(1)} ${(68 + Math.sin(r) * 11).toFixed(1)} L${(194 + Math.cos(r) * 19).toFixed(1)} ${(68 + Math.sin(r) * 19).toFixed(1)}"/>`; }).join('')}</g>` + hit(182, 68), ['Kime: im Treffmoment ist der ganze', 'Körper kurz maximal angespannt'], still),
    zanshin: duo('Zanshin', side([GUARD_FAR, ...S_ZK, arm([[112, 62], [134, 88], [162, 76]])]), side([far(arm([[112, 62], [104, 94], [110, 120]])), ...S_STAND, arm([[112, 62], [108, 94], [112, 120]])], { head: [108, 32], trunk: [[110, 54], [108, 116]] }), 310, `<path d="M74 28 L188 30" stroke="${HL}" stroke-width="2" stroke-dasharray="5 4"/>`, ['Zanshin: nach der Technik wach bleiben –', 'Blick und Haltung bleiben beim Partner']),
    deai: duo('Deai', side([HIP_FAR, ...S_ZK, arm([[112, 62], [150, 68], [190, 70]])]), side([far(arm([[112, 62], [134, 88], [156, 80]])), leg([[106, 116], [118, 172], [104, 226]], [122, 232], { far: true }), leg([[110, 116], [96, 170], [70, 224]], [88, 230]), HIP_NEAR]), 262, arrow('M246 208 L206 208', true) + hit(140, 70), ['Deai: Konter genau in dem Moment,', 'in dem der Partner angreift']),
    kogeki: duo('Kogeki', side([HIP_FAR, ...S_ZK, arm([[112, 62], [150, 50], [188, 42]])]), side([GUARD_FAR, ...S_STAND, arm([[112, 62], [126, 90], [146, 82]])]), 262, arrow('M24 214 L96 214', true), ['Kogeki: Angriff – hier Oi-zuki Jodan', 'auf den Partner']),
    bunkai: duo('Bunkai', side([HIP_FAR, ...S_ZK, arm([[112, 62], [144, 42], [126, 14]])]), side([HIP_FAR, ...S_ZK, arm([[112, 62], [150, 50], [188, 40]])]), 262, ring(84, 34, 16), ['Bunkai: Kata-Technik angewendet –', 'Age-uke gegen einen Jodan-Angriff']),

    /* ---------- Kumite-Formen und Kraftrichtung (schematisch) ---------- */
    'gohon-kumite': () => kumite('Gohon-Kumite', 5, ['Gohon-Kumite: 5 Angriffe vorwärts, 5 Abwehren', 'rückwärts, dann Gegenangriff mit Kiai']),
    'kihon-ippon-kumite': () => kumite('Kihon-Ippon-Kumite', 1, ['Kihon-Ippon-Kumite: ein angesagter Angriff,', 'Abwehr und Konter']),
    'tsuki-uchi': () => force('Tsuki und Uchi', 'Tsuki', 'Uchi', false, ['Tsuki: Kraft in Richtung des Unterarms', 'Uchi: Kraft im rechten Winkel dazu']),
    'keage-kekomi': () => force('Kekomi und Keage', 'Kekomi (Stoßtritt)', 'Keage (Schnapptritt)', true, ['Kekomi: Kraft in Richtung des Unterschenkels', 'Keage: Kraft im rechten Winkel dazu']),
  };

  /* ---------- Ergänzungen: weitere Stöße, Ellbogen, Abwehr, Tritte, Feger ---------- */
  const URA = [[112, 62], [124, 95], [160, 90]];
  const ghostLeg = (x) => `<path d="M${x} 150 L${x + 2} 228 L${x + 20} 232" stroke="${GHOST}" stroke-width="14" fill="none" stroke-linecap="round" stroke-dasharray="6 4"/>`;
  const FEG = [GUARD_FAR, leg([[106, 116], [100, 176], [96, 228]], [114, 232], { far: true }), arm([[112, 62], [134, 88], [160, 78]])];
  const STAND_R = [[110, 116], [118, 174], [126, 226]];
  Object.assign(T, {
    'tate-zuki': S('Tate-zuki', side([PULL_FAR, ...S_ZK, PUNCH, ghost(HIP_NEAR)]), arrow('M120 92 L174 84') + hit(190, 68, 'Faust senkrecht', 232, 34, 'end'), ['seitlich: Faust senkrecht (Daumen oben),', 'auf dem kürzesten Weg gerade zum Ziel']),
    'mawashi-zuki': F('Mawashi-zuki', fr([HIKITE_L, arm([[93, 62], [58, 60], [84, 36]]), ghost(HIKITE_R)]), arrow('M80 118 C34 112 30 60 70 38') + hit(92, 34, 'Faust', 150, 14, 'start'), ['von vorne: die Faust kommt im Bogen', 'von außen zum Ziel (Schläfe, Rippen)']),
    'awase-zuki': S('Awase-zuki', side([from(far(arm(JODAN)), HIP_FAR.p), ...S_ZK, from(arm(URA), HIP_NEAR.p)]), `<path d="M188 48 V90" stroke="${HL}" stroke-width="2" stroke-dasharray="4 3"/>` + arrow('M124 98 C146 76 162 58 176 50') + arrow('M122 110 C134 106 146 98 154 94'), ['seitlich: beide Fäuste gleichzeitig – oben Jodan,', 'unten Ura-zuki; der Oberkörper bleibt aufrecht'], still),
    'yoko-enpi': F('Yoko-enpi', fr([HIKITE_L, arm([[93, 62], [56, 66], [88, 72]]), ghost(arm([[93, 62], [110, 86], [128, 66]]))], KIBA), arrow('M116 82 C96 76 72 70 50 66') + hit(48, 66, 'Ellbogen', 14, 30, 'start'), ['von vorne (Kiba-dachi): der Ellbogen stößt', 'waagerecht zur Seite']),
    'mawashi-enpi': F('Mawashi-enpi', fr([HIKITE_L, arm([[93, 62], [118, 72], [138, 60]]), ghost(arm([[93, 62], [62, 70], [32, 76]]))]), arrow('M34 62 C54 46 90 46 112 62') + hit(118, 72, 'Ellbogen', 206, 120, 'end'), ['von vorne: der Ellbogen schwingt im', 'Bogen von außen zur Körpermitte']),
    'age-enpi': F('Age-enpi', fr([HIKITE_L, arm([[93, 62], [98, 22], [84, 46]]), ghost(HIKITE_R)]), arrow('M74 110 C64 82 76 42 92 16') + hit(98, 18, 'Ellbogen', 160, 6, 'start'), ['von vorne: der Ellbogen steigt dicht am', 'Körper senkrecht nach oben']),
    'otoshi-enpi': F('Otoshi-enpi', fr([HIKITE_L, arm([[93, 62], [90, 100], [96, 68]]), ghost(arm([[93, 62], [92, 24], [94, -12]]))], KIBA), arrow('M70 0 L70 92') + hit(90, 104, 'Ellbogen', 20, 150, 'start'), ['von vorne (Kiba-dachi): der Ellbogen', 'fällt senkrecht nach unten']),
    'te-nagashi-uke': F('Te-nagashi-uke', fr([arm([[93, 62], [96, 92], [114, 86]]), from(arm([[127, 62], [116, 84], [76, 46]], 'open'), [[127, 62], [148, 76], [140, 36]])]), arrow('M142 26 C126 16 98 16 76 30'), ['von vorne: linke offene Hand schiebt den', 'Jodan-Angriff nach rechts weg'], still),
    'gedan-nagashi-uke': F('Gedan-nagashi-uke', fr([HIKITE_L, from(arm([[93, 62], [96, 100], [122, 126]], 'open'), [[93, 62], [76, 100], [60, 134]])]), arrow('M58 146 C80 152 104 146 124 136'), ['von vorne: Abwehr unten von außen nach', 'innen – Gegenrichtung zum Gedan-barai'], still),
    'manji-uke': F('Manji-uke', fr([from(arm([[93, 62], [80, 100], [70, 138]]), [[93, 62], [108, 86], [128, 48]]), from(arm([[127, 62], [156, 44], [150, 8]]), HIKITE_L.p)]), arrow('M118 52 C110 96 90 128 66 148') + arrow('M126 100 C152 86 164 56 158 18'), ['von vorne: eine Hand wehrt unten ab', '(Gedan-barai), die andere schützt oben'], still),
    'mae-geri-kekomi': S('Mae-geri-kekomi', side(MAE_BASE.concat([Object.assign(leg([[108, 116], [152, 112], [196, 110]], [200, 92]), { seq: [MAE.stand, MAE.knee, [[[108, 116], [152, 112], [196, 110]], [200, 92]], MAE.knee, MAE.stand], impact: 2 }), ghost(leg(...MAE.knee))])), arrow('M152 152 L188 120') + hit(198, 112, 'Ferse', 232, 150, 'end'), ['seitlich: Knie hoch, das Bein stößt gerade', 'durch – Ferse oder Fußballen treffen']),
    'ura-mawashi-geri': S('Ura-mawashi-geri', Object.assign({}, YOKO, { parts: yokoBase.concat([leg([[117, 118], [160, 92], [204, 74]], [212, 88])]) }), arrow('M128 34 C176 12 216 32 218 64') + hit(208, 78, 'Sohle / Ferse', 232, 130, 'end'), ['von vorne: Bogen gegenläufig zum', 'Mawashi-geri – Sohle oder Ferse trifft'], still),
    'ushiro-mawashi-geri': S('Ushiro-mawashi-geri', Object.assign({}, YOKO, { parts: yokoBase.concat([leg([[117, 118], [160, 92], [204, 74]], [212, 88])]) }), arrow('M128 34 C176 12 216 32 218 64') + arrow('M64 172 C34 140 42 96 74 82') + `<text x="20" y="190" font-size="10" font-weight="700" fill="${HL}" ${FONT}>Drehung</text>` + hit(208, 78), ['von vorne: aus einer Körperdrehung wie bei', 'Ushiro-geri, dann im Bogen zum Ziel'], still),
    'mawashi-hiza-geri': S('Mawashi-hiza-geri', Object.assign({}, YOKO, { parts: yokoBase.concat([from(leg([[117, 118], [160, 104], [148, 152]], [142, 160]), YOKO_STAND[0], YOKO_STAND[1])]) }), arrow('M184 168 C192 136 182 112 166 104') + hit(164, 102, 'Knie', 226, 60, 'end'), ['von vorne: das Knie schwingt im Bogen', 'waagerecht oder schräg zum Ziel'], still),
    'teisoku-barai': S('Teisoku-ashi-barai', side(FEG.concat([from(leg([[110, 116], [146, 176], [186, 220]], [194, 208]), STAND_R, [144, 230])])), ghostLeg(212) + arrow('M140 226 L188 224') + hit(190, 214, 'Fußsohle', 232, 170, 'end'), ['seitlich: die Fußsohle fegt das Bein', 'des Partners weg'], still),
    'haisoku-barai': S('Haisoku-ashi-barai', side(FEG.concat([from(leg([[110, 116], [150, 172], [180, 216]], [198, 222]), STAND_R, [144, 230])])), ghostLeg(212) + arrow('M126 236 C150 244 176 238 188 226') + hit(186, 218, 'Spann', 232, 170, 'end'), ['seitlich: der Spann fegt im Bogen,', 'meist mit dem vorderen Fuß'], still),
    'komura-barai': S('Komura-ashi-barai', side(FEG.concat([from(leg([[110, 116], [84, 170], [60, 214]], [46, 208]), STAND_R, [144, 230])])), ghostLeg(30) + arrow('M132 222 C104 228 82 218 70 204') + hit(70, 192, 'Wade', 20, 130, 'start'), ['seitlich: die Wade hakt das Bein', 'des Partners von hinten weg'], still),
  });

  SK.gfx.TECH = T;
})();
