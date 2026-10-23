# Survey Pipeline Report: Moonstorm2 Asset Pipeline, Gates, References, and Candidate Standards

Date: 2026-10-22
Investigator: Explorer Survey 1
Integrity Mode: Development / Read-Only Investigation
Working Directory: c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\explorer_survey_1

---

## 1. Executive Summary

This report documents the asset pipeline, automatic quality gates, reference assets, approved manifests, and candidate directory specifications in `c:\AntiGravityStuff\Moonstorm2`.

The project implements a 2D cut-out paper adventure aesthetic ("Smoothface's Epic", Slice 1: Z1S3 Captain Dread's Cabin) inspired by Aguilar's 2010 pencil sketches and Morales's cut-out paper layers. The asset generation workflow relies on deterministic programmatic gates (`pipeline/gates.py`), dual calibrated adversarial vision critics (`style-critic` and `anatomy-critic`), and human director approval recorded in `review/review.json` and manifested in `art/approved/MANIFEST.json`.

---

## 2. Programmatic Pipeline: `pipeline/gates.py`

### 2.1 Overview and Execution Model
- File Location: `c:\AntiGravityStuff\Moonstorm2\pipeline\gates.py` (360 lines).
- Dependencies: `python` (>=3.8), `numpy`, `Pillow` (PIL), and `opencv-python` (`cv2`). Verified present in system environment (`numpy 2.4.6`, `Pillow 12.2.0`, `OpenCV 4.13.0`).
- Exit Codes:
  - Exit code `0`: Pass / Success.
  - Exit code `2`: Fail / Rejection (overall == 'fail').
- Subcommands:
  1. `normalize`: Chroma-key background removal, alpha bounding-box cropping, optional Lanczos rescaling to target height, and proportional margin padding.
  2. `check`: Strict binary image evaluation across 8 programmatic quality gates; outputs pass/fail JSON.
  3. `layout`: Verifies room layout definitions (`layout/<room>.layout.json`) against the approved manifest, checks viewport boundaries, and flags hotspot overlaps > 30%.

---

### 2.2 Subcommand Details: `normalize`
- Syntax:
  ```bash
  python pipeline/gates.py normalize <src> --out <out> [--key <HEX>] [--key-tol <INT>] [--meta <PATH>] [--margin <FLOAT>]
  ```
- Parameters:
  - `src` (positional): Source raw image path (typically `vN_raw.png`).
  - `--out` (required): Target destination path for cleaned image (typically `vN.png`).
  - `--key` (optional string): Hexadecimal chroma key color without `#` (typically `00FF00` for pure green).
  - `--key-tol` (optional integer, default `60`): Color distance tolerance for background keying.
  - `--meta` (optional path): Path to candidate `meta.json` containing `target_height_px`.
  - `--margin` (optional float, default `0.08`): Padding margin fraction added to all borders.
- Internal Processing Sequence:
  1. Chroma-Keying & Despill: If `--key` is specified, computes Manhattan distance in RGB space `dist = sum(|RGB - Key|)`. Pixels below `key_tol` become transparent via smooth alpha transition `alpha = clip((dist - key_tol) / 24.0, 0, 1)`. Semi-transparent pixels undergo despill: the dominant key color channel is clamped to the mean of the other two channels to eliminate green fringe.
  2. Alpha Cropping: Finds bounding box `[y0:y1, x0:x1]` where `alpha > 8`. If no pixels qualify, exits with error.
  3. Lanczos Rescaling: If `target_height_px` is specified in `meta.json`, calculates aspect-ratio-preserving scale `s = target_h / h`, computes new width `new_w = round(crop_width * s)`, and resizes via `Image.LANCZOS`.
  4. Padding: Adds uniform border padding of `pad = round(max(cropped_width, cropped_height) * margin)` transparent pixels on all four sides.

---

### 2.3 Subcommand Details: `check`
- Syntax:
  ```bash
  python pipeline/gates.py check <src> [--meta <PATH>] [--out <PATH>]
  ```
- Parameters:
  - `src` (positional): Target PNG image path (e.g. `vN.png`).
  - `--meta` (optional path): Candidate `meta.json`.
  - `--out` (optional path): Custom path for the output gate JSON. Defaults to `<src_without_ext>.gates.json`.
- Configuration Inputs:
  - `pipeline/rules.json`: Ink thresholds, halo thresholds, sticker thresholds, gradient thresholds.
  - `pipeline/palette.json`: Color definitions and delta E limits.
  - `pipeline/heights.json`: Reference character height and relative scale tolerances.

- Gate Checks Executed (8 programmatic gates):
  1. `halo_ok` (`gate_alpha_and_halo`):
     - Dilation ring around opaque silhouette (`alpha > 128`) using 2 iterations of 3x3 kernel minus opaque area.
     - Measures perimeter pixels with `alpha > 0` and luminance > `halo_lum` (`225`).
     - Pass condition: `halo_fraction <= halo_max` (`0.003`, or 0.3%).
  2. `sticker_ok` (`gate_alpha_and_halo`):
     - Outer edge band of silhouette: `opaque & ~erode(opaque, 3 iterations)`.
     - Measures edge pixels with luminance > `halo_lum` (`225`).
     - Pass condition: `sticker_border_fraction <= sticker_max` (`0.15`, or 15%). Prevents white sticker borders.
  3. `partial_alpha_ok` (`gate_alpha_and_halo`):
     - Deep interior of silhouette: `erode(opaque, 3 iterations)`.
     - Stray semi-transparent pixels: `(0 < alpha < 255) & inner`.
     - Pass condition: `stray_partial_alpha == 0`. Prevents semi-transparent holes/spots inside solid cutouts.
  4. `components_ok` (`gate_components`):
     - Connected component analysis using `cv2.connectedComponentsWithStats` on `alpha > 128`.
     - Significant islands: area fraction `>= 0.0005` (excluding background and primary shape).
     - Specks: area fraction `< 0.0005`.
     - Pass condition: `len(islands) <= allowed_islands` (from `meta.json`, default `0`) AND `len(specks) == 0`.
  5. `border_ok` (`gate_cropped_by_border`):
     - Evaluates outermost 1-pixel boundary rows and columns on all four sides.
     - Pass condition: `touches_border_sides == 0` (opaque pixels must never touch image frame).
  6. `palette_ok` (`gate_palette`):
     - Samples up to 60,000 opaque pixels (`alpha > 200`).
     - Maps `kind` to palette:
       - `body_part`, `emotion` -> `characters` palette.
       - `prop`, `wall`, `floor`, `foreground`, `ui` -> `scenery` palette.
       - Both include common colors (`ink_black` `#1a1612`, `pencil_grey` `#6e6a62`).
     - Converts RGB to CIE Lab (CIE76 approximation) and finds minimum Euclidean distance to allowed palette entries.
     - Measures fraction of pixels where min Delta E > `delta_e_tolerance` (`18`).
     - Pass condition: `off_palette_fraction <= max_off_palette_fraction` (`0.08`, or 8%). If palette is marked `"provisional"`, gate reports but does not fail. Since status is `"approved"`, this is strictly enforced.
  7. `ink_ok` (`gate_ink_thickness`):
     - Identifies ink pixels: opaque, luminance < `ink_lum` (`50`), and chroma < `ink_chroma` (`45`).
     - Minimum 50 ink pixels required.
     - Computes distance transform (`cv2.DIST_L2`) and identifies ridge skeleton.
     - Median ridge thickness multiplied by 2 gives measured line thickness.
     - Allowed thickness range by `kind` from `rules.json`:
       - `body_part`: [6, 9] px
       - `emotion`: [6, 9] px
       - `foreground`: [6, 9] px
       - `prop`: [4, 7] px
       - `floor`: [4, 7] px
       - `ui`: [4, 7] px
       - `wall`: [3, 5] px
     - Note: While measured and recorded in gates JSON, `ORIGINAL_REQUEST.md` (line 51) specifically mandates passing `halo_ok`, `sticker_ok`, `partial_alpha_ok`, `components_ok`, `border_ok`, `palette_ok`, `gradient_ok`, and `height_ok`.
  8. `gradient_ok` (`gate_gradients`):
     - Gaussian blur (sigma=1.0) and Sobel gradient magnitude on opaque pixels.
     - Measures fraction of pixels with soft gradient `6 < mag < 40`.
     - Pass condition: `soft_gradient_fraction <= grad_max` (`0.40`, or 40%). Catches heavy digital airbrushing while allowing hand pencil hatching.
  9. `height_ok` (`gate_height`):
     - Measures bounding box height of opaque pixels.
     - Compares to `target_height_px` (or `height_fraction_of_smoothface * 315 px`).
     - Pass condition: `abs(measured - target) / target <= tolerance` (`0.04`, or ±4%).

---

### 2.4 Subcommand Details: `layout`
- Syntax:
  ```bash
  python pipeline/gates.py layout <src> [--root <PATH>]
  ```
- Validates room layout JSON (e.g. `layout/z1s3.layout.json`).
- Checks that all referenced assets exist in `art/approved/MANIFEST.json` or on disk.
- Computes bounding rectangles based on anchor (`bottom-center`, `top-left`, `center`) and scale.
- Warns if interactive floor objects are out of 2400x900 room boundaries.
- Warns if interactive hotspot bounding boxes overlap by more than 30%.

---

## 3. Pipeline Specifications: `palette.json` and `heights.json`

### 3.1 Color Palette (`pipeline/palette.json`)
- Status: `"approved"` (approved by director Alex in batch P0).
- Delta E Tolerance: `18` (CIE76 Lab distance).
- Max Off-Palette Fraction: `0.08` (8%).
- Common Palette (shared across all kinds):
  - `ink_black`: `#1a1612` (dark, warm marker outline)
  - `pencil_grey`: `#6e6a62` (pencil shading)
- Characters Palette (`kind: body_part`, `kind: emotion`):
  - 4 Canon Smoothface colors:
    - `sf_skin_cream`: `#f9ecc2`
    - `sf_coat_grey`: `#323232`
    - `sf_pants_grey`: `#717171`
    - `sf_shoe_black`: `#000000`
  - 8 Aguilar sketch colors (+10% saturation boost):
    - `char_brown`: `#613e35`
    - `char_blue`: `#004b81`
    - `char_navy`: `#343e63`
    - `char_crimson`: `#9e1507`
    - `char_ochre`: `#9c793a`
    - `char_gold`: `#e7bc57`
    - `char_green`: `#0c7a27`
    - `char_slate`: `#848aa4`
- Scenery Palette (`kind: prop`, `wall`, `floor`, `foreground`, `ui`):
  - 12 muted colors derived from 2010 Z1S3 captain room art ($S \le 0.42$):
    - `scen_brass`: `#ab986e`
    - `scen_brick_red`: `#9c5a5c`
    - `scen_sky_blue`: `#95b3d4`
    - `scen_iron_dark`: `#2a2922`
    - `scen_hull_rust`: `#605752`
    - `scen_warm_sand`: `#c6a787`
    - `scen_slate`: `#728289`
    - `scen_wood`: `#998370`
    - `scen_navy`: `#4a697f`
    - `scen_coral`: `#d67c7c`
    - `scen_yellow`: `#d6d27c`
    - `scen_cream`: `#cbc2c2`

### 3.2 Heights Specification (`pipeline/heights.json`)
- Baseline Viewport: `1600 x 900` pixels. Rooms are `2400 x 900` pixels.
- Reference Character: `"smoothface"` = `315 px` (exactly 35% of 900 px viewport height).
- Character Standing Heights (sole of feet to crown of head, excluding hats):
  - `smoothface`: 315 px
  - `capdread`: 330 px (taller and broader pirate captain)
  - `ababy`: 270 px (short and wide)
  - `nihongo`: 300 px
  - `ventriloquist`: 340 px (tall and thin)
- Tolerance: `0.04` (±4%).

---

## 4. Approved Manifest: `art/approved/MANIFEST.json`

### 4.1 Manifest Structure
The manifest tracks all officially accepted assets that have been reviewed and approved:
```json
{
  "pieces": {
    "<piece_id>": {
      "path": "art/approved/<category>/<piece_id>.png",
      "version": "vN",
      "sha256": "64-character-hex-hash",
      "category": "<category>",
      "kind": "<kind>",
      "meta": "art/candidates/<piece_id>/meta.json",
      "approved_at": "<ISO-timestamp>",
      "reason": "<approval-comment>"
    }
  },
  "superseded": [],
  "applied_reviews": [
    "<id>@<version>@<verdict>@<timestamp>"
  ]
}
```

### 4.2 Approved Assets Inventory (24 total approved pieces)
1. Palette Swatches (2 pieces):
   - `palette.characters` (v1) -> `art/approved/palette/palette.characters.png`
   - `palette.scenery` (v3) -> `art/approved/palette/palette.scenery.png`
2. Mr. Smoothface Rig Components (20 pieces):
   - `smoothface.torso` (v3)
   - `smoothface.head` (v3)
   - `smoothface.brows.normal` (v3)
   - `smoothface.brows.angry` (v3)
   - `smoothface.brows.surprised` (v1)
   - `smoothface.eyes.normal` (v3)
   - `smoothface.eyes.closed` (v3)
   - `smoothface.eyes.squint` (v3)
   - `smoothface.arm_front` (v3)
   - `smoothface.arm_back` (v4)
   - `smoothface.hand_front.fist` (v3)
   - `smoothface.hand_front.open` (v4)
   - `smoothface.hand_front.point` (v4)
   - `smoothface.hand_back.fist` (v2)
   - `smoothface.hand_back.open` (v3)
   - `smoothface.pants` (v3)
   - `smoothface.leg_front` (v3)
   - `smoothface.leg_back` (v2)
   - `smoothface.shoe_front` (v5)
   - `smoothface.shoe_back` (v5)
3. Z1S3 Scenery Components (2 pieces):
   - `z1s3.wall.panel_a` (v3) -> `art/approved/z1s3/z1s3.wall.panel_a.png`
   - `z1s3.prop.sarcophagus` (v3) -> `art/approved/z1s3/z1s3.prop.sarcophagus.png`

### 4.3 Missing Smoothface Piece
To fully complete Mr. Smoothface's rig for L2 closure, exactly ONE hand piece is missing:
- `smoothface.hand_back.point` (anatomical left hand pointing 3/4 right, palmar view, 5 digits).
Canonical notes: Smoothface has NO mouth pieces (`smoothface.mouth.*` is rejected per canon; mouth is permanently covered by coat collar) and NO hair tuft (`smoothface.hair_tuft` is omitted; Rupert is completely bald).

---

## 5. Visual Reference Materials: `art/references/`

The `art/references/` directory contains 7 primary reference images and 1 subfolder of original PSD cutout layers:

| Filename | Dimensions / Type | Description and Role in Pipeline |
|---|---|---|
| `ref_design_smoothface.png` | 37.5 KB PNG | Original 2010 pencil sketch by Aguilar (from LolDemo1 smoothsplash.png). Defines proportions, bald head shape, high trench coat collar, and 3/4 right-facing stance. Attached whenever generating Smoothface parts. |
| `ref_design_capdread.png` | 85.9 KB PNG | Original 2010 concept sketch of Captain Dread (`capdread001.png`). Shows tricorn hat, bushy dark beard, trench coat, peg leg/boots, and stout pirate proportions. Attached whenever generating Captain Dread parts. |
| `ref_room_z1s3_2010.png` | 2.94 MB PNG | Flattened composite of original 2010 Photoshop file `Z1S3-substampede_captainroom.psd` (2400x900 panoramic layout). Governs relative placement, shapes, and perspective for all room fixtures, furniture, and foreground props. |
| `ref_gui_aguilar.jpg` | 502.9 KB JPEG | Original 2010 GUI mockup (`GUImu003.jpg`) by Aguilar showing Fallout-1 style radial action menu, top inventory bar, and bottom dialogue pane. |
| `ref_hero_torso.png` | 35.0 KB PNG | Golden reference asset created in L0 from approved `smoothface.torso` (v3). Establishes construction paper grain, thick marker contour (6-9 px), and pencil shading for characters. |
| `ref_hero_sarcophagus.png` | 88.8 KB PNG | Golden reference asset created in L0 from approved `z1s3.prop.sarcophagus` (v3). Establishes medium marker contour (4-7 px), clean cut paper edges, and scenery palette colors for room props. |
| `ref_hero_wall_panel.png` | 440.3 KB PNG | Golden reference asset created in L0 from approved `z1s3.wall.panel_a` (v3). Establishes fine line contour (3-5 px) and aged wood/rust construction paper for architectural panels. |
| `ref_cutout_layers/` | 10 PNG files | Extracted layers from Morales's 2010 PSD `smoothface-cutout003.psd` (`001_Background.png` through `010_movs.png`). Provides exact anatomical breakdown, articulation overlap tabs, and scissor silhouettes for puppet rigging. |

---

## 6. Candidate Structure and Schema Requirements

Every candidate in `art/candidates/<id>/` must strictly follow the schema and file requirements below to be recognized by `gates.py`, the critic agents, and `review/review_server.py`.

### 6.1 Directory File Structure
```
art/candidates/<id>/
├── meta.json                  # Metadata, description, dimensions, references, status
├── prompt_vN.txt              # Complete prompt used for generating version N
├── vN_raw.png                 # Raw generator output (before chroma-key and rescale)
├── vN.png                     # Normalized RGBA PNG (transparent background, scaled)
├── gates_vN.json              # Gate check output from gates.py check
├── vN.gates.json              # Companion/duplicate copy of gate check output
├── critic_style_vN.json       # Style critic evaluation result
├── critic_anatomy_vN.json     # Anatomy critic evaluation result
└── vN.critics.json            # Consolidated critic report containing both rubrics
```

### 6.2 Schema for `meta.json`
```json
{
  "id": "<category>.<name>[.<variant>]",
  "category": "smoothface" | "capdread" | "z1s3" | "palette" | "ui",
  "kind": "body_part" | "prop" | "wall" | "floor" | "foreground" | "ui" | "emotion",
  "what": "<one-sentence detailed description in English: view, facing direction, material, colors, joints, overlap tabs>",
  "target_height_px": 40,
  "height_fraction_of_smoothface": 0.127,
  "pivot_hint": "<description of joint base, e.g. lower-left wrist base tucking into cuff>",
  "allowed_islands": 0,
  "references": [
    "art/references/ref_design_smoothface.png",
    "art/references/ref_hero_torso.png"
  ],
  "versions": {
    "v1": "prompt_v1.txt"
  },
  "status": "proposed",
  "proposed_version": "vN",
  "batch": "L2b"
}
```

### 6.3 Gate Check Output Schema (`gates_vN.json` and `vN.gates.json`)
Produced by `gates.py check`:
```json
{
  "file": "art/candidates/<id>/vN.png",
  "ts": "2026-10-22T08:14:24",
  "kind": "body_part",
  "halo_fraction": 0.0,
  "halo_ok": true,
  "sticker_border_fraction": 0.0,
  "sticker_ok": true,
  "stray_partial_alpha": 0,
  "partial_alpha_ok": true,
  "components": 1,
  "islands_significant": 0,
  "specks": 0,
  "components_ok": true,
  "touches_border_sides": 0,
  "border_ok": true,
  "palette_used": "characters",
  "off_palette_fraction": 0.0207,
  "palette_provisional": false,
  "palette_ok": true,
  "ink_thickness_px": 6.5,
  "ink_range": [6, 9],
  "ink_ok": true,
  "soft_gradient_fraction": 0.116,
  "gradient_ok": true,
  "measured_height_px": 40,
  "target_height_px": 40,
  "height_ok": true,
  "failed": [],
  "overall": "pass"
}
```

### 6.4 Critic Output Schemas

1. Individual Style Critic (`critic_style_vN.json`):
```json
{
  "verdict": "sin_objeciones",
  "defects": []
}
```
If defects exist:
```json
{
  "verdict": "rechazar",
  "defects": [
    {
      "zone": "left edge",
      "what": "White sticker border detected along upper cuff.",
      "severity": "major"
    }
  ]
}
```

2. Individual Anatomy Critic (`critic_anatomy_vN.json`):
```json
{
  "verdict": "sin_objeciones",
  "defects": []
}
```
Note: For static architectural scenery (`wall`, `floor`, `ui`), `critic_anatomy_vN.json` should still exist with `verdict: "sin_objeciones"` and `defects: []` to satisfy server loaders.

3. Combined Critics Report (`vN.critics.json`):
```json
{
  "style": {
    "verdict": "sin_objeciones",
    "defects": []
  },
  "anatomy": {
    "verdict": "sin_objeciones",
    "defects": []
  }
}
```

---

## 7. Review Server and API Integration

- Script: `review/review_server.py` runs on `http://localhost:8765`.
- Candidate Loading Behavior (`candidates()` function in `review_server.py`):
  - Traverses `art/candidates/<id>/`.
  - Filters candidates: by default only includes candidates with `meta.json` having `"status": "proposed"` (unless query parameter `?all=1` is provided).
  - Determines version from `meta.json` `"proposed_version"` or latest `vN.png`.
  - Loads associated gates via `gates_{v}.json`.
  - Loads style review via `critic_style_{v}.json`.
  - Loads anatomy review via `critic_anatomy_{v}.json`.
  - Loads up to 4 approved neighbors from `art/approved/MANIFEST.json` matching the same category.
  - Serves candidate thumbnails and full images via `/file/<relative_path>`.
- Review Feedback Loop:
  - User verdicts in review sheet submit to `POST /api/review`.
  - Records entries in `review/review.json`:
    `{"id": "<id>", "version": "vN", "verdict": "approved"|"rejected", "reason": "<text>", "ts": "<timestamp>"}`.
  - Applying reviews: Running `python pipeline/approve.py` transfers approved assets to `art/approved/<category>/<id>.png`, sets read-only permissions, records SHA-256 in `MANIFEST.json`, and updates `meta.json` to `"status": "approved"`.
  - Rejections: Moves rejected version files to `art/rejected/<id>_<version>/` and updates `meta.json` with rejection reason.

---

## 8. Calibrated Vision Rubrics and Edge Cases

From reviewing `art/rejected/` and the critic skills, several critical edge cases must be strictly observed during asset generation across Batches L2 through L10:

1. Horizontal Facing Direction (3/4 RIGHT):
   - Characters face 3/4 RIGHT (matching `ref_hero_torso.png` and `ref_design_capdread.png`).
   - Shoes, toes, and arms must point 3/4 right. Facing left caused rejection in `smoothface.shoe_back_v3`.
2. Hand Chirality and Dorsal vs Palmar Visibility:
   - In 3/4 right-facing view:
     - `hand_front.*` (attached to `arm_front`, nearest to camera) is the character's anatomical RIGHT hand. When raised pointing right, the camera sees the DORSAL (back) side of the hand with the thumb on the upper-left.
     - `hand_back.*` (attached to `arm_back`, farthest from camera) is the character's anatomical LEFT hand. When raised pointing right, the camera sees the PALMAR (inner palm) side.
   - Both hands must feature exactly 5 digits (1 thumb + 4 fingers) when open.
3. Paired-Part Consistency:
   - Front and back footwear (`shoe_front` and `shoe_back`, `boot_front` and `boot_back`) must share identical design, geometry, and styling.
4. Canon Character Attributes:
   - Mr. Smoothface is completely hairless and has no drawn mouth (permanently covered by his trench coat collar). Mouth generation must be omitted.
   - Captain Dread has a bushy black beard, tricorn hat, and pirate captain regalia.
5. Zero Em-Dashes:
   - Project-wide hard rule: zero em-dashes anywhere in documentation, code, or data. Standard hyphens, colons, or parentheses must be used instead.
