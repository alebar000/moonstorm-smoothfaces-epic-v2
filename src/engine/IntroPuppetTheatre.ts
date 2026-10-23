/**
 * MoonStorm Studios - Smoothface's Epic (Codename: Sparkle)
 * Slice 1 Real-Time 60 FPS Paper Cut-Out Puppet Theatre Intro Engine (src/engine/IntroPuppetTheatre.ts)
 *
 * Implements the 4-Scene Slice 1 Intro ("Menú de inicio y una intro de 4 escenas con los dos rigs aprobados"):
 * - Uses exclusively the 2 approved multi-part character rigs: Mr. Smoothface (27 parts) and Captain Dread (22 parts)
 * - Loads L12 intro backdrops from `art/approved/intro/*.png` (with rich theatrical cutout stage rendering & Z1S3 cabin pieces)
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
    badge: 'SCENE I OF IV: THE HAIRLESS TWIN OF LONDON',
    speaker: 'RUPERT "MR. SMOOTHFACE" STACHE',
    voice: 'smoothface',
    durationSec: 6.5,
    text: 'In Victorian London, barber prodigy Morgan Stache became a global celebrity for his shimmering golden moustache. Meanwhile, his twin brother Rupert was born with a tragic genetic curse: not a single eyebrow hair, beard stubble, or whisker! The cruel streets mocked him as... Mr. Smoothface.',
  },
  {
    id: 1,
    badge: 'SCENE II OF IV: THE MALEFIC INVITATION',
    speaker: 'MR. SMOOTHFACE',
    voice: 'smoothface',
    durationSec: 6.5,
    text: '"If I cannot grow a moustache, then NOBODY SHALL!" Drawing his dark coat collar over his hairless chin, Rupert applied to the most feared syndicate on Earth: the MGWDBTTGPnP (Malefic Gentlemen Who Do Bad Things To Good People & Pigeons). Their admission exam awaits on Blackspit Island!',
  },
  {
    id: 2,
    badge: 'SCENE III OF IV: ABOARD THE SUBSTAMPEDE',
    speaker: 'CAPTAIN DREAD',
    voice: 'cap_dread',
    durationSec: 6.5,
    text: '"All aboard the Substampede, matey!" At the foggy dock, Rupert paid his last coins to the flamboyant Captain Dread for covert submarine passage across the shark-infested sea.',
  },
  {
    id: 3,
    badge: 'SCENE IV OF IV: CRISIS IN CAPTAIN DREAD\'S CABIN!',
    speaker: 'CAPTAIN DREAD & MR. SMOOTHFACE',
    voice: 'cap_dread',
    durationSec: 7.0,
    text: 'Halfway to Blackspit Island, the submarine shudders to a halt: BAM!! The rusty bicycle drive has snapped! Inside Captain Dread\'s Cabin, Mr. Smoothface must scavenge the Bag of Hammers, the Portrait Stand, and the Super-Glue to assemble Leonardo da Vinci\'s Perpetual Movement Machine!',
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
  private bamTriggeredInScene3 = false;

  // The two approved Slice 1 articulated stage puppets
  private smoothface: PuppetAnimState;
  private capDread: PuppetAnimState;

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

    this.smoothface = this.rigs.createAnimState('smoothface', 480, 495, 0.88, 1);
    this.capDread = this.rigs.createAnimState('cap_dread', 640, 495, 0.88, -1);

    this.preloadStageAssets();
  }

  private preloadStageAssets(): void {
    const list: Array<[string, string]> = [
      ['bg_barbershop', 'art/approved/intro/intro.bg.barbershop.png'],
      ['bg_envy_mirror', 'art/approved/intro/intro.bg.envy_mirror.png'],
      ['bg_blackspit_dock', 'art/approved/intro/intro.bg.blackspit_dock.png'],
      ['bg_cabin_ambush', 'art/approved/intro/intro.bg.cabin_ambush.png'],
      ['proscenium', 'art/approved/intro/intro.proscenium.png'],
      ['curtain', 'art/approved/intro/intro.curtain.png'],
      ['wall_panel_a', 'art/approved/z1s3/z1s3.wall.panel_a.png'],
      ['wall_panel_b', 'art/approved/z1s3/z1s3.wall.panel_b.png'],
      ['floor_planks_a', 'art/approved/z1s3/z1s3.floor.planks_b.png'],
      ['wall_door', 'art/approved/z1s3/z1s3.wall.door.png'],
      ['wall_poster', 'art/approved/z1s3/z1s3.wall.poster.png'],
      ['prop_desk', 'art/approved/z1s3/z1s3.prop.desk.png'],
      ['prop_sarcophagus', 'art/approved/z1s3/z1s3.prop.sarcophagus.png'],
      ['wall_porthole', 'art/approved/z1s3/z1s3.wall.porthole.png'],
      ['wall_helm', 'art/approved/z1s3/z1s3.wall.helm_wheel.png'],
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
    this.bamTriggeredInScene3 = false;
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
    this.smoothface.isWalking = false;
    this.smoothface.grumpyMode = false;
    this.smoothface.poseIndex = 0;

    this.capDread.isWalking = false;
    this.capDread.poseIndex = 0;

    if (idx === 0) {
      // Scene 1: Smoothface steps out from barbershop shadows shaking his fist with anger cloud
      this.smoothface.x = 680;
      this.smoothface.y = 495;
      this.smoothface.scale = 0.90;
      this.smoothface.facing = -1;
      this.smoothface.flipVisual = -1;
      this.smoothface.grumpyMode = true;
      this.smoothface.poseIndex = 6;
    } else if (idx === 1) {
      // Scene 2: Smoothface vows vengeance and receives the Malefic Invitation
      this.smoothface.x = 320;
      this.smoothface.y = 495;
      this.smoothface.scale = 0.92;
      this.smoothface.facing = 1;
      this.smoothface.flipVisual = 1;
      this.smoothface.isWalking = true;
    } else if (idx === 2) {
      // Scene 3: Captain Dread welcomes Smoothface aboard the Substampede
      this.capDread.x = 660;
      this.capDread.y = 495;
      this.capDread.scale = 0.90;
      this.capDread.facing = -1;
      this.capDread.flipVisual = -1;
      this.capDread.poseIndex = 1;

      this.smoothface.x = 220;
      this.smoothface.y = 495;
      this.smoothface.scale = 0.90;
      this.smoothface.facing = 1;
      this.smoothface.flipVisual = 1;
      this.smoothface.isWalking = true;
    } else if (idx === 3) {
      // Scene 4: Inside Captain Dread's Cabin when BAM!! strikes
      this.capDread.x = 640;
      this.capDread.y = 495;
      this.capDread.scale = 0.88;
      this.capDread.facing = -1;
      this.capDread.flipVisual = -1;
      this.capDread.poseIndex = 1;

      this.smoothface.x = 310;
      this.smoothface.y = 495;
      this.smoothface.scale = 0.88;
      this.smoothface.facing = 1;
      this.smoothface.flipVisual = 1;
      this.smoothface.poseIndex = 4;
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

    if (this.currentScene === 0) {
      if (t < 2.2) {
        this.smoothface.isWalking = true;
        this.smoothface.x -= dt * 75;
      } else {
        this.smoothface.isWalking = false;
        this.smoothface.poseIndex = 6;
        this.smoothface.grumpyMode = true;
      }
      this.smoothface.talkAmp = voiceAmp;
      this.rigs.updatePuppetState(this.smoothface, dt);
    } else if (this.currentScene === 1) {
      if (t < 2.4) {
        this.smoothface.isWalking = true;
        this.smoothface.x += dt * 75;
      } else {
        this.smoothface.isWalking = false;
        this.smoothface.poseIndex = t < 4.4 ? 7 : 5;
      }
      this.smoothface.talkAmp = voiceAmp;
      this.rigs.updatePuppetState(this.smoothface, dt);
    } else if (this.currentScene === 2) {
      if (t < 3.2) {
        this.smoothface.isWalking = true;
        this.smoothface.x += dt * 65;
      } else {
        this.smoothface.isWalking = false;
        this.smoothface.poseIndex = 3;
      }
      this.capDread.talkAmp = voiceAmp;
      this.rigs.updatePuppetState(this.smoothface, dt);
      this.rigs.updatePuppetState(this.capDread, dt);
    } else if (this.currentScene === 3) {
      if (t >= 2.2 && !this.bamTriggeredInScene3) {
        this.bamTriggeredInScene3 = true;
        this.audio.playPedalSnapBam();
        this.capDread.poseIndex = 2;
        this.smoothface.poseIndex = 8;
        this.rigs.triggerSquash(this.capDread, 1.22, 0.80);
        this.rigs.triggerSquash(this.smoothface, 1.22, 0.80);
      } else if (t > 4.2) {
        this.smoothface.poseIndex = 5; // Eureka lightbulb + wrench
      }
      this.capDread.talkAmp = t < 3.5 ? voiceAmp : 0;
      this.smoothface.talkAmp = t >= 3.5 ? voiceAmp : 0;
      this.rigs.updatePuppetState(this.capDread, dt);
      this.rigs.updatePuppetState(this.smoothface, dt);
    }

    this.renderCurrentScene(t);
  }

  private renderCurrentScene(t: number): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    let shakeX = 0;
    let shakeY = 0;
    if (this.currentScene === 3 && t >= 2.2 && t <= 3.3) {
      const decay = 1 - (t - 2.2) / 1.1;
      shakeX = (Math.random() - 0.5) * 24 * decay;
      shakeY = (Math.random() - 0.5) * 24 * decay;
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);

    switch (this.currentScene) {
      case 0:
        this.renderScene1Barbershop(ctx, w, h, t);
        break;
      case 1:
        this.renderScene2EnvyMirror(ctx, w, h, t);
        break;
      case 2:
        this.renderScene3BlackspitDock(ctx, w, h, t);
        break;
      case 3:
        this.renderScene4CabinAmbush(ctx, w, h, t);
        break;
    }

    this.renderPuppetStringsAndSpotlight(ctx, w, h, t);
    ctx.restore();
  }

  private drawTheatricalStageBase(ctx: CanvasRenderingContext2D, w: number, h: number, wallColor: string): void {
    ctx.fillStyle = wallColor;
    ctx.fillRect(0, 0, w, h);

    const panelA = this.getImg('wall_panel_a');
    const panelB = this.getImg('wall_panel_b');
    if (panelA && panelB) {
      ctx.drawImage(panelA, -50, -35, 580, 460);
      ctx.drawImage(panelB, 430, -35, 580, 460);
    }

    const planks = this.getImg('floor_planks_a');
    if (planks) {
      ctx.drawImage(planks, -50, 340, 590, 240);
      ctx.drawImage(planks, 430, 340, 590, 240);
    }
  }

  private renderScene1Barbershop(ctx: CanvasRenderingContext2D, w: number, h: number, _t: number): void {
    const bg = this.getImg('bg_barbershop');
    if (bg) {
      ctx.drawImage(bg, 0, 0, w, h);
    } else {
      this.drawTheatricalStageBase(ctx, w, h, '#241822');
      const poster = this.getImg('wall_poster');
      const desk = this.getImg('prop_desk');
      if (poster) ctx.drawImage(poster, 220, 85, 116, 146);
      if (desk) ctx.drawImage(desk, 150, 250, 280, 175);
    }
    this.rigs.renderSmoothfaceRig(ctx, this.smoothface);
  }

  private renderScene2EnvyMirror(ctx: CanvasRenderingContext2D, w: number, h: number, _t: number): void {
    const bg = this.getImg('bg_envy_mirror');
    if (bg) {
      ctx.drawImage(bg, 0, 0, w, h);
    } else {
      this.drawTheatricalStageBase(ctx, w, h, '#191424');
      const door = this.getImg('wall_door');
      const poster = this.getImg('wall_poster');
      if (door) ctx.drawImage(door, 580, 70, 240, 320);
      if (poster) ctx.drawImage(poster, 420, 95, 116, 146);
    }
    this.rigs.renderSmoothfaceRig(ctx, this.smoothface);
  }

  private renderScene3BlackspitDock(ctx: CanvasRenderingContext2D, w: number, h: number, _t: number): void {
    const bg = this.getImg('bg_blackspit_dock');
    if (bg) {
      ctx.drawImage(bg, 0, 0, w, h);
    } else {
      this.drawTheatricalStageBase(ctx, w, h, '#10222b');
      const door = this.getImg('wall_door');
      const porthole = this.getImg('wall_porthole');
      if (door) ctx.drawImage(door, 80, 70, 240, 320);
      if (porthole) ctx.drawImage(porthole, 410, 95, 150, 150);
    }
    this.rigs.renderNpcPuppet(ctx, this.capDread);
    this.rigs.renderSmoothfaceRig(ctx, this.smoothface);
  }

  private renderScene4CabinAmbush(ctx: CanvasRenderingContext2D, w: number, h: number, _t: number): void {
    const bg = this.getImg('bg_cabin_ambush');
    if (bg) {
      ctx.drawImage(bg, 0, 0, w, h);
    } else {
      this.drawTheatricalStageBase(ctx, w, h, '#241816');
      const sarc = this.getImg('prop_sarcophagus');
      const desk = this.getImg('prop_desk');
      const porthole = this.getImg('wall_porthole');
      const helm = this.getImg('wall_helm');
      if (sarc) ctx.drawImage(sarc, 55, 135, 155, 285);
      if (porthole) ctx.drawImage(porthole, 260, 85, 130, 130);
      if (helm) ctx.drawImage(helm, 520, 85, 130, 130);
      if (desk) ctx.drawImage(desk, 390, 265, 240, 150);
    }
    this.rigs.renderNpcPuppet(ctx, this.capDread);
    this.rigs.renderSmoothfaceRig(ctx, this.smoothface);
  }

  private renderPuppetStringsAndSpotlight(_ctx: CanvasRenderingContext2D, _w: number, _h: number, _t: number): void {
    // Cutout-only stage: no procedural strings or dark vignette blur
  }
}
