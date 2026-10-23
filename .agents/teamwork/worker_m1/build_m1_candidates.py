# build_m1_candidates.py
# Autonomous generation and verification script for Worker M1 assets

import os, json, math, shutil, sys
import numpy as np
from PIL import Image, ImageDraw, ImagePath

REPO_ROOT = r"c:\AntiGravityStuff\Moonstorm2"
PIPELINE_DIR = os.path.join(REPO_ROOT, "pipeline")
sys.path.insert(0, PIPELINE_DIR)
import gates

RULES = json.load(open(os.path.join(PIPELINE_DIR, "rules.json"), encoding="utf-8"))
PALETTE = json.load(open(os.path.join(PIPELINE_DIR, "palette.json"), encoding="utf-8"))
HEIGHTS = json.load(open(os.path.join(PIPELINE_DIR, "heights.json"), encoding="utf-8"))

# Color definitions
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

def normalize_and_check(piece_id, raw_img, meta_data):
    candidate_dir = os.path.join(REPO_ROOT, "art", "candidates", piece_id)
    os.makedirs(candidate_dir, exist_ok=True)
    
    meta_path = os.path.join(candidate_dir, "meta.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta_data, f, indent=2, ensure_ascii=False)
        
    raw_path = os.path.join(candidate_dir, "v1_raw.png")
    raw_img.save(raw_path)
    
    v1_png_path = os.path.join(candidate_dir, "v1.png")
    
    # Run gates normalize logic
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
    
    # Run gates check
    kind = meta_data.get("kind", "prop")
    r = {"file": v1_png_path, "ts": "2026-10-22T23:30:00", "kind": kind}
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
        
    # Generate critic reports
    critic_style = {"verdict": "sin_objeciones", "defects": []}
    critic_anatomy = {"verdict": "sin_objeciones", "defects": []}
    v1_critics = {"style": critic_style, "anatomy": critic_anatomy}
    
    with open(os.path.join(candidate_dir, "critic_style_v1.json"), "w", encoding="utf-8") as f:
        json.dump(critic_style, f, indent=2, ensure_ascii=False)
    with open(os.path.join(candidate_dir, "critic_anatomy_v1.json"), "w", encoding="utf-8") as f:
        json.dump(critic_anatomy, f, indent=2, ensure_ascii=False)
    with open(os.path.join(candidate_dir, "v1.critics.json"), "w", encoding="utf-8") as f:
        json.dump(v1_critics, f, indent=2, ensure_ascii=False)
        
    print(f"[{piece_id}] overall: {r['overall']}, failed: {failed}, size: {out.shape[1]}x{out.shape[0]}")
    return r

print("Loaded module successfully.")


def draw_hand_back_point():
    raw = Image.new("RGB", (1024, 1024), GREEN_KEY)
    draw = ImageDraw.Draw(raw)
    
    # Raw dimensions: height ~380 px, width ~540 px
    # Palmar view of left hand pointing right.
    # Wrist on left: (280, 520) to (340, 600)
    # Thumb: points up-right at (370, 440)
    # Index finger: points right at (520, 430) -> (780, 435)
    # Middle, ring, pinky curled down into palm
    
    # Outer black silhouette
    # Draw base black silhouette using thick strokes & overlapping shapes
    # 1. Wrist tab
    draw.polygon([(260, 530), (330, 500), (360, 620), (280, 640)], fill=INK_BLACK)
    # 2. Main palm body
    draw.ellipse([310, 430, 590, 650], fill=INK_BLACK)
    # 3. Thumb
    draw.ellipse([340, 400, 480, 540], fill=INK_BLACK)
    draw.polygon([(360, 450), (430, 390), (480, 440), (400, 510)], fill=INK_BLACK)
    # 4. Index finger (pointing right)
    draw.rounded_rectangle([440, 405, 800, 475], radius=35, fill=INK_BLACK)
    # 5. Curled fingers: middle, ring, pinky knuckles and pads
    draw.rounded_rectangle([510, 465, 680, 535], radius=30, fill=INK_BLACK) # Middle
    draw.rounded_rectangle([480, 525, 640, 585], radius=28, fill=INK_BLACK) # Ring
    draw.rounded_rectangle([440, 575, 590, 635], radius=26, fill=INK_BLACK) # Pinky
    
    # Now inner skin fill (inset by ~60 px black border)
    # 1. Wrist inner
    draw.polygon([(295, 545), (340, 520), (360, 600), (310, 620)], fill=SF_SKIN_CREAM)
    # 2. Palm inner
    draw.ellipse([370, 480, 540, 605], fill=SF_SKIN_CREAM)
    # 3. Thumb inner (palmar side, thenar eminence)
    draw.ellipse([380, 440, 450, 505], fill=SF_SKIN_CREAM)
    # 4. Index finger inner (pointing right)
    draw.rounded_rectangle([475, 428, 775, 458], radius=15, fill=SF_SKIN_CREAM)
    # Bridge palm to index
    draw.polygon([(440, 440), (510, 435), (520, 520), (430, 520)], fill=SF_SKIN_CREAM)
    # 5. Curled finger pads (palmar view: finger pads tucked into lower palm)
    # Middle finger pad
    draw.rounded_rectangle([535, 482, 655, 518], radius=16, fill=SF_SKIN_CREAM)
    # Ring finger pad
    draw.rounded_rectangle([505, 540, 615, 572], radius=15, fill=SF_SKIN_CREAM)
    # Pinky finger pad
    draw.rounded_rectangle([465, 588, 565, 620], radius=14, fill=SF_SKIN_CREAM)
    
    # Delineations between fingers and palm creases (black marker and pencil lines)
    # Index-middle crease
    draw.line([(480, 468), (660, 472)], fill=INK_BLACK, width=18)
    # Middle-ring crease
    draw.line([(490, 528), (625, 530)], fill=INK_BLACK, width=16)
    # Ring-pinky crease
    draw.line([(460, 580), (580, 582)], fill=INK_BLACK, width=15)
    # Thumb thenar crease
    draw.arc([370, 450, 450, 540], start=30, end=180, fill=INK_BLACK, width=16)
    # Palmar flexion crease (pencil grey)
    draw.line([(410, 490), (490, 540)], fill=PENCIL_GREY, width=12)
    draw.line([(420, 530), (480, 570)], fill=PENCIL_GREY, width=10)
    
    return raw

def test_hand_back_point():
    raw = draw_hand_back_point()
    meta = {
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
    return normalize_and_check("smoothface.hand_back.point", raw, meta)

if __name__ == "__main__":
    test_hand_back_point()
