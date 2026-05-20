"""
scraper_selenium.py — v10 + reanudación + reconexión automática
"""

import os, sys, time, random, requests, re, django, socket

if __name__ == '__main__':
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'paginacamisetas.settings')
    django.setup()

from django.utils.text import slugify
from django.conf import settings
from tienda.models import Categoria, Camiseta

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = "https://1022669895.x.yupoo.com"

# ─── REANUDACIÓN ──────────────────────────────────────────────────────────────
# Pon el cat_id desde donde quieres continuar.
# Cuando quieras empezar desde el principio pon: REANUDAR_DESDE = None
REANUDAR_DESDE = '3922962'   # Chile League

CATEGORIAS = [
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
]

TALLAS_ADULTO = ['S', 'M', 'L', 'XL', 'XXL']
TALLAS_KIDS   = ['S-M', 'M-L', 'L-XL']
IMG_DIR = os.path.join(settings.MEDIA_ROOT, 'camisetas')
os.makedirs(IMG_DIR, exist_ok=True)


# ─── Reconexión automática ────────────────────────────────────────────────────

def esperar_conexion(max_intentos=30, segundos=15):
    """Bloquea hasta que haya internet de nuevo."""
    for intento in range(1, max_intentos + 1):
        try:
            socket.setdefaulttimeout(5)
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.connect(("8.8.8.8", 53))
            s.close()
            print("    🌐 Conexión restaurada — continuando")
            return
        except OSError:
            print(f"    ⏳ Sin conexión... esperando {segundos}s (intento {intento}/{max_intentos})")
            time.sleep(segundos)
    raise Exception("❌ No se pudo restaurar la conexión tras varios intentos")


def get_con_reintento(driver, url, max_intentos=10):
    """driver.get() con reintentos automáticos si se cae la conexión."""
    for intento in range(1, max_intentos + 1):
        try:
            driver.get(url)
            return
        except Exception as e:
            msg = str(e)
            if any(err in msg for err in [
                'ERR_INTERNET_DISCONNECTED',
                'ERR_NAME_NOT_RESOLVED',
                'ERR_CONNECTION_TIMED_OUT',
                'ERR_NETWORK_CHANGED',
            ]):
                print(f"\n    ⚠️  Desconexión detectada (intento {intento}/{max_intentos})")
                esperar_conexion()
                esperar(3, 6)
            else:
                raise
    raise Exception(f"No se pudo cargar {url} tras {max_intentos} intentos")


# ─── Utilidades ───────────────────────────────────────────────────────────────

def esperar(a=1.0, b=2.5):
    time.sleep(random.uniform(a, b))


def crear_driver():
    op = Options()
    op.add_argument('--no-sandbox')
    op.add_argument('--disable-dev-shm-usage')
    op.add_argument('--disable-blink-features=AutomationControlled')
    op.add_experimental_option('excludeSwitches', ['enable-automation'])
    op.add_experimental_option('useAutomationExtension', False)
    op.add_argument('--window-size=1400,900')
    op.add_argument(
        'user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )
    svc = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=svc, options=op)
    driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
        'source': "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    })
    return driver


def scroll_completo(driver):
    ultima = 0
    for _ in range(20):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(0.6)
        nueva = driver.execute_script("return document.body.scrollHeight")
        if nueva == ultima:
            break
        ultima = nueva
    driver.execute_script("window.scrollTo(0, 0);")
    time.sleep(0.3)


def descargar_imagen(url, nombre_archivo):
    if not url or not url.startswith('http'):
        return ''
    ext = url.split('.')[-1].split('?')[0][:4]
    if ext not in ['jpg', 'jpeg', 'png', 'webp']:
        ext = 'jpg'
    filename = f"{nombre_archivo[:80]}.{ext}"
    filepath = os.path.join(IMG_DIR, filename)
    if os.path.exists(filepath):
        return f"camisetas/{filename}"
    try:
        r = requests.get(url, headers={
            'User-Agent': 'Mozilla/5.0',
            'Referer': BASE_URL + '/'
        }, timeout=15, stream=True)
        r.raise_for_status()
        with open(filepath, 'wb') as f:
            for chunk in r.iter_content(8192):
                f.write(chunk)
        return f"camisetas/{filename}"
    except Exception as e:
        print(f"      ⚠️ Imagen: {e}")
        return ''


# ─── Detección total de páginas ───────────────────────────────────────────────

def get_total_paginas(driver):
    body_text = ''
    try:
        body_text = driver.find_element(By.TAG_NAME, 'body').text
    except: pass

    m = re.search(r'en total\s+(\d+)\s+p[áa]ginas', body_text, re.I)
    if m:
        return int(m.group(1))

    m = re.search(r'共\s*(\d+)\s*页', body_text)
    if m:
        return int(m.group(1))

    try:
        items = driver.find_elements(By.CSS_SELECTOR,
            "[class*='pagination'] a, .pagination li a")
        nums = []
        for el in items:
            try: nums.append(int(el.text.strip()))
            except: pass
        if nums:
            return max(nums)
    except: pass

    try:
        links = driver.find_elements(By.CSS_SELECTOR, "a[href*='page=']")
        nums = []
        for l in links:
            m2 = re.search(r'page=(\d+)', l.get_attribute('href') or '')
            if m2: nums.append(int(m2.group(1)))
        if nums:
            return max(nums)
    except: pass

    return 1


# ─── Extracción de álbumes de una página ──────────────────────────────────────

def extraer_albumes_categoria(driver, cat_id):
    albumes = []
    selector = f"a[href*='/albums/'][href*='referrercate={cat_id}']"

    try:
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, selector))
        )
    except TimeoutException:
        try:
            WebDriverWait(driver, 8).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "a[href*='/albums/']"))
            )
        except TimeoutException:
            print(f"      ⚠️ Timeout — página sin álbumes")
            return albumes

    scroll_completo(driver)

    try:
        tarjetas = driver.find_elements(By.CSS_SELECTOR, selector)
    except:
        tarjetas = []

    if not tarjetas:
        try:
            todas = driver.find_elements(By.CSS_SELECTOR, "a[href*='/albums/']")
            tarjetas = [t for t in todas
                        if f'referrercate={cat_id}' in (t.get_attribute('href') or '')]
        except:
            tarjetas = []

    print(f"      🔢 {len(tarjetas)} elementos encontrados")

    vistos_href = set()
    for tarjeta in tarjetas:
        try:
            href = tarjeta.get_attribute('href') or ''
        except StaleElementReferenceException:
            continue

        if not href or '/albums/' not in href:
            continue

        href_base = href.split('?')[0]
        if href_base in vistos_href:
            continue
        vistos_href.add(href_base)

        try:
            album_id = href_base.split('/albums/')[1].strip('/')
        except:
            continue
        if not album_id.isdigit():
            continue

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
            try:
                img = tarjeta.find_element(By.CSS_SELECTOR, 'img')
                nombre = img.get_attribute('alt') or ''
            except: pass
        nombre = nombre.strip() or f"Camiseta {album_id}"

        img_url = ''
        for sel in ['img[src*="yupoo"]', 'img[data-src]', 'img']:
            try:
                img = tarjeta.find_element(By.CSS_SELECTOR, sel)
                img_url = (
                    img.get_attribute('src') or
                    img.get_attribute('data-src') or
                    img.get_attribute('data-lazy-src') or ''
                )
                if img_url.startswith('http') and 'yupoo' in img_url:
                    break
                img_url = ''
            except NoSuchElementException:
                continue

        albumes.append({
            'nombre':   nombre,
            'album_id': album_id,
            'img_url':  img_url,
            'href':     href,
        })

    return albumes


# ─── Scraping completo de una categoría ───────────────────────────────────────

def get_albumes_categoria(driver, cat_id):
    albumes      = []
    vistos_local = set()
    total        = 1

    pagina = 1
    while True:
        url = f"{BASE_URL}/categories/{cat_id}" if pagina == 1 \
              else f"{BASE_URL}/categories/{cat_id}?page={pagina}"

        print(f"    🌐 Página {pagina}: {url}")
        get_con_reintento(driver, url)
        esperar(2.5, 4)

        if pagina == 1:
            total = get_total_paginas(driver)
            print(f"    📑 Total páginas detectadas: {total}")

        nuevos_pagina = extraer_albumes_categoria(driver, cat_id)

        nuevos = []
        for a in nuevos_pagina:
            if a['album_id'] not in vistos_local:
                vistos_local.add(a['album_id'])
                nuevos.append(a)

        albumes.extend(nuevos)
        print(f"    ✔ Página {pagina}: {len(nuevos)} nuevos | Total cat: {len(albumes)}")

        if len(nuevos_pagina) == 0 or pagina >= total:
            break

        pagina += 1

    print(f"    ✅ Categoría completa: {len(albumes)} álbumes únicos")
    return albumes


# ─── Guardado en BD ───────────────────────────────────────────────────────────

def guardar_albumes(albumes, categoria, tallas, ids_en_bd):
    creadas = actualizadas = 0

    for album in albumes:
        slug_img = slugify(f"{album['album_id']}-{album['nombre']}")
        local    = descargar_imagen(album['img_url'], slug_img)

        if album['album_id'] in ids_en_bd:
            try:
                obj = Camiseta.objects.get(yupoo_album_id=album['album_id'])
                obj.nombre       = album['nombre']
                obj.imagen_url   = album['img_url']
                obj.imagen_local = local
                obj.activa       = True
                obj.save()
                actualizadas += 1
                print(f"    🔄 Actualizada: {album['nombre']}")
            except Camiseta.DoesNotExist:
                pass
        else:
            Camiseta.objects.create(
                yupoo_album_id     = album['album_id'],
                nombre             = album['nombre'],
                categoria          = categoria,
                imagen_url         = album['img_url'],
                imagen_local       = local,
                tallas_disponibles = tallas,
                activa             = True,
            )
            ids_en_bd.add(album['album_id'])
            creadas += 1
            print(f"    ✅ Creada: {album['nombre']}")

    return creadas, actualizadas


# ─── Main ─────────────────────────────────────────────────────────────────────

def importar_todo():
    print("🚀 Scraper Selenium v10 + reanudación")
    print(f"   Base        : {BASE_URL}")
    print(f"   Imágenes    : {IMG_DIR}")
    print(f"   Categorías  : {len(CATEGORIAS)}")
    if REANUDAR_DESDE:
        print(f"   ▶️  Reanudando desde cat_id: {REANUDAR_DESDE}")
    print()

    driver    = crear_driver()
    ids_en_bd = set(Camiseta.objects.values_list('yupoo_album_id', flat=True))
    print(f"📦 {len(ids_en_bd)} camisetas ya en BD\n")

    total_creadas = total_actualizadas = 0
    saltando      = REANUDAR_DESDE is not None

    try:
        print("🍪 Sesión inicial en Yupoo...")
        get_con_reintento(driver, BASE_URL)
        esperar(4, 6)

        for cat_id, cat_nombre in CATEGORIAS:

            # ── Saltar categorías ya procesadas ──────────────────────────────
            if saltando:
                if cat_id == REANUDAR_DESDE:
                    saltando = False   # a partir de aquí procesamos
                else:
                    print(f"⏭️  Saltando: {cat_nombre}")
                    continue

            slug      = slugify(cat_nombre)
            categoria, _ = Categoria.objects.get_or_create(
                slug=slug, defaults={'nombre': cat_nombre}
            )

            print(f"\n{'═'*60}")
            print(f"📂 {cat_nombre}  [ID: {cat_id}]")
            print(f"   URL: {BASE_URL}/categories/{cat_id}")
            print(f"{'═'*60}")

            albumes = get_albumes_categoria(driver, cat_id)

            nuevos_count = sum(1 for a in albumes if a['album_id'] not in ids_en_bd)
            ya_count     = len(albumes) - nuevos_count
            print(f"\n  📊 {len(albumes)} en categoría | {nuevos_count} nuevos | {ya_count} ya en BD")

            if not albumes:
                print("  ⚠️ Sin álbumes")
                continue

            es_kids = 'kid' in cat_nombre.lower() or 'child' in cat_nombre.lower()
            tallas  = TALLAS_KIDS if es_kids else TALLAS_ADULTO

            print(f"\n  💾 Guardando {len(albumes)} en BD...")
            c, a = guardar_albumes(albumes, categoria, tallas, ids_en_bd)
            total_creadas      += c
            total_actualizadas += a
            print(f"  ✅ {c} creadas | 🔄 {a} actualizadas")

    finally:
        driver.quit()

    print(f"\n{'═'*60}")
    print(f"🎉 IMPORTACIÓN COMPLETADA")
    print(f"   Categorías  : {Categoria.objects.count()}")
    print(f"   Camisetas   : {Camiseta.objects.count()}")
    print(f"   Creadas     : {total_creadas}")
    print(f"   Actualizadas: {total_actualizadas}")
    print(f"{'═'*60}")


if __name__ == '__main__':
    importar_todo()