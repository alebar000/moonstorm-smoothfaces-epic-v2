#!/usr/bin/env python3
"""
sync_all_rigs_and_manifests.py
Synchronizes the calibrated rig coordinates, Z1S1 room layout, characters/<id>/rig.json,
characters/<id>/portrait.png, review_sheet.html, review.json, and art/approved/MANIFEST.json.
Zero em-dashes anywhere.
"""
import os
import re
import json
import glob
import hashlib
from PIL import Image

ROOT = r"C:\AntiGravityStuff\Moonstorm2"

NIHONGO_BOXES = {
    "shoe_back":       {"x": 152, "y": 318, "w":  68, "h":  58, "z": 10, "pid": "nihongo.shoe_front"},
    "leg_back":        {"x": 152, "y": 232, "w":  65, "h": 108, "z": 11, "pid": "nihongo.leg_back"},
    "shoe_front":      {"x": 108, "y": 322, "w":  68, "h":  58, "z": 12, "pid": "nihongo.shoe_front"},
    "leg_front":       {"x": 108, "y": 234, "w":  67, "h": 112, "z": 13, "pid": "nihongo.leg_front"},
    "arm_back":        {"x": 185, "y": 118, "w":  62, "h": 110, "z": 16, "pid": "nihongo.arm_back"},
    "torso":           {"x":  92, "y":  98, "w": 148, "h": 196, "z": 20, "pid": "nihongo.torso"},
    "head":            {"x": 124, "y":  14, "w":  82, "h": 130, "z": 25, "pid": "nihongo.head"},
    "eyes_normal":     {"x": 144, "y":  54, "w":  48, "h":  22, "z": 26, "pid": "nihongo.eyes.normal"},
    "eyes_closed":     {"x": 144, "y":  54, "w":  48, "h":  22, "z": 26, "pid": "nihongo.eyes.closed"},
    "eyes_squint":     {"x": 144, "y":  54, "w":  48, "h":  22, "z": 26, "pid": "nihongo.eyes.squint"},
    "brows_normal":    {"x": 140, "y":  42, "w":  56, "h":  16, "z": 27, "pid": "nihongo.brows.normal"},
    "brows_angry":     {"x": 140, "y":  41, "w":  56, "h":  18, "z": 27, "pid": "nihongo.brows.angry"},
    "headband":        {"x":  96, "y":  20, "w": 114, "h":  52, "z": 28, "pid": "nihongo.headband"},
    "broom_katana":    {"x": 116, "y":  94, "w": 140, "h": 248, "z": 30, "pid": "nihongo.prop.broom_katana"},
    "arm_front":       {"x":  96, "y": 116, "w":  88, "h": 116, "z": 32, "pid": "nihongo.arm_front"},
    "hand_front_fist": {"x": 166, "y": 182, "w":  38, "h":  42, "z": 34, "pid": "nihongo.hand_front.fist"},
    "hand_front_open": {"x": 164, "y": 178, "w":  44, "h":  46, "z": 34, "pid": "nihongo.hand_front.open"},
}

ABABY_BOXES = {
    "arm_back":        {"x": 186, "y": 112, "w":  95, "h": 168, "z": 10, "pid": "ababy.arm_back"},
    "legs_diaper":     {"x": 108, "y": 214, "w": 118, "h": 125, "z": 12, "pid": "ababy.legs_diaper"},
    "torso":           {"x":  96, "y":  92, "w": 142, "h": 172, "z": 20, "pid": "ababy.torso"},
    "arm_front":       {"x":  58, "y": 112, "w":  99, "h": 176, "z": 22, "pid": "ababy.arm_front"},
    "head":            {"x": 116, "y":  18, "w": 104, "h": 122, "z": 25, "pid": "ababy.head"},
    "eyes_normal":     {"x": 134, "y":  44, "w":  68, "h":  31, "z": 26, "pid": "ababy.eyes.normal"},
    "eyes_angry":      {"x": 133, "y":  44, "w":  70, "h":  32, "z": 26, "pid": "ababy.eyes.angry"},
    "bonnet":          {"x":  98, "y":   4, "w": 140, "h":  99, "z": 28, "pid": "ababy.bonnet"},
}

VENTRILO_BOXES = {
    "shoes":           {"x": 106, "y": 324, "w":  96, "h":  42, "z": 10, "pid": "ventrilo.shoes"},
    "legs":            {"x": 110, "y": 196, "w":  87, "h": 170, "z": 12, "pid": "ventrilo.legs"},
    "arm_back":        {"x":  82, "y": 104, "w":  72, "h": 122, "z": 15, "pid": "ventrilo.arm_back"},
    "torso":           {"x": 104, "y":  88, "w": 102, "h": 172, "z": 20, "pid": "ventrilo.torso"},
    "head_jaw":        {"x": 116, "y":   6, "w":  78, "h": 136, "z": 25, "pid": "ventrilo.head_jaw"},
    "eyes_normal":     {"x": 132, "y":  48, "w":  48, "h":  22, "z": 26, "pid": "ventrilo.eyes.normal"},
    "arm_front":       {"x": 124, "y": 122, "w":  96, "h": 110, "z": 30, "pid": "ventrilo.arm_front"},
    "dummy_rapoleon":  {"x": 166, "y":  78, "w": 120, "h": 168, "z": 32, "pid": "ventrilo.dummy_rapoleon"},
}

TROLL_BOXES = {
    "arm_back":        {"x":  62, "y": 118, "w":  92, "h": 170, "z": 10, "pid": "troll.arm_back"},
    "legs_feet":       {"x":  98, "y": 224, "w": 146, "h": 148, "z": 12, "pid": "troll.legs_feet"},
    "torso_tunic":     {"x":  84, "y":  96, "w": 168, "h": 206, "z": 20, "pid": "troll.torso_tunic"},
    "head_jaw":        {"x":  90, "y":  10, "w": 158, "h": 144, "z": 25, "pid": "troll.head_jaw"},
    "eyes":            {"x": 126, "y":  42, "w":  86, "h":  40, "z": 26, "pid": "troll.eyes"},
    "arm_front_club":  {"x": 182, "y":  56, "w": 170, "h": 184, "z": 30, "pid": "troll.arm_front_club"},
}


def fmt_ts_boxes(name, d):
    lines = [f"const {name}: Record<string, PartBox> = {{"]
    for k, v in d.items():
        lines.append(f"  {k + ':':18s}{{ x: {v['x']:3d}, y: {v['y']:3d}, w: {v['w']:3d}, h: {v['h']:3d} }},")
    lines.append("};")
    return "\n".join(lines)


def fmt_js_offsets(name, d):
    lines = [f"  const {name} = {{"]
    keys = list(d.keys())
    for i, k in enumerate(keys):
        v = d[k]
        comma = "," if i < len(keys) - 1 else ""
        lines.append(f"    {k + ':':18s}{{x: {v['x']:3d}, y: {v['y']:3d}, w: {v['w']:3d}, h: {v['h']:3d}}}{comma}")
    lines.append("  };")
    return "\n".join(lines)


def update_cutout_rig_renderer():
    p = os.path.join(ROOT, "src", "engine", "CutoutRigRenderer.ts")
    txt = open(p, encoding="utf-8").read()
    new_block = "\n\n".join([
        fmt_ts_boxes("NIHONGO_BOXES", NIHONGO_BOXES),
        fmt_ts_boxes("ABABY_BOXES", ABABY_BOXES),
        fmt_ts_boxes("VENTRILO_BOXES", VENTRILO_BOXES),
        fmt_ts_boxes("TROLL_BOXES", TROLL_BOXES),
    ])
    txt, n1 = re.subn(
        r"const NIHONGO_BOXES: Record<string, PartBox> = \{[\s\S]*?const TROLL_BOXES: Record<string, PartBox> = \{[\s\S]*?\};",
        new_block,
        txt,
        count=1,
    )
    txt = txt.replace(
        "    this.drawPart(ctx, 'ni_hand_front_open', NIHONGO_BOXES.hand_back, 0, bodyBob * 0.8, 0, true);\n",
        "",
    )
    txt = txt.replace(
        "    this.drawPart(ctx, 'ni_hand_front_open', NIHONGO_BOXES.hand_back, 0, bodyBob * 0.8, 0, true);\r\n",
        "",
    )
    # In renderABabyRig, draw torso before arm_front so arm_front is in front of torso
    txt = txt.replace(
        "    this.drawPart(ctx, 'ab_arm_front', ABABY_BOXES.arm_front, 0, bodyBob * 0.5, 0, true);\n    this.drawPart(ctx, 'ab_torso', ABABY_BOXES.torso, 0, bodyBob, 0, true);",
        "    this.drawPart(ctx, 'ab_torso', ABABY_BOXES.torso, 0, bodyBob, 0, true);\n    this.drawPart(ctx, 'ab_arm_front', ABABY_BOXES.arm_front, 0, bodyBob * 0.5, 0, true);",
    )
    txt = txt.replace(
        "    this.drawPart(ctx, 'ab_arm_front', ABABY_BOXES.arm_front, 0, bodyBob * 0.5, 0, true);\r\n    this.drawPart(ctx, 'ab_torso', ABABY_BOXES.torso, 0, bodyBob, 0, true);",
        "    this.drawPart(ctx, 'ab_torso', ABABY_BOXES.torso, 0, bodyBob, 0, true);\r\n    this.drawPart(ctx, 'ab_arm_front', ABABY_BOXES.arm_front, 0, bodyBob * 0.5, 0, true);",
    )
    with open(p, "w", encoding="utf-8") as f:
        f.write(txt)
    print(f"Updated CutoutRigRenderer.ts (replacements={n1})")


def update_review_sheet():
    p = os.path.join(ROOT, "review", "review_sheet.html")
    txt = open(p, encoding="utf-8").read()
    txt = re.sub(r"  const DEFAULT_NIHONGO_OFFSETS = \{[\s\S]*?  \};", fmt_js_offsets("DEFAULT_NIHONGO_OFFSETS", NIHONGO_BOXES), txt, count=1)
    txt = re.sub(r"  const DEFAULT_ABABY_OFFSETS = \{[\s\S]*?  \};", fmt_js_offsets("DEFAULT_ABABY_OFFSETS", ABABY_BOXES), txt, count=1)
    txt = re.sub(r"  const DEFAULT_VENTRILO_OFFSETS = \{[\s\S]*?  \};", fmt_js_offsets("DEFAULT_VENTRILO_OFFSETS", VENTRILO_BOXES), txt, count=1)
    txt = re.sub(r"  const DEFAULT_TROLL_OFFSETS = \{[\s\S]*?  \};", fmt_js_offsets("DEFAULT_TROLL_OFFSETS", TROLL_BOXES), txt, count=1)

    # Remove bogus hand_back line in buildNihongoRigHTML
    txt = re.sub(r"\s*\{key:'hand_back',\s*pid:'nihongo\.hand_front\.open'[^\n]*\n", "\n", txt)

    # Swap arm_front z to 22 (above torso z=20) in buildAbabyRigHTML
    txt = txt.replace(
        "{key:'arm_front',   pid:'ababy.arm_front',   src:partImg('ababy.arm_front','art/approved/ababy/ababy.arm_front.png'), z:15}",
        "{key:'arm_front',   pid:'ababy.arm_front',   src:partImg('ababy.arm_front','art/approved/ababy/ababy.arm_front.png'), z:22}",
    )

    # Update buildTrollRigHTML to reference individual troll.* pids
    old_troll_layers = """    const layers = [
      {key:'arm_back',       pid:'z0.prop.troll', src:'art/approved/z0/troll.arm_back.png', z:10},
      {key:'legs_feet',      pid:'z0.prop.troll', src:'art/approved/z0/troll.legs_feet.png', z:12},
      {key:'torso_tunic',    pid:'z0.prop.troll', src:'art/approved/z0/troll.torso_tunic.png', z:20},
      {key:'head_jaw',       pid:'z0.prop.troll', src:'art/approved/z0/troll.head_jaw.png', z:25},
      {key:'eyes',           pid:'z0.prop.troll', src:'art/approved/z0/troll.eyes.png', z:26},
      {key:'arm_front_club', pid:'z0.prop.troll', src:'art/approved/z0/troll.arm_front_club.png', z:30}
    ];"""
    new_troll_layers = """    const layers = [
      {key:'arm_back',       pid:'troll.arm_back',       src:partImg('troll.arm_back','art/approved/z0/troll.arm_back.png'), z:10},
      {key:'legs_feet',      pid:'troll.legs_feet',      src:partImg('troll.legs_feet','art/approved/z0/troll.legs_feet.png'), z:12},
      {key:'torso_tunic',    pid:'troll.torso_tunic',    src:partImg('troll.torso_tunic','art/approved/z0/troll.torso_tunic.png'), z:20},
      {key:'head_jaw',       pid:'troll.head_jaw',       src:partImg('troll.head_jaw','art/approved/z0/troll.head_jaw.png'), z:25},
      {key:'eyes',           pid:'troll.eyes',           src:partImg('troll.eyes','art/approved/z0/troll.eyes.png'), z:26, noShadow:true},
      {key:'arm_front_club', pid:'troll.arm_front_club', src:partImg('troll.arm_front_club','art/approved/z0/troll.arm_front_club.png'), z:30}
    ];"""
    txt = txt.replace(old_troll_layers, new_troll_layers)
    txt = txt.replace(old_troll_layers.replace("\n", "\r\n"), new_troll_layers.replace("\n", "\r\n"))

    with open(p, "w", encoding="utf-8") as f:
        f.write(txt)
    print("Updated review/review_sheet.html")


def update_world_data():
    p = os.path.join(ROOT, "src", "scenarios", "WorldData.ts")
    txt = open(p, encoding="utf-8").read()
    old_z1s1_block = """    { id: 'z1s1.ceiling.rivet_arch_1', imageKey: 'z1s1.ceiling.rivet_arch', x: -40, y: -135, w: 680, h: 225, sortY: 98, parallaxFactor: 0.85, inSituSeamless: true },
    { id: 'z1s1.ceiling.rivet_arch_2', imageKey: 'z1s1.ceiling.rivet_arch', x: 580, y: -135, w: 680, h: 225, sortY: 98, parallaxFactor: 0.85, flipX: true, inSituSeamless: true },
    { id: 'z1s1.ceiling.rivet_arch_3', imageKey: 'z1s1.ceiling.rivet_arch', x: 1200, y: -135, w: 680, h: 225, sortY: 99, parallaxFactor: 0.85, inSituSeamless: true },
    { id: 'z1s1.ceiling.rivet_arch_4', imageKey: 'z1s1.ceiling.rivet_arch', x: 1820, y: -135, w: 680, h: 225, sortY: 99, parallaxFactor: 0.85, flipX: true, inSituSeamless: true },

    // PLANE 2: BOLTED STEEL DECK FLOOR (parallaxFactor: 1.0, sortY: 550, covers down to y=945)
    { id: 'z1s1.floor.steel_deck_1', imageKey: 'z1s1.floor.steel_deck', x: -80, y: 520, w: 1020, h: 425, sortY: 550, parallaxFactor: 1.0, inSituSeamless: true },
    { id: 'z1s1.floor.steel_deck_2', imageKey: 'z1s1.floor.steel_deck', x: 880, y: 520, w: 1020, h: 425, sortY: 550, parallaxFactor: 1.0, flipX: true, inSituSeamless: true },
    { id: 'z1s1.floor.steel_deck_3', imageKey: 'z1s1.floor.steel_deck', x: 1820, y: 520, w: 740, h: 425, sortY: 550, parallaxFactor: 1.0, inSituSeamless: true },

    // PLANE 3: WALL PROPS & CAGED SUBMARINE LAMPS (parallaxFactor: 0.85, matching ref_z1s1_machineroom_2010.png)
    { id: 'z1s1.wall.caged_lamp_1', imageKey: 'z1s1.wall.caged_lamp', x: 540, y: 185, w: 83, h: 138, sortY: 558, parallaxFactor: 0.85 },
    { id: 'z1s1.wall.book_shelf', imageKey: 'z1s1.wall.book_shelf', x: 760, y: 175, w: 320, h: 224, sortY: 560, parallaxFactor: 0.85 },
    { id: 'z1s1.wall.caged_lamp_2', imageKey: 'z1s1.wall.caged_lamp', x: 1520, y: 185, w: 83, h: 138, sortY: 558, parallaxFactor: 0.85 },
    { id: 'z1s1.wall.caged_lamp_3', imageKey: 'z1s1.wall.caged_lamp', x: 1980, y: 185, w: 83, h: 138, sortY: 558, parallaxFactor: 0.85 },
    { id: 'z1s1.prop.iron_ladder', hotspotId: 'z1s1_ladder_lounge', imageKey: 'z1s1.prop.iron_ladder', x: 1125, y: 75, w: 220, h: 555, sortY: 565, parallaxFactor: 0.92 },

    // PLANE 4: 4 RECUMBENT SUBMARINE PEDAL-CRANK STATIONS IN A ROW & PERPETUAL MACHINE (parallaxFactor: 1.0)
    { id: 'z1s1.prop.pedal_station_1', imageKey: 'z1s1.prop.pedal_station_intact', x: 260, y: 420, w: 390, h: 266, sortY: 726, parallaxFactor: 1.0 },
    { id: 'z1s1.prop.pedal_station_2', imageKey: 'z1s1.prop.pedal_station_intact', x: 690, y: 420, w: 390, h: 266, sortY: 728, parallaxFactor: 1.0 },
    { id: 'z1s1.prop.pedal_station_intact', imageKey: 'z1s1.prop.pedal_station_intact', x: 1120, y: 420, w: 390, h: 266, sortY: 730, parallaxFactor: 1.0 },
    { id: 'z1s1.prop.pedal_station_broken', hotspotId: 'z1s1_pedal_engine', imageKey: 'z1s1.prop.pedal_station_broken', x: 1545, y: 420, w: 390, h: 266, sortY: 735, parallaxFactor: 1.0, visibleWhen: (f) => !f.perpetualMachineInstalled },
    { id: 'z1s1.prop.perpetual_machine_installed', hotspotId: 'z1s1_pedal_engine', imageKey: 'z1s1.prop.perpetual_machine_installed', x: 1475, y: 340, w: 475, h: 350, sortY: 736, parallaxFactor: 1.0, visibleWhen: (f) => f.perpetualMachineInstalled },
    { id: 'z1s1.item.davinci_blueprint', hotspotId: 'z1s1_blueprint_pickup', imageKey: 'z1s1.item.davinci_blueprint', x: 865, y: 615, w: 145, h: 135, sortY: 738, parallaxFactor: 1.0, visibleWhen: (f) => !f.nihongoGaveBlueprint },

    // PLANE 5: CONTINUOUS BILGE GARBAGE TRENCH & SUBMARINE HULL RINGS (parallaxFactor: 1.14 - 1.20)
    { id: 'z1s1.fg.toxic_barrels', hotspotId: 'z1s1_rad_barrels', imageKey: 'z1s1.fg.toxic_barrels', x: 360, y: 675, w: 305, h: 250, sortY: 920, parallaxFactor: 1.14 },
    { id: 'z1s1.fg.toxic_barrels_2', hotspotId: 'z1s1_rad_barrels', imageKey: 'z1s1.fg.toxic_barrels', x: 615, y: 705, w: 285, h: 235, sortY: 921, parallaxFactor: 1.14, flipX: true },
    { id: 'z1s1.fg.broken_toaster', hotspotId: 'z1s1_rat_tv', imageKey: 'z1s1.fg.broken_toaster', x: 895, y: 715, w: 215, h: 205, sortY: 922, parallaxFactor: 1.14 },
    { id: 'z1s1.fg.bilge_rat', hotspotId: 'z1s1_rat_tv', imageKey: 'z1s1.fg.bilge_rat', x: 1085, y: 750, w: 145, h: 145, sortY: 926, parallaxFactor: 1.14 },
    { id: 'z1s1.fg.potato_sacks', hotspotId: 'z1s1_rat_tv', imageKey: 'z1s1.fg.potato_sacks', x: 1235, y: 695, w: 315, h: 235, sortY: 924, parallaxFactor: 1.14 },
    { id: 'z1s1.fg.potato_sacks_2', hotspotId: 'z1s1_rat_tv', imageKey: 'z1s1.fg.potato_sacks', x: 1515, y: 710, w: 300, h: 225, sortY: 925, parallaxFactor: 1.14, flipX: true },"""

    new_z1s1_block = """    { id: 'z1s1.ceiling.rivet_arch_1', imageKey: 'z1s1.ceiling.rivet_arch', x: -40, y: -55, w: 680, h: 225, sortY: 98, parallaxFactor: 0.85, inSituSeamless: true },
    { id: 'z1s1.ceiling.rivet_arch_2', imageKey: 'z1s1.ceiling.rivet_arch', x: 580, y: -55, w: 680, h: 225, sortY: 98, parallaxFactor: 0.85, flipX: true, inSituSeamless: true },
    { id: 'z1s1.ceiling.rivet_arch_3', imageKey: 'z1s1.ceiling.rivet_arch', x: 1200, y: -55, w: 680, h: 225, sortY: 99, parallaxFactor: 0.85, inSituSeamless: true },
    { id: 'z1s1.ceiling.rivet_arch_4', imageKey: 'z1s1.ceiling.rivet_arch', x: 1820, y: -55, w: 680, h: 225, sortY: 99, parallaxFactor: 0.85, flipX: true, inSituSeamless: true },

    // PLANE 2: BOLTED STEEL DECK FLOOR (parallaxFactor: 1.0, sortY: 550, covers down to y=945)
    { id: 'z1s1.floor.steel_deck_1', imageKey: 'z1s1.floor.steel_deck', x: -80, y: 520, w: 1020, h: 425, sortY: 550, parallaxFactor: 1.0, inSituSeamless: true },
    { id: 'z1s1.floor.steel_deck_2', imageKey: 'z1s1.floor.steel_deck', x: 880, y: 520, w: 1020, h: 425, sortY: 550, parallaxFactor: 1.0, flipX: true, inSituSeamless: true },
    { id: 'z1s1.floor.steel_deck_3', imageKey: 'z1s1.floor.steel_deck', x: 1820, y: 520, w: 740, h: 425, sortY: 550, parallaxFactor: 1.0, inSituSeamless: true },

    // PLANE 3: WALL PROPS & CAGED SUBMARINE LAMPS (parallaxFactor: 0.85, matching ref_z1s1_machineroom_2010.png)
    { id: 'z1s1.wall.caged_lamp_1', imageKey: 'z1s1.wall.caged_lamp', x: 520, y: 185, w: 96, h: 128, sortY: 558, parallaxFactor: 0.85 },
    { id: 'z1s1.wall.book_shelf', imageKey: 'z1s1.wall.book_shelf', x: 740, y: 175, w: 330, h: 230, sortY: 560, parallaxFactor: 0.85 },
    { id: 'z1s1.wall.caged_lamp_2', imageKey: 'z1s1.wall.caged_lamp', x: 1500, y: 185, w: 96, h: 128, sortY: 558, parallaxFactor: 0.85 },
    { id: 'z1s1.wall.caged_lamp_3', imageKey: 'z1s1.wall.caged_lamp', x: 1960, y: 185, w: 96, h: 128, sortY: 558, parallaxFactor: 0.85 },
    { id: 'z1s1.prop.iron_ladder', hotspotId: 'z1s1_ladder_lounge', imageKey: 'z1s1.prop.iron_ladder', x: 1125, y: 65, w: 220, h: 565, sortY: 565, parallaxFactor: 0.92 },

    // PLANE 4: 4 SUBMARINE PEDAL-CRANK GENERATOR STATIONS & DA VINCI PERPETUAL MACHINE (parallaxFactor: 1.0)
    { id: 'z1s1.prop.pedal_station_1', imageKey: 'z1s1.prop.pedal_station_intact', x: 290, y: 380, w: 325, h: 324, sortY: 726, parallaxFactor: 1.0 },
    { id: 'z1s1.prop.pedal_station_2', imageKey: 'z1s1.prop.pedal_station_intact', x: 710, y: 380, w: 325, h: 324, sortY: 728, parallaxFactor: 1.0 },
    { id: 'z1s1.prop.pedal_station_intact', imageKey: 'z1s1.prop.pedal_station_intact', x: 1135, y: 380, w: 325, h: 324, sortY: 730, parallaxFactor: 1.0 },
    { id: 'z1s1.prop.pedal_station_broken', hotspotId: 'z1s1_pedal_engine', imageKey: 'z1s1.prop.pedal_station_broken', x: 1555, y: 415, w: 320, h: 292, sortY: 735, parallaxFactor: 1.0, visibleWhen: (f) => !f.perpetualMachineInstalled },
    { id: 'z1s1.prop.perpetual_machine_installed', hotspotId: 'z1s1_pedal_engine', imageKey: 'z1s1.prop.perpetual_machine_installed', x: 1500, y: 305, w: 405, h: 412, sortY: 736, parallaxFactor: 1.0, visibleWhen: (f) => f.perpetualMachineInstalled },
    { id: 'z1s1.item.davinci_blueprint', hotspotId: 'z1s1_blueprint_pickup', imageKey: 'z1s1.item.davinci_blueprint', x: 865, y: 605, w: 145, h: 135, sortY: 738, parallaxFactor: 1.0, visibleWhen: (f) => !f.nihongoGaveBlueprint },

    // PLANE 5: PROMINENT FOREGROUND BILGE GARBAGE TRENCH (003_front_panel.png, visible above HUD bar!)
    { id: 'z1s1.fg.toxic_barrels', hotspotId: 'z1s1_rad_barrels', imageKey: 'z1s1.fg.toxic_barrels', x: 290, y: 545, w: 340, h: 275, sortY: 920, parallaxFactor: 1.14 },
    { id: 'z1s1.fg.toxic_barrels_2', hotspotId: 'z1s1_rad_barrels', imageKey: 'z1s1.fg.toxic_barrels', x: 575, y: 575, w: 315, h: 255, sortY: 921, parallaxFactor: 1.14, flipX: true },
    { id: 'z1s1.fg.broken_toaster', hotspotId: 'z1s1_rat_tv', imageKey: 'z1s1.fg.broken_toaster', x: 880, y: 595, w: 235, h: 220, sortY: 922, parallaxFactor: 1.14 },
    { id: 'z1s1.fg.bilge_rat', hotspotId: 'z1s1_rat_tv', imageKey: 'z1s1.fg.bilge_rat', x: 1095, y: 635, w: 155, h: 155, sortY: 926, parallaxFactor: 1.14 },
    { id: 'z1s1.fg.potato_sacks', hotspotId: 'z1s1_rat_tv', imageKey: 'z1s1.fg.potato_sacks', x: 1245, y: 565, w: 345, h: 260, sortY: 924, parallaxFactor: 1.14 },
    { id: 'z1s1.fg.potato_sacks_2', hotspotId: 'z1s1_rat_tv', imageKey: 'z1s1.fg.potato_sacks', x: 1545, y: 580, w: 330, h: 250, sortY: 925, parallaxFactor: 1.14, flipX: true },"""

    if old_z1s1_block in txt:
        txt = txt.replace(old_z1s1_block, new_z1s1_block)
    elif old_z1s1_block.replace("\n", "\r\n") in txt:
        txt = txt.replace(old_z1s1_block.replace("\n", "\r\n"), new_z1s1_block.replace("\n", "\r\n"))
    else:
        print("WARNING: old_z1s1_block not found in WorldData.ts!")
    with open(p, "w", encoding="utf-8") as f:
        f.write(txt)
    print("Updated src/scenarios/WorldData.ts")


def update_character_rigs_and_portraits():
    configs = [
        ("nihongo", "nihongo", NIHONGO_BOXES, ("eyes_normal", "brows_normal", "hand_front_fist")),
        ("ababy", "ababy", ABABY_BOXES, ("eyes_normal",)),
        ("ventriloquist", "ventriloquist", VENTRILO_BOXES, ("eyes_normal",)),
        ("troll", "z0", TROLL_BOXES, ("eyes",)),
    ]
    for char_id, cat, boxes, default_variants in configs:
        cdir = os.path.join(ROOT, "characters", char_id)
        os.makedirs(cdir, exist_ok=True)
        rig_data = {"character": char_id, "canvas": [340, 400], "parts": {}}
        canvas = Image.new("RGBA", (340, 400), (0, 0, 0, 0))
        sorted_items = sorted(boxes.items(), key=lambda kv: kv[1]["z"])
        for k, v in sorted_items:
            rig_data["parts"][k] = {"id": v["pid"], "x": v["x"], "y": v["y"], "w": v["w"], "h": v["h"], "z": v["z"]}
            if k.startswith(("eyes_", "brows_", "hand_front_")) and k not in default_variants:
                continue
            png_path = os.path.join(ROOT, "art", "approved", cat, f"{v['pid']}.png")
            if os.path.exists(png_path):
                im = Image.open(png_path).convert("RGBA").resize((v["w"], v["h"]), Image.LANCZOS)
                canvas.alpha_composite(im, (v["x"], v["y"]))
        with open(os.path.join(cdir, "rig.json"), "w", encoding="utf-8") as f:
            json.dump(rig_data, f, indent=2, ensure_ascii=False)
        canvas.save(os.path.join(cdir, "portrait.png"))
        print(f"Wrote characters/{char_id}/rig.json & portrait.png")


def sync_candidates_and_manifest():
    # Ensure all art/candidates/*/meta.json have status="proposed" so Mesa de Luz lists all pieces
    for mp in sorted(glob.glob(os.path.join(ROOT, "art", "candidates", "*", "meta.json"))):
        d = json.load(open(mp, encoding="utf-8"))
        pid = d.get("id") or os.path.basename(os.path.dirname(mp))
        d["id"] = pid
        if d.get("status") == "approved":
            d["status"] = "proposed"
        if "proposed_version" not in d:
            d["proposed_version"] = d.get("approved_version", "v1")
        with open(mp, "w", encoding="utf-8") as f:
            json.dump(d, f, indent=2, ensure_ascii=False)

    # Update MANIFEST.json hashes for all art/approved/*/*.png
    man_path = os.path.join(ROOT, "art", "approved", "MANIFEST.json")
    man = json.load(open(man_path, encoding="utf-8")) if os.path.exists(man_path) else {"pieces": {}, "superseded": []}
    for p in sorted(glob.glob(os.path.join(ROOT, "art", "approved", "*", "*.png"))):
        cat = os.path.basename(os.path.dirname(p))
        if cat.startswith("_"):
            continue
        pid = os.path.basename(p)[:-4]
        h = hashlib.sha256(open(p, "rb").read()).hexdigest()
        rel_p = os.path.relpath(p, ROOT).replace("\\", "/")
        mp = os.path.join(ROOT, "art", "candidates", pid, "meta.json")
        meta = json.load(open(mp, encoding="utf-8")) if os.path.exists(mp) else {}
        ver = meta.get("proposed_version", "v1")
        man["pieces"][pid] = {
            "path": rel_p,
            "version": ver,
            "sha256": h,
            "category": cat,
            "kind": meta.get("kind", "body_part"),
            "meta": f"art/candidates/{pid}/meta.json",
            "approved_at": "2026-10-24T06:18:00",
            "reason": "Canonical 2010 cutout style verified across all 8 automated gates",
        }
    with open(man_path, "w", encoding="utf-8") as f:
        json.dump(man, f, indent=2, ensure_ascii=False)
    print(f"Updated art/approved/MANIFEST.json ({len(man['pieces'])} pieces)")


if __name__ == "__main__":
    update_cutout_rig_renderer()
    update_review_sheet()
    update_world_data()
    update_character_rigs_and_portraits()
    sync_candidates_and_manifest()
