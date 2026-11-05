"""Liest die eingebetteten Scan-Bilder aus dem Kata-PDF.

Im PDF liegt jedes Scan-Bild verschoben auf der Seite (teils außerhalb), beim normalen Rendern fehlt daher ein
Großteil der Seite. Die Bilder selbst sind vollständig – deshalb immer über diese Funktion lesen.
"""
from pathlib import Path

import os

import cv2
import numpy as np
import pymupdf

ROOT = Path(__file__).resolve().parents[2]
# Band 2 (nur Hangetsu): KATA_VOL=2 setzen. Dort liegt je Seite genau ein Scan-Bild an der richtigen Stelle.
VOL = int(os.environ.get("KATA_VOL", "1"))
PDF = ROOT / f"Karate-do-kata-volume-{VOL}.pdf"


def open_pdf():
    return pymupdf.open(str(PDF))


def page_image(doc, page_no: int, gray: bool = True) -> np.ndarray:
    """Scan-Seite page_no (1-basiert) als Bild, aufrecht gedreht."""
    page = doc[page_no - 1]
    pix = pymupdf.Pixmap(doc, page.get_images(full=True)[0][0])
    if pix.alpha or pix.n not in (1, 3):
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n).copy()
    img = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY) if pix.n == 3 and gray else img.squeeze() if pix.n == 1 else img
    if page.rotation == 90:
        img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
    elif page.rotation == 270:
        img = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
    return img
