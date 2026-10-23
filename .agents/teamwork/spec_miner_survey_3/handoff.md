# Handoff Report: Spec Miner Survey 3 (Scenery, Props, Layout, Review System, Bitacora)

Date: 2026-10-22
Author: Spec Miner Survey 3
Working Directory: `c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\spec_miner_survey_3`
Recipient: Parent Orchestrator (`b365cee7-e430-4a32-b9b8-31eb331690aa`)

---

## 1. Observation

- **Governance Specifications**:
  - `SLICE.md`: Lines 8-15 specify a single panoramic room `Z1S3` (target width 2400 px, height 900 px) with horizontal camera scroll, at least three parallax planes (wall, floor/characters, foreground), two characters (Mr. Smoothface and Captain Dread), and one puzzle: collecting the bag of hammers, portrait stand, and glue to assemble da Vinci's Perpetual Movement Machine in inventory.
  - `STYLE_BIBLE.md`: Lines 49-65 define scenery and prop finish as clean craft-knife cuts (`corte limpio, preciso, apenas irregular`), ink line thickness by depth (thin pen 3-5 px for walls/background, medium marker 4-7 px for furniture/floor props, thick marker 6-9 px for foreground elements), soft pencil shading only, no digital gradients or airbrush, no baked cast shadows, and strict scenery palette isolation. Lines 114-116 specify prop relative heights as fractions of Smoothface (315 px): desk 0.55 (173 px), sarcophagus 1.15 (362 px), bulkhead door 1.30 (410 px), bed 0.70 (220 px), foreground card table 0.50 (158 px).
  - `SUPERPROMPT_SESION.md`: Lines 56-60 establish batches L6 through L10:
    - L6: Z1S3 hull structure (panels x3, seam strip, floor x2, ceiling beams x2).
    - L7: Z1S3 wall fixtures (door, porthole, poster, masks x2, helm wheel, shelf, pipes).
    - L8: Z1S3 furniture (sarcophagus already approved, desk, TV, fishbowl, coat rack, coat, hat).
    - L9: Z1S3 bed and puzzle items (bed, nightstand, lamp, easel with portrait, hammer bag, glue, dirty laundry).
    - L10: Z1S3 foreground parallax (card table, ship in bottle, chest, clown bust, voodoo doll, hull ribs x2).
  - `TEAMWORK_PROMPT_DRAFT.md`: Lines 38-47 list the exact 35 piece IDs spanning L6 through L10, layout requirements, puppet preview requirements, and mirror destination.
- **Pipeline Gates & Palette Constraints**:
  - `pipeline/palette.json`: Lines 23-36 define the 12 scenery palette hex codes (`scen_brass: #ab986e`, `scen_brick_red: #9c5a5c`, `scen_sky_blue: #95b3d4`, `scen_iron_dark: #2a2922`, `scen_hull_rust: #605752`, `scen_warm_sand: #c6a787`, `scen_slate: #728289`, `scen_wood: #998370`, `scen_navy: #4a697f`, `scen_coral: #d67c7c`, `scen_yellow: #d6d27c`, `scen_cream: #cbc2c2`, common `ink_black: #1a1612`, `pencil_grey: #6e6a62`). Palette status is `"approved"`.
  - `pipeline/rules.json`: Lines 5-13 specify `ink_by_kind`: `wall: [3, 5]`, `floor: [4, 7]`, `prop: [4, 7]`, `foreground: [6, 9]`. Lines 16-21 set `halo_max: 0.003`, `sticker_max: 0.15`, and `grad_max: 0.40`.
  - `pipeline/gates.py`: Subcommand `normalize` removes chroma key `#00FF00`, crops with 8% margin, and rescales to `target_height_px`. Subcommand `check` enforces 8 binary gates. Subcommand `layout` validates object assets against `art/approved/MANIFEST.json`, checks plane IDs, and checks bounds and hotspot overlap (< 30%). Command `python pipeline/gates.py layout layout/z1s3.layout.json` was run and exited with code 0 (`{"overall": "pass", "errors": [], "warnings": []}`).
- **Layout Specification**:
  - `layout/z1s3.layout.json`: 2400x900 room, viewport width 1600 px, `foot_baseline_y: 820`, walkable polygon `[[120, 640], [2280, 640], [2280, 860], [120, 860]]`.
  - Parallax planes: `exterior` (0.25), `wall` (0.82), `wall_props` (0.88), `floor` (1.00, y_sort: true), `foreground` (1.22), `ribs` (1.35).
  - `.agents/skills/room-layout/SKILL.md`: Line 79-85 defines validation and layout shot generation at 3 camera positions (left, center, right) in `review/layout_shots/<room>_<ts>/`.
- **Review System & Local Server**:
  - `review/review_server.py`: Runs on `http://localhost:8765`. Line 27-54 implements `candidates()` serving pieces with `"status": "proposed"`. Line 56-64 serves `/api/shots` from `review/layout_shots/`. Line 96-113 handles `POST /api/review` writing to `review/review.json`.
  - `review/review_sheet.html`: Line 301-450 implements `buildSmoothfaceRigHTML` with interactive drag, layer offsets, keyboard hotkeys (1-3, Q-E, 4-8), and expression toggles. Captain Dread puppet preview is not yet implemented. Line 593-597 loads `/api/shots` for the room layout view tab.
- **Bitacora Logging & Mirroring**:
  - `.agents/skills/bitacora/SKILL.md`: Lines 17-47 mandate 3 rigid formats: candidate entry (`### <ts> · <piece_id> · <vN>`), session closing (`## <date> · sesión <n> · lote <Lk>`), and human verdict (`### <ts> · veredicto · <piece_id> <vN> · <approved|rejected>`).
  - `BITACORA.md`: 950 lines long. Last entry at line 938 records human approval of L2b on 2026-10-22 15:56.
  - Mirror destination: `c:\Users\alexb\Documents\GrokBotHandoff\moonstorm-v2` exists on disk. Inspection revealed Moonstorm2 has 28 approved art files while moonstorm-v2 has 20 approved art files, indicating moonstorm-v2 requires synchronization with the latest L2b approvals and subsequent batches.

---

## 2. Logic Chain

1. From `SUPERPROMPT_SESION.md`, `SLICE.md`, and `TEAMWORK_PROMPT_DRAFT.md`, the environment workload is organized into 5 sequential batches (L6 through L10) containing exactly 35 new cutout pieces.
2. Two pieces are already approved in L0: `z1s3.wall.panel_a` (approved in `art/approved/z1s3/z1s3.wall.panel_a.png` at 600x900 px) and `z1s3.prop.sarcophagus` (approved in `art/approved/z1s3/z1s3.prop.sarcophagus.png` at 362 px).
3. The 4 components required to construct da Vinci's Perpetual Movement Machine per `SLICE.md` and `sparkle-zone-and-puzzle-builder/SKILL.md` are distributed across these batches:
   - Bag of hammers: `z1s3.prop.hammer_bag` (Batch L9)
   - Portrait stand: `z1s3.prop.easel_portrait` (Batch L9)
   - Glue: `z1s3.prop.glue` (Batch L9)
   - Ship's helm: `z1s3.wall.helm_wheel` (Batch L7)
4. Each batch has distinct physical and visual constraints enforced by `gates.py check` via `kind`:
   - L6 pieces are `wall` and `floor` (ink 3-5 px and 4-7 px, craft-knife clean cut, scenery palette).
   - L7 pieces are `wall` fixtures (ink 3-5 px, mounted on plane `wall_props` at parallax 0.88).
   - L8 pieces are `prop` furniture (ink 4-7 px, floor plane at parallax 1.00, y_sort: true).
   - L9 pieces are `prop` furniture and puzzle items (ink 4-7 px, floor plane).
   - L10 pieces are `foreground` elements (ink 6-9 px thick marker, plane `foreground` at parallax 1.22 and `ribs` at parallax 1.35).
5. The room layout `layout/z1s3.layout.json` coordinates all 37 room elements across the 2400x900 panoramic space. While objects are in `pending` until approved by Alex, `gates.py layout` validates existing files and geometry.
6. The interactive review workflow at `http://localhost:8765` requires proposed pieces to have valid `meta.json`, `vN.png`, `vN.gates.json`, `gates_vN.json`, `critic_style_vN.json`, `critic_anatomy_vN.json`, and `vN.critics.json`. To enable full inspection, `review_sheet.html` must be expanded with a Captain Dread puppet component alongside Smoothface.
7. `BITACORA.md` is strictly append-only, factual, and must never contain em-dashes. Any session update must mirror the workspace to `c:\Users\alexb\Documents\GrokBotHandoff\moonstorm-v2`.

---

## 3. Caveats

1. For very small prop cutouts such as `z1s3.prop.glue` (57 px) or `z1s3.prop.voodoo_doll` (69 px), hand-drawn ink strokes can measure narrower than 4 px, creating a potential edge failure against `ink_by_kind: [4, 7]`. Generation prompts must explicitly emphasize bold marker outlines.
2. In `review_sheet.html`, Captain Dread's puppet viewer is not yet written. The orchestrator must assign a subagent to implement Captain Dread's viewport and part toggles following the `buildSmoothfaceRigHTML` pattern.
3. No code or asset modifications were made during this survey phase, adhering strictly to the Specification Miner read-only constraint.

---

## 4. Conclusion

The specification survey for batches L6 through L10, room layout, review server/sheet, and bitacora logging is complete and fully documented in `survey_scenery_layout_report.md`. The environment scope comprises 35 new cutouts, a 2400x900 panoramic layout with 6 parallax planes and 4 preview shots, local server candidate serving on port 8765, puppet toggle mechanics, and append-only bitacora mirroring to `moonstorm-v2`. All requirements, interfaces, and constraints are verified and ready for execution.

---

## 5. Verification Method

To independently verify the observations and conclusions:
1. Verify report existence and em-dash compliance:
   `python -c "content = open(r'c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\spec_miner_survey_3\survey_scenery_layout_report.md', encoding='utf-8').read(); assert content.count('\u2014') == 0; print('Report valid, 0 em-dashes')"`
2. Verify room layout schema validation:
   `python pipeline/gates.py layout layout/z1s3.layout.json`
3. Verify review server candidate listing:
   `python -c "import urllib.request, json; res = urllib.request.urlopen('http://localhost:8765/api/candidates?all=1'); data = json.loads(res.read()); print(f'Found {len(data)} candidates')"` (requires `review_server.py` running)
4. Verify mirror destination exists:
   `Test-Path c:\Users\alexb\Documents\GrokBotHandoff\moonstorm-v2`
