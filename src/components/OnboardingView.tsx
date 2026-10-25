'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PlayerProfile, Position, PreferencePosition } from '@/types';
import { processProfileAvatar } from '@/lib/image-processor';
import { FOOTBALL_AVATARS, FootballAvatarItem } from '@/lib/football-avatars';
import {
  Camera,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import {
  SoccerBallIcon,
  GlovesIcon,
  JerseyIcon,
  PitchIcon,
  CleatsIcon,
} from './FootballIcons';
import confetti from 'canvas-confetti';

interface OnboardingViewProps {
  initialPlayer: PlayerProfile;
  onCompleteOnboarding: (
    updatedProfile: PlayerProfile,
    initialCheckInPreference: PreferencePosition | 'nao_confirmar'
  ) => void;
}

const PREVIEW_SHOWCASE_PROFILES: {
  url: string;
  genderLabel: string;
  sampleName: string;
  sampleNick: string;
}[] = [
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    genderLabel: 'Perfil Masculino',
    sampleName: 'Seu Nome Aqui',
    sampleNick: 'Craque',
  },
  {
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    genderLabel: 'Perfil Masculino',
    sampleName: 'Seu Nome Aqui',
    sampleNick: 'Capitão',
  },
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    genderLabel: 'Perfil Feminino',
    sampleName: 'Seu Nome Aqui',
    sampleNick: 'Artilheira',
  },
  {
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    genderLabel: 'Perfil Masculino',
    sampleName: 'Seu Nome Aqui',
    sampleNick: 'Maestro',
  },
  {
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    genderLabel: 'Perfil Feminino',
    sampleName: 'Seu Nome Aqui',
    sampleNick: 'Camisa 10',
  },
];

const TECH_ROLES = [
  'Dev SESAP',
  'Frontend',
  'Backend',
  'Fullstack',
  'Tech Lead',
  'DevOps',
  'QA',
  'UX/UI',
];

type AvatarFilterCategory = 'todos' | FootballAvatarItem['category'];

const AVATAR_CATEGORIES: { id: AvatarFilterCategory; label: string }[] = [
  { id: 'todos', label: 'Todos (50)' },
  { id: 'mascotes', label: 'Mascotes & Feras' },
  { id: 'personagens', label: 'Personagens' },
  { id: 'futebol', label: 'Futebol' },
  { id: 'especiais', label: 'Especiais' },
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  initialPlayer,
  onCompleteOnboarding,
}) => {
  const existingRoleMatch = initialPlayer.fullName.match(/\((.*?)\)/);
  const cleanInitialName = initialPlayer.fullName.replace(/\s*\(.*?\)\s*/g, '').trim();

  const [fullName, setFullName] = useState(cleanInitialName || '');
  const [nickname, setNickname] = useState(initialPlayer.nickname || '');
  const [techRole, setTechRole] = useState(existingRoleMatch ? existingRoleMatch[1] : 'Dev SESAP');
  const [shirtNumber, setShirtNumber] = useState<string>(
    initialPlayer.shirtNumber ? String(initialPlayer.shirtNumber) : '10'
  );
  const [favoritePosition, setFavoritePosition] = useState<Position>(
    initialPlayer.favoritePosition || 'meio-campo'
  );
  const [checkInPref, setCheckInPref] = useState<PreferencePosition | 'nao_confirmar'>('linha');
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>(initialPlayer.avatarUrl || '');
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<AvatarFilterCategory>('todos');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (customAvatarUrl) return;
    const interval = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % PREVIEW_SHOWCASE_PROFILES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [customAvatarUrl]);

  const currentShowcase = PREVIEW_SHOWCASE_PROFILES[previewIndex];
  const activeAvatarUrl = customAvatarUrl || currentShowcase.url;

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
      setCustomAvatarUrl(optimizedDataUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar a foto.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setErrorMessage('Informe seu nome para montar sua carta de jogador.');
      return;
    }

    const formattedFullName = techRole ? `${trimmedName} (${techRole})` : trimmedName;
    const finalNickname = nickname.trim() || trimmedName.split(' ')[0];
    const finalAvatar = customAvatarUrl || FOOTBALL_AVATARS[0].url;

    const parsedShirt = parseInt(shirtNumber, 10);
    const validShirtNumber = Number.isNaN(parsedShirt)
      ? 10
      : Math.max(1, Math.min(99, parsedShirt));

    const updatedProfile: PlayerProfile = {
      ...initialPlayer,
      fullName: formattedFullName,
      nickname: finalNickname,
      shirtNumber: validShirtNumber,
      favoritePosition,
      avatarUrl: finalAvatar,
    };

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onCompleteOnboarding(updatedProfile, checkInPref);
  };

  const posLabelMap: Record<Position, string> = {
    goleiro: 'Goleiro',
    zagueiro: 'Zagueiro',
    'meio-campo': 'Meio-Campo',
    atacante: 'Atacante',
  };

  return (
    <div className="min-h-screen py-6 px-3 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* COLUNA ESQUERDA (5 COLUNAS): CAMPO DE BOAS-VINDAS + PREVIEW AO VIVO DO CRACHÁ/CARTA */}
        <div
          className="lg:col-span-5 rounded-3xl p-6 sm:p-7 text-white shadow-xl border-2 border-emerald-700/80 relative overflow-hidden flex flex-col justify-between"
          style={{
            backgroundColor: '#14532d',
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.04) 0px,
                rgba(255, 255, 255, 0.04) 40px,
                transparent 40px,
                transparent 80px
              ),
              linear-gradient(155deg, #14532d 0%, #15803d 52%, #0c4a6e 100%)
            `,
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
            viewBox="0 0 400 520"
            preserveAspectRatio="xMidYMid slice"
          >
            <rect x="16" y="16" width="368" height="488" rx="14" fill="none" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="16" y1="260" x2="384" y2="260" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="200" cy="260" r="52" fill="none" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="200" cy="260" r="4" fill="#ffffff" />
            <rect x="110" y="16" width="180" height="70" fill="none" stroke="#ffffff" strokeWidth="2.5" />
            <rect x="110" y="434" width="180" height="70" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          </svg>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-200 mb-4">
              <SoccerBallIcon className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>BEM-VINDO À UGTSIC LEAGUE</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              Credenciamento Oficial de Atleta
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
              Configure seu nome, posição, número da camisa e sua foto ou emblema. Seus dados compõem a escalação, o placar e o ranking 5 estrelas da pelada SESAP / G Trigueiro.
            </p>
          </div>

          {/* PREVIEW EM TEMPO REAL DA CARTA DO JOGADOR */}
          <div className="relative z-10 my-6 bg-black/35 backdrop-blur-md border border-white/25 rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between gap-2 mb-3.5">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Preview da Sua Carta</span>
              </span>
              <span className="text-xs font-black bg-emerald-500 text-slate-950 px-3 py-1 rounded-full whitespace-nowrap shrink-0 shadow-sm">
                {initialPlayer.overallRating} OVR
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={activeAvatarUrl}
                  alt={fullName || 'Jogador'}
                  className="w-20 h-20 rounded-full object-cover border-4 border-emerald-400 shadow-md transition-all duration-500 bg-slate-900"
                />
                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full shadow">
                  #{shirtNumber || 10}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-300 block">
                  {techRole} • {posLabelMap[favoritePosition]}
                </span>
                <h3 className="text-lg font-black text-white truncate">
                  {fullName.trim() || currentShowcase.sampleName}
                </h3>
                <p className="text-xs text-emerald-200 font-bold truncate">
                  &quot;{nickname.trim() || (fullName.trim() ? fullName.trim().split(' ')[0] : currentShowcase.sampleNick)}&quot;
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs font-black text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-lg whitespace-nowrap shrink-0">
                    ★ {initialPlayer.starsRating.toFixed(1)}
                  </span>
                  <span className="text-[11px] text-emerald-100 font-semibold whitespace-nowrap">
                    {checkInPref === 'nao_confirmar'
                      ? 'Fora da lista hoje'
                      : `Confirmado (${checkInPref.toUpperCase()})`}
                  </span>
                </div>
              </div>
            </div>

            {!customAvatarUrl && (
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-end gap-1.5">
                {PREVIEW_SHOWCASE_PROFILES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPreviewIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      previewIndex === idx ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Ver demonstração ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="relative z-10 text-[11px] text-emerald-100/80 font-medium flex items-center justify-between border-t border-white/15 pt-3">
            <span>⚽ Pelada Society • Natal/RN</span>
            <span>UGTSIC / SESAP / G Trigueiro</span>
          </div>
        </div>

        {/* COLUNA DIREITA (7 COLUNAS): FORMULÁRIO COMPLETO DE PRIMEIRO ACESSO */}
        <div className="lg:col-span-7 arena-card rounded-3xl p-5 sm:p-7 flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                1º Acesso • Cadastro Rápido
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Monte seu Perfil de Jogador
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Após concluir, o aplicativo abrirá com os atletas confirmados, sorteio de times, placar e ranking.
              </p>
            </div>

            {/* 1. Upload de Foto Circular + Galeria Exclusiva com 50 Avatares de Futebol/Personagens */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer shrink-0"
                >
                  <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-emerald-600 to-sky-600 shadow-md">
                    <img
                      src={activeAvatarUrl}
                      alt="Sua Foto"
                      className="w-full h-full rounded-full object-cover bg-slate-900"
                    />
                    {isProcessingImage && (
                      <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-[10px] text-white font-bold">
                        Otimizando...
                      </div>
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 text-white rounded-full shadow-md group-hover:scale-110 transition-transform">
                    <Camera className="w-3.5 h-3.5" />
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-sm transition-all inline-flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Enviar Minha Foto</span>
                    </button>
                    {customAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => setCustomAvatarUrl('')}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] transition-colors"
                      >
                        Ver preview automático
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Ou escolha abaixo um dos <strong>50 avatares exclusivos</strong> (mascotes, lendas e ícones do futebol):
                  </p>
                </div>
              </div>

              {/* Abas de Categorias dos 50 Avatares */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {AVATAR_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grade Rolável dos 50 Avatares */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-36 overflow-y-auto p-1.5 bg-white rounded-xl border border-slate-200/80">
                {filteredAvatars.map((avatar) => {
                  const isSelected = customAvatarUrl === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      title={avatar.name}
                      onClick={() => setCustomAvatarUrl(avatar.url)}
                      className={`group flex flex-col items-center p-1 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-emerald-50 ring-2 ring-emerald-600 scale-105'
                          : 'hover:bg-slate-50 opacity-90 hover:opacity-100'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 truncate w-full text-center mt-0.5">
                        {avatar.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 2. Nome Completo + Apelido + Nº Camisa */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Apelido na Camisa
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Seu apelido da camisa"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nº Camisa
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  placeholder="10"
                  value={shirtNumber}
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                    setShirtNumber(onlyDigits.slice(0, 2));
                  }}
                  className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-black text-center focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* 3. Função / Equipe na UGTSIC */}
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <Briefcase className="w-3.5 h-3.5 text-sky-600" />
                <span>Sua Função no Setor (UGTSIC / SESAP / G Trigueiro)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TECH_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTechRole(role)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      techRole === role
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Posição Favorita em Campo */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Sua Posição Favorita em Campo
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                      className={`py-2.5 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        active
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{pos.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Confirmar Presença na Pelada Atual */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Vai jogar na próxima pelada (Quarta, 19:30)?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'linha', label: 'Sim (Linha)' },
                    { id: 'goleiro', label: 'Sim (Goleiro)' },
                    { id: 'reserva', label: 'Sim (Reserva)' },
                    { id: 'nao_confirmar', label: 'Ainda não sei' },
                  ] as { id: PreferencePosition | 'nao_confirmar'; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCheckInPref(opt.id)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                      checkInPref === opt.id
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessingImage}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Entrar em Campo & Abrir o Aplicativo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
