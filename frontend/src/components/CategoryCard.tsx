import { useState } from 'react';
import { CategoryIcon } from './CategoryIcon';

export const CATEGORY_CONFIG: Record<string, { bg: string; color: string; logoUrl?: string; fallbackIcon: string }> = {
  'todas': {
    bg: '#ffffff',
    color: '#0b0c10',
    fallbackIcon: 'list'
  },
  'brasileiro-serie-a': {
    bg: '#00a859',
    color: '#ffffff',
    logoUrl: '/static/spa/logos/brasileiro-serie-a.png',
    fallbackIcon: 'trophy'
  },
  'bundesliga': {
    bg: '#df0016',
    color: '#ffffff',
    logoUrl: '/static/spa/logos/bundesliga.png',
    fallbackIcon: 'player'
  },
  'la-liga': {
    bg: '#f7e300',
    color: '#0b0c10',
    logoUrl: '/static/spa/logos/la-liga.png',
    fallbackIcon: 'liga'
  },
  'liga-mx': {
    bg: '#006b47',
    color: '#ffffff',
    logoUrl: '/static/spa/logos/liga-mx.png',
    fallbackIcon: 'ball'
  },
  'ligue-1': {
    bg: '#0b1a30',
    color: '#ffffff',
    logoUrl: '/static/spa/logos/ligue-1.png',
    fallbackIcon: 'hexagon'
  },
  'otras-ligas': {
    bg: '#e2e8f0',
    color: '#0b0c10',
    logoUrl: '/static/spa/logos/otras-ligas.png',
    fallbackIcon: 'shield'
  },
  'premier-league': {
    bg: '#e51a66',
    color: '#ffffff',
    logoUrl: '/static/spa/logos/premier-league.png',
    fallbackIcon: 'lion'
  },
  'serie-a': {
    bg: '#0065af',
    color: '#ffffff',
    logoUrl: '/static/spa/logos/serie-a.png',
    fallbackIcon: 'letter-a'
  },
  'seleccion': {
    bg: '#7f1d1d',
    color: '#ffffff',
    logoUrl: '/static/spa/logos/seleccion.png',
    fallbackIcon: 'globe'
  },
  'niños': {
    bg: '#ffbe1a',
    color: '#0b0c10',
    fallbackIcon: 'jersey'
  },
  'retro': {
    bg: '#7c5b3f',
    color: '#ffffff',
    logoUrl: '/static/spa/logos/retro.svg',
    fallbackIcon: 'leather-ball'
  }
};

interface CategoryCardProps {
  slug: string | null;
  name: string;
  isActive: boolean;
  onClick: () => void;
}

export function CategoryCard({ slug, name, isActive, onClick }: CategoryCardProps) {
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
              filter: 'none',
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
