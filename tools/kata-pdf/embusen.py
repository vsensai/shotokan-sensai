"""Vermisst die Fußskizzen (Embusen) im Kata-PDF: je Bild die Embusen-Linien und die Fußabdrücke.

Aufruf: python3 tools/kata-pdf/embusen.py SEITE [SEITE ...]
Ausgabe: tools/out/embusen_SEITE.json und tools/out/embusen_SEITE.png (Kontrollbild mit Bildnummern und Zehenpfeilen).

Bezug je Bild ist die Linienfigur der Kata (T, I, H …): Ursprung = Mitte ihrer Unterkante, Einheit = halbe Breite
(bei einer rein senkrechten Figur die halbe Höhe). x nach rechts, y nach vorne – wie in der Kata-Ansage.
Je Fuß: x, y (Schwerpunkt), Zehenrichtung in Grad (0 = vorne, im Uhrzeigersinn; das breitere Ende gilt als Zehen).
Welcher Abdruck der linke und welcher der rechte Fuß ist, steht nicht in der Skizze – das ergibt sich aus dem Text.
Sich berührende Füße (z. B. Heisoku-dachi) erscheinen als ein großer Abdruck (area etwa doppelt so groß).
"""
import json
import math
import sys
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from scans import ROOT, VOL, open_pdf, page_image  # noqa: E402

OUT = ROOT / "tools" / "out"
WIDTH = 2273  # alle Seiten auf gleiche Breite bringen, die Scans sind unterschiedlich groß


def render(doc, page_no: int) -> np.ndarray:
    img = page_image(doc, page_no)
    return cv2.resize(img, (WIDTH, round(img.shape[0] * WIDTH / img.shape[1])), interpolation=cv2.INTER_AREA)


def comps(mask):
    n, lab, st, _ = cv2.connectedComponentsWithStats(mask)
    return n, lab, [tuple(int(a) for a in s[:5]) for s in st]


def line_comps(mask, horiz):
    """Linienstücke als (start, ende, lage): waagerecht (x0, x1, y), senkrecht (y0, y1, x)."""
    n, _, st = comps(mask)
    out = []
    for x, y, w, hh, _ in st[1:]:
        out.append((x, x + w, y + hh / 2) if horiz else (y, y + hh, x + w / 2))
    return out


def find_cells(gray):
    """Rahmenraster: Zeilen aus langen waagerechten Linien, Spalten aus senkrechten Trennlinien dazwischen."""
    # Rahmenlinien sind sehr blass: lokale Schwelle, leicht verbreitert gegen die Schräglage des Scans
    dark = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 25, 10)
    hl = cv2.morphologyEx(cv2.dilate(dark, np.ones((5, 1), np.uint8)), cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (200, 1)))
    vl = cv2.morphologyEx(cv2.dilate(dark, np.ones((1, 5), np.uint8)), cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (1, 120)))
    rows = sorted([r for r in line_comps(hl, True) if r[1] - r[0] > 180], key=lambda r: (r[2], r[0]))
    verts = line_comps(vl, False)
    cells = []
    used = set()
    for i, (x0, x1, y) in enumerate(rows):
        for j in range(i + 1, len(rows)):
            u0, u1, y2 = rows[j]
            if not 170 <= y2 - y <= 270 or min(x1, u1) - max(x0, u0) < 200:
                continue
            lo, hi = max(x0, u0) - 10, min(x1, u1) + 10
            # Band 2: die Mittellinie der Figur reicht fast bis an den Rahmen – nur Linien über die ganze Höhe sind Trennlinien
            tol = 25 if VOL == 1 else 6
            xs = sorted([v[2] for v in verts if lo <= v[2] <= hi and v[0] <= y + tol and v[1] >= y2 - tol] + [lo + 10, hi - 10])
            cols = []
            for xx in xs:
                if not cols or xx - cols[-1] > 40:
                    cols.append(xx)
            # blasse Trennlinie nicht gefunden: doppelt breite Lücke halbieren
            widths = [b - a for a, b in zip(cols, cols[1:]) if 170 <= b - a <= 270]
            if widths:
                cw = float(np.median(widths))
                full = []
                for a, b in zip(cols, cols[1:]):
                    full.append(a)
                    if 1.7 * cw < b - a < 2.3 * cw:
                        full.append((a + b) / 2)
                cols = full + [cols[-1]]
            for c0, c1 in zip(cols, cols[1:]):
                if 170 <= c1 - c0 <= 270 and (round(c0), round(y)) not in used:
                    used.add((round(c0), round(y)))
                    cells.append((c0, y, c1, y2))
            break
    return cells


def measure_cell(gray, cell):
    c0, r0, c1, r1 = (int(round(v)) for v in cell)
    pad = 8
    cut = gray[r0 + pad:r1 - pad, c0 + pad:c1 - pad]
    # lokale Schwelle für blasse Linien, feste Schwelle dazu, damit Fußabdrücke auf der Linie innen nicht hohl werden
    sub = cv2.bitwise_or(cv2.adaptiveThreshold(cut, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 25, 10),
                         (cut < 150).astype(np.uint8) * 255)
    h = cv2.morphologyEx(sub, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1)))
    v = cv2.morphologyEx(sub, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (1, 40)))
    H, W = sub.shape
    # Reste der Rahmenlinien (am Rand, fast so lang wie das Bild) gehören nicht zur Figur
    # Band 2 zeichnet die Figur fast so groß wie den Rahmen
    big = 0.85 if VOL == 1 else 0.97
    hs = [l for l in line_comps(h, True) if 60 <= l[1] - l[0] < big * W and 12 < l[2] < H - 12]
    vs = [l for l in line_comps(v, False) if 60 <= l[1] - l[0] < big * H and 12 < l[2] < W - 12]
    mid = max(vs, key=lambda l: l[1] - l[0]) if vs else None
    if mid:
        cross = [l for l in hs if l[0] - 6 <= mid[2] <= l[1] + 6]
        base = max(cross, key=lambda l: l[2]) if cross else None
    else:
        longest = max((l[1] - l[0] for l in hs), default=0)
        base = max((l for l in hs if l[1] - l[0] > 0.8 * longest), key=lambda l: l[2]) if hs else None
    if base is None:
        return None
    ox = (mid[2] if mid else (base[0] + base[1]) / 2) + c0 + pad
    oy = base[2] + r0 + pad
    unit = (base[1] - base[0]) / 2
    def rel(x, y):
        return [round((x + c0 + pad - ox) / unit, 2), round((oy - y - r0 - pad) / unit, 2)]
    lines = [rel(l[0], l[2]) + rel(l[1], l[2]) for l in hs] + [rel(l[2], l[1]) + rel(l[2], l[0]) for l in vs]
    return {"ox": ox, "oy": oy, "unit": unit, "box": (c0, r0, c1, r1), "lines": lines}


def order(figs, page_width):
    """Lesereihenfolge: linke Buchseite, dann rechte; je Seite zeilenweise von oben nach unten."""
    out = []
    for half in (0, 1):
        fs = sorted([f for f in figs if ((f["box"][0] + f["box"][2]) / 2 >= page_width / 2) == bool(half)], key=lambda f: f["box"][1])
        rows = []
        for f in fs:
            if rows and f["box"][1] - rows[-1][-1]["box"][1] < 70:
                rows[-1].append(f)
            else:
                rows.append([f])
        for r in rows:
            out += sorted(r, key=lambda f: f["box"][0])
    return out


def foot_blobs(gray):
    # Linien sind höchstens 3 px dick, Fußabdrücke deutlich dicker: Öffnen mit 4×4 entfernt nur die Linien
    feet = cv2.morphologyEx((gray < 130).astype(np.uint8) * 255, cv2.MORPH_OPEN, np.ones((4, 4), np.uint8))
    n, lab, st = comps(feet)
    out = []
    for i in range(1, n):
        x, y, w, hh, area = st[i]
        if area < 60 or max(w, hh) > 70:
            continue
        ys, xs = np.nonzero(lab[y:y + hh, x:x + w] == i)
        xs, ys = xs + x, ys + y
        cx, cy = xs.mean(), ys.mean()
        pts = np.stack([xs - cx, ys - cy], 1).astype(float)
        ev, evec = np.linalg.eigh(pts.T @ pts / len(pts))
        ax = evec[:, 1]  # Hauptachse (Bild: x rechts, y unten)
        proj = pts @ ax
        perp = pts @ np.array([-ax[1], ax[0]])
        # Breite an beiden Enden vergleichen: breiteres Ende = Zehen
        lo = proj < np.percentile(proj, 30)
        hi = proj > np.percentile(proj, 70)
        wlo = np.abs(perp[lo]).mean() if lo.any() else 0
        whi = np.abs(perp[hi]).mean() if hi.any() else 0
        if wlo > whi:
            ax = -ax
        out.append({"cx": cx, "cy": cy, "dir": math.degrees(math.atan2(ax[0], -ax[1])) % 360, "area": int(area),
                    "elong": math.sqrt(ev[1] / max(ev[0], 1e-6)), "sure": abs(wlo - whi) / max(wlo, whi, 1e-6)})
    return out


def main(pages):
    OUT.mkdir(parents=True, exist_ok=True)
    doc = open_pdf()
    for p in pages:
        gray = render(doc, p)
        cells = find_cells(gray)
        figs = [measure_cell(gray, c) for c in cells]
        # Die Figur sitzt in jedem Rahmen gleich: Ausreißer (falsche Linie erkannt) durch den Median ersetzen
        good = [f for f in figs if f]
        if good:
            med = {k: float(np.median([f[k] - f["box"][j] for f in good])) for k, j in (("ox", 0), ("oy", 1))}
            med["unit"] = float(np.median([f["unit"] for f in good]))
            for i, (c, f) in enumerate(zip(cells, figs)):
                box = tuple(int(round(v)) for v in c)
                if not f or abs(f["unit"] - med["unit"]) > 6:
                    figs[i] = {"ox": box[0] + med["ox"], "oy": box[1] + med["oy"], "unit": med["unit"], "box": box, "lines": [], "guess": True}
        figs = order(figs, gray.shape[1])
        res = [{"i": k, "box": f["box"], "unit": round(f["unit"], 1), "guess": f.get("guess", False), "lines": f["lines"], "feet": []} for k, f in enumerate(figs)]
        for b in foot_blobs(gray):
            for k, f in enumerate(figs):
                c0, r0, c1, r1 = f["box"]
                if c0 < b["cx"] < c1 and r0 < b["cy"] < r1:
                    res[k]["feet"].append({"x": round((b["cx"] - f["ox"]) / f["unit"], 2), "y": round((f["oy"] - b["cy"]) / f["unit"], 2),
                                           "dir": round(b["dir"]) % 360, "area": b["area"], "elong": round(b["elong"], 1),
                                           "sure": round(b["sure"], 2)})
        vis = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
        for k, f in enumerate(figs):
            res[k]["feet"].sort(key=lambda a: a["x"])
            c0, r0, c1, r1 = f["box"]
            cv2.rectangle(vis, (c0, r0), (c1, r1), (0, 160, 0), 2)
            cv2.circle(vis, (int(f["ox"]), int(f["oy"])), 5, (255, 0, 0), -1)
            cv2.putText(vis, str(k), (c0 + 8, r0 + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
            for a in res[k]["feet"]:
                cx, cy = f["ox"] + a["x"] * f["unit"], f["oy"] - a["y"] * f["unit"]
                r = math.radians(a["dir"])
                cv2.arrowedLine(vis, (int(cx), int(cy)), (int(cx + 25 * math.sin(r)), int(cy - 25 * math.cos(r))), (0, 0, 255), 2, tipLength=0.4)
        (OUT / f"embusen_{p:03d}.json").write_text(json.dumps(res, indent=1))
        cv2.imwrite(str(OUT / f"embusen_{p:03d}.png"), vis)
        print(p, len(figs), "Bilder,", sum(len(r["feet"]) for r in res), "Fussabdruecke")


if __name__ == "__main__":
    main([int(a) for a in sys.argv[1:]])
