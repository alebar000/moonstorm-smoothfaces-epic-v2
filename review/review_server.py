#!/usr/bin/env python3
"""
review_server.py — servidor local mínimo para la hoja de revisión humana.
Sirve review_sheet.html, expone las piezas en estado "proposed" y escribe
los veredictos de Alex en review/review.json. Sin dependencias externas.

    python review/review_server.py --root <raíz del repo> [--port 8765]
"""
import argparse, json, os, sys, mimetypes, urllib.parse
from datetime import datetime
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = None

def jload(p, d):
    if not os.path.exists(p): return d
    with open(p, encoding="utf-8") as f: return json.load(f)

def jsave(p, o):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    tmp = p + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f: json.dump(o, f, indent=2, ensure_ascii=False)
    os.replace(tmp, p)

def rel(p): return os.path.relpath(p, ROOT).replace("\\", "/")

def candidates(show_all=False):
    out = []
    cdir = os.path.join(ROOT, "art", "candidates")
    if not os.path.isdir(cdir): return out
    manifest = jload(os.path.join(ROOT, "art", "approved", "MANIFEST.json"), {"pieces": {}})
    for pid in sorted(os.listdir(cdir)):
        d = os.path.join(cdir, pid)
        meta = jload(os.path.join(d, "meta.json"), None)
        if not meta: continue
        if not show_all and meta.get("status") not in ("proposed", "approved"): continue
        v = meta.get("proposed_version") or sorted([f[:-4] for f in os.listdir(d) if f.endswith(".png") and f.startswith("v") and "_raw" not in f])[-1:] or ["v1"]
        v = v if isinstance(v, str) else v[0]
        def jf(name): return jload(os.path.join(d, name), None)
        cat = meta.get("category", pid.split(".")[0])
        neighbors = [p["path"] for k, p in manifest.get("pieces", {}).items() if p.get("category") == cat and k != pid][:4]
        out.append({
            "id": pid, "version": v, "kind": meta.get("kind"), "category": cat,
            "what": meta.get("what", ""), "status": meta.get("status"),
            "image": rel(os.path.join(d, v + ".png")),
            "references": meta.get("references", []),
            "neighbors": neighbors,
            "gates": jf(f"gates_{v}.json"),
            "critic_style": jf(f"critic_style_{v}.json"),
            "critic_anatomy": jf(f"critic_anatomy_{v}.json"),
            "last_rejection": meta.get("last_rejection"),
            "target_height_px": meta.get("target_height_px"),
        })
    return out

def layout_shots():
    base = os.path.join(ROOT, "review", "layout_shots")
    if not os.path.isdir(base): return []
    out = []
    for run in sorted(os.listdir(base), reverse=True)[:6]:
        rd = os.path.join(base, run)
        if os.path.isdir(rd):
            out.append({"run": run, "images": [rel(os.path.join(rd, f)) for f in sorted(os.listdir(rd)) if f.lower().endswith((".png", ".jpg"))]})
    return out

class H(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    def log_message(self, *a): pass

    def _json(self, obj, code=200):
        b = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code); self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b)

    def do_GET(self):
        u = urllib.parse.urlparse(self.path); q = urllib.parse.parse_qs(u.query)
        if u.path in ("/", "/index.html"):
            p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "review_sheet.html")
            b = open(p, "rb").read()
            self.send_response(200); self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b); return
        if u.path == "/api/candidates": return self._json(candidates(q.get("all", ["0"])[0] == "1"))
        if u.path == "/api/reviews": return self._json(jload(os.path.join(ROOT, "review", "review.json"), {"reviews": []}))
        if u.path == "/api/shots": return self._json(layout_shots())
        if u.path in ("/play", "/play/", "/dist", "/dist/", "/dist/index.html"):
            p = os.path.join(ROOT, "dist", "index.html")
            if os.path.isfile(p):
                b = open(p, "rb").read()
                self.send_response(200); self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b); return
        if u.path.startswith("/file/"):
            relp = urllib.parse.unquote(u.path[6:])
            full = os.path.normpath(os.path.join(ROOT, relp))
            if not full.startswith(os.path.normpath(ROOT)) or not os.path.isfile(full):
                self.send_error(404); return
            ctype = mimetypes.guess_type(full)[0] or "application/octet-stream"
            b = open(full, "rb").read()
            self.send_response(200); self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(b))); self.send_header("Cache-Control", "no-store")
            self.end_headers(); self.wfile.write(b); return
        # Serve static game assets from dist/ or ROOT
        clean_rel = urllib.parse.unquote(u.path.lstrip("/"))
        if clean_rel.startswith("dist/"):
            clean_rel = clean_rel[5:]
        for base_dir in (os.path.join(ROOT, "dist"), ROOT):
            cand = os.path.normpath(os.path.join(base_dir, clean_rel))
            if cand.startswith(os.path.normpath(base_dir)) and os.path.isfile(cand):
                ctype = mimetypes.guess_type(cand)[0] or "application/octet-stream"
                b = open(cand, "rb").read()
                self.send_response(200); self.send_header("Content-Type", ctype)
                self.send_header("Content-Length", str(len(b))); self.send_header("Cache-Control", "no-store")
                self.end_headers(); self.wfile.write(b); return
        self.send_error(404)

    def do_POST(self):
        if self.path != "/api/review": self.send_error(404); return
        n = int(self.headers.get("Content-Length", "0"))
        body = json.loads(self.rfile.read(n) or b"{}")
        for k in ("id", "version", "verdict"):
            if k not in body: return self._json({"error": f"falta {k}"}, 400)
        if body["verdict"] not in ("approved", "rejected"): return self._json({"error": "verdict inválido"}, 400)
        if body["verdict"] == "rejected" and not body.get("reason", "").strip():
            return self._json({"error": "un rechazo necesita motivo"}, 400)
        p = os.path.join(ROOT, "review", "review.json")
        rv = jload(p, {"reviews": []})
        # un veredicto por (id, version): el último gana
        rv["reviews"] = [r for r in rv["reviews"] if not (r["id"] == body["id"] and r["version"] == body["version"])]
        rv["reviews"].append({"id": body["id"], "version": body["version"], "verdict": body["verdict"],
                              "reason": body.get("reason", "").strip(),
                              "ts": datetime.now().isoformat(timespec="seconds")})
        jsave(p, rv)
        self._json({"ok": True, "count": len(rv["reviews"])})

def main():
    global ROOT
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    ap.add_argument("--port", type=int, default=8765)
    a = ap.parse_args()
    ROOT = os.path.abspath(a.root)
    print(f"Hoja de revisión: http://localhost:{a.port}/   (raíz: {ROOT})")
    ThreadingHTTPServer(("127.0.0.1", a.port), H).serve_forever()

if __name__ == "__main__":
    main()
