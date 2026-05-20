import json
import re
from django.shortcuts import render, get_object_or_404, redirect
from django.views.decorators.http import require_POST
from django.contrib import messages
from django.db import transaction
from .models import Camiseta, Categoria, Pedido, LineaPedido
from django.core.paginator import Paginator


def _limpiar_nombre(texto):
    """Quita caracteres chinos y IDs largos del nombre de la camiseta."""
    texto = re.sub(r'[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]+', '', str(texto))
    texto = re.sub(r'\b\d{6,}\b', '', texto)
    return re.sub(r'\s+', ' ', texto).strip(' -,/') or str(texto)

# ─── CESTA EN SESIÓN ────────────────────────────────────────────────
def get_cesta(request):
    return request.session.get('cesta', [])

def save_cesta(request, cesta):
    request.session['cesta'] = cesta
    request.session.modified = True

def cesta_count(request):
    return sum(item['cantidad'] for item in get_cesta(request))

# ─── VISTAS PRINCIPALES ─────────────────────────────────────────────
def catalogo(request):
    categorias = Categoria.objects.prefetch_related('camisetas').all()
    categoria_slug = request.GET.get('categoria')
    busqueda = request.GET.get('q', '').strip()

    camisetas = Camiseta.objects.filter(activa=True).select_related('categoria')

    if categoria_slug:
        camisetas = camisetas.filter(categoria__slug=categoria_slug)
    if busqueda:
        # Busca por cada palabra individualmente (AND): "spain away" → nombre contiene "spain" Y "away"
        for palabra in busqueda.split():
            if palabra:
                camisetas = camisetas.filter(nombre__icontains=palabra)

    categoria_actual = None
    if categoria_slug:
        categoria_actual = Categoria.objects.filter(slug=categoria_slug).first()

    paginator = Paginator(camisetas, 120)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'camisetas': page_obj,
        'page_obj': page_obj,
        'categorias': categorias,
        'categoria_actual': categoria_actual,
        'busqueda': busqueda,
        'cesta_count': cesta_count(request),
    }
    return render(request, 'tienda/catalogo.html', context)


def detalle_camiseta(request, pk):
    camiseta = get_object_or_404(Camiseta, pk=pk, activa=True)
    context = {
        'camiseta': camiseta,
        'tallas': camiseta.get_tallas(),
        'cesta_count': cesta_count(request),
    }
    return render(request, 'tienda/detalle.html', context)


# ─── CESTA ──────────────────────────────────────────────────────────
@require_POST
def agregar_cesta(request):
    camiseta_id = request.POST.get('camiseta_id')
    talla = request.POST.get('talla')
    cantidad = int(request.POST.get('cantidad', 1))

    parche = request.POST.get('parche') == 'on'
    dorsal = request.POST.get('dorsal') == 'on'
    texto_dorsal = request.POST.get('texto_dorsal', '').strip() if dorsal else ''

    camiseta = get_object_or_404(Camiseta, pk=camiseta_id, activa=True)
    cesta = get_cesta(request)

    for item in cesta:
        if (item['camiseta_id'] == int(camiseta_id) and
                item['talla'] == talla and
                item.get('parche') == parche and
                item.get('texto_dorsal') == texto_dorsal):
            item['cantidad'] += cantidad
            save_cesta(request, cesta)
            messages.success(request, f'✅ Cantidad actualizada: {camiseta.nombre} ({talla})')
            return redirect('cesta')

    cesta.append({
        'camiseta_id': int(camiseta_id),
        'nombre': _limpiar_nombre(camiseta.nombre),
        'talla': talla,
        'cantidad': cantidad,
        'parche': parche,
        'dorsal': dorsal,
        'texto_dorsal': texto_dorsal,
        'imagen_url': camiseta.imagen_url,
    })
    save_cesta(request, cesta)
    messages.success(request, f'✅ Añadido: {camiseta.nombre} ({talla})')
    return redirect('cesta')


def ver_cesta(request):
    cesta = get_cesta(request)
    context = {
        'cesta': cesta,
        'cesta_count': cesta_count(request),
        'total_articulos': sum(i['cantidad'] for i in cesta),
    }
    return render(request, 'tienda/cesta.html', context)


@require_POST
def eliminar_de_cesta(request):
    idx = int(request.POST.get('idx', -1))
    cesta = get_cesta(request)
    if 0 <= idx < len(cesta):
        eliminado = cesta.pop(idx)
        save_cesta(request, cesta)
        messages.info(request, f'🗑️ Eliminado: {eliminado["nombre"]} ({eliminado["talla"]})')
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


# ─── PEDIDO ─────────────────────────────────────────────────────────
def checkout(request):
    cesta = get_cesta(request)
    if not cesta:
        messages.warning(request, '⚠️ Tu cesta está vacía.')
        return redirect('catalogo')

    if request.method == 'POST':
        nombre = request.POST.get('nombre', '').strip()
        telefono = request.POST.get('telefono', '').strip()
        notas = request.POST.get('notas', '').strip()

        if not nombre:
            messages.error(request, '❌ Por favor introduce tu nombre.')
            return render(request, 'tienda/checkout.html', {
                'cesta': cesta,
                'cesta_count': cesta_count(request),
            })

        with transaction.atomic():
            pedido = Pedido.objects.create(
                nombre_cliente=nombre,
                telefono=telefono,
                notas=notas,
            )

            for item in cesta:
                camiseta = Camiseta.objects.get(pk=item['camiseta_id'])
                LineaPedido.objects.create(
                    pedido=pedido,
                    camiseta=camiseta,
                    talla=item['talla'],
                    cantidad=item['cantidad'],
                    parche=item.get('parche', False),
                    dorsal=item.get('dorsal', False),
                    texto_dorsal=item.get('texto_dorsal', '')
                )

        save_cesta(request, [])
        messages.success(request, f'🎉 Pedido #{pedido.pk} enviado correctamente. ¡Gracias, {nombre}!')
        return redirect('confirmacion', pk=pedido.pk)

    return render(request, 'tienda/checkout.html', {
        'cesta': cesta,
        'cesta_count': cesta_count(request),
        'total_articulos': sum(i['cantidad'] for i in cesta),
    })


def confirmacion(request, pk):
    pedido = get_object_or_404(Pedido, pk=pk)
    return render(request, 'tienda/confirmacion.html', {
        'pedido': pedido,
        'lineas': pedido.lineas.all().select_related('camiseta'),
        'cesta_count': 0,
    })


# ─── RETRO ──────────────────────────────────────────────────────────
def catalogo_retro(request):
    """
    Muestra solo las camisetas de la categoría Retro (slug: retro-194939).
    Tiene su propia URL y template, no interfiere con el catálogo general.
    """
    busqueda = request.GET.get('q', '').strip()

    camisetas = (
        Camiseta.objects
        .filter(activa=True, categoria__slug='retro-194939')
        .select_related('categoria')
    )

    if busqueda:
        for palabra in busqueda.split():
            if palabra:
                camisetas = camisetas.filter(nombre__icontains=palabra)

    paginator   = Paginator(camisetas, 120)
    page_number = request.GET.get('page')
    page_obj    = paginator.get_page(page_number)

    context = {
        'camisetas':   page_obj,
        'page_obj':    page_obj,
        'busqueda':    busqueda,
        'cesta_count': cesta_count(request),
    }
    return render(request, 'tienda/retro.html', context)
