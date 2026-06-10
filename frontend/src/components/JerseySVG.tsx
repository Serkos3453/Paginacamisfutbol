import type { JerseyProps, JerseyStyle } from '../types';

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
              <text x="80" y="62" textAnchor="middle" fill={textColor} fontSize="9.5" fontFamily="'Sora', sans-serif" fontWeight="700" letterSpacing="0.1em">
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
