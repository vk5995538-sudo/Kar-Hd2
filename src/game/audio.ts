// Web Audio API procedural sound effects & background radio engine
// Zero external asset dependencies - instantly reliable on all mobile & desktop browsers!

class AudioManager {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  // Engine sound state
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;

  // Tire screech state
  private screechSource: AudioBufferSourceNode | null = null;
  private screechGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  // Nitro sound state
  private nitroGain: GainNode | null = null;
  private nitroSource: AudioBufferSourceNode | null = null;

  // Radio / Music state
  private radioTimer: number | null = null;
  private currentRadioStation = 0; // 0: Synthwave, 1: Cyber Pulse, 2: Chill Cruise, 3: Off
  private radioStep = 0;
  private isRadioPlaying = false;

  public sfxVolume = 0.8;
  public musicVolume = 0.5;
  public isMuted = false;

  constructor() {
    // Initialized on first user touch / keypress
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);

      this.setupNoiseBuffer();
      this.startEngineAudio();
      this.startRadio();
    } catch (e) {
      console.warn('AudioContext failed to initialize:', e);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private setupNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  private startEngineAudio() {
    if (!this.ctx || !this.sfxGain) return;
    try {
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.value = 350;

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0.15;

      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc1.type = 'sawtooth';
      this.engineOsc1.frequency.value = 45;

      this.engineOsc2 = this.ctx.createOscillator();
      this.engineOsc2.type = 'triangle';
      this.engineOsc2.frequency.value = 90;

      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.sfxGain);

      this.engineOsc1.start();
      this.engineOsc2.start();

      // Tire screech node setup
      if (this.noiseBuffer) {
        this.screechGain = this.ctx.createGain();
        this.screechGain.gain.value = 0;

        const screechFilter = this.ctx.createBiquadFilter();
        screechFilter.type = 'bandpass';
        screechFilter.frequency.value = 1600;
        screechFilter.Q.value = 4;

        this.screechSource = this.ctx.createBufferSource();
        this.screechSource.buffer = this.noiseBuffer;
        this.screechSource.loop = true;
        this.screechSource.connect(screechFilter);
        screechFilter.connect(this.screechGain);
        this.screechGain.connect(this.sfxGain);
        this.screechSource.start();
      }

      // Nitro sound setup
      if (this.noiseBuffer) {
        this.nitroGain = this.ctx.createGain();
        this.nitroGain.gain.value = 0;

        const nitroFilter = this.ctx.createBiquadFilter();
        nitroFilter.type = 'highpass';
        nitroFilter.frequency.value = 600;

        this.nitroSource = this.ctx.createBufferSource();
        this.nitroSource.buffer = this.noiseBuffer;
        this.nitroSource.loop = true;
        this.nitroSource.connect(nitroFilter);
        nitroFilter.connect(this.nitroGain);
        this.nitroGain.connect(this.sfxGain);
        this.nitroSource.start();
      }
    } catch (e) {
      console.warn('Engine audio setup warning:', e);
    }
  }

  // Update dynamic engine audio from vehicle loop
  public updateEngineSound(speedRatio: number, rpm: number, isDrifting: boolean, isNitro: boolean) {
    if (!this.ctx || !this.engineOsc1 || !this.engineOsc2 || !this.engineFilter || !this.engineGain) return;

    try {
      const now = this.ctx.currentTime;
      // Frequency rises with RPM and speed
      const baseFreq = 40 + rpm * 140 + speedRatio * 80;
      this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.05);
      this.engineOsc2.frequency.setTargetAtTime(baseFreq * 1.5, now, 0.05);

      const filterCutoff = 250 + rpm * 1200 + (isNitro ? 800 : 0);
      this.engineFilter.frequency.setTargetAtTime(filterCutoff, now, 0.05);

      const targetGain = 0.12 + rpm * 0.15 + (isNitro ? 0.08 : 0);
      this.engineGain.gain.setTargetAtTime(targetGain, now, 0.05);

      // Tire screech
      if (this.screechGain) {
        const screechLevel = isDrifting ? Math.min(0.35, 0.15 + speedRatio * 0.25) : 0;
        this.screechGain.gain.setTargetAtTime(screechLevel, now, 0.04);
      }

      // Nitro rush
      if (this.nitroGain) {
        const nitroLevel = isNitro ? 0.35 : 0;
        this.nitroGain.gain.setTargetAtTime(nitroLevel, now, 0.06);
      }
    } catch {
      // Audio node safely ignored if context busy
    }
  }

  // Play crisp collision sound with impact rumble
  public playCrash(impactStrength: number) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const strength = Math.min(1.0, Math.max(0.2, impactStrength));

      // Metal thud
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 * strength, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.18);

      gain.gain.setValueAtTime(0.4 * strength, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.22);

      // Noise crunch
      if (this.noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const nGain = this.ctx.createGain();
        const nFilter = this.ctx.createBiquadFilter();
        nFilter.type = 'lowpass';
        nFilter.frequency.setValueAtTime(1800, now);
        nFilter.frequency.exponentialRampToValueAtTime(400, now + 0.15);

        nGain.gain.setValueAtTime(0.5 * strength, now);
        nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

        noise.connect(nFilter);
        nFilter.connect(nGain);
        nGain.connect(this.sfxGain);
        noise.start(now);
        noise.stop(now + 0.18);
      }
    } catch {}
  }

  // Play coin pickup chime (sweet ascending arpeggio)
  public playCoin() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const notes = [880, 1174.66, 1760]; // A5, D6, A6
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.18, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.16);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.18);
      });
    } catch {}
  }

  // Dual tone horn
  public playHorn(active: boolean) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();
    // Horn uses temporary oscillators while button is held
    if (active && !(this as unknown as { activeHorn?: boolean }).activeHorn) {
      (this as unknown as { activeHorn?: boolean }).activeHorn = true;
      try {
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.value = 415; // G#4
        osc2.type = 'sawtooth';
        osc2.frequency.value = 494; // B4

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1400;

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.4);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.4);
        osc2.stop(now + 0.4);

        setTimeout(() => {
          (this as unknown as { activeHorn?: boolean }).activeHorn = false;
        }, 400);
      } catch {
        (this as unknown as { activeHorn?: boolean }).activeHorn = false;
      }
    }
  }

  // Speed trap flash or Stunt fanfare
  public playStuntCelebration() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.5]; // C major
      chord.forEach((f, i) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.04);
        gain.gain.setValueAtTime(0.15, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.38);
      });
    } catch {}
  }

  // Speed camera shutter click + flash tone
  public playSpeedCamera() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  // Procedural dynamic radio station loop
  public setRadioStation(stationIndex: number) {
    this.currentRadioStation = stationIndex;
  }

  public getRadioStation() {
    return this.currentRadioStation;
  }

  public getRadioStationsList() {
    return [
      { name: 'Sunset Synthwave', genre: 'Retro Arcade 120 BPM' },
      { name: 'Neon Cyber Pulse', genre: 'Driving Bass 128 BPM' },
      { name: 'Lo-Fi Night Drive', genre: 'Chilled Ambient 90 BPM' },
      { name: 'Radio Off', genre: 'Engine Only' },
    ];
  }

  private startRadio() {
    if (this.isRadioPlaying) return;
    this.isRadioPlaying = true;

    // Synthwave note tables:
    // Scale: A minor pentatonic / dorian [A, C, D, E, G]
    const synthNotes = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33];
    const bassNotesA = [55, 55, 65.41, 73.42, 55, 55, 82.41, 73.42]; // A1 -> C2 -> D2 -> E2
    const bassNotesCyber = [65.41, 65.41, 65.41, 87.31, 58.27, 58.27, 77.78, 65.41];
    const lofiChords = [
      [220, 261.63, 329.63, 392], // Am7
      [174.61, 220, 261.63, 329.63], // Fmaj7
      [196, 246.94, 293.66, 392], // G
      [146.83, 220, 261.63, 329.63], // Dm7
    ];

    const tickInterval = 135; // ~111 BPM 16th notes

    const tick = () => {
      if (!this.ctx || !this.musicGain || this.isMuted || this.currentRadioStation === 3) {
        this.radioTimer = window.setTimeout(tick, tickInterval);
        return;
      }

      try {
        const now = this.ctx.currentTime;
        const step = this.radioStep % 16;
        const bar = Math.floor(this.radioStep / 16) % 4;

        if (this.currentRadioStation === 0) {
          // Synthwave: Driving Bass + Arpeggiated melody + soft kick snare
          if (step % 2 === 0) {
            // 8th note bass
            const bIndex = (step / 2) % bassNotesA.length;
            const bFreq = bassNotesA[bIndex];
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(bFreq, now);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(320, now);

            gain.gain.setValueAtTime(0.12 * this.musicVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);
            osc.start(now);
            osc.stop(now + 0.2);
          }

          // Arp synth lead
          if (step % 4 === 0 || step === 6 || step === 14) {
            const noteIdx = (step * 3 + bar * 2) % synthNotes.length;
            const leadFreq = synthNotes[noteIdx];
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(leadFreq, now);

            gain.gain.setValueAtTime(0.08 * this.musicVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start(now);
            osc.stop(now + 0.24);
          }

          // Hi-hat groove
          if (step % 2 === 1 && this.noiseBuffer) {
            const hat = this.ctx.createBufferSource();
            hat.buffer = this.noiseBuffer;
            const hFilter = this.ctx.createBiquadFilter();
            hFilter.type = 'highpass';
            hFilter.frequency.value = 7500;
            const hGain = this.ctx.createGain();
            hGain.gain.setValueAtTime(0.04 * this.musicVolume, now);
            hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

            hat.connect(hFilter);
            hFilter.connect(hGain);
            hGain.connect(this.musicGain);
            hat.start(now);
            hat.stop(now + 0.06);
          }
        } else if (this.currentRadioStation === 1) {
          // Cyber Pulse
          if (step % 4 === 0) {
            // Kick punch
            const kick = this.ctx.createOscillator();
            const kGain = this.ctx.createGain();
            kick.type = 'sine';
            kick.frequency.setValueAtTime(130, now);
            kick.frequency.exponentialRampToValueAtTime(35, now + 0.12);
            kGain.gain.setValueAtTime(0.2 * this.musicVolume, now);
            kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

            kick.connect(kGain);
            kGain.connect(this.musicGain);
            kick.start(now);
            kick.stop(now + 0.15);
          }

          if (step % 2 === 0) {
            const bFreq = bassNotesCyber[(step / 2) % bassNotesCyber.length];
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(bFreq, now);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(280, now);

            gain.gain.setValueAtTime(0.09 * this.musicVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);
            osc.start(now);
            osc.stop(now + 0.18);
          }
        } else if (this.currentRadioStation === 2) {
          // Lo-Fi Night Drive: gentle chord pads on step 0 and 8
          if (step === 0 || step === 8) {
            const chord = lofiChords[bar % lofiChords.length];
            chord.forEach((freq) => {
              if (!this.ctx || !this.musicGain) return;
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, now);

              gain.gain.setValueAtTime(0.04 * this.musicVolume, now);
              gain.gain.linearRampToValueAtTime(0.001, now + 0.9);

              osc.connect(gain);
              gain.connect(this.musicGain);
              osc.start(now);
              osc.stop(now + 0.95);
            });
          }
        }

        this.radioStep++;
      } catch {}

      this.radioTimer = window.setTimeout(tick, tickInterval);
    };

    this.radioTimer = window.setTimeout(tick, tickInterval);
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.sfxVolume;
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain) {
      this.musicGain.gain.value = this.musicVolume;
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}

export const audio = new AudioManager();
