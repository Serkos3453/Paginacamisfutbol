from django import template
from tienda.management.commands.traducir_nombres import traducir_limpiar_nombre

register = template.Library()

@register.filter
def limpiar_nombre(value):
    """Traduce y limpia caracteres chinos e IDs del nombre del producto."""
    return traducir_limpiar_nombre(value)
