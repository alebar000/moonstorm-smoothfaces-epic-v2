# Dispatch for Worker M3A: Z1S3 Hull Structure (L6) & Wall Fixtures (L7)

## Working Directory
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m3a

## Authoritative Requirements File
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md
Also refer to c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

## Exclusive Write Scope
- art/candidates/z1s3.wall.panel_b/
- art/candidates/z1s3.wall.panel_c/
- art/candidates/z1s3.wall.seam_strip/
- art/candidates/z1s3.floor.planks_a/
- art/candidates/z1s3.floor.planks_b/
- art/candidates/z1s3.ceiling.beam_a/
- art/candidates/z1s3.ceiling.beam_b/
- art/candidates/z1s3.wall.door/
- art/candidates/z1s3.wall.porthole/
- art/candidates/z1s3.wall.poster/
- art/candidates/z1s3.wall.mask_a/
- art/candidates/z1s3.wall.mask_b/
- art/candidates/z1s3.wall.helm_wheel/
- art/candidates/z1s3.wall.shelf/
- art/candidates/z1s3.wall.pipes/

DO NOT touch any file outside this scope. DO NOT modify AGENTS.md, STYLE_BIBLE.md, SLICE.md, SUPERPROMPT_SESION.md, review/review.json, or art/approved/*.

## Specific Tasks
1. Generate, normalize, gate-check, and critique all 15 pieces across Batches L6 and L7:
   - Batch L6 (Hull structure):
     - z1s3.wall.panel_b (target height: 900 px, width 600 px, scenery palette, [3, 5] px ink).
     - z1s3.wall.panel_c (target height: 900 px, width 600 px, scenery palette, [3, 5] px ink).
     - z1s3.wall.seam_strip (target height: 900 px, width 40 px, scenery palette, [3, 5] px ink).
     - z1s3.floor.planks_a (target height: 260 px, width 800 px, scenery palette, [4, 7] px ink).
     - z1s3.floor.planks_b (target height: 260 px, width 800 px, scenery palette, [4, 7] px ink).
     - z1s3.ceiling.beam_a (target height: 160 px, width 800 px, scenery palette, [3, 5] px ink).
     - z1s3.ceiling.beam_b (target height: 160 px, width 800 px, scenery palette, [3, 5] px ink).
   - Batch L7 (Wall fixtures & props):
     - z1s3.wall.door (target height: 410 px, scenery palette, [3, 5] px ink).
     - z1s3.wall.porthole (target height: 180 px, scenery palette, [3, 5] px ink).
     - z1s3.wall.poster (target height: 126 px, scenery palette, [3, 5] px ink).
     - z1s3.wall.mask_a (target height: 80 px, scenery palette, [3, 5] px ink).
     - z1s3.wall.mask_b (target height: 80 px, scenery palette, [3, 5] px ink).
     - z1s3.wall.helm_wheel (target height: 160 px, scenery palette, [3, 5] px ink, da Vinci component 4).
     - z1s3.wall.shelf (target height: 95 px, scenery palette, [3, 5] px ink).
     - z1s3.wall.pipes (target height: 110 px, scenery palette, [3, 5] px ink).
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
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m3a\handoff.md when complete.

## 2026-10-22T23:14:58Z
Received dispatch for Worker M3A: Batches L6 and L7 (15 pieces).
