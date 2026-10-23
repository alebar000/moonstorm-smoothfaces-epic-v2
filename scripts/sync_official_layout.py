from pathlib import Path
import shutil
import os
import stat
import re
import json
from PIL import Image

root = Path(r"c:\AntiGravityStuff\Moonstorm2")
official_path = root / "src" / "scenarios" / "z1s3_official_layout.json"
official_json = json.loads(official_path.read_text(encoding="utf-8"))

# 0. Synchronize layout/z1s3.layout.json (both top-level gates.py schema AND studio_official_* schema)
layout_path = root / "layout" / "z1s3.layout.json"
if layout_path.exists():
    lay = json.loads(layout_path.read_text(encoding="utf-8"))
else:
    lay = {"room": "z1s3", "size": {"w": 2400, "h": 900}}

lay["planes"] = [
    {"id": "exterior", "parallax": 0.25},
    {"id": "wall", "parallax": 0.85},
    {"id": "wall_props", "parallax": 0.85},
    {"id": "floor", "parallax": 1.0, "y_sort": True},
    {"id": "foreground", "parallax": 1.14},
    {"id": "ribs", "parallax": 1.2},
]
lay["foot_baseline_y"] = 812

sf_char = official_json["characters"]["smoothface"]
cd_char = official_json["characters"]["cap_dread"]
lay["characters"] = [
    {
        "id": "smoothface",
        "rig": "characters/smoothface/rig.json",
        "plane": "floor",
        "x": sf_char["x"],
        "y": sf_char["y"],
        "height_px": 315,
        "facing": sf_char["facing"],
    },
    {
        "id": "capdread",
        "rig": "characters/capdread/rig.json",
        "plane": "floor",
        "x": cd_char["x"],
        "y": cd_char["y"],
        "height_px": 330,
        "facing": cd_char["facing"],
    },
]
lay["spawns"] = {
    "start": [sf_char["x"], sf_char["y"]],
    "from_z1s2": [615, 775],
}

# Build top-level objects array for gates.py layout with exact synchronized top-left coordinates & scales
interact_map = {
    "z1s3.wall.door": {"inspect": "dlg.z1s3.door.inspect", "use": "exit.to_z1s2"},
    "z1s3.prop.sarcophagus": {"inspect": "dlg.z1s3.sarcophagus.inspect", "talk": "dlg.z1s3.sarcophagus.talk"},
    "z1s3.prop.desk": {"inspect": "dlg.z1s3.desk.inspect"},
    "z1s3.prop.glue": {"inspect": "dlg.z1s3.glue.inspect", "grab": "item.glue"},
    "z1s3.prop.easel_portrait": {"inspect": "dlg.z1s3.portrait.inspect", "use": "puzzle.portrait"},
    "z1s3.prop.hammer_bag": {"inspect": "dlg.z1s3.hammers.inspect", "grab": "item.hammers"},
    "z1s3.prop.bed": {"inspect": "dlg.z1s3.bed.inspect"},
}

synced_top_objects = []
for obj in official_json.get("objects", []):
    img_key = obj["imageKey"]
    asset_rel = f"art/approved/z1s3/{img_key}.png"
    pf = obj.get("parallaxFactor", 1.0)
    if obj.get("inSituSeamless") and "hull_rib" in img_key:
        plane = "ribs"
    elif pf < 0.9:
        plane = "wall" if obj.get("inSituSeamless") else "wall_props"
    elif pf > 1.05:
        plane = "foreground"
    else:
        plane = "floor"

    img_file = root / asset_rel
    scale_val = 1.0
    if img_file.exists():
        nw, _ = Image.open(img_file).size
        if nw > 0:
            scale_val = round(obj["w"] / nw, 4)

    entry = {
        "id": obj["id"],
        "asset": asset_rel,
        "plane": plane,
        "x": obj["x"],
        "y": 555 if obj["id"] == "z1s3.prop.desk" else obj["y"],
        "w": obj["w"],
        "h": obj["h"],
        "scale": scale_val,
        "anchor": "top-left",
        "sort_y": obj.get("sortY", 550),
        "state": "visible",
    }
    if obj["id"] in interact_map:
        entry["interact"] = interact_map[obj["id"]]
    synced_top_objects.append(entry)

synced_top_objects.append({
    "id": "char.smoothface",
    "asset": "characters/smoothface/composite_preview.png",
    "rig": "characters/smoothface/rig.json",
    "plane": "floor",
    "x": sf_char["x"],
    "y": sf_char["y"],
    "anchor": "bottom-center",
    "sort_y": sf_char["y"],
    "state": "visible",
})
synced_top_objects.append({
    "id": "char.capdread",
    "asset": "characters/capdread/composite_preview.png",
    "rig": "characters/capdread/rig.json",
    "plane": "floor",
    "x": cd_char["x"],
    "y": cd_char["y"],
    "anchor": "bottom-center",
    "sort_y": cd_char["y"],
    "interact": {
        "inspect": "dlg.z1s3.capdread.inspect",
        "talk": "dlg.z1s3.capdread.talk",
    },
    "state": "visible",
})

lay["objects"] = synced_top_objects
lay["studio_official_objects"] = official_json["objects"]
lay["studio_official_hotspots"] = official_json["hotspots"]
lay["studio_official_characters"] = official_json["characters"]
layout_path.write_text(json.dumps(lay, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

# 1. Cleanly sync dist/art/approved, dist/art/candidates, and dist/characters without read-only errors
if (root / "dist").exists():
    for p in (root / "dist").rglob("*"):
        try:
            os.chmod(p, stat.S_IWRITE)
        except Exception:
            pass

    dist_art = root / "dist" / "art" / "approved"
    if dist_art.exists():
        shutil.rmtree(dist_art)
    shutil.copytree(root / "art" / "approved", dist_art, dirs_exist_ok=True)

    dist_cand = root / "dist" / "art" / "candidates"
    if dist_cand.exists():
        shutil.rmtree(dist_cand)
    shutil.copytree(root / "art" / "candidates", dist_cand, dirs_exist_ok=True)

    dist_chars = root / "dist" / "characters"
    if dist_chars.exists():
        shutil.rmtree(dist_chars)
    shutil.copytree(root / "characters", dist_chars, dirs_exist_ok=True)

# 2. Render review/layout_shots/z1s3_cabin_panorama/ directly from src/scenarios/z1s3_official_layout.json!
shot_dir = root / "review" / "layout_shots" / "z1s3_cabin_panorama"
shot_dir.mkdir(parents=True, exist_ok=True)

canvas_w, canvas_h = 2400, 900
pano = Image.new("RGBA", (canvas_w, canvas_h), (24, 18, 22, 255))
pano_no_chars = Image.new("RGBA", (canvas_w, canvas_h), (24, 18, 22, 255))

def paste_piece(target: Image.Image, img_path: Path, x: int, y: int, w: int, h: int, flip_x=False, shadow=True):
    if not img_path.exists():
        return
    im = Image.open(img_path).convert("RGBA").resize((max(1, int(w)), max(1, int(h))), Image.Resampling.LANCZOS)
    if flip_x:
        im = im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    if shadow:
        alpha = im.split()[3]
        sh = Image.new("RGBA", (im.width, im.height), (14, 10, 8, 115))
        sh.putalpha(alpha.point(lambda p: int(p * 0.45)))
        target.alpha_composite(sh, (int(x) + 3, int(y) + 4))
    target.alpha_composite(im, (int(x), int(y)))

z1s3_dir = root / "art" / "approved" / "z1s3"

render_items = []
for obj in official_json.get("objects", []):
    render_items.append((obj.get("sortY", 500), "object", obj))

sf_spawn = official_json.get("characters", {}).get("smoothface", {"x": 685, "y": 795, "facing": 1})
cd_spawn = official_json.get("characters", {}).get("cap_dread", {"x": 1545, "y": 812, "facing": -1})
render_items.append((sf_spawn["y"], "smoothface", sf_spawn))
render_items.append((cd_spawn["y"], "cap_dread", cd_spawn))

render_items.sort(key=lambda item: item[0])

for _, kind, data in render_items:
    if kind == "object":
        img_key = data["imageKey"]
        for dst in (pano, pano_no_chars):
            paste_piece(
                dst,
                z1s3_dir / f"{img_key}.png",
                data["x"],
                data["y"],
                data["w"],
                data["h"],
                flip_x=bool(data.get("flipX", False)),
                shadow=not bool(data.get("inSituSeamless", False)),
            )
    elif kind == "smoothface":
        sf_comp = root / "characters" / "smoothface" / "composite_preview.png"
        if sf_comp.exists():
            sf_im = Image.open(sf_comp).convert("RGBA")
            bbox = sf_im.getbbox()
            if bbox:
                sf_crop = sf_im.crop(bbox)
                if data.get("facing", 1) == -1:
                    sf_crop = sf_crop.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
                target_h = 310
                target_w = int(sf_crop.width * (target_h / sf_crop.height))
                sf_resized = sf_crop.resize((target_w, target_h), Image.Resampling.LANCZOS)
                pano.alpha_composite(sf_resized, (int(data["x"]) - target_w // 2, int(data["y"]) - target_h))
    elif kind == "cap_dread":
        cd_comp = root / "characters" / "capdread" / "composite_preview.png"
        if cd_comp.exists():
            cd_im = Image.open(cd_comp).convert("RGBA")
            bbox = cd_im.getbbox()
            if bbox:
                cd_crop = cd_im.crop(bbox)
                if data.get("facing", -1) == -1:
                    cd_crop = cd_crop.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
                target_h = 328
                target_w = int(cd_crop.width * (target_h / cd_crop.height))
                cd_resized = cd_crop.resize((target_w, target_h), Image.Resampling.LANCZOS)
                pano.alpha_composite(cd_resized, (int(data["x"]) - target_w // 2, int(data["y"]) - target_h))

pano.convert("RGB").save(shot_dir / "full_panorama.png")
pano.crop((0, 0, 1600, 900)).convert("RGB").save(shot_dir / "cam_left.png")
pano.crop((400, 0, 2000, 900)).convert("RGB").save(shot_dir / "cam_center.png")
pano.crop((800, 0, 2400, 900)).convert("RGB").save(shot_dir / "cam_right.png")
pano_no_chars.crop((400, 0, 2000, 900)).convert("RGB").save(shot_dir / "no_chars_cam_center.png")

if (root / "dist").exists():
    dist_shot = root / "dist" / "review" / "layout_shots" / "z1s3_cabin_panorama"
    if dist_shot.exists():
        shutil.rmtree(dist_shot)
    shutil.copytree(shot_dir, dist_shot)

    # 3. Rebuild PLAY_SMOOTHFACE_MVP.html from dist/index.html + inlined CSS & JS
    dist_html_path = root / "dist" / "index.html"
    if dist_html_path.exists():
        dist_html = dist_html_path.read_text(encoding="utf-8")
        css_files = list((root / "dist" / "bundle").glob("*.css"))
        js_files = list((root / "dist" / "bundle").glob("*.js"))
        if css_files and js_files:
            css_text = css_files[0].read_text(encoding="utf-8")
            js_text = js_files[0].read_text(encoding="utf-8")
            dist_html = re.sub(r'<link rel="stylesheet"[^>]+>', lambda _: f"<style>\n{css_text}\n</style>", dist_html)
            dist_html = re.sub(r'<script type="module"[^>]+></script>', lambda _: f"<script type=\"module\">\n{js_text}\n</script>", dist_html)
            (root / "PLAY_SMOOTHFACE_MVP.html").write_text(dist_html, encoding="utf-8")

print("Synchronized layout/z1s3.layout.json, dist/, layout_shots/z1s3_cabin_panorama, and PLAY_SMOOTHFACE_MVP.html!")
