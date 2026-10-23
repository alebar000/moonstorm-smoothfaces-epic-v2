/**
 * MoonStorm Studios - Smoothface's Epic (Codename: Sparkle)
 * Multi-Part Hand-Drawn Paper Cut-Out Skeletal & Emotion Renderer (src/engine/CutoutRigRenderer.ts)
 *
 * Renders Mr. Smoothface and Captain Dread directly from their approved multi-part cutout pieces
 * in `art/approved/smoothface/` (27 pieces) and `art/approved/capdread/` (22 pieces) using the
 * calibrated coordinates from `characters/smoothface/rig.json` and `characters/capdread/rig.json`.
 */

export type CharacterId = 'smoothface' | 'cap_dread' | 'nihongo' | 'a_baby' | 'ventriloquist';
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
    rot = 0
  ): void {
    const im = this.getImg(imgKey);
    if (!im) return;
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
  }

  /**
   * Renders Mr. Smoothface directly from his 27 approved cutout pieces (`art/approved/smoothface/`).
   * Proportioned to match Aguilar's `GUImu003.jpg` side-by-side comparison with Captain Dread.
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

    // Default hands are closed fists (matching composite_preview.png); only front hand points on inspect/grab
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

    // Back leg & shoe stride
    const backStrideX = walkSin * -10;
    const backLiftY = Math.max(0, -walkCos) * -6;
    this.drawPart(ctx, 'sf_shoe_back', SMOOTHFACE_BOXES.shoe_back, backStrideX, backLiftY);
    this.drawPart(ctx, 'sf_leg_back', SMOOTHFACE_BOXES.leg_back, backStrideX * 0.6, backLiftY * 0.5);

    // Front leg & shoe stride
    const frontStrideX = walkSin * 10;
    const frontLiftY = Math.max(0, walkCos) * -6;
    this.drawPart(ctx, 'sf_shoe_front', SMOOTHFACE_BOXES.shoe_front, frontStrideX, frontLiftY);
    this.drawPart(ctx, 'sf_leg_front', SMOOTHFACE_BOXES.leg_front, frontStrideX * 0.6, frontLiftY * 0.5);

    // Pants
    this.drawPart(ctx, 'sf_pants', SMOOTHFACE_BOXES.pants, 0, bodyBob * 0.4);

    // Back arm & back hand
    const hbBox = SMOOTHFACE_BOXES[handBackKey.replace('sf_', '')] || SMOOTHFACE_BOXES.hand_back_fist;
    this.drawPart(ctx, handBackKey, hbBox, 0, bodyBob - armSwing * 8, -armSwing * 0.2);
    this.drawPart(ctx, 'sf_arm_back', SMOOTHFACE_BOXES.arm_back, 0, bodyBob - armSwing * 8, -armSwing * 0.2);

    // Head, eyes, brows (behind high coat collar per canon!)
    const headBob = bodyBob * 1.1;
    this.drawPart(ctx, 'sf_head', SMOOTHFACE_BOXES.head, 0, headBob);
    this.drawPart(ctx, eyesKey, SMOOTHFACE_BOXES[eyesKey.replace('sf_', '')], 0, headBob);
    this.drawPart(ctx, browsKey, SMOOTHFACE_BOXES[browsKey.replace('sf_', '')], 0, headBob);

    // Torso (high collar overlaps lower face so mouth is permanently covered!)
    this.drawPart(ctx, 'sf_torso', SMOOTHFACE_BOXES.torso, 0, bodyBob);

    // Front hand & front arm
    const hfBox = SMOOTHFACE_BOXES[handFrontKey.replace('sf_', '')] || SMOOTHFACE_BOXES.hand_front_fist;
    this.drawPart(ctx, handFrontKey, hfBox, 0, bodyBob + armSwing * 8, armSwing * 0.2);
    if (activePose === 4) {
      const mag = this.getImg('sf_prop_magnifier');
      if (mag) {
        ctx.drawImage(mag, 258, 198 + bodyBob, 52, 56);
      }
    }
    this.drawPart(ctx, 'sf_arm_front', SMOOTHFACE_BOXES.arm_front, 0, bodyBob + armSwing * 8, armSwing * 0.2);

    // Floating emotion cutout badge above Smoothface's head (only on explicit action poses)
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
   * Renders Captain Dread directly from his 22 approved cutout pieces (`art/approved/capdread/`).
   */
  public renderNpcPuppet(ctx: CanvasRenderingContext2D, state: PuppetAnimState): void {
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
}
