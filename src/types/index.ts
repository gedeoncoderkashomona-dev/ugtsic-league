export type Position = 'goleiro' | 'zagueiro' | 'meio-campo' | 'atacante';
export type PreferencePosition = 'goleiro' | 'linha' | 'reserva' | 'tanto_faz';
export type MatchStatus = 'convocando' | 'sorteado' | 'em_andamento' | 'finalizado';
export type MatchPeriod = 'nao_iniciado' | '1_tempo' | 'intervalo' | '2_tempo' | 'encerrado';
export type TeamColor = 'azul' | 'vermelho';

export interface MatchTimerState {
  period: MatchPeriod;
  halfDurationMinutes: number; // default 25 min por tempo
  elapsedSeconds: number;      // tempo regulamentar corrido no tempo atual
  stoppageSeconds: number;     // tempo perdido em pausas a recuperar como acréscimo
  isRunning: boolean;          // bola rolando
  isPaused: boolean;           // jogo pausado (dispara cronômetro de pausa/acréscimo)
  lastTickTimestamp?: number;
}

export interface PlayerProfile {
  id: string;
  fullName: string;
  nickname: string;
  shirtNumber: number;
  favoritePosition: Position;
  avatarUrl: string;
  overallRating: number; // e.g., 78 - 94 (FIFA style rating)
  starsRating: number;   // 1.0 to 5.0
  matchesPlayed: number;
  victories: number;
  goals: number;
  assists: number;
  mvpCount: number;
  isAdmin?: boolean;
}

export interface MatchPresence {
  id: string;
  matchId: string;
  playerId: string;
  player: PlayerProfile;
  positionPreference: PreferencePosition;
  team?: TeamColor | null;
  isReserve: boolean;
  confirmedAt: string;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  playerId: string;
  playerName: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
  team: TeamColor;
  minute: number;
  type: 'gol';
}

export interface MatchVote {
  id: string;
  matchId: string;
  voterId: string;
  targetPlayerId: string;
  stars: number; // 1 to 5
  category?: 'melhor_goleiro' | 'melhor_zagueiro' | 'melhor_meio' | 'melhor_atacante' | 'mvp';
  createdAt: string;
}

export interface Match {
  id: string;
  title: string;
  matchDate: string;
  location: string;
  status: MatchStatus;
  teamAName: string;
  teamBName: string;
  scoreTeamA: number;
  scoreTeamB: number;
  presences: MatchPresence[];
  events: MatchEvent[];
  votes?: MatchVote[];
  timer?: MatchTimerState;
}

