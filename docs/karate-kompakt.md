# Register: Heft „Karate kompakt – Grundlagen im Überblick“

Quelle: Fiore Tartaglia, Illustrationen und Inhalte aus dem Buch „Die Karate-Essenz“ (Heft im Taschenformat, ft-karate.com), 78 Seiten.

**Urheberrecht:** Bilder, Layout und Wortlaut des Heftes bleiben beim Urheber und kommen nicht ins Repo – auch kein Scan oder PDF. Hier stehen nur **Fakten in eigenen Worten**, gegliedert nach den Seiten des Heftes, damit spätere Ergänzungen ohne das Heft möglich sind. Die Grafiken der App sind eigene Zeichnungen (SVG im Code); vom Heft übernommen ist nur die **Darstellungsidee** (siehe unten).

In der App gekennzeichnet als Quelle `SK.sources.kompakt`.

## Darstellungsideen (in der App eigenständig umgesetzt)

| Idee im Heft | Umsetzung in der App |
|---|---|
| Stand doppelt: Figur oben, Fußabdrücke von oben darunter, gestrichelte Bezugslinien, Kreis für die Körpermitte | Früher „Figur & Fußbild“ (SVG); heute 3D-Figur, als zweite Ansicht „Fußbild“: Füße von oben mit Gewichtsverteilung und ungefähren Maßen (`stanceSvg` in `js/graphics.js`) |
| Technik als ruhige Skizze mit einem roten, gestrichelten Bahnpfeil | Früher Bahnpfeile in den SVG-Technikgrafiken; heute zeigen die 3D-Figuren die Bahn (`eff` in `js/figur-posen.js`) |
| Fußbewegungen als Fußspuren mit Bahn und nummerierten Schritten | Neue Draufsicht-Grafiken mit Animation (`js/graphics-ashi.js`, Schlüssel `as:`) |
| Eine Technik pro Seite, ein Satz Erklärung | „Kompakt-Übersicht“ (`#/kompakt`): eine Karte je Lexikon-Eintrag, filterbar nach Gürtel, druckbar |

## Inhalt nach Seiten

### Stellungen / Dachi (S. 4–16)

| S. | Stand | Kernaussage (eigene Worte) |
|---|---|---|
| 4 | Einleitung | Stände sind das Fundament jeder Technik – wie bei einem Gebäude trägt ein schwaches Fundament nicht. |
| 5 | Musubi-dachi | Stand für den Gruß im Stehen (Ritsu-rei). |
| 6 | Hachiji-dachi | Vor und nach jeder Übung oder Kata, mit und ohne Partner. |
| 7 | Heisoku-dachi | In Kata oft zu einer langsamen Armbewegung, steht für eine Pause im Kampfgeschehen. |
| 8 | Renoji-dachi | „L-Stellung“, in mehreren Kata; zuerst in Heian Godan. |
| 9 | Zenkutsu-dachi | Vorwärtsstellung, der am meisten genutzte Stand im Shotokan. |
| 10 | Kokutsu-dachi | Vor allem für Abwehr, in manchen Kata auch mit Angriffen. |
| 11 | Kiba-dachi | Reiterstellung – wie der Sitz auf einem Pferd. |
| 12 | Fudo-dachi | „Unbewegte, feste Stellung“ – Basis für kraftvolle Techniken. |
| 13 | Hangetsu-dachi | Halbmondstellung: eine Fußlänge kürzer als Zenkutsu-dachi, seitlicher Abstand etwa schulterbreit. |
| 14 | Neko-ashi-dachi | Katzenfußstellung – Haltung einer Katze kurz vor dem Sprung. |
| 15 | Kosa-dachi | Überkreuzstellung, in mehreren Kata; auch für Anwendungen mit Körperdrehung. |
| 16 | Sanchin-dachi | „Sanduhr“: sehr kurz, Füße werden beim Gehen zur Mitte geführt. |

### Abwehrtechniken / Uke-waza (S. 17–28)

| S. | Technik | Kernaussage |
|---|---|---|
| 17 | Einleitung | Abwehr lenkt den Angriff schnell vom Ziel ab; besser „Verteidigungstechnik“. Ohne schnellen Konter unvollständig – außer bewusst aus taktischen Gründen. |
| 18 | Age-uke | Gegen Angriffe zum Kopf; häufig in Kata, zuerst in Heian Shodan. |
| 19 | Soto-uke | Schützt Chudan, Kreisbewegung von außen nach innen. |
| 20 | Uchi-uke | Chudan, von innen nach außen – Gegenrichtung zu Soto-uke. |
| 21 | Shuto-uke | Mit der Außenhandkante, wie Uchi-uke nach außen. |
| 22 | Gedan-barai | Unterer Bereich, von innen nach außen zur Seite. |
| 23 | Gedan-nagashi-uke | Begleitende Abwehr unten, Gegenrichtung zum Gedan-barai. |
| 24 | Morote-uke | Vor allem Chudan von innen nach außen, auch gegen Jodan. |
| 25 | Te-nagashi-uke | Offene Hand lenkt zur Seite; vor allem im Kampf, Jodan und Chudan. |
| 26 | Juji-uke | Jodan und Gedan, geschlossen oder offen (Kaishu). |
| 27 | Kakiwake-uke | Beide Hände von innen nach außen, vor allem gegen Würgen. |
| 28 | Manji-uke | Kombination aus Gedan-barai und Jodan-uchi-uke; oft in Kata, zuerst in Heian Godan. |

### Handtechniken / Te-waza (S. 29–52)

| S. | Technik | Kernaussage |
|---|---|---|
| 29 | Einleitung | Kraft aus dem Boden: hinterer Fuß drückt, Kraft läuft zur Körpermitte, Hüfte verstärkt, Rumpf und Hikite leiten zum Ziel – immer der ganze Körper. |
| 30 | Oi-zuki | Mit Schritt, Hand der Schrittseite – Ziel aus großer Entfernung. |
| 31 | Gyaku-zuki | Hand der Seite, deren Bein hinten steht. |
| 32 | Kizami-zuki | Vordere Hand, oft mit Gleitschritt (Suri-ashi) in die Distanz. |
| 33 | Age-zuki | Nach oben zum Kinn, auch als Abwehr gegen Jodan. |
| 34 | Mawashi-zuki | Kreisförmig, Ziele seitlich Chudan (Rippen) und Jodan (Schläfe). |
| 35 | Ura-zuki | Chudan oder Jodan; in Tekki in Kiba-dachi, in Meister-Kata oft. |
| 36 | Kagi-zuki | Aus der Hüfte im Bogen zur Gegenseite, meist Chudan. |
| 37 | Tate-zuki | Senkrechte Faust, kürzester gerader Weg. |
| 38 | Morote-zuki | Beide Fäuste aus der Hüfte gerade zum Ziel, meist Chudan. |
| 39 | Yama-zuki | Name nach dem Schriftzeichen „Berg“; trifft unteres Chudan und Jodan zugleich. |
| 40 | Awase-zuki | U-förmig, engere Form des Yama-zuki, Oberkörper aufrecht; Jodan und Chudan. |
| 41 | Hasami-zuki | Scherenstoß, im Grunde doppelter Mawashi-zuki; Jodan oder Chudan. |
| 42 | Uraken-uchi | Kraft aus dem Schnappen des Ellbogens, mehrere Formen. |
| 43 | Tettsui-uchi | Ebenfalls Schnappen des Ellbogens, mehrere Formen. |
| 44 | Shuto-uchi | Außenhandkante, von innen und von außen. |
| 45 | Haito-uchi | Innenhandkante, von innen und von außen. |
| 46 | Teisho-uchi | Handballen: gerade, schräg nach oben/unten, kreisförmig. |
| 47 | Mae-enpi-uchi | Ellbogen dicht am Körper, Faust über den Bauch zur anderen Seite. |
| 48 | Mawashi-enpi-uchi | Großer Bogen, ohne Kontakt zum Körper. |
| 49 | Age-enpi-uchi | Senkrecht nach oben, Faust neben dem Kopf. |
| 50 | Yoko-enpi-uchi | Bevorzugt in Kiba-dachi. |
| 51 | Otoshi-enpi-uchi | Senkrecht nach unten, in Fudo- oder Kiba-dachi. |
| 52 | Ushiro-enpi-uchi | Nach hinten, Jodan oder Chudan; mehrere Formen in Kata. |

### Fußtechniken / Keri-waza (S. 53–63)

| S. | Technik | Kernaussage |
|---|---|---|
| 53 | Einleitung | Andere Einsatzgebiete, Rhythmen und Distanzen als Handtechniken; ganzer Körper. |
| 54 | Mae-geri-keage | Schnappend, frontal, senkrechter Weg. |
| 55 | Mae-geri-kekomi | Mit Fußballen (Koshi) oder Ferse (Kakato); im Shotokan vor allem im Kampf. |
| 56 | Yoko-geri-keage | Kreisförmig von unten nach oben; Ziele Achsel, unteres Kinn. |
| 57 | Yoko-geri-kekomi | Geradlinig, alle drei Ebenen; Gedan = Fumikomi. |
| 58 | Mawashi-geri | Fußballen oder Spann (Haisoku), Drehung des ganzen Körpers. |
| 59 | Ushiro-geri | 180°-Drehung, anspruchsvoll und stark, Chudan/Jodan. |
| 60 | Ura-mawashi-geri | Gegenläufig zum Mawashi-geri, Sohle (Sokutei) oder Ferse. |
| 61 | Ushiro-mawashi-geri | Wie Ura-mawashi-geri, aus einer Drehung wie bei Ushiro-geri. |
| 62 | Mae-hiza-geri | Fuß und Zehen zum Schienbein, senkrecht von unten nach oben. |
| 63 | Mawashi-hiza-geri | Kreisförmig, diagonal oder waagerecht. |

### Fegetechniken / Nage-waza (S. 64–67)

| S. | Technik | Kernaussage |
|---|---|---|
| 64 | Einleitung | Fortgeschritten; Gegner kurz aus dem Gleichgewicht, Folgetechnik; psychologischer Vorteil. |
| 65 | Teisoku-ashi-barai | Mit der Fußsohle aus der Kamae, vorderer oder hinterer Fuß. |
| 66 | Haisoku-ashi-barai | Mit dem Spann, meist vorderer Fuß, wird vorbereitet. |
| 67 | Komura-ashi-barai | Mit der Wade, meist in einer Kombination. |

### Fußbewegungen / Ashi-sabaki (S. 68–78)

| S. | Bewegung | Kernaussage |
|---|---|---|
| 68 | Einleitung | Beweglichkeit muss geübt werden; falsche Distanz macht Abwehr unwirksam oder den Konter schwach. |
| 69 | Ayumi-ashi 1 | Füße kommen in der Schrittmitte zusammen; bei Ständen mit Breite folgt der hintere Fuß einem Bogen. |
| 70 | Ayumi-ashi 2 | Bei Ständen mit Füßen auf einer Linie gerade, ohne Bogen. |
| 71–72 | Tai-sabaki | Kreisförmige Drehungen zum Ausweichen, 45° bis 180°; hinterer Fuß versetzt, vorderer dreht am Platz. |
| 73 | Ashi-fumikae | Beinwechsel am Platz; vorwärts erst vorderer Fuß zurück, dann hinterer vor. |
| 74 | Okuri-suri-ashi | Zielnaher Fuß zuerst; vorwärts/seitlich/diagonal zieht der hintere nach, rückwärts der vordere. |
| 75 | Tsugi-suri-ashi | Größere Reichweite; vorwärts erst hinterer zum vorderen, dann vorderer gleitet; rückwärts erst der vordere. |
| 76 | Yori-suri-ashi | Beide gleiten gleichzeitig; kleine Distanzen, Rhythmuswechsel, Angriff verschleiern. |
| 77 | Yoko-sashi-ashi | Seitlicher Übersetzschritt (Ferse noch angehoben); Übergang zwischen Ständen oder zu Fußtechnik; im Kihon meist mit Yoko-geri, in Kata vor allem Tekki. |
| 78 | Shaho-sashi-ashi | Derselbe Schritt diagonal; gelegentlich in höheren Kata zum Richtungswechsel. |

## Wo das Wissen in der App steht

- **Lexikon**: neue Kategorien „Fußbewegungen (Ashi-sabaki)“ und „Fußfeger (Ashi-barai)“, neue Einträge zu Zuki, Enpi, Uke und Geri (`data/glossary.js`, Quelle `KO`).
- **Lernen**: Lektion „Fußbewegungen (Ashi-sabaki)“ (`da-ashi`), Ergänzungen in Stände, Tsuki, Uke, Uchi, Geri und „Grundprinzipien“ unter „Wichtige Konzepte“ (`data/units-general.js`).
- **Quiz**: Fragen mit Quelle `S.kompakt` in `data/questions-general.js`; Begriffe-Trainer erzeugt zu jedem neuen Lexikon-Eintrag automatisch Fragen.
- **Kompakt-Übersicht**: `#/kompakt[/<grad>]` in `js/app.js`.

Nicht geändert: Kata-Abläufe, Kata-Ansage und Bodenkarte (`data/kata-*.js`, `js/kata-ansage.js`). Hinweise des Heftes zu Kata (z. B. „zuerst in Heian …“) wurden **nicht** in die Kata-Daten übernommen, weil Kata-Inhalte nur aus dem JKA-Buch stammen.
