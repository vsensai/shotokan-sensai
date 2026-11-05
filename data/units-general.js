/* Allgemeine Lerneinheiten (Etikette, Geschichte, Begriffe, Stände, Kihon, Kumite).
   Quellen: DJKB-Prüfungsordnung 2013, allgemeines Shotokan-Wissen. */
(function () {
  'use strict';
  const G = SK.gfx;
  const grid = (...figs) => `<div class="gfx-grid">${figs.join('')}</div>`;
  // Standbilder erst erzeugen, wenn eine Lektion sie zeigt.
  const S = {
    musubi: () => G.stanceFigure('musubi'),
    heisoku: () => G.stanceFigure('heisoku'),
    hachiji: () => G.stanceFigure('hachiji'),
    zenkutsu: () => G.stanceFigure('zenkutsu', false, 'Hidari Zenkutsu-dachi'),
    zenkutsuR: () => G.stanceFigure('zenkutsu', true, 'Migi Zenkutsu-dachi'),
    kokutsu: () => G.stanceFigure('kokutsu', false, 'Migi Kokutsu-dachi'),
    kokutsuL: () => G.stanceFigure('kokutsu', true, 'Hidari Kokutsu-dachi'),
    kiba: () => G.stanceFigure('kiba'),
    kosa: () => G.stanceFigure('kosa', true, 'Migi Ashi-mae Kosa-dachi'),
    neko: () => G.stanceFigure('neko'),
    fudo: () => G.stanceFigure('fudo'),
    hangetsu: () => G.stanceFigure('hangetsu'),
    sanchin: () => G.stanceFigure('sanchin'),
    renoji: () => G.stanceFigure('renoji'),
    teiji: () => G.stanceFigure('teiji'),
    ashizenkutsu: () => G.stanceFigure('ashizenkutsu', false, 'Hidari Ashi-zenkutsu'),
    hizakutsu: () => G.stanceFigure('hizakutsu', false, 'Hidari Hizakutsu'),
    ashidachi: () => G.stanceFigure('ashidachi', false, 'Hidari Ashi-dachi'),
    orishiki: () => G.stanceFigure('orishiki', false, 'Migi Ashi Orishiki Hidari Hiza-tate'),
  };
  Object.keys(S).forEach((k) => SK.util.lazy(S, k, S[k]));
  // Grafik erst bei Bedarf: mit 3D-Figur gibt es keine SVG (G.byKey liefert dann '')
  const fig = (kind) => (key, caption, note) => G.figure(() => G.byKey(`${kind}:${key}`), caption, note, `${kind}:${key}`);
  const W = fig('wp');
  const M = fig('mv');
  const T = fig('tc');
  const A = fig('as');

  SK.generalUnits = [
    {
      id: 'etikette', title: 'Dojo & Etikette', kind: 'general', desc: 'Gruß, Kommandos, Dojo-Kun',
      lessons: [
        {
          id: 'et-dojo', title: 'Im Dojo', minGrade: '9kyu',
          learn: () => `
            <p><b>Dojo</b> bedeutet „Ort des Weges“. Karate beginnt und endet mit Respekt (Rei).</p>
            <ul>
              <li><b>Rei</b> – Gruß / Verbeugung. Im Stand meist aus <b>Musubi-dachi</b>.</li>
              <li><b>Seiza</b> – kniender Sitz (Fersensitz) zum An- und Abgrüßen.</li>
              <li><b>Mokuso</b> – Augen schließen, sammeln, meditieren. <b>Mokuso yame</b> – Meditation beenden.</li>
              <li><b>Shomen ni rei</b> – Gruß nach vorne (zur Stirnseite des Dojo). <b>Sensei ni rei</b> – Gruß an den Lehrer. <b>Otagai ni rei</b> – Gruß untereinander.</li>
              <li><b>Kiritsu</b> – Aufstehen.</li>
              <li><b>Yoi</b> – Bereit. <b>Hajime</b> – Beginnen. <b>Yame</b> – Aufhören. <b>Naore</b> – Zurück in die Ausgangsstellung. <b>Mawatte</b> – Wenden.</li>
              <li><b>Sensei</b> – Lehrer; <b>Senpai</b> – Fortgeschrittener; <b>Kohai</b> – Jüngerer/Anfänger.</li>
              <li>Laut DJKB-Prüfungsordnung muss man zum 9. Kyu die Etikette des An- und Abgrüßens beherrschen.</li>
            </ul>
            ${grid(T('rei', 'Rei'), T('seiza', 'Seiza'), T('mokuso', 'Mokuso'), T('kiritsu', 'Kiritsu'), T('yoi', 'Yoi'), T('mawatte', 'Mawatte'))}`,
        },
        {
          id: 'et-dojokun', title: 'Dojo-Kun', minGrade: '9kyu',
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
      id: 'geschichte', title: 'Geschichte & Philosophie', kind: 'general', desc: 'Funakoshi, JKA, DJKB, Niju-Kun',
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
      id: 'begriffe', title: 'Begriffe & Zählen', kind: 'general', desc: 'Japanische Grundbegriffe',
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
          id: 'te-koerper', title: 'Körperwaffen', minGrade: '8kyu',
          learn: () => `
            <ul>
              <li><b>Seiken</b> – Vorderseite der Faust (Knöchel von Zeige- und Mittelfinger)</li>
              <li><b>Uraken</b> – Faustrücken</li>
              <li><b>Tettsui / Kentsui</b> – Hammerfaust (Kleinfingerseite der Faust)</li>
              <li><b>Shuto</b> – Handkante; <b>Haito</b> – innere Handkante (Daumenseite)</li>
              <li><b>Nukite</b> – Speerhand (Fingerspitzen); <b>Teisho</b> – Handballen; <b>Haishu</b> – Handrücken</li>
              <li><b>Enpi / Hiji</b> – Ellbogen</li>
              <li><b>Koshi</b> (Josokutei) – Fußballen (Mae-geri, Mawashi-geri)</li>
              <li><b>Sokuto</b> – Fußkante (Yoko-geri); <b>Kakato</b> – Ferse (Ushiro-geri); <b>Haisoku</b> – Fußrücken</li>
              <li><b>Hiza</b> – Knie; <b>Zenwan</b> – Unterarm</li>
            </ul>
            <h4>Hand</h4>
            ${grid(W('seiken', 'Seiken'), W('uraken', 'Uraken'), W('tettsui', 'Tettsui / Kentsui'), W('shuto', 'Shuto'), W('haito', 'Haito'), W('nukite', 'Nukite'), W('teisho', 'Teisho'), W('haishu', 'Haishu'))}
            <h4>Fuß, Arm und Bein</h4>
            ${grid(W('koshi', 'Koshi (Fußballen)'), W('sokuto', 'Sokuto (Fußkante)'), W('kakato', 'Kakato (Ferse)'), W('haisoku', 'Haisoku (Fußrücken)'), W('hiji', 'Hiji / Enpi (Ellbogen)'), W('zenwan', 'Zenwan (Unterarm)'), W('hiza', 'Hiza (Knie)'))}`,
        },
        {
          id: 'te-konzepte', title: 'Wichtige Konzepte', minGrade: '7kyu',
          learn: () => `
            <ul>
              <li><b>Kiai</b> – Kampfschrei; Vereinigung von Kraft und Geist im Moment der Technik.</li>
              <li><b>Kime</b> – Konzentration aller Kraft im Treffpunkt; <b>Kime-Waza</b> – entscheidende (abschließende) Technik.</li>
              <li><b>Hikite</b> – zurückziehende Hand zur Hüfte.</li>
              <li><b>Hanmi</b> – Oberkörper halb seitlich (45°); <b>Shomen</b> – frontal; <b>Gyaku-hanmi</b> – umgekehrt halbseitlich.</li>
              <li><b>Kamae</b> – Kampfhaltung (z. B. Chudan-, Gedan-, Shuto-Kamae); <b>Shizentai</b> – natürliche Haltung.</li>
              <li><b>Zanshin</b> – wache Aufmerksamkeit nach der Technik.</li>
              <li><b>Maai</b> – Kampfdistanz; <b>Deai</b> – Treffen/Kontern im Moment des gegnerischen Angriffs.</li>
              <li><b>Kogeki</b> – Angriff; <b>Uke</b> – Abwehr (auch: der Abwehrende).</li>
              <li><b>Te</b> – Hand; <b>Do</b> – Weg; <b>Dojo</b> – Ort des Weges.</li>
              <li><b>Suri-ashi</b> – Gleitschritt; <b>Yori-ashi</b> – Nachziehschritt (beide Füße gleiten, Stand bleibt).</li>
              <li><b>Sun-dome</b> – Technik kontrolliert kurz vor dem Ziel abstoppen.</li>
              <li><b>Tai-sabaki</b> – Körperausweichen; <b>Ashi-barai</b> – Fußfeger.</li>
              <li><b>Shiai</b> – Wettkampf.</li>
              <li><b>Bunkai</b> – Anwendung/Analyse der Kata-Techniken.</li>
            </ul>
            <h4>Grundprinzipien</h4>
            <ul>
              <li><b>Stand als Fundament</b> – wie ein Haus auf seinem Fundament steht jede Technik auf dem Stand. Ein wackliger oder unfertiger Stand macht auch die beste Arm- oder Beintechnik wirkungslos.</li>
              <li><b>Kraft aus dem Boden</b> – bei einer Handtechnik drückt der hintere Fuß aktiv gegen den Boden. Diese Kraft läuft über das Bein zur Körpermitte, die Hüfte verstärkt sie, Rumpf und zurückziehender Arm (Hikite) leiten sie zum Ziel. Eine Technik ist nie nur Arm oder Bein, sondern immer der ganze Körper.</li>
              <li><b>Fußtechniken</b> wirken auf andere Distanzen und in anderen Rhythmen als Handtechniken und erweitern so die Möglichkeiten im Kampf – auch sie brauchen den Einsatz des ganzen Körpers.</li>
              <li><b>Abwehr und Konter</b> gehören zusammen: Eine Abwehr soll den Angriff schnell vom Ziel ablenken; folgt kein schneller Konter, ist sie unvollständig – außer man verzichtet bewusst aus taktischen Gründen darauf. Treffender ist daher „Verteidigungstechnik“.</li>
              <li><b>Fußarbeit</b> entscheidet über die Distanz: Eine Abwehr kann scheitern, weil sie nicht durch Gleitschritt oder Körperdrehung unterstützt wurde, oder der Konter wird schwach, weil der Abstand zu kurz oder zu lang ist (siehe <a href="#/wissen/da-ashi">Fußbewegungen</a>).</li>
            </ul>
            <h4>Haltung und Kraft</h4>
            ${grid(T('kiai', 'Kiai'), T('kime', 'Kime'), T('hikite', 'Hikite'), T('hanmi', 'Hanmi'), T('gyaku-hanmi', 'Gyaku-hanmi'), T('shizentai', 'Shizentai'))}
            <h4>Partner und Distanz</h4>
            ${grid(T('maai', 'Maai'), T('kogeki', 'Kogeki'), T('deai', 'Deai'), T('zanshin', 'Zanshin'), T('sun-dome', 'Sun-dome'), T('bunkai', 'Bunkai'))}
            <h4>Schritte und Ausweichen</h4>
            ${grid(T('suri-ashi', 'Suri-ashi'), T('yori-ashi', 'Yori-ashi'), T('tai-sabaki', 'Tai-sabaki'), T('ashi-barai', 'Ashi-barai'))}`,
        },
      ],
    },
    {
      id: 'dachi', title: 'Dachi – Stände', kind: 'general', desc: 'Grundstellungen mit Grafiken',
      lessons: [
        {
          id: 'da-grund', title: 'Grund- & Natürliche Stände', minGrade: '9kyu',
          learn: () => `<p>Stabile Stände sind das <b>Fundament</b> jeder Technik: Steht der Körper nicht sicher, verpufft die Kraft von Armen und Beinen. Jede Grafik zeigt den Stand als 3D-Figur; „Fußbild“ zeigt die Füße von oben mit der Gewichtsverteilung und ungefähren Maßen.</p>
            ${grid(S.musubi, S.heisoku, S.hachiji)}
            <ul>
              <li><b>Musubi-dachi</b>: Grußstellung – Fersen zusammen, Fußspitzen geöffnet; im Shotokan der Stand für den Gruß im Stehen (Ritsu-rei).</li>
              <li><b>Heisoku-dachi</b>: Füße geschlossen (z. B. Yoi von Tekki, Bassai Dai, Jion, Enpi).</li>
              <li><b>Hachiji-dachi</b> (Soto-Hachiji-dachi): natürlicher Stand, Füße schulterbreit – Yoi der Heian-Kata; eine Form von <b>Shizentai</b>.</li>
            </ul>`,
        },
        {
          id: 'da-kampf', title: 'Zenkutsu, Kokutsu, Kiba', minGrade: '9kyu',
          learn: () => `${grid(S.zenkutsu, S.zenkutsuR, S.kokutsu, S.kokutsuL, S.kiba)}
            <p class="muted small">Die Prozentzahlen im „Fußbild“ zeigen, wie das Gewicht verteilt ist. Im JKA-Kata-Buch heißt Zenkutsu-dachi nach dem <b>vorderen</b> Bein, Kokutsu-dachi nach dem <b>hinteren</b> (belasteten) Bein – z. B. „Migi Kokutsu-dachi, Hidari Shuto-uke“: rechtes Bein hinten, linkes vorne.</p>
            <ul>
              <li><b>Zenkutsu-dachi (Zk)</b> – Vorwärtsstellung: vorderes Knie gebeugt (über dem Fuß), hinteres Bein gestreckt, Gewicht überwiegend vorne. Der am häufigsten genutzte Stand im Shotokan.</li>
              <li><b>Kokutsu-dachi (Kk)</b> – Rückwärtsstellung: Gewicht überwiegend hinten, hinterer Fuß quer, vorderer Fuß zeigt nach vorne. Meist für Abwehrtechniken, in manchen Kata auch mit Angriffen verbunden.</li>
              <li><b>Kiba-dachi (Kb)</b> – Reiterstellung: breit, Füße parallel, Gewicht gleich verteilt – der Name kommt vom Sitz auf einem Pferd.</li>
              <li>Abkürzungen in der DJKB-Prüfungsordnung: <b>Zk, Kk, Kb</b>.</li>
              <li><b>Hidari</b> Zenkutsu-dachi = linkes Bein vorne.</li>
            </ul>`,
        },
        {
          id: 'da-weitere', title: 'Weitere Stände', minGrade: '5kyu',
          learn: () => `${grid(S.kosa, S.neko, S.fudo, S.hangetsu, S.sanchin, S.renoji, S.teiji)}
            <ul>
              <li><b>Kosa-dachi</b> – Kreuzstand (Begriff der Theorie zum 1. Dan); auch für Anwendungen mit Körperdrehung.</li>
              <li><b>Neko-ashi-dachi</b> – Katzenfußstand, fast das ganze Gewicht hinten – wie eine Katze kurz vor dem Sprung.</li>
              <li><b>Fudo-dachi</b> (Sochin-dachi) – „unbeweglicher Stand“: eine feste Basis, aus der eine Technik viel Kraft entfalten kann.</li>
              <li><b>Hangetsu-dachi</b> – Halbmondstand (aus der Kata Hangetsu): etwa eine Fußlänge kürzer als Zenkutsu-dachi, Füße etwa schulterbreit. Laut JKA-Buch (Vol. 2) sind Knie und Oberschenkelinnenseiten zur Mitte gespannt, die Fußsohlen „greifen“ den Boden; der vordere Fuß kommt im Halbmondschritt (Bogen von innen nach außen).</li>
              <li><b>Renoji-dachi</b> – L-förmiger Stand; <b>Teiji-dachi</b> – T-förmiger Stand.</li>
              <li><b>Sanchin-dachi</b> – Sanduhrstand, Knie nach innen gespannt: sehr kurz, beim Gehen werden die Füße zur Mitte geführt – das ergibt die Form einer Sanduhr.</li>
            </ul>
            <h4>Stände aus dem JKA-Kata-Buch</h4>
            ${grid(S.ashizenkutsu, S.hizakutsu, S.ashidachi, S.orishiki)}`,
        },
        {
          id: 'da-ashi', title: 'Fußbewegungen (Ashi-sabaki)', minGrade: '8kyu',
          learn: () => `
            <p>Gute Beweglichkeit auf dem Boden ist nicht selbstverständlich und muss eigens geübt werden. Selbst Fortgeschrittene schätzen die Distanz oft falsch ein: Eine Abwehr scheitert, weil sie nicht durch Gleitschritt oder Körperdrehung unterstützt wird, oder der Konter wird schwach, weil der Abstand zu kurz oder zu groß ist.</p>
            <p class="muted small">So liest man die Fußbilder: Blick von oben, „vorne“ ist oben. Blass = Ausgangslage, kräftig rot = Endlage, rot gestrichelt = Weg des Fußes, Zahlen = Reihenfolge. „▶ Bewegung“ spielt den Schritt ab.</p>
            <h4>Schreiten (Ayumi-ashi)</h4>
            <ul>
              <li><b>Ayumi-ashi</b> – der normale Schritt: der hintere Fuß wird zum vorderen. Bei Ständen mit Breite (z. B. Zenkutsu-dachi) kommen die Füße in der Mitte des Schritts zusammen – der Fuß beschreibt einen Bogen.</li>
              <li>Bei Ständen mit beiden Füßen <b>auf einer Linie</b> (z. B. Kokutsu-dachi) ist kein Bogen nötig: der hintere Fuß geht gerade nach vorne.</li>
            </ul>
            ${grid(A('ayumi-ashi', 'Ayumi-ashi', 'Bogen über die Mitte'), A('ayumi-ashi-linie', 'Ayumi-ashi auf einer Linie', 'gerade, z. B. in Kokutsu-dachi'))}
            <h4>Gleiten (Suri-ashi)</h4>
            <ul>
              <li><b>Okuri-suri-ashi</b> – zuerst bewegt sich der Fuß, der näher am Ziel ist; der andere zieht nach. Vorwärts, diagonal oder zur Seite: erst vorne, dann hinten. Rückwärts: erst hinten, dann zieht der vordere nach.</li>
              <li><b>Tsugi-suri-ashi</b> – größere Reichweite: vorwärts setzt erst der hintere Fuß zum vorderen, dann gleitet der vordere weit vor. Rückwärts setzt erst der vordere Fuß nach hinten.</li>
              <li><b>Yori-ashi</b> – beide Füße gleiten gleichzeitig, der Stand bleibt; für kleine Distanzänderungen und um im Kampf den Rhythmus zu wechseln oder einen Angriff zu verschleiern.</li>
              <li><b>Ashi-fumikae</b> – Beinwechsel am Platz. Die Energie geht in Richtung der Handlung: nach vorne erst den vorderen Fuß zurück, dann den hinteren vor.</li>
            </ul>
            ${grid(A('okuri-suri-ashi', 'Okuri-suri-ashi'), A('tsugi-suri-ashi', 'Tsugi-suri-ashi'), A('yori-ashi', 'Yori-ashi'), A('ashi-fumikae', 'Ashi-fumikae'))}
            <h4>Drehen und Übersetzen</h4>
            <ul>
              <li><b>Tai-sabaki</b> – kreisförmige Körperdrehungen zum Ausweichen im Kumite und bei Partnerübungen. Üblich sind Drehungen um 45° bis 180°: der hintere Fuß setzt im Bogen um, der vordere dreht sich auf der Stelle.</li>
              <li><b>Yoko-sashi-ashi</b> – seitlicher Übersetzschritt: ein Fuß setzt vor dem anderen über (die Ferse ist dabei noch angehoben), dann tritt der andere seitlich weiter. Oft ein Übergang zwischen zwei Ständen oder zu einem Fußtritt – im Kihon meist mit Yoko-geri, in Kata besonders in den Tekki-Kata.</li>
              <li><b>Shaho-sashi-ashi</b> – derselbe Schritt, nur diagonal; kommt gelegentlich in höheren Kata vor, um die Richtung zu wechseln.</li>
            </ul>
            ${grid(A('tai-sabaki-45', 'Tai-sabaki 45°'), A('tai-sabaki-180', 'Tai-sabaki 180°'), A('yoko-sashi-ashi', 'Yoko-sashi-ashi'), A('shaho-sashi-ashi', 'Shaho-sashi-ashi'))}
            <h4>Fußfeger (Ashi-barai)</h4>
            <p>Fußfeger sind fortgeschrittene Techniken – sie setzen gute Grundlagen und Körperbeherrschung voraus. Ein Feger nimmt dem Partner kurz das Gleichgewicht, sodass er der Folgetechnik nichts entgegensetzen kann; schon das verschafft einen psychologischen Vorteil.</p>
            <ul>
              <li><b>Teisoku-ashi-barai</b> – mit der Fußsohle, aus der Kamae mit dem vorderen oder hinteren Fuß.</li>
              <li><b>Haisoku-ashi-barai</b> – mit dem Spann, meist mit dem vorderen Fuß und gut vorbereitet.</li>
              <li><b>Komura-ashi-barai</b> – mit der Wade, meist innerhalb einer Kombination.</li>
            </ul>
            ${grid(T('teisoku-barai', 'Teisoku-ashi-barai'), T('haisoku-barai', 'Haisoku-ashi-barai'), T('komura-barai', 'Komura-ashi-barai'))}`,
        },
      ],
    },
    {
      id: 'kihon', title: 'Kihon – Techniken', kind: 'general', desc: 'Tsuki, Uke, Uchi, Geri',
      lessons: [
        {
          id: 'ki-tsuki', title: 'Tsuki – Fauststöße', minGrade: '9kyu',
          learn: () => `
            <ul>
              <li><b>Choku-zuki</b> – gerader Fauststoß im Stand.</li>
              <li><b>Oi-zuki</b> (Jun-zuki) – Stoß mit der Hand der Seite des vorderen Beins, meist mit Schritt.</li>
              <li><b>Gyaku-zuki</b> – Stoß mit der Hand der Gegenseite zum vorderen Bein, mit Hüftdrehung.</li>
              <li><b>Kizami-zuki</b> – Stoß mit der vorderen Hand ohne Schritt.</li>
              <li><b>Sanbon-zuki</b> – drei Fauststöße (in der DJKB-Prüfung: Jodan/Chudan/Chudan).</li>
              <li><b>Ren-zuki</b> – schnelle Folge von Stößen; <b>Morote-zuki</b> – Doppelfauststoß.</li>
              <li><b>Kagi-zuki</b> – Hakenstoß; <b>Ura-zuki</b> – kurzer Stoß mit Handrücken nach unten; <b>Age-zuki</b> – Aufwärtsstoß; <b>Yama-zuki</b> – „Bergfauststoß“.</li>
              <li><b>Tate-zuki</b> – Stoß mit senkrechter Faust auf dem kürzesten Weg; <b>Mawashi-zuki</b> – Stoß im Bogen (z. B. Schläfe, seitliche Rippen); <b>Awase-zuki</b> – U-förmiger Doppelstoß (oben Jodan, unten Ura-zuki), engere Form des Yama-zuki mit aufrechtem Oberkörper.</li>
              <li>Zum Unterschied: <b>Kizami-zuki</b> wird oft durch einen Gleitschritt unterstützt, um in die Distanz zu kommen; bei <b>Oi-zuki</b> stößt die Hand der Seite, die den Schritt macht – so erreicht man das Ziel aus großer Entfernung.</li>
              <li>Laut DJKB-Prüfungsordnung werden alle Fauststöße generell <b>Chudan</b> ausgeführt, sofern nichts anderes angegeben ist.</li>
            </ul>
            ${grid(M('oi-zuki', 'Oi-zuki', 'Faust und vorderer Fuß auf derselben Seite'), M('gyaku-zuki', 'Gyaku-zuki', 'Faust und vorderer Fuß auf entgegengesetzten Seiten'))}
            <h4>Weitere Fauststoße</h4>
            ${grid(T('choku-zuki', 'Choku-zuki'), T('kizami-zuki', 'Kizami-zuki'), T('sanbon-zuki', 'Sanbon-zuki'), T('ren-zuki', 'Ren-zuki'), T('morote-zuki', 'Morote-zuki'), T('kagi-zuki', 'Kagi-zuki'), T('ura-zuki', 'Ura-zuki'), T('age-zuki', 'Age-zuki'), T('yama-zuki', 'Yama-zuki'), T('tate-zuki', 'Tate-zuki'), T('mawashi-zuki', 'Mawashi-zuki'), T('awase-zuki', 'Awase-zuki'))}`,
        },
        {
          id: 'ki-uke', title: 'Uke – Abwehrtechniken', minGrade: '9kyu',
          learn: () => `
            <ul>
              <li><b>Gedan-barai</b> – Abwehr nach unten (fegend).</li>
              <li><b>Age-uke</b> – Abwehr nach oben (Jodan).</li>
              <li><b>Soto-uke</b> – Abwehr von außen nach innen (Chudan).</li>
              <li><b>Uchi-uke</b> – Abwehr von innen nach außen (Chudan).</li>
              <li><b>Shuto-uke</b> – Handkantenabwehr, meist in Kokutsu-dachi.</li>
              <li><b>Morote-uke</b> – unterstützte Abwehr (zweite Faust am Ellbogen).</li>
              <li><b>Juji-uke / Kosa-uke</b> – gekreuzte Abwehr; <b>Kakiwake-uke</b> – auseinanderdrückende Abwehr.</li>
              <li><b>Nagashi-uke</b> – fließende, ablenkende Abwehr (Theorie 1. Dan); <b>Osae-uke</b> – drückende Abwehr.</li>
              <li><b>Kake-uke</b> – Hakenabwehr; <b>Teisho-uke</b> – Handballenabwehr; <b>Sukui-uke</b> – schöpfende Abwehr.</li>
              <li><b>Manji-uke</b> – Doppelabwehr: eine Hand Gedan-barai, die andere schützt oben (Jodan-uchi-uke).</li>
              <li><b>Te-nagashi-uke</b> – die offene Hand lenkt Jodan- oder Chudan-Angriffe zur Seite (vor allem im Kampf); <b>Gedan-nagashi-uke</b> – ablenkende Abwehr unten, in Gegenrichtung zum Gedan-barai.</li>
              <li>Paare mit Gegenrichtung: <b>Soto-uke</b> (außen → innen) und <b>Uchi-uke</b> (innen → außen) schützen beide Chudan; <b>Shuto-uke</b> wehrt wie Uchi-uke nach außen ab.</li>
            </ul>
            ${grid(M('age-uke', 'Age-uke', 'nach oben'), M('gedan-barai', 'Gedan-barai', 'nach unten, fegend'), M('soto-uke', 'Soto-uke', 'von außen nach innen'), M('uchi-uke', 'Uchi-uke', 'von innen nach außen'))}
            <h4>Weitere Abwehrtechniken</h4>
            ${grid(T('shuto-uke', 'Shuto-uke'), T('morote-uke', 'Morote-uke'), T('juji-uke', 'Juji-uke'), T('kakiwake-uke', 'Kakiwake-uke'), T('nagashi-uke', 'Nagashi-uke'), T('osae-uke', 'Osae-uke'), T('kake-uke', 'Kake-uke'), T('teisho-uke', 'Teisho-uke'), T('sukui-uke', 'Sukui-uke'), T('manji-uke', 'Manji-uke'))}`,
        },
        {
          id: 'ki-uchi', title: 'Uchi – Schläge', minGrade: '7kyu',
          learn: () => `
            <ul>
              <li><b>Uraken-uchi</b> – Faustrückenschlag (z. B. Tate-uraken, Yoko-mawashi-uchi).</li>
              <li><b>Tettsui-uchi / Kentsui-uchi</b> – Hammerfaustschlag.</li>
              <li><b>Shuto-uchi</b> – Handkantenschlag.</li>
              <li><b>Empi-uchi / Enpi-uchi</b> – Ellbogenschlag (Mae-, Yoko-, Ushiro-, Mawashi-, Tate-, Otoshi-enpi).</li>
              <li><b>Haito-uchi</b> – Schlag mit der inneren Handkante.</li>
              <li>In der Prüfungsordnung ab dem 6. Kyu: Soto-uke / umsetzen in Kb mit <b>Yoko-Empi-Uchi</b>; ab dem 5. Kyu zusätzlich <b>Tate-Uraken</b>.</li>
            </ul>
            ${grid(W('uraken', 'Uraken-uchi'), W('tettsui', 'Tettsui-uchi'), W('shuto', 'Shuto-uchi'), W('hiji', 'Enpi-uchi'))}
            <h4>Die Schläge in Bewegung</h4>
            ${grid(T('uraken-uchi', 'Uraken-uchi'), T('tettsui-uchi', 'Tettsui-uchi'), T('shuto-uchi', 'Shuto-uchi'), T('haito-uchi', 'Haito-uchi'), T('enpi-uchi', 'Enpi-uchi'), T('furi-enpi', 'Furi-enpi'))}
            <h4>Ellbogen (Enpi) in alle Richtungen</h4>
            <ul>
              <li><b>Mae-enpi</b> – nach vorne: der Ellbogen bleibt dicht am Körper, die Faust geht dafür über den Bauch zur anderen Seite.</li>
              <li><b>Mawashi-enpi</b> – im waagerechten Bogen, ohne Kontakt zum Körper.</li>
              <li><b>Age-enpi</b> – senkrecht nach oben, dicht am Körper; die Faust endet neben dem Kopf.</li>
              <li><b>Yoko-enpi</b> – zur Seite, bevorzugt in Kiba-dachi; <b>Otoshi-enpi</b> – senkrecht nach unten, in Fudo- oder Kiba-dachi.</li>
              <li><b>Ushiro-enpi</b> – nach hinten, Jodan oder Chudan.</li>
              <li>Schläge (Uchi) holen ihre Kraft aus dem Schnappen des Ellbogens. Shuto- und Haito-uchi gibt es von innen und von außen, Uraken- und Tettsui-uchi in mehreren Formen.</li>
            </ul>
            ${grid(T('yoko-enpi', 'Yoko-enpi'), T('mawashi-enpi', 'Mawashi-enpi'), T('age-enpi', 'Age-enpi'), T('otoshi-enpi', 'Otoshi-enpi'), T('ushiro-enpi', 'Ushiro-enpi'))}`,
        },
        {
          id: 'ki-geri', title: 'Geri – Fußtritte', minGrade: '8kyu',
          learn: () => `
            <ul>
              <li><b>Mae-geri</b> – Fußtritt nach vorne (Fußballen); Keage = schnappend, Kekomi = stoßend.</li>
              <li><b>Yoko-geri-keage</b> – seitlicher Schnapptritt; <b>Yoko-geri-kekomi</b> – seitlicher Stoßtritt (Fußkante).</li>
              <li><b>Mawashi-geri</b> – Halbkreisfußtritt.</li>
              <li><b>Ushiro-geri</b> – Fußtritt nach hinten (Ferse).</li>
              <li><b>Mikazuki-geri</b> – Sicheltritt; <b>Fumikomi</b> – Stampftritt.</li>
              <li><b>Ren-geri</b> – Kombination mehrerer Fußtritte (Theorie 3. Kyu).</li>
              <li><b>Sonoba-geri</b> – Fußtritte am Platz (Standübung, Theorie 1. Kyu).</li>
              <li><b>Kizami-geri</b> – Tritt mit dem vorderen Bein (Theorie 2. Kyu).</li>
              <li><b>Mae-geri-kekomi</b> – Stoßtritt nach vorne mit Ferse oder Fußballen; <b>Ura-mawashi-geri</b> – Halbkreistritt in Gegenrichtung zum Mawashi-geri (Sohle oder Ferse); <b>Ushiro-mawashi-geri</b> – derselbe Tritt aus einer Drehung wie beim Ushiro-geri.</li>
              <li><b>Hiza-geri</b> – Kniestoß senkrecht nach oben; <b>Mawashi-hiza-geri</b> – Kniestoß im Bogen. Fuß und Zehen sind dabei zum Schienbein angezogen.</li>
              <li>DJKB: <b>Ushiro-geri und Yoko-geri-kekomi</b> generell Chudan; alle übrigen Fußtritte (auch Kizami-mae-geri) generell <b>Jodan</b>. Seitliche Fußtritte in beide Richtungen.</li>
            </ul>
            ${grid(M('mae-geri', 'Mae-geri', 'nach vorne'), M('yoko-geri', 'Yoko-geri', 'zur Seite'), M('mawashi-geri', 'Mawashi-geri', 'im Halbkreis'), M('ushiro-geri', 'Ushiro-geri', 'nach hinten'), M('mikazuki-geri', 'Mikazuki-geri', 'Sicheltritt'))}
            <h4>Weitere Fußtechniken</h4>
            ${grid(T('yoko-geri-keage', 'Yoko-geri-keage'), T('fumikomi', 'Fumikomi'), T('ren-geri', 'Ren-geri'), T('sonoba-geri', 'Sonoba-geri'), T('kizami-geri', 'Kizami-geri'), T('hiza-geri', 'Hiza-geri'), T('mae-geri-kekomi', 'Mae-geri-kekomi'), T('ura-mawashi-geri', 'Ura-mawashi-geri'), T('ushiro-mawashi-geri', 'Ushiro-mawashi-geri'), T('mawashi-hiza-geri', 'Mawashi-hiza-geri'))}`,
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
            ${grid(T('gohon-kumite', 'Gohon-Kumite'), T('kihon-ippon-kumite', 'Kihon-Ippon-Kumite'), T('maai', 'Maai', 'richtige Distanz zum Partner'))}`,
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
