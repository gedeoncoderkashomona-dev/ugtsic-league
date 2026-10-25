'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PlayerProfile, Position } from '@/types';
import { processProfileAvatar } from '@/lib/image-processor';
import { FOOTBALL_AVATARS, FootballAvatarItem } from '@/lib/football-avatars';
import { X, Camera, Save, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { GlovesIcon, JerseyIcon, PitchIcon, CleatsIcon } from './FootballIcons';

interface ProfileModalProps {
  player: PlayerProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: PlayerProfile) => void;
  onReopenOnboarding?: () => void;
}

type AvatarFilterCategory = 'todos' | FootballAvatarItem['category'];

const AVATAR_CATEGORIES: { id: AvatarFilterCategory; label: string }[] = [
  { id: 'todos', label: 'Todos (50)' },
  { id: 'mascotes', label: 'Mascotes' },
  { id: 'personagens', label: 'Personagens' },
  { id: 'futebol', label: 'Futebol' },
  { id: 'especiais', label: 'Especiais' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  player,
  isOpen,
  onClose,
  onSave,
  onReopenOnboarding,
}) => {
  const [fullName, setFullName] = useState(player.fullName);
  const [nickname, setNickname] = useState(player.nickname);
  const [shirtNumber, setShirtNumber] = useState(player.shirtNumber);
  const [favoritePosition, setFavoritePosition] = useState<Position>(player.favoritePosition);
  const [avatarUrl, setAvatarUrl] = useState(player.avatarUrl);
  const [selectedCategory, setSelectedCategory] = useState<AvatarFilterCategory>('todos');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFullName(player.fullName);
    setNickname(player.nickname);
    setShirtNumber(player.shirtNumber);
    setFavoritePosition(player.favoritePosition);
    setAvatarUrl(player.avatarUrl || FOOTBALL_AVATARS[0].url);
  }, [player, isOpen]);

  if (!isOpen) return null;

  const filteredAvatars =
    selectedCategory === 'todos'
      ? FOOTBALL_AVATARS
      : FOOTBALL_AVATARS.filter((item) => item.category === selectedCategory);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      setErrorMessage(null);
      const optimizedDataUrl = await processProfileAvatar(file);
      setAvatarUrl(optimizedDataUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar imagem.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }

    const updated: PlayerProfile = {
      ...player,
      fullName,
      nickname,
      shirtNumber: Number(shirtNumber) || 10,
      favoritePosition,
      avatarUrl: avatarUrl || FOOTBALL_AVATARS[0].url,
    };

    onSave(updated);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mb-3 animate-bounce" />
            <h3 className="text-xl font-black text-slate-900">Perfil Salvo Permanentemente!</h3>
            <p className="text-sm text-slate-500 mt-1">
              Sua foto, emblema e posição ficam salvos no banco da UGTSIC League.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="text-center mb-4">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                UGTSIC League • SESAP
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-2">Meu Perfil de Jogador</h2>
              <p className="text-xs text-slate-500">
                Personalize sua foto ou escolha um dos 50 emblemas de futebol
              </p>
            </div>

            <div className="flex flex-col items-center mb-4">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-emerald-600 to-sky-600 shadow-lg overflow-hidden">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 relative">
                    <img
                      src={avatarUrl || FOOTBALL_AVATARS[0].url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                    {isProcessingImage && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-white font-bold">
                        Otimizando...
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full shadow-md hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                Enviar Minha Foto
              </button>
            </div>

            {/* Galeria de 50 Avatares no Modal de Perfil */}
            <div className="mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-600">
                  Ou escolha um avatar exclusivo (50 opções):
                </span>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-1.5">
                {AVATAR_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5 max-h-28 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200/80">
                {filteredAvatars.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    title={av.name}
                    onClick={() => setAvatarUrl(av.url)}
                    className={`p-1 rounded-xl flex flex-col items-center transition-all ${
                      avatarUrl === av.url
                        ? 'bg-emerald-50 ring-2 ring-emerald-600 scale-105'
                        : 'hover:bg-slate-50 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Apelido na Camisa
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Seu apelido da camisa"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nº da Camisa
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={shirtNumber}
                    onChange={(e) => setShirtNumber(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Posição Preferida em Campo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: 'goleiro', label: 'Goleiro', Icon: GlovesIcon },
                      { id: 'zagueiro', label: 'Zagueiro', Icon: JerseyIcon },
                      { id: 'meio-campo', label: 'Meio-Campo', Icon: PitchIcon },
                      { id: 'atacante', label: 'Atacante', Icon: CleatsIcon },
                    ] as { id: Position; label: string; Icon: React.FC<{ className?: string }> }[]
                  ).map((pos) => {
                    const Icon = pos.Icon;
                    const active = favoritePosition === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setFavoritePosition(pos.id)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                          active
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{pos.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessingImage}
              className="mt-6 w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              SALVAR PERFIL E FOTO
            </button>

            {onReopenOnboarding && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReopenOnboarding();
                }}
                className="mt-2 w-full py-2 text-xs font-bold text-slate-500 hover:text-emerald-700 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Abrir Tela de 1º Acesso / Novo Credenciamento
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
