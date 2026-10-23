/**
 * MoonStorm Studios - Smoothface's Epic (Codename: Sparkle)
 * Main 1600x900 Modular Paper Cut-Out Adventure Engine, Living Environmental FX & Puzzle State Machine (src/main.ts)
 */

import { AudioVoiceEngine, VoiceProfileId } from './engine/AudioVoiceEngine';
import { CutoutRigRenderer, PuppetAnimState } from './engine/CutoutRigRenderer';
import { INTRO_SCENES_8, IntroPuppetTheatre } from './engine/IntroPuppetTheatre';
import {
  createInitialFlags,
  DialogueOption,
  HotspotDef,
  ITEMS_CATALOG,
  ROOM_HOTSPOTS,
  ROOM_OBJECTS,
  ROOM_WIDTHS,
  RoomId,
  SceneObjectDef,
  WorldFlags,
} from './scenarios/WorldData';

interface DustMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
}

interface OceanBubble {
  x: number;
  y: number;
  vy: number;
  r: number;
}

interface ActionStepParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface SteamPuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  maxLife: number;
}

class SmoothfacePilotGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private menuPuppetCanvas: HTMLCanvasElement;
  private menuPuppetCtx: CanvasRenderingContext2D;

  public audio: AudioVoiceEngine;
  public rigs: CutoutRigRenderer;
  public introTheatre: IntroPuppetTheatre;
  public flags: WorldFlags;

  public currentRoom: RoomId = 'Z1S3';
  public inventory: string[] = [];
  public selectedItemId: string | null = null;
  public inventoryMode: 'select' | 'inspect' = 'select';

  // Visual & Control Config
  public cfgLighting = true;
  public cfgForeground = true;
  public cfgCrt = false;
  public cfgDebugWalkbox = false;
  public cfgDevNotes = false;
  public cfgControlMode: 'hybrid' | 'classic' = 'hybrid';
  public streetSenseActive = false;
  public sketchMode2010 = false;

  // Player & NPC Puppet States
  public player: PuppetAnimState;
  public menuShowcasePuppet: PuppetAnimState;
  public npcs: Record<string, PuppetAnimState> = {};

  // Movement & Interaction Queue
  private walkTargetX: number | null = null;
  private walkTargetY: number | null = null;
  private pendingCallback: (() => void) | null = null;
  private stepSoundTimer = 0;

  // Hover & Click Object Feedback
  private hoveredHotspotId: string | null = null;
  private objectPulseMap: Map<string, number> = new Map();

  // Camera & Multi-Plane Parallax (1600x900 viewport scrolling across wide rooms up to 2880x900)
  public cameraX = 240;
  private mouseX = 800;
  private mouseY = 450;
  private cameraShakeTime = 0;
  private cameraShakeMag = 0;
  private perpetualWheelAngle = 0;
  private supersonicSpeed = 0;

  // Environmental FX Particles
  private dustMotes: DustMote[] = [];
  private bubbles: OceanBubble[] = [];
  private fxParticles: ActionStepParticle[] = [];
  private steamPuffs: SteamPuff[] = [];
  private steamSpawnTimer = 0;
  private sparkSpawnTimer = 0;

  // Preloaded Room Shell, Cut-Out Object & Prop Images
  private imgs: Map<string, HTMLImageElement> = new Map();

  // Typewriter & Dialogue State
  private fullDialogueText = '';
  private visibleChars = 0;
  private typeTimer = 0;
  private activeVoice: VoiceProfileId = 'smoothface';
  private isTyping = false;
  private poseResetTimer: number | null = null;

  // Intro & Keypad State
  private currentIntroIndex = 0;
  private keypadEntered: string[] = [];

  private lastFrameTime = performance.now();

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.menuPuppetCanvas = document.getElementById('menu-puppet-canvas') as HTMLCanvasElement;
    this.menuPuppetCtx = this.menuPuppetCanvas.getContext('2d')!;

    this.audio = new AudioVoiceEngine();
    this.rigs = new CutoutRigRenderer();
    this.flags = createInitialFlags();

    const introCanvas = document.getElementById('intro-stage-canvas') as HTMLCanvasElement;
    this.introTheatre = new IntroPuppetTheatre(
      introCanvas,
      this.rigs,
      this.audio,
      (idx) => this.syncIntroDomForScene(idx),
      () => {
        this.flags.introWatched = true;
        this.enterGameplay('Z1S3');
      }
    );

    // Canonical Slice 1 Z1S3 Initial Placements (`layout/z1s3.layout.json`: Smoothface 315px, Captain Dread 330px)
    this.player = this.rigs.createAnimState('smoothface', 700, 810, 1.0, 1);
    this.menuShowcasePuppet = this.rigs.createAnimState('smoothface', 220, 430, 1.15, 1);

    this.npcs = {
      cap_dread: this.rigs.createAnimState('cap_dread', 1420, 815, 1.0, -1),
      nihongo: this.rigs.createAnimState('nihongo', 725, 810, 1.0, 1),
      a_baby: this.rigs.createAnimState('a_baby', 705, 815, 1.0, 1),
      ventriloquist: this.rigs.createAnimState('ventriloquist', 1410, 815, 1.0, -1),
    };

    this.preloadSceneAssets();
    this.initParticles();
    this.bindDomEvents();
    this.renderInventoryBar();

    // Expose debug/test API on window for automated verification
    (window as unknown as Record<string, unknown>).__SPARKLE_GAME__ = this;

    requestAnimationFrame((t) => this.loop(t));
  }

  private preloadSceneAssets(): void {
    const z1s3Ids = [
      'z1s3.wall.panel_a',
      'z1s3.wall.panel_b',
      'z1s3.wall.panel_c',
      'z1s3.wall.seam_strip',
      'z1s3.floor.planks_a',
      'z1s3.floor.planks_b',
      'z1s3.ceiling.beam_a',
      'z1s3.ceiling.beam_b',
      'z1s3.wall.door',
      'z1s3.wall.porthole',
      'z1s3.wall.poster',
      'z1s3.wall.mask_a',
      'z1s3.wall.mask_b',
      'z1s3.wall.helm_wheel',
      'z1s3.wall.shelf',
      'z1s3.wall.pipes',
      'z1s3.prop.sarcophagus',
      'z1s3.prop.desk',
      'z1s3.prop.tv',
      'z1s3.prop.fishbowl',
      'z1s3.prop.coat_rack',
      'z1s3.prop.coat',
      'z1s3.prop.hat',
      'z1s3.prop.nightstand',
      'z1s3.prop.glue',
      'z1s3.prop.easel_portrait',
      'z1s3.prop.hammer_bag',
      'z1s3.prop.dirty_laundry',
      'z1s3.prop.lamp',
      'z1s3.prop.bed',
      'z1s3.fg.card_table',
      'z1s3.fg.ship_in_bottle',
      'z1s3.fg.chest',
      'z1s3.fg.clown_bust',
      'z1s3.fg.voodoo_doll',
      'z1s3.fg.hull_rib_left',
      'z1s3.fg.hull_rib_right',
    ];
    for (const id of z1s3Ids) {
      const im = new Image();
      im.src = `art/approved/z1s3/${id}.png`;
      this.imgs.set(id, im);
    }
    const helmIm = new Image();
    helmIm.src = 'art/approved/z1s3/z1s3.wall.helm_wheel.png';
    this.imgs.set('item_helm', helmIm);
  }

  private getImg(key: string): HTMLImageElement | null {
    const im = this.imgs.get(key);
    return im && im.complete && im.naturalWidth > 0 ? im : null;
  }

  private initParticles(): void {
    for (let i = 0; i < 48; i++) {
      this.dustMotes.push({
        x: Math.random() * 1600,
        y: Math.random() * 900,
        vx: (Math.random() - 0.5) * 16,
        vy: -5 - Math.random() * 12,
        r: 1.4 + Math.random() * 2.6,
        alpha: 0.22 + Math.random() * 0.45,
      });
    }
    for (let i = 0; i < 28; i++) {
      this.bubbles.push({
        x: Math.random() * 1600,
        y: Math.random() * 900,
        vy: -28 - Math.random() * 38,
        r: 2.5 + Math.random() * 5.5,
      });
    }
  }

  public spawnSparks(x: number, y: number, color = '#ffcf56', count = 18): void {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 50 + Math.random() * 180;
      this.fxParticles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 45,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.42,
        color,
        size: 3 + Math.random() * 4.5,
      });
    }
  }

  private spawnSteamPuff(x: number, y: number, dirX = 1): void {
    this.steamPuffs.push({
      x,
      y,
      vx: dirX * (28 + Math.random() * 35),
      vy: -32 - Math.random() * 28,
      r: 8 + Math.random() * 8,
      life: 0,
      maxLife: 1.1 + Math.random() * 0.6,
    });
  }

  private setTemporaryPlayerPose(poseIndex: number, durationMs = 1700, grumpy = false): void {
    if (this.poseResetTimer !== null) {
      window.clearTimeout(this.poseResetTimer);
    }
    this.player.poseIndex = poseIndex;
    this.player.grumpyMode = grumpy;
    this.poseResetTimer = window.setTimeout(() => {
      this.player.poseIndex = 0;
      this.player.grumpyMode = false;
      this.poseResetTimer = null;
    }, durationMs);
  }

  private bindDomEvents(): void {
    // Main Menu buttons
    document.getElementById('btn-menu-start-intro')?.addEventListener('click', () => {
      this.audio.playStartStinger();
      this.startIntroCinematic();
    });

    document.getElementById('btn-menu-quick-play')?.addEventListener('click', () => {
      this.audio.playStartStinger();
      this.enterGameplay('Z1S3');
    });

    document.querySelectorAll('.menu-scene-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const room = (btn as HTMLElement).dataset.room as RoomId;
        this.audio.playStartStinger();
        this.enterGameplay(room || 'Z1S3');
      });
    });

    document.getElementById('btn-menu-config')?.addEventListener('click', () => {
      this.audio.playUiClick();
      this.toggleModal('config-modal', true);
    });

    document.getElementById('btn-menu-credits')?.addEventListener('click', () => {
      this.audio.playUiClick();
      this.enterGameplay('Z1S3');
      this.speakLine(
        'MOONSTORM STUDIOS',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'CREDITS',
        'Created by Alexander Barquero, Jose David Aguilar, Juan Vicente Garcia, Luis F. Ledezma, Cristian Morales, and Brian "BooT". Welcome aboard the Substampede!'
      );
    });

    // Intro controls (8-Scene Real-Time 60 FPS Puppet Theatre)
    document.getElementById('btn-intro-next')?.addEventListener('click', () => {
      this.audio.playUiClick();
      this.introTheatre.nextScene();
    });
    document.getElementById('btn-intro-prev')?.addEventListener('click', () => {
      this.audio.playUiClick();
      this.introTheatre.prevScene();
    });
    document.getElementById('btn-intro-playpause')?.addEventListener('click', () => {
      this.audio.playUiClick();
      const auto = this.introTheatre.toggleAutoPlay();
      const lbl = document.getElementById('intro-playpause-label');
      if (lbl) lbl.textContent = auto ? 'Pause Auto-Play' : 'Resume Auto-Play';
    });
    document.getElementById('btn-intro-skip')?.addEventListener('click', () => {
      this.audio.playUiClick();
      this.flags.introWatched = true;
      this.enterGameplay('Z1S3');
    });

    // Top HUD controls
    document.getElementById('btn-open-menu')?.addEventListener('click', () => {
      this.audio.playUiClick();
      document.getElementById('main-menu-overlay')!.style.display = 'flex';
      document.getElementById('hud-top-bar')!.classList.add('hud-hidden');
      document.getElementById('hud-bottom-box')!.classList.add('hud-hidden');
    });

    document.getElementById('btn-mode-select')?.addEventListener('click', () => {
      this.setInventoryMode('select');
    });
    document.getElementById('btn-mode-inspect')?.addEventListener('click', () => {
      this.setInventoryMode('inspect');
    });
    document.getElementById('btn-clear-item')?.addEventListener('click', () => {
      this.selectInventoryItem(null);
    });

    document.getElementById('btn-sketch-mode')?.addEventListener('click', () => {
      this.toggleSketchMode2010();
    });

    document.getElementById('btn-street-sense')?.addEventListener('click', () => {
      this.streetSenseActive = !this.streetSenseActive;
      document.getElementById('btn-street-sense')?.classList.toggle('active-toggle', this.streetSenseActive);
      this.audio.playUiClick(620);
    });

    document.getElementById('btn-evil-agenda')?.addEventListener('click', () => {
      this.audio.playUiClick();
      this.renderEvilAgenda();
      this.toggleModal('agenda-modal', true);
    });
    document.getElementById('btn-close-agenda')?.addEventListener('click', () => {
      this.toggleModal('agenda-modal', false);
    });

    document.getElementById('btn-island-map')?.addEventListener('click', () => {
      this.audio.playUiClick();
      this.toggleModal('map-modal', true);
    });
    document.getElementById('btn-close-map')?.addEventListener('click', () => {
      this.toggleModal('map-modal', false);
    });
    document.querySelectorAll('.map-room-btn, .map-pin-badge').forEach((btn) => {
      btn.addEventListener('click', () => {
        const r = (btn as HTMLElement).dataset.room as RoomId;
        this.toggleModal('map-modal', false);
        this.switchRoom(r);
      });
    });

    // Config Modal
    document.getElementById('btn-open-config')?.addEventListener('click', () => {
      this.audio.playUiClick();
      this.toggleModal('config-modal', true);
    });
    document.getElementById('btn-close-config')?.addEventListener('click', () => {
      this.toggleModal('config-modal', false);
    });
    document.getElementById('btn-save-config')?.addEventListener('click', () => {
      this.audio.playUiClick(560);
      this.toggleModal('config-modal', false);
    });

    this.bindVolumeSlider('cfg-master-vol', 'lbl-master-vol', (v) => {
      this.audio.masterVolume = v;
      this.audio.updateVolumes();
    });
    this.bindVolumeSlider('cfg-music-vol', 'lbl-music-vol', (v) => {
      this.audio.musicVolume = v;
      this.audio.updateVolumes();
    });
    this.bindVolumeSlider('cfg-voice-vol', 'lbl-voice-vol', (v) => {
      this.audio.voiceVolume = v;
    });
    this.bindVolumeSlider('cfg-sfx-vol', 'lbl-sfx-vol', (v) => {
      this.audio.sfxVolume = v;
    });

    document.querySelectorAll('.voice-test-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const v = (btn as HTMLElement).dataset.voice as VoiceProfileId;
        this.audio.playVoicePhraseSample(v);
      });
    });

    document.getElementById('cfg-lighting')?.addEventListener('change', (e) => {
      this.cfgLighting = (e.target as HTMLInputElement).checked;
    });
    document.getElementById('cfg-foreground')?.addEventListener('change', (e) => {
      this.cfgForeground = (e.target as HTMLInputElement).checked;
    });
    document.getElementById('cfg-crt')?.addEventListener('change', (e) => {
      this.cfgCrt = (e.target as HTMLInputElement).checked;
      document.body.classList.toggle('crt-enabled', this.cfgCrt);
    });
    document.getElementById('cfg-debug-walkbox')?.addEventListener('change', (e) => {
      this.cfgDebugWalkbox = (e.target as HTMLInputElement).checked;
    });
    document.getElementById('cfg-dev-notes')?.addEventListener('change', (e) => {
      this.cfgDevNotes = (e.target as HTMLInputElement).checked;
    });
    document.getElementById('cfg-control-mode')?.addEventListener('change', (e) => {
      this.cfgControlMode = (e.target as HTMLSelectElement).value as 'hybrid' | 'classic';
    });

    document.getElementById('btn-reset-save')?.addEventListener('click', () => {
      this.flags = createInitialFlags();
      this.inventory = [];
      this.selectedItemId = null;
      this.renderInventoryBar();
      this.toggleModal('config-modal', false);
      this.switchRoom('Z1S3');
    });

    // Funky Town Musical Keypad Modal
    document.getElementById('btn-close-keypad')?.addEventListener('click', () => {
      this.toggleModal('puzzle-keypad-modal', false);
    });
    document.getElementById('btn-keypad-demo')?.addEventListener('click', () => {
      this.audio.playFunkyTownHook();
      const disp = document.getElementById('keypad-led-display')!;
      disp.textContent = 'CLUE MELODY: DO - DO - TIb - DO (C5 - C5 - Bb4 - C5)!';
    });
    document.getElementById('btn-keypad-reset')?.addEventListener('click', () => {
      this.keypadEntered = [];
      document.getElementById('keypad-led-display')!.textContent = 'MELODY: [ _ _ _ _ ]';
    });
    document.querySelectorAll('.synth-key').forEach((btn) => {
      btn.addEventListener('click', () => {
        const note = (btn as HTMLElement).dataset.note || 'C5';
        this.onKeypadPress(note);
      });
    });

    // Act I Finale & Victory Credits Modal
    document.getElementById('btn-close-victory')?.addEventListener('click', () => {
      this.toggleModal('victory-credits-modal', false);
    });
    document.getElementById('btn-victory-keep-playing')?.addEventListener('click', () => {
      this.audio.playUiClick(540);
      this.toggleModal('victory-credits-modal', false);
    });
    document.getElementById('btn-victory-castle')?.addEventListener('click', () => {
      this.audio.playUiClick(580);
      this.toggleModal('victory-credits-modal', false);
      this.switchRoom('LOLDEMO');
    });

    // Canvas mouse & context menu events
    this.canvas.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredHotspotId = null;
      document.getElementById('hotspot-tooltip')!.style.display = 'none';
    });
    this.canvas.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e));
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.openRmbMenuAt(e);
    });

    // Close action menu if clicking elsewhere
    window.addEventListener('mousedown', (e) => {
      const menu = document.getElementById('rmb-action-menu')!;
      if (menu.style.display !== 'none' && !menu.contains(e.target as Node)) {
        menu.style.display = 'none';
      }
    });

    // Keyboard shortcuts & LucasArts horizontal room scrolling / walking
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        this.streetSenseActive = true;
      } else if (e.key === ' ') {
        this.flushDialogueTypewriter();
      } else if (e.key === 'Escape') {
        this.toggleModal('config-modal', true);
      } else if (e.key.toLowerCase() === 'm') {
        this.toggleModal('map-modal', true);
      } else if (e.key.toLowerCase() === 'h') {
        this.renderEvilAgenda();
        this.toggleModal('agenda-modal', true);
      } else if (e.key.toLowerCase() === 'k') {
        this.toggleSketchMode2010();
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        const dest = this.clampToWalkbox(this.player.x - 420, this.player.y);
        this.walkTo(dest.x, dest.y, null);
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        const dest = this.clampToWalkbox(this.player.x + 420, this.player.y);
        this.walkTo(dest.x, dest.y, null);
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        const dest = this.clampToWalkbox(this.player.x, this.player.y - 95);
        this.walkTo(dest.x, dest.y, null);
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        const dest = this.clampToWalkbox(this.player.x, this.player.y + 95);
        this.walkTo(dest.x, dest.y, null);
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Tab') {
        this.streetSenseActive = false;
      }
    });

    // Dedicated X dismiss button: immediately stops typewriter AND collapses scroll on first click!
    document.getElementById('btn-dismiss-dialogue')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.audio.playUiClick(480);
      this.isTyping = false;
      this.visibleChars = this.fullDialogueText.length;
      document.getElementById('hud-bottom-box')?.classList.add('dialogue-collapsed');
    });

    // Bottom box click to skip typewriter or collapse when done
    document.getElementById('hud-bottom-box')?.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).classList.contains('dialogue-choice-btn')) return;
      if ((e.target as HTMLElement).id === 'btn-dismiss-dialogue') return;
      if (this.isTyping) {
        this.flushDialogueTypewriter();
      } else {
        const choicesEl = document.getElementById('dialogue-choices-list');
        if (!choicesEl || choicesEl.children.length === 0) {
          document.getElementById('hud-bottom-box')?.classList.add('dialogue-collapsed');
        }
      }
    });
  }

  public toggleSketchMode2010(): void {
    this.sketchMode2010 = !this.sketchMode2010;
    this.audio.playUiClick(580);
    const btn = document.getElementById('btn-sketch-mode');
    if (btn) {
      btn.classList.toggle('active-toggle', this.sketchMode2010);
    }
  }

  public flushDialogueTypewriter(): void {
    if (this.isTyping) {
      this.visibleChars = this.fullDialogueText.length;
      this.isTyping = false;
      this.updateDialogueDom();
    }
  }

  private hideOverlays(): void {
    const tip = document.getElementById('hotspot-tooltip');
    if (tip) tip.style.display = 'none';
    const menu = document.getElementById('rmb-action-menu');
    if (menu) menu.style.display = 'none';
  }

  private bindVolumeSlider(id: string, labelId: string, onChange: (val: number) => void): void {
    const el = document.getElementById(id) as HTMLInputElement | null;
    const lbl = document.getElementById(labelId);
    el?.addEventListener('input', () => {
      const v = Number(el.value);
      if (lbl) lbl.textContent = `${v}%`;
      onChange(v / 100);
    });
  }

  public toggleModal(id: string, show: boolean): void {
    this.hideOverlays();
    this.flushDialogueTypewriter();
    const el = document.getElementById(id);
    if (el) el.style.display = show ? 'flex' : 'none';
  }

  public startIntroCinematic(): void {
    this.hideOverlays();
    document.getElementById('main-menu-overlay')!.style.display = 'none';
    document.getElementById('intro-overlay')!.style.display = 'flex';
    this.introTheatre.autoPlay = true;
    const lbl = document.getElementById('intro-playpause-label');
    if (lbl) lbl.textContent = 'Pause Auto-Play';
    this.introTheatre.setScene(0);
  }

  public showIntroAct(idx: number): void {
    this.introTheatre.setScene(idx);
  }

  private syncIntroDomForScene(idx: number): void {
    this.currentIntroIndex = idx;
    const act = INTRO_SCENES_8[idx];
    document.getElementById('intro-act-badge')!.textContent = act.badge;
    document.getElementById('intro-speaker-tag')!.textContent = act.speaker;

    const textEl = document.getElementById('intro-narration-text')!;
    textEl.textContent = act.text;

    const nextLbl = document.getElementById('intro-next-label');
    if (nextLbl) {
      nextLbl.textContent = idx === INTRO_SCENES_8.length - 1 ? 'Board Submarine!' : 'Next Scene';
    }

    const dotsEl = document.getElementById('intro-progress-dots');
    if (dotsEl) {
      dotsEl.innerHTML = '';
      for (let i = 0; i < INTRO_SCENES_8.length; i++) {
        const dot = document.createElement('span');
        dot.className = `intro-dot ${i === idx ? 'active' : ''}`;
        dot.title = INTRO_SCENES_8[i].badge;
        dot.addEventListener('click', () => {
          this.audio.playUiClick(520);
          this.introTheatre.setScene(i);
        });
        dotsEl.appendChild(dot);
      }
    }
  }

  public enterGameplay(startRoom: RoomId): void {
    this.hideOverlays();
    document.getElementById('main-menu-overlay')!.style.display = 'none';
    document.getElementById('intro-overlay')!.style.display = 'none';
    document.getElementById('hud-top-bar')!.classList.remove('hud-hidden');
    document.getElementById('hud-bottom-box')!.classList.remove('hud-hidden');
    this.switchRoom(startRoom);
  }

  public switchRoom(room: RoomId): void {
    this.hideOverlays();
    this.audio.playDoorHatch();
    const prevRoom = this.currentRoom;
    this.currentRoom = room;
    this.walkTargetX = null;
    this.walkTargetY = null;
    this.pendingCallback = null;
    this.player.isWalking = false;
    this.steamPuffs = [];

    const banner = document.getElementById('room-banner')!;
    if (room === 'Z1S3') {
      banner.textContent = "Captain Dread's Cabin";
      this.player.x = 700;
      this.player.y = 810;
      this.player.facing = 1;
      this.cameraX = 120;
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'OBSERVING',
        "Captain Dread's submarine quarters! Scavenge the Bag of Hammers, Tripod Portrait Stand, and Desk Super-Glue to assemble da Vinci's Perpetual Movement Machine!"
      );
    } else if (room === 'Z1S2') {
      banner.textContent = 'Submarine VIP Lounge & Candy Vault';
      this.player.x = prevRoom === 'Z1S3' ? 1580 : 540;
      this.player.y = 645;
      this.player.facing = prevRoom === 'Z1S3' ? -1 : 1;
      this.cameraX = Math.max(0, Math.min(600, this.player.x - 800));
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'SCHEMING',
        'The Submarine VIP Lounge. A Baby is guarding his musical Candy Vault, and the Ventriloquist is arguing with his wooden dummy.'
      );
    } else if (room === 'Z1S1') {
      banner.textContent = 'Submarine Engine Room (Lower Deck)';
      this.player.x = 995;
      this.player.y = 635;
      this.player.facing = -1;
      this.cameraX = 200;

      if (!this.flags.pedalBrokenBam) {
        this.npcs.nihongo.poseIndex = 0;
        this.speakLine(
          'NIHONGO NOHONDES',
          'nihongo',
          'assets/portraits/nihongo.png',
          'EXHAUSTED',
          'Huff... puff... I have been pedaling this rusty submarine since Port Machete! Wait... what is that horrible cracking sound in the main pedal crank?!',
          [
            {
              label: 'Inspect the straining bicycle pedal crank (Trigger BAM!)',
              replySpeaker: 'NIHONGO NOHONDES',
              replyVoice: 'nihongo',
              replyPortrait: 'assets/portraits/nihongo.png',
              replyMood: 'PANIC!',
              replyText:
                "BAM!! AIEEE! The main pedal snapped right off! I quit! Take Leonardo da Vinci's Perpetual Movement Machine blueprint on the floor and fix it yourself!",
              onSelectFlag: 'pedalBrokenBam',
            },
          ]
        );
      } else if (!this.flags.perpetualMachineInstalled) {
        this.npcs.nihongo.poseIndex = 1;
        this.setTemporaryPlayerPose(6, 2200, true);
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'GRUMPY',
          "The submarine pedal drive is snapped in half, and I refuse to pedal like a common peasant! I need to build da Vinci's Perpetual Movement Machine and install it here."
        );
      } else {
        this.npcs.nihongo.poseIndex = 3;
        this.speakLine(
          'CAPTAIN DREAD',
          'cap_dread',
          'art/approved/capdread/capdread.head.png',
          'TRIUMPHANT',
          "YARRR! Look at those hammers swing! Da Vinci's Perpetual Movement Machine is propelling the Substampede at 900 knots toward Blackspit Island!"
        );
      }
    } else if (room === 'LOLDEMO') {
      banner.textContent = 'Haunted Castle Courtyard (2010 Tribute)';
      this.player.x = 380;
      this.player.y = 720;
      this.player.facing = 1;
      this.cameraX = 0;
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'NOSTALGIC',
        'The Haunted Castle Courtyard! Look at that creepy two-faced cut-out sun. Whatever you do, do NOT knock on the haunted castle door...'
      );
    }
  }

  public getRoomWidth(): number {
    return ROOM_WIDTHS[this.currentRoom] || 1600;
  }

  public computeParallaxOffset(
    parallaxFactor = 1.0,
    _parallaxAnchorX = 800,
    parX = 0,
    parY = 0
  ): { dx: number; dy: number } {
    const camParallaxDx = (this.cameraX - 400) * (1.0 - parallaxFactor);
    return {
      dx: camParallaxDx + parX * parallaxFactor,
      dy: parY * parallaxFactor,
    };
  }

  private getHotspotWorldRect(h: HotspotDef): { x: number; y: number; w: number; h: number } {
    const parX = ((this.mouseX - this.canvas.width * 0.5) / this.canvas.width) * -14;
    const parY = ((this.mouseY - this.canvas.height * 0.5) / this.canvas.height) * -8;
    const pFactor = h.parallaxFactor ?? 1.0;
    const anchorX = h.parallaxAnchorX ?? h.x + h.w * 0.5;
    const { dx, dy } = this.computeParallaxOffset(pFactor, anchorX, parX, parY);
    return {
      x: h.x + dx,
      y: h.y + dy,
      w: h.w,
      h: h.h,
    };
  }

  private getCanvasCoords(e: MouseEvent): { x: number; y: number; viewX: number; viewY: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const viewX = (e.clientX - rect.left) * scaleX;
    const viewY = (e.clientY - rect.top) * scaleY;
    return {
      x: viewX + this.cameraX,
      y: viewY,
      viewX,
      viewY,
    };
  }

  private getVisibleHotspots(): HotspotDef[] {
    const list = ROOM_HOTSPOTS[this.currentRoom] || [];
    return list.filter((h) => !h.visibleWhen || h.visibleWhen(this.flags));
  }

  private getVisibleSceneObjects(): SceneObjectDef[] {
    const list = ROOM_OBJECTS[this.currentRoom] || [];
    return list.filter((o) => !o.visibleWhen || o.visibleWhen(this.flags));
  }

  private findHotspotAt(worldX: number, worldY: number): HotspotDef | null {
    const list = this.getVisibleHotspots();
    for (let i = list.length - 1; i >= 0; i--) {
      const h = list[i];
      const r = this.getHotspotWorldRect(h);
      if (worldX >= r.x && worldX <= r.x + r.w && worldY >= r.y && worldY <= r.y + r.h) {
        return h;
      }
    }
    return null;
  }

  private onCanvasMouseMove(e: MouseEvent): void {
    const pt = this.getCanvasCoords(e);
    this.mouseX = pt.viewX;
    this.mouseY = pt.viewY;
    this.player.lookTargetX = pt.x;
    this.player.lookTargetY = pt.y;

    const hit = this.findHotspotAt(pt.x, pt.y);
    this.hoveredHotspotId = hit ? hit.id : null;
    const tip = document.getElementById('hotspot-tooltip')!;
    if (hit) {
      this.canvas.style.cursor = 'pointer';
      tip.style.display = 'block';
      const stageRect = document.getElementById('stage-container')!.getBoundingClientRect();
      tip.style.left = `${e.clientX - stageRect.left}px`;
      tip.style.top = `${e.clientY - stageRect.top}px`;
      if (this.selectedItemId && ITEMS_CATALOG[this.selectedItemId]) {
        tip.innerHTML = `<span class="tooltip-Hints">Use <strong>${ITEMS_CATALOG[this.selectedItemId].name}</strong> on ${hit.name}</span>`;
      } else {
        tip.innerHTML = `<div>${hit.name}</div><div class="tooltip-Hints">Click: Act &nbsp;&bull;&nbsp; Menu: Actions</div>`;
      }
    } else {
      this.canvas.style.cursor = 'crosshair';
      tip.style.display = 'none';
    }
  }

  private onCanvasMouseDown(e: MouseEvent): void {
    this.audio.unlock();
    if (e.button !== 0) return;

    const menu = document.getElementById('rmb-action-menu')!;
    if (menu.style.display !== 'none') {
      menu.style.display = 'none';
      return;
    }

    const pt = this.getCanvasCoords(e);

    // Check if clicking the Left or Right Wide-Room Scroll Indicator Arrows on the stage edge!
    const maxCamX = Math.max(0, this.getRoomWidth() - 1600);
    if (maxCamX > 0 && pt.viewY >= 360 && pt.viewY <= 540) {
      if (pt.viewX <= 72 && this.cameraX > 15) {
        const dest = this.clampToWalkbox(this.player.x - 560, this.player.y);
        this.walkTo(dest.x, dest.y, null);
        return;
      }
      if (pt.viewX >= 1528 && this.cameraX < maxCamX - 15) {
        const dest = this.clampToWalkbox(this.player.x + 560, this.player.y);
        this.walkTo(dest.x, dest.y, null);
        return;
      }
    }

    const hit = this.findHotspotAt(pt.x, pt.y);

    if (hit) {
      this.objectPulseMap.set(hit.id, 1.0);
      if (this.cfgControlMode === 'classic') {
        this.openRmbMenuForHotspot(hit, e);
        return;
      }
      if (this.selectedItemId) {
        this.walkAndExecute(hit, () => this.executeVerbOnHotspot(hit, 'item'));
      } else if (hit.isExitTo) {
        this.walkAndExecute(hit, () => this.switchRoom(hit.isExitTo!));
      } else if (hit.cursor === 'talk') {
        this.walkAndExecute(hit, () => this.executeVerbOnHotspot(hit, 'talk'));
      } else if (hit.cursor === 'grab') {
        this.walkAndExecute(hit, () => this.executeVerbOnHotspot(hit, 'grab'));
      } else {
        this.walkAndExecute(hit, () => this.executeVerbOnHotspot(hit, 'inspect'));
      }
    } else {
      // Walking freely on the open floor collapses the dialogue box so the player has full-screen room!
      document.getElementById('hud-bottom-box')?.classList.add('dialogue-collapsed');
      const clamped = this.clampToWalkbox(pt.x, pt.y);
      this.walkTo(clamped.x, clamped.y, null);
      this.spawnSparks(clamped.x, clamped.y, '#3be8d8', 7);
    }
  }

  private openRmbMenuAt(e: MouseEvent): void {
    this.audio.unlock();
    const pt = this.getCanvasCoords(e);
    const hit = this.findHotspotAt(pt.x, pt.y);
    if (!hit) {
      if (this.selectedItemId) {
        this.selectInventoryItem(null);
      }
      return;
    }
    this.objectPulseMap.set(hit.id, 1.0);
    this.openRmbMenuForHotspot(hit, e);
  }

  private openRmbMenuForHotspot(hit: HotspotDef, e: MouseEvent): void {
    this.audio.playUiClick(520);
    document.getElementById('hotspot-tooltip')!.style.display = 'none';
    const menu = document.getElementById('rmb-action-menu')!;
    const title = document.getElementById('rmb-target-title')!;
    title.textContent = hit.name;

    const itemBtn = document.getElementById('rmb-use-item-btn')!;
    const itemTxt = document.getElementById('rmb-use-item-text')!;
    if (this.selectedItemId && ITEMS_CATALOG[this.selectedItemId]) {
      itemBtn.style.display = 'flex';
      itemTxt.textContent = `Use ${ITEMS_CATALOG[this.selectedItemId].name}`;
    } else {
      itemBtn.style.display = 'none';
    }

    const stageRect = document.getElementById('stage-container')!.getBoundingClientRect();
    const left = Math.min(stageRect.width - 210, Math.max(12, e.clientX - stageRect.left));
    const top = Math.min(stageRect.height - 190, Math.max(12, e.clientY - stageRect.top));
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.style.display = 'block';

    menu.querySelectorAll('.rmb-verb-btn').forEach((btn) => {
      const clone = btn.cloneNode(true) as HTMLElement;
      btn.parentNode?.replaceChild(clone, btn);
      clone.addEventListener('click', () => {
        const verb = clone.dataset.verb as 'grab' | 'inspect' | 'talk' | 'item';
        menu.style.display = 'none';
        this.walkAndExecute(hit, () => this.executeVerbOnHotspot(hit, verb));
      });
    });
  }

  private clampToWalkbox(x: number, y: number): { x: number; y: number } {
    const maxW = this.getRoomWidth();
    if (this.currentRoom === 'Z1S3') {
      return {
        x: Math.max(150, Math.min(maxW - 150, x)),
        y: Math.max(730, Math.min(855, y)),
      };
    }
    if (this.currentRoom === 'Z1S1') {
      return {
        x: Math.max(220, Math.min(maxW - 220, x)),
        y: Math.max(600, Math.min(685, y)),
      };
    }
    if (this.currentRoom === 'LOLDEMO') {
      return {
        x: Math.max(160, Math.min(maxW - 180, x)),
        y: Math.max(665, Math.min(835, y)),
      };
    }
    return {
      x: Math.max(150, Math.min(maxW - 150, x)),
      y: Math.max(730, Math.min(855, y)),
    };
  }

  private walkAndExecute(hit: HotspotDef, action: () => void): void {
    const dest = this.clampToWalkbox(hit.walkX, hit.walkY);
    this.walkTo(dest.x, dest.y, () => {
      const targetCenterX = hit.x + hit.w * 0.5;
      this.player.facing = targetCenterX >= this.player.x ? 1 : -1;
      action();
    });
  }

  public walkTo(x: number, y: number, onArrive: (() => void) | null): void {
    this.hoveredHotspotId = null;
    const tip = document.getElementById('hotspot-tooltip');
    if (tip) tip.style.display = 'none';
    this.walkTargetX = x;
    this.walkTargetY = y;
    this.pendingCallback = onArrive;
    if (Math.abs(x - this.player.x) > 4) {
      this.player.facing = x >= this.player.x ? 1 : -1;
    }
  }

  public executeVerbOnHotspot(hit: HotspotDef, verb: 'grab' | 'inspect' | 'talk' | 'item'): void {
    this.rigs.triggerSquash(this.player, 1.14, 0.88);
    this.objectPulseMap.set(hit.id, 1.0);

    // Trigger Smoothface's expressive cutout poses & separate emotion cutouts!
    if (verb === 'inspect') {
      this.setTemporaryPlayerPose(4, 1800, false); // Magnifying Glass + Question Cutout
    } else if (verb === 'grab' || verb === 'item') {
      this.setTemporaryPlayerPose(5, 1600, false); // Wrench Tinker + Idea Lightbulb Cutout
    }

    // Handle Z1S3 Bulkhead Door in Slice 1
    if (hit.id === 'z1s3_door_lounge') {
      if (verb === 'talk') {
        this.setTemporaryPlayerPose(6, 2000, true);
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'ANNOYED',
          'Hello, rusty submarine hatch! Open sesame! ...Nope, still requires manual labor.'
        );
        return;
      }
      if (this.flags.perpetualMachineBuilt) {
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'VICTORY!',
          "With Leonardo da Vinci's Perpetual Movement Machine assembled in my pockets, I am ready to march out of Captain Dread's cabin and power the Substampede to Blackspit Island!"
        );
        window.setTimeout(() => {
          this.toggleModal('victory-credits-modal', true);
        }, 1200);
      } else {
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'INSPECTING PASSAGE',
          "That heavy bulkhead door leads forward toward the submarine drive room. Before I head out, I must scavenge the Bag of Hammers, the Tripod Portrait Stand, and the Desk Super-Glue here in Captain Dread's Cabin and assemble the Perpetual Movement Machine!"
        );
      }
      return;
    }

    // Handle 'item' verb on any hotspot other than the pedal engine
    if (verb === 'item' && hit.id !== 'z1s1_pedal_engine' && this.selectedItemId) {
      const itemName = ITEMS_CATALOG[this.selectedItemId]?.name || 'this item';
      this.setTemporaryPlayerPose(6, 2000, true);
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'SCHEMING',
        `Using ${itemName} on ${hit.name} will not assemble the machine! Click the Bag of Hammers, Tripod Portrait Stand, and Industrial Super-Glue inside the top inventory bar to combine them!`
      );
      return;
    }

    // ---------------------------------------------------------
    // CAPTAIN DREAD'S QUARTERS
    // ---------------------------------------------------------
    if (hit.id === 'z1s3_hammer_bag') {
      if (verb === 'inspect') {
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'ANALYZING',
          'A canvas bag overflowing with heavy iron hammers. Why does Captain Dread sleep next to a sack of sledgehammers?'
        );
      } else if (verb === 'talk') {
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'WHISPERING',
          '"Hello, my heavy iron friends. Soon you shall defy the laws of thermodynamics."'
        );
      } else {
        this.flags.gotHammerBag = true;
        this.addInventoryItem('hammer_bag');
        this.setTemporaryPlayerPose(5, 1600, false);
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'ACQUIRED!',
          'Got the Bag of Hammers! Heavy, blunt, and wonderfully destructive.'
        );
      }
      return;
    }

    if (hit.id === 'z1s3_portrait_stand') {
      if (verb === 'inspect') {
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'CRITIQUING',
          'An oil portrait of Captain Dread looking heroic on a sturdy wooden tripod easel stand.'
        );
      } else if (verb === 'talk') {
        this.setTemporaryPlayerPose(6, 2000, true);
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'SCOFFING',
          "Even in an oil painting, Captain Dread's beard takes up eighty percent of the canvas."
        );
      } else {
        this.flags.gotPortraitStand = true;
        this.addInventoryItem('portrait_stand');
        this.npcs.cap_dread.poseIndex = 3;
        setTimeout(() => (this.npcs.cap_dread.poseIndex = 0), 1600);
        this.speakLine(
          'CAPTAIN DREAD',
          'cap_dread',
          'art/approved/capdread/capdread.head.png',
          'INDIGNANT',
          'Oi! Careful with me royal portrait easel, Mr. Smoothface! That tripod is genuine Driftwood Mahogany!'
        );
      }
      return;
    }

    if (hit.id === 'z1s3_desk_drawer') {
      if (verb === 'inspect') {
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'OBSERVING',
          this.flags.gotGlue
            ? "Captain Dread's mahogany desk drawer. I already took the Industrial Super-Glue."
            : 'A slightly ajar mahogany desk drawer. Something golden and sticky is glinting inside.'
        );
      } else if (verb === 'talk') {
        this.setTemporaryPlayerPose(6, 1800, true);
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'SARCASTIC',
          'I do not converse with furniture. I am an evil genius, not a ventriloquist.'
        );
      } else if (!this.flags.gotGlue) {
        this.flags.drawerOpened = true;
        this.flags.gotGlue = true;
        this.addInventoryItem('glue');
        this.setTemporaryPlayerPose(5, 1700, false);
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'ACQUIRED!',
          "I opened Captain Dread's desk drawer and found a bottle of Industrial Super-Glue! Sticky enough to hold a Rube Goldberg contraption together."
        );
      } else {
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'EMPTY',
          'Just unpaid submarine parking tickets and beard grooming receipts in this drawer now.'
        );
      }
      return;
    }

    if (hit.id === 'z1s3_cap_dread') {
      if (verb === 'inspect') {
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'INSPECTING',
          'Captain Dread, commander of the Substampede. Ninety percent curly bouffant hair, ten percent questionable maritime credentials.'
        );
        return;
      }
      if (verb === 'grab') {
        this.npcs.cap_dread.poseIndex = 2;
        setTimeout(() => (this.npcs.cap_dread.poseIndex = 0), 1500);
        this.speakLine(
          'CAPTAIN DREAD',
          'cap_dread',
          'art/approved/capdread/capdread.head.png',
          'WARNING',
          'YARRR! Keep yer hairless mitts off me royal pirate coat, lad!'
        );
        return;
      }
      this.npcs.cap_dread.poseIndex = 1;
      this.speakLine(
        'CAPTAIN DREAD',
        'cap_dread',
        'art/approved/capdread/capdread.head.png',
        'BOOMING',
        'Yarrr! Welcome to me luxury quarters aboard the Substampede, hairless lad! Why the long, smooth face?',
        [
          {
            label: '"How is this rust-bucket submarine actually propelled?"',
            replySpeaker: 'CAPTAIN DREAD',
            replyVoice: 'cap_dread',
            replyPortrait: 'art/approved/capdread/capdread.head.png',
            replyMood: 'PROUD',
            replyText:
              'One hundred percent eco-friendly pedal power! Me faithful engineer Nihongo Nohondes is down in the Engine Room pedaling the main drive right now!',
          },
          {
            label: '"Where did you put the spare wooden Ship\'s Helm?"',
            replySpeaker: 'CAPTAIN DREAD',
            replyVoice: 'cap_dread',
            replyPortrait: 'art/approved/capdread/capdread.head.png',
            replyMood: 'GRUMBLING',
            replyText:
              'That tiny gorilla toddler "A Baby" in the VIP Lounge locked me spare Ship\'s Helm inside his high-tech Candy Vault! It uses a musical synthesizer lock!',
          },
          {
            label: '"Your beard is almost as obnoxious as my brother Morgan\'s."',
            replySpeaker: 'CAPTAIN DREAD',
            replyVoice: 'cap_dread',
            replyPortrait: 'art/approved/capdread/capdread.head.png',
            replyMood: 'LAUGHING',
            replyText:
              'BWAHAHA! Jealousy will get ye nowhere, cue-ball! Climb down the iron ladder if ye want to see real submarine engineering!',
          },
        ]
      );
      return;
    }

    if (hit.id === 'z1s3_sarcophagus') {
      this.setTemporaryPlayerPose(6, 2200, true);
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'GRUMPY',
        'A solid gold Egyptian sarcophagus inside a submarine. Even an ancient mummy has a better sculpted chin beard than me! Bah!'
      );
      return;
    }

    if (hit.id === 'z1s3_crt_tv' || hit.id === 'z1s3_tv_fishbowl') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'BEMUSED',
        'A 1970s wood-grain CRT television broadcasting deep-sea static right next to a bowl of water. Truly finest pirate electrical safety standards.'
      );
      return;
    }

    if (hit.id === 'z1s3_fishbowl') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'INSPECTING',
        "Captain Dread's grumpy pet goldfish swimming in a tiny glass bowl. Even inside a submarine surrounded by the Atlantic Ocean, this fish is stuck in a bowl."
      );
      return;
    }

    if (hit.id === 'z1s3_rotary_phone') {
      this.audio.playUiClick(780);
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'DIALING',
        'A crimson rotary telephone wired to the bridge. Wait, there is no bridge on this submarine, just a bicycle in the basement!'
      );
      return;
    }

    if (hit.id === 'z1s3_bunk_bed') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'INSPECTING',
        "Captain Dread's wooden bunk bed. The mattress is stuffed with old nautical charts and beard trimmings."
      );
      return;
    }

    if (hit.id === 'z1s3_porthole' || hit.id === 'z1s2_porthole' || hit.id === 'z1s1_porthole') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'PEERING OUTSIDE',
        'Murky cyan ocean depths outside the riveted brass porthole. Even the deep-sea fish out there have catfish whiskers!'
      );
      return;
    }

    if (hit.id === 'z1s3_spark_cable' || hit.id === 'z1s2_spark_cable' || hit.id === 'z1s1_spark_cable') {
      this.spawnSparks(hit.x + hit.w * 0.5, hit.y + hit.h * 0.85, '#3be8d8', 22);
      this.setTemporaryPlayerPose(8, 1500, false);
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'HIGH VOLTAGE!',
        'BZZZT! A frayed electrical cable showering live sparks across the hull. I am NOT touching that bare wire!'
      );
      return;
    }

    if (hit.id === 'z1s3_steam_pipe' || hit.id === 'z1s2_steam_pipe' || hit.id === 'z1s1_steam_pipe') {
      for (let i = 0; i < 6; i++) {
        this.spawnSteamPuff(hit.x + hit.w * 0.5, hit.y + hit.h * 0.48, hit.x > 800 ? -1 : 1);
      }
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'STEAMING',
        'HSSSSS! A leaky brass steam valve venting scalding clouds of vapour. Great for dramatic supervillain entrances, terrible for my complexion.'
      );
      return;
    }

    if (hit.id === 'z1s3_mss_poster') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'FOURTH WALL',
        '"MOONSTORM STUDIOS". Six Costa Rican gentlemen who had the audacity to draw me without a single hair on my chin!'
      );
      return;
    }

    if (hit.id === 'z1s3_stache_photo') {
      this.setTemporaryPlayerPose(6, 2500, true);
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'FURIOUS!',
        'GAH! A framed portrait of my twin brother Dr. Morgan Stache and his gloriously thick moustache! Why does everyone on this submarine worship his upper lip?!'
      );
      return;
    }

    if (hit.id === 'z1s3_wall_masks') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'OBSERVING',
        "Captain Dread's wall of exotic theatre masks, a decorative wheel, and tin rations. At least the masks do not have bushy moustaches."
      );
      return;
    }

    if (hit.id === 'z1s3_coat_rack') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'CRITIQUING',
        "Captain Dread's spare trenchcoat and tricorn hat hanging on a crooked wooden peg rack. It smells like sea salt, pipe tobacco, and unearned confidence."
      );
      return;
    }

    if (hit.id === 'z1s3_periscope') {
      this.setTemporaryPlayerPose(4, 1800, false);
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'PEERING',
        'The submarine optical periscope! According to the depth gauge, we are currently cruising three leagues beneath a flock of unsuspecting seagulls.'
      );
      return;
    }

    if (hit.id === 'z1s3_nightstand_lamp') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'OBSERVING',
        'A crooked wooden crate nightstand and a precariously tilted reading lamp. One good submarine torpedo jolt and that lamp is history.'
      );
      return;
    }

    if (hit.id === 'z1s3_dirty_clothes') {
      this.setTemporaryPlayerPose(6, 1900, true);
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'DISGUSTED',
        'A pile of unwashed pirate laundry on the deck planks. Even the Malefic Gentlemen Syndicate has stricter hygiene standards than this!'
      );
      return;
    }

    if (hit.id === 'z1s3_ship_bottle') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'FASCINATED',
        'A miniature pirate galleon trapped inside a glass bottle on the foreground chart table. At least that ship does not run on stationary bicycles.'
      );
      return;
    }

    if (hit.id === 'z1s3_clown_voodoo') {
      this.setTemporaryPlayerPose(6, 2100, true);
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'CREEPED OUT',
        'A creepy painted clown head bust and a yellow voodoo pincushion doll sitting on a sea chest. Wait: why does the voodoo doll have pins stuck where a moustache should be?!'
      );
      return;
    }

    // ---------------------------------------------------------
    // SUBMARINE VIP LOUNGE & CANDY VAULT
    // ---------------------------------------------------------
    if (hit.id === 'z1s2_a_baby') {
      if (verb === 'inspect') {
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'INSPECTING',
          'A Baby: a gorilla-proportioned mobster toddler chomping a swirl lollipop like a cigar. His knuckles are larger than my head.'
        );
        return;
      }
      if (verb === 'grab') {
        this.npcs.a_baby.poseIndex = 2;
        setTimeout(() => (this.npcs.a_baby.poseIndex = 0), 1500);
        this.speakLine(
          'A BABY',
          'a_baby',
          'assets/portraits/a_baby.png',
          'GROWLING',
          'Try to pick me up like a normal toddler, baldy, and you will be swimming with the sea-monkeys!'
        );
        return;
      }
      this.npcs.a_baby.poseIndex = 1;
      this.speakLine(
        'A BABY',
        'a_baby',
        'assets/portraits/a_baby.png',
        'MOBSTER TODDLER',
        'Goo-goo badda-bing, baldy. You touch my High-Tech Candy Vault without knowing the four-note disco password, and I fold you like a stroller.',
        [
          {
            label: '"Why are there chocolate smudges on three of the synthesizer keys?"',
            replySpeaker: 'A BABY',
            replyVoice: 'a_baby',
            replyPortrait: 'assets/portraits/a_baby.png',
            replyMood: 'SMUG',
            replyText:
              'Heh. Maybe I was eating fudge before punching in my favorite 1980 disco classic: "Funky Town"! The smudges are on DO (C5), TIb (Bb4), and SOL (G4). First four notes open the vault: DO - DO - TIb - DO!',
            onSelectFlag: 'funkyTownClueLearned',
          },
          {
            label: 'Open the Chocolate-Smeared Musical Keypad right now!',
            replySpeaker: 'MR. SMOOTHFACE',
            replyVoice: 'smoothface',
            replyPortrait: 'art/approved/smoothface/smoothface.head.png',
            replyMood: 'TINKERING',
            replyText: 'Let us play the 4-note "Funky Town" melody on these chocolate-stained keys!',
            openModal: 'keypad',
          },
        ]
      );
      return;
    }

    if (hit.id === 'z1s2_ventriloquist') {
      if (verb === 'inspect') {
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'INSPECTING',
          'An exhausted stage ventriloquist holding Clash McTrevor, a wooden dummy wearing a Napoleonic bicorne hat with a live red ambulance siren bolted on top.'
        );
        return;
      }
      this.npcs.ventriloquist.poseIndex = 1;
      this.speakLine(
        'CLASH McTREVOR (THE WOODEN DUMMY)',
        'rapoleon',
        'assets/portraits/ventriloquist.png',
        'HYPED MC',
        'YO! Do not talk to the tall sleepy guy in the suit, talk to ME: Clash McTrevor, aka RAPOLEON! Want a rhyme or an emergency siren?',
        [
          {
            label: '"Drop a Medieval French Rap clue about A Baby\'s vault!"',
            replySpeaker: 'RAPOLEON (THE DUMMY)',
            replyVoice: 'rapoleon',
            replyPortrait: 'assets/portraits/ventriloquist.png',
            replyMood: 'RAPPING',
            replyText:
              "Sacre bleu, check the chocolate stain! Hit DO (C5) twice, then TI-flat (Bb4) again, finish on DO (C5) to unlock the wheel, and build da Vinci's machine of steel!",
            onSelectFlag: 'funkyTownClueLearned',
          },
          {
            label: '"Why do you have a red police light bolted to your bicorne hat?"',
            replySpeaker: 'AMBULANCE SIREN DUMMY',
            replyVoice: 'siren',
            replyPortrait: 'assets/portraits/ventriloquist.png',
            replyMood: 'WEE-OO! WEE-OO!',
            replyText:
              'WEE-OO! WEE-OO! BECAUSE AT CIRQUE DU SOLAME I DOUBLE AS AN EMERGENCY AMBULANCE! WEE-OO! WEE-OO!',
            onSelectFlag: 'sirenTriggered',
          },
        ]
      );
      return;
    }

    if (hit.id === 'z1s2_funky_vault') {
      if (this.flags.vaultUnlocked && this.flags.gotHelm) {
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'SOLVED',
          'I already cracked A Baby\'s "Funky Town" synthesizer lock and claimed the Ship\'s Wooden Helm!'
        );
      } else {
        this.keypadEntered = [];
        document.getElementById('keypad-led-display')!.textContent = this.flags.funkyTownClueLearned
          ? 'MELODY: [ _ _ _ _ ] (Clue: DO - DO - TIb - DO)'
          : 'MELODY: [ _ _ _ _ ]';
        this.toggleModal('puzzle-keypad-modal', true);
      }
      return;
    }

    if (hit.id === 'z1s2_lounge_sofa') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'CRITIQUING',
        'A tufted crimson velvet lounge sofa. Covered in lollipop wrappers, ventriloquist sawdust, and sea-salt stains.'
      );
      return;
    }

    if (hit.id === 'z1s2_samurai_wall') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'IMPRESSED',
        'A traditional Japanese samurai tapestry and katana rack belonging to Nihongo Nohondes. Wait: he is actually Costa Rican and just really loves anime.'
      );
      return;
    }

    if (hit.id === 'z1s2_mystery_box') {
      this.setTemporaryPlayerPose(4, 1800, false);
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'CAUTIOUS',
        'A wooden shipping crate addressed to "Evil Deeds College, Blackspit Island". Two glowing yellow eyes are blinking inside. I will leave it shut.'
      );
      return;
    }

    // ---------------------------------------------------------
    // SUBMARINE ENGINE ROOM
    // ---------------------------------------------------------
    if (hit.id === 'z1s1_nihongo') {
      if (verb === 'inspect') {
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'INSPECTING',
          "Nihongo Nohondes, the Substampede's overworked pedal mechanic. His calves look like cannonballs, but his morale is completely shattered."
        );
        return;
      }
      if (!this.flags.pedalBrokenBam) {
        this.triggerPedalBreakBam();
      } else if (!this.flags.nihongoGaveBlueprint) {
        this.flags.nihongoGaveBlueprint = true;
        this.addInventoryItem('blueprint');
        this.npcs.nihongo.poseIndex = 2;
        this.speakLine(
          'NIHONGO NOHONDES',
          'nihongo',
          'assets/portraits/nihongo.png',
          'DESPERATE',
          "Here! Take Leonardo da Vinci's Perpetual Movement Machine Blueprint! Combine the Ship's Helm, Portrait Stand, Bag of Hammers, and Super-Glue in your inventory, then use the machine on the broken pedal!"
        );
      } else if (!this.flags.perpetualMachineInstalled) {
        this.npcs.nihongo.poseIndex = 2;
        this.speakLine(
          'NIHONGO NOHONDES',
          'nihongo',
          'assets/portraits/nihongo.png',
          'COACHING',
          "You have the blueprint! Collect: (1) Bag of Hammers, (2) Portrait Stand, and (3) Super-Glue from Captain's Cabin, plus (4) Ship's Helm from A Baby's Vault in the VIP Lounge! Click them in your inventory to assemble the machine!"
        );
      } else {
        this.npcs.nihongo.poseIndex = 3;
        this.speakLine(
          'NIHONGO NOHONDES',
          'nihongo',
          'assets/portraits/nihongo.png',
          'SALUTING',
          'Arigato, Mr. Smoothface! My calves are finally free! The Perpetual Movement Machine is spinning by itself forever!'
        );
      }
      return;
    }

    if (hit.id === 'z1s1_blueprint_pickup') {
      this.flags.nihongoGaveBlueprint = true;
      this.addInventoryItem('blueprint');
      this.npcs.nihongo.poseIndex = 2;
      this.setTemporaryPlayerPose(5, 1800, false);
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'EUREKA!',
        "I picked up Leonardo da Vinci's Perpetual Movement Machine Blueprint! Now I just need to combine the Ship's Helm, Portrait Stand, Bag of Hammers, and Super-Glue!"
      );
      return;
    }

    if (hit.id === 'z1s1_pedal_engine') {
      if (!this.flags.pedalBrokenBam) {
        this.triggerPedalBreakBam();
        return;
      }
      const hasAllParts = ['hammer_bag', 'portrait_stand', 'glue', 'helm'].every((p) =>
        this.inventory.includes(p)
      );
      if (
        this.selectedItemId === 'perpetual_machine' ||
        this.inventory.includes('perpetual_machine') ||
        hasAllParts
      ) {
        if (!this.flags.perpetualMachineBuilt && hasAllParts) {
          this.assemblePerpetualMachine();
        }
        this.installPerpetualMachine();
        return;
      }
      if (this.flags.perpetualMachineInstalled) {
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'EVIL GENIUS',
          'My da Vinci Perpetual Movement Machine is bolted to the drive shaft, swinging four iron hammers in an infinite gravitational loop! Eat your heart out, Morgan!'
        );
      } else {
        this.setTemporaryPlayerPose(6, 2200, true);
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'DISGUSTED',
          'The main bicycle pedal is snapped clean off, and an aspiring supervillain does NOT do cardio. I must assemble the Perpetual Movement Machine and install it here!'
        );
      }
      return;
    }

    if (hit.id === 'z1s1_rat_tv') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'AMUSED',
        'The bilge rats down here have their own glowing television and a lifetime supply of potatoes. They live better than the crew.'
      );
      return;
    }

    if (hit.id === 'z1s1_rad_barrels') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'SUSPICIOUS',
        'Rusty barrels of "Submarine Bilge Juice". It is glowing slightly green, which explains why the bilge rats have their own living room.'
      );
      return;
    }

    // ---------------------------------------------------------
    // BONUS: HAUNTED CASTLE COURTYARD
    // ---------------------------------------------------------
    if (hit.id === 'lol_castle_door') {
      this.flags.trollSpawned = true;
      this.cameraShakeTime = 0.55;
      this.cameraShakeMag = 14;
      this.audio.playPedalSnapBam();
      this.setTemporaryPlayerPose(8, 2200, false);
      this.speakLine(
        'ALEX CASTLE TROLL',
        'troll',
        'assets/loldemo/troll_alex.png',
        'ACHIEVEMENT: GOSU!',
        'ROOOAAARGH!! You knocked on the haunted castle door! Achievement Unlocked: GOSU!'
      );
      return;
    }

    if (hit.id === 'lol_two_faced_sun') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'art/approved/smoothface/smoothface.head.png',
        'OBSERVING',
        'Cristian Morales and Jose David Aguilar\'s original paper cut-out sun! Even the sun has a creepier grin than Captain Dread.'
      );
      return;
    }
  }

  private triggerPedalBreakBam(): void {
    this.flags.pedalBrokenBam = true;
    this.npcs.nihongo.poseIndex = 1;
    this.setTemporaryPlayerPose(8, 2200, false);
    this.cameraShakeTime = 0.55;
    this.cameraShakeMag = 16;
    this.audio.playPedalSnapBam();
    this.spawnSparks(1060, 420, '#ff9f2e', 40);
    this.speakLine(
      'NIHONGO NOHONDES',
      'nihongo',
      'assets/portraits/nihongo.png',
      'BAM!! PEDAL SNAPPED!',
      "BAM!! AIEEE! The main bicycle pedal just snapped off in a shower of sparks! Pick up Leonardo da Vinci's Blueprint on the floor or talk to me!"
    );
  }

  private onKeypadPress(note: string): void {
    const solfegeMap: Record<string, string> = {
      F4: 'FA',
      Fs4: 'FA#',
      G4: 'SOL',
      Gs4: 'SOL#',
      A4: 'LA',
      Bb4: 'TIb',
      B4: 'TI',
      C5: 'DO',
      Cs5: 'DO#',
      D5: 'RE',
      Eb5: 'MIb',
      E5: 'MI',
      F5: 'FA',
    };
    this.audio.playSynthNote(note, 0.24);
    this.keypadEntered.push(note);
    if (this.keypadEntered.length > 4) {
      this.keypadEntered.shift();
    }
    const disp = document.getElementById('keypad-led-display')!;
    const readable = this.keypadEntered.map((n) => solfegeMap[n] || n).join(' - ');
    disp.textContent = `NOTES: [ ${readable} ]`;

    const target = ['C5', 'C5', 'Bb4', 'C5'];
    if (
      this.keypadEntered.length === 4 &&
      this.keypadEntered.every((n, idx) => n === target[idx])
    ) {
      this.flags.vaultUnlocked = true;
      this.flags.gotHelm = true;
      this.npcs.a_baby.poseIndex = 3;
      this.setTemporaryPlayerPose(5, 2000, false);
      this.audio.playCombineSuccess();
      this.addInventoryItem('helm');
      disp.textContent = 'ACCESS GRANTED! FUNKY TOWN VERIFIED!';
      setTimeout(() => {
        this.toggleModal('puzzle-keypad-modal', false);
        this.speakLine(
          'A BABY',
          'a_baby',
          'assets/portraits/a_baby.png',
          'RESPECT',
          'Well blow me pacifier, baldy! You played "Funky Town" like a true disco don! Here is Captain Dread\'s Wooden Ship\'s Helm from inside the vault!'
        );
      }, 650);
    }
  }

  public addInventoryItem(id: string): void {
    if (!this.inventory.includes(id)) {
      this.inventory.push(id);
      this.audio.playPickupChime();
      this.renderInventoryBar();
    }
  }

  public setInventoryMode(mode: 'select' | 'inspect'): void {
    this.inventoryMode = mode;
    this.audio.playUiClick(460);
    document.getElementById('btn-mode-select')?.classList.toggle('active', mode === 'select');
    document.getElementById('btn-mode-inspect')?.classList.toggle('active', mode === 'inspect');
  }

  private updateActiveItemBanner(): void {
    const lbl = document.getElementById('active-item-label');
    const clr = document.getElementById('btn-clear-item');
    if (!lbl || !clr) return;
    if (this.selectedItemId && ITEMS_CATALOG[this.selectedItemId]) {
      lbl.textContent = `Held: ${ITEMS_CATALOG[this.selectedItemId].name}`;
      clr.style.display = 'inline-block';
    } else if (this.inventory.length === 0) {
      lbl.textContent = 'Pockets Empty';
      clr.style.display = 'none';
    } else {
      lbl.textContent = `${this.inventory.length} Item${this.inventory.length > 1 ? 's' : ''} in Pack`;
      clr.style.display = 'none';
    }
  }

  public selectInventoryItem(id: string | null): void {
    this.selectedItemId = id;
    this.updateActiveItemBanner();
    this.renderInventoryBar();
  }

  public renderInventoryBar(): void {
    this.updateActiveItemBanner();
    const container = document.getElementById('inventory-slots')!;
    container.innerHTML = '';

    for (const itemId of this.inventory) {
      const def = ITEMS_CATALOG[itemId];
      if (!def) continue;
      const slot = document.createElement('div');
      slot.className = `inv-slot ${this.selectedItemId === itemId ? 'selected' : ''}`;
      slot.title = def.name;
      const img = document.createElement('img');
      img.src = def.icon;
      img.alt = def.name;
      slot.appendChild(img);

      slot.addEventListener('click', () => {
        if (this.inventoryMode === 'inspect') {
          this.audio.playUiClick(520);
          this.setTemporaryPlayerPose(4, 1800, false);
          this.speakLine('MR. SMOOTHFACE', 'smoothface', def.icon, `ITEM: ${def.name.toUpperCase()}`, def.inspectText);
          return;
        }
        // In Use/Combine mode: clicking another part of the Perpetual Machine attempts to combine!
        if (this.selectedItemId && this.selectedItemId !== itemId) {
          this.tryCombineItems(this.selectedItemId, itemId);
        } else {
          this.audio.playUiClick(500);
          this.selectInventoryItem(this.selectedItemId === itemId ? null : itemId);
        }
      });

      container.appendChild(slot);
    }
  }

  private tryCombineItems(itemA: string, itemB: string): void {
    const machineParts = ['hammer_bag', 'portrait_stand', 'glue', 'helm', 'blueprint'];
    if (machineParts.includes(itemA) && machineParts.includes(itemB)) {
      const required = ['hammer_bag', 'portrait_stand', 'glue'];
      const missing = required.filter((r) => !this.inventory.includes(r));
      if (missing.length === 0) {
        this.assemblePerpetualMachine();
      } else {
        const missingNames = missing.map((m) => ITEMS_CATALOG[m].name).join(', ');
        this.audio.playUiClick(300);
        this.setTemporaryPlayerPose(4, 1800, false);
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'art/approved/smoothface/smoothface.head.png',
          'ALMOST READY!',
          `To finish assembling da Vinci's Perpetual Movement Machine in my pockets, I still need to scavenge: ${missingNames}!`
        );
      }
      return;
    }

    this.setTemporaryPlayerPose(6, 1800, true);
    this.speakLine(
      'MR. SMOOTHFACE',
      'smoothface',
      'art/approved/smoothface/smoothface.head.png',
      'NOPE',
      `Combining ${ITEMS_CATALOG[itemA]?.name} with ${ITEMS_CATALOG[itemB]?.name} makes zero sense, even by Blackspit Island standards.`
    );
  }

  public assemblePerpetualMachine(): void {
    this.flags.perpetualMachineBuilt = true;
    this.inventory = this.inventory.filter(
      (id) => !['hammer_bag', 'portrait_stand', 'glue', 'helm'].includes(id)
    );
    if (!this.inventory.includes('perpetual_machine')) {
      this.inventory.push('perpetual_machine');
    }
    this.selectInventoryItem('perpetual_machine');
    this.setTemporaryPlayerPose(5, 2200, false);
    this.audio.playCombineSuccess();
    this.spawnSparks(this.player.x, this.player.y - 140, '#3be8d8', 32);
    this.speakLine(
      'MR. SMOOTHFACE',
      'smoothface',
      'art/approved/smoothface/smoothface.head.png',
      'INVENTION COMPLETE!',
      "BWAHAHA! By gluing the Bag of Hammers onto the Tripod Portrait Stand with Captain Dread's Industrial Super-Glue, I have assembled Leonardo da Vinci's Perpetual Movement Machine!"
    );
    window.setTimeout(() => {
      this.toggleModal('victory-credits-modal', true);
    }, 2200);
  }

  public installPerpetualMachine(): void {
    this.flags.perpetualMachineInstalled = true;
    this.inventory = this.inventory.filter((id) => id !== 'perpetual_machine');
    this.selectInventoryItem(null);
    this.npcs.nihongo.poseIndex = 3;
    this.setTemporaryPlayerPose(5, 2400, false);
    this.cameraShakeTime = 0.85;
    this.cameraShakeMag = 12;
    this.audio.playCombineSuccess();
    this.spawnSparks(1060, 415, '#ffdf6b', 50);
    this.speakLine(
      'MR. SMOOTHFACE',
      'smoothface',
      'art/approved/smoothface/smoothface.head.png',
      'PUZZLE SOLVED! FULL STEAM AHEAD!',
      "IT WORKS! The heavy hammers pull the ship's helm down, which flips the next hammer over the top in an endless gravitational loop! The Substampede is blasting toward Blackspit Island at supersonic speed!"
    );
    window.setTimeout(() => {
      this.toggleModal('victory-credits-modal', true);
    }, 1800);
  }

  public renderEvilAgenda(): void {
    const spreadBox = document.getElementById('agenda-content');
    if (!spreadBox) return;

    const allPartsFound =
      this.flags.gotHammerBag &&
      this.flags.gotPortraitStand &&
      this.flags.gotGlue &&
      this.flags.gotHelm;

    const steps = [
      {
        step: 'STEP I',
        title: 'Engine Room Pedal Crisis',
        done: this.flags.pedalBrokenBam && this.flags.nihongoGaveBlueprint,
        locked: false,
        icon: 'assets/props/item_blueprint.png',
        note: "Climb down to the Engine Room, witness the pedal snap (BAM!), and take da Vinci's Blueprint.",
      },
      {
        step: 'STEP II',
        title: "Scavenge Captain's Quarters",
        done: this.flags.gotHammerBag && this.flags.gotPortraitStand && this.flags.gotGlue,
        locked: false,
        icon: 'assets/props/hammer_bag.png',
        note: "Collect the Bag of Hammers, Tripod Portrait Stand, and Super-Glue from Dread's Cabin.",
      },
      {
        step: 'STEP III',
        title: 'Crack the "Funky Town" Vault',
        done: this.flags.gotHelm,
        locked: false,
        icon: 'assets/objects/obj_funky_vault.png',
        note: 'Play DO - DO - TIb - DO on A Baby\'s chocolate-stained synth lock to win the Ship\'s Helm.',
      },
      {
        step: 'STEP IV',
        title: 'Install Perpetual Machine',
        done: this.flags.perpetualMachineInstalled,
        locked: !allPartsFound && !this.flags.perpetualMachineBuilt && !this.flags.perpetualMachineInstalled,
        icon: 'assets/props/perpetual_machine_cutout.png',
        note: 'Combine all 4 parts into the Perpetual Movement Machine and bolt it to the Engine Crank!',
      },
    ];

    const completedCount = steps.filter((s) => s.done).length;

    const parts = [
      {
        id: 'helm',
        name: "Wooden Ship's Helm",
        room: 'VIP Lounge Vault',
        icon: 'assets/props/item_helm.png',
        found:
          this.flags.gotHelm ||
          this.flags.perpetualMachineBuilt ||
          this.flags.perpetualMachineInstalled,
      },
      {
        id: 'portrait_stand',
        name: 'Tripod Portrait Stand',
        room: "Captain's Cabin",
        icon: 'assets/props/item_portrait_stand.png',
        found:
          this.flags.gotPortraitStand ||
          this.flags.perpetualMachineBuilt ||
          this.flags.perpetualMachineInstalled,
      },
      {
        id: 'hammer_bag',
        name: 'Bag of Hammers',
        room: "Captain's Cabin Floor",
        icon: 'assets/props/hammer_bag.png',
        found:
          this.flags.gotHammerBag ||
          this.flags.perpetualMachineBuilt ||
          this.flags.perpetualMachineInstalled,
      },
      {
        id: 'glue',
        name: 'Industrial Super-Glue',
        room: "Captain's Desk Drawer",
        icon: 'assets/props/item_glue.png',
        found:
          this.flags.gotGlue ||
          this.flags.perpetualMachineBuilt ||
          this.flags.perpetualMachineInstalled,
      },
    ];
    const foundCount = parts.filter((p) => p.found).length;
    const canAssemble =
      foundCount === 4 &&
      !this.flags.perpetualMachineBuilt &&
      !this.flags.perpetualMachineInstalled;

    spreadBox.innerHTML = `
      <div class="sketchbook-page-left">
        <div class="sketch-page-header">
          <h3>RUPERT'S EVIL DOSSIER</h3>
          <span>${completedCount} / 4 COMPLETE</span>
        </div>
        <div class="sketch-mission-list">
          ${steps
            .map(
              (s) => `
            <div class="sketch-mission-card ${s.done ? 'done' : ''}">
              <img src="${s.icon}" class="sketch-mission-thumb" alt="" />
              <div class="sketch-mission-body">
                <h4>${s.step}: ${s.title}</h4>
                <p>${s.note}</p>
              </div>
              <div class="sketch-stamp ${s.locked && !s.done ? 'locked' : ''}">${
                s.done ? 'SOLVED!' : s.locked ? 'LOCKED' : 'ACTIVE'
              }</div>
            </div>`
            )
            .join('')}
        </div>
      </div>

      <div class="sketchbook-page-right">
        <div class="blueprint-page-header">
          <h3>DA VINCI CONTRAPTION SCHEMATIC</h3>
          <span>PARTS: ${foundCount} / 4</span>
        </div>
        <div class="blueprint-parts-grid">
          ${parts
            .map(
              (p) => `
            <div class="blueprint-part-card ${p.found ? 'collected' : 'missing'}">
              <img src="${p.icon}" alt="${p.name}" />
              <div class="blueprint-part-meta">
                <strong>${p.name}</strong>
                <span>${p.room}</span>
                <div class="blueprint-part-status">${p.found ? '&#10004; ACQUIRED' : '&#9744; MISSING'}</div>
              </div>
            </div>`
            )
            .join('')}
        </div>
        <div class="blueprint-assembly-footer">
          <div class="blueprint-final-preview">
            <img src="assets/props/perpetual_machine_cutout.png" alt="Perpetual Machine" />
            <div class="blueprint-final-text">
              <strong>PERPETUAL MOVEMENT MACHINE</strong>
              <span>${
                this.flags.perpetualMachineInstalled
                  ? 'Installed & spinning at 900 knots!'
                  : this.flags.perpetualMachineBuilt
                  ? 'Built! Use on Engine Room Pedal Crank!'
                  : 'Collect all 4 parts to glue contraption!'
              }</span>
            </div>
          </div>
          <button id="btn-sketchbook-assemble" class="blueprint-assemble-btn" ${
            canAssemble ? '' : 'disabled'
          }>
            ${
              this.flags.perpetualMachineInstalled
                ? 'INSTALLED!'
                : this.flags.perpetualMachineBuilt
                ? 'BUILT!'
                : 'GLUE PARTS!'
            }
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-sketchbook-assemble')?.addEventListener('click', () => {
      if (canAssemble) {
        this.assemblePerpetualMachine();
        this.renderEvilAgenda();
      }
    });
  }

  public speakLine(
    speaker: string,
    voice: VoiceProfileId,
    portraitSrc: string,
    mood: string,
    text: string,
    choices: DialogueOption[] = []
  ): void {
    const bottomBox = document.getElementById('hud-bottom-box');
    if (bottomBox) {
      bottomBox.classList.remove('dialogue-collapsed');
    }

    document.getElementById('speaker-name-badge')!.textContent = speaker;
    document.getElementById('dialogue-mood-tag')!.textContent = mood;
    const pImg = document.getElementById('speaker-portrait') as HTMLImageElement;
    pImg.src = portraitSrc;

    this.fullDialogueText = text;
    this.visibleChars = 0;
    this.typeTimer = 0;
    this.activeVoice = voice;
    this.isTyping = true;

    const choicesEl = document.getElementById('dialogue-choices-list')!;
    choicesEl.innerHTML = '';
    for (const c of choices) {
      const btn = document.createElement('button');
      btn.className = 'dialogue-choice-btn';
      btn.textContent = c.label;
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this.audio.playUiClick(540);
        if (c.onSelectFlag === 'pedalBrokenBam') {
          this.triggerPedalBreakBam();
          return;
        }
        if (c.onSelectFlag === 'sirenTriggered') {
          this.npcs.ventriloquist.poseIndex = 2;
        } else if (c.onSelectFlag) {
          this.flags[c.onSelectFlag] = true;
        }
        if (c.openModal === 'keypad') {
          this.keypadEntered = [];
          this.toggleModal('puzzle-keypad-modal', true);
        }
        this.speakLine(c.replySpeaker, c.replyVoice, c.replyPortrait, c.replyMood, c.replyText);
      });
      choicesEl.appendChild(btn);
    }

    this.updateDialogueDom();
  }

  private updateDialogueDom(): void {
    const el = document.getElementById('dialogue-text-content')!;
    el.textContent = this.fullDialogueText.slice(0, this.visibleChars);
    const wave = document.getElementById('voice-wave-indicator')!;
    wave.classList.toggle('speaking', this.isTyping);
  }

  private update(dt: number): void {
    // 1. Update Typewriter (advances by whole words so screenshots never capture half-cut words!)
    if (this.isTyping) {
      this.typeTimer += dt;
      const charsPerSec = 140;
      let targetChars = Math.min(
        this.fullDialogueText.length,
        Math.floor(this.typeTimer * charsPerSec)
      );
      while (
        targetChars < this.fullDialogueText.length &&
        this.fullDialogueText[targetChars] !== ' '
      ) {
        targetChars++;
      }
      if (targetChars > this.visibleChars) {
        const ch = this.fullDialogueText.charCodeAt(this.visibleChars) || 65;
        if (ch > 32) {
          this.audio.triggerVoiceSyllable(this.activeVoice, ch);
        }
        this.visibleChars = targetChars;
        this.updateDialogueDom();
      }
      if (this.visibleChars >= this.fullDialogueText.length) {
        this.isTyping = false;
        this.updateDialogueDom();
      }
    }

    const voiceAmp = this.audio.getVoiceAmplitude();
    const activeVoice = this.audio.getActiveSpeaker();

    // Portrait speaking bounce
    const portraitEl = document.getElementById('speaker-portrait');
    if (portraitEl) {
      const pScale = 1 + voiceAmp * 0.08;
      const pRot = Math.sin(performance.now() * 0.025) * voiceAmp * 3.5;
      portraitEl.style.transform = `scale(${pScale.toFixed(3)}) rotate(${pRot.toFixed(2)}deg)`;
    }

    // 2. Update Main Menu Puppet Showcase (cycling poses + separate emotion cutouts!)
    const nowMs = performance.now();
    this.menuShowcasePuppet.talkAmp =
      activeVoice === 'smoothface' ? voiceAmp : Math.max(0, Math.sin(nowMs * 0.004) * 0.25);
    this.menuShowcasePuppet.isWalking = Math.floor(nowMs / 3600) % 3 === 1;
    this.menuShowcasePuppet.grumpyMode = Math.floor(nowMs / 4800) % 3 === 2;
    this.menuShowcasePuppet.poseIndex = Math.floor(nowMs / 4800) % 3 === 0 ? 4 : 0;
    this.rigs.updatePuppetState(this.menuShowcasePuppet, dt);

    // 3. Update Player Movement along Spacious 1600x900 Walkbox
    if (this.walkTargetX !== null && this.walkTargetY !== null) {
      const dx = this.walkTargetX - this.player.x;
      const dy = this.walkTargetY - this.player.y;
      const dist = Math.hypot(dx, dy);
      const speed = 350;
      if (dist <= speed * dt) {
        this.player.x = this.walkTargetX;
        this.player.y = this.walkTargetY;
        this.walkTargetX = null;
        this.walkTargetY = null;
        this.player.isWalking = false;
        this.rigs.triggerSquash(this.player, 1.09, 0.92);
        if (this.pendingCallback) {
          const cb = this.pendingCallback;
          this.pendingCallback = null;
          cb();
        }
      } else {
        this.player.x += (dx / dist) * speed * dt;
        this.player.y += (dy / dist) * speed * dt;
        this.player.isWalking = true;
        this.stepSoundTimer -= dt;
        if (this.stepSoundTimer <= 0) {
          this.stepSoundTimer = 0.25;
          this.audio.playFootstep(this.currentRoom === 'Z1S1');
          this.spawnSparks(this.player.x, this.player.y, 'rgba(215,198,170,0.65)', 3);
        }
      }
    } else {
      this.player.isWalking = false;
    }

    // Perspective depth scaling for Smoothface based on floor Y (`layout/z1s3.layout.json` 315px standing height!)
    if (this.currentRoom === 'LOLDEMO') {
      const lolDepth = (this.player.y - 665) / 170;
      this.player.scale = Math.max(0.80, Math.min(0.95, 0.82 + lolDepth * 0.12));
    } else {
      const depthRatio = Math.max(0, Math.min(1, (this.player.y - 730) / 125));
      this.player.scale = 0.92 + depthRatio * 0.13;
    }
    this.player.talkAmp = activeVoice === 'smoothface' ? voiceAmp : 0;
    this.rigs.updatePuppetState(this.player, dt, () => this.audio.playPaperFlip());

    // Smooth LucasArts Horizontal Camera Displacement across wide multi-plane rooms (player tracking + mouse-edge panning!)
    const maxCamX = Math.max(0, this.getRoomWidth() - 1600);
    if (maxCamX > 0) {
      let targetCamX = Math.max(0, Math.min(maxCamX, this.player.x - 800));
      // Allow classic Point-and-Click mouse-edge camera panning when not actively walking
      if (!this.player.isWalking) {
        if (this.mouseX < 105 && this.mouseY > 75 && this.mouseY < 820) {
          this.cameraX = Math.max(0, this.cameraX - dt * 440);
          targetCamX = this.cameraX;
        } else if (this.mouseX > 1495 && this.mouseY > 75 && this.mouseY < 820) {
          this.cameraX = Math.min(maxCamX, this.cameraX + dt * 440);
          targetCamX = this.cameraX;
        }
      }
      if (this.player.isWalking) {
        this.cameraX += (targetCamX - this.cameraX) * Math.min(1, dt * 6.5);
      }
    } else {
      this.cameraX = 0;
    }

    // 4. Update NPCs in active room
    for (const [id, npc] of Object.entries(this.npcs)) {
      npc.lookTargetX = this.player.x;
      npc.lookTargetY = this.player.y - 140;
      if (
        (id === 'cap_dread' && activeVoice === 'cap_dread') ||
        (id === 'nihongo' && activeVoice === 'nihongo') ||
        (id === 'a_baby' && activeVoice === 'a_baby') ||
        (id === 'ventriloquist' &&
          (activeVoice === 'ventriloquist' || activeVoice === 'rapoleon' || activeVoice === 'siren'))
      ) {
        npc.talkAmp = voiceAmp;
      } else {
        npc.talkAmp = 0;
      }
      this.rigs.updatePuppetState(npc, dt);
    }

    // 5. Update Object Click Bounce Pulses
    for (const [k, v] of this.objectPulseMap.entries()) {
      const next = v - dt * 3.2;
      if (next <= 0) {
        this.objectPulseMap.delete(k);
      } else {
        this.objectPulseMap.set(k, next);
      }
    }

    // 6. Update Perpetual Machine Wheel & Living Environmental FX Spawners
    if (this.flags.perpetualMachineInstalled) {
      this.supersonicSpeed = Math.min(14.0, this.supersonicSpeed + dt * 4.5);
      this.perpetualWheelAngle += dt * this.supersonicSpeed;
    }

    if (this.cameraShakeTime > 0) {
      this.cameraShakeTime = Math.max(0, this.cameraShakeTime - dt);
    }

    // Continuous Steam Valve Puff Spawner
    this.steamSpawnTimer -= dt;
    if (this.steamSpawnTimer <= 0) {
      this.steamSpawnTimer = 0.22;
      const objs = this.getVisibleSceneObjects();
      for (const o of objs) {
        if (o.fxType === 'steam_valve') {
          const dirX = o.flipX ? -1 : 1;
          this.spawnSteamPuff(o.x + o.w * 0.52, o.y + o.h * 0.46, dirX);
        }
      }
    }

    // Continuous Sparking Cable Spawner
    this.sparkSpawnTimer -= dt;
    if (this.sparkSpawnTimer <= 0) {
      this.sparkSpawnTimer = 0.35 + Math.random() * 0.45;
      const objs = this.getVisibleSceneObjects();
      for (const o of objs) {
        if (o.fxType === 'spark_cable') {
          this.spawnSparks(o.x + o.w * 0.5, o.y + o.h * 0.88, '#5ef2ff', 5);
          this.spawnSparks(o.x + o.w * 0.5, o.y + o.h * 0.88, '#ffdf6b', 4);
        }
      }
    }

    for (let i = this.steamPuffs.length - 1; i >= 0; i--) {
      const sp = this.steamPuffs[i];
      sp.life += dt;
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.r += 18 * dt;
      if (sp.life >= sp.maxLife) {
        this.steamPuffs.splice(i, 1);
      }
    }

    for (const m of this.dustMotes) {
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.y < -10) m.y = 910;
      if (m.x < -10) m.x = 1610;
      if (m.x > 1610) m.x = -10;
    }

    for (const b of this.bubbles) {
      b.y += b.vy * (this.flags.perpetualMachineInstalled ? 3.5 : 1.0) * dt;
      if (b.y < -20) {
        b.y = 920;
        b.x = Math.random() * 1600;
      }
    }

    for (let i = this.fxParticles.length - 1; i >= 0; i--) {
      const p = this.fxParticles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 280 * dt;
      if (p.life >= p.maxLife) {
        this.fxParticles.splice(i, 1);
      }
    }
  }

  private renderMainMenuShowcase(): void {
    const mainMenu = document.getElementById('main-menu-overlay');
    if (!mainMenu || mainMenu.style.display === 'none') return;

    const ctx = this.menuPuppetCtx;
    const w = this.menuPuppetCanvas.width;
    const h = this.menuPuppetCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createRadialGradient(w * 0.5, h * 0.48, 15, w * 0.5, h * 0.48, 210);
    grad.addColorStop(0, 'rgba(59, 232, 216, 0.22)');
    grad.addColorStop(0.6, 'rgba(227, 182, 90, 0.08)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    this.rigs.renderSmoothfaceRig(ctx, this.menuShowcasePuppet);
  }

  private renderStage(): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const parX = ((this.mouseX - w * 0.5) / w) * -14;
    const parY = ((this.mouseY - h * 0.5) / h) * -8;

    const shakeX = this.cameraShakeTime > 0 ? (Math.random() - 0.5) * this.cameraShakeMag : 0;
    const shakeY = this.cameraShakeTime > 0 ? (Math.random() - 0.5) * this.cameraShakeMag : 0;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Dark iron backdrop fill behind multi-plane cutout tiles
    ctx.fillStyle = '#151018';
    ctx.fillRect(0, 0, w, h);

    // Apply LucasArts horizontal camera scroll in world space
    ctx.save();
    ctx.translate(-this.cameraX, 0);

    // ---------------------------------------------------------
    // LAYER 1: WIDE SCROLLING ROOM SHELL (OR 2010 AGUILAR SKETCH MODE!)
    // ---------------------------------------------------------
    const roomW = this.getRoomWidth();
    if (this.currentRoom === 'LOLDEMO') {
      this.renderLolDemoRoom(ctx, parX, parY, roomW, h);
    } else {
      const shellKey = this.sketchMode2010
        ? `${this.currentRoom.toLowerCase()}_sketch_2010`
        : `${this.currentRoom.toLowerCase()}_shell`;
      const shellImg = this.getImg(shellKey) || this.getImg(`${this.currentRoom.toLowerCase()}_shell`);
      if (shellImg) {
        ctx.drawImage(shellImg, -10 + parX * 0.35, -6 + parY * 0.35, roomW + 20, h + 12);
      }
    }

    // ---------------------------------------------------------
    // LAYER 2: Y-SORTED MODULAR CUT-OUT SCENE OBJECTS & CHARACTERS
    // ("CADA cosa en pantalla existe como un objeto aparte")
    // ---------------------------------------------------------
    const renderList: Array<{ sortY: number; draw: () => void }> = [];

    for (const obj of this.getVisibleSceneObjects()) {
      if (!this.cfgForeground && obj.sortY >= 850) continue;
      if (this.sketchMode2010 && obj.inSituSeamless) continue;
      renderList.push({
        sortY: obj.sortY,
        draw: () => this.renderSingleCutoutSceneObject(ctx, obj, parX, parY),
      });
    }

    // Add Player & Room NPCs to the same Y-sorted depth list!
    renderList.push({
      sortY: this.player.y,
      draw: () => this.rigs.renderSmoothfaceRig(ctx, this.player),
    });

    if (this.currentRoom === 'Z1S3') {
      renderList.push({
        sortY: this.npcs.cap_dread.y,
        draw: () => this.rigs.renderNpcPuppet(ctx, this.npcs.cap_dread),
      });
    } else if (this.currentRoom === 'Z1S2') {
      renderList.push({
        sortY: this.npcs.a_baby.y,
        draw: () => this.rigs.renderNpcPuppet(ctx, this.npcs.a_baby),
      });
      renderList.push({
        sortY: this.npcs.ventriloquist.y,
        draw: () => this.rigs.renderNpcPuppet(ctx, this.npcs.ventriloquist),
      });
    } else if (this.currentRoom === 'Z1S1') {
      renderList.push({
        sortY: this.npcs.nihongo.y,
        draw: () => this.rigs.renderNpcPuppet(ctx, this.npcs.nihongo),
      });
    }

    renderList.sort((a, b) => a.sortY - b.sortY);
    for (const item of renderList) {
      item.draw();
    }

    // ---------------------------------------------------------
    // LAYER 3: LIVING ENVIRONMENTAL FX LOOPS (STEAM, SPARKS, BUBBLES)
    // ---------------------------------------------------------
    this.renderEnvironmentalParticles(ctx);

    // ---------------------------------------------------------
    // LAYER 4: VOLUMETRIC SWEEPING LAMP CONES & PORTHOLE BEAMS
    // ---------------------------------------------------------
    if (this.cfgLighting) {
      this.renderVolumetricLighting(ctx, w, h, parX, parY);
    }

    if (this.streetSenseActive) {
      this.renderStreetSenseHotspots(ctx);
    }

    if (this.cfgDebugWalkbox) {
      this.renderDebugWalkbox(ctx);
    }

    ctx.restore(); // End world-space camera translation (-this.cameraX)

    // Render screen-space theatrical shadowbox vignette & wide-room scroll arrows
    this.renderViewportVignetteAndScrollArrows(ctx, w, h);

    ctx.restore();
  }

  /**
   * Renders a single standalone RGBA Paper Cut-Out SceneObject (`SceneObjectDef`)
   * with multi-plane horizontal + Y-depth parallax offset, 12 FPS stop-motion feel,
   * hover highlight, click squash-and-stretch bounce, and attached FX!
   */
  private renderSingleCutoutSceneObject(
    ctx: CanvasRenderingContext2D,
    obj: SceneObjectDef,
    parX: number,
    parY: number
  ): void {
    const t = performance.now() * 0.001;
    // Quantize ambient idle animations to 12 FPS stop-motion ticks for handcrafted cardboard feel!
    const tQuant = Math.floor(t * 12) / 12;
    const img = this.getImg(obj.imageKey);

    const pFactor = obj.parallaxFactor ?? (obj.sortY > 750 ? 1.25 : 0.92);
    const anchorX = obj.parallaxAnchorX ?? obj.x + obj.w * 0.5;
    const { dx: parDx, dy: parDy } = this.computeParallaxOffset(pFactor, anchorX, parX, parY);
    const ox = obj.x + parDx;
    const oy = obj.y + parDy;

    const isHovered = Boolean(obj.hotspotId && this.hoveredHotspotId === obj.hotspotId);
    const clickPulse = obj.hotspotId ? this.objectPulseMap.get(obj.hotspotId) || 0 : 0;

    // Compute crooked cardboard tilt + 12 FPS stop-motion idle + hover + click transforms
    let rot = ((obj.tiltDeg || 0) * Math.PI) / 180;
    let dy = 0;
    const sx =
      (obj.flipX ? -1 : 1) *
      (1 + (isHovered ? 0.035 : 0) + Math.sin(clickPulse * Math.PI) * 0.12);
    const sy = 1 + (isHovered ? 0.035 : 0) - Math.sin(clickPulse * Math.PI) * 0.08;

    const seed = obj.x * 0.013 + obj.y * 0.007;
    if (obj.idleAnim === 'swing') {
      rot += Math.sin(tQuant * 2.1 + seed) * 0.065;
    } else if (obj.idleAnim === 'bob') {
      dy = Math.sin(tQuant * 2.8 + seed) * 4.5;
    } else if (obj.idleAnim === 'vibrate') {
      rot += Math.sin(t * 24 + seed) * 0.012;
    }

    ctx.save();
    // Pivot at top-center for swinging ceiling fixtures, or center for standard furniture/props
    const pivotY = obj.idleAnim === 'swing' ? oy : oy + obj.h * 0.5;
    const pivotX = ox + obj.w * 0.5;
    ctx.translate(pivotX, pivotY + dy);
    ctx.rotate(rot);
    ctx.scale(sx, sy);

    const drawX = -obj.w * 0.5;
    const drawY = obj.idleAnim === 'swing' ? 0 : -obj.h * 0.5;

    // Paper Cut-Out drop shadow & hover golden rim glow
    if (isHovered) {
      ctx.shadowColor = 'rgba(255, 215, 95, 0.85)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } else if (obj.inSituSeamless && clickPulse <= 0.01) {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } else {
      ctx.shadowColor = 'rgba(8, 5, 14, 0.68)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 6;
    }

    if (img) {
      ctx.drawImage(img, drawX, drawY, obj.w, obj.h);
    } else {
      this.renderPendingCutoutPropFallback(ctx, obj, drawX, drawY);
    }

    ctx.shadowColor = 'transparent';

    // Render object-specific animated FX loops directly in local object coordinates!
    this.renderObjectSpecificFX(ctx, obj, drawX, drawY, t);

    ctx.restore();
  }

  private renderPendingCutoutPropFallback(
    ctx: CanvasRenderingContext2D,
    obj: SceneObjectDef,
    drawX: number,
    drawY: number
  ): void {
    ctx.save();
    ctx.strokeStyle = '#1c1410';
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    if (obj.id === 'z1s3.prop.hammer_bag') {
      // Canvas bag with iron sledgehammers sticking out
      ctx.fillStyle = '#8a5830';
      ctx.fillRect(drawX + 26, drawY + 6, 12, 42);
      ctx.fillRect(drawX + 62, drawY + 10, 12, 42);
      ctx.fillStyle = '#6b707b';
      ctx.fillRect(drawX + 14, drawY + 4, 34, 16);
      ctx.fillRect(drawX + 50, drawY + 8, 34, 16);
      ctx.strokeRect(drawX + 14, drawY + 4, 34, 16);
      ctx.strokeRect(drawX + 50, drawY + 8, 34, 16);
      ctx.fillStyle = '#c89d66';
      ctx.beginPath();
      ctx.roundRect(drawX + 16, drawY + 38, obj.w - 32, obj.h - 44, 14);
      ctx.fill();
      ctx.stroke();
    } else if (obj.id === 'z1s3.prop.easel_portrait') {
      // Wooden tripod easel + Captain Dread portrait frame
      ctx.strokeStyle = '#603913';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(drawX + obj.w * 0.5, drawY + 18);
      ctx.lineTo(drawX + 22, drawY + obj.h - 6);
      ctx.moveTo(drawX + obj.w * 0.5, drawY + 18);
      ctx.lineTo(drawX + obj.w - 22, drawY + obj.h - 6);
      ctx.moveTo(drawX + obj.w * 0.5, drawY + 18);
      ctx.lineTo(drawX + obj.w * 0.5, drawY + obj.h - 4);
      ctx.stroke();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#1c1410';
      ctx.fillStyle = '#d69a2a';
      ctx.fillRect(drawX + 22, drawY + 34, obj.w - 44, 125);
      ctx.strokeRect(drawX + 22, drawY + 34, obj.w - 44, 125);
      ctx.fillStyle = '#3a2e4c';
      ctx.fillRect(drawX + 34, drawY + 46, obj.w - 68, 101);
      ctx.strokeRect(drawX + 34, drawY + 46, obj.w - 68, 101);
    } else if (obj.id === 'z1s3.prop.glue') {
      // Bottle of Industrial Super-Glue on desk
      ctx.fillStyle = '#e3b65a';
      ctx.beginPath();
      ctx.moveTo(drawX + obj.w * 0.5, drawY + 4);
      ctx.lineTo(drawX + 16, drawY + 24);
      ctx.lineTo(drawX + obj.w - 16, drawY + 24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f2ead8';
      ctx.beginPath();
      ctx.roundRect(drawX + 10, drawY + 24, obj.w - 20, obj.h - 28, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#b8292f';
      ctx.fillRect(drawX + 14, drawY + 36, obj.w - 28, 16);
    } else if (obj.id === 'z1s3.prop.bed') {
      // Captain Dread's Wooden Bunk Bed
      ctx.fillStyle = '#5a3620';
      ctx.beginPath();
      ctx.roundRect(drawX + 8, drawY + 40, obj.w - 16, obj.h - 46, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#8b2626';
      ctx.beginPath();
      ctx.roundRect(drawX + 20, drawY + 95, obj.w - 40, 90, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e8dec8';
      ctx.beginPath();
      ctx.roundRect(drawX + 32, drawY + 75, 78, 36, 10);
      ctx.fill();
      ctx.stroke();
    } else if (obj.id === 'z1s3.prop.lamp') {
      // Tilted brass reading lamp on nightstand
      ctx.fillStyle = '#d69a2a';
      ctx.beginPath();
      ctx.moveTo(drawX + 16, drawY + 48);
      ctx.lineTo(drawX + 32, drawY + 12);
      ctx.lineTo(drawX + obj.w - 32, drawY + 12);
      ctx.lineTo(drawX + obj.w - 16, drawY + 48);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#8a5830';
      ctx.fillRect(drawX + obj.w * 0.5 - 6, drawY + 48, 12, 46);
      ctx.strokeRect(drawX + obj.w * 0.5 - 6, drawY + 48, 12, 46);
      ctx.fillRect(drawX + 22, drawY + 92, obj.w - 44, 14);
      ctx.strokeRect(drawX + 22, drawY + 92, obj.w - 44, 14);
    }
    ctx.restore();
  }

  private renderObjectSpecificFX(
    ctx: CanvasRenderingContext2D,
    obj: SceneObjectDef,
    drawX: number,
    drawY: number,
    t: number
  ): void {
    if (obj.fxType === 'porthole') {
      // Animated deep-sea fish silhouette swimming across the porthole glass + rising bubbles
      const cx = drawX + obj.w * 0.5;
      const cy = drawY + obj.h * 0.5;
      const fishOffset = Math.sin(t * 0.9 + obj.x * 0.01) * (obj.w * 0.22);
      const fishY = cy + Math.cos(t * 1.7 + obj.x) * 12;
      const fishDir = Math.cos(t * 0.9 + obj.x * 0.01) >= 0 ? 1 : -1;

      ctx.save();
      ctx.translate(cx + fishOffset, fishY);
      ctx.scale(fishDir, 1);
      ctx.fillStyle = 'rgba(12, 52, 68, 0.55)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(-24, -7);
      ctx.lineTo(-24, 7);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Tiny rising porthole bubbles
      for (let b = 0; b < 3; b++) {
        const by = cy + 28 - (((t * 28 + b * 19) % 56));
        const bx = cx - 18 + b * 18 + Math.sin(t * 3 + b) * 4;
        ctx.strokeStyle = 'rgba(185, 250, 255, 0.65)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bx, by, 3.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (obj.fxType === 'fishbowl') {
      // Animated orange goldfish swimming in a figure-8 inside the glass bowl
      const fx = drawX + obj.w * 0.5 + Math.sin(t * 2.5) * 14;
      const fy = drawY + obj.h * 0.56 + Math.cos(t * 3.4) * 6;
      const dir = Math.cos(t * 2.5) >= 0 ? 1 : -1;
      ctx.save();
      ctx.translate(fx, fy);
      ctx.scale(dir, 1);
      ctx.fillStyle = '#ff6d1c';
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(-14, -5);
      ctx.lineTo(-14, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (obj.fxType === 'crt_tv') {
      // Flickering CRT scanline glow on the television screen
      const flick = 0.16 + 0.08 * Math.sin(t * 22);
      const sx = drawX + obj.w * 0.48;
      const sy = drawY + obj.h * 0.54;
      const g = ctx.createRadialGradient(sx, sy, 4, sx, sy, obj.w * 0.48);
      g.addColorStop(0, `rgba(120, 240, 255, ${flick})`);
      g.addColorStop(1, 'rgba(120, 240, 255, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, sy, obj.w * 0.48, 0, Math.PI * 2);
      ctx.fill();
    } else if (obj.fxType === 'spark_cable') {
      // Crackling electric zig-zag arc at the bottom tip of the frayed wire
      if (Math.sin(t * 17 + obj.x) > 0.15) {
        const tipX = drawX + obj.w * 0.5;
        const tipY = drawY + obj.h * 0.88;
        ctx.strokeStyle = '#68f7ff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(tipX - 10, tipY - 6);
        ctx.lineTo(tipX + (Math.random() - 0.5) * 18, tipY + 6);
        ctx.lineTo(tipX + (Math.random() - 0.5) * 22, tipY + 16);
        ctx.stroke();
      }
    } else if (obj.fxType === 'sarcophagus_eyes') {
      // Spooky glowing golden mummy eyes blinking periodically inside the sarcophagus shadow
      const blink = Math.sin(t * 1.4) > -0.65;
      if (blink) {
        const ex = drawX + obj.w * 0.52;
        const ey = drawY + obj.h * 0.24;
        ctx.fillStyle = '#ffdf5e';
        ctx.beginPath();
        ctx.arc(ex - 9, ey, 3.2, 0, Math.PI * 2);
        ctx.arc(ex + 9, ey, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (obj.fxType === 'crate_eyes') {
      // Glowing yellow eyes blinking inside the Evil Deeds College shipping crate
      const blink = Math.sin(t * 2.1 + 1.2) > -0.75;
      if (blink) {
        const ex = drawX + obj.w * 0.48;
        const ey = drawY + obj.h * 0.46;
        ctx.fillStyle = '#ffe44d';
        ctx.beginPath();
        ctx.arc(ex - 11, ey, 3.8, 0, Math.PI * 2);
        ctx.arc(ex + 11, ey, 3.8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (obj.fxType === 'funky_vault') {
      // Glowing status LED on A Baby's Candy Vault
      const pulse = 0.6 + 0.4 * Math.sin(t * 4.5);
      ctx.fillStyle = this.flags.vaultUnlocked
        ? `rgba(59, 232, 216, ${pulse})`
        : `rgba(255, 195, 70, ${pulse})`;
      ctx.beginPath();
      ctx.arc(drawX + obj.w * 0.5, drawY + obj.h * 0.18, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (obj.fxType === 'pedal_engine') {
      // Engine Room Main Pedal Station: either broken alarm or installed spinning Perpetual Machine!
      const cx = drawX + obj.w * 0.52;
      const cy = drawY + obj.h * 0.52;
      if (this.flags.perpetualMachineInstalled) {
        const pm = this.getImg('perpetual_machine');
        const helm = this.getImg('item_helm');
        ctx.save();
        ctx.translate(cx, cy);
        if (pm) {
          ctx.drawImage(pm, -115, -115, 230, 250);
        }
        if (helm) {
          ctx.save();
          ctx.translate(0, -20);
          ctx.rotate(this.perpetualWheelAngle);
          ctx.drawImage(helm, -86, -86, 172, 172);
          ctx.restore();
        }
        ctx.restore();
        if (Math.random() < 0.35) {
          this.spawnSparks(obj.x + obj.w * 0.5, obj.y + obj.h * 0.48, '#ffdf6b', 2);
        }
      } else if (this.flags.pedalBrokenBam) {
        const alarm = Math.max(0, Math.sin(t * 8.5));
        const g = ctx.createRadialGradient(cx, cy, 6, cx, cy, 130);
        g.addColorStop(0, `rgba(255, 50, 40, ${alarm * 0.58})`);
        g.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, 130, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private renderEnvironmentalParticles(ctx: CanvasRenderingContext2D): void {
    // 1. Hand-drawn paper-cutout style Steam Puffs rising from leaky pipe valves
    for (const sp of this.steamPuffs) {
      const progress = sp.life / sp.maxLife;
      const alpha = Math.max(0, Math.sin(progress * Math.PI) * 0.55);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#f2ead8';
      ctx.strokeStyle = '#2b2430';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. Electric Sparks & Footstep Dust Particles
    for (const p of this.fxParticles) {
      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 3. Ambient deep-sea bubbles in the Engine Room
    if (this.currentRoom === 'Z1S1') {
      for (const b of this.bubbles) {
        ctx.strokeStyle = 'rgba(130, 240, 255, 0.22)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  private renderLolDemoRoom(
    ctx: CanvasRenderingContext2D,
    parX: number,
    parY: number,
    w: number,
    h: number
  ): void {
    const bg = this.getImg('spook_castle_bg');
    if (bg) {
      ctx.drawImage(bg, parX * 0.3, parY * 0.3, w, h);
    }
    const t = performance.now() * 0.001;
    const sun = this.getImg('lol_sun');
    if (sun) {
      ctx.save();
      ctx.translate(275 + parX * 0.2, 170 + parY * 0.2);
      ctx.rotate(Math.sin(t * 1.2) * 0.08);
      ctx.drawImage(sun, -105, -105, 210, 210);
      ctx.restore();
    }
    if (this.flags.trollSpawned) {
      const troll = this.getImg('lol_troll');
      if (troll) {
        const bounce = Math.abs(Math.sin(t * 6)) * 22;
        ctx.drawImage(troll, 920, 210 - bounce, 340, 410);
      }
    }
  }

  private renderVolumetricLighting(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    parX: number,
    parY: number
  ): void {
    const t = performance.now() * 0.001;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Swinging volumetric light cones from every `cage_lamp` object in the room
    for (const obj of this.getVisibleSceneObjects()) {
      const pFactor = obj.parallaxFactor ?? 1.0;
      const anchorX = obj.parallaxAnchorX ?? obj.x + obj.w * 0.5;
      const { dx: parDx, dy: parDy } = this.computeParallaxOffset(pFactor, anchorX, parX, parY);
      if (obj.fxType === 'cage_lamp') {
        const lx = obj.x + obj.w * 0.5 + parDx;
        const ly = obj.y + obj.h * 0.72 + parDy;
        const swing = Math.sin(t * 2.1 + obj.x * 0.013) * 0.065;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(swing);
        const coneGrad = ctx.createLinearGradient(0, 0, 0, 560);
        coneGrad.addColorStop(0, 'rgba(255, 215, 125, 0.20)');
        coneGrad.addColorStop(0.65, 'rgba(255, 195, 95, 0.07)');
        coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coneGrad;
        ctx.beginPath();
        ctx.moveTo(-28, 0);
        ctx.lineTo(28, 0);
        ctx.lineTo(240, 560);
        ctx.lineTo(-240, 560);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (obj.fxType === 'porthole') {
        const px = obj.x + obj.w * 0.5 + parDx;
        const py = obj.y + obj.h * 0.5 + parDy;
        const pGrad = ctx.createRadialGradient(px, py, 12, px, py, 260);
        pGrad.addColorStop(0, 'rgba(70, 238, 255, 0.18)');
        pGrad.addColorStop(0.55, 'rgba(70, 238, 255, 0.06)');
        pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(px, py, 260, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Floating dust motes in the light beams (tiled across wide rooms)
    const roomW = this.getRoomWidth();
    for (const m of this.dustMotes) {
      ctx.fillStyle = `rgba(255, 240, 200, ${m.alpha})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      if (roomW > 1600) {
        ctx.arc(m.x + 1400, m.y, m.r, 0, Math.PI * 2);
      }
      ctx.fill();
    }
    ctx.restore();
  }

  private renderViewportVignetteAndScrollArrows(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number
  ): void {
    if (this.cfgLighting) {
      const vig = ctx.createRadialGradient(w * 0.5, h * 0.48, w * 0.38, w * 0.5, h * 0.5, w * 0.72);
      vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vig.addColorStop(1, 'rgba(6, 4, 10, 0.40)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    }

    const maxCamX = Math.max(0, this.getRoomWidth() - 1600);
    if (maxCamX <= 0) return;

    const tQuant = Math.floor(performance.now() * 0.012) / 12;
    const bob = Math.sin(tQuant * 4.5) * 4;

    ctx.save();
    ctx.font = 'bold 14px "Cinzel", Georgia, serif';
    ctx.textAlign = 'center';

    // Left Scroll Arrow Plaque when camera can scroll left
    if (this.cameraX > 15) {
      ctx.save();
      ctx.translate(42 + bob, 450);
      ctx.fillStyle = 'rgba(28, 19, 16, 0.88)';
      ctx.strokeStyle = '#e3b65a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-28, -42, 56, 84, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffe28a';
      ctx.beginPath();
      ctx.moveTo(10, -18);
      ctx.lineTo(-12, 0);
      ctx.lineTo(10, 18);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f5e8c8';
      ctx.fillText('BAY', 0, 34);
      ctx.restore();
    }

    // Right Scroll Arrow Plaque when camera can scroll right
    if (this.cameraX < maxCamX - 15) {
      ctx.save();
      ctx.translate(w - 42 - bob, 450);
      ctx.fillStyle = 'rgba(28, 19, 16, 0.88)';
      ctx.strokeStyle = '#e3b65a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-28, -42, 56, 84, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffe28a';
      ctx.beginPath();
      ctx.moveTo(-10, -18);
      ctx.lineTo(12, 0);
      ctx.lineTo(-10, 18);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f5e8c8';
      ctx.fillText('BAY', 0, 34);
      ctx.restore();
    }
    ctx.restore();
  }

  private renderStreetSenseHotspots(ctx: CanvasRenderingContext2D): void {
    const list = this.getVisibleHotspots();
    const roomW = this.getRoomWidth();
    ctx.save();
    ctx.font = 'bold 15px "Patrick Hand", cursive, sans-serif';
    for (const h of list) {
      const r = this.getHotspotWorldRect(h);
      ctx.strokeStyle = h.isExitTo ? '#3be8d8' : '#ffcf56';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([7, 5]);
      ctx.strokeRect(r.x, r.y, r.w, r.h);

      const shortLabel = h.name.replace(/\s*\(.*?\)\s*/g, '').trim();
      const textW = Math.ceil(ctx.measureText(shortLabel).width);
      const pillW = textW + 18;
      const bx = Math.max(8, Math.min(roomW - pillW - 8, r.x));
      const by = Math.max(30, Math.min(890, r.y - 6));

      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(18, 13, 22, 0.92)';
      ctx.fillRect(bx, by - 24, pillW, 24);
      ctx.strokeStyle = h.isExitTo ? '#3be8d8' : '#e3b65a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by - 24, pillW, 24);

      ctx.fillStyle = '#fff5d6';
      ctx.fillText(shortLabel, bx + 9, by - 6);
    }
    ctx.restore();
  }

  private renderDebugWalkbox(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    const maxW = this.getRoomWidth();
    ctx.strokeRect(150, 730, maxW - 300, 125);
    ctx.strokeStyle = '#ff3366';
    ctx.strokeRect(this.player.x - 28, this.player.y - 16, 56, 18);
    ctx.restore();
  }

  private loop(now: number): void {
    const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    this.update(dt);
    this.renderMainMenuShowcase();
    const introOverlay = document.getElementById('intro-overlay');
    if (introOverlay && introOverlay.style.display !== 'none') {
      this.introTheatre.updateAndRender(dt);
      const fillEl = document.getElementById('intro-timeline-fill');
      if (fillEl) {
        fillEl.style.width = `${(this.introTheatre.getProgressRatio() * 100).toFixed(1)}%`;
      }
    }
    this.renderStage();

    requestAnimationFrame((t) => this.loop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  (window as unknown as Record<string, unknown>).__sparkleGame = new SmoothfacePilotGame();
});
