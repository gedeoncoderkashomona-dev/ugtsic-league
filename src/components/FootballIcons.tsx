import React from 'react';

interface IconProps {
  className?: string;
  teamColor?: 'blue' | 'red' | 'emerald';
}

/**
 * 1. Bola de Futebol Oficial (Telstar Clássica com gomos pretos e brancos em alto contraste)
 *    Gira e quica suavemente mantendo a leitura imediata de uma bola de futebol real.
 */
export const SoccerBallIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`anim-soccer-ball ${className}`}
  >
    {/* Corpo Esférico Branco com Sombra Interna Suave */}
    <circle cx="16" cy="16" r="14" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
    <circle cx="16" cy="16" r="12.5" fill="none" stroke="#cbd5e1" strokeWidth="0.6" />

    {/* Pentágono Central Preto Clássico */}
    <polygon
      points="16,10.2 21.5,14.2 19.4,20.6 12.6,20.6 10.5,14.2"
      fill="#0f172a"
    />

    {/* Costuras dos Hexágonos Conectando ao Pentágono Central */}
    <line x1="16" y1="10.2" x2="16" y2="4.5" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="21.5" y1="14.2" x2="26.8" y2="11.8" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="19.4" y1="20.6" x2="23.8" y2="25.5" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="12.6" y1="20.6" x2="8.2" y2="25.5" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="10.5" y1="14.2" x2="5.2" y2="11.8" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />

    {/* Gomos Pretos das Bordas da Esfera (Efeito 3D de Bola de Futebol Real) */}
    <path d="M12,2.6 L16,4.8 L20,2.6 A14,14 0 0,0 12,2.6 Z" fill="#0f172a" />
    <path d="M26.8,11.8 L28.8,7.6 A14,14 0 0,1 29.8,14.8 L26.8,11.8 Z" fill="#0f172a" />
    <path d="M23.8,25.5 L28.2,23.2 A14,14 0 0,1 21.5,28.8 L23.8,25.5 Z" fill="#0f172a" />
    <path d="M8.2,25.5 L10.5,28.8 A14,14 0 0,1 3.8,23.2 L8.2,25.5 Z" fill="#0f172a" />
    <path d="M5.2,11.8 L2.2,14.8 A14,14 0 0,1 3.2,7.6 L5.2,11.8 Z" fill="#0f172a" />

    {/* Brilho Superior da Esfera */}
    <path
      d="M9,6.5 A10,10 0 0,1 15,4"
      stroke="#ffffff"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeOpacity="0.7"
    />
  </svg>
);

/**
 * Logo Oficial UGTSIC League: Fusão Elegante entre Desenvolvimento (Notebook + Código `</>`)
 * e Futebol Society (Escudo Esportivo + Bola de Futebol Oficial).
 */
export const DevSoccerLogo: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="ugtsicShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#059669" />
        <stop offset="52%" stopColor="#047857" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
      <linearGradient id="ugtsicGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#fef08a" />
      </linearGradient>
      <linearGradient id="screenGlow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
    </defs>

    {/* Escudo de Clube Esportivo Premium */}
    <path
      d="M32 3L57 12V30C57 45.8 46.2 56.8 32 61C17.8 56.8 7 45.8 7 30V12L32 3Z"
      fill="url(#ugtsicShieldGrad)"
      stroke="url(#ugtsicGoldRim)"
      strokeWidth="2.8"
    />

    {/* Linhas sutis de campo dentro do escudo */}
    <path
      d="M32 7L53 14.5V29.5C53 43 43.8 52.8 32 56.6C20.2 52.8 11 43 11 29.5V14.5L32 7Z"
      fill="none"
      stroke="#ffffff"
      strokeOpacity="0.18"
      strokeWidth="1.2"
    />

    {/* Notebook Dev Aberto no Centro do Escudo */}
    <rect
      x="15"
      y="17"
      width="34"
      height="22"
      rx="3"
      fill="url(#screenGlow)"
      stroke="#38bdf8"
      strokeWidth="1.8"
    />
    {/* Ponto da Webcam no Notebook */}
    <circle cx="32" cy="19.2" r="0.9" fill="#38bdf8" />

    {/* Símbolo Dev </> Brilhando na Tela do Notebook (Lado Esquerdo) */}
    <path
      d="M22.5 25L19 28L22.5 31"
      stroke="#34d399"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M29.5 25L33 28L29.5 31"
      stroke="#34d399"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="27"
      y1="24.2"
      x2="25"
      y2="31.8"
      stroke="#38bdf8"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Base / Teclado do Notebook */}
    <path
      d="M11 39H53L50 43.5H14L11 39Z"
      fill="#e2e8f0"
      stroke="#0f172a"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <rect x="27" y="39.8" width="10" height="1.5" rx="0.75" fill="#64748b" />

    {/* Bola de Futebol Oficial Saindo da Tela do Notebook (Interseção Dev + Futebol) */}
    <g className="anim-soccer-ball" style={{ transformOrigin: '43px 35px' }}>
      <circle cx="43" cy="35" r="11" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
      <polygon
        points="43,30.2 47.4,33.4 45.7,38.5 40.3,38.5 38.6,33.4"
        fill="#0f172a"
      />
      <line x1="43" y1="30.2" x2="43" y2="24.5" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="47.4" y1="33.4" x2="52.5" y2="31.5" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="45.7" y1="38.5" x2="49.5" y2="43" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="40.3" y1="38.5" x2="36.5" y2="43" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="38.6" y1="33.4" x2="33.5" y2="31.5" stroke="#0f172a" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * 2. Campo Tático: O círculo central pulsa como um radar tático de partida
 */
export const PitchIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`anim-pitch ${className}`}
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <line x1="12" y1="4" x2="12" y2="20" />
    <circle cx="12" cy="12" r="3" className="origin-center animate-pulse" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    <path d="M2 9h3v6H2" />
    <path d="M22 9h-3v6h3" />
  </svg>
);

/**
 * 3. Camisa / Manto Oficial de Futebol: Gola em V, punhos nas mangas, listras de manto e escudo no peito
 */
export const JerseyIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', teamColor }) => {
  const palette =
    teamColor === 'blue'
      ? {
          body: '#2563eb',
          stripe: '#1d4ed8',
          collar: '#93c5fd',
          stroke: '#eff6ff',
          badge: '#fbbf24',
        }
      : teamColor === 'red'
      ? {
          body: '#dc2626',
          stripe: '#b91c1c',
          collar: '#fca5a5',
          stroke: '#fef2f2',
          badge: '#fbbf24',
        }
      : teamColor === 'emerald'
      ? {
          body: '#059669',
          stripe: '#047857',
          collar: '#6ee7b7',
          stroke: '#ecfdf5',
          badge: '#fbbf24',
        }
      : null;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={palette ? palette.stroke : 'currentColor'}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`anim-jersey ${className}`}
    >
      {/* Corpo Principal da Camisa de Futebol */}
      <path
        d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"
        fill={palette ? palette.body : 'currentColor'}
        fillOpacity={palette ? '1' : '0.22'}
      />
      {/* Faixa Central Esportiva do Manto */}
      <path
        d="M10 4.5v17.5h4V4.5"
        fill={palette ? palette.stripe : 'currentColor'}
        fillOpacity={palette ? '0.65' : '0.16'}
        stroke="none"
      />
      {/* Gola em V Esportiva */}
      <path
        d="M8.5 2.4 12 6.2 15.5 2.4"
        stroke={palette ? palette.collar : 'currentColor'}
        strokeWidth="1.8"
      />
      {/* Detalhe dos Punhos das Mangas */}
      <line x1="2.7" y1="8.2" x2="6" y2="9" stroke={palette ? palette.collar : 'currentColor'} strokeWidth="1.5" />
      <line x1="21.3" y1="8.2" x2="18" y2="9" stroke={palette ? palette.collar : 'currentColor'} strokeWidth="1.5" />
      {/* Escudo Dourado no Peito */}
      <circle
        cx="14.6"
        cy="8.6"
        r="1.25"
        fill={palette ? palette.badge : 'currentColor'}
        stroke="none"
      />
    </svg>
  );
};

/**
 * 4. Apito do Árbitro: Vibra/trila como apito soprando + ondas de som
 */
export const WhistleIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`anim-whistle ${className}`}
  >
    <path d="M11 6h9a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4.5L13 15.5a5.5 5.5 0 1 1-4.5-8.5H11z" />
    <circle cx="7.5" cy="12.5" r="1.5" fill="currentColor" />
    <path d="M11 2.5v2" className="animate-ping origin-bottom" />
    <path d="M8 3.5l1 1.5" />
    <path d="M14 3.5l-1 1.5" />
  </svg>
);

/**
 * 5. Luvas de Goleiro: Faz movimento elástico de defesa / ponte
 */
export const GlovesIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`anim-gloves ${className}`}
  >
    <path d="M7 18v3h10v-3" />
    <path d="M5 12v-2a2 2 0 0 1 4 0v2" />
    <path d="M9 10V5a1.5 1.5 0 0 1 3 0v5" />
    <path d="M12 9V4a1.5 1.5 0 0 1 3 0v5" />
    <path
      d="M15 10V5.5a1.5 1.5 0 0 1 3 0V12a6 6 0 0 1-6 6h-2a5 5 0 0 1-5-5v-1z"
      fill="currentColor"
      fillOpacity="0.12"
    />
  </svg>
);

/**
 * 6. Trave / Rede de Gol: Balança como a rede estufando quando sai gol
 */
export const GoalNetIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`anim-goal-net ${className}`}
  >
    <path d="M3 19V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v13" />
    <path d="M3 10h18" strokeOpacity="0.55" />
    <path d="M3 15h18" strokeOpacity="0.55" />
    <path d="M8 5v14" strokeOpacity="0.55" />
    <path d="M12 5v14" strokeOpacity="0.55" />
    <path d="M16 5v14" strokeOpacity="0.55" />
  </svg>
);

/**
 * 7. Chuteira / Artilheiro: Faz o movimento de armar o pé e chutar a bola
 */
export const CleatsIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`anim-kick ${className}`}
  >
    <path
      d="M3 16h18v-2a3 3 0 0 0-3-3h-4L10 6H5l-2 5v5z"
      fill="currentColor"
      fillOpacity="0.12"
    />
    <line x1="5" y1="16" x2="5" y2="19" />
    <line x1="8" y1="16" x2="8" y2="19" />
    <line x1="15" y1="16" x2="15" y2="19" />
    <line x1="18" y1="16" x2="18" y2="19" />
  </svg>
);
