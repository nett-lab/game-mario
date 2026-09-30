// ==============================================================================
// APPLICATION ENTRY POINT: "Super Spreadsheet & Scratch Bros"
// Mengintegrasikan Game Engine, Quiz Modal, Realtime Leaderboard, & Event Listeners
// ==============================================================================

import { MarioEduGame } from './game.js';
import { LeaderboardManager } from './leaderboard.js';
import { sound } from './audio.js';
import { getSupabaseStatus } from './supabaseClient.js';

// Tunggu DOM selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new MarioEduGame(canvas);

  let leaderboard = null;

  // Elemen DOM Utama
  const viewGame = document.getElementById('view-game');
  const viewLeaderboard = document.getElementById('view-leaderboard');
  const btnNavGame = document.getElementById('btn-nav-game');
  const btnNavLeaderboard = document.getElementById('btn-nav-leaderboard');

  // HUD Elements
  const hudTeamName = document.getElementById('hud-team-name');
  const hudClassName = document.getElementById('hud-class-name');
  const hudHearts = document.getElementById('hud-hearts');
  const hudTimer = document.getElementById('hud-timer');
  const hudScore = document.getElementById('hud-score');
  const worldBadge = document.getElementById('world-badge');
  const worldTitle = document.getElementById('world-title');
  const btnToggleAudio = document.getElementById('btn-toggle-audio');
  const cloudStatusPill = document.getElementById('cloud-status-pill');

  // Modals
  const modalTeam = document.getElementById('modal-team');
  const modalQuiz = document.getElementById('modal-quiz');
  const modalGameOver = document.getElementById('modal-gameover');
  const gameOverlay = document.getElementById('game-overlay');

  // Quiz Modal Elements
  const quizWorldBadge = document.getElementById('quiz-world-badge');
  const quizQuestionText = document.getElementById('quiz-question-text');
  const quizOptionsContainer = document.getElementById('quiz-options-container');
  const quizHintBox = document.getElementById('quiz-hint-box');
  const quizHintText = document.getElementById('quiz-hint-text');
  const btnToggleHint = document.getElementById('btn-toggle-hint');
  const quizFeedback = document.getElementById('quiz-feedback');

  // Role Strip
  const rolePilotName = document.getElementById('role-pilot-name');
  const roleNavigatorName = document.getElementById('role-navigator-name');
  const roleDebuggerName = document.getElementById('role-debugger-name');

  // Inisialisasi Status Supabase
  const supaStatus = getSupabaseStatus();
  if (cloudStatusPill) {
    if (supaStatus.isConfigured) {
      cloudStatusPill.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
      cloudStatusPill.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Cloud Sync`;
      cloudStatusPill.title = `Terhubung ke Supabase: ${supaStatus.url}`;
    } else {
      cloudStatusPill.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40";
      cloudStatusPill.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400"></span> Mode Offline`;
      cloudStatusPill.title = "Supabase belum diatur di .env. Menggunakan Local Storage Lab.";
    }
  }

  // Navigasi Tampilan (Game vs Leaderboard Proyektor)
  function switchView(target) {
    sound.init();
    if (target === 'leaderboard') {
      viewGame.classList.add('hidden');
      viewLeaderboard.classList.remove('hidden');
      btnNavGame.classList.remove('bg-mario-yellow', 'text-slate-950');
      btnNavGame.classList.add('text-slate-300', 'hover:bg-slate-800');
      btnNavLeaderboard.classList.remove('text-slate-300', 'hover:bg-slate-800');
      btnNavLeaderboard.classList.add('bg-mario-yellow', 'text-slate-950');
      window.location.hash = '#leaderboard';

      if (!leaderboard) {
        leaderboard = new LeaderboardManager(document.getElementById('leaderboard-content'));
      } else {
        leaderboard.loadData();
      }
    } else {
      viewLeaderboard.classList.add('hidden');
      viewGame.classList.remove('hidden');
      btnNavLeaderboard.classList.remove('bg-mario-yellow', 'text-slate-950');
      btnNavLeaderboard.classList.add('text-slate-300', 'hover:bg-slate-800');
      btnNavGame.classList.remove('text-slate-300', 'hover:bg-slate-800');
      btnNavGame.classList.add('bg-mario-yellow', 'text-slate-950');
      window.location.hash = '#game';
    }
  }

  btnNavGame.addEventListener('click', () => switchView('game'));
  btnNavLeaderboard.addEventListener('click', () => switchView('leaderboard'));

  // Cek hash URL awal
  if (window.location.hash === '#leaderboard') {
    switchView('leaderboard');
  }

  // Audio Toggle
  btnToggleAudio.addEventListener('click', () => {
    const isMuted = sound.toggleMute();
    btnToggleAudio.textContent = isMuted ? '🔇' : '🔊';
  });

  // Game Engine HUD Update Callback
  game.onHUDUpdate = (data) => {
    if (hudTeamName) hudTeamName.textContent = data.teamName;
    if (hudClassName) hudClassName.textContent = data.className;
    if (hudScore) hudScore.textContent = String(data.score).padStart(4, '0');

    if (hudHearts) {
      hudHearts.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const span = document.createElement('span');
        span.textContent = i < data.lives ? '❤️' : '🖤';
        hudHearts.appendChild(span);
      }
    }

    if (hudTimer) {
      const s = data.timeElapsed;
      const m = Math.floor(s / 60);
      const rem = s % 60;
      hudTimer.textContent = `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
    }

    if (worldBadge && data.worldConfig) {
      worldBadge.textContent = data.worldConfig.code;
    }
    if (worldTitle && data.worldConfig) {
      worldTitle.textContent = data.worldConfig.name;
    }
  };

  // Game Alert Toast
  const alertToast = document.getElementById('canvas-alert');
  const alertToastText = document.getElementById('canvas-alert-text');
  game.onAlert = (text) => {
    if (!alertToast || !alertToastText) return;
    alertToastText.textContent = text;
    alertToast.classList.remove('opacity-0');
    alertToast.classList.add('opacity-100');
    setTimeout(() => {
      alertToast.classList.remove('opacity-100');
      alertToast.classList.add('opacity-0');
    }, 2200);
  };

  // Buka Modal Kuis saat Menyundul Blok [?]
  game.onOpenQuizModal = (question, onAnswer) => {
    quizWorldBadge.textContent = `WORLD ${question.worldNumber || 1}`;
    quizQuestionText.textContent = question.q;
    quizHintText.textContent = question.hint || "Diskusikan bersama Navigator tim!";
    quizHintBox.classList.add('hidden');
    quizFeedback.innerHTML = `<span>💡</span> Diskusikan bersama rekan satu tim sebelum memilih jawaban.`;

    quizOptionsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    question.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = "quiz-option-btn w-full p-3 sm:p-3.5 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-700 hover:border-mario-yellow flex items-center gap-3 text-left text-xs sm:text-sm font-semibold transition active:scale-[0.99]";
      btn.innerHTML = `
        <span class="w-7 h-7 rounded-lg bg-slate-800 text-mario-yellow font-pixel text-xs flex items-center justify-center border border-slate-700 shrink-0">
          ${letters[idx]}
        </span>
        <span class="text-slate-200 leading-snug">${optText}</span>
      `;

      btn.onclick = () => {
        // Disable semua tombol opsi
        quizOptionsContainer.querySelectorAll('.quiz-option-btn').forEach(b => b.disabled = true);

        const isCorrect = (idx === question.answer);

        if (isCorrect) {
          btn.classList.remove('bg-slate-950', 'border-slate-700');
          btn.classList.add('bg-emerald-950/80', 'border-emerald-500', 'text-emerald-200');
          quizFeedback.innerHTML = `<span class="text-emerald-400 font-bold">✓ TEPAT SEKALI! Jawaban benar, koin skor terkumpul!</span>`;
        } else {
          btn.classList.remove('bg-slate-950', 'border-slate-700');
          btn.classList.add('bg-red-950/80', 'border-red-500', 'text-red-200');

          // Sorot jawaban yang benar
          const correctBtn = quizOptionsContainer.children[question.answer];
          if (correctBtn) {
            correctBtn.classList.add('border-emerald-500/70', 'bg-emerald-950/40');
          }

          quizFeedback.innerHTML = `<span class="text-red-400 font-bold">✕ KURANG TEPAT! Nyawa tim berkurang (-1 ❤️). Petunjuk: ${question.hint}</span>`;
        }

        setTimeout(() => {
          modalQuiz.classList.add('hidden');
          onAnswer(idx, isCorrect);
        }, 1300);
      };

      quizOptionsContainer.appendChild(btn);
    });

    modalQuiz.classList.remove('hidden');
  };

  // Toggle Hint Accordion
  btnToggleHint.onclick = () => {
    quizHintBox.classList.toggle('hidden');
  };

  // Game Over & Victory Recaps
  function showEndGameModal(recap) {
    const icon = document.getElementById('gameover-icon');
    const title = document.getElementById('gameover-title');
    const msg = document.getElementById('gameover-message');

    if (recap.isVictory) {
      icon.textContent = "👑";
      icon.className = "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-retro border-2 border-white bg-amber-400 text-slate-900";
      title.textContent = "VICTORY! KERAJAAN TUNTAS!";
      msg.textContent = `Selamat kepada ${recap.teamName}! Seluruh tantangan rumus Excel dan logika Scratch diselesaikan dengan gemilang!`;
    } else {
      icon.textContent = "💀";
      icon.className = "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-retro border-2 border-white bg-red-600 text-white";
      title.textContent = "GAME OVER: NYAWA HABIS";
      msg.textContent = recap.message || "Tetap semangat! Pelajari kembali materi bersama tim dan raih skor tertinggi di giliran berikutnya.";
    }

    document.getElementById('recap-team-name').textContent = `${recap.teamName} (${recap.className})`;
    document.getElementById('recap-score').textContent = recap.score;
    document.getElementById('recap-hearts').textContent = "❤️".repeat(recap.lives) || "💔";

    const m = Math.floor(recap.timeElapsed / 60);
    const rem = recap.timeElapsed % 60;
    document.getElementById('recap-time').textContent = `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;

    modalGameOver.classList.remove('hidden');
  }

  game.onGameOver = showEndGameModal;
  game.onVictory = showEndGameModal;

  // Modal Registrasi Tim
  const teamForm = document.getElementById('team-setup-form');
  const btnOpenTeamModal = document.getElementById('btn-open-team-modal');
  const btnCloseTeamModal = document.getElementById('btn-close-team-modal');

  btnOpenTeamModal.onclick = () => modalTeam.classList.remove('hidden');
  btnCloseTeamModal.onclick = () => modalTeam.classList.add('hidden');

  teamForm.onsubmit = (e) => {
    e.preventDefault();
    const teamName = document.getElementById('input-team-name').value.trim() || 'Tim Juara';
    const className = document.getElementById('input-class-name').value || '8-A';
    const pilot = document.getElementById('input-pilot').value.trim() || 'Pilot';
    const navigator = document.getElementById('input-navigator').value.trim() || 'Navigator';
    const debuggerName = document.getElementById('input-debugger').value.trim() || 'Debugger';

    game.state.activeTeam = {
      id: null,
      name: teamName,
      className,
      pilot,
      navigator,
      debugger: debuggerName
    };

    if (rolePilotName) rolePilotName.textContent = pilot;
    if (roleNavigatorName) roleNavigatorName.textContent = navigator;
    if (roleDebuggerName) roleDebuggerName.textContent = debuggerName;
    if (hudTeamName) hudTeamName.textContent = teamName;
    if (hudClassName) hudClassName.textContent = className;

    modalTeam.classList.add('hidden');
  };

  // Tombol Mulai Permainan
  document.getElementById('btn-start-game').onclick = () => {
    sound.init();
    gameOverlay.classList.add('hidden');

    const teamData = {
      name: document.getElementById('input-team-name').value.trim() || 'Tim Juara',
      className: document.getElementById('input-class-name').value || '8-A',
      pilot: document.getElementById('input-pilot').value.trim() || 'Pilot',
      navigator: document.getElementById('input-navigator').value.trim() || 'Navigator',
      debugger: document.getElementById('input-debugger').value.trim() || 'Debugger'
    };

    game.startGame(teamData);
  };

  // Tombol Main Lagi
  document.getElementById('btn-restart-game').onclick = () => {
    modalGameOver.classList.add('hidden');
    gameOverlay.classList.remove('hidden');
  };

  // Tombol Lihat Leaderboard dari Modal Game Over
  const btnViewLeaderboardFromEnd = document.getElementById('btn-view-leaderboard-end');
  if (btnViewLeaderboardFromEnd) {
    btnViewLeaderboardFromEnd.onclick = () => {
      modalGameOver.classList.add('hidden');
      switchView('leaderboard');
    };
  }

  // Keyboard Event Listeners (A/D/Panah/Spasi/W)
  window.addEventListener('keydown', (e) => {
    sound.init();
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      game.physics.setInput('left', true);
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      game.physics.setInput('right', true);
    }
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      game.physics.setInput('jump', true);
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      game.physics.setInput('left', false);
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      game.physics.setInput('right', false);
    }
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      game.physics.setInput('jump', false);
    }
  });

  // Touch Controller Buttons (Tablet & Ponsel)
  const btnTouchLeft = document.getElementById('btn-touch-left');
  const btnTouchRight = document.getElementById('btn-touch-right');
  const btnTouchJump = document.getElementById('btn-touch-jump');

  function bindTouch(element, keyName) {
    if (!element) return;
    const onPress = (e) => {
      e.preventDefault();
      sound.init();
      game.physics.setInput(keyName, true);
    };
    const onRelease = (e) => {
      e.preventDefault();
      game.physics.setInput(keyName, false);
    };

    element.addEventListener('touchstart', onPress, { passive: false });
    element.addEventListener('touchend', onRelease, { passive: false });
    element.addEventListener('mousedown', onPress);
    element.addEventListener('mouseup', onRelease);
    element.addEventListener('mouseleave', onRelease);
  }

  bindTouch(btnTouchLeft, 'left');
  bindTouch(btnTouchRight, 'right');
  bindTouch(btnTouchJump, 'jump');

  // Inisialisasi awal kanvas
  game.loadWorld(0);
  game.draw();
});
