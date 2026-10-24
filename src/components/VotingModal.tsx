'use client';

import React, { useState } from 'react';
import { PlayerProfile } from '@/types';
import { StarRating } from './StarRating';
import { X, Award, CheckCircle2, Star } from 'lucide-react';
import { GlovesIcon, JerseyIcon, PitchIcon, CleatsIcon } from './FootballIcons';
import confetti from 'canvas-confetti';

interface VotingModalProps {
  player: PlayerProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveVote: (playerId: string, rating: number, categoryVote?: string) => void;
}

export const VotingModal: React.FC<VotingModalProps> = ({
  player,
  isOpen,
  onClose,
  onSaveVote,
}) => {
  const [stars, setStars] = useState<number>(4.5);
  const [category, setCategory] = useState<string>('mvp');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSaveVote(player.id, stars, category);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackSuccess(false);
      onClose();
    }, 1100);
  };

  const getStarLabel = (val: number) => {
    if (val >= 4.5) return '👑 Top / Craque Absoluto (5 Estrelas)';
    if (val >= 3.5) return '⭐ Muito Bom / Jogou Demais';
    if (val >= 2.5) return '⚽ Bom / Cumpriu o Papel em Campo';
    if (val >= 1.5) return '⚠️ Abaixo da Média';
    return '🥾 Ruim (1 Estrela)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {feedbackSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mb-3 animate-bounce" />
            <h3 className="text-xl font-black text-slate-900">Voto Computado!</h3>
            <p className="text-sm text-slate-500 mt-1">
              O ranking de estrelas do jogador foi atualizado.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <img
                src={player.avatarUrl}
                alt={player.fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600 shadow-sm"
              />
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Votação da Pelada
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{player.fullName}</h3>
                <p className="text-xs text-slate-500 capitalize font-medium">
                  {player.favoritePosition} • Camisa #{player.shirtNumber}
                </p>
              </div>
            </div>

            <div className="mt-5 text-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Toque nas estrelas para dar sua nota (1.0 a 5.0):
              </label>

              <div className="flex justify-center my-3">
                <StarRating
                  rating={stars}
                  interactive={true}
                  size="lg"
                  onRatingChange={(newVal) => setStars(newVal)}
                />
              </div>

              <div className="flex justify-center gap-1.5 my-2">
                {[1, 2.5, 3.5, 5].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setStars(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                      stars === preset
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset} ★
                  </button>
                ))}
              </div>

              <p className="text-xs font-bold text-emerald-700 mt-2">{getStarLabel(stars)}</p>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Destaque por Categoria:
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'mvp', label: 'Craque (MVP)', Icon: Award },
                  { id: 'melhor_goleiro', label: 'Melhor Goleiro', Icon: GlovesIcon },
                  { id: 'melhor_zagueiro', label: 'Melhor Zagueiro', Icon: JerseyIcon },
                  { id: 'melhor_meio', label: 'Melhor Meia', Icon: PitchIcon },
                  { id: 'melhor_atacante', label: 'Melhor Atacante', Icon: CleatsIcon },
                ].map((cat) => {
                  const Icon = cat.Icon;
                  const active = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                        active
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-black'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className="mt-6 w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
              <Star className="w-4 h-4 fill-white" />
              CONFIRMAR AVALIAÇÃO
            </button>
          </>
        )}
      </div>
    </div>
  );
};
