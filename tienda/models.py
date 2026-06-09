"""
models.py — Arquitectura relacional profesional normalizada
============================================================
Jerarquía:
  Proveedor  ←  Producto  →  Categoria
                    ↓
              VarianteProducto
              ImagenProducto (galería)

  Pedido  ←  LineaPedido  →  Producto
"""

from django.db import models
from django.utils import timezone
from django.utils.text import slugify


# ═══════════════════════════════════════════════════════════════════════════════
#  PROVEEDOR
# ═══════════════════════════════════════════════════════════════════════════════
class Proveedor(models.Model):
    """Cada tienda de Yupoo es un proveedor independiente."""
    nombre = models.CharField(max_length=200, unique=True)
    url_base = models.URLField(
        max_length=500,
        help_text='URL base del proveedor en Yupoo (ej: https://194939.x.yupoo.com)',
    )
    activo = models.BooleanField(default=True)
    notas = models.TextField(blank=True, help_text='Notas internas sobre este proveedor')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nombre']
        verbose_name = 'Proveedor'
        verbose_name_plural = 'Proveedores'

    def __str__(self):
        estado = '✅' if self.activo else '❌'
        return f'{estado} {self.nombre}'


# ═══════════════════════════════════════════════════════════════════════════════
#  CATEGORÍA  (jerárquica con parent para Liga > Subcategoría)
# ═══════════════════════════════════════════════════════════════════════════════
class Categoria(models.Model):
    """
    Categoría jerárquica con soporte para árbol simple:
      - LaLiga (parent=None)
        └─ LaLiga 2024/25 (parent=LaLiga)
      - Retro (parent=None)
      - Selecciones (parent=None)
    """
    TIPO_CHOICES = [
        ('liga', '⚽ Liga de Club'),
        ('seleccion', '🏳️ Selección Nacional'),
        ('retro', '🕰️ Retro / Clásica'),
        ('version', '👕 Versión (Jugador/Fan)'),
        ('kids', '👶 Niños'),
        ('otro', '📦 Otro'),
    ]

    nombre = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='liga')
    parent = models.ForeignKey(
        'self', on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='subcategorias',
        help_text='Categoría padre (dejar vacío para categoría raíz)',
    )
    orden = models.IntegerField(default=0)
    icono = models.CharField(max_length=10, blank=True, default='⚽', help_text='Emoji decorativo')
    activa = models.BooleanField(default=True)

    class Meta:
        ordering = ['orden', 'nombre']
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'

    def __str__(self):
        if self.parent:
            return f'{self.parent.nombre} › {self.nombre}'
        return self.nombre

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nombre)
        super().save(*args, **kwargs)


# ═══════════════════════════════════════════════════════════════════════════════
#  PRODUCTO  (camiseta normalizada)
# ═══════════════════════════════════════════════════════════════════════════════
class Producto(models.Model):
    """
    Producto principal. Cada camiseta única tiene un registro aquí.
    Las variantes de talla van en VarianteProducto.
    """
    nombre = models.CharField(max_length=400, help_text='Nombre limpio y profesional')
    nombre_original = models.CharField(
        max_length=400, blank=True,
        help_text='Nombre original del scraping (para trazabilidad)',
    )
    slug = models.SlugField(max_length=450, unique=True)
    descripcion = models.TextField(blank=True, help_text='Descripción SEO-friendly')
    precio = models.DecimalField(
        max_digits=8, decimal_places=2,
        null=True, blank=True,
        help_text='Precio en EUR (opcional)',
    )

    # Relaciones
    categoria = models.ForeignKey(
        Categoria, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='productos',
    )
    proveedores = models.ManyToManyField(
        Proveedor,
        through='ProductoProveedor',
        related_name='productos',
        blank=True,
    )

    # Imagen principal (almacenada en S3 via DEFAULT_FILE_STORAGE)
    imagen = models.ImageField(
        upload_to='productos/',
        blank=True, null=True,
        help_text='Imagen principal (se sube a AWS S3)',
    )
    imagen_url_original = models.URLField(
        max_length=700, blank=True,
        help_text='URL original de la imagen en Yupoo (fallback)',
    )

    # Control
    activo = models.BooleanField(default=True, db_index=True)
    destacado = models.BooleanField(default=False, help_text='Mostrar en sección destacados')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['categoria', 'nombre']
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        indexes = [
            models.Index(fields=['activo', 'categoria']),
            models.Index(fields=['slug']),
        ]

    def __str__(self):
        return self.nombre

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.nombre)
            self.slug = base_slug[:450]
            # Asegurar unicidad
            counter = 1
            while Producto.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f'{base_slug[:440]}-{counter}'
                counter += 1
        super().save(*args, **kwargs)

    def get_tallas(self):
        """Retorna las tallas disponibles de todas las variantes activas.
        Usa datos prefetched si están disponibles para evitar N+1 queries."""
        # Si las variantes fueron prefetched, usar memoria en vez de query
        if 'variantes' in getattr(self, '_prefetched_objects_cache', {}):
            tallas = list(set(
                v.talla for v in self.variantes.all() if v.activa
            ))
        else:
            tallas = list(
                self.variantes
                .filter(activa=True)
                .values_list('talla', flat=True)
                .distinct()
            )
        return tallas if tallas else ['S', 'M', 'L', 'XL', 'XXL']

    def get_imagen_url(self):
        """Retorna la mejor URL de imagen disponible."""
        if self.imagen:
            try:
                return self.imagen.url
            except Exception:
                pass
        return self.imagen_url_original or ''

    @property
    def imagen_local(self):
        """Compatibilidad con plantillas antiguas."""
        if self.imagen:
            return self.imagen
        return None

    @property
    def imagen_url(self):
        """Compatibilidad con plantillas antiguas."""
        return self.imagen_url_original



# ═══════════════════════════════════════════════════════════════════════════════
#  PRODUCTO ↔ PROVEEDOR  (tabla intermedia anti-duplicados)
# ═══════════════════════════════════════════════════════════════════════════════
class ProductoProveedor(models.Model):
    """
    Relación M2M explícita entre Producto y Proveedor.
    Permite que dos proveedores vendan el mismo producto
    sin duplicar registros en la BD.
    """
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='enlaces_proveedor')
    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE, related_name='enlaces_producto')
    yupoo_album_id = models.CharField(
        max_length=100, db_index=True,
        help_text='ID del álbum en Yupoo para este proveedor',
    )
    url_album = models.URLField(max_length=700, blank=True, help_text='URL directa al álbum en Yupoo')
    precio_proveedor = models.DecimalField(
        max_digits=8, decimal_places=2,
        null=True, blank=True,
        help_text='Precio del proveedor (si difiere)',
    )
    fecha_scraping = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('proveedor', 'yupoo_album_id')
        verbose_name = 'Enlace Producto-Proveedor'
        verbose_name_plural = 'Enlaces Producto-Proveedor'

    def __str__(self):
        return f'{self.producto.nombre} @ {self.proveedor.nombre}'


# ═══════════════════════════════════════════════════════════════════════════════
#  IMAGEN DE PRODUCTO  (galería multi-imagen)
# ═══════════════════════════════════════════════════════════════════════════════
class ImagenProducto(models.Model):
    """Galería de imágenes adicionales de un producto."""
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='imagenes')
    imagen = models.ImageField(upload_to='productos/galeria/', blank=True, null=True)
    imagen_url = models.URLField(max_length=700, blank=True)
    orden = models.IntegerField(default=0)
    alt_text = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ['orden']
        verbose_name = 'Imagen de producto'
        verbose_name_plural = 'Imágenes de producto'

    def __str__(self):
        return f'Imagen {self.orden} de {self.producto.nombre}'


# ═══════════════════════════════════════════════════════════════════════════════
#  VARIANTE DE PRODUCTO  (tallas, personalización)
# ═══════════════════════════════════════════════════════════════════════════════
class VarianteProducto(models.Model):
    """
    Cada variante representa una talla específica de un producto.
    Permite gestionar stock y personalización por talla.
    """
    TALLA_CHOICES = [
        ('XS', 'XS'),
        ('S', 'S'),
        ('M', 'M'),
        ('L', 'L'),
        ('XL', 'XL'),
        ('XXL', 'XXL'),
        ('XXXL', 'XXXL'),
        # Kids
        ('S-M', 'S-M (Niños)'),
        ('M-L', 'M-L (Niños)'),
        ('L-XL', 'L-XL (Niños)'),
        # Numeric kids
        ('16', 'Talla 16'),
        ('18', 'Talla 18'),
        ('20', 'Talla 20'),
        ('22', 'Talla 22'),
        ('24', 'Talla 24'),
        ('26', 'Talla 26'),
        ('28', 'Talla 28'),
    ]

    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='variantes')
    talla = models.CharField(max_length=10, choices=TALLA_CHOICES)
    activa = models.BooleanField(default=True)

    # Personalización
    permite_dorsal = models.BooleanField(default=True, help_text='¿Se puede personalizar el dorsal?')
    permite_parche = models.BooleanField(default=True, help_text='¿Se puede añadir parche?')

    class Meta:
        unique_together = ('producto', 'talla')
        ordering = ['producto', 'talla']
        verbose_name = 'Variante de producto'
        verbose_name_plural = 'Variantes de producto'

    def __str__(self):
        return f'{self.producto.nombre} — Talla {self.talla}'


# ═══════════════════════════════════════════════════════════════════════════════
#  PEDIDO  (se mantiene la lógica de negocio existente, adaptada a Producto)
# ═══════════════════════════════════════════════════════════════════════════════
class Pedido(models.Model):
    ESTADOS = [
        ('pendiente', '⏳ Pendiente'),
        ('confirmado', '✅ Confirmado'),
        ('pagado', '💰 Pagado'),
        ('enviado', '📦 Enviado'),
        ('entregado', '🎉 Entregado'),
    ]

    nombre_cliente = models.CharField(max_length=200)
    telefono = models.CharField(max_length=20, blank=True)
    notas = models.TextField(blank=True, help_text='Notas adicionales del cliente')
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    fecha_pedido = models.DateTimeField(default=timezone.now)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    notas_admin = models.TextField(blank=True, help_text='Notas internas (solo visibles para el admin)')

    class Meta:
        ordering = ['-fecha_pedido']
        verbose_name = 'Pedido'
        verbose_name_plural = 'Pedidos'

    def __str__(self):
        return f"Pedido #{self.pk} - {self.nombre_cliente} ({self.get_estado_display()})"

    def total_articulos(self):
        return sum(item.cantidad for item in self.lineas.all())

    def resumen(self):
        lineas = self.lineas.all()
        return ', '.join([f"{l.producto.nombre} ({l.talla}) x{l.cantidad}" for l in lineas])


# ═══════════════════════════════════════════════════════════════════════════════
#  LÍNEA DE PEDIDO  (referencia a Producto en lugar de Camiseta)
# ═══════════════════════════════════════════════════════════════════════════════
class LineaPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='lineas')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    talla = models.CharField(max_length=10)
    cantidad = models.PositiveIntegerField(default=1)

    # Opciones de personalización
    parche = models.BooleanField(default=False)
    dorsal = models.BooleanField(default=False)
    texto_dorsal = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        verbose_name = 'Línea de pedido'
        verbose_name_plural = 'Líneas de pedido'

    def __str__(self):
        return f"{self.producto.nombre} - {self.talla} x{self.cantidad}"