# Shotokan SensAI

Statische Lern- und Quiz-App (Deutsch) zu Shotokan-Karate nach JKA/DJKB: Etikette, Geschichte, Begriffe, Stände, Kihon, Kumite, detailliertes Kata-Wissen und das DJKB-Prüfungsprogramm (9. Kyu bis 5. Dan).

- Kata-Fragen stammen ausschließlich aus „Karate-Do Kata Vol. 1“ (JKA) und – nur für Hangetsu – aus „Karate-Do Kata Vol. 2“ – mit Angabe der gedruckten Buchseiten.
- **3D-Figuren**: Alle Bilder mit ganzer Figur werden als echte 3D-Figur im Gi gerechnet (eigene WebGL2-Engine ohne Bibliothek, `js/figur3d.js`; Posen in `js/figur-posen.js`; Einbindung in `js/figur-app.js`). Ruhend zeigt jede Karte das Kernbild (bester Moment und Blickwinkel, Ausgangsstellung blass dahinter); antippen und ziehen dreht die Figur, „▶ Bewegung“ und „Phasenbild“ zeigen den Ablauf. Ohne WebGL 2 (oder mit `?svg`) bleiben diese Bilder leer, die Startseite zeigt dann einen Hinweis. SVG-Grafiken gibt es nur noch, wo keine 3D-Figur passt: Fußbilder der Stände, Körperwaffen, Fußbewegungen, Schemabilder (Enbusen, Kumite-Abläufe, Kraftrichtung) und die Bodenkarte der Kata-Ansage.
- Getrennte Bereiche: **Wissen** (alle Inhalte + Lexikon mit Grafiken, Stände als 3D-Figur mit Fußbild, Fußbewegungen als animierte Fußspuren, **Kompakt-Übersicht** je Gürtel zum Drucken unter `#/kompakt`), **Quiz** (Lernpfad, Zufallsmix aus dem Gesamtpool), **Begriffe-Trainer** (Stände, Techniken, Körperwaffen stumpf abfragen), **Prüfungen** (DJKB-Prüfungsprogramm je Gürtel, unterteilt in Kihon, Kata, Kumite und Theorie).
- **Lexikon-Karten**: Mit japanischer Stimme auf dem Gerät liest der Lautsprecher-Knopf den Begriff vor (Lesung in Hiragana je Wortteil, `LESUNG` in `data/glossary.js`). „Kommt vor in …“ listet alle Stellen des Begriffs in den Kata; jede Zahl öffnet den Kata-Trainer bei dieser Bewegung (`#/ansage/<kata>/<bewegung>`). Techniken, die das Buch nur als Kombination beschreibt (Manji-uke = Jodan Uchi-uke + Gedan-uke), findet ein Muster (`MUSTER` in `data/glossary.js`).
- **Karteikarten** (im Begriffe-Trainer, `#/karten` bzw. `#/karten/<kategorie>`): eine Karte mit zwei Seiten, „Umdrehen“ (oder Antippen) dreht sie mit einer kurzen Animation um. Richtung „Bild → Name“: vorn nur das Bild bzw. die Bewegung aus dem Lexikon ohne Namen und Beschreibung, hinten Name, Bedeutung und die Stellen in den Kata. Richtung „Name → Bild“: vorn nur der Name, hinten Bild und Bedeutung. Nach dem Umdrehen schätzt man sich selbst ein; „Nicht gewusst“ kommt in der Runde wieder und landet im Karteikasten der passenden Frage des Begriffe-Trainers (Bildfrage bzw. „Was ist …?“). „Bild → Name“ gibt es nur für Begriffe mit Bild.
- **Kata-Ansage** („Kata-Trainer“, eigener Eintrag „Kata“ in der unteren Leiste, alle zehn Kata aus Band 1 und Hangetsu aus Band 2): zählt die Kata auf Japanisch im Rhythmus des Buches (fließend, langsam, Kiai; wie im Dojo bis 10, dann wieder ab 1), sagt den Kiai mit an, zeigt jede Stellung auf einer Bodenkarte von oben nach der Embusen-Skizze im Buch und hält den Bildschirm an. Gezählt wird mit japanischer Stimme, das Tempo lässt sich per Regler von 3× langsamer bis 3× schneller einstellen (Mitte = Training); ohne japanische Stimme läuft die Ansage stumm.
- Lernpfad mit allen Lektionen frei zugänglich, Wiederholung nach Karteikasten-Prinzip.
- Fortschritt nur lokal im Browser (localStorage), Export/Import unter „Fortschritt“.

## Lokal starten

`index.html` im Browser öffnen – kein Build, kein Server nötig.

## Werkzeuge

- `tools/test/validate.html` – prüft Datenkonsistenz (Fragen, Kata, Prüfungsprogramm); vor jedem Commit.
- `tools/test/smoke.html` – klickt automatisch durch Prüfungsseiten, Lektionen und Quiz; löscht dabei den lokalen Fortschritt und läuft deshalb nur lokal (`file://` oder `localhost`).
- `tools/test/gfx.html` – Vorschau aller SVG-Grafiken.
- `tools/test/gfx3d.html` – alle 3D-Figuren als Kernbild auf einen Blick (`?f=tc:` filtert).
- `labor/figuren.html` – Figuren-Labor zum Ausprobieren von Stilen und Abläufen.
- `tools/version.js` – Versionsnummer setzen (siehe unten).
- `tools/kata-pdf/` – Python-Skripte, die Text und Fußskizzen aus dem Kata-Buch auswerten (siehe README dort).
- `tools/register-tabellen.js` – schreibt die Ablauftabellen der Kata aus den App-Daten in `docs/buch-register.md`.
- `docs/karate-kompakt.md` – Register zum Heft „Karate kompakt“ (Stände, Techniken, Fußbewegungen) in eigenen Worten, mit Hinweis, wo das Wissen in der App steht.
- `docs/buch-register.md` – Nachschlage-Register zum Buch (Seiten, Kapitel, Hinweise je Bewegung, Abläufe) in eigenen Worten, damit das PDF nicht nötig ist.

## Neue Version veröffentlichen

`node tools/version.js patch` (bzw. `minor`, `major` oder z. B. `1.12.0`) setzt Versionsnummer, Datum und Uhrzeit in `js/core.js` und hängt `?v=<Version>` an alle Dateien in `index.html`, damit Browser nach dem Update keine alten Dateien verwenden. Ohne Argument prüft das Skript, ob `index.html` zur Version passt.

## Ladezeit

- Die Startseite (Leitspruch und Karten) steht fest in `index.html` und erscheint, bevor die Skripte geladen sind. Wird `viewStart()` in `js/app.js` geändert, `index.html` mitziehen – `tools/test/smoke.html` meldet Abweichungen.
- Grafiken, Lektionstexte und Quizbilder entstehen erst beim Öffnen (`learn: () => …` und `SK.util.lazy`), nicht beim Start.
- Kein Offline-Speicher: Der Service Worker aus v1.41.0 ist wieder abgeschaltet. `sw.js` bleibt nur, damit Geräte, die ihn installiert haben, ihn wieder entfernen – nicht löschen.

## Fragen-IDs

Fragen-IDs ergeben sich aus Lektion, Fragetext und richtiger Antwort (`SK.qb` in `js/core.js`). Fragen dürfen daher eingefügt, gelöscht und umsortiert werden, ohne dass der gespeicherte Fortschritt bei anderen Fragen landet. Wird Fragetext oder Lösung geändert, gilt die Frage als neu. `data/legacy-ids.js` ist eingefroren und überträgt nur alte Speicherstände (bis v1.10.1, laufende Nummern) einmalig auf die neuen IDs.

## Veröffentlichen auf GitHub Pages

1. In VS Code bei GitHub anmelden und „Publish to GitHub“ wählen (öffentliches Repository).
2. Auf github.com: **Settings → Pages → Branch `main`, Ordner `/ (root)`**.
3. Die Seite ist danach unter `https://<benutzername>.github.io/<repo>/` erreichbar.

Das Kata-PDF und alle daraus extrahierten Texte (`tools/out/`) sind per `.gitignore` ausgeschlossen und dürfen nicht veröffentlicht werden.

## Quellen

- Japan Karate Association: *Karate-Do Kata Vol. 1* (2003)
- Japan Karate Association: *Karate-Do Kata Vol. 2* (2008) – daraus nur Hangetsu
- DJKB-Prüfungsordnung (Stand Juli 2013), DJKB-Übersichten Prüfungsprogramm Kihon/Kata/Kumite – djkb.com
- Fiore Tartaglia: *Karate kompakt – Grundlagen im Überblick* (aus „Die Karate-Essenz“) – nur Fakten in eigenen Worten, keine Bilder oder Texte des Heftes; die Grafiken sind eigene Zeichnungen
- Allgemeines Wissen u. a. nach Wikipedia (Shōtōkan, Gichin Funakoshi, Japan Karate Association)

Prüfungsangaben ohne Gewähr – maßgeblich ist die jeweils gültige DJKB-Prüfungsordnung.
