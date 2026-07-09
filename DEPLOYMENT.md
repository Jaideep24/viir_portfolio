# Viir Portfolio: Production Deployment Guide

This repository has been engineered to meet FAANG-level observability, security, and performance standards. This document outlines the procedures for deploying the Django backend and static assets to a production environment.

## Architecture Overview

`mermaid
graph TD
    Client[Client / Browser] --> Cloudflare[Cloudflare DNS / CDN]
    Cloudflare --> Proxy[Nginx / PythonAnywhere Router]
    Proxy --> Static[Static Assets: WhiteNoise/CDN]
    Proxy --> Gunicorn[WSGI: Gunicorn/uWSGI]
    Gunicorn --> Django[Django Application]
    Django --> SQLite[(SQLite / PostgreSQL)]
`

## Security Prerequisites

Before deploying, ensure you have generated a new, cryptographically secure SECRET_KEY.

1. Generate a production key:
   \\ash
   python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
   \2. Create your production .env file based on .env.example.

## 1. PythonAnywhere Deployment (Recommended)

This portfolio is heavily optimized for PythonAnywhere (PaaS) utilizing the native WSGI configuration and SQLite.

### Steps
1. **Clone the Repository**: Open a Bash console in PythonAnywhere and clone your repository.
   \\ash
   git clone <your-repo-url> ~/viir_portfolio
   \2. **Setup Virtual Environment**:
   \\ash
   mkvirtualenv --python=/usr/bin/python3.10 viir_venv
   pip install -r ~/viir_portfolio/requirements.txt
   \3. **Configure Environment Variables**:
   \\ash
   nano ~/viir_portfolio/.env
   # Set DEBUG=False
   # Set ALLOWED_HOSTS=viir.pythonanywhere.com,viir.tech
   # Set SECRET_KEY
   \4. **Collect Static Assets**:
   \\ash
   cd ~/viir_portfolio
   python manage.py collectstatic --noinput
   \5. **Configure WSGI (/var/www/viir_pythonanywhere_com_wsgi.py)**:
   \\python
   import os
   import sys
   
   path = '/home/viir/viir_portfolio'
   if path not in sys.path:
       sys.path.append(path)
   
   os.environ['DJANGO_SETTINGS_MODULE'] = 'viir_portfolio.settings'
   
   from django.core.wsgi import get_wsgi_application
   application = get_wsgi_application()
   \
## Post-Deployment Validation

After the server goes live, run the following verifications:

1. **Security Headers Check**: Ensure Strict-Transport-Security, Content-Security-Policy, and X-Frame-Options are present.
2. **SEO Check**: Navigate to /sitemap.xml and /robots.txt to verify dynamic routing.
3. **Database Migration**: Ensure manage.py migrate executes flawlessly.
4. **Static Compression**: Verify that CSS/JS files are being served via WhiteNoise with GZIP/Brotli compression enabled.

## CI/CD Pipeline

The repository integrates a GitHub Actions pipeline (.github/workflows/ci.yml) that automatically runs on all pushes and Pull Requests to the main branch. 

* **Linting**: Enforced via lake8 and lack.
* **Testing**: Enforced via pytest.

Ensure your CI passes before initiating any production deployments.
