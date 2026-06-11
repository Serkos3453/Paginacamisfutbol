import re
from django.shortcuts import render, get_object_or_404, redirect
from django.views.decorators.http import require_POST
from django.contrib import messages
from django.db import transaction
from django.http import JsonResponse
from .models import Producto, Categoria, Pedido, LineaPedido
from django.core.paginator import Paginator


def get_cesta(request):
    return request.session.get('cesta', [])

def save_cesta(request, cesta):
    request.session['cesta'] = cesta
    request.session.modified = True

def cesta_count(request):
    return sum(item['cantidad'] for item in get_cesta(request))


# ═══════════════════════════════════════════════════════════════════════════════
#  CATÁLOGO — Optimizado para 22k+ productos
# ═══════════════════════════════════════════════════════════════════════════════
def catalogo(request):
    categorias = Categoria.objects.filter(activa=True).exclude(slug='retro')

    categoria_slug = request.GET.get('categoria')
    busqueda = request.GET.get('q', '').strip()

    # Query base: solo campos necesarios, con relaciones precargadas
    productos = (
        Producto.objects
        .filter(activo=True)
        .select_related('categoria')
        .prefetch_related('variantes')
        .only(
            'id', 'nombre', 'slug', 'imagen', 'imagen_url_original',
            'categoria__id', 'categoria__nombre', 'categoria__slug',
        )
    )

    if categoria_slug:
        productos = productos.filter(categoria__slug=categoria_slug)

    if busqueda:
        for palabra in busqueda.split():
            if palabra:
                productos = productos.filter(nombre__icontains=palabra)

    categoria_actual = None
    if categoria_slug:
        categoria_actual = Categoria.objects.filter(slug=categoria_slug).first()

    # 36 productos por página — carga rápida con imágenes
    paginator = Paginator(productos, 36)
    page_obj = paginator.get_page(request.GET.get('page'))

    return render(request, 'tienda/catalogo.html', {
        'camisetas': page_obj, 'page_obj': page_obj,
        'categorias': categorias, 'categoria_actual': categoria_actual,
        'busqueda': busqueda, 'cesta_count': cesta_count(request),
    })


# ═══════════════════════════════════════════════════════════════════════════════
#  DETALLE
# ═══════════════════════════════════════════════════════════════════════════════
def detalle_camiseta(request, pk):
    producto = get_object_or_404(
        Producto.objects.prefetch_related('variantes'),
        pk=pk, activo=True,
    )
    return render(request, 'tienda/detalle.html', {
        'camiseta': producto, 'tallas': producto.get_tallas(),
        'cesta_count': cesta_count(request),
    })


# ═══════════════════════════════════════════════════════════════════════════════
#  CESTA
# ═══════════════════════════════════════════════════════════════════════════════
@require_POST
def agregar_cesta(request):
    camiseta_id = request.POST.get('camiseta_id')
    talla = request.POST.get('talla')
    cantidad = int(request.POST.get('cantidad', 1))
    parche = request.POST.get('parche') == 'on' or request.POST.get('parche') == 'true' or request.POST.get('parche') is True
    dorsal = request.POST.get('dorsal') == 'on' or request.POST.get('dorsal') == 'true' or request.POST.get('dorsal') is True
    texto_dorsal = request.POST.get('texto_dorsal', '').strip() if dorsal else ''
    producto = get_object_or_404(Producto, pk=camiseta_id, activo=True)
    cesta = get_cesta(request)
    
    precio_base = float(producto.precio) if producto.precio else (
        39.00 if (producto.categoria and (producto.categoria.slug == 'retro' or producto.categoria.tipo == 'retro'))
        else (22.00 if (producto.categoria and (producto.categoria.slug == 'kids' or producto.categoria.tipo == 'kids'))
        else 29.00)
    )
    precio_total = precio_base + (1.00 if parche else 0.0) + (3.00 if dorsal else 0.0)
    
    encontrado = False
    for item in cesta:
        if (item['camiseta_id'] == int(camiseta_id) and
                item['talla'] == talla and
                item.get('parche') == parche and
                item.get('texto_dorsal') == texto_dorsal):
            item['cantidad'] += cantidad
            encontrado = True
            break
            
    if not encontrado:
        cesta.append({
            'camiseta_id': int(camiseta_id),
            'nombre': producto.nombre,
            'talla': talla, 'cantidad': cantidad,
            'parche': parche, 'dorsal': dorsal,
            'texto_dorsal': texto_dorsal,
            'imagen_url': producto.get_imagen_url(),
            'precio_base': precio_base,
            'precio_total': precio_total,
        })
        
    save_cesta(request, cesta)
    
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        total_precio = sum(item.get('precio_total', 29.0) * item['cantidad'] for item in cesta)
        return JsonResponse({
            'success': True,
            'message': f'Añadido: {producto.nombre} ({talla})',
            'cesta': cesta,
            'cesta_count': cesta_count(request),
            'total_precio': total_precio,
        })
        
    messages.success(request, f'Añadido: {producto.nombre} ({talla})')
    return redirect('cesta')


def ver_cesta(request):
    cesta = get_cesta(request)
    updated = False
    for item in cesta:
        if 'precio_base' not in item or 'precio_total' not in item:
            try:
                prod = Producto.objects.get(pk=item['camiseta_id'])
                p_base = float(prod.precio) if prod.precio else (
                    39.00 if (prod.categoria and (prod.categoria.slug == 'retro' or prod.categoria.tipo == 'retro'))
                    else (22.00 if (prod.categoria and (prod.categoria.slug == 'kids' or prod.categoria.tipo == 'kids'))
                    else 29.00)
                )
            except Producto.DoesNotExist:
                p_base = 29.00
            item['precio_base'] = p_base
            item['precio_total'] = p_base + (1.00 if item.get('parche') else 0.0) + (3.00 if item.get('dorsal') else 0.0)
            updated = True
    if updated:
        save_cesta(request, cesta)

    total_precio = sum(item['precio_total'] * item['cantidad'] for item in cesta)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({
            'cesta': cesta,
            'cesta_count': cesta_count(request),
            'total_precio': total_precio,
            'total_articulos': sum(i['cantidad'] for i in cesta),
        })

    return render(request, 'tienda/cesta.html', {
        'cesta': cesta, 'cesta_count': cesta_count(request),
        'total_articulos': sum(i['cantidad'] for i in cesta),
        'total_precio': total_precio,
    })

@require_POST
def eliminar_de_cesta(request):
    idx = int(request.POST.get('idx', -1))
    cesta = get_cesta(request)
    if 0 <= idx < len(cesta):
        eliminado = cesta.pop(idx)
        save_cesta(request, cesta)
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            total_precio = sum(item.get('precio_total', 29.0) * item['cantidad'] for item in cesta)
            return JsonResponse({
                'success': True,
                'message': f'Eliminado: {eliminado["nombre"]} ({eliminado["talla"]})',
                'cesta': cesta,
                'cesta_count': cesta_count(request),
                'total_precio': total_precio,
            })
        messages.info(request, f'Eliminado: {eliminado["nombre"]} ({eliminado["talla"]})')
    return redirect('cesta')

@require_POST
def actualizar_cesta(request):
    idx = int(request.POST.get('idx', -1))
    nueva_cantidad = int(request.POST.get('cantidad', 1))
    cesta = get_cesta(request)
    if 0 <= idx < len(cesta):
        if nueva_cantidad <= 0:
            eliminado = cesta.pop(idx)
            msg = f'Eliminado: {eliminado["nombre"]}'
        else:
            cesta[idx]['cantidad'] = nueva_cantidad
            msg = f'Cantidad actualizada'
        save_cesta(request, cesta)
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            total_precio = sum(item.get('precio_total', 29.0) * item['cantidad'] for item in cesta)
            return JsonResponse({
                'success': True,
                'message': msg,
                'cesta': cesta,
                'cesta_count': cesta_count(request),
                'total_precio': total_precio,
            })
    return redirect('cesta')


# ═══════════════════════════════════════════════════════════════════════════════
#  CHECKOUT Y CONFIRMACIÓN
# ═══════════════════════════════════════════════════════════════════════════════
def checkout(request):
    cesta = get_cesta(request)
    if not cesta:
        messages.warning(request, 'Tu cesta esta vacia.')
        return redirect('catalogo')
    if request.method == 'POST':
        nombre = request.POST.get('nombre', '').strip()
        telefono = request.POST.get('telefono', '').strip()
        notas = request.POST.get('notas', '').strip()
        if not nombre:
            messages.error(request, 'Por favor introduce tu nombre.')
            return render(request, 'tienda/checkout.html', {
                'cesta': cesta, 'cesta_count': cesta_count(request),
            })
        with transaction.atomic():
            pedido = Pedido.objects.create(
                nombre_cliente=nombre, telefono=telefono, notas=notas,
            )
            for item in cesta:
                producto = Producto.objects.get(pk=item['camiseta_id'])
                LineaPedido.objects.create(
                    pedido=pedido, producto=producto,
                    talla=item['talla'], cantidad=item['cantidad'],
                    parche=item.get('parche', False),
                    dorsal=item.get('dorsal', False),
                    texto_dorsal=item.get('texto_dorsal', '')
                )
        save_cesta(request, [])
        messages.success(request, f'Pedido #{pedido.pk} enviado. Gracias, {nombre}!')
        return redirect('confirmacion', pk=pedido.pk)
    return render(request, 'tienda/checkout.html', {
        'cesta': cesta, 'cesta_count': cesta_count(request),
        'total_articulos': sum(i['cantidad'] for i in cesta),
    })

def confirmacion(request, pk):
    pedido = get_object_or_404(Pedido, pk=pk)
    return render(request, 'tienda/confirmacion.html', {
        'pedido': pedido,
        'lineas': pedido.lineas.all().select_related('producto'),
        'cesta_count': 0,
    })


# ═══════════════════════════════════════════════════════════════════════════════
#  RETRO — Optimizado
# ═══════════════════════════════════════════════════════════════════════════════
def catalogo_retro(request):
    busqueda = request.GET.get('q', '').strip()
    productos = (
        Producto.objects
        .filter(activo=True, categoria__tipo='retro')
        .select_related('categoria')
        .prefetch_related('variantes')
        .only(
            'id', 'nombre', 'slug', 'imagen', 'imagen_url_original',
            'categoria__id', 'categoria__nombre', 'categoria__slug',
            'categoria__tipo',
        )
    )
    if busqueda:
        for palabra in busqueda.split():
            if palabra:
                productos = productos.filter(nombre__icontains=palabra)
    paginator = Paginator(productos, 36)
    page_obj = paginator.get_page(request.GET.get('page'))
    return render(request, 'tienda/retro.html', {
        'camisetas': page_obj, 'page_obj': page_obj,
        'busqueda': busqueda, 'cesta_count': cesta_count(request),
    })


# ═══════════════════════════════════════════════════════════════════════════════
#  JSON API ENDPOINTS FOR REACT TSX FRONTEND
# ═══════════════════════════════════════════════════════════════════════════════
import json
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'success': True})

def api_categorias(request):
    categorias = Categoria.objects.filter(activa=True).only('id', 'nombre', 'slug', 'icono', 'tipo')
    data = []
    for cat in categorias:
        if 'Todas' not in cat.nombre and 'todas' not in cat.nombre:
            data.append({
                'id': cat.id,
                'nombre': cat.nombre,
                'slug': cat.slug,
                'icono': cat.icono or '⚽',
                'tipo': cat.tipo,
            })
    return JsonResponse({'categorias': data})

def api_catalogo(request):
    categoria_slug = request.GET.get('categoria')
    busqueda = request.GET.get('q', '').strip()
    is_retro = request.GET.get('retro') == 'true'
    page = request.GET.get('page', 1)

    productos = (
        Producto.objects
        .filter(activo=True)
        .select_related('categoria')
        .prefetch_related('variantes')
        .only(
            'id', 'nombre', 'slug', 'precio', 'imagen', 'imagen_url_original',
            'categoria__id', 'categoria__nombre', 'categoria__slug', 'categoria__tipo',
        )
    )

    if is_retro:
        productos = productos.filter(categoria__tipo='retro')

    if categoria_slug:
        productos = productos.filter(categoria__slug=categoria_slug)

    if busqueda:
        for palabra in busqueda.split():
            if palabra:
                productos = productos.filter(nombre__icontains=palabra)

    paginator = Paginator(productos, 36)
    try:
        page_obj = paginator.get_page(page)
    except Exception:
        page_obj = paginator.get_page(1)

    camisetas_list = []
    for c in page_obj:
        nombre_limpio = re.sub(r'^(?:Camiseta\s+de\s+fútbol\s+de\s+|Camiseta\s+de\s+fútbol\s+|Camiseta\s+de\s+|Camiseta\s+)(.*)$', r'\1', c.nombre, flags=re.IGNORECASE).strip().capitalize()
        precio = float(c.precio) if c.precio else (
            39.00 if (c.categoria and (c.categoria.slug == 'retro' or c.categoria.tipo == 'retro'))
            else (22.00 if (c.categoria and (c.categoria.slug == 'kids' or c.categoria.tipo == 'kids'))
            else 29.00)
        )
        camisetas_list.append({
            'id': c.id,
            'nombre': nombre_limpio,
            'nombre_original': c.nombre,
            'slug': c.slug,
            'precio': precio,
            'imagen_url': c.get_imagen_url(),
            'tallas': c.get_tallas(),
            'categoria': {
                'id': c.categoria.id if c.categoria else None,
                'nombre': c.categoria.nombre if c.categoria else None,
                'slug': c.categoria.slug if c.categoria else None,
                'tipo': c.categoria.tipo if c.categoria else None,
            } if c.categoria else None
        })

    return JsonResponse({
        'camisetas': camisetas_list,
        'has_next': page_obj.has_next(),
        'has_previous': page_obj.has_previous(),
        'number': page_obj.number,
        'num_pages': paginator.num_pages,
        'count': paginator.count,
    })

def api_detalle_camiseta(request, pk):
    producto = get_object_or_404(
        Producto.objects.select_related('categoria').prefetch_related('variantes'),
        pk=pk, activo=True
    )
    nombre_limpio = re.sub(r'^(?:Camiseta\s+de\s+fútbol\s+de\s+|Camiseta\s+de\s+fútbol\s+|Camiseta\s+de\s+|Camiseta\s+)(.*)$', r'\1', producto.nombre, flags=re.IGNORECASE).strip().capitalize()
    precio = float(producto.precio) if producto.precio else (
        39.00 if (producto.categoria and (producto.categoria.slug == 'retro' or producto.categoria.tipo == 'retro'))
        else (22.00 if (producto.categoria and (producto.categoria.slug == 'kids' or producto.categoria.tipo == 'kids'))
        else 29.00)
    )
    return JsonResponse({
        'id': producto.id,
        'nombre': nombre_limpio,
        'nombre_original': producto.nombre,
        'descripcion': producto.descripcion or f"Camiseta oficial {nombre_limpio} de excelente calidad y tejido transpirable.",
        'precio': precio,
        'imagen_url': producto.get_imagen_url(),
        'tallas': producto.get_tallas(),
        'categoria': {
            'id': producto.categoria.id if producto.categoria else None,
            'nombre': producto.categoria.nombre if producto.categoria else None,
            'slug': producto.categoria.slug if producto.categoria else None,
            'tipo': producto.categoria.tipo if producto.categoria else None,
        } if producto.categoria else None
    })

@require_POST
def api_checkout(request):
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({'success': False, 'message': 'JSON inválido.'}, status=400)

    nombre = data.get('nombre', '').strip()
    telefono = data.get('telefono', '').strip()
    notas = data.get('notas', '').strip()
    cesta = get_cesta(request)

    if not cesta:
        return JsonResponse({'success': False, 'message': 'Tu cesta está vacía.'}, status=400)

    if not nombre:
        return JsonResponse({'success': False, 'message': 'Por favor introduce tu nombre.'}, status=400)

    with transaction.atomic():
        pedido = Pedido.objects.create(
            nombre_cliente=nombre, telefono=telefono, notas=notas
        )
        for item in cesta:
            producto = Producto.objects.get(pk=item['camiseta_id'])
            LineaPedido.objects.create(
                pedido=pedido, producto=producto,
                talla=item['talla'], cantidad=item['cantidad'],
                parche=item.get('parche', False),
                dorsal=item.get('dorsal', False),
                texto_dorsal=item.get('texto_dorsal', '')
            )
    save_cesta(request, [])
    return JsonResponse({
        'success': True,
        'pedido_id': pedido.pk,
        'message': f'Pedido #{pedido.pk} enviado correctamente.'
    })

def api_confirmacion(request, pk):
    pedido = get_object_or_404(Pedido, pk=pk)
    lineas_data = []
    for l in pedido.lineas.all().select_related('producto'):
        nombre_limpio = re.sub(r'^(?:Camiseta\s+de\s+fútbol\s+de\s+|Camiseta\s+de\s+fútbol\s+|Camiseta\s+de\s+|Camiseta\s+)(.*)$', r'\1', l.producto.nombre, flags=re.IGNORECASE).strip().capitalize()
        lineas_data.append({
            'producto_nombre': nombre_limpio,
            'talla': l.talla,
            'cantidad': l.cantidad,
            'parche': l.parche,
            'dorsal': l.dorsal,
            'texto_dorsal': l.texto_dorsal,
        })
    return JsonResponse({
        'id': pedido.pk,
        'nombre_cliente': pedido.nombre_cliente,
        'telefono': pedido.telefono,
        'notas': pedido.notas,
        'estado': pedido.get_estado_display(),
        'lineas': lineas_data,
    })

@ensure_csrf_cookie
def index_spa(request, *args, **kwargs):
    return render(request, 'index.html')
