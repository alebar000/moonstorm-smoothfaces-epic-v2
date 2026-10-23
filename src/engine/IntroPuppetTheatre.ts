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
      ['floor_planks_a', 'art/approved/z1s3/z1s3.floor.planks_a.png'],
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
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.drawImage(panelA, 0, 0, 520, 420);
      ctx.drawImage(panelB, 480, 0, 520, 420);
      ctx.restore();
    }

    const planks = this.getImg('floor_planks_a');
    if (planks) {
      ctx.drawImage(planks, 0, 385, w, 165);
    } else {
      ctx.fillStyle = '#2d1e16';
      ctx.fillRect(0, 410, w, 130);
    }
  }

  private drawAnimatedPaperPigeon(ctx: CanvasRenderingContext2D, x: number, y: number, phase: number, flip = 1): void {
    const wingY = Math.sin(phase * 14) * 14;
    ctx.save();
    ctx.translate(x, y + Math.sin(phase * 4) * 8);
    ctx.scale(flip, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(4, 6, 22, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8f4ea';
    ctx.strokeStyle = '#1d1410';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 12, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-6, -2);
    ctx.quadraticCurveTo(-18, -24 + wingY, 8, -18 + wingY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e59a38';
    ctx.beginPath();
    ctx.moveTo(20, -2);
    ctx.lineTo(30, 1);
    ctx.lineTo(20, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private renderScene1Barbershop(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    const bg = this.getImg('bg_barbershop');
    if (bg) {
      ctx.drawImage(bg, 0, 0, w, h);
    } else {
      this.drawTheatricalStageBase(ctx, w, h, '#241822');
    }

    const spotX = 280 + Math.sin(t * 1.8) * 24;
    const grad = ctx.createRadialGradient(spotX, 240, 20, spotX, 240, 240);
    grad.addColorStop(0, 'rgba(255, 228, 135, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    this.drawAnimatedPaperPigeon(ctx, 210 + Math.cos(t * 1.6) * 45, 145 + Math.sin(t * 2.2) * 22, t, 1);
    this.drawAnimatedPaperPigeon(ctx, 430 + Math.sin(t * 1.4) * 45, 135 + Math.cos(t * 2.0) * 20, t + 1.2, -1);

    this.rigs.renderSmoothfaceRig(ctx, this.smoothface);
  }

  private renderScene2EnvyMirror(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    const bg = this.getImg('bg_envy_mirror');
    if (bg) {
      ctx.drawImage(bg, 0, 0, w, h);
    } else {
      this.drawTheatricalStageBase(ctx, w, h, '#191424');
    }

    const grad = ctx.createRadialGradient(this.smoothface.x, 280, 20, this.smoothface.x, 280, 260);
    grad.addColorStop(0, 'rgba(59, 232, 216, 0.25)');
    grad.addColorStop(1, 'rgba(10, 6, 14, 0.55)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Courier pigeon delivering the crimson-sealed Malefic Invitation
    const pigeonX = 120 + t * 135;
    const pigeonY = 120 + Math.sin(t * 3) * 16;
    this.drawAnimatedPaperPigeon(ctx, pigeonX, pigeonY, t, 1);

    this.rigs.renderSmoothfaceRig(ctx, this.smoothface);
  }

  private renderScene3BlackspitDock(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    const bg = this.getImg('bg_blackspit_dock');
    if (bg) {
      ctx.drawImage(bg, 0, 0, w, h);
    } else {
      this.drawTheatricalStageBase(ctx, w, h, '#10222b');
    }

    const porthole = this.getImg('wall_porthole');
    if (porthole && !bg) {
      ctx.drawImage(porthole, 410, 110, 150, 150);
    }

    this.rigs.renderNpcPuppet(ctx, this.capDread);
    this.rigs.renderSmoothfaceRig(ctx, this.smoothface);

    // Rocking paper cutout ocean waves in the foreground
    for (let layer = 0; layer < 2; layer++) {
      const wy = 488 + layer * 22 + Math.sin(t * 2.5 + layer) * 6;
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

  private renderScene4CabinAmbush(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    const bg = this.getImg('bg_cabin_ambush');
    if (bg) {
      ctx.drawImage(bg, 0, 0, w, h);
    } else {
      this.drawTheatricalStageBase(ctx, w, h, '#241816');
      const sarc = this.getImg('prop_sarcophagus');
      const desk = this.getImg('prop_desk');
      const porthole = this.getImg('wall_porthole');
      const helm = this.getImg('wall_helm');
      if (sarc) ctx.drawImage(sarc, 55, 165, 145, 265);
      if (porthole) ctx.drawImage(porthole, 260, 95, 130, 130);
      if (helm) ctx.drawImage(helm, 520, 95, 130, 130);
      if (desk) ctx.drawImage(desk, 390, 290, 240, 150);
    }

    const isBam = t >= 2.2;
    if (isBam) {
      const pulse = 0.16 + 0.14 * Math.sin(t * 16);
      ctx.fillStyle = `rgba(255, 35, 35, ${pulse})`;
      ctx.fillRect(0, 0, w, h);
    }

    this.rigs.renderNpcPuppet(ctx, this.capDread);
    this.rigs.renderSmoothfaceRig(ctx, this.smoothface);

    if (isBam) {
      const burstAge = t - 2.2;
      if (burstAge < 2.8) {
        const scale = Math.min(1.12, 0.4 + burstAge * 1.8) + Math.sin(t * 20) * 0.05;
        ctx.save();
        ctx.translate(480, 215);
        ctx.scale(scale, scale);

        ctx.fillStyle = '#ffdf3b';
        ctx.strokeStyle = '#1a0e08';
        ctx.lineWidth = 5;
        ctx.beginPath();
        const spikes = 14;
        for (let i = 0; i < spikes * 2; i++) {
          const r = i % 2 === 0 ? 95 : 52;
          const a = (i * Math.PI) / spikes;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.font = '900 40px Cinzel, Georgia, serif';
        ctx.fillStyle = '#b81414';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('BAM!!', 0, 2);
        ctx.restore();
      }
    }
  }

  private renderPuppetStringsAndSpotlight(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    ctx.strokeStyle = 'rgba(245, 235, 210, 0.16)';
    ctx.lineWidth = 1.2;
    const xCoords = [this.smoothface.x - 12, this.smoothface.x + 14];
    for (const sx of xCoords) {
      ctx.beginPath();
      ctx.moveTo(sx + Math.sin(t * 2) * 4, 0);
      ctx.lineTo(sx, 240);
      ctx.stroke();
    }

    const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.28, w * 0.5, h * 0.5, w * 0.58);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(6, 4, 10, 0.58)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}
