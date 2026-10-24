/**
 * MoonStorm Studios - Smoothface's Epic (Codename: Sparkle)
 * iMUSE-Style Adaptive Room Soundtrack, Submarine Soundscape & Multi-Formant Voice Engine
 * (src/engine/AudioVoiceEngine.ts)
 *
 * Solves repetitive background music fatigue by providing:
 *  1. Room-Specific Physical-Modeling Musical Cues with built-in 16-20s ambient breathing bridges:
 *     - MENU / INTRO : 'menu_overture.wav'       ("The Ballad of Rupert & Morgan Stache")
 *     - Z1S3         : 'z1s3_dread_cabin.wav'    ("Ghost of Sardonia" - Nautical Concertina & Nylon Guitar)
 *     - Z1S2         : 'z1s2_vip_lounge.wav'     ("Blackspit VIP Lounge" - Cool Vibraphone & Walking Bass)
 *     - Z1S1 (Broken): 'z1s1_engine_broken.wav'  ("Sweat & Shamisen in the Bilge" - Nihongo's Theme)
 *     - Z1S1 (Fixed) : 'z1s1_engine_triumph.wav' ("Da Vinci's Clockwork Triumph")
 *     - LOLDEMO (Z0) : 'stuff2.ogg'              (Ledezman's original June 2010 LolDemo1 track)
 *  2. Continuous Submarine Ambience Cushion ('sub_ambience.wav') + 'Ambience Only' mode for zero-melody play.
 *  3. Smooth 1.0s room-to-room crossfading and automatic volume ducking during dialogue, museum browsing,
 *     and the 'Funky Town' musical keypad puzzle.
 */

export type VoiceProfileId =
  | 'smoothface'
  | 'cap_dread'
  | 'nihongo'
  | 'a_baby'
  | 'ventriloquist'
  | 'rapoleon'
  | 'siren'
  | 'troll';

export type MusicCueId =
  | 'MENU'
  | 'INTRO'
  | 'Z1S3'
  | 'Z1S2'
  | 'Z1S1_BROKEN'
  | 'Z1S1_TRIUMPH'
  | 'LOLDEMO';

export type SoundtrackMode = 'dynamic' | 'ambience' | 'classic2010' | 'muted';

export type ArchiveJukeboxTrackId =
  | 'stuff2.ogg'
  | 'start_the_game.mp3'
  | 'z1s3_dread_cabin.wav'
  | 'z1s2_vip_lounge.wav'
  | 'z1s1_engine_broken.wav'
  | 'z1s1_engine_triumph.wav'
  | 'sub_ambience.wav';

interface VoiceSpec {
  baseFreq: number;
  pitchSpread: number;
  formant1: number;
  formant2: number;
  wave: OscillatorType;
  syllableMs: number;
  vibRate: number;
  vibDepth: number;
}

const VOICE_SPECS: Record<VoiceProfileId, VoiceSpec> = {
  smoothface: {
    baseFreq: 155,
    pitchSpread: 38,
    formant1: 680,
    formant2: 1450,
    wave: 'sawtooth',
    syllableMs: 74,
    vibRate: 6.5,
    vibDepth: 5,
  },
  cap_dread: {
    baseFreq: 98,
    pitchSpread: 28,
    formant1: 480,
    formant2: 1050,
    wave: 'sawtooth',
    syllableMs: 88,
    vibRate: 11.0,
    vibDepth: 9,
  },
  nihongo: {
    baseFreq: 235,
    pitchSpread: 65,
    formant1: 890,
    formant2: 2100,
    wave: 'triangle',
    syllableMs: 56,
    vibRate: 9.5,
    vibDepth: 8,
  },
  a_baby: {
    baseFreq: 132,
    pitchSpread: 48,
    formant1: 580,
    formant2: 1650,
    wave: 'square',
    syllableMs: 82,
    vibRate: 7.0,
    vibDepth: 6,
  },
  ventriloquist: {
    baseFreq: 118,
    pitchSpread: 18,
    formant1: 510,
    formant2: 1180,
    wave: 'triangle',
    syllableMs: 95,
    vibRate: 4.5,
    vibDepth: 3,
  },
  rapoleon: {
    baseFreq: 265,
    pitchSpread: 75,
    formant1: 960,
    formant2: 2350,
    wave: 'square',
    syllableMs: 58,
    vibRate: 12.0,
    vibDepth: 7,
  },
  siren: {
    baseFreq: 580,
    pitchSpread: 240,
    formant1: 1200,
    formant2: 2600,
    wave: 'sawtooth',
    syllableMs: 140,
    vibRate: 4.0,
    vibDepth: 110,
  },
  troll: {
    baseFreq: 110,
    pitchSpread: 45,
    formant1: 420,
    formant2: 980,
    wave: 'sawtooth',
    syllableMs: 90,
    vibRate: 8.0,
    vibDepth: 12,
  },
};

export const NOTE_FREQS: Record<string, number> = {
  F4: 349.23,
  Fs4: 369.99,
  G4: 392.0,
  Gs4: 415.3,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  Cs5: 554.37,
  D5: 587.33,
  Eb5: 622.25,
  E5: 659.25,
  F5: 698.46,
};

export const CUE_METADATA: Record<MusicCueId, { file: string; title: string; gain: number; submarineAmbience: number }> = {
  MENU: {
    file: 'assets/audio/menu_overture.wav',
    title: 'The Ballad of Smoothface (Overture)',
    gain: 0.58,
    submarineAmbience: 0.18,
  },
  INTRO: {
    file: 'assets/audio/menu_overture.wav',
    title: 'The Ballad of Smoothface (Intro Theatre)',
    gain: 0.52,
    submarineAmbience: 0.25,
  },
  Z1S3: {
    file: 'assets/audio/z1s3_dread_cabin.wav',
    title: 'Ghost of Sardonia (Captain Dread Cabin)',
    gain: 0.62,
    submarineAmbience: 0.35,
  },
  Z1S2: {
    file: 'assets/audio/z1s2_vip_lounge.wav',
    title: 'Blackspit VIP Lounge (Cool Vibraphone)',
    gain: 0.62,
    submarineAmbience: 0.28,
  },
  Z1S1_BROKEN: {
    file: 'assets/audio/z1s1_engine_broken.wav',
    title: 'Sweat & Shamisen in the Bilge (Engine Room)',
    gain: 0.64,
    submarineAmbience: 0.42,
  },
  Z1S1_TRIUMPH: {
    file: 'assets/audio/z1s1_engine_triumph.wav',
    title: "Da Vinci's Clockwork Triumph (900 Knots!)",
    gain: 0.66,
    submarineAmbience: 0.30,
  },
  LOLDEMO: {
    file: 'assets/audio/stuff2.ogg',
    title: '2010 LolDemo1 Original (stuff2.ogg)',
    gain: 0.58,
    submarineAmbience: 0.0,
  },
};

export class AudioVoiceEngine {
  private ctx: AudioContext | null = null;
  private trackElements: Map<string, HTMLAudioElement> = new Map();
  private trackCurrentFade: Map<string, number> = new Map();
  private ambienceAudio: HTMLAudioElement | null = null;
  private stingerAudio: HTMLAudioElement | null = null;
  private jukeboxOverrideFile: string | null = null;

  public masterVolume = 0.85;
  public musicVolume = 0.55;
  public voiceVolume = 0.9;
  public sfxVolume = 0.85;

  private soundtrackMode: SoundtrackMode = 'dynamic';
  private currentCue: MusicCueId = 'MENU';
  private unlocked = false;

  // Smart ducking states
  private duckKeypad = false;
  private duckMuseum = false;
  private lastVoiceTimeMs = 0;

  private activeSpeaker: VoiceProfileId = 'smoothface';
  private voiceAmplitude = 0;
  private lastSyllableTime = 0;

  constructor() {
    this.setupHtmlAudio();
    window.setInterval(() => this.tickAudioFader(), 40);
  }

  private setupHtmlAudio(): void {
    try {
      const files = [
        'assets/audio/menu_overture.wav',
        'assets/audio/z1s3_dread_cabin.wav',
        'assets/audio/z1s2_vip_lounge.wav',
        'assets/audio/z1s1_engine_broken.wav',
        'assets/audio/z1s1_engine_triumph.wav',
        'assets/audio/stuff2.ogg',
      ];
      for (const f of files) {
        const el = new Audio(f);
        el.loop = true;
        el.preload = 'auto';
        el.volume = 0;
        this.trackElements.set(f, el);
        this.trackCurrentFade.set(f, 0);
      }

      this.ambienceAudio = new Audio('assets/audio/sub_ambience.wav');
      this.ambienceAudio.loop = true;
      this.ambienceAudio.preload = 'auto';
      this.ambienceAudio.volume = 0;

      this.stingerAudio = new Audio('assets/audio/start_the_game.mp3');
      this.stingerAudio.preload = 'auto';
      this.stingerAudio.volume = this.masterVolume * this.sfxVolume * 0.65;
    } catch {
      // Fallback handled by WebAudio procedural synth
    }
  }

  public unlock(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.unlocked) {
      this.unlocked = true;
      this.ensureActiveTracksPlaying();
    }
    return this.ctx;
  }

  public setRoomCue(cue: MusicCueId): void {
    this.currentCue = cue;
    if (this.unlocked) {
      this.ensureActiveTracksPlaying();
    }
  }

  public getRoomCue(): MusicCueId {
    return this.currentCue;
  }

  public setSoundtrackMode(mode: SoundtrackMode): void {
    this.soundtrackMode = mode;
    this.jukeboxOverrideFile = null;
    this.unlock();
    this.ensureActiveTracksPlaying();
  }

  public getSoundtrackMode(): SoundtrackMode {
    return this.soundtrackMode;
  }

  public cycleSoundtrackMode(): SoundtrackMode {
    const order: SoundtrackMode[] = ['dynamic', 'ambience', 'classic2010', 'muted'];
    const nextIdx = (order.indexOf(this.soundtrackMode) + 1) % order.length;
    this.setSoundtrackMode(order[nextIdx]);
    return this.soundtrackMode;
  }

  public getSoundtrackStatusLabel(): string {
    if (this.soundtrackMode === 'muted') {
      return 'Score: Muted';
    }
    if (this.soundtrackMode === 'ambience') {
      return 'Score: Ambience Only';
    }
    if (this.soundtrackMode === 'classic2010') {
      return 'Score: 2010 Classic';
    }
    const shortNames: Record<MusicCueId, string> = {
      MENU: 'Score: Overture',
      INTRO: 'Score: Intro Waltz',
      Z1S3: "Score: Dread's Shanty",
      Z1S2: 'Score: VIP Lounge Jazz',
      Z1S1_BROKEN: 'Score: Bilge Shamisen',
      Z1S1_TRIUMPH: 'Score: Da Vinci March',
      LOLDEMO: 'Score: LolDemo1 (2010)',
    };
    return shortNames[this.currentCue] || 'Score: Dynamic';
  }

  public getCurrentCueTitle(): string {
    if (this.soundtrackMode === 'muted') return 'Background Music Muted (SFX & Voices Active)';
    if (this.soundtrackMode === 'ambience') return 'Deep Submarine Hull & Ocean Ambience Only';
    if (this.soundtrackMode === 'classic2010') return '2010 LolDemo1 Original (stuff2.ogg)';
    return CUE_METADATA[this.currentCue]?.title || 'Dynamic Submarine Soundtrack';
  }

  public setDucking(reason: 'keypad' | 'museum', active: boolean): void {
    if (reason === 'keypad') this.duckKeypad = active;
    if (reason === 'museum') {
      this.duckMuseum = active;
      if (!active && this.jukeboxOverrideFile) {
        this.stopArchiveTrack();
      }
    }
  }

  private getTargetTrackFile(): string | null {
    if (this.jukeboxOverrideFile) {
      if (this.jukeboxOverrideFile === 'assets/audio/sub_ambience.wav' || this.jukeboxOverrideFile === 'assets/audio/start_the_game.mp3') {
        return null;
      }
      return this.jukeboxOverrideFile;
    }
    if (this.soundtrackMode === 'muted' || this.soundtrackMode === 'ambience') {
      return null;
    }
    if (this.soundtrackMode === 'classic2010') {
      return 'assets/audio/stuff2.ogg';
    }
    return CUE_METADATA[this.currentCue]?.file || 'assets/audio/z1s3_dread_cabin.wav';
  }

  private ensureActiveTracksPlaying(): void {
    const targetFile = this.getTargetTrackFile();
    if (targetFile) {
      const el = this.trackElements.get(targetFile);
      if (el && el.paused) {
        el.play().catch(() => {});
      }
    }
    if (this.ambienceAudio && this.soundtrackMode !== 'muted') {
      if (this.ambienceAudio.paused) {
        this.ambienceAudio.play().catch(() => {});
      }
    }
  }

  private tickAudioFader(): void {
    if (!this.unlocked) return;

    const targetFile = this.getTargetTrackFile();
    const nowMs = performance.now();
    const voiceDuckActive = nowMs - this.lastVoiceTimeMs < 1100;

    let duckMultiplier = 1.0;
    if (this.duckKeypad) {
      duckMultiplier = 0.0; // Total silence while playing Funky Town keypad notes!
    } else if (this.jukeboxOverrideFile) {
      duckMultiplier = 1.0;
    } else if (this.duckMuseum) {
      duckMultiplier = 0.22;
    } else if (voiceDuckActive) {
      duckMultiplier = 0.36; // Smoothly duck background music while characters speak
    }

    const baseMasterMusic = this.masterVolume * this.musicVolume;
    const cueInfo = CUE_METADATA[this.currentCue] || CUE_METADATA.Z1S3;

    for (const [file, el] of this.trackElements.entries()) {
      const currentFade = this.trackCurrentFade.get(file) || 0;
      const targetFade = file === targetFile ? 1.0 : 0.0;
      const step = targetFade > currentFade ? 0.05 : 0.06;
      const nextFade =
        Math.abs(targetFade - currentFade) <= step
          ? targetFade
          : currentFade + Math.sign(targetFade - currentFade) * step;

      this.trackCurrentFade.set(file, nextFade);

      const gain = file === 'assets/audio/stuff2.ogg' ? 0.56 : cueInfo.gain;
      const finalVol = Math.max(0, Math.min(1, baseMasterMusic * gain * nextFade * duckMultiplier));
      el.volume = finalVol;

      if (nextFade <= 0.001 && !el.paused && file !== targetFile) {
        el.pause();
      } else if (nextFade > 0.01 && el.paused && file === targetFile) {
        el.play().catch(() => {});
      }
    }

    // Submarine ambience cushion
    if (this.ambienceAudio) {
      let targetAmb = 0;
      if (this.jukeboxOverrideFile === 'assets/audio/sub_ambience.wav') {
        targetAmb = 0.85;
      } else if (this.soundtrackMode === 'ambience') {
        targetAmb = 0.80 * (this.duckKeypad ? 0.15 : 1.0);
      } else if (this.soundtrackMode === 'dynamic') {
        targetAmb = cueInfo.submarineAmbience * (this.duckKeypad ? 0.1 : 1.0);
      }
      const desiredVol = Math.max(0, Math.min(1, baseMasterMusic * targetAmb));
      const curVol = this.ambienceAudio.volume;
      const diff = desiredVol - curVol;
      this.ambienceAudio.volume = Math.abs(diff) < 0.02 ? desiredVol : curVol + diff * 0.15;

      if (this.ambienceAudio.volume <= 0.002 && !this.ambienceAudio.paused && targetAmb === 0) {
        this.ambienceAudio.pause();
      } else if (targetAmb > 0.01 && this.ambienceAudio.paused) {
        this.ambienceAudio.play().catch(() => {});
      }
    }
  }

  public updateVolumes(): void {
    if (this.stingerAudio) {
      this.stingerAudio.volume = Math.max(0, Math.min(1, this.masterVolume * this.sfxVolume * 0.65));
    }
    this.tickAudioFader();
  }

  public playStartStinger(): void {
    this.unlock();
    if (this.stingerAudio) {
      this.stingerAudio.loop = false;
      this.stingerAudio.currentTime = 0;
      this.stingerAudio.volume = Math.max(0, Math.min(1, this.masterVolume * this.sfxVolume * 0.55));
      this.stingerAudio.play().catch(() => {});
    }
    this.playChord([261.63, 329.63, 392.0, 523.25], 0.45, 'triangle');
  }

  public playArchiveTrack(trackFile: ArchiveJukeboxTrackId): void {
    this.unlock();
    const fullPath = `assets/audio/${trackFile}`;
    this.jukeboxOverrideFile = fullPath;

    if (trackFile === 'start_the_game.mp3') {
      for (const el of this.trackElements.values()) el.pause();
      if (this.stingerAudio) {
        this.stingerAudio.loop = true;
        this.stingerAudio.currentTime = 0;
        this.stingerAudio.volume = Math.max(0.25, this.masterVolume * this.musicVolume * 0.8);
        this.stingerAudio.play().catch(() => {});
      }
      return;
    }

    if (this.stingerAudio) {
      this.stingerAudio.loop = false;
      this.stingerAudio.pause();
    }

    if (trackFile === 'sub_ambience.wav') {
      for (const el of this.trackElements.values()) el.pause();
      if (this.ambienceAudio) {
        this.ambienceAudio.currentTime = 0;
        this.ambienceAudio.volume = Math.max(0.3, this.masterVolume * this.musicVolume * 0.85);
        this.ambienceAudio.play().catch(() => {});
      }
      return;
    }

    const targetEl = this.trackElements.get(fullPath);
    if (targetEl) {
      targetEl.currentTime = 0;
      this.trackCurrentFade.set(fullPath, 1.0);
      targetEl.volume = Math.max(0.25, this.masterVolume * this.musicVolume * 0.78);
      targetEl.play().catch(() => {});
    }
  }

  public stopArchiveTrack(): void {
    this.jukeboxOverrideFile = null;
    if (this.stingerAudio) {
      this.stingerAudio.loop = false;
      this.stingerAudio.pause();
    }
    this.ensureActiveTracksPlaying();
  }

  public getVoiceAmplitude(): number {
    // Smooth exponential decay for 60 FPS jaw/head lip-sync
    this.voiceAmplitude *= 0.86;
    if (this.voiceAmplitude < 0.01) this.voiceAmplitude = 0;
    return this.voiceAmplitude;
  }

  public getActiveSpeaker(): VoiceProfileId {
    return this.activeSpeaker;
  }

  /**
   * Speaks a single character syllable using dual-formant filtering and updates
   * the 60 FPS voice amplitude envelope for skeletal jaw/head lip-sync.
   */
  public triggerVoiceSyllable(profile: VoiceProfileId, charCode: number): void {
    const ctx = this.unlock();
    if (!ctx) return;

    const spec = VOICE_SPECS[profile] || VOICE_SPECS.smoothface;
    const nowMs = performance.now();
    if (nowMs - this.lastSyllableTime < spec.syllableMs * 0.72) {
      return;
    }
    this.lastSyllableTime = nowMs;
    this.lastVoiceTimeMs = nowMs;
    this.activeSpeaker = profile;

    const gainLevel = this.masterVolume * this.voiceVolume * 0.24;
    if (gainLevel <= 0.005) return;

    const now = ctx.currentTime;
    const dur = spec.syllableMs / 1000;

    // Deterministic pitch inflection from character code
    const hash = ((charCode * 17) % 13) / 13 - 0.5;
    const f0 = Math.max(65, spec.baseFreq + hash * spec.pitchSpread);

    const osc = ctx.createOscillator();
    osc.type = spec.wave;
    osc.frequency.setValueAtTime(f0, now);
    if (profile === 'siren') {
      osc.frequency.linearRampToValueAtTime(f0 + 260, now + dur * 0.5);
      osc.frequency.linearRampToValueAtTime(f0 - 80, now + dur);
    } else {
      osc.frequency.exponentialRampToValueAtTime(f0 * (1 + hash * 0.18), now + dur * 0.65);
      osc.frequency.exponentialRampToValueAtTime(f0 * 0.92, now + dur);
    }

    // Formant bandpass filter 1 (throat resonance)
    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(spec.formant1 + hash * 160, now);
    f1.Q.setValueAtTime(4.2, now);

    // Formant peaking filter 2 (mouth vowel articulation)
    const f2 = ctx.createBiquadFilter();
    f2.type = 'peaking';
    f2.frequency.setValueAtTime(spec.formant2 - hash * 220, now);
    f2.gain.setValueAtTime(10, now);
    f2.Q.setValueAtTime(3.5, now);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(gainLevel, now + 0.012);
    env.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(f1);
    f1.connect(f2);
    f2.connect(env);
    env.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + dur + 0.015);

    this.voiceAmplitude = Math.min(1.0, 0.65 + Math.abs(hash) * 0.7);
  }

  public playVoicePhraseSample(profile: VoiceProfileId): void {
    const sample = 'Ahoy there gentleman!';
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.triggerVoiceSyllable(profile, sample.charCodeAt(i * 3) + i * 7);
      }, i * 95);
    }
  }

  public playFootstep(isMetalGrate: boolean): void {
    const ctx = this.unlock();
    if (!ctx) return;
    const vol = this.masterVolume * this.sfxVolume * 0.16;
    if (vol <= 0.005) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    if (isMetalGrate) {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(195 + Math.random() * 45, now);
      osc.frequency.exponentialRampToValueAtTime(68, now + 0.055);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(115 + Math.random() * 25, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.065);
    }
    env.gain.setValueAtTime(vol, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(env);
    env.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.075);
  }

  public playPaperFlip(): void {
    const ctx = this.unlock();
    if (!ctx) return;
    const vol = this.masterVolume * this.sfxVolume * 0.14;
    if (vol <= 0.005) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const env = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.045);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.09);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(vol, now + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
    osc.connect(filter);
    filter.connect(env);
    env.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playUiClick(pitch = 480): void {
    const ctx = this.unlock();
    if (!ctx) return;
    const vol = this.masterVolume * this.sfxVolume * 0.2;
    if (vol <= 0.005) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.35, now + 0.045);
    env.gain.setValueAtTime(vol, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    osc.connect(env);
    env.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playPickupChime(): void {
    this.playChord([440, 554.37, 659.25, 880], 0.28, 'triangle');
  }

  public playCombineSuccess(): void {
    this.playChord([392.0, 493.88, 587.33, 783.99, 987.77], 0.45, 'sawtooth');
  }

  public playPedalSnapBam(): void {
    const ctx = this.unlock();
    if (!ctx) return;
    const vol = this.masterVolume * this.sfxVolume * 0.42;
    if (vol <= 0.005) return;
    const now = ctx.currentTime;

    // Metallic snap + low impact boom
    [95, 142, 218, 620].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(32 + idx * 12, now + 0.38);
      env.gain.setValueAtTime(vol / (idx + 1), now);
      env.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(env);
      env.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.42);
    });
  }

  public playDoorHatch(): void {
    const ctx = this.unlock();
    if (!ctx) return;
    const vol = this.masterVolume * this.sfxVolume * 0.25;
    if (vol <= 0.005) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(92, now + 0.12);
    osc.frequency.linearRampToValueAtTime(185, now + 0.22);
    env.gain.setValueAtTime(vol, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(env);
    env.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playSynthNote(note: string, duration = 0.22): void {
    const ctx = this.unlock();
    if (!ctx) return;
    const freq = NOTE_FREQS[note] || 523.25;
    const vol = this.masterVolume * this.sfxVolume * 0.28;
    if (vol <= 0.005) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const env = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 1.004, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, now);
    filter.frequency.exponentialRampToValueAtTime(750, now + duration);

    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(vol, now + 0.015);
    env.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(env);
    env.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.02);
    osc2.stop(now + duration + 0.02);
  }

  public playFunkyTownHook(): void {
    const seq: Array<{ note: string; delay: number; dur: number }> = [
      { note: 'C5', delay: 0, dur: 0.18 },
      { note: 'C5', delay: 210, dur: 0.18 },
      { note: 'Bb4', delay: 420, dur: 0.18 },
      { note: 'C5', delay: 630, dur: 0.28 },
      { note: 'G4', delay: 1020, dur: 0.28 },
      { note: 'G4', delay: 1380, dur: 0.18 },
      { note: 'C5', delay: 1600, dur: 0.18 },
      { note: 'F5', delay: 1820, dur: 0.18 },
      { note: 'E5', delay: 2040, dur: 0.18 },
      { note: 'C5', delay: 2260, dur: 0.36 },
    ];
    for (const step of seq) {
      setTimeout(() => this.playSynthNote(step.note, step.dur), step.delay);
    }
  }

  private playChord(freqs: number[], duration: number, wave: OscillatorType): void {
    const ctx = this.unlock();
    if (!ctx) return;
    const vol = (this.masterVolume * this.sfxVolume * 0.22) / Math.max(1, freqs.length);
    if (vol <= 0.002) return;
    const now = ctx.currentTime;
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(f, now + idx * 0.045);
      env.gain.setValueAtTime(0.001, now + idx * 0.045);
      env.gain.linearRampToValueAtTime(vol, now + idx * 0.045 + 0.02);
      env.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + duration);
      osc.connect(env);
      env.connect(ctx.destination);
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + duration + 0.02);
    });
  }
}
