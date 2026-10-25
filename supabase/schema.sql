CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    nickname TEXT,
    shirt_number INT DEFAULT 10,
    favorite_position TEXT NOT NULL CHECK (favorite_position IN ('goleiro', 'zagueiro', 'meio-campo', 'atacante')),
    avatar_url TEXT,
    overall_rating INT DEFAULT 0,
    stars_rating NUMERIC(3, 1) DEFAULT 0.0,
    matches_played INT DEFAULT 0,
    victories INT DEFAULT 0,
    goals INT DEFAULT 0,
    assists INT DEFAULT 0,
    mvp_count INT DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.matches (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Pelada Oficial UGTSIC League',
    match_date TEXT NOT NULL DEFAULT 'Quarta-feira, 19:30',
    location TEXT NOT NULL DEFAULT 'Arena Society Natal - RN',
    status TEXT NOT NULL DEFAULT 'convocando' CHECK (status IN ('convocando', 'sorteado', 'em_andamento', 'finalizado')),
    team_a_name TEXT NOT NULL DEFAULT 'Time Azul',
    team_b_name TEXT NOT NULL DEFAULT 'Time Vermelho',
    score_team_a INT DEFAULT 0,
    score_team_b INT DEFAULT 0,
    presences_json JSONB DEFAULT '[]'::jsonb,
    events_json JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.match_presences (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    position_preference TEXT NOT NULL DEFAULT 'linha' CHECK (position_preference IN ('goleiro', 'linha', 'reserva')),
    team TEXT CHECK (team IN ('azul', 'vermelho')),
    is_reserve BOOLEAN DEFAULT FALSE,
    confirmed_at TEXT,
    UNIQUE(match_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.match_events (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    player_id TEXT NOT NULL,
    player_name TEXT NOT NULL,
    assist_player_id TEXT,
    assist_player_name TEXT,
    team TEXT NOT NULL CHECK (team IN ('azul', 'vermelho')),
    minute INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.match_votes (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    voter_id TEXT NOT NULL,
    target_player_id TEXT NOT NULL,
    stars NUMERIC(2, 1) NOT NULL CHECK (stars >= 1.0 AND stars <= 5.0),
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_presences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso total profiles UGTSIC" ON public.profiles;
CREATE POLICY "Acesso total profiles UGTSIC" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total matches UGTSIC" ON public.matches;
CREATE POLICY "Acesso total matches UGTSIC" ON public.matches FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total presences UGTSIC" ON public.match_presences;
CREATE POLICY "Acesso total presences UGTSIC" ON public.match_presences FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total events UGTSIC" ON public.match_events;
CREATE POLICY "Acesso total events UGTSIC" ON public.match_events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total votes UGTSIC" ON public.match_votes;
CREATE POLICY "Acesso total votes UGTSIC" ON public.match_votes FOR ALL USING (true) WITH CHECK (true);
