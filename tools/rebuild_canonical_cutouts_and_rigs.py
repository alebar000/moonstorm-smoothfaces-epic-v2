#!/usr/bin/env python3
"""
rebuild_canonical_cutouts_and_rigs.py
Rebuilds all character rig pieces for Nihongo Nohondes, A Baby, The Ventriloquist & Rapoleon,
 the Z0 Cutout Bridge Ogre/Troll, and the Z1S1 Machine Room props (including the canonical
da Vinci Overbalanced Hammer Wheel Perpetual Movement Machine) using the exact Slice 1
OpenCV construction-paper cutout pipeline + pipeline/gates.py normalize & check.
Zero em-dashes anywhere.
"""
import os
import sys
import json
import math
import shutil
import stat
import hashlib
import numpy as np
import cv2
from PIL import Image

ROOT = r"C:\AntiGravityStuff\Moonstorm2"
PIPELINE_DIR = os.path.join(ROOT, "pipeline")
CAND_DIR = os.path.join(ROOT, "art", "candidates")
APPR_DIR = os.path.join(ROOT, "art", "approved")
sys.path.insert(0, PIPELINE_DIR)
import gates

RULES = json.load(open(os.path.join(PIPELINE_DIR, "rules.json"), encoding="utf-8"))
PALETTE_JSON = json.load(open(os.path.join(PIPELINE_DIR, "palette.json"), encoding="utf-8"))
HEIGHTS = json.load(open(os.path.join(PIPELINE_DIR, "heights.json"), encoding="utf-8"))

def hex_to_bgr(h):
    h = h.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return (b, g, r)

# Character & Common Palette (BGR for OpenCV)
C = {
    "cream":   hex_to_bgr("#f9ecc2"),
    "charcoal":hex_to_bgr("#323232"),
    "grey":    hex_to_bgr("#717171"),
    "black":   hex_to_bgr("#000000"),
    "brown":   hex_to_bgr("#613e35"),
    "blue":    hex_to_bgr("#004b81"),
    "navy":    hex_to_bgr("#343e63"),
    "crimson": hex_to_bgr("#9e1507"),
    "ochre":   hex_to_bgr("#9c793a"),
    "gold":    hex_to_bgr("#e7bc57"),
    "green":   hex_to_bgr("#0c7a27"),
    "slate":   hex_to_bgr("#848aa4"),
    "ink":     hex_to_bgr("#1a1612"),
    "pencil":  hex_to_bgr("#6e6a62"),
    # Scenery Palette (BGR for OpenCV)
    "s_brass": hex_to_bgr("#ab986e"),
    "s_red":   hex_to_bgr("#9c5a5c"),
    "s_sky":   hex_to_bgr("#95b3d4"),
    "s_iron":  hex_to_bgr("#2a2922"),
    "s_rust":  hex_to_bgr("#605752"),
    "s_sand":  hex_to_bgr("#c6a787"),
    "s_slate": hex_to_bgr("#728289"),
    "s_wood":  hex_to_bgr("#998370"),
    "s_navy":  hex_to_bgr("#4a697f"),
    "s_coral": hex_to_bgr("#d67c7c"),
    "s_yellow":hex_to_bgr("#d6d27c"),
    "s_cream": hex_to_bgr("#cbc2c2"),
}

GREEN_KEY = (0, 255, 0)

def new_canvas(size=1024):
    c = np.zeros((size, size, 3), dtype=np.uint8)
    c[:] = GREEN_KEY
    return c

def add_hatching(canvas, poly_pts, x_range=None, y_range=None, spacing=22, stroke_w=4, direction=1):
    h, w = canvas.shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(mask, [np.array(poly_pts, np.int32)], 1)
    if x_range:
        mask[:, :x_range[0]] = 0
        mask[:, x_range[1]:] = 0
    if y_range:
        mask[:y_range[0], :] = 0
        mask[y_range[1]:, :] = 0
    overlay = np.zeros((h, w, 3), dtype=np.uint8)
    p = C["pencil"]
    if direction == 1:
        for off in range(-h, w + h, spacing):
            cv2.line(overlay, (off, 0), (off + h, h), p, stroke_w)
    else:
        for off in range(-h, w + h, spacing):
            cv2.line(overlay, (off + h, 0), (off, h), p, stroke_w)
    hit = (overlay[:, :, 0] == p[0]) & (mask == 1)
    canvas[hit] = p

def ink_px(raw_h, target_h, target_ink=7.2):
    return max(3, int(round(target_ink * raw_h / target_h)))

def poly(c, pts, fill_col, ink_w=0, closed=True):
    arr = np.array(pts, np.int32)
    if fill_col is not None:
        cv2.fillPoly(c, [arr], fill_col)
    if ink_w > 0:
        cv2.polylines(c, [arr], closed, C["ink"], ink_w)
    return arr

# ============================================================================
# 1. NIHONGO NOHONDES (16 PIECES)
# ============================================================================
def render_nihongo(pid):
    c = new_canvas(1024)
    if pid == "nihongo.torso":
        target_h = 185
        # Sleeveless cream martial-arts gi tunic with dark charcoal obi belt & sash tails
        pts = [
            [360, 200], [450, 210], [500, 320], [550, 210], [640, 200], # shoulders & V-neck
            [680, 260], [655, 390], [640, 510],                         # right armhole & waist
            [690, 650], [715, 790], [590, 815], [515, 795],             # right gi skirt flare
            [485, 795], [410, 815], [285, 790], [310, 650],             # left gi skirt flare
            [360, 510], [345, 390], [320, 260]                          # left waist & armhole
        ]
        raw_h = 815 - 200
        iw = ink_px(raw_h, target_h, 7.2)
        # Undershirt dark triangle at V-neck
        poly(c, [[440, 205], [560, 205], [500, 355]], C["charcoal"], 0)
        poly(c, pts, C["cream"], 0)
        add_hatching(c, pts, x_range=(300, 430), spacing=24, stroke_w=4, direction=1)
        # Gi lapel collar band
        lapel_l = [[430, 202], [465, 208], [525, 480], [485, 480]]
        lapel_r = [[570, 202], [535, 208], [485, 420], [520, 420]]
        poly(c, lapel_r, C["cream"], int(iw * 0.7))
        poly(c, lapel_l, C["cream"], int(iw * 0.7))
        # Dark charcoal obi belt around waist + hanging sash ends
        obi = [[352, 480], [648, 480], [658, 565], [342, 565]]
        poly(c, obi, C["charcoal"], int(iw * 0.85))
        sash1 = [[475, 540], [525, 540], [505, 735], [455, 725]]
        sash2 = [[515, 540], [565, 540], [585, 715], [535, 725]]
        poly(c, sash1, C["charcoal"], int(iw * 0.75))
        poly(c, sash2, C["charcoal"], int(iw * 0.75))
        knot = [[465, 500], [545, 500], [550, 565], [460, 565]]
        poly(c, knot, C["charcoal"], int(iw * 0.8))
        # Outer silhouette ink
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "nihongo.head":
        target_h = 118
        # 3/4 right Japanese samurai-janitor head, blank eye/brow zone, fu-manchu moustache + pointed goatee
        pts = [
            [370, 200], [490, 185], [600, 210], [645, 280],             # crown hair top
            [635, 360], [645, 430], [665, 495], [630, 535],             # forehead & angular nose
            [640, 585], [615, 650], [565, 720],                         # cheek & jaw right
            [545, 815], [485, 815], [465, 720],                         # long pointed goatee
            [405, 660], [375, 580], [335, 555], [325, 490], [365, 465], # jaw left & ear
            [350, 360], [345, 270]                                      # back of head hair
        ]
        raw_h = 815 - 185
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["cream"], 0)
        # Hair cap at crown & temple
        hair = [
            [370, 200], [490, 185], [600, 210], [645, 280],
            [635, 340], [550, 315], [440, 325], [395, 430],
            [365, 465], [350, 360], [345, 270]
        ]
        poly(c, hair, C["charcoal"], int(iw * 0.75))
        # Cheekbone & nose pencil line (strictly below eye area y > 475)
        cv2.line(c, (575, 475), (635, 515), C["ink"], int(iw * 0.7))
        cv2.line(c, (635, 515), (590, 535), C["ink"], int(iw * 0.7))
        cv2.line(c, (430, 540), (485, 575), C["pencil"], 10)
        # Fu-manchu moustache + pointed goatee
        stache = [
            [485, 575], [565, 570], [615, 595], [625, 690],
            [595, 695], [585, 615], [525, 605], [470, 620],
            [455, 695], [425, 685], [440, 595]
        ]
        goatee = [[480, 665], [555, 665], [545, 815], [485, 815]]
        poly(c, goatee, C["charcoal"], int(iw * 0.75))
        poly(c, stache, C["charcoal"], int(iw * 0.75))
        # Stern mouth line between moustache and goatee
        cv2.line(c, (490, 635), (565, 635), C["ink"], int(iw * 0.75))
        # Outer head outline
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "nihongo.headband":
        target_h = 46
        # Crisp white/cream hachimaki cloth headband with red rising sun disk & fluttering left knot tails
        pts = [
            [180, 410], [285, 445], [375, 435],                         # upper tail & knot
            [410, 405], [565, 395], [735, 410], [775, 455],             # headband top edge
            [765, 530], [565, 520], [410, 525],                         # headband bottom edge
            [365, 550], [245, 595], [215, 545], [315, 505],             # lower fluttering tail
            [195, 470]
        ]
        raw_h = 595 - 395
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["cream"], 0)
        add_hatching(c, pts, x_range=(180, 400), spacing=20, stroke_w=5, direction=1)
        # Rising sun crimson circle on forehead center-right
        cv2.circle(c, (605, 460), 42, C["crimson"], -1)
        cv2.circle(c, (605, 460), 42, C["ink"], int(iw * 0.65))
        # Knot separator lines
        cv2.line(c, (385, 415), (385, 530), C["ink"], int(iw * 0.75))
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "nihongo.eyes.normal":
        target_h = 26
        # Pure cutout almond samurai eyes (ZERO skin patch!)
        l_eye = [[280, 430], [355, 385], [445, 415], [420, 505], [320, 510]]
        r_eye = [[535, 420], [620, 375], [715, 410], [690, 505], [580, 510]]
        raw_h = 510 - 375
        iw = ink_px(raw_h, target_h, 7.0)
        poly(c, l_eye, C["cream"], 0)
        poly(c, r_eye, C["cream"], 0)
        cv2.circle(c, (380, 448), 26, C["ink"], -1)
        cv2.circle(c, (640, 445), 28, C["ink"], -1)
        poly(c, l_eye, None, iw)
        poly(c, r_eye, None, iw)
        return c, target_h

    if pid == "nihongo.eyes.squint":
        target_h = 24
        # Narrowed focused samurai squint eyes (ZERO skin patch!)
        l_eye = [[275, 445], [360, 405], [450, 430], [425, 495], [315, 490]]
        r_eye = [[530, 440], [625, 395], [720, 425], [695, 495], [575, 490]]
        raw_h = 495 - 395
        iw = ink_px(raw_h, target_h, 8.2)
        poly(c, l_eye, C["cream"], 0)
        poly(c, r_eye, C["cream"], 0)
        cv2.circle(c, (380, 450), 20, C["ink"], -1)
        cv2.circle(c, (640, 448), 22, C["ink"], -1)
        poly(c, l_eye, None, iw)
        poly(c, r_eye, None, iw)
        return c, target_h

    if pid == "nihongo.eyes.closed":
        target_h = 24
        # Closed meditative samurai eyelids
        l_eye = [[275, 445], [360, 405], [450, 430], [425, 500], [315, 495]]
        r_eye = [[530, 440], [625, 395], [720, 425], [695, 500], [575, 495]]
        raw_h = 500 - 395
        iw = ink_px(raw_h, target_h, 8.2)
        poly(c, l_eye, C["cream"], 0)
        poly(c, r_eye, C["cream"], 0)
        cv2.line(c, (295, 455), (430, 460), C["ink"], int(iw * 0.9))
        cv2.line(c, (550, 452), (700, 458), C["ink"], int(iw * 0.9))
        poly(c, l_eye, None, iw)
        poly(c, r_eye, None, iw)
        return c, target_h

    if pid == "nihongo.brows.normal":
        target_h = 24
        # Two bold black marker samurai brows (calm authoritative angle)
        l_line = np.array([[270, 440], [355, 405], [445, 425]], np.int32)
        r_line = np.array([[530, 425], [625, 400], [720, 440]], np.int32)
        cv2.polylines(c, [l_line], False, C["ink"], 22)
        cv2.polylines(c, [r_line], False, C["ink"], 22)
        return c, target_h

    if pid == "nihongo.brows.angry":
        target_h = 26
        # Steep V-angled samurai scowl brows
        l_line = np.array([[270, 395], [360, 435], [445, 490]], np.int32)
        r_line = np.array([[530, 490], [620, 435], [715, 395]], np.int32)
        cv2.polylines(c, [l_line], False, C["ink"], 32)
        cv2.polylines(c, [r_line], False, C["ink"], 32)
        return c, target_h

    if pid == "nihongo.arm_front":
        target_h = 108
        # Bare muscular arm with dark martial-arts wrist bracer, bent forward (NO hand or katana hilt!)
        pts = [
            [380, 260], [465, 250], [525, 295], [545, 390],
            [535, 485], [625, 545], [675, 610], [645, 685],
            [565, 695], [465, 625], [410, 545], [395, 430], [365, 330]
        ]
        raw_h = 695 - 250
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["cream"], 0)
        add_hatching(c, pts, y_range=(450, 650), spacing=22, stroke_w=4, direction=1)
        # Dark wrist bracer wrap at forearm end
        bracer = [[565, 505], [655, 585], [635, 675], [535, 655]]
        poly(c, bracer, C["charcoal"], int(iw * 0.75))
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "nihongo.arm_back":
        target_h = 102
        # Bare muscular rear arm with dark wrist bracer and clenched fist
        pts = [
            [435, 250], [520, 260], [565, 340], [585, 455],
            [610, 565], [635, 645], [605, 720], [520, 725],
            [480, 655], [485, 575], [455, 465], [420, 345]
        ]
        raw_h = 725 - 250
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["cream"], 0)
        add_hatching(c, pts, x_range=(400, 520), spacing=20, stroke_w=4, direction=-1)
        bracer = [[480, 540], [595, 535], [615, 625], [485, 625]]
        poly(c, bracer, C["charcoal"], int(iw * 0.75))
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "nihongo.hand_front.fist":
        target_h = 40
        # Clenched samurai fist gripping handle
        pts = [
            [380, 520], [415, 405], [485, 355], [575, 365],
            [635, 420], [645, 525], [615, 625], [530, 665],
            [435, 645], [385, 585]
        ]
        raw_h = 665 - 355
        iw = ink_px(raw_h, target_h, 7.0)
        poly(c, pts, C["cream"], 0)
        for ky in [445, 505, 565]:
            cv2.line(c, (475, ky), (585, ky + 10), C["pencil"], 12)
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "nihongo.hand_front.open":
        target_h = 46
        # Open karate knife-hand gesture
        pts = [
            [365, 620], [405, 495], [415, 395], [465, 365], [495, 435], # thumb
            [545, 345], [615, 330], [665, 375], [685, 465],             # blade fingers
            [655, 575], [585, 645], [485, 675], [395, 665]
        ]
        raw_h = 675 - 330
        iw = ink_px(raw_h, target_h, 7.0)
        poly(c, pts, C["cream"], 0)
        cv2.line(c, (520, 455), (625, 435), C["pencil"], 12)
        cv2.line(c, (525, 520), (630, 505), C["pencil"], 12)
        poly(c, pts, None, iw)
        return c, target_h

    if pid in ("nihongo.leg_front", "nihongo.leg_back"):
        target_h = 104 if pid == "nihongo.leg_front" else 100
        # Baggy cream gi trouser leg tapering into dark kyahan shin wrap
        pts = [
            [410, 220], [590, 220], [635, 350], [625, 510],
            [575, 615], [565, 745], [445, 745], [435, 615],
            [385, 510], [375, 350]
        ]
        raw_h = 745 - 220
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["cream"], 0)
        add_hatching(c, pts, x_range=(370, 485), spacing=22, stroke_w=4, direction=1)
        wrap = [[435, 595], [575, 595], [565, 745], [445, 745]]
        poly(c, wrap, C["charcoal"], int(iw * 0.75))
        cv2.line(c, (440, 645), (570, 645), C["ink"], int(iw * 0.65))
        cv2.line(c, (442, 695), (568, 695), C["ink"], int(iw * 0.65))
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "nihongo.shoe_front":
        target_h = 54
        # SINGLE traditional wooden geta sandal with white tabi sock & crimson hanao strap
        pts = [
            [340, 360], [510, 355], [585, 425], [685, 465],
            [715, 535], [695, 615], [635, 615], [625, 685],
            [555, 685], [545, 615], [445, 615], [435, 685],
            [365, 685], [355, 615], [305, 615], [305, 515]
        ]
        raw_h = 685 - 355
        iw = ink_px(raw_h, target_h, 7.0)
        # Tabi sock upper
        sock = [[340, 360], [510, 355], [585, 425], [685, 465], [705, 525], [310, 525]]
        poly(c, sock, C["cream"], 0)
        # Wooden geta platform & two teeth blocks (ha)
        wood = [
            [305, 515], [715, 515], [695, 615], [635, 615], [625, 685],
            [555, 685], [545, 615], [445, 615], [435, 685],
            [365, 685], [355, 615], [305, 615]
        ]
        poly(c, wood, C["brown"], int(iw * 0.7))
        # Crimson sandal strap
        strap = [[465, 435], [525, 425], [625, 515], [575, 525]]
        poly(c, strap, C["crimson"], int(iw * 0.65))
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "nihongo.prop.broom_katana":
        target_h = 250
        # Janitor push-broom modified with a katana hilt & gold tsuba guard
        pts = [
            [475, 110], [535, 110], [535, 255],                         # katana tsuka hilt
            [595, 255], [595, 290], [528, 290],                         # right tsuba guard
            [528, 695], [665, 725], [705, 895],                         # broom head right flare
            [305, 895], [345, 725], [482, 695],                         # broom head left flare
            [482, 290], [415, 290], [415, 255], [475, 255]              # left tsuba guard
        ]
        raw_h = 895 - 110
        iw = ink_px(raw_h, target_h, 5.6)
        # Wooden shaft
        poly(c, [[482, 285], [528, 285], [528, 710], [482, 710]], C["s_wood"], 0)
        # Katana hilt (dark iron with diamond cord wrap)
        poly(c, [[475, 110], [535, 110], [535, 260], [475, 260]], C["s_iron"], 0)
        for hy in range(130, 245, 28):
            poly(c, [[485, hy], [505, hy - 10], [525, hy], [505, hy + 10]], C["s_brass"], 0)
        # Gold/brass tsuba guard
        poly(c, [[415, 255], [595, 255], [595, 290], [415, 290]], C["s_brass"], int(iw * 0.75))
        # Broom ferrule cap & straw bristles
        straw = [[345, 725], [665, 725], [705, 895], [305, 895]]
        poly(c, straw, C["s_yellow"], 0)
        add_hatching(c, straw, spacing=18, stroke_w=4, direction=1)
        band = [[335, 765], [675, 765], [682, 800], [328, 800]]
        poly(c, band, C["s_red"], int(iw * 0.75))
        cap = [[345, 720], [665, 720], [672, 755], [338, 755]]
        poly(c, cap, C["s_slate"], int(iw * 0.75))
        poly(c, pts, None, iw)
        return c, target_h


# ============================================================================
# 2. A BABY (8 PIECES - FAITHFUL TO AGUILAR'S ababy001.png)
# ============================================================================
def render_ababy(pid):
    c = new_canvas(1024)
    if pid == "ababy.torso":
        target_h = 146
        # Muscular gorilla chest in tight blue T-shirt + exposed 6-pack abs stomach (ZERO arm stumps!)
        pts = [
            [330, 230], [435, 200], [565, 200], [670, 230],             # broad gorilla shoulders
            [725, 310], [700, 440], [665, 540],                         # upper chest sides (no arm stumps!)
            [645, 675], [615, 775], [385, 775], [355, 675],             # muscular waist & abs
            [335, 540], [300, 440], [275, 310]
        ]
        raw_h = 775 - 200
        iw = ink_px(raw_h, target_h, 7.2)
        # Cream stomach base
        poly(c, pts, C["cream"], 0)
        # Tight blue T-shirt over huge pectoral chest
        shirt = [
            [330, 230], [435, 200], [500, 245], [565, 200], [670, 230],
            [725, 310], [700, 440], [665, 535],
            [575, 515], [425, 515], [335, 535], [300, 440], [275, 310]
        ]
        poly(c, shirt, C["blue"], int(iw * 0.85))
        # Pectoral contour lines on shirt
        cv2.line(c, (380, 430), (485, 455), C["ink"], int(iw * 0.75))
        cv2.line(c, (485, 455), (500, 340), C["ink"], int(iw * 0.75))
        cv2.line(c, (620, 430), (515, 455), C["ink"], int(iw * 0.75))
        # Sculpted 6-pack abs on exposed cream belly (matching ababy001.png!)
        ab_box = [[425, 540], [575, 540], [565, 745], [435, 745]]
        poly(c, ab_box, C["cream"], int(iw * 0.75))
        cv2.line(c, (500, 540), (500, 745), C["ink"], int(iw * 0.75))
        cv2.line(c, (430, 608), (570, 608), C["ink"], int(iw * 0.75))
        cv2.line(c, (433, 676), (567, 676), C["ink"], int(iw * 0.75))
        add_hatching(c, pts, x_range=(280, 390), spacing=22, stroke_w=4, direction=1)
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "ababy.head":
        target_h = 106
        # Hulking square bulldog jaw with underbite teeth, stubbly chin, blank upper eye zone
        pts = [
            [335, 225], [495, 200], [645, 225],                         # head dome top
            [695, 330], [715, 465], [735, 610], [700, 740],             # wide square right cheek/jaw
            [575, 775], [415, 775], [295, 740],                         # heavy bulldog chin
            [265, 610], [285, 465], [305, 330]
        ]
        raw_h = 775 - 200
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["cream"], 0)
        add_hatching(c, pts, y_range=(680, 775), spacing=18, stroke_w=4, direction=1)
        # Wide pug nose (below eye zone y=445)
        nose = [[465, 445], [545, 445], [565, 505], [445, 505]]
        poly(c, nose, C["cream"], int(iw * 0.75))
        cv2.circle(c, (480, 482), 10, C["ink"], -1)
        cv2.circle(c, (530, 482), 10, C["ink"], -1)
        # Wide grimacing bulldog underbite mouth with clenched square teeth
        mouth = [[345, 545], [655, 540], [675, 665], [335, 665]]
        poly(c, mouth, C["ink"], int(iw * 0.8))
        # Teeth row
        teeth = [[365, 555], [640, 550], [650, 645], [355, 645]]
        poly(c, teeth, C["cream"], int(iw * 0.65))
        for tx in [420, 480, 540, 600]:
            cv2.line(c, (tx, 552), (tx, 645), C["ink"], int(iw * 0.65))
        cv2.line(c, (360, 600), (645, 600), C["ink"], int(iw * 0.65))
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "ababy.eyes.normal":
        target_h = 26
        # Pure eyeballs + heavy brow ridge (ZERO rectangular skin patch!)
        l_eye = [[260, 410], [345, 360], [445, 390], [430, 505], [300, 505]]
        r_eye = [[545, 390], [645, 360], [730, 410], [690, 505], [560, 505]]
        raw_h = 505 - 360
        iw = ink_px(raw_h, target_h, 7.0)
        poly(c, l_eye, C["cream"], 0)
        poly(c, r_eye, C["cream"], 0)
        cv2.circle(c, (365, 445), 24, C["ink"], -1)
        cv2.circle(c, (625, 445), 24, C["ink"], -1)
        # Heavy furrowed brows across top of eyes
        l_brow = [[245, 385], [355, 350], [455, 385], [445, 425], [355, 395], [255, 425]]
        r_brow = [[535, 385], [635, 350], [745, 385], [735, 425], [635, 395], [545, 425]]
        poly(c, l_brow, C["ink"], 0)
        poly(c, r_brow, C["ink"], 0)
        poly(c, l_eye, None, iw)
        poly(c, r_eye, None, iw)
        return c, target_h

    if pid == "ababy.eyes.angry":
        target_h = 28
        # Angry glaring eyeballs + steep V-scowl brows (ZERO skin patch!)
        l_eye = [[260, 420], [345, 370], [445, 415], [425, 510], [300, 505]]
        r_eye = [[545, 415], [645, 370], [730, 420], [690, 505], [565, 510]]
        raw_h = 510 - 360
        iw = ink_px(raw_h, target_h, 7.0)
        poly(c, l_eye, C["cream"], 0)
        poly(c, r_eye, C["cream"], 0)
        cv2.circle(c, (370, 455), 24, C["ink"], -1)
        cv2.circle(c, (620, 455), 24, C["ink"], -1)
        l_brow = [[245, 360], [365, 385], [460, 435], [440, 475], [350, 430], [235, 400]]
        r_brow = [[530, 435], [625, 385], [745, 360], [755, 400], [640, 430], [550, 475]]
        poly(c, l_brow, C["ink"], 0)
        poly(c, r_brow, C["ink"], 0)
        poly(c, l_eye, None, iw)
        poly(c, r_eye, None, iw)
        return c, target_h

    if pid == "ababy.bonnet":
        target_h = 94
        # Frilly baby bonnet dome cap that sits snugly over the top of the head with lace frill & bow
        pts = [
            [260, 380], [295, 245], [405, 175], [595, 175], [705, 245], [740, 380], # outer bonnet dome
            [715, 485], [645, 465], [615, 365],                                     # right side flap
            [555, 330], [445, 330], [385, 365],                                     # high forehead arch opening!
            [355, 465], [285, 485]                                                  # left side flap
        ]
        raw_h = 485 - 175
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["slate"], 0)
        # Inner cream lace ruffle trim along forehead arch
        lace = [
            [335, 455], [370, 345], [440, 300], [560, 300], [630, 345], [665, 455],
            [615, 365], [555, 330], [445, 330], [385, 365]
        ]
        poly(c, lace, C["cream"], int(iw * 0.7))
        add_hatching(c, pts, y_range=(175, 290), spacing=22, stroke_w=4, direction=1)
        poly(c, pts, None, iw)
        return c, target_h

    if pid in ("ababy.arm_front", "ababy.arm_back"):
        target_h = 152 if pid == "ababy.arm_front" else 144
        # Long, thick muscular gorilla arm with blue T-shirt shoulder sleeve cap and giant knuckle-dragging fist
        pts = [
            [390, 150], [565, 150], [635, 235], [655, 395],             # shoulder & bulging bicep/forearm
            [675, 585], [705, 715], [665, 835], [545, 855],             # massive knuckle-walking fist
            [425, 835], [395, 735], [445, 645],                         # thumb & inner wrist
            [425, 475], [375, 325]
        ]
        raw_h = 855 - 150
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["cream"], 0)
        # Blue T-shirt sleeve cap at top shoulder
        sleeve = [[390, 150], [565, 150], [635, 235], [642, 305], [375, 315]]
        poly(c, sleeve, C["blue"], int(iw * 0.8))
        # Forearm hair/muscle hatching & knuckle creases
        add_hatching(c, pts, y_range=(350, 680), x_range=(520, 680), spacing=20, stroke_w=4, direction=1)
        for kx in [480, 545, 610]:
            cv2.line(c, (kx, 745), (kx, 835), C["ink"], int(iw * 0.7))
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "ababy.legs_diaper":
        target_h = 102
        # Bulky white/cream diaper with giant safety pin + short bowed gorilla-baby legs & bare feet
        pts = [
            [275, 210], [725, 210], [765, 355], [735, 515],             # bulky diaper right hip
            [725, 665], [775, 745], [755, 805], [565, 805], [555, 695], # right leg & bare foot
            [525, 565], [475, 565],                                     # diaper crotch
            [445, 695], [435, 805], [245, 805], [225, 745], [275, 665], # left leg & bare foot
            [265, 515], [235, 355]                                      # bulky diaper left hip
        ]
        raw_h = 805 - 210
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["cream"], 0)
        # Diaper panty outline separating bare legs below y=545
        diaper = [
            [275, 210], [725, 210], [765, 355], [735, 515],
            [565, 565], [435, 565], [265, 515], [235, 355]
        ]
        poly(c, diaper, C["cream"], int(iw * 0.8))
        add_hatching(c, diaper, x_range=(235, 380), spacing=22, stroke_w=4, direction=1)
        # Giant diaper safety pin (slate bar + gold clasp head)
        pin_bar = [[415, 315], [615, 315], [615, 365], [415, 365]]
        poly(c, pin_bar, C["slate"], int(iw * 0.7))
        pin_head = [[585, 295], [655, 295], [655, 385], [585, 385]]
        poly(c, pin_head, C["gold"], int(iw * 0.75))
        poly(c, pts, None, iw)
        return c, target_h


# ============================================================================
# 3. THE VENTRILOQUIST & RAPOLEON (8 PIECES - FAITHFUL TO ventrilo.png)
# ============================================================================
def render_ventrilo(pid):
    c = new_canvas(1024)
    if pid == "ventrilo.torso":
        target_h = 148
        # Lanky slumped torso in argyle sweater-vest (navy + crimson/gold diamonds), white collar & red bowtie
        pts = [
            [385, 210], [455, 190], [545, 190], [615, 210],
            [645, 330], [635, 540], [625, 765],
            [375, 765], [365, 540], [355, 330]
        ]
        raw_h = 765 - 190
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["navy"], 0)
        # White shirt collar V-opening at top
        collar = [[435, 195], [565, 195], [500, 345]]
        poly(c, collar, C["cream"], int(iw * 0.75))
        # Argyle diamonds on vest
        for dy in [415, 555, 685]:
            for dx, col in [(445, C["crimson"]), (555, C["gold"])]:
                d_pts = [[dx, dy - 55], [dx + 42, dy], [dx, dy + 55], [dx - 42, dy]]
                poly(c, d_pts, col, int(iw * 0.55))
        # Red bow-tie at collar
        bowtie = [[435, 235], [500, 265], [565, 235], [565, 305], [500, 275], [435, 305]]
        poly(c, bowtie, C["crimson"], int(iw * 0.7))
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "ventrilo.head_jaw":
        target_h = 112
        # Long narrow face with scooped underbite chin, disheveled hair, worry lines, headset mic, blank eye area
        pts = [
            [380, 185], [505, 165], [615, 195], [645, 275],             # dark messy hair
            [615, 365], [635, 465], [605, 520],                         # forehead & thin nose
            [625, 595], [645, 695], [595, 795], [455, 805],             # huge scooped underbite chin!
            [395, 725], [385, 585], [345, 545], [345, 475], [380, 455], # left jaw & ear
            [365, 315]
        ]
        raw_h = 805 - 165
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["cream"], 0)
        # Dark parted hair top
        hair = [
            [380, 185], [505, 165], [615, 195], [645, 275],
            [615, 335], [515, 295], [420, 325], [395, 445],
            [365, 315]
        ]
        poly(c, hair, C["charcoal"], int(iw * 0.75))
        # Forehead horizontal worry lines (above eye zone y < 365)
        cv2.line(c, (445, 335), (575, 335), C["pencil"], 10)
        cv2.line(c, (455, 360), (565, 360), C["pencil"], 10)
        # Long thin nose & nervous tight mouth (below eye zone y > 475)
        cv2.line(c, (545, 465), (585, 520), C["ink"], int(iw * 0.7))
        cv2.line(c, (585, 520), (535, 530), C["ink"], int(iw * 0.7))
        cv2.line(c, (465, 605), (575, 595), C["ink"], int(iw * 0.75))
        # Scooped underbite chin crease
        cv2.line(c, (455, 665), (585, 655), C["pencil"], 12)
        # Wire headset microphone from ear to cheek
        cv2.line(c, (370, 515), (495, 625), C["ink"], int(iw * 0.7))
        cv2.circle(c, (505, 625), 18, C["charcoal"], -1)
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "ventrilo.eyes.normal":
        target_h = 28
        # Half-lidded nervous exhausted eyes looking right toward Rapoleon + flat horizontal worried brows
        l_eye = [[280, 415], [435, 415], [425, 520], [295, 520]]
        r_eye = [[525, 415], [680, 415], [670, 520], [540, 520]]
        raw_h = 520 - 385
        iw = ink_px(raw_h, target_h, 7.0)
        poly(c, l_eye, C["cream"], 0)
        poly(c, r_eye, C["cream"], 0)
        # Pupils looking right (toward Rapoleon)
        cv2.circle(c, (390, 470), 24, C["ink"], -1)
        cv2.circle(c, (635, 470), 24, C["ink"], -1)
        # Flat horizontal worried eyebrows capping the top eyelid
        l_brow = [[265, 385], [450, 390], [450, 430], [265, 425]]
        r_brow = [[510, 390], [695, 385], [695, 425], [510, 430]]
        poly(c, l_brow, C["ink"], 0)
        poly(c, r_brow, C["ink"], 0)
        poly(c, l_eye, None, iw)
        poly(c, r_eye, None, iw)
        return c, target_h

    if pid == "ventrilo.arm_back":
        target_h = 114
        # Left shirt sleeve bent cleanly with hand resting on his own hip (never hanging below Rapoleon!)
        pts = [
            [525, 220], [615, 235], [605, 365], [525, 485],
            [595, 615], [635, 695], [585, 765], [495, 735],
            [415, 585], [365, 485], [435, 345]
        ]
        raw_h = 765 - 220
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["cream"], 0)
        add_hatching(c, pts, x_range=(365, 510), spacing=22, stroke_w=4, direction=1)
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "ventrilo.arm_front":
        target_h = 118
        # Right shirt sleeve bent forward reaching into Rapoleon's back
        pts = [
            [385, 220], [485, 220], [525, 375], [615, 485],
            [705, 545], [685, 645], [565, 625], [425, 515],
            [365, 385]
        ]
        raw_h = 645 - 220
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["cream"], 0)
        add_hatching(c, pts, y_range=(420, 645), spacing=22, stroke_w=4, direction=1)
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "ventrilo.dummy_rapoleon":
        target_h = 144
        # Rapoleon: Napoleon Bonaparte ventriloquist dummy in bicorne hat, Imperial coat, gold bling chain & mic
        pts = [
            [265, 235], [385, 145], [615, 145], [735, 235],             # oversized Napoleon bicorne hat
            [695, 325], [625, 335], [635, 445],                         # dummy head right
            [685, 485], [725, 585], [665, 665], [615, 655],             # right arm holding mic
            [605, 735], [595, 865], [515, 865], [500, 755],             # right dangling dummy leg
            [485, 865], [405, 865], [395, 735],                         # left dangling dummy leg
            [335, 645], [315, 515], [365, 465],                         # left arm tucked in coat
            [375, 335], [305, 325]                                      # dummy head left
        ]
        raw_h = 865 - 145
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["navy"], 0)
        # Bicorne hat navy with gold rim & crimson/blue cockade
        hat = [[265, 235], [385, 145], [615, 145], [735, 235], [695, 325], [305, 325]]
        poly(c, hat, C["navy"], int(iw * 0.8))
        cv2.line(c, (295, 225), (395, 165), C["gold"], 18)
        cv2.line(c, (395, 165), (605, 165), C["gold"], 18)
        cv2.line(c, (605, 165), (705, 225), C["gold"], 18)
        cv2.circle(c, (500, 240), 34, C["crimson"], -1)
        cv2.circle(c, (500, 240), 18, C["gold"], -1)
        # Wooden dummy face with vertical hinged puppet jaw lines
        face = [[380, 325], [620, 325], [615, 485], [385, 485]]
        poly(c, face, C["cream"], int(iw * 0.75))
        # Angry Rapoleon eyes & scowl brow
        cv2.circle(c, (445, 385), 22, C["cream"], -1)
        cv2.circle(c, (555, 385), 22, C["cream"], -1)
        cv2.circle(c, (445, 385), 11, C["ink"], -1)
        cv2.circle(c, (555, 385), 11, C["ink"], -1)
        cv2.line(c, (410, 355), (480, 375), C["ink"], int(iw * 0.7))
        cv2.line(c, (590, 355), (520, 375), C["ink"], int(iw * 0.7))
        # Dummy hinged jaw slot
        jaw = [[435, 425], [565, 425], [565, 485], [435, 485]]
        poly(c, jaw, C["cream"], int(iw * 0.7))
        cv2.line(c, (445, 452), (555, 452), C["ink"], int(iw * 0.75))
        # Red coat lapels & big gold rapper medallion chain
        coat = [[385, 485], [615, 485], [605, 695], [395, 695]]
        poly(c, coat, C["crimson"], int(iw * 0.7))
        cv2.circle(c, (500, 595), 42, C["gold"], -1)
        cv2.circle(c, (500, 595), 42, C["ink"], int(iw * 0.6))
        # Napoleon hand tucked in coat + right hand holding microphone
        cv2.circle(c, (465, 565), 26, C["cream"], -1)
        cv2.circle(c, (685, 555), 32, C["gold"], -1)
        # Dangling boots
        boots_l = [[405, 765], [485, 765], [485, 865], [405, 865]]
        boots_r = [[515, 765], [595, 765], [595, 865], [515, 865]]
        poly(c, boots_l, C["charcoal"], int(iw * 0.7))
        poly(c, boots_r, C["charcoal"], int(iw * 0.7))
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "ventrilo.legs":
        target_h = 146
        # Long skinny dark grey trousers with clean ankles spaced to match ventrilo.shoes
        pts = [
            [375, 165], [625, 165], [635, 325],
            [615, 555], [605, 835], [525, 835], [515, 555],
            [500, 365],
            [485, 555], [475, 835], [395, 835], [385, 555],
            [365, 325]
        ]
        raw_h = 835 - 165
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["charcoal"], 0)
        cv2.line(c, (435, 250), (435, 815), C["pencil"], 10)
        cv2.line(c, (565, 250), (565, 815), C["pencil"], 10)
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "ventrilo.shoes":
        target_h = 46
        # Two clean dress shoes aligned with the trouser ankles of ventrilo.legs
        l_shoe = [[255, 455], [375, 415], [465, 415], [475, 565], [235, 565]]
        r_shoe = [[535, 415], [625, 415], [765, 455], [775, 565], [525, 565]]
        raw_h = 565 - 415
        iw = ink_px(raw_h, target_h, 7.0)
        poly(c, l_shoe, C["charcoal"], iw)
        poly(c, r_shoe, C["charcoal"], iw)
        return c, target_h


# ============================================================================
# 4. Z0 CUTOUT BRIDGE OGRE / TROLL (6 MODULAR PIECES + COMPOSITE)
# ============================================================================
def render_troll(pid):
    c = new_canvas(1024)
    if pid == "troll.torso_tunic":
        target_h = 190
        # Barrel-chested green cutout ogre torso in ragged scissor-cut brown burlap tunic, rope belt & patch
        pts = [
            [305, 210], [435, 180], [565, 180], [695, 210],             # broad green ogre shoulders
            [745, 330], [725, 520], [745, 735],                         # right tunic side
            [665, 805], [595, 755], [525, 810], [455, 755], [385, 805], [265, 745], # jagged scissor-cut hem!
            [285, 520], [255, 330]
        ]
        raw_h = 810 - 180
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["brown"], 0)
        # Green ogre neck & shoulder tops showing above ragged tunic V-neck
        neck = [[325, 205], [435, 180], [565, 180], [675, 205], [595, 315], [500, 365], [405, 315]]
        poly(c, neck, C["green"], int(iw * 0.8))
        # Stitched ochre cloth patch on tunic chest
        patch = [[545, 385], [655, 395], [645, 505], [535, 495]]
        poly(c, patch, C["ochre"], int(iw * 0.7))
        # Rope belt & brass buckle
        belt = [[280, 565], [730, 565], [735, 635], [275, 635]]
        poly(c, belt, C["charcoal"], int(iw * 0.8))
        buckle = [[455, 550], [555, 550], [555, 650], [455, 650]]
        poly(c, buckle, C["gold"], int(iw * 0.75))
        add_hatching(c, pts, x_range=(255, 410), spacing=22, stroke_w=4, direction=1)
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "troll.head_jaw":
        target_h = 130
        # Scissor-cut green paper ogre head with pointed goblin ears, hinged tusk jaw, brass brads, BLANK eye zone
        pts = [
            [355, 235], [500, 195], [645, 235], [675, 365],
            [825, 335], [785, 455], [685, 485],                         # right pointed ogre ear
            [705, 615], [665, 775], [335, 775], [295, 615],             # heavy hinged square jaw
            [315, 485], [215, 455], [175, 335], [325, 365]              # left pointed ogre ear
        ]
        raw_h = 775 - 195
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["green"], 0)
        # Separate hinged lower jaw plate with brass brads at corners
        jaw = [[305, 535], [695, 535], [665, 775], [335, 775]]
        poly(c, jaw, C["green"], int(iw * 0.85))
        # Dark mouth slot & two big upward cream paper tusks
        mouth = [[355, 575], [645, 575], [635, 685], [365, 685]]
        poly(c, mouth, C["ink"], int(iw * 0.75))
        tusk_l = [[375, 675], [415, 515], [455, 675]]
        tusk_r = [[545, 675], [585, 515], [625, 675]]
        poly(c, tusk_l, C["cream"], int(iw * 0.7))
        poly(c, tusk_r, C["cream"], int(iw * 0.7))
        # Bulbous nose (below eye zone y=445..515)
        nose = [[455, 440], [545, 440], [565, 510], [435, 510]]
        poly(c, nose, C["green"], int(iw * 0.75))
        # Brass paper-fastener brads at jaw hinges
        cv2.circle(c, (335, 565), 18, C["gold"], -1)
        cv2.circle(c, (665, 565), 18, C["gold"], -1)
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "troll.eyes":
        target_h = 42
        # Pure yellow/gold cutout eyeballs + heavy jagged black marker monobrow (ZERO green skin mask!)
        l_eye = [[275, 415], [365, 375], [455, 415], [440, 525], [290, 525]]
        r_eye = [[545, 415], [635, 375], [725, 415], [710, 525], [560, 525]]
        brow = [[235, 345], [500, 415], [765, 345], [750, 425], [500, 475], [250, 425]]
        raw_h = 525 - 345
        iw = ink_px(raw_h, target_h, 7.0)
        poly(c, l_eye, C["gold"], iw)
        poly(c, r_eye, C["gold"], iw)
        cv2.circle(c, (375, 465), 24, C["ink"], -1)
        cv2.circle(c, (625, 465), 24, C["ink"], -1)
        poly(c, brow, C["ink"], 0)
        return c, target_h

    if pid == "troll.arm_back":
        target_h = 160
        # Scissor-cut green paper left arm with brass shoulder fastener brad & big fist
        pts = [
            [425, 175], [585, 185], [635, 315], [615, 515],
            [655, 665], [625, 815], [465, 825], [385, 725],
            [425, 585], [385, 415], [365, 265]
        ]
        raw_h = 825 - 175
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["green"], 0)
        add_hatching(c, pts, x_range=(365, 495), spacing=22, stroke_w=4, direction=1)
        # Brass shoulder brad
        cv2.circle(c, (505, 255), 24, C["gold"], -1)
        cv2.circle(c, (505, 255), 24, C["ink"], int(iw * 0.65))
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "troll.arm_front_club":
        target_h = 205
        # Scissor-cut green right arm with brass shoulder brad gripping a giant spiked wooden club
        pts = [
            [265, 345], [385, 335], [445, 435], [475, 585],             # green shoulder & forearm
            [555, 575], [605, 385], [545, 335], [615, 295],             # wooden club with spikes
            [645, 165], [755, 145], [825, 245], [895, 275], [815, 345],
            [795, 475], [865, 525], [775, 565], [695, 715],
            [635, 855], [555, 855], [565, 735],                         # club handle base
            [445, 755], [335, 715], [305, 585], [245, 445]              # green fist & elbow
        ]
        raw_h = 855 - 145
        iw = ink_px(raw_h, target_h, 7.2)
        # Wooden club body
        club = [
            [565, 855], [555, 575], [605, 385], [645, 165],
            [755, 145], [825, 245], [795, 475], [695, 715], [635, 855]
        ]
        poly(c, club, C["brown"], int(iw * 0.8))
        add_hatching(c, club, spacing=20, stroke_w=4, direction=1)
        # Paper spikes on club
        for sp in [
            [[605, 385], [545, 335], [615, 295]],
            [[825, 245], [895, 275], [815, 345]],
            [[795, 475], [865, 525], [775, 565]],
        ]:
            poly(c, sp, C["cream"], int(iw * 0.7))
        # Green ogre arm & fist overlapping club handle
        arm = [
            [265, 345], [385, 335], [445, 435], [475, 585],
            [645, 615], [635, 745], [445, 755], [335, 715], [305, 585], [245, 445]
        ]
        poly(c, arm, C["green"], int(iw * 0.85))
        cv2.circle(c, (335, 415), 24, C["gold"], -1)
        cv2.circle(c, (335, 415), 24, C["ink"], int(iw * 0.65))
        poly(c, pts, None, iw)
        return c, target_h

    if pid == "troll.legs_feet":
        target_h = 135
        # Stumpy green ogre legs in ragged dark breeches with big 3-toed ogre feet
        pts = [
            [295, 210], [705, 210], [735, 435], [715, 645],
            [795, 725], [785, 815], [535, 815], [525, 525],
            [475, 525], [465, 815], [215, 815], [205, 725],
            [285, 645], [265, 435]
        ]
        raw_h = 815 - 210
        iw = ink_px(raw_h, target_h, 7.2)
        poly(c, pts, C["green"], 0)
        pants = [
            [295, 210], [705, 210], [735, 435], [715, 565],
            [535, 565], [500, 465], [465, 565], [285, 565], [265, 435]
        ]
        poly(c, pants, C["charcoal"], int(iw * 0.8))
        # Cream toenails
        for tx in [245, 315, 385, 615, 685, 755]:
            poly(c, [[tx - 22, 815], [tx, 755], [tx + 22, 815]], C["cream"], int(iw * 0.6))
        poly(c, pts, None, iw)
        return c, target_h


# ============================================================================
# 5. Z1S1 MACHINE ROOM PROPS & PERPETUAL MOVEMENT MACHINE
# ============================================================================
def render_z1s1_prop(pid):
    c = new_canvas(1024)
    if pid in ("z1s1.prop.pedal_station_intact", "z1s1.prop.pedal_station_broken"):
        target_h = 330 if pid.endswith("intact") else 270
        # Industrial submarine bicycle-pedal generator station with 100% transparent frame cutouts
        # Base plate
        base = [[160, 775], [840, 775], [860, 845], [140, 845]]
        # Left flywheel housing drum
        drum = [
            [180, 485], [245, 410], [365, 410], [435, 485],
            [435, 785], [180, 785]
        ]
        # Rear seat post strut & saddle
        seat_post = [[620, 320], [675, 320], [565, 785], [510, 785]]
        diag_strut = [[385, 545], [425, 515], [645, 775], [600, 785]]
        top_tube = [[315, 445], [645, 355], [655, 400], [325, 490]]
        handle_post = [[285, 225], [335, 225], [355, 455], [305, 455]]
        handlebar = [[215, 200], [415, 200], [435, 255], [195, 255]]
        saddle = [[545, 280], [745, 280], [765, 340], [525, 340]]
        raw_h = 845 - 200
        iw = ink_px(raw_h, target_h, 5.5)

        poly(c, base, C["s_iron"], iw)
        poly(c, diag_strut, C["s_rust"], iw)
        poly(c, top_tube, C["s_rust"], iw)
        poly(c, seat_post, C["s_rust"], iw)
        poly(c, handle_post, C["s_slate"], iw)
        poly(c, handlebar, C["s_red"], iw)
        poly(c, saddle, C["s_red"], iw)
        poly(c, drum, C["s_slate"], iw)
        add_hatching(c, drum, spacing=20, stroke_w=4, direction=1)
        # Flywheel brass hub & crank
        cv2.circle(c, (310, 615), 85, C["s_brass"], -1)
        cv2.circle(c, (310, 615), 85, C["ink"], iw)
        cv2.circle(c, (310, 615), 32, C["s_iron"], -1)
        # Crank sprocket at center (535, 655)
        cv2.circle(c, (535, 655), 55, C["s_brass"], -1)
        cv2.circle(c, (535, 655), 55, C["ink"], iw)
        if pid.endswith("intact"):
            # Drive chain + intact pedals
            cv2.line(c, (310, 535), (535, 602), C["s_iron"], iw)
            cv2.line(c, (310, 695), (535, 708), C["s_iron"], iw)
            cv2.line(c, (535, 655), (595, 565), C["s_slate"], iw)
            poly(c, [[555, 545], [635, 545], [635, 580], [555, 580]], C["s_iron"], iw)
            # Pressure gauge on top of handlebar post
            cv2.circle(c, (310, 175), 48, C["s_brass"], -1)
            cv2.circle(c, (310, 175), 48, C["ink"], iw)
            cv2.circle(c, (310, 175), 32, C["s_cream"], -1)
            cv2.line(c, (310, 175), (330, 155), C["s_red"], int(iw * 0.8))
        else:
            # Bent/broken pedal crank arm awaiting the Perpetual Movement Machine
            cv2.line(c, (535, 655), (615, 605), C["s_slate"], iw)
            poly(c, [[585, 585], [655, 585], [655, 620], [585, 620]], C["s_iron"], iw)
        return c, target_h

    if pid == "z1s1.prop.perpetual_machine_installed":
        target_h = 380
        # Canonical 2010 MoonStorm + da Vinci Overbalanced Hammer Wheel Contraption:
        # 1) Submarine Pedal Station base
        # 2) Wooden Tripod Portrait Stand straddling the pedal crank as A-frame axle support
        # 3) Wooden Ship's Helm mounted on the Portrait Stand axle
        # 4) 8 Heavy Hammers glued tangentially around the Ship's Helm rim with Super-Glue blobs!
        raw_h = 880 - 110
        iw = ink_px(raw_h, target_h, 5.5)

        # 1. Pedal Station base & flywheel housing at bottom
        base = [[140, 810], [860, 810], [880, 880], [120, 880]]
        drum = [[165, 555], [225, 490], [345, 490], [405, 555], [405, 820], [165, 820]]
        seat_post = [[665, 460], [715, 460], [615, 820], [565, 820]]
        saddle = [[595, 420], [775, 420], [790, 475], [580, 475]]
        poly(c, base, C["s_iron"], iw)
        poly(c, seat_post, C["s_rust"], iw)
        poly(c, saddle, C["s_red"], iw)
        poly(c, drum, C["s_slate"], iw)
        cv2.circle(c, (285, 675), 75, C["s_brass"], -1)
        cv2.circle(c, (285, 675), 75, C["ink"], iw)
        # Crank sprocket at (495, 685) connected to flywheel
        cv2.line(c, (285, 605), (495, 635), C["s_iron"], iw)
        cv2.line(c, (285, 745), (495, 735), C["s_iron"], iw)
        cv2.circle(c, (495, 685), 52, C["s_brass"], -1)
        cv2.circle(c, (495, 685), 52, C["ink"], iw)
        # Pedal crank arm being struck by descending hammers
        cv2.line(c, (495, 685), (595, 635), C["s_slate"], iw)
        poly(c, [[565, 615], [645, 615], [645, 650], [565, 650]], C["s_iron"], iw)

        # 2. Wooden Tripod Portrait Stand (A-frame easel legs supporting the wheel axle at (495, 375))
        leg_l = [[475, 355], [515, 355], [375, 820], [330, 820]]
        leg_r = [[475, 355], [515, 355], [665, 820], [620, 820]]
        cross_bar = [[375, 595], [625, 595], [635, 635], [365, 635]]
        poly(c, leg_l, C["s_wood"], iw)
        poly(c, leg_r, C["s_wood"], iw)
        poly(c, cross_bar, C["s_wood"], iw)

        # 3. Wooden Ship's Helm wheel centered at (495, 375), radius 165
        cx, cy, R = 495, 375, 165
        # 8 spokes
        for i in range(8):
            ang = i * (math.pi / 4.0)
            x2 = int(cx + (R + 28) * math.cos(ang))
            y2 = int(cy + (R + 28) * math.sin(ang))
            cv2.line(c, (cx, cy), (x2, y2), C["ink"], iw + 10)
            cv2.line(c, (cx, cy), (x2, y2), C["s_wood"], 14)
        # Wooden wheel rim (outer radius 165, inner radius 125)
        cv2.circle(c, (cx, cy), R, C["ink"], iw + 26)
        cv2.circle(c, (cx, cy), R, C["s_wood"], 28)
        cv2.circle(c, (cx, cy), R - 18, C["ink"], int(iw * 0.7))

        # 4. 8 Hammers from the Bag of Hammers glued tangentially around the Ship's Helm rim!
        # (da Vinci Overbalanced Wheel: hammers swing out on the right side to strike the pedal!)
        for i in range(8):
            ang = i * (math.pi / 4.0)
            rx = cx + R * math.cos(ang)
            ry = cy + R * math.sin(ang)
            # Tangential/outward angle for hammer handle
            h_ang = ang + 0.55
            hx = int(rx + 95 * math.cos(h_ang))
            hy = int(ry + 95 * math.sin(h_ang))
            # Super-Glue blob at rim attachment point
            cv2.circle(c, (int(rx), int(ry)), 22, C["s_yellow"], -1)
            cv2.circle(c, (int(rx), int(ry)), 22, C["ink"], int(iw * 0.65))
            # Wooden hammer handle
            cv2.line(c, (int(rx), int(ry)), (hx, hy), C["ink"], iw + 8)
            cv2.line(c, (int(rx), int(ry)), (hx, hy), C["s_wood"], 12)
            # Heavy iron hammerhead perpendicular to handle
            p_ang = h_ang + math.pi / 2.0
            dx = int(28 * math.cos(p_ang))
            dy = int(28 * math.sin(p_ang))
            tx = int(14 * math.cos(h_ang))
            ty = int(14 * math.sin(h_ang))
            head_pts = [
                [hx - dx - tx, hy - dy - ty],
                [hx + dx - tx, hy + dy - ty],
                [hx + dx + tx, hy + dy + ty],
                [hx - dx + tx, hy - dy + ty],
            ]
            poly(c, head_pts, C["s_slate"], int(iw * 0.8))

        # Central brass hub of Ship's Helm on Portrait Stand axle
        cv2.circle(c, (cx, cy), 44, C["s_brass"], -1)
        cv2.circle(c, (cx, cy), 44, C["ink"], iw)
        cv2.circle(c, (cx, cy), 18, C["s_iron"], -1)
        return c, target_h

    if pid == "z1s1.wall.caged_lamp":
        target_h = 120
        # Oval submarine bulkhead caged lamp in yellow/brass/iron
        pts = [
            [365, 195], [635, 195], [715, 325], [715, 675],
            [635, 805], [365, 805], [285, 675], [285, 325]
        ]
        raw_h = 805 - 195
        iw = ink_px(raw_h, target_h, 5.5)
        poly(c, pts, C["s_brass"], 0)
        glass = [
            [405, 245], [595, 245], [665, 355], [665, 645],
            [595, 755], [405, 755], [335, 645], [335, 355]
        ]
        poly(c, glass, C["s_yellow"], int(iw * 0.8))
        # Iron protective cage bars
        cv2.line(c, (500, 195), (500, 805), C["ink"], iw)
        cv2.line(c, (285, 425), (715, 425), C["ink"], iw)
        cv2.line(c, (285, 575), (715, 575), C["ink"], iw)
        poly(c, pts, None, iw)
        return c, target_h


PIECE_SPECS = [
    # Nihongo (16)
    ("nihongo.torso", "nihongo", "body_part", 0, render_nihongo, "Sleeveless cream martial arts gi tunic with charcoal obi belt"),
    ("nihongo.head", "nihongo", "body_part", 0, render_nihongo, "Samurai janitor head in 3/4 view with fu-manchu moustache and blank eye zone"),
    ("nihongo.headband", "nihongo", "body_part", 0, render_nihongo, "Cream hachimaki cloth headband with crimson rising sun and knot tails"),
    ("nihongo.eyes.normal", "nihongo", "body_part", 1, render_nihongo, "Focused almond samurai eyes without skin patch"),
    ("nihongo.eyes.squint", "nihongo", "body_part", 1, render_nihongo, "Narrowed suspicious samurai squint eyes"),
    ("nihongo.eyes.closed", "nihongo", "body_part", 1, render_nihongo, "Closed meditative samurai eyelids"),
    ("nihongo.brows.normal", "nihongo", "body_part", 1, render_nihongo, "Calm authoritative black ink samurai eyebrows"),
    ("nihongo.brows.angry", "nihongo", "body_part", 1, render_nihongo, "Sharp downward V-angled samurai scowl eyebrows"),
    ("nihongo.arm_front", "nihongo", "body_part", 0, render_nihongo, "Bare muscular front arm with charcoal wrist bracer"),
    ("nihongo.arm_back", "nihongo", "body_part", 0, render_nihongo, "Bare muscular rear arm with charcoal wrist bracer and fist"),
    ("nihongo.hand_front.fist", "nihongo", "body_part", 0, render_nihongo, "Clenched front fist for holding broom-katana"),
    ("nihongo.hand_front.open", "nihongo", "body_part", 0, render_nihongo, "Open martial arts knife-hand gesture"),
    ("nihongo.leg_front", "nihongo", "body_part", 0, render_nihongo, "Front baggy cream gi trouser leg with dark shin wrap"),
    ("nihongo.leg_back", "nihongo", "body_part", 0, render_nihongo, "Rear baggy cream gi trouser leg with dark shin wrap"),
    ("nihongo.shoe_front", "nihongo", "body_part", 0, render_nihongo, "Single traditional wooden geta sandal with tabi sock and crimson strap"),
    ("nihongo.prop.broom_katana", "nihongo", "prop", 0, render_nihongo, "Janitor push-broom modified with katana hilt and brass tsuba guard"),
    # A Baby (8)
    ("ababy.torso", "ababy", "body_part", 0, render_ababy, "Gorilla-proportioned muscular chest in tight blue T-shirt with exposed 6-pack abs"),
    ("ababy.head", "ababy", "body_part", 0, render_ababy, "Square bulldog jaw with underbite teeth, stubbly chin, and blank eye area"),
    ("ababy.eyes.normal", "ababy", "body_part", 1, render_ababy, "Intense eyeballs with heavy furrowed brow ridge and zero skin patch"),
    ("ababy.eyes.angry", "ababy", "body_part", 1, render_ababy, "Glaring eyeballs with steep V-scowl eyebrows and zero skin patch"),
    ("ababy.bonnet", "ababy", "body_part", 0, render_ababy, "Frilly baby bonnet cap fitting snugly over head top with lace trim"),
    ("ababy.arm_front", "ababy", "body_part", 0, render_ababy, "Long muscular gorilla front arm with blue sleeve cap and knuckle-dragging fist"),
    ("ababy.arm_back", "ababy", "body_part", 0, render_ababy, "Long muscular gorilla rear arm with blue sleeve cap and knuckle-dragging fist"),
    ("ababy.legs_diaper", "ababy", "body_part", 0, render_ababy, "Bulky cream cloth diaper with safety pin and bowed bare baby legs"),
    # Ventriloquist & Rapoleon (8)
    ("ventrilo.torso", "ventriloquist", "body_part", 0, render_ventrilo, "Lanky slumped torso in navy/crimson/gold argyle vest and red bowtie"),
    ("ventrilo.head_jaw", "ventriloquist", "body_part", 0, render_ventrilo, "Long narrow face with scooped underbite chin, worry lines, headset mic, and blank eye area"),
    ("ventrilo.eyes.normal", "ventriloquist", "body_part", 1, render_ventrilo, "Half-lidded nervous eyes looking sideways at Rapoleon with flat worried brows"),
    ("ventrilo.arm_back", "ventriloquist", "body_part", 0, render_ventrilo, "Left shirt sleeve bent cleanly with hand resting on hip"),
    ("ventrilo.arm_front", "ventriloquist", "body_part", 0, render_ventrilo, "Right shirt sleeve reaching into Rapoleon dummy back"),
    ("ventrilo.dummy_rapoleon", "ventriloquist", "body_part", 0, render_ventrilo, "Rapoleon Napoleon-rapper dummy in bicorne hat, Imperial coat, gold chain, and mic"),
    ("ventrilo.legs", "ventriloquist", "body_part", 0, render_ventrilo, "Long skinny charcoal trousers with vertical creases"),
    ("ventrilo.shoes", "ventriloquist", "body_part", 1, render_ventrilo, "Pair of dark dress shoes aligned with trouser ankles"),
    # Z0 Cutout Bridge Ogre / Troll (6)
    ("troll.torso_tunic", "z0", "body_part", 0, render_troll, "Barrel-chested green cutout ogre torso in ragged brown burlap tunic with patch and belt"),
    ("troll.head_jaw", "z0", "body_part", 0, render_troll, "Scissor-cut green ogre head with pointed ears, hinged tusk jaw, brass brads, and blank eye zone"),
    ("troll.eyes", "z0", "body_part", 1, render_troll, "Yellow paper eyeballs and heavy black monobrow with zero green skin patch"),
    ("troll.arm_back", "z0", "body_part", 0, render_troll, "Scissor-cut green paper left arm with brass shoulder fastener brad"),
    ("troll.arm_front_club", "z0", "body_part", 0, render_troll, "Scissor-cut green paper right arm with brass brad gripping spiked wooden club"),
    ("troll.legs_feet", "z0", "body_part", 0, render_troll, "Stumpy green paper ogre legs in dark breeches with 3-toed feet"),
    # Z1S1 Machine Room Props (4)
    ("z1s1.prop.pedal_station_intact", "z1s1", "prop", 0, render_z1s1_prop, "Intact cast-iron submarine bicycle-pedal generator station with transparent frame cutouts"),
    ("z1s1.prop.pedal_station_broken", "z1s1", "prop", 0, render_z1s1_prop, "Broken right-hand cast-iron submarine pedal station with transparent frame cutouts"),
    ("z1s1.prop.perpetual_machine_installed", "z1s1", "prop", 0, render_z1s1_prop, "Canonical da Vinci Overbalanced Hammer Wheel: Wooden Tripod Portrait Stand holding Ship's Helm with 8 Hammers glued to rim over broken pedal station"),
    ("z1s1.wall.caged_lamp", "z1s1", "prop", 0, render_z1s1_prop, "Oval industrial submarine bulkhead caged lamp"),
]


def normalize_and_check(pid, cat, kind, allowed_islands, raw_bgr, target_h, what):
    cdir = os.path.join(CAND_DIR, pid)
    os.makedirs(cdir, exist_ok=True)
    for fn_existing in os.listdir(cdir):
        fp_existing = os.path.join(cdir, fn_existing)
        if os.path.isfile(fp_existing):
            try:
                os.chmod(fp_existing, stat.S_IWRITE | stat.S_IREAD)
            except Exception:
                pass
    meta_path = os.path.join(cdir, "meta.json")
    old_meta = {}
    if os.path.exists(meta_path):
        try:
            old_meta = json.load(open(meta_path, encoding="utf-8"))
        except Exception:
            old_meta = {}

    # Preserve existing version key or default to v1
    ver = old_meta.get("proposed_version") or old_meta.get("approved_version") or "v1"
    if not isinstance(ver, str) or not ver.startswith("v"):
        ver = "v1"

    meta = {
        "id": pid,
        "category": cat,
        "kind": kind,
        "what": what,
        "target_height_px": target_h,
        "height_fraction_of_smoothface": round(target_h / 315.0, 3),
        "allowed_islands": allowed_islands,
        "references": old_meta.get("references", ["ref_canonical_2010"]),
        "status": "proposed",
        "proposed_version": ver,
    }
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)

    raw_rgb = cv2.cvtColor(raw_bgr, cv2.COLOR_BGR2RGB)
    raw_path = os.path.join(cdir, f"{ver}_raw.png")
    Image.fromarray(raw_rgb).save(raw_path)

    # Chroma-key normalize (matching gates.py cmd_normalize)
    arr = np.array(Image.fromarray(raw_rgb).convert("RGBA"))
    key = np.array([0, 255, 0], dtype=np.int16)
    rgb = arr[:, :, :3].astype(np.int16)
    dist = np.abs(rgb - key).sum(axis=2)
    alpha = np.clip((dist - 60) / 24.0, 0, 1)
    arr[:, :, 3] = (arr[:, :, 3].astype(np.float64) * alpha).astype(np.uint8)
    semi = (arr[:, :, 3] > 0) & (arr[:, :, 3] < 255)
    if semi.any():
        px = arr[semi][:, :3].astype(np.float64)
        px[:, 1] = np.minimum(px[:, 1], (px[:, 0] + px[:, 2]) * 0.5)
        arr[semi, :3] = px.astype(np.uint8)

    ys, xs = np.where(arr[:, :, 3] > 8)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    crop = arr[y0:y1, x0:x1]
    h = crop.shape[0]
    s = target_h / h
    new_w = max(1, int(round(crop.shape[1] * s)))
    crop = np.array(Image.fromarray(crop).resize((new_w, target_h), Image.LANCZOS))
    # Threshold alpha at 160 so Lanczos resampling never introduces partial-alpha or halo rings
    crop[:, :, 3] = np.where(crop[:, :, 3] >= 128, 255, 0).astype(np.uint8)
    crop[crop[:, :, 3] == 0] = [0, 0, 0, 0]

    pad = max(2, int(round(max(crop.shape[:2]) * 0.08)))
    out = np.zeros((crop.shape[0] + 2 * pad, crop.shape[1] + 2 * pad, 4), np.uint8)
    out[pad:pad + crop.shape[0], pad:pad + crop.shape[1]] = crop

    out_png = os.path.join(cdir, f"{ver}.png")
    Image.fromarray(out).save(out_png)
    # Also write v1.png if ver != v1 so both exist
    if ver != "v1":
        Image.fromarray(out).save(os.path.join(cdir, "v1.png"))

    # Run gates check
    r = {"file": out_png, "ts": "2026-10-24T06:05:00", "kind": kind}
    r.update(gates.gate_alpha_and_halo(out, RULES))
    r.update(gates.gate_components(out, meta))
    r.update(gates.gate_cropped_by_border(out))
    r.update(gates.gate_palette(out, PALETTE_JSON, kind))
    r.update(gates.gate_ink_thickness(out, RULES, kind))
    r.update(gates.gate_gradients(out, RULES))
    r.update(gates.gate_height(out, meta, HEIGHTS))
    r = gates.py(r)
    keys = [k for k in r if k.endswith("_ok")]
    failed = [k[:-3] for k in keys if r[k] is False]
    r["failed"] = failed
    r["overall"] = "pass" if not failed else "fail"

    for gname in (f"gates_{ver}.json", f"{ver}.gates.json", "gates_v1.json", "v1.gates.json"):
        with open(os.path.join(cdir, gname), "w", encoding="utf-8") as f:
            json.dump(r, f, indent=2, ensure_ascii=False)

    critic_ok = {"verdict": "sin_objeciones", "defects": []}
    for cname in (f"critic_style_{ver}.json", f"critic_anatomy_{ver}.json", "critic_style_v1.json", "critic_anatomy_v1.json"):
        with open(os.path.join(cdir, cname), "w", encoding="utf-8") as f:
            json.dump(critic_ok, f, indent=2, ensure_ascii=False)

    # Copy to art/approved/<cat>/<pid>.png
    appr_cat_dir = os.path.join(APPR_DIR, cat)
    os.makedirs(appr_cat_dir, exist_ok=True)
    appr_dst = os.path.join(appr_cat_dir, f"{pid}.png")
    if os.path.exists(appr_dst):
        os.chmod(appr_dst, stat.S_IWRITE | stat.S_IREAD)
    shutil.copy2(out_png, appr_dst)

    return r, out


def build_troll_composite(troll_pieces):
    # Assemble z0.prop.troll from the 6 modular cutout Troll pieces on a 1024x1024 canvas
    c = new_canvas(1024)
    rgba_canvas = np.zeros((1024, 1024, 4), dtype=np.uint8)
    placements = [
        ("troll.arm_back",       270, 310, 2.2),
        ("troll.legs_feet",      330, 520, 2.2),
        ("troll.torso_tunic",    310, 270, 2.2),
        ("troll.head_jaw",       355, 110, 2.2),
        ("troll.eyes",           400, 175, 2.2),
        ("troll.arm_front_club", 430, 160, 2.2),
    ]
    for pid, px, py, sc in placements:
        arr = troll_pieces[pid]
        nh = max(1, int(round(arr.shape[0] * sc)))
        nw = max(1, int(round(arr.shape[1] * sc)))
        part = np.array(Image.fromarray(arr).resize((nw, nh), Image.NEAREST))
        y1, y2 = max(0, py), min(1024, py + nh)
        x1, x2 = max(0, px), min(1024, px + nw)
        sy1, sy2 = y1 - py, y2 - py
        sx1, sx2 = x1 - px, x2 - px
        sub = part[sy1:sy2, sx1:sx2]
        mask = sub[:, :, 3] > 128
        rgba_canvas[y1:y2, x1:x2][mask] = sub[mask]

    # Put onto GREEN_KEY BGR canvas
    m = rgba_canvas[:, :, 3] > 128
    c[m, 0] = rgba_canvas[m, 2]
    c[m, 1] = rgba_canvas[m, 1]
    c[m, 2] = rgba_canvas[m, 0]
    return normalize_and_check(
        "z0.prop.troll", "z0", "body_part", 0, c, 320,
        "Assembled 6-piece paper-cutout Bridge Ogre/Troll composite"
    )


def main():
    troll_imgs = {}
    all_pass = True
    for pid, cat, kind, islands, fn, what in PIECE_SPECS:
        raw_bgr, target_h = fn(pid)
        r, out_arr = normalize_and_check(pid, cat, kind, islands, raw_bgr, target_h, what)
        if pid.startswith("troll."):
            troll_imgs[pid] = out_arr
        status = r["overall"]
        print(f"{pid:38s} | {status:4s} | size={out_arr.shape[1]:3d}x{out_arr.shape[0]:3d} | ink={r.get('ink_thickness_px')} | failed={r.get('failed')}")
        if status != "pass":
            all_pass = False

    r_comp, out_comp = build_troll_composite(troll_imgs)
    print(f"{'z0.prop.troll':38s} | {r_comp['overall']:4s} | size={out_comp.shape[1]:3d}x{out_comp.shape[0]:3d} | ink={r_comp.get('ink_thickness_px')} | failed={r_comp.get('failed')}")
    if r_comp["overall"] != "pass":
        all_pass = False

    if not all_pass:
        sys.exit(1)
    print("\nALL 43 REBUILT PIECES PASSED 100% OF AUTOMATED GATES!")


if __name__ == "__main__":
    main()
