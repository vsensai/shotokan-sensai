/* DJKB-Prüfungsprogramm 9. Kyu bis 3. Dan (und höhere Dan-Grade) – Kihon, Kata, Kumite, Theorie.
   Wortlaut eng nach: DJKB-Prüfungsordnung JKA-Karate (Stand Juli 2013) und den
   DJKB-Übersichten Prüfungsprogramm Kihon/Kata/Kumite (Ziele im Kumite, Wartezeiten, Mindestalter).
   Kihon-Einträge: erste Zeile = Übung, weitere Zeilen = Fortsetzung (z. B. Wendung). */
(function () {
  'use strict';
  SK.sources = {
    po: 'DJKB-Prüfungsordnung, Stand Juli 2013',
    ueb: 'DJKB-Übersicht Prüfungsprogramm (Kihon/Kata/Kumite)',
    pdf: 'Karate-Do Kata Vol. 1 (JKA)',
    pdf2: 'Karate-Do Kata Vol. 2 (JKA) – daraus nur Hangetsu',
    allg: 'Allgemeines Shotokan-/JKA-Grundwissen (u. a. Wikipedia: Shōtōkan, Gichin Funakoshi, JKA)',
    kompakt: 'Heft „Karate kompakt – Grundlagen im Überblick“ (F. Tartaglia, aus „Die Karate-Essenz“) – Inhalte in eigenen Worten',
  };

  const SENTEI_BOOK = ['bassai-dai', 'kanku-dai', 'jion', 'enpi', 'hangetsu']; // Hangetsu aus Vol. 2
  const ALL_BOOK = ['heian-shodan', 'heian-nidan', 'heian-sandan', 'heian-yondan', 'heian-godan', 'tekki-shodan'].concat(SENTEI_BOOK);
  const SENTEI = 'Bassai-Dai, Kanku-Dai, Jion, Enpi, Hangetsu';

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
        'In dieser Prüfungsgruppe werden beim Kihon nur Vorwärtsbewegungen eingeübt, damit sich der Anfänger besser auf seine Stellung konzentrieren kann. Wenn sich die Stellungen gefestigt haben, sind die Rückwärtsbewegungen mit der jeweils richtigen Stellung leichter zu erlernen.',
        'Stellungen, Körperbewegungen und Techniken müssen harmonisch und synchron vollzogen werden.',
      ],
      kumite: [
        'Beim Kihon-Ippon-Kumite und Gohon-Kumite muss die jeweilige Angriffs- bzw. Abwehrtechnik zielgenau und zielgerecht ausgeführt werden.',
        'Unbedingt auf die korrekte Distanz achten – beim Angriff, bei der Abwehr und bei der Kontertechnik nach der Abwehr.',
        'Der Abwehrende muss den Angriff dicht vor seinem Körper kraftvoll blocken.',
      ],
    },
    II: {
      name: 'Stufe II (6., 5., 4. Kyu)',
      kumite: [
        'Besonderer Wert auf die Hüftdrehung in der Abwehr und einen kraftvollen Konter nach der Abwehr. Abwehr- und Kontertechnik werden aus der gleichen Stellung ausgeführt – Konzentration auf richtige Stellung, Haltung und Hüftdrehung bei kraftvoller Ausführung.',
        'Der Angreifer muss jeden Angriff mit solcher Kraft durchführen, als ob die Angriffschance nur einmal gegeben wäre.',
        'Der Angreifer muss den richtigen Abstand zum Partner einnehmen.',
        'Der Verteidiger muss der Angriffstechnik blitzschnell ausweichen und danach sofort die Kontertechnik ausführen – dabei die Reichweite der Kontertechnik beachten.',
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
    'Jiyu-Ippon-Kumite schult korrekte Distanz, gutes Timing, blitzschnelle Entscheidungen und die Überwindung eigener Unsicherheiten beim Angriff.',
    'Beide Seiten stehen in freier Stellung (Chudan-Kamae) und suchen den für sie jeweils günstigsten Abstand.',
    'Der Angreifer führt seine angesagte Technik mit größtem Einsatz aus, ohne Gedanken an die nächste, ihn erwartende Aktion des Verteidigers.',
    'Der Abwehrende darf nicht den weitesten Abstand wählen, sondern soll im möglichst kurzen Abstand blocken bzw. ausweichen und dann kraftvoll kontern (Zuki-, Uchi- oder Keri-Technik).',
    'Abstand nehmen: Der Gegner fühlt sich unterschiedlich bedrängt – je nachdem, ob die vordere Hand geballt oder geöffnet ist, ob sie Jodan, Chudan oder Gedan gehalten wird und ob der Schwerpunkt im Kamae vorne oder zurück liegt. Alle diese Situationen im Training durchspielen.',
  ];

  // Kihon-Ippon-Kumite 6. und 5. Kyu: Abwehr mit festgelegtem Sabaki
  const SABAKI_L = 'Mit rechtem Fuß, Sabaki mit Schrittbewegung nach links hinten, leicht aus der Angriffslinie heraus';
  const SABAKI_R = 'Mit rechtem Fuß, Sabaki mit Gleitbewegung nach rechts hinten, leicht aus der Angriffslinie heraus';
  const KIK_ANGRIFF = [
    'a) aus Gedan-Kamae links: 2x Jodan-Oi-Zuki',
    'b) aus Gedan-Kamae links: 2x Chudan-Oi-Zuki',
    'c) aus Chudan-Kamae links: 2x Chudan-Mae-Geri',
    'd) aus Chudan-Kamae links: 2x Chudan-Yoko-Geri-Kekomi',
  ];
  const KIK_SABAKI = [
    { t: 'a) gegen Jodan-Oi-Zuki – aus Shizentai: Age-Uke / Gyaku-Zuki', v: [`1) ${SABAKI_L} – Gegenangriff Chudan-Gyaku-Zuki`, `2) ${SABAKI_R} – Gegenangriff Chudan-Gyaku-Zuki`] },
    {
      t: 'b) gegen Chudan-Oi-Zuki – aus Shizentai: 1) Soto-Uke / Gyaku-Zuki, 2) Soto-Uke / Yoko-Empi-Uchi',
      v: [`1) ${SABAKI_L} – Gegenangriff Chudan-Gyaku-Zuki`, '2) Mit linkem Fuß, Sabaki mit Schrittbewegung nach rechts hinten, leicht aus der Angriffslinie heraus – Gegenangriff Chudan-Yoko-Empi-Uchi in Kb'],
    },
    { t: 'c) gegen Chudan-Mae-Geri – aus Shizentai: 1) Nagashi-Uke / Gyaku-Zuki, 2) Gedan-Barai / Gyaku-Zuki', v: [`1) ${SABAKI_L} – Gegenangriff Chudan-Gyaku-Zuki`, `2) ${SABAKI_R} – Gegenangriff Chudan-Gyaku-Zuki`] },
    {
      t: 'd) gegen Chudan-Yoko-Geri-Kekomi – aus Shizentai: 1) Soto-Uke oder Nagashi-Uke (je nach Angriffshöhe) / Chudan-Gyaku-Zuki, 2) Gedan-Barai / Gyaku-Zuki',
      v: [`1) ${SABAKI_L} – Gegenangriff Chudan-Gyaku-Zuki`, `2) ${SABAKI_R} – Gegenangriff Chudan-Gyaku-Zuki`],
    },
  ];
  const JIYU_KUMITE = {
    form: 'Jiyu-Kumite',
    text: ['Grundsätzlich Jiyu-Kumite, aber auch alternativ Jiyu-Ippon-Kumite je nach Alter.'],
    ziel: 'Freie Anwendung der Karate-Techniken und Taktiken im Kampf, in Angriff und Abwehr, ohne Verletzungsgefahren für sich selbst und den Partner zu verursachen.',
  };

  SK.grades = [
    {
      id: '9kyu', name: '9. Kyu', belt: 'Weißgurt', cls: 'belt-white', kata: [], stufe: 'I',
      kihon: {
        reps: 'Jede Technik je 2x oder 4x, nach Wahl des Prüfers.',
        items: [
          ['im Stand (Soto-Hachiji-Dachi) Choku-Zuki, links und rechts'],
          ['aus Choku-Zuki-Kamae Schritt vorwärts in Zk mit Oi-Zuki', 'anschließend Schritt zurück in Soto-Hachiji-Dachi und Choku-Zuki-Kamae', 'jeweils links und rechts'],
          ['aus Jodan-Kamae Schritt vorwärts in Zk mit Age-Uke', 'anschließend Schritt zurück in Soto-Hachiji-Dachi und Age-Uke-Kamae', 'jeweils links und rechts'],
          ['aus Choku-Zuki-Kamae Schritt vorwärts in Zk mit Soto-Uke', 'anschließend Schritt zurück in Soto-Hachiji-Dachi und Choku-Zuki-Kamae', 'jeweils links und rechts'],
          ['aus Gedan-Barai-Kamae einen Schritt vorwärts in Zk mit Gedan-Barai', 'anschließend Schritt zurück in Soto-Hachiji-Dachi und Gedan-Barai-Kamae', 'jeweils links und rechts'],
        ],
      },
      kumite: {
        form: 'Kihon-Ippon-Kumite',
        angriff: ['a) aus Gedan-Kamae links: 2x Jodan-Oi-Zuki', 'b) aus Gedan-Kamae links: 2x Chudan-Oi-Zuki'],
        abwehr: ['a) aus Shizentai: Age-Uke / Chudan-Gyaku-Zuki – 1x rechts und 1x links', 'b) aus Shizentai: Soto-Uke / Chudan-Gyaku-Zuki – 1x rechts und 1x links'],
        ablauf: [
          'Der Angreifer beginnt aus Zk, erster Angriff rechts.',
          'Der Verteidiger steht in Hachiji-Dachi und beginnt mit der Blocktechnik rechts zurück und gleichzeitiger Abwehr links.',
          'Gegenangriff mit Kiai.',
          'Danach zieht der Verteidiger den hinteren Fuß nach vorne in die Ausgangsstellung.',
          'Der Angreifer zieht den vorderen Fuß nach hinten in die Ausgangsstellung.',
        ],
      },
      kataProg: { short: 'keine Kata', items: ['Entfällt zum 9. Kyu.'], note: 'Theorie: Der Prüfling muss die Kata Taikyoku-Shodan vom Ablauf beherrschen.' },
      theory: [
        'Begriffe: Musubi-Dachi, Seiza, Mokuso, Mokuso yame, Shomen ni rei, Sensei ni rei, Kiritsu',
        'Die Kata Taikyoku-Shodan vom Ablauf beherrschen',
        'Die Etikette des An- und Abgrüßens zu Beginn und am Ende des Trainings ausführen können',
      ],
    },
    {
      id: '8kyu', name: '8. Kyu', belt: 'Gelbgurt', cls: 'belt-yellow', kata: ['heian-shodan'], stufe: 'I',
      wait: '3 Monate (Kinder bis 10 Jahre: 6 Monate, Kinder 11–14 Jahre: 5 Monate)',
      kihon: {
        reps: 'Jede Technik je 3x.',
        items: [
          ['aus Gedan-Kamae links, vorwärts in Zk mit Oi-Zuki', 'Wendung in Zk mit Gedan-Barai'],
          ['vorwärts in Zk mit Age-Uke', 'Wendung in Zk mit Gedan-Barai'],
          ['vorwärts in Zk mit Soto-Uke', 'Wendung in Zk mit Gedan-Barai'],
          ['vorwärts in Zk mit Uchi-Uke', 'Wendung in Kk mit Shuto-Uke'],
          ['aus Shuto-Uke-Kamae, vorwärts in Kk mit Shuto-Uke', 'Wendung in Zk mit beidarmigem Gedan-Barai'],
          ['aus Ryo-Yoko-Gedan-Barai-Kamae, vorwärts in Zk mit Chudan-Mae-Geri', 'Wendung in Kb mit Gedan-Barai'],
          ['aus Chudan-Kamae, vorwärts in Kb mit Yoko-Geri-Kekomi (in beide Richtungen)'],
        ],
      },
      kumite: {
        form: 'Gohon-Kumite',
        angriff: ['a) aus Gedan-Kamae links: 5x fortlaufend Jodan-Oi-Zuki', 'b) aus Gedan-Kamae links: 5x fortlaufend Chudan-Oi-Zuki'],
        abwehr: ['a) aus Shizentai: 5x fortlaufend Age-Uke, danach Gegenangriff Chudan-Gyaku-Zuki', 'b) aus Shizentai: 5x fortlaufend Soto-Uke, danach Gegenangriff Chudan-Gyaku-Zuki'],
        ablauf: [
          'Der Angreifer beginnt aus Zk, erster Angriff rechts, und greift 5x fortlaufend an.',
          'Der Verteidiger steht in Hachiji-Dachi und beginnt rechts zurück mit der Blocktechnik links und 5x fortlaufender Abwehr.',
          'Anschließend Gegenangriff mit Kiai.',
          'Danach zieht der Verteidiger den hinteren Fuß nach vorne in die Ausgangsstellung.',
          'Der Angreifer zieht den vorderen Fuß nach hinten in die Ausgangsstellung.',
        ],
        ziel: 'Erste Erfahrungen im Erwerb stabiler, zielgenauer Angriffs- und Blocktechniken. Anpassen an Vorgaben im Rhythmus und im Timing. Erwerb erster Distanzerfahrungen für Angriff und Konter.',
      },
      kataProg: { items: ['Heian Shodan'], focus: 'korrekte Zenkutsu- und Kokutsu-Dachi-Stellung, Renoji-Dachi-Stellung, Tettsui-Uchi' },
      theory: ['Begriffe: Kihon-Ippon-Kumite, Gohon-Kumite, Jodan, Chudan, Gedan, Kata'],
    },
    {
      id: '7kyu', name: '7. Kyu', belt: 'Orangegurt', cls: 'belt-orange', kata: ['heian-nidan'], stufe: 'I',
      wait: '3 Monate',
      kihon: {
        reps: 'Jede Technik je 3x.',
        items: [
          ['aus Gedan-Kamae links, vorwärts in Zk mit Oi-Zuki', 'Wendung mit Gedan-Barai in Zk'],
          ['vorwärts in Zk mit Age-Uke', 'Wendung mit Gedan-Barai in Zk'],
          ['vorwärts in Zk mit Soto-Uke', 'Wendung mit Gedan-Barai in Zk'],
          ['vorwärts in Zk mit Uchi-Uke', 'Wendung mit Shuto-Uke in Kk'],
          ['aus Shuto-Uke-Kamae, vorwärts in Kk mit Shuto-Uke', 'Wendung mit beidarmigem Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mae-Geri', 'Wendung mit Gedan-Barai in Kb'],
          ['aus Chudan-Kamae, vorwärts in Kb mit Yoko-Geri-Keage (in beide Richtungen)', 'Wendung mit Gedan-Barai in Kb'],
          ['aus Chudan-Kamae, vorwärts in Kb mit Yoko-Geri-Kekomi (in beide Richtungen)'],
        ],
      },
      kumite: {
        form: 'Gohon-Kumite',
        angriff: ['a) aus Gedan-Kamae links: 5x fortlaufend Jodan-Oi-Zuki', 'b) aus Gedan-Kamae links: 5x fortlaufend Chudan-Oi-Zuki'],
        abwehr: ['a) aus Shizentai: rechts zurück und 5x Age-Uke, Gegenangriff Chudan-Gyaku-Zuki', 'b) aus Shizentai: links zurück und 5x Soto-Uke, Gegenangriff Chudan-Gyaku-Zuki'],
        ablauf: ['Ausführung des Gohon-Kumite sonst wie zum 8. Kyu: Gegenangriff mit Kiai, danach zieht der Verteidiger den hinteren Fuß nach vorne und der Angreifer den vorderen Fuß nach hinten in die Ausgangsstellung.'],
        ziel: 'Erfahren unterschiedlicher Distanzentwicklung im Zusammenhang mit der Schrittführung.',
      },
      kataProg: { items: ['Heian Nidan'], focus: 'korrekte Kokutsu-Dachi-Stellung, Shuto-Uke; Yoko-Geri und Uraken-Uchi müssen synchron ausgeführt werden' },
      theory: ['Begriffe: Shizentai, Kiai, Hanmi, Chudan-Kamae, Gedan-Kamae, Shuto-Kamae, Hiki-Te'],
    },
    {
      id: '6kyu', name: '6. Kyu', belt: 'Grüngurt', cls: 'belt-green', kata: ['heian-sandan'], stufe: 'II',
      wait: '3 Monate',
      kihon: {
        reps: 'Jede Technik je 3x.',
        items: [
          ['aus Gedan-Kamae links, vorwärts in Zk mit Oi-Zuki', 'Wendung mit Gedan-Barai in Zk'],
          ['vorwärts in Zk mit Age-Uke / Gyaku-Zuki', 'Wendung mit Gedan-Barai in Zk'],
          ['vorwärts in Zk mit Soto-Uke / umsetzen in Kb mit Yoko-Empi-Uchi', 'Wendung mit Gedan-Barai in Zk'],
          ['vorwärts in Zk mit Uchi-Uke / Gyaku-Zuki', 'Wendung mit Shuto-Uke in Kk'],
          ['aus Shuto-Uke-Kamae, vorwärts in Kk mit Shuto-Uke / Kizami-Mae-Geri', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Jodan-Mae-Geri', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Chudan-Mae-Geri', 'Wendung mit Gedan-Barai in Kb'],
          ['aus Chudan-Kamae, vorwärts in Kb mit Yoko-Geri-Keage (in beide Richtungen)', 'Wendung mit Gedan-Barai in Kb'],
          ['aus Chudan-Kamae, vorwärts in Kb mit Yoko-Geri-Kekomi (in beide Richtungen)'],
        ],
      },
      kumite: {
        form: 'Kihon-Ippon-Kumite',
        angriff: KIK_ANGRIFF,
        abwehrNote: 'Jeweils 1x Sabaki rechts und 1x links.',
        abwehr: KIK_SABAKI,
        ziel: 'Einüben der grundlegenden Ausweichmanöver und zur Situation passender Kontertechniken. Erfahren unterschiedlicher Distanzen/Reichweiten bei Angriffstechniken.',
      },
      kataProg: { items: ['Heian Sandan'] },
      theory: ['Begriffe: Dojo, Te, Do, Kogeki, Uke'],
    },
    {
      id: '5kyu', name: '5. Kyu', belt: 'Blaugurt', cls: 'belt-blue', kata: ['heian-yondan'], stufe: 'II',
      wait: '4 Monate',
      kihon: {
        reps: 'Jede Technik je 3x.',
        items: [
          ['aus Gedan-Kamae links, vorwärts in Zk mit Oi-Zuki', 'Wendung mit Gedan-Barai in Zk'],
          ['vorwärts in Zk mit Sanbon-Zuki (Jodan / Chudan / Chudan)', 'Wendung mit Gedan-Barai in Zk'],
          ['vorwärts in Zk mit Age-Uke / Gyaku-Zuki'],
          ['rückwärts in Zk mit Soto-Uke / umsetzen in Kb mit Yoko-Empi-Uchi / Tate-Uraken'],
          ['vorwärts in Zk mit Uchi-Uke / Jodan-Kizami-Zuki / Gyaku-Zuki'],
          ['rückwärts in Kk mit Shuto-Uke / Jodan-Kizami-Mae-Geri / Nukite in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mae-Geri', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mawashi-Geri', 'Wendung mit Gedan-Barai in Kb'],
          ['aus Chudan-Kamae, vorwärts in Kb mit Yoko-Geri-Keage (in beide Richtungen)', 'Wendung mit Gedan-Barai in Kb'],
          ['aus Chudan-Kamae, vorwärts in Kb mit Yoko-Geri-Kekomi (in beide Richtungen)'],
        ],
      },
      kumite: {
        form: 'Kihon-Ippon-Kumite',
        angriff: KIK_ANGRIFF,
        abwehrNote: 'Jeweils 1x Sabaki rechts und 1x links.',
        abwehr: KIK_SABAKI,
        ziel: 'Erwerb und Festigung der grundlegenden Ausweichvariationen und dabei entsprechend günstiger Kontertechniken.',
      },
      kataProg: { items: ['Heian Yondan'] },
      theory: ['Begriffe: Kiai, Sanbon-Zuki, Soto-Uke, Uchi-Uke'],
    },
    {
      id: '4kyu', name: '4. Kyu', belt: 'Violettgurt', cls: 'belt-violet', kata: ['heian-godan'], stufe: 'II',
      wait: '4 Monate',
      kihon: {
        reps: 'Jede Technik je 3x.',
        items: [
          ['aus Gedan-Kamae links, vorwärts in Zk mit Oi-Zuki', 'Wendung mit Gedan-Barai in Zk'],
          ['vorwärts in Zk mit Sanbon-Zuki (Jodan / Chudan / Chudan)'],
          ['rückwärts in Zk mit Age-Uke / Gyaku-Zuki'],
          ['vorwärts in Zk mit Uchi-Uke / Jodan-Kizami-Zuki / Chudan-Gyaku-Zuki'],
          ['rückwärts in Zk mit Soto-Uke / umsetzen in Kb mit Yoko-Empi-Uchi / Tate-Uraken', 'Wendung mit Gedan-Barai in Zk'],
          ['vorwärts in Kk mit Shuto-Uke / Kizami-Mae-Geri / Nukite in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mae-Geri', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mawashi-Geri', 'Wendung mit Gedan-Barai in Kb'],
          ['aus Chudan-Kamae, vorwärts in Kb mit Yoko-Geri-Keage (in beide Richtungen)', 'Wendung mit Gedan-Barai in Kb'],
          ['aus Chudan-Kamae, vorwärts in Kb mit Yoko-Geri-Kekomi (in beide Richtungen)'],
        ],
      },
      kumite: {
        form: 'Kihon-Ippon-Kumite',
        angriff: KIK_ANGRIFF,
        abwehr: ['Sabaki frei, Blocktechniken frei', 'Gegenangriffe frei – jedoch bei jeder Angriffsstufe 2x unterschiedlich'],
        ziel: 'Ausweichbewegungen frei, Variationen im Gegenangriff gefordert.',
      },
      kataProg: { items: ['Heian Godan'] },
      theory: ['Begriffe: Kime, Kime-Waza'],
    },
    {
      id: '3kyu', name: '3. Kyu', belt: 'Braungurt', cls: 'belt-brown', kata: ['tekki-shodan'], stufe: 'III',
      wait: '4 Monate',
      kihon: {
        reps: 'Jede Technik je 3x.',
        items: [
          ['aus Gedan-Kamae links, vorwärts in Zk mit Oi-Zuki', 'Wendung mit Gedan-Barai in Zk'],
          ['vorwärts in Zk mit Sanbon-Zuki (Jodan / Chudan / Chudan)'],
          ['rückwärts in Zk mit Age-Uke / Gyaku-Zuki'],
          ['vorwärts in Zk mit Soto-Uke / umsetzen in Kb mit Yoko-Empi-Uchi / Tate-Uraken'],
          ['rückwärts in Zk mit Uchi-Uke / Kizami-Mae-Geri / Gyaku-Zuki'],
          ['vorwärts in Kk mit Shuto-Uke / Kizami-Mae-Geri / Nukite in Zk', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mae-Geri', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mawashi-Geri', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Ren-Geri (Chudan-Mae-Geri / Zwischenschritt / Mawashi-Geri)', 'Wendung mit Gedan-Barai in Kb'],
          ['aus Chudan-Kamae, vorwärts in Kb mit Yoko-Geri-Keage (in beide Richtungen)', 'Wendung mit Gedan-Barai in Kb'],
          ['aus Chudan-Kamae, vorwärts in Kb mit Yoko-Geri-Kekomi (in beide Richtungen)'],
        ],
      },
      kumite: {
        form: 'Kihon-Ippon-Kumite',
        angriff: [
          'a) aus Gedan-Kamae 1x links, 1x rechts: Jodan-Oi-Zuki',
          'b) aus Gedan-Kamae 1x links, 1x rechts: Chudan-Oi-Zuki',
          'c) aus Chudan-Kamae 1x links, 1x rechts: Chudan-Mae-Geri',
          'd) aus Chudan-Kamae 1x links, 1x rechts: Chudan-Yoko-Geri-Kekomi',
        ],
        abwehr: ['Sabaki frei', 'Gegenangriffe frei – jedoch bei jeder Angriffsstufe 2x unterschiedlich'],
        ziel: 'Nur noch EINE Chance pro Technik für den Angreifer. Variationen im Gegenangriff werden weiterhin gefordert.',
      },
      kataProg: { items: ['Tekki Shodan'] },
      theory: ['Begriffe: Ren-Geri, Shiai, Suri-Ashi'],
    },
    {
      id: '2kyu', name: '2. Kyu', belt: 'Braungurt', cls: 'belt-brown', kata: SENTEI_BOOK, stufe: 'III',
      wait: '4 Monate',
      kihon: {
        reps: 'Jede Technik je 3x.',
        items: [
          ['aus Gedan-Kamae links, vorwärts in Zk mit Oi-Zuki', 'Wendung mit Gedan-Barai in Zk'],
          ['vorwärts in Zk mit Sanbon-Zuki (Jodan / Chudan / Chudan)'],
          ['rückwärts in Zk mit Age-Uke / Gyaku-Zuki'],
          ['vorwärts in Zk mit Soto-Uke / in Kb mit Yoko-Empi-Uchi / Tate-Uraken'],
          ['rückwärts in Zk mit Uchi-Uke / Kizami-Mae-Geri / Kizami-Zuki / Gyaku-Zuki'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mae-Geri', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mawashi-Geri', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Ren-Geri (Chudan-Mae-Geri / Zwischenschritt / Mawashi-Geri)', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Ushiro-Geri', 'Wendung mit Gedan-Barai in Kb'],
          ['aus Chudan-Kamae, vorwärts in Kb mit Yoko-Geri-Keage (in beide Richtungen)', 'Wendung mit Gedan-Barai in Kb'],
          ['aus Chudan-Kamae, vorwärts in Kb mit Yoko-Geri-Kekomi (in beide Richtungen)'],
          ['Sonoba-Geri (Standübung links und rechts) aus Zk und Chudan-Kamae:', 'Mae-Geri nach vorne / mit gleichem Bein Yoko-Geri-Keage zur Seite', 'nach hinten absetzen in Chudan-Kamae'],
        ],
        note: 'Die DJKB-Übersicht Kihon führt zum 2. Kyu zusätzlich eine Shuto-Uke-Reihe, vermerkt aber selbst, dass diese Übung nicht in der Prüfungsordnung enthalten ist.',
      },
      kumite: {
        form: 'Jiyu-Ippon-Kumite',
        angriffVon: 'aus Chudan-Kamae, frei abwechselnd links oder rechts',
        angriff: ['a) Jodan-Oi-Zuki', 'b) Chudan-Oi-Zuki', 'c) Chudan-Mae-Geri', 'd) Chudan-Yoko-Geri-Kekomi', 'e) Chudan-Ushiro-Geri'],
        abwehr: ['aus Chudan-Kamae: Uke frei, mit zu Maai passender Kime-Waza-Technik', 'nach dem Kime-Waza (Zuki, Uchi oder Keri) wieder Kamae mit Zanshin'],
        ablauf: [
          'Beide Seiten stehen sich in freier Kampfstellung gegenüber.',
          'Der Angreifer sucht den für seine Technik günstigsten Abstand und führt sofort die angesagte Technik aus. Er trägt seinen Angriff mit größtem Einsatz vor, ohne Gedanken an die nächste, ihn erwartende Aktion des Verteidigers.',
          'Der Abwehrende darf nicht versuchen, den Abstand zu vergrößern, um sich dem Angriff zu entziehen, sondern soll in möglichst kurzer Distanz blocken bzw. ausweichen und dann eine kräftige Kontertechnik (Stoß-, Schlag-, Tritttechnik) ausführen.',
        ],
        ziel: 'Auslagewechsel durch den Angreifer wird vorbereitet.',
      },
      kataProg: { short: 'Sentei-Kata nach Wahl', items: [`Eine vom Prüfling ausgewählte Sentei-Kata: ${SENTEI}`] },
      theory: ['Begriffe: Maai, Deai, Jiyu-Ippon-Kumite, Kizami-Geri'],
    },
    {
      id: '1kyu', name: '1. Kyu', belt: 'Braungurt', cls: 'belt-brown', kata: SENTEI_BOOK, stufe: 'III',
      wait: '4 Monate',
      kihon: {
        reps: 'Jede Technik je 3x.',
        items: [
          ['aus Gedan-Kamae links, vorwärts in Zk mit Sanbon-Zuki (Jodan / Chudan / Chudan)', 'Wendung mit Gedan-Barai in Zk'],
          ['vorwärts in Zk mit Age-Uke / Mae-Geri / hinten absetzen mit Gyaku-Zuki in Zk'],
          ['rückwärts in Zk mit Soto-Uke / in Kb mit Yoko-Empi / Tate-Uraken / in Zk Gyaku-Zuki'],
          ['vorwärts in Zk mit Uchi-Uke / Kizami-Mae-Geri / Kizami-Zuki / Gyaku-Zuki', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Gedan-Kamae vorwärts in Kk mit Shuto-Uke / Kizami-Mae-Geri / in Zk Nukite', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mae-Geri', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mawashi-Geri', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Ren-Geri (Chudan-Mae-Geri / mit gleichem Bein Mawashi-Geri)', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Ushiro-Geri', 'Wendung mit Gedan-Barai in Kb'],
          ['aus Chudan-Kamae, vorwärts in Kb mit Yoko-Geri-Keage (in beide Richtungen)', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mae-Geri / Zwischenschritt / Yoko-Geri-Kekomi'],
          ['Sonoba-Geri (Standübung links und rechts) aus Zk und Chudan-Kamae:', 'Mae-Geri nach vorne / mit gleichem Bein Ushiro-Geri', 'nach hinten absetzen in Chudan-Kamae'],
        ],
      },
      kumite: {
        form: 'Jiyu-Ippon-Kumite',
        angriffVon: 'aus Chudan-Kamae, mindestens 2x die Ausgangslage wechseln',
        angriff: ['a) Jodan-Kizami-Zuki', 'b) Jodan-Oi-Zuki', 'c) Chudan-Oi-Zuki', 'd) Chudan-Mae-Geri', 'e) Chudan-Yoko-Geri-Kekomi', 'f) Jodan-Mawashi-Geri', 'g) Chudan-Ushiro-Geri'],
        abwehr: ['aus Chudan-Kamae: Uke frei, mit zu Maai passender Kime-Waza-Technik', 'nach dem Kime-Waza wieder Kamae mit Zanshin'],
        ziel: 'Auslagewechsel durch den Angreifer ist mindestens 2x vorgeschrieben. Zahl der Angriffstechniken wird erhöht.',
      },
      kataProg: { short: 'Sentei-Kata nach Wahl', items: [`Eine vom Prüfling ausgewählte Sentei-Kata: ${SENTEI}`], note: 'Auch die gleiche Kata wie zum 2. Kyu ist möglich.' },
      theory: ['Begriffe: Zanshin, Sonoba-Geri, Okuri-Jiyu-Ippon-Kumite, Sentei-Kata, Shitei-Kata, Tokui-Kata'],
    },
    {
      id: '1dan', name: '1. Dan (Shodan)', belt: 'Schwarzgurt', cls: 'belt-black', kata: ALL_BOOK, stufe: 'III',
      wait: 'Mindestalter 16 Jahre; 1 Jahr seit der letzten Prüfung (8 Jahre Karate)',
      kihon: {
        reps: 'Jede Technik je 3x.',
        items: [
          ['aus Gedan-Kamae links, vorwärts in Zk mit Sanbon-Zuki (Jodan / Chudan / Chudan)'],
          ['rückwärts in Zk mit Age-Uke / Mae-Geri / hinten absetzen mit Gyaku-Zuki in Zk'],
          ['vorwärts in Zk mit Soto-Uke / in Kb mit Yoko-Empi-Uchi / Tate-Uraken-Uchi / Gyaku-Zuki in Zk'],
          ['rückwärts in Zk mit Uchi-Uke / Kizami-Mae-Geri / Kizami-Zuki / Gyaku-Zuki in Zk'],
          ['vorwärts in Kk mit Shuto-Uke / Kizami-Mae-Geri / Nukite in Zk', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mae-Geri / Kizami-Zuki / Gyaku-Zuki in Zk', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Mawashi-Geri', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Ren-Geri (Mawashi-Geri / mit gleichem Bein Yoko-Geri-Kekomi)', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Ushiro-Geri', 'Wendung mit Gedan-Barai in Kb'],
          ['aus Chudan-Kamae, vorwärts in Kb mit Yoko-Geri-Keage', 'Drehung und mit hinterem Bein in Kb Yoko-Geri-Kekomi'],
          ['Sonoba-Geri (Standübung links und rechts) aus Zk und Chudan-Kamae:', 'Mae-Geri nach vorne / mit gleichem Bein Yoko-Geri-Keage zur Seite / mit gleichem Bein Ushiro-Geri', 'nach hinten absetzen in Chudan-Kamae'],
        ],
      },
      kumite: {
        form: 'Jiyu-Ippon-Kumite',
        angriffVon: 'aus Chudan-Kamae (ein Wechsel der Ausgangslage ist möglich)',
        angriff: ['a) Jodan-Kizami-Zuki', 'b) Jodan-Oi-Zuki', 'c) Chudan-Oi-Zuki', 'd) Chudan-Mae-Geri', 'e) Chudan-Yoko-Geri-Kekomi', 'f) Jodan-Mawashi-Geri', 'g) Chudan-Ushiro-Geri'],
        abwehr: ['aus Chudan-Kamae: Uke frei, mit zu Maai passender Kime-Waza-Technik', 'nach dem Kime-Waza (Zuki, Uchi oder Keri) wieder Kamae mit Zanshin'],
        ziel: 'Die Auslage kann jetzt für jede Aktion vom Angreifer gewechselt werden.',
      },
      kataProg: {
        short: 'Sentei-Kata + Heian/Tekki',
        items: [`1. Eine vom Prüfling ausgewählte Sentei-Kata: ${SENTEI} – auch die gleiche Kata wie zum 2. oder 1. Kyu ist möglich`, '2. Eine vom Prüfer angegebene Kata: Heian 1–5 oder Tekki-Shodan'],
      },
      theory: ['Theoretische Kenntnisse aus den Kyu-Graden', 'Begriffe: Kosa-Dachi, Sun-Dome, Tai-Sabaki, Ashi-Barai, Nagashi-Uke', 'Kata-Bunkai aus den Kata Heian 1–5 und Tekki-Shodan'],
    },
    {
      id: '2dan', name: '2. Dan (Nidan)', belt: 'Schwarzgurt', cls: 'belt-black', kata: ALL_BOOK,
      wait: 'Mindestalter 20 Jahre; 2 Jahre seit der letzten Prüfung (4 Jahre, wenn Shodan mit 16 Jahren)',
      kihon: {
        reps: 'Jede Technik je 3x.',
        items: [
          ['aus Chudan-Kamae links, im Stand Jodan-Kizami-Zuki', 'vorwärts in Zk mit Sanbon-Zuki (Jodan / Chudan / Chudan)'],
          ['aus Chudan-Kamae rückwärts in Zk mit Uchi-Uke / Mae-Geri', 'hinten absetzen mit Kizami-Zuki / Gyaku-Zuki'],
          ['aus Chudan-Kamae, einen Schritt zurück in Zk mit Age-Uke', 'vorwärts in Kb mit Mawashi-Geri / Tate-Uraken', 'vorwärts in Zk mit Oi-Zuki', 'Wendung mit Gedan-Barai in Zk'],
          ['aus Chudan-Kamae, vorwärts in Zk mit Jodan-Oi-Zuki / Gyaku-Zuki', 'rückwärts in Kk mit Shuto-Uke', 'vorwärts in Zk mit Ushiro-Geri / Gyaku-Zuki', 'Wendung mit Gedan-Barai in Kb'],
          ['aus Kb und Chudan-Kamae, vorwärts in Kb mit Yoko-Geri-Keage', 'Drehung und mit hinterem Bein Yoko-Geri-Kekomi in Kb'],
          ['Sonoba-Geri (Standübung links und rechts) aus Zk und Chudan-Kamae:', 'Mae-Geri nach vorne, mit gleichem Bein Yoko-Geri-Keage zur Seite, mit gleichem Bein Ushiro-Geri nach hinten, mit gleichem Bein Mawashi-Geri nach vorne', 'nach hinten absetzen in Chudan-Kamae'],
        ],
      },
      kumite: JIYU_KUMITE,
      kataProg: {
        short: '2 Kata',
        items: [`1. Der Prüfer gibt eine Kata an aus: Heian 1–5, Tekki-Shodan, Tekki-Nidan, Sentei-Kata (${SENTEI})`, '2. Kata nach Wahl des Prüflings aus: Bassai-Sho, Kanku-Sho, Nijushiho, Jitte, Chinte, Meikyo, Gankaku, Sochin'],
      },
      theory: [
        'Begriff: Happo-Kumite',
        'Theoretische Kenntnisse aus den Kyu- und vorherigen Danprüfungsprogrammen',
        'Lehrprobe aus den Kyu-Prüfungsprogrammen',
        `Kata-Bunkai aus den Sentei-Kata: ${SENTEI}`,
      ],
    },
    {
      id: '3dan', name: '3. Dan (Sandan)', belt: 'Schwarzgurt', cls: 'belt-black', kata: ALL_BOOK,
      wait: 'Mindestalter 28 Jahre; 3 Jahre seit der letzten Prüfung',
      kihon: {
        reps: 'Jede Technik je 3x.',
        items: [['Der Prüfer gibt 5 verschiedene Reihen von Techniken aus der Shodan- und Nidan-Prüfungsordnung an.']],
        ref: ['1dan', '2dan'],
      },
      kumite: JIYU_KUMITE,
      kataProg: {
        short: '4 Kata',
        items: [
          '1. Tokui-Kata: frei wählbar aus den Kata unseres Stils – nicht erlaubt sind Unsu, Gojushiho-Sho und Gojushiho-Dai sowie Kata, die bereits früher bei einer Dan-Prüfung gezeigt wurden',
          `2. Der Prüfer gibt eine der 5 Sentei-Kata an: ${SENTEI}`,
          '3. Der Prüfer gibt eine Kata an aus: Heian 1–5 und Tekki 1–3',
          '4. Der Prüfer gibt eine Kata an aus: Bassai-Sho, Kanku-Sho, Nijushiho, Jitte, Chinte, Meikyo, Gankaku, Sochin',
        ],
      },
      theory: ['Theoretische Fragen aus den Kyu- und Dan-Graden', 'Lehrprobe aus dem Shodan- und Nidan-Prüfungsprogramm', `Kata-Bunkai aus den Sentei-Kata: ${SENTEI}`],
    },
  ];

  // Höhere Dan-Grade: nur Programmseite, keine Theorie-Fragen
  SK.higherDan = {
    id: 'hoehere-dan', name: '4. und 5. Dan', belt: 'Schwarzgurt', cls: 'belt-black',
    wait: '4. Dan (Yondan): Mindestalter 38 Jahre, 4 Jahre seit der letzten Prüfung; 5. Dan (Godan): Mindestalter 48 Jahre, 5 Jahre seit der letzten Prüfung',
    kihon: { items: [['Der Prüfer gibt verschiedene Techniken und Kombinationen vor.']] },
    kumite: {
      form: 'Sämtliche Kumite-Formen',
      text: ['Der Prüfling soll sämtliche Kumite-Formen unserer Stilrichtung korrekt und sauber vorführen können: Gohon-Kumite, Kihon-Ippon-Kumite, Kaeshi-Ippon-Kumite, Jiyu-Ippon-Kumite, Okuri-Jiyu-Ippon-Kumite und Jiyu-Kumite.'],
      ziel: 'Korrekte Ausführung aller Formen des Partnertrainings gemäß ihrer Form und ihrer inhaltlichen Schwerpunkte.',
    },
    kataProg: {
      short: 'alle Kata, Tokui-Kata frei',
      items: [
        'Vorausgesetzt wird, dass der Prüfling sämtliche Kata unserer Stilrichtung beherrscht, so dass sie bei der Prüfung abrufbar sind (siehe Programm 1.–3. Dan).',
        'Tokui-Kata: frei wählbar aus den Kata unserer Stilrichtung (jetzt einschließlich Unsu, Gojushiho-Sho und Gojushiho-Dai), aber keine Kata, die bei einer vorangegangenen Prüfung bereits gezeigt wurde.',
        'Freie Wahl der Pflichtkata durch den Prüfer (2–3 Kata).',
      ],
      note: 'Die Wahl der Kata sollte dem Können und den körperlichen Voraussetzungen des Prüflings einerseits und dem angestrebten hohen Dan-Grad andererseits entsprechen.',
    },
  };

  SK.examStufe = (g) => (g.stufe ? STUFE[g.stufe] : null);
  SK.examJiyuIppon = JIYU_IPPON;
  SK.gradeIndex = (id) => SK.grades.findIndex((g) => g.id === id);
})();
