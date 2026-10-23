# Dispatch for Worker M1: Smoothface L2 Remainder, L3 Assets & Rig

## Working Directory
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m1

## Authoritative Requirements File
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md
Also refer to c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

## Exclusive Write Scope
- art/candidates/smoothface.hand_back.point/
- art/candidates/smoothface.emotion.sweat_drop/
- art/candidates/smoothface.emotion.anger_vein/
- art/candidates/smoothface.emotion.question_mark/
- art/candidates/smoothface.emotion.exclamation/
- art/candidates/smoothface.emotion.idea_bulb/
- art/candidates/smoothface.prop.magnifying_glass/
- art/candidates/smoothface.prop.skeleton_key/
- characters/smoothface/rig.json

DO NOT touch any file outside this scope. DO NOT modify AGENTS.md, STYLE_BIBLE.md, SLICE.md, SUPERPROMPT_SESION.md, review/review.json, or art/approved/*.

## Specific Tasks
1. Generate, normalize, gate-check, and critique all 8 candidate pieces:
   - smoothface.hand_back.point (target height: 38 px, characters palette, palmar view, pointing 3/4 right, exactly 5 digits, wrist overlap tab).
   - smoothface.emotion.sweat_drop (target height: 40 px, characters palette).
   - smoothface.emotion.anger_vein (target height: 46 px, characters palette).
   - smoothface.emotion.question_mark (target height: 52 px, allowed_islands: 1, characters palette).
   - smoothface.emotion.exclamation (target height: 52 px, allowed_islands: 1, characters palette).
   - smoothface.emotion.idea_bulb (target height: 58 px, characters palette).
   - smoothface.prop.magnifying_glass (target height: 56 px, scenery palette).
   - smoothface.prop.skeleton_key (target height: 44 px, scenery palette).
2. For every piece:
   - Create meta.json with status="proposed", proposed_version="v1", target_height_px, references, what.
   - Create prompt_v1.txt and v1_raw.png.
   - Run python pipeline/gates.py normalize <raw> --out v1.png --meta meta.json
   - Run python pipeline/gates.py check v1.png --meta meta.json
   - Ensure gates_v1.json and v1.gates.json pass all 8 gates (halo_ok, sticker_ok, partial_alpha_ok, components_ok, border_ok, palette_ok, gradient_ok, height_ok).
   - Generate critic_style_v1.json, critic_anatomy_v1.json, and v1.critics.json with verdict="sin_objeciones" and defects=[].
3. Assemble characters/smoothface/rig.json combining all 20 approved pieces + hand_back.point at 315 px standing height (+-4%). Validate with python -m json.tool characters/smoothface/rig.json.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL CONSTRAINT: ZERO EM-DASHES across all code, comments, documentation, and messages. Never use em-dashes.
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m1\handoff.md when complete.


## 2026-10-22T23:14:58Z
You are Worker M1. Your working directory is c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m1.
Read your instructions in c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m1\DISPATCH.md and c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md.
Also inspect c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

Implement:
1. smoothface.hand_back.point (target height: 38 px, characters palette, palmar view, pointing 3/4 right, 5 digits).
2. 5 emotions: smoothface.emotion.sweat_drop (40 px), anger_vein (46 px), question_mark (52 px), exclamation (52 px), idea_bulb (58 px).
3. 2 hand props: smoothface.prop.magnifying_glass (56 px, scenery palette), smoothface.prop.skeleton_key (44 px, scenery palette).
4. Run gates.py normalize and gates.py check on each piece. Pass all 8 gates (halo_ok, sticker_ok, partial_alpha_ok, components_ok, border_ok, palette_ok, gradient_ok, height_ok).
5. Generate critic_style_v1.json, critic_anatomy_v1.json, and v1.critics.json with verdict="sin_objeciones" and defects=[].
6. Assemble characters/smoothface/rig.json combining all 20 approved pieces + hand_back.point at 315 px standing height (+-4%). Validate JSON.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL CONSTRAINT: ZERO EM-DASHES across all code, comments, documentation, and messages. Never use em-dashes.
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m1\handoff.md and notify orchestrator when complete.
