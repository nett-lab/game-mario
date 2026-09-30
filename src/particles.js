// ==============================================================================
// PARTICLE & VISUAL EFFECTS ENGINE: "Super Spreadsheet & Scratch Bros"
// Partikel koin meletup, debu mendarat, getar layar (Screen Shake), & teks melayang
// ==============================================================================

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.screenShake = {
      duration: 0,
      intensity: 0,
      offsetX: 0,
      offsetY: 0
    };
  }

  // Trigger efek getar layar saat jawaban salah / jatuh ke lahar
  triggerScreenShake(intensity = 8, durationMs = 350) {
    this.screenShake.intensity = intensity;
    this.screenShake.duration = durationMs / 1000;
  }

  // Partikel koin emas meloncat ke atas saat blok [?] disundul
  spawnBlockCoin(x, y) {
    this.particles.push({
      type: 'coin_pop',
      x: x + 6,
      y: y - 8,
      w: 16,
      h: 20,
      vy: -6.5,
      gravity: 0.35,
      scaleY: 1,
      spinSpeed: 0.28,
      life: 0.55,
      maxLife: 0.55,
      color: '#ffd700'
    });

    // Munculkan teks skor +100
    this.spawnFloatingText("+100", x + 14, y - 18, "#ffd700");
  }

  // Partikel debu putih kecil saat Mario mendarat di lantai
  spawnLandingDust(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'dust',
        x: x + (Math.random() * 20 - 10),
        y: y,
        vx: (Math.random() - 0.5) * 2.5,
        vy: -Math.random() * 1.5 - 0.4,
        size: Math.random() * 3 + 2,
        life: 0.35,
        maxLife: 0.35,
        color: 'rgba(240, 240, 240, 0.7)'
      });
    }
  }

  // Partikel percikan kembang api / bintang saat jawaban benar
  spawnSuccessSparkles(x, y, count = 12) {
    const colors = ['#fbd000', '#43b047', '#00e5ff', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const speed = Math.random() * 3 + 2;
      this.particles.push({
        type: 'sparkle',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        gravity: 0.12,
        size: Math.random() * 3 + 3,
        life: 0.6,
        maxLife: 0.6,
        color: colors[i % colors.length]
      });
    }
  }

  // Teks melayang skor / poin
  spawnFloatingText(text, x, y, color = "#ffd700") {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -1.2,
      life: 0.8,
      maxLife: 0.8,
      color
    });
  }

  // Update seluruh posisi dan siklus hidup partikel berdasarkan deltaTime
  update(dt) {
    // 1. Update Screen Shake
    if (this.screenShake.duration > 0) {
      this.screenShake.duration -= dt;
      const decay = Math.max(0, this.screenShake.duration * 2);
      this.screenShake.offsetX = (Math.random() - 0.5) * this.screenShake.intensity * decay;
      this.screenShake.offsetY = (Math.random() - 0.5) * this.screenShake.intensity * decay;
      if (this.screenShake.duration <= 0) {
        this.screenShake.offsetX = 0;
        this.screenShake.offsetY = 0;
      }
    } else {
      this.screenShake.offsetX = 0;
      this.screenShake.offsetY = 0;
    }

    // 2. Update Partikel
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      if (p.type === 'coin_pop') {
        p.vy += p.gravity;
        p.y += p.vy;
        p.scaleY = Math.cos(p.life * 25);
      } else if (p.type === 'dust') {
        p.x += p.vx;
        p.y += p.vy;
        p.size = Math.max(0.5, p.size * 0.96);
      } else if (p.type === 'sparkle') {
        p.vy += (p.gravity || 0);
        p.x += p.vx;
        p.y += p.vy;
      }
    }

    // 3. Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.life -= dt;
      if (t.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      t.y += t.vy;
    }
  }

  // Render partikel di atas kanvas dengan koordinat kamera
  draw(ctx, cameraX) {
    // Render Partikel
    this.particles.forEach(p => {
      const rx = p.x - cameraX;
      const alpha = Math.max(0, p.life / p.maxLife);

      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.type === 'coin_pop') {
        ctx.fillStyle = p.color;
        ctx.translate(rx + p.w / 2, p.y + p.h / 2);
        ctx.scale(1, Math.abs(p.scaleY));
        ctx.beginPath();
        ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (p.type === 'dust') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(rx, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'sparkle') {
        ctx.fillStyle = p.color;
        ctx.fillRect(rx - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }

      ctx.restore();
    });

    // Render Floating Text
    this.floatingTexts.forEach(t => {
      const rx = t.x - cameraX;
      const alpha = Math.max(0, t.life / t.maxLife);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = t.color;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.fillText(t.text, rx, t.y);
      ctx.restore();
    });
  }

  clear() {
    this.particles = [];
    this.floatingTexts = [];
    this.screenShake.duration = 0;
    this.screenShake.offsetX = 0;
    this.screenShake.offsetY = 0;
  }
}
