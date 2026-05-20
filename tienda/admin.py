from django.contrib import admin
from django.utils.html import format_html, escape
from django.urls import reverse
from django.http import HttpResponse
import re
import urllib.parse
from .models import Categoria, Camiseta, Pedido, LineaPedido


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'slug', 'orden']
    prepopulated_fields = {'slug': ('nombre',)}
    ordering = ['orden', 'nombre']


# ──────────────────────────────────────────────────
#  Helper: genera la miniatura de una camiseta
# ──────────────────────────────────────────────────
def _imagen_thumb(camiseta, height=60):
    """Devuelve HTML con la miniatura de la camiseta o un dash."""
    url = camiseta.imagen_url or (camiseta.imagen_local.url if camiseta.imagen_local else '')
    if url:
        return format_html(
            '<img src="{}" style="height:{}px; border-radius:6px; box-shadow:0 1px 4px rgba(0,0,0,.15);" />',
            url, height,
        )
    return '—'


def _url_camiseta(camiseta):
    """Devuelve un enlace HTML a la página pública de la camiseta."""
    try:
        url_publica = reverse('detalle_camiseta', args=[camiseta.pk])
        return format_html(
            '<a href="{}" target="_blank" style="color:#417690; text-decoration:underline;">🔗 Ver camiseta</a>',
            url_publica,
        )
    except Exception:
        return '—'


def _url_yupoo(camiseta):
    """Devuelve un enlace HTML a Yupoo."""
    if camiseta.yupoo_album_id:
        tienda = "194939" # Proveedor por defecto
        if camiseta.imagen_url:
            match = re.search(r'photo\.yupoo\.com/([^/]+)/', camiseta.imagen_url)
            if match:
                tienda = match.group(1)
                
        url = f"https://{tienda}.x.yupoo.com/albums/{camiseta.yupoo_album_id}?uid=1"
        search_query = urllib.parse.quote_plus(camiseta.nombre)
        search_url = f"https://{tienda}.x.yupoo.com/search/album?uid=1&q={search_query}"
        
        return format_html(
            '<a href="{}" target="_blank" style="color:#e91e63; font-weight:bold; text-decoration:none;">🐼 Yupoo</a> '
            '<br><a href="{}" target="_blank" style="font-size:10px; color:#888; text-decoration:underline;">🔍 Buscar si falla</a>',
            url, search_url
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


# ──────────────────────────────────────────────────
#  Inline de líneas de pedido  (dentro de Pedido)
# ──────────────────────────────────────────────────
class LineaPedidoInline(admin.TabularInline):
    model = LineaPedido
    extra = 0
    readonly_fields = [
        'preview_img', 'camiseta', 'talla', 'cantidad',
        'extras_info', 'link_camiseta', 'link_yupoo',
    ]
    fields = [
        'preview_img', 'camiseta', 'talla', 'cantidad',
        'extras_info', 'link_camiseta', 'link_yupoo',
    ]
    can_delete = False

    def preview_img(self, obj):
        return _imagen_thumb(obj.camiseta, height=55)
    preview_img.short_description = 'Imagen'

    def extras_info(self, obj):
        return _extras_badge(obj)
    extras_info.short_description = 'Parche / Dorsal / Nombre'

    def link_camiseta(self, obj):
        return _url_camiseta(obj.camiseta)
    link_camiseta.short_description = 'URL camiseta'

    def link_yupoo(self, obj):
        return _url_yupoo(obj.camiseta)
    link_yupoo.short_description = 'Yupoo'


# ──────────────────────────────────────────────────
#  Admin de Camiseta
# ──────────────────────────────────────────────────
@admin.register(Camiseta)
class CamisetaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'categoria', 'tallas_disponibles', 'activa', 'preview_imagen']
    list_filter = ['activa', 'categoria']
    search_fields = ['nombre', 'descripcion']
    list_editable = ['activa']
    prepopulated_fields = {}

    def preview_imagen(self, obj):
        return _imagen_thumb(obj, height=50)
    preview_imagen.short_description = 'Imagen'


# ──────────────────────────────────────────────────
#  Admin de Pedido  — MEJORADO
# ──────────────────────────────────────────────────
@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'nombre_cliente', 'telefono', 'estado',
        'total_articulos', 'fecha_pedido', 'resumen_corto',
    ]
    list_filter = ['estado', 'fecha_pedido']
    search_fields = ['nombre_cliente', 'telefono', 'lineas__camiseta__nombre']
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
            'description': 'Aquí puedes ver de un vistazo todas las camisetas del pedido con imagen, '
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
            lineas = pedido.lineas.all().select_related('camiseta')
            if not lineas:
                texto += "Sin artículos.\n\n"
                continue
            
            for l in lineas:
                yupoo = "(Sin URL Yupoo)"
                if l.camiseta.yupoo_album_id:
                    tienda = "194939"
                    if l.camiseta.imagen_url:
                        match = re.search(r'photo\.yupoo\.com/([^/]+)/', l.camiseta.imagen_url)
                        if match:
                            tienda = match.group(1)
                    yupoo = f"https://{tienda}.x.yupoo.com/albums/{l.camiseta.yupoo_album_id}?uid=1"
                    
                extras = []
                if l.parche: extras.append("Parche")
                if l.dorsal: extras.append(f"Dorsal: {l.texto_dorsal}")
                extras_str = " | ".join(extras)
                if extras_str: extras_str = f" [{extras_str}]"
                
                texto += f"Camiseta: {l.camiseta.nombre}\n"
                texto += f"Yupoo: {yupoo}\n"
                texto += f"Talla: {l.talla} | Cantidad: {l.cantidad}{extras_str}\n\n"
            texto += "\n"
                
        response = HttpResponse(texto, content_type='text/plain; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="pedidos_proveedor.txt"'
        return response

    # ── columna resumen en el listado ──
    def resumen_corto(self, obj):
        lineas = obj.lineas.all().select_related('camiseta')
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
            partes.append(f'{l.camiseta.nombre} ({l.talla}) x{l.cantidad}{extra_str}')
        texto = ' | '.join(partes)
        return texto[:120] + '…' if len(texto) > 120 else texto
    resumen_corto.short_description = 'Artículos'

    # ── tabla visual completa en la ficha del pedido ──
    def resumen_visual(self, obj):
        lineas = obj.lineas.all().select_related('camiseta')
        if not lineas:
            return format_html('<em>Sin artículos</em>')

        filas = ''
        for l in lineas:
            img = _imagen_thumb(l.camiseta, height=70)
            link = _url_camiseta(l.camiseta)
            link_yupoo = _url_yupoo(l.camiseta)
            extras = _extras_badge(l)
            img_url_raw = l.camiseta.imagen_url or (l.camiseta.imagen_local.url if l.camiseta.imagen_local else '—')

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
                l.camiseta.nombre,
                l.camiseta.pk,
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
            '<th style="padding:8px;">Camiseta</th>'
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


# ──────────────────────────────────────────────────
#  Admin de LineaPedido  — MEJORADO
# ──────────────────────────────────────────────────
@admin.register(LineaPedido)
class LineaPedidoAdmin(admin.ModelAdmin):
    list_display = [
        'pedido', 'preview_img', 'camiseta', 'talla', 'cantidad',
        'tiene_parche', 'tiene_dorsal', 'nombre_dorsal', 'link_camiseta', 'link_yupoo',
    ]
    list_filter = ['talla', 'parche', 'dorsal']
    search_fields = ['camiseta__nombre', 'pedido__nombre_cliente', 'texto_dorsal']
    list_select_related = ['camiseta', 'pedido']

    def preview_img(self, obj):
        return _imagen_thumb(obj.camiseta, height=45)
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

    def link_camiseta(self, obj):
        return _url_camiseta(obj.camiseta)
    link_camiseta.short_description = 'URL'

    def link_yupoo(self, obj):
        return _url_yupoo(obj.camiseta)
    link_yupoo.short_description = 'Yupoo'

