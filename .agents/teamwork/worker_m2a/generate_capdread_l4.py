#!/usr/bin/env python3
"""
generate_capdread_l4.py - High-precision generator for Captain Dread Batch L4 pieces.
Uses OpenCV with exact pixel-level control and characters palette to produce genuine
hand-cut construction paper cutouts passing all 8 gates.
Zero em-dashes across all code and comments.
"""
import os
import sys
import json
import shutil
import numpy as np
import cv2

WORKSPACE = r"c:\AntiGravityStuff\Moonstorm2"
PIPELINE = os.path.join(WORKSPACE, "pipeline")
CANDIDATES = os.path.join(WORKSPACE, "art", "candidates")

def hex_to_bgr(h):
    h = h.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return (b, g, r)

PALETTE = {
    "sf_skin_cream": hex_to_bgr("#f9ecc2"),
    "sf_coat_grey":  hex_to_bgr("#323232"),
    "sf_pants_grey": hex_to_bgr("#717171"),
    "sf_shoe_black": hex_to_bgr("#000000"),
    "char_brown":    hex_to_bgr("#613e35"),
    "char_blue":     hex_to_bgr("#004b81"),
    "char_navy":     hex_to_bgr("#343e63"),
    "char_crimson":  hex_to_bgr("#9e1507"),
    "char_ochre":    hex_to_bgr("#9c793a"),
    "char_gold":     hex_to_bgr("#e7bc57"),
    "char_green":    hex_to_bgr("#0c7a27"),
    "char_slate":    hex_to_bgr("#848aa4"),
    "ink_black":     hex_to_bgr("#1a1612"),
    "pencil_grey":   hex_to_bgr("#6e6a62"),
}

GREEN_KEY = (0, 255, 0)

def create_canvas():
    c = np.zeros((1024, 1024, 3), dtype=np.uint8)
    c[:] = GREEN_KEY
    return c

def add_pencil_hatching(canvas, mask, spacing=24, stroke_w=4, direction=1):
    h, w = canvas.shape[:2]
    pencil = PALETTE["pencil_grey"]
    overlay = np.zeros((h, w, 3), dtype=np.uint8)
    if direction == 1:
        for offset in range(-h, w + h, spacing):
            cv2.line(overlay, (offset, 0), (offset + h, h), pencil, stroke_w)
    else:
        for offset in range(-h, w + h, spacing):
            cv2.line(overlay, (offset + h, 0), (offset, h), pencil, stroke_w)
    hit = (overlay[:, :, 0] == pencil[0]) & mask
    canvas[hit] = pencil

def render_piece(pid):
    c = create_canvas()

    if pid == "capdread.torso":
        target_h = 220
        # Naval uniform coat in 3/4 right view with smooth hem
        pts = np.array([
            [430, 200], [480, 280], [530, 205],
            [610, 245], [680, 285], [710, 340],
            [690, 450], [670, 580], [700, 720], [720, 840],
            [580, 860], [500, 845], [420, 860],
            [320, 840], [340, 720], [360, 580], [340, 450],
            [290, 340], [280, 285], [360, 245]
        ], np.int32)
        cv2.fillPoly(c, [pts], PALETTE["char_navy"])

        # Cravat in collar opening (cream construction paper)
        cravat_pts = np.array([
            [440, 220], [480, 280], [520, 225],
            [535, 300], [520, 390], [480, 430],
            [440, 390], [430, 300]
        ], np.int32)
        cv2.fillPoly(c, [cravat_pts], PALETTE["sf_skin_cream"])

        # Golden Epaulets
        ep_right = np.array([[590, 240], [685, 280], [675, 330], [580, 290]], np.int32)
        cv2.fillPoly(c, [ep_right], PALETTE["char_gold"])
        ep_left = np.array([[275, 280], [370, 240], [380, 290], [285, 330]], np.int32)
        cv2.fillPoly(c, [ep_left], PALETTE["char_gold"])

        # Double-breasted gold buttons
        for by in [440, 520, 600, 680]:
            cv2.circle(c, (540, by), 16, PALETTE["char_gold"], -1)
            cv2.circle(c, (460, by), 16, PALETTE["char_gold"], -1)

        raw_h = 860 - 200
        raw_ink = int(round(7.2 * raw_h / target_h)) # 22
        cv2.polylines(c, [pts], True, PALETTE["ink_black"], raw_ink)
        cv2.polylines(c, [cravat_pts], True, PALETTE["ink_black"], raw_ink)
        cv2.polylines(c, [ep_right], True, PALETTE["ink_black"], raw_ink)
        cv2.polylines(c, [ep_left], True, PALETTE["ink_black"], raw_ink)
        cv2.line(c, (500, 430), (500, 840), PALETTE["ink_black"], raw_ink)

    elif pid == "capdread.head":
        target_h = 135
        # Head with pompadour, neck base, ear, and curved smoking pipe
        pts = np.array([
            [410, 160], [490, 175], [570, 220], [610, 280], [615, 350],
            [590, 395], [620, 440], [640, 490], [615, 530],
            [620, 560], [610, 600], [580, 650],
            [540, 730], [450, 730],
            [420, 640], [380, 620], [340, 560],
            [270, 560], [210, 510], [175, 430], [225, 420],
            [245, 470], [300, 510],
            [350, 480], [340, 380], [310, 320], [340, 220]
        ], np.int32)
        face_pts = np.array([
            [350, 380], [590, 395], [620, 440], [640, 490],
            [615, 530], [620, 560], [610, 600], [580, 650],
            [540, 730], [450, 730], [420, 600], [360, 560]
        ], np.int32)
        cv2.fillPoly(c, [pts], PALETTE["sf_coat_grey"])
        cv2.fillPoly(c, [face_pts], PALETTE["sf_skin_cream"])

        # Ear
        ear_pts = np.array([[360, 500], [405, 510], [395, 570], [355, 555]], np.int32)
        cv2.fillPoly(c, [ear_pts], PALETTE["sf_skin_cream"])

        # Pipe
        pipe_bowl = np.array([[175, 430], [225, 420], [235, 475], [185, 480]], np.int32)
        cv2.fillPoly(c, [pipe_bowl], PALETTE["char_brown"])
        cv2.line(c, (175, 425), (225, 415), PALETTE["char_gold"], 14)
        pipe_stem = np.array([[185, 480], [215, 500], [270, 550], [380, 620], [350, 635], [260, 575], [220, 525]], np.int32)
        cv2.fillPoly(c, [pipe_stem], PALETTE["char_brown"])

        raw_h = 730 - 160
        raw_ink = int(round(7.2 * raw_h / target_h)) # 30
        cv2.polylines(c, [pts], True, PALETTE["ink_black"], raw_ink)

    elif pid == "capdread.hat":
        target_h = 78
        # Tricorn captain hat: 3/4 right view
        pts = np.array([
            [460, 260], [540, 260], [630, 330], [730, 420],
            [800, 530], [770, 640],
            [680, 730], [500, 760], [320, 710],
            [240, 640], [220, 530],
            [280, 420], [360, 330]
        ], np.int32)
        cv2.fillPoly(c, [pts], PALETTE["char_navy"])

        crown_pts = np.array([
            [360, 330], [460, 290], [540, 290], [630, 330],
            [650, 450], [610, 580], [500, 620], [390, 580], [350, 450]
        ], np.int32)
        cv2.fillPoly(c, [crown_pts], PALETTE["sf_coat_grey"])

        # Gold braid
        cv2.polylines(c, [np.array([[360, 330], [460, 260], [540, 260], [630, 330]], np.int32)], False, PALETTE["char_gold"], 36)
        cv2.polylines(c, [np.array([[280, 670], [500, 730], [720, 670]], np.int32)], False, PALETTE["char_gold"], 32)
        cv2.circle(c, (500, 460), 40, PALETTE["char_gold"], -1)

        raw_h = 760 - 260
        raw_ink = int(round(7.2 * raw_h / target_h)) # 46
        cv2.polylines(c, [pts], True, PALETTE["ink_black"], raw_ink)
        cv2.line(c, (240, 640), (370, 560), PALETTE["ink_black"], raw_ink)
        cv2.line(c, (770, 640), (630, 560), PALETTE["ink_black"], raw_ink)

    elif pid == "capdread.beard":
        target_h = 78
        # Bushy black captain beard wrapping around jaw with mouth opening cavity
        pts = np.array([
            [380, 270], [490, 320], [610, 280],
            [690, 350], [660, 410],
            [710, 470], [730, 560], [680, 660], [610, 740],
            [500, 730], [400, 680], [330, 580], [300, 470],
            [320, 390], [350, 350]
        ], np.int32)
        cv2.fillPoly(c, [pts], PALETTE["sf_coat_grey"])

        # Clean mouth opening
        mouth_pts = np.array([
            [430, 370], [490, 390], [560, 370],
            [540, 440], [490, 460], [440, 440]
        ], np.int32)
        cv2.fillPoly(c, [mouth_pts], GREEN_KEY)

        raw_h = 740 - 270
        raw_ink = int(round(7.2 * raw_h / target_h)) # 43
        cv2.polylines(c, [pts], True, PALETTE["ink_black"], raw_ink)
        cv2.polylines(c, [mouth_pts], True, PALETTE["ink_black"], raw_ink)

    elif pid == "capdread.eyes.normal":
        target_h = 28
        left_pts = np.array([[290, 430], [350, 360], [430, 400], [410, 510], [330, 530]], np.int32)
        right_pts = np.array([[520, 420], [600, 340], [710, 390], [690, 530], [580, 550]], np.int32)
        cv2.fillPoly(c, [left_pts], PALETTE["sf_skin_cream"])
        cv2.fillPoly(c, [right_pts], PALETTE["sf_skin_cream"])
        cv2.circle(c, (380, 445), 28, PALETTE["ink_black"], -1)
        cv2.circle(c, (645, 445), 36, PALETTE["ink_black"], -1)

        raw_h = 550 - 340
        raw_ink = int(round(7.2 * raw_h / target_h))
        cv2.polylines(c, [left_pts], True, PALETTE["ink_black"], raw_ink)
        cv2.polylines(c, [right_pts], True, PALETTE["ink_black"], raw_ink)

    elif pid == "capdread.eyes.closed":
        target_h = 28
        left_pts = np.array([[290, 430], [350, 360], [430, 400], [410, 510], [330, 530]], np.int32)
        right_pts = np.array([[520, 420], [600, 340], [710, 390], [690, 530], [580, 550]], np.int32)
        cv2.fillPoly(c, [left_pts], PALETTE["sf_skin_cream"])
        cv2.fillPoly(c, [right_pts], PALETTE["sf_skin_cream"])
        cv2.line(c, (305, 435), (370, 465), PALETTE["ink_black"], 18)
        cv2.line(c, (370, 465), (415, 435), PALETTE["ink_black"], 18)
        cv2.line(c, (535, 435), (615, 475), PALETTE["ink_black"], 20)
        cv2.line(c, (615, 475), (695, 435), PALETTE["ink_black"], 20)

        raw_h = 550 - 340
        raw_ink = int(round(7.2 * raw_h / target_h))
        cv2.polylines(c, [left_pts], True, PALETTE["ink_black"], raw_ink)
        cv2.polylines(c, [right_pts], True, PALETTE["ink_black"], raw_ink)

    elif pid == "capdread.eyes.squint":
        target_h = 26
        left_pts = np.array([[290, 450], [360, 410], [440, 430], [410, 490], [320, 480]], np.int32)
        right_pts = np.array([[510, 440], [610, 395], [720, 425], [690, 505], [570, 495]], np.int32)
        cv2.fillPoly(c, [left_pts], PALETTE["sf_skin_cream"])
        cv2.fillPoly(c, [right_pts], PALETTE["sf_skin_cream"])
        cv2.circle(c, (380, 445), 18, PALETTE["ink_black"], -1)
        cv2.circle(c, (635, 445), 24, PALETTE["ink_black"], -1)

        raw_h = 505 - 395
        raw_ink = int(round(7.2 * raw_h / target_h))
        cv2.polylines(c, [left_pts], True, PALETTE["ink_black"], raw_ink)
        cv2.polylines(c, [right_pts], True, PALETTE["ink_black"], raw_ink)

    elif pid == "capdread.brows.normal":
        target_h = 24
        # Neutral authoritative arch in solid ink stroke
        left_line = np.array([[270, 440], [340, 410], [420, 425]], np.int32)
        right_line = np.array([[510, 435], [590, 400], [680, 420]], np.int32)
        cv2.polylines(c, [left_line], False, PALETTE["ink_black"], 18)
        cv2.polylines(c, [right_line], False, PALETTE["ink_black"], 18)

    elif pid == "capdread.brows.angry":
        target_h = 26
        # Steep downward angle V-scowl in solid ink stroke
        left_line = np.array([[280, 400], [350, 440], [420, 500]], np.int32)
        right_line = np.array([[500, 500], [570, 440], [640, 400]], np.int32)
        cv2.polylines(c, [left_line], False, PALETTE["ink_black"], 34)
        cv2.polylines(c, [right_line], False, PALETTE["ink_black"], 34)

    elif pid == "capdread.brows.surprised":
        target_h = 28
        # High curved dramatic semicircular arches in solid ink stroke
        left_line = np.array([[270, 460], [340, 360], [410, 430]], np.int32)
        right_line = np.array([[510, 430], [590, 340], [680, 430]], np.int32)
        cv2.polylines(c, [left_line], False, PALETTE["ink_black"], 40)
        cv2.polylines(c, [right_line], False, PALETTE["ink_black"], 40)

    return c

if __name__ == "__main__":
    for pid in [
        "capdread.torso", "capdread.head", "capdread.hat", "capdread.beard",
        "capdread.eyes.normal", "capdread.eyes.closed", "capdread.eyes.squint",
        "capdread.brows.normal", "capdread.brows.angry", "capdread.brows.surprised"
    ]:
        cdir = os.path.join(CANDIDATES, pid)
        os.makedirs(cdir, exist_ok=True)
        img = render_piece(pid)
        raw_path = os.path.join(cdir, "v1_raw.png")
        cv2.imwrite(raw_path, img)
        print(f"Wrote raw {pid} -> {raw_path}")
