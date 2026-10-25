'use client';

import React, { useState } from 'react';
import { Match, PlayerProfile } from '@/types';
import {
  SoccerBallIcon,
  PitchIcon,
  JerseyIcon,
  GlovesIcon,
  CleatsIcon,
  GoalNetIcon,
} from './FootballIcons';
import {
  FileDown,
  Share2,
  ChevronRight,
  MapPin,
  Calendar,
  Star,
  UserCheck,
  CheckCircle2,
  Camera,
  Trophy,
} from 'lucide-react';
import {
  generateMatchPDF,
  generateRankingPDF,
  shareViaWhatsApp,
} from '@/lib/pdf-generator';

interface HomeViewProps {
  match: Match;
  currentPlayer: PlayerProfile;
  allPlayers: PlayerProfile[];
  onNavigate: (tab: 'home' | 'sorteio' | 'placar' | 'rankings') => void;
  onOpenProfile: () => void;
  onOpenVoting: (player: PlayerProfile) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  match,
  currentPlayer,
  allPlayers,
  onNavigate,
  onOpenProfile,
  onOpenVoting,
}) => {
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const isCheckedIn = match.presences.some((p) => p.playerId === currentPlayer.id);
  const totalSeasonGoals = allPlayers.reduce((acc, p) => acc + p.goals, 0);

  const ratedPlayers = allPlayers.filter(
    (p) => p.starsRating > 0 || p.goals > 0 || p.assists > 0 || p.matchesPlayed > 0
  );
  const sortedByStars = [...ratedPlayers].sort((a, b) => b.starsRating - a.starsRating);
  const bestGoalkeeper = sortedByStars.find((p) => p.favoritePosition === 'goleiro');
  const bestDefender = sortedByStars.find((p) => p.favoritePosition === 'zagueiro');
  const bestMidfielder = sortedByStars.find((p) => p.favoritePosition === 'meio-campo');
  const topScorer = [...allPlayers].filter((p) => p.goals > 0).sort((a, b) => b.goals - a.goals)[0];

  const handleWhatsApp = () => {
    shareViaWhatsApp(match, allPlayers);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* LINHA SUPERIOR EM BENTO GRID (8 COLUNAS CAMPO + 4 COLUNAS CARD DO JOGADOR — SEM ESTICAR!) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Coluna Esquerda (8 cols): Card Campo de Futebol com Proporção Perfeita */}
        <div
          className="lg:col-span-8 rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-emerald-800 relative overflow-hidden flex flex-col justify-between"
          style={{
            backgroundColor: '#14532d',
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.04) 0px,
                rgba(255, 255, 255, 0.04) 42px,
                transparent 42px,
                transparent 84px
              ),
              linear-gradient(135deg, #14532d 0%, #15803d 55%, #0f4c5c 100%)
            `,
          }}
        >
          {/* SVG com preserveAspectRatio="xMidYMid slice" para o círculo central NUNCA ficar esticado */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
            viewBox="0 0 600 280"
            preserveAspectRatio="xMidYMid slice"
          >
            <rect x="16" y="16" width="568" height="248" rx="12" fill="none" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="300" y1="16" x2="300" y2="264" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="300" cy="140" r="48" fill="none" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="300" cy="140" r="4" fill="#ffffff" />
            <rect x="16" y="70" width="80" height="140" fill="none" stroke="#ffffff" strokeWidth="2.5" />
            <path d="M 96 105 A 35 35 0 0 1 96 175" fill="none" stroke="#ffffff" strokeWidth="2.5" />
            <rect x="504" y="70" width="80" height="140" fill="none" stroke="#ffffff" strokeWidth="2.5" />
            <path d="M 504 105 A 35 35 0 0 0 504 175" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          </svg>

          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide text-emerald-200">
                <SoccerBallIcon className="w-3.5 h-3.5 text-emerald-300" />
                <span>UGTSIC / SESAP • G TRIGUEIRO</span>
              </span>

              <span className="inline-flex items-center gap-1.5 bg-emerald-400/20 border border-emerald-300/30 text-emerald-100 text-[11px] font-black px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                {match.presences.length} Confirmados
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight pt-1">
              {match.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-emerald-50">
              <span className="inline-flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-xl border border-white/15">
                <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                {match.matchDate}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-xl border border-white/15">
                <MapPin className="w-3.5 h-3.5 text-sky-300" />
                {match.location}
              </span>
            </div>
          </div>

          <div className="relative z-10 pt-5 mt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('sorteio')}
              className="px-5 py-2.5 bg-white text-emerald-950 hover:bg-emerald-50 font-black rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <PitchIcon className="w-4 h-4 text-emerald-700" />
              <span>{isCheckedIn ? 'Ver Sorteio dos Times' : 'Confirmar Presença'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('placar')}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 border border-sky-400/30"
            >
              <GoalNetIcon className="w-4 h-4" />
              <span>Placar: {match.scoreTeamA} x {match.scoreTeamB}</span>
            </button>
          </div>
        </div>

        {/* Coluna Direita (4 cols): Crachá / Card de Perfil do Atleta Proporcional */}
        <div
          onClick={onOpenProfile}
          className="lg:col-span-4 arena-card rounded-3xl p-5 flex flex-col justify-between cursor-pointer hover:border-emerald-500 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Passaporte do Atleta
            </span>
            <span className="text-xs font-black text-slate-400 group-hover:text-emerald-600 transition-colors flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" /> Editar
            </span>
          </div>

          <div className="flex items-center gap-4 my-3">
            <div className="relative shrink-0">
              <img
                src={currentPlayer.avatarUrl}
                alt={currentPlayer.fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                #{currentPlayer.shirtNumber}
              </span>
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-900 truncate">
                {currentPlayer.fullName}
              </h3>
              <p className="text-xs text-slate-500 capitalize font-semibold">
                {currentPlayer.favoritePosition} •{' '}
                {currentPlayer.overallRating > 0 ? `${currentPlayer.overallRating} OVR` : 'Sem OVR'}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-black text-amber-600 mt-1">
                {currentPlayer.starsRating > 0
                  ? `⭐ ${currentPlayer.starsRating.toFixed(1)} Estrelas`
                  : '☆ 0.0 (Sem jogos avaliados)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="bg-slate-50 rounded-xl py-1.5 px-2">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Gols</span>
              <span className="text-xs font-black text-emerald-700">{currentPlayer.goals}</span>
            </div>
            <div className="bg-slate-50 rounded-xl py-1.5 px-2">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Assist.</span>
              <span className="text-xs font-black text-sky-700">{currentPlayer.assists}</span>
            </div>
            <div className="bg-slate-50 rounded-xl py-1.5 px-2">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Jogos</span>
              <span className="text-xs font-black text-slate-700">{currentPlayer.matchesPlayed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Indicadores Rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => onNavigate('sorteio')}
          className="arena-card rounded-2xl p-4 cursor-pointer hover:border-emerald-500 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Elenco Hoje</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {match.presences.length}{' '}
            <span className="text-xs font-semibold text-slate-500">atletas</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            {match.presences.length >= 10 ? '5 na linha + 1 goleiro' : '4 na linha + 1 goleiro'}
          </p>
        </div>

        <div
          onClick={() => onNavigate('placar')}
          className="arena-card rounded-2xl p-4 cursor-pointer hover:border-sky-500 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Placar Atual</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <SoccerBallIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            <span className="text-blue-600">{match.scoreTeamA}</span>
            <span className="text-slate-400 text-base mx-1.5">x</span>
            <span className="text-red-600">{match.scoreTeamB}</span>
          </div>
          <p className="text-[11px] text-sky-700 font-semibold mt-1">
            Azul vs Vermelho ({match.events.length} gols)
          </p>
        </div>

        <div
          onClick={() => onNavigate('rankings')}
          className="arena-card rounded-2xl p-4 cursor-pointer hover:border-emerald-500 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Gols na Liga</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CleatsIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalSeasonGoals}</div>
          <p className="text-[11px] text-slate-500 font-semibold mt-1 truncate">
            {topScorer && topScorer.goals > 0
              ? `Artilheiro: ${topScorer.nickname} (${topScorer.goals}g)`
              : 'Temporada iniciando'}
          </p>
        </div>

        <div
          onClick={() => onNavigate('rankings')}
          className="arena-card rounded-2xl p-4 cursor-pointer hover:border-amber-500 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Craque da Liga</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Trophy className="w-4 h-4 anim-trophy" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 truncate">
            {sortedByStars[0]
              ? sortedByStars[0].fullName.replace(/\s*\(.*?\)\s*/g, '')
              : 'Aguardando Jogo'}
          </div>
          <p className="text-[11px] text-amber-700 font-bold mt-1">
            {sortedByStars[0] && sortedByStars[0].starsRating > 0
              ? `⭐ ${sortedByStars[0].starsRating.toFixed(1)} de 5.0`
              : '☆ 0.0 • Sem avaliações'}
          </p>
        </div>
      </div>

      {/* Ações de Exportação PDF & WhatsApp */}
      <div className="arena-card rounded-2xl p-5">
        <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileDown className="w-4 h-4 text-emerald-600 animate-bounce" />
          <span>Exportar Relatórios & Compartilhar</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => generateMatchPDF(match, allPlayers)}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all flex items-center gap-3 text-left group"
          >
            <div className="p-2.5 rounded-lg bg-emerald-600 text-white group-hover:scale-110 transition-transform">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 block">Súmula do Jogo (PDF)</span>
              <span className="text-[11px] text-slate-500">Escalação Azul x Vermelho</span>
            </div>
          </button>

          <button
            onClick={() => generateRankingPDF(allPlayers)}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 transition-all flex items-center gap-3 text-left group"
          >
            <div className="p-2.5 rounded-lg bg-sky-600 text-white group-hover:scale-110 transition-transform">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 block">Planilha Ranking (PDF)</span>
              <span className="text-[11px] text-slate-500">Tabela geral 5 estrelas</span>
            </div>
          </button>

          <button
            onClick={handleWhatsApp}
            className="p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-3 text-left shadow-sm group"
          >
            <div className="p-2.5 rounded-lg bg-white/20 group-hover:scale-110 transition-transform">
              {copiedFeedback ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-xs font-black block">
                {copiedFeedback ? 'Copiado & Abrindo!' : 'Enviar no WhatsApp'}
              </span>
              <span className="text-[11px] text-emerald-100">Resumo pro grupo UGTSIC</span>
            </div>
          </button>
        </div>
      </div>

      {/* Melhores por Posição */}
      <div className="arena-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <JerseyIcon className="w-4 h-4 text-sky-600" />
            <span>Destaques por Função</span>
          </h2>
          <button
            onClick={() => onNavigate('rankings')}
            className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-0.5"
          >
            <span>Ranking completo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: 'Goleiro', Icon: GlovesIcon, player: bestGoalkeeper, badge: 'bg-amber-50 text-amber-800 border-amber-200' },
            { title: 'Zagueiro', Icon: JerseyIcon, player: bestDefender, badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
            { title: 'Meio-Campo', Icon: PitchIcon, player: bestMidfielder, badge: 'bg-sky-50 text-sky-800 border-sky-200' },
            { title: 'Artilheiro', Icon: CleatsIcon, player: topScorer, badge: 'bg-rose-50 text-rose-800 border-rose-200' },
          ].map((item, idx) => {
            const p = item.player;
            const RoleIcon = item.Icon;
            if (!p) {
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-dashed border-slate-200 flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <RoleIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${item.badge} inline-flex items-center gap-1 mb-1`}>
                      <RoleIcon className="w-3 h-3" />
                      {item.title}
                    </span>
                    <h4 className="text-xs font-bold text-slate-400 truncate">Em aberto</h4>
                    <p className="text-[10px] text-slate-400">Sem atleta na posição</p>
                  </div>
                </div>
              );
            }
            return (
              <div
                key={idx}
                onClick={() => onOpenVoting(p)}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-emerald-400 transition-all cursor-pointer flex items-center gap-3 group"
              >
                <img
                  src={p.avatarUrl}
                  alt={p.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 flex-1">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${item.badge} inline-flex items-center gap-1 mb-1`}>
                    <RoleIcon className="w-3 h-3" />
                    {item.title}
                  </span>
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    {p.fullName.replace(/\s*\(.*?\)\s*/g, '')}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    ⭐ {p.starsRating.toFixed(1)} • ⚽ {p.goals}g
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
