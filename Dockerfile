# Base image with Python 3.12
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files (prebuilt frontend assets are already in tienda/static/spa/)
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Start command
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "paginacamisetas.wsgi:application"]
