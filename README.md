# 🍄 Super Spreadsheet & Scratch Bros

> **Game Edukasi 2D Platformer Retro-Modern untuk Pembelajaran Informatika SMP Kelas 8**  
> *Materi: Rumus & Fungsi Spreadsheet (Excel) dan Pemrograman Visual (Scratch)*  
> Terintegrasi penuh dengan **Supabase Realtime Leaderboard** dan dioptimalkan untuk deployment instan di **Vercel**.

---

## 🌟 Fitur Utama & Keunggulan

1. **Mesin Fisika Platformer 60 FPS Presisi (HTML5 Canvas Engine)**:
   - Digerakkan oleh game loop berbasis `requestAnimationFrame` dan `deltaTime`.
   - **Coyote Time (100ms)**: Memberikan toleransi melompat sesaat setelah karakter melangkah keluar dari tepian platform.
   - **Jump Buffering (120ms)**: Mendaftarkan input tombol lompat beberapa milidetik sebelum menyentuh lantai dan langsung mengeksekusinya saat mendarat.
   - Deteksi tabrakan AABB solid untuk platform bata, pipa hijau, batas layar, dan sundulan kepala dari bawah pada blok tanda tanya `[ ? ]`.
   - **Kamera Halus (Smooth Horizontal Lerping)** dengan peredaman gerak dan arah pandang (*lead ahead*).
   - **Parallax Scrolling 3 Lapis**: Latar langit dinamis, awan melayang berkecepatan rendah, dan bukit/lanskap berjarak jauh.
   - **Partikel & Getar Layar (Screen Shake)**: Efek koin meletup saat blok `[ ? ]` disundul, debu halus saat mendarat, kembang api saat jawaban benar, dan getar layar saat jawaban salah.

2. **Sintesis Audio 8-Bit Retro Murni (Web Audio API)**:
   - Tanpa dependensi file audio eksternal (anti *lag* atau gagal *load* di jaringan lab sekolah).
   - Nada sintetis untuk lompatan Mario (*square wave sweep*), denting koin emas (*dual sine bell*), fanfare kemenangan, buzzer penalti salah (*sawtooth drop*), dan tombol *mute toggle* yang tersimpan di memori.

3. **Integrasi Cloud Supabase & Fallback Mode**:
   - Registrasi sesi tim kelompok secara anonim tanpa perlu akun kompleks bagi siswa.
   - Penyimpanan riwayat permainan: Nama Tim, Kelas, Anggota (Pilot, Navigator, Debugger), Skor Koin, Sisa Nyawa, dan Waktu Tempuh.
   - Telemetri log jawaban kuis (`quiz_logs`) asinkron (*non-blocking*) untuk analisis evaluasi guru pasca-pembelajaran.
   - **Mekanisme Fallback Otomatis (Local Storage)**: Jika koneksi internet lab drop atau API keys belum diatur, game tetap berjalan 100% mulus dengan sinkronisasi penyimpanan lokal.

4. **Papan Peringkat Realtime (Layar Proyektor Guru)**:
   - Menampilkan podium 3 besar (Emas 🥇, Perak 🥈, Perunggu 🥉) dengan estetika arkade retro.
   - Menggunakan fitur `supabase.channel('public:teams').on('postgres_changes', ...)` sehingga ketika ada kelompok yang menuntaskan level di komputer lab, daftar peringkat di layar proyektor depan kelas bergeser secara live otomatis tanpa reload.
   - Filter skor berdasarkan kelas (`8-A`, `8-B`, `8-C`, `8-D`, atau Semua).
   - Tombol *Fullscreen Proyektor* satu-klik untuk tampilan layar lebar kelas.

5. **Struktur Kolaborasi Siswa (Pedagogi Informatika)**:
   - **🎮 Pilot (Kontroler)**: Mengendalikan jalannya karakter Mario di keyboard komputer.
   - **📖 Navigator (Catatan)**: Menganalisis soal dan menemukan rumus yang tepat di lembar catatan materi.
   - **🔍 Debugger (Validasi)**: Memeriksa tanda baca formula (`;`, `,`, `$`, `" "`) sebelum tombol kirim ditekan.

---

## 📁 Struktur Direktori Proyek

```text
game-mario/
├── .env.example              # Template variabel lingkungan Supabase
├── index.html                # Halaman utama aplikasi (HUD, Canvas, Modals, Leaderboard)
├── package.json              # Dependensi proyek (Vite, @supabase/supabase-js, canvas-confetti)
├── vercel.json               # Konfigurasi perutean SPA & cache header untuk Vercel
├── vite.config.js            # Konfigurasi bundler Vite
├── README.md                 # Dokumentasi arsitektur dan panduan setup
├── supabase/
│   └── schema.sql            # Skrip DDL lengkap, RLS Policies, Indexes, & Realtime
└── src/
    ├── audio.js              # Synthesizer Web Audio API 8-bit retro
    ├── game.js               # Mesin perender kanvas, stage levels, & alur state
    ├── leaderboard.js        # Controller papan peringkat realtime & layar proyektor
    ├── main.js               # Titik masuk aplikasi & pengikat event listeners
    ├── particles.js          # Sistem partikel (koin pop, debu, getar layar)
    ├── physics.js            # Mesin fisika (Delta-time, Coyote Time, Jump Buffering, AABB)
    ├── questions.js          # Bank soal kurikulum Informatika Kelas 8 (World 1 s/d 4)
    ├── style.css             # Desain sistem retro-modern & pixel styling
    └── supabaseClient.js     # Wrapper Supabase Client dengan offline fallback
```

---

## 🗄️ Skema Database Supabase (SQL DDL & RLS)

Jalankan skrip di file [`supabase/schema.sql`](file:///f:/Desktop/Repository%20Github/game-mario/supabase/schema.sql) pada menu **SQL Editor** di Dashboard Supabase:

```sql
-- 1. TABEL: teams
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    pilot_name TEXT DEFAULT 'Pilot',
    navigator_name TEXT DEFAULT 'Navigator',
    debugger_name TEXT DEFAULT 'Debugger',
    final_score INTEGER NOT NULL DEFAULT 0,
    lives_remaining INTEGER NOT NULL DEFAULT 3,
    time_elapsed_seconds INTEGER NOT NULL DEFAULT 0,
    current_world INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'playing' CHECK (status IN ('playing', 'victory', 'game_over')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TABEL: quiz_logs (Analisis Guru)
CREATE TABLE quiz_logs (
    id BIGSERIAL PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    world_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempt_timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INDEXES
CREATE INDEX idx_teams_leaderboard ON teams (final_score DESC, time_elapsed_seconds ASC);
CREATE INDEX idx_teams_class ON teams (class_name);
CREATE INDEX idx_quiz_logs_team_id ON quiz_logs (team_id);
CREATE INDEX idx_quiz_logs_world ON quiz_logs (world_number);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for teams" ON teams FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert access for teams" ON teams FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public update access for own team" ON teams FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public read access for quiz_logs" ON quiz_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public insert access for quiz_logs" ON quiz_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 5. AKTIFKAN REALTIME REPLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_logs;
```

---

## 🚀 Panduan Menjalankan Secara Lokal

1. **Kloning atau buka direktori proyek**:
   ```bash
   cd "f:\Desktop\Repository Github\game-mario"
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Buat file `.env.local`**:
   Salin dari `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Isi dengan kredensial Supabase Anda:
   ```env
   VITE_SUPABASE_URL=https://proyek-anda.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
   ```
   *(Jika variabel ini dibiarkan kosong, aplikasi otomatis beralih ke Mode Offline Lab dengan Local Storage tanpa error)*.

4. **Jalankan server pengembangan**:
   ```bash
   npm run dev
   ```
   Buka peramban di `http://localhost:5173/`.

5. **Build untuk Produksi**:
   ```bash
   npm run build
   ```

---

## ☁️ Panduan Deployment Instan ke Vercel

1. **Push ke GitHub**:
   Pastikan seluruh kode telah di-push ke repositori GitHub Anda.

2. **Impor Proyek di Vercel**:
   - Masuk ke [vercel.com](https://vercel.com) dan klik **"Add New Project"**.
   - Pilih repositori `game-mario`.
   - Vercel akan otomatis mendeteksi konfigurasi Vite (`Build Command: npm run build`, `Output Directory: dist`).

3. **Atur Environment Variables**:
   Pada menu **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL` = `https://<project-id>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `<anon-key-supabase>`

4. **Klik Deploy**:
   Aplikasi siap diakses di domain `https://nama-proyek.vercel.app` secara instan!

---

## 🎮 Kontrol Permainan

| Aksi | Keyboard Desktop | Layar Sentuh (Tablet / HP) |
|---|---|---|
| Gerak Kiri | <kbd>A</kbd> atau <kbd>◀ Panah Kiri</kbd> | Tombol `◀` D-Pad |
| Gerak Kanan | <kbd>D</kbd> atau <kbd>▶ Panah Kanan</kbd> | Tombol `▶` D-Pad |
| Lompat | <kbd>Spasi</kbd> / <kbd>W</kbd> / <kbd>▲ Panah Atas</kbd> | Tombol `JUMP` Merah |
| Sundul Blok `[?]` | Lompat tepat mengenai bawah balok emas | - |
| Buka Proyektor | Klik tombol navigasi `📺 Layar Proyektor` | - |
| Mute Suara | Tombol `🔊` / `🔇` di HUD atas | - |

---

## 📚 Pembagian Materi 4 Dunia (Worlds)

- **World 1: Grassland Plains** — *Dasar Excel & Statistik*:
  - Pengenalan alamat sel (A1, B3), tanda awal formula (`=`), operator perkalian (`*`) dan pembagian (`/`), serta fungsi statistik dasar (`SUM`, `AVERAGE`, `MIN`, `MAX`).
- **World 2: Underground Pipes** — *Format Data, Sort & Filter*:
  - Kesalahan pengetikan manual teks "Rp", format Accounting/Currency, All Borders, penyortiran Sort A to Z / Largest to Smallest, dan penyaringan Filter corong data.
- **World 3: Lava Bridge** — *VLOOKUP & Kunci Sel Absolut ($)*:
  - Pencarian vertikal =VLOOKUP(), kunci gembok sel absolut tanda dollar (`$`) via tombol sakti `F4`, parameter Exact Match (`0` / `FALSE`), dan pemecahan galat `#N/A` atau `#####`.
- **World 4: Bowser's Castle** — *Logika IF & Algoritma Scratch*:
  - Fungsi keputusan bersyarat `=IF(kondisi; benar; salah)`, `COUNTIF()`, karakter Sprite, panggung Stage, balok pemicu `when green flag clicked`, perulangan `forever`, dan penanganan rotasi `left-right` serta `if on edge, bounce`.
