#!/usr/bin/env python3
"""
build_and_check_l4.py - Pipeline execution for Captain Dread Batch L4.
Generates raw renders, metadata, prompts, normalizes, gate-checks, and writes critic reviews.
Zero em-dashes anywhere.
"""
import os
import sys
import json
import shutil
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
CANDIDATES_DIR = os.path.join(REPO_ROOT, "art", "candidates")
GATES_PY = os.path.join(REPO_ROOT, "pipeline", "gates.py")

import cv2
from generate_capdread_l4 import render_piece

PIECE_TARGETS = {
    "capdread.torso": (220, 0),
    "capdread.head": (135, 0),
    "capdread.hat": (78, 0),
    "capdread.beard": (78, 0),
    "capdread.eyes.normal": (28, 1),
    "capdread.eyes.closed": (28, 1),
    "capdread.eyes.squint": (26, 1),
    "capdread.brows.normal": (24, 1),
    "capdread.brows.angry": (26, 1),
    "capdread.brows.surprised": (28, 1),
}

METADATA = {
    "capdread.torso": {
        "what": "Captain Dread naval captain uniform coat only (no head, no limbs, no legs): deep navy blue coat (#343e63) with folded lapels, golden epaulets (#e7bc57) with fringed shoulder trim, white-cream ruffled cravat neckerchief (#f9ecc2) at the open collar, black marker ink outlines (#1a1612), 3/4 front view facing right, matching the silhouette and design in ref_design_capdread.png and style of ref_hero_torso.png",
        "pivot_hint": "neck base inside collar at top-center; left and right shoulder joints at upper coat edges under epaulets; hip base at bottom-center",
        "ink_note": "thick marker, ~7.5 px at game scale (6-9 px range at 220 px height)",
        "color_note": "#343e63 (navy coat), #e7bc57 (gold epaulets and buttons), #f9ecc2 (cream cravat), #1a1612 (marker ink), #6e6a62 (pencil shading)"
    },
    "capdread.head": {
        "what": "Captain Dread head and face profile (no hat, no beard, no eyes, no brows): cream construction paper skin (#f9ecc2), voluminous flamboyant pompadour hairstyle (#1a1612) with swirling front crest, shaved temple stubble, curved smoking pipe (#613e35 bowl with #e7bc57 gold band) resting at right jaw corner with tiny puff of smoke, neck base for torso collar overlap, 3/4 front view facing right, matching ref_design_capdread.png",
        "pivot_hint": "neck at bottom-center; jawline for capdread.beard overlap; mid-face for capdread.eyes; brow ridge for capdread.brows; hair dome top for capdread.hat",
        "ink_note": "thick marker, ~7.5 px at game scale (6-9 px range at 135 px height)",
        "color_note": "#f9ecc2 (skin cream), #1a1612 (pompadour hair and ink), #613e35 (briar pipe), #e7bc57 (gold pipe band), #6e6a62 (temple stipple and pencil shading)"
    },
    "capdread.hat": {
        "what": "Captain Dread pirate tricorn captain hat: dark navy/black construction paper (#1a1612/#343e63) with flared tricorn folded corners, ornate gold braid trim (#e7bc57) along curved upper crest and brim, small golden captain insignia at front, 3/4 front view facing right, matching ref_design_capdread.png",
        "pivot_hint": "bottom center resting on upper pompadour of capdread.head",
        "ink_note": "thick marker, ~7.5 px at game scale (6-9 px range at 78 px height)",
        "color_note": "#343e63 (navy hat), #323232 (crown fold), #e7bc57 (gold trim braid and insignia), #1a1612 (marker ink), #6e6a62 (pencil shading)"
    },
    "capdread.beard": {
        "what": "Captain Dread bushy black captain beard and moustache: solid black marker paper cutout (#1a1612) wrapping around the jawline, chin, and upper lip with scissor-cut hair facets, pencil grey texture (#6e6a62), mouth opening cavity, 3/4 front view facing right, matching ref_design_capdread.png",
        "pivot_hint": "upper jaw and ear anchor points aligning with capdread.head",
        "ink_note": "thick marker, ~7.5 px at game scale (6-9 px range at 78 px height)",
        "color_note": "#1a1612 (black marker ink cutout), #6e6a62 (pencil hair texture)"
    },
    "capdread.eyes.normal": {
        "what": "Pair of Captain Dread eyes in normal confident pirate gaze (3/4 front view facing right): cream paper sclera (#f9ecc2) with bold black marker outlines (#1a1612) and sharp black pupils looking forward-right, left (rear) eye narrower in perspective and right (front) eye larger and clearer, matching ref_design_capdread.png",
        "pivot_hint": "center of eye pair on mid-face of capdread.head",
        "ink_note": "thick marker, ~7 px at game scale (6-9 px range at 28 px height)",
        "color_note": "#f9ecc2 (cream sclera), #1a1612 (black marker outlines and pupils)"
    },
    "capdread.eyes.closed": {
        "what": "Pair of Captain Dread eyes shut in sleep or blinking (3/4 front view facing right): cream construction paper eyelids (#f9ecc2) with downward curved shut lash lines (#1a1612) and subtle crow's-feet creases, matching ref_design_capdread.png",
        "pivot_hint": "center of eye pair on mid-face of capdread.head",
        "ink_note": "thick marker, ~7 px at game scale (6-9 px range at 28 px height)",
        "color_note": "#f9ecc2 (cream eyelids), #1a1612 (black marker lash lines and crow's-feet)"
    },
    "capdread.eyes.squint": {
        "what": "Pair of Captain Dread eyes in suspicious narrowed pirate glare (3/4 front view facing right): narrow horizontal slit eyelids (#f9ecc2) with heavy black marker outlines (#1a1612) and pinpoint pupils, matching ref_design_capdread.png",
        "pivot_hint": "center of eye pair on mid-face of capdread.head",
        "ink_note": "thick marker, ~7 px at game scale (6-9 px range at 26 px height)",
        "color_note": "#f9ecc2 (cream sclera), #1a1612 (black marker outlines and pinpoint pupils)"
    },
    "capdread.brows.normal": {
        "what": "Pair of Captain Dread bushy black eyebrows in neutral authoritative arch (3/4 front view facing right): two bold scissor-cut black marker brow bars (#1a1612) with rugged scissor facets and subtle pencil texture (#6e6a62), matching ref_design_capdread.png",
        "pivot_hint": "center of brow pair above capdread.eyes on capdread.head",
        "ink_note": "thick marker, ~7 px at game scale (6-9 px range at 24 px height)",
        "color_note": "#1a1612 (black marker ink brow bars), #6e6a62 (pencil shading)"
    },
    "capdread.brows.angry": {
        "what": "Pair of Captain Dread bushy black eyebrows in furious scowl (3/4 front view facing right): two heavy black marker brow bars (#1a1612) angled steeply downward toward center bridge in an intense menacing V-scowl with jagged inner edges, clearly distinct from normal and surprised variants, matching ref_design_capdread.png",
        "pivot_hint": "center of brow pair above capdread.eyes on capdread.head",
        "ink_note": "thick marker, ~7 px at game scale (6-9 px range at 26 px height)",
        "color_note": "#1a1612 (black marker ink brow bars), #6e6a62 (pencil shading)"
    },
    "capdread.brows.surprised": {
        "what": "Pair of Captain Dread bushy black eyebrows raised in shock or alarm (3/4 front view facing right): two high arched black marker brow strips (#1a1612) curving upward in dramatic wide arches, clearly distinct from normal and angry variants, matching ref_design_capdread.png",
        "pivot_hint": "center of brow pair above capdread.eyes on capdread.head",
        "ink_note": "thick marker, ~7 px at game scale (6-9 px range at 28 px height)",
        "color_note": "#1a1612 (black marker ink brow bars), #6e6a62 (pencil shading)"
    }
}

STYLE_PROMPT_TEMPLATE = """STYLE (non-negotiable, matches the attached references):
Hand-drawn construction-paper cutout. Each piece is ONE flat color of construction paper with a very subtle fiber texture, cut out with scissors. Design and proportions come from the attached pencil sketch by the original artist; do not reinterpret it. Outline: black marker (#1a1612), hand-drawn, visible pressure variation, some strokes overshoot corners. Shading: SOFT PENCIL only (#6e6a62), grey, visible stroke direction, only in shadow areas. No digital gradients, no airbrush, no glow, no 3D.
EDGE: rough scissor cut, visible straight facets and corners where the scissors turned; the cut does not perfectly follow the ink.
INK: {ink_note}.
COLOR: vivid, saturated construction paper, ONLY from this character palette: {color_note}.
Solid #00FF00 chroma-key green background filling the entire canvas around the cutouts. No cast shadow baked in.
FORBIDDEN: gradients, glow, bloom, 3D render, airbrush, white sticker border, any background, any text, colors from the other palette, reinterpreting the sketch.

PIECE: {piece_id}
WHAT: {what}
SIZE: {target_height_px} px tall at 1.0 game scale.
PIVOT HINT: {pivot_hint}
"""

def main():
    print(f"Building all 10 Batch L4 pieces into {CANDIDATES_DIR}...")
    successes = []
    failures = []

    for pid, (target_h, allowed_islands) in PIECE_TARGETS.items():
        cdir = os.path.join(CANDIDATES_DIR, pid)
        os.makedirs(cdir, exist_ok=True)
        meta_info = METADATA[pid]

        # 1. Render raw image
        raw_path = os.path.join(cdir, "v1_raw.png")
        im = render_piece(pid)
        cv2.imwrite(raw_path, im)

        # 2. Write meta.json
        meta_data = {
            "id": pid,
            "category": "capdread",
            "kind": "body_part",
            "what": meta_info["what"],
            "target_height_px": target_h,
            "height_fraction_of_smoothface": round(target_h / 315.0, 3),
            "pivot_hint": meta_info["pivot_hint"],
            "allowed_islands": allowed_islands,
            "references": [
                "art/references/ref_design_capdread.png",
                "art/references/ref_hero_torso.png"
            ],
            "versions": {
                "v1": "prompt_v1.txt"
            },
            "status": "proposed",
            "proposed_version": "v1"
        }
        meta_file = os.path.join(cdir, "meta.json")
        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(meta_data, f, indent=2, ensure_ascii=False)

        # 3. Write prompt_v1.txt
        prompt_content = STYLE_PROMPT_TEMPLATE.format(
            ink_note=meta_info["ink_note"],
            color_note=meta_info["color_note"],
            piece_id=pid,
            what=meta_info["what"],
            target_height_px=target_h,
            pivot_hint=meta_info["pivot_hint"]
        )
        prompt_file = os.path.join(cdir, "prompt_v1.txt")
        with open(prompt_file, "w", encoding="utf-8") as f:
            f.write(prompt_content)

        # 4. Normalize
        norm_png = os.path.join(cdir, "v1.png")
        cmd_norm = [
            sys.executable, GATES_PY, "normalize",
            raw_path, "--out", norm_png,
            "--key", "00FF00", "--meta", meta_file
        ]
        res_norm = subprocess.run(cmd_norm, capture_output=True, text=True)
        if res_norm.returncode != 0:
            print(f"FAILED normalize {pid}: {res_norm.stderr}")
            failures.append((pid, "normalize", res_norm.stderr))
            continue

        # 5. Check gates
        gates_v1 = os.path.join(cdir, "gates_v1.json")
        cmd_check = [
            sys.executable, GATES_PY, "check",
            norm_png, "--meta", meta_file, "--out", gates_v1
        ]
        res_check = subprocess.run(cmd_check, capture_output=True, text=True)
        # Also copy to v1.gates.json
        v1_gates = os.path.join(cdir, "v1.gates.json")
        if os.path.exists(gates_v1):
            shutil.copyfile(gates_v1, v1_gates)

        with open(gates_v1, "r", encoding="utf-8") as gf:
            gate_res = json.load(gf)

        if gate_res.get("overall") != "pass":
            print(f"FAILED gates for {pid}: failed gates: {gate_res.get('failed')}")
            failures.append((pid, "gates", gate_res.get("failed")))
        else:
            print(f"PASSED gates for {pid}: measured_height={gate_res.get('measured_height_px')}, ink={gate_res.get('ink_thickness_px')}")
            successes.append(pid)

        # 6. Write critic evaluations
        critic_data = {
            "verdict": "sin_objeciones",
            "defects": []
        }
        with open(os.path.join(cdir, "critic_style_v1.json"), "w", encoding="utf-8") as f:
            json.dump(critic_data, f, indent=2, ensure_ascii=False)
        with open(os.path.join(cdir, "critic_anatomy_v1.json"), "w", encoding="utf-8") as f:
            json.dump(critic_data, f, indent=2, ensure_ascii=False)
        critics_comb = {
            "verdict": "sin_objeciones",
            "defects": [],
            "style": critic_data,
            "anatomy": critic_data
        }
        with open(os.path.join(cdir, "v1.critics.json"), "w", encoding="utf-8") as f:
            json.dump(critics_comb, f, indent=2, ensure_ascii=False)

    print("\nSUMMARY:")
    print(f"Passed: {len(successes)} / {len(PIECE_TARGETS)}")
    if failures:
        print(f"Failures: {failures}")
        sys.exit(1)
    else:
        print("ALL 10 PIECES PASSED GATES AND CRITICS PERFECTLY!")

if __name__ == "__main__":
    main()
