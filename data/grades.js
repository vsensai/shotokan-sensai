/* DJKB-Prüfungsprogramm 9. Kyu bis 3. Dan (und höhere Dan-Grade) – Kihon, Kata, Kumite, Theorie.
   Wortlaut eng nach: DJKB-Prüfungsordnung JKA-Karate für Kyu- und Dan-Prüfungen, Stand 2026.
   Kihon-Einträge: erste Zeile = Übung, weitere Zeilen = Fortsetzung (z. B. Wendung). */
(function () {
  'use strict';
  SK.sources = {
    po: 'DJKB-Prüfungsordnung JKA-Karate, Stand 2026',
    pdf: 'Karate-Do Kata Vol. 1 (JKA)',
    pdf2: 'Karate-Do Kata Vol. 2 (JKA) – daraus nur Hangetsu',
    allg: 'Allgemeines Shotokan-/JKA-Grundwissen (u. a. Wikipedia: Shōtōkan, Gichin Funakoshi, JKA)',
    kompakt: 'Heft „Karate kompakt – Grundlagen im Überblick“ (F. Tartaglia, aus „Die Karate-Essenz“) – Inhalte in eigenen Worten',
  };

  const HEIAN = ['heian-shodan', 'heian-nidan', 'heian-sandan', 'heian-yondan', 'heian-godan'];
  const SENTEI_BOOK = ['bassai-dai', 'kanku-dai', 'jion', 'enpi', 'hangetsu']; // Hangetsu aus Vol. 2
  const ALL_BOOK = HEIAN.concat(['tekki-shodan'], SENTEI_BOOK);
  const SENTEI = 'Bassai-Dai, Kanku-Dai, Jion, Enpi, Hangetsu';
  const ZWEI_HEIAN = 'Mindestens 2 vom Prüfer ausgewählte Heian-Kata';

  // Allgemeine Hinweise zur Ausführung (Prüfungsordnung, Abschnitt 3)
  SK.examHints = [
    'Abkürzungen der Stellungen: Zk = Zenkutsu-Dachi, Kk = Kokutsu-Dachi, Kb = Kiba-Dachi.',
    'Alle Fauststöße werden generell Chudan ausgeführt. Ausnahmen sind im Programm angegeben.',
    'Ushiro-Geri und Yoko-Geri-Kekomi werden generell Chudan, alle sonstigen Fußtritte (auch Kizami-Mae-Geri) generell Jodan ausgeführt. Ausnahmen sind im Programm angegeben.',
    'Seitliche Fußtritte sind in beide Richtungen auszuführen.',
  ];

  // Inhaltliche Schwerpunkte der drei Stufen (Vorbemerkungen der Prüfungsordnung)
  const STUFE = {
    I: {
      name: 'Stufe I (9., 8., 7. Kyu)',
      kihon: [
        'Die Grundtechniken werden in einfachen Vorwärts- und Rückwärtsbewegungen geübt. Der Anfänger soll sich dabei vor allem auf seine Stellung konzentrieren; Vorwärts- und Rückwärtsbewegungen werden mit der jeweils richtigen Stellung ausgeführt.',
        'Stellungen, Körperbewegungen und Techniken müssen harmonisch und synchron vollzogen werden.',
      ],
      kumite: [
        'Beim Gohon-Kumite (9. bis 7. Kyu) und beim Kihon-Ippon-Kumite (ab dem 7. Kyu) muss die jeweilige Angriffs- bzw. Abwehrtechnik zielgenau und zielgerecht ausgeführt werden.',
        'Unbedingt auf die korrekte Distanz achten – beim Angriff, bei der Abwehr und bei der Kontertechnik nach der Abwehr.',
        'Der Abwehrende muss den Angriff dicht vor seinem Körper kraftvoll blocken.',
      ],
    },
    II: {
      name: 'Stufe II (6., 5., 4. Kyu)',
      kumite: [
        'Besonderer Wert auf die Hüftdrehung in der Abwehr und einen kraftvollen Konter nach der Abwehr. Abwehr- und Kontertechnik werden aus der gleichen Stellung ausgeführt – Konzentration auf richtige Stellung, Haltung und Hüftdrehung bei kraftvoller Ausführung.',
        'Zum 6. Kyu wird Kihon-Ippon-Kumite geprüft, zum 5. und 4. Kyu Jiyu-Ippon-Kumite; im Ermessen des Prüfers kann zusätzlich Kihon-Ippon-Kumite geprüft werden.',
        'Kihon-Ippon-Kumite: Der Angreifer muss jeden Angriff mit solcher Kraft durchführen, als ob die Angriffschance nur einmal gegeben wäre.',
        'Der Angreifer muss den richtigen Abstand zum Partner einnehmen.',
        'Der Verteidiger muss der Angriffstechnik blitzschnell ausweichen (Tai-Sabaki) und danach sofort die Kontertechnik ausführen – dabei die Reichweite der Kontertechnik beachten.',
        'Der Block muss so stark sein, dass ein Chudan-Zuki als Konter ohne Behinderung durch die vorherige Angriffstechnik erfolgen kann. Auch Fußtechniken und Uchi-Techniken können als Konter wirkungsvoll eingesetzt werden.',
        'Die Abwehrseite steht zunächst in Shizentai, ohne zu schwanken oder sich zu bewegen (psychische Stabilität). Der Block sollte auch von innen nach außen trainiert werden – z. B. Angriff rechts mit Zuki, Block mit rechtem Arm, linkes Bein zurück, abschließende Kontertechnik.',
      ],
    },
    III: {
      name: 'Stufe III (3., 2., 1. Kyu und 1. Dan)',
      kumite: [
        'Der Verteidiger führt die Kontertechnik in anderer Stellung als die Abwehrtechnik aus. Der Konter wird durch die Kraft der Stellungsänderung verstärkt – durch Gewichtsverlagerung und Hüftdrehung, ohne Balance und Körperhaltung zu verlieren.',
      ],
    },
  };
  const JIYU_IPPON = [
    'Jiyu-Ippon-Kumite (ab dem 5. Kyu) schult korrekte Distanz, gutes Timing, blitzschnelle Entscheidungen und die Überwindung eigener Unsicherheiten beim Angriff.',
    'Beide Seiten stehen in freier Stellung (Chudan-Kamae) und suchen den für sie jeweils günstigsten Abstand.',
    'Der Angreifer führt seine angesagte Technik mit größtem Einsatz aus, ohne Gedanken an die nächste, ihn erwartende Aktion des Verteidigers.',
    'Der Abwehrende darf nicht den weitesten Abstand wählen, sondern soll im möglichst kurzen Abstand blocken bzw. ausweichen und dann kraftvoll kontern (Zuki-, Uchi- oder Keri-Technik).',
    'Ab dem 2. Kyu werden mindestens 3 verschiedene Kontertechniken verlangt.',
    'Abstand nehmen (Maai): Der Gegner fühlt sich unterschiedlich bedrängt – je nachdem, ob die vordere Hand geballt oder geöffnet ist, ob sie Jodan, Chudan oder Gedan gehalten wird und ob der Schwerpunkt im Kamae vorne oder zurück liegt. Alle diese Situationen im Training durchspielen.',
  ];

  const REPS = 'Kihon-Techniken sind je 3x auszuführen.';

  // Gohon-Kumite (9. bis 7. Kyu)
  const GOHON_ANGRIFF = ['a) aus Gedan-Kamae links: 5x fortlaufend Jodan-Oi-Zuki', 'b) aus Gedan-Kamae links: 5x fortlaufend Chudan-Oi-Zuki'];
  const GOHON_ABLAUF = [
    'Der Angreifer geht rechts zurück in Zk Gedan-Kamae und greift fünfmal Jodan-Oi-Zuki fortlaufend an. Der Verteidiger steht zunächst in Shizentai.',
    'Beim ersten Angriff geht der Verteidiger mit Age-Uke rechts zurück und wehrt links ab, danach fortlaufend.',
    'Nach der fünften Abwehr Konter Chudan-Gyaku-Zuki mit Kiai.',
    'Danach zieht der Verteidiger den hinteren Fuß nach vorne in die Ausgangsstellung, der Angreifer den vorderen Fuß nach hinten in die Ausgangsstellung.',
    'Die gleiche Ausführung bei Chudan-Oi-Zuki mit der Abwehr Soto-Uke.',
  ];
  const gohon = (soto) => ({
    form: 'Gohon-Kumite',
    angriff: GOHON_ANGRIFF,
    abwehr: [
      'a) aus Shizentai: Age-Uke, rechts zurück, links abwehren – nach der fünften Abwehr Konter Chudan-Gyaku-Zuki, Gegenangriff mit Kiai',
      `b) aus Shizentai: Soto-Uke, ${soto} – nach der fünften Abwehr Konter Chudan-Gyaku-Zuki, Gegenangriff mit Kiai`,
    ],
    ablauf: GOHON_ABLAUF,
  });

  // Kihon-Ippon-Kumite zum 6. Kyu: Abwehr mit festgelegtem Tai-Sabaki
  const SABAKI_L = 'Mit rechtem Fuß, Tai-Sabaki mit Schrittbewegung nach links hinten, leicht aus der Angriffslinie heraus';
  const SABAKI_R = 'Mit rechtem Fuß, Tai-Sabaki mit Gleitbewegung nach rechts hinten, leicht aus der Angriffslinie heraus';
  const KIK_ANGRIFF = [
    'a) aus Gedan-Kamae links: 2x Jodan-Oi-Zuki',
    'b) aus Gedan-Kamae links: 2x Chudan-Oi-Zuki',
    'c) aus Chudan-Kamae links: 2x Chudan-Mae-Geri',
    'd) aus Chudan-Kamae links: 2x Chudan-Yoko-Geri-Kekomi',
  ];
  const KIK_ABWEHR = [
    { t: 'a) gegen Jodan-Oi-Zuki – aus Shizentai: Age-Uke, Gyaku-Zuki', v: [`1) ${SABAKI_L} – Gegenangriff Chudan-Gyaku-Zuki`, `2) ${SABAKI_R} – Gegenangriff Chudan-Gyaku-Zuki`] },
    {
      t: 'b) gegen Chudan-Oi-Zuki – aus Shizentai: 1) Soto-Uke, Gyaku-Zuki, 2) Soto-Uke, Yoko-Enpi-Uchi',
      v: [`1) ${SABAKI_L} – Gegenangriff Chudan-Gyaku-Zuki`, '2) Mit linkem Fuß, Tai-Sabaki mit Schrittbewegung nach rechts hinten, leicht aus der Angriffslinie heraus – Gegenangriff Chudan-Yoko-Enpi-Uchi in Kb'],
    },
    { t: 'c) gegen Chudan-Mae-Geri – aus Shizentai: 1) Nagashi-Uke, Gyaku-Zuki, 2) Gedan-Barai, Gyaku-Zuki', v: [`1) ${SABAKI_L} – Gegenangriff Chudan-Gyaku-Zuki`, `2) ${SABAKI_R} – Gegenangriff Chudan-Gyaku-Zuki`] },
    {
      t: 'd) gegen Chudan-Yoko-Geri-Kekomi – aus Shizentai: 1) Soto-Uke oder Nagashi-Uke (je nach Angriffshöhe), Chudan-Gyaku-Zuki, 2) Gedan-Barai, Gyaku-Zuki',
      v: [`1) ${SABAKI_L} – Gegenangriff Chudan-Gyaku-Zuki`, `2) ${SABAKI_R} – Gegenangriff Chudan-Gyaku-Zuki`],
    },
  ];

  // Jiyu-Ippon-Kumite (5. Kyu bis 1. Dan)
  const JIYU_ABWEHR = 'aus Chudan-Kamae: Uke frei, mit zu Maai passender Kime-Waza (Konter), nach der Kime-Waza (Tsuki, Uchi oder Keri) wieder Chudan-Kamae mit Zanshin';
  const JIYU_ABLAUF = [
    'Beide Seiten stehen sich in freier Kampfstellung gegenüber.',
    'Der Angreifer sucht den für seine Technik günstigsten Abstand und führt sofort die angesagte Technik aus. Er trägt seinen Angriff mit größtem Einsatz vor, ohne Gedanken an die nächste, ihn erwartende Aktion des Verteidigers.',
    'Der Abwehrende darf nicht versuchen, den Abstand zu vergrößern, um sich dem Angriff zu entziehen, sondern soll in möglichst kurzer Distanz den Angriff blocken bzw. ausweichen und dann eine kräftige Kontertechnik (Stoß-, Schlag-, Tritttechnik) ausführen.',
  ];
  const JIYU_ANGRIFF = ['Jodan-Kizami-Zuki', 'Jodan-Oi-Zuki', 'Chudan-Oi-Zuki', 'Chudan-Mae-Geri', 'Chudan-Yoko-Geri-Kekomi', 'Jodan- oder Chudan-Mawashi-Geri (mit Ansage Chudan oder Jodan)', 'Chudan-Ushiro-Geri'];
  const DREI_KONTER = 'Mindestens 3 verschiedene Kontertechniken.';

  const JIYU_KUMITE = { form: 'Jiyu-Kumite', text: ['Grundsätzlich Jiyu-Kumite, aber auch alternativ Jiyu-Ippon-Kumite je nach Alter.'] };

  // Wiederkehrende Kihon-Reihen
  const KEAGE = (wendung) => ['aus Chudan-Kamae, vorwärts im Übersetzen in Kb mit Yoko-Geri-Keage (in beide Richtungen)'].concat(wendung ? [wendung] : []);
  const KEKOMI = (wendung) => ['aus Chudan-Kamae, vorwärts im Übersetzen in Kb mit Yoko-Geri-Kekomi (in beide Richtungen)'].concat(wendung ? [wendung] : []);
  const KEAGE_KEKOMI = ['aus Chudan-Kamae, 2x vorwärts im Übersetzen in Kb mit Yoko-Geri-Keage', 'Drehung (180° nach vorne) und mit hinterem Bein in Kb Yoko-Geri-Kekomi'];
  const GB_ZK = 'Wendung mit Gedan-Barai in Zk';
  const GB_KB = 'Wendung mit Gedan-Barai in Kb';

  SK.grades = [
    {
      id: '9kyu', name: '9. Kyu', belt: 'Weißgurt', cls: 'belt-white', kata: [], stufe: 'I',
      kihon: {
        reps: REPS,
        items: [
          ['im Stand 10x Choku-Zuki, 5x links / 5x rechts im Wechsel'],
          ['vorwärts in Zk mit Oi-Zuki'],
          ['rückwärts in Zk mit Age-Uke'],
          ['vorwärts in Zk mit Soto-Uke'],
          ['rückwärts in Zk mit Gedan-Barai'],
          ['aus Gedan-Kakiwake vorwärts mit Mae-Geri', GB_ZK],
        ],
      },
      kumite: gohon('rechts zurück, links abwehren'),
      kataProg: { short: 'keine Kata', items: ['Entfällt zum 9. Kyu.'], note: 'Theorie: Der Prüfling muss die Kata Taikyoku-Shodan vom Ablauf beherrschen.' },
      theory: [
        'Begriffe: Musubi-Dachi, Seiza, Mokuso, Mokuso yame, Shomen ni rei, Sensei ni rei, Kiritsu',
        'Die Kata Taikyoku-Shodan vom Ablauf beherrschen',
        'Die Etikette des An- und Abgrüßens zu Beginn und am Ende des Trainings ausführen können',
      ],
    },
    {
      id: '8kyu', name: '8. Kyu', belt: 'Gelbgurt', cls: 'belt-yellow', kata: ['heian-shodan'], stufe: 'I',
      kihon: {
        reps: REPS,
        items: [
          ['vorwärts in Zk mit Oi-Zuki'],
          ['rückwärts in Zk mit Age-Uke'],
          ['vorwärts in Zk mit Soto-Uke'],
          ['rückwärts in Zk mit Uchi-Uke'],
          ['aus Shuto-Uke-Kamae, vorwärts in Kk mit Shuto-Uke', 'Wendung in Zk mit Gedan-Barai'],
          ['aus Gedan-Kakiwake, vorwärts in Zk mit Chudan-Mae-Geri', 'Wendung in Kb mit Gedan-Barai'],
          KEAGE(),
          KEKOMI(),
        ],
      },
      kumite: gohon('rechts zurück, links abwehren'),
      kataProg: { items: ['Heian Shodan'], focus: 'korrekte Zenkutsu-Dachi- und Kokutsu-Dachi-Stellung, Renoji-Dachi-Stellung, Tettsui-Uchi' },
      theory: ['Begriffe: Kihon-Ippon-Kumite, Gohon-Kumite, Jodan, Chudan, Gedan, Kata'],
    },
    {
      id: '7kyu', name: '7. Kyu', belt: 'Orangegurt', cls: 'belt-orange', kata: ['heian-nidan'], stufe: 'I',
      kihon: {
        reps: REPS,
        items: [
          ['aus Gedan-Kamae links, vorwärts in Zk mit Oi-Zuki'],
          ['rückwärts in Zk mit Age-Uke'],
          ['vorwärts in Zk mit Soto-Uke'],
          ['rückwärts in Zk mit Uchi-Uke'],
          ['vorwärts in Kk mit Shuto-Uke', GB_ZK],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mae-Geri', GB_KB],
          KEAGE(GB_KB),
          KEKOMI(),
        ],
      },
      kumite: Object.assign(gohon('links zurück, rechts abwehren'), {
        dazu: [{
          form: 'Kihon-Ippon-Kumite',
          angriff: ['a) aus Gedan-Kamae links: 1x Jodan-Oi-Zuki', 'b) aus Gedan-Kamae links: 1x Chudan-Oi-Zuki', 'c) aus Chudan-Kamae links: 1x Chudan-Mae-Geri'],
          abwehr: [
            { t: 'a) gegen Jodan-Oi-Zuki – aus Shizentai: Age-Uke, Gyaku-Zuki', v: ['Mit rechtem Fuß gerade mit Schrittbewegung nach hinten – Gegenangriff Chudan-Gyaku-Zuki'] },
            { t: 'b) gegen Chudan-Oi-Zuki – aus Shizentai: Soto-Uke, Gyaku-Zuki', v: ['Mit rechtem Fuß gerade mit Schrittbewegung nach hinten – Gegenangriff Chudan-Gyaku-Zuki'] },
            { t: 'c) gegen Chudan-Mae-Geri – aus Shizentai: Gedan-Barai, Gyaku-Zuki', v: [`${SABAKI_R} – Gegenangriff Chudan-Gyaku-Zuki`] },
          ],
        }],
      }),
      kataProg: { items: ['Heian Nidan'], focus: 'korrekte Kokutsu-Dachi-Stellung, Shuto-Uke; Yoko-Geri und Uraken-Uchi müssen synchron ausgeführt werden' },
      theory: ['Begriffe: Shizentai, Kiai, Hanmi, Chudan-Kamae, Gedan-Kamae, Shuto-Kamae, Hikite'],
    },
    {
      id: '6kyu', name: '6. Kyu', belt: 'Grüngurt', cls: 'belt-green', kata: ['heian-sandan'], stufe: 'II',
      kihon: {
        reps: REPS,
        items: [
          ['aus Gedan-Kamae links, vorwärts in Zk mit Oi-Zuki', GB_ZK],
          ['vorwärts in Zk mit Sanbon-Zuki'],
          ['rückwärts in Zk mit Age-Uke, Gyaku-Zuki'],
          ['vorwärts in Zk mit Soto-Uke, umsetzen in Kb mit Yoko-Enpi-Uchi'],
          ['rückwärts in Zk mit Uchi-Uke, Gyaku-Zuki', 'Wendung mit Shuto-Uke in Kk'],
          ['vorwärts in Kk mit Shuto-Uke, Kizami-Mae-Geri', GB_ZK],
          ['aus Chudan-Kamae, vorwärts in Zk mit Chudan-Mae-Geri', GB_ZK],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mawashi-Geri'],
          KEAGE(GB_KB),
          KEKOMI(),
        ],
      },
      kumite: { form: 'Kihon-Ippon-Kumite', angriff: KIK_ANGRIFF, abwehr: KIK_ABWEHR },
      kataProg: { items: ['Heian Sandan'] },
      theory: ['Begriffe: Dojo, Te, Do, Kogeki, Uke'],
    },
    {
      id: '5kyu', name: '5. Kyu', belt: 'Violettgurt', cls: 'belt-violet', kata: ['heian-yondan'], stufe: 'II',
      kihon: {
        reps: REPS,
        items: [
          ['vorwärts in Zk mit Oi-Zuki', GB_ZK],
          ['vorwärts in Zk mit Sanbon-Zuki (Jodan, Chudan, Chudan)'],
          ['rückwärts in Zk mit Age-Uke, Gyaku-Zuki'],
          ['vorwärts in Zk mit Soto-Uke, umsetzen in Kb mit Yoko-Enpi-Uchi, Tate-Uraken-Uchi'],
          ['rückwärts in Zk mit Uchi-Uke, Jodan-Kizami-Zuki, Gyaku-Zuki'],
          ['vorwärts in Kk mit Shuto-Uke, Kizami-Mae-Geri, Nukite in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mae-Geri', 'Wendung mit Gedan-Barai'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mawashi-Geri', GB_KB],
          KEAGE(GB_KB),
          KEKOMI(),
        ],
      },
      kumite: {
        form: 'Jiyu-Ippon-Kumite',
        angriffVon: 'jeweils 1x linkes Bein vor aus Chudan-Kamae',
        angriff: JIYU_ANGRIFF.slice(0, 6),
        abwehr: [JIYU_ABWEHR],
        ablauf: JIYU_ABLAUF,
        hinweis: 'Im Ermessen des Prüfers kann zur Beurteilung zusätzlich Kihon-Ippon-Kumite (wie zum 6. Kyu) geprüft werden.',
      },
      kataProg: { items: ['Heian Yondan'] },
      theory: ['Begriffe: Kiai, Sanbon-Zuki, Soto-Uke, Uchi-Uke'],
    },
    {
      id: '4kyu', name: '4. Kyu', belt: 'Violettgurt', cls: 'belt-violet', kata: ['heian-godan'], stufe: 'II',
      kihon: {
        reps: REPS,
        items: [
          ['vorwärts in Zk mit Oi-Zuki', GB_ZK],
          ['vorwärts in Zk mit Sanbon-Zuki (Jodan, Chudan, Chudan)'],
          ['rückwärts in Zk mit Age-Uke, Gyaku-Zuki'],
          ['vorwärts in Zk mit Uchi-Uke, Jodan-Kizami-Zuki, Chudan-Gyaku-Zuki'],
          ['rückwärts in Zk mit Soto-Uke, umsetzen in Kb mit Yoko-Enpi-Uchi, Tate-Uraken-Uchi'],
          ['vorwärts in Kk mit Shuto-Uke, Kizami-Mae-Geri, Nukite in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Chudan-Mae-Geri', GB_ZK],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mawashi-Geri', GB_ZK],
          ['aus Chudan-Kamae, Chudan-Ushiro-Geri', GB_KB],
          KEAGE(GB_KB),
          KEKOMI(GB_ZK),
        ],
      },
      kumite: {
        form: 'Jiyu-Ippon-Kumite',
        angriffVon: 'jeweils 1x linkes Bein vor aus Chudan-Kamae',
        angriff: JIYU_ANGRIFF,
        abwehr: [JIYU_ABWEHR],
        ablauf: JIYU_ABLAUF,
        hinweis: 'Im Ermessen des Prüfers kann zur Beurteilung zusätzlich Kihon-Ippon-Kumite geprüft werden.',
      },
      kataProg: { items: ['Heian Godan'] },
      theory: ['Begriffe: Kime, Kime-Waza'],
    },
    {
      id: '3kyu', name: '3. Kyu', belt: 'Braungurt', cls: 'belt-brown', kata: ['tekki-shodan'].concat(HEIAN), stufe: 'III',
      kihon: {
        reps: REPS,
        items: [
          ['vorwärts in Zk mit Oi-Zuki', GB_ZK],
          ['vorwärts in Zk mit Sanbon-Zuki (Jodan, Chudan, Chudan)'],
          ['rückwärts in Zk mit Age-Uke, Gyaku-Zuki'],
          ['vorwärts in Zk mit Soto-Uke, umsetzen in Kb mit Yoko-Enpi-Uchi, Tate-Uraken-Uchi'],
          ['rückwärts in Zk mit Uchi-Uke, Kizami-Mae-Geri, Gyaku-Zuki'],
          ['vorwärts in Kk mit Shuto-Uke, Kizami-Mae-Geri, Nukite in Zk', GB_ZK],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mawashi-Geri', GB_ZK],
          ['aus Chudan-Kamae, 2x vorwärts in Zk mit Ren-Geri (Chudan-Mae-Geri, Zwischenschritt, Mawashi-Geri)', GB_ZK],
          ['aus Chudan-Kamae, Chudan-Ushiro-Geri', GB_KB],
          KEAGE_KEKOMI,
        ],
      },
      kumite: { form: 'Jiyu-Ippon-Kumite', angriffVon: 'jeweils 1x linkes oder rechtes Bein vor aus Chudan-Kamae', angriff: JIYU_ANGRIFF, abwehr: [JIYU_ABWEHR], ablauf: JIYU_ABLAUF },
      kataProg: { short: 'Tekki Shodan + 2 Heian', items: ['Tekki Shodan', ZWEI_HEIAN] },
      theory: ['Begriffe: Ren-Geri, Shiai, Suri-Ashi'],
    },
    {
      id: '2kyu', name: '2. Kyu', belt: 'Braungurt', cls: 'belt-brown', kata: SENTEI_BOOK.concat(HEIAN), stufe: 'III',
      kihon: {
        reps: REPS,
        items: [
          ['aus Gedan-Kamae links, vorwärts in Zk mit Oi-Zuki', GB_ZK],
          ['vorwärts in Zk mit Sanbon-Zuki (Jodan, Chudan, Chudan)'],
          ['rückwärts in Zk mit Age-Uke, Mae-Geri (hinteres Bein)', 'hinten absetzen, Gyaku-Zuki'],
          ['vorwärts in Zk mit Soto-Uke, in Kb mit Yoko-Enpi-Uchi, Tate-Uraken-Uchi, Gyaku-Zuki'],
          ['rückwärts in Zk mit Uchi-Uke, Kizami-Mae-Geri, Kizami-Zuki, Gyaku-Zuki'],
          ['vorwärts in Kk mit Shuto-Uke, Kizami-Mae-Geri, in Zk Nukite', GB_ZK],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mawashi-Geri', GB_ZK],
          ['aus Chudan-Kamae, 2x vorwärts in Zk mit Ren-Geri (Chudan-Mae-Geri, Zwischenschritt, Mawashi-Geri)', GB_ZK],
          ['aus Chudan-Kamae, vorwärts in Zk mit Ushiro-Geri', GB_KB],
          KEAGE_KEKOMI,
          ['Sonoba-Geri (Standübung 3x links und 3x rechts) aus Zk und Chudan-Kamae:', 'Mae-Geri nach vorne, mit gleichem Bein Yoko-Geri-Keage zur Seite', 'nach hinten absetzen in Chudan-Kamae'],
        ],
      },
      kumite: { form: 'Jiyu-Ippon-Kumite', angriffVon: 'jeweils 1x linkes oder rechtes Bein vor aus Chudan-Kamae', angriff: JIYU_ANGRIFF, abwehr: [JIYU_ABWEHR, DREI_KONTER], ablauf: JIYU_ABLAUF },
      kataProg: { short: 'Sentei-Kata + 2 Heian', items: [`Eine vom Prüfling ausgewählte Sentei-Kata: ${SENTEI}`, ZWEI_HEIAN] },
      theory: ['Begriffe: Maai, Deai, Jiyu-Ippon-Kumite, Kizami-Geri'],
    },
    {
      id: '1kyu', name: '1. Kyu', belt: 'Braungurt', cls: 'belt-brown', kata: SENTEI_BOOK.concat(HEIAN), stufe: 'III',
      kihon: {
        reps: REPS,
        items: [
          ['aus Chudan-Kamae links, vorwärts Yori-Ashi Kizami-Zuki', 'ein Schritt vorwärts in Zk mit Sanbon-Zuki (Jodan, Chudan, Chudan)', GB_ZK],
          ['rückwärts in Zk mit Age-Uke, Mae-Geri (hinteres Bein)', 'hinten absetzen mit Gyaku-Zuki in Zk'],
          ['vorwärts in Zk mit Soto-Uke, in Kb mit Yoko-Enpi-Uchi, Tate-Uraken-Uchi, in Zk Gyaku-Zuki'],
          ['rückwärts in Zk mit Uchi-Uke, Kizami-Mae-Geri, Kizami-Zuki, Gyaku-Zuki'],
          ['vorwärts in Kk mit Shuto-Uke, Kizami-Mae-Geri, in Zk Nukite', GB_ZK],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mawashi-Geri', GB_ZK],
          ['aus Chudan-Kamae, vorwärts in Zk mit Ren-Geri (Chudan-Mae-Geri, mit dem gleichen Bein Mawashi-Geri, vorne absetzen)', GB_ZK],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mae-Geri', 'vorne absetzen mit Kizami-Zuki, Gyaku-Zuki, sofort wieder Chudan-Kamae', GB_ZK],
          ['aus Chudan-Kamae, vorwärts in Zk Ushiro-Geri', GB_KB],
          KEAGE_KEKOMI,
          ['Sonoba-Geri (Standübung 3x links und 3x rechts) aus Zk und Chudan-Kamae:', 'Mae-Geri nach vorne, mit gleichem Bein Ushiro-Geri nach hinten', 'hinten absetzen in Chudan-Kamae'],
        ],
      },
      kumite: { form: 'Jiyu-Ippon-Kumite', angriffVon: 'aus Chudan-Kamae, mindestens 2x die Ausgangslage (links/rechts) wechseln', angriff: JIYU_ANGRIFF, abwehr: [JIYU_ABWEHR, DREI_KONTER], ablauf: JIYU_ABLAUF },
      kataProg: { short: 'Sentei-Kata + 2 Heian', items: [`Eine vom Prüfling ausgewählte Sentei-Kata: ${SENTEI}`, ZWEI_HEIAN], note: 'Auch die gleiche Kata wie zum 2. Kyu ist möglich.' },
      theory: ['Begriffe: Zanshin, Sonoba-Geri, Okuri-Jiyu-Ippon-Kumite, Sentei-Kata, Shitei-Kata, Tokui-Kata'],
    },
    {
      id: '1dan', name: '1. Dan (Shodan)', belt: 'Schwarzgurt', cls: 'belt-black', kata: ALL_BOOK, stufe: 'III',
      kihon: {
        reps: REPS,
        items: [
          ['aus Gedan-Kamae links, vorwärts in Zk mit Sanbon-Zuki (Jodan, Chudan, Chudan)'],
          ['rückwärts in Zk mit Age-Uke, Mae-Geri', 'hinten absetzen mit Gyaku-Zuki in Zk'],
          ['vorwärts in Zk mit Soto-Uke, in Kb mit Yoko-Enpi-Uchi, Tate-Uraken-Uchi, Gyaku-Zuki in Zk'],
          ['rückwärts in Zk mit Uchi-Uke, Kizami-Mae-Geri, Kizami-Zuki, Gyaku-Zuki in Zk'],
          ['vorwärts in Kk mit Shuto-Uke, Kizami-Mae-Geri, Nukite in Zk', GB_ZK],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mae-Geri, Kizami-Zuki, Gyaku-Zuki in Zk', GB_ZK],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mawashi-Geri', GB_ZK],
          ['aus Chudan-Kamae, vorwärts in Zk mit Ren-Geri (Mawashi-Geri, mit gleichem Bein Yoko-Geri-Kekomi)', GB_ZK],
          ['aus Chudan-Kamae, vorwärts in Zk mit Ushiro-Geri', GB_KB],
          ['aus Chudan-Kamae, vorwärts in Kb mit Yoko-Geri-Keage', 'Drehung und mit hinterem Bein in Kb Yoko-Geri-Kekomi'],
          ['Sonoba-Geri (Standübung links und rechts) aus Zk und Chudan-Kamae:', 'Mae-Geri nach vorne, mit gleichem Bein Yoko-Geri-Keage zur Seite, mit gleichem Bein Ushiro-Geri', 'nach hinten absetzen in Chudan-Kamae'],
        ],
      },
      kumite: {
        form: 'Jiyu-Ippon-Kumite',
        angriffVon: 'aus Chudan-Kamae (Wechsel der Ausgangslage ist möglich)',
        angriff: ['Jodan-Kizami-Zuki', 'Jodan-Oi-Zuki', 'Chudan-Oi-Zuki', 'Chudan-Mae-Geri', 'Chudan-Yoko-Geri-Kekomi', 'Jodan-Mawashi-Geri', 'Chudan-Ushiro-Geri'],
        abwehr: ['aus Chudan-Kamae: Uke frei, mit zu Maai passender Kime-Waza-Technik, nach dem Kime-Waza (Zuki, Uchi oder Keri) wieder Kamae mit Zanshin'],
      },
      kataProg: {
        short: 'Sentei-Kata + Heian/Tekki',
        items: [`1. Eine vom Prüfling ausgewählte Sentei-Kata: ${SENTEI} – auch die gleiche Kata wie zum 2. oder 1. Kyu ist möglich`, '2. Eine vom Prüfer angegebene Kata: Heian Shodan bis Heian Godan oder Tekki Shodan'],
      },
      theory: ['Theoretische Kenntnisse aus den Kyu-Graden', 'Begriffe: Kosa-Dachi, Sun-Dome, Tai-Sabaki, Ashi-Barai, Nagashi-Uke', 'Kata-Bunkai aus den Kata Heian Shodan bis Heian Godan, Tekki Shodan'],
    },
    {
      id: '2dan', name: '2. Dan (Nidan)', belt: 'Schwarzgurt', cls: 'belt-black', kata: ALL_BOOK,
      kihon: {
        reps: REPS,
        items: [
          ['aus Chudan-Kamae links, im Stand Jodan-Kizami-Zuki', 'vorwärts in Zk mit Sanbon-Zuki (Jodan, Chudan, Chudan)'],
          ['aus Chudan-Kamae, rückwärts in Zk mit Uchi-Uke, Mae-Geri', 'hinten absetzen mit Kizami-Zuki, Gyaku-Zuki'],
          ['aus Chudan-Kamae, einen Schritt zurück in Zk mit Age-Uke', 'vorwärts in Kb mit Mawashi-Geri, Tate-Uraken', 'vorwärts in Zk mit Oi-Zuki', GB_ZK],
          ['aus Chudan-Kamae, vorwärts in Zk mit Jodan-Oi-Zuki, Gyaku-Zuki', 'rückwärts in Kk mit Shuto-Uke', 'vorwärts in Zk mit Ushiro-Geri, Gyaku-Zuki', GB_KB],
          ['aus Kb und Chudan-Kamae, vorwärts in Kb mit Yoko-Geri-Keage', 'Drehung und mit hinterem Bein Yoko-Geri-Kekomi in Kb'],
          ['Sonoba-Geri (Standübung links und rechts) aus Zk und Chudan-Kamae:', 'Mae-Geri nach vorne, mit gleichem Bein Yoko-Geri-Keage zur Seite, mit gleichem Bein Ushiro-Geri nach hinten, mit gleichem Bein Mawashi-Geri nach vorne', 'nach hinten absetzen in Chudan-Kamae'],
        ],
      },
      kumite: JIYU_KUMITE,
      kataProg: {
        short: '2 Kata',
        items: [`1. Der Prüfer gibt eine Kata an aus: Heian Shodan bis Heian Godan, Tekki Shodan, Tekki Nidan, Sentei-Kata (${SENTEI})`, '2. Kata nach Wahl des Prüflings aus: Bassai-Sho, Kanku-Sho, Nijushiho, Jitte, Chinte, Meikyo, Gankaku, Sochin'],
      },
      theory: [
        'Begriff: Happo-Kumite',
        'Theoretische Kenntnisse aus den Kyu- und vorherigen Dan-Prüfungsprogrammen',
        'Lehrprobe aus den Kyu-Prüfungsprogrammen',
        `Kata-Bunkai aus den Sentei-Kata: ${SENTEI}`,
      ],
    },
    {
      id: '3dan', name: '3. Dan (Sandan)', belt: 'Schwarzgurt', cls: 'belt-black', kata: ALL_BOOK,
      kihon: {
        reps: REPS,
        items: [['Der Prüfer gibt 5 verschiedene Reihen von Techniken aus der Shodan- und Nidan-Prüfungsordnung an.']],
        ref: ['1dan', '2dan'],
      },
      kumite: JIYU_KUMITE,
      kataProg: {
        short: '4 Kata',
        items: [
          '1. Tokui-Kata: frei wählbar aus den Kata unseres Stils – nicht gezeigt werden dürfen Unsu, Gojushiho-Sho und Gojushiho-Dai sowie Kata, die bereits früher bei einer Dan-Prüfung gezeigt wurden',
          `2. Der Prüfer gibt eine der 5 Sentei-Kata an: ${SENTEI}`,
          '3. Der Prüfer gibt eine Kata an aus: Heian Shodan bis Heian Godan und Tekki Shodan bis Tekki Sandan',
          '4. Der Prüfer gibt eine Kata an aus: Bassai-Sho, Kanku-Sho, Nijushiho, Jitte, Chinte, Meikyo, Gankaku, Sochin',
        ],
      },
      theory: ['Theoretische Fragen aus den Kyu- und Dan-Graden', 'Lehrprobe aus dem Shodan- und Nidan-Prüfungsprogramm', `Kata-Bunkai aus den Sentei-Kata: ${SENTEI}`],
    },
  ];

  // Höhere Dan-Grade: nur Programmseite, keine Theorie-Fragen
  SK.higherDan = {
    id: 'hoehere-dan', name: 'Höhere Dan-Grade', belt: 'Schwarzgurt', cls: 'belt-black',
    kihon: { items: [['Der Prüfer gibt verschiedene Techniken und Kombinationen vor.']] },
    kumite: {
      form: 'Sämtliche Kumite-Formen',
      text: ['Es wird erwartet, dass der Prüfling sämtliche Kumite-Formen unserer Stilrichtung korrekt und sauber vorführen kann: Gohon-Kumite, Kihon-Ippon-Kumite, Kaeshi-Ippon-Kumite, Jiyu-Ippon-Kumite, Okuri-Jiyu-Ippon-Kumite und Jiyu-Kumite.'],
    },
    kataProg: {
      short: 'alle Kata, Tokui-Kata frei',
      items: [
        'Vorausgesetzt wird, dass der Prüfling sämtliche Kata unserer Stilrichtung beherrscht, so dass sie bei der Prüfung abrufbar sind (siehe Programm 1. bis 3. Dan).',
        'Tokui-Kata: frei wählbar aus den Kata unserer Stilrichtung (jetzt einschließlich Unsu, Gojushiho-Sho und Gojushiho-Dai), aber keine Kata, die bei einer vorangegangenen Prüfung bereits gezeigt wurde.',
      ],
      note: 'Die Wahl der Kata sollte dem Können und den körperlichen Voraussetzungen des Prüflings einerseits und dem angestrebten hohen Dan-Grad andererseits entsprechen.',
    },
  };

  SK.examStufe = (g) => (g.stufe ? STUFE[g.stufe] : null);
  SK.examJiyuIppon = JIYU_IPPON;
  SK.gradeIndex = (id) => SK.grades.findIndex((g) => g.id === id);
})();
