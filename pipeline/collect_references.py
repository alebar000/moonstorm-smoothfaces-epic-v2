#!/usr/bin/env python3
"""
collect_references.py - Recolecta las referencias originales de 2010 desde
dr_stache_art/ hacia art/references/ con los nombres canónicos de STYLE_BIBLE.md,
y genera el muestrario visual art/references/ref_palette.png a partir de
pipeline/palette.json.
"""
import argparse
import json
import os
import shutil
import stat
from PIL import Image, ImageDraw


def make_readonly(path):
    try:
        os.chmod(path, stat.S_IREAD | stat.S_IRGRP | stat.S_IROTH)
    except Exception:
        pass


def copy_ref(src, dst, as_png=False):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if os.path.exists(dst):
        try:
            os.chmod(dst, stat.S_IWRITE | stat.S_IREAD)
        except Exception:
            pass
    if as_png and not src.lower().endswith(".png"):
        im = Image.open(src).convert("RGBA")
        im.save(dst, "PNG")
    else:
        shutil.copy2(src, dst)
    make_readonly(dst)


def copy_dir_layers(src_dir, dst_dir):
    os.makedirs(dst_dir, exist_ok=True)
    count = 0
    for fn in sorted(os.listdir(src_dir)):
        if fn.lower().endswith(".png"):
            s = os.path.join(src_dir, fn)
            d = os.path.join(dst_dir, fn)
            copy_ref(s, d, as_png=False)
            count += 1
    return count


def build_palette_swatch(palette_json_path, dst_png):
    with open(palette_json_path, encoding="utf-8") as f:
        pal = json.load(f)
    colors = list(pal.get("colors", {}).items())
    cols = 4
    rows = (len(colors) + cols - 1) // cols
    cell_w, cell_h = 180, 110
    im = Image.new("RGBA", (cols * cell_w, rows * cell_h), (26, 22, 18, 255))
    draw = ImageDraw.Draw(im)
    for idx, (name, hex_val) in enumerate(colors):
        r_idx = idx // cols
        c_idx = idx % cols
        x0 = c_idx * cell_w
        y0 = r_idx * cell_h
        h = hex_val.lstrip("#")
        rgb = tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
        draw.rectangle([x0 + 8, y0 + 8, x0 + cell_w - 8, y0 + cell_h - 32], fill=rgb + (255,), outline=(26, 22, 18, 255), width=2)
        draw.text((x0 + 12, y0 + cell_h - 26), f"{name} ({hex_val})", fill=(243, 237, 224, 255))
    if os.path.exists(dst_png):
        try:
            os.chmod(dst_png, stat.S_IWRITE | stat.S_IREAD)
        except Exception:
            pass
    im.save(dst_png, "PNG")
    make_readonly(dst_png)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--repo", default=".", help="Ruta a la raíz de moonstorm-v2")
    args = ap.parse_args()

    repo = os.path.abspath(args.repo)
    art_src = os.path.join(repo, "dr_stache_art")
    ref_dst = os.path.join(repo, "art", "references")
    os.makedirs(ref_dst, exist_ok=True)

    summary = []

    # 1. ref_hero_smoothface_flat.png
    sf_flat_src = os.path.join(art_src, "email", "email_2010-06-22_aguilar_smoothface003.png")
    sf_flat_dst = os.path.join(ref_dst, "ref_hero_smoothface_flat.png")
    copy_ref(sf_flat_src, sf_flat_dst)
    summary.append("ref_hero_smoothface_flat.png")

    # 2. ref_hero_smoothface_layers/
    sf_layers_src = os.path.join(art_src, "psd_layers", "smoothface-cutout003")
    sf_layers_dst = os.path.join(ref_dst, "ref_hero_smoothface_layers")
    n_sf = copy_dir_layers(sf_layers_src, sf_layers_dst)
    summary.append(f"ref_hero_smoothface_layers/ ({n_sf} PNGs)")

    # 3. ref_room_z1s3_2010.png (from Z1S3 WIP painted PSD composite + lineart companion)
    z1s3_wip_src = os.path.join(art_src, "psd_composites", "psd_2010-10-26_aguilar_Z1S3-substampede_captainroom_WIP_composite.jpg")
    z1s3_dst = os.path.join(ref_dst, "ref_room_z1s3_2010.png")
    copy_ref(z1s3_wip_src, z1s3_dst, as_png=True)
    summary.append("ref_room_z1s3_2010.png")

    z1s3_line_src = os.path.join(art_src, "email", "email_2010-08-20_aguilar_Z1S3-substampede_captainroom.png")
    z1s3_line_dst = os.path.join(ref_dst, "ref_room_z1s3_lineart_2010.png")
    copy_ref(z1s3_line_src, z1s3_line_dst)
    summary.append("ref_room_z1s3_lineart_2010.png")

    z1s3_layers_src = os.path.join(art_src, "psd_layers", "Z1S3-substampede_captainroom_WIP")
    z1s3_layers_dst = os.path.join(ref_dst, "ref_room_z1s3_layers")
    n_z1s3 = copy_dir_layers(z1s3_layers_src, z1s3_layers_dst)
    summary.append(f"ref_room_z1s3_layers/ ({n_z1s3} PNGs)")

    # 4. ref_sketch_capdread.png
    cd_src = os.path.join(art_src, "email", "email_2010-07-15_aguilar_capdread001.png")
    cd_dst = os.path.join(ref_dst, "ref_sketch_capdread.png")
    copy_ref(cd_src, cd_dst)
    summary.append("ref_sketch_capdread.png")

    # 5. ref_gui_aguilar.jpg
    gui_src = os.path.join(art_src, "email", "email_2010-10-15_aguilar_GUImu003.jpg")
    gui_dst = os.path.join(ref_dst, "ref_gui_aguilar.jpg")
    copy_ref(gui_src, gui_dst)
    summary.append("ref_gui_aguilar.jpg")

    # 6. Additional 2010 Morales/Aguilar cutout style references
    castle_src = os.path.join(art_src, "psd_composites", "psd_2010-06-23_morales_test-spook_castle_composite.jpg")
    castle_dst = os.path.join(ref_dst, "ref_cutout_spook_castle.png")
    copy_ref(castle_src, castle_dst, as_png=True)
    summary.append("ref_cutout_spook_castle.png")

    desert_src = os.path.join(art_src, "psd_composites", "psd_2010-06-23_morales_test-desert_foreign_legion_composite.jpg")
    desert_dst = os.path.join(ref_dst, "ref_cutout_desert.png")
    copy_ref(desert_src, desert_dst, as_png=True)
    summary.append("ref_cutout_desert.png")

    # 7. ref_palette.png from pipeline/palette.json
    pal_json = os.path.join(repo, "pipeline", "palette.json")
    pal_dst = os.path.join(ref_dst, "ref_palette.png")
    build_palette_swatch(pal_json, pal_dst)
    summary.append("ref_palette.png")

    print(json.dumps({"repo": repo, "collected": summary}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
