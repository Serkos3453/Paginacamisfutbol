"""
Management command: subir_imagenes_supabase
=============================================
Sube todas las imágenes locales de media/productos/ a Supabase Storage
usando la API S3-compatible de Supabase.

Uso:
    python manage.py subir_imagenes_supabase

Requisitos:
    - Variables de entorno: SUPABASE_STORAGE_ACCESS_KEY, SUPABASE_STORAGE_SECRET_KEY
    - Bucket 'camisetas' creado en Supabase Storage (público)
    - boto3 instalado
"""

import os
import time
import mimetypes
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

from django.conf import settings
from django.core.management.base import BaseCommand

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError


class Command(BaseCommand):
    help = 'Sube las imágenes locales de productos a Supabase Storage (S3-compatible)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Solo muestra qué se subiría sin subir nada',
        )
        parser.add_argument(
            '--workers',
            type=int,
            default=8,
            help='Número de hilos paralelos (default: 8)',
        )
        parser.add_argument(
            '--skip-existing',
            action='store_true',
            default=True,
            help='Saltar archivos que ya existen en el bucket (default: True)',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Re-subir todos los archivos aunque ya existan',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        workers = options['workers']
        skip_existing = not options['force']

        # Validar configuración
        access_key = os.environ.get('SUPABASE_STORAGE_ACCESS_KEY') or getattr(settings, 'SUPABASE_STORAGE_ACCESS_KEY', None)
        secret_key = os.environ.get('SUPABASE_STORAGE_SECRET_KEY') or getattr(settings, 'SUPABASE_STORAGE_SECRET_KEY', None)
        bucket_name = getattr(settings, 'SUPABASE_STORAGE_BUCKET', 'camisetas')
        endpoint_url = getattr(settings, 'SUPABASE_S3_ENDPOINT', None)
        region = getattr(settings, 'SUPABASE_STORAGE_REGION', 'eu-central-1')

        if not access_key or not secret_key:
            self.stderr.write(self.style.ERROR(
                '❌ Falta SUPABASE_STORAGE_ACCESS_KEY o SUPABASE_STORAGE_SECRET_KEY.\n'
                '   Configúralas en .env o como variables de entorno.\n'
                '   Puedes generarlas en: Supabase Dashboard → Settings → Storage → S3 Connection'
            ))
            return

        if not endpoint_url:
            project_ref = getattr(settings, 'SUPABASE_PROJECT_REF', 'qkqjrvzwzjtqaakxieqc')
            endpoint_url = f'https://{project_ref}.supabase.co/storage/v1/s3'

        self.stdout.write(self.style.HTTP_INFO(
            f'\n🚀 Subir imágenes a Supabase Storage\n'
            f'   Endpoint: {endpoint_url}\n'
            f'   Bucket:   {bucket_name}\n'
            f'   Workers:  {workers}\n'
        ))

        # Conectar con boto3
        s3 = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
            config=Config(
                signature_version='s3v4',
                retries={'max_attempts': 3, 'mode': 'adaptive'},
            ),
        )

        # Listar archivos existentes si skip_existing
        existing_keys = set()
        if skip_existing and not dry_run:
            self.stdout.write('📋 Comprobando archivos existentes en el bucket...')
            try:
                paginator = s3.get_paginator('list_objects_v2')
                for page in paginator.paginate(Bucket=bucket_name, Prefix='productos/'):
                    for obj in page.get('Contents', []):
                        existing_keys.add(obj['Key'])
                self.stdout.write(f'   → {len(existing_keys)} archivos ya en el bucket')
            except ClientError as e:
                if 'NoSuchBucket' in str(e):
                    self.stderr.write(self.style.WARNING(
                        f'⚠️  El bucket "{bucket_name}" no existe. Créalo en Supabase Dashboard → Storage → New Bucket'
                    ))
                    return
                self.stdout.write(self.style.WARNING(f'   ⚠️ No se pudo listar: {e}'))

        # Recopilar archivos locales
        media_root = Path(settings.MEDIA_ROOT)
        productos_dir = media_root / 'productos'

        if not productos_dir.exists():
            self.stderr.write(self.style.ERROR(f'❌ No existe el directorio: {productos_dir}'))
            return

        local_files = list(productos_dir.iterdir())
        local_files = [f for f in local_files if f.is_file()]
        total = len(local_files)

        # Filtrar los que ya existen
        to_upload = []
        for f in local_files:
            key = f'productos/{f.name}'
            if skip_existing and key in existing_keys:
                continue
            to_upload.append(f)

        skipped = total - len(to_upload)
        self.stdout.write(
            f'\n📁 Archivos locales: {total}\n'
            f'   Ya subidos:       {skipped}\n'
            f'   Por subir:        {len(to_upload)}\n'
        )

        if dry_run:
            self.stdout.write(self.style.WARNING('\n🔍 DRY RUN — no se sube nada'))
            for f in to_upload[:20]:
                self.stdout.write(f'   → productos/{f.name}')
            if len(to_upload) > 20:
                self.stdout.write(f'   ... y {len(to_upload) - 20} más')
            return

        if not to_upload:
            self.stdout.write(self.style.SUCCESS('\n✅ ¡Todas las imágenes ya están subidas!'))
            return

        # Función de subida para un archivo
        uploaded = 0
        failed = 0
        start_time = time.time()

        def upload_one(filepath):
            key = f'productos/{filepath.name}'
            content_type = mimetypes.guess_type(filepath.name)[0] or 'image/jpeg'
            try:
                s3.upload_file(
                    str(filepath),
                    bucket_name,
                    key,
                    ExtraArgs={
                        'ContentType': content_type,
                        'CacheControl': 'max-age=86400',
                    },
                )
                return (True, key, None)
            except Exception as e:
                return (False, key, str(e))

        # Subir en paralelo
        self.stdout.write(f'\n⬆️  Subiendo {len(to_upload)} imágenes con {workers} hilos...\n')

        with ThreadPoolExecutor(max_workers=workers) as executor:
            futures = {executor.submit(upload_one, f): f for f in to_upload}

            for i, future in enumerate(as_completed(futures), 1):
                success, key, error = future.result()
                if success:
                    uploaded += 1
                else:
                    failed += 1
                    self.stderr.write(self.style.ERROR(f'   ✗ {key}: {error}'))

                # Progreso cada 100 archivos
                if i % 100 == 0 or i == len(to_upload):
                    elapsed = time.time() - start_time
                    rate = i / elapsed if elapsed > 0 else 0
                    eta = (len(to_upload) - i) / rate if rate > 0 else 0
                    self.stdout.write(
                        f'   [{i}/{len(to_upload)}] '
                        f'✓ {uploaded} subidos, ✗ {failed} fallidos '
                        f'({rate:.1f} img/s, ETA: {eta:.0f}s)'
                    )

        elapsed = time.time() - start_time
        self.stdout.write(self.style.SUCCESS(
            f'\n🎉 ¡Completado en {elapsed:.1f}s!\n'
            f'   ✓ Subidos:  {uploaded}\n'
            f'   ✗ Fallidos: {failed}\n'
            f'   ⊘ Saltados: {skipped}'
        ))
