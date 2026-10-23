# Dispatch for Forensic Auditor Final

## Working Directory
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\auditor_final

## Authoritative Requirements File
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md
Also refer to c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

## Forensic Integrity Scope
Perform comprehensive forensic integrity verification across the entire project:
1. Authentic implementation check (Zero Cheating):
   - Inspect all 65 candidate asset directories under art/candidates/.
   - Verify that all v1.png and v1_raw.png files are genuine image assets with actual alpha channels, pixel dimensions, and content.
   - Run gates.py check independently on random and full sets of candidates to verify that gates_v1.json and v1.gates.json are genuine, reproducible programmatic outputs and not fabricated dummy files.
   - Verify that characters/smoothface/rig.json, characters/capdread/rig.json, and layout/z1s3.layout.json are genuine, functioning specifications.
2. Protected governance files check:
   - Verify git status to confirm that AGENTS.md, STYLE_BIBLE.md, SLICE.md, SUPERPROMPT_SESION.md, review/review.json, and all files in art/approved/* have NOT been modified in any way.
3. Frozen main branch check:
   - Verify that git branch is clean and main branch is untouched at tag v0-pilot-2026-10-20.
4. User constraints check:
   - Audit the entire codebase, all candidate directories, rigs, layout, review files, BITACORA.md, and all agent handoff reports for em-dash characters (\u2014 and \u2013). Confirm zero em-dashes exist.
5. Workspace mirror check:
   - Confirm proper mirroring to c:\Users\alexb\Documents\GrokBotHandoff\moonstorm-v2.

Produce your forensic audit verdict: CLEAN or INTEGRITY VIOLATION.
CRITICAL CONSTRAINT: ZERO EM-DASHES across all code, comments, documentation, and messages. Never use em-dashes.
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\auditor_final\handoff.md when complete.


## 2026-10-23T00:05:48Z

You are Forensic Auditor Final. Your working directory is c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\auditor_final.
Read your instructions in c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\auditor_final\DISPATCH.md and c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md.
Also inspect c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

Perform comprehensive forensic integrity verification:
1. Authentic implementation check (Zero Cheating): verify candidate PNGs have genuine alpha and content; re-run gates.py check independently to verify gates_v1.json / v1.gates.json are genuine; verify rigs and layout are genuine functioning files.
2. Protected governance check: verify git status confirms AGENTS.md, STYLE_BIBLE.md, SLICE.md, SUPERPROMPT_SESION.md, review/review.json, and art/approved/* are 100% untouched.
3. Frozen main branch check: verify git branch is clean and main branch is untouched at tag v0-pilot-2026-10-20.
4. User constraints check: audit entire workspace for em-dashes (\u2014 and \u2013). Confirm zero em-dashes exist.
5. Workspace mirror check: verify synchronization to c:\Users\alexb\Documents\GrokBotHandoff\moonstorm-v2.

Provide your binary forensic verdict: CLEAN or INTEGRITY VIOLATION.
CRITICAL CONSTRAINT: ZERO EM-DASHES across all code, comments, documentation, and messages. Never use em-dashes.
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\auditor_final\handoff.md and notify orchestrator when complete.
