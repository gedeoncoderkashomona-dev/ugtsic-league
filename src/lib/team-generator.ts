import { MatchPresence, TeamColor } from '@/types';

export interface DrawResult {
  teamAzul: {
    starters: MatchPresence[];
    reserves: MatchPresence[];
    avgRating: number;
    goalkeeper?: MatchPresence;
  };
  teamVermelho: {
    starters: MatchPresence[];
    reserves: MatchPresence[];
    avgRating: number;
    goalkeeper?: MatchPresence;
  };
  fieldSize: 4 | 5; // 4 na linha + 1 gol OU 5 na linha + 1 gol
}

/**
 * Algoritmo de Sorteio Inteligente da UGTSIC League
 * Distribui goleiros, zagueiros, meias e atacantes de forma balanceada
 * usando o rating e estrelas dos jogadores para evitar times desiguais.
 */
export function drawBalancedTeams(presences: MatchPresence[]): DrawResult {
  if (presences.length < 8) {
    throw new Error('É necessário ter pelo menos 8 jogadores confirmados para o sorteio.');
  }

  // Clona a lista para não mutar o original
  const pool = [...presences];

  // 1. Identificar Goleiros declarados
  const declaredGoalkeepers = pool.filter(
    (p) => p.positionPreference === 'goleiro' || p.player.favoritePosition === 'goleiro'
  );
  const outfieldPlayers = pool.filter(
    (p) => !declaredGoalkeepers.some((gk) => gk.id === p.id)
  );

  let gkAzul: MatchPresence | undefined;
  let gkVermelho: MatchPresence | undefined;

  // Embaralhar para garantir variação a cada sorteio
  declaredGoalkeepers.sort(() => Math.random() - 0.5);
  outfieldPlayers.sort(() => Math.random() - 0.5);

  if (declaredGoalkeepers.length >= 2) {
    gkAzul = declaredGoalkeepers[0];
    gkVermelho = declaredGoalkeepers[1];
    // Se houver mais de 2 goleiros, os excedentes vão para os jogadores de linha
    for (let i = 2; i < declaredGoalkeepers.length; i++) {
      outfieldPlayers.push(declaredGoalkeepers[i]);
    }
  } else if (declaredGoalkeepers.length === 1) {
    gkAzul = declaredGoalkeepers[0];
    // Sorteia 1 jogador de linha para ser o goleiro do outro time
    gkVermelho = outfieldPlayers.pop();
  } else {
    // Nenhum goleiro declarado: sorteia 2 da lista geral
    gkAzul = outfieldPlayers.pop();
    gkVermelho = outfieldPlayers.pop();
  }

  // 2. Determinar se será 4 na linha ou 5 na linha
  // Total disponível para linha = outfieldPlayers.length
  // Ideal: 5 na linha cada (10 jogadores) + até 3 reservas cada (total 16 jogadores)
  // Se tiver menos de 10 na linha (8 a 9), joga-se com 4 na linha (8 jogadores)
  const totalOutfield = outfieldPlayers.length;
  const fieldSize: 4 | 5 = totalOutfield >= 10 ? 5 : 4;
  const startersNeededPerTeam = fieldSize;

  // 3. Ordenar jogadores de linha por Rating / Estrelas decrescente para balanceamento "Snake Draft"
  outfieldPlayers.sort(
    (a, b) => b.player.overallRating - a.player.overallRating + (Math.random() * 4 - 2)
  );

  const startersAzul: MatchPresence[] = [];
  const startersVermelho: MatchPresence[] = [];
  const reservesAzul: MatchPresence[] = [];
  const reservesVermelho: MatchPresence[] = [];

  // Distribuição alternada (Snake: Azul, Vermelho, Vermelho, Azul...)
  let toggle = true;

  while (
    outfieldPlayers.length > 0 &&
    (startersAzul.length < startersNeededPerTeam || startersVermelho.length < startersNeededPerTeam)
  ) {
    const player = outfieldPlayers.shift()!;
    if (toggle) {
      if (startersAzul.length < startersNeededPerTeam) {
        startersAzul.push(player);
      } else {
        startersVermelho.push(player);
      }
    } else {
      if (startersVermelho.length < startersNeededPerTeam) {
        startersVermelho.push(player);
      } else {
        startersAzul.push(player);
      }
    }
    toggle = !toggle;
  }

  // O restante dos jogadores vão para o banco de reservas (até 3 por time)
  let reserveToggle = true;
  while (outfieldPlayers.length > 0) {
    const player = outfieldPlayers.shift()!;
    if (reserveToggle) {
      if (reservesAzul.length < 3) {
        reservesAzul.push(player);
      } else if (reservesVermelho.length < 3) {
        reservesVermelho.push(player);
      }
    } else {
      if (reservesVermelho.length < 3) {
        reservesVermelho.push(player);
      } else if (reservesAzul.length < 3) {
        reservesAzul.push(player);
      }
    }
    reserveToggle = !reserveToggle;
  }

  // Atribuir times e flags
  if (gkAzul) {
    gkAzul.team = 'azul';
    gkAzul.isReserve = false;
  }
  if (gkVermelho) {
    gkVermelho.team = 'vermelho';
    gkVermelho.isReserve = false;
  }

  startersAzul.forEach((p) => {
    p.team = 'azul';
    p.isReserve = false;
  });
  reservesAzul.forEach((p) => {
    p.team = 'azul';
    p.isReserve = true;
  });

  startersVermelho.forEach((p) => {
    p.team = 'vermelho';
    p.isReserve = false;
  });
  reservesVermelho.forEach((p) => {
    p.team = 'vermelho';
    p.isReserve = true;
  });

  const allAzul = [...(gkAzul ? [gkAzul] : []), ...startersAzul, ...reservesAzul];
  const allVermelho = [...(gkVermelho ? [gkVermelho] : []), ...startersVermelho, ...reservesVermelho];

  const avgRatingAzul =
    allAzul.reduce((sum, p) => sum + p.player.overallRating, 0) / (allAzul.length || 1);
  const avgRatingVermelho =
    allVermelho.reduce((sum, p) => sum + p.player.overallRating, 0) / (allVermelho.length || 1);

  return {
    teamAzul: {
      starters: gkAzul ? [gkAzul, ...startersAzul] : startersAzul,
      reserves: reservesAzul,
      avgRating: Math.round(avgRatingAzul),
      goalkeeper: gkAzul,
    },
    teamVermelho: {
      starters: gkVermelho ? [gkVermelho, ...startersVermelho] : startersVermelho,
      reserves: reservesVermelho,
      avgRating: Math.round(avgRatingVermelho),
      goalkeeper: gkVermelho,
    },
    fieldSize,
  };
}

