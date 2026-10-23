# BRIEFING - 2026-10-22T23:12:00Z

## Mission
Survey character rigs, animation specifications, and character parts requirements for Smoothface (L2 remainder, L3 emotions/props) and Captain Dread (L4, L5 batches, 22 pieces, 330 px standing height without hat), rig schema, and style/anatomy critic rubrics.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\explorer_survey_2
- Original parent: b365cee7-e430-4a32-b9b8-31eb331690aa
- Milestone: Survey Phase - Character & Rig Architecture

## 🔒 Key Constraints
- Read-only investigation: do NOT implement game changes or generate production assets directly.
- ZERO EM-DASHES across all files, comments, and messages. Never use em-dashes.
- Shared workspace visibility: all files written directly to c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\explorer_survey_2.

## Current Parent
- Conversation ID: b365cee7-e430-4a32-b9b8-31eb331690aa
- Updated: 2026-10-22T23:12:00Z

## Investigation State
- **Explored paths**:
  - ORIGINAL_REQUEST.md
  - DISPATCH.md
  - STYLE_BIBLE.md (Section 4 heights, Section 5 rig layer breakdown)
  - pipeline/heights.json, pipeline/palette.json, pipeline/rules.json, pipeline/gates.py, pipeline/approve.py
  - art/approved/MANIFEST.json and all 20 approved Smoothface pieces in art/approved/smoothface/
  - review/review_sheet.html and review/review_server.py
  - .agents/skills/anatomy-critic/SKILL.md and .agents/skills/style-critic/SKILL.md
  - src/engine/CutoutRigRenderer.ts and src/main.ts
- **Key findings**:
  - Standard rig schema formulated for characters/<id>/rig.json linking canvas, baseline, parts hierarchy, pivots, and variants.
  - Smoothface L2 needs only smoothface.hand_back.point (target height 38 px, 5 digits, palmar view, character palette). Canon omissions for hair_tuft and mouth.* confirmed.
  - Smoothface L3 consists of 5 emotion cutouts (character palette, 6-9 px ink) and 2 hand props (scenery palette, 4-7 px ink).
  - Captain Dread consists of 22 pieces across Batches L4 and L5, standing height 330 px without hat, defined layer hierarchy (z: 10 to 41), and review puppet requirements.
  - Critic rubrics documented: 3/4 facing alignment, dorsal vs palmar chirality, 5-digit count (4-digit cartoon hands strictly rejected).
- **Unexplored areas**: None within assigned survey scope.

## Key Decisions Made
- Fully documented character rig architecture and parts survey in survey_characters_report.md.
- Prepared 5-component handoff report in handoff.md.

## Artifact Index
- survey_characters_report.md: Comprehensive investigation report on character rigs, parts, and critic rubrics.
- handoff.md: 5-component handoff report.
- progress.md: Liveness heartbeat.
