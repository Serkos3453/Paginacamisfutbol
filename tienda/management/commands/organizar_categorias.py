import re
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from tienda.models import Categoria, Producto

class Command(BaseCommand):
    help = 'Re-organiza todos los productos en categorías limpias y descriptivas basándose en sus nombres'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Iniciando reorganización de categorías...'))

        # Definir las categorías deseadas
        categorias_config = {
            'retro': {'nombre': 'Retro / Clásicas', 'tipo': 'retro', 'icono': '🕰️', 'orden': 3},
            'niños': {'nombre': 'Niños / Infantil', 'tipo': 'kids', 'icono': '👶', 'orden': 4},
            'seleccion': {'nombre': 'Selecciones Nacionales', 'tipo': 'seleccion', 'icono': '🏳️', 'orden': 2},
            'la-liga': {'nombre': 'La Liga', 'tipo': 'liga', 'icono': '⚽', 'orden': 1},
            'premier-league': {'nombre': 'Premier League', 'tipo': 'liga', 'icono': '⚽', 'orden': 1},
            'serie-a': {'nombre': 'Serie A', 'tipo': 'liga', 'icono': '⚽', 'orden': 1},
            'bundesliga': {'nombre': 'Bundesliga', 'tipo': 'liga', 'icono': '⚽', 'orden': 1},
            'ligue-1': {'nombre': 'Ligue 1', 'tipo': 'liga', 'icono': '⚽', 'orden': 1},
            'brasileiro-serie-a': {'nombre': 'Brasileiro Serie A', 'tipo': 'liga', 'icono': '⚽', 'orden': 1},
            'liga-mx': {'nombre': 'Liga Mexicana MX', 'tipo': 'liga', 'icono': '⚽', 'orden': 1},
            'otras-ligas': {'nombre': 'Otras Ligas y Clubes', 'tipo': 'liga', 'icono': '⚽', 'orden': 1},
        }

        # Asegurar que existan y obtener sus objetos
        cat_objetos = {}
        for slug, conf in categorias_config.items():
            cat, created = Categoria.objects.get_or_create(
                slug=slug,
                defaults={
                    'nombre': conf['nombre'],
                    'tipo': conf['tipo'],
                    'icono': conf['icono'],
                    'orden': conf['orden'],
                    'activa': True
                }
            )
            if not created:
                # Actualizar campos por si acaso
                cat.nombre = conf['nombre']
                cat.tipo = conf['tipo']
                cat.icono = conf['icono']
                cat.orden = conf['orden']
                cat.save()
            cat_objetos[slug] = cat

        # Listado de países para selecciones nacionales
        paises = [
            'argentina', 'brasil', 'brazil', 'españa', 'spain', 'francia', 'france', 
            'alemania', 'germany', 'portugal', 'italia', 'italy', 'inglaterra', 'england',
            'países bajos', 'netherlands', 'holanda', 'holland', 'bélgica', 'belgium',
            'uruguay', 'colombia', 'croacia', 'croatia', 'marruecos', 'morocco', 'japón', 'japan',
            'méxico', 'mexico', 'estados unidos', 'usa', 'ecuador', 'catar', 'qatar', 'gales', 'wales',
            'polonia', 'poland', 'australia', 'dinamarca', 'denmark', 'suiza', 'switzerland',
            'serbia', 'arabia saudita', 'saudi arabia', 'corea del sur', 'korea', 'costa rica',
            'suecia', 'sweden', 'noruega', 'norway', 'ucrania', 'ukraine', 'turquía', 'turkey',
            'grecia', 'greece', 'república checa', 'czech', 'austria', 'hungría', 'hungary',
            'rumania', 'romania', 'escocia', 'scotland', 'finlandia', 'finland', 'islandia', 'iceland',
            'eslovaquia', 'slovakia', 'eslovenia', 'slovenia', 'chile', 'perú', 'peru', 'venezuela',
            'paraguay', 'bolivia', 'panamá', 'panama', 'jamaica', 'egipto', 'egypt', 'costa de marfil',
            'ivory coast', 'nigeria', 'senegal', 'túnez', 'tunisia', 'camerún', 'cameroon', 'ghana',
            'canadá', 'canada', 'argelia', 'algeria', 'suecia'
        ]

        clubes_grandes = [
            'real madrid', 'barcelona', 'barca', 'atletico', 'sevilla', 'valencia', 'betis',
            'manchester', 'man city', 'man united', 'liverpool', 'chelsea', 'arsenal', 'tottenham',
            'juventus', 'juve', 'milan', 'inter', 'napoli', 'roma', 'lazio', 'fiorentina',
            'bayern', 'dortmund', 'leverkusen', 'psg', 'marseille', 'flamengo', 'palmeiras',
            'corinthians', 'boca', 'river plate', 'inter miami', 'al nassr', 'al hilal', 'galatasaray'
        ]

        la_liga_teams = ['real madrid', 'barcelona', 'barca', 'atletico', 'sevilla', 'betis', 'valencia', 'real sociedad', 'athletic', 'villarreal', 'celta', 'mallorca', 'osasuna', 'las palmas', 'rayo vallecano', 'girona', 'getafe', 'alaves', 'leganes', 'valladolid', 'espanyol']
        premier_teams = ['manchester united', 'man united', 'man city', 'manchester city', 'liverpool', 'chelsea', 'arsenal', 'tottenham', 'newcastle', 'aston villa', 'brighton', 'brentford', 'fulham', 'crystal palace', 'wolves', 'west ham', 'everton', 'nottingham', 'leicester', 'ipswich', 'southampton', 'leeds']
        serie_a_teams = ['juventus', 'juve', 'ac milan', 'milan', 'inter de milan', 'inter milan', 'internazionale', 'napoli', 'roma', 'lazio', 'fiorentina', 'atalanta', 'bologna', 'torino', 'genoa', 'monza', 'verona', 'cagliari', 'lecce', 'empoli', 'udinese', 'venezia', 'parma', 'como']
        bundesliga_teams = ['bayern', 'dortmund', 'leverkusen', 'leipzig', 'frankfurt', 'stuttgart', 'werder bremen', 'monchengladbach', 'wolfsburg', 'freiburg', 'augsburg', 'mainz', 'hoffenheim', 'heidenheim', 'st pauli', 'bochum', 'union berlin', 'kiel']
        ligue_1_teams = ['psg', 'paris saint-germain', 'marseille', 'marsella', 'lyon', 'monaco', 'lille', 'lens', 'rennes', 'nice', 'niza', 'nantes', 'reims', 'brest', 'strasbourg', 'toulouse', 'montpellier', 'auxerre', 'saint etienne', 'angers', 'le havre']
        brasileiro_teams = ['flamengo', 'palmeiras', 'corinthians', 'sao paulo', 'gremio', 'cruzeiro', 'botafogo', 'fluminense', 'vasco', 'bahia', 'athletico paranaense', 'internacional', 'fortaleza', 'bragantino', 'atletico mineiro', 'cuiaba', 'juventude', 'criciuma', 'vitoria', 'atletico goianiense']
        mexican_teams = ['america', 'chivas', 'cruz azul', 'pumas', 'tigres', 'monterrey', 'toluca', 'leon', 'pachuca', 'santos laguna', 'atlas', 'tijuana', 'necaxa', 'queretaro', 'mazatlan', 'juarez', 'puebla', 'san luis', 'chivas']

        # Recorrer productos
        productos = Producto.objects.all()
        total = productos.count()
        counts = {slug: 0 for slug in cat_objetos.keys()}
        
        self.stdout.write(f'Analizando y re-categorizando {total} productos...')
        
        for index, p in enumerate(productos, 1):
            nombre_lower = f"{p.nombre} {p.nombre_original}".lower()
            
            # Determinar categoría
            target_slug = 'otras-ligas'
            
            # 1. Niños / Infantil
            if any(k in nombre_lower for k in ['kid', 'kids', 'niño', 'niños', 'child', 'children', 'youth', 'infantil']):
                target_slug = 'niños'
                
            # 2. Retro / Clásica
            elif any(k in nombre_lower for k in ['retro', 'classic', 'clásica', 'clasica', 'vintage']) or re.search(r'\b(19\d{2}|20[0-1][0-8])\b', nombre_lower):
                target_slug = 'retro'
                
            # 3. Selecciones Nacionales
            elif any(k in nombre_lower for k in ['national', 'seleccion', 'selección', 'world cup', 'euro 20', 'copa america', 'copa américa', 'mundial']) or (any(r'\b' + pais + r'\b' in nombre_lower for pais in paises) and not any(club in nombre_lower for club in clubes_grandes)):
                target_slug = 'seleccion'
                
            # 4. Clubes por liga
            elif any(t in nombre_lower for t in la_liga_teams):
                target_slug = 'la-liga'
            elif any(t in nombre_lower for t in premier_teams):
                target_slug = 'premier-league'
            elif any(t in nombre_lower for t in serie_a_teams):
                target_slug = 'serie-a'
            elif any(t in nombre_lower for t in bundesliga_teams):
                target_slug = 'bundesliga'
            elif any(t in nombre_lower for t in ligue_1_teams):
                target_slug = 'ligue-1'
            elif any(t in nombre_lower for t in brasileiro_teams):
                target_slug = 'brasileiro-serie-a'
            elif any(t in nombre_lower for t in mexican_teams):
                target_slug = 'liga-mx'
                
            # Asignar la categoría
            cat_dest = cat_objetos[target_slug]
            if p.categoria != cat_dest:
                p.categoria = cat_dest
                p.save()
                
            counts[target_slug] += 1
            
            if index % 2000 == 0:
                self.stdout.write(f'  Re-categorizados: {index}/{total}...')

        # Reporte final
        self.stdout.write(self.style.SUCCESS('\nReorganización de categorías completada con éxito:'))
        for slug, count in counts.items():
            self.stdout.write(f'  - {categorias_config[slug]["nombre"]}: {count} productos')

        # Eliminar categorías vacías o redundantes que no tienen productos
        self.stdout.write('\nLimpiando categorías vacías antiguas...')
        for cat in Categoria.objects.all():
            if cat.productos.count() == 0 and cat.slug not in cat_objetos:
                self.stdout.write(f'  Eliminando categoría vacía: {cat.nombre} ({cat.slug})')
                cat.delete()
                
        self.stdout.write(self.style.SUCCESS('Limpieza finalizada.'))
