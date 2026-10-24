import os
import stat
import json
import shutil
from PIL import Image, ImageFilter

ROOT = r"C:\AntiGravityStuff\Moonstorm2"

def unlock(path):
    if os.path.exists(path):
        os.chmod(path, stat.S_IWRITE | stat.S_IREAD)

# 1. Calibrated boxes matching CutoutRigRenderer.ts and review_sheet.html
RIG_CONFIGS = {
    "nihongo": {
        "name": "Nihongo Nohondes",
        "height_px": 300,
        "canvas": {"w": 380, "h": 400},
        "portrait_crop": (110, 26, 270, 186),
        "boxes": {
            "leg_back": (140, 240, 56, 96, 11),
            "shoe_front": (172, 312, 74, 48, 12),
            "leg_front": (172, 242, 56, 98, 13),
            "arm_back": (200, 124, 84, 108, 18),
            "torso": (132, 102, 112, 186, 20),
            "head": (146, 36, 83, 124, 30),
            "eyes.normal": (170, 88, 44, 18, 32),
            "eyes.closed": (170, 88, 42, 20, 32),
            "eyes.squint": (170, 88, 44, 17, 32),
            "brows.normal": (168, 76, 48, 15, 33),
            "brows.angry": (168, 74, 46, 18, 33),
            "headband": (118, 52, 116, 44, 35),
            "prop.broom_katana": (148, 126, 68, 228, 38),
            "hand_front.fist": (164, 194, 36, 36, 40),
            "hand_front.open": (162, 190, 40, 42, 40),
            "arm_front": (106, 122, 101, 112, 41),
        }
    },
    "ababy": {
        "name": "A Baby",
        "height_px": 270,
        "canvas": {"w": 360, "h": 350},
        "portrait_crop": (110, 30, 270, 190),
        "boxes": {
            "arm_back": (202, 132, 84, 168, 12),
            "legs_diaper": (122, 198, 101, 112, 15),
            "torso": (96, 100, 157, 154, 20),
            "bonnet": (148, 36, 78, 72, 28),
            "head": (148, 48, 93, 112, 30),
            "eyes.normal": (178, 76, 44, 27, 32),
            "eyes.angry": (178, 76, 46, 25, 32),
            "arm_front": (82, 132, 78, 172, 40),
        }
    },
    "ventriloquist": {
        "name": "The Ventriloquist & Rapoleon",
        "height_px": 340,
        "canvas": {"w": 360, "h": 410},
        "portrait_crop": (105, 12, 305, 212),
        "boxes": {
            "shoes": (126, 332, 104, 46, 11),
            "legs": (118, 206, 78, 146, 14),
            "arm_back": (174, 118, 48, 114, 16),
            "torso": (112, 92, 95, 156, 20),
            "head_jaw": (132, 18, 65, 126, 30),
            "eyes.normal": (152, 54, 31, 28, 32),
            "arm_front": (118, 134, 112, 75, 38),
            "dummy_rapoleon": (188, 68, 124, 144, 42),
        }
    }
}

for char_id, cfg in RIG_CONFIGS.items():
    rig_path = os.path.join(ROOT, "characters", char_id, "rig.json")
    unlock(rig_path)
    with open(rig_path, "r", encoding="utf-8") as f:
        rig = json.load(f)
    for part_key, (x, y, w, h, z) in cfg["boxes"].items():
        if part_key in rig["parts"]:
            rig["parts"][part_key]["offset"] = [x, y]
            rig["parts"][part_key]["size"] = [w, h]
            rig["parts"][part_key]["z_index"] = z
    with open(rig_path, "w", encoding="utf-8") as f:
        json.dump(rig, f, indent=2)
    print(f"Updated {rig_path}")

    # Render full rig and crop portrait.png
    cw, ch = cfg["canvas"]["w"], cfg["canvas"]["h"]
    canvas = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    # Sort default visible parts by z_index
    default_variants = set()
    for vg_name, vg in rig.get("variant_groups", {}).items():
        default_variants.add(vg["variants"][vg["default"]])
    all_variants = set()
    for vg_name, vg in rig.get("variant_groups", {}).items():
        for v_part in vg["variants"].values():
            all_variants.add(v_part)

    sorted_parts = sorted(rig["parts"].items(), key=lambda kv: kv[1]["z_index"])
    for part_key, part_info in sorted_parts:
        if part_key in all_variants and part_key not in default_variants:
            continue
        asset_path = os.path.join(ROOT, part_info["asset"])
        if not os.path.exists(asset_path):
            continue
        img = Image.open(asset_path).convert("RGBA")
        ox, oy = part_info["offset"]
        sw, sh = part_info["size"]
        if img.size != (sw, sh):
            img = img.resize((sw, sh), Image.Resampling.LANCZOS)
        # Drop shadow for non-eyes/brows
        if not (part_key.startswith("eyes") or part_key.startswith("brows")):
            alpha = img.split()[3]
            shadow = Image.new("RGBA", img.size, (15, 12, 10, 0))
            shadow.putalpha(alpha.point(lambda p: int(p * 0.35)))
            shadow = shadow.filter(ImageFilter.GaussianBlur(1.5))
            canvas.alpha_composite(shadow, (ox + 2, oy + 2))
        canvas.alpha_composite(img, (ox, oy))

    crop_box = cfg["portrait_crop"]
    portrait = canvas.crop(crop_box).resize((256, 256), Image.Resampling.LANCZOS)
    portrait_path = os.path.join(ROOT, "characters", char_id, "portrait.png")
    unlock(portrait_path)
    portrait.save(portrait_path)
    print(f"Saved portrait {portrait_path}")

# Also sync all updated art/approved files into art/candidates/<id>/v1.png
UPDATED_APPROVED = [
    ("nihongo", "nihongo.head"),
    ("nihongo", "nihongo.eyes.normal"),
    ("nihongo", "nihongo.eyes.squint"),
    ("nihongo", "nihongo.eyes.closed"),
    ("nihongo", "nihongo.brows.normal"),
    ("nihongo", "nihongo.brows.angry"),
    ("nihongo", "nihongo.torso"),
    ("nihongo", "nihongo.arm_front"),
    ("nihongo", "nihongo.arm_back"),
    ("ababy", "ababy.head"),
    ("ababy", "ababy.eyes.normal"),
    ("ababy", "ababy.eyes.angry"),
    ("ababy", "ababy.bonnet"),
    ("ababy", "ababy.torso"),
    ("ababy", "ababy.arm_front"),
    ("ababy", "ababy.arm_back"),
    ("ababy", "ababy.legs_diaper"),
    ("ventriloquist", "ventrilo.head_jaw"),
    ("ventriloquist", "ventrilo.eyes.normal"),
    ("ventriloquist", "ventrilo.torso"),
    ("ventriloquist", "ventrilo.arm_front"),
    ("z0", "z0.prop.troll"),
    ("z0", "troll.arm_back"),
    ("z0", "troll.legs_feet"),
    ("z0", "troll.torso_tunic"),
    ("z0", "troll.head_jaw"),
    ("z0", "troll.eyes"),
    ("z0", "troll.arm_front_club"),
    ("z1s1", "z1s1.prop.pedal_station_intact"),
    ("z1s1", "z1s1.prop.pedal_station_broken"),
    ("z1s1", "z1s1.prop.perpetual_machine_installed"),
    ("z1s1", "z1s1.wall.caged_lamp"),
]

for folder, piece_id in UPDATED_APPROVED:
    src = os.path.join(ROOT, "art", "approved", folder, f"{piece_id}.png")
    cand_dir = os.path.join(ROOT, "art", "candidates", piece_id)
    os.makedirs(cand_dir, exist_ok=True)
    dst = os.path.join(cand_dir, "v1.png")
    unlock(dst)
    shutil.copy2(src, dst)
    img = Image.open(src)
    meta_path = os.path.join(cand_dir, "meta.json")
    meta = {}
    if os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
    meta["piece_id"] = piece_id
    meta["status"] = "approved"
    meta["selected_variant"] = "v1.png"
    meta["size"] = [img.width, img.height]
    unlock(meta_path)
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    print(f"Synced candidate {piece_id} ({img.width}x{img.height})")
