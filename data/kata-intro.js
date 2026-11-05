/* Allgemeines Kata-Wissen aus Karate-Do Kata Vol. 1 (Vorwort, Content and Guidance, Anhang). */
(function () {
  'use strict';
  const P = (n) => SK.bookSrc(n);

  SK.kataOrder = ['heian-shodan', 'heian-nidan', 'heian-sandan', 'heian-yondan', 'heian-godan', 'tekki-shodan', 'bassai-dai', 'kanku-dai', 'jion', 'enpi', 'hangetsu'];

  SK.kataIntroUnit = {
    id: 'kata-buch',
    title: 'Kata-Grundlagen (Buch)',
    kind: 'kata',
    desc: 'Begriffe, Prinzipien und Ziele aus „Karate-Do Kata Vol. 1“',
    lessons: [
      {
        id: 'kb-buch',
        title: 'Über das Buch',
        learn: () => `
          <p><b>Karate-Do Kata Vol. 1</b> ist das offizielle Lehrbuch der <b>JKA (Shihan-kai)</b>. Die englische Ausgabe erschien 2003 und fasst die japanischen Bände 1 und 2 zusammen.</p>
          <ul>
            <li>Ziel: Die Kata sollen nach <b>einem einheitlichen Modell</b> definiert werden. Die Arbeit begann im April 1993 durch die Instruktoren des JKA-Hauptquartiers und wurde im September 1993 vom Shihan-kai genehmigt.</li>
            <li>Vorsitzender des Shihan-kai: <b>Motokuni Sugiura</b>.</li>
            <li>Enthaltene Kata: Heian Shodan–Godan, Tekki Shodan, Bassai Dai, Kanku Dai, Jion, Enpi.</li>
            <li>Verglichene Quellen u. a.: <i>Karate-Do Kyohan</i> (Gichin Funakoshi), <i>Best Karate</i> (Masatoshi Nakayama), <i>Rentan Goshin Karate-Jutsu</i> (Funakoshi, 1925).</li>
            <li>Volume One und Two wurden für Kata-Turniere beim <b>Shoto Cup 2003</b> eingeführt.</li>
            <li>Die Sentei-Kata <b>Hangetsu</b> steht in <b>Karate-Do Kata Vol. 2</b> (JKA, englische Ausgabe 2008, S. 74–111) – sie ist als einzige Kata dieses Bandes in der App, mit Angabe der Buchseiten aus Band 2.</li>
          </ul>`,
      },
      {
        id: 'kb-prinzipien',
        title: 'Prinzipien der Kata',
        learn: () => `
          <ul>
            <li>Das Ziel des Karate liegt in der Fähigkeit, <b>Kime</b> zu erzeugen – reines Kime entsteht nur durch unendlich intensives Üben.</li>
            <li>Eine Kata besteht aus Techniken, Ständen, <b>Enbusen</b> (Bewegungslinie), Anzahl der Bewegungen sowie drei Schlüsselelementen:
              <b>Kraftstufen</b>, <b>Zusammenziehen und Ausdehnen des Körpers</b> und <b>Wechsel der Geschwindigkeit</b>.</li>
            <li>Eine Kata endet immer an ihrem <b>Ausgangspunkt</b>; alle Körperteile kommen im selben Moment zur Ruhe.</li>
            <li>Nach jeder Bewegung zeigt das Buch Fußstellung und Enbusen, am Ende jeder Kata eine Zusammenfassung.</li>
          </ul>
          <div class="gfx-grid">${SK.gfx.figure(SK.gfx.TECH.enbusen(), 'Enbusen', 'Bewegungslinie einer Kata')}</div>`,
      },
      {
        id: 'kb-begriffe',
        title: 'Begriffe & Definitionen',
        learn: () => `
          <ul>
            <li><b>Tsuki vs. Uchi</b>: Bei Tsuki wirkt die Kraft in Richtung des <i>gestreckten</i> Unterarms, bei Uchi im <i>rechten Winkel</i> dazu.</li>
            <li><b>Enpi</b> bezeichnet jede Ellbogentechnik. Zu Tsuki gehören Yoko-, Ushiro- und Otoshi-enpi; zu Uchi gehören Tate-, Mae-, Mawashi- und Furi-enpi.</li>
            <li><b>Keage vs. Kekomi</b>: Bei Kekomi (Stoßtritt) wirkt die Kraft in Richtung des gestreckten Unterschenkels, bei Keage (Schnapptritt) im rechten Winkel dazu.</li>
            <li><b>Oi-zuki</b> (auch <b>Jun-zuki</b>): Faust und vorderer Fuß auf derselben Seite. <b>Gyaku-zuki</b>: Faust und vorderer Fuß auf entgegengesetzten Seiten, Hüfte und Oberkörper drehen zum Ziel.</li>
            <li><b>Uchi-uke</b>: Außenseite des Unterarms, Bewegung von innen nach außen. <b>Soto-uke</b>: Innenseite des Unterarms, Bewegung von außen nach innen.</li>
            <li><b>Ashi-zenkutsu</b> ist kleiner (Breite und Länge) als Zenkutsu-dachi – z. B. Heian Nidan 16 und 19. Bei <b>Hiza-kutsu</b> ist die Technikrichtung anders als die Richtung des Zenkutsu-dachi – z. B. Heian Yondan 11.</li>
            <li><b>Jodan</b> = Gesichtshöhe, <b>Chudan</b> = Brusthöhe, <b>Gedan</b> = unterer Bauchbereich.</li>
          </ul>
          <div class="gfx-grid">${[
            SK.gfx.figure(SK.gfx.TECH['tsuki-uchi'](), 'Tsuki und Uchi'),
            SK.gfx.figure(SK.gfx.TECH['keage-kekomi'](), 'Kekomi und Keage'),
            SK.gfx.figure(null, 'Oi-zuki', '', 'mv:oi-zuki'),
            SK.gfx.figure(null, 'Gyaku-zuki', '', 'mv:gyaku-zuki'),
            SK.gfx.figure(null, 'Uchi-uke', '', 'mv:uchi-uke'),
            SK.gfx.figure(null, 'Soto-uke', '', 'mv:soto-uke'),
            SK.gfx.stanceFigure('ashizenkutsu'),
            SK.gfx.stanceFigure('hizakutsu'),
            SK.gfx.figure(null, 'Jodan, Chudan, Gedan', null, 'fig:levels'),
          ].join('')}</div>`,
      },
      {
        id: 'kb-ziele',
        title: 'Trefferzonen (Anhang)',
        learn: () => `
          <div class="gfx-grid">${SK.gfx.figure(null, 'Trefferzonen', 'Auswahl nach dem Anhang des Buchs', 'fig:targets')}</div>
          <ul>
            <li><b>Kasumi / Komekami</b> – Schläfe</li>
            <li><b>Jinchu / Bika</b> – zwischen Oberlippe und Nasenansatz</li>
            <li><b>Mikazuki / Shita-ago</b> – Kinn</li>
            <li><b>Suigetsu / Mizo-ochi</b> – Solarplexus</li>
            <li><b>Denko</b> – Bereich der „schwebenden“ Rippen; <b>Inazuma</b> – Bereich unter den schwebenden Rippen</li>
            <li><b>Myojo / Heso-no-shita</b> – knapp unter dem Bauchnabel</li>
            <li><b>Daitai</b> – Oberschenkel; <b>Hiza</b> – Knie; <b>Sokuhai / Sokko</b> – Fußrücken; <b>Sokutei</b> – Fußsohle</li>
            <li><b>Jowan</b> – Oberarm; <b>Zenwan</b> – Unterarm; <b>Hiji</b> – Ellbogen</li>
          </ul>`,
      },
    ],
  };

  SK.kataIntroQuestions = function () {
    let L = SK.qb('kb-buch', P(3));
    L.mc('Wer hat „Karate-Do Kata Vol. 1“ herausgegeben?', ['Die Japan Karate Association (JKA), Shihan-kai', 'Der DJKB', 'Gichin Funakoshi persönlich', 'Die World Karate Federation'], '', P(176));
    L.mc('Wer war Vorsitzender des Shihan-kai (Vorwort und Nachwort)?', ['Motokuni Sugiura', 'Masatoshi Nakayama', 'Hideo Ochi', 'Gichin Funakoshi'], '', P(3));
    L.mc('Welches Ziel nennt das Vorwort für die Kata-Bücher?', ['Die Kata nach einem einheitlichen Modell zu definieren', 'Neue Kata zu erfinden', 'Kata für den Vollkontakt anzupassen', 'Kata zu verkürzen'], '', P(3));
    L.mc('Wann begannen die JKA-Instruktoren mit der Arbeit am einheitlichen Kata-Modell?', ['April 1993', 'April 1949', 'Mai 1957', 'Januar 2003'], 'Genehmigt vom Shihan-kai im September 1993.', P(3));
    L.mc('Bei welchem Turnier sollten Volume One und Two erstmals international für Kata-Wettkämpfe gelten?', ['Shoto Cup 2003', 'Weltmeisterschaft 1975', 'Olympia 2020', 'Asian Games 1994'], '', P(3));
    L.multi('Welche Kata sind in „Karate-Do Kata Vol. 1“ enthalten?', ['Heian Shodan bis Godan', 'Tekki Shodan', 'Bassai Dai', 'Kanku Dai', 'Jion', 'Enpi'], ['Hangetsu', 'Gankaku'], '', P(5));
    L.mc('In welchem Band von „Karate-Do Kata“ (JKA) steht die Sentei-Kata Hangetsu?', ['Vol. 2', 'Vol. 1', 'In keinem – nur in Best Karate', 'Vol. 3'], 'Band 2 erschien 2008; die App nutzt daraus nur Hangetsu.', SK.bookSrc2(4));
    L.multi('Welche Werke wurden für das Buch verglichen?', ['Karate-Do Kyohan', 'Best Karate', 'Rentan Goshin Karate-Jutsu'], ['Dynamic Karate', 'Bubishi'], '', P(4));
    L.mc('Wer schrieb „Karate-Do Kyohan“?', ['Gichin Funakoshi', 'Masatoshi Nakayama', 'Motokuni Sugiura', 'Tsutomu Ohshima'], 'Ohshima übersetzte die englische Ausgabe (1973).', P(4));
    L.mc('Wer schrieb „Best Karate“?', ['Masatoshi Nakayama', 'Gichin Funakoshi', 'Hirokazu Kanazawa', 'Motokuni Sugiura'], '', P(4));
    L.mc('Wann wurde „Rentan Goshin Karate-Jutsu“ von Gichin Funakoshi veröffentlicht?', ['1925', '1941', '1977', '1993'], '', P(4));

    L = SK.qb('kb-prinzipien', P(4));
    L.mc('Worin liegt laut Buch das Ziel (die „Finalität“) des Karate?', ['In der Fähigkeit, Kime zu erzeugen', 'Im Gewinnen von Wettkämpfen', 'In möglichst vielen Techniken', 'In maximaler Beweglichkeit'], '', P(4));
    L.mc('Was ist ENBUSEN?', ['Die Bewegungs- bzw. Ausführungslinie einer Kata', 'Der Gruß am Anfang der Kata', 'Der Kampfschrei', 'Die Endposition'], '', P(4));
    L.multi('Welche drei Schlüsselelemente einer Kata nennt das Buch?', ['Stufen der Kraft', 'Zusammenziehen und Ausdehnen des Körpers', 'Wechsel der Geschwindigkeit der Techniken'], ['Lautstärke des Kiai', 'Anzahl der Sprünge'], '', P(4));
    L.mc('Wo endet eine Kata laut Buch immer?', ['An ihrem Ausgangspunkt', 'Einen Schritt vor dem Startpunkt', 'Dort, wo die letzte Technik endet', 'Seitlich versetzt'], '', P(4));
    L.mc('Was gilt am Ende jeder Bewegung laut „Content and Guidance“?', ['Alle Körperteile kommen im selben Moment zur Ruhe – unabhängig von der Geschwindigkeit', 'Die Hände kommen vor den Füßen zur Ruhe', 'Die Füße kommen vor den Händen zur Ruhe', 'Es gibt keine feste Regel'], '', P(4));
    L.mc('Was zeigt das Buch nach jeder Bewegung zusätzlich zum Text?', ['Eine Illustration der Fußbewegung und des Enbusen', 'Ein Foto des Gegners', 'Eine Punktewertung', 'Den Atemrhythmus'], '', P(4));

    L = SK.qb('kb-begriffe', P(4));
    L.mc('Wie wird im Buch jede Ellbogentechnik bezeichnet?', ['Enpi', 'Hiza', 'Haito', 'Teisho'], '', P(4));
    L.multi('Welche Ellbogentechniken zählt das Buch zur Kategorie TSUKI?', ['Yoko-enpi', 'Ushiro-enpi', 'Otoshi-enpi'], ['Tate-enpi', 'Mae-enpi', 'Mawashi-enpi'], '', P(4));
    L.multi('Welche Ellbogentechniken zählt das Buch zur Kategorie UCHI?', ['Tate-enpi', 'Mae-enpi', 'Mawashi-enpi', 'Furi-enpi'], ['Yoko-enpi', 'Otoshi-enpi'], '', P(4));
    L.mc('Wie wird OI-ZUKI auch genannt?', ['Jun-zuki', 'Gyaku-zuki', 'Kizami-zuki', 'Ura-zuki'], '', P(4));
    L.mc('Was gilt bei OI-ZUKI?', ['Stoßende Faust und vorderer Fuß sind auf derselben Seite', 'Stoßende Faust und vorderer Fuß sind auf entgegengesetzten Seiten', 'Es wird aus dem Stand ohne Schritt gestoßen', 'Es wird mit beiden Fäusten gestoßen'], '', P(4));
    L.mc('Was gilt bei GYAKU-ZUKI?', ['Stoßende Faust und vorderer Fuß sind auf entgegengesetzten Seiten; Hüfte und Oberkörper drehen zum Ziel', 'Faust und vorderer Fuß auf derselben Seite', 'Es ist ein Stoß nach hinten', 'Es ist ein Stoß mit dem Ellbogen'], '', P(4));
    L.mc('Wie unterscheidet sich ASHI-ZENKUTSU von ZENKUTSU-DACHI?', ['Er ist in Breite und Länge im Allgemeinen kleiner', 'Er ist doppelt so lang', 'Das Gewicht liegt hinten', 'Die Füße stehen gekreuzt'], 'Beispiel: Heian Nidan, Bewegungen 16 und 19.', P(4));
    L.mc('Was ist das Besondere an HIZA-KUTSU (z. B. Heian Yondan 11)?', ['Die Richtung der Technik ist anders als die Richtung des Zenkutsu-dachi', 'Man kniet auf dem Boden', 'Es ist ein Sprung', 'Es ist ein Stand auf einem Bein'], '', P(4));
    L.mc('Wie definiert das Buch CHUDAN?', ['Brusthöhe', 'Gesichtshöhe', 'Unterer Bauchbereich', 'Kniehöhe'], '', P(4));
    L.mc('Wie definiert das Buch GEDAN?', ['Unterer Bereich des Bauches', 'Kniehöhe', 'Brusthöhe', 'Fußhöhe'], '', P(4));

    L = SK.qb('kb-ziele', P(174));
    L.mc('Was bezeichnet KASUMI (auch Komekami)?', ['Die Schläfe', 'Das Kinn', 'Den Solarplexus', 'Den Oberschenkel'], '', P(174));
    L.mc('Was bezeichnet MIKAZUKI (auch Shita-ago) als Trefferzone?', ['Das Kinn', 'Die Schläfe', 'Das Knie', 'Den Oberarm'], '', P(174));
    L.mc('Was ist MYOJO (Heso-no-shita)?', ['Der Bereich knapp unter dem Bauchnabel', 'Der Solarplexus', 'Die Schläfe', 'Der Fußrücken'], '', P(174));
    L.mc('Wie heißt der Solarplexus als Trefferzone?', ['Suigetsu (Mizo-ochi)', 'Jinchu', 'Denko', 'Daitai'], '', P(174));
    L.mc('Was bezeichnet DAITAI?', ['Den Oberschenkel', 'Den Unterarm', 'Die Wade', 'Den Handrücken'], '', P(174));
    L.mc('Was bezeichnet SOKUTEI?', ['Die Fußsohle', 'Den Fußrücken', 'Die Fußkante', 'Die Ferse'], '', P(174));
    L.mc('Was bezeichnet ZENWAN?', ['Den Unterarm', 'Den Oberarm', 'Den Ellbogen', 'Das Handgelenk'], '', P(174));
    L.mc('Was bezeichnet JOWAN?', ['Den Oberarm', 'Den Unterarm', 'Die Schulter', 'Den Hals'], '', P(174));
    L.mc('Welcher Begriff bezeichnet den Bereich zwischen Oberlippe und Nasenansatz?', ['Jinchu (Bika)', 'Kasumi', 'Myojo', 'Inazuma'], '', P(174));
    L.mc('Was bezeichnet INAZUMA?', ['Den Bereich unter den schwebenden Rippen', 'Die Schläfe', 'Den Oberarm', 'Die Kniekehle'], '', P(174));
  };
  SK.lazyLearn(SK.kataIntroUnit);
})();
