"""Vermisst die Fußskizzen unter den einzelnen Bewegungen (nicht die Übersicht am Ende jeder Kata).

Aufruf: python3 tools/kata-pdf/einzelskizzen.py
Ausgabe: tools/out/einzelskizzen.json und je Scan-Seite ein Kontrollbild tools/out/einzel_SEITE.png.

Im Buch steht unter fast jeder Bewegung eine kleine Skizze: ausgefüllte Abdrücke = Füße am Ende der Bewegung, umrandete
Abdrücke = Platz eines Fußes vorher (gepunktete Pfeile zeigen den Weg, kleine gebogene Pfeile ein Drehen auf der Stelle).
Die Skizzen haben keine Embusen-Linien und sind schematisch (Abstände groß im Verhältnis zum Fuß, Maßstab je Kata
etwas verschieden); als Einheit dient die Länge eines Fußabdrucks. Oben in der Skizze = vorne (Shomen), wie in der Kata-Ansage.

Zuordnung: Die Überschriften (Rei, Yoi, „… MOVEMENT“, Naore) kommen aus der OCR mit Zeilenlage (ocr_boxes.py, vorher
laufen lassen). Jede Skizze gehört zur letzten Überschrift davor in Lesereihenfolge (linke Buchseite, dann rechte).
Abdrücke, zwischen denen keine Textzeile liegt, bilden eine Skizze. Die Übersichtsseiten am Ende jeder Kata bleiben außen vor.
Band 2 (KATA_VOL=2, nur Hangetsu): Zeilen aus der Textebene (ocr_boxes.py schreibt dann ocr_boxes_v2.json),
Ergebnis nach tools/out/einzelskizzen_v2.json.
"""
import json
import math
import re
import sys
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from scans import ROOT, VOL, open_pdf, page_image  # noqa: E402
from embusen import find_cells  # noqa: E402

OUT = ROOT / "tools" / "out"
WIDTH = 1757  # Breite der meisten Scans; kleinere werden darauf gebracht
FIRST, LAST = 6, 174
# Kata in Buchreihenfolge mit Zahl der Bewegungen
KATA = [("heian-shodan", 21), ("heian-nidan", 26), ("heian-sandan", 20), ("heian-yondan", 27), ("heian-godan", 23),
        ("tekki-shodan", 29), ("bassai-dai", 42), ("kanku-dai", 65), ("jion", 47), ("enpi", 37)]
SUFFIX = ""
if VOL == 2:  # aus Band 2 nur Hangetsu (Scan-Seiten 41–58)
    FIRST, LAST = 41, 58
    KATA = [("hangetsu", 41)]
    SUFFIX = "_v2"
# Band 2 druckt die Einzelskizzen größer (Fußabdruck etwa 85 statt 60 Bildpunkte lang)
BIG = 1.35 if VOL == 2 else 1.0


def render(doc, p):
    img = page_image(doc, p)
    if img.shape[1] != WIDTH:
        img = cv2.resize(img, (WIDTH, round(img.shape[0] * WIDTH / img.shape[1])), interpolation=cv2.INTER_AREA)
    return img


def shape_of(mask_pts):
    """Schwerpunkt, Zehenrichtung (breiteres Ende), Länge und Breite eines Abdrucks aus seinen Pixeln (x, y)."""
    xs, ys = mask_pts
    cx, cy = xs.mean(), ys.mean()
    pts = np.stack([xs - cx, ys - cy], 1).astype(float)
    ev, evec = np.linalg.eigh(pts.T @ pts / len(pts))
    ax = evec[:, 1]
    proj = pts @ ax
    perp = pts @ np.array([-ax[1], ax[0]])
    lo, hi = proj < np.percentile(proj, 30), proj > np.percentile(proj, 70)
    wlo = np.abs(perp[lo]).mean() if lo.any() else 0
    whi = np.abs(perp[hi]).mean() if hi.any() else 0
    if wlo > whi:
        ax = -ax
    return {"cx": float(cx), "cy": float(cy), "dir": round(math.degrees(math.atan2(ax[0], -ax[1]))) % 360,
            "len": float(proj.max() - proj.min()), "wid": float(perp.max() - perp.min()),
            "sure": round(abs(wlo - whi) / max(wlo, whi, 1e-6), 2)}


UNITS = ["", "FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH", "SIXTH", "SEVENTH", "EIGHTH", "NINTH", "TENTH", "ELEVENTH",
         "TWELFTH", "THIRTEENTH", "FOURTEENTH", "FIFTEENTH", "SIXTEENTH", "SEVENTEENTH", "EIGHTEENTH", "NINETEENTH"]
TENS = {"TWENTY": 20, "THIRTY": 30, "FORTY": 40, "FIFTY": 50, "SIXTY": 60}
TENTHS = {"TWENTIETH": 20, "THIRTIETH": 30, "FORTIETH": 40, "FIFTIETH": 50, "SIXTIETH": 60}


def ordinal(word):
    w = word.upper().replace(" ", "-").strip("-")
    if w in UNITS:
        return UNITS.index(w)
    if w in TENTHS:
        return TENTHS[w]
    a, _, b = w.partition("-")
    if a in TENS and b in UNITS:
        return TENS[a] + UNITS.index(b)
    return None


def ocr_headers(lines):
    """Überschriften aus der OCR: (x, y, Name) mit Name 'rei', 'yoi', 'naore' oder Bewegungsnummer als Text.
    Die OCR liest die Nummer im Kästchen oft falsch und lässt Leerzeichen weg – maßgeblich ist das Ordnungswort."""
    out = []
    for x, y, text in lines:
        t = text.strip()
        if t.upper().endswith("MOVEMENT") and t.upper() == t and len(t) < 40:
            w = re.sub(r"[^A-Z-]", "", t.upper()[:-8])
            n = next((ordinal(w[i:]) for i in range(len(w)) if ordinal(w[i:]) is not None), None)
            if n is not None:
                out.append((x, y, str(n)))
            continue
        t = re.sub(r"^[^A-Z]+", "", t.upper())
        if t == "REI":
            out.append((x, y, "rei"))
        elif re.match(r"^YOI\b", t):
            out.append((x, y, "yoi"))
        elif re.match(r"^NAORE\b", t):
            out.append((x, y, "naore"))
    return out


def filled_feet(gray, skip):
    feet = cv2.morphologyEx((gray < 120).astype(np.uint8), cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(feet)
    out = []
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if a < 120 or max(w, h) > 90 * BIG or a > 0.8 * w * h and abs(w - h) <= 8:  # Kästchen der Überschriften
            continue
        if x < 40 or x + w > gray.shape[1] - 40 or y < 20 or y + h > gray.shape[0] - 20:
            continue  # Schatten am Seitenrand
        if any(c0 <= x + w / 2 <= c1 and r0 <= y + h / 2 <= r1 for c0, r0, c1, r1 in skip):
            continue
        ys, xs = np.nonzero(lab[y:y + h, x:x + w] == i)
        f = shape_of((xs + x, ys + y))
        if np.median(gray[ys + y, xs + x]) > 95 or not 20 <= f["len"] <= 80 * BIG or f["wid"] > 40 * BIG:
            continue  # graue Ränder des Scans, keine Fußform
        f.update(area=int(a), box=[int(x), int(y), int(w), int(h)])
        out.append(f)
    return out


def outline_feet(gray, fill_mask, skip):
    """Umrandete Abdrücke: Löcher in dünnen Linien, groß wie ein Fuß. Teilweise verdeckte Umrisse fehlen hier."""
    ink = ((gray < 170).astype(np.uint8) * 255)
    ink[fill_mask > 0] = 255  # ausgefüllte Füße schließen Umrisse, die an ihnen enden
    cnts, hier = cv2.findContours(ink, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    out = []
    if hier is None:
        return out
    for i, c in enumerate(cnts):
        if hier[0][i][3] < 0:
            continue  # nur Löcher
        a = cv2.contourArea(c)
        x, y, w, h = cv2.boundingRect(c)
        if not 120 <= a <= 1400 * BIG * BIG or max(w, h) < 22 or max(w, h) > 75 * BIG:
            continue
        if any(c0 <= x + w / 2 <= c1 and r0 <= y + h / 2 <= r1 for c0, r0, c1, r1 in skip):
            continue
        m = np.zeros((h, w), np.uint8)
        cv2.drawContours(m, [c - [x, y]], -1, 1, -1)
        ys, xs = np.nonzero(m)
        f = shape_of((xs + x, ys + y))
        if f["len"] < 1.4 * f["wid"]:
            continue  # rund (Buchstaben, Kringel), kein Fuß
        f.update(area=int(a), box=[int(x), int(y), int(w), int(h)])
        out.append(f)
    return out


def group(feet, lines, half):
    """Abdrücke einer Buchseite, zwischen denen keine Textzeile liegt, bilden eine Skizze."""
    groups = []
    for side in (0, 1):
        fs = sorted([f for f in feet if (f["cx"] >= half) == bool(side)], key=lambda f: f["cy"])
        ys = [y + 12 for x, y, t in lines if (x >= half) == bool(side) and len(t.strip()) >= 4]
        for f in fs:
            if groups and groups[-1][0] == side and not any(groups[-1][1][-1]["cy"] < y < f["cy"] for y in ys) and f["cy"] - groups[-1][1][-1]["cy"] < 260:
                groups[-1][1].append(f)
            else:
                groups.append((side, [f]))
    return [g for _, g in groups]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    doc = open_pdf()
    ocr = json.loads((OUT / f"ocr_boxes{SUFFIX}.json").read_text())  # aus ocr_boxes.py
    stream = []  # Überschriften und Skizzen in Lesereihenfolge
    for p in range(FIRST, LAST + 1):
        gray = render(doc, p)
        half = gray.shape[1] / 2
        cells = find_cells(cv2.resize(gray, (2273, round(gray.shape[0] * 2273 / gray.shape[1]))))
        k = WIDTH / 2273
        skip = [(c0 * k - 10, r0 * k - 10, c1 * k + 10, r1 * k + 10) for c0, r0, c1, r1 in cells]
        if cells:  # Übersichtsseite: Bereich der Rahmen ganz auslassen (auch die Zwischenräume)
            skip = [(min(s[0] for s in skip), min(s[1] for s in skip), max(s[2] for s in skip), max(s[3] for s in skip))]
        hs = ocr_headers(ocr.get(str(p), []))
        hs = [h for h in hs if not any(c0 - 60 <= h[0] <= c1 + 60 and r0 - 60 <= h[1] <= r1 + 60 for c0, r0, c1, r1 in skip)]
        fill = filled_feet(gray, skip)
        fmask = np.zeros_like(gray)
        for f in fill:
            x, y, w, h = f["box"]
            fmask[y:y + h, x:x + w] = (gray[y:y + h, x:x + w] < 120) * 255
        fmask = cv2.dilate(fmask, np.ones((3, 3), np.uint8))
        outl = outline_feet(gray, fmask, skip)
        for f in fill:
            f["kind"] = "voll"
        for f in outl:
            f["kind"] = "umriss"
        items = [{"t": "h", "name": nm, "x": x, "y": y, "page": p} for x, y, nm in hs]
        for g in group(fill + outl, ocr.get(str(p), []), half):
            if not any(f["kind"] == "voll" for f in g):
                continue  # nur Umrisse: meist Buchstaben o. Ä.
            xs = [f["box"][0] for f in g] + [f["box"][0] + f["box"][2] for f in g]
            ys = [f["box"][1] for f in g] + [f["box"][1] + f["box"][3] for f in g]
            items.append({"t": "s", "page": p, "x": min(xs), "y": min(ys), "box": [min(xs), min(ys), max(xs), max(ys)], "feet": g})
        left =[it for it in items if ((it["box"][0] + it["box"][2]) / 2 if it["t"] == "s" else it["x"]) < half]
        right = [it for it in items if it not in left]
        for side in (left, right):
            stream += sorted(side, key=lambda it: it["y"])
        vis = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
        for it in items:
            if it["t"] == "h":
                cv2.putText(vis, it["name"], (it["x"] - 60, it["y"] + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
                continue
            b = it["box"]
            cv2.rectangle(vis, (b[0] - 6, b[1] - 6), (b[2] + 6, b[3] + 6), (0, 160, 0), 2)
            for f in it["feet"]:
                r = math.radians(f["dir"])
                col = (0, 0, 255) if f["kind"] == "voll" else (255, 0, 255)
                cv2.arrowedLine(vis, (int(f["cx"]), int(f["cy"])), (int(f["cx"] + 25 * math.sin(r)), int(f["cy"] - 25 * math.cos(r))), col, 2, tipLength=0.4)
        cv2.imwrite(str(OUT / f"einzel_{p:03d}.png"), vis)

    # Strom in Kata und Bewegungen zerlegen: Rei, Yoi, 1..N, Naore, Rei (= Ende); danach beginnt die nächste Kata
    res = {}
    ki, cur, name = -1, None, None
    for it in stream:
        if it["t"] == "h":
            name = it["name"]
            if name == "rei" and (cur is None or "naore" in cur and "end" in cur):
                ki += 1
                cur = res.setdefault(KATA[ki][0], {})
            elif name == "rei":
                name = "end"
            if name in cur:
                print(KATA[ki][0], "Überschrift doppelt:", name, "Seite", it["page"], file=sys.stderr)
            cur[name] = {"page": it["page"], "sketches": []}
        elif cur is not None and name:
            cur[name]["sketches"].append(it)
    for kid, n in KATA:
        k = res.get(kid, {})
        names = ["rei", "yoi"] + [str(i) for i in range(1, n + 1)] + ["naore", "end"]
        print(kid, "fehlt:", [m for m in names if m not in k], "ohne Skizze:", [m for m in names if m in k and not k[m]["sketches"]],
              "mehrere:", [m for m in names if m in k and len(k[m]["sketches"]) > 1])
    (OUT / f"einzelskizzen{SUFFIX}.json").write_text(json.dumps(res, indent=1))


if __name__ == "__main__":
    main()
