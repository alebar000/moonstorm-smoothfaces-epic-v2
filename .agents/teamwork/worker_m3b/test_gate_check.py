import os, json, subprocess
from PIL import Image

src_img = r'C:\Users\alexb\.gemini\antigravity\brain\fe8bb240-0e51-4e2c-b52a-1c25a301be44\test_desk_1792711207221.jpg'
os.makedirs('tmp_test', exist_ok=True)
meta = {
    'id': 'z1s3.prop.desk',
    'category': 'z1s3',
    'kind': 'prop',
    'what': 'Heavy dark-wood rolltop/double-pedestal desk',
    'target_height_px': 173,
    'allowed_islands': 0
}
with open('tmp_test/meta.json', 'w') as f:
    json.dump(meta, f)

# Normalize
cmd = f'python pipeline/gates.py normalize "{src_img}" --out tmp_test/v1.png --key 00FF00 --key-tol 60 --meta tmp_test/meta.json'
res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
print('normalize output:', res.stdout, res.stderr)

# Check
cmd2 = 'python pipeline/gates.py check tmp_test/v1.png --meta tmp_test/meta.json --out tmp_test/gates.json'
res2 = subprocess.run(cmd2, shell=True, capture_output=True, text=True)
print('check output:', res2.stdout, res2.stderr)
if os.path.exists('tmp_test/gates.json'):
    with open('tmp_test/gates.json') as f:
        print(f.read())
