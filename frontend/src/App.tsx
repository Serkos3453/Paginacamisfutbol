import { useState, useEffect } from 'react'

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
              <div className="category-tabs-wrap">
                <div className="category-tabs">
                  <button 
                    onClick={() => handleCategoryClick(null)}
                    className={`category-tab ${selectedCat === null ? 'active' : ''}`}
                  >
                    <span>⚽</span> Todas
                  </button>
                  {categories.map((cat) => (
                    <button 
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className={`category-tab ${selectedCat === cat.slug ? 'active' : ''}`}
                    >
                      <span>{cat.icono || '⚽'}</span> {cat.nombre}
                    </button>
                  ))}
                </div>
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
