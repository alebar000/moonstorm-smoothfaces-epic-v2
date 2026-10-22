/**
 * MoonStorm Studios - Smoothface's Epic (Codename: Sparkle)
 * Real-Time 60 FPS Multi-Layer Paper Cut-Out Puppet Theatre Intro Engine (src/engine/IntroPuppetTheatre.ts)
 *
 * Replaces static storyboard slides with a live 8-Scene 60 FPS Paper Cut-Out Puppet Show:
 * - Articulated puppets (Mr. Smoothface, Captain Dread, Nihongo Nohondes, A Baby, Ventriloquist & Dummy, Dr. Morgan Stache)
 * - Hanging theatrical paper backdrops, swinging spotlights, flapping paper pigeons, parallax ocean waves,
 *   unfolding Blackspit Island map with animated trail, and the explosive Engine Room pedal snap ("BAM!!")!
 */

import { AudioVoiceEngine, VoiceProfileId } from './AudioVoiceEngine';
import { CutoutRigRenderer, PuppetAnimState } from './CutoutRigRenderer';

export interface IntroSceneSpec {
  id: number;
  badge: string;
  speaker: string;
  voice: VoiceProfileId;
  durationSec: number;
  text: string;
}

export const INTRO_SCENES_8: IntroSceneSpec[] = [
  {
    id: 0,
    badge: 'SCENE I OF VIII: THE CELEBRITY BARBER OF LONDON',
    speaker: 'THE STORYTELLER',
    voice: 'ventriloquist',
    durationSec: 6.5,
    text: 'In Victorian London, Dr. Morgan Stache became a global superstar for his miraculous, shimmering golden moustache. Admirers wept, pigeons saluted, and barbershops worshipped his whiskers!',
  },
  {
    id: 1,
    badge: 'SCENE II OF VIII: THE HAIRLESS TWIN BROTHER',
    speaker: 'RUPERT "MR. SMOOTHFACE" STACHE',
    voice: 'smoothface',
    durationSec: 6.5,
    text: 'Meanwhile, his twin brother Rupert stood in the stage shadows with a tragic genetic curse: not a single eyebrow hair, beard stubble, or whisker! The cruel streets mocked him as... Mr. Smoothface.',
  },
  {
    id: 2,
    badge: 'SCENE III OF VIII: THE SUPERVILLAIN VOW',
    speaker: 'MR. SMOOTHFACE',
    voice: 'smoothface',
    durationSec: 6.5,
    text: '"If I cannot grow a moustache, then NOBODY SHALL!" Drawing his dark coat collar over his chin, Rupert vowed to become the greatest supervillain the barbering world had ever feared!',
  },
  {
    id: 3,
    badge: 'SCENE IV OF VIII: THE MALEFIC APPLICATION',
    speaker: 'MR. SMOOTHFACE',
    voice: 'smoothface',
    durationSec: 6.5,
    text: 'A sinister courier pigeon delivered a crimson wax-sealed summons from the MGWDBTTGPnP: the Malefic Gentlemen Who Do Bad Things To Good People & Pigeons!',
  },
  {
    id: 4,
    badge: 'SCENE V OF VIII: DESTINATION BLACKSPIT ISLAND',
    speaker: 'THE STORYTELLER',
    voice: 'cap_dread',
    durationSec: 6.5,
    text: 'Unfolding the secret nautical chart of Blackspit Island, Rupert plotted his route from Port Machete past Ice Cream Peaks and Evil Deeds College to the Artificial Thundercano Hideout!',
  },
  {
    id: 5,
    badge: 'SCENE VI OF VIII: BOARDING THE SUBSTAMPEDE',
    speaker: 'CAPTAIN DREAD',
    voice: 'cap_dread',
    durationSec: 6.5,
    text: '"All aboard the Substampede, matey!" At foggy Port Machete pier, Rupert paid his last coins to Captain Dread for covert submarine passage across the shark-infested sea.',
  },
  {
    id: 6,
    badge: 'SCENE VII OF VIII: TWENTY THOUSAND LEAGUES OF PEDALING',
    speaker: 'NIHONGO NOHONDES',
    voice: 'nihongo',
    durationSec: 6.5,
    text: 'As the Substampede dove beneath the waves, Rupert discovered the awful truth: the entire pirate submarine was powered by a rusty stationary bicycle pedaled by one exhausted mechanic!',
  },
  {
    id: 7,
    badge: 'SCENE VIII OF VIII: CRISIS IN THE ENGINE ROOM - BAM!!',
    speaker: 'NIHONGO NOHONDES & SMOOTHFACE',
    voice: 'nihongo',
    durationSec: 7.0,
    text: 'Halfway to Blackspit Island, the rusty pedal chain strained to the limit and... BAM!! Sparks flew, alarms blared, and the engine ground to a halt! Now it is up to Mr. Smoothface to save his own voyage!',
  },
];

export class IntroPuppetTheatre {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private rigs: CutoutRigRenderer;
  private audio: AudioVoiceEngine;
  private images: Map<string, HTMLImageElement> = new Map();

  private currentScene = 0;
  private sceneTime = 0;
  private totalTime = 0;
  private isPlaying = true;
  private bamTriggeredInScene7 = false;

  // Articulated Stage Puppets
  private smoothface: PuppetAnimState;
  private capDread: PuppetAnimState;
  private nihongo: PuppetAnimState;
  private aBaby: PuppetAnimState;
  private ventrilo: PuppetAnimState;

  private onSceneChanged?: (sceneIdx: number) => void;
  private onComplete?: () => void;

  constructor(
    canvas: HTMLCanvasElement,
    rigs: CutoutRigRenderer,
    audio: AudioVoiceEngine,
    onSceneChanged?: (sceneIdx: number) => void,
    onComplete?: () => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.rigs = rigs;
    this.audio = audio;
    this.onSceneChanged = onSceneChanged;
    this.onComplete = onComplete;

    this.smoothface = this.rigs.createAnimState('smoothface', 480, 485, 0.58, 1);
    this.capDread = this.rigs.createAnimState('cap_dread', 280, 485, 0.58, 1);
    this.nihongo = this.rigs.createAnimState('nihongo', 320, 485, 0.58, 1);
    this.aBaby = this.rigs.createAnimState('a_baby', 620, 490, 0.56, -1);
    this.ventrilo = this.rigs.createAnimState('ventriloquist', 740, 485, 0.58, -1);

    this.preloadStageAssets();
  }

  private preloadStageAssets(): void {
    const list: Array<[string, string]> = [
      ['panel_1', 'assets/intro/panel_1_twins.png'],
      ['panel_2', 'assets/intro/panel_2_invitation.png'],
      ['panel_3', 'assets/intro/panel_3_boarding.png'],
      ['panel_4', 'assets/intro/panel_4_pedal_snap.png'],
      ['room_z1s3', 'assets/rooms/z1s3_shell.png'],
      ['room_z1s2', 'assets/rooms/z1s2_shell.png'],
      ['room_z1s1', 'assets/rooms/z1s1_shell.png'],
      ['title_hero', 'assets/ui/title_hero_bg.png'],
      ['island_map', 'assets/ui/blackspit_island_map.png'],
      ['dr_stache', 'assets/intro/dr_stache_cutout.png'],
      ['wax_letter', 'assets/ui/wax_letter_compass.png'],
      ['helm', 'assets/props/item_helm.png'],
      ['blueprint', 'assets/props/item_blueprint.png'],
      ['pedal_engine', 'assets/objects/obj_pedal_engine_main.png'],
      ['perpetual', 'assets/props/perpetual_machine_cutout.png'],
    ];
    for (const [k, src] of list) {
      const im = new Image();
      im.src = src;
      this.images.set(k, im);
    }
  }

  private getImg(key: string): HTMLImageElement | null {
    const im = this.images.get(key);
    return im && im.complete && im.naturalWidth > 0 ? im : null;
  }

  public startFromBeginning(): void {
    this.isPlaying = true;
    this.goToScene(0);
  }

  public setScene(idx: number): void {
    this.goToScene(idx);
  }

  public nextScene(): void {
    this.goToScene(this.currentScene + 1);
  }

  public prevScene(): void {
    this.goToScene(Math.max(0, this.currentScene - 1));
  }

  public togglePlayPause(): boolean {
    this.isPlaying = !this.isPlaying;
    return this.isPlaying;
  }

  public toggleAutoPlay(): boolean {
    return this.togglePlayPause();
  }

  public get autoPlay(): boolean {
    return this.isPlaying;
  }

  public set autoPlay(val: boolean) {
    this.isPlaying = val;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentSceneIndex(): number {
    return this.currentScene;
  }

  public getSceneProgress(): number {
    const spec = INTRO_SCENES_8[this.currentScene];
    return spec ? Math.min(1, this.sceneTime / spec.durationSec) : 0;
  }

  public getProgressRatio(): number {
    return this.getSceneProgress();
  }

  public goToScene(idx: number): void {
    if (idx < 0) idx = 0;
    if (idx >= INTRO_SCENES_8.length) {
      if (this.onComplete) this.onComplete();
      return;
    }
    this.currentScene = idx;
    this.sceneTime = 0;
    this.bamTriggeredInScene7 = false;
    this.configurePuppetsForScene(idx);
    if (this.onSceneChanged) {
      this.onSceneChanged(idx);
    }
    const spec = INTRO_SCENES_8[idx];
    if (spec) {
      this.audio.playVoicePhraseSample(spec.voice);
    }
  }

  private configurePuppetsForScene(idx: number): void {
    // Reset puppet states cleanly for each theatrical act
    this.smoothface.isWalking = false;
    this.smoothface.grumpyMode = false;
    this.smoothface.poseIndex = 0;

    if (idx === 0) {
      // Scene 1: Dr. Morgan Stache in spotlight, Smoothface peeking from right shadow
      this.smoothface.x = 760;
      this.smoothface.y = 490;
      this.smoothface.scale = 0.56;
      this.smoothface.facing = -1;
      this.smoothface.flipVisual = -1;
      this.smoothface.grumpyMode = true;
      this.smoothface.poseIndex = 6;
    } else if (idx === 1) {
      // Scene 2: Smoothface steps out from shadows shaking his fist with anger cloud & lightning
      this.smoothface.x = 720;
      this.smoothface.y = 490;
      this.smoothface.scale = 0.60;
      this.smoothface.facing = -1;
      this.smoothface.flipVisual = -1;
      this.smoothface.grumpyMode = true;
      this.smoothface.poseIndex = 6;
    } else if (idx === 2) {
      // Scene 3: Smoothface prowls across center stage & laughs maniacally
      this.smoothface.x = 260;
      this.smoothface.y = 492;
      this.smoothface.scale = 0.62;
      this.smoothface.facing = 1;
      this.smoothface.flipVisual = 1;
      this.smoothface.isWalking = true;
    } else if (idx === 3) {
      // Scene 4: Courier pigeon drops the Malefic Invitation into Smoothface's hands
      this.smoothface.x = 460;
      this.smoothface.y = 492;
      this.smoothface.scale = 0.60;
      this.smoothface.facing = 1;
      this.smoothface.flipVisual = 1;
      this.smoothface.poseIndex = 5;
    } else if (idx === 4) {
      // Scene 5: Smoothface inspects the giant Blackspit Island chart with his magnifying glass
      this.smoothface.x = 185;
      this.smoothface.y = 498;
      this.smoothface.scale = 0.58;
      this.smoothface.facing = 1;
      this.smoothface.flipVisual = 1;
      this.smoothface.poseIndex = 4;
    } else if (idx === 5) {
      // Scene 6: Captain Dread welcomes Smoothface aboard the Substampede at Port Machete
      this.capDread.x = 640;
      this.capDread.y = 490;
      this.capDread.scale = 0.58;
      this.capDread.facing = -1;
      this.capDread.flipVisual = -1;
      this.capDread.poseIndex = 1;

      this.smoothface.x = 200;
      this.smoothface.y = 492;
      this.smoothface.scale = 0.58;
      this.smoothface.facing = 1;
      this.smoothface.flipVisual = 1;
      this.smoothface.isWalking = true;
    } else if (idx === 6) {
      // Scene 7: Underwater submarine cutaway - Nihongo pedaling, A Baby & Ventriloquist in lounge
      this.nihongo.x = 260;
      this.nihongo.y = 492;
      this.nihongo.scale = 0.56;
      this.nihongo.facing = 1;
      this.nihongo.poseIndex = 0;

      this.aBaby.x = 540;
      this.aBaby.y = 495;
      this.aBaby.scale = 0.55;
      this.aBaby.facing = 1;

      this.ventrilo.x = 740;
      this.ventrilo.y = 492;
      this.ventrilo.scale = 0.57;
      this.ventrilo.facing = -1;
    } else if (idx === 7) {
      // Scene 8: Engine room pedal strain -> BAM!!
      this.nihongo.x = 340;
      this.nihongo.y = 492;
      this.nihongo.scale = 0.58;
      this.nihongo.facing = 1;
      this.nihongo.poseIndex = 0;

      this.smoothface.x = 690;
      this.smoothface.y = 492;
      this.smoothface.scale = 0.58;
      this.smoothface.facing = -1;
      this.smoothface.flipVisual = -1;
      this.smoothface.poseIndex = 0;
    }
  }

  public updateAndRender(dt: number): void {
    this.totalTime += dt;
    const spec = INTRO_SCENES_8[this.currentScene];
    if (!spec) return;

    if (this.isPlaying) {
      this.sceneTime += dt;
      if (this.sceneTime >= spec.durationSec) {
        if (this.currentScene < INTRO_SCENES_8.length - 1) {
          this.goToScene(this.currentScene + 1);
          return;
        } else {
          this.isPlaying = false;
          if (this.onComplete) this.onComplete();
          return;
        }
      }
    }

    const voiceAmp = this.audio.getVoiceAmplitude();
    const t = this.sceneTime;

    // Choreograph scene-specific puppet movement at 60 FPS!
    if (this.currentScene === 0) {
      this.smoothface.talkAmp = 0;
      this.rigs.updatePuppetState(this.smoothface, dt);
    } else if (this.currentScene === 1) {
      // Smoothface walks out from the shadow toward center-right shaking his fist
      if (t < 2.4) {
        this.smoothface.isWalking = true;
        this.smoothface.x -= dt * 75;
      } else {
        this.smoothface.isWalking = false;
        this.smoothface.poseIndex = 6;
        this.smoothface.grumpyMode = true;
      }
      this.smoothface.talkAmp = voiceAmp;
      this.rigs.updatePuppetState(this.smoothface, dt);
    } else if (this.currentScene === 2) {
      if (t < 2.6) {
        this.smoothface.isWalking = true;
        this.smoothface.x += dt * 95;
      } else {
        this.smoothface.isWalking = false;
        this.smoothface.poseIndex = 7; // Evil mastermind laugh!
      }
      this.smoothface.talkAmp = voiceAmp;
      this.rigs.updatePuppetState(this.smoothface, dt);
    } else if (this.currentScene === 3) {
      this.smoothface.poseIndex = t < 2.2 ? 4 : 5;
      this.smoothface.talkAmp = voiceAmp;
      this.rigs.updatePuppetState(this.smoothface, dt);
    } else if (this.currentScene === 4) {
      this.smoothface.poseIndex = 4;
      this.smoothface.talkAmp = voiceAmp;
      this.rigs.updatePuppetState(this.smoothface, dt);
    } else if (this.currentScene === 5) {
      if (t < 3.4) {
        this.smoothface.isWalking = true;
        this.smoothface.x += dt * 70;
      } else {
        this.smoothface.isWalking = false;
        this.smoothface.poseIndex = 3;
      }
      this.capDread.talkAmp = voiceAmp;
      this.rigs.updatePuppetState(this.smoothface, dt);
      this.rigs.updatePuppetState(this.capDread, dt);
    } else if (this.currentScene === 6) {
      this.nihongo.talkAmp = voiceAmp;
      this.aBaby.talkAmp = Math.abs(Math.sin(t * 5)) * 0.4;
      this.ventrilo.talkAmp = Math.abs(Math.cos(t * 6)) * 0.4;
      this.rigs.updatePuppetState(this.nihongo, dt);
      this.rigs.updatePuppetState(this.aBaby, dt);
      this.rigs.updatePuppetState(this.ventrilo, dt);
    } else if (this.currentScene === 7) {
      if (t >= 2.3 && !this.bamTriggeredInScene7) {
        this.bamTriggeredInScene7 = true;
        this.audio.playPedalSnapBam();
        this.nihongo.poseIndex = 1; // Panic!
        this.smoothface.poseIndex = 8; // Shock !!
        this.rigs.triggerSquash(this.nihongo, 1.25, 0.78);
        this.rigs.triggerSquash(this.smoothface, 1.22, 0.80);
      }
      this.nihongo.talkAmp = voiceAmp;
      this.smoothface.talkAmp = t > 3.5 ? 0.5 : 0;
      this.rigs.updatePuppetState(this.nihongo, dt);
      this.rigs.updatePuppetState(this.smoothface, dt);
    }

    this.renderCurrentScene(t);
  }

  private renderCurrentScene(t: number): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Camera shake during Scene 8 BAM!! explosion
    let shakeX = 0;
    let shakeY = 0;
    if (this.currentScene === 7 && t >= 2.3 && t <= 3.4) {
      const decay = 1 - (t - 2.3) / 1.1;
      shakeX = (Math.random() - 0.5) * 24 * decay;
      shakeY = (Math.random() - 0.5) * 24 * decay;
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);

    switch (this.currentScene) {
      case 0:
        this.renderScene1Twins(ctx, w, h, t);
        break;
      case 1:
        this.renderScene2HairlessCurse(ctx, w, h, t);
        break;
      case 2:
        this.renderScene3SupervillainVow(ctx, w, h, t);
        break;
      case 3:
        this.renderScene4MaleficLetter(ctx, w, h, t);
        break;
      case 4:
        this.renderScene5BlackspitMap(ctx, w, h, t);
        break;
      case 5:
        this.renderScene6BoardingSub(ctx, w, h, t);
        break;
      case 6:
        this.renderScene7UnderwaterCutaway(ctx, w, h, t);
        break;
      case 7:
        this.renderScene8PedalSnapBam(ctx, w, h, t);
        break;
    }

    // Hanging Paper Cut-Out Stage Strings & Top Valance Shadow
    this.renderPuppetStringsAndSpotlight(ctx, w, h, t);

    ctx.restore();
  }

  private drawBackdropSlowPan(ctx: CanvasRenderingContext2D, key: string, w: number, h: number, t: number, dim = 0.85): void {
    const im = this.getImg(key);
    if (!im) return;
    const scale = 1.04 + Math.sin(t * 0.35) * 0.02;
    const ox = Math.sin(t * 0.4) * -12;
    const oy = Math.cos(t * 0.3) * -6;
    ctx.save();
    ctx.translate(w * 0.5 + ox, h * 0.5 + oy);
    ctx.scale(scale, scale);
    ctx.globalAlpha = dim;
    ctx.drawImage(im, -w * 0.5, -h * 0.5, w, h);
    ctx.restore();
  }

  private drawAnimatedPaperPigeon(ctx: CanvasRenderingContext2D, x: number, y: number, phase: number, flip = 1): void {
    const wingY = Math.sin(phase * 14) * 14;
    ctx.save();
    ctx.translate(x, y + Math.sin(phase * 4) * 8);
    ctx.scale(flip, 1);
    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(4, 6, 22, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // White paper body with dark ink outline
    ctx.fillStyle = '#f8f4ea';
    ctx.strokeStyle = '#1d1410';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 12, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Flapping wing cutout
    ctx.beginPath();
    ctx.moveTo(-6, -2);
    ctx.quadraticCurveTo(-18, -24 + wingY, 8, -18 + wingY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Beak & eye
    ctx.fillStyle = '#e59a38';
    ctx.beginPath();
    ctx.moveTo(20, -2);
    ctx.lineTo(30, 1);
    ctx.lineTo(20, 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1d1410';
    ctx.beginPath();
    ctx.arc(14, -2, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private renderScene1Twins(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    this.drawBackdropSlowPan(ctx, 'panel_1', w, h, t, 0.92);

    // Animated sweeping golden spotlight on Dr. Morgan Stache
    const spotX = 350 + Math.sin(t * 1.8) * 24;
    const grad = ctx.createRadialGradient(spotX, 260, 20, spotX, 260, 240);
    grad.addColorStop(0, 'rgba(255, 238, 155, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Animated flapping paper cutout pigeons circling Dr. Stache
    this.drawAnimatedPaperPigeon(ctx, 210 + Math.cos(t * 1.6) * 45, 155 + Math.sin(t * 2.2) * 22, t, 1);
    this.drawAnimatedPaperPigeon(ctx, 510 + Math.sin(t * 1.4) * 45, 145 + Math.cos(t * 2.0) * 20, t + 1.2, -1);

    // Shimmering golden sparkles around Dr. Morgan Stache's moustache
    for (let i = 0; i < 5; i++) {
      const sx = 310 + Math.cos(t * 3 + i * 1.3) * 75;
      const sy = 250 + Math.sin(t * 2.5 + i * 1.7) * 55;
      const r = (0.5 + 0.5 * Math.sin(t * 8 + i)) * 9;
      ctx.fillStyle = '#ffe86b';
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Live articulated Mr. Smoothface glaring from the right stage wing!
    this.rigs.renderSmoothfaceRig(ctx, this.smoothface);
  }

  private renderScene2HairlessCurse(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    this.drawBackdropSlowPan(ctx, 'panel_1', w, h, t, 0.55);

    // Dramatic purple-teal villain spotlight following Smoothface as he steps forward
    const grad = ctx.createRadialGradient(this.smoothface.x, 290, 20, this.smoothface.x, 290, 260);
    grad.addColorStop(0, 'rgba(59, 232, 216, 0.28)');
    grad.addColorStop(1, 'rgba(10, 6, 14, 0.65)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Live articulated Mr. Smoothface marching out and shaking his fist with storm cloud & lightning!
    this.rigs.renderSmoothfaceRig(ctx, this.smoothface);
  }

  private renderScene3SupervillainVow(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    this.drawBackdropSlowPan(ctx, 'room_z1s3', w, h, t, 0.45);

    // Die-Cut PSD Paper Cut-Out of Dr. Morgan Stache (`dr_stache-cutout001.psd`) being crossed out in red ink!
    // Zero rectangular box behind him - pure scissor-cut silhouette with Photoshop drop shadow.
    const stacheIm = this.getImg('dr_stache');
    if (stacheIm) {
      ctx.save();
      ctx.translate(680, 235 + Math.sin(t * 2.5) * 6);
      ctx.rotate(0.05 + Math.sin(t * 2) * 0.025);

      // Soft stage drop shadow behind the die-cut Dr. Stache figure
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.72)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 10;
      ctx.drawImage(stacheIm, -98, -128, 196, 252);
      ctx.restore();

      // Animated red brush strokes slashing an X across Dr. Stache's cutout
      const slashProg = Math.min(1, Math.max(0, (t - 1.0) / 1.2));
      if (slashProg > 0) {
        ctx.strokeStyle = '#c91e1e';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-72, -82);
        ctx.lineTo(-72 + 144 * slashProg, -82 + 164 * slashProg);
        ctx.stroke();
      }
      if (slashProg >= 1) {
        const slash2 = Math.min(1, (t - 2.2) / 0.8);
        ctx.beginPath();
        ctx.moveTo(72, -82);
        ctx.lineTo(72 - 144 * slash2, -82 + 164 * slash2);
        ctx.stroke();
      }
      ctx.restore();
    }

    this.rigs.renderSmoothfaceRig(ctx, this.smoothface);
  }

  private renderScene4MaleficLetter(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    this.drawBackdropSlowPan(ctx, 'panel_2', w, h, t, 0.85);

    // Animated courier pigeon swooping across the stage and dropping the wax-sealed Evil Summons!
    const pigeonX = 120 + t * 145;
    const pigeonY = 125 + Math.sin(t * 3) * 18;
    this.drawAnimatedPaperPigeon(ctx, pigeonX, pigeonY, t, 1);

    const letterIm = this.getImg('wax_letter');
    if (letterIm) {
      const dropProgress = Math.min(1, Math.max(0, (t - 0.8) / 1.8));
      const lx = 260 + dropProgress * (this.smoothface.x + 65 - 260);
      const ly = 135 + dropProgress * (310 - 135) + Math.sin(t * 5) * 6;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(Math.sin(t * 6) * 0.18);
      ctx.drawImage(letterIm, -48, -48, 96, 96);
      ctx.restore();
    }

    this.rigs.renderSmoothfaceRig(ctx, this.smoothface);
  }

  private renderScene5BlackspitMap(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    this.drawBackdropSlowPan(ctx, 'room_z1s3', w, h, t, 0.40);

    // Unfurling Full-Color Blackspit Island Map in center stage
    const mapIm = this.getImg('island_map');
    if (mapIm) {
      const unfurl = Math.min(1, t / 0.9);
      const mw = 580 * unfurl;
      const mh = 360;
      ctx.save();
      ctx.translate(560, 260);
      ctx.rotate(-0.02 + Math.sin(t * 1.5) * 0.01);
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 22;
      ctx.drawImage(mapIm, -mw * 0.5, -mh * 0.5, mw, mh);

      // Animated glowing red route marker moving from Port Machete to Thundercano Hideout!
      if (unfurl >= 1) {
        const routeT = Math.min(1, (t - 0.9) / 4.2);
        const rx = -190 + routeT * 340;
        const ry = 120 - routeT * 210 + Math.sin(routeT * Math.PI * 2) * 24;
        ctx.fillStyle = '#ff2e2e';
        ctx.beginPath();
        ctx.arc(rx, ry, 9 + Math.sin(t * 12) * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
      ctx.restore();
    }

    this.rigs.renderSmoothfaceRig(ctx, this.smoothface);
  }

  private renderScene6BoardingSub(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    this.drawBackdropSlowPan(ctx, 'panel_3', w, h, t, 0.82);

    // Articulated Captain Dread welcoming Smoothface & Smoothface marching up the pier
    this.rigs.renderNpcPuppet(ctx, this.capDread);
    this.rigs.renderSmoothfaceRig(ctx, this.smoothface);

    // Animated Paper Cut-Out Ocean Waves rocking in the foreground!
    for (let layer = 0; layer < 2; layer++) {
      const wy = 485 + layer * 24 + Math.sin(t * 2.5 + layer) * 6;
      const wxOff = Math.cos(t * 1.8 + layer * 2) * 28;
      ctx.fillStyle = layer === 0 ? 'rgba(18, 68, 88, 0.78)' : 'rgba(10, 42, 58, 0.90)';
      ctx.strokeStyle = '#a8f0ff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-40, h + 20);
      for (let x = -40; x <= w + 40; x += 60) {
        const cy = wy + Math.sin((x + wxOff) * 0.05) * 10;
        ctx.quadraticCurveTo(x + 30, cy - 12, x + 60, wy);
      }
      ctx.lineTo(w + 40, h + 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  private renderScene7UnderwaterCutaway(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    this.drawBackdropSlowPan(ctx, 'room_z1s2', w, h, t, 0.85);

    // Spinning bicycle engine prop next to Nihongo Nohondes
    const engIm = this.getImg('pedal_engine');
    if (engIm) {
      ctx.save();
      ctx.translate(150, 390);
      ctx.rotate(Math.sin(t * 22) * 0.03);
      ctx.drawImage(engIm, -95, -90, 190, 180);
      ctx.restore();
    }

    this.rigs.renderNpcPuppet(ctx, this.nihongo);
    this.rigs.renderNpcPuppet(ctx, this.aBaby);
    this.rigs.renderNpcPuppet(ctx, this.ventrilo);

    // Rising underwater bubbles across the cutaway
    for (let i = 0; i < 14; i++) {
      const bx = ((i * 73 + Math.sin(t * 2 + i) * 18) % w);
      const by = h - (((t * 65 + i * 45) % (h + 40)));
      ctx.strokeStyle = 'rgba(140, 248, 255, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bx, by, 4 + (i % 4) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private renderScene8PedalSnapBam(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    this.drawBackdropSlowPan(ctx, 'room_z1s1', w, h, t, 0.88);

    const isBam = t >= 2.3;
    // Red emergency submarine alarm strobe after BAM!!
    if (isBam) {
      const pulse = 0.18 + 0.16 * Math.sin(t * 16);
      ctx.fillStyle = `rgba(255, 35, 35, ${pulse})`;
      ctx.fillRect(0, 0, w, h);
    }

    // Bicycle engine vibrating violently before snapping
    const engIm = this.getImg('pedal_engine');
    if (engIm) {
      ctx.save();
      const jitter = !isBam ? Math.sin(t * 45) * 6 : Math.sin(t * 12) * 2;
      ctx.translate(480 + jitter, 395);
      ctx.rotate(isBam ? 0.14 : Math.sin(t * 35) * 0.05);
      ctx.drawImage(engIm, -110, -95, 220, 190);
      ctx.restore();
    }

    this.rigs.renderNpcPuppet(ctx, this.nihongo);
    this.rigs.renderSmoothfaceRig(ctx, this.smoothface);

    // Comic-Book Paper Cut-Out "BAM!!" Burst & Flying Sparks!
    if (isBam) {
      const burstAge = t - 2.3;
      if (burstAge < 2.8) {
        const scale = Math.min(1.15, 0.4 + burstAge * 1.8) + Math.sin(t * 20) * 0.05;
        ctx.save();
        ctx.translate(490, 285);
        ctx.scale(scale, scale);

        // Jagged yellow/crimson comic starburst polygon
        ctx.fillStyle = '#ffdf3b';
        ctx.strokeStyle = '#1a0e08';
        ctx.lineWidth = 5;
        ctx.beginPath();
        const spikes = 14;
        for (let i = 0; i < spikes * 2; i++) {
          const r = i % 2 === 0 ? 105 : 58;
          const a = (i * Math.PI) / spikes;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.font = '900 44px Cinzel, Georgia, serif';
        ctx.fillStyle = '#b81414';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('BAM!!', 0, 2);
        ctx.restore();
      }
    }
  }

  private renderPuppetStringsAndSpotlight(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    // Subtle vertical theatrical puppet strings attached to characters
    ctx.strokeStyle = 'rgba(245, 235, 210, 0.16)';
    ctx.lineWidth = 1.2;
    const xCoords = [this.smoothface.x - 12, this.smoothface.x + 14];
    for (const sx of xCoords) {
      ctx.beginPath();
      ctx.moveTo(sx + Math.sin(t * 2) * 4, 0);
      ctx.lineTo(sx, 260);
      ctx.stroke();
    }

    // Warm theatrical stage vignette
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.28, w * 0.5, h * 0.5, w * 0.58);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(6, 4, 10, 0.58)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}
