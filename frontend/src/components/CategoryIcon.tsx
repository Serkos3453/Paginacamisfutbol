

export function CategoryIcon({ type }: { type: string }) {
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
