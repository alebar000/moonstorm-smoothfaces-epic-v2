# Teamwork Project Prompt - Draft

> Status: Launched
> Goal: Craft prompt -> get user approval -> delegate to teamwork_preview
> Requested team: Full parallel multi-agent team (massive parallel execution across batches L2-L10)

Use a very large team of agents in parallel to generate, normalize, gate-check, and adversarially critique all remaining character and environment cutout assets across batches L2 through L10 for *Smoothface's Epic* (Slice 1: `Z1S3` Captain Dread's Cabin), assembling the character rigs (`characters/smoothface/rig.json`, `characters/capdread/rig.json`), the room layout (`layout/z1s3.layout.json`), and the interactive review sheet (`review/review_sheet.html`) at `http://localhost:8765`.

Working directory: `c:\AntiGravityStuff\Moonstorm2`
Integrity mode: development

## Reference & Governance Material

- `AGENTS.md`, `STYLE_BIBLE.md`, `SLICE.md`, `SUPERPROMPT_SESION.md` (strictly read-only governance files; never modify `art/approved/*` or `review/review.json`)
- `pipeline/gates.py` (`normalize` and `check` subcommands), `pipeline/palette.json` (`approved` character and scenery palettes), `pipeline/heights.json` (`smoothface: 315 px`, `capdread: 330 px`)
- `.agents/skills/style-critic/SKILL.md` and `.agents/skills/anatomy-critic/SKILL.md` (calibrated rubrics including 3/4 facing direction, paired-part consistency, and dorsal vs palmar hand chirality with 5 digits)
- `art/references/ref_design_smoothface.png`, `art/references/ref_design_capdread.png`, `art/references/ref_room_z1s3_2010.png`, `art/references/ref_hero_torso.png`, `art/references/ref_hero_sarcophagus.png`, `art/references/ref_hero_wall_panel.png`
- `art/approved/MANIFEST.json` and `art/approved/smoothface/*` (17 approved pieces from L0, L1, L2a, L2b)

## Requirements

### R1. Complete Smoothface L2 Remainder & L3 (Rig, Pointing Back Hand, 5 Emotions, 2 Hand Props)
Generate, normalize (`gates.py normalize`), gate-check (`gates.py check`), and critique (`style-critic` + `anatomy-critic`) in parallel:
- **L2 closure** (omitting `smoothface.hair_tuft` and `smoothface.mouth.*` per canon):
  - `smoothface.hand_back.point` (`target_height_px: 38`, anatomical left hand pointing 3/4 right, palmar view, 5-digit consistency)
  - Assemble `characters/smoothface/rig.json` combining all approved Smoothface pieces (`torso`, `head`, `eyes.*`, `brows.*`, `arm_front`, `arm_back`, `hand_front.*`, `hand_back.*`, `pants`, `leg_front`, `leg_back`, `shoe_front`, `shoe_back`) at total standing height `315 px` (`±4%`).
- **L3 (Smoothface emotions ×5 + hand props ×2)**:
  - `smoothface.emotion.sweat_drop`, `smoothface.emotion.anger_vein`, `smoothface.emotion.question_mark`, `smoothface.emotion.exclamation`, `smoothface.emotion.idea_bulb`
  - `smoothface.prop.magnifying_glass`, `smoothface.prop.skeleton_key`

### R2. Complete Captain Dread Rig & Parts (Batches L4-L5)
Using `art/references/ref_design_capdread.png`, `art/references/ref_hero_torso.png`, and `pipeline/palette.json` (`characters` palette), generate, normalize, gate-check, and critique all body, face, and hat pieces of **Captain Dread** (standing height `330 px` without hat per `pipeline/heights.json`), and assemble `characters/capdread/rig.json` + interactive puppet preview in `review/review_sheet.html`:
- **L4 (Head, Hat, Torso, Eyes ×3, Brows ×3)**: `capdread.torso`, `capdread.head`, `capdread.hat`, `capdread.beard`, `capdread.eyes.normal`, `capdread.eyes.closed`, `capdread.eyes.squint`, `capdread.brows.normal`, `capdread.brows.angry`, `capdread.brows.surprised`
- **L5 (Limbs, Hands, Boots, Pelvis)**: `capdread.arm_front`, `capdread.arm_back`, `capdread.hand_front.fist`, `capdread.hand_front.open`, `capdread.hand_front.point`, `capdread.hand_back.fist`, `capdread.hand_back.open`, `capdread.pants`, `capdread.leg_front`, `capdread.leg_back`, `capdread.boot_front`, `capdread.boot_back`

### R3. Complete Z1S3 Captain Dread's Cabin Scenery & Props (Batches L6-L10)
Using `art/references/ref_room_z1s3_2010.png`, `art/references/ref_hero_wall_panel.png`, `art/references/ref_hero_sarcophagus.png`, and `pipeline/palette.json` (`scenery` palette), generate, normalize, gate-check, and critique all room structure and prop pieces across the 3 parallax planes (`2400x900` panoramic room):
- **L6 (Hull structure)**: `z1s3.wall.panel_b`, `z1s3.wall.panel_c`, `z1s3.wall.seam_strip`, `z1s3.floor.planks_a`, `z1s3.floor.planks_b`, `z1s3.ceiling.beam_a`, `z1s3.ceiling.beam_b`
- **L7 (Wall fixtures & props)**: `z1s3.wall.door`, `z1s3.wall.porthole`, `z1s3.wall.poster`, `z1s3.wall.mask_a`, `z1s3.wall.mask_b`, `z1s3.wall.helm_wheel`, `z1s3.wall.shelf`, `z1s3.wall.pipes`
- **L8 (Midground furniture)**: `z1s3.prop.desk`, `z1s3.prop.tv`, `z1s3.prop.fishbowl`, `z1s3.prop.coat_rack`, `z1s3.prop.coat`, `z1s3.prop.hat` (alongside already approved `z1s3.prop.sarcophagus`)
- **L9 (Bed & Puzzle items)**: `z1s3.prop.bed`, `z1s3.prop.nightstand`, `z1s3.prop.lamp`, `z1s3.prop.easel_portrait`, `z1s3.prop.hammer_bag`, `z1s3.prop.glue`, `z1s3.prop.dirty_laundry`
- **L10 (Foreground parallax)**: `z1s3.fg.card_table`, `z1s3.fg.ship_in_bottle`, `z1s3.fg.chest`, `z1s3.fg.clown_bust`, `z1s3.fg.voodoo_doll`, `z1s3.fg.hull_rib_left`, `z1s3.fg.hull_rib_right`

### R4. Room Layout, Interactive Review Table & Bitacora
- Assemble `layout/z1s3.layout.json` placing all L6-L10 room pieces and both character rigs (`smoothface` at `315 px`, `capdread` at `330 px`) inside the `2400x900` Z1S3 panoramic room, and render panoramic + camera-window preview shots into `review/layout_shots/`.
- Update `review/review_sheet.html` so Alex can inspect every proposed candidate piece in `http://localhost:8765`, toggle Smoothface and Captain Dread puppets interactively, and view the full `Z1S3` room layout shots.
- Record all piece entries in `BITACORA.md` (with zero em-dashes `—` anywhere) and mirror the workspace to `c:\Users\alexb\Documents\GrokBotHandoff\moonstorm-v2`.

## Acceptance Criteria

### Programmatic Gate & Critic Verification
- [ ] Every generated candidate directory `art/candidates/<id>/` has `meta.json` (`"status": "proposed"`, `"proposed_version": "vN"`), `vN.png`, `vN.gates.json`, `gates_vN.json`, `critic_style_vN.json`, `critic_anatomy_vN.json`, and `vN.critics.json`.
- [ ] Every proposed `vN.png` passes `halo_ok: true`, `sticker_ok: true`, `partial_alpha_ok: true`, `components_ok: true`, `border_ok: true`, `palette_ok: true`, `gradient_ok: true`, and `height_ok: true` in `vN.gates.json` (no manual pixel retouching; only `gates.py normalize`).
- [ ] Every proposed `vN.png` has `"verdict": "sin_objeciones"` from both `style-critic` and `anatomy-critic`.
- [ ] `characters/smoothface/rig.json`, `characters/capdread/rig.json`, and `layout/z1s3.layout.json` exist, are valid JSON, and have composite preview renders in `review/layout_shots/`.
- [ ] `http://localhost:8765/api/candidates` serves all newly proposed pieces and `git status` shows zero modifications to `AGENTS.md`, `STYLE_BIBLE.md`, `SLICE.md`, `review/review.json`, or `art/approved/*`.
