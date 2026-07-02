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
  const [checkoutStep, setCheckoutStep] = useState(1);

  // User Authentication States
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string } | null>(null);
  const [checkoutAuthTab, setCheckoutAuthTab] = useState<'login' | 'registro'>('login');
  const [misPedidos, setMisPedidos] = useState<any[]>([]);

  // Order modification states
  const [modifyingOrder, setModifyingOrder] = useState<number | null>(null);
  const [modifyName, setModifyName] = useState('');
  const [modifyPhone, setModifyPhone] = useState('');
  const [modifyNotes, setModifyNotes] = useState('');
  const [modifyLineas, setModifyLineas] = useState<any[]>([]);

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
    checkAuth();

    // 4. Prefill customer details from localStorage if they exist
    const savedName = localStorage.getItem('checkoutName');
    const savedPhone = localStorage.getItem('checkoutPhone');
    if (savedName) setCheckoutName(savedName);
    if (savedPhone) setCheckoutPhone(savedPhone);

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

  // Scroll to top when catalog page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

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
      setCheckoutStep(1);
      return;
    } else if (path === '/retro' || path === '/retro/') {
      setRoute({ path: '/retro' });
      setIsRetroTab(true);
      fetchCatalog(1, null, '', true);
      return;
    } else if (path === '/login' || path === '/login/') {
      setRoute({ path: '/login' });
      return;
    } else if (path === '/registro' || path === '/registro/') {
      setRoute({ path: '/registro' });
      return;
    } else if (path === '/mis-pedidos' || path === '/mis-pedidos/') {
      setRoute({ path: '/mis-pedidos' });
      fetchMisPedidos();
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

  // User Auth & Order Helpers
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me/');
      if (res.ok) {
        const data = await res.json();
        if (data.is_authenticated) {
          setCurrentUser({ id: data.id, username: data.username });
          setCheckoutName(prev => prev || data.username);
        } else {
          setCurrentUser(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMisPedidos = async () => {
    try {
      const res = await fetch('/api/mis-pedidos/');
      if (res.ok) {
        const data = await res.json();
        setMisPedidos(data.pedidos || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    const csrf = getCookie('csrftoken');
    try {
      const res = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrf || '',
        },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setCheckoutName(data.user.username);
        showToast('¡Sesión iniciada con éxito! 🎉');
        navigateTo('/');
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (e) {
      return { success: false, message: 'Error de red al iniciar sesión' };
    }
  };

  const handleRegister = async (username: string, password: string) => {
    const csrf = getCookie('csrftoken');
    try {
      const res = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrf || '',
        },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setCheckoutName(data.user.username);
        showToast('¡Registro completado con éxito! 🎉');
        navigateTo('/');
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (e) {
      return { success: false, message: 'Error de red al registrarse' };
    }
  };

  const handleLogout = async () => {
    const csrf = getCookie('csrftoken');
    try {
      const res = await fetch('/api/auth/logout/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrf || '',
        }
      });
      if (res.ok) {
        setCurrentUser(null);
        setMisPedidos([]);
        showToast('Sesión cerrada.');
        navigateTo('/');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    const csrf = getCookie('csrftoken');
    try {
      const res = await fetch(`/api/pedido/${orderId}/cancelar/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrf || '',
        }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Pedido cancelado correctamente.');
        fetchMisPedidos();
      } else {
        showToast(data.message);
      }
    } catch (e) {
      showToast('Error al cancelar el pedido');
    }
  };

  const handleModifyOrder = async (orderId: number, orderData: { nombre: string; telefono: string; notas: string; lineas: any[] }) => {
    const csrf = getCookie('csrftoken');
    try {
      const res = await fetch(`/api/pedido/${orderId}/modificar/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrf || '',
        },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        fetchMisPedidos();
        return { success: true };
      } else {
        showToast(data.message);
        return { success: false, message: data.message };
      }
    } catch (e) {
      showToast('Error al modificar el pedido');
      return { success: false, message: 'Error de red' };
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
    if (!checkoutPhone.trim()) {
      showToast('El teléfono es obligatorio.');
      return;
    }
    setIsSubmittingOrder(true);

    const csrf = getCookie('csrftoken');
    
    // Generar o recuperar token de idempotencia para asegurar que no se creen duplicados
    let orderToken = localStorage.getItem('pending_order_token');
    if (!orderToken) {
      orderToken = 'req_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      localStorage.setItem('pending_order_token', orderToken);
    }

    const maxRetries = 4;
    let attempt = 0;
    let delay = 1000; // delay inicial de 1s
    let success = false;
    let responseData: any = null;
    let lastError: any = null;

    while (attempt < maxRetries && !success) {
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
            notas: checkoutNotes,
            token_idempotencia: orderToken
          })
        });

        if (res.ok) {
          responseData = await res.json();
          success = true;
        } else {
          try {
            responseData = await res.json();
          } catch (err) {
            responseData = { message: `Error de servidor (${res.status})` };
          }
          
          // Si es un error del cliente (4xx), no tiene sentido reintentar (cesta vacía, datos inválidos, etc.)
          if (res.status >= 400 && res.status < 500) {
            lastError = new Error(responseData?.message || `Error de validación (${res.status})`);
            break;
          }
          
          lastError = new Error(responseData?.message || `Error en el servidor (${res.status})`);
        }
      } catch (err) {
        lastError = err;
        console.warn(`Intento de envío ${attempt + 1} fallido por error de red:`, err);
      }

      if (!success) {
        attempt++;
        if (attempt < maxRetries) {
          showToast(`Error de conexión. Reintentando envío (${attempt}/${maxRetries - 1})...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // backoff exponencial
        }
      }
    }

    if (success && responseData?.success) {
      // Limpiar token y cesta una vez completado con éxito
      localStorage.removeItem('pending_order_token');
      setCart([]);
      setCheckoutName('');
      setCheckoutPhone('');
      setCheckoutNotes('');
      navigateTo(`/confirmacion/${responseData.pedido_id}`);
    } else {
      const errorMsg = lastError?.message || responseData?.message || "Error de conexión. Inténtalo de nuevo.";
      showToast(errorMsg);
    }
    
    setIsSubmittingOrder(false);
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
          {currentUser ? (
            <>
              <span 
                onClick={() => navigateTo('/mis-pedidos')} 
                className={`nav-link ${route.path === '/mis-pedidos' ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                Mis Pedidos 📦
              </span>
              <span 
                onClick={handleLogout} 
                className="nav-link"
                style={{ cursor: 'pointer', color: 'var(--red, #ff3b30)' }}
              >
                Salir 🚪
              </span>
            </>
          ) : (
            <span 
              onClick={() => navigateTo('/login')} 
              className={`nav-link ${route.path === '/login' || route.path === '/registro' ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              Entrar 👤
            </span>
          )}
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
            {currentPage === 1 && (
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
            )}

            {/* AVISO DE PRECIO */}
            <div className="price-notice-banner" style={{ 
              background: 'rgba(0, 255, 102, 0.07)', 
              border: '1px solid var(--primary)', 
              borderRadius: '16px', 
              padding: '1.2rem 1.5rem', 
              marginBottom: '2rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{ fontSize: '1.8rem' }}>💰</span>
              <div>
                <strong style={{ color: 'var(--primary)', fontSize: '1.1rem', display: 'block', marginBottom: '0.2rem' }}>Información sobre Precios:</strong>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#ffffff', lineHeight: '1.4' }}>
                  Para saber el precio de tu pedido, por favor contacta con <strong>Sergio</strong> en el teléfono <strong>611 41 53 76</strong>.
                </p>
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
                <div className="viewer-box single-photo-view">
                  {detailProduct.imagen_url ? (
                    <img 
                      className="detail-photo" 
                      src={detailProduct.imagen_url} 
                      alt={detailProduct.nombre} 
                    />
                  ) : (
                    <div className="fallback-svg-view">
                      <JerseySVG name={detailProduct.nombre} />
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
                    <span className="section-label">
                      Selecciona tu talla {detailProduct.categoria?.tipo === 'kids' && '🧒 (Equipación de Niño)'}
                    </span>
                    <div className="tallas-grid">
                      {detailProduct.tallas.map((talla) => {
                        let label = talla;
                        if (detailProduct.categoria?.tipo === 'kids' || detailProduct.categoria?.slug === 'niños' || detailProduct.categoria?.slug === 'kids') {
                          if (talla === '20') label = 'Talla 20 (5-6 años)';
                          else if (talla === '22') label = 'Talla 22 (7-8 años)';
                          else if (talla === '24') label = 'Talla 24 (9-10 años)';
                          else if (talla === '26') label = 'Talla 26 (11-12 años)';
                        }
                        return (
                          <button
                            type="button"
                            key={talla}
                            className={`talla-btn ${selectedTalla === talla ? 'selected' : ''}`}
                            onClick={() => setSelectedTalla(talla)}
                          >
                            {label}
                          </button>
                        );
                      })}
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
          <div className="checkout-view fade-in" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            {/* Step indicator */}
            <div className="checkout-steps-bar" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
              <div className={`step-indicator ${checkoutStep >= 1 ? 'active' : ''}`} style={{ fontWeight: 'bold', fontSize: '1.1rem', borderBottom: checkoutStep === 1 ? '3px solid var(--primary)' : 'none', paddingBottom: '0.5rem', color: checkoutStep === 1 ? 'var(--primary)' : 'var(--text-muted)' }}>
                🛒 Paso 1: Revisa tu Cesta
              </div>
              <div className={`step-indicator ${checkoutStep >= 2 ? 'active' : ''}`} style={{ fontWeight: 'bold', fontSize: '1.1rem', borderBottom: checkoutStep === 2 ? '3px solid var(--primary)' : 'none', paddingBottom: '0.5rem', color: checkoutStep === 2 ? 'var(--primary)' : 'var(--text-muted)' }}>
                📝 Paso 2: Pon tus Datos
              </div>
            </div>

            {/* Helper Mascot Golazo */}
            <div className="helper-mascot-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.2rem', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '3rem' }}>🐻</div>
              <div>
                <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>Golazo (Tu ayudante):</strong>
                <p style={{ margin: '0.3rem 0 0 0', fontSize: '1rem', color: '#e0e0e0', lineHeight: '1.4' }}>
                  {checkoutStep === 1 
                    ? "¡Hola! Mira las camisetas que has elegido para tu pedido. Si todo está correcto, pulsa el gran botón verde para poner tu nombre y teléfono."
                    : "¡Genial! Ya casi está listo. Ahora dime cómo te llamas y un teléfono para que podamos mandarte tu pedido a casa."
                  }
                </p>
              </div>
            </div>

            {checkoutStep === 1 && (
              <div className="resumen-checkout-step fade-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Tus Camisetas Elegidas 👕</h2>
                
                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Tu cesta está vacía. ¡Ve al catálogo a elegir alguna!</p>
                    <button className="add-cart-btn" onClick={() => navigateTo('/')} style={{ background: 'var(--primary)', color: '#0b0c10', border: 'none', borderRadius: '10px', padding: '0.8rem 2rem', fontWeight: 'bold', cursor: 'pointer' }}>Volver al catálogo</button>
                  </div>
                ) : (
                  <>
                    <div className="res-items" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                      {cart.map((item, index) => (
                        <div key={index} className="res-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <div className="res-item-name" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{item.nombre}</div>
                            <div className="res-item-talla" style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.3rem' }}>
                              Talla: <strong style={{ color: 'var(--primary)' }}>{item.talla}</strong>
                            </div>
                            {item.dorsal && (
                              <div className="res-item-custom" style={{ fontSize: '0.95rem', color: 'var(--primary)', marginTop: '0.3rem' }}>
                                ⭐ Personalizado: {item.texto_dorsal}
                              </div>
                            )}
                          </div>
                          <div className="res-item-right" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                            {/* Quantity controls directly in the checkout view */}
                            <div className="qty-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.3rem 0.6rem' }}>
                              <button type="button" onClick={() => handleUpdateQty(item.camiseta_id, Math.max(1, item.cantidad - 1))} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.4rem', fontWeight: 'bold' }}>-</button>
                              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.cantidad}</span>
                              <button type="button" onClick={() => handleUpdateQty(item.camiseta_id, item.cantidad + 1)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.4rem', fontWeight: 'bold' }}>+</button>
                            </div>
                            <button type="button" onClick={() => handleRemoveItem(item.camiseta_id)} style={{ background: 'transparent', border: 'none', color: 'var(--red, #ff3b30)', cursor: 'pointer', fontSize: '1.4rem', padding: '0.3rem' }} title="Eliminar artículo">🗑️</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {currentUser ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginTop: '2rem' }}>
                        <button className="volver-catalogo-btn" onClick={() => navigateTo('/')} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '10px', padding: '0.8rem 1.5rem', cursor: 'pointer', fontSize: '1rem' }}>
                          ← Seguir comprando
                        </button>
                        <button className="add-cart-btn" onClick={() => setCheckoutStep(2)} style={{ background: 'var(--primary)', color: '#0b0c10', border: 'none', borderRadius: '10px', padding: '0.8rem 2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                          Siguiente paso: Mis Datos ➡️
                        </button>
                      </div>
                    ) : (
                      <div style={{ marginTop: '2rem', padding: '2rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed var(--border)', borderRadius: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Casi listo... ¡Identifícate para continuar!</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                          Necesitas iniciar sesión o registrarte para tramitar tu pedido. De esta forma podrás modificarlo o cancelarlo si lo necesitas.
                        </p>

                        {/* Tab toggles */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                          <button 
                            type="button"
                            onClick={() => setCheckoutAuthTab('login')} 
                            style={{
                              background: checkoutAuthTab === 'login' ? 'var(--primary)' : 'transparent',
                              color: checkoutAuthTab === 'login' ? '#0b0c10' : 'var(--text-muted)',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              padding: '0.5rem 1.5rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            🔑 Ya tengo cuenta
                          </button>
                          <button 
                            type="button"
                            onClick={() => setCheckoutAuthTab('registro')}
                            style={{
                              background: checkoutAuthTab === 'registro' ? 'var(--primary)' : 'transparent',
                              color: checkoutAuthTab === 'registro' ? '#0b0c10' : 'var(--text-muted)',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              padding: '0.5rem 1.5rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            👤 Crear cuenta nueva
                          </button>
                        </div>

                        {/* Render active form */}
                        <div style={{ maxWidth: '360px', margin: '0 auto', textAlign: 'left' }}>
                          {checkoutAuthTab === 'login' ? (
                            <form onSubmit={async (e) => {
                              e.preventDefault();
                              const target = e.target as any;
                              const u = target.username.value;
                              const p = target.password.value;
                              const res = await handleLogin(u, p);
                              if (!res.success) {
                                alert(res.message || 'Error al iniciar sesión');
                              }
                            }}>
                              <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Usuario</label>
                                <input type="text" name="username" placeholder="Ej: sergio123" required style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: '#fff' }} />
                              </div>
                              <div style={{ marginBottom: '1.2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Contraseña</label>
                                <input type="password" name="password" placeholder="Tu contraseña" required style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: '#fff' }} />
                              </div>
                              <button type="submit" className="add-cart-btn" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--primary)', color: '#0b0c10', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                                Iniciar Sesión 🚀
                              </button>
                            </form>
                          ) : (
                            <form onSubmit={async (e) => {
                              e.preventDefault();
                              const target = e.target as any;
                              const u = target.username.value;
                              const p = target.password.value;
                              const res = await handleRegister(u, p);
                              if (!res.success) {
                                alert(res.message || 'Error al registrarse');
                              }
                            }}>
                              <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Usuario nuevo</label>
                                <input type="text" name="username" placeholder="Ej: nino99" required style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: '#fff' }} />
                              </div>
                              <div style={{ marginBottom: '1.2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Contraseña</label>
                                <input type="password" name="password" placeholder="Mínimo 4 caracteres" required style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: '#fff' }} />
                              </div>
                              <button type="submit" className="add-cart-btn" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--primary)', color: '#0b0c10', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                                Registrarme y Continuar 🌟
                              </button>
                            </form>
                          )}
                        </div>

                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                          <button type="button" className="volver-catalogo-btn" onClick={() => navigateTo('/')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}>
                            ← Volver al catálogo y seguir comprando sin cuenta
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {checkoutStep === 2 && currentUser && (
              <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
                {/* Form client */}
                <div className="form-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>
                  <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>Tus Datos de Envío 📝</h2>
                  <div style={{ background: 'rgba(0, 255, 102, 0.07)', border: '1px solid var(--primary)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.95rem', color: '#ffffff', lineHeight: '1.5' }}>
                    <div style={{ marginBottom: '0.6rem' }}>ℹ️ Cualquier cosa, contacte con <strong>Sergio</strong> en el teléfono <strong>611 41 53 76</strong>.</div>
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.6rem' }}>📢 <strong>¿Vienes de parte de alguien?</strong> Por favor, escribe en las <strong>Notas</strong> de parte de quién vienes para saber quién hace el pedido.</div>
                  </div>
                  <form onSubmit={handleCheckoutSubmit}>
                    <div className="campo" style={{ marginBottom: '1.2rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Mi Nombre Completo <span style={{ color: 'var(--primary)' }}>*</span></label>
                      <input 
                        type="text" 
                        placeholder="Ej: Sergio Alarcón" 
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        required 
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: '#fff', fontSize: '1rem' }}
                      />
                    </div>
                    <div className="campo" style={{ marginBottom: '1.2rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Mi Teléfono <span style={{ color: 'var(--primary)' }}>*</span></label>
                      <input 
                        type="tel" 
                        placeholder="Ej: 612 345 678" 
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: '#fff', fontSize: '1rem' }}
                      />
                    </div>
                    <div className="campo" style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Notas / ¿De parte de quién vienes? <span style={{ color: 'var(--text-muted)' }}>(opcional)</span></label>
                      <textarea 
                        placeholder="Si vienes de parte de alguien, escribe su nombre aquí. También puedes añadir indicaciones sobre la entrega, etc." 
                        value={checkoutNotes}
                        onChange={(e) => setCheckoutNotes(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: '#fff', fontSize: '1rem', minHeight: '80px' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                      <button type="button" onClick={() => setCheckoutStep(1)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '10px', padding: '0.8rem 1.5rem', cursor: 'pointer', fontSize: '1rem' }}>
                        ← Atrás
                      </button>
                      <button 
                        type="submit" 
                        className="submit-btn" 
                        disabled={isSubmittingOrder || cart.length === 0}
                        style={{ flex: 1, padding: '0.8rem 2rem', fontSize: '1.1rem', background: 'var(--primary)', color: '#0b0c10', fontWeight: 'bold', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
                      >
                        {isSubmittingOrder ? 'Enviando...' : '¡Confirmar y Enviar Pedido! 🛒'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Resumen mini */}
                <div className="resumen-checkout" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Resumen</h3>
                  <div className="res-items" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {cart.map((item, index) => (
                      <div key={index} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{item.nombre}</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Talla {item.talla} x{item.cantidad}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {checkoutStep === 2 && !currentUser && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Debes registrarte o iniciar sesión para continuar con el pedido.</p>
                <button className="add-cart-btn" onClick={() => setCheckoutStep(1)} style={{ background: 'var(--primary)', color: '#0b0c10', border: 'none', borderRadius: '10px', padding: '0.8rem 2rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  Ir a identificarse
                </button>
              </div>
            )}
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

        {/* E. LOGIN VIEW */}
        {route.path === '/login' && (
          <div className="login-view fade-in" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>Iniciar Sesión 🔑</h1>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>Accede para ver tus pedidos y poder cancelarlos o modificarlos.</p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const target = e.target as any;
              const u = target.username.value;
              const p = target.password.value;
              const res = await handleLogin(u, p);
              if (!res.success) {
                alert(res.message || 'Error al iniciar sesión');
              }
            }}>
              <div className="campo" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nombre de usuario</label>
                <input type="text" name="username" placeholder="Ej: sergio123" required style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: '#fff' }} />
              </div>
              <div className="campo" style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Contraseña</label>
                <input type="password" name="password" placeholder="Tu contraseña" required style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: '#fff' }} />
              </div>
              
              <button type="submit" className="add-cart-btn" style={{ width: '100%', padding: '1rem', borderRadius: '10px', background: 'var(--primary)', color: '#0b0c10', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                Entrar 🚀
              </button>
            </form>
            
            <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              ¿No tienes cuenta?{' '}
              <span onClick={() => navigateTo('/registro')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
                Regístrate aquí
              </span>
            </p>
          </div>
        )}

        {/* F. REGISTRO VIEW */}
        {route.path === '/registro' && (
          <div className="registro-view fade-in" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>Crear Cuenta 👤</h1>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>Regístrate para poder modificar y cancelar tus pedidos al instante.</p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const target = e.target as any;
              const u = target.username.value;
              const p = target.password.value;
              const res = await handleRegister(u, p);
              if (!res.success) {
                alert(res.message || 'Error al registrarse');
              }
            }}>
              <div className="campo" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nombre de usuario</label>
                <input type="text" name="username" placeholder="Ej: sergio123" required style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: '#fff' }} />
              </div>
              <div className="campo" style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Contraseña</label>
                <input type="password" name="password" placeholder="Tu contraseña" required style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: '#fff' }} />
              </div>
              
              <button type="submit" className="add-cart-btn" style={{ width: '100%', padding: '1rem', borderRadius: '10px', background: 'var(--primary)', color: '#0b0c10', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                Registrarme 🌟
              </button>
            </form>
            
            <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              ¿Ya tienes cuenta?{' '}
              <span onClick={() => navigateTo('/login')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
                Inicia sesión aquí
              </span>
            </p>
          </div>
        )}

        {/* G. MIS PEDIDOS VIEW */}
        {route.path === '/mis-pedidos' && (
          <div className="mis-pedidos-view fade-in" style={{ maxWidth: '900px', margin: '2rem auto' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Mis Pedidos 📦</h1>

            {!currentUser ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Debes iniciar sesión para ver y gestionar tus pedidos.</p>
                <button className="add-cart-btn" onClick={() => navigateTo('/login')} style={{ background: 'var(--primary)', color: '#0b0c10', border: 'none', borderRadius: '10px', padding: '0.8rem 2rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  Iniciar Sesión
                </button>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                  Hola, <strong>{currentUser.username}</strong>. Aquí tienes el historial de tus pedidos. Los pedidos en estado <strong>Pendiente</strong> se pueden cancelar o modificar.
                </p>

                {misPedidos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Aún no has realizado ningún pedido.</p>
                    <button className="add-cart-btn" onClick={() => navigateTo('/')} style={{ background: 'var(--primary)', color: '#0b0c10', border: 'none', borderRadius: '10px', padding: '0.8rem 2rem', fontWeight: 'bold', cursor: 'pointer' }}>
                      Ir al catálogo 🛒
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {misPedidos.map((pedido) => {
                      const isPending = pedido.estado === 'pendiente';
                      const isModifying = modifyingOrder === pedido.id;

                      if (isModifying) {
                        return (
                          <div key={pedido.id} className="pedido-card-modifying fade-in" style={{ background: 'var(--bg-card)', border: '2px solid var(--primary)', borderRadius: '16px', padding: '2rem' }}>
                            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Modificar Pedido #{pedido.id} ✏️</h2>
                            
                            <div className="form-card" style={{ background: 'transparent', border: 'none', padding: 0, marginBottom: '2rem' }}>
                              <div className="campo" style={{ marginBottom: '1rem' }}>
                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Nombre del Cliente <span style={{ color: 'var(--primary)' }}>*</span></label>
                                <input type="text" value={modifyName} onChange={(e) => setModifyName(e.target.value)} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: '#fff' }} />
                              </div>
                              <div className="campo" style={{ marginBottom: '1rem' }}>
                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Teléfono <span style={{ color: 'var(--primary)' }}>*</span></label>
                                <input type="text" value={modifyPhone} onChange={(e) => setModifyPhone(e.target.value)} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: '#fff' }} />
                              </div>
                              <div className="campo" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Notas o Comentarios</label>
                                <textarea value={modifyNotes} onChange={(e) => setModifyNotes(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: '#fff', minHeight: '80px' }} />
                              </div>

                              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Camisetas del Pedido:</h3>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                {modifyLineas.map((linea, lIdx) => (
                                  <div key={linea.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontWeight: 'bold' }}>{linea.producto_nombre}</div>
                                      
                                      {/* Talla select */}
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Talla:</span>
                                        <select 
                                          value={linea.talla} 
                                          onChange={(e) => {
                                            const updated = [...modifyLineas];
                                            updated[lIdx].talla = e.target.value;
                                            setModifyLineas(updated);
                                          }}
                                          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}
                                        >
                                          {['20', '22', '24', '26', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(sz => (
                                            <option key={sz} value={sz}>{sz}</option>
                                          ))}
                                        </select>
                                      </div>

                                      {linea.dorsal && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dorsal:</span>
                                          <input 
                                            type="text" 
                                            value={linea.texto_dorsal} 
                                            onChange={(e) => {
                                              const updated = [...modifyLineas];
                                              updated[lIdx].texto_dorsal = e.target.value;
                                              setModifyLineas(updated);
                                            }}
                                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}
                                          />
                                        </div>
                                      )}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                      {/* Quantity editor */}
                                      <div className="qty-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.25rem 0.5rem' }}>
                                        <button type="button" onClick={() => {
                                          const updated = [...modifyLineas];
                                          updated[lIdx].cantidad = Math.max(0, linea.cantidad - 1);
                                          setModifyLineas(updated);
                                        }} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}>-</button>
                                        <span style={{ fontWeight: 'bold' }}>{linea.cantidad}</span>
                                        <button type="button" onClick={() => {
                                          const updated = [...modifyLineas];
                                          updated[lIdx].cantidad = linea.cantidad + 1;
                                          setModifyLineas(updated);
                                        }} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}>+</button>
                                      </div>
                                      
                                      <button type="button" onClick={() => {
                                        const updated = [...modifyLineas];
                                        updated[lIdx].cantidad = 0;
                                        setModifyLineas(updated);
                                      }} style={{ background: 'transparent', border: 'none', color: 'var(--red, #ff3b30)', cursor: 'pointer', fontSize: '1.1rem' }} title="Quitar">🗑️</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                              <button 
                                className="volver-catalogo-btn" 
                                onClick={() => setModifyingOrder(null)}
                                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '8px', padding: '0.8rem 1.5rem', cursor: 'pointer' }}
                              >
                                Cancelar edición
                              </button>
                              <button 
                                className="add-cart-btn" 
                                onClick={async () => {
                                  if (!modifyName.trim()) {
                                    showToast('El nombre es obligatorio.');
                                    return;
                                  }
                                  if (!modifyPhone.trim()) {
                                    showToast('El teléfono es obligatorio.');
                                    return;
                                  }
                                  const res = await handleModifyOrder(pedido.id, {
                                    nombre: modifyName,
                                    telefono: modifyPhone,
                                    notas: modifyNotes,
                                    lineas: modifyLineas
                                  });
                                  if (res.success) {
                                    setModifyingOrder(null);
                                  }
                                }}
                                style={{ background: 'var(--primary)', color: '#0b0c10', border: 'none', borderRadius: '8px', padding: '0.8rem 2rem', fontWeight: 'bold', cursor: 'pointer', flex: 1 }}
                              >
                                Guardar Cambios 💾
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={pedido.id} className="pedido-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                            <div>
                              <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Pedido #{pedido.id}</span>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '1rem' }}>{new Date(pedido.fecha_pedido).toLocaleDateString()}</span>
                            </div>
                            <span className="status-badge" style={{ 
                              background: pedido.estado === 'cancelado' ? 'rgba(255,59,48,0.15)' : pedido.estado === 'pendiente' ? 'rgba(255,183,0,0.15)' : 'rgba(0,255,102,0.15)',
                              color: pedido.estado === 'cancelado' ? '#ff3b30' : pedido.estado === 'pendiente' ? '#ffb700' : 'var(--primary)',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '30px',
                              fontSize: '0.85rem',
                              fontWeight: 'bold'
                            }}>
                              {pedido.estado_display}
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.95rem' }}>
                            <div>
                              <strong>Nombre:</strong> {pedido.nombre_cliente} <br />
                              <strong>Teléfono:</strong> {pedido.telefono || '—'}
                            </div>
                            <div>
                              <strong>Notas:</strong> <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{pedido.notas || 'Sin notas adicionales.'}</span>
                            </div>
                          </div>

                          <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Productos:</strong>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {pedido.lineas.map((linea: any) => (
                                <div key={linea.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                  <span>
                                    {linea.producto_nombre} (Talla <strong>{linea.talla}</strong>) x{linea.cantidad}
                                    {linea.dorsal && <small style={{ display: 'block', color: 'var(--primary)', fontSize: '0.8rem' }}>⭐ Personalizado: {linea.texto_dorsal}</small>}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {isPending && (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignSelf: 'flex-end' }}>
                              <button 
                                onClick={() => {
                                  setModifyingOrder(pedido.id);
                                  setModifyName(pedido.nombre_cliente);
                                  setModifyPhone(pedido.telefono);
                                  setModifyNotes(pedido.notas);
                                  setModifyLineas(JSON.parse(JSON.stringify(pedido.lineas))); // Deep copy
                                }}
                                style={{ background: 'rgba(0, 240, 255, 0.1)', color: '#00f0ff', border: '1px solid #00f0ff', borderRadius: '8px', padding: '0.6rem 1.2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                ✏️ Modificar
                              </button>
                              <button 
                                onClick={() => {
                                  if (confirm('¿Estás seguro de que quieres cancelar este pedido? Se ocultará de la administración.')) {
                                    handleCancelOrder(pedido.id);
                                  }
                                }}
                                style={{ background: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30', border: '1px solid #ff3b30', borderRadius: '8px', padding: '0.6rem 1.2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                ❌ Cancelar Pedido
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
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
