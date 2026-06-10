import { useState, useEffect, useRef } from 'react'

// Helper to get CSRF token from cookies
function getCookie(name: string): string | null {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  JERSEY SVG GENERATOR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
interface JerseyStyle {
  primary: string;
  secondary: string;
  pattern: 'stripes' | 'hoops' | 'center' | 'plain';
  patternColor: string;
  textColor: string;
  sponsor: string;
}

export function getJerseyStyle(name: string): JerseyStyle {
  const n = name.toLowerCase();
  let primary = '#ffffff';
  let secondary = '#8b5cf6'; // Violet accents
  let pattern: 'stripes' | 'hoops' | 'center' | 'plain' = 'plain';
  let patternColor = '#0000ff';
  let textColor = '#1e293b';
  let sponsor = 'FútbolPro';

  if (n.includes('madrid') || n.includes('blanco')) {
    primary = '#ffffff';
    secondary = '#8b5cf6';
    textColor = '#1e293b';
    pattern = 'plain';
  } else if (n.includes('barcelona') || n.includes('barça') || n.includes('blaugrana')) {
    primary = '#991b1b';
    secondary = '#1e3a8a';
    pattern = 'stripes';
    patternColor = '#1e3a8a';
    textColor = '#fbbf24';
    sponsor = 'Spotify';
  } else if (n.includes('atletico') || n.includes('atlético') || n.includes('bilbao')) {
    primary = '#dc2626';
    secondary = '#ffffff';
    pattern = 'stripes';
    patternColor = '#ffffff';
    textColor = '#1e3a8a';
  } else if (n.includes('betis')) {
    primary = '#15803d';
    secondary = '#ffffff';
    pattern = 'stripes';
    patternColor = '#ffffff';
    textColor = '#15803d';
  } else if (n.includes('milan')) {
    primary = '#000000';
    secondary = '#dc2626';
    pattern = 'stripes';
    patternColor = '#dc2626';
    textColor = '#ffffff';
    sponsor = 'Emirates';
  } else if (n.includes('inter')) {
    primary = '#000000';
    secondary = '#1d4ed8';
    pattern = 'stripes';
    patternColor = '#1d4ed8';
    textColor = '#fbbf24';
  } else if (n.includes('juventus')) {
    primary = '#ffffff';
    secondary = '#000000';
    pattern = 'stripes';
    patternColor = '#000000';
    textColor = '#fbbf24';
  } else if (n.includes('argentina')) {
    primary = '#7dd3fc';
    secondary = '#ffffff';
    pattern = 'stripes';
    patternColor = '#ffffff';
    textColor = '#000000';
  } else if (n.includes('brasil') || n.includes('brazil')) {
    primary = '#fbbf24';
    secondary = '#15803d';
    textColor = '#1e3a8a';
    pattern = 'plain';
  } else if (n.includes('españa') || n.includes('spain')) {
    primary = '#dc2626';
    secondary = '#fbbf24';
    textColor = '#fbbf24';
  } else if (n.includes('arsenal')) {
    primary = '#dc2626';
    secondary = '#ffffff';
    pattern = 'plain';
    textColor = '#ffffff';
    sponsor = 'Fly Emirates';
  } else if (n.includes('liverpool')) {
    primary = '#b91c1c';
    secondary = '#fbbf24';
    textColor = '#ffffff';
  } else if (n.includes('boca')) {
    primary = '#1e3a8a';
    secondary = '#fbbf24';
    pattern = 'center';
    patternColor = '#fbbf24';
    textColor = '#ffffff';
  } else if (n.includes('celtic')) {
    primary = '#15803d';
    secondary = '#ffffff';
    pattern = 'hoops';
    patternColor = '#ffffff';
    textColor = '#ffffff';
  } else if (n.includes('city') || n.includes('manchester city')) {
    primary = '#bae6fd';
    secondary = '#ffffff';
    textColor = '#0f172a';
    sponsor = 'Etihad';
  } else if (n.includes('united') || n.includes('manchester united')) {
    primary = '#dc2626';
    secondary = '#000000';
    textColor = '#ffffff';
    sponsor = 'Snapdragon';
  } else if (n.includes('chelsea')) {
    primary = '#1d4ed8';
    secondary = '#ffffff';
    textColor = '#ffffff';
  } else if (n.includes('psg') || n.includes('paris')) {
    primary = '#1e3a8a';
    secondary = '#dc2626';
    pattern = 'center';
    patternColor = '#dc2626';
    textColor = '#ffffff';
    sponsor = 'Qatar Airways';
  } else if (n.includes('bayern')) {
    primary = '#dc2626';
    secondary = '#ffffff';
    textColor = '#ffffff';
    sponsor = 'T-Mobile';
  } else if (n.includes('dortmund')) {
    primary = '#fbbf24';
    secondary = '#000000';
    textColor = '#000000';
    sponsor = '1&1';
  }
  
  return { primary, secondary, pattern, patternColor, textColor, sponsor };
}

interface JerseyProps {
  name: string;
  dorsalNombre?: string;
  dorsalNumero?: string;
  vista?: 'front' | 'back';
  styleAttr?: React.CSSProperties;
}

export function JerseySVG({ name, dorsalNombre = '', dorsalNumero = '', vista = 'front', styleAttr }: JerseyProps) {
  const { primary, secondary, pattern, patternColor, textColor, sponsor } = getJerseyStyle(name);

  // Helper for stripes pattern
  const renderPattern = () => {
    if (pattern === 'stripes') {
      return (
        <g>
          <rect x="40" y="30" width="15" height="150" fill={patternColor} />
          <rect x="70" y="30" width="15" height="150" fill={patternColor} />
          <rect x="10" y="30" width="15" height="150" fill={patternColor} />
          <rect x="100" y="30" width="15" height="150" fill={patternColor} />
          <rect x="130" y="30" width="15" height="150" fill={patternColor} />
        </g>
      );
    } else if (pattern === 'hoops') {
      return (
        <g>
          <rect x="0" y="45" width="160" height="15" fill={patternColor} />
          <rect x="0" y="75" width="160" height="15" fill={patternColor} />
          <rect x="0" y="105" width="160" height="15" fill={patternColor} />
          <rect x="0" y="135" width="160" height="15" fill={patternColor} />
        </g>
      );
    } else if (pattern === 'center') {
      return (
        <rect x="35" y="30" width="90" height="150" fill={patternColor} />
      );
    }
    return null;
  };

  return (
    <svg viewBox="0 0 160 170" width="100%" height="100%" style={{ display: 'block', margin: 'auto', maxHeight: '100%', ...styleAttr }}>
      <defs>
        {/* Soft realistic shadows */}
        <radialGradient id="fold-grad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
        </radialGradient>
        {/* Clip path for the jersey body to mask stripes */}
        <clipPath id="jersey-body-clip">
          <path d="M 35 30 L 125 30 L 128 150 L 32 150 Z" />
        </clipPath>
      </defs>

      {/* Main Jersey Shape Group */}
      <g>
        {/* LEFT SLEEVE */}
        <path d="M 35 30 L 10 52 L 20 72 L 40 50 Z" fill={primary} />
        <path d="M 10 52 L 20 72 M 10 52 L 13 58 L 22 71 L 20 72 Z" fill={secondary} />

        {/* RIGHT SLEEVE */}
        <path d="M 125 30 L 150 52 L 140 72 L 120 50 Z" fill={primary} />
        <path d="M 150 52 L 140 72 M 150 52 L 147 58 L 138 71 L 140 72 Z" fill={secondary} />

        {/* BODY */}
        <path d="M 35 30 L 125 30 L 128 150 L 32 150 Z" fill={primary} />

        {/* Pattern inside body */}
        <g clipPath="url(#jersey-body-clip)">
          {renderPattern()}
        </g>

        {/* Neck collar */}
        <path d="M 55 30 Q 80 42 105 30 Z" fill="none" stroke={secondary} strokeWidth="6" />

        {/* Bottom Hem outline */}
        <path d="M 32 150 L 128 150" stroke={secondary} strokeWidth="3" />

        {/* Shadow overlays for jersey wrinkles and realism */}
        <path d="M 35 30 L 125 30 L 128 150 L 32 150 Z" fill="url(#fold-grad)" style={{ mixBlendMode: 'multiply' }} />

        {/* FRONT VIEW LOGOS */}
        {vista === 'front' && (
          <g>
            {/* Crest/Shield */}
            <circle cx="50" cy="55" r="7" fill={secondary} />
            <polygon points="46,55 54,55 50,61" fill="#fff" />
            
            {/* Brand Logo */}
            <path d="M 104 53 L 110 57 L 108 58 Z" fill={secondary} />
            <path d="M 107 51 L 112 55 L 111 56 Z" fill={secondary} />

            {/* Sponsor */}
            <text x="80" y="95" textAnchor="middle" fill={textColor} fontSize="11" fontFamily="'Sora', sans-serif" fontWeight="800" letterSpacing="0.05em">
              {sponsor}
            </text>
          </g>
        )}

        {/* BACK VIEW CUSTOMIZATION */}
        {vista === 'back' && (
          <g>
            {/* Player Name */}
            {dorsalNombre && (
              <text x="80" y="62" textAnchor="middle" fill={textColor} fontSize="9.5" fontFamily="'Sora', sans-serif" fontWeight="700" letterSpacing="0.1em" transform={`rotate(0, 80, 62)`}>
                {dorsalNombre.toUpperCase()}
              </text>
            )}

            {/* Player Number */}
            {dorsalNumero && (
              <text x="80" y="112" textAnchor="middle" fill={textColor} fontSize="46" fontFamily="'Sora', sans-serif" fontWeight="800" stroke={primary} strokeWidth="1">
                {dorsalNumero}
              </text>
            )}
          </g>
        )}
      </g>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
interface Category {
  id: number;
  nombre: string;
  slug: string;
  icono: string;
  tipo: string;
}

interface Product {
  id: number;
  nombre: string;
  nombre_original: string;
  slug: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  tallas: string[];
  categoria: {
    id: number;
    nombre: string;
    slug: string;
    tipo: string;
  } | null;
}

interface CartItem {
  camiseta_id: number;
  nombre: string;
  talla: string;
  cantidad: number;
  parche: boolean;
  dorsal: boolean;
  texto_dorsal: string;
  imagen_url: string;
  precio_base: number;
  precio_total: number;
}

const CATEGORY_CONFIG: Record<string, { bg: string; color: string; logoUrl?: string; fallbackIcon: string }> = {
  'todas': {
    bg: '#ffffff',
    color: '#0b0c10',
    fallbackIcon: 'list'
  },
  'brasileiro-serie-a': {
    bg: '#00a859',
    color: '#ffffff',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Campeonato_Brasileiro_S%C3%A9rie_A_logo.svg',
    fallbackIcon: 'trophy'
  },
  'bundesliga': {
    bg: '#df0016',
    color: '#ffffff',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Bundesliga_logo_%282017%29.svg',
    fallbackIcon: 'player'
  },
  'la-liga': {
    bg: '#f7e300',
    color: '#0b0c10',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/LaLiga_logo_2023.svg',
    fallbackIcon: 'liga'
  },
  'liga-mx': {
    bg: '#006b47',
    color: '#ffffff',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Liga_MX_logo.svg',
    fallbackIcon: 'ball'
  },
  'ligue-1': {
    bg: '#0b1a30',
    color: '#ffffff',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Ligue1_logo_2024.svg',
    fallbackIcon: 'hexagon'
  },
  'otras-ligas': {
    bg: '#e2e8f0',
    color: '#0b0c10',
    fallbackIcon: 'shield'
  },
  'premier-league': {
    bg: '#e51a66',
    color: '#ffffff',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Premier_League_Logo.svg',
    fallbackIcon: 'lion'
  },
  'serie-a': {
    bg: '#0065af',
    color: '#ffffff',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Serie_A_logo_2019.svg',
    fallbackIcon: 'letter-a'
  },
  'seleccion': {
    bg: '#7f1d1d',
    color: '#ffffff',
    fallbackIcon: 'globe'
  },
  'ninos': {
    bg: '#ffbe1a',
    color: '#0b0c10',
    fallbackIcon: 'jersey'
  },
  'retro': {
    bg: '#7c5b3f',
    color: '#ffffff',
    fallbackIcon: 'leather-ball'
  }
};

function CategoryIcon({ type }: { type: string }) {
  if (type === 'list') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
      </svg>
    );
  }
  if (type === 'trophy') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 2H5c-1.1 0-2 .9-2 2v3c0 2.24 1.81 4.07 4.05 4.11C7.74 12.53 9.68 14 12 14s4.26-1.47 4.95-2.89C19.19 11.07 21 9.24 21 7V4c0-1.1-.9-2-2-2zM5 7V4h2v3c0 1.1-.9 2-2 2zm14 0c-1.1 0-2-.9-2-2V4h2v3zm-7 9c-1.66 0-3-1.34-3-3h6c0 1.66-1.34 3-3 3zm2 2h-4v3h4v-3z" />
      </svg>
    );
  }
  if (type === 'player') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="17" cy="6" r="2" />
        <path d="M14.5 10.5l-3.5-3.5-3 3 1.5 1.5 2-2v7.5l-3 4.5 1.5 1 3.5-5.5 3 5.5 1.5-1-2.5-4.5z" />
      </svg>
    );
  }
  if (type === 'liga') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 2h4v20H4V2zm12 0h4v20h-4V2z" />
      </svg>
    );
  }
  if (type === 'ball') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <path d="M2 12h20" />
      </svg>
    );
  }
  if (type === 'hexagon') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 22 7.5 22 18 12 23 2 18 2 7.5" />
      </svg>
    );
  }
  if (type === 'shield') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }
  if (type === 'lion') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 5h-2v2h2V7zm-2 4h2v6h-2v-6z" />
      </svg>
    );
  }
  if (type === 'letter-a') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L3 22h4.5l2.25-5.5h4.5l2.25 5.5H21L12 2zm-1.25 11.5L12 9l1.25 4.5h-2.5z" />
      </svg>
    );
  }
  if (type === 'globe') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }
  if (type === 'jersey') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3.5L12 4.5 9.5 2H6L2 6v4h3v12h14V10h3V6l-4-4z" />
      </svg>
    );
  }
  if (type === 'leather-ball') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
      </svg>
    );
  }
  return null;
}

interface CategoryCardProps {
  slug: string | null;
  name: string;
  isActive: boolean;
  onClick: () => void;
}

function CategoryCard({ slug, name, isActive, onClick }: CategoryCardProps) {
  const configKey = slug || 'todas';
  const config = CATEGORY_CONFIG[configKey] || {
    bg: '#14161d',
    color: '#ffffff',
    fallbackIcon: 'shield'
  };

  const [imgError, setImgError] = useState(false);

  return (
    <div 
      className={`category-card-btn ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={{ 
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      <div 
        className="category-card-logo-container"
        style={{
          color: config.color,
        }}
      >
        {config.logoUrl && !imgError ? (
          <img 
            src={config.logoUrl} 
            alt={name} 
            onError={() => setImgError(true)}
            style={{ 
              filter: config.color === '#0b0c10' && configKey === 'la-liga' ? 'brightness(0)' : 'none',
              transform: configKey === 'premier-league' ? 'scale(1.2)' : 'none'
            }}
          />
        ) : (
          <CategoryIcon type={config.fallbackIcon} />
        )}
      </div>
      <div className="category-card-label" style={{ color: config.color }}>
        {name}
      </div>
    </div>
  );
}

function Interactive3DJersey() {
  const [rotationY, setRotationY] = useState(20); // starts slightly rotated
  const [rotationX, setRotationX] = useState(10);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentRotY = useRef(20);
  const currentRotX = useRef(10);
  const autoSpin = useRef<number | null>(null);

  // Auto spin effect when not dragging
  useEffect(() => {
    if (!isDragging) {
      const spin = () => {
        setRotationY((prev) => {
          const next = (prev + 0.4) % 360;
          currentRotY.current = next;
          return next;
        });
        autoSpin.current = requestAnimationFrame(spin);
      };
      autoSpin.current = requestAnimationFrame(spin);
    }
    return () => {
      if (autoSpin.current) {
        cancelAnimationFrame(autoSpin.current);
      }
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
    startY.current = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX.current;
    const deltaY = e.clientY - startY.current;
    
    const nextY = currentRotY.current + deltaX * 0.8;
    const nextX = Math.max(-30, Math.min(30, currentRotX.current - deltaY * 0.8)); // constrain X angle

    setRotationY(nextY);
    setRotationX(nextX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    currentRotY.current = rotationY;
    currentRotX.current = rotationX;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX.current;
    const deltaY = e.touches[0].clientY - startY.current;

    const nextY = currentRotY.current + deltaX * 0.8;
    const nextX = Math.max(-30, Math.min(30, currentRotX.current - deltaY * 0.8));

    setRotationY(nextY);
    setRotationX(nextX);
  };

  return (
    <div className="hero-3d-container">
      <div 
        className="jersey-3d-scene"
        style={{
          transform: `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Front Face */}
        <div className="jersey-face front">
          <svg viewBox="0 0 240 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000" floodOpacity="0.5"/>
              </filter>
              <filter id="crease-blur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3"/>
              </filter>
              <linearGradient id="torso-shading" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.75"/>
                <stop offset="15%" stopColor="#000000" stopOpacity="0.3"/>
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2"/>
                <stop offset="85%" stopColor="#000000" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#000000" stopOpacity="0.75"/>
              </linearGradient>
              <linearGradient id="left-sleeve-shading" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.6"/>
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#000000" stopOpacity="0.6"/>
              </linearGradient>
              <linearGradient id="right-sleeve-shading" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.6"/>
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#000000" stopOpacity="0.6"/>
              </linearGradient>
              <linearGradient id="barca-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#003b73"/>
                <stop offset="50%" stopColor="#004d98"/>
                <stop offset="100%" stopColor="#003b73"/>
              </linearGradient>
              <linearGradient id="barca-red" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#800030"/>
                <stop offset="50%" stopColor="#a50044"/>
                <stop offset="100%" stopColor="#800030"/>
              </linearGradient>
              <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#cca325"/>
                <stop offset="50%" stopColor="#ffbe1a"/>
                <stop offset="100%" stopColor="#cca325"/>
              </linearGradient>
              <clipPath id="torso-clip">
                <path d="M65 40 Q120 48 175 40 L178 85 C170 95 168 120 174 150 C178 170 178 200 174 245 C170 252 165 255 155 255 L85 255 C75 255 70 252 66 245 C62 200 62 170 66 150 C72 120 70 95 62 85 Z"/>
              </clipPath>
              <clipPath id="left-sleeve-clip">
                <path d="M65 40 L62 85 C50 82 25 90 15 105 L2 90 L22 55 Q45 42 65 40 Z"/>
              </clipPath>
              <clipPath id="right-sleeve-clip">
                <path d="M175 40 L178 85 C190 82 215 90 225 105 L238 90 L218 55 Q195 42 175 40 Z"/>
              </clipPath>
            </defs>
            <g filter="url(#soft-shadow)">
              <path d="M65 40 L22 55 L2 90 L15 105 L45 95 C52 110 52 135 48 165 C44 185 44 215 48 245 C52 255 60 260 75 260 L165 260 C180 260 188 255 192 245 C196 215 196 185 192 165 C188 135 188 110 195 95 L225 105 L238 90 L218 55 L175 40 Q120 48 65 40 Z" fill="#0c0d12"/>
            </g>
            <g clipPath="url(#left-sleeve-clip)">
              <rect x="-10" y="20" width="100" height="100" fill="url(#barca-blue)"/>
              <path d="M10 30 L40 100" stroke="url(#barca-red)" strokeWidth="18"/>
              <path d="M35 25 L65 95" stroke="url(#barca-red)" strokeWidth="12"/>
              <path d="M15 105 L2 90" stroke="url(#gold-grad)" strokeWidth="6"/>
              <rect x="-10" y="20" width="100" height="100" fill="url(#left-sleeve-shading)"/>
            </g>
            <g clipPath="url(#right-sleeve-clip)">
              <rect x="150" y="20" width="100" height="100" fill="url(#barca-blue)"/>
              <path d="M230 30 L200 100" stroke="url(#barca-red)" strokeWidth="18"/>
              <path d="M205 25 L175 95" stroke="url(#barca-red)" strokeWidth="12"/>
              <path d="M225 105 L238 90" stroke="url(#gold-grad)" strokeWidth="6"/>
              <rect x="150" y="20" width="100" height="100" fill="url(#right-sleeve-shading)"/>
            </g>
            <g clipPath="url(#torso-clip)">
              <rect x="50" y="30" width="140" height="230" fill="url(#barca-blue)"/>
              <path d="M102 30 L102 260 L138 260 L138 30 Z" fill="url(#barca-red)"/>
              <path d="M52 30 C 58 100, 58 190, 52 260 L78 260 C 84 190, 84 100, 78 30 Z" fill="url(#barca-red)"/>
              <path d="M162 30 C 156 100, 156 190, 162 260 L188 260 C 182 190, 182 100, 188 30 Z" fill="url(#barca-red)"/>
              <path d="M66 150 C72 170 72 210 68 245" stroke="url(#gold-grad)" strokeWidth="2.5" fill="none"/>
              <path d="M174 150 C168 170 168 210 172 245" stroke="url(#gold-grad)" strokeWidth="2.5" fill="none"/>
              <rect x="50" y="30" width="140" height="230" fill="url(#torso-shading)"/>
              <path d="M 64 90 Q 90 115 110 100" stroke="#000" strokeWidth="3" strokeOpacity="0.4" fill="none" filter="url(#crease-blur)"/>
              <path d="M 64 90 Q 90 115 110 100" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.15" fill="none" filter="url(#crease-blur)"/>
              <path d="M 60 170 Q 120 190 180 165" stroke="#000" strokeWidth="4" strokeOpacity="0.45" fill="none" filter="url(#crease-blur)"/>
              <path d="M 60 170 Q 120 190 180 165" stroke="#fff" strokeWidth="2" strokeOpacity="0.15" fill="none" filter="url(#crease-blur)"/>
              <path d="M 65 215 Q 120 230 175 210" stroke="#000" strokeWidth="3" strokeOpacity="0.4" fill="none" filter="url(#crease-blur)"/>
              <path d="M 65 215 Q 120 230 175 210" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.1" fill="none" filter="url(#crease-blur)"/>
            </g>
            <path d="M90 35 C100 48, 140 48, 150 35 C140 58, 100 58, 90 35 Z" fill="#07080a"/>
            <path d="M82 28 L94 38 L120 54 L146 38 L158 28 C148 44, 92 44, 82 28 Z" fill="url(#gold-grad)" stroke="#9c7512" strokeWidth="1"/>
            <path d="M120 54 L120 62" stroke="url(#gold-grad)" strokeWidth="2.5"/>
            <g transform="translate(142, 70) rotate(-4) scale(0.9)">
              <path d="M2 5 C8 5, 14 3, 24 0 C18 4, 10 9, 2 11 C-2 11, -3 8, 2 5 Z" fill="url(#gold-grad)" filter="drop-shadow(0 2px 2px rgba(0,0,0,0.4))"/>
            </g>
            <g transform="translate(74, 62) scale(0.75)" filter="drop-shadow(0 3px 5px rgba(0,0,0,0.5))">
              <path d="M0 0 C10 -2 20 -2 30 0 C30 10 32 20 15 32 C-2 20 0 10 0 0 Z" fill="url(#gold-grad)" />
              <path d="M1.5 1.5 C10 -0.5 20 -0.5 28.5 1.5 C28.5 10 30 18 15 29 C0 18 1.5 10 1.5 1.5 Z" fill="#fff" />
              <rect x="3" y="3" width="10" height="10" fill="#df0016" />
              <rect x="7" y="3" width="2" height="10" fill="#fff" />
              <rect x="3" y="7" width="10" height="2" fill="#fff" />
              <rect x="15" y="3" width="12" height="10" fill="#ffbe1a" />
              <rect x="18" y="3" width="2" height="10" fill="#df0016" />
              <rect x="22" y="3" width="2" height="10" fill="#df0016" />
              <rect x="1.5" y="13" width="27" height="3" fill="#000" />
              <path d="M1.5 16 C5 22 10 26 15 29 C20 26 25 22 28.5 16 Z" fill="#004d98" />
              <path d="M6 16 L6 26" stroke="#a50044" strokeWidth="2.5" />
              <path d="M11 16 L11 28" stroke="#a50044" strokeWidth="2.5" />
              <path d="M15 16 L15 29" stroke="#ffbe1a" strokeWidth="1.5" />
              <path d="M19 16 L19 28" stroke="#a50044" strokeWidth="2.5" />
              <path d="M24 16 L24 26" stroke="#a50044" strokeWidth="2.5" />
            </g>
            <g transform="translate(76, 120) scale(1.15)" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))">
              <circle cx="12" cy="12" r="10" stroke="url(#gold-grad)" strokeWidth="2" fill="none" />
              <path d="M6 9 C9 7.5, 15 7.5, 18 9" stroke="url(#gold-grad)" strokeWidth="1.6" stroke-linecap="round" fill="none" />
              <path d="M7.5 12 C10 11, 14 11, 16.5 12" stroke="url(#gold-grad)" strokeWidth="1.8" stroke-linecap="round" fill="none" />
              <path d="M9 15 C11 14.2, 13 14.2, 15 15" stroke="url(#gold-grad)" strokeWidth="1.8" stroke-linecap="round" fill="none" />
              <text x="27" y="17" fill="url(#gold-grad)" fontFamily="'Inter', sans-serif" fontWeight="900" fontSize="11" letterSpacing="-0.03em">Spotify</text>
            </g>
            <g transform="translate(202, 68) rotate(15) scale(0.4)" filter="drop-shadow(-1px 2px 2px rgba(0,0,0,0.3))">
              <rect x="0" y="0" width="22" height="30" rx="3" fill="#fff" stroke="#ffbe1a" strokeWidth="1.5"/>
              <path d="M6 8 L10 4 L16 10 L12 14 Z" fill="#df0016"/>
              <path d="M10 16 L14 12 L20 18 L16 22 Z" fill="#df0016"/>
            </g>
          </svg>
        </div>
        {/* Back Face */}
        <div className="jersey-face back">
          <svg viewBox="0 0 240 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="soft-shadow-back" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000" floodOpacity="0.5"/>
              </filter>
              <filter id="crease-blur-back" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3"/>
              </filter>
              <linearGradient id="torso-shading-back" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.75"/>
                <stop offset="15%" stopColor="#000000" stopOpacity="0.3"/>
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2"/>
                <stop offset="85%" stopColor="#000000" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#000000" stopOpacity="0.75"/>
              </linearGradient>
              <linearGradient id="left-sleeve-shading-back" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.6"/>
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#000000" stopOpacity="0.6"/>
              </linearGradient>
              <linearGradient id="right-sleeve-shading-back" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.6"/>
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#000000" stopOpacity="0.6"/>
              </linearGradient>
              <linearGradient id="barca-blue-back" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#003b73"/>
                <stop offset="50%" stopColor="#004d98"/>
                <stop offset="100%" stopColor="#003b73"/>
              </linearGradient>
              <linearGradient id="barca-red-back" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#800030"/>
                <stop offset="50%" stopColor="#a50044"/>
                <stop offset="100%" stopColor="#800030"/>
              </linearGradient>
              <linearGradient id="gold-grad-back" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#cca325"/>
                <stop offset="50%" stopColor="#ffbe1a"/>
                <stop offset="100%" stopColor="#cca325"/>
              </linearGradient>
              <clipPath id="torso-clip-back">
                <path d="M65 40 Q120 48 175 40 L178 85 C170 95 168 120 174 150 C178 170 178 200 174 245 C170 252 165 255 155 255 L85 255 C75 255 70 252 66 245 C62 200 62 170 66 150 C72 120 70 95 62 85 Z"/>
              </clipPath>
              <clipPath id="left-sleeve-clip-back">
                <path d="M65 40 L62 85 C50 82 25 90 15 105 L2 90 L22 55 Q45 42 65 40 Z"/>
              </clipPath>
              <clipPath id="right-sleeve-clip-back">
                <path d="M175 40 L178 85 C190 82 215 90 225 105 L238 90 L218 55 Q195 42 175 40 Z"/>
              </clipPath>
            </defs>
            <g filter="url(#soft-shadow-back)">
              <path d="M65 40 L22 55 L2 90 L15 105 L45 95 C52 110 52 135 48 165 C44 185 44 215 48 245 C52 255 60 260 75 260 L165 260 C180 260 188 255 192 245 C196 215 196 185 192 165 C188 135 188 110 195 95 L225 105 L238 90 L218 55 L175 40 Q120 48 65 40 Z" fill="#0c0d12"/>
            </g>
            <g clipPath="url(#left-sleeve-clip-back)">
              <rect x="-10" y="20" width="100" height="100" fill="url(#barca-blue-back)"/>
              <path d="M10 30 L40 100" stroke="url(#barca-red-back)" strokeWidth="18"/>
              <path d="M35 25 L65 95" stroke="url(#barca-red-back)" strokeWidth="12"/>
              <path d="M15 105 L2 90" stroke="url(#gold-grad-back)" strokeWidth="6"/>
              <rect x="-10" y="20" width="100" height="100" fill="url(#left-sleeve-shading-back)"/>
            </g>
            <g clipPath="url(#right-sleeve-clip-back)">
              <rect x="150" y="20" width="100" height="100" fill="url(#barca-blue-back)"/>
              <path d="M230 30 L200 100" stroke="url(#barca-red-back)" strokeWidth="18"/>
              <path d="M205 25 L175 95" stroke="url(#barca-red-back)" strokeWidth="12"/>
              <path d="M225 105 L238 90" stroke="url(#gold-grad-back)" strokeWidth="6"/>
              <rect x="150" y="20" width="100" height="100" fill="url(#right-sleeve-shading-back)"/>
            </g>
            <g clipPath="url(#torso-clip-back)">
              <rect x="50" y="30" width="140" height="230" fill="url(#barca-blue-back)"/>
              <path d="M102 30 L102 260 L138 260 L138 30 Z" fill="url(#barca-red-back)"/>
              <path d="M52 30 C 58 100, 58 190, 52 260 L78 260 C 84 190, 84 100, 78 30 Z" fill="url(#barca-red-back)"/>
              <path d="M162 30 C 156 100, 156 190, 162 260 L188 260 C 182 190, 182 100, 188 30 Z" fill="url(#barca-red-back)"/>
              <path d="M66 150 C72 170 72 210 68 245" stroke="url(#gold-grad-back)" strokeWidth="2.5" fill="none"/>
              <path d="M174 150 C168 170 168 210 172 245" stroke="url(#gold-grad-back)" strokeWidth="2.5" fill="none"/>
              <rect x="50" y="30" width="140" height="230" fill="url(#torso-shading-back)"/>
              <path d="M 64 90 Q 90 115 110 100" stroke="#000" strokeWidth="3" strokeOpacity="0.4" fill="none" filter="url(#crease-blur-back)"/>
              <path d="M 64 90 Q 90 115 110 100" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.15" fill="none" filter="url(#crease-blur-back)"/>
              <path d="M 60 170 Q 120 190 180 165" stroke="#000" strokeWidth="4" strokeOpacity="0.45" fill="none" filter="url(#crease-blur-back)"/>
              <path d="M 60 170 Q 120 190 180 165" stroke="#fff" stroke-width="2" strokeOpacity="0.15" fill="none" filter="url(#crease-blur-back)"/>
              <path d="M 65 215 Q 120 230 175 210" stroke="#000" strokeWidth="3" strokeOpacity="0.4" fill="none" filter="url(#crease-blur-back)"/>
              <path d="M 65 215 Q 120 230 175 210" stroke="#fff" stroke-width="1.5" strokeOpacity="0.1" fill="none" filter="url(#crease-blur-back)"/>
            </g>
            <path d="M82 28 C92 44, 148 44, 158 28" stroke="url(#gold-grad-back)" strokeWidth="5" fill="none"/>
            <path d="M90 31 C100 42, 140 42, 150 31" stroke="#000" strokeWidth="2" fill="none"/>
            <text x="120" y="75" fill="url(#gold-grad-back)" fontFamily="'Inter', sans-serif" fontWeight="900" fontSize="14" textAnchor="middle" letterSpacing="0.12em" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.5))">L. YAMAL</text>
            <text x="120" y="165" fill="url(#gold-grad-back)" fontFamily="'Outfit', 'Impact', sans-serif" fontWeight="900" fontSize="78" textAnchor="middle" letterSpacing="-0.02em" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.6))">19</text>
            <g transform="translate(98, 205) scale(0.95)" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.4))">
              <path d="M4 12 C7 8, 11 8, 14 12" stroke="url(#gold-grad-back)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <circle cx="9" cy="6" r="2.5" fill="url(#gold-grad-back)" />
              <text x="20" y="12" fill="url(#gold-grad-back)" fontFamily="'Inter', sans-serif" fontWeight="900" fontSize="11" letterSpacing="0.04em">unicef</text>
            </g>
          </svg>
        </div>
        <div className="jersey-3d-hint">Girar 3D 🔄</div>
      </div>
    </div>
  );
}

function App() {
  // Navigation Routing States
  const [route, setRoute] = useState<{ path: string; param?: number }>({ path: '/' });
  
  // App-wide Shopping Cart States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  const [toastBinds, setToastBinds] = useState(0);

  // Catalog / Filter States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [isRetroTab, setIsRetroTab] = useState(false);
  
  // Pagination & Loading States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Detail Page Customization States
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [detailTab, setDetailTab] = useState<'photo' | 'svg'>('photo');
  const [customEnabled, setCustomEnabled] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [selectedTalla, setSelectedTalla] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [hasBadge, setHasBadge] = useState(false);

  // Checkout States
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Confirmation View States
  const [confirmedOrder, setConfirmedOrder] = useState<{
    id: number;
    nombre_cliente: string;
    telefono: string;
    notas: string;
    estado: string;
    lineas: Array<{
      producto_nombre: string;
      talla: string;
      cantidad: number;
      parche: boolean;
      dorsal: boolean;
      texto_dorsal: string;
    }>;
  } | null>(null);

  // Slider ref and scroll utility for category carousel
  const categorySliderRef = useRef<HTMLDivElement>(null);
  const scrollCategorySlider = (direction: 'left' | 'right') => {
    if (categorySliderRef.current) {
      const scrollAmount = 350;
      categorySliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Load Routing & Cart on mount
  useEffect(() => {
    // 1. Initial Route Parsing
    handleLocationChange();

    // 2. Popstate handler
    window.addEventListener('popstate', handleLocationChange);

    // 3. Fetch current shopping basket
    fetchCart();
    fetchCategories();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Sync route state with window.location
  const handleLocationChange = () => {
    const path = window.location.pathname;
    if (path.startsWith('/camiseta/')) {
      const match = path.match(/\/camiseta\/(\d+)\/?/);
      if (match) {
        setRoute({ path: '/camiseta', param: parseInt(match[1]) });
        fetchDetailProduct(parseInt(match[1]));
        return;
      }
    } else if (path.startsWith('/confirmacion/')) {
      const match = path.match(/\/confirmacion\/(\d+)\/?/);
      if (match) {
        setRoute({ path: '/confirmacion', param: parseInt(match[1]) });
        fetchOrderConfirmation(parseInt(match[1]));
        return;
      }
    } else if (path === '/checkout' || path === '/checkout/') {
      setRoute({ path: '/checkout' });
      return;
    } else if (path === '/retro' || path === '/retro/') {
      setRoute({ path: '/retro' });
      setIsRetroTab(true);
      fetchCatalog(1, null, '', true);
      return;
    }

    // Default Fallback: Catalog
    setRoute({ path: '/' });
    setIsRetroTab(false);
    fetchCatalog(1, null, '', false);
  };

  // Navigating Function
  const navigateTo = (newPath: string) => {
    window.history.pushState(null, '', newPath);
    handleLocationChange();
  };

  // Toast utility
  const showToast = (message: string) => {
    setToast({ message, show: true });
    setToastBinds(prev => prev + 1);
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastBinds, toast.show]);

  // Fetch Cesta API
  const fetchCart = async () => {
    try {
      const res = await fetch('/cesta/', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cesta || []);
      }
    } catch (e) {
      console.error("Error fetching basket data", e);
    }
  };

  // Fetch Catalog API
  const fetchCatalog = async (page = 1, catSlug = selectedCat, qString = search, retroMode = isRetroTab) => {
    setLoading(true);
    try {
      let url = `/api/camisetas/?page=${page}&retro=${retroMode ? 'true' : 'false'}`;
      if (catSlug) url += `&categoria=${catSlug}`;
      if (qString) url += `&q=${encodeURIComponent(qString)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.camisetas);
        setCurrentPage(data.number);
        setTotalPages(data.num_pages);
        setTotalCount(data.count);
      }
    } catch (e) {
      console.error("Error fetching catalog API", e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Categories API
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categorias/');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categorias || []);
      }
    } catch (e) {
      console.error("Error fetching categories API", e);
    }
  };

  // Fetch Product Detail API
  const fetchDetailProduct = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/camiseta/${id}/`);
      if (res.ok) {
        const data = await res.json();
        setDetailProduct(data);
        // Set defaults for page
        setSelectedTalla(data.tallas?.[0] || 'M');
        setSelectedQty(1);
        setCustomEnabled(false);
        setCustomName('');
        setCustomNumber('');
        setDetailTab('photo');
      }
    } catch (e) {
      console.error("Error fetching shirt detail API", e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Order Confirmation API
  const fetchOrderConfirmation = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/confirmacion/${id}/`);
      if (res.ok) {
        const data = await res.json();
        setConfirmedOrder(data);
      }
    } catch (e) {
      console.error("Error fetching order confirmation API", e);
    } finally {
      setLoading(false);
    }
  };

  // Add Item to basket
  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailProduct) return;

    const csrf = getCookie('csrftoken');
    const form = new FormData();
    form.append('camiseta_id', detailProduct.id.toString());
    form.append('talla', selectedTalla);
    form.append('cantidad', selectedQty.toString());
    
    if (customEnabled) {
      form.append('dorsal', 'true');
      form.append('texto_dorsal', `${customName.trim()} ${customNumber.trim()}`.trim());
    }

    try {
      const res = await fetch('/cesta/agregar/', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': csrf || '',
        },
        body: form
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCart(data.cesta || []);
          showToast(data.message);
          setCartOpen(true);
          
          // Micro-animation bounce on count badge
          setHasBadge(true);
          setTimeout(() => setHasBadge(false), 500);
        }
      }
    } catch (e) {
      console.error("Error adding product to cart", e);
      showToast("Error agregando el producto.");
    }
  };

  // Update Item Quantity in drawer
  const handleUpdateQty = async (idx: number, newQty: number) => {
    const csrf = getCookie('csrftoken');
    const form = new FormData();
    form.append('idx', idx.toString());
    form.append('cantidad', newQty.toString());

    try {
      const res = await fetch('/cesta/actualizar/', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': csrf || '',
        },
        body: form
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCart(data.cesta || []);
        }
      }
    } catch (e) {
      console.error("Error updating basket item", e);
    }
  };

  // Remove Item from basket
  const handleRemoveItem = async (idx: number) => {
    const csrf = getCookie('csrftoken');
    const form = new FormData();
    form.append('idx', idx.toString());

    try {
      const res = await fetch('/cesta/eliminar/', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': csrf || '',
        },
        body: form
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCart(data.cesta || []);
          showToast(data.message);
        }
      }
    } catch (e) {
      console.error("Error removing item from basket", e);
    }
  };

  // Post Checkout order
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmittingOrder(true);

    const csrf = getCookie('csrftoken');
    try {
      const res = await fetch('/api/checkout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': csrf || '',
        },
        body: JSON.stringify({
          nombre: checkoutName,
          telefono: checkoutPhone,
          notas: checkoutNotes
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCart([]);
          setCheckoutName('');
          setCheckoutPhone('');
          setCheckoutNotes('');
          navigateTo(`/confirmacion/${data.pedido_id}`);
        } else {
          showToast(data.message || "Error procesando el pedido.");
        }
      } else {
        const data = await res.json();
        showToast(data.message || "Hubo un error al tramitar.");
      }
    } catch (e) {
      console.error("Error placing checkout order", e);
      showToast("Error de conexión.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Total items in cart counter
  const totalCartItems = cart.reduce((acc, curr) => acc + curr.cantidad, 0);
  const totalCartPrice = cart.reduce((acc, curr) => acc + (curr.precio_total * curr.cantidad), 0);

  // Trigger search filters
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCatalog(1, selectedCat, search, isRetroTab);
  };

  const handleCategoryClick = (slug: string | null) => {
    setSelectedCat(slug);
    fetchCatalog(1, slug, search, isRetroTab);
  };

  return (
    <div className="app-container">
      {/* ── TOAST NOTIFICATIONS ── */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        {toast.message}
      </div>

      {/* ── STICKY NAVIGATION BAR ── */}
      <nav>
        <span onClick={() => navigateTo('/')} className="nav-logo" style={{ cursor: 'pointer' }}>
          Fútbol<span>Pro</span>
        </span>
        <div className="nav-right">
          <span 
            onClick={() => {
              setIsRetroTab(false);
              setSelectedCat(null);
              setSearch('');
              navigateTo('/');
              fetchCatalog(1, null, '', false);
            }} 
            className={`nav-link ${route.path === '/' && !isRetroTab ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            Catálogo
          </span>
          <span 
            onClick={() => {
              setIsRetroTab(true);
              setSelectedCat(null);
              setSearch('');
              navigateTo('/retro');
              fetchCatalog(1, null, '', true);
            }} 
            className={`nav-link ${isRetroTab ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            Retro 🕰️
          </span>
          <div className={`nav-cesta ${hasBadge ? 'bump' : ''}`} onClick={() => setCartOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span className="cesta-badge">{totalCartItems}</span>
          </div>
        </div>
      </nav>

      {/* ── MAIN LAYOUT ROUTER ── */}
      <main className="main-content">
        
        {/* A. CATALOG VIEW */}
        {(route.path === '/' || route.path === '/retro') && (
          <div className="catalog-view fade-in">
            {/* HERO BANNER */}
            <div className={`hero ${isRetroTab ? 'retro-theme' : ''}`}>
              <div>
                <div className="hero-eyebrow">
                  {isRetroTab ? 'Archivo Histórico · Colección Retro' : 'Colección Oficial · Temporada 25/26 · 26/27'}
                </div>
                <h1>
                  {isRetroTab ? 'Clásicos' : 'Elige tu'}
                  <br />
                  <em>{isRetroTab ? 'Eternos' : 'Camiseta'}</em>
                </h1>
                <p className="hero-sub">
                  {isRetroTab 
                    ? 'Las camisetas que marcaron una era. Réplicas legendarias de los mejores clubes e historias del fútbol mundial.'
                    : 'Personaliza tu dorsal, escoge tu talla y pide directamente por WhatsApp. Rápido, seguro y premium.'
                  }
                </p>
              </div>
              <Interactive3DJersey />
              <div className="hero-count">
                {totalCount}
                <small>artículos</small>
              </div>
            </div>

            {/* SEARCH AND CATEGORIES TAB BAR */}
            <div className="toolbar">
              <form onSubmit={handleSearchSubmit} className="search-wrap">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input 
                  type="search" 
                  placeholder="Buscar club, liga, país..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="search-btn">Buscar</button>
              </form>
            </div>

            {!isRetroTab && (
              <div className="category-slider-outer">
                <button 
                  type="button" 
                  className="slider-arrow left" 
                  onClick={() => scrollCategorySlider('left')} 
                  aria-label="Deslizar izquierda"
                >
                  ‹
                </button>
                <div className="category-slider-track" ref={categorySliderRef}>
                  <CategoryCard 
                    slug={null}
                    name="Todas las categorías"
                    isActive={selectedCat === null}
                    onClick={() => handleCategoryClick(null)}
                  />
                  {categories.map((cat) => (
                    <CategoryCard 
                      key={cat.id}
                      slug={cat.slug}
                      name={cat.nombre}
                      isActive={selectedCat === cat.slug}
                      onClick={() => handleCategoryClick(cat.slug)}
                    />
                  ))}
                </div>
                <button 
                  type="button" 
                  className="slider-arrow right" 
                  onClick={() => scrollCategorySlider('right')} 
                  aria-label="Deslizar derecha"
                >
                  ›
                </button>
              </div>
            )}

            {/* CATALOG PRODUCTS GRID */}
            {loading ? (
              <div className="loader-container">
                <div className="custom-loader"></div>
                <p style={{ marginTop: '1rem', color: 'var(--gris)' }}>Cargando catálogo...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid">
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className="card"
                    onClick={() => navigateTo(`/camiseta/${product.id}`)}
                  >
                    <div className="card-img-wrap">
                      {product.imagen_url ? (
                        <img 
                          src={product.imagen_url} 
                          alt={product.nombre} 
                          loading="lazy"
                          onError={(e) => {
                            // If direct image fails, hide it and display our glorious dynamic SVG fallback
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.jersey-fallback-wrap');
                            if (fallback) {
                              (fallback as HTMLElement).style.display = 'block';
                            }
                          }}
                        />
                      ) : null}
                      
                      {/* Dynamic SVG Fallback Holder */}
                      <div className="jersey-fallback-wrap" style={{ display: product.imagen_url ? 'none' : 'block', width: '100%', height: '100%' }}>
                        <JerseySVG name={product.nombre} />
                      </div>

                      {isRetroTab && <div className="card-cat-tag">Retro 🕰️</div>}

                      <div className="card-overlay">
                        <button className="card-btn" onClick={(e) => { e.stopPropagation(); navigateTo(`/camiseta/${product.id}`); }}>
                          Elegir Talla →
                        </button>
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="card-nombre">{product.nombre}</div>
                      <div className="card-price-row">
                        <span className="card-price">{product.precio.toFixed(2)} €</span>
                      </div>
                      <div className="card-tallas">
                        {product.tallas.map((talla) => (
                          <span key={talla} className="talla-chip">{talla}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-catalog">
                <h2>Sin resultados</h2>
                <p>No se encontraron camisetas con los filtros seleccionados.</p>
                <button className="btn-primary" onClick={() => handleCategoryClick(null)} style={{ marginTop: '1.5rem' }}>
                  Mostrar Todo
                </button>
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => fetchCatalog(currentPage - 1, selectedCat, search, isRetroTab)}
                    className="pag-btn"
                  >
                    ‹
                  </button>
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show first, last, current, and +- 2 pages
                    if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 2) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchCatalog(pageNum, selectedCat, search, isRetroTab)}
                          className={`pag-num ${currentPage === pageNum ? 'active' : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === 2 || pageNum === totalPages - 1) {
                      return <span key={pageNum} className="pag-ellipsis">...</span>;
                    }
                    return null;
                  })}
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => fetchCatalog(currentPage + 1, selectedCat, search, isRetroTab)}
                    className="pag-btn"
                  >
                    ›
                  </button>
                </div>
                <div className="pagination-info">
                  Página <strong>{currentPage}</strong> de {totalPages} · {totalCount} camisetas disponibles
                </div>
              </div>
            )}

          </div>
        )}

        {/* B. PRODUCT DETAIL VIEW */}
        {route.path === '/camiseta' && detailProduct && (
          <div className="detail-view fade-in">
            <div className="detail-grid">
              
              {/* VIEWER COLUMN */}
              <div className="viewer-column">
                <div className="detail-tabs">
                  <button 
                    className={`detail-tab ${detailTab === 'photo' ? 'active' : ''}`}
                    onClick={() => setDetailTab('photo')}
                  >
                    Foto de Catálogo
                  </button>
                  <button 
                    className={`detail-tab ${detailTab === 'svg' ? 'active' : ''}`}
                    onClick={() => setDetailTab('svg')}
                  >
                    Personalización 3D
                  </button>
                </div>

                <div className="viewer-box">
                  {detailTab === 'photo' ? (
                    detailProduct.imagen_url ? (
                      <img 
                        className="detail-photo" 
                        src={detailProduct.imagen_url} 
                        alt={detailProduct.nombre} 
                        onError={() => setDetailTab('svg')}
                      />
                    ) : (
                      <div className="fallback-svg-view">
                        <JerseySVG name={detailProduct.nombre} />
                      </div>
                    )
                  ) : (
                    <div className="svg-personalizer">
                      <div className="svg-side-view">
                        <h4>Frente</h4>
                        <div className="svg-side-box">
                          <JerseySVG name={detailProduct.nombre} vista="front" />
                        </div>
                      </div>
                      <div className="svg-side-view">
                        <h4>Espalda (Dorsal)</h4>
                        <div className="svg-side-box">
                          <JerseySVG 
                            name={detailProduct.nombre} 
                            vista="back"
                            dorsalNombre={customName}
                            dorsalNumero={customNumber}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SPECIFICATIONS COLUMN */}
              <div className="specs-column">
                <div className="specs-header">
                  <span className="specs-category-tag">
                    {detailProduct.categoria?.nombre || 'Colección oficial'}
                  </span>
                  <h1>{detailProduct.nombre}</h1>
                  <div className="specs-price">{detailProduct.precio.toFixed(2)} €</div>
                </div>

                <p className="specs-desc">{detailProduct.descripcion}</p>

                <form onSubmit={handleAddToCart} className="specs-form">
                  
                  {/* TALLAS LIST */}
                  <div className="form-section">
                    <span className="section-label">Selecciona tu talla</span>
                    <div className="tallas-grid">
                      {detailProduct.tallas.map((talla) => (
                        <button
                          type="button"
                          key={talla}
                          className={`talla-btn ${selectedTalla === talla ? 'selected' : ''}`}
                          onClick={() => setSelectedTalla(talla)}
                        >
                          {talla}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CUSTOMIZATION CARD */}
                  <div className="custom-card">
                    <label className="custom-checkbox-wrap">
                      <input 
                        type="checkbox" 
                        checked={customEnabled}
                        onChange={(e) => {
                          setCustomEnabled(e.target.checked);
                          if (e.target.checked) setDetailTab('svg'); // Switch to back view svg automatically
                        }}
                      />
                      <span className="custom-checkbox-box"></span>
                      <span className="custom-checkbox-txt">¿Añadir parche y dorsal (+4.00 €)?</span>
                    </label>

                    {customEnabled && (
                      <div className="custom-inputs fade-in">
                        <div className="campo">
                          <label>Nombre en la espalda</label>
                          <input 
                            type="text" 
                            maxLength={15}
                            placeholder="Ej: MBAPPÉ"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                          />
                        </div>
                        <div className="campo">
                          <label>Número</label>
                          <input 
                            type="text" 
                            maxLength={2}
                            placeholder="Ej: 9"
                            value={customNumber}
                            onChange={(e) => {
                              // Accept only numbers
                              const val = e.target.value.replace(/\D/g, '');
                              setCustomNumber(val);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* QUANTITY AND SUBMIT */}
                  <div className="qty-row">
                    <div className="qty-selector">
                      <button 
                        type="button" 
                        onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                      >
                        -
                      </button>
                      <span>{selectedQty}</span>
                      <button 
                        type="button" 
                        onClick={() => setSelectedQty(selectedQty + 1)}
                      >
                        +
                      </button>
                    </div>

                    <button type="submit" className="add-cart-btn">
                      Añadir a la cesta
                    </button>
                  </div>

                </form>

                <button 
                  onClick={() => navigateTo('/')} 
                  className="volver-catalogo-btn"
                >
                  ← Volver al catálogo
                </button>
              </div>

            </div>
          </div>
        )}

        {/* C. CHECKOUT VIEW */}
        {route.path === '/checkout' && (
          <div className="checkout-view fade-in">
            <h1>Tramitar Pedido</h1>
            
            <div className="checkout-grid">
              {/* Form client */}
              <div className="form-card">
                <h2>Tus Datos</h2>
                <form onSubmit={handleCheckoutSubmit}>
                  <div className="campo">
                    <label>Nombre Completo <span style={{ color: 'var(--tertiary-container)' }}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Ej: Sergio Alarcón" 
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="campo">
                    <label>Teléfono <span style={{ color: 'var(--gris)' }}>(para contacto WhatsApp)</span></label>
                    <input 
                      type="tel" 
                      placeholder="Ej: 612 345 678" 
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                    />
                  </div>
                  <div className="campo">
                    <label>Notas de entrega <span style={{ color: 'var(--gris)' }}>(opcional)</span></label>
                    <textarea 
                      placeholder="Ej: Prefiero entrega en el campus por la mañana, o detalles especiales..." 
                      value={checkoutNotes}
                      onChange={(e) => setCheckoutNotes(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="submit-btn" 
                    disabled={isSubmittingOrder || cart.length === 0}
                  >
                    {isSubmittingOrder ? 'Procesando...' : 'Confirmar y Enviar Pedido'}
                  </button>
                </form>
              </div>

              {/* Items summary */}
              <div className="resumen-checkout">
                <h2>Tu Selección</h2>
                <div className="res-items">
                  {cart.map((item, index) => (
                    <div key={index} className="res-item">
                      <div style={{ flex: 1 }}>
                        <div className="res-item-name">{item.nombre}</div>
                        <div className="res-item-talla">Talla: <strong>{item.talla}</strong></div>
                        {item.dorsal && (
                          <div className="res-item-custom">Personalizado: {item.texto_dorsal}</div>
                        )}
                      </div>
                      <div className="res-item-right">
                        <span>x{item.cantidad}</span>
                        <strong>{(item.precio_total * item.cantidad).toFixed(2)} €</strong>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="res-total">
                  <span>Total Pedido:</span>
                  <span>{totalCartPrice.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* D. ORDER CONFIRMATION VIEW */}
        {route.path === '/confirmacion' && confirmedOrder && (
          <div className="confirmation-view fade-in">
            <div className="conf-card">
              <div className="conf-icon">🎉</div>
              <h1>¡Pedido Recibido!</h1>
              <p className="conf-subtitle">Hemos registrado tu selección. Aquí tienes los detalles:</p>
              
              <div className="conf-details-box">
                <div className="conf-row">
                  <span>Pedido ID:</span>
                  <strong>#{confirmedOrder.id}</strong>
                </div>
                <div className="conf-row">
                  <span>Cliente:</span>
                  <strong>{confirmedOrder.nombre_cliente}</strong>
                </div>
                <div className="conf-row">
                  <span>Estado:</span>
                  <strong className="status-badge">{confirmedOrder.estado}</strong>
                </div>
              </div>

              <h3>Productos Seleccionados:</h3>
              <div className="conf-items">
                {confirmedOrder.lineas.map((line, index) => (
                  <div key={index} className="conf-item">
                    <span>
                      {line.producto_nombre} (Talla {line.talla}) x{line.cantidad}
                      {line.dorsal && (
                        <small style={{ display: 'block', color: 'var(--primary-container)' }}>
                          Personalización: {line.texto_dorsal}
                        </small>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* WHATSAPP CTA ACTION */}
              <div className="whatsapp-action">
                <p>Para acelerar el envío y confirmar el pago, mándanos este pedido por WhatsApp:</p>
                <a 
                  href={`https://wa.me/34600000000?text=${encodeURIComponent(
                    `Hola! Quiero confirmar mi pedido #${confirmedOrder.id} a nombre de ${confirmedOrder.nombre_cliente}.\nCamisetas:\n${confirmedOrder.lineas.map(l => `- ${l.producto_nombre} (Talla ${l.talla}) x${l.cantidad} ${l.dorsal ? `[Dorsal: ${l.texto_dorsal}]` : ''}`).join('\n')}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.548 0 10.061-4.512 10.063-10.062a9.99 9.99 0 0 0-2.944-7.113 9.99 9.99 0 0 0-7.11-2.944c-5.551 0-10.062 4.512-10.064 10.061-.001 2.078.573 3.719 1.639 5.351l-.993 3.626 3.754-.984zm11.215-7.647c-.37-.185-2.18-1.077-2.519-1.202-.339-.124-.587-.186-.834.185-.247.37-.957 1.202-1.173 1.449-.216.247-.432.277-.802.092-3.693-1.848-4.95-3.08-5.836-4.598-.37-.636.37-.589 1.06-1.966.115-.23.058-.43-.028-.616-.086-.185-.834-2.008-1.143-2.75-.301-.726-.607-.626-.834-.637-.215-.011-.463-.013-.71-.013-.247 0-.648.093-.987.463-.339.37-1.297 1.266-1.297 3.088s1.328 3.579 1.513 3.826c.185.247 2.613 3.991 6.33 5.597 2.213.956 3.93 1.523 5.275 1.948 1.12.357 2.14.307 2.946.187.897-.134 2.18-.89 2.488-1.753.308-.863.308-1.603.216-1.753-.092-.15-.339-.241-.709-.426z" />
                  </svg>
                  Confirmar por WhatsApp
                </a>
              </div>

              <button className="btn-primary" onClick={() => navigateTo('/')} style={{ marginTop: '2rem' }}>
                Volver al catálogo
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ── SHOPPING CART SLIDE-IN DRAWER ── */}
      <div 
        className={`cesta-drawer-overlay ${cartOpen ? 'active' : ''}`}
        onClick={() => setCartOpen(false)}
      />

      <div className={`cesta-drawer ${cartOpen ? 'open' : ''}`}>
        <div className="cesta-drawer-header">
          <h3>Tu Cesta</h3>
          <button className="close-drawer-btn" onClick={() => setCartOpen(false)}>×</button>
        </div>

        <div className="cesta-drawer-items">
          {cart.length > 0 ? (
            cart.map((item, index) => (
              <div key={index} className="cesta-drawer-item">
                
                {/* SVG dorsal preview thumbnail if custom, otherwise the photo */}
                <div className="cesta-drawer-item-img">
                  {item.dorsal ? (
                    <div style={{ width: '45px', height: '45px' }}>
                      {/* Show back view showing name/number on the cart thumb! */}
                      <JerseySVG 
                        name={item.nombre} 
                        vista="back"
                        dorsalNombre={item.texto_dorsal.split(' ')[0] || ''}
                        dorsalNumero={item.texto_dorsal.split(' ')[1] || ''}
                        styleAttr={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  ) : item.imagen_url ? (
                    <img src={item.imagen_url} alt={item.nombre} />
                  ) : (
                    <div style={{ width: '45px', height: '45px' }}>
                      <JerseySVG name={item.nombre} />
                    </div>
                  )}
                </div>

                <div className="cesta-drawer-item-info">
                  <div className="cesta-drawer-item-name">{item.nombre}</div>
                  <div className="cesta-drawer-item-talla">Talla: {item.talla}</div>
                  {item.dorsal && (
                    <div className="cesta-drawer-item-custom">Dorsal: {item.texto_dorsal}</div>
                  )}
                  <div className="cesta-drawer-item-qty-wrap">
                    <button 
                      className="cesta-drawer-item-qty-btn"
                      onClick={() => handleUpdateQty(index, Math.max(1, item.cantidad - 1))}
                    >
                      -
                    </button>
                    <span className="cesta-drawer-item-qty-val">{item.cantidad}</span>
                    <button 
                      className="cesta-drawer-item-qty-btn"
                      onClick={() => handleUpdateQty(index, item.cantidad + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    className="cesta-drawer-item-remove"
                    onClick={() => handleRemoveItem(index)}
                  >
                    Eliminar
                  </button>
                </div>

                <div className="cesta-drawer-item-price">
                  {(item.precio_total * item.cantidad).toFixed(2)} €
                </div>

              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--gris)' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Tu cesta está vacía</p>
              <button 
                className="btn-primary" 
                onClick={() => { setCartOpen(false); navigateTo('/'); }}
                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              >
                Explorar Catálogo
              </button>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cesta-drawer-footer">
            <div className="cesta-drawer-total">
              <span>Total Cesta:</span>
              <span>{totalCartPrice.toFixed(2)} €</span>
            </div>
            <div className="cesta-drawer-actions">
              <button 
                onClick={() => {
                  setCartOpen(false);
                  navigateTo('/checkout');
                }} 
                className="btn-primary"
                style={{ width: '100%', padding: '1rem', display: 'block', textAlign: 'center' }}
              >
                Tramitar Pedido
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default App;
