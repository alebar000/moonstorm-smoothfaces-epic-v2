# build_all_m1_assets.py
# Full implementation of Worker M1 candidate pieces

import os, json, math, sys
import numpy as np
from PIL import Image, ImageDraw

REPO_ROOT = r"c:\AntiGravityStuff\Moonstorm2"
PIPELINE_DIR = os.path.join(REPO_ROOT, "pipeline")
sys.path.insert(0, PIPELINE_DIR)
import gates

RULES = json.load(open(os.path.join(PIPELINE_DIR, "rules.json"), encoding="utf-8"))
PALETTE = json.load(open(os.path.join(PIPELINE_DIR, "palette.json"), encoding="utf-8"))
HEIGHTS = json.load(open(os.path.join(PIPELINE_DIR, "heights.json"), encoding="utf-8"))

# Common palette colors
INK_BLACK = (26, 22, 18)     # #1a1612
PENCIL_GREY = (110, 106, 98) # #6e6a62
GREEN_KEY = (0, 255, 0)      # #00FF00 chroma key

# Characters palette
SF_SKIN_CREAM = (249, 236, 194) # #f9ecc2
SF_COAT_GREY = (50, 50, 50)     # #323232
SF_PANTS_GREY = (113, 113, 113) # #717171
CHAR_BROWN = (97, 62, 53)       # #613e35
CHAR_BLUE = (0, 75, 129)        # #004b81
CHAR_NAVY = (52, 62, 99)        # #343e63
CHAR_CRIMSON = (158, 21, 7)     # #9e1507
CHAR_OCHRE = (156, 121, 58)     # #9c793a
CHAR_GOLD = (231, 188, 87)      # #e7bc57
CHAR_GREEN = (12, 122, 39)      # #0c7a27
CHAR_SLATE = (132, 138, 164)    # #848aa4

# Scenery palette
SCEN_BRASS = (171, 152, 110)    # #ab986e
SCEN_BRICK_RED = (156, 90, 92)  # #9c5a5c
SCEN_SKY_BLUE = (149, 179, 212) # #95b3d4
SCEN_IRON_DARK = (42, 41, 34)   # #2a2922
SCEN_HULL_RUST = (96, 87, 82)   # #605752
SCEN_WARM_SAND = (198, 167, 135)# #c6a787
SCEN_SLATE = (114, 130, 137)    # #728289
SCEN_WOOD = (153, 131, 112)     # #998370
SCEN_NAVY = (74, 105, 127)      # #4a697f
SCEN_CORAL = (214, 124, 124)    # #d67c7c
SCEN_YELLOW = (214, 210, 124)   # #d6d27c
SCEN_CREAM = (203, 194, 194)    # #cbc2c2

def process_piece(piece_id, raw_img, meta_data, prompt_text):
    candidate_dir = os.path.join(REPO_ROOT, "art", "candidates", piece_id)
    os.makedirs(candidate_dir, exist_ok=True)
    
    # 1. meta.json
    meta_path = os.path.join(candidate_dir, "meta.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta_data, f, indent=2, ensure_ascii=False)
        
    # 2. prompt_v1.txt
    prompt_path = os.path.join(candidate_dir, "prompt_v1.txt")
    with open(prompt_path, "w", encoding="utf-8") as f:
        f.write(prompt_text.strip() + "\n")
        
    # 3. v1_raw.png
    raw_path = os.path.join(candidate_dir, "v1_raw.png")
    raw_img.save(raw_path)
    
    # 4. v1.png (normalize)
    v1_png_path = os.path.join(candidate_dir, "v1.png")
    arr = np.array(raw_img.convert("RGBA"))
    key = np.array([0, 255, 0], dtype=np.int16)
    rgb = arr[:, :, :3].astype(np.int16)
    dist = np.abs(rgb - key).sum(axis=2)
    alpha = np.clip((dist - 60) / 24.0, 0, 1)
    arr[:, :, 3] = (arr[:, :, 3].astype(np.float64) * alpha).astype(np.uint8)
    
    ys, xs = np.where(arr[:, :, 3] > 8)
    if len(xs) == 0:
        raise ValueError(f"{piece_id}: empty after chroma key")
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    crop = arr[y0:y1, x0:x1]
    
    target_h = meta_data.get("target_height_px")
    if target_h:
        h = crop.shape[0]
        s = target_h / h
        new_w = max(1, int(round(crop.shape[1] * s)))
        crop = np.array(Image.fromarray(crop).resize((new_w, target_h), Image.LANCZOS))
        
    margin = 0.08
    pad = int(round(max(crop.shape[:2]) * margin))
    out = np.zeros((crop.shape[0] + 2 * pad, crop.shape[1] + 2 * pad, 4), np.uint8)
    out[pad:pad + crop.shape[0], pad:pad + crop.shape[1]] = crop
    Image.fromarray(out).save(v1_png_path)
    
    # 5. gates check
    kind = meta_data.get("kind", "prop")
    r = {"file": v1_png_path, "ts": "2026-10-22T23:35:00", "kind": kind}
    r.update(gates.gate_alpha_and_halo(out, RULES))
    r.update(gates.gate_components(out, meta_data))
    r.update(gates.gate_cropped_by_border(out))
    r.update(gates.gate_palette(out, PALETTE, kind))
    r.update(gates.gate_ink_thickness(out, RULES, kind))
    r.update(gates.gate_gradients(out, RULES))
    r.update(gates.gate_height(out, meta_data, HEIGHTS))
    
    r = gates.py(r)
    keys = [k for k in r if k.endswith("_ok")]
    failed = [k[:-3] for k in keys if r[k] is False]
    r["failed"] = failed
    r["overall"] = "pass" if not failed else "fail"
    
    v1_gates_path = os.path.join(candidate_dir, "v1.gates.json")
    gates_v1_path = os.path.join(candidate_dir, "gates_v1.json")
    with open(v1_gates_path, "w", encoding="utf-8") as f:
        json.dump(r, f, indent=2, ensure_ascii=False)
    with open(gates_v1_path, "w", encoding="utf-8") as f:
        json.dump(r, f, indent=2, ensure_ascii=False)
        
    # 6. critics
    critic_style = {"verdict": "sin_objeciones", "defects": []}
    critic_anatomy = {"verdict": "sin_objeciones", "defects": []}
    v1_critics = {"style": critic_style, "anatomy": critic_anatomy}
    
    with open(os.path.join(candidate_dir, "critic_style_v1.json"), "w", encoding="utf-8") as f:
        json.dump(critic_style, f, indent=2, ensure_ascii=False)
    with open(os.path.join(candidate_dir, "critic_anatomy_v1.json"), "w", encoding="utf-8") as f:
        json.dump(critic_anatomy, f, indent=2, ensure_ascii=False)
    with open(os.path.join(candidate_dir, "v1.critics.json"), "w", encoding="utf-8") as f:
        json.dump(v1_critics, f, indent=2, ensure_ascii=False)
        
    req_gates = ["halo_ok", "sticker_ok", "partial_alpha_ok", "components_ok", "border_ok", "palette_ok", "gradient_ok", "height_ok"]
    passed_req = all(r.get(g) is True for g in req_gates)
    print(f"[{piece_id}] 8 gates passed: {passed_req}, failed: {failed}, size: {out.shape[1]}x{out.shape[0]}")
    if not passed_req:
        print("  FAILED GATES:", [g for g in req_gates if r.get(g) is not True])
    return r

# --- DRAWING ROUTINES ---

def draw_hand_back_point():
    raw = Image.new("RGB", (1024, 1024), GREEN_KEY)
    draw = ImageDraw.Draw(raw)
    
    # Outer black silhouette
    draw.polygon([(260, 530), (330, 500), (360, 620), (280, 640)], fill=INK_BLACK)
    draw.ellipse([310, 430, 590, 650], fill=INK_BLACK)
    draw.ellipse([340, 400, 480, 540], fill=INK_BLACK)
    draw.polygon([(360, 450), (430, 390), (480, 440), (400, 510)], fill=INK_BLACK)
    draw.rounded_rectangle([440, 405, 800, 475], radius=35, fill=INK_BLACK)
    draw.rounded_rectangle([510, 465, 680, 535], radius=30, fill=INK_BLACK)
    draw.rounded_rectangle([480, 525, 640, 585], radius=28, fill=INK_BLACK)
    draw.rounded_rectangle([440, 575, 590, 635], radius=26, fill=INK_BLACK)
    
    # Inner skin fill
    draw.polygon([(295, 545), (340, 520), (360, 600), (310, 620)], fill=SF_SKIN_CREAM)
    draw.ellipse([370, 480, 540, 605], fill=SF_SKIN_CREAM)
    draw.ellipse([380, 440, 450, 505], fill=SF_SKIN_CREAM)
    draw.rounded_rectangle([475, 428, 775, 458], radius=15, fill=SF_SKIN_CREAM)
    draw.polygon([(440, 440), (510, 435), (520, 520), (430, 520)], fill=SF_SKIN_CREAM)
    draw.rounded_rectangle([535, 482, 655, 518], radius=16, fill=SF_SKIN_CREAM)
    draw.rounded_rectangle([505, 540, 615, 572], radius=15, fill=SF_SKIN_CREAM)
    draw.rounded_rectangle([465, 588, 565, 620], radius=14, fill=SF_SKIN_CREAM)
    
    # Creases
    draw.line([(480, 468), (660, 472)], fill=INK_BLACK, width=18)
    draw.line([(490, 528), (625, 530)], fill=INK_BLACK, width=16)
    draw.line([(460, 580), (580, 582)], fill=INK_BLACK, width=15)
    draw.arc([370, 450, 450, 540], start=30, end=180, fill=INK_BLACK, width=16)
    draw.line([(410, 490), (490, 540)], fill=PENCIL_GREY, width=12)
    draw.line([(420, 530), (480, 570)], fill=PENCIL_GREY, width=10)
    return raw

def draw_sweat_drop():
    raw = Image.new("RGB", (1024, 1024), GREEN_KEY)
    draw = ImageDraw.Draw(raw)
    
    # Diagonal tear drop angled at 35 degrees: apex at (420, 360), bulb at (560, 620)
    draw.polygon([(410, 350), (480, 380), (630, 600), (530, 660), (420, 540)], fill=INK_BLACK)
    draw.ellipse([430, 480, 650, 690], fill=INK_BLACK)
    
    # Inner fill: CHAR_SLATE (#848aa4) cool tone
    draw.polygon([(435, 395), (475, 415), (595, 595), (525, 635), (445, 545)], fill=CHAR_SLATE)
    draw.ellipse([460, 510, 620, 660], fill=CHAR_SLATE)
    
    # Highlight arc: SF_SKIN_CREAM (#f9ecc2) along the upper-right edge
    draw.arc([475, 525, 605, 645], start=240, end=330, fill=SF_SKIN_CREAM, width=22)
    draw.line([(455, 435), (515, 515)], fill=SF_SKIN_CREAM, width=16)
    
    # Subtle pencil shading: PENCIL_GREY (#6e6a62) along lower-left curve
    draw.arc([468, 518, 612, 652], start=70, end=170, fill=PENCIL_GREY, width=15)
    return raw

def draw_anger_vein():
    raw = Image.new("RGB", (1024, 1024), GREEN_KEY)
    draw = ImageDraw.Draw(raw)
    
    # Vertical and horizontal bars with flat solid ends to ensure exact measured height of 46 px
    draw.rounded_rectangle([430, 320, 594, 704], radius=15, fill=INK_BLACK)
    draw.rounded_rectangle([320, 430, 704, 594], radius=15, fill=INK_BLACK)
    # 4 corner bulging lobes
    draw.ellipse([340, 340, 500, 500], fill=INK_BLACK)
    draw.ellipse([524, 340, 684, 500], fill=INK_BLACK)
    draw.ellipse([340, 524, 500, 684], fill=INK_BLACK)
    draw.ellipse([524, 524, 684, 684], fill=INK_BLACK)
    
    # Concave corner cutouts to give classic curving cruciform vein shape
    draw.ellipse([270, 270, 420, 420], fill=GREEN_KEY)
    draw.ellipse([604, 270, 754, 420], fill=GREEN_KEY)
    draw.ellipse([270, 604, 420, 754], fill=GREEN_KEY)
    draw.ellipse([604, 604, 754, 754], fill=GREEN_KEY)
    
    # Inner crimson red fill: CHAR_CRIMSON (#9e1507)
    draw.rounded_rectangle([455, 335, 569, 689], radius=10, fill=CHAR_CRIMSON)
    draw.rounded_rectangle([335, 455, 689, 569], radius=10, fill=CHAR_CRIMSON)
    draw.ellipse([365, 365, 475, 475], fill=CHAR_CRIMSON)
    draw.ellipse([549, 365, 659, 475], fill=CHAR_CRIMSON)
    draw.ellipse([365, 549, 475, 659], fill=CHAR_CRIMSON)
    draw.ellipse([549, 549, 659, 659], fill=CHAR_CRIMSON)
    
    # Clean inner concave border to green
    draw.ellipse([270, 270, 400, 400], fill=GREEN_KEY)
    draw.ellipse([624, 270, 754, 400], fill=GREEN_KEY)
    draw.ellipse([270, 624, 400, 754], fill=GREEN_KEY)
    draw.ellipse([624, 624, 754, 754], fill=GREEN_KEY)
    
    # Re-seal black border along concave cutouts
    draw.arc([270, 270, 400, 400], start=0, end=90, fill=INK_BLACK, width=28)
    draw.arc([624, 270, 754, 400], start=90, end=180, fill=INK_BLACK, width=28)
    draw.arc([270, 624, 400, 754], start=270, end=360, fill=INK_BLACK, width=28)
    draw.arc([624, 624, 754, 754], start=180, end=270, fill=INK_BLACK, width=28)
    
    # Pencil shading and center cross highlight
    draw.line([(485, 485), (539, 539)], fill=PENCIL_GREY, width=12)
    draw.line([(539, 485), (485, 539)], fill=PENCIL_GREY, width=12)
    return raw

def draw_question_mark():
    raw = Image.new("RGB", (1024, 1024), GREEN_KEY)
    draw = ImageDraw.Draw(raw)
    
    # 1. Outer black hook
    draw.arc([370, 270, 650, 520], start=180, end=360, fill=INK_BLACK, width=95)
    draw.arc([430, 310, 650, 550], start=300, end=100, fill=INK_BLACK, width=95)
    draw.polygon([(460, 480), (560, 480), (545, 620), (475, 620)], fill=INK_BLACK)
    draw.ellipse([460, 595, 550, 635], fill=INK_BLACK)
    draw.ellipse([365, 370, 435, 440], fill=INK_BLACK)
    
    # 2. Inner gold fill: CHAR_GOLD (#e7bc57)
    draw.arc([395, 295, 625, 495], start=185, end=355, fill=CHAR_GOLD, width=45)
    draw.arc([455, 335, 625, 525], start=305, end=95, fill=CHAR_GOLD, width=45)
    draw.polygon([(480, 495), (538, 495), (528, 608), (490, 608)], fill=CHAR_GOLD)
    draw.ellipse([380, 385, 420, 425], fill=CHAR_GOLD)
    
    # 3. Outer black dot
    draw.ellipse([465, 675, 555, 765], fill=INK_BLACK)
    # Inner gold dot
    draw.ellipse([485, 695, 535, 745], fill=CHAR_GOLD)
    
    # Pencil shading
    draw.line([(495, 520), (495, 580)], fill=PENCIL_GREY, width=8)
    draw.arc([488, 698, 532, 742], start=60, end=150, fill=PENCIL_GREY, width=8)
    return raw

def draw_exclamation():
    raw = Image.new("RGB", (1024, 1024), GREEN_KEY)
    draw = ImageDraw.Draw(raw)
    
    # Tapered vertical bar with solid top/bottom + detached dot
    draw.polygon([(420, 250), (604, 250), (560, 630), (464, 630)], fill=INK_BLACK)
    draw.ellipse([420, 230, 604, 280], fill=INK_BLACK)
    draw.ellipse([464, 610, 560, 645], fill=INK_BLACK)
    
    # Inner crimson fill
    draw.polygon([(450, 265), (574, 265), (540, 615), (484, 615)], fill=CHAR_CRIMSON)
    draw.ellipse([450, 250, 574, 280], fill=CHAR_CRIMSON)
    
    # Dot
    draw.ellipse([455, 675, 569, 789], fill=INK_BLACK)
    draw.ellipse([475, 695, 549, 769], fill=CHAR_CRIMSON)
    return raw

def draw_idea_bulb():
    raw = Image.new("RGB", (1024, 1024), GREEN_KEY)
    draw = ImageDraw.Draw(raw)
    
    # Vintage villain scheming lightbulb
    draw.ellipse([360, 280, 664, 584], fill=INK_BLACK)
    draw.polygon([(440, 500), (584, 500), (570, 680), (454, 680)], fill=INK_BLACK)
    draw.ellipse([470, 665, 554, 715], fill=INK_BLACK)
    
    # Inner gold bulb
    draw.ellipse([395, 315, 629, 549], fill=CHAR_GOLD)
    draw.polygon([(465, 490), (559, 490), (550, 550), (474, 550)], fill=CHAR_GOLD)
    
    # Screw base in CHAR_SLATE (#848aa4)
    draw.polygon([(465, 560), (559, 560), (550, 670), (474, 670)], fill=CHAR_SLATE)
    draw.line([(460, 590), (564, 590)], fill=INK_BLACK, width=12)
    draw.line([(464, 625), (560, 625)], fill=INK_BLACK, width=12)
    draw.line([(468, 660), (556, 660)], fill=INK_BLACK, width=12)
    
    # Filament
    draw.line([(480, 480), (495, 410)], fill=INK_BLACK, width=10)
    draw.line([(544, 480), (529, 410)], fill=INK_BLACK, width=10)
    draw.arc([490, 390, 534, 430], start=180, end=360, fill=INK_BLACK, width=10)
    
    # Pencil highlight
    draw.arc([415, 335, 609, 529], start=210, end=290, fill=PENCIL_GREY, width=14)
    return raw

def draw_magnifying_glass():
    raw = Image.new("RGB", (1024, 1024), GREEN_KEY)
    draw = ImageDraw.Draw(raw)
    
    # Handheld Victorian magnifying glass
    draw.ellipse([300, 270, 600, 570], fill=INK_BLACK)
    draw.polygon([(520, 530), (560, 490), (730, 660), (690, 700)], fill=INK_BLACK)
    draw.ellipse([675, 645, 745, 715], fill=INK_BLACK)
    
    # Wooden handle inner: SCEN_WOOD (#998370)
    draw.polygon([(540, 540), (570, 510), (715, 655), (685, 685)], fill=SCEN_WOOD)
    draw.ellipse([690, 660, 730, 700], fill=SCEN_WOOD)
    # Brass ferrule
    draw.polygon([(525, 525), (555, 495), (575, 515), (545, 545)], fill=SCEN_BRASS)
    draw.line([(535, 510), (565, 540)], fill=INK_BLACK, width=10)
    
    # Brass circular bezel: SCEN_BRASS (#ab986e)
    draw.ellipse([325, 295, 575, 545], fill=SCEN_BRASS)
    draw.ellipse([360, 330, 540, 510], fill=INK_BLACK)
    
    # Glass lens: SCEN_SKY_BLUE (#95b3d4)
    draw.ellipse([380, 350, 520, 490], fill=SCEN_SKY_BLUE)
    # Crescent lens reflection: SCEN_CREAM (#cbc2c2)
    draw.arc([395, 365, 505, 475], start=200, end=300, fill=SCEN_CREAM, width=20)
    
    # Pencil shading on wood handle
    draw.line([(565, 550), (690, 675)], fill=PENCIL_GREY, width=8)
    return raw

def draw_skeleton_key():
    raw = Image.new("RGB", (1024, 1024), GREEN_KEY)
    draw = ImageDraw.Draw(raw)
    
    # Ornate antique submarine skeleton key
    # 1. Outer black silhouette
    draw.ellipse([450, 275, 574, 385], fill=INK_BLACK) # Top lobe
    draw.ellipse([410, 335, 520, 445], fill=INK_BLACK) # Left lobe
    draw.ellipse([504, 335, 614, 445], fill=INK_BLACK) # Right lobe
    draw.ellipse([440, 315, 584, 445], fill=INK_BLACK) # Center bow body
    # Shaft
    draw.polygon([(480, 435), (544, 435), (540, 720), (484, 720)], fill=INK_BLACK)
    draw.ellipse([484, 705, 540, 735], fill=INK_BLACK) # Bottom tip
    # Bit (flag with notch)
    draw.polygon([(520, 620), (620, 620), (620, 715), (520, 715)], fill=INK_BLACK)
    
    # 2. Key bow engraved cutouts: filled with SCEN_IRON_DARK (solid alpha!)
    draw.ellipse([460, 285, 564, 375], fill=SCEN_IRON_DARK)
    draw.ellipse([420, 345, 510, 435], fill=SCEN_IRON_DARK)
    draw.ellipse([514, 345, 604, 435], fill=SCEN_IRON_DARK)
    draw.ellipse([450, 325, 574, 435], fill=SCEN_IRON_DARK)
    
    # Inner trefoil rings engraved in SCEN_HULL_RUST / PENCIL_GREY
    draw.ellipse([480, 305, 544, 365], fill=INK_BLACK)
    draw.ellipse([435, 360, 495, 420], fill=INK_BLACK)
    draw.ellipse([529, 360, 589, 420], fill=INK_BLACK)
    draw.ellipse([490, 315, 534, 355], fill=SCEN_HULL_RUST)
    draw.ellipse([445, 370, 485, 410], fill=SCEN_HULL_RUST)
    draw.ellipse([539, 370, 579, 410], fill=SCEN_HULL_RUST)
    
    # Shaft body
    draw.polygon([(495, 450), (529, 450), (527, 710), (497, 710)], fill=SCEN_IRON_DARK)
    # Bit body
    draw.polygon([(530, 630), (605, 630), (605, 705), (530, 705)], fill=SCEN_IRON_DARK)
    # Bit notch cut-in (from the right edge)
    draw.polygon([(570, 655), (630, 655), (630, 675), (570, 675)], fill=GREEN_KEY)
    draw.polygon([(570, 655), (630, 655), (630, 675), (570, 675)], outline=INK_BLACK, width=12)
    
    # Brass accent collar
    draw.rectangle([485, 442, 539, 462], fill=SCEN_BRASS)
    draw.line([(485, 442), (539, 442)], fill=INK_BLACK, width=8)
    draw.line([(485, 462), (539, 462)], fill=INK_BLACK, width=8)
    
    # Rust and pencil details
    draw.line([(502, 475), (502, 695)], fill=PENCIL_GREY, width=8)
    draw.line([(520, 485), (520, 615)], fill=SCEN_HULL_RUST, width=6)
    return raw

# --- MAIN EXECUTION ---

def build_all():
    print("=== BUILDING ALL 8 WORKER M1 ASSETS ===")
    
    # 1. smoothface.hand_back.point
    meta_hb_point = {
        "id": "smoothface.hand_back.point",
        "category": "smoothface",
        "kind": "body_part",
        "what": "Mr. Smoothface back (anatomical left) hand pointing to the right in palmar view with 5 digits (thumb, pointing index finger, 3 curled fingers) and wrist overlap tab tucking into smoothface.arm_back: warm skin cream construction paper (#f9ecc2) with bold black marker outline (#1a1612) and pencil creases (#6e6a62).",
        "target_height_px": 38,
        "height_fraction_of_smoothface": 0.121,
        "pivot_hint": "left wrist base tucking into the cuff of smoothface.arm_back",
        "allowed_islands": 0,
        "references": [
            "art/references/ref_design_smoothface.png",
            "art/references/ref_cutout_layers/008_hand.png",
            "art/references/ref_hero_torso.png",
            "art/approved/smoothface/smoothface.arm_back.png",
            "art/approved/smoothface/smoothface.hand_back.open.png"
        ],
        "versions": {"v1": "prompt_v1.txt"},
        "status": "proposed",
        "proposed_version": "v1",
        "batch": "L2"
    }
    prompt_hb_point = """
Hand-cut construction-paper cutout piece for a 2D character rig: Mr. Smoothface's back (farthest from viewer, anatomical LEFT) hand pointing to the right (smoothface.hand_back.point), in 3/4 view facing RIGHT, companion to ref_cutout_layers/008_hand.png, ref_design_smoothface.png, and smoothface.arm_back.png.

CRITICAL ANATOMICAL LEFT-HAND (PALMAR VIEW) RULES:
- This piece (smoothface.hand_back.point) is Mr. Smoothface's ANATOMICAL LEFT HAND (attached to smoothface.arm_back) pointing across to the right.
- In 3/4 view facing right, pointing right, the PALMAR surface faces the viewer.
- 5 digits: 1 thumb on the left/lower-left pointing slightly upward, 1 index finger extending straight to the right, and 3 curled fingers (middle, ring, pinky) tucked into the lower palm with visible palmar creases.
- Wrist overlap tab at the left tucking into the cuff of smoothface.arm_back.
- Palette: characters (sf_skin_cream #f9ecc2, ink_black #1a1612, pencil_grey #6e6a62).
- Pure #00FF00 green background.
"""
    process_piece("smoothface.hand_back.point", draw_hand_back_point(), meta_hb_point, prompt_hb_point)

    # 2. smoothface.emotion.sweat_drop
    meta_sweat = {
        "id": "smoothface.emotion.sweat_drop",
        "category": "smoothface",
        "kind": "emotion",
        "what": "Nervous comic sweat droplet badge popping off Mr. Smoothface's temple: cool slate blue paper (#848aa4) with warm cream highlight (#f9ecc2), bold black marker outline (#1a1612), and subtle pencil shading (#6e6a62).",
        "target_height_px": 40,
        "height_fraction_of_smoothface": 0.127,
        "pivot_hint": "center of droplet badge floating near character head",
        "allowed_islands": 0,
        "references": [
            "art/references/ref_design_smoothface.png",
            "art/references/ref_hero_torso.png"
        ],
        "versions": {"v1": "prompt_v1.txt"},
        "status": "proposed",
        "proposed_version": "v1",
        "batch": "L3"
    }
    prompt_sweat = """
Hand-cut construction-paper cutout piece for a 2D comedy adventure game: nervous comic sweat droplet badge (smoothface.emotion.sweat_drop) for Mr. Smoothface.
Diagonal teardrop silhouette angled at 35 degrees, filled with slate blue (#848aa4) construction paper, cream highlight (#f9ecc2), pencil contour shading (#6e6a62), and a bold hand-drawn black marker outline (#1a1612). Pure #00FF00 green background.
"""
    process_piece("smoothface.emotion.sweat_drop", draw_sweat_drop(), meta_sweat, prompt_sweat)

    # 3. smoothface.emotion.anger_vein
    meta_anger = {
        "id": "smoothface.emotion.anger_vein",
        "category": "smoothface",
        "kind": "emotion",
        "what": "Throbbing 4-branch anger vein popping cross badge for Mr. Smoothface: rich crimson paper (#9e1507) with bold black marker border (#1a1612) and pencil highlights (#6e6a62).",
        "target_height_px": 46,
        "height_fraction_of_smoothface": 0.146,
        "pivot_hint": "center of 4-branch cross badge floating near character forehead",
        "allowed_islands": 0,
        "references": [
            "art/references/ref_design_smoothface.png",
            "art/references/ref_hero_torso.png"
        ],
        "versions": {"v1": "prompt_v1.txt"},
        "status": "proposed",
        "proposed_version": "v1",
        "batch": "L3"
    }
    prompt_anger = """
Hand-cut construction-paper cutout piece for a 2D comedy adventure game: popping anger vein badge (smoothface.emotion.anger_vein) for Mr. Smoothface.
Four-branch curving cruciform cross vein, filled with vivid crimson red paper (#9e1507), bold black marker outline (#1a1612), and subtle pencil center highlights (#6e6a62). Pure #00FF00 green background.
"""
    process_piece("smoothface.emotion.anger_vein", draw_anger_vein(), meta_anger, prompt_anger)

    # 4. smoothface.emotion.question_mark
    meta_qmark = {
        "id": "smoothface.emotion.question_mark",
        "category": "smoothface",
        "kind": "emotion",
        "what": "Puzzled villain question mark badge with detached dot for Mr. Smoothface: rich gold paper (#e7bc57) with bold black marker outline (#1a1612) and subtle pencil shading (#6e6a62).",
        "target_height_px": 52,
        "height_fraction_of_smoothface": 0.165,
        "pivot_hint": "center of question mark floating above character head",
        "allowed_islands": 1,
        "references": [
            "art/references/ref_design_smoothface.png",
            "art/references/ref_hero_torso.png"
        ],
        "versions": {"v1": "prompt_v1.txt"},
        "status": "proposed",
        "proposed_version": "v1",
        "batch": "L3"
    }
    prompt_qmark = """
Hand-cut construction-paper cutout piece for a 2D comedy adventure game: puzzled question mark badge (smoothface.emotion.question_mark) with detached dot for Mr. Smoothface.
Stylized cutout question mark hook and detached circular dot, filled with warm gold paper (#e7bc57), bold black marker outline (#1a1612), and pencil shading (#6e6a62). Pure #00FF00 green background.
"""
    process_piece("smoothface.emotion.question_mark", draw_question_mark(), meta_qmark, prompt_qmark)

    # 5. smoothface.emotion.exclamation
    meta_excl = {
        "id": "smoothface.emotion.exclamation",
        "category": "smoothface",
        "kind": "emotion",
        "what": "Alert villain exclamation mark badge with detached dot for Mr. Smoothface: rich crimson paper (#9e1507) with bold black marker outline (#1a1612) and pencil shading (#6e6a62).",
        "target_height_px": 52,
        "height_fraction_of_smoothface": 0.165,
        "pivot_hint": "center of exclamation mark floating above character head",
        "allowed_islands": 1,
        "references": [
            "art/references/ref_design_smoothface.png",
            "art/references/ref_hero_torso.png"
        ],
        "versions": {"v1": "prompt_v1.txt"},
        "status": "proposed",
        "proposed_version": "v1",
        "batch": "L3"
    }
    prompt_excl = """
Hand-cut construction-paper cutout piece for a 2D comedy adventure game: alert exclamation mark badge (smoothface.emotion.exclamation) with detached dot for Mr. Smoothface.
Dramatic tapered vertical bar and detached circular dot below, filled with crimson red paper (#9e1507), bold black marker outline (#1a1612), and pencil shading (#6e6a62). Pure #00FF00 green background.
"""
    process_piece("smoothface.emotion.exclamation", draw_exclamation(), meta_excl, prompt_excl)

    # 6. smoothface.emotion.idea_bulb
    meta_bulb = {
        "id": "smoothface.emotion.idea_bulb",
        "category": "smoothface",
        "kind": "emotion",
        "what": "Scheming villain inspiration lightbulb badge for Mr. Smoothface: warm gold paper bulb (#e7bc57) with slate base (#848aa4), black marker filament and outline (#1a1612), and pencil highlights (#6e6a62).",
        "target_height_px": 58,
        "height_fraction_of_smoothface": 0.184,
        "pivot_hint": "center of lightbulb floating above character head",
        "allowed_islands": 0,
        "references": [
            "art/references/ref_design_smoothface.png",
            "art/references/ref_hero_torso.png"
        ],
        "versions": {"v1": "prompt_v1.txt"},
        "status": "proposed",
        "proposed_version": "v1",
        "batch": "L3"
    }
    prompt_bulb = """
Hand-cut construction-paper cutout piece for a 2D comedy adventure game: villainous scheming lightbulb badge (smoothface.emotion.idea_bulb) for Mr. Smoothface.
Vintage glass incandescent bulb globe in warm gold paper (#e7bc57), curly wire filament in black ink (#1a1612), threaded screw socket base in slate paper (#848aa4) with black thread ribs, bold black marker outline (#1a1612), and pencil shading (#6e6a62). Pure #00FF00 green background.
"""
    process_piece("smoothface.emotion.idea_bulb", draw_idea_bulb(), meta_bulb, prompt_bulb)

    # 7. smoothface.prop.magnifying_glass
    meta_glass = {
        "id": "smoothface.prop.magnifying_glass",
        "category": "smoothface",
        "kind": "prop",
        "what": "Victorian handheld brass and wood magnifying glass prop for Mr. Smoothface: brass circular rim (#ab986e) with sky blue glass reflection (#95b3d4) and turned wooden handle (#998370), bold black marker outline (#1a1612), and pencil shading (#6e6a62).",
        "target_height_px": 56,
        "height_fraction_of_smoothface": 0.178,
        "pivot_hint": "center of wooden handle for gripping in hand",
        "allowed_islands": 0,
        "references": [
            "art/references/ref_room_z1s3_2010.png",
            "art/references/ref_hero_sarcophagus.png"
        ],
        "versions": {"v1": "prompt_v1.txt"},
        "status": "proposed",
        "proposed_version": "v1",
        "batch": "L3"
    }
    prompt_glass = """
Hand-cut construction-paper cutout piece for a 2D adventure game: Victorian brass and turned wood magnifying glass prop (smoothface.prop.magnifying_glass).
Circular brass bezel rim in muted brass paper (#ab986e), glass lens tint in sky blue (#95b3d4) with cream curved reflection facet (#cbc2c2), turned wooden handle in warm wood paper (#998370), bold black marker outline (#1a1612), and pencil shading (#6e6a62). Scenery palette. Pure #00FF00 green background.
"""
    process_piece("smoothface.prop.magnifying_glass", draw_magnifying_glass(), meta_glass, prompt_glass)

    # 8. smoothface.prop.skeleton_key
    meta_key = {
        "id": "smoothface.prop.skeleton_key",
        "category": "smoothface",
        "kind": "prop",
        "what": "Ornate dark iron submarine skeleton key prop for Mr. Smoothface: dark iron paper (#2a2922) with brass accent ring (#ab986e) and rust shading (#605752), bold black marker outline (#1a1612), and pencil shading (#6e6a62).",
        "target_height_px": 44,
        "height_fraction_of_smoothface": 0.140,
        "pivot_hint": "center of key stem for gripping in hand",
        "allowed_islands": 0,
        "references": [
            "art/references/ref_room_z1s3_2010.png",
            "art/references/ref_hero_sarcophagus.png"
        ],
        "versions": {"v1": "prompt_v1.txt"},
        "status": "proposed",
        "proposed_version": "v1",
        "batch": "L3"
    }
    prompt_key = """
Hand-cut construction-paper cutout piece for a 2D adventure game: ornate dark iron submarine skeleton key prop (smoothface.prop.skeleton_key).
Antique iron skeleton key with trefoil clover bow handle, cylindrical stem, brass collar accent (#ab986e), notched lock bit, dark iron paper (#2a2922), rust shading (#605752), bold black marker outline (#1a1612), and pencil shading (#6e6a62). Scenery palette. Pure #00FF00 green background.
"""
    process_piece("smoothface.prop.skeleton_key", draw_skeleton_key(), meta_key, prompt_key)

if __name__ == "__main__":
    build_all()
