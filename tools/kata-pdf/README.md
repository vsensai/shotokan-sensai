# Kata-PDF auswerten

Python-Skripte, mit denen der Text aus „Karate-Do Kata Vol. 1“ (JKA) für die Kata-Daten in `data/kata-*.js` gewonnen wurde. Für den Betrieb der App werden sie nicht gebraucht.

Voraussetzung: das PDF als `Karate-do-kata-volume-1.pdf` im Hauptordner des Repos. Liegt es in mehreren Teilen vor, die Teile der Reihe nach zusammenfügen, z. B. `python3 -c "import pymupdf,sys; d=pymupdf.open(); [d.insert_pdf(pymupdf.open(f)) for f in sys.argv[1:]]; d.save('Karate-do-kata-volume-1.pdf')" teil1.pdf teil2.pdf teil3.pdf` – es müssen 176 Seiten sein. Alle Ausgaben landen in `tools/out/`. PDF und `tools/out/` sind urheberrechtlich geschützt bzw. daraus abgeleitet, per `.gitignore` ausgeschlossen und dürfen nie committet werden.

| Skript | Zweck | Abhängigkeiten |
|---|---|---|
| `extract_pdf_stdlib.py` | OCR-Textebene des PDFs nach `tools/out/pdf_text.txt` | nur Standardbibliothek |
| `scans.py` | liest die eingebetteten Scan-Bilder (Hilfsmodul für die übrigen Skripte) | `pymupdf`, `opencv-python` |
| `ocr_pdf.py` | OCR aller Scan-Seiten nach `tools/out/pdf_ocr.txt` | `pymupdf`, `rapidocr_onnxruntime` |
| `embusen.py` | vermisst die Fußskizzen: je Bild Linienfigur und Fußabdrücke (Lage, Zehenrichtung) nach `tools/out/embusen_SEITE.json`, dazu ein Kontrollbild | `pymupdf`, `opencv-python` |
| `ocr_boxes.py` | OCR aller Scan-Seiten mit Lage jeder Zeile nach `tools/out/ocr_boxes.json` (für die Einzelskizzen) | `pymupdf`, `rapidocr_onnxruntime` |
| `einzelskizzen.py` | vermisst die Skizzen unter den einzelnen Bewegungen (ausgefüllte und umrandete Abdrücke) und ordnet sie den Bewegungen zu, nach `tools/out/einzelskizzen.json`, dazu Kontrollbilder `einzel_SEITE.png` | `pymupdf`, `opencv-python` |
| `einzel_register.py` | schreibt daraus und aus dem OCR-Text die Tabellen in `docs/fussskizzen.md` (nur Messwerte und eigene Worte) | wie oben, dazu `node` |
| `ansage_build.py` | baut aus den Messwerten und einer Zuordnung je Kata (`spec/*.py`: linker/rechter Fuß, Körperrichtung, Drehung, Fußarbeit) den Ansage-Block | – |
| `ansage_insert.py` | trägt den Ansage-Block in `data/kata-*.js` ein (ersetzt einen vorhandenen) | – |
| `summarize_kata.py` | kompakte Bewegungsübersicht je Kata (`tools/out/kata_summary.txt`) | – |
| `endstellungen.py` | je Seite Bewegungsnummern und Sätze zu Endstellungen | – (nutzt `summarize_kata.py`) |

Reihenfolge: `extract_pdf_stdlib.py` → ggf. `ocr_pdf.py` → `summarize_kata.py` / `endstellungen.py`.
Für die Einzelskizzen: `ocr_boxes.py` → `einzelskizzen.py` → `einzel_register.py`.
Für die Kata-Ansage: `embusen.py SEITE…` → `ansage_build.py spec/KATA.py > tools/out/KATA.js` → `ansage_insert.py data/kata-….js KATA-ID KANA LAUTSCHRIFT SEITE tools/out/KATA.js`.

**Band 2 (nur Hangetsu):** PDF als `Karate-do-kata-volume-2.pdf` in den Hauptordner legen (87 Seiten) und jedem Aufruf
`KATA_VOL=2` voranstellen. Dort liegen die Scan-Bilder richtig auf der Seite und es gibt eine Textebene: `ocr_boxes.py`
liest dann sie statt OCR (nach `tools/out/ocr_boxes_v2.json`, ohne `rapidocr`), `einzelskizzen.py` und
`einzel_register.py` arbeiten nur Scan-Seite 41–58 (Hangetsu) ab und berücksichtigen die größer gedruckten Skizzen.
Ablauf: `KATA_VOL=2 python3 tools/kata-pdf/embusen.py 58 59` → `KATA_VOL=2 python3 tools/kata-pdf/ansage_build.py tools/kata-pdf/spec/hangetsu.py > tools/out/hangetsu.js`
→ `python3 tools/kata-pdf/ansage_insert.py data/kata-hangetsu.js hangetsu はんげつ Hangetsu 58 tools/out/hangetsu.js` (die Zeile `de:` danach entfernen);
Einzelskizzen: `KATA_VOL=2 python3 tools/kata-pdf/ocr_boxes.py 41 58` → `KATA_VOL=2 python3 tools/kata-pdf/einzelskizzen.py` → `KATA_VOL=2 python3 tools/kata-pdf/einzel_register.py`.

Achtung (Band 1): Im PDF liegt jedes Scan-Bild verschoben auf der Seite; beim normalen Rendern (Viewer, `page.get_pixmap`) fehlt deshalb ein großer Teil. Immer über `scans.py` lesen. Aufruf aus dem Hauptordner, z. B. `python3 tools/kata-pdf/extract_pdf_stdlib.py`.
