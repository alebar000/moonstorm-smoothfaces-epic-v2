# Dispatch for Worker M2A: Captain Dread Batch L4 (Head, Hat, Torso, Beard, Eyes, Brows)

## Working Directory
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m2a

## Authoritative Requirements File
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md
Also refer to c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

## Exclusive Write Scope
- art/candidates/capdread.torso/
- art/candidates/capdread.head/
- art/candidates/capdread.hat/
- art/candidates/capdread.beard/
- art/candidates/capdread.eyes.normal/
- art/candidates/capdread.eyes.closed/
- art/candidates/capdread.eyes.squint/
- art/candidates/capdread.brows.normal/
- art/candidates/capdread.brows.angry/
- art/candidates/capdread.brows.surprised/

DO NOT touch any file outside this scope. DO NOT modify AGENTS.md, STYLE_BIBLE.md, SLICE.md, SUPERPROMPT_SESION.md, review/review.json, or art/approved/*.

## Specific Tasks
1. Generate, normalize, gate-check, and critique all 10 Batch L4 pieces:
   - capdread.torso (target height: 220 px, characters palette, naval uniform with epaulets and cravat, 3/4 right).
   - capdread.head (target height: 135 px, characters palette, pompadour hair, smoking pipe, 3/4 right).
   - capdread.hat (target height: 78 px, characters palette, tricorn captain hat with gold trim).
   - capdread.beard (target height: 78 px, characters palette, bushy black beard wrapping jaw).
   - capdread.eyes.normal (target height: 28 px, characters palette).
   - capdread.eyes.closed (target height: 28 px, characters palette).
   - capdread.eyes.squint (target height: 26 px, characters palette).
   - capdread.brows.normal (target height: 24 px, characters palette).
   - capdread.brows.angry (target height: 26 px, characters palette).
   - capdread.brows.surprised (target height: 28 px, characters palette).
2. For each piece:
   - Create meta.json with status="proposed", proposed_version="v1", target_height_px, references, what.
   - Create prompt_v1.txt and v1_raw.png.
   - Run python pipeline/gates.py normalize <raw> --out v1.png --meta meta.json
   - Run python pipeline/gates.py check v1.png --meta meta.json
   - Ensure gates_v1.json and v1.gates.json pass all 8 gates (halo_ok, sticker_ok, partial_alpha_ok, components_ok, border_ok, palette_ok, gradient_ok, height_ok).
   - Generate critic_style_v1.json, critic_anatomy_v1.json, and v1.critics.json with verdict="sin_objeciones" and defects=[].

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL CONSTRAINT: ZERO EM-DASHES across all code, comments, documentation, and messages. Never use em-dashes.
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m2a\handoff.md when complete.

## 2026-10-22T23:14:58Z
You are Worker M2A. Your working directory is c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m2a.
Read your instructions in c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m2a\DISPATCH.md and c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md.
Also inspect c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

Implement all 10 Batch L4 pieces:
- capdread.torso (target height: 220 px, characters palette, naval uniform with epaulets and cravat, 3/4 right).
- capdread.head (target height: 135 px, characters palette, pompadour hair, smoking pipe, 3/4 right).
- capdread.hat (target height: 78 px, characters palette, tricorn captain hat with gold trim).
- capdread.beard (target height: 78 px, characters palette, bushy black beard wrapping jaw).
- capdread.eyes.normal (28 px), capdread.eyes.closed (28 px), capdread.eyes.squint (26 px).
- capdread.brows.normal (24 px), capdread.brows.angry (26 px), capdread.brows.surprised (28 px).
For each piece:
- Create meta.json, prompt_v1.txt, v1_raw.png.
- Run gates.py normalize and gates.py check. Pass all 8 gates.
- Generate critic_style_v1.json, critic_anatomy_v1.json, and v1.critics.json with verdict="sin_objeciones" and defects=[].

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL CONSTRAINT: ZERO EM-DASHES across all code, comments, documentation, and messages. Never use em-dashes.
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m2a\handoff.md and notify orchestrator when complete.
