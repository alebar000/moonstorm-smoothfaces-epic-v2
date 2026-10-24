/**
 * MoonStorm Studios - Smoothface's Epic (Codename: Sparkle)
 * Multi-Part Hand-Drawn Paper Cut-Out Skeletal & Emotion Renderer (src/engine/CutoutRigRenderer.ts)
 *
 * Renders Mr. Smoothface, Captain Dread, Nihongo Nohondes, A Baby, and The Ventriloquist & Rapoleon
 * directly from their approved multi-part cutout pieces in `art/approved/` using the calibrated
 * coordinates from `characters/<id>/rig.json`.
 */

export type CharacterId = 'smoothface' | 'cap_dread' | 'nihongo' | 'a_baby' | 'ventriloquist' | 'troll';
export type EmotionCutoutType = 'anger' | 'lightning' | 'shock' | 'question' | 'idea' | 'sweat';

export interface PuppetAnimState {
  id: CharacterId;
  x: number;
  y: number;
  scale: number;
  facing: 1 | -1;          // 1 = right, -1 = left
  flipVisual: number;      // Smoothly interpolates between +1 and -1 for 2.5D Paper Card Turn
  isWalking: boolean;
  walkPhase: number;
  idlePhase: number;
  poseIndex: number;       // 0: Idle, 1..2: Walk, 3: Talk, 4: Inspect(?), 5: Tinker(Idea), 6: Rage(Anger), 7: Laugh, 8: Shock(!!)
  poseTimer: number;       // Holds an explicit action pose before returning to autonomous life
  fidgetTimer: number;     // Timer for autonomous NPC & player idle fidgets
  autoPose: number;        // Autonomous idle variation pose
  talkAmp: number;         // 0..1 driven by AudioVoiceEngine envelope
  blinkTimer: number;
  blinkAmount: number;     // 0 = open, 1 = closed
  squashX: number;
  squashY: number;
  lookTargetX: number;
  lookTargetY: number;
  grumpyMode: boolean;
  emotionPop: number;      // 0..1 spring scale for separate emotion cutout pop-in
  lastEmotionKey: string;
}

interface PartBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const SMOOTHFACE_BOXES: Record<string, PartBox> = {
  shoe_back:        { x:  74, y: 352, w:  84, h:  59 },
  leg_back:         { x:  78, y: 320, w:  49, h:  68 },
  shoe_front:       { x: 112, y: 355, w:  84, h:  59 },
  leg_front:        { x: 118, y: 322, w:  40, h:  68 },
  pants:            { x:  78, y: 282, w:  84, h:  81 },
  hand_back_fist:   { x: 246, y: 224, w:  46, h:  42 },
  hand_back_open:   { x: 246, y: 220, w:  46, h:  46 },
  hand_back_point:  { x: 244, y: 220, w:  58, h:  42 },
  arm_back:         { x: 158, y: 212, w: 124, h: 100 },
  head:             { x: 132, y:  79, w: 144, h: 151 },
  eyes_normal:      { x: 175, y: 143, w:  72, h:  58 },
  eyes_squint:      { x: 174, y: 142, w:  81, h:  60 },
  eyes_closed:      { x: 175, y: 143, w:  78, h:  58 },
  brows_normal:     { x: 174, y: 132, w:  96, h:  50 },
  brows_angry:      { x: 178, y: 131, w:  84, h:  59 },
  brows_surprised:  { x: 179, y: 126, w:  76, h:  57 },
  torso:            { x:  27, y:  90, w: 255, h: 271 },
  hand_front_fist:  { x: 232, y: 244, w:  41, h:  44 },
  hand_front_open:  { x: 230, y: 240, w:  48, h:  48 },
  hand_front_point: { x: 230, y: 242, w:  72, h:  50 },
  arm_front:        { x: 142, y: 236, w: 126, h: 102 },
};

const CAPDREAD_BOXES: Record<string, PartBox> = {
  boot_back:        { x: 118, y: 388, w:  92, h:  65 },
  leg_back:         { x: 152, y: 332, w:  55, h:  76 },
  boot_front:       { x: 168, y: 395, w:  96, h:  68 },
  leg_front:        { x: 205, y: 336, w:  48, h:  78 },
  pants:            { x: 152, y: 288, w:  96, h:  92 },
  hand_back_fist:   { x:  72, y: 254, w:  50, h:  40 },
  hand_back_open:   { x:  82, y: 258, w:  50, h:  50 },
  arm_back:         { x:  56, y: 180, w:  76, h: 114 },
  head:             { x: 134, y:  74, w: 106, h: 138 },
  eyes_normal:      { x: 145, y: 122, w:  54, h:  37 },
  eyes_squint:      { x: 144, y: 124, w:  58, h:  26 },
  eyes_closed:      { x: 145, y: 122, w:  54, h:  37 },
  brows_normal:     { x: 140, y: 110, w:  64, h:  20 },
  brows_angry:      { x: 140, y: 106, w:  64, h:  28 },
  brows_surprised:  { x: 140, y: 103, w:  62, h:  34 },
  hat:              { x: 112, y:  26, w: 142, h: 108 },
  torso:            { x:  82, y: 148, w: 230, h: 236 },
  beard:            { x: 114, y: 132, w:  96, h:  92 },
  hand_front_fist:  { x: 222, y: 276, w:  48, h:  48 },
  hand_front_open:  { x: 218, y: 274, w:  48, h:  54 },
  hand_front_point: { x: 212, y: 274, w:  56, h:  65 },
  arm_front:        { x: 218, y: 176, w:  58, h: 124 },
};

const NIHONGO_BOXES: Record<string, PartBox> = {
  shoe_back:        { x: 152, y: 318, w:  68, h:  58 },
  leg_back:         { x: 152, y: 232, w:  65, h: 108 },
  shoe_front:       { x: 108, y: 322, w:  68, h:  58 },
  leg_front:        { x: 108, y: 234, w:  67, h: 112 },
  arm_back:         { x: 185, y: 118, w:  62, h: 110 },
  torso:            { x:  92, y:  98, w: 148, h: 196 },
  head:             { x: 124, y:  14, w:  82, h: 130 },
  eyes_normal:      { x: 144, y:  54, w:  48, h:  22 },
  eyes_closed:      { x: 144, y:  54, w:  48, h:  22 },
  eyes_squint:      { x: 144, y:  54, w:  48, h:  22 },
  brows_normal:     { x: 140, y:  42, w:  56, h:  16 },
  brows_angry:      { x: 140, y:  41, w:  56, h:  18 },
  headband:         { x:  96, y:  20, w: 114, h:  52 },
  broom_katana:     { x: 116, y:  94, w: 140, h: 248 },
  arm_front:        { x:  96, y: 116, w:  88, h: 116 },
  hand_front_fist:  { x: 166, y: 182, w:  38, h:  42 },
  hand_front_open:  { x: 164, y: 178, w:  44, h:  46 },
};

const ABABY_BOXES: Record<string, PartBox> = {
  arm_back:         { x: 186, y: 112, w:  95, h: 168 },
  legs_diaper:      { x: 108, y: 214, w: 118, h: 125 },
  torso:            { x:  96, y:  92, w: 142, h: 172 },
  arm_front:        { x:  58, y: 112, w:  99, h: 176 },
  head:             { x: 116, y:  18, w: 104, h: 122 },
  eyes_normal:      { x: 134, y:  44, w:  68, h:  31 },
  eyes_angry:       { x: 133, y:  44, w:  70, h:  32 },
  bonnet:           { x:  98, y:   4, w: 140, h:  99 },
};

const VENTRILO_BOXES: Record<string, PartBox> = {
  shoes:            { x: 106, y: 324, w:  96, h:  42 },
  legs:             { x: 110, y: 196, w:  87, h: 170 },
  arm_back:         { x:  82, y: 104, w:  72, h: 122 },
  torso:            { x: 104, y:  88, w: 102, h: 172 },
  head_jaw:         { x: 116, y:   6, w:  78, h: 136 },
  eyes_normal:      { x: 132, y:  48, w:  48, h:  22 },
  arm_front:        { x: 124, y: 122, w:  96, h: 110 },
  dummy_rapoleon:   { x: 166, y:  78, w: 120, h: 168 },
};

const TROLL_BOXES: Record<string, PartBox> = {
  arm_back:         { x:  62, y: 118, w:  92, h: 170 },
  legs_feet:        { x:  98, y: 224, w: 146, h: 148 },
  torso_tunic:      { x:  84, y:  96, w: 168, h: 206 },
  head_jaw:         { x:  90, y:  10, w: 158, h: 144 },
  eyes:             { x: 126, y:  42, w:  86, h:  40 },
  arm_front_club:   { x: 182, y:  56, w: 170, h: 184 },
};

export class CutoutRigRenderer {
  private images: Map<string, HTMLImageElement> = new Map();

  constructor() {
    this.preloadAllRigAssets();
  }

  private loadImg(key: string, src: string): void {
    const img = new Image();
    img.src = src;
    this.images.set(key, img);
  }

  private getImg(key: string): HTMLImageElement | null {
    const im = this.images.get(key);
    if (im && im.complete && im.naturalWidth > 0) {
      return im;
    }
    return null;
  }

  private preloadAllRigAssets(): void {
    const sfPieces: Array<[string, string]> = [
      ['sf_shoe_back',        'art/approved/smoothface/smoothface.shoe_back.png'],
      ['sf_leg_back',         'art/approved/smoothface/smoothface.leg_back.png'],
      ['sf_shoe_front',       'art/approved/smoothface/smoothface.shoe_front.png'],
      ['sf_leg_front',        'art/approved/smoothface/smoothface.leg_front.png'],
      ['sf_pants',            'art/approved/smoothface/smoothface.pants.png'],
      ['sf_hand_back_fist',   'art/approved/smoothface/smoothface.hand_back.fist.png'],
      ['sf_hand_back_open',   'art/approved/smoothface/smoothface.hand_back.open.png'],
      ['sf_hand_back_point',  'art/approved/smoothface/smoothface.hand_back.point.png'],
      ['sf_arm_back',         'art/approved/smoothface/smoothface.arm_back.png'],
      ['sf_head',             'art/approved/smoothface/smoothface.head.png'],
      ['sf_eyes_normal',      'art/approved/smoothface/smoothface.eyes.normal.png'],
      ['sf_eyes_squint',      'art/approved/smoothface/smoothface.eyes.squint.png'],
      ['sf_eyes_closed',      'art/approved/smoothface/smoothface.eyes.closed.png'],
      ['sf_brows_normal',     'art/approved/smoothface/smoothface.brows.normal.png'],
      ['sf_brows_angry',      'art/approved/smoothface/smoothface.brows.angry.png'],
      ['sf_brows_surprised',  'art/approved/smoothface/smoothface.brows.surprised.png'],
      ['sf_torso',            'art/approved/smoothface/smoothface.torso.png'],
      ['sf_hand_front_fist',  'art/approved/smoothface/smoothface.hand_front.fist.png'],
      ['sf_hand_front_open',  'art/approved/smoothface/smoothface.hand_front.open.png'],
      ['sf_hand_front_point', 'art/approved/smoothface/smoothface.hand_front.point.png'],
      ['sf_arm_front',        'art/approved/smoothface/smoothface.arm_front.png'],
      ['sf_emotion_anger',    'art/approved/smoothface/smoothface.emotion.anger_vein.png'],
      ['sf_emotion_shock',    'art/approved/smoothface/smoothface.emotion.exclamation.png'],
      ['sf_emotion_idea',     'art/approved/smoothface/smoothface.emotion.idea_bulb.png'],
      ['sf_emotion_question', 'art/approved/smoothface/smoothface.emotion.question_mark.png'],
      ['sf_emotion_sweat',    'art/approved/smoothface/smoothface.emotion.sweat_drop.png'],
      ['sf_prop_magnifier',   'art/approved/smoothface/smoothface.prop.magnifying_glass.png'],
      ['sf_prop_key',         'art/approved/smoothface/smoothface.prop.skeleton_key.png'],
    ];
    for (const [k, src] of sfPieces) {
      this.loadImg(k, src);
    }

    const cdPieces: Array<[string, string]> = [
      ['cd_boot_back',        'art/approved/capdread/capdread.boot_back.png'],
      ['cd_leg_back',         'art/approved/capdread/capdread.leg_back.png'],
      ['cd_boot_front',       'art/approved/capdread/capdread.boot_front.png'],
      ['cd_leg_front',        'art/approved/capdread/capdread.leg_front.png'],
      ['cd_pants',            'art/approved/capdread/capdread.pants.png'],
      ['cd_hand_back_fist',   'art/approved/capdread/capdread.hand_back.fist.png'],
      ['cd_hand_back_open',   'art/approved/capdread/capdread.hand_back.open.png'],
      ['cd_arm_back',         'art/approved/capdread/capdread.arm_back.png'],
      ['cd_head',             'art/approved/capdread/capdread.head.png'],
      ['cd_eyes_normal',      'art/approved/capdread/capdread.eyes.normal.png'],
      ['cd_eyes_squint',      'art/approved/capdread/capdread.eyes.squint.png'],
      ['cd_eyes_closed',      'art/approved/capdread/capdread.eyes.closed.png'],
      ['cd_brows_normal',     'art/approved/capdread/capdread.brows.normal.png'],
      ['cd_brows_angry',      'art/approved/capdread/capdread.brows.angry.png'],
      ['cd_brows_surprised',  'art/approved/capdread/capdread.brows.surprised.png'],
      ['cd_hat',              'art/approved/capdread/capdread.hat.png'],
      ['cd_torso',            'art/approved/capdread/capdread.torso.png'],
      ['cd_beard',            'art/approved/capdread/capdread.beard.png'],
      ['cd_hand_front_fist',  'art/approved/capdread/capdread.hand_front.fist.png'],
      ['cd_hand_front_open',  'art/approved/capdread/capdread.hand_front.open.png'],
      ['cd_hand_front_point', 'art/approved/capdread/capdread.hand_front.point.png'],
      ['cd_arm_front',        'art/approved/capdread/capdread.arm_front.png'],
    ];
    for (const [k, src] of cdPieces) {
      this.loadImg(k, src);
    }

    const niPieces: Array<[string, string]> = [
      ['ni_leg_back',         'art/approved/nihongo/nihongo.leg_back.png'],
      ['ni_shoe_front',       'art/approved/nihongo/nihongo.shoe_front.png'],
      ['ni_leg_front',        'art/approved/nihongo/nihongo.leg_front.png'],
      ['ni_arm_back',         'art/approved/nihongo/nihongo.arm_back.png'],
      ['ni_torso',            'art/approved/nihongo/nihongo.torso.png'],
      ['ni_head',             'art/approved/nihongo/nihongo.head.png'],
      ['ni_eyes_normal',      'art/approved/nihongo/nihongo.eyes.normal.png'],
      ['ni_eyes_closed',      'art/approved/nihongo/nihongo.eyes.closed.png'],
      ['ni_eyes_squint',      'art/approved/nihongo/nihongo.eyes.squint.png'],
      ['ni_brows_normal',     'art/approved/nihongo/nihongo.brows.normal.png'],
      ['ni_brows_angry',      'art/approved/nihongo/nihongo.brows.angry.png'],
      ['ni_headband',         'art/approved/nihongo/nihongo.headband.png'],
      ['ni_broom_katana',     'art/approved/nihongo/nihongo.prop.broom_katana.png'],
      ['ni_hand_front_fist',  'art/approved/nihongo/nihongo.hand_front.fist.png'],
      ['ni_hand_front_open',  'art/approved/nihongo/nihongo.hand_front.open.png'],
      ['ni_arm_front',        'art/approved/nihongo/nihongo.arm_front.png'],
    ];
    for (const [k, src] of niPieces) {
      this.loadImg(k, src);
    }

    const abPieces: Array<[string, string]> = [
      ['ab_arm_back',         'art/approved/ababy/ababy.arm_back.png'],
      ['ab_legs_diaper',      'art/approved/ababy/ababy.legs_diaper.png'],
      ['ab_torso',            'art/approved/ababy/ababy.torso.png'],
      ['ab_head',             'art/approved/ababy/ababy.head.png'],
      ['ab_eyes_normal',      'art/approved/ababy/ababy.eyes.normal.png'],
      ['ab_eyes_angry',       'art/approved/ababy/ababy.eyes.angry.png'],
      ['ab_bonnet',           'art/approved/ababy/ababy.bonnet.png'],
      ['ab_arm_front',        'art/approved/ababy/ababy.arm_front.png'],
    ];
    for (const [k, src] of abPieces) {
      this.loadImg(k, src);
    }

    const vtPieces: Array<[string, string]> = [
      ['vt_shoes',            'art/approved/ventriloquist/ventrilo.shoes.png'],
      ['vt_legs',             'art/approved/ventriloquist/ventrilo.legs.png'],
      ['vt_arm_back',         'art/approved/ventriloquist/ventrilo.arm_back.png'],
      ['vt_torso',            'art/approved/ventriloquist/ventrilo.torso.png'],
      ['vt_head_jaw',         'art/approved/ventriloquist/ventrilo.head_jaw.png'],
      ['vt_eyes_normal',      'art/approved/ventriloquist/ventrilo.eyes.normal.png'],
      ['vt_arm_front',        'art/approved/ventriloquist/ventrilo.arm_front.png'],
      ['vt_dummy_rapoleon',   'art/approved/ventriloquist/ventrilo.dummy_rapoleon.png'],
    ];
    for (const [k, src] of vtPieces) {
      this.loadImg(k, src);
    }

    const trPieces: Array<[string, string]> = [
      ['tr_arm_back',         'art/approved/z0/troll.arm_back.png'],
      ['tr_legs_feet',        'art/approved/z0/troll.legs_feet.png'],
      ['tr_torso_tunic',      'art/approved/z0/troll.torso_tunic.png'],
      ['tr_head_jaw',         'art/approved/z0/troll.head_jaw.png'],
      ['tr_eyes',             'art/approved/z0/troll.eyes.png'],
      ['tr_arm_front_club',   'art/approved/z0/troll.arm_front_club.png'],
    ];
    for (const [k, src] of trPieces) {
      this.loadImg(k, src);
    }
  }

  public createAnimState(id: CharacterId, x: number, y: number, scale = 1.0, facing: 1 | -1 = 1): PuppetAnimState {
    return {
      id,
      x,
      y,
      scale,
      facing,
      flipVisual: facing,
      isWalking: false,
      walkPhase: 0,
      idlePhase: Math.random() * Math.PI * 2,
      poseIndex: 0,
      poseTimer: 0,
      fidgetTimer: 3.5 + Math.random() * 2.5,
      autoPose: 0,
      talkAmp: 0,
      blinkTimer: 1.8 + Math.random() * 2.5,
      blinkAmount: 0,
      squashX: 1,
      squashY: 1,
      lookTargetX: x + facing * 120,
      lookTargetY: y - 120,
      grumpyMode: false,
      emotionPop: 1,
      lastEmotionKey: 'anger',
    };
  }

  public setActionPose(state: PuppetAnimState, poseIdx: number, durationSec = 1.8): void {
    state.poseIndex = poseIdx;
    state.poseTimer = durationSec;
    state.emotionPop = 0.05;
    this.triggerSquash(state, 1.08, 0.94);
  }

  public updatePuppetState(state: PuppetAnimState, dt: number, onPaperFlip?: () => void): void {
    state.idlePhase += dt * 3.0;
    if (state.isWalking) {
      state.walkPhase += dt * 11.0;
    } else {
      state.walkPhase *= 0.82;
    }

    if (state.poseTimer > 0) {
      state.poseTimer -= dt;
      if (state.poseTimer <= 0) {
        state.poseTimer = 0;
        state.poseIndex = 0;
        state.emotionPop = 0.15;
      }
    }

    state.emotionPop += (1.0 - state.emotionPop) * Math.min(1, dt * 14);

    const prevSign = Math.sign(state.flipVisual);
    const diff = state.facing - state.flipVisual;
    state.flipVisual += diff * Math.min(1, dt * 15);
    if (Math.abs(diff) < 0.02) state.flipVisual = state.facing;
    if (prevSign !== 0 && Math.sign(state.flipVisual) !== prevSign && onPaperFlip) {
      onPaperFlip();
    }

    state.squashX += (1.0 - state.squashX) * Math.min(1, dt * 12);
    state.squashY += (1.0 - state.squashY) * Math.min(1, dt * 12);

    state.blinkTimer -= dt;
    if (state.blinkTimer <= 0) {
      state.blinkTimer = 2.6 + Math.random() * 3.2;
    }
    if (state.blinkTimer < 0.14) {
      const t = state.blinkTimer / 0.14;
      state.blinkAmount = Math.sin(t * Math.PI);
    } else {
      state.blinkAmount = 0;
    }
  }

  public triggerSquash(state: PuppetAnimState, sx = 1.08, sy = 0.93): void {
    state.squashX = sx;
    state.squashY = sy;
  }

  private renderEmotionCutout(
    ctx: CanvasRenderingContext2D,
    emotion: EmotionCutoutType,
    x: number,
    y: number,
    phase: number,
    popScale: number
  ): void {
    const keyMap: Record<EmotionCutoutType, string> = {
      anger: 'sf_emotion_anger',
      lightning: 'sf_emotion_shock',
      shock: 'sf_emotion_shock',
      question: 'sf_emotion_question',
      idea: 'sf_emotion_idea',
      sweat: 'sf_emotion_sweat',
    };
    const emoImg = this.getImg(keyMap[emotion]);
    if (!emoImg) return;

    const elastic = popScale < 1 ? 1 + Math.sin(popScale * Math.PI) * 0.18 : 1.0;
    const bobY = Math.sin(phase * 2.2) * 4;

    ctx.save();
    ctx.translate(x, y + bobY);
    ctx.scale(elastic, elastic);
    ctx.drawImage(emoImg, -emoImg.naturalWidth * 0.5, -emoImg.naturalHeight * 0.5);
    ctx.restore();
  }

  private drawPart(
    ctx: CanvasRenderingContext2D,
    imgKey: string,
    box: PartBox,
    dx = 0,
    dy = 0,
    rot = 0,
    cutoutShadow = false
  ): void {
    const im = this.getImg(imgKey);
    if (!im) return;
    if (cutoutShadow) {
      ctx.save();
      ctx.shadowColor = 'rgba(15, 12, 10, 0.48)';
      ctx.shadowBlur = 2.5;
      ctx.shadowOffsetX = 1.5;
      ctx.shadowOffsetY = 2.5;
    }
    if (rot !== 0) {
      const cx = box.x + box.w * 0.5 + dx;
      const cy = box.y + box.h * 0.5 + dy;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.drawImage(im, -box.w * 0.5, -box.h * 0.5, box.w, box.h);
      ctx.restore();
    } else {
      ctx.drawImage(im, box.x + dx, box.y + dy, box.w, box.h);
    }
    if (cutoutShadow) {
      ctx.restore();
    }
  }

  /**
   * Renders Mr. Smoothface directly from his 27 approved cutout pieces (`art/approved/smoothface/`).
   */
  public renderSmoothfaceRig(ctx: CanvasRenderingContext2D, state: PuppetAnimState): void {
    const normScale = state.scale;
    const rigScale = 0.92 * normScale;

    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.fillStyle = 'rgba(12, 9, 8, 0.35)';
    ctx.beginPath();
    const shadowW = 68 * normScale * (0.85 + 0.15 * Math.abs(state.flipVisual));
    ctx.ellipse(0, 0, shadowW, 11 * normScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    let activePose = state.poseIndex;
    if (state.isWalking) {
      activePose = Math.sin(state.walkPhase) >= 0 ? 1 : 2;
    } else if (state.grumpyMode && activePose === 0) {
      activePose = 6;
    } else if (state.talkAmp > 0.05 && activePose === 0) {
      activePose = 3;
    }

    let eyesKey = 'sf_eyes_normal';
    if (state.blinkAmount > 0.55) {
      eyesKey = 'sf_eyes_closed';
    } else if (activePose === 4 || activePose === 6 || state.grumpyMode) {
      eyesKey = 'sf_eyes_squint';
    }

    let browsKey = 'sf_brows_normal';
    if (activePose === 6 || state.grumpyMode) {
      browsKey = 'sf_brows_angry';
    } else if (activePose === 4 || activePose === 5 || activePose === 8) {
      browsKey = 'sf_brows_surprised';
    }

    let handFrontKey = 'sf_hand_front_fist';
    let handBackKey = 'sf_hand_back_fist';
    if (activePose === 3 || activePose === 7 || activePose === 8) {
      handFrontKey = 'sf_hand_front_open';
      handBackKey = 'sf_hand_back_fist';
    } else if (activePose === 4 || activePose === 5) {
      handFrontKey = 'sf_hand_front_point';
      handBackKey = 'sf_hand_back_fist';
    }

    const walkSin = state.isWalking ? Math.sin(state.walkPhase) : 0;
    const walkCos = state.isWalking ? Math.cos(state.walkPhase) : 0;
    const walkBob = state.isWalking ? Math.abs(Math.sin(state.walkPhase * 2)) * -5 : 0;
    const bodyBob = Math.sin(state.idlePhase * 1.5) * 1.8 + (state.talkAmp > 0.04 ? Math.sin(state.idlePhase * 7) * state.talkAmp * 2.5 : 0);
    const armSwing = state.talkAmp > 0.04 ? Math.sin(state.idlePhase * 6) * state.talkAmp * 0.06 : Math.sin(state.idlePhase * 1.5) * 0.02;

    ctx.save();
    ctx.translate(state.x, state.y + walkBob);

    const cardScaleX = Math.abs(state.flipVisual) < 0.09 ? (state.flipVisual >= 0 ? 0.09 : -0.09) : state.flipVisual;
    ctx.scale(cardScaleX * state.squashX * rigScale, state.squashY * rigScale);
    ctx.translate(-165, -406);

    const backStrideX = walkSin * -10;
    const backLiftY = Math.max(0, -walkCos) * -6;
    this.drawPart(ctx, 'sf_shoe_back', SMOOTHFACE_BOXES.shoe_back, backStrideX, backLiftY);
    this.drawPart(ctx, 'sf_leg_back', SMOOTHFACE_BOXES.leg_back, backStrideX * 0.6, backLiftY * 0.5);

    const frontStrideX = walkSin * 10;
    const frontLiftY = Math.max(0, walkCos) * -6;
    this.drawPart(ctx, 'sf_shoe_front', SMOOTHFACE_BOXES.shoe_front, frontStrideX, frontLiftY);
    this.drawPart(ctx, 'sf_leg_front', SMOOTHFACE_BOXES.leg_front, frontStrideX * 0.6, frontLiftY * 0.5);

    this.drawPart(ctx, 'sf_pants', SMOOTHFACE_BOXES.pants, 0, bodyBob * 0.4);

    const hbBox = SMOOTHFACE_BOXES[handBackKey.replace('sf_', '')] || SMOOTHFACE_BOXES.hand_back_fist;
    this.drawPart(ctx, handBackKey, hbBox, 0, bodyBob - armSwing * 8, -armSwing * 0.2);
    this.drawPart(ctx, 'sf_arm_back', SMOOTHFACE_BOXES.arm_back, 0, bodyBob - armSwing * 8, -armSwing * 0.2);

    const headBob = bodyBob * 1.1;
    this.drawPart(ctx, 'sf_head', SMOOTHFACE_BOXES.head, 0, headBob);
    this.drawPart(ctx, eyesKey, SMOOTHFACE_BOXES[eyesKey.replace('sf_', '')], 0, headBob);
    this.drawPart(ctx, browsKey, SMOOTHFACE_BOXES[browsKey.replace('sf_', '')], 0, headBob);

    this.drawPart(ctx, 'sf_torso', SMOOTHFACE_BOXES.torso, 0, bodyBob);

    const hfBox = SMOOTHFACE_BOXES[handFrontKey.replace('sf_', '')] || SMOOTHFACE_BOXES.hand_front_fist;
    this.drawPart(ctx, handFrontKey, hfBox, 0, bodyBob + armSwing * 8, armSwing * 0.2);
    if (activePose === 4) {
      const mag = this.getImg('sf_prop_magnifier');
      if (mag) {
        ctx.drawImage(mag, 258, 198 + bodyBob, 52, 56);
      }
    }
    this.drawPart(ctx, 'sf_arm_front', SMOOTHFACE_BOXES.arm_front, 0, bodyBob + armSwing * 8, armSwing * 0.2);

    let activeEmotion: EmotionCutoutType | null = null;
    if (activePose === 4) activeEmotion = 'question';
    else if (activePose === 5 || activePose === 7) activeEmotion = 'idea';
    else if (activePose === 8) activeEmotion = 'shock';
    else if (activePose === 6 && state.poseTimer > 0) activeEmotion = 'anger';

    if (activeEmotion) {
      this.renderEmotionCutout(ctx, activeEmotion, 205, 32, state.idlePhase, state.emotionPop);
    }

    ctx.restore();
  }

  /**
   * Dispatches NPC rendering across all 4 multi-part cutout rigs:
   * - Captain Dread (`cap_dread`, 22 pieces, 330px)
   * - Nihongo Nohondes (`nihongo`, 16 pieces, 300px)
   * - A Baby (`a_baby`, 8 pieces, 270px)
   * - The Ventriloquist & Rapoleon (`ventriloquist`, 8 pieces, 340px)
   */
  public renderNpcPuppet(ctx: CanvasRenderingContext2D, state: PuppetAnimState): void {
    if (state.id === 'nihongo') {
      this.renderNihongoRig(ctx, state);
      return;
    }
    if (state.id === 'a_baby') {
      this.renderABabyRig(ctx, state);
      return;
    }
    if (state.id === 'ventriloquist') {
      this.renderVentriloquistRig(ctx, state);
      return;
    }
    if (state.id === 'troll') {
      this.renderTrollRig(ctx, state);
      return;
    }
    this.renderCapDreadRig(ctx, state);
  }

  private renderCapDreadRig(ctx: CanvasRenderingContext2D, state: PuppetAnimState): void {
    const normScale = state.scale;
    const rigScale = 0.85 * normScale;

    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.fillStyle = 'rgba(12, 9, 8, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 70 * normScale, 11 * normScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    let activePose = state.poseIndex;
    if (state.talkAmp > 0.05 && state.poseTimer <= 0) {
      activePose = Math.sin(state.idlePhase * 1.9) > 0 ? 1 : 2;
    }

    let eyesKey = 'cd_eyes_normal';
    if (state.blinkAmount > 0.55) {
      eyesKey = 'cd_eyes_closed';
    } else if (activePose === 2) {
      eyesKey = 'cd_eyes_squint';
    }

    let browsKey = 'cd_brows_normal';
    if (activePose === 2) {
      browsKey = 'cd_brows_angry';
    } else if (activePose === 3) {
      browsKey = 'cd_brows_surprised';
    }

    let handFrontKey = 'cd_hand_front_fist';
    let handBackKey = 'cd_hand_back_fist';
    if (activePose === 1) {
      handFrontKey = 'cd_hand_front_open';
      handBackKey = 'cd_hand_back_open';
    } else if (activePose === 2 || activePose === 3) {
      handFrontKey = 'cd_hand_front_point';
      handBackKey = 'cd_hand_back_open';
    }

    const bodyBob = Math.sin(state.idlePhase * 1.4) * 1.8 + (state.talkAmp > 0.04 ? Math.sin(state.idlePhase * 7) * state.talkAmp * 2.5 : 0);

    ctx.save();
    ctx.translate(state.x, state.y);
    const dreadFlip = -state.flipVisual;
    const cardScaleX = Math.abs(dreadFlip) < 0.09 ? (dreadFlip >= 0 ? 0.09 : -0.09) : dreadFlip;
    ctx.scale(cardScaleX * state.squashX * rigScale, state.squashY * rigScale);
    ctx.translate(-195, -454);

    this.drawPart(ctx, 'cd_boot_back', CAPDREAD_BOXES.boot_back);
    this.drawPart(ctx, 'cd_leg_back', CAPDREAD_BOXES.leg_back);
    this.drawPart(ctx, 'cd_boot_front', CAPDREAD_BOXES.boot_front);
    this.drawPart(ctx, 'cd_leg_front', CAPDREAD_BOXES.leg_front);
    this.drawPart(ctx, 'cd_pants', CAPDREAD_BOXES.pants, 0, bodyBob * 0.4);

    const hbBox = CAPDREAD_BOXES[handBackKey.replace('cd_', '')] || CAPDREAD_BOXES.hand_back_fist;
    this.drawPart(ctx, handBackKey, hbBox, 0, bodyBob);
    this.drawPart(ctx, 'cd_arm_back', CAPDREAD_BOXES.arm_back, 0, bodyBob);

    const headBob = bodyBob * 1.1;
    this.drawPart(ctx, 'cd_head', CAPDREAD_BOXES.head, 0, headBob);
    this.drawPart(ctx, eyesKey, CAPDREAD_BOXES[eyesKey.replace('cd_', '')], 0, headBob);
    this.drawPart(ctx, browsKey, CAPDREAD_BOXES[browsKey.replace('cd_', '')], 0, headBob);
    this.drawPart(ctx, 'cd_hat', CAPDREAD_BOXES.hat, 0, headBob);

    this.drawPart(ctx, 'cd_torso', CAPDREAD_BOXES.torso, 0, bodyBob);
    this.drawPart(ctx, 'cd_beard', CAPDREAD_BOXES.beard, 0, headBob + (state.talkAmp > 0.05 ? Math.abs(Math.sin(state.idlePhase * 10)) * 2.5 : 0));

    const hfBox = CAPDREAD_BOXES[handFrontKey.replace('cd_', '')] || CAPDREAD_BOXES.hand_front_fist;
    this.drawPart(ctx, handFrontKey, hfBox, 0, bodyBob);
    this.drawPart(ctx, 'cd_arm_front', CAPDREAD_BOXES.arm_front, 0, bodyBob);

    ctx.restore();
  }

  private renderNihongoRig(ctx: CanvasRenderingContext2D, state: PuppetAnimState): void {
    const normScale = state.scale;
    const rigScale = 0.94 * normScale;

    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.fillStyle = 'rgba(12, 9, 8, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 62 * normScale, 10 * normScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const bodyBob = Math.sin(state.idlePhase * 1.6) * 2.0 + (state.talkAmp > 0.04 ? Math.sin(state.idlePhase * 8) * state.talkAmp * 2.8 : 0);
    let eyesKey = 'ni_eyes_normal';
    if (state.blinkAmount > 0.55) {
      eyesKey = 'ni_eyes_closed';
    } else if (state.poseIndex === 1) {
      eyesKey = 'ni_eyes_squint';
    }
    const browsKey = state.poseIndex === 1 ? 'ni_brows_angry' : 'ni_brows_normal';
    const handKey = state.talkAmp > 0.05 || state.poseIndex >= 2 ? 'ni_hand_front_open' : 'ni_hand_front_fist';

    ctx.save();
    ctx.translate(state.x, state.y);
    const cardScaleX = Math.abs(state.flipVisual) < 0.09 ? (state.flipVisual >= 0 ? 0.09 : -0.09) : state.flipVisual;
    ctx.scale(cardScaleX * state.squashX * rigScale, state.squashY * rigScale);
    ctx.translate(-168, -368);

    this.drawPart(ctx, 'ni_shoe_front', NIHONGO_BOXES.shoe_back, 0, 0, 0, true);
    this.drawPart(ctx, 'ni_leg_back', NIHONGO_BOXES.leg_back, 0, 0, 0, true);
    this.drawPart(ctx, 'ni_shoe_front', NIHONGO_BOXES.shoe_front, 0, 0, 0, true);
    this.drawPart(ctx, 'ni_leg_front', NIHONGO_BOXES.leg_front, 0, 0, 0, true);
    this.drawPart(ctx, 'ni_arm_back', NIHONGO_BOXES.arm_back, 0, bodyBob * 0.8, 0, true);
    this.drawPart(ctx, 'ni_torso', NIHONGO_BOXES.torso, 0, bodyBob, 0, true);

    const headBob = bodyBob * 1.15;
    this.drawPart(ctx, 'ni_head', NIHONGO_BOXES.head, 0, headBob, 0, true);
    this.drawPart(ctx, eyesKey, NIHONGO_BOXES[eyesKey.replace('ni_', '')], 0, headBob, 0, false);
    this.drawPart(ctx, browsKey, NIHONGO_BOXES[browsKey.replace('ni_', '')], 0, headBob, 0, false);
    this.drawPart(ctx, 'ni_headband', NIHONGO_BOXES.headband, 0, headBob, 0, true);

    this.drawPart(ctx, 'ni_broom_katana', NIHONGO_BOXES.broom_katana, 0, bodyBob * 0.9, 0, true);
    this.drawPart(ctx, 'ni_arm_front', NIHONGO_BOXES.arm_front, 0, bodyBob, 0, true);
    this.drawPart(ctx, handKey, NIHONGO_BOXES[handKey.replace('ni_', '')], 0, bodyBob, 0, true);

    ctx.restore();
  }

  private renderABabyRig(ctx: CanvasRenderingContext2D, state: PuppetAnimState): void {
    const normScale = state.scale;
    const rigScale = 0.96 * normScale;

    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.fillStyle = 'rgba(12, 9, 8, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 74 * normScale, 11 * normScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const bodyBob = Math.sin(state.idlePhase * 1.5) * 2.2 + (state.talkAmp > 0.04 ? Math.sin(state.idlePhase * 7) * state.talkAmp * 2.8 : 0);
    const eyesKey = state.poseIndex === 2 || state.talkAmp > 0.06 ? 'ab_eyes_angry' : 'ab_eyes_normal';

    ctx.save();
    ctx.translate(state.x, state.y);
    const cardScaleX = Math.abs(state.flipVisual) < 0.09 ? (state.flipVisual >= 0 ? 0.09 : -0.09) : state.flipVisual;
    ctx.scale(cardScaleX * state.squashX * rigScale, state.squashY * rigScale);
    ctx.translate(-168, -306);

    this.drawPart(ctx, 'ab_arm_back', ABABY_BOXES.arm_back, 0, bodyBob * 0.5, 0, true);
    this.drawPart(ctx, 'ab_legs_diaper', ABABY_BOXES.legs_diaper, 0, bodyBob * 0.7, 0, true);
    this.drawPart(ctx, 'ab_torso', ABABY_BOXES.torso, 0, bodyBob, 0, true);
    this.drawPart(ctx, 'ab_arm_front', ABABY_BOXES.arm_front, 0, bodyBob * 0.5, 0, true);

    const headBob = bodyBob * 1.15;
    this.drawPart(ctx, 'ab_head', ABABY_BOXES.head, 0, headBob, 0, true);
    this.drawPart(ctx, eyesKey, ABABY_BOXES[eyesKey.replace('ab_', '')], 0, headBob, 0, false);
    this.drawPart(ctx, 'ab_bonnet', ABABY_BOXES.bonnet, 0, headBob, 0, true);

    ctx.restore();
  }

  private renderVentriloquistRig(ctx: CanvasRenderingContext2D, state: PuppetAnimState): void {
    const normScale = state.scale;
    const rigScale = 0.95 * normScale;

    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.fillStyle = 'rgba(12, 9, 8, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 64 * normScale, 10 * normScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const bodyBob = Math.sin(state.idlePhase * 1.3) * 1.6;
    const dummyBob = state.talkAmp > 0.04 ? Math.sin(state.idlePhase * 10) * state.talkAmp * 6.0 : Math.sin(state.idlePhase * 2.4) * 2.2;
    const dummyRot = state.talkAmp > 0.04 ? Math.sin(state.idlePhase * 8) * state.talkAmp * 0.08 : 0;

    ctx.save();
    ctx.translate(state.x, state.y);
    const cardScaleX = Math.abs(state.flipVisual) < 0.09 ? (state.flipVisual >= 0 ? 0.09 : -0.09) : state.flipVisual;
    ctx.scale(cardScaleX * state.squashX * rigScale, state.squashY * rigScale);
    ctx.translate(-164, -386);

    this.drawPart(ctx, 'vt_shoes', VENTRILO_BOXES.shoes, 0, 0, 0, true);
    this.drawPart(ctx, 'vt_legs', VENTRILO_BOXES.legs, 0, 0, 0, true);
    this.drawPart(ctx, 'vt_arm_back', VENTRILO_BOXES.arm_back, 0, bodyBob, 0, true);
    this.drawPart(ctx, 'vt_torso', VENTRILO_BOXES.torso, 0, bodyBob, 0, true);
    this.drawPart(ctx, 'vt_head_jaw', VENTRILO_BOXES.head_jaw, 0, bodyBob * 1.1, 0, true);
    this.drawPart(ctx, 'vt_eyes_normal', VENTRILO_BOXES.eyes_normal, 0, bodyBob * 1.1, 0, false);
    this.drawPart(ctx, 'vt_arm_front', VENTRILO_BOXES.arm_front, 0, bodyBob + dummyBob * 0.3, 0, true);
    this.drawPart(ctx, 'vt_dummy_rapoleon', VENTRILO_BOXES.dummy_rapoleon, 0, bodyBob + dummyBob, dummyRot, true);

    ctx.restore();
  }

  private renderTrollRig(ctx: CanvasRenderingContext2D, state: PuppetAnimState): void {
    const normScale = state.scale;
    const rigScale = 0.98 * normScale;

    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.fillStyle = 'rgba(12, 9, 8, 0.38)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 76 * normScale, 12 * normScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const bodyBob = Math.sin(state.idlePhase * 1.4) * 2.4;
    const clubRot = Math.sin(state.idlePhase * 1.8) * 0.045;

    ctx.save();
    ctx.translate(state.x, state.y);
    const cardScaleX = Math.abs(state.flipVisual) < 0.09 ? (state.flipVisual >= 0 ? 0.09 : -0.09) : state.flipVisual;
    ctx.scale(cardScaleX * state.squashX * rigScale, state.squashY * rigScale);
    ctx.translate(-165, -372);

    this.drawPart(ctx, 'tr_arm_back', TROLL_BOXES.arm_back, 0, bodyBob * 0.8, -clubRot * 0.4, true);
    this.drawPart(ctx, 'tr_legs_feet', TROLL_BOXES.legs_feet, 0, 0, 0, true);
    this.drawPart(ctx, 'tr_torso_tunic', TROLL_BOXES.torso_tunic, 0, bodyBob, 0, true);
    this.drawPart(ctx, 'tr_head_jaw', TROLL_BOXES.head_jaw, 0, bodyBob * 1.2, clubRot * 0.25, true);
    this.drawPart(ctx, 'tr_eyes', TROLL_BOXES.eyes, 0, bodyBob * 1.25, 0, true);
    this.drawPart(ctx, 'tr_arm_front_club', TROLL_BOXES.arm_front_club, 0, bodyBob * 0.9, clubRot, true);

    ctx.restore();
  }
}
