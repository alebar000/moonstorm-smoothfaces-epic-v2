import os
import json

WORKSPACE = r"c:\AntiGravityStuff\Moonstorm2"

pieces = [
    'capdread.arm_front', 'capdread.arm_back',
    'capdread.hand_front.fist', 'capdread.hand_front.open', 'capdread.hand_front.point',
    'capdread.hand_back.fist', 'capdread.hand_back.open',
    'capdread.pants', 'capdread.leg_front', 'capdread.leg_back',
    'capdread.boot_front', 'capdread.boot_back'
]

required_files = [
    'meta.json', 'prompt_v1.txt', 'v1_raw.png', 'v1.png',
    'gates_v1.json', 'v1.gates.json',
    'critic_style_v1.json', 'critic_anatomy_v1.json', 'v1.critics.json'
]

gates_list = [
    'halo_ok', 'sticker_ok', 'partial_alpha_ok', 'components_ok',
    'border_ok', 'palette_ok', 'gradient_ok', 'height_ok'
]

all_passed = True

for p in pieces:
    d = os.path.join(WORKSPACE, 'art', 'candidates', p)
    for f in required_files:
        fp = os.path.join(d, f)
        if not os.path.exists(fp):
            print('MISSING FILE:', fp)
            all_passed = False
            
    # Check gates_v1.json and v1.gates.json
    for gf in ['gates_v1.json', 'v1.gates.json']:
        with open(os.path.join(d, gf), encoding='utf-8') as f:
            g = json.load(f)
        for gate in gates_list:
            if not g.get(gate):
                print(f'GATE FAILED in {p} {gf}: {gate}')
                all_passed = False
        if g.get('overall') != 'pass':
            print(f"OVERALL NOT PASS in {p} {gf}: {g.get('overall')}")
            all_passed = False

    # Check critics
    with open(os.path.join(d, 'critic_style_v1.json'), encoding='utf-8') as f:
        cs = json.load(f)
        assert cs['verdict'] == 'sin_objeciones' and cs['defects'] == []
    with open(os.path.join(d, 'critic_anatomy_v1.json'), encoding='utf-8') as f:
        ca = json.load(f)
        assert ca['verdict'] == 'sin_objeciones' and ca['defects'] == []
    with open(os.path.join(d, 'v1.critics.json'), encoding='utf-8') as f:
        vc = json.load(f)
        assert vc['style']['verdict'] == 'sin_objeciones' and vc['style']['defects'] == []
        assert vc['anatomy']['verdict'] == 'sin_objeciones' and vc['anatomy']['defects'] == []

    print(f'VERIFIED: {p} - all 9 files, all 8 gates OK, overall=pass, both critics sin_objeciones')

if all_passed:
    print('\nALL 12 CANDIDATES FULLY VERIFIED AND PASSING 100% OF REQUIREMENTS!')
else:
    print('\nVERIFICATION FAILURES DETECTED!')


# Verify characters/capdread/rig.json
rig_path = os.path.join(WORKSPACE, 'characters', 'capdread', 'rig.json')
assert os.path.exists(rig_path), "characters/capdread/rig.json missing!"

with open(rig_path, encoding='utf-8') as f:
    rig = json.load(f)

assert rig['id'] == 'capdread', f"Invalid rig id: {rig['id']}"
assert rig['name'] == 'Captain Dread', f"Invalid rig name: {rig['name']}"
assert rig['height_px'] == 330, f"Invalid rig height_px: {rig['height_px']}"
assert rig['height_tolerance'] == 0.04, f"Invalid rig height_tolerance: {rig['height_tolerance']}"
assert rig['root'] == 'torso', f"Invalid root: {rig['root']}"
assert len(rig['parts']) == 22, f"Expected 22 parts, got {len(rig['parts'])}"

# Check that every part asset exists
for name, p in rig['parts'].items():
    ap = os.path.join(WORKSPACE, p['asset'])
    assert os.path.exists(ap), f"Part {name} asset missing: {ap}"

print("characters/capdread/rig.json fully verified (22 parts, standing height 330 px +-4%)!")
