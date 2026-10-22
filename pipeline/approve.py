#!/usr/bin/env python3
"""
approve.py — aplica los veredictos de review/review.json.
  approved -> copia a art/approved/<category>/<id>.png, hash SHA-256,
              entrada en MANIFEST.json, archivo de solo lectura
  rejected -> mueve la versión a art/rejected/<id>_<vN>/ con rejection.txt
Idempotente: un veredicto ya aplicado se salta.
"""
import json, os, sys, shutil, hashlib, stat
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REVIEW = os.path.join(ROOT, "review", "review.json")
CAND = os.path.join(ROOT, "art", "candidates")
APPR = os.path.join(ROOT, "art", "approved")
REJ = os.path.join(ROOT, "art", "rejected")
MANIFEST = os.path.join(APPR, "MANIFEST.json")

def load(p, d):
    if not os.path.exists(p): return d
    with open(p, encoding="utf-8") as f: return json.load(f)

def save(p, obj):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f: json.dump(obj, f, indent=2, ensure_ascii=False)

def sha256(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""): h.update(chunk)
    return h.hexdigest()

def main():
    rv = load(REVIEW, {"reviews": []})
    man = load(MANIFEST, {"pieces": {}, "superseded": []})
    applied = set(man.get("applied_reviews", []))
    log = []
    for r in rv["reviews"]:
        key = f'{r["id"]}@{r["version"]}@{r["verdict"]}@{r.get("ts","")}'
        if key in applied: continue
        cdir = os.path.join(CAND, r["id"])
        meta_p = os.path.join(cdir, "meta.json")
        meta = load(meta_p, {"id": r["id"], "category": r["id"].split(".")[0]})
        src = os.path.join(cdir, f'{r["version"]}.png')
        if not os.path.exists(src):
            log.append(f'SKIP {r["id"]} {r["version"]}: no existe {src}'); continue
        if r["verdict"] == "approved":
            cat = meta.get("category", r["id"].split(".")[0])
            dst_dir = os.path.join(APPR, cat); os.makedirs(dst_dir, exist_ok=True)
            dst = os.path.join(dst_dir, f'{r["id"]}.png')
            if os.path.exists(dst):
                sup = os.path.join(APPR, "_superseded"); os.makedirs(sup, exist_ok=True)
                old = man["pieces"].get(r["id"], {})
                shutil.move(dst, os.path.join(sup, f'{r["id"]}_{old.get("version","old")}.png'))
                man["superseded"].append({**old, "superseded_at": datetime.now().isoformat(timespec="seconds")})
            shutil.copy2(src, dst)
            os.chmod(dst, stat.S_IREAD | stat.S_IRGRP | stat.S_IROTH)
            man["pieces"][r["id"]] = {
                "path": os.path.relpath(dst, ROOT).replace("\\", "/"),
                "version": r["version"], "sha256": sha256(dst),
                "category": cat, "kind": meta.get("kind"),
                "meta": os.path.relpath(meta_p, ROOT).replace("\\", "/"),
                "approved_at": r.get("ts") or datetime.now().isoformat(timespec="seconds"),
                "reason": r.get("reason", ""),
            }
            meta["status"] = "approved"; meta["approved_version"] = r["version"]
            log.append(f'APPROVED {r["id"]} {r["version"]} -> {dst}')
        elif r["verdict"] == "rejected":
            rdir = os.path.join(REJ, f'{r["id"]}_{r["version"]}'); os.makedirs(rdir, exist_ok=True)
            for fn in os.listdir(cdir):
                if fn.startswith(r["version"]) or fn.endswith(f'_{r["version"]}.json') or fn == f'prompt_{r["version"]}.txt':
                    shutil.move(os.path.join(cdir, fn), os.path.join(rdir, fn))
            with open(os.path.join(rdir, "rejection.txt"), "w", encoding="utf-8") as f:
                f.write(r.get("reason", "") + "\n")
            meta["status"] = "rejected"; meta["last_rejection"] = {"version": r["version"], "reason": r.get("reason", "")}
            log.append(f'REJECTED {r["id"]} {r["version"]}: {r.get("reason","")}')
        else:
            log.append(f'SKIP {r["id"]}: veredicto desconocido {r["verdict"]}'); continue
        save(meta_p, meta)
        applied.add(key)
    man["applied_reviews"] = sorted(applied)
    save(MANIFEST, man)
    print("\n".join(log) if log else "nada nuevo que aplicar")

if __name__ == "__main__":
    main()
