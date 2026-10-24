"""
MoonStorm Studios - Smoothface's Epic (Codename: Sparkle)
Physical-Modeling & Warm Acoustic Room Soundtrack Generator (tools/generate_room_soundtracks.py)

Generates 6 distinct, warm, non-fatiguing stereo audio tracks (22050 Hz, 16-bit PCM WAV)
with built-in ambient breathing bridges and seamless loop crossfades:
  1. sub_ambience.wav        - Deep submarine hull creaks, ocean currents, bubbles & distant sonar
  2. menu_overture.wav       - "The Ballad of Smoothface" (Neo-Victorian harpsichord, pizzicato bass & bassoon)
  3. z1s3_dread_cabin.wav    - "Ghost of Sardonia" (Nautical concertina, nylon guitar, celesta & 18s hull-ambience bridge)
  4. z1s2_vip_lounge.wav     - "Blackspit VIP Lounge" (Cool jazz vibraphone, upright walking bass quoting Funky Town & brushes)
  5. z1s1_engine_broken.wav  - "Sweat & Shamisen in the Bilge" (Engine room steam/bilge + Nihongo's shamisen & shakuhachi)
  6. z1s1_engine_triumph.wav - "Da Vinci's Clockwork Triumph" (Renaissance lute, clockwork hammers & celebratory horn)
"""

import os
import shutil
import wave
import numpy as np
from scipy import signal

SR = 22050


def midi_to_freq(m: float) -> float:
    return 440.0 * (2.0 ** ((m - 69.0) / 12.0))


def karplus_strong(freq: float, dur: float, decay: float = 0.994, brightness: float = 0.5, seed: int = 0) -> np.ndarray:
    """Warm physical-modeling plucked string (nylon guitar, harpsichord, lute, shamisen, upright bass)."""
    n_samples = int(SR * dur)
    if freq <= 20 or n_samples <= 10:
        return np.zeros(n_samples, dtype=np.float32)
    rng = np.random.default_rng(seed)
    delay = max(2, int(round(SR / freq)))
    # Initial pluck excitation: filtered warm noise burst
    burst = rng.uniform(-1.0, 1.0, delay).astype(np.float32)
    # Smooth the burst according to brightness (lower brightness = warmer nylon/bass tone)
    b_LP, a_LP = signal.butter(2, min(0.95, max(0.08, brightness)), btype="low")
    burst = signal.lfilter(b_LP, a_LP, burst).astype(np.float32)

    out = np.zeros(n_samples, dtype=np.float32)
    buf = burst.copy()
    idx = 0
    for i in range(n_samples):
        out[i] = buf[idx]
        nxt = (idx + 1) % delay
        # Two-point averaging lowpass in feedback loop
        buf[idx] = decay * (0.55 * buf[idx] + 0.45 * buf[nxt])
        idx = nxt

    # Gentle attack smoothing (3ms) and release fade (40ms)
    att = min(int(0.003 * SR), n_samples // 4)
    if att > 1:
        out[:att] *= np.linspace(0.0, 1.0, att, dtype=np.float32)
    rel = min(int(0.045 * SR), n_samples // 3)
    if rel > 1:
        out[-rel:] *= np.linspace(1.0, 0.0, rel, dtype=np.float32)
    return out


def warm_reed_tone(freq: float, dur: float, vib_rate: float = 4.8, vib_depth: float = 0.0035, cutoff_hz: float = 1100.0) -> np.ndarray:
    """Warm concertina / accordion / bassoon multi-harmonic reed with bellows swell."""
    n = int(SR * dur)
    if n <= 10:
        return np.zeros(n, dtype=np.float32)
    t = np.arange(n, dtype=np.float32) / SR
    # Delayed vibrato
    vib_env = np.clip((t - 0.12) / 0.25, 0.0, 1.0)
    inst_freq = freq * (1.0 + vib_depth * vib_env * np.sin(2.0 * np.pi * vib_rate * t))
    phase = 2.0 * np.pi * np.cumsum(inst_freq) / SR
    # Warm harmonic series (fundamental + odd/even reed harmonics)
    sig = (
        1.00 * np.sin(phase)
        + 0.48 * np.sin(2.0 * phase + 0.2)
        + 0.32 * np.sin(3.0 * phase + 0.5)
        + 0.14 * np.sin(4.0 * phase)
        + 0.07 * np.sin(5.0 * phase)
    ).astype(np.float32)
    # Slight musette detuned second reed for accordion warmth
    phase2 = phase * 1.0018
    sig += 0.35 * (np.sin(phase2) + 0.35 * np.sin(2.0 * phase2)).astype(np.float32)

    # Lowpass filter for wooden cabinet warmth
    wn = min(0.92, max(0.04, cutoff_hz / (SR * 0.5)))
    b, a = signal.butter(2, wn, btype="low")
    sig = signal.lfilter(b, a, sig).astype(np.float32)

    # Bellows ADSR envelope
    env = np.ones(n, dtype=np.float32)
    att = min(int(0.08 * SR), n // 3)
    rel = min(int(0.14 * SR), n // 3)
    if att > 1:
        env[:att] = np.linspace(0.0, 1.0, att, dtype=np.float32) ** 0.8
    if rel > 1:
        env[-rel:] = np.linspace(1.0, 0.0, rel, dtype=np.float32) ** 1.2
    # Gentle natural decay over sustained note
    env *= np.exp(-0.35 * t / max(0.3, dur))
    return sig * env * 0.45


def vibraphone_tone(freq: float, dur: float, trem_rate: float = 5.2) -> np.ndarray:
    """Warm Milt Jackson / Grim Fandango style jazz vibraphone with motor tremolo."""
    n = int(SR * dur)
    if n <= 10:
        return np.zeros(n, dtype=np.float32)
    t = np.arange(n, dtype=np.float32) / SR
    w = 2.0 * np.pi * freq * t
    # Fundamental + 4th harmonic (characteristic vibraphone bar overtone)
    bar = (
        1.0 * np.sin(w) * np.exp(-1.6 * t)
        + 0.22 * np.sin(4.0 * w) * np.exp(-7.5 * t)
        + 0.06 * np.sin(9.0 * w) * np.exp(-18.0 * t)
    ).astype(np.float32)
    # Motor tremolo
    trem = 0.78 + 0.22 * np.sin(2.0 * np.pi * trem_rate * t)
    att = min(int(0.006 * SR), n // 4)
    if att > 1:
        bar[:att] *= np.linspace(0.0, 1.0, att, dtype=np.float32)
    rel = min(int(0.08 * SR), n // 4)
    if rel > 1:
        bar[-rel:] *= np.linspace(1.0, 0.0, rel, dtype=np.float32)
    return (bar * trem * 0.55).astype(np.float32)


def shakuhachi_tone(freq: float, dur: float, seed: int = 1) -> np.ndarray:
    """Breathy bamboo flute with pitch bend ornament at attack."""
    n = int(SR * dur)
    if n <= 10:
        return np.zeros(n, dtype=np.float32)
    rng = np.random.default_rng(seed)
    t = np.arange(n, dtype=np.float32) / SR
    # Characteristic upward pitch scoop on attack + slow vibrato
    scoop = 1.0 - 0.035 * np.exp(-14.0 * t)
    vib = 1.0 + 0.005 * np.clip((t - 0.2) / 0.3, 0.0, 1.0) * np.sin(2.0 * np.pi * 5.0 * t)
    inst_f = freq * scoop * vib
    phase = 2.0 * np.pi * np.cumsum(inst_f) / SR
    tone = (np.sin(phase) + 0.28 * np.sin(2.0 * phase) + 0.08 * np.sin(3.0 * phase)).astype(np.float32)

    # Breathy chiff noise bandpass-filtered around 2*freq
    noise = rng.normal(0.0, 1.0, n).astype(np.float32)
    wn_low = min(0.85, max(0.03, (freq * 1.5) / (SR * 0.5)))
    wn_high = min(0.94, max(wn_low + 0.04, (freq * 2.8) / (SR * 0.5)))
    b, a = signal.butter(2, [wn_low, wn_high], btype="band")
    chiff = signal.lfilter(b, a, noise).astype(np.float32) * (0.28 * np.exp(-3.5 * t) + 0.07)

    sig = tone + chiff
    env = np.ones(n, dtype=np.float32)
    att = min(int(0.11 * SR), n // 3)
    rel = min(int(0.18 * SR), n // 3)
    if att > 1:
        env[:att] = np.linspace(0.0, 1.0, att, dtype=np.float32)
    if rel > 1:
        env[-rel:] = np.linspace(1.0, 0.0, rel, dtype=np.float32)
    return sig * env * 0.42


def mix_mono_into_stereo(buf_l: np.ndarray, buf_r: np.ndarray, sig: np.ndarray, start_s: float, vol: float = 1.0, pan: float = 0.0) -> None:
    """Mixes a mono signal into stereo buffers at start_s with equal-power panning (-1 left .. +1 right)."""
    idx0 = int(round(start_s * SR))
    if idx0 >= len(buf_l) or len(sig) == 0:
        return
    idx1 = min(len(buf_l), idx0 + len(sig))
    seg = sig[: idx1 - idx0]
    angle = (pan + 1.0) * 0.25 * np.pi
    gl = float(np.cos(angle) * vol)
    gr = float(np.sin(angle) * vol)
    buf_l[idx0:idx1] += seg * gl
    buf_r[idx0:idx1] += seg * gr


def apply_warm_reverb(buf_l: np.ndarray, buf_r: np.ndarray, wet: float = 0.24) -> tuple[np.ndarray, np.ndarray]:
    """Stereo Schroeder/comb warm room reverb."""
    delays_ms = [29.7, 37.1, 41.1, 43.7, 53.3]
    gains = [0.42, 0.36, 0.31, 0.27, 0.22]
    rev_l = np.zeros_like(buf_l)
    rev_r = np.zeros_like(buf_r)
    for i, (d_ms, g) in enumerate(zip(delays_ms, gains)):
        d_samp = int(SR * d_ms / 1000.0)
        if d_samp < len(buf_l):
            if i % 2 == 0:
                rev_l[d_samp:] += buf_l[:-d_samp] * g
                rev_r[d_samp:] += buf_r[:-d_samp] * g * 0.85
            else:
                rev_r[d_samp:] += buf_r[:-d_samp] * g
                rev_l[d_samp:] += buf_l[:-d_samp] * g * 0.85
    # Lowpass the reverb tail at 2400 Hz for warmth
    b, a = signal.butter(2, 2400.0 / (SR * 0.5), btype="low")
    rev_l = signal.lfilter(b, a, rev_l).astype(np.float32)
    rev_r = signal.lfilter(b, a, rev_r).astype(np.float32)
    return buf_l * (1.0 - wet * 0.3) + rev_l * wet, buf_r * (1.0 - wet * 0.3) + rev_r * wet


def generate_sub_ambience_bed(dur_s: float, seed: int = 42, include_sonar: bool = True) -> tuple[np.ndarray, np.ndarray]:
    """Deep underwater ocean rumble, slow stereo current swells, wooden/iron hull creaks, and distant sonar."""
    n = int(SR * dur_s)
    rng = np.random.default_rng(seed)
    t = np.arange(n, dtype=np.float32) / SR

    # 1. Deep ocean current rumble (lowpass filtered noise at 110 Hz)
    raw_l = rng.normal(0.0, 1.0, n).astype(np.float32)
    raw_r = rng.normal(0.0, 1.0, n).astype(np.float32)
    b, a = signal.butter(3, 105.0 / (SR * 0.5), btype="low")
    ocean_l = signal.lfilter(b, a, raw_l).astype(np.float32)
    ocean_r = signal.lfilter(b, a, raw_r).astype(np.float32)
    swell_l = 0.65 + 0.35 * np.sin(2.0 * np.pi * t / 9.5)
    swell_r = 0.65 + 0.35 * np.cos(2.0 * np.pi * t / 11.0)
    buf_l = ocean_l * swell_l * 0.14
    buf_r = ocean_r * swell_r * 0.14

    # 2. Warm submarine engine/hull harmonic drone (55 Hz + 82.4 Hz subtle fifths)
    drone = (
        0.035 * np.sin(2.0 * np.pi * 55.0 * t)
        + 0.022 * np.sin(2.0 * np.pi * 82.41 * t)
    ) * (0.7 + 0.3 * np.sin(2.0 * np.pi * t / 14.0))
    buf_l += drone.astype(np.float32)
    buf_r += drone.astype(np.float32)

    # 3. Occasional hull creaks (soft resonant pitch sweeps every ~11s)
    for creak_t in np.arange(4.5, dur_s - 4.0, 11.5):
        c_dur = 1.8
        cn = int(SR * c_dur)
        ct = np.arange(cn, dtype=np.float32) / SR
        f0 = rng.uniform(135.0, 195.0)
        f1 = f0 * rng.uniform(0.78, 0.88)
        creak_f = np.linspace(f0, f1, cn, dtype=np.float32)
        # Groaning stick-slip modulation
        phase = 2.0 * np.pi * np.cumsum(creak_f) / SR
        creak = (np.sin(phase) + 0.4 * np.sin(2.0 * phase)) * np.sin(np.pi * ct / c_dur) ** 2
        b_c, a_c = signal.butter(2, 320.0 / (SR * 0.5), btype="low")
        creak = signal.lfilter(b_c, a_c, creak).astype(np.float32)
        mix_mono_into_stereo(buf_l, buf_r, creak, float(creak_t), vol=0.045, pan=float(rng.uniform(-0.6, 0.6)))

    # 4. Distant soft sonar ping (at most 1-2 times per minute, very gentle)
    if include_sonar:
        for ping_t in [9.0, 34.0]:
            if ping_t + 3.5 < dur_s:
                pn = int(SR * 3.2)
                pt = np.arange(pn, dtype=np.float32) / SR
                ping = np.sin(2.0 * np.pi * 1046.5 * pt) * np.exp(-2.4 * pt)
                ping += 0.35 * np.sin(2.0 * np.pi * 1044.0 * np.maximum(0.0, pt - 0.28)) * np.exp(-1.8 * np.maximum(0.0, pt - 0.28))
                att = int(0.015 * SR)
                ping[:att] *= np.linspace(0.0, 1.0, att, dtype=np.float32)
                mix_mono_into_stereo(buf_l, buf_r, ping.astype(np.float32), ping_t, vol=0.048, pan=0.35)

    # 5. Gentle water bubble plops
    for b_t in np.arange(2.2, dur_s - 2.0, 5.2):
        for k in range(3):
            bt = b_t + k * 0.11 + rng.uniform(0.0, 0.04)
            bn = int(SR * 0.09)
            tt = np.arange(bn, dtype=np.float32) / SR
            bf = np.linspace(380.0 + k * 90.0, 720.0 + k * 110.0, bn, dtype=np.float32)
            bub = np.sin(2.0 * np.pi * np.cumsum(bf) / SR) * np.exp(-32.0 * tt)
            mix_mono_into_stereo(buf_l, buf_r, bub.astype(np.float32), float(bt), vol=0.032, pan=float(rng.uniform(-0.5, 0.5)))

    return buf_l, buf_r


def save_seamless_stereo_wav(paths: list[str], buf_l: np.ndarray, buf_r: np.ndarray, crossfade_s: float = 2.5, target_peak: float = 0.72) -> None:
    """Applies a seamless loop crossfade at the end/start and writes 16-bit stereo WAV to all target paths."""
    cf = int(SR * crossfade_s)
    if len(buf_l) > cf * 3:
        head_l = buf_l[:cf].copy()
        head_r = buf_r[:cf].copy()
        tail_l = buf_l[-cf:].copy()
        tail_r = buf_r[-cf:].copy()
        fade_in = np.linspace(0.0, 1.0, cf, dtype=np.float32)
        fade_out = 1.0 - fade_in
        buf_l = buf_l[:-cf].copy()
        buf_r = buf_r[:-cf].copy()
        buf_l[:cf] = head_l * fade_in + tail_l * fade_out
        buf_r[:cf] = head_r * fade_in + tail_r * fade_out

    peak = max(1e-5, float(max(np.max(np.abs(buf_l)), np.max(np.abs(buf_r)))))
    scale = target_peak / peak
    stereo = np.empty((len(buf_l), 2), dtype=np.int16)
    stereo[:, 0] = np.clip(buf_l * scale * 32767.0, -32767, 32767).astype(np.int16)
    stereo[:, 1] = np.clip(buf_r * scale * 32767.0, -32767, 32767).astype(np.int16)

    first = paths[0]
    os.makedirs(os.path.dirname(first), exist_ok=True)
    with wave.open(first, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(stereo.tobytes())

    for p in paths[1:]:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        shutil.copy2(first, p)
    print(f"Saved {os.path.basename(first)} ({len(buf_l)/SR:.1f}s, {os.path.getsize(first)//1024} KB)")


def build_menu_overture() -> tuple[np.ndarray, np.ndarray]:
    """
    Cue 1: 'The Ballad of Rupert & Morgan Stache' (Main Menu & Intro Theatre)
    3/4 Neo-Victorian comedic villain waltz in D minor (104 BPM -> beat = 0.577s, bar = 1.73s).
    28 bars total (~48.5s) including an 8-bar atmospheric harpsichord-only bridge.
    """
    beat = 60.0 / 104.0
    bar = beat * 3.0
    total_bars = 28
    dur_s = total_bars * bar + 2.5
    buf_l, buf_r = generate_sub_ambience_bed(dur_s, seed=101, include_sonar=False)

    # Chord progression per bar (MIDI notes: [bass, chord_low, chord_mid, chord_high])
    chords = [
        (38, [57, 62, 65]),  # Dm
        (38, [57, 62, 65]),  # Dm
        (43, [55, 58, 62]),  # Gm
        (45, [57, 61, 64]),  # A7
        (38, [57, 62, 65]),  # Dm
        (46, [58, 62, 65]),  # Bb
        (40, [56, 58, 64]),  # Edim7
        (45, [57, 61, 67]),  # A7
    ]

    for b_idx in range(total_bars):
        t0 = b_idx * bar
        bass_m, triad = chords[b_idx % len(chords)]
        # Pizzicato contrabass on beat 1
        bass_sig = karplus_strong(midi_to_freq(bass_m), beat * 1.8, decay=0.996, brightness=0.18, seed=b_idx + 10)
        mix_mono_into_stereo(buf_l, buf_r, bass_sig, t0, vol=0.38, pan=-0.15)

        # Plucked harpsichord/lute arpeggio on beats 2 and 3
        for step, m_note in enumerate(triad):
            arp_t = t0 + (1 + step * 0.5) * beat
            arp_sig = karplus_strong(midi_to_freq(m_note), beat * 1.4, decay=0.993, brightness=0.52, seed=b_idx * 7 + step)
            mix_mono_into_stereo(buf_l, buf_r, arp_sig, arp_t, vol=0.22, pan=-0.35 + step * 0.35)

    # Melodic phrases (Bars 0..15 play theme, Bars 16..23 breathe with just harpsichord/ambience, Bars 24..27 cadence)
    melody = [
        # Bar 0..3: Sneaky Smoothface motif
        (0.0, 62, 1.5), (1.5, 65, 0.5), (2.0, 69, 1.0),
        (3.0, 67, 1.5), (4.5, 65, 0.5), (5.0, 64, 1.0),
        (6.0, 62, 1.0), (7.0, 58, 1.0), (8.0, 55, 1.0),
        (9.0, 57, 2.5),
        # Bar 4..7: Answering higher phrase
        (12.0, 69, 1.5), (13.5, 70, 0.5), (14.0, 69, 1.0),
        (15.0, 65, 1.5), (16.5, 62, 0.5), (17.0, 65, 1.0),
        (18.0, 64, 1.5), (19.5, 61, 0.5), (20.0, 64, 1.0),
        (21.0, 62, 2.6),
        # Bar 8..15: Lyric variation
        (24.0, 74, 1.5), (25.5, 72, 0.5), (26.0, 70, 1.0),
        (27.0, 69, 2.0), (29.0, 65, 1.0),
        (30.0, 67, 1.5), (31.5, 65, 0.5), (32.0, 64, 1.0),
        (33.0, 69, 2.5),
        (36.0, 70, 1.5), (37.5, 69, 0.5), (38.0, 67, 1.0),
        (39.0, 65, 1.5), (40.5, 64, 0.5), (41.0, 62, 1.0),
        (42.0, 61, 2.0), (44.0, 57, 1.0),
        (45.0, 62, 2.8),
    ]
    for beat_pos, m_note, dur_beats in melody:
        sig = warm_reed_tone(midi_to_freq(m_note), dur_beats * beat, vib_rate=4.6, vib_depth=0.003, cutoff_hz=980.0)
        mix_mono_into_stereo(buf_l, buf_r, sig, beat_pos * beat, vol=0.30, pan=0.2)

    return apply_warm_reverb(buf_l, buf_r, wet=0.26)


def build_z1s3_dread_cabin() -> tuple[np.ndarray, np.ndarray]:
    """
    Cue 2: 'Ghost of Sardonia' (Z1S3 Captain Dread's Cabin)
    Slow, moody nautical sea-shanty waltz in C minor / Eb major (84 BPM -> beat = 0.714s, bar = 2.14s).
    28 bars (~60s):
      - Bars 0..15 (0..34s): Warm concertina/accordion + fingerpicked nylon guitar + celesta
      - Bars 16..23 (34..51s): 17-second AMBIENT BREATHING BRIDGE (no accordion lead, just submarine hull creaks,
        sonar ping, and sparse nylon guitar harmonics so the player's ears rest!)
      - Bars 24..27 (51..60s): Gentle music-box celesta & guitar cadence leading back in.
    """
    beat = 60.0 / 84.0
    bar = beat * 3.0
    total_bars = 28
    dur_s = total_bars * bar + 2.5
    buf_l, buf_r = generate_sub_ambience_bed(dur_s, seed=202, include_sonar=True)

    chords = [
        (36, [55, 60, 63]),  # Cm
        (41, [56, 60, 65]),  # Fm
        (46, [58, 62, 65]),  # Bb7
        (39, [55, 58, 63]),  # Ebmaj7
        (44, [56, 60, 63]),  # Abmaj7
        (41, [56, 60, 65]),  # Fm
        (43, [55, 59, 62]),  # G7
        (36, [55, 60, 63]),  # Cm
    ]

    for b_idx in range(total_bars):
        t0 = b_idx * bar
        bass_m, triad = chords[b_idx % len(chords)]
        # Fingerpicked nylon guitar (quieter during the ambient breathing bridge bars 16..22)
        in_bridge = 16 <= b_idx <= 22
        vol_scale = 0.45 if in_bridge else 1.0

        bass_sig = karplus_strong(midi_to_freq(bass_m), beat * 2.2, decay=0.995, brightness=0.22, seed=b_idx + 200)
        mix_mono_into_stereo(buf_l, buf_r, bass_sig, t0, vol=0.34 * vol_scale, pan=-0.25)

        if not in_bridge or b_idx % 2 == 0:
            for s_idx, m_note in enumerate(triad):
                gt = t0 + (1.0 + s_idx * 0.65) * beat
                gsig = karplus_strong(midi_to_freq(m_note), beat * 1.5, decay=0.992, brightness=0.32, seed=b_idx * 11 + s_idx)
                mix_mono_into_stereo(buf_l, buf_r, gsig, gt, vol=0.20 * vol_scale, pan=-0.3 + s_idx * 0.3)

    # Nautical concertina melody (Bars 0..15 only!)
    shanty_melody = [
        (0.0, 60, 2.0), (2.0, 63, 1.0),
        (3.0, 65, 2.0), (5.0, 67, 1.0),
        (6.0, 70, 2.0), (8.0, 67, 1.0),
        (9.0, 63, 2.6),
        (12.0, 68, 2.0), (14.0, 67, 1.0),
        (15.0, 65, 2.0), (17.0, 63, 1.0),
        (18.0, 62, 2.0), (20.0, 59, 1.0),
        (21.0, 60, 2.7),
        # Second 8-bar phrase (higher nautical nostalgia)
        (24.0, 67, 2.0), (26.0, 72, 1.0),
        (27.0, 68, 2.0), (29.0, 65, 1.0),
        (30.0, 70, 2.0), (32.0, 67, 1.0),
        (33.0, 63, 2.6),
        (36.0, 65, 1.5), (37.5, 67, 0.5), (38.0, 68, 1.0),
        (39.0, 67, 2.0), (41.0, 63, 1.0),
        (42.0, 62, 2.0), (44.0, 59, 1.0),
        (45.0, 60, 2.8),
    ]
    for beat_pos, m_note, dur_beats in shanty_melody:
        sig = warm_reed_tone(midi_to_freq(m_note), dur_beats * beat, vib_rate=4.2, vib_depth=0.0032, cutoff_hz=880.0)
        mix_mono_into_stereo(buf_l, buf_r, sig, beat_pos * beat, vol=0.26, pan=0.22)

    # Music-box celesta return in bars 24..27 (beats 72..83)
    celesta_notes = [
        (72.0, 72, 1.5), (74.0, 75, 1.0),
        (75.0, 77, 1.5), (77.0, 79, 1.0),
        (78.0, 75, 2.0), (80.0, 74, 1.0),
        (81.0, 72, 2.8),
    ]
    for beat_pos, m_note, dur_beats in celesta_notes:
        sig = vibraphone_tone(midi_to_freq(m_note), dur_beats * beat, trem_rate=3.5)
        mix_mono_into_stereo(buf_l, buf_r, sig, beat_pos * beat, vol=0.22, pan=-0.2)

    return apply_warm_reverb(buf_l, buf_r, wet=0.28)


def build_z1s2_vip_lounge() -> tuple[np.ndarray, np.ndarray]:
    """
    Cue 3: 'Blackspit VIP Lounge' (Z1S2 Submarine VIP Lounge)
    Cool 1960s spy/lounge vibraphone + upright walking bass in C Dorian (96 BPM -> beat = 0.625s, bar = 2.5s).
    24 bars (~60s):
      - Upright walking bass walks smoothly and subtly quotes 'Funky Town' (C - C - Bb - C) every 8th bar!
      - Vibraphone plays lush Dorian jazz chords & cool melody on bars 0..7 and 12..19, leaving bars 8..11 and 20..23
        as a relaxed bass-and-brushes lounge groove.
    """
    beat = 60.0 / 96.0
    bar = beat * 4.0
    total_bars = 24
    dur_s = total_bars * bar + 2.5
    buf_l, buf_r = generate_sub_ambience_bed(dur_s, seed=303, include_sonar=False)
    rng = np.random.default_rng(303)

    # Walking bass patterns per 8-bar cycle (Bar 7 quotes Funky Town: C - C - Bb - C -> G - G - C - F - E - C)
    walking_bars = [
        [36, 39, 41, 43],  # Cm7 walk up
        [43, 41, 39, 38],  # Cm7 walk down
        [41, 45, 48, 46],  # F9 walk
        [41, 39, 38, 36],  # F9 -> Cm
        [36, 39, 43, 46],  # Cm7
        [44, 43, 41, 39],  # Abmaj7
        [38, 41, 43, 47],  # Dm7b5 -> G7
        [48, 48, 46, 48],  # Subtle Funky Town quote in bass! (C3 - C3 - Bb2 - C3)
    ]

    vibe_chords = [
        [58, 63, 67, 70],  # Cm9
        [58, 63, 67, 70],
        [57, 63, 67, 72],  # F13
        [57, 63, 65, 70],
        [58, 63, 67, 70],  # Cm9
        [56, 63, 67, 72],  # Abmaj9
        [56, 62, 65, 71],  # G7alt
        [58, 63, 67, 70],  # Cm9
    ]

    for b_idx in range(total_bars):
        t0 = b_idx * bar
        b_notes = walking_bars[b_idx % 8]
        for beat_i, m_bass in enumerate(b_notes):
            bt = t0 + beat_i * beat
            bsig = karplus_strong(midi_to_freq(m_bass), beat * 1.15, decay=0.995, brightness=0.16, seed=b_idx * 13 + beat_i)
            mix_mono_into_stereo(buf_l, buf_r, bsig, bt, vol=0.40, pan=-0.1)

            # Soft brushed jazz hi-hat on beats 2 and 4
            if beat_i in (1, 3):
                hn = int(SR * 0.08)
                hnoise = rng.normal(0.0, 1.0, hn).astype(np.float32)
                b_h, a_h = signal.butter(2, [3500.0 / (SR * 0.5), 7500.0 / (SR * 0.5)], btype="band")
                hat = signal.lfilter(b_h, a_h, hnoise).astype(np.float32) * np.exp(-28.0 * np.arange(hn, dtype=np.float32) / SR)
                mix_mono_into_stereo(buf_l, buf_r, hat, bt, vol=0.06, pan=0.35)

        # Warm vibraphone comping chords on beat 1 and beat 2.5 (except breathing bars 8..11)
        if not (8 <= b_idx <= 11):
            v_chord = vibe_chords[b_idx % 8]
            for m_v in v_chord:
                vsig = vibraphone_tone(midi_to_freq(m_v), beat * 2.2, trem_rate=4.8)
                mix_mono_into_stereo(buf_l, buf_r, vsig, t0 + 0.02, vol=0.11, pan=-0.25)
            if b_idx % 2 == 0:
                for m_v in v_chord:
                    vsig2 = vibraphone_tone(midi_to_freq(m_v), beat * 1.4, trem_rate=4.8)
                    mix_mono_into_stereo(buf_l, buf_r, vsig2, t0 + 2.5 * beat, vol=0.09, pan=0.25)

    # Cool vibraphone solo phrases (Bars 0..7 and Bars 12..19)
    vibe_melody = [
        (0.5, 72, 1.5), (2.0, 75, 1.0), (3.0, 74, 1.0),
        (4.0, 72, 2.5), (7.0, 70, 1.0),
        (8.5, 69, 1.5), (10.0, 72, 1.5), (11.5, 67, 2.5),
        (16.5, 75, 1.5), (18.0, 79, 1.5), (19.5, 77, 1.5),
        (21.0, 75, 2.0), (23.0, 72, 1.0),
        (24.0, 74, 2.5), (27.0, 71, 1.0),
        (28.0, 72, 0.5), (28.5, 72, 0.5), (29.0, 70, 0.5), (29.5, 72, 1.5),  # Funky Town wink!
        # Second solo at bar 12 (beat 48)
        (48.5, 79, 1.5), (50.0, 77, 1.0), (51.0, 75, 1.0),
        (52.0, 74, 2.0), (54.0, 72, 1.5),
        (56.5, 75, 1.5), (58.0, 72, 1.5), (59.5, 69, 2.0),
        (64.0, 72, 2.5), (67.0, 75, 1.0),
        (68.0, 74, 2.0), (70.0, 72, 2.0),
    ]
    for beat_pos, m_note, dur_beats in vibe_melody:
        vsig = vibraphone_tone(midi_to_freq(m_note), dur_beats * beat, trem_rate=5.6)
        mix_mono_into_stereo(buf_l, buf_r, vsig, beat_pos * beat, vol=0.25, pan=0.2)

    return apply_warm_reverb(buf_l, buf_r, wet=0.27)


def build_z1s1_engine_broken() -> tuple[np.ndarray, np.ndarray]:
    """
    Cue 4: 'Sweat & Shamisen in the Bilge' (Z1S1 Engine Room before Da Vinci Machine)
    Atmospheric industrial engine room + Japanese D In-Sen pentatonic (D - Eb - G - A - C)
    for Nihongo Nohondes (88 BPM -> beat = 0.682s, bar = 2.73s). 20 bars (~54.5s).
    Includes a 16-second ambient engine-and-koto breathing section in the middle.
    """
    beat = 60.0 / 88.0
    bar = beat * 4.0
    total_bars = 20
    dur_s = total_bars * bar + 2.5
    buf_l, buf_r = generate_sub_ambience_bed(dur_s, seed=404, include_sonar=True)
    rng = np.random.default_rng(404)

    # Subtle rhythmic steam valve / bilge pump sigh every 2 bars
    for b_idx in range(0, total_bars, 2):
        st0 = b_idx * bar + 2.0 * beat
        sn = int(SR * 0.45)
        st = np.arange(sn, dtype=np.float32) / SR
        snoise = rng.normal(0.0, 1.0, sn).astype(np.float32)
        b_s, a_s = signal.butter(2, [500.0 / (SR * 0.5), 1800.0 / (SR * 0.5)], btype="band")
        steam = signal.lfilter(b_s, a_s, snoise).astype(np.float32) * np.sin(np.pi * st / 0.45) * np.exp(-3.5 * st)
        mix_mono_into_stereo(buf_l, buf_r, steam, st0, vol=0.045, pan=-0.45 if (b_idx % 4 == 0) else 0.45)

    # Sparse Japanese In-Sen koto/shamisen ostinato (D2=38, A2=45, D3=50, Eb3=51, G3=55, A3=57, C4=60)
    ostinato = [
        (0.0, 38), (1.0, 45), (1.5, 50), (2.5, 51), (3.0, 45),
        (4.0, 38), (5.0, 55), (5.5, 57), (6.5, 51), (7.0, 50),
    ]
    for two_bar in range(total_bars // 2):
        base_beat = two_bar * 8.0
        in_bridge = 5 <= two_bar <= 7
        for off_b, m_note in ostinato:
            if in_bridge and off_b > 2.5:
                continue
            ksig = karplus_strong(midi_to_freq(m_note), beat * 1.6, decay=0.994, brightness=0.45, seed=two_bar * 19 + int(off_b * 2))
            mix_mono_into_stereo(buf_l, buf_r, ksig, (base_beat + off_b) * beat, vol=0.28, pan=-0.2 + (off_b % 3) * 0.2)

    # Shakuhachi bamboo flute phrases (Bars 1..4 and Bars 16..19)
    flute_phrases = [
        (4.0, 62, 2.5), (6.5, 63, 1.5), (8.0, 67, 2.0), (10.0, 69, 3.0),
        (14.0, 67, 1.5), (15.5, 63, 1.5), (17.0, 62, 3.2),
        # Return at beat 64 (bar 16)
        (64.0, 69, 2.0), (66.0, 72, 2.0), (68.0, 69, 1.5), (69.5, 67, 1.5),
        (71.0, 63, 2.0), (73.0, 62, 3.5),
    ]
    for idx, (beat_pos, m_note, dur_beats) in enumerate(flute_phrases):
        fsig = shakuhachi_tone(midi_to_freq(m_note), dur_beats * beat, seed=500 + idx)
        mix_mono_into_stereo(buf_l, buf_r, fsig, beat_pos * beat, vol=0.26, pan=0.25)

    return apply_warm_reverb(buf_l, buf_r, wet=0.29)


def build_z1s1_engine_triumph() -> tuple[np.ndarray, np.ndarray]:
    """
    Cue 5: 'Da Vinci's Clockwork Triumph' (Z1S1 after installing the Perpetual Movement Machine)
    Upbeat Renaissance lute + clockwork hammer rhythm + celebratory horn in D Mixolydian (112 BPM).
    24 bars (~51s).
    """
    beat = 60.0 / 112.0
    bar = beat * 4.0
    total_bars = 24
    dur_s = total_bars * bar + 2.5
    buf_l, buf_r = generate_sub_ambience_bed(dur_s, seed=505, include_sonar=False)

    chords = [
        (38, [57, 62, 66]),  # D
        (36, [55, 60, 64]),  # C
        (43, [55, 59, 62]),  # G
        (38, [57, 62, 66]),  # D
        (47, [59, 62, 66]),  # Bm
        (43, [55, 59, 62]),  # G
        (36, [55, 60, 64]),  # C
        (45, [57, 61, 64]),  # A7
    ]

    for b_idx in range(total_bars):
        t0 = b_idx * bar
        bass_m, triad = chords[b_idx % 8]
        # Clockwork wooden-mallet & bass groove on beats 1, 2, 3, 4
        for beat_i in range(4):
            bt = t0 + beat_i * beat
            m_b = bass_m if beat_i % 2 == 0 else bass_m + 7
            bsig = karplus_strong(midi_to_freq(m_b), beat * 1.1, decay=0.994, brightness=0.28, seed=b_idx * 9 + beat_i)
            mix_mono_into_stereo(buf_l, buf_r, bsig, bt, vol=0.34, pan=-0.15)

        # Renaissance lute arpeggios
        for s_i, m_n in enumerate(triad):
            lt = t0 + (s_i * 0.5 + 0.5) * beat
            lsig = karplus_strong(midi_to_freq(m_n), beat * 1.2, decay=0.993, brightness=0.48, seed=b_idx * 17 + s_i)
            mix_mono_into_stereo(buf_l, buf_r, lsig, lt, vol=0.20, pan=-0.3 + s_i * 0.3)

    melody = [
        (0.0, 62, 1.5), (1.5, 66, 0.5), (2.0, 69, 1.0), (3.0, 74, 1.0),
        (4.0, 72, 1.5), (5.5, 69, 0.5), (6.0, 67, 2.0),
        (8.0, 67, 1.5), (9.5, 69, 0.5), (10.0, 71, 1.0), (11.0, 67, 1.0),
        (12.0, 66, 3.0),
        (16.0, 71, 1.5), (17.5, 69, 0.5), (18.0, 66, 1.0), (19.0, 62, 1.0),
        (20.0, 67, 1.5), (21.5, 69, 0.5), (22.0, 71, 2.0),
        (24.0, 72, 1.5), (25.5, 71, 0.5), (26.0, 69, 1.0), (27.0, 67, 1.0),
        (28.0, 69, 3.0),
    ]
    for cycle in [0, 64]:
        for beat_pos, m_note, dur_beats in melody:
            sig = warm_reed_tone(midi_to_freq(m_note), dur_beats * beat, vib_rate=5.0, vib_depth=0.003, cutoff_hz=1150.0)
            mix_mono_into_stereo(buf_l, buf_r, sig, (cycle + beat_pos) * beat, vol=0.25, pan=0.2)

    return apply_warm_reverb(buf_l, buf_r, wet=0.25)


def main() -> None:
    root = r"C:\AntiGravityStuff\Moonstorm2"
    target_dirs = [
        os.path.join(root, "assets", "audio"),
        os.path.join(root, "public", "assets", "audio"),
        os.path.join(root, "dist", "assets", "audio"),
    ]

    tracks = {
        "sub_ambience.wav": generate_sub_ambience_bed(48.0, seed=77, include_sonar=True),
        "menu_overture.wav": build_menu_overture(),
        "z1s3_dread_cabin.wav": build_z1s3_dread_cabin(),
        "z1s2_vip_lounge.wav": build_z1s2_vip_lounge(),
        "z1s1_engine_broken.wav": build_z1s1_engine_broken(),
        "z1s1_engine_triumph.wav": build_z1s1_engine_triumph(),
    }

    for fname, (bl, br) in tracks.items():
        paths = [os.path.join(d, fname) for d in target_dirs]
        save_seamless_stereo_wav(paths, bl, br, crossfade_s=2.5, target_peak=0.68)


if __name__ == "__main__":
    main()
