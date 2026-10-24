'use client';

import React, { useState, useEffect } from 'react';
import { Match, MatchEvent, PlayerProfile, TeamColor } from '@/types';
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
  const [minute, setMinuteState] = useState<number>(15);
  const [whatsappCopied, setWhatsappCopied] = useState(false);

  useEffect(() => {
    const ui = loadUIState();
    if (ui.scoreGoalTeam) setGoalTeamState(ui.scoreGoalTeam);
    if (ui.scoreScorerId !== undefined) setScorerIdState(ui.scoreScorerId);
    if (ui.scoreAssistId !== undefined) setAssistIdState(ui.scoreAssistId);
    if (ui.scoreMinute !== undefined) setMinuteState(ui.scoreMinute);
  }, []);

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

  const updateScore = (team: TeamColor, delta: number) => {
    if (team === 'azul') {
      const newScore = Math.max(0, match.scoreTeamA + delta);
      onUpdateMatch({ ...match, scoreTeamA: newScore });
    } else {
      const newScore = Math.max(0, match.scoreTeamB + delta);
      onUpdateMatch({ ...match, scoreTeamB: newScore });
    }
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scorerId) return;

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
      scoreTeamA: newScoreA,
      scoreTeamB: newScoreB,
      events: [...match.events, newEvent],
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

  const handleFinishMatch = () => {
    onUpdateMatch({
      ...match,
      status: 'finalizado',
    });
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.4 },
    });
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

  return (
    <div className="space-y-6">
      {/* BANNER DO PLACAR ESTILO ARENA / GRANDE ÁREA DO CAMPO */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-emerald-800 relative overflow-hidden"
        style={{
          backgroundColor: '#0f4c3a',
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgba(255, 255, 255, 0.04) 0px,
              rgba(255, 255, 255, 0.04) 36px,
              transparent 36px,
              transparent 72px
            ),
            linear-gradient(135deg, #064e3b 0%, #115e59 50%, #0c4a6e 100%)
          `,
        }}
      >
        {/* Desenho da Grande Área e Meia-Lua no Fundo (Contexto Gol & Placar) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-15"
          viewBox="0 0 800 320"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect x="20" y="15" width="760" height="290" rx="12" fill="none" stroke="#ffffff" strokeWidth="3" />
          <rect x="220" y="15" width="360" height="110" fill="none" stroke="#ffffff" strokeWidth="3" />
          <rect x="310" y="15" width="180" height="45" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          <path d="M 320 125 A 85 85 0 0 0 480 125" fill="none" stroke="#ffffff" strokeWidth="3" />
          <circle cx="400" cy="90" r="4" fill="#ffffff" />
        </svg>

        <div className="relative z-10 space-y-5">
          {/* Topo: Info da Partida + Ações Rápidas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-200">
                <GoalNetIcon className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="truncate">PLACAR OFICIAL & SÚMULA</span>
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-1.5 leading-tight">
                {match.title}
              </h2>
              <p className="text-[11px] sm:text-xs text-emerald-100 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-300 shrink-0" /> {match.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-300 shrink-0" /> {match.matchDate}
                </span>
              </p>
            </div>

            {/* Botões Superiores Alinhados no Mobile (Grid 2 colunas no celular, Flex no Desktop) */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => generateMatchPDF(match, allPlayers)}
                className="px-3 py-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/25 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <FileDown className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="truncate">Súmula PDF</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="px-3 py-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/25 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                {whatsappCopied ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                ) : (
                  <Share2 className="w-4 h-4 text-sky-300 shrink-0" />
                )}
                <span className="truncate">{whatsappCopied ? 'Copiado!' : 'Enviar no Zap'}</span>
              </button>

              {match.status !== 'finalizado' ? (
                <button
                  onClick={handleFinishMatch}
                  className="col-span-2 sm:col-span-1 px-4 py-2.5 sm:py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <WhistleIcon className="w-4 h-4 shrink-0" />
                  <span>Encerrar Jogo</span>
                </button>
              ) : (
                <button
                  onClick={onOpenVoting}
                  className="col-span-2 sm:col-span-1 px-4 py-2.5 sm:py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <Award className="w-4 h-4 anim-trophy shrink-0" />
                  <span>Votar nos Craques</span>
                </button>
              )}
            </div>
          </div>

          {/* CARD CENTRAL DO PLACAR — 100% RESPONSIVO NO CELULAR E DESKTOP (SEM SOBREPOSIÇÃO) */}
          <div className="bg-black/40 backdrop-blur-md border border-white/25 rounded-3xl p-4 sm:p-7">
            {/* Linha 1: Selo Ao Vivo + Contador de Gols na Súmula no Topo */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{match.status === 'finalizado' ? 'FIM DE JOGO' : 'AO VIVO'}</span>
              </span>

              <span className="text-[11px] text-emerald-100/85 font-bold bg-white/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                ⚽ {match.events.length} {match.events.length === 1 ? 'gol registrado' : 'gols registrados'}
              </span>
            </div>

            {/* Linha 2: Escudo/Camisa Azul — Placar Central — Escudo/Camisa Vermelha */}
            <div className="flex items-center justify-between gap-2 sm:gap-6 max-w-2xl mx-auto">
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

              {/* PLACAR NUMÉRICO CENTRAL (NÃO INVADE AS LATERAIS) */}
              <div className="shrink-0 flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 sm:gap-5 bg-black/55 px-3.5 py-2.5 sm:px-7 sm:py-4 rounded-2xl border border-white/20 shadow-inner">
                  <span className="text-3xl sm:text-6xl font-black text-white tracking-tight leading-none">
                    {match.scoreTeamA}
                  </span>
                  <span className="text-lg sm:text-2xl font-black text-emerald-400 leading-none">:</span>
                  <span className="text-3xl sm:text-6xl font-black text-white tracking-tight leading-none">
                    {match.scoreTeamB}
                  </span>
                </div>
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

            {/* Linha 3: Controles de Gol Separados em Grid de 2 Colunas (Zero colisão no celular!) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-2xl mx-auto mt-4 pt-4 border-t border-white/15">
              {/* Botões Time Azul */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => updateScore('azul', -1)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 active:scale-95 shrink-0"
                  title="Diminuir gol Time Azul"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => updateScore('azul', 1)}
                  className="flex-1 sm:flex-initial sm:px-4 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center gap-1 shadow-md border border-blue-400/50 active:scale-95 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" /> Gol Azul
                </button>
              </div>

              {/* Botões Time Vermelho */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => updateScore('vermelho', -1)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 active:scale-95 shrink-0"
                  title="Diminuir gol Time Vermelho"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => updateScore('vermelho', 1)}
                  className="flex-1 sm:flex-initial sm:px-4 h-9 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black flex items-center justify-center gap-1 shadow-md border border-red-400/50 active:scale-95 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" /> Gol Verm.
                </button>
              </div>
            </div>

            {match.status === 'finalizado' && (
              <div className="mt-4 p-3 rounded-xl bg-amber-400 text-slate-950 text-center font-black text-xs sm:text-sm flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4 anim-trophy shrink-0" />
                {winner === 'azul' && `VITÓRIA DO ${match.teamAName.toUpperCase()}!`}
                {winner === 'vermelho' && `VITÓRIA DO ${match.teamBName.toUpperCase()}!`}
                {winner === 'empate' && 'PARTIDA ENCERRADA EM EMPATE!'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GRID DE 2 COLUNAS: REGISTRAR GOL NA SÚMULA + HISTÓRICO DE GOLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda (5 cols): Anotar Gol e Assistência Direto */}
        <div className="lg:col-span-5 arena-card rounded-3xl p-5 sm:p-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-2">
            <SoccerBallIcon className="w-4 h-4 text-emerald-600" />
            <span>Anotar Gol e Assistência</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Registre quem fez o gol e quem deu o passe para atualizar a artilharia
          </p>

          <form onSubmit={handleAddGoal} className="space-y-4">
            {/* Seletor de Time */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Gol para qual equipe?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setGoalTeam('azul');
                    setScorerId('');
                    setAssistId('');
                  }}
                  className={`py-3 px-3.5 rounded-2xl text-xs font-black border-2 flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    goalTeam === 'azul'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-300 shadow-md ring-2 ring-blue-500/35'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300'
                  }`}
                >
                  <JerseyIcon teamColor="blue" className="w-5 h-5 shrink-0" />
                  <span>Time Azul</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGoalTeam('vermelho');
                    setScorerId('');
                    setAssistId('');
                  }}
                  className={`py-3 px-3.5 rounded-2xl text-xs font-black border-2 flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    goalTeam === 'vermelho'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-300 shadow-md ring-2 ring-red-500/35'
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
                value={scorerId}
                onChange={(e) => setScorerId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
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
                  value={assistId}
                  onChange={(e) => setAssistId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
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
                    max="90"
                    value={minute}
                    onChange={(e) => setMinute(Number(e.target.value))}
                    className="w-full pl-7 pr-2 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <SoccerBallIcon className="w-4 h-4" />
              <span>CONFIRMAR GOL NA SÚMULA</span>
            </button>
          </form>
        </div>

        {/* Coluna Direita (7 cols): Linha do Tempo da Súmula */}
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
                <p className="text-sm font-bold text-slate-700">A súmula ainda está em branco</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Use o painel ao lado para registrar o primeiro gol e assistência da pelada!
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
                            👟 Assistência de{' '}
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
            <span>Os gols registrados já somam automaticamente no Ranking da temporada.</span>
            <button
              onClick={onOpenVoting}
              className="font-black text-emerald-700 hover:underline shrink-0 ml-2"
            >
              Ir para Avaliação →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
