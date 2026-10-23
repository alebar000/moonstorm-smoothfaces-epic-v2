# Dispatch for Challenger Final 1

## Working Directory
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\challenger_final_1

## Authoritative Requirements File
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md
Also refer to c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

## Adversarial Challenge Scope
Write and execute automated stress harnesses to empirically challenge:
1. Programmatic gate robustness:
   - Run gates.py check directly across all 65 candidate pieces in art/candidates/.
   - Verify that 100% of candidates have overall="pass" and failed=[].
   - Verify that halo_fraction, sticker_border_fraction, stray_partial_alpha, components, border touches, off_palette_fraction, gradient, and height meet exact thresholds.
2. Rig standing height stress test:
   - For characters/smoothface/rig.json: test all variant combinations (3 eye states x 3 brow states x 3 front hand states x 3 back hand states = 81 permutations). Compute actual alpha bounding box height and verify standing height stays within 315 px +-4% (302.4 to 327.6 px).
   - For characters/capdread/rig.json: test all variant combinations (3 eye states x 3 brow states x 3 front hand states x 2 back hand states = 54 permutations). Compute actual alpha bounding box height without hat and verify standing height stays within 330 px +-4% (316.8 to 343.2 px).
3. Sole baseline alignment:
   - Test that both shoes for Smoothface, and both boots for Captain Dread, have bottom contact pixels touching the identical horizontal baseline.

Produce your verdict (APPROVE or REQUEST_CHANGES).
CRITICAL CONSTRAINT: ZERO EM-DASHES across all code, comments, documentation, and messages. Never use em-dashes.
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\challenger_final_1\handoff.md when complete.
## 2026-10-23T00:05:48Z
You are Challenger Final 1. Your working directory is c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\challenger_final_1.
Read your instructions in c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\challenger_final_1\DISPATCH.md and c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md.
Also inspect c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

Adversarially challenge gate robustness across all 65 candidate assets in art/candidates/. Test rig standing height across all 81 permutations of Smoothface and all 54 permutations of Captain Dread. Verify sole baseline alignment on both rigs.
Provide a clear verdict: APPROVE or REQUEST_CHANGES.
CRITICAL CONSTRAINT: ZERO EM-DASHES across all code, comments, documentation, and messages. Never use em-dashes.
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\challenger_final_1\handoff.md and notify orchestrator when complete.
