// ==============================================================================
// 2D PLATFORMER PHYSICS & CAMERA ENGINE
// Delta-time based physics, Coyote Time (100ms), Jump Buffering (120ms), AABB Collision
// ==============================================================================

export const PHYSICS_CONFIG = {
  // Koordinat Virtual Kanvas
  virtualWidth: 800,
  virtualHeight: 450,

  // Fisika Karakter
  maxSpeed: 4.2,
  accel: 0.85,
  friction: 0.78,
  airFriction: 0.92,
  gravity: 0.58,
  jumpForce: -11.6,

  // Fleksibilitas Kontrol Platformer
  coyoteTimeMax: 0.10,   // 100ms toleransi lompat setelah jatuh dari tepian
  jumpBufferMax: 0.12,   // 120ms toleransi tombol lompat sebelum mendarat

  // Kamera
  cameraLerp: 0.08,
  cameraLeadAhead: 120   // Kamera sedikit condong ke depan arah jalan Mario
};

export class PhysicsEngine {
  constructor(particleSystem, soundSystem) {
    this.particles = particleSystem;
    this.sound = soundSystem;

    // State Pemain
    this.player = {
      x: 60,
      y: 300,
      w: 24,
      h: 32,
      vx: 0,
      vy: 0,
      isGrounded: false,
      wasGrounded: false,
      facing: 'right',
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      animTimer: 0,
      frame: 0
    };

    // Kamera Horizontal
    this.camera = {
      x: 0,
      y: 0,
      targetX: 0,
      minX: 0,
      maxX: 1200
    };

    // Objek Level
    this.platforms = [];
    this.questionBlocks = [];
    this.coins = [];
    this.flagPole = null;
    this.levelWidth = 1400;

    // Input Controller Keys
    this.keys = {
      left: false,
      right: false,
      jump: false,
      jumpPressedThisFrame: false
    };

    // Callback event
    this.onHitQuestionBlock = null;
    this.onCollectCoin = null;
    this.onReachFlag = null;
    this.onFallInPit = null;
  }

  // Set input dari keyboard / touch D-Pad
  setInput(key, value) {
    if (key === 'jump' && value && !this.keys.jump) {
      // Tombol baru saja ditekan -> isi jump buffer timer
      this.player.jumpBufferTimer = PHYSICS_CONFIG.jumpBufferMax;
    }
    this.keys[key] = value;
  }

  // Load level map entities
  loadLevel(levelData) {
    this.platforms = levelData.platforms || [];
    this.questionBlocks = levelData.questionBlocks || [];
    this.coins = levelData.coins || [];
    this.flagPole = levelData.flagPole || null;
    this.levelWidth = levelData.levelWidth || 1400;

    this.camera.maxX = Math.max(0, this.levelWidth - PHYSICS_CONFIG.virtualWidth);
    this.camera.x = 0;
    this.camera.targetX = 0;

    // Reset posisi Mario
    this.player.x = levelData.startX || 60;
    this.player.y = levelData.startY || 320;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.isGrounded = false;
    this.player.wasGrounded = false;
    this.player.coyoteTimer = 0;
    this.player.jumpBufferTimer = 0;
  }

  // Update Game Physics dengan deltaTime (dalam detik)
  update(dt) {
    const p = this.player;

    // 1. Update Timer Coyote Time & Jump Buffering
    if (p.isGrounded) {
      p.coyoteTimer = PHYSICS_CONFIG.coyoteTimeMax;
    } else {
      p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
    }

    p.jumpBufferTimer = Math.max(0, p.jumpBufferTimer - dt);

    // 2. Gerak Horizontal & Akselerasi
    if (this.keys.left) {
      p.vx -= PHYSICS_CONFIG.accel;
      p.facing = 'left';
    } else if (this.keys.right) {
      p.vx += PHYSICS_CONFIG.accel;
      p.facing = 'right';
    } else {
      // Gesekan Lantai / Deselerasi
      p.vx *= (p.isGrounded ? PHYSICS_CONFIG.friction : PHYSICS_CONFIG.airFriction);
      if (Math.abs(p.vx) < 0.1) p.vx = 0;
    }

    // Batasi Kecepatan Maksimum
    if (p.vx > PHYSICS_CONFIG.maxSpeed) p.vx = PHYSICS_CONFIG.maxSpeed;
    if (p.vx < -PHYSICS_CONFIG.maxSpeed) p.vx = -PHYSICS_CONFIG.maxSpeed;

    // 3. Logika Lompat (Coyote Time + Jump Buffering)
    const canJump = p.coyoteTimer > 0;
    const desiresJump = p.jumpBufferTimer > 0;

    if (canJump && desiresJump) {
      p.vy = PHYSICS_CONFIG.jumpForce;
      p.coyoteTimer = 0;
      p.jumpBufferTimer = 0;
      p.isGrounded = false;
      this.sound.playJump();
      this.particles.spawnLandingDust(p.x + p.w / 2, p.y + p.h, 6);
    }

    // Variable Jump Height: Jika tombol dilepas saat meluncur naik, rem sedikit
    if (!this.keys.jump && p.vy < -3) {
      p.vy *= 0.88;
    }

    // 4. Terapkan Gravitasi
    p.vy += PHYSICS_CONFIG.gravity;
    if (p.vy > 14) p.vy = 14; // Kecepatan jatuh terminal

    // 5. Integrasi Posisi Horizontal & Deteksi Tabrakan Samping
    p.x += p.vx;

    // Batas Kiri Level
    if (p.x < 0) {
      p.x = 0;
      p.vx = 0;
    }
    // Batas Kanan Level
    if (p.x + p.w > this.levelWidth) {
      p.x = this.levelWidth - p.w;
      p.vx = 0;
    }

    // Tabrakan Platform Samping (Dinding)
    this.platforms.forEach(plat => {
      if (this.checkAABB(p, plat)) {
        if (p.vx > 0) { // Menabrak dari kiri platform
          p.x = plat.x - p.w;
          p.vx = 0;
        } else if (p.vx < 0) { // Menabrak dari kanan platform
          p.x = plat.x + plat.w;
          p.vx = 0;
        }
      }
    });

    // 6. Integrasi Posisi Vertikal & Deteksi Tabrakan Atas/Bawah
    p.y += p.vy;
    p.wasGrounded = p.isGrounded;
    p.isGrounded = false;

    // Deteksi Pijakan Platform Solid
    this.platforms.forEach(plat => {
      // Pendaratan dari Atas
      if (
        p.x + p.w - 4 > plat.x &&
        p.x + 4 < plat.x + plat.w &&
        p.y + p.h >= plat.y &&
        p.y + p.h <= plat.y + 16 &&
        p.vy >= 0
      ) {
        p.y = plat.y - p.h;
        p.vy = 0;
        p.isGrounded = true;

        // Efek Debu saat baru mendarat
        if (!p.wasGrounded) {
          this.particles.spawnLandingDust(p.x + p.w / 2, p.y + p.h, 4);
        }
      }
    });

    // Deteksi Blok Tanda Tanya [ ? ]
    this.questionBlocks.forEach(qb => {
      // Pijakan di atas blok [ ? ]
      if (
        p.x + p.w - 4 > qb.x &&
        p.x + 4 < qb.x + qb.w &&
        p.y + p.h >= qb.y &&
        p.y + p.h <= qb.y + 12 &&
        p.vy >= 0
      ) {
        p.y = qb.y - p.h;
        p.vy = 0;
        p.isGrounded = true;
      }

      // Sundulan Kepala dari Bawah
      if (
        p.x + p.w - 4 > qb.x &&
        p.x + 4 < qb.x + qb.w &&
        p.y <= qb.y + qb.h + 8 &&
        p.y >= qb.y + qb.h - 12 &&
        p.vy < 0
      ) {
        p.y = qb.y + qb.h;
        p.vy = 2.5; // Pantulan turun

        if (!qb.hit) {
          qb.hit = true;
          qb.bounce = 8;
          this.sound.playCoin();
          this.particles.spawnBlockCoin(qb.x, qb.y);
          if (this.onHitQuestionBlock) {
            this.onHitQuestionBlock(qb);
          }
        } else {
          qb.bounce = 3;
          this.sound.playBump();
        }
      }

      // Animasi pemulihan pegas blok
      if (qb.bounce > 0) {
        qb.bounce -= 0.6;
        if (qb.bounce < 0) qb.bounce = 0;
      }
    });

    // 7. Deteksi Pengambilan Koin Emas
    this.coins.forEach(coin => {
      if (!coin.collected && this.checkAABB(p, coin)) {
        coin.collected = true;
        this.sound.playCoin();
        this.particles.spawnFloatingText("+50", coin.x, coin.y, "#ffd700");
        if (this.onCollectCoin) {
          this.onCollectCoin(coin);
        }
      }
    });

    // 8. Deteksi Mencapai Tiang Bendera Selesai (Flag Pole)
    if (this.flagPole && !this.flagPole.reached) {
      if (
        p.x + p.w >= this.flagPole.x &&
        p.x <= this.flagPole.x + this.flagPole.w &&
        p.y + p.h >= this.flagPole.y
      ) {
        this.flagPole.reached = true;
        if (this.onReachFlag) {
          this.onReachFlag(this.flagPole);
        }
      }
    }

    // 9. Cek Jatuh ke Jurang / Lahar
    if (p.y > PHYSICS_CONFIG.virtualHeight + 40) {
      if (this.onFallInPit) {
        this.onFallInPit();
      }
    }

    // 10. Update Kamera Halus (Lerping Horizontal)
    const targetLead = p.facing === 'right' ? PHYSICS_CONFIG.cameraLeadAhead : -PHYSICS_CONFIG.cameraLeadAhead;
    this.camera.targetX = (p.x - PHYSICS_CONFIG.virtualWidth / 2 + p.w / 2) + targetLead;

    // Batasi Kamera di Rentang [0, maxX]
    if (this.camera.targetX < 0) this.camera.targetX = 0;
    if (this.camera.targetX > this.camera.maxX) this.camera.targetX = this.camera.maxX;

    // Interpolasi Halus (Smooth Dampening)
    this.camera.x += (this.camera.targetX - this.camera.x) * PHYSICS_CONFIG.cameraLerp;

    // 11. Animasi Kaki Mario
    if (p.isGrounded && Math.abs(p.vx) > 0.5) {
      p.animTimer += dt * 14;
      p.frame = Math.floor(p.animTimer) % 3;
    } else {
      p.frame = p.isGrounded ? 0 : 1; // 1 = frame melompat
    }
  }

  // Deteksi Tabrakan AABB Persegi
  checkAABB(rectA, rectB) {
    return (
      rectA.x < rectB.x + rectB.w &&
      rectA.x + rectA.w > rectB.x &&
      rectA.y < rectB.y + rectB.h &&
      rectA.y + rectA.h > rectB.y
    );
  }
}
