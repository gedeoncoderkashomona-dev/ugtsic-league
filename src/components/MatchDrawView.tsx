'use client';

import React, { useState, useEffect } from 'react';
import { Match, MatchPresence, PlayerProfile, PreferencePosition } from '@/types';
import { drawBalancedTeams } from '@/lib/team-generator';
import { loadUIState, saveUIState } from '@/lib/supabase-service';
import {
  Users,
  ChevronRight,
  Dices,
  Share2,
  FileDown,
  CheckCircle2,
  Calendar,
  MapPin,
} from 'lucide-react';
import {
  SoccerBallIcon,
  PitchIcon,
  GlovesIcon,
  JerseyIcon,
  CleatsIcon,
} from './FootballIcons';
import { generateMatchPDF, shareViaWhatsApp } from '@/lib/pdf-generator';
import confetti from 'canvas-confetti';

interface MatchDrawViewProps {
  match: Match;
  currentPlayer: PlayerProfile;
  allPlayers: PlayerProfile[];
  onUpdateMatch: (updated: Match) => void;
  onGoToGame: () => void;
}

export const MatchDrawView: React.FC<MatchDrawViewProps> = ({
  match,
  currentPlayer,
  allPlayers,
  onUpdateMatch,
  onGoToGame,
}) => {
  const [preference, setPreferenceState] = useState<PreferencePosition>('linha');
  const [isDrawing, setIsDrawing] = useState(false);
  const [sharedFeedback, setSharedFeedback] = useState(false);

  useEffect(() => {
    const ui = loadUIState();
    if (ui.drawPreference) {
      setPreferenceState(ui.drawPreference);
    }
  }, []);

  const setPreference = (pref: PreferencePosition) => {
    setPreferenceState(pref);
    saveUIState({ drawPreference: pref });
  };

  const currentPresence = match.presences.find((p) => p.playerId === currentPlayer.id);
  const isCheckedIn = Boolean(currentPresence);

  const handleCheckIn = () => {
    let updatedPresences: MatchPresence[];

    if (isCheckedIn) {
      updatedPresences = match.presences.filter((p) => p.playerId !== currentPlayer.id);
    } else {
      const newPresence: MatchPresence = {
        id: `pr-${Date.now()}`,
        matchId: match.id,
        playerId: currentPlayer.id,
        player: currentPlayer,
        positionPreference: preference,
        isReserve: preference === 'reserva',
        confirmedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      updatedPresences = [...match.presences, newPresence];
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }

    onUpdateMatch({
      ...match,
      presences: updatedPresences,
    });
  };

  const handleDrawTeams = () => {
    if (match.presences.length < 8) {
      alert('São necessários pelo menos 8 jogadores confirmados para sortear os times!');
      return;
    }

    setIsDrawing(true);

    setTimeout(() => {
      try {
        const result = drawBalancedTeams(match.presences);

        const updatedPresences = match.presences.map((p) => {
          const inAzulStarters = result.teamAzul.starters.some((s) => s.id === p.id);
          const inAzulReserves = result.teamAzul.reserves.some((s) => s.id === p.id);
          const inVermelhoStarters = result.teamVermelho.starters.some((s) => s.id === p.id);
          const inVermelhoReserves = result.teamVermelho.reserves.some((s) => s.id === p.id);

          if (inAzulStarters) return { ...p, team: 'azul' as const, isReserve: false };
          if (inAzulReserves) return { ...p, team: 'azul' as const, isReserve: true };
          if (inVermelhoStarters) return { ...p, team: 'vermelho' as const, isReserve: false };
          if (inVermelhoReserves) return { ...p, team: 'vermelho' as const, isReserve: true };
          return p;
        });

        onUpdateMatch({
          ...match,
          status: 'sorteado',
          presences: updatedPresences,
        });

        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.5 },
        });
      } catch (err: any) {
        alert(err.message || 'Erro ao realizar o sorteio.');
      } finally {
        setIsDrawing(false);
      }
    }, 450);
  };

  const handleShareWhatsApp = () => {
    shareViaWhatsApp(match, allPlayers);
    setSharedFeedback(true);
    setTimeout(() => setSharedFeedback(false), 3000);
  };

  const azulStarters = match.presences.filter((p) => p.team === 'azul' && !p.isReserve);
  const azulReserves = match.presences.filter((p) => p.team === 'azul' && p.isReserve);
  const vermelhoStarters = match.presences.filter((p) => p.team === 'vermelho' && !p.isReserve);
  const vermelhoReserves = match.presences.filter((p) => p.team === 'vermelho' && p.isReserve);

  const countGk = match.presences.filter((p) => p.positionPreference === 'goleiro').length;
  const countLine = match.presences.filter((p) => p.positionPreference === 'linha').length;
  const countRes = match.presences.filter((p) => p.positionPreference === 'reserva').length;

  const isDrawn = match.status !== 'convocando';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* COLUNA ESQUERDA (5 COLUNAS): PAINEL COMPACTO E ELEGANTE DE CHECK-IN & SORTEIO (SEM ESTICAR!) */}
      <div className="lg:col-span-5 arena-card rounded-3xl overflow-hidden">
        {/* Topo com Gramado & Prancheta Proporcional */}
        <div
          className="p-5 sm:p-6 text-white relative overflow-hidden"
          style={{
            backgroundColor: '#0f4c3a',
            backgroundImage: 'linear-gradient(135deg, #14532d 0%, #0f766e 55%, #0369a1 100%)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-200 bg-black/25 px-2.5 py-1 rounded-full border border-white/20">
                <PitchIcon className="w-3.5 h-3.5 text-emerald-300" />
                {isDrawn ? 'Equipes Sorteadas' : 'Check-in Aberto'}
              </span>
              <h2 className="text-xl font-black text-white mt-2 leading-tight">{match.title}</h2>
            </div>

            <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl px-3.5 py-2 text-center shrink-0">
              <span className="text-xl font-black text-amber-300 block leading-none">
                {match.presences.length}/16
              </span>
              <span className="text-[9px] text-emerald-100 uppercase font-bold">Vagas</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100 mt-3 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sky-300" />
              {match.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-300" />
              {match.matchDate}
            </span>
          </div>

          {/* Resumo Rápido das Vagas por Posição */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/15 text-center">
            <div className="bg-black/20 rounded-xl py-1.5 px-2">
              <span className="text-xs font-black text-white block">{countGk}</span>
              <span className="text-[10px] text-emerald-200 font-semibold">🧤 Goleiros</span>
            </div>
            <div className="bg-black/20 rounded-xl py-1.5 px-2">
              <span className="text-xs font-black text-white block">{countLine}</span>
              <span className="text-[10px] text-emerald-200 font-semibold">🏃 Linha</span>
            </div>
            <div className="bg-black/20 rounded-xl py-1.5 px-2">
              <span className="text-xs font-black text-white block">{countRes}</span>
              <span className="text-[10px] text-emerald-200 font-semibold">🔄 Reservas</span>
            </div>
          </div>
        </div>

        {/* Corpo do Painel Esquerdo: Seu Check-in + Botão de Sorteio */}
        <div className="p-5 space-y-4">
          {/* Card do Jogador Atual */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={currentPlayer.avatarUrl}
                alt={currentPlayer.fullName}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-600 shadow-sm shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-slate-900 truncate">
                  {currentPlayer.fullName}
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  {isCheckedIn ? (
                    <span className="text-emerald-700 font-bold">
                      ✅ Confirmado ({currentPresence?.positionPreference?.toUpperCase()})
                    </span>
                  ) : (
                    'Você vai jogar hoje?'
                  )}
                </p>
              </div>
            </div>

            {!isCheckedIn && (
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                  Escolha onde quer atuar:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreference('linha')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                      preference === 'linha'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CleatsIcon className="w-4 h-4" />
                    <span>Linha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreference('goleiro')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                      preference === 'goleiro'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <GlovesIcon className="w-4 h-4" />
                    <span>Goleiro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreference('reserva')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                      preference === 'reserva'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <JerseyIcon className="w-4 h-4" />
                    <span>Reserva</span>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleCheckIn}
              className={`w-full py-2.5 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 ${
                isCheckedIn
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <SoccerBallIcon className="w-4 h-4" />
              {isCheckedIn ? 'Cancelar Minha Presença' : 'Confirmar Minha Presença'}
            </button>
          </div>

          {/* Botão Principal de Sorteio (Proporcional dentro da coluna!) */}
          <button
            onClick={handleDrawTeams}
            disabled={isDrawing || match.presences.length < 8}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
          >
            <Dices className={`w-5 h-5 ${isDrawing ? 'animate-spin' : 'anim-dice'}`} />
            {isDrawn ? 'Refazer Sorteio dos Times' : 'Sortear Times Automaticamente'}
          </button>

          {isDrawn && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={handleShareWhatsApp}
                className="py-2.5 px-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
              >
                {sharedFeedback ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{sharedFeedback ? 'Copiado!' : 'Zap'}</span>
              </button>

              <button
                onClick={() => generateMatchPDF(match, allPlayers)}
                className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 text-xs flex items-center justify-center gap-1"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-700" />
                <span>PDF</span>
              </button>

              <button
                onClick={onGoToGame}
                className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
              >
                <span>Placar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* COLUNA DIREITA (7 COLUNAS): CAMPINHO TÁTICO & ESCALAÇÃO DOS TIMES / CONVOCADOS */}
      <div className="lg:col-span-7 space-y-5">
        {isDrawn ? (
          <>
            {/* Campinho Visual Proporcional (Círculo Central Perfeito!) */}
            <div
              className="rounded-3xl p-5 text-white shadow-lg border border-emerald-800 relative overflow-hidden"
              style={{
                backgroundColor: '#15803d',
                backgroundImage: `
                  repeating-linear-gradient(
                    90deg,
                    rgba(255, 255, 255, 0.05) 0px,
                    rgba(255, 255, 255, 0.05) 40px,
                    transparent 40px,
                    transparent 80px
                  ),
                  linear-gradient(180deg, #166534 0%, #15803d 50%, #14532d 100%)
                `,
              }}
            >
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
                viewBox="0 0 600 320"
                preserveAspectRatio="xMidYMid slice"
              >
                <rect x="14" y="14" width="572" height="292" rx="10" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                <line x1="300" y1="14" x2="300" y2="306" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="300" cy="160" r="46" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="300" cy="160" r="4" fill="#ffffff" />
                <rect x="14" y="80" width="75" height="160" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                <rect x="511" y="80" width="75" height="160" fill="none" stroke="#ffffff" strokeWidth="2.5" />
              </svg>

              <div className="relative z-10">
                <div className="text-center mb-3">
                  <span className="inline-flex items-center gap-1.5 bg-black/35 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full text-[11px] font-black text-emerald-200">
                    <PitchIcon className="w-3.5 h-3.5 text-emerald-300" />
                    {match.presences.length >= 10
                      ? 'FORMAÇÃO TÁTICA: 5 NA LINHA + 1 GOLEIRO'
                      : 'FORMAÇÃO TÁTICA: 4 NA LINHA + 1 GOLEIRO'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Lado Azul */}
                  <div className="bg-blue-950/50 backdrop-blur-sm border border-blue-300/30 rounded-2xl p-3.5">
                    <h4 className="text-xs font-black text-blue-200 uppercase text-center mb-2.5">
                      🔵 {match.teamAName}
                    </h4>
                    <div className="flex flex-wrap justify-center gap-2.5">
                      {azulStarters.map((p) => {
                        const isGk =
                          p.positionPreference === 'goleiro' ||
                          p.player.favoritePosition === 'goleiro';
                        return (
                          <div key={p.id} className="flex flex-col items-center w-16 text-center">
                            <div className="relative">
                              <img
                                src={p.player.avatarUrl}
                                alt={p.player.fullName}
                                className="w-11 h-11 rounded-full object-cover border-2 border-blue-400 shadow"
                              />
                              <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[9px] font-black px-1 rounded-full">
                                {isGk ? 'GOL' : `#${p.player.shirtNumber}`}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-white mt-1 truncate w-full">
                              {p.player.nickname || p.player.fullName.split(' ')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lado Vermelho */}
                  <div className="bg-red-950/50 backdrop-blur-sm border border-red-300/30 rounded-2xl p-3.5">
                    <h4 className="text-xs font-black text-red-200 uppercase text-center mb-2.5">
                      🔴 {match.teamBName}
                    </h4>
                    <div className="flex flex-wrap justify-center gap-2.5">
                      {vermelhoStarters.map((p) => {
                        const isGk =
                          p.positionPreference === 'goleiro' ||
                          p.player.favoritePosition === 'goleiro';
                        return (
                          <div key={p.id} className="flex flex-col items-center w-16 text-center">
                            <div className="relative">
                              <img
                                src={p.player.avatarUrl}
                                alt={p.player.fullName}
                                className="w-11 h-11 rounded-full object-cover border-2 border-red-400 shadow"
                              />
                              <span className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[9px] font-black px-1 rounded-full">
                                {isGk ? 'GOL' : `#${p.player.shirtNumber}`}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-white mt-1 truncate w-full">
                              {p.player.nickname || p.player.fullName.split(' ')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards Detalhados Time Azul x Time Vermelho */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card Time Azul */}
              <div className="arena-card rounded-2xl overflow-hidden border-t-4 border-t-blue-600">
                <div className="px-4 py-3 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between">
                  <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                    <JerseyIcon teamColor="blue" className="w-5 h-5" />
                    {match.teamAName}
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    {azulStarters.length} Titulares
                  </span>
                </div>

                <div className="p-3.5 space-y-2">
                  {azulStarters.map((presence) => {
                    const cleanName = presence.player.fullName.replace(/\s*\(.*?\)\s*/g, '');
                    return (
                      <div
                        key={presence.id}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50/60 to-white border border-blue-200/70 border-l-4 border-l-blue-600 flex items-center justify-between hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={presence.player.avatarUrl}
                              alt={cleanName}
                              className="w-9 h-9 rounded-full object-cover border-2 border-blue-500"
                            />
                            <span className="absolute -bottom-1 -right-1 bg-blue-700 text-white text-[9px] font-black px-1 rounded-full">
                              #{presence.player.shirtNumber}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-black text-slate-900 block truncate">
                              {cleanName}
                            </span>
                            <span className="text-[10px] font-bold text-blue-700 capitalize flex items-center gap-1">
                              {presence.positionPreference === 'goleiro' ? (
                                <>
                                  <GlovesIcon className="w-3 h-3 text-amber-600" /> Goleiro
                                </>
                              ) : (
                                <>
                                  <CleatsIcon className="w-3 h-3 text-blue-600" />{' '}
                                  {presence.player.favoritePosition}
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-lg shrink-0">
                          {presence.player.starsRating > 0
                            ? `★ ${presence.player.starsRating.toFixed(1)}`
                            : '☆ 0.0'}
                        </span>
                      </div>
                    );
                  })}

                  {azulReserves.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Suplentes ({azulReserves.length})
                      </span>
                      {azulReserves.map((presence) => (
                        <div
                          key={presence.id}
                          className="p-2 rounded-lg bg-slate-50/80 border border-slate-200/60 flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-slate-700 truncate">
                            {presence.player.fullName.replace(/\s*\(.*?\)\s*/g, '')}
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                            Reserva
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Time Vermelho */}
              <div className="arena-card rounded-2xl overflow-hidden border-t-4 border-t-red-600">
                <div className="px-4 py-3 bg-red-50/70 border-b border-red-100 flex items-center justify-between">
                  <span className="text-xs font-black text-red-900 flex items-center gap-1.5">
                    <JerseyIcon teamColor="red" className="w-5 h-5" />
                    {match.teamBName}
                  </span>
                  <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                    {vermelhoStarters.length} Titulares
                  </span>
                </div>

                <div className="p-3.5 space-y-2">
                  {vermelhoStarters.map((presence) => {
                    const cleanName = presence.player.fullName.replace(/\s*\(.*?\)\s*/g, '');
                    return (
                      <div
                        key={presence.id}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-red-50/60 to-white border border-red-200/70 border-l-4 border-l-red-600 flex items-center justify-between hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={presence.player.avatarUrl}
                              alt={cleanName}
                              className="w-9 h-9 rounded-full object-cover border-2 border-red-500"
                            />
                            <span className="absolute -bottom-1 -right-1 bg-red-700 text-white text-[9px] font-black px-1 rounded-full">
                              #{presence.player.shirtNumber}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-black text-slate-900 block truncate">
                              {cleanName}
                            </span>
                            <span className="text-[10px] font-bold text-red-700 capitalize flex items-center gap-1">
                              {presence.positionPreference === 'goleiro' ? (
                                <>
                                  <GlovesIcon className="w-3 h-3 text-amber-600" /> Goleiro
                                </>
                              ) : (
                                <>
                                  <CleatsIcon className="w-3 h-3 text-red-600" />{' '}
                                  {presence.player.favoritePosition}
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-red-800 bg-red-100/80 px-2 py-0.5 rounded-lg shrink-0">
                          {presence.player.starsRating > 0
                            ? `★ ${presence.player.starsRating.toFixed(1)}`
                            : '☆ 0.0'}
                        </span>
                      </div>
                    );
                  })}

                  {vermelhoReserves.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Suplentes ({vermelhoReserves.length})
                      </span>
                      {vermelhoReserves.map((presence) => (
                        <div
                          key={presence.id}
                          className="p-2 rounded-lg bg-slate-50/80 border border-slate-200/60 flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-slate-700 truncate">
                            {presence.player.fullName.replace(/\s*\(.*?\)\s*/g, '')}
                          </span>
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                            Reserva
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Lista de Confirmados Antes do Sorteio — Estilo Lobby de Escalação / EA FC */
          <div className="arena-card rounded-3xl overflow-hidden border border-slate-200/90 shadow-md">
            {/* Cabeçalho Esportivo do Lobby de Convocados */}
            <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <PitchIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <span>Jogadores Confirmados ({match.presences.length})</span>
                  </h3>
                  <p className="text-[11px] text-emerald-200/80 font-medium">
                    Elenco relacionado para o sorteio equilibrado da rodada
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-950 bg-emerald-400 px-3 py-1.5 rounded-full shadow-sm">
                <SoccerBallIcon className="w-3.5 h-3.5" />
                <span>Prontos p/ Sorteio</span>
              </span>
            </div>

            {/* Sub-barra de Contagem Tática por Função */}
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 font-bold text-[11px]">
                  <GlovesIcon className="w-3.5 h-3.5 text-amber-600" />
                  {countGk} Goleiros
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold text-[11px]">
                  <CleatsIcon className="w-3.5 h-3.5 text-emerald-600" />
                  {countLine} Linha
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200/80 font-bold text-[11px]">
                  <JerseyIcon teamColor="blue" className="w-3.5 h-3.5" />
                  {countRes} Reservas
                </span>
              </div>

              <span className="text-[11px] font-bold text-slate-500">
                Formação sugerida: <strong className="text-emerald-700">{match.presences.length >= 10 ? '5+1 Society' : '4+1 Society'}</strong>
              </span>
            </div>

            {/* Grid de Cards dos Atletas Confirmados */}
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {match.presences.map((p) => {
                // Separa nome limpo e cargo técnico (ex: "Rodrigo Silva (Dev SESAP)" -> "Rodrigo Silva" + "Dev SESAP")
                const roleMatch = p.player.fullName.match(/\((.*?)\)/);
                const techRole = roleMatch ? roleMatch[1] : 'UGTSIC';
                const cleanName = p.player.fullName.replace(/\s*\(.*?\)\s*/g, '');

                const isGk = p.positionPreference === 'goleiro';
                const isRes = p.positionPreference === 'reserva';
                const pos = p.player.favoritePosition;

                const styleByRole = isGk
                  ? {
                      borderLeft: 'border-l-amber-500',
                      ring: 'border-amber-500',
                      shirtBg: 'bg-amber-500 text-slate-950',
                      pill: 'bg-amber-50 text-amber-800 border-amber-200',
                      label: 'Goleiro',
                      Icon: GlovesIcon,
                    }
                  : isRes
                  ? {
                      borderLeft: 'border-l-indigo-500',
                      ring: 'border-indigo-500',
                      shirtBg: 'bg-indigo-600 text-white',
                      pill: 'bg-indigo-50 text-indigo-800 border-indigo-200',
                      label: 'Reserva',
                      Icon: JerseyIcon,
                    }
                  : pos === 'atacante'
                  ? {
                      borderLeft: 'border-l-rose-500',
                      ring: 'border-rose-500',
                      shirtBg: 'bg-rose-600 text-white',
                      pill: 'bg-rose-50 text-rose-800 border-rose-200',
                      label: 'Atacante',
                      Icon: CleatsIcon,
                    }
                  : pos === 'zagueiro'
                  ? {
                      borderLeft: 'border-l-emerald-500',
                      ring: 'border-emerald-500',
                      shirtBg: 'bg-emerald-600 text-white',
                      pill: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                      label: 'Zagueiro',
                      Icon: JerseyIcon,
                    }
                  : {
                      borderLeft: 'border-l-sky-500',
                      ring: 'border-sky-500',
                      shirtBg: 'bg-sky-600 text-white',
                      pill: 'bg-sky-50 text-sky-800 border-sky-200',
                      label: 'Meio-Campo',
                      Icon: PitchIcon,
                    };

                const RoleIcon = styleByRole.Icon;

                return (
                  <div
                    key={p.id}
                    className={`group p-3.5 rounded-2xl bg-gradient-to-br from-white via-white to-slate-50/90 border border-slate-200/90 border-l-4 ${styleByRole.borderLeft} hover:border-emerald-400 hover:shadow-md transition-all flex items-center justify-between gap-3`}
                  >
                    {/* Esquerda: Avatar + Camisa + Nome Limpo + Pílula de Posição */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={p.player.avatarUrl}
                          alt={cleanName}
                          className={`w-12 h-12 rounded-full object-cover border-2 ${styleByRole.ring} shadow-sm group-hover:scale-105 transition-transform`}
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow ${styleByRole.shirtBg}`}
                        >
                          #{p.player.shirtNumber}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                            {cleanName}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md border whitespace-nowrap ${styleByRole.pill}`}
                          >
                            <RoleIcon className="w-3 h-3 shrink-0" />
                            <span>{styleByRole.label}</span>
                          </span>

                          <span className="text-[10px] font-semibold text-slate-400 truncate">
                            • {techRole}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Direita: Badge de Estrelas + Overall */}
                    <div className="flex flex-col items-end shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs font-black text-amber-900 bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-300/80 px-2.5 py-1 rounded-xl shadow-sm">
                        <span className="text-amber-500">{p.player.starsRating > 0 ? '★' : '☆'}</span>
                        <span>{p.player.starsRating > 0 ? p.player.starsRating.toFixed(1) : '0.0'}</span>
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400 mt-1">
                        {p.player.overallRating > 0 ? `${p.player.overallRating} OVR` : 'Sem OVR'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
