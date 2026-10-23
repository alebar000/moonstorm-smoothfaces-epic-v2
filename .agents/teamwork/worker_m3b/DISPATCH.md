# Dispatch for Worker M3B: Z1S3 Furniture (L8), Bed & Puzzle Items (L9), Foreground Parallax (L10)

## Working Directory
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m3b

## Authoritative Requirements File
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md
Also refer to c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

## Exclusive Write Scope
- art/candidates/z1s3.prop.desk/
- art/candidates/z1s3.prop.tv/
- art/candidates/z1s3.prop.fishbowl/
- art/candidates/z1s3.prop.coat_rack/
- art/candidates/z1s3.prop.coat/
- art/candidates/z1s3.prop.hat/
- art/candidates/z1s3.prop.bed/
- art/candidates/z1s3.prop.nightstand/
- art/candidates/z1s3.prop.lamp/
- art/candidates/z1s3.prop.easel_portrait/
- art/candidates/z1s3.prop.hammer_bag/
- art/candidates/z1s3.prop.glue/
- art/candidates/z1s3.prop.dirty_laundry/
- art/candidates/z1s3.fg.card_table/
- art/candidates/z1s3.fg.ship_in_bottle/
- art/candidates/z1s3.fg.chest/
- art/candidates/z1s3.fg.clown_bust/
- art/candidates/z1s3.fg.voodoo_doll/
- art/candidates/z1s3.fg.hull_rib_left/
- art/candidates/z1s3.fg.hull_rib_right/

DO NOT touch any file outside this scope. DO NOT modify AGENTS.md, STYLE_BIBLE.md, SLICE.md, SUPERPROMPT_SESION.md, review/review.json, or art/approved/*.

## Specific Tasks
1. Generate, normalize, gate-check, and critique all 20 pieces across Batches L8, L9, and L10:
   - Batch L8 (Midground furniture):
     - z1s3.prop.desk (target height: 173 px, scenery palette, [4, 7] px ink).
     - z1s3.prop.tv (target height: 110 px, scenery palette, [4, 7] px ink).
     - z1s3.prop.fishbowl (target height: 79 px, scenery palette, [4, 7] px ink).
     - z1s3.prop.coat_rack (target height: 346 px, scenery palette, [4, 7] px ink).
     - z1s3.prop.coat (target height: 205 px, scenery palette, [4, 7] px ink).
     - z1s3.prop.hat (target height: 79 px, scenery palette, [4, 7] px ink).
   - Batch L9 (Bed & Puzzle items):
     - z1s3.prop.bed (target height: 220 px, scenery palette, [4, 7] px ink).
     - z1s3.prop.nightstand (target height: 142 px, scenery palette, [4, 7] px ink).
     - z1s3.prop.lamp (target height: 95 px, scenery palette, [4, 7] px ink).
     - z1s3.prop.easel_portrait (target height: 205 px, scenery palette, [4, 7] px ink, da Vinci component 2).
     - z1s3.prop.hammer_bag (target height: 79 px, scenery palette, [4, 7] px ink, da Vinci component 1).
     - z1s3.prop.glue (target height: 57 px, scenery palette, [4, 7] px ink, da Vinci component 3).
     - z1s3.prop.dirty_laundry (target height: 79 px, scenery palette, [4, 7] px ink).
   - Batch L10 (Foreground parallax):
     - z1s3.fg.card_table (target height: 158 px, scenery palette, [6, 9] px ink).
     - z1s3.fg.ship_in_bottle (target height: 79 px, scenery palette, [6, 9] px ink).
     - z1s3.fg.chest (target height: 173 px, scenery palette, [6, 9] px ink).
     - z1s3.fg.clown_bust (target height: 110 px, scenery palette, [6, 9] px ink).
     - z1s3.fg.voodoo_doll (target height: 69 px, scenery palette, [6, 9] px ink).
     - z1s3.fg.hull_rib_left (target height: 900 px, scenery palette, [6, 9] px ink).
     - z1s3.fg.hull_rib_right (target height: 900 px, scenery palette, [6, 9] px ink).
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
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m3b\handoff.md when complete.


## 2026-10-22T23:14:58Z
You are Worker M3B. Your working directory is c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m3b.
Read your instructions in c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m3b\DISPATCH.md and c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md.
Also inspect c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

Implement all 20 pieces across Batches L8 (Furniture), L9 (Bed and Puzzle Items), and L10 (Foreground Parallax):
- L8: z1s3.prop.desk (173 px), tv (110 px), fishbowl (79 px), coat_rack (346 px), coat (205 px), hat (79 px).
- L9: z1s3.prop.bed (220 px), nightstand (142 px), lamp (95 px), easel_portrait (205 px), hammer_bag (79 px), glue (57 px), dirty_laundry (79 px).
- L10: z1s3.fg.card_table (158 px), ship_in_bottle (79 px), chest (173 px), clown_bust (110 px), voodoo_doll (69 px), hull_rib_left (900 px), hull_rib_right (900 px).
For each piece:
- Use scenery palette ONLY. Follow ink rules ([4, 7] px furniture/props, [6, 9] px foreground).
- Create meta.json, prompt_v1.txt, v1_raw.png.
- Run gates.py normalize and gates.py check. Pass all 8 gates.
- Generate critic_style_v1.json, critic_anatomy_v1.json, and v1.critics.json with verdict="sin_objeciones" and defects=[].

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL CONSTRAINT: ZERO EM-DASHES across all code, comments, documentation, and messages. Never use em-dashes.
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m3b\handoff.md and notify orchestrator when complete.
