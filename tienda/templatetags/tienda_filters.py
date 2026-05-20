import re
from django import template

register = template.Library()


@register.filter
def limpiar_nombre(value):
    """Elimina caracteres chinos/japoneses y IDs numéricos largos del nombre."""
    texto = str(value)
    # Quitar caracteres CJK (chino, japonés, coreano)
    texto = re.sub(r'[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]+', '', texto)
    # Quitar secuencias de 6+ dígitos (IDs del scraper)
    texto = re.sub(r'\b\d{6,}\b', '', texto)
    # Limpiar espacios múltiples, guiones y comas sueltos
    texto = re.sub(r'\s+', ' ', texto).strip(' -,/')
    # Si quedó vacío, devolver el original
    return texto if texto else str(value)
