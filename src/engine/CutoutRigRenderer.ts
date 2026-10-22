/**
 * MoonStorm Studios - Smoothface's Epic (Codename: Sparkle)
 * 60 FPS Multi-Part Hand-Drawn Paper Cut-Out Skeletal & Emotion Renderer (src/engine/CutoutRigRenderer.ts)
 *
 * Implements:
 * 1. Authentic 9-Layer Hand-Drawn Paper Cut-Out Mr. Smoothface Rig (`public/assets/rigs/smoothface/`):
 *    - Built from standalone ONE-BY-ONE hand-drawn construction-paper cutouts (`shoes.png`, `pants.png`,
 *      `leg_l.png`, `leg_r.png`, `head.png`, `eyes.png`, `brows.png`, `body.png`, `arm.png`, `hand.png`,
 *      plus held cutout props `prop_magnifier.png` and `prop_wrench.png`) calibrated to Jose David Aguilar's
 *      exact 2010 `smoothface-cutout003.psd` layer coordinates.
 * 2. Separate Animated Emotion Cut-Out Sprites (`emotion_anger.png`, `emotion_lightning.png`,
 *    `emotion_shock.png`, `emotion_question.png`, `emotion_idea.png`, `emotion_sweat.png`) that pop in
 *    with spring physics, bob, tilt, and animate independently above Smoothface and NPCs!
 * 3. Multi-Part Hand-Drawn Cut-Out NPCs (`cap_dread`, `nihongo`, `a_baby`, `ventriloquist`) with
 *    articulated multi-pose bodies, waist pivots, and separate animated Emotion Cut-Outs at 60 FPS.
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
  poseIndex: number;       // 0: Idle, 1..2: Walk, 3: Talk, 4: Inspect(?), 5: Tinker(Idea), 6: Rage(Anger+Bolt), 7: Laugh, 8: Shock(!!)
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
    // 1. Mr. Smoothface standalone 1-by-1 hand-drawn PSD cutout layers
    const sfParts = [
      'shoes',
      'pants',
      'leg_l',
      'leg_r',
      'head',
      'eyes',
      'eyes_squint',
      'eyes_wide',
      'brows',
      'brows_raised',
      'brows_furious',
      'body',
      'arm',
      'hand',
      'movs',
      'emotion_anger',
      'emotion_lightning',
      'emotion_shock',
      'emotion_question',
      'emotion_idea',
      'emotion_sweat',
      'prop_magnifier',
      'prop_wrench',
    ];
    for (const part of sfParts) {
      this.loadImg(`sf_${part}`, `assets/rigs/smoothface/${part}.png`);
    }
    this.loadImg('smoothface_master', 'assets/characters/smoothface.png');
    for (let i = 0; i < 8; i++) {
      this.loadImg(`smoothface_pose_${i}`, `assets/characters/smoothface_pose_${i}.png`);
    }

    // 2. NPC masters, poses, and unclipped hand-drawn cutout body parts
    const npcs: CharacterId[] = ['cap_dread', 'nihongo', 'a_baby', 'ventriloquist'];
    for (const c of npcs) {
      this.loadImg(`${c}_master`, `assets/characters/${c}.png`);
      for (let i = 0; i < 4; i++) {
        this.loadImg(`${c}_pose_${i}`, `assets/characters/${c}_pose_${i}.png`);
      }
    }

    const npcParts: Record<string, string[]> = {
      cap_dread: ['hat_hair', 'head', 'torso', 'arm_r', 'arm_l', 'legs'],
      nihongo: ['hat_hair', 'head', 'torso', 'arm_r', 'arm_l', 'legs'],
      a_baby: ['head', 'jaw', 'torso', 'arm_r', 'arm_l', 'legs'],
      ventriloquist: ['head', 'torso_legs', 'arm_l', 'dummy_head', 'dummy_jaw', 'dummy_body', 'dummy_arms'],
    };
    for (const [slug, parts] of Object.entries(npcParts)) {
      for (const p of parts) {
        this.loadImg(`${slug}_part_${p}`, `assets/rigs/${slug}/${p}.png`);
      }
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
      fidgetTimer: 2.2 + Math.random() * 2.5,
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
    this.triggerSquash(state, 1.14, 0.88);
  }

  public updatePuppetState(state: PuppetAnimState, dt: number, onPaperFlip?: () => void): void {
    state.idlePhase += dt * 3.2;
    if (state.isWalking) {
      state.walkPhase += dt * 11.5;
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

    // Autonomous living fidget state machine when not locked in an explicit pose
    state.fidgetTimer -= dt;
    if (state.fidgetTimer <= 0) {
      if (state.id === 'smoothface') {
        const pool = [0, 0, 0, 3, 4, 6];
        const nextPose = pool[Math.floor(Math.random() * pool.length)];
        if (nextPose !== state.autoPose) {
          state.emotionPop = 0.1;
        }
        state.autoPose = nextPose;
        state.fidgetTimer = state.autoPose === 0 ? 3.0 + Math.random() * 2.2 : 1.5 + Math.random() * 0.9;
      } else {
        const nextPool = [0, 0, 1, 2, 3];
        state.autoPose = nextPool[Math.floor(Math.random() * nextPool.length)];
        state.fidgetTimer = state.autoPose === 0 ? 2.4 + Math.random() * 2.0 : 1.5 + Math.random() * 1.4;
      }
      this.triggerSquash(state, 1.05, 0.96);
    }

    // Smooth elastic spring pop-in for separate emotion cutouts
    state.emotionPop += (1.0 - state.emotionPop) * Math.min(1, dt * 14);

    // Smooth 2.5D Paper Card-Turn Flip interpolation
    const prevSign = Math.sign(state.flipVisual);
    const diff = state.facing - state.flipVisual;
    state.flipVisual += diff * Math.min(1, dt * 15);
    if (Math.abs(diff) < 0.02) state.flipVisual = state.facing;
    if (prevSign !== 0 && Math.sign(state.flipVisual) !== prevSign && onPaperFlip) {
      onPaperFlip();
    }

    // Elastic squash-and-stretch recovery
    state.squashX += (1.0 - state.squashX) * Math.min(1, dt * 12);
    state.squashY += (1.0 - state.squashY) * Math.min(1, dt * 12);

    // Natural eye blink timer
    state.blinkTimer -= dt;
    if (state.blinkTimer <= 0) {
      state.blinkTimer = 2.4 + Math.random() * 3.2;
    }
    if (state.blinkTimer < 0.14) {
      const t = state.blinkTimer / 0.14;
      state.blinkAmount = Math.sin(t * Math.PI);
    } else {
      state.blinkAmount = 0;
    }
  }

  public triggerSquash(state: PuppetAnimState, sx = 1.16, sy = 0.86): void {
    state.squashX = sx;
    state.squashY = sy;
  }

  /**
   * Renders a Separate Hand-Drawn Paper Cut-Out Emotion Sprite (`emotion_*.png`) floating
   * above a character's head with elastic pop-in, independent rotation, and secondary FX!
   */
  private renderEmotionCutout(
    ctx: CanvasRenderingContext2D,
    emotion: EmotionCutoutType,
    x: number,
    y: number,
    phase: number,
    popScale: number,
    includeLightning = false
  ): void {
    const emoImg = this.getImg(`sf_emotion_${emotion}`);
    if (!emoImg) return;

    const elastic = popScale < 1 ? 1 + Math.sin(popScale * Math.PI) * 0.24 : 1.0;
    const bobY = Math.sin(phase * 2.6) * 7;
    const tilt = emotion === 'anger'
      ? Math.sin(phase * 4.5) * 0.12
      : emotion === 'question'
        ? Math.sin(phase * 2.8) * 0.16
        : emotion === 'shock'
          ? Math.sin(phase * 16) * 0.09
          : Math.sin(phase * 2.2) * 0.08;

    const pulseX = 1.0 + Math.sin(phase * 3.8) * 0.06;
    const pulseY = 1.0 - Math.sin(phase * 3.8) * 0.06;

    ctx.save();
    ctx.translate(x, y + bobY);

    // Paper cutout drop shadow
    ctx.save();
    ctx.translate(6, 8);
    ctx.rotate(tilt);
    ctx.scale(elastic * pulseX, elastic * pulseY);
    ctx.globalAlpha = 0.28;
    ctx.drawImage(emoImg, -emoImg.naturalWidth * 0.5, -emoImg.naturalHeight * 0.5);
    ctx.restore();

    // Main separate emotion cutout sprite
    ctx.save();
    ctx.rotate(tilt);
    ctx.scale(elastic * pulseX, elastic * pulseY);
    ctx.drawImage(emoImg, -emoImg.naturalWidth * 0.5, -emoImg.naturalHeight * 0.5);
    ctx.restore();

    // If furious/grumpy, also pop out the separate yellow Lightning Bolt cutout (`emotion_lightning.png`)!
    if (includeLightning) {
      const boltImg = this.getImg('sf_emotion_lightning');
      if (boltImg) {
        const boltFlash = 0.75 + 0.25 * Math.sin(phase * 14);
        const boltJitterX = Math.cos(phase * 19) * 4;
        const boltJitterY = Math.sin(phase * 17) * 4;
        ctx.save();
        ctx.translate(-34 + boltJitterX, 42 + boltJitterY);
        ctx.rotate(-0.25 + Math.sin(phase * 10) * 0.14);
        ctx.scale(elastic * boltFlash * 0.82, elastic * boltFlash * 0.82);
        ctx.drawImage(boltImg, -boltImg.naturalWidth * 0.5, -boltImg.naturalHeight * 0.5);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  /**
   * Renders Mr. Smoothface using his cohesive Hand-Drawn 2-Arm, 2-Hand 8-Pose Cut-Out Sheet
   * (`smoothface_pose_0..7.png`) with 60 FPS stride/talk articulation, 2.5D paper card-turn flip,
   * flush foot-on-floor anchoring, and Separate Animated Paper Cut-Out Emotions!
   */
  public renderSmoothfaceRig(ctx: CanvasRenderingContext2D, state: PuppetAnimState): void {
    // 1. Ground contact shadow directly underneath Smoothface's boots at (state.x, state.y)
    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.fillStyle = 'rgba(6, 4, 10, 0.50)';
    ctx.beginPath();
    const shadowW = 92 * state.scale * (0.85 + 0.15 * Math.abs(state.flipVisual));
    ctx.ellipse(0, 0, shadowW, 18 * state.scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Determine active 2-arm, 2-hand pose (0..7)
    let activePose = state.poseIndex;
    if (state.isWalking) {
      activePose = Math.sin(state.walkPhase) >= 0 ? 1 : 2;
    } else if (state.grumpyMode && activePose === 0) {
      activePose = 6; // Furious thundercloud rage (2 clenched fists)
    } else if (state.talkAmp > 0.05 && activePose === 0) {
      activePose = 3; // Supervillain speech gesture (2 arms, open hand)
    } else if (activePose === 0 && state.poseTimer <= 0) {
      activePose = state.autoPose;
    }

    const poseSlot = activePose === 8 ? 6 : Math.max(0, Math.min(7, activePose));
    const poseImg =
      this.getImg(`smoothface_pose_${poseSlot}`) ||
      this.getImg('smoothface_pose_0') ||
      this.getImg('smoothface_master');
    if (!poseImg) return;

    const walkSin = state.isWalking ? Math.sin(state.walkPhase * 2) : 0;
    const walkBob = state.isWalking
      ? Math.abs(walkSin) * -10
      : activePose === 6
        ? Math.abs(Math.sin(state.idlePhase * 6.5)) * -6
        : activePose === 7
          ? Math.abs(Math.sin(state.idlePhase * 4.5)) * -8
          : 0;

    const walkTilt = state.isWalking
      ? Math.sin(state.walkPhase) * 0.035
      : activePose === 3 || state.talkAmp > 0.04
        ? Math.sin(state.idlePhase * 4.5) * state.talkAmp * 0.03
        : Math.sin(state.idlePhase * 1.1) * 0.012;

    const rageJitterX = activePose === 6 ? Math.sin(state.idlePhase * 22) * 2.5 : 0;

    ctx.save();
    ctx.translate(state.x + rageJitterX, state.y + walkBob);
    ctx.rotate(walkTilt);

    const cardScaleX =
      Math.abs(state.flipVisual) < 0.09 ? (state.flipVisual >= 0 ? 0.09 : -0.09) : state.flipVisual;
    const breathScaleY = 1.0 + Math.sin(state.idlePhase * 1.4) * 0.014 + state.talkAmp * 0.026;
    const breathScaleX = 1.0 - Math.sin(state.idlePhase * 1.4) * 0.007 + state.talkAmp * 0.012;

    ctx.scale(
      cardScaleX * state.squashX * breathScaleX * state.scale,
      state.squashY * breathScaleY * state.scale
    );

    // Draw cardboard thickness edge during 2.5D Paper Card-Turn flip
    if (Math.abs(state.flipVisual) < 0.42) {
      ctx.fillStyle = '#f5ebd1';
      ctx.fillRect(-12, -460, 24, 460);
    }

    const w = poseImg.naturalWidth;
    const h = poseImg.naturalHeight;
    // Soles of boots are flush at y = h - 2 on the 520px normalized canvas
    ctx.drawImage(poseImg, -w * 0.5, -h + 2, w, h);

    // Render separate animated Paper Cut-Out Emotion floating above Smoothface's bald head
    // (Skip for Pose 6 since Pose 6 has the giant storm-cloud & lightning bolts drawn directly in the art)
    if (poseSlot !== 6) {
      let activeEmotion: EmotionCutoutType = 'anger';
      let showLightning = false;
      if (activePose === 4) {
        activeEmotion = 'question';
      } else if (activePose === 5 || activePose === 7) {
        activeEmotion = 'idea';
      } else if (activePose === 8) {
        activeEmotion = 'shock';
      } else if (state.grumpyMode) {
        activeEmotion = 'anger';
        showLightning = true;
      } else {
        activeEmotion = 'anger';
      }

      ctx.save();
      ctx.scale(0.68, 0.68);
      this.renderEmotionCutout(
        ctx,
        activeEmotion,
        18,
        -715,
        state.idlePhase,
        state.emotionPop,
        showLightning
      );
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Renders any NPC (Captain Dread, Nihongo Nohondes, A Baby, The Ventriloquist & Dummy)
   * using their normalized 520px hand-drawn 4-pose sheets with flush foot-on-floor anchoring
   * and separate Emotion Cut-Outs at 60 FPS!
   */
  public renderNpcPuppet(ctx: CanvasRenderingContext2D, state: PuppetAnimState): void {
    let activePose = state.poseIndex;
    if (state.talkAmp > 0.05 && state.poseTimer <= 0) {
      activePose = Math.sin(state.idlePhase * 1.9) > 0 ? 1 : 2;
    } else if (activePose === 0 && state.poseTimer <= 0 && state.id !== 'nihongo') {
      activePose = state.autoPose;
    }

    const poseImg =
      this.getImg(`${state.id}_pose_${activePose}`) ||
      this.getImg(`${state.id}_pose_0`) ||
      this.getImg(`${state.id}_master`);

    // Ground contact shadow directly underneath the NPC's feet at (state.x, state.y)
    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.fillStyle = 'rgba(6, 4, 10, 0.50)';
    ctx.beginPath();
    const shadowRadiusX = state.id === 'a_baby' ? 115 * state.scale : 94 * state.scale;
    ctx.ellipse(0, 0, shadowRadiusX, 18 * state.scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (!poseImg) return;

    ctx.save();
    ctx.translate(state.x, state.y);

    const cardScaleX =
      Math.abs(state.flipVisual) < 0.09 ? (state.flipVisual >= 0 ? 0.09 : -0.09) : state.flipVisual;
    const breathScaleY = 1.0 + Math.sin(state.idlePhase * 1.2) * 0.015 + state.talkAmp * 0.028;
    const breathScaleX = 1.0 - Math.sin(state.idlePhase * 1.2) * 0.008 + state.talkAmp * 0.014;

    let charBounceY = 0;
    let charTilt = Math.sin(state.idlePhase * 0.8) * 0.012;
    if (state.id === 'nihongo' && state.poseIndex === 0) {
      charBounceY = Math.abs(Math.sin(state.idlePhase * 4.2)) * -10;
      charTilt = Math.sin(state.idlePhase * 4.2) * 0.05;
    } else if (state.id === 'nihongo' && state.poseIndex === 1) {
      charBounceY = Math.abs(Math.sin(state.idlePhase * 9)) * -4;
      charTilt = Math.cos(state.idlePhase * 8) * 0.035;
    } else if (state.id === 'a_baby' && activePose === 2) {
      charBounceY = Math.abs(Math.sin(state.idlePhase * 3.5)) * -7;
    } else if (state.talkAmp > 0.04) {
      charBounceY = Math.abs(Math.sin(state.idlePhase * 5)) * -state.talkAmp * 5;
      charTilt += Math.sin(state.idlePhase * 5) * state.talkAmp * 0.03;
    }

    ctx.translate(0, charBounceY);
    ctx.rotate(charTilt);
    ctx.scale(
      cardScaleX * state.squashX * breathScaleX * state.scale,
      state.squashY * breathScaleY * state.scale
    );

    const w = poseImg.naturalWidth;
    const h = poseImg.naturalHeight;
    // Draw full un-sliced character pose with soles flush at y = 0!
    ctx.drawImage(poseImg, -w * 0.5, -h + 2, w, h);

    // Separate Animated Paper Cut-Out Emotions & Secondary FX for NPCs!
    if (state.id === 'cap_dread') {
      for (let i = 0; i < 3; i++) {
        const t = (state.idlePhase * 0.45 + i * 0.33) % 1;
        const sx = -58 - t * 28 + Math.sin(t * 6 + i) * 8;
        const sy = -335 - t * 68;
        const r = 6 + t * 15;
        ctx.strokeStyle = `rgba(235, 228, 215, ${(1 - t) * 0.6})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (activePose === 2 || activePose === 3) {
        ctx.save();
        ctx.scale(0.65, 0.65);
        this.renderEmotionCutout(
          ctx,
          activePose === 3 ? 'shock' : 'anger',
          65,
          -740,
          state.idlePhase,
          state.emotionPop,
          false
        );
        ctx.restore();
      }
    } else if (state.id === 'nihongo') {
      if (state.poseIndex === 0 || state.poseIndex === 1) {
        ctx.save();
        ctx.scale(0.68, 0.68);
        this.renderEmotionCutout(
          ctx,
          state.poseIndex === 1 ? 'shock' : 'sweat',
          58,
          -720,
          state.idlePhase,
          state.emotionPop,
          false
        );
        ctx.restore();
      } else if (state.poseIndex === 2) {
        ctx.save();
        ctx.scale(0.65, 0.65);
        this.renderEmotionCutout(ctx, 'idea', 55, -720, state.idlePhase, state.emotionPop, false);
        ctx.restore();
      }
    } else if (state.id === 'a_baby' && (activePose === 2 || state.talkAmp > 0.08)) {
      ctx.save();
      ctx.scale(0.62, 0.62);
      this.renderEmotionCutout(ctx, 'anger', 55, -690, state.idlePhase, state.emotionPop, false);
      ctx.restore();
    } else if (state.id === 'ventriloquist') {
      if (activePose === 1 || state.talkAmp > 0.05) {
        for (let i = 0; i < 2; i++) {
          const t = (state.idlePhase * 0.6 + i * 0.5) % 1;
          const nx = -85 - t * 35;
          const ny = -350 - t * 55;
          ctx.fillStyle = `rgba(255, 215, 90, ${1 - t})`;
          ctx.font = 'bold 24px Georgia, serif';
          ctx.fillText(i % 2 === 0 ? '♪' : '♫', nx, ny);
        }
      }
      if (activePose === 2 || state.poseIndex === 2) {
        const pulse = 0.5 + 0.5 * Math.sin(state.idlePhase * 7);
        const grad = ctx.createRadialGradient(-85, -395, 4, -85, -395, 72 * pulse + 24);
        grad.addColorStop(0, `rgba(255, 50, 50, ${0.9 * pulse})`);
        grad.addColorStop(0.5, `rgba(255, 20, 20, ${0.4 * pulse})`);
        grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(-85, -395, 90, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
