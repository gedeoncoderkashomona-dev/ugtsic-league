import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}));

import { drawBalancedTeams } from '@/lib/team-generator';
import { generateWhatsAppSummary } from '@/lib/pdf-generator';
import { processProfileAvatar } from '@/lib/image-processor';
import { savePlayerProfile } from '@/lib/supabase-service';
import { Match, MatchPresence, PlayerProfile, Position } from '@/types';

const positions: Position[] = ['goleiro', 'goleiro', 'zagueiro', 'zagueiro', 'meio-campo', 'meio-campo', 'atacante', 'atacante', 'meio-campo', 'zagueiro', 'atacante', 'meio-campo'];

const TEST_PLAYERS: PlayerProfile[] = Array.from({ length: 12 }, (_, idx) => ({
  id: `p${idx + 1}`,
  fullName: idx === 0 ? 'Gedeon Trigueiro' : idx === 6 ? 'Thiago Moura (QA)' : `Atleta ${idx + 1}`,
  nickname: idx === 0 ? 'Ged' : `Craque${idx + 1}`,
  shirtNumber: idx + 1,
  favoritePosition: positions[idx],
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  overallRating: 89 - idx,
  starsRating: Number((4.9 - idx * 0.05).toFixed(1)),
  matchesPlayed: 10,
  victories: 6,
  goals: idx === 0 ? 15 : 3,
  assists: idx === 6 ? 12 : 2,
  mvpCount: idx === 0 ? 4 : 0,
}));

const TEST_PRESENCES: MatchPresence[] = TEST_PLAYERS.map((player, idx) => ({
  id: `pr-${idx + 1}`,
  matchId: 'match-test-1',
  playerId: player.id,
  player,
  positionPreference: idx < 2 ? 'goleiro' : idx >= 10 ? 'reserva' : 'linha',
  team: idx % 2 === 0 ? 'azul' : 'vermelho',
  isReserve: idx >= 10,
  confirmedAt: '19:00',
}));

const TEST_MATCH: Match = {
  id: 'match-test-1',
  title: 'Pelada Oficial UGTSIC League',
  matchDate: 'Quarta-feira, 19:30',
  location: 'Arena Society Natal - Dunas',
  status: 'sorteado',
  teamAName: 'Time Azul (Galácticos)',
  teamBName: 'Time Vermelho (Guerreiros)',
  scoreTeamA: 0,
  scoreTeamB: 0,
  presences: TEST_PRESENCES,
  events: [],
};

describe('UGTSIC League — Testes Unitários das Regras de Negócio', () => {
  describe('1. Sorteio Automático e Balanceado de Times (team-generator)', () => {
    it('deve impedir sorteio quando houver menos de 8 jogadores confirmados', () => {
      const fewPresences = TEST_MATCH.presences.slice(0, 6);
      expect(() => drawBalancedTeams(fewPresences)).toThrow(
        'É necessário ter pelo menos 8 jogadores confirmados para o sorteio.'
      );
    });

    it('deve sortear no formato 4 na linha + 1 goleiro quando houver 10 jogadores (2 goleiros + 8 linha)', () => {
      const tenPresences = TEST_MATCH.presences.slice(0, 10);
      const result = drawBalancedTeams(tenPresences);

      expect(result.fieldSize).toBe(4);
      expect(result.teamAzul.starters.length).toBe(5);
      expect(result.teamVermelho.starters.length).toBe(5);
      expect(result.teamAzul.reserves.length).toBe(0);
      expect(result.teamVermelho.reserves.length).toBe(0);
    });

    it('deve sortear no formato 5 na linha + 1 goleiro e distribuir reservas quando houver 12 jogadores', () => {
      const twelvePresences = TEST_MATCH.presences;
      const result = drawBalancedTeams(twelvePresences);

      expect(result.fieldSize).toBe(5);
      const totalAlocados =
        result.teamAzul.starters.length +
        result.teamAzul.reserves.length +
        result.teamVermelho.starters.length +
        result.teamVermelho.reserves.length;

      expect(totalAlocados).toBe(12);
      expect(result.teamAzul.reserves.length).toBeLessThanOrEqual(3);
      expect(result.teamVermelho.reserves.length).toBeLessThanOrEqual(3);
    });

    it('deve respeitar o limite máximo de 3 reservas por time mesmo com elenco cheio (18 jogadores)', () => {
      const extraPresences: MatchPresence[] = Array.from({ length: 18 }, (_, i) => {
        const basePlayer = TEST_PLAYERS[i % TEST_PLAYERS.length];
        return {
          id: `pr-test-${i}`,
          matchId: 'match-1',
          playerId: `p-test-${i}`,
          player: {
            ...basePlayer,
            id: `p-test-${i}`,
            favoritePosition: i < 2 ? 'goleiro' : 'meio-campo',
          },
          positionPreference: i < 2 ? 'goleiro' : 'linha',
          isReserve: false,
          confirmedAt: '14:00',
        };
      });

      const result = drawBalancedTeams(extraPresences);
      expect(result.fieldSize).toBe(5);
      expect(result.teamAzul.reserves.length).toBeLessThanOrEqual(3);
      expect(result.teamVermelho.reserves.length).toBeLessThanOrEqual(3);
    });

    it('deve equilibrar o Overall médio entre Time Azul e Time Vermelho', () => {
      const result = drawBalancedTeams(TEST_MATCH.presences);
      const diff = Math.abs(result.teamAzul.avgRating - result.teamVermelho.avgRating);
      expect(diff).toBeLessThanOrEqual(5);
    });
  });

  describe('2. Geração de Resumo para WhatsApp & Súmula (pdf-generator)', () => {
    it('deve gerar resumo formatado com placar, gols, assistências e líder de estrelas', () => {
      const matchWithGoals: Match = {
        ...TEST_MATCH,
        scoreTeamA: 4,
        scoreTeamB: 3,
        events: [
          {
            id: 'ev-1',
            matchId: 'match-test-1',
            playerId: 'p1',
            playerName: 'Gedeon Trigueiro',
            assistPlayerId: 'p7',
            assistPlayerName: 'Thiago Moura (QA)',
            team: 'azul',
            minute: 12,
            type: 'gol',
          },
        ],
      };

      const summary = generateWhatsAppSummary(matchWithGoals, TEST_PLAYERS);
      expect(summary).toContain('UGTSIC LEAGUE');
      expect(summary).toContain('4 x 3');
      expect(summary).toContain('Gedeon Trigueiro');
      expect(summary).toContain('Thiago Moura');
      expect(summary).not.toContain('\uFFFD');
    });
  });

  describe('3. Validação de Foto de Perfil até 100MB (image-processor)', () => {
    it('deve rejeitar arquivos maiores que 100MB', async () => {
      const over100MBFile = {
        size: 101 * 1024 * 1024,
        name: 'huge-photo.raw',
        type: 'image/jpeg',
      } as unknown as File;

      await expect(processProfileAvatar(over100MBFile)).rejects.toThrow(
        'A imagem ultrapassa o limite máximo de 100MB.'
      );
    });
  });

  describe('4. Persistência de Foto e Perfil do Jogador (supabase-service)', () => {
    it('deve atualizar a foto e dados do jogador tanto na lista geral quanto nas presenças da partida', async () => {
      const updatedGedeon = {
        ...TEST_PLAYERS[0],
        fullName: 'Gedeon Trigueiro Oficial',
        avatarUrl: 'data:image/webp;base64,NOVA_FOTO_SALVA',
      };

      const { updatedPlayers, updatedMatch } = await savePlayerProfile(
        updatedGedeon,
        TEST_PLAYERS,
        TEST_MATCH
      );

      const playerInList = updatedPlayers.find((p) => p.id === updatedGedeon.id);
      const presenceInMatch = updatedMatch.presences.find((pr) => pr.playerId === updatedGedeon.id);

      expect(playerInList?.avatarUrl).toBe('data:image/webp;base64,NOVA_FOTO_SALVA');
      expect(presenceInMatch?.player.avatarUrl).toBe('data:image/webp;base64,NOVA_FOTO_SALVA');
      expect(presenceInMatch?.player.fullName).toBe('Gedeon Trigueiro Oficial');
    });
  });
});
