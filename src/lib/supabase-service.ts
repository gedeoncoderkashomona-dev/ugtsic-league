import { supabase, isSupabaseConfigured } from './supabase';
import { PlayerProfile, Match, PreferencePosition } from '@/types';
import { EMPTY_USER_TEMPLATE } from './mock-data';

const STORAGE_KEYS = {
  PLAYERS: 'ugtsic_prod_v1_players',
  MATCH: 'ugtsic_prod_v1_match',
  CURRENT_USER: 'ugtsic_prod_v1_current_user',
  UI_STATE: 'ugtsic_prod_v1_ui_state',
};

const LEGACY_KEYS = [
  'ugtsic_players_v2',
  'ugtsic_match_v2',
  'ugtsic_current_user_v2',
  'ugtsic_ui_state_v2',
];

export interface PersistedUIState {
  hasCompletedOnboarding?: boolean;
  hasSeenTutorial?: boolean;
  currentTab?: 'home' | 'sorteio' | 'placar' | 'rankings';
  isProfileOpen?: boolean;
  votingPlayerId?: string | null;
  previewPlayerId?: string | null;
  rankingPosFilter?: string;
  rankingSortBy?: 'estrelas' | 'gols' | 'assistencias';
  scoreGoalTeam?: 'azul' | 'vermelho';
  scoreScorerId?: string;
  scoreAssistId?: string;
  scoreMinute?: number;
  drawPreference?: PreferencePosition;
}

function cleanupLegacyStorage() {
  if (typeof window === 'undefined') return;
  try {
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore storage access errors
  }
}

export function loadUIState(): PersistedUIState {
  if (typeof window === 'undefined') return {};
  cleanupLegacyStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UI_STATE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveUIState(partial: Partial<PersistedUIState>) {
  if (typeof window === 'undefined') return;
  try {
    const current = loadUIState();
    const next = { ...current, ...partial };
    localStorage.setItem(STORAGE_KEYS.UI_STATE, JSON.stringify(next));
  } catch (e) {
    console.warn('Erro ao salvar estado de interface:', e);
  }
}

function mapRowToProfile(row: any): PlayerProfile {
  return {
    id: String(row.id),
    fullName: row.full_name || '',
    nickname: row.nickname || '',
    shirtNumber: Number(row.shirt_number) || 10,
    favoritePosition: row.favorite_position || 'meio-campo',
    avatarUrl: row.avatar_url || '',
    overallRating: Number(row.overall_rating) || 80,
    starsRating: Number(row.stars_rating) || 5.0,
    matchesPlayed: Number(row.matches_played) || 0,
    victories: Number(row.victories) || 0,
    goals: Number(row.goals) || 0,
    assists: Number(row.assists) || 0,
    mvpCount: Number(row.mvp_count) || 0,
    isAdmin: Boolean(row.is_admin),
  };
}

function mapProfileToRow(p: PlayerProfile) {
  return {
    id: p.id,
    full_name: p.fullName,
    nickname: p.nickname,
    shirt_number: p.shirtNumber,
    favorite_position: p.favoritePosition,
    avatar_url: p.avatarUrl,
    overall_rating: p.overallRating,
    stars_rating: p.starsRating,
    matches_played: p.matchesPlayed,
    victories: p.victories,
    goals: p.goals,
    assists: p.assists,
    mvp_count: p.mvpCount,
    is_admin: Boolean(p.isAdmin),
    updated_at: new Date().toISOString(),
  };
}

export async function fetchRemoteStateFromSupabase(
  defaultMatch: Match
): Promise<{ players: PlayerProfile[]; match: Match } | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const [{ data: profileRows, error: pErr }, { data: matchRow, error: mErr }] =
      await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: true }),
        supabase.from('matches').select('*').eq('id', defaultMatch.id).maybeSingle(),
      ]);

    if (pErr) {
      console.warn('Erro ao carregar perfis do Supabase:', pErr.message);
      return null;
    }

    const players: PlayerProfile[] = (profileRows || []).map(mapRowToProfile);
    const playerMap = new Map(players.map((p) => [p.id, p]));

    let match: Match = defaultMatch;
    if (!mErr && matchRow) {
      const rawPresences = Array.isArray(matchRow.presences_json)
        ? matchRow.presences_json
        : [];
      const rawEvents = Array.isArray(matchRow.events_json) ? matchRow.events_json : [];

      match = {
        id: matchRow.id,
        title: matchRow.title || defaultMatch.title,
        matchDate: matchRow.match_date || defaultMatch.matchDate,
        location: matchRow.location || defaultMatch.location,
        status: matchRow.status || 'convocando',
        teamAName: matchRow.team_a_name || defaultMatch.teamAName,
        teamBName: matchRow.team_b_name || defaultMatch.teamBName,
        scoreTeamA: Number(matchRow.score_team_a) || 0,
        scoreTeamB: Number(matchRow.score_team_b) || 0,
        presences: rawPresences
          .map((pr: any) => {
            const freshPlayer = playerMap.get(pr.playerId) || pr.player;
            return freshPlayer ? { ...pr, player: freshPlayer } : null;
          })
          .filter(Boolean),
        events: rawEvents,
      };
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
      localStorage.setItem(STORAGE_KEYS.MATCH, JSON.stringify(match));
    }

    return { players, match };
  } catch (err) {
    console.warn('Falha ao buscar dados remotos do Supabase:', err);
    return null;
  }
}

export async function savePlayerProfile(
  updatedProfile: PlayerProfile,
  allPlayers: PlayerProfile[],
  currentMatch: Match
): Promise<{
  savedProfile: PlayerProfile;
  updatedPlayers: PlayerProfile[];
  updatedMatch: Match;
  syncedWithSupabase: boolean;
}> {
  const finalProfile: PlayerProfile = {
    ...updatedProfile,
    id:
      updatedProfile.id && updatedProfile.id.trim() !== ''
        ? updatedProfile.id
        : `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };

  const exists = allPlayers.some((p) => p.id === finalProfile.id);
  const updatedPlayers = exists
    ? allPlayers.map((p) => (p.id === finalProfile.id ? finalProfile : p))
    : [...allPlayers, finalProfile];

  const updatedPresences = currentMatch.presences.map((pr) =>
    pr.playerId === finalProfile.id ? { ...pr, player: finalProfile } : pr
  );
  const updatedMatch: Match = {
    ...currentMatch,
    presences: updatedPresences,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(finalProfile));
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(updatedPlayers));
      localStorage.setItem(STORAGE_KEYS.MATCH, JSON.stringify(updatedMatch));
    } catch (e) {
      console.warn('Erro ao salvar no LocalStorage:', e);
    }
  }

  let syncedWithSupabase = false;
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('profiles').upsert(mapProfileToRow(finalProfile));
      if (!error) {
        syncedWithSupabase = true;
      }
    } catch (err) {
      console.warn('Erro ao sincronizar perfil com Supabase:', err);
    }
  }

  return { savedProfile: finalProfile, updatedPlayers, updatedMatch, syncedWithSupabase };
}

export function loadPersistedState(
  defaultPlayers: PlayerProfile[],
  defaultMatch: Match
): {
  players: PlayerProfile[];
  match: Match;
  currentUser: PlayerProfile;
} {
  if (typeof window === 'undefined') {
    return {
      players: defaultPlayers,
      match: defaultMatch,
      currentUser: defaultPlayers[0] || EMPTY_USER_TEMPLATE,
    };
  }

  cleanupLegacyStorage();

  try {
    const rawPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    const rawMatch = localStorage.getItem(STORAGE_KEYS.MATCH);
    const rawUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

    const players: PlayerProfile[] = rawPlayers ? JSON.parse(rawPlayers) : defaultPlayers;
    const currentUser: PlayerProfile = rawUser
      ? JSON.parse(rawUser)
      : players[0] || EMPTY_USER_TEMPLATE;
    let match: Match = rawMatch ? JSON.parse(rawMatch) : defaultMatch;

    const playerMap = new Map(players.map((p) => [p.id, p]));
    if (currentUser && currentUser.id) {
      playerMap.set(currentUser.id, currentUser);
    }

    match = {
      ...match,
      presences: match.presences.map((pr) => {
        const freshPlayer = playerMap.get(pr.playerId);
        return freshPlayer ? { ...pr, player: freshPlayer } : pr;
      }),
    };

    return { players, match, currentUser };
  } catch {
    return {
      players: defaultPlayers,
      match: defaultMatch,
      currentUser: defaultPlayers[0] || EMPTY_USER_TEMPLATE,
    };
  }
}

export async function persistMatchAndPlayers(
  match: Match,
  players: PlayerProfile[],
  currentUser?: PlayerProfile
) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.MATCH, JSON.stringify(match));
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
      if (currentUser && currentUser.id) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      }
    } catch (e) {
      console.warn('Falha ao persistir estado local:', e);
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const validPlayers = players.filter((p) => p.id && p.fullName.trim() !== '');
      if (validPlayers.length > 0) {
        await supabase.from('profiles').upsert(validPlayers.map(mapProfileToRow));
      }

      await supabase.from('matches').upsert({
        id: match.id,
        title: match.title,
        match_date: match.matchDate,
        location: match.location,
        status: match.status,
        team_a_name: match.teamAName,
        team_b_name: match.teamBName,
        score_team_a: match.scoreTeamA,
        score_team_b: match.scoreTeamB,
        presences_json: match.presences,
        events_json: match.events,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Erro ao sincronizar partida com Supabase:', err);
    }
  }
}
