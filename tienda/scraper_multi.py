"""
scraper_multi.py — Scraper Multi-Proveedor (basado en scrapers probados)
=========================================================================
Reutiliza la lógica de navegación de scraper_selenium.py y scraper_194939.py
adaptada a los nuevos modelos (Producto, Proveedor, etc.)

Uso:
    python tienda/scraper_multi.py                  # Todos
    python tienda/scraper_multi.py --proveedor 1    # Solo 1022669895
    python tienda/scraper_multi.py --proveedor 2    # Solo 194939
    python tienda/scraper_multi.py --proveedor 3    # Solo baocheng
"""
import os, sys, time, random, re, logging, socket, argparse

if __name__ == '__main__':
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'paginacamisetas.settings')
    import django; django.setup()

from django.utils.text import slugify
from django.core.files.base import ContentFile
import requests
from tienda.models import Proveedor, Categoria, Producto, ProductoProveedor, VarianteProducto


from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException
from webdriver_manager.chrome import ChromeDriverManager

# ── Logging ──
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler(),
              logging.FileHandler(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scraper.log'), encoding='utf-8')])
log = logging.getLogger('scraper_multi')

TALLAS_ADULTO = ['S', 'M', 'L', 'XL', 'XXL']
TALLAS_KIDS = ['S-M', 'M-L', 'L-XL']

# ══════════════════════════════════════════════════════════════════════
#  PROVEEDORES — mismas URLs y estructura que los scrapers probados
# ══════════════════════════════════════════════════════════════════════
PROVEEDORES = {
    1: {
        'nombre': 'Proveedor 1022669895',
        'url_base': 'https://1022669895.x.yupoo.com',
        # Mismo listado de categorías que scraper_selenium.py
        'modo': 'categorias',
        'categorias': [
            ('5110244', '26/27 Euroleague Club Fans'),
            ('5070592', '26/27 National Team'),
            ('5070577', '26/27 National Team Kids'),
            ('4791547', '25/26 Euroleague Club Fans'),
            ('4789845', '25/26 National Team Fans'),
            ('4789844', '26/27 National Team Players'),
            ('4789843', '25/26 Euroleague Clubs Players'),
            ('4789807', '2425 Euroleague Clubs'),
            ('4789846', '2425 Club Players'),
            ('3255537', '2425 National Team Fans'),
            ('4789855', '2425 Womens Wear'),
            ('3930346', '2526 Other League Clubs'),
            ('3929838', '2326 Mexican Club League'),
            ('4089028', '22-26 American League'),
            ('4789852', 'Jersey Retro'),
            ('3860619', 'Kids'),
            ('3923254', 'La Liga'),
            ('3297315', 'Ligue 1'),
            ('2777483', 'Serie A'),
            ('3921505', 'Brasileiro Serie A'),
            ('2777511', 'Premier League'),
            ('3922962', 'Chile League'),
            ('3293731', 'Bundesliga'),
        ],
    },
    2: {
        'nombre': 'Proveedor 194939',
        'url_base': 'https://194939.x.yupoo.com',
        # Mismo modo que scraper_194939.py: paginar /categories
        'modo': 'paginacion',
    },
    3: {
        'nombre': 'Proveedor Baocheng',
        'url_base': 'https://baocheng3f888.x.yupoo.com',
        'modo': 'paginacion',
    },
}

# ══════════════════════════════════════════════════════════════════════
#  LIMPIEZA DE NOMBRES (sanitización)
# ══════════════════════════════════════════════════════════════════════
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
    'home': 'Primera Equipación', 'away': 'Segunda Equipación',
    'third': 'Tercera Equipación', 'gk': 'Portero', 'goalkeeper': 'Portero',
    'training': 'Entrenamiento', 'special': 'Edición Especial',
}

def limpiar_nombre(titulo_raw):
    from tienda.management.commands.traducir_nombres import traducir_limpiar_nombre
    return traducir_limpiar_nombre(titulo_raw)


def detectar_tipo_categoria(titulo):
    lower = titulo.lower()
    if 'retro' in lower: return 'retro'
    if any(k in lower for k in ['kid', 'child', 'niño', 'youth']): return 'kids'
    if any(k in lower for k in ['national', 'seleccion', 'world cup']): return 'seleccion'
    if 'player' in lower or 'fan version' in lower: return 'version'
    return 'liga'

# ══════════════════════════════════════════════════════════════════════
#  SELENIUM — Copiado exacto de los scrapers que funcionan
# ══════════════════════════════════════════════════════════════════════
def esperar(a=1.0, b=2.5):
    time.sleep(random.uniform(a, b))

def esperar_conexion(max_intentos=30, segundos=15):
    for intento in range(1, max_intentos + 1):
        try:
            socket.setdefaulttimeout(5)
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.connect(("8.8.8.8", 53)); s.close()
            log.info("Conexión restaurada"); return
        except OSError:
            log.warning(f"Sin conexión... {segundos}s (intento {intento}/{max_intentos})")
            time.sleep(segundos)
    raise Exception("No se pudo restaurar la conexión")

def crear_driver():
    op = Options()
    op.add_argument('--no-sandbox')
    op.add_argument('--disable-dev-shm-usage')
    op.add_argument('--disable-blink-features=AutomationControlled')
    op.add_experimental_option('excludeSwitches', ['enable-automation'])
    op.add_experimental_option('useAutomationExtension', False)
    op.add_argument('--window-size=1400,900')
    op.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    if os.path.exists('/snap/bin/chromium.chromedriver'):
        svc = Service(executable_path='/snap/bin/chromium.chromedriver')
    else:
        svc = Service(ChromeDriverManager().install())
        
    driver = webdriver.Chrome(service=svc, options=op)
    driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument',
        {'source': "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"})
    return driver



def get_con_reintento(driver, url, max_intentos=10):
    for intento in range(1, max_intentos + 1):
        try:
            driver.get(url); return
        except Exception as e:
            msg = str(e)
            if any(err in msg for err in ['ERR_INTERNET_DISCONNECTED','ERR_NAME_NOT_RESOLVED',
                                           'ERR_CONNECTION_TIMED_OUT','ERR_NETWORK_CHANGED']):
                log.warning(f"Desconexión (intento {intento}/{max_intentos})")
                esperar_conexion(); esperar(3, 6)
            else: raise
    raise Exception(f"No se pudo cargar {url}")

def scroll_completo(driver):
    ultima = 0
    for _ in range(20):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(0.6)
        nueva = driver.execute_script("return document.body.scrollHeight")
        if nueva == ultima: break
        ultima = nueva
    driver.execute_script("window.scrollTo(0, 0);"); time.sleep(0.3)

def get_total_paginas(driver):
    try: body_text = driver.find_element(By.TAG_NAME, 'body').text
    except: return 1
    m = re.search(r'\d+\s*/\s*(\d+)', body_text)
    if m: return int(m.group(1))
    m = re.search(r'en total\s+(\d+)\s+p[áa]ginas', body_text, re.I)
    if m: return int(m.group(1))
    m = re.search(r'共\s*(\d+)\s*页', body_text)
    if m: return int(m.group(1))
    try:
        links = driver.find_elements(By.CSS_SELECTOR, "a[href*='page=']")
        nums = []
        for l in links:
            m2 = re.search(r'page=(\d+)', l.get_attribute('href') or '')
            if m2: nums.append(int(m2.group(1)))
        if nums: return max(nums)
    except: pass
    return 1

# ══════════════════════════════════════════════════════════════════════
#  EXTRACCIÓN — Lógica exacta de scraper_194939.py (funciona)
# ══════════════════════════════════════════════════════════════════════
def extraer_albumes_pagina(driver):
    albumes = []
    try:
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "a[href*='/albums/']")))
    except TimeoutException:
        log.warning("Timeout — página sin álbumes"); return albumes
    scroll_completo(driver)
    try: todas = driver.find_elements(By.CSS_SELECTOR, "a[href*='/albums/']")
    except: return albumes

    vistos = set()
    for tarjeta in todas:
        try: href = tarjeta.get_attribute('href') or ''
        except StaleElementReferenceException: continue
        if not href or '/albums/' not in href: continue
        if any(x in href for x in ['/download', '/copy', '/share']): continue
        href_base = href.split('?')[0]
        if href_base in vistos: continue
        vistos.add(href_base)
        try: album_id = href_base.split('/albums/')[1].strip('/')
        except: continue
        if not album_id.isdigit(): continue

        nombre = ''
        for fuente in [
            lambda: tarjeta.get_attribute('title'),
            lambda: tarjeta.find_element(By.CSS_SELECTOR, "[data-name]").get_attribute('data-name'),
            lambda: tarjeta.find_element(By.CSS_SELECTOR, ".album__title, [class*='title']").text.strip(),
            lambda: tarjeta.text.strip(),
            lambda: tarjeta.find_element(By.CSS_SELECTOR, 'img').get_attribute('alt'),
        ]:
            try:
                v = fuente()
                if v and v.strip(): nombre = v.strip(); break
            except: continue
        nombre = nombre or f"Camiseta {album_id}"

        img_url = ''
        for sel in ['img[src*="yupoo"]', 'img[data-src*="yupoo"]', 'img']:
            try:
                img = tarjeta.find_element(By.CSS_SELECTOR, sel)
                img_url = img.get_attribute('src') or img.get_attribute('data-src') or img.get_attribute('data-lazy-src') or ''
                if img_url.startswith('http') and 'yupoo' in img_url: break
                img_url = ''
            except NoSuchElementException: continue

        albumes.append({'nombre': nombre, 'album_id': album_id, 'img_url': img_url, 'href': href})
    return albumes

# Extracción por categoría — Lógica exacta de scraper_selenium.py
def extraer_albumes_categoria(driver, cat_id):
    albumes = []
    selector = f"a[href*='/albums/'][href*='referrercate={cat_id}']"
    try:
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
    except TimeoutException:
        try:
            WebDriverWait(driver, 8).until(EC.presence_of_element_located((By.CSS_SELECTOR, "a[href*='/albums/']")))
        except TimeoutException:
            log.warning("Timeout — sin álbumes"); return albumes
    scroll_completo(driver)
    try: tarjetas = driver.find_elements(By.CSS_SELECTOR, selector)
    except: tarjetas = []
    if not tarjetas:
        try:
            todas = driver.find_elements(By.CSS_SELECTOR, "a[href*='/albums/']")
            tarjetas = [t for t in todas if f'referrercate={cat_id}' in (t.get_attribute('href') or '')]
        except: tarjetas = []

    vistos = set()
    for tarjeta in tarjetas:
        try: href = tarjeta.get_attribute('href') or ''
        except StaleElementReferenceException: continue
        if not href or '/albums/' not in href: continue
        href_base = href.split('?')[0]
        if href_base in vistos: continue
        vistos.add(href_base)
        try: album_id = href_base.split('/albums/')[1].strip('/')
        except: continue
        if not album_id.isdigit(): continue

        nombre = ''
        try:
            span = tarjeta.find_element(By.CSS_SELECTOR, "[data-name]")
            nombre = span.get_attribute('data-name') or ''
        except: pass
        if not nombre:
            try: nombre = tarjeta.get_attribute('title') or ''
            except: pass
        if not nombre:
            try: nombre = tarjeta.text.strip()
            except: pass
        if not nombre:
            try: nombre = tarjeta.find_element(By.CSS_SELECTOR, 'img').get_attribute('alt') or ''
            except: pass
        nombre = nombre.strip() or f"Camiseta {album_id}"

        img_url = ''
        for sel in ['img[src*="yupoo"]', 'img[data-src]', 'img']:
            try:
                img = tarjeta.find_element(By.CSS_SELECTOR, sel)
                img_url = img.get_attribute('src') or img.get_attribute('data-src') or img.get_attribute('data-lazy-src') or ''
                if img_url.startswith('http') and 'yupoo' in img_url: break
                img_url = ''
            except NoSuchElementException: continue
        albumes.append({'nombre': nombre, 'album_id': album_id, 'img_url': img_url, 'href': href})
    return albumes

# ══════════════════════════════════════════════════════════════════════
#  GUARDADO EN BD — Nuevos modelos con anti-duplicados
# ══════════════════════════════════════════════════════════════════════
_cat_cache = {}

def obtener_categoria(cat_nombre_yupoo):
    tipo = detectar_tipo_categoria(cat_nombre_yupoo)
    slug = slugify(cat_nombre_yupoo)
    if slug in _cat_cache: return _cat_cache[slug]
    cat, _ = Categoria.objects.get_or_create(slug=slug, defaults={'nombre': cat_nombre_yupoo, 'tipo': tipo})
    _cat_cache[slug] = cat
    return cat

def descargar_y_guardar_imagen(prod, img_url, url_referente):
    if not img_url or not img_url.startswith('http'):
        return
    # Evitar volver a descargar si ya tiene imagen guardada en local/S3
    if prod.imagen:
        return
        
    ext = img_url.split('.')[-1].split('?')[0][:4]
    if ext.lower() not in ['jpg', 'jpeg', 'png', 'webp']:
        ext = 'jpg'
        
    nombre_archivo = f"{prod.slug}.{ext}"
    try:
        ref_base = '/'.join(url_referente.split('/')[:3])
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': ref_base + '/'
        }
        r = requests.get(img_url, headers=headers, timeout=10)
        if r.status_code == 200:
            prod.imagen.save(nombre_archivo, ContentFile(r.content), save=True)
            log.info(f"    📸 Imagen guardada para {prod.nombre} -> {nombre_archivo}")
        else:
            log.warning(f"    ⚠️ Error HTTP {r.status_code} al descargar imagen de {img_url}")
    except Exception as e:
        log.warning(f"    ⚠️ Error al descargar imagen de {img_url}: {e}")

def guardar_album(album, proveedor_obj, cat_nombre_yupoo, ids_vistos):
    album_id = album['album_id']
    nombre_limpio = limpiar_nombre(album['nombre'])

    # Ya existe enlace para este proveedor+album?
    if ProductoProveedor.objects.filter(proveedor=proveedor_obj, yupoo_album_id=album_id).exists():
        # Actualizar
        enlace = ProductoProveedor.objects.select_related('producto').get(proveedor=proveedor_obj, yupoo_album_id=album_id)
        prod = enlace.producto
        prod.nombre = nombre_limpio
        prod.nombre_original = album['nombre']
        prod.imagen_url_original = album['img_url']
        prod.activo = True
        prod.save()
        descargar_y_guardar_imagen(prod, album['img_url'], proveedor_obj.url_base)
        return 'actualizado'

    # Producto ya existe de otro proveedor? (anti-duplicado)
    enlace_otro = ProductoProveedor.objects.filter(yupoo_album_id=album_id).select_related('producto').first()
    if enlace_otro:
        ProductoProveedor.objects.create(
            producto=enlace_otro.producto, proveedor=proveedor_obj,
            yupoo_album_id=album_id, url_album=album.get('href', ''))
        descargar_y_guardar_imagen(enlace_otro.producto, album['img_url'], proveedor_obj.url_base)
        return 'asociado'

    # Crear producto nuevo
    categoria = obtener_categoria(cat_nombre_yupoo)
    prod = Producto(nombre=nombre_limpio, nombre_original=album['nombre'],
                    imagen_url_original=album['img_url'], categoria=categoria, activo=True)
    prod.save()

    descargar_y_guardar_imagen(prod, album['img_url'], proveedor_obj.url_base)

    ProductoProveedor.objects.create(producto=prod, proveedor=proveedor_obj,
                                     yupoo_album_id=album_id, url_album=album.get('href', ''))

    es_kids = any(k in album['nombre'].lower() for k in ['kid', 'child', 'youth'])
    for talla in (TALLAS_KIDS if es_kids else TALLAS_ADULTO):
        VarianteProducto.objects.create(producto=prod, talla=talla, activa=True)

    ids_vistos.add(album_id)
    return 'creado'


# ══════════════════════════════════════════════════════════════════════
#  MODO CATEGORÍAS — Lógica de scraper_selenium.py
# ══════════════════════════════════════════════════════════════════════
def scrape_por_categorias(config, driver, proveedor_obj):
    base_url = config['url_base']
    stats = {'creado': 0, 'actualizado': 0, 'asociado': 0, 'error': 0}
    ids_vistos = set()

    log.info("Sesión inicial en Yupoo...")
    get_con_reintento(driver, base_url)
    esperar(4, 6)

    for cat_id, cat_nombre in config['categorias']:
        log.info(f"\n{'═'*60}")
        log.info(f"📂 {cat_nombre}  [ID: {cat_id}]")

        albumes = []
        vistos_local = set()
        pagina = 1
        total = 1

        while True:
            url = f"{base_url}/categories/{cat_id}" if pagina == 1 \
                  else f"{base_url}/categories/{cat_id}?page={pagina}"
            log.info(f"  Página {pagina}: {url}")
            get_con_reintento(driver, url)
            esperar(2.5, 4)

            if pagina == 1:
                total = get_total_paginas(driver)
                log.info(f"  Total páginas: {total}")

            nuevos_pagina = extraer_albumes_categoria(driver, cat_id)
            nuevos = [a for a in nuevos_pagina if a['album_id'] not in vistos_local]
            for a in nuevos: vistos_local.add(a['album_id'])
            albumes.extend(nuevos)
            log.info(f"  Página {pagina}: {len(nuevos)} nuevos | Total cat: {len(albumes)}")

            if len(nuevos_pagina) == 0 or pagina >= total: break
            pagina += 1

        log.info(f"  Categoría completa: {len(albumes)} álbumes")

        for album in albumes:
            try:
                r = guardar_album(album, proveedor_obj, cat_nombre, ids_vistos)
                stats[r] += 1
            except Exception as e:
                log.error(f"  Error: {e}"); stats['error'] += 1

        log.info(f"  ✅ creados={stats['creado']} actualizados={stats['actualizado']}")
    return stats

# ══════════════════════════════════════════════════════════════════════
#  MODO PAGINACIÓN — Lógica de scraper_194939.py
# ══════════════════════════════════════════════════════════════════════
def scrape_por_paginacion(config, driver, proveedor_obj):
    base_url = config['url_base']
    stats = {'creado': 0, 'actualizado': 0, 'asociado': 0, 'error': 0}
    ids_vistos = set()
    cat_nombre_defecto = config['nombre']

    log.info("Sesión inicial...")
    get_con_reintento(driver, f"{base_url}/categories")
    esperar(4, 6)

    total_paginas = get_total_paginas(driver)
    log.info(f"Total páginas: {total_paginas}")

    for pagina in range(1, total_paginas + 1):
        url = f"{base_url}/categories" if pagina == 1 \
              else f"{base_url}/categories?page={pagina}"
        log.info(f"\nPágina {pagina}/{total_paginas}: {url}")
        get_con_reintento(driver, url)
        esperar(2, 3.5)

        albumes = extraer_albumes_pagina(driver)
        log.info(f"  {len(albumes)} álbumes extraídos")

        if not albumes:
            log.warning("  Página vacía"); continue

        for album in albumes:
            if album['album_id'] in ids_vistos: continue
            try:
                r = guardar_album(album, proveedor_obj, cat_nombre_defecto, ids_vistos)
                stats[r] += 1
            except Exception as e:
                log.error(f"  Error: {e}"); stats['error'] += 1

        log.info(f"  creados={stats['creado']} actualizados={stats['actualizado']}")

        if pagina % 10 == 0:
            log.info(f"  PROGRESO: {pagina}/{total_paginas} | Total BD: {Producto.objects.count()}")
    return stats

# ══════════════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════════════
def main():
    parser = argparse.ArgumentParser(description='Scraper Multi-Proveedor')
    parser.add_argument('--proveedor', type=int, choices=[1, 2, 3], help='Solo un proveedor')
    args = parser.parse_args()

    ids = [args.proveedor] if args.proveedor else [1, 2, 3]
    log.info(f"🚀 Scraper Multi-Proveedor — {len(ids)} proveedor(es)")
    log.info(f"Productos en BD: {Producto.objects.count()}")

    driver = crear_driver()
    total = {'creado': 0, 'actualizado': 0, 'asociado': 0, 'error': 0}

    try:
        for pid in ids:
            config = PROVEEDORES[pid]
            log.info(f"\n{'='*60}\nPROVEEDOR: {config['nombre']}\n{'='*60}")

            prov_obj, _ = Proveedor.objects.get_or_create(
                nombre=config['nombre'],
                defaults={'url_base': config['url_base'], 'activo': True})

            if config['modo'] == 'categorias':
                stats = scrape_por_categorias(config, driver, prov_obj)
            else:
                stats = scrape_por_paginacion(config, driver, prov_obj)

            for k in total: total[k] += stats[k]
            log.info(f"Resumen {config['nombre']}: {stats}")
    finally:
        driver.quit()

    log.info(f"\n{'='*60}")
    log.info(f"🎉 IMPORTACIÓN COMPLETADA")
    log.info(f"  Proveedores: {Proveedor.objects.count()}")
    log.info(f"  Categorías:  {Categoria.objects.count()}")
    log.info(f"  Productos:   {Producto.objects.count()}")
    log.info(f"  Creados:     {total['creado']}")
    log.info(f"  Asociados:   {total['asociado']}")
    log.info(f"  Errores:     {total['error']}")

if __name__ == '__main__':
    main()
