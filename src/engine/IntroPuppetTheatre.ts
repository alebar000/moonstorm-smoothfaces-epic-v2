/**
 * MoonStorm Studios - Smoothface's Epic (Codename: Sparkle)
 * Slice 1 Real-Time 60 FPS Paper Cut-Out Puppet Theatre Intro Engine (src/engine/IntroPuppetTheatre.ts)
 *
 * Implements the 4-Scene Slice 1 Intro ("Menu de inicio y una intro de 4 escenas con los dos rigs aprobados"):
 * - Uses exclusively the 2 approved multi-part character rigs: Mr. Smoothface (27 parts) and Captain Dread (22 parts)
 * - Loads L12 intro backdrops, proscenium arch, and curtains from `art/approved/intro/*.png`
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
    badge: 'SCENE IV OF IV: CRISIS ABOARD THE SUBSTAMPEDE!',
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

    this.smoothface = this.rigs.createAnimState('smoothface', 560, 472, 0.68, -1);
    this.capDread = this.rigs.createAnimState('cap_dread', 460, 462, 0.66, 1);

    this.preloadStageAssets();
  }

  private preloadStageAssets(): void {
    const list: Array<[string, string, string]> = [
      ['bg_barbershop', 'art/approved/intro/intro.bg.barbershop.png', ''],
      ['bg_envy_mirror', 'art/approved/intro/intro.bg.envy_mirror.png', ''],
      ['bg_blackspit_dock', 'art/approved/intro/intro.bg.blackspit_dock.png', ''],
      ['bg_cabin_ambush', 'art/approved/intro/intro.bg.cabin_ambush.png', ''],
      ['proscenium', 'art/approved/intro/intro.proscenium.png', ''],
      ['curtain', 'art/approved/intro/intro.curtain.png', ''],
      ['wall_panel_a', 'art/approved/z1s3/z1s3.wall.panel_a.png', ''],
      ['wall_panel_b', 'art/approved/z1s3/z1s3.wall.panel_b.png', ''],
      ['floor_planks_a', 'art/approved/z1s3/z1s3.floor.planks_b.png', ''],
      ['wall_door', 'art/approved/z1s3/z1s3.wall.door.png', ''],
      ['wall_poster', 'art/approved/z1s3/z1s3.wall.poster.png', ''],
      ['prop_desk', 'art/approved/z1s3/z1s3.prop.desk.png', ''],
      ['prop_sarcophagus', 'art/approved/z1s3/z1s3.prop.sarcophagus.png', ''],
      ['wall_porthole', 'art/approved/z1s3/z1s3.wall.porthole.png', ''],
      ['wall_helm', 'art/approved/z1s3/z1s3.wall.helm_wheel.png', ''],
    ];
    for (const [k, src, fallback] of list) {
      const im = new Image();
      if (fallback) {
        im.onerror = () => {
          if (!im.dataset.retried) {
            im.dataset.retried = '1';
            im.src = fallback;
          }
        };
      }
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
      // Scene 1: Smoothface on the wooden barbershop floor, facing the barber chair and moustache portraits
      this.smoothface.x = 605;
      this.smoothface.y = 482;
      this.smoothface.scale = 0.58;
      this.smoothface.facing = -1;
      this.smoothface.flipVisual = -1;
      this.smoothface.grumpyMode = true;
      this.smoothface.poseIndex = 3;
    } else if (idx === 1) {
      // Scene 2: Smoothface on the cobblestone sidewalk facing the Malefic Gentlemen poster on the left wall
      this.smoothface.x = 575;
      this.smoothface.y = 484;
      this.smoothface.scale = 0.58;
      this.smoothface.facing = -1;
      this.smoothface.flipVisual = -1;
      this.smoothface.isWalking = true;
    } else if (idx === 2) {
      // Scene 3: Both Captain Dread and Smoothface standing on the wooden pier planks (clear of the ocean water on the left!)
      this.capDread.x = 465;
      this.capDread.y = 474;
      this.capDread.scale = 0.56;
      this.capDread.facing = 1;
      this.capDread.flipVisual = 1;
      this.capDread.poseIndex = 1;

      this.smoothface.x = 665;
      this.smoothface.y = 482;
      this.smoothface.scale = 0.58;
      this.smoothface.facing = -1;
      this.smoothface.flipVisual = -1;
      this.smoothface.isWalking = true;
    } else if (idx === 3) {
      // Scene 4: Aboard the Substampede corridor when BAM!! strikes (both grounded on the flat steel floor plates)
      this.capDread.x = 505;
      this.capDread.y = 480;
      this.capDread.scale = 0.56;
      this.capDread.facing = -1;
      this.capDread.flipVisual = -1;
      this.capDread.poseIndex = 1;

      this.smoothface.x = 355;
      this.smoothface.y = 482;
      this.smoothface.scale = 0.58;
      this.smoothface.facing = 1;
      this.smoothface.flipVisual = 1;
      this.smoothface.poseIndex = 3;
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
      if (t < 1.8 && this.smoothface.x > 545) {
        this.smoothface.isWalking = true;
        this.smoothface.x -= dt * 42;
      } else {
        this.smoothface.isWalking = false;
        this.smoothface.poseIndex = 3;
        this.smoothface.grumpyMode = true;
      }
      this.smoothface.talkAmp = voiceAmp;
      this.rigs.updatePuppetState(this.smoothface, dt);
    } else if (this.currentScene === 1) {
      if (t < 1.8 && this.smoothface.x > 515) {
        this.smoothface.isWalking = true;
        this.smoothface.x -= dt * 42;
      } else {
        this.smoothface.isWalking = false;
        this.smoothface.poseIndex = t < 4.4 ? 3 : 5;
      }
      this.smoothface.talkAmp = voiceAmp;
      this.rigs.updatePuppetState(this.smoothface, dt);
    } else if (this.currentScene === 2) {
      if (t < 1.8 && this.smoothface.x > 605) {
        this.smoothface.isWalking = true;
        this.smoothface.x -= dt * 42;
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
        this.smoothface.poseIndex = 5;
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

    // Clip backdrop card, puppets, and curtains to the interior arch opening of the proscenium
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(160, h);
    ctx.lineTo(160, 195);
    ctx.quadraticCurveTo(w * 0.5, 25, w - 160, 195);
    ctx.lineTo(w - 160, h);
    ctx.closePath();
    ctx.clip();

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

    const curtain = this.getImg('curtain');
    if (curtain) {
      ctx.save();
      ctx.drawImage(curtain, 72, 72, 640, 900, 162, 96, 110, h - 96);
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(curtain, 72, 72, 640, 900, 162, 96, 110, h - 96);
      ctx.restore();
    }
    ctx.restore(); // End proscenium arch clip

    this.renderPuppetStringsAndSpotlight(ctx, w, h, t);
    ctx.restore();
  }

  private drawBackdropCard(ctx: CanvasRenderingContext2D, bg: HTMLImageElement, _w: number, _h: number): void {
    // Crop the 7% transparent normalization border and fit inside the proscenium stage opening (168..792, 96..536)
    const sx = Math.round(bg.naturalWidth * 0.068);
    const sy = Math.round(bg.naturalHeight * 0.114);
    const sw = Math.round(bg.naturalWidth * 0.864);
    const sh = Math.round(bg.naturalHeight * 0.772);
    ctx.drawImage(bg, sx, sy, sw, sh, 168, 96, 624, 440);
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
      this.drawBackdropCard(ctx, bg, w, h);
      // Warm wooden floor shadow under the barber chair base
      ctx.save();
      ctx.fillStyle = 'rgba(66, 48, 34, 0.72)';
      ctx.beginPath();
      ctx.ellipse(440, 488, 52, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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
      this.drawBackdropCard(ctx, bg, w, h);
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
      this.drawBackdropCard(ctx, bg, w, h);
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
      this.drawBackdropCard(ctx, bg, w, h);
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

  private renderPuppetStringsAndSpotlight(ctx: CanvasRenderingContext2D, w: number, h: number, _t: number): void {
    const proscenium = this.getImg('proscenium');
    if (proscenium) {
      // Frame the entire stage with the approved ornate cardboard proscenium arch (opaque bbox: 131, 131, 1639, 900)
      ctx.save();
      ctx.shadowColor = 'rgba(12, 8, 6, 0.55)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 4;
      ctx.drawImage(proscenium, 131, 131, 1639, 900, -78, -28, w + 156, h + 34);
      ctx.restore();
    }
  }
}
