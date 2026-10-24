'use client';

import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle2, Sparkles, Share2 } from 'lucide-react';
import {
  SoccerBallIcon,
  PitchIcon,
  GoalNetIcon,
  JerseyIcon,
  CleatsIcon,
} from './FootballIcons';

interface TutorialModalProps {
  isOpen: boolean;
  playerName: string;
  onClose: () => void;
}

const STEPS = [
  {
    badge: 'Passo 1 de 4 • Convocação & Sorteio',
    title: 'Confirme Presença e Sorteie os Times',
    description:
      'Na aba "Sorteio & Times", escolha se vai atuar na Linha, no Gol ou na Reserva. Quando a turma confirmar, clique em "Sortear Times Automaticamente": o sistema equilibra Time Azul e Time Vermelho pelo nível técnico (4+1 ou 5+1 com até 3 reservas).',
    highlights: [
      'Escolha sua função: Linha, Goleiro ou Reserva',
      'Sorteio inteligente (Snake Draft) sem panelinha',
      'Visualização imediata no campinho tático',
    ],
    Icon: PitchIcon,
    accent: 'from-emerald-600 to-teal-700',
  },
  {
    badge: 'Passo 2 de 4 • Bola Rolando',
    title: 'Placar Ao Vivo & Súmula de Gols',
    description:
      'Durante a pelada, use a aba "Placar & Súmula" para atualizar o marcador em tempo real e registrar quem fez cada gol e quem deu a assistência (Garçom). Tudo já soma automaticamente nas estatísticas da temporada.',
    highlights: [
      'Botões rápidos de + Gol para Time Azul e Time Vermelho',
      'Registro de Artilheiro, Garçom (Assistência) e Minuto',
      'Linha do tempo completa dos gols da rodada',
    ],
    Icon: GoalNetIcon,
    accent: 'from-sky-600 to-blue-800',
  },
  {
    badge: 'Passo 3 de 4 • Pós-Jogo & Troféus',
    title: 'Avaliação 5 Estrelas & Ranking Oficial',
    description:
      'Acabou o jogo? Na aba "Ranking", clique em qualquer atleta para avaliar a atuação de 1 a 5 estrelas. O sistema calcula automaticamente os 6 Troféus da Liga: Craque Geral (MVP), Artilheiro, Garçom, Melhor Goleiro, Zagueiro e Meio-Campo.',
    highlights: [
      'Votação interativa de 1.0 a 5.0 estrelas',
      'Pódio Top 3 e os 6 Troféus Oficiais por posição',
      'Carta individual estilo EA FC ao tocar no jogador',
    ],
    Icon: CleatsIcon,
    accent: 'from-amber-500 to-orange-600',
  },
  {
    badge: 'Passo 4 de 4 • Compartilhamento & Perfil',
    title: 'Súmula em PDF, WhatsApp e Sua Foto',
    description:
      'Com 1 toque você envia a escalação e o placar formatados direto para o grupo do WhatsApp da UGTSIC ou baixa o PDF oficial (Súmula do Jogo e Planilha de Ranking). No canto superior direito, você pode trocar sua foto de perfil quando quiser.',
    highlights: [
      'Envio direto para o WhatsApp sem texto poluído',
      'Download imediato de Súmula A4 e Planilha em PDF',
      'Dados sincronizados em nuvem no Supabase',
    ],
    Icon: JerseyIcon,
    accent: 'from-emerald-700 to-sky-700',
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  playerName,
  onClose,
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  if (!isOpen) return null;

  const current = STEPS[stepIndex];
  const StepIcon = current.Icon;
  const isLast = stepIndex === STEPS.length - 1;
  const firstName = playerName.replace(/\s*\(.*?\)\s*/g, '').split(' ')[0] || 'Craque';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
        <div
          className={`p-6 sm:p-7 text-white bg-gradient-to-br ${current.accent} relative overflow-hidden`}
        >
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[11px] font-black text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{current.badge}</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-bold text-white transition-all flex items-center gap-1"
            >
              <span>Pular Tutorial</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-lg">
              <StepIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              {stepIndex === 0 && (
                <p className="text-xs font-bold text-emerald-200 mb-0.5">
                  Bem-vindo ao time, {firstName}! ⚽
                </p>
              )}
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                {current.title}
              </h2>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            {current.description}
          </p>

          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            {current.highlights.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setStepIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === stepIndex ? 'w-7 bg-emerald-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Ir para passo ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={() => setStepIndex((prev) => prev - 1)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-bold transition-all"
                >
                  Pular
                </button>
              )}

              {!isLast ? (
                <button
                  type="button"
                  onClick={() => setStepIndex((prev) => prev + 1)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow-sm transition-all active:scale-95"
                >
                  <span>Próximo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <SoccerBallIcon className="w-4 h-4" />
                  <span>Começar a Usar!</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

