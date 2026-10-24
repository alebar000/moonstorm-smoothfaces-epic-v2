import os
import stat
import shutil
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = r"C:\AntiGravityStuff\Moonstorm2"

def unlock(path):
    if os.path.exists(path):
        os.chmod(path, stat.S_IWRITE | stat.S_IREAD)

def knockout_enclosed_white_islands(path, lum_thresh=232, sat_thresh=22, min_area=40):
    unlock(path)
    img = Image.open(path).convert("RGBA")
    arr = np.array(img)
    r, g, b, a = arr[:, :, 0].astype(int), arr[:, :, 1].astype(int), arr[:, :, 2].astype(int), arr[:, :, 3].astype(int)
    lum = (r + g + b) / 3.0
    sat = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
    white_mask = (a > 0) & (lum >= lum_thresh) & (sat <= sat_thresh)
    labeled, num = ndimage.label(white_mask)
    if num > 0:
        sizes = ndimage.sum(white_mask, labeled, range(1, num + 1))
        for idx, sz in enumerate(sizes, start=1):
            if sz >= min_area:
                region = (labeled == idx)
                # Also feather 1px dilated fringe around the knocked-out hole
                dilated = ndimage.binary_dilation(region, iterations=1)
                fringe = dilated & (~region) & (lum >= 190) & (sat <= 35)
                arr[region, 3] = 0
                arr[fringe, 3] = (arr[fringe, 3] * 0.25).astype(np.uint8)
    out = Image.fromarray(arr)
    out.save(path)
    print(f"Knocked out enclosed white islands in {os.path.basename(path)}")

# 1. Knock out enclosed white triangles inside Z1S1 pedal stations & perpetual machine
for rel in [
    r"art\approved\z1s1\z1s1.prop.pedal_station_intact.png",
    r"art\approved\z1s1\z1s1.prop.pedal_station_broken.png",
    r"art\approved\z1s1\z1s1.prop.perpetual_machine_installed.png",
]:
    knockout_enclosed_white_islands(os.path.join(ROOT, rel), lum_thresh=230, sat_thresh=25, min_area=80)

# 2. Knock out enclosed solid rectangles between the rungs of z1s1.prop.iron_ladder.png and z1s2.prop.iron_ladder.png
for rel in [
    r"art\approved\z1s1\z1s1.prop.iron_ladder.png",
    r"art\approved\z1s2\z1s2.prop.iron_ladder.png",
]:
    p = os.path.join(ROOT, rel)
    if os.path.exists(p):
        unlock(p)
        img = Image.open(p).convert("RGBA")
        arr = np.array(img)
        r, g, b, a = arr[:, :, 0].astype(int), arr[:, :, 1].astype(int), arr[:, :, 2].astype(int), arr[:, :, 3].astype(int)
        lum = (r + g + b) / 3.0
        sat = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
        # In the ladder, the gaps between rungs are light warm grey (lum > 185, sat < 18) in the central x column
        h, w = a.shape
        x_grid = np.broadcast_to(np.arange(w), (h, w))
        gap_mask = (a > 0) & (lum >= 182) & (sat <= 18) & (x_grid > w * 0.14) & (x_grid < w * 0.86)
        labeled, num = ndimage.label(gap_mask)
        for idx in range(1, num + 1):
            region = (labeled == idx)
            if np.sum(region) >= 150:
                dilated = ndimage.binary_dilation(region, iterations=1)
                fringe = dilated & (~region) & (lum >= 150) & (sat <= 24)
                arr[region, 3] = 0
                arr[fringe, 3] = (arr[fringe, 3] * 0.3).astype(np.uint8)
        Image.fromarray(arr).save(p)
        print(f"Knocked out ladder rung gaps in {os.path.basename(p)}")

# 3. Fix troll.eyes.png so it has no cream paper rim around the eye socket (only the eyeballs + brow ridge + dark outline)
eyes_path = os.path.join(ROOT, r"art\approved\z0\troll.eyes.png")
unlock(eyes_path)
e_img = Image.open(eyes_path).convert("RGBA")
e_arr = np.array(e_img)
r, g, b, a = e_arr[:, :, 0].astype(int), e_arr[:, :, 1].astype(int), e_arr[:, :, 2].astype(int), e_arr[:, :, 3].astype(int)
# Erosion of the outer 3px paper border on troll.eyes.png
alpha_mask = a > 20
inner_mask = ndimage.binary_erosion(alpha_mask, iterations=3)
border_ring = alpha_mask & (~inner_mask)
# Knock out the outer cream border ring on troll.eyes.png
e_arr[border_ring, 3] = 0
# Feather 1px inside
feather_ring = inner_mask & (~ndimage.binary_erosion(inner_mask, iterations=1))
e_arr[feather_ring, 3] = (e_arr[feather_ring, 3] * 0.6).astype(np.uint8)
Image.fromarray(e_arr).save(eyes_path)
print("Trimmed cream paper rim from troll.eyes.png")

# Re-composite z0.prop.troll.png from the 6 pieces (without cream rim on eyes)
troll_boxes = [
    ("troll.arm_back.png", 18, 128, 103, 174, True),
    ("troll.legs_feet.png", 68, 224, 128, 142, True),
    ("troll.torso_tunic.png", 52, 104, 151, 202, True),
    ("troll.head_jaw.png", 70, 14, 126, 138, True),
    ("troll.eyes.png", 108, 48, 68, 44, False),
    ("troll.arm_front_club.png", 76, 118, 180, 216, True),
]
canvas = Image.new("RGBA", (264, 372), (0, 0, 0, 0))
for fname, ox, oy, sw, sh, has_shadow in troll_boxes:
    p_img = Image.open(os.path.join(ROOT, "art", "approved", "z0", fname)).convert("RGBA")
    if p_img.size != (sw, sh):
        p_img = p_img.resize((sw, sh), Image.Resampling.LANCZOS)
    if has_shadow:
        alpha = p_img.split()[3]
        sh_img = Image.new("RGBA", p_img.size, (15, 12, 10, 0))
        sh_img.putalpha(alpha.point(lambda p: int(p * 0.42)))
        sh_img = sh_img.filter(ImageFilter.GaussianBlur(1.8))
        canvas.alpha_composite(sh_img, (ox + 3, oy + 3))
    canvas.alpha_composite(p_img, (ox, oy))

bbox = canvas.getbbox()
if bbox:
    canvas = canvas.crop(bbox)
troll_comp_path = os.path.join(ROOT, "art", "approved", "z0", "z0.prop.troll.png")
unlock(troll_comp_path)
canvas.save(troll_comp_path)
print(f"Re-composited z0.prop.troll.png ({canvas.size})")

# Sync updated files to art/candidates
for folder, pid in [
    ("z1s1", "z1s1.prop.pedal_station_intact"),
    ("z1s1", "z1s1.prop.pedal_station_broken"),
    ("z1s1", "z1s1.prop.perpetual_machine_installed"),
    ("z1s1", "z1s1.prop.iron_ladder"),
    ("z1s2", "z1s2.prop.iron_ladder"),
    ("z0", "troll.eyes"),
    ("z0", "z0.prop.troll"),
]:
    src = os.path.join(ROOT, "art", "approved", folder, f"{pid}.png")
    dst = os.path.join(ROOT, "art", "candidates", pid, "v1.png")
    if os.path.exists(os.path.dirname(dst)):
        unlock(dst)
        shutil.copy2(src, dst)
