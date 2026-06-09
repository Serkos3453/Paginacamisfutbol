import re
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from tienda.models import Producto

TRADUCCIONES = {
    # Equipos de fútbol comunes y países en Yupoo
    '凯': 'Celtic',
    '凯尔特人': 'Celtic',
    '铁': 'Iron Maiden',
    '铁娘子': 'Iron Maiden',
    '巴黎': 'PSG',
    '大巴黎': 'PSG',
    '约旦': 'Jordania',
    '曼城': 'Manchester City',
    '尤文': 'Juventus',
    '尤文图斯': 'Juventus',
    '切尔西': 'Chelsea',
    '曼联': 'Manchester United',
    '阿贾克斯': 'Ajax',
    '皇马': 'Real Madrid',
    '皇家马德里': 'Real Madrid',
    '巴萨': 'Barcelona',
    '巴塞罗那': 'Barcelona',
    '罗马': 'Roma',
    '阿根廷': 'Argentina',
    '阿斯顿维拉': 'Aston Villa',
    '阿斯顿': 'Aston Villa',
    '拜仁': 'Bayern Múnich',
    '拜仁慕尼黑': 'Bayern Múnich',
    '科林蒂安': 'Corinthians',
    '利雅得胜利': 'Al-Nassr',
    '利雅得': 'Al-Nassr',
    '利雅得新月': 'Al-Hilal',
    '新月': 'Al-Hilal',
    '阿尔及利亚': 'Argelia',
    '吉达联合': 'Al-Ittihad',
    '吉达': 'Al-Ittihad',
    '多特': 'Dortmund',
    '多特蒙德': 'Dortmund',
    '西班牙': 'España',
    '西班': 'España',
    '利物浦': 'Liverpool',
    '阿森纳': 'Arsenal',
    '热刺': 'Tottenham',
    '托特纳姆': 'Tottenham',
    '马竞': 'Atlético de Madrid',
    '马德里竞技': 'Atlético de Madrid',
    '国米': 'Inter de Milán',
    '国际米兰': 'Inter de Milán',
    'AC米兰': 'AC Milan',
    '米兰': 'AC Milan',
    '那不勒斯': 'Nápoles',
    '拉齐奥': 'Lazio',
    '佛罗伦萨': 'Fiorentina',
    '热那亚': 'Genoa',
    '博洛尼亚': 'Bologna',
    '都灵': 'Torino',
    '桑普多利亚': 'Sampdoria',
    '帕尔马': 'Parma',
    '威尼斯': 'Venezia',
    '纽卡斯尔': 'Newcastle',
    '纽卡': 'Newcastle',
    '维拉': 'Aston Villa',
    '布莱顿': 'Brighton',
    '布伦特福德': 'Brentford',
    '富勒姆': 'Fulham',
    '水晶宫': 'Crystal Palace',
    '狼队': 'Wolves',
    '西汉姆联': 'West Ham',
    '西汉姆': 'West Ham',
    '埃弗顿': 'Everton',
    '诺丁汉森林': 'Nottingham Forest',
    '诺丁汉': 'Nottingham Forest',
    '莱斯特城': 'Leicester',
    '莱斯特': 'Leicester',
    '利兹联': 'Leeds',
    '利兹': 'Leeds',
    '南安普顿': 'Southampton',
    '商业': 'Comercial',
    '英格兰': 'Inglaterra',
    '法国': 'Francia',
    '德国': 'Alemania',
    '葡萄牙': 'Portugal',
    '意大利': 'Italia',
    '荷兰': 'Países Bajos',
    '比利时': 'Bélgica',
    '乌拉圭': 'Uruguay',
    '哥伦比亚': 'Colombia',
    '克罗地亚': 'Croacia',
    '摩洛哥': 'Marruecos',
    '日本': 'Japón',
    '塞内加尔': 'Senegal',
    '突尼斯': 'Túnez',
    '喀麦隆': 'Camerún',
    '加纳': 'Ghana',
    '加拿大': 'Canadá',
    '墨西哥': 'México',
    '美国': 'Estados Unidos',
    '厄瓜dores': 'Ecuador',
    '厄瓜多尔': 'Ecuador',
    '卡塔尔': 'Catar',
    '威尔士': 'Gales',
    '波兰': 'Polonia',
    '澳大利亚': 'Australia',
    '丹麦': 'Dinamarca',
    '瑞士': 'Suiza',
    '塞尔维亚': 'Serbia',
    '沙特阿拉伯': 'Arabia Saudita',
    '沙特': 'Arabia Saudita',
    '韩国': 'Corea del Sur',
    '哥斯达黎加': 'Costa Rica',
    '瑞典': 'Suecia',
    '挪威': 'Noruega',
    '乌克兰': 'Ucrania',
    '土耳k': 'Turquía',
    '土耳极': 'Turquía',
    '土耳其': 'Turquía',
    '希腊': 'Grecia',
    '捷k': 'República Checa',
    '捷克': 'República Checa',
    '奥地利': 'Austria',
    '匈牙利': 'Hungría',
    '罗马尼亚': 'Rumania',
    '苏格兰': 'Escocia',
    '芬兰': 'Finlandia',
    '冰岛': 'Islandia',
    '斯洛伐克': 'Eslovaquia',
    '斯洛文尼亚': 'Eslovenia',
    '智利': 'Chile',
    '秘鲁': 'Perú',
    '委内瑞拉': 'Venezuela',
    '巴拉圭': 'Paraguay',
    '玻利维亚': 'Bolivia',
    '巴拿马': 'Panamá',
    '牙买加': 'Jamaica',
    '埃及': 'Egipto',
    '科特迪瓦': 'Costa de Marfil',
    '科特': 'Costa de Marfil',
    '尼日利亚': 'Nigeria',
    '巴西': 'Brasil',

    # Adjetivos y tipos de prendas
    '主场': 'Primera Equipación',
    '主': 'Primera Equipación',
    '客场': 'Segunda Equipación',
    '客': 'Segunda Equipación',
    '第三客场': 'Tercera Equipación',
    '第三': 'Tercera Equipación',
    '三客': 'Tercera Equipación',
    '二客': 'Tercera Equipación',
    '四客': 'Cuarta Equipación',
    '特别版': 'Edición Especial',
    '特别': 'Edición Especial',
    '限量版': 'Edición Especial',
    '限量': 'Edición Especial',
    '纪念版': 'Edición Especial',
    '纪念': 'Edición Especial',
    '纪念款': 'Edición Conmemorativa',
    '经典': 'Retro',
    '复古': 'Retro',
    '球员': 'Jugador',
    '球迷': 'Aficionado',
    '训练服': 'Entrenamiento',
    '训练': 'Entrenamiento',
    '长袖': 'Manga Larga',
    '短裤': 'Short',
    '裤': 'Short',
    '守门员': 'Portero',
    '门将': 'Portero',
    '女裝': 'Mujer',
    '女装': 'Mujer',
    '女款': 'Mujer',
    '女': 'Mujer',
    '男款': 'Hombre',
    '男': 'Hombre',
    '童装': 'Niños',
    '儿童': 'Niños',
    '红色': 'Rojo',
    '红': 'Rojo',
    '蓝色': 'Azul',
    '蓝': 'Azul',
    '黑色': 'Negro',
    '黑': 'Negro',
    '白色': 'Blanco',
    '白': 'Blanco',
    '绿色': 'Verde',
    '绿': 'Verde',
    '黄色': 'Amarillo',
    '黄': 'Amarillo',
    '粉色': 'Rosa',
    '粉': 'Rosa',
    '橙色': 'Naranja',
    '橙': 'Naranja',
    '紫色': 'Morado',
    '紫': 'Morado',
    '灰色': 'Gris',
    '灰': 'Gris',
    '金色': 'Oro',
    '金': 'Oro',
    '银色': 'Plata',
    '银': 'Plata',
    '翻领': 'Polo',
    '领': 'Cuello',
    '带广告': 'Con Sponsor',
    '广告': 'Sponsor',
    '双星': 'Estrellas',
    '带星星': 'Con Estrellas',
    '大夏': 'Dasha',
    '凤凰': 'Fénix',
    '三色': 'Tricolor',
    '一': '-',
    '二': '2',
    '三': '3',
    '四': '4',
    '尺码': 'Talla',
    '表': 'Tabla',
    '版': 'Versión',
    '佛': 'Flamengo',
    '皇': 'Real',
    '钮': 'Newcastle',
    '文': 'Juve',
    '无': 'None',
}

EQUIPOS_MAP = {
    'real madrid': 'Real Madrid', 'barcelona': 'FC Barcelona', 'barca': 'FC Barcelona',
    'atletico': 'Atlético de Madrid', 'sevilla': 'Sevilla FC',
    'man united': 'Manchester United', 'manchester united': 'Manchester United',
    'man city': 'Manchester City', 'manchester city': 'Manchester City',
    'liverpool': 'Liverpool FC', 'chelsea': 'Chelsea FC',
    'arsenal': 'Arsenal FC', 'tottenham': 'Tottenham Hotspur',
    'juventus': 'Juventus FC', 'juve': 'Juventus FC',
    'ac milan': 'AC Milan', 'inter milan': 'Inter de Milán',
    'napoli': 'SSC Napoli', 'roma': 'AS Roma',
    'bayern': 'Bayern Múnich', 'dortmund': 'Borussia Dortmund',
    'psg': 'Paris Saint-Germain',
    'brazil': 'Brasil', 'argentina': 'Argentina', 'germany': 'Alemania',
    'france': 'Francia', 'england': 'Inglaterra', 'spain': 'España',
    'italy': 'Italia', 'portugal': 'Portugal', 'mexico': 'México',
    'japan': 'Japón', 'colombia': 'Colombia', 'chile': 'Chile',
}

EQUIPACION_MAP = {
    'home': 'Primera Equipación',
    'away': 'Segunda Equipación',
    'third': 'Tercera Equipación',
    'gk': 'Portero',
    'goalkeeper': 'Portero',
    'training': 'Entrenamiento',
    'special': 'Edición Especial',
    'long-sleeve': 'Manga Larga',
    'long sleeve': 'Manga Larga',
    'player version': 'Jugador',
    'player': 'Jugador',
    'fan version': 'Aficionado',
    'fans': 'Aficionado',
    'kids': 'Niños',
    'kid': 'Niños',
}

def traducir_limpiar_nombre(orig):
    texto = str(orig)
    
    # 1. Traducir caracteres chinos ordenando claves por longitud descendente
    claves_ordenadas = sorted(TRADUCCIONES.keys(), key=len, reverse=True)
    for zh in claves_ordenadas:
        if zh in texto:
            texto = texto.replace(zh, f" {TRADUCCIONES[zh]} ")
            
    # 2. Eliminar cualquier caracter chino restante (basura de fábrica)
    texto = re.sub(r'[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]+', '', texto)
    
    # 3. Remover tallas y rangos comunes (ej: S-4XL, S-3XL, S-2XL, etc.)
    texto = re.sub(r'\b(S-4XL|S-3XL|S-2XL|S-XXL|S-XL|S-L|M-XXL|M-2XL|L-XXL|XS-XL|S/M/L/XL|S-XXXL)\b', '', texto, flags=re.IGNORECASE)
    texto = re.sub(r'\b(S|M|L|XL|XXL|XXXL|2XL|3XL|4XL|5XL)\b', '', texto, flags=re.IGNORECASE)
    texto = re.sub(r'\b(size|talla|tallas|sizes)\b', '', texto, flags=re.IGNORECASE)
    
    # 4. Remover IDs del scraper y patrones numéricos largos
    texto = re.sub(r'\b[A-Z]{1,3}\d{3,6}\b', '', texto)
    texto = re.sub(r'\b\d{5,}\b', '', texto)
    texto = re.sub(r'[\$¥€£]+\s*\d*', '', texto)
    texto = re.sub(r'[#*_]+', '', texto)
    
    # 5. Detectar y normalizar temporada
    temporada = ''
    m_temp = re.search(r'\b(\d{2,4})[-/\s]+(\d{2,4})', texto)
    if m_temp:
        a_str, b_str = m_temp.group(1), m_temp.group(2)
        if len(a_str) in [2, 4] and len(b_str) in [2, 4]:
            try:
                a_num = int(a_str)
                b_num = int(b_str)
                a_full = a_num + (1900 if a_num >= 30 else 2000) if len(a_str) == 2 else a_num
                b_full = b_num + (1900 if b_num >= 30 else 2000) if len(b_str) == 2 else b_num
                if 0 < (b_full - a_full) <= 2 and 1930 <= a_full <= 2030:
                    temporada = f"{a_full}/{str(b_full)[2:]}"
                    texto = texto.replace(m_temp.group(0), '')
            except ValueError:
                pass

    if not temporada:
        m_compact = re.search(r'\b(\d{4})\b', texto)
        if m_compact:
            num = m_compact.group(1)
            try:
                a_num = int(num[:2])
                b_num = int(num[2:])
                a_full = a_num + (1900 if a_num >= 30 else 2000)
                b_full = b_num + (1900 if b_num >= 30 else 2000)
                if 0 < (b_full - a_full) <= 2 and 1930 <= a_full <= 2030:
                    temporada = f"{a_full}/{str(b_full)[2:]}"
                    texto = texto.replace(m_compact.group(0), '')
            except ValueError:
                pass

    if not temporada:
        m_anio = re.search(r'\b(19\d{2}|20\d{2})\b', texto)
        if m_anio:
            temporada = m_anio.group(1)
            texto = texto.replace(m_anio.group(0), '')
            
    # 6. Reemplazar equipaciones y equipos en inglés
    for eng, esp in sorted(EQUIPACION_MAP.items(), key=lambda x: len(x[0]), reverse=True):
        texto = re.sub(r'\b' + re.escape(eng) + r'\b', esp, texto, flags=re.IGNORECASE)
        
    for eng, esp in sorted(EQUIPOS_MAP.items(), key=lambda x: len(x[0]), reverse=True):
        texto = re.sub(r'\b' + re.escape(eng) + r'\b', esp, texto, flags=re.IGNORECASE)

    # 7. Quitar palabras de relleno/conectores innecesarios
    texto = re.sub(r'\b(game|jersey|shirt|camisetas|camiseta|jersey|pantalon|pantalones|short|shorts|socks)\b', '', texto, flags=re.IGNORECASE)

    # 8. Limpieza final de espacios y puntuación
    texto = re.sub(r'[:：,，\s\-—/]+', ' ', texto)
    if temporada:
        texto = f"{texto} {temporada}"
    texto = re.sub(r'\s+', ' ', texto).strip(' .:：,，-—/')
    
    return texto if texto else str(orig)


class Command(BaseCommand):
    help = 'Traduce nombres de productos en chino y limpia nombres y slugs duplicados/vacíos'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Iniciando limpieza y traducción de productos con algoritmo mejorado...'))
        
        # 1. Eliminar tablas de tallas
        self.stdout.write('Eliminando productos de tabla de tallas / size charts...')
        size_charts = Producto.objects.filter(
            nombre_original__icontains='尺码表'
        ) | Producto.objects.filter(
            nombre_original__iexact='size chart'
        ) | Producto.objects.filter(
            nombre_original__icontains='size chart'
        )
        sc_count = size_charts.count()
        size_charts.delete()
        self.stdout.write(self.style.SUCCESS(f'Se eliminaron {sc_count} productos de tablas de tallas.'))
        
        # 2. Traducir y limpiar nombres y slugs
        productos = Producto.objects.all()
        total = productos.count()
        modificados = 0
        
        self.stdout.write(f'Procesando {total} productos...')
        for index, p in enumerate(productos, 1):
            nom_traducido = traducir_limpiar_nombre(p.nombre_original)
            
            # Fallback si el nombre traducido quedó vacío o no contiene letras
            if not re.search(r'[a-zA-ZáéíóúÁÉÍÓÚñÑ]', nom_traducido):
                cat_nombre = p.categoria.nombre if p.categoria else 'Producto'
                nom_traducido = f"Camiseta {cat_nombre} {nom_traducido}".strip()
                
            # Si el nombre traducido o limpio difiere del actual
            if p.nombre != nom_traducido or p.slug == '' or p.slug.startswith('-'):
                p.nombre = nom_traducido
                
                # Regenerar slug para asegurar unicidad y SEO
                base_slug = slugify(nom_traducido)
                p.slug = base_slug[:450]
                
                counter = 1
                while Producto.objects.filter(slug=p.slug).exclude(pk=p.pk).exists():
                    p.slug = f'{base_slug[:440]}-{counter}'
                    counter += 1
                
                p.save()
                modificados += 1
                
            if index % 2000 == 0:
                self.stdout.write(f'  Procesados: {index}/{total}...')
                
        self.stdout.write(self.style.SUCCESS(f'Proceso completado. Se actualizaron {modificados} de {total} productos.'))
