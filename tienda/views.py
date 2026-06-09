import re
from django.shortcuts import render, get_object_or_404, redirect
from django.views.decorators.http import require_POST
from django.contrib import messages
from django.db import transaction
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
    parche = request.POST.get('parche') == 'on'
    dorsal = request.POST.get('dorsal') == 'on'
    texto_dorsal = request.POST.get('texto_dorsal', '').strip() if dorsal else ''
    producto = get_object_or_404(Producto, pk=camiseta_id, activo=True)
    cesta = get_cesta(request)
    for item in cesta:
        if (item['camiseta_id'] == int(camiseta_id) and
                item['talla'] == talla and
                item.get('parche') == parche and
                item.get('texto_dorsal') == texto_dorsal):
            item['cantidad'] += cantidad
            save_cesta(request, cesta)
            messages.success(request, f'Cantidad actualizada: {producto.nombre} ({talla})')
            return redirect('cesta')
    cesta.append({
        'camiseta_id': int(camiseta_id),
        'nombre': producto.nombre,
        'talla': talla, 'cantidad': cantidad,
        'parche': parche, 'dorsal': dorsal,
        'texto_dorsal': texto_dorsal,
        'imagen_url': producto.get_imagen_url(),
    })
    save_cesta(request, cesta)
    messages.success(request, f'Añadido: {producto.nombre} ({talla})')
    return redirect('cesta')


def ver_cesta(request):
    cesta = get_cesta(request)
    return render(request, 'tienda/cesta.html', {
        'cesta': cesta, 'cesta_count': cesta_count(request),
        'total_articulos': sum(i['cantidad'] for i in cesta),
    })

@require_POST
def eliminar_de_cesta(request):
    idx = int(request.POST.get('idx', -1))
    cesta = get_cesta(request)
    if 0 <= idx < len(cesta):
        eliminado = cesta.pop(idx)
        save_cesta(request, cesta)
        messages.info(request, f'Eliminado: {eliminado["nombre"]} ({eliminado["talla"]})')
    return redirect('cesta')

@require_POST
def actualizar_cesta(request):
    idx = int(request.POST.get('idx', -1))
    nueva_cantidad = int(request.POST.get('cantidad', 1))
    cesta = get_cesta(request)
    if 0 <= idx < len(cesta):
        if nueva_cantidad <= 0:
            cesta.pop(idx)
        else:
            cesta[idx]['cantidad'] = nueva_cantidad
        save_cesta(request, cesta)
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
