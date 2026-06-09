"""
admin.py — Panel de administración profesional
================================================
Configuración avanzada con list_display, list_filter, search_fields,
inlines y acciones personalizadas para gestión masiva del catálogo.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.http import HttpResponse
import re
import urllib.parse

from .models import (
    Proveedor, Categoria, Producto, ProductoProveedor,
    ImagenProducto, VarianteProducto, Pedido, LineaPedido,
)


# ══════════════════════════════════════════════════════════════════════════════
#  Helpers para miniaturas y enlaces
# ══════════════════════════════════════════════════════════════════════════════
def _imagen_thumb(producto, height=60):
    """Devuelve HTML con la miniatura del producto."""
    url = producto.get_imagen_url()
    if url:
        return format_html(
            '<img src="{}" style="height:{}px; border-radius:6px; '
            'box-shadow:0 1px 4px rgba(0,0,0,.15);" '
            'referrerpolicy="no-referrer" '
            'onerror="this.outerHTML=\'<span style=\\\'font-size:24px;\\\'>⚽</span>\'" />',
            url, height,
        )
    return format_html('<span style="font-size: 24px;">⚽</span>')


def _url_producto(producto):
    """Enlace a la página pública del producto."""
    try:
        url_publica = reverse('detalle_camiseta', args=[producto.pk])
        return format_html(
            '<a href="{}" target="_blank" style="color:#417690; text-decoration:underline;">🔗 Ver</a>',
            url_publica,
        )
    except Exception:
        return '—'


def _url_yupoo(producto):
    """Enlace al primer proveedor de Yupoo del producto."""
    enlace = producto.enlaces_proveedor.select_related('proveedor').first()
    if enlace and enlace.yupoo_album_id:
        url_base = enlace.proveedor.url_base.rstrip('/')
        url = f"{url_base}/albums/{enlace.yupoo_album_id}?uid=1"
        return format_html(
            '<a href="{}" target="_blank" style="color:#e91e63; font-weight:bold; '
            'text-decoration:none;">🐼 Yupoo</a>'
            '<br><span style="font-size:10px;color:#888;">{}</span>',
            url, enlace.proveedor.nombre,
        )
    return '—'


def _extras_badge(linea):
    """Devuelve badges HTML con parche / dorsal / texto."""
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

    def num_productos(self, obj):
        return obj.enlaces_producto.count()
    num_productos.short_description = 'Productos'


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

    def num_productos(self, obj):
        return obj.productos.count()
    num_productos.short_description = 'Productos'


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
#  PRODUCTO
# ══════════════════════════════════════════════════════════════════════════════
@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = [
        'preview_imagen', 'nombre', 'categoria', 'num_proveedores',
        'tallas_resumen', 'activo', 'destacado', 'fecha_actualizacion',
    ]
    list_filter = [
        'activo', 'destacado', 'categoria__tipo', 'categoria',
        'proveedores', 'fecha_creacion',
    ]
    search_fields = ['nombre', 'nombre_original', 'descripcion', 'slug']
    list_editable = ['activo', 'destacado']
    readonly_fields = ['slug', 'fecha_creacion', 'fecha_actualizacion']
    inlines = [VarianteInline, ProveedorEnlaceInline, ImagenInline]
    list_per_page = 50

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

    def num_proveedores(self, obj):
        count = obj.enlaces_proveedor.count()
        if count > 1:
            return format_html('<span style="color:#e91e63;font-weight:bold;">{} proveedores</span>', count)
        return count
    num_proveedores.short_description = 'Proveedores'

    def tallas_resumen(self, obj):
        tallas = obj.get_tallas()
        return ', '.join(tallas[:5]) + ('...' if len(tallas) > 5 else '')
    tallas_resumen.short_description = 'Tallas'


# ══════════════════════════════════════════════════════════════════════════════
#  PRODUCTO ↔ PROVEEDOR
# ══════════════════════════════════════════════════════════════════════════════
@admin.register(ProductoProveedor)
class ProductoProveedorAdmin(admin.ModelAdmin):
    list_display = ['producto', 'proveedor', 'yupoo_album_id', 'fecha_scraping']
    list_filter = ['proveedor']
    search_fields = ['producto__nombre', 'yupoo_album_id']
    list_select_related = ['producto', 'proveedor']


# ══════════════════════════════════════════════════════════════════════════════
#  INLINE LÍNEAS DE PEDIDO
# ══════════════════════════════════════════════════════════════════════════════
class LineaPedidoInline(admin.TabularInline):
    model = LineaPedido
    extra = 0
    readonly_fields = [
        'preview_img', 'producto', 'talla', 'cantidad',
        'extras_info', 'link_producto', 'link_yupoo',
    ]
    fields = [
        'preview_img', 'producto', 'talla', 'cantidad',
        'extras_info', 'link_producto', 'link_yupoo',
    ]
    can_delete = False

    def preview_img(self, obj):
        return _imagen_thumb(obj.producto, height=55)
    preview_img.short_description = 'Imagen'

    def extras_info(self, obj):
        return _extras_badge(obj)
    extras_info.short_description = 'Parche / Dorsal / Nombre'

    def link_producto(self, obj):
        return _url_producto(obj.producto)
    link_producto.short_description = 'URL'

    def link_yupoo(self, obj):
        return _url_yupoo(obj.producto)
    link_yupoo.short_description = 'Yupoo'


# ══════════════════════════════════════════════════════════════════════════════
#  PEDIDO
# ══════════════════════════════════════════════════════════════════════════════
@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'nombre_cliente', 'telefono', 'estado',
        'total_articulos', 'fecha_pedido', 'resumen_corto',
    ]
    list_filter = ['estado', 'fecha_pedido']
    search_fields = ['nombre_cliente', 'telefono', 'lineas__producto__nombre']
    list_editable = ['estado']
    readonly_fields = ['fecha_pedido', 'fecha_actualizacion', 'resumen_visual']
    inlines = [LineaPedidoInline]
    actions = ['descargar_doc_proveedor']

    fieldsets = (
        ('👤 Cliente', {
            'fields': ('nombre_cliente', 'telefono', 'notas')
        }),
        ('📦 Estado', {
            'fields': ('estado', 'notas_admin')
        }),
        ('📋 Resumen visual del pedido', {
            'fields': ('resumen_visual',),
            'description': 'Aquí puedes ver de un vistazo todos los productos del pedido con imagen, '
                           'talla, extras y enlace directo.',
        }),
        ('ℹ️ Fechas', {
            'fields': ('fecha_pedido', 'fecha_actualizacion'),
            'classes': ('collapse',),
        }),
    )

    @admin.action(description='📄 Descargar txt para proveedor (Pedidos seleccionados)')
    def descargar_doc_proveedor(self, request, queryset):
        texto = "PEDIDOS PARA PROVEEDOR\n======================\n\n"
        for pedido in queryset:
            texto += f"--- PEDIDO #{pedido.pk} ---\n"
            lineas = pedido.lineas.all().select_related('producto')
            if not lineas:
                texto += "Sin artículos.\n\n"
                continue

            for l in lineas:
                yupoo = "(Sin URL Yupoo)"
                enlace = l.producto.enlaces_proveedor.select_related('proveedor').first()
                if enlace and enlace.yupoo_album_id:
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

    # ── columna resumen en el listado ──
    def resumen_corto(self, obj):
        lineas = obj.lineas.all().select_related('producto')
        partes = []
        for l in lineas:
            extras = []
            if l.parche:
                extras.append('parche')
            if l.dorsal:
                extras.append('dorsal')
            if l.texto_dorsal:
                extras.append(f'"{l.texto_dorsal}"')
            extra_str = f' [{", ".join(extras)}]' if extras else ''
            partes.append(f'{l.producto.nombre} ({l.talla}) x{l.cantidad}{extra_str}')
        texto = ' | '.join(partes)
        return texto[:120] + '…' if len(texto) > 120 else texto
    resumen_corto.short_description = 'Artículos'

    # ── tabla visual completa en la ficha del pedido ──
    def resumen_visual(self, obj):
        lineas = obj.lineas.all().select_related('producto')
        if not lineas:
            return format_html('<em>Sin artículos</em>')

        filas = ''
        for l in lineas:
            img = _imagen_thumb(l.producto, height=70)
            link = _url_producto(l.producto)
            link_yupoo = _url_yupoo(l.producto)
            extras = _extras_badge(l)
            img_url_raw = l.producto.get_imagen_url() or '—'

            filas += format_html(
                '<tr style="border-bottom:1px solid #eee;">'
                '<td style="padding:10px;text-align:center;">{}</td>'
                '<td style="padding:10px;"><strong>{}</strong><br/>'
                '<span style="color:#888;font-size:11px;">ID: {}</span></td>'
                '<td style="padding:10px;text-align:center;font-size:15px;font-weight:600;">{}</td>'
                '<td style="padding:10px;text-align:center;">{}</td>'
                '<td style="padding:10px;">{}</td>'
                '<td style="padding:10px;">{}<br><br>{}</td>'
                '<td style="padding:10px;font-size:11px;word-break:break-all;max-width:220px;">{}</td>'
                '</tr>',
                img,
                l.producto.nombre,
                l.producto.pk,
                l.talla,
                l.cantidad,
                extras,
                link, link_yupoo,
                img_url_raw,
            )

        html = format_html(
            '<table style="width:100%;border-collapse:collapse;font-family:sans-serif;">'
            '<thead><tr style="background:#f5f5f5;border-bottom:2px solid #ddd;">'
            '<th style="padding:8px;">Imagen</th>'
            '<th style="padding:8px;">Producto</th>'
            '<th style="padding:8px;">Talla</th>'
            '<th style="padding:8px;">Qty</th>'
            '<th style="padding:8px;">Extras</th>'
            '<th style="padding:8px;">Enlace</th>'
            '<th style="padding:8px;">URL imagen</th>'
            '</tr></thead>'
            '<tbody>{}</tbody>'
            '</table>',
            format_html(filas),
        )
        return html
    resumen_visual.short_description = 'Detalle visual del pedido'


# ══════════════════════════════════════════════════════════════════════════════
#  LÍNEA DE PEDIDO (vista independiente)
# ══════════════════════════════════════════════════════════════════════════════
@admin.register(LineaPedido)
class LineaPedidoAdmin(admin.ModelAdmin):
    list_display = [
        'pedido', 'preview_img', 'producto', 'talla', 'cantidad',
        'tiene_parche', 'tiene_dorsal', 'nombre_dorsal', 'link_producto', 'link_yupoo',
    ]
    list_filter = ['talla', 'parche', 'dorsal']
    search_fields = ['producto__nombre', 'pedido__nombre_cliente', 'texto_dorsal']
    list_select_related = ['producto', 'pedido']

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

    def link_producto(self, obj):
        return _url_producto(obj.producto)
    link_producto.short_description = 'URL'

    def link_yupoo(self, obj):
        return _url_yupoo(obj.producto)
    link_yupoo.short_description = 'Yupoo'
