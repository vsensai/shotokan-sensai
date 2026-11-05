"""OCR aller Scan-Seiten mit Lage jeder Zeile (für einzelskizzen.py: Überschriften der Bewegungen und Text dazu).

Ergebnis: tools/out/ocr_boxes.json = {Seite: [[x, y, Text], …]} in Bildpunkten des Scans auf Breite 1757.
Band 2 (KATA_VOL=2) hat eine Textebene: dann kommen die Zeilen von dort (ohne OCR) nach tools/out/ocr_boxes_v2.json.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from scans import ROOT, VOL, open_pdf, page_image  # noqa: E402

OUT = ROOT / "tools" / "out"
WIDTH = 1757


def text_layer(first, last):
    """Band 2: Zeilen aus der Textebene, Lage umgerechnet auf die Scan-Breite 1757 (das Scan-Bild füllt die Seite).
    Die Textebene teilt manche Überschrift in Stücke („ELEVENTH“ und „MOVEMENT“): Stücke auf gleicher Höhe werden verbunden."""
    doc = open_pdf()
    res = {}
    for p in range(first, last + 1):
        page = doc[p - 1]
        k = WIDTH / page.rect.width
        half = page.rect.width / 2
        parts = []
        for b in page.get_text("dict")["blocks"]:
            for ln in b.get("lines", []):
                t = " ".join(s["text"] for s in ln["spans"]).strip()
                if t:
                    parts.append(list(ln["bbox"]) + [t])
        parts.sort(key=lambda r: (r[0] >= half, round(r[1] / 4), r[0]))
        rows = []
        for x0, y0, x1, y1, t in parts:
            last_row = rows[-1] if rows else None
            if last_row and (last_row[0] >= half) == (x0 >= half) and abs(last_row[1] - y0) < 4 and 0 <= x0 - last_row[2] < 60:
                last_row[2] = x1
                last_row[4] += " " + t
            else:
                rows.append([x0, y0, x1, y1, t])
        out = []
        for x0, y0, _, _, t in rows:
            t = re.sub(r"\s+", " ", t)
            # Das schwarze Kästchen vor REI, YOI, NAORE liest die Textebene als „Il“, „II“ o. Ä.
            m = re.match(r"^[^A-Z]*(?:[IlL|!]{1,2})?\s*(REI|[YV]O[Il1]|NAORE)$", t)
            if m:
                t = "YOI" if m[1].endswith(("I", "l", "1")) and m[1][1] == "O" else m[1]
            # Nummernkästchen vor „… MOVEMENT“: nur das Ordnungswort behalten
            m = re.search(r"([A-Z]+(?:\s*-\s*[A-Z]+)?)\s+MOVEMENT$", t)
            if m:
                t = re.sub(r"\s*-\s*", "-", m[1]) + " MOVEMENT"
            # Zeichen, die die Textebene in den Skizzen „liest“ (kein Wort aus mindestens vier Buchstaben), weglassen
            if t not in ("REI", "YOI") and not re.search(r"[A-Za-z]{4}", t):
                continue
            out.append([round(x0 * k), round(y0 * k), t])
        res[str(p)] = out
    (OUT / "ocr_boxes_v2.json").write_text(json.dumps(res))
    print("Textebene:", len(res), "Seiten")


def main(first=1, last=176):
    OUT.mkdir(parents=True, exist_ok=True)
    if VOL == 2:
        return text_layer(first, min(last, 87))
    from rapidocr_onnxruntime import RapidOCR
    path = OUT / "ocr_boxes.json"
    res = json.loads(path.read_text()) if path.exists() else {}
    doc = open_pdf()
    engine = RapidOCR()
    for p in range(first, last + 1):
        if str(p) in res:
            continue
        img = page_image(doc, p, gray=False)
        k = WIDTH / img.shape[1]
        found, _ = engine(img)
        res[str(p)] = [[round(min(q[0] for q in box) * k), round(min(q[1] for q in box) * k), text] for box, text, _ in (found or [])]
        path.write_text(json.dumps(res))
        print(p, len(res[str(p)]), flush=True)


if __name__ == "__main__":
    main(*[int(a) for a in sys.argv[1:]])
