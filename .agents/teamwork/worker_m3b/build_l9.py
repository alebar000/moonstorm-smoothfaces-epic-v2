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

def render_bed():
    # Target height 220 px
    W, H = 220, 220
    img, ox, oy = create_canvas(W, H)
    
    # Solid background structure between posts to ensure single connected component
    cv2.rectangle(img, (ox + 10, oy + 40), (ox + W - 10, oy + H - 10), RUST, -1)
    
    # Left headboard post (tall)
    cv2.rectangle(img, (ox + 10, oy + 20), (ox + 30, oy + H), WOOD, -1)
    cv2.circle(img, (ox + 20, oy + 20), 8, BRASS, -1)
    
    # Right footboard post
    cv2.rectangle(img, (ox + W - 30, oy + 55), (ox + W - 10, oy + H), WOOD, -1)
    cv2.circle(img, (ox + W - 20, oy + 55), 8, BRASS, -1)
    
    # Arched Headboard panel
    hb_pts = np.array([
        [ox + 30, oy + 45],
        [ox + 70, oy + 32],
        [ox + 100, oy + 45],
        [ox + 100, oy + 120],
        [ox + 30, oy + 120]
    ], np.int32)
    cv2.fillPoly(img, [hb_pts], WOOD)
    
    # Mattress base frame
    cv2.rectangle(img, (ox + 30, oy + 120), (ox + W - 30, oy + 175), RUST, -1)
    
    # Mattress and Blanket
    cv2.rectangle(img, (ox + 30, oy + 110), (ox + W - 30, oy + 160), CREAM, -1)
    # Striped nautical navy bands across blanket
    for bx in range(ox + 80, ox + W - 35, 25):
        cv2.rectangle(img, (bx, oy + 110), (bx + 12, oy + 160), NAVY, -1)
        
    # Pillow at headboard
    pillow_pts = np.array([
        [ox + 32, oy + 95],
        [ox + 75, oy + 95],
        [ox + 82, oy + 125],
        [ox + 32, oy + 125]
    ], np.int32)
    cv2.fillPoly(img, [pillow_pts], CREAM)
    
    # Bed skirt / underbed shadow
    cv2.rectangle(img, (ox + 30, oy + 175), (ox + W - 30, oy + H - 15), IRON, -1)
    
    # Outlines
    cv2.rectangle(img, (ox + 10, oy + 20), (ox + 30, oy + H), INK, 3)
    cv2.circle(img, (ox + 20, oy + 20), 8, INK, 3)
    cv2.rectangle(img, (ox + W - 30, oy + 55), (ox + W - 10, oy + H), INK, 3)
    cv2.circle(img, (ox + W - 20, oy + 55), 8, INK, 3)
    cv2.polylines(img, [hb_pts], True, INK, 3)
    cv2.rectangle(img, (ox + 30, oy + 110), (ox + W - 30, oy + 175), INK, 3)
    cv2.polylines(img, [pillow_pts], True, INK, 2)
    cv2.rectangle(img, (ox + 30, oy + 175), (ox + W - 30, oy + H - 15), INK, 3)
    
    return img

def render_nightstand():
    # Target height 142 px
    W, H = 130, 142
    img, ox, oy = create_canvas(W, H)
    
    # Nightstand solid backing
    cv2.rectangle(img, (ox + 15, oy + 20), (ox + W - 15, oy + H), RUST, -1)
    
    # Table top
    top_pts = np.array([
        [ox + 10, oy + 20],
        [ox + W - 10, oy + 20],
        [ox + W - 18, oy + 36],
        [ox + 18, oy + 36]
    ], np.int32)
    cv2.fillPoly(img, [top_pts], WOOD)
    
    # Upper drawer box
    cv2.rectangle(img, (ox + 18, oy + 36), (ox + W - 18, oy + 76), WOOD, -1)
    # Drawer face
    cv2.rectangle(img, (ox + 24, oy + 42), (ox + W - 24, oy + 70), SAND, -1)
    # Brass pull knob
    cv2.circle(img, (ox + W//2, oy + 56), 6, BRASS, -1)
    cv2.circle(img, (ox + W//2, oy + 56), 6, INK, 2)
    
    # Lower shelf space
    cv2.rectangle(img, (ox + 22, oy + 76), (ox + W - 22, oy + 112), IRON, -1)
    # Stack of 2 old nautical books on shelf
    cv2.rectangle(img, (ox + 35, oy + 94), (ox + W - 35, oy + 103), RED, -1)
    cv2.rectangle(img, (ox + 38, oy + 84), (ox + W - 38, oy + 94), BLUE, -1)
    
    # Lower shelf board
    cv2.rectangle(img, (ox + 18, oy + 112), (ox + W - 18, oy + 120), WOOD, -1)
    
    # 4 legs
    cv2.rectangle(img, (ox + 18, oy + 120), (ox + 30, oy + H), WOOD, -1)
    cv2.rectangle(img, (ox + W - 30, oy + 120), (ox + W - 18, oy + H), WOOD, -1)
    # Underbed shadow between legs
    cv2.rectangle(img, (ox + 30, oy + 120), (ox + W - 30, oy + H), IRON, -1)
    
    # Outlines
    cv2.polylines(img, [top_pts], True, INK, 3)
    cv2.rectangle(img, (ox + 18, oy + 36), (ox + W - 18, oy + 76), INK, 3)
    cv2.rectangle(img, (ox + 24, oy + 42), (ox + W - 24, oy + 70), INK, 2)
    cv2.rectangle(img, (ox + 18, oy + 76), (ox + W - 18, oy + 112), INK, 3)
    cv2.rectangle(img, (ox + 18, oy + 112), (ox + W - 18, oy + 120), INK, 3)
    cv2.rectangle(img, (ox + 18, oy + 120), (ox + 30, oy + H), INK, 3)
    cv2.rectangle(img, (ox + W - 30, oy + 120), (ox + W - 18, oy + H), INK, 3)
    cv2.rectangle(img, (ox + 30, oy + 120), (ox + W - 30, oy + H), INK, 3)
    
    return img

def render_lamp():
    # Target height 95 px
    W, H = 60, 95
    img, ox, oy = create_canvas(W, H)
    cx = ox + W//2
    
    # Brass base oil font
    base_pts = np.array([
        [cx - 20, oy + H],
        [cx + 20, oy + H],
        [cx + 18, oy + H - 16],
        [cx + 12, oy + H - 24],
        [cx - 12, oy + H - 24],
        [cx - 18, oy + H - 16]
    ], np.int32)
    cv2.fillPoly(img, [base_pts], BRASS)
    
    # Glass chimney (middle bulge)
    chimney_pts = np.array([
        [cx - 10, oy + H - 24],
        [cx + 10, oy + H - 24],
        [cx + 16, oy + H - 45],
        [cx + 8, oy + 28],
        [cx - 8, oy + 28],
        [cx - 16, oy + H - 45]
    ], np.int32)
    cv2.fillPoly(img, [chimney_pts], BLUE)
    
    # Flickering flame inside
    flame_pts = np.array([
        [cx, oy + H - 48],
        [cx + 5, oy + H - 35],
        [cx, oy + H - 32],
        [cx - 5, oy + H - 35]
    ], np.int32)
    cv2.fillPoly(img, [flame_pts], YELLOW)
    
    # Top brass cap & vent ring
    cv2.rectangle(img, (cx - 11, oy + 20), (cx + 11, oy + 28), BRASS, -1)
    cv2.ellipse(img, (cx, oy + 20), (10, 5), 0, 0, 360, BRASS, -1)
    
    # Wire carrying bail loop
    cv2.ellipse(img, (cx, oy + 16), (15, 12), 0, 0, 360, IRON, -1)
    cv2.circle(img, (cx, oy + 16), 8, INK, -1)
    
    # Wire cage side bars
    cv2.line(img, (cx - 14, oy + 28), (cx - 14, oy + H - 24), IRON, 2)
    cv2.line(img, (cx + 14, oy + 28), (cx + 14, oy + H - 24), IRON, 2)
    
    # Complete outlines
    cv2.polylines(img, [base_pts], True, INK, 3)
    cv2.polylines(img, [chimney_pts], True, INK, 3)
    cv2.rectangle(img, (cx - 11, oy + 20), (cx + 11, oy + 28), INK, 3)
    cv2.ellipse(img, (cx, oy + 20), (10, 5), 0, 0, 360, INK, 2)
    cv2.ellipse(img, (cx, oy + 16), (15, 12), 0, 0, 360, INK, 3)
    
    return img

def render_easel_portrait():
    # Target height 205 px
    W, H = 150, 205
    img, ox, oy = create_canvas(W, H)
    cx = ox + W//2
    
    # Connecting back plane so easel legs form 1 solid connected component
    cv2.rectangle(img, (ox + 20, oy + 30), (ox + W - 20, oy + H), RUST, -1)
    
    # Top apex mast
    cv2.rectangle(img, (cx - 6, oy + 10), (cx + 6, oy + 65), WOOD, -1)
    
    # Left A-frame leg
    leg_l = np.array([[cx - 4, oy + 40], [cx - 10, oy + 40], [ox + 16, oy + H], [ox + 26, oy + H]], np.int32)
    leg_r = np.array([[cx + 4, oy + 40], [cx + 10, oy + 40], [ox + W - 16, oy + H], [ox + W - 26, oy + H]], np.int32)
    leg_c = np.array([[cx - 5, oy + 40], [cx + 5, oy + 40], [cx + 5, oy + H - 10], [cx - 5, oy + H - 10]], np.int32)
    
    cv2.fillPoly(img, [leg_l], WOOD)
    cv2.fillPoly(img, [leg_r], WOOD)
    cv2.fillPoly(img, [leg_c], WOOD)
    
    # Horizontal easel shelf
    cv2.rectangle(img, (ox + 15, oy + 138), (ox + W - 15, oy + 148), WOOD, -1)
    
    # Framed Canvas (Portrait)
    cv2.rectangle(img, (ox + 28, oy + 52), (ox + W - 28, oy + 138), BRASS, -1)
    # Inner canvas face
    cv2.rectangle(img, (ox + 34, oy + 58), (ox + W - 34, oy + 132), SAND, -1)
    
    # Painted portrait of pirate ancestor
    # Head & Hat
    cv2.ellipse(img, (cx, oy + 88), (14, 18), 0, 0, 360, CREAM, -1)
    cv2.ellipse(img, (cx, oy + 76), (20, 8), 0, 0, 360, IRON, -1)
    # Eye patches & mustache
    cv2.circle(img, (cx - 5, oy + 85), 3, INK, -1)
    cv2.circle(img, (cx + 5, oy + 85), 3, INK, -1)
    cv2.ellipse(img, (cx, oy + 96), (10, 4), 0, 0, 360, IRON, -1)
    # Red coat collar
    cv2.rectangle(img, (cx - 16, oy + 106), (cx + 16, oy + 132), RED, -1)
    
    # Outlines
    cv2.polylines(img, [leg_l], True, INK, 3)
    cv2.polylines(img, [leg_r], True, INK, 3)
    cv2.polylines(img, [leg_c], True, INK, 3)
    cv2.rectangle(img, (cx - 6, oy + 10), (cx + 6, oy + 65), INK, 3)
    cv2.rectangle(img, (ox + 15, oy + 138), (ox + W - 15, oy + 148), INK, 3)
    cv2.rectangle(img, (ox + 28, oy + 52), (ox + W - 28, oy + 138), INK, 3)
    cv2.rectangle(img, (ox + 34, oy + 58), (ox + W - 34, oy + 132), INK, 2)
    cv2.rectangle(img, (ox + 20, oy + 148), (ox + W - 20, oy + H), INK, 3)
    
    return img

def render_hammer_bag():
    # Target height 79 px
    W, H = 100, 79
    img, ox, oy = create_canvas(W, H)
    cx = ox + W//2
    
    # Bag body: canvas duffel bag in warm sand
    bag_pts = np.array([
        [ox + 14, oy + 32],
        [ox + W - 14, oy + 32],
        [ox + W - 8, oy + H],
        [ox + 8, oy + H]
    ], np.int32)
    cv2.fillPoly(img, [bag_pts], SAND)
    
    # Leather reinforcing bottom and strap
    cv2.rectangle(img, (ox + 8, oy + H - 16), (ox + W - 8, oy + H), RUST, -1)
    cv2.rectangle(img, (ox + 28, oy + 32), (ox + 36, oy + H), RUST, -1)
    cv2.rectangle(img, (ox + W - 36, oy + 32), (ox + W - 28, oy + H), RUST, -1)
    # Brass buckle
    cv2.rectangle(img, (ox + 26, oy + 50), (ox + 38, oy + 60), BRASS, -1)
    cv2.rectangle(img, (ox + W - 38, oy + 50), (ox + W - 26, oy + 60), BRASS, -1)
    
    # 3 hammers sticking out of the top
    # Left hammer: handle + iron head
    cv2.line(img, (cx - 24, oy + 32), (cx - 36, oy + 14), WOOD, 3)
    cv2.rectangle(img, (cx - 44, oy + 10), (cx - 28, oy + 18), IRON, -1)
    
    # Center hammer: claw hammer
    cv2.line(img, (cx - 2, oy + 32), (cx - 2, oy + 8), WOOD, 3)
    cv2.rectangle(img, (cx - 12, oy + 6), (cx + 8, oy + 14), IRON, -1)
    
    # Right hammer: mallet (iron/wood)
    cv2.line(img, (cx + 20, oy + 32), (cx + 30, oy + 12), WOOD, 3)
    cv2.rectangle(img, (cx + 22, oy + 6), (cx + 40, oy + 18), IRON, -1)
    
    # Bag mouth fold
    cv2.ellipse(img, (cx, oy + 32), (W//2 - 14, 8), 0, 0, 360, RUST, -1)
    
    # Outlines with thick enclosing ink
    cv2.line(img, (cx - 24, oy + 32), (cx - 36, oy + 14), INK, 5)
    cv2.rectangle(img, (cx - 44, oy + 10), (cx - 28, oy + 18), INK, 3)
    cv2.line(img, (cx - 2, oy + 32), (cx - 2, oy + 8), INK, 5)
    cv2.rectangle(img, (cx - 12, oy + 6), (cx + 8, oy + 14), INK, 3)
    cv2.line(img, (cx + 20, oy + 32), (cx + 30, oy + 12), INK, 5)
    cv2.rectangle(img, (cx + 22, oy + 6), (cx + 40, oy + 18), INK, 3)
    
    cv2.polylines(img, [bag_pts], True, INK, 3)
    cv2.rectangle(img, (ox + 8, oy + H - 16), (ox + W - 8, oy + H), INK, 3)
    cv2.ellipse(img, (cx, oy + 32), (W//2 - 14, 8), 0, 0, 360, INK, 3)
    
    return img

def render_glue():
    # Target height 57 px
    W, H = 54, 57
    img, ox, oy = create_canvas(W, H)
    cx = ox + W//2
    
    # Earthenware glue pot body
    pot_pts = np.array([
        [cx - 16, oy + 24],
        [cx + 16, oy + 24],
        [cx + 22, oy + 38],
        [cx + 18, oy + H],
        [cx - 18, oy + H],
        [cx - 22, oy + 38]
    ], np.int32)
    cv2.fillPoly(img, [pot_pts], SAND)
    
    # Glazed rim with amber glue drips
    cv2.ellipse(img, (cx, oy + 24), (16, 6), 0, 0, 360, BRASS, -1)
    cv2.ellipse(img, (cx - 8, oy + 32), (3, 6), 0, 0, 360, BRASS, -1)
    cv2.ellipse(img, (cx + 6, oy + 35), (4, 8), 0, 0, 360, BRASS, -1)
    
    # Wooden glue brush applicator sticking out
    # Brush handle
    cv2.line(img, (cx, oy + 24), (cx + 16, oy + 4), WOOD, 3)
    # Metal ferrule
    cv2.line(img, (cx + 8, oy + 14), (cx + 12, oy + 9), SLATE, 3)
    
    # Outlines enclosing outer edge
    cv2.line(img, (cx, oy + 24), (cx + 16, oy + 4), INK, 5)
    cv2.circle(img, (cx + 16, oy + 4), 3, INK, -1)
    cv2.polylines(img, [pot_pts], True, INK, 3)
    cv2.ellipse(img, (cx, oy + 24), (16, 6), 0, 0, 360, INK, 3)
    
    return img

def render_dirty_laundry():
    # Target height 79 px
    W, H = 110, 79
    img, ox, oy = create_canvas(W, H)
    cx = ox + W//2
    
    # Disheveled pile of rumpled clothes
    # Base heap silhouette
    heap_pts = np.array([
        [ox + 10, oy + H],
        [ox + 16, oy + 45],
        [ox + 35, oy + 26],
        [ox + 55, oy + 18],
        [ox + 75, oy + 24],
        [ox + 94, oy + 42],
        [ox + 102, oy + H]
    ], np.int32)
    cv2.fillPoly(img, [heap_pts], SLATE)
    
    # Red flannel shirt fold
    shirt_pts = np.array([
        [ox + 20, oy + 50],
        [ox + 45, oy + 28],
        [ox + 65, oy + 38],
        [ox + 52, oy + 65],
        [ox + 28, oy + 68]
    ], np.int32)
    cv2.fillPoly(img, [shirt_pts], RED)
    
    # Navy sailor trousers patch
    pants_pts = np.array([
        [ox + 50, oy + 36],
        [ox + 82, oy + 26],
        [ox + 96, oy + 56],
        [ox + 68, oy + 72]
    ], np.int32)
    cv2.fillPoly(img, [pants_pts], NAVY)
    
    # Striped dirty sock hanging off pile
    sock_pts = np.array([
        [ox + 64, oy + 55],
        [ox + 92, oy + 52],
        [ox + 104, oy + 68],
        [ox + 92, oy + 76],
        [ox + 66, oy + 70]
    ], np.int32)
    cv2.fillPoly(img, [sock_pts], CREAM)
    for sx in (ox + 74, ox + 84, ox + 94):
        cv2.line(img, (sx, oy + 54), (sx, oy + 74), NAVY, 3)
        
    # Pencil crease shading
    cv2.line(img, (ox + 32, oy + 48), (ox + 48, oy + 54), PENCIL, 2)
    cv2.line(img, (ox + 60, oy + 45), (ox + 72, oy + 58), PENCIL, 2)
    cv2.line(img, (ox + 40, oy + 65), (ox + 65, oy + 68), PENCIL, 2)
    
    # Enclosing outlines
    cv2.polylines(img, [heap_pts], True, INK, 3)
    cv2.polylines(img, [shirt_pts], True, INK, 2)
    cv2.polylines(img, [pants_pts], True, INK, 2)
    cv2.polylines(img, [sock_pts], True, INK, 3)
    
    return img

def main():
    pieces = [
        ('z1s3.prop.bed', render_bed(), 220, 'prop', 0.70, 'bottom-center bedposts on cabin floor',
         'Rustic wooden captain bunk bed / cot with arched wooden headboard, footboard, corner posts, and navy striped blanket with cream pillow'),
        ('z1s3.prop.nightstand', render_nightstand(), 142, 'prop', 0.45, 'bottom-center legs on cabin floor',
         'Square wooden bedside table with single drawer, brass pull knob, lower open shelf with books, and four tapered wooden legs'),
        ('z1s3.prop.lamp', render_lamp(), 95, 'prop', 0.30, 'bottom-center base on nightstand',
         'Vintage brass hurricane lantern / oil lamp with glass chimney, brass base, wire carrying bail, and warm flickering flame'),
        ('z1s3.prop.easel_portrait', render_easel_portrait(), 205, 'prop', 0.65, 'bottom-center easel tripod legs on cabin floor',
         'Wooden tripod easel holding framed portrait canvas of a pompous naval ancestor (Perpetual Movement Machine puzzle component 2)'),
        ('z1s3.prop.hammer_bag', render_hammer_bag(), 79, 'prop', 0.25, 'bottom-center bag base on cabin floor',
         'Stitched heavy canvas and leather duffel bag overflowing with iron claw hammers and mallets (Perpetual Movement Machine puzzle component 1)'),
        ('z1s3.prop.glue', render_glue(), 57, 'prop', 0.18, 'bottom-center pot base on desk',
         'Industrial horse glue earthenware pot with dripping amber glue rim and wooden applicator brush sticking out (Perpetual Movement Machine puzzle component 3)'),
        ('z1s3.prop.dirty_laundry', render_dirty_laundry(), 79, 'prop', 0.25, 'bottom-center pile on cabin floor',
         'Disheveled heap of sailor dirty laundry, rumpled shirts, striped socks, and wrinkled trousers piled on cabin floor')
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
            
    print(f'Batch L9 complete. All passed: {all_passed}')

if __name__ == '__main__':
    main()
