/* Lexikon aller Stände, Techniken und Begriffe – Grundlage für Wissen (Lexikon) und Begriffe-Trainer. */
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
    { id: 'tsuki', title: 'Fauststoße (Tsuki)', ask: 'Welche Technik ist abgebildet?' },
    { id: 'uchi', title: 'Schläge (Uchi)', ask: 'Welcher Schlag ist abgebildet?' },
    { id: 'uke', title: 'Abwehrtechniken (Uke)', ask: 'Welche Abwehr ist abgebildet?' },
    { id: 'geri', title: 'Fußtechniken (Geri)', ask: 'Welche Fußtechnik zeigt die Grafik?' },
    { id: 'ashi', title: 'Fußbewegungen (Ashi-sabaki)', ask: 'Welche Fußbewegung zeigt die Grafik?' },
    { id: 'barai', title: 'Fußfeger (Ashi-barai)', ask: 'Welcher Fußfeger ist abgebildet?' },
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
    ['Kiba-dachi', 'Reiterstellung: breit, Füße parallel, Gewicht gleich verteilt', 'stand', st('kiba')],
    ['Kosa-dachi', 'Kreuzstand: Beine gekreuzt, hinterer Fuß hinter der vorderen Ferse', 'stand', st('kosa')],
    ['Neko-ashi-dachi', 'Katzenfußstand: fast das gesamte Gewicht auf dem hinteren Bein', 'stand', st('neko')],
    ['Fudo-dachi', 'Unbeweglicher Stand: beide Knie gebeugt, Gewicht ausgeglichen (auch Sochin-dachi)', 'stand', st('fudo')],
    ['Hangetsu-dachi', 'Halbmondstand: etwas kürzer als Zenkutsu-dachi, Knie und Oberschenkelinnenseiten zur Mitte gespannt, länger als Sanchin-dachi', 'stand', st('hangetsu'), PDF2(41)],
    ['Sanchin-dachi', 'Sanduhrstand: kurz, Fußspitzen und Knie nach innen', 'stand', st('sanchin')],
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
    ['Enpi-uchi', 'Ellbogenschlag', 'uchi', tc('enpi-uchi')],
    ['Furi-enpi', 'Schwingender Ellbogenschlag zur Seite', 'uchi', tc('furi-enpi'), PDF(35)],
    ['Ushiro-enpi', 'Ellbogenstoß nach hinten', 'uchi', tc('ushiro-enpi'), PDF(37)],
    ['Mae-enpi', 'Ellbogenstoß nach vorne: Ellbogen dicht am Körper, gerade Linie zum Ziel', 'uchi', tc('enpi-uchi'), KO],
    ['Yoko-enpi', 'Ellbogenstoß zur Seite, meist in Kiba-dachi', 'uchi', tc('yoko-enpi'), KO],
    ['Mawashi-enpi', 'Ellbogenschlag im waagerechten Bogen von außen zur Körpermitte', 'uchi', tc('mawashi-enpi'), KO],
    ['Age-enpi', 'Ellbogenschlag senkrecht nach oben, dicht am Körper (auch Tate-enpi)', 'uchi', tc('age-enpi'), KO],
    ['Otoshi-enpi', 'Ellbogenschlag senkrecht nach unten, z. B. in Kiba- oder Fudo-dachi', 'uchi', tc('otoshi-enpi'), KO],
    ['Hasami-uchi', 'Zangenschlag mit beiden Fäusten zu beiden Seiten', 'uchi', tc('hasami-uchi'), PDF(90)],
    ['Teisho-uchi', 'Schlag mit dem Handballen', 'uchi', tc('teisho-uchi')],

    ['Gedan-barai', 'Abwehr nach unten (fegend)', 'uke', mv('gedan-barai')],
    ['Age-uke', 'Abwehr nach oben (Jodan)', 'uke', mv('age-uke')],
    ['Soto-uke', 'Abwehr von außen nach innen mit der Innenseite des Unterarms', 'uke', mv('soto-uke'), PDF(4)],
    ['Uchi-uke', 'Abwehr von innen nach außen mit der Außenseite des Unterarms', 'uke', mv('uchi-uke'), PDF(4)],
    ['Shuto-uke', 'Handkantenabwehr, meist in Kokutsu-dachi', 'uke', tc('shuto-uke')],
    ['Morote-uke', 'Unterstützte Abwehr – zweite Faust am Ellbogen', 'uke', tc('morote-uke'), PDF(26)],
    ['Juji-uke', 'Gekreuzte Abwehr (auch Kosa-uke)', 'uke', tc('juji-uke'), PDF(41)],
    ['Kakiwake-uke', 'Abwehr, bei der beide Arme auseinanderdrücken', 'uke', tc('kakiwake-uke'), PDF(46)],
    ['Gedan-kakiwake', 'Beide Hände kreuzen vor dem Körper und gehen seitlich nach unten, Handrücken außen', 'uke', tc('gedan-kakiwake'), PDF2(45)],
    ['Nagashi-uke', 'Fließende, ablenkende Abwehr', 'uke', tc('nagashi-uke')],
    ['Osae-uke', 'Drückende Abwehr nach unten', 'uke', tc('osae-uke'), PDF(21)],
    ['Kake-uke', 'Hakenabwehr mit dem Handgelenk', 'uke', tc('kake-uke'), PDF(59)],
    ['Sukui-uke', 'Schöpfende Abwehr gegen einen Tritt', 'uke', tc('sukui-uke'), PDF(82)],
    ['Haiwan-uke', 'Abwehr mit der Rückseite des Unterarms', 'uke', tc('haiwan-uke'), PDF(17)],
    ['Tsukami-uke', 'Greifende Abwehr', 'uke', tc('tsukami-uke'), PDF(87)],
    ['Tate-shuto-uke', 'Abwehr mit senkrechter Handkante, Arm gestreckt', 'uke', tc('tate-shuto-uke'), PDF(83)],
    ['Teisho-uke', 'Abwehr mit dem Handballen', 'uke', tc('teisho-uke'), PDF(142)],
    ['Teisho Awase-uke', 'Abwehr mit beiden Handballen zusammen gegen das Schienbein eines Tritts', 'uke', tc('teisho-awase-uke'), PDF2(57)],
    ['Uchiotoshi', 'Unterarm schlägt einen Angriff nach unten', 'uke', tc('uchiotoshi'), PDF(150)],
    ['Manji-uke', 'Doppelabwehr: eine Hand wehrt unten ab (Gedan-barai), die andere schützt oben (Jodan-uchi-uke)', 'uke', tc('manji-uke'), KO],
    ['Te-nagashi-uke', 'Die offene Hand lenkt einen Jodan- oder Chudan-Angriff zur Seite ab – vor allem im Kampf', 'uke', tc('te-nagashi-uke'), KO],
    ['Gedan-nagashi-uke', 'Ablenkende Abwehr im unteren Bereich, in Gegenrichtung zum Gedan-barai', 'uke', tc('gedan-nagashi-uke'), KO],

    ['Mae-geri', 'Fußtritt nach vorne mit dem Fußballen', 'geri', mv('mae-geri')],
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
    ['Mae-geri-kekomi', 'Stoßtritt nach vorne mit Ferse oder Fußballen', 'geri', tc('mae-geri-kekomi'), KO],
    ['Ura-mawashi-geri', 'Halbkreistritt gegenläufig zum Mawashi-geri, trifft mit Sohle oder Ferse', 'geri', tc('ura-mawashi-geri'), KO],
    ['Ushiro-mawashi-geri', 'Ura-mawashi-geri aus einer Körperdrehung wie beim Ushiro-geri', 'geri', tc('ushiro-mawashi-geri'), KO],
    ['Mawashi-hiza-geri', 'Kniestoß im Bogen, waagerecht oder schräg zum Ziel', 'geri', tc('mawashi-hiza-geri'), KO],

    ['Ashi-sabaki', 'Fußarbeit: alle Schritte, mit denen man Distanz und Richtung ändert', 'ashi', null, KO],
    ['Ayumi-ashi', 'Normaler Schritt: der hintere Fuß wird zum vorderen; bei Ständen mit Breite kommt er in der Schrittmitte zum Standbein (Bogen)', 'ashi', as('ayumi-ashi'), KO],
    ['Ayumi-ashi auf einer Linie', 'Schritt bei Ständen mit beiden Füßen auf einer Linie (z. B. Kokutsu-dachi): der hintere Fuß geht gerade, ohne Bogen', 'ashi', as('ayumi-ashi-linie'), KO],
    ['Suri-ashi', 'Gleitschritt', 'ashi', tc('suri-ashi'), PO],
    ['Okuri-suri-ashi', 'Gleitschritt: zuerst der Fuß, der näher am Ziel ist, dann zieht der andere nach', 'ashi', as('okuri-suri-ashi'), KO],
    ['Tsugi-suri-ashi', 'Gleitschritt mit größerer Reichweite: erst setzt der hintere Fuß zum vorderen, dann gleitet der vordere vor', 'ashi', as('tsugi-suri-ashi'), KO],
    ['Yori-ashi', 'Beide Füße gleiten gemeinsam, der Stand bleibt erhalten', 'ashi', as('yori-ashi'), PDF(38)],
    ['Ashi-fumikae', 'Beinwechsel am Platz: nach vorne erst den vorderen Fuß zurück, dann den hinteren vor', 'ashi', as('ashi-fumikae'), KO],
    ['Tai-sabaki', 'Körperausweichbewegung', 'ashi', tc('tai-sabaki'), PO],
    ['Tai-sabaki (45°)', 'Ausweichen mit Drehung um 45°: der hintere Fuß setzt im Bogen um, der vordere dreht am Platz', 'ashi', as('tai-sabaki-45'), KO],
    ['Tai-sabaki (180°)', 'Drehung um 180°: der hintere Fuß setzt im Bogen um, der vordere dreht am Platz', 'ashi', as('tai-sabaki-180'), KO],
    ['Yoko-sashi-ashi', 'Seitlicher Übersetzschritt: ein Fuß setzt vor dem anderen über, dann tritt dieser seitlich weiter', 'ashi', as('yoko-sashi-ashi'), KO],
    ['Shaho-sashi-ashi', 'Übersetzschritt wie Yoko-sashi-ashi, nur diagonal – zum Richtungswechsel in höheren Kata', 'ashi', as('shaho-sashi-ashi'), KO],

    ['Ashi-barai', 'Fußfeger', 'barai', tc('ashi-barai'), PO],
    ['Teisoku-ashi-barai', 'Fußfeger mit der Fußsohle – mit dem vorderen oder hinteren Fuß', 'barai', tc('teisoku-barai'), KO],
    ['Haisoku-ashi-barai', 'Fußfeger mit dem Spann, meist mit dem vorderen Fuß aus der Kampfstellung', 'barai', tc('haisoku-barai'), KO],
    ['Komura-ashi-barai', 'Fußfeger mit der Wade, meist innerhalb einer Kombination', 'barai', tc('komura-barai'), KO],

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
    ['Zenwan', 'Unterarm', 'waffe', wp('zenwan')],
    ['Koshi (Josokutei)', 'Fußballen', 'waffe', wp('koshi'), PDF(24)],
    ['Sokuto', 'Fußkante (Außenkante)', 'waffe', wp('sokuto')],
    ['Kakato', 'Ferse', 'waffe', wp('kakato')],
    ['Haisoku', 'Fußrücken / Spann', 'waffe', wp('haisoku')],

    ['Chudan-kamae', 'Kampfhaltung mit den Händen auf mittlerer Höhe', 'kamae', tc('chudan-kamae'), PO],
    ['Gedan-kamae', 'Kampfhaltung mit der vorderen Hand in Gedan-barai-Position', 'kamae', tc('gedan-kamae'), PO],
    ['Shuto-kamae', 'Kampfhaltung mit Handkanten (wie Shuto-uke)', 'kamae', tc('shuto-kamae'), PO],
    ['Koshi-kamae', 'Beide Fäuste an der Hüfte übereinander (Ryoken Koshi-kamae)', 'kamae', tc('koshi-kamae'), PDF(19)],
    ['Mizunagare-no-kamae', '„Wasserfluss-Haltung“: Unterarm schräg vor dem Solarplexus, etwa zwei Fäuste entfernt', 'kamae', tc('mizunagare-no-kamae'), PDF(55)],
    ['Hanmi', 'Halbseitliche Körperhaltung', 'kamae', tc('hanmi'), PO],
    ['Kaisho Yama-gamae', '„Berghaltung“ mit offenen Händen: Unterarme senkrecht neben dem Gesicht, Ellbogen auf Schulterhöhe', 'kamae', tc('yama-gamae'), PDF2(45)],
    ['Gyaku-hanmi', 'Umgekehrt halbseitliche Körperhaltung', 'kamae', tc('gyaku-hanmi'), PDF(24)],
    ['Shizentai', 'Natürliche Haltung', 'kamae', tc('shizentai'), PO],
    ['Hikite', 'Zurückziehende Hand zur Hüfte', 'kamae', tc('hikite'), PO],

    ['Yoi', 'Bereit – Bereitschaftsstellung', 'begriff', tc('yoi')],
    ['Hajime', 'Beginnen', 'begriff'],
    ['Yame', 'Aufhören', 'begriff'],
    ['Naore', 'Zurück in die Ausgangsstellung', 'begriff'],
    ['Mawatte', 'Wenden', 'begriff', tc('mawatte')],
    ['Rei', 'Gruß / Verbeugung', 'begriff', tc('rei')],
    ['Seiza', 'Kniender Fersensitz', 'begriff', tc('seiza'), PO],
    ['Mokuso', 'Augen schließen, meditieren', 'begriff', tc('mokuso'), PO],
    ['Kiritsu', 'Aufstehen', 'begriff', tc('kiritsu'), PO],
    ['Kiai', 'Kampfschrei', 'begriff', tc('kiai'), PO],
    ['Kime', 'Konzentration aller Kraft im Treffmoment', 'begriff', tc('kime'), PO],
    ['Zanshin', 'Wache Aufmerksamkeit nach der Technik', 'begriff', tc('zanshin'), PO],
    ['Maai', 'Kampfdistanz', 'begriff', tc('maai'), PO],
    ['Deai', 'Kontern im Moment des gegnerischen Angriffs', 'begriff', tc('deai'), PO],
    ['Kogeki', 'Angriff', 'begriff', tc('kogeki'), PO],
    ['Sun-dome', 'Technik kurz vor dem Ziel abstoppen', 'begriff', tc('sun-dome'), PO],
    ['Enbusen', 'Bewegungslinie einer Kata', 'begriff', tc('enbusen'), PDF(4)],
    ['Ura-shomen', 'Rückseite – die Richtung entgegengesetzt zur Vorderseite (Shomen)', 'begriff', null, PDF2(45)],
    ['Bunkai', 'Anwendung / Analyse der Kata-Techniken', 'begriff', tc('bunkai')],
  ];

  // Erstes Vorkommen in den 10 Kata des Buches (Reihenfolge SK.kataOrder), nur wo das Buch die Technik beim Namen nennt.
  // [Kata, Bewegung, Name im Buch (falls anders), Zusatz, Prüfwort] – validate.js prüft, dass die Bewegung den Namen
  // enthält und keine frühere Bewegung ihn schon hat (außer mit eigenem Prüfwort).
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
    'Furi-enpi': ['heian-sandan', 12],
    'Ushiro-enpi': ['heian-sandan', 19],
    'Mae-enpi': ['heian-yondan', 7],
    'Hasami-uchi': ['bassai-dai', 23],

    'Gedan-barai': ['heian-shodan', 1],
    'Age-uke': ['heian-shodan', 7],
    'Soto-uke': ['bassai-dai', 4],
    'Uchi-uke': ['heian-nidan', 16],
    'Shuto-uke': ['heian-shodan', 18, 'Shuto Chudan-uke'],
    'Morote-uke': ['heian-nidan', 22],
    'Juji-uke': ['heian-yondan', 3, 'Kosa-uke'],
    'Kakiwake-uke': ['heian-yondan', 14],
    'Nagashi-uke': ['heian-nidan', 2, 'Soto-nagashi-uke'],
    'Osae-uke': ['heian-nidan', 11],
    'Kake-uke': ['heian-godan', 14],
    'Sukui-uke': ['bassai-dai', 6, '', 'als Zwischentechnik davor'],
    'Haiwan-uke': ['heian-nidan', 1, 'Haiwan Yoko-uke'],
    'Tsukami-uke': ['bassai-dai', 18],
    'Tate-shuto-uke': ['bassai-dai', 9, 'Tate-shuto Chudan-uke'],
    'Teisho-uke': ['jion', 23, 'Teisho Yoko-uke'],
    'Gedan-kakiwake': ['hangetsu', 10, 'Ryote Ryogawa Gedan-kakiwake'],
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
    'Ashi-zenkutsu': 'Kleine Vorwärtsstellung (kürzer und schmaler), z. B. in Gyaku-hanmi',
    'Nukite': 'Speerhand-Stoß mit den Fingerspitzen',
    'Tettsui-uchi': 'Hammerfaustschlag',
    'Age-enpi': 'Ellbogenschlag senkrecht nach oben, dicht am Körper',
    'Gedan-nagashi-uke': 'Ablenkende Abwehr im unteren Bereich, entgegen der Richtung der fegenden Abwehr nach unten',
    'Ura-mawashi-geri': 'Halbkreistritt gegenläufig zum gewöhnlichen Halbkreistritt, trifft mit Sohle oder Ferse',
    'Ushiro-mawashi-geri': 'Gegenläufiger Halbkreistritt aus einer Körperdrehung wie beim Fußtritt nach hinten',
    'Ayumi-ashi auf einer Linie': 'Schritt bei Ständen, in denen die Füße genau hintereinander stehen (z. B. Kokutsu-dachi): der hintere Fuß geht gerade, ohne Bogen',
    'Shaho-sashi-ashi': 'Übersetzschritt wie beim seitlichen Übersetzschritt, nur diagonal – zum Richtungswechsel in höheren Kata',
    'Gedan-kamae': 'Kampfhaltung mit der vorderen Hand unten, wie nach einer fegenden Abwehr nach unten',
    'Shuto-kamae': 'Kampfhaltung mit offenen Händen, Handkanten nach vorn (wie bei der Handkantenabwehr)',
    'Koshi-kamae': 'Beide Fäuste an der Hüfte übereinander',
    'Ura-shomen': 'Richtung nach hinten, entgegengesetzt zur Vorderseite der Kata',
    'Kaisho Yama-gamae': 'Haltung mit offenen Händen: Unterarme senkrecht neben dem Gesicht, Ellbogen auf Schulterhöhe',
  };

  SK.glossary = E.map(([t, de, cat, img, src]) => {
    const e = { t, de, qde: QUIZ[t] || de, cat, img: img || null, src: src || ALLG };
    const z = ERST[t];
    if (z) e.erst = { kata: z[0], n: z[1], buch: z[2] || '', zusatz: z[3] || '', wort: z[4] || '' };
    return e;
  });
  SK.glossaryErst = ERST;

  // Hinweis unten auf der Karte: erste Bewegung mit Link zum passenden Bewegungsblock der Kata
  function erstHtml(e) {
    const z = e.erst, k = z && SK.kata[z.kata];
    const r = k && k.seq[z.n - 1];
    if (!r) return '';
    const link = SK.kataMoveLesson ? `#/wissen/${SK.kataMoveLesson(z.kata, z.n)}` : '';
    const txt = `${SK.util.esc(k.name)}, Bewegung ${z.n}${z.zusatz ? ` (${SK.util.esc(z.zusatz)})` : ''}`;
    return `<p class="lex-erst">Zuerst in: ${link ? `<a href="${link}">${txt}</a>` : txt}</p>`;
  }

  // Anderer Name im Buch – nur zeigen, wenn er nicht bloß der eigene Name mit Zusätzen ist
  // („Shuto Chudan-uke“ zu „Shuto-uke“ nein, „Kosa-uke“ zu „Juji-uke“ ja). „-uchi“ zählt dabei nicht.
  // Abweichende Anzeige: kürzerer anderer Name oder gar keiner ('')
  const ANDERS = { 'Tettsui-uchi': 'Kentsui-uchi', 'Yoko-geri-kekomi': '' };
  function altName(e) {
    if (e.t in ANDERS) return ANDERS[e.t];
    const b = e.erst && e.erst.buch;
    if (!b) return '';
    const words = (x) => x.toLowerCase().split(/[^a-z]+/).filter(Boolean);
    const bw = words(b);
    return words(e.t).filter((w) => w !== 'uchi').every((w) => bw.includes(w)) ? '' : b;
  }

  SK.glossaryAlt = altName;

  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  SK.buildGlossaryContent = function () {
    const unit = { id: 'begriffe-trainer', title: 'Begriffe-Trainer', kind: 'drill', desc: 'Stände, Techniken & Begriffe – kurz abgefragt', lessons: [] };
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
        const id = `gl-${slug(e.t)}`;
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

  SK.glossaryHtml = function (items) {
    return `<div class="lex-grid">${items
      .map(
        (e) => `<article class="lex-card" data-cat="${e.cat}" data-text="${SK.util.esc(`${e.t} ${altName(e)} ${e.erst ? e.erst.buch : ''} ${e.de}`.toLowerCase())}">
          <h4>${SK.util.esc(e.t)}${altName(e) ? ` <span class="lex-alt">(${SK.util.esc(altName(e))})</span>` : ''}</h4><p>${SK.util.esc(e.de)}</p>
          ${e.img ? `<div class="lex-img">${G.box(e.img.key, e.img())}</div>` : ''}${erstHtml(e)}</article>`
      )
      .join('')}</div>`;
  };
})();
