# Character Rigs, Animation Specifications, and Parts Survey Report

Date: 2026-10-22
Investigator: Explorer Survey 2
Target Directory: c:\AntiGravityStuff\Moonstorm2
Scope: Character Rigs (Smoothface & Captain Dread), Schema, L2 Remainder, L3 Assets, L4-L5 Dread Batches, Critic Rubrics

---

## 1. Executive Summary

This report establishes the technical and aesthetic architectural foundation for assembling the 2D cut-out character rigs and generating character assets for *Smoothface's Epic* (Slice 1: `Z1S3` Captain Dread's Cabin).

Key Findings:
1. **Rig Format & Schema**: Characters are composed of standalone cut-out PNG pieces articulated via pivot points and layered by z-index. While individual cut-out layers existed historically in `smoothface-cutout003.psd` and prototype rendering logic exists in `src/engine/CutoutRigRenderer.ts` and `review/review_sheet.html`, the formal `characters/smoothface/rig.json` and `characters/capdread/rig.json` specifications must be established to bridge asset storage, review tooling, and runtime engines.
2. **Smoothface L2 Remainder & L3 Assets**:
   - L2 remainder requires exactly one missing piece: `smoothface.hand_back.point` (anatomical left hand, pointing 3/4 right, palmar view, 5 digits, target height 38 px). Canonical omission of `smoothface.hair_tuft` (Smoothface is hairless) and `smoothface.mouth.*` (mouth is hidden behind the high coat collar in 3/4 view) completes the body.
   - L3 requires 5 separate animated emotion cut-out badges (`sweat_drop`, `anger_vein`, `question_mark`, `exclamation`, `idea_bulb`) using the `characters` palette and 6-9 px marker ink, plus 2 hand-held props (`magnifying_glass`, `skeleton_key`) using the `scenery` palette and 4-7 px marker ink.
3. **Captain Dread Batches L4 and L5**:
   - Total standing height is 330 px without hat per `pipeline/heights.json` (tolerance 0.04 -> 316.8 to 343.2 px; broader and taller than Smoothface at 315 px).
   - 22 discrete body, face, hat, and limb pieces partitioned across Batch L4 (Head, Hat, Torso, Beard, Eyes x3, Brows x3; 10 pieces) and Batch L5 (Limbs, Hands, Boots, Pelvis; 12 pieces).
   - Rig layer ordering spans z-index 10 (back boot) to 41 (front arm sleeve), with wrist tabs concealed inside sleeve cuffs and high collar overlapping neck/jaw.
   - Interactive puppet preview in `review/review_sheet.html` must be expanded to support Captain Dread selection, layer dragging, and state toggles alongside Smoothface.
4. **Calibrated Critic Rubrics**:
   - `anatomy-critic`: Enforces strict 3/4 horizontal facing alignment with hero torso, paired-part geometry symmetry, dorsal hand view for `hand_front.*` (anatomical right hand), palmar hand view for `hand_back.*` (anatomical left hand), and an unbending 5-digit count (1 thumb + 4 fingers; cartoon 4-finger hands trigger instant blocker rejections).
   - `style-critic`: Enforces hostile art direction, rough scissor-cut paper facets for characters/emotions, strict ink width hierarchy (6-9 px for body parts/emotions), zero off-palette colors, zero digital gradients or airbrush, and zero baked drop shadows.

---

## 2. Character Rig Format and Schema Architecture

### 2.1 Existing Precedents in Codebase
- **STYLE_BIBLE.md Section 5**: Defines the standard character breakdown and drawing order from back to front:
  - 01 rear arm (`arm_back`)
  - 02 rear hand (`hand_back`)
  - 03 rear leg (`leg_back`)
  - 04 front leg (`leg_front`)
  - 05 rear shoe (`shoe_back`)
  - 06 front shoe (`shoe_front`)
  - Torso (`torso`) between 06 and 07
  - 07 head (`head`)
  - 08 mouth (`mouth`, if visible per character canon)
  - 09 eyes (`eyes`, variants: normal, closed, squint)
  - 10 eyebrows (`brows`, variants: normal, angry, surprised)
  - 11 hair / hat / tuft (`hat`, `beard`)
  - 12 front arm (`arm_front`)
  - 13 front hand (`hand_front`, variants: fist, open, point)
- **review/review_sheet.html (`DEFAULT_OFFSETS` & `layers`)**: Implements an interactive multi-layer puppet view.
  - Layer coordinates are expressed relative to a 340 x 420 px staging viewport.
  - Explicit z-indexes prevent visual clipping (e.g., `leg_back`: 11, `pants`: 14, `torso`: 30, `arm_front`: 41).
  - Hands have overlap tabs tucking into arm cuffs (`arm_front` at z:41 overlaps `hand_front` at z:40).
- **src/engine/CutoutRigRenderer.ts**: Implements runtime puppet animation state (`PuppetAnimState`), spring-loaded emotion pops, 2.5D paper card-turn flips, and idle breathing squash-and-stretch.

### 2.2 Standard `rig.json` Schema Specification
The rig file for each character (`characters/<character_id>/rig.json`) must adhere to this standardized schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "id": "smoothface",
  "name": "Mr. Rupert Smoothface",
  "version": "1.0",
  "height_px": 315,
  "height_tolerance": 0.04,
  "facing_default": 1,
  "canvas": {
    "width": 340,
    "height": 420,
    "foot_baseline_y": 414
  },
  "root": "torso",
  "parts": {
    "torso": {
      "asset": "art/approved/smoothface/smoothface.torso.png",
      "z_index": 30,
      "parent": null,
      "offset": [27, 90],
      "size": [255, 271],
      "pivots": {
        "neck": [165, 80],
        "shoulder_front": [190, 160],
        "shoulder_back": [175, 140],
        "waist": [128, 260]
      }
    },
    "head": {
      "asset": "art/approved/smoothface/smoothface.head.png",
      "z_index": 20,
      "parent": "torso",
      "offset": [132, 79],
      "size": [144, 151],
      "pivots": {
        "neck_mount": [65, 135],
        "eyes_mount": [45, 65],
        "brows_mount": [45, 52]
      }
    },
    "arm_front": {
      "asset": "art/approved/smoothface/smoothface.arm_front.png",
      "z_index": 41,
      "parent": "torso",
      "offset": [156, 210],
      "size": [135, 108],
      "pivots": {
        "shoulder": [30, 25],
        "wrist_cuff": [105, 20]
      }
    },
    "arm_back": {
      "asset": "art/approved/smoothface/smoothface.arm_back.png",
      "z_index": 18,
      "parent": "torso",
      "offset": [172, 176],
      "size": [131, 104],
      "pivots": {
        "shoulder": [25, 20],
        "wrist_cuff": [108, 15]
      }
    },
    "pants": {
      "asset": "art/approved/smoothface/smoothface.pants.png",
      "z_index": 14,
      "parent": "torso",
      "offset": [78, 282],
      "size": [84, 81],
      "pivots": {
        "waist_mount": [42, 10],
        "hip_front": [52, 45],
        "hip_back": [22, 45]
      }
    },
    "leg_front": {
      "asset": "art/approved/smoothface/smoothface.leg_front.png",
      "z_index": 13,
      "parent": "pants",
      "offset": [118, 322],
      "size": [40, 68],
      "pivots": {
        "hip": [18, 10],
        "ankle": [18, 55]
      }
    },
    "leg_back": {
      "asset": "art/approved/smoothface/smoothface.leg_back.png",
      "z_index": 11,
      "parent": "pants",
      "offset": [78, 320],
      "size": [49, 68],
      "pivots": {
        "hip": [22, 10],
        "ankle": [22, 55]
      }
    },
    "shoe_front": {
      "asset": "art/approved/smoothface/smoothface.shoe_front.png",
      "z_index": 12,
      "parent": "leg_front",
      "offset": [112, 355],
      "size": [84, 59],
      "pivots": {
        "ankle_mount": [26, 15],
        "sole_baseline": [42, 59]
      }
    },
    "shoe_back": {
      "asset": "art/approved/smoothface/smoothface.shoe_back.png",
      "z_index": 10,
      "parent": "leg_back",
      "offset": [74, 352],
      "size": [84, 59],
      "pivots": {
        "ankle_mount": [26, 15],
        "sole_baseline": [42, 59]
      }
    }
  },
  "variant_groups": {
    "eyes": {
      "z_index": 22,
      "parent": "head",
      "default": "normal",
      "options": {
        "normal": {"asset": "art/approved/smoothface/smoothface.eyes.normal.png", "offset": [175, 143], "size": [72, 58]},
        "closed": {"asset": "art/approved/smoothface/smoothface.eyes.closed.png", "offset": [175, 143], "size": [78, 58]},
        "squint": {"asset": "art/approved/smoothface/smoothface.eyes.squint.png", "offset": [174, 142], "size": [81, 60]}
      }
    },
    "brows": {
      "z_index": 23,
      "parent": "head",
      "default": "normal",
      "options": {
        "normal": {"asset": "art/approved/smoothface/smoothface.brows.normal.png", "offset": [174, 132], "size": [96, 50]},
        "angry": {"asset": "art/approved/smoothface/smoothface.brows.angry.png", "offset": [178, 131], "size": [84, 59]},
        "surprised": {"asset": "art/approved/smoothface/smoothface.brows.surprised.png", "offset": [179, 126], "size": [76, 57]}
      }
    },
    "hand_front": {
      "z_index": 40,
      "parent": "arm_front",
      "default": "fist",
      "options": {
        "fist": {"asset": "art/approved/smoothface/smoothface.hand_front.fist.png", "offset": [254, 194], "size": [41, 44]},
        "open": {"asset": "art/approved/smoothface/smoothface.hand_front.open.png", "offset": [252, 190], "size": [48, 48]},
        "point": {"asset": "art/approved/smoothface/smoothface.hand_front.point.png", "offset": [252, 192], "size": [72, 50]}
      }
    },
    "hand_back": {
      "z_index": 17,
      "parent": "arm_back",
      "default": "fist",
      "options": {
        "fist": {"asset": "art/approved/smoothface/smoothface.hand_back.fist.png", "offset": [272, 162], "size": [48, 42]},
        "open": {"asset": "art/approved/smoothface/smoothface.hand_back.open.png", "offset": [272, 158], "size": [46, 46]},
        "point": {"asset": "art/candidates/smoothface.hand_back.point/v1.png", "offset": [272, 160], "size": [64, 46]}
      }
    }
  },
  "attachment_anchors": {
    "emotion_bubble": [180, 50],
    "prop_front": [290, 215],
    "prop_back": [295, 175]
  }
}
```

---

## 3. Smoothface L2 Remainder and L3 Assets

### 3.1 Smoothface L2 Remainder: `smoothface.hand_back.point`
- **Asset ID**: `smoothface.hand_back.point`
- **Category**: `smoothface`
- **Kind**: `body_part`
- **Target Height**: 38 px (fraction of Smoothface: 38 / 315 = 0.121)
- **Palette**: `characters` palette (`#f9ecc2` warm skin cream, `#1a1612` ink, `#6e6a62` soft pencil shading)
- **Ink Rule**: 6-9 px thickness at scale 1.0 (requires thick marker stroke)
- **Chirality & Facing**:
  - In 3/4 right facing view, `hand_back` is the character's anatomical LEFT hand.
  - Pointing forward-right means the palm/inner side faces the viewer (PALMAR view).
  - The thumb points upward / toward the body on the left side of the palm.
  - Exactly 5 digits: 1 thumb + 1 extended index finger + 3 curled fingers.
  - Wrist tab on the left tucks into the cuff of `smoothface.arm_back`.
- **Allowed Islands**: 0 (single connected component).

### 3.2 Canonical Body Omissions (Confirmed)
- **`smoothface.hair_tuft`**: Omitted per canon. Rupert Stache is 100% hairless, contrasting sharply with his twin brother Dr. Morgan Stache's luxuriant beard.
- **`smoothface.mouth.*`**: Omitted per canon. In Aguilar's original design (`ref_design_smoothface.png`) and the hero asset (`ref_hero_torso.png`), Smoothface's ultra-high coat collar conceals his chin, mouth, and jaw. A detached mouth piece floating over the collar was rejected by Alex on 2026-10-21.

### 3.3 Smoothface L3 Assets: 5 Emotions and 2 Hand Props

#### A. 5 Separate Animated Emotion Cut-Outs
Emotions in *Smoothface's Epic* are distinct paper cut-out badges that float above a character's head, animated with elastic spring pop-in and bobbing physics:

| Piece ID | Kind | Palette | Ink (px) | Target Height | Edge Style | Description |
|---|---|---|---|---|---|---|
| `smoothface.emotion.sweat_drop` | `emotion` | `characters` | 6-9 | 40 px | Rough cut | Stylized nervous sweat droplet in vivid character slate/blue `#848aa4` or `#004b81` with thick black ink and subtle pencil highlight. |
| `smoothface.emotion.anger_vein` | `emotion` | `characters` | 6-9 | 46 px | Rough cut | Comic/manga style 4-branch popping anger vein in deep crimson `#9e1507` with bold ink outline. |
| `smoothface.emotion.question_mark` | `emotion` | `characters` | 6-9 | 52 px | Rough cut | Puzzled question mark in gold `#e7bc57` or slate `#848aa4`; allowed_islands: 1 to permit separate dot component. |
| `smoothface.emotion.exclamation` | `emotion` | `characters` | 6-9 | 52 px | Rough cut | Shock / alert exclamation mark in gold/ochre `#e7bc57` or crimson `#9e1507`; allowed_islands: 1 for separate dot. |
| `smoothface.emotion.idea_bulb` | `emotion` | `characters` | 6-9 | 58 px | Rough cut | Classic scheming villain inspiration lightbulb in gold/cream with dark brass filament and bold marker rays. |

#### B. 2 Hand-Held Props
Hand props attach directly to Smoothface's wrist/hand mounts:

| Piece ID | Kind | Palette | Ink (px) | Target Height | Edge Style | Description |
|---|---|---|---|---|---|---|
| `smoothface.prop.magnifying_glass` | `prop` | `scenery` | 4-7 | 56 px | Clean cut | Victorian detective inspection lens with aged brass rim (`#ab986e`), dark wooden handle (`#998370`), and light blue tinted glass (`#95b3d4`). Tucks into open or fist hand. |
| `smoothface.prop.skeleton_key` | `prop` | `scenery` | 4-7 | 44 px | Clean cut | Ornate pirate/submarine iron skeleton key in dark iron (`#2a2922`) with rust highlights (`#605752`) and notched bit. |

Note on palette and gates:
- Hand props use `kind: "prop"`, which maps to `scenery` palette in `pipeline/palette.json` and 4-7 px ink in `pipeline/rules.json`.
- Emotions use `kind: "emotion"`, which maps to `characters` palette and 6-9 px ink.

---

## 4. Captain Dread Rig and Pieces (Batches L4 & L5)

### 4.1 Standing Height and Physical Dimensions
- **Standing Height**: Exactly 330 px without hat per `pipeline/heights.json` (tolerance ±4% -> 316.8 px to 343.2 px).
- **Proportions**: Substantially broader and bulkier than Smoothface (315 px), featuring wide military epaulets, a puffed naval overcoat, a billowing cape, a massive pompadour hairstyle, and a towering captain's tricorn hat.

### 4.2 Complete Inventory of 22 Pieces
Captain Dread is decomposed into exactly 22 standalone cut-out pieces across Batches L4 and L5:

#### Batch L4: Head, Hat, Torso, Beard, Eyes x3, Brows x3 (10 pieces)
1. `capdread.torso`: Dark blue naval uniform coat (`#004b81` / `#343e63`) with golden epaulets (`#e7bc57`), brass buttons, ruffled shirt cravat (`#cbc2c2`), and hanging rear cape. Target height: ~220 px.
2. `capdread.head`: Head face profile in skin cream (`#f9ecc2`), rugged nose, ears, side-shaved undercut, and pipe bowl in mouth. Target height: ~135 px without hat.
3. `capdread.hat`: Flamboyant captain's tricorn / bicorn hat in weathered dark iron/navy with gold trim, perched atop his massive pompadour. Target height: ~78 px.
4. `capdread.beard`: Thick, bushy black captain's beard and moustache (`#1a1612` with pencil texture) wrapping around jaw and chin. Target height: ~78 px.
5. `capdread.eyes.normal`: Narrow, confident pirate eyes in neutral gaze. Target height: ~28 px.
6. `capdread.eyes.closed`: Shut eyelids with wrinkled crow's-feet (blinking / sleeping). Target height: ~28 px.
7. `capdread.eyes.squint`: Suspicious, highly narrowed glare. Target height: ~26 px.
8. `capdread.brows.normal`: Bushy black captain's eyebrows in neutral state. Target height: ~24 px.
9. `capdread.brows.angry`: Furious angled eyebrows furrowing down over bridge of nose. Target height: ~26 px.
10. `capdread.brows.surprised`: High arched eyebrows raised in alarm or astonishment. Target height: ~28 px.

#### Batch L5: Limbs, Hands, Boots, Pelvis (12 pieces)
11. `capdread.arm_front`: Front bent naval coat sleeve with epaulet shoulder and gold-braided cuff. Target height: ~118 px.
12. `capdread.arm_back`: Rear coat sleeve extending down or gesturing outward. Target height: ~112 px.
13. `capdread.hand_front.fist`: Front clenched pirate fist. Target height: ~44 px.
14. `capdread.hand_front.open`: Front open hand with splayed, expressive fingers. Target height: ~46 px.
15. `capdread.hand_front.point`: Front hand pointing forward with index finger. Target height: ~44 px.
16. `capdread.hand_back.fist`: Rear clenched fist. Target height: ~42 px.
17. `capdread.hand_back.open`: Rear open gesturing hand. Target height: ~44 px.
18. `capdread.pants`: Naval trousers / breeches pelvis and upper thighs. Target height: ~88 px.
19. `capdread.leg_front`: Front leg shin and knee. Target height: ~76 px.
20. `capdread.leg_back`: Rear leg shin and knee. Target height: ~76 px.
21. `capdread.boot_front`: Front buccaneer leather boot with fold-over cuff and flat ground sole. Target height: ~64 px.
22. `capdread.boot_back`: Rear buccaneer leather boot with fold-over cuff. Target height: ~64 px.

### 4.3 Pivot Joints and Assembly Hierarchy
- **Boot Baseline**: Both `boot_front` and `boot_back` have sole baselines aligned at y = foot_baseline (e.g., y = 420 px).
- **Leg to Boot**: Bottom cuff of `leg_front` and `leg_back` overlaps top ankle collar of `boot_front` and `boot_back`.
- **Pants to Leg**: Left and right hip sockets at bottom of `pants` overlap top of `leg_back` and `leg_front`.
- **Torso to Pants**: Bottom coat hem of `torso` overlaps top waist of `pants`.
- **Head to Torso**: Lower neck base of `head` tucks inside the high collar of `torso`.
- **Facial Features to Head**:
  - `eyes.*` mount to mid-face coordinate on `head`.
  - `brows.*` mount directly above `eyes.*`.
  - `beard` mounts below nose and wraps around the jaw.
  - `hat` sits directly atop the pompadour hair crest of `head`.
- **Arms to Torso**:
  - `arm_back` shoulder joint tucks behind rear coat shoulder of `torso`.
  - `arm_front` shoulder joint sits on front chest of `torso`.
- **Hands to Arms**:
  - `hand_back.*` wrist tab tucks into sleeve cuff of `arm_back`.
  - `hand_front.*` wrist tab tucks into sleeve cuff of `arm_front`.

### 4.4 Rig Layer Ordering (Z-Index from Back to Front)
To avoid rendering artifacts and seam exposure, Captain Dread pieces must be composited in this exact draw order:

```
Z-Index  Piece Key             Description
-------  ---------             -----------
10       capdread.boot_back    Rear boot sole and heel
11       capdread.leg_back     Rear leg shin
12       capdread.boot_front   Front boot sole and heel
13       capdread.leg_front    Front leg shin
14       capdread.pants        Naval trousers / pelvis
17       capdread.hand_back    Rear hand (fist or open)
18       capdread.arm_back     Rear coat sleeve (cuff covers hand wrist tab)
20       capdread.head         Head skin, face, ears, pipe, pompadour hair
22       capdread.eyes.*       Active eye variant (normal / closed / squint)
23       capdread.brows.*      Active brow variant (normal / angry / surprised)
24       capdread.beard        Bushy black beard and moustache
26       capdread.hat          Flamboyant tricorn captain hat
30       capdread.torso        Main coat, gold epaulets, ruffled cravat, rear cape
40       capdread.hand_front   Front hand (fist, open, or point)
41       capdread.arm_front    Front coat sleeve (cuff covers front hand wrist tab)
```

### 4.5 Interactive Puppet Preview Requirements for `review_sheet.html`
Currently, `review/review_sheet.html` only renders Smoothface's puppet. To fulfill Requirement R2, `review_sheet.html` must be updated with:
1. **Puppet Character Selector**: A tab or toggle allowing Alex to view either the Smoothface Puppet or the Captain Dread Puppet (or automatically selecting the puppet matching the active candidate category).
2. **Captain Dread Offsets Table**: A `CAPDREAD_DEFAULT_OFFSETS` dictionary matching Captain Dread's 22 pieces on a 380 x 450 px staging viewport.
3. **Interactive Controls**:
   - Eyes: Normal | Closed | Squint | Hide
   - Brows: Normal | Angry | Surprised | Hide
   - Front Hand: Fist | Open | Point | Hide
   - Back Hand: Fist | Open | Hide
   - Hat: On | Off
   - Beard: Visible | Hide
4. **Draggable Rig Layers**: Mouse drag-and-drop support on every Captain Dread layer with real-time coordinate readouts to fine-tune joint alignments.

---

## 5. Calibrated Style and Anatomy Critic Rubrics

Both critics run automatically on all candidate pieces that pass `pipeline/gates.py check` before pieces are presented to Alex. They do not give scores; they return either `sin_objeciones` or a list of concrete defects.

### 5.1 Anatomy Critic (`.agents/skills/anatomy-critic/SKILL.md`)
The anatomy critic enforces physical construction, perspective, and anatomical correctness:

1. **3/4 Horizontal Facing Direction (Rule 5)**:
   - Must match the exact 3/4 horizontal facing direction of the hero reference (`ref_hero_torso.png` faces 3/4 RIGHT).
   - Smoothface's shoes, legs, arms, and hands must point 3/4 RIGHT, never 3/4 left. Facing the opposite horizontal direction is an immediate blocker defect.
   - For Captain Dread: All of Dread's pieces must match the facing direction of `capdread.torso`. When authored facing 3/4 RIGHT (matching the standard rig coordinate system), the game engine can flip him horizontally (`facing: -1`) in scenes where he faces Smoothface.
2. **Paired Part Consistency (Rule 6)**:
   - When evaluating front/back pairs (e.g. `shoe_front` and `shoe_back`, or `boot_front` and `boot_back`), both must share the exact same design, geometry, and styling.
   - Distinct, mismatched shoe styles on the same character trigger a blocker defect.
3. **Hand Chirality and Finger Count (Rule 7, Calibrated 2026-10-22)**:
   - **Hand Chirality in 3/4 Right View**:
     - `hand_front.*` (attached to near arm) is the anatomical RIGHT hand. When raised facing right with the thumb on the upper-left, the viewer MUST see the DORSAL (back of hand) side. Showing palm lines or curled fingertips with the thumb on top/left is a LEFT hand and triggers an immediate blocker defect.
     - `hand_back.*` (attached to far arm) is the anatomical LEFT hand. When raised facing forward-right, the viewer sees the PALMAR (palm/inner) side.
   - **Digit Count (5 Digits)**:
     - Every hand must have exactly 5 digits (1 thumb + 4 fingers) when open or gesturing.
     - Having 4 digits (cartoon hand) or 6 digits triggers an immediate blocker defect.

### 5.2 Style Critic (`.agents/skills/style-critic/SKILL.md`)
The style critic acts as a hostile art director comparing candidates against approved references:

1. **Ink Line Quality and Thickness**:
   - Outline must be hand-drawn black marker (`#1a1612`) with visible pressure variations and slight overshoot at corners.
   - Thickness must stay within calibrated bounds: 6-9 px for character body parts and emotions; 4-7 px for furniture and floor props; 3-5 px for wall panels.
   - Broken, faint, or vector-smooth digital outlines trigger a defect.
2. **Palette Purity and Shading**:
   - Zero off-palette colors. Characters and emotions strictly use `characters` palette; scenery and props strictly use `scenery` palette.
   - Shading must be soft pencil hatching (`#6e6a62`) in shadow areas only.
   - Digital airbrush, gradients, glow, bloom, and 3D rendering are strictly prohibited.
3. **Paper Edge Quality**:
   - Character parts and emotions must have rough scissor-cut edges with visible facets and directional turns.
   - Scenery and props have clean, ruler-cut edges.
   - Zero white sticker halos or partially transparent fringes.
4. **Zero Baked Shadow**:
   - PNG cut-outs must never contain baked drop shadows or ground contact shadows (shadows are generated programmatically by the layout engine).
5. **Single Object Isolation**:
   - Exactly one isolated object per file; zero environment background; zero extraneous text.
6. **Variant Differentiation**:
   - Variants of the same part (e.g. eye states, brow expressions, hand poses) must exhibit distinct silhouettes and angles. Near-identical duplicates trigger a blocker defect.

---

## 6. Implementation Checklist for Subsequent Execution

- [ ] Create `characters/smoothface/rig.json` incorporating all 20 approved Smoothface pieces + `smoothface.hand_back.point`.
- [ ] Create candidate `smoothface.hand_back.point` (38 px, 3/4 right, palmar view, 5 digits, character palette).
- [ ] Create 5 Smoothface emotion candidates (`sweat_drop`, `anger_vein`, `question_mark`, `exclamation`, `idea_bulb`).
- [ ] Create 2 Smoothface hand prop candidates (`magnifying_glass`, `skeleton_key`).
- [ ] Create Batch L4 Captain Dread candidates (torso, head, hat, beard, eyes x3, brows x3).
- [ ] Create Batch L5 Captain Dread candidates (arm_front, arm_back, hand_front x3, hand_back x2, pants, legs x2, boots x2).
- [ ] Create `characters/capdread/rig.json` with standing height 330 px without hat and full 22-part layer hierarchy.
- [ ] Update `review/review_sheet.html` with Captain Dread interactive puppet preview.
- [ ] Generate composite preview renders in `review/layout_shots/`.
