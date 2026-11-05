# Hangetsu – Fußskizze in Band 2: Scan-Seiten 58–59 (Buch S. 109–111). Aufruf mit KATA_VOL=2.
# Die Linienfigur ist ein Kreuz; Ursprung = Kreuzungspunkt. Die Übersicht zeichnet nicht immer genau (z. B. Bild 11:
# der linke Fuß rückt dort scheinbar zurück, laut Text und Einzelskizze bleibt er) – das gleicht js/kata-ansage.js aus.
# Lage aus der Messung (embusen.py), Zehenrichtungen nach den Einzelskizzen (docs/fussskizzen.md): im Hangetsu-dachi zeigt
# der vordere Fuß etwa 30° nach innen, der hintere gerade (der Standfuß dreht dafür beim Halbmondschritt etwas nach innen).
# Angehobene Füße (Tritte) von Hand gesetzt.
PAGES = [58, 59]
SKIP = set()
LINES = [[-1, 0, 1, 0], [0, -0.8, 0, 1.45]]
FRAMES = [
    ('rei', 'LR', 'Musubi-dachi', 0, {'h': 'Verbeugung, Fersen zusammen', 'f': [[-0.1, -0.23, 330], [0.09, -0.24, 30]]}),
    ('yoi', 'LR', 'Hachiji-dachi', 0, {'h': 'Erst linker, dann rechter Fuß nach außen – Hachiji-dachi', 'f': [[-0.17, -0.27, 335], [0.18, -0.26, 25]]}),
    ('1', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 0, {'h': 'Rechtes Bein trägt und dreht nach innen, linker Fuß gleitet im Halbmond (Bogen von innen nach außen) nach vorne – Einatmen', 'f': [[-0.12, 0.13, 30], [0.21, -0.35, 0]]}),
    ('2', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 0, {'h': 'Stand bleibt – Ausatmen', 'f': [[-0.12, 0.11, 30], [0.16, -0.37, 0]]}),
    ('3', 'LR', 'Migi Ashi-mae Hangetsu-dachi', 0, {'h': 'Linkes Bein trägt und dreht nach innen, rechter Fuß gleitet im Halbmond nach vorne', 'f': [[-0.25, 0.13, 0], [0.05, 0.58, 330]]}),
    ('4', 'LR', 'Migi Ashi-mae Hangetsu-dachi', 0, {'h': 'Stand bleibt', 'f': [[-0.25, 0.12, 0], [0.05, 0.56, 330]]}),
    ('5', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 0, {'h': 'Rechtes Bein trägt und dreht nach innen, linker Fuß gleitet im Halbmond nach vorne', 'f': [[-0.13, 1.11, 30], [0.16, 0.61, 0]]}),
    ('6', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 0, {'h': 'Stand bleibt', 'f': [[-0.11, 1.12, 30], [0.17, 0.63, 0]]}),
    ('7', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 0, {'h': 'Langsam: Stand bleibt', 'f': [[-0.1, 1.12, 30], [0.19, 0.62, 0]]}),
    ('8', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 0, {'h': 'Langsam: Stand bleibt', 'f': [[-0.08, 1.15, 30], [0.2, 0.66, 0]]}),
    ('9', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 0, {'h': 'Langsam: Stand bleibt', 'f': [[-0.13, 1.13, 30], [0.16, 0.63, 0]]}),
    ('10', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 0, {'h': 'Langsam: Stand bleibt', 'f': [[-0.1, 1.11, 30], [0.18, 0.62, 0]]}),
    ('11', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 180, {'turn': -180, 'h': 'Linkes Bein trägt, rechter Fuß gleitet am linken vorbei nach vorne, Wendung links herum nach hinten (Ura-shomen) – Kiai', 'f': [[-0.14, 0.67, 210], [-0.34, 1.32, 180]]}),
    ('12', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 180, {'h': 'Langsam: Stand bleibt', 'f': [[-0.29, 0.68, 210], [-0.53, 1.32, 180]]}),
    ('13', 'LR', 'Migi Ashi-mae Hangetsu-dachi', 180, {'h': 'Linkes Bein trägt und dreht nach innen, rechter Fuß gleitet im Halbmond nach vorne', 'f': [[-0.13, 0.86, 180], [-0.52, 0.31, 150]]}),
    ('14', 'LR', 'Migi Ashi-mae Hangetsu-dachi', 180, {'h': 'Langsam: Stand bleibt', 'f': [[-0.14, 0.77, 180], [-0.47, 0.22, 150]]}),
    ('15', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 180, {'h': 'Rechtes Bein trägt und dreht nach innen, linker Fuß gleitet im Halbmond nach vorne', 'f': [[-0.1, -0.13, 210], [-0.5, 0.27, 180]]}),
    ('16', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 180, {'h': 'Langsam: Stand bleibt', 'f': [[-0.1, -0.12, 210], [-0.51, 0.28, 180]]}),
    ('17', 'LR', 'Migi Ashi-mae Hangetsu-dachi', 270, {'turn': 90, 'h': 'Linkes Bein trägt und dreht, rechter Fuß gleitet im Halbmond nach rechts – Viertelwendung rechts herum', 'f': [[-0.15, -0.1, 255], [-0.72, 0.17, 235]]}),
    ('18', 'LR', 'Migi Ashi-mae Hangetsu-dachi', 270, {'h': 'Stand bleibt', 'f': [[-0.11, -0.03, 255], [-0.68, 0.17, 235]]}),
    ('19', 'LR', 'Migi Ashi-mae Hangetsu-dachi', 270, {'h': 'Stand bleibt', 'f': [[-0.12, -0.04, 255], [-0.67, 0.19, 235]]}),
    ('20', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 90, {'turn': -180, 'h': 'Hidari-e Yori-ashi: Wendung links herum, beide Füße gleiten nach rechts (in Blickrichtung)', 'f': [[0.63, 0.47, 120], [0.12, 0.27, 90]]}),
    ('21', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 90, {'h': 'Stand bleibt', 'f': [[0.61, 0.45, 120], [0.08, 0.24, 90]]}),
    ('22', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 90, {'h': 'Stand bleibt', 'f': [[0.7, 0.42, 120], [0.14, 0.21, 90]]}),
    ('23', 'LR', 'Migi Ashi-mae Hangetsu-dachi', 180, {'turn': 90, 'h': 'Beide Füße gleiten etwas nach rechts Richtung Ura-shomen, der rechte führt im Halbmond – Viertelwendung rechts herum', 'f': [[0.61, 0.3, 180], [0.34, -0.13, 150]]}),
    ('24', 'LR', 'Migi Ashi-mae Hangetsu-dachi', 180, {'h': 'Stand bleibt', 'f': [[0.59, 0.3, 180], [0.32, -0.13, 150]]}),
    ('25', 'LR', 'Migi Ashi-mae Hangetsu-dachi', 180, {'h': 'Stand bleibt', 'f': [[0.52, 0.27, 180], [0.25, -0.15, 150]]}),
    ('26', 'LR', 'Migi Kokutsu-dachi', 0, {'turn': -180, 'h': 'Langsam: Rechter Fuß bleibt und dreht, Blick nach vorne (Shomen) – linker Fuß kommt ans rechte Knie und landet im großen Kreis vorne', 'f': [[0.34, 0.63, 0], [0.48, 0.05, 90]]}),
    ('27', 'LR', 'Migi Ashi-mae Kosa', 0, {'w': (0.5, 0.5), 'h': 'Langsam und leise: Linkes Bein trägt, rechter Fuß kreuzt vor dem linken nach vorne', 'f': [[0.38, 0.65, 0], [0.39, 1.01, 25]]}),
    ('28', 'LR', 'Migi Ashi-dachi', 0, {'h': 'Gewicht aufs rechte Bein, linker Fuß tritt Mae-geri und zieht zurück', 'w': (0.0, 1.0), 'f': [[0.33, 0.84, 0], [0.33, 1.04, 25]]}),
    ('29', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 0, {'h': 'Rechtes Bein trägt, linker Fuß setzt nach dem Tritt vorne auf', 'f': [[0.17, 1.33, 30], [0.5, 0.88, 0]]}),
    ('30', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 0, {'h': 'Stand bleibt', 'f': [[0.17, 1.36, 30], [0.5, 0.91, 0]]}),
    ('31', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 0, {'h': 'Stand bleibt – Hüfte in Hanmi', 'f': [[0.2, 1.25, 30], [0.49, 0.8, 0]]}),
    ('32', 'LR', 'Hidari Kokutsu-dachi', 180, {'turn': 180, 'h': 'Langsam: Linker Fuß bleibt und dreht, Blick nach hinten (Ura-shomen) – rechter Fuß kommt ans linke Knie und landet im großen Kreis hinten', 'f': [[0.2, 1.18, 90], [0.1, 0.77, 180]]}),
    ('33', 'LR', 'Hidari Ashi-mae Kosa', 180, {'w': (0.5, 0.5), 'h': 'Langsam und leise: Rechtes Bein trägt, linker Fuß kreuzt vor dem rechten nach vorne', 'f': [[0.1, 0.47, 160], [0.07, 0.75, 180]]}),
    ('34', 'LR', 'Hidari Ashi-dachi', 180, {'h': 'Gewicht aufs linke Bein, rechter Fuß tritt Mae-geri und zieht zurück', 'w': (1.0, 0.0), 'f': [[0.13, 0.42, 160], [0.09, 0.66, 180]]}),
    ('35', 'LR', 'Migi Ashi-mae Hangetsu-dachi', 180, {'h': 'Linkes Bein trägt, rechter Fuß setzt nach dem Tritt vorne auf', 'f': [[0.13, 0.35, 180], [-0.01, -0.13, 150]]}),
    ('36', 'LR', 'Migi Ashi-mae Hangetsu-dachi', 180, {'h': 'Stand bleibt', 'f': [[0.15, 0.35, 180], [0.01, -0.12, 150]]}),
    ('37', 'LR', 'Migi Ashi-mae Hangetsu-dachi', 180, {'h': 'Stand bleibt – Hüfte in Hanmi', 'f': [[0.13, 0.33, 180], [-0.01, -0.14, 150]]}),
    ('38', 'LR', 'Migi Kokutsu-dachi', 0, {'turn': -180, 'h': 'Langsam: Rechter Fuß bleibt und dreht, Blick nach vorne (Shomen) – linker Fuß kommt ans rechte Knie und landet im großen Kreis vorne', 'f': [[0.08, 0.44, 0], [0.13, -0.03, 90]]}),
    ('39', 'LR', 'Hidari Ashi-dachi', 0, {'h': 'Gewicht aufs linke Bein, Hüfte dreht links herum, rechter Fuß tritt Mikazuki-geri in die linke Hand', 'w': (1.0, 0.0), 'f': [[0.03, 0.5, 355], [0.03, 0.72, 300]]}),
    ('40', 'LR', 'Hidari Ashi-mae Hangetsu-dachi', 0, {'h': 'Linker Fuß bleibt, rechter Fuß setzt nach dem Tritt hinten auf – Kiai', 'f': [[0.04, 0.43, 30], [0.22, 0.13, 0]]}),
    ('41', 'LR', 'Hidari Ashi-mae Neko-ashi-dachi', 0, {'w': (0.1, 0.9), 'h': 'Langsam: Rechter Fuß gleitet etwas zurück, linker Fuß zieht heran – Neko-ashi-dachi', 'f': [[0.08, 0.04, 35], [0.11, -0.26, 20]]}),
    ('naore', 'LR', 'Hachiji-dachi', 0, {'h': 'Rechter Fuß bleibt, linker Fuß geht zurück – Hachiji-dachi', 'f': [[-0.18, -0.32, 335], [0.13, -0.32, 25]]}),
    ('end', 'LR', 'Musubi-dachi', 0, {'h': 'Verbeugung, Ende der Kata', 'f': [[-0.09, -0.31, 330], [0.11, -0.3, 30]]}),
]
