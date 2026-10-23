/**
 * MoonStorm Studios - Smoothface's Epic (Codename: Sparkle)
 * Main 1600x900 Modular Paper Cut-Out Adventure Engine, Living Environmental FX & Puzzle State Machine (src/main.ts)
 */

import { AudioVoiceEngine, VoiceProfileId } from './engine/AudioVoiceEngine';
import { CutoutRigRenderer, PuppetAnimState } from './engine/CutoutRigRenderer';
import { INTRO_SCENES_8, IntroPuppetTheatre } from './engine/IntroPuppetTheatre';
import { RoomLayoutStudio } from './engine/RoomLayoutStudio';
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
  Z1S3_CHARACTER_SPAWNS,
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
  public canvas: HTMLCanvasElement;
  public studio!: RoomLayoutStudio;
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
  public mouseX = 800;
  public mouseY = 450;
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
    this.player = this.rigs.createAnimState('smoothface', Z1S3_CHARACTER_SPAWNS.smoothface.x, Z1S3_CHARACTER_SPAWNS.smoothface.y, 1.0, Z1S3_CHARACTER_SPAWNS.smoothface.facing);
    this.menuShowcasePuppet = this.rigs.createAnimState('smoothface', 220, 436, 0.82, 1);

    this.npcs = {
      cap_dread: this.rigs.createAnimState('cap_dread', Z1S3_CHARACTER_SPAWNS.cap_dread.x, Z1S3_CHARACTER_SPAWNS.cap_dread.y, 1.0, Z1S3_CHARACTER_SPAWNS.cap_dread.facing),
      nihongo: this.rigs.createAnimState('nihongo', 725, 810, 1.0, 1),
      a_baby: this.rigs.createAnimState('a_baby', 705, 815, 1.0, 1),
      ventriloquist: this.rigs.createAnimState('ventriloquist', 1410, 815, 1.0, -1),
    };

    this.preloadSceneAssets();
    this.initParticles();
    this.bindDomEvents();
    this.renderInventoryBar();
    this.studio = new RoomLayoutStudio(this);

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
      im.onerror = () => { if (!im.src.includes('art/candidates/')) im.src = `art/candidates/${id}/v2.png`; };
      im.src = `art/approved/z1s3/${id}.png`;
      this.imgs.set(id, im);
    }
    const helmIm = new Image();
    helmIm.src = 'art/approved/z1s3/z1s3.wall.helm_wheel.png';
    this.imgs.set('item_helm', helmIm);
  }

  public getImgForStudio(key: string): HTMLImageElement | null {
    return this.getImg(key);
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

  public spawnSparks(_x: number, _y: number, _color = '#ffcf56', _count = 18): void {
    // Cutout-only mode: no procedural canvas spark circles
  }

  private spawnSteamPuff(_x: number, _y: number, _dirX = 1): void {
    // Cutout-only mode: no procedural canvas steam circles
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

    document.getElementById('btn-menu-studio')?.addEventListener('click', () => {
      this.audio.playStartStinger();
      this.enterGameplay('Z1S3');
      this.studio.toggleStudio(true);
    });

    document.getElementById('btn-open-studio')?.addEventListener('click', () => {
      this.audio.playUiClick(580);
      this.studio.toggleStudio();
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
        'characters/smoothface/portrait.png',
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
    this.studio = new RoomLayoutStudio(this);
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
    window.addEventListener('mouseup', () => this.studio?.onMouseUp());
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
      nextLbl.textContent = idx === INTRO_SCENES_8.length - 1 ? 'Board Submarine! \u00bb' : 'Next Scene \u00bb';
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
      this.player.x = Z1S3_CHARACTER_SPAWNS.smoothface.x;
      this.player.y = Z1S3_CHARACTER_SPAWNS.smoothface.y;
      this.player.facing = Z1S3_CHARACTER_SPAWNS.smoothface.facing;
      this.npcs.cap_dread.x = Z1S3_CHARACTER_SPAWNS.cap_dread.x;
      this.npcs.cap_dread.y = Z1S3_CHARACTER_SPAWNS.cap_dread.y;
      this.npcs.cap_dread.facing = Z1S3_CHARACTER_SPAWNS.cap_dread.facing;
      this.cameraX = 120;
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'characters/smoothface/portrait.png',
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
        'characters/smoothface/portrait.png',
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
          'characters/smoothface/portrait.png',
          'GRUMPY',
          "The submarine pedal drive is snapped in half, and I refuse to pedal like a common peasant! I need to build da Vinci's Perpetual Movement Machine and install it here."
        );
      } else {
        this.npcs.nihongo.poseIndex = 3;
        this.speakLine(
          'CAPTAIN DREAD',
          'cap_dread',
          'characters/capdread/portrait.png',
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
        'characters/smoothface/portrait.png',
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
    if (this.studio?.active) {
      document.getElementById('hotspot-tooltip')!.style.display = 'none';
      this.studio.onMouseMove(e, pt.x, pt.y);
      return;
    }
    this.player.lookTargetX = pt.x;
    this.player.lookTargetY = pt.y;

    const hit = this.findHotspotAt(pt.x, pt.y);
    this.hoveredHotspotId = hit ? hit.id : null;
    const tip = document.getElementById('hotspot-tooltip')!;
    if (hit) {
      this.canvas.style.cursor = "url('art/approved/ui/ui.cursor.interact.png') 12 10, pointer";
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
      this.canvas.style.cursor = "url('art/approved/ui/ui.cursor.default.png') 10 10, crosshair";
      tip.style.display = 'none';
    }
  }

  private onCanvasMouseDown(e: MouseEvent): void {
    this.audio.unlock();
    if (this.studio?.active) {
      const pt = this.getCanvasCoords(e);
      this.studio.onMouseDown(e, pt.x, pt.y);
      return;
    }
    if (e.button !== 0) return;

    const menu = document.getElementById('rmb-action-menu')!;
    if (menu.style.display !== 'none') {
      menu.style.display = 'none';
      return;
    }

    const pt = this.getCanvasCoords(e);



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
    if (this.studio?.active) return;
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
          'characters/smoothface/portrait.png',
          'ANNOYED',
          'Hello, rusty submarine hatch! Open sesame! ...Nope, still requires manual labor.'
        );
        return;
      }
      if (this.flags.perpetualMachineBuilt) {
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'characters/smoothface/portrait.png',
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
          'characters/smoothface/portrait.png',
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
        'characters/smoothface/portrait.png',
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
          'characters/smoothface/portrait.png',
          'ANALYZING',
          'A canvas bag overflowing with heavy iron hammers. Why does Captain Dread sleep next to a sack of sledgehammers?'
        );
      } else if (verb === 'talk') {
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'characters/smoothface/portrait.png',
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
          'characters/smoothface/portrait.png',
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
          'characters/smoothface/portrait.png',
          'CRITIQUING',
          'An oil portrait of Captain Dread looking heroic on a sturdy wooden tripod easel stand.'
        );
      } else if (verb === 'talk') {
        this.setTemporaryPlayerPose(6, 2000, true);
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'characters/smoothface/portrait.png',
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
          'characters/capdread/portrait.png',
          'INDIGNANT',
          'Oi! Careful with me royal portrait easel, Mr. Smoothface! That tripod is genuine Driftwood Mahogany!'
        );
      }
      return;
    }

    if (hit.id === 'z1s3_desk_drawer' || hit.id === 'z1s3_glue') {
      if (verb === 'inspect') {
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'characters/smoothface/portrait.png',
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
          'characters/smoothface/portrait.png',
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
          'characters/smoothface/portrait.png',
          'ACQUIRED!',
          "I opened Captain Dread's desk drawer and found a bottle of Industrial Super-Glue! Sticky enough to hold a Rube Goldberg contraption together."
        );
      } else {
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'characters/smoothface/portrait.png',
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
          'characters/smoothface/portrait.png',
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
          'characters/capdread/portrait.png',
          'WARNING',
          'YARRR! Keep yer hairless mitts off me royal pirate coat, lad!'
        );
        return;
      }
      this.npcs.cap_dread.poseIndex = 1;
      this.speakLine(
        'CAPTAIN DREAD',
        'cap_dread',
        'characters/capdread/portrait.png',
        'BOOMING',
        'Yarrr! Welcome to me luxury quarters aboard the Substampede, hairless lad! Why the long, smooth face?',
        [
          {
            label: '"How is this rust-bucket submarine actually propelled?"',
            replySpeaker: 'CAPTAIN DREAD',
            replyVoice: 'cap_dread',
            replyPortrait: 'characters/capdread/portrait.png',
            replyMood: 'PROUD',
            replyText:
              'One hundred percent eco-friendly pedal power! Me faithful engineer Nihongo Nohondes is down in the Engine Room pedaling the main drive right now!',
          },
          {
            label: '"Where did you put the spare wooden Ship\'s Helm?"',
            replySpeaker: 'CAPTAIN DREAD',
            replyVoice: 'cap_dread',
            replyPortrait: 'characters/capdread/portrait.png',
            replyMood: 'GRUMBLING',
            replyText:
              'That tiny gorilla toddler "A Baby" in the VIP Lounge locked me spare Ship\'s Helm inside his high-tech Candy Vault! It uses a musical synthesizer lock!',
          },
          {
            label: '"Your beard is almost as obnoxious as my brother Morgan\'s."',
            replySpeaker: 'CAPTAIN DREAD',
            replyVoice: 'cap_dread',
            replyPortrait: 'characters/capdread/portrait.png',
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
        'characters/smoothface/portrait.png',
        'GRUMPY',
        'A solid gold Egyptian sarcophagus inside a submarine. Even an ancient mummy has a better sculpted chin beard than me! Bah!'
      );
      return;
    }

    if (hit.id === 'z1s3_crt_tv' || hit.id === 'z1s3_tv_fishbowl') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'characters/smoothface/portrait.png',
        'BEMUSED',
        'A 1970s wood-grain CRT television broadcasting deep-sea static right next to a bowl of water. Truly finest pirate electrical safety standards.'
      );
      return;
    }

    if (hit.id === 'z1s3_fishbowl') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'characters/smoothface/portrait.png',
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
        'characters/smoothface/portrait.png',
        'DIALING',
        'A crimson rotary telephone wired to the bridge. Wait, there is no bridge on this submarine, just a bicycle in the basement!'
      );
      return;
    }

    if (hit.id === 'z1s3_bunk_bed') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'characters/smoothface/portrait.png',
        'INSPECTING',
        "Captain Dread's wooden bunk bed. The mattress is stuffed with old nautical charts and beard trimmings."
      );
      return;
    }

    if (hit.id === 'z1s3_porthole' || hit.id === 'z1s2_porthole' || hit.id === 'z1s1_porthole') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'characters/smoothface/portrait.png',
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
        'characters/smoothface/portrait.png',
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
        'characters/smoothface/portrait.png',
        'STEAMING',
        'HSSSSS! A leaky brass steam valve venting scalding clouds of vapour. Great for dramatic supervillain entrances, terrible for my complexion.'
      );
      return;
    }

    if (hit.id === 'z1s3_mss_poster') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'characters/smoothface/portrait.png',
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
        'characters/smoothface/portrait.png',
        'FURIOUS!',
        'GAH! A framed portrait of my twin brother Dr. Morgan Stache and his gloriously thick moustache! Why does everyone on this submarine worship his upper lip?!'
      );
      return;
    }

    if (hit.id === 'z1s3_mask_a') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'characters/smoothface/portrait.png',
        'OBSERVING',
        'A carved wooden tiki mask scowling from the submarine bulkhead. Still more welcoming than my brother Morgan.'
      );
      return;
    }

    if (hit.id === 'z1s3_helm_wheel') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'characters/smoothface/portrait.png',
        'INSPECTING',
        "Captain Dread's prized eight-spoke mahogany helm wheel bolted to the bulkhead. Eight sturdy spokes, just like Leonardo da Vinci's diagram!"
      );
      return;
    }

    if (hit.id === 'z1s3_mask_b') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'characters/smoothface/portrait.png',
        'OBSERVING',
        'A painted ceremonial tribal mask with red war-paint stripes and tassel earrings. Zero facial hair: ten out of ten.'
      );
      return;
    }

    if (hit.id === 'z1s3_shelf' || hit.id === 'z1s3_wall_masks') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'characters/smoothface/portrait.png',
        'CRITIQUING',
        'Captain Dread\'s emergency rations shelf: two tin cans labeled "SOUP" and "BEANS" flanked by wooden Matryoshka nesting dolls.'
      );
      return;
    }

    if (hit.id === 'z1s3_lamp') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'characters/smoothface/portrait.png',
        'OBSERVING',
        'A crooked brass reading lamp with a tilted parchment shade. One submarine depth-charge jolt and it will tumble right off the nightstand.'
      );
      return;
    }

    if (hit.id === 'z1s3_coat_rack') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'characters/smoothface/portrait.png',
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
        'characters/smoothface/portrait.png',
        'PEERING',
        'The submarine optical periscope! According to the depth gauge, we are currently cruising three leagues beneath a flock of unsuspecting seagulls.'
      );
      return;
    }

    if (hit.id === 'z1s3_nightstand_lamp') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'characters/smoothface/portrait.png',
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
        'characters/smoothface/portrait.png',
        'DISGUSTED',
        'A pile of unwashed pirate laundry on the deck planks. Even the Malefic Gentlemen Syndicate has stricter hygiene standards than this!'
      );
      return;
    }

    if (hit.id === 'z1s3_ship_bottle') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'characters/smoothface/portrait.png',
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
        'characters/smoothface/portrait.png',
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
          'characters/smoothface/portrait.png',
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
            replyPortrait: 'characters/smoothface/portrait.png',
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
          'characters/smoothface/portrait.png',
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
          'characters/smoothface/portrait.png',
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
        'characters/smoothface/portrait.png',
        'CRITIQUING',
        'A tufted crimson velvet lounge sofa. Covered in lollipop wrappers, ventriloquist sawdust, and sea-salt stains.'
      );
      return;
    }

    if (hit.id === 'z1s2_samurai_wall') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'characters/smoothface/portrait.png',
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
        'characters/smoothface/portrait.png',
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
          'characters/smoothface/portrait.png',
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
        'characters/smoothface/portrait.png',
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
          'characters/smoothface/portrait.png',
          'EVIL GENIUS',
          'My da Vinci Perpetual Movement Machine is bolted to the drive shaft, swinging four iron hammers in an infinite gravitational loop! Eat your heart out, Morgan!'
        );
      } else {
        this.setTemporaryPlayerPose(6, 2200, true);
        this.speakLine(
          'MR. SMOOTHFACE',
          'smoothface',
          'characters/smoothface/portrait.png',
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
        'characters/smoothface/portrait.png',
        'AMUSED',
        'The bilge rats down here have their own glowing television and a lifetime supply of potatoes. They live better than the crew.'
      );
      return;
    }

    if (hit.id === 'z1s1_rad_barrels') {
      this.speakLine(
        'MR. SMOOTHFACE',
        'smoothface',
        'characters/smoothface/portrait.png',
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
        'characters/smoothface/portrait.png',
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
    if (id === 'hammer_bag') this.flags.gotHammerBag = true;
    if (id === 'portrait_stand') this.flags.gotPortraitStand = true;
    if (id === 'glue') this.flags.gotGlue = true;
    if (id === 'helm') this.flags.gotHelm = true;
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
    const minSlots = 6;
    for (let i = this.inventory.length; i < minSlots; i++) {
      const emptySlot = document.createElement('div');
      emptySlot.className = 'inv-slot inv-slot-empty';
      container.appendChild(emptySlot);
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
          'characters/smoothface/portrait.png',
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
      'characters/smoothface/portrait.png',
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
      'characters/smoothface/portrait.png',
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
      'characters/smoothface/portrait.png',
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
    this.menuShowcasePuppet.talkAmp = activeVoice === 'smoothface' ? voiceAmp : 0;
    this.menuShowcasePuppet.isWalking = false;
    this.menuShowcasePuppet.grumpyMode = false;
    this.menuShowcasePuppet.poseIndex = 0;
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
    if (this.studio?.active) {
      // In Studio Mode, camera X is controlled manually by the user!
    } else if (maxCamX > 0) {
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

    ctx.fillStyle = '#241c18';
    ctx.fillRect(0, 0, w, h);
    const panelB = this.getImg('z1s3.wall.panel_b');
    const planksA = this.getImg('z1s3.floor.planks_a');
    const porthole = this.getImg('z1s3.wall.porthole');
    // Crop the 72px transparent safety margin so wall panel and floor planks meet with zero gap!
    if (panelB) ctx.drawImage(panelB, 72, 72, 599, 900, 0, 0, w, 355);
    if (porthole) ctx.drawImage(porthole, w * 0.5 - 75, 24, 150, 150);
    if (planksA) ctx.drawImage(planksA, 58, 58, 724, 260, 0, 332, w, 155);

    this.rigs.renderSmoothfaceRig(ctx, this.menuShowcasePuppet);
  }

  private renderStage(): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const freezePar = Boolean(this.studio?.active && this.studio.freezeParallax);
    const parX = freezePar ? 0 : ((this.mouseX - w * 0.5) / w) * -14;
    const parY = freezePar ? 0 : ((this.mouseY - h * 0.5) / h) * -8;

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
      if (this.studio?.hiddenObjectIds.has(obj.id)) continue;
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

    if (this.streetSenseActive) {
      this.renderStreetSenseHotspots(ctx);
    }

    if (this.cfgDebugWalkbox) {
      this.renderDebugWalkbox(ctx);
    }
    if (this.studio?.active) {
      this.studio.renderOverlay(ctx);
    }

    ctx.restore(); // End world-space camera translation (-this.cameraX)
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

    const pFactor = (this.studio?.active && this.studio.freezeParallax) ? 1.0 : (obj.parallaxFactor ?? (obj.sortY > 750 ? 1.25 : 0.92));
    const anchorX = obj.parallaxAnchorX ?? obj.x + obj.w * 0.5;
    const { dx: parDx, dy: parDy } = this.computeParallaxOffset(pFactor, anchorX, parX, parY);
    const ox = obj.x + parDx;
    const oy = obj.y + parDy;

    const isHovered = Boolean(obj.hotspotId && this.hoveredHotspotId === obj.hotspotId);
    const clickPulse = obj.hotspotId ? this.objectPulseMap.get(obj.hotspotId) || 0 : 0;

    // Compute crooked cardboard tilt + 12 FPS stop-motion idle + hover + click transforms
    let rot = ((obj.tiltDeg || 0) * Math.PI) / 180;
    let dy = 0;
    const rxRad = ((obj.rotateXDeg || 0) * Math.PI) / 180;
    const ryRad = ((obj.rotateYDeg || 0) * Math.PI) / 180;
    const cosX = Math.max(0.12, Math.cos(rxRad));
    const cosY = Math.max(0.12, Math.cos(ryRad));
    const sx =
      (obj.flipX ? -1 : 1) *
      cosY *
      (1 + (isHovered ? 0.035 : 0) + Math.sin(clickPulse * Math.PI) * 0.12);
    const sy =
      (obj.flipY ? -1 : 1) *
      cosX *
      (1 + (isHovered ? 0.035 : 0) - Math.sin(clickPulse * Math.PI) * 0.08);

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

    if (!img) {
      ctx.restore();
      return;
    }

    // Mask exterior submarine hull spandrel outside the curved left and right foreground hull ribs
    if (obj.id === 'z1s3.fg.hull_rib_left') {
      ctx.save();
      ctx.fillStyle = '#151018';
      ctx.beginPath();
      ctx.moveTo(drawX - 400, drawY - 100);
      ctx.lineTo(drawX + obj.w * 0.86, drawY - 100);
      ctx.lineTo(drawX + obj.w * 0.86, drawY + obj.h * 0.08);
      ctx.quadraticCurveTo(drawX + obj.w * 0.24, drawY + obj.h * 0.20, drawX + obj.w * 0.22, drawY + obj.h * 0.58);
      ctx.lineTo(drawX + obj.w * 0.20, drawY + obj.h + 100);
      ctx.lineTo(drawX - 400, drawY + obj.h + 100);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (obj.id === 'z1s3.fg.hull_rib_right') {
      ctx.save();
      ctx.fillStyle = '#151018';
      ctx.beginPath();
      ctx.moveTo(drawX + obj.w + 400, drawY - 100);
      ctx.lineTo(drawX + obj.w * 0.14, drawY - 100);
      ctx.lineTo(drawX + obj.w * 0.14, drawY + obj.h * 0.08);
      ctx.quadraticCurveTo(drawX + obj.w * 0.76, drawY + obj.h * 0.20, drawX + obj.w * 0.78, drawY + obj.h * 0.58);
      ctx.lineTo(drawX + obj.w * 0.80, drawY + obj.h + 100);
      ctx.lineTo(drawX + obj.w + 400, drawY + obj.h + 100);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Paper Cut-Out drop shadow per STYLE_BIBLE.md section 3
    if (obj.inSituSeamless && clickPulse <= 0.01 && !isHovered) {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } else {
      ctx.shadowColor = isHovered ? 'rgba(16, 12, 10, 0.65)' : 'rgba(16, 12, 10, 0.45)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = isHovered ? 5 : 3;
      ctx.shadowOffsetY = isHovered ? 6 : 4;
    }

    ctx.drawImage(img, drawX, drawY, obj.w, obj.h);
    ctx.shadowColor = 'transparent';
    ctx.restore();
  }

  private renderStreetSenseHotspots(ctx: CanvasRenderingContext2D): void {
    const list = this.getVisibleHotspots();
    const viewLeft = this.cameraX + 18;
    const viewRight = this.cameraX + 1582;
    ctx.save();
    ctx.font = 'bold 14px "Patrick Hand", cursive, sans-serif';

    const placedPills: Array<{ x: number; y: number; w: number; h: number }> = [];
    const bottomLabelIds = new Set([
      'z1s3_desk_drawer',
      'z1s3_nightstand_lamp',
      'z1s3_ship_bottle',
      'z1s3_clown_voodoo',
      'z1s3_dirty_clothes',
    ]);

    for (const h of list) {
      const r = this.getHotspotWorldRect(h);
      // Skip hotspots that are mostly outside the current 1600px camera viewport
      const visLeft = Math.max(viewLeft, r.x);
      const visRight = Math.min(viewRight, r.x + r.w);
      if (visRight - visLeft < Math.max(58, r.w * 0.45)) continue;

      ctx.strokeStyle = h.isExitTo ? '#3be8d8' : '#ffcf56';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([7, 5]);
      ctx.strokeRect(r.x, r.y, r.w, r.h);

      const shortLabel = h.name.replace(/\s*\(.*?\)\s*/g, '').trim();
      const textW = Math.ceil(ctx.measureText(shortLabel).width);
      const pillW = textW + 16;
      const pillH = 22;

      let bx = Math.round(r.x + (r.w - pillW) * 0.5);
      bx = Math.max(viewLeft + 4, Math.min(viewRight - pillW - 4, bx));

      let by = bottomLabelIds.has(h.id) ? Math.round(r.y + r.h + pillH + 3) : Math.round(r.y - 4);
      by = Math.max(106, Math.min(892, by));

      // Automatic 2D de-collision against already placed Peek labels
      for (let attempt = 0; attempt < 10; attempt++) {
        const curRect = { x: bx, y: by - pillH, w: pillW, h: pillH };
        const hit = placedPills.find(
          (p) =>
            curRect.x < p.x + p.w + 4 &&
            curRect.x + curRect.w + 4 > p.x &&
            curRect.y < p.y + p.h + 3 &&
            curRect.y + curRect.h + 3 > p.y
        );
        if (!hit) break;
        if (bottomLabelIds.has(h.id) || by > 520) {
          by = Math.min(892, hit.y + hit.h + pillH + 4);
        } else {
          by = Math.max(106, hit.y - 4);
        }
      }

      placedPills.push({ x: bx, y: by - pillH, w: pillW, h: pillH });

      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(18, 13, 22, 0.92)';
      ctx.fillRect(bx, by - pillH, pillW, pillH);
      ctx.strokeStyle = h.isExitTo ? '#3be8d8' : '#e3b65a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by - pillH, pillW, pillH);

      ctx.fillStyle = '#fff5d6';
      ctx.fillText(shortLabel, bx + 8, by - 6);
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
