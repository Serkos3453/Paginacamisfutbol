export interface JerseyStyle {
  primary: string;
  secondary: string;
  pattern: 'stripes' | 'hoops' | 'center' | 'plain';
  patternColor: string;
  textColor: string;
  sponsor: string;
}

export interface JerseyProps {
  name: string;
  dorsalNombre?: string;
  dorsalNumero?: string;
  vista?: 'front' | 'back';
  styleAttr?: React.CSSProperties;
}

export interface Category {
  id: number;
  nombre: string;
  slug: string;
  icono: string;
  tipo: string;
}

export interface Product {
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

export interface CartItem {
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
