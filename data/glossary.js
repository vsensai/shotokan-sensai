/* Lexikon aller Stände, Techniken und Begriffe – Grundlage für Wissen (Lexikon) und den Quiz-Reiter „Begriffe“. */
(function () {
  'use strict';
  const G = SK.gfx;
  const PDF = (n) => SK.bookSrc(n);
  const PDF2 = (n) => SK.bookSrc2(n); // Vol. 2, nur Hangetsu
  const ALLG = SK.sources.allg;
  const PO = SK.sources.po;
  const KO = SK.sources.kompakt;

  SK.glossaryCats = [
    { id: 'stand', title: 'Stände (Dachi)', ask: 'Welcher Stand ist abgebildet?' },
    { id: 'tsuki', title: 'Fauststöße (Tsuki)', ask: 'Welche Technik ist abgebildet?' },
    { id: 'uchi', title: 'Schläge (Uchi)', ask: 'Welcher Schlag ist abgebildet?' },
    { id: 'uke', title: 'Abwehrtechniken (Uke)', ask: 'Welche Abwehr ist abgebildet?' },
    { id: 'geri', title: 'Fußtechniken (Geri)', ask: 'Welche Fußtechnik zeigt die Grafik?' },
    { id: 'ashi', title: 'Fußbewegungen (Ashi-sabaki)', ask: 'Welche Fußbewegung zeigt die Grafik?' },
    { id: 'waffe', title: 'Körperwaffen', ask: 'Welcher Körperteil ist markiert?' },
    { id: 'kamae', title: 'Haltungen (Kamae)', ask: 'Welche Haltung ist abgebildet?' },
    { id: 'begriff', title: 'Kommandos & Begriffe', ask: 'Welcher Begriff passt zur Grafik?' },
  ];

  const keyed = (key, fn) => Object.assign(fn, { key });
  const st = (key, mirrored) => keyed(`st:${key}${mirrored ? ':m' : ''}`, () => G.stanceSvg(key, mirrored));
  // Mit 3D-Figur gibt es keine SVG-Grafik: G.byKey liefert dann ''
  const byKey = (key) => keyed(key, () => G.byKey(key));
  const mv = (key) => byKey(`mv:${key}`);
  const wp = (key) => byKey(`wp:${key}`);
  const tc = (key) => byKey(`tc:${key}`);
  const as = (key) => byKey(`as:${key}`);

  // [Begriff, Bedeutung, Kategorie, Grafik?, Quelle?]
  const E = [
    ['Musubi-dachi', 'Grußstand: Fersen zusammen, Fußspitzen V-förmig geöffnet', 'stand', st('musubi')],
    ['Heisoku-dachi', 'Geschlossener Stand: Füße parallel und geschlossen', 'stand', st('heisoku')],
    ['Hachiji-dachi', 'Natürlicher Stand: Füße schulterbreit, Fußspitzen leicht nach außen', 'stand', st('hachiji')],
    ['Zenkutsu-dachi', 'Vorwärtsstellung: vorderes Knie gebeugt, hinteres Bein gestreckt, Gewicht vorne', 'stand', st('zenkutsu')],
    ['Kokutsu-dachi', 'Rückwärtsstellung: Gewicht überwiegend auf dem hinteren Bein, hinterer Fuß quer', 'stand', st('kokutsu')],
    ['Kiba-dachi', 'Reiterstellung: breit, Zehen leicht nach innen, die Knie drücken nach außen und stehen über den Zehen, Oberschenkel innen angespannt, Rücken gerade, Gewicht gleich verteilt', 'stand', st('kiba')],
    ['Kosa-dachi', 'Kreuzstand: Beine gekreuzt, hinterer Fuß hinter der vorderen Ferse', 'stand', st('kosa')],
    ['Neko-ashi-dachi', 'Katzenfußstand: fast das gesamte Gewicht auf dem hinteren Bein', 'stand', st('neko')],
    ['Fudo-dachi', 'Unbeweglicher Stand: beide Knie gebeugt, Gewicht ausgeglichen (auch Sochin-dachi)', 'stand', st('fudo')],
    ['Hangetsu-dachi', 'Halbmondstand: etwas kürzer als Zenkutsu-dachi, Knie und Oberschenkelinnenseiten zur Mitte gespannt, länger als Sanchin-dachi', 'stand', st('hangetsu'), PDF2(41)],
    ['Sanchin-dachi', 'Sanduhrstand: kurz (vordere Ferse etwa auf Höhe der hinteren Zehen), etwa schulterbreit, vorderer Fuß stark nach innen gedreht, Knie nach innen gespannt, Gewicht mittig', 'stand', st('sanchin')],
    ['Renoji-dachi', 'L-förmiger Stand', 'stand', st('renoji')],
    ['Teiji-dachi', 'T-förmiger Stand', 'stand', st('teiji')],
    ['Ashi-zenkutsu', 'Kleiner Zenkutsu-dachi (kürzer und schmaler), z. B. in Gyaku-hanmi', 'stand', st('ashizenkutsu'), PDF(4)],
    ['Hizakutsu', 'Knie gebeugt, Technikrichtung anders als die Richtung des Zenkutsu-dachi', 'stand', st('hizakutsu'), PDF(4)],
    ['Ashi-dachi', 'Einbeinstand: Stand auf einem Bein, das andere ist angehoben', 'stand', st('ashidachi'), PDF(19)],
    ['Orishiki', 'Knien auf einem Bein, das andere Knie ist aufgestellt', 'stand', st('orishiki'), PDF(156)],

    ['Choku-zuki', 'Gerader Fauststoß im Stand', 'tsuki', tc('choku-zuki')],
    ['Oi-zuki', 'Fauststoß mit der Hand der Seite des vorderen Beins (auch Jun-zuki)', 'tsuki', mv('oi-zuki'), PDF(4)],
    ['Gyaku-zuki', 'Fauststoß mit der Hand der Gegenseite zum vorderen Bein, mit Hüftdrehung', 'tsuki', mv('gyaku-zuki'), PDF(4)],
    ['Kizami-zuki', 'Fauststoß mit der vorderen Hand ohne Schritt', 'tsuki', tc('kizami-zuki')],
    ['Sanbon-zuki', 'Drei Fauststöße hintereinander (DJKB: Jodan/Chudan/Chudan)', 'tsuki', tc('sanbon-zuki'), PO],
    ['Ren-zuki', 'Schnelle Folge von Fauststößen', 'tsuki', tc('ren-zuki')],
    ['Morote-zuki', 'Doppelfauststoß mit beiden Fäusten', 'tsuki', tc('morote-zuki'), KO],
    ['Kagi-zuki', 'Hakenfauststoß – Unterarm vor dem Solarplexus', 'tsuki', tc('kagi-zuki'), PDF(68)],
    ['Ura-zuki', 'Kurzer Fauststoß mit dem Handrücken nach unten', 'tsuki', tc('ura-zuki'), PDF(94)],
    ['Age-zuki', 'Aufwärts gerichteter Fauststoß (z. B. zum Kinn)', 'tsuki', tc('age-zuki'), PDF(158)],
    ['Yama-zuki', '„Bergfauststoß“: beide Fäuste gleichzeitig, eine Jodan, eine Gedan', 'tsuki', tc('yama-zuki'), PDF(94)],
    ['Otoshi-zuki', 'Fauststoß nach unten', 'tsuki', tc('otoshi-zuki'), PDF(127)],
    ['Nukite', 'Speerhand-Stoß mit den Fingerspitzen (Shihon-nukite = Tate-nukite)', 'tsuki', tc('nukite'), PDF(21)],
    ['Tate-zuki', 'Fauststoß mit senkrechter Faust (Daumen oben) auf dem kürzesten, geraden Weg', 'tsuki', tc('tate-zuki'), KO],
    ['Mawashi-zuki', 'Fauststoß im Bogen von außen zum Ziel, z. B. Schläfe oder seitliche Rippen', 'tsuki', tc('mawashi-zuki'), KO],
    ['Awase-zuki', 'U-förmiger Doppelstoß: oben Jodan, unten Ura-zuki – engere Form des Yama-zuki, Oberkörper aufrecht', 'tsuki', tc('awase-zuki'), KO],

    ['Uraken-uchi', 'Schlag mit dem Faustrücken', 'uchi', tc('uraken-uchi')],
    ['Tettsui-uchi', 'Hammerfaustschlag (auch Kentsui-uchi)', 'uchi', tc('tettsui-uchi')],
    ['Shuto-uchi', 'Handkantenschlag', 'uchi', tc('shuto-uchi')],
    ['Haito-uchi', 'Schlag mit der inneren Handkante (Daumenseite)', 'uchi', tc('haito-uchi')],
    ['Hasami-uchi', 'Zangenschlag mit beiden Fäusten zu beiden Seiten', 'uchi', tc('hasami-uchi'), PDF(90)],
    ['Teisho-uchi', 'Schlag mit dem Handballen', 'uchi', tc('teisho-uchi')],
    ['Mae-enpi', 'Ellbogenschlag nach vorne: Ellbogen dicht am Körper auf gerader Linie zum Ziel, die Faust geht über den Bauch zur anderen Seite', 'uchi', tc('enpi-uchi'), KO],
    ['Furi-enpi', 'Schwingender Ellbogenschlag zur Seite', 'uchi', tc('furi-enpi'), PDF(35)],
    ['Ushiro-enpi', 'Ellbogenstoß nach hinten', 'uchi', tc('ushiro-enpi'), PDF(37)],
    ['Yoko-enpi', 'Ellbogenstoß zur Seite, meist in Kiba-dachi', 'uchi', tc('yoko-enpi'), KO],
    ['Mawashi-enpi', 'Ellbogenschlag im großen waagerechten Bogen von außen zur Körpermitte, ohne Kontakt zum Körper, mit kräftiger Hüftdrehung', 'uchi', tc('mawashi-enpi'), KO],
    ['Age-enpi', 'Ellbogenschlag senkrecht nach oben, dicht am Körper (auch Tate-enpi)', 'uchi', tc('age-enpi'), KO],
    ['Otoshi-enpi', 'Ellbogenschlag senkrecht nach unten, z. B. in Kiba- oder Fudo-dachi', 'uchi', tc('otoshi-enpi'), KO],

    ['Gedan-barai', 'Abwehr nach unten (fegend)', 'uke', mv('gedan-barai')],
    ['Age-uke', 'Abwehr nach oben (Jodan)', 'uke', mv('age-uke')],
    ['Soto-uke', 'Abwehr von außen nach innen mit der Innenseite des Unterarms', 'uke', mv('soto-uke'), PDF(4)],
    ['Uchi-uke', 'Abwehr von innen nach außen mit der Außenseite des Unterarms', 'uke', mv('uchi-uke'), PDF(4)],
    ['Shuto-uke', 'Handkantenabwehr, meist in Kokutsu-dachi', 'uke', tc('shuto-uke')],
    ['Morote-uke', 'Unterstützte Abwehr – zweite Faust am Ellbogen', 'uke', tc('morote-uke'), PDF(26)],
    ['Juji-uke', 'Gekreuzte Abwehr (auch Kosa-uke)', 'uke', tc('juji-uke'), PDF(41)],
    ['Manji-uke', 'Doppelabwehr: eine Hand wehrt unten ab (Gedan-barai), die andere schützt oben (Jodan-uchi-uke)', 'uke', tc('manji-uke'), KO],
    ['Kakiwake-uke', 'Abwehr, bei der beide Arme auseinanderdrücken', 'uke', tc('kakiwake-uke'), PDF(46)],
    ['Gedan-kakiwake', 'Beide Hände kreuzen vor dem Körper und gehen seitlich nach unten, Handrücken außen', 'uke', tc('gedan-kakiwake'), PDF2(45)],
    ['Nagashi-uke', 'Ablenkende Abwehr mit der offenen Hand: lenkt einen Jodan- oder Chudan-Angriff zur Seite ab', 'uke', tc('te-nagashi-uke'), KO],
    ['Soto-nagashi-uke', 'Ablenkende Abwehr Jodan: der senkrechte Unterarm schiebt den Angriff zur Seite weg', 'uke', tc('soto-nagashi-uke'), PDF(17)],
    ['Uchi-nagashi-uke', 'Ablenkende Abwehr Jodan von innen nach außen mit der Rückseite des Unterarms (Haiwan)', 'uke', tc('uchi-nagashi-uke'), PDF(69)],
    ['Gedan-nagashi-uke', 'Ablenkende Abwehr im unteren Bereich, in Gegenrichtung zum Gedan-barai', 'uke', tc('gedan-nagashi-uke'), KO],
    ['Osae-uke', 'Drückende Abwehr nach unten', 'uke', tc('osae-uke'), PDF(21)],
    ['Kake-uke', 'Hakenabwehr mit dem Handgelenk', 'uke', tc('kake-uke'), PDF(59)],
    ['Sukui-uke', 'Schöpfende Abwehr gegen einen Tritt', 'uke', tc('sukui-uke'), PDF(82)],
    ['Haiwan-uke', 'Abwehr mit der Rückseite des Unterarms', 'uke', tc('haiwan-uke'), PDF(17)],
    ['Tsukami-uke', 'Greifende Abwehr', 'uke', tc('tsukami-uke'), PDF(87)],
    ['Tate-shuto-uke', 'Abwehr mit senkrechter Handkante, Arm gestreckt', 'uke', tc('tate-shuto-uke'), PDF(83)],
    ['Teisho-uke', 'Abwehr mit dem Handballen', 'uke', tc('teisho-uke'), PDF(142)],
    ['Teisho Awase-uke', 'Abwehr mit beiden Handballen zusammen gegen das Schienbein eines Tritts', 'uke', tc('teisho-awase-uke'), PDF2(57)],
    ['Uchiotoshi', 'Unterarm schlägt einen Angriff nach unten', 'uke', tc('uchiotoshi'), PDF(150)],

    ['Mae-geri', 'Fußtritt nach vorne mit dem Fußballen', 'geri', mv('mae-geri')],
    ['Mae-geri-kekomi', 'Stoßtritt nach vorne mit Ferse oder Fußballen', 'geri', tc('mae-geri-kekomi'), KO],
    ['Yoko-geri-keage', 'Seitlicher Schnapptritt', 'geri', tc('yoko-geri-keage')],
    ['Yoko-geri-kekomi', 'Seitlicher Stoßtritt mit der Fußkante', 'geri', mv('yoko-geri')],
    ['Mawashi-geri', 'Halbkreisfußtritt', 'geri', mv('mawashi-geri')],
    ['Ushiro-geri', 'Fußtritt nach hinten mit der Ferse', 'geri', mv('ushiro-geri')],
    ['Mikazuki-geri', 'Sicheltritt', 'geri', mv('mikazuki-geri'), PDF(60)],
    ['Fumikomi', 'Stampftritt / Aufstampfen', 'geri', tc('fumikomi'), PDF(35)],
    ['Namigaeshi', '„Wellenrücklauf“: Fuß federnd hochziehen, fegender Block gegen einen Tritt', 'geri', tc('namigaeshi'), PDF(70)],
    ['Nidan-geri', 'Doppeltritt im Sprung', 'geri', tc('nidan-geri'), PDF(128)],
    ['Hiza-geri', 'Kniestoß', 'geri', tc('hiza-geri')],
    ['Ren-geri', 'Kombination mehrerer Fußtritte', 'geri', tc('ren-geri'), PO],
    ['Sonoba-geri', 'Fußtritte am Platz (Standübung)', 'geri', tc('sonoba-geri'), PO],
    ['Kizami-geri', 'Fußtritt mit dem vorderen Bein', 'geri', tc('kizami-geri'), PO],
    ['Ura-mawashi-geri', 'Halbkreistritt gegenläufig zum Mawashi-geri, trifft mit Sohle oder Ferse', 'geri', tc('ura-mawashi-geri'), KO],
    ['Ushiro-mawashi-geri', 'Ura-mawashi-geri aus einer Körperdrehung wie beim Ushiro-geri', 'geri', tc('ushiro-mawashi-geri'), KO],
    ['Mawashi-hiza-geri', 'Kniestoß im Bogen, waagerecht oder schräg zum Ziel', 'geri', tc('mawashi-hiza-geri'), KO],
    ['Ashi-barai', 'Fußfeger', 'geri', tc('ashi-barai'), PO],

    ['Ashi-sabaki', 'Fußarbeit: alle Schritte, mit denen man Distanz und Richtung ändert', 'ashi', null, KO],
    ['Ayumi-ashi', 'Normaler Schritt: der hintere Fuß wird zum vorderen (die Beine wechseln); bei Ständen mit Breite kommt er in der Schrittmitte zum Standbein (Bogen)', 'ashi', as('ayumi-ashi'), KO],
    ['Suri-ashi', 'Gleitschritt in zwei Teilen: erst gleitet der vordere Fuß vor (der Stand wird kurz länger), dann zieht der hintere nach – die Beinstellung bleibt; rückwärts gleitet der hintere Fuß zuerst', 'ashi', as('suri-ashi'), PO],
    ['Yori-ashi', 'Gleitschritt in einem Zug: der hintere Fuß stößt ab, beide Füße gleiten fast gleichzeitig – der Stand bleibt die ganze Zeit gleich lang', 'ashi', as('yori-ashi'), PDF(38)],
    ['Tai-sabaki', 'Körperausweichbewegung', 'ashi', as('tai-sabaki'), PO],


    ['Seiken', 'Faustvorderseite (Knöchel von Zeige- und Mittelfinger)', 'waffe', wp('seiken')],
    ['Uraken', 'Faustrücken', 'waffe', wp('uraken')],
    ['Tettsui', 'Hammerfaust – Kleinfingerseite der Faust (auch Kentsui)', 'waffe', wp('tettsui')],
    ['Shuto', 'Handkante (Kleinfingerseite der offenen Hand)', 'waffe', wp('shuto')],
    ['Haito', 'Innere Handkante (Daumenseite)', 'waffe', wp('haito')],
    ['Teisho', 'Handballen', 'waffe', wp('teisho')],
    ['Haishu', 'Handrücken der offenen Hand', 'waffe', wp('haishu'), PDF(67)],
    ['Jishi-ippon-ken', 'Faust mit vorstehendem Mittelgelenk des Zeigefingers – der halb gebeugte Zeigefinger wird vom Daumen gestützt', 'waffe', wp('jishi-ippon-ken'), PDF2(44)],
    ['Koko', '„Tigermaul“: Hand in C-Form – mit dem Raum zwischen Daumen und Zeigefinger greifen, z. B. das gegnerische Handgelenk', 'waffe', wp('koko'), PDF2(46)],
    ['Hiji / Enpi', 'Ellbogen', 'waffe', wp('hiji')],
    ['Hiza', 'Knie', 'waffe', wp('hiza')],
    ['Zenwan', 'Unterarm – der ganze Bereich zwischen Handgelenk und Ellbogen; Oberbegriff in Technik- und Haltungsnamen (z. B. Zenwan Mizunagare-no-kamae in Heian Godan)', 'waffe', wp('zenwan')],
    ['Haiwan', 'Unterarmrücken – die Außenseite des Unterarms, auf der Seite des Handrückens (Haishu); die genaue Abwehrfläche, z. B. beim Haiwan Yoko-uke in Heian Nidan', 'waffe', wp('haiwan'), PDF(17)],
    ['Koshi (Josokutei)', 'Fußballen', 'waffe', wp('koshi'), PDF(24)],
    ['Sokuto', 'Fußkante (Außenkante)', 'waffe', wp('sokuto')],
    ['Kakato', 'Ferse', 'waffe', wp('kakato')],
    ['Haisoku', 'Fußrücken / Spann', 'waffe', wp('haisoku')],

    ['Chudan-kamae', 'Kampfhaltung mit den Händen auf mittlerer Höhe', 'kamae', tc('chudan-kamae'), PO],
    ['Gedan-kamae', 'Kampfhaltung mit der vorderen Hand in Gedan-barai-Position', 'kamae', tc('gedan-kamae'), PO],
    ['Shuto-kamae', 'Kampfhaltung mit Handkanten (wie Shuto-uke)', 'kamae', tc('shuto-kamae'), PO],
    ['Koshi-kamae', 'Beide Fäuste an der Hüfte übereinander (Ryoken Koshi-kamae)', 'kamae', tc('koshi-kamae'), PDF(19)],
    ['Mizunagare-no-kamae', '„Wasserfluss-Haltung“: Unterarm schräg vor dem Solarplexus, etwa zwei Fäuste entfernt', 'kamae', tc('mizunagare-no-kamae'), PDF(55)],
    ['Hanmi', 'Halbseitliche Körperhaltung (Oberkörper etwa 45° gedreht)', 'kamae', tc('hanmi'), PO],
    ['Kaisho Yama-gamae', '„Berghaltung“ mit offenen Händen: Unterarme senkrecht neben dem Gesicht, Ellbogen auf Schulterhöhe', 'kamae', tc('yama-gamae'), PDF2(45)],
    ['Gyaku-hanmi', 'Umgekehrt halbseitliche Körperhaltung', 'kamae', tc('gyaku-hanmi'), PDF(24)],
    ['Shizentai', 'Natürliche Haltung', 'kamae', tc('shizentai'), PO],

    ['Te', 'Hand', 'begriff'],
    ['Do', 'Weg', 'begriff'],
    ['Dojo', 'Ort des Weges – der Übungsraum', 'begriff', null, PO],
    ['Sensei', 'Lehrer', 'begriff'],
    ['Senpai', 'Fortgeschrittener, älterer Schüler', 'begriff'],
    ['Kohai', 'Jüngerer Schüler, Anfänger', 'begriff'],
    ['Yoi', 'Bereit – Bereitschaftsstellung', 'begriff'],
    ['Hajime', 'Beginnen', 'begriff'],
    ['Yame', 'Aufhören', 'begriff'],
    ['Naore', 'Zurück in die Ausgangsstellung', 'begriff'],
    ['Mawatte', 'Wenden', 'begriff'],
    ['Rei', 'Gruß / Verbeugung', 'begriff'],
    ['Shomen ni rei', 'Gruß nach vorne, zur Stirnseite des Dojo', 'begriff', null, PO],
    ['Sensei ni rei', 'Gruß an den Lehrer', 'begriff', null, PO],
    ['Otagai ni rei', 'Gruß untereinander', 'begriff'],
    ['Seiza', 'Kniender Fersensitz', 'begriff', null, PO],
    ['Mokuso', 'Augen schließen, meditieren', 'begriff', null, PO],
    ['Mokuso yame', 'Meditation beenden', 'begriff', null, PO],
    ['Kiritsu', 'Aufstehen', 'begriff', null, PO],
    ['Kiai', 'Kampfschrei', 'begriff', null, PO],
    ['Kime', 'Konzentration aller Kraft im Treffmoment', 'begriff', null, PO],
    ['Zanshin', 'Wache Aufmerksamkeit nach der Technik', 'begriff', null, PO],
    ['Tanden', 'Körpermitte etwa drei Finger breit unter dem Nabel (auch Seika-tanden oder Hara): Schwerpunkt des Körpers – von hier aus arbeitet die Hüfte, und die Kraft jeder Technik geht über sie vom Boden ins Ziel', 'begriff', null, ALLG],
    ['Maai', 'Kampfdistanz', 'begriff', null, PO],
    ['Deai', 'Kontern im Moment des gegnerischen Angriffs', 'begriff', null, PO],
    ['Kogeki', 'Angriff – im Dojo auch der Angreifer (Gegenstück zu Uke, dem Abwehrenden)', 'begriff', null, PO],
    ['Uke', 'Abwehr – auch der Abwehrende (Gegenstück zu Kogeki, dem Angreifer)', 'begriff', null, PO],
    ['Kime-waza', 'Entscheidende Technik: der Konter (Gegenangriff) nach der Abwehr – blitzschnell und mit voller Kraft (Kime) ins gewählte Ziel', 'begriff', null, PO],
    ['Waza', 'Technik (als Wortteil, z. B. Kime-waza: entscheidende Technik)', 'begriff'],
    ['Sun-dome', 'Technik kurz vor dem Ziel abstoppen', 'begriff', null, PO],
    ['Shiai', 'Wettkampf', 'begriff'],
    ['Enbusen', 'Bewegungslinie einer Kata', 'begriff', null, PDF(4)],
    ['Shomen', 'Frontal – Oberkörper gerade nach vorn (Gegenstück zu Hanmi); auch die Vorderseite', 'begriff'],
    ['Kamae', 'Kampfhaltung (Oberbegriff, z. B. Chudan-, Gedan-, Shuto-Kamae)', 'begriff'],
    ['Hikite', 'Zurückziehende Hand: sie zieht beim Stoß oder bei der Abwehr zur Hüfte zurück', 'begriff', null, PO],
    ['Ura-shomen', 'Rückseite – die Richtung entgegengesetzt zur Vorderseite (Shomen)', 'begriff', null, PDF2(45)],
    ['Bunkai', 'Anwendung / Analyse der Kata-Techniken', 'begriff'],
    ['Hidari', 'Links – vor dem Stand: das linke Bein steht vorn (Kokutsu-dachi: trägt das Gewicht); vor der Technik: der linke Arm bzw. das linke Bein', 'begriff', null, PDF(6)],
    ['Migi', 'Rechts – vor dem Stand: das rechte Bein steht vorn (Kokutsu-dachi: trägt das Gewicht); vor der Technik: der rechte Arm bzw. das rechte Bein', 'begriff', null, PDF(6)],
    ['Sokumen', 'Seite – die Technik geht zur Seite (z. B. Hidari Sokumen: zur linken Seite)', 'begriff', null, PDF(6)],
    ['Saken', 'Linke Faust (gleiches Schriftzeichen wie Hidari, anders gelesen)', 'begriff', null, PDF(18)],
    ['Uken', 'Rechte Faust (gleiches Schriftzeichen wie Migi, anders gelesen)', 'begriff', null, PDF(19)],
  ];

  // Erstes Vorkommen in den Kata des Buches (Reihenfolge SK.kataOrder), nur wo das Buch die Technik beim Namen nennt.
  // [Kata, Bewegung, Name im Buch (falls anders), Anmerkung, Prüfwort] – validate.js prüft, dass die Bewegung den Namen
  // enthält und keine frühere Bewegung ihn schon hat (außer mit eigenem Prüfwort).
  // Die Karte zeigt kein eigenes „Zuerst in“ mehr: die Stelle steht in „Kommt vor in …“ (SK.glossaryVorkommen) – auch dort,
  // wo das Buch die Technik anders nennt und die Erkennung sie nicht findet (Gyaku-zuki in Heian Nidan 18). Der Name im
  // Buch dient weiter als Zweitname und Suchwort; die Anmerkung ist nur ein Hinweis für die Pflege.
  const ERST = {
    'Heisoku-dachi': ['heian-sandan', 2],
    'Hachiji-dachi': ['bassai-dai', 8],
    'Zenkutsu-dachi': ['heian-shodan', 1],
    'Kokutsu-dachi': ['heian-shodan', 18],
    'Kiba-dachi': ['heian-sandan', 9],
    'Kosa-dachi': ['heian-yondan', 13],
    'Fudo-dachi': ['enpi', 35],
    'Renoji-dachi': ['heian-godan', 18],
    'Ashi-zenkutsu': ['heian-nidan', 16],
    'Hizakutsu': ['heian-yondan', 11],
    'Ashi-dachi': ['heian-nidan', 7],
    'Orishiki': ['enpi', 1],
    'Hangetsu-dachi': ['hangetsu', 1],
    'Neko-ashi-dachi': ['hangetsu', 41],

    'Oi-zuki': ['heian-shodan', 2],
    'Gyaku-zuki': ['heian-nidan', 18, '', 'im Buch: Saken Chudan-zuki', 'Saken Chudan-zuki'],
    'Kagi-zuki': ['tekki-shodan', 6],
    'Ura-zuki': ['kanku-dai', 42],
    'Age-zuki': ['enpi', 6],
    'Yama-zuki': ['bassai-dai', 33],
    'Otoshi-zuki': ['kanku-dai', 61],
    'Nukite': ['heian-nidan', 11, 'Shihon-nukite'],
    'Morote-zuki': ['hangetsu', 8, 'Jishi-ippon-ken Morote-zuki'],
    'Ren-zuki': ['heian-yondan', 17, '', 'mit 16'],

    'Uraken-uchi': ['heian-nidan', 7, 'Uraken Yoko-mawashi-uchi'],
    'Tettsui-uchi': ['heian-shodan', 4, 'Kentsui Tate-mawashi-uchi'],
    'Shuto-uchi': ['heian-yondan', 11, 'Shuto Soto-mawashi-uchi'],
    'Mae-enpi': ['heian-yondan', 7],
    'Furi-enpi': ['heian-sandan', 12],
    'Ushiro-enpi': ['heian-sandan', 19],
    'Hasami-uchi': ['bassai-dai', 23],

    'Gedan-barai': ['heian-shodan', 1],
    'Age-uke': ['heian-shodan', 7],
    'Soto-uke': ['bassai-dai', 4],
    'Uchi-uke': ['heian-nidan', 16],
    'Shuto-uke': ['heian-shodan', 18, 'Shuto Chudan-uke'],
    'Morote-uke': ['heian-nidan', 22],
    'Juji-uke': ['heian-yondan', 3, 'Kosa-uke'],
    'Kakiwake-uke': ['heian-yondan', 14],
    'Soto-nagashi-uke': ['heian-nidan', 2],
    'Uchi-nagashi-uke': ['tekki-shodan', 9, '', 'Teil 1'],
    'Nagashi-uke': ['heian-godan', 21, 'Sasho Jodan Nagashi-uke', 'Teil 1', 'Sasho Jodan Nagashi-uke'],
    'Osae-uke': ['heian-nidan', 11],
    'Kake-uke': ['heian-godan', 14],
    'Sukui-uke': ['bassai-dai', 6, '', 'als Zwischentechnik davor'],
    'Haiwan-uke': ['heian-nidan', 1, 'Haiwan Yoko-uke'],
    'Tsukami-uke': ['bassai-dai', 18],
    'Tate-shuto-uke': ['bassai-dai', 9, 'Tate-shuto Chudan-uke'],
    'Teisho-uke': ['jion', 23, 'Teisho Yoko-uke'],
    'Gedan-kakiwake': ['jion', 30, 'Ryoken Ryogawa Gedan-kakiwake', 'dort mit beiden Fäusten'],
    'Teisho Awase-uke': ['hangetsu', 41, 'Ryo-teisho Gedan Awase-uke'],
    'Jishi-ippon-ken': ['hangetsu', 7],
    'Koko': ['hangetsu', 12],
    'Kaisho Yama-gamae': ['hangetsu', 9],
    'Ura-shomen': ['hangetsu', 11],
    'Uchiotoshi': ['jion', 43],

    'Mae-geri': ['heian-nidan', 17, 'Mae-geri-keage'],
    'Yoko-geri-keage': ['heian-nidan', 7],
    'Yoko-geri-kekomi': ['bassai-dai', 19, 'Sokuto Gedan-kekomi'],
    'Mikazuki-geri': ['heian-godan', 15],
    'Fumikomi': ['heian-sandan', 12],
    'Namigaeshi': ['tekki-shodan', 11],
    'Nidan-geri': ['kanku-dai', 65],
    'Hiza-geri': ['heian-yondan', 25, 'Hiza-tsuchi'],
  };

  // Quiz-Fassung der Bedeutung, wo die Lexikon-Bedeutung den Namen (oder ein Namensteil) verrät –
  // „Wie heißt: …?“ und die Antworten zu „Was ist …?“ nutzen diesen Text. validate.js prüft das.
  const QUIZ = {
    'Kogeki': 'Angriff – im Dojo auch der Angreifer, Gegenstück zum Abwehrenden',
    'Uke': 'Abwehr – auch der Abwehrende, Gegenstück zum Angreifer',
    'Kime-waza': 'Entscheidende Technik: der Konter nach der Abwehr, blitzschnell und mit voller Kraft ins gewählte Ziel',
    'Waza': 'Technik (als Wortteil in vielen Begriffen)',
    'Tanden': 'Körpermitte etwa drei Finger breit unter dem Nabel: Schwerpunkt des Körpers, von hier aus arbeitet die Hüfte',
    'Haiwan': 'Unterarmrücken – die Außenseite des Unterarms, auf der Seite des Handrückens',
    'Zenwan': 'Unterarm – der ganze Bereich zwischen Handgelenk und Ellbogen',
    'Ashi-zenkutsu': 'Kleine Vorwärtsstellung (kürzer und schmaler), z. B. in Gyaku-hanmi',
    'Nukite': 'Speerhand-Stoß mit den Fingerspitzen',
    'Tettsui-uchi': 'Hammerfaustschlag',
    'Age-enpi': 'Ellbogenschlag senkrecht nach oben, dicht am Körper',
    'Gedan-nagashi-uke': 'Ablenkende Abwehr im unteren Bereich, entgegen der Richtung der fegenden Abwehr nach unten',
    'Ura-mawashi-geri': 'Halbkreistritt gegenläufig zum gewöhnlichen Halbkreistritt, trifft mit Sohle oder Ferse',
    'Ushiro-mawashi-geri': 'Gegenläufiger Halbkreistritt aus einer Körperdrehung wie beim Fußtritt nach hinten',
    'Gedan-kamae': 'Kampfhaltung mit der vorderen Hand unten, wie nach einer fegenden Abwehr nach unten',
    'Shuto-kamae': 'Kampfhaltung mit offenen Händen, Handkanten nach vorn (wie bei der Handkantenabwehr)',
    'Koshi-kamae': 'Beide Fäuste an der Hüfte übereinander',
    'Ura-shomen': 'Richtung nach hinten, entgegengesetzt zur Vorderseite der Kata',
    'Kaisho Yama-gamae': 'Haltung mit offenen Händen: Unterarme senkrecht neben dem Gesicht, Ellbogen auf Schulterhöhe',
    'Hidari': 'Links',
    'Migi': 'Rechts',
    'Sokumen': 'Seite – die Technik geht zur Seite',
    'Saken': 'Linke Faust',
    'Uken': 'Rechte Faust',
  };
  // Seitenangaben stehen in fast jeder Bewegung: im Kata-Trainer nicht antippbar, auf der Karte kein „Kommt vor in …“
  const OHNE_STELLEN = new Set(['Hidari', 'Migi', 'Sokumen', 'Saken', 'Uken']);

  // Aussprache: Lesung je Wortteil in Hiragana (mit den langen Vokalen, die die lateinische Schreibweise der App weglässt:
  // Jodan = じょうだん). Die japanische Stimme liest lateinische Schrift nicht als Japanisch – sie bekommt diese Lesung.
  // Aus den Wortteilen entsteht die Lesung des ganzen Begriffs (kana am Eintrag); validate.js prüft, dass kein Wortteil fehlt.
  const LESUNG = {
    age: 'あげ', ashi: 'あし', awase: 'あわせ', ayumi: 'あゆみ', barai: 'ばらい', bunkai: 'ぶんかい', choku: 'ちょく', chudan: 'ちゅうだん',
    dachi: 'だち', deai: 'であい', do: 'どう', dojo: 'どうじょう', dome: 'どめ', enbusen: 'えんぶせん', enpi: 'えんぴ', fudo: 'ふどう', fumikae: 'ふみかえ', fumikomi: 'ふみこみ',
    furi: 'ふり', gamae: 'がまえ', gedan: 'げだん', geri: 'げり', gyaku: 'ぎゃく', hachiji: 'はちじ', haishu: 'はいしゅ', haisoku: 'はいそく',
    haito: 'はいとう', haiwan: 'はいわん', hajime: 'はじめ', hangetsu: 'はんげつ', hanmi: 'はんみ', hasami: 'はさみ', heisoku: 'へいそく', hidari: 'ひだり',
    hiji: 'ひじ', hikite: 'ひきて', hiza: 'ひざ', hizakutsu: 'ひざくつ', ippon: 'いっぽん', jishi: 'じし', josokutei: 'じょうそくてい',
    juji: 'じゅうじ', kagi: 'かぎ', kaisho: 'かいしょう', kakato: 'かかと', kake: 'かけ', kakiwake: 'かきわけ', kamae: 'かまえ', keage: 'けあげ',
    kekomi: 'けこみ', ken: 'けん', kiai: 'きあい', kiba: 'きば', kime: 'きめ', kiritsu: 'きりつ', kizami: 'きざみ', kohai: 'こうはい', kogeki: 'こうげき',
    koko: 'ここう', kokutsu: 'こうくつ', komura: 'こむら', kosa: 'こうさ', koshi: 'こし', maai: 'まあい', mae: 'まえ', manji: 'まんじ',
    mawashi: 'まわし', mawatte: 'まわって', migi: 'みぎ', mikazuki: 'みかづき', mizunagare: 'みずながれ', mokuso: 'もくそう', morote: 'もろて',
    musubi: 'むすび', nagashi: 'ながし', namigaeshi: 'なみがえし', naore: 'なおれ', neko: 'ねこ', nidan: 'にだん', ni: 'に', no: 'の', nukite: 'ぬきて',
    oi: 'おい', okuri: 'おくり', otagai: 'おたがい', orishiki: 'おりしき', osae: 'おさえ', otoshi: 'おとし', rei: 'れい', ren: 'れん', renoji: 'れのじ',
    sabaki: 'さばき', saken: 'さけん', sanbon: 'さんぼん', sanchin: 'さんちん', sashi: 'さし', seiken: 'せいけん', seiza: 'せいざ', sensei: 'せんせい', senpai: 'せんぱい', shaho: 'しゃほう', shiai: 'しあい',
    shizentai: 'しぜんたい', shomen: 'しょうめん', te: 'て', shuto: 'しゅとう', sokumen: 'そくめん', sokuto: 'そくとう', sonoba: 'そのば', soto: 'そと', sukui: 'すくい',
    sun: 'すん', suri: 'すり', tai: 'たい', tanden: 'たんでん', tate: 'たて', teiji: 'ていじ', teisho: 'ていしょう', teisoku: 'ていそく', tettsui: 'てっつい',
    tsugi: 'つぎ', tsukami: 'つかみ', uchi: 'うち', uchiotoshi: 'うちおとし', uke: 'うけ', uken: 'うけん', ura: 'うら', uraken: 'うらけん', ushiro: 'うしろ',
    yama: 'やま', yame: 'やめ', waza: 'わざ', yoi: 'ようい', yoko: 'よこ', yori: 'より', zanshin: 'ざんしん', zenkutsu: 'ぜんくつ', zenwan: 'ぜんわん',
    zuki: 'づき',
  };
  // Deutsche Zusätze im Namen und Klammern („Koshi (Josokutei)“) spricht
  // die Stimme nicht; „Hiji / Enpi“ nennt beide Namen mit kurzer Pause. Fehlt ein Wortteil, gibt es keine Aussprache ('').
  const DEUTSCH = new Set(['auf', 'einer', 'linie']);
  function kana(t) {
    const names = t.replace(/\([^)]*\)/g, '').split(' / ').map((name) => {
      const words = name.toLowerCase().split(/[^a-z]+/).filter((w) => w && !DEUTSCH.has(w));
      return words.every((w) => LESUNG[w]) ? words.map((w) => LESUNG[w]).join('') : '';
    });
    return names.every(Boolean) ? names.join('、') : '';
  }

  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  // Kennung eines Begriffs: Gruppe seiner Fragen im Begriffe-Trainer (gl-…-a „Was ist …?“, gl-…-b „Wie heißt …?“)
  SK.glossaryId = (e) => `gl-${slug(e.t)}`;

  SK.glossary = E.map(([t, de, cat, img, src]) => {
    const e = { t, de, qde: QUIZ[t] || de, cat, img: img || null, src: src || ALLG, kana: kana(t) };
    if (OHNE_STELLEN.has(t)) e.ohneStellen = true;
    const z = ERST[t];
    if (z) e.erst = { kata: z[0], n: z[1], buch: z[2] || '', wort: z[4] || '' };
    return e;
  });
  SK.glossaryErst = ERST;

  // Alle Stellen eines Begriffs in den Kata: Bewegungen, in denen der Kata-Trainer den Begriff in Stand, Technik oder
  // Hinweis erkennt (SK.lexParts – dort ist er auch antippbar), dazu das erste Vorkommen aus ERST (dessen Name im Buch
  // manchmal anders lautet). Map Begriff → [{ k: Kata, ns: [Bewegungen] }] in der Reihenfolge der Kata, einmal gerechnet.
  // Techniken, die das Buch nicht beim Namen nennt, sondern als Kombination beschreibt (der Name stammt aus dem Heft
  // „Karate kompakt“): Muster für den Techniktext einer Bewegung. Manji-uke = Jodan Uchi-uke zur einen und Gedan-uke
  // zur anderen Seite (Heian Godan 21 und 23, Bassai Dai 25, Kanku Dai 18 und 23, Jion 18, 20, 26, 28).
  const MUSTER = { 'Manji-uke': /^\S+ Sokumen Jodan Uchi-uke \+ \S+ Sokumen Gedan-uke$/ };
  SK.glossaryMuster = MUSTER;
  let vorkommen = null;
  SK.glossaryVorkommen = function (e) {
    if (!vorkommen) {
      vorkommen = new Map();
      const add = (t, id, n) => {
        if (!vorkommen.has(t)) vorkommen.set(t, new Map());
        const m = vorkommen.get(t);
        if (!m.has(id)) m.set(id, new Set());
        m.get(id).add(n);
      };
      if (SK.lexParts && SK.kataOrder) {
        SK.kataOrder.forEach((id) => {
          const k = SK.kata[id];
          if (!k || !k.ansage) return;
          k.seq.forEach((r) => {
            [r[1], `${r[2]}${r[4] ? ` · ${r[4]}` : ''}`].forEach((txt) => SK.lexParts(txt).forEach((p) => p.e && add(p.e.t, id, r[0])));
            Object.entries(MUSTER).forEach(([t, re]) => re.test(r[2]) && add(t, id, r[0]));
          });
        });
        SK.glossary.forEach((g) => g.erst && SK.kata[g.erst.kata] && SK.kata[g.erst.kata].ansage && add(g.t, g.erst.kata, g.erst.n));
      }
    }
    const m = vorkommen.get(e.t);
    if (!m) return [];
    return SK.kataOrder.filter((id) => m.has(id)).map((id) => ({ k: SK.kata[id], ns: [...m.get(id)].sort((a, b) => a - b) }));
  };
  // Aufklappbare Liste unten auf der Karte; aufeinanderfolgende Bewegungen als Bereich („3–6“). Jede Stelle führt
  // in den Kata-Trainer zu dieser Bewegung.
  // Körperwaffen zeigen keine Stellen: ihre Karten sind einheitlich (Name, Bedeutung, gezeichnetes Bild)
  function vorHtml(e) {
    if (e.cat === 'waffe') return '';
    const list = SK.glossaryVorkommen(e);
    if (!list.length) return '';
    const total = list.reduce((s, x) => s + x.ns.length, 0);
    const rows = list.map(({ k, ns }) => {
      const runs = [];
      ns.forEach((n) => {
        const last = runs[runs.length - 1];
        if (last && last[1] === n - 1) last[1] = n;
        else runs.push([n, n]);
      });
      const links = runs.map(([a, b]) => `<a href="#/ansage/${k.id}/${a}" aria-label="${SK.util.esc(k.name)}, Bewegung ${a}${b > a ? ` bis ${b}` : ''} im Kata-Trainer">${a}${b > a ? `–${b}` : ''}</a>`);
      return `<li><span class="lex-vor-k">${SK.util.esc(k.name)}</span> <span class="lex-vor-n">${links.join(' ')}</span></li>`;
    });
    return `<details class="lex-vor"><summary>Kommt vor in ${list.length === 1 ? '1 Kata' : `${list.length} Kata`} <span class="muted">(${total === 1 ? '1 Bewegung' : `${total} Bewegungen`})</span></summary><ul>${rows.join('')}</ul><p class="muted small">Zahl antippen: Kata-Trainer öffnet bei dieser Bewegung.</p></details>`;
  }
  // Knopf „Aussprache“: die japanische Stimme liest die Lesung vor. Sichtbar nur, wenn das Gerät eine japanische Stimme hat
  // (Klasse ja-stimme am html-Element, js/kata-ansage.js); den Klick bedient js/app.js.
  SK.glossarySagHtml = (e) =>
    e.kana ? `<button type="button" class="lex-sag" data-kana="${SK.util.esc(e.kana)}" aria-label="Aussprache von ${SK.util.esc(e.t)} anhören" title="Aussprache anhören"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4Z"/><path class="lex-sag-w" d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11"/></svg></button>` : '';

  // Anderer Name im Buch – nur zeigen, wenn er nicht bloß der eigene Name mit Zusätzen ist
  // („Shuto Chudan-uke“ zu „Shuto-uke“ nein, „Kosa-uke“ zu „Juji-uke“ ja). „-uchi“ zählt dabei nicht.
  // Abweichende Anzeige: kürzerer anderer Name oder gar keiner ('')
  // Zweiter Name einer Karte in Klammern im Titel (Buchname mit Name aus dem Heft, z. B. Nagashi-uke (Te-nagashi));
  // der Kata-Trainer verlinkt auch diesen Namen auf die Karte (über SK.glossaryAlt, wie die abweichenden Buchnamen)
  const FORM = { 'Nagashi-uke': 'Te-nagashi' };
  const ANDERS = { 'Tettsui-uchi': 'Kentsui-uchi', 'Yoko-geri-kekomi': '', ...FORM };
  function altName(e) {
    if (e.t in ANDERS) return ANDERS[e.t];
    const b = e.erst && e.erst.buch;
    if (!b) return '';
    const words = (x) => x.toLowerCase().split(/[^a-z]+/).filter(Boolean);
    const bw = words(b);
    return words(e.t).filter((w) => w !== 'uchi').every((w) => bw.includes(w)) ? '' : b;
  }

  SK.glossaryAlt = altName;

  SK.buildGlossaryContent = function () {
    const unit = { id: 'begriffe-trainer', title: 'Begriffe', kind: 'drill', desc: 'Stände, Techniken & Begriffe – kurz abgefragt', lessons: [] };
    SK.glossaryCats.forEach((c) => {
      const items = SK.glossary.filter((e) => e.cat === c.id);
      const lid = `gl-${c.id}`;
      unit.lessons.push(SK.util.lazy({ id: lid, title: c.title }, 'learn', () => SK.glossaryHtml(items)));
      // Quizbilder ohne Beschriftung (würde die Antwort verraten). Mit 3D-Figur zeigt die Frage sie (q.gfx, kein q.img),
      // sonst das SVG-Bild (q.img), bei Bewegungen mit Animation per Knopf (q.gfx).
      // Bilder erst erzeugen, wenn eine Frage sie zeigt – gleicher Grafik-Schlüssel = gleiches Bild.
      const uris = new Map();
      const uri = (e) => () => {
        if (!uris.has(e.img.key)) uris.set(e.img.key, G.dataUri(G.plainSvg(e.img)));
        return uris.get(e.img.key);
      };
      items.forEach((e) => {
        const others = items.filter((o) => o !== e);
        const pick = (field) => SK.util.shuffle(others.map((o) => o[field]).filter((v, i, a) => v !== e[field] && a.indexOf(v) === i)).slice(0, 3);
        const id = SK.glossaryId(e);
        const base = { lesson: lid, grp: id, type: 'mc', answer: 0, src: e.src };
        const own = !!e.img && !others.some((o) => o.img && o.img.key === e.img.key);
        // Stände und Körperwaffen zeigt das Quiz weiter als SVG (Fußbild bzw. markierte Fläche)
        const f3 = !!e.img && /^(mv|tc):/.test(e.img.key) && SK.fig3d.known(e.img.key);
        const anim = e.img && (f3 || /^(tc|as):/.test(e.img.key)) ? { gfx: e.img.key } : {};
        const pic = (q) => (f3 ? q : SK.util.lazy(q, 'img', uri(e)));
        SK.questions.push(Object.assign({ id: `${id}-a`, q: `Was ist „${e.t}“?`, options: [e.qde].concat(pick('qde')), explain: e.qde !== e.de ? e.de : '' }, base));
        // Bild nur hier, wenn es keine eigene Bildfrage gibt – sonst wären -b und -c fast gleich.
        const qb = Object.assign({ id: `${id}-b`, q: `Wie heißt: ${e.qde}?`, options: [e.t].concat(pick('t')), explain: e.qde !== e.de ? e.de : '' }, base, e.img && !own ? anim : {});
        if (e.img && !own) pic(qb);
        SK.questions.push(qb);
        if (own) {
          const qc = Object.assign({ id: `${id}-c`, q: c.ask, options: [e.t].concat(pick('t')), explain: e.de }, base, anim);
          SK.questions.push(pic(qc));
        }
      });
    });
    return unit;
  };

  // Textteile einer Karte: Kopf (Aussprache, Name, Bedeutung) und Stellen in den Kata – auch für die Rückseite der Karteikarten
  const kopfHtml = (e) => `${SK.glossarySagHtml(e)}<h4>${SK.util.esc(e.t)}${altName(e) ? ` <span class="lex-alt">(${SK.util.esc(altName(e))})</span>` : ''}</h4><p>${SK.util.esc(e.de)}</p>`;
  SK.glossaryTextHtml = (e) => `${kopfHtml(e)}${vorHtml(e)}`;
  // Kurzbeschreibung unter dem Bild auf der Vorderseite der Karteikarten, weil ein Bild allein nicht immer eindeutig ist:
  // der Anfang der Quiz-Bedeutung (die den Namen nicht verrät) – ohne Klammern, bis zum ersten Doppelpunkt oder
  // Gedankenstrich. „Vorwärtsstellung: vorderes Knie gebeugt, …“ → „Vorwärtsstellung“.
  SK.glossaryKurz = (e) => e.qde.replace(/\s*\([^)]*\)/g, '').split(/: | – |; /)[0].trim();
  // Bild einer Karte ohne Beschriftungen, die den Namen verraten (Vorderseite der Karteikarten)
  SK.glossaryBildHtml = (e) => (e.img ? G.box(e.img.key, e.img, true) : '');

  SK.glossaryHtml = function (items) {
    return `<div class="lex-grid">${items
      .map(
        (e) => `<article class="lex-card" data-cat="${e.cat}" data-t="${SK.util.esc(e.t)}" data-text="${SK.util.esc(`${e.t} ${altName(e)} ${e.erst ? e.erst.buch : ''} ${e.de}`.toLowerCase())}">
          ${kopfHtml(e)}
          ${e.img ? `<div class="lex-img">${G.box(e.img.key, e.img())}</div>` : ''}${vorHtml(e)}</article>`
      )
      .join('')}</div>`;
  };
})();
