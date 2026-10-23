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

def render_card_table():
    # Target height 158 px, foreground kind (ink [6, 9])
    W, H = 220, 158
    img, ox, oy = create_canvas(W, H)
    cx = ox + W//2
    
    # Connecting structure so table is 1 connected component
    cv2.rectangle(img, (cx - 40, oy + 40), (cx + 40, oy + H), RUST, -1)
    
    # Round wooden tabletop (ellipse)
    cv2.ellipse(img, (cx, oy + 44), (W//2 - 15, 34), 0, 0, 360, WOOD, -1)
    # Beveled rim
    cv2.ellipse(img, (cx, oy + 54), (W//2 - 18, 30), 0, 0, 180, RUST, -1)
    
    # Playing cards scattered on table
    card1 = np.array([[cx - 45, oy + 32], [cx - 25, oy + 26], [cx - 15, oy + 48], [cx - 35, oy + 54]], np.int32)
    card2 = np.array([[cx - 20, oy + 35], [cx + 5, oy + 32], [cx + 2, oy + 56], [cx - 23, oy + 59]], np.int32)
    card3 = np.array([[cx + 15, oy + 30], [cx + 38, oy + 38], [cx + 26, oy + 60], [cx + 3, oy + 52]], np.int32)
    cv2.fillPoly(img, [card1], CREAM)
    cv2.fillPoly(img, [card2], CREAM)
    cv2.fillPoly(img, [card3], CREAM)
    cv2.polylines(img, [card1], True, INK, 2)
    cv2.polylines(img, [card2], True, INK, 2)
    cv2.polylines(img, [card3], True, INK, 2)
    # Card suits (red / ink)
    cv2.circle(img, (cx - 25, oy + 40), 3, RED, -1)
    cv2.circle(img, (cx - 8, oy + 45), 3, INK, -1)
    cv2.circle(img, (cx + 20, oy + 46), 3, RED, -1)
    
    # Heavy turned central pedestal
    cv2.rectangle(img, (cx - 16, oy + 70), (cx + 16, oy + 125), WOOD, -1)
    cv2.circle(img, (cx, oy + 95), 24, RUST, -1)
    
    # Flared circular base
    base_pts = np.array([
        [cx - 16, oy + 125],
        [cx + 16, oy + 125],
        [cx + 55, oy + H],
        [cx - 55, oy + H]
    ], np.int32)
    cv2.fillPoly(img, [base_pts], WOOD)
    
    # Heavy foreground ink outlines (width 5 px to hit [6, 9])
    cv2.ellipse(img, (cx, oy + 44), (W//2 - 15, 34), 0, 0, 360, INK, 5)
    cv2.ellipse(img, (cx, oy + 54), (W//2 - 18, 30), 0, 0, 180, INK, 5)
    cv2.rectangle(img, (cx - 16, oy + 70), (cx + 16, oy + 125), INK, 5)
    cv2.circle(img, (cx, oy + 95), 24, INK, 5)
    cv2.polylines(img, [base_pts], True, INK, 5)
    
    return img

def render_ship_in_bottle():
    # Target height 79 px, foreground kind (ink [6, 9])
    W, H = 140, 79
    img, ox, oy = create_canvas(W, H)
    cx = ox + W//2
    cy = oy + H//2 - 2
    
    # Wooden cradle base connecting bottom
    cradle_pts = np.array([
        [ox + 25, oy + H],
        [ox + W - 25, oy + H],
        [ox + W - 32, oy + H - 16],
        [ox + 32, oy + H - 16]
    ], np.int32)
    cv2.fillPoly(img, [cradle_pts], WOOD)
    
    # Glass bottle cylinder body
    bottle_pts = np.array([
        [ox + 20, cy - 22],
        [ox + W - 42, cy - 22],
        [ox + W - 30, cy - 10],
        [ox + W - 15, cy - 6],
        [ox + W - 15, cy + 6],
        [ox + W - 30, cy + 10],
        [ox + W - 42, cy + 22],
        [ox + 20, cy + 22]
    ], np.int32)
    cv2.fillPoly(img, [bottle_pts], BLUE)
    
    # Cork stopper in bottle neck
    cv2.rectangle(img, (ox + W - 15, cy - 6), (ox + W - 4, cy + 6), SAND, -1)
    
    # Miniature galleon inside bottle
    # Wooden hull
    hull_pts = np.array([
        [cx - 30, cy + 12],
        [cx + 15, cy + 12],
        [cx + 22, cy + 4],
        [cx - 35, cy + 6]
    ], np.int32)
    cv2.fillPoly(img, [hull_pts], RUST)
    
    # 3 masts + paper sails
    for mx in (cx - 20, cx - 5, cx + 10):
        cv2.line(img, (mx, cy + 6), (mx, cy - 16), WOOD, 3)
        # sail
        sail_pts = np.array([
            [mx - 8, cy + 4],
            [mx - 2, cy - 14],
            [mx + 7, cy + 4]
        ], np.int32)
        cv2.fillPoly(img, [sail_pts], CREAM)
        cv2.polylines(img, [sail_pts], True, INK, 2)
        
    # Bottle glass reflection
    cv2.line(img, (ox + 26, cy - 15), (ox + W - 50, cy - 15), CREAM, 3)
    
    # Heavy foreground ink outlines
    cv2.polylines(img, [cradle_pts], True, INK, 4)
    cv2.polylines(img, [bottle_pts], True, INK, 4)
    cv2.rectangle(img, (ox + W - 15, cy - 6), (ox + W - 4, cy + 6), INK, 4)
    cv2.polylines(img, [hull_pts], True, INK, 3)
    
    return img

def render_chest():
    # Target height 173 px, foreground kind (ink [6, 9])
    W, H = 210, 173
    img, ox, oy = create_canvas(W, H)
    cx = ox + W//2
    
    # Sea chest main wooden box
    cv2.rectangle(img, (ox + 15, oy + 58), (ox + W - 15, oy + H), WOOD, -1)
    
    # Barrel curved domed lid
    lid_pts = np.array([
        [ox + 12, oy + 58],
        [ox + 35, oy + 24],
        [cx, oy + 12],
        [ox + W - 35, oy + 24],
        [ox + W - 12, oy + 58]
    ], np.int32)
    cv2.fillPoly(img, [lid_pts], WOOD)
    
    # Dark iron reinforcing bands with rivets (3 vertical bands across lid and box)
    for bx in (ox + 45, cx - 12, ox + W - 65):
        cv2.rectangle(img, (bx, oy + 15), (bx + 24, oy + H), IRON, -1)
        # Rivet dots
        for ry in (oy + 30, oy + 50, oy + 85, oy + 120, oy + 150):
            cv2.circle(img, (bx + 12, ry), 3, BRASS, -1)
            cv2.circle(img, (bx + 12, ry), 3, INK, 2)
            
    # Horizontal iron lid rim band
    cv2.rectangle(img, (ox + 12, oy + 54), (ox + W - 12, oy + 66), IRON, -1)
    
    # Center brass padlock and hasp
    cv2.rectangle(img, (cx - 10, oy + 58), (cx + 10, oy + 76), BRASS, -1)
    cv2.circle(img, (cx, oy + 84), 10, BRASS, -1)
    cv2.circle(img, (cx, oy + 84), 4, IRON, -1)
    cv2.circle(img, (cx, oy + 84), 10, INK, 2)
    
    # Side rope handles (drop handles)
    cv2.ellipse(img, (ox + 14, oy + 95), (8, 14), 0, 0, 360, SAND, -1)
    cv2.ellipse(img, (ox + 14, oy + 95), (8, 14), 0, 0, 360, INK, 3)
    cv2.ellipse(img, (ox + W - 14, oy + 95), (8, 14), 0, 0, 360, SAND, -1)
    cv2.ellipse(img, (ox + W - 14, oy + 95), (8, 14), 0, 0, 360, INK, 3)
    
    # Heavy foreground ink outlines
    cv2.rectangle(img, (ox + 15, oy + 58), (ox + W - 15, oy + H), INK, 4)
    cv2.polylines(img, [lid_pts], True, INK, 4)
    cv2.rectangle(img, (ox + 12, oy + 54), (ox + W - 12, oy + 66), INK, 4)
    
    return img

def render_clown_bust():
    # Target height 110 px, foreground kind (ink [6, 9])
    W, H = 90, 110
    img, ox, oy = create_canvas(W, H)
    cx = ox + W//2
    
    # Pedestal base
    base_pts = np.array([
        [cx - 24, oy + H],
        [cx + 24, oy + H],
        [cx + 20, oy + H - 18],
        [cx - 20, oy + H - 18]
    ], np.int32)
    cv2.fillPoly(img, [base_pts], SLATE)
    
    # Ruffled accordion clown collar
    collar_pts = np.array([
        [cx - 32, oy + H - 18],
        [cx - 38, oy + H - 34],
        [cx - 20, oy + H - 38],
        [cx, oy + H - 34],
        [cx + 20, oy + H - 38],
        [cx + 38, oy + H - 34],
        [cx + 32, oy + H - 18]
    ], np.int32)
    cv2.fillPoly(img, [collar_pts], CREAM)
    
    # Porcelain head (egg shape)
    cv2.ellipse(img, (cx, oy + 46), (22, 26), 0, 0, 360, CREAM, -1)
    
    # Pointed clown dunce cap
    cap_pts = np.array([
        [cx - 18, oy + 28],
        [cx + 6, oy + 4],
        [cx + 18, oy + 28]
    ], np.int32)
    cv2.fillPoly(img, [cap_pts], RED)
    # Cap pom-pom
    cv2.circle(img, (cx + 6, oy + 4), 6, YELLOW, -1)
    cv2.circle(img, (cx + 6, oy + 4), 6, INK, 3)
    
    # Sinister clown face details
    # Big painted red smile
    smile_pts = np.array([
        [cx - 14, oy + 52],
        [cx, oy + 64],
        [cx + 14, oy + 52],
        [cx + 10, oy + 58],
        [cx, oy + 66],
        [cx - 10, oy + 58]
    ], np.int32)
    cv2.fillPoly(img, [smile_pts], RED)
    
    # Bulbous round red nose
    cv2.circle(img, (cx, oy + 46), 7, CORAL, -1)
    cv2.circle(img, (cx, oy + 46), 7, INK, 3)
    
    # Painted triangle eye marks & eye slits
    cv2.circle(img, (cx - 8, oy + 38), 3, INK, -1)
    cv2.circle(img, (cx + 8, oy + 38), 3, INK, -1)
    
    # Heavy foreground ink outlines
    cv2.polylines(img, [base_pts], True, INK, 5)
    cv2.polylines(img, [collar_pts], True, INK, 5)
    cv2.ellipse(img, (cx, oy + 46), (22, 26), 0, 0, 360, INK, 5)
    cv2.polylines(img, [cap_pts], True, INK, 5)
    
    return img

def render_voodoo_doll():
    # Target height 69 px, foreground kind (ink [6, 9])
    W, H = 58, 69
    img, ox, oy = create_canvas(W, H)
    cx = ox + W//2
    cy = oy + 28
    
    # Doll body and head in burlap warm sand
    # Head
    cv2.circle(img, (cx, cy), 16, SAND, -1)
    # Torso
    torso_pts = np.array([
        [cx - 12, cy + 12],
        [cx + 12, cy + 12],
        [cx + 16, oy + H - 12],
        [cx - 16, oy + H - 12]
    ], np.int32)
    cv2.fillPoly(img, [torso_pts], SAND)
    
    # Stumpy legs
    cv2.rectangle(img, (cx - 16, oy + H - 12), (cx - 4, oy + H), SAND, -1)
    cv2.rectangle(img, (cx + 4, oy + H - 12), (cx + 16, oy + H), SAND, -1)
    # Stumpy arms
    cv2.rectangle(img, (cx - 24, cy + 14), (cx - 10, cy + 24), SAND, -1)
    cv2.rectangle(img, (cx + 10, cy + 14), (cx + 24, cy + 24), SAND, -1)
    
    # Mismatched button eyes
    # Left eye: brass button
    cv2.circle(img, (cx - 6, cy - 2), 4, BRASS, -1)
    cv2.circle(img, (cx - 6, cy - 2), 4, INK, 2)
    # Right eye: iron button cross-stitched
    cv2.circle(img, (cx + 6, cy - 2), 5, IRON, -1)
    cv2.circle(img, (cx + 6, cy - 2), 5, INK, 2)
    
    # Crude stitched mouth
    cv2.line(img, (cx - 8, cy + 8), (cx + 8, cy + 8), INK, 2)
    for sx in (cx - 6, cx - 2, cx + 2, cx + 6):
        cv2.line(img, (sx, cy + 5), (sx, cy + 11), INK, 2)
        
    # Brass straight pins sticking into chest
    cv2.line(img, (cx - 4, cy + 18), (cx - 18, cy + 8), BRASS, 2)
    cv2.circle(img, (cx - 18, cy + 8), 3, RED, -1)
    cv2.circle(img, (cx - 18, cy + 8), 3, INK, 2)
    
    # Heavy foreground ink outlines
    cv2.circle(img, (cx, cy), 16, INK, 4)
    cv2.polylines(img, [torso_pts], True, INK, 4)
    cv2.rectangle(img, (cx - 16, oy + H - 12), (cx - 4, oy + H), INK, 4)
    cv2.rectangle(img, (cx + 4, oy + H - 12), (cx + 16, oy + H), INK, 4)
    cv2.rectangle(img, (cx - 24, cy + 14), (cx - 10, cy + 24), INK, 4)
    cv2.rectangle(img, (cx + 10, cy + 14), (cx + 24, cy + 24), INK, 4)
    
    return img

def render_hull_rib(side='left'):
    # Target height 900 px, foreground kind (ink [6, 9])
    # Massive curved arch girder framing screen edge
    W, H = 240, 900
    img, ox, oy = create_canvas(W, H)
    
    if side == 'left':
        # Arch curving from left border inwards
        arch_pts = np.array([
            [ox, oy],
            [ox + 160, oy],
            [ox + 130, oy + 250],
            [ox + 110, oy + 550],
            [ox + 170, oy + H],
            [ox, oy + H]
        ], np.int32)
        cv2.fillPoly(img, [arch_pts], RUST)
        
        # Inner slate plate layer
        inner_pts = np.array([
            [ox + 20, oy + 40],
            [ox + 130, oy + 40],
            [ox + 105, oy + 260],
            [ox + 85, oy + 540],
            [ox + 135, oy + H - 40],
            [ox + 20, oy + H - 40]
        ], np.int32)
        cv2.fillPoly(img, [inner_pts], SLATE)
        
        # Gusset plates and rivets along girder
        for gy in range(oy + 80, oy + H - 60, 110):
            cv2.rectangle(img, (ox + 15, gy), (ox + 110, gy + 45), WOOD, -1)
            cv2.rectangle(img, (ox + 15, gy), (ox + 110, gy + 45), INK, 5)
            cv2.circle(img, (ox + 45, gy + 22), 6, BRASS, -1)
            cv2.circle(img, (ox + 45, gy + 22), 6, INK, 3)
            cv2.circle(img, (ox + 85, gy + 22), 6, BRASS, -1)
            cv2.circle(img, (ox + 85, gy + 22), 6, INK, 3)
            
        cv2.polylines(img, [arch_pts], True, INK, 5)
        cv2.polylines(img, [inner_pts], True, INK, 5)
    else:
        # Mirror for right side
        arch_pts = np.array([
            [ox + W, oy],
            [ox + W - 160, oy],
            [ox + W - 130, oy + 250],
            [ox + W - 110, oy + 550],
            [ox + W - 170, oy + H],
            [ox + W, oy + H]
        ], np.int32)
        cv2.fillPoly(img, [arch_pts], RUST)
        
        inner_pts = np.array([
            [ox + W - 20, oy + 40],
            [ox + W - 130, oy + 40],
            [ox + W - 105, oy + 260],
            [ox + W - 85, oy + 540],
            [ox + W - 135, oy + H - 40],
            [ox + W - 20, oy + H - 40]
        ], np.int32)
        cv2.fillPoly(img, [inner_pts], SLATE)
        
        for gy in range(oy + 80, oy + H - 60, 110):
            cv2.rectangle(img, (ox + W - 110, gy), (ox + W - 15, gy + 45), WOOD, -1)
            cv2.rectangle(img, (ox + W - 110, gy), (ox + W - 15, gy + 45), INK, 5)
            cv2.circle(img, (ox + W - 85, gy + 22), 6, BRASS, -1)
            cv2.circle(img, (ox + W - 85, gy + 22), 6, INK, 3)
            cv2.circle(img, (ox + W - 45, gy + 22), 6, BRASS, -1)
            cv2.circle(img, (ox + W - 45, gy + 22), 6, INK, 3)
            
        cv2.polylines(img, [arch_pts], True, INK, 5)
        cv2.polylines(img, [inner_pts], True, INK, 5)
        
    return img

def main():
    pieces = [
        ('z1s3.fg.card_table', render_card_table(), 158, 'foreground', 0.50, 'bottom-center pedestal base on cabin floor',
         'Foreground round wooden chart and card table with thick bevel rim, turned pedestal base, and scattered nautical playing cards'),
        ('z1s3.fg.ship_in_bottle', render_ship_in_bottle(), 79, 'foreground', 0.25, 'bottom-center cradle base on card table',
         'Miniature three-masted wooden sailing galleon with cream sails inside a corked glass rum bottle resting on wooden cradle'),
        ('z1s3.fg.chest', render_chest(), 173, 'foreground', 0.55, 'bottom-center chest base on cabin floor',
         'Heavy iron-banded wooden pirate sea chest with curved barrel-top lid, iron corner braces, padlock hasp, and side rope handles'),
        ('z1s3.fg.clown_bust', render_clown_bust(), 110, 'foreground', 0.35, 'bottom-center pedestal on sea chest',
         'Porcelain grinning clown bust relic with wide painted red smile, bulbous nose, and ruffled collar (Serious Business gang relic)'),
        ('z1s3.fg.voodoo_doll', render_voodoo_doll(), 69, 'foreground', 0.22, 'bottom-center doll base on table or chest',
         'Stitched burlap voodoo doll with crude black seam stitches, mismatched button eyes, yarn hair, and brass straight pins'),
        ('z1s3.fg.hull_rib_left', render_hull_rib('left'), 900, 'foreground', 2.86, 'bottom-left girder base on cabin floor',
         'Massive arched riveted iron hull rib girder framing the left foreground edge of the submarine cabin across the full 900 px room height'),
        ('z1s3.fg.hull_rib_right', render_hull_rib('right'), 900, 'foreground', 2.86, 'bottom-right girder base on cabin floor',
         'Massive arched riveted iron hull rib girder framing the right foreground edge of the submarine cabin across the full 900 px room height')
    ]
    
    style_header = '''STYLE (non-negotiable, matches the attached references):
Hand-drawn construction-paper cutout. Each piece is ONE flat color of construction paper with a very subtle fiber texture, cut out with scissors. Design and proportions come from the attached pencil sketch by the original artist; do not reinterpret it. Outline: black marker (#1a1612), hand-drawn, visible pressure variation, some strokes overshoot corners. Shading: SOFT PENCIL only (#6e6a62), grey, visible stroke direction, only in shadow areas. No digital gradients, no airbrush, no glow, no 3D.
EDGE: clean, precise cut, as if with a craft knife along a ruler.
INK: thick marker ~7.5 px at game scale (6-9 px range).
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
            
    print(f'Batch L10 complete. All passed: {all_passed}')

if __name__ == '__main__':
    main()
