import { PlayerProfile, Match } from '@/types';

export const EMPTY_USER_TEMPLATE: PlayerProfile = {
  id: '',
  fullName: '',
  nickname: '',
  shirtNumber: 10,
  favoritePosition: 'meio-campo',
  avatarUrl: '',
  overallRating: 80,
  starsRating: 5.0,
  matchesPlayed: 0,
  victories: 0,
  goals: 0,
  assists: 0,
  mvpCount: 0,
  isAdmin: false,
};

export const INITIAL_PLAYERS: PlayerProfile[] = [];

export const INITIAL_MATCH: Match = {
  id: 'match-ugtsic-1',
  title: 'Pelada Oficial UGTSIC League',
  matchDate: 'Quarta-feira, 19:30',
  location: 'Arena Society Natal - RN',
  status: 'convocando',
  teamAName: 'Time Azul (Galácticos)',
  teamBName: 'Time Vermelho (Guerreiros)',
  scoreTeamA: 0,
  scoreTeamB: 0,
  presences: [],
  events: [],
};
