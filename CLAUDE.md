# Hinweise für Claude

## Git
- Änderungen immer direkt auf `main` committen und pushen – keine Feature-Branches, keine Pull Requests. Das gilt auch dann, wenn die Sitzung einen eigenen Branch (z. B. `ccr-…` oder `claude/…`) vorgibt: dieser Hinweis hat Vorrang.
- Wird eine Sitzung auf einem eigenen Branch gestartet: vor der Arbeit `git checkout main && git pull origin main`, den Sitzungs-Branch lokal löschen und nicht pushen. Ist er schon auf GitHub, ihn dort löschen (oder melden, falls das nicht erlaubt ist).
- Vor dem Push `git fetch origin main` und auf den aktuellen Stand bringen.

## Vor jedem Commit
- `node tools/test/run.js validate` laufen lassen (prüft `tools/test/validate.html` im Browser per Playwright) – muss „OK“ melden.
- `node tools/test/run.js smoke` (`tools/test/smoke.html`) nur direkt vor dem Push laufen lassen, nicht nach jeder Änderung – muss „OK“ melden.
- Tests immer über `tools/test/run.js` starten, kein eigenes Playwright-Skript: Es wartet auf die Fertig-Markierung `data-ergebnis`, bricht bei JavaScript-Fehlern sofort ab und hat ein festes Zeitlimit. Normal dauern validate unter 1 s und smoke etwa 15 s.
- Bei jeder veröffentlichten Änderung die Version mit `node tools/version.js patch|minor|major` hochzählen (setzt Version, Datum, Uhrzeit und `?v=` in `index.html`). Die Version steht im Commit-Titel, z. B. „… (v1.11.1)“.
- Neue Skripte in `index.html`, `tools/test/validate.html` und `tools/test/smoke.html` gleichermaßen eintragen.
- Die Startseite steht zusätzlich fest in `index.html` (für schnelles Laden): Änderungen an `viewStart()` in `js/app.js` dort mitziehen. Grafiken und Lektionstexte nicht beim Start erzeugen, sondern erst bei Bedarf (`learn: () => …`, `SK.util.lazy`).

## Kata-Ansage (Bodenkarte) ändern
- Korrekturen an einer bestimmten Stelle einer Kata möglichst in den Daten dieser Kata (`ansage` in `data/kata-*.js`) machen, nicht in den allgemeinen Regeln in `js/kata-ansage.js` (Stände, Ausgleich, Gewichte). Muss doch eine allgemeine Regel geändert werden, vorher sagen, welche Kata und Stände sie betrifft.
- Vor jedem Commit, der `data/kata-*.js` oder `js/kata-ansage.js` ändert, auch `node tools/skizzen-vergleich.js` laufen lassen (Abgleich mit den Einzelskizzen des Buches, `docs/fussskizzen.md`) – neue Abweichungen über 25° melden.
- Vor jedem Commit, der `data/kata-*.js` oder `js/kata-ansage.js` ändert, `node tools/ansage-vergleich.js` laufen lassen und dem Nutzer melden, welche Kata und Bewegungen sich gegenüber dem letzten Stand verändert haben – auch Folgeänderungen (ein stehender Fuß wandert in allen Bewegungen mit, in denen er steht).

## Inhalte
- App, Texte und Commit-Nachrichten auf Deutsch.
- Kata-Fragen nur aus „Karate-Do Kata Vol. 1“ (JKA) mit gedruckter Buchseite (`SK.bookSrc`). Einzige Ausnahme: Hangetsu aus „Karate-Do Kata Vol. 2“ (`SK.bookSrc2`, Kata-Daten mit `vol: 2`) – weitere Kata aus Band 2 nur nach Rückfrage.
- Neuer Lexikon-Begriff (`data/glossary.js`): Lesung neuer Wortteile in `LESUNG` ergänzen (Hiragana mit langen Vokalen, für die Aussprache) – `validate.html` meldet fehlende.
- Fragen-IDs entstehen aus Lektion, Fragetext und richtiger Antwort (`SK.qb`). `data/legacy-ids.js` ist eingefroren und wird nicht bearbeitet.
- Die Kata-PDFs (Band 1 und 2) und `tools/out/` niemals committen.
- Heft „Karate kompakt“ (Quelle `SK.sources.kompakt`): Wissen steht in `docs/karate-kompakt.md`. Keine Scans, Bilder oder wörtlichen Texte des Heftes ins Repo – nur Fakten in eigenen Worten; Grafiken selbst zeichnen. Für Kata-Inhalte gilt weiter nur das JKA-Buch (Band 1, Hangetsu aus Band 2).

## 3D-Figuren
- Bilder mit ganzer Figur kommen aus `js/figur-posen.js` (Schlüssel wie `tc:age-zuki`). Neue Technik mit Figur: nur die Pose dort ergänzen – keine SVG-Grafik als Rückfall (ohne WebGL 2 bleibt das Bild leer, die Startseite zeigt einen Hinweis). SVG-Grafiken nur, wo keine Figur passt (Fußbilder, Körperwaffen, Fußbewegungen, Schemabilder, Bodenkarte). `validate.html` meldet ein SVG neben einer 3D-Figur als Fehler.
- Nach Änderungen an Posen `tools/test/gfx3d.html` mit WebGL (Playwright: `--use-angle=swiftshader`) ansehen; `validate.html` prüft, dass alle Posen rechenbar sind und Standfüße ihren Platz erreichen.

## Kata als Figur (Kata-Trainer, Ansicht „Figur“)
- `js/kata-figur.js` rechnet die ganze Kata als Bewegung: Füße aus `ansage` (Bodenkarte), Arme und Hüfte aus den Abläufen in `js/figur-posen.js`. Neue Technik einer Kata: in `TECH` dem Lexikon-Ablauf zuordnen, neuer Stand in `STAND`; fehlt die Pose, sie in `js/figur-posen.js` ergänzen.
- Braucht eine Kata einen Ablauf, den das Lexikon so nicht hat (z. B. Tritt in anderer Höhe), kommt er in `SK.fig3dKata` am Ende von `js/figur-posen.js` – nicht in `SK.fig3dDefs`, sonst erschiene er im Lexikon. Fußtritte stehen in `TRITT` (`js/kata-figur.js`).
- Eine Kata erst in `KATA` freigeben, wenn der Nutzer den Ablauf in `labor/kata.html?kata=<id>` gesehen und abgenommen hat. `validate.html` prüft freigegebene Kata (rechenbar, Füße erreichen ihren Platz, nichts springt).

### Neue Kata als Figur – so sind Heian Shodan bis Godan entstanden
Werkzeug: `node tools/kata-figur.js` (`ablauf`, `pruefen`, `stand`, `vergleich`, `bogen` – Hilfe ohne Argumente). Es ist kein Test; die Tests laufen weiter nur über `tools/test/run.js`.
1. **Probelauf, noch nichts ändern:** `node tools/kata-figur.js ablauf <id>` zeigt jede Bewegung und alle Warnungen (fehlende Technik, fehlender Stand). Dazu die Hinweise des Buches in `docs/buch-register.md` und die Fußarbeit in `ansage` lesen. Dem Nutzer kurz melden: was passt schon, was läuft unvollständig, was fehlt – und fragen, ob es losgehen soll.
2. **Vor dem Bauen den Stand festhalten:** `node tools/kata-figur.js stand tools/out/vorher.json` (alle freigegebenen Kata).
3. **Bauen:** Zuerst im Lexikon suchen (`js/figur-posen.js` – viele Abläufe sind schon „wie in Heian …“ gebaut), sonst einen Ablauf in `SK.fig3dKata` ergänzen. Zuordnen in `TECH`/`STAND`/`TRITT` (`js/kata-figur.js`, die Optionen stehen dort im Kommentar: `direkt`, `lang`, `erst`, `schnapp`, `halten`, `vor`, dritter Eintrag für Stand/Hinweis). Aus den Daten kommen: `slow`, Hinweis „Fumikomi“, Fußarbeit „Yori-ashi“, „Sprungschritt“, „Tobikomi“, `look`, `via`. Stand auf einem Bein vor einem Tritt = angezogenes Knie dieses Tritts.
4. **Prüfen:** `node tools/kata-figur.js pruefen <id>` (alle neun Tempi ohne Meldung) und `vergleich tools/out/vorher.json` – freigegebene Kata sollen zahlengleich bleiben; ändert eine allgemeine Regel sie doch, dem Nutzer sagen, welche Kata, welche Bewegungen und um wie viel. Mit `bogen` die Endstellungen und die schwierigen Übergänge aus zwei Blickrichtungen ansehen, bevor der Nutzer sie sieht.
5. **Ins Labor:** Version `patch`, validate, smoke, pushen. Dem Nutzer den Link `labor/kata.html?kata=<id>` geben, was neu gebaut ist und was er sich besonders ansehen soll (alles, was geraten oder vereinfacht ist). Das Labor zeigt unter der Figur den Stand (Version, Uhrzeit) – daran sieht er, ob die Änderung schon angekommen ist.
6. **Korrekturen des Nutzers einarbeiten** (er prüft als Karateka; meist mehrere Runden), jeweils wieder Schritt 4 und 5. Ist eine Angabe der Kata-Daten falsch (z. B. Drehrichtung), dort korrigieren und die Regeln unter „Kata-Ansage ändern“ beachten.
7. **Freigeben erst auf sein Wort:** Kata in `KATA` eintragen, in `tools/test/smoke.js` die „nicht freigegebene Kata“ auf die nächste umstellen, Version `minor`.

Was der Nutzer bisher korrigiert hat (gilt auch für die nächsten Kata):
- Zenkutsu-dachi: hinteres Bein fast durchgedrückt (`REAR`), nicht zu kurz (`MINZK`).
- Schritt mit Fumikomi: erst drehen beide Füße in die Laufrichtung, dann Schritt mit hohem Knie und geraden Knien, erst kurz vor dem Aufstampfen dreht alles in den Stand.
- Yori-ashi: vorderer Fuß geht voraus, der andere zieht sofort nach – nicht beide gleichzeitig (sieht aus wie Schweben).
- Langsame Bewegungen: die Hüfte dreht in einem Zug, keine Gegenbewegung; bleibt der Oberkörper stehen, bewegt sich die Hüfte nicht.
- Eine Technik endet dort, wo sie in der Kata endet (Mikazuki-geri: Fuß bleibt an der Hand; Uraken in Heian Sandan schnappt zurück).
- Bewegungen mit Vorstufe (Angriff im Zenkutsu-dachi vor dem Manji-uke, Wendung auf der Stelle) nicht weglassen, auch wenn die Daten sie nur als Hinweis „Teil 1“ führen.
- Drehrichtungen und Zählung genau prüfen; die Zahl gehört zur fertigen Stellung.

## Buchwissen (ohne PDF)
- Bei Fragen zum Buch oder neuen Kata-Inhalten zuerst `docs/buch-register.md` lesen: Seitenzählung, Kapitel, Zusammenfassungen der allgemeinen Kapitel, Hinweise des Buches je Bewegung und Ablauftabellen aller zehn Kata. Nur Fakten und eigene Worte ins Repo, keine Abschriften aus dem Buch.
- Die Ablauftabellen im Register werden aus den App-Daten erzeugt: nach Änderungen an `seq` oder `ansage` in `data/kata-*.js` `node tools/register-tabellen.js` laufen lassen.
- Fußstellungen je Bewegung (Kata-Ansage) stehen für alle Kata in `ansage` in `data/kata-*.js`, gewonnen aus den Fußskizzen mit `tools/kata-pdf/` (siehe dortige README). Liegt das PDF wieder vor, immer über `tools/kata-pdf/scans.py` lesen – im PDF sind die Scan-Bilder verschoben und werden beim normalen Rendern abgeschnitten. Band 2 (Hangetsu): dieselben Werkzeuge mit `KATA_VOL=2`, Seitenzählung im Register.
