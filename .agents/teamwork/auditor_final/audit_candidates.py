import os
import sys
import json
import subprocess
from PIL import Image
import numpy as np

root = r'c:\AntiGravityStuff\Moonstorm2'
cand_base = os.path.join(root, 'art', 'candidates')

new_candidates = [
    # L2 remainder + L3
    'smoothface.hand_back.point',
    'smoothface.emotion.sweat_drop', 'smoothface.emotion.anger_vein', 'smoothface.emotion.question_mark', 'smoothface.emotion.exclamation', 'smoothface.emotion.idea_bulb',
    'smoothface.prop.magnifying_glass', 'smoothface.prop.skeleton_key',
    # L4
    'capdread.torso', 'capdread.head', 'capdread.hat', 'capdread.beard',
    'capdread.eyes.normal', 'capdread.eyes.closed', 'capdread.eyes.squint',
    'capdread.brows.normal', 'capdread.brows.angry', 'capdread.brows.surprised',
    # L5
    'capdread.arm_front', 'capdread.arm_back',
    'capdread.hand_front.fist', 'capdread.hand_front.open', 'capdread.hand_front.point',
    'capdread.hand_back.fist', 'capdread.hand_back.open',
    'capdread.pants', 'capdread.leg_front', 'capdread.leg_back',
    'capdread.boot_front', 'capdread.boot_back',
    # L6
    'z1s3.wall.panel_b', 'z1s3.wall.panel_c', 'z1s3.wall.seam_strip',
    'z1s3.floor.planks_a', 'z1s3.floor.planks_b', 'z1s3.ceiling.beam_a', 'z1s3.ceiling.beam_b',
    # L7
    'z1s3.wall.door', 'z1s3.wall.porthole', 'z1s3.wall.poster', 'z1s3.wall.mask_a', 'z1s3.wall.mask_b', 'z1s3.wall.helm_wheel', 'z1s3.wall.shelf', 'z1s3.wall.pipes',
    # L8
    'z1s3.prop.desk', 'z1s3.prop.tv', 'z1s3.prop.fishbowl', 'z1s3.prop.coat_rack', 'z1s3.prop.coat', 'z1s3.prop.hat',
    # L9
    'z1s3.prop.bed', 'z1s3.prop.nightstand', 'z1s3.prop.lamp', 'z1s3.prop.easel_portrait', 'z1s3.prop.hammer_bag', 'z1s3.prop.glue', 'z1s3.prop.dirty_laundry',
    # L10
    'z1s3.fg.card_table', 'z1s3.fg.ship_in_bottle', 'z1s3.fg.chest', 'z1s3.fg.clown_bust', 'z1s3.fg.voodoo_doll', 'z1s3.fg.hull_rib_left', 'z1s3.fg.hull_rib_right'
]

print(f'Total candidates to verify: {len(new_candidates)}')

errors = []
image_stats = []

required_files = [
    'meta.json',
    'prompt_v1.txt',
    'v1_raw.png',
    'v1.png',
    'gates_v1.json',
    'v1.gates.json',
    'critic_style_v1.json',
    'critic_anatomy_v1.json',
    'v1.critics.json'
]

for cid in new_candidates:
    cdir = os.path.join(cand_base, cid)
    if not os.path.isdir(cdir):
        errors.append(f'Missing candidate directory: {cid}')
        continue
    
    # 1. Check required files
    for rf in required_files:
        rfp = os.path.join(cdir, rf)
        if not os.path.isfile(rfp):
            errors.append(f'{cid}: missing file {rf}')
    
    # 2. Check meta.json
    meta_path = os.path.join(cdir, 'meta.json')
    try:
        with open(meta_path, 'r', encoding='utf-8') as fp:
            meta = json.load(fp)
        if meta.get('status') != 'proposed':
            errors.append(f'{cid}: meta.status is {meta.get("status")} != proposed')
        if meta.get('proposed_version') != 'v1':
            errors.append(f'{cid}: meta.proposed_version is {meta.get("proposed_version")} != v1')
    except Exception as e:
        errors.append(f'{cid}: error reading meta.json: {e}')

    # 3. Check v1_raw.png and v1.png
    v1_raw_path = os.path.join(cdir, 'v1_raw.png')
    v1_path = os.path.join(cdir, 'v1.png')
    
    try:
        raw_img = Image.open(v1_raw_path)
        raw_arr = np.array(raw_img)
        if raw_arr.size == 0 or raw_arr.std() < 1.0:
            errors.append(f'{cid}: v1_raw.png has near zero variance / blank')
    except Exception as e:
        errors.append(f'{cid}: error loading v1_raw.png: {e}')
        
    try:
        img = Image.open(v1_path)
        if img.mode != 'RGBA':
            errors.append(f'{cid}: v1.png mode is {img.mode} != RGBA')
        arr = np.array(img)
        alpha = arr[:, :, 3]
        opaque_count = np.sum(alpha > 0)
        total_pixels = alpha.size
        alpha_ratio = opaque_count / total_pixels
        
        # Genuine cutout should have both transparent and non-transparent pixels (unless full screen wall panel)
        if opaque_count == 0:
            errors.append(f'{cid}: v1.png is completely transparent (empty)')
        
        # Check std deviation of RGB channels on non-transparent pixels
        rgb = arr[:, :, :3]
        mask = alpha > 0
        if np.any(mask):
            rgb_std = np.std(rgb[mask])
            if rgb_std < 0.5:
                errors.append(f'{cid}: v1.png has near zero color variance on visible pixels ({rgb_std})')
            image_stats.append((cid, img.size, alpha_ratio, float(rgb_std)))
    except Exception as e:
        errors.append(f'{cid}: error loading v1.png: {e}')

print(f'Verification of files and images complete. Errors found: {len(errors)}')
for err in errors[:20]:
    print('  ERROR:', err)

print('\nSample image stats (first 5 candidates):')
for stat in image_stats[:5]:
    print(f'  {stat[0]}: size={stat[1]}, visible_ratio={stat[2]:.2f}, rgb_std={stat[3]:.1f}')
