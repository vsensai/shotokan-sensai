/* Kata-Daten Heian Shodan bis Godan. Einzige Quelle: Karate-Do Kata Vol. 1 (JKA).
   seq: [Nr, Stand, Technik, Seite der Scan-Datei (Buchseiten über SK.bookPages)]; Fakten-Fragen sind sinngemäß übersetzt. */
(function () {
  'use strict';
  const P = (n) => SK.bookSrc(n);

  SK.kata['heian-shodan'] = {
    id: 'heian-shodan', name: 'Heian Shodan', moves: 21, kiai: [9, 17], firstPage: 6,
    // Kata-Ansage: Bodenkarte nach der Fußskizze im Buch (vermessen mit tools/kata-pdf/embusen.py).
    // f = [linker Fuß, rechter Fuß] mit [x, y, Zehenrichtung (0 = vorne, im Uhrzeigersinn), Gewicht]; body = Körperrichtung,
    // look = Blick, falls zur Seite; turn = Drehung in Grad (negativ = links herum); h = Fußarbeit.
    ansage: {
      kana: 'へいあん しょだん',
      page: 16,
      lines: [[-1, 0, 1, 0], [-1, 2, 1, 2], [0, 0, 0, 2]],
      rei: { f: [[-0.04, 0.12, 330, 0.5], [0.06, 0.12, 30, 0.5]], body: 0, h: 'Verbeugung, Fersen zusammen' },
      yoi: { f: [[-0.16, 0.11, 333, 0.5], [0.25, 0.12, 25, 0.5]], body: 0, h: 'Erst linker, dann rechter Fuß nach außen' },
      moves: [
        { f: [[-0.44, -0.07, 265, 0.7], [0.14, 0.12, 314, 0.3]], body: 270, turn: -90, h: 'Blick nach links, linker Fuß gleitet nach links' },
        { f: [[-0.37, -0.11, 245, 0.3], [-0.89, 0.03, 272, 0.7]], body: 270, h: 'Rechter Fuß gleitet vor' },
        { f: [[-0.14, 0.05, 40, 0.3], [0.41, -0.03, 85, 0.7]], body: 90, turn: 180, h: 'Rechter Fuß gleitet zurück, Wendung rechts herum' },
        { f: [[-0.12, 0.07, 40, 0.3], [0.45, -0.03, 93, 0.7]], body: 90, via: [1, 0.18, -0.04, 90], h: 'Rechter Fuß zieht einen halben Schritt heran und geht wieder vor' },
        { f: [[0.91, 0.07, 90, 0.7], [0.42, -0.13, 107, 0.3]], body: 90, h: 'Linker Fuß gleitet vor' },
        { f: [[0.21, 0.58, 350, 0.7], [0.3, 0.03, 23, 0.3]], body: 0, turn: -90, h: 'Linker Fuß gleitet nach links auf die Mittellinie, Blick nach vorne' },
        { f: [[-0.09, 0.53, 329, 0.3], [0.09, 1.07, 335, 0.7]], body: 0, h: 'Rechter Fuß gleitet vor' },
        { f: [[-0.02, 1.58, 26, 0.7], [0.14, 1.06, 30, 0.3]], body: 0, h: 'Linker Fuß gleitet vor' },
        { f: [[-0.03, 1.58, 341, 0.3], [0.1, 2.09, 358, 0.7]], body: 0, h: 'Rechter Fuß gleitet vor – Kiai' },
        { f: [[0.68, 2.03, 92, 0.7], [0.11, 1.86, 120, 0.3]], body: 90, turn: -270, h: 'Rechtes Bein trägt, linker Fuß schwingt nach rechts, ¾ Drehung links herum' },
        { f: [[0.64, 2.06, 46, 0.3], [1.12, 1.89, 96, 0.7]], body: 90, h: 'Rechter Fuß gleitet vor' },
        { f: [[0.38, 1.97, 255, 0.3], [-0.09, 2.04, 272, 0.7]], body: 270, turn: 180, h: 'Rechter Fuß gleitet zurück, Wendung rechts herum' },
        { f: [[-0.66, 1.88, 263, 0.7], [-0.14, 2.09, 312, 0.3]], body: 270, h: 'Linker Fuß gleitet vor' },
        { f: [[0.11, 1.39, 177, 0.7], [-0.11, 1.83, 212, 0.3]], body: 180, turn: -90, h: 'Linker Fuß gleitet auf die Mittellinie, Blick zum Start' },
        { f: [[0.09, 1.36, 174, 0.3], [-0.08, 0.92, 186, 0.7]], body: 180, h: 'Rechter Fuß gleitet vor' },
        { f: [[0.1, 0.34, 192, 0.7], [-0.11, 0.85, 193, 0.3]], body: 180, h: 'Linker Fuß gleitet vor' },
        { f: [[0.15, 0.35, 163, 0.3], [-0.1, -0.24, 166, 0.7]], body: 180, h: 'Rechter Fuß gleitet vor – Kiai' },
        { f: [[-0.57, -0.0, 268, 0.3], [-0.06, 0.08, 356, 0.7]], body: 270, turn: -270, h: 'Rechtes Knie bleibt gebeugt, linker Fuß schwingt nach links, ¾ Drehung links herum' },
        { f: [[-0.52, -0.13, 223, 0.7], [-0.71, 0.34, 318, 0.3]], body: 315, turn: 45, h: 'Rechter Fuß gleitet schräg nach vorne links' },
        { f: [[-0.47, 0.16, 354, 0.7], [0.06, 0.06, 77, 0.3]], body: 90, turn: 135, h: 'Linkes Knie bleibt gebeugt, rechter Fuß schwingt nach rechts, Drehung rechts herum' },
        { f: [[0.47, 0.44, 31, 0.3], [0.22, -0.06, 127, 0.7]], body: 45, turn: -45, h: 'Linker Fuß gleitet schräg nach vorne rechts' },
      ],
      naore: { f: [[-0.23, 0.12, 332, 0.5], [0.2, 0.12, 30, 0.5]], body: 0, turn: -45, h: 'Rechter Fuß bleibt, linker Fuß zieht zurück in Yoi' },
      end: { f: [[-0.05, 0.12, 330, 0.5], [0.05, 0.12, 30, 0.5]], body: 0, h: 'Verbeugung, Ende der Kata' },
    },
    yoi: 'Hachiji-dachi, beide Fäuste vor den Oberschenkeln (Handrücken nach vorne)',
    naore: 'Der rechte Fuß bleibt stehen, der linke Fuß geht zurück in die Yoi-Position.',
    continuous: [],
    slow: [],
    seq: [
      [1, 'Hidari Zenkutsu-dachi', 'Hidari Sokumen Hidari Gedan-barai', 6],
      [2, 'Migi Zenkutsu-dachi', 'Migi Chudan Oi-zuki', 6],
      [3, 'Migi Zenkutsu-dachi', 'Migi Gedan-barai', 7],
      [4, 'Migi Zenkutsu-dachi', 'Migi Kentsui Tate-mawashi-uchi', 7],
      [5, 'Hidari Zenkutsu-dachi', 'Hidari Chudan Oi-zuki', 7],
      [6, 'Hidari Zenkutsu-dachi', 'Hidari Gedan-barai', 8],
      [7, 'Migi Zenkutsu-dachi', 'Migi Jodan Age-uke', 8],
      [8, 'Hidari Zenkutsu-dachi', 'Hidari Jodan Age-uke', 9],
      [9, 'Migi Zenkutsu-dachi', 'Migi Jodan Age-uke', 9],
      [10, 'Hidari Zenkutsu-dachi', 'Hidari Gedan-barai', 10],
      [11, 'Migi Zenkutsu-dachi', 'Migi Chudan Oi-zuki', 10],
      [12, 'Migi Zenkutsu-dachi', 'Migi Gedan-barai', 10],
      [13, 'Hidari Zenkutsu-dachi', 'Hidari Chudan Oi-zuki', 11],
      [14, 'Hidari Zenkutsu-dachi', 'Hidari Gedan-barai', 11],
      [15, 'Migi Zenkutsu-dachi', 'Migi Chudan Oi-zuki', 11],
      [16, 'Hidari Zenkutsu-dachi', 'Hidari Chudan Oi-zuki', 12],
      [17, 'Migi Zenkutsu-dachi', 'Migi Chudan Oi-zuki', 12],
      [18, 'Migi Kokutsu-dachi', 'Hidari Shuto Chudan-uke', 13],
      [19, 'Hidari Kokutsu-dachi', 'Migi Shuto Chudan-uke', 14],
      [20, 'Hidari Kokutsu-dachi', 'Migi Shuto Chudan-uke', 14],
      [21, 'Migi Kokutsu-dachi', 'Hidari Shuto Chudan-uke', 15],
    ],
    learn: `
      <p>Heian Shodan ist die erste der fünf Heian-Kata und besteht laut Buch aus <b>21 Bewegungen</b>. Kiai bei Bewegung <b>9</b> (Age-uke) und <b>17</b> (Oi-zuki).</p>
      <ul>
        <li><b>Rei</b> in Musubi-dachi, <b>Yoi</b> in Hachiji-dachi: erst linkes, dann rechtes Bein; Fäuste vor den Oberschenkeln.</li>
        <li>Gedan-barai: Die Faust endet etwa <b>anderthalb Fäuste</b> über dem Knie.</li>
        <li>Age-uke: Abstand Handgelenk – Stirn etwa <b>eine Faust</b>; der Unterarm steht leicht schräg parallel zur Stirn.</li>
        <li>Bewegung 4: Den rechten Fuß einen <b>halben Schritt</b> zurückziehen und das Handgelenk eindrehen – wie um sich aus einem Griff zu befreien; danach Kentsui (Hammerfaust) in großem Kreis.</li>
        <li>Drei ähnliche Bewegungen (15, 16, 17): Die erste und die letzte stärker als die mittlere – die 17. mit mehr Kraft und etwas breiterem Stand.</li>
        <li>Shuto-uke in Kokutsu-dachi: Ellbogen anderthalb Fäuste vom Körper, die hintere Hand liegt waagerecht vor dem Solarplexus (Suigetsu).</li>
        <li>Naore: Der rechte Fuß bleibt, der linke Fuß geht zurück.</li>
      </ul>`,
    facts(L) {
      L.mc('Heian Shodan: Wo endet die Faust beim Gedan-barai ungefähr?', ['Etwa anderthalb Fäuste über dem Knie', 'Direkt auf dem Knie', 'Etwa drei Fäuste über dem Knie', 'Auf Hüfthöhe neben dem Körper'], 'Das Buch beschreibt die Endposition der Faust ca. anderthalb Faustbreiten über dem vorderen Knie.', P(6));
      L.mc('Heian Shodan, Bewegung 4: Was passiert mit dem rechten Fuß vor dem Kentsui-Schlag?', ['Er wird einen halben Schritt zurückgezogen und kehrt dann zurück', 'Er macht einen ganzen Schritt nach vorne', 'Er bleibt völlig unbewegt', 'Er stampft auf (Fumikomi)'], 'Hinweis im Buch: Der rechte Fuß wird einen halben Schritt zurückgezogen, während das Handgelenk eingedreht wird – wie um sich aus einem Griff zu lösen.', P(7));
      L.mc('Welche Bedeutung hat das Eindrehen des Handgelenks vor dem Kentsui-Schlag in Heian Shodan?', ['Sich aus dem Griff eines Gegners am Handgelenk befreien', 'Einen Fußtritt blocken', 'Den Gegner zu Boden werfen', 'Kraft für einen Fußtritt sammeln'], '', P(7));
      L.mc('Heian Shodan: Wie groß ist beim Age-uke der Abstand zwischen Handgelenk und Stirn?', ['Etwa eine Faust', 'Etwa drei Fäuste', 'Die Faust berührt die Stirn', 'Etwa eine Armlänge'], '', P(8));
      L.mc('Bedeutung (Meaning Point) der 7. Bewegung von Heian Shodan: Nach dem Block eines Jodan-Zuki mit dem linken Handgelenk …', ['… greift man das Handgelenk, dreht es und schlägt mit dem rechten Unterarm gegen den Ellbogen des Gegners', '… drückt man das Handgelenk nach unten und tritt Mae-geri nach', '… zieht man das Handgelenk zur Hüfte und stößt Gyaku-zuki', '… schiebt man das Handgelenk weg und weicht zur Seite aus'], '', P(8));
      L.mc('Heian Shodan: Bei den drei Oi-zuki 15, 16 und 17 – welche Regel nennt das Buch (nach Karate-Do Kyohan)?', ['Erste und letzte Bewegung stärker als die mittlere; die 17. mit mehr Kraft und etwas breiterem Stand', 'Alle drei exakt gleich stark', 'Die mittlere ist die stärkste', 'Jede folgende Bewegung wird schwächer'], '', P(12));
      L.mc('Heian Shodan, Bewegung 18 (Shuto-uke in Kokutsu-dachi): Wohin zeigt der Körper?', ['Der Körper zeigt nach vorne, nur das Gesicht ist zur Seite gedreht', 'Körper und Gesicht vollständig zur Seite', 'Der Körper zeigt nach hinten', 'Der Körper steht frontal, das Gesicht schaut nach unten'], 'Referenzpunkt nach Karate-Do Kyohan: Gewicht auf dem hinteren Bein, vorderer Fuß berührt den Boden leicht.', P(13));
      L.mc('Wie ist SHUTO (Handkante) laut Buch geformt?', ['Vier gestreckte Finger und ein gebeugter Daumen, eng zusammen; Handfläche und Handgelenk gerade', 'Faust mit vorgestrecktem Mittelfinger', 'Offene Hand mit gespreizten Fingern', 'Nur Zeige- und Mittelfinger gestreckt'], '', P(13));
      L.mc('Was ist SUIGETSU?', ['Der Solarplexus – Bereich direkt unter dem Brustbein (auch Mizo-ochi)', 'Die Schläfe', 'Der Bereich unter der Nase', 'Das Kinn'], '', P(13));
      L.mc('Heian Shodan, Shuto-uke: Wo befindet sich die zurückgezogene Hand?', ['Waagerecht vor dem Solarplexus (Suigetsu), Fingerspitzen auf Höhe der anderen Brustseite', 'An der Hüfte als Faust', 'Über dem Kopf', 'Am Ohr'], '', P(13));
      L.mc('Heian Shodan, Shuto-uke: Wie weit ist der blockende Ellbogen vom Körper entfernt?', ['Etwa anderthalb Fäuste', 'Er liegt am Körper an', 'Etwa drei Fäuste', 'Der Arm ist ganz gestreckt'], '', P(13));
      L.mc('Heian Shodan: Wie wird die Kata beendet (Naore)?', ['Rechter Fuß bleibt, linker Fuß geht zurück; Hände schließen sich zur Faust in Yoi', 'Linker Fuß bleibt, rechter Fuß geht zurück', 'Beide Füße springen zusammen', 'Man dreht sich um 180° und verbeugt sich'], '', P(15));
      L.mc('In welcher Reihenfolge werden die Beine für Yoi (Hachiji-dachi) in Heian Shodan bewegt?', ['Erst das linke, dann das rechte Bein', 'Erst das rechte, dann das linke Bein', 'Beide gleichzeitig', 'Nur das rechte Bein'], '', P(6));
    },
  };

  SK.kata['heian-nidan'] = {
    id: 'heian-nidan', name: 'Heian Nidan', moves: 26, kiai: [11, 26], firstPage: 17,
    // Kata-Ansage: Bodenkarte nach der Fußskizze im Buch (vermessen mit tools/kata-pdf/embusen.py).
    // f = [linker Fuß, rechter Fuß] mit [x, y, Zehenrichtung (0 = vorne, im Uhrzeigersinn), Gewicht]; body = Körperrichtung,
    // look = Blick, falls zur Seite; turn = Drehung in Grad (negativ = links herum); h = Fußarbeit.
    ansage: {
      kana: 'へいあん にだん',
      page: 29,
      lines: [[-1, 0, 1, 0], [-1, 1.6, 1, 1.6], [0, -0.4, 0, 1.6]],
      rei: { f: [[-0.02, 0.12, 330, 0.5], [0.08, 0.12, 30, 0.5]], body: 0, h: 'Verbeugung, Fersen zusammen' },
      yoi: { f: [[-0.22, 0.12, 327, 0.5], [0.25, 0.12, 30, 0.5]], body: 0, h: 'Erst linker, dann rechter Fuß nach außen' },
      moves: [
        { f: [[-0.52, 0.01, 276, 0.3], [0.2, 0.16, 5, 0.7]], body: 270, turn: -90, h: 'Blick nach links, linker Fuß gleitet nach links' },
        { f: [[-0.47, -0.01, 275, 0.3], [0.2, 0.16, 4, 0.7]], body: 270, h: 'Stand bleibt, nur die Arme wechseln' },
        { f: [[-0.45, -0.01, 270, 0.3], [0.21, 0.16, 5, 0.7]], body: 270, h: 'Stand bleibt' },
        { f: [[-0.32, 0.13, 358, 0.7], [0.32, 0.02, 78, 0.3]], body: 90, turn: 180, h: 'Füße bleiben am Platz: Blick nach rechts, Gewicht aufs linke Bein, beide Füße drehen im Uhrzeigersinn' },
        { f: [[-0.22, 0.15, 357, 0.7], [0.44, 0.01, 78, 0.3]], body: 90, h: 'Stand bleibt, nur die Arme wechseln' },
        { f: [[-0.26, 0.15, 358, 0.7], [0.44, 0.02, 78, 0.3]], body: 90, h: 'Stand bleibt' },
        { f: [[0.15, 0.02, 90, 1.0], [0.16, -0.09, 90, 0.0]], body: 90, look: 180, h: 'Linker Fuß rückt einen halben Schritt heran unter den Körper, beide Füße zeigen nach rechts, Blick zum Start; rechter Fuß tritt Yoko-geri-keage zur rechten Seite (Richtung Start)' },
        { f: [[0.0, 0.14, 357, 0.3], [0.19, -0.36, 80, 0.7]], body: 0, turn: -90, h: 'Blick nach links zur Vorderseite, rechter Fuß setzt hinten ab, linker Fuß vorne auf der Mittellinie' },
        { f: [[-0.13, 0.05, 279, 0.7], [-0.01, 0.75, 351, 0.3]], body: 0, h: 'Rechter Fuß gleitet vor' },
        { f: [[-0.02, 1.14, 359, 0.3], [0.16, 0.43, 91, 0.7]], body: 0, h: 'Linker Fuß gleitet vor' },
        { f: [[-0.16, 1.18, 318, 0.3], [-0.07, 1.74, 338, 0.7]], body: 0, h: 'Hüfte nach vorne, rechter Fuß gleitet vor – Kiai' },
        { f: [[0.58, 1.59, 94, 0.3], [-0.03, 1.45, 176, 0.7]], body: 90, turn: -270, h: 'Rechtes Knie bleibt gebeugt, linker Fuß schwingt nach rechts, ¾ Drehung links herum' },
        { f: [[0.61, 1.75, 59, 0.7], [0.91, 1.18, 133, 0.3]], body: 135, turn: 45, h: 'Rechter Fuß gleitet schräg nach vorne rechts (Richtung Start)' },
        { f: [[0.42, 1.45, 177, 0.7], [-0.13, 1.57, 263, 0.3]], body: 270, turn: 135, h: 'Linkes Knie bleibt gebeugt, rechter Fuß schwingt nach links, Drehung rechts herum' },
        { f: [[-0.53, 1.16, 228, 0.3], [-0.05, 1.72, 321, 0.7]], body: 225, turn: -45, h: 'Linker Fuß gleitet schräg nach vorne links (Richtung Start)' },
        { f: [[0.11, 1.18, 216, 0.7], [-0.06, 1.49, 214, 0.3]], body: 180, turn: -45, h: 'Rechtes Bein trägt, linker Fuß rückt nach links auf die Mittellinie – Gyaku-hanmi Richtung Start' },
        { f: [[0.23, 1.12, 185, 1.0], [0.08, 1.05, 180, 0.0]], body: 180, h: 'Gewicht aufs linke Bein, rechtes Knie hoch, Mae-geri-keage' },
        { f: [[0.19, 1.12, 167, 0.3], [-0.06, 0.64, 162, 0.7]], body: 180, h: 'Rechter Fuß setzt nach dem Tritt vorne ab' },
        { f: [[0.17, 1.23, 165, 0.3], [-0.05, 0.94, 168, 0.7]], body: 180, h: 'Rechter Fuß gleitet etwas zurück – kürzerer Migi-ashi-zenkutsu (Gyaku-hanmi), die Arme wechseln' },
        { f: [[-0.08, 0.85, 180, 0], [-0.21, 0.94, 205, 1]], body: 180, h: 'Gewicht aufs rechte Bein, linkes Knie hoch, Mae-geri-keage' },
        { f: [[0.08, 0.41, 205, 0.7], [-0.22, 0.94, 211, 0.3]], body: 180, h: 'Linker Fuß setzt nach dem Tritt vorne ab' },
        { f: [[0.16, 0.41, 154, 0.3], [-0.01, -0.16, 166, 0.7]], body: 180, h: 'Rechter Fuß gleitet vor' },
        { f: [[-0.6, 0.05, 284, 0.7], [-0.03, 0.15, 300, 0.3]], body: 270, turn: -270, h: 'Rechtes Knie bleibt gebeugt, linker Fuß schwingt nach links, ¾ Drehung links herum' },
        { f: [[-0.74, 0.08, 280, 0.3], [-0.93, 0.51, 318, 0.7]], body: 315, turn: 45, h: 'Rechter Fuß gleitet schräg nach vorne links' },
        { f: [[-0.48, 0.12, 72, 0.3], [0.18, 0.01, 82, 0.7]], body: 90, turn: 135, h: 'Linkes Bein trägt, rechter Fuß gleitet nach rechts, Drehung rechts herum' },
        { f: [[0.42, 0.55, 50, 0.7], [0.18, 0.08, 82, 0.3]], body: 45, turn: -45, h: 'Linker Fuß gleitet schräg nach vorne rechts – Kiai' },
      ],
      naore: { f: [[-0.24, 0.12, 330, 0.5], [0.23, 0.12, 33, 0.5]], body: 0, turn: -45, h: 'Rechter Fuß bleibt, linker Fuß zieht zurück in Yoi' },
      end: { f: [[-0.05, 0.11, 330, 0.5], [0.05, 0.11, 30, 0.5]], body: 0, h: 'Verbeugung, Ende der Kata' },
    },
    yoi: 'Hachiji-dachi, beide Fäuste vor den Oberschenkeln',
    naore: 'Der rechte Fuß bleibt stehen, der linke Fuß geht zurück in die Yoi-Position.',
    continuous: [[2, 3], [5, 6], [17, 18], [20, 21]],
    slow: [],
    seq: [
      [1, 'Migi Kokutsu-dachi', 'Hidari Haiwan Hidari Sokumen Jodan Yoko-uke', 17],
      [2, 'Migi Kokutsu-dachi', 'Hidari Jodan Soto-nagashi-uke + Migi Kentsui Soto-mawashi-uchi', 17],
      [3, 'Migi Kokutsu-dachi', 'Saken Hidari Sokumen Chudan-zuki', 18],
      [4, 'Hidari Kokutsu-dachi', 'Migi Haiwan Migi Sokumen Jodan Yoko-uke', 18],
      [5, 'Hidari Kokutsu-dachi', 'Migi Jodan Soto-nagashi-uke + Hidari Kentsui Soto-mawashi-uchi', 18],
      [6, 'Hidari Kokutsu-dachi', 'Uken Migi Sokumen Chudan-zuki', 19],
      [7, 'Hidari Ashi-dachi', 'Migi Uraken Jodan Yoko-mawashi-uchi + Migi Yoko-geri-keage', 19],
      [8, 'Migi Kokutsu-dachi', 'Hidari Shuto Chudan-uke', 20],
      [9, 'Hidari Kokutsu-dachi', 'Migi Shuto Chudan-uke', 20],
      [10, 'Migi Kokutsu-dachi', 'Hidari Shuto Chudan-uke', 21],
      [11, 'Migi Zenkutsu-dachi', 'Sasho Chudan Osae-uke + Migi Chudan Shihon-nukite', 21],
      [12, 'Migi Kokutsu-dachi', 'Hidari Shuto Chudan-uke', 22],
      [13, 'Hidari Kokutsu-dachi', 'Migi Shuto Chudan-uke', 22],
      [14, 'Hidari Kokutsu-dachi', 'Migi Shuto Chudan-uke', 23],
      [15, 'Migi Kokutsu-dachi', 'Hidari Shuto Chudan-uke', 23],
      [16, 'Hidari Ashi-zenkutsu', 'Migi Chudan Uchi-uke', 24, 'Gyaku-hanmi'],
      [17, 'Hidari Ashi-dachi', 'Migi Chudan Mae-geri-keage', 24],
      [18, 'Migi Zenkutsu-dachi', 'Saken Chudan-zuki', 25],
      [19, 'Migi Ashi-zenkutsu', 'Hidari Chudan Uchi-uke', 25, 'Gyaku-hanmi'],
      [20, 'Migi Ashi-dachi', 'Hidari Chudan Mae-geri-keage', 25],
      [21, 'Hidari Zenkutsu-dachi', 'Uken Chudan-zuki', 26],
      [22, 'Migi Zenkutsu-dachi', 'Migi Chudan Morote-uke', 26],
      [23, 'Hidari Zenkutsu-dachi', 'Hidari Gedan-barai', 27],
      [24, 'Migi Zenkutsu-dachi', 'Migi Jodan Age-uke', 27],
      [25, 'Migi Zenkutsu-dachi', 'Migi Gedan-barai', 27],
      [26, 'Hidari Zenkutsu-dachi', 'Hidari Jodan Age-uke', 28],
    ],
    learn: `
      <p>Heian Nidan hat laut Buch <b>26 Bewegungen</b>. Kiai bei <b>11</b> (Shihon-nukite) und <b>26</b> (Age-uke).</p>
      <ul>
        <li>Bewegung 1: Haiwan-Yoko-uke mit der Rückseite des Unterarms; beide Arme bilden ein „Rechteck“ – der andere Unterarm liegt vor der Stirn (Zenwan Hitai-mae Yoko-kamae).</li>
        <li>Bewegung 2: Nagashi-uke und Kentsui-Schlag mit „scherenartiger“ Bewegung beider Unterarme.</li>
        <li>Schnell und fließend: 2+3, 5+6, 17+18, 20+21.</li>
        <li>Bewegung 7: Hüfte drehen, Fußsohle an die Innenseite des Standknies (Ashi-ura Hiza-yoko); Uraken und Yoko-geri-keage <b>gleichzeitig</b>.</li>
        <li>Bewegung 11: Osae-uke (Drücken auf das Handgelenk eines Chudan-Zuki) und Shihon-nukite, auch <b>Tate-nukite</b> genannt.</li>
        <li>16 und 19: <b>Ashi-zenkutsu</b> in Gyaku-hanmi – etwa halb so lang wie Zenkutsu-dachi.</li>
        <li>Mae-geri-keage mit dem Fußballen (<b>Koshi</b>).</li>
      </ul>`,
    facts(L) {
      L.mc('Heian Nidan, Bewegung 1: Womit wird der Jodan-Yoko-uke ausgeführt?', ['Mit der Rückseite des Unterarms (Haiwan)', 'Mit der Handkante (Shuto)', 'Mit dem Handballen (Teisho)', 'Mit der Faust (Seiken)'], 'Meaning Point: Blocken eines rechten Jodan-Zuki seitlich mit der Rückseite des linken Unterarms.', P(17));
      L.mc('Heian Nidan, Bewegung 1: Welche Form bilden beide Arme?', ['Ein Rechteck', 'Ein Kreuz', 'Einen Kreis', 'Ein Dreieck'], '', P(17));
      L.mc('Heian Nidan, Bewegung 2: Wie sollen sich die Unterarme beim Nagashi-uke mit Kentsui-Schlag bewegen?', ['Mit dem Gefühl einer Scherenbewegung', 'Parallel nach vorne', 'Nacheinander, langsam', 'Gekreuzt nach unten'], '', P(17));
      L.mc('Heian Nidan, Bewegung 2: Was trifft der Kentsui-Schlag laut Meaning Point?', ['Den Ellbogen des Gegners', 'Das Kinn des Gegners', 'Das Knie des Gegners', 'Den Solarplexus'], '', P(17));
      L.mc('Heian Nidan, Bewegung 7: Wo befindet sich die Fußsohle des Trittbeins vor dem Yoko-geri-keage?', ['Leicht an der Innenseite des Standknies', 'Am Gesäß', 'Auf dem Boden neben dem Standfuß', 'Vor dem Bauch'], '', P(19));
      L.mc('Heian Nidan, Bewegung 7: Wie werden Uraken und Yoko-geri-keage ausgeführt?', ['Gleichzeitig', 'Erst Uraken, dann Tritt', 'Erst Tritt, dann Uraken', 'Mit einer Pause dazwischen'], '', P(19));
      L.mc('Wie heißt der Shihon-nukite in Heian Nidan (Bewegung 11) auch?', ['Tate-nukite', 'Ippon-nukite', 'Nihon-nukite', 'Haito'], '', P(21));
      L.mc('Heian Nidan, Bewegung 11: Welches Gefühl soll der linke Unterarm beim Osae-uke haben?', ['Mit der Handfläche das Handgelenk eines Chudan-Zuki nach unten drücken', 'Einen Tritt nach außen fegen', 'Den Kopf des Gegners greifen', 'Einen Jodan-Angriff nach oben ablenken'], '', P(21));
      L.mc('Wie lang ist der Stand Ashi-zenkutsu (Gyaku-hanmi) in Heian Nidan, Bewegung 16, ungefähr?', ['Etwa halb so lang wie Zenkutsu-dachi', 'Doppelt so lang wie Zenkutsu-dachi', 'Genauso lang wie Zenkutsu-dachi', 'Füße geschlossen'], '', P(24));
      L.mc('Heian Nidan, Mae-geri-keage: Mit welchem Teil des Fußes wird getreten?', ['Mit dem Fußballen (Koshi)', 'Mit der Ferse', 'Mit der Fußkante (Sokuto)', 'Mit dem Fußrücken'], '', P(24));
    },
  };

  SK.kata['heian-sandan'] = {
    id: 'heian-sandan', name: 'Heian Sandan', moves: 20, kiai: [10, 20], firstPage: 30,
    // Kata-Ansage: Name für eine japanische Stimme (Kana) und eine deutsche (Lautschrift).
    // Bodenkarte nach der Fußskizze im Buch (Scan-Seite 39 = S. 68–69): Einheit = halbe Grundlinie, x nach rechts, y nach vorne.
    // Kata-Ansage: Name in Kana für die japanische Stimme.
    // look = Blick, falls zur Seite; turn = Drehung in Grad (negativ = links herum); h = Fußarbeit.
    ansage: {
      kana: 'へいあん さんだん',
      page: 39,
      lines: [[-1, 0, 1, 0], [0, 0, 0, 2]],
      rei: { f: [[-0.02, 0.15, 330, 0.5], [0.08, 0.15, 30, 0.5]], body: 0, h: 'Verbeugung, Fersen zusammen' },
      yoi: { f: [[-0.21, 0.11, 324, 0.5], [0.25, 0.13, 35, 0.5]], body: 0, h: 'Erst linker, dann rechter Fuß nach außen' },
      moves: [
        { f: [[-0.52, -0.02, 272, 0.3], [0.2, 0.15, 12, 0.7]], body: 270, turn: -90, h: 'Blick nach links, linker Fuß tritt nach links' },
        { f: [[-0.47, 0.01, 272, 0.5], [-0.48, 0.14, 270, 0.5]], body: 270, h: 'Rechter Fuß wird zum linken herangezogen' },
        { f: [[-0.47, 0.01, 272, 0.5], [-0.48, 0.14, 269, 0.5]], body: 270, h: 'Füße bleiben stehen, nur die Arme wechseln' },
        { f: [[-0.29, 0.15, 356, 0.7], [0.44, 0.02, 85, 0.3]], body: 90, turn: 180, h: 'Linkes Bein trägt, linker Fuß dreht auf der Stelle nach vorne, rechter Fuß tritt nach rechts' },
        { f: [[0.45, 0.14, 86, 0.5], [0.45, 0.02, 87, 0.5]], body: 90, h: 'Linker Fuß wird zum rechten herangezogen' },
        { f: [[0.45, 0.14, 86, 0.5], [0.45, 0.02, 87, 0.5]], body: 90, h: 'Füße bleiben stehen, nur die Arme wechseln' },
        { f: [[0.3, 0.82, 357, 0.3], [0.4, 0.02, 83, 0.7]], body: 0, turn: -90, h: 'Linker Fuß tritt nach vorne, rechter Fuß bleibt quer stehen' },
        { f: [[0.18, 0.79, 339, 0.3], [0.34, 1.37, 355, 0.7]], body: 0, h: 'Rechter Fuß tritt vor' },
        { f: [[0.44, 1.82, 89, 0.5], [0.44, 1.16, 88, 0.5]], body: 90, look: 0, turn: -270, h: 'Linker Fuß tritt vor, Drehung mit dem Rücken nach vorne in Kiba-dachi – Blick nach vorne' },
        { f: [[0.21, 1.57, 339, 0.3], [0.35, 2.07, 0, 0.7]], body: 0, turn: -90, h: 'Rechter Fuß tritt vor, Körper wieder nach vorne' },
        { f: [[0.355, 2.23, 180, 0.5], [0.265, 2.23, 180, 0.5]], body: 180, turn: -180, h: 'Langsam: linker Fuß zum rechten, Blick zum Start' },
        { f: [[0.28, 2.25, 88, 0.5], [0.27, 1.61, 90, 0.5]], body: 90, look: 180, turn: -90, h: 'Rechtes Knie hoch, Fumikomi Richtung Start' },
        { f: [[0.28, 2.25, 88, 0.5], [0.27, 1.61, 90, 0.5]], body: 90, look: 180, h: 'Füße bleiben stehen' },
        { f: [[0.37, 1.03, 263, 0.5], [0.32, 1.61, 267, 0.5]], body: 270, look: 180, turn: 180, h: 'Linkes Knie hoch, Fumikomi Richtung Start' },
        { f: [[0.37, 1.03, 263, 0.5], [0.32, 1.61, 267, 0.5]], body: 270, look: 180, h: 'Füße bleiben stehen' },
        { f: [[0.32, 1.03, 92, 0.5], [0.31, 0.48, 88, 0.5]], body: 90, look: 180, turn: -180, h: 'Rechtes Knie hoch, Fumikomi Richtung Start' },
        { f: [[0.32, 1.03, 92, 0.5], [0.31, 0.48, 88, 0.5]], body: 90, look: 180, h: 'Füße bleiben stehen' },
        { f: [[0.34, -0.13, 195, 0.7], [0.19, 0.45, 201, 0.3]], body: 180, turn: 90, h: 'Linker Fuß tritt Richtung Start vor – über die Grundlinie hinaus' },
        { f: [[-0.47, 0.15, 3, 0.5], [0.24, 0.15, 359, 0.5]], body: 0, turn: 180, h: 'Rechter Fuß tritt neben den linken, linker Fuß gleitet nach links – Kiba-dachi zur Vorderseite' },
        { f: [[-0.24, 0.16, 3, 0.5], [0.42, 0.15, 359, 0.5]], body: 0, h: 'Yori-ashi nach rechts: beide Füße gleiten, der Stand bleibt' },
      ],
      naore: { f: [[-0.23, 0.14, 334, 0.5], [0.19, 0.11, 29, 0.5]], body: 0, h: 'Linker Fuß bleibt, rechter Fuß zieht heran' },
      end: { f: [[-0.08, 0.14, 330, 0.5], [0.02, 0.14, 30, 0.5]], body: 0, h: 'Verbeugung, Ende der Kata' },
    },
    yoi: 'Hachiji-dachi, beide Fäuste vor den Oberschenkeln',
    naore: 'Der linke Fuß bleibt, der rechte Fuß geht leicht nach links; Knie strecken, zurück in Yoi.',
    continuous: [[2, 3], [5, 6], [9, 10]],
    slow: [11],
    seq: [
      [1, 'Migi Kokutsu-dachi', 'Hidari Sokumen Hidari Chudan Uchi-uke', 30],
      [2, 'Heisoku-dachi', 'Migi Chudan Uchi-uke + Hidari Gedan-uke', 30],
      [3, 'Heisoku-dachi', 'Hidari Chudan Uchi-uke + Migi Gedan-uke', 31],
      [4, 'Hidari Kokutsu-dachi', 'Migi Chudan Uchi-uke', 31],
      [5, 'Heisoku-dachi', 'Hidari Chudan Uchi-uke + Migi Gedan-uke', 31],
      [6, 'Heisoku-dachi', 'Migi Chudan Uchi-uke + Hidari Gedan-uke', 32],
      [7, 'Migi Kokutsu-dachi', 'Hidari Chudan Morote-uke', 32],
      [8, 'Migi Zenkutsu-dachi', 'Sasho Chudan Osae-uke + Migi Chudan Shihon-nukite', 33],
      [9, 'Kiba-dachi', 'Hidari Kentsui Chudan Uchi-mawashi-uchi', 33],
      [10, 'Migi Zenkutsu-dachi', 'Migi Chudan Oi-zuki', 34],
      [11, 'Heisoku-dachi', 'Ryoken Ryokoshi-kamae', 34],
      [12, 'Kiba-dachi', 'Migi Furi-enpi', 35, 'Migi Ashi Fumikomi'],
      [13, 'Kiba-dachi', 'Migi Uraken Migi Sokumen Tate-mawashi-uchi', 35],
      [14, 'Kiba-dachi', 'Hidari Furi-enpi', 36, 'Hidari Ashi Fumikomi'],
      [15, 'Kiba-dachi', 'Hidari Uraken Hidari Sokumen Tate-mawashi-uchi', 36],
      [16, 'Kiba-dachi', 'Migi Furi-enpi', 36, 'Migi Ashi Fumikomi'],
      [17, 'Kiba-dachi', 'Migi Uraken Migi Sokumen Tate-mawashi-uchi', 36],
      [18, 'Hidari Zenkutsu-dachi', 'Hidari Chudan Oi-zuki', 37],
      [19, 'Kiba-dachi', 'Uken Hidari Kata-ue Koho-tsukiage + Hidari Ushiro-enpi', 37],
      [20, 'Kiba-dachi', 'Saken Migi Kata-ue Koho-tsukiage + Migi Ushiro-enpi', 38, 'Migi-e Yori-ashi'],
    ],
    learn: `
      <p>Heian Sandan hat laut Buch <b>20 Bewegungen</b>. Kiai bei <b>10</b> (Oi-zuki) und <b>20</b> (Tsukiage / Ushiro-enpi).</p>
      <ul>
        <li>Bewegungen 2/3 und 5/6 in <b>Heisoku-dachi</b>: Uchi-uke und Gedan-uke gleichzeitig, mit dem Gefühl, dass sich beide Fäuste „auseinanderhebeln“.</li>
        <li>Fließend: 2+3, 5+6, 9+10.</li>
        <li>Bewegung 9: Den rechten Arm eindrehen, als würde er gegriffen und verdreht; die Hand legt sich hinter den Rücken – Kentsui Uchi-mawashi-uchi in Kiba-dachi.</li>
        <li>Bewegung 11: Gesicht, Hände und Füße <b>langsam</b> und gemeinsam – Fäuste an beide Hüften (Ryoken Ryokoshi-kamae).</li>
        <li>Fumikomi + Furi-enpi: Der Stampfer soll den Oberschenkel des Gegners brechen, der Ellbogen trifft den Solarplexus (nach Karate-Do Kyohan).</li>
        <li>Uraken Tate-mawashi-uchi zielt auf <b>Jinchu</b> (Bereich zwischen Oberlippe und Nase).</li>
        <li>Bewegung 20: <b>Yori-ashi</b> nach rechts (Migi-e) – beide Füße gleiten, der Stand bleibt gleich.</li>
      </ul>`,
    facts(L) {
      L.mc('Heian Sandan, Bewegungen 2 und 3: In welchem Stand werden Uchi-uke und Gedan-uke gleichzeitig ausgeführt?', ['Heisoku-dachi', 'Kiba-dachi', 'Kokutsu-dachi', 'Hachiji-dachi'], '', P(30));
      L.mc('Heian Sandan: Welches Gefühl beschreibt das Buch beim gleichzeitigen Uchi-uke und Gedan-uke?', ['Beide Fäuste hebeln sich gegenseitig auseinander', 'Beide Fäuste ziehen sich zusammen', 'Beide Arme schwingen locker', 'Die Arme bleiben passiv'], '', P(30));
      L.mc('Heian Sandan, Bewegung 9: Was sagt der Hinweis zum Eindrehen des rechten Arms?', ['Als würde der Arm von einem Gegner gegriffen und verdreht', 'Als würde man einen Stock werfen', 'Als würde man einen Tritt blocken', 'Als würde man einen Kopf greifen'], '', P(33));
      L.mc('Heian Sandan, Bewegung 11 (Ryoken Ryokoshi-kamae): Wie wird sie ausgeführt?', ['Gesicht, Hände und Füße langsam und gemeinsam', 'Explosiv mit Kiai', 'Mit Sprung', 'Nur die Füße bewegen sich'], '', P(34));
      L.mc('Heian Sandan: Was ist laut Karate-Do Kyohan der Sinn des Stampfens (Fumikomi) mit Furi-enpi?', ['Den Oberschenkel des Gegners brechen und gleichzeitig mit dem Ellbogen den Solarplexus treffen', 'Einen Fußfeger ausführen', 'Den Gegner über die Schulter werfen', 'Einen Mae-geri blocken'], '', P(35));
      L.mc('Was ist JINCHU?', ['Der Bereich direkt unter der Nase / über der Oberlippe', 'Die Schläfe', 'Der Solarplexus', 'Der Bereich unter dem Bauchnabel'], 'Ziel des Uraken Tate-mawashi-uchi in Heian Sandan.', P(35));
      L.mc('Heian Sandan, Bewegung 20: Was bedeutet MIGI-E YORI-ASHI?', ['Beide Füße gleiten nach rechts, ohne den Stand zu verändern', 'Ein Sprung nach rechts', 'Nur der rechte Fuß macht einen Schritt', 'Drehung um 180° nach rechts'], 'Der linke Fuß wird angespannt und dient als Abstoßpunkt.', P(38));
      L.mc('Heian Sandan, Bewegung 18: Welche Hand wird vorher geöffnet – mit welchem Gefühl?', ['Die rechte Hand – als würde man einen Gegner greifen und heranziehen', 'Die linke Hand – um einen Tritt zu fegen', 'Beide Hände – zum Klatschen', 'Keine – beide Fäuste bleiben geschlossen'], '', P(37));
      L.mc('Heian Sandan, Bewegung 19: Wohin bewegt sich die rechte Faust (Kata-ue Koho-tsukiage)?', ['In großem Schwung leicht über die linke Schulter', 'Gerade nach vorne auf Chudan', 'Nach unten vor den Bauch', 'An die rechte Hüfte'], '', P(37));
    },
  };

  SK.kata['heian-yondan'] = {
    id: 'heian-yondan', name: 'Heian Yondan', moves: 27, kiai: [13, 25], firstPage: 40,
    // Kata-Ansage: Bodenkarte nach der Fußskizze im Buch (vermessen mit tools/kata-pdf/embusen.py).
    // f = [linker Fuß, rechter Fuß] mit [x, y, Zehenrichtung (0 = vorne, im Uhrzeigersinn), Gewicht]; body = Körperrichtung,
    // look = Blick, falls zur Seite; turn = Drehung in Grad (negativ = links herum); h = Fußarbeit.
    ansage: {
      kana: 'へいあん よんだん',
      page: 53,
      lines: [[-1, 0, 1, 0], [-1, 1.6, 1, 1.6], [0, -0.4, 0, 1.6]],
      rei: { f: [[-0.04, 0.12, 330, 0.5], [0.06, 0.12, 30, 0.5]], body: 0, h: 'Verbeugung, Fersen zusammen' },
      yoi: { f: [[-0.19, 0.12, 327, 0.5], [0.27, 0.12, 35, 0.5]], body: 0, h: 'Erst linker, dann rechter Fuß nach außen' },
      moves: [
        { f: [[-0.41, 0.1, 274, 0.3], [0.17, 0.15, 6, 0.7]], body: 270, turn: -90, h: 'Langsam: linker Fuß gleitet nach links' },
        { f: [[-0.4, 0.14, 1, 0.7], [0.33, -0, 87, 0.3]], body: 90, turn: 180, h: 'Langsam: Füße bleiben am Platz, Blick nach rechts, Gewicht aufs linke Bein, Füße drehen im Uhrzeigersinn' },
        { f: [[0.02, 0.76, 9, 0.7], [0.24, 0.13, 22, 0.3]], body: 0, turn: -90, h: 'Rechtes Bein trägt, linker Fuß gleitet nach vorne auf die Mittellinie' },
        { f: [[-0.14, 0.41, 271, 0.7], [0.01, 1.02, 4, 0.3]], body: 0, h: 'Rechter Fuß gleitet vor' },
        { f: [[-0.08, 1, 0, 0], [0.01, 1.03, 359, 1]], body: 0, look: 270, h: 'Blick nach links, Gewicht aufs rechte Bein, linke Fußsohle an das rechte Knie' },
        { f: [[-0.08, 1, 0, 0], [0.02, 1.02, 5, 1]], body: 0, look: 270, h: 'Stand bleibt: Yoko-geri-keage nach links' },
        { f: [[-0.59, 0.9, 270, 0.7], [-0.11, 0.99, 308, 0.3]], body: 270, turn: -90, h: 'Linker Fuß setzt nach links ab' },
        { f: [[-0.37, 1.16, 7, 1], [-0.28, 1.13, 0, 0]], body: 0, look: 90, turn: 90, h: 'Blick nach rechts, linker Fuß rückt einen halben Schritt heran, rechte Fußsohle an das linke Knie' },
        { f: [[-0.41, 1.15, 0, 1], [-0.28, 1.13, 0, 0]], body: 0, look: 90, h: 'Stand bleibt: Yoko-geri-keage nach rechts' },
        { f: [[-0.23, 1.03, 47, 0.3], [0.32, 0.96, 83, 0.7]], body: 90, turn: 90, h: 'Rechter Fuß setzt nach rechts ab' },
        { f: [[-0.33, 1.28, 5, 0.6], [0.3, 1.22, 325, 0.4]], body: 0, turn: -90, h: 'Füße bleiben am Platz, Hüfte und Blick nach vorne' },
        { f: [[-0.42, 1.26, 6, 1], [-0.3, 1.3, 0, 0]], body: 0, h: 'Hüfte über den linken Fuß, rechtes Knie hoch, Mae-geri-keage nach vorne' },
        { f: [[0.08, 1.74, 5, 0.1], [-0.07, 1.76, 355, 0.9]], body: 0, h: 'Sprungschritt nach vorne: rechter Fuß landet und trägt, linker Fuß steht gekreuzt dahinter auf dem Ballen – Kiai' },
        { f: [[0.22, 1.36, 134, 0.3], [-0.21, 1.66, 223, 0.7]], body: 135, turn: -225, h: 'Rechtes Bein trägt, linker Fuß gleitet von hinten schräg nach rechts hinten, Drehung links herum' },
        { f: [[0.26, 1.38, 133, 1], [0.17, 1.47, 135, 0]], body: 135, h: 'Hüfte über den linken Fuß, rechtes Knie hoch, Mae-geri-keage' },
        { f: [[0.3, 1.4, 100, 0.3], [0.62, 1.02, 126, 0.7]], body: 135, h: 'Rechter Fuß setzt nach dem Tritt vorne ab' },
        { f: [[0.3, 1.41, 117, 0.3], [0.61, 1.01, 121, 0.7]], body: 135, h: 'Stand bleibt' },
        { f: [[0.38, 1.44, 120, 0.7], [-0.06, 0.93, 220, 0.3]], body: 225, turn: 90, h: 'Linkes Bein trägt, rechter Fuß gleitet schräg nach links hinten' },
        { f: [[-0.1, 1.35, 225, 0], [-0.19, 1.27, 236, 1]], body: 225, h: 'Hüfte über den rechten Fuß, linkes Knie hoch, Mae-geri-keage' },
        { f: [[-0.51, 0.99, 247, 0.7], [-0.19, 1.31, 258, 0.3]], body: 225, h: 'Linker Fuß setzt nach dem Tritt vorne ab' },
        { f: [[-0.52, 0.97, 242, 0.7], [-0.22, 1.29, 266, 0.3]], body: 225, h: 'Stand bleibt' },
        { f: [[-0.19, 0.75, 187, 0.3], [-0.25, 1.29, 268, 0.7]], body: 180, turn: -45, h: 'Rechtes Bein trägt, linker Fuß rückt nach links auf die Mittellinie, Blick zum Start' },
        { f: [[-0.11, 0.83, 90, 0.7], [-0.28, 0.21, 179, 0.3]], body: 180, h: 'Rechter Fuß gleitet vor' },
        { f: [[-0.26, -0.14, 186, 0.3], [-0.37, 0.57, 262, 0.7]], body: 180, h: 'Linker Fuß gleitet vor' },
        { f: [[-0.26, -0.03, 186, 1], [-0.18, 0.1, 180, 0]], body: 180, h: 'Linkes Bein trägt, rechtes Knie hoch, beide Fäuste kommen neben dem Knie herunter – Kiai' },
        { f: [[-0.31, 0.14, 1, 0.3], [-0.23, -0.4, 84, 0.7]], body: 0, turn: -180, h: 'Wendung links herum zur Vorderseite, rechter Fuß setzt hinten ab' },
        { f: [[-0.35, 0.01, 275, 0.7], [-0.18, 0.56, 3, 0.3]], body: 0, h: 'Rechter Fuß gleitet vor' },
      ],
      naore: { f: [[-0.24, 0.11, 325, 0.5], [0.24, 0.11, 36, 0.5]], body: 0, h: 'Linker Fuß bleibt, rechter Fuß zieht zurück in Yoi' },
      end: { f: [[-0.05, 0.12, 330, 0.5], [0.05, 0.12, 30, 0.5]], body: 0, h: 'Verbeugung, Ende der Kata' },
    },
    yoi: 'Hachiji-dachi, beide Fäuste vor den Oberschenkeln',
    naore: 'Der linke Fuß bleibt, der rechte Fuß geht zurück; die Hände schließen sich zur Faust in Yoi.',
    continuous: [[5, 6, 7], [8, 9, 10], [16, 17], [20, 21]],
    slow: [1, 2, 14, 18],
    seq: [
      [1, 'Migi Kokutsu-dachi', 'Hidari Haiwan Hidari Sokumen Jodan Yoko-uke', 40, 'mit offenen Händen, langsam'],
      [2, 'Hidari Kokutsu-dachi', 'Migi Haiwan Migi Sokumen Jodan Yoko-uke', 41, 'mit offenen Händen, langsam'],
      [3, 'Hidari Zenkutsu-dachi', 'Gedan Kosa-uke', 41],
      [4, 'Hidari Kokutsu-dachi', 'Migi Chudan Morote-uke', 42],
      [5, 'Migi Ashi-dachi', 'Ryoken Migi Koshi-kamae', 42],
      [6, 'Migi Ashi-dachi', 'Hidari Uraken Jodan Yoko-mawashi-uchi + Hidari Yoko-geri-keage', 43],
      [7, 'Hidari Zenkutsu-dachi', 'Sasho-ni Migi Mae-enpi', 43],
      [8, 'Hidari Ashi-dachi', 'Ryoken Hidari Koshi-kamae', 43],
      [9, 'Hidari Ashi-dachi', 'Migi Uraken Jodan Yoko-mawashi-uchi + Migi Yoko-geri-keage', 44],
      [10, 'Migi Zenkutsu-dachi', 'Usho-ni Hidari Mae-enpi', 44],
      [11, 'Hidari Hizakutsu', 'Sasho Jodan-uke + Migi Shuto Jodan Soto-mawashi-uchi', 44, 'zuvor Hidari Shuto Gedan-barai'],
      [12, 'Hidari Ashi-dachi', 'Migi Jodan Mae-geri-keage', 45],
      [13, 'Migi Ashi-mae Kosa-dachi', 'Migi Uraken Tate-mawashi-uchi', 45],
      [14, 'Migi Kokutsu-dachi', 'Ryoken Chudan Kakiwake-uke', 46],
      [15, 'Hidari Ashi-dachi', 'Migi Jodan Mae-geri-keage', 46],
      [16, 'Migi Zenkutsu-dachi', 'Uken Chudan-zuki', 47],
      [17, 'Migi Zenkutsu-dachi', 'Saken Chudan-zuki', 47, 'Ren-zuki'],
      [18, 'Hidari Kokutsu-dachi', 'Ryoken Chudan Kakiwake-uke', 48],
      [19, 'Migi Ashi-dachi', 'Hidari Jodan Mae-geri-keage', 48],
      [20, 'Hidari Zenkutsu-dachi', 'Saken Chudan-zuki', 49],
      [21, 'Hidari Zenkutsu-dachi', 'Uken Chudan-zuki', 49, 'Ren-zuki'],
      [22, 'Migi Kokutsu-dachi', 'Hidari Chudan Morote-uke', 49],
      [23, 'Hidari Kokutsu-dachi', 'Migi Chudan Morote-uke', 50],
      [24, 'Migi Kokutsu-dachi', 'Hidari Chudan Morote-uke', 50],
      [25, 'Hidari Ashi-dachi', 'Migi Hiza-tsuchi (Ryoken Migi Hiza-ryogawa)', 51],
      [26, 'Migi Kokutsu-dachi', 'Hidari Shuto Chudan-uke', 51],
      [27, 'Hidari Kokutsu-dachi', 'Migi Shuto Chudan-uke', 52],
    ],
    learn: `
      <p>Heian Yondan hat laut Buch <b>27 Bewegungen</b>. Kiai bei <b>13</b> (Uraken in Kosa-dachi) und <b>25</b> (Kniestoß).</p>
      <ul>
        <li>Bewegungen 1 und 2: mit <b>offenen Händen</b>, Hände und Füße bewegen sich vom Anfang bis zum Ende <b>langsam</b> zusammen.</li>
        <li>Bewegung 3: <b>Gedan Kosa-uke</b> (Juji-uke) – rechte Faust oben, blockt das Schienbein nahe dem Knöchel beim Tritt; Zenkutsu-dachi etwas breiter.</li>
        <li>5–7 und 8–10 schnell und fließend: Koshi-kamae → Uraken + Yoko-geri-keage → Mae-enpi in die offene Hand (Sasho-ni / Usho-ni).</li>
        <li>Bewegung 11: <b>Hidari Hizakutsu</b> – Shuto-Abwehr und Shuto-Schlag Jodan gleichzeitig.</li>
        <li>Bewegung 13: Sprung von etwa <b>anderthalb Schritten</b> nach vorne in Kosa-dachi (nach Best Karate).</li>
        <li>14 und 18: Kakiwake-uke langsam, kraftvoll, mit dynamischer Spannung – rechte Faust beim Kreuzen oben.</li>
        <li>16+17 und 20+21: zwei Fauststöße schnell hintereinander – das Buch nennt das <b>Ren-zuki</b>.</li>
        <li>Bewegung 25: Hände greifen den Hinterkopf des Gegners; direkt aus Kokutsu-dachi, ohne Zenkutsu-dachi und ohne Pause.</li>
      </ul>`,
    facts(L) {
      L.mc('Heian Yondan, Bewegungen 1 und 2: Wie werden sie ausgeführt?', ['Langsam, mit offenen Händen; Hände und Füße bewegen sich gemeinsam', 'Schnell mit Fäusten', 'Mit Kiai', 'Mit Sprung'], '', P(40));
      L.mc('Heian Yondan, Bewegung 3 (Gedan Kosa-uke): Welche Faust liegt oben?', ['Die rechte Faust', 'Die linke Faust', 'Keine – die Hände sind offen', 'Die Fäuste liegen nebeneinander'], '', P(41));
      L.mc('Heian Yondan, Bewegung 3: Wo wird der Tritt des Gegners mit Gedan Kosa-uke geblockt?', ['Am Schienbein nahe dem Knöchel, sobald der Tritt beginnt', 'Am Knie', 'Am Oberschenkel', 'An der Ferse'], '', P(41));
      L.mc('Wie wird der Gedan Kosa-uke in Heian Yondan laut Best Karate auch genannt?', ['Ryoken Gedan Juji-uke', 'Ryoken Gedan Kakiwake-uke', 'Ryoken Gedan Morote-uke', 'Ryoken Gedan Osae-uke'], '', P(41));
      L.mc('Heian Yondan, Bewegung 7: Was bedeutet SASHO-NI beim Mae-enpi?', ['Der Ellbogen schlägt in die Handfläche der linken Hand', 'Der Schlag geht zur linken Seite des Kopfes', 'Die linke Hand blockt nach unten', 'Mit links zweimal schlagen'], '', P(43));
      L.mc('Heian Yondan, Bewegung 7: Mit welchem Gefühl wird die linke Faust geöffnet?', ['Als würde man den Gegner greifen und heranziehen', 'Als würde man einen Stoß abwehren', 'Als würde man etwas wegwerfen', 'Zur Entspannung'], '', P(43));
      L.mc('Heian Yondan, Bewegung 11: In welchem Stand werden Shuto-Abwehr und Shuto-Schlag ausgeführt?', ['Hidari Hizakutsu', 'Kiba-dachi', 'Migi Kokutsu-dachi', 'Heisoku-dachi'], '', P(44));
      L.mc('Heian Yondan, Bewegung 13: Wie weit ist laut Best Karate der Sprung nach vorne?', ['Etwa anderthalb Schritte', 'Ein halber Schritt', 'Drei Schritte', 'Es wird nicht gesprungen'], '', P(45));
      L.mc('Heian Yondan, Bewegung 13: Wo landet der linke Fuß in Migi Ashi-mae Kosa-dachi?', ['Hinter der Ferse des rechten Fußes (Beine gekreuzt)', 'Neben dem rechten Fuß', 'Vor dem rechten Fuß', 'Schulterbreit seitlich'], '', P(45));
      L.mc('Heian Yondan, Bewegungen 14 und 18 (Kakiwake-uke): Wie sollen sie ausgeführt werden?', ['Langsam und kraftvoll mit dynamischer Spannung', 'Schnell und locker', 'Mit Kiai', 'Mit offenen Händen'], '', P(46));
      L.mc('Heian Yondan, Kakiwake-uke: Welche Faust liegt beim Überkreuzen oben (nach Karate-Do Kyohan)?', ['Die rechte Faust', 'Die linke Faust', 'Die Arme werden nicht gekreuzt', 'Wechselnd je Seite'], '', P(46));
      L.mc('Heian Yondan, Mae-geri nach Kakiwake-uke: Wohin wird getreten?', ['Jodan, zwischen den Fäusten hindurch', 'Gedan auf das Knie', 'Chudan seitlich', 'Hinter den Körper'], '', P(46));
      L.mc('Wie nennt das Buch die schnelle Folge der Heian-Yondan-Bewegungen 16 und 17?', ['Ren-zuki', 'Sanbon-zuki', 'Morote-zuki', 'Kizami-zuki'], 'Ebenso 20–21.', P(47));
      L.mc('Heian Yondan, Bewegung 25 (Hiza-tsuchi): Was stellen die Fäuste dar?', ['Das Greifen des Hinterkopfes des Gegners', 'Das Blocken eines Tritts', 'Einen Doppelfauststoß', 'Das Greifen des Fußes'], '', P(51));
      L.mc('Heian Yondan, Bewegung 25: Was soll man beim Übergang aus Bewegung 24 vermeiden?', ['Zenkutsu-dachi zu bilden und beim Anheben der Hände zu pausieren', 'Das Knie anzuheben', 'Kiai zu rufen', 'Die Hände zu öffnen'], '', P(51));
    },
  };

  SK.kata['heian-godan'] = {
    id: 'heian-godan', name: 'Heian Godan', moves: 23, kiai: [12, 19], firstPage: 54,
    // Kata-Ansage: Bodenkarte nach der Fußskizze im Buch (vermessen mit tools/kata-pdf/embusen.py).
    // f = [linker Fuß, rechter Fuß] mit [x, y, Zehenrichtung (0 = vorne, im Uhrzeigersinn), Gewicht]; body = Körperrichtung,
    // look = Blick, falls zur Seite; turn = Drehung in Grad (negativ = links herum); h = Fußarbeit.
    ansage: {
      kana: 'へいあん ごだん',
      page: 65,
      lines: [[-1, 0, 1, 0], [0, 0, 0, 2]],
      rei: { f: [[-0.04, 0.11, 330, 0.5], [0.06, 0.11, 30, 0.5]], body: 0, h: 'Verbeugung, Fersen zusammen' },
      yoi: { f: [[-0.18, 0.13, 332, 0.5], [0.24, 0.13, 27, 0.5]], body: 0, h: 'Erst linker, dann rechter Fuß nach außen' },
      moves: [
        { f: [[-0.46, 0.05, 275, 0.3], [0.18, 0.14, 10, 0.7]], body: 270, turn: -90, h: 'Blick nach links, linker Fuß gleitet nach links' },
        { f: [[-0.47, 0, 270, 0.3], [0.18, 0.14, 3, 0.7]], body: 270, h: 'Stand bleibt' },
        { f: [[-0.35, 0.14, 0, 0.5], [-0.23, 0.14, 0, 0.5]], body: 0, look: 90, turn: 90, h: 'Langsam: linker Fuß bleibt, rechter Fuß schließt heran, Blick nach rechts' },
        { f: [[-0.32, 0.15, 2, 0.7], [0.4, 0.01, 81, 0.3]], body: 90, turn: 90, h: 'Linker Fuß bleibt, rechter Fuß gleitet nach rechts' },
        { f: [[-0.34, 0.14, 5, 0.7], [0.39, -0.01, 82, 0.3]], body: 90, h: 'Stand bleibt' },
        { f: [[0.19, 0.14, 0, 0.5], [0.31, 0.14, 0, 0.5]], body: 0, turn: -90, h: 'Langsam: rechter Fuß bleibt, linker Fuß schließt heran, Blick nach vorne' },
        { f: [[0.11, 0, 268, 0.7], [0.34, 0.71, 2, 0.3]], body: 0, h: 'Rechter Fuß gleitet nach vorne' },
        { f: [[0.06, 1.07, 21, 0.7], [0.28, 0.7, 31, 0.3]], body: 0, h: 'Rechtes Bein trägt, linker Fuß gleitet vor' },
        { f: [[0.09, 1.08, 17, 0.7], [0.29, 0.7, 25, 0.3]], body: 0, h: 'Stand bleibt' },
        { f: [[0.09, 1.1, 23, 0.7], [0.27, 0.71, 24, 0.3]], body: 0, h: 'Stand bleibt' },
        { f: [[0.11, 1.07, 26, 0.7], [0.27, 0.68, 19, 0.3]], body: 0, h: 'Stand bleibt' },
        { f: [[0.02, 1.05, 345, 0.3], [0.13, 1.58, 356, 0.7]], body: 0, h: 'Hüfte nach vorne, rechter Fuß gleitet vor – Kiai' },
        { f: [[0.22, 0.92, 86, 0.5], [0.21, 0.36, 96, 0.5]], body: 90, look: 180, turn: -270, h: 'Linkes Bein trägt, rechter Fuß geht Richtung Start, Drehung links herum in Kiba-dachi – Blick zum Start' },
        { f: [[0.24, 0.9, 83, 0.5], [0.25, 0.36, 98, 0.5]], body: 90, look: 0, h: 'Langsam: Stand bleibt, Blick nach vorne, Hände wie beim Bogenspannen zurückziehen' },
        { f: [[0.08, 1.03, 345, 1], [0.15, 1.25, 0, 0]], body: 0, turn: -90, h: 'Linkes Bein trägt, Hüfte dreht links herum, Mikazuki-geri in die linke Hand' },
        { f: [[-0.03, 0.82, 269, 0.5], [-0.04, 1.32, 270, 0.5]], body: 270, turn: -90, h: 'Rechter Fuß setzt nach dem Tritt vorne ab – Kiba-dachi' },
        { f: [[0.05, 1.52, 311, 0.1], [-0.02, 1.38, 278, 0.9]], body: 270, look: 0, h: 'Rechtes Knie bleibt gebeugt, linker Fuß kreuzt hinter die rechte Ferse' },
        { f: [[0.09, 1.01, 185, 0.3], [0.02, 1.41, 279, 0.7]], body: 270, look: 180, h: 'Blick zum Start, linkes Bein streckt nach links Richtung Start aus (Renoji-dachi)' },
        { f: [[0.06, 0.44, 80, 0.1], [0.08, 0.62, 80, 0.9]], body: 90, turn: -180, h: 'Sprung (Tobikomi) Richtung Start mit Kiai, halbe Drehung links herum, Landung im Kreuzstand' },
        { f: [[-0.05, 0.4, 134, 0.3], [-0.21, -0.07, 179, 0.7]], body: 180, turn: 90, h: 'Rechter Fuß gleitet nach rechts Richtung Start' },
        { f: [[-0.18, 0.62, 7, 0.3], [-0.06, 0.05, 73, 0.7]], body: 0, turn: -180, h: 'Füße drehen auf der Stelle, Blick nach links zur Vorderseite, linker Fuß rückt etwas zurück, Gewicht nach hinten aufs rechte Bein' },
        { f: [[-0.09, 0.16, 90, 0.5], [-0.09, 0.04, 90, 0.5]], body: 90, look: 0, turn: 90, h: 'Langsam: Oberkörper bleibt, linker Fuß schließt an den rechten, Füße zeigen nach rechts' },
        { f: [[-0.28, 0.04, 282, 0.7], [-0.11, 0.68, 352, 0.3]], body: 0, turn: -90, h: 'Gewicht bleibt links: linker Fuß rückt beim Querdrehen über die Ferse etwas nach links, rechter Fuß gleitet nach vorne' },
      ],
      naore: { f: [[-0.22, 0.11, 323, 0.5], [0.24, 0.12, 36, 0.5]], body: 0, h: 'Linker Fuß bleibt, rechter Fuß zieht zurück in Yoi' },
      end: { f: [[-0.04, 0.12, 330, 0.5], [0.06, 0.12, 30, 0.5]], body: 0, h: 'Verbeugung, Ende der Kata' },
    },
    yoi: 'Hachiji-dachi, beide Fäuste vor den Oberschenkeln',
    naore: 'Der linke Fuß bleibt, der rechte Fuß geht zurück in die Yoi-Position.',
    continuous: [[1, 2], [4, 5], [8, 9], [11, 12]],
    slow: [3, 6, 14, 22],
    seq: [
      [1, 'Migi Kokutsu-dachi', 'Hidari Sokumen Hidari Chudan Uchi-uke', 54],
      [2, 'Migi Kokutsu-dachi', 'Migi Chudan Gyaku-zuki', 54],
      [3, 'Heisoku-dachi', 'Hidari Zenwan Mizunagare-no-kamae', 55],
      [4, 'Hidari Kokutsu-dachi', 'Migi Sokumen Migi Chudan Uchi-uke', 55],
      [5, 'Hidari Kokutsu-dachi', 'Hidari Chudan Gyaku-zuki', 55],
      [6, 'Heisoku-dachi', 'Migi Zenwan Mizunagare-no-kamae', 56],
      [7, 'Hidari Kokutsu-dachi', 'Migi Chudan Morote-uke', 56],
      [8, 'Hidari Zenkutsu-dachi', 'Gedan Kosa-uke', 57],
      [9, 'Hidari Zenkutsu-dachi', 'Kaisho Jodan Kosa-uke', 57],
      [10, 'Hidari Zenkutsu-dachi', 'Ryosho Juji Chudan Osae-uke', 58],
      [11, 'Hidari Zenkutsu-dachi', 'Saken Chudan-zuki', 58],
      [12, 'Migi Zenkutsu-dachi', 'Migi Chudan Oi-zuki', 58],
      [13, 'Kiba-dachi', 'Migi Sokumen Migi Gedan-barai', 59],
      [14, 'Kiba-dachi', 'Hidari Tekubi Hidari Sokumen Chudan Kake-uke', 59],
      [15, 'Hidari Ashi-dachi', 'Sasho-ni Migi Chudan Mikazuki-geri', 60],
      [16, 'Kiba-dachi', 'Sasho-ni Migi Mae-enpi', 60],
      [17, 'Migi Ashi-mae Kosa-dachi', 'Migi Sokumen Chudan Morote-uke', 61],
      [18, 'Hidari Ashi-mae Renoji-dachi', 'Uken Uho-tsukiage', 61],
      [19, 'Migi Ashi-mae Kosa-dachi', 'Gedan Kosa-uke', 62, 'Tobikomi (Sprung)'],
      [20, 'Migi Zenkutsu-dachi', 'Migi Chudan Morote-uke', 62, 'Zenkutsu-dachi ohne Breite'],
      [21, 'Migi Kokutsu-dachi', 'Migi Sokumen Jodan Uchi-uke + Hidari Sokumen Gedan-uke', 63, 'Teil 1: Hidari Ashi-zenkutsu, Sasho Jodan Nagashi-uke + Migi Shuto Gedan-uchikomi'],
      [22, 'Heisoku-dachi', 'Jotai sonomama (Oberkörper unverändert)', 63],
      [23, 'Hidari Kokutsu-dachi', 'Hidari Sokumen Jodan Uchi-uke + Migi Sokumen Gedan-uke', 64, 'Teil 1: Migi Ashi-zenkutsu, Usho Jodan Nagashi-uke + Hidari Shuto Gedan-uchikomi'],
    ],
    learn: `
      <p>Heian Godan hat laut Buch <b>23 Bewegungen</b>. Kiai bei <b>12</b> (Oi-zuki) und <b>19</b> (Sprung).</p>
      <ul>
        <li>Schnell und fließend: 1+2, 4+5, 8+9, 11+12 (11 und 12 „wie eine einzige Ausführung“).</li>
        <li>Bewegung 3 und 6: <b>Mizunagare-no-kamae</b> in Heisoku-dachi – langsam; Unterarm vor dem Solarplexus, etwa <b>zwei Fäuste</b> von der Brust.</li>
        <li>Bewegung 9: <b>Kaisho Jodan Kosa-uke</b> (Ryosho Jodan Juji-uke) – blockt einen rechten Jodan-Zuki.</li>
        <li>Bewegung 11: Saken Chudan-zuki kann auch als Uke-zuki (Block und Stoß zugleich) verstanden werden.</li>
        <li>Bewegung 14: Hände langsam und kraftvoll zurückziehen – wie beim Spannen eines Bogens. Die linke Hand bewegt sich von 14 bis 16 nicht.</li>
        <li>Bewegung 18: <b>Tai-no-shinshuku</b> – Zusammenziehen (17) und plötzliches Ausdehnen (18) des Körpers.</li>
        <li>Bewegung 19: Sprung mit Kiai, Drehung um 180°, Landung in Kosa-dachi; der Sprung soll Höhe und Weite haben.</li>
        <li>Bewegung 20: dieser Migi Zenkutsu-dachi hat <b>keine Breite</b>.</li>
        <li>Heian hieß früher <b>Pin An</b>.</li>
      </ul>`,
    facts(L) {
      L.mc('Heian Godan, Bewegung 3: Wie heißt die Haltung in Heisoku-dachi?', ['Hidari Zenwan Mizunagare-no-kamae', 'Ryoken Koshi-kamae', 'Hitai-mae Yoko-kamae', 'Gedan-kamae'], '', P(55));
      L.mc('Heian Godan, Mizunagare-no-kamae: Wie weit ist der Unterarm von der Brust entfernt?', ['Etwa zwei Fäuste', 'Er liegt an der Brust an', 'Etwa eine Armlänge', 'Etwa eine halbe Faust'], '', P(55));
      L.mc('Heian Godan, Bewegung 9 (Kaisho Jodan Kosa-uke): Welcher Angriff wird laut Meaning Point geblockt?', ['Ein rechter Jodan-Zuki', 'Ein Mae-geri', 'Ein Gedan-Zuki', 'Ein Mawashi-geri'], '', P(57));
      L.mc('Heian Godan, Bewegung 9: Wie wird die Technik in Best Karate genannt?', ['Ryosho Jodan Juji-uke', 'Morote Age-uke', 'Kakiwake-uke', 'Haiwan-uke'], '', P(57));
      L.mc('Heian Godan, Bewegungen 11 und 12: Wie sollen sie ausgeführt werden?', ['Schnell, fließend, mit dem Gefühl einer einzigen Ausführung', 'Langsam und kraftvoll', 'Mit Pause dazwischen', 'Mit Sprung'], '', P(58));
      L.mc('Heian Godan, Bewegung 11: Wie kann der Saken Chudan-zuki laut Hinweis auch verwendet werden?', ['Als gleichzeitiger Block und Stoß mit demselben Arm (Uke-zuki)', 'Als Wurf', 'Als Fußfeger', 'Als Hebel'], '', P(58));
      L.mc('Heian Godan, Bewegung 14: Mit welchem Bild beschreibt das Buch das Zurückziehen der Hände?', ['Wie beim Spannen eines Bogens', 'Wie beim Werfen eines Balls', 'Wie beim Schwimmen', 'Wie beim Rudern'], '', P(59));
      L.mc('Heian Godan, Bewegung 15: Wohin trifft der Mikazuki-geri?', ['In die Handfläche der linken Hand (Sasho-ni)', 'An den Kopf des Gegners', 'Auf den Boden', 'In die rechte Hand'], '', P(60));
      L.mc('Heian Godan: Welche Hand bleibt während der Bewegungen 14, 15 und 16 unbewegt?', ['Die linke Hand', 'Die rechte Hand', 'Beide Hände', 'Keine'], '', P(60));
      L.mc('Heian Godan, Bewegung 18: Welches Prinzip veranschaulicht der Wechsel von Zusammenziehen (17) zu Ausdehnen (18)?', ['Tai-no-shinshuku', 'Zanshin', 'Ki-ken-tai-ichi', 'Sun-dome'], '', P(61));
      L.mc('Heian Godan, Bewegung 19: Wie soll der Sprung laut Karate-Do Kyohan sein?', ['Mit Höhe und Weite, Abstoß vom rechten Fuß, Drehung nach links', 'Möglichst flach und kurz', 'Ohne Drehung', 'Rückwärts'], '', P(62));
      L.mc('Heian Godan, Bewegung 20: Was ist an diesem Migi Zenkutsu-dachi besonders?', ['Er hat keine Breite', 'Er ist doppelt so breit', 'Er wird im Sprung ausgeführt', 'Das Gewicht liegt hinten'], '', P(62));
      L.mc('Heian Godan, Bewegung 22: Wie wird „Jotai sonomama Heisoku-dachi“ ausgeführt?', ['Langsam – Oberkörper unverändert, linker Fuß wird herangezogen', 'Schnell mit Kiai', 'Mit Sprung', 'Mit Drehung um 180°'], '', P(63));
      L.mc('Wie hieß die Heian-Kata früher laut Karate-Do Kyohan?', ['Pin An', 'Naihanchi', 'Kushanku', 'Wanshu'], '', P(65));
      L.mc('Was soll laut Karate-Do Kyohan die Beherrschung der fünf Heian-Kata vermitteln?', ['Ein Gefühl der Sicherheit, sich selbst verteidigen zu können', 'Die Fähigkeit, Wettkämpfe zu gewinnen', 'Gelenkigkeit', 'Die Berechtigung zur Dan-Prüfung'], '', P(65));
    },
  };
})();
