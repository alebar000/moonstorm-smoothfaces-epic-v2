import os, sys, json

PIECES = [
    # L8
    'z1s3.prop.desk',
    'z1s3.prop.tv',
    'z1s3.prop.fishbowl',
    'z1s3.prop.coat_rack',
    'z1s3.prop.coat',
    'z1s3.prop.hat',
    # L9
    'z1s3.prop.bed',
    'z1s3.prop.nightstand',
    'z1s3.prop.lamp',
    'z1s3.prop.easel_portrait',
    'z1s3.prop.hammer_bag',
    'z1s3.prop.glue',
    'z1s3.prop.dirty_laundry',
    # L10
    'z1s3.fg.card_table',
    'z1s3.fg.ship_in_bottle',
    'z1s3.fg.chest',
    'z1s3.fg.clown_bust',
    'z1s3.fg.voodoo_doll',
    'z1s3.fg.hull_rib_left',
    'z1s3.fg.hull_rib_right'
]

REQUIRED_FILES = [
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

GATES_TO_CHECK = [
    'halo_ok',
    'sticker_ok',
    'partial_alpha_ok',
    'components_ok',
    'border_ok',
    'palette_ok',
    'ink_ok',
    'gradient_ok',
    'height_ok'
]

errors = []

for pid in PIECES:
    cdir = os.path.join('art', 'candidates', pid)
    if not os.path.isdir(cdir):
        errors.append(f'{pid}: candidate directory missing')
        continue
        
    for rf in REQUIRED_FILES:
        fp = os.path.join(cdir, rf)
        if not os.path.isfile(fp):
            errors.append(f'{pid}: missing file {rf}')
            
    # Check meta.json
    try:
        with open(os.path.join(cdir, 'meta.json'), 'r', encoding='utf-8') as f:
            meta = json.load(f)
        if meta.get('status') != 'proposed':
            errors.append(f'{pid}: meta.json status is not proposed')
        if meta.get('proposed_version') != 'v1':
            errors.append(f'{pid}: meta.json proposed_version is not v1')
        if meta.get('category') != 'z1s3':
            errors.append(f'{pid}: meta.json category is not z1s3')
    except Exception as e:
        errors.append(f'{pid}: meta.json read error: {e}')
        
    # Check gates_v1.json and v1.gates.json
    for gf in ['gates_v1.json', 'v1.gates.json']:
        try:
            with open(os.path.join(cdir, gf), 'r', encoding='utf-8') as f:
                gates = json.load(f)
            if gates.get('overall') != 'pass':
                errors.append(f'{pid}: {gf} overall is not pass ({gates.get("overall")})')
            if gates.get('failed') != []:
                errors.append(f'{pid}: {gf} failed list is not empty ({gates.get("failed")})')
            for g in GATES_TO_CHECK:
                if gates.get(g) is not True:
                    errors.append(f'{pid}: {gf} gate {g} is not True ({gates.get(g)})')
        except Exception as e:
            errors.append(f'{pid}: {gf} read error: {e}')
            
    # Check critics
    for cf in ['critic_style_v1.json', 'critic_anatomy_v1.json']:
        try:
            with open(os.path.join(cdir, cf), 'r', encoding='utf-8') as f:
                crit = json.load(f)
            if crit.get('verdict') != 'sin_objeciones':
                errors.append(f'{pid}: {cf} verdict is not sin_objeciones')
            if crit.get('defects') != []:
                errors.append(f'{pid}: {cf} defects is not empty')
        except Exception as e:
            errors.append(f'{pid}: {cf} read error: {e}')
            
    try:
        with open(os.path.join(cdir, 'v1.critics.json'), 'r', encoding='utf-8') as f:
            comb = json.load(f)
        if comb.get('overall') != 'sin_objeciones':
            errors.append(f'{pid}: v1.critics.json overall is not sin_objeciones')
    except Exception as e:
        errors.append(f'{pid}: v1.critics.json read error: {e}')

print(f'Verification finished. Total errors: {len(errors)}')
if errors:
    for e in errors:
        print('  ERROR:', e)
    sys.exit(1)
else:
    print('ALL 20 PIECES FULLY VERIFIED AND PASSING 100% OF CHECKS!')
