# Specification Survey Report: Scenery, Props, Room Layout, Review System, and Bitacora

Date: 2026-10-22
Author: Spec Miner Survey 3
Working Directory: `c:\AntiGravityStuff\Moonstorm2\.agents\teamwork\spec_miner_survey_3`
Scope: Smoothface's Epic (Slice 1: Z1S3 Captain Dread's Cabin)

---

## Executive Summary

This survey document presents an exhaustive analysis of the authoritative specifications for:
1. Environment and scenery batches L6 through L10 (35 new cutout pieces covering hull structure, wall fixtures, midground furniture, bed and puzzle components, and foreground parallax).
2. Panoramic room layout for Z1S3 (`layout/z1s3.layout.json`, 2400x900 px canvas, 6 parallax depth planes, camera windows, and review shot rendering).
3. Interactive light table (`review/review_sheet.html`) and local server (`review/review_server.py`, `http://localhost:8765`), including candidate serving via `/api/candidates`, puppet toggles, and layout shot previewing.
4. `BITACORA.md` logging schema, calibration tracking, session closing protocols, and workspace synchronization to mirror target `c:\Users\alexb\Documents\GrokBotHandoff\moonstorm-v2`.

All findings have been extracted directly from authoritative governance files (`AGENTS.md`, `STYLE_BIBLE.md`, `SLICE.md`, `SUPERPROMPT_SESION.md`), pipeline scripts (`pipeline/gates.py`, `pipeline/palette.json`, `pipeline/heights.json`, `pipeline/rules.json`), skills (`room-layout`, `bitacora`, `review-gate`, `one-piece-generator`, `style-bible`, `style-critic`, `anatomy-critic`), and recovered 2010 production archives (`dr_stache_art/` and `recovered/`).

---

## 1. Batches L6 Through L10 Specifications

### 1.1 Global Scenery & Prop Technical Standards

Per `STYLE_BIBLE.md` and `pipeline/rules.json`:
- **Construction & Edge Cut**: Clean craft-knife cut along a straightedge/ruler (`corte limpio, preciso, apenas irregular, como cortado con cúter sobre una regla`). Unlike characters (which use rough scissor cuts with straight facets), scenery and props represent the stage/theater.
- **Ink Line Thickness**:
  - Wall / background pieces (`kind: "wall"`): Thin pen line, 3 to 5 px at 1.0 game scale.
  - Midground furniture, floor, and props (`kind: "prop"`, `kind: "floor"`): Medium marker, 4 to 7 px at 1.0 game scale.
  - Foreground items and framing ribs (`kind: "foreground"`): Thick marker, 6 to 9 px at 1.0 game scale.
- **Palette Constraint**: Scenery palette ONLY (`pipeline/palette.json`). Must never use character-exclusive tones.
  - Allowed colors (12 scenery tones + 2 common):
    - `scen_brass`: `#ab986e`
    - `scen_brick_red`: `#9c5a5c`
    - `scen_sky_blue`: `#95b3d4`
    - `scen_iron_dark`: `#2a2922`
    - `scen_hull_rust`: `#605752`
    - `scen_warm_sand`: `#c6a787`
    - `scen_slate`: `#728289`
    - `scen_wood`: `#998370`
    - `scen_navy`: `#4a697f`
    - `scen_coral`: `#d67c7c`
    - `scen_yellow`: `#d6d27c`
    - `scen_cream`: `#cbc2c2`
    - `ink_black`: `#1a1612` (common)
    - `pencil_grey`: `#6e6a62` (common)
  - Color tolerance: Delta E <= 18; maximum off-palette pixel fraction <= 0.08 (8%).
- **Shading & Texture**: Soft pencil only (`#6e6a62`). Visible stroke direction, applied only in shadow areas. Digital gradients, glow, bloom, airbrush, 3D rendering, and white sticker borders are strictly forbidden. Smooth gradients permitted up to 40% of opaque area (`grad_max: 0.40`).
- **Transparency & Background**: Isolated cutout on transparent alpha background (or pure `#00FF00` chroma key for normalizer). Zero cast shadows baked into the PNG (all drop shadows are applied dynamically by the engine/layout: `{"offset": [3, 4], "blur": 6, "opacity": 0.35}`).
- **Interactive Sizing**: Minimum interactive object bounding dimension is 70 px. Small body parts or small puzzle items maintain proper visual proportion.

---

### 1.2 Batch L6: Hull Structure (7 Pieces)

Batch L6 establishes the architectural shell of Captain Dread's Cabin in the Substampede. Combined with the already approved `z1s3.wall.panel_a` (600x900 px, approved in L0), these 7 pieces form the continuous background wall, floor deck, and arched ceiling framing.

| Piece ID | Kind | Dimensions / Target Height | Description & Visual Details | Required References | Gate Rules & Ink Range |
|---|---|---|---|---|---|
| `z1s3.wall.panel_b` | `wall` | 600 x 900 px (`target_height_px: 900`) | Vertical riveted submarine hull wall panel variant B; seamless horizontally with panel_a and panel_c; dark hull rust `#605752`, warm wood/sand `#998370`, slate metal `#728289`, and dark iron rivets `#2a2922`. Alternative rivet distribution and subtle water staining. | `ref_hero_wall_panel.png`, `ref_room_z1s3_2010.png` | Ink: [3, 5] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.wall.panel_c` | `wall` | 600 x 900 px (`target_height_px: 900`) | Vertical riveted submarine hull wall panel variant C; seamless horizontal tile with panel_a and panel_b; features rectangular inspection hatch / electrical conduit plates riveted to the hull surface; slate and dark iron accents. | `ref_hero_wall_panel.png`, `ref_room_z1s3_2010.png` | Ink: [3, 5] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.wall.seam_strip` | `wall` | ~40 x 900 px (`target_height_px: 900`) | Vertical iron seam cover strip with double row of round rivets; covers modular panel joints; dark iron `#2a2922` with brass rivets `#ab986e`. | `ref_hero_wall_panel.png`, `ref_room_z1s3_2010.png` | Ink: [3, 5] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.floor.planks_a` | `floor` | ~800 x 260 px (`target_height_px: 260`) | Horizontal wooden deck planks segment A; weathered nautical submarine decking; aged wood `#998370` with darker seams `#605752` and nail heads `#2a2922`. Fits walkable floor area from y=640 to y=900. | `ref_room_z1s3_2010.png`, `ref_hero_wall_panel.png` | Ink: [4, 7] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.floor.planks_b` | `floor` | ~800 x 260 px (`target_height_px: 260`) | Horizontal wooden deck planks segment B; alternative wood planking segment with knots, scuffs, and slightly shifted seam offsets to avoid visual tiling repetition. | `ref_room_z1s3_2010.png`, `ref_hero_wall_panel.png` | Ink: [4, 7] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.ceiling.beam_a` | `wall` | ~800 x 160 px (`target_height_px: 160`) | Overhead ceiling structural beam / arched steel girder segment A; riveted dark iron arch `#2a2922` spanning top horizontal edge; provides ceiling enclosure. | `ref_room_z1s3_2010.png`, `ref_hero_wall_panel.png` | Ink: [3, 5] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.ceiling.beam_b` | `wall` | ~800 x 160 px (`target_height_px: 160`) | Overhead ceiling structural beam segment B; complementary ceiling arch segment with hanging cable clamps and riveted gusset plates. | `ref_room_z1s3_2010.png`, `ref_hero_wall_panel.png` | Ink: [3, 5] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |

---

### 1.3 Batch L7: Wall Fixtures and Props (8 Pieces)

Batch L7 contains the fixtures mounted directly to the submarine hull walls (plane `wall_props`), including key interactive puzzle objects.

| Piece ID | Kind | Dimensions / Target Height | Description & Visual Details | Required References | Gate Rules & Ink Range |
|---|---|---|---|---|---|
| `z1s3.wall.door` | `wall` | ~300 x 410 px (`target_height_px: 410`, fraction ~1.30 of SF) | Heavy watertight oval submarine bulkhead door; central locking wheel mechanism, heavy brass hinges, and dark iron frame. Leads back to Z1S2 (Lobby). | `ref_room_z1s3_2010.png`, `ref_hero_wall_panel.png`, `dr_stache_art/psd_layers/Z1S3-substampede_captainroom_WIP/004_sub_door.png` | Ink: [3, 5] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.wall.porthole` | `wall` | ~180 x 180 px (`target_height_px: 180`, fraction ~0.57 of SF) | Circular heavy brass/iron porthole frame with prominent perimeter bolts; circular glass window revealing dark underwater exterior (`#95b3d4` / deep sea navy `#4a697f`). | `ref_room_z1s3_2010.png`, `ref_hero_wall_panel.png` | Ink: [3, 5] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.wall.poster` | `wall` | ~100 x 126 px (`target_height_px: 126`, fraction ~0.40 of SF) | Vintage nautical pinup or submarine technical cutaway poster pinned to the steel hull; faded paper tones `#c6a787` and `#cbc2c2` with curled corners. | `ref_room_z1s3_2010.png`, `ref_hero_wall_panel.png` | Ink: [3, 5] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.wall.mask_a` | `wall` | ~60 x 80 px (`target_height_px: 80`, fraction ~0.25 of SF) | Carved wooden tribal mask A; elongated nautical/tropical tribal design; aged dark wood `#998370` with coral red `#d67c7c` and brass `#ab986e` facial markings. Flanks the ship's helm. | `ref_room_z1s3_2010.png`, `ref_hero_wall_panel.png` | Ink: [3, 5] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.wall.mask_b` | `wall` | ~60 x 80 px (`target_height_px: 80`, fraction ~0.25 of SF) | Carved wooden tribal mask B; rounder grimacing tribal face; complementary wood tones and slate/navy warpaint. Flanks opposite side of ship's helm. | `ref_room_z1s3_2010.png`, `ref_hero_wall_panel.png` | Ink: [3, 5] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.wall.helm_wheel` | `wall` | ~160 x 160 px (`target_height_px: 160`, fraction ~0.50 of SF) | Eight-spoke wooden ship's steering helm wheel mounted as a trophy on the back wall between the tribal masks; brass hub `#ab986e` and rich wood spokes `#998370`. **CRITICAL PUZZLE ITEM**: Component 4 of da Vinci's Perpetual Movement Machine. | `ref_room_z1s3_2010.png`, `ref_hero_wall_panel.png` | Ink: [3, 5] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.wall.shelf` | `wall` | ~240 x 95 px (`target_height_px: 95`, fraction ~0.30 of SF) | Cluttered wooden wall shelf supported by riveted iron triangular brackets; holds jars, rolled charts, and nautical knick-knacks. | `ref_room_z1s3_2010.png`, `ref_hero_wall_panel.png` | Ink: [3, 5] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.wall.pipes` | `wall` | ~320 x 110 px (`target_height_px: 110`, fraction ~0.35 of SF) | Complex horizontal and vertical run of submarine steam and water pipes; riveted pipe flanges, brass control valve wheel, and pressure gauge. | `ref_room_z1s3_2010.png`, `ref_hero_wall_panel.png` | Ink: [3, 5] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |

---

### 1.4 Batch L8: Midground Furniture (6 Pieces + Approved Sarcophagus)

Batch L8 covers the major furniture pieces populating the center and left gameplay floor area. Note: `z1s3.prop.sarcophagus` (height 362 px, fraction 1.15) is already approved and sits on the floor plane at x=260, y=822.

| Piece ID | Kind | Dimensions / Target Height | Description & Visual Details | Required References | Gate Rules & Ink Range |
|---|---|---|---|---|---|
| `z1s3.prop.desk` | `prop` | ~320 x 173 px (`target_height_px: 173`, fraction 0.55 of SF) | Captain Dread's heavy dark-wood rolltop/double-pedestal desk; brass pull handles, side drawers, cluttered work surface supporting TV, fishbowl, and papers. | `ref_room_z1s3_2010.png`, `ref_hero_sarcophagus.png` | Ink: [4, 7] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.prop.tv` | `prop` | ~120 x 110 px (`target_height_px: 110`, fraction 0.35 of SF) | Small retro 1950s/60s CRT television set with two bent rabbit-ear antennas; dark plastic/wood cabinet, curved greenish-grey CRT screen, rotary channel dials. Rests on the desk. | `ref_room_z1s3_2010.png`, `ref_hero_sarcophagus.png` | Ink: [4, 7] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.prop.fishbowl` | `prop` | ~80 x 79 px (`target_height_px: 79`, fraction 0.25 of SF) | Spherical glass fishbowl sitting on the desk; greenish-blue murky water `#95b3d4` with subtle air bubbles and paper-cut reflection highlights. | `ref_room_z1s3_2010.png`, `ref_hero_sarcophagus.png` | Ink: [4, 7] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.prop.coat_rack` | `prop` | ~100 x 346 px (`target_height_px: 346`, fraction 1.10 of SF) | Tall freestanding wooden coat stand / hanger tree; four curved wooden hanging hooks at top, flared four-legged tripod base on floor. Located left near the door. | `ref_room_z1s3_2010.png`, `ref_hero_sarcophagus.png`, `dr_stache_art/psd_layers/Z1S3-substampede_captainroom_WIP/006_hanger.png` | Ink: [4, 7] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.prop.coat` | `prop` | ~90 x 205 px (`target_height_px: 205`, fraction 0.65 of SF) | Captain Dread's dark naval captain's overcoat hanging from the coat rack; brass double-breasted buttons, folded collar, rumpled hanging tails. | `ref_room_z1s3_2010.png`, `ref_hero_sarcophagus.png`, `dr_stache_art/psd_layers/Z1S3-substampede_captainroom_WIP/007_coat.png` | Ink: [4, 7] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.prop.hat` | `prop` | ~100 x 79 px (`target_height_px: 79`, fraction 0.25 of SF) | Captain Dread's ornate pirate tricorn hat resting on the coat rack or shelf; dark navy/black felt with gold/brass trim braid and ragged feather accent. | `ref_room_z1s3_2010.png`, `ref_hero_sarcophagus.png`, `ref_design_capdread.png` | Ink: [4, 7] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |

---

### 1.5 Batch L9: Bed and Puzzle Items (7 Pieces)

Batch L9 completes the right-side sleeping quarters and introduces the critical tactile puzzle items needed to build da Vinci's Perpetual Movement Machine per `SLICE.md`.

| Piece ID | Kind | Dimensions / Target Height | Description & Visual Details | Required References | Gate Rules & Ink Range |
|---|---|---|---|---|---|
| `z1s3.prop.bed` | `prop` | ~400 x 220 px (`target_height_px: 220`, fraction 0.70 of SF) | Rustic captain's wooden bunk bed; messy rumpled mattress with striped woolen blanket `#9c5a5c` and lumpy pillow; positioned on far right floor at x~2000. | `ref_room_z1s3_2010.png`, `ref_hero_sarcophagus.png` | Ink: [4, 7] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.prop.nightstand` | `prop` | ~110 x 142 px (`target_height_px: 142`, fraction 0.45 of SF) | Small square wooden bedside drawer table standing adjacent to the bunk bed; holds the bedside lamp. | `ref_room_z1s3_2010.png`, `ref_hero_sarcophagus.png` | Ink: [4, 7] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.prop.lamp` | `prop` | ~60 x 95 px (`target_height_px: 95`, fraction 0.30 of SF) | Vintage nautical brass hurricane lantern or gooseneck bedside lamp with glass chimney; soft yellow tint `#d6d27c`. | `ref_room_z1s3_2010.png`, `ref_hero_sarcophagus.png` | Ink: [4, 7] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.prop.easel_portrait` | `prop` | ~140 x 205 px (`target_height_px: 205`, fraction 0.65 of SF) | Three-legged wooden artist easel supporting an ornate framed portrait of a distinguished historical figure with an exaggerated moustache. **CRITICAL PUZZLE ITEM**: Scavenged to obtain the portrait stand / easel frame for da Vinci's machine. | `ref_room_z1s3_2010.png`, `ref_hero_sarcophagus.png` | Ink: [4, 7] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.prop.hammer_bag` | `prop` | ~90 x 79 px (`target_height_px: 79`, fraction 0.25 of SF) | Worn leather tool bag overflowing with metal claw hammers and wooden handles; sitting on the floor next to the nightstand. **CRITICAL PUZZLE ITEM**: Component 1 of da Vinci's machine. | `ref_room_z1s3_2010.png`, `ref_hero_sarcophagus.png` | Ink: [4, 7] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.prop.glue` | `prop` | ~45 x 57 px (`target_height_px: 57`, fraction 0.18 of SF) | Amber glass bottle / pot of industrial horse glue with dripping brush applicator resting on the desk or shelf. **CRITICAL PUZZLE ITEM**: Component 3 of da Vinci's machine. | `ref_room_z1s3_2010.png`, `ref_hero_sarcophagus.png` | Ink: [4, 7] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.prop.dirty_laundry` | `prop` | ~130 x 79 px (`target_height_px: 79`, fraction 0.25 of SF) | Disheveled heap of dirty sailor laundry on the floor; rumpled striped shirts `#d67c7c`, socks, and sea trousers adding to the cabin's authentic disorder. | `ref_room_z1s3_2010.png`, `ref_hero_sarcophagus.png` | Ink: [4, 7] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |

---

### 1.6 Batch L10: Foreground Parallax (7 Pieces)

Batch L10 provides the closest depth layer (planes `foreground` at parallax 1.22 and `ribs` at parallax 1.35). These objects move faster than the camera, creating strong theatrical depth and framing the player character.

| Piece ID | Kind | Dimensions / Target Height | Description & Visual Details | Required References | Gate Rules & Ink Range |
|---|---|---|---|---|---|
| `z1s3.fg.card_table` | `foreground` | ~320 x 158 px (`target_height_px: 158`, fraction 0.50 of SF) | Round foreground card/chart table seen from elevated perspective; dark wood or worn green felt top with scattered playing cards and navigational dividers. | `ref_room_z1s3_2010.png`, `ref_hero_sarcophagus.png`, `dr_stache_art/psd_layers/Z1S3-substampede_captainroom/003_first_plane.png` | Ink: [6, 9] px (foreground thick ink); scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.fg.ship_in_bottle` | `foreground` | ~110 x 79 px (`target_height_px: 79`, fraction 0.25 of SF) | Detailed miniature sailing galleon with paper sails trapped inside a clear corked glass bottle; rests on the foreground card table. | `ref_room_z1s3_2010.png`, `ref_hero_sarcophagus.png` | Ink: [6, 9] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.fg.chest` | `foreground` | ~240 x 173 px (`target_height_px: 173`, fraction 0.55 of SF) | Heavy iron-banded wooden sea chest / pirate treasure trunk; large padlock hasp and corner reinforcements; located in right foreground at x~1900. | `ref_room_z1s3_2010.png`, `ref_hero_sarcophagus.png` | Ink: [6, 9] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.fg.clown_bust` | `foreground` | ~90 x 110 px (`target_height_px: 110`, fraction 0.35 of SF) | Porcelain/plaster bust of a grinning circus clown with ruffled collar and conical hat; bizarre circus relic hinting at Cirque du SoLame; sits on chest or card table. | `ref_room_z1s3_2010.png`, `ref_hero_sarcophagus.png` | Ink: [6, 9] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.fg.voodoo_doll` | `foreground` | ~50 x 69 px (`target_height_px: 69`, fraction 0.22 of SF) | Stitched burlap voodoo doll with mismatched button eyes, yarn hair, and several large pins protruding from its torso; rests on chest or table. | `ref_room_z1s3_2010.png`, `ref_hero_sarcophagus.png` | Ink: [6, 9] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.fg.hull_rib_left` | `foreground` | ~180 x 900 px (`target_height_px: 900`) | Massive arched riveted iron submarine hull rib girder framing the entire left screen border; heavy dark iron `#2a2922` silhouette with thick marker lines creating high contrast proscenium framing. | `ref_room_z1s3_2010.png`, `ref_hero_wall_panel.png`, `dr_stache_art/psd_layers/Z1S3-substampede_captainroom/003_first_plane.png` | Ink: [6, 9] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |
| `z1s3.fg.hull_rib_right` | `foreground` | ~180 x 900 px (`target_height_px: 900`) | Symmetrical massive arched riveted iron hull rib girder framing the entire right screen border; reinforces the submarine claustrophobia. | `ref_room_z1s3_2010.png`, `ref_hero_wall_panel.png`, `dr_stache_art/psd_layers/Z1S3-substampede_captainroom/003_first_plane.png` | Ink: [6, 9] px; scenery palette; halo <= 0.003; sticker <= 0.15; components: 1; border_ok: 0 |

---

## 2. Room Layout Requirements (`layout/z1s3.layout.json`)

### 2.1 Coordinate Space and Panoramic Architecture
- **Room Dimensions**: Width = 2400 px, Height = 900 px.
- **Viewport Canvas**: 1600 px wide x 900 px high (16:9 ratio).
- **Camera Follow**: `follow: "player"`, `edge_scroll: true`.
- **Camera Pan Range**: The horizontal camera center moves from x = 800 (leftmost stop, showing [0, 1600]) to x = 1600 (rightmost stop, showing [800, 2400]), a total camera travel distance of 800 px.
- **Walkable Floor Geometry**: Polygon `[[120, 640], [2280, 640], [2280, 860], [120, 860]]`.
- **Foot Baseline**: `foot_baseline_y: 820`. Both character rigs (`smoothface` at 315 px, `capdread` at 330 px) touch the floor baseline at y = 822.
- **Perspective Scaling**: `perspective_scale: {"y_far": 640, "scale_far": 0.90, "y_near": 860, "scale_near": 1.05}`.

### 2.2 Parallax Plane Hierarchy
The 6 calibrated depth planes are ordered back-to-front:

```
Plane 1: exterior    (parallax: 0.25) -> Deep underwater view through porthole glass
Plane 2: wall        (parallax: 0.82) -> Riveted panels a/b/c, vertical seams, ceiling beams
Plane 3: wall_props  (parallax: 0.88) -> Door, porthole frame, poster, masks, helm wheel, shelf, pipes
Plane 4: floor       (parallax: 1.00, y_sort: true) -> Planks, characters, desk, bed, sarcophagus, nightstand, puzzle items
Plane 5: foreground  (parallax: 1.22) -> Card table, sea chest, ship in bottle, clown bust, voodoo doll
Plane 6: ribs        (parallax: 1.35) -> Left and right massive structural hull ribs
```

### 2.3 Object Coordinate Map in Z1S3
Based on `layout/z1s3.layout.json`, `room-layout/SKILL.md`, and 2010 reference `ref_room_z1s3_2010.png`:

| Object ID | Plane | X | Y | Anchor | Scale | Sort Y | Hotspot & Interaction |
|---|---|---|---|---|---|---|---|
| `z1s3.wall.panel_a` | `wall` | 0 | 0 | `top-left` | 1.0 | n/a | Wall background |
| `z1s3.wall.panel_b` | `wall` | 600 | 0 | `top-left` | 1.0 | n/a | Wall background |
| `z1s3.wall.panel_c` | `wall` | 1200 | 0 | `top-left` | 1.0 | n/a | Wall background |
| `z1s3.wall.panel_a_2` | `wall` | 1800 | 0 | `top-left` | 1.0 | n/a | Wall background tile 4 |
| `z1s3.wall.door` | `wall_props` | 360 | 380 | `bottom-center` | 1.0 | n/a | Exit to Z1S2 (`to_z1s2`) |
| `z1s3.wall.porthole` | `wall_props` | 680 | 320 | `center` | 1.0 | n/a | Inspect exterior water |
| `z1s3.prop.sarcophagus` | `floor` | 260 | 822 | `bottom-center` | 1.0 | 822 | Inspect sarcophagus (approved L0) |
| `z1s3.prop.coat_rack` | `floor` | 460 | 822 | `bottom-center` | 1.0 | 822 | Inspect coat/rack |
| `z1s3.fg.card_table` | `foreground` | 700 | 900 | `bottom-center` | 1.0 | n/a | Foreground chart table |
| `z1s3.wall.poster` | `wall_props` | 950 | 300 | `center` | 1.0 | n/a | Inspect pinup/schematic |
| `z1s3.wall.mask_a` | `wall_props` | 1110 | 290 | `center` | 1.0 | n/a | Inspect tribal mask A |
| `z1s3.wall.helm_wheel` | `wall_props` | 1200 | 290 | `center` | 1.0 | n/a | Grab puzzle item (helm) |
| `z1s3.wall.mask_b` | `wall_props` | 1290 | 290 | `center` | 1.0 | n/a | Inspect tribal mask B |
| `z1s3.prop.desk` | `floor` | 1100 | 822 | `bottom-center` | 1.0 | 822 | Inspect/grab desk items |
| `z1s3.prop.tv` | `floor` | 1040 | 720 | `bottom-center` | 1.0 | 822 | Inspect TV |
| `z1s3.prop.fishbowl` | `floor` | 1180 | 720 | `bottom-center` | 1.0 | 822 | Inspect fishbowl |
| `z1s3.prop.glue` | `floor` | 1130 | 720 | `bottom-center` | 1.0 | 822 | Grab glue (puzzle item) |
| `z1s3.wall.shelf` | `wall_props` | 1420 | 320 | `center` | 1.0 | n/a | Inspect shelf |
| `z1s3.wall.pipes` | `wall_props` | 1480 | 220 | `center` | 1.0 | n/a | Ambient steam pipe |
| `z1s3.prop.easel_portrait` | `floor` | 1450 | 822 | `bottom-center` | 1.0 | 822 | Grab portrait stand (puzzle item) |
| `z1s3.prop.hammer_bag` | `floor` | 1680 | 822 | `bottom-center` | 1.0 | 822 | Grab bag of hammers (puzzle item) |
| `z1s3.prop.nightstand` | `floor` | 1750 | 822 | `bottom-center` | 1.0 | 822 | Inspect nightstand |
| `z1s3.prop.lamp` | `floor` | 1750 | 700 | `bottom-center` | 1.0 | 822 | Inspect bedside lamp |
| `z1s3.prop.dirty_laundry` | `floor` | 1850 | 840 | `bottom-center` | 1.0 | 840 | Inspect laundry |
| `z1s3.fg.chest` | `foreground` | 1900 | 900 | `bottom-center` | 1.0 | n/a | Foreground trunk |
| `z1s3.prop.bed` | `floor` | 2050 | 822 | `bottom-center` | 1.0 | 822 | Inspect captain's bed |
| `z1s3.fg.hull_rib_left` | `ribs` | 80 | 450 | `center` | 1.0 | n/a | Foreground left proscenium |
| `z1s3.fg.hull_rib_right` | `ribs` | 2320 | 450 | `center` | 1.0 | n/a | Foreground right proscenium |

### 2.4 Programmatic Validation and Layout Preview Shots
1. **Validation via `gates.py layout`**:
   `python pipeline/gates.py layout layout/z1s3.layout.json`
   - Verifies all declared `asset` paths exist in `art/approved/MANIFEST.json` or on disk.
   - Verifies plane IDs match declared plane definitions.
   - Calculates bounding boxes using `rect_of(obj, w, h)` based on anchor type (`bottom-center`, `top-left`, `center`) and scale.
   - Validates that interactive floor objects do not fall outside room boundary by >10%.
   - Validates that no two interactive hotspots overlap by >30%.
2. **Rendering Layout Shots into `review/layout_shots/`**:
   Per `room-layout/SKILL.md` step 4, panoramic and camera-window preview shots must be generated into `review/layout_shots/<run_name>/`:
   - `01_panorama_2400x900.png`: Full panoramic stitch of all layers with Smoothface (315 px) and Captain Dread (330 px) on floor.
   - `02_camera_left_0_1600.png`: Viewport frame 1 (camera at x = 0, viewing left area with door, sarcophagus, coat rack, card table).
   - `03_camera_center_400_2000.png`: Viewport frame 2 (camera at x = 400 to 2000, viewing desk, TV, fishbowl, masks, helm wheel).
   - `04_camera_right_800_2400.png`: Viewport frame 3 (camera at x = 800 to 2400, viewing bed, nightstand, lamp, easel, sea chest).

---

## 3. Interactive Review Sheet and Server Specification

### 3.1 Review Server Architecture (`review/review_server.py`)
- **Protocol**: Pure standard library Python HTTP server (`http.server.HTTPServer`), zero external dependencies.
- **Execution**: `python review/review_server.py --root . --port 8765` -> `http://localhost:8765/`.
- **Endpoints & Handlers**:
  1. `GET /` or `GET /index.html`: Serves `review/review_sheet.html`.
  2. `GET /api/candidates`:
     - Scans `art/candidates/` subdirectories.
     - By default (`?all=0`), filters for `meta.json` with `"status": "proposed"`. If `?all=1`, returns all candidates regardless of status.
     - Resolves the candidate version `vN` (from `meta.proposed_version` or latest `.png`).
     - Loads `gates_{v}.json`, `critic_style_{v}.json`, `critic_anatomy_{v}.json`.
     - Returns JSON object per candidate with `id`, `version`, `kind`, `category`, `what`, `status`, `image`, `references`, `neighbors`, `gates`, `critic_style`, `critic_anatomy`, `last_rejection`, and `target_height_px`.
  3. `GET /api/reviews`: Returns contents of `review/review.json` (`{"reviews": [...]}`).
  4. `GET /api/shots`:
     - Scans `review/layout_shots/`.
     - Returns up to 6 most recent run folders, reverse-sorted by name, listing all `.png` and `.jpg` image paths.
  5. `GET /file/<relative_path>`: Serves static files safely from repository root with `Cache-Control: no-store`.
  6. `POST /api/review`:
     - Accepts JSON payload: `{"id": "...", "version": "...", "verdict": "approved"|"rejected", "reason": "..."}`.
     - Validates that `verdict` is `approved` or `rejected`.
     - Rejects requests without a non-empty `reason` when verdict is `rejected`.
     - Appends/updates `review/review.json` atomically using temporary `.tmp` write and replace.

### 3.2 Review Sheet Interface & Puppet Implementation (`review/review_sheet.html`)
- **Structure**:
  - Three-column grid: Left candidate list (`aside.list`), Center stage (`main .stage`), Right inspector (`aside.info`).
  - Top header navigation tabs:
    - `Piezas + Marioneta`: Standard review of candidate cutout + interactive assembled puppet.
    - `Mosaico de expresiones / Cuarto`: Calls `/api/shots` to render layout shots and expression grids.
    - `Todo`: Toggles `?all=1` to view approved and rejected pieces.
- **Smoothface Puppet Implementation**:
  - Encapsulated in `buildSmoothfaceRigHTML(activeId, zoomH)`.
  - Maintains `DEFAULT_OFFSETS` dictionary storing `{x, y, w, h}` for each cutout part.
  - State object `rigState`:
    - `eyes`: `normal` | `squint` | `closed` | `none` (hotkeys: 1, 2, 3)
    - `brows`: `normal` | `angry` | `surprised` | `none` (hotkeys: Q, W, E)
    - `handFront`: `fist` | `open` | `point` | `none` (hotkeys: 4, 5, 6)
    - `handBack`: `fist` | `open` | `none` (hotkeys: 7, 8)
    - `bodyMode`: `l2b` (approved rig) | `ref2010` (historical cutout layers) | `both`
    - `collarFront`: boolean (collar overlaps lower face per 2010 canon)
    - `armBackXray`: boolean (brings back arm forward to inspect sleeve articulation)
    - `highlightActive`: boolean (applies yellow drop-shadow filter to the currently selected part)
  - Interactive drag-and-drop: `onmousedown` on `.rig-layer` allows repositioning pieces in real time, updating coordinates in `#rig-coords` to test assembly offsets.
- **Required Extension for Captain Dread Puppet**:
  - Currently, `review_sheet.html` only supports Smoothface (`isSmoothfacePart`).
  - Requirement R2 and R4 mandate implementing the interactive Captain Dread puppet preview in `review_sheet.html` alongside Smoothface, supporting Captain Dread's parts (`torso`, `head`, `hat`, `beard`, `eyes.normal/closed/squint`, `brows.normal/angry/surprised`, `arm_front`, `arm_back`, `hand_front.*`, `hand_back.*`, `pants`, `leg_front`, `leg_back`, `boot_front`, `boot_back`) at standing height 330 px.

---

## 4. BITACORA.md Format, Logging Rules, and Mirror Target

### 4.1 Rigid Entry Formats
Per `.agents/skills/bitacora/SKILL.md` and `BITACORA.md` precedents:

1. **Piece Generation / Candidate Entry**:
```markdown
### YYYY-MM-DD HH:MM · <piece_id> · <vN>
- prompt: art/candidates/<id>/prompt_vN.txt
- refs: <comma-separated list of attached reference files>
- gates: <pass|fail> (<failing gate name and metric, if any>)
- style-critic: <sin_objeciones | rechazar: "<defect 1>"; "<defect 2>">
- anatomy-critic: <sin_objeciones | rechazar: "..." | n/a>
- estado: <candidate | proposed | approved | rejected | detenida (3 intentos)>
- Alex: <"verbatim reason" | pendiente>
```

2. **Session Closing Entry**:
```markdown
## YYYY-MM-DD · sesión <n> · lote <Lk>
- generadas: <n> · pasaron gates: <n> · pasaron críticos: <n> · en hoja: <n> · detenidas: <n>
- detenidas: <id> (<reason, single line>)
- cambios a layout/: <file and modified fields, or "ninguno">
- cambios a src/: <"ninguno" unless engine task>
- backlog: <noted observations, or "ninguna">
- siguiente lote propuesto: <Lk+1 or "repetir Lk: <pieces>">
```

3. **Human Verdict Entry**:
```markdown
### YYYY-MM-DD HH:MM · veredicto · <piece_id> <vN> · <approved|rejected>
- Alex: "<verbatim reason, unedited>"
- acción: <copiado a approved/... | movido a rejected/... ; siguiente versión con FIX: ...>
- calibración: <"no aplica" | "style-critic dejó pasar; recalibrar antes de L<k>">
```

4. **Critic Calibration Entry**:
```markdown
### YYYY-MM-DD HH:MM · calibración · <critic_skill_path>
- Alex: "<verbatim feedback>"
- acción: <exact rubric clause or calibrated defect added to SKILL.md>
```

### 4.2 Logging Constraints
- **Strictly Append-Only**: Entries must only be appended to the end of `BITACORA.md`. Earlier entries must never be modified, deleted, or reordered.
- **Zero Qualitative Adjectives**: No "se ve lindo", "quedó excelente", or subjective praise. Every entry consists of literal metrics, verbatim quotes, file paths, and SHA-256 hashes.
- **ZERO EM-DASHES**: Absolutely no em-dash characters anywhere in code, markdown, comments, commit messages, or assistant output. Hyphens `-` or dots `·` are used.

### 4.3 Mirroring Target Procedure
- **Mirror Destination**: `c:\Users\alexb\Documents\GrokBotHandoff\moonstorm-v2`
- **Scope**: Complete repository mirror preserving all generated assets, candidate directories, approved manifest, layout files, review shots, and `BITACORA.md`.
- **Exclusions**: `node_modules/`, `.git/`, `.agents/teamwork/` (agent metadata).
- **Update Frequency**: Every batch completion or session milestone requires synchronizing the updated repository state to the mirror target so external collaborators (such as Claude) can inspect progress directly.

---

## 5. Features Discovered Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | Scenery Spec | L6 Hull Structure | 7 modular hull pieces (panel_b, panel_c, seam_strip, planks_a, planks_b, beam_a, beam_b) | `ref_room_z1s3_2010.png`, `ref_hero_wall_panel.png`, `palette.json` (scenery) | 7 normalized PNG cutouts + gates/critics JSON | `gates.py check` failure on off-palette or ink thickness | `SLICE.md`, `SUPERPROMPT_SESION.md`, `TEAMWORK_PROMPT_DRAFT.md` |
| 2 | Scenery Spec | L7 Wall Fixtures | 8 hull fixtures (door, porthole, poster, mask_a, mask_b, helm_wheel, shelf, pipes) | Reference images + scenery palette | 8 normalized PNG cutouts | Fails on halo, alpha bleeding, or invalid ink [3, 5] px | `SUPERPROMPT_SESION.md`, `dr_stache_art/psd_layers/` |
| 3 | Scenery Spec | L8 Midground Furniture | 6 furniture items (desk, tv, fishbowl, coat_rack, coat, hat) + approved sarcophagus | Reference images + scenery palette | 6 normalized PNG cutouts | Fails on ink thickness outside [4, 7] px | `SUPERPROMPT_SESION.md`, `ref_room_z1s3_2010.png` |
| 4 | Scenery Spec | L9 Bed & Puzzle Items | 7 items (bed, nightstand, lamp, easel_portrait, hammer_bag, glue, dirty_laundry) | Reference images + scenery palette | 7 normalized PNG cutouts | Fails on ink thickness outside [4, 7] px | `SUPERPROMPT_SESION.md`, `Sparkle - Level-Macro.pptx` |
| 5 | Scenery Spec | L10 Foreground Parallax | 7 foreground elements (card_table, ship_in_bottle, chest, clown_bust, voodoo_doll, hull_rib_left, hull_rib_right) | Reference images + scenery palette | 7 normalized PNG cutouts | Fails on ink thickness outside [6, 9] px | `SUPERPROMPT_SESION.md`, `ref_room_z1s3_2010.png` |
| 6 | Puzzle Integration | da Vinci Machine Components | 4 scavenged items in Z1S3: hammer_bag (L9), easel_portrait stand (L9), glue (L9), helm_wheel (L7) | In-room hotspots in Z1S3 | Assembled da Vinci Perpetual Movement Machine in inventory | Player cannot build machine if any component is missing | `SLICE.md`, `sparkle-zone-and-puzzle-builder/SKILL.md` |
| 7 | Layout Spec | Panoramic 2400x900 Room | Room layout format defining 6 parallax planes, walkable polygon, and foot baseline | `layout/z1s3.layout.json` | Validated room layout structure | `python pipeline/gates.py layout` fails on invalid plane or asset | `room-layout/SKILL.md`, `gates.py` |
| 8 | Layout Spec | Camera View Windows | Three 1600x900 viewport windows (left: 0-1600, center: 400-2000, right: 800-2400) + full panorama | Viewport dimensions and camera follow rules | Rendered layout preview images in `review/layout_shots/` | Camera out-of-bounds warning if objects exceed boundaries | `room-layout/SKILL.md`, `layout/z1s3.layout.json` |
| 9 | Review System | Candidate API (`/api/candidates`) | Serves proposed cutouts with gate and critic status to light table | HTTP GET `/api/candidates` (or `?all=1`) | JSON list of candidate metadata and file links | Returns 404 or empty list if `art/candidates/` missing | `review/review_server.py` |
| 10 | Review System | Interactive Puppet Toggles | Real-time 1:1 assembled puppet preview with hotkeys and draggable layer repositioning | Keyboard keys (1-3, Q-E, 4-8) and UI buttons | Assembled character view with instant expression/part swaps | Console error if asset image path 404s | `review/review_sheet.html` |
| 11 | Review System | Captain Dread Puppet Support | Requirement to implement Captain Dread puppet preview alongside Smoothface | Captain Dread approved pieces (L4-L5) | Real-time 1:1 Captain Dread puppet preview | Omission leaves Alex unable to inspect Captain Dread assembled | `ORIGINAL_REQUEST.md`, `TEAMWORK_PROMPT_DRAFT.md` |
| 12 | Governance | BITACORA Logging & Mirror | Rigid piece entry, session closing, and mirror target synchronization | Work log entries and repo updates | Updated `BITACORA.md` + mirrored `moonstorm-v2` | Process incomplete if session ends without bitacora entries | `.agents/skills/bitacora/SKILL.md` |

---

## 6. Edge Cases Table

| # | Feature | Input | Observed Behavior |
|---|---|---|---|
| 1 | Ink Thickness Gate on Small Props | Small puzzle items like `z1s3.prop.glue` (57 px) or `z1s3.prop.voodoo_doll` (69 px) evaluated by `gates.py check` | At small pixel heights, standard hand-drawn ink lines may measure narrower (e.g., 2.0-3.5 px), risking failure against medium marker bounds [4, 7] px unless ink width is calibrated relative to target height. |
| 2 | Hotspot Overlap in Cluttered Room | Densely grouped props on desk (`z1s3.prop.tv`, `z1s3.prop.fishbowl`, `z1s3.prop.glue`, `z1s3.prop.desk`) | `gates.py layout` triggers a warning if any two interactive hotspots have an overlap fraction > 30%. Must assign precise alpha bounding boxes or non-overlapping interaction regions. |
| 3 | Walkable Bounds Check on Floor Props | Floor props near room boundaries (sarcophagus at x=260, bed at x=2050) | `gates.py layout` warns if an interactive floor object bounding box extends beyond -10% of width or past room right edge (2400 px) or below y=900. |
| 4 | Wall vs Floor Anchor Conventions | Interactive furniture vs wall-mounted fixtures | Floor props must use `anchor: "bottom-center"` with `sort_y` matching floor contact line (`y = 822`). Wall props use `anchor: "top-left"` or `"center"` and do NOT declare `sort_y`. |
| 5 | Missing Anatomy Critic on Scenery | Running pipeline on wall/floor/props | Per `review-gate/SKILL.md`, `critic_anatomy` is only omitted for `kind: "wall"`, `"floor"`, or `"ui"`. For `prop` and `foreground`, `critic_anatomy_vN.json` must return `"verdict": "sin_objeciones"` with empty defects (as demonstrated on approved `z1s3.prop.sarcophagus`). |
| 6 | Parallax Speed Mismatch on Interaction | Clicking an interactive object on plane `wall_props` (parallax 0.88) or `foreground` (parallax 1.22) during camera pan | Screen-space cursor coordinates must translate through the inverse camera parallax transform for that specific plane; otherwise hotspot clicks register on wrong world coordinates when camera is scrolled. |
| 7 | Em-Dash Infiltration | Writing documentation, bitacora entries, or comments using standard punctuation | Em-dash characters violate global user constraint and fail verification. Standard hyphens (`-`) or colons (`:`) must be strictly enforced. |
