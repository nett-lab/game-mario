// ==============================================================================
// LIVE REALTIME LEADERBOARD & TEACHER PROJECTOR ENGINE
// Realtime Supabase Subscription, Podium Animasi, Filter Kelas, & Mode Layar Penuh
// ==============================================================================

import { fetchLeaderboard, subscribeToLeaderboard, getSupabaseStatus } from './supabaseClient.js';
import { sound } from './audio.js';

export class LeaderboardManager {
  constructor(containerElement) {
    this.container = containerElement;
    this.currentFilter = 'ALL';
    this.teamsData = [];
    this.unsubscribeRealtime = null;
    this.prevTopTeamId = null;

    this.init();
  }

  async init() {
    this.renderSkeleton();
    await this.loadData();
    this.setupRealtime();
  }

  setupRealtime() {
    if (this.unsubscribeRealtime) {
      this.unsubscribeRealtime();
    }

    this.unsubscribeRealtime = subscribeToLeaderboard((updatedTeams) => {
      console.log('[Leaderboard] Menerima pembaruan Realtime Supabase!');
      this.teamsData = updatedTeams || [];

      // Cek apakah ada juara baru (posisi 1 berganti)
      if (this.teamsData.length > 0) {
        const topTeam = this.teamsData[0];
        if (this.prevTopTeamId && this.prevTopTeamId !== topTeam.id) {
          sound.playSuccess();
        }
        this.prevTopTeamId = topTeam.id;
      }

      this.render();
    });
  }

  async loadData() {
    try {
      const res = await fetchLeaderboard(this.currentFilter);
      this.teamsData = res.data || [];
      if (this.teamsData.length > 0) {
        this.prevTopTeamId = this.teamsData[0].id;
      }
      this.render();
    } catch (err) {
      console.error('[Leaderboard] Gagal memuat data:', err);
    }
  }

  setFilter(className) {
    this.currentFilter = className;
    this.loadData();
  }

  formatTime(seconds) {
    const s = seconds || 0;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  }

  renderSkeleton() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="flex items-center justify-center p-12 text-slate-400">
        <div class="flex flex-col items-center gap-3">
          <div class="w-10 h-10 border-4 border-mario-yellow border-t-transparent rounded-full animate-spin"></div>
          <span class="font-pixel text-xs text-mario-yellow">MENGHUBUNGKAN KE SUPABASE REALTIME...</span>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.container) return;

    const filtered = (this.currentFilter === 'ALL')
      ? this.teamsData
      : this.teamsData.filter(t => t.class_name === this.currentFilter);

    const status = getSupabaseStatus();

    // Hitung Ringkasan Statistik
    const totalTeams = filtered.length;
    const victoriousTeams = filtered.filter(t => t.status === 'victory').length;
    const avgScore = totalTeams > 0
      ? Math.round(filtered.reduce((acc, t) => acc + (t.final_score || 0), 0) / totalTeams)
      : 0;

    const top1 = filtered[0] || null;
    const top2 = filtered[1] || null;
    const top3 = filtered[2] || null;
    const others = filtered.slice(3);

    this.container.innerHTML = `
      <div class="flex flex-col gap-6 w-full max-w-5xl mx-auto">
        
        <!-- Header & Kontrol Proyektor -->
        <div class="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border-2 border-slate-700 p-4 rounded-2xl shadow-retro">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-amber-500 rounded-xl border-2 border-white shadow-retro-sm flex items-center justify-center text-2xl">
              👑
            </div>
            <div>
              <h2 class="font-pixel text-sm sm:text-base text-mario-yellow flex items-center gap-2">
                PAPAN PERINGKAT REALTIME
                <span class="px-2 py-0.5 rounded text-[9px] font-sans font-bold uppercase ${status.isOffline ? 'bg-amber-600/30 text-amber-300 border border-amber-500' : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500'}">
                  ${status.isOffline ? 'Mode Lokal' : '🟢 Supabase Live'}
                </span>
              </h2>
              <p class="text-xs text-slate-400">Layar Proyektor Evaluasi Lab Komputer • Informatika SMP Kelas 8</p>
            </div>
          </div>

          <!-- Filter Kelas & Tombol Fullscreen -->
          <div class="flex items-center gap-2 flex-wrap">
            <div class="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <span class="px-2 font-bold text-slate-500 text-[10px]">KELAS:</span>
              ${['ALL', '8-A', '8-B', '8-C', '8-D'].map(cls => `
                <button class="btn-filter-class px-2.5 py-1 rounded-lg font-bold text-xs transition ${this.currentFilter === cls ? 'bg-mario-yellow text-slate-950 shadow-sm' : 'text-slate-300 hover:bg-slate-800'}" data-class="${cls}">
                  ${cls === 'ALL' ? 'Semua' : cls}
                </button>
              `).join('')}
            </div>

            <button id="btn-refresh-leaderboard" class="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition text-xs font-bold" title="Refresh Data">
              🔄
            </button>

            <button id="btn-fullscreen-projector" class="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl border border-emerald-400 transition text-xs font-bold flex items-center gap-1.5 shadow-retro-sm">
              <span>⛶</span> Fullscreen Proyektor
            </button>
          </div>
        </div>

        <!-- Metric Counter Cards -->
        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
            <div class="text-[10px] uppercase font-bold text-slate-500">Total Tim Bertanding</div>
            <div class="font-pixel text-lg text-white mt-1">${totalTeams}</div>
          </div>
          <div class="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
            <div class="text-[10px] uppercase font-bold text-slate-500">Tim Berhasil Tamat</div>
            <div class="font-pixel text-lg text-emerald-400 mt-1">${victoriousTeams}</div>
          </div>
          <div class="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
            <div class="text-[10px] uppercase font-bold text-slate-500">Rata-rata Skor</div>
            <div class="font-pixel text-lg text-amber-400 mt-1">${avgScore}</div>
          </div>
        </div>

        <!-- PODIUM TOP 3 (Retro Arcade High Score Showcase) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end pt-4">
          
          <!-- PODIUM 2 (Silver) -->
          <div class="order-2 md:order-1 bg-gradient-to-t from-slate-900 to-slate-800/90 border-2 border-slate-400/60 p-4 rounded-2xl shadow-retro flex flex-col items-center text-center relative md:h-[220px] justify-between">
            <div class="absolute -top-3 px-3 py-0.5 bg-slate-300 text-slate-950 font-pixel text-[10px] rounded-full shadow-retro-sm font-bold">
              🥈 JUARA 2
            </div>
            ${top2 ? `
              <div class="w-12 h-12 rounded-full bg-slate-400 text-slate-950 flex items-center justify-center font-pixel text-lg mt-2 shadow-inner">
                2
              </div>
              <div>
                <div class="font-bold text-sm text-white truncate max-w-[180px]">${top2.team_name}</div>
                <div class="text-[11px] text-slate-400">Kelas ${top2.class_name} • ${top2.pilot_name || 'Pilot'}</div>
              </div>
              <div class="bg-slate-950/70 w-full py-1.5 rounded-lg border border-slate-800">
                <span class="font-pixel text-slate-300 text-xs">${top2.final_score} PTS</span>
                <span class="text-[10px] text-slate-500 ml-2">⏱ ${this.formatTime(top2.time_elapsed_seconds)}</span>
              </div>
            ` : `
              <div class="text-slate-600 font-pixel text-xs m-auto">BELUM ADA DATA</div>
            `}
          </div>

          <!-- PODIUM 1 (Gold / Champion) -->
          <div class="order-1 md:order-2 bg-gradient-to-t from-amber-950/70 via-slate-900 to-amber-900/40 border-4 border-amber-400 p-5 rounded-2xl shadow-retro-lg flex flex-col items-center text-center relative md:h-[260px] justify-between transform md:-translate-y-2">
            <div class="absolute -top-4 px-4 py-1 bg-amber-400 text-slate-950 font-pixel text-xs rounded-full shadow-retro font-bold animate-bounce">
              🥇 JUARA 1 TERTINGGI
            </div>
            ${top1 ? `
              <div class="w-16 h-16 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-pixel text-2xl mt-2 shadow-retro-sm">
                👑
              </div>
              <div>
                <div class="font-bold text-base sm:text-lg text-amber-300 truncate max-w-[220px]">${top1.team_name}</div>
                <div class="text-xs text-amber-200/80">Kelas ${top1.class_name} • Pilot: ${top1.pilot_name || '-'}</div>
                <div class="text-[10px] text-slate-400 mt-0.5">Nav: ${top1.navigator_name || '-'} | Deb: ${top1.debugger_name || '-'}</div>
              </div>
              <div class="bg-slate-950/90 w-full py-2 rounded-xl border border-amber-500/40">
                <span class="font-pixel text-amber-400 text-sm sm:text-base">${top1.final_score} PTS</span>
                <span class="text-xs text-emerald-400 ml-2">⏱ ${this.formatTime(top1.time_elapsed_seconds)}</span>
              </div>
            ` : `
              <div class="text-slate-600 font-pixel text-xs m-auto">MENUNGGU SKOR PERTAMA</div>
            `}
          </div>

          <!-- PODIUM 3 (Bronze) -->
          <div class="order-3 bg-gradient-to-t from-slate-900 to-amber-950/40 border-2 border-amber-700/60 p-4 rounded-2xl shadow-retro flex flex-col items-center text-center relative md:h-[200px] justify-between">
            <div class="absolute -top-3 px-3 py-0.5 bg-amber-700 text-white font-pixel text-[10px] rounded-full shadow-retro-sm font-bold">
              🥉 JUARA 3
            </div>
            ${top3 ? `
              <div class="w-11 h-11 rounded-full bg-amber-700 text-white flex items-center justify-center font-pixel text-base mt-2 shadow-inner">
                3
              </div>
              <div>
                <div class="font-bold text-sm text-white truncate max-w-[180px]">${top3.team_name}</div>
                <div class="text-[11px] text-slate-400">Kelas ${top3.class_name} • ${top3.pilot_name || 'Pilot'}</div>
              </div>
              <div class="bg-slate-950/70 w-full py-1.5 rounded-lg border border-slate-800">
                <span class="font-pixel text-amber-500 text-xs">${top3.final_score} PTS</span>
                <span class="text-[10px] text-slate-500 ml-2">⏱ ${this.formatTime(top3.time_elapsed_seconds)}</span>
              </div>
            ` : `
              <div class="text-slate-600 font-pixel text-xs m-auto">BELUM ADA DATA</div>
            `}
          </div>

        </div>

        <!-- TABEL LENGKAP PERINGKAT 4 KE BAWAH -->
        <div class="bg-slate-900/90 border-2 border-slate-800 rounded-2xl overflow-hidden shadow-retro">
          <div class="bg-slate-800/80 px-4 py-2.5 border-b border-slate-700 text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>DAFTAR LENGKAP KELOMPOK LABORATORIUM</span>
            <span class="text-[11px] text-slate-400">Urutan: Skor Tertinggi & Waktu Tercepat</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th class="p-3 text-center">Rank</th>
                  <th class="p-3">Nama Tim</th>
                  <th class="p-3 text-center">Kelas</th>
                  <th class="p-3">Anggota (Pilot / Nav / Deb)</th>
                  <th class="p-3 text-center">World</th>
                  <th class="p-3 text-center">Status</th>
                  <th class="p-3 text-center">Waktu</th>
                  <th class="p-3 text-right">Skor Koin</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                ${filtered.length === 0 ? `
                  <tr>
                    <td colspan="8" class="p-6 text-center text-slate-500 font-medium">
                      Belum ada data tim yang tercatat untuk filter ini.
                    </td>
                  </tr>
                ` : filtered.map((team, idx) => {
                  const isTop3 = idx < 3;
                  const rankBadge = idx === 0 ? '🥇 1' : (idx === 1 ? '🥈 2' : (idx === 2 ? '🥉 3' : `#${idx + 1}`));
                  const statusBadge = team.status === 'victory' 
                    ? '<span class="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30">TAMAT 👑</span>'
                    : (team.status === 'game_over' 
                      ? '<span class="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold border border-red-500/30">GUGUR 💀</span>'
                      : '<span class="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-500/30">BERMAIN 🎮</span>');

                  return `
                    <tr class="hover:bg-slate-800/40 transition ${isTop3 ? 'bg-amber-500/5' : ''}">
                      <td class="p-3 text-center font-pixel ${idx === 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}">
                        ${rankBadge}
                      </td>
                      <td class="p-3 font-bold text-white">
                        ${team.team_name}
                      </td>
                      <td class="p-3 text-center font-semibold text-slate-300">
                        ${team.class_name}
                      </td>
                      <td class="p-3 text-slate-300 text-[11px]">
                        ${team.pilot_name || '-'} / ${team.navigator_name || '-'} / ${team.debugger_name || '-'}
                      </td>
                      <td class="p-3 text-center font-pixel text-[10px] text-mario-yellow">
                        W${team.current_world || 1}
                      </td>
                      <td class="p-3 text-center">
                        ${statusBadge}
                      </td>
                      <td class="p-3 text-center font-mono text-slate-400">
                        ${this.formatTime(team.time_elapsed_seconds)}
                      </td>
                      <td class="p-3 text-right font-pixel font-bold text-amber-400">
                        ${team.final_score}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    // Filter Kelas
    this.container.querySelectorAll('.btn-filter-class').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cls = e.currentTarget.getAttribute('data-class');
        this.setFilter(cls);
      });
    });

    // Refresh Tombol
    const btnRefresh = this.container.querySelector('#btn-refresh-leaderboard');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => {
        sound.init();
        sound.playCoin();
        this.loadData();
      });
    }

    // Fullscreen Proyektor
    const btnFullscreen = this.container.querySelector('#btn-fullscreen-projector');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        sound.init();
        const elem = document.documentElement;
        if (!document.fullscreenElement) {
          elem.requestFullscreen().catch(err => {
            console.warn('[Fullscreen] Gagal masuk mode layar penuh:', err);
          });
        } else {
          document.exitFullscreen();
        }
      });
    }
  }

  destroy() {
    if (this.unsubscribeRealtime) {
      this.unsubscribeRealtime();
    }
  }
}
