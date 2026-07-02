import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'paginacamisetas.settings')
django.setup()

from tienda.models import Producto, VarianteProducto

def run():
    kids_products = Producto.objects.filter(categoria__tipo='kids')
    print(f"Updating variants for {kids_products.count()} kids products...")
    
    from django.db import transaction
    with transaction.atomic():
        # 1. Delete all existing variants for kids products
        deleted_count, _ = VarianteProducto.objects.filter(producto__in=kids_products).delete()
        print(f"Deleted {deleted_count} old variants.")
        
        # 2. Create variants 20, 22, 24, 26 for each kids product
        new_variants = []
        for p in kids_products:
            for talla in ['20', '22', '24', '26']:
                new_variants.append(VarianteProducto(
                    producto=p,
                    talla=talla,
                    activa=True,
                    permite_dorsal=True,
                    permite_parche=True
                ))
        
        # Bulk create for efficiency
        VarianteProducto.objects.bulk_create(new_variants)
        print(f"Created {len(new_variants)} new variants (tallas 20, 22, 24, 26) successfully.")

if __name__ == '__main__':
    run()
