'use client';

import React, { useState, useEffect } from 'react';
import { Match, MatchEvent, MatchPeriod, MatchTimerState, PlayerProfile, TeamColor } from '@/types';
import { loadUIState, saveUIState } from '@/lib/supabase-service';
import {
  Plus,
  Minus,
  Trophy,
  FileDown,
  Share2,
  Award,
  Clock,
  CheckCircle2,
  MapPin,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  Timer,
  AlertTriangle,
} from 'lucide-react';
import {
  SoccerBallIcon,
  WhistleIcon,
  GoalNetIcon,
  JerseyIcon,
  CleatsIcon,
} from './FootballIcons';
import confetti from 'canvas-confetti';
import { generateMatchPDF, shareViaWhatsApp } from '@/lib/pdf-generator';

interface ScoreBoardViewProps {
  match: Match;
  allPlayers: PlayerProfile[];
  onUpdateMatch: (updated: Match) => void;
  onUpdatePlayers?: (updatedPlayers: PlayerProfile[]) => void;
  onOpenVoting: () => void;
}

const DEFAULT_TIMER: MatchTimerState = {
  period: 'nao_iniciado',
  halfDurationMinutes: 25,
  elapsedSeconds: 0,
  stoppageSeconds: 0,
  isRunning: false,
  isPaused: false,
};

function formatMMSS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const ScoreBoardView: React.FC<ScoreBoardViewProps> = ({
  match,
  allPlayers,
  onUpdateMatch,
  onUpdatePlayers,
  onOpenVoting,
}) => {
  const [goalTeam, setGoalTeamState] = useState<TeamColor>('azul');
  const [scorerId, setScorerIdState] = useState<string>('');
  const [assistId, setAssistIdState] = useState<string>('');
  const [minute, setMinuteState] = useState<number>(1);
  const [whatsappCopied, setWhatsappCopied] = useState(false);

  const [timer, setTimer] = useState<MatchTimerState>(() => {
    if (match.timer) return match.timer;
    if (match.status === 'finalizado') {
      return { ...DEFAULT_TIMER, period: 'encerrado', isRunning: false, isPaused: false };
    }
    return DEFAULT_TIMER;
  });

  useEffect(() => {
    const ui = loadUIState();
    if (ui.scoreGoalTeam) setGoalTeamState(ui.scoreGoalTeam);
    if (ui.scoreScorerId !== undefined) setScorerIdState(ui.scoreScorerId);
    if (ui.scoreAssistId !== undefined) setAssistIdState(ui.scoreAssistId);
    if (ui.scoreMinute !== undefined) setMinuteState(ui.scoreMinute);
  }, []);

  useEffect(() => {
    if (match.timer) {
      setTimer(match.timer);
    } else if (match.status === 'finalizado' && timer.period !== 'encerrado') {
      setTimer((prev) => ({ ...prev, period: 'encerrado', isRunning: false, isPaused: false }));
    }
  }, [match.status, match.timer]);

  useEffect(() => {
    if (!timer.isRunning && !timer.isPaused) return;
    if (timer.period === 'nao_iniciado' || timer.period === 'intervalo' || timer.period === 'encerrado') {
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev.isRunning && !prev.isPaused) {
          const nextElapsed = prev.elapsedSeconds + 1;
          const currentMin = Math.max(1, Math.ceil(nextElapsed / 60));
          setMinuteState(currentMin);
          return {
            ...prev,
            elapsedSeconds: nextElapsed,
          };
        }
        if (prev.isPaused) {
          return {
            ...prev,
            stoppageSeconds: prev.stoppageSeconds + 1,
          };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.isRunning, timer.isPaused, timer.period]);

  const syncTimerWithMatch = (nextTimer: MatchTimerState, nextStatus = match.status) => {
    setTimer(nextTimer);
    onUpdateMatch({
      ...match,
      status: nextStatus,
      timer: nextTimer,
    });
  };

  const handleStartFirstHalf = () => {
    const nextTimer: MatchTimerState = {
      ...timer,
      period: '1_tempo',
      elapsedSeconds: 0,
      stoppageSeconds: 0,
      isRunning: true,
      isPaused: false,
    };
    setMinuteState(1);
    syncTimerWithMatch(nextTimer, 'em_andamento');
  };

  const handleTogglePause = () => {
    if (timer.period !== '1_tempo' && timer.period !== '2_tempo') return;
    if (timer.isPaused) {
      const nextTimer: MatchTimerState = {
        ...timer,
        isRunning: true,
        isPaused: false,
      };
      syncTimerWithMatch(nextTimer, 'em_andamento');
    } else {
      const nextTimer: MatchTimerState = {
        ...timer,
        isRunning: false,
        isPaused: true,
      };
      syncTimerWithMatch(nextTimer, 'em_andamento');
    }
  };

  const handleEndFirstHalf = () => {
    const nextTimer: MatchTimerState = {
      ...timer,
      period: 'intervalo',
      isRunning: false,
      isPaused: false,
    };
    syncTimerWithMatch(nextTimer, 'em_andamento');
  };

  const handleStartSecondHalf = () => {
    const nextTimer: MatchTimerState = {
      ...timer,
      period: '2_tempo',
      elapsedSeconds: 0,
      stoppageSeconds: 0,
      isRunning: true,
      isPaused: false,
    };
    setMinuteState(timer.halfDurationMinutes + 1);
    syncTimerWithMatch(nextTimer, 'em_andamento');
  };

  const handleFinishMatch = () => {
    const stoppedTimer: MatchTimerState = {
      ...timer,
      period: 'encerrado',
      isRunning: false,
      isPaused: false,
    };
    setTimer(stoppedTimer);

    const matchWinner =
      match.scoreTeamA > match.scoreTeamB
        ? 'azul'
        : match.scoreTeamB > match.scoreTeamA
        ? 'vermelho'
        : 'empate';

    if (onUpdatePlayers && match.status !== 'finalizado') {
      const presentIds = new Set(match.presences.map((pr) => pr.playerId));
      const winningIds = new Set(
        match.presences
          .filter((pr) => pr.team === matchWinner)
          .map((pr) => pr.playerId)
      );

      const updatedPlayers = allPlayers.map((p) => {
        if (!presentIds.has(p.id)) return p;
        return {
          ...p,
          matchesPlayed: (p.matchesPlayed || 0) + 1,
          victories: winningIds.has(p.id) ? (p.victories || 0) + 1 : p.victories || 0,
        };
      });
      onUpdatePlayers(updatedPlayers);
    }

    onUpdateMatch({
      ...match,
      status: 'finalizado',
      timer: stoppedTimer,
    });

    confetti({
      particleCount: 120,
      spread: 85,
      origin: { y: 0.45 },
    });
  };

  const handleResetMatchClock = () => {
    const resetTimer: MatchTimerState = {
      ...DEFAULT_TIMER,
      halfDurationMinutes: timer.halfDurationMinutes,
    };
    setTimer(resetTimer);
    onUpdateMatch({
      ...match,
      status: match.presences.some((p) => p.team) ? 'sorteado' : 'convocando',
      timer: resetTimer,
    });
  };

  const setGoalTeam = (team: TeamColor) => {
    setGoalTeamState(team);
    saveUIState({ scoreGoalTeam: team });
  };
  const setScorerId = (id: string) => {
    setScorerIdState(id);
    saveUIState({ scoreScorerId: id });
  };
  const setAssistId = (id: string) => {
    setAssistIdState(id);
    saveUIState({ scoreAssistId: id });
  };
  const setMinute = (min: number) => {
    setMinuteState(min);
    saveUIState({ scoreMinute: min });
  };

  const teamAzulPresences = match.presences.filter((p) => p.team === 'azul');
  const teamVermelhoPresences = match.presences.filter((p) => p.team === 'vermelho');

  const availablePlayersForGoal = (team: TeamColor) => {
    const teamList = team === 'azul' ? teamAzulPresences : teamVermelhoPresences;
    return teamList.length > 0 ? teamList : match.presences;
  };

  const isMatchActive = timer.period === '1_tempo' || timer.period === '2_tempo' || timer.period === 'intervalo';
  const isMatchFinished = match.status === 'finalizado' || timer.period === 'encerrado';

  const updateScore = (team: TeamColor, delta: number) => {
    if (isMatchFinished) return;
    if (team === 'azul') {
      const newScore = Math.max(0, match.scoreTeamA + delta);
      onUpdateMatch({ ...match, scoreTeamA: newScore, timer });
    } else {
      const newScore = Math.max(0, match.scoreTeamB + delta);
      onUpdateMatch({ ...match, scoreTeamB: newScore, timer });
    }
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scorerId || isMatchFinished) return;

    const scorerPlayer = allPlayers.find((p) => p.id === scorerId);
    const assistPlayer = allPlayers.find((p) => p.id === assistId);

    const newEvent: MatchEvent = {
      id: `ev-${Date.now()}`,
      matchId: match.id,
      playerId: scorerId,
      playerName: scorerPlayer?.fullName || 'Jogador',
      assistPlayerId: assistId || undefined,
      assistPlayerName: assistPlayer?.fullName || undefined,
      team: goalTeam,
      minute: Number(minute) || 1,
      type: 'gol',
    };

    const newScoreA = goalTeam === 'azul' ? match.scoreTeamA + 1 : match.scoreTeamA;
    const newScoreB = goalTeam === 'vermelho' ? match.scoreTeamB + 1 : match.scoreTeamB;

    onUpdateMatch({
      ...match,
      status: timer.period === 'nao_iniciado' ? 'em_andamento' : match.status,
      scoreTeamA: newScoreA,
      scoreTeamB: newScoreB,
      events: [...match.events, newEvent],
      timer,
    });

    if (onUpdatePlayers) {
      const updatedPlayers = allPlayers.map((p) => {
        if (p.id === scorerId) return { ...p, goals: p.goals + 1 };
        if (assistId && p.id === assistId) return { ...p, assists: p.assists + 1 };
        return p;
      });
      onUpdatePlayers(updatedPlayers);
    }

    confetti({ particleCount: 65, spread: 60, origin: { y: 0.6 } });
    setScorerId('');
    setAssistId('');
  };

  const handleShareWhatsApp = () => {
    shareViaWhatsApp(match, allPlayers);
    setWhatsappCopied(true);
    setTimeout(() => setWhatsappCopied(false), 3000);
  };

  const winner =
    match.scoreTeamA > match.scoreTeamB
      ? 'azul'
      : match.scoreTeamB > match.scoreTeamA
      ? 'vermelho'
      : 'empate';

  const halfRegularSeconds = timer.halfDurationMinutes * 60;
  const totalTargetSecondsWithStoppage = halfRegularSeconds + timer.stoppageSeconds;
  const isInStoppageTime =
    (timer.period === '1_tempo' || timer.period === '2_tempo') &&
    timer.elapsedSeconds >= halfRegularSeconds;
  const addedMinutesToRecover = Math.ceil(timer.stoppageSeconds / 60);

  const periodBadgeLabel: Record<MatchPeriod, string> = {
    nao_iniciado: 'AGUARDANDO INÍCIO DA PARTIDA',
    '1_tempo': timer.isPaused ? '1º TEMPO PAUSADO (CONTANDO ACRÉSCIMO)' : '1º TEMPO EM ANDAMENTO',
    intervalo: 'INTERVALO DE JOGO',
    '2_tempo': timer.isPaused ? '2º TEMPO PAUSADO (CONTANDO ACRÉSCIMO)' : '2º TEMPO EM ANDAMENTO',
    encerrado: 'PARTIDA ENCERRADA',
  };

  return (
    <div className="space-y-6">
      {/* PAINEL PRINCIPAL DO PLACAR E CRONÔMETRO OFICIAL */}
      <div
        className="rounded-3xl p-5 sm:p-8 text-white shadow-xl border border-emerald-800 relative overflow-hidden"
        style={{
          backgroundColor: '#0f4c3a',
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgba(255, 255, 255, 0.03) 0px,
              rgba(255, 255, 255, 0.03) 36px,
              transparent 36px,
              transparent 72px
            ),
            linear-gradient(135deg, #064e3b 0%, #0f172a 60%, #0c4a6e 100%)
          `,
        }}
      >
        <div className="relative z-10 space-y-5">
          {/* Topo: Info da Partida + Exportação */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-black/35 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-300">
                <GoalNetIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>CRONÔMETRO & SÚMULA OFICIAL</span>
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-1.5 leading-tight">
                {match.title}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" /> {match.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {match.matchDate}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => generateMatchPDF(match, allPlayers)}
                className="px-3 py-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <FileDown className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Súmula PDF</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="px-3 py-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                {whatsappCopied ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                ) : (
                  <Share2 className="w-4 h-4 text-sky-300 shrink-0" />
                )}
                <span>{whatsappCopied ? 'Copiado!' : 'Enviar no Zap'}</span>
              </button>

              {isMatchFinished && (
                <button
                  onClick={onOpenVoting}
                  className="col-span-2 sm:col-span-1 px-4 py-2.5 sm:py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <Award className="w-4 h-4 shrink-0" />
                  <span>Avaliar Jogadores</span>
                </button>
              )}
            </div>
          </div>

          {/* CENTRAL DE CRONOMETRAGEM E RECUPERAÇÃO DE TEMPO PERDIDO */}
          <div className="bg-slate-950/75 backdrop-blur-md border border-white/15 rounded-3xl p-4 sm:p-6 shadow-inner">
            {/* Status Real da Partida (Sem falso "AO VIVO" antes de iniciar!) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                    timer.period === 'nao_iniciado'
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : timer.isPaused
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                      : timer.period === 'encerrado'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      timer.period === 'nao_iniciado'
                        ? 'bg-slate-400'
                        : timer.isPaused
                        ? 'bg-amber-400 animate-ping'
                        : timer.period === 'encerrado'
                        ? 'bg-rose-400'
                        : 'bg-emerald-400 animate-ping'
                    }`}
                  />
                  <span>{periodBadgeLabel[timer.period]}</span>
                </span>
              </div>

              {/* Seletor de Tempo por Etapa (antes de iniciar) */}
              {timer.period === 'nao_iniciado' && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-semibold">Duração de cada tempo:</span>
                  {[20, 25, 30, 45].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() =>
                        syncTimerWithMatch({ ...timer, halfDurationMinutes: mins })
                      }
                      className={`px-2.5 py-1 rounded-lg font-black text-[11px] transition-all ${
                        timer.halfDurationMinutes === mins
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DISPLAY DUPLO: CRONÔMETRO DO JOGO + CRONÔMETRO DE PAUSA / ACRÉSCIMO JUSTO */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-4 items-center">
              {/* Relógio Principal do Tempo Regulamentar */}
              <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                    Cronômetro Oficial ({timer.halfDurationMinutes} min por tempo)
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-1">
                    <span className="text-3xl sm:text-5xl font-mono font-black text-white tracking-wider">
                      {formatMMSS(timer.elapsedSeconds)}
                    </span>
                    {timer.stoppageSeconds > 0 && (
                      <span className="text-xs sm:text-sm font-black text-amber-400 bg-amber-500/15 border border-amber-400/30 px-2.5 py-0.5 rounded-lg">
                        +{addedMinutesToRecover} min ({formatMMSS(timer.stoppageSeconds)} a recuperar)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {timer.period === 'nao_iniciado'
                      ? 'Clique em "Iniciar 1º Tempo" para soltar o cronômetro da partida.'
                      : isInStoppageTime
                      ? `Tempo regulamentar atingido! Jogando até ${formatMMSS(totalTargetSecondsWithStoppage)} para recuperar as pausas.`
                      : `Meta deste tempo com recuperação justa: ${formatMMSS(totalTargetSecondsWithStoppage)}`}
                  </p>
                </div>
              </div>

              {/* Cronômetro Automático de Pausa / Tempo Perdido */}
              <div
                className={`md:col-span-5 rounded-2xl p-4 border transition-all ${
                  timer.isPaused
                    ? 'bg-amber-950/60 border-amber-400/60 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5" />
                    Cronômetro de Pausa (Acréscimo)
                  </span>
                  {timer.isPaused && (
                    <span className="text-[10px] font-black uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md animate-pulse">
                      CONTANDO PAUSA
                    </span>
                  )}
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-black text-amber-300 mt-1">
                  +{formatMMSS(timer.stoppageSeconds)}
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  {timer.isPaused
                    ? 'Bola parada! Todo segundo parado será somado ao final deste tempo.'
                    : 'Acumula automaticamente sempre que o jogo for pausado.'}
                </p>
              </div>
            </div>

            {/* BARRA DE COMANDOS DO ÁRBITRO / ORGANIZADOR */}
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2.5 pt-3 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                {timer.period === 'nao_iniciado' && (
                  <button
                    type="button"
                    onClick={handleStartFirstHalf}
                    className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Iniciar Jogo (1º Tempo)</span>
                  </button>
                )}

                {(timer.period === '1_tempo' || timer.period === '2_tempo') && (
                  <>
                    <button
                      type="button"
                      onClick={handleTogglePause}
                      className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 ${
                        timer.isPaused
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      }`}
                    >
                      {timer.isPaused ? (
                        <>
                          <Play className="w-4 h-4 fill-slate-950" />
                          <span>Retomar Jogo (Bola Rolando)</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4 fill-slate-950" />
                          <span>Pausar Jogo (Disparar Acréscimo)</span>
                        </>
                      )}
                    </button>

                    {timer.period === '1_tempo' && (
                      <button
                        type="button"
                        onClick={handleEndFirstHalf}
                        className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs sm:text-sm transition-all flex items-center gap-1.5"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Fim do 1º Tempo (Intervalo)</span>
                      </button>
                    )}
                  </>
                )}

                {timer.period === 'intervalo' && (
                  <button
                    type="button"
                    onClick={handleStartSecondHalf}
                    className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Iniciar 2º Tempo</span>
                  </button>
                )}

                {timer.period === 'encerrado' && (
                  <button
                    type="button"
                    onClick={handleResetMatchClock}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reabrir Partida / Novo Jogo</span>
                  </button>
                )}
              </div>

              {timer.period !== 'nao_iniciado' && timer.period !== 'encerrado' && (
                <button
                  type="button"
                  onClick={handleFinishMatch}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <WhistleIcon className="w-4 h-4 shrink-0" />
                  <span>Encerrar Jogo Definitivamente</span>
                </button>
              )}
            </div>

            {/* PLACAR CENTRAL DE EQUIPES */}
            <div className="flex items-center justify-between gap-2 sm:gap-6 max-w-2xl mx-auto mt-6 pt-5 border-t border-white/10">
              {/* TIME AZUL */}
              <div className="flex-1 min-w-0 flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-300 shadow-lg flex items-center justify-center mb-2">
                  <JerseyIcon teamColor="blue" className="w-7 h-7 sm:w-9 sm:h-9" />
                </div>
                <h3 className="text-xs sm:text-base font-black text-white leading-tight truncate w-full">
                  Time Azul
                </h3>
                <span className="text-[10px] text-blue-200 font-bold truncate w-full">
                  Galácticos
                </span>
              </div>

              {/* PLACAR NUMÉRICO */}
              <div className="shrink-0 flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 sm:gap-5 bg-black/65 px-4 py-2.5 sm:px-7 sm:py-4 rounded-2xl border border-white/20 shadow-inner">
                  <span className="text-3xl sm:text-6xl font-black text-white tracking-tight leading-none">
                    {match.scoreTeamA}
                  </span>
                  <span className="text-lg sm:text-2xl font-black text-emerald-400 leading-none">:</span>
                  <span className="text-3xl sm:text-6xl font-black text-white tracking-tight leading-none">
                    {match.scoreTeamB}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-1.5">
                  ⚽ {match.events.length} {match.events.length === 1 ? 'gol na súmula' : 'gols na súmula'}
                </span>
              </div>

              {/* TIME VERMELHO */}
              <div className="flex-1 min-w-0 flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-300 shadow-lg flex items-center justify-center mb-2">
                  <JerseyIcon teamColor="red" className="w-7 h-7 sm:w-9 sm:h-9" />
                </div>
                <h3 className="text-xs sm:text-base font-black text-white leading-tight truncate w-full">
                  Time Vermelho
                </h3>
                <span className="text-[10px] text-red-200 font-bold truncate w-full">
                  Guerreiros
                </span>
              </div>
            </div>

            {/* Botões Rápidos de Placar (Bloqueados após encerrar o jogo) */}
            {!isMatchFinished && (
              <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-2xl mx-auto mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => updateScore('azul', -1)}
                    disabled={!isMatchActive}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white flex items-center justify-center border border-white/20 active:scale-95 shrink-0"
                    title="Diminuir gol Time Azul"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateScore('azul', 1)}
                    disabled={!isMatchActive}
                    className="flex-1 sm:flex-initial sm:px-4 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-black flex items-center justify-center gap-1 shadow-md border border-blue-400/50 active:scale-95 whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" /> Gol Azul
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => updateScore('vermelho', -1)}
                    disabled={!isMatchActive}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white flex items-center justify-center border border-white/20 active:scale-95 shrink-0"
                    title="Diminuir gol Time Vermelho"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateScore('vermelho', 1)}
                    disabled={!isMatchActive}
                    className="flex-1 sm:flex-initial sm:px-4 h-9 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-black flex items-center justify-center gap-1 shadow-md border border-red-400/50 active:scale-95 whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" /> Gol Verm.
                  </button>
                </div>
              </div>
            )}

            {timer.period === 'nao_iniciado' && (
              <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 text-center text-xs font-semibold flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Clique em &quot;Iniciar Jogo (1º Tempo)&quot; acima para liberar a marcação de gols e o cronômetro.</span>
              </div>
            )}

            {isMatchFinished && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-400 text-slate-950 text-center font-black text-xs sm:text-sm flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4 shrink-0" />
                {winner === 'azul' && `FIM DE JOGO! VITÓRIA DO ${match.teamAName.toUpperCase()}!`}
                {winner === 'vermelho' && `FIM DE JOGO! VITÓRIA DO ${match.teamBName.toUpperCase()}!`}
                {winner === 'empate' && 'FIM DE JOGO! PARTIDA ENCERRADA EM EMPATE!'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GRID DE 2 COLUNAS: REGISTRAR GOL NA SÚMULA + HISTÓRICO DE GOLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 arena-card rounded-3xl p-5 sm:p-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-2">
            <SoccerBallIcon className="w-4 h-4 text-emerald-600" />
            <span>Anotar Gol e Assistência</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            {isMatchFinished
              ? 'Partida encerrada. A súmula está fechada.'
              : 'Registre quem marcou e quem deu a assistência com o minuto automático do relógio.'}
          </p>

          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Gol para qual equipe?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isMatchFinished}
                  onClick={() => {
                    setGoalTeam('azul');
                    setScorerId('');
                    setAssistId('');
                  }}
                  className={`py-3 px-3.5 rounded-2xl text-xs font-black border-2 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
                    goalTeam === 'azul'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-300 shadow-md'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300'
                  }`}
                >
                  <JerseyIcon teamColor="blue" className="w-5 h-5 shrink-0" />
                  <span>Time Azul</span>
                </button>

                <button
                  type="button"
                  disabled={isMatchFinished}
                  onClick={() => {
                    setGoalTeam('vermelho');
                    setScorerId('');
                    setAssistId('');
                  }}
                  className={`py-3 px-3.5 rounded-2xl text-xs font-black border-2 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
                    goalTeam === 'vermelho'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-300 shadow-md'
                      : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300'
                  }`}
                >
                  <JerseyIcon teamColor="red" className="w-5 h-5 shrink-0" />
                  <span>Time Vermelho</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Autor do Gol (Artilheiro)
              </label>
              <select
                required
                disabled={isMatchFinished}
                value={scorerId}
                onChange={(e) => setScorerId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600 disabled:opacity-50"
              >
                <option value="">Selecione o jogador...</option>
                {availablePlayersForGoal(goalTeam).map((p) => (
                  <option key={p.id} value={p.player.id}>
                    #{p.player.shirtNumber} - {p.player.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Assistência (Garçom)
                </label>
                <select
                  disabled={isMatchFinished}
                  value={assistId}
                  onChange={(e) => setAssistId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600 disabled:opacity-50"
                >
                  <option value="">Sem assistência</option>
                  {availablePlayersForGoal(goalTeam)
                    .filter((p) => p.player.id !== scorerId)
                    .map((p) => (
                      <option key={p.id} value={p.player.id}>
                        {p.player.fullName}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Minuto</label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  <input
                    type="number"
                    min="1"
                    max="120"
                    disabled={isMatchFinished}
                    value={minute}
                    onChange={(e) => setMinute(Number(e.target.value))}
                    className="w-full pl-7 pr-2 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isMatchFinished || !scorerId}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <SoccerBallIcon className="w-4 h-4" />
              <span>CONFIRMAR GOL NA SÚMULA</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 arena-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CleatsIcon className="w-4 h-4 text-sky-600" />
                <span>Linha do Tempo de Gols ({match.events.length})</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">Súmula Oficial</span>
            </div>

            {match.events.length === 0 ? (
              <div className="py-12 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <SoccerBallIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Nenhum gol anotado na partida</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inicie o cronômetro acima e registre os gols conforme a bola entrar!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {match.events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                        {ev.minute}&apos;
                      </span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">
                          ⚽ {ev.playerName}
                        </h4>
                        {ev.assistPlayerName ? (
                          <p className="text-[11px] text-slate-500 font-medium">
                            Passe de{' '}
                            <span className="font-bold text-slate-700">{ev.assistPlayerName}</span>
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400">Jogada individual</p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full shrink-0 ${
                        ev.team === 'azul'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {ev.team === 'azul' ? 'Time Azul' : 'Time Vermelho'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Ao encerrar o jogo, a partida e as vitórias são somadas aos atletas presentes.</span>
            <button
              onClick={onOpenVoting}
              className="font-black text-emerald-700 hover:underline shrink-0 ml-2"
            >
              Ver Classificação →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
