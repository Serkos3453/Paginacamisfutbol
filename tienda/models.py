from django.db import models
from django.utils import timezone


class Categoria(models.Model):
    nombre = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    orden = models.IntegerField(default=0)

    class Meta:
        ordering = ['orden', 'nombre']
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'

    def __str__(self):
        return self.nombre


class Camiseta(models.Model):
    TALLAS = [
        ('XS', 'XS'),
        ('S', 'S'),
        ('M', 'M'),
        ('L', 'L'),
        ('XL', 'XL'),
        ('XXL', 'XXL'),
        ('XXXL', 'XXXL'),
        ('S-M', 'S-M (Kids)'),
        ('M-L', 'M-L (Kids)'),
        ('L-XL', 'L-XL (Kids)'),
    ]

    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True, related_name='camisetas')
    nombre = models.CharField(max_length=300)
    descripcion = models.TextField(blank=True)
    imagen_url = models.URLField(max_length=500, blank=True)
    imagen_local = models.ImageField(upload_to='camisetas/', blank=True, null=True)
    tallas_disponibles = models.JSONField(default=list)
    activa = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    yupoo_album_id = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ['categoria', 'nombre']
        verbose_name = 'Camiseta'
        verbose_name_plural = 'Camisetas'

    def __str__(self):
        return self.nombre

    def get_tallas(self):
        if self.tallas_disponibles:
            return self.tallas_disponibles
        return ['S', 'M', 'L', 'XL', 'XXL']


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
        return ', '.join([f"{l.camiseta.nombre} ({l.talla}) x{l.cantidad}" for l in lineas])


class LineaPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='lineas')
    camiseta = models.ForeignKey(Camiseta, on_delete=models.PROTECT)
    talla = models.CharField(max_length=10)
    cantidad = models.PositiveIntegerField(default=1)

    # Mantenemos las opciones extra, pero sin precios
    parche = models.BooleanField(default=False)
    dorsal = models.BooleanField(default=False)
    texto_dorsal = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        verbose_name = 'Línea de pedido'
        verbose_name_plural = 'Líneas de pedido'

    def __str__(self):
        return f"{self.camiseta.nombre} - {self.talla} x{self.cantidad}"