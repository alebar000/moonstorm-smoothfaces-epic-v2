# Handoff Report - Explorer Survey 2

Date: 2026-10-22
From: Explorer Survey 2
To: Orchestrator (b365cee7-e430-4a32-b9b8-31eb331690aa)
Subject: Character Rigs, Animation Specifications, and Character Parts Survey Complete

---

## 1. Observation

1. **Missing Directory & Rigs**: `find_by_name` and directory listing of `c:\AntiGravityStuff\Moonstorm2` confirmed that directory `characters/` does not exist yet. Neither `characters/smoothface/rig.json` nor `characters/capdread/rig.json` has been created.
2. **Approved Smoothface Assets**: Direct inspection of `art/approved/MANIFEST.json` lines 23-243 and `art/approved/smoothface/` confirmed 20 approved Smoothface pieces:
   - Torso: `smoothface.torso` (255x271 px)
   - Head: `smoothface.head` (144x151 px)
   - Eyes: `smoothface.eyes.normal` (72x58 px), `smoothface.eyes.closed` (78x58 px), `smoothface.eyes.squint` (81x60 px)
   - Brows: `smoothface.brows.normal` (96x50 px), `smoothface.brows.angry` (84x59 px), `smoothface.brows.surprised` (76x57 px)
   - Arms: `smoothface.arm_front` (135x108 px), `smoothface.arm_back` (131x104 px)
   - Front Hands: `smoothface.hand_front.fist` (41x44 px), `smoothface.hand_front.open` (48x48 px), `smoothface.hand_front.point` (72x50 px)
   - Back Hands: `smoothface.hand_back.fist` (48x42 px), `smoothface.hand_back.open` (46x46 px)
   - Pants: `smoothface.pants` (84x81 px)
   - Legs: `smoothface.leg_front` (40x68 px), `smoothface.leg_back` (49x68 px)
   - Shoes: `smoothface.shoe_front` (84x59 px), `smoothface.shoe_back` (84x59 px)
   - Exactly ONE piece is missing from Smoothface's limbs: `smoothface.hand_back.point` (target height 38 px).
3. **Canon Omissions**: `ORIGINAL_REQUEST.md` line 22 states: "L2 closure (omitting `smoothface.hair_tuft` and `smoothface.mouth.*` per canon)". In `art/approved/MANIFEST.json` line 267, `smoothface.mouth.closed@v3` was rejected on 2026-10-21 with note "canon".
4. **Height & Palette Rules**:
   - `pipeline/heights.json`: `"smoothface": 315`, `"capdread": 330`, `"tolerance": 0.04`.
   - `STYLE_BIBLE.md` line 103: "De la planta de los pies a la coronilla, sin sombrero. Misma foot_baseline en todos los sprites de un personaje."
   - `pipeline/palette.json`: `"kind_to_palette": {"body_part": "characters", "emotion": "characters", "prop": "scenery"}`.
   - `pipeline/rules.json`: `"ink_by_kind": {"body_part": [6, 9], "emotion": [6, 9], "prop": [4, 7], "wall": [3, 5]}`.
5. **Interactive Review Puppet**: `review/review_sheet.html` lines 210-246 define `DEFAULT_OFFSETS` matching all approved Smoothface dimensions, with layer z-indexes: `shoe_back`: 10, `leg_back`: 11, `shoe_front`: 12, `leg_front`: 13, `pants`: 14, `hand_back`: 17, `arm_back`: 18, `head`: 20, `eyes`: 22, `brows`: 23, `torso`: 30, `hand_front`: 40, `arm_front`: 41. There is no Captain Dread puppet implemented in `review_sheet.html` yet.
6. **Calibrated Critic Rubrics**:
   - `BITACORA.md` lines 926-929 and `.agents/skills/anatomy-critic/SKILL.md` point 7: Alex's review calibrated the critic to reject hands that do not have exactly 5 digits (1 thumb + 4 fingers) and to enforce chirality (in 3/4 facing right, `hand_front.*` is anatomical right hand in dorsal view, while `hand_back.*` is anatomical left hand in palmar view).
   - `.agents/skills/style-critic/SKILL.md`: Enforces hostile art direction, rough scissor cut facets for characters/emotions, 6-9 px ink for body parts/emotions, zero off-palette colors, zero digital gradients/airbrush, and zero baked drop shadows.

---

## 2. Logic Chain

1. From Observation 1, the character rig files do not exist on disk, but the underlying system expects them at `characters/smoothface/rig.json` and `characters/capdread/rig.json` as specified in `ORIGINAL_REQUEST.md` line 5 and line 53.
2. From Observation 2, 20 of the 21 Smoothface body parts are already approved and reside in `art/approved/smoothface/`. The only missing body part is `smoothface.hand_back.point`.
3. From Observation 2, 3, and 6, generating `smoothface.hand_back.point` requires `target_height_px: 38`, 5 digits (1 thumb + 4 fingers), palmar view facing right, with a wrist tab tucking into `smoothface.arm_back`.
4. From Observation 4, Smoothface L3 assets comprise 5 separate emotion cut-out badges (`sweat_drop`, `anger_vein`, `question_mark`, `exclamation`, `idea_bulb`) using the `characters` palette and 6-9 px ink, and 2 hand-held props (`magnifying_glass`, `skeleton_key`) using the `scenery` palette and 4-7 px ink.
5. From Observation 4 and `ref_design_capdread.png`, Captain Dread stands 330 px without hat (±4% -> 316.8 to 343.2 px) and consists of 22 pieces across L4 (10 pieces: torso, head, hat, beard, eyes x3, brows x3) and L5 (12 pieces: arm_front, arm_back, hand_front x3, hand_back x2, pants, leg_front, leg_back, boot_front, boot_back).
6. From Observation 5, `review/review_sheet.html` currently supports only Smoothface. It must be upgraded to support Captain Dread's 22 pieces, layer dragging, and state toggles.
7. From Observation 6, all newly generated body and prop parts must strictly conform to the calibrated 5-digit count, hand chirality, and 3/4 facing alignment rubrics to pass `anatomy-critic` and `style-critic`.

---

## 3. Caveats

1. The exact joint positions for Captain Dread cannot be finalized until Captain Dread's candidate images (`v1.png`) are generated and normalized. However, the layer ordering (z: 10 to 41) and connection hierarchy are fully mapped out.
2. Question mark (`smoothface.emotion.question_mark`) and exclamation mark (`smoothface.emotion.exclamation`) have detached dots. In `meta.json`, setting `allowed_islands: 1` is necessary so `pipeline/gates.py` passes the components check.
3. No code in `src/` or assets in `art/approved/` were modified during this investigation, respecting read-only protocol.

---

## 4. Conclusion

The specification for character rigs and parts is complete, unambiguous, and ready for parallel generation:
- Smoothface L2 needs only `smoothface.hand_back.point` to complete the full 21-piece set and assemble `characters/smoothface/rig.json`.
- Smoothface L3 has 5 emotions (using character palette and 6-9 px ink) and 2 hand props (using scenery palette and 4-7 px ink).
- Captain Dread requires 22 pieces across Batches L4 and L5 at standing height 330 px without hat, a defined layer hierarchy (z: 10 to 41), and an interactive puppet panel in `review/review_sheet.html`.
- Critic rubrics are fully documented to guarantee first-pass approvals.

All findings are documented in detail in:
`c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\explorer_survey_2\survey_characters_report.md`

---

## 5. Verification Method

To independently verify these findings:
1. Verify approved Smoothface assets and dimensions:
   ```bash
   python -c "import os, PIL.Image; [print(f, PIL.Image.open(os.path.join('art/approved/smoothface', f)).size) for f in sorted(os.listdir('art/approved/smoothface')) if f.endswith('.png')]"
   ```
2. Verify height rules and palette bindings:
   Inspect `pipeline/heights.json`, `pipeline/palette.json`, and `pipeline/rules.json`.
3. Inspect the comprehensive character survey report:
   Inspect `c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\explorer_survey_2\survey_characters_report.md`.
4. Verify zero em-dashes constraint:
   ```bash
   python -c "text = open('c:/AntiGravityStuff/Moonstorm2/.agents/teamwork/explorer_survey_2/handoff.md', encoding='utf-8').read(); print('EM-DASH FOUND' if ('\u2014' in text) else 'OK')"
   ```
