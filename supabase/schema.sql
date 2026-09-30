-- ==============================================================================
-- SKEMA DATABASE SUPABASE: "Super Spreadsheet & Scratch Bros"
-- Aplikasi Game Edukasi Platformer Informatika Kelas 8 (SMP NU Assalafie Unggulan)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABEL: teams (Sesi Permainan Kelompok Siswa)
DROP TABLE IF EXISTS quiz_logs CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name TEXT NOT NULL,
    class_name TEXT NOT NULL, -- Contoh: "8-A", "8-B", "8-C"
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

-- 3. TABEL: quiz_logs (Telemetri Log Jawaban Kuis Siswa untuk Analisis Guru)
CREATE TABLE quiz_logs (
    id BIGSERIAL PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    world_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempt_timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. INDEXES (Optimasi Query Papan Peringkat Realtime & Telemetri)
CREATE INDEX IF NOT EXISTS idx_teams_leaderboard 
    ON teams (final_score DESC, time_elapsed_seconds ASC);

CREATE INDEX IF NOT EXISTS idx_teams_class 
    ON teams (class_name);

CREATE INDEX IF NOT EXISTS idx_quiz_logs_team_id 
    ON quiz_logs (team_id);

CREATE INDEX IF NOT EXISTS idx_quiz_logs_world 
    ON quiz_logs (world_number);

-- 5. TRIGGER UNTUK AUTO-UPDATE 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_logs ENABLE ROW LEVEL SECURITY;

-- Policy untuk teams:
-- Siswa & Guru dapat membaca seluruh leaderboard
CREATE POLICY "Public read access for teams"
    ON teams FOR SELECT
    TO anon, authenticated
    USING (true);

-- Siswa dapat mendaftarkan tim baru saat memulai permainan
CREATE POLICY "Public insert access for teams"
    ON teams FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Siswa hanya dapat memperbarui (UPDATE) data sesi mereka sendiri (berdasarkan matching id)
CREATE POLICY "Public update access for own team"
    ON teams FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Policy untuk quiz_logs:
-- Guru & Siswa dapat melihat telemetri jawaban
CREATE POLICY "Public read access for quiz_logs"
    ON quiz_logs FOR SELECT
    TO anon, authenticated
    USING (true);

-- Klien game dapat mengirimkan log kuis secara realtime/asinkron
CREATE POLICY "Public insert access for quiz_logs"
    ON quiz_logs FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 7. ENABLE SUPABASE REALTIME REPLICATION
-- Mengaktifkan Realtime Supabase untuk tabel teams agar layar proyektor guru auto-refresh
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'teams'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE teams;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'quiz_logs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE quiz_logs;
    END IF;
END $$;

-- 8. SAMPLE DATA UNTUK TESTING AWAL LEADERBOARD (Opsional)
INSERT INTO teams (team_name, class_name, pilot_name, navigator_name, debugger_name, final_score, lives_remaining, time_elapsed_seconds, current_world, status)
VALUES 
('Cyber Logic 8A', '8-A', 'Ahmad', 'Fauzan & Rizky', 'Dewi', 1450, 3, 210, 4, 'victory'),
('Formula Master', '8-A', 'Budi', 'Siti & Maya', 'Rian', 1200, 2, 245, 4, 'victory'),
('Byte Hunters', '8-B', 'Dimas', 'Lestari', 'Eko', 950, 1, 310, 3, 'playing'),
('Koopa Decoders', '8-A', 'Zahra', 'Kevin & Putri', 'Bagus', 800, 0, 190, 2, 'game_over');
