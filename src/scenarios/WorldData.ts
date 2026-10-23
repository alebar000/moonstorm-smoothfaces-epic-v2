/**
 * MoonStorm Studios - Smoothface's Epic (Codename: Sparkle)
 * Slice 1 Canonical Z1S3 Multi-Plane Cut-Out Scene Objects, Item, Puzzle & Dialogue Definitions (src/scenarios/WorldData.ts)
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

export const ITEMS_CATALOG: Record<string, InventoryItemDef> = {
  blueprint: {
    id: 'blueprint',
    name: "Da Vinci's Blueprint",
    icon: 'art/approved/z1s3/z1s3.wall.poster.png',
    inspectText:
      "Leonardo da Vinci's schematic for a Perpetual Movement Machine! Combine the Bag of Hammers, the Tripod Portrait Stand, and the Industrial Super-Glue from Captain Dread's Cabin!",
  },
  hammer_bag: {
    id: 'hammer_bag',
    name: 'Bag of Hammers',
    icon: 'art/approved/z1s3/z1s3.prop.nightstand.png',
    inspectText:
      'A canvas sack stuffed with absurdly heavy iron sledgehammers. Ideal for rotational momentum or cartoon concussions.',
  },
  portrait_stand: {
    id: 'portrait_stand',
    name: 'Portrait Easel Stand',
    icon: 'art/approved/z1s3/z1s3.wall.poster.png',
    inspectText:
      'A sturdy wooden frame and stand from Captain Dread\'s cabin. Ideal for supporting a spinning wheel.',
  },
  glue: {
    id: 'glue',
    name: 'Industrial Super-Glue',
    icon: 'art/approved/z1s3/z1s3.prop.fishbowl.png',
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
    icon: 'art/approved/z1s3/z1s3.wall.helm_wheel.png',
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

export const ROOM_OBJECTS: Record<RoomId, SceneObjectDef[]> = {
  Z1S3: [
    // =========================================================
    // PLANE 1: CONTINUOUS WALL HULL PANELS, SEAMS & CEILING BEAMS (parallaxFactor: 0.85)
    // Overlapped by 80px to compensate for the 72px transparent border in each normalized PNG
    // =========================================================
    {
      id: 'z1s3.wall.panel_a_1',
      imageKey: 'z1s3.wall.panel_a',
      x: -75,
      y: -55,
      w: 732,
      h: 720,
      sortY: 100,
      parallaxFactor: 0.85,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.wall.panel_b_1',
      imageKey: 'z1s3.wall.panel_b',
      x: 505,
      y: -55,
      w: 743,
      h: 720,
      sortY: 100,
      parallaxFactor: 0.85,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.wall.panel_c_1',
      imageKey: 'z1s3.wall.panel_c',
      x: 1095,
      y: -55,
      w: 735,
      h: 720,
      sortY: 100,
      parallaxFactor: 0.85,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.wall.panel_b_2',
      imageKey: 'z1s3.wall.panel_b',
      x: 1680,
      y: -55,
      w: 743,
      h: 720,
      sortY: 100,
      parallaxFactor: 0.85,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.wall.panel_a_2',
      imageKey: 'z1s3.wall.panel_a',
      x: 2120,
      y: -55,
      w: 732,
      h: 720,
      sortY: 100,
      parallaxFactor: 0.85,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.wall.seam_strip_1',
      imageKey: 'z1s3.wall.seam_strip',
      x: 495,
      y: -55,
      w: 145,
      h: 720,
      sortY: 110,
      parallaxFactor: 0.85,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.wall.seam_strip_2',
      imageKey: 'z1s3.wall.seam_strip',
      x: 1085,
      y: -55,
      w: 145,
      h: 720,
      sortY: 110,
      parallaxFactor: 0.85,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.wall.seam_strip_3',
      imageKey: 'z1s3.wall.seam_strip',
      x: 1670,
      y: -55,
      w: 145,
      h: 720,
      sortY: 110,
      parallaxFactor: 0.85,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.ceiling.beam_a_left',
      imageKey: 'z1s3.ceiling.beam_a',
      x: -35,
      y: -30,
      w: 525,
      h: 232,
      sortY: 120,
      parallaxFactor: 0.85,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.ceiling.beam_b_mid',
      imageKey: 'z1s3.ceiling.beam_b',
      x: 760,
      y: -35,
      w: 760,
      h: 264,
      sortY: 120,
      parallaxFactor: 0.85,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.ceiling.beam_a_right',
      imageKey: 'z1s3.ceiling.beam_a',
      x: 1910,
      y: -30,
      w: 525,
      h: 232,
      sortY: 120,
      parallaxFactor: 0.85,
      flipX: true,
      inSituSeamless: true,
    },

    // =========================================================
    // PLANE 2: CONTINUOUS WOODEN DECK FLOOR (parallaxFactor: 1.0, sortY: 550)
    // Uses rectangular planks_a overlapped by 135px so there are ZERO black gaps
    // =========================================================
    {
      id: 'z1s3.floor.tile_1',
      imageKey: 'z1s3.floor.planks_a',
      x: -65,
      y: 510,
      w: 820,
      h: 470,
      sortY: 550,
      parallaxFactor: 1.0,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.floor.tile_2',
      imageKey: 'z1s3.floor.planks_a',
      x: 620,
      y: 510,
      w: 820,
      h: 470,
      sortY: 550,
      parallaxFactor: 1.0,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.floor.tile_3',
      imageKey: 'z1s3.floor.planks_a',
      x: 1305,
      y: 510,
      w: 820,
      h: 470,
      sortY: 550,
      parallaxFactor: 1.0,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.floor.tile_4',
      imageKey: 'z1s3.floor.planks_a',
      x: 1850,
      y: 510,
      w: 820,
      h: 470,
      sortY: 550,
      parallaxFactor: 1.0,
      inSituSeamless: true,
    },

    // =========================================================
    // PLANE 3: WALL PROPS (parallaxFactor: 0.88, sortY: 560)
    // Placed in exact canonical 2010 Z1S3 positions with zero overlap!
    // =========================================================
    {
      id: 'z1s3.prop.coat_rack',
      hotspotId: 'z1s3_coat_rack',
      imageKey: 'z1s3.prop.coat_rack',
      x: 235,
      y: 265,
      w: 175,
      h: 112,
      sortY: 561,
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3.prop.coat',
      hotspotId: 'z1s3_coat_rack',
      imageKey: 'z1s3.prop.coat',
      x: 268,
      y: 315,
      w: 103,
      h: 237,
      sortY: 562,
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3.prop.hat',
      hotspotId: 'z1s3_coat_rack',
      imageKey: 'z1s3.prop.hat',
      x: 262,
      y: 235,
      w: 128,
      h: 97,
      sortY: 563,
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3.wall.door',
      hotspotId: 'z1s3_door_lounge',
      imageKey: 'z1s3.wall.door',
      x: 415,
      y: 195,
      w: 315,
      h: 425,
      sortY: 560,
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3.wall.porthole',
      hotspotId: 'z1s3_porthole',
      imageKey: 'z1s3.wall.porthole',
      x: 755,
      y: 165,
      w: 196,
      h: 196,
      sortY: 560,
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3.wall.poster',
      hotspotId: 'z1s3_portrait_stand',
      imageKey: 'z1s3.wall.poster',
      x: 990,
      y: 150,
      w: 116,
      h: 146,
      sortY: 560,
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3.wall.pipes',
      hotspotId: 'z1s3_steam_pipe',
      imageKey: 'z1s3.wall.pipes',
      x: 1160,
      y: 130,
      w: 50,
      h: 128,
      sortY: 560,
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3.wall.mask_a',
      hotspotId: 'z1s3_wall_masks',
      imageKey: 'z1s3.wall.mask_a',
      x: 1255,
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
      x: 1355,
      y: 145,
      w: 186,
      h: 186,
      sortY: 561,
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3.wall.mask_b',
      hotspotId: 'z1s3_wall_masks',
      imageKey: 'z1s3.wall.mask_b',
      x: 1575,
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
      x: 1345,
      y: 330,
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
      x: 38,
      y: 360,
      w: 228,
      h: 420,
      sortY: 775,
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3.prop.desk',
      hotspotId: 'z1s3_desk_drawer',
      imageKey: 'z1s3.prop.desk',
      x: 760,
      y: 505,
      w: 350,
      h: 221,
      sortY: 720,
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3.prop.tv',
      hotspotId: 'z1s3_crt_tv',
      imageKey: 'z1s3.prop.tv',
      x: 785,
      y: 416,
      w: 129,
      h: 128,
      sortY: 721,
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3.prop.fishbowl',
      hotspotId: 'z1s3_fishbowl',
      imageKey: 'z1s3.prop.fishbowl',
      x: 955,
      y: 448,
      w: 96,
      h: 95,
      sortY: 721,
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3.prop.easel_portrait',
      hotspotId: 'z1s3_portrait_stand',
      imageKey: 'z1s3.prop.easel_portrait',
      x: 1135,
      y: 475,
      w: 165,
      h: 255,
      sortY: 725,
      parallaxFactor: 1.0,
      visibleWhen: (f) => !f.gotPortraitStand,
    },
    {
      id: 'z1s3.prop.hammer_bag',
      hotspotId: 'z1s3_hammer_bag',
      imageKey: 'z1s3.prop.hammer_bag',
      x: 1690,
      y: 625,
      w: 110,
      h: 105,
      sortY: 745,
      parallaxFactor: 1.0,
      visibleWhen: (f) => !f.gotHammerBag,
    },
    {
      id: 'z1s3.prop.nightstand',
      hotspotId: 'z1s3_hammer_bag',
      imageKey: 'z1s3.prop.nightstand',
      x: 1815,
      y: 555,
      w: 155,
      h: 164,
      sortY: 725,
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3.prop.bed',
      hotspotId: 'z1s3_bunk_bed',
      imageKey: 'z1s3.prop.bed',
      x: 1990,
      y: 495,
      w: 350,
      h: 250,
      sortY: 730,
      parallaxFactor: 1.0,
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
      name: 'Egyptian Sarcophagus',
      x: 38,
      y: 360,
      w: 228,
      h: 420,
      walkX: 310,
      walkY: 790,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_coat_rack',
      name: "Captain's Peg Rack, Coat & Hat",
      x: 235,
      y: 235,
      w: 175,
      h: 315,
      walkX: 350,
      walkY: 780,
      cursor: 'pointer',
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3_door_lounge',
      name: 'Submarine Bulkhead Door',
      x: 415,
      y: 195,
      w: 315,
      h: 425,
      walkX: 570,
      walkY: 775,
      cursor: 'pointer',
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3_porthole',
      name: 'Submarine Porthole',
      x: 755,
      y: 165,
      w: 196,
      h: 196,
      walkX: 850,
      walkY: 775,
      cursor: 'pointer',
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3_portrait_stand',
      name: 'Wall Poster & Portrait Frame',
      x: 980,
      y: 145,
      w: 140,
      h: 160,
      walkX: 1045,
      walkY: 775,
      cursor: 'grab',
      parallaxFactor: 0.88,
      visibleWhen: (f) => !f.gotPortraitStand,
    },
    {
      id: 'z1s3_crt_tv',
      name: 'Submarine Television',
      x: 785,
      y: 416,
      w: 129,
      h: 128,
      walkX: 850,
      walkY: 785,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_fishbowl',
      name: 'Goldfish Bowl',
      x: 955,
      y: 448,
      w: 96,
      h: 95,
      walkX: 1000,
      walkY: 785,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_desk_drawer',
      name: "Captain's Mahogany Desk Drawer",
      x: 760,
      y: 505,
      w: 350,
      h: 221,
      walkX: 935,
      walkY: 795,
      cursor: 'grab',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_wall_masks',
      name: 'Tribal Masks, Spare Helm & Rations Shelf',
      x: 1255,
      y: 145,
      w: 410,
      h: 310,
      walkX: 1380,
      walkY: 780,
      cursor: 'pointer',
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3_cap_dread',
      name: 'Captain Dread',
      x: 1465,
      y: 465,
      w: 155,
      h: 340,
      walkX: 1240,
      walkY: 800,
      cursor: 'talk',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_hammer_bag',
      name: 'Crate Nightstand & Bag of Hammers',
      x: 1815,
      y: 555,
      w: 155,
      h: 164,
      walkX: 1760,
      walkY: 795,
      cursor: 'grab',
      parallaxFactor: 1.0,
    },
  ],
  Z1S2: [],
  Z1S1: [],
  LOLDEMO: [],
};
