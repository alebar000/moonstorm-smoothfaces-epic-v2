import os
import sys
import json
import subprocess

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

print(f'Running independent gates verification across {len(new_candidates)} candidates...')

mismatches = []
gate_failures = []
critic_failures = []

expected_gates = [
    'halo_ok', 'sticker_ok', 'partial_alpha_ok', 'components_ok',
    'border_ok', 'palette_ok', 'gradient_ok', 'height_ok'
]

for idx, cid in enumerate(new_candidates):
    cdir = os.path.join(cand_base, cid)
    v1_png = os.path.join(cdir, 'v1.png')
    meta_json = os.path.join(cdir, 'meta.json')
    gates_v1_path = os.path.join(cdir, 'gates_v1.json')
    v1_gates_path = os.path.join(cdir, 'v1.gates.json')
    
    # Run gates.py check
    cmd = [sys.executable, os.path.join(root, 'pipeline', 'gates.py'), 'check', v1_png, '--meta', meta_json]
    res = subprocess.run(cmd, cwd=root, capture_output=True, text=True)
    if res.returncode != 0:
        gate_failures.append(f'{cid}: gates.py returned code {res.returncode}. Stderr: {res.stderr.strip()}')
        continue
    
    try:
        live_result = json.loads(res.stdout)
    except Exception as e:
        gate_failures.append(f'{cid}: failed to parse gates.py output as json: {e}. Raw: {res.stdout[:100]}')
        continue
        
    # Check that all gates are True
    for g in expected_gates:
        if live_result.get(g) is not True:
            gate_failures.append(f'{cid}: gate {g} is {live_result.get(g)} != True')
    
    # Check stored gates_v1.json
    try:
        with open(gates_v1_path, 'r', encoding='utf-8') as fp:
            stored_gates_v1 = json.load(fp)
        for g in expected_gates:
            if stored_gates_v1.get(g) != live_result.get(g):
                mismatches.append(f'{cid}: gates_v1.json {g}={stored_gates_v1.get(g)} != live {live_result.get(g)}')
    except Exception as e:
        mismatches.append(f'{cid}: error reading gates_v1.json: {e}')
        
    # Check stored v1.gates.json
    try:
        with open(v1_gates_path, 'r', encoding='utf-8') as fp:
            stored_v1_gates = json.load(fp)
        for g in expected_gates:
            if stored_v1_gates.get(g) != live_result.get(g):
                mismatches.append(f'{cid}: v1.gates.json {g}={stored_v1_gates.get(g)} != live {live_result.get(g)}')
    except Exception as e:
        mismatches.append(f'{cid}: error reading v1.gates.json: {e}')
        
    # Check critics
    c_style_path = os.path.join(cdir, 'critic_style_v1.json')
    c_anat_path = os.path.join(cdir, 'critic_anatomy_v1.json')
    v1_critics_path = os.path.join(cdir, 'v1.critics.json')
    
    try:
        with open(c_style_path, 'r', encoding='utf-8') as fp:
            cs = json.load(fp)
        if cs.get('verdict') != 'sin_objeciones':
            critic_failures.append(f'{cid}: critic_style verdict is {cs.get("verdict")}')
    except Exception as e:
        critic_failures.append(f'{cid}: error reading critic_style: {e}')
        
    try:
        with open(c_anat_path, 'r', encoding='utf-8') as fp:
            ca = json.load(fp)
        if ca.get('verdict') != 'sin_objeciones':
            critic_failures.append(f'{cid}: critic_anatomy verdict is {ca.get("verdict")}')
    except Exception as e:
        critic_failures.append(f'{cid}: error reading critic_anatomy: {e}')
        
    try:
        with open(v1_critics_path, 'r', encoding='utf-8') as fp:
            vc = json.load(fp)
        # Verify combined
        if 'style' in vc and vc['style'].get('verdict') != 'sin_objeciones':
            critic_failures.append(f'{cid}: v1.critics style verdict is {vc["style"].get("verdict")}')
        if 'anatomy' in vc and vc['anatomy'].get('verdict') != 'sin_objeciones':
            critic_failures.append(f'{cid}: v1.critics anatomy verdict is {vc["anatomy"].get("verdict")}')
    except Exception as e:
        critic_failures.append(f'{cid}: error reading v1.critics.json: {e}')

print(f'\nIndependent gates check complete:')
print(f'  Gate failures (live gates.py check failed): {len(gate_failures)}')
print(f'  Mismatches (live vs stored json): {len(mismatches)}')
print(f'  Critic verdict failures: {len(critic_failures)}')

if gate_failures:
    for f in gate_failures[:10]:
        print('  GATE FAIL:', f)
if mismatches:
    for m in mismatches[:10]:
        print('  MISMATCH:', m)
if critic_failures:
    for c in critic_failures[:10]:
        print('  CRITIC FAIL:', c)
