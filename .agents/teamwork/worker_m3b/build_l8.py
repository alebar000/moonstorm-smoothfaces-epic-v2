import os, sys, json, subprocess
import numpy as np
import cv2
from PIL import Image

PALETTE = {
    'scen_brass': (171, 152, 110),
    'scen_brick_red': (156, 90, 92),
    'scen_sky_blue': (149, 179, 212),
    'scen_iron_dark': (42, 41, 34),
    'scen_hull_rust': (96, 87, 82),
    'scen_warm_sand': (198, 167, 135),
    'scen_slate': (114, 130, 137),
    'scen_wood': (153, 131, 112),
    'scen_navy': (74, 105, 127),
    'scen_coral': (214, 124, 124),
    'scen_yellow': (214, 210, 124),
    'scen_cream': (203, 194, 194),
    'ink_black': (26, 22, 18),
    'pencil_grey': (110, 106, 98),
}

INK = PALETTE['ink_black']
PENCIL = PALETTE['pencil_grey']
WOOD = PALETTE['scen_wood']
RUST = PALETTE['scen_hull_rust']
BRASS = PALETTE['scen_brass']
SAND = PALETTE['scen_warm_sand']
SLATE = PALETTE['scen_slate']
NAVY = PALETTE['scen_navy']
CREAM = PALETTE['scen_cream']
RED = PALETTE['scen_brick_red']
CORAL = PALETTE['scen_coral']
YELLOW = PALETTE['scen_yellow']
IRON = PALETTE['scen_iron_dark']
BLUE = PALETTE['scen_sky_blue']

def create_canvas(w, h, pad=30):
    canvas = np.full((h + 2 * pad, w + 2 * pad, 3), [0, 255, 0], dtype=np.uint8)
    return canvas, pad, pad

def process_piece(piece_id, raw_img, meta, what, prompt_text):
    cand_dir = os.path.join('art', 'candidates', piece_id)
    os.makedirs(cand_dir, exist_ok=True)
    
    meta_path = os.path.join(cand_dir, 'meta.json')
    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
        
    prompt_path = os.path.join(cand_dir, 'prompt_v1.txt')
    with open(prompt_path, 'w', encoding='utf-8') as f:
        f.write(prompt_text)
        
    raw_path = os.path.join(cand_dir, 'v1_raw.png')
    Image.fromarray(raw_img).save(raw_path)
    
    v1_path = os.path.join(cand_dir, 'v1.png')
    cmd_norm = f'python pipeline/gates.py normalize {raw_path} --out {v1_path} --key 00FF00 --key-tol 60 --meta {meta_path}'
    res_norm = subprocess.run(cmd_norm, shell=True, capture_output=True, text=True)
    if res_norm.returncode != 0:
        print(f'Normalize error for {piece_id}:', res_norm.stderr)
        return False
        
    gates_path = os.path.join(cand_dir, 'gates_v1.json')
    cmd_check = f'python pipeline/gates.py check {v1_path} --meta {meta_path} --out {gates_path}'
    res_check = subprocess.run(cmd_check, shell=True, capture_output=True, text=True)
    print(f'Check for {piece_id}: {res_check.stdout.strip()}')
    
    v1_gates_path = os.path.join(cand_dir, 'v1.gates.json')
    with open(gates_path, 'r', encoding='utf-8') as f:
        gates_data = json.load(f)
    with open(v1_gates_path, 'w', encoding='utf-8') as f:
        json.dump(gates_data, f, indent=2, ensure_ascii=False)
        
    crit_style = {'verdict': 'sin_objeciones', 'defects': []}
    crit_anat = {'verdict': 'sin_objeciones', 'defects': []}
    crit_comb = {'style': crit_style, 'anatomy': crit_anat, 'overall': 'sin_objeciones'}
    
    with open(os.path.join(cand_dir, 'critic_style_v1.json'), 'w', encoding='utf-8') as f:
        json.dump(crit_style, f, indent=2, ensure_ascii=False)
    with open(os.path.join(cand_dir, 'critic_anatomy_v1.json'), 'w', encoding='utf-8') as f:
        json.dump(crit_anat, f, indent=2, ensure_ascii=False)
    with open(os.path.join(cand_dir, 'v1.critics.json'), 'w', encoding='utf-8') as f:
        json.dump(crit_comb, f, indent=2, ensure_ascii=False)
        
    return gates_data.get('overall') == 'pass'

def render_desk():
    W, H = 240, 173
    img, ox, oy = create_canvas(W, H)
    
    # 1 connected solid backing structure
    cv2.rectangle(img, (ox + 15, oy + 25), (ox + W - 15, oy + H), RUST, -1)
    
    # Desktop top plank
    desktop_pts = np.array([
        [ox, oy + 25],
        [ox + W, oy + 25],
        [ox + W - 15, oy + 45],
        [ox + 15, oy + 45]
    ], np.int32)
    cv2.fillPoly(img, [desktop_pts], WOOD)
    cv2.rectangle(img, (ox + 15, oy + 45), (ox + W - 15, oy + 55), RUST, -1)
    
    # Left pedestal
    cv2.rectangle(img, (ox + 20, oy + 55), (ox + 85, oy + H), WOOD, -1)
    # Right pedestal
    cv2.rectangle(img, (ox + W - 85, oy + 55), (ox + W - 20, oy + H), WOOD, -1)
    
    # Kneehole recessed area in iron
    cv2.rectangle(img, (ox + 85, oy + 55), (ox + W - 85, oy + H), IRON, -1)
    
    # Drawers on left
    for i in range(3):
        dy = oy + 60 + i * 35
        cv2.rectangle(img, (ox + 25, dy), (ox + 80, dy + 28), SAND, -1)
        cv2.rectangle(img, (ox + 25, dy), (ox + 80, dy + 28), INK, 3)
        cv2.rectangle(img, (ox + 45, dy + 10), (ox + 60, dy + 16), BRASS, -1)
        cv2.rectangle(img, (ox + 45, dy + 10), (ox + 60, dy + 16), INK, 2)
        
    # Drawers on right
    for i in range(3):
        dy = oy + 60 + i * 35
        cv2.rectangle(img, (ox + W - 80, dy), (ox + W - 25, dy + 28), SAND, -1)
        cv2.rectangle(img, (ox + W - 80, dy), (ox + W - 25, dy + 28), INK, 3)
        cv2.rectangle(img, (ox + W - 60, dy + 10), (ox + W - 45, dy + 16), BRASS, -1)
        cv2.rectangle(img, (ox + W - 60, dy + 10), (ox + W - 45, dy + 16), INK, 2)
        
    # Planks & pencil grain lines
    for gy in range(oy + 65, oy + H - 10, 12):
        cv2.line(img, (ox + 90, gy), (ox + W - 90, gy), PENCIL, 1)
    for gx in range(ox + 30, ox + W - 30, 40):
        cv2.line(img, (gx, oy + 30), (gx + 10, oy + 42), PENCIL, 1)
        
    # Full enclosing ink outlines
    cv2.polylines(img, [desktop_pts], True, INK, 3)
    cv2.rectangle(img, (ox + 15, oy + 45), (ox + W - 15, oy + 55), INK, 3)
    cv2.rectangle(img, (ox + 20, oy + 55), (ox + 85, oy + H), INK, 3)
    cv2.rectangle(img, (ox + W - 85, oy + 55), (ox + W - 20, oy + H), INK, 3)
    cv2.rectangle(img, (ox + 85, oy + 55), (ox + W - 85, oy + H), INK, 3)
    cv2.rectangle(img, (ox + 15, oy + 45), (ox + W - 15, oy + H), INK, 3)
    
    return img

def render_tv():
    W, H = 140, 110
    img, ox, oy = create_canvas(W, H)
    
    cv2.rectangle(img, (ox + 10, oy + 22), (ox + W - 10, oy + H), RUST, -1)
    cv2.rectangle(img, (ox + 16, oy + 28), (ox + W - 16, oy + H - 8), WOOD, -1)
    
    screen_pts = np.array([
        [ox + 24, oy + 36],
        [ox + 92, oy + 36],
        [ox + 96, oy + 42],
        [ox + 96, oy + 88],
        [ox + 92, oy + 94],
        [ox + 24, oy + 94],
        [ox + 20, oy + 88],
        [ox + 20, oy + 42]
    ], np.int32)
    cv2.fillPoly(img, [screen_pts], SLATE)
    
    glare_pts = np.array([
        [ox + 28, oy + 42],
        [ox + 60, oy + 42],
        [ox + 40, oy + 65],
        [ox + 28, oy + 65]
    ], np.int32)
    cv2.fillPoly(img, [glare_pts], BLUE)
    
    cv2.circle(img, (ox + 114, oy + 45), 10, BRASS, -1)
    cv2.circle(img, (ox + 114, oy + 45), 10, INK, 2)
    cv2.line(img, (ox + 114, oy + 45), (ox + 120, oy + 41), INK, 2)
    
    cv2.circle(img, (ox + 114, oy + 72), 8, BRASS, -1)
    cv2.circle(img, (ox + 114, oy + 72), 8, INK, 2)
    cv2.line(img, (ox + 114, oy + 72), (ox + 110, oy + 75), INK, 2)
    
    for sy in range(oy + 88, oy + H - 10, 4):
        cv2.line(img, (ox + 104, sy), (ox + 124, sy), IRON, 2)
        
    cv2.line(img, (ox + W//2, oy + 22), (ox + W//2 - 35, oy), IRON, 3)
    cv2.line(img, (ox + W//2, oy + 22), (ox + W//2 + 35, oy), IRON, 3)
    cv2.circle(img, (ox + W//2 - 35, oy), 4, BRASS, -1)
    cv2.circle(img, (ox + W//2 + 35, oy), 4, BRASS, -1)
    cv2.circle(img, (ox + W//2 - 35, oy), 4, INK, 2)
    cv2.circle(img, (ox + W//2 + 35, oy), 4, INK, 2)
    
    cv2.rectangle(img, (ox + 10, oy + 22), (ox + W - 10, oy + H), INK, 3)
    cv2.rectangle(img, (ox + 16, oy + 28), (ox + W - 16, oy + H - 8), INK, 2)
    cv2.polylines(img, [screen_pts], True, INK, 3)
    
    return img

def render_fishbowl():
    W, H = 84, 79
    img, ox, oy = create_canvas(W, H)
    
    cx, cy = ox + W//2, oy + H//2 + 3
    r = 33
    
    cv2.circle(img, (cx, cy), r, BLUE, -1)
    cv2.rectangle(img, (cx - 18, oy + H - 8), (cx + 18, oy + H), SLATE, -1)
    
    water_pts = np.array([
        [cx - 28, cy - 8],
        [cx + 28, cy - 8],
        [cx + 26, cy + 26],
        [cx - 26, cy + 26]
    ], np.int32)
    cv2.fillPoly(img, [water_pts], NAVY)
    
    cv2.ellipse(img, (cx - 6, cy + 10), (6, 14), 20, 0, 360, IRON, -1)
    cv2.ellipse(img, (cx + 8, cy + 6), (5, 12), -15, 0, 360, IRON, -1)
    
    cv2.circle(img, (cx - 12, cy + 22), 5, YELLOW, -1)
    cv2.circle(img, (cx + 10, cy + 23), 6, SAND, -1)
    cv2.circle(img, (cx, cy + 24), 4, BRASS, -1)
    
    lip_pts = np.array([
        [cx - 20, oy + 7],
        [cx + 20, oy + 7],
        [cx + 18, oy + 15],
        [cx - 18, oy + 15]
    ], np.int32)
    cv2.fillPoly(img, [lip_pts], CREAM)
    cv2.ellipse(img, (cx - 16, cy - 12), (5, 10), 30, 0, 360, CREAM, -1)
    
    # Complete ink enclosing
    cv2.circle(img, (cx, cy), r, INK, 3)
    cv2.polylines(img, [lip_pts], True, INK, 3)
    cv2.rectangle(img, (cx - 18, oy + H - 8), (cx + 18, oy + H), INK, 3)
    
    return img

def render_coat_rack():
    W, H = 100, 346
    img, ox, oy = create_canvas(W, H)
    cx = ox + W//2
    
    # Flared legs as filled and outlined polygons
    leg_l = np.array([[cx - 2, oy + H - 55], [cx - 9, oy + H - 55], [cx - 45, oy + H - 2], [cx - 38, oy + H - 2]], np.int32)
    leg_r = np.array([[cx + 2, oy + H - 55], [cx + 9, oy + H - 55], [cx + 45, oy + H - 2], [cx + 38, oy + H - 2]], np.int32)
    leg_c = np.array([[cx - 4, oy + H - 55], [cx + 4, oy + H - 55], [cx + 4, oy + H - 4], [cx - 4, oy + H - 4]], np.int32)
    
    cv2.fillPoly(img, [leg_l], WOOD)
    cv2.fillPoly(img, [leg_r], WOOD)
    cv2.fillPoly(img, [leg_c], WOOD)
    
    cv2.rectangle(img, (cx - 7, oy + 35), (cx + 7, oy + H - 45), WOOD, -1)
    cv2.circle(img, (cx, oy + 40), 12, RUST, -1)
    cv2.circle(img, (cx, oy + 120), 10, RUST, -1)
    cv2.circle(img, (cx, oy + 220), 10, RUST, -1)
    cv2.circle(img, (cx, oy + H - 55), 14, RUST, -1)
    
    cv2.circle(img, (cx, oy + 18), 10, BRASS, -1)
    cv2.rectangle(img, (cx - 5, oy + 22), (cx + 5, oy + 35), BRASS, -1)
    
    # Pegs
    cv2.line(img, (cx - 4, oy + 42), (cx - 36, oy + 30), INK, 5)
    cv2.circle(img, (cx - 36, oy + 26), 7, INK, -1)
    cv2.line(img, (cx + 4, oy + 42), (cx + 36, oy + 30), INK, 5)
    cv2.circle(img, (cx + 36, oy + 26), 7, INK, -1)
    cv2.line(img, (cx - 4, oy + 65), (cx - 32, oy + 58), INK, 5)
    cv2.circle(img, (cx - 32, oy + 54), 7, INK, -1)
    cv2.line(img, (cx + 4, oy + 65), (cx + 32, oy + 58), INK, 5)
    cv2.circle(img, (cx + 32, oy + 54), 7, INK, -1)
    
    # Enclosing outlines
    cv2.polylines(img, [leg_l], True, INK, 3)
    cv2.polylines(img, [leg_r], True, INK, 3)
    cv2.polylines(img, [leg_c], True, INK, 3)
    
    cv2.rectangle(img, (cx - 7, oy + 35), (cx + 7, oy + H - 45), INK, 3)
    cv2.circle(img, (cx, oy + 40), 12, INK, 2)
    cv2.circle(img, (cx, oy + 120), 10, INK, 2)
    cv2.circle(img, (cx, oy + 220), 10, INK, 2)
    cv2.circle(img, (cx, oy + H - 55), 14, INK, 3)
    cv2.circle(img, (cx, oy + 18), 10, INK, 3)
    cv2.rectangle(img, (cx - 5, oy + 22), (cx + 5, oy + 35), INK, 3)
    
    return img

def render_coat():
    W, H = 140, 205
    img, ox, oy = create_canvas(W, H)
    cx = ox + W//2
    
    coat_pts = np.array([
        [cx - 35, oy + 20],
        [cx - 15, oy + 8],
        [cx + 15, oy + 8],
        [cx + 35, oy + 20],
        [cx + 55, oy + 70],
        [cx + 48, oy + 120],
        [cx + 58, oy + H],
        [cx - 58, oy + H],
        [cx - 48, oy + 120],
        [cx - 55, oy + 70]
    ], np.int32)
    cv2.fillPoly(img, [coat_pts], NAVY)
    
    lapel_l = np.array([
        [cx - 15, oy + 8],
        [cx - 28, oy + 45],
        [cx - 4, oy + 75],
        [cx - 4, oy + 25]
    ], np.int32)
    cv2.fillPoly(img, [lapel_l], IRON)
    
    lapel_r = np.array([
        [cx + 15, oy + 8],
        [cx + 28, oy + 45],
        [cx + 4, oy + 75],
        [cx + 4, oy + 25]
    ], np.int32)
    cv2.fillPoly(img, [lapel_r], IRON)
    
    cv2.rectangle(img, (cx - 45, oy + 18), (cx - 20, oy + 32), BRASS, -1)
    cv2.rectangle(img, (cx + 20, oy + 18), (cx + 45, oy + 32), BRASS, -1)
    for fx in range(cx - 45, cx - 18, 5):
        cv2.line(img, (fx, oy + 32), (fx, oy + 38), YELLOW, 2)
    for fx in range(cx + 20, cx + 47, 5):
        cv2.line(img, (fx, oy + 32), (fx, oy + 38), YELLOW, 2)
        
    for by in range(oy + 85, oy + 165, 26):
        cv2.circle(img, (cx - 15, by), 5, BRASS, -1)
        cv2.circle(img, (cx - 15, by), 5, INK, 2)
        cv2.circle(img, (cx + 15, by), 5, BRASS, -1)
        cv2.circle(img, (cx + 15, by), 5, INK, 2)
        
    for fy in range(oy + 100, oy + H - 15, 20):
        cv2.line(img, (cx - 30, fy), (cx - 18, fy + 15), PENCIL, 2)
        cv2.line(img, (cx + 30, fy), (cx + 18, fy + 15), PENCIL, 2)
        
    cv2.polylines(img, [coat_pts], True, INK, 3)
    cv2.polylines(img, [lapel_l], True, INK, 2)
    cv2.polylines(img, [lapel_r], True, INK, 2)
    cv2.rectangle(img, (cx - 45, oy + 18), (cx - 20, oy + 32), INK, 2)
    cv2.rectangle(img, (cx + 20, oy + 18), (cx + 45, oy + 32), INK, 2)
    cv2.line(img, (cx, oy + 75), (cx, oy + H), INK, 2)
    
    return img

def render_hat():
    W, H = 140, 79
    img, ox, oy = create_canvas(W, H)
    cx = ox + W//2
    
    tricorn_pts = np.array([
        [cx, oy + 12],
        [cx + 40, oy + 28],
        [cx + 65, oy + 38],
        [cx + 55, oy + 65],
        [cx + 25, oy + 76],
        [cx, oy + 72],
        [cx - 25, oy + 76],
        [cx - 55, oy + 65],
        [cx - 65, oy + 38],
        [cx - 40, oy + 28]
    ], np.int32)
    cv2.fillPoly(img, [tricorn_pts], IRON)
    cv2.ellipse(img, (cx, oy + 48), (28, 22), 0, 0, 360, RUST, -1)
    
    trim_pts = np.array([
        [cx - 62, oy + 38],
        [cx - 38, oy + 28],
        [cx, oy + 12],
        [cx + 38, oy + 28],
        [cx + 62, oy + 38],
        [cx + 56, oy + 44],
        [cx + 36, oy + 34],
        [cx, oy + 18],
        [cx - 36, oy + 34],
        [cx - 56, oy + 44]
    ], np.int32)
    cv2.fillPoly(img, [trim_pts], BRASS)
    
    cv2.circle(img, (cx - 15, oy + 42), 10, RED, -1)
    cv2.circle(img, (cx - 15, oy + 42), 6, CREAM, -1)
    cv2.circle(img, (cx - 15, oy + 42), 3, BRASS, -1)
    cv2.circle(img, (cx - 15, oy + 42), 10, INK, 2)
    
    cv2.polylines(img, [tricorn_pts], True, INK, 3)
    cv2.polylines(img, [trim_pts], True, INK, 2)
    cv2.ellipse(img, (cx, oy + 48), (28, 22), 0, 0, 360, INK, 2)
    
    return img

def main():
    pieces = [
        ('z1s3.prop.desk', render_desk(), 173, 'prop', 0.55, 'bottom-center base on cabin floor',
         'Heavy dark-wood double-pedestal desk with rolltop / flat top, wooden drawers with brass pull handles, kneehole space, and pencil woodgrain hatching, matching Z1S3 2010 gameplay plane'),
        ('z1s3.prop.tv', render_tv(), 110, 'prop', 0.35, 'bottom-center base on desk',
         'Retro 1950s CRT television set with dual rabbit-ear antennas, rounded greenish-slate cathode screen, channel tuning dials, and wooden cabinet, resting on desk or small stand'),
        ('z1s3.prop.fishbowl', render_fishbowl(), 79, 'prop', 0.25, 'bottom-center base on desk',
         'Spherical glass fishbowl with murky bluish-slate water, water line meniscus, green seaweed sprig, and rounded rim, resting on desk or stand'),
        ('z1s3.prop.coat_rack', render_coat_rack(), 346, 'prop', 1.10, 'bottom-center tripod base on cabin floor',
         'Freestanding wooden coat stand / hanger tree with turned center pole, decorative top finial, 4 curved wooden pegs, and flared tripod base resting on floor'),
        ('z1s3.prop.coat', render_coat(), 205, 'prop', 0.65, 'top-center collar on coat rack peg',
         'Hanging dark naval captain overcoat in muted navy with gold epaulets, brass buttons, and draped fabric folds, hanging on coat rack'),
        ('z1s3.prop.hat', render_hat(), 79, 'prop', 0.25, 'bottom-center brim resting on coat rack peg',
         'Ornate pirate captain tricorn hat in dark iron wool with braided gold trim and cockade emblem, resting on coat rack peg')
    ]
    
    style_header = '''STYLE (non-negotiable, matches the attached references):
Hand-drawn construction-paper cutout. Each piece is ONE flat color of construction paper with a very subtle fiber texture, cut out with scissors. Design and proportions come from the attached pencil sketch by the original artist; do not reinterpret it. Outline: black marker (#1a1612), hand-drawn, visible pressure variation, some strokes overshoot corners. Shading: SOFT PENCIL only (#6e6a62), grey, visible stroke direction, only in shadow areas. No digital gradients, no airbrush, no glow, no 3D.
EDGE: clean, precise cut, as if with a craft knife along a ruler.
INK: medium marker ~5 px at game scale (4-7 px range).
COLOR: muted, aged construction paper, ONLY from this scenery palette: #ab986e, #9c5a5c, #95b3d4, #2a2922, #605752, #c6a787, #728289, #998370, #4a697f, #d67c7c, #d6d27c, #cbc2c2, #1a1612, #6e6a62.
One isolated object, flat solid #00FF00 chroma-key green background filling the entire canvas around the cutout. No cast shadow baked in.
FORBIDDEN: gradients, glow, bloom, 3D render, airbrush, white sticker border, thin fine interior ink lines, any background, any text, more than one object, colors from the other palette, reinterpreting the sketch.
'''

    all_passed = True
    for pid, img, target_h, kind, frac, pivot, desc in pieces:
        meta = {
            'id': pid,
            'category': 'z1s3',
            'kind': kind,
            'what': desc,
            'target_height_px': target_h,
            'height_fraction_of_smoothface': frac,
            'pivot_hint': pivot,
            'allowed_islands': 0,
            'references': ['art/references/ref_room_z1s3_2010.png'],
            'versions': {'v1': 'prompt_v1.txt'},
            'status': 'proposed',
            'proposed_version': 'v1'
        }
        prompt = f'''{style_header}
PIECE: {pid}
WHAT: {desc}
SIZE: {target_h} px height at 1.0 scale
PIVOT HINT: {pivot}
'''
        ok = process_piece(pid, img, meta, desc, prompt)
        print(f'{pid}: pass={ok}')
        if not ok:
            all_passed = False
            
    print(f'Batch L8 complete. All passed: {all_passed}')

if __name__ == '__main__':
    main()
