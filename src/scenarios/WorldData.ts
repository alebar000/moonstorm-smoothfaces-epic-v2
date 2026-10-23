/**
 * MoonStorm Studios - Smoothface's Epic (Codename: Sparkle)
 * Slice 1 Canonical Z1S3 Multi-Plane Cut-Out Scene Objects, Item, Puzzle & Dialogue Definitions (src/scenarios/WorldData.ts)
 *
 * Implements the frozen Slice 1 scope (`SLICE.md` & `layout/z1s3.layout.json`):
 * - Room: Z1S3 (Captain Dread's Cabin, 2400x900 panoramic stage, 1600x900 camera viewport)
 * - Multi-Plane Parallax: wall (0.82), wall_props (0.88), floor/characters (1.0, Y-sorted), foreground (1.22), ribs (1.35)
 * - Characters: Mr. Smoothface (playable, 315px) and Captain Dread (NPC, 330px)
 * - Puzzle: Collect the Bag of Hammers, Tripod Portrait Stand, and Super-Glue in Captain Dread's Cabin and assemble the Perpetual Movement Machine in the inventory!
 */

import { VoiceProfileId } from '../engine/AudioVoiceEngine';

export type RoomId = 'Z1S3' | 'Z1S2' | 'Z1S1' | 'LOLDEMO';

export const ROOM_WIDTHS: Record<RoomId, number> = {
  Z1S3: 2400,
  Z1S2: 2200,
  Z1S1: 2200,
  LOLDEMO: 1920,
};

export interface InventoryItemDef {
  id: string;
  name: string;
  icon: string;
  inspectText: string;
}

export interface WorldFlags {
  introWatched: boolean;
  pedalBrokenBam: boolean;
  nihongoGaveBlueprint: boolean;
  drawerOpened: boolean;
  gotHammerBag: boolean;
  gotPortraitStand: boolean;
  gotGlue: boolean;
  funkyTownClueLearned: boolean;
  vaultUnlocked: boolean;
  gotHelm: boolean;
  perpetualMachineBuilt: boolean;
  perpetualMachineInstalled: boolean;
  trollSpawned: boolean;
  sirenTriggered: boolean;
}

export function createInitialFlags(): WorldFlags {
  return {
    introWatched: false,
    pedalBrokenBam: false,
    nihongoGaveBlueprint: false,
    drawerOpened: false,
    gotHammerBag: false,
    gotPortraitStand: false,
    gotGlue: false,
    funkyTownClueLearned: false,
    vaultUnlocked: false,
    gotHelm: false,
    perpetualMachineBuilt: false,
    perpetualMachineInstalled: false,
    trollSpawned: false,
    sirenTriggered: false,
  };
}

// Clean SVG paper-cutout icons for inventory items (used while L9/L10 prop PNGs finish generating at 04:20Z)
const ICON_HAMMER_BAG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><g stroke='%231C1410' stroke-width='4' stroke-linejoin='round'><rect x='24' y='10' width='12' height='36' rx='3' fill='%238A5830' transform='rotate(-18 30 28)'/><rect x='14' y='6' width='28' height='14' rx='3' fill='%236B707B' transform='rotate(-18 28 13)'/><rect x='54' y='12' width='12' height='36' rx='3' fill='%238A5830' transform='rotate(16 60 30)'/><rect x='46' y='8' width='28' height='14' rx='3' fill='%236B707B' transform='rotate(16 60 15)'/><path d='M20 42 C14 56 16 84 30 86 L66 86 C80 84 82 56 76 42 Z' fill='%23C89D66'/><path d='M24 44 L72 44' stroke='%23603913' stroke-width='5'/></g></svg>";

const ICON_PORTRAIT_STAND =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><g stroke='%231C1410' stroke-width='4' stroke-linejoin='round'><line x1='48' y1='12' x2='22' y2='88' stroke-width='6' stroke='%238A5830'/><line x1='48' y1='12' x2='74' y2='88' stroke-width='6' stroke='%238A5830'/><line x1='48' y1='12' x2='48' y2='90' stroke-width='6' stroke='%23603913'/><rect x='24' y='18' width='48' height='42' rx='4' fill='%23D69A2A'/><rect x='30' y='24' width='36' height='30' fill='%233A2E4C'/><circle cx='48' cy='38' r='9' fill='%23E0A882'/><path d='M36 46 Q48 56 60 46' fill='%232B1D14'/><rect x='18' y='58' width='60' height='7' rx='2' fill='%238A5830'/></g></svg>";

const ICON_GLUE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><g stroke='%231C1410' stroke-width='4' stroke-linejoin='round'><polygon points='48,10 38,34 58,34' fill='%23E3B65A'/><rect x='34' y='34' width='28' height='10' rx='2' fill='%23B8292F'/><rect x='28' y='44' width='40' height='42' rx='8' fill='%23F2EAD8'/><rect x='32' y='54' width='32' height='18' fill='%23E3B65A'/></g></svg>";

const ICON_PERPETUAL =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><g stroke='%231C1410' stroke-width='4' stroke-linejoin='round'><line x1='48' y1='34' x2='24' y2='90' stroke-width='6' stroke='%238A5830'/><line x1='48' y1='34' x2='72' y2='90' stroke-width='6' stroke='%238A5830'/><circle cx='48' cy='40' r='26' fill='none' stroke='%238A5830' stroke-width='8'/><circle cx='48' cy='40' r='8' fill='%23E3B65A'/><rect x='44' y='4' width='8' height='16' fill='%236B707B'/><rect x='72' y='36' width='16' height='8' fill='%236B707B'/><rect x='44' y='62' width='8' height='16' fill='%236B707B'/><rect x='8' y='36' width='16' height='8' fill='%236B707B'/></g></svg>";

export const ITEMS_CATALOG: Record<string, InventoryItemDef> = {
  blueprint: {
    id: 'blueprint',
    name: "Da Vinci's Blueprint",
    icon: ICON_PERPETUAL,
    inspectText:
      "Leonardo da Vinci's schematic for a Perpetual Movement Machine! Combine the Bag of Hammers, the Tripod Portrait Stand, and the Industrial Super-Glue from Captain Dread's Cabin!",
  },
  hammer_bag: {
    id: 'hammer_bag',
    name: 'Bag of Hammers',
    icon: ICON_HAMMER_BAG,
    inspectText:
      'A canvas sack stuffed with absurdly heavy iron sledgehammers. Ideal for rotational momentum or cartoon concussions.',
  },
  portrait_stand: {
    id: 'portrait_stand',
    name: 'Portrait Easel Stand',
    icon: ICON_PORTRAIT_STAND,
    inspectText:
      'A sturdy wooden tripod easel holding an overly flattering portrait of Captain Dread. The tripod frame can support a heavy spinning wheel.',
  },
  glue: {
    id: 'glue',
    name: 'Industrial Super-Glue',
    icon: ICON_GLUE,
    inspectText:
      'Military-grade naval adhesive from Captain Dread\'s desk. Warning label: "Will bond iron, wood, and fingers permanently in 0.4 seconds."',
  },
  helm: {
    id: 'helm',
    name: "Ship's Wooden Helm",
    icon: 'art/approved/z1s3/z1s3.wall.helm_wheel.png',
    inspectText:
      "The Substampede's spare mahogany steering wheel. Eight solid spokes ready for counterweight hammers!",
  },
  perpetual_machine: {
    id: 'perpetual_machine',
    name: 'Perpetual Movement Machine',
    icon: ICON_PERPETUAL,
    inspectText:
      'Behold! A genuine Leonardo da Vinci Perpetual Movement Machine assembled from the Tripod Portrait Stand, the Bag of Hammers, and Captain Dread\'s Industrial Super-Glue!',
  },
};

export interface DialogueOption {
  label: string;
  replySpeaker: string;
  replyVoice: VoiceProfileId;
  replyPortrait: string;
  replyMood: string;
  replyText: string;
  onSelectFlag?: keyof WorldFlags;
  openModal?: 'keypad';
}

export interface SceneObjectDef {
  id: string;
  hotspotId?: string;
  imageKey: string;
  x: number;
  y: number;
  w: number;
  h: number;
  sortY: number;
  parallaxFactor?: number;
  parallaxAnchorX?: number;
  tiltDeg?: number;
  inSituSeamless?: boolean;
  idleAnim?: 'none' | 'swing' | 'bob' | 'vibrate';
  fxType?:
    | 'steam_valve'
    | 'spark_cable'
    | 'cage_lamp'
    | 'porthole'
    | 'crt_tv'
    | 'fishbowl'
    | 'sarcophagus_eyes'
    | 'crate_eyes'
    | 'funky_vault'
    | 'pedal_engine';
  flipX?: boolean;
  visibleWhen?: (flags: WorldFlags) => boolean;
}

export interface HotspotDef {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  walkX: number;
  walkY: number;
  cursor: 'pointer' | 'grab' | 'talk' | 'exit';
  isExitTo?: RoomId;
  parallaxFactor?: number;
  parallaxAnchorX?: number;
  visibleWhen?: (flags: WorldFlags) => boolean;
}

/**
 * Every single architectural panel, seam, beam, floor plank, wall prop, mid-ground furniture piece,
 * and foreground cutout in Z1S3 is its own independent atomic RGBA asset from `art/approved/z1s3/*.png`
 * arranged across the 2400x900 multi-plane scrolling stage (`layout/z1s3.layout.json`)!
 */
export const ROOM_OBJECTS: Record<RoomId, SceneObjectDef[]> = {
  Z1S3: [
    // =========================================================
    // PLANE 1: WALL HULL PANELS, RIVET SEAMS & CEILING BEAMS (parallaxFactor: 0.82)
    // =========================================================
    {
      id: 'z1s3.wall.panel_a',
      imageKey: 'z1s3.wall.panel_a',
      x: -40,
      y: 0,
      w: 732,
      h: 620,
      sortY: 100,
      parallaxFactor: 0.82,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.wall.panel_b',
      imageKey: 'z1s3.wall.panel_b',
      x: 660,
      y: 0,
      w: 743,
      h: 620,
      sortY: 100,
      parallaxFactor: 0.82,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.wall.panel_c',
      imageKey: 'z1s3.wall.panel_c',
      x: 1360,
      y: 0,
      w: 735,
      h: 620,
      sortY: 100,
      parallaxFactor: 0.82,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.wall.panel_a_right',
      imageKey: 'z1s3.wall.panel_a',
      x: 2040,
      y: 0,
      w: 732,
      h: 620,
      sortY: 100,
      parallaxFactor: 0.82,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.wall.seam_strip_1',
      imageKey: 'z1s3.wall.seam_strip',
      x: 590,
      y: 0,
      w: 150,
      h: 620,
      sortY: 110,
      parallaxFactor: 0.82,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.wall.seam_strip_2',
      imageKey: 'z1s3.wall.seam_strip',
      x: 1300,
      y: 0,
      w: 150,
      h: 620,
      sortY: 110,
      parallaxFactor: 0.82,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.wall.seam_strip_3',
      imageKey: 'z1s3.wall.seam_strip',
      x: 1980,
      y: 0,
      w: 150,
      h: 620,
      sortY: 110,
      parallaxFactor: 0.82,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.ceiling.beam_a',
      imageKey: 'z1s3.ceiling.beam_a',
      x: 0,
      y: 0,
      w: 525,
      h: 232,
      sortY: 120,
      parallaxFactor: 0.82,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.ceiling.beam_b',
      imageKey: 'z1s3.ceiling.beam_b',
      x: 800,
      y: 0,
      w: 760,
      h: 264,
      sortY: 120,
      parallaxFactor: 0.82,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.ceiling.beam_a_right',
      imageKey: 'z1s3.ceiling.beam_a',
      x: 1680,
      y: 0,
      w: 525,
      h: 232,
      sortY: 120,
      parallaxFactor: 0.82,
      flipX: true,
      inSituSeamless: true,
    },

    // =========================================================
    // PLANE 2: FLOOR PLANKS (parallaxFactor: 1.0, sortY: 550)
    // =========================================================
    {
      id: 'z1s3.floor.planks_a',
      imageKey: 'z1s3.floor.planks_a',
      x: 0,
      y: 560,
      w: 840,
      h: 360,
      sortY: 550,
      parallaxFactor: 1.0,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.floor.planks_b',
      imageKey: 'z1s3.floor.planks_b',
      x: 810,
      y: 560,
      w: 810,
      h: 360,
      sortY: 550,
      parallaxFactor: 1.0,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.floor.planks_a_right',
      imageKey: 'z1s3.floor.planks_a',
      x: 1590,
      y: 560,
      w: 840,
      h: 360,
      sortY: 550,
      parallaxFactor: 1.0,
      inSituSeamless: true,
    },

    // =========================================================
    // PLANE 3: WALL PROPS (parallaxFactor: 0.88, sortY: 560)
    // =========================================================
    {
      id: 'z1s3.wall.door',
      hotspotId: 'z1s3_door_lounge',
      imageKey: 'z1s3.wall.door',
      x: 340,
      y: 195,
      w: 310,
      h: 418,
      sortY: 560,
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3.wall.porthole',
      hotspotId: 'z1s3_porthole',
      imageKey: 'z1s3.wall.porthole',
      x: 720,
      y: 160,
      w: 208,
      h: 208,
      sortY: 560,
      parallaxFactor: 0.88,
      fxType: 'porthole',
    },
    {
      id: 'z1s3.wall.poster',
      hotspotId: 'z1s3_mss_poster',
      imageKey: 'z1s3.wall.poster',
      x: 960,
      y: 140,
      w: 116,
      h: 146,
      sortY: 560,
      parallaxFactor: 0.88,
      tiltDeg: -2.0,
    },
    {
      id: 'z1s3.wall.pipes',
      hotspotId: 'z1s3_steam_pipe',
      imageKey: 'z1s3.wall.pipes',
      x: 1160,
      y: 120,
      w: 50,
      h: 128,
      sortY: 560,
      parallaxFactor: 0.88,
      fxType: 'steam_valve',
    },
    {
      id: 'z1s3.wall.mask_a',
      hotspotId: 'z1s3_wall_masks',
      imageKey: 'z1s3.wall.mask_a',
      x: 1220,
      y: 180,
      w: 56,
      h: 96,
      sortY: 561,
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3.wall.helm_wheel',
      hotspotId: 'z1s3_wall_masks',
      imageKey: 'z1s3.wall.helm_wheel',
      x: 1360,
      y: 150,
      w: 186,
      h: 186,
      sortY: 561,
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3.wall.mask_b',
      hotspotId: 'z1s3_wall_masks',
      imageKey: 'z1s3.wall.mask_b',
      x: 1560,
      y: 180,
      w: 88,
      h: 96,
      sortY: 561,
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3.wall.shelf',
      hotspotId: 'z1s3_wall_masks',
      imageKey: 'z1s3.wall.shelf',
      x: 1350,
      y: 320,
      w: 214,
      h: 125,
      sortY: 562,
      parallaxFactor: 0.88,
    },

    // =========================================================
    // PLANE 4: FLOOR FURNITURE & PUZZLE PROPS (parallaxFactor: 1.0, Y-sorted with characters!)
    // =========================================================
    {
      id: 'z1s3.prop.sarcophagus',
      hotspotId: 'z1s3_sarcophagus',
      imageKey: 'z1s3.prop.sarcophagus',
      x: 76,
      y: 375,
      w: 228,
      h: 420,
      sortY: 795,
      parallaxFactor: 1.0,
      tiltDeg: -1.2,
      fxType: 'sarcophagus_eyes',
    },
    {
      id: 'z1s3.prop.coat_rack',
      hotspotId: 'z1s3_coat_rack',
      imageKey: 'z1s3.prop.coat_rack',
      x: 354,
      y: 445,
      w: 192,
      h: 123,
      sortY: 745,
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3.prop.coat',
      hotspotId: 'z1s3_coat_rack',
      imageKey: 'z1s3.prop.coat',
      x: 398,
      y: 495,
      w: 103,
      h: 237,
      sortY: 746,
      parallaxFactor: 1.0,
      idleAnim: 'swing',
    },
    {
      id: 'z1s3.prop.hat',
      hotspotId: 'z1s3_coat_rack',
      imageKey: 'z1s3.prop.hat',
      x: 386,
      y: 432,
      w: 128,
      h: 97,
      sortY: 747,
      parallaxFactor: 1.0,
      tiltDeg: 6,
    },
    {
      id: 'z1s3.prop.desk',
      hotspotId: 'z1s3_desk_drawer',
      imageKey: 'z1s3.prop.desk',
      x: 705,
      y: 519,
      w: 350,
      h: 221,
      sortY: 740,
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3.prop.tv',
      hotspotId: 'z1s3_crt_tv',
      imageKey: 'z1s3.prop.tv',
      x: 736,
      y: 410,
      w: 129,
      h: 128,
      sortY: 741,
      parallaxFactor: 1.0,
      fxType: 'crt_tv',
    },
    {
      id: 'z1s3.prop.fishbowl',
      hotspotId: 'z1s3_fishbowl',
      imageKey: 'z1s3.prop.fishbowl',
      x: 902,
      y: 443,
      w: 96,
      h: 95,
      sortY: 741,
      parallaxFactor: 1.0,
      fxType: 'fishbowl',
    },
    {
      id: 'z1s3.prop.glue',
      hotspotId: 'z1s3_desk_drawer',
      imageKey: 'z1s3.prop.glue',
      x: 1005,
      y: 465,
      w: 58,
      h: 72,
      sortY: 742,
      parallaxFactor: 1.0,
      visibleWhen: (f) => !f.gotGlue,
    },
    {
      id: 'z1s3.prop.easel_portrait',
      hotspotId: 'z1s3_portrait_stand',
      imageKey: 'z1s3.prop.easel_portrait',
      x: 1105,
      y: 490,
      w: 165,
      h: 255,
      sortY: 745,
      parallaxFactor: 1.0,
      visibleWhen: (f) => !f.gotPortraitStand,
    },
    {
      id: 'z1s3.prop.hammer_bag',
      hotspotId: 'z1s3_hammer_bag',
      imageKey: 'z1s3.prop.hammer_bag',
      x: 1255,
      y: 660,
      w: 110,
      h: 105,
      sortY: 765,
      parallaxFactor: 1.0,
      idleAnim: 'bob',
      visibleWhen: (f) => !f.gotHammerBag,
    },
    {
      id: 'z1s3.prop.dirty_laundry',
      hotspotId: 'z1s3_dirty_clothes',
      imageKey: 'z1s3.prop.dirty_laundry',
      x: 1580,
      y: 675,
      w: 135,
      h: 85,
      sortY: 755,
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3.prop.nightstand',
      hotspotId: 'z1s3_nightstand_lamp',
      imageKey: 'z1s3.prop.nightstand',
      x: 1722,
      y: 586,
      w: 155,
      h: 164,
      sortY: 750,
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3.prop.lamp',
      hotspotId: 'z1s3_nightstand_lamp',
      imageKey: 'z1s3.prop.lamp',
      x: 1755,
      y: 485,
      w: 90,
      h: 115,
      sortY: 751,
      parallaxFactor: 1.0,
      tiltDeg: 3.5,
    },
    {
      id: 'z1s3.prop.bed',
      hotspotId: 'z1s3_bunk_bed',
      imageKey: 'z1s3.prop.bed',
      x: 1890,
      y: 500,
      w: 350,
      h: 250,
      sortY: 750,
      parallaxFactor: 1.0,
    },

    // =========================================================
    // PLANE 5 & 6: FOREGROUND (1.22) & HULL RIBS (1.35)
    // =========================================================
    {
      id: 'z1s3.fg.card_table',
      hotspotId: 'z1s3_ship_bottle',
      imageKey: 'z1s3.fg.card_table',
      x: 430,
      y: 710,
      w: 360,
      h: 195,
      sortY: 885,
      parallaxFactor: 1.22,
    },
    {
      id: 'z1s3.fg.ship_in_bottle',
      hotspotId: 'z1s3_ship_bottle',
      imageKey: 'z1s3.fg.ship_in_bottle',
      x: 525,
      y: 625,
      w: 165,
      h: 110,
      sortY: 888,
      parallaxFactor: 1.22,
    },
    {
      id: 'z1s3.fg.chest',
      hotspotId: 'z1s3_clown_voodoo',
      imageKey: 'z1s3.fg.chest',
      x: 1320,
      y: 715,
      w: 350,
      h: 195,
      sortY: 885,
      parallaxFactor: 1.22,
    },
    {
      id: 'z1s3.fg.clown_bust',
      hotspotId: 'z1s3_clown_voodoo',
      imageKey: 'z1s3.fg.clown_bust',
      x: 1465,
      y: 590,
      w: 130,
      h: 155,
      sortY: 889,
      parallaxFactor: 1.22,
      tiltDeg: 2.5,
    },
    {
      id: 'z1s3.fg.voodoo_doll',
      hotspotId: 'z1s3_clown_voodoo',
      imageKey: 'z1s3.fg.voodoo_doll',
      x: 1380,
      y: 615,
      w: 115,
      h: 135,
      sortY: 890,
      parallaxFactor: 1.22,
      tiltDeg: -4.0,
    },
    {
      id: 'z1s3.fg.hull_rib_left',
      imageKey: 'z1s3.fg.hull_rib_left',
      x: 0,
      y: 0,
      w: 220,
      h: 900,
      sortY: 898,
      parallaxFactor: 1.35,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.fg.hull_rib_right',
      imageKey: 'z1s3.fg.hull_rib_right',
      x: 2180,
      y: 0,
      w: 220,
      h: 900,
      sortY: 898,
      parallaxFactor: 1.35,
      inSituSeamless: true,
    },
  ],
  Z1S2: [],
  Z1S1: [],
  LOLDEMO: [],
};

export const ROOM_HOTSPOTS: Record<RoomId, HotspotDef[]> = {
  Z1S3: [
    {
      id: 'z1s3_sarcophagus',
      name: 'Golden Egyptian Sarcophagus',
      x: 76,
      y: 375,
      w: 228,
      h: 420,
      walkX: 280,
      walkY: 810,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_door_lounge',
      name: 'Submarine Bulkhead Door',
      x: 340,
      y: 195,
      w: 310,
      h: 418,
      walkX: 495,
      walkY: 790,
      cursor: 'pointer',
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3_coat_rack',
      name: "Captain's Peg Rack, Coat & Hat",
      x: 354,
      y: 432,
      w: 192,
      h: 300,
      walkX: 450,
      walkY: 800,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_porthole',
      name: 'Deep-Sea Submarine Porthole',
      x: 720,
      y: 160,
      w: 208,
      h: 208,
      walkX: 820,
      walkY: 785,
      cursor: 'pointer',
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3_mss_poster',
      name: 'MoonStorm Studios Wall Poster',
      x: 960,
      y: 140,
      w: 116,
      h: 146,
      walkX: 1018,
      walkY: 785,
      cursor: 'pointer',
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3_crt_tv',
      name: 'Retro Submarine CRT Television',
      x: 736,
      y: 410,
      w: 129,
      h: 128,
      walkX: 800,
      walkY: 795,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_fishbowl',
      name: "Captain Dread's Grumpy Goldfish Bowl",
      x: 902,
      y: 443,
      w: 96,
      h: 95,
      walkX: 950,
      walkY: 795,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_desk_drawer',
      name: "Captain's Mahogany Desk & Super-Glue",
      x: 705,
      y: 465,
      w: 360,
      h: 275,
      walkX: 880,
      walkY: 805,
      cursor: 'grab',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_portrait_stand',
      name: "Captain's Tripod Portrait Stand",
      x: 1105,
      y: 490,
      w: 165,
      h: 255,
      walkX: 1185,
      walkY: 805,
      cursor: 'grab',
      parallaxFactor: 1.0,
      visibleWhen: (f) => !f.gotPortraitStand,
    },
    {
      id: 'z1s3_hammer_bag',
      name: 'Bag of Heavy Hammers',
      x: 1255,
      y: 660,
      w: 110,
      h: 105,
      walkX: 1310,
      walkY: 815,
      cursor: 'grab',
      parallaxFactor: 1.0,
      visibleWhen: (f) => !f.gotHammerBag,
    },
    {
      id: 'z1s3_wall_masks',
      name: 'Tribal Masks, Spare Helm & Rations Shelf',
      x: 1220,
      y: 150,
      w: 430,
      h: 295,
      walkX: 1435,
      walkY: 790,
      cursor: 'pointer',
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3_cap_dread',
      name: 'Captain Dread (Submarine Commander)',
      x: 1340,
      y: 490,
      w: 170,
      h: 330,
      walkX: 1260,
      walkY: 820,
      cursor: 'talk',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_nightstand_lamp',
      name: 'Crooked Crate Nightstand & Lamp',
      x: 1722,
      y: 485,
      w: 155,
      h: 265,
      walkX: 1795,
      walkY: 805,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_bunk_bed',
      name: "Captain Dread's Pirate Bunk Bed",
      x: 1890,
      y: 500,
      w: 350,
      h: 250,
      walkX: 1980,
      walkY: 805,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
  ],
  Z1S2: [],
  Z1S1: [],
  LOLDEMO: [],
};
