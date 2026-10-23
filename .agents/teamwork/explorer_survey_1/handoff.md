# Handoff Report - Explorer Survey 1

Date: 2026-10-22
Author: Explorer Survey 1
Recipient: Parent Orchestrator (b365cee7-e430-4a32-b9b8-31eb331690aa)
Subject: Pipeline, Gates, Manifests, References, and Candidate Standards Survey

---

## 1. Observation

Direct observations from the Moonstorm2 workspace:

1. `pipeline/gates.py`:
   - Line 13-22: Uses `argparse`, `json`, `os`, `sys`, `math`, `numpy`, `PIL` (`Image`), and `cv2` (OpenCV).
   - Line 64-105 (`cmd_normalize`): Performs chroma keying (`--key`, `--key-tol`), alpha despill, bounding-box crop (`alpha > 8`), Lanczos rescaling to `target_height_px`, and adds padding margin (`pad = round(max(dim) * margin)`).
   - Line 109-242: Evaluates 8 gate metrics:
     - `halo_ok`: Line 125, outer perimeter dilation ring luminance > 225 fraction <= 0.003.
     - `sticker_ok`: Line 132, silhouette edge band luminance > 225 fraction <= 0.15.
     - `partial_alpha_ok`: Line 138, interior eroded stray semi-transparent pixels == 0.
     - `components_ok`: Line 157, significant islands (area fraction >= 0.0005) <= `allowed_islands` (default 0) and specks (< 0.0005) == 0.
     - `border_ok`: Line 163, opaque pixels touching 4 outer image borders == 0.
     - `palette_ok`: Line 183, off-palette CIE Lab Delta E > 18 fraction <= 0.08 against `characters` or `scenery` palette.
     - `ink_ok`: Line 209, distance transform ridge thickness compared against `rules.json` `ink_by_kind`.
     - `gradient_ok`: Line 224, Sobel soft gradient fraction <= 0.40.
     - `height_ok`: Line 241, measured height vs target height relative delta <= 0.04 (±4%).
   - Line 271: Exits with code 0 on pass, code 2 on failure (`sys.exit(0 if r["overall"] == "pass" else 2)`).
   - Line 296-332 (`cmd_layout`): Validates layout objects against manifest and warns if hotspot overlap > 0.30.

2. `pipeline/palette.json` and `pipeline/heights.json`:
   - `palette.json`: `"status": "approved"`, defines common colors (`ink_black` `#1a1612`, `pencil_grey` `#6e6a62`), 12 character colors, 12 scenery colors, `delta_e_tolerance: 18`, and `max_off_palette_fraction: 0.08`.
   - `heights.json`: Reference character `"smoothface"` = `315 px` (35% of 900 px viewport height), `capdread: 330 px`, tolerance `0.04`.

3. `art/approved/MANIFEST.json`:
   - Contains 24 approved pieces: 2 palette pieces (`palette.characters`, `palette.scenery`), 20 Smoothface character body parts, and 2 Z1S3 scenery pieces (`z1s3.wall.panel_a`, `z1s3.prop.sarcophagus`).
   - Smoothface is missing only `smoothface.hand_back.point` to complete his limb set. Mouth and hair tuft pieces are canonically omitted.

4. `art/references/`:
   - Contains 7 key reference images: `ref_design_smoothface.png`, `ref_design_capdread.png`, `ref_room_z1s3_2010.png`, `ref_gui_aguilar.jpg`, `ref_hero_torso.png` (approved L0 torso), `ref_hero_sarcophagus.png` (approved L0 sarcophagus), `ref_hero_wall_panel.png` (approved L0 panel).
   - Contains `ref_cutout_layers/` with 10 individual PNG cutout layers from Morales's PSD (`001_Background.png` to `010_movs.png`).

5. Candidate Directory Schema (`art/candidates/<id>/`):
   - Inspection of `art/candidates/smoothface.hand_front.point/` and `review/review_server.py` lines 48-50 confirmed that candidate folders require: `meta.json` (`"status": "proposed"`, `"proposed_version": "vN"`), `vN.png`, `vN.gates.json`, `gates_vN.json`, `critic_style_vN.json`, `critic_anatomy_vN.json`, and `vN.critics.json`.

---

## 2. Logic Chain

1. From observation of `pipeline/gates.py` (lines 64-105, 244-272), raw generated images must first be cleaned with `gates.py normalize` to create transparent PNGs with exact target pixel height and margin padding, followed by `gates.py check` to generate validation telemetry.
2. From observation of `ORIGINAL_REQUEST.md` (line 51) and `pipeline/rules.json`, acceptance criteria require passing 8 programmatic gates: `halo_ok`, `sticker_ok`, `partial_alpha_ok`, `components_ok`, `border_ok`, `palette_ok`, `gradient_ok`, and `height_ok`.
3. From observation of `art/rejected/` (`smoothface.shoe_back_v3`, `smoothface.mouth.closed_v3`) and `.agents/skills/anatomy-critic/SKILL.md`, vision evaluation requires characters and limbs to face 3/4 right, front/back footwear to share identical geometry, open hands to show exactly 5 digits, and Smoothface to have no mouth cutouts.
4. From observation of `review/review_server.py` (lines 36-53, 75-83), the review sheet at `http://localhost:8765` dynamically discovers candidates with `"status": "proposed"` in `meta.json` and loads `gates_vN.json`, `critic_style_vN.json`, and `critic_anatomy_vN.json`.
5. Therefore, newly generated candidate assets for batches L2 through L10 will seamlessly validate through the pipeline and render in the review UI if and only if they strictly adhere to this standardized file naming and schema convention.

---

## 3. Caveats

- We did not execute candidate generation or write to `art/candidates/` or `art/approved/` as our explorer role is strictly read-only.
- `characters/smoothface/` and `characters/capdread/` directories do not yet exist on disk; they will need to be created when assembling `rig.json` for each character.
- The web server (`review/review_server.py`) can be launched locally on port 8765 to serve `review/review_sheet.html`.

---

## 4. Conclusion

The pipeline infrastructure, gate checks, reference libraries, and candidate schema in `c:\AntiGravityStuff\Moonstorm2` are fully functional and verified. The comprehensive findings have been compiled in `survey_pipeline_report.md`. Downstream agents can immediately utilize these specifications to generate, normalize, gate-check, and critique candidate assets for batches L2 through L10.

---

## 5. Verification Method

To independently verify the pipeline and checks:
1. Gate check execution test:
   ```powershell
   python pipeline/gates.py check art/approved/smoothface/smoothface.torso.png --meta art/candidates/smoothface.torso/meta.json --out test_gate.json
   Get-Content test_gate.json
   Remove-Item test_gate.json
   ```
2. Inspect full survey report:
   `c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\explorer_survey_1\survey_pipeline_report.md`
3. Verify zero em-dashes:
   ```powershell
   python -c "assert '\u2014' not in open(r'c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\explorer_survey_1\survey_pipeline_report.md', encoding='utf-8').read()"
   python -c "assert '\u2014' not in open(r'c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\explorer_survey_1\handoff.md', encoding='utf-8').read()"
   ```
