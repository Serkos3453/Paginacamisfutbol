import type { CartItem } from '../types';
import { JerseySVG } from './JerseySVG';

interface CestaDrawerProps {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  cart: CartItem[];
  handleUpdateQty: (index: number, qty: number) => void;
  handleRemoveItem: (index: number) => void;
  navigateTo: (path: string) => void;
}

export function CestaDrawer({
  cartOpen,
  setCartOpen,
  cart,
  handleUpdateQty,
  handleRemoveItem,
  navigateTo
}: CestaDrawerProps) {
  return (
    <>
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
    </>
  );
}
