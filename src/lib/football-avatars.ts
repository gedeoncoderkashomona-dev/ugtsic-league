export interface FootballAvatarItem {
  id: string;
  name: string;
  category: 'mascotes' | 'personagens' | 'futebol' | 'especiais';
  url: string;
}

interface AvatarSpec {
  id: string;
  name: string;
  category: 'mascotes' | 'personagens' | 'futebol' | 'especiais';
  bg1: string;
  bg2: string;
  ring: string;
  accent: string;
  innerSvg: string;
}

function buildAvatarDataUri(spec: AvatarSpec): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240">
    <defs>
      <linearGradient id="bg_${spec.id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${spec.bg1}" />
        <stop offset="100%" stop-color="${spec.bg2}" />
      </linearGradient>
      <linearGradient id="acc_${spec.id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${spec.ring}" />
        <stop offset="100%" stop-color="${spec.accent}" />
      </linearGradient>
    </defs>
    <circle cx="60" cy="60" r="58" fill="url(#bg_${spec.id})" />
    <circle cx="60" cy="60" r="52" fill="none" stroke="url(#acc_${spec.id})" stroke-width="2.5" stroke-opacity="0.55" />
    <circle cx="60" cy="60" r="44" fill="#ffffff" fill-opacity="0.06" />
    ${spec.innerSvg}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const AVATAR_SPECS: AvatarSpec[] = [
  // ================= 1. MASCOTES & FERAS (13) =================
  {
    id: 'av-1',
    name: 'Leão Artilheiro',
    category: 'mascotes',
    bg1: '#7c2d12',
    bg2: '#431407',
    ring: '#fbbf24',
    accent: '#f59e0b',
    innerSvg: `
      <polygon points="60,18 76,28 92,24 88,42 100,56 88,72 92,88 74,86 60,98 46,86 28,88 32,72 20,56 32,42 28,24 44,28" fill="#d97706" stroke="#fde68a" stroke-width="2"/>
      <polygon points="40,42 80,42 84,68 60,84 36,68" fill="#fbbf24"/>
      <polygon points="46,50 56,54 48,58" fill="#1e293b"/>
      <polygon points="74,50 64,54 72,58" fill="#1e293b"/>
      <polygon points="55,64 65,64 60,71" fill="#78350f"/>
      <path d="M50,75 Q60,81 70,75" fill="none" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
    `,
  },
  {
    id: 'av-2',
    name: 'Lobo da Zaga',
    category: 'mascotes',
    bg1: '#0f172a',
    bg2: '#1e293b',
    ring: '#38bdf8',
    accent: '#0284c7',
    innerSvg: `
      <polygon points="32,24 48,42 72,42 88,24 84,56 92,70 60,94 28,70 36,56" fill="#64748b" stroke="#e2e8f0" stroke-width="2"/>
      <polygon points="44,50 60,88 76,50" fill="#cbd5e1"/>
      <polygon points="45,54 55,58 47,61" fill="#38bdf8"/>
      <polygon points="75,54 65,58 73,61" fill="#38bdf8"/>
      <polygon points="55,74 65,74 60,82" fill="#0f172a"/>
    `,
  },
  {
    id: 'av-3',
    name: 'Falcão Dourado',
    category: 'mascotes',
    bg1: '#1e3a8a',
    bg2: '#0f172a',
    ring: '#facc15',
    accent: '#eab308',
    innerSvg: `
      <path d="M26,48 Q60,20 94,48 L82,78 Q60,96 38,78 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
      <polygon points="40,50 56,56 44,60" fill="#0f172a"/>
      <polygon points="80,50 64,56 76,60" fill="#0f172a"/>
      <polygon points="50,62 70,62 60,88" fill="#f59e0b" stroke="#fef08a" stroke-width="2"/>
      <path d="M36,44 L56,52 M84,44 L64,52" stroke="#d97706" stroke-width="3.5" stroke-linecap="round"/>
    `,
  },
  {
    id: 'av-4',
    name: 'Tubarão Azul',
    category: 'mascotes',
    bg1: '#0369a1',
    bg2: '#082f49',
    ring: '#7dd3fc',
    accent: '#38bdf8',
    innerSvg: `
      <path d="M60,18 L78,44 L94,64 L78,86 L42,86 L26,64 L42,44 Z" fill="#0284c7" stroke="#bae6fd" stroke-width="2"/>
      <path d="M40,66 Q60,54 80,66 L74,84 L46,84 Z" fill="#f8fafc"/>
      <polyline points="46,72 51,78 56,72 60,78 64,72 69,78 74,72" fill="none" stroke="#ef4444" stroke-width="2.5"/>
      <circle cx="46" cy="52" r="4" fill="#fef08a"/>
      <circle cx="74" cy="52" r="4" fill="#fef08a"/>
    `,
  },
  {
    id: 'av-5',
    name: 'Pantera Negra',
    category: 'mascotes',
    bg1: '#18181b',
    bg2: '#09090b',
    ring: '#a855f7',
    accent: '#7e22ce',
    innerSvg: `
      <path d="M34,28 L48,40 L72,40 L86,28 L86,62 L60,90 L34,62 Z" fill="#27272a" stroke="#c084fc" stroke-width="2.5"/>
      <polygon points="44,54 55,58 46,62" fill="#4ade80"/>
      <polygon points="76,54 65,58 74,62" fill="#4ade80"/>
      <polygon points="56,68 64,68 60,74" fill="#e879f9"/>
      <path d="M26,64 L42,66 M94,64 L78,66 M28,72 L42,71 M92,72 L78,71" stroke="#a855f7" stroke-width="2"/>
    `,
  },
  {
    id: 'av-6',
    name: 'Dragão Esmeralda',
    category: 'mascotes',
    bg1: '#064e3b',
    bg2: '#022c22',
    ring: '#34d399',
    accent: '#10b981',
    innerSvg: `
      <polygon points="28,22 46,38 60,26 74,38 92,22 84,54 94,66 60,94 26,66 36,54" fill="#059669" stroke="#6ee7b7" stroke-width="2"/>
      <polygon points="45,54 56,60 46,63" fill="#fde047"/>
      <polygon points="75,54 64,60 74,63" fill="#fde047"/>
      <circle cx="54" cy="76" r="2.5" fill="#022c22"/>
      <circle cx="66" cy="76" r="2.5" fill="#022c22"/>
    `,
  },
  {
    id: 'av-7',
    name: 'Touro Feroz',
    category: 'mascotes',
    bg1: '#7f1d1d',
    bg2: '#450a0a',
    ring: '#f87171',
    accent: '#ef4444',
    innerSvg: `
      <path d="M20,30 Q26,52 42,46 L78,46 Q94,52 100,30 Q90,22 76,38 L44,38 Q30,22 20,30 Z" fill="#fde68a" stroke="#f59e0b" stroke-width="2"/>
      <polygon points="38,42 82,42 76,84 44,84" fill="#dc2626" stroke="#fca5a5" stroke-width="2"/>
      <circle cx="48" cy="56" r="3.5" fill="#fef08a"/>
      <circle cx="72" cy="56" r="3.5" fill="#fef08a"/>
      <circle cx="60" cy="82" r="8" fill="none" stroke="#fbbf24" stroke-width="3.5"/>
    `,
  },
  {
    id: 'av-8',
    name: 'Tigre Relâmpago',
    category: 'mascotes',
    bg1: '#9a3412',
    bg2: '#431407',
    ring: '#fb923c',
    accent: '#f97316',
    innerSvg: `
      <polygon points="32,30 46,38 74,38 88,30 90,64 60,92 30,64" fill="#f97316" stroke="#ffedd5" stroke-width="2"/>
      <path d="M32,48 L44,50 M88,48 L76,50 M30,58 L44,58 M90,58 L76,58 M60,38 L60,50" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="48" cy="56" r="3.5" fill="#bef264"/>
      <circle cx="72" cy="56" r="3.5" fill="#bef264"/>
      <polygon points="54,68 66,68 60,75" fill="#fbcfe8"/>
    `,
  },
  {
    id: 'av-9',
    name: 'Raposa Tática',
    category: 'mascotes',
    bg1: '#1e1b4b',
    bg2: '#0f172a',
    ring: '#fb923c',
    accent: '#ea580c',
    innerSvg: `
      <polygon points="28,24 50,44 70,44 92,24 88,64 60,92 32,64" fill="#ea580c" stroke="#fed7aa" stroke-width="2"/>
      <polygon points="32,64 60,92 52,62" fill="#f8fafc"/>
      <polygon points="88,64 60,92 68,62" fill="#f8fafc"/>
      <circle cx="48" cy="56" r="3.5" fill="#0f172a"/>
      <circle cx="72" cy="56" r="3.5" fill="#0f172a"/>
      <circle cx="60" cy="88" r="4.5" fill="#0f172a"/>
    `,
  },
  {
    id: 'av-10',
    name: 'Urso Muralha',
    category: 'mascotes',
    bg1: '#3f2e21',
    bg2: '#1c1917',
    ring: '#fcd34d',
    accent: '#d97706',
    innerSvg: `
      <circle cx="36" cy="36" r="10" fill="#78350f" stroke="#d97706" stroke-width="2"/>
      <circle cx="84" cy="36" r="10" fill="#78350f" stroke="#d97706" stroke-width="2"/>
      <circle cx="60" cy="62" r="28" fill="#78350f" stroke="#fcd34d" stroke-width="2"/>
      <ellipse cx="60" cy="70" rx="12" ry="10" fill="#fde68a"/>
      <circle cx="48" cy="54" r="3.5" fill="#ffffff"/>
      <circle cx="72" cy="54" r="3.5" fill="#ffffff"/>
      <polygon points="55,66 65,66 60,72" fill="#1c1917"/>
    `,
  },
  {
    id: 'av-11',
    name: 'Cobra Venenosa',
    category: 'mascotes',
    bg1: '#14532d',
    bg2: '#052e16',
    ring: '#a3e635',
    accent: '#65a30d',
    innerSvg: `
      <path d="M30,44 Q60,16 90,44 Q98,68 60,92 Q22,68 30,44 Z" fill="#16a34a" stroke="#bef264" stroke-width="2.5"/>
      <polygon points="46,42 74,42 68,78 52,78" fill="#4ade80"/>
      <polygon points="48,50 56,54 48,58" fill="#dc2626"/>
      <polygon points="72,50 64,54 72,58" fill="#dc2626"/>
      <path d="M60,78 L60,92 M55,92 L60,87 L65,92" stroke="#ef4444" stroke-width="2.5" fill="none"/>
    `,
  },
  {
    id: 'av-12',
    name: 'Fênix de Ouro',
    category: 'mascotes',
    bg1: '#7c2d12',
    bg2: '#450a0a',
    ring: '#fde047',
    accent: '#f97316',
    innerSvg: `
      <path d="M60,16 L70,34 L94,26 L82,52 L98,64 L60,96 L22,64 L38,52 L26,26 L50,34 Z" fill="#f97316" stroke="#fef08a" stroke-width="2"/>
      <polygon points="60,28 74,56 60,84 46,56" fill="#fde047"/>
      <polygon points="54,60 66,60 60,74" fill="#dc2626"/>
      <circle cx="52" cy="52" r="3" fill="#7c2d12"/>
      <circle cx="68" cy="52" r="3" fill="#7c2d12"/>
    `,
  },
  {
    id: 'av-13',
    name: 'Gorila Paredão',
    category: 'mascotes',
    bg1: '#1e293b',
    bg2: '#09090b',
    ring: '#94a3b8',
    accent: '#475569',
    innerSvg: `
      <rect x="32" y="30" width="56" height="60" rx="18" fill="#334155" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="40" y="44" width="40" height="14" rx="6" fill="#0f172a"/>
      <circle cx="50" cy="51" r="3.5" fill="#ef4444"/>
      <circle cx="70" cy="51" r="3.5" fill="#ef4444"/>
      <rect x="44" y="64" width="32" height="18" rx="8" fill="#475569"/>
      <line x1="50" y1="74" x2="70" y2="74" stroke="#f8fafc" stroke-width="3" stroke-linecap="round"/>
    `,
  },

  // ================= 2. PERSONAGENS & LENDAS (13) =================
  {
    id: 'av-14',
    name: 'Robô Striker',
    category: 'personagens',
    bg1: '#0f172a',
    bg2: '#1e3a8a',
    ring: '#22d3ee',
    accent: '#06b6d4',
    innerSvg: `
      <rect x="34" y="30" width="52" height="56" rx="12" fill="#334155" stroke="#22d3ee" stroke-width="2.5"/>
      <line x1="60" y1="18" x2="60" y2="30" stroke="#22d3ee" stroke-width="3"/>
      <circle cx="60" cy="18" r="4" fill="#22d3ee"/>
      <rect x="42" y="44" width="36" height="12" rx="4" fill="#0f172a"/>
      <rect x="46" y="47" width="10" height="6" rx="2" fill="#22d3ee"/>
      <rect x="64" y="47" width="10" height="6" rx="2" fill="#22d3ee"/>
      <line x1="46" y1="70" x2="74" y2="70" stroke="#22d3ee" stroke-width="3" stroke-dasharray="4 3"/>
    `,
  },
  {
    id: 'av-15',
    name: 'Ninja da Chuteira',
    category: 'personagens',
    bg1: '#18181b',
    bg2: '#09090b',
    ring: '#ef4444',
    accent: '#dc2626',
    innerSvg: `
      <circle cx="60" cy="60" r="30" fill="#1e293b" stroke="#475569" stroke-width="2"/>
      <rect x="30" y="44" width="60" height="16" rx="4" fill="#ef4444"/>
      <rect x="36" y="48" width="48" height="10" rx="4" fill="#fde68a"/>
      <polygon points="44,51 54,54 46,56" fill="#0f172a"/>
      <polygon points="76,51 66,54 74,56" fill="#0f172a"/>
      <circle cx="60" cy="40" r="3" fill="#ffffff"/>
    `,
  },
  {
    id: 'av-16',
    name: 'Samurai do Gramado',
    category: 'personagens',
    bg1: '#450a0a',
    bg2: '#09090b',
    ring: '#fbbf24',
    accent: '#dc2626',
    innerSvg: `
      <path d="M24,54 L40,28 L80,28 L96,54 L84,58 L36,58 Z" fill="#dc2626" stroke="#fbbf24" stroke-width="2"/>
      <polygon points="48,18 60,34 72,18 60,26" fill="#fbbf24"/>
      <rect x="40" y="54" width="40" height="30" rx="8" fill="#1e293b" stroke="#94a3b8" stroke-width="2"/>
      <circle cx="50" cy="64" r="3.5" fill="#fde047"/>
      <circle cx="70" cy="64" r="3.5" fill="#fde047"/>
      <path d="M48,76 L72,76" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
    `,
  },
  {
    id: 'av-17',
    name: 'Rei da Pelada',
    category: 'personagens',
    bg1: '#3b0764',
    bg2: '#1e1b4b',
    ring: '#fde047',
    accent: '#eab308',
    innerSvg: `
      <polygon points="28,44 36,22 50,36 60,18 70,36 84,22 92,44" fill="#facc15" stroke="#fef08a" stroke-width="2"/>
      <rect x="32" y="44" width="56" height="8" rx="3" fill="#eab308"/>
      <circle cx="60" cy="30" r="3.5" fill="#ef4444"/>
      <circle cx="42" cy="34" r="2.5" fill="#38bdf8"/>
      <circle cx="78" cy="34" r="2.5" fill="#38bdf8"/>
      <circle cx="60" cy="68" r="18" fill="#f8fafc" fill-opacity="0.15" stroke="#fde047" stroke-width="2"/>
      <text x="60" y="75" text-anchor="middle" fill="#fde047" font-size="18" font-weight="900" font-family="sans-serif">10</text>
    `,
  },
  {
    id: 'av-18',
    name: 'Viking da Defesa',
    category: 'personagens',
    bg1: '#1e293b',
    bg2: '#0f172a',
    ring: '#cbd5e1',
    accent: '#94a3b8',
    innerSvg: `
      <path d="M22,28 Q24,50 40,46 L80,46 Q96,50 98,28 Q86,38 76,38 L44,38 Q34,38 22,28 Z" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
      <path d="M36,48 A24,24 0 0,1 84,48 Z" fill="#64748b" stroke="#e2e8f0" stroke-width="2"/>
      <rect x="36" y="48" width="48" height="10" rx="2" fill="#94a3b8"/>
      <line x1="60" y1="30" x2="60" y2="66" stroke="#e2e8f0" stroke-width="4"/>
      <polygon points="40,62 60,92 80,62" fill="#d97706"/>
    `,
  },
  {
    id: 'av-19',
    name: 'Astronauta da Arena',
    category: 'personagens',
    bg1: '#09090b',
    bg2: '#1e1b4b',
    ring: '#38bdf8',
    accent: '#818cf8',
    innerSvg: `
      <circle cx="60" cy="60" r="30" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>
      <rect x="38" y="44" width="44" height="26" rx="12" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
      <path d="M44,50 Q54,46 62,50" stroke="#bae6fd" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="60" cy="82" r="4" fill="#10b981"/>
    `,
  },
  {
    id: 'av-20',
    name: 'Mago da Bola',
    category: 'personagens',
    bg1: '#311042',
    bg2: '#0f172a',
    ring: '#c084fc',
    accent: '#f472b6',
    innerSvg: `
      <polygon points="60,14 36,52 84,52" fill="#6b21a8" stroke="#d8b4fe" stroke-width="2"/>
      <ellipse cx="60" cy="52" rx="34" ry="7" fill="#7e22ce" stroke="#d8b4fe" stroke-width="2"/>
      <circle cx="48" cy="66" r="4" fill="#fde047"/>
      <circle cx="72" cy="66" r="4" fill="#fde047"/>
      <polygon points="60,30 63,36 70,36 64,40 66,46 60,42 54,46 56,40 50,36 57,36" fill="#fde047"/>
    `,
  },
  {
    id: 'av-21',
    name: 'Gladiador Imortal',
    category: 'personagens',
    bg1: '#451a03',
    bg2: '#1c1917',
    ring: '#fbbf24',
    accent: '#b45309',
    innerSvg: `
      <path d="M46,16 Q60,10 74,16 L68,32 L52,32 Z" fill="#dc2626"/>
      <path d="M36,52 A24,24 0 0,1 84,52 L82,84 L66,90 L66,64 L54,64 L54,90 L38,84 Z" fill="#d97706" stroke="#fde68a" stroke-width="2"/>
      <polygon points="44,56 54,60 44,62" fill="#0f172a"/>
      <polygon points="76,56 66,60 76,62" fill="#0f172a"/>
    `,
  },
  {
    id: 'av-22',
    name: 'Pirata do Gol',
    category: 'personagens',
    bg1: '#1e293b',
    bg2: '#09090b',
    ring: '#f43f5e',
    accent: '#e11d48',
    innerSvg: `
      <path d="M26,48 Q60,20 94,48 Z" fill="#0f172a" stroke="#f43f5e" stroke-width="2.5"/>
      <rect x="34" y="46" width="52" height="8" rx="3" fill="#e11d48"/>
      <circle cx="60" cy="68" r="20" fill="#fed7aa"/>
      <circle cx="48" cy="64" r="5.5" fill="#0f172a"/>
      <line x1="38" y1="56" x2="62" y2="70" stroke="#0f172a" stroke-width="2.5"/>
      <circle cx="70" cy="64" r="3" fill="#0f172a"/>
    `,
  },
  {
    id: 'av-23',
    name: 'Ciborgue Neon',
    category: 'personagens',
    bg1: '#042f2e',
    bg2: '#09090b',
    ring: '#2dd4bf',
    accent: '#14b8a6',
    innerSvg: `
      <polygon points="36,28 84,28 92,56 76,88 44,88 28,56" fill="#1e293b" stroke="#2dd4bf" stroke-width="2.5"/>
      <polygon points="36,48 84,48 78,60 42,60" fill="#ec4899" stroke="#fbcfe8" stroke-width="1.5"/>
      <line x1="48" y1="74" x2="72" y2="74" stroke="#2dd4bf" stroke-width="3"/>
    `,
  },
  {
    id: 'av-24',
    name: 'Xerife da Área',
    category: 'personagens',
    bg1: '#422006',
    bg2: '#1c1917',
    ring: '#facc15',
    accent: '#ca8a04',
    innerSvg: `
      <polygon points="60,22 69,42 92,44 75,59 80,82 60,70 40,82 45,59 28,44 51,42" fill="#facc15" stroke="#fef08a" stroke-width="2.5"/>
      <circle cx="60" cy="22" r="3.5" fill="#fde047"/>
      <circle cx="92" cy="44" r="3.5" fill="#fde047"/>
      <circle cx="80" cy="82" r="3.5" fill="#fde047"/>
      <circle cx="40" cy="82" r="3.5" fill="#fde047"/>
      <circle cx="28" cy="44" r="3.5" fill="#fde047"/>
      <circle cx="60" cy="56" r="10" fill="#78350f"/>
    `,
  },
  {
    id: 'av-25',
    name: 'Fantasma da Rede',
    category: 'personagens',
    bg1: '#1e1b4b',
    bg2: '#09090b',
    ring: '#a5b4fc',
    accent: '#6366f1',
    innerSvg: `
      <path d="M36,54 A24,24 0 0,1 84,54 L84,86 L74,78 L66,86 L60,78 L54,86 L46,78 L36,86 Z" fill="#e0e7ff" stroke="#818cf8" stroke-width="2"/>
      <circle cx="50" cy="52" r="4.5" fill="#1e1b4b"/>
      <circle cx="70" cy="52" r="4.5" fill="#1e1b4b"/>
      <ellipse cx="60" cy="64" rx="5" ry="6" fill="#1e1b4b"/>
    `,
  },
  {
    id: 'av-26',
    name: 'Maestro de Cartola',
    category: 'personagens',
    bg1: '#0f172a',
    bg2: '#020617',
    ring: '#38bdf8',
    accent: '#f59e0b',
    innerSvg: `
      <rect x="40" y="20" width="40" height="28" rx="3" fill="#1e293b" stroke="#94a3b8" stroke-width="2"/>
      <rect x="40" y="42" width="40" height="6" fill="#f59e0b"/>
      <rect x="28" y="48" width="64" height="5" rx="2.5" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
      <circle cx="50" cy="64" r="6" fill="none" stroke="#facc15" stroke-width="2.5"/>
      <path d="M42,80 Q52,74 60,78 Q68,74 78,80" fill="none" stroke="#f8fafc" stroke-width="3.5" stroke-linecap="round"/>
    `,
  },

  // ================= 3. ÍCONES & EMBLEMAS DE FUTEBOL (12) =================
  {
    id: 'av-27',
    name: 'Bola de Ouro',
    category: 'futebol',
    bg1: '#78350f',
    bg2: '#1c1917',
    ring: '#fde047',
    accent: '#f59e0b',
    innerSvg: `
      <circle cx="60" cy="56" r="26" fill="#facc15" stroke="#fef08a" stroke-width="2.5"/>
      <polygon points="60,42 70,50 66,62 54,62 50,50" fill="#b45309"/>
      <line x1="60" y1="30" x2="60" y2="42" stroke="#b45309" stroke-width="2.5"/>
      <line x1="70" y1="50" x2="84" y2="46" stroke="#b45309" stroke-width="2.5"/>
      <line x1="66" y1="62" x2="76" y2="76" stroke="#b45309" stroke-width="2.5"/>
      <line x1="54" y1="62" x2="44" y2="76" stroke="#b45309" stroke-width="2.5"/>
      <line x1="50" y1="50" x2="36" y2="46" stroke="#b45309" stroke-width="2.5"/>
      <rect x="44" y="84" width="32" height="8" rx="3" fill="#d97706" stroke="#fde047" stroke-width="1.5"/>
    `,
  },
  {
    id: 'av-28',
    name: 'Bola em Chamas',
    category: 'futebol',
    bg1: '#7f1d1d',
    bg2: '#09090b',
    ring: '#fb923c',
    accent: '#ef4444',
    innerSvg: `
      <path d="M60,14 Q88,36 86,64 A26,26 0 0,1 34,64 Q32,36 60,14 Z" fill="#f97316"/>
      <circle cx="60" cy="64" r="22" fill="#f8fafc" stroke="#1e293b" stroke-width="2"/>
      <polygon points="60,52 69,59 65,70 55,70 51,59" fill="#0f172a"/>
    `,
  },
  {
    id: 'av-29',
    name: 'Camisa 10 Lendária',
    category: 'futebol',
    bg1: '#064e3b',
    bg2: '#022c22',
    ring: '#34d399',
    accent: '#fbbf24',
    innerSvg: `
      <path d="M42,28 L52,24 L68,24 L78,28 L92,40 L84,54 L76,50 L76,88 L44,88 L44,50 L36,54 L28,40 Z" fill="#10b981" stroke="#a7f3d0" stroke-width="2"/>
      <text x="60" y="66" text-anchor="middle" fill="#fef08a" font-size="22" font-weight="900" font-family="sans-serif">10</text>
    `,
  },
  {
    id: 'av-30',
    name: 'Manto Azul Royal',
    category: 'futebol',
    bg1: '#1e3a8a',
    bg2: '#0f172a',
    ring: '#60a5fa',
    accent: '#3b82f6',
    innerSvg: `
      <path d="M42,28 L52,24 L68,24 L78,28 L92,40 L84,54 L76,50 L76,88 L44,88 L44,50 L36,54 L28,40 Z" fill="#2563eb" stroke="#bfdbfe" stroke-width="2"/>
      <text x="60" y="66" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="900" font-family="sans-serif">7</text>
    `,
  },
  {
    id: 'av-31',
    name: 'Manto Rubro Guerreiro',
    category: 'futebol',
    bg1: '#7f1d1d',
    bg2: '#1c1917',
    ring: '#f87171',
    accent: '#ef4444',
    innerSvg: `
      <path d="M42,28 L52,24 L68,24 L78,28 L92,40 L84,54 L76,50 L76,88 L44,88 L44,50 L36,54 L28,40 Z" fill="#dc2626" stroke="#fecaca" stroke-width="2"/>
      <text x="60" y="66" text-anchor="middle" fill="#fde047" font-size="22" font-weight="900" font-family="sans-serif">9</text>
    `,
  },
  {
    id: 'av-32',
    name: 'Chuteira de Ouro',
    category: 'futebol',
    bg1: '#422006',
    bg2: '#09090b',
    ring: '#facc15',
    accent: '#eab308',
    innerSvg: `
      <path d="M26,72 L94,72 L94,60 Q94,50 80,50 L62,50 L48,34 L32,34 L26,54 Z" fill="#facc15" stroke="#fef08a" stroke-width="2"/>
      <line x1="34" y1="72" x2="34" y2="82" stroke="#fde047" stroke-width="4" stroke-linecap="round"/>
      <line x1="46" y1="72" x2="46" y2="82" stroke="#fde047" stroke-width="4" stroke-linecap="round"/>
      <line x1="74" y1="72" x2="74" y2="82" stroke="#fde047" stroke-width="4" stroke-linecap="round"/>
      <line x1="86" y1="72" x2="86" y2="82" stroke="#fde047" stroke-width="4" stroke-linecap="round"/>
    `,
  },
  {
    id: 'av-33',
    name: 'Luva Paredão',
    category: 'futebol',
    bg1: '#065f46',
    bg2: '#0f172a',
    ring: '#fbbf24',
    accent: '#10b981',
    innerSvg: `
      <rect x="42" y="74" width="36" height="14" rx="4" fill="#d97706"/>
      <path d="M36,54 L36,42 A5,5 0 0,1 46,42 L46,30 A5,5 0 0,1 56,30 L56,26 A5,5 0 0,1 66,26 L66,32 A5,5 0 0,1 76,32 L76,56 A18,18 0 0,1 58,74 L46,74 A12,12 0 0,1 36,62 Z" fill="#fbbf24" stroke="#fef08a" stroke-width="2"/>
      <circle cx="58" cy="56" r="9" fill="#065f46"/>
    `,
  },
  {
    id: 'av-34',
    name: 'Taça dos Campeões',
    category: 'futebol',
    bg1: '#1e1b4b',
    bg2: '#09090b',
    ring: '#fde047',
    accent: '#f59e0b',
    innerSvg: `
      <path d="M40,28 L80,28 L76,58 A16,16 0 0,1 44,58 Z" fill="#facc15" stroke="#fef08a" stroke-width="2"/>
      <path d="M40,34 Q24,34 28,50 Q32,60 44,54" fill="none" stroke="#facc15" stroke-width="4"/>
      <path d="M80,34 Q96,34 92,50 Q88,60 76,54" fill="none" stroke="#facc15" stroke-width="4"/>
      <rect x="54" y="70" width="12" height="14" fill="#eab308"/>
      <rect x="42" y="84" width="36" height="8" rx="3" fill="#ca8a04" stroke="#fef08a" stroke-width="1.5"/>
    `,
  },
  {
    id: 'av-35',
    name: 'Escudo Real UGTSIC',
    category: 'futebol',
    bg1: '#0c4a6e',
    bg2: '#0f172a',
    ring: '#38bdf8',
    accent: '#10b981',
    innerSvg: `
      <path d="M32,26 L60,18 L88,26 L88,58 Q88,82 60,96 Q32,82 32,58 Z" fill="#0284c7" stroke="#bae6fd" stroke-width="3"/>
      <path d="M60,18 L88,26 L88,58 Q88,82 60,96 Z" fill="#059669" fill-opacity="0.85"/>
      <polygon points="60,38 65,50 78,50 68,58 72,70 60,62 48,70 52,58 42,50 55,50" fill="#fde047"/>
    `,
  },
  {
    id: 'av-36',
    name: 'Apito de Ouro',
    category: 'futebol',
    bg1: '#1e293b',
    bg2: '#09090b',
    ring: '#facc15',
    accent: '#38bdf8',
    innerSvg: `
      <path d="M52,44 L92,44 A6,6 0 0,1 98,50 L98,58 A6,6 0 0,1 92,64 L72,64 L64,74 A20,20 0 1,1 52,44 Z" fill="#facc15" stroke="#fef08a" stroke-width="2.5"/>
      <circle cx="46" cy="64" r="7" fill="#78350f"/>
      <line x1="60" y1="24" x2="60" y2="34" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
      <line x1="46" y1="28" x2="52" y2="36" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
      <line x1="74" y1="28" x2="68" y2="36" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
    `,
  },
  {
    id: 'av-37',
    name: 'Campo Tático Pro',
    category: 'futebol',
    bg1: '#14532d',
    bg2: '#052e16',
    ring: '#4ade80',
    accent: '#22c55e',
    innerSvg: `
      <rect x="26" y="32" width="68" height="56" rx="6" fill="#15803d" stroke="#ffffff" stroke-width="2.5"/>
      <line x1="60" y1="32" x2="60" y2="88" stroke="#ffffff" stroke-width="2"/>
      <circle cx="60" cy="60" r="12" fill="none" stroke="#ffffff" stroke-width="2"/>
      <rect x="26" y="46" width="12" height="28" fill="none" stroke="#ffffff" stroke-width="2"/>
      <rect x="82" y="46" width="12" height="28" fill="none" stroke="#ffffff" stroke-width="2"/>
    `,
  },
  {
    id: 'av-38',
    name: 'No Ângulo (Coruja)',
    category: 'futebol',
    bg1: '#0f172a',
    bg2: '#1e293b',
    ring: '#38bdf8',
    accent: '#facc15',
    innerSvg: `
      <polyline points="26,82 26,34 94,34 94,82" fill="none" stroke="#f8fafc" stroke-width="5" stroke-linejoin="round"/>
      <line x1="26" y1="50" x2="94" y2="50" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 4"/>
      <line x1="26" y1="66" x2="94" y2="66" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 4"/>
      <circle cx="76" cy="50" r="11" fill="#facc15" stroke="#ffffff" stroke-width="2"/>
    `,
  },

  // ================= 4. ESPECIAIS & CYBER SOCCER (12) =================
  {
    id: 'av-39',
    name: 'Relâmpago da Velocidade',
    category: 'especiais',
    bg1: '#1e1b4b',
    bg2: '#09090b',
    ring: '#fde047',
    accent: '#38bdf8',
    innerSvg: `
      <polygon points="68,16 34,62 58,62 48,104 86,54 62,54" fill="#fde047" stroke="#ffffff" stroke-width="2"/>
    `,
  },
  {
    id: 'av-40',
    name: 'Escudo Diamante',
    category: 'especiais',
    bg1: '#082f49',
    bg2: '#020617',
    ring: '#38bdf8',
    accent: '#7dd3fc',
    innerSvg: `
      <polygon points="40,28 80,28 96,48 60,94 24,48" fill="#0ea5e9" stroke="#e0f2fe" stroke-width="2.5"/>
      <polygon points="40,28 80,28 60,94" fill="#38bdf8" fill-opacity="0.45"/>
      <line x1="24" y1="48" x2="96" y2="48" stroke="#e0f2fe" stroke-width="2"/>
    `,
  },
  {
    id: 'av-41',
    name: 'Estrela Suprema',
    category: 'especiais',
    bg1: '#064e3b',
    bg2: '#0f172a',
    ring: '#fde047',
    accent: '#10b981',
    innerSvg: `
      <polygon points="60,18 71,44 98,46 77,64 84,92 60,76 36,92 43,64 22,46 49,44" fill="#facc15" stroke="#fef08a" stroke-width="2.5"/>
      <polygon points="60,32 66,48 82,49 70,60 74,76 60,67 46,76 50,60 38,49 54,48" fill="#f59e0b"/>
    `,
  },
  {
    id: 'av-42',
    name: 'Cometa Artilheiro',
    category: 'especiais',
    bg1: '#311042',
    bg2: '#09090b',
    ring: '#f472b6',
    accent: '#c084fc',
    innerSvg: `
      <path d="M22,88 L56,42 L78,64 Z" fill="#ec4899" fill-opacity="0.75"/>
      <circle cx="72" cy="48" r="18" fill="#facc15" stroke="#ffffff" stroke-width="2.5"/>
      <polygon points="72,38 78,44 75,53 69,53 66,44" fill="#7c2d12"/>
    `,
  },
  {
    id: 'av-43',
    name: 'Muralha Blindada',
    category: 'especiais',
    bg1: '#1e293b',
    bg2: '#020617',
    ring: '#10b981',
    accent: '#059669',
    innerSvg: `
      <path d="M30,26 L60,18 L90,26 L86,66 Q60,96 34,66 Z" fill="#334155" stroke="#34d399" stroke-width="3"/>
      <line x1="32" y1="46" x2="88" y2="46" stroke="#34d399" stroke-width="2.5"/>
      <line x1="60" y1="18" x2="60" y2="88" stroke="#34d399" stroke-width="2.5"/>
    `,
  },
  {
    id: 'av-44',
    name: 'Radar do Maestro',
    category: 'especiais',
    bg1: '#022c22',
    bg2: '#09090b',
    ring: '#10b981',
    accent: '#34d399',
    innerSvg: `
      <circle cx="60" cy="60" r="32" fill="none" stroke="#10b981" stroke-width="2"/>
      <circle cx="60" cy="60" r="20" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4 3"/>
      <circle cx="60" cy="60" r="6" fill="#34d399"/>
      <line x1="60" y1="60" x2="84" y2="38" stroke="#6ee7b7" stroke-width="3" stroke-linecap="round"/>
      <circle cx="74" cy="46" r="4" fill="#fde047"/>
    `,
  },
  {
    id: 'av-45',
    name: 'Bola Cyberpunk',
    category: 'especiais',
    bg1: '#09090b',
    bg2: '#1e1b4b',
    ring: '#ec4899',
    accent: '#06b6d4',
    innerSvg: `
      <circle cx="60" cy="60" r="28" fill="#0f172a" stroke="#06b6d4" stroke-width="3"/>
      <polygon points="60,44 72,53 67,68 53,68 48,53" fill="none" stroke="#ec4899" stroke-width="3"/>
      <circle cx="60" cy="60" r="4" fill="#fde047"/>
    `,
  },
  {
    id: 'av-46',
    name: 'Foguete da Vitória',
    category: 'especiais',
    bg1: '#0f172a',
    bg2: '#1e3a8a',
    ring: '#f97316',
    accent: '#38bdf8',
    innerSvg: `
      <path d="M60,18 Q78,38 74,70 L46,70 Q42,38 60,18 Z" fill="#f8fafc" stroke="#38bdf8" stroke-width="2.5"/>
      <polygon points="46,56 32,74 46,70" fill="#ef4444"/>
      <polygon points="74,56 88,74 74,70" fill="#ef4444"/>
      <circle cx="60" cy="46" r="7" fill="#0284c7"/>
      <polygon points="50,70 60,92 70,70" fill="#f97316"/>
    `,
  },
  {
    id: 'av-47',
    name: 'Coroa Imperial',
    category: 'especiais',
    bg1: '#064e3b',
    bg2: '#022c22',
    ring: '#fde047',
    accent: '#eab308',
    innerSvg: `
      <polygon points="24,74 30,36 48,54 60,28 72,54 90,36 96,74" fill="#facc15" stroke="#fef08a" stroke-width="2.5"/>
      <rect x="26" y="74" width="68" height="10" rx="4" fill="#ca8a04"/>
      <circle cx="60" cy="24" r="4" fill="#fde047"/>
    `,
  },
  {
    id: 'av-48',
    name: 'Alvo Preciso (Sniper)',
    category: 'especiais',
    bg1: '#450a0a',
    bg2: '#09090b',
    ring: '#ef4444',
    accent: '#f87171',
    innerSvg: `
      <circle cx="60" cy="60" r="28" fill="none" stroke="#ef4444" stroke-width="3"/>
      <circle cx="60" cy="60" r="14" fill="none" stroke="#f87171" stroke-width="2"/>
      <circle cx="60" cy="60" r="4" fill="#fde047"/>
      <line x1="60" y1="22" x2="60" y2="98" stroke="#ef4444" stroke-width="2"/>
      <line x1="22" y1="60" x2="98" y2="60" stroke="#ef4444" stroke-width="2"/>
    `,
  },
  {
    id: 'av-49',
    name: 'Chama Olímpica',
    category: 'especiais',
    bg1: '#1e3a8a',
    bg2: '#09090b',
    ring: '#fb923c',
    accent: '#facc15',
    innerSvg: `
      <path d="M60,18 Q84,38 72,62 Q60,72 48,62 Q36,38 60,18 Z" fill="#f97316"/>
      <path d="M60,30 Q72,44 66,58 Q60,64 54,58 Q48,44 60,30 Z" fill="#fde047"/>
      <polygon points="48,64 72,64 64,94 56,94" fill="#94a3b8" stroke="#e2e8f0" stroke-width="2"/>
    `,
  },
  {
    id: 'av-50',
    name: 'Lenda Invicta (MVP)',
    category: 'especiais',
    bg1: '#0f172a',
    bg2: '#064e3b',
    ring: '#fde047',
    accent: '#34d399',
    innerSvg: `
      <polygon points="60,14 94,34 94,74 60,98 26,74 26,34" fill="#059669" stroke="#fde047" stroke-width="3"/>
      <text x="60" y="64" text-anchor="middle" fill="#fde047" font-size="22" font-weight="900" font-family="sans-serif">MVP</text>
      <polygon points="60,24 63,31 70,31 65,35 67,42 60,38 53,42 55,35 50,31 57,31" fill="#fde047"/>
    `,
  },
];

export const FOOTBALL_AVATARS: FootballAvatarItem[] = AVATAR_SPECS.map((spec) => ({
  id: spec.id,
  name: spec.name,
  category: spec.category,
  url: buildAvatarDataUri(spec),
}));
