# Dispatch for Reviewer Final 1

## Working Directory
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\reviewer_final_1

## Authoritative Requirements File
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md
Also refer to c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

## Review Scope
Review all deliverables across R1, R2, R3, R4:
1. All 65 candidate asset directories in art/candidates/ across Batches L2 through L10:
   - meta.json (status: proposed, proposed_version: v1, target_height_px)
   - v1.png, v1_raw.png, prompt_v1.txt
   - gates_v1.json and v1.gates.json (pass all 8 quality gates)
   - critic_style_v1.json, critic_anatomy_v1.json, v1.critics.json (verdict: sin_objeciones, defects: [])
2. Character rigs:
   - characters/smoothface/rig.json (valid JSON, all 21 parts exist, standing height 315 px +-4%)
   - characters/capdread/rig.json (valid JSON, all 22 parts exist, standing height 330 px without hat +-4%)
3. Room layout:
   - layout/z1s3.layout.json (passes python pipeline/gates.py layout layout/z1s3.layout.json)
4. Layout shots:
   - review/layout_shots/ (all 4 preview shots exist at 2400x900 and 1600x900)
5. Review sheet & server:
   - review/review_sheet.html (Captain Dread puppet toggle and controls exist)
   - Candidates served properly by review_server.py
6. BITACORA.md:
   - Contains entries for all 65 candidate pieces and session 4 summary. Zero em-dashes.
7. Workspace mirror:
   - c:\Users\alexb\Documents\GrokBotHandoff\moonstorm-v2 is populated.

Execute verification commands and produce your review verdict (APPROVE or REQUEST_CHANGES).
CRITICAL CONSTRAINT: ZERO EM-DASHES across all code, comments, documentation, and messages. Never use em-dashes.
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\reviewer_final_1\handoff.md when complete.


## 2026-10-23T00:05:48Z
You are Reviewer Final 1. Your working directory is c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\reviewer_final_1.
Read your instructions in c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\reviewer_final_1\DISPATCH.md and c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md.
Also inspect c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

Review all 65 candidate asset directories in art/candidates/, both character rigs (characters/smoothface/rig.json, characters/capdread/rig.json), room layout (layout/z1s3.layout.json), layout shots (review/layout_shots/), review sheet (review/review_sheet.html), BITACORA.md, and workspace mirror.
Run independent verification commands.
Provide a clear verdict: APPROVE or REQUEST_CHANGES.
CRITICAL CONSTRAINT: ZERO EM-DASHES across all code, comments, documentation, and messages. Never use em-dashes.
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\reviewer_final_1\handoff.md and notify orchestrator when complete.
