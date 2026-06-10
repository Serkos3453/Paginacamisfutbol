"""
scraper_194939.py — Scraper para https://194939.x.yupoo.com
=============================================================
Esta tienda tiene 17.872 álbumes en 149 páginas bajo /categories.
Se recorren todas las páginas y se guardan bajo las categorías
del sidebar (si las detecta) o bajo una categoría genérica.
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

BASE_URL = "https://194939.x.yupoo.com"

# ─── REANUDACIÓN ─────────────────────────────────────────────────────────────
# Si el scraper se interrumpe, pon aquí el número de página donde quedó.
# Pon 1 para empezar desde el principio.
EMPEZAR_EN_PAGINA = 1

# Nombre de la categoría genérica en tu BD donde se guardarán estas camisetas
# Puedes cambiarlo al nombre que quieras mostrar en tu web
NOMBRE_CATEGORIA_DEFECTO = "194939 - Todas las categorías"

TALLAS_ADULTO = ['S', 'M', 'L', 'XL', 'XXL']
IMG_DIR = os.path.join(settings.MEDIA_ROOT, 'camisetas')
os.makedirs(IMG_DIR, exist_ok=True)

# Mapa de IDs de categoría Yupoo → nombre legible (detectado en el sidebar)
# Se rellena automáticamente al arrancar; puedes pre-rellenarlo manualmente:
NOMBRES_CATEGORIAS = {
    '820451':  'seller,WHATSAPP',
    '5164338': 'FIFA World Cup',
    '820604':  'Brasileiro Serie A',
    '2902793': 'Retro',
    '820495':  'player version Jersey',
    '852260':  'national team Jersey',
    '4887808': 'Categoria_4887808',
    '820475':  'Categoria_820475',
    '820485':  'Categoria_820485',
    '820483':  'Categoria_820483',
    '820865':  'Categoria_820865',
    '820863':  'Categoria_820863',
    '820862':  'Categoria_820862',
    '820861':  'Categoria_820861',
    '820868':  'Categoria_820868',
    '820864':  'Categoria_820864',
    '823646':  'Categoria_823646',
}


# ─── Reconexión automática ────────────────────────────────────────────────────

def esperar_conexion(max_intentos=30, segundos=15):
    for intento in range(1, max_intentos + 1):
        try:
            socket.setdefaulttimeout(5)
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.connect(("8.8.8.8", 53))
            s.close()
            print("    🌐 Conexión restaurada")
            return
        except OSError:
            print(f"    ⏳ Sin conexión... {segundos}s (intento {intento}/{max_intentos})")
            time.sleep(segundos)
    raise Exception("❌ No se pudo restaurar la conexión")


def get_con_reintento(driver, url, max_intentos=10):
    for intento in range(1, max_intentos + 1):
        try:
            driver.get(url)
            return
        except Exception as e:
            msg = str(e)
            if any(err in msg for err in [
                'ERR_INTERNET_DISCONNECTED', 'ERR_NAME_NOT_RESOLVED',
                'ERR_CONNECTION_TIMED_OUT', 'ERR_NETWORK_CHANGED',
            ]):
                print(f"\n    ⚠️ Desconexión (intento {intento}/{max_intentos})")
                esperar_conexion()
                esperar(3, 6)
            else:
                raise
    raise Exception(f"No se pudo cargar {url}")


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


# ─── Detectar total de páginas ────────────────────────────────────────────────

def get_total_paginas(driver):
    body_text = ''
    try:
        body_text = driver.find_element(By.TAG_NAME, 'body').text
    except: pass

    # "1 / 149"  ←  formato que aparece en la imagen
    m = re.search(r'\d+\s*/\s*(\d+)', body_text)
    if m:
        return int(m.group(1))

    # "en total N páginas"
    m = re.search(r'en total\s+(\d+)\s+p[áa]ginas', body_text, re.I)
    if m:
        return int(m.group(1))

    # 共N页
    m = re.search(r'共\s*(\d+)\s*页', body_text)
    if m:
        return int(m.group(1))

    # Botones de paginación
    try:
        items = driver.find_elements(By.CSS_SELECTOR,
            "[class*='pagination'] a, .pagination li a")
        nums = [int(el.text.strip()) for el in items if el.text.strip().isdigit()]
        if nums:
            return max(nums)
    except: pass

    # href ?page=N
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


# ─── Detectar nombres de categorías del sidebar ───────────────────────────────

def detectar_nombres_sidebar(driver):
    """
    Intenta leer los nombres de las categorías del sidebar
    y los guarda en NOMBRES_CATEGORIAS.
    """
    global NOMBRES_CATEGORIAS
    try:
        links = driver.find_elements(By.CSS_SELECTOR, "a[href*='/categories/']")
        for l in links:
            href  = l.get_attribute('href') or ''
            m     = re.search(r'/categories/(\d+)', href)
            if not m:
                continue
            cat_id = m.group(1)
            # Intentar obtener el nombre desde varios atributos
            nombre = (
                l.get_attribute('title') or
                l.text.strip() or
                l.find_element(By.CSS_SELECTOR, 'span').text.strip()
                if len(l.find_elements(By.CSS_SELECTOR, 'span')) > 0 else ''
            )
            if nombre and cat_id not in NOMBRES_CATEGORIAS:
                NOMBRES_CATEGORIAS[cat_id] = nombre
                print(f"    📌 Categoría detectada: {cat_id} → {nombre}")
    except Exception as e:
        print(f"    ⚠️ No se pudieron leer nombres del sidebar: {e}")


# ─── Detectar categoría de un álbum por su referrercate ──────────────────────

def get_categoria_de_href(href, cat_cache):
    """
    Extrae el referrercate del href del álbum y devuelve
    el objeto Categoria de Django correspondiente.
    Si no hay referrercate, devuelve la categoría por defecto.
    """
    m = re.search(r'referrercate=(\d+)', href)
    if m:
        cat_id = m.group(1)
        if cat_id in cat_cache:
            return cat_cache[cat_id]
        # Crear/obtener la categoría en BD
        nombre = NOMBRES_CATEGORIAS.get(cat_id, f'Categoria_{cat_id}')
        slug   = slugify(f"194939-{nombre}-{cat_id}")
        cat_obj, _ = Categoria.objects.get_or_create(
            slug=slug, defaults={'nombre': nombre}
        )
        cat_cache[cat_id] = cat_obj
        return cat_obj
    # Sin referrercate → categoría por defecto
    return cat_cache.get('__defecto__')


# ─── Extracción de álbumes de UNA página ─────────────────────────────────────

def extraer_albumes_pagina(driver):
    """
    Extrae todos los álbumes visibles en la página actual de /categories.
    No filtra por referrercate — toma todo lo que aparece.
    """
    albumes = []

    # Esperar a que carguen álbumes
    try:
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "a[href*='/albums/']"))
        )
    except TimeoutException:
        print("      ⚠️ Timeout — página sin álbumes")
        return albumes

    scroll_completo(driver)

    # Todos los enlaces de álbumes de la página
    try:
        todas = driver.find_elements(By.CSS_SELECTOR, "a[href*='/albums/']")
    except:
        return albumes

    vistos_href = set()

    for tarjeta in todas:
        try:
            href = tarjeta.get_attribute('href') or ''
        except StaleElementReferenceException:
            continue

        if not href or '/albums/' not in href:
            continue

        # Excluir enlaces de descarga y otros que no sean álbumes
        if any(x in href for x in ['/download', '/copy', '/share']):
            continue

        href_base = href.split('?')[0]
        if href_base in vistos_href:
            continue
        vistos_href.add(href_base)

        # album_id
        try:
            album_id = href_base.split('/albums/')[1].strip('/')
        except:
            continue
        if not album_id.isdigit():
            continue

        # Nombre
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
                if v and v.strip():
                    nombre = v.strip()
                    break
            except: continue
        nombre = nombre or f"Camiseta {album_id}"

        # Imagen
        img_url = ''
        for sel in ['img[src*="yupoo"]', 'img[data-src*="yupoo"]', 'img']:
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


# ─── Main ─────────────────────────────────────────────────────────────────────

def importar_todo():
    print("🚀 Scraper 194939.x.yupoo.com")
    print(f"   Base      : {BASE_URL}")
    print(f"   Imágenes  : {IMG_DIR}")
    print(f"   Inicio    : página {EMPEZAR_EN_PAGINA}")
    print()

    driver    = crear_driver()
    ids_en_bd = set(Camiseta.objects.values_list('yupoo_album_id', flat=True))
    print(f"📦 {len(ids_en_bd)} camisetas ya en BD\n")

    # Categoría por defecto para álbumes sin referrercate
    slug_def = slugify(NOMBRE_CATEGORIA_DEFECTO)
    cat_defecto, _ = Categoria.objects.get_or_create(
        slug=slug_def, defaults={'nombre': NOMBRE_CATEGORIA_DEFECTO}
    )

    # Cache de categorías: cat_id → objeto Categoria Django
    cat_cache = {'__defecto__': cat_defecto}

    total_creadas = total_actualizadas = 0

    try:
        # Sesión inicial + detectar sidebar
        print("🍪 Sesión inicial...")
        get_con_reintento(driver, f"{BASE_URL}/categories")
        esperar(4, 6)

        detectar_nombres_sidebar(driver)

        # Detectar total de páginas
        total_paginas = get_total_paginas(driver)
        print(f"\n📑 Total páginas: {total_paginas}")
        print(f"   Empezando en : página {EMPEZAR_EN_PAGINA}")
        print(f"   Álbumes est. : ~{total_paginas * 120:,}\n")

        paginas_vistos = set()  # album_ids vistos en esta sesión

        for pagina in range(EMPEZAR_EN_PAGINA, total_paginas + 1):

            url = f"{BASE_URL}/categories" if pagina == 1 \
                  else f"{BASE_URL}/categories?page={pagina}"

            print(f"\n{'─'*50}")
            print(f"🌐 Página {pagina}/{total_paginas}  →  {url}")

            get_con_reintento(driver, url)
            esperar(2, 3.5)

            albumes = extraer_albumes_pagina(driver)
            print(f"   🔢 {len(albumes)} álbumes extraídos")

            if not albumes:
                print("   ⚠️ Página vacía — continuando")
                continue

            creadas = actualizadas = 0

            for album in albumes:
                if album['album_id'] in paginas_vistos:
                    continue
                paginas_vistos.add(album['album_id'])

                slug_img = slugify(f"194939-{album['album_id']}-{album['nombre']}")
                local    = descargar_imagen(album['img_url'], slug_img)

                # Determinar categoría según referrercate del href
                categoria = get_categoria_de_href(album['href'], cat_cache)

                if album['album_id'] in ids_en_bd:
                    # Ya existe → actualizar imagen y nombre, NO la categoría
                    try:
                        obj = Camiseta.objects.get(yupoo_album_id=album['album_id'])
                        obj.nombre       = album['nombre']
                        obj.imagen_url   = album['img_url']
                        obj.imagen_local = local
                        obj.activa       = True
                        obj.save()
                        actualizadas += 1
                    except Camiseta.DoesNotExist:
                        pass
                else:
                    Camiseta.objects.create(
                        yupoo_album_id     = album['album_id'],
                        nombre             = album['nombre'],
                        categoria          = categoria,
                        imagen_url         = album['img_url'],
                        imagen_local       = local,
                        tallas_disponibles = TALLAS_ADULTO,
                        activa             = True,
                    )
                    ids_en_bd.add(album['album_id'])
                    creadas += 1

            total_creadas      += creadas
            total_actualizadas += actualizadas
            print(f"   ✅ {creadas} creadas | 🔄 {actualizadas} actualizadas | "
                  f"Total BD: {Camiseta.objects.count()}")

            # Cada 10 páginas mostrar progreso global
            if pagina % 10 == 0:
                print(f"\n   📊 PROGRESO: {pagina}/{total_paginas} páginas | "
                      f"{total_creadas} creadas | {total_actualizadas} actualizadas")

    finally:
        driver.quit()

    print(f"\n{'═'*60}")
    print(f"🎉 IMPORTACIÓN COMPLETADA")
    print(f"   Páginas procesadas : {total_paginas - EMPEZAR_EN_PAGINA + 1}")
    print(f"   Categorías en BD   : {Categoria.objects.count()}")
    print(f"   Camisetas en BD    : {Camiseta.objects.count()}")
    print(f"   Creadas            : {total_creadas}")
    print(f"   Actualizadas       : {total_actualizadas}")
    print(f"{'═'*60}")


if __name__ == '__main__':
    importar_todo()
