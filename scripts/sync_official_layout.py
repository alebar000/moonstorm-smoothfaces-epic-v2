from pathlib import Path
import shutil
import os
import stat
import re
import json
from PIL import Image

root = Path(r"c:\AntiGravityStuff\Moonstorm2")

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

official_json = json.loads((root / "src" / "scenarios" / "z1s3_official_layout.json").read_text(encoding="utf-8"))

canvas_w, canvas_h = 2400, 900
pano = Image.new("RGBA", (canvas_w, canvas_h), (24, 18, 22, 255))

def paste_piece(img_path: Path, x: int, y: int, w: int, h: int, flip_x=False, shadow=True):
    if not img_path.exists():
        return
    im = Image.open(img_path).convert("RGBA").resize((max(1, int(w)), max(1, int(h))), Image.Resampling.LANCZOS)
    if flip_x:
        im = im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    if shadow:
        alpha = im.split()[3]
        sh = Image.new("RGBA", (im.width, im.height), (14, 10, 8, 115))
        sh.putalpha(alpha.point(lambda p: int(p * 0.45)))
        pano.alpha_composite(sh, (int(x) + 3, int(y) + 4))
    pano.alpha_composite(im, (int(x), int(y)))

z1s3_dir = root / "art" / "approved" / "z1s3"

# Sort objects + characters by sortY exactly like the game engine!
render_items = []
for obj in official_json.get("objects", []):
    render_items.append((obj.get("sortY", 500), "object", obj))

sf_spawn = official_json.get("characters", {}).get("smoothface", {"x": 700, "y": 800, "facing": 1})
cd_spawn = official_json.get("characters", {}).get("cap_dread", {"x": 1540, "y": 805, "facing": -1})
render_items.append((sf_spawn["y"], "smoothface", sf_spawn))
render_items.append((cd_spawn["y"], "cap_dread", cd_spawn))

render_items.sort(key=lambda item: item[0])

for _, kind, data in render_items:
    if kind == "object":
        img_key = data["imageKey"]
        paste_piece(
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
                target_h = 285
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
                target_h = 330
                target_w = int(cd_crop.width * (target_h / cd_crop.height))
                cd_resized = cd_crop.resize((target_w, target_h), Image.Resampling.LANCZOS)
                pano.alpha_composite(cd_resized, (int(data["x"]) - target_w // 2, int(data["y"]) - target_h))

pano.convert("RGB").save(shot_dir / "full_panorama.png")
pano.crop((0, 0, 1600, 900)).convert("RGB").save(shot_dir / "cam_left.png")
pano.crop((400, 0, 2000, 900)).convert("RGB").save(shot_dir / "cam_center.png")
pano.crop((800, 0, 2400, 900)).convert("RGB").save(shot_dir / "cam_right.png")

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

print("Updated dist/, layout_shots/z1s3_cabin_panorama, and PLAY_SMOOTHFACE_MVP.html!")
