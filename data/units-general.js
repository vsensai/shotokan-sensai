/* Allgemeine Lerneinheiten (Etikette, Geschichte, Begriffe, Stände, Kihon, Kumite).
   Quellen: DJKB-Prüfungsordnung 2013, allgemeines Shotokan-Wissen. */
(function () {
  'use strict';
  const G = SK.gfx;
  const grid = (...figs) => `<div class="gfx-grid">${figs.join('')}</div>`;
  // Grafik erst bei Bedarf: mit 3D-Figur gibt es keine SVG (G.byKey liefert dann '')
  const fig = (kind) => (key, caption, note) => G.figure(() => G.byKey(`${kind}:${key}`), caption, note, `${kind}:${key}`);
  const T = fig('tc');

  SK.generalUnits = [
    {
      id: 'etikette', title: 'Dojo & Etikette', kind: 'general', desc: 'Gruß, Kommandos, Dojo-Kun', quizInto: 'geschichte',
      lessons: [
        {
          id: 'et-dojo', title: 'Im Dojo', quiz: 'et-dojokun', minGrade: '9kyu',
          learn: () => `
            <p><b>Dojo</b> bedeutet „Ort des Weges“. Karate beginnt und endet mit Respekt (Rei). Laut DJKB-Prüfungsordnung muss man schon zum 9. Kyu die Etikette des An- und Abgrüßens beherrschen.</p>
            <h4>Angrüßen im Sitzen</h4>
            <ol>
              <li><b>Seiza</b> – alle knien sich in den Fersensitz.</li>
              <li><b>Mokuso</b> – Augen schließen und sammeln; <b>Mokuso yame</b> beendet die Meditation.</li>
              <li><b>Shomen ni rei</b> – Gruß nach vorne zur Stirnseite des Dojo.</li>
              <li><b>Sensei ni rei</b> – Gruß an den Lehrer.</li>
              <li><b>Kiritsu</b> – Aufstehen.</li>
            </ol>
            <p class="muted small">Die genaue Abfolge kann je nach Dojo leicht abweichen; manche grüßen zusätzlich untereinander (Otagai ni rei).</p>
            <h4>Im Stehen und während des Trainings</h4>
            <ul>
              <li>Im Stehen grüßt man meist aus <b>Musubi-dachi</b>.</li>
              <li>Eine Übung läuft meist so: <b>Yoi</b> (bereit) – <b>Hajime</b> (beginnen) – <b>Yame</b> (aufhören) – <b>Naore</b> (zurück in die Ausgangsstellung).</li>
            </ul>
            <a class="area area-begriffe lex-ziel" href="#/lexikon/begriff"><h3>Alle Kommandos &amp; Begriffe im Lexikon</h3><p>Mit Bild, Aussprache und Stellen in den Kata</p><span class="area-go" aria-hidden="true">›</span></a>`,
        },
        {
          id: 'et-dojokun', title: 'Dojo-Kun', quizTitle: 'Etikette & Dojo-Kun', minGrade: '9kyu',
          learn: () => `
            <p>Das <b>Dojo-Kun</b> sind die fünf Leitsätze des Shotokan-Karate. Jeder beginnt mit <b>„Hitotsu“</b> („eins“ / „erstens“) – das zeigt, dass alle gleich wichtig sind.</p>
            <ol>
              <li><b>Hitotsu! Jinkaku kansei ni tsutomuru koto</b> – Nach Vollendung des Charakters streben.</li>
              <li><b>Hitotsu! Makoto no michi o mamoru koto</b> – Den Weg der Aufrichtigkeit/Wahrhaftigkeit bewahren.</li>
              <li><b>Hitotsu! Doryoku no seishin o yashinau koto</b> – Den Geist des Bemühens (Ausdauer) pflegen.</li>
              <li><b>Hitotsu! Reigi o omonzuru koto</b> – Etikette und Höflichkeit achten.</li>
              <li><b>Hitotsu! Kekki no yu o imashimuru koto</b> – Sich vor unkontrolliertem Draufgängertum hüten (Selbstbeherrschung).</li>
            </ol>`,
        },
      ],
    },
    {
      id: 'geschichte', title: 'Geschichte & Philosophie', kind: 'general', desc: 'Funakoshi, JKA, DJKB, Niju-Kun', quizTitle: 'Dojo & Geschichte', quizDesc: 'Etikette, Dojo-Kun, Funakoshi, JKA, Niju-Kun',
      lessons: [
        {
          id: 'ge-funakoshi', title: 'Gichin Funakoshi', minGrade: '9kyu',
          learn: () => `
            <ul>
              <li><b>Gichin Funakoshi</b> (1868–1957) stammt aus <b>Shuri auf Okinawa</b> und gilt als Vater des modernen Karate.</li>
              <li>Seine Lehrer waren u. a. <b>Anko Azato</b> und <b>Anko Itosu</b>.</li>
              <li>1922 stellte er Karate in Tokio auf dem japanischen Festland vor.</li>
              <li><b>Shoto</b> („Pinienrauschen“) war sein Künstlername; <b>Shotokan</b> = „Haus des Shoto“ – der Name seines Dojo in Tokio.</li>
              <li>In den 1930er-Jahren wurde das Schriftzeichen „Kara“ von „China“ (唐) zu „leer“ (空) geändert: <b>Karate = „leere Hand“</b>, <b>Karate-Do = „Weg der leeren Hand“</b>.</li>
              <li>Bücher: <i>Rentan Goshin Karate-Jutsu</i> (1925), <i>Karate-Do Kyohan</i>.</li>
            </ul>`,
        },
        {
          id: 'ge-jka', title: 'JKA & DJKB', minGrade: '8kyu',
          learn: () => `
            <ul>
              <li>Die <b>Japan Karate Association (JKA)</b> wurde 1949 gegründet; Funakoshi wird im JKA-Kata-Buch als ihr „Grand Master“ bezeichnet.</li>
              <li><b>Masatoshi Nakayama</b> (1913–1987) war langjähriger Chefausbilder der JKA und Autor von <i>Best Karate</i> und <i>Dynamic Karate</i>. Unter ihm entstand das JKA-Instruktorenprogramm.</li>
              <li>Der <b>Deutsche JKA-Karate Bund (DJKB)</b> ist der Fachverband für traditionelles japanisches Shotokan-Karate und offizielle Vertretung der JKA in Deutschland.</li>
              <li>Die DJKB-Prüfungsordnung ist von <b>Hideo Ochi</b> als Chefausbilder unterzeichnet.</li>
              <li>Das offizielle Kata-Lehrbuch der JKA ist <i>Karate-Do Kata</i> (Shihan-kai).</li>
            </ul>`,
        },
        {
          id: 'ge-nijukun', title: 'Niju-Kun (20 Regeln)', minGrade: '6kyu',
          learn: () => `
            <p>Die <b>Shoto Niju-Kun</b> sind Funakoshis 20 Leitsätze. Eine Auswahl:</p>
            <ol>
              <li>Karate beginnt mit Rei und endet mit Rei.</li>
              <li><b>Karate ni sente nashi</b> – Im Karate gibt es keinen ersten Angriff.</li>
              <li>Karate ist ein Helfer der Gerechtigkeit.</li>
              <li>Erkenne zuerst dich selbst, dann den anderen.</li>
              <li>Die Kunst des Geistes kommt vor der Kunst der Technik.</li>
              <li>Befreie deinen Geist.</li>
              <li>Unheil entsteht durch Nachlässigkeit.</li>
              <li>Denke nicht, dass Karate nur im Dojo stattfindet.</li>
              <li>Karate üben heißt, ein Leben lang zu arbeiten.</li>
              <li>Verbinde dein alltägliches Leben mit Karate – dann findest du den Geist.</li>
              <li>Karate ist wie heißes Wasser: Ohne ständige Wärme kühlt es ab.</li>
              <li>Denke nicht ans Gewinnen, sondern daran, nicht zu verlieren.</li>
              <li>Wandle dich abhängig vom Gegner.</li>
              <li>Der Kampf hängt vom Umgang mit Treffen und Nicht-Treffen ab.</li>
              <li>Stelle dir die Hände und Füße des Gegners wie Schwerter vor.</li>
              <li>Wenn du das Tor verlässt, warten Millionen Feinde.</li>
              <li><b>Kamae</b> ist für Anfänger, später steht man in <b>Shizentai</b>.</li>
              <li>Übe die Kata korrekt – im echten Kampf ist es anders.</li>
              <li>Vergiss nicht: Stärke und Schwäche der Kraft, Dehnen und Zusammenziehen des Körpers, Langsamkeit und Schnelligkeit der Technik.</li>
              <li>Denke immer nach und versuche ständig Neues.</li>
            </ol>`,
        },
      ],
    },
    {
      id: 'begriffe', title: 'Begriffe & Zählen', kind: 'general', desc: 'Zählen, Richtungen, Grundprinzipien', quizTitle: 'Zählen & Grundwörter', quizDesc: 'Zahlen, Richtungen, Grade',
      lessons: [
        {
          id: 'te-zahlen', title: 'Zählen & Richtungen', minGrade: '9kyu',
          learn: () => `
            <table class="moves"><tbody>
              <tr><td>1</td><td>Ichi</td><td>6</td><td>Roku</td></tr>
              <tr><td>2</td><td>Ni</td><td>7</td><td>Shichi (Nana)</td></tr>
              <tr><td>3</td><td>San</td><td>8</td><td>Hachi</td></tr>
              <tr><td>4</td><td>Shi (Yon)</td><td>9</td><td>Ku (Kyu)</td></tr>
              <tr><td>5</td><td>Go</td><td>10</td><td>Ju</td></tr>
            </tbody></table>
            <ul>
              <li><b>Hidari</b> = links, <b>Migi</b> = rechts</li>
              <li><b>Mae</b> = vorne, <b>Ushiro</b> = hinten, <b>Yoko</b> = seitlich</li>
              <li><b>Jodan</b> = obere Stufe (Gesicht), <b>Chudan</b> = mittlere Stufe (Brust/Rumpf), <b>Gedan</b> = untere Stufe (Unterbauch)</li>
              <li>Graduierungen: <b>Kyu</b> = Schülergrad (zählt abwärts bis 1. Kyu), <b>Dan</b> = Meistergrad (Shodan = 1. Dan, Nidan = 2. Dan, Sandan = 3. Dan)</li>
              <li>Kata-Namen: <b>Shodan, Nidan, Sandan, Yondan, Godan</b> = 1. bis 5. Stufe</li>
            </ul>
            ${grid(G.figure(null, 'Die drei Stufen', 'Jodan = Gesicht, Chudan = Brust, Gedan = Unterbauch (Definition im JKA-Kata-Buch)', 'fig:levels'))}`,
        },
        {
          id: 'te-konzepte', title: 'Grundprinzipien', minGrade: '7kyu',
          learn: () => `
            <ul>
              <li><b>Stand als Fundament</b> – wie ein Haus auf seinem Fundament steht jede Technik auf dem Stand. Ein wackliger oder unfertiger Stand macht auch die beste Arm- oder Beintechnik wirkungslos.</li>
              <li><b>Kraft aus dem Boden</b> – bei einer Handtechnik drückt der hintere Fuß aktiv gegen den Boden. Diese Kraft läuft über das Bein zur Körpermitte, die Hüfte verstärkt sie, Rumpf und zurückziehender Arm (Hikite) leiten sie zum Ziel. Eine Technik ist nie nur Arm oder Bein, sondern immer der ganze Körper.</li>
              <li><b>Fußtechniken</b> wirken auf andere Distanzen und in anderen Rhythmen als Handtechniken und erweitern so die Möglichkeiten im Kampf – auch sie brauchen den Einsatz des ganzen Körpers.</li>
              <li><b>Abwehr und Konter</b> gehören zusammen: Eine Abwehr soll den Angriff schnell vom Ziel ablenken; folgt kein schneller Konter, ist sie unvollständig – außer man verzichtet bewusst aus taktischen Gründen darauf. Treffender ist daher „Verteidigungstechnik“.</li>
              <li><b>Fußarbeit</b> entscheidet über die Distanz: Eine Abwehr kann scheitern, weil sie nicht durch Gleitschritt oder Körperdrehung unterstützt wurde, oder der Konter wird schwach, weil der Abstand zu kurz oder zu lang ist (siehe <a href="#/wissen/da-ashi">Fußbewegungen</a>).</li>
            </ul>`,
        },
      ],
    },
    {
      id: 'dachi', title: 'Dachi – Stände', kind: 'general', desc: 'Namen, Einsatz und Fußarbeit',
      lessons: [
        {
          id: 'da-kampf', title: 'Stände', quizTitle: 'Stände', minGrade: '9kyu',
          learn: () => `
            <h4>Namen und Abkürzungen</h4>
            <ul>
              <li>Die DJKB-Prüfungsordnung kürzt ab: <b>Zk</b> = Zenkutsu-dachi, <b>Kk</b> = Kokutsu-dachi, <b>Kb</b> = Kiba-dachi.</li>
              <li><b>Hidari</b> (links) und <b>Migi</b> (rechts) im Namen: Im JKA-Kata-Buch heißt Zenkutsu-dachi nach dem <b>vorderen</b> Bein, Kokutsu-dachi nach dem <b>hinteren</b> (belasteten) Bein. Hidari Zenkutsu-dachi = linkes Bein vorne; „Migi Kokutsu-dachi, Hidari Shuto-uke“ = rechtes Bein hinten, linkes vorne.</li>
            </ul>
            <h4>Wofür welcher Stand</h4>
            <ul>
              <li><b>Musubi-dachi</b> – Stand für den Gruß im Stehen (Ritsu-rei).</li>
              <li><b>Hachiji-dachi</b> – Yoi der Heian-Kata, eine Form von Shizentai; <b>Heisoku-dachi</b> – Yoi von Tekki, Bassai Dai, Jion und Enpi.</li>
              <li><b>Zenkutsu-dachi</b> – der am häufigsten genutzte Stand im Shotokan.</li>
              <li><b>Kokutsu-dachi</b> – meist für Abwehrtechniken, in manchen Kata auch mit Angriffen verbunden.</li>
              <li><b>Fudo-dachi</b> – feste Basis, aus der eine Technik viel Kraft entfalten kann.</li>
              <li><b>Kosa-dachi</b> – Begriff der Theorie zum 1. Dan; auch für Anwendungen mit Körperdrehung.</li>
            </ul>
            <h4>Woher die Namen kommen</h4>
            <ul>
              <li><b>Kiba-dachi</b> – Reiterstellung: wie der Sitz auf einem Pferd.</li>
              <li><b>Neko-ashi-dachi</b> – Katzenfußstand: wie eine Katze kurz vor dem Sprung.</li>
              <li><b>Sanchin-dachi</b> – Sanduhrstand: sehr kurz, beim Gehen werden die Füße zur Mitte geführt – das ergibt die Form einer Sanduhr.</li>
              <li><b>Hangetsu-dachi</b> – Halbmondstand: der vordere Fuß kommt im Halbmondschritt, einem Bogen von innen nach außen.</li>
            </ul>
            <a class="area area-begriffe lex-ziel" href="#/lexikon/stand"><h3>Alle Stände im Lexikon</h3><p>Mit 3D-Figur, Fußbild und Stellen in den Kata</p><span class="area-go" aria-hidden="true">›</span></a>`,
        },
        {
          id: 'da-ashi', title: 'Fußbewegungen (Ashi-sabaki)', minGrade: '8kyu',
          learn: () => `
            <p>Gute Beweglichkeit auf dem Boden ist nicht selbstverständlich und muss eigens geübt werden. Selbst Fortgeschrittene schätzen die Distanz oft falsch ein: Eine Abwehr scheitert, weil sie nicht durch Gleitschritt oder Körperdrehung unterstützt wird, oder der Konter wird schwach, weil der Abstand zu kurz oder zu groß ist.</p>
            <h4>Die Unterschiede</h4>
            <ul>
              <li>Beim normalen Schritt (<b>Ayumi-ashi</b>) wechseln die Beine: der hintere Fuß wird zum vorderen. Bei Ständen mit Breite (z. B. Zenkutsu-dachi) kommen die Füße in der Mitte des Schritts zusammen – der Fuß beschreibt einen Bogen.</li>
              <li>Beim Gleitschritt (<b>Suri-ashi</b>) wechseln sie nicht: erst gleitet der vordere Fuß vor, dann zieht der hintere nach – vorne bleibt vorne. Rückwärts geht es umgekehrt, der hintere Fuß gleitet zuerst. So kommt man schnell in die Distanz, z. B. mit Kizami-zuki.</li>
              <li>Bei <b>Yori-ashi</b> stößt der hintere Fuß ab und beide Füße gleiten fast gleichzeitig, in einem Zug – der Stand bleibt die ganze Zeit gleich – für kleine Distanzänderungen, Rhythmuswechsel und um einen Angriff zu verschleiern. Kommt in vielen Kata vor (z. B. Heian Sandan, Bassai Dai, Kanku Dai, Jion, Enpi).</li>
              <li><b>Suri-ashi oder Yori-ashi?</b> Beim Suri-ashi sind es zwei Schritte nacheinander, der Stand wird zwischendurch länger. Beim Yori-ashi gleitet der ganze Körper in einem Zug, der Stand bleibt immer gleich lang.</li>
              <li><b>Tai-sabaki</b> ist kein Schritt nach vorne oder hinten, sondern eine kreisförmige Drehung aus der Angriffslinie – im Kumite und bei Partnerübungen.</li>
            </ul>
            <a class="area area-begriffe lex-ziel" href="#/lexikon/ashi"><h3>Alle Fußbewegungen im Lexikon</h3><p>Mit Fußbild von oben zum Abspielen</p><span class="area-go" aria-hidden="true">›</span></a>`,
        },
      ],
    },
    {
      id: 'kihon', title: 'Kihon – Techniken', kind: 'general', desc: 'Tsuki, Uke, Uchi, Geri', quizDesc: 'Hand- und Fußtechniken',
      lessons: [
        {
          id: 'ki-tsuki', title: 'Tsuki – Fauststöße', quizTitle: 'Hand: Tsuki, Uke, Uchi', minGrade: '9kyu',
          learn: () => `
            <ul>
              <li>Laut DJKB-Prüfungsordnung werden alle Fauststöße generell <b>Chudan</b> ausgeführt, sofern nichts anderes angegeben ist. <b>Sanbon-zuki</b> in der Prüfung: Jodan / Chudan / Chudan.</li>
              <li><b>Oi-zuki oder Gyaku-zuki?</b> Bei Oi-zuki stößt die Hand auf der Seite des vorderen Beins, meist mit Schritt – so erreicht man das Ziel aus großer Entfernung. Bei Gyaku-zuki stößt die Hand der Gegenseite, die Kraft kommt aus der Hüftdrehung.</li>
              <li><b>Kizami-zuki</b> wird oft durch einen Gleitschritt unterstützt, um in die Distanz zu kommen.</li>
              <li><b>Awase-zuki</b> ist die engere Form des Yama-zuki: U-förmig, mit aufrechtem Oberkörper.</li>
            </ul>
            <a class="area area-begriffe lex-ziel" href="#/lexikon/tsuki"><h3>Alle Fauststöße im Lexikon</h3><p>Mit Bild, Aussprache und Stellen in den Kata</p><span class="area-go" aria-hidden="true">›</span></a>`,
        },
        {
          id: 'ki-uke', title: 'Uke – Abwehrtechniken', quiz: 'ki-tsuki', minGrade: '9kyu',
          learn: () => `
            <ul>
              <li><b>Paare mit Gegenrichtung:</b> Soto-uke (außen → innen) und Uchi-uke (innen → außen) schützen beide Chudan; Shuto-uke wehrt wie Uchi-uke nach außen ab, meist in Kokutsu-dachi. Gedan-nagashi-uke läuft in Gegenrichtung zum Gedan-barai.</li>
              <li><b>Nagashi-uke</b> ist der Oberbegriff für fließende, ablenkende Abwehren (Theorie 1. Dan): der Angriff wird nicht hart gestoppt, sondern abgelenkt. Am häufigsten ist Te-nagashi-uke mit der offenen Hand, vor allem im Kampf; in den Kata kommen Soto-nagashi-uke (Heian Nidan 2 und 5) und Uchi-nagashi-uke (Tekki Shodan 9 und 23) vor.</li>
              <li><b>Manji-uke</b> verbindet Gedan-barai mit Jodan-Uchi-uke zur Doppelabwehr; zuerst in Heian Godan.</li>
            </ul>
            <a class="area area-begriffe lex-ziel" href="#/lexikon/uke"><h3>Alle Abwehrtechniken im Lexikon</h3><p>Mit Bild, Aussprache und Stellen in den Kata</p><span class="area-go" aria-hidden="true">›</span></a>`,
        },
        {
          id: 'ki-uchi', title: 'Uchi – Schläge', quiz: 'ki-tsuki', minGrade: '7kyu',
          learn: () => `
            <ul>
              <li><b>Uchi oder Tsuki?</b> Laut JKA-Buch wirkt die Kraft beim Schlag (Uchi) im rechten Winkel zum Unterarm, beim Stoß (Tsuki) in Richtung des Unterarms. Schläge holen ihre Kraft aus dem Schnappen des Ellbogens.</li>
              <li>Shuto- und Haito-uchi gibt es von innen und von außen, Uraken- und Tettsui-uchi in mehreren Formen.</li>
              <li><b>Prüfungsordnung:</b> ab dem 6. Kyu Soto-uke / umsetzen in Kb mit <b>Yoko-Empi-Uchi</b>; ab dem 5. Kyu zusätzlich <b>Tate-Uraken</b>.</li>
              <li><b>Ellbogen und Stand:</b> Yoko-enpi bevorzugt in Kiba-dachi, Otoshi-enpi in Fudo- oder Kiba-dachi, Furi-enpi mit Stampfer in Kiba-dachi.</li>
            </ul>
            <a class="area area-begriffe lex-ziel" href="#/lexikon/uchi"><h3>Alle Schläge im Lexikon</h3><p>Mit Bild, Aussprache und Stellen in den Kata</p><span class="area-go" aria-hidden="true">›</span></a>`,
        },
        {
          id: 'ki-geri', title: 'Geri – Fußtritte', quizTitle: 'Fuß: Geri', minGrade: '8kyu',
          learn: () => `
            <ul>
              <li><b>Keage oder Kekomi?</b> Keage = Schnapptritt, Kekomi = Stoßtritt (z. B. Yoko-geri-keage und Yoko-geri-kekomi).</li>
              <li><b>Höhe laut DJKB:</b> Ushiro-geri und Yoko-geri-kekomi generell Chudan; alle übrigen Fußtritte (auch Kizami-mae-geri) generell <b>Jodan</b>. Seitliche Fußtritte in beide Richtungen.</li>
              <li><b>Welcher Fußteil trifft:</b> Mae-geri und Mawashi-geri mit dem Fußballen, Yoko-geri mit der Fußkante, Ushiro-geri mit der Ferse, Mae-geri-kekomi mit Ferse oder Fußballen. Beim Kniestoß sind Fuß und Zehen zum Schienbein angezogen.</li>
              <li><b>Theorie-Begriffe:</b> Ren-geri (3. Kyu), Kizami-geri (2. Kyu), Sonoba-geri (1. Kyu).</li>
              <li><b>Fußfeger (Ashi-barai)</b> nehmen dem Partner kurz das Gleichgewicht, sodass er der Folgetechnik nichts entgegensetzen kann. Sie setzen gute Grundlagen und Körperbeherrschung voraus.</li>
            </ul>
            <a class="area area-begriffe lex-ziel" href="#/lexikon/geri"><h3>Alle Fußtechniken im Lexikon</h3><p>Mit Bild, Aussprache und Stellen in den Kata</p><span class="area-go" aria-hidden="true">›</span></a>
            <a class="area area-begriffe lex-ziel" href="#/lexikon/waffe"><h3>Körperwaffen im Lexikon</h3><p>Faust, Hand, Fuß, Ellbogen und Knie – gezeichnet, mit Trefferfläche</p><span class="area-go" aria-hidden="true">›</span></a>`,
        },
      ],
    },
    {
      id: 'kumite', title: 'Kumite', kind: 'general', desc: 'Partnerformen und Prinzipien',
      lessons: [
        {
          id: 'ku-formen', title: 'Kumite-Formen', minGrade: '9kyu',
          learn: () => `
            <ul>
              <li><b>Gohon-Kumite</b> – Fünfschritt-Kumite: 5 Angriffe fortlaufend, 5 Abwehren, dann Gegenangriff mit Kiai (DJKB: 8. und 7. Kyu).</li>
              <li><b>Kihon-Ippon-Kumite</b> – Einschritt-Grundkumite: ein angesagter Angriff, Abwehr und Konter (DJKB: 9. Kyu sowie 6.–3. Kyu).</li>
              <li><b>Jiyu-Ippon-Kumite</b> – freies Einschritt-Kumite aus Chudan-Kamae (DJKB: 2. Kyu bis 1. Dan).</li>
              <li><b>Okuri-Jiyu-Ippon-Kumite</b> – Jiyu-Ippon-Kumite mit Folgeangriff (Theorie 1. Kyu).</li>
              <li><b>Kaeshi-Ippon-Kumite</b> – Einschritt-Kumite mit Gegenangriff des Verteidigers und erneuter Abwehr.</li>
              <li><b>Jiyu-Kumite</b> – freier Kampf (DJKB: ab 2. Dan, alternativ Jiyu-Ippon je nach Alter).</li>
              <li><b>Happo-Kumite</b> – Kumite in acht Richtungen (Theorie 2. Dan).</li>
            </ul>
            ${grid(T('gohon-kumite', 'Gohon-Kumite'), T('kihon-ippon-kumite', 'Kihon-Ippon-Kumite'))}`,
        },
        {
          id: 'ku-prinzipien', title: 'Prinzipien im Kumite', minGrade: '6kyu',
          learn: () => `
            <p>Aus den Vorbemerkungen der DJKB-Prüfungsordnung:</p>
            <ul>
              <li><b>Stufe I (9.–7. Kyu)</b>: Kihon nur vorwärts, damit sich Anfänger auf die Stellung konzentrieren können. Im Kumite zielgenau und mit korrekter Distanz – der Abwehrende blockt dicht vor seinem Körper kraftvoll.</li>
              <li><b>Stufe II (6.–4. Kyu)</b>: Hüftdrehung in der Abwehr und kraftvoller Konter; Abwehr und Konter aus der gleichen Stellung.</li>
              <li>Kihon-Ippon: Der Angreifer greift so an, als gäbe es nur eine Chance; der Verteidiger steht zunächst ruhig in <b>Shizentai</b> – das schult die psychische Stabilität.</li>
              <li><b>Stufe III (3. Kyu – Dan)</b>: Konter aus einer <i>anderen</i> Stellung als die Abwehr – der Stellungswechsel verstärkt den Konter (Gewichtsverlagerung und Hüftdrehung).</li>
              <li>Jiyu-Ippon-Kumite schult Distanz, Timing, schnelle Entscheidungen und das Überwinden eigener Unsicherheiten. Der Abwehrende darf den Abstand nicht vergrößern, sondern blockt bzw. weicht auf kurzer Distanz aus und kontert kraftvoll.</li>
            </ul>
            ${grid(T('shizentai', 'Shizentai', 'Ausgangshaltung des Verteidigers im Kihon-Ippon'), T('chudan-kamae', 'Chudan-kamae', 'Ausgangshaltung im Jiyu-Ippon'), T('tai-sabaki', 'Tai-sabaki', 'Ausweichen auf kurzer Distanz'))}`,
        },
      ],
    },
  ];
  SK.generalUnits.forEach(SK.lazyLearn);
})();
