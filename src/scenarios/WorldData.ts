/**
 * MoonStorm Studios - Smoothface's Epic (Codename: Sparkle)
 * Canonical World, Modular Cut-Out Scene Objects, Item, Puzzle & Dialogue Definitions (src/scenarios/WorldData.ts)
 *
 * Preserves 100% of the 2010 MoonStorm Studios lore, jokes, and puzzle chains across a spacious 1600x900 stage:
 * - Captain Dread's Cabin <-> Submarine VIP Lounge & Candy Vault <-> Submarine Engine Room
 * - Bonus Tribute: Haunted Castle Courtyard ("GOSU!")
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
    icon: 'assets/props/item_blueprint.png',
    inspectText:
      "Leonardo da Vinci's original schematic for a Perpetual Movement Machine! It requires four parts: (1) A Wooden Ship's Helm, (2) A Tripod Portrait Stand, (3) A Bag of Heavy Hammers, and (4) Industrial Super-Glue.",
  },
  hammer_bag: {
    id: 'hammer_bag',
    name: 'Bag of Hammers',
    icon: 'assets/props/hammer_bag.png',
    inspectText:
      'A canvas sack stuffed with absurdly heavy iron sledgehammers. Ideal for rotational momentum or cartoon concussions.',
  },
  portrait_stand: {
    id: 'portrait_stand',
    name: 'Portrait Easel Stand',
    icon: 'assets/props/item_portrait_stand.png',
    inspectText:
      'A sturdy wooden tripod easel holding an overly flattering portrait of Captain Dread. The tripod frame could support a heavy spinning wheel.',
  },
  glue: {
    id: 'glue',
    name: 'Industrial Super-Glue',
    icon: 'assets/props/item_glue.png',
    inspectText:
      'Military-grade naval adhesive. Warning label: "Will bond iron, wood, and fingers permanently in 0.4 seconds."',
  },
  helm: {
    id: 'helm',
    name: "Ship's Wooden Helm",
    icon: 'assets/props/item_helm.png',
    inspectText:
      "The Substampede's spare mahogany steering wheel, recovered from A Baby's Candy Vault. Eight solid spokes ready for counterweight hammers!",
  },
  perpetual_machine: {
    id: 'perpetual_machine',
    name: 'Perpetual Movement Machine',
    icon: 'assets/props/perpetual_machine_cutout.png',
    inspectText:
      'Behold! A genuine Leonardo da Vinci Perpetual Movement Machine built from a Ship Helm, a Portrait Stand, a Bag of Hammers, and Super-Glue! Ready to install on the broken Engine Room pedals!',
  },
};

export interface IntroAct {
  badge: string;
  speaker: string;
  voice: VoiceProfileId;
  image: string;
  text: string;
}

export const INTRO_ACTS: IntroAct[] = [
  {
    badge: 'ACT I OF IV: THE TALE OF TWO BARBER TWINS',
    speaker: 'NARRATOR & RUPERT STACHE',
    voice: 'smoothface',
    image: 'assets/intro/panel_1_twins.png',
    text: 'In Victorian London, Dr. Morgan Stache became a global celebrity for his miraculous, shimmering golden moustache. Meanwhile, his twin brother Rupert was born with a tragic genetic condition: complete facial hairlessness. They called him... Mr. Smoothface.',
  },
  {
    badge: 'ACT II OF IV: THE MALEFIC INVITATION',
    speaker: 'MR. SMOOTHFACE',
    voice: 'smoothface',
    image: 'assets/intro/panel_2_invitation.png',
    text: '"If the world worships moustaches, then I shall shave the world!" Rupert applied to the most feared syndicate on Earth: the MGWDBTTGPnP (Malefic Gentlemen Who Do Bad Things To Good People & Pigeons). Their admission exam awaits on Blackspit Island.',
  },
  {
    badge: 'ACT III OF IV: ABOARD THE SUBSTAMPEDE',
    speaker: 'CAPTAIN DREAD',
    voice: 'cap_dread',
    image: 'assets/intro/panel_3_boarding.png',
    text: 'To reach Blackspit Island undetected, Rupert booked passage aboard the "Substampede", a rusty, cut-rate pirate submarine captained by the flamboyant Captain Dread. What Dread failed to mention is how the submarine is actually powered...',
  },
  {
    badge: 'ACT IV OF IV: CRISIS IN THE ENGINE ROOM!',
    speaker: 'NIHONGO NOHONDES',
    voice: 'nihongo',
    image: 'assets/intro/panel_4_pedal_snap.png',
    text: 'Deep in the belly of the Substampede, the entire vessel runs on rusty stationary bicycles pedaled by one sleep-deprived crewman: Nihongo Nohondes! And right in the middle of the ocean, the main pedal drive is about to snap: BAM!',
  },
];

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
 * Every single architectural panel, beam, wall prop, mid-ground furniture piece, stacked item,
 * and foreground cutout in Z1S3 is its own independent atomic RGBA asset ("CADA COSA POR APARTE")
 * arranged across a wide 2880x900 multi-plane scrolling stage!
 */
export const ROOM_OBJECTS: Record<RoomId, SceneObjectDef[]> = {
  // =========================================================
  // Z1S3: CAPTAIN DREAD'S QUARTERS (2400x900 WIDE SCROLLING STAGE + 100% ISOLATED OBJECT CUTOUTS)
  // =========================================================
  Z1S3: [
    // Ceiling Swinging Cage Lamps & Leaky Steam Pipes (Multi-Plane Parallax)
    {
      id: 'obj_z1s3_lamp_1',
      imageKey: 'obj_cage_lamp',
      x: 420,
      y: 18,
      w: 110,
      h: 155,
      sortY: 210,
      parallaxFactor: 0.95,
      idleAnim: 'swing',
      fxType: 'cage_lamp',
    },
    {
      id: 'obj_z1s3_lamp_2',
      imageKey: 'obj_cage_lamp',
      x: 1180,
      y: 16,
      w: 110,
      h: 155,
      sortY: 210,
      parallaxFactor: 0.95,
      idleAnim: 'swing',
      fxType: 'cage_lamp',
    },
    {
      id: 'obj_z1s3_lamp_3',
      imageKey: 'obj_cage_lamp',
      x: 1890,
      y: 18,
      w: 110,
      h: 155,
      sortY: 210,
      parallaxFactor: 0.95,
      idleAnim: 'swing',
      fxType: 'cage_lamp',
    },
    {
      id: 'obj_z1s3_steam_pipe_left',
      imageKey: 'obj_steam_pipe',
      x: 48,
      y: 145,
      w: 115,
      h: 390,
      sortY: 515,
      parallaxFactor: 0.95,
      fxType: 'steam_valve',
    },
    {
      id: 'obj_z1s3_steam_pipe_right',
      imageKey: 'obj_steam_pipe',
      x: 2210,
      y: 145,
      w: 115,
      h: 390,
      sortY: 515,
      parallaxFactor: 0.95,
      flipX: true,
      fxType: 'steam_valve',
    },

    // Left Bay: Isolated Golden Egyptian Sarcophagus, Peg Rack, Pirate Coat, Tricorn Hat & Bulkhead Door
    {
      id: 'obj_z1s3_sarcophagus',
      hotspotId: 'z1s3_sarcophagus',
      imageKey: 'obj_sarcophagus',
      x: 145,
      y: 235,
      w: 185,
      h: 355,
      sortY: 575,
      parallaxFactor: 1.0,
      tiltDeg: -1.5,
      fxType: 'sarcophagus_eyes',
    },
    {
      id: 'obj_z1s3_hanger_rack',
      hotspotId: 'z1s3_coat_rack',
      imageKey: 'obj_hanger_rack',
      x: 350,
      y: 225,
      w: 165,
      h: 72,
      sortY: 530,
      parallaxFactor: 1.0,
      tiltDeg: 1.2,
    },
    {
      id: 'obj_z1s3_hanging_coat',
      hotspotId: 'z1s3_coat_rack',
      imageKey: 'obj_hanging_coat',
      x: 356,
      y: 262,
      w: 118,
      h: 215,
      sortY: 535,
      parallaxFactor: 1.0,
      idleAnim: 'swing',
    },
    {
      id: 'obj_z1s3_hanging_hat',
      hotspotId: 'z1s3_coat_rack',
      imageKey: 'obj_hanging_hat',
      x: 432,
      y: 205,
      w: 96,
      h: 76,
      sortY: 536,
      parallaxFactor: 1.0,
      tiltDeg: 8,
    },
    {
      id: 'obj_z1s3_door',
      hotspotId: 'z1s3_door_lounge',
      imageKey: 'obj_bulkhead_door',
      x: 540,
      y: 205,
      w: 220,
      h: 375,
      sortY: 565,
      parallaxFactor: 1.0,
    },

    // Center Bay: Bag of Hammers, Captain's Mahogany Desk, Retro CRT TV, Grumpy Goldfish Bowl, MoonStorm Poster & Portrait Stand
    {
      id: 'obj_z1s3_hammer_bag',
      hotspotId: 'z1s3_hammer_bag',
      imageKey: 'hammer_bag',
      x: 785,
      y: 495,
      w: 110,
      h: 105,
      sortY: 592,
      parallaxFactor: 1.0,
      idleAnim: 'bob',
      visibleWhen: (f) => !f.gotHammerBag,
    },
    {
      id: 'obj_z1s3_mss_poster',
      hotspotId: 'z1s3_mss_poster',
      imageKey: 'obj_mss_poster',
      x: 965,
      y: 120,
      w: 155,
      h: 195,
      sortY: 510,
      parallaxFactor: 1.0,
      tiltDeg: -2.0,
    },
    {
      id: 'obj_z1s3_desk',
      hotspotId: 'z1s3_desk_drawer',
      imageKey: 'obj_desk',
      x: 895,
      y: 395,
      w: 315,
      h: 195,
      sortY: 575,
      parallaxFactor: 1.0,
    },
    {
      id: 'obj_z1s3_crt_tv',
      hotspotId: 'z1s3_crt_tv',
      imageKey: 'obj_crt_tv',
      x: 920,
      y: 270,
      w: 142,
      h: 140,
      sortY: 577,
      parallaxFactor: 1.0,
      fxType: 'crt_tv',
    },
    {
      id: 'obj_z1s3_fishbowl',
      hotspotId: 'z1s3_fishbowl',
      imageKey: 'obj_fishbowl',
      x: 1085,
      y: 318,
      w: 92,
      h: 92,
      sortY: 578,
      parallaxFactor: 1.0,
      fxType: 'fishbowl',
    },
    {
      id: 'obj_z1s3_portrait_stand',
      hotspotId: 'z1s3_portrait_stand',
      imageKey: 'item_portrait_stand',
      x: 1245,
      y: 335,
      w: 165,
      h: 250,
      sortY: 582,
      parallaxFactor: 1.0,
      visibleWhen: (f) => !f.gotPortraitStand,
    },
    {
      id: 'obj_z1s3_periscope',
      imageKey: 'obj_periscope_column',
      x: 1385,
      y: 70,
      w: 155,
      h: 495,
      sortY: 555,
      parallaxFactor: 1.0,
    },

    // Right Bay: Tribal Masks & Ship Wheel Shelf, Captain's Pirate Bunk Bed, Crooked Nightstand, Lamp & Underwater Porthole
    {
      id: 'obj_z1s3_wall_masks',
      hotspotId: 'z1s3_wall_masks',
      imageKey: 'obj_wall_masks',
      x: 1580,
      y: 125,
      w: 310,
      h: 205,
      sortY: 515,
      parallaxFactor: 1.0,
    },
    {
      id: 'obj_z1s3_bunk_bed',
      hotspotId: 'z1s3_bunk_bed',
      imageKey: 'obj_captain_bed',
      x: 1545,
      y: 335,
      w: 365,
      h: 255,
      sortY: 575,
      parallaxFactor: 1.0,
    },
    {
      id: 'obj_z1s3_nightstand',
      hotspotId: 'z1s3_nightstand_lamp',
      imageKey: 'obj_nightstand',
      x: 1930,
      y: 425,
      w: 135,
      h: 160,
      sortY: 580,
      parallaxFactor: 1.0,
    },
    {
      id: 'obj_z1s3_bed_lamp',
      hotspotId: 'z1s3_nightstand_lamp',
      imageKey: 'obj_bed_lamp',
      x: 1952,
      y: 315,
      w: 92,
      h: 125,
      sortY: 582,
      parallaxFactor: 1.0,
      tiltDeg: 3.5,
    },
    {
      id: 'obj_z1s3_porthole',
      hotspotId: 'z1s3_porthole',
      imageKey: 'obj_porthole',
      x: 2085,
      y: 185,
      w: 185,
      h: 185,
      sortY: 525,
      parallaxFactor: 1.0,
      fxType: 'porthole',
    },

    // 2.5D Foreground Multi-Plane Parallax Objects (1.18x Foreground Depth, each an isolated cutout!)
    {
      id: 'obj_z1s3_fg_chart_table',
      hotspotId: 'z1s3_stache_photo',
      imageKey: 'obj_fg_chart_table',
      x: 220,
      y: 695,
      w: 380,
      h: 215,
      sortY: 885,
      parallaxFactor: 1.18,
    },
    {
      id: 'obj_z1s3_fg_ship_bottle',
      hotspotId: 'z1s3_stache_photo',
      imageKey: 'obj_fg_ship_bottle',
      x: 260,
      y: 625,
      w: 165,
      h: 115,
      sortY: 888,
      parallaxFactor: 1.18,
    },
    {
      id: 'obj_z1s3_stache_photo',
      hotspotId: 'z1s3_stache_photo',
      imageKey: 'obj_stache_photo',
      x: 445,
      y: 595,
      w: 135,
      h: 145,
      sortY: 890,
      parallaxFactor: 1.18,
      tiltDeg: -3.5,
    },
    {
      id: 'obj_z1s3_fg_sea_trunk',
      hotspotId: 'z1s3_clown_voodoo',
      imageKey: 'obj_fg_sea_trunk',
      x: 1660,
      y: 695,
      w: 360,
      h: 215,
      sortY: 885,
      parallaxFactor: 1.18,
    },
    {
      id: 'obj_z1s3_fg_clown_head',
      hotspotId: 'z1s3_clown_voodoo',
      imageKey: 'obj_fg_clown_head',
      x: 1705,
      y: 565,
      w: 135,
      h: 168,
      sortY: 889,
      parallaxFactor: 1.18,
      tiltDeg: 2.5,
    },
    {
      id: 'obj_z1s3_fg_voodoo_doll',
      hotspotId: 'z1s3_clown_voodoo',
      imageKey: 'obj_fg_voodoo_doll',
      x: 1855,
      y: 595,
      w: 118,
      h: 142,
      sortY: 890,
      parallaxFactor: 1.18,
      tiltDeg: -4.0,
    },
  ],

  // =========================================================
  // Z1S2: SUBSTAMPEDE VIP LOUNGE & CANDY VAULT (2200x900 WIDE SCROLLING STAGE + ISOLATED CUTOUTS)
  // =========================================================
  Z1S2: [
    // Ceiling Swinging Cage Lamps
    {
      id: 'obj_z1s2_lamp_1',
      imageKey: 'obj_cage_lamp',
      x: 480,
      y: 16,
      w: 110,
      h: 155,
      sortY: 210,
      parallaxFactor: 0.95,
      idleAnim: 'swing',
      fxType: 'cage_lamp',
    },
    {
      id: 'obj_z1s2_lamp_2',
      imageKey: 'obj_cage_lamp',
      x: 1380,
      y: 16,
      w: 110,
      h: 155,
      sortY: 210,
      parallaxFactor: 0.95,
      idleAnim: 'swing',
      fxType: 'cage_lamp',
    },
    // A Baby's Chocolate-Smeared Musical Candy Vault (Mounted on Left Hull Panel)
    {
      id: 'obj_z1s2_funky_vault',
      hotspotId: 'z1s2_funky_vault',
      imageKey: 'obj_funky_vault',
      x: 160,
      y: 255,
      w: 205,
      h: 230,
      sortY: 555,
      parallaxFactor: 1.0,
      fxType: 'funky_vault',
    },
    // Iron Ladder Down to Engine Room
    {
      id: 'obj_z1s2_ladder',
      hotspotId: 'z1s2_ladder_engine',
      imageKey: 'obj_iron_ladder',
      x: 430,
      y: 75,
      w: 150,
      h: 495,
      sortY: 560,
      parallaxFactor: 1.0,
    },
    // Samurai Katana Rack & Scroll on Upper Wall
    {
      id: 'obj_z1s2_samurai_rack',
      hotspotId: 'z1s2_samurai_wall',
      imageKey: 'obj_samurai_rack',
      x: 865,
      y: 110,
      w: 340,
      h: 265,
      sortY: 520,
      parallaxFactor: 1.0,
    },
    // VIP Lounge Tufted Burgundy Sofa
    {
      id: 'obj_z1s2_sofa',
      hotspotId: 'z1s2_lounge_sofa',
      imageKey: 'obj_lounge_sofa',
      x: 820,
      y: 365,
      w: 420,
      h: 235,
      sortY: 575,
      parallaxFactor: 1.0,
    },
    // Glowing Underwater Porthole Window
    {
      id: 'obj_z1s2_porthole',
      imageKey: 'obj_porthole',
      x: 1450,
      y: 185,
      w: 180,
      h: 180,
      sortY: 525,
      parallaxFactor: 1.0,
      fxType: 'porthole',
    },
    // Heavy Bulkhead Door to Captain's Cabin
    {
      id: 'obj_z1s2_door_captain',
      hotspotId: 'z1s2_door_captain',
      imageKey: 'obj_bulkhead_door',
      x: 1760,
      y: 205,
      w: 225,
      h: 380,
      sortY: 570,
      parallaxFactor: 1.0,
    },
    // Interactive Mystery Box with Blinking Yellow Eyes in Foreground
    {
      id: 'obj_z1s2_mystery_crate',
      hotspotId: 'z1s2_mystery_box',
      imageKey: 'obj_mystery_crate',
      x: 1180,
      y: 650,
      w: 270,
      h: 225,
      sortY: 890,
      parallaxFactor: 1.15,
      fxType: 'crate_eyes',
    },
  ],

  // =========================================================
  // Z1S1: SUBSTAMPEDE ENGINE ROOM (2200x900 WIDE SCROLLING STAGE + ISOLATED CUTOUTS)
  // =========================================================
  Z1S1: [
    // Ceiling Swinging Cage Lamps & Sparking Cables
    {
      id: 'obj_z1s1_lamp_1',
      imageKey: 'obj_cage_lamp',
      x: 520,
      y: 16,
      w: 110,
      h: 155,
      sortY: 210,
      parallaxFactor: 0.95,
      idleAnim: 'swing',
      fxType: 'cage_lamp',
    },
    {
      id: 'obj_z1s1_lamp_2',
      imageKey: 'obj_cage_lamp',
      x: 1420,
      y: 16,
      w: 110,
      h: 155,
      sortY: 210,
      parallaxFactor: 0.95,
      idleAnim: 'swing',
      fxType: 'cage_lamp',
    },
    {
      id: 'obj_z1s1_spark_cable',
      imageKey: 'obj_spark_cable',
      x: 1210,
      y: 20,
      w: 85,
      h: 210,
      sortY: 250,
      parallaxFactor: 0.98,
      idleAnim: 'swing',
      fxType: 'spark_cable',
    },
    // Auxiliary Pedal Station (Left)
    {
      id: 'obj_z1s1_pedal_aux',
      imageKey: 'obj_pedal_engine_aux',
      x: 340,
      y: 280,
      w: 330,
      h: 300,
      sortY: 565,
      parallaxFactor: 1.0,
    },
    // Central Iron Ladder Up to VIP Lounge
    {
      id: 'obj_z1s1_ladder_up',
      hotspotId: 'z1s1_ladder_up',
      imageKey: 'obj_iron_ladder',
      x: 920,
      y: 65,
      w: 150,
      h: 505,
      sortY: 555,
      parallaxFactor: 1.0,
    },
    // Main Submarine Bicycle Pedal Drive (Right) where BAM! & Perpetual Machine happen
    {
      id: 'obj_z1s1_pedal_main',
      hotspotId: 'z1s1_pedal_engine',
      imageKey: 'obj_pedal_engine_main',
      x: 1250,
      y: 275,
      w: 350,
      h: 315,
      sortY: 575,
      parallaxFactor: 1.0,
      fxType: 'pedal_engine',
    },
    // Dropped Da Vinci Blueprint on Catwalk after Pedal Snaps
    {
      id: 'obj_z1s1_blueprint',
      hotspotId: 'z1s1_blueprint_pickup',
      imageKey: 'item_blueprint',
      x: 1065,
      y: 545,
      w: 110,
      h: 85,
      sortY: 595,
      parallaxFactor: 1.0,
      idleAnim: 'bob',
      visibleWhen: (f) => f.pedalBrokenBam && !f.nihongoGaveBlueprint,
    },
    // Isolated Foreground Cutouts: Bilge Rat Watching Retro TV on Potato Sacks & Radioactive Barrels
    {
      id: 'obj_z1s1_rad_barrels',
      hotspotId: 'z1s1_rad_barrels',
      imageKey: 'obj_rad_barrels',
      x: 160,
      y: 615,
      w: 285,
      h: 265,
      sortY: 890,
      parallaxFactor: 1.15,
    },
    {
      id: 'obj_z1s1_rat_tv',
      hotspotId: 'z1s1_rat_tv',
      imageKey: 'obj_rat_tv',
      x: 1460,
      y: 610,
      w: 350,
      h: 270,
      sortY: 892,
      parallaxFactor: 1.15,
      fxType: 'crt_tv',
    },
  ],

  LOLDEMO: [],
};

export const ROOM_HOTSPOTS: Record<RoomId, HotspotDef[]> = {
  // =========================================================
  // Z1S3: CAPTAIN DREAD'S QUARTERS (2400x900 WIDE SCROLLING STAGE)
  // =========================================================
  Z1S3: [
    {
      id: 'z1s3_sarcophagus',
      name: 'Golden Egyptian Sarcophagus',
      x: 145,
      y: 235,
      w: 185,
      h: 355,
      walkX: 295,
      walkY: 635,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_coat_rack',
      name: "Captain's Peg Rack & Pirate Coat",
      x: 345,
      y: 205,
      w: 185,
      h: 275,
      walkX: 435,
      walkY: 625,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_door_lounge',
      name: 'Submarine Bulkhead Door (To VIP Lounge)',
      x: 540,
      y: 205,
      w: 220,
      h: 375,
      walkX: 650,
      walkY: 625,
      cursor: 'exit',
      isExitTo: 'Z1S2',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_hammer_bag',
      name: 'Bag of Heavy Hammers',
      x: 785,
      y: 495,
      w: 110,
      h: 105,
      walkX: 840,
      walkY: 635,
      cursor: 'grab',
      parallaxFactor: 1.0,
      visibleWhen: (f) => !f.gotHammerBag,
    },
    {
      id: 'z1s3_crt_tv',
      name: 'Retro Submarine CRT Television',
      x: 920,
      y: 270,
      w: 142,
      h: 135,
      walkX: 995,
      walkY: 630,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_fishbowl',
      name: "Captain Dread's Grumpy Goldfish Bowl",
      x: 1085,
      y: 318,
      w: 92,
      h: 92,
      walkX: 1125,
      walkY: 630,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_desk_drawer',
      name: "Captain's Mahogany Desk & Drawer",
      x: 895,
      y: 405,
      w: 315,
      h: 185,
      walkX: 1055,
      walkY: 635,
      cursor: 'grab',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_mss_poster',
      name: 'MoonStorm Studios Wall Poster',
      x: 965,
      y: 120,
      w: 155,
      h: 195,
      walkX: 1045,
      walkY: 625,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_portrait_stand',
      name: "Captain's Tripod Portrait Stand",
      x: 1245,
      y: 335,
      w: 165,
      h: 250,
      walkX: 1315,
      walkY: 635,
      cursor: 'grab',
      parallaxFactor: 1.0,
      visibleWhen: (f) => !f.gotPortraitStand,
    },
    {
      id: 'z1s3_cap_dread',
      name: 'Captain Dread (Submarine Commander)',
      x: 1385,
      y: 350,
      w: 175,
      h: 290,
      walkX: 1320,
      walkY: 645,
      cursor: 'talk',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_wall_masks',
      name: 'Tribal Masks, Ship Wheel & Rations Shelf',
      x: 1580,
      y: 125,
      w: 310,
      h: 205,
      walkX: 1720,
      walkY: 630,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_bunk_bed',
      name: "Captain Dread's Cozy Pirate Bunk Bed",
      x: 1545,
      y: 340,
      w: 365,
      h: 250,
      walkX: 1720,
      walkY: 635,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_nightstand_lamp',
      name: 'Crooked Crate Nightstand & Tilted Lamp',
      x: 1930,
      y: 315,
      w: 135,
      h: 270,
      walkX: 1910,
      walkY: 635,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_porthole',
      name: 'Deep-Sea Submarine Porthole Window',
      x: 2085,
      y: 185,
      w: 185,
      h: 185,
      walkX: 2040,
      walkY: 635,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s3_stache_photo',
      name: 'Framed Portrait of Dr. Morgan Stache & Chart Table',
      x: 220,
      y: 595,
      w: 380,
      h: 295,
      walkX: 460,
      walkY: 660,
      cursor: 'pointer',
      parallaxFactor: 1.18,
    },
    {
      id: 'z1s3_clown_voodoo',
      name: 'Creepy Porcelain Clown Bust & Voodoo Doll',
      x: 1660,
      y: 565,
      w: 360,
      h: 325,
      walkX: 1780,
      walkY: 660,
      cursor: 'pointer',
      parallaxFactor: 1.18,
    },
  ],

  // =========================================================
  // Z1S2: SUBSTAMPEDE VIP LOUNGE & CANDY VAULT (2200x900 WIDE SCROLLING STAGE)
  // =========================================================
  Z1S2: [
    {
      id: 'z1s2_funky_vault',
      name: "A Baby's Chocolate-Smeared Musical Vault",
      x: 160,
      y: 255,
      w: 205,
      h: 230,
      walkX: 310,
      walkY: 635,
      cursor: 'grab',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s2_ladder_engine',
      name: 'Iron Ladder Down (To Engine Room)',
      x: 430,
      y: 75,
      w: 150,
      h: 495,
      walkX: 505,
      walkY: 630,
      cursor: 'exit',
      isExitTo: 'Z1S1',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s2_a_baby',
      name: 'A Baby (Cigar-Lollipop Mobster Toddler)',
      x: 615,
      y: 380,
      w: 175,
      h: 270,
      walkX: 785,
      walkY: 648,
      cursor: 'talk',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s2_samurai_wall',
      name: 'Samurai Mural & Katana Sword Rack',
      x: 865,
      y: 110,
      w: 340,
      h: 250,
      walkX: 1030,
      walkY: 630,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s2_lounge_sofa',
      name: 'Tufted Velvet Submarine Lounge Sofa',
      x: 820,
      y: 365,
      w: 420,
      h: 235,
      walkX: 1030,
      walkY: 640,
      cursor: 'pointer',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s2_ventriloquist',
      name: 'The Ventriloquist & Clash McTrevor (Rapoleon)',
      x: 1320,
      y: 350,
      w: 185,
      h: 295,
      walkX: 1220,
      walkY: 645,
      cursor: 'talk',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s2_door_captain',
      name: "Heavy Bulkhead Door (To Captain's Cabin)",
      x: 1760,
      y: 205,
      w: 225,
      h: 380,
      walkX: 1710,
      walkY: 635,
      cursor: 'exit',
      isExitTo: 'Z1S3',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s2_mystery_box',
      name: 'Mystery Box with Blinking Yellow Eyes',
      x: 1180,
      y: 650,
      w: 270,
      h: 225,
      walkX: 1280,
      walkY: 660,
      cursor: 'pointer',
      parallaxFactor: 1.15,
    },
  ],

  // =========================================================
  // Z1S1: SUBSTAMPEDE ENGINE ROOM (2200x900 WIDE SCROLLING STAGE)
  // =========================================================
  Z1S1: [
    {
      id: 'z1s1_nihongo',
      name: 'Nihongo Nohondes (Chief Pedal Engineer)',
      x: 640,
      y: 345,
      w: 175,
      h: 285,
      walkX: 830,
      walkY: 635,
      cursor: 'talk',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s1_ladder_up',
      name: 'Central Iron Ladder (Up to VIP Lounge)',
      x: 920,
      y: 65,
      w: 150,
      h: 505,
      walkX: 995,
      walkY: 625,
      cursor: 'exit',
      isExitTo: 'Z1S2',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s1_blueprint_pickup',
      name: "Leonardo da Vinci's Perpetual Machine Blueprint",
      x: 1065,
      y: 545,
      w: 110,
      h: 85,
      walkX: 1115,
      walkY: 635,
      cursor: 'grab',
      parallaxFactor: 1.0,
      visibleWhen: (f) => f.pedalBrokenBam && !f.nihongoGaveBlueprint,
    },
    {
      id: 'z1s1_pedal_engine',
      name: 'Main Submarine Bicycle Pedal Drive',
      x: 1250,
      y: 275,
      w: 350,
      h: 315,
      walkX: 1230,
      walkY: 635,
      cursor: 'grab',
      parallaxFactor: 1.0,
    },
    {
      id: 'z1s1_rad_barrels',
      name: 'Radioactive Submarine Bilge Barrels',
      x: 160,
      y: 615,
      w: 285,
      h: 265,
      walkX: 420,
      walkY: 650,
      cursor: 'pointer',
      parallaxFactor: 1.15,
    },
    {
      id: 'z1s1_rat_tv',
      name: 'Bilge Rats Watching Television on Potato Sacks',
      x: 1460,
      y: 610,
      w: 350,
      h: 270,
      walkX: 1480,
      walkY: 650,
      cursor: 'pointer',
      parallaxFactor: 1.15,
    },
  ],

  LOLDEMO: [
    {
      id: 'lol_castle_door',
      name: 'Haunted Castle Wooden Door (Knock!)',
      x: 1220,
      y: 615,
      w: 95,
      h: 135,
      walkX: 1190,
      walkY: 735,
      cursor: 'grab',
    },
    {
      id: 'lol_two_faced_sun',
      name: 'Two-Faced Paper Cut-Out Sun',
      x: 175,
      y: 70,
      w: 205,
      h: 205,
      walkX: 435,
      walkY: 685,
      cursor: 'pointer',
    },
    {
      id: 'lol_return_sub',
      name: "Return to Captain Dread's Cabin",
      x: 40,
      y: 560,
      w: 180,
      h: 215,
      walkX: 210,
      walkY: 685,
      cursor: 'exit',
      isExitTo: 'Z1S3',
    },
  ],
};
