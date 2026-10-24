/**
 * MoonStorm Studios - Smoothface's Epic (Codename: Sparkle)
 * Slice 1 Canonical Z1S3 Multi-Plane Cut-Out Scene Objects, Item, Puzzle & Dialogue Definitions (src/scenarios/WorldData.ts)
 */

import { VoiceProfileId } from '../engine/AudioVoiceEngine';
import officialZ1S3Json from './z1s3_official_layout.json';

export type RoomId = 'ORIGIN' | 'Z1S3' | 'Z1S2' | 'Z1S1' | 'LOLDEMO';

export const ROOM_WIDTHS: Record<RoomId, number> = {
  ORIGIN: 1600,
  Z1S3: 2400,
  Z1S2: 2400,
  Z1S1: 2400,
  LOLDEMO: 2400,
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
    icon: 'art/approved/z1s1/z1s1.item.davinci_blueprint.png',
    inspectText:
      "Leonardo da Vinci's schematic for a Perpetual Movement Machine! Combine the Ship's Wooden Helm, Bag of Hammers, Tripod Portrait Stand, and Industrial Super-Glue!",
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
    icon: 'art/approved/z1s2/z1s2.item.wooden_helm.png',
    inspectText:
      "The Substampede's spare mahogany steering wheel from A Baby's Candy Vault. Eight solid spokes ready for counterweight hammers!",
  },
  perpetual_machine: {
    id: 'perpetual_machine',
    name: 'Perpetual Movement Machine',
    icon: 'art/approved/z1s1/z1s1.prop.perpetual_machine_installed.png',
    inspectText:
      "Behold! A genuine Leonardo da Vinci Perpetual Movement Machine assembled from the Ship's Wooden Helm, Tripod Portrait Stand, Bag of Hammers, and Industrial Super-Glue!",
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
  openModal?: 'keypad' | 'archive';
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
  Z1S2: [
    // PLANE 1: WALL HULL PANELS & CONTINUOUS CEILING ARCHES (parallaxFactor: 0.85)
    { id: 'z1s2.wall.panel_a_left', imageKey: 'z1s2.wall.panel_a', x: -60, y: -40, w: 620, h: 740, sortY: 90, parallaxFactor: 0.85, inSituSeamless: true },
    { id: 'z1s2.wall.panel_b_1', imageKey: 'z1s2.wall.panel_b', x: 480, y: -40, w: 1080, h: 740, sortY: 92, parallaxFactor: 0.85, inSituSeamless: true },
    { id: 'z1s2.wall.panel_b_2', imageKey: 'z1s2.wall.panel_b', x: 1480, y: -40, w: 1080, h: 740, sortY: 94, parallaxFactor: 0.85, flipX: true, inSituSeamless: true },
    { id: 'z1s2.ceiling.arch_1', imageKey: 'z1s2.ceiling.arch', x: -40, y: -125, w: 680, h: 215, sortY: 98, parallaxFactor: 0.85, inSituSeamless: true },
    { id: 'z1s2.ceiling.arch_2', imageKey: 'z1s2.ceiling.arch', x: 580, y: -125, w: 680, h: 215, sortY: 98, parallaxFactor: 0.85, flipX: true, inSituSeamless: true },
    { id: 'z1s2.ceiling.arch_3', imageKey: 'z1s2.ceiling.arch', x: 1200, y: -125, w: 680, h: 215, sortY: 99, parallaxFactor: 0.85, inSituSeamless: true },
    { id: 'z1s2.ceiling.arch_4', imageKey: 'z1s2.ceiling.arch', x: 1820, y: -125, w: 680, h: 215, sortY: 99, parallaxFactor: 0.85, flipX: true, inSituSeamless: true },

    // PLANE 2: WOODEN FLOOR PLANKS (parallaxFactor: 1.0, sortY: 550, covers down to y=945)
    { id: 'z1s2.floor.planks_1', imageKey: 'z1s2.floor.planks', x: -80, y: 525, w: 940, h: 420, sortY: 550, parallaxFactor: 1.0, inSituSeamless: true },
    { id: 'z1s2.floor.planks_2', imageKey: 'z1s2.floor.planks', x: 780, y: 525, w: 940, h: 420, sortY: 550, parallaxFactor: 1.0, flipX: true, inSituSeamless: true },
    { id: 'z1s2.floor.planks_3', imageKey: 'z1s2.floor.planks', x: 1620, y: 525, w: 940, h: 420, sortY: 550, parallaxFactor: 1.0, inSituSeamless: true },

    // PLANE 3: WALL PROPS & CANDY VAULT (parallaxFactor: 0.85 to lock with wall panels)
    { id: 'z1s2.wall.cage_lamp_1', imageKey: 'z1s2.wall.cage_lamp', x: 520, y: 115, w: 76, h: 108, sortY: 560, parallaxFactor: 0.85 },
    { id: 'z1s2.wall.cage_lamp_2', imageKey: 'z1s2.wall.cage_lamp', x: 1460, y: 115, w: 76, h: 108, sortY: 560, parallaxFactor: 0.85 },
    { id: 'z1s2.wall.samurai_poster', hotspotId: 'z1s2_samurai_wall', imageKey: 'z1s2.wall.samurai_poster', x: 640, y: 185, w: 173, h: 220, sortY: 562, parallaxFactor: 0.85 },
    { id: 'z1s2.wall.katana_rack', hotspotId: 'z1s2_samurai_wall', imageKey: 'z1s2.wall.katana_rack', x: 1120, y: 210, w: 270, h: 188, sortY: 563, parallaxFactor: 0.85 },
    { id: 'z1s2.prop.candy_vault', hotspotId: 'z1s2_funky_vault', imageKey: 'z1s2.prop.candy_vault', x: 1550, y: 235, w: 274, h: 360, sortY: 565, parallaxFactor: 0.85 },
    { id: 'z1s2.prop.funky_keypad', hotspotId: 'z1s2_funky_vault', imageKey: 'z1s2.prop.funky_keypad', x: 1835, y: 335, w: 148, h: 110, sortY: 566, parallaxFactor: 0.85 },
    { id: 'z1s2.wall.door_cabin', hotspotId: 'z1s2_door_cabin', imageKey: 'z1s3.wall.door', x: 2005, y: 195, w: 295, h: 410, sortY: 564, parallaxFactor: 0.85 },

    // PLANE 4: FLOOR PROPS (parallaxFactor: 1.0, Y-sorted with characters)
    { id: 'z1s2.prop.iron_ladder', hotspotId: 'z1s2_ladder_engine', imageKey: 'z1s2.prop.iron_ladder', x: 220, y: 140, w: 250, h: 610, sortY: 735, parallaxFactor: 1.0 },
    { id: 'z1s2.prop.tufted_sofa', hotspotId: 'z1s2_lounge_sofa', imageKey: 'z1s2.prop.tufted_sofa', x: 760, y: 455, w: 460, h: 295, sortY: 730, parallaxFactor: 1.0 },
    { id: 'z1s2.prop.reed_vases', imageKey: 'z1s2.prop.reed_vases', x: 1340, y: 500, w: 145, h: 235, sortY: 732, parallaxFactor: 1.0 },
    { id: 'z1s2.item.wooden_helm', hotspotId: 'z1s2_funky_vault', imageKey: 'z1s2.item.wooden_helm', x: 1840, y: 585, w: 135, h: 135, sortY: 738, parallaxFactor: 1.0, visibleWhen: (f) => f.vaultUnlocked && !f.gotHelm },

    // PLANE 5: FOREGROUND PARALLAX & HULL RIBS (parallaxFactor: 1.14 - 1.20)
    { id: 'z1s2.fg.dollhouse_bindle', imageKey: 'z1s2.fg.dollhouse_bindle', x: 260, y: 725, w: 330, h: 205, sortY: 920, parallaxFactor: 1.14 },
    { id: 'z1s2.fg.mystery_crate', hotspotId: 'z1s2_mystery_box', imageKey: 'z1s2.fg.mystery_crate', x: 960, y: 735, w: 225, h: 200, sortY: 922, parallaxFactor: 1.14 },
    { id: 'z1s2.fg.rotary_phone', imageKey: 'z1s2.fg.rotary_phone', x: 1760, y: 735, w: 215, h: 190, sortY: 924, parallaxFactor: 1.14 },
    { id: 'z1s2.fg.hull_rib_left', imageKey: 'z1s3.fg.hull_rib_left', x: -60, y: -40, w: 280, h: 980, sortY: 940, parallaxFactor: 1.20, inSituSeamless: true },
    { id: 'z1s2.fg.hull_rib_right', imageKey: 'z1s3.fg.hull_rib_right', x: 2260, y: -40, w: 280, h: 980, sortY: 940, parallaxFactor: 1.20, inSituSeamless: true },
  ],
  Z1S1: [
    // PLANE 1: WALL HULL PANELS & CONTINUOUS RIVET ARCHES (parallaxFactor: 0.85)
    { id: 'z1s1.wall.hull_panel_1', imageKey: 'z1s1.wall.hull_panel', x: -60, y: -35, w: 1020, h: 720, sortY: 90, parallaxFactor: 0.85, inSituSeamless: true },
    { id: 'z1s1.wall.hull_panel_2', imageKey: 'z1s1.wall.hull_panel', x: 920, y: -35, w: 1020, h: 720, sortY: 92, parallaxFactor: 0.85, flipX: true, inSituSeamless: true },
    { id: 'z1s1.wall.hull_panel_3', imageKey: 'z1s1.wall.hull_panel', x: 1860, y: -35, w: 720, h: 720, sortY: 94, parallaxFactor: 0.85, inSituSeamless: true },
    { id: 'z1s1.ceiling.rivet_arch_1', imageKey: 'z1s1.ceiling.rivet_arch', x: -40, y: -55, w: 680, h: 225, sortY: 98, parallaxFactor: 0.85, inSituSeamless: true },
    { id: 'z1s1.ceiling.rivet_arch_2', imageKey: 'z1s1.ceiling.rivet_arch', x: 580, y: -55, w: 680, h: 225, sortY: 98, parallaxFactor: 0.85, flipX: true, inSituSeamless: true },
    { id: 'z1s1.ceiling.rivet_arch_3', imageKey: 'z1s1.ceiling.rivet_arch', x: 1200, y: -55, w: 680, h: 225, sortY: 99, parallaxFactor: 0.85, inSituSeamless: true },
    { id: 'z1s1.ceiling.rivet_arch_4', imageKey: 'z1s1.ceiling.rivet_arch', x: 1820, y: -55, w: 680, h: 225, sortY: 99, parallaxFactor: 0.85, flipX: true, inSituSeamless: true },

    // PLANE 2: BOLTED STEEL DECK FLOOR (parallaxFactor: 1.0, sortY: 550, covers down to y=945)
    { id: 'z1s1.floor.steel_deck_1', imageKey: 'z1s1.floor.steel_deck', x: -80, y: 520, w: 1020, h: 425, sortY: 550, parallaxFactor: 1.0, inSituSeamless: true },
    { id: 'z1s1.floor.steel_deck_2', imageKey: 'z1s1.floor.steel_deck', x: 880, y: 520, w: 1020, h: 425, sortY: 550, parallaxFactor: 1.0, flipX: true, inSituSeamless: true },
    { id: 'z1s1.floor.steel_deck_3', imageKey: 'z1s1.floor.steel_deck', x: 1820, y: 520, w: 740, h: 425, sortY: 550, parallaxFactor: 1.0, inSituSeamless: true },

    // PLANE 3: WALL PROPS & CAGED SUBMARINE LAMPS (parallaxFactor: 0.85, matching ref_z1s1_machineroom_2010.png)
    { id: 'z1s1.wall.caged_lamp_1', imageKey: 'z1s1.wall.caged_lamp', x: 520, y: 185, w: 96, h: 128, sortY: 558, parallaxFactor: 0.85 },
    { id: 'z1s1.wall.book_shelf', hotspotId: 'z1s1_book_shelf', imageKey: 'z1s1.wall.book_shelf', x: 740, y: 175, w: 330, h: 230, sortY: 560, parallaxFactor: 0.85 },
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
    { id: 'z1s1.fg.potato_sacks_2', hotspotId: 'z1s1_rat_tv', imageKey: 'z1s1.fg.potato_sacks', x: 1545, y: 580, w: 330, h: 250, sortY: 925, parallaxFactor: 1.14, flipX: true },
    { id: 'z1s1.fg.hull_ring_left', imageKey: 'z1s1.fg.hull_ring_left', x: 180, y: -40, w: 340, h: 980, sortY: 940, parallaxFactor: 1.12, inSituSeamless: true },
    { id: 'z1s1.fg.hull_ring_right', imageKey: 'z1s1.fg.hull_ring_right', x: 1920, y: -40, w: 340, h: 980, sortY: 940, parallaxFactor: 1.12, inSituSeamless: true },
  ],
  LOLDEMO: [
    // PLANE 1: PAPER SKY & ROLLING HILLS (parallaxFactor: 0.82)
    { id: 'z0.bg.sky_hills_1', imageKey: 'z0.bg.sky_hills', x: -80, y: -40, w: 1420, h: 860, sortY: 80, parallaxFactor: 0.82, inSituSeamless: true },
    { id: 'z0.bg.sky_hills_2', imageKey: 'z0.bg.sky_hills', x: 1320, y: -40, w: 1420, h: 860, sortY: 82, parallaxFactor: 0.82, flipX: true, inSituSeamless: true },

    // PLANE 2: HANGING CELESTIAL CUTOUTS (parallaxFactor: 0.82)
    { id: 'z0.prop.two_faced_sun', hotspotId: 'lol_two_faced_sun', imageKey: 'z0.prop.two_faced_sun', x: 540, y: 15, w: 208, h: 266, sortY: 110, parallaxFactor: 0.82, idleAnim: 'swing' },
    { id: 'z0.prop.paper_clouds_1', imageKey: 'z0.prop.paper_clouds', x: 880, y: 25, w: 329, h: 256, sortY: 112, parallaxFactor: 0.82, idleAnim: 'bob' },
    { id: 'z0.prop.paper_clouds_2', imageKey: 'z0.prop.paper_clouds', x: 1680, y: 35, w: 329, h: 256, sortY: 114, parallaxFactor: 0.82, idleAnim: 'bob' },

    // PLANE 3: SPOOKY PAPER CASTLE, TREES, DOOR & TROLL (parallaxFactor: 1.0)
    { id: 'z0.prop.dead_tree_left', hotspotId: 'lol_dead_tree_left', imageKey: 'z0.prop.dead_tree', x: 160, y: 245, w: 317, h: 534, sortY: 720, parallaxFactor: 1.0 },
    { id: 'z0.prop.spooky_castle', imageKey: 'z0.prop.spooky_castle', x: 1120, y: 165, w: 642, h: 608, sortY: 725, parallaxFactor: 1.0 },
    { id: 'z0.prop.castle_door', hotspotId: 'lol_castle_door', imageKey: 'z0.prop.castle_door', x: 1345, y: 525, w: 195, h: 240, sortY: 730, parallaxFactor: 1.0 },
    { id: 'z0.prop.troll', hotspotId: 'lol_castle_door', imageKey: 'z0.prop.troll', x: 820, y: 420, w: 276, h: 372, sortY: 745, parallaxFactor: 1.0 },
    { id: 'z0.prop.dead_tree_right', imageKey: 'z0.prop.dead_tree', x: 1920, y: 255, w: 317, h: 534, sortY: 722, parallaxFactor: 1.0, flipX: true },

    // PLANE 4: FOREGROUND HILL SILHOUETTE BORDER (parallaxFactor: 1.15, covers down to y=940)
    { id: 'z0.fg.hill_border_1', imageKey: 'z0.fg.hill_border', x: -80, y: 675, w: 1020, h: 265, sortY: 930, parallaxFactor: 1.15, inSituSeamless: true },
    { id: 'z0.fg.hill_border_2', imageKey: 'z0.fg.hill_border', x: 860, y: 675, w: 1020, h: 265, sortY: 932, parallaxFactor: 1.15, flipX: true, inSituSeamless: true },
    { id: 'z0.fg.hill_border_3', imageKey: 'z0.fg.hill_border', x: 1780, y: 675, w: 920, h: 265, sortY: 934, parallaxFactor: 1.15, inSituSeamless: true },
  ],
  ORIGIN: [],
};

export const ROOM_HOTSPOTS: Record<RoomId, HotspotDef[]> = {
  ORIGIN: [
    {
      id: 'origin_barber_chair',
      name: "Morgan's Childhood Barber Chair (Years 1-11: Mutton Chops the Butler)",
      x: 495,
      y: 365,
      w: 360,
      h: 395,
      walkX: 690,
      walkY: 795,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'origin_ancestor_portraits',
      name: 'Wall of Moustachioed Stache Ancestors (Year 0 & Year 12: World Barber Academy)',
      x: 520,
      y: 65,
      w: 980,
      h: 320,
      walkX: 1080,
      walkY: 790,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'origin_to_streets',
      name: 'Next Chapter of Rupert\'s Life (Walk Right) \u00bb',
      x: 1390,
      y: 410,
      w: 195,
      h: 390,
      walkX: 1440,
      walkY: 795,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
  ],
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
  Z1S2: [
    {
      id: 'z1s2_ladder_engine',
      name: 'Iron Ladder Down to Machine Room (Z1S1)',
      x: 170,
      y: 160,
      w: 240,
      h: 580,
      walkX: 310,
      walkY: 785,
      cursor: 'exit',
      isExitTo: 'Z1S1',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s2_samurai_wall',
      name: 'Samurai Poster & Katana Sword Rack',
      x: 640,
      y: 185,
      w: 750,
      h: 220,
      walkX: 950,
      walkY: 780,
      cursor: 'pointer',
      parallaxFactor: 0.85,
    },
    {
      id: 'z1s2_lounge_sofa',
      name: 'Tufted VIP Lounge Sofa',
      x: 760,
      y: 455,
      w: 310,
      h: 295,
      walkX: 910,
      walkY: 795,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s2_ventriloquist',
      name: 'The Ventriloquist & Rapoleon Dummy',
      x: 1075,
      y: 460,
      w: 205,
      h: 350,
      walkX: 1010,
      walkY: 795,
      cursor: 'talk',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s2_a_baby',
      name: 'A Baby (Gorilla Mobster Toddler)',
      x: 1365,
      y: 510,
      w: 215,
      h: 300,
      walkX: 1295,
      walkY: 795,
      cursor: 'talk',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s2_funky_vault',
      name: "A Baby's Musical Candy Vault & Keypad",
      x: 1585,
      y: 235,
      w: 400,
      h: 485,
      walkX: 1720,
      walkY: 790,
      cursor: 'grab',
      parallaxFactor: 0.85,
    },
    {
      id: 'z1s2_door_cabin',
      name: "Bulkhead Door to Captain Dread's Cabin (Z1S3)",
      x: 2060,
      y: 195,
      w: 300,
      h: 410,
      walkX: 2040,
      walkY: 785,
      cursor: 'exit',
      isExitTo: 'Z1S3',
      parallaxFactor: 0.88,
    },
    {
      id: 'z1s2_mystery_box',
      name: 'Glowing-Eyed Mystery Crate',
      x: 1090,
      y: 725,
      w: 235,
      h: 210,
      walkX: 1180,
      walkY: 820,
      cursor: 'pointer',
      parallaxFactor: 1.14,
    },
  ],
  Z1S1: [
    {
      id: 'z1s1_nihongo',
      name: 'Nihongo Nohondes (Chief Pedal Engineer)',
      x: 640,
      y: 490,
      w: 180,
      h: 320,
      walkX: 820,
      walkY: 795,
      cursor: 'talk',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s1_blueprint_pickup',
      name: "Leonardo da Vinci's Perpetual Machine Blueprint",
      x: 860,
      y: 650,
      w: 155,
      h: 145,
      walkX: 740,
      walkY: 795,
      cursor: 'grab',
      parallaxFactor: 1.0,
      visibleWhen: (f) => !f.nihongoGaveBlueprint,
    },
    {
      id: 'z1s1_pedal_engine',
      name: 'Submarine Pedal Drive Crank Station',
      x: 1460,
      y: 350,
      w: 390,
      h: 425,
      walkX: 1420,
      walkY: 795,
      cursor: 'grab',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s1_ladder_lounge',
      name: 'Iron Ladder Up to VIP Lounge (Z1S2)',
      x: 1125,
      y: 95,
      w: 220,
      h: 535,
      walkX: 1220,
      walkY: 785,
      cursor: 'exit',
      isExitTo: 'Z1S2',
      parallaxFactor: 0.92,
    },
    {
      id: 'z1s1_rad_barrels',
      name: 'Leaking Bilge Sludge Barrels',
      x: 250,
      y: 695,
      w: 315,
      h: 255,
      walkX: 440,
      walkY: 820,
      cursor: 'pointer',
      parallaxFactor: 1.14,
    },
    {
      id: 'z1s1_rat_tv',
      name: 'Bilge Rat, Broken Toaster & Potato Sacks',
      x: 820,
      y: 715,
      w: 1035,
      h: 220,
      walkX: 1280,
      walkY: 820,
      cursor: 'pointer',
      parallaxFactor: 1.14,
    },
    {
      id: 'z1s1_book_shelf',
      name: "Evil Deeds College & MoonStorm Pitch Bookshelf",
      x: 740,
      y: 175,
      w: 330,
      h: 230,
      walkX: 900,
      walkY: 785,
      cursor: 'pointer',
      parallaxFactor: 0.85,
    },
  ],
  LOLDEMO: [
    {
      id: 'lol_return_sub',
      name: "Return to Submarine Substampede (Captain's Cabin Z1S3)",
      x: 40,
      y: 520,
      w: 150,
      h: 290,
      walkX: 180,
      walkY: 790,
      cursor: 'exit',
      isExitTo: 'Z1S3',
      parallaxFactor: 1.0,
    },
    {
      id: 'lol_dead_tree_left',
      name: 'Crooked Paper Tree (2010 Torque 2D Foot-Collision Test)',
      x: 190,
      y: 255,
      w: 280,
      h: 510,
      walkX: 340,
      walkY: 790,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'lol_two_faced_sun',
      name: 'Two-Faced Paper Cut-Out Sun & Moon',
      x: 540,
      y: 15,
      w: 208,
      h: 266,
      walkX: 640,
      walkY: 785,
      cursor: 'pointer',
      parallaxFactor: 0.88,
    },
    {
      id: 'lol_castle_door',
      name: 'Spooky Paper Castle Door & Bridge Troll',
      x: 820,
      y: 380,
      w: 730,
      h: 410,
      walkX: 1080,
      walkY: 795,
      cursor: 'grab',
      parallaxFactor: 1.0,
    },
  ],
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
