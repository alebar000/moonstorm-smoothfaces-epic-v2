# Dispatch for Challenger Final 2

## Working Directory
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\challenger_final_2

## Authoritative Requirements File
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md
Also refer to c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

## Adversarial Challenge Scope
Write and execute automated stress harnesses to empirically challenge:
1. Room layout stress test:
   - Run gates.py layout layout/z1s3.layout.json and verify 0 errors and 0 warnings.
   - Test every object referenced in layout/z1s3.layout.json to verify asset paths resolve on disk and image dimensions match declared sizes.
   - Compute pairwise intersection-over-union / overlap area on all interactive floor hotspots; assert no overlap exceeds 30%.
   - Verify that all floor objects stay within the room horizontal range [0, 2400] and vertical range [0, 900].
2. Layout preview images:
   - Verify that 01_panorama_2400x900.png has exact dimensions (2400, 900) and is non-empty.
   - Verify that 02_camera_left_0_1600.png, 03_camera_center_400_2000.png, and 04_camera_right_800_2400.png have exact dimensions (1600, 900).
3. Review server API test:
   - Instantiate review_server or invoke its endpoints to verify /api/candidates returns all 65 candidate pieces.
   - Verify that /api/shots returns all 4 layout preview images.
4. Workspace mirror integrity:
   - Verify file counts and presence of all key assets in c:\Users\alexb\Documents\GrokBotHandoff\moonstorm-v2.

Produce your verdict (APPROVE or REQUEST_CHANGES).
CRITICAL CONSTRAINT: ZERO EM-DASHES across all code, comments, documentation, and messages. Never use em-dashes.
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\challenger_final_2\handoff.md when complete.


## 2026-10-23T00:05:48Z
You are Challenger Final 2. Your working directory is c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\challenger_final_2.
Read your instructions in c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\challenger_final_2\DISPATCH.md and c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md.
Also inspect c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

Adversarially challenge room layout layout/z1s3.layout.json (run gates.py layout, check bounds, test hotspot overlap < 30%), layout preview shots in review/layout_shots/, review server API (/api/candidates, /api/shots), and workspace mirror.
Provide a clear verdict: APPROVE or REQUEST_CHANGES.
CRITICAL CONSTRAINT: ZERO EM-DASHES across all code, comments, documentation, and messages. Never use em-dashes.
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\challenger_final_2\handoff.md and notify orchestrator when complete.
