/* Kata-Daten Tekki Shodan. Einzige Quelle: Karate-Do Kata Vol. 1 (JKA). */
(function () {
  'use strict';
  const P = (n) => SK.bookSrc(n);

  SK.kata['tekki-shodan'] = {
    id: 'tekki-shodan', name: 'Tekki Shodan', moves: 29, kiai: [15, 29], firstPage: 66,
    // Kata-Ansage: Bodenkarte nach der Fußskizze im Buch (vermessen mit tools/kata-pdf/embusen.py).
    // f = [linker Fuß, rechter Fuß] mit [x, y, Zehenrichtung (0 = vorne, im Uhrzeigersinn), Gewicht]; body = Körperrichtung,
    // look = Blick, falls zur Seite; turn = Drehung in Grad (negativ = links herum); h = Fußarbeit.
    ansage: {
      kana: 'てっき しょだん',
      page: 77,
      lines: [[-1, 0, 1, 0]],
      rei: { f: [[-0.06, 0, 330, 0.5], [0.04, 0, 30, 0.5]], body: 0, h: 'Verbeugung, Fersen zusammen' },
      yoi: { f: [[-0.09, 0.02, 0, 0.5], [0.03, 0.02, 0, 0.5]], body: 0, h: 'Füße geschlossen (Heisoku-dachi)' },
      moves: [
        { f: [[0.17, 0.02, 0, 0.1], [0.03, 0.02, 9, 0.9]], body: 0, look: 90, h: 'Blick nach rechts, linker Fuß kreuzt vor dem rechten nach rechts' },
        { f: [[0.11, 0.03, 359, 0.5], [0.82, 0.02, 4, 0.5]], body: 0, look: 90, h: 'Rechter Fuß stampft nach rechts (Fumikomi) – Kiba-dachi' },
        { f: [[0.21, 0.02, 356, 0.5], [0.82, 0.03, 4, 0.5]], body: 0, look: 90, h: 'Stand bleibt' },
        { f: [[0.21, 0.03, 356, 0.5], [0.7, 0.03, 8, 0.5]], body: 0, look: 270, h: 'Stand bleibt, Blick nach links' },
        { f: [[0.16, 0.02, 353, 0.5], [0.82, 0.03, 5, 0.5]], body: 0, look: 270, h: 'Stand bleibt' },
        { f: [[0.14, 0.03, 351, 0.5], [0.8, 0.03, 7, 0.5]], body: 0, look: 270, h: 'Stand bleibt' },
        { f: [[0.08, 0.04, 5, 0.9], [-0.06, 0.04, 355, 0.1]], body: 0, look: 270, h: 'Langsam: rechter Fuß kreuzt vor dem linken nach links' },
        { f: [[-0.73, 0.02, 354, 0.5], [0.01, 0.03, 2, 0.5]], body: 0, h: 'Linker Fuß stampft nach links (Fumikomi) – Kiba-dachi, Blick nach vorne' },
        { f: [[-0.78, 0.02, 357, 0.5], [0.03, 0.03, 6, 0.5]], body: 0, h: 'Stand bleibt' },
        { f: [[-0.73, 0.01, 354, 0.5], [0.04, 0.01, 6, 0.5]], body: 0, look: 270, h: 'Stand bleibt, Blick nach links' },
        { f: [[-0.75, 0.02, 357, 0.5], [-0.03, 0.01, 8, 0.5]], body: 0, look: 270, via: [0, -0.5, 0.06, 60], h: 'Linker Fuß hebt nach innen hoch (Namigaeshi) und setzt wieder ab' },
        { f: [[-0.78, 0.01, 353, 0.5], [-0.03, 0.03, 4, 0.5]], body: 0, look: 90, h: 'Stand bleibt, Blick nach rechts' },
        { f: [[-0.71, 0.02, 352, 0.5], [0.03, 0.02, 3, 0.5]], body: 0, look: 90, via: [1, -0.22, 0.06, 300], h: 'Rechter Fuß hebt nach innen hoch (Namigaeshi) und setzt wieder ab' },
        { f: [[-0.69, 0.02, 352, 0.5], [0.07, 0.03, 7, 0.5]], body: 0, look: 270, h: 'Stand bleibt, Blick nach links' },
        { f: [[-0.71, 0.03, 354, 0.5], [0.05, 0.03, 5, 0.5]], body: 0, look: 270, h: 'Stand bleibt – Kiai' },
        { f: [[-0.71, 0.02, 355, 0.5], [0.03, 0.03, 3, 0.5]], body: 0, look: 270, h: 'Langsam: Stand bleibt' },
        { f: [[-0.61, 0.03, 351, 0.5], [0.13, 0.04, 4, 0.5]], body: 0, look: 270, h: 'Stand bleibt' },
        { f: [[-0.59, 0.03, 353, 0.5], [0.16, 0.04, 7, 0.5]], body: 0, look: 90, h: 'Stand bleibt, Blick nach rechts' },
        { f: [[-0.62, 0.03, 355, 0.5], [0.13, 0.03, 6, 0.5]], body: 0, look: 90, h: 'Stand bleibt' },
        { f: [[-0.63, 0.02, 352, 0.5], [0.11, 0.03, 2, 0.5]], body: 0, look: 90, h: 'Stand bleibt' },
        { f: [[0.05, 0.04, 5, 0.1], [-0.07, 0.04, 355, 0.9]], body: 0, look: 90, h: 'Langsam: linker Fuß kreuzt vor dem rechten nach rechts' },
        { f: [[0.14, 0.02, 353, 0.5], [0.88, 0.02, 5, 0.5]], body: 0, h: 'Rechter Fuß stampft nach rechts (Fumikomi) – Kiba-dachi, Blick nach vorne' },
        { f: [[0.19, 0.02, 352, 0.5], [0.89, 0.03, 4, 0.5]], body: 0, h: 'Stand bleibt' },
        { f: [[0.24, 0.02, 353, 0.5], [0.9, 0.03, 8, 0.5]], body: 0, look: 90, h: 'Stand bleibt, Blick nach rechts' },
        { f: [[0.14, 0.02, 355, 0.5], [0.87, 0.03, 7, 0.5]], body: 0, look: 90, via: [1, 0.62, 0.06, 300], h: 'Rechter Fuß hebt nach innen hoch (Namigaeshi) und setzt wieder ab' },
        { f: [[0.16, 0.02, 352, 0.5], [0.88, 0.02, 6, 0.5]], body: 0, look: 270, h: 'Stand bleibt, Blick nach links' },
        { f: [[0.21, 0.02, 356, 0.5], [0.93, 0.01, 7, 0.5]], body: 0, look: 270, via: [0, 0.41, 0.06, 60], h: 'Linker Fuß hebt nach innen hoch (Namigaeshi) und setzt wieder ab' },
        { f: [[0.22, 0.01, 353, 0.5], [0.93, 0.01, 5, 0.5]], body: 0, look: 90, h: 'Stand bleibt, Blick nach rechts' },
        { f: [[0.11, 0.01, 354, 0.5], [0.92, 0, 6, 0.5]], body: 0, look: 90, h: 'Stand bleibt – Kiai' },
      ],
      // Naore und Ende: Die Skizze zeichnet sie am Start, der linke Fuß bleibt aber laut Text stehen – wie nach dem ersten
      // Kreuzschritt endet die Kata etwas rechts vom Start, dort auch die Verbeugung (sonst sprängen beide Füße zum Rei).
      naore: { f: [[0.16, 0.03, 357, 0.5], [0.27, 0.02, 6, 0.5]], body: 0, h: 'Linker Fuß bleibt, rechter Fuß zieht neben den linken zurück' },
      end: { f: [[0.16, -0.01, 330, 0.5], [0.27, -0.01, 30, 0.5]], body: 0, h: 'Verbeugung, Ende der Kata' },
    },
    yoi: 'Heisoku-dachi, linke Handfläche auf dem Rücken der rechten Hand vor dem Unterbauch',
    naore: 'Der linke Fuß bleibt, der rechte Fuß geht neben den linken zurück in die Yoi-Position.',
    continuous: [],
    slow: [7, 16, 21],
    seq: [
      [1, 'Hidari Ashi-mae Kosa', 'Kao Migi-muki (Blick nach rechts)', 66, 'linker Fuß kreuzt vor dem rechten'],
      [2, 'Kiba-dachi', 'Migi Tekubi Migi Sokumen Chudan Kake-uke', 67, 'Migi Ashi Fumikomi'],
      [3, 'Kiba-dachi', 'Migi Sokumen Hidari Mae-enpi (Usho Hidari Hiji-ate)', 67],
      [4, 'Kiba-dachi', 'Kao Hidari-muki Ryoken Migi Koshi-kamae', 67],
      [5, 'Kiba-dachi', 'Hidari Sokumen Hidari Gedan-barai', 68],
      [6, 'Kiba-dachi', 'Uken Kagi-zuki', 68],
      [7, 'Migi Ashi-mae Kosa', 'Rechter Fuß kreuzt langsam vor dem linken', 68],
      [8, 'Kiba-dachi', 'Migi Chudan Uchi-uke', 69, 'Hidari Ashi Fumikomi, Kao Shomen-muki'],
      [9, 'Kiba-dachi', 'Hidari Uraken Jodan-uchi + Migi Zenwan Mune-mae Suihei-kamae', 69, 'Teil 1: Hidari Haiwan Jodan Uchi-nagashi-uke + Migi Gedan-uke'],
      [10, 'Kiba-dachi', 'Kao Hidari-muki (Blick nach links)', 70],
      [11, 'Kiba-dachi', 'Hidari Zenwan Hidari Sokumen Chudan-uke', 70, 'Hidari Ashi Namigaeshi'],
      [12, 'Kiba-dachi', 'Kao Migi-muki (Blick nach rechts)', 70],
      [13, 'Kiba-dachi', 'Hidari Zenwan Migi Sokumen Chudan-uke', 71, 'Migi Ashi Namigaeshi'],
      [14, 'Kiba-dachi', 'Kao Hidari-muki Ryoken Migi Koshi-kamae', 71],
      [15, 'Kiba-dachi', 'Saken Hidari Sokumen Chudan-zuki + Uken Kagi-zuki', 72],
      [16, 'Kiba-dachi', 'Hidari Tekubi Hidari Sokumen Chudan Kake-uke', 72],
      [17, 'Kiba-dachi', 'Hidari Sokumen Migi Mae-enpi (Sasho Migi Hiji-ate)', 73],
      [18, 'Kiba-dachi', 'Kao Migi-muki Ryoken Hidari Koshi-kamae', 73],
      [19, 'Kiba-dachi', 'Migi Sokumen Migi Gedan-barai', 73],
      [20, 'Kiba-dachi', 'Saken Kagi-zuki', 74],
      [21, 'Hidari Ashi-mae Kosa', 'Linker Fuß kreuzt langsam vor dem rechten', 74],
      [22, 'Kiba-dachi', 'Hidari Chudan Uchi-uke', 74, 'Migi Ashi Fumikomi, Kao Shomen-muki'],
      [23, 'Kiba-dachi', 'Migi Uraken Jodan-uchi + Hidari Zenwan Mune-mae Suihei-kamae', 75, 'Teil 1: Migi Haiwan Jodan Uchi-nagashi-uke + Hidari Gedan-uke'],
      [24, 'Kiba-dachi', 'Kao Migi-muki (Blick nach rechts)', 75],
      [25, 'Kiba-dachi', 'Migi Zenwan Migi Sokumen Chudan-uke', 75, 'Migi Ashi Namigaeshi'],
      [26, 'Kiba-dachi', 'Kao Hidari-muki (Blick nach links)', 76],
      [27, 'Kiba-dachi', 'Migi Zenwan Hidari Sokumen Chudan-uke', 76, 'Hidari Ashi Namigaeshi'],
      [28, 'Kiba-dachi', 'Kao Migi-muki Ryoken Hidari Koshi-kamae', 76],
      [29, 'Kiba-dachi', 'Uken Migi Sokumen Chudan-zuki + Saken Kagi-zuki', 76],
    ],
    learn: `
      <p>Tekki Shodan hat laut Buch <b>29 Bewegungen</b>. Kiai bei <b>15</b> und <b>29</b> (Doppelfauststoß mit Kagi-zuki).</p>
      <ul>
        <li><b>Yoi</b>: Heisoku-dachi, linke Handfläche auf dem Rücken der rechten Hand vor dem Unterbauch.</li>
        <li>Bewegung 1: Blick nach rechts, Hüfte absenken, linken Fuß sanft über den rechten kreuzen – alle Zehen auf einer Linie.</li>
        <li>Bewegung 2: Kake-uke mit dem Handgelenk (Hakenbewegung); alternativ Schlag mit dem Handrücken (<b>Haishu</b>) auf den Solarplexus.</li>
        <li>Bewegung 3 und 17: Mae-enpi, die offene Hand schlägt gegen den Ellbogen – mit großer Kraft.</li>
        <li>Bewegung 6 und 20: <b>Kagi-zuki</b> – Unterarm vor dem Solarplexus, etwa zwei Fäuste von der Brust (wie Mizunagare-no-kamae).</li>
        <li>Bewegung 7 und 21: Fuß kreuzt <b>langsam und verstohlen</b>.</li>
        <li><b>Namigaeshi</b> (11, 13, 25, 27): Fuß federnd hochziehen, Fußsohle nach oben – fegender Block gegen einen Tritt.</li>
        <li>Bewegung 9 und 23: Uraken trifft <b>Jinchu</b>.</li>
        <li>Blickwechsel (Kao …-muki) scharf ausführen.</li>
        <li>Tekki hieß früher <b>Naihanchi</b>. Charakteristisch ist der Stand: Oberschenkelinnenseiten anspannen, als säße man auf einem Pferd.</li>
      </ul>`,
    facts(L) {
      L.mc('Tekki Shodan, Bewegung 1: Wie wird der linke Fuß gekreuzt?', ['Sanft über den rechten Fuß, alle Zehen auf einer Linie', 'Hinter dem rechten Fuß mit Sprung', 'Mit Stampfen', 'Weit nach vorne'], '', P(66));
      L.mc('Tekki Shodan, Bewegung 2: Welche Alternative nennt der Point?', ['Schlag mit dem Handrücken (Haishu) auf den Solarplexus', 'Fauststoß Jodan', 'Fußfeger', 'Kopfstoß'], '', P(67));
      L.mc('Was ist HAISHU laut Buch?', ['Der Rücken der offenen Hand mit vier gestreckten Fingern und gebeugtem Daumen', 'Der Handballen', 'Die Handkante', 'Die Faustrückseite'], '', P(67));
      L.mc('Tekki Shodan, Bewegung 3 (Mae-enpi mit Hiji-ate): Mit welcher Intensität wird geschlagen?', ['Mit großer Kraft', 'Langsam und weich', 'Nur angedeutet', 'Mit Pause'], '', P(67));
      L.mc('Tekki Shodan, Kagi-zuki (Bewegung 6): Wie weit ist der Unterarm von der Brust entfernt?', ['Etwa zwei Fäuste', 'Eine Armlänge', 'Er liegt an', 'Etwa vier Fäuste'], 'Die Position entspricht Mizunagare-no-kamae.', P(68));
      L.mc('Tekki Shodan, Bewegung 7: Wie wird der rechte Fuß gekreuzt?', ['Langsam und verstohlen', 'Schnell mit Kiai', 'Mit Sprung', 'Mit Stampfen'], '', P(68));
      L.mc('Tekki Shodan, Bewegung 8: Was soll zusammen ausgeführt werden?', ['Blicken, Blocken und Stampfen', 'Nur Blocken und Kiai', 'Atmen und Schlagen', 'Springen und Drehen'], '', P(69));
      L.mc('Tekki Shodan, Bewegung 9: Worauf zielt der Uraken?', ['Jinchu (Bereich über der Oberlippe)', 'Den Solarplexus', 'Die Schläfe', 'Das Knie'], '', P(69));
      L.mc('Was beschreibt NAMIGAESHI in Tekki Shodan?', ['Fuß federnd bis vor den Unterbauch heben, Sohle nach oben – fegender Block gegen einen Tritt', 'Ein Stampfer auf den Fuß des Gegners', 'Ein Sprung', 'Ein Mae-geri Jodan'], '', P(70));
      L.mc('Wie sollen die Blickwechsel (Kao Hidari-muki / Kao Migi-muki) in Tekki Shodan ausgeführt werden?', ['Scharf und schnell', 'Langsam', 'Mit geschlossenen Augen', 'Mit Kiai'], '', P(70));
      L.mc('Wie hieß Tekki früher?', ['Naihanchi', 'Pin An', 'Wanshu', 'Kushanku'], '', P(77));
      L.mc('Wofür ist Tekki laut Karate-Do Kyohan besonders charakteristisch?', ['Für den Stand – Innenseite der Oberschenkel anspannen wie beim Reiten auf einem Pferd', 'Für viele Sprünge', 'Für viele Fußtritte', 'Für langsame Atembewegungen'], '', P(77));
      L.mc('In welchem Stand wird fast die gesamte Tekki Shodan ausgeführt?', ['Kiba-dachi', 'Zenkutsu-dachi', 'Kokutsu-dachi', 'Neko-ashi-dachi'], '', P(67));
    },
  };
})();
