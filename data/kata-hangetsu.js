/* Kata-Daten Hangetsu. Einzige Quelle: Karate-Do Kata Vol. 2 (JKA) – aus Band 2 nur diese Kata.
   seq: [Nr, Stand, Technik, Seite der Scan-Datei von Band 2 (Buchseiten über SK.bookPages(n, 2)), Zusatz]. */
(function () {
  'use strict';
  const P = (n) => SK.bookSrc2(n);

  SK.kata['hangetsu'] = {
    id: 'hangetsu', name: 'Hangetsu', vol: 2, moves: 41, kiai: [11, 40], firstPage: 41,
    // Kata-Ansage: Bodenkarte nach der Fußskizze im Buch (vermessen mit tools/kata-pdf/embusen.py).
    // f = [linker Fuß, rechter Fuß] mit [x, y, Zehenrichtung (0 = vorne, im Uhrzeigersinn), Gewicht]; body = Körperrichtung,
    // look = Blick, falls zur Seite; turn = Drehung in Grad (negativ = links herum); h = Fußarbeit.
    ansage: {
      kana: 'はんげつ',
      page: 58,
      lines: [[-1, 0, 1, 0], [0, -0.8, 0, 1.45]],
      rei: { f: [[-0.06, -0.23, 330, 0.5], [0.04, -0.23, 30, 0.5]], body: 0, h: 'Verbeugung, Fersen zusammen' },
      yoi: { f: [[-0.17, -0.27, 335, 0.5], [0.18, -0.26, 25, 0.5]], body: 0, h: 'Erst linker, dann rechter Fuß nach außen – Hachiji-dachi' },
      moves: [
        { f: [[-0.12, 0.13, 30, 0.5], [0.21, -0.35, 0, 0.5]], body: 0, h: 'Rechtes Bein trägt und dreht nach innen, linker Fuß gleitet im Halbmond (Bogen von innen nach außen) nach vorne – Einatmen' },
        { f: [[-0.12, 0.11, 30, 0.5], [0.16, -0.37, 0, 0.5]], body: 0, h: 'Stand bleibt – Ausatmen' },
        { f: [[-0.25, 0.13, 0, 0.5], [0.05, 0.58, 330, 0.5]], body: 0, h: 'Linkes Bein trägt und dreht nach innen, rechter Fuß gleitet im Halbmond nach vorne' },
        { f: [[-0.25, 0.12, 0, 0.5], [0.05, 0.56, 330, 0.5]], body: 0, h: 'Stand bleibt' },
        { f: [[-0.13, 1.11, 30, 0.5], [0.16, 0.61, 0, 0.5]], body: 0, h: 'Rechtes Bein trägt und dreht nach innen, linker Fuß gleitet im Halbmond nach vorne' },
        { f: [[-0.11, 1.12, 30, 0.5], [0.17, 0.63, 0, 0.5]], body: 0, h: 'Stand bleibt' },
        { f: [[-0.1, 1.12, 30, 0.5], [0.19, 0.62, 0, 0.5]], body: 0, h: 'Langsam: Stand bleibt' },
        { f: [[-0.08, 1.15, 30, 0.5], [0.2, 0.66, 0, 0.5]], body: 0, h: 'Langsam: Stand bleibt' },
        { f: [[-0.13, 1.13, 30, 0.5], [0.16, 0.63, 0, 0.5]], body: 0, h: 'Langsam: Stand bleibt' },
        { f: [[-0.1, 1.11, 30, 0.5], [0.18, 0.62, 0, 0.5]], body: 0, h: 'Langsam: Stand bleibt' },
        { f: [[-0.14, 0.67, 210, 0.5], [-0.34, 1.32, 180, 0.5]], body: 180, turn: -180, h: 'Linkes Bein trägt, rechter Fuß gleitet am linken vorbei nach vorne, Wendung links herum nach hinten (Ura-shomen) – Kiai' },
        { f: [[-0.29, 0.68, 210, 0.5], [-0.53, 1.32, 180, 0.5]], body: 180, h: 'Langsam: Stand bleibt' },
        { f: [[-0.13, 0.86, 180, 0.5], [-0.52, 0.31, 150, 0.5]], body: 180, h: 'Linkes Bein trägt und dreht nach innen, rechter Fuß gleitet im Halbmond nach vorne' },
        { f: [[-0.14, 0.77, 180, 0.5], [-0.47, 0.22, 150, 0.5]], body: 180, h: 'Langsam: Stand bleibt' },
        { f: [[-0.1, -0.13, 210, 0.5], [-0.5, 0.27, 180, 0.5]], body: 180, h: 'Rechtes Bein trägt und dreht nach innen, linker Fuß gleitet im Halbmond nach vorne' },
        { f: [[-0.1, -0.12, 210, 0.5], [-0.51, 0.28, 180, 0.5]], body: 180, h: 'Langsam: Stand bleibt' },
        { f: [[-0.15, -0.1, 255, 0.5], [-0.72, 0.17, 235, 0.5]], body: 270, turn: 90, h: 'Linkes Bein trägt und dreht, rechter Fuß gleitet im Halbmond nach rechts – Viertelwendung rechts herum' },
        { f: [[-0.11, -0.03, 255, 0.5], [-0.68, 0.17, 235, 0.5]], body: 270, h: 'Stand bleibt' },
        { f: [[-0.12, -0.04, 255, 0.5], [-0.67, 0.19, 235, 0.5]], body: 270, h: 'Stand bleibt' },
        { f: [[0.63, 0.47, 120, 0.5], [0.12, 0.27, 90, 0.5]], body: 90, turn: -180, h: 'Hidari-e Yori-ashi: Wendung links herum, beide Füße gleiten nach rechts (in Blickrichtung)' },
        { f: [[0.61, 0.45, 120, 0.5], [0.08, 0.24, 90, 0.5]], body: 90, h: 'Stand bleibt' },
        { f: [[0.7, 0.42, 120, 0.5], [0.14, 0.21, 90, 0.5]], body: 90, h: 'Stand bleibt' },
        { f: [[0.61, 0.3, 180, 0.5], [0.34, -0.13, 150, 0.5]], body: 180, turn: 90, h: 'Beide Füße gleiten etwas nach rechts Richtung Ura-shomen, der rechte führt im Halbmond – Viertelwendung rechts herum' },
        { f: [[0.59, 0.3, 180, 0.5], [0.32, -0.13, 150, 0.5]], body: 180, h: 'Stand bleibt' },
        { f: [[0.52, 0.27, 180, 0.5], [0.25, -0.15, 150, 0.5]], body: 180, h: 'Stand bleibt' },
        { f: [[0.34, 0.63, 0, 0.3], [0.48, 0.05, 90, 0.7]], body: 0, turn: -180, h: 'Langsam: Rechter Fuß bleibt und dreht, Blick nach vorne (Shomen) – linker Fuß kommt ans rechte Knie und landet im großen Kreis vorne' },
        { f: [[0.38, 0.65, 0, 0.5], [0.39, 1.01, 25, 0.5]], body: 0, h: 'Langsam und leise: Linkes Bein trägt, rechter Fuß kreuzt vor dem linken nach vorne' },
        { f: [[0.17, 1.1, 0, 0], [0.33, 1.04, 25, 1]], body: 0, h: 'Gewicht aufs rechte Bein, linker Fuß tritt Mae-geri und zieht zurück' },
        { f: [[0.17, 1.33, 30, 0.5], [0.5, 0.88, 0, 0.5]], body: 0, h: 'Rechtes Bein trägt, linker Fuß setzt nach dem Tritt vorne auf' },
        { f: [[0.17, 1.36, 30, 0.5], [0.5, 0.91, 0, 0.5]], body: 0, h: 'Stand bleibt' },
        { f: [[0.2, 1.25, 30, 0.5], [0.49, 0.8, 0, 0.5]], body: 0, h: 'Stand bleibt – Hüfte in Hanmi' },
        { f: [[0.2, 1.18, 90, 0.7], [0.1, 0.77, 180, 0.3]], body: 180, turn: 180, h: 'Langsam: Linker Fuß bleibt und dreht, Blick nach hinten (Ura-shomen) – rechter Fuß kommt ans linke Knie und landet im großen Kreis hinten' },
        { f: [[0.1, 0.47, 160, 0.5], [0.07, 0.735, 180, 0.5]], body: 180, h: 'Langsam und leise: Rechtes Bein trägt, linker Fuß kreuzt vor dem rechten nach vorne' },
        { f: [[0.13, 0.385, 160, 1], [-0.07, 0.36, 180, 0]], body: 180, h: 'Gewicht aufs linke Bein, rechter Fuß tritt Mae-geri und zieht zurück' },
        { f: [[0.13, 0.35, 180, 0.5], [-0.01, -0.13, 150, 0.5]], body: 180, h: 'Linkes Bein trägt, rechter Fuß setzt nach dem Tritt vorne auf' },
        { f: [[0.15, 0.35, 180, 0.5], [0.01, -0.12, 150, 0.5]], body: 180, h: 'Stand bleibt' },
        { f: [[0.13, 0.33, 180, 0.5], [-0.01, -0.14, 150, 0.5]], body: 180, h: 'Stand bleibt – Hüfte in Hanmi' },
        { f: [[0.08, 0.44, 0, 0.3], [0.13, -0.03, 90, 0.7]], body: 0, turn: -180, h: 'Langsam: Rechter Fuß bleibt und dreht, Blick nach vorne (Shomen) – linker Fuß kommt ans rechte Knie und landet im großen Kreis vorne' },
        { f: [[0.03, 0.5, 355, 1], [0.03, 0.72, 300, 0]], body: 0, h: 'Gewicht aufs linke Bein, Hüfte dreht links herum, rechter Fuß tritt Mikazuki-geri in die linke Hand' },
        { f: [[0.04, 0.43, 30, 0.5], [0.22, 0.13, 0, 0.5]], body: 0, h: 'Linker Fuß bleibt, rechter Fuß setzt nach dem Tritt hinten auf – Kiai' },
        { f: [[0.08, 0.04, 35, 0.1], [0.11, -0.26, 20, 0.9]], body: 0, h: 'Langsam: Rechter Fuß gleitet etwas zurück, linker Fuß zieht heran – Neko-ashi-dachi' },
      ],
      naore: { f: [[-0.18, -0.32, 335, 0.5], [0.13, -0.32, 25, 0.5]], body: 0, h: 'Rechter Fuß bleibt, linker Fuß geht zurück – Hachiji-dachi' },
      end: { f: [[-0.04, -0.3, 330, 0.5], [0.06, -0.3, 30, 0.5]], body: 0, h: 'Verbeugung, Ende der Kata' },
    },
    yoi: 'Hachiji-dachi, beide Fäuste vor den Oberschenkeln',
    naore: 'Der rechte Fuß bleibt stehen, der linke Fuß geht zurück in die Yoi-Position.',
    continuous: [[18, 19], [21, 22], [24, 25], [39, 40]],
    slow: [7, 8, 9, 10, 12, 14, 16, 26, 27, 32, 33, 38, 41],
    seq: [
      [1, 'Hidari Ashi-mae Hangetsu-dachi', 'Hidari Chudan Uchi-uke', 41, 'Halbmondschritt, Einatmen'],
      [2, 'Hidari Ashi-mae Hangetsu-dachi', 'Migi Chudan Gyaku-zuki', 42, 'Ausatmen'],
      [3, 'Migi Ashi-mae Hangetsu-dachi', 'Migi Chudan Uchi-uke', 42, 'Halbmondschritt'],
      [4, 'Migi Ashi-mae Hangetsu-dachi', 'Hidari Chudan Gyaku-zuki', 43],
      [5, 'Hidari Ashi-mae Hangetsu-dachi', 'Hidari Chudan Uchi-uke', 43, 'Halbmondschritt'],
      [6, 'Hidari Ashi-mae Hangetsu-dachi', 'Migi Chudan Gyaku-zuki', 44],
      [7, 'Hidari Ashi-mae Hangetsu-dachi', 'Ryo-jishi-ippon-ken Ryo-chichi-shita', 44, 'Fäuste unter die Brust zurückziehen'],
      [8, 'Hidari Ashi-mae Hangetsu-dachi', 'Ryo-jishi-ippon-ken Chudan Morote-zuki', 44],
      [9, 'Hidari Ashi-mae Hangetsu-dachi', 'Kaisho Yama-gamae', 45],
      [10, 'Hidari Ashi-mae Hangetsu-dachi', 'Ryote Ryogawa Gedan-kakiwake', 45],
      [11, 'Hidari Ashi-mae Hangetsu-dachi', 'Migi Chudan Uchi-uke + Hidari Gedan-uke', 45, 'Wendung nach hinten (Ura-shomen), Zeigefinger gestreckt'],
      [12, 'Hidari Ashi-mae Hangetsu-dachi', 'Usho Tsukami', 46, 'Koko (Hand in C-Form)'],
      [13, 'Migi Ashi-mae Hangetsu-dachi', 'Hidari Chudan Uchi-uke + Migi Gedan-uke', 46, 'Halbmondschritt'],
      [14, 'Migi Ashi-mae Hangetsu-dachi', 'Sasho Tsukami', 47, 'Koko (Hand in C-Form)'],
      [15, 'Hidari Ashi-mae Hangetsu-dachi', 'Migi Chudan Uchi-uke + Hidari Gedan-uke', 47, 'Halbmondschritt'],
      [16, 'Hidari Ashi-mae Hangetsu-dachi', 'Usho Tsukami', 48, 'Koko (Hand in C-Form)'],
      [17, 'Migi Ashi-mae Hangetsu-dachi', 'Migi Chudan Uchi-uke', 48, 'Halbmondschritt nach rechts'],
      [18, 'Migi Ashi-mae Hangetsu-dachi', 'Hidari Chudan Gyaku-zuki', 48],
      [19, 'Migi Ashi-mae Hangetsu-dachi', 'Uken Chudan-zuki (Saken Hidari Koshi)', 49, 'Ren-zuki'],
      [20, 'Hidari Ashi-mae Hangetsu-dachi', 'Hidari Chudan Uchi-uke', 49, 'Hidari-e Yori-ashi'],
      [21, 'Hidari Ashi-mae Hangetsu-dachi', 'Migi Chudan Gyaku-zuki', 49],
      [22, 'Hidari Ashi-mae Hangetsu-dachi', 'Saken Chudan-zuki (Uken Migi Koshi)', 50, 'Ren-zuki'],
      [23, 'Migi Ashi-mae Hangetsu-dachi', 'Migi Chudan Uchi-uke', 50, 'Beide Füße gleiten, rechter Fuß im Halbmond Richtung Ura-shomen'],
      [24, 'Migi Ashi-mae Hangetsu-dachi', 'Hidari Chudan Gyaku-zuki', 50],
      [25, 'Migi Ashi-mae Hangetsu-dachi', 'Uken Chudan-zuki (Saken Hidari Koshi)', 51, 'Ren-zuki'],
      [26, 'Migi Kokutsu-dachi', 'Hidari Uraken Tate-mawashi-uchi (Uken Migi Koshi)', 51, 'Blick nach vorne (Shomen), Fuß und Faust im großen Kreis'],
      [27, 'Migi Ashi-mae Kosa', 'Rechter Fuß kreuzt leise vor dem linken', 52],
      [28, 'Migi Ashi-dachi', 'Hidari Chudan Mae-geri-keage (Saken Migi Kata)', 52],
      [29, 'Hidari Ashi-mae Hangetsu-dachi', 'Saken Gedan-zuki', 53],
      [30, 'Hidari Ashi-mae Hangetsu-dachi', 'Migi Chudan Gyaku-zuki', 53],
      [31, 'Hidari Ashi-mae Hangetsu-dachi', 'Hidari Jodan Age-uke', 53, 'Hanmi'],
      [32, 'Hidari Kokutsu-dachi', 'Migi Uraken Tate-mawashi-uchi (Saken Hidari Koshi)', 53, 'Blick nach hinten (Ura-shomen), Fuß und Faust im großen Kreis'],
      [33, 'Hidari Ashi-mae Kosa', 'Linker Fuß kreuzt leise vor dem rechten', 54],
      [34, 'Hidari Ashi-dachi', 'Migi Chudan Mae-geri-keage (Uken Hidari Kata)', 54],
      [35, 'Migi Ashi-mae Hangetsu-dachi', 'Uken Gedan-zuki', 55],
      [36, 'Migi Ashi-mae Hangetsu-dachi', 'Hidari Chudan Gyaku-zuki', 55],
      [37, 'Migi Ashi-mae Hangetsu-dachi', 'Migi Jodan Age-uke', 55, 'Hanmi'],
      [38, 'Migi Kokutsu-dachi', 'Hidari Uraken Tate-mawashi-uchi (Uken Migi Koshi)', 56, 'Blick nach vorne (Shomen), Fuß und Faust im großen Kreis'],
      [39, 'Hidari Ashi-dachi', 'Sasho-ni Migi Chudan Mikazuki-geri', 56, 'im Buch: Mikazuki-geri Sasho-ate'],
      [40, 'Hidari Ashi-mae Hangetsu-dachi', 'Uken Chudan-zuki (Saken Hidari Koshi)', 57],
      [41, 'Hidari Ashi-mae Neko-ashi-dachi', 'Ryo-teisho Gedan Awase-uke', 57],
    ],
    learn: `
      <p>Hangetsu („Halbmond“) hat laut Buch <b>41 Bewegungen</b>. Kiai bei <b>11</b> und <b>40</b>. Die Kata steht in <i>Karate-Do Kata Vol. 2</i> (S. 74–111).</p>
      <ul>
        <li>Früher hieß die Kata <b>Seshan</b>. Den neuen Namen bekam sie, weil Hände und Füße Halbkreise ziehen – wie ein Halbmond (nach Erinnerungen an Funakoshis Unterricht).</li>
        <li><b>Halbmondschritt</b>: Ein Bein trägt, der andere Fuß gleitet im Bogen von innen nach außen nach vorne.</li>
        <li><b>Hangetsu-dachi</b> ist etwas kürzer als Zenkutsu-dachi. Knie und Innenseiten der Oberschenkel sind zur Mitte gespannt, die Fußsohlen „greifen“ den Boden.</li>
        <li>Bewegungen 1–6: Uchi-uke im Halbmondschritt (Unterarme kreuzen vor dem Bauch) und Gyaku-zuki – mit erhöhter dynamischer Spannung, Hüfte und Hände <b>im Takt der Atmung</b> (1 einatmen, 2 ausatmen).</li>
        <li>Bewegungen 7–10 <b>langsam und kraftvoll</b>: <b>Jishi-ippon-ken</b> (Zeigefingerknöchel vorgestellt, vom Daumen gestützt) unter die Brust zurück, dann Doppelstoß; Kaisho Yama-gamae und Gedan-kakiwake – Befreiungen aus einem Griff von hinten.</li>
        <li>Bewegung 11: Wendung nach hinten (<b>Ura-shomen</b>) mit Kiai, Zeigefinger gestreckt; danach <b>Tsukami</b> mit der Hand in C-Form (<b>Koko</b>) – abwehren und das Handgelenk des Gegners greifen.</li>
        <li>18–19, 21–22 und 24–25 sind <b>Ren-zuki</b>; in 20 gleiten beide Füße links herum (<b>Hidari-e Yori-ashi</b>).</li>
        <li>26, 32 und 38: Faust und Fuß ziehen langsam einen großen senkrechten Kreis (Uraken Tate-mawashi-uchi in Kokutsu-dachi); 27 und 33 kreuzt der Fuß leise; 28 und 34 Mae-geri mit dem Fußballen.</li>
        <li>39–40 fließend: Mikazuki-geri in die linke Hand, Landung nach hinten, Chudan-zuki mit Kiai.</li>
        <li>Ende in <b>Neko-ashi-dachi</b> mit <b>Teisho Awase-uke</b> (beide Handballen) gegen das Schienbein eines Tritts – langsam und kraftvoll.</li>
      </ul>`,
    facts(L) {
      L.mc('Wie hieß Hangetsu früher?', ['Seshan', 'Naihanchi', 'Wanshu', 'Kushanku'], 'Laut Buch nach Erinnerungen an Funakoshis Unterricht.', P(44));
      L.mc('Warum heißt die Kata Hangetsu (Halbmond)?', ['Hände und Füße ziehen Halbkreise wie ein Halbmond', 'Sie wird bei Halbmond geübt', 'Die Enbusen hat die Form eines Halbmonds', 'Sie hat halb so viele Bewegungen wie Kanku Dai'], '', P(44));
      L.mc('Hangetsu, Bewegung 1: Wie gleitet der linke Fuß nach vorne?', ['Im Bogen von innen nach außen – wie ein Halbmond', 'Gerade nach vorne', 'Im Bogen von außen nach innen', 'Mit einem Sprung'], 'Das rechte Bein trägt.', P(41));
      L.mc('Wie lang ist Hangetsu-dachi laut Buch?', ['Etwas kürzer als Zenkutsu-dachi', 'Doppelt so lang wie Zenkutsu-dachi', 'Genauso lang wie Kiba-dachi breit ist', 'Füße geschlossen'], '', P(41));
      L.mc('Hangetsu-dachi: Wohin geht die Spannung in Knien und Oberschenkeln?', ['Nach innen zur Mitte – die Fußsohlen greifen den Boden', 'Nach außen wie im Kiba-dachi', 'Nur ins vordere Knie', 'Gar keine Spannung, locker stehen'], '', P(41));
      L.mc('Hangetsu, Bewegung 1: Wie kreuzen die Unterarme vor dem Uchi-uke?', ['Vor dem Bauch, der rechte Unterarm über dem linken', 'Vor dem Gesicht, der linke über dem rechten', 'Hinter dem Rücken', 'Sie kreuzen nicht'], '', P(41));
      L.mc('Hangetsu, Bewegungen 1 und 2: Wie passen Bewegung und Atmung zusammen?', ['Bewegung 1 beim Einatmen, Bewegung 2 beim Ausatmen', 'Beide beim Einatmen', 'Bewegung 1 beim Ausatmen, Bewegung 2 beim Einatmen', 'Atem anhalten'], 'Hüftdrehung und Hände folgen der Atmung.', P(42));
      L.mc('Hangetsu, Bewegungen 1, 3 und 5: Wie werden sie ausgeführt?', ['Mit erhöhter dynamischer Spannung, Hände und Füße enden gleichzeitig', 'Locker und schnell mit Kiai', 'Langsam ohne Spannung', 'Erst die Füße, dann die Hände'], '', P(41));
      L.mc('Was ist JISHI-IPPON-KEN (Hangetsu, Bewegung 7)?', ['Faust mit halb gebeugtem Zeigefinger, dessen Knöchel vorsteht – der Daumen stützt ihn von innen', 'Faust mit vorstehendem Mittelfingerknöchel', 'Offene Hand mit gestrecktem Zeigefinger', 'Handballen mit gebeugten Fingern'], '', P(44));
      L.mc('Hangetsu, Bewegung 7: Wohin werden beide Fäuste zurückgezogen?', ['Unter die Brustwarzenlinie (Ryo-chichi-shita)', 'An die Hüften', 'Vor das Gesicht', 'Auf die Schultern'], 'Schultern bleiben unten, die Ellbogen gehen zur Seite.', P(44));
      L.multi('Hangetsu, Bewegung 7: Welche Bedeutungen nennt das Buch?', ['Griff von hinten über den Armen: Ellbogen zur Seite heben sprengt ihn', 'Griff von hinten unter den Armen: mit Jishi-ippon-ken auf die Handrücken schlagen'], ['Fauststoß zum Kinn', 'Abwehr eines Fußtritts'], '', P(44));
      L.mc('Hangetsu, Bewegung 8: Welches Ziel hat der Doppelstoß mit Jishi-ippon-ken?', ['Einen Vitalpunkt zwischen der 5. und 6. Rippe', 'Das Kinn', 'Den Unterbauch', 'Die Schläfe'], '', P(44));
      L.mc('Hangetsu, Bewegungen 7 bis 10: Wie werden sie ausgeführt?', ['Langsam und kraftvoll', 'Schnell mit Kiai', 'Als Ren-zuki', 'Im Sprung'], '', P(44));
      L.mc('Hangetsu, Bewegung 9 (Kaisho Yama-gamae): Wo stehen die Ellbogen?', ['Auf Schulterhöhe, die Unterarme senkrecht neben dem Gesicht', 'An den Hüften', 'Vor dem Bauch gekreuzt', 'Hoch über dem Kopf gestreckt'], 'Bedeutung: Ellbogen senkrecht hochreißen, um einen Griff von hinten zu sprengen.', P(45));
      L.multi('Hangetsu, Bewegung 10 (Gedan-kakiwake): Welche Bedeutungen nennt das Buch?', ['Nach der Befreiung mit der Handkante in den Unterbauch schlagen', 'Jodan-Angriff mit der Unterarmrückseite (Haiwan) abwehren, dann Chudan ablenken'], ['Den Gegner werfen', 'Einen Fußtritt fangen'], '', P(45));
      L.mc('Hangetsu, Bewegung 11: Wie sind die Hände geformt?', ['Zeigefinger gestreckt, die anderen Finger leicht gebeugt und fest', 'Beide Hände zur Faust', 'Alle Finger gestreckt (Shuto)', 'Jishi-ippon-ken'], 'Laut Karate-Do Kyohan und Best Karate.', P(46));
      L.mc('Hangetsu, Bewegung 11: Wohin dreht man sich?', ['Links herum nach hinten (Ura-shomen)', 'Rechts herum zur Seite', 'Nach vorne (Shomen)', 'Gar nicht'], 'Schnell, Arme und Füße gleichzeitig, mit Kiai.', P(45));
      L.mc('Hangetsu, Bewegung 12 (Usho Tsukami): Welche Form hat die rechte Hand?', ['C-Form (Koko), Handrücken oben', 'Faust', 'Speerhand', 'Handballen nach vorne'], 'Das Handgelenk dreht nach innen.', P(46));
      L.mc('Hangetsu, Bewegung 12: Was bedeutet Tsukami?', ['Einen Chudan-Angriff mit Uchi-uke abwehren und sofort das Handgelenk des Gegners greifen', 'Den Gegner am Kragen ziehen', 'Ein Fußfeger', 'Ein Kopfstoß'], '', P(47));
      L.mc('Hangetsu, Bewegungen 12, 14 und 16: Was gilt für den Ellbogen?', ['Er wird durch Anspannen der Armunterseite zurückgezogen und verlässt die Körperlinie nicht', 'Er zeigt weit zur Seite', 'Er wird über die Schulter gehoben', 'Er schlägt nach hinten (Ushiro-enpi)'], '', P(46));
      L.mc('Wie nennt das Buch die schnelle Folge der Hangetsu-Bewegungen 18 und 19?', ['Ren-zuki', 'Sanbon-zuki', 'Morote-zuki', 'Kizami-zuki'], 'Ebenso 21–22 und 24–25.', P(49));
      L.mc('Hangetsu, Bewegung 20: Wie wechselt die Richtung?', ['Links herum, beide Füße gleiten gemeinsam (Hidari-e Yori-ashi)', 'Mit einem Sprung', 'Mit einem Kreuzschritt', 'Rechts herum auf dem linken Fuß'], 'Das rechte Bein trägt.', P(49));
      L.mc('Hangetsu, Bewegung 26: Wie bewegen sich linke Faust und linker Fuß?', ['Langsam in einem großen senkrechten Kreis, ohne Unterbrechung am rechten Knie', 'Schnell geradeaus', 'Erst der Fuß, dann nach einer Pause die Faust', 'In einem waagerechten Kreis am Boden'], 'Die Fußsohle kommt an die Innenseite des rechten Knies, das Knie zur Brust.', P(51));
      L.mc('Hangetsu, Bewegung 26: Welche Anwendung nennt Best Karate?', ['Das hintere Bein vor einem Kekomi zur Brust ziehen und beim Aufsetzen mit Uraken Jodan schlagen', 'Den Gegner mit dem Knie treffen', 'Einen Wurf vorbereiten', 'Einen Mae-geri abwehren'], 'Karate-Do Kyohan: mit dem Gefühl, die Hand des Gegners zu treffen.', P(51));
      L.mc('Hangetsu, Bewegung 27 (Migi Ashi-mae Kosa): Wie kreuzt der rechte Fuß?', ['Leise und langsam, Oberkörper und linke Faust bleiben', 'Schnell mit Stampfen', 'Mit Sprung', 'Hinter dem linken Fuß'], 'Karate-Do Kyohan: Die linke Faust wurde gegriffen – man folgt dem Zug.', P(52));
      L.mc('Hangetsu, Bewegung 28: Womit wird der Mae-geri ausgeführt?', ['Mit dem Fußballen (Koshi), vor der linken Faust', 'Mit der Ferse', 'Mit dem Fußrücken', 'Mit der Fußkante'], 'Karate-Do Kyohan: Tritt gegen die rechte Hand des Gegners und Befreiung des linken Arms.', P(52));
      L.mc('Hangetsu, Bewegung 31 (Jodan Age-uke): Wie weit ist das Handgelenk von der Stirn entfernt?', ['Etwa eine Faust', 'Eine Armlänge', 'Es liegt an der Stirn', 'Etwa drei Fäuste'], 'Die Hüfte dreht in Hanmi.', P(53));
      L.mc('Hangetsu, Bewegung 39: Wohin trifft der Mikazuki-geri?', ['In die Handfläche der linken Hand, die dabei nicht bewegt wird', 'An den Kopf des Gegners', 'Auf den Boden', 'In die rechte Faust'], '', P(56));
      L.mc('Hangetsu, Bewegung 40: Wo landet der Fuß nach dem Mikazuki-geri?', ['Hinten – der linke Fuß bleibt, es entsteht Hidari Ashi-mae Hangetsu-dachi', 'Vorne mit Stampfen', 'Neben dem linken Fuß (Heisoku-dachi)', 'Gar nicht, es folgt ein zweiter Tritt'], 'Karate-Do Kyohan: Der rechte Stoß trifft genau dort, wo vorher die linke Faust war.', P(57));
      L.mc('Hangetsu, Bewegung 41 (Teisho Awase-uke): Was wird abgewehrt?', ['Das Schienbein des tretenden Beins, unten', 'Ein Fauststoß zum Gesicht', 'Ein Griff von hinten', 'Ein Stock'], 'Handgelenke kräftig nach außen gebeugt, Arme gestreckt, als hielte man den Tritt.', P(57));
      L.mc('Hangetsu, Bewegung 41: Wohin kommt die Hüfte im Neko-ashi-dachi?', ['Über die rechte Ferse, Oberschenkelinnenseiten angespannt', 'Weit vor den linken Fuß', 'Zwischen beide Füße wie im Kiba-dachi', 'Hinter die rechte Ferse'], 'Die rechte Sohle bleibt fest am Boden, rechtes Knie und Fußgelenk gebeugt.', P(57));
    },
  };
})();
