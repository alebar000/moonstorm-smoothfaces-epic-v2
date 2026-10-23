# Dispatch for Reviewer Final 2

## Working Directory
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\reviewer_final_2

## Authoritative Requirements File
c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md
Also refer to c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

## Review Scope
Review aesthetic, anatomical, and interface compliance:
1. Palette adherence:
   - Body parts and emotions strictly use characters palette.
   - Props, scenery, wall, floor, foreground strictly use scenery palette.
   - Verify off-palette fraction <= 0.08 and Delta E <= 18 across all candidates.
2. Anatomy and chirality:
   - 3/4 right facing direction for characters and limbs.
   - Hand chirality: front hands dorsal view, back hands palmar view.
   - Strictly 5 digits on all hands (no 4-finger cartoon hands).
3. Ink thickness and paper style:
   - Body parts and emotions: 6 to 9 px ink.
   - Wall panels: 3 to 5 px ink.
   - Floor and midground props: 4 to 7 px ink.
   - Foreground items: 6 to 9 px ink.
   - Clean scissor / ruler cuts, soft pencil shading, zero digital airbrush or halo.
4. Protected files governance:
   - Confirm git status shows zero modifications to AGENTS.md, STYLE_BIBLE.md, SLICE.md, SUPERPROMPT_SESION.md, review/review.json, or art/approved/*.
5. Zero em-dashes:
   - Audit all files in the workspace for em-dash characters (\u2014 or \u2013).

Execute verification commands and produce your review verdict (APPROVE or REQUEST_CHANGES).
CRITICAL CONSTRAINT: ZERO EM-DASHES across all code, comments, documentation, and messages. Never use em-dashes.
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\reviewer_final_2\handoff.md when complete.


## 2026-10-23T00:05:48Z
You are Reviewer Final 2. Your working directory is c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\reviewer_final_2.
Read your instructions in c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\reviewer_final_2\DISPATCH.md and c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\ORIGINAL_REQUEST.md.
Also inspect c:\AntiGravityStuff\Moonstorm2\PROJECT.md.

Review aesthetic, anatomical, and interface compliance: palette adherence (Delta E <= 18, off-palette <= 0.08), 3/4 right facing consistency, hand chirality (dorsal front, palmar back), strictly 5 digits, ink thickness ranges, paper cut edges, git status of protected files, and zero em-dashes.
Provide a clear verdict: APPROVE or REQUEST_CHANGES.
CRITICAL CONSTRAINT: ZERO EM-DASHES across all code, comments, documentation, and messages. Never use em-dashes.
Write handoff report to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\reviewer_final_2\handoff.md and notify orchestrator when complete.
