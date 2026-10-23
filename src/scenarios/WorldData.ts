/**
 * MoonStorm Studios - Smoothface's Epic (Codename: Sparkle)
 * Slice 1 Canonical Z1S3 Multi-Plane Cut-Out Scene Objects, Item, Puzzle & Dialogue Definitions (src/scenarios/WorldData.ts)
 */

import { VoiceProfileId } from '../engine/AudioVoiceEngine';
import officialZ1S3Json from './z1s3_official_layout.json';

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
    icon: 'art/approved/z1s3/z1s3.prop.hammer_bag.png',
    inspectText:
      'A canvas sack stuffed with absurdly heavy iron sledgehammers. Ideal for rotational momentum or cartoon concussions.',
  },
  portrait_stand: {
    id: 'portrait_stand',
    name: 'Portrait Easel Stand',
    icon: 'art/approved/z1s3/z1s3.prop.easel_portrait.png',
    inspectText:
      'A sturdy wooden tripod easel stand from Captain Dread\'s cabin. Ideal for supporting a spinning wheel.',
  },
  glue: {
    id: 'glue',
    name: 'Industrial Super-Glue',
    icon: 'art/approved/z1s3/z1s3.prop.glue.png',
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
  rotateXDeg?: number;
  rotateYDeg?: number;
  flipY?: boolean;
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
  hideWhenFlag?: keyof WorldFlags;
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
  hideWhenFlag?: keyof WorldFlags;
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
      id: 'z1s3.ceiling.beam_a_left',
      imageKey: 'z1s3.ceiling.beam_a',
      x: -45,
      y: -115,
      w: 525,
      h: 215,
      sortY: 120,
      parallaxFactor: 0.85,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.ceiling.beam_b_mid',
      imageKey: 'z1s3.ceiling.beam_b',
      x: 740,
      y: -125,
      w: 760,
      h: 220,
      sortY: 120,
      parallaxFactor: 0.85,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.ceiling.beam_a_right',
      imageKey: 'z1s3.ceiling.beam_a',
      x: 1920,
      y: -115,
      w: 525,
      h: 215,
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
    // =========================================================
    {
      id: 'z1s3.prop.coat_rack',
      hotspotId: 'z1s3_coat_rack',
      imageKey: 'z1s3.prop.coat_rack',
      x: 235,
      y: 270,
      w: 185,
      h: 118,
      sortY: 561,
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3.prop.coat',
      hotspotId: 'z1s3_coat_rack',
      imageKey: 'z1s3.prop.coat',
      x: 272,
      y: 318,
      w: 103,
      h: 237,
      sortY: 562,
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3.prop.hat',
      hotspotId: 'z1s3_coat_rack',
      imageKey: 'z1s3.prop.hat',
      x: 255,
      y: 248,
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
      hotspotId: 'z1s3_mss_poster',
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
      x: 1152,
      y: 135,
      w: 50,
      h: 128,
      sortY: 560,
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3.wall.mask_a',
      hotspotId: 'z1s3_mask_a',
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
      hotspotId: 'z1s3_helm_wheel',
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
      hotspotId: 'z1s3_mask_b',
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
      hotspotId: 'z1s3_shelf',
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
      x: 68,
      y: 365,
      w: 224,
      h: 415,
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
      x: 780,
      y: 446,
      w: 129,
      h: 128,
      sortY: 721,
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3.prop.fishbowl',
      hotspotId: 'z1s3_fishbowl',
      imageKey: 'z1s3.prop.fishbowl',
      x: 922,
      y: 476,
      w: 96,
      h: 95,
      sortY: 721,
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3.prop.glue',
      hotspotId: 'z1s3_glue',
      imageKey: 'z1s3.prop.glue',
      x: 1012,
      y: 495,
      w: 46,
      h: 73,
      sortY: 722,
      parallaxFactor: 1.0,
      visibleWhen: (f) => !f.gotGlue,
    },
    {
      id: 'z1s3.prop.easel_portrait',
      hotspotId: 'z1s3_portrait_stand',
      imageKey: 'z1s3.prop.easel_portrait',
      x: 1145,
      y: 495,
      w: 121,
      h: 237,
      sortY: 725,
      parallaxFactor: 1.0,
      visibleWhen: (f) => !f.gotPortraitStand,
    },
    {
      id: 'z1s3.prop.dirty_laundry',
      hotspotId: 'z1s3_dirty_clothes',
      imageKey: 'z1s3.prop.dirty_laundry',
      x: 1290,
      y: 685,
      w: 148,
      h: 99,
      sortY: 735,
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3.prop.hammer_bag',
      hotspotId: 'z1s3_hammer_bag',
      imageKey: 'z1s3.prop.hammer_bag',
      x: 1660,
      y: 605,
      w: 105,
      h: 100,
      sortY: 735,
      parallaxFactor: 1.0,
      visibleWhen: (f) => !f.gotHammerBag,
    },
    {
      id: 'z1s3.prop.nightstand',
      hotspotId: 'z1s3_nightstand_lamp',
      imageKey: 'z1s3.prop.nightstand',
      x: 1780,
      y: 555,
      w: 155,
      h: 164,
      sortY: 725,
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3.prop.lamp',
      hotspotId: 'z1s3_lamp',
      imageKey: 'z1s3.prop.lamp',
      x: 1822,
      y: 468,
      w: 70,
      h: 111,
      sortY: 726,
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3.prop.bed',
      hotspotId: 'z1s3_bunk_bed',
      imageKey: 'z1s3.prop.bed',
      x: 1925,
      y: 505,
      w: 395,
      h: 228,
      sortY: 730,
      parallaxFactor: 1.0,
    },

    // =========================================================
    // PLANE 5 & 6: FOREGROUND PARALLAX & HULL RIBS (L10 approved pieces)
    // Framed at the bottom/outer edges so they never obstruct the walkable floor
    // =========================================================
    {
      id: 'z1s3.fg.card_table',
      hotspotId: 'z1s3_ship_bottle',
      imageKey: 'z1s3.fg.card_table',
      x: 245,
      y: 765,
      w: 325,
      h: 180,
      sortY: 920,
      parallaxFactor: 1.14,
    },
    {
      id: 'z1s3.fg.ship_in_bottle',
      hotspotId: 'z1s3_ship_bottle',
      imageKey: 'z1s3.fg.ship_in_bottle',
      x: 268,
      y: 800,
      w: 98,
      h: 66,
      sortY: 921,
      parallaxFactor: 1.14,
    },
    {
      id: 'z1s3.fg.chest',
      hotspotId: 'z1s3_clown_voodoo',
      imageKey: 'z1s3.fg.chest',
      x: 1615,
      y: 760,
      w: 255,
      h: 190,
      sortY: 920,
      parallaxFactor: 1.14,
    },
    {
      id: 'z1s3.fg.voodoo_doll',
      hotspotId: 'z1s3_clown_voodoo',
      imageKey: 'z1s3.fg.voodoo_doll',
      x: 1652,
      y: 718,
      w: 61,
      h: 85,
      sortY: 921,
      parallaxFactor: 1.14,
    },
    {
      id: 'z1s3.fg.clown_bust',
      hotspotId: 'z1s3_clown_voodoo',
      imageKey: 'z1s3.fg.clown_bust',
      x: 1728,
      y: 682,
      w: 103,
      h: 128,
      sortY: 922,
      parallaxFactor: 1.14,
    },
    {
      id: 'z1s3.fg.hull_rib_left',
      imageKey: 'z1s3.fg.hull_rib_left',
      x: -60,
      y: -40,
      w: 310,
      h: 980,
      sortY: 940,
      parallaxFactor: 1.20,
      inSituSeamless: true,
    },
    {
      id: 'z1s3.fg.hull_rib_right',
      imageKey: 'z1s3.fg.hull_rib_right',
      x: 2150,
      y: -40,
      w: 310,
      h: 980,
      sortY: 940,
      parallaxFactor: 1.20,
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
      name: 'Egyptian Sarcophagus',
      x: 68,
      y: 365,
      w: 224,
      h: 415,
      walkX: 310,
      walkY: 790,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_coat_rack',
      name: "Captain's Peg Rack, Coat & Tricorn Hat",
      x: 235,
      y: 248,
      w: 185,
      h: 305,
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
      id: 'z1s3_mss_poster',
      name: 'MoonStorm Studios Poster',
      x: 990,
      y: 150,
      w: 116,
      h: 146,
      walkX: 1045,
      walkY: 775,
      cursor: 'pointer',
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3_crt_tv',
      name: 'Submarine Television',
      x: 780,
      y: 438,
      w: 129,
      h: 115,
      walkX: 850,
      walkY: 785,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_fishbowl',
      name: 'Goldfish Bowl',
      x: 925,
      y: 468,
      w: 96,
      h: 88,
      walkX: 975,
      walkY: 785,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_desk_drawer',
      name: "Captain Dread's Mahogany Desk",
      x: 760,
      y: 545,
      w: 350,
      h: 180,
      walkX: 935,
      walkY: 795,
      cursor: 'grab',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_glue',
      name: 'Industrial Super-Glue',
      x: 1008,
      y: 490,
      w: 54,
      h: 78,
      walkX: 1030,
      walkY: 790,
      cursor: 'grab',
      parallaxFactor: 1.0,
      visibleWhen: (f) => !f.gotGlue,
    },
    {
      id: 'z1s3_steam_pipe',
      name: 'Riveted Steam Pipe & Brass Valve',
      x: 1155,
      y: 130,
      w: 60,
      h: 135,
      walkX: 1180,
      walkY: 775,
      cursor: 'pointer',
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3_portrait_stand',
      name: 'Tripod Portrait Easel Stand',
      x: 1145,
      y: 495,
      w: 121,
      h: 237,
      walkX: 1140,
      walkY: 790,
      cursor: 'grab',
      parallaxFactor: 1.0,
      visibleWhen: (f) => !f.gotPortraitStand,
    },
    {
      id: 'z1s3_dirty_clothes',
      name: 'Pile of Dirty Pirate Laundry',
      x: 1290,
      y: 685,
      w: 148,
      h: 99,
      walkX: 1320,
      walkY: 795,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_mask_a',
      name: 'Carved Tiki Theatre Mask',
      x: 1250,
      y: 175,
      w: 66,
      h: 105,
      walkX: 1285,
      walkY: 775,
      cursor: 'pointer',
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3_helm_wheel',
      name: "Spare Wooden Ship's Helm Wheel",
      x: 1355,
      y: 145,
      w: 186,
      h: 186,
      walkX: 1440,
      walkY: 775,
      cursor: 'pointer',
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3_mask_b',
      name: 'Ceremonial Tribal Mask',
      x: 1570,
      y: 175,
      w: 96,
      h: 105,
      walkX: 1610,
      walkY: 775,
      cursor: 'pointer',
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s3_shelf',
      name: 'Soup, Beans & Matryoshka Shelf',
      x: 1345,
      y: 330,
      w: 214,
      h: 125,
      walkX: 1440,
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
      walkX: 1340,
      walkY: 800,
      cursor: 'talk',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_hammer_bag',
      name: 'Bag of Heavy Iron Hammers',
      x: 1660,
      y: 605,
      w: 105,
      h: 100,
      walkX: 1640,
      walkY: 795,
      cursor: 'grab',
      parallaxFactor: 1.0,
      visibleWhen: (f) => !f.gotHammerBag,
    },
    {
      id: 'z1s3_nightstand_lamp',
      name: "Captain's Red Nightstand",
      x: 1780,
      y: 555,
      w: 155,
      h: 164,
      walkX: 1780,
      walkY: 795,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_lamp',
      name: 'Crooked Brass Reading Lamp',
      x: 1818,
      y: 465,
      w: 78,
      h: 95,
      walkX: 1780,
      walkY: 795,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_bunk_bed',
      name: "Captain Dread's Bunk Bed",
      x: 1925,
      y: 505,
      w: 395,
      h: 228,
      walkX: 1910,
      walkY: 800,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_ship_bottle',
      name: 'Ship-in-a-Bottle & Chart Table',
      x: 245,
      y: 765,
      w: 325,
      h: 180,
      walkX: 410,
      walkY: 825,
      cursor: 'pointer',
      parallaxFactor: 1.14,
    },
    {
      id: 'z1s3_clown_voodoo',
      name: 'Creepy Clown Bust, Voodoo Doll & Sea Chest',
      x: 1615,
      y: 682,
      w: 255,
      h: 242,
      walkX: 1680,
      walkY: 825,
      cursor: 'pointer',
      parallaxFactor: 1.14,
    },
  ],
  Z1S2: [],
  Z1S1: [],
  LOLDEMO: [],
};


export interface CharacterSpawnDef {
  id: 'smoothface' | 'cap_dread';
  name: string;
  x: number;
  y: number;
  facing: 1 | -1;
}

export const Z1S3_CHARACTER_SPAWNS: Record<'smoothface' | 'cap_dread', CharacterSpawnDef> = {
  smoothface: { id: 'smoothface', name: 'Mr. Smoothface (Player Spawn)', x: 700, y: 800, facing: 1 },
  cap_dread: { id: 'cap_dread', name: 'Captain Dread (NPC Spawn)', x: 1540, y: 805, facing: -1 },
};

export interface OfficialZ1S3LayoutData {
  room: string;
  width: number;
  height: number;
  walkbox: { x: number; y: number; w: number; h: number };
  characters: Record<'smoothface' | 'cap_dread', CharacterSpawnDef>;
  objects: Array<Omit<SceneObjectDef, 'visibleWhen'>>;
  hotspots: Array<Omit<HotspotDef, 'visibleWhen'>>;
}

export function applyZ1S3OfficialLayout(data: OfficialZ1S3LayoutData): void {
  if (!data) return;
  if (data.characters?.smoothface) {
    Z1S3_CHARACTER_SPAWNS.smoothface = { ...data.characters.smoothface };
  }
  if (data.characters?.cap_dread) {
    Z1S3_CHARACTER_SPAWNS.cap_dread = { ...data.characters.cap_dread };
  }
  if (Array.isArray(data.objects)) {
    ROOM_OBJECTS.Z1S3 = data.objects.map((o) => {
      const hideFlag = o.hideWhenFlag || (o.id.includes('glue') ? 'gotGlue' : o.id.includes('easel') ? 'gotPortraitStand' : o.id.includes('hammer_bag') ? 'gotHammerBag' : undefined);
      return {
        ...o,
        hideWhenFlag: hideFlag,
        visibleWhen: hideFlag ? (f: WorldFlags) => !f[hideFlag] : undefined,
      };
    });
  }
  if (Array.isArray(data.hotspots)) {
    ROOM_HOTSPOTS.Z1S3 = data.hotspots.map((h) => {
      const hideFlag = h.hideWhenFlag || (h.id === 'z1s3_glue' ? 'gotGlue' : h.id === 'z1s3_portrait_stand' ? 'gotPortraitStand' : h.id === 'z1s3_hammer_bag' ? 'gotHammerBag' : undefined);
      return {
        ...h,
        hideWhenFlag: hideFlag,
        visibleWhen: hideFlag ? (f: WorldFlags) => !f[hideFlag] : undefined,
      };
    });
  }
}

export function serializeZ1S3OfficialLayout(
  playerX = Z1S3_CHARACTER_SPAWNS.smoothface.x,
  playerY = Z1S3_CHARACTER_SPAWNS.smoothface.y,
  playerFacing: 1 | -1 = Z1S3_CHARACTER_SPAWNS.smoothface.facing,
  dreadX = Z1S3_CHARACTER_SPAWNS.cap_dread.x,
  dreadY = Z1S3_CHARACTER_SPAWNS.cap_dread.y,
  dreadFacing: 1 | -1 = Z1S3_CHARACTER_SPAWNS.cap_dread.facing
): OfficialZ1S3LayoutData {
  return {
    room: 'Z1S3',
    width: 2400,
    height: 900,
    walkbox: { x: 150, y: 730, w: 2100, h: 125 },
    characters: {
      smoothface: { id: 'smoothface', name: 'Mr. Smoothface (Player Spawn)', x: Math.round(playerX), y: Math.round(playerY), facing: playerFacing },
      cap_dread: { id: 'cap_dread', name: 'Captain Dread (NPC Spawn)', x: Math.round(dreadX), y: Math.round(dreadY), facing: dreadFacing },
    },
    objects: ROOM_OBJECTS.Z1S3.map(({ visibleWhen: _vw, ...rest }) => ({
      ...rest,
      x: Math.round(rest.x),
      y: Math.round(rest.y),
      w: Math.round(rest.w),
      h: Math.round(rest.h),
      sortY: Math.round(rest.sortY),
    })),
    hotspots: ROOM_HOTSPOTS.Z1S3.map(({ visibleWhen: _vw, ...rest }) => ({
      ...rest,
      x: Math.round(rest.x),
      y: Math.round(rest.y),
      w: Math.round(rest.w),
      h: Math.round(rest.h),
      walkX: Math.round(rest.walkX),
      walkY: Math.round(rest.walkY),
    })),
  };
}

// Initialize from official JSON file (and optional localStorage override if running standalone)
applyZ1S3OfficialLayout(officialZ1S3Json as unknown as OfficialZ1S3LayoutData);
try {
  const savedLocal = typeof localStorage !== 'undefined' ? localStorage.getItem('moonstorm_z1s3_official_layout_v1') : null;
  if (savedLocal) {
    applyZ1S3OfficialLayout(JSON.parse(savedLocal));
  }
} catch {
  // Ignore localStorage parse errors
}
