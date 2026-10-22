#!/usr/bin/env python3
"""
gates.py - chequeos automáticos, binarios y aburridos, para piezas de
Smoothface's Epic. No hace nada creativo. Tres subcomandos:

  normalize  quita un fondo plano (chroma key), recorta con margen y
             reescala a la altura objetivo del meta.json
  check      corre los gates sobre un PNG RGBA y escribe un JSON pass/fail
  layout     valida un layout/<room>.layout.json contra el manifiesto

Requiere: numpy, Pillow, opencv-python (cv2).
"""
import argparse, json, os, sys, math
from datetime import datetime

import numpy as np
from PIL import Image

try:
    import cv2
except ImportError:
    cv2 = None

HERE = os.path.dirname(os.path.abspath(__file__))

def py(obj):
    """Convierte tipos numpy a tipos nativos para JSON y comparaciones."""
    if isinstance(obj, dict): return {k: py(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)): return [py(v) for v in obj]
    if isinstance(obj, (np.bool_,)): return bool(obj)
    if isinstance(obj, (np.integer,)): return int(obj)
    if isinstance(obj, (np.floating,)): return float(obj)
    return obj

def load_json(p, default=None):
    if not os.path.exists(p):
        return default
    with open(p, encoding="utf-8") as f:
        return json.load(f)

def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def rgb2lab(arr):
    """arr: (N,3) uint8 -> (N,3) float Lab (CIE76-grade approx)."""
    rgb = arr.astype(np.float64) / 255.0
    m = rgb > 0.04045
    rgb = np.where(m, ((rgb + 0.055) / 1.055) ** 2.4, rgb / 12.92)
    M = np.array([[0.4124, 0.3576, 0.1805],
                  [0.2126, 0.7152, 0.0722],
                  [0.0193, 0.1192, 0.9505]])
    xyz = rgb @ M.T
    xyz /= np.array([0.95047, 1.0, 1.08883])
    e, k = 0.008856, 903.3
    f = np.where(xyz > e, np.cbrt(xyz), (k * xyz + 16) / 116)
    L = 116 * f[:, 1] - 16
    a = 500 * (f[:, 0] - f[:, 1])
    b = 200 * (f[:, 1] - f[:, 2])
    return np.stack([L, a, b], axis=1)

# ---------------------------------------------------------------- normalize

def cmd_normalize(a):
    im = Image.open(a.src).convert("RGBA")
    arr = np.array(im)
    meta = load_json(a.meta, {}) if a.meta else {}

    if a.key:
        key = np.array(hex2rgb(a.key), dtype=np.int16)
        rgb = arr[:, :, :3].astype(np.int16)
        dist = np.abs(rgb - key).sum(axis=2)
        # píxeles cercanos al color clave -> transparentes; borde suave estrecho
        alpha = np.clip((dist - a.key_tol) / 24.0, 0, 1)
        arr[:, :, 3] = (arr[:, :, 3].astype(np.float64) * alpha).astype(np.uint8)
        # despill: píxeles semitransparentes pierden el tinte del key
        semi = (arr[:, :, 3] > 0) & (arr[:, :, 3] < 255)
        if semi.any():
            px = arr[semi][:, :3].astype(np.float64)
            kf = key.astype(np.float64)
            # proyectar hacia gris quitando la componente dominante del key
            dom = int(np.argmax(kf))
            others = [i for i in range(3) if i != dom]
            px[:, dom] = np.minimum(px[:, dom], px[:, others].mean(axis=1))
            arr[semi, :3] = px.astype(np.uint8)

    alpha = arr[:, :, 3]
    ys, xs = np.where(alpha > 8)
    if len(xs) == 0:
        sys.exit("normalize: la imagen quedó vacía (¿key equivocado?)")
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    crop = arr[y0:y1, x0:x1]

    target_h = meta.get("target_height_px")
    if target_h:
        h = crop.shape[0]
        s = target_h / h
        new_w = max(1, int(round(crop.shape[1] * s)))
        crop = np.array(Image.fromarray(crop).resize((new_w, target_h), Image.LANCZOS))

    pad = int(round(max(crop.shape[:2]) * a.margin))
    out = np.zeros((crop.shape[0] + 2 * pad, crop.shape[1] + 2 * pad, 4), np.uint8)
    out[pad:pad + crop.shape[0], pad:pad + crop.shape[1]] = crop
    Image.fromarray(out).save(a.out)
    print(json.dumps({"out": a.out, "size": [out.shape[1], out.shape[0]], "cropped_from": [int(x0), int(y0), int(x1), int(y1)]}))

# -------------------------------------------------------------------- check

def gate_alpha_and_halo(arr, rules):
    alpha = arr[:, :, 3]
    opaque = alpha > 128
    partial = (alpha > 0) & (alpha < 255)
    res = {}
    # halo: píxeles claros con alfa>0 en el anillo exterior de la silueta
    if cv2 is not None:
        k = np.ones((3, 3), np.uint8)
        ring = cv2.dilate(opaque.astype(np.uint8), k, iterations=2).astype(bool) & ~opaque
    else:
        ring = partial
    lum = (0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2])
    halo = ring & (alpha > 0) & (lum > rules.get("halo_lum", 225))
    perim = max(1, int(ring.sum()))
    halo_frac = float(halo.sum()) / perim
    res["halo_fraction"] = round(halo_frac, 4)
    res["halo_ok"] = halo_frac <= rules.get("halo_max", 0.003)
    # borde sticker opaco: banda exterior de la silueta que es casi blanca
    if cv2 is not None:
        band = opaque & ~cv2.erode(opaque.astype(np.uint8), k, iterations=3).astype(bool)
        white_band = band & (lum > rules.get("halo_lum", 225))
        sticker = float(white_band.sum()) / max(1, band.sum())
        res["sticker_border_fraction"] = round(sticker, 4)
        res["sticker_ok"] = sticker <= rules.get("sticker_max", 0.15)
    # alfa parcial lejos del borde (manchas semitransparentes dentro de la pieza)
    if cv2 is not None:
        inner = cv2.erode(opaque.astype(np.uint8), k, iterations=3).astype(bool)
        stray = partial & inner
        res["stray_partial_alpha"] = int(stray.sum())
        res["partial_alpha_ok"] = stray.sum() == 0
    else:
        res["partial_alpha_ok"] = True
    return res

def gate_components(arr, meta):
    alpha = (arr[:, :, 3] > 128).astype(np.uint8)
    if cv2 is None:
        return {"components_ok": True, "note": "cv2 no disponible"}
    n, labels, stats, _ = cv2.connectedComponentsWithStats(alpha, 8)
    areas = sorted([int(s[cv2.CC_STAT_AREA]) for s in stats[1:]], reverse=True)
    total = max(1, sum(areas))
    allowed = int(meta.get("allowed_islands", 0))
    islands = [x for x in areas[1:] if x / total >= 0.0005]
    specks = [x for x in areas[1:] if x / total < 0.0005]
    return {
        "components": len(areas),
        "islands_significant": len(islands),
        "specks": len(specks),
        "components_ok": len(islands) <= allowed and len(specks) == 0,
    }

def gate_cropped_by_border(arr):
    alpha = arr[:, :, 3] > 128
    touches = int(alpha[0, :].any()) + int(alpha[-1, :].any()) + int(alpha[:, 0].any()) + int(alpha[:, -1].any())
    return {"touches_border_sides": touches, "border_ok": touches == 0}

def gate_palette(arr, pal):
    opaque = arr[:, :, 3] > 200
    px = arr[opaque][:, :3]
    if len(px) == 0:
        return {"palette_ok": False, "note": "sin píxeles opacos"}
    if len(px) > 60000:
        idx = np.random.default_rng(0).choice(len(px), 60000, replace=False)
        px = px[idx]
    pal_rgb = np.array([hex2rgb(v) for v in pal["colors"].values()], np.uint8)
    lab_px = rgb2lab(px)
    lab_pal = rgb2lab(pal_rgb)
    d = np.sqrt(((lab_px[:, None, :] - lab_pal[None, :, :]) ** 2).sum(axis=2)).min(axis=1)
    off = float((d > pal.get("delta_e_tolerance", 18)).mean())
    return {"off_palette_fraction": round(off, 4),
            "palette_ok": off <= pal.get("max_off_palette_fraction", 0.08)}

def gate_ink_thickness(arr, rules):
    """Grosor típico de línea negra: 2 * mediana de la distancia al borde
    dentro de las zonas de tinta (distance transform)."""
    if cv2 is None:
        return {"ink_ok": True, "note": "cv2 no disponible"}
    opaque = arr[:, :, 3] > 128
    lum = (0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2])
    rgb = arr[:, :, :3].astype(np.int16)
    chroma = rgb.max(axis=2) - rgb.min(axis=2)
    # tinta = oscuro Y casi sin saturación (un rojo oscuro no es tinta)
    ink = (opaque & (lum < rules.get("ink_lum", 50)) & (chroma < rules.get("ink_chroma", 45))).astype(np.uint8)
    if ink.sum() < 50:
        return {"ink_px": int(ink.sum()), "ink_ok": False, "note": "casi no hay tinta"}
    dt = cv2.distanceTransform(ink, cv2.DIST_L2, 5)
    # esqueleto aproximado: máximos locales del DT
    k = np.ones((3, 3), np.uint8)
    ridge = (dt >= cv2.dilate(dt, k) - 1e-3) & (dt > 0.5)
    thick = 2.0 * np.median(dt[ridge]) if ridge.any() else 0.0
    lo, hi = rules.get("ink_min", 4), rules.get("ink_max", 9)
    return {"ink_thickness_px": round(float(thick), 2), "ink_ok": lo <= thick <= hi}

def gate_gradients(arr, rules):
    """Detecta sombreado suave: fracción de píxeles opacos cuya vecindad
    tiene variación pequeña pero no nula (gradiente) en vez de plano o borde."""
    if cv2 is None:
        return {"gradient_ok": True}
    opaque = arr[:, :, 3] > 200
    g = cv2.GaussianBlur(arr[:, :, :3].astype(np.float32), (0, 0), 1.0)
    gx = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3)
    mag = np.sqrt((gx ** 2 + gy ** 2).sum(axis=2))
    soft = opaque & (mag > rules.get("grad_lo", 6)) & (mag < rules.get("grad_hi", 40))
    frac = float(soft.sum()) / max(1, opaque.sum())
    return {"soft_gradient_fraction": round(frac, 4),
            "gradient_ok": frac <= rules.get("grad_max", 0.12)}

def gate_height(arr, meta, heights):
    if not heights:
        return {"height_ok": True}
    alpha = arr[:, :, 3] > 128
    ys = np.where(alpha.any(axis=1))[0]
    h = int(ys.max() - ys.min() + 1) if len(ys) else 0
    target = meta.get("target_height_px")
    if not target:
        frac = meta.get("height_fraction_of_smoothface")
        ref = heights["characters"].get(heights.get("reference_character", "smoothface"))
        if frac and ref:
            target = frac * ref
    if not target:
        return {"measured_height_px": h, "height_ok": True, "note": "sin altura objetivo"}
    tol = heights.get("tolerance", 0.04)
    ok = abs(h - target) / target <= tol
    return {"measured_height_px": h, "target_height_px": target, "height_ok": ok}

def cmd_check(a):
    arr = np.array(Image.open(a.src).convert("RGBA"))
    meta = load_json(a.meta, {}) if a.meta else {}
    rules = load_json(os.path.join(HERE, "rules.json"), {})
    pal = load_json(os.path.join(HERE, "palette.json"))
    heights = load_json(os.path.join(HERE, "heights.json"))
    kind = meta.get("kind", "prop")

    r = {"file": a.src, "ts": datetime.now().isoformat(timespec="seconds"), "kind": kind}
    r.update(gate_alpha_and_halo(arr, rules))
    r.update(gate_components(arr, meta))
    r.update(gate_cropped_by_border(arr))
    if pal:
        r.update(gate_palette(arr, pal))
    r.update(gate_ink_thickness(arr, rules))
    r.update(gate_gradients(arr, rules))
    r.update(gate_height(arr, meta, heights))

    r = py(r)
    keys = [k for k in r if k.endswith("_ok")]
    failed = [k[:-3] for k in keys if r[k] is False]
    r["failed"] = failed
    r["overall"] = "pass" if not failed else "fail"
    out = a.out or os.path.splitext(a.src)[0] + ".gates.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(r, f, indent=2, ensure_ascii=False)
    print(json.dumps({"overall": r["overall"], "failed": failed, "out": out}))
    sys.exit(0 if r["overall"] == "pass" else 2)

# ------------------------------------------------------------------- layout

def rect_of(obj, w, h):
    x, y = obj["x"], obj["y"]
    s = obj.get("scale", 1.0)
    w, h = w * s, h * s
    anc = obj.get("anchor", "bottom-center")
    if anc == "bottom-center":
        return (x - w / 2, y - h, x + w / 2, y)
    if anc == "top-left":
        return (x, y, x + w, y + h)
    if anc == "center":
        return (x - w / 2, y - h / 2, x + w / 2, y + h / 2)
    return (x, y, x + w, y + h)

def overlap_frac(r1, r2):
    ix = max(0, min(r1[2], r2[2]) - max(r1[0], r2[0]))
    iy = max(0, min(r1[3], r2[3]) - max(r1[1], r2[1]))
    inter = ix * iy
    a1 = (r1[2] - r1[0]) * (r1[3] - r1[1])
    a2 = (r2[2] - r2[0]) * (r2[3] - r2[1])
    return inter / max(1e-6, min(a1, a2))

def cmd_layout(a):
    lay = load_json(a.src)
    root = a.root or os.path.dirname(HERE)
    manifest = load_json(os.path.join(root, "art", "approved", "MANIFEST.json"), {"pieces": {}})
    approved = {v["path"] for v in manifest.get("pieces", {}).values()}
    errors, warns = [], []
    planes = {p["id"] for p in lay.get("planes", [])}
    rects = []
    for o in lay.get("objects", []):
        asset = o.get("asset", "")
        if asset not in approved and not os.path.exists(os.path.join(root, asset)):
            errors.append(f"{o['id']}: asset no está en el manifiesto ni en disco ({asset})")
            continue
        if o.get("plane") not in planes:
            errors.append(f"{o['id']}: plano desconocido {o.get('plane')}")
        p = os.path.join(root, asset)
        try:
            w, h = Image.open(p).size
        except Exception as e:
            errors.append(f"{o['id']}: no se pudo abrir {asset}: {e}")
            continue
        r = rect_of(o, w, h)
        if o.get("interact"):
            rects.append((o["id"], r))
        if o.get("plane") == "floor" and o.get("interact"):
            W, H = lay["size"]["w"], lay["size"]["h"]
            if r[0] < -w * 0.1 or r[2] > W + w * 0.1 or r[3] > H:
                warns.append(f"{o['id']}: parcialmente fuera del cuarto")
    for i in range(len(rects)):
        for j in range(i + 1, len(rects)):
            f = overlap_frac(rects[i][1], rects[j][1])
            if f > 0.30:
                warns.append(f"hotspots {rects[i][0]} y {rects[j][0]} se solapan {int(f*100)} %")
    r = {"file": a.src, "errors": errors, "warnings": warns,
         "overall": "pass" if not errors else "fail"}
    print(json.dumps(r, indent=2, ensure_ascii=False))
    sys.exit(0 if not errors else 2)

# --------------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    n = sub.add_parser("normalize")
    n.add_argument("src"); n.add_argument("--out", required=True)
    n.add_argument("--key", help="color de fondo plano a quitar, hex sin #, ej 00FF00")
    n.add_argument("--key-tol", type=int, default=60)
    n.add_argument("--meta"); n.add_argument("--margin", type=float, default=0.08)
    n.set_defaults(fn=cmd_normalize)

    c = sub.add_parser("check")
    c.add_argument("src"); c.add_argument("--meta"); c.add_argument("--out")
    c.set_defaults(fn=cmd_check)

    l = sub.add_parser("layout")
    l.add_argument("src"); l.add_argument("--root")
    l.set_defaults(fn=cmd_layout)

    a = ap.parse_args()
    a.fn(a)

if __name__ == "__main__":
    main()
