# Buch-Register: „Karate-Do Kata Vol. 1“ (JKA) – und Hangetsu aus Vol. 2

Nachschlagewerk zum Buch, damit Fragen ohne das PDF beantwortet werden können. Es enthält **Fakten, Seitenangaben und
Zusammenfassungen in eigenen Worten**, keine Abschriften: Formulierungen, Fotos und Gestaltung des Buches sind
urheberrechtlich geschützt und gehören nicht ins Repo. Für den genauen Wortlaut einer Stelle oder Details auf Fotos
braucht es weiterhin das PDF.

- **Ablauf je Kata** (Stand, Technik, Fußarbeit, Richtung): Tabellen unten, erzeugt aus den App-Daten
  (`data/kata-*.js`, Felder `seq` und `ansage`) mit `node tools/register-tabellen.js`. Bei Änderungen an den Kata-Daten
  das Skript erneut laufen lassen.
- **Fußstellungen als Koordinaten** (Lage, Zehenrichtung, Gewicht jedes Fußes nach den Fußskizzen des Buches):
  `ansage` in `data/kata-*.js`. Die Zuordnung je Bild steht in `tools/kata-pdf/spec/*.py`.
- **Fußskizzen unter den einzelnen Bewegungen** (Zehenrichtungen, Lage der Füße zueinander, Fußarbeit laut Text) und
  der Abgleich mit der Kata-Ansage der App: `docs/fussskizzen.md`.
- **Begriffe** mit Buchseite: `data/glossary.js`.
- **Fragen** zum Buch: `data/kata-*.js` (Feld `questions`), jeweils mit gedruckter Buchseite (`SK.bookSrc`).

## Seitenzählung

Das PDF hat 176 Scan-Seiten. Ab Scan-Seite 6 zeigt jede eine gedruckte Doppelseite:
**Scan-Seite n = Buchseiten 2·(n−5) und 2·(n−5)+1** (z. B. Scan 39 = S. 68–69). In der App rechnet das
`SK.bookPages(n)` um. Scan 1–2: Titel, 3: Vorwort, 4: „Content and Guidance“ (S. ii–iii), 5: Inhaltsverzeichnis.

Technischer Hinweis: Im PDF liegt jedes Scan-Bild verschoben auf der Seite, beim normalen Anzeigen fehlt ein großer
Teil. Die Werkzeuge in `tools/kata-pdf/` lesen deshalb die eingebetteten Bilder direkt (`scans.py`).

| Kapitel | Buchseiten | Scan-Seiten | Fußskizze (Scan) |
|---|---|---|---|
| Vorwort (Foreword) | i | 3 | – |
| Content and Guidance | ii–iii | 4 | – |
| Heian Shodan | 2–23 | 6–16 | 16 |
| Heian Nidan | 24–49 | 17–29 | 29 |
| Heian Sandan | 50–69 | 30–39 | 39 |
| Heian Yondan | 70–97 | 40–53 | 53 |
| Heian Godan | 98–122 | 54–66 | 65–66 |
| Tekki Shodan | 123–147 | 66–78 | 77–78 |
| Bassai Dai | 148–191 | 79–100 | 99–100 |
| Kanku Dai | 192–254 | 101–132 | 130–132 |
| Jion | 255–301 | 132–155 | 154–155 |
| Enpi | 302–338 | 156–174 | 173–174 |
| Anhang (Trefferzonen) | 339 | 174 | – |
| Nachwort, Übersetzerhinweis | 340–341 | 175 | – |
| Impressum | – | 176 | – |

## Allgemeine Kapitel

### Vorwort (Scan 3)
- Vom JKA-Shihan-Kai (Vorsitz Motokuni Sugiura), datiert August 1994.
- Anlass: Nach „Karate-Do Kyohan“ und „Best Karate“ gab es viele unterschiedliche Auslegungen der 15 Shotokan-Kata; die
  Kata sollten einheitlich festgelegt werden. Die Arbeit begann im April 1993 bei den Instruktoren der JKA-Zentrale,
  der Shihan-Kai genehmigte das Ergebnis im September 1993.
- Die japanische Reihe umfasst fünf Bände mit allen JKA-Kata; sie ist offizielles Lehrbuch des Shihan-Kai und Grundlage
  für die Bewertung bei Kata-Wettkämpfen in Japan.
- Die englische Ausgabe „Volume 1“ fasst die japanischen Bände 1 und 2 zusammen: Heian Shodan bis Godan, Tekki Shodan,
  Bassai Dai, Kanku Dai, Jion, Enpi. Sie sollte ab dem Shoto Cup 2003 für Kata-Wettkämpfe gelten.
- Zielgruppe: Wettkämpfer, Kampfrichter, Trainer und Prüflinge bei Kyu- und Dan-Prüfungen.

### Content and Guidance (Scan 4, S. ii–iii)
1. **Verglichene Quellen:** Karate-Do Kyohan (Funakoshi, 1941, und die Übersetzung von Tsutomu Ohshima, 1973),
   „Karate Kata Heian 1–5, Tekki 1“ (Nakayama, 1968–70), Best Karate (Nakayama, 1977), Karate-Do Shusei
   (Karateklub der Keio-Universität, 1936), Rentan Goshin Karate-Jutsu (Funakoshi, 1925).
2. Ziel des Karate ist **Kime**; es entsteht nur durch intensives Üben.
3. Eine Kata besteht aus Techniken, Ständen, **Enbusen** (Ablauflinie), Bewegungszahl und drei Kernelementen:
   **Krafteinsatz, Zusammenziehen und Strecken des Körpers, Tempowechsel**. Eine Kata endet am Ausgangspunkt, und am
   Ende kommen alle Körperteile im selben Augenblick zur Ruhe.
4. Nach jeder Bewegung folgt eine Fußskizze, am Ende jeder Kata eine Übersicht aller Fußstellungen und des Enbusen.
5. **Begriffe:**
   - *Tsuki / Uchi:* bei Tsuki wirkt die Kraft in Richtung des gestreckten Unterarms, bei Uchi im rechten Winkel dazu.
   - *Enpi* = jede Ellbogentechnik. Zu Tsuki gehören Yoko-, Ushiro- und Otoshi-enpi, zu Uchi Tate-, Mae-, Mawashi- und
     Furi-enpi.
   - *Keage / Kekomi:* bei Kekomi wird der Unterschenkel gestreckt, bei Keage arbeitet er im rechten Winkel.
   - *Oi-zuki / Gyaku-zuki:* bei Oi-zuki sind Schlaghand und vorderer Fuß auf derselben Seite, bei Gyaku-zuki auf
     entgegengesetzten Seiten.
   - *Uchi-uke / Soto-uke:* Uchi-uke blockt mit der Außenseite des Unterarms von innen nach außen, Soto-uke mit der
     Innenseite von außen nach innen.
   - *Ashi-zenkutsu* ist kürzer und schmaler als Zenkutsu-dachi (Beispiel: Heian Nidan 16 und 19). Bei *Hizakutsu*
     geht die Technik in eine andere Richtung als beim Zenkutsu-dachi (Beispiel: Heian Yondan 11).
6. Am Ende des Buches steht ein Körperschema mit den Trefferzonen Jodan, Chudan, Gedan.
7. Oi-zuki heißt auch **Jun-zuki**.

### Anhang: Trefferzonen (Scan 174, S. 339)
Körperschema mit Zonen und Fachwörtern:
- **Jodan (Gesichtshöhe):** Schläfe (Kasumi, Komekami), Bereich zwischen Oberlippe und Nase (Jinchu, Bika), Kinn
  (Mikazuki, Shita-ago).
- **Chudan (Brusthöhe):** Solarplexus (Suigetsu, Mizo-ochi), freie Rippen (Denko), Bereich unter den freien Rippen
  (Inazuma), zusammen Hibara.
- **Gedan (Unterbauch):** Bereich direkt unter dem Nabel (Myojo, Heso-no-shita).
- **Arm und Hand:** Oberarm (Jowan), Ellbogen (Hiji), Unterarm (Zenwan), Handfläche (Tesho, Shusho), Handrücken
  (Shuhai, Teko).
- **Bein (Jyoshi, Kashi):** Oberschenkel (Daitai), Knie (Hiza), Wade (Katai), Fußrücken (Sokuhai, Sokko),
  Fußsohle (Sokutei).

### Nachwort, Übersetzerhinweis, Impressum (Scan 175–176)
- Nachwort: Kata lassen sich mit Worten allein schwer beschreiben; das Buch versteht sich als Leitfaden und Grundlage.
  Mitglieder des Komitees: Hiroshi Shoji, Masaaki Ueki, Masahiko Tanaka, Takeshi Oishi, Norihiko Ida,
  Yoshiharu Osaka.
- Übersetzer: Sotaro Tanaka und Kinta Saeki.
- Erschienen im Februar 2003, © Japan Karate Association, herausgegeben vom JKA-Shihan-Kai (Tokio), betreut von
  Motokuni Sugiura.

## Die Kata

Richtungen in den Tabellen: „vorne“ = Shomen (Blickrichtung bei Yoi), „Start“ = Ura-shomen (Rückseite), „links“ und
„rechts“ von Yoi aus gesehen. Die Richtung bezeichnet die Körper- bzw. Angriffsrichtung am Ende der Bewegung.
Die Spalte „Scan-S.“ nennt die Scan-Seite mit dem Buchtext zur Bewegung.

### Heian Shodan (S. 2–23, Scan 6–16)
- 21 Bewegungen, Kiai bei 9 und 17. Yoi: Hachiji-dachi. Enbusen-Skizze: I-Form (Grundlinie, Mittellinie, obere
  Querlinie), Scan 16.
- Hinweise im Buch:
  - 4 (Scan 7): Der halbe Schritt zurück mit gleichzeitigem Eindrehen des Handgelenks löst sich aus einem Griff am
    Handgelenk.
  - 7 (Scan 8): Sinn: Jodan-Schlag mit dem linken Handgelenk abwehren, Handgelenk greifen und verdrehen, mit dem rechten
    Unterarm gegen den Ellbogen.
  - 17 (Scan 12, nach Kyohan): Bei drei gleichen Bewegungen sollen die erste und die letzte stärker sein als die
    mittlere – Bewegung 17 also kräftiger und mit etwas breiterem Stand als 15 und 16.
  - 18 (Scan 13): Aufbau der Shuto-Hand (vier gestreckte Finger, gebeugter Daumen, Handgelenk gerade); Suigetsu =
    Solarplexus. Im Kokutsu-dachi zeigt der Körper nach vorne, nur der Kopf dreht zur Seite; Gewicht hinten, der vordere
    Fuß berührt den Boden nur leicht.

<!-- ablauf:heian-shodan -->
| Nr | Stand | Technik | Fußarbeit | Richtung | Scan-S. |
|---|---|---|---|---|---|
| 1 | Hidari Zenkutsu-dachi | Hidari Sokumen Hidari Gedan-barai | Blick nach links, linker Fuß gleitet nach links | links, Wendung ¼ links herum | 6 |
| 2 | Migi Zenkutsu-dachi | Migi Chudan Oi-zuki | Rechter Fuß gleitet vor | links | 6 |
| 3 | Migi Zenkutsu-dachi | Migi Gedan-barai | Rechter Fuß gleitet zurück, Wendung rechts herum | rechts, Wendung ½ rechts herum | 7 |
| 4 | Migi Zenkutsu-dachi | Migi Kentsui Tate-mawashi-uchi | Rechter Fuß zieht einen halben Schritt heran und geht wieder vor | rechts | 7 |
| 5 | Hidari Zenkutsu-dachi | Hidari Chudan Oi-zuki | Linker Fuß gleitet vor | rechts | 7 |
| 6 | Hidari Zenkutsu-dachi | Hidari Gedan-barai | Linker Fuß gleitet nach links auf die Mittellinie, Blick nach vorne | vorne, Wendung ¼ links herum | 8 |
| 7 | Migi Zenkutsu-dachi | Migi Jodan Age-uke | Rechter Fuß gleitet vor | vorne | 8 |
| 8 | Hidari Zenkutsu-dachi | Hidari Jodan Age-uke | Linker Fuß gleitet vor | vorne | 9 |
| 9 | Migi Zenkutsu-dachi | Migi Jodan Age-uke – **Kiai** | Rechter Fuß gleitet vor – Kiai | vorne | 9 |
| 10 | Hidari Zenkutsu-dachi | Hidari Gedan-barai | Rechtes Bein trägt, linker Fuß schwingt nach rechts, ¾ Drehung links herum | rechts, Wendung ¾ links herum | 10 |
| 11 | Migi Zenkutsu-dachi | Migi Chudan Oi-zuki | Rechter Fuß gleitet vor | rechts | 10 |
| 12 | Migi Zenkutsu-dachi | Migi Gedan-barai | Rechter Fuß gleitet zurück, Wendung rechts herum | links, Wendung ½ rechts herum | 10 |
| 13 | Hidari Zenkutsu-dachi | Hidari Chudan Oi-zuki | Linker Fuß gleitet vor | links | 11 |
| 14 | Hidari Zenkutsu-dachi | Hidari Gedan-barai | Linker Fuß gleitet auf die Mittellinie, Blick zum Start | Start, Wendung ¼ links herum | 11 |
| 15 | Migi Zenkutsu-dachi | Migi Chudan Oi-zuki | Rechter Fuß gleitet vor | Start | 11 |
| 16 | Hidari Zenkutsu-dachi | Hidari Chudan Oi-zuki | Linker Fuß gleitet vor | Start | 12 |
| 17 | Migi Zenkutsu-dachi | Migi Chudan Oi-zuki – **Kiai** | Rechter Fuß gleitet vor – Kiai | Start | 12 |
| 18 | Migi Kokutsu-dachi | Hidari Shuto Chudan-uke | Rechtes Knie bleibt gebeugt, linker Fuß schwingt nach links, ¾ Drehung links herum | links, Wendung ¾ links herum | 13 |
| 19 | Hidari Kokutsu-dachi | Migi Shuto Chudan-uke | Rechter Fuß gleitet schräg nach vorne links | links vorne, Wendung ⅛ rechts herum | 14 |
| 20 | Hidari Kokutsu-dachi | Migi Shuto Chudan-uke | Linkes Knie bleibt gebeugt, rechter Fuß schwingt nach rechts, Drehung rechts herum | rechts, Wendung ⅜ rechts herum | 14 |
| 21 | Migi Kokutsu-dachi | Hidari Shuto Chudan-uke | Linker Fuß gleitet schräg nach vorne rechts | rechts vorne, Wendung ⅛ links herum | 15 |
<!-- /ablauf -->

### Heian Nidan (S. 24–49, Scan 17–29)
- 26 Bewegungen, Kiai bei 11 und 26. Yoi: Hachiji-dachi. Enbusen: I-Form, Scan 29.
- Hinweise im Buch:
  - 1–6 (Scan 17–19): Sinn der Haiwan-Abwehr (Jodan-Schlag seitlich mit dem Unterarmrücken abwehren), dann Soto-nagashi-uke
    mit gleichzeitigem Kentsui gegen den Ellbogen, danach Abwehr und Chudan-zuki. 2–3 und 5–6 jeweils schnell
    hintereinander.
  - 7 (Scan 19, nach Best Karate): hinteren Fuß zur Körpermitte ziehen, Achse Kopf–Hüfte–Standbein bilden, Hüfte drehen,
    Trittfuß an die Innenseite des Knies; nach dem Tritt bleibt die Faust, der Fuß kehrt schnell ans Knie zurück.
  - 11 (Scan 21): Shihon-nukite heißt auch Tate-nukite; der linke Unterarm drückt das Handgelenk eines Chudan-Angriffs
    nach unten (Osae-uke).
  - 17–18 und 20–21 (Scan 25–26): jeweils fließend.

<!-- ablauf:heian-nidan -->
| Nr | Stand | Technik | Fußarbeit | Richtung | Scan-S. |
|---|---|---|---|---|---|
| 1 | Migi Kokutsu-dachi | Hidari Haiwan Hidari Sokumen Jodan Yoko-uke | Blick nach links, linker Fuß gleitet nach links | links, Wendung ¼ links herum | 17 |
| 2 | Migi Kokutsu-dachi | Hidari Jodan Soto-nagashi-uke + Migi Kentsui Soto-mawashi-uchi – fließend weiter | Stand bleibt, nur die Arme wechseln | links | 17 |
| 3 | Migi Kokutsu-dachi | Saken Hidari Sokumen Chudan-zuki | Stand bleibt | links | 18 |
| 4 | Hidari Kokutsu-dachi | Migi Haiwan Migi Sokumen Jodan Yoko-uke | Füße bleiben am Platz: Blick nach rechts, Gewicht aufs linke Bein, beide Füße drehen im Uhrzeigersinn | rechts, Wendung ½ rechts herum | 18 |
| 5 | Hidari Kokutsu-dachi | Migi Jodan Soto-nagashi-uke + Hidari Kentsui Soto-mawashi-uchi – fließend weiter | Stand bleibt, nur die Arme wechseln | rechts | 18 |
| 6 | Hidari Kokutsu-dachi | Uken Migi Sokumen Chudan-zuki | Stand bleibt | rechts | 19 |
| 7 | Hidari Ashi-dachi | Migi Uraken Jodan Yoko-mawashi-uchi + Migi Yoko-geri-keage | Linker Fuß rückt einen halben Schritt heran unter den Körper, beide Füße zeigen nach rechts, Blick zum Start; rechter Fuß tritt Yoko-geri-keage zur rechten Seite (Richtung Start) | rechts, Blick Start | 19 |
| 8 | Migi Kokutsu-dachi | Hidari Shuto Chudan-uke | Blick nach links zur Vorderseite, rechter Fuß setzt hinten ab, linker Fuß vorne auf der Mittellinie | vorne, Wendung ¼ links herum | 20 |
| 9 | Hidari Kokutsu-dachi | Migi Shuto Chudan-uke | Rechter Fuß gleitet vor | vorne | 20 |
| 10 | Migi Kokutsu-dachi | Hidari Shuto Chudan-uke | Linker Fuß gleitet vor | vorne | 21 |
| 11 | Migi Zenkutsu-dachi | Sasho Chudan Osae-uke + Migi Chudan Shihon-nukite – **Kiai** | Hüfte nach vorne, rechter Fuß gleitet vor – Kiai | vorne | 21 |
| 12 | Migi Kokutsu-dachi | Hidari Shuto Chudan-uke | Rechtes Knie bleibt gebeugt, linker Fuß schwingt nach rechts, ¾ Drehung links herum | rechts, Wendung ¾ links herum | 22 |
| 13 | Hidari Kokutsu-dachi | Migi Shuto Chudan-uke | Rechter Fuß gleitet schräg nach vorne rechts (Richtung Start) | rechts hinten, Wendung ⅛ rechts herum | 22 |
| 14 | Hidari Kokutsu-dachi | Migi Shuto Chudan-uke | Linkes Knie bleibt gebeugt, rechter Fuß schwingt nach links, Drehung rechts herum | links, Wendung ⅜ rechts herum | 23 |
| 15 | Migi Kokutsu-dachi | Hidari Shuto Chudan-uke | Linker Fuß gleitet schräg nach vorne links (Richtung Start) | links hinten, Wendung ⅛ links herum | 23 |
| 16 | Hidari Ashi-zenkutsu | Migi Chudan Uchi-uke (Gyaku-hanmi) | Rechtes Bein trägt, linker Fuß rückt nach links auf die Mittellinie – Gyaku-hanmi Richtung Start | Start, Wendung ⅛ links herum | 24 |
| 17 | Hidari Ashi-dachi | Migi Chudan Mae-geri-keage – fließend weiter | Gewicht aufs linke Bein, rechtes Knie hoch, Mae-geri-keage | Start | 24 |
| 18 | Migi Zenkutsu-dachi | Saken Chudan-zuki | Rechter Fuß setzt nach dem Tritt vorne ab | Start | 25 |
| 19 | Migi Ashi-zenkutsu | Hidari Chudan Uchi-uke (Gyaku-hanmi) | Rechter Fuß gleitet etwas zurück – kürzerer Migi-ashi-zenkutsu (Gyaku-hanmi), die Arme wechseln | Start | 25 |
| 20 | Migi Ashi-dachi | Hidari Chudan Mae-geri-keage – fließend weiter | Gewicht aufs rechte Bein, linkes Knie hoch, Mae-geri-keage | Start | 25 |
| 21 | Hidari Zenkutsu-dachi | Uken Chudan-zuki | Linker Fuß setzt nach dem Tritt vorne ab | Start | 26 |
| 22 | Migi Zenkutsu-dachi | Migi Chudan Morote-uke | Rechter Fuß gleitet vor | Start | 26 |
| 23 | Hidari Zenkutsu-dachi | Hidari Gedan-barai | Rechtes Knie bleibt gebeugt, linker Fuß schwingt nach links, ¾ Drehung links herum | links, Wendung ¾ links herum | 27 |
| 24 | Migi Zenkutsu-dachi | Migi Jodan Age-uke | Rechter Fuß gleitet schräg nach vorne links | links vorne, Wendung ⅛ rechts herum | 27 |
| 25 | Migi Zenkutsu-dachi | Migi Gedan-barai | Linkes Bein trägt, rechter Fuß gleitet nach rechts, Drehung rechts herum | rechts, Wendung ⅜ rechts herum | 27 |
| 26 | Hidari Zenkutsu-dachi | Hidari Jodan Age-uke – **Kiai** | Linker Fuß gleitet schräg nach vorne rechts – Kiai | rechts vorne, Wendung ⅛ links herum | 28 |
<!-- /ablauf -->

### Heian Sandan (S. 50–69, Scan 30–39)
- 20 Bewegungen, Kiai bei 10 und 20. Yoi: Hachiji-dachi. Enbusen: T-Form, Scan 39.
- Hinweise im Buch:
  - 2–3, 5–6, 9–10 (Scan 31–34): jeweils fließend.
  - 8 (Scan 33): Shihon-nukite = Tate-nukite; Osae-uke wie in Nidan 11.
  - 9 (Scan 33): Arm eindrehen, als würde er gegriffen und verdreht.
  - 11 (Scan 34): Kopf, Hände und Füße bewegen sich gemeinsam und langsam.
  - 12 (Scan 35, nach Kyohan/Best Karate): Das Stampfen soll den Oberschenkel des Gegners treffen, der Ellbogen zugleich
    den Solarplexus; auch als Abwehr eines Fußangriffs mit dem Ellbogen (Taisoku-uke) deutbar.
  - 13 (Scan 35): Uraken trifft Jinchu (zwischen Nase und Oberlippe); Ellbogen leicht gebeugt, Faust in Schulterhöhe.
  - 18 (Scan 37): rechte Hand öffnen, als würde man den Gegner greifen und heranziehen.
  - 20 (Scan 38, nach Kyohan): Yori-ashi – linker Fuß spannt und stößt ab, beide Füße gleiten nach rechts, der Stand
    bleibt; Migi-e = nach rechts.

<!-- ablauf:heian-sandan -->
| Nr | Stand | Technik | Fußarbeit | Richtung | Scan-S. |
|---|---|---|---|---|---|
| 1 | Migi Kokutsu-dachi | Hidari Sokumen Hidari Chudan Uchi-uke | Blick nach links, linker Fuß tritt nach links | links, Wendung ¼ links herum | 30 |
| 2 | Heisoku-dachi | Migi Chudan Uchi-uke + Hidari Gedan-uke – fließend weiter | Rechter Fuß wird zum linken herangezogen | links | 30 |
| 3 | Heisoku-dachi | Hidari Chudan Uchi-uke + Migi Gedan-uke | Füße bleiben stehen, nur die Arme wechseln | links | 31 |
| 4 | Hidari Kokutsu-dachi | Migi Chudan Uchi-uke | Linkes Bein trägt, linker Fuß dreht auf der Stelle nach vorne, rechter Fuß tritt nach rechts | rechts, Wendung ½ rechts herum | 31 |
| 5 | Heisoku-dachi | Hidari Chudan Uchi-uke + Migi Gedan-uke – fließend weiter | Linker Fuß wird zum rechten herangezogen | rechts | 31 |
| 6 | Heisoku-dachi | Migi Chudan Uchi-uke + Hidari Gedan-uke | Füße bleiben stehen, nur die Arme wechseln | rechts | 32 |
| 7 | Migi Kokutsu-dachi | Hidari Chudan Morote-uke | Linker Fuß tritt nach vorne, rechter Fuß bleibt quer stehen | vorne, Wendung ¼ links herum | 32 |
| 8 | Migi Zenkutsu-dachi | Sasho Chudan Osae-uke + Migi Chudan Shihon-nukite | Rechter Fuß tritt vor | vorne | 33 |
| 9 | Kiba-dachi | Hidari Kentsui Chudan Uchi-mawashi-uchi – fließend weiter | Linker Fuß tritt vor, Drehung mit dem Rücken nach vorne in Kiba-dachi – Blick nach vorne | rechts, Blick vorne, Wendung ¾ links herum | 33 |
| 10 | Migi Zenkutsu-dachi | Migi Chudan Oi-zuki – **Kiai** | Rechter Fuß tritt vor, Körper wieder nach vorne | vorne, Wendung ¼ links herum | 34 |
| 11 | Heisoku-dachi | Ryoken Ryokoshi-kamae – langsam | Langsam: linker Fuß zum rechten, Blick zum Start | Start, Wendung ½ links herum | 34 |
| 12 | Kiba-dachi | Migi Furi-enpi (Migi Ashi Fumikomi) | Rechtes Knie hoch, Fumikomi Richtung Start | rechts, Blick Start, Wendung ¼ links herum | 35 |
| 13 | Kiba-dachi | Migi Uraken Migi Sokumen Tate-mawashi-uchi | Füße bleiben stehen | rechts, Blick Start | 35 |
| 14 | Kiba-dachi | Hidari Furi-enpi (Hidari Ashi Fumikomi) | Linkes Knie hoch, Fumikomi Richtung Start | links, Blick Start, Wendung ½ rechts herum | 36 |
| 15 | Kiba-dachi | Hidari Uraken Hidari Sokumen Tate-mawashi-uchi | Füße bleiben stehen | links, Blick Start | 36 |
| 16 | Kiba-dachi | Migi Furi-enpi (Migi Ashi Fumikomi) | Rechtes Knie hoch, Fumikomi Richtung Start | rechts, Blick Start, Wendung ½ links herum | 36 |
| 17 | Kiba-dachi | Migi Uraken Migi Sokumen Tate-mawashi-uchi | Füße bleiben stehen | rechts, Blick Start | 36 |
| 18 | Hidari Zenkutsu-dachi | Hidari Chudan Oi-zuki | Linker Fuß tritt Richtung Start vor – über die Grundlinie hinaus | Start, Wendung ¼ rechts herum | 37 |
| 19 | Kiba-dachi | Uken Hidari Kata-ue Koho-tsukiage + Hidari Ushiro-enpi | Rechter Fuß tritt neben den linken, linker Fuß gleitet nach links – Kiba-dachi zur Vorderseite | vorne, Wendung ½ links herum | 37 |
| 20 | Kiba-dachi | Saken Migi Kata-ue Koho-tsukiage + Migi Ushiro-enpi (Migi-e Yori-ashi) – **Kiai** | Yori-ashi nach rechts: beide Füße gleiten, der Stand bleibt | vorne | 38 |
<!-- /ablauf -->

### Heian Yondan (S. 70–97, Scan 40–53)
- 27 Bewegungen, Kiai bei 13 und 25. Yoi: Hachiji-dachi. Enbusen: I-Form, Scan 53.
- Hinweise im Buch:
  - 1–2 (Scan 40–41): Hände und Füße bewegen sich von Anfang bis Ende gemeinsam und langsam.
  - 3 (Scan 41): Gedan-kosa-uke stoppt das Schienbein eines Trittes nahe dem Knöchel, sobald der Tritt beginnt
    (in Best Karate: Ryoken-gedan-juji-uke).
  - 5–7 und 8–10 (Scan 43–44): jeweils schnell und fließend; Sasho-ni / Usho-ni = Ellbogen schlägt in die linke bzw.
    rechte Handfläche; die Hand greift und zieht den Gegner heran.
  - 13 (Scan 45): linke Hand greift und zieht zur Hüfte; nach Best Karate anderthalb Sprungschritte nach vorne.
  - 14 und 18 (Scan 46, 48): langsam, kraftvoll, mit dynamischer Spannung; die Arme kreuzen (rechts oben) und ziehen
    sofort auseinander.
  - 16–17 und 20–21 (Scan 47, 49): zwei Fauststöße schnell hintereinander; das Buch nennt diese Folge Ren-zuki
    (erste Stelle im Buch).
  - 25 (Scan 51): vom Kokutsu-dachi in 24 direkt zum Herunterziehen des Kopfes – nicht im Zenkutsu-dachi anhalten, wenn
    die Hände vor das Gesicht gehen; die Fäuste greifen den Hinterkopf des Gegners.

<!-- ablauf:heian-yondan -->
| Nr | Stand | Technik | Fußarbeit | Richtung | Scan-S. |
|---|---|---|---|---|---|
| 1 | Migi Kokutsu-dachi | Hidari Haiwan Hidari Sokumen Jodan Yoko-uke (mit offenen Händen, langsam) – langsam | Langsam: linker Fuß gleitet nach links | links, Wendung ¼ links herum | 40 |
| 2 | Hidari Kokutsu-dachi | Migi Haiwan Migi Sokumen Jodan Yoko-uke (mit offenen Händen, langsam) – langsam | Langsam: Füße bleiben am Platz, Blick nach rechts, Gewicht aufs linke Bein, Füße drehen im Uhrzeigersinn | rechts, Wendung ½ rechts herum | 41 |
| 3 | Hidari Zenkutsu-dachi | Gedan Kosa-uke | Rechtes Bein trägt, linker Fuß gleitet nach vorne auf die Mittellinie | vorne, Wendung ¼ links herum | 41 |
| 4 | Hidari Kokutsu-dachi | Migi Chudan Morote-uke | Rechter Fuß gleitet vor | vorne | 42 |
| 5 | Migi Ashi-dachi | Ryoken Migi Koshi-kamae – fließend weiter | Blick nach links, Gewicht aufs rechte Bein, linke Fußsohle an das rechte Knie | vorne, Blick links | 42 |
| 6 | Migi Ashi-dachi | Hidari Uraken Jodan Yoko-mawashi-uchi + Hidari Yoko-geri-keage – fließend weiter | Stand bleibt: Yoko-geri-keage nach links | vorne, Blick links | 43 |
| 7 | Hidari Zenkutsu-dachi | Sasho-ni Migi Mae-enpi | Linker Fuß setzt nach links ab | links, Wendung ¼ links herum | 43 |
| 8 | Hidari Ashi-dachi | Ryoken Hidari Koshi-kamae – fließend weiter | Blick nach rechts, linker Fuß rückt einen halben Schritt heran, rechte Fußsohle an das linke Knie | vorne, Blick rechts, Wendung ¼ rechts herum | 43 |
| 9 | Hidari Ashi-dachi | Migi Uraken Jodan Yoko-mawashi-uchi + Migi Yoko-geri-keage – fließend weiter | Stand bleibt: Yoko-geri-keage nach rechts | vorne, Blick rechts | 44 |
| 10 | Migi Zenkutsu-dachi | Usho-ni Hidari Mae-enpi | Rechter Fuß setzt nach rechts ab | rechts, Wendung ¼ rechts herum | 44 |
| 11 | Hidari Hizakutsu | Sasho Jodan-uke + Migi Shuto Jodan Soto-mawashi-uchi (zuvor Hidari Shuto Gedan-barai) | Füße bleiben am Platz, Hüfte und Blick nach vorne | vorne, Wendung ¼ links herum | 44 |
| 12 | Hidari Ashi-dachi | Migi Jodan Mae-geri-keage | Hüfte über den linken Fuß, rechtes Knie hoch, Mae-geri-keage nach vorne | vorne | 45 |
| 13 | Migi Ashi-mae Kosa-dachi | Migi Uraken Tate-mawashi-uchi – **Kiai** | Sprungschritt nach vorne: rechter Fuß landet und trägt, linker Fuß steht gekreuzt dahinter auf dem Ballen – Kiai | vorne | 45 |
| 14 | Migi Kokutsu-dachi | Ryoken Chudan Kakiwake-uke – langsam | Rechtes Bein trägt, linker Fuß gleitet von hinten schräg nach rechts hinten, Drehung links herum | rechts hinten, Wendung ⅝ links herum | 46 |
| 15 | Hidari Ashi-dachi | Migi Jodan Mae-geri-keage | Hüfte über den linken Fuß, rechtes Knie hoch, Mae-geri-keage | rechts hinten | 46 |
| 16 | Migi Zenkutsu-dachi | Uken Chudan-zuki – fließend weiter | Rechter Fuß setzt nach dem Tritt vorne ab | rechts hinten | 47 |
| 17 | Migi Zenkutsu-dachi | Saken Chudan-zuki (Ren-zuki) | Stand bleibt | rechts hinten | 47 |
| 18 | Hidari Kokutsu-dachi | Ryoken Chudan Kakiwake-uke – langsam | Linkes Bein trägt, rechter Fuß gleitet schräg nach links hinten | links hinten, Wendung ¼ rechts herum | 48 |
| 19 | Migi Ashi-dachi | Hidari Jodan Mae-geri-keage | Hüfte über den rechten Fuß, linkes Knie hoch, Mae-geri-keage | links hinten | 48 |
| 20 | Hidari Zenkutsu-dachi | Saken Chudan-zuki – fließend weiter | Linker Fuß setzt nach dem Tritt vorne ab | links hinten | 49 |
| 21 | Hidari Zenkutsu-dachi | Uken Chudan-zuki (Ren-zuki) | Stand bleibt | links hinten | 49 |
| 22 | Migi Kokutsu-dachi | Hidari Chudan Morote-uke | Rechtes Bein trägt, linker Fuß rückt nach links auf die Mittellinie, Blick zum Start | Start, Wendung ⅛ links herum | 49 |
| 23 | Hidari Kokutsu-dachi | Migi Chudan Morote-uke | Rechter Fuß gleitet vor | Start | 50 |
| 24 | Migi Kokutsu-dachi | Hidari Chudan Morote-uke | Linker Fuß gleitet vor | Start | 50 |
| 25 | Hidari Ashi-dachi | Migi Hiza-tsuchi (Ryoken Migi Hiza-ryogawa) – **Kiai** | Linkes Bein trägt, rechtes Knie hoch, beide Fäuste kommen neben dem Knie herunter – Kiai | Start | 51 |
| 26 | Migi Kokutsu-dachi | Hidari Shuto Chudan-uke | Wendung links herum zur Vorderseite, rechter Fuß setzt hinten ab | vorne, Wendung ½ links herum | 51 |
| 27 | Hidari Kokutsu-dachi | Migi Shuto Chudan-uke | Rechter Fuß gleitet vor | vorne | 52 |
<!-- /ablauf -->

### Heian Godan (S. 98–122, Scan 54–66)
- 23 Bewegungen, Kiai bei 12 und 19. Yoi: Hachiji-dachi. Enbusen: T-Form, Scan 65–66.
- Hinweise im Buch:
  - 1–2, 4–5 (Scan 54–55): jeweils schnell und fließend. 3 und 6 (Scan 55–56): Kopf, Hände und Füße gemeinsam, langsam.
  - 8–9 (Scan 57): Gedan-kosa-uke stoppt den Tritt am Schienbein; schnell und fließend; der vordere Fuß darf etwas
    zurückgezogen werden. Jodan-kosa-uke (9) gegen einen rechten Jodan-Schlag (Best Karate: Ryosho-jodan-juji-uke);
    Osae-uke (10) gegen einen linken Chudan-Schlag.
  - 11 (Scan 58): Saken-chudan-zuki geht auch als Abwehr und Stoß mit demselben Arm (Uke-zuki); 11–12 schnell, wie eine
    einzige Ausführung.
  - 13 (Scan 59): Richtungswechsel schnell, Hüfte bleibt beim Drehen auf gleicher Höhe.
  - 14–16 (Scan 59–60): Hände langsam und kraftvoll zurückziehen wie beim Spannen eines Bogens; Kake-uke hakt einen
    Chudan-Angriff von links ab; der Fuß tritt in die linke Handfläche, die linke Hand bleibt dabei unbewegt.
  - 18 (Scan 61, nach Kyohan): Gewicht auf dem leicht gebeugten rechten Bein, Oberkörper leicht nach rechts geneigt,
    gerade Linie von der rechten Faust bis zu den linken Zehen – der zuvor zusammengezogene Körper streckt sich
    plötzlich (Tai-no-shinshuku).
  - 19 (Scan 62): Sprung mit Abstoß vom rechten Fuß nach links, mit Höhe und Weite.
  - 20 (Scan 62): dieser Zenkutsu-dachi hat keine Breite. 22 (Scan 63): langsam.
- Am Ende der Heian (Scan 65, nach Kyohan): Heian hieß früher Pin-an; wer die fünf Heian beherrscht, gewinnt das Gefühl,
  sich verteidigen zu können – daher der Name („Frieden, Ruhe“).

<!-- ablauf:heian-godan -->
| Nr | Stand | Technik | Fußarbeit | Richtung | Scan-S. |
|---|---|---|---|---|---|
| 1 | Migi Kokutsu-dachi | Hidari Sokumen Hidari Chudan Uchi-uke – fließend weiter | Blick nach links, linker Fuß gleitet nach links | links, Wendung ¼ links herum | 54 |
| 2 | Migi Kokutsu-dachi | Migi Chudan Gyaku-zuki | Stand bleibt | links | 54 |
| 3 | Heisoku-dachi | Hidari Zenwan Mizunagare-no-kamae – langsam | Langsam: linker Fuß bleibt, rechter Fuß schließt heran, Blick nach rechts | vorne, Blick rechts, Wendung ¼ rechts herum | 55 |
| 4 | Hidari Kokutsu-dachi | Migi Sokumen Migi Chudan Uchi-uke – fließend weiter | Linker Fuß bleibt, rechter Fuß gleitet nach rechts | rechts, Wendung ¼ rechts herum | 55 |
| 5 | Hidari Kokutsu-dachi | Hidari Chudan Gyaku-zuki | Stand bleibt | rechts | 55 |
| 6 | Heisoku-dachi | Migi Zenwan Mizunagare-no-kamae – langsam | Langsam: rechter Fuß bleibt, linker Fuß schließt heran, Blick nach vorne | vorne, Wendung ¼ links herum | 56 |
| 7 | Hidari Kokutsu-dachi | Migi Chudan Morote-uke | Rechter Fuß gleitet nach vorne | vorne | 56 |
| 8 | Hidari Zenkutsu-dachi | Gedan Kosa-uke – fließend weiter | Rechtes Bein trägt, linker Fuß gleitet vor | vorne | 57 |
| 9 | Hidari Zenkutsu-dachi | Kaisho Jodan Kosa-uke | Stand bleibt | vorne | 57 |
| 10 | Hidari Zenkutsu-dachi | Ryosho Juji Chudan Osae-uke | Stand bleibt | vorne | 58 |
| 11 | Hidari Zenkutsu-dachi | Saken Chudan-zuki – fließend weiter | Stand bleibt | vorne | 58 |
| 12 | Migi Zenkutsu-dachi | Migi Chudan Oi-zuki – **Kiai** | Hüfte nach vorne, rechter Fuß gleitet vor – Kiai | vorne | 58 |
| 13 | Kiba-dachi | Migi Sokumen Migi Gedan-barai | Linkes Bein trägt, rechter Fuß geht Richtung Start, Drehung links herum in Kiba-dachi – Blick zum Start | rechts, Blick Start, Wendung ¾ links herum | 59 |
| 14 | Kiba-dachi | Hidari Tekubi Hidari Sokumen Chudan Kake-uke – langsam | Langsam: Stand bleibt, Blick nach vorne, Hände wie beim Bogenspannen zurückziehen | rechts, Blick vorne | 59 |
| 15 | Hidari Ashi-dachi | Sasho-ni Migi Chudan Mikazuki-geri | Linkes Bein trägt, Hüfte dreht links herum, Mikazuki-geri in die linke Hand | vorne, Wendung ¼ links herum | 60 |
| 16 | Kiba-dachi | Sasho-ni Migi Mae-enpi | Rechter Fuß setzt nach dem Tritt vorne ab – Kiba-dachi | links, Wendung ¼ links herum | 60 |
| 17 | Migi Ashi-mae Kosa-dachi | Migi Sokumen Chudan Morote-uke | Rechtes Knie bleibt gebeugt, linker Fuß kreuzt hinter die rechte Ferse | links, Blick vorne | 61 |
| 18 | Hidari Ashi-mae Renoji-dachi | Uken Uho-tsukiage | Blick zum Start, linkes Bein streckt nach links Richtung Start aus (Renoji-dachi) | links, Blick Start | 61 |
| 19 | Migi Ashi-mae Kosa-dachi | Gedan Kosa-uke (Tobikomi (Sprung)) – **Kiai** | Sprung (Tobikomi) Richtung Start mit Kiai, halbe Drehung links herum, Landung im Kreuzstand | rechts, Wendung ½ links herum | 62 |
| 20 | Migi Zenkutsu-dachi | Migi Chudan Morote-uke (Zenkutsu-dachi ohne Breite) | Rechter Fuß gleitet nach rechts Richtung Start | Start, Wendung ¼ rechts herum | 62 |
| 21 | Migi Kokutsu-dachi | Migi Sokumen Jodan Uchi-uke + Hidari Sokumen Gedan-uke (Teil 1: Hidari Ashi-zenkutsu, Sasho Jodan Nagashi-uke + Migi Shuto Gedan-uchikomi) | Füße drehen auf der Stelle, Blick nach links zur Vorderseite, linker Fuß rückt etwas zurück, Gewicht nach hinten aufs rechte Bein | vorne, Wendung ½ links herum | 63 |
| 22 | Heisoku-dachi | Jotai sonomama (Oberkörper unverändert) – langsam | Langsam: Oberkörper bleibt, linker Fuß schließt an den rechten, Füße zeigen nach rechts | rechts, Blick vorne, Wendung ¼ rechts herum | 63 |
| 23 | Hidari Kokutsu-dachi | Hidari Sokumen Jodan Uchi-uke + Migi Sokumen Gedan-uke (Teil 1: Migi Ashi-zenkutsu, Usho Jodan Nagashi-uke + Hidari Shuto Gedan-uchikomi) | Gewicht bleibt links: linker Fuß rückt beim Querdrehen über die Ferse etwas nach links, rechter Fuß gleitet nach vorne | vorne, Wendung ¼ links herum | 64 |
<!-- /ablauf -->

### Tekki Shodan (S. 123–147, Scan 66–78)
- 29 Bewegungen, Kiai bei 15 und 29. Yoi: Heisoku-dachi, linke Hand auf dem rechten Handrücken. Enbusen: eine gerade
  Linie, Scan 77–78. Die Skizze zeigt die Namigaeshi-Bewegungen 11, 13, 25, 27 in zwei Bildern (Fuß angehoben, Fuß
  wieder unten).
- Hinweise im Buch:
  - 2 (Scan 67): Hände und Füße gemeinsam, groß und kräftig; als Variante Schlag mit dem Handrücken (Haishu) auf den
    Solarplexus; nach Kyohan hakt das Handgelenk einen Angriff von rechts ab.
  - 3 und 17 (Scan 67, 73): mit großer Kraft schlagen; die Handfläche trifft den Ellbogen und zieht den Gegner heran.
  - 4, 14, 18, 28: Fäuste und Blick scharf wechseln.
  - 5 und 19 (Scan 68, 73): Ellbogen gespannt, Abwehr und Schlag zugleich; die Faust startet vor der Gegenschulter.
  - 6 und 20 (Scan 68, 74): Faust mit Drehung scharf hochziehen, Achsel, Ellbogen und Handgelenke fest.
  - 7 und 21 (Scan 68, 74): langsam und verstohlen. 8 und 22: Blick, Abwehr und Stampfen gleichzeitig.
  - 9 und 23 (Scan 69, 75): gegnerische Faust drücken, halten und heranziehen, dabei Uraken auf Jinchu; die Faust bleibt
    gerade.
  - 10, 12, 24, 26: Kopf scharf drehen.
  - Namigaeshi 11, 13, 25, 27 (Scan 70–76): Fuß federnd hoch Richtung Unterbauch, Sohle nach oben, als würde ein Tritt
    weggefegt; danach auf den Fuß des Gegners stampfen und zugleich abwehren.
  - 15 (Scan 72): die linke Faust wehrt ab und trifft zugleich Chudan, die rechte
    schützt die Brust und ist schlagbereit.
  - 16 (Scan 72): Kake-uke hakt einen Angriff von links ab; nach Funakoshis Unterricht auch langsam mit offener,
    ausdrehender Hand ausgeführt.
- Name (Scan 77, nach Kyohan): Tekki hieß früher Naihanchi. Kennzeichen ist der Stand: Innenseiten der Oberschenkel
  spannen wie beim Reiten, beide Füße drücken von außen nach innen.

<!-- ablauf:tekki-shodan -->
| Nr | Stand | Technik | Fußarbeit | Richtung | Scan-S. |
|---|---|---|---|---|---|
| 1 | Hidari Ashi-mae Kosa | Kao Migi-muki (Blick nach rechts) (linker Fuß kreuzt vor dem rechten) | Blick nach rechts, linker Fuß kreuzt vor dem rechten nach rechts | vorne, Blick rechts | 66 |
| 2 | Kiba-dachi | Migi Tekubi Migi Sokumen Chudan Kake-uke (Migi Ashi Fumikomi) | Rechter Fuß stampft nach rechts (Fumikomi) – Kiba-dachi | vorne, Blick rechts | 67 |
| 3 | Kiba-dachi | Migi Sokumen Hidari Mae-enpi (Usho Hidari Hiji-ate) | Stand bleibt | vorne, Blick rechts | 67 |
| 4 | Kiba-dachi | Kao Hidari-muki Ryoken Migi Koshi-kamae | Stand bleibt, Blick nach links | vorne, Blick links | 67 |
| 5 | Kiba-dachi | Hidari Sokumen Hidari Gedan-barai | Stand bleibt | vorne, Blick links | 68 |
| 6 | Kiba-dachi | Uken Kagi-zuki | Stand bleibt | vorne, Blick links | 68 |
| 7 | Migi Ashi-mae Kosa | Rechter Fuß kreuzt langsam vor dem linken – langsam | Langsam: rechter Fuß kreuzt vor dem linken nach links | vorne, Blick links | 68 |
| 8 | Kiba-dachi | Migi Chudan Uchi-uke (Hidari Ashi Fumikomi, Kao Shomen-muki) | Linker Fuß stampft nach links (Fumikomi) – Kiba-dachi, Blick nach vorne | vorne | 69 |
| 9 | Kiba-dachi | Hidari Uraken Jodan-uchi + Migi Zenwan Mune-mae Suihei-kamae (Teil 1: Hidari Haiwan Jodan Uchi-nagashi-uke + Migi Gedan-uke) | Stand bleibt | vorne | 69 |
| 10 | Kiba-dachi | Kao Hidari-muki (Blick nach links) | Stand bleibt, Blick nach links | vorne, Blick links | 70 |
| 11 | Kiba-dachi | Hidari Zenwan Hidari Sokumen Chudan-uke (Hidari Ashi Namigaeshi) | Linker Fuß hebt nach innen hoch (Namigaeshi) und setzt wieder ab | vorne, Blick links | 70 |
| 12 | Kiba-dachi | Kao Migi-muki (Blick nach rechts) | Stand bleibt, Blick nach rechts | vorne, Blick rechts | 70 |
| 13 | Kiba-dachi | Hidari Zenwan Migi Sokumen Chudan-uke (Migi Ashi Namigaeshi) | Rechter Fuß hebt nach innen hoch (Namigaeshi) und setzt wieder ab | vorne, Blick rechts | 71 |
| 14 | Kiba-dachi | Kao Hidari-muki Ryoken Migi Koshi-kamae | Stand bleibt, Blick nach links | vorne, Blick links | 71 |
| 15 | Kiba-dachi | Saken Hidari Sokumen Chudan-zuki + Uken Kagi-zuki – **Kiai** | Stand bleibt – Kiai | vorne, Blick links | 72 |
| 16 | Kiba-dachi | Hidari Tekubi Hidari Sokumen Chudan Kake-uke – langsam | Langsam: Stand bleibt | vorne, Blick links | 72 |
| 17 | Kiba-dachi | Hidari Sokumen Migi Mae-enpi (Sasho Migi Hiji-ate) | Stand bleibt | vorne, Blick links | 73 |
| 18 | Kiba-dachi | Kao Migi-muki Ryoken Hidari Koshi-kamae | Stand bleibt, Blick nach rechts | vorne, Blick rechts | 73 |
| 19 | Kiba-dachi | Migi Sokumen Migi Gedan-barai | Stand bleibt | vorne, Blick rechts | 73 |
| 20 | Kiba-dachi | Saken Kagi-zuki | Stand bleibt | vorne, Blick rechts | 74 |
| 21 | Hidari Ashi-mae Kosa | Linker Fuß kreuzt langsam vor dem rechten – langsam | Langsam: linker Fuß kreuzt vor dem rechten nach rechts | vorne, Blick rechts | 74 |
| 22 | Kiba-dachi | Hidari Chudan Uchi-uke (Migi Ashi Fumikomi, Kao Shomen-muki) | Rechter Fuß stampft nach rechts (Fumikomi) – Kiba-dachi, Blick nach vorne | vorne | 74 |
| 23 | Kiba-dachi | Migi Uraken Jodan-uchi + Hidari Zenwan Mune-mae Suihei-kamae (Teil 1: Migi Haiwan Jodan Uchi-nagashi-uke + Hidari Gedan-uke) | Stand bleibt | vorne | 75 |
| 24 | Kiba-dachi | Kao Migi-muki (Blick nach rechts) | Stand bleibt, Blick nach rechts | vorne, Blick rechts | 75 |
| 25 | Kiba-dachi | Migi Zenwan Migi Sokumen Chudan-uke (Migi Ashi Namigaeshi) | Rechter Fuß hebt nach innen hoch (Namigaeshi) und setzt wieder ab | vorne, Blick rechts | 75 |
| 26 | Kiba-dachi | Kao Hidari-muki (Blick nach links) | Stand bleibt, Blick nach links | vorne, Blick links | 76 |
| 27 | Kiba-dachi | Migi Zenwan Hidari Sokumen Chudan-uke (Hidari Ashi Namigaeshi) | Linker Fuß hebt nach innen hoch (Namigaeshi) und setzt wieder ab | vorne, Blick links | 76 |
| 28 | Kiba-dachi | Kao Migi-muki Ryoken Hidari Koshi-kamae | Stand bleibt, Blick nach rechts | vorne, Blick rechts | 76 |
| 29 | Kiba-dachi | Uken Migi Sokumen Chudan-zuki + Saken Kagi-zuki – **Kiai** | Stand bleibt – Kiai | vorne, Blick rechts | 76 |
<!-- /ablauf -->

### Bassai Dai (S. 148–191, Scan 79–100)
- 42 Bewegungen, Kiai bei 19 und 42. Yoi: Heisoku-dachi, rechte Faust in der leicht gebeugten linken Hand (nicht
  umgreifen). Enbusen: T-Form, Scan 99–100. Die Skizze zeigt 25 und 28 in zwei Bildern.
- Hinweise im Buch:
  - 1 (Scan 79): Oberkörper halb seitlich (Hanmi); der Angreifer wird schon im Ansatz gestoppt, daher keine ausholende
    Abwehr.
  - 2–3 (Scan 80, nach Kyohan): Wechsel von der „ungünstigen“ linken zur „günstigen“ rechten Abwehrhand – typisch für
    Bassai („eine Festung durchbrechen“); die Faust geht unter dem anderen Arm am Ellbogen vorbei, die Handgelenke
    zeichnen ein Kreuz. 2→3, 4→5, 6→7 jeweils schnell.
  - 6 (Scan 82): rechter Fuß im Halbkreis über den linken nach rechts, Fuß und Faust zusammen, Hüfthöhe gleich; Sukui-uke
    gegen einen Tritt von rechts, Bein anheben und den Gegner aus dem Gleichgewicht bringen.
  - 8–12 (Scan 83–84): Hachiji-dachi etwas breiter als üblich; 9 langsam und kraftvoll (Abwehr in der Schulterbeuge des
    Gegners, eigentlich mit Schritt zwischen dessen Beine); die zurückgezogene Faust greift und zieht heran.
  - 18–19 (Scan 87–88): 18 langsam und kraftvoll, beide Füße flach, Fersen nach außen; Abwehr mit der linken Hand und
    Greifen von unten. 19: Arme und Bein zugleich mit großer Kraft; Knie möglichst bis vors Gesicht, schräg nach unten
    treten.
  - 22–23 (Scan 89–90): 22 in normalem Tempo, Oberkörper frontal, Abwehr eines doppelten Jodan-Stoßes; der rechte Fuß
    gleitet in 23 (kein Stampfen), ohne Pause; Fäuste nicht zu weit auseinander (Zangenschlag gegen beide Seiten des
    Bauches).
  - 25 (Scan 91): Teil 1 schnell, Teil 2 langsam und kraftvoll. 26 schnell und fließend. 27 wie Bogenspannen.
  - 28 (Scan 92): in die linke Handfläche treten, Fuß vorne absetzen, Kiba-dachi, Ellbogen in die Hand.
  - 29 (Scan 93): schützt den Solarplexus. 32: schnell, Oberkörper halb seitlich.
  - 33 (Scan 94): Yama-zuki („Bergfaust“, Form des Schriftzeichens 山); trifft Jinchu und Unterbauch zugleich; nach
    Kyohan gegen einen Gegner, der an den Haaren zieht.
  - 34 und 36 (Scan 94–95): Oberkörper frontal zur Rückseite, langsam; 35 und 37 auf den vorderen Fuß des Gegners stampfen.
  - 38–39 (Scan 96–97): Sukui-uke – Faust nie höher als der Ellbogen, Tritt am Knöchel nach außen ablenken.
  - 41 (Scan 98): langsam und kraftvoll; nach dem Handgelenk-Block greifen und den Gegner aus dem Gleichgewicht ziehen;
    nach Kyohan: auf dem linken Bein schräg nach links blicken und um 90° drehen.

<!-- ablauf:bassai-dai -->
| Nr | Stand | Technik | Fußarbeit | Richtung | Scan-S. |
|---|---|---|---|---|---|
| 1 | Migi Ashi-mae Kosa-dachi | Sasho Soede Migi Chudan Uchi-uke | Sprungschritt nach vorne: rechtes Bein trägt, linker Fuß kreuzt hinter die rechte Ferse | vorne | 79 |
| 2 | Hidari Zenkutsu-dachi | Hidari Chudan Uchi-uke – fließend weiter | Rechtes Bein trägt, linker Fuß gleitet nach hinten – Wendung links herum Richtung Start | Start, Wendung ½ links herum | 80 |
| 3 | Hidari Zenkutsu-dachi | Migi Chudan Uchi-uke | Stand bleibt | Start | 80 |
| 4 | Migi Zenkutsu-dachi | Hidari Chudan Soto-uke – fließend weiter | Linkes Bein trägt, Oberkörper dreht rechts herum zur Vorderseite – rechter Fuß vorne | vorne, Wendung ½ rechts herum | 81 |
| 5 | Migi Zenkutsu-dachi | Migi Chudan Uchi-uke | Stand bleibt | vorne | 81 |
| 6 | Migi Zenkutsu-dachi | Migi Chudan Soto-uke (zuvor Migi Gedan Sukui-uke) – fließend weiter | Linkes Bein trägt, rechter Fuß gleitet nach rechts | rechts, Wendung ¼ rechts herum | 82 |
| 7 | Migi Zenkutsu-dachi | Hidari Chudan Uchi-uke | Stand bleibt | rechts | 82 |
| 8 | Hachiji-dachi | Ryoken Migi Koshi-kamae | Rechtes Bein trägt, Blick nach vorne, linker Fuß zieht heran – Hachiji-dachi | vorne, Wendung ¼ links herum | 83 |
| 9 | Hachiji-dachi | Hidari Tate-shuto Chudan-uke – langsam | Langsam: Stand bleibt | vorne | 83 |
| 10 | Hachiji-dachi | Uken Chudan-zuki – fließend weiter | Stand bleibt | vorne | 83 |
| 11 | Hidari Hizakutsu | Migi Chudan Uchi-uke | Füße bleiben, Hüfte dreht nach links (Hizakutsu) | vorne | 84 |
| 12 | Hachiji-dachi | Saken Chudan-zuki – fließend weiter | Füße bleiben, linkes Bein streckt sich wieder | vorne | 84 |
| 13 | Migi Hizakutsu | Hidari Chudan Uchi-uke | Füße bleiben, Hüfte dreht nach rechts (Hizakutsu) | vorne | 85 |
| 14 | Hidari Kokutsu-dachi | Migi Shuto Chudan-uke | Linker Fuß bleibt, rechter Fuß gleitet nach links vorne auf die Mittellinie | vorne | 85 |
| 15 | Migi Kokutsu-dachi | Hidari Shuto Chudan-uke | Linker Fuß gleitet vor | vorne | 86 |
| 16 | Hidari Kokutsu-dachi | Migi Shuto Chudan-uke | Rechter Fuß gleitet vor | vorne | 86 |
| 17 | Migi Kokutsu-dachi | Hidari Shuto Chudan-uke | Rechter Fuß gleitet einen Schritt zurück | vorne | 87 |
| 18 | Hidari Ashi-zenkutsu | Ryosho Chudan Tsukami-uke – langsam | Langsam: Füße bleiben, Gewicht nach vorne (Ashi-zenkutsu) | vorne | 87 |
| 19 | Hidari Ashi-dachi | Ryosho Tsukamiyose + Migi Sokuto Gedan-kekomi – **Kiai** | Linkes Bein trägt, Hüfte dreht links herum, rechter Fuß tritt Gedan-kekomi – Kiai | links, Blick vorne, Wendung ¼ links herum | 88 |
| 20 | Migi Kokutsu-dachi | Hidari Shuto Chudan-uke | Tretfuß zurückziehen, Blick nach links zum Start, rechter Fuß setzt hinten ab | Start, Wendung ¼ links herum | 88 |
| 21 | Hidari Kokutsu-dachi | Migi Shuto Chudan-uke | Rechter Fuß gleitet vor Richtung Start | Start | 89 |
| 22 | Heisoku-dachi | Morote Jodan Age-uke – fließend weiter | Linker Fuß bleibt, rechter Fuß schließt heran | Start | 89 |
| 23 | Migi Zenkutsu-dachi | Ryo-kentsui Chudan Hasami-uchi | Linker Fuß bleibt, rechter Fuß gleitet vor | Start | 90 |
| 24 | Migi Zenkutsu-dachi | Uken Chudan-zuki (Yori-ashi) | Yori-ashi: beide Füße gleiten vor, Stand bleibt | Start | 90 |
| 25 | Heisoku-dachi | Migi Sokumen Jodan Uchi-uke + Hidari Sokumen Gedan-uke (Teil 1: Hidari Ashi-zenkutsu, Sasho Jodan Nagashi-uke + Migi Shuto Gedan-uchikomi) – langsam | Linkes Bein trägt, rechtes Knie hoch, Drehung links herum zur Vorderseite, dann Füße schließen (Heisoku-dachi) | rechts, Blick vorne, Wendung ¼ links herum | 91 |
| 26 | Kiba-dachi | Migi Sokumen Migi Gedan-barai – fließend weiter | Rechter Fuß stampft zur Vorderseite – Kiba-dachi | links, Blick vorne, Wendung ½ links herum | 91 |
| 27 | Kiba-dachi | Hidari Tekubi Hidari Sokumen Chudan Kake-uke – langsam | Langsam: Stand bleibt, Blick nach links | links, Blick Start | 92 |
| 28 | Kiba-dachi | Sasho-ni Migi Mae-enpi (Teil 1: Hidari Ashi-dachi, Sasho-ni Migi Chudan Mikazuki-geri) | Mikazuki-geri mit rechts in die linke Hand, rechter Fuß setzt ab – Kiba-dachi | rechts, Wendung ½ links herum | 92 |
| 29 | Kiba-dachi | Migi Gedan-uke + Hidari Zenwan Mune-mae-kamae | Stand bleibt | rechts | 93 |
| 30 | Kiba-dachi | Hidari Gedan-uke + Migi Zenwan Mune-mae-kamae | Stand bleibt | rechts | 93 |
| 31 | Kiba-dachi | Migi Gedan-uke + Hidari Zenwan Mune-mae-kamae | Stand bleibt | rechts | 93 |
| 32 | Migi Ashi-zenkutsu | Ryoken Hidari Koshi-kamae | Füße drehen im Uhrzeigersinn: rechtes Knie gebeugt, linkes Bein gestreckt (Ashi-zenkutsu) | Start, Wendung ¼ rechts herum | 93 |
| 33 | Migi Ashi-zenkutsu | Saken Jodan Uken Gedan Yama-zuki | Stand bleibt | Start | 94 |
| 34 | Heisoku-dachi | Ryoken Migi Koshi-kamae – langsam | Langsam: rechter Fuß schließt neben den linken | Start | 94 |
| 35 | Hidari Ashi-zenkutsu | Uken Jodan Saken Gedan Yama-zuki | Linkes Knie hoch, linker Fuß stampft auf – Ashi-zenkutsu | Start | 95 |
| 36 | Heisoku-dachi | Ryoken Hidari Koshi-kamae – langsam | Langsam: linker Fuß schließt neben den rechten | Start | 95 |
| 37 | Migi Ashi-zenkutsu | Saken Jodan Uken Gedan Yama-zuki | Rechtes Knie hoch, rechter Fuß stampft auf – Ashi-zenkutsu | Start | 96 |
| 38 | Hidari Hizakutsu | Migi Gedan Sukui-uke | Rechtes Bein trägt, Blick zur Vorderseite, Drehung links herum, linker Fuß gleitet nach links (Hizakutsu) | links, Blick vorne, Wendung ¾ links herum | 96 |
| 39 | Migi Hizakutsu | Hidari Gedan Sukui-uke | Füße bleiben, Hüfte dreht nach rechts (Hizakutsu) | rechts, Blick vorne, Wendung ½ rechts herum | 97 |
| 40 | Hidari Kokutsu-dachi | Migi Shuto Chudan-uke | Linker Fuß zieht unter den Körper, rechter Fuß gleitet schräg nach rechts vorne | rechts vorne, Wendung ⅛ links herum | 97 |
| 41 | Migi-te Migi-ashi Uho-e | Rechte Hand und rechter Fuß nach rechts (90°-Drehung) – langsam | Langsam: linkes Bein trägt, Drehung um 90° im Uhrzeigersinn, rechter Fuß und rechte Hand nach rechts | rechts hinten, Wendung ¼ rechts herum | 98 |
| 42 | Migi Kokutsu-dachi | Hidari Shuto Chudan-uke – **Kiai** | Blick schräg nach links vorne, Drehung links herum: rechter Fuß zieht zur Mitte zurück, linker Fuß gleitet schräg nach links vorne | links vorne, Wendung ½ links herum | 98 |
<!-- /ablauf -->

### Kanku Dai (S. 192–254, Scan 101–132)
- 65 Bewegungen, Kiai bei 15 und 65. Yoi: Hachiji-dachi, offene Hände vor dem Unterbauch, rechte Fingerspitzen auf den
  linken. Enbusen: I-Form, Scan 130–132.
- Hinweise im Buch:
  - 1 (Scan 101, nach Funakoshi): früher Kushanku; der Name Kanku („in den Himmel schauen“) kommt von dieser Bewegung.
  - 2 (Scan 101, nach Kyohan): steht für das Fehlen von Waffen; wie Sonne und Schatten gehören beide Teile zusammen.
  - 3–4 (Scan 102): offene linke Hand wehrt mit dem Handgelenk ab, rechte Speerhand vor der Brust; 3–4 fließend.
  - 5 (Scan 103): langsam und kraftvoll; die linke Hand fährt unter den rechten Arm (wie einen Kimonoärmel stützend),
    die rechte Faust kommt kreisend zur Hüfte.
  - 6–9 (Scan 103–105): Hachiji-dachi etwas breiter; 6→7 und 8→9 schnell; greifen und heranziehen.
  - 15 (Scan 107): Shihon-nukite = Tate-nukite, Osae-uke wie Heian Nidan 11.
  - 16–17 (Scan 108): Abwehr am Handgelenk und Unterarm, dann Arm verdrehen und gegen das Ellbogengelenk treten; dieselbe
    Verbindung in 21–22, 36–37 und Heian Yondan 11–12.
  - 17–19, 22–24 fließend; 20 und 25 langsam und kraftvoll (früher mit waagerecht ausgestrecktem Arm, nach Kyohan).
    18 und 23 wurden früher anders gelandet (Kokutsu-dachi mit Shuto-Schlag Gedan); 19 und 24 sind auch im Kokutsu-dachi
    möglich.
  - 26–28 und 29–31 (Scan 113–114): schnell und fließend; Ellbogen in die Handfläche.
  - 38 (Scan 118): Faust greift und zieht zur Hüfte; nach Best Karate anderthalb Sprungschritte. 39: Ellbogen bleibt,
    Faust unter dem linken Ellbogen hindurch zum Uchi-uke.
  - 40–41 und 49–50 (Scan 119, 122): zwei Fauststöße schnell hintereinander.
  - 42 (Scan 119): Ellbogen und Knie möglichst nah beieinander; Variante: Abwehr und Griff links, Kniestoß und Ura-zuki
    gegen das Kinn.
  - 43 (Scan 120): linkes Bein gestreckt, Ferse am Boden, Blick etwa vier Meter voraus; plötzliches Absinken als
    Überraschung (Kyohan).
  - 44 (Scan 120): Hüfte tiefer als im normalen Kokutsu-dachi; rechte Schwerthand unter Brustwarzenhöhe, Handfläche oben.
  - 54 (Scan 124): wie 15. 55: Arm ausdrehen wie gegriffen – Drehrichtung entgegengesetzt zu Heian Sandan.
  - 56 (Scan 125): Yori-ashi nach links; nach Kyohan auch als Uraken Jodan möglich. 58: früher im Ashi-zenkutsu.
  - 59–60 (Scan 126): Gedan-Abwehr gegen zwei Tritte von rechts; schnelle Drehung im Uhrzeigersinn; die rechte Hand
    schwingt nur als Reaktion mit. Variante: linkes Knie hoch und stampfen.
  - 61 (Scan 127): Faust schlägt abwärts unter die linke. 62: Hachiji-dachi breiter.
  - 62–64 (Scan 127–128): Kaisho-jodan-kosa-uke gegen Jodan-Schlag, Drehung auf dem rechten Bein, Handgelenk verdrehen und
    über die Schulter hebeln; 63–64 wären in einem Zug möglich (Best Karate), werden aber in zwei Zählzeiten ausgeführt.
  - 65 (Scan 128): Hände und Füße zugleich beenden; linke Hand greift und zieht.
  - Naore und Rei (Scan 129): langsam, ohne Hüfthöhe zu ändern; die Arme schließen im großen Kreis, umgekehrt zum
    Öffnen am Anfang.

<!-- ablauf:kanku-dai -->
| Nr | Stand | Technik | Fußarbeit | Richtung | Scan-S. |
|---|---|---|---|---|---|
| 1 | Hachiji-dachi | Ryote Hitai-mae-ue – langsam | Langsam: Stand bleibt, Hände steigen vor die Stirn | vorne | 101 |
| 2 | Hachiji-dachi | Ryote Kafukubu-mae | Stand bleibt | vorne | 101 |
| 3 | Migi Kokutsu-dachi | Hidari Haiwan Hidari Sokumen Jodan-uke + Usho Mune-mae-kamae – fließend weiter | Blick nach links, linker Fuß gleitet nach links | links, Wendung ¼ links herum | 102 |
| 4 | Hidari Kokutsu-dachi | Migi Haiwan Migi Sokumen Jodan-uke + Sasho Mune-mae-kamae | Füße bleiben am Platz, Blick nach rechts, Gewicht aufs linke Bein | rechts, Wendung ½ rechts herum | 102 |
| 5 | Hachiji-dachi | Hidari Tate-shuto Chudan-uke – langsam | Langsam: Füße bleiben am Platz und drehen, Blick nach vorne – etwas breiterer Hachiji-dachi | vorne, Wendung ¼ links herum | 103 |
| 6 | Hachiji-dachi | Uken Chudan-zuki – fließend weiter | Stand bleibt | vorne | 103 |
| 7 | Hidari Hizakutsu | Migi Chudan Uchi-uke | Füße bleiben, Hüfte dreht nach links (Hizakutsu) | vorne | 104 |
| 8 | Hachiji-dachi | Saken Chudan-zuki – fließend weiter | Füße bleiben, Hachiji-dachi | vorne | 104 |
| 9 | Migi Hizakutsu | Hidari Chudan Uchi-uke | Füße bleiben, Hüfte dreht nach rechts (Hizakutsu) | vorne | 105 |
| 10 | Hidari Ashi-dachi | Ryoken Hidari Koshi-kamae | Wendung nach rechts, linker Fuß rückt heran, beide Füße zeigen nach rechts, Blick zum Start, rechte Fußsohle an das linke Knie | rechts, Blick Start, Wendung ¼ rechts herum | 105 |
| 11 | Hidari Ashi-dachi | Migi Uraken Jodan Yoko-mawashi-uchi + Migi Yoko-geri-keage | Stand bleibt: Yoko-geri-keage zur rechten Seite (Richtung Start) | rechts, Blick Start | 105 |
| 12 | Migi Kokutsu-dachi | Hidari Shuto Chudan-uke | Blick nach links zur Vorderseite, rechter Fuß setzt hinten ab | vorne, Wendung ¼ links herum | 106 |
| 13 | Hidari Kokutsu-dachi | Migi Shuto Chudan-uke | Rechter Fuß gleitet vor | vorne | 106 |
| 14 | Migi Kokutsu-dachi | Hidari Shuto Chudan-uke | Linker Fuß gleitet vor | vorne | 107 |
| 15 | Migi Zenkutsu-dachi | Sasho Chudan Osae-uke + Migi Chudan Shihon-nukite – **Kiai** | Hüfte nach vorne, rechter Fuß gleitet vor – Kiai | vorne | 107 |
| 16 | Hidari Ashi-zenkutsu | Sasho Jodan-uke + Migi Shuto Jodan Soto-mawashi-uchi (Gyaku-hanmi; zuvor Hidari Shuto Koho Gedan-barai) | Rechtes Bein trägt, Wendung links herum zum Start (Ashi-zenkutsu, Gyaku-hanmi) | Start, Wendung ½ links herum | 108 |
| 17 | Hidari Ashi-dachi | Migi Jodan Mae-geri-keage – fließend weiter | Linkes Bein trägt, rechtes Knie hoch, Mae-geri-keage | Start | 108 |
| 18 | Migi Kokutsu-dachi | Migi Sokumen Jodan Uchi-uke + Hidari Sokumen Gedan-uke – fließend weiter | Linker Fuß bleibt und dreht auf der Stelle, rechter Fuß setzt nach dem Tritt hinten ab – Blick zur Vorderseite | vorne, Wendung ½ links herum | 109 |
| 19 | Hidari Ashi-zenkutsu | Sasho Jodan Nagashi-uke + Migi Shuto Gedan-uchikomi | Füße bleiben, Gewicht nach vorne (Ashi-zenkutsu) | vorne | 109 |
| 20 | Hidari Ashi-mae Renoji-dachi | Saken Gedan (Uken Migi Koshi) – langsam | Langsam: rechter Fuß bleibt, linker Fuß zieht heran – Renoji-dachi | vorne | 110 |
| 21 | Hidari Ashi-zenkutsu | Sasho Jodan-uke + Migi Shuto Jodan Soto-mawashi-uchi (Gyaku-hanmi) | Rechter Fuß bleibt, linker Fuß gleitet vor (Ashi-zenkutsu, Gyaku-hanmi) | vorne | 110 |
| 22 | Hidari Ashi-dachi | Migi Jodan Mae-geri-keage – fließend weiter | Linkes Bein trägt, rechtes Knie hoch, Mae-geri-keage | vorne | 111 |
| 23 | Migi Kokutsu-dachi | Migi Sokumen Jodan Uchi-uke + Hidari Sokumen Gedan-uke – fließend weiter | Linker Fuß bleibt und dreht auf der Stelle, rechter Fuß setzt nach dem Tritt hinten ab – Blick zum Start | Start, Wendung ½ links herum | 111 |
| 24 | Hidari Ashi-zenkutsu | Sasho Jodan Nagashi-uke + Migi Shuto Gedan-uchikomi | Füße bleiben, Gewicht nach vorne (Ashi-zenkutsu) | Start | 112 |
| 25 | Hidari Ashi-mae Renoji-dachi | Saken Gedan (Uken Migi Koshi) – langsam | Langsam: rechter Fuß bleibt, linker Fuß zieht heran – Renoji-dachi | Start | 112 |
| 26 | Migi Ashi-dachi | Ryoken Migi Koshi-kamae – fließend weiter | Blick nach links, Gewicht aufs rechte Bein, linke Fußsohle an das rechte Knie | Start, Blick rechts | 113 |
| 27 | Migi Ashi-dachi | Hidari Uraken Jodan Yoko-mawashi-uchi + Hidari Yoko-geri-keage – fließend weiter | Stand bleibt: Yoko-geri-keage nach links | Start, Blick rechts | 113 |
| 28 | Hidari Zenkutsu-dachi | Sasho-ni Migi Mae-enpi | Linker Fuß setzt nach links ab | rechts, Wendung ¼ links herum | 113 |
| 29 | Hidari Ashi-dachi | Ryoken Hidari Koshi-kamae – fließend weiter | Blick nach rechts, linker Fuß bleibt und dreht, rechte Fußsohle an das linke Knie | Start, Blick links, Wendung ¼ rechts herum | 114 |
| 30 | Hidari Ashi-dachi | Migi Uraken Jodan Yoko-mawashi-uchi + Migi Yoko-geri-keage – fließend weiter | Stand bleibt: Yoko-geri-keage nach rechts | Start, Blick links | 114 |
| 31 | Migi Zenkutsu-dachi | Usho-ni Hidari Mae-enpi | Rechter Fuß setzt nach rechts ab | links, Wendung ¼ rechts herum | 114 |
| 32 | Migi Kokutsu-dachi | Hidari Shuto Chudan-uke | Füße bleiben am Platz und drehen sich, Hüfte dreht links herum, linker Fuß vorne | rechts, Wendung ½ links herum | 115 |
| 33 | Hidari Kokutsu-dachi | Migi Shuto Chudan-uke | Linkes Bein trägt, rechter Fuß gleitet schräg nach rechts (Richtung Start) | rechts hinten, Wendung ⅛ rechts herum | 115 |
| 34 | Hidari Kokutsu-dachi | Migi Shuto Chudan-uke | Linkes Knie bleibt gebeugt, rechter Fuß schwingt nach links, Drehung rechts herum | links, Wendung ⅜ rechts herum | 116 |
| 35 | Migi Kokutsu-dachi | Hidari Shuto Chudan-uke | Rechtes Bein trägt, linker Fuß gleitet schräg nach links (Richtung Start) | links hinten, Wendung ⅛ links herum | 116 |
| 36 | Hidari Ashi-zenkutsu | Sasho Jodan-uke + Migi Shuto Jodan Soto-mawashi-uchi (Gyaku-hanmi; zuvor Hidari Shuto Gedan-barai) | Rechtes Bein trägt, linker Fuß rückt zur Mittellinie, Blick zum Start (Ashi-zenkutsu, Gyaku-hanmi) | Start, Wendung ⅛ links herum | 117 |
| 37 | Hidari Ashi-dachi | Migi Jodan Mae-geri-keage | Hüfte über den linken Fuß, rechtes Knie hoch, Mae-geri-keage | Start | 117 |
| 38 | Migi Ashi-mae Kosa-dachi | Migi Uraken Tate-mawashi-uchi | Sprungschritt Richtung Start: rechter Fuß landet und trägt, linker Fuß kreuzt dahinter | Start | 118 |
| 39 | Migi Zenkutsu-dachi | Migi Chudan Uchi-uke | Rechter Fuß bleibt, linker Fuß gleitet zurück | Start | 118 |
| 40 | Migi Zenkutsu-dachi | Hidari Chudan Gyaku-zuki – fließend weiter | Stand bleibt | Start | 119 |
| 41 | Migi Zenkutsu-dachi | Uken Chudan-zuki | Stand bleibt | Start | 119 |
| 42 | Hidari Ashi-dachi | Sasho Soede Migi Jodan Ura-zuki + Migi Hiza-zuchi | Wendung links herum zur Vorderseite: linkes Bein trägt, rechtes Knie hoch | vorne, Wendung ½ links herum | 119 |
| 43 | Migi Ashi-zenkutsu | Ude-tate (Hände auf dem Boden) | Rechter Fuß landet vorne, Fingerspitzen beider Hände auf den Boden (Ashi-zenkutsu) | vorne | 120 |
| 44 | Migi Kokutsu-dachi | Hidari Shuto Gedan-uke + Migi Shuto Mune-mae-kamae (tiefer als üblich) | Rechtes Bein trägt und dreht, linker Fuß rückt etwas zur Seite, Wendung links herum zum Start, tiefer Kokutsu-dachi | Start, Wendung ½ links herum | 120 |
| 45 | Hidari Kokutsu-dachi | Migi Shuto Chudan-uke | Rechter Fuß gleitet vor | Start | 121 |
| 46 | Hidari Zenkutsu-dachi | Hidari Chudan Uchi-uke | Rechtes Bein trägt, linker Fuß schwingt nach rechts, ¾ Drehung links herum | links, Wendung ¾ links herum | 121 |
| 47 | Hidari Zenkutsu-dachi | Migi Chudan Gyaku-zuki | Stand bleibt | links | 122 |
| 48 | Migi Zenkutsu-dachi | Migi Chudan Uchi-uke | Linkes Bein trägt, Hüfte dreht rechts herum, rechter Fuß nach rechts | rechts, Wendung ½ rechts herum | 122 |
| 49 | Migi Zenkutsu-dachi | Hidari Chudan Gyaku-zuki – fließend weiter | Stand bleibt | rechts | 122 |
| 50 | Migi Zenkutsu-dachi | Uken Chudan-zuki | Stand bleibt | rechts | 122 |
| 51 | Hidari Ashi-dachi | Ryoken Hidari Koshi-kamae | Linker Fuß bleibt und dreht, beide Füße zeigen nach rechts, Blick zum Start, rechte Fußsohle an das linke Knie | rechts, Blick Start | 123 |
| 52 | Hidari Ashi-dachi | Migi Uraken Jodan Yoko-mawashi-uchi + Migi Yoko-geri-keage | Stand bleibt: Yoko-geri-keage zur rechten Seite (Richtung Start) | rechts, Blick Start | 123 |
| 53 | Migi Kokutsu-dachi | Hidari Shuto Chudan-uke | Blick nach links zur Vorderseite, rechter Fuß setzt weiter rechts hinten ab, linker Fuß rückt etwas nach rechts | vorne, Wendung ¼ links herum | 123 |
| 54 | Migi Zenkutsu-dachi | Sasho Chudan Osae-uke + Migi Chudan Shihon-nukite | Hüfte nach vorne, rechter Fuß gleitet vor | vorne | 124 |
| 55 | Kiba-dachi | Hidari Uraken Hidari Sokumen Jodan Tate-mawashi-uchi | Rechtes Bein trägt und dreht auf der Stelle, linker Fuß gleitet vor – Kiba-dachi, Blick zur Vorderseite | rechts, Blick vorne, Wendung ¾ links herum | 124 |
| 56 | Kiba-dachi | Hidari Kentsui Chudan Uchi-mawashi-uchi (Hidari-e Yori-ashi) | Yori-ashi nach links: der rechte Fuß stößt ab, beide Füße gleiten | rechts, Blick vorne | 125 |
| 57 | Kiba-dachi | Hidari Sokumen Migi Mae-enpi (Sasho Migi Hiji-ate) | Stand bleibt | rechts, Blick vorne | 125 |
| 58 | Kiba-dachi | Ryoken Hidari Koshi-kamae | Stand bleibt, Blick nach rechts | rechts, Blick Start | 125 |
| 59 | Kiba-dachi | Migi Sokumen Migi Gedan-barai | Stand bleibt | rechts, Blick Start | 126 |
| 60 | Kiba-dachi | Hidari Zenwan Gedan-uke + Uken Furiage | Rechtes Bein trägt, linker Fuß geht nach rechts Richtung Start, schnelle Drehung rechts herum – Kiba-dachi | links, Wendung ½ rechts herum | 126 |
| 61 | Kiba-dachi | Uken Otoshi-zuki | Stand bleibt | links | 127 |
| 62 | Hachiji-dachi | Kaisho Jodan Kosa-uke | Füße bleiben, beide Knie strecken, die Fußspitzen drehen nach außen – breiter Hachiji-dachi | links | 127 |
| 63 | Migi Zenkutsu-dachi | Migi Ashi-jiku Migi-mawari (Drehung, Hände gekreuzt) | Rechtes Bein trägt, Drehung rechts herum, linker Fuß schwingt nach rechts – Blick zum Start | Start, Wendung ¾ rechts herum | 127 |
| 64 | Migi Zenkutsu-dachi | Ryoken Mune-mae – langsam | Langsam: Stand bleibt | Start | 128 |
| 65 | Migi Zenkutsu-dachi | Nidan-geri + Migi Uraken Tate-mawashi-uchi – **Kiai** | Nidan-geri im Sprung, rechter Fuß landet vorne – Kiai | Start | 128 |
<!-- /ablauf -->

### Jion (S. 255–301, Scan 132–155)
- 47 Bewegungen, Kiai bei 17 und 47. Yoi: Heisoku-dachi, rechte Faust vor dem Kinn, von der linken Hand umfasst.
  Enbusen: I-Form, Scan 154–155. Bild 35 der Skizze erkennt die automatische Vermessung nicht (von Hand vermessen).
- Hinweise im Buch:
  - 2 und 7 (Scan 133, 135): langsam, kraftvoll, mit dynamischer Spannung; Fäuste kreuzen (rechts oben) und
    Chudan-kakiwake.
  - 3–4, 5–6, 8–9, 10–11, 12–13, 14–15 (Scan 134–138): jeweils in einem Atemzug.
  - 19 und 21 (Scan 140–141): Yori-ashi nach links bzw. rechts.
  - 23–25 (Scan 142–143): Arme und Füße mit der Hüftdrehung bewegen und gleichzeitig beenden; Handgelenk stark abknicken,
    Finger leicht gebeugt; drei Wiederholungen mit Kontrast in Tempo und Kraft.
  - 30 (Scan 145): beide Fäuste drücken sich langsam abwärts auseinander (Ryoken Ryogawa Gedan-kakiwake).
  - 31 (Scan 145): Gedan-kosa-uke stoppt den Tritt am Schienbein. 32: linken Fuß zurück, Beine des Gegners zur Seite
    ziehen.
  - 33–34 (Scan 146–147): Chudan-kakiwake; beim Jodan-kosa-uke ist die vordere Hand immer auf der Seite des vorderen
    Fußes; 31–34 (Gedan, Chudan, Jodan) sind der wichtigste Teil der Kata.
  - 36 (Scan 148): Variante wie Tekki Shodan 23; 35–37 schnell und fließend.
  - 43–45 (Scan 150–151): Unterarm schlägt senkrecht abwärts gegen einen Chudan-Schlag; Kontrast zwischen den drei
    Wiederholungen.
  - 46–47 (Scan 152–153): 46 langsam und kraftvoll; mit einer Hand greifen und zur Seite ziehen, mit der anderen Faust
    in die Seite schlagen; Yori-ashi.

<!-- ablauf:jion -->
| Nr | Stand | Technik | Fußarbeit | Richtung | Scan-S. |
|---|---|---|---|---|---|
| 1 | Migi Zenkutsu-dachi | Migi Chudan Uchi-uke + Hidari Gedan-uke | Linker Fuß gleitet zurück | vorne | 133 |
| 2 | Hidari Zenkutsu-dachi | Ryoken Chudan Kakiwake-uke – langsam | Langsam: rechtes Bein trägt, linker Fuß gleitet schräg nach links vorne | links vorne, Wendung ⅛ links herum | 133 |
| 3 | Hidari Ashi-dachi | Migi Chudan Mae-geri-keage – fließend weiter | Hüfte über den linken Fuß, rechtes Knie hoch, Mae-geri-keage | links vorne | 134 |
| 4 | Migi Zenkutsu-dachi | Uken Chudan-zuki | Rechter Fuß setzt nach dem Tritt vorne ab | links vorne | 134 |
| 5 | Migi Zenkutsu-dachi | Saken Chudan-zuki – fließend weiter | Stand bleibt | links vorne | 134 |
| 6 | Migi Zenkutsu-dachi | Uken Chudan-zuki | Stand bleibt | links vorne | 135 |
| 7 | Migi Zenkutsu-dachi | Ryoken Chudan Kakiwake-uke – langsam | Langsam: Drehung rechts herum, rechter Fuß gleitet schräg nach rechts vorne | rechts vorne, Wendung ¼ rechts herum | 135 |
| 8 | Migi Ashi-dachi | Hidari Chudan Mae-geri-keage – fließend weiter | Hüfte über den rechten Fuß, linkes Knie hoch, Mae-geri-keage | rechts vorne | 135 |
| 9 | Hidari Zenkutsu-dachi | Saken Chudan-zuki | Linker Fuß setzt nach dem Tritt vorne ab | rechts vorne | 136 |
| 10 | Hidari Zenkutsu-dachi | Uken Chudan-zuki – fließend weiter | Stand bleibt | rechts vorne | 136 |
| 11 | Hidari Zenkutsu-dachi | Saken Chudan-zuki | Stand bleibt | rechts vorne | 136 |
| 12 | Hidari Zenkutsu-dachi | Hidari Jodan Age-uke – fließend weiter | Rechtes Bein trägt, linker Fuß gleitet nach links auf die Mittellinie | vorne, Wendung ⅛ links herum | 137 |
| 13 | Hidari Zenkutsu-dachi | Migi Chudan Gyaku-zuki | Stand bleibt | vorne | 137 |
| 14 | Migi Zenkutsu-dachi | Migi Jodan Age-uke – fließend weiter | Rechter Fuß gleitet vor | vorne | 138 |
| 15 | Migi Zenkutsu-dachi | Hidari Chudan Gyaku-zuki | Stand bleibt | vorne | 138 |
| 16 | Hidari Zenkutsu-dachi | Hidari Jodan Age-uke | Linker Fuß gleitet vor | vorne | 139 |
| 17 | Migi Zenkutsu-dachi | Migi Chudan Oi-zuki – **Kiai** | Hüfte nach vorne, rechter Fuß gleitet vor – Kiai | vorne | 139 |
| 18 | Migi Kokutsu-dachi | Migi Sokumen Jodan Uchi-uke + Hidari Sokumen Gedan-uke | Rechtes Knie bleibt gebeugt, linker Fuß schwingt nach rechts, ¾ Drehung links herum | rechts, Wendung ¾ links herum | 140 |
| 19 | Kiba-dachi | Uken Kagi-zuki (Hidari-e Yori-ashi) | Yori-ashi nach links: beide Füße gleiten, Kiba-dachi | Start, Blick rechts, Wendung ¼ rechts herum | 140 |
| 20 | Hidari Kokutsu-dachi | Hidari Sokumen Jodan Uchi-uke + Migi Sokumen Gedan-uke | Füße bleiben am Platz und drehen, Blick nach rechts – Kokutsu-dachi | links, Wendung ¼ rechts herum | 141 |
| 21 | Kiba-dachi | Saken Kagi-zuki (Migi-e Yori-ashi) | Yori-ashi nach rechts: beide Füße gleiten, Kiba-dachi | Start, Blick links, Wendung ¼ links herum | 141 |
| 22 | Hidari Zenkutsu-dachi | Hidari Gedan-barai | Linker Fuß gleitet Richtung Start | Start | 141 |
| 23 | Kiba-dachi | Migi Teisho Migi Sokumen Chudan Yoko-uke | Rechter Fuß tritt vor Richtung Start – Kiba-dachi, Blick zum Start | rechts, Blick Start, Wendung ¼ links herum | 142 |
| 24 | Kiba-dachi | Hidari Teisho Hidari Sokumen Chudan Yoko-uke | Linker Fuß tritt vor Richtung Start, halbe Drehung – Kiba-dachi | links, Blick Start, Wendung ½ rechts herum | 142 |
| 25 | Kiba-dachi | Migi Teisho Migi Sokumen Chudan Yoko-uke | Rechter Fuß tritt vor Richtung Start, halbe Drehung – Kiba-dachi | rechts, Blick Start, Wendung ½ links herum | 143 |
| 26 | Migi Kokutsu-dachi | Migi Sokumen Jodan Uchi-uke + Hidari Sokumen Gedan-uke | Rechter Fuß bleibt, linker Fuß gleitet nach links | links, Wendung ½ links herum | 143 |
| 27 | Heisoku-dachi | Hidari Sokumen Jodan Morote-uke | Rechter Fuß schließt an den linken (Heisoku-dachi) | vorne, Blick links, Wendung ¼ rechts herum | 144 |
| 28 | Hidari Kokutsu-dachi | Hidari Sokumen Jodan Uchi-uke + Migi Sokumen Gedan-uke | Linker Fuß bleibt, rechter Fuß gleitet nach rechts | rechts, Wendung ¼ rechts herum | 144 |
| 29 | Heisoku-dachi | Migi Sokumen Jodan Morote-uke | Linker Fuß schließt an den rechten (Heisoku-dachi) | vorne, Blick rechts, Wendung ¼ links herum | 145 |
| 30 | Heisoku-dachi | Ryoken Ryogawa Gedan-kakiwake – langsam | Langsam: Stand bleibt, Blick nach vorne | vorne | 145 |
| 31 | Migi Ashi-mae Kosa-dachi | Gedan Kosa-uke | Sprungschritt nach vorne: rechtes Bein trägt, linker Fuß kreuzt dahinter | vorne | 145 |
| 32 | Migi Zenkutsu-dachi | Ryoken Ryogawa Gedan-kakiwake | Linker Fuß gleitet zurück | vorne | 146 |
| 33 | Hidari Zenkutsu-dachi | Ryoken Chudan Kakiwake-uke | Linker Fuß gleitet vor | vorne | 146 |
| 34 | Migi Zenkutsu-dachi | Ryoken Jodan Kosa-uke | Rechter Fuß gleitet vor | vorne | 147 |
| 35 | Migi Zenkutsu-dachi | Migi Uraken Jodan-uchi – fließend weiter | Stand bleibt | vorne | 147 |
| 36 | Migi Zenkutsu-dachi | Saken Chudan Tsuki-uke + Uken Migi Kata-ue-kamae – fließend weiter | Stand bleibt | vorne | 148 |
| 37 | Migi Zenkutsu-dachi | Migi Uraken Jodan-uchi + Hidari Zenwan Mune-mae Suihei-kamae | Stand bleibt | vorne | 148 |
| 38 | Hidari Zenkutsu-dachi | Hidari Chudan Uchi-uke | Rechtes Knie bleibt gebeugt, linker Fuß schwingt nach rechts, ¾ Drehung links herum | rechts, Wendung ¾ links herum | 148 |
| 39 | Migi Zenkutsu-dachi | Migi Chudan Oi-zuki | Hüfte nach vorne, rechter Fuß gleitet vor | rechts | 149 |
| 40 | Migi Zenkutsu-dachi | Migi Chudan Uchi-uke | Linkes Bein trägt, rechter Fuß gleitet zurück, Wendung rechts herum | links, Wendung ½ rechts herum | 149 |
| 41 | Hidari Zenkutsu-dachi | Hidari Chudan Oi-zuki | Hüfte nach vorne, linker Fuß gleitet vor | links | 149 |
| 42 | Hidari Zenkutsu-dachi | Hidari Gedan-barai | Rechtes Bein trägt, linker Fuß gleitet nach links Richtung Start | Start, Wendung ¼ links herum | 150 |
| 43 | Kiba-dachi | Migi Zenwan Migi Sokumen Chudan Uchiotoshi (Migi Ashi Fumikomi) | Rechter Fuß stampft Richtung Start (Fumikomi) – Kiba-dachi | rechts, Blick Start, Wendung ¼ links herum | 150 |
| 44 | Kiba-dachi | Hidari Zenwan Hidari Sokumen Chudan Uchiotoshi (Hidari Ashi Fumikomi) | Linker Fuß stampft Richtung Start (Fumikomi), halbe Drehung – Kiba-dachi | links, Blick Start, Wendung ½ rechts herum | 151 |
| 45 | Kiba-dachi | Migi Zenwan Migi Sokumen Chudan Uchiotoshi (Migi Ashi Fumikomi) | Rechter Fuß stampft Richtung Start (Fumikomi), halbe Drehung – Kiba-dachi | rechts, Blick Start, Wendung ½ links herum | 151 |
| 46 | Kiba-dachi | Uken Migi Chichi-mae + Saken Hidari Sokumen Chudan-zuki (Hidari-e Yori-ashi) – langsam | Langsam: Blick nach links, Drehung auf dem rechten Bein zur Vorderseite, dann Yori-ashi nach links – Kiba-dachi | vorne, Blick links, Wendung ¼ links herum | 152 |
| 47 | Kiba-dachi | Saken Hidari Chichi-mae + Uken Migi Sokumen Chudan-zuki (Migi-e Yori-ashi) – **Kiai** | Blick nach rechts, Yori-ashi nach rechts – Kiai | vorne, Blick rechts | 153 |
<!-- /ablauf -->

### Enpi (S. 302–338, Scan 156–174)
- 37 Bewegungen, Kiai bei 15 und 36. Yoi: Heisoku-dachi, linke Hand an der linken Hüfte, rechte Faust an der linken
  Handfläche. Enbusen: I-Form, Scan 173–174 (auf Scan 174 sind mehrere Bilder von Hand vermessen).
- Hinweise im Buch:
  - 1 (Scan 156): nach Kyohan Beinfeger mit Zug nach unten (Wurfansatz); nach Best Karate Schlag abwehren, greifen,
    seitlich gleiten und das Knie fegen.
  - 2 (Scan 156): Hachiji-dachi etwas breiter. 3: Gedan-barai holt vor der linken Schulter Schwung.
  - 6, 10, 20, 26 (Age-zuki): Variante – Jodan-Schlag mit dem Unterarm abwehren und zugleich aufwärts gegen das Kinn.
  - 7, 11, 27 (Scan 158–167): rechte Faust greift und zieht über die linke Schulter; der linke Stoß zielt unter den
    Nabel (Tanden).
  - 8, 12, 28: die ausgestreckte linke Faust wird gegriffen – mit dem rechten Handgelenk oder Kentsui auf das
    Handgelenk schlagen und frei ziehen.
  - Name (Scan 159, nach Kyohan): früher Wanshu; Enpi = „fliegende Schwalbe“ wegen der schnellen Richtungswechsel in
    6–8, die sich in der Kata wiederholen.
  - 14 und 16 (Scan 162–163): langsam und dynamisch; in 16 die linke Hand unter den rechten Arm wie einen Kimonoärmel.
  - 17–18 (Scan 163–164): zwei Fauststöße schnell hintereinander; Ablauf 14–18 nach dem Buch: herausfordern, Öffnung schaffen, Angriff abwehren,
    kontern.
  - 30 (Scan 168): langsam und kraftvoll. 31–33 (Scan 169–170): Hände und Füße gemeinsam, langsam und kraftvoll.
  - 34 (Scan 170): das linke Handgelenk wird gegriffen – mit dem rechten Handgelenk schlagen und frei ziehen; Arme
    drücken gekreuzt auseinander.
  - 35–36 (Scan 171): Koko („Tigermaul“) = Raum zwischen Daumen und Zeigefinger; Jodan-Abwehr und Griff am Kragen, die
    rechte Hand zwischen die Beine, in 36 den Gegner über die Schulter heben und werfen.

<!-- ablauf:enpi -->
| Nr | Stand | Technik | Fußarbeit | Richtung | Scan-S. |
|---|---|---|---|---|---|
| 1 | Migi Ashi Orishiki Hidari Hiza-tate | Migi Zenwan Gedan-barai + Hidari Zenwan Suigetsu-mae-kamae (Knien auf dem rechten Bein) | Linker Fuß tritt nach links, rechtes Knie geht zu Boden (Orishiki) | links, Wendung ¼ links herum | 156 |
| 2 | Hachiji-dachi | Ryoken Hidari Koshi-kamae | Füße bleiben am Platz und drehen: Aufrichten aus dem Knien – etwas breiterer Hachiji-dachi | vorne, Blick links, Wendung ¼ rechts herum | 156 |
| 3 | Migi Ashi-zenkutsu | Migi Gedan-barai | Rechter Fuß gleitet nach rechts (Ashi-zenkutsu) | rechts, Wendung ¼ rechts herum | 157 |
| 4 | Kiba-dachi | Hidari Zenwan Mizunagare-no-kamae | Füße drehen nach vorne – Kiba-dachi | vorne, Blick rechts, Wendung ¼ links herum | 157 |
| 5 | Hidari Zenkutsu-dachi | Hidari Gedan-barai | Rechtes Bein trägt, linker Fuß gleitet nach vorne | vorne | 157 |
| 6 | Hidari Zenkutsu-dachi | Migi Jodan Age-zuki | Stand bleibt | vorne | 158 |
| 7 | Migi Ashi-mae Kosa-dachi | Saken Gedan-zuki (Uken Hidari Kata-mae-ue) | Sprungschritt nach vorne: rechter Fuß landet und trägt, linker Fuß kreuzt dahinter | vorne | 158 |
| 8 | Hidari Hizakutsu | Migi Gedan-barai | Blick zum Start, rechtes Bein trägt, linker Fuß gleitet Richtung Start (Hizakutsu) | Start, Wendung ½ links herum | 159 |
| 9 | Hidari Zenkutsu-dachi | Hidari Gedan-barai | Rechtes Bein trägt, linker Fuß rückt etwas heran, Gewicht nach vorne – Zenkutsu-dachi | Start | 159 |
| 10 | Hidari Zenkutsu-dachi | Migi Jodan Age-zuki | Stand bleibt | Start | 160 |
| 11 | Migi Ashi-mae Kosa-dachi | Saken Gedan-zuki (Uken Hidari Kata-mae-ue) | Sprungschritt Richtung Start: rechter Fuß landet und trägt, linker Fuß kreuzt dahinter | Start | 160 |
| 12 | Hidari Hizakutsu | Migi Gedan-barai | Blick zur Vorderseite, rechtes Bein trägt, linker Fuß gleitet nach vorne (Hizakutsu) | vorne, Wendung ½ links herum | 161 |
| 13 | Hidari Zenkutsu-dachi | Hidari Gedan-barai | Rechtes Bein trägt, linker Fuß rückt etwas heran, Gewicht nach vorne – Zenkutsu-dachi | vorne | 161 |
| 14 | Kiba-dachi | Sasho Hidari Naname-mae-ue – langsam | Langsam: rechter Fuß bleibt, linker Fuß zieht nach links zurück – Kiba-dachi | vorne | 162 |
| 15 | Hidari Ashi-dachi | Migi Tekubi Sasho-uchi – **Kiai** | Linkes Bein trägt, rechtes Knie hoch – Kiai | vorne | 162 |
| 16 | Kiba-dachi | Hidari Tate-shuto Chudan-uke – langsam | Langsam: rechter Fuß setzt ab – Kiba-dachi | vorne | 163 |
| 17 | Kiba-dachi | Uken Chudan-zuki – fließend weiter | Stand bleibt | vorne | 163 |
| 18 | Kiba-dachi | Saken Chudan-zuki | Stand bleibt | vorne | 164 |
| 19 | Hidari Zenkutsu-dachi | Hidari Gedan-barai | Rechtes Bein trägt, linker Fuß dreht nach links – Zenkutsu-dachi | links, Wendung ¼ links herum | 164 |
| 20 | Hidari Zenkutsu-dachi | Migi Jodan Age-zuki | Stand bleibt | links | 164 |
| 21 | Hidari Kokutsu-dachi | Migi Shuto Chudan-uke | Linker Fuß bleibt, rechter Fuß gleitet vor | links | 165 |
| 22 | Migi Kokutsu-dachi | Hidari Shuto Chudan-uke | Rechter Fuß gleitet zurück an die Stelle des linken, linker Fuß gleitet vor an die Stelle des rechten | links | 165 |
| 23 | Migi Kokutsu-dachi | Uken Chudan-zuki | Stand bleibt | links | 165 |
| 24 | Hidari Kokutsu-dachi | Migi Shuto Chudan-uke | Linker Fuß bleibt, rechter Fuß gleitet vor | links | 166 |
| 25 | Hidari Zenkutsu-dachi | Hidari Gedan-barai | Rechtes Bein trägt, Wendung links herum, linker Fuß nach rechts | rechts, Wendung ½ links herum | 166 |
| 26 | Hidari Zenkutsu-dachi | Migi Jodan Age-zuki | Stand bleibt | rechts | 166 |
| 27 | Migi Ashi-mae Kosa-dachi | Saken Gedan-zuki (Uken Hidari Kata-mae-ue) | Sprungschritt nach rechts: rechter Fuß landet und trägt, linker Fuß kreuzt dahinter | rechts | 167 |
| 28 | Hidari Hizakutsu | Migi Gedan-barai | Blick nach links, rechtes Bein trägt, linker Fuß gleitet nach links (Hizakutsu) | links, Wendung ½ links herum | 167 |
| 29 | Hidari Zenkutsu-dachi | Hidari Gedan-barai | Rechtes Bein trägt, linker Fuß rückt etwas heran, Gewicht nach vorne – Zenkutsu-dachi | links | 168 |
| 30 | Hidari Zenkutsu-dachi | Migi Teisho Chudan Oshiage-uke – langsam | Langsam: Stand bleibt | links | 168 |
| 31 | Migi Zenkutsu-dachi | Migi Teisho Oshiage-uke + Hidari Teisho Oshisage-uke – langsam | Langsam: linker Fuß zieht einen halben Schritt zurück, dann gleitet der rechte Fuß nach vorne | vorne, Wendung ¼ rechts herum | 169 |
| 32 | Hidari Zenkutsu-dachi | Hidari Teisho Oshiage-uke + Migi Teisho Oshisage-uke – langsam | Langsam: linker Fuß gleitet vor | vorne | 169 |
| 33 | Migi Zenkutsu-dachi | Migi Teisho Oshiage-uke + Hidari Teisho Oshisage-uke – langsam | Langsam: rechter Fuß gleitet vor | vorne | 170 |
| 34 | Hidari Kokutsu-dachi | Uken Gedan-kamae (Yori-ashi gimi ni) | Leichtes Yori-ashi nach vorne – Kokutsu-dachi | vorne | 170 |
| 35 | Migi Ashi-mae Fudo-dachi | Usho Gedan Sasho Jodan Tsukami-uke (Yori-ashi) | Yori-ashi nach vorne – Fudo-dachi | vorne | 171 |
| 36 | Hidari Kokutsu-dachi | Migi Shuto Chudan-uke (zuvor Hidari Kaiten-tobi (Drehsprung)) – **Kiai** | Drehsprung links herum (Kaiten-tobi) mit Landung etwa einen Schritt weiter hinten, Kokutsu-dachi – Kiai | vorne, ganze Drehung links herum | 171 |
| 37 | Migi Kokutsu-dachi | Hidari Shuto Chudan-uke | Rechter Fuß gleitet einen Schritt zurück | vorne | 172 |
<!-- /ablauf -->

## Band 2: Hangetsu („Karate-Do Kata Vol. 2“, JKA)

Aus Band 2 nutzt die App **nur Hangetsu**. Das PDF hat 87 Seiten; ab Scan-Seite 5 zeigt jede eine gedruckte Doppelseite:
**Scan-Seite n = Buchseiten 2·(n−4) und 2·(n−4)+1** (z. B. Scan 41 = S. 74–75). In der App rechnet das
`SK.bookPages(n, 2)` um (Quelle `SK.bookSrc2(n)`). Scan 3–4: „Content and Guidance“ (S. i–ii, gleicher Inhalt wie in
Band 1) und Inhaltsverzeichnis (S. 1). Englische Ausgabe März 2008, Aufsicht Motokuni Sugiura. Anders als in Band 1
liegen die Scan-Bilder richtig auf der Seite, und es gibt eine Textebene; die Werkzeuge in `tools/kata-pdf/` lesen
Band 2 mit `KATA_VOL=2` (PDF als `Karate-do-kata-volume-2.pdf` im Hauptordner, nie committen).

| Kapitel | Buchseiten | Scan-Seiten | Fußskizze (Scan) |
|---|---|---|---|
| Hangetsu | 74–111 | 41–59 | 58–59 |

### Hangetsu (S. 74–111, Scan 41–59)
- 41 Bewegungen, Kiai bei 11 und 40. Yoi: Hachiji-dachi, Fäuste vor den Oberschenkeln. Naore: rechter Fuß bleibt,
  linker geht zurück. Enbusen: Kreuz (Scan 58–59).
- Hinweise im Buch:
  - 1 (Scan 41): Halbmondschritt – das rechte Bein trägt, der linke Fuß gleitet im Bogen von innen nach außen vor;
    Unterarme kreuzen vor dem Bauch, Uchi-uke mit dem Gefühl, die Fäuste auseinanderzudrücken; Hände und Füße enden
    gleichzeitig, erhöhte dynamische Spannung. Hangetsu-dachi: etwas kürzer als Zenkutsu-dachi, Knie und
    Oberschenkelinnenseiten zur Mitte gespannt, die Sohlen greifen den Boden.
  - 2 (Scan 42): Hüftdrehung und Hände im Takt der Atmung – 1 beim Einatmen, 2 beim Ausatmen.
  - 6 (Scan 44): Die Kata hieß früher Seshan; Hangetsu (Halbmond) wegen der Halbkreise von Händen und Füßen
    (nach Erinnerungen an Funakoshis Unterricht).
  - 7–8 (Scan 44): Jishi-ippon-ken (Zeigefinger halb gebeugt, vom Daumen gestützt); langsam unter die Brust zurück
    (Ryo-chichi-shita), dann Doppelstoß nach vorne. Bedeutung: Befreiung aus einem Griff von hinten (Ellbogen zur Seite
    bzw. Schlag auf die Handrücken); 8 zielt auf einen Vitalpunkt zwischen 5. und 6. Rippe. Langsam und kraftvoll.
  - 9 (Scan 45): Kaisho Yama-gamae – Handgelenke kreuzen vor dem Gesicht, Unterarme senkrecht neben dem Gesicht,
    Ellbogen auf Schulterhöhe; Befreiung, indem die Ellbogen senkrecht hochgehen.
  - 10 (Scan 45): Ryote Ryogawa Gedan-kakiwake – Hände seitlich nach unten; Bedeutung: Handkante in den Unterbauch oder
    Haiwan-Abwehr Jodan mit anschließender Chudan-Ablenkung.
  - 11 (Scan 45–46): schnelle Wendung links herum nach hinten (Ura-shomen) mit Kiai; Zeigefinger gestreckt, die übrigen
    Finger leicht gebeugt (Kyohan, Best Karate).
  - 12, 14, 16 (Scan 46–48): Tsukami mit Koko (Hand in C-Form) – Chudan-Angriff mit Uchi-uke abwehren und das
    Handgelenk greifen; der Ellbogen bleibt in der Körperlinie. Langsam und kraftvoll.
  - 18–19, 21–22, 24–25 (Scan 48–51): Ren-zuki. 20 (Scan 49): Hidari-e Yori-ashi, links herum.
  - 23 (Scan 50): beide Füße gleiten etwas nach rechts Richtung Ura-shomen, der rechte führt im Halbmond.
  - 26, 32, 38 (Scan 51–56): Kokutsu-dachi mit Uraken Tate-mawashi-uchi – Sohle ans Standknie, Knie zur Brust, Faust und
    Fuß langsam im großen senkrechten Kreis. Kyohan: die Hand des Gegners treffen; Best Karate: das hintere Bein vor
    einem Kekomi in Sicherheit bringen und beim Aufsetzen Uraken Jodan.
  - 27, 33 (Scan 52, 54): Kreuzschritt leise und langsam; Kyohan: die Faust ist gegriffen, man folgt dem Zug.
  - 28, 34 (Scan 52, 54): Mae-geri mit dem Fußballen vor der Faust, die Faust zieht zur anderen Schulter; Kyohan: Tritt
    gegen die Hand des Gegners, Befreiung des Arms.
  - 31, 37 (Scan 53, 55): Age-uke in Hanmi, Handgelenk etwa eine Faust vor der Stirn.
  - 39–40 (Scan 56–57): Mikazuki-geri in die linke Hand (die Hand bleibt), Landung hinten, Chudan-zuki mit Kiai –
    fließend; Kyohan: der Stoß trifft dort, wo vorher die linke Faust war.
  - 41 (Scan 57): Neko-ashi-dachi mit Ryo-teisho Gedan Awase-uke – rechter Fuß etwas zurück, linker zieht heran, Hüfte
    über die rechte Ferse; Handgelenke kräftig nach außen gebeugt, gegen das Schienbein eines Tritts. Langsam und
    kraftvoll.

<!-- ablauf:hangetsu -->
| Nr | Stand | Technik | Fußarbeit | Richtung | Scan-S. |
|---|---|---|---|---|---|
| 1 | Hidari Ashi-mae Hangetsu-dachi | Hidari Chudan Uchi-uke (Halbmondschritt, Einatmen) | Rechtes Bein trägt und dreht nach innen, linker Fuß gleitet im Halbmond (Bogen von innen nach außen) nach vorne – Einatmen | vorne | 41 |
| 2 | Hidari Ashi-mae Hangetsu-dachi | Migi Chudan Gyaku-zuki (Ausatmen) | Stand bleibt – Ausatmen | vorne | 42 |
| 3 | Migi Ashi-mae Hangetsu-dachi | Migi Chudan Uchi-uke (Halbmondschritt) | Linkes Bein trägt und dreht nach innen, rechter Fuß gleitet im Halbmond nach vorne | vorne | 42 |
| 4 | Migi Ashi-mae Hangetsu-dachi | Hidari Chudan Gyaku-zuki | Stand bleibt | vorne | 43 |
| 5 | Hidari Ashi-mae Hangetsu-dachi | Hidari Chudan Uchi-uke (Halbmondschritt) | Rechtes Bein trägt und dreht nach innen, linker Fuß gleitet im Halbmond nach vorne | vorne | 43 |
| 6 | Hidari Ashi-mae Hangetsu-dachi | Migi Chudan Gyaku-zuki | Stand bleibt | vorne | 44 |
| 7 | Hidari Ashi-mae Hangetsu-dachi | Ryo-jishi-ippon-ken Ryo-chichi-shita (Fäuste unter die Brust zurückziehen) – langsam | Langsam: Stand bleibt | vorne | 44 |
| 8 | Hidari Ashi-mae Hangetsu-dachi | Ryo-jishi-ippon-ken Chudan Morote-zuki – langsam | Langsam: Stand bleibt | vorne | 44 |
| 9 | Hidari Ashi-mae Hangetsu-dachi | Kaisho Yama-gamae – langsam | Langsam: Stand bleibt | vorne | 45 |
| 10 | Hidari Ashi-mae Hangetsu-dachi | Ryote Ryogawa Gedan-kakiwake – langsam | Langsam: Stand bleibt | vorne | 45 |
| 11 | Hidari Ashi-mae Hangetsu-dachi | Migi Chudan Uchi-uke + Hidari Gedan-uke (Wendung nach hinten (Ura-shomen), Zeigefinger gestreckt) – **Kiai** | Linkes Bein trägt, rechter Fuß gleitet am linken vorbei nach vorne, Wendung links herum nach hinten (Ura-shomen) – Kiai | Start, Wendung ½ links herum | 45 |
| 12 | Hidari Ashi-mae Hangetsu-dachi | Usho Tsukami (Koko (Hand in C-Form)) – langsam | Langsam: Stand bleibt | Start | 46 |
| 13 | Migi Ashi-mae Hangetsu-dachi | Hidari Chudan Uchi-uke + Migi Gedan-uke (Halbmondschritt) | Linkes Bein trägt und dreht nach innen, rechter Fuß gleitet im Halbmond nach vorne | Start | 46 |
| 14 | Migi Ashi-mae Hangetsu-dachi | Sasho Tsukami (Koko (Hand in C-Form)) – langsam | Langsam: Stand bleibt | Start | 47 |
| 15 | Hidari Ashi-mae Hangetsu-dachi | Migi Chudan Uchi-uke + Hidari Gedan-uke (Halbmondschritt) | Rechtes Bein trägt und dreht nach innen, linker Fuß gleitet im Halbmond nach vorne | Start | 47 |
| 16 | Hidari Ashi-mae Hangetsu-dachi | Usho Tsukami (Koko (Hand in C-Form)) – langsam | Langsam: Stand bleibt | Start | 48 |
| 17 | Migi Ashi-mae Hangetsu-dachi | Migi Chudan Uchi-uke (Halbmondschritt nach rechts) | Linkes Bein trägt und dreht, rechter Fuß gleitet im Halbmond nach rechts – Viertelwendung rechts herum | links, Wendung ¼ rechts herum | 48 |
| 18 | Migi Ashi-mae Hangetsu-dachi | Hidari Chudan Gyaku-zuki – fließend weiter | Stand bleibt | links | 48 |
| 19 | Migi Ashi-mae Hangetsu-dachi | Uken Chudan-zuki (Saken Hidari Koshi) (Ren-zuki) | Stand bleibt | links | 49 |
| 20 | Hidari Ashi-mae Hangetsu-dachi | Hidari Chudan Uchi-uke (Hidari-e Yori-ashi) | Hidari-e Yori-ashi: Wendung links herum, beide Füße gleiten nach rechts (in Blickrichtung) | rechts, Wendung ½ links herum | 49 |
| 21 | Hidari Ashi-mae Hangetsu-dachi | Migi Chudan Gyaku-zuki – fließend weiter | Stand bleibt | rechts | 49 |
| 22 | Hidari Ashi-mae Hangetsu-dachi | Saken Chudan-zuki (Uken Migi Koshi) (Ren-zuki) | Stand bleibt | rechts | 50 |
| 23 | Migi Ashi-mae Hangetsu-dachi | Migi Chudan Uchi-uke (Beide Füße gleiten, rechter Fuß im Halbmond Richtung Ura-shomen) | Beide Füße gleiten etwas nach rechts Richtung Ura-shomen, der rechte führt im Halbmond – Viertelwendung rechts herum | Start, Wendung ¼ rechts herum | 50 |
| 24 | Migi Ashi-mae Hangetsu-dachi | Hidari Chudan Gyaku-zuki – fließend weiter | Stand bleibt | Start | 50 |
| 25 | Migi Ashi-mae Hangetsu-dachi | Uken Chudan-zuki (Saken Hidari Koshi) (Ren-zuki) | Stand bleibt | Start | 51 |
| 26 | Migi Kokutsu-dachi | Hidari Uraken Tate-mawashi-uchi (Uken Migi Koshi) (Blick nach vorne (Shomen), Fuß und Faust im großen Kreis) – langsam | Langsam: Rechter Fuß bleibt und dreht, Blick nach vorne (Shomen) – linker Fuß kommt ans rechte Knie und landet im großen Kreis vorne | vorne, Wendung ½ links herum | 51 |
| 27 | Migi Ashi-mae Kosa | Rechter Fuß kreuzt leise vor dem linken – langsam | Langsam und leise: Linkes Bein trägt, rechter Fuß kreuzt vor dem linken nach vorne | vorne | 52 |
| 28 | Migi Ashi-dachi | Hidari Chudan Mae-geri-keage (Saken Migi Kata) | Gewicht aufs rechte Bein, linker Fuß tritt Mae-geri und zieht zurück | vorne | 52 |
| 29 | Hidari Ashi-mae Hangetsu-dachi | Saken Gedan-zuki | Rechtes Bein trägt, linker Fuß setzt nach dem Tritt vorne auf | vorne | 53 |
| 30 | Hidari Ashi-mae Hangetsu-dachi | Migi Chudan Gyaku-zuki | Stand bleibt | vorne | 53 |
| 31 | Hidari Ashi-mae Hangetsu-dachi | Hidari Jodan Age-uke (Hanmi) | Stand bleibt – Hüfte in Hanmi | vorne | 53 |
| 32 | Hidari Kokutsu-dachi | Migi Uraken Tate-mawashi-uchi (Saken Hidari Koshi) (Blick nach hinten (Ura-shomen), Fuß und Faust im großen Kreis) – langsam | Langsam: Linker Fuß bleibt und dreht, Blick nach hinten (Ura-shomen) – rechter Fuß kommt ans linke Knie und landet im großen Kreis hinten | Start, Wendung ½ rechts herum | 53 |
| 33 | Hidari Ashi-mae Kosa | Linker Fuß kreuzt leise vor dem rechten – langsam | Langsam und leise: Rechtes Bein trägt, linker Fuß kreuzt vor dem rechten nach vorne | Start | 54 |
| 34 | Hidari Ashi-dachi | Migi Chudan Mae-geri-keage (Uken Hidari Kata) | Gewicht aufs linke Bein, rechter Fuß tritt Mae-geri und zieht zurück | Start | 54 |
| 35 | Migi Ashi-mae Hangetsu-dachi | Uken Gedan-zuki | Linkes Bein trägt, rechter Fuß setzt nach dem Tritt vorne auf | Start | 55 |
| 36 | Migi Ashi-mae Hangetsu-dachi | Hidari Chudan Gyaku-zuki | Stand bleibt | Start | 55 |
| 37 | Migi Ashi-mae Hangetsu-dachi | Migi Jodan Age-uke (Hanmi) | Stand bleibt – Hüfte in Hanmi | Start | 55 |
| 38 | Migi Kokutsu-dachi | Hidari Uraken Tate-mawashi-uchi (Uken Migi Koshi) (Blick nach vorne (Shomen), Fuß und Faust im großen Kreis) – langsam | Langsam: Rechter Fuß bleibt und dreht, Blick nach vorne (Shomen) – linker Fuß kommt ans rechte Knie und landet im großen Kreis vorne | vorne, Wendung ½ links herum | 56 |
| 39 | Hidari Ashi-dachi | Sasho-ni Migi Chudan Mikazuki-geri (im Buch: Mikazuki-geri Sasho-ate) – fließend weiter | Gewicht aufs linke Bein, Hüfte dreht links herum, rechter Fuß tritt Mikazuki-geri in die linke Hand | vorne | 56 |
| 40 | Hidari Ashi-mae Hangetsu-dachi | Uken Chudan-zuki (Saken Hidari Koshi) – **Kiai** | Linker Fuß bleibt, rechter Fuß setzt nach dem Tritt hinten auf – Kiai | vorne | 57 |
| 41 | Hidari Ashi-mae Neko-ashi-dachi | Ryo-teisho Gedan Awase-uke – langsam | Langsam: Rechter Fuß gleitet etwas zurück, linker Fuß zieht heran – Neko-ashi-dachi | vorne | 57 |
<!-- /ablauf -->
