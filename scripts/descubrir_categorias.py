"""
descubrir_categorias.py
Detecta automáticamente todas las categorías de cualquier tienda Yupoo.
Ejecuta y pega la salida en el chat.
"""

import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = "https://194939.x.yupoo.com"

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
    return webdriver.Chrome(service=svc, options=op)

def descubrir():
    driver = crear_driver()
    try:
        print(f"Cargando {BASE_URL}/albums ...")
        driver.get(f"{BASE_URL}/albums")
        time.sleep(5)

        print(f"Título: {driver.title}")
        print(f"URL: {driver.current_url}\n")

        # Buscar todos los enlaces de categorías en el sidebar
        selectores = [
            "a[href*='/categories/']",
            "a[href*='categoryId=']",
            "a[href*='cate=']",
        ]

        categorias = {}
        for css in selectores:
            links = driver.find_elements(By.CSS_SELECTOR, css)
            for l in links:
                href  = l.get_attribute('href') or ''
                texto = l.get_attribute('title') or l.text.strip()

                # Extraer ID
                cat_id = None
                import re
                for pattern in [r'/categories/(\d+)', r'categoryId=(\d+)', r'cate=(\d+)']:
                    m = re.search(pattern, href)
                    if m:
                        cat_id = m.group(1)
                        break

                if cat_id and cat_id not in categorias:
                    categorias[cat_id] = texto or f"Categoria_{cat_id}"

        print(f"{'='*60}")
        print(f"CATEGORÍAS ENCONTRADAS: {len(categorias)}")
        print(f"{'='*60}")
        print("\n# Copia esto en el scraper como lista CATEGORIAS:\nCATEGORIAS = [")
        for cat_id, nombre in categorias.items():
            print(f"    ('{cat_id}', '{nombre}'),")
        print("]")

        print(f"\n{'='*60}")
        print("DETALLE:")
        for cat_id, nombre in categorias.items():
            url_cat = f"{BASE_URL}/categories/{cat_id}"
            print(f"  ID={cat_id} | nombre='{nombre}' | url={url_cat}")

        # Paginación de la primera categoría para verificar
        if categorias:
            primera_id = list(categorias.keys())[0]
            print(f"\n{'='*60}")
            print(f"VERIFICANDO PRIMERA CATEGORÍA (ID={primera_id})...")
            driver.get(f"{BASE_URL}/categories/{primera_id}")
            time.sleep(4)
            body = driver.find_element(By.TAG_NAME, 'body').text
            import re
            m = re.search(r'en total\s+(\d+)\s+p[áa]ginas|共\s*(\d+)\s*页', body, re.I)
            if m:
                pags = m.group(1) or m.group(2)
                print(f"  Páginas detectadas: {pags}")
            links_album = driver.find_elements(By.CSS_SELECTOR, f"a[href*='/albums/'][href*='referrercate={primera_id}']")
            print(f"  Álbumes en página 1: {len(links_album)}")

        time.sleep(5)
    finally:
        driver.quit()

if __name__ == '__main__':
    descubrir()