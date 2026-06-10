

interface SettingsDrawerProps {
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  accent: string;
  setAccent: (accent: string) => void;
  font: string;
  setFont: (font: string) => void;
  mobileCols: number;
  setMobileCols: (cols: number) => void;
}

export function SettingsDrawer({
  settingsOpen,
  setSettingsOpen,
  theme,
  setTheme,
  accent,
  setAccent,
  font,
  setFont,
  mobileCols,
  setMobileCols
}: SettingsDrawerProps) {
  return (
    <>
      {/* ── SETTINGS SLIDE-IN DRAWER ── */}
      <div 
        className={`cesta-drawer-overlay ${settingsOpen ? 'active' : ''}`}
        onClick={() => setSettingsOpen(false)}
      />

      <div className={`cesta-drawer ${settingsOpen ? 'open' : ''}`}>
        <div className="cesta-drawer-header">
          <h3>Personalización</h3>
          <button className="close-drawer-btn" onClick={() => setSettingsOpen(false)}>×</button>
        </div>

        <div className="cesta-drawer-items" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* A. TEMA CLARO / OSCURO */}
          <div className="form-section">
            <span className="section-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tema Principal</span>
            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.6rem' }}>
              <button 
                className={`theme-mode-btn ${theme === 'dark' ? 'selected' : ''}`}
                onClick={() => setTheme('dark')}
                style={{
                  flex: 1,
                  background: theme === 'dark' ? 'var(--primary)' : 'rgba(128,128,128,0.08)',
                  color: theme === 'dark' ? '#0b0c10' : 'var(--text-main)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Oscuro 🌙
              </button>
              <button 
                className={`theme-mode-btn ${theme === 'light' ? 'selected' : ''}`}
                onClick={() => setTheme('light')}
                style={{
                  flex: 1,
                  background: theme === 'light' ? 'var(--primary)' : 'rgba(128,128,128,0.08)',
                  color: theme === 'light' ? '#0b0c10' : 'var(--text-main)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Claro ☀️
              </button>
            </div>
          </div>

          {/* B. COLOR DE ACENTO */}
          <div className="form-section">
            <span className="section-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Color de Acento</span>
            <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
              {[
                { id: 'green', name: 'Verde', color: '#00ff66' },
                { id: 'blue', name: 'Azul', color: '#00f0ff' },
                { id: 'red', name: 'Rojo', color: '#ff3b30' },
                { id: 'gold', name: 'Oro', color: '#ffb700' },
                { id: 'pink', name: 'Rosa', color: '#ff007f' }
              ].map((colorItem) => (
                <button
                  key={colorItem.id}
                  onClick={() => setAccent(colorItem.id)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: colorItem.color,
                    border: accent === colorItem.id ? '3px solid var(--text-main)' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: accent === colorItem.id ? '0 0 10px var(--primary-glow)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                  title={colorItem.name}
                />
              ))}
            </div>
          </div>

          {/* C. TIPOGRAFÍA */}
          <div className="form-section">
            <span className="section-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estilo de Letra</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.6rem' }}>
              {[
                { id: 'sora', name: 'Sora (Moderno)', fontStyle: 'Sora' },
                { id: 'mono', name: 'JetBrains Mono (Técnico)', fontStyle: 'monospace' },
                { id: 'serif', name: 'Playfair Display (Elegante)', fontStyle: 'serif' }
              ].map((fontItem) => (
                <button
                  key={fontItem.id}
                  onClick={() => setFont(fontItem.id)}
                  style={{
                    textAlign: 'left',
                    background: font === fontItem.id ? 'var(--primary)' : 'rgba(128,128,128,0.08)',
                    color: font === fontItem.id ? '#0b0c10' : 'var(--text-main)',
                    border: font === fontItem.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '0.7rem 1rem',
                    cursor: 'pointer',
                    fontFamily: fontItem.id === 'sora' ? "'Sora', sans-serif" : fontItem.id === 'mono' ? "'JetBrains Mono', monospace" : "'Playfair Display', serif",
                    fontWeight: font === fontItem.id ? 700 : 500,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {fontItem.name}
                </button>
              ))}
            </div>
          </div>

          {/* D. COLUMNAS EN MÓVIL */}
          <div className="form-section">
            <span className="section-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Diseño en Móvil (Columnas)</span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Elige cuántas camisetas ver por fila en tu móvil</p>
            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.6rem' }}>
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  className={`cols-select-btn ${mobileCols === num ? 'selected' : ''}`}
                  onClick={() => setMobileCols(num)}
                  style={{
                    flex: 1,
                    background: mobileCols === num ? 'var(--primary)' : 'rgba(128,128,128,0.08)',
                    color: mobileCols === num ? '#0b0c10' : 'var(--text-main)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '0.6rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {num} {num === 1 ? 'Col' : 'Cols'}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
