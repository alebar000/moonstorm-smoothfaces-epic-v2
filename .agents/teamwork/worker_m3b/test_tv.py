import os, json, subprocess
import numpy as np
import cv2
from PIL import Image

os.makedirs('tmp_test', exist_ok=True)
meta = {
    'id': 'z1s3.prop.tv',
    'category': 'z1s3',
    'kind': 'prop',
    'what': 'Retro 1950s CRT television set with antennas',
    'target_height_px': 110,
    'allowed_islands': 0
}
with open('tmp_test/meta.json', 'w') as f:
    json.dump(meta, f)

# Create an image on green background
# Target height is 110. Let's make an image with height 110 (or 220)
W, H = 200, 110
raw = np.full((H + 40, W + 40, 3), [0, 255, 0], dtype=np.uint8)

# Draw TV body: wood cabinet (#605752 = 96, 87, 82)
# In OpenCV, color is BGR or RGB? PIL uses RGB.
# Scenery colors:
# scen_hull_rust: #605752 -> (96, 87, 82)
# scen_wood: #998370 -> (153, 131, 112)
# scen_slate: #728289 -> (114, 130, 137)
# scen_brass: #ab986e -> (171, 152, 110)
# ink_black: #1a1612 -> (26, 22, 18)
# pencil_grey: #6e6a62 -> (110, 106, 98)

x0, y0 = 20, 20
cv2.rectangle(raw, (x0 + 10, y0 + 20), (x0 + W - 10, y0 + H), (96, 87, 82), -1)
# screen: slate
cv2.rectangle(raw, (x0 + 25, y0 + 35), (x0 + W - 50, y0 + H - 15), (114, 130, 137), -1)
# dials: brass
cv2.circle(raw, (x0 + W - 30, y0 + 45), 8, (171, 152, 110), -1)
cv2.circle(raw, (x0 + W - 30, y0 + 70), 8, (171, 152, 110), -1)
# antenna V-shape: iron dark #2a2922
cv2.line(raw, (x0 + W//2 - 20, y0 + 20), (x0 + W//2 - 40, y0), (26, 22, 18), 3)
cv2.line(raw, (x0 + W//2 - 20, y0 + 20), (x0 + W//2, y0), (26, 22, 18), 3)

# Ink outlines
cv2.rectangle(raw, (x0 + 10, y0 + 20), (x0 + W - 10, y0 + H), (26, 22, 18), 3)
cv2.rectangle(raw, (x0 + 25, y0 + 35), (x0 + W - 50, y0 + H - 15), (26, 22, 18), 3)

Image.fromarray(raw).save('tmp_test/v1_raw.png')

cmd1 = 'python pipeline/gates.py normalize tmp_test/v1_raw.png --out tmp_test/v1.png --key 00FF00 --key-tol 60 --meta tmp_test/meta.json'
subprocess.run(cmd1, shell=True, check=True)

cmd2 = 'python pipeline/gates.py check tmp_test/v1.png --meta tmp_test/meta.json --out tmp_test/gates.json'
res = subprocess.run(cmd2, shell=True, capture_output=True, text=True)
print('Gate check result:')
with open('tmp_test/gates.json') as f:
    print(f.read())
