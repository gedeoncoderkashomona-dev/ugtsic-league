'use client';

import React from 'react';
import { PlayerProfile } from '@/types';
import { FOOTBALL_AVATARS } from '@/lib/football-avatars';
import { Home, Trophy, User, HelpCircle } from 'lucide-react';
import { SoccerBallIcon, DevSoccerLogo, PitchIcon, GoalNetIcon } from './FootballIcons';

export type NavTab = 'home' | 'sorteio' | 'placar' | 'rankings';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentPlayer: PlayerProfile;
  onOpenProfile: () => void;
  onOpenTutorial?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  currentPlayer,
  onOpenProfile,
  onOpenTutorial,
}) => {
  return (
    <>
      {/* Top Bar Fixa Desktop & Mobile (Branco Limpo com Verde Futebol e Azul UGTSIC) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo Oficial Dev+Soccer e Botão Home */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onTabChange('home')}
            title="Voltar para a Tela Inicial (Home)"
          >
            <div className="w-11 h-11 flex items-center justify-center group-hover:scale-105 transition-transform">
              <DevSoccerLogo className="w-11 h-11 drop-shadow-sm" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-slate-900">UGTSIC</span>
                <span className="text-base font-black text-emerald-600">LEAGUE</span>
                <SoccerBallIcon className="w-4 h-4 shrink-0" />
              </div>
              <p className="text-[10px] text-sky-700 font-bold tracking-tight">
                Dev &amp; Society • SESAP / G Trigueiro
              </p>
            </div>
          </div>

          {/* Desktop Nav Links com Botão Home explícito */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => onTabChange('home')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'home'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              Início (Home)
            </button>

            <button
              onClick={() => onTabChange('sorteio')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'sorteio'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PitchIcon className="w-3.5 h-3.5" />
              Sorteio & Times
            </button>

            <button
              onClick={() => onTabChange('placar')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'placar'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GoalNetIcon className="w-3.5 h-3.5" />
              Placar & Súmula
            </button>

            <button
              onClick={() => onTabChange('rankings')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'rankings'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 anim-trophy" />
              Rankings
            </button>
          </nav>

          <div className="flex items-center gap-2">
            {onOpenTutorial && (
              <button
                onClick={onOpenTutorial}
                title="Abrir Tutorial de Como Usar"
                className="p-2 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-all flex items-center gap-1.5 text-xs font-bold"
              >
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span className="hidden lg:inline pr-1">Como Usar</span>
              </button>
            )}

            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-full bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 transition-all active:scale-95"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-600 shadow-sm">
                <img
                  src={currentPlayer.avatarUrl || FOOTBALL_AVATARS[0].url}
                  alt={currentPlayer.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-slate-900 block leading-tight truncate max-w-[100px]">
                  {currentPlayer.nickname || currentPlayer.fullName.split(' ')[0]}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold leading-none">
                  {currentPlayer.starsRating > 0
                    ? `⭐ ${currentPlayer.starsRating.toFixed(1)} • #${currentPlayer.shirtNumber}`
                    : `Sem nota • #${currentPlayer.shirtNumber}`}
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar com Botão HOME em destaque */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-2 flex justify-around items-center shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            currentTab === 'home'
              ? 'text-emerald-700 bg-emerald-50 font-black'
              : 'text-slate-500 font-semibold'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => onTabChange('sorteio')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            currentTab === 'sorteio'
              ? 'text-emerald-700 bg-emerald-50 font-black'
              : 'text-slate-500 font-semibold'
          }`}
        >
          <PitchIcon className="w-5 h-5" />
          <span className="text-[10px]">Sorteio</span>
        </button>

        <button
          onClick={() => onTabChange('placar')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            currentTab === 'placar'
              ? 'text-emerald-700 bg-emerald-50 font-black'
              : 'text-slate-500 font-semibold'
          }`}
        >
          <GoalNetIcon className="w-5 h-5" />
          <span className="text-[10px]">Placar</span>
        </button>

        <button
          onClick={() => onTabChange('rankings')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
            currentTab === 'rankings'
              ? 'text-emerald-700 bg-emerald-50 font-black'
              : 'text-slate-500 font-semibold'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px]">Ranking</span>
        </button>

        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-slate-500 hover:text-emerald-700 font-semibold transition-all"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Perfil</span>
        </button>
      </nav>
    </>
  );
};
