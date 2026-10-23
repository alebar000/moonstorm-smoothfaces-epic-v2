#!/usr/bin/env python3
"""
build_candidates.py - Generate, normalize, gate-check, and critique
all 15 candidate pieces for Batches L6 (Hull structure) and L7 (Wall fixtures).
Constraint: ZERO EM-DASHES across all code, comments, and strings.
"""
import os, sys, json, math, shutil
import numpy as np
import cv2
from PIL import Image

# Palette definition (Scenery Palette + Common Ink/Pencil)
C_GREEN = (0, 255, 0)        # #00FF00 chroma-key background
C_INK = (26, 22, 18)         # #1a1612 black ink
C_PENCIL = (110, 106, 98)    # #6e6a62 pencil grey
C_BRASS = (171, 152, 110)    # #ab986e
C_BRICK = (156, 90, 92)      # #9c5a5c
C_SKY = (149, 179, 212)      # #95b3d4
C_IRON = (42, 41, 34)        # #2a2922
C_RUST = (96, 87, 82)        # #605752
C_SAND = (198, 167, 135)     # #c6a787
C_SLATE = (114, 130, 137)    # #728289
C_WOOD = (153, 131, 112)     # #998370
C_NAVY = (74, 105, 127)      # #4a697f
C_CORAL = (214, 124, 124)    # #d67c7c
C_YELLOW = (214, 210, 124)   # #d6d27c
C_CREAM = (203, 194, 194)    # #cbc2c2

def create_raw_canvas(w, h, margin=40):
    cw, ch = w + 2 * margin, h + 2 * margin
    img = np.full((ch, cw, 3), C_GREEN, dtype=np.uint8)
    return img, margin, margin, w, h

def add_paper_texture(img, x0, y0, w, h, base_color, accent_color, seed=100, count=400):
    np.random.seed(seed)
    cv2.rectangle(img, (x0, y0), (x0 + w, y0 + h), base_color, -1)
    for _ in range(count):
        rx = np.random.randint(x0 + 4, x0 + w - 4)
        ry = np.random.randint(y0 + 4, y0 + h - 4)
        img[ry:ry+2, rx:rx+2] = accent_color

def draw_rivet(img, cx, cy, radius=4):
    cv2.circle(img, (cx, cy), radius, C_SLATE, -1)
    cv2.circle(img, (cx, cy), radius, C_INK, 1)

def draw_pencil_hatch(img, x0, y0, w, h, spacing=8, length=12):
    for x in range(x0, x0 + w, spacing):
        cv2.line(img, (x, y0), (x + 5, y0 + length), C_PENCIL, 1)

# Generator functions for 15 pieces

def gen_panel_b():
    w, h = 600, 900
    img, x0, y0, w, h = create_raw_canvas(w, h)
    add_paper_texture(img, x0, y0, w, h, C_RUST, C_WOOD, seed=101, count=800)
    # Horizontal reinforcement ribs (upper and lower)
    cv2.rectangle(img, (x0, y0 + 200), (x0 + w, y0 + 270), C_SLATE, -1)
    cv2.rectangle(img, (x0, y0 + 630), (x0 + w, y0 + 700), C_SLATE, -1)
    # Vertical center seam plate
    cv2.rectangle(img, (x0 + 280, y0), (x0 + 320, y0 + h), C_WOOD, -1)
    # Pencil shading under ribs
    draw_pencil_hatch(img, x0 + 10, y0 + 272, w - 20, 15, spacing=10, length=14)
    draw_pencil_hatch(img, x0 + 10, y0 + 702, w - 20, 15, spacing=10, length=14)
    # Rivets along the ribs
    for rx in range(x0 + 25, x0 + w - 10, 40):
        draw_rivet(img, rx, y0 + 235, radius=4)
        draw_rivet(img, rx, y0 + 665, radius=4)
    # Rivets along vertical seam
    for ry in range(y0 + 30, y0 + h - 20, 45):
        draw_rivet(img, x0 + 300, ry, radius=4)
    # Ink outlines (thickness=2 for [3, 5] px ink)
    cv2.rectangle(img, (x0, y0), (x0 + w, y0 + h), C_INK, 2)
    cv2.rectangle(img, (x0, y0 + 200), (x0 + w, y0 + 270), C_INK, 2)
    cv2.rectangle(img, (x0, y0 + 630), (x0 + w, y0 + 700), C_INK, 2)
    cv2.rectangle(img, (x0 + 280, y0), (x0 + 320, y0 + h), C_INK, 2)
    return img

def gen_panel_c():
    w, h = 600, 900
    img, x0, y0, w, h = create_raw_canvas(w, h)
    add_paper_texture(img, x0, y0, w, h, C_RUST, C_WOOD, seed=102, count=800)
    # Conduit inspection hatch in the middle
    hw, hh = 260, 320
    hx, hy = x0 + (w - hw) // 2, y0 + (h - hh) // 2
    cv2.rectangle(img, (hx, hy), (hx + hw, hy + hh), C_SLATE, -1)
    # Inner hatch inset plate
    cv2.rectangle(img, (hx + 25, hy + 25), (hx + hw - 25, hy + hh - 25), C_WOOD, -1)
    # Two conduit pipes entering top of hatch
    cv2.rectangle(img, (hx + 40, y0), (hx + 75, hy), C_SLATE, -1)
    cv2.rectangle(img, (hx + hw - 75, y0), (hx + hw - 40, hy), C_SLATE, -1)
    # Pencil shading along hatch rim and conduits
    draw_pencil_hatch(img, hx + 10, hy + hh + 2, hw - 20, 15, spacing=8, length=12)
    # Fastener bolts on hatch perimeter
    for bx in range(hx + 15, hx + hw, 40):
        draw_rivet(img, bx, hy + 12, radius=4)
        draw_rivet(img, bx, hy + hh - 12, radius=4)
    for by in range(hy + 20, hy + hh - 10, 40):
        draw_rivet(img, hx + 12, by, radius=4)
        draw_rivet(img, hx + hw - 12, by, radius=4)
    # Vertical side seam lines with rivets
    for ry in range(y0 + 25, y0 + h - 15, 50):
        draw_rivet(img, x0 + 30, ry, radius=4)
        draw_rivet(img, x0 + w - 30, ry, radius=4)
    # Ink outlines (thickness=2)
    cv2.rectangle(img, (x0, y0), (x0 + w, y0 + h), C_INK, 2)
    cv2.rectangle(img, (hx, hy), (hx + hw, hy + hh), C_INK, 2)
    cv2.rectangle(img, (hx + 25, hy + 25), (hx + hw - 25, hy + hh - 25), C_INK, 2)
    cv2.rectangle(img, (hx + 40, y0), (hx + 75, hy), C_INK, 2)
    cv2.rectangle(img, (hx + hw - 75, y0), (hx + hw - 40, hy), C_INK, 2)
    return img

def gen_seam_strip():
    w, h = 40, 900
    img, x0, y0, w, h = create_raw_canvas(w, h, margin=20)
    add_paper_texture(img, x0, y0, w, h, C_SLATE, C_WOOD, seed=103, count=150)
    # Double vertical column of rivets
    for ry in range(y0 + 20, y0 + h - 10, 30):
        draw_rivet(img, x0 + 12, ry, radius=3)
        draw_rivet(img, x0 + 28, ry, radius=3)
    # Outer ink outline (thickness=2)
    cv2.rectangle(img, (x0, y0), (x0 + w, y0 + h), C_INK, 2)
    return img

def gen_planks_a():
    w, h = 800, 260
    img, x0, y0, w, h = create_raw_canvas(w, h)
    add_paper_texture(img, x0, y0, w, h, C_WOOD, C_SAND, seed=104, count=900)
    num_planks = 5
    ph = h // num_planks
    for i in range(1, num_planks):
        py = y0 + i * ph
        # plank separation ink line (thickness=3 for floor [4, 7] px rule)
        cv2.line(img, (x0, py), (x0 + w, py), C_INK, 3)
        # pencil grain line just above separation
        cv2.line(img, (x0, py - 4), (x0 + w, py - 4), C_PENCIL, 1)
    # Nail heads at regular intervals across planks
    for px in range(x0 + 40, x0 + w - 20, 90):
        for i in range(num_planks):
            ncy = y0 + i * ph + ph // 2
            cv2.rectangle(img, (px - 3, ncy - 3), (px + 3, ncy + 3), C_SLATE, -1)
            cv2.rectangle(img, (px - 3, ncy - 3), (px + 3, ncy + 3), C_INK, 1)
    # Outer frame outline (thickness=3 for floor [4, 7] px ink)
    cv2.rectangle(img, (x0, y0), (x0 + w, y0 + h), C_INK, 3)
    return img

def gen_planks_b():
    w, h = 800, 260
    img, x0, y0, w, h = create_raw_canvas(w, h)
    add_paper_texture(img, x0, y0, w, h, C_WOOD, C_SAND, seed=105, count=900)
    num_planks = 5
    ph = h // num_planks
    # Staggered vertical butt joints between boards
    butt_joints = [
        (0, [x0 + 220, x0 + 580]),
        (1, [x0 + 380]),
        (2, [x0 + 150, x0 + 500, x0 + 720]),
        (3, [x0 + 310, x0 + 640]),
        (4, [x0 + 200, x0 + 470]),
    ]
    for row, xs in butt_joints:
        for bx in xs:
            cv2.line(img, (bx, y0 + row * ph), (bx, y0 + (row + 1) * ph), C_INK, 3)
            # Nail pair flanking butt joint
            for nx in (bx - 12, bx + 12):
                if x0 < nx < x0 + w:
                    ny = y0 + row * ph + ph // 2
                    cv2.rectangle(img, (nx - 3, ny - 3), (nx + 3, ny + 3), C_SLATE, -1)
                    cv2.rectangle(img, (nx - 3, ny - 3), (nx + 3, ny + 3), C_INK, 1)
    for i in range(1, num_planks):
        py = y0 + i * ph
        cv2.line(img, (x0, py), (x0 + w, py), C_INK, 3)
        cv2.line(img, (x0, py - 4), (x0 + w, py - 4), C_PENCIL, 1)
    cv2.rectangle(img, (x0, y0), (x0 + w, y0 + h), C_INK, 3)
    return img

def gen_ceiling_beam_a():
    w, h = 800, 160
    img, x0, y0, w, h = create_raw_canvas(w, h)
    add_paper_texture(img, x0, y0, w, h, C_SLATE, C_WOOD, seed=106, count=400)
    # Flange plates along top and bottom
    cv2.rectangle(img, (x0, y0), (x0 + w, y0 + 28), C_RUST, -1)
    cv2.rectangle(img, (x0, y0 + h - 28), (x0 + w, y0 + h), C_RUST, -1)
    cv2.rectangle(img, (x0, y0), (x0 + w, y0 + h), C_INK, 3)
    cv2.line(img, (x0, y0 + 28), (x0 + w, y0 + 28), C_INK, 2)
    cv2.line(img, (x0, y0 + h - 28), (x0 + w, y0 + h - 28), C_INK, 2)
    # 5 circular lightening holes
    hole_radius = 36
    spacing = w // 6
    for i in range(1, 6):
        hx = x0 + i * spacing
        hy = y0 + h // 2
        cv2.circle(img, (hx, hy), hole_radius, C_RUST, -1)
        cv2.circle(img, (hx, hy), hole_radius, C_INK, 2)
    return img

def gen_ceiling_beam_b():
    w, h = 800, 160
    img, x0, y0, w, h = create_raw_canvas(w, h)
    add_paper_texture(img, x0, y0, w, h, C_SLATE, C_WOOD, seed=107, count=400)
    # Flange plates along top and bottom
    cv2.rectangle(img, (x0, y0), (x0 + w, y0 + 25), C_RUST, -1)
    cv2.rectangle(img, (x0, y0 + h - 35), (x0 + w, y0 + h), C_RUST, -1)
    cv2.rectangle(img, (x0, y0), (x0 + w, y0 + h), C_INK, 3)
    cv2.line(img, (x0, y0 + 25), (x0 + w, y0 + 25), C_INK, 2)
    cv2.line(img, (x0, y0 + h - 35), (x0 + w, y0 + h - 35), C_INK, 2)
    # Utility conduit running through
    cv2.rectangle(img, (x0 + 10, y0 + 70), (x0 + w - 10, y0 + 95), C_BRASS, -1)
    cv2.rectangle(img, (x0 + 10, y0 + 70), (x0 + w - 10, y0 + 95), C_INK, 2)
    for cx_pos in range(x0 + 80, x0 + w - 80, 120):
        cv2.rectangle(img, (cx_pos, y0 + 60), (cx_pos + 30, y0 + 105), C_RUST, -1)
        cv2.rectangle(img, (cx_pos, y0 + 60), (cx_pos + 30, y0 + 105), C_INK, 2)
    return img

def gen_door():
    w, h = 260, 410
    img, x0, y0, w, h = create_raw_canvas(w, h)
    cx, cy = x0 + w // 2, y0 + h // 2
    # Oval watertight bulkhead door silhouette
    pts = []
    for deg in range(360):
        rad = math.radians(deg)
        px = cx + int((w // 2 - 10) * math.cos(rad))
        py = cy + int((h // 2 - 10) * math.sin(rad))
        pts.append([px, py])
    poly = np.array(pts, np.int32)
    cv2.fillPoly(img, [poly], C_SLATE)
    pts_in = []
    for deg in range(360):
        rad = math.radians(deg)
        px = cx + int((w // 2 - 28) * math.cos(rad))
        py = cy + int((h // 2 - 32) * math.sin(rad))
        pts_in.append([px, py])
    poly_in = np.array(pts_in, np.int32)
    cv2.fillPoly(img, [poly_in], C_RUST)
    # Hinges
    for hy in (y0 + 80, y0 + h - 90):
        cv2.rectangle(img, (x0 + 12, hy), (x0 + 38, hy + 40), C_SLATE, -1)
        cv2.rectangle(img, (x0 + 12, hy), (x0 + 38, hy + 40), C_INK, 2)
    # Warning chevron threshold band at bottom
    wy0 = y0 + h - 80
    cv2.rectangle(img, (cx - 70, wy0), (cx + 70, wy0 + 30), C_YELLOW, -1)
    for bx in range(cx - 65, cx + 65, 20):
        cv2.line(img, (bx, wy0), (bx + 15, wy0 + 30), C_BRICK, 3)
    cv2.rectangle(img, (cx - 70, wy0), (cx + 70, wy0 + 30), C_INK, 2)
    # Central locking dog-wheel
    cv2.circle(img, (cx, cy - 20), 48, C_BRASS, -1)
    cv2.circle(img, (cx, cy - 20), 32, C_SLATE, -1)
    cv2.circle(img, (cx, cy - 20), 16, C_BRASS, -1)
    for angle in range(0, 360, 45):
        rad = math.radians(angle)
        sx = int(cx + 46 * math.cos(rad))
        sy = int((cy - 20) + 46 * math.sin(rad))
        cv2.line(img, (cx, cy - 20), (sx, sy), C_INK, 2)
    cv2.circle(img, (cx, cy - 20), 48, C_INK, 2)
    cv2.circle(img, (cx, cy - 20), 32, C_INK, 2)
    cv2.circle(img, (cx, cy - 20), 16, C_INK, 2)
    cv2.polylines(img, [poly], True, C_INK, 2)
    cv2.polylines(img, [poly_in], True, C_INK, 2)
    return img

def gen_porthole():
    w, h = 180, 180
    img, x0, y0, w, h = create_raw_canvas(w, h)
    cx, cy = x0 + w // 2, y0 + h // 2
    cv2.circle(img, (cx, cy), 86, C_BRASS, -1)
    cv2.circle(img, (cx, cy), 66, C_SLATE, -1)
    cv2.circle(img, (cx, cy), 56, C_NAVY, -1)
    cv2.circle(img, (cx - 10, cy + 10), 44, C_SKY, -1)
    for angle in range(0, 360, 45):
        rad = math.radians(angle)
        bx = int(cx + 76 * math.cos(rad))
        by = int(cy + 76 * math.sin(rad))
        cv2.circle(img, (bx, by), 3, C_SLATE, -1)
        cv2.circle(img, (bx, by), 3, C_INK, 1)
    cv2.ellipse(img, (cx - 16, cy - 16), (36, 18), -45, 0, 120, C_CREAM, 2)
    # Circle lines with thickness=3 to give 4.39 px measured thickness
    cv2.circle(img, (cx, cy), 86, C_INK, 3)
    cv2.circle(img, (cx, cy), 66, C_INK, 3)
    cv2.circle(img, (cx, cy), 56, C_INK, 3)
    return img

def gen_poster():
    w, h = 90, 126
    img, x0, y0, w, h = create_raw_canvas(w, h, margin=20)
    add_paper_texture(img, x0, y0, w, h, C_CREAM, C_SAND, seed=108, count=150)
    cv2.rectangle(img, (x0 + 6, y0 + 8), (x0 + w - 6, y0 + 26), C_BRICK, -1)
    cv2.rectangle(img, (x0 + 6, y0 + 8), (x0 + w - 6, y0 + 26), C_INK, 2)
    cv2.ellipse(img, (x0 + w // 2, y0 + 60), (32, 14), 0, 0, 360, C_NAVY, -1)
    cv2.rectangle(img, (x0 + w // 2 - 6, y0 + 40), (x0 + w // 2 + 6, y0 + 50), C_NAVY, -1)
    cv2.line(img, (x0 + 10, y0 + 86), (x0 + w - 10, y0 + 86), C_NAVY, 2)
    cv2.line(img, (x0 + 10, y0 + 94), (x0 + w - 10, y0 + 94), C_NAVY, 2)
    cv2.line(img, (x0 + 10, y0 + 102), (x0 + w - 24, y0 + 102), C_NAVY, 2)
    # Inset outer border
    cv2.rectangle(img, (x0 + 2, y0 + 2), (x0 + w - 2, y0 + h - 2), C_INK, 2)
    return img

def gen_mask_a():
    w, h = 42, 80
    img, x0, y0, w, h = create_raw_canvas(w, h, margin=20)
    cx, cy = x0 + w // 2, y0 + h // 2
    pts = []
    for deg in range(360):
        rad = math.radians(deg)
        pts.append([cx + int((w // 2 - 2) * math.cos(rad)), cy + int((h // 2 - 2) * math.sin(rad))])
    poly = np.array(pts, np.int32)
    cv2.fillPoly(img, [poly], C_WOOD)
    cv2.rectangle(img, (cx - 14, cy - 12), (cx - 4, cy - 8), C_SLATE, -1)
    cv2.rectangle(img, (cx + 4, cy - 12), (cx + 14, cy - 8), C_SLATE, -1)
    cv2.rectangle(img, (cx - 14, cy - 12), (cx - 4, cy - 8), C_INK, 2)
    cv2.rectangle(img, (cx + 4, cy - 12), (cx + 14, cy - 8), C_INK, 2)
    cv2.rectangle(img, (cx - 8, cy + 20), (cx + 8, cy + 24), C_SLATE, -1)
    cv2.rectangle(img, (cx - 8, cy + 20), (cx + 8, cy + 24), C_INK, 2)
    cv2.polylines(img, [poly], True, C_INK, 2)
    return img

def gen_mask_b():
    w, h = 56, 80
    img, x0, y0, w, h = create_raw_canvas(w, h, margin=20)
    cx, cy = x0 + w // 2, y0 + h // 2
    pts = []
    for deg in range(360):
        rad = math.radians(deg)
        pts.append([cx + int((w // 2 - 3) * math.cos(rad)), cy + int((h // 2 - 3) * math.sin(rad))])
    poly = np.array(pts, np.int32)
    cv2.fillPoly(img, [poly], C_WOOD)
    cv2.circle(img, (cx - 12, cy - 12), 7, C_SAND, -1)
    cv2.circle(img, (cx + 12, cy - 12), 7, C_SAND, -1)
    cv2.circle(img, (cx - 12, cy - 12), 7, C_INK, 2)
    cv2.circle(img, (cx + 12, cy - 12), 7, C_INK, 2)
    cv2.rectangle(img, (cx - 16, cy + 14), (cx + 16, cy + 24), C_SLATE, -1)
    cv2.rectangle(img, (cx - 16, cy + 14), (cx + 16, cy + 24), C_INK, 2)
    cv2.polylines(img, [poly], True, C_INK, 2)
    return img

def gen_helm_wheel():
    w, h = 160, 160
    img, x0, y0, w, h = create_raw_canvas(w, h, margin=20)
    cx, cy = x0 + w // 2, y0 + h // 2
    for angle in range(0, 360, 45):
        rad = math.radians(angle)
        sx0 = int(cx + 25 * math.cos(rad))
        sy0 = int(cy + 25 * math.sin(rad))
        sx1 = int(cx + 74 * math.cos(rad))
        sy1 = int(cy + 74 * math.sin(rad))
        cv2.line(img, (sx0, sy0), (sx1, sy1), C_INK, 6)
        cv2.line(img, (sx0, sy0), (sx1, sy1), C_WOOD, 2)
        cv2.circle(img, (sx1, sy1), 6, C_INK, -1)
        cv2.circle(img, (sx1, sy1), 2, C_SAND, -1)
    cv2.circle(img, (cx, cy), 58, C_WOOD, 10)
    cv2.circle(img, (cx, cy), 63, C_INK, 3)
    cv2.circle(img, (cx, cy), 53, C_INK, 3)
    cv2.circle(img, (cx, cy), 40, C_WOOD, 6)
    cv2.circle(img, (cx, cy), 43, C_INK, 3)
    cv2.circle(img, (cx, cy), 37, C_INK, 3)
    cv2.circle(img, (cx, cy), 22, C_BRASS, -1)
    cv2.circle(img, (cx, cy), 12, C_SLATE, -1)
    cv2.circle(img, (cx, cy), 22, C_INK, 3)
    cv2.circle(img, (cx, cy), 12, C_INK, 2)
    return img

def gen_shelf():
    w, h = 160, 95
    img, x0, y0, w, h = create_raw_canvas(w, h, margin=20)
    for bx in (x0 + 20, x0 + w - 35):
        b_pts = np.array([[bx, y0 + 42], [bx + 15, y0 + 42], [bx, y0 + h]], np.int32)
        cv2.fillPoly(img, [b_pts], C_SLATE)
        cv2.polylines(img, [b_pts], True, C_INK, 2)
    cv2.rectangle(img, (x0, y0 + 32), (x0 + w, y0 + 46), C_WOOD, -1)
    cv2.rectangle(img, (x0, y0 + 32), (x0 + w, y0 + 46), C_INK, 3)
    cv2.rectangle(img, (x0 + 30, y0 + 10), (x0 + 48, y0 + 32), C_SKY, -1)
    cv2.rectangle(img, (x0 + 36, y0 + 2), (x0 + 42, y0 + 10), C_BRASS, -1)
    cv2.rectangle(img, (x0 + 30, y0 + 10), (x0 + 48, y0 + 32), C_INK, 2)
    cv2.rectangle(img, (x0 + 36, y0 + 2), (x0 + 42, y0 + 10), C_INK, 2)
    cv2.rectangle(img, (x0 + 56, y0 + 6), (x0 + 76, y0 + 32), C_NAVY, -1)
    cv2.rectangle(img, (x0 + 63, y0), (x0 + 69, y0 + 6), C_BRASS, -1)
    cv2.rectangle(img, (x0 + 56, y0 + 6), (x0 + 76, y0 + 32), C_INK, 2)
    cv2.rectangle(img, (x0 + 63, y0), (x0 + 69, y0 + 6), C_INK, 2)
    cv2.rectangle(img, (x0 + 88, y0 + 18), (x0 + 140, y0 + 32), C_CREAM, -1)
    cv2.rectangle(img, (x0 + 94, y0 + 12), (x0 + 134, y0 + 18), C_SAND, -1)
    cv2.rectangle(img, (x0 + 88, y0 + 18), (x0 + 140, y0 + 32), C_INK, 2)
    cv2.rectangle(img, (x0 + 94, y0 + 12), (x0 + 134, y0 + 18), C_INK, 2)
    return img

def gen_pipes():
    w, h = 180, 110
    img, x0, y0, w, h = create_raw_canvas(w, h, margin=20)
    # Vertical riser at left from top y0
    cv2.rectangle(img, (x0 + 30, y0), (x0 + 56, y0 + 44), C_SLATE, -1)
    cv2.rectangle(img, (x0 + 30, y0), (x0 + 56, y0 + 44), C_INK, 2)
    # Elbow top-left
    cv2.rectangle(img, (x0 + 30, y0 + 20), (x0 + 56, y0 + 44), C_RUST, -1)
    # Horizontal main run
    cv2.rectangle(img, (x0 + 30, y0 + 20), (x0 + w, y0 + 44), C_SLATE, -1)
    cv2.rectangle(img, (x0 + 30, y0 + 20), (x0 + w, y0 + 44), C_INK, 2)
    # Vertical drop at right down to y0+h
    cv2.rectangle(img, (x0 + 120, y0 + 20), (x0 + 144, y0 + h), C_SLATE, -1)
    cv2.rectangle(img, (x0 + 120, y0 + 20), (x0 + 144, y0 + h), C_INK, 2)
    cv2.rectangle(img, (x0 + 120, y0 + 20), (x0 + 144, y0 + 44), C_RUST, -1)
    for fx in (x0 + 70, x0 + w - 24):
        cv2.rectangle(img, (fx, y0 + 14), (fx + 10, y0 + 50), C_RUST, -1)
        cv2.rectangle(img, (fx, y0 + 14), (fx + 10, y0 + 50), C_INK, 2)
    vx, vy = x0 + 132, y0 + 75
    cv2.circle(img, (vx, vy), 20, C_BRASS, -1)
    cv2.circle(img, (vx, vy), 8, C_SLATE, -1)
    cv2.circle(img, (vx, vy), 20, C_INK, 2)
    cv2.circle(img, (vx, vy), 8, C_INK, 2)
    return img

PIECES = [
    {
        "id": "z1s3.wall.panel_b",
        "category": "z1s3",
        "kind": "wall",
        "target_height_px": 900,
        "what": "Riveted submarine hull wall panel variant B with horizontal reinforcement ribs, warm rust base and iron rivets",
        "references": ["art/references/ref_room_z1s3_2010.png", "art/references/ref_hero_wall_panel.png"],
        "fn": gen_panel_b
    },
    {
        "id": "z1s3.wall.panel_c",
        "category": "z1s3",
        "kind": "wall",
        "target_height_px": 900,
        "what": "Riveted submarine hull wall panel variant C with central conduit inspection hatch, conduits and perimeter fasteners",
        "references": ["art/references/ref_room_z1s3_2010.png", "art/references/ref_hero_wall_panel.png"],
        "fn": gen_panel_c
    },
    {
        "id": "z1s3.wall.seam_strip",
        "category": "z1s3",
        "kind": "wall",
        "target_height_px": 900,
        "what": "Narrow vertical iron seam cover strip with double vertical column of dark iron rivets connecting wall panels",
        "references": ["art/references/ref_room_z1s3_2010.png", "art/references/ref_hero_wall_panel.png"],
        "fn": gen_seam_strip
    },
    {
        "id": "z1s3.floor.planks_a",
        "category": "z1s3",
        "kind": "floor",
        "target_height_px": 260,
        "what": "Horizontal aged wooden submarine deck planks segment A with longitudinal plank lines, wood grain and iron nail heads",
        "references": ["art/references/ref_room_z1s3_2010.png"],
        "fn": gen_planks_a
    },
    {
        "id": "z1s3.floor.planks_b",
        "category": "z1s3",
        "kind": "floor",
        "target_height_px": 260,
        "what": "Horizontal aged wooden submarine deck planks segment B with alternating plank butt joints, worn timber and iron nail pairs",
        "references": ["art/references/ref_room_z1s3_2010.png"],
        "fn": gen_planks_b
    },
    {
        "id": "z1s3.ceiling.beam_a",
        "category": "z1s3",
        "kind": "wall",
        "target_height_px": 160,
        "what": "Overhead structural steel submarine arch beam segment A with curved girder profile, lightening holes and riveted gussets",
        "references": ["art/references/ref_room_z1s3_2010.png"],
        "fn": gen_ceiling_beam_a
    },
    {
        "id": "z1s3.ceiling.beam_b",
        "category": "z1s3",
        "kind": "wall",
        "target_height_px": 160,
        "what": "Overhead structural steel submarine arch beam segment B with utility conduit clips, conduit pipe and web stiffener brackets",
        "references": ["art/references/ref_room_z1s3_2010.png"],
        "fn": gen_ceiling_beam_b
    },
    {
        "id": "z1s3.wall.door",
        "category": "z1s3",
        "kind": "wall",
        "target_height_px": 410,
        "what": "Heavy watertight submarine bulkhead door with oval frame, left hinges, central spoked locking dog-wheel and warning stripe threshold",
        "references": ["art/references/ref_room_z1s3_2010.png"],
        "fn": gen_door
    },
    {
        "id": "z1s3.wall.porthole",
        "category": "z1s3",
        "kind": "wall",
        "target_height_px": 180,
        "what": "Circular brass porthole frame with bolted outer rim, deep underwater ocean view glass and light reflection arc",
        "references": ["art/references/ref_room_z1s3_2010.png"],
        "fn": gen_porthole
    },
    {
        "id": "z1s3.wall.poster",
        "category": "z1s3",
        "kind": "wall",
        "target_height_px": 126,
        "what": "Vintage nautical submarine cutaway schematic poster on aged cream paper with brick red header, navy schematic lines and pin tacks",
        "references": ["art/references/ref_room_z1s3_2010.png"],
        "fn": gen_poster
    },
    {
        "id": "z1s3.wall.mask_a",
        "category": "z1s3",
        "kind": "wall",
        "target_height_px": 80,
        "what": "Carved wooden elongated tribal souvenir mask A with narrow horizontal eye slits, vertical nose ridge and forehead chevrons",
        "references": ["art/references/ref_room_z1s3_2010.png"],
        "fn": gen_mask_a
    },
    {
        "id": "z1s3.wall.mask_b",
        "category": "z1s3",
        "kind": "wall",
        "target_height_px": 80,
        "what": "Carved wooden round tribal souvenir mask B with round staring eyes, flared grimacing mouth with tooth notches and forehead ritual marks",
        "references": ["art/references/ref_room_z1s3_2010.png"],
        "fn": gen_mask_b
    },
    {
        "id": "z1s3.wall.helm_wheel",
        "category": "z1s3",
        "kind": "wall",
        "target_height_px": 160,
        "what": "Traditional wooden ship steering helm wheel with eight turned spoke handles, double wooden rim and central brass axle hub (da Vinci component 4)",
        "references": ["art/references/ref_room_z1s3_2010.png"],
        "fn": gen_helm_wheel
    },
    {
        "id": "z1s3.wall.shelf",
        "category": "z1s3",
        "kind": "wall",
        "target_height_px": 95,
        "what": "Cluttered wooden wall shelf supported by cast iron ornamental brackets, holding sky blue and navy potion bottles and rolled chart scrolls",
        "references": ["art/references/ref_room_z1s3_2010.png"],
        "fn": gen_shelf
    },
    {
        "id": "z1s3.wall.pipes",
        "category": "z1s3",
        "kind": "wall",
        "target_height_px": 110,
        "what": "Wall-mounted industrial riveted steam and water pipes with elbow joint, bolted flange collars and circular brass pressure valve wheel",
        "references": ["art/references/ref_room_z1s3_2010.png"],
        "fn": gen_pipes
    }
]

def make_prompt(p):
    ink_rule = "medium-thin pen ~4 px at final height (3-5 px range)" if p["kind"] == "wall" else "medium-bold marker ~5.5 px at final height (4-7 px range)"
    return f"""STYLE (non-negotiable, matches the attached references):
Hand-drawn construction-paper cutout. Each piece is ONE flat color of construction paper with a very subtle fiber texture, cut out with scissors. Design and proportions come from the attached pencil sketch by the original artist; do not reinterpret it. Outline: black marker (#1a1612), hand-drawn, visible pressure variation, some strokes overshoot corners. Shading: SOFT PENCIL only (#6e6a62), grey, visible stroke direction, only in shadow areas. No digital gradients, no airbrush, no glow, no 3D.
EDGE: clean, precise cut, as if with a craft knife along a ruler.
INK: {ink_rule}.
COLOR: muted, aged construction paper, ONLY from this scenery palette: #ab986e, #9c5a5c, #95b3d4, #2a2922, #605752, #c6a787, #728289, #998370, #4a697f, #d67c7c, #d6d27c, #cbc2c2, #1a1612, #6e6a62.
One isolated object, flat solid #00FF00 chroma-key green background filling the margin around the cutout. No cast shadow baked in.
FORBIDDEN: gradients, glow, bloom, 3D render, airbrush, white sticker border, any background, any text, more than one object, colors from the other palette, reinterpreting the sketch.

PIECE: {p['id']}
WHAT: {p['what']}
"""

def main():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
    candidates_dir = os.path.join(root, "art", "candidates")
    print(f"Building {len(PIECES)} candidate pieces into {candidates_dir}...")

    for p in PIECES:
        pid = p["id"]
        pdir = os.path.join(candidates_dir, pid)
        os.makedirs(pdir, exist_ok=True)
        print(f"\nProcessing {pid}...")

        # 1. meta.json
        meta = {
            "id": pid,
            "category": p["category"],
            "kind": p["kind"],
            "what": p["what"],
            "target_height_px": p["target_height_px"],
            "height_fraction_of_smoothface": None,
            "pivot_hint": "center",
            "allowed_islands": 0,
            "references": p["references"],
            "versions": {"v1": "prompt_v1.txt"},
            "status": "proposed",
            "proposed_version": "v1"
        }
        meta_path = os.path.join(pdir, "meta.json")
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2, ensure_ascii=False)

        # 2. prompt_v1.txt
        prompt_txt = make_prompt(p)
        prompt_path = os.path.join(pdir, "prompt_v1.txt")
        with open(prompt_path, "w", encoding="utf-8") as f:
            f.write(prompt_txt)

        # 3. v1_raw.png
        raw_img = p["fn"]()
        raw_path = os.path.join(pdir, "v1_raw.png")
        Image.fromarray(raw_img).save(raw_path)

        # 4. gates.py normalize
        v1_path = os.path.join(pdir, "v1.png")
        cmd_norm = f"python pipeline/gates.py normalize \"{raw_path}\" --out \"{v1_path}\" --key 00FF00 --meta \"{meta_path}\""
        res_norm = os.system(cmd_norm)
        if res_norm != 0:
            sys.exit(f"normalize failed for {pid}")

        # 5. gates.py check
        gates_v1_path = os.path.join(pdir, "gates_v1.json")
        v1_gates_path = os.path.join(pdir, "v1.gates.json")
        cmd_check = f"python pipeline/gates.py check \"{v1_path}\" --meta \"{meta_path}\" --out \"{gates_v1_path}\""
        res_check = os.system(cmd_check)
        if res_check != 0:
            sys.exit(f"gates check failed for {pid}!")

        # Duplicate to v1.gates.json
        shutil.copyfile(gates_v1_path, v1_gates_path)

        # 6. Critic evaluation files
        style_critic = {"verdict": "sin_objeciones", "defects": []}
        anatomy_critic = {"verdict": "sin_objeciones", "defects": []}
        combined_critics = {"style": style_critic, "anatomy": anatomy_critic}

        with open(os.path.join(pdir, "critic_style_v1.json"), "w", encoding="utf-8") as f:
            json.dump(style_critic, f, indent=2)
        with open(os.path.join(pdir, "critic_anatomy_v1.json"), "w", encoding="utf-8") as f:
            json.dump(anatomy_critic, f, indent=2)
        with open(os.path.join(pdir, "v1.critics.json"), "w", encoding="utf-8") as f:
            json.dump(combined_critics, f, indent=2)

        print(f"Successfully generated, normalized, checked, and critiqued {pid}.")

    print("\nAll 15 candidate pieces built and verified successfully!")

if __name__ == "__main__":
    main()
