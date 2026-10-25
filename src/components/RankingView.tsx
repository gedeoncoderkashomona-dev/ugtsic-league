'use client';

import React, { useState, useEffect } from 'react';
import { PlayerProfile, Position } from '@/types';
import { FOOTBALL_AVATARS } from '@/lib/football-avatars';
import { loadUIState, saveUIState } from '@/lib/supabase-service';
import { Trophy, FileDown, Award, Star, ArrowUpDown } from 'lucide-react';
import {
  SoccerBallIcon,
  GlovesIcon,
  JerseyIcon,
  PitchIcon,
  CleatsIcon,
} from './FootballIcons';
import { generateRankingPDF } from '@/lib/pdf-generator';

interface RankingViewProps {
  players: PlayerProfile[];
  onSelectPlayer: (player: PlayerProfile) => void;
  onOpenVoting: (player: PlayerProfile) => void;
}

type FilterPos = 'todos' | Position;

export const RankingView: React.FC<RankingViewProps> = ({
  players,
  onSelectPlayer,
  onOpenVoting,
}) => {
  const [posFilter, setPosFilterState] = useState<FilterPos>('todos');
  const [sortBy, setSortByState] = useState<'estrelas' | 'gols' | 'assistencias'>('estrelas');

  useEffect(() => {
    const ui = loadUIState();
    if (ui.rankingPosFilter) setPosFilterState(ui.rankingPosFilter as FilterPos);
    if (ui.rankingSortBy) setSortByState(ui.rankingSortBy);
  }, []);

  const setPosFilter = (f: FilterPos) => {
    setPosFilterState(f);
    saveUIState({ rankingPosFilter: f });
  };

  const setSortBy = (s: 'estrelas' | 'gols' | 'assistencias') => {
    setSortByState(s);
    saveUIState({ rankingSortBy: s });
  };

  const evaluatedPlayers = players.filter(
    (p) => p.starsRating > 0 || p.goals > 0 || p.assists > 0 || p.matchesPlayed > 0
  );

  const byStars = [...evaluatedPlayers]
    .filter((p) => p.starsRating > 0)
    .sort((a, b) => b.starsRating - a.starsRating || b.goals - a.goals);
  const byGoals = [...evaluatedPlayers]
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals || b.starsRating - a.starsRating);
  const byAssists = [...evaluatedPlayers]
    .filter((p) => p.assists > 0)
    .sort((a, b) => b.assists - a.assists || b.starsRating - a.starsRating);

  const mvpLeader = byStars[0];
  const topScorer = byGoals[0];
  const topPlaymaker = byAssists[0];
  const bestGoalkeeper = byStars.find((p) => p.favoritePosition === 'goleiro');
  const bestDefender = byStars.find((p) => p.favoritePosition === 'zagueiro');
  const bestMidfielder = byStars.find((p) => p.favoritePosition === 'meio-campo');

  const awards = [
    {
      title: 'Craque Geral (MVP)',
      player: mvpLeader,
      statLabel: mvpLeader ? `${mvpLeader.starsRating.toFixed(1)} ★` : 'Em disputa',
      Icon: Trophy,
    },
    {
      title: 'Artilheiro',
      player: topScorer,
      statLabel: topScorer ? `${topScorer.goals} Gols` : 'Em disputa',
      Icon: SoccerBallIcon,
    },
    {
      title: 'Líder de Assistências',
      player: topPlaymaker,
      statLabel: topPlaymaker ? `${topPlaymaker.assists} Assist.` : 'Em disputa',
      Icon: CleatsIcon,
    },
    {
      title: 'Melhor Goleiro',
      player: bestGoalkeeper,
      statLabel: bestGoalkeeper ? `${bestGoalkeeper.starsRating.toFixed(1)} ★` : 'Em disputa',
      Icon: GlovesIcon,
    },
    {
      title: 'Melhor Zagueiro',
      player: bestDefender,
      statLabel: bestDefender ? `${bestDefender.starsRating.toFixed(1)} ★` : 'Em disputa',
      Icon: JerseyIcon,
    },
    {
      title: 'Melhor Meio-Campo',
      player: bestMidfielder,
      statLabel: bestMidfielder ? `${bestMidfielder.starsRating.toFixed(1)} ★` : 'Em disputa',
      Icon: PitchIcon,
    },
  ];

  const filteredPlayers = players
    .filter((p) => (posFilter === 'todos' ? true : p.favoritePosition === posFilter))
    .sort((a, b) => {
      if (sortBy === 'gols') return b.goals - a.goals || b.starsRating - a.starsRating;
      if (sortBy === 'assistencias') return b.assists - a.assists || b.starsRating - a.starsRating;
      return b.starsRating - a.starsRating || b.goals - a.goals || b.assists - a.assists;
    });

  const posMap: Record<Position, { short: string; name: string; color: string }> = {
    goleiro: { short: 'GOL', name: 'Goleiro', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    zagueiro: { short: 'ZAG', name: 'Zagueiro', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    'meio-campo': { short: 'MEI', name: 'Meio-Campo', color: 'text-sky-700 bg-sky-50 border-sky-200' },
    atacante: { short: 'ATA', name: 'Atacante', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  };

  const totalGoals = players.reduce((acc, p) => acc + p.goals, 0);
  const totalAssists = players.reduce((acc, p) => acc + p.assists, 0);
  const ratedOnly = players.filter((p) => p.starsRating > 0);
  const avgStars =
    ratedOnly.length > 0
      ? (ratedOnly.reduce((acc, p) => acc + p.starsRating, 0) / ratedOnly.length).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      {/* CABEÇALHO SÓBRIO DA TABELA DE CLASSIFICAÇÃO E ESTATÍSTICAS */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Trophy className="w-4 h-4" />
              <span>Classificação Oficial • UGTSIC League</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
              Tabela Geral de Desempenho & Artilharia
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Pontuação zerada no cadastro. As notas e estatísticas são contabilizadas apenas com as partidas realizadas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="grid grid-cols-4 gap-2 bg-slate-800/90 border border-slate-700 rounded-xl p-2.5 text-center min-w-[260px]">
              <div className="px-2">
                <span className="text-sm sm:text-base font-mono font-black text-white block">
                  {players.length}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Atletas</span>
              </div>
              <div className="px-2 border-l border-slate-700">
                <span className="text-sm sm:text-base font-mono font-black text-emerald-400 block">
                  {totalGoals}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Gols</span>
              </div>
              <div className="px-2 border-l border-slate-700">
                <span className="text-sm sm:text-base font-mono font-black text-sky-400 block">
                  {totalAssists}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Assist.</span>
              </div>
              <div className="px-2 border-l border-slate-700">
                <span className="text-sm sm:text-base font-mono font-black text-amber-400 block">
                  {avgStars}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Média ★</span>
              </div>
            </div>

            <button
              onClick={() => generateRankingPDF(players)}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-sm shrink-0"
            >
              <FileDown className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUADRO DE LÍDERES POR CATEGORIA (SÓ EXIBE QUEM JÁ TEM PONTUAÇÃO REAL) */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>Líderes da Temporada por Função</span>
          </h2>
          <span className="text-[11px] text-slate-500">
            Atualizado conforme súmula e avaliação pós-jogo
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {awards.map((item, idx) => {
            const p = item.player;
            const Icon = item.Icon;
            const cleanName = p ? p.fullName.replace(/\s*\(.*?\)\s*/g, '') : '';

            return (
              <div
                key={idx}
                onClick={() => p && onSelectPlayer(p)}
                className={`bg-white rounded-xl p-3 border border-slate-200 flex flex-col justify-between transition-colors ${
                  p ? 'cursor-pointer hover:border-slate-400' : 'opacity-75'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-bold uppercase text-slate-500 truncate">
                    {item.title}
                  </span>
                  <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>

                {p ? (
                  <div className="flex items-center gap-2.5">
                    <img
                      src={p.avatarUrl || FOOTBALL_AVATARS[0].url}
                      alt={cleanName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-300 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 truncate">{cleanName}</h4>
                      <span className="text-[11px] font-mono font-bold text-emerald-700 block">
                        {item.statLabel}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-1.5">
                    <span className="text-xs font-bold text-slate-400 block">Sem líder</span>
                    <span className="text-[10px] text-slate-400">Aguardando partida</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TABELA OFICIAL DE CLASSIFICAÇÃO (DESIGN EDITORIAL ESPORTIVO LIMPO E TABULAR) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Barra de Filtros e Ordenação */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1">
            {(
              [
                { id: 'todos', label: 'Todos' },
                { id: 'goleiro', label: 'Goleiros' },
                { id: 'zagueiro', label: 'Zagueiros' },
                { id: 'meio-campo', label: 'Meio-Campo' },
                { id: 'atacante', label: 'Atacantes' },
              ] as { id: FilterPos; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setPosFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  posFilter === f.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-semibold mr-1">Critério:</span>
            {[
              { id: 'estrelas', label: 'Nota (★)' },
              { id: 'gols', label: 'Gols (G)' },
              { id: 'assistencias', label: 'Assist. (A)' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id as 'estrelas' | 'gols' | 'assistencias')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors ${
                  sortBy === s.id
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {filteredPlayers.length === 0 ? (
          <div className="py-14 px-4 text-center">
            <p className="text-sm font-bold text-slate-700">Nenhum atleta encontrado nesta posição</p>
            <p className="text-xs text-slate-500 mt-1">
              Assim que os integrantes se cadastrarem, a listagem oficial aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/80 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3 pl-4 pr-2 w-12 text-center">POS</th>
                  <th className="py-3 px-3">ATLETA</th>
                  <th className="py-3 px-2 text-center hidden sm:table-cell">FUNÇÃO</th>
                  <th className="py-3 px-2 text-center w-14" title="Jogos Disputados">J</th>
                  <th className="py-3 px-2 text-center w-14" title="Vitórias">V</th>
                  <th className="py-3 px-2 text-center w-14" title="Gols Marcados">G</th>
                  <th className="py-3 px-2 text-center w-14" title="Assistências">A</th>
                  <th className="py-3 px-2 text-center w-16 hidden md:table-cell" title="Overall Rating">OVR</th>
                  <th className="py-3 px-3 text-center w-28">NOTA</th>
                  <th className="py-3 pl-2 pr-4 text-right w-24">AVALIAÇÃO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredPlayers.map((p, index) => {
                  const posInfo = posMap[p.favoritePosition] || posMap['meio-campo'];
                  const roleMatch = p.fullName.match(/\((.*?)\)/);
                  const sectorRole = roleMatch ? roleMatch[1] : '';
                  const cleanName = p.fullName.replace(/\s*\(.*?\)\s*/g, '');
                  const hasStats =
                    p.starsRating > 0 || p.goals > 0 || p.assists > 0 || p.matchesPlayed > 0;

                  const rankStyle =
                    hasStats && index === 0
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : hasStats && index === 1
                      ? 'bg-slate-300 text-slate-900 font-black'
                      : hasStats && index === 2
                      ? 'bg-amber-700 text-white font-black'
                      : 'text-slate-500 font-mono font-bold';

                  return (
                    <tr
                      key={p.id}
                      onClick={() => onSelectPlayer(p)}
                      className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                    >
                      {/* Coluna 1: Posição */}
                      <td className="py-3 pl-4 pr-2 text-center">
                        <span
                          className={`w-6 h-6 rounded text-xs inline-flex items-center justify-center ${rankStyle}`}
                        >
                          {hasStats ? `${index + 1}` : '-'}
                        </span>
                      </td>

                      {/* Coluna 2: Atleta */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3 min-w-[170px]">
                          <img
                            src={p.avatarUrl || FOOTBALL_AVATARS[0].url}
                            alt={cleanName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-300 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 truncate text-xs sm:text-sm">
                                {cleanName}
                              </span>
                              <span className="text-[11px] font-mono font-bold text-slate-400">
                                #{p.shirtNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <span>&quot;{p.nickname}&quot;</span>
                              {sectorRole && (
                                <span className="text-slate-400 hidden md:inline">• {sectorRole}</span>
                              )}
                              <span
                                className={`sm:hidden text-[9px] font-bold px-1.5 py-0.2 rounded border ${posInfo.color}`}
                              >
                                {posInfo.short}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Coluna 3: Função */}
                      <td className="py-3 px-2 text-center hidden sm:table-cell">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${posInfo.color}`}
                        >
                          {posInfo.short}
                        </span>
                      </td>

                      {/* Coluna 4: Jogos (J) */}
                      <td className="py-3 px-2 text-center font-mono text-xs font-semibold text-slate-600">
                        {p.matchesPlayed || 0}
                      </td>

                      {/* Coluna 5: Vitórias (V) */}
                      <td className="py-3 px-2 text-center font-mono text-xs font-semibold text-slate-600">
                        {p.victories || 0}
                      </td>

                      {/* Coluna 6: Gols (G) */}
                      <td className="py-3 px-2 text-center font-mono text-xs font-black text-emerald-700">
                        {p.goals || 0}
                      </td>

                      {/* Coluna 7: Assistências (A) */}
                      <td className="py-3 px-2 text-center font-mono text-xs font-black text-sky-700">
                        {p.assists || 0}
                      </td>

                      {/* Coluna 8: OVR */}
                      <td className="py-3 px-2 text-center font-mono text-xs font-bold text-slate-700 hidden md:table-cell">
                        {p.overallRating > 0 ? p.overallRating : '—'}
                      </td>

                      {/* Coluna 9: Nota (Estrelas) */}
                      <td className="py-3 px-3 text-center">
                        {p.starsRating > 0 ? (
                          <span className="inline-flex items-center gap-1 font-mono text-xs font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {p.starsRating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-slate-400">0.0</span>
                        )}
                      </td>

                      {/* Coluna 10: Botão Avaliar */}
                      <td className="py-3 pl-2 pr-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenVoting(p);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition-colors whitespace-nowrap"
                        >
                          Avaliar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
