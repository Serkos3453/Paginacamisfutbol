import { useState, useEffect, useRef } from 'react'
import { getCookie } from './utils'
import type { Category, Product, CartItem } from './types'
import { JerseySVG } from './components/JerseySVG'
import { CategoryCard } from './components/CategoryCard'
import { Interactive3DJersey } from './components/Interactive3DJersey'
import { CestaDrawer } from './components/CestaDrawer'
import { SettingsDrawer } from './components/SettingsDrawer'


function App() {
  // Navigation Routing States
  const [route, setRoute] = useState<{ path: string; param?: number }>({ path: '/' });
  
  // App-wide Shopping Cart States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  const [toastBinds, setToastBinds] = useState(0);

  // UI Theme & User Personalization States
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [accent, setAccent] = useState(() => localStorage.getItem('accent') || 'green');
  const [font, setFont] = useState(() => localStorage.getItem('font') || 'sora');
  const [mobileCols, setMobileCols] = useState(() => parseInt(localStorage.getItem('mobileCols') || '3'));

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

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
      document.documentElement.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
      document.documentElement.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const colors: Record<string, { dark: string; light: string; glow: string }> = {
      green: { dark: '#00ff66', light: '#00bf4c', glow: 'rgba(0, 255, 102, 0.3)' },
      blue: { dark: '#00f0ff', light: '#0088cc', glow: 'rgba(0, 240, 255, 0.3)' },
      red: { dark: '#ff3b30', light: '#d92b2b', glow: 'rgba(255, 59, 48, 0.3)' },
      gold: { dark: '#ffb700', light: '#d97706', glow: 'rgba(255, 183, 0, 0.3)' },
      pink: { dark: '#ff007f', light: '#db2777', glow: 'rgba(255, 0, 127, 0.3)' }
    };
    const activeColor = colors[accent] || colors.green;
    const primaryVal = theme === 'light' ? activeColor.light : activeColor.dark;
    document.documentElement.style.setProperty('--primary', primaryVal);
    document.documentElement.style.setProperty('--primary-glow', activeColor.glow);
    document.documentElement.style.setProperty('--talla-selected-bg', primaryVal);
    localStorage.setItem('accent', accent);
  }, [accent, theme]);

  useEffect(() => {
    const fonts: Record<string, string> = {
      sora: "'Sora', system-ui, -apple-system, sans-serif",
      mono: "'JetBrains Mono', monospace",
      serif: "'Playfair Display', Georgia, serif"
    };
    const activeFont = fonts[font] || fonts.sora;
    document.documentElement.style.setProperty('--font-sans', activeFont);
    localStorage.setItem('font', font);
  }, [font]);

  useEffect(() => {
    document.documentElement.style.setProperty('--mobile-cols', mobileCols.toString());
    localStorage.setItem('mobileCols', mobileCols.toString());
  }, [mobileCols]);

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
          <div className="nav-settings" onClick={() => setSettingsOpen(true)} title="Personalización">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
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
              <div className={`grid cols-${mobileCols}`}>
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
                  {/* <div className="specs-price">{detailProduct.precio.toFixed(2)} €</div> */}
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
                      <span className="custom-checkbox-txt">¿Añadir parche y dorsal?</span>
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
                      </div>
                    </div>
                  ))}
                </div>

                {/* <div className="res-total">
                  <span>Total Pedido:</span>
                  <span>{totalCartPrice.toFixed(2)} €</span>
                </div> */}
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
      <CestaDrawer
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        cart={cart}
        handleUpdateQty={handleUpdateQty}
        handleRemoveItem={handleRemoveItem}
        navigateTo={navigateTo}
      />

      {/* ── SETTINGS SLIDE-IN DRAWER ── */}
      <SettingsDrawer
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        theme={theme as 'light' | 'dark'}
        setTheme={setTheme as (t: 'light' | 'dark') => void}
        accent={accent}
        setAccent={setAccent}
        font={font}
        setFont={setFont}
        mobileCols={mobileCols}
        setMobileCols={setMobileCols}
      />

    </div>
  );
}

export default App;
