'use client';

import React from 'react';
import { PlayerProfile, Position } from '@/types';
import { FOOTBALL_AVATARS } from '@/lib/football-avatars';
import { StarRating } from './StarRating';
import { Award, Star } from 'lucide-react';
import { GlovesIcon, JerseyIcon, PitchIcon, CleatsIcon, SoccerBallIcon } from './FootballIcons';

interface PlayerCardProps {
  player: PlayerProfile;
  compact?: boolean;
  onSelect?: () => void;
  showVoteButton?: boolean;
  onVote?: () => void;
}

const positionConfig: Record<
  Position,
  { short: string; full: string; badgeClass: string; Icon: React.FC<{ className?: string }> }
> = {
  goleiro: {
    short: 'GOL',
    full: 'Goleiro',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    Icon: GlovesIcon,
  },
  zagueiro: {
    short: 'ZAG',
    full: 'Zagueiro',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Icon: JerseyIcon,
  },
  'meio-campo': {
    short: 'MEI',
    full: 'Meio-Campo',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    Icon: PitchIcon,
  },
  atacante: {
    short: 'ATA',
    full: 'Atacante',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    Icon: CleatsIcon,
  },
};

function computeDynamicAttributes(player: PlayerProfile) {
  const hasPlayedOrRated =
    player.starsRating > 0 ||
    player.overallRating > 0 ||
    player.goals > 0 ||
    player.assists > 0 ||
    player.matchesPlayed > 0;

  if (!hasPlayedOrRated) {
    return [
      { code: 'RIT', label: 'Ritmo', value: 0 },
      { code: 'FIN', label: 'Finalização', value: 0 },
      { code: 'PAS', label: 'Passe', value: 0 },
      { code: 'DRI', label: 'Drible', value: 0 },
      { code: 'DEF', label: 'Defesa', value: 0 },
      { code: 'FIS', label: 'Físico', value: 0 },
    ];
  }

  const base = player.overallRating > 0 ? player.overallRating : Math.round(50 + player.starsRating * 8);
  const pos = player.favoritePosition;

  const rit = Math.min(99, base + (pos === 'atacante' ? 4 : pos === 'meio-campo' ? 2 : 0) + Math.min(5, player.victories));
  const fin = Math.min(99, base + (pos === 'atacante' ? 5 : pos === 'goleiro' ? -12 : 0) + Math.min(10, player.goals * 2));
  const pas = Math.min(99, base + (pos === 'meio-campo' ? 5 : 1) + Math.min(10, player.assists * 2));
  const dri = Math.min(99, base + (pos === 'meio-campo' || pos === 'atacante' ? 4 : 0) + Math.min(6, player.mvpCount * 2));
  const def = Math.min(99, base + (pos === 'zagueiro' || pos === 'goleiro' ? 7 : -6) + Math.min(6, player.victories));
  const fis = Math.min(99, base + 2 + Math.min(6, player.matchesPlayed));

  return [
    { code: 'RIT', label: 'Ritmo', value: Math.max(40, rit) },
    { code: 'FIN', label: 'Finalização', value: Math.max(35, fin) },
    { code: 'PAS', label: 'Passe', value: Math.max(40, pas) },
    { code: 'DRI', label: 'Drible', value: Math.max(40, dri) },
    { code: 'DEF', label: 'Defesa', value: Math.max(35, def) },
    { code: 'FIS', label: 'Físico', value: Math.max(45, fis) },
  ];
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  compact = false,
  onSelect,
  showVoteButton = false,
  onVote,
}) => {
  const pos = positionConfig[player.favoritePosition] || positionConfig['meio-campo'];
  const PosIcon = pos.Icon;
  const attributes = computeDynamicAttributes(player);

  if (compact) {
    return (
      <div
        onClick={onSelect}
        className="arena-card hover:border-emerald-500 rounded-2xl p-3.5 flex items-center gap-3.5 transition-all cursor-pointer"
      >
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 shadow-sm">
            <img
              src={player.avatarUrl || FOOTBALL_AVATARS[0].url}
              alt={player.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-full shadow">
            {player.overallRating > 0 ? player.overallRating : '--'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-black text-slate-900 truncate">{player.fullName}</h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pos.badgeClass}`}>
              {pos.short}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Camisa #{player.shirtNumber} • &quot;{player.nickname}&quot;
          </p>
        </div>

        <div className="text-right flex flex-col items-end shrink-0">
          <StarRating rating={player.starsRating} size="sm" />
          <span className="text-[11px] font-semibold text-slate-600 mt-1">
            ⚽ {player.goals}g • 👟 {player.assists}a
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className="arena-card rounded-3xl overflow-hidden hover:border-emerald-500 transition-all duration-200 flex flex-col justify-between"
    >
      {/* Topo com faixa Verde Futebol e Azul UGTSIC */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-sky-700 p-4 text-white relative">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-3xl font-black tracking-tight block leading-none">
              {player.overallRating > 0 ? player.overallRating : '--'}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100 mt-1 inline-flex items-center gap-1">
              <PosIcon className="w-3.5 h-3.5" />
              {pos.full}
            </span>
          </div>

          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-black px-2.5 py-1 rounded-full">
            #{player.shirtNumber}
          </span>
        </div>

        {/* Foto de Perfil Redonda Centralizada */}
        <div className="flex justify-center -mb-10 mt-1">
          <div className="relative">
            <div className="w-20 h-20 rounded-full p-1 bg-white shadow-md">
              <img
                src={player.avatarUrl || FOOTBALL_AVATARS[0].url}
                alt={player.fullName}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {player.mvpCount > 0 && (
              <div
                title={`${player.mvpCount}x Craque da Rodada`}
                className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 p-1 rounded-full shadow"
              >
                <Award className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Corpo do Card */}
      <div className="pt-12 px-4 pb-4 text-center flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-black text-slate-900 truncate">{player.fullName}</h3>
          <p className="text-xs text-slate-500 font-medium">
            Apelido: <span className="text-slate-700 font-bold">&quot;{player.nickname}&quot;</span>
          </p>

          <div className="flex justify-center mt-2">
            <StarRating rating={player.starsRating} size="sm" />
          </div>
        </div>

        {/* Atributos Dinâmicos da Carta (Atualizados conforme Votos, Gols e Assistências) */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">
            Atributos de Campo (Pós-Jogo)
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {attributes.map((attr) => (
              <div
                key={attr.code}
                title={attr.label}
                className="px-2 py-1.5 rounded-lg bg-slate-900 text-white flex items-center justify-between"
              >
                <span className="text-[10px] font-bold text-emerald-400">{attr.code}</span>
                <span className="text-xs font-mono font-black">
                  {attr.value > 0 ? attr.value : '--'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Estatísticas organizadas */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="bg-slate-50 rounded-xl p-2 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Gols</span>
            <span className="text-sm font-black text-emerald-700">{player.goals}</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Assist.</span>
            <span className="text-sm font-black text-sky-700">{player.assists}</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Vitórias</span>
            <span className="text-sm font-black text-slate-800">{player.victories}</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Jogos</span>
            <span className="text-sm font-black text-slate-700">{player.matchesPlayed}</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Aprov.</span>
            <span className="text-sm font-black text-sky-700">
              {player.matchesPlayed > 0
                ? Math.round((player.victories / player.matchesPlayed) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">MVPs</span>
            <span className="text-sm font-black text-amber-600">{player.mvpCount}</span>
          </div>
        </div>

        {showVoteButton && onVote && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVote();
            }}
            className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Star className="w-3.5 h-3.5 fill-white" />
            Avaliar Jogador (1 a 5 Estrelas)
          </button>
        )}
      </div>
    </div>
  );
};
