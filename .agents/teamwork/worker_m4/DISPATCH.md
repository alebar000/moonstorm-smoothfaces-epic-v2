# Dispatch for Worker M4: Room Layout, Review Sheet, Bitacora & Workspace Mirror

## Working Directory
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m4

## Authoritative Requirements File
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md
Also refer to c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

## Exclusive Write Scope
- layout/z1s3.layout.json
- review/layout_shots/
- review/review_sheet.html
- BITACORA.md
- Mirror target: c:\Users\alexb\Documents\GrokBotHandoff\moonstorm-v2

DO NOT touch AGENTS.md, STYLE_BIBLE.md, SLICE.md, SUPERPROMPT_SESION.md, review/review.json, or art/approved/*.

## Specific Tasks
1. Room Layout (layout/z1s3.layout.json):
   - Assemble layout/z1s3.layout.json placing all L6-L10 scenery pieces and both character rigs (smoothface at 315 px, capdread at 330 px) inside the 2400x900 Z1S3 panoramic room.
   - Parallax planes: exterior (0.25), wall (0.82), wall_props (0.88), floor (1.00, y_sort: true), foreground (1.22), ribs (1.35).
   - Foot baseline: y=820. Walkable polygon: [[120, 640], [2280, 640], [2280, 860], [120, 860]].
   - Validate layout with: python pipeline/gates.py layout layout/z1s3.layout.json
2. Layout Shots (review/layout_shots/):
   - Generate panoramic and camera window preview renders into review/layout_shots/:
     - 01_panorama_2400x900.png (full panoramic render with all layers and characters)
     - 02_camera_left_0_1600.png (camera at x=0, viewport 1600x900)
     - 03_camera_center_400_2000.png (camera at x=400 to 2000, viewport 1600x900)
     - 04_camera_right_800_2400.png (camera at x=800 to 2400, viewport 1600x900)
3. Interactive Review Sheet (review/review_sheet.html):
   - Update review/review_sheet.html so Alex can inspect every proposed candidate piece at http://localhost:8765.
   - Implement interactive Captain Dread puppet preview alongside Smoothface:
     - Toggle between Smoothface Puppet and Captain Dread Puppet.
     - Controls for Captain Dread: eyes (normal, closed, squint, hide), brows (normal, angry, surprised, hide), front hand (fist, open, point, hide), back hand (fist, open, hide), hat (on/off), beard (visible/hide).
     - Layer dragging and coordinates readout.
   - Ensure the layout shots tab renders the layout shots from /api/shots.
4. BITACORA.md:
   - Append structured entries for all 65 candidate pieces in the rigid format from .agents/skills/bitacora/SKILL.md (zero adjectives, exact metrics, zero em-dashes).
   - Append session closing entry for Batches L2-L10.
5. Workspace Mirroring:
   - Synchronize workspace to c:\Users\alexb\Documents\GrokBotHandoff\moonstorm-v2 (exclude .git/, node_modules/, and .agents/teamwork/).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL CONSTRAINT: ZERO EM-DASHES across all code, comments, documentation, and messages. Never use em-dashes.
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m4\handoff.md when complete.


## 2026-10-22T23:39:58Z
You are Worker M4. Your working directory is c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m4.
Read your instructions in c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\worker_m4\DISPATCH.md and c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md.
Also inspect c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

Execute Milestone M4:
1. Room Layout: Assemble layout/z1s3.layout.json placing all L6-L10 pieces, smoothface (315 px), and capdread (330 px) across 6 parallax planes. Validate with python pipeline/gates.py layout layout/z1s3.layout.json.
2. Layout Preview Shots: Render 01_panorama_2400x900.png, 02_camera_left_0_1600.png, 03_camera_center_400_2000.png, 04_camera_right_800_2400.png into review/layout_shots/.
3. Interactive Review Sheet: Update review/review_sheet.html with Captain Dread puppet controls (eyes, brows, hands, hat, beard) and layout shots preview.
4. BITACORA.md: Append candidate entries for all 65 candidate pieces and session summary following .agents/skills/bitacora/SKILL.md.
5. Workspace Mirror: Mirror files to c:\Users\alexb\Documents\GrokBotHandoff\moonstorm-v2.
