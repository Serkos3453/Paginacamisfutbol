"""
diagnostico_yupoo.py
Ejecuta esto y pégame la salida completa.
Abre el navegador, hace clic en la primera categoría y muestra:
- URL resultante
- Todos los selectores posibles de álbumes
- Los primeros hrefs encontrados
- El HTML relevante
"""

import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = "https://1022669895.x.yupoo.com"
CAT_ID   = "5110244"  # Primera categoría de prueba

def crear_driver():
    op = Options()
    op.add_argument('--no-sandbox')
    op.add_argument('--disable-dev-shm-usage')
    op.add_argument('--window-size=1400,900')
    op.add_argument(
        'user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )
    svc = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=svc, options=op)
    return driver

def diagnostico():
    driver = crear_driver()
    try:
        # 1. Ir a la página principal
        print(f"\n{'='*60}")
        print(f"1. Cargando {BASE_URL}/albums ...")
        driver.get(f"{BASE_URL}/albums")
        time.sleep(5)
        print(f"   URL actual: {driver.current_url}")
        print(f"   Título: {driver.title}")

        # 2. Ver todos los enlaces del sidebar
        print(f"\n{'='*60}")
        print("2. ENLACES DEL SIDEBAR:")
        sidebar_links = driver.find_elements(By.CSS_SELECTOR,
            "a[href*='cate'], a[href*='category'], a[href*='categoryId']")
        for i, l in enumerate(sidebar_links[:10]):
            print(f"   [{i}] href={l.get_attribute('href')} | text='{l.text.strip()}'")

        # 3. Hacer clic en la categoría
        print(f"\n{'='*60}")
        print(f"3. Buscando enlace para categoría {CAT_ID}...")
        selectores = [
            f"a[href*='cate={CAT_ID}']",
            f"a[href*='categoryId={CAT_ID}']",
            f"a[href*='/categories/{CAT_ID}']",
        ]
        clicado = False
        for css in selectores:
            try:
                el = driver.find_element(By.CSS_SELECTOR, css)
                print(f"   Encontrado: {css}")
                print(f"   href={el.get_attribute('href')} | text='{el.text.strip()}'")
                driver.execute_script("arguments[0].click();", el)
                time.sleep(5)
                clicado = True
                break
            except:
                print(f"   No encontrado: {css}")

        if not clicado:
            print("   ❌ No se encontró el enlace del sidebar")

        print(f"\n   URL tras clic: {driver.current_url}")
        print(f"   Título: {driver.title}")

        # 4. Scroll y esperar
        print(f"\n{'='*60}")
        print("4. Haciendo scroll y esperando carga...")
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(3)
        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(2)

        # 5. Probar todos los selectores posibles de álbumes
        print(f"\n{'='*60}")
        print("5. PROBANDO SELECTORES DE ÁLBUMES:")
        selectores_albums = [
            "a.album__main",
            ".album__main",
            "a[class*='album']",
            "[class*='album__wrap'] a",
            "[class*='album-item'] a",
            "a[href*='/albums/']",
            ".gallery__item a",
            "[class*='grid'] a[href*='/albums/']",
            "div[class*='album'] > a",
            "li[class*='album'] a",
            ".photo-list a",
            "[class*='photo'] a",
            "a[href*='/albums/']:not([href*='categoryId'])",
        ]
        for css in selectores_albums:
            try:
                els = driver.find_elements(By.CSS_SELECTOR, css)
                if els:
                    href0 = els[0].get_attribute('href') or ''
                    text0 = els[0].get_attribute('title') or els[0].text[:30]
                    print(f"   ✅ '{css}': {len(els)} elementos | ejemplo: {href0[:80]}")
                else:
                    print(f"   ❌ '{css}': 0 elementos")
            except Exception as e:
                print(f"   ⚠️ '{css}': error — {e}")

        # 6. Ver los primeros hrefs que contengan /albums/
        print(f"\n{'='*60}")
        print("6. TODOS LOS HREFS CON /albums/ (primeros 15):")
        all_links = driver.find_elements(By.CSS_SELECTOR, "a[href*='/albums/']")
        for i, l in enumerate(all_links[:15]):
            href = l.get_attribute('href') or ''
            cls  = l.get_attribute('class') or ''
            title = l.get_attribute('title') or l.text[:30]
            print(f"   [{i}] class='{cls}' | href={href[:90]} | title='{title}'")

        # 7. HTML del primer elemento de tipo álbum si existe
        print(f"\n{'='*60}")
        print("7. HTML DEL ÁREA DE ÁLBUMES (primeros 3000 chars del body):")
        # Buscar el contenedor principal
        for css in ["[class*='album']", "[class*='gallery']", "main", "#app", ".content"]:
            try:
                el = driver.find_element(By.CSS_SELECTOR, css)
                html = el.get_attribute('outerHTML')
                print(f"   Contenedor '{css}': {html[:3000]}")
                break
            except:
                continue

        # 8. Paginación
        print(f"\n{'='*60}")
        print("8. PAGINACIÓN DETECTADA:")
        for css in [".pagination", "[class*='pagination']", "[class*='page']"]:
            try:
                els = driver.find_elements(By.CSS_SELECTOR, css)
                if els:
                    print(f"   '{css}': {len(els)} | texto: '{els[0].text[:100]}'")
            except: pass

        print(f"\n{'='*60}")
        print("✅ Diagnóstico completado.")
        print("   Pega TODA esta salida en el chat.")
        print(f"{'='*60}")

        # Mantener el navegador abierto 10 segundos para inspección manual
        print("\n   Navegador abierto 15 segundos para inspección manual...")
        time.sleep(15)

    finally:
        driver.quit()

if __name__ == '__main__':
    diagnostico()