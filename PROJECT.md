# Project: Smoothface's Epic (Slice 1: Z1S3 Captain Dread's Cabin)

## Architecture
- **Engine & Art Style**: 2D Cutout Paper Point-and-Click Adventure ("Cut-Out" layered style + Morales themed color palettes + Aguilar pencil sketches).
- **Scale & Resolution**:
  - Baseline Viewport: 1600 x 900 px.
  - Panoramic Room Z1S3: 2400 x 900 px.
  - Smoothface Standing Height: 315 px (+-4%).
  - Captain Dread Standing Height: 330 px without hat (+-4%).
- **Color Palettes** (`pipeline/palette.json`):
  - Characters Palette: 4 canon Smoothface colors + 8 Aguilar sketch tones + 2 common (ink_black `#1a1612`, pencil_grey `#6e6a62`).
  - Scenery Palette: 12 muted tones derived from 2010 Z1S3 art + 2 common.
- **Automated Gates** (`pipeline/gates.py`):
  - `normalize`: Chroma-key background removal, alpha bounding-box cropping, Lanczos rescaling to `target_height_px`, border padding.
  - `check`: 8 programmatic quality gates (`halo_ok`, `sticker_ok`, `partial_alpha_ok`, `components_ok`, `border_ok`, `palette_ok`, `gradient_ok`, `height_ok`).
  - `layout`: Room layout schema validation, manifest check, boundary checks, and hotspot overlap verification (<30%).
- **Dual Critics**:
  - `style-critic`: Ink width bounds (6-9 px characters/foreground, 4-7 px props/floor, 3-5 px wall), paper edge quality, pencil shading, zero gradients/glow.
  - `anatomy-critic`: 3/4 right facing consistency, paired-part symmetry, hand chirality (dorsal front, palmar back), strictly 5 digits.

## Feature Inventory
Every feature and piece across Batches L2 through L10 assigned to a milestone:

| # | Feature / Asset ID | Description | Milestone | Source |
|---|---|---|---|---|
| 1 | `smoothface.hand_back.point` | Anatomical left hand pointing 3/4 right, palmar view, 5 digits (target height 38 px) | M1 | ORIGINAL_REQUEST R1 |
| 2 | `characters/smoothface/rig.json` | Complete rig combining 20 approved pieces + pointing back hand (standing height 315 px) | M1 | ORIGINAL_REQUEST R1 |
| 3 | `smoothface.emotion.sweat_drop` | Animated nervous sweat droplet badge (target height 40 px, characters palette) | M1 | ORIGINAL_REQUEST R1 |
| 4 | `smoothface.emotion.anger_vein` | 4-branch popping anger vein badge (target height 46 px, characters palette) | M1 | ORIGINAL_REQUEST R1 |
| 5 | `smoothface.emotion.question_mark` | Puzzled question mark badge with dot (target height 52 px, characters palette) | M1 | ORIGINAL_REQUEST R1 |
| 6 | `smoothface.emotion.exclamation` | Alert exclamation mark badge with dot (target height 52 px, characters palette) | M1 | ORIGINAL_REQUEST R1 |
| 7 | `smoothface.emotion.idea_bulb` | Scheming villain inspiration lightbulb (target height 58 px, characters palette) | M1 | ORIGINAL_REQUEST R1 |
| 8 | `smoothface.prop.magnifying_glass` | Victorian brass/wood magnifying glass (target height 56 px, scenery palette) | M1 | ORIGINAL_REQUEST R1 |
| 9 | `smoothface.prop.skeleton_key` | Ornate dark iron submarine skeleton key (target height 44 px, scenery palette) | M1 | ORIGINAL_REQUEST R1 |
| 10 | `capdread.torso` | Naval captain uniform coat with golden epaulets and cravat (target height 220 px) | M2 | ORIGINAL_REQUEST R2 |
| 11 | `capdread.head` | Head face profile with pompadour hair and smoking pipe (target height 135 px) | M2 | ORIGINAL_REQUEST R2 |
| 12 | `capdread.hat` | Tricorn pirate captain hat with gold trim braid (target height 78 px) | M2 | ORIGINAL_REQUEST R2 |
| 13 | `capdread.beard` | Bushy black captain beard wrapping around jaw (target height 78 px) | M2 | ORIGINAL_REQUEST R2 |
| 14 | `capdread.eyes.normal` | Confident pirate eyes in neutral gaze (target height 28 px) | M2 | ORIGINAL_REQUEST R2 |
| 15 | `capdread.eyes.closed` | Shut eyelids with crow's-feet for blinking/sleeping (target height 28 px) | M2 | ORIGINAL_REQUEST R2 |
| 16 | `capdread.eyes.squint` | Suspicious narrowed pirate glare (target height 26 px) | M2 | ORIGINAL_REQUEST R2 |
| 17 | `capdread.brows.normal` | Bushy black captain eyebrows in neutral state (target height 24 px) | M2 | ORIGINAL_REQUEST R2 |
| 18 | `capdread.brows.angry` | Furious angled eyebrows furrowed down (target height 26 px) | M2 | ORIGINAL_REQUEST R2 |
| 19 | `capdread.brows.surprised` | High arched eyebrows raised in alarm (target height 28 px) | M2 | ORIGINAL_REQUEST R2 |
| 20 | `capdread.arm_front` | Front naval sleeve with epaulet shoulder and cuff (target height 118 px) | M2 | ORIGINAL_REQUEST R2 |
| 21 | `capdread.arm_back` | Rear naval sleeve extending down/gesturing (target height 112 px) | M2 | ORIGINAL_REQUEST R2 |
| 22 | `capdread.hand_front.fist` | Front clenched pirate fist, dorsal view, 5 digits (target height 44 px) | M2 | ORIGINAL_REQUEST R2 |
| 23 | `capdread.hand_front.open` | Front open hand, dorsal view, 5 digits (target height 46 px) | M2 | ORIGINAL_REQUEST R2 |
| 24 | `capdread.hand_front.point` | Front pointing hand, dorsal view, 5 digits (target height 44 px) | M2 | ORIGINAL_REQUEST R2 |
| 25 | `capdread.hand_back.fist` | Rear clenched fist, palmar view, 5 digits (target height 42 px) | M2 | ORIGINAL_REQUEST R2 |
| 26 | `capdread.hand_back.open` | Rear open gesturing hand, palmar view, 5 digits (target height 44 px) | M2 | ORIGINAL_REQUEST R2 |
| 27 | `capdread.pants` | Naval trousers / breeches pelvis and upper thighs (target height 88 px) | M2 | ORIGINAL_REQUEST R2 |
| 28 | `capdread.leg_front` | Front leg shin and knee (target height 76 px) | M2 | ORIGINAL_REQUEST R2 |
| 29 | `capdread.leg_back` | Rear leg shin and knee (target height 76 px) | M2 | ORIGINAL_REQUEST R2 |
| 30 | `capdread.boot_front` | Front buccaneer leather boot with fold-over cuff (target height 64 px) | M2 | ORIGINAL_REQUEST R2 |
| 31 | `capdread.boot_back` | Rear buccaneer leather boot with fold-over cuff (target height 64 px) | M2 | ORIGINAL_REQUEST R2 |
| 32 | `characters/capdread/rig.json` | Complete Captain Dread rig combining all 22 pieces (standing height 330 px without hat) | M2 | ORIGINAL_REQUEST R2 |
| 33 | `z1s3.wall.panel_b` | Riveted hull wall panel variant B (target height 900 px, width 600 px) | M3 | ORIGINAL_REQUEST R3 |
| 34 | `z1s3.wall.panel_c` | Riveted hull wall panel variant C with conduit hatch (target height 900 px, width 600 px) | M3 | ORIGINAL_REQUEST R3 |
| 35 | `z1s3.wall.seam_strip` | Vertical iron seam cover strip with rivets (target height 900 px, width 40 px) | M3 | ORIGINAL_REQUEST R3 |
| 36 | `z1s3.floor.planks_a` | Horizontal wooden deck planks segment A (target height 260 px, width 800 px) | M3 | ORIGINAL_REQUEST R3 |
| 37 | `z1s3.floor.planks_b` | Horizontal wooden deck planks segment B (target height 260 px, width 800 px) | M3 | ORIGINAL_REQUEST R3 |
| 38 | `z1s3.ceiling.beam_a` | Overhead structural steel arch beam segment A (target height 160 px, width 800 px) | M3 | ORIGINAL_REQUEST R3 |
| 39 | `z1s3.ceiling.beam_b` | Overhead structural steel arch beam segment B (target height 160 px, width 800 px) | M3 | ORIGINAL_REQUEST R3 |
| 40 | `z1s3.wall.door` | Heavy watertight submarine bulkhead door (target height 410 px) | M3 | ORIGINAL_REQUEST R3 |
| 41 | `z1s3.wall.porthole` | Circular brass porthole frame with ocean view (target height 180 px) | M3 | ORIGINAL_REQUEST R3 |
| 42 | `z1s3.wall.poster` | Vintage nautical pinup or cutaway poster (target height 126 px) | M3 | ORIGINAL_REQUEST R3 |
| 43 | `z1s3.wall.mask_a` | Carved wooden elongated tribal mask A (target height 80 px) | M3 | ORIGINAL_REQUEST R3 |
| 44 | `z1s3.wall.mask_b` | Carved wooden round tribal mask B (target height 80 px) | M3 | ORIGINAL_REQUEST R3 |
| 45 | `z1s3.wall.helm_wheel` | Wooden ship helm wheel, puzzle component 4 (target height 160 px) | M3 | ORIGINAL_REQUEST R3 |
| 46 | `z1s3.wall.shelf` | Cluttered wooden shelf with iron brackets (target height 95 px) | M3 | ORIGINAL_REQUEST R3 |
| 47 | `z1s3.wall.pipes` | Riveted steam and water pipes with brass valve (target height 110 px) | M3 | ORIGINAL_REQUEST R3 |
| 48 | `z1s3.prop.desk` | Heavy dark-wood rolltop/double-pedestal desk (target height 173 px) | M3 | ORIGINAL_REQUEST R3 |
| 49 | `z1s3.prop.tv` | Retro 1950s CRT television set with antennas (target height 110 px) | M3 | ORIGINAL_REQUEST R3 |
| 50 | `z1s3.prop.fishbowl` | Spherical glass fishbowl with murky water (target height 79 px) | M3 | ORIGINAL_REQUEST R3 |
| 51 | `z1s3.prop.coat_rack` | Freestanding wooden coat stand / hanger tree (target height 346 px) | M3 | ORIGINAL_REQUEST R3 |
| 52 | `z1s3.prop.coat` | Hanging dark naval captain's overcoat (target height 205 px) | M3 | ORIGINAL_REQUEST R3 |
| 53 | `z1s3.prop.hat` | Ornate pirate tricorn hat on rack (target height 79 px) | M3 | ORIGINAL_REQUEST R3 |
| 54 | `z1s3.prop.bed` | Rustic wooden captain bunk bed with striped blanket (target height 220 px) | M3 | ORIGINAL_REQUEST R3 |
| 55 | `z1s3.prop.nightstand` | Square wooden bedside drawer table (target height 142 px) | M3 | ORIGINAL_REQUEST R3 |
| 56 | `z1s3.prop.lamp` | Vintage brass hurricane lantern / lamp (target height 95 px) | M3 | ORIGINAL_REQUEST R3 |
| 57 | `z1s3.prop.easel_portrait` | Wooden easel with portrait, puzzle component 2 (target height 205 px) | M3 | ORIGINAL_REQUEST R3 |
| 58 | `z1s3.prop.hammer_bag` | Leather bag overflowing with hammers, puzzle component 1 (target height 79 px) | M3 | ORIGINAL_REQUEST R3 |
| 59 | `z1s3.prop.glue` | Industrial horse glue pot with brush, puzzle component 3 (target height 57 px) | M3 | ORIGINAL_REQUEST R3 |
| 60 | `z1s3.prop.dirty_laundry` | Disheveled heap of sailor dirty laundry (target height 79 px) | M3 | ORIGINAL_REQUEST R3 |
| 61 | `z1s3.fg.card_table` | Foreground round wooden chart/card table (target height 158 px) | M3 | ORIGINAL_REQUEST R3 |
| 62 | `z1s3.fg.ship_in_bottle` | Miniature sailing ship inside glass bottle (target height 79 px) | M3 | ORIGINAL_REQUEST R3 |
| 63 | `z1s3.fg.chest` | Iron-banded wooden pirate sea chest (target height 173 px) | M3 | ORIGINAL_REQUEST R3 |
| 64 | `z1s3.fg.clown_bust` | Porcelain grinning clown bust relic (target height 110 px) | M3 | ORIGINAL_REQUEST R3 |
| 65 | `z1s3.fg.voodoo_doll` | Stitched burlap voodoo doll with button eyes (target height 69 px) | M3 | ORIGINAL_REQUEST R3 |
| 66 | `z1s3.fg.hull_rib_left` | Massive arched riveted iron hull rib girder left (target height 900 px) | M3 | ORIGINAL_REQUEST R3 |
| 67 | `z1s3.fg.hull_rib_right` | Massive arched riveted iron hull rib girder right (target height 900 px) | M3 | ORIGINAL_REQUEST R3 |
| 68 | `layout/z1s3.layout.json` | 2400x900 room layout with 6 parallax planes, floor baseline 820, and characters | M4 | ORIGINAL_REQUEST R4 |
| 69 | `review/layout_shots/` | Panoramic (2400x900) and 3 camera window preview renders (left, center, right) | M4 | ORIGINAL_REQUEST R4 |
| 70 | `review/review_sheet.html` | Interactive review light table with Captain Dread puppet controls and shots tab | M4 | ORIGINAL_REQUEST R4 |
| 71 | `BITACORA.md` logging | Append-only structured logs for all 65 candidates, sessions, and zero em-dashes | M4 | ORIGINAL_REQUEST R4 |
| 72 | Workspace Mirroring | Complete mirror sync to c:\Users\alexb\Documents\GrokBotHandoff\moonstorm-v2 | M4 | ORIGINAL_REQUEST R4 |
| 73 | Acceptance & Forensic Audit | Verification of all gate checks, critic verdicts, and zero cheating veto | M5 | Acceptance Criteria |

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Smoothface L2/L3 & Rig | 1 body piece (`hand_back.point`), 5 emotions, 2 hand props, `characters/smoothface/rig.json` | none | PLANNED |
| M2 | Captain Dread L4/L5 & Rig | 10 L4 pieces, 12 L5 pieces, `characters/capdread/rig.json` (standing height 330 px without hat) | none | PLANNED |
| M3 | Z1S3 Scenery & Props L6-L10 | 7 L6 hull, 8 L7 wall, 6 L8 furniture, 7 L9 bed/puzzle, 7 L10 foreground pieces (35 total) | none | PLANNED |
| M4 | Layout, Review Sheet, Bitacora & Mirror | `layout/z1s3.layout.json`, `review/layout_shots/`, `review/review_sheet.html`, `BITACORA.md`, workspace mirror | M1, M2, M3 | PLANNED |
| M5 | Final Quality Verification & Audit | Programmatic gate verification, dual critic consensus, forensic integrity audit | M1, M2, M3, M4 | PLANNED |

## Interface Contracts

### Candidate Storage Contract (`art/candidates/<id>/`)
Every candidate piece must supply:
- `meta.json`: `"id"`, `"category"`, `"kind"`, `"what"`, `"target_height_px"`, `"height_fraction_of_smoothface"`, `"references"`, `"versions"`, `"status": "proposed"`, `"proposed_version": "v1"`.
- `prompt_v1.txt`: Exact prompt used for asset synthesis.
- `v1_raw.png`: Raw image output.
- `v1.png`: Cleaned, normalized, rescaled RGBA PNG.
- `gates_v1.json` and `v1.gates.json`: Output from `python pipeline/gates.py check art/candidates/<id>/v1.png --meta art/candidates/<id>/meta.json`.
- `critic_style_v1.json`: Evaluated against `.agents/skills/style-critic/SKILL.md` (`verdict: "sin_objeciones"`, `defects: []`).
- `critic_anatomy_v1.json`: Evaluated against `.agents/skills/anatomy-critic/SKILL.md` (`verdict: "sin_objeciones"`, `defects: []`).
- `v1.critics.json`: Combined critic evaluation dictionary.

### Rig Specification Contract (`characters/<id>/rig.json`)
- Top-level attributes: `"id"`, `"name"`, `"height_px"`, `"height_tolerance": 0.04`, `"facing_default": 1`, `"canvas"`, `"root": "torso"`.
- `"parts"` dictionary: Maps part keys to `asset` relative path, `z_index`, `parent`, `offset`: [x, y], `size`: [w, h], and `pivots`.
- `"variant_groups"` dictionary: Defines swappable groups (`eyes`, `brows`, `hand_front`, `hand_back`) with active default and sub-asset definitions.

### Room Layout Contract (`layout/z1s3.layout.json`)
- Panoramic dimensions: 2400 x 900 px. Viewport: 1600 x 900 px.
- 6 parallax planes: `exterior` (0.25), `wall` (0.82), `wall_props` (0.88), `floor` (1.00, `y_sort: true`), `foreground` (1.22), `ribs` (1.35).
- All referenced asset files must exist and resolve.
- Hotspot bounding box overlaps must remain below 30%.
- Interactive floor objects must remain within the room perimeter.

## Code Layout
- `pipeline/`: Automation tools (`gates.py`, `palette.json`, `heights.json`, `rules.json`, `approve.py`).
- `art/references/`: Visual source of truth (ref designs, room layout, hero assets).
- `art/approved/`: Director approved assets and `MANIFEST.json` (STRICTLY READ-ONLY).
- `art/candidates/<id>/`: Proposed asset working folders.
- `characters/<id>/`: Rig definitions (`characters/smoothface/rig.json`, `characters/capdread/rig.json`).
- `layout/`: Room definitions (`layout/z1s3.layout.json`).
- `review/`: Review server, interactive light table, and layout shots (`review/review_sheet.html`, `review/layout_shots/`).
- `BITACORA.md`: Authoritative append-only development log.
- `.agents/teamwork/`: Orchestrator and agent metadata folders.
