#!/usr/bin/env python3
"""
verify_pieces.py - Verify all 15 candidate pieces for Worker M3A.
ZERO EM-DASHES across all code, comments, and strings.
"""
import os, json

pieces = [
    'z1s3.wall.panel_b',
    'z1s3.wall.panel_c',
    'z1s3.wall.seam_strip',
    'z1s3.floor.planks_a',
    'z1s3.floor.planks_b',
    'z1s3.ceiling.beam_a',
    'z1s3.ceiling.beam_b',
    'z1s3.wall.door',
    'z1s3.wall.porthole',
    'z1s3.wall.poster',
    'z1s3.wall.mask_a',
    'z1s3.wall.mask_b',
    'z1s3.wall.helm_wheel',
    'z1s3.wall.shelf',
    'z1s3.wall.pipes'
]

root = 'art/candidates'
all_ok = True

print('| Piece ID               | Kind  | Height    | Ink   | Halo   | Pal   | Gates  | Critics       |')
print('|------------------------|-------|-----------|-------|--------|-------|--------|---------------|')

for pid in pieces:
    pdir = os.path.join(root, pid)
    req_files = ['meta.json', 'prompt_v1.txt', 'v1_raw.png', 'v1.png', 'gates_v1.json', 'v1.gates.json', 'critic_style_v1.json', 'critic_anatomy_v1.json', 'v1.critics.json']
    for rf in req_files:
        if not os.path.exists(os.path.join(pdir, rf)):
            print(f'ERROR: missing {rf} in {pid}')
            all_ok = False

    meta = json.load(open(os.path.join(pdir, 'meta.json'), encoding='utf-8'))
    gates = json.load(open(os.path.join(pdir, 'gates_v1.json'), encoding='utf-8'))
    v1_gates = json.load(open(os.path.join(pdir, 'v1.gates.json'), encoding='utf-8'))
    critics = json.load(open(os.path.join(pdir, 'v1.critics.json'), encoding='utf-8'))

    if gates['overall'] != 'pass' or gates['failed'] != []:
        all_ok = False
    if v1_gates['overall'] != 'pass' or v1_gates['failed'] != []:
        all_ok = False
    if critics['style']['verdict'] != 'sin_objeciones' or critics['style']['defects'] != []:
        all_ok = False
    if critics['anatomy']['verdict'] != 'sin_objeciones' or critics['anatomy']['defects'] != []:
        all_ok = False

    ink_val = gates.get('ink_thickness_px', 0.0)
    halo_val = gates.get('halo_fraction', 0.0)
    pal_ok = gates.get('palette_ok', False)
    h_val = gates.get('measured_height_px', 0)
    target_h = gates.get('target_height_px', 0)
    k = meta.get('kind', '')

    print(f'| {pid:22} | {k:5} | {h_val:4}/{target_h:4} | {ink_val:4.1f}p | {halo_val:6.4f} | {"pass" if pal_ok else "fail":5} | {gates["overall"]:6} | {critics["style"]["verdict"]:13} |')

print(f'\nAll 15 pieces complete and passing all requirements: {all_ok}')
