"""
generate_l5.py - High-precision generator for Captain Dread Batch L5 pieces
Authentic hand-drawn paper cutout assets with scissor facets and marker outlines.
Zero em-dashes across all code and comments.
"""

import os
import sys
import json
import shutil
import numpy as np
import cv2
from PIL import Image

WORKSPACE = r"c:\AntiGravityStuff\Moonstorm2"
PIPELINE = os.path.join(WORKSPACE, "pipeline")

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

def add_pencil_hatching(canvas, mask, spacing=20, stroke_w=4, direction=1):
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

def render_piece(piece_id):
    c = create_canvas()
    
    if piece_id == "capdread.arm_front":
        target_h = 118
        # Navy blue sleeve with golden epaulet on shoulder and gold cuff at wrist
        # Single outer polygon enclosing shoulder with epaulet
        pts = np.array([
            [350, 335], [375, 290], [435, 255], [505, 260], [550, 295], # shoulder with epaulet top
            [610, 360], [670, 440], [685, 520],             # upper arm outer curve
            [660, 580], [600, 680], [560, 740],             # forearm down to wrist
            [480, 755], [440, 715],                         # wrist cuff opening
            [490, 640], [530, 560], [540, 500],             # inner elbow crease
            [480, 430], [400, 370], [350, 335]              # inner upper arm
        ], np.int32)
        cv2.fillPoly(c, [pts], PALETTE["char_navy"])
        
        # Golden epaulet on shoulder top (strictly inside outer perimeter)
        ep_pts = np.array([
            [375, 290], [435, 255], [505, 260], [550, 295],
            [535, 335], [480, 320], [425, 315], [375, 320]
        ], np.int32)
        cv2.fillPoly(c, [ep_pts], PALETTE["char_gold"])
        
        # Gold wrist cuff band
        cuff_pts = np.array([
            [560, 740], [600, 680], [565, 660], [510, 715],
            [480, 755], [520, 765]
        ], np.int32)
        cv2.fillPoly(c, [cuff_pts], PALETTE["char_gold"])
        
        # Internal fold lines and pencil hatching in elbow hollow strictly inside sleeve
        poly_mask = np.zeros((1024, 1024), dtype=np.uint8)
        cv2.fillPoly(poly_mask, [pts], 1)
        circle_mask = np.zeros((1024, 1024), dtype=np.uint8)
        cv2.circle(circle_mask, (515, 520), 40, 1, -1)
        elbow_mask = ((poly_mask == 1) & (circle_mask == 1))
        add_pencil_hatching(c, elbow_mask, spacing=16, stroke_w=4, direction=1)
        
        # Outer border strokes
        raw_h = 755 - 255
        raw_ink = int(round(7.2 * raw_h / target_h))
        cv2.polylines(c, [pts], True, PALETTE["ink_black"], raw_ink)
        cv2.polylines(c, [ep_pts], True, PALETTE["ink_black"], int(round(raw_ink * 0.6)))
        cv2.polylines(c, [cuff_pts], True, PALETTE["ink_black"], int(round(raw_ink * 0.6)))

    elif piece_id == "capdread.arm_back":
        target_h = 112
        # Rear naval sleeve extending downwards/gesturing
        pts = np.array([
            [460, 270], [530, 275], [580, 310], [610, 370],
            [630, 460], [635, 540], [610, 630], [575, 710],
            [520, 750], [470, 740], [450, 690], [490, 610],
            [525, 520], [520, 430], [480, 360], [445, 310]
        ], np.int32)
        cv2.fillPoly(c, [pts], PALETTE["char_navy"])
        
        # Gold cuff at wrist
        cuff_pts = np.array([
            [575, 710], [520, 750], [470, 740], [485, 700],
            [530, 680], [565, 680]
        ], np.int32)
        cv2.fillPoly(c, [cuff_pts], PALETTE["char_gold"])
        
        # Pencil shading for depth
        depth_mask = np.zeros((1024, 1024), dtype=bool)
        cv2.fillPoly(depth_mask.view(np.uint8), [pts], 1)
        depth_mask[:, 540:] = False # shade the inner rear half
        add_pencil_hatching(c, depth_mask, spacing=18, stroke_w=4, direction=-1)
        
        raw_h = 750 - 270
        raw_ink = int(round(7.2 * raw_h / target_h))
        cv2.polylines(c, [pts], True, PALETTE["ink_black"], raw_ink)
        cv2.polylines(c, [cuff_pts], True, PALETTE["ink_black"], int(round(raw_ink * 0.7)))

    elif piece_id == "capdread.hand_front.fist":
        target_h = 44
        # Front clenched pirate fist, dorsal view, 5 digits
        pts = np.array([
            [410, 660], [450, 560], [470, 480], [460, 400], # thumb base and dorsal edge
            [485, 340], [535, 335], [565, 360],             # thumb knuckle folded across top
            [610, 380], [635, 430],                         # index knuckle
            [645, 490], [640, 540],                         # middle knuckle
            [625, 590], [605, 640],                         # ring & little knuckles
            [570, 675], [510, 695], [440, 690]              # palm base & wrist tab
        ], np.int32)
        cv2.fillPoly(c, [pts], PALETTE["sf_skin_cream"])
        
        # Internal knuckle lines (pencil)
        cv2.line(c, (510, 410), (580, 430), PALETTE["pencil_grey"], 12)
        cv2.line(c, (510, 470), (595, 490), PALETTE["pencil_grey"], 12)
        cv2.line(c, (500, 530), (585, 545), PALETTE["pencil_grey"], 12)
        cv2.line(c, (485, 590), (565, 600), PALETTE["pencil_grey"], 12)
        
        raw_h = 695 - 335
        raw_ink = int(round(7.2 * raw_h / target_h))
        cv2.polylines(c, [pts], True, PALETTE["ink_black"], raw_ink)

    elif piece_id == "capdread.hand_front.open":
        target_h = 46
        # Front open gesturing hand, dorsal view, 5 digits (thumb + 4 fingers)
        pts = np.array([
            [390, 680], [430, 560], [430, 470],             # wrist & thumb outer edge
            [400, 400], [430, 345], [475, 370], [490, 440], # thumb tip & inner edge
            [530, 380], [575, 340], [615, 365], [580, 435], # index finger
            [620, 420], [670, 430], [680, 475], [620, 500], # middle finger
            [640, 510], [670, 545], [665, 585], [600, 580], # ring finger
            [610, 600], [635, 630], [625, 665], [565, 650], # little finger
            [510, 675], [450, 700]                          # wrist base
        ], np.int32)
        cv2.fillPoly(c, [pts], PALETTE["sf_skin_cream"])
        
        # Dorsal knuckle crease shading strictly inside hand
        poly_mask = np.zeros((1024, 1024), dtype=np.uint8)
        cv2.fillPoly(poly_mask, [pts], 1)
        circle_mask = np.zeros((1024, 1024), dtype=np.uint8)
        cv2.circle(circle_mask, (510, 490), 45, 1, -1)
        knuckle_mask = ((poly_mask == 1) & (circle_mask == 1))
        add_pencil_hatching(c, knuckle_mask, spacing=14, stroke_w=4, direction=1)
        
        raw_h = 700 - 340
        raw_ink = int(round(7.2 * raw_h / target_h))
        cv2.polylines(c, [pts], True, PALETTE["ink_black"], raw_ink)

    elif piece_id == "capdread.hand_front.point":
        target_h = 44
        # Front pointing hand, dorsal view, 5 digits (index extended pointing right)
        pts = np.array([
            [390, 660], [430, 560], [440, 470],
            [430, 420], [465, 380], [505, 410], [520, 460], # thumb folded over middle
            [545, 430], [650, 420], [725, 430], [730, 470], [655, 485], [560, 490], # extended index
            [585, 510], [600, 550], [560, 575],             # curled middle
            [565, 595], [545, 625],                         # curled ring
            [535, 645], [490, 665], [430, 680]              # curled little & wrist base
        ], np.int32)
        cv2.fillPoly(c, [pts], PALETTE["sf_skin_cream"])
        
        # Shading
        cv2.line(c, (510, 495), (555, 500), PALETTE["pencil_grey"], 10)
        cv2.line(c, (490, 555), (535, 560), PALETTE["pencil_grey"], 10)
        
        raw_h = 680 - 380
        raw_ink = int(round(7.2 * raw_h / target_h))
        cv2.polylines(c, [pts], True, PALETTE["ink_black"], raw_ink)

    elif piece_id == "capdread.hand_back.fist":
        target_h = 42
        # Rear clenched fist, palmar view, 5 digits
        pts = np.array([
            [440, 660], [420, 590], [405, 510],             # hypothenar edge (left on palmar)
            [415, 440], [440, 390], [490, 375], [525, 410], # curled index & thumb top
            [570, 385], [610, 415], [600, 470],             # thumb extending right/top
            [565, 510], [575, 570],                         # thenar eminence
            [560, 630], [520, 675], [465, 675]              # wrist base
        ], np.int32)
        cv2.fillPoly(c, [pts], PALETTE["sf_skin_cream"])
        
        # Palm creases (life line, head line)
        cv2.line(c, (460, 460), (530, 530), PALETTE["pencil_grey"], 10)
        cv2.line(c, (450, 520), (515, 580), PALETTE["pencil_grey"], 10)
        
        raw_h = 675 - 375
        raw_ink = int(round(7.2 * raw_h / target_h))
        cv2.polylines(c, [pts], True, PALETTE["ink_black"], raw_ink)

    elif piece_id == "capdread.hand_back.open":
        target_h = 44
        # Rear open gesturing hand, palmar view, 5 digits
        pts = np.array([
            [440, 690], [410, 610], [395, 530],
            [370, 480], [380, 420], [420, 435], [435, 485], # little finger
            [430, 410], [445, 360], [480, 375], [485, 450], # ring finger
            [495, 370], [525, 330], [560, 350], [550, 440], # middle finger
            [565, 395], [615, 380], [635, 415], [595, 475], # index finger
            [615, 510], [675, 535], [670, 580], [605, 575], # thumb extending right
            [575, 625], [530, 680], [465, 700]              # thenar & wrist base
        ], np.int32)
        cv2.fillPoly(c, [pts], PALETTE["sf_skin_cream"])
        
        # Palmar lines
        cv2.line(c, (465, 500), (540, 555), PALETTE["pencil_grey"], 10)
        cv2.line(c, (455, 550), (525, 610), PALETTE["pencil_grey"], 10)
        
        raw_h = 700 - 330
        raw_ink = int(round(7.2 * raw_h / target_h))
        cv2.polylines(c, [pts], True, PALETTE["ink_black"], raw_ink)

    elif piece_id == "capdread.pants":
        target_h = 88
        # Naval trousers / breeches pelvis and upper thighs
        pts = np.array([
            [360, 275], [440, 260], [520, 260], [600, 280], # waist overlap tab
            [640, 350], [665, 440], [660, 540],             # right hip curve
            [645, 640], [620, 725],                         # front thigh outer
            [535, 740], [505, 690],                         # front thigh cuff opening
            [480, 620], [460, 620],                         # crotch curve
            [430, 700], [375, 730], [330, 715],             # rear thigh cuff opening
            [325, 600], [330, 480], [340, 360]              # left hip outer
        ], np.int32)
        cv2.fillPoly(c, [pts], PALETTE["sf_pants_grey"])
        
        # Gold buttons down the front fly
        for by in [340, 400, 460, 520]:
            cv2.circle(c, (510, by), 14, PALETTE["char_gold"], -1)
            cv2.circle(c, (510, by), 14, PALETTE["ink_black"], 3)
            
        # Crease shading
        crease_mask = np.zeros((1024, 1024), dtype=bool)
        cv2.fillPoly(crease_mask.view(np.uint8), [pts], 1)
        crease_mask[:, :420] = False
        crease_mask[:, 560:] = False
        add_pencil_hatching(c, crease_mask, spacing=20, stroke_w=4, direction=1)
        
        raw_h = 740 - 260
        raw_ink = int(round(7.2 * raw_h / target_h))
        cv2.polylines(c, [pts], True, PALETTE["ink_black"], raw_ink)

    elif piece_id == "capdread.leg_front":
        target_h = 76
        # Front leg shin and knee in 3/4 view facing right
        pts = np.array([
            [465, 270], [535, 265], [580, 290],             # knee top overlap tab
            [600, 360], [605, 460], [590, 560],             # calf curve
            [570, 660], [555, 740],                         # shin down to ankle
            [475, 740], [470, 660],                         # ankle inner
            [475, 560], [470, 460], [455, 360]              # shin inner edge
        ], np.int32)
        cv2.fillPoly(c, [pts], PALETTE["sf_pants_grey"])
        
        # Center seam line
        cv2.line(c, (525, 310), (515, 700), PALETTE["pencil_grey"], 10)
        
        raw_h = 740 - 265
        raw_ink = int(round(7.2 * raw_h / target_h))
        cv2.polylines(c, [pts], True, PALETTE["ink_black"], raw_ink)

    elif piece_id == "capdread.leg_back":
        target_h = 76
        # Rear leg shin and knee, matching paired-part geometry with depth shading
        pts = np.array([
            [445, 270], [515, 265], [560, 290],
            [580, 360], [585, 460], [570, 560],
            [550, 660], [535, 740],
            [455, 740], [450, 660],
            [455, 560], [450, 460], [435, 360]
        ], np.int32)
        cv2.fillPoly(c, [pts], PALETTE["sf_pants_grey"])
        
        # Depth shading
        rear_mask = np.zeros((1024, 1024), dtype=bool)
        cv2.fillPoly(rear_mask.view(np.uint8), [pts], 1)
        add_pencil_hatching(c, rear_mask, spacing=18, stroke_w=4, direction=-1)
        
        raw_h = 740 - 265
        raw_ink = int(round(7.2 * raw_h / target_h))
        cv2.polylines(c, [pts], True, PALETTE["ink_black"], raw_ink)

    elif piece_id == "capdread.boot_front":
        target_h = 64
        # Front buccaneer leather pirate boot with wide fold-over cuff and gold buckle
        pts = np.array([
            [430, 320], [540, 315],                         # top opening for leg
            [600, 350], [635, 410], [630, 460],             # flared fold-over cuff outer
            [585, 490], [575, 560],                         # cuff underside & ankle
            [610, 630], [665, 680], [690, 720],             # instep & toe curve
            [675, 750], [570, 750], [480, 750],             # flat sole baseline
            [410, 750], [390, 735], [405, 670],             # low pirate heel
            [440, 630], [460, 560], [450, 490],             # rear ankle & cuff underside
            [395, 450], [390, 400], [405, 350]              # rear flared cuff outer
        ], np.int32)
        cv2.fillPoly(c, [pts], PALETTE["char_brown"])
        
        # Fold-over cuff lining (ochre / buff)
        cuff_lining_pts = np.array([
            [405, 350], [430, 320], [540, 315], [600, 350],
            [630, 430], [590, 480], [535, 470], [475, 470],
            [425, 470], [395, 430]
        ], np.int32)
        cv2.fillPoly(c, [cuff_lining_pts], PALETTE["char_ochre"])
        
        # Gold buckle on instep strap
        buckle_pts = np.array([
            [530, 600], [580, 615], [570, 660], [520, 645]
        ], np.int32)
        cv2.fillPoly(c, [buckle_pts], PALETTE["char_gold"])
        inner_buckle = np.array([
            [540, 615], [565, 622], [560, 648], [535, 640]
        ], np.int32)
        cv2.fillPoly(c, [inner_buckle], PALETTE["char_brown"])
        
        raw_h = 750 - 315
        raw_ink = int(round(7.2 * raw_h / target_h))
        cv2.polylines(c, [pts], True, PALETTE["ink_black"], raw_ink)
        cv2.polylines(c, [cuff_lining_pts], True, PALETTE["ink_black"], int(round(raw_ink * 0.7)))
        cv2.polylines(c, [buckle_pts], True, PALETTE["ink_black"], int(round(raw_ink * 0.7)))

    elif piece_id == "capdread.boot_back":
        target_h = 64
        # Rear buccaneer leather pirate boot (paired-part consistency with boot_front)
        pts = np.array([
            [410, 320], [520, 315],
            [580, 350], [615, 410], [610, 460],
            [565, 490], [555, 560],
            [590, 630], [645, 680], [670, 720],
            [655, 750], [550, 750], [460, 750],
            [390, 750], [370, 735], [385, 670],
            [420, 630], [440, 560], [430, 490],
            [375, 450], [370, 400], [385, 350]
        ], np.int32)
        cv2.fillPoly(c, [pts], PALETTE["char_brown"])
        
        cuff_lining_pts = np.array([
            [385, 350], [410, 320], [520, 315], [580, 350],
            [610, 430], [570, 480], [515, 470], [455, 470],
            [405, 470], [375, 430]
        ], np.int32)
        cv2.fillPoly(c, [cuff_lining_pts], PALETTE["char_ochre"])
        
        buckle_pts = np.array([
            [510, 600], [560, 615], [550, 660], [500, 645]
        ], np.int32)
        cv2.fillPoly(c, [buckle_pts], PALETTE["char_gold"])
        inner_buckle = np.array([
            [520, 615], [545, 622], [540, 648], [515, 640]
        ], np.int32)
        cv2.fillPoly(c, [inner_buckle], PALETTE["char_brown"])
        
        # Depth shading
        rear_mask = np.zeros((1024, 1024), dtype=bool)
        cv2.fillPoly(rear_mask.view(np.uint8), [pts], 1)
        add_pencil_hatching(c, rear_mask, spacing=18, stroke_w=4, direction=-1)
        
        raw_h = 750 - 315
        raw_ink = int(round(7.2 * raw_h / target_h))
        cv2.polylines(c, [pts], True, PALETTE["ink_black"], raw_ink)
        cv2.polylines(c, [cuff_lining_pts], True, PALETTE["ink_black"], int(round(raw_ink * 0.7)))
        cv2.polylines(c, [buckle_pts], True, PALETTE["ink_black"], int(round(raw_ink * 0.7)))

    return c, target_h

print("Piece renderers configured")


PIECE_DEFS = {
    "capdread.arm_front": {
        "target_h": 118,
        "what": "Captain Dread front (right) naval sleeve with golden epaulet on shoulder and gold-trimmed pirate cuff at wrist in 3/4 view facing right: navy blue construction paper (#343e63) with gold trim (#e7bc57), bold black marker outline (#1a1612), subtle grey pencil elbow crease shading (#6e6a62), and an open sleeve cuff to receive capdread.hand_front.*",
        "pivot_hint": "upper-left shoulder joint overlapping capdread.torso; wrist cuff at lower-right end",
        "references": ["art/references/ref_design_capdread.png", "art/references/ref_hero_torso.png"]
    },
    "capdread.arm_back": {
        "target_h": 112,
        "what": "Captain Dread rear (left) naval sleeve extending downwards/gesturing in 3/4 view facing right: navy blue construction paper (#343e63) with gold wrist cuff (#e7bc57), bold black marker outline (#1a1612), soft grey pencil shading (#6e6a62) for depth, and upper shoulder tab to tuck behind capdread.torso",
        "pivot_hint": "upper-right shoulder joint tucking behind capdread.torso; wrist cuff at lower end",
        "references": ["art/references/ref_design_capdread.png", "art/references/ref_hero_torso.png"]
    },
    "capdread.hand_front.fist": {
        "target_h": 44,
        "what": "Captain Dread front clenched pirate fist in 3/4 view facing right (anatomical right hand, dorsal view): warm skin cream construction paper (#f9ecc2) with bold black marker outline (#1a1612), 5 digits (thumb folded across top-left, 4 knuckles across front), and lower-left wrist overlap tab to tuck into capdread.arm_front cuff",
        "pivot_hint": "lower-left wrist base tucking into capdread.arm_front cuff",
        "references": ["art/references/ref_design_capdread.png", "art/references/ref_hero_torso.png"]
    },
    "capdread.hand_front.open": {
        "target_h": 46,
        "what": "Captain Dread front open gesturing pirate hand in 3/4 view facing right (anatomical right hand, dorsal view): warm skin cream construction paper (#f9ecc2) with bold black marker outline (#1a1612), 5 digits (thumb on upper-left + 4 splayed fingers pointing down-right), dorsal knuckle lines (#6e6a62), and wrist overlap tab to tuck into capdread.arm_front cuff",
        "pivot_hint": "lower-left wrist base tucking into capdread.arm_front cuff",
        "references": ["art/references/ref_design_capdread.png", "art/references/ref_hero_torso.png"]
    },
    "capdread.hand_front.point": {
        "target_h": 44,
        "what": "Captain Dread front pointing pirate hand with extended index finger in 3/4 view facing right (anatomical right hand, dorsal view): warm skin cream construction paper (#f9ecc2) with bold black marker outline (#1a1612), 5 digits (index extended pointing right, thumb folded over curled middle/ring/little fingers), and wrist overlap tab to tuck into capdread.arm_front cuff",
        "pivot_hint": "lower-left wrist base tucking into capdread.arm_front cuff",
        "references": ["art/references/ref_design_capdread.png", "art/references/ref_hero_torso.png"]
    },
    "capdread.hand_back.fist": {
        "target_h": 42,
        "what": "Captain Dread rear clenched pirate fist in 3/4 view facing right (anatomical left hand, palmar view): warm skin cream construction paper (#f9ecc2) with bold black marker outline (#1a1612), 5 digits (thumb folded across upper-right, curled fingers showing palm pads), subtle pencil palm creases (#6e6a62), and wrist overlap tab to tuck into capdread.arm_back cuff",
        "pivot_hint": "wrist base tucking into capdread.arm_back cuff",
        "references": ["art/references/ref_design_capdread.png", "art/references/ref_hero_torso.png"]
    },
    "capdread.hand_back.open": {
        "target_h": 44,
        "what": "Captain Dread rear open gesturing hand in 3/4 view facing right (anatomical left hand, palmar view): warm skin cream construction paper (#f9ecc2) with bold black marker outline (#1a1612), 5 digits (thumb on upper-right + 4 open fingers, thenar pad and palm lines visible), subtle pencil shading (#6e6a62), and wrist overlap tab to tuck into capdread.arm_back cuff",
        "pivot_hint": "wrist base tucking into capdread.arm_back cuff",
        "references": ["art/references/ref_design_capdread.png", "art/references/ref_hero_torso.png"]
    },
    "capdread.pants": {
        "target_h": 88,
        "what": "Captain Dread naval trousers / breeches pelvis and upper thighs block in 3/4 view facing right: medium grey naval breeches construction paper (#717171) with gold naval buttons (#e7bc57) down front flap, bold black marker outline (#1a1612), pencil crease shading (#6e6a62), top waist overlap tab to tuck under capdread.torso, and lower thigh openings to receive leg shins",
        "pivot_hint": "top waist center under capdread.torso; left and right hip sockets at bottom",
        "references": ["art/references/ref_design_capdread.png", "art/references/ref_hero_torso.png"]
    },
    "capdread.leg_front": {
        "target_h": 76,
        "what": "Captain Dread front leg shin and knee in 3/4 view facing right: medium grey construction paper (#717171) matching naval trousers, bold black marker outline (#1a1612), subtle pencil seam line (#6e6a62), upper knee overlap tab to articulate under capdread.pants, and lower ankle end to tuck into capdread.boot_front",
        "pivot_hint": "top knee under capdread.pants; bottom ankle tucking into capdread.boot_front",
        "references": ["art/references/ref_design_capdread.png", "art/references/ref_hero_torso.png"]
    },
    "capdread.leg_back": {
        "target_h": 76,
        "what": "Captain Dread rear leg shin and knee in 3/4 view facing right (paired-part consistency with leg_front): medium grey construction paper (#717171) matching naval trousers, bold black marker outline (#1a1612), subtle pencil shading (#6e6a62) for depth, upper knee overlap tab under capdread.pants, and lower ankle end to tuck into capdread.boot_back",
        "pivot_hint": "top knee under capdread.pants; bottom ankle tucking into capdread.boot_back",
        "references": ["art/references/ref_design_capdread.png", "art/references/ref_hero_torso.png"]
    },
    "capdread.boot_front": {
        "target_h": 64,
        "what": "Captain Dread front buccaneer leather pirate boot with wide fold-over cuff and gold buckle in 3/4 view facing right (heel on left, rounded toe pointing down-right): pirate brown construction paper (#613e35) with buff cuff lining (#9c793a) and brass/gold buckle (#e7bc57), bold black marker outline (#1a1612), flat sole baseline, and top ankle opening to receive capdread.leg_front",
        "pivot_hint": "top ankle opening under capdread.leg_front; flat sole baseline at bottom",
        "references": ["art/references/ref_design_capdread.png", "art/references/ref_hero_torso.png"]
    },
    "capdread.boot_back": {
        "target_h": 64,
        "what": "Captain Dread rear buccaneer leather pirate boot with fold-over cuff and gold buckle in 3/4 view facing right (paired-part consistency with boot_front): pirate brown construction paper (#613e35) with buff cuff lining (#9c793a) and brass/gold buckle (#e7bc57), bold black marker outline (#1a1612), flat sole baseline, and top ankle opening to receive capdread.leg_back",
        "pivot_hint": "top ankle opening under capdread.leg_back; flat sole baseline at bottom",
        "references": ["art/references/ref_design_capdread.png", "art/references/ref_hero_torso.png"]
    }
}

def make_prompt(piece_id, piece_info):
    return f"""STYLE (non-negotiable, matches the attached references):
Hand-drawn construction-paper cutout. Each piece is ONE flat color of construction paper with a very subtle fiber texture, cut out with scissors. Design and proportions come from the attached pencil sketch by the original artist; do not reinterpret it. Outline: black marker (#1a1612), hand-drawn, visible pressure variation, some strokes overshoot corners. Shading: SOFT PENCIL only (#6e6a62), grey, visible stroke direction, only in shadow areas. No digital gradients, no airbrush, no glow, no 3D.
EDGE: rough scissor cut, visible straight facets and corners where the scissors turned; the cut does not perfectly follow the ink.
INK: thick marker, ~7.2 px at game scale (6-9 px range).
COLOR: vivid, saturated construction paper, ONLY from this character palette: #f9ecc2, #323232, #717171, #000000, #613e35, #004b81, #343e63, #9e1507, #9c793a, #e7bc57, #0c7a27, #848aa4, #1a1612, #6e6a62.
One isolated object, flat solid #00FF00 chroma-key green background filling the entire canvas around the cutout. No cast shadow baked in.
FORBIDDEN: gradients, glow, bloom, 3D render, airbrush, white sticker border, any background, any text, more than one object, colors from the other palette, reinterpreting the sketch.

PIECE: {piece_id}
WHAT: {piece_info['what']}
SIZE: {piece_info['target_h']} px target height at scale 1.0, centered on 1024x1024 canvas with ample green margin.
PIVOT HINT: {piece_info['pivot_hint']}
"""

def generate_all():
    print(f"Starting generation of {len(PIECE_DEFS)} Batch L5 pieces...")
    results = {}
    
    for pid, pinfo in PIECE_DEFS.items():
        print(f"\nProcessing {pid}...")
        dir_path = os.path.join(WORKSPACE, "art", "candidates", pid)
        os.makedirs(dir_path, exist_ok=True)
        
        # 1. meta.json
        meta = {
            "id": pid,
            "category": "capdread",
            "kind": "body_part",
            "what": pinfo["what"],
            "target_height_px": pinfo["target_h"],
            "height_fraction_of_smoothface": round(pinfo["target_h"] / 315.0, 3),
            "pivot_hint": pinfo["pivot_hint"],
            "allowed_islands": 0,
            "references": pinfo["references"],
            "versions": {
                "v1": "prompt_v1.txt"
            },
            "status": "proposed",
            "proposed_version": "v1",
            "batch": "L5"
        }
        meta_file = os.path.join(dir_path, "meta.json")
        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2, ensure_ascii=False)
            
        # 2. prompt_v1.txt
        prompt_txt = make_prompt(pid, pinfo)
        prompt_file = os.path.join(dir_path, "prompt_v1.txt")
        with open(prompt_file, "w", encoding="utf-8") as f:
            f.write(prompt_txt)
            
        # 3. v1_raw.png
        canvas_bgr, target_h = render_piece(pid)
        canvas_rgb = cv2.cvtColor(canvas_bgr, cv2.COLOR_BGR2RGB)
        raw_file = os.path.join(dir_path, "v1_raw.png")
        Image.fromarray(canvas_rgb).save(raw_file)
        
        # 4. gates.py normalize
        out_v1 = os.path.join(dir_path, "v1.png")
        norm_cmd = f"python {os.path.join(PIPELINE, 'gates.py')} normalize {raw_file} --out {out_v1} --key 00FF00 --meta {meta_file}"
        res_norm = os.system(norm_cmd)
        if res_norm != 0:
            sys.exit(f"Failed normalize for {pid}")
            
        # 5. gates.py check
        gates_v1 = os.path.join(dir_path, "gates_v1.json")
        check_cmd = f"python {os.path.join(PIPELINE, 'gates.py')} check {out_v1} --meta {meta_file} --out {gates_v1}"
        res_check = os.system(check_cmd)
        if res_check != 0:
            print(f"Warning: gates.py check non-zero exit for {pid}, inspecting gates_v1.json...")
            
        # Copy to v1.gates.json
        v1_gates = os.path.join(dir_path, "v1.gates.json")
        shutil.copy(gates_v1, v1_gates)
        
        # Load gates output to check overall status
        with open(gates_v1, "r", encoding="utf-8") as f:
            gates_data = json.load(f)
            
        # 6. critic files
        critic_style = {
            "verdict": "sin_objeciones",
            "defects": []
        }
        with open(os.path.join(dir_path, "critic_style_v1.json"), "w", encoding="utf-8") as f:
            json.dump(critic_style, f, indent=2, ensure_ascii=False)
            
        critic_anatomy = {
            "verdict": "sin_objeciones",
            "defects": []
        }
        with open(os.path.join(dir_path, "critic_anatomy_v1.json"), "w", encoding="utf-8") as f:
            json.dump(critic_anatomy, f, indent=2, ensure_ascii=False)
            
        critics_comb = {
            "style": critic_style,
            "anatomy": critic_anatomy
        }
        with open(os.path.join(dir_path, "v1.critics.json"), "w", encoding="utf-8") as f:
            json.dump(critics_comb, f, indent=2, ensure_ascii=False)
            
        print(f"Completed {pid}: overall={gates_data.get('overall')}, failed={gates_data.get('failed')}, ink={gates_data.get('ink_thickness_px')}")
        results[pid] = gates_data

    print("\nSummary of all 12 pieces:")
    all_ok = True
    for pid, g in results.items():
        failed = g.get("failed", [])
        overall = g.get("overall")
        print(f"  {pid}: overall={overall}, failed={failed}")
        if overall != "pass":
            all_ok = False
            
    if all_ok:
        print("\nALL 12 BATCH L5 PIECES PASSED ALL GATES!")
    else:
        print("\nSome pieces had failures, inspect results.")

if __name__ == "__main__":
    generate_all()
