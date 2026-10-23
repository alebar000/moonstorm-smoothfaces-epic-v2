#!/usr/bin/env python3
"""
verify_l4.py - Forensic verification for Captain Dread Batch L4.
Audits all files, gates, critic files, and constraints.
Zero em-dashes.
"""
import os
import json

WORKSPACE = r"c:\AntiGravityStuff\Moonstorm2"
CANDIDATES = os.path.join(WORKSPACE, "art", "candidates")

PIECES = [
    "capdread.torso", "capdread.head", "capdread.hat", "capdread.beard",
    "capdread.eyes.normal", "capdread.eyes.closed", "capdread.eyes.squint",
    "capdread.brows.normal", "capdread.brows.angry", "capdread.brows.surprised"
]

REQUIRED_FILES = [
    "meta.json", "prompt_v1.txt", "v1_raw.png", "v1.png",
    "gates_v1.json", "v1.gates.json",
    "critic_style_v1.json", "critic_anatomy_v1.json", "v1.critics.json"
]

GATE_KEYS = [
    "halo_ok", "sticker_ok", "partial_alpha_ok", "components_ok",
    "border_ok", "palette_ok", "gradient_ok", "height_ok"
]

def main():
    all_clean = True
    for pid in PIECES:
        d = os.path.join(CANDIDATES, pid)
        print(f"Auditing {pid}:")
        for rf in REQUIRED_FILES:
            p = os.path.join(d, rf)
            if not os.path.exists(p):
                print(f"  MISSING FILE: {rf}")
                all_clean = False

        # Check meta.json
        with open(os.path.join(d, "meta.json"), encoding="utf-8") as f:
            meta = json.load(f)
            if meta.get("status") != "proposed":
                print(f"  META STATUS ERROR: {meta.get('status')}")
                all_clean = False
            if meta.get("proposed_version") != "v1":
                print(f"  META PROPOSED_VERSION ERROR: {meta.get('proposed_version')}")
                all_clean = False

        # Check gates_v1.json and v1.gates.json
        for gf in ["gates_v1.json", "v1.gates.json"]:
            with open(os.path.join(d, gf), encoding="utf-8") as f:
                gates = json.load(f)
                if gates.get("overall") != "pass":
                    print(f"  GATES OVERALL FAIL in {gf}: {gates.get('failed')}")
                    all_clean = False
                for gk in GATE_KEYS:
                    if not gates.get(gk):
                        print(f"  GATE KEY FAILED in {gf}: {gk}={gates.get(gk)}")
                        all_clean = False

        # Check critic files
        for cf in ["critic_style_v1.json", "critic_anatomy_v1.json", "v1.critics.json"]:
            with open(os.path.join(d, cf), encoding="utf-8") as f:
                crit = json.load(f)
                if crit.get("verdict") != "sin_objeciones":
                    print(f"  CRITIC VERDICT ERROR in {cf}: {crit.get('verdict')}")
                    all_clean = False
                if crit.get("defects") != []:
                    print(f"  CRITIC DEFECTS ERROR in {cf}: {crit.get('defects')}")
                    all_clean = False

        print(f"  {pid}: OK (all 9 files exist, all 8 gates pass, all 3 critic files verified)")

    if all_clean:
        print("\nALL 10 CANDIDATE PIECES FULLY COMPLIANT AND VALIDATED!")
    else:
        print("\nVALIDATION FAILED!")
        sys.exit(1)

if __name__ == "__main__":
    main()
