'use client';

import React, { useState, useEffect } from 'react';
import { PlayerProfile, Position } from '@/types';
import { StarRating } from './StarRating';
import { loadUIState, saveUIState } from '@/lib/supabase-service';
import { Trophy, Star, FileDown, Award } from 'lucide-react';
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

  // Cálculo automático dos 6 Troféus Oficiais solicitados
  const byStars = [...players].sort(
    (a, b) => b.starsRating - a.starsRating || b.overallRating - a.overallRating
  );
  const byGoals = [...players].sort((a, b) => b.goals - a.goals);
  const byAssists = [...players].sort((a, b) => b.assists - a.assists);

  const mvpLeader = byStars[0];
  const topScorer = byGoals[0];
  const topPlaymaker = byAssists[0];
  const bestGoalkeeper = byStars.find((p) => p.favoritePosition === 'goleiro');
  const bestDefender = byStars.find((p) => p.favoritePosition === 'zagueiro');
  const bestMidfielder = byStars.find((p) => p.favoritePosition === 'meio-campo');

  const awards = [
    {
      title: 'Craque Geral (MVP)',
      subtitle: 'Maior média de estrelas',
      player: mvpLeader,
      highlight: `⭐ ${mvpLeader?.starsRating.toFixed(1)} / 5.0`,
      accent: 'border-t-amber-400',
      badge: 'bg-amber-100 text-amber-900',
      Icon: Trophy,
    },
    {
      title: 'Artilheiro da Liga',
      subtitle: 'Líder em gols marcados',
      player: topScorer,
      highlight: `⚽ ${topScorer?.goals} Gols`,
      accent: 'border-t-emerald-500',
      badge: 'bg-emerald-100 text-emerald-900',
      Icon: SoccerBallIcon,
    },
    {
      title: 'Garçom de Ouro',
      subtitle: 'Líder em assistências',
      player: topPlaymaker,
      highlight: `👟 ${topPlaymaker?.assists} Assist.`,
      accent: 'border-t-sky-500',
      badge: 'bg-sky-100 text-sky-900',
      Icon: CleatsIcon,
    },
    {
      title: 'Melhor Goleiro',
      subtitle: 'Luva de Ouro UGTSIC',
      player: bestGoalkeeper,
      highlight: `⭐ ${bestGoalkeeper?.starsRating.toFixed(1)} (${bestGoalkeeper?.overallRating} OVR)`,
      accent: 'border-t-amber-500',
      badge: 'bg-amber-50 text-amber-800',
      Icon: GlovesIcon,
    },
    {
      title: 'Melhor Zagueiro',
      subtitle: 'Xerife da Defesa',
      player: bestDefender,
      highlight: `⭐ ${bestDefender?.starsRating.toFixed(1)} (${bestDefender?.overallRating} OVR)`,
      accent: 'border-t-teal-600',
      badge: 'bg-teal-50 text-teal-800',
      Icon: JerseyIcon,
    },
    {
      title: 'Melhor Meio-Campo',
      subtitle: 'Maestro da Rodada',
      player: bestMidfielder,
      highlight: `⭐ ${bestMidfielder?.starsRating.toFixed(1)} (${bestMidfielder?.overallRating} OVR)`,
      accent: 'border-t-indigo-600',
      badge: 'bg-indigo-50 text-indigo-800',
      Icon: PitchIcon,
    },
  ];

  // Filtragem e ordenação da tabela principal
  const filteredPlayers = players
    .filter((p) => (posFilter === 'todos' ? true : p.favoritePosition === posFilter))
    .sort((a, b) => {
      if (sortBy === 'gols') return b.goals - a.goals || b.starsRating - a.starsRating;
      if (sortBy === 'assistencias') return b.assists - a.assists || b.starsRating - a.starsRating;
      return b.starsRating - a.starsRating || b.overallRating - a.overallRating;
    });

  const posBadge: Record<Position, { label: string; cls: string }> = {
    goleiro: { label: 'GOL', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
    zagueiro: { label: 'ZAG', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    'meio-campo': { label: 'MEI', cls: 'bg-sky-100 text-sky-800 border-sky-200' },
    atacante: { label: 'ATA', cls: 'bg-rose-100 text-rose-800 border-rose-200' },
  };

  const totalGoals = players.reduce((acc, p) => acc + p.goals, 0);
  const totalAssists = players.reduce((acc, p) => acc + p.assists, 0);
  const avgStars = (
    players.reduce((acc, p) => acc + p.starsRating, 0) / (players.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* TOPO EM BENTO GRID PROPORCIONAL (8 COLUNAS CAMPO/PÓDIO + 4 COLUNAS PAINEL DA TEMPORADA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Card Esquerdo (8 Colunas): Campo de Futebol + Top 3 Pódio dos Craques */}
        <div
          className="lg:col-span-8 rounded-3xl p-6 sm:p-7 text-white shadow-lg border-2 border-emerald-700/80 relative overflow-hidden flex flex-col justify-between"
          style={{
            backgroundColor: '#14532d',
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.04) 0px,
                rgba(255, 255, 255, 0.04) 44px,
                transparent 44px,
                transparent 88px
              ),
              linear-gradient(135deg, #14532d 0%, #15803d 55%, #0f4c5c 100%)
            `,
          }}
        >
          {/* Marcações de Campo de Futebol Proporcionais (sem esticar o círculo central) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
            viewBox="0 0 800 360"
            preserveAspectRatio="xMidYMid slice"
          >
            <rect x="20" y="20" width="760" height="320" rx="14" fill="none" stroke="#ffffff" strokeWidth="3" />
            <line x1="400" y1="20" x2="400" y2="340" stroke="#ffffff" strokeWidth="3" />
            <circle cx="400" cy="180" r="56" fill="none" stroke="#ffffff" strokeWidth="3" />
            <circle cx="400" cy="180" r="5" fill="#ffffff" />
            <rect x="20" y="95" width="95" height="170" fill="none" stroke="#ffffff" strokeWidth="3" />
            <rect x="685" y="95" width="95" height="170" fill="none" stroke="#ffffff" strokeWidth="3" />
          </svg>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 mb-3">
              <Trophy className="w-4 h-4 text-amber-400 anim-trophy shrink-0" />
              <span>HALL DA FAMA • RANKING 5 ESTRELAS UGTSIC</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Destaques por Função & Classificação
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">
              Toque em qualquer jogador abaixo para ver a carta completa ou registrar seu voto de 1 a 5 estrelas.
            </p>
          </div>

          {/* Mini Pódio Integrado dos Top 3 Craques da Liga */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/15">
            {byStars.slice(0, 3).map((p, idx) => {
              const medals = [
                { label: '1º Craque', badge: 'bg-amber-400 text-slate-950', ring: 'border-amber-300' },
                { label: '2º Lugar', badge: 'bg-slate-200 text-slate-900', ring: 'border-slate-200' },
                { label: '3º Lugar', badge: 'bg-amber-600 text-white', ring: 'border-amber-500' },
              ][idx];
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPlayer(p)}
                  className="bg-black/30 hover:bg-black/45 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center gap-3 cursor-pointer transition-all group"
                >
                  <div className="relative shrink-0">
                    <img
                      src={p.avatarUrl}
                      alt={p.fullName}
                      className={`w-12 h-12 rounded-full object-cover border-2 ${medals.ring} group-hover:scale-105 transition-transform`}
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded-full ${medals.badge} shadow`}
                    >
                      {idx + 1}º
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200 block">
                      {medals.label}
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-white truncate">
                      {p.fullName.replace(/\s*\(.*?\)\s*/g, '')}
                    </h4>
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1 mt-0.5">
                      ★ {p.starsRating.toFixed(1)}{' '}
                      <span className="text-[10px] text-emerald-100/80 font-semibold">
                        ({p.goals}G • {p.assists}A)
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Direito (4 Colunas): Resumo da Temporada + Botão Planilha PDF */}
        <div className="lg:col-span-4 arena-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <SoccerBallIcon className="w-3.5 h-3.5 text-emerald-600" />
                Temporada 2026
              </span>
              <span className="text-xs font-bold text-slate-400">
                {players.length} Atletas
              </span>
            </div>

            <h3 className="text-base font-black text-slate-900">
              Estatísticas Oficiais da Liga
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Consolidado geral das peladas da UGTSIC / SESAP
            </p>

            <div className="grid grid-cols-3 gap-2.5 my-4">
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                <span className="text-lg font-black text-emerald-700 block">{totalGoals}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Gols</span>
              </div>
              <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 text-center">
                <span className="text-lg font-black text-sky-700 block">{totalAssists}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Assist.</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
                <span className="text-lg font-black text-amber-600 block">★ {avgStars}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Média</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => generateRankingPDF(players)}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <FileDown className="w-4 h-4 animate-bounce" />
            <span>Baixar Planilha Completa (PDF)</span>
          </button>
        </div>
      </div>

      {/* SEÇÃO 1: OS 6 TROFÉUS DE DESTAQUE DA TEMPORADA (MELHOR DE CADA POSIÇÃO + ARTILHEIRO + GARÇOM) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500 anim-trophy" />
            <span>Os 6 Troféus Oficiais da Liga</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Toque em qualquer card para ver detalhes ou votar
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {awards.map((item, idx) => {
            const p = item.player;
            const Icon = item.Icon;
            if (!p) return null;
            return (
              <div
                key={idx}
                onClick={() => onSelectPlayer(p)}
                className={`arena-card rounded-2xl p-4 border-t-4 ${item.accent} hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-between gap-3`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={p.avatarUrl}
                      alt={p.fullName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 shadow-sm"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                      #{p.shirtNumber}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${item.badge} inline-flex items-center gap-1`}>
                      <Icon className="w-3 h-3" />
                      {item.title}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 truncate mt-1">
                      {p.fullName.replace(/\s*\(.*?\)\s*/g, '')}
                    </h4>
                    <span className="text-xs font-bold text-slate-600 block mt-0.5">
                      {item.highlight}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenVoting(p);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 font-bold text-xs transition-colors shrink-0"
                >
                  ⭐ Votar
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEÇÃO 2: TABELA COMPLETA DE CLASSIFICAÇÃO (ESTILO SOFASCORE / PREMIER LEAGUE) */}
      <div className="arena-card rounded-3xl overflow-hidden">
        {/* Barra de Filtros da Tabela */}
        <div className="p-4 sm:px-6 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Filtro por Posição */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'todos', label: 'Todos' },
                { id: 'goleiro', label: '🧤 Goleiros' },
                { id: 'zagueiro', label: '🛡️ Zagueiros' },
                { id: 'meio-campo', label: '🪄 Meio-Campo' },
                { id: 'atacante', label: '⚡ Atacantes' },
              ] as { id: FilterPos; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setPosFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  posFilter === f.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Ordenar por */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-bold mr-1">Ordenar:</span>
            {[
              { id: 'estrelas', label: '⭐ Estrelas' },
              { id: 'gols', label: '⚽ Gols' },
              { id: 'assistencias', label: '👟 Assist.' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id as any)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  sortBy === s.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cabeçalho das Colunas (Desktop) */}
        <div className="hidden md:grid md:grid-cols-12 px-6 py-3 bg-slate-100/80 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider items-center">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Jogador</div>
          <div className="col-span-2 text-center">Função</div>
          <div className="col-span-1 text-center">Gols</div>
          <div className="col-span-1 text-center">Assist.</div>
          <div className="col-span-2 text-center">Média (5★)</div>
          <div className="col-span-1 text-right">Ação</div>
        </div>

        {/* Linhas dos Jogadores */}
        <div className="divide-y divide-slate-100">
          {filteredPlayers.map((p, index) => {
            const badge = posBadge[p.favoritePosition] || posBadge['meio-campo'];
            return (
              <div
                key={p.id}
                onClick={() => onSelectPlayer(p)}
                className="p-4 sm:px-6 hover:bg-emerald-50/30 transition-colors grid grid-cols-12 items-center gap-2 cursor-pointer"
              >
                {/* Coluna 1: Posição no Ranking */}
                <div className="col-span-2 sm:col-span-1">
                  <span
                    className={`w-7 h-7 rounded-lg text-xs font-black inline-flex items-center justify-center ${
                      index === 0
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : index === 1
                        ? 'bg-slate-300 text-slate-900'
                        : index === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {index + 1}º
                  </span>
                </div>

                {/* Coluna 2: Foto + Nome */}
                <div className="col-span-6 sm:col-span-5 md:col-span-4 flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <img
                    src={p.avatarUrl}
                    alt={p.fullName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      {p.fullName.replace(/\s*\(.*?\)\s*/g, '')}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium truncate">
                      &quot;{p.nickname}&quot; • #{p.shirtNumber}
                      <span className="md:hidden ml-1.5 text-emerald-700 font-bold">
                        • {p.goals}G {p.assists}A
                      </span>
                    </p>
                  </div>
                </div>

                {/* Coluna 3: Função (Desktop) */}
                <div className="hidden md:flex md:col-span-2 justify-center">
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${badge.cls}`}
                  >
                    {badge.label} • {p.overallRating} OVR
                  </span>
                </div>

                {/* Coluna 4: Gols (Desktop) */}
                <div className="hidden md:block md:col-span-1 text-center text-sm font-black text-emerald-700">
                  {p.goals}
                </div>

                {/* Coluna 5: Assistências (Desktop) */}
                <div className="hidden md:block md:col-span-1 text-center text-sm font-black text-sky-700">
                  {p.assists}
                </div>

                {/* Coluna 6: Estrelas (Desktop) */}
                <div className="hidden md:flex md:col-span-2 justify-center">
                  <StarRating rating={p.starsRating} size="sm" />
                </div>

                {/* Coluna 7: Botão Avaliar */}
                <div className="col-span-4 sm:col-span-6 md:col-span-1 flex items-center justify-end gap-1.5 sm:gap-2">
                  <span className="md:hidden text-[11px] font-black text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 whitespace-nowrap">
                    ★ {p.starsRating.toFixed(1)}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenVoting(p);
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all active:scale-95 whitespace-nowrap"
                  >
                    Avaliar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
