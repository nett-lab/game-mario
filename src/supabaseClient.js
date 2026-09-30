import { createClient } from '@supabase/supabase-js';

// Baca Environment Variables dari Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validasi apakah konfigurasi Supabase tersedia
const isConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') && 
  !supabaseAnonKey.includes('your-anon-key')
);

let supabase = null;
let isOfflineMode = !isConfigured;

if (isConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
  } catch (err) {
    console.warn('[Supabase] Gagal inisialisasi client, beralih ke Fallback Mode:', err);
    isOfflineMode = true;
  }
} else {
  console.info('[Supabase] Mode Offline/Fallback aktif. (Atur VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY untuk sinkronisasi cloud)');
}

// LocalStorage Keys untuk Fallback & Caching
const STORAGE_KEYS = {
  TEAMS: 'mario_teams_cache',
  CURRENT_TEAM: 'mario_current_team_id',
  QUIZ_LOGS: 'mario_quiz_logs_cache'
};

// Helper: Ambil data tim dari LocalStorage
function getLocalTeams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper: Simpan data tim ke LocalStorage
function saveLocalTeams(teams) {
  try {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  } catch (err) {
    console.error('[LocalStorage] Gagal menyimpan teams:', err);
  }
}

// Inisialisasi Mock Data jika LocalStorage kosong
if (getLocalTeams().length === 0) {
  saveLocalTeams([
    {
      id: 'mock-1',
      team_name: 'Cyber Logic 8A',
      class_name: '8-A',
      pilot_name: 'Ahmad',
      navigator_name: 'Fauzan & Rizky',
      debugger_name: 'Dewi',
      final_score: 1450,
      lives_remaining: 3,
      time_elapsed_seconds: 210,
      current_world: 4,
      status: 'victory',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'mock-2',
      team_name: 'Formula Master',
      class_name: '8-A',
      pilot_name: 'Budi',
      navigator_name: 'Siti & Maya',
      debugger_name: 'Rian',
      final_score: 1200,
      lives_remaining: 2,
      time_elapsed_seconds: 245,
      current_world: 4,
      status: 'victory',
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'mock-3',
      team_name: 'Byte Hunters',
      class_name: '8-B',
      pilot_name: 'Dimas',
      navigator_name: 'Lestari',
      debugger_name: 'Eko',
      final_score: 950,
      lives_remaining: 1,
      time_elapsed_seconds: 310,
      current_world: 3,
      status: 'playing',
      created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'mock-4',
      team_name: 'Koopa Decoders',
      class_name: '8-A',
      pilot_name: 'Zahra',
      navigator_name: 'Kevin & Putri',
      debugger_name: 'Bagus',
      final_score: 800,
      lives_remaining: 0,
      time_elapsed_seconds: 190,
      current_world: 2,
      status: 'game_over',
      created_at: new Date(Date.now() - 900000).toISOString()
    }
  ]);
}

/**
 * Buat sesi tim baru di Supabase atau LocalStorage fallback
 */
export async function createTeamSession({ team_name, class_name, pilot_name, navigator_name, debugger_name }) {
  const payload = {
    team_name: team_name.trim(),
    class_name: class_name.trim(),
    pilot_name: (pilot_name || 'Pilot').trim(),
    navigator_name: (navigator_name || 'Navigator').trim(),
    debugger_name: (debugger_name || 'Debugger').trim(),
    final_score: 0,
    lives_remaining: 3,
    time_elapsed_seconds: 0,
    current_world: 1,
    status: 'playing'
  };

  // Selalu simpan juga di local storage untuk fallback instan
  const localId = 'team-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const localRecord = { ...payload, id: localId, created_at: new Date().toISOString() };

  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_TEAM, data.id);
        
        // Simpan juga ke cache lokal
        const localList = getLocalTeams();
        localList.unshift(data);
        saveLocalTeams(localList);

        return { success: true, team: data, isFallback: false };
      }
    } catch (err) {
      console.warn('[Supabase] Gagal menyimpan team ke cloud, beralih ke local storage:', err.message);
    }
  }

  // Fallback: simpan di local storage
  localStorage.setItem(STORAGE_KEYS.CURRENT_TEAM, localId);
  const currentList = getLocalTeams();
  currentList.unshift(localRecord);
  saveLocalTeams(currentList);

  return { success: true, team: localRecord, isFallback: true };
}

/**
 * Update sesi tim (skor, sisa nyawa, waktu tempuh, world, status)
 */
export async function updateTeamSession(teamId, updates) {
  if (!teamId) return { success: false, error: 'No team ID provided' };

  // 1. Update ke Local Storage dulu agar selalu tersinkron
  const localList = getLocalTeams();
  const index = localList.findIndex(t => t.id === teamId);
  if (index !== -1) {
    localList[index] = { ...localList[index], ...updates, updated_at: new Date().toISOString() };
    saveLocalTeams(localList);
  }

  // 2. Jika koneksi Supabase aktif, kirim query UPDATE
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId)
        .select();

      if (error) throw error;
      return { success: true, data, isFallback: false };
    } catch (err) {
      console.warn('[Supabase] Gagal update tim ke cloud:', err.message);
      return { success: true, data: localList[index], isFallback: true };
    }
  }

  return { success: true, data: localList[index], isFallback: true };
}

/**
 * Catat log jawaban kuis siswa secara asinkron (non-blocking)
 */
export async function logQuizAnswer({ team_id, world_number, question_text, selected_answer, is_correct }) {
  const payload = {
    team_id,
    world_number,
    question_text,
    selected_answer,
    is_correct,
    attempt_timestamp: new Date().toISOString()
  };

  // Simpan log ke cache lokal
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ_LOGS);
    const logs = raw ? JSON.parse(raw) : [];
    logs.push(payload);
    localStorage.setItem(STORAGE_KEYS.QUIZ_LOGS, JSON.stringify(logs.slice(-200)));
  } catch {}

  if (isConfigured && supabase && team_id && !team_id.startsWith('team-')) {
    try {
      const { error } = await supabase.from('quiz_logs').insert([
        {
          team_id,
          world_number,
          question_text,
          selected_answer,
          is_correct
        }
      ]);
      if (error) throw error;
      return { success: true, isFallback: false };
    } catch (err) {
      console.warn('[Supabase] Telemetri quiz_logs gagal dikirim ke cloud:', err.message);
    }
  }

  return { success: true, isFallback: true };
}

/**
 * Ambil data leaderboard (diurutkan berdasarkan skor tertinggi, lalu waktu tersingkat)
 */
export async function fetchLeaderboard(classNameFilter = null) {
  if (isConfigured && supabase) {
    try {
      let query = supabase
        .from('teams')
        .select('*')
        .order('final_score', { ascending: false })
        .order('time_elapsed_seconds', { ascending: true })
        .limit(50);

      if (classNameFilter && classNameFilter !== 'ALL') {
        query = query.eq('class_name', classNameFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data && data.length > 0) {
        return { success: true, data, isFallback: false };
      }
    } catch (err) {
      console.warn('[Supabase] Gagal mengambil leaderboard cloud, gunakan data lokal:', err.message);
    }
  }

  // Fallback: Urutkan data dari LocalStorage
  let localList = getLocalTeams();
  if (classNameFilter && classNameFilter !== 'ALL') {
    localList = localList.filter(t => t.class_name === classNameFilter);
  }

  localList.sort((a, b) => {
    if (b.final_score !== a.final_score) {
      return b.final_score - a.final_score;
    }
    return (a.time_elapsed_seconds || 0) - (b.time_elapsed_seconds || 0);
  });

  return { success: true, data: localList, isFallback: true };
}

/**
 * Langganan Realtime Supabase untuk tabel teams (Layar Proyektor Guru)
 */
export function subscribeToLeaderboard(onUpdateCallback) {
  if (!isConfigured || !supabase) {
    // Mode offline: pasang listener untuk event perubahan storage di tab lain
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.TEAMS) {
        fetchLeaderboard().then(res => onUpdateCallback(res.data));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }

  try {
    const channel = supabase
      .channel('public:teams_live_leaderboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        (payload) => {
          console.log('[Supabase Realtime] Event diterima:', payload.eventType, payload.new);
          // Ambil daftar lengkap terurut ulang setelah perubahan
          fetchLeaderboard().then(res => onUpdateCallback(res.data));
        }
      )
      .subscribe((status) => {
        console.log('[Supabase Realtime] Status channel:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.error('[Supabase Realtime] Error subscription:', err);
    return () => {};
  }
}

/**
 * Cek status konfigurasi Supabase
 */
export function getSupabaseStatus() {
  return {
    isConfigured,
    url: supabaseUrl ? supabaseUrl.replace(/https:\/\/(.*)\.supabase\.co.*/, 'https://$1...supabase.co') : 'Belum diatur',
    isOffline: isOfflineMode
  };
}
