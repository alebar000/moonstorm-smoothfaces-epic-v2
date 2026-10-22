#!/usr/bin/env python3
"""
collect_references.py — busca las referencias originales de 2010 dentro del
repo (recovered/, dr_stache_art/, etc.) y las copia a art/references/ con
los nombres que exige STYLE_BIBLE.md §1. Aplana PSD y exporta sus capas.

    python pipeline/collect_references.py --repo <raíz del repo> [--kit <raíz del kit>]

Requiere Pillow. Para los PSD usa psd-tools si está instalado
(pip install psd-tools); si no, busca PNG ya exportados con el mismo nombre.
"""
import argparse, os, shutil, sys, re

try:
    from PIL import Image
except ImportError:
    sys.exit("falta Pillow: pip install pillow")

try:
    from psd_tools import PSDImage
except ImportError:
    PSDImage = None

# destino -> lista de nombres candidatos (regex, sin distinguir mayúsculas), en orden de preferencia
WANTED = {
    "ref_design_smoothface.png": [r"smoothsplash\.png$", r"smoothface.*sketch.*\.(png|jpg)$", r"smooth.*001\.(png|jpg|gif)$"],
    "ref_design_capdread.png":   [r"capdread001\.(png|jpg|gif)$", r"cap.?dread.*\.(png|jpg|gif)$"],
    "ref_room_z1s3_2010.png":    [r"Z1S3-substampede_captainroom\.psd$", r"Z1S3.*captainroom.*\.(png|jpg)$", r"Z1S3-WIP.*\.(png|jpg)$"],
    "ref_gui_aguilar.jpg":       [r"GUImu003\.(jpg|jpeg|png)$", r"email_.*aguilar_GUImu003.*\.(jpg|png)$"],
}
CUTOUT_PSD = [r"smoothface-cutout003\.psd$"]
CUTOUT_LAYER_DIR_HINTS = [r"smoothface[-_]?cutout003", r"smoothface_orig"]

def find_all(root):
    files = []
    for d, _, fs in os.walk(root):
        if any(x in d for x in (os.sep + ".git", os.sep + "node_modules", os.sep + "dist", os.sep + "art" + os.sep + "references")):
            continue
        for f in fs:
            files.append(os.path.join(d, f))
    return files

def pick(files, patterns):
    for pat in patterns:
        rx = re.compile(pat, re.I)
        hits = [f for f in files if rx.search(f.replace("\\", "/"))]
        if hits:
            # preferir el que esté en carpetas de material recuperado
            hits.sort(key=lambda p: (0 if re.search(r"recovered|dr_stache_art|drive_|email_", p, re.I) else 1, len(p)))
            return hits[0]
    return None

def flatten_psd(src, dst):
    if PSDImage is None:
        return False
    psd = PSDImage.open(src)
    im = psd.composite()
    im.convert("RGBA").save(dst)
    return True

def export_psd_layers(src, out_dir):
    if PSDImage is None:
        return 0
    os.makedirs(out_dir, exist_ok=True)
    psd = PSDImage.open(src)
    n = 0
    W, H = psd.width, psd.height
    for i, layer in enumerate(psd.descendants()):
        if not layer.is_visible() or layer.is_group():
            continue
        im = layer.composite()
        if im is None:
            continue
        canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        canvas.paste(im, (layer.left, layer.top))
        name = re.sub(r"[^a-z0-9]+", "_", layer.name.lower()).strip("_") or f"layer_{i}"
        canvas.save(os.path.join(out_dir, f"{i:02d}_{name}.png"))
        n += 1
    return n

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", required=True)
    ap.add_argument("--kit", default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    a = ap.parse_args()
    out = os.path.join(a.kit, "art", "references")
    os.makedirs(out, exist_ok=True)
    files = find_all(a.repo)
    report = []

    for dst_name, pats in WANTED.items():
        src = pick(files, pats)
        dst = os.path.join(out, dst_name)
        if not src:
            report.append(f"FALTA  {dst_name}: no encontré nada con {pats[0]}"); continue
        if src.lower().endswith(".psd"):
            if flatten_psd(src, dst):
                report.append(f"OK     {dst_name}  <- {src} (PSD aplanado)")
            else:
                report.append(f"FALTA  {dst_name}: {src} es PSD y no hay psd-tools (pip install psd-tools)")
            continue
        im = Image.open(src)
        if dst_name.endswith(".png"):
            im.convert("RGBA").save(dst)
        else:
            im.convert("RGB").save(dst, quality=92)
        report.append(f"OK     {dst_name}  <- {src}")

    # capas del cutout de Morales
    layer_dir = os.path.join(out, "ref_cutout_layers")
    psd = pick(files, CUTOUT_PSD)
    n = 0
    if psd:
        n = export_psd_layers(psd, layer_dir)
        if n:
            report.append(f"OK     ref_cutout_layers/ ({n} capas) <- {psd}")
    if not n:
        # buscar capas ya exportadas
        for hint in CUTOUT_LAYER_DIR_HINTS:
            rx = re.compile(hint, re.I)
            dirs = sorted({os.path.dirname(f) for f in files if rx.search(f.replace("\\", "/")) and f.lower().endswith(".png")})
            if dirs:
                os.makedirs(layer_dir, exist_ok=True)
                for f in files:
                    if os.path.dirname(f) == dirs[0] and f.lower().endswith(".png"):
                        shutil.copy2(f, os.path.join(layer_dir, os.path.basename(f))); n += 1
                report.append(f"OK     ref_cutout_layers/ ({n} PNG ya exportados) <- {dirs[0]}")
                break
    if not n:
        report.append("FALTA  ref_cutout_layers/: ni PSD legible ni PNG exportados de smoothface-cutout003")

    print("\n".join(report))
    missing = [r for r in report if r.startswith("FALTA")]
    print(f"\n{len(report)-len(missing)} listas, {len(missing)} faltan. Destino: {out}")
    sys.exit(1 if missing else 0)

if __name__ == "__main__":
    main()
