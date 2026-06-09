from functools import lru_cache
from django import template
from tienda.management.commands.traducir_nombres import traducir_limpiar_nombre

register = template.Library()


@lru_cache(maxsize=4096)
def _cached_limpiar(value):
    """Versión cacheada — evita re-ejecutar regex en cada request."""
    return traducir_limpiar_nombre(value)


@register.filter
def limpiar_nombre(value):
    """Traduce y limpia caracteres chinos e IDs del nombre del producto."""
    return _cached_limpiar(value)
