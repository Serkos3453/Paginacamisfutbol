import os
import requests
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from tienda.models import Producto

class Command(BaseCommand):
    help = 'Descarga las imágenes originales de Yupoo para los productos existentes'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=500,
            help='Número máximo de imágenes a descargar en esta ejecución'
        )

    def handle(self, *args, **options):
        limit = options['limit']
        productos = Producto.objects.filter(imagen='').exclude(imagen_url_original='').select_related('categoria')[:limit]
        
        self.stdout.write(self.style.NOTICE(f'Buscando hasta {limit} productos sin imagen local...'))
        
        exitos = 0
        errores = 0
        
        for index, prod in enumerate(productos, 1):
            url = prod.imagen_url_original
            # Intentar deducir un referente apropiado
            enlace = prod.enlaces_proveedor.first()
            ref_base = enlace.proveedor.url_base if (enlace and enlace.proveedor) else 'https://yupoo.com'
            ref_base = '/'.join(ref_base.split('/')[:3])
            
            ext = url.split('.')[-1].split('?')[0][:4]
            if ext.lower() not in ['jpg', 'jpeg', 'png', 'webp']:
                ext = 'jpg'
                
            nombre_archivo = f"{prod.slug}.{ext}"
            
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': ref_base + '/'
                }
                r = requests.get(url, headers=headers, timeout=10)
                if r.status_code == 200:
                    prod.imagen.save(nombre_archivo, ContentFile(r.content), save=True)
                    exitos += 1
                    self.stdout.write(f"[{index}/{len(productos)}] ✅ Guardada: {prod.nombre} -> {nombre_archivo}")
                else:
                    errores += 1
                    self.stdout.write(self.style.WARNING(f"[{index}/{len(productos)}] ⚠️ HTTP {r.status_code}: {prod.nombre} ({url})"))
            except Exception as e:
                errores += 1
                self.stdout.write(self.style.ERROR(f"[{index}/{len(productos)}] ❌ Error {prod.nombre}: {e}"))
                
        self.stdout.write(self.style.SUCCESS(f'Proceso completado. Descargas exitosas: {exitos}, Errores: {errores}'))
