import React from 'react';

interface IconProps {
  className?: string;
  teamColor?: 'blue' | 'red' | 'emerald';
}

/**
 * 1. Bola de Futebol: Gira e quica suavemente como bola em jogo
 */
export const SoccerBallIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`anim-soccer-ball ${className}`}
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="12 7 16 10 14.5 14.5 9.5 14.5 8 10" fill="currentColor" fillOpacity="0.22" />
    <line x1="12" y1="2" x2="12" y2="7" />
    <line x1="16" y1="10" x2="21.5" y2="8.5" />
    <line x1="14.5" y1="14.5" x2="18" y2="20" />
    <line x1="9.5" y1="14.5" x2="6" y2="20" />
    <line x1="8" y1="10" x2="2.5" y2="8.5" />
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
