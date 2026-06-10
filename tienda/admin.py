"""
admin.py — Panel de administración profesional (optimizado)
=============================================================
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.http import HttpResponse
from django.db.models import Count

from .models import (
    Proveedor, Categoria, Producto, ProductoProveedor,
    ImagenProducto, VarianteProducto, Pedido, LineaPedido,
)


# ══════════════════════════════════════════════════════════════════════════════
#  Helpers
# ══════════════════════════════════════════════════════════════════════════════
def _imagen_thumb(producto, height=60):
    url = producto.get_imagen_url()
    if url:
        return format_html(
            '<img src="{}" style="height:{}px; border-radius:6px; '
            'box-shadow:0 1px 4px rgba(0,0,0,.15);" '
            'referrerpolicy="no-referrer" loading="lazy" '
            'onerror="this.outerHTML=\'<span style=\\\'font-size:24px;\\\'>⚽</span>\'" />',
            url, height,
        )
    return format_html('<span style="font-size: 24px;">⚽</span>')


def _extras_badge(linea):
    badges = []
    if linea.parche:
        badges.append('<span style="background:#e8f5e9;color:#2e7d32;padding:2px 8px;border-radius:10px;'
                       'font-size:11px;font-weight:600;">✅ Parche</span>')
    if linea.dorsal:
        badges.append('<span style="background:#e3f2fd;color:#1565c0;padding:2px 8px;border-radius:10px;'
                       'font-size:11px;font-weight:600;">🔢 Dorsal</span>')
    if linea.texto_dorsal:
        badges.append(format_html(
            '<span style="background:#fff3e0;color:#e65100;padding:2px 8px;border-radius:10px;'
            'font-size:11px;font-weight:600;">✍️ {}</span>',
            linea.texto_dorsal,
        ))
    return format_html(' '.join(badges)) if badges else '—'


# ══════════════════════════════════════════════════════════════════════════════
#  PROVEEDOR
# ══════════════════════════════════════════════════════════════════════════════
@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'url_base', 'activo', 'num_productos', 'fecha_creacion']
    list_filter = ['activo']
    search_fields = ['nombre', 'url_base']
    list_editable = ['activo']

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _num_productos=Count('enlaces_producto')
        )

    def num_productos(self, obj):
        return obj._num_productos
    num_productos.short_description = 'Productos'
    num_productos.admin_order_field = '_num_productos'


# ══════════════════════════════════════════════════════════════════════════════
#  CATEGORÍA
# ══════════════════════════════════════════════════════════════════════════════
@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'tipo', 'parent', 'slug', 'orden', 'activa', 'num_productos']
    list_filter = ['tipo', 'activa', 'parent']
    search_fields = ['nombre', 'slug']
    prepopulated_fields = {'slug': ('nombre',)}
    list_editable = ['orden', 'activa']
    ordering = ['orden', 'nombre']

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _num_productos=Count('productos')
        )

    def num_productos(self, obj):
        return obj._num_productos
    num_productos.short_description = 'Productos'
    num_productos.admin_order_field = '_num_productos'


# ══════════════════════════════════════════════════════════════════════════════
#  INLINES PARA PRODUCTO
# ══════════════════════════════════════════════════════════════════════════════
class VarianteInline(admin.TabularInline):
    model = VarianteProducto
    extra = 0
    fields = ['talla', 'activa', 'permite_dorsal', 'permite_parche']


class ImagenInline(admin.TabularInline):
    model = ImagenProducto
    extra = 0
    fields = ['imagen', 'imagen_url', 'orden', 'alt_text']


class ProveedorEnlaceInline(admin.TabularInline):
    model = ProductoProveedor
    extra = 0
    fields = ['proveedor', 'yupoo_album_id', 'url_album', 'precio_proveedor', 'fecha_scraping']
    readonly_fields = ['fecha_scraping']


# ══════════════════════════════════════════════════════════════════════════════
#  PRODUCTO — Optimizado para 22k+ productos
# ══════════════════════════════════════════════════════════════════════════════
@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = [
        'preview_imagen', 'nombre', 'categoria',
        'activo', 'destacado', 'fecha_actualizacion',
    ]
    list_filter = [
        'activo', 'destacado', 'categoria__tipo', 'categoria',
    ]
    search_fields = ['nombre', 'nombre_original', 'slug']
    list_editable = ['activo', 'destacado']
    readonly_fields = ['slug', 'fecha_creacion', 'fecha_actualizacion']
    inlines = [VarianteInline, ProveedorEnlaceInline, ImagenInline]
    list_per_page = 30
    list_select_related = ['categoria']
    show_full_result_count = False  # Evita COUNT(*) sobre 22k filas

    fieldsets = (
        ('📋 Información principal', {
            'fields': ('nombre', 'nombre_original', 'slug', 'descripcion', 'precio'),
        }),
        ('🏷️ Clasificación', {
            'fields': ('categoria', 'activo', 'destacado'),
        }),
        ('🖼️ Imagen', {
            'fields': ('imagen', 'imagen_url_original'),
        }),
        ('ℹ️ Metadatos', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',),
        }),
    )

    def preview_imagen(self, obj):
        return _imagen_thumb(obj, height=50)
    preview_imagen.short_description = 'Img'


# ══════════════════════════════════════════════════════════════════════════════
#  PRODUCTO ↔ PROVEEDOR
# ══════════════════════════════════════════════════════════════════════════════
@admin.register(ProductoProveedor)
class ProductoProveedorAdmin(admin.ModelAdmin):
    list_display = ['producto', 'proveedor', 'yupoo_album_id', 'fecha_scraping']
    list_filter = ['proveedor']
    search_fields = ['producto__nombre', 'yupoo_album_id']
    list_select_related = ['producto', 'proveedor']
    list_per_page = 30
    show_full_result_count = False


# ══════════════════════════════════════════════════════════════════════════════
#  INLINE LÍNEAS DE PEDIDO
# ══════════════════════════════════════════════════════════════════════════════
class LineaPedidoInline(admin.TabularInline):
    model = LineaPedido
    extra = 0
    readonly_fields = [
        'preview_img', 'producto', 'talla', 'cantidad', 'extras_info',
    ]
    fields = [
        'preview_img', 'producto', 'talla', 'cantidad', 'extras_info',
    ]
    can_delete = False

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('producto')

    def preview_img(self, obj):
        return _imagen_thumb(obj.producto, height=55)
    preview_img.short_description = 'Imagen'

    def extras_info(self, obj):
        return _extras_badge(obj)
    extras_info.short_description = 'Parche / Dorsal / Nombre'


# ══════════════════════════════════════════════════════════════════════════════
#  PEDIDO — Optimizado
# ══════════════════════════════════════════════════════════════════════════════
@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'nombre_cliente', 'telefono', 'comentarios_cliente', 'estado',
        'num_articulos', 'fecha_pedido',
    ]
    list_filter = ['estado', 'fecha_pedido']
    search_fields = ['nombre_cliente', 'telefono', 'notas']
    list_editable = ['estado']
    readonly_fields = ['fecha_pedido', 'fecha_actualizacion']
    inlines = [LineaPedidoInline]
    actions = ['descargar_doc_proveedor']
    list_per_page = 30

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _num_articulos=Count('lineas')
        )

    def num_articulos(self, obj):
        return obj._num_articulos
    num_articulos.short_description = 'Artículos'
    num_articulos.admin_order_field = '_num_articulos'

    def comentarios_cliente(self, obj):
        if obj.notas:
            return format_html('<span style="color:#6b7280; font-style:italic; font-size:12px;">{}</span>', obj.notas)
        return format_html('<span style="color:#d1d5db;">—</span>')
    comentarios_cliente.short_description = 'Comentarios Cliente'

    fieldsets = (
        ('👤 Cliente', {
            'fields': ('nombre_cliente', 'telefono', 'notas')
        }),
        ('📦 Estado', {
            'fields': ('estado', 'notas_admin')
        }),
        ('ℹ️ Fechas', {
            'fields': ('fecha_pedido', 'fecha_actualizacion'),
            'classes': ('collapse',),
        }),
    )

    @admin.action(description='📄 Descargar txt para proveedor')
    def descargar_doc_proveedor(self, request, queryset):
        texto = "PEDIDOS PARA PROVEEDOR\n======================\n\n"
        # Prefetch todo de una vez
        pedidos = queryset.prefetch_related(
            'lineas__producto__enlaces_proveedor__proveedor'
        )
        for pedido in pedidos:
            texto += f"--- PEDIDO #{pedido.pk} ---\n"
            lineas = pedido.lineas.all()
            if not lineas:
                texto += "Sin artículos.\n\n"
                continue

            for l in lineas:
                yupoo = "(Sin URL Yupoo)"
                enlace = l.producto.enlaces_proveedor.all()[:1]
                if enlace:
                    enlace = enlace[0]
                    url_base = enlace.proveedor.url_base.rstrip('/')
                    yupoo = f"{url_base}/albums/{enlace.yupoo_album_id}?uid=1"

                extras = []
                if l.parche:
                    extras.append("Parche")
                if l.dorsal:
                    extras.append(f"Dorsal: {l.texto_dorsal}")
                extras_str = " | ".join(extras)
                if extras_str:
                    extras_str = f" [{extras_str}]"

                texto += f"Camiseta: {l.producto.nombre}\n"
                texto += f"Yupoo: {yupoo}\n"
                texto += f"Talla: {l.talla} | Cantidad: {l.cantidad}{extras_str}\n\n"
            texto += "\n"

        response = HttpResponse(texto, content_type='text/plain; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="pedidos_proveedor.txt"'
        return response


# ══════════════════════════════════════════════════════════════════════════════
#  LÍNEA DE PEDIDO (vista independiente)
# ══════════════════════════════════════════════════════════════════════════════
@admin.register(LineaPedido)
class LineaPedidoAdmin(admin.ModelAdmin):
    list_display = [
        'pedido', 'preview_img', 'producto', 'talla', 'cantidad',
        'tiene_parche', 'tiene_dorsal', 'nombre_dorsal',
    ]
    list_filter = ['talla', 'parche', 'dorsal']
    search_fields = ['producto__nombre', 'pedido__nombre_cliente', 'texto_dorsal']
    list_select_related = ['producto', 'pedido']
    list_per_page = 30

    def preview_img(self, obj):
        return _imagen_thumb(obj.producto, height=45)
    preview_img.short_description = 'Imagen'

    def tiene_parche(self, obj):
        return '✅' if obj.parche else '—'
    tiene_parche.short_description = 'Parche'

    def tiene_dorsal(self, obj):
        return '✅' if obj.dorsal else '—'
    tiene_dorsal.short_description = 'Dorsal'

    def nombre_dorsal(self, obj):
        return obj.texto_dorsal or '—'
    nombre_dorsal.short_description = 'Texto dorsal'
