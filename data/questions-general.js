/* Fragen zu den allgemeinen Lerneinheiten. Richtige Antwort steht jeweils zuerst (Anzeige wird gemischt). */
(function () {
  'use strict';
  const S = SK.sources;
  let L;

  // Umgezogene Fragen (Quiz-Reiter „Theorie“ ohne Doppel zu „Begriffe“, v1.85): alte Lektion → neue. Der Lernstand zieht
  // beim Laden mit (SK.store, moveIds). Einträge nicht löschen, sonst geht er bei alten Speicherständen verloren.
  SK.lessonMoves = {
    'et-dojo': 'et-dojokun',
    'te-koerper': 'ki-geri',
    'te-konzepte': ['ki-tsuki', 'da-kampf'],
    'da-grund': 'da-kampf',
    'da-weitere': 'da-kampf',
    'ki-uke': 'ki-tsuki',
    'ki-uchi': 'ki-tsuki',
  };

  // ---------- Etikette ----------
  // Im Quiz ist „Im Dojo“ Teil der Lektion „Etikette & Dojo-Kun“ (et-dojokun)
  L = SK.qb('et-dojokun', S.allg);
  L.mc('Aus welchem Stand wird der Gruß (Rei) im Stehen meist ausgeführt?', ['Musubi-dachi', 'Kiba-dachi', 'Zenkutsu-dachi', 'Kokutsu-dachi'], 'Musubi-dachi gehört zur Theorie zum 9. Kyu.', S.po);
  L.order('Typische Reihenfolge beim Angrüßen im Sitzen:', ['Seiza', 'Mokuso', 'Mokuso yame', 'Shomen ni rei', 'Sensei ni rei', 'Kiritsu'], 'Die genaue Abfolge kann je nach Dojo leicht abweichen.');
  L.mc('Was muss man laut DJKB-Prüfungsordnung zum 9. Kyu (neben Begriffen) zeigen können?', ['Die Etikette des An- und Abgrüßens zu Beginn und Ende des Trainings', 'Eine Sentei-Kata', 'Jiyu-Kumite', 'Eine Lehrprobe'], '', S.po);

  L = SK.qb('et-dojokun', S.allg);
  L.mc('Wie viele Leitsätze hat das Dojo-Kun?', ['5', '3', '10', '20'], '');
  L.mc('Mit welchem Wort beginnt jeder Satz des Dojo-Kun?', ['Hitotsu', 'Osu', 'Hajime', 'Rei'], '„Hitotsu“ = „eins“ – alle Leitsätze sind gleich wichtig.');
  L.mc('Was bedeutet „Jinkaku kansei ni tsutomuru koto“?', ['Nach Vollendung des Charakters streben', 'Den Weg der Aufrichtigkeit bewahren', 'Den Geist des Bemühens pflegen', 'Etikette achten'], '');
  L.mc('Was bedeutet „Makoto no michi o mamoru koto“?', ['Den Weg der Aufrichtigkeit bewahren', 'Nach Vollendung des Charakters streben', 'Selbstbeherrschung üben', 'Etikette achten'], '');
  L.mc('Was bedeutet „Doryoku no seishin o yashinau koto“?', ['Den Geist des Bemühens (Ausdauer) pflegen', 'Etikette achten', 'Aufrichtig sein', 'Unkontrollierte Gewalt vermeiden'], '');
  L.mc('Was bedeutet „Reigi o omonzuru koto“?', ['Etikette und Höflichkeit achten', 'Den Charakter vervollkommnen', 'Fleißig sein', 'Sich beherrschen'], '');
  L.mc('Was bedeutet „Kekki no yu o imashimuru koto“?', ['Sich vor unkontrolliertem Draufgängertum hüten', 'Den Weg der Aufrichtigkeit bewahren', 'Etikette achten', 'Den Geist des Bemühens pflegen'], '');
  L.order('Bringe die Leitsätze des Dojo-Kun in die übliche Reihenfolge:', ['Charakter vervollkommnen', 'Aufrichtigkeit', 'Bemühen / Ausdauer', 'Etikette', 'Selbstbeherrschung'], '');
  L.mc('Was drückt das „Hitotsu“ am Anfang jedes Dojo-Kun-Satzes aus?', ['Jeder Leitsatz ist gleich wichtig', 'Nur der erste Satz zählt', 'Die Sätze werden nur einmal im Leben gesprochen', 'Es ist ein Kampfschrei'], '');

  // ---------- Geschichte ----------
  L = SK.qb('ge-funakoshi', S.allg);
  L.mc('Wer gilt als Begründer des Shotokan-Karate?', ['Gichin Funakoshi', 'Masatoshi Nakayama', 'Hideo Ochi', 'Mas Oyama'], '');
  L.mc('Woher stammt Gichin Funakoshi?', ['Aus Shuri auf Okinawa', 'Aus Tokio', 'Aus Kyoto', 'Aus Osaka'], '');
  L.mc('In welchem Jahr wurde Gichin Funakoshi geboren?', ['1868', '1898', '1913', '1922'], '');
  L.mc('In welchem Jahr starb Gichin Funakoshi?', ['1957', '1949', '1968', '1987'], '');
  L.mc('In welchem Jahr stellte Funakoshi Karate in Tokio vor?', ['1922', '1868', '1949', '1957'], '');
  L.multi('Wer gehörte zu den Lehrern Funakoshis?', ['Anko Itosu', 'Anko Azato'], ['Masatoshi Nakayama', 'Hideo Ochi'], '');
  L.mc('Was bedeutet „Shotokan“?', ['Haus des Shoto (Funakoshis Künstlername)', 'Weg der leeren Hand', 'Japanische Karate-Vereinigung', 'Schule der Kata'], '');
  L.mc('Was bedeutet „Shoto“?', ['Pinienrauschen – Funakoshis Künstlername', 'Leere Hand', 'Haus', 'Schwert'], '');
  L.mc('Was bedeutet „Karate-Do“?', ['Weg der leeren Hand', 'Kunst des Schwertes', 'Weg der Harmonie', 'Chinesische Faust'], '');
  L.mc('Was bedeutet das „Do“ in Karate-Do?', ['Weg', 'Hand', 'Leer', 'Kampf'], 'Theoriebegriff zum 6. Kyu.', S.po);
  L.mc('Was bedeutet „Te“?', ['Hand', 'Fuß', 'Weg', 'Haus'], 'Theoriebegriff zum 6. Kyu.', S.po);
  L.mc('Welche Bedeutung hatte das Schriftzeichen „Kara“ ursprünglich, bevor es in „leer“ geändert wurde?', ['China (Tang)', 'Holz', 'Himmel', 'Kampf'], '');
  L.mc('Welches Buch schrieb Funakoshi 1925?', ['Rentan Goshin Karate-Jutsu', 'Best Karate', 'Dynamic Karate', 'Karate-Do Kata'], '', S.pdf);
  L.mc('Welches bekannte Lehrbuch stammt von Gichin Funakoshi?', ['Karate-Do Kyohan', 'Best Karate', 'Dynamic Karate', 'Das Buch der fünf Ringe'], '', S.pdf);

  L = SK.qb('ge-jka', S.allg);
  L.mc('Wofür steht die Abkürzung JKA?', ['Japan Karate Association', 'Japanese Kata Academy', 'Junior Karate Association', 'Japan Kumite Alliance'], '');
  L.mc('In welchem Jahr wurde die JKA gegründet?', ['1949', '1922', '1957', '1968'], '');
  L.mc('Wofür steht die Abkürzung DJKB?', ['Deutscher JKA-Karate Bund', 'Deutscher Judo- und Karate-Bund', 'Deutscher Jugend-Karate-Bund', 'Deutsche JKA-Kata-Bühne'], '');
  L.mc('Welche Rolle hat der DJKB in Deutschland?', ['Fachverband für traditionelles Shotokan-Karate und offizielle Vertretung der JKA', 'Olympischer Dachverband aller Kampfsportarten', 'Verband für Vollkontakt-Karate', 'Nur ein Wettkampfveranstalter'], '');
  L.mc('Wer unterzeichnet die DJKB-Prüfungsordnung (Stand 2026) als Chefausbilder?', ['Hideo Ochi', 'Masatoshi Nakayama', 'Gichin Funakoshi', 'Motokuni Sugiura'], '', S.po);
  L.mc('Wer war langjähriger Chefausbilder der JKA und schrieb „Best Karate“?', ['Masatoshi Nakayama', 'Gichin Funakoshi', 'Hideo Ochi', 'Anko Itosu'], '');
  L.mc('Wie wird Funakoshi im JKA-Kata-Buch bezeichnet?', ['Grand Master of the Japan Karate Association', 'Chief Instructor of DJKB', 'President of WKF', 'Founder of Kyokushin'], '', S.pdf);
  L.mc('Welches ist das offizielle Kata-Lehrbuch der JKA?', ['Karate-Do Kata (Shihan-kai)', 'Dynamic Karate', 'Karate-Do Nyumon', 'Bubishi'], '', S.pdf);

  L = SK.qb('ge-nijukun', S.allg);
  L.mc('Was sind die „Niju-Kun“?', ['Funakoshis 20 Leitsätze', 'Die 20 Kata des Shotokan', 'Die 20 Grundstände', 'Die 20 Prüfungsfächer'], '');
  L.mc('Was bedeutet „Karate ni sente nashi“?', ['Im Karate gibt es keinen ersten Angriff', 'Karate kennt keine Grenzen', 'Karate beginnt mit Kiai', 'Karate ist nur für Starke'], '');
  L.mc('Womit beginnt und endet Karate laut erstem Leitsatz der Niju-Kun?', ['Mit Rei (Respekt/Gruß)', 'Mit Kiai', 'Mit Kata', 'Mit Kumite'], '');
  L.mc('Womit vergleicht Funakoshi Karate in den Niju-Kun – es kühlt ohne ständige Wärme ab?', ['Mit heißem Wasser', 'Mit einem Schwert', 'Mit einem Baum', 'Mit einem Berg'], '');
  L.mc('Was soll man laut Niju-Kun über die Hände und Füße des Gegners denken?', ['Dass sie wie Schwerter sind', 'Dass sie harmlos sind', 'Dass sie langsam sind', 'Dass man sie ignorieren kann'], '');
  L.mc('Was gilt laut Niju-Kun für Kamae?', ['Kamae ist für Anfänger, später steht man in Shizentai', 'Man soll niemals Kamae einnehmen', 'Kamae nur im Wettkampf', 'Kamae nur in der Kata'], '');
  L.mc('Was soll man laut Niju-Kun beim Kampf denken?', ['Nicht ans Gewinnen, sondern daran, nicht zu verlieren', 'Nur ans Gewinnen', 'An die Zuschauer', 'An die Technik des Gegners'], '');
  L.mc('Was kommt laut Niju-Kun vor der Kunst der Technik?', ['Die Kunst des Geistes', 'Die Kunst der Abwehr', 'Die Kunst der Atmung', 'Die Kunst des Kampfes'], '');
  L.mc('Was erwartet dich laut Niju-Kun, wenn du das Tor (dein Haus) verlässt?', ['Millionen Feinde', 'Deine Schüler', 'Dein Lehrer', 'Ein neuer Weg'], '');
  L.multi('Welche drei Gegensatzpaare soll man laut 19. Leitsatz nicht vergessen?', ['Stärke und Schwäche der Kraft', 'Dehnen und Zusammenziehen des Körpers', 'Langsamkeit und Schnelligkeit der Technik'], ['Laut und leise des Kiai', 'Hoch und tief des Blicks'], '');

  // ---------- Begriffe ----------
  L = SK.qb('te-zahlen', S.allg);
  const zahlen = ['Ichi', 'Ni', 'San', 'Shi', 'Go', 'Roku', 'Shichi', 'Hachi', 'Ku', 'Ju'];
  zahlen.forEach((w, i) => {
    const others = SK.util.shuffle(zahlen.filter((x) => x !== w)).slice(0, 3);
    L.mc(`Wie lautet die Zahl ${i + 1} auf Japanisch?`, [w].concat(others), '');
  });
  L.mc('Was bedeutet „Hachi“?', ['Acht', 'Sechs', 'Vier', 'Zwei'], '');
  L.mc('Was bedeutet „Roku“?', ['Sechs', 'Neun', 'Drei', 'Zehn'], '');
  L.order('Zähle von 1 bis 5:', ['Ichi', 'Ni', 'San', 'Shi', 'Go'], '');
  L.order('Zähle von 6 bis 10:', ['Roku', 'Shichi', 'Hachi', 'Ku', 'Ju'], '');
  L.mc('Was bedeutet „Hidari“?', ['Links', 'Rechts', 'Vorne', 'Hinten'], '');
  L.mc('Was bedeutet „Migi“?', ['Rechts', 'Links', 'Oben', 'Unten'], '');
  L.mc('Was bedeutet „Mae“?', ['Vorne', 'Hinten', 'Seitlich', 'Oben'], '');
  L.mc('Was bedeutet „Ushiro“?', ['Hinten', 'Vorne', 'Seitlich', 'Unten'], '');
  L.mc('Was bedeutet „Yoko“?', ['Seitlich', 'Vorne', 'Hinten', 'Oben'], '');
  L.mc('Was bedeutet „Jodan“?', ['Obere Stufe (Gesicht/Kopf)', 'Mittlere Stufe', 'Untere Stufe', 'Fußhöhe'], 'Theoriebegriff zum 8. Kyu.', S.po);
  L.mc('Was bedeutet „Chudan“?', ['Mittlere Stufe (Brust/Rumpf)', 'Obere Stufe', 'Untere Stufe', 'Kopfhöhe'], 'Theoriebegriff zum 8. Kyu.', S.po);
  L.mc('Was bedeutet „Gedan“?', ['Untere Stufe (Unterbauch)', 'Obere Stufe', 'Mittlere Stufe', 'Schulterhöhe'], 'Theoriebegriff zum 8. Kyu.', S.po);
  L.order('Ordne die Stufen von oben nach unten:', ['Jodan', 'Chudan', 'Gedan'], '');
  L.mc('Was bedeutet „Kyu“?', ['Schülergrad', 'Meistergrad', 'Lehrer', 'Gürtel'], '');
  L.mc('Was bedeutet „Dan“?', ['Meistergrad', 'Schülergrad', 'Kampf', 'Übungsraum'], '');
  L.mc('Wie heißt der 1. Dan auf Japanisch?', ['Shodan', 'Nidan', 'Sandan', 'Ichidan'], '');
  L.mc('Wie heißt der 3. Dan auf Japanisch?', ['Sandan', 'Nidan', 'Yondan', 'Godan'], '');
  L.mc('Was bedeutet „Yondan“ in „Heian Yondan“?', ['Vierte Stufe', 'Zweite Stufe', 'Fünfte Stufe', 'Dritte Stufe'], '');
  L.mc('Was bedeutet „Kata“?', ['Festgelegte Form – Abfolge von Techniken gegen gedachte Gegner', 'Partnerübung', 'Grundschule', 'Wettkampf'], 'Theoriebegriff zum 8. Kyu.', S.po);
  L.mc('Was bedeutet „Kihon“?', ['Grundschule / Grundtechniken', 'Freikampf', 'Form', 'Gruß'], '');
  L.mc('Was bedeutet „Kumite“?', ['Partnerübung / Kampf', 'Form', 'Grundschule', 'Meditation'], '');

  // Körperwaffen fragt der Reiter „Begriffe“ ab; die Fußteile der Tritte gehören im Quiz zu „Kihon – Fuß“ (ki-geri)
  L = SK.qb('ki-geri', S.allg);
  L.mc('Mit welchem Teil des Fußes wird Mae-geri ausgeführt?', ['Mit dem Fußballen (Koshi / Josokutei)', 'Mit der Ferse', 'Mit der Fußkante', 'Mit den Zehenspitzen'], '');
  L.mc('Mit welchem Fußteil wird Yoko-geri ausgeführt?', ['Mit der Fußkante (Sokuto)', 'Mit dem Fußballen', 'Mit dem Fußrücken', 'Mit den Zehen'], '');
  L.mc('Mit welchem Fußteil wird Ushiro-geri typischerweise ausgeführt?', ['Mit der Ferse (Kakato)', 'Mit dem Fußballen', 'Mit dem Fußrücken', 'Mit der Fußkante'], '');

  // Die Konzepte fragt der Reiter „Begriffe“ ab; die beiden Grundprinzipien gehören im Quiz zu Kihon und Ständen
  L = SK.qb('ki-tsuki', S.po);
  L.mc('Wo beginnt nach den Grundprinzipien die Kraft einer Handtechnik?', ['Am Boden – der hintere Fuß drückt aktiv gegen den Boden', 'In der Hüfte – sie dreht vor allem anderen', 'In der Schulter – sie schiebt den Arm nach vorn', 'In der Faust – sie spannt sich zuerst an'], 'Über Bein, Körpermitte und Hüfte läuft die Kraft zum Ziel.', S.kompakt);
  L = SK.qb('da-kampf', S.po);
  L.mc('Womit vergleicht man die Stände, um ihre Bedeutung zu zeigen?', ['Mit dem Fundament eines Gebäudes', 'Mit dem Dach eines Hauses', 'Mit einer Brücke', 'Mit einem Fluss'], '', S.kompakt);

  // ---------- Stände ----------
  // Im Quiz eine Lektion „Stände“ (da-kampf)
  L = SK.qb('da-kampf', S.allg);
  L.mc('Welcher Stand ist die Yoi-Position der Heian-Kata laut JKA-Buch?', ['Hachiji-dachi', 'Heisoku-dachi', 'Musubi-dachi', 'Kiba-dachi'], '', S.pdf);

  L = SK.qb('da-kampf', S.allg);
  L.mc('Wofür steht die Abkürzung „Zk“ in der DJKB-Prüfungsordnung?', ['Zenkutsu-dachi', 'Zenwan-kamae', 'Zuki-kihon', 'Zanshin-kamae'], '', S.po);
  L.mc('Wofür steht die Abkürzung „Kk“?', ['Kokutsu-dachi', 'Kiba-kamae', 'Kosa-dachi', 'Kizami-kamae'], '', S.po);
  L.mc('Wofür steht die Abkürzung „Kb“?', ['Kiba-dachi', 'Kokutsu-dachi', 'Kake-barai', 'Kosa-barai'], '', S.po);
  L.mc('Was bedeutet „Hidari Zenkutsu-dachi“?', ['Vorwärtsstellung mit dem linken Bein vorne', 'Vorwärtsstellung mit dem rechten Bein vorne', 'Rückwärtsstellung mit links vorne', 'Reiterstellung nach links'], '');
  L.mc('In welchem Stand wird Shuto-uke in der Kihon-Prüfung typischerweise ausgeführt?', ['Kokutsu-dachi', 'Zenkutsu-dachi', 'Kiba-dachi', 'Heisoku-dachi'], '', S.po);
  L.mc('In welchem Stand wird Yoko-geri-keage im DJKB-Kihon ausgeführt?', ['Kiba-dachi', 'Zenkutsu-dachi', 'Kokutsu-dachi', 'Neko-ashi-dachi'], '', S.po);

  L = SK.qb('da-kampf', S.allg);
  L.mc('Wofür eignet sich Fudo-dachi („unbeweglicher Stand“) besonders?', ['Als feste Basis, aus der eine Technik viel Kraft entfalten kann', 'Für schnelle Sprünge', 'Für den Gruß', 'Zum Ausruhen zwischen den Techniken'], '', S.kompakt);
  L.mc('Woher hat Sanchin-dachi den Namen „Sanduhrstand“?', ['Die Füße werden beim Gehen zur Mitte geführt, der Stand ist sehr kurz – das ergibt die Form einer Sanduhr', 'Man hält ihn genau eine Minute', 'Die Arme bilden eine Sanduhr', 'Er stammt aus der Kata Sanduhr'], '', S.kompakt);

  L = SK.qb('da-ashi', S.kompakt);
  L.mc('Warum beschreibt der hintere Fuß beim Schritt in Zenkutsu-dachi einen Bogen?', ['Der Stand hat Breite – in der Mitte des Schritts kommen die Füße zusammen', 'Damit der Schritt länger wird', 'Um den Partner zu fegen', 'Weil man dabei springt'], '');
  L.mc('Was unterscheidet Suri-ashi von Ayumi-ashi?', ['Bei Suri-ashi wechseln die Beine nicht – der vordere Fuß gleitet vor, der hintere zieht nach', 'Bei Suri-ashi springt man', 'Bei Suri-ashi gleiten beide Füße gleichzeitig', 'Es gibt keinen Unterschied'], '');
  L.mc('Was unterscheidet Yori-ashi von Suri-ashi?', ['Bei Yori-ashi bleibt der Stand immer gleich lang – bei Suri-ashi wird er kurz länger (erst vorne, dann hinten)', 'Bei Yori-ashi wechseln die Beine', 'Bei Yori-ashi springt man', 'Bei Suri-ashi stampft der Fuß auf'], '');
  L.mc('Wofür eignet sich Yori-ashi (Gleitschritt in einem Zug) besonders?', ['Kleine Distanzänderungen, Rhythmuswechsel und das Verschleiern eines Angriffs', 'Große Strecken in kurzer Zeit', 'Drehungen um 180°', 'Den Gruß'], '');
  L.mc('Warum muss man Fußarbeit eigens üben?', ['Weil die richtige Distanz für Abwehr und Konter davon abhängt', 'Weil sie in Prüfungen nicht vorkommt', 'Damit die Kata schneller vorbei ist', 'Weil die Hände sonst ermüden'], '');

  // ---------- Kihon ----------
  L = SK.qb('ki-tsuki', S.allg);
  L.mc('Wie wird Sanbon-zuki in der DJKB-Prüfung ausgeführt?', ['Jodan / Chudan / Chudan', 'Chudan / Chudan / Chudan', 'Jodan / Jodan / Chudan', 'Gedan / Chudan / Jodan'], '', S.po);
  L.mc('Auf welcher Höhe werden laut DJKB-Prüfungsordnung Fauststöße generell ausgeführt?', ['Chudan', 'Jodan', 'Gedan', 'Frei wählbar'], 'Ausnahmen sind im Programm angegeben.', S.po);
  L.mc('Was unterscheidet Awase-zuki von Yama-zuki?', ['Beim Awase-zuki bleibt der Oberkörper aufrecht, die Form ist enger (U-förmig)', 'Awase-zuki ist ein Fußtritt', 'Beim Awase-zuki stößt nur eine Faust', 'Awase-zuki wird nur nach hinten ausgeführt'], '', S.kompakt);
  L.mc('Womit wird Kizami-zuki häufig unterstützt, um in die Distanz zu kommen?', ['Mit einem Gleitschritt (Suri-ashi)', 'Mit einem Sprung', 'Mit einer Drehung um 180°', 'Mit einem Fußfeger'], '', S.kompakt);

  // Im Quiz „Kihon – Hand“ (ki-tsuki) mit Tsuki, Uke und Uchi
  L = SK.qb('ki-tsuki', S.allg);
  L.mc('Wie heißt die zum 8. Kyu geforderte Wendung nach Shuto-uke im Kihon?', ['Gedan-barai in Zk', 'Age-uke in Kb', 'Soto-uke in Kk', 'Shuto-uke in Zk'], '', S.po);
  L.mc('Was gilt laut Grundprinzip für eine Abwehr ohne schnellen Konter?', ['Sie ist unvollständig – außer man verzichtet bewusst aus taktischen Gründen darauf', 'Sie ist immer die beste Lösung', 'Sie ist in Prüfungen verboten', 'Sie heißt Kime'], '', S.kompakt);

  L = SK.qb('ki-tsuki', S.allg);
  L.mc('Welche Technik kommt ab dem 5. Kyu nach Yoko-Empi-Uchi hinzu?', ['Tate-Uraken', 'Mawashi-geri', 'Nukite', 'Age-uke'], '', S.po);
  L.mc('Wodurch unterscheidet sich Uchi von Tsuki laut JKA-Buch?', ['Bei Uchi wirkt die Kraft im rechten Winkel zum Unterarm, bei Tsuki in Richtung des gestreckten Unterarms', 'Uchi ist immer mit offener Hand', 'Uchi ist immer Gedan', 'Es gibt keinen Unterschied'], '', S.pdf);
  L.mc('In welchem Stand wird Yoko-enpi bevorzugt ausgeführt?', ['Kiba-dachi', 'Neko-ashi-dachi', 'Heisoku-dachi', 'Kosa-dachi'], '', S.kompakt);
  L.mc('Woher holen Schlagtechniken (Uchi) wie Uraken- oder Shuto-uchi ihre Kraft?', ['Aus dem Schnappen des Ellbogens', 'Aus einem Sprung', 'Nur aus der Schulter', 'Aus dem Kiai'], '', S.kompakt);

  L = SK.qb('ki-geri', S.allg);
  L.mc('Was bewirkt ein Fußfeger (Ashi-barai) im Karate?', ['Der Partner verliert kurz das Gleichgewicht und ist der Folgetechnik ausgeliefert', 'Der Partner wird dauerhaft zu Boden geworfen', 'Er ersetzt die Abwehr', 'Er ist nur ein Aufwärmspiel'], '', S.kompakt);
  L.mc('Was ist der Unterschied zwischen Keage und Kekomi?', ['Keage = Schnapptritt, Kekomi = Stoßtritt', 'Keage = Stoßtritt, Kekomi = Schnapptritt', 'Keage = Sprungtritt, Kekomi = Bodentritt', 'Kein Unterschied'], '', S.pdf);
  L.mc('Auf welcher Höhe werden Ushiro-geri und Yoko-geri-kekomi im DJKB-Kihon generell ausgeführt?', ['Chudan', 'Jodan', 'Gedan', 'Frei'], '', S.po);
  L.mc('Auf welcher Höhe werden laut DJKB alle übrigen Fußtritte (auch Kizami-mae-geri) generell ausgeführt?', ['Jodan', 'Chudan', 'Gedan', 'Frei'], 'Ausnahmen sind im Programm angegeben.', S.po);
  L.mc('In welche Richtung(en) sind seitliche Fußtritte in der DJKB-Prüfung auszuführen?', ['In beide Richtungen', 'Nur nach rechts', 'Nur nach links', 'Nach Wahl des Prüflings'], '', S.po);
  L.mc('Womit trifft Mae-geri-kekomi?', ['Mit der Ferse oder dem Fußballen', 'Mit dem Spann', 'Mit der Fußkante', 'Mit dem Knie'], '', S.kompakt);
  L.mc('Was gilt beim Kniestoß (Hiza-geri) für Fuß und Zehen?', ['Sie werden zum Schienbein angezogen', 'Sie werden gestreckt', 'Sie zeigen zur Seite', 'Sie berühren den Boden'], '', S.kompakt);

  // ---------- Kumite ----------
  L = SK.qb('ku-formen', S.po);
  L.mc('Was ist „Gohon-Kumite“?', ['Fünfschritt-Kumite', 'Dreischritt-Kumite', 'Einschritt-Kumite', 'Freikampf'], 'Theoriebegriff zum 8. Kyu.');
  L.mc('Was ist „Kihon-Ippon-Kumite“?', ['Einschritt-Grundkumite mit angesagtem Angriff', 'Fünfschritt-Kumite', 'Freikampf', 'Kumite gegen mehrere Gegner'], 'Theoriebegriff zum 8. Kyu.');
  L.mc('Was ist „Jiyu-Ippon-Kumite“?', ['Freies Einschritt-Kumite aus Chudan-Kamae', 'Fünfschritt-Kumite', 'Freikampf ohne Regeln', 'Kumite im Sitzen'], 'Theoriebegriff zum 2. Kyu.');
  L.mc('Was ist „Okuri-Jiyu-Ippon-Kumite“?', ['Jiyu-Ippon-Kumite mit einem Folgeangriff', 'Jiyu-Ippon-Kumite ohne Ansage des Angriffsziels', 'Jiyu-Ippon-Kumite gegen zwei Angreifer', 'Jiyu-Ippon-Kumite nur mit Fußtechniken'], 'Theoriebegriff zum 1. Kyu.');
  L.mc('Was ist „Happo-Kumite“?', ['Kumite in acht Richtungen (gegen mehrere Angreifer)', 'Kumite mit fünf Angriffen', 'Kumite im Kniestand', 'Kumite mit verbundenen Augen'], 'Theoriebegriff zum 2. Dan.');
  L.mc('Was ist „Jiyu-Kumite“?', ['Freikampf', 'Einschritt-Kumite', 'Fünfschritt-Kumite', 'Kata-Anwendung'], '');
  L.order('Ordne die Kumite-Formen nach ihrem ersten Auftreten in der DJKB-Prüfungsordnung (früheste zuerst):', ['Gohon-Kumite (9. Kyu)', 'Kihon-Ippon-Kumite (7. Kyu)', 'Jiyu-Ippon-Kumite (5. Kyu)', 'Jiyu-Kumite (2. Dan)'], '');
  L.multi('Welche Formen zählt die Prüfungsordnung zu „sämtlichen Formen des Partnertrainings unserer Stilrichtung“?', ['Gohon-Kumite', 'Kihon-Ippon-Kumite', 'Kaeshi-Ippon-Kumite', 'Jiyu-Ippon-Kumite', 'Okuri-Jiyu-Ippon-Kumite', 'Jiyu-Kumite'], ['Sanbon-Kumite mit Waffen', 'Randori im Liegen'], '');
  L.mc('Wie viele Angriffe führt der Angreifer beim Gohon-Kumite fortlaufend aus?', ['5', '3', '1', '7'], '');
  L.mc('Was folgt beim Gohon-Kumite nach der fünften Abwehr?', ['Gegenangriff Chudan-Gyaku-zuki mit Kiai', 'Ein Fußfeger', 'Die Verbeugung', 'Ein weiterer Block'], '');
  L.mc('Ab welchem Grad wird laut DJKB-Prüfungsordnung Jiyu-Ippon-Kumite geprüft?', ['Ab dem 5. Kyu', 'Ab dem 7. Kyu', 'Ab dem 2. Kyu', 'Ab dem 1. Dan'], 'Zum 5. und 4. Kyu kann der Prüfer zusätzlich Kihon-Ippon-Kumite prüfen.');
  L.mc('Ab welchem Grad werden im Jiyu-Ippon-Kumite mindestens 3 verschiedene Kontertechniken verlangt?', ['Ab dem 2. Kyu', 'Ab dem 5. Kyu', 'Ab dem 3. Kyu', 'Ab dem 1. Dan'], '');
  L.mc('Welche Kumite-Formen werden zum 7. Kyu geprüft?', ['Gohon-Kumite und Kihon-Ippon-Kumite', 'Nur Gohon-Kumite', 'Kihon-Ippon-Kumite und Jiyu-Ippon-Kumite', 'Nur Jiyu-Ippon-Kumite'], '');
  L.mc('Aus welcher Stellung beginnt der Angreifer beim Gohon-Kumite (8. Kyu)?', ['Aus Zk (Gedan-Kamae links), erster Angriff rechts', 'Aus Kiba-dachi', 'Aus Shizentai', 'Aus Kokutsu-dachi'], '');
  L.mc('In welcher Stellung steht der Verteidiger zu Beginn des Gohon-Kumite?', ['Hachiji-dachi (Shizentai)', 'Zenkutsu-dachi', 'Kiba-dachi', 'Kokutsu-dachi'], '');

  L = SK.qb('ku-prinzipien', S.po);
  L.mc('Worauf soll sich der Anfänger im Kihon der Stufe I (9.–7. Kyu) vor allem konzentrieren?', ['Auf seine Stellung – vorwärts wie rückwärts in der jeweils richtigen Stellung', 'Auf möglichst hohe Fußtritte', 'Auf schnelle Kombinationen', 'Auf das Kiai'], 'Geübt wird in einfachen Vorwärts- und Rückwärtsbewegungen.');
  L.mc('Was ist in Stufe I beim Kumite unbedingt zu beachten?', ['Die korrekte Distanz bei Angriff, Abwehr und Konter', 'Möglichst viele Kombinationen', 'Freie Technikwahl', 'Sprungtechniken'], '');
  L.mc('Wo soll der Abwehrende in Stufe I den Angriff blocken?', ['Dicht vor seinem Körper, kraftvoll', 'Möglichst weit vom Körper entfernt', 'Gar nicht – nur ausweichen', 'Mit beiden Händen über dem Kopf'], '');
  L.mc('Worauf wird in Stufe II (6.–4. Kyu) besonderer Wert gelegt?', ['Hüftdrehung in der Abwehr und kraftvoller Konter aus derselben Stellung', 'Konter aus einer anderen Stellung', 'Freikampf', 'Kata-Bunkai'], '');
  L.mc('Mit welcher Einstellung soll der Angreifer im Kihon-Ippon-Kumite angreifen?', ['Als gäbe es nur eine einzige Angriffschance', 'Locker und ohne Kraft', 'Mit vielen Finten', 'Mit möglichst großer Distanz'], '');
  L.mc('Warum steht der Abwehrende im Kihon-Ippon-Kumite zunächst ruhig in Shizentai?', ['Um die psychische Stabilität zu verbessern', 'Um Kraft zu sparen', 'Weil es schneller ist', 'Damit der Prüfer besser sieht'], '');
  L.mc('Was ist das Besondere an Stufe III (3. Kyu bis Dan) im Kumite?', ['Der Konter erfolgt aus einer anderen Stellung als die Abwehr – das verstärkt ihn', 'Es wird nur noch geblockt', 'Der Konter erfolgt immer mit Fußtritt', 'Es gibt keine Abwehr mehr'], '');
  L.mc('Was schult Jiyu-Ippon-Kumite laut Prüfungsordnung besonders?', ['Distanz, Timing, schnelle Entscheidungen und Überwinden eigener Unsicherheit', 'Nur die Kraft', 'Nur die Ausdauer', 'Kata-Ablauf'], '');
  L.mc('Was darf der Abwehrende im Jiyu-Ippon-Kumite nicht tun?', ['Den Abstand vergrößern, um sich dem Angriff zu entziehen', 'Kontern', 'Ausweichen', 'In Chudan-Kamae stehen'], '');
  L.mc('Was folgt nach dem Kime-Waza im Jiyu-Ippon-Kumite?', ['Wieder Kamae mit Zanshin', 'Verbeugung', 'Sofort ein zweiter Angriff', 'Wechsel in Seiza'], '');
  L.mc('Wie kann der Abwehrende laut Prüfungsordnung im Kihon-Ippon zusätzlich trainieren (erhöhte Risikobereitschaft)?', ['Block von innen nach außen, z. B. rechter Block gegen rechten Angriff mit linkem Bein zurück', 'Mit geschlossenen Augen', 'Nur mit Fußtechniken', 'Ohne Konter'], '');
})();
