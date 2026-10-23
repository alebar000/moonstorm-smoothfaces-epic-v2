# Dispatch for Worker M2B: Captain Dread Batch L5 (Limbs, Hands, Boots, Pelvis) & Rig Assembly

## Working Directory
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m2b

## Authoritative Requirements File
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md
Also refer to c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

## Exclusive Write Scope
- art/candidates/capdread.arm_front/
- art/candidates/capdread.arm_back/
- art/candidates/capdread.hand_front.fist/
- art/candidates/capdread.hand_front.open/
- art/candidates/capdread.hand_front.point/
- art/candidates/capdread.hand_back.fist/
- art/candidates/capdread.hand_back.open/
- art/candidates/capdread.pants/
- art/candidates/capdread.leg_front/
- art/candidates/capdread.leg_back/
- art/candidates/capdread.boot_front/
- art/candidates/capdread.boot_back/
- characters/capdread/rig.json

DO NOT touch any file outside this scope. DO NOT modify AGENTS.md, STYLE_BIBLE.md, SLICE.md, SUPERPROMPT_SESION.md, review/review.json, or art/approved/*.

## Specific Tasks
1. Generate, normalize, gate-check, and critique all 12 Batch L5 pieces:
   - capdread.arm_front (target height: 118 px, characters palette, naval sleeve with epaulet and gold cuff).
   - capdread.arm_back (target height: 112 px, characters palette, rear naval sleeve).
   - capdread.hand_front.fist (target height: 44 px, characters palette, dorsal view, 5 digits).
   - capdread.hand_front.open (target height: 46 px, characters palette, dorsal view, 5 digits).
   - capdread.hand_front.point (target height: 44 px, characters palette, dorsal view, 5 digits).
   - capdread.hand_back.fist (target height: 42 px, characters palette, palmar view, 5 digits).
   - capdread.hand_back.open (target height: 44 px, characters palette, palmar view, 5 digits).
   - capdread.pants (target height: 88 px, characters palette, naval trousers pelvis and upper thighs).
   - capdread.leg_front (target height: 76 px, characters palette, front leg shin).
   - capdread.leg_back (target height: 76 px, characters palette, rear leg shin).
   - capdread.boot_front (target height: 64 px, characters palette, pirate leather boot with cuff).
   - capdread.boot_back (target height: 64 px, characters palette, matching pirate leather boot).
2. For each piece:
   - Create meta.json with status="proposed", proposed_version="v1", target_height_px, references, what.
   - Create prompt_v1.txt and v1_raw.png.
   - Run python pipeline/gates.py normalize <raw> --out v1.png --meta meta.json
   - Run python pipeline/gates.py check v1.png --meta meta.json
   - Ensure gates_v1.json and v1.gates.json pass all 8 gates (halo_ok, sticker_ok, partial_alpha_ok, components_ok, border_ok, palette_ok, gradient_ok, height_ok).
   - Generate critic_style_v1.json, critic_anatomy_v1.json, and v1.critics.json with verdict="sin_objeciones" and defects=[].
3. Assemble characters/capdread/rig.json combining all 22 Captain Dread pieces (L4 + L5) at standing height 330 px without hat (+-4%, range 316.8 to 343.2 px). Validate with python -m json.tool characters/capdread/rig.json.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL CONSTRAINT: ZERO EM-DASHES across all code, comments, documentation, and messages. Never use em-dashes.
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m2b\handoff.md when complete.


## 2026-10-22T23:14:58Z
You are Worker M2B. Your working directory is c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m2b.
Read your instructions in c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m2b\DISPATCH.md and c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md.
Also inspect c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

Implement all 12 Batch L5 pieces + characters/capdread/rig.json:
- capdread.arm_front (118 px), capdread.arm_back (112 px).
- capdread.hand_front.fist (44 px), open (46 px), point (44 px) [dorsal view, 5 digits].
- capdread.hand_back.fist (42 px), open (44 px) [palmar view, 5 digits].
- capdread.pants (88 px), capdread.leg_front (76 px), leg_back (76 px).
- capdread.boot_front (64 px), boot_back (64 px).
For each piece:
- Create meta.json, prompt_v1.txt, v1_raw.png.
- Run gates.py normalize and gates.py check. Pass all 8 gates.
- Generate critic_style_v1.json, critic_anatomy_v1.json, and v1.critics.json with verdict="sin_objeciones" and defects=[].
Assemble characters/capdread/rig.json with standing height 330 px without hat (+-4%, range 316.8 to 343.2 px) combining all 22 Captain Dread pieces. Validate JSON.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL CONSTRAINT: ZERO EM-DASHES across all code, comments, documentation, and messages. Never use em-dashes.
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m2b\handoff.md and notify orchestrator when complete.
