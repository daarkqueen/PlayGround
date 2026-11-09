// Vesper's Lament — procedural gothic audio (WebAudio, no assets)
export class Sound {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.muted = false;
    this.room = 'A';
    this.timer = null;
    this.padTimer = null;
    this.step = 0;
    this.playing = false;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.55;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.16;
    this.musicGain.connect(this.master);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.42;
    this.sfxGain.connect(this.master);
    this.noise = this.makeNoise();
  }

  makeNoise() {
    const len = this.ctx.sampleRate * 1.2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.2;
    }
    return buf;
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.55, this.ctx.currentTime, 0.05);
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  tone({ freq = 440, dur = 0.18, type = 'sine', vol = 0.2, slide = 0, attack = 0.005, dest = null, detune = 0 }) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
    o.detune.value = detune;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(dest || this.sfxGain);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  noiseBurst({ dur = 0.2, vol = 0.2, freq = 800, q = 1, type = 'bandpass', slide = 1, dest = null }) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (slide !== 1) f.frequency.exponentialRampToValueAtTime(Math.max(40, freq * slide), t + dur);
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(dest || this.sfxGain);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  play(name) {
    if (!this.ctx || this.muted) return;
    switch (name) {
      case 'jump':
        this.tone({ freq: 240, dur: 0.16, type: 'square', vol: 0.09, slide: 2.1 });
        this.tone({ freq: 480, dur: 0.1, type: 'triangle', vol: 0.05, slide: 1.7 });
        break;
      case 'doublejump':
        this.tone({ freq: 420, dur: 0.18, type: 'triangle', vol: 0.1, slide: 2.4 });
        this.noiseBurst({ dur: 0.14, vol: 0.08, freq: 2400, q: 2 });
        break;
      case 'dash':
        this.noiseBurst({ dur: 0.28, vol: 0.16, freq: 1800, q: 1.2, slide: 0.22 });
        this.tone({ freq: 150, dur: 0.22, type: 'sawtooth', vol: 0.05, slide: 0.6 });
        break;
      case 'slash':
        this.noiseBurst({ dur: 0.16, vol: 0.16, freq: 3200, q: 0.9, slide: 0.18 });
        this.tone({ freq: 880, dur: 0.1, type: 'triangle', vol: 0.05, slide: 0.5 });
        break;
      case 'hit':
        this.noiseBurst({ dur: 0.16, vol: 0.22, freq: 500, q: 1.4, slide: 0.35 });
        this.tone({ freq: 130, dur: 0.14, type: 'square', vol: 0.08, slide: 0.55 });
        break;
      case 'playerhit':
        this.tone({ freq: 180, dur: 0.3, type: 'sawtooth', vol: 0.15, slide: 0.35 });
        this.noiseBurst({ dur: 0.3, vol: 0.2, freq: 700, q: 0.8, slide: 0.3 });
        break;
      case 'kill':
        this.noiseBurst({ dur: 0.32, vol: 0.15, freq: 900, q: 0.7, slide: 0.2 });
        this.tone({ freq: 320, dur: 0.28, type: 'triangle', vol: 0.07, slide: 0.5 });
        break;
      case 'ember':
        this.tone({ freq: 1180, dur: 0.12, type: 'sine', vol: 0.08, slide: 1.5 });
        this.tone({ freq: 1760, dur: 0.18, type: 'sine', vol: 0.045, slide: 1.25 });
        break;
      case 'heal':
        [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone({ freq: f, dur: 0.5, type: 'sine', vol: 0.06 }), i * 90));
        break;
      case 'relic':
        [392, 523, 659, 784, 1046].forEach((f, i) => setTimeout(() => {
          this.tone({ freq: f, dur: 0.9, type: 'triangle', vol: 0.07 });
          this.tone({ freq: f * 2, dur: 0.7, type: 'sine', vol: 0.025 });
        }, i * 120));
        break;
      case 'gate':
        this.tone({ freq: 90, dur: 0.5, type: 'sawtooth', vol: 0.08, slide: 0.6 });
        this.noiseBurst({ dur: 0.4, vol: 0.1, freq: 400, q: 0.7 });
        break;
      case 'death':
        [330, 294, 247, 196, 147].forEach((f, i) => setTimeout(() => this.tone({ freq: f, dur: 0.9, type: 'triangle', vol: 0.08 }), i * 180));
        break;
      case 'bossintro':
        this.tone({ freq: 55, dur: 2.2, type: 'sawtooth', vol: 0.12, attack: 0.4 });
        this.tone({ freq: 82.4, dur: 2.4, type: 'triangle', vol: 0.07, attack: 0.6 });
        this.noiseBurst({ dur: 1.4, vol: 0.08, freq: 240, q: 0.6, slide: 0.5 });
        break;
      case 'bosshit':
        this.noiseBurst({ dur: 0.2, vol: 0.18, freq: 600, q: 1.2, slide: 0.4 });
        this.tone({ freq: 110, dur: 0.2, type: 'square', vol: 0.07, slide: 0.7 });
        break;
      case 'victory':
        [392, 523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => {
          this.tone({ freq: f, dur: 1.6, type: 'triangle', vol: 0.08 });
          this.tone({ freq: f / 2, dur: 1.4, type: 'sine', vol: 0.05 });
        }, i * 200));
        break;
      case 'ui':
        this.tone({ freq: 660, dur: 0.07, type: 'triangle', vol: 0.05 });
        break;
      case 'deny':
        this.tone({ freq: 120, dur: 0.16, type: 'square', vol: 0.06, slide: 0.8 });
        break;
    }
  }

  // ---- music ----
  startMusic(room) {
    if (!this.ctx) return;
    this.room = room;
    if (this.playing) return;
    this.playing = true;
    this.step = 0;
    this.tick = this.tick.bind(this);
    this.timer = setInterval(this.tick, 560);
    this.padTimer = setInterval(() => this.pad(), 7200);
    this.pad();
  }

  stopMusic() {
    this.playing = false;
    clearInterval(this.timer);
    clearInterval(this.padTimer);
    this.timer = null;
    this.padTimer = null;
  }

  setMood(room) {
    this.room = room;
  }

  get scale() {
    // A harmonic minor-ish, transposed by room mood
    if (this.room === 'G') return [110, 130.81, 164.81, 174.61, 220, 261.63, 329.63, 349.23];
    if (this.room === 'D') return [98, 116.54, 146.83, 155.56, 196, 233.08, 293.66, 311.13];
    if (this.room === 'E' || this.room === 'F') return [123.47, 146.83, 185, 196, 246.94, 293.66, 369.99, 392];
    return [110, 130.81, 164.81, 174.61, 220, 261.63, 329.63, 349.23];
  }

  tick() {
    if (!this.ctx || this.muted) return;
    const sc = this.scale;
    const s = this.step++;
    const pattern = [0, 2, 4, 2, 5, 4, 2, 1];
    if (s % 2 === 0) {
      const n = sc[pattern[(s / 2) % pattern.length] % sc.length];
      this.pluck(n, 1.9);
    }
    if (s % 4 === 3) {
      this.pluck(sc[3] * 2, 0.7, 0.35);
    }
  }

  pluck(freq, dur, vol = 0.5) {
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter();
    o.type = 'triangle';
    o.frequency.value = freq;
    f.type = 'lowpass';
    f.frequency.setValueAtTime(2600, t);
    f.frequency.exponentialRampToValueAtTime(500, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05 * vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(this.musicGain);
    o.start(t); o.stop(t + dur + 0.05);
  }

  pad() {
    if (!this.ctx || this.muted) return;
    const sc = this.scale;
    const root = sc[0] / 2;
    [1, 1.5, 2, 2.996].forEach((m, i) => {
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const f = this.ctx.createBiquadFilter();
      o.type = i === 3 ? 'sawtooth' : 'sine';
      o.frequency.value = root * m * (i === 3 ? 1.005 : 1);
      f.type = 'lowpass';
      f.frequency.value = 700;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.012 / (i + 1), t + 1.6);
      g.gain.linearRampToValueAtTime(0.0001, t + 7.4);
      o.connect(f); f.connect(g); g.connect(this.musicGain);
      o.start(t); o.stop(t + 7.6);
    });
  }
}
