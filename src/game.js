// ==============================================================================
// GAME ENGINE & RENDERER: "Super Spreadsheet & Scratch Bros"
// 60 FPS Canvas Platformer, 3-Layer Parallax Scrolling, Mario Vector Pixel Sprite
// ==============================================================================

import { PHYSICS_CONFIG, PhysicsEngine } from './physics.js';
import { ParticleSystem } from './particles.js';
import { sound } from './audio.js';
import { WORLDS_CONFIG, getRandomQuestion } from './questions.js';
import { createTeamSession, updateTeamSession, logQuizAnswer } from './supabaseClient.js';
import confetti from 'canvas-confetti';

export class MarioEduGame {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');

    // Kanvas Virtual Internal
    this.canvas.width = PHYSICS_CONFIG.virtualWidth;
    this.canvas.height = PHYSICS_CONFIG.virtualHeight;

    // Sub-sistem
    this.particles = new ParticleSystem();
    this.physics = new PhysicsEngine(this.particles, sound);

    // Game State
    this.state = {
      isPlaying: false,
      isPaused: false,
      isQuizActive: false,
      currentWorldIdx: 0,
      score: 0,
      lives: 3,
      timeElapsed: 0,
      totalTimeLimit: 360, // 6 menit
      activeTeam: {
        id: null,
        name: 'Tim Informatika 8',
        className: '8-A',
        pilot: 'Pilot',
        navigator: 'Navigator',
        debugger: 'Debugger'
      }
    };

    // Parallax background offsets
    this.bgClouds = [
      { x: 50, y: 50, size: 28, speed: 0.2 },
      { x: 260, y: 80, size: 22, speed: 0.15 },
      { x: 490, y: 40, size: 34, speed: 0.25 },
      { x: 720, y: 70, size: 25, speed: 0.18 },
      { x: 950, y: 55, size: 30, speed: 0.22 },
      { x: 1200, y: 65, size: 24, speed: 0.19 }
    ];

    // Loop Timing
    this.lastTime = performance.now();
    this.timerInterval = null;

    // UI Hook Callbacks
    this.onHUDUpdate = null;
    this.onOpenQuizModal = null;
    this.onGameOver = null;
    this.onVictory = null;
    this.onAlert = null;

    // Pasang callback dari Physics Engine
    this.setupPhysicsCallbacks();
  }

  setupPhysicsCallbacks() {
    this.physics.onHitQuestionBlock = (block) => {
      this.handleQuestionBlockHit(block);
    };

    this.physics.onCollectCoin = (coin) => {
      this.state.score += 50;
      this.triggerHUDUpdate();
    };

    this.physics.onReachFlag = (flag) => {
      this.handleWorldClear();
    };

    this.physics.onFallInPit = () => {
      this.handlePlayerDamage("Terjatuh ke jurang / lahar! -1 ❤️");
    };
  }

  // Generate Stage Level Geometry
  generateLevelData(worldIdx) {
    const levelWidth = 1500;
    const platforms = [];
    const questionBlocks = [];
    const coins = [];
    let flagPole = { x: 1360, y: 170, w: 12, h: 220, reached: false };
    const startX = 60;
    const startY = 320;

    if (worldIdx === 0) {
      // WORLD 1: Grassland Plains (Excel Dasar & Statistik)
      // Tanah Dasar
      platforms.push({ x: 0, y: 390, w: 1500, h: 60, type: 'ground' });

      // Susunan Balok Bata & Pijakan
      platforms.push({ x: 200, y: 310, w: 120, h: 24, type: 'brick' });
      platforms.push({ x: 420, y: 260, w: 140, h: 24, type: 'brick' });
      platforms.push({ x: 660, y: 220, w: 100, h: 24, type: 'brick' });
      platforms.push({ x: 860, y: 300, w: 120, h: 24, type: 'brick' });
      platforms.push({ x: 1080, y: 240, w: 140, h: 24, type: 'brick' });

      // Blok Tanda Tanya [ ? ] Soal
      questionBlocks.push({ x: 250, y: 220, w: 30, h: 30, hit: false, bounce: 0, worldNum: 1 });
      questionBlocks.push({ x: 480, y: 170, w: 30, h: 30, hit: false, bounce: 0, worldNum: 1 });
      questionBlocks.push({ x: 910, y: 210, w: 30, h: 30, hit: false, bounce: 0, worldNum: 1 });
      questionBlocks.push({ x: 1130, y: 150, w: 30, h: 30, hit: false, bounce: 0, worldNum: 1 });

      // Koin Emas
      [310, 340, 520, 550, 700, 960, 990, 1170].forEach(cx => {
        coins.push({ x: cx, y: 240, w: 16, h: 20, collected: false });
      });
    } 
    else if (worldIdx === 1) {
      // WORLD 2: Underground Pipes (Format Rp, Sort & Filter)
      platforms.push({ x: 0, y: 390, w: 1500, h: 60, type: 'ground' });

      // Pipa Hijau Berbagai Ukuran
      platforms.push({ x: 180, y: 320, w: 70, h: 70, type: 'pipe' });
      platforms.push({ x: 380, y: 270, w: 75, h: 120, type: 'pipe' });
      platforms.push({ x: 620, y: 240, w: 80, h: 150, type: 'pipe' });
      platforms.push({ x: 920, y: 280, w: 75, h: 110, type: 'pipe' });
      platforms.push({ x: 1150, y: 310, w: 70, h: 80, type: 'pipe' });

      // Platform Gantung
      platforms.push({ x: 470, y: 200, w: 120, h: 24, type: 'brick' });
      platforms.push({ x: 740, y: 190, w: 140, h: 24, type: 'brick' });

      // Blok Tanda Tanya [ ? ]
      questionBlocks.push({ x: 200, y: 230, w: 30, h: 30, hit: false, bounce: 0, worldNum: 2 });
      questionBlocks.push({ x: 520, y: 120, w: 30, h: 30, hit: false, bounce: 0, worldNum: 2 });
      questionBlocks.push({ x: 790, y: 110, w: 30, h: 30, hit: false, bounce: 0, worldNum: 2 });
      questionBlocks.push({ x: 1040, y: 210, w: 30, h: 30, hit: false, bounce: 0, worldNum: 2 });

      // Koin
      [270, 300, 500, 560, 830, 860, 1070].forEach(cx => {
        coins.push({ x: cx, y: 230, w: 16, h: 20, collected: false });
      });
    }
    else if (worldIdx === 2) {
      // WORLD 3: Lava Bridge (VLOOKUP & Kunci Dollar $)
      // Tanah Terputus di Atas Danau Lahar Panas
      platforms.push({ x: 0, y: 390, w: 260, h: 60, type: 'ground' });
      platforms.push({ x: 340, y: 390, w: 280, h: 60, type: 'ground' });
      platforms.push({ x: 690, y: 390, w: 260, h: 60, type: 'ground' });
      platforms.push({ x: 1020, y: 390, w: 480, h: 60, type: 'ground' });

      // Jembatan Melayang di Atas Jurang
      platforms.push({ x: 265, y: 300, w: 65, h: 20, type: 'brick' });
      platforms.push({ x: 625, y: 290, w: 60, h: 20, type: 'brick' });
      platforms.push({ x: 955, y: 280, w: 60, h: 20, type: 'brick' });

      platforms.push({ x: 440, y: 250, w: 100, h: 24, type: 'brick' });
      platforms.push({ x: 770, y: 240, w: 100, h: 24, type: 'brick' });

      // Blok Tanda Tanya [ ? ]
      questionBlocks.push({ x: 470, y: 160, w: 30, h: 30, hit: false, bounce: 0, worldNum: 3 });
      questionBlocks.push({ x: 800, y: 150, w: 30, h: 30, hit: false, bounce: 0, worldNum: 3 });
      questionBlocks.push({ x: 1100, y: 220, w: 30, h: 30, hit: false, bounce: 0, worldNum: 3 });

      // Koin
      [280, 470, 640, 800, 970, 1140, 1200].forEach(cx => {
        coins.push({ x: cx, y: 220, w: 16, h: 20, collected: false });
      });
    }
    else {
      // WORLD 4: Bowser's Castle (Logika IF & Scratch)
      platforms.push({ x: 0, y: 390, w: 1500, h: 60, type: 'ground' });

      // Tangga Benteng
      platforms.push({ x: 180, y: 320, w: 100, h: 24, type: 'brick' });
      platforms.push({ x: 340, y: 260, w: 120, h: 24, type: 'brick' });
      platforms.push({ x: 520, y: 210, w: 140, h: 24, type: 'brick' });
      platforms.push({ x: 720, y: 260, w: 120, h: 24, type: 'brick' });
      platforms.push({ x: 900, y: 200, w: 140, h: 24, type: 'brick' });
      platforms.push({ x: 1100, y: 250, w: 120, h: 24, type: 'brick' });

      // Blok Tanda Tanya [ ? ]
      questionBlocks.push({ x: 380, y: 170, w: 30, h: 30, hit: false, bounce: 0, worldNum: 4 });
      questionBlocks.push({ x: 570, y: 120, w: 30, h: 30, hit: false, bounce: 0, worldNum: 4 });
      questionBlocks.push({ x: 950, y: 110, w: 30, h: 30, hit: false, bounce: 0, worldNum: 4 });
      questionBlocks.push({ x: 1140, y: 160, w: 30, h: 30, hit: false, bounce: 0, worldNum: 4 });

      // Koin
      [220, 400, 580, 760, 960, 1150].forEach(cx => {
        coins.push({ x: cx, y: 180, w: 16, h: 20, collected: false });
      });
    }

    return {
      levelWidth,
      platforms,
      questionBlocks,
      coins,
      flagPole,
      startX,
      startY
    };
  }

  // Mulai Permainan dengan Tim Aktif
  async startGame(teamData) {
    sound.init();

    this.state.activeTeam = {
      id: null,
      name: teamData.name || 'Tim Siswa',
      className: teamData.className || '8-A',
      pilot: teamData.pilot || 'Pilot',
      navigator: teamData.navigator || 'Navigator',
      debugger: teamData.debugger || 'Debugger'
    };

    this.state.score = 0;
    this.state.lives = 3;
    this.state.timeElapsed = 0;
    this.state.currentWorldIdx = 0;
    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.state.isQuizActive = false;

    // 1. Simpan sesi tim ke Supabase / Cloud Database
    try {
      const res = await createTeamSession({
        team_name: this.state.activeTeam.name,
        class_name: this.state.activeTeam.className,
        pilot_name: this.state.activeTeam.pilot,
        navigator_name: this.state.activeTeam.navigator,
        debugger_name: this.state.activeTeam.debugger
      });
      if (res && res.team) {
        this.state.activeTeam.id = res.team.id;
        console.log('[Game] Sesi tim terdaftar:', res.team.id, res.isFallback ? '(Lokal)' : '(Cloud)');
      }
    } catch (err) {
      console.warn('[Game] Gagal registrasi tim ke Supabase:', err);
    }

    // 2. Muat Dunia 1
    this.loadWorld(0);
    this.startTimer();
    this.triggerHUDUpdate();

    // 3. Mulai Render Loop
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  loadWorld(worldIdx) {
    this.state.currentWorldIdx = worldIdx;
    const levelData = this.generateLevelData(worldIdx);
    this.physics.loadLevel(levelData);
    this.particles.clear();
    this.triggerHUDUpdate();
    if (this.onAlert) {
      const curWorld = WORLDS_CONFIG[worldIdx];
      this.onAlert(`🚀 MEMASUKI ${curWorld.code}: ${curWorld.name}`);
    }
  }

  // Timer Permainan
  startTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.state.isPlaying && !this.state.isPaused && !this.state.isQuizActive) {
        this.state.timeElapsed++;
        this.triggerHUDUpdate();

        // Cek Timeout
        if (this.state.timeElapsed >= this.state.totalTimeLimit) {
          this.handleGameOver(false, "Waktu permainan telah habis!");
        }

        // Sinkronisasi status periodik setiap 15 detik ke Supabase
        if (this.state.timeElapsed % 15 === 0 && this.state.activeTeam.id) {
          updateTeamSession(this.state.activeTeam.id, {
            final_score: this.state.score,
            lives_remaining: this.state.lives,
            time_elapsed_seconds: this.state.timeElapsed,
            current_world: this.state.currentWorldIdx + 1
          });
        }
      }
    }, 1000);
  }

  // Handler saat menyundul Blok [?]
  handleQuestionBlockHit(block) {
    this.state.isQuizActive = true;
    const question = getRandomQuestion(block.worldNum || this.state.currentWorldIdx + 1);

    if (this.onOpenQuizModal) {
      this.onOpenQuizModal(question, (userAnswerIdx, isCorrect) => {
        this.handleQuizAnswerSubmit(question, userAnswerIdx, isCorrect);
      });
    }
  }

  // Handler setelah siswa memilih jawaban kuis
  async handleQuizAnswerSubmit(question, selectedIdx, isCorrect) {
    const selectedAnswerText = question.options[selectedIdx] || "Tidak ada jawaban";

    // 1. Kirim Log Jawaban Asinkron ke Supabase quiz_logs
    if (this.state.activeTeam.id) {
      logQuizAnswer({
        team_id: this.state.activeTeam.id,
        world_number: this.state.currentWorldIdx + 1,
        question_text: question.q,
        selected_answer: selectedAnswerText,
        is_correct: isCorrect
      });
    }

    // 2. Evaluasi Hasil Jawaban
    if (isCorrect) {
      sound.playSuccess();
      this.state.score += 100;
      this.particles.spawnSuccessSparkles(this.physics.player.x + 12, this.physics.player.y + 16, 16);
      this.triggerHUDUpdate();
      if (this.onAlert) this.onAlert("⭐ JAWABAN BENAR! +100 KOIN SKOR");
    } else {
      sound.playError();
      this.particles.triggerScreenShake(9, 400);
      this.state.lives--;
      this.triggerHUDUpdate();
      if (this.onAlert) this.onAlert("✕ JAWABAN SALAH! -1 NYAWA ❤️");

      if (this.state.lives <= 0) {
        setTimeout(() => {
          this.handleGameOver(false, "Seluruh nyawa tim telah habis!");
        }, 1200);
        return;
      }
    }

    // Lanjutkan permainan
    setTimeout(() => {
      this.state.isQuizActive = false;
    }, 600);
  }

  // Handler Kerusakan Pemain (Jatuh ke Jurang)
  handlePlayerDamage(reason) {
    sound.playError();
    this.particles.triggerScreenShake(10, 450);
    this.state.lives--;
    this.triggerHUDUpdate();

    if (this.state.lives <= 0) {
      this.handleGameOver(false, reason);
    } else {
      if (this.onAlert) this.onAlert(reason);
      // Respawn di posisi awal panggung
      this.physics.player.x = 60;
      this.physics.player.y = 300;
      this.physics.player.vx = 0;
      this.physics.player.vy = 0;
    }
  }

  // Handler Menyelesaikan Dunia / Panggung (Flag Pole)
  handleWorldClear() {
    sound.playWorldClear();
    this.state.score += 300;
    this.triggerHUDUpdate();

    if (this.state.currentWorldIdx < WORLDS_CONFIG.length - 1) {
      if (this.onAlert) {
        this.onAlert(`🏆 STAGE CLEAR! MENUJU ${WORLDS_CONFIG[this.state.currentWorldIdx + 1].code}`);
      }
      setTimeout(() => {
        this.loadWorld(this.state.currentWorldIdx + 1);
      }, 1600);
    } else {
      // Menuntaskan Seluruh Dunia (VICTORY)
      setTimeout(() => {
        this.handleGameOver(true, "SELAMAT! KERAJAAN TERSUSUN RAPI!");
      }, 1400);
    }
  }

  // Handler Game Over atau Kemenangan Penuh
  async handleGameOver(isVictory, message) {
    this.state.isPlaying = false;
    clearInterval(this.timerInterval);

    const finalStatus = isVictory ? 'victory' : 'game_over';

    if (isVictory) {
      sound.playSuccess();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}
    } else {
      sound.playGameOver();
    }

    // Simpan Data Akhir ke Supabase
    if (this.state.activeTeam.id) {
      await updateTeamSession(this.state.activeTeam.id, {
        final_score: this.state.score,
        lives_remaining: Math.max(0, this.state.lives),
        time_elapsed_seconds: this.state.timeElapsed,
        current_world: this.state.currentWorldIdx + 1,
        status: finalStatus
      });
    }

    const recapData = {
      isVictory,
      message,
      teamName: this.state.activeTeam.name,
      className: this.state.activeTeam.className,
      pilot: this.state.activeTeam.pilot,
      navigator: this.state.activeTeam.navigator,
      debugger: this.state.activeTeam.debugger,
      score: this.state.score,
      lives: Math.max(0, this.state.lives),
      timeElapsed: this.state.timeElapsed
    };

    if (isVictory && this.onVictory) {
      this.onVictory(recapData);
    } else if (this.onGameOver) {
      this.onGameOver(recapData);
    }
  }

  triggerHUDUpdate() {
    if (this.onHUDUpdate) {
      this.onHUDUpdate({
        teamName: this.state.activeTeam.name,
        className: this.state.activeTeam.className,
        score: this.state.score,
        lives: this.state.lives,
        timeElapsed: this.state.timeElapsed,
        worldConfig: WORLDS_CONFIG[this.state.currentWorldIdx]
      });
    }
  }

  // Main Render & Physics Loop
  loop(currentTime) {
    if (!this.state.isPlaying) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05); // Cap 50ms untuk menghindari spiral of death
    this.lastTime = currentTime;

    if (!this.state.isPaused && !this.state.isQuizActive) {
      this.physics.update(dt);
      this.particles.update(dt);
    }

    this.draw();

    requestAnimationFrame(this.loop.bind(this));
  }

  // Draw Scene Canvas
  draw() {
    const ctx = this.ctx;
    const curWorld = WORLDS_CONFIG[this.state.currentWorldIdx];
    const cameraX = this.physics.camera.x;
    const shakeX = this.particles.screenShake.offsetX;
    const shakeY = this.particles.screenShake.offsetY;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // 1. LAYER PARALLAX 1: Langit & Warna Latar
    ctx.fillStyle = curWorld.skyColor;
    ctx.fillRect(0, 0, PHYSICS_CONFIG.virtualWidth, PHYSICS_CONFIG.virtualHeight);

    // 2. LAYER PARALLAX 2: Awan Melayang (Gerak lambat + peredaman kamera)
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    this.bgClouds.forEach(cloud => {
      // Parallax ratio = 0.25
      const cloudRenderX = ((cloud.x - cameraX * 0.25) % (PHYSICS_CONFIG.virtualWidth + 200) + (PHYSICS_CONFIG.virtualWidth + 200)) % (PHYSICS_CONFIG.virtualWidth + 200) - 100;
      this.drawPuffyCloud(ctx, cloudRenderX, cloud.y, cloud.size);
    });

    // 3. LAYER PARALLAX 3: Pegunungan / Lanskap Jauh (Parallax ratio = 0.45)
    this.drawDistantScenery(ctx, cameraX, curWorld.id);

    // 4. LAYER ENTITAS UTAMA (Platform, Pipa, Balok, Koin, Tiang)
    this.drawWorldEntities(ctx, cameraX, curWorld.id);

    // 5. KARAKTER MARIO
    const p = this.physics.player;
    this.drawMario(ctx, p.x - cameraX, p.y, p.w, p.h, p.facing, p.frame);

    // 6. PARTIKEL & TEKS MELAYANG
    this.particles.draw(ctx, cameraX);

    ctx.restore();
  }

  // Gambar Awan Kartun Halus
  drawPuffyCloud(ctx, x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
    ctx.arc(x + size * 0.6, y - size * 0.2, size * 0.85, 0, Math.PI * 2);
    ctx.arc(x + size * 1.3, y, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Gambar Pegunungan Latar Parallax
  drawDistantScenery(ctx, cameraX, worldId) {
    if (worldId === 1) { // World 1: Bukit Hijau Lembut
      ctx.fillStyle = "#00a800";
      for (let i = 0; i < 4; i++) {
        const hillX = (i * 450 - cameraX * 0.35) % 1800;
        ctx.beginPath();
        ctx.arc(hillX + 200, 420, 140, Math.PI, 0);
        ctx.fill();
      }
    } else if (worldId === 2) { // World 2: Bebatuan Bawah Tanah Gelap
      ctx.fillStyle = "#1b1b22";
      for (let i = 0; i < 6; i++) {
        const stalX = (i * 280 - cameraX * 0.3) % 1800;
        ctx.beginPath();
        ctx.moveTo(stalX, 0);
        ctx.lineTo(stalX + 40, 110);
        ctx.lineTo(stalX + 80, 0);
        ctx.fill();
      }
    } else if (worldId === 3) { // World 3: Danau Lahar Membara
      ctx.fillStyle = "#ff2a00";
      ctx.fillRect(0, 400, PHYSICS_CONFIG.virtualWidth, 50);
      ctx.fillStyle = "#ffaa00";
      for (let i = 0; i < PHYSICS_CONFIG.virtualWidth; i += 30) {
        ctx.beginPath();
        ctx.arc(i + 15, 405, 7, 0, Math.PI);
        ctx.fill();
      }
    } else if (worldId === 4) { // World 4: Kastil Gelap Bowser
      ctx.fillStyle = "#2d123d";
      for (let i = 0; i < 5; i++) {
        const towerX = (i * 380 - cameraX * 0.3) % 1900;
        ctx.fillRect(towerX, 180, 100, 220);
        // Menara runcing
        ctx.beginPath();
        ctx.moveTo(towerX - 10, 180);
        ctx.lineTo(towerX + 50, 110);
        ctx.lineTo(towerX + 110, 180);
        ctx.fill();
      }
    }
  }

  // Gambar Platform, Pipa, Balok Soal, Koin, dan Tiang
  drawWorldEntities(ctx, cameraX, worldId) {
    // 1. Platform & Rintangan
    this.physics.platforms.forEach(p => {
      const rx = p.x - cameraX;
      // Culling: Abaikan jika di luar viewport kanvas
      if (rx + p.w < -50 || rx > PHYSICS_CONFIG.virtualWidth + 50) return;

      if (p.type === 'ground') {
        const groundColor = worldId === 3 ? "#4a1505" : (worldId === 4 ? "#1f1025" : "#c84c0c");
        const topGrassColor = worldId === 3 ? "#802b0e" : (worldId === 4 ? "#3d1c4a" : "#00a800");

        ctx.fillStyle = groundColor;
        ctx.fillRect(rx, p.y, p.w, p.h);

        // Rumput / Pinggiran Atas
        ctx.fillStyle = topGrassColor;
        ctx.fillRect(rx, p.y, p.w, 10);
      } else if (p.type === 'pipe') {
        // Pipa Hijau Khas
        ctx.fillStyle = "#00a800";
        ctx.fillRect(rx, p.y, p.w, p.h);
        ctx.fillStyle = "#005500";
        ctx.fillRect(rx + p.w - 14, p.y, 14, p.h);

        // Bibir Pipa
        ctx.fillStyle = "#00a800";
        ctx.fillRect(rx - 4, p.y - 14, p.w + 8, 16);
        ctx.strokeStyle = "#002a00";
        ctx.lineWidth = 2;
        ctx.strokeRect(rx - 4, p.y - 14, p.w + 8, 16);
      } else {
        // Balok Bata Cokelat
        ctx.fillStyle = worldId === 4 ? "#53226a" : "#b84418";
        ctx.fillRect(rx, p.y, p.w, p.h);
        ctx.strokeStyle = "#141419";
        ctx.lineWidth = 2;
        ctx.strokeRect(rx, p.y, p.w, p.h);

        // Garis Bata
        ctx.beginPath();
        ctx.moveTo(rx + p.w / 2, p.y);
        ctx.lineTo(rx + p.w / 2, p.y + p.h);
        ctx.stroke();
      }
    });

    // 2. Blok Tanda Tanya [ ? ]
    this.physics.questionBlocks.forEach(qb => {
      const rx = qb.x - cameraX;
      if (rx + qb.w < -50 || rx > PHYSICS_CONFIG.virtualWidth + 50) return;

      const ry = qb.y - qb.bounce;

      if (!qb.hit) {
        // Blok Emas Aktif
        ctx.fillStyle = "#fc9838";
        ctx.fillRect(rx, ry, qb.w, qb.h);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.strokeRect(rx, ry, qb.w, qb.h);

        // Sekrup Sudut
        ctx.fillStyle = "#000000";
        ctx.fillRect(rx + 3, ry + 3, 2, 2);
        ctx.fillRect(rx + qb.w - 5, ry + 3, 2, 2);
        ctx.fillRect(rx + 3, ry + qb.h - 5, 2, 2);
        ctx.fillRect(rx + qb.w - 5, ry + qb.h - 5, 2, 2);

        // Simbol "?" Putih
        ctx.fillStyle = "#ffffff";
        ctx.font = 'bold 15px "Press Start 2P", monospace';
        ctx.fillText("?", rx + 8, ry + 21);
      } else {
        // Blok Mati (Hitam/Cokelat Gelap)
        ctx.fillStyle = "#7b4f24";
        ctx.fillRect(rx, ry, qb.w, qb.h);
        ctx.strokeStyle = "#2e1b09";
        ctx.lineWidth = 2;
        ctx.strokeRect(rx, ry, qb.w, qb.h);
      }
    });

    // 3. Koin Emas Mengambang
    this.physics.coins.forEach(c => {
      if (c.collected) return;
      const rx = c.x - cameraX;
      if (rx + c.w < -50 || rx > PHYSICS_CONFIG.virtualWidth + 50) return;

      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.ellipse(rx + c.w / 2, c.y + c.h / 2, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#b8860b";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Kilau Koin
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(rx + c.w / 2 - 1, c.y + 4, 2, c.h - 8);
    });

    // 4. Tiang Bendera Selesai (Flag Pole)
    const fp = this.physics.flagPole;
    if (fp) {
      const rx = fp.x - cameraX;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(rx, fp.y, fp.w, fp.h);

      // Bola Emas Puncak Tiang
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.arc(rx + fp.w / 2, fp.y, 9, 0, Math.PI * 2);
      ctx.fill();

      // Bendera Segitiga
      ctx.fillStyle = fp.reached ? "#43b047" : "#e52521";
      ctx.beginPath();
      ctx.moveTo(rx + fp.w, fp.y + 12);
      ctx.lineTo(rx + fp.w + 38, fp.y + 30);
      ctx.lineTo(rx + fp.w, fp.y + 48);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Render Sprite Mario Berbasis Vektor Piksel Khas
  drawMario(ctx, x, y, w, h, facing, frame) {
    ctx.save();

    if (facing === 'left') {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      x = 0;
      y = 0;
    } else {
      ctx.translate(x, y);
      x = 0;
      y = 0;
    }

    // Animasi langkah kaki
    const legOffset = (frame === 1) ? 2 : (frame === 2 ? -2 : 0);

    // Topi Merah
    ctx.fillStyle = "#e52521";
    ctx.fillRect(x + 4, y, 16, 7);
    ctx.fillRect(x + 10, y + 5, 12, 4); // Visor

    // Wajah & Kulit
    ctx.fillStyle = "#ffcca3";
    ctx.fillRect(x + 6, y + 7, 12, 7);

    // Rambut & Kumis Cokelat Tua
    ctx.fillStyle = "#4a2a00";
    ctx.fillRect(x + 2, y + 7, 4, 6);
    ctx.fillRect(x + 10, y + 10, 8, 3);
    ctx.fillStyle = "#000000";
    ctx.fillRect(x + 12, y + 8, 2, 2); // Mata

    // Baju Merah
    ctx.fillStyle = "#e52521";
    ctx.fillRect(x + 4, y + 14, 16, 8);

    // Baju Kodok Biru (Overalls)
    ctx.fillStyle = "#0026ff";
    ctx.fillRect(x + 5, y + 18, 14, 8);

    // Kancing Emas
    ctx.fillStyle = "#fbd000";
    ctx.fillRect(x + 7, y + 19, 2, 2);
    ctx.fillRect(x + 15, y + 19, 2, 2);

    // Sepatu Cokelat (Dinamis Kaki)
    ctx.fillStyle = "#633a00";
    ctx.fillRect(x + 2 + legOffset, y + 26, 8, 6);
    ctx.fillRect(x + 14 - legOffset, y + 26, 8, 6);

    ctx.restore();
  }
}
