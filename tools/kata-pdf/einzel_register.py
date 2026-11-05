"""Schreibt die Tabellen der Einzelskizzen in docs/fussskizzen.md (Block zwischen <!-- einzel:KATA-ID --> und <!-- /einzel -->).

Quelle: tools/out/einzelskizzen.json (einzelskizzen.py) und tools/out/ocr_boxes.json (ocr_boxes.py); die App-Stellungen
(für die Zuordnung linker/rechter Abdruck und den Vergleich) kommen über Node aus data/kata-*.js.
Ins Repo kommen nur Messwerte und kurze Angaben in eigenen Worten, keine Bilder und kein Buchtext.
Aufruf: python3 tools/kata-pdf/einzel_register.py (Band 2, nur Hangetsu: mit KATA_VOL=2)
"""
import json
import math
import re
import subprocess
import sys
from pathlib import Path

import cv2

sys.path.insert(0, str(Path(__file__).resolve().parent))
from scans import ROOT, open_pdf  # noqa: E402
import einzelskizzen as E  # noqa: E402

DOC = ROOT / "docs" / "fussskizzen.md"
NODE = r"""
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = process.argv[1];
const store = {};
const ctx = { console, localStorage: { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } } };
ctx.window = ctx;
vm.createContext(ctx);
['js/core.js', 'js/graphics.js', 'js/graphics-tech.js', 'data/kata-intro.js', 'data/kata-heian.js', 'data/kata-tekki.js', 'data/kata-sentei.js', 'data/kata-hangetsu.js', 'js/kata-ansage.js']
  .forEach((f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }));
const SK = ctx.SK, out = {};
SK.ansageKata().forEach((id) => {
  const a = SK.ansagePoses(SK.kata[id]);
  out[id] = { seq: SK.kata[id].seq, poses: [a.rei, a.yoi].concat(a.moves, [a.naore, a.end]).map((p) => ({ f: p.f, body: p.body })) };
});
process.stdout.write(JSON.stringify(out));
"""

SIDE = {"left": "linker", "right": "rechter"}
LEG = {"left": "linkes", "right": "rechtes"}
WHERE = [("forward", "vor"), ("frontward", "vor"), ("backwards", "zurück"), ("backward", "zurück"), ("back", "zurück"),
         ("to the left", "nach links"), ("to the right", "nach rechts"), ("on an angle", "schräg"), ("inward", "nach innen")]


def where(s):
    return next((d for e, d in WHERE if s.startswith(e)), "")


def text_facts(t):
    """Kurze Angaben zur Fußarbeit aus dem Buchtext, in eigenen Worten."""
    t = re.sub(r"-\s+", "-", t).lower()
    facts = []
    pats = [
        (r"keeping (?:the stance|both feet(?: position)?|the feet(?: position)?) unchanged", lambda m: "Stand bleibt"),
        (r"setting the (left|right) (?:leg|foot) as the (?:supporting|pivot)", lambda m: f"{LEG[m[1]]} Bein trägt"),
        (r"keeping (?:[a-z ]+ and )?the (left|right) foot(?: position)? unchanged", lambda m: f"{SIDE[m[1]]} Fuß bleibt"),
        (r"(?:as )?the (left|right) foot stays in place", lambda m: f"{SIDE[m[1]]} Fuß bleibt"),
        (r"(left|right) foot as the pivot", lambda m: f"Drehung auf dem {SIDE[m[1]][:-1]}n Fuß"),
        (r"(left|right) foot as the point of propulsion", lambda m: f"Abstoß mit dem {SIDE[m[1]][:-1]}n Fuß"),
        (r"slid(?:e|ing) both feet(?: together)?,? (?:\(yori-ashi\),? )?([a-z ]*)", lambda m: f"beide Füße gleiten {where(m[1])}".strip()),
        (r"slide the (left|right) (?:foot|leg) ([a-z ]*)", lambda m: f"{SIDE[m[1]]} Fuß gleitet {where(m[2])}".strip()),
        (r"(?:pull|draw) the (left|right) foot back", lambda m: f"{SIDE[m[1]]} Fuß zieht zurück"),
        (r"lift(?:ing)? (?:high )?the (left|right) (?:leg|knee)", lambda m: f"{LEG[m[1]]} Knie hoch"),
        (r"stomp", lambda m: "stampft auf"),
        (r"\bjump", lambda m: "Sprung"),
        (r"\bpivot", lambda m: "dreht auf der Stelle"),
    ]
    found = []
    for rx, fn in pats:
        for m in re.finditer(rx, t):
            found.append((m.start(), fn(m)))
    for _, f in sorted(found):
        if not any(x.startswith(f) for x in facts) and not (f == "dreht auf der Stelle" and any(x.startswith("Drehung auf") for x in facts)):
            facts.append(f)
    return ", ".join(facts[:5])


def movement_texts():
    """Buchtext je Bewegung (OCR), getrennt an den Überschriften wie in einzelskizzen.py."""
    ocr = json.loads((E.OUT / f"ocr_boxes{E.SUFFIX}.json").read_text())
    doc = open_pdf()
    out, ki, cur, name = {}, -1, None, None
    for p in range(E.FIRST, E.LAST + 1):
        g = E.render(doc, p)
        cells = E.find_cells(cv2.resize(g, (2273, round(g.shape[0] * 2273 / g.shape[1]))))
        k = E.WIDTH / 2273
        skip = [(c0 * k - 70, r0 * k - 70, c1 * k + 70, r1 * k + 70) for c0, r0, c1, r1 in cells]
        if skip:
            skip = [(min(s[0] for s in skip), min(s[1] for s in skip), max(s[2] for s in skip), max(s[3] for s in skip))]
        lines = [r for r in ocr.get(str(p), []) if not any(a <= r[0] <= c and b <= r[1] <= d for a, b, c, d in skip)]
        heads = {(x, y): n for x, y, n in E.ocr_headers(lines)}
        for x, y, t in sorted(lines, key=lambda r: (r[0] >= g.shape[1] / 2, r[1])):
            if (x, y) in heads:
                name = heads[(x, y)]
                if name == "rei" and (cur is None or "naore" in cur and "end" in cur):
                    ki += 1
                    cur = out.setdefault(E.KATA[ki][0], {})
                elif name == "rei":
                    name = "end"
                cur[name] = ""
            elif cur is not None and name:
                cur[name] += " " + t
    return out


ang = lambda dx, dy: round(math.degrees(math.atan2(dx, dy))) % 360  # noqa: E731
diff = lambda a, b: abs((a - b + 540) % 360 - 180)  # noqa: E731


def feet_of(sk, pose):
    """Ausgefüllte Abdrücke der letzten Skizze einer Bewegung, dem linken und rechten Fuß der App-Stellung zugeordnet."""
    vf = [f for f in sk["feet"] if f["kind"] == "voll"]
    if len(vf) != 2:
        return None, vf
    cf = pose["f"]
    best = None
    for a, b in ((0, 1), (1, 0)):
        L, R = vf[a], vf[b]
        e = diff(ang(R["cx"] - L["cx"], L["cy"] - R["cy"]), ang(cf[1][0] - cf[0][0], cf[1][1] - cf[0][1]))
        if best is None or e < best[0]:
            best = (e, L, R)
    return best[1:], vf


def table(kid, sk, texts, app):
    names = ["rei", "yoi"] + [str(r[0]) for r in app["seq"]] + ["naore", "end"]
    label = {"rei": "Rei", "yoi": "Yoi", "naore": "Naore", "end": "Rei (Ende)"}
    rows = ["| Nr | Skizzen | Zehen links / rechts | rechter Fuß vom linken aus | Abstand | Laut Text |", "|---|---|---|---|---|---|"]
    for j, n in enumerate(names):
        m = sk.get(n, {"sketches": []})
        s = m["sketches"]
        toes = place = dist = "–"
        if s:
            lr, vf = feet_of(s[-1], app["poses"][j])
            if lr:
                L, R = lr
                flen = (L["len"] + R["len"]) / 2
                toes = f"{L['dir']}° / {R['dir']}°"
                place = f"{ang(R['cx'] - L['cx'], L['cy'] - R['cy'])}°"
                dist = f"{math.hypot(R['cx'] - L['cx'], R['cy'] - L['cy']) / flen:.1f}".replace(".", ",")
            elif len(vf) == 1:
                toes = f"ein Abdruck {vf[0]['dir']}°"
        count = str(len(s)) if s else "keine"
        rows.append(f"| {label.get(n, n)} | {count} | {toes} | {place} | {dist} | {text_facts(texts.get(n, ''))} |")
    return "\n".join(rows)


def main():
    sk = json.loads((E.OUT / f"einzelskizzen{E.SUFFIX}.json").read_text())
    app = json.loads(subprocess.run(["node", "-e", NODE, str(ROOT)], capture_output=True, text=True, check=True).stdout)
    texts = movement_texts()
    md = DOC.read_text()
    for kid, _ in E.KATA:
        rx = re.compile(rf"(<!-- einzel:{kid} -->\n)[\s\S]*?(<!-- /einzel -->)")
        if not rx.search(md):
            raise SystemExit(f"Block für {kid} fehlt in {DOC}")
        md = rx.sub(lambda mm: mm[1] + table(kid, sk[kid], texts.get(kid, {}), app[kid]) + "\n" + mm[2], md)
    DOC.write_text(md)
    print("Tabellen geschrieben:", ", ".join(k for k, _ in E.KATA))


if __name__ == "__main__":
    main()
