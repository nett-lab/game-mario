// ==============================================================================
// WEB AUDIO API SYNTHESIZER: "Super Spreadsheet & Scratch Bros"
// Sintesis suara 8-bit retro tanpa dependensi file eksternal
// ==============================================================================

class RetroAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('mario_audio_muted') === 'true';
    this.masterGain = null;
  }

  // Inisialisasi AudioContext saat pertama kali ada interaksi pengguna
  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.init();
    this.muted = !this.muted;
    localStorage.setItem('mario_audio_muted', this.muted);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.muted;
  }

  // Efek Suara: Lompatan Mario (Square wave sweep)
  playJump() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(620, this.ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  // Efek Suara: Denting Koin Emas (Dual sine bell tone)
  playCoin() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {}
  }

  // Efek Suara: Membentur Blok Kosong / Kepala Tertabrak
  playBump() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.09);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.09);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }

  // Efek Suara: Jawaban Benar / Powerup Fanfare
  playSuccess() {
    if (this.muted || !this.ctx) return;
    try {
      const notes = [330, 392, 659, 523, 587, 784, 1046];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + idx * 0.07;
        const dur = 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + dur);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + dur);
      });
    } catch {}
  }

  // Efek Suara: Jawaban Salah / Buzzer Eror (-1 ❤️)
  playError() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(75, now + 0.32);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.32);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.33);
    } catch {}
  }

  // Efek Suara: Panggung Berhasil Dituntaskan (World Clear Jingle)
  playWorldClear() {
    if (this.muted || !this.ctx) return;
    try {
      const melody = [
        { f: 523, d: 0.12 }, // C5
        { f: 659, d: 0.12 }, // E5
        { f: 784, d: 0.12 }, // G5
        { f: 1046, d: 0.25 }, // C6
        { f: 880, d: 0.15 }, // A5
        { f: 1046, d: 0.4 }  // C6
      ];

      let elapsed = 0;
      melody.forEach(item => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + elapsed;

        osc.type = 'square';
        osc.frequency.setValueAtTime(item.f, start);

        gain.gain.setValueAtTime(0.16, start);
        gain.gain.linearRampToValueAtTime(0.01, start + item.d);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(start);
        osc.stop(start + item.d);

        elapsed += item.d + 0.02;
      });
    } catch {}
  }

  // Efek Suara: Game Over
  playGameOver() {
    if (this.muted || !this.ctx) return;
    try {
      const melody = [
        { f: 493.88, d: 0.18 }, // B4
        { f: 466.16, d: 0.18 }, // Bb4
        { f: 440.00, d: 0.18 }, // A4
        { f: 349.23, d: 0.45 }  // F4
      ];

      let elapsed = 0;
      melody.forEach(item => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + elapsed;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(item.f, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.linearRampToValueAtTime(0.01, start + item.d);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(start);
        osc.stop(start + item.d);

        elapsed += item.d + 0.03;
      });
    } catch {}
  }
}

export const sound = new RetroAudioSynthesizer();
